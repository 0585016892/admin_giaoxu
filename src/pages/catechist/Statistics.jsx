import React, { useCallback, useEffect, useMemo, useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/vi";

import {
  Alert,
  Card,
  ConfigProvider,
  DatePicker,
  Empty,
  Input,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";

import viVN from "antd/locale/vi_VN";

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Download,
  GraduationCap,
  RefreshCw,
  Search,
  TrendingUp,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";
import { useNotification } from "../../components/notification";

import {
  getAllStatistics,
  exportAttendanceReport,
} from "../../api/statisticsApi";
import AppButton from "../../components/common/AppButton";

dayjs.locale("vi");

/* ============================================================
   COLORS
============================================================ */

const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  gold: "#D9A441",

  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#173B5E",
  textSecondary: "#64748B",
  muted: "#94A3B8",

  border: "#E2E8F0",
  navyLight: "#EEF3F7",
  goldLight: "#FBF5E7",

  success: "#2E7D5B",
  successBg: "#EAF6F0",

  warning: "#B7791F",
  warningBg: "#FFF7E5",

  gray: "#64748B",
  grayBg: "#F1F5F9",

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

/* ============================================================
   STYLES
============================================================ */

const styles = {
  page: {
    minHeight: "100%",
    background: COLORS.background,
    paddingBottom: 40,
  },

  section: {
    padding: "20px 24px 0",
  },

  filterCard: {
    borderRadius: 12,
    borderColor: COLORS.border,
  },

  filter: {
    display: "flex",
    alignItems: "flex-end",
    gap: 14,
    flexWrap: "wrap",
  },

  filterItem: {
    display: "flex",
    flexDirection: "column",
  },

  filterLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 7,
    fontWeight: 600,
  },

  filterControl: {
    height: 38,
    borderRadius: 9,
  },

  refreshButton: {
    height: 38,
    padding: "0 15px",
    borderRadius: 9,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.white,
    color: COLORS.navy,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  refreshButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  card: {
    borderRadius: 12,
    borderColor: COLORS.border,
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  sectionTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.navyLight,
    color: COLORS.navy,
    flexShrink: 0,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.text,
    lineHeight: 1.3,
  },

  sectionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 1.5,
  },

  sectionExtra: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  search: {
    width: 250,
    height: 38,
    borderRadius: 9,
  },

  attendanceBox: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: 18,
    background: COLORS.background,
  },

  attendanceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  attendanceTitle: {
    fontWeight: 700,
    color: COLORS.text,
  },

  attendanceStats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
  },

  attendanceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },

  attendanceValue: {
    fontSize: 20,
    fontWeight: 700,
  },

  chart: {
    width: "100%",
    height: 350,
  },

  chartSmall: {
    width: "100%",
    height: 280,
  },

  chartLarge: {
    width: "100%",
    height: 380,
  },

  loading: {
    minHeight: 450,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  error: {
    padding: "20px 24px 0",
  },
};

/* ============================================================
   HELPERS
============================================================ */

const numberFormat = (value) => {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
};

const percentFormat = (value) => {
  return `${Number(value || 0).toFixed(1)}%`;
};

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const unwrapData = (response) => {
  if (response === undefined || response === null) {
    return null;
  }

  if (
    typeof response === "object" &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return response.data;
  }

  return response;
};

const getStudentName = (student) => {
  return (
    student?.student_name ||
    student?.full_name ||
    student?.name ||
    student?.student?.full_name ||
    student?.student?.name ||
    "Chưa có tên"
  );
};

const getStudentCode = (student) => {
  return (
    student?.student_code ||
    student?.code ||
    student?.student?.student_code ||
    student?.student?.code ||
    "-"
  );
};

const getAttendanceRate = (item) => {
  if (item?.attendance_rate !== undefined) {
    return Number(item.attendance_rate || 0);
  }

  if (item?.rate !== undefined) {
    return Number(item.rate || 0);
  }

  const total = Number(item?.total || 0);
  const present = Number(item?.present || 0);

  if (!total) {
    return 0;
  }

  return (present / total) * 100;
};

const getStatusLabel = (status) => {
  const map = {
    active: "Đang hoạt động",
    inactive: "Không hoạt động",
    pending: "Chờ duyệt",
    suspended: "Tạm ngưng",

    new: "Mới",
    studying: "Đang học",
    completed: "Đã hoàn thành",

    male: "Nam",
    female: "Nữ",
  };

  return map[String(status || "").toLowerCase()] || status || "-";
};

const getStatusColor = (status) => {
  const value = String(status || "").toLowerCase();

  if (["active", "studying", "completed"].includes(value)) {
    return "success";
  }

  if (["pending", "new"].includes(value)) {
    return "warning";
  }

  if (["inactive", "suspended"].includes(value)) {
    return "error";
  }

  return "default";
};

/* ============================================================
   COMPONENT
============================================================ */

const Statistics = () => {
  const notify = useNotification();

  /* ==========================================================
     FILTER
  ========================================================== */

  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const [attendanceType, setAttendanceType] = useState(null);

  const [selectedClassId, setSelectedClassId] = useState(null);

  const [dateRange, setDateRange] = useState(null);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const [classSearch, setClassSearch] = useState("");

  const [catechistSearch, setCatechistSearch] = useState("");

  const [studentSearch, setStudentSearch] = useState("");

  /* ==========================================================
     DATA
  ========================================================== */

  const [overview, setOverview] = useState(null);

  const [students, setStudents] = useState(null);

  const [classes, setClasses] = useState([]);

  const [attendance, setAttendance] = useState(null);

  const [catechists, setCatechists] = useState([]);

  const [studentAttendance, setStudentAttendance] = useState(null);

  /* ==========================================================
     STATE
  ========================================================== */

  const [loading, setLoading] = useState(false);

  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState("");

  /* ==========================================================
     BUILD ATTENDANCE PARAMS
  ========================================================== */

  const attendanceParams = useMemo(() => {
    const params = {};

    const month = selectedMonth.month() + 1;

    const year = selectedMonth.year();

    /* --------------------------------------------------------
       DATE RANGE
    -------------------------------------------------------- */

    if (dateRange?.[0] && dateRange?.[1]) {
      params.from = dateRange[0].format("YYYY-MM-DD");

      params.to = dateRange[1].format("YYYY-MM-DD");
    } else {
      params.month = month;
      params.year = year;
    }

    /* --------------------------------------------------------
       ATTENDANCE TYPE
    -------------------------------------------------------- */

    if (attendanceType) {
      params.attendance_type = attendanceType;
    }

    /* --------------------------------------------------------
       CLASS
       
       MASS:
       Không bao giờ gửi class_id.
    -------------------------------------------------------- */

    if (selectedClassId && attendanceType !== "mass") {
      params.class_id = selectedClassId;
    }

    return params;
  }, [selectedMonth, dateRange, attendanceType, selectedClassId]);

  /* ==========================================================
     LOAD STATISTICS
  ========================================================== */

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      console.log("");
      console.log("=================================================");
      console.log("📊 LOAD STATISTICS");
      console.log("=================================================");

      console.log("Attendance params:", attendanceParams);

      console.log("Attendance type:", attendanceType);

      console.log("Class ID:", attendanceParams.class_id || "ALL");

      const result = await getAllStatistics(attendanceParams);

      console.log("📊 ALL STATISTICS RESULT:", result);

      /* ----------------------------------------------------
           NORMALIZE
        ---------------------------------------------------- */

      const overviewData = unwrapData(result?.overview);

      const studentsData = unwrapData(result?.students);

      const classesData = unwrapData(result?.classes);

      const attendanceData = unwrapData(result?.attendance);

      const catechistsData = unwrapData(result?.catechists);

      const studentAttendanceData = unwrapData(result?.studentAttendance);

      /* ----------------------------------------------------
           SET STATE
        ---------------------------------------------------- */

      setOverview(overviewData);

      setStudents(studentsData);

      setClasses(
        safeArray(classesData?.classes || classesData?.items || classesData),
      );

      setAttendance(attendanceData);

      setCatechists(
        safeArray(
          catechistsData?.catechists || catechistsData?.items || catechistsData,
        ),
      );

      setStudentAttendance(studentAttendanceData);

      console.log("✅ STATISTICS UPDATED");
    } catch (err) {
      console.error("❌ LOAD STATISTICS ERROR:", err);

      const message = err?.message || "Không thể tải dữ liệu thống kê.";

      setError(message);

      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [attendanceParams, attendanceType, notify]);

  /* ==========================================================
     INITIAL / FILTER LOAD
  ========================================================== */

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  /* ==========================================================
     OVERVIEW ATTENDANCE
  ========================================================== */

  const catechismAttendance = useMemo(() => {
    return overview?.catechism_attendance || overview?.catechism || {};
  }, [overview]);

  const massAttendance = useMemo(() => {
    return overview?.mass_attendance || overview?.mass || {};
  }, [overview]);

  /* ==========================================================
     ATTENDANCE SUMMARY
  ========================================================== */

  const attendanceSummary = useMemo(() => {
    return attendance?.summary || {};
  }, [attendance]);

  /* ==========================================================
     SELECTED ATTENDANCE SOURCE
  ========================================================== */

  const selectedAttendanceSource = useMemo(() => {
    if (Object.keys(attendanceSummary).length > 0) {
      return attendanceSummary;
    }

    if (attendanceType === "mass") {
      return massAttendance;
    }

    if (attendanceType === "catechism") {
      return catechismAttendance;
    }

    return {};
  }, [attendanceSummary, attendanceType, massAttendance, catechismAttendance]);

  /* ==========================================================
     SELECTED ATTENDANCE RATE
  ========================================================== */

  const selectedAttendanceRate = useMemo(() => {
    return getAttendanceRate(selectedAttendanceSource);
  }, [selectedAttendanceSource]);

  /* ==========================================================
     CLASS OPTIONS
  ========================================================== */

  const classOptions = useMemo(() => {
    return classes
      .map((item) => {
        const id = item.id ?? item.class_id;

        const label =
          item.name ||
          item.class_name ||
          item.code ||
          item.class_code ||
          "Lớp chưa đặt tên";

        if (id === undefined || id === null) {
          return null;
        }

        return {
          value: id,
          label,
        };
      })
      .filter(Boolean);
  }, [classes]);

  /* ==========================================================
     DAILY ATTENDANCE
  ========================================================== */

  const dailyAttendanceData = useMemo(() => {
    const daily = safeArray(attendance?.daily);

    return daily.map((item) => ({
      date: item.date ? dayjs(item.date).format("DD/MM") : "-",

      "Có mặt": Number(item.present || 0),

      Vắng: Number(item.absent || 0),

      Trễ: Number(item.late || 0),

      "Có phép": Number(item.excused || 0),
    }));
  }, [attendance]);

  /* ==========================================================
     ATTENDANCE PIE
  ========================================================== */

  const attendancePieData = useMemo(() => {
    const source = selectedAttendanceSource;

    return [
      {
        name: "Có mặt",
        value: Number(source.present || 0),
      },

      {
        name: "Vắng",
        value: Number(source.absent || 0),
      },

      {
        name: "Trễ",
        value: Number(source.late || 0),
      },

      {
        name: "Có phép",
        value: Number(source.excused || 0),
      },
    ].filter((item) => item.value > 0);
  }, [selectedAttendanceSource]);

  /* ==========================================================
     GENDER
  ========================================================== */

  const genderData = useMemo(() => {
    return safeArray(students?.gender).map((item) => ({
      name: getStatusLabel(item.gender),

      value: Number(item.total || 0),
    }));
  }, [students]);

  /* ==========================================================
     STUDENT STATUS
  ========================================================== */

  const studentStatusData = useMemo(() => {
    return safeArray(students?.status).map((item) => ({
      name: getStatusLabel(item.status),

      value: Number(item.total || 0),
    }));
  }, [students]);

  /* ==========================================================
     CATECHISM STATUS
  ========================================================== */

  const catechismStatusData = useMemo(() => {
    return safeArray(students?.catechism_status).map((item) => ({
      name: getStatusLabel(item.status),

      value: Number(item.total || 0),
    }));
  }, [students]);

  /* ==========================================================
     CLASS ROWS
  ========================================================== */

  const classRows = useMemo(() => {
    return safeArray(attendance?.by_class).map((item, index) => ({
      key: item.class_id ?? item.id ?? index,

      class_id: item.class_id ?? item.id,

      class_name: item.class_name || item.name || "Chưa có tên",

      class_code: item.class_code || item.code || "-",

      total: Number(item.total || 0),

      present: Number(item.present || 0),

      absent: Number(item.absent || 0),

      late: Number(item.late || 0),

      excused: Number(item.excused || 0),

      rate: getAttendanceRate(item),
    }));
  }, [attendance]);

  /* ==========================================================
     FILTER CLASS
  ========================================================== */

  const filteredClassRows = useMemo(() => {
    const keyword = classSearch.trim().toLowerCase();

    if (!keyword) {
      return classRows;
    }

    return classRows.filter((item) => {
      const name = String(item.class_name || "").toLowerCase();

      const code = String(item.class_code || "").toLowerCase();

      return name.includes(keyword) || code.includes(keyword);
    });
  }, [classRows, classSearch]);

  /* ==========================================================
     CLASS CHART
  ========================================================== */

  const classChartData = useMemo(() => {
    return classRows.map((item) => ({
      name:
        item.class_name?.length > 14
          ? `${item.class_name.slice(0, 14)}...`
          : item.class_name,

      "Có mặt": item.present,

      Vắng: item.absent,

      Trễ: item.late,
    }));
  }, [classRows]);

  /* ==========================================================
     FILTER CATECHIST
  ========================================================== */

  const filteredCatechists = useMemo(() => {
    const keyword = catechistSearch.trim().toLowerCase();

    if (!keyword) {
      return catechists;
    }

    return catechists.filter((item) => {
      const fullName = String(item.full_name || "").toLowerCase();

      const holyName = String(item.holy_name || "").toLowerCase();

      const code = String(item.catechist_code || "").toLowerCase();

      return (
        fullName.includes(keyword) ||
        holyName.includes(keyword) ||
        code.includes(keyword)
      );
    });
  }, [catechists, catechistSearch]);

  /* ==========================================================
     STUDENT ATTENDANCE
  ========================================================== */

  const studentAttendanceRows = useMemo(() => {
    const source =
      studentAttendance?.students ||
      studentAttendance?.items ||
      studentAttendance?.data ||
      studentAttendance;

    if (!Array.isArray(source)) {
      return [];
    }

    return source.map((item, index) => ({
      ...item,

      key: item.student_id ?? item.id ?? index,

      student_name: getStudentName(item),

      student_code: getStudentCode(item),

      class_name:
        attendanceType === "mass"
          ? "Không theo lớp"
          : item.class_name || item.class?.name || "-",

      total: Number(item.total || 0),

      present: Number(item.present || 0),

      absent: Number(item.absent || 0),

      late: Number(item.late || 0),

      excused: Number(item.excused || 0),

      rate: getAttendanceRate(item),
    }));
  }, [studentAttendance, attendanceType]);

  /* ==========================================================
     FILTER STUDENT
  ========================================================== */

  const filteredStudentAttendanceRows = useMemo(() => {
    const keyword = studentSearch.trim().toLowerCase();

    if (!keyword) {
      return studentAttendanceRows;
    }

    return studentAttendanceRows.filter((item) => {
      const name = String(item.student_name || "").toLowerCase();

      const code = String(item.student_code || "").toLowerCase();

      return name.includes(keyword) || code.includes(keyword);
    });
  }, [studentAttendanceRows, studentSearch]);

  /* ==========================================================
     EXPORT
  ========================================================== */

  const handleExportAttendance = useCallback(async () => {
    try {
      setExporting(true);

      setError("");

      console.log("");
      console.log("=================================================");
      console.log("📥 EXPORT ATTENDANCE REPORT");
      console.log("=================================================");

      console.log("Export params:", attendanceParams);

      const response = await exportAttendanceReport(attendanceParams);

      const blob = response?.data;

      if (!(blob instanceof Blob)) {
        throw new Error("Dữ liệu báo cáo không hợp lệ.");
      }

      /* ----------------------------------------------------
           FILE NAME
        ---------------------------------------------------- */

      let fileName = "bao-cao-diem-danh.xlsx";

      const disposition = response?.headers?.["content-disposition"];

      if (disposition) {
        const match = disposition.match(
          /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i,
        );

        if (match?.[1]) {
          fileName = decodeURIComponent(match[1]);
        }
      }

      /* ----------------------------------------------------
           DOWNLOAD
        ---------------------------------------------------- */

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      console.log("✅ EXPORT SUCCESS:", fileName);

      notify.success("Xuất báo cáo điểm danh thành công.");
    } catch (err) {
      console.error("❌ EXPORT ERROR:", err);

      const message = err?.message || "Không thể xuất báo cáo điểm danh.";

      setError(message);

      notify.error(message);
    } finally {
      setExporting(false);
    }
  }, [attendanceParams, notify]);

  /* ==========================================================
     SEARCH INPUT
  ========================================================== */

  const SearchInput = ({ value, onChange, placeholder }) => (
    <Input
      allowClear
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      prefix={<Search size={16} color={COLORS.muted} />}
      style={styles.search}
    />
  );

  /* ==========================================================
     SECTION HEADER
  ========================================================== */

  const SectionHeader = ({ icon, title, description, extra }) => (
    <div style={styles.sectionHeader}>
      <div style={styles.sectionTitleWrap}>
        <div style={styles.sectionIcon}>{icon}</div>

        <div>
          <div style={styles.sectionTitle}>{title}</div>

          {description && (
            <div style={styles.sectionDescription}>{description}</div>
          )}
        </div>
      </div>

      {extra && <div style={styles.sectionExtra}>{extra}</div>}
    </div>
  );

  /* ==========================================================
     CLASS COLUMNS
  ========================================================== */

  const classColumns = [
    {
      title: "Lớp",
      dataIndex: "class_name",
      key: "class_name",

      render: (value, record) => (
        <div>
          <div
            style={{
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            {value}
          </div>

          <div
            style={{
              fontSize: 12,
              color: COLORS.muted,
              marginTop: 3,
            }}
          >
            {record.class_code}
          </div>
        </div>
      ),
    },

    {
      title: "Tổng",
      dataIndex: "total",
      key: "total",
      align: "center",

      render: (value) => numberFormat(value),
    },

    {
      title: "Có mặt",
      dataIndex: "present",
      key: "present",
      align: "center",

      render: (value) => (
        <span
          style={{
            color: COLORS.success,
            fontWeight: 700,
          }}
        >
          {numberFormat(value)}
        </span>
      ),
    },

    {
      title: "Vắng",
      dataIndex: "absent",
      key: "absent",
      align: "center",

      render: (value) => (
        <span
          style={{
            color: COLORS.danger,
            fontWeight: 600,
          }}
        >
          {numberFormat(value)}
        </span>
      ),
    },

    {
      title: "Trễ",
      dataIndex: "late",
      key: "late",
      align: "center",

      render: (value) => (
        <span
          style={{
            color: COLORS.warning,
            fontWeight: 600,
          }}
        >
          {numberFormat(value)}
        </span>
      ),
    },

    {
      title: "Tỷ lệ",
      dataIndex: "rate",
      key: "rate",
      align: "center",

      render: (value) => (
        <Tag
          color={
            Number(value) >= 80
              ? "success"
              : Number(value) >= 50
                ? "warning"
                : "error"
          }
        >
          {percentFormat(value)}
        </Tag>
      ),
    },
  ];

  /* ==========================================================
     CATECHIST COLUMNS
  ========================================================== */

  const catechistColumns = [
    {
      title: "Giáo lý viên",
      key: "catechist",

      render: (_, record) => (
        <div>
          <div
            style={{
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            {record.full_name || "Chưa có tên"}
          </div>

          {record.holy_name && (
            <div
              style={{
                fontSize: 12,
                color: COLORS.gold,
                marginTop: 3,
              }}
            >
              {record.holy_name}
            </div>
          )}
        </div>
      ),
    },

    {
      title: "Mã",
      dataIndex: "catechist_code",
      key: "catechist_code",
    },

    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",

      render: (value) => getStatusLabel(value),
    },

    {
      title: "Trình độ",
      dataIndex: "level",
      key: "level",

      render: (value) => value || "-",
    },

    {
      title: "Số lớp",
      dataIndex: "total_classes",
      key: "total_classes",
      align: "center",

      render: (value) => numberFormat(value),
    },

    {
      title: "Học viên",
      dataIndex: "total_students",
      key: "total_students",
      align: "center",

      render: (value) => numberFormat(value),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",

      render: (value) => (
        <Tag color={getStatusColor(value)}>{getStatusLabel(value)}</Tag>
      ),
    },
  ];

  /* ==========================================================
     STUDENT COLUMNS
  ========================================================== */

  const studentAttendanceColumns = [
    {
      title: "Học viên",
      key: "student",

      render: (_, record) => (
        <div>
          <div
            style={{
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            {record.student_name}
          </div>

          <div
            style={{
              fontSize: 12,
              color: COLORS.muted,
              marginTop: 3,
            }}
          >
            {record.student_code}
          </div>
        </div>
      ),
    },

    {
      title: attendanceType === "mass" ? "Phân loại" : "Lớp",

      dataIndex: "class_name",

      key: "class_name",
    },

    {
      title: "Tổng",
      dataIndex: "total",
      key: "total",
      align: "center",

      render: (value) => numberFormat(value),
    },

    {
      title: "Có mặt",
      dataIndex: "present",
      key: "present",
      align: "center",

      render: (value) => (
        <span
          style={{
            color: COLORS.success,
            fontWeight: 700,
          }}
        >
          {numberFormat(value)}
        </span>
      ),
    },

    {
      title: "Vắng",
      dataIndex: "absent",
      key: "absent",
      align: "center",

      render: (value) => (
        <span
          style={{
            color: COLORS.danger,
            fontWeight: 600,
          }}
        >
          {numberFormat(value)}
        </span>
      ),
    },

    {
      title: "Trễ",
      dataIndex: "late",
      key: "late",
      align: "center",

      render: (value) => numberFormat(value),
    },

    {
      title: "Có phép",
      dataIndex: "excused",
      key: "excused",
      align: "center",

      render: (value) => numberFormat(value),
    },

    {
      title: "Tỷ lệ",
      dataIndex: "rate",
      key: "rate",
      align: "center",

      render: (value) => (
        <Tag
          color={
            Number(value) >= 80
              ? "success"
              : Number(value) >= 50
                ? "warning"
                : "error"
          }
        >
          {percentFormat(value)}
        </Tag>
      ),
    },
  ];

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <ConfigProvider locale={viVN}>
      <div style={styles.page}>
        {/* ====================================================
            HERO
        ==================================================== */}

        <PageHeroHeader
          title="Thống kê"
          description="Tổng quan tình hình lớp học, học viên, giáo lý viên và chuyên cần."
          icon={<TrendingUp size={22} />}
          extra={
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Tooltip title="Xuất báo cáo điểm danh">
                <AppButton
                  type="primary"
                  icon={<Download size={16} />}
                  loading={exporting}
                  size="small"
                  disabled={loading}
                  onClick={handleExportAttendance}
                  style={{
                    height: 38,
                    borderRadius: 9,
                    background: COLORS.navy,
                    borderColor: COLORS.navy,
                    fontWeight: 600,
                  }}
                >
                  Xuất báo cáo điểm danh
                </AppButton>
              </Tooltip>

              <button
                type="button"
                onClick={loadStatistics}
                disabled={loading}
                style={{
                  ...styles.refreshButton,

                  ...(loading ? styles.refreshButtonDisabled : {}),
                }}
              >
                <RefreshCw
                  size={16}
                  style={
                    loading
                      ? {
                          animation: "statistics-spin 1s linear infinite",
                        }
                      : undefined
                  }
                />
                Làm mới
              </button>
            </div>
          }
        />

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div style={styles.error}>
            <Alert
              type="error"
              showIcon
              message="Không thể tải dữ liệu"
              description={error}
              closable
              onClose={() => setError("")}
            />
          </div>
        )}

        {/* ====================================================
            FILTER
        ==================================================== */}

        <div style={styles.section}>
          <Card bordered style={styles.filterCard}>
            <div style={styles.filter}>
              {/* THÁNG */}

              <div style={styles.filterItem}>
                <div style={styles.filterLabel}>Tháng thống kê</div>

                <DatePicker
                  picker="month"
                  value={selectedMonth}
                  onChange={(value) => {
                    if (value) {
                      setSelectedMonth(value);

                      setDateRange(null);
                    }
                  }}
                  format="MM/YYYY"
                  allowClear={false}
                  style={{
                    ...styles.filterControl,
                    width: 160,
                  }}
                />
              </div>

              {/* KHOẢNG NGÀY */}

              <div style={styles.filterItem}>
                <div style={styles.filterLabel}>Khoảng thời gian</div>

                <DatePicker.RangePicker
                  value={dateRange}
                  onChange={(value) => {
                    setDateRange(value);
                  }}
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  style={{
                    ...styles.filterControl,
                    width: 260,
                  }}
                />
              </div>

              {/* LOẠI */}

              <div style={styles.filterItem}>
                <div style={styles.filterLabel}>Loại chuyên cần</div>

                <Select
                  allowClear
                  value={attendanceType}
                  onChange={(value) => {
                    setAttendanceType(value);

                    if (value === "mass") {
                      setSelectedClassId(null);
                    }
                  }}
                  placeholder="Tất cả"
                  style={{
                    width: 170,
                  }}
                  options={[
                    {
                      value: "catechism",
                      label: "Học giáo lý",
                    },

                    {
                      value: "mass",
                      label: "Thánh lễ",
                    },
                  ]}
                />
              </div>

              {/* CLASS */}

              {attendanceType !== "mass" && (
                <div style={styles.filterItem}>
                  <div style={styles.filterLabel}>Lớp</div>

                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    value={selectedClassId}
                    onChange={setSelectedClassId}
                    placeholder="Tất cả lớp"
                    options={classOptions}
                    style={{
                      width: 220,
                    }}
                  />
                </div>
              )}

              {/* MASS INFO */}

              {attendanceType === "mass" && (
                <div
                  style={{
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 12px",
                    borderRadius: 9,
                    background: COLORS.successBg,
                    color: COLORS.success,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Thánh lễ: không phân theo lớp
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div style={styles.loading}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* ==================================================
                STAT CARDS
            ================================================== */}

            <div style={styles.section}>
              <div className="statistics-card-grid">
                <StatCard
                  title="Giáo lý viên"
                  value={numberFormat(overview?.total_catechists)}
                  icon={<UserCheck size={21} />}
                  description="Tổng số giáo lý viên"
                />

                <StatCard
                  title="Lớp học"
                  value={numberFormat(overview?.total_classes)}
                  icon={<BookOpen size={21} />}
                  description="Tổng số lớp"
                />

                <StatCard
                  title="Học viên"
                  value={numberFormat(overview?.total_students)}
                  icon={<GraduationCap size={21} />}
                  description="Tổng số học viên"
                />

                <StatCard
                  title="Tỷ lệ chuyên cần"
                  value={percentFormat(selectedAttendanceRate)}
                  icon={<ClipboardCheck size={21} />}
                  description="Theo bộ lọc hiện tại"
                />
              </div>
            </div>

            {/* ==================================================
                ATTENDANCE OVERVIEW
            ================================================== */}

            <div style={styles.section}>
              <Card bordered style={styles.card}>
                <SectionHeader
                  icon={<CalendarDays size={20} />}
                  title="Tổng quan chuyên cần"
                  description="Tình hình tham dự giáo lý và Thánh lễ"
                />

                <div className="statistics-two-grid">
                  {/* GIÁO LÝ */}

                  <div style={styles.attendanceBox}>
                    <div style={styles.attendanceHeader}>
                      <span style={styles.attendanceTitle}>Học giáo lý</span>

                      <Tag color="processing">
                        {percentFormat(catechismAttendance.rate)}
                      </Tag>
                    </div>

                    <div style={styles.attendanceStats}>
                      <div>
                        <div style={styles.attendanceLabel}>Có mặt</div>

                        <strong
                          style={{
                            ...styles.attendanceValue,
                            color: COLORS.success,
                          }}
                        >
                          {numberFormat(catechismAttendance.present)}
                        </strong>
                      </div>

                      <div>
                        <div style={styles.attendanceLabel}>Vắng</div>

                        <strong
                          style={{
                            ...styles.attendanceValue,
                            color: COLORS.danger,
                          }}
                        >
                          {numberFormat(catechismAttendance.absent)}
                        </strong>
                      </div>

                      <div>
                        <div style={styles.attendanceLabel}>Trễ</div>

                        <strong
                          style={{
                            ...styles.attendanceValue,
                            color: COLORS.warning,
                          }}
                        >
                          {numberFormat(catechismAttendance.late)}
                        </strong>
                      </div>

                      <div>
                        <div style={styles.attendanceLabel}>Có phép</div>

                        <strong
                          style={{
                            ...styles.attendanceValue,
                            color: COLORS.navy,
                          }}
                        >
                          {numberFormat(catechismAttendance.excused)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* MASS */}

                  <div style={styles.attendanceBox}>
                    <div style={styles.attendanceHeader}>
                      <span style={styles.attendanceTitle}>Thánh lễ</span>

                      <Tag color="success">
                        {percentFormat(massAttendance.rate)}
                      </Tag>
                    </div>

                    <div style={styles.attendanceStats}>
                      <div>
                        <div style={styles.attendanceLabel}>Có mặt</div>

                        <strong
                          style={{
                            ...styles.attendanceValue,
                            color: COLORS.success,
                          }}
                        >
                          {numberFormat(massAttendance.present)}
                        </strong>
                      </div>

                      <div>
                        <div style={styles.attendanceLabel}>Vắng</div>

                        <strong
                          style={{
                            ...styles.attendanceValue,
                            color: COLORS.danger,
                          }}
                        >
                          {numberFormat(massAttendance.absent)}
                        </strong>
                      </div>

                      <div>
                        <div style={styles.attendanceLabel}>Trễ</div>

                        <strong
                          style={{
                            ...styles.attendanceValue,
                            color: COLORS.warning,
                          }}
                        >
                          {numberFormat(massAttendance.late)}
                        </strong>
                      </div>

                      <div>
                        <div style={styles.attendanceLabel}>Có phép</div>

                        <strong
                          style={{
                            ...styles.attendanceValue,
                            color: COLORS.navy,
                          }}
                        >
                          {numberFormat(massAttendance.excused)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ==================================================
                ATTENDANCE CHARTS
            ================================================== */}

            <div style={styles.section}>
              <div className="statistics-chart-grid">
                {/* DAILY */}

                <Card bordered style={styles.card}>
                  <SectionHeader
                    icon={<BarChart3 size={20} />}
                    title="Chuyên cần theo ngày"
                    description="Biến động số lượng học viên theo từng ngày"
                  />

                  {dailyAttendanceData.length > 0 ? (
                    <div style={styles.chart}>
                      <ResponsiveContainer>
                        <LineChart
                          data={dailyAttendanceData}
                          margin={{
                            top: 10,
                            right: 20,
                            left: 0,
                            bottom: 10,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={COLORS.border}
                          />

                          <XAxis dataKey="date" />

                          <YAxis />

                          <RechartsTooltip />

                          <Legend />

                          <Line
                            type="monotone"
                            dataKey="Có mặt"
                            stroke={COLORS.success}
                            strokeWidth={2}
                            dot={{
                              r: 3,
                            }}
                          />

                          <Line
                            type="monotone"
                            dataKey="Vắng"
                            stroke={COLORS.danger}
                            strokeWidth={2}
                            dot={{
                              r: 3,
                            }}
                          />

                          <Line
                            type="monotone"
                            dataKey="Trễ"
                            stroke={COLORS.gold}
                            strokeWidth={2}
                            dot={{
                              r: 3,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Empty description="Chưa có dữ liệu theo ngày" />
                  )}
                </Card>

                {/* PIE */}

                <Card bordered style={styles.card}>
                  <SectionHeader
                    icon={<ClipboardCheck size={20} />}
                    title="Cơ cấu chuyên cần"
                    description="Tỷ trọng trạng thái điểm danh"
                  />

                  {attendancePieData.length > 0 ? (
                    <div style={styles.chart}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={attendancePieData}
                            cx="50%"
                            cy="45%"
                            innerRadius={65}
                            outerRadius={105}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                          >
                            {attendancePieData.map((item, index) => (
                              <Cell
                                key={`attendance-${index}`}
                                fill={
                                  [
                                    COLORS.success,
                                    COLORS.danger,
                                    COLORS.gold,
                                    COLORS.navy,
                                  ][index % 4]
                                }
                              />
                            ))}
                          </Pie>

                          <RechartsTooltip />

                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Empty description="Chưa có dữ liệu chuyên cần" />
                  )}
                </Card>
              </div>
            </div>

            {/* ==================================================
                STUDENT CHARTS
            ================================================== */}

            <div style={styles.section}>
              <div className="statistics-student-grid">
                {/* GENDER */}

                <Card bordered style={styles.card}>
                  <SectionHeader
                    icon={<Users size={20} />}
                    title="Học viên theo giới tính"
                  />

                  {genderData.length > 0 ? (
                    <div style={styles.chartSmall}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={genderData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            outerRadius={90}
                            label
                          >
                            {genderData.map((item, index) => (
                              <Cell
                                key={`gender-${index}`}
                                fill={[COLORS.navy, COLORS.gold][index % 2]}
                              />
                            ))}
                          </Pie>

                          <RechartsTooltip />

                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Empty />
                  )}
                </Card>

                {/* STUDENT STATUS */}

                <Card bordered style={styles.card}>
                  <SectionHeader
                    icon={<UserRound size={20} />}
                    title="Trạng thái học viên"
                  />

                  {studentStatusData.length > 0 ? (
                    <div style={styles.chartSmall}>
                      <ResponsiveContainer>
                        <BarChart data={studentStatusData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={COLORS.border}
                          />

                          <XAxis
                            dataKey="name"
                            tick={{
                              fontSize: 11,
                            }}
                          />

                          <YAxis />

                          <RechartsTooltip />

                          <Bar
                            dataKey="value"
                            name="Học viên"
                            fill={COLORS.navy}
                            radius={[5, 5, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Empty />
                  )}
                </Card>

                {/* CATECHISM STATUS */}

                <Card bordered style={styles.card}>
                  <SectionHeader
                    icon={<GraduationCap size={20} />}
                    title="Tình trạng giáo lý"
                  />

                  {catechismStatusData.length > 0 ? (
                    <div style={styles.chartSmall}>
                      <ResponsiveContainer>
                        <BarChart data={catechismStatusData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={COLORS.border}
                          />

                          <XAxis
                            dataKey="name"
                            tick={{
                              fontSize: 11,
                            }}
                          />

                          <YAxis />

                          <RechartsTooltip />

                          <Bar
                            dataKey="value"
                            name="Học viên"
                            fill={COLORS.gold}
                            radius={[5, 5, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Empty />
                  )}
                </Card>
              </div>
            </div>

            {/* ==================================================
                CLASS CHART
                MASS KHÔNG HIỆN
            ================================================== */}

            {attendanceType !== "mass" && (
              <div style={styles.section}>
                <Card bordered style={styles.card}>
                  <SectionHeader
                    icon={<BookOpen size={20} />}
                    title="Chuyên cần theo lớp"
                    description="So sánh số lượng có mặt, vắng và trễ giữa các lớp"
                  />

                  {classChartData.length > 0 ? (
                    <div style={styles.chartLarge}>
                      <ResponsiveContainer>
                        <BarChart
                          data={classChartData}
                          margin={{
                            top: 10,
                            right: 20,
                            left: 0,
                            bottom: 50,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={COLORS.border}
                          />

                          <XAxis
                            dataKey="name"
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                            height={80}
                            tick={{
                              fontSize: 11,
                              fill: COLORS.textSecondary,
                            }}
                          />

                          <YAxis />

                          <RechartsTooltip />

                          <Legend />

                          <Bar
                            dataKey="Có mặt"
                            fill={COLORS.success}
                            radius={[4, 4, 0, 0]}
                          />

                          <Bar
                            dataKey="Vắng"
                            fill={COLORS.danger}
                            radius={[4, 4, 0, 0]}
                          />

                          <Bar
                            dataKey="Trễ"
                            fill={COLORS.gold}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Empty description="Chưa có dữ liệu lớp học" />
                  )}
                </Card>
              </div>
            )}

            {/* ==================================================
                CLASS TABLE
                MASS KHÔNG HIỆN
            ================================================== */}

            {attendanceType !== "mass" && (
              <div style={styles.section}>
                <Card bordered style={styles.card}>
                  <SectionHeader
                    icon={<BookOpen size={20} />}
                    title="Danh sách lớp học"
                    description={`${numberFormat(
                      filteredClassRows.length,
                    )} lớp được hiển thị`}
                    extra={
                      <SearchInput
                        value={classSearch}
                        onChange={setClassSearch}
                        placeholder="Tìm tên hoặc mã lớp..."
                      />
                    }
                  />

                  <Table
                    columns={classColumns}
                    dataSource={filteredClassRows}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,

                      showTotal: (total) => `Tổng ${numberFormat(total)} lớp`,
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          description={
                            classSearch
                              ? "Không tìm thấy lớp phù hợp"
                              : "Chưa có dữ liệu lớp"
                          }
                        />
                      ),
                    }}
                    scroll={{
                      x: 700,
                    }}
                  />
                </Card>
              </div>
            )}

            {/* ==================================================
                CATECHIST TABLE
            ================================================== */}

            <div style={styles.section}>
              <Card bordered style={styles.card}>
                <SectionHeader
                  icon={<UserCheck size={20} />}
                  title="Danh sách giáo lý viên"
                  description={`${numberFormat(
                    filteredCatechists.length,
                  )} giáo lý viên được hiển thị`}
                  extra={
                    <SearchInput
                      value={catechistSearch}
                      onChange={setCatechistSearch}
                      placeholder="Tìm tên, thánh danh hoặc mã..."
                    />
                  }
                />

                <Table
                  columns={catechistColumns}
                  dataSource={filteredCatechists}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,

                    showTotal: (total) =>
                      `Tổng ${numberFormat(total)} giáo lý viên`,
                  }}
                  locale={{
                    emptyText: (
                      <Empty
                        description={
                          catechistSearch
                            ? "Không tìm thấy giáo lý viên phù hợp"
                            : "Chưa có dữ liệu giáo lý viên"
                        }
                      />
                    ),
                  }}
                  scroll={{
                    x: 850,
                  }}
                />
              </Card>
            </div>

            {/* ==================================================
                STUDENT ATTENDANCE
            ================================================== */}

            <div style={styles.section}>
              <Card bordered style={styles.card}>
                <SectionHeader
                  icon={<GraduationCap size={20} />}
                  title="Chuyên cần học viên"
                  description={
                    studentAttendanceRows.length > 0
                      ? `${numberFormat(
                          filteredStudentAttendanceRows.length,
                        )} học viên được hiển thị`
                      : "Theo dõi tình hình chuyên cần từng học viên"
                  }
                  extra={
                    <SearchInput
                      value={studentSearch}
                      onChange={setStudentSearch}
                      placeholder="Tìm tên hoặc mã học viên..."
                    />
                  }
                />

                {studentAttendanceRows.length > 0 ? (
                  <Table
                    columns={studentAttendanceColumns}
                    dataSource={filteredStudentAttendanceRows}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,

                      showTotal: (total) =>
                        `Tổng ${numberFormat(total)} học viên`,
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          description={
                            studentSearch
                              ? "Không tìm thấy học viên phù hợp"
                              : "Chưa có dữ liệu chuyên cần học viên"
                          }
                        />
                      ),
                    }}
                    scroll={{
                      x: 950,
                    }}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="API chưa trả về danh sách chuyên cần học viên"
                  />
                )}
              </Card>
            </div>
          </>
        )}

        {/* ======================================================
            RESPONSIVE CSS
        ====================================================== */}

        <style>
          {`
            .statistics-card-grid {
              display: grid;
              grid-template-columns:
                repeat(4, minmax(0, 1fr));
              gap: 16px;
              width: 100%;
            }

            .statistics-chart-grid {
              display: grid;
              grid-template-columns:
                minmax(0, 2fr)
                minmax(320px, 1fr);
              gap: 16px;
              width: 100%;
              min-width: 0;
            }

            .statistics-chart-grid > .ant-card {
              min-width: 0;
              width: 100%;
            }

            .statistics-student-grid {
              display: grid;
              grid-template-columns:
                repeat(3, minmax(0, 1fr));
              gap: 16px;
              width: 100%;
              min-width: 0;
            }

            .statistics-student-grid > .ant-card {
              min-width: 0;
            }

            .statistics-two-grid {
              display: grid;
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
              gap: 16px;
              width: 100%;
            }

            @media (max-width: 1200px) {

              .statistics-card-grid {
                grid-template-columns:
                  repeat(2, minmax(0, 1fr));
              }

              .statistics-chart-grid {
                grid-template-columns: 1fr;
              }

              .statistics-student-grid {
                grid-template-columns:
                  repeat(2, minmax(0, 1fr));
              }
            }

            @media (max-width: 900px) {

              .statistics-two-grid {
                grid-template-columns: 1fr;
              }

              .statistics-student-grid {
                grid-template-columns: 1fr;
              }
            }

            @media (max-width: 768px) {

              .statistics-card-grid {
                grid-template-columns: 1fr;
                gap: 12px;
              }

              .statistics-chart-grid {
                grid-template-columns: 1fr;
                gap: 12px;
              }

              .statistics-student-grid {
                grid-template-columns: 1fr;
                gap: 12px;
              }

              .statistics-two-grid {
                grid-template-columns: 1fr;
                gap: 12px;
              }

              .statistics-search {
                width: 100% !important;
              }

              .ant-card {
                max-width: 100%;
              }

              .ant-table-wrapper {
                max-width: 100%;
                overflow-x: auto;
              }
            }

            @media (max-width: 576px) {

              .statistics-card-grid,
              .statistics-chart-grid,
              .statistics-student-grid,
              .statistics-two-grid {
                grid-template-columns: 1fr;
                gap: 12px;
              }
            }

            @media (max-width: 400px) {

              .statistics-card-grid,
              .statistics-chart-grid,
              .statistics-student-grid,
              .statistics-two-grid {
                grid-template-columns: 1fr;
                gap: 10px;
              }
            }

            @keyframes statistics-spin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }

            .ant-table-thead > tr > th {
              color: ${COLORS.navy};
              font-weight: 700;
              background: ${COLORS.background} !important;
            }

            .ant-table-tbody > tr:hover > td {
              background: ${COLORS.navyLight} !important;
            }

            .ant-pagination-item-active {
              border-color: ${COLORS.navy} !important;
            }

            .ant-pagination-item-active a {
              color: ${COLORS.navy} !important;
            }

            .ant-picker:hover,
            .ant-picker-focused {
              border-color: ${COLORS.navy} !important;
            }

            .ant-select:hover .ant-select-selector,
            .ant-select-focused .ant-select-selector {
              border-color: ${COLORS.navy} !important;

              box-shadow:
                0 0 0 2px
                rgba(23, 59, 94, 0.08) !important;
            }
          `}
        </style>
      </div>
    </ConfigProvider>
  );
};

export default Statistics;
