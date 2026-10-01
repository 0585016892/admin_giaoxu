import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";

import {
  ArrowLeftOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  IdcardOutlined,
  ManOutlined,
  PhoneOutlined,
  ReadOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UserOutlined,
  WomanOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import parentApi from "../../../../api/parentApi";

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN");
};

const formatTime = (value) => {
  if (!value) return "--:--";

  if (typeof value === "string") {
    return value.slice(0, 5);
  }

  return value;
};

const getGenderText = (gender) => {
  if (!gender) return "Chưa cập nhật";

  const value = String(gender).toLowerCase();

  if (value === "male" || value === "nam" || value === "m") {
    return "Nam";
  }

  if (value === "female" || value === "nữ" || value === "nu" || value === "f") {
    return "Nữ";
  }

  return gender;
};

const getAttendanceStatusText = (status) => {
  const value = String(status || "").toLowerCase();

  switch (value) {
    case "present":
      return "Có mặt";

    case "late":
      return "Đi muộn";

    case "absent":
      return "Vắng";

    case "excused":
      return "Có phép";

    default:
      return status || "Chưa xác định";
  }
};

const getAttendanceStatusColor = (status) => {
  const value = String(status || "").toLowerCase();

  switch (value) {
    case "present":
      return "green";

    case "late":
      return "orange";

    case "absent":
      return "red";

    case "excused":
      return "blue";

    default:
      return "default";
  }
};

const getCertificateStatusColor = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "issued" || value === "active" || value === "valid") {
    return "green";
  }

  if (value === "pending") {
    return "orange";
  }

  if (value === "cancelled" || value === "revoked") {
    return "red";
  }

  return "blue";
};

const getCertificateStatusText = (status) => {
  const value = String(status || "").toLowerCase();

  switch (value) {
    case "issued":
    case "active":
    case "valid":
      return "Đã cấp";

    case "pending":
      return "Đang xử lý";

    case "cancelled":
      return "Đã hủy";

    case "revoked":
      return "Đã thu hồi";

    default:
      return status || "Đã cấp";
  }
};

const getDayName = (day) => {
  if (day === null || day === undefined || day === "") {
    return "Chưa xác định";
  }

  const value = String(day).toLowerCase();

  const map = {
    0: "Chủ nhật",
    1: "Thứ 2",
    2: "Thứ 3",
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7",

    sunday: "Chủ nhật",
    monday: "Thứ 2",
    tuesday: "Thứ 3",
    wednesday: "Thứ 4",
    thursday: "Thứ 5",
    friday: "Thứ 6",
    saturday: "Thứ 7",

    cn: "Chủ nhật",
    t2: "Thứ 2",
    t3: "Thứ 3",
    t4: "Thứ 4",
    t5: "Thứ 5",
    t6: "Thứ 6",
    t7: "Thứ 7",
  };

  return map[value] || day;
};

const getAttendanceTypeText = (type) => {
  const value = String(type || "").toLowerCase();

  if (value === "catechism") {
    return "Học Giáo lý";
  }

  if (value === "mass") {
    return "Thánh lễ";
  }

  return type || "Khác";
};

const getExamTypeText = (type) => {
  const value = String(type || "").toLowerCase();

  switch (value) {
    case "online":
      return "Trực tuyến";

    case "paper":
      return "Trên giấy";

    default:
      return type || "Bài kiểm tra";
  }
};

const getScoreColor = (score) => {
  const value = Number(score);

  if (Number.isNaN(value)) {
    return undefined;
  }

  if (value >= 8) {
    return "green";
  }

  if (value >= 5) {
    return "orange";
  }

  return "red";
};

const getMonthRange = (monthValue) => {
  if (!monthValue) {
    return {};
  }

  const [year, month] = monthValue.split("-").map(Number);

  if (!year || !month) {
    return {};
  }

  const from = `${year}-${String(month).padStart(2, "0")}-01`;

  const lastDay = new Date(year, month, 0).getDate();

  const to = `${year}-${String(month).padStart(
    2,
    "0",
  )}-${String(lastDay).padStart(2, "0")}`;

  return {
    from,
    to,
  };
};

/**
 * =========================================================
 * NORMALIZE CHILD
 * =========================================================
 */
const normalizeChildData = (response) => {
  if (!response?.success) {
    return null;
  }

  const data = response?.data || {};
  const student = data?.student || {};

  const classes = Array.isArray(data?.classes) ? data.classes : [];

  const currentClass = classes.length > 0 ? classes[0] : null;

  const attendance = data?.attendance || {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attended: 0,
    rate: 0,
  };

  const family = data?.family || {
    father: {
      name: null,
      phone: null,
    },
    mother: {
      name: null,
      phone: null,
    },
    guardian: {
      name: null,
      phone: null,
      relationship: null,
    },
  };

  return {
    ...student,

    id: student.id,
    church_id: student.church_id,

    code: student.code || "",
    name: student.name || "Học sinh",

    gender: student.gender || null,
    date_of_birth: student.date_of_birth || null,

    phone: student.phone || null,
    email: student.email || null,

    address: student.address || null,
    parish: student.parish || null,

    avatar: student.avatar || null,

    status: student.status || null,

    birth_place: student.birth_place || null,
    nationality: student.nationality || null,

    saint_name: student.saint_name || null,

    catechism_level: student.catechism_level || null,

    catechism_status: student.catechism_status || null,

    enrollment_date: student.enrollment_date || null,

    note: student.note || null,

    qr_token: student.qr_token || null,

    created_at: student.created_at || null,

    updated_at: student.updated_at || null,

    relationship: data.relationship || null,

    is_primary: data.is_primary ?? false,

    family,

    classes,

    class: currentClass,

    className: currentClass?.name || "Chưa xếp lớp",

    classCode: currentClass?.code || "",

    room: currentClass?.room || null,

    catechist:
      currentClass?.catechist_name || currentClass?.catechistName || null,

    attendance,

    latestResult: data.latest_result || null,

    latest_result: data.latest_result || null,

    sacraments: Array.isArray(data.sacraments) ? data.sacraments : [],

    baptism: student.baptism || {
      name: null,
      date: null,
      place: null,
      parish: null,
      certificate_no: null,
    },

    first_communion: student.first_communion || {
      date: null,
      place: null,
    },

    confirmation: student.confirmation || {
      date: null,
      place: null,
      saint_name: null,
    },
  };
};
/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function ChildDetail() {
  const navigate = useNavigate();

  const { studentId } = useParams();

  const [messageApi, contextHolder] = message.useMessage();

  // CSS responsive được giới hạn trong trang chi tiết học sinh.
  useEffect(() => {
    const styleId = "parent-child-detail-responsive-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .parent-child-detail-page {
        color: #14264a;
        background: linear-gradient(180deg, #f0f7ff 0%, #f7faff 55%, #f8fafc 100%);
        min-height: 100%;
        font-family: Inter, "Be Vietnam Pro", "Segoe UI", sans-serif;
      }
      .parent-child-detail-container {
        box-sizing: border-box;
        max-width: 1680px !important;
        margin: 0 auto !important;
        padding: 12px 22px 28px !important;
      }
      .parent-child-detail-page .ant-card {
        border: 1px solid rgba(221, 232, 246, .95) !important;
        border-radius: 16px !important;
        box-shadow: 0 5px 20px rgba(28, 68, 120, .045) !important;
        transition: transform .2s ease, box-shadow .2s ease;
      }
      .parent-child-detail-page .ant-card:not(.ant-card-small):hover {
        box-shadow: 0 9px 25px rgba(28, 68, 120, .08) !important;
      }
      .parent-child-detail-page .ant-card-head {
        border-bottom-color: #edf2f9 !important;
        color: #14264a;
      }
      .parent-child-detail-page .ant-card-head-title {
        color: #14264a !important;
        font-weight: 800 !important;
      }
      .parent-child-detail-page .ant-btn-primary {
        background: #1769e8 !important;
        border-color: #1769e8 !important;
        border-radius: 9px !important;
        box-shadow: 0 4px 10px rgba(23, 105, 232, .15);
      }
      .parent-child-detail-page .ant-btn-primary:hover {
        background: #0f55c6 !important;
        border-color: #0f55c6 !important;
      }
      .parent-child-detail-page .ant-btn:not(.ant-btn-primary) {
        border-radius: 9px;
      }
      .parent-child-detail-page .ant-select-selector,
      .parent-child-detail-page input[type=month] {
        border-radius: 9px !important;
      }
      .parent-child-detail-page .ant-tag {
        border-radius: 7px;
        padding-inline: 9px;
        font-weight: 600;
      }
      .parent-child-detail-page .ant-statistic-title {
        color: #687b9a !important;
        font-size: 12px !important;
        font-weight: 650;
      }
      .parent-child-detail-page .ant-statistic-content {
        color: #14264a;
        font-weight: 800;
      }
      .parent-child-detail-page .ant-statistic-content-prefix {
        margin-right: 9px;
      }
      .parent-child-detail-page .ant-empty {
        padding: 14px 0;
      }
      .parent-child-detail-page .ant-card-body {
        min-width: 0;
      }
      .parent-child-detail-page .ant-alert {
        border-radius: 14px;
      }
      .parent-child-detail-page button:focus-visible {
        outline: 3px solid rgba(217,164,65,.55);
        outline-offset: 2px;
      }
      .parent-child-detail-hero {
        position: relative;
        overflow: hidden;
        border: 1px solid #dceaf9;
        background:
          radial-gradient(ellipse at 84% 20%, rgba(255,255,255,.88) 0, rgba(255,255,255,0) 31%),
          linear-gradient(105deg, #ffffff 0%, #eef7ff 48%, #d9edff 100%);
      }
      .parent-child-detail-hero::after {
        content: "";
        position: absolute;
        right: 0;
        bottom: 0;
        width: 34%;
        height: 100%;
        pointer-events: none;
        background: linear-gradient(90deg, rgba(232,245,255,0), rgba(255,255,255,.24));
      }
      .child-detail-avatar-placeholder {
        display: flex;
        flex: 0 0 126px;
        width: 126px;
        height: 126px;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border: 5px solid rgba(255,255,255,.95);
        border-radius: 50%;
        background: #f5f8fc;
        box-shadow: 0 5px 18px rgba(26, 67, 115, .12);
      }
      .child-detail-avatar-placeholder img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .child-detail-avatar-empty {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f7f9fc, #e9f0f8);
      }
      .parent-child-detail-tabs {
        position: sticky;
        top: 0;
        z-index: 3;
        background: rgba(255,255,255,.96);
        backdrop-filter: blur(10px);
      }
      .parent-child-detail-tabs button {
        position: relative;
        justify-content: center;
        min-height: 48px;
        border-radius: 10px !important;
        transition: color .18s ease, background .18s ease;
      }
      .parent-child-detail-tabs button:hover {
        background: #f1f6ff !important;
        color: #1769e8 !important;
      }
      .parent-child-detail-tabs button[aria-current="page"] {
        color: #1769e8 !important;
        background: #eef5ff !important;
      }
      .parent-child-detail-page .ant-progress-bg {
        border-radius: 99px;
      }
      @media (max-width: 1100px) {
        .parent-child-detail-container { padding-left: 16px !important; padding-right: 16px !important; }
      }
      @media (max-width: 768px) {
        .parent-child-detail-container { padding: 10px 12px 22px !important; }
        .parent-child-detail-page { padding-top: 8px !important; }
        .parent-child-detail-page .ant-card-body { padding: 16px; }
        .parent-child-detail-page .ant-card-head { padding-inline: 16px; }
        .parent-child-detail-page .ant-card-head-title { white-space: normal; }
        .child-detail-avatar-placeholder { flex-basis: 88px; width: 88px; height: 88px; }
      }
      @media (max-width: 560px) {
        .parent-child-detail-page .ant-statistic-title { font-size: 12px; }
        .parent-child-detail-page .ant-statistic-content { font-size: 23px; }
        .parent-child-detail-page .ant-space { max-width: 100%; }
        .parent-child-detail-container { padding-inline: 10px !important; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  /**
   * =======================================================
   * STATE
   * =======================================================
   */

  const [activeTab, setActiveTab] = useState("overview");

  const [child, setChild] = useState(null);

  const [attendanceData, setAttendanceData] = useState(null);

  const [resultsData, setResultsData] = useState(null);

  const [scheduleData, setScheduleData] = useState(null);

  const [certificatesData, setCertificatesData] = useState(null);

  const [loadingChild, setLoadingChild] = useState(true);

  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [loadingResults, setLoadingResults] = useState(false);

  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [loadingCertificates, setLoadingCertificates] = useState(false);

  const [error, setError] = useState("");

  /**
   * Attendance filters
   */

  const [attendanceMonth, setAttendanceMonth] = useState("");

  const [attendanceType, setAttendanceType] = useState("all");

  /**
   * Results filter
   */

  const [resultExamType, setResultExamType] = useState("all");

  /**
   * Schedule filter
   */

  const [scheduleType, setScheduleType] = useState("all");

  /**
   * =======================================================
   * LOAD CHILD
   * =======================================================
   */

  const loadChild = useCallback(async () => {
    if (!studentId) {
      setError("Không tìm thấy mã học sinh");
      setLoadingChild(false);
      return;
    }

    try {
      setLoadingChild(true);
      setError("");

      const response = await parentApi.getChild(studentId);

      const payload = response?.data;

      if (!payload?.success) {
        throw new Error(payload?.message || "Không thể tải thông tin học sinh");
      }

      const normalized = normalizeChildData(payload);

      if (!normalized) {
        throw new Error("Không có dữ liệu học sinh");
      }

      setChild(normalized);
    } catch (err) {
      setError(err?.message || "Không thể tải thông tin học sinh");

      setChild(null);
    } finally {
      setLoadingChild(false);
    }
  }, [studentId]);
  /**
   * =======================================================
   * LOAD ATTENDANCE
   * =======================================================
   */

  const loadAttendance = useCallback(async () => {
    if (!studentId) return;

    try {
      setLoadingAttendance(true);

      const monthRange = getMonthRange(attendanceMonth);

      const params = {
        page: 1,
        pageSize: 100,
      };

      if (attendanceType !== "all") {
        params.type = attendanceType;
      }

      if (monthRange.from) {
        params.from = monthRange.from;
      }

      if (monthRange.to) {
        params.to = monthRange.to;
      }

      const response = await parentApi.getChildAttendance(studentId, params);

      if (!response?.status) {
        throw new Error(response?.message || "Không thể tải dữ liệu điểm danh");
      }

      const attendance = response?.data?.data || response?.data || {};

      setAttendanceData({
        records: Array.isArray(attendance.records) ? attendance.records : [],

        summary: attendance.summary || {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          attended: 0,
          rate: 0,
        },

        pagination: attendance.pagination || {
          page: 1,
          pageSize: 100,
          total: 0,
          totalPages: 1,
        },
      });
    } catch (err) {
      setAttendanceData({
        records: [],
        summary: {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          attended: 0,
          rate: 0,
        },
        pagination: {
          page: 1,
          pageSize: 100,
          total: 0,
          totalPages: 1,
        },
      });
    } finally {
      setLoadingAttendance(false);
    }
  }, [studentId, attendanceMonth, attendanceType]);
  /**
   * =======================================================
   * LOAD RESULTS
   * =======================================================
   */

  const loadResults = useCallback(async () => {
    if (!studentId) return;

    try {
      setLoadingResults(true);

      const params = {};

      if (resultExamType !== "all") {
        params.exam_type = resultExamType;
      }

      const response = await parentApi.getChildResults(studentId, params);

      if (!response?.status) {
        throw new Error(response?.message || "Không thể tải kết quả");
      }

      setResultsData(response.data);
    } catch (err) {
      setResultsData({
        success: false,
        message: err?.message || "Không thể tải kết quả",
        data: [],
        records: [],
        summary: {},
      });
    } finally {
      setLoadingResults(false);
    }
  }, [studentId, resultExamType]);

  /**
   * =======================================================
   * LOAD SCHEDULE
   * =======================================================
   */

  const loadSchedule = useCallback(async () => {
    if (!studentId) return;

    try {
      setLoadingSchedule(true);

      const response = await parentApi.getChildSchedule(studentId);

      setScheduleData(response.data);
    } catch (err) {
      setScheduleData({
        success: false,
        message: err?.message || "Không thể tải lịch học",
        data: [],
        schedules: [],
      });
    } finally {
      setLoadingSchedule(false);
    }
  }, [studentId]);

  /**
   * =======================================================
   * LOAD CERTIFICATES
   * =======================================================
   */

  const loadCertificates = useCallback(async () => {
    if (!studentId) return;

    try {
      setLoadingCertificates(true);

      const response = await parentApi.getChildCertificates(studentId);

      if (!response?.success) {
        throw new Error(response?.message || "Không thể tải chứng chỉ");
      }

      setCertificatesData(response);
    } catch (err) {
      setCertificatesData({
        success: false,
        message: err?.message || "Không thể tải chứng chỉ",
        data: [],
        certificates: [],
      });
    } finally {
      setLoadingCertificates(false);
    }
  }, [studentId]);

  /**
   * =======================================================
   * INITIAL LOAD
   * =======================================================
   */

  useEffect(() => {
    loadChild();
  }, [loadChild]);

  /**
   * =======================================================
   * LOAD DATA WHEN TAB CHANGES
   * =======================================================
   */

  useEffect(() => {
    if (!studentId) return;

    if (activeTab === "attendance") {
      loadAttendance();
    }

    if (activeTab === "results") {
      loadResults();
    }

    if (activeTab === "schedule") {
      loadSchedule();
    }

    if (activeTab === "certificates") {
      loadCertificates();
    }
  }, [
    activeTab,
    studentId,
    loadAttendance,
    loadResults,
    loadSchedule,
    loadCertificates,
  ]);

  /**
   * =======================================================
   * OVERVIEW DATA
   * =======================================================
   */

  const overviewAttendance = useMemo(() => {
    const summary = child?.attendance || {};

    const total = Number(summary.total ?? summary.total_attendance ?? 0);

    const present = Number(summary.present ?? summary.present_count ?? 0);

    const late = Number(summary.late ?? summary.late_count ?? 0);

    const absent = Number(summary.absent ?? summary.absent_count ?? 0);

    const excused = Number(summary.excused ?? summary.excused_count ?? 0);

    const rate =
      summary.rate !== undefined
        ? Number(summary.rate)
        : total > 0
          ? ((present + late) / total) * 100
          : 0;

    return {
      total,
      present,
      late,
      absent,
      excused,
      rate: Math.round(rate),
    };
  }, [child]);

  /**
   * =======================================================
   * CURRENT CLASS
   * =======================================================
   */

  const currentClass = useMemo(() => {
    if (!child) return null;

    if (child.class) {
      return child.class;
    }

    if (Array.isArray(child.classes) && child.classes.length) {
      return child.classes[0];
    }

    return null;
  }, [child]);
  console.log(child);

  /**
   * =======================================================
   * LATEST SCORE
   * =======================================================
   */

  const latestScore = useMemo(() => {
    const result = child?.latestResult;

    if (!result) {
      return null;
    }

    return result.score ?? result.result ?? result.point ?? null;
  }, [child]);

  /**
   * =======================================================
   * NEXT CLASS
   * =======================================================
   */

  const nextClass = useMemo(() => {
    if (!currentClass) return null;

    return {
      day:
        currentClass?.schedules?.[0]?.day_of_week ??
        currentClass?.schedules?.[0]?.dayOfWeek,

      start:
        currentClass?.schedules?.[0]?.start_time ??
        currentClass?.schedules?.[0]?.startTime,

      end:
        currentClass?.schedules?.[0]?.end_time ??
        currentClass?.schedules?.[0]?.endTime,

      room: currentClass?.schedules?.[0]?.room,

      name: currentClass.name || child?.className || "Lớp Giáo lý",
    };
  }, [currentClass, child]);

  /**
   * =======================================================
   * ATTENDANCE RECORDS
   * =======================================================
   */

  const attendanceRecords = useMemo(() => {
    if (!attendanceData) return [];

    const records =
      attendanceData.records ||
      attendanceData.data?.records ||
      attendanceData.data ||
      attendanceData.attendances ||
      [];

    return Array.isArray(records) ? records : [];
  }, [attendanceData]);

  /**
   * =======================================================
   * ATTENDANCE SUMMARY
   * =======================================================
   */

  const attendanceSummary = useMemo(() => {
    if (!attendanceData) {
      return overviewAttendance;
    }

    return (
      attendanceData.summary ||
      attendanceData.data?.summary ||
      overviewAttendance
    );
  }, [attendanceData, overviewAttendance]);

  /**
   * =======================================================
   * RESULTS RECORDS
   * =======================================================
   */

  const resultRecords = useMemo(() => {
    if (!resultsData) return [];

    const records =
      resultsData.records ||
      resultsData.data?.records ||
      resultsData.data ||
      resultsData.results ||
      [];

    return Array.isArray(records) ? records : [];
  }, [resultsData]);

  /**
   * =======================================================
   * RESULTS SUMMARY
   * =======================================================
   */

  const resultSummary = useMemo(() => {
    return resultsData?.summary || resultsData?.data?.summary || {};
  }, [resultsData]);

  /**
   * =======================================================
   * SCHEDULE RECORDS
   * =======================================================
   */

  const scheduleRecords = useMemo(() => {
    if (!scheduleData) return [];

    const records =
      scheduleData.schedules ||
      scheduleData.records ||
      scheduleData.data?.schedules ||
      scheduleData.data?.records ||
      scheduleData.data ||
      [];

    return Array.isArray(records) ? records : [];
  }, [scheduleData]);

  /**
   * =======================================================
   * FILTER SCHEDULE
   * =======================================================
   */

  const filteredSchedule = useMemo(() => {
    if (scheduleType === "all") {
      return scheduleRecords;
    }

    return scheduleRecords.filter((item) => {
      const type =
        item.type || item.schedule_type || item.category || "catechism";

      return String(type).toLowerCase() === String(scheduleType).toLowerCase();
    });
  }, [scheduleRecords, scheduleType]);

  /**
   * =======================================================
   * CERTIFICATES
   * =======================================================
   */

  const certificateRecords = useMemo(() => {
    if (!certificatesData) return [];

    const records =
      certificatesData.certificates ||
      certificatesData.records ||
      certificatesData.data?.certificates ||
      certificatesData.data?.records ||
      certificatesData.data ||
      [];

    return Array.isArray(records) ? records : [];
  }, [certificatesData]);

  /**
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (loadingChild) {
    return (
      <div className="parent-child-detail-page" style={styles.page}>
        {contextHolder}

        <div
          className="parent-child-detail-container parent-child-detail-loading"
          style={styles.loadingContainer}
        >
          <Card style={styles.loadingCard}>
            <Skeleton
              active
              avatar={{ size: 88 }}
              paragraph={{
                rows: 7,
              }}
            />
          </Card>
        </div>
      </div>
    );
  }

  /**
   * =======================================================
   * ERROR
   * =======================================================
   */

  if (error || !child) {
    return (
      <div className="parent-child-detail-page" style={styles.page}>
        {contextHolder}

        <div className="parent-child-detail-container" style={styles.container}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{
              marginBottom: 20,
            }}
          >
            Quay lại
          </Button>

          <Alert
            type="error"
            showIcon
            message="Không thể tải học sinh"
            description={error || "Không tìm thấy thông tin học sinh"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="parent-child-detail-page" style={styles.page}>
      {contextHolder}

      <div className="parent-child-detail-container" style={styles.container}>
        {/* =================================================
            BACK
        ================================================= */}

        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          Quay lại danh sách con
        </Button>

        {/* =================================================
            HERO
        ================================================= */}

        <Card
          bordered={false}
          className="parent-child-detail-hero"
          style={styles.heroCard}
        >
          <div style={styles.hero}>
            <div
              className="child-detail-avatar-placeholder"
              aria-label="Ảnh đại diện học sinh"
            >
              {child.avatar ? (
                <img src={child.avatar} alt="" />
              ) : (
                <div className="child-detail-avatar-empty" />
              )}
            </div>

            <div style={styles.heroInfo}>
              <div style={styles.heroTitleRow}>
                <Title level={2} style={styles.heroTitle}>
                  {child.name}
                </Title>

                <Tag color="green">
                  {child.status === "studying"
                    ? "Đang học"
                    : child.status || "Đang học"}
                </Tag>
              </div>

              <div style={styles.heroMeta}>
                <span>
                  <IdcardOutlined />
                  Mã HS: <strong>{child.code || "--"}</strong>
                </span>

                <span>
                  {String(child.gender || "").toLowerCase() === "female" ? (
                    <WomanOutlined />
                  ) : (
                    <ManOutlined />
                  )}

                  {getGenderText(child.gender)}
                </span>

                <span>
                  <CalendarOutlined />
                  {formatDate(child.date_of_birth)}
                </span>
              </div>

              <div style={styles.heroClass}>
                <TeamOutlined />

                <strong>{child.className || "Chưa xếp lớp"}</strong>

                {child.classCode && <Tag>{child.classCode}</Tag>}

                {child.room && (
                  <span>
                    <EnvironmentOutlined />
                    {child.room}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* =================================================
            TABS
        ================================================= */}

        <Card
          bordered={false}
          style={styles.tabCard}
          bodyStyle={{
            padding: 8,
          }}
        >
          <div className="parent-child-detail-tabs" style={styles.tabs}>
            {[
              {
                key: "overview",
                label: "Tổng quan",
                icon: <UserOutlined />,
              },
              {
                key: "attendance",
                label: "Điểm danh",
                icon: <CheckCircleOutlined />,
              },
              {
                key: "results",
                label: "Kết quả",
                icon: <RiseOutlined />,
              },
              {
                key: "lessons",
                label: "Bài học",
                icon: <ReadOutlined />,
              },
              {
                key: "schedule",
                label: "Lịch học",
                icon: <ScheduleOutlined />,
              },
              {
                key: "certificates",
                label: "Chứng chỉ",
                icon: <SafetyCertificateOutlined />,
              },
              {
                key: "notifications",
                label: "Thông báo",
                icon: <BellOutlined />,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.key ? styles.tabActive : {}),
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {activeTab === "overview" && (
          <OverviewTab
            child={child}
            currentClass={currentClass}
            nextClass={nextClass}
            attendance={overviewAttendance}
            latestScore={latestScore}
            certificateCount={certificateRecords.length}
            onOpenAttendance={() => setActiveTab("attendance")}
            onOpenResults={() => setActiveTab("results")}
            onOpenCertificates={() => setActiveTab("certificates")}
          />
        )}

        {/* =================================================
            ATTENDANCE
        ================================================= */}

        {activeTab === "attendance" && (
          <AttendanceTab
            loading={loadingAttendance}
            month={attendanceMonth}
            type={attendanceType}
            setMonth={setAttendanceMonth}
            setType={setAttendanceType}
            summary={attendanceSummary}
            records={attendanceRecords}
            onReload={loadAttendance}
          />
        )}

        {/* =================================================
            RESULTS
        ================================================= */}

        {activeTab === "results" && (
          <ResultsTab
            loading={loadingResults}
            examType={resultExamType}
            setExamType={setResultExamType}
            summary={resultSummary}
            records={resultRecords}
            latestResult={child.latestResult}
            onReload={loadResults}
          />
        )}

        {/* =================================================
            SCHEDULE
        ================================================= */}

        {activeTab === "schedule" && (
          <ScheduleTab
            loading={loadingSchedule}
            type={scheduleType}
            setType={setScheduleType}
            records={filteredSchedule}
            onReload={loadSchedule}
          />
        )}

        {/* =================================================
            LESSONS PLACEHOLDER
        ================================================= */}

        {activeTab === "lessons" && (
          <Card bordered={false} style={{ marginTop: 16, borderRadius: 16 }}>
            <Empty description="Khu vực bài học — sẽ bổ sung dữ liệu sau" />
          </Card>
        )}

        {/* =================================================
            CERTIFICATES
        ================================================= */}

        {activeTab === "certificates" && (
          <CertificatesTab
            loading={loadingCertificates}
            records={certificateRecords}
            onReload={loadCertificates}
            messageApi={messageApi}
          />
        )}

        {/* =================================================
            NOTIFICATIONS PLACEHOLDER
        ================================================= */}

        {activeTab === "notifications" && (
          <Card bordered={false} style={{ marginTop: 16, borderRadius: 16 }}>
            <Empty description="Khu vực thông báo — sẽ bổ sung dữ liệu sau" />
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * =========================================================
 * OVERVIEW TAB
 * =========================================================
 */

function OverviewTab({
  child,
  currentClass,
  nextClass,
  attendance,
  latestScore,
  certificateCount,
  onOpenAttendance,
  onOpenResults,
  onOpenCertificates,
}) {
  return (
    <div style={styles.content}>
      {/* ===================================================
          STATISTICS
      =================================================== */}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title="Tỷ lệ chuyên cần"
              value={attendance.rate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{
                color: attendance.rate >= 80 ? "#16a34a" : "#dc2626",
              }}
            />

            <Button
              type="link"
              onClick={onOpenAttendance}
              style={{
                paddingLeft: 0,
              }}
            >
              Xem điểm danh
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title="Có mặt"
              value={attendance.present}
              prefix={<CheckCircleOutlined />}
              valueStyle={{
                color: "#16a34a",
              }}
            />

            <Text type="secondary">Tổng {attendance.total} buổi</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title="Điểm gần nhất"
              value={
                latestScore === null || latestScore === undefined
                  ? "--"
                  : Number(latestScore)
              }
              suffix={
                latestScore !== null && latestScore !== undefined ? "/10" : ""
              }
              prefix={<RiseOutlined />}
              valueStyle={{
                color:
                  latestScore !== null && Number(latestScore) >= 5
                    ? "#16a34a"
                    : "#dc2626",
              }}
            />

            <Button
              type="link"
              onClick={onOpenResults}
              style={{
                paddingLeft: 0,
              }}
            >
              Xem kết quả
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title="Chứng nhận"
              value={certificateCount}
              prefix={<SafetyCertificateOutlined />}
            />

            <Button
              type="link"
              onClick={onOpenCertificates}
              style={{
                paddingLeft: 0,
              }}
            >
              Xem chứng nhận
            </Button>
          </Card>
        </Col>
      </Row>

      {/* ===================================================
          PERSONAL + CLASS
      =================================================== */}

      <Row
        gutter={[16, 16]}
        style={{
          marginTop: 16,
        }}
      >
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                Thông tin cá nhân
              </Space>
            }
            bordered={false}
            style={styles.sectionCard}
          >
            <InfoRow
              icon={<IdcardOutlined />}
              label="Mã học sinh"
              value={child.code}
            />

            <InfoRow
              icon={<CalendarOutlined />}
              label="Ngày sinh"
              value={formatDate(child.date_of_birth)}
            />

            <InfoRow
              icon={
                String(child.gender || "").toLowerCase() === "female" ? (
                  <WomanOutlined />
                ) : (
                  <ManOutlined />
                )
              }
              label="Giới tính"
              value={getGenderText(child.gender)}
            />

            <InfoRow
              icon={<PhoneOutlined />}
              label="Điện thoại"
              value={child.phone || "Chưa cập nhật"}
            />

            <InfoRow
              icon={<HomeOutlined />}
              label="Địa chỉ"
              value={child.address || "Chưa cập nhật"}
            />

            <InfoRow
              icon={<HomeOutlined />}
              label="Giáo xứ"
              value={child.parish || "Chưa cập nhật"}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TeamOutlined />
                Lớp học hiện tại
              </Space>
            }
            bordered={false}
            style={styles.sectionCard}
          >
            <InfoRow
              icon={<TeamOutlined />}
              label="Lớp"
              value={currentClass?.name || child.className || "Chưa xếp lớp"}
            />

            <InfoRow
              icon={<IdcardOutlined />}
              label="Mã lớp"
              value={currentClass?.code || child.classCode || "Chưa có"}
            />

            <InfoRow
              icon={<EnvironmentOutlined />}
              label="Phòng"
              value={
                currentClass?.schedules?.[0]?.room ||
                child.room ||
                "Chưa cập nhật"
              }
            />

            <InfoRow
              icon={<CalendarOutlined />}
              label="Ngày học"
              value={
                currentClass?.schedules?.[0]?.day_of_week != null
                  ? getDayName(currentClass.schedules[0].day_of_week)
                  : "Chưa cập nhật"
              }
            />

            <InfoRow
              icon={<ClockCircleOutlined />}
              label="Thời gian"
              value={
                currentClass?.schedules?.[0]
                  ? `${formatTime(
                      currentClass.schedules[0].start_time,
                    )} - ${formatTime(currentClass.schedules[0].end_time)}`
                  : "Chưa cập nhật"
              }
            />

            <InfoRow
              icon={<UserOutlined />}
              label="Giáo lý viên"
              value={
                currentClass?.catechist_name ||
                currentClass?.catechistName ||
                child.catechist ||
                "Chưa cập nhật"
              }
            />
          </Card>
        </Col>
      </Row>

      {/* ===================================================
          FAMILY
      =================================================== */}

      <Card
        title={
          <Space>
            <TeamOutlined />
            Thông tin gia đình
          </Space>
        }
        bordered={false}
        style={{
          ...styles.sectionCard,
          marginTop: 16,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <FamilyCard
              title="Cha"
              icon={<ManOutlined />}
              name={child.family?.father?.name}
              phone={child.family?.father?.phone}
            />
          </Col>

          <Col xs={24} md={8}>
            <FamilyCard
              title="Mẹ"
              icon={<WomanOutlined />}
              name={child.family?.mother?.name}
              phone={child.family?.mother?.phone}
            />
          </Col>

          <Col xs={24} md={8}>
            <FamilyCard
              title="Người giám hộ"
              icon={<UserOutlined />}
              name={child.family?.guardian?.name}
              phone={child.family?.guardian?.phone}
              relationship={child.family?.guardian?.relationship}
            />
          </Col>
        </Row>
      </Card>

      {/* ===================================================
          NEXT CLASS
      =================================================== */}

      {nextClass && (
        <Card
          title={
            <Space>
              <ScheduleOutlined />
              Lịch học
            </Space>
          }
          bordered={false}
          style={{
            ...styles.sectionCard,
            marginTop: 16,
          }}
        >
          <div style={styles.nextClass}>
            <div style={styles.nextClassIcon}>
              <CalendarOutlined />
            </div>

            <div style={{ flex: 1 }}>
              <Text
                type="secondary"
                style={{
                  fontSize: 13,
                }}
              >
                Lịch học định kỳ
              </Text>

              <div
                style={{
                  marginTop: 4,
                }}
              >
                <Text
                  strong
                  style={{
                    fontSize: 17,
                  }}
                >
                  {nextClass.name}
                </Text>
              </div>

              <div
                style={{
                  marginTop: 8,
                }}
              >
                <Space wrap size={16}>
                  <span>
                    <CalendarOutlined /> {getDayName(nextClass.day)}
                  </span>

                  <span>
                    <ClockCircleOutlined /> {formatTime(nextClass.start)} -{" "}
                    {formatTime(nextClass.end)}
                  </span>

                  <span>
                    <EnvironmentOutlined />
                    Phòng {nextClass.room || "Chưa cập nhật"}
                  </span>
                </Space>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ===================================================
          SACRAMENTS
      =================================================== */}

      <Card
        title={
          <Space>
            <SafetyCertificateOutlined />
            Các Bí tích
          </Space>
        }
        bordered={false}
        style={{
          ...styles.sectionCard,
          marginTop: 16,
        }}
      >
        {Array.isArray(child.sacraments) && child.sacraments.length > 0 ? (
          <Row gutter={[12, 12]}>
            {child.sacraments.map((sacrament, index) => (
              <Col xs={24} md={12} key={sacrament.id || index}>
                <Card size="small" style={styles.sacramentCard}>
                  <Space direction="vertical" size={4}>
                    <Text strong>
                      {sacrament.name || sacrament.type || "Bí tích"}
                    </Text>

                    {sacrament.date_received && (
                      <Text type="secondary">
                        Ngày: {formatDate(sacrament.date_received)}
                      </Text>
                    )}

                    {sacrament.saint_name && (
                      <Text type="secondary">
                        Tên thánh: {sacrament.saint_name}
                      </Text>
                    )}

                    {sacrament.church_name_custom && (
                      <Text type="secondary">
                        Nơi lãnh nhận: {sacrament.church_name_custom}
                      </Text>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có dữ liệu Bí tích"
          />
        )}
      </Card>
    </div>
  );
}

/**
 * =========================================================
 * ATTENDANCE TAB
 * =========================================================
 */

function AttendanceTab({
  loading,
  month,
  type,
  setMonth,
  setType,
  summary,
  records,
  onReload,
}) {
  const total = Number(summary?.total) || 0;

  const present =
    Number(summary?.present) || Number(summary?.present_count) || 0;

  const late = Number(summary?.late) || Number(summary?.late_count) || 0;

  const absent = Number(summary?.absent) || Number(summary?.absent_count) || 0;

  const excused =
    Number(summary?.excused) || Number(summary?.excused_count) || 0;

  const rate =
    summary?.rate !== undefined
      ? Number(summary.rate)
      : total > 0
        ? ((present + late) / total) * 100
        : 0;

  return (
    <div style={styles.content}>
      {/* ===================================================
          FILTER
      =================================================== */}

      <Card bordered={false} style={styles.filterCard}>
        <Space wrap size={12}>
          <div>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: 6,
              }}
            >
              Tháng
            </Text>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={styles.monthInput}
            />
          </div>

          <div>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: 6,
              }}
            >
              Loại điểm danh
            </Text>

            <Select
              value={type}
              onChange={setType}
              style={{
                minWidth: 180,
              }}
            >
              <Option value="all">Tất cả</Option>

              <Option value="catechism">Học Giáo lý</Option>

              <Option value="mass">Thánh lễ</Option>
            </Select>
          </div>

          <Button
            type="primary"
            onClick={onReload}
            loading={loading}
            style={{
              marginTop: 24,
            }}
          >
            Tải lại
          </Button>
        </Space>
      </Card>

      {/* ===================================================
          STATS
      =================================================== */}

      <Row
        gutter={[16, 16]}
        style={{
          marginTop: 16,
        }}
      >
        {/* TỔNG BUỔI */}
        <Col xs={12} sm={12} md={8} lg={4}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic title="Tổng buổi" value={total} />
          </Card>
        </Col>

        {/* CÓ MẶT */}
        <Col xs={12} sm={12} md={8} lg={5}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title="Có mặt"
              value={present}
              valueStyle={{
                color: "#16a34a",
              }}
            />
          </Card>
        </Col>

        {/* ĐI MUỘN */}
        <Col xs={12} sm={12} md={8} lg={5}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title="Đi muộn"
              value={late}
              valueStyle={{
                color: "#d97706",
              }}
            />
          </Card>
        </Col>

        {/* VẮNG */}
        <Col xs={12} sm={12} md={8} lg={5}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title="Vắng"
              value={absent}
              valueStyle={{
                color: "#dc2626",
              }}
            />
          </Card>
        </Col>

        {/* CÓ PHÉP */}
        <Col xs={12} sm={12} md={8} lg={5}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title="Có phép"
              value={excused}
              valueStyle={{
                color: "#2563eb",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===================================================
          RATE
      =================================================== */}

      <Card
        bordered={false}
        style={{
          ...styles.sectionCard,
          marginTop: 16,
        }}
      >
        <div style={styles.rateBox}>
          <div>
            <Text type="secondary">Tỷ lệ chuyên cần</Text>

            <div style={styles.rateValue}>{Math.round(rate)}%</div>
          </div>

          <div style={styles.rateTrack}>
            <div
              style={{
                ...styles.rateBar,
                width: `${Math.min(Math.max(rate, 0), 100)}%`,
              }}
            />
          </div>

          <div>
            <Text type="secondary">Có phép: {excused}</Text>
          </div>
        </div>
      </Card>

      {/* ===================================================
          RECORDS
      =================================================== */}

      <Card
        title={
          <Space>
            <CheckCircleOutlined />
            Lịch sử điểm danh
          </Space>
        }
        bordered={false}
        style={{
          ...styles.sectionCard,
          marginTop: 16,
        }}
      >
        {loading ? (
          <Skeleton
            active
            paragraph={{
              rows: 8,
            }}
          />
        ) : records.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có dữ liệu điểm danh"
          />
        ) : (
          <div style={styles.attendanceList}>
            {records.map((item, index) => {
              const status = item.status || item.attendance_status;

              const date = item.attendance_date || item.date;

              const className =
                item.class_name || item.className || "Lớp Giáo lý";

              const attendanceType = item.attendance_type || item.type;

              return (
                <div
                  key={item.id || `${date}-${index}`}
                  style={styles.attendanceItem}
                >
                  <div style={styles.attendanceDate}>
                    <Text strong>{formatDate(date)}</Text>

                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      {getAttendanceTypeText(attendanceType)}
                    </Text>
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text strong>{className}</Text>

                    {item.room && (
                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          fontSize: 12,
                          marginTop: 3,
                        }}
                      >
                        Phòng {item.room}
                      </Text>
                    )}
                  </div>

                  <Tag color={getAttendanceStatusColor(status)}>
                    {getAttendanceStatusText(status)}
                  </Tag>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/**
 * =========================================================
 * RESULTS TAB
 * =========================================================
 */

function ResultsTab({
  loading,
  examType,
  setExamType,
  summary,
  records,
  latestResult,
  onReload,
}) {
  const average = summary?.average ?? summary?.avg ?? 0;

  const highest = summary?.highest ?? summary?.max ?? 0;

  const lowest = summary?.lowest ?? summary?.min ?? 0;

  const latest = summary?.latest?.score ?? latestResult?.score ?? 0;

  return (
    <div style={styles.content}>
      {/* ===================================================
          FILTER
      =================================================== */}

      <Card bordered={false} style={styles.filterCard}>
        <Space wrap size={12}>
          <div>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: 6,
              }}
            >
              Hình thức kiểm tra
            </Text>

            <Select
              value={examType}
              onChange={setExamType}
              style={{
                minWidth: 180,
              }}
            >
              <Option value="all">Tất cả</Option>

              <Option value="online">Trực tuyến</Option>

              <Option value="paper">Trên giấy</Option>
            </Select>
          </div>

          <Button
            type="primary"
            onClick={onReload}
            loading={loading}
            style={{
              marginTop: 24,
            }}
          >
            Tải lại
          </Button>
        </Space>
      </Card>

      {/* ===================================================
          STATS
      =================================================== */}

      <Row
        gutter={[16, 16]}
        style={{
          marginTop: 16,
        }}
      >
        <Col xs={24} sm={8}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title="Điểm trung bình"
              value={Number(average) || 0}
              precision={2}
              suffix="/10"
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title="Điểm cao nhất"
              value={Number(highest) || 0}
              precision={2}
              suffix="/10"
              valueStyle={{
                color: "#16a34a",
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title="Điểm gần nhất"
              value={Number(latest) || 0}
              precision={2}
              suffix="/10"
              valueStyle={{
                color: getScoreColor(latest),
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===================================================
          RESULT LIST
      =================================================== */}

      <Card
        title={
          <Space>
            <RiseOutlined />
            Kết quả học tập
          </Space>
        }
        bordered={false}
        style={{
          ...styles.sectionCard,
          marginTop: 16,
        }}
      >
        {loading ? (
          <Skeleton
            active
            paragraph={{
              rows: 8,
            }}
          />
        ) : records.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có kết quả học tập"
          />
        ) : (
          <div style={styles.resultList}>
            {records.map((item, index) => {
              const score = item.score ?? item.point ?? item.result;

              const examTypeValue = item.exam_type || item.examType;

              const title =
                item.title ||
                item.subject_name ||
                item.subjectName ||
                item.exam_name ||
                item.examName ||
                "Bài kiểm tra";

              return (
                <div key={item.id || index} style={styles.resultItem}>
                  <div style={styles.resultInfo}>
                    <Text strong>{title}</Text>

                    <div
                      style={{
                        marginTop: 6,
                      }}
                    >
                      <Space size={12} wrap>
                        <Text type="secondary">
                          {formatDate(
                            item.exam_date || item.examDate || item.date,
                          )}
                        </Text>

                        <Tag>{getExamTypeText(examTypeValue)}</Tag>

                        {item.note && <Text type="secondary">{item.note}</Text>}
                      </Space>
                    </div>
                  </div>

                  <div style={styles.scoreCircle}>
                    <span
                      style={{
                        color: getScoreColor(score) || "#173B5E",
                      }}
                    >
                      {score === null || score === undefined
                        ? "--"
                        : Number(score).toFixed(1)}
                    </span>

                    <small>/10</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {lowest !== 0 && (
          <Text
            type="secondary"
            style={{
              display: "block",
              marginTop: 16,
            }}
          >
            Điểm thấp nhất: {Number(lowest).toFixed(2)}
          </Text>
        )}
      </Card>
    </div>
  );
}

/**
 * =========================================================
 * SCHEDULE TAB
 * =========================================================
 */

function ScheduleTab({ loading, type, setType, records, onReload }) {
  return (
    <div style={styles.content}>
      <Card bordered={false} style={styles.filterCard}>
        <Space wrap size={12}>
          <div>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: 6,
              }}
            >
              Loại lịch
            </Text>

            <Select
              value={type}
              onChange={setType}
              style={{
                minWidth: 180,
              }}
            >
              <Option value="all">Tất cả</Option>

              <Option value="catechism">Học Giáo lý</Option>

              <Option value="mass">Thánh lễ</Option>
            </Select>
          </div>

          <Button
            type="primary"
            onClick={onReload}
            loading={loading}
            style={{
              marginTop: 24,
            }}
          >
            Tải lại
          </Button>
        </Space>
      </Card>

      <Card
        title={
          <Space>
            <ScheduleOutlined />
            Lịch học
          </Space>
        }
        bordered={false}
        style={{
          ...styles.sectionCard,
          marginTop: 16,
        }}
      >
        {loading ? (
          <Skeleton
            active
            paragraph={{
              rows: 8,
            }}
          />
        ) : records.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có lịch học"
          />
        ) : (
          <div style={styles.scheduleList}>
            {records.map((item, index) => {
              const day = item.day_of_week ?? item.dayOfWeek;

              const start = item.start_time || item.startTime;

              const end = item.end_time || item.endTime;

              const className =
                item.class_name || item.className || item.name || "Lớp Giáo lý";

              const room = item.room;

              const scheduleType =
                item.type || item.schedule_type || item.category || "catechism";

              return (
                <div key={item.id || index} style={styles.scheduleItem}>
                  <div style={styles.scheduleDay}>
                    <div>{getDayName(day)}</div>

                    <Text type="secondary">{formatTime(start)}</Text>
                  </div>

                  <div
                    style={{
                      width: 2,
                      background: "#D9A441",
                      borderRadius: 2,
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                      paddingLeft: 18,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <Text strong>{className}</Text>

                      <Tag>{getAttendanceTypeText(scheduleType)}</Tag>
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                      }}
                    >
                      <Space wrap size={16}>
                        <span>
                          <ClockCircleOutlined /> {formatTime(start)} -{" "}
                          {formatTime(end)}
                        </span>

                        <span>
                          <EnvironmentOutlined /> {room || "Chưa cập nhật"}
                        </span>
                      </Space>
                    </div>

                    {(item.catechist_name || item.catechistName) && (
                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          marginTop: 8,
                        }}
                      >
                        Giáo lý viên:{" "}
                        {item.catechist_name || item.catechistName}
                      </Text>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/**
 * =========================================================
 * CERTIFICATES TAB
 * =========================================================
 */

function CertificatesTab({ loading, records, onReload, messageApi }) {
  const handleDownload = (item) => {
    const url =
      item.file_url || item.fileUrl || item.download_url || item.downloadUrl;

    if (!url) {
      messageApi.warning("Chứng nhận này chưa có file tải xuống");

      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={styles.content}>
      <Card
        title={
          <Space>
            <SafetyCertificateOutlined />
            Chứng nhận & chứng chỉ
          </Space>
        }
        bordered={false}
        style={styles.sectionCard}
      >
        {loading ? (
          <Skeleton
            active
            paragraph={{
              rows: 8,
            }}
          />
        ) : records.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có chứng nhận"
          />
        ) : (
          <Row gutter={[16, 16]}>
            {records.map((item, index) => {
              const title =
                item.title ||
                item.certificate_title ||
                item.name ||
                item.certificate_type ||
                "Chứng nhận";

              const type = item.certificate_type || item.type;

              const issueDate =
                item.issue_date || item.issueDate || item.date_received;

              const number =
                item.certificate_number ||
                item.certificateNumber ||
                item.number;

              const status = item.status || "issued";

              const fileUrl =
                item.file_url ||
                item.fileUrl ||
                item.download_url ||
                item.downloadUrl;

              return (
                <Col xs={24} md={12} lg={8} key={item.id || index}>
                  <Card hoverable bordered style={styles.certificateCard}>
                    <div style={styles.certificateIcon}>
                      <SafetyCertificateOutlined />
                    </div>

                    <Title
                      level={5}
                      style={{
                        marginTop: 14,
                        marginBottom: 8,
                      }}
                    >
                      {title}
                    </Title>

                    {type && <Tag>{type}</Tag>}

                    <div
                      style={{
                        marginTop: 14,
                      }}
                    >
                      <InfoRow
                        icon={<CalendarOutlined />}
                        label="Ngày cấp"
                        value={formatDate(issueDate)}
                      />

                      {number && (
                        <InfoRow
                          icon={<IdcardOutlined />}
                          label="Số chứng nhận"
                          value={number}
                        />
                      )}

                      <InfoRow
                        icon={<SafetyCertificateOutlined />}
                        label="Trạng thái"
                        value={
                          <Tag color={getCertificateStatusColor(status)}>
                            {getCertificateStatusText(status)}
                          </Tag>
                        }
                      />
                    </div>

                    <Button
                      block
                      icon={<DownloadOutlined />}
                      disabled={!fileUrl}
                      onClick={() => handleDownload(item)}
                      style={{
                        marginTop: 14,
                      }}
                    >
                      {fileUrl ? "Tải chứng nhận" : "Chưa có file"}
                    </Button>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>
    </div>
  );
}

/**
 * =========================================================
 * INFO ROW
 * =========================================================
 */

function InfoRow({ icon, label, value }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoIcon}>{icon}</div>

      <div style={styles.infoLabel}>{label}</div>

      <div style={styles.infoValue}>{value || "Chưa cập nhật"}</div>
    </div>
  );
}

/**
 * =========================================================
 * FAMILY CARD
 * =========================================================
 */

function FamilyCard({ title, icon, name, phone, relationship }) {
  return (
    <div style={styles.familyCard}>
      <div style={styles.familyHeader}>
        <div style={styles.familyIcon}>{icon}</div>

        <div>
          <Text
            type="secondary"
            style={{
              fontSize: 12,
            }}
          >
            {title}
          </Text>

          <div>
            <Text strong>{name || "Chưa cập nhật"}</Text>
          </div>
        </div>
      </div>

      {relationship && (
        <Text
          type="secondary"
          style={{
            display: "block",
            marginTop: 10,
          }}
        >
          Quan hệ: {relationship}
        </Text>
      )}

      <div
        style={{
          marginTop: 10,
        }}
      >
        <Text type="secondary">
          <PhoneOutlined /> {phone || "Chưa cập nhật"}
        </Text>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F7F9FC",
  },

  container: {
    width: "100%",
    maxWidth: 1440,
    margin: "0 auto",
    padding: "0 28px",
  },

  loadingContainer: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "40px 24px",
  },

  loadingCard: {
    borderRadius: 16,
    border: "1px solid #E2E8F0",
  },

  backButton: {
    marginBottom: 16,
    paddingLeft: 0,
    color: "#173B5E",
    fontWeight: 600,
  },

  heroCard: {
    borderRadius: 22,
    border: "1px solid #E5EAF0",
    overflow: "hidden",
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    boxShadow: "0 12px 36px rgba(23,59,94,0.07)",
  },

  hero: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },

  avatar: {
    flexShrink: 0,
    background: "#173B5E",
    color: "#fff",
    fontSize: 30,
    fontWeight: 700,
    border: "4px solid rgba(217,164,65,0.25)",
  },

  heroInfo: {
    flex: 1,
    minWidth: 280,
  },

  heroTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  heroTitle: {
    margin: 0,
    color: "#173B5E",
    fontWeight: 700,
  },

  heroMeta: {
    display: "flex",
    gap: 18,
    flexWrap: "wrap",
    marginTop: 8,
    color: "#64748B",
  },

  heroClass: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
    color: "#475569",
  },

  tabCard: {
    marginTop: 16,
    borderRadius: 14,
    border: "1px solid #E2E8F0",
  },

  tabs: {
    display: "flex",
    gap: 4,
    overflowX: "auto",
  },

  tab: {
    border: "none",
    background: "transparent",
    padding: "12px 16px",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
    color: "#64748B",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s ease",
  },

  tabActive: {
    background: "#173B5E",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(23,59,94,0.16)",
  },

  content: {
    marginTop: 16,
  },

  statCard: {
    borderRadius: 18,
    border: "1px solid #E5EAF0",
    height: "100%",
    boxShadow: "0 6px 22px rgba(15,23,42,0.035)",
  },

  sectionCard: {
    borderRadius: 18,
    border: "1px solid #E5EAF0",
    boxShadow: "0 6px 22px rgba(15,23,42,0.035)",
  },

  filterCard: {
    borderRadius: 14,
    border: "1px solid #E2E8F0",
  },

  infoRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 0",
    borderBottom: "1px solid #F1F5F9",
  },

  infoIcon: {
    width: 24,
    color: "#D9A441",
    flexShrink: 0,
    paddingTop: 2,
  },

  infoLabel: {
    width: 125,
    color: "#64748B",
    flexShrink: 0,
  },

  infoValue: {
    flex: 1,
    color: "#172033",
    fontWeight: 500,
    wordBreak: "break-word",
  },

  familyCard: {
    padding: 16,
    borderRadius: 12,
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    height: "100%",
  },

  familyHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  familyIcon: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    color: "#173B5E",
    border: "1px solid #E2E8F0",
    fontSize: 18,
  },

  nextClass: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderRadius: 12,
    background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)",
    border: "1px solid #E2E8F0",
  },

  nextClassIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#173B5E",
    color: "#fff",
    fontSize: 22,
    flexShrink: 0,
  },

  sacramentCard: {
    borderRadius: 10,
    background: "#F8FAFC",
  },

  monthInput: {
    height: 32,
    border: "1px solid #D9E1EA",
    borderRadius: 6,
    padding: "0 10px",
    color: "#172033",
    background: "#fff",
  },

  rateBox: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },

  rateValue: {
    fontSize: 32,
    lineHeight: 1.2,
    fontWeight: 700,
    color: "#173B5E",
    marginTop: 4,
  },

  rateTrack: {
    flex: 1,
    minWidth: 160,
    height: 10,
    borderRadius: 10,
    background: "#E2E8F0",
    overflow: "hidden",
  },

  rateBar: {
    height: "100%",
    borderRadius: 10,
    background: "linear-gradient(90deg, #173B5E 0%, #D9A441 100%)",
    transition: "width 0.3s ease",
  },

  attendanceList: {
    display: "flex",
    flexDirection: "column",
  },

  attendanceItem: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "15px 0",
    borderBottom: "1px solid #F1F5F9",
  },

  attendanceDate: {
    width: 130,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    flexShrink: 0,
  },

  resultList: {
    display: "flex",
    flexDirection: "column",
  },

  resultItem: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    padding: "16px 0",
    borderBottom: "1px solid #F1F5F9",
  },

  resultInfo: {
    flex: 1,
    minWidth: 0,
  },

  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#F8FAFC",
    border: "2px solid #E2E8F0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  scheduleList: {
    display: "flex",
    flexDirection: "column",
  },

  scheduleItem: {
    display: "flex",
    gap: 18,
    padding: "18px 0",
    borderBottom: "1px solid #F1F5F9",
  },

  scheduleDay: {
    width: 100,
    flexShrink: 0,
    textAlign: "right",
    color: "#173B5E",
    fontWeight: 600,
  },

  certificateCard: {
    borderRadius: 14,
    height: "100%",
    border: "1px solid #E2E8F0",
  },

  certificateIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(217,164,65,0.12)",
    color: "#B78316",
    fontSize: 26,
  },
};
