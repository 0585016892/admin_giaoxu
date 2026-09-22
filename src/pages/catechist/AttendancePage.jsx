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
import AppSearchInput from "../../components/common/SearchInput";
import AppButton from "../../components/common/AppButton";
import attendanceApi from "../../api/attendanceApi";
import classApi from "../../api/classApi";

const { Text, Title } = Typography;

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  navyLight: "#EEF3F7",

  gold: "#D9A441",
  goldLight: "#FBF5E7",

  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#173B5E",
  textSecondary: "#64748B",
  muted: "#94A3B8",

  border: "#E2E8F0",

  success: "#2E7D5B",
  successBg: "#EAF6F0",

  warning: "#B7791F",
  warningBg: "#FFF7E5",

  gray: "#64748B",
  grayBg: "#F1F5F9",

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

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
     EFFECT
  ======================================================= */

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());

      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

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
     QR
  ======================================================= */

  const handleQRSuccess = useCallback(
    async (data) => {
      await loadAttendance();

      return data;
    },
    [loadAttendance],
  );

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
        width: 165,
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
        width: 110,
        align: "center",

        render: (_, record) => {
          if (!record.check_in_time) {
            return <Text type="secondary">—</Text>;
          }

          return <Text strong>{String(record.check_in_time).slice(0, 5)}</Text>;
        },
      },

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
              <Tooltip title="Có mặt">
                <Button
                  className="manual-action-btn manual-present"
                  shape="circle"
                  icon={<CheckOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "present")}
                />
              </Tooltip>

              <Tooltip title="Đi muộn">
                <Button
                  className="manual-action-btn manual-late"
                  shape="circle"
                  icon={<ClockCircleOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "late")}
                />
              </Tooltip>

              <Tooltip title="Vắng">
                <Button
                  className="manual-action-btn manual-absent"
                  shape="circle"
                  icon={<CloseOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "absent")}
                />
              </Tooltip>

              <Tooltip title="Có phép">
                <Button
                  className="manual-action-btn manual-excused"
                  shape="circle"
                  icon={<ExclamationCircleOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "excused")}
                />
              </Tooltip>

              <Tooltip title="Xem lịch sử">
                <Button
                  className="manual-action-btn manual-history"
                  shape="circle"
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
          colorPrimary: COLORS.navy,

          colorInfo: COLORS.navy,

          colorSuccess: COLORS.success,

          colorWarning: COLORS.warning,

          colorError: COLORS.danger,

          colorText: COLORS.text,

          colorTextSecondary: COLORS.textSecondary,

          colorBorder: COLORS.border,

          colorBgContainer: COLORS.white,

          borderRadius: 12,

          fontFamily: "'Be Vietnam Pro', 'Inter', Arial, sans-serif",
        },

        components: {
          Table: {
            headerBg: COLORS.navyLight,

            headerColor: COLORS.navy,

            rowHoverBg: "#F8FAFC",

            borderColor: COLORS.border,
          },

          Select: {
            optionSelectedBg: COLORS.navyLight,
          },

          Button: {
            primaryShadow: "0 6px 16px rgba(23, 59, 94, 0.18)",
          },

          Card: {
            colorBorderSecondary: COLORS.border,
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
          <div className="filter-header">
            <div>
              <Title level={5} className="filter-title">
                Bộ lọc điểm danh
              </Title>

              <Text type="secondary">Chọn lớp, ngày và loại điểm danh</Text>
            </div>

            <div className="filter-header-icon">
              <SearchOutlined />
            </div>
          </div>

          <div className="attendance-filter">
            <div className="filter-item type-filter">
              <Text className="filter-label">
                Loại điểm danh
                <span className="required">*</span>
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
                        <span className="type-option-icon catechism">
                          <BookOutlined />
                        </span>

                        <span>Học Giáo lý</span>
                      </div>
                    ),
                  },

                  {
                    value: "mass",

                    label: (
                      <div className="type-option">
                        <span className="type-option-icon mass">
                          <HeartOutlined />
                        </span>

                        <span>Tham dự Thánh lễ</span>
                      </div>
                    ),
                  },
                ]}
              />
            </div>

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

            <div className="filter-item date-filter">
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

            <div className="filter-item search-filter">
              <Text className="filter-label">Tìm học sinh</Text>
              <AppSearchInput
                value={searchInput}
                onChange={(value) => {
                  setSearchInput(value);
                }}
                placeholder="Tên hoặc mã học viên..."
              />
            </div>

            <div className="filter-item status-filter">
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
            <div className="type-banner-left">
              <div className="type-banner-icon">{currentTypeConfig.icon}</div>

              <div className="type-banner-content">
                <Text strong>Đang điểm danh {currentTypeConfig.label}</Text>

                <span>{currentTypeConfig.description}</span>
              </div>
            </div>

            <div className="type-banner-meta">
              <span className="banner-class">
                <TeamOutlined />
                {selectedClass?.name || "Chưa chọn lớp"}
              </span>

              <span className="banner-date">
                <CalendarOutlined />
                {dayjs(dateString).format("DD/MM/YYYY")}
              </span>
            </div>
          </div>
        ) : (
          <Alert
            style={{
              marginTop: 16,
              borderRadius: 14,
            }}
            type="info"
            showIcon
            message="Chưa chọn loại điểm danh"
            description="Vui lòng chọn Học Giáo lý hoặc Tham dự Thánh lễ để bắt đầu."
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
              title="Tổng "
              value={total}
              loading={loadingAttendance}
              icon={<TeamOutlined />}
              iconColor={COLORS.navy}
              description="Học sinh trong lớp"
            />
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title="Có mặt"
              value={present}
              loading={loadingAttendance}
              icon={<CheckCircleFilled />}
              iconColor={COLORS.success}
              description="Học sinh có mặt"
            />
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title="Đi muộn"
              value={late}
              loading={loadingAttendance}
              icon={<ClockCircleOutlined />}
              iconColor={COLORS.gold}
              description="Học sinh đi muộn"
            />
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title="Vắng"
              value={absent}
              loading={loadingAttendance}
              icon={<CloseCircleFilled />}
              iconColor={COLORS.danger}
              description="Học sinh vắng mặt"
            />
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title="Có phép"
              value={excused}
              loading={loadingAttendance}
              icon={<ExclamationCircleOutlined />}
              iconColor="#7C5AC2"
              description="Học sinh có phép"
            />
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title="Tỷ lệ tham dự"
              value={attendanceRate}
              loading={loadingAttendance}
              icon={<CheckCircleFilled />}
              iconColor={COLORS.navy}
              description="Tỷ lệ tham dự"
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
                <div className="student-list-heading">
                  <div className="section-heading-icon">
                    <TeamOutlined />
                  </div>

                  <div>
                    <Title level={4} className="section-title">
                      Danh sách học sinh
                    </Title>

                    <Text type="secondary">
                      {selectedClass?.name || "Chưa chọn lớp"}

                      {" • "}

                      {currentTypeConfig.shortLabel}

                      {" • "}

                      {dayjs(dateString).format("DD/MM/YYYY")}
                    </Text>
                  </div>
                </div>

                <div className="total-student-tag">
                  <strong>{pagination.total || 0}</strong>

                  <span>học sinh</span>
                </div>
              </div>

              <div className="table-toolbar">
                <div className="table-toolbar-left">
                  <span className="toolbar-dot" />

                  <span>Nhấn vào nút trạng thái để điểm danh thủ công</span>
                </div>

                <div className="toolbar-legend">
                  <span>
                    <i className="legend-dot present" />
                    Có mặt
                  </span>

                  <span>
                    <i className="legend-dot late" />
                    Đi muộn
                  </span>

                  <span>
                    <i className="legend-dot absent" />
                    Vắng
                  </span>
                </div>
              </div>

              <div className="attendance-table-wrap">
                <Table
                  rowKey={(record) => record.student_id ?? record.id}
                  columns={columns}
                  dataSource={tableData}
                  loading={loadingAttendance}
                  pagination={false}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có học sinh"
                      />
                    ),
                  }}
                  scroll={{
                    x: 900,
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
              QR PANEL
          ================================================= */}

          <Col xs={24} xl={8}>
            <Card bordered={false} className="qr-panel-card">
              <div className="qr-modern-header">
                <div className="qr-modern-title">
                  <div className="qr-modern-icon">
                    <QrcodeOutlined />
                  </div>

                  <div className="qr-modern-heading">
                    <span className="qr-modern-title-text">Điểm danh QR</span>

                    <span className="qr-modern-title-sub">
                      Quét mã QR học viên
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

                <Tag className="qr-modern-type-tag">
                  {currentTypeConfig.shortLabel}
                </Tag>
              </div>

              <div className="qr-date-info">
                <CalendarOutlined />

                <span>{dayjs(dateString).format("dddd, DD/MM/YYYY")}</span>
              </div>

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

              <AppButton
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
              </AppButton>

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
          width={720}
          centered
          title={
            <div className="history-modal-title">
              <div className="history-modal-icon">
                <HistoryOutlined />
              </div>

              <div>
                <strong>Lịch sử điểm danh</strong>

                <span>Theo dõi quá trình tham dự</span>
              </div>
            </div>
          }
        >
          <div className="history-student">
            <Avatar
              size={52}
              icon={<UserOutlined />}
              src={historyStudent?.avatar || historyStudent?.avatar_url}
            />

            <div className="history-student-info">
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
          CSS
      ===================================================== */}

      <style>{`

        /* =====================================================
           GLOBAL
        ===================================================== */

        .attendance-page {
          min-height: 100%;
          padding: 0 0 40px;
          background: ${COLORS.background};
        }

        .required {
          color: ${COLORS.danger};
          margin-left: 3px;
        }


        /* =====================================================
           FILTER CARD
        ===================================================== */

        .attendance-filter-card {
          margin-top: 20px;

          border: 1px solid ${COLORS.border} !important;

          border-radius: 18px !important;

          background: ${COLORS.white};

          box-shadow:
            0 8px 24px
            rgba(23, 59, 94, 0.05);
        }

        .filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 18px;

          padding-bottom: 16px;

          border-bottom:
            1px solid ${COLORS.border};
        }

        .filter-title {
          margin: 0 0 3px !important;

          color: ${COLORS.navy} !important;

          font-weight: 800 !important;
        }

        .filter-header-icon {
          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          color: ${COLORS.navy};

          background: ${COLORS.navyLight};

          font-size: 17px;
        }

        .attendance-filter {
          display: grid;

          grid-template-columns:
            1.15fr
            1.15fr
            0.95fr
            1.5fr
            0.9fr;

          gap: 14px;

          align-items: end;
        }

        .filter-item {
          display: flex;
          flex-direction: column;

          gap: 7px;

          min-width: 0;
        }

        .filter-label {
          font-size: 11px;

          font-weight: 800;

          color: ${COLORS.textSecondary};

          text-transform: uppercase;

          letter-spacing: 0.35px;
        }

        .attendance-select,
        .attendance-type-select,
        .attendance-status-filter,
        .attendance-date,
        .attendance-search {
          width: 100%;
        }

        .attendance-select .ant-select-selector,
        .attendance-type-select .ant-select-selector,
        .attendance-status-filter .ant-select-selector,
        .attendance-date,
        .attendance-search {
          min-height: 42px !important;

          border-radius: 10px !important;

          border-color:
            ${COLORS.border} !important;

          box-shadow: none !important;
        }

        .attendance-select:hover .ant-select-selector,
        .attendance-type-select:hover .ant-select-selector,
        .attendance-status-filter:hover .ant-select-selector,
        .attendance-search:hover,
        .attendance-date:hover {
          border-color:
            ${COLORS.navy} !important;
        }

        .attendance-select.ant-select-focused
          .ant-select-selector,
        .attendance-type-select.ant-select-focused
          .ant-select-selector,
        .attendance-status-filter.ant-select-focused
          .ant-select-selector {
          border-color:
            ${COLORS.navy} !important;

          box-shadow:
            0 0 0 2px
            rgba(23, 59, 94, 0.08) !important;
        }

        .attendance-search:focus,
        .attendance-date:focus {
          border-color:
            ${COLORS.navy} !important;

          box-shadow:
            0 0 0 2px
            rgba(23, 59, 94, 0.08) !important;
        }

        .type-option {
          display: flex;

          align-items: center;

          gap: 8px;
        }

        .type-option-icon {
          width: 25px;
          height: 25px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          border-radius: 7px;

          font-size: 12px;
        }

        .type-option-icon.catechism {
          color: ${COLORS.navy};

          background:
            ${COLORS.navyLight};
        }

        .type-option-icon.mass {
          color: #7045a5;

          background: #f2ecfb;
        }


        /* =====================================================
           TYPE BANNER
        ===================================================== */

        .attendance-type-banner {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          margin-top: 16px;

          padding: 15px 18px;

          border-radius: 15px;

          border: 1px solid
            ${COLORS.border};

          background:
            ${COLORS.white};

          box-shadow:
            0 5px 16px
            rgba(23, 59, 94, 0.035);
        }

        .attendance-type-banner.catechism {
          border-left:
            4px solid ${COLORS.navy};
        }

        .attendance-type-banner.mass {
          border-left:
            4px solid ${COLORS.gold};
        }

        .type-banner-left {
          display: flex;

          align-items: center;

          gap: 12px;

          min-width: 0;
        }

        .type-banner-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 11px;

          font-size: 18px;
        }

        .attendance-type-banner.catechism
          .type-banner-icon {
          color: ${COLORS.navy};

          background:
            ${COLORS.navyLight};
        }

        .attendance-type-banner.mass
          .type-banner-icon {
          color: ${COLORS.warning};

          background:
            ${COLORS.goldLight};
        }

        .type-banner-content {
          display: flex;

          flex-direction: column;

          gap: 3px;
        }

        .type-banner-content strong {
          color: ${COLORS.navy};

          font-size: 14px;
        }

        .type-banner-content span {
          color: ${COLORS.textSecondary};

          font-size: 11px;
        }

        .type-banner-meta {
          display: flex;

          align-items: center;

          gap: 18px;

          color: ${COLORS.textSecondary};

          font-size: 12px;

          white-space: nowrap;
        }

        .banner-class,
        .banner-date {
          display: inline-flex;

          align-items: center;

          gap: 6px;
        }

        .banner-class .anticon,
        .banner-date .anticon {
          color: ${COLORS.gold};
        }


        /* =====================================================
           ALERT
        ===================================================== */

        .attendance-lock-alert {
          margin-top: 16px;

          border-radius: 13px;
        }


        /* =====================================================
           STAT
        ===================================================== */

        .attendance-stat-row {
          margin-top: 18px;
        }


        /* =====================================================
           MAIN CARDS
        ===================================================== */

        .attendance-main-row {
          margin-top: 18px;
        }

        .student-list-card,
        .qr-panel-card {
          height: 100%;

          border-radius: 18px !important;

          border:
            1px solid
            ${COLORS.border} !important;

          background:
            ${COLORS.white} !important;

          box-shadow:
            0 8px 26px
            rgba(23, 59, 94, 0.05) !important;
        }


        /* =====================================================
           STUDENT HEADER
        ===================================================== */

        .student-list-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding: 20px;

          border-bottom:
            1px solid
            ${COLORS.border};
        }

        .student-list-heading {
          display: flex;

          align-items: center;

          gap: 12px;
        }

        .section-heading-icon {
          width: 42px;
          height: 42px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 11px;

          color: ${COLORS.navy};

          background:
            ${COLORS.navyLight};

          font-size: 18px;
        }

        .section-title {
          margin:
            0 0 3px !important;

          color:
            ${COLORS.navy} !important;

          font-size: 17px !important;

          font-weight: 800 !important;
        }

        .total-student-tag {
          display: flex;

          align-items: baseline;

          gap: 4px;

          padding: 7px 12px;

          border-radius: 9px;

          color: ${COLORS.navy};

          background:
            ${COLORS.navyLight};

          white-space: nowrap;
        }

        .total-student-tag strong {
          font-size: 15px;
        }

        .total-student-tag span {
          font-size: 10px;

          font-weight: 600;
        }


        /* =====================================================
           TOOLBAR
        ===================================================== */

        .table-toolbar {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding:
            10px 20px;

          background:
            #FAFBFC;

          border-bottom:
            1px solid
            ${COLORS.border};
        }

        .table-toolbar-left {
          display: flex;

          align-items: center;

          gap: 7px;

          color:
            ${COLORS.muted};

          font-size: 10px;
        }

        .toolbar-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background:
            ${COLORS.gold};
        }

        .toolbar-legend {
          display: flex;

          align-items: center;

          gap: 12px;

          font-size: 10px;

          color:
            ${COLORS.textSecondary};
        }

        .toolbar-legend span {
          display: flex;

          align-items: center;

          gap: 4px;
        }

        .legend-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;
        }

        .legend-dot.present {
          background:
            ${COLORS.success};
        }

        .legend-dot.late {
          background:
            ${COLORS.gold};
        }

        .legend-dot.absent {
          background:
            ${COLORS.danger};
        }


        /* =====================================================
           TABLE
        ===================================================== */

        .attendance-table-wrap {
          overflow-x: auto;
        }

        .attendance-table-wrap
          .ant-table {
          font-size: 13px;
        }

        .attendance-table-wrap
          .ant-table-thead
          > tr
          > th {
          height: 46px;

          padding:
            10px 16px;

          color:
            ${COLORS.navy};

          background:
            ${COLORS.navyLight} !important;

          border-bottom:
            1px solid
            ${COLORS.border};

          font-size: 10px;

          font-weight: 800;

          letter-spacing:
            0.3px;
        }

        .attendance-table-wrap
          .ant-table-tbody
          > tr
          > td {
          padding:
            12px 16px;

          border-bottom:
            1px solid
            #EEF2F5;
        }

        .attendance-table-wrap
          .ant-table-tbody
          > tr:hover
          > td {
          background:
            #F8FAFC !important;
        }


        /* =====================================================
           STUDENT
        ===================================================== */

        .student-cell {
          display: flex;

          align-items: center;

          gap: 11px;
        }

        .student-avatar {
          flex-shrink: 0;

          border:
            2px solid
            ${COLORS.navyLight};
        }

        .student-info {
          display: flex;

          flex-direction: column;

          gap: 2px;

          min-width: 0;
        }

        .student-name {
          color:
            ${COLORS.text};

          font-size: 13px;
        }

        .student-code {
          color:
            ${COLORS.muted};

          font-size: 10px;
        }

        .attendance-status-tag {
          min-width: 105px;

          padding:
            4px 8px;

          border-radius: 7px;

          font-size: 10px;

          font-weight: 700;
        }


        /* =====================================================
           MANUAL ACTION
        ===================================================== */

        .manual-attendance-actions {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          white-space: nowrap;
        }

        .manual-action-btn {
          width: 32px !important;
          height: 32px !important;

          min-width: 32px !important;

          display: inline-flex !important;

          align-items: center;
          justify-content: center;

          padding: 0 !important;

          border-radius: 9px !important;

          border:
            1px solid
            ${COLORS.border} !important;

          background:
            ${COLORS.white} !important;

          box-shadow: none !important;

          transition:
            all 0.18s ease;
        }

        .manual-action-btn:hover:not(:disabled) {
          transform:
            translateY(-2px);

          box-shadow:
            0 5px 12px
            rgba(23, 59, 94, 0.12) !important;
        }

        .manual-present {
          color:
            ${COLORS.success} !important;

          border-color:
            #B9DEC9 !important;

          background:
            ${COLORS.successBg} !important;
        }

        .manual-present:hover:not(:disabled) {
          color:
            ${COLORS.white} !important;

          background:
            ${COLORS.success} !important;

          border-color:
            ${COLORS.success} !important;
        }

        .manual-late {
          color:
            ${COLORS.warning} !important;

          border-color:
            #E9D18D !important;

          background:
            ${COLORS.goldLight} !important;
        }

        .manual-late:hover:not(:disabled) {
          color:
            ${COLORS.white} !important;

          background:
            ${COLORS.gold} !important;

          border-color:
            ${COLORS.gold} !important;
        }

        .manual-absent {
          color:
            ${COLORS.danger} !important;

          border-color:
            #E9C4C0 !important;

          background:
            ${COLORS.dangerBg} !important;
        }

        .manual-absent:hover:not(:disabled) {
          color:
            ${COLORS.white} !important;

          background:
            ${COLORS.danger} !important;

          border-color:
            ${COLORS.danger} !important;
        }

        .manual-excused {
          color:
            #7052B4 !important;

          border-color:
            #D8CDEF !important;

          background:
            #F4F0FB !important;
        }

        .manual-excused:hover:not(:disabled) {
          color:
            ${COLORS.white} !important;

          background:
            #7052B4 !important;

          border-color:
            #7052B4 !important;
        }

        .manual-history {
          color:
            ${COLORS.navy} !important;

          border-color:
            #C9D7E3 !important;

          background:
            ${COLORS.navyLight} !important;
        }

        .manual-history:hover:not(:disabled) {
          color:
            ${COLORS.white} !important;

          background:
            ${COLORS.navy} !important;

          border-color:
            ${COLORS.navy} !important;
        }

        .manual-action-btn:disabled {
          opacity: 0.35 !important;

          cursor:
            not-allowed !important;

          transform:
            none !important;
        }


        /* =====================================================
           PAGINATION
        ===================================================== */

        .attendance-pagination {
          display: flex;

          justify-content: flex-end;

          padding:
            17px 20px;

          border-top:
            1px solid
            ${COLORS.border};
        }

        .attendance-pagination
          .ant-pagination-item-active {
          border-color:
            ${COLORS.navy};
        }

        .attendance-pagination
          .ant-pagination-item-active
          a {
          color:
            ${COLORS.navy};
        }


        /* =====================================================
           QR PANEL
        ===================================================== */

        .qr-panel-card {
          overflow: hidden;
        }

        .qr-modern-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 12px;

          padding:
            20px;

          border-bottom:
            1px solid
            ${COLORS.border};
        }

        .qr-modern-title {
          display: flex;

          align-items: center;

          gap: 11px;
        }

        .qr-modern-icon {
          width: 44px;
          height: 44px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 11px;

          color:
            ${COLORS.navy};

          background:
            ${COLORS.navyLight};

          border:
            1px solid
            #D7E2EB;

          font-size: 20px;
        }

        .qr-modern-heading {
          display: flex;

          flex-direction: column;

          gap: 2px;
        }

        .qr-modern-title-text {
          color:
            ${COLORS.navy};

          font-size: 16px;

          font-weight: 800;
        }

        .qr-modern-title-sub {
          color:
            ${COLORS.muted};

          font-size: 10px;
        }


        /* =====================================================
           QR STATUS
        ===================================================== */

        .qr-live-status {
          display: flex;

          align-items: center;

          gap: 6px;

          padding:
            5px 9px;

          border-radius: 20px;

          font-size: 10px;

          font-weight: 700;
        }

        .qr-live-status.active {
          color:
            ${COLORS.success};

          background:
            ${COLORS.successBg};
        }

        .qr-live-status.inactive {
          color:
            ${COLORS.gray};

          background:
            ${COLORS.grayBg};
        }

        .qr-live-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background:
            currentColor;
        }

        .qr-live-status.active
          .qr-live-dot {
          animation:
            qrPulse 1.5s infinite;
        }

        @keyframes qrPulse {
          0% {
            box-shadow:
              0 0 0 0
              rgba(
                46,
                125,
                91,
                0.3
              );
          }

          70% {
            box-shadow:
              0 0 0 6px
              rgba(
                46,
                125,
                91,
                0
              );
          }

          100% {
            box-shadow:
              0 0 0 0
              rgba(
                46,
                125,
                91,
                0
              );
          }
        }


        /* =====================================================
           QR CLASS
        ===================================================== */

        .qr-class-card {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;

          margin:
            16px;

          padding:
            12px;

          border-radius: 12px;

          background:
            ${COLORS.navyLight};

          border:
            1px solid
            #DDE7EF;
        }

        .qr-class-left {
          display: flex;

          align-items: center;

          gap: 10px;

          min-width: 0;
        }

        .qr-class-icon {
          width: 36px;
          height: 36px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 9px;

          color:
            ${COLORS.navy};

          background:
            ${COLORS.white};

          font-size: 15px;
        }

        .qr-class-info {
          display: flex;

          flex-direction: column;

          min-width: 0;

          gap: 2px;
        }

        .qr-class-label {
          color:
            ${COLORS.muted};

          font-size: 9px;
        }

        .qr-class-name {
          max-width: 180px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color:
            ${COLORS.navy};

          font-size: 13px;
        }

        .qr-modern-type-tag {
          flex-shrink: 0;

          margin: 0 !important;

          border: none !important;

          border-radius: 7px !important;

          color:
            ${COLORS.navy} !important;

          background:
            ${COLORS.white} !important;

          font-size: 9px;

          font-weight: 700;
        }


        /* =====================================================
           QR DATE
        ===================================================== */

        .qr-date-info {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 6px;

          margin:
            0 16px 13px;

          color:
            ${COLORS.textSecondary};

          font-size: 11px;
        }

        .qr-date-info .anticon {
          color:
            ${COLORS.gold};
        }


        /* =====================================================
           QR SCANNER
        ===================================================== */

        .qr-scanner-box {
          position: relative;

          min-height: 260px;

          margin:
            0 16px 14px;

          overflow: hidden;

          border-radius: 15px;

          background:
            ${COLORS.background};

          border:
            1px dashed
            #C9D6E0;
        }

        .qr-scanner-box.scanner-active {
          border:
            1px solid
            ${COLORS.navy};

          box-shadow:
            inset 0 0 0 1px
            rgba(
              23,
              59,
              94,
              0.06
            );
        }


        /* =====================================================
           QR PLACEHOLDER
        ===================================================== */

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
          width: 60px;
          height: 60px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-bottom: 4px;

          border-radius: 16px;

          color:
            ${COLORS.navy};

          background:
            ${COLORS.navyLight};

          border:
            1px solid
            #D4E0E9;

          font-size: 28px;
        }

        .qr-scanner-placeholder strong {
          color:
            ${COLORS.navy};

          font-size: 13px;
        }

        .qr-scanner-placeholder span {
          max-width: 230px;

          color:
            ${COLORS.muted};

          font-size: 10px;

          line-height: 1.5;
        }


        /* =====================================================
           QR BUTTON
        ===================================================== */

        .qr-main-button {
          height: 44px !important;

          width:
            calc(100% - 32px) !important;

          margin:
            0 16px;

          border-radius: 10px !important;

          font-weight: 700;

          box-shadow:
            0 6px 15px
            rgba(
              23,
              59,
              94,
              0.14
            );
        }

        .qr-main-button.ant-btn-primary {
          border-color:
            ${COLORS.navy} !important;

          background:
            ${COLORS.navy} !important;
        }

        .qr-main-button.ant-btn-primary:hover {
          border-color:
            ${COLORS.navyHover} !important;

          background:
            ${COLORS.navyHover} !important;
        }

        .qr-stop-button {
          box-shadow: none !important;
        }


        /* =====================================================
           QR NOTE
        ===================================================== */

        .qr-attendance-note {
          display: flex;

          align-items: flex-start;

          gap: 9px;

          margin:
            14px 16px;

          padding:
            11px 12px;

          border-radius: 10px;

          background:
            ${COLORS.goldLight};

          border:
            1px solid
            #EBDCA8;
        }

        .qr-note-icon {
          flex-shrink: 0;

          color:
            ${COLORS.warning};

          font-size: 14px;
        }

        .qr-note-content {
          display: flex;

          flex-direction: column;

          gap: 2px;
        }

        .qr-note-content strong {
          color:
            #805F1C;

          font-size: 10px;
        }

        .qr-note-content span {
          color:
            #92773D;

          font-size: 9px;

          line-height: 1.5;
        }


        /* =====================================================
           QR GUIDE
        ===================================================== */

        .qr-guide {
          padding:
            15px 16px 17px;

          border-top:
            1px solid
            ${COLORS.border};
        }

        .qr-guide-title {
          margin-bottom: 9px;

          color:
            ${COLORS.navy};

          font-size: 10px;

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

          padding:
            8px 3px;

          border-radius: 8px;

          background:
            ${COLORS.background};

          color:
            ${COLORS.textSecondary};

          font-size: 9px;

          font-weight: 600;
        }

        .qr-guide-icon {
          width: 25px;
          height: 25px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 7px;

          font-size: 11px;
        }

        .qr-guide-icon.present {
          color:
            ${COLORS.success};

          background:
            ${COLORS.successBg};
        }

        .qr-guide-icon.late {
          color:
            ${COLORS.warning};

          background:
            ${COLORS.warningBg};
        }

        .qr-guide-icon.absent {
          color:
            ${COLORS.danger};

          background:
            ${COLORS.dangerBg};
        }

        .qr-guide-icon.excused {
          color:
            #7052B4;

          background:
            #F1EEFA;
        }


        /* =====================================================
           HISTORY MODAL
        ===================================================== */

        .history-modal-title {
          display: flex;

          align-items: center;

          gap: 10px;
        }

        .history-modal-icon {
          width: 38px;
          height: 38px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 10px;

          color:
            ${COLORS.navy};

          background:
            ${COLORS.navyLight};
        }

        .history-modal-title > div:last-child {
          display: flex;

          flex-direction: column;

          gap: 2px;
        }

        .history-modal-title strong {
          color:
            ${COLORS.navy};

          font-size: 15px;
        }

        .history-modal-title span {
          color:
            ${COLORS.muted};

          font-size: 10px;

          font-weight: 400;
        }

        .history-student {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-bottom: 18px;

          padding: 13px;

          border-radius: 12px;

          background:
            ${COLORS.navyLight};

          border:
            1px solid
            #DCE6EE;
        }

        .history-student-info {
          display: flex;

          flex-direction: column;

          gap: 3px;
        }

        .history-student-info .ant-typography:first-child {
          color:
            ${COLORS.navy};
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1200px) {

          .attendance-filter {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .search-filter {
            grid-column:
              span 2;
          }

        }

        @media (max-width: 767px) {

          .attendance-filter {
            grid-template-columns:
              1fr;
          }

          .search-filter {
            grid-column:
              auto;
          }

          .attendance-type-banner {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .type-banner-meta {
            width: 100%;

            padding-top: 10px;

            border-top:
              1px solid
              ${COLORS.border};
          }

          .student-list-header {
            padding: 15px;
          }

          .student-list-heading {
            align-items:
              flex-start;
          }

          .table-toolbar {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .toolbar-legend {
            flex-wrap: wrap;
          }

          .attendance-pagination {
            justify-content:
              center;

            overflow-x:
              auto;
          }

          .manual-attendance-actions {
            min-width:
              205px;

            gap: 5px;
          }

          .manual-action-btn {
            width:
              30px !important;

            height:
              30px !important;

            min-width:
              30px !important;
          }

          .qr-modern-header {
            padding: 16px;
          }

          .qr-class-card {
            margin: 14px;
          }

          .qr-scanner-box {
            min-height:
              230px;
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
