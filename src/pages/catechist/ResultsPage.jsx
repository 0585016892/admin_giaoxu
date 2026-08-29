import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Table,
  Card,
  Typography,
  Button,
  Tag,
  Avatar,
  Space,
  Input,
  Select,
  Row,
  Col,
  Pagination,
  message,
  Tooltip,
  Form,
  Popconfirm,
  Empty,
  Divider,
  Skeleton,
  Badge,
  Progress,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileTextOutlined,
  TrophyOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  DesktopOutlined,
  FormOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import AppFormModal from "../../components/common/AppFormModal";
import ResultForm from "../../components/forms/ResultForm";
import {
  getResults,
  getResultStatistics,
  getResultsByStudent,
  getStudentStatistics,
  createResult,
  updateResult,
  deleteResult,
} from "../../api/resultApi";

import studentApi from "../../api/studentApi";
import AppDetailModal from "../../components/common/AppDetailModal";
import StatCard from "../../components/common/StatCard";
import PageHeroHeader from "../../components/common/PageHeroHeader";
const { Text } = Typography;
const primaryNavy = "#1B365D";

// =========================================================
// COLORS
// =========================================================

const COLORS = {
  primary: "#4F46E5",
  primaryDark: "#4338CA",
  primaryLight: "#EEF2FF",

  green: "#16A34A",
  greenLight: "#F0FDF4",

  orange: "#D97706",
  orangeLight: "#FFFBEB",

  red: "#DC2626",
  redLight: "#FEF2F2",

  blue: "#2563EB",
  blueLight: "#EFF6FF",

  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  background: "#F8FAFC",
  white: "#FFFFFF",
};

// =========================================================
// HELPERS
// =========================================================

const getStudentName = (record, studentsMap) => {
  const student = studentsMap.get(record?.student_id);

  return (
    record?.student_name ||
    record?.studentName ||
    student?.name ||
    student?.full_name ||
    `Học viên #${record?.student_id || ""}`
  );
};

const getScoreStatus = (score) => {
  const value = Number(score || 0);

  if (value >= 8) {
    return {
      label: "Tốt",
      color: COLORS.green,
      background: COLORS.greenLight,
    };
  }

  if (value >= 5) {
    return {
      label: "Đạt",
      color: COLORS.orange,
      background: COLORS.orangeLight,
    };
  }

  return {
    label: "Chưa đạt",
    color: COLORS.red,
    background: COLORS.redLight,
  };
};

const ScoreDisplay = ({ score, large = false }) => {
  const value =
    score === null || score === undefined || score === "" ? 0 : Number(score);

  const status = getScoreStatus(value);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: large ? 12 : 8,
      }}
    >
      <div
        style={{
          minWidth: large ? 58 : 48,
          height: large ? 42 : 34,
          padding: "0 10px",
          borderRadius: 10,
          background: status.background,
          color: status.color,
          border: `1px solid ${status.color}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: large ? 18 : 14,
          fontWeight: 800,
        }}
      >
        {value.toFixed(1)}
      </div>

      {large && (
        <Tag
          bordered={false}
          style={{
            margin: 0,
            borderRadius: 6,
            color: status.color,
            background: status.background,
            fontWeight: 600,
          }}
        >
          {status.label}
        </Tag>
      )}
    </div>
  );
};

// =========================================================
// MAIN COMPONENT
// =========================================================

const ResultsPage = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // =========================================================
  // DATA
  // =========================================================

  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // =========================================================
  // DETAIL
  // =========================================================

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentResults, setStudentResults] = useState([]);
  const [studentStats, setStudentStats] = useState(null);

  // =========================================================
  // FILTER
  // =========================================================

  const [searchText, setSearchText] = useState("");
  const [classId, setClassId] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // =========================================================
  // FORM
  // =========================================================

  const [modalOpen, setModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);

  const [form] = Form.useForm();

  // =========================================================
  // LOAD RESULTS
  // =========================================================

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getResults();
      const resData = response?.data || response;

      if (resData?.success === false) {
        message.error(resData?.message || "Không thể lấy bảng điểm");
        setResults([]);
        return;
      }

      const data = Array.isArray(resData?.data)
        ? resData.data
        : Array.isArray(resData)
          ? resData
          : [];

      setResults(data);
    } catch (error) {
      console.error("LOAD RESULTS ERROR:", error);

      setResults([]);

      message.error(
        error?.response?.data?.message ||
          "Không thể kết nối đến máy chủ khi tải bảng điểm",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // LOAD STUDENTS
  // =========================================================

  const loadStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);

      const response = await studentApi.getAll();
      const resData = response?.data || response;

      let list = [];

      if (Array.isArray(resData?.data?.data)) {
        list = resData.data.data;
      } else if (Array.isArray(resData?.data)) {
        list = resData.data;
      } else if (Array.isArray(resData)) {
        list = resData;
      }

      setStudents(list);
    } catch (error) {
      console.error("LOAD STUDENTS ERROR:", error);

      setStudents([]);

      message.error("Không thể lấy danh sách học viên");
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  // =========================================================
  // LOAD STATISTICS
  // =========================================================

  const loadStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);

      const response = await getResultStatistics();
      const resData = response?.data || response;

      if (resData?.success === false) {
        setStatistics(null);
        return;
      }

      setStatistics(resData?.data || resData || null);
    } catch (error) {
      console.error("LOAD STATISTICS ERROR:", error);

      setStatistics(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = useCallback(async () => {
    await Promise.all([loadResults(), loadStudents(), loadStatistics()]);
  }, [loadResults, loadStudents, loadStatistics]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  // =========================================================
  // STUDENT MAP
  // =========================================================

  const studentsMap = useMemo(() => {
    const map = new Map();

    students.forEach((student) => {
      map.set(student.id, student);
    });

    return map;
  }, [students]);

  // =========================================================
  // CLASS LIST
  // =========================================================

  const classList = useMemo(() => {
    const map = new Map();

    results.forEach((item) => {
      if (item.class_id !== null && item.class_id !== undefined) {
        const id = item.class_id;

        map.set(id, {
          id,
          name: item.class_name || item.className || `Lớp #${item.class_id}`,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "vi"),
    );
  }, [results]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredResults = useMemo(() => {
    let data = [...results];

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();

      data = data.filter((item) => {
        const student = studentsMap.get(item.student_id);

        const studentName = getStudentName(item, studentsMap).toLowerCase();

        const studentId = String(
          item.student_id || student?.id || "",
        ).toLowerCase();

        const className = (
          item.class_name ||
          item.className ||
          ""
        ).toLowerCase();

        const guardianName = (student?.guardian_name || "").toLowerCase();

        return (
          studentName.includes(keyword) ||
          studentId.includes(keyword) ||
          className.includes(keyword) ||
          guardianName.includes(keyword)
        );
      });
    }

    if (classId !== "all") {
      data = data.filter((item) => String(item.class_id) === String(classId));
    }

    return data;
  }, [results, searchText, classId, studentsMap]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  // =========================================================
  // DETAIL
  // =========================================================

  const fetchStudentDetailsData = useCallback(async (studentId) => {
    if (!studentId) return;

    try {
      setDetailLoading(true);

      const [resultsResponse, statsResponse] = await Promise.allSettled([
        getResultsByStudent(studentId),
        getStudentStatistics(studentId),
      ]);

      if (resultsResponse.status === "fulfilled") {
        const resData = resultsResponse.value?.data || resultsResponse.value;

        const list = Array.isArray(resData?.data)
          ? resData.data
          : Array.isArray(resData)
            ? resData
            : [];

        setStudentResults(list);
      } else {
        console.error("GET STUDENT RESULTS ERROR:", resultsResponse.reason);

        setStudentResults([]);
      }

      if (statsResponse.status === "fulfilled") {
        const resData = statsResponse.value?.data || statsResponse.value;

        setStudentStats(resData?.data || resData || null);
      } else {
        console.error("GET STUDENT STATISTICS ERROR:", statsResponse.reason);

        setStudentStats(null);
      }
    } catch (error) {
      console.error("FETCH STUDENT DETAILS ERROR:", error);

      message.error("Không thể lấy chi tiết điểm của học viên");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // =========================================================
  // VIEW DETAIL
  // =========================================================

  const handleViewDetail = useCallback(
    (record) => {
      const student = studentsMap.get(record.student_id) || {
        id: record.student_id,
        name:
          record.student_name ||
          record.studentName ||
          `Học viên #${record.student_id}`,
      };

      setSelectedStudent(student);
      setDetailModalOpen(true);

      fetchStudentDetailsData(record.student_id);
    },
    [studentsMap, fetchStudentDetailsData],
  );

  // =========================================================
  // CREATE
  // =========================================================

  const handleCreate = () => {
    setEditingResult(null);

    form.resetFields();

    form.setFieldsValue({
      exam_type: "paper",
      exam_date: dayjs(),
      score: undefined,
      note: "",
    });

    setModalOpen(true);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (record) => {
    setEditingResult(record);

    form.setFieldsValue({
      student_id: record.student_id,

      score:
        record.score !== undefined && record.score !== null
          ? Number(record.score)
          : undefined,

      exam_type: record.exam_type || "paper",

      exam_date: record.exam_date ? dayjs(record.exam_date) : null,

      note: record.note || "",
    });

    setModalOpen(true);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const handleCloseForm = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingResult(null);
    form.resetFields();
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setSubmitting(true);

      const payload = {
        student_id: values.student_id,

        score: Number(values.score),

        exam_type: values.exam_type || "paper",

        exam_date: values.exam_date
          ? values.exam_date.format("YYYY-MM-DD")
          : null,

        note: values.note ? values.note.trim() : null,
      };

      let response;

      if (editingResult) {
        response = await updateResult(editingResult.id, payload);
      } else {
        response = await createResult(payload);
      }

      const resData = response?.data || response;

      if (resData?.success === false) {
        message.error(resData?.message || "Không thể lưu kết quả");

        return;
      }

      message.success(
        editingResult ? "Cập nhật điểm thành công" : "Nhập điểm thành công",
      );

      setModalOpen(false);
      setEditingResult(null);

      form.resetFields();

      await Promise.all([loadResults(), loadStatistics()]);

      if (detailModalOpen && selectedStudent?.id) {
        await fetchStudentDetailsData(selectedStudent.id);
      }
    } catch (error) {
      if (error?.errorFields) return;

      console.error("SUBMIT RESULT ERROR:", error);

      message.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi lưu điểm",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      setDeletingId(id);

      const response = await deleteResult(id);
      const resData = response?.data || response;

      if (resData?.success === false) {
        message.error(resData?.message || "Không thể xóa điểm");

        return;
      }

      message.success("Xóa điểm thành công");

      await Promise.all([loadResults(), loadStatistics()]);

      if (detailModalOpen && selectedStudent?.id) {
        await fetchStudentDetailsData(selectedStudent.id);
      }
    } catch (error) {
      console.error("DELETE RESULT ERROR:", error);

      message.error(error?.response?.data?.message || "Không thể xóa điểm");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = [
    {
      title: "#",
      width: 60,
      align: "center",

      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },

    {
      title: "Học viên",
      key: "student",
      width: 290,

      render: (_, record) => {
        const student = studentsMap.get(record.student_id);

        const name = getStudentName(record, studentsMap);

        const guardian = student?.guardian_name;

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Avatar
              size={44}
              style={{
                flexShrink: 0,
                background: "linear-gradient(135deg,#6366F1,#4F46E5)",
                fontWeight: 800,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <Text
                strong
                ellipsis
                style={{
                  display: "block",
                  maxWidth: 210,
                  color: COLORS.text,
                  fontSize: 14,
                }}
              >
                {name}
              </Text>

              <div
                style={{
                  marginTop: 3,
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                  }}
                >
                  #{record.student_id}
                </Text>

                {guardian && (
                  <>
                    <Text
                      type="secondary"
                      style={{
                        margin: "0 5px",
                        fontSize: 10,
                      }}
                    >
                      •
                    </Text>

                    <Text
                      type="secondary"
                      style={{
                        fontSize: 11,
                      }}
                    >
                      {guardian}
                    </Text>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },

    {
      title: "Lớp",
      key: "class",
      width: 170,

      render: (_, record) => (
        <Tag
          icon={<TeamOutlined />}
          bordered={false}
          style={{
            margin: 0,
            padding: "5px 10px",
            borderRadius: 7,
            background: COLORS.primaryLight,
            color: COLORS.primary,
            fontWeight: 600,
          }}
        >
          {record.class_name || record.className || "Chưa xếp lớp"}
        </Tag>
      ),
    },

    {
      title: "Bài kiểm tra",
      dataIndex: "total_results",
      key: "total_results",
      width: 120,
      align: "center",

      render: (value) => (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: COLORS.primaryLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.primary,
            }}
          >
            <BookOutlined />
          </div>

          <Text strong>{Number(value) || 0}</Text>
        </div>
      ),
    },

    {
      title: "Điểm trung bình",
      dataIndex: "average_score",
      key: "average_score",
      width: 190,

      sorter: (a, b) =>
        Number(a.average_score || 0) - Number(b.average_score || 0),

      render: (score) => {
        const value = Number(score || 0);
        const status = getScoreStatus(value);

        return (
          <div
            style={{
              minWidth: 150,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text
                strong
                style={{
                  color: status.color,
                }}
              >
                {value.toFixed(1)}
              </Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                }}
              >
                / 10
              </Text>
            </div>

            <Progress
              percent={Math.min(value * 10, 100)}
              showInfo={false}
              strokeWidth={6}
              strokeColor={status.color}
              trailColor="#E2E8F0"
            />
          </div>
        );
      },
    },

    {
      title: "Kết quả",
      key: "status",
      width: 120,
      align: "center",

      render: (_, record) => {
        const status = getScoreStatus(record.average_score);

        return (
          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 7,
              padding: "5px 10px",
              color: status.color,
              background: status.background,
              fontWeight: 700,
            }}
          >
            {status.label}
          </Tag>
        );
      },
    },

    {
      title: "Gần nhất",
      dataIndex: "latest_exam_date",
      key: "latest_exam_date",
      width: 145,

      render: (date) =>
        date ? (
          <Space size={6}>
            <CalendarOutlined
              style={{
                color: COLORS.textSecondary,
              }}
            />

            <Text
              style={{
                color: COLORS.textSecondary,
                fontSize: 13,
              }}
            >
              {dayjs(date).format("DD/MM/YYYY")}
            </Text>
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },

    {
      title: "",
      key: "action",
      width: 75,
      fixed: "right",
      align: "center",

      render: (_, record) => (
        <Tooltip title="Xem bảng điểm">
          <Button
            type="text"
            shape="circle"
            icon={
              <EyeOutlined
                style={{
                  color: COLORS.primary,
                  fontSize: 18,
                }}
              />
            }
            onClick={() => handleViewDetail(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // =========================================================
  // DETAIL COLUMNS
  // =========================================================

  const detailColumns = [
    {
      title: "#",
      width: 50,
      align: "center",

      render: (_, __, index) => index + 1,
    },

    {
      title: "Ngày kiểm tra",
      dataIndex: "exam_date",
      width: 145,

      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },

    {
      title: "Hình thức",
      dataIndex: "exam_type",
      width: 150,

      render: (type) =>
        type === "online" ? (
          <Tag
            icon={<DesktopOutlined />}
            color="blue"
            style={{
              borderRadius: 7,
              padding: "4px 9px",
            }}
          >
            Online
          </Tag>
        ) : (
          <Tag
            icon={<FormOutlined />}
            color="orange"
            style={{
              borderRadius: 7,
              padding: "4px 9px",
            }}
          >
            Bài giấy
          </Tag>
        ),
    },

    {
      title: "Điểm",
      dataIndex: "score",
      width: 120,

      render: (score) => <ScoreDisplay score={score} />,
    },

    {
      title: "Ghi chú",
      dataIndex: "note",
      ellipsis: true,

      render: (note) =>
        note ? (
          <Text>{note}</Text>
        ) : (
          <Text type="secondary" italic>
            Không có ghi chú
          </Text>
        ),
    },

    {
      title: "",
      width: 100,
      align: "right",

      render: (_, record) => (
        <Space size={2}>
          <Tooltip title="Sửa">
            <Button
              type="text"
              shape="circle"
              icon={
                <EditOutlined
                  style={{
                    color: COLORS.primary,
                  }}
                />
              }
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa điểm này?"
            description="Kết quả sẽ bị xóa khỏi hệ thống."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
              loading: deletingId === record.id,
            }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "28px 32px",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <PageHeroHeader
        icon={<TrophyOutlined />}
        badgeText="🌸 QUẢN LÝ ĐIỂM SỐ"
        title="Bảng điểm học viên"
        description="Theo dõi và quản lý kết quả học tập của học viên"
        // Refresh Props
        onRefresh={handleRefresh}
        refreshLoading={loading || studentsLoading || statsLoading}
        // Primary Button Props
        primaryButtonText="Nhập điểm"
        primaryButtonIcon={<PlusOutlined />}
        onPrimaryClick={handleCreate}
      />
      {/* =====================================================
          KPI
      ====================================================== */}
      <Row
        gutter={[16, 16]}
        style={{
          marginBottom: 24,
        }}
      >
        {/* TỔNG BÀI KIỂM TRA */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng bài kiểm tra"
            value={Number(statistics?.total_results || 0)}
            loading={statsLoading}
            icon={<FileTextOutlined />}
            iconColor={primaryNavy}
            description="Tổng số lượt kiểm tra"
          />
        </Col>

        {/* ĐIỂM TRUNG BÌNH */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Điểm trung bình"
            value={Number(statistics?.average_score || 0).toFixed(2)}
            loading={statsLoading}
            icon={<RiseOutlined />}
            iconColor={COLORS.green}
            description="Mức điểm trung bình"
          />
        </Col>

        {/* ĐIỂM CAO NHẤT */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Điểm cao nhất"
            value={Number(statistics?.highest_score || 0).toFixed(1)}
            loading={statsLoading}
            icon={<TrophyOutlined />}
            iconColor={COLORS.orange}
            description="Thành tích cao nhất"
          />
        </Col>

        {/* KẾT QUẢ */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Kết quả"
            value={
              <>
                <span
                  style={{
                    color: COLORS.green,
                  }}
                >
                  {statistics?.passed ?? 0}
                </span>

                <span
                  style={{
                    margin: "0 5px",
                    color: COLORS.border,
                  }}
                >
                  /
                </span>

                <span
                  style={{
                    color: COLORS.red,
                  }}
                >
                  {statistics?.failed ?? 0}
                </span>
              </>
            }
            loading={statsLoading}
            icon={<CheckCircleOutlined />}
            iconColor={COLORS.green}
            description="Đạt / Chưa đạt"
          />
        </Col>
      </Row>

      {/* =====================================================
          FILTER
      ====================================================== */}

      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          marginBottom: 16,
          boxShadow: "0 2px 10px rgba(15,23,42,.04)",
        }}
        bodyStyle={{
          padding: 16,
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={11} lg={9}>
            <Input
              allowClear
              prefix={
                <SearchOutlined
                  style={{
                    color: "#94A3B8",
                  }}
                />
              }
              placeholder="Tìm tên, mã học viên, lớp hoặc phụ huynh..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                height: 42,
                borderRadius: 10,
              }}
            />
          </Col>

          <Col xs={24} md={7} lg={5}>
            <Select
              value={classId}
              onChange={(value) => {
                setClassId(value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                height: 42,
              }}
              placeholder="Chọn lớp"
              options={[
                {
                  value: "all",
                  label: "Tất cả các lớp",
                },

                ...classList.map((item) => ({
                  value: item.id,
                  label: item.name,
                })),
              ]}
            />
          </Col>

          <Col xs={24} md={6} lg={10}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <TeamOutlined
                style={{
                  color: COLORS.textSecondary,
                }}
              />

              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 13,
                }}
              >
                Tìm thấy{" "}
                <strong
                  style={{
                    color: COLORS.text,
                  }}
                >
                  {filteredResults.length}
                </strong>{" "}
                học viên
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* =====================================================
          MAIN TABLE
      ====================================================== */}

      <Card
        bordered={false}
        style={{
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(15,23,42,.04)",
        }}
        bodyStyle={{
          padding: 0,
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <Text
              strong
              style={{
                fontSize: 16,
                color: COLORS.text,
              }}
            >
              Danh sách kết quả
            </Text>

            <Text
              type="secondary"
              style={{
                display: "block",
                marginTop: 3,
                fontSize: 12,
              }}
            >
              Tổng hợp điểm theo từng học viên
            </Text>
          </div>

          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 7,
              background: COLORS.primaryLight,
              color: COLORS.primary,
              fontWeight: 600,
            }}
          >
            {filteredResults.length} học viên
          </Tag>
        </div>

        {loading ? (
          <div
            style={{
              padding: 32,
            }}
          >
            <Skeleton
              active
              paragraph={{
                rows: 8,
              }}
            />
          </div>
        ) : filteredResults.length === 0 ? (
          <div
            style={{
              padding: 80,
              textAlign: "center",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                searchText || classId !== "all"
                  ? "Không tìm thấy học viên phù hợp"
                  : "Chưa có dữ liệu bảng điểm"
              }
            >
              {(searchText || classId !== "all") && (
                <Button
                  onClick={() => {
                    setSearchText("");
                    setClassId("all");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </Empty>
          </div>
        ) : (
          <>
            <Table
              rowKey={(record) => `${record.student_id}-${record.class_id}`}
              columns={columns}
              dataSource={paginatedResults}
              pagination={false}
              scroll={{
                x: 1200,
              }}
              rowClassName={() => "result-table-row"}
            />

            <Divider
              style={{
                margin: 0,
              }}
            />

            <div
              style={{
                padding: "15px 22px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                Hiển thị <strong>{paginatedResults.length}</strong> /{" "}
                <strong>{filteredResults.length}</strong> học viên
              </Text>

              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredResults.length}
                showSizeChanger
                pageSizeOptions={["10", "20", "50", "100"]}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                size="small"
              />
            </div>
          </>
        )}
      </Card>

      {/* =====================================================
          DETAIL MODAL
      ====================================================== */}
      <AppDetailModal
        open={detailModalOpen}
        loading={detailLoading}
        width={940}
        title={
          selectedStudent?.name || selectedStudent?.full_name || "Học viên"
        }
        subtitle={`Mã học viên: #${selectedStudent?.id || ""}`}
        onCancel={() => setDetailModalOpen(false)}
        showEdit={false}
        showClose={true}
        closeText="Đóng"
      >
        {detailLoading ? (
          <Skeleton
            active
            paragraph={{
              rows: 9,
            }}
          />
        ) : (
          <>
            {/* STATS */}
            <Row
              gutter={[12, 12]}
              style={{
                marginBottom: 22,
              }}
            >
              <Col xs={24} sm={8}>
                <div
                  style={{
                    padding: 18,
                    borderRadius: 14,
                    background: "#F8FAFC",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    TỔNG BÀI
                  </Text>

                  <div
                    style={{
                      marginTop: 7,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <BookOutlined
                      style={{
                        color: COLORS.primary,
                        fontSize: 20,
                      }}
                    />

                    <Text
                      strong
                      style={{
                        fontSize: 25,
                      }}
                    >
                      {studentStats?.total_results ?? studentResults.length}
                    </Text>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={8}>
                <div
                  style={{
                    padding: 18,
                    borderRadius: 14,
                    background: COLORS.greenLight,
                    border: "1px solid #DCFCE7",
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.green,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ĐIỂM TRUNG BÌNH
                  </Text>

                  <div
                    style={{
                      marginTop: 7,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <RiseOutlined
                      style={{
                        color: COLORS.green,
                        fontSize: 20,
                      }}
                    />

                    <Text
                      strong
                      style={{
                        fontSize: 25,
                        color: COLORS.green,
                      }}
                    >
                      {Number(studentStats?.average_score || 0).toFixed(2)}
                    </Text>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={8}>
                <div
                  style={{
                    padding: 18,
                    borderRadius: 14,
                    background: COLORS.orangeLight,
                    border: "1px solid #FEF3C7",
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.orange,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ĐIỂM CAO NHẤT
                  </Text>

                  <div
                    style={{
                      marginTop: 7,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <TrophyOutlined
                      style={{
                        color: COLORS.orange,
                        fontSize: 20,
                      }}
                    />

                    <Text
                      strong
                      style={{
                        fontSize: 25,
                        color: COLORS.orange,
                      }}
                    >
                      {Number(studentStats?.highest_score || 0).toFixed(1)}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>

            {/* TABLE TITLE */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div>
                <Text
                  strong
                  style={{
                    fontSize: 15,
                  }}
                >
                  Lịch sử kiểm tra
                </Text>

                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  Chi tiết các bài kiểm tra của học viên
                </Text>
              </div>

              <Badge
                count={studentResults.length}
                showZero
                style={{
                  background: COLORS.primary,
                }}
              />
            </div>

            {/* TABLE */}
            <Table
              rowKey="id"
              columns={detailColumns}
              dataSource={studentResults}
              pagination={false}
              size="middle"
              scroll={{
                x: 700,
              }}
              locale={{
                emptyText: "Học viên chưa có điểm kiểm tra",
              }}
            />
          </>
        )}
      </AppDetailModal>

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}
      <AppFormModal
        open={modalOpen}
        loading={submitting}
        editing={!!editingResult}
        form={form}
        width={520}
        createTitle="Nhập điểm kiểm tra"
        editTitle="Cập nhật kết quả"
        subtitle={
          editingResult
            ? `Chỉnh sửa kết quả #${editingResult.id}`
            : "Thêm kết quả kiểm tra mới cho học viên"
        }
        icon={<FormOutlined />}
        createText="Thêm điểm"
        editText="Lưu thay đổi"
        onCancel={handleCloseForm}
      >
        <ResultForm
          form={form}
          students={students}
          studentsLoading={studentsLoading}
          editingResult={editingResult}
          submitting={submitting}
          onFinish={handleSubmit}
        />
      </AppFormModal>
      {/* =====================================================
          EXTRA CSS
      ====================================================== */}

      <style>
        {`
          .result-table-row:hover > td {
            background: #F8FAFC !important;
          }

          .ant-table-thead > tr > th {
            background: #F8FAFC !important;
            color: #64748B !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            border-bottom: 1px solid #E2E8F0 !important;
          }

          .ant-table-tbody > tr > td {
            border-bottom: 1px solid #F1F5F9 !important;
          }

          .ant-pagination-item {
            border-radius: 7px !important;
          }

          .ant-select-selector {
            border-radius: 10px !important;
          }

          .ant-input-affix-wrapper {
            border-radius: 10px !important;
          }

          .ant-input-number {
            border-radius: 9px !important;
          }

          .ant-picker {
            border-radius: 9px !important;
          }

          .ant-modal-content {
            border-radius: 18px !important;
            overflow: hidden;
          }

          .ant-modal-header {
            margin-bottom: 16px !important;
          }

          @media (max-width: 768px) {
            .ant-table {
              font-size: 12px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ResultsPage;
