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
  Statistic,
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
} from "@ant-design/icons";

import dayjs from "dayjs";

import PageHeroHeader from "../../components/common/PageHeroHeader";
import QRCodeScanner from "./QRCodeScanner";

import attendanceApi from "../../api/attendanceApi";
import classApi from "../../api/classApi";

const { Text, Title } = Typography;

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
  hasNextPage: false,
  hasPrevPage: false,
};

const DEFAULT_STATISTICS = {
  total: 0,
  present: 0,
  absent: 0,
  late: 0,
  excused: 0,
  not_attended: 0,
  notMarked: 0,
  attended: 0,
  attendance_rate: 0,
  rate: 0,
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

    totalPages: Number(pg?.totalPages) || 1,

    hasNextPage: Boolean(pg?.hasNextPage),

    hasPrevPage: Boolean(pg?.hasPrevPage),
  };
};

const getStatisticsFromResponse = (response) => {
  const body = getApiBody(response);

  const st = body?.statistics || response?.statistics || {};

  return {
    total: Number(st?.total) || 0,

    present: Number(st?.present) || 0,

    absent: Number(st?.absent) || 0,

    late: Number(st?.late) || 0,

    excused: Number(st?.excused) || 0,

    not_attended: Number(st?.not_attended ?? st?.notMarked) || 0,

    notMarked: Number(st?.notMarked) || 0,

    attended: Number(st?.attended) || 0,

    attendance_rate: Number(st?.attendance_rate ?? st?.rate) || 0,

    rate: Number(st?.rate) || 0,
  };
};

const normalizeAttendanceStatus = (status) => {
  if (!status || !STATUS_CONFIG[status]) {
    return "not_attended";
  }

  return status;
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
     USER ROLE
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

  const dateString = useMemo(
    () => selectedDate.format("YYYY-MM-DD"),
    [selectedDate],
  );

  const isLocked = selectedDate.isBefore(dayjs(), "day");

  /* =======================================================
     SELECTED CLASS
  ======================================================= */

  const selectedClass = useMemo(
    () => classes.find((item) => Number(item.id) === Number(selectedClassId)),
    [classes, selectedClassId],
  );

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
    if (!selectedClassId) {
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
  }, [selectedClassId, dateString, page, pageSize, search, statusFilter]);

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
  }, [selectedClassId, dateString, statusFilter]);

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
     
     QUAN TRỌNG:
     Đã có trạng thái => KHÔNG CHO UPDATE
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

      /* ===============================================
           ĐÃ ĐIỂM DANH
        =============================================== */

      if (["present", "late", "absent", "excused"].includes(currentStatus)) {
        message.info(
          "Học sinh này đã được điểm danh và không thể thay đổi trạng thái.",
        );

        return;
      }

      /* ===============================================
           SAVE
        =============================================== */

      try {
        setSaving(true);

        const checkInTime =
          status === "present" || status === "late"
            ? dayjs().format("HH:mm:ss")
            : null;

        await attendanceApi.saveBulkAttendance({
          class_id: selectedClassId,

          date: dateString,

          students: [
            {
              student_id: student.student_id,

              status,

              check_in_time: checkInTime,

              note: null,
            },
          ],
        });

        message.success("Đã cập nhật điểm danh");

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
    [isLocked, selectedClassId, dateString, loadAttendance],
  );

  /* =======================================================
     QR SUCCESS
  ======================================================= */

  const handleQRSuccess = useCallback(
    async (data) => {
      /*
       * QR API đã lưu attendance rồi.
       * Chỉ reload danh sách.
       */

      await loadAttendance();

      return data;
    },
    [loadAttendance],
  );

  /* =======================================================
     FINISH QR ATTENDANCE
     
     Khi tắt camera:
     chưa điểm danh -> absent
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
      });

      setIsQrOpen(false);

      message.success(
        "Đã kết thúc điểm danh. Các học sinh chưa điểm danh đã được ghi nhận vắng.",
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
  }, [selectedClassId, dateString, isLocked, loadAttendance]);

  /* =======================================================
     TOGGLE QR
  ======================================================= */

  const handleToggleQR = useCallback(() => {
    if (!selectedClassId) {
      message.warning("Vui lòng chọn lớp trước.");

      return;
    }

    if (isLocked) {
      message.warning("Ngày này đã khóa điểm danh.");

      return;
    }

    if (isQrOpen) {
      /*
       * KHÔNG được chỉ set false.
       *
       * Phải finish để:
       * chưa điểm danh -> absent
       */

      handleFinishQRAttendance();

      return;
    }

    setIsQrOpen(true);
  }, [selectedClassId, isLocked, isQrOpen, handleFinishQRAttendance]);

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
    not_attended: notAttended,
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

      {
        title: "ĐIỂM DANH",
        key: "actions",
        width: 260,
        align: "center",

        render: (_, record) => {
          const current = record.currentStatus;

          /*
           * ĐÃ CÓ TRẠNG THÁI
           * => KHÔNG CHO ĐỔI
           */

          const hasAttendance = [
            "present",
            "late",
            "absent",
            "excused",
          ].includes(current);

          const disabled = isLocked || saving || hasAttendance;

          const getTooltip = (status) => {
            if (current === status) {
              return `Đã ghi nhận: ${STATUS_CONFIG[status].label}`;
            }

            if (hasAttendance) {
              return "Học sinh đã được điểm danh";
            }

            return `Đánh dấu ${STATUS_CONFIG[status].label.toLowerCase()}`;
          };

          return (
            <div className="attendance-actions">
              {/* PRESENT */}

              <Tooltip title={getTooltip("present")}>
                <Button
                  shape="circle"
                  className={`action-btn present ${
                    current === "present" ? "active" : ""
                  }`}
                  icon={<CheckOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "present")}
                />
              </Tooltip>

              {/* LATE */}

              <Tooltip title={getTooltip("late")}>
                <Button
                  shape="circle"
                  className={`action-btn late ${
                    current === "late" ? "active" : ""
                  }`}
                  icon={<ClockCircleOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "late")}
                />
              </Tooltip>

              {/* ABSENT */}

              <Tooltip title={getTooltip("absent")}>
                <Button
                  shape="circle"
                  className={`action-btn absent ${
                    current === "absent" ? "active" : ""
                  }`}
                  icon={<CloseOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "absent")}
                />
              </Tooltip>

              {/* EXCUSED */}

              <Tooltip title={getTooltip("excused")}>
                <Button
                  shape="circle"
                  className={`action-btn excused ${
                    current === "excused" ? "active" : ""
                  }`}
                  icon={<ExclamationCircleOutlined />}
                  disabled={disabled}
                  onClick={() => updateAttendance(record, "excused")}
                />
              </Tooltip>
            </div>
          );
        },
      },

      {
        title: "",
        key: "history",
        width: 60,
        align: "center",

        render: (_, record) => (
          <Tooltip title="Xem lịch sử">
            <Button
              type="text"
              shape="circle"
              icon={<HistoryOutlined />}
              className="history-btn"
              onClick={() => openHistory(record)}
            />
          </Tooltip>
        ),
      },
    ],
    [isLocked, saving, updateAttendance, openHistory],
  );

  /* =======================================================
     HISTORY COLUMNS
  ======================================================= */

  const historyColumns = [
    {
      title: "NGÀY",
      dataIndex: "attendance_date",

      render: (value) => (value ? dayjs(value).format("DD/MM/YYYY") : "—"),
    },

    {
      title: "TRẠNG THÁI",
      dataIndex: "status",

      render: (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_attended;

        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },

    {
      title: "GIỜ VÀO",
      dataIndex: "check_in_time",

      render: (value) => (value ? String(value).slice(0, 5) : "—"),
    },
  ];

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

          Pagination: {
            itemActiveBg: "#FF8FAB",
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
          description="Theo dõi, ghi nhận sự hiện diện và quản lý chuyên cần của học viên theo từng lớp học."
          // Refresh Props
          onRefresh={loadAttendance}
          refreshLoading={loadingAttendance}
        />

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <Card bordered={false} className="attendance-filter-card">
          <div className="attendance-filter">
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
                    value: "late",
                    label: "Đi muộn",
                  },
                  {
                    value: "absent",
                    label: "Vắng",
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
            LOCK NOTICE
        ================================================= */}

        {isLocked && (
          <Alert
            className="attendance-lock-alert"
            type="warning"
            showIcon
            message="Ngày điểm danh đã khóa"
            description="Bạn chỉ có thể xem dữ liệu của ngày này, không thể thay đổi trạng thái điểm danh."
          />
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <Row gutter={[16, 16]} className="attendance-stat-row">
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} className="stat-card pink">
              <div className="stat-icon">
                <TeamOutlined />
              </div>

              <Statistic title="Tổng học sinh" value={total} />

              <Text type="secondary">
                {selectedClass?.name || "Chưa chọn lớp"}
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} className="stat-card green">
              <div className="stat-icon">
                <CheckCircleFilled />
              </div>

              <Statistic title="Có mặt" value={present} />

              <Text type="secondary">Đã tham dự</Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} className="stat-card yellow">
              <div className="stat-icon">
                <ClockCircleOutlined />
              </div>

              <Statistic title="Đi muộn" value={late} />

              <Text type="secondary">Đi muộn</Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} className="stat-card red">
              <div className="stat-icon">
                <CloseCircleFilled />
              </div>

              <Statistic title="Vắng" value={absent} />

              <Text type="secondary">
                {excused > 0 ? `${excused} có phép` : "Không có phép"}
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} className="stat-card purple">
              <div className="stat-icon">
                <ExclamationCircleOutlined />
              </div>

              <Statistic title="Chưa điểm danh" value={notAttended} />

              <Text type="secondary">Chưa ghi nhận</Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} className="stat-card rate">
              <div className="stat-icon">
                <CheckCircleFilled />
              </div>

              <Statistic
                title="Tỷ lệ tham dự"
                value={attendanceRate}
                precision={2}
                suffix="%"
              />

              <Text type="secondary">Tỷ lệ điểm danh</Text>
            </Card>
          </Col>
        </Row>

        {/* =================================================
            MAIN 2 COLUMNS
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
                    x: 900,
                  }}
                />
              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}

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
              <div className="qr-panel-header">
                <div className="qr-title">
                  <div className="qr-title-icon">
                    <QrcodeOutlined />
                  </div>

                  <div>
                    <Text strong className="qr-title-text">
                      Quét QR điểm danh
                    </Text>

                    <Text type="secondary" className="qr-title-sub">
                      Quét mã học viên bằng camera
                    </Text>
                  </div>
                </div>

                <Button
                  type={isQrOpen ? "default" : "primary"}
                  danger={isQrOpen}
                  icon={isQrOpen ? <StopOutlined /> : <CameraOutlined />}
                  className="qr-toggle-btn"
                  loading={saving && isQrOpen}
                  disabled={!selectedClassId || isLocked}
                  onClick={handleToggleQR}
                >
                  {isQrOpen ? "Tắt Camera" : "Bật Quét QR"}
                </Button>
              </div>

              <div className="qr-selected-class">
                <span className="qr-selected-dot" />

                <div>
                  <Text type="secondary">Đang điểm danh</Text>

                  <Text strong className="qr-selected-class-name">
                    {selectedClass?.name || "Chưa chọn lớp"}
                  </Text>
                </div>
              </div>

              <div className="qr-component-container">
                <QRCodeScanner
                  open={isQrOpen}
                  classId={selectedClassId}
                  onSuccess={handleQRSuccess}
                  onFinishAttendance={handleFinishQRAttendance}
                />
              </div>

              {!isQrOpen && (
                <div className="qr-off-info">
                  <QrcodeOutlined />

                  <div>
                    <Text strong>Điểm danh bằng mã QR</Text>

                    <Text type="secondary">
                      Khi kết thúc quét, học sinh chưa được ghi nhận sẽ tự động
                      chuyển thành Vắng.
                    </Text>
                  </div>
                </div>
              )}

              <div className="qr-status-guide">
                <div>
                  <span className="guide-dot green" />
                  <span>Có mặt</span>
                </div>

                <div>
                  <span className="guide-dot yellow" />
                  <span>Đi muộn</span>
                </div>

                <div>
                  <span className="guide-dot red" />
                  <span>Vắng</span>
                </div>

                <div>
                  <span className="guide-dot purple" />
                  <span>Có phép</span>
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
          width={620}
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
              <Text strong>{historyStudent?.name || "Học sinh"}</Text>

              <Text type="secondary">{historyStudent?.code || ""}</Text>
            </div>
          </div>

          <Table
            rowKey={(record, index) =>
              record.id || `${record.attendance_date}-${index}`
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
      <style>{`
      /* =========================================================
   PAGE
========================================================= */

.attendance-page {
  min-height: 100%;
  padding-bottom: 40px;
  background: #fff9fb;
}

/* =========================================================
   FILTER
========================================================= */

.attendance-filter-card {
  margin-top: 18px;
  border: 1px solid #f5dfe7;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(225, 93, 130, 0.06);
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

.class-filter {
  min-width: 230px;
}

.search-filter {
  flex: 1;
  min-width: 230px;
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
.attendance-status-filter {
  width: 100%;
}

.attendance-select .ant-select-selector,
.attendance-date,
.attendance-search,
.attendance-status-filter .ant-select-selector {
  min-height: 42px !important;
  border-radius: 12px !important;
  border-color: #f0d9e2 !important;
  background: #fff !important;
}

.attendance-search input {
  font-size: 14px;
}

.filter-refresh {
  padding-bottom: 1px;
}

.refresh-btn {
  width: 42px;
  height: 42px;
  border: 1px solid #f1d6e0;
  color: #e85d82;
  background: #fff4f7;
}

.refresh-btn:hover {
  color: #fff !important;
  background: #ff8fab !important;
  border-color: #ff8fab !important;
}

/* =========================================================
   LOCK
========================================================= */

.attendance-lock-alert {
  margin-top: 16px;
  border-radius: 14px;
  border: 1px solid #fde3a7;
}

/* =========================================================
   STAT
========================================================= */

.attendance-stat-row {
  margin-top: 18px;
}

.stat-card {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid #f4dfe6;
  box-shadow: 0 8px 25px rgba(225, 93, 130, 0.055);
  transition: 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(225, 93, 130, 0.09);
}

.stat-card .ant-card-body {
  padding: 18px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  margin-bottom: 10px;
  font-size: 18px;
}

.stat-card.pink .stat-icon {
  color: #e85d82;
  background: #fff0f4;
}

.stat-card.green .stat-icon {
  color: #059669;
  background: #ecfdf5;
}

.stat-card.yellow .stat-icon {
  color: #d97706;
  background: #fffbeb;
}

.stat-card.red .stat-icon {
  color: #e11d48;
  background: #fff1f2;
}

.stat-card.purple .stat-icon {
  color: #8b5cf6;
  background: #f5f3ff;
}

.stat-card.rate .stat-icon {
  color: #d94678;
  background: #fff0f4;
}

.stat-card .ant-statistic-title {
  margin-bottom: 2px;
  color: #94a3b8;
  font-size: 12px;
}

.stat-card .ant-statistic-content {
  color: #334155;
  font-weight: 800;
  font-size: 26px;
}

/* =========================================================
   MAIN
========================================================= */

.attendance-main-row {
  margin-top: 18px;
}

/* =========================================================
   STUDENT LIST
========================================================= */

.student-list-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid #f3dce5;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(225, 93, 130, 0.06);
}

.student-list-card .ant-card-body {
  padding: 0;
}

.student-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 22px;
  border-bottom: 1px solid #f7e6eb;
}

.section-title {
  margin: 0 !important;
  color: #6f3547 !important;
  font-size: 19px !important;
}

.total-student-tag {
  margin: 0;
  padding: 5px 12px;
  border: 1px solid #f5d5df;
  border-radius: 20px;
  color: #d95678;
  background: #fff3f6;
  font-weight: 700;
}

.attendance-table-wrap {
  overflow-x: auto;
}

.attendance-table-wrap .ant-table {
  font-size: 13px;
}

.attendance-table-wrap .ant-table-thead > tr > th {
  padding: 13px 16px;
  color: #9a6473;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  background: #fff8fa;
  border-bottom: 1px solid #f6e5ea;
}

.attendance-table-wrap .ant-table-tbody > tr > td {
  padding: 14px 16px;
  border-bottom: 1px solid #faedf1;
}

.attendance-table-wrap
  .ant-table-tbody
  > tr:last-child
  > td {
  border-bottom: none;
}

/* =========================================================
   STUDENT
========================================================= */

.student-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar {
  flex: 0 0 auto;
  color: #e85d82;
  background: #fff0f4;
  border: 2px solid #ffe0e8;
}

.student-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.student-name {
  overflow: hidden;
  color: #334155;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-code {
  font-size: 12px;
}

/* =========================================================
   STATUS TAG
========================================================= */

.attendance-status-tag {
  min-width: 105px;
  margin: 0;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

/* =========================================================
   ACTION BUTTONS
========================================================= */

.attendance-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  width: 35px !important;
  height: 35px !important;
  min-width: 35px !important;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 50% !important;

  background: #ffffff;
  border: 1px solid #f1dce3;

  box-shadow: 0 3px 8px rgba(214, 93, 125, 0.06);

  transition:
    all 0.2s ease,
    transform 0.15s ease;

  font-size: 14px;
}

.action-btn:not(:disabled):hover {
  transform: translateY(-2px);
}

/* PRESENT */

.action-btn.present {
  color: #55b77a;
  background: #f4fcf7;
  border-color: #cdeed9;
}

.action-btn.present:not(:disabled):hover,
.action-btn.present.active {
  color: #ffffff;
  background: #67c587;
  border-color: #67c587;
  box-shadow: 0 5px 12px rgba(103, 197, 135, 0.25);
}

/* LATE */

.action-btn.late {
  color: #d99b32;
  background: #fffaf0;
  border-color: #f5dfad;
}

.action-btn.late:not(:disabled):hover,
.action-btn.late.active {
  color: #ffffff;
  background: #f3b562;
  border-color: #f3b562;
  box-shadow: 0 5px 12px rgba(243, 181, 98, 0.25);
}

/* ABSENT */

.action-btn.absent {
  color: #e46f83;
  background: #fff5f7;
  border-color: #f4cbd4;
}

.action-btn.absent:not(:disabled):hover,
.action-btn.absent.active {
  color: #ffffff;
  background: #ef7c8e;
  border-color: #ef7c8e;
  box-shadow: 0 5px 12px rgba(239, 124, 142, 0.25);
}

/* EXCUSED */

.action-btn.excused {
  color: #9179d5;
  background: #f8f5ff;
  border-color: #ded5f8;
}

.action-btn.excused:not(:disabled):hover,
.action-btn.excused.active {
  color: #ffffff;
  background: #a78bfa;
  border-color: #a78bfa;
  box-shadow: 0 5px 12px rgba(167, 139, 250, 0.25);
}

/* DISABLED */

.action-btn:disabled {
  cursor: not-allowed !important;
  opacity: 0.32;
  transform: none !important;
  box-shadow: none;
}

.action-btn.active:disabled {
  opacity: 1;
}

/* =========================================================
   HISTORY BUTTON
========================================================= */

.history-btn {
  color: #d86a88;
  background: #fff5f8;
}

.history-btn:hover {
  color: #fff !important;
  background: #ff8fab !important;
}

/* =========================================================
   PAGINATION
========================================================= */

.attendance-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 17px 20px;
  border-top: 1px solid #f7e6eb;
}

.attendance-pagination .ant-pagination-item-active {
  border-color: #ff8fab;
  background: #ff8fab;
}

.attendance-pagination
  .ant-pagination-item-active
  a {
  color: #fff;
}

.attendance-pagination .ant-pagination-total-text {
  color: #94a3b8;
  font-size: 12px;
}

/* =========================================================
   QR PANEL
========================================================= */

.qr-panel-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid #f3dce5;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(225, 93, 130, 0.07);
}

.qr-panel-card .ant-card-body {
  padding: 0;
}

.qr-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid #f7e6eb;
}

.qr-title {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.qr-title-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 13px;
  color: #e85d82;
  background: #fff0f4;
  font-size: 19px;
}

.qr-title-text {
  display: block;
  color: #6f3547;
  font-size: 14px;
}

.qr-title-sub {
  display: block;
  margin-top: 2px;
  font-size: 11px;
}

.qr-toggle-btn {
  flex: 0 0 auto;
  border-radius: 10px;
  font-weight: 700;
}

.qr-selected-class {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 16px 0;
  padding: 11px 13px;
  border: 1px solid #f6dfe7;
  border-radius: 12px;
  background: #fff8fa;
}

.qr-selected-dot {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #67c587;
  box-shadow: 0 0 0 4px #eaf9ef;
}

.qr-selected-class {
  flex-direction: row;
}

.qr-selected-class > div {
  display: flex;
  flex-direction: column;
}

.qr-selected-class-name {
  margin-top: 1px;
  color: #71384a;
  font-size: 13px;
}

/* =========================================================
   QR COMPONENT
========================================================= */

.qr-component-container {
  padding: 16px;
}

.inline-qr-scanner {
  width: 100%;
}

.inline-qr-camera {
  position: relative;
  width: 100%;
  height: 390px;
  overflow: hidden;
  border-radius: 18px;
  background: #161616;
}

.inline-qr-camera > div:first-child {
  width: 100%;
  height: 100%;
}

.inline-qr-camera video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

.inline-qr-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.28);
}

.inline-qr-live {
  position: absolute;
  top: 13px;
  left: 13px;
  z-index: 5;

  display: flex;
  align-items: center;
  gap: 7px;

  padding: 6px 10px;

  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;

  color: #fff;
  background: rgba(0, 0, 0, 0.38);

  font-size: 11px;
  font-weight: 700;

  backdrop-filter: blur(8px);
}

.inline-qr-live span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #67c587;
  box-shadow: 0 0 0 4px rgba(103, 197, 135, 0.15);
}

/* =========================================================
   QR FRAME
========================================================= */

.inline-qr-frame-wrapper {
  position: absolute;
  inset: 0;
  z-index: 4;

  display: flex;
  align-items: center;
  justify-content: center;

  pointer-events: none;
}

.inline-qr-frame {
  position: relative;
  width: 205px;
  height: 205px;
}

.corner {
  position: absolute;
  width: 35px;
  height: 35px;
  border-color: #fff;
  border-style: solid;
}

.corner.top-left {
  top: 0;
  left: 0;
  border-width: 4px 0 0 4px;
  border-radius: 8px 0 0 0;
}

.corner.top-right {
  top: 0;
  right: 0;
  border-width: 4px 4px 0 0;
  border-radius: 0 8px 0 0;
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
  border-width: 0 0 4px 4px;
  border-radius: 0 0 0 8px;
}

.corner.bottom-right {
  right: 0;
  bottom: 0;
  border-width: 0 4px 4px 0;
  border-radius: 0 0 8px 0;
}

/* =========================================================
   QR HINT
========================================================= */

.inline-qr-hint {
  position: absolute;
  bottom: 24px;
  left: 50%;
  z-index: 5;

  display: flex;
  align-items: center;
  gap: 7px;

  transform: translateX(-50%);

  padding: 8px 13px;

  border-radius: 20px;

  color: #fff;
  background: rgba(0, 0, 0, 0.45);

  font-size: 11px;
  font-weight: 600;

  white-space: nowrap;

  backdrop-filter: blur(8px);
}

/* =========================================================
   PROCESSING
========================================================= */

.inline-qr-processing {
  position: absolute;
  inset: 0;
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.25);
}

.inline-qr-processing-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  padding: 18px 25px;

  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;

  color: #fff;
  background: rgba(0, 0, 0, 0.62);

  backdrop-filter: blur(10px);
}

.inline-qr-processing-card strong {
  font-size: 12px;
}

/* =========================================================
   RESULT
========================================================= */

.inline-qr-result {
  position: absolute;
  inset: 12px;
  z-index: 20;

  display: flex;
  align-items: flex-end;
  pointer-events: none;
}

.inline-qr-result-card {
  width: 100%;
  border-radius: 16px !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
}

.inline-qr-result-card .ant-card-body {
  padding: 13px;
}

.inline-qr-result-inner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.inline-qr-result-icon {
  flex: 0 0 auto;
  padding-top: 2px;
  font-size: 25px;
}

.inline-qr-result-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.inline-qr-result-title {
  font-size: 13px;
}

.inline-qr-student-name {
  color: #334155;
  font-size: 14px;
}

.inline-qr-meta {
  font-size: 10px;
}

.inline-qr-time {
  align-self: flex-start;
  margin: 4px 0 1px;
  font-size: 10px;
}

.inline-qr-message {
  font-size: 10px;
}

/* =========================================================
   QR STATUS
========================================================= */

.inline-qr-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  margin-top: 10px;

  color: #8c6a75;
  font-size: 11px;
  font-weight: 600;
}

.inline-qr-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.inline-qr-status-dot.ready {
  background: #67c587;
  box-shadow: 0 0 0 4px #eaf9ef;
}

.inline-qr-status-dot.processing {
  background: #f3b562;
  box-shadow: 0 0 0 4px #fff5df;
}

.inline-qr-status-dot.success {
  background: #67c587;
}

.inline-qr-status-dot.warning {
  background: #f3b562;
}

.inline-qr-status-dot.error,
.inline-qr-status-dot.class_error {
  background: #ef7c8e;
}

.qr-finish-note {
  margin-top: 10px;
  padding: 9px 12px;
  border: 1px dashed #f2d4de;
  border-radius: 10px;
  color: #9b6b78;
  background: #fff9fb;
  font-size: 10px;
  line-height: 1.5;
  text-align: center;
}

/* =========================================================
   CAMERA OFF
========================================================= */

.qr-camera-off-state {
  min-height: 390px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 30px;

  border: 1px dashed #f0d5df;
  border-radius: 18px;

  text-align: center;

  background:
    radial-gradient(
      circle at 50% 30%,
      #fff0f4 0,
      #fff9fb 45%,
      #fff 100%
    );
}

.qr-camera-off-icon {
  width: 72px;
  height: 72px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 15px;

  border-radius: 22px;

  color: #e85d82;
  background: #fff0f4;

  font-size: 30px;
}

.qr-camera-off-state strong {
  color: #71384a;
  font-size: 15px;
}

.qr-camera-off-state span {
  max-width: 250px;
  margin-top: 7px;
  color: #a27a86;
  font-size: 11px;
  line-height: 1.5;
}

/* =========================================================
   QR OFF INFO
========================================================= */

.qr-off-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  margin: 0 16px 14px;
  padding: 12px;

  border: 1px solid #f5dfe7;
  border-radius: 12px;

  color: #e85d82;
  background: #fff8fa;
}

.qr-off-info > svg {
  margin-top: 2px;
  font-size: 18px;
}

.qr-off-info > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.qr-off-info .ant-typography {
  font-size: 11px;
}

/* =========================================================
   GUIDE
========================================================= */

.qr-status-guide {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;

  padding: 0 16px 16px;
}

.qr-status-guide > div {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  padding: 6px 3px;

  border-radius: 8px;

  color: #8b6874;
  background: #fff8fa;

  font-size: 9px;
  font-weight: 600;
}

.guide-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.guide-dot.green {
  background: #67c587;
}

.guide-dot.yellow {
  background: #f3b562;
}

.guide-dot.red {
  background: #ef7c8e;
}

.guide-dot.purple {
  background: #a78bfa;
}

/* =========================================================
   HISTORY
========================================================= */

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

  border: 1px solid #f5dfe7;
  border-radius: 13px;

  background: #fff8fa;
}

.history-student > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1199px) {
  .qr-panel-card {
    height: auto;
  }

  .inline-qr-camera {
    height: 430px;
  }
}

@media (max-width: 767px) {
  .attendance-page {
    padding-bottom: 20px;
  }

  .attendance-filter {
    display: grid;
    grid-template-columns: 1fr;
  }

  .filter-item,
  .class-filter,
  .search-filter {
    min-width: 0;
    width: 100%;
  }

  .filter-refresh {
    display: flex;
    justify-content: flex-end;
  }

  .student-list-header {
    padding: 16px;
  }

  .attendance-pagination {
    justify-content: center;
    overflow-x: auto;
  }

  .attendance-pagination
    .ant-pagination {
    white-space: nowrap;
  }

  .qr-panel-header {
    align-items: flex-start;
  }

  .qr-toggle-btn {
    padding-inline: 10px;
  }

  .inline-qr-camera,
  .qr-camera-off-state {
    height: 350px;
    min-height: 350px;
  }

  .inline-qr-frame {
    width: 180px;
    height: 180px;
  }

  .qr-status-guide {
    grid-template-columns: repeat(2, 1fr);
  }

  .attendance-table-wrap .ant-table-tbody > tr > td,
  .attendance-table-wrap .ant-table-thead > tr > th {
    padding: 12px;
  }
}
        `}</style>
    </ConfigProvider>
  );
};

export default AttendancePage;
