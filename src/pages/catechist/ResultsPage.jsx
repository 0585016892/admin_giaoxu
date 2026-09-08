import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
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
  SearchOutlined,
  TeamOutlined,
  TrophyOutlined,
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
import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";
import ResultForm from "../../components/forms/ResultForm";

const { Text, Title } = Typography;

/* ============================================================
   DESIGN SYSTEM
============================================================ */

const COLORS = {
  primary: "#F4729A",
  primaryDark: "#E85D87",
  primaryLight: "#FFF0F5",
  primaryBorder: "#F8C8D8",

  lavender: "#B98AE8",
  lavenderLight: "#F6EEFF",

  green: "#34B27B",
  greenLight: "#ECFDF5",

  orange: "#F59E0B",
  orangeLight: "#FEF3C7",

  red: "#EF4444",
  redLight: "#FEF2F2",

  blue: "#3B82F6",
  blueLight: "#EFF6FF",

  text: "#493F47",
  textSecondary: "#918792",
  textMuted: "#A59BA3",

  border: "#F3E8EE",
  background: "#FAF8FA",
  white: "#FFFFFF",
};

/* ============================================================
   HELPERS
============================================================ */

const unwrapResponse = (response) => {
  if (!response) return {};

  // axios response
  if (response?.data?.success !== undefined) {
    return response.data;
  }

  // API response
  if (response?.success !== undefined) {
    return response;
  }

  // trường hợp response.data là object
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
      label: "Giỏi / Tốt",
      color: COLORS.green,
      background: COLORS.greenLight,
      tagColor: "success",
    };
  }

  if (value >= 5) {
    return {
      label: "Đạt",
      color: COLORS.orange,
      background: COLORS.orangeLight,
      tagColor: "warning",
    };
  }

  return {
    label: "Chưa đạt",
    color: COLORS.red,
    background: COLORS.redLight,
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
          minWidth: large ? 60 : 44,
          height: large ? 42 : 32,
          padding: "0 10px",
          borderRadius: 10,
          background: status.background,
          color: status.color,
          border: `1px solid ${status.color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: large ? 18 : 14,
          fontWeight: 700,
        }}
      >
        {value.toFixed(1)}
      </div>

      {large && (
        <Tag
          bordered={false}
          style={{
            margin: 0,
            borderRadius: 8,
            color: status.color,
            background: status.background,
            fontWeight: 600,
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

      // Nếu lớp đang chọn không còn tồn tại
      if (
        classId &&
        !list.some((item) => String(item.id) === String(classId))
      ) {
        setClassId(null);
      }

      // Chỉ có 1 lớp thì tự chọn
      if (list.length === 1) {
        setClassId(String(list[0].id));
      }

      return list;
    } catch (error) {
      console.error("LOAD TEACHER CLASSES ERROR:", error);

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
     
     API:
     GET /api/results/class/:classId
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
      console.error("LOAD RESULTS BY CLASS ERROR:", error);

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
     
     API:
     GET /api/students?class_id=xxx
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
      console.error("LOAD STUDENTS ERROR:", error);

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
     
     API:
     GET /api/results/class/:classId/statistics
  ============================================================ */

  const loadStatistics = useCallback(async (selectedClassId) => {
    if (!selectedClassId) {
      setStatistics(null);
      return;
    }

    try {
      setStatsLoading(true);

      // QUAN TRỌNG:
      // getClassStatistics(classId)
      // KHÔNG phải getClassStatistics({ class_id })
      const response = await getClassStatistics(selectedClassId);

      const resData = unwrapResponse(response);

      if (resData?.success === false) {
        setStatistics(null);
        return;
      }

      setStatistics(resData?.data || null);
    } catch (error) {
      console.error("LOAD CLASS STATISTICS ERROR:", error);

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
     INITIAL LOAD CLASSES
  ============================================================ */

  useEffect(() => {
    loadTeacherClasses();
  }, [loadTeacherClasses]);

  /* ============================================================
     LOAD WHEN CLASS CHANGES
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
     MAP STUDENTS
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
     FILTER RESULTS
  ============================================================ */

  const filteredResults = useMemo(() => {
    let data = [...results];

    /* SEARCH */

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

    /* SCORE FILTER */

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
     
     API statistics:
       total_students
       total_results
       average_score
       highest_score
       lowest_score
       passed_students
       failed_students

     API chưa trả good_students nên tính từ results.
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
     LOAD STUDENT DETAIL
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

        /* ==========================
             RESULTS
          ========================== */

        if (resultsResponse.status === "fulfilled") {
          const resData = unwrapResponse(resultsResponse.value);

          const list = Array.isArray(resData?.data)
            ? resData.data
            : Array.isArray(resData)
              ? resData
              : [];

          // Chỉ hiển thị kết quả của lớp đang chọn
          const classResults = classId
            ? list.filter((item) => String(item.class_id) === String(classId))
            : list;

          setStudentResults(classResults);
        } else {
          setStudentResults([]);
        }

        /* ==========================
             STUDENT STATISTICS
          ========================== */

        if (statsResponse.status === "fulfilled") {
          const resData = unwrapResponse(statsResponse.value);

          setStudentStats(resData?.data || null);
        } else {
          setStudentStats(null);
        }
      } catch (error) {
        console.error("FETCH STUDENT DETAIL ERROR:", error);

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
     SUBMIT CREATE / UPDATE
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

        // Giữ class_id trong payload.
        // Backend hiện tại có thể chưa lưu,
        // nhưng dùng để tương thích về sau.
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
        console.error("SAVE RESULT ERROR:", error);

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
      console.error("DELETE RESULT ERROR:", error);

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
      width: 60,
      align: "center",

      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },

    /* ==========================
       STUDENT
    ========================== */

    {
      title: "Học viên",
      key: "student",
      width: 280,

      render: (_, record) => {
        const student = studentsMap.get(Number(record.student_id));

        const name = getStudentName(record, studentsMap);

        const guardian = student?.guardian_name;

        return (
          <Space size={12} align="center">
            <Avatar
              size={42}
              style={{
                backgroundColor: COLORS.primaryLight,

                color: COLORS.primaryDark,

                fontWeight: 700,

                border: `1px solid ${COLORS.primaryBorder}`,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>

            <div>
              <Text
                strong
                style={{
                  display: "block",

                  color: COLORS.text,

                  fontSize: 14,

                  lineHeight: 1.3,
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
                  ID: #{record.student_id}
                </Text>

                {guardian && (
                  <>
                    <Text
                      style={{
                        fontSize: 10,
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

    /* ==========================
       TOTAL RESULTS
    ========================== */

    {
      title: "Bài thi",
      dataIndex: "total_results",

      key: "total_results",

      width: 100,

      align: "center",

      render: (value) => (
        <Tag
          color="purple"
          style={{
            borderRadius: 12,
            padding: "2px 10px",
            fontWeight: 600,
          }}
        >
          <BookOutlined
            style={{
              marginRight: 4,
            }}
          />

          {Number(value) || 0}
        </Tag>
      ),
    },

    /* ==========================
       AVERAGE
    ========================== */

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
              paddingRight: 10,
            }}
          >
            <div
              style={{
                display: "flex",

                justifyContent: "space-between",

                marginBottom: 4,
              }}
            >
              <Text
                strong
                style={{
                  color: status.color,

                  fontSize: 13,
                }}
              >
                {value.toFixed(1)} / 10
              </Text>

              <Text
                style={{
                  fontSize: 11,
                  color: COLORS.textMuted,
                }}
              >
                {Math.round(value * 10)}%
              </Text>
            </div>

            <Progress
              percent={Math.min(value * 10, 100)}
              showInfo={false}
              strokeWidth={8}
              strokeColor={status.color}
              trailColor="#F3E8EE"
            />
          </div>
        );
      },
    },

    /* ==========================
       STATUS
    ========================== */

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
              borderRadius: 8,
              padding: "4px 12px",

              color: status.color,

              background: status.background,

              fontWeight: 600,
            }}
          >
            {status.label}
          </Tag>
        );
      },
    },

    /* ==========================
       LATEST EXAM
    ========================== */

    {
      title: "Thi gần nhất",

      dataIndex: "latest_exam_date",

      key: "latest_exam_date",

      width: 140,

      render: (date) =>
        date ? (
          <Space size={6}>
            <CalendarOutlined
              style={{
                color: COLORS.primary,
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
          <Text
            style={{
              color: COLORS.textMuted,
            }}
          >
            —
          </Text>
        ),
    },

    /* ==========================
       ACTION
    ========================== */

    {
      title: "Thao tác",

      key: "action",

      width: 90,

      fixed: "right",

      align: "center",

      render: (_, record) => (
        <Tooltip title="Xem chi tiết điểm">
          <Button
            type="text"
            shape="circle"
            icon={
              <EyeOutlined
                style={{
                  color: COLORS.primary,

                  fontSize: 16,
                }}
              />
            }
            onClick={() => handleViewDetail(record)}
            style={{
              background: COLORS.primaryLight,
            }}
          />
        </Tooltip>
      ),
    },
  ];

  /* ============================================================
     DETAIL TABLE
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
            color="blue"
            style={{
              borderRadius: 8,
            }}
          >
            Online
          </Tag>
        ) : (
          <Tag
            icon={<FormOutlined />}
            color="orange"
            style={{
              borderRadius: 8,
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
              color: COLORS.text,
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

      width: 90,

      align: "right",

      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
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
    <div
      style={{
        maxWidth: 1250,
        margin: "0 auto",
        paddingBottom: 40,
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeroHeader
        icon={<TrophyOutlined />}
        title="Bảng Điểm Học Viên"
        description="Quản lý kết quả học tập, nhập điểm thi và theo dõi tiến trình học viên trong lớp"
        onRefresh={handleRefresh}
        refreshLoading={
          loading || studentsLoading || statsLoading || teacherClassesLoading
        }
        primaryButtonText="Nhập điểm mới"
        primaryButtonIcon={<PlusOutlined />}
        onPrimaryClick={handleCreate}
      />

      {/* ======================================================
          CLASS SELECTOR
      ====================================================== */}

      <Card
        bordered={false}
        style={{
          marginTop: 20,
          borderRadius: 20,

          background: "linear-gradient(135deg, #FFF0F5 0%, #F6EEFF 100%)",

          border: `1px solid ${COLORS.primaryBorder}`,

          boxShadow: "0 6px 20px rgba(244,114,154,0.06)",
        }}
        bodyStyle={{
          padding: "20px 24px",
        }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Space size={12} align="center">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,

                  background: COLORS.white,

                  color: COLORS.primary,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  fontSize: 20,

                  boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
                }}
              >
                <TeamOutlined />
              </div>

              <div>
                <Text
                  strong
                  style={{
                    fontSize: 15,
                    color: COLORS.text,

                    display: "block",
                  }}
                >
                  Lớp giáo lý đang quản lý
                </Text>

                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.textSecondary,
                  }}
                >
                  Vui lòng chọn lớp để tải bảng điểm
                </Text>
              </div>
            </Space>
          </Col>

          <Col
            xs={24}
            md={10}
            style={{
              textAlign: "right",
            }}
          >
            <Select
              size="large"
              placeholder="-- Chọn lớp học --"
              value={classId ? String(classId) : undefined}
              onChange={(value) => {
                setClassId(value);
              }}
              loading={teacherClassesLoading}
              style={{
                width: "100%",
                maxWidth: 320,
              }}
              options={classList.map((item) => ({
                value: String(item.id),

                label: `🏫 ${item.name}`,
              }))}
            />
          </Col>
        </Row>
      </Card>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      {classId && (
        <Row
          gutter={[16, 16]}
          style={{
            marginTop: 20,
          }}
        >
          {/* TOTAL STUDENTS */}

          <Col xs={12} sm={6}>
            <StatCard
              title="Tổng học viên"
              value={computedStats.totalStudents}
              icon={<TeamOutlined />}
              color={COLORS.primary}
              bg={COLORS.primaryLight}
            />
          </Col>

          {/* TOTAL RESULTS */}

          <Col xs={12} sm={6}>
            <StatCard
              title="Tổng bài điểm"
              value={computedStats.totalResults}
              icon={<BookOutlined />}
              color={COLORS.lavender}
              bg={COLORS.lavenderLight}
            />
          </Col>

          {/* AVERAGE */}

          <Col xs={12} sm={6}>
            <StatCard
              title="ĐTB Lớp"
              value={Number(computedStats.averageScore || 0).toFixed(1)}
              suffix="/ 10"
              icon={<RiseOutlined />}
              color={COLORS.green}
              bg={COLORS.greenLight}
            />
          </Col>

          {/* PASS RATE */}

          <Col xs={12} sm={6}>
            <StatCard
              title="Tỷ lệ Đạt"
              value={`${computedStats.passRate}%`}
              icon={<CheckCircleOutlined />}
              color={COLORS.orange}
              bg={COLORS.orangeLight}
            />
          </Col>
        </Row>
      )}

      {/* ======================================================
          MAIN CARD
      ====================================================== */}

      <Card
        bordered={false}
        style={{
          marginTop: 20,
          borderRadius: 20,
          background: COLORS.white,

          border: `1px solid ${COLORS.primaryBorder}`,

          boxShadow: "0 8px 30px rgba(0,0,0,0.03)",
        }}
        bodyStyle={{
          padding: 24,
        }}
      >
        {/* NO CLASS */}

        {!classId ? (
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
                    fontSize: 13,
                    color: COLORS.textMuted,
                  }}
                >
                  Vui lòng chọn một lớp ở menu trên để xem bảng điểm
                </Text>
              </Space>
            }
            style={{
              padding: "40px 0",
            }}
          />
        ) : (
          <>
            {/* ==================================================
                FILTER BAR
            ================================================== */}

            <Row
              gutter={[16, 16]}
              align="middle"
              style={{
                marginBottom: 20,
              }}
            >
              <Col xs={24} md={12}>
                <Input
                  prefix={
                    <SearchOutlined
                      style={{
                        color: COLORS.primary,
                      }}
                    />
                  }
                  placeholder="Tìm kiếm theo tên học viên, mã học viên..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);

                    setCurrentPage(1);
                  }}
                  allowClear
                  size="large"
                  style={{
                    borderRadius: 12,
                  }}
                />
              </Col>

              <Col
                xs={24}
                md={12}
                style={{
                  textAlign: "right",
                }}
              >
                <Space wrap align="center">
                  <Text
                    style={{
                      fontSize: 13,
                      color: COLORS.textSecondary,
                    }}
                  >
                    <FilterOutlined /> Lọc điểm:
                  </Text>

                  <Select
                    value={scoreFilter}
                    onChange={(value) => {
                      setScoreFilter(value);

                      setCurrentPage(1);
                    }}
                    style={{
                      width: 160,
                    }}
                    size="large"
                    options={[
                      {
                        value: "all",
                        label: "Tất cả điểm",
                      },

                      {
                        value: "good",
                        label: "🟢 Tốt/Giỏi (≥8)",
                      },

                      {
                        value: "pass",
                        label: "🟠 Đạt (5-7.9)",
                      },

                      {
                        value: "fail",
                        label: "🔴 Chưa đạt (<5)",
                      },
                    ]}
                  />
                </Space>
              </Col>
            </Row>

            {/* ==================================================
                TABLE
            ================================================== */}

            <Table
              columns={columns}
              dataSource={paginatedResults}
              rowKey={(record) => record.id || record.student_id}
              loading={loading || studentsLoading}
              pagination={false}
              scroll={{
                x: 850,
              }}
              locale={{
                emptyText: (
                  <Empty
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
              <div
                style={{
                  marginTop: 20,

                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  flexWrap: "wrap",

                  gap: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.textSecondary,
                  }}
                >
                  Hiển thị <b>{paginatedResults.length}</b> /{" "}
                  <b>{filteredResults.length}</b> học viên
                </Text>

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
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* ======================================================
          STUDENT DETAIL MODAL
      ====================================================== */}

      <AppDetailModal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
        }}
        showEdit={false}
        title={
          selectedStudent
            ? `Bảng Điểm Cá Nhân - ${
                selectedStudent.name || selectedStudent.full_name || ""
              }`
            : "Bảng Điểm Học Viên"
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
            {/* STUDENT INFO */}

            <Card
              bordered={false}
              style={{
                borderRadius: 16,

                background: COLORS.primaryLight,

                marginBottom: 20,

                border: `1px solid ${COLORS.primaryBorder}`,
              }}
              bodyStyle={{
                padding: 16,
              }}
            >
              <Row align="middle" justify="space-between" gutter={16}>
                <Col>
                  <Space size={12}>
                    <Avatar
                      size={48}
                      style={{
                        backgroundColor: COLORS.white,

                        color: COLORS.primary,

                        fontWeight: 700,
                      }}
                    >
                      {(
                        selectedStudent?.name ||
                        selectedStudent?.full_name ||
                        "H"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>

                    <div>
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          color: COLORS.text,
                        }}
                      >
                        {selectedStudent?.name || selectedStudent?.full_name}
                      </Title>

                      <Text
                        style={{
                          fontSize: 12,
                          color: COLORS.textSecondary,
                        }}
                      >
                        Mã HV: #{selectedStudent?.id} • Lớp:{" "}
                        {selectedClass?.name}
                      </Text>
                    </div>
                  </Space>
                </Col>

                <Col>
                  {studentStats && (
                    <Space size={12}>
                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: COLORS.textMuted,

                            display: "block",
                          }}
                        >
                          ĐTB Tích lũy
                        </Text>

                        <Text
                          strong
                          style={{
                            fontSize: 18,
                            color: COLORS.primaryDark,
                          }}
                        >
                          {Number(studentStats.average_score || 0).toFixed(1)}
                        </Text>
                      </div>
                    </Space>
                  )}
                </Col>
              </Row>
            </Card>

            {/* DETAIL RESULTS */}

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
          CREATE / EDIT MODAL
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
