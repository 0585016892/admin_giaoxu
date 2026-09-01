import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Input,
  Modal,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Spin,
  Statistic,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  TeamOutlined,
  BookOutlined,
  SearchOutlined,
  LockOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import {
  getAttendance,
  saveBulkAttendance,
  getStudentAttendance,
} from "../../api/attendanceApi";
import { useUser } from "../../context/UserContext";
import classApi from "../../api/classApi";

import AppButton from "../../components/common/AppButton";
import StatCard from "../../components/common/StatCard";
import PageHeroHeader from "../../components/common/PageHeroHeader";

const { Text, Title } = Typography;

/**
 * =========================================================
 * DESIGN TOKENS
 * =========================================================
 */

const COLORS = {
  primarySoft: "#86A8CF",
  accentPink: "#FFB6C1",
  accentYellow: "#FFE4B5",

  textDark: "#1E293B",
  softBg: "#F8FAFC",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",

  successBg: "#F0FDF4",
  successBorder: "#BBF7D0",
  successText: "#15803D",

  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",
  dangerText: "#DC2626",

  warningBg: "#FFFBEB",
  warningBorder: "#FEF08A",
  warningText: "#B45309",

  infoBg: "#EFF6FF",
  infoBorder: "#BFDBFE",
  infoText: "#1D4ED8",
};

/**
 * =========================================================
 * STATUS CONFIG
 * =========================================================
 */

const STATUS_CONFIG = {
  present: {
    label: "Có mặt",
    short: "Có",
    bg: COLORS.successBg,
    border: COLORS.successBorder,
    color: COLORS.successText,
    icon: <CheckCircleOutlined />,
  },

  absent: {
    label: "Vắng",
    short: "Vắng",
    bg: COLORS.dangerBg,
    border: COLORS.dangerBorder,
    color: COLORS.dangerText,
    icon: <CloseCircleOutlined />,
  },

  late: {
    label: "Muộn",
    short: "Muộn",
    bg: COLORS.warningBg,
    border: COLORS.warningBorder,
    color: COLORS.warningText,
    icon: <ClockCircleOutlined />,
  },

  excused: {
    label: "Có phép",
    short: "Phép",
    bg: COLORS.infoBg,
    border: COLORS.infoBorder,
    color: COLORS.infoText,
    icon: <ExclamationCircleOutlined />,
  },
};

const STATUS_LIST = ["present", "absent", "late", "excused"];

/**
 * =========================================================
 * CHECK NGÀY QUÁ KHỨ
 * =========================================================
 */

const isPastDate = (date) => {
  if (!date) return false;
  return date.isBefore(dayjs().startOf("day"), "day");
};

/**
 * =========================================================
 * NORMALIZE CLASS
 * =========================================================
 */

const normalizeClassList = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.classes)) return response.data.classes;
  // Trường hợp getClassTeacher trả về 1 object chứa thông tin lớp đơn lẻ
  if (response.id || response.class_id) return [response];
  if (response.data?.id || response.data?.class_id) return [response.data];
  return [];
};

/**
 * =========================================================
 * NORMALIZE STUDENT
 * =========================================================
 */

const normalizeStudent = (student) => ({
  ...student,
  student_id: Number(student.student_id),
  student_name: student.student_name || student.name || "Không có tên",
  status: student.status || null,
  check_in_time: student.check_in_time || null,
  note: student.note || "",
});

/**
 * =========================================================
 * NORMALIZE STUDENT HISTORY
 * =========================================================
 */

const normalizeStudentHistory = (response) => {
  const data = response?.data || {};
  const student = data.student || null;
  const attendances = Array.isArray(data.attendances) ? data.attendances : [];
  return {
    student,
    attendances,
    summary: data.summary || {},
  };
};

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const AttendancePage = () => {
  const { user } = useUser();
  const role = user?.role;
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  // Student Detail Modal
  const [studentDetailOpen, setStudentDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [loadingStudentHistory, setLoadingStudentHistory] = useState(false);

  const attendanceLocked = useMemo(() => {
    return isPastDate(selectedDate);
  }, [selectedDate]);

  // Load danh sách lớp dựa theo Role
  const loadClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      setError("");

      let response;
      if (role === "teacher") {
        response = await classApi.getClassTeacher();
      } else {
        // Mặc định cho catechist hoặc các role khác gọi getAll
        response = await classApi.getAll();
      }

      const list = normalizeClassList(response);
      setClasses(list);

      // Nếu là teacher hoặc danh sách có phần tử, tự động gán lớp đầu tiên/lớp của teacher
      if (list.length > 0) {
        const firstClassId = Number(list[0].id || list[0].class_id);
        setSelectedClassId(firstClassId);
      }
    } catch (err) {
      console.error("LOAD CLASSES ERROR:", err);
      const msg = err?.response?.data?.message || "Không thể tải danh sách lớp";
      setError(msg);
      message.error(msg);
    } finally {
      setLoadingClasses(false);
    }
  }, [role]);

  const loadAttendance = useCallback(async () => {
    if (!selectedClassId) {
      setStudents([]);
      setClassInfo(null);
      return;
    }

    try {
      setLoadingAttendance(true);
      setError("");
      const date = selectedDate.format("YYYY-MM-DD");
      const response = await getAttendance({
        class_id: selectedClassId,
        date,
      });

      const data = response?.data || {};
      setClassInfo(data.class || null);
      const studentList = Array.isArray(data.students)
        ? data.students.map(normalizeStudent)
        : [];
      setStudents(studentList);
    } catch (err) {
      console.error("LOAD ATTENDANCE ERROR:", err);
      const msg =
        err?.response?.data?.message || "Không thể tải dữ liệu điểm danh";
      setError(msg);
      message.error(msg);
      setStudents([]);
    } finally {
      setLoadingAttendance(false);
    }
  }, [selectedClassId, selectedDate]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (selectedClassId) {
      loadAttendance();
    }
  }, [selectedClassId, selectedDate, loadAttendance]);

  const statistics = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => s.status === "present").length;
    const absent = students.filter((s) => s.status === "absent").length;
    const late = students.filter((s) => s.status === "late").length;
    const excused = students.filter((s) => s.status === "excused").length;
    const attended = present + late;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

    return { total, present, absent, late, excused, attended, rate };
  }, [students]);

  const selectedClass = useMemo(() => {
    return (
      classes.find(
        (item) => Number(item.id || item.class_id) === Number(selectedClassId),
      ) ||
      classInfo ||
      null
    );
  }, [classes, selectedClassId, classInfo]);

  const filteredStudents = useMemo(() => {
    if (!searchText.trim()) return students;
    const keyword = searchText.trim().toLowerCase();
    return students.filter(
      (student) =>
        student.student_name.toLowerCase().includes(keyword) ||
        String(student.student_id).includes(keyword),
    );
  }, [students, searchText]);

  const handleStatusChange = (studentId, status) => {
    if (attendanceLocked) {
      message.warning("Ngày điểm danh đã qua, chỉ được xem dữ liệu.");
      return;
    }
    setStudents((prev) =>
      prev.map((student) =>
        Number(student.student_id) === Number(studentId)
          ? { ...student, status }
          : student,
      ),
    );
  };

  const handleNoteChange = (studentId, note) => {
    if (attendanceLocked) return;
    setStudents((prev) =>
      prev.map((student) =>
        Number(student.student_id) === Number(studentId)
          ? { ...student, note }
          : student,
      ),
    );
  };

  const handleMarkAll = (status) => {
    if (attendanceLocked) {
      message.warning("Ngày điểm danh đã qua, không thể chỉnh sửa.");
      return;
    }
    setStudents((prev) => prev.map((student) => ({ ...student, status })));
  };

  const handleClearStatus = () => {
    if (attendanceLocked) {
      message.warning("Ngày điểm danh đã qua, không thể chỉnh sửa.");
      return;
    }
    setStudents((prev) =>
      prev.map((student) => ({ ...student, status: null })),
    );
  };

  const handleSave = async () => {
    if (!selectedClassId) {
      message.warning("Vui lòng chọn lớp nha bạn ơi! 🌸");
      return;
    }
    if (attendanceLocked) {
      message.warning("Ngày điểm danh đã qua, không thể lưu hoặc chỉnh sửa.");
      return;
    }
    if (students.length === 0) {
      message.warning("Lớp này chưa có học viên nào cả!");
      return;
    }

    const notAttended = students.filter((student) => !student.status);
    if (notAttended.length > 0) {
      message.warning(`Còn ${notAttended.length} bạn chưa được điểm danh kìa!`);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        class_id: Number(selectedClassId),
        date: selectedDate.format("YYYY-MM-DD"),
        students: students.map((student) => ({
          student_id: Number(student.student_id),
          status: student.status,
          check_in_time: student.check_in_time || null,
          note: student.note?.trim() || null,
        })),
      };

      const response = await saveBulkAttendance(payload);
      message.success(response?.message || "Lưu điểm danh thành công! ✨");
      await loadAttendance();
    } catch (err) {
      console.error("SAVE ATTENDANCE ERROR:", err);
      message.error(err?.response?.data?.message || "Không thể lưu điểm danh");
    } finally {
      setSaving(false);
    }
  };

  const handleViewStudent = async (student) => {
    try {
      setSelectedStudent(student);
      setStudentDetailOpen(true);
      setLoadingStudentHistory(true);
      setStudentHistory([]);

      const response = await getStudentAttendance(Number(student.student_id));
      const { attendances } = normalizeStudentHistory(response);
      setStudentHistory(attendances);
    } catch (err) {
      console.error("GET STUDENT ATTENDANCE ERROR:", err);
      message.error(
        err?.response?.data?.message || "Không thể tải lịch sử điểm danh",
      );
    } finally {
      setLoadingStudentHistory(false);
    }
  };

  const monthlyHistory = useMemo(() => {
    if (!selectedDate || !studentHistory) return [];
    const year = selectedDate.year();
    const month = selectedDate.month();
    return studentHistory
      .filter((item) => {
        if (!item.attendance_date) return false;
        const date = dayjs(item.attendance_date);
        return date.year() === year && date.month() === month;
      })
      .sort(
        (a, b) =>
          dayjs(b.attendance_date).valueOf() -
          dayjs(a.attendance_date).valueOf(),
      );
  }, [studentHistory, selectedDate]);

  const monthlyStudentStatistics = useMemo(() => {
    const total = monthlyHistory.length;
    const present = monthlyHistory.filter((i) => i.status === "present").length;
    const absent = monthlyHistory.filter((i) => i.status === "absent").length;
    const late = monthlyHistory.filter((i) => i.status === "late").length;
    const excused = monthlyHistory.filter((i) => i.status === "excused").length;
    const attended = present + late;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
    return { total, present, absent, late, excused, attended, rate };
  }, [monthlyHistory]);

  return (
    <div
      style={{
        minHeight: "100%",
        background: COLORS.softBg,
        padding: 24,
        paddingBottom: 120,
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <PageHeroHeader
          icon={<BookOutlined />}
          badgeText="🌸 QUẢN LÝ GIÁO LÝ"
          title="Điểm Danh Kiểu Danh Sách"
          description="Giao diện danh sách học viên trực quan, tinh tế và dễ thao tác."
        />
      </div>

      {/* FILTER BAR */}
      <Card
        bordered={false}
        style={{
          marginBottom: 20,
          borderRadius: 20,
          boxShadow: "0 4px 20px rgba(148, 163, 184, 0.08)",
          background: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
        }}
        bodyStyle={{ padding: 18 }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10} lg={8}>
            <Text
              strong
              style={{
                color: COLORS.textDark,
                display: "block",
                marginBottom: 6,
              }}
            >
              Chọn Lớp 📚{" "}
              {role === "teacher" && (
                <Tag color="orange" style={{ marginLeft: 6 }}>
                  Lớp phụ trách
                </Tag>
              )}
            </Text>
            <Select
              value={selectedClassId ? Number(selectedClassId) : undefined}
              onChange={(value) => setSelectedClassId(Number(value))}
              loading={loadingClasses}
              placeholder="Chọn lớp học..."
              style={{ width: "100%" }}
              size="large"
              showSearch
              disabled={role === "teacher"} // Khóa nếu là teacher để không chọn lớp khác
              optionFilterProp="label"
              options={classes.map((item) => ({
                value: Number(item.id || item.class_id),
                label:
                  item.name ||
                  item.class_name ||
                  `Lớp ${item.id || item.class_id}`,
              }))}
            />
          </Col>

          <Col xs={24} md={8} lg={6}>
            <Text
              strong
              style={{
                color: COLORS.textDark,
                display: "block",
                marginBottom: 6,
              }}
            >
              Ngày Điểm Danh 🗓️
            </Text>
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="DD/MM/YYYY"
              size="large"
              allowClear={false}
              style={{ width: "100%" }}
              suffixIcon={<CalendarOutlined style={{ color: "#E57373" }} />}
            />
          </Col>

          <Col xs={24} md={6} lg={4}>
            <div style={{ height: 22 }} />
            <AppButton
              size="large"
              icon={<ReloadOutlined />}
              onClick={loadAttendance}
              loading={loadingAttendance}
              block
              style={{ borderRadius: 12, fontWeight: 600 }}
            >
              Tải lại
            </AppButton>
          </Col>
        </Row>
      </Card>

      {/* LOCK ALERT */}
      {attendanceLocked && (
        <Alert
          type="warning"
          showIcon
          icon={<LockOutlined />}
          message="Ngày điểm danh đã khóa chỉnh sửa"
          description={
            <>
              Bạn đang xem dữ liệu ngày{" "}
              <strong>{selectedDate.format("DD/MM/YYYY")}</strong>. Ngày đã qua
              chỉ ở chế độ xem lịch sử.
            </>
          }
          style={{ marginBottom: 20, borderRadius: 16 }}
        />
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          closable
          message={error}
          style={{ marginBottom: 20, borderRadius: 16 }}
        />
      )}

      {/* CLASS INFO & PROGRESS */}
      {selectedClass && (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} lg={14}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                background: "linear-gradient(135deg, #EFF6FF 0%, #FCE7F3 100%)",
                border: "1px solid #E2E8F0",
                height: "100%",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Space align="center" size={14}>
                <Avatar
                  size={48}
                  style={{
                    background: "#FFFFFF",
                    color: "#3B82F6",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                  icon={<TeamOutlined />}
                />
                <div>
                  <Title level={4} style={{ margin: 0, color: "#1E293B" }}>
                    {selectedClass.name ||
                      selectedClass.class_name ||
                      `Lớp ${selectedClass.id || selectedClass.class_id}`}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Sĩ số: <strong>{statistics.total}</strong> học viên • Ngày:{" "}
                    {selectedDate.format("DD/MM/YYYY")}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                border: `1px solid ${COLORS.border}`,
                height: "100%",
              }}
              bodyStyle={{ padding: "14px 20px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text type="secondary" style={{ fontWeight: 600 }}>
                  Tỷ lệ chuyên cần
                </Text>
                <Text strong style={{ color: "#3B82F6" }}>
                  {statistics.rate}%
                </Text>
              </div>
              <Progress
                percent={statistics.rate}
                strokeColor="#3B82F6"
                showInfo={false}
                strokeWidth={8}
              />
              <Space wrap size={[6, 4]} style={{ marginTop: 8 }}>
                <Tag color="success">Có mặt: {statistics.present}</Tag>
                <Tag color="warning">Muộn: {statistics.late}</Tag>
                <Tag color="error">Vắng: {statistics.absent}</Tag>
                <Tag color="processing">Có phép: {statistics.excused}</Tag>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* QUICK STATS */}
      {selectedClassId && (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={6}>
            <StatCard
              title="Tổng số"
              value={statistics.total}
              icon={<TeamOutlined />}
              style={{ borderRadius: 16 }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              title="Có mặt"
              value={statistics.present}
              icon={<CheckCircleOutlined />}
              style={{ borderRadius: 16 }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              title="Vắng"
              value={statistics.absent}
              icon={<CloseCircleOutlined />}
              style={{ borderRadius: 16 }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              title="Muộn"
              value={statistics.late}
              icon={<ClockCircleOutlined />}
              style={{ borderRadius: 16 }}
            />
          </Col>
        </Row>
      )}

      {/* STUDENT LIST CONTAINER */}
      <Card
        bordered={false}
        style={{
          borderRadius: 24,
          boxShadow: "0 4px 20px rgba(148, 163, 184, 0.08)",
          border: `1px solid ${COLORS.border}`,
        }}
        bodyStyle={{ padding: 24 }}
      >
        {/* TOOLBAR */}
        {students.length > 0 && !loadingAttendance && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <Space wrap>
              <Text strong style={{ color: COLORS.textDark }}>
                ⚡ Thao tác nhanh:
              </Text>
              <AppButton
                size="small"
                type="primary"
                disabled={attendanceLocked}
                onClick={() => handleMarkAll("present")}
                style={{
                  background: "#10B981",
                  borderColor: "#10B981",
                  borderRadius: 8,
                }}
              >
                Tất cả có mặt
              </AppButton>
              <AppButton
                size="small"
                disabled={attendanceLocked}
                onClick={() => handleMarkAll("absent")}
                style={{ borderRadius: 8 }}
              >
                Tất cả vắng
              </AppButton>
              <AppButton
                size="small"
                disabled={attendanceLocked}
                onClick={handleClearStatus}
                style={{ borderRadius: 8 }}
              >
                Xóa trạng thái
              </AppButton>
            </Space>

            <Input
              placeholder="Tìm tên học viên..."
              prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 240, borderRadius: 10 }}
            />
          </div>
        )}

        {loadingAttendance && (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                active
                avatar
                paragraph={{ rows: 1 }}
                style={{
                  marginBottom: 16,
                  padding: 12,
                  background: "#F8FAFC",
                  borderRadius: 12,
                }}
              />
            ))}
          </div>
        )}

        {!loadingAttendance && !selectedClassId && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Hãy chọn lớp ở trên để bắt đầu điểm danh nha! 🌸"
            style={{ padding: 60 }}
          />
        )}

        {!loadingAttendance && selectedClassId && students.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Lớp này chưa có học viên nào cả (｡•́︿•̀｡)"
            style={{ padding: 60 }}
          />
        )}

        {/* LIST ROWS */}
        {!loadingAttendance && students.length > 0 && (
          <div>
            {filteredStudents.length === 0 ? (
              <Empty
                description="Không tìm thấy học viên phù hợp"
                style={{ padding: 40 }}
              />
            ) : (
              filteredStudents.map((student, index) => {
                const currentStatus = student.status;
                const config = currentStatus
                  ? STATUS_CONFIG[currentStatus]
                  : null;

                return (
                  <div
                    key={student.student_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 16,
                      padding: "14px 18px",
                      borderRadius: 16,
                      marginBottom: 12,
                      background: config ? config.bg : "#FFFFFF",
                      border: `1px solid ${config ? config.border : COLORS.border}`,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* HỌC VIÊN */}
                    <Space size={14} align="center">
                      <div
                        style={{
                          width: 24,
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#94A3B8",
                          textAlign: "center",
                        }}
                      >
                        {index + 1}
                      </div>
                      <Avatar
                        size={42}
                        style={{
                          background: config ? config.color : "#94A3B8",
                          color: "#FFFFFF",
                          fontWeight: 700,
                        }}
                      >
                        {(student.student_name || "?").charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <Space size={6}>
                          <Text
                            strong
                            style={{ fontSize: 15, color: COLORS.textDark }}
                          >
                            {student.student_name}
                          </Text>
                          <Tooltip title="Xem lịch sử chuyên cần">
                            <AppButton
                              type="text"
                              size="small"
                              icon={
                                <EyeOutlined style={{ color: "#3B82F6" }} />
                              }
                              onClick={() => handleViewStudent(student)}
                              style={{ padding: "0 4px" }}
                            />
                          </Tooltip>
                        </Space>
                        <Text
                          type="secondary"
                          style={{ fontSize: 12, display: "block" }}
                        >
                          ID: {student.student_id}
                        </Text>
                      </div>
                    </Space>

                    {/* CỤM NÚT TRẠNG THÁI & GHI CHÚ */}
                    <Space size={16} wrap>
                      {/* GHI CHÚ NHANH */}
                      <Input
                        placeholder="Ghi chú (nếu có)..."
                        value={student.note}
                        disabled={attendanceLocked}
                        onChange={(e) =>
                          handleNoteChange(student.student_id, e.target.value)
                        }
                        style={{
                          width: 160,
                          borderRadius: 10,
                          background: "#FFF",
                        }}
                      />

                      {/* TRẠNG THÁI */}
                      <Space size={4}>
                        {STATUS_LIST.map((st) => {
                          const isSelected = currentStatus === st;
                          const stCfg = STATUS_CONFIG[st];

                          return (
                            <button
                              key={st}
                              disabled={attendanceLocked}
                              onClick={() =>
                                handleStatusChange(student.student_id, st)
                              }
                              style={{
                                padding: "6px 12px",
                                borderRadius: 10,
                                border: `1px solid ${isSelected ? stCfg.color : "#CBD5E1"}`,
                                background: isSelected
                                  ? stCfg.color
                                  : "#FFFFFF",
                                color: isSelected ? "#FFFFFF" : "#64748B",
                                fontSize: 13,
                                fontWeight: isSelected ? 700 : 500,
                                cursor: attendanceLocked
                                  ? "not-allowed"
                                  : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                opacity:
                                  attendanceLocked && !isSelected ? 0.6 : 1,
                                transition: "all 0.15s",
                              }}
                            >
                              {stCfg.icon}
                              <span>{stCfg.short}</span>
                            </button>
                          );
                        })}
                      </Space>
                    </Space>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>

      {/* FLOATING ACTION BAR */}
      {students.length > 0 && !loadingAttendance && !attendanceLocked && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: 600,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            padding: "12px 24px",
            borderRadius: 24,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 99,
          }}
        >
          <div>
            <Text style={{ fontSize: 13, color: COLORS.textDark }}>
              Đã điểm danh: <strong>{statistics.attended}</strong> /{" "}
              {statistics.total} bạn
            </Text>
          </div>
          <AppButton
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            Lưu Điểm Danh ✨
          </AppButton>
        </div>
      )}

      {/* MODAL LỊCH SỬ HỌC SINH */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: "#3B82F6" }} />
            <span>Lịch sử chuyên cần: {selectedStudent?.student_name}</span>
          </Space>
        }
        open={studentDetailOpen}
        onCancel={() => setStudentDetailOpen(false)}
        footer={null}
        width={650}
        style={{ borderRadius: 20 }}
      >
        {loadingStudentHistory ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <div>
            {/* THỐNG KÊ THÁNG */}
            <Row gutter={12} style={{ marginBottom: 20 }}>
              <Col span={6}>
                <Statistic
                  title="Tổng số buổi"
                  value={monthlyStudentStatistics.total}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Có mặt"
                  value={monthlyStudentStatistics.present}
                  valueStyle={{ color: "#15803D" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Muộn"
                  value={monthlyStudentStatistics.late}
                  valueStyle={{ color: "#B45309" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Vắng"
                  value={monthlyStudentStatistics.absent}
                  valueStyle={{ color: "#DC2626" }}
                />
              </Col>
            </Row>

            <Divider style={{ margin: "12px 0" }} />

            {monthlyHistory.length === 0 ? (
              <Empty
                description="Không có lịch sử điểm danh trong tháng này"
                style={{ padding: 30 }}
              />
            ) : (
              <div
                style={{ maxHeight: 350, overflowY: "auto", paddingRight: 4 }}
              >
                {monthlyHistory.map((item, idx) => {
                  const cfg = STATUS_CONFIG[item.status] || {};
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        marginBottom: 8,
                        borderRadius: 12,
                        background: cfg.bg || "#F8FAFC",
                        border: `1px solid ${cfg.border || "#E2E8F0"}`,
                      }}
                    >
                      <Space>
                        <CalendarOutlined style={{ color: "#64748B" }} />
                        <Text strong>
                          {dayjs(item.attendance_date).format("DD/MM/YYYY")}
                        </Text>
                      </Space>
                      <Tag color={cfg.color}>{cfg.label || item.status}</Tag>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendancePage;
