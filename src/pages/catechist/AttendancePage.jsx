import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Empty,
  Input,
  Modal,
  Pagination,
  Row,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  CalendarOutlined,
  CameraOutlined,
  CheckCircleFilled,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleFilled,
  CloseOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  QrcodeOutlined,
  SearchOutlined,
  StopOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  HeartOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import PageHeroHeader from "../../components/common/PageHeroHeader";
import QRCodeScanner from "./QRCodeScanner";
import StatCard from "../../components/common/StatCard";

import attendanceApi from "../../api/attendanceApi";
import classApi from "../../api/classApi";

const { Text, Title } = Typography;

/* =========================================================
   ATTENDANCE TYPE
========================================================= */

const ATTENDANCE_TYPE_CONFIG = {
  catechism: {
    label: "Học Giáo lý",
    shortLabel: "Giáo lý",
    icon: <BookOutlined />,
    description: "Điểm danh buổi học giáo lý",
    color: "blue",
  },

  mass: {
    label: "Tham dự Thánh lễ",
    shortLabel: "Thánh lễ",
    icon: <HeartOutlined />,
    description: "Điểm danh tham dự Thánh lễ",
    color: "purple",
  },
};

/* =========================================================
   STATUS
========================================================= */

const STATUS_CONFIG = {
  present: {
    label: "Có mặt",
    color: "success",
    icon: <CheckCircleFilled />,
  },

  absent: {
    label: "Vắng",
    color: "error",
    icon: <CloseCircleFilled />,
  },

  late: {
    label: "Đi muộn",
    color: "warning",
    icon: <ClockCircleOutlined />,
  },

  excused: {
    label: "Có phép",
    color: "processing",
    icon: <ExclamationCircleOutlined />,
  },

  not_attended: {
    label: "Chưa điểm danh",
    color: "default",
    icon: <ExclamationCircleOutlined />,
  },
};

/* =========================================================
   DEFAULT
========================================================= */

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const DEFAULT_STATISTICS = {
  total: 0,
  present: 0,
  absent: 0,
  late: 0,
  excused: 0,
  not_attended: 0,
  attendance_rate: 0,
};

/* =========================================================
   HELPERS
========================================================= */

const getApiBody = (response) => {
  if (!response) {
    return {};
  }

  return response?.data || response;
};

const normalizeClasses = (response) => {
  const body = getApiBody(response);

  const list = body?.data || body?.classes || (Array.isArray(body) ? body : []);

  return list.map((item) => ({
    ...item,

    id: item.id ?? item.class_id,

    name:
      item.name ?? item.class_name ?? item.class?.name ?? "Lớp chưa đặt tên",
  }));
};

const getStudentsFromResponse = (response) => {
  const body = getApiBody(response);

  if (Array.isArray(body?.data)) {
    return body.data;
  }

  if (Array.isArray(body?.students)) {
    return body.students;
  }

  if (Array.isArray(body)) {
    return body;
  }

  return [];
};

const getPaginationFromResponse = (response) => {
  const body = getApiBody(response);

  const pg = body?.pagination || response?.pagination || {};

  return {
    page: Number(pg?.page) || 1,

    limit: Number(pg?.limit) || 10,

    total: Number(pg?.total) || 0,

    totalPages: Number(pg?.totalPages) || Number(pg?.total_pages) || 1,
  };
};

const getStatisticsFromResponse = (response) => {
  const body = response;

  const stats = body?.statistics || body?.stats || {};

  return {
    total: Number(stats?.total) || 0,

    present: Number(stats?.present) || 0,

    absent: Number(stats?.absent) || 0,

    late: Number(stats?.late) || 0,

    excused: Number(stats?.excused) || 0,

    not_attended: Number(stats?.not_attended) || Number(stats?.notMarked) || 0,

    attendance_rate: Number(stats?.attendance_rate) || Number(stats?.rate) || 0,
  };
};

const normalizeAttendanceStatus = (status) => {
  if (
    status === "present" ||
    status === "absent" ||
    status === "late" ||
    status === "excused"
  ) {
    return status;
  }

  return "not_attended";
};

const getAttendanceTypeConfig = (type) => {
  return ATTENDANCE_TYPE_CONFIG[type] || ATTENDANCE_TYPE_CONFIG.catechism;
};

/* =========================================================
   COMPONENT
========================================================= */

const AttendancePage = () => {
  /* =======================================================
     STATE
  ======================================================= */

  const [classes, setClasses] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState(null);

  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [attendanceType, setAttendanceType] = useState(null);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [students, setStudents] = useState([]);

  const [statistics, setStatistics] = useState(DEFAULT_STATISTICS);

  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  const [loadingClasses, setLoadingClasses] = useState(false);

  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [saving, setSaving] = useState(false);

  const [isQrOpen, setIsQrOpen] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(false);

  const [historyStudent, setHistoryStudent] = useState(null);

  const [historyData, setHistoryData] = useState([]);

  const requestIdRef = useRef(0);

  /* =======================================================
     USER
  ======================================================= */

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const role = user?.role || user?.user?.role || localStorage.getItem("role");

  /* =======================================================
     DATE
  ======================================================= */

  const dateString = useMemo(() => {
    return selectedDate.format("YYYY-MM-DD");
  }, [selectedDate]);

  const isLocked = selectedDate.isBefore(dayjs(), "day");

  /* =======================================================
     SELECTED CLASS
  ======================================================= */

  const selectedClass = useMemo(() => {
    return classes.find((item) => Number(item.id) === Number(selectedClassId));
  }, [classes, selectedClassId]);

  /* =======================================================
     ATTENDANCE TYPE
  ======================================================= */

  const currentTypeConfig = useMemo(() => {
    return getAttendanceTypeConfig(attendanceType);
  }, [attendanceType]);

  /* =======================================================
     LOAD CLASSES
  ======================================================= */

  const loadClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);

      let response;

      if (role === "teacher") {
        response = await classApi.getClassTeacher();
      } else {
        response = await classApi.getAll();
      }

      const list = normalizeClasses(response);

      setClasses(list);

      if (list.length > 0 && !selectedClassId) {
        setSelectedClassId(list[0].id);
      }
    } catch (error) {
      console.error("Load classes error:", error);

      message.error("Không thể tải danh sách lớp");
    } finally {
      setLoadingClasses(false);
    }
  }, [role, selectedClassId]);

  /* =======================================================
     LOAD ATTENDANCE
  ======================================================= */

  const loadAttendance = useCallback(async () => {
    if (!selectedClassId || !attendanceType) {
      setStudents([]);
      setStatistics(DEFAULT_STATISTICS);
      setPagination(DEFAULT_PAGINATION);

      return;
    }

    const requestId = ++requestIdRef.current;

    try {
      setLoadingAttendance(true);

      const response = await attendanceApi.getAttendance({
        class_id: selectedClassId,

        date: dateString,

        attendance_type: attendanceType,

        page,

        limit: pageSize,

        search: search.trim(),

        status: statusFilter,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setStudents(getStudentsFromResponse(response));

      setPagination(getPaginationFromResponse(response));

      setStatistics(getStatisticsFromResponse(response));
    } catch (error) {
      console.error("Load attendance error:", error);

      if (requestId === requestIdRef.current) {
        message.error("Không thể tải danh sách điểm danh");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingAttendance(false);
      }
    }
  }, [
    selectedClassId,
    dateString,
    attendanceType,
    page,
    pageSize,
    search,
    statusFilter,
  ]);

  /* =======================================================
     EFFECT - CLASSES
  ======================================================= */

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  /* =======================================================
     EFFECT - ATTENDANCE
  ======================================================= */

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());

      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* =======================================================
     RESET PAGE
  ======================================================= */

  useEffect(() => {
    setPage(1);
    setIsQrOpen(false);
  }, [selectedClassId, dateString, attendanceType, statusFilter]);

  /* =======================================================
     TABLE DATA
  ======================================================= */

  const tableData = useMemo(() => {
    return students.map((student) => ({
      ...student,

      key: student.student_id ?? student.id,

      currentStatus: normalizeAttendanceStatus(
        student.attendance_status ?? student.status,
      ),
    }));
  }, [students]);

  /* =======================================================
     UPDATE ATTENDANCE
  ======================================================= */

  const updateAttendance = useCallback(
    async (student, status) => {
      if (isLocked) {
        message.warning("Ngày này đã khóa, không thể thay đổi điểm danh.");

        return;
      }

      if (!student?.student_id) {
        return;
      }

      const currentStatus = normalizeAttendanceStatus(
        student.attendance_status ?? student.status,
      );

      if (["present", "late", "absent", "excused"].includes(currentStatus)) {
        message.info("Học sinh này đã được điểm danh.");

        return;
      }

      try {
        setSaving(true);

        const checkInTime =
          status === "present" || status === "late"
            ? dayjs().format("HH:mm:ss")
            : null;

        await attendanceApi.saveBulkAttendance({
          class_id: selectedClassId,

          date: dateString,

          attendance_type: attendanceType,

          students: [
            {
              student_id: student.student_id,

              status,

              check_in_time: checkInTime,

              note: null,
            },
          ],
        });

        message.success(`Đã điểm danh ${currentTypeConfig.shortLabel}`);

        await loadAttendance();
      } catch (error) {
        console.error("Save attendance error:", error);

        const statusCode = error?.response?.status;

        const body = error?.response?.data;

        if (statusCode === 409 || body?.code === "ALREADY_ATTENDED") {
          message.warning("Học sinh này đã được điểm danh trước đó.");
        } else {
          message.error(body?.message || "Không thể cập nhật điểm danh");
        }
      } finally {
        setSaving(false);
      }
    },
    [
      isLocked,
      selectedClassId,
      dateString,
      attendanceType,
      currentTypeConfig,
      loadAttendance,
    ],
  );

  /* =======================================================
     QR SUCCESS
  ======================================================= */

  const handleQRSuccess = useCallback(
    async (data) => {
      await loadAttendance();

      return data;
    },
    [loadAttendance],
  );

  /* =======================================================
     FINISH QR
  ======================================================= */

  const handleFinishQRAttendance = useCallback(async () => {
    if (!selectedClassId) {
      setIsQrOpen(false);
      return;
    }

    if (isLocked) {
      setIsQrOpen(false);
      return;
    }

    try {
      setSaving(true);

      await attendanceApi.finishAttendance({
        class_id: selectedClassId,

        attendance_date: dateString,

        attendance_type: attendanceType,
      });

      setIsQrOpen(false);

      message.success(
        `Đã kết thúc điểm danh ${currentTypeConfig.shortLabel}. Các học sinh chưa được ghi nhận đã chuyển sang Vắng.`,
      );

      await loadAttendance();
    } catch (error) {
      console.error("Finish attendance error:", error);

      message.error(
        error?.response?.data?.message || "Không thể kết thúc điểm danh",
      );
    } finally {
      setSaving(false);
    }
  }, [
    selectedClassId,
    dateString,
    attendanceType,
    isLocked,
    currentTypeConfig,
    loadAttendance,
  ]);

  /* =======================================================
     TOGGLE QR
  ======================================================= */

  const handleToggleQR = useCallback(() => {
    if (!selectedClassId) {
      message.warning("Vui lòng chọn lớp trước.");

      return;
    }
    if (!attendanceType) {
      message.warning("Vui lòng chọn loại điểm danh trước.");
      return;
    }
    if (isLocked) {
      message.warning("Ngày này đã khóa điểm danh.");

      return;
    }

    if (isQrOpen) {
      handleFinishQRAttendance();
      return;
    }

    setIsQrOpen(true);
  }, [
    selectedClassId,
    attendanceType,
    isLocked,
    isQrOpen,
    handleFinishQRAttendance,
  ]);

  /* =======================================================
     HISTORY
  ======================================================= */

  const openHistory = useCallback(async (student) => {
    if (!student?.student_id) {
      return;
    }

    setHistoryStudent(student);

    setHistoryOpen(true);

    try {
      setHistoryLoading(true);

      const response = await attendanceApi.getStudentHistory(
        student.student_id,
      );

      const body = getApiBody(response);

      const list = Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body)
          ? body
          : [];

      setHistoryData(list);
    } catch (error) {
      console.error("History error:", error);

      message.error("Không thể tải lịch sử điểm danh");

      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const {
    total,
    present,
    absent,
    late,
    excused,
    attendance_rate: attendanceRate,
  } = statistics;

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = useMemo(
    () => [
      {
        title: "HỌC SINH",
        key: "student",
        width: 280,

        render: (_, record) => {
          const avatar =
            record.avatar || record.avatar_url || record.student_avatar;

          return (
            <div className="student-cell">
              <Avatar
                size={44}
                src={avatar}
                icon={<UserOutlined />}
                className="student-avatar"
              />

              <div className="student-info">
                <Text strong className="student-name">
                  {record.name || record.student_name || "Chưa có tên"}
                </Text>

                <Text type="secondary" className="student-code">
                  {record.code ||
                    record.student_code ||
                    `ID #${record.student_id}`}
                </Text>
              </div>
            </div>
          );
        },
      },

      {
        title: "TRẠNG THÁI",
        key: "status",
        width: 170,
        align: "center",

        render: (_, record) => {
          const config =
            STATUS_CONFIG[record.currentStatus] || STATUS_CONFIG.not_attended;

          return (
            <Tag
              color={config.color}
              icon={config.icon}
              className="attendance-status-tag"
            >
              {config.label}
            </Tag>
          );
        },
      },

      {
        title: "GIỜ VÀO",
        key: "check_in_time",
        width: 120,
        align: "center",

        render: (_, record) => {
          if (!record.check_in_time) {
            return <Text type="secondary">—</Text>;
          }

          return <Text strong>{String(record.check_in_time).slice(0, 5)}</Text>;
        },
      },

      /* =====================================================
         MANUAL ATTENDANCE
      ===================================================== */

      {
        title: "ĐIỂM DANH",
        key: "actions",
        width: 235,
        align: "center",

        render: (_, record) => {
          const current = record.currentStatus;

          const disabled = isLocked || saving || current !== "not_attended";

          return (
            <div className="manual-attendance-actions">
              {/* CÓ MẶT */}
              <Tooltip title="Đánh dấu Có mặt">
                <Button
                  className="manual-action-btn manual-present"
                  shape="circle"
                  size="middle"
                  icon={<CheckOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "present")}
                />
              </Tooltip>

              {/* ĐI MUỘN */}
              <Tooltip title="Đánh dấu Đi muộn">
                <Button
                  className="manual-action-btn manual-late"
                  shape="circle"
                  size="middle"
                  icon={<ClockCircleOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "late")}
                />
              </Tooltip>

              {/* VẮNG */}
              <Tooltip title="Đánh dấu Vắng">
                <Button
                  className="manual-action-btn manual-absent"
                  shape="circle"
                  size="middle"
                  icon={<CloseOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "absent")}
                />
              </Tooltip>

              {/* CÓ PHÉP */}
              <Tooltip title="Đánh dấu Có phép">
                <Button
                  className="manual-action-btn manual-excused"
                  shape="circle"
                  size="middle"
                  icon={<ExclamationCircleOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "excused")}
                />
              </Tooltip>

              {/* LỊCH SỬ */}
              <Tooltip title="Xem lịch sử điểm danh">
                <Button
                  className="manual-action-btn manual-history"
                  shape="circle"
                  size="middle"
                  icon={<HistoryOutlined />}
                  onClick={() => openHistory(record)}
                />
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [isLocked, saving, updateAttendance, openHistory],
  );

  /* =======================================================
     HISTORY COLUMNS
  ======================================================= */

  const historyColumns = useMemo(
    () => [
      {
        title: "Ngày",
        dataIndex: "attendance_date",
        width: 110,

        render: (value) => (value ? dayjs(value).format("DD/MM/YYYY") : "—"),
      },

      {
        title: "Hoạt động",
        dataIndex: "attendance_type",
        width: 140,

        render: (value) => {
          const config = getAttendanceTypeConfig(value);

          return (
            <Tag
              color={value === "mass" ? "purple" : "blue"}
              icon={config.icon}
            >
              {config.shortLabel}
            </Tag>
          );
        },
      },

      {
        title: "Trạng thái",
        dataIndex: "status",

        render: (value) => {
          const config = STATUS_CONFIG[value] || STATUS_CONFIG.not_attended;

          return (
            <Tag color={config.color} icon={config.icon}>
              {config.label}
            </Tag>
          );
        },
      },

      {
        title: "Giờ",
        dataIndex: "check_in_time",
        width: 80,

        render: (value) => (value ? String(value).slice(0, 5) : "—"),
      },
    ],
    [],
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF8FAB",

          colorInfo: "#FF8FAB",

          borderRadius: 14,

          fontFamily: "'Quicksand', sans-serif",
        },

        components: {
          Table: {
            headerBg: "#FFF4F7",

            headerColor: "#7A4050",

            rowHoverBg: "#FFF9FB",
          },

          Select: {
            optionSelectedBg: "#FFF0F4",
          },
        },
      }}
    >
      <div className="attendance-page">
        {/* =================================================
            HERO
        ================================================= */}

        <PageHeroHeader
          icon={<CheckCircleFilled />}
          badgeText="QUẢN LÝ ĐIỂM DANH"
          title="Điểm Danh Học Viên"
          description="Quản lý điểm danh tham dự Thánh lễ và học Giáo lý theo từng lớp."
          onRefresh={loadAttendance}
          refreshLoading={loadingAttendance}
        />

        {/* =================================================
            FILTER
        ================================================= */}

        <Card bordered={false} className="attendance-filter-card">
          <div className="attendance-filter">
            {/* LOẠI */}
            <div className="filter-item type-filter">
              <Text className="filter-label">
                Loại điểm danh <span style={{ color: "#ff4d4f" }}>*</span>
              </Text>

              <Select
                value={attendanceType}
                placeholder="Chọn loại điểm danh"
                className="attendance-type-select"
                allowClear
                onChange={(value) => {
                  setAttendanceType(value || null);
                  setPage(1);
                  setIsQrOpen(false);
                }}
                options={[
                  {
                    value: "catechism",
                    label: (
                      <div className="type-option">
                        <BookOutlined />
                        <span>Học Giáo lý</span>
                      </div>
                    ),
                  },
                  {
                    value: "mass",
                    label: (
                      <div className="type-option">
                        <HeartOutlined />
                        <span>Tham dự Thánh lễ</span>
                      </div>
                    ),
                  },
                ]}
              />
            </div>

            {/* LỚP */}
            <div className="filter-item class-filter">
              <Text className="filter-label">Lớp học</Text>

              <Select
                value={selectedClassId}
                loading={loadingClasses}
                placeholder="Chọn lớp"
                className="attendance-select"
                onChange={(value) => {
                  setSelectedClassId(value);

                  setPage(1);
                }}
                options={classes.map((item) => ({
                  value: item.id,

                  label: item.name,
                }))}
              />
            </div>

            {/* NGÀY */}
            <div className="filter-item">
              <Text className="filter-label">Ngày điểm danh</Text>

              <DatePicker
                value={selectedDate}
                format="DD/MM/YYYY"
                allowClear={false}
                className="attendance-date"
                suffixIcon={<CalendarOutlined />}
                onChange={(date) => {
                  if (!date) {
                    return;
                  }

                  setSelectedDate(date);

                  setPage(1);
                }}
              />
            </div>

            {/* SEARCH */}
            <div className="filter-item search-filter">
              <Text className="filter-label">Tìm học sinh</Text>

              <Input
                value={searchInput}
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Tên hoặc mã học viên..."
                className="attendance-search"
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* STATUS */}
            <div className="filter-item">
              <Text className="filter-label">Trạng thái</Text>

              <Select
                value={statusFilter}
                className="attendance-status-filter"
                onChange={(value) => {
                  setStatusFilter(value);

                  setPage(1);
                }}
                options={[
                  {
                    value: "all",
                    label: "Tất cả",
                  },
                  {
                    value: "present",
                    label: "Có mặt",
                  },
                  {
                    value: "absent",
                    label: "Vắng",
                  },
                  {
                    value: "late",
                    label: "Đi muộn",
                  },
                  {
                    value: "excused",
                    label: "Có phép",
                  },
                  {
                    value: "not_attended",
                    label: "Chưa điểm danh",
                  },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* =================================================
            TYPE BANNER
        ================================================= */}

        {attendanceType ? (
          <div className={`attendance-type-banner ${attendanceType}`}>
            <div className="type-banner-icon">{currentTypeConfig.icon}</div>

            <div>
              <Text strong>Đang điểm danh: {currentTypeConfig.label}</Text>

              <div>
                <Text type="secondary">{currentTypeConfig.description}</Text>
              </div>
            </div>

            <Tag color={attendanceType === "mass" ? "purple" : "blue"}>
              {dateString}
            </Tag>
          </div>
        ) : (
          <Alert
            style={{ marginTop: 16, borderRadius: 14 }}
            type="info"
            showIcon
            message="Chưa chọn loại điểm danh"
            description="Vui lòng chọn điểm danh Học Giáo lý hoặc Tham dự Thánh lễ để bắt đầu."
          />
        )}

        {/* =================================================
            LOCK
        ================================================= */}

        {isLocked && (
          <Alert
            className="attendance-lock-alert"
            type="warning"
            showIcon
            message="Ngày điểm danh đã qua"
            description="Không thể thực hiện điểm danh hoặc thay đổi dữ liệu của ngày trước."
          />
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <Row gutter={[16, 16]} className="attendance-stat-row">
          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title="Tổng học sinh"
              value={total}
              loading={loadingAttendance}
              icon={<TeamOutlined />}
              iconColor="#FF6B8B"
              description="Tổng số học sinh trong lớp"
            />
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title="Có mặt"
              value={present}
              loading={loadingAttendance}
              icon={<CheckCircleFilled />}
              iconColor="#52B788"
              description="Học sinh có mặt"
            />
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title="Đi muộn"
              value={late}
              loading={loadingAttendance}
              icon={<ClockCircleOutlined />}
              iconColor="#E6A23C"
              description="Học sinh đi muộn"
            />
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title="Vắng"
              value={absent}
              loading={loadingAttendance}
              icon={<CloseCircleFilled />}
              iconColor="#E56B7D"
              description="Học sinh vắng mặt"
            />
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title="Có phép"
              value={excused}
              loading={loadingAttendance}
              icon={<ExclamationCircleOutlined />}
              iconColor="#9274DF"
              description="Học sinh có phép"
            />
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title="Tỷ lệ tham dự"
              value={attendanceRate}
              loading={loadingAttendance}
              icon={<CheckCircleFilled />}
              iconColor="#1677FF"
              description="Tỷ lệ tham dự hôm nay"
              suffix="%"
            />
          </Col>
        </Row>

        {/* =================================================
            MAIN
        ================================================= */}

        <Row gutter={[18, 18]} className="attendance-main-row">
          {/* =================================================
              STUDENT LIST
          ================================================= */}

          <Col xs={24} xl={16}>
            <Card bordered={false} className="student-list-card">
              <div className="student-list-header">
                <div>
                  <Title level={4} className="section-title">
                    Danh sách học sinh
                  </Title>

                  <Text type="secondary">
                    {selectedClass?.name || "Chưa chọn lớp"}

                    {" • "}

                    {currentTypeConfig.shortLabel}

                    {" • "}

                    {dateString}
                  </Text>
                </div>

                <Tag className="total-student-tag">
                  {pagination.total || 0} học sinh
                </Tag>
              </div>

              <div className="attendance-table-wrap">
                <Table
                  rowKey={(record) => record.student_id ?? record.id}
                  columns={columns}
                  dataSource={tableData}
                  loading={loadingAttendance}
                  pagination={false}
                  locale={{
                    emptyText: <Empty description="Không có học sinh" />,
                  }}
                  scroll={{
                    x: 950,
                  }}
                />
              </div>

              <div className="attendance-pagination">
                <Pagination
                  current={pagination.page || page}
                  pageSize={pagination.limit || pageSize}
                  total={pagination.total || 0}
                  showSizeChanger
                  pageSizeOptions={["10", "20", "30", "50"]}
                  showTotal={(totalCount, range) =>
                    `${range[0]}-${range[1]} / ${totalCount} học sinh`
                  }
                  onChange={(nextPage, nextPageSize) => {
                    if (nextPageSize !== pageSize) {
                      setPageSize(nextPageSize);

                      setPage(1);
                    } else {
                      setPage(nextPage);
                    }
                  }}
                />
              </div>
            </Card>
          </Col>

          {/* =================================================
              MODERN QR PANEL
          ================================================= */}

          <Col xs={24} xl={8}>
            <Card bordered={false} className="qr-panel-card">
              {/* HEADER */}
              <div className="qr-modern-header">
                <div className="qr-modern-title">
                  <div className="qr-modern-icon">
                    <QrcodeOutlined />
                  </div>

                  <div className="qr-modern-heading">
                    <span className="qr-modern-title-text">Điểm danh QR</span>

                    <span className="qr-modern-title-sub">
                      {currentTypeConfig.label}
                    </span>
                  </div>
                </div>

                <div
                  className={`qr-live-status ${
                    isQrOpen ? "active" : "inactive"
                  }`}
                >
                  <span className="qr-live-dot" />

                  {isQrOpen ? "Đang quét" : "Chưa bật"}
                </div>
              </div>

              {/* CLASS */}
              <div className="qr-class-card">
                <div className="qr-class-left">
                  <div className="qr-class-icon">
                    <TeamOutlined />
                  </div>

                  <div className="qr-class-info">
                    <span className="qr-class-label">Lớp đang điểm danh</span>

                    <strong className="qr-class-name">
                      {selectedClass?.name || "Chưa chọn lớp"}
                    </strong>
                  </div>
                </div>

                <Tag
                  color={attendanceType === "mass" ? "purple" : "blue"}
                  className="qr-modern-type-tag"
                >
                  {currentTypeConfig.shortLabel}
                </Tag>
              </div>

              {/* DATE */}
              <div className="qr-date-info">
                <CalendarOutlined />

                <span>{dayjs(dateString).format("dddd, DD/MM/YYYY")}</span>
              </div>

              {/* SCANNER */}
              <div
                className={`qr-scanner-box ${isQrOpen ? "scanner-active" : ""}`}
              >
                <QRCodeScanner
                  open={isQrOpen}
                  classId={selectedClassId}
                  attendanceType={attendanceType}
                  onSuccess={handleQRSuccess}
                  onFinishAttendance={handleFinishQRAttendance}
                />

                {!isQrOpen && (
                  <div className="qr-scanner-placeholder">
                    <div className="qr-placeholder-icon">
                      <QrcodeOutlined />
                    </div>

                    <strong>Sẵn sàng điểm danh</strong>

                    <span>Bật camera để bắt đầu quét mã QR</span>
                  </div>
                )}
              </div>

              {/* BUTTON */}
              <Button
                block
                size="large"
                type={isQrOpen ? "default" : "primary"}
                danger={isQrOpen}
                icon={isQrOpen ? <StopOutlined /> : <CameraOutlined />}
                className={`qr-main-button ${isQrOpen ? "qr-stop-button" : ""}`}
                loading={saving && isQrOpen}
                disabled={!selectedClassId || !attendanceType || isLocked}
                onClick={handleToggleQR}
              >
                {isQrOpen ? "Kết thúc điểm danh" : "Bật camera điểm danh"}
              </Button>

              {/* NOTE */}
              <div className="qr-attendance-note">
                <div className="qr-note-icon">
                  <ExclamationCircleOutlined />
                </div>

                <div className="qr-note-content">
                  <strong>Lưu ý</strong>

                  <span>
                    Khi kết thúc điểm danh, học sinh chưa được ghi nhận sẽ tự
                    động chuyển thành Vắng.
                  </span>
                </div>
              </div>

              {/* GUIDE */}
              <div className="qr-guide">
                <div className="qr-guide-title">Trạng thái điểm danh</div>

                <div className="qr-guide-list">
                  <div className="qr-guide-item">
                    <span className="qr-guide-icon present">
                      <CheckOutlined />
                    </span>

                    <span>Có mặt</span>
                  </div>

                  <div className="qr-guide-item">
                    <span className="qr-guide-icon late">
                      <ClockCircleOutlined />
                    </span>

                    <span>Đi muộn</span>
                  </div>

                  <div className="qr-guide-item">
                    <span className="qr-guide-icon absent">
                      <CloseOutlined />
                    </span>

                    <span>Vắng</span>
                  </div>

                  <div className="qr-guide-item">
                    <span className="qr-guide-icon excused">
                      <ExclamationCircleOutlined />
                    </span>

                    <span>Có phép</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* =================================================
            HISTORY MODAL
        ================================================= */}

        <Modal
          open={historyOpen}
          onCancel={() => setHistoryOpen(false)}
          footer={null}
          width={700}
          centered
          title={
            <div className="history-modal-title">
              <HistoryOutlined />

              <span>Lịch sử điểm danh</span>
            </div>
          }
        >
          <div className="history-student">
            <Avatar
              size={46}
              icon={<UserOutlined />}
              src={historyStudent?.avatar || historyStudent?.avatar_url}
            />

            <div>
              <Text strong>
                {historyStudent?.name ||
                  historyStudent?.student_name ||
                  "Học sinh"}
              </Text>

              <Text type="secondary">
                {historyStudent?.code || historyStudent?.student_code || ""}
              </Text>
            </div>
          </div>

          <Table
            rowKey={(record, index) =>
              record.id ||
              `${record.attendance_date}-${record.attendance_type}-${index}`
            }
            columns={historyColumns}
            dataSource={historyData}
            loading={historyLoading}
            pagination={{
              pageSize: 8,
              showSizeChanger: false,
            }}
            locale={{
              emptyText: "Chưa có lịch sử điểm danh",
            }}
          />
        </Modal>
      </div>

      {/* =====================================================
          STYLE
      ===================================================== */}

      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .attendance-page {
          min-height: 100%;
          padding-bottom: 40px;
          background: #fff9fb;
        }


        /* =====================================================
           FILTER
        ===================================================== */

        .attendance-filter-card {
          margin-top: 18px;
          border: 1px solid #f5dfe7 !important;
          border-radius: 18px !important;

          box-shadow:
            0 8px 25px
            rgba(225, 93, 130, 0.06);
        }

        .attendance-filter {
          display: flex;
          align-items: flex-end;
          gap: 14px;
          flex-wrap: wrap;
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 170px;
        }

        .type-filter {
          min-width: 200px;
        }

        .class-filter {
          min-width: 220px;
        }

        .search-filter {
          flex: 1;
          min-width: 220px;
        }

        .filter-label {
          font-size: 12px;
          font-weight: 700;
          color: #8b5363;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .attendance-select,
        .attendance-date,
        .attendance-search,
        .attendance-status-filter,
        .attendance-type-select {
          width: 100%;
        }

        .attendance-select .ant-select-selector,
        .attendance-type-select .ant-select-selector,
        .attendance-status-filter .ant-select-selector,
        .attendance-date,
        .attendance-search {
          min-height: 42px !important;
          border-radius: 12px !important;
          border-color: #f0d9e2 !important;
        }

        .type-option {
          display: flex;
          align-items: center;
          gap: 8px;
        }


        /* =====================================================
           TYPE BANNER
        ===================================================== */

        .attendance-type-banner {
          display: flex;
          align-items: center;
          gap: 14px;

          margin-top: 16px;
          padding: 15px 18px;

          border-radius: 16px;

          background: #fff;

          border: 1px solid #f1dce4;
        }

        .attendance-type-banner.mass {
          border-color: #e5d5ff;
          background: #fbf8ff;
        }

        .attendance-type-banner.catechism {
          border-color: #d7e9ff;
          background: #f8fbff;
        }

        .type-banner-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 42px;
          height: 42px;

          flex-shrink: 0;

          border-radius: 12px;

          color: #fff;
          background: #ff8fab;

          font-size: 20px;
        }

        .attendance-type-banner.mass .type-banner-icon {
          background: #9254de;
        }

        .attendance-type-banner.catechism .type-banner-icon {
          background: #1677ff;
        }

        .attendance-type-banner .ant-tag {
          margin-left: auto;
        }


        /* =====================================================
           LOCK
        ===================================================== */

        .attendance-lock-alert {
          margin-top: 16px;
          border-radius: 14px;
        }


        /* =====================================================
           STATISTICS
        ===================================================== */

        .attendance-stat-row {
          margin-top: 18px;
        }


        /* =====================================================
           MAIN
        ===================================================== */

        .attendance-main-row {
          margin-top: 18px;
        }

        .student-list-card,
        .qr-panel-card {
          height: 100%;

          border-radius: 20px !important;

          border: 1px solid #f4dfe6 !important;

          box-shadow:
            0 8px 25px
            rgba(225, 93, 130, 0.05);
        }

        .student-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 20px;

          border-bottom:
            1px solid #f5e5ea;
        }

        .section-title {
          margin-bottom: 4px !important;
          color: #71384a !important;
        }

        .total-student-tag {
          border-radius: 20px;
          padding: 5px 12px;
          border: none;

          color: #b04464;
          background: #fff0f4;
        }


        /* =====================================================
           STUDENT
        ===================================================== */

        .student-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .student-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .student-name {
          color: #58313d;
        }

        .student-code {
          font-size: 12px;
        }


        /* =====================================================
           MANUAL ATTENDANCE
        ===================================================== */

        .manual-attendance-actions {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          white-space: nowrap;
        }

        .manual-action-btn {
          width: 34px !important;
          height: 34px !important;

          min-width: 34px !important;

          display: inline-flex !important;
          align-items: center;
          justify-content: center;

          padding: 0 !important;

          border-radius: 50% !important;

          border: 1px solid #f0dfe5 !important;

          background: #fff !important;

          box-shadow:
            0 3px 10px
            rgba(100, 60, 75, 0.06);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease,
            border-color 0.18s ease;
        }

        .manual-action-btn .anticon {
          font-size: 15px;
        }


        /* CÓ MẶT */

        .manual-present {
          color: #38a169 !important;
          border-color: #bce8cd !important;
          background: #f2fff6 !important;
        }

        .manual-present:hover:not(:disabled) {
          color: #fff !important;
          border-color: #52b788 !important;
          background: #52b788 !important;

          transform: translateY(-2px);

          box-shadow:
            0 6px 14px
            rgba(82, 183, 136, 0.25);
        }


        /* ĐI MUỘN */

        .manual-late {
          color: #d99432 !important;
          border-color: #f5dfb6 !important;
          background: #fffaf0 !important;
        }

        .manual-late:hover:not(:disabled) {
          color: #fff !important;
          border-color: #e6a23c !important;
          background: #e6a23c !important;

          transform: translateY(-2px);

          box-shadow:
            0 6px 14px
            rgba(230, 162, 60, 0.25);
        }


        /* VẮNG */

        .manual-absent {
          color: #e56b7d !important;
          border-color: #f4cbd3 !important;
          background: #fff5f7 !important;
        }

        .manual-absent:hover:not(:disabled) {
          color: #fff !important;
          border-color: #e56b7d !important;
          background: #e56b7d !important;

          transform: translateY(-2px);

          box-shadow:
            0 6px 14px
            rgba(229, 107, 125, 0.25);
        }


        /* CÓ PHÉP */

        .manual-excused {
          color: #8b6bd6 !important;
          border-color: #ddd2fa !important;
          background: #f8f5ff !important;
        }

        .manual-excused:hover:not(:disabled) {
          color: #fff !important;
          border-color: #9274df !important;
          background: #9274df !important;

          transform: translateY(-2px);

          box-shadow:
            0 6px 14px
            rgba(146, 116, 223, 0.25);
        }


        /* LỊCH SỬ */

        .manual-history {
          color: #7a6570 !important;
          border-color: #eadde2 !important;
          background: #faf7f8 !important;
        }

        .manual-history:hover:not(:disabled) {
          color: #fff !important;
          border-color: #8f7782 !important;
          background: #8f7782 !important;

          transform: translateY(-2px);

          box-shadow:
            0 6px 14px
            rgba(100, 80, 90, 0.18);
        }

        .manual-action-btn:active:not(:disabled) {
          transform: scale(0.92);
        }

        .manual-action-btn:disabled {
          opacity: 0.38 !important;
          cursor: not-allowed !important;

          transform: none !important;

          box-shadow: none !important;
        }


        /* =====================================================
           TABLE
        ===================================================== */

        .attendance-table-wrap {
          overflow-x: auto;
        }

        .attendance-pagination {
          display: flex;
          justify-content: flex-end;

          padding: 18px;

          border-top:
            1px solid #f5e5ea;
        }


        /* =====================================================
           MODERN QR
        ===================================================== */

        .qr-panel-card {
          overflow: hidden;

          border-radius: 22px !important;

          background: #fff !important;

          box-shadow:
            0 12px 35px
            rgba(225, 93, 130, 0.08) !important;
        }

        .qr-modern-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          padding: 20px;

          border-bottom:
            1px solid #f7e9ed;
        }

        .qr-modern-title {
          display: flex;
          align-items: center;

          gap: 12px;

          min-width: 0;
        }

        .qr-modern-icon {
          width: 46px;
          height: 46px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          color: #fff;

          background:
            linear-gradient(
              135deg,
              #ff6b8b,
              #ff9eb2
            );

          font-size: 21px;

          box-shadow:
            0 7px 18px
            rgba(255, 107, 139, 0.22);
        }

        .qr-modern-heading {
          display: flex;
          flex-direction: column;

          gap: 3px;

          min-width: 0;
        }

        .qr-modern-title-text {
          color: #55313d;

          font-size: 16px;
          font-weight: 800;
        }

        .qr-modern-title-sub {
          color: #a48791;

          font-size: 12px;
        }


        /* STATUS */

        .qr-live-status {
          display: flex;
          align-items: center;

          gap: 6px;

          flex-shrink: 0;

          padding: 6px 10px;

          border-radius: 20px;

          font-size: 11px;
          font-weight: 700;
        }

        .qr-live-status.active {
          color: #32945b;
          background: #edfff4;
        }

        .qr-live-status.inactive {
          color: #9b7d87;
          background: #f8f4f6;
        }

        .qr-live-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: currentColor;
        }

        .qr-live-status.active .qr-live-dot {
          animation:
            qrPulse 1.5s infinite;
        }

        @keyframes qrPulse {
          0% {
            box-shadow:
              0 0 0 0
              rgba(
                82,
                183,
                136,
                0.35
              );
          }

          70% {
            box-shadow:
              0 0 0 6px
              rgba(
                82,
                183,
                136,
                0
              );
          }

          100% {
            box-shadow:
              0 0 0 0
              rgba(
                82,
                183,
                136,
                0
              );
          }
        }


        /* CLASS */

        .qr-class-card {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;

          margin: 16px;

          padding: 13px;

          border-radius: 15px;

          background: #fff8fa;

          border:
            1px solid #f5e1e7;
        }

        .qr-class-left {
          display: flex;
          align-items: center;

          gap: 10px;

          min-width: 0;
        }

        .qr-class-icon {
          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          color: #ff6b8b;

          background: #ffeaf0;

          font-size: 16px;
        }

        .qr-class-info {
          display: flex;
          flex-direction: column;

          min-width: 0;
        }

        .qr-class-label {
          color: #a48a94;

          font-size: 10px;
          font-weight: 600;
        }

        .qr-class-name {
          max-width: 170px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color: #55313d;

          font-size: 14px;
        }

        .qr-modern-type-tag {
          flex-shrink: 0;

          margin: 0 !important;

          border: none !important;

          border-radius: 8px !important;

          font-size: 10px;
          font-weight: 700;
        }


        /* DATE */

        .qr-date-info {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          margin: 0 16px 13px;

          color: #987e88;

          font-size: 12px;
        }

        .qr-date-info .anticon {
          color: #ff8fab;
        }


        /* SCANNER */

        .qr-scanner-box {
          position: relative;

          min-height: 260px;

          margin: 0 16px 14px;

          overflow: hidden;

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              #fff7fa,
              #fffafd
            );

          border:
            1px dashed #efcdd8;
        }

        .qr-scanner-box.scanner-active {
          border-style: solid;

          border-color: #ff9eb2;

          box-shadow:
            inset 0 0 0 1px
            rgba(
              255,
              107,
              139,
              0.08
            );
        }


        /* PLACEHOLDER */

        .qr-scanner-placeholder {
          position: absolute;

          inset: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-direction: column;

          gap: 7px;

          text-align: center;
        }

        .qr-placeholder-icon {
          width: 64px;
          height: 64px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 4px;

          border-radius: 20px;

          color: #ff6b8b;

          background: #ffeaf0;

          font-size: 30px;

          box-shadow:
            0 8px 20px
            rgba(
              255,
              107,
              139,
              0.12
            );
        }

        .qr-scanner-placeholder strong {
          color: #55313d;

          font-size: 14px;
        }

        .qr-scanner-placeholder span {
          max-width: 220px;

          color: #a58b95;

          font-size: 11px;

          line-height: 1.5;
        }


        /* BUTTON */

        .qr-main-button {
          height: 46px !important;

          margin: 0 16px;

          width:
            calc(100% - 32px) !important;

          border-radius: 13px !important;

          font-weight: 700;

          box-shadow:
            0 7px 18px
            rgba(
              255,
              107,
              139,
              0.18
            );
        }

        .qr-main-button.ant-btn-primary {
          border: none;

          background:
            linear-gradient(
              135deg,
              #ff6b8b,
              #ff8fab
            );
        }

        .qr-main-button.ant-btn-primary:hover {
          background:
            linear-gradient(
              135deg,
              #ff5d80,
              #ff7f9f
            ) !important;
        }

        .qr-stop-button {
          box-shadow: none !important;
        }


        /* NOTE */

        .qr-attendance-note {
          display: flex;
          align-items: flex-start;

          gap: 9px;

          margin: 14px 16px;

          padding: 11px 12px;

          border-radius: 12px;

          background: #fffbf2;

          border:
            1px solid #f6e6bf;
        }

        .qr-note-icon {
          flex-shrink: 0;

          color: #d99a37;

          font-size: 15px;
        }

        .qr-note-content {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .qr-note-content strong {
          color: #80602d;

          font-size: 11px;
        }

        .qr-note-content span {
          color: #9b8662;

          font-size: 10px;

          line-height: 1.5;
        }


        /* GUIDE */

        .qr-guide {
          padding:
            15px 16px 17px;

          border-top:
            1px solid #f7e9ed;
        }

        .qr-guide-title {
          margin-bottom: 9px;

          color: #775563;

          font-size: 11px;
          font-weight: 800;
        }

        .qr-guide-list {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 7px;
        }

        .qr-guide-item {
          display: flex;
          align-items: center;
          justify-content: center;

          flex-direction: column;

          gap: 5px;

          padding: 8px 3px;

          border-radius: 10px;

          background: #fff9fb;

          color: #8e7580;

          font-size: 9px;
          font-weight: 600;
        }

        .qr-guide-icon {
          width: 25px;
          height: 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          font-size: 11px;
        }

        .qr-guide-icon.present {
          color: #3da568;
          background: #eafff1;
        }

        .qr-guide-icon.late {
          color: #d89732;
          background: #fff5df;
        }

        .qr-guide-icon.absent {
          color: #df697c;
          background: #fff0f3;
        }

        .qr-guide-icon.excused {
          color: #8d6bd4;
          background: #f3efff;
        }


        /* =====================================================
           HISTORY
        ===================================================== */

        .history-modal-title {
          display: flex;
          align-items: center;

          gap: 8px;

          color: #71384a;
        }

        .history-student {
          display: flex;
          align-items: center;

          gap: 12px;

          margin-bottom: 18px;

          padding: 12px;

          border-radius: 13px;

          background: #fff8fa;

          border:
            1px solid #f5dfe7;
        }

        .history-student > div {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767px) {

          .attendance-filter {
            display: grid;

            grid-template-columns:
              1fr;
          }

          .filter-item,
          .type-filter,
          .class-filter,
          .search-filter {
            width: 100%;
            min-width: 0;
          }

          .attendance-type-banner {
            align-items: flex-start;
          }

          .attendance-type-banner .ant-tag {
            display: none;
          }

          .student-list-header {
            padding: 16px;
          }

          .attendance-pagination {
            justify-content: center;

            overflow-x: auto;
          }

          .manual-attendance-actions {
            min-width: 205px;

            gap: 6px;
          }

          .manual-action-btn {
            width: 32px !important;
            height: 32px !important;

            min-width: 32px !important;
          }

          .manual-action-btn .anticon {
            font-size: 14px;
          }

          .qr-modern-header {
            padding: 16px;
          }

          .qr-modern-icon {
            width: 42px;
            height: 42px;
          }

          .qr-live-status {
            font-size: 10px;
          }

          .qr-class-card {
            margin: 14px;
          }

          .qr-scanner-box {
            min-height: 240px;
          }

          .qr-guide-list {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

      `}</style>
    </ConfigProvider>
  );
};

export default AttendancePage;
