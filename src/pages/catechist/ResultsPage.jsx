import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Pagination,
  Popconfirm,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  DesktopOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  FormOutlined,
  PlusOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import {
  createResult,
  deleteResult,
  getClassStatistics,
  getResultsByClass,
  getResultsByStudent,
  getStudentStatistics,
  updateResult,
} from "../../api/resultApi";

import classApi from "../../api/classApi";
import studentApi from "../../api/studentApi";

import AppDetailModal from "../../components/common/AppDetailModal";
import AppFormModal from "../../components/common/AppFormModal";
import ResultForm from "../../components/forms/ResultForm";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";
import AppSearchInput from "../../components/common/SearchInput";
const { Text, Title } = Typography;

/* ============================================================
   DESIGN SYSTEM
============================================================ */

const COLORS = {
  navy: "#173B5E",
  navyDark: "#102C46",
  navyHover: "#244F78",
  navyLight: "#EEF3F7",

  gold: "#D9A441",
  goldDark: "#B8862F",
  goldLight: "#FBF5E7",

  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#173B5E",
  textDark: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  border: "#E2E8F0",

  success: "#2E7D5B",
  successLight: "#EAF6F0",

  warning: "#B7791F",
  warningLight: "#FFF7E5",

  danger: "#C0392B",
  dangerLight: "#FDEDEC",

  blue: "#356FA3",
  blueLight: "#EDF4FA",

  purple: "#7653A6",
  purpleLight: "#F4EFFA",

  grayLight: "#F1F5F9",
};

/* ============================================================
   HELPERS
============================================================ */

const unwrapResponse = (response) => {
  if (!response) return {};

  if (response?.data?.success !== undefined) {
    return response.data;
  }

  if (response?.success !== undefined) {
    return response;
  }

  if (response?.data) {
    return response.data;
  }

  return response;
};

const getStudentName = (record, studentsMap) => {
  const student = studentsMap.get(Number(record?.student_id));

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
      label: "Giỏi",
      color: COLORS.success,
      background: COLORS.successLight,
      tagColor: "success",
    };
  }

  if (value >= 5) {
    return {
      label: "Đạt",
      color: COLORS.warning,
      background: COLORS.warningLight,
      tagColor: "warning",
    };
  }

  return {
    label: "Chưa đạt",
    color: COLORS.danger,
    background: COLORS.dangerLight,
    tagColor: "error",
  };
};

/* ============================================================
   SCORE DISPLAY
============================================================ */

const ScoreDisplay = ({ score, large = false }) => {
  const value =
    score === null || score === undefined || score === "" ? 0 : Number(score);

  const status = getScoreStatus(value);

  return (
    <Space size={8} align="center">
      <div
        style={{
          minWidth: large ? 64 : 48,
          height: large ? 44 : 34,
          padding: "0 10px",
          borderRadius: 8,

          background: status.background,

          color: status.color,

          border: `1px solid ${status.color}35`,

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

            fontWeight: 700,

            padding: "4px 10px",
          }}
        >
          {status.label}
        </Tag>
      )}
    </Space>
  );
};

/* ============================================================
   MAIN
============================================================ */

const ResultsPage = () => {
  /* ============================================================
     LOADING
  ============================================================ */

  const [loading, setLoading] = useState(false);

  const [studentsLoading, setStudentsLoading] = useState(false);

  const [statsLoading, setStatsLoading] = useState(false);

  const [teacherClassesLoading, setTeacherClassesLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [detailLoading, setDetailLoading] = useState(false);

  /* ============================================================
     DATA
  ============================================================ */

  const [results, setResults] = useState([]);

  const [students, setStudents] = useState([]);

  const [statistics, setStatistics] = useState(null);

  const [teacherClasses, setTeacherClasses] = useState([]);

  /* ============================================================
     FILTER
  ============================================================ */

  const [searchText, setSearchText] = useState("");

  const [scoreFilter, setScoreFilter] = useState("all");

  const [classId, setClassId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  /* ============================================================
     DETAIL MODAL
  ============================================================ */

  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentResults, setStudentResults] = useState([]);

  const [studentStats, setStudentStats] = useState(null);

  /* ============================================================
     FORM MODAL
  ============================================================ */

  const [modalOpen, setModalOpen] = useState(false);

  const [editingResult, setEditingResult] = useState(null);

  const [form] = Form.useForm();

  /* ============================================================
     LOAD TEACHER CLASSES
  ============================================================ */

  const loadTeacherClasses = useCallback(async () => {
    try {
      setTeacherClassesLoading(true);

      const response = await classApi.getClassTeacher();

      const resData = unwrapResponse(response);

      if (resData?.success === false) {
        setTeacherClasses([]);

        message.error(
          resData?.message || "Không thể lấy danh sách lớp quản lý",
        );

        return [];
      }

      const rawList = Array.isArray(resData?.data)
        ? resData.data
        : Array.isArray(resData)
          ? resData
          : [];

      const list = rawList
        .filter((item) => item?.id !== undefined && item?.id !== null)
        .map((item) => ({
          ...item,

          id: Number(item.id),

          name:
            item.name || item.class_name || item.className || `Lớp #${item.id}`,
        }));

      setTeacherClasses(list);

      if (
        classId &&
        !list.some((item) => String(item.id) === String(classId))
      ) {
        setClassId(null);
      }

      if (list.length === 1) {
        setClassId(String(list[0].id));
      }

      return list;
    } catch (error) {
      setTeacherClasses([]);

      message.error(
        error?.response?.data?.message || "Không thể lấy danh sách lớp quản lý",
      );

      return [];
    } finally {
      setTeacherClassesLoading(false);
    }
  }, [classId]);

  /* ============================================================
     LOAD RESULTS
  ============================================================ */

  const loadResults = useCallback(async (selectedClassId) => {
    if (!selectedClassId) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);

      const response = await getResultsByClass(selectedClassId);

      const resData = unwrapResponse(response);

      if (resData?.success === false) {
        setResults([]);

        message.error(resData?.message || "Không thể lấy bảng điểm lớp");

        return;
      }

      const data = Array.isArray(resData?.data)
        ? resData.data
        : Array.isArray(resData)
          ? resData
          : [];

      setResults(data);
    } catch (error) {
      setResults([]);

      message.error(
        error?.response?.data?.message || "Không thể kết nối máy chủ điểm số",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* ============================================================
     LOAD STUDENTS
  ============================================================ */

  const loadStudents = useCallback(async (selectedClassId) => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }

    try {
      setStudentsLoading(true);

      const response = await studentApi.getAll({
        class_id: selectedClassId,
      });

      const resData = unwrapResponse(response);

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
      setStudents([]);

      message.error(
        error?.response?.data?.message || "Không thể lấy danh sách học viên",
      );
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  /* ============================================================
     LOAD CLASS STATISTICS
  ============================================================ */

  const loadStatistics = useCallback(async (selectedClassId) => {
    if (!selectedClassId) {
      setStatistics(null);
      return;
    }

    try {
      setStatsLoading(true);

      const response = await getClassStatistics(selectedClassId);

      const resData = unwrapResponse(response);

      if (resData?.success === false) {
        setStatistics(null);
        return;
      }

      setStatistics(resData?.data || null);
    } catch (error) {
      setStatistics(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /* ============================================================
     LOAD ALL DATA
  ============================================================ */

  const loadData = useCallback(
    async (selectedClassId) => {
      if (!selectedClassId) {
        setResults([]);
        setStudents([]);
        setStatistics(null);

        return;
      }

      await Promise.all([
        loadResults(selectedClassId),
        loadStudents(selectedClassId),
        loadStatistics(selectedClassId),
      ]);
    },
    [loadResults, loadStudents, loadStatistics],
  );

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadTeacherClasses();
  }, [loadTeacherClasses]);

  /* ============================================================
     CLASS CHANGE
  ============================================================ */

  useEffect(() => {
    setCurrentPage(1);

    setSearchText("");

    setScoreFilter("all");

    loadData(classId);
  }, [classId, loadData]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleRefresh = useCallback(async () => {
    const classes = await loadTeacherClasses();

    if (
      classId &&
      classes.some((item) => String(item.id) === String(classId))
    ) {
      await loadData(classId);
    }
  }, [classId, loadTeacherClasses, loadData]);

  /* ============================================================
     STUDENTS MAP
  ============================================================ */

  const studentsMap = useMemo(() => {
    const map = new Map();

    students.forEach((student) => {
      map.set(Number(student.id), student);
    });

    return map;
  }, [students]);

  /* ============================================================
     CLASS LIST
  ============================================================ */

  const classList = useMemo(() => {
    return [...teacherClasses].sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "vi"),
    );
  }, [teacherClasses]);

  /* ============================================================
     SELECTED CLASS
  ============================================================ */

  const selectedClass = useMemo(() => {
    return classList.find((item) => String(item.id) === String(classId));
  }, [classList, classId]);

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredResults = useMemo(() => {
    let data = [...results];

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();

      data = data.filter((item) => {
        const student = studentsMap.get(Number(item.student_id));

        const studentName = getStudentName(item, studentsMap).toLowerCase();

        const studentId = String(
          item.student_id || student?.id || "",
        ).toLowerCase();

        const guardianName = String(student?.guardian_name || "").toLowerCase();

        return (
          studentName.includes(keyword) ||
          studentId.includes(keyword) ||
          guardianName.includes(keyword)
        );
      });
    }

    if (scoreFilter !== "all") {
      data = data.filter((item) => {
        const avg = Number(item.average_score || 0);

        if (scoreFilter === "good") {
          return avg >= 8;
        }

        if (scoreFilter === "pass") {
          return avg >= 5 && avg < 8;
        }

        if (scoreFilter === "fail") {
          return avg < 5;
        }

        return true;
      });
    }

    return data;
  }, [results, searchText, scoreFilter, studentsMap]);

  /* ============================================================
     PAGINATION
  ============================================================ */

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  /* ============================================================
     COMPUTED STATISTICS
  ============================================================ */

  const computedStats = useMemo(() => {
    const apiStats = statistics || {};

    const totalStudents =
      Number(apiStats.total_students) || students.length || results.length || 0;

    const totalResults = Number(apiStats.total_results) || 0;

    const averageScore = Number(apiStats.average_score) || 0;

    const passedStudents = Number(apiStats.passed_students) || 0;

    const failedStudents = Number(apiStats.failed_students) || 0;

    const goodStudents = results.filter(
      (item) => Number(item.average_score || 0) >= 8,
    ).length;

    const passRate =
      totalStudents > 0
        ? Math.round((passedStudents / totalStudents) * 100)
        : 0;

    const goodRate =
      totalStudents > 0 ? Math.round((goodStudents / totalStudents) * 100) : 0;

    return {
      totalStudents,
      totalResults,
      averageScore,
      passedStudents,
      failedStudents,
      goodStudents,
      passRate,
      goodRate,
    };
  }, [statistics, students.length, results]);

  /* ============================================================
     LOAD STUDENT DETAILS
  ============================================================ */

  const fetchStudentDetailsData = useCallback(
    async (studentId) => {
      if (!studentId) return;

      try {
        setDetailLoading(true);

        const [resultsResponse, statsResponse] = await Promise.allSettled([
          getResultsByStudent(studentId),
          getStudentStatistics(studentId),
        ]);

        if (resultsResponse.status === "fulfilled") {
          const resData = unwrapResponse(resultsResponse.value);

          const list = Array.isArray(resData?.data)
            ? resData.data
            : Array.isArray(resData)
              ? resData
              : [];

          const classResults = classId
            ? list.filter((item) => String(item.class_id) === String(classId))
            : list;

          setStudentResults(classResults);
        } else {
          setStudentResults([]);
        }

        if (statsResponse.status === "fulfilled") {
          const resData = unwrapResponse(statsResponse.value);

          setStudentStats(resData?.data || null);
        } else {
          setStudentStats(null);
        }
      } catch (error) {
        setStudentResults([]);

        setStudentStats(null);

        message.error("Không thể lấy chi tiết điểm của học viên");
      } finally {
        setDetailLoading(false);
      }
    },
    [classId],
  );

  /* ============================================================
     VIEW DETAIL
  ============================================================ */

  const handleViewDetail = useCallback(
    (record) => {
      const student = studentsMap.get(Number(record.student_id)) || {
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

  /* ============================================================
     CREATE
  ============================================================ */

  const handleCreate = () => {
    if (!classId) {
      message.warning("Vui lòng chọn lớp trước khi nhập điểm");

      return;
    }

    if (!students.length) {
      message.warning("Lớp này hiện chưa có học viên");

      return;
    }

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

  /* ============================================================
     EDIT
  ============================================================ */

  const handleEdit = (record) => {
    if (
      classId &&
      record.class_id &&
      String(record.class_id) !== String(classId)
    ) {
      message.error("Kết quả không thuộc lớp đang chọn");

      return;
    }

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

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!classId) {
        message.error("Vui lòng chọn lớp");

        return;
      }

      const selectedStudentId = Number(values.student_id);

      const validStudent = students.some(
        (student) => Number(student.id) === selectedStudentId,
      );

      if (!validStudent) {
        message.error("Học viên không thuộc lớp đang chọn");

        return;
      }

      setSubmitting(true);

      const payload = {
        student_id: selectedStudentId,

        class_id: Number(classId),

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

      const resData = unwrapResponse(response);

      if (resData?.success === false) {
        message.error(resData?.message || "Không thể lưu điểm");

        return;
      }

      message.success(
        editingResult ? "Cập nhật điểm thành công" : "Nhập điểm thành công",
      );

      setModalOpen(false);

      setEditingResult(null);

      form.resetFields();

      await loadData(classId);

      if (detailModalOpen && selectedStudent?.id) {
        await fetchStudentDetailsData(selectedStudent.id);
      }
    } catch (error) {
      if (!error?.errorFields) {
        message.error(
          error?.response?.data?.message || "Có lỗi xảy ra khi lưu điểm",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      setDeletingId(id);

      const response = await deleteResult(id);

      const resData = unwrapResponse(response);

      if (resData?.success === false) {
        message.error(resData?.message || "Không thể xóa điểm");

        return;
      }

      message.success("Đã xóa điểm thành công");

      await loadData(classId);

      if (detailModalOpen && selectedStudent?.id) {
        await fetchStudentDetailsData(selectedStudent.id);
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể xóa điểm");
    } finally {
      setDeletingId(null);
    }
  };

  /* ============================================================
     TABLE COLUMNS
  ============================================================ */

  const columns = [
    {
      title: "STT",

      width: 65,

      align: "center",

      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },

    /* ========================================================
       STUDENT
    ======================================================== */

    {
      title: "Học viên",

      key: "student",

      width: 290,

      render: (_, record) => {
        const student = studentsMap.get(Number(record.student_id));

        const name = getStudentName(record, studentsMap);

        const guardian = student?.guardian_name;

        return (
          <Space size={12} align="center">
            <Avatar
              size={42}
              icon={<UserOutlined />}
              style={{
                background: COLORS.navyLight,

                color: COLORS.navy,

                border: `1px solid ${COLORS.border}`,
              }}
            >
              {!student && name ? name.charAt(0).toUpperCase() : null}
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

                  color: COLORS.textDark,

                  fontSize: 14,
                }}
              >
                {name}
              </Text>

              <Space
                size={6}
                style={{
                  marginTop: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,

                    color: COLORS.textMuted,
                  }}
                >
                  ID #{record.student_id}
                </Text>

                {guardian && (
                  <>
                    <Text
                      style={{
                        color: COLORS.textMuted,
                      }}
                    >
                      •
                    </Text>

                    <Text
                      style={{
                        fontSize: 11,

                        color: COLORS.textSecondary,
                      }}
                    >
                      PH: {guardian}
                    </Text>
                  </>
                )}
              </Space>
            </div>
          </Space>
        );
      },
    },

    /* ========================================================
       TOTAL RESULTS
    ======================================================== */

    {
      title: "Bài thi",

      dataIndex: "total_results",

      key: "total_results",

      width: 110,

      align: "center",

      render: (value) => (
        <div
          style={{
            display: "inline-flex",

            alignItems: "center",

            gap: 6,

            padding: "5px 10px",

            borderRadius: 7,

            background: COLORS.navyLight,

            color: COLORS.navy,

            fontSize: 12,

            fontWeight: 700,
          }}
        >
          <BookOutlined />

          {Number(value) || 0}
        </div>
      ),
    },

    /* ========================================================
       AVERAGE SCORE
    ======================================================== */

    {
      title: "Điểm trung bình",

      dataIndex: "average_score",

      key: "average_score",

      width: 220,

      sorter: (a, b) =>
        Number(a.average_score || 0) - Number(b.average_score || 0),

      render: (score) => {
        const value = Number(score || 0);

        const status = getScoreStatus(value);

        return (
          <div
            style={{
              width: "100%",

              paddingRight: 12,
            }}
          >
            <div
              style={{
                display: "flex",

                alignItems: "center",

                justifyContent: "space-between",

                marginBottom: 6,
              }}
            >
              <Space size={7}>
                <Text
                  strong
                  style={{
                    color: status.color,

                    fontSize: 14,
                  }}
                >
                  {value.toFixed(1)}
                </Text>

                <Text
                  style={{
                    color: COLORS.textMuted,

                    fontSize: 11,
                  }}
                >
                  / 10
                </Text>
              </Space>

              <Text
                style={{
                  color: COLORS.textMuted,

                  fontSize: 10,
                }}
              >
                {Math.round(value * 10)}%
              </Text>
            </div>

            <Progress
              percent={Math.min(value * 10, 100)}
              showInfo={false}
              strokeWidth={6}
              strokeColor={status.color}
              trailColor="#EDF1F5"
            />
          </div>
        );
      },
    },

    /* ========================================================
       STATUS
    ======================================================== */

    {
      title: "Xếp loại",

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

              minWidth: 76,

              textAlign: "center",

              borderRadius: 6,

              padding: "4px 10px",

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

    /* ========================================================
       LATEST EXAM
    ======================================================== */

    {
      title: "Thi gần nhất",

      dataIndex: "latest_exam_date",

      key: "latest_exam_date",

      width: 145,

      render: (date) =>
        date ? (
          <Space size={7}>
            <CalendarOutlined
              style={{
                color: COLORS.goldDark,
              }}
            />

            <Text
              style={{
                color: COLORS.textSecondary,

                fontSize: 12,
              }}
            >
              {dayjs(date).format("DD/MM/YYYY")}
            </Text>
          </Space>
        ) : (
          <Text
            style={{
              color: COLORS.textMuted,
            }}
          >
            —
          </Text>
        ),
    },

    /* ========================================================
       ACTION
    ======================================================== */

    {
      title: "Chi tiết",

      key: "action",

      width: 90,

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
                  fontSize: 16,

                  color: COLORS.navy,
                }}
              />
            }
            onClick={() => handleViewDetail(record)}
            style={{
              background: COLORS.navyLight,

              border: `1px solid ${COLORS.border}`,
            }}
          />
        </Tooltip>
      ),
    },
  ];

  /* ============================================================
     DETAIL COLUMNS
  ============================================================ */

  const detailColumns = [
    {
      title: "#",

      width: 50,

      align: "center",

      render: (_, __, index) => index + 1,
    },

    {
      title: "Ngày thi",

      dataIndex: "exam_date",

      width: 130,

      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },

    {
      title: "Hình thức",

      dataIndex: "exam_type",

      width: 130,

      render: (type) =>
        type === "online" ? (
          <Tag
            icon={<DesktopOutlined />}
            bordered={false}
            style={{
              color: COLORS.blue,

              background: COLORS.blueLight,

              borderRadius: 6,

              fontWeight: 600,
            }}
          >
            Online
          </Tag>
        ) : (
          <Tag
            icon={<FormOutlined />}
            bordered={false}
            style={{
              color: COLORS.warning,

              background: COLORS.warningLight,

              borderRadius: 6,

              fontWeight: 600,
            }}
          >
            Bài giấy
          </Tag>
        ),
    },

    {
      title: "Điểm số",

      dataIndex: "score",

      width: 120,

      render: (score) => <ScoreDisplay score={score} />,
    },

    {
      title: "Ghi chú",

      dataIndex: "note",

      render: (note) =>
        note ? (
          <Text
            style={{
              fontSize: 13,

              color: COLORS.textDark,
            }}
          >
            {note}
          </Text>
        ) : (
          <Text
            style={{
              fontSize: 12,

              color: COLORS.textMuted,

              fontStyle: "italic",
            }}
          >
            Không có ghi chú
          </Text>
        ),
    },

    {
      title: "Thao tác",

      width: 100,

      align: "right",

      render: (_, record) => (
        <Space size={2}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={
                <EditOutlined
                  style={{
                    color: COLORS.navy,
                  }}
                />
              }
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa điểm bài thi này?"
            description="Dữ liệu điểm số sẽ bị xóa vĩnh viễn."
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

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="results-page">
      <style>{`

        /* ======================================================
           GLOBAL
        ====================================================== */

        .results-page {
          min-height: 100%;

          padding-bottom: 40px;

          background:
            ${COLORS.background};

          font-family:
            "Be Vietnam Pro",
            "Inter",
            Arial,
            sans-serif;
        }

        .results-page * {
          box-sizing: border-box;
        }


        /* ======================================================
           PAGE HEADER
        ====================================================== */

        .results-header {
          position: relative;

          overflow: hidden;

          min-height: 142px;

          padding: 28px 30px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 24px;

          background:
            ${COLORS.navy};

          border-radius: 16px;

          box-shadow:
            0 8px 24px
            rgba(23, 59, 94, 0.10);
        }

        .results-header::after {
          content: "";

          position: absolute;

          width: 230px;
          height: 230px;

          right: -80px;
          top: -115px;

          border-radius: 50%;

          border:
            1px solid
            rgba(217, 164, 65, 0.28);
        }

        .results-header::before {
          content: "";

          position: absolute;

          width: 120px;
          height: 120px;

          right: 80px;
          bottom: -75px;

          border-radius: 50%;

          background:
            rgba(217, 164, 65, 0.08);
        }

        .results-header-content {
          position: relative;

          z-index: 2;

          display: flex;

          align-items: center;

          gap: 18px;
        }

        .results-header-icon {
          width: 58px;
          height: 58px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 14px;

          background:
            rgba(217, 164, 65, 0.14);

          border:
            1px solid
            rgba(217, 164, 65, 0.38);

          color:
            ${COLORS.gold};

          font-size: 25px;
        }

        .results-header-title {
          margin: 0 !important;

          color:
            ${COLORS.white} !important;

          font-size: 25px !important;

          font-weight: 800 !important;
        }

        .results-header-description {
          display: block;

          margin-top: 5px;

          max-width: 650px;

          color:
            rgba(255,255,255,0.72);

          font-size: 13px;
        }

        .results-header-actions {
          position: relative;

          z-index: 2;

          display: flex;

          gap: 10px;
        }

        .results-refresh-btn {
          height: 42px;

          border-radius: 8px;

          color:
            ${COLORS.white};

          background:
            rgba(255,255,255,0.08);

          border:
            1px solid
            rgba(255,255,255,0.18);
        }

        .results-refresh-btn:hover {
          color:
            ${COLORS.white} !important;

          background:
            rgba(255,255,255,0.14) !important;

          border-color:
            rgba(255,255,255,0.3) !important;
        }

        .results-create-btn {
          height: 42px;

          padding:
            0 18px;

          border-radius: 8px;

          background:
            ${COLORS.gold};

          border-color:
            ${COLORS.gold};

          color:
            ${COLORS.navy};

          font-weight: 800;

          box-shadow:
            none;
        }

        .results-create-btn:hover {
          background:
            ${COLORS.goldDark} !important;

          border-color:
            ${COLORS.goldDark} !important;

          color:
            ${COLORS.white} !important;
        }


        /* ======================================================
           CLASS SELECTOR
        ====================================================== */

        .results-class-card {
          margin-top: 18px;

          border-radius: 14px !important;

          border:
            1px solid
            ${COLORS.border} !important;

          background:
            ${COLORS.white};

          box-shadow:
            0 4px 15px
            rgba(15, 23, 42, 0.03);
        }

        .results-class-inner {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;
        }

        .results-class-info {
          display: flex;

          align-items: center;

          gap: 13px;
        }

        .results-class-icon {
          width: 44px;
          height: 44px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 10px;

          color:
            ${COLORS.navy};

          background:
            ${COLORS.navyLight};

          border:
            1px solid
            ${COLORS.border};

          font-size: 19px;
        }

        .results-class-label {
          display: block;

          color:
            ${COLORS.text};

          font-size: 14px;

          font-weight: 800;
        }

        .results-class-note {
          display: block;

          margin-top: 3px;

          color:
            ${COLORS.textMuted};

          font-size: 11px;
        }

        .results-class-select {
          width: 320px;
        }

        .results-class-select .ant-select-selector {
          border-radius: 8px !important;

          border-color:
            ${COLORS.border} !important;

          min-height: 42px !important;

          display: flex !important;

          align-items: center !important;

          box-shadow: none !important;
        }

        .results-class-select.ant-select-focused
        .ant-select-selector {
          border-color:
            ${COLORS.gold} !important;

          box-shadow:
            0 0 0 2px
            rgba(217,164,65,0.10) !important;
        }


        /* ======================================================
           STATISTICS
        ====================================================== */

        .results-stat-row {
          margin-top: 18px;
        }

        .results-stat-card {
          height: 100%;

          min-height: 105px;

          border-radius: 14px !important;

          border:
            1px solid
            ${COLORS.border} !important;

          background:
            ${COLORS.white};

          box-shadow:
            0 4px 15px
            rgba(15, 23, 42, 0.03);
        }

        .results-stat-content {
          height: 100%;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 12px;
        }

        .results-stat-label {
          display: block;

          margin-bottom: 7px;

          color:
            ${COLORS.textSecondary};

          font-size: 11px;

          font-weight: 600;
        }

        .results-stat-value {
          color:
            ${COLORS.text};

          font-size: 24px;

          font-weight: 800;

          line-height: 1;
        }

        .results-stat-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 10px;

          font-size: 18px;
        }

        .results-stat-navy
        .results-stat-icon {
          color:
            ${COLORS.navy};

          background:
            ${COLORS.navyLight};
        }

        .results-stat-gold
        .results-stat-icon {
          color:
            ${COLORS.goldDark};

          background:
            ${COLORS.goldLight};
        }

        .results-stat-green
        .results-stat-icon {
          color:
            ${COLORS.success};

          background:
            ${COLORS.successLight};
        }

        .results-stat-blue
        .results-stat-icon {
          color:
            ${COLORS.blue};

          background:
            ${COLORS.blueLight};
        }


        /* ======================================================
           MAIN TABLE CARD
        ====================================================== */

        .results-main-card {
          margin-top: 18px;

          border-radius: 14px !important;

          border:
            1px solid
            ${COLORS.border} !important;

          background:
            ${COLORS.white};

          box-shadow:
            0 5px 20px
            rgba(15, 23, 42, 0.03);
        }

        .results-main-card .ant-card-body {
          padding: 22px !important;
        }


        /* ======================================================
           TABLE HEADER
        ====================================================== */

        .results-table-header {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 16px;

          margin-bottom: 18px;
        }

        .results-table-title {
          display: flex;

          align-items: center;

          gap: 10px;
        }

        .results-table-title-icon {
          width: 34px;
          height: 34px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 8px;

          color:
            ${COLORS.navy};

          background:
            ${COLORS.navyLight};

          font-size: 15px;
        }

        .results-table-title-main {
          display: block;

          color:
            ${COLORS.text};

          font-size: 15px;

          font-weight: 800;
        }

        .results-table-title-sub {
          display: block;

          margin-top: 2px;

          color:
            ${COLORS.textMuted};

          font-size: 11px;
        }


        /* ======================================================
           FILTER
        ====================================================== */

        .results-filter-bar {
          padding:
            14px;

          margin-bottom: 18px;

          border-radius: 10px;

          background:
            ${COLORS.background};

          border:
            1px solid
            ${COLORS.border};
        }

        .results-search .ant-input-affix-wrapper {
          min-height: 40px;

          border-radius: 8px;

          border-color:
            ${COLORS.border};

          box-shadow: none;
        }

        .results-search
        .ant-input-affix-wrapper-focused {
          border-color:
            ${COLORS.gold};

          box-shadow:
            0 0 0 2px
            rgba(217,164,65,0.08);
        }

        .results-filter-select
        .ant-select-selector {
          min-height: 40px !important;

          border-radius: 8px !important;

          border-color:
            ${COLORS.border} !important;

          box-shadow: none !important;
        }


        /* ======================================================
           TABLE
        ====================================================== */

        .results-main-table .ant-table {
          border:
            1px solid
            ${COLORS.border};

          border-radius: 10px;

          overflow: hidden;
        }

        .results-main-table
        .ant-table-thead
        > tr
        > th {
          background:
            ${COLORS.navyLight} !important;

          color:
            ${COLORS.navy} !important;

          border-bottom:
            1px solid
            ${COLORS.border} !important;

          font-size: 11px;

          font-weight: 800;

          text-transform:
            uppercase;

          letter-spacing:
            0.2px;
        }

        .results-main-table
        .ant-table-tbody
        > tr
        > td {
          border-bottom:
            1px solid
            ${COLORS.border};

          padding:
            13px 12px;

          font-size: 12px;
        }

        .results-main-table
        .ant-table-tbody
        > tr:hover
        > td {
          background:
            #FBFCFD !important;
        }


        /* ======================================================
           PAGINATION
        ====================================================== */

        .results-pagination {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 16px;

          margin-top: 18px;

          padding-top: 17px;

          border-top:
            1px solid
            ${COLORS.border};
        }

        .results-pagination-info {
          color:
            ${COLORS.textSecondary};

          font-size: 12px;
        }

        .results-pagination-info b {
          color:
            ${COLORS.navy};
        }

        .results-pagination
        .ant-pagination-item-active {
          border-color:
            ${COLORS.navy};

          background:
            ${COLORS.navy};
        }

        .results-pagination
        .ant-pagination-item-active
        a {
          color:
            ${COLORS.white};
        }


        /* ======================================================
           EMPTY
        ====================================================== */

        .results-empty {
          padding:
            45px 20px;
        }


        /* ======================================================
           DETAIL MODAL
        ====================================================== */

        .results-detail-profile {
          padding: 16px;

          margin-bottom: 18px;

          border-radius: 10px;

          background:
            ${COLORS.navyLight};

          border:
            1px solid
            ${COLORS.border};
        }

        .results-detail-avatar {
          background:
            ${COLORS.navy};

          color:
            ${COLORS.white};

          font-weight: 800;
        }

        .results-detail-name {
          margin: 0 !important;

          color:
            ${COLORS.text} !important;

          font-size: 17px !important;

          font-weight: 800 !important;
        }

        .results-detail-meta {
          margin-top: 3px;

          color:
            ${COLORS.textSecondary};

          font-size: 11px;
        }

        .results-detail-average {
          min-width: 90px;

          padding:
            9px 12px;

          text-align: center;

          border-radius: 8px;

          background:
            ${COLORS.white};

          border:
            1px solid
            ${COLORS.border};
        }

        .results-detail-average-label {
          display: block;

          color:
            ${COLORS.textMuted};

          font-size: 9px;

          margin-bottom: 2px;
        }

        .results-detail-average-value {
          color:
            ${COLORS.navy};

          font-size: 19px;

          font-weight: 800;
        }


        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 768px) {

          .results-page {
            padding-bottom: 25px;
          }

          .results-header {
            min-height: auto;

            padding: 20px;

            flex-direction: column;

            align-items:
              flex-start;
          }

          .results-header-content {
            align-items:
              flex-start;
          }

          .results-header-title {
            font-size: 21px !important;
          }

          .results-header-description {
            font-size: 11px;
          }

          .results-header-actions {
            width: 100%;
          }

          .results-refresh-btn,
          .results-create-btn {
            flex: 1;
          }

          .results-class-inner {
            flex-direction:
              column;

            align-items:
              stretch;
          }

          .results-class-select {
            width: 100%;
          }

          .results-table-header {
            flex-direction:
              column;

            align-items:
              flex-start;
          }

          .results-filter-bar {
            padding: 11px;
          }

          .results-pagination {
            flex-direction:
              column;

            align-items:
              flex-start;
          }

          .results-pagination
          .ant-pagination {
            width: 100%;

            overflow-x: auto;
          }

        }

      `}</style>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeroHeader
        icon={<TrophyOutlined />}
        badgeText="QUẢN LÝ BẢNG ĐIỂM"
        title="Bảng điểm học viên"
        description="Quản lý kết quả học tập, nhập điểm và theo dõi tiến trình của học viên."
        onRefresh={handleRefresh}
        refreshLoading={
          loading || studentsLoading || statsLoading || teacherClassesLoading
        }
        primaryButtonText="Nhập điểm"
        primaryButtonIcon={<PlusOutlined />}
        onPrimaryClick={handleCreate}
        primaryDisabled={
          loading || studentsLoading || statsLoading || teacherClassesLoading
        }
      />

      {/* ======================================================
          CLASS SELECTOR
      ====================================================== */}

      <Card
        className="results-class-card"
        bordered={false}
        bodyStyle={{
          padding: 20,
        }}
      >
        <div className="results-class-inner">
          <div className="results-class-info">
            <div className="results-class-icon">
              <TeamOutlined />
            </div>

            <div>
              <span className="results-class-label">Lớp học đang quản lý</span>

              <span className="results-class-note">
                Chọn lớp để xem và quản lý bảng điểm
              </span>
            </div>
          </div>

          <Select
            className="results-class-select"
            size="large"
            placeholder="Chọn lớp học"
            value={classId ? String(classId) : undefined}
            onChange={(value) => {
              setClassId(value);
            }}
            loading={teacherClassesLoading}
            options={classList.map((item) => ({
              value: String(item.id),

              label: item.name,
            }))}
          />
        </div>
      </Card>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      {classId && (
        <Row gutter={[14, 14]} className="results-stat-row">
          <Col xs={12} sm={6}>
            <StatCard
              title="Tổng học viên"
              value={computedStats.totalStudents}
              loading={statsLoading}
              icon={<TeamOutlined />}
              iconColor="#173B5E"
              description="Số học viên trong lớp"
            />
          </Col>

          <Col xs={12} sm={6}>
            <StatCard
              title="Tổng bài điểm"
              value={computedStats.totalResults}
              loading={statsLoading}
              icon={<BookOutlined />}
              iconColor="#D4AF37"
              description="Tổng kết quả đã nhập"
            />
          </Col>

          <Col xs={12} sm={6}>
            <StatCard
              title="Điểm TB lớp"
              value={`${Number(computedStats.averageScore || 0).toFixed(1)}/10`}
              loading={statsLoading}
              icon={<RiseOutlined />}
              iconColor="#52A675"
              description="Điểm trung bình của lớp"
            />
          </Col>

          <Col xs={12} sm={6}>
            <StatCard
              title="Tỷ lệ đạt"
              value={`${computedStats.passRate}%`}
              loading={statsLoading}
              icon={<CheckCircleOutlined />}
              iconColor="#3B82F6"
              description="Tỷ lệ học viên đạt"
            />
          </Col>
        </Row>
      )}

      {/* ======================================================
          MAIN
      ====================================================== */}

      <Card className="results-main-card" bordered={false}>
        {!classId ? (
          <div className="results-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" align="center" size={4}>
                  <Text
                    strong
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    Chưa chọn lớp học
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,

                      color: COLORS.textMuted,
                    }}
                  >
                    Chọn một lớp học ở phía trên để xem bảng điểm.
                  </Text>
                </Space>
              }
            />
          </div>
        ) : (
          <>
            {/* ==================================================
                TABLE HEADER
            ================================================== */}

            <div className="results-table-header">
              <div className="results-table-title">
                <div className="results-table-title-icon">
                  <BookOutlined />
                </div>

                <div>
                  <span className="results-table-title-main">
                    Danh sách kết quả học tập
                  </span>

                  <span className="results-table-title-sub">
                    {selectedClass?.name || "Lớp đang chọn"}
                    {" • "}
                    {filteredResults.length} học viên
                  </span>
                </div>
              </div>
            </div>

            {/* ==================================================
                FILTER
            ================================================== */}

            <div className="results-filter-bar">
              <Row gutter={[12, 12]} align="middle">
                <Col xs={24} md={14}>
                  <AppSearchInput
                    value={searchText}
                    onChange={(value) => {
                      setSearchText(value);
                      setCurrentPage(1);
                    }}
                    placeholder="Tìm theo tên học viên, mã học viên..."
                  />
                </Col>

                <Col xs={24} md={10}>
                  <Space
                    style={{
                      width: "100%",

                      justifyContent: "flex-end",
                    }}
                    wrap
                  >
                    <Space size={6}>
                      <FilterOutlined
                        style={{
                          color: COLORS.goldDark,
                        }}
                      />

                      <Text
                        style={{
                          color: COLORS.textSecondary,

                          fontSize: 12,

                          fontWeight: 600,
                        }}
                      >
                        Xếp loại
                      </Text>
                    </Space>

                    <Select
                      className="results-filter-select"
                      value={scoreFilter}
                      onChange={(value) => {
                        setScoreFilter(value);

                        setCurrentPage(1);
                      }}
                      size="large"
                      style={{
                        width: 170,
                      }}
                      options={[
                        {
                          value: "all",
                          label: "Tất cả điểm",
                        },

                        {
                          value: "good",
                          label: "Giỏi / Tốt (≥ 8)",
                        },

                        {
                          value: "pass",
                          label: "Đạt (5 - 7.9)",
                        },

                        {
                          value: "fail",
                          label: "Chưa đạt (< 5)",
                        },
                      ]}
                    />
                  </Space>
                </Col>
              </Row>
            </div>

            {/* ==================================================
                TABLE
            ================================================== */}

            <Table
              className="results-main-table"
              columns={columns}
              dataSource={paginatedResults}
              rowKey={(record) => record.id || record.student_id}
              loading={loading || studentsLoading}
              pagination={false}
              scroll={{
                x: 900,
              }}
              locale={{
                emptyText: (
                  <Empty
                    className="results-empty"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có dữ liệu điểm cho lớp này"
                  />
                ),
              }}
            />

            {/* ==================================================
                PAGINATION
            ================================================== */}

            {filteredResults.length > 0 && (
              <div className="results-pagination">
                <span className="results-pagination-info">
                  Hiển thị <b>{paginatedResults.length}</b> /{" "}
                  <b>{filteredResults.length}</b> học viên
                </span>

                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredResults.length}
                  onChange={(page, pSize) => {
                    setCurrentPage(page);

                    setPageSize(pSize);
                  }}
                  showSizeChanger
                  pageSizeOptions={["10", "20", "50"]}
                  size="small"
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* ======================================================
          DETAIL MODAL
      ====================================================== */}

      <AppDetailModal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
        }}
        showEdit={false}
        title={
          selectedStudent
            ? `Bảng điểm cá nhân - ${
                selectedStudent.name || selectedStudent.full_name || ""
              }`
            : "Bảng điểm học viên"
        }
        width={800}
      >
        {detailLoading ? (
          <Skeleton
            active
            paragraph={{
              rows: 6,
            }}
          />
        ) : (
          <div>
            {/* ==================================================
                PROFILE
            ================================================== */}

            <div className="results-detail-profile">
              <Row align="middle" justify="space-between" gutter={16}>
                <Col>
                  <Space size={12}>
                    <Avatar size={48} className="results-detail-avatar">
                      {(
                        selectedStudent?.name ||
                        selectedStudent?.full_name ||
                        "H"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>

                    <div>
                      <Title level={5} className="results-detail-name">
                        {selectedStudent?.name || selectedStudent?.full_name}
                      </Title>

                      <div className="results-detail-meta">
                        Mã HV: #{selectedStudent?.id}
                        {" • "}
                        Lớp: {selectedClass?.name}
                      </div>
                    </div>
                  </Space>
                </Col>

                <Col>
                  {studentStats && (
                    <div className="results-detail-average">
                      <span className="results-detail-average-label">
                        ĐTB tích lũy
                      </span>

                      <span className="results-detail-average-value">
                        {Number(studentStats.average_score || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                </Col>
              </Row>
            </div>

            {/* ==================================================
                DETAIL TABLE
            ================================================== */}

            <Table
              columns={detailColumns}
              dataSource={studentResults}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{
                x: 650,
              }}
              locale={{
                emptyText: "Chưa có bài thi nào",
              }}
            />
          </div>
        )}
      </AppDetailModal>

      {/* ======================================================
          CREATE / EDIT
      ====================================================== */}

      <AppFormModal
        open={modalOpen}
        onCancel={() => {
          if (!submitting) {
            setModalOpen(false);

            setEditingResult(null);

            form.resetFields();
          }
        }}
        onOk={handleSubmit}
        confirmLoading={submitting}
        title={editingResult ? "Chỉnh sửa điểm bài thi" : "Nhập điểm mới"}
        width={540}
      >
        <ResultForm
          form={form}
          students={students}
          editingResult={editingResult}
          disabledStudentSelect={Boolean(editingResult)}
        />
      </AppFormModal>
    </div>
  );
};

export default ResultsPage;
