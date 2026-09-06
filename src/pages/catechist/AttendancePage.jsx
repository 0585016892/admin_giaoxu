import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  DatePicker,
  Empty,
  Input,
  Modal,
  Select,
  Spin,
  Statistic,
  Tag,
  Tooltip,
  Row,
  Col,
  Divider,
  message,
} from "antd";

import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  LockOutlined,
  MoreOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  BookOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import QRCodeScanner from "./QRCodeScanner";

import {
  getAttendance,
  saveBulkAttendance,
  getStudentAttendance,
} from "../../api/attendanceApi";

import classApi from "../../api/classApi";

import { useUser } from "../../context/UserContext";

import PageHeroHeader from "../../components/common/PageHeroHeader";
import TablePagination from "../../components/common/TablePagination";

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  present: {
    label: "Có mặt",
    color: "#269653",
    bg: "#EFFAF2",
    border: "#BFE6CA",
    icon: <CheckCircleOutlined />,
  },

  absent: {
    label: "Vắng",
    color: "#E44848",
    bg: "#FFF1F1",
    border: "#FFCCCC",
    icon: <CloseCircleOutlined />,
  },

  late: {
    label: "Muộn",
    color: "#C58A13",
    bg: "#FFF9E9",
    border: "#FFE4A5",
    icon: <ClockCircleOutlined />,
  },

  excused: {
    label: "Có phép",
    color: "#3979C6",
    bg: "#EEF6FF",
    border: "#C9DFFF",
    icon: <ExclamationCircleOutlined />,
  },
};

/* =========================================================
   HELPERS
========================================================= */

const isPastDate = (date) => {
  if (!date) return false;

  return date.isBefore(dayjs().startOf("day"), "day");
};

const normalizeClassList = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.classes)) {
    return response.data.classes;
  }

  if (response.id || response.class_id) {
    return [response];
  }

  if (response.data?.id || response.data?.class_id) {
    return [response.data];
  }

  return [];
};

const normalizeStudent = (student) => {
  const status = student.attendance_status || student.status || null;

  return {
    ...student,

    student_id: Number(student.student_id || student.id),

    student_name:
      student.student_name ||
      student.name ||
      student.full_name ||
      "Không có tên",

    code: student.code || student.student_code || null,

    status,

    attendance_status: status,

    attendance_id: student.attendance_id ? Number(student.attendance_id) : null,

    attendance_date: student.attendance_date || null,

    check_in_time: student.check_in_time || null,

    note: student.note || "",

    student_status: student.student_status || "active",
  };
};

/* =========================================================
   COMPONENT
========================================================= */

const AttendancePage = () => {
  const { user } = useUser();

  const role = user?.role;

  /* =======================================================
     CLASS
  ======================================================= */

  const [classes, setClasses] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState(null);

  const [selectedDate, setSelectedDate] = useState(dayjs());

  /* =======================================================
     ATTENDANCE
  ======================================================= */

  const [students, setStudents] = useState([]);

  const [classInfo, setClassInfo] = useState(null);

  const [loadingClasses, setLoadingClasses] = useState(false);

  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     SEARCH / FILTER
  ======================================================= */

  const [searchText, setSearchText] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  /* =======================================================
     QR CAMERA
  ======================================================= */

  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  /* =======================================================
     STUDENT DETAIL
  ======================================================= */

  const [studentDetailOpen, setStudentDetailOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentHistory, setStudentHistory] = useState([]);

  const [loadingStudentHistory, setLoadingStudentHistory] = useState(false);

  /* =======================================================
     DATE LOCK
  ======================================================= */

  const attendanceLocked = useMemo(() => {
    return isPastDate(selectedDate);
  }, [selectedDate]);

  /* =======================================================
     LOAD CLASSES
  ======================================================= */

  const loadClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);

      setError("");

      let response;

      if (role === "teacher") {
        response = await classApi.getClassTeacher();
      } else {
        response = await classApi.getAll();
      }

      const list = normalizeClassList(response);

      setClasses(list);

      if (list.length > 0) {
        const firstId = Number(list[0].id || list[0].class_id);

        setSelectedClassId(firstId);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Không thể tải danh sách lớp.";

      setError(msg);

      message.error(msg);
    } finally {
      setLoadingClasses(false);
    }
  }, [role]);

  /* =======================================================
     LOAD ATTENDANCE
  ======================================================= */

  const loadAttendance = useCallback(async () => {
    if (!selectedClassId) {
      setStudents([]);
      setClassInfo(null);

      return;
    }

    try {
      setLoadingAttendance(true);

      setError("");

      const response = await getAttendance({
        class_id: Number(selectedClassId),

        date: selectedDate.format("YYYY-MM-DD"),
      });

      let rawStudents = [];

      let classData = null;

      if (Array.isArray(response?.data)) {
        rawStudents = response.data;
      } else if (Array.isArray(response?.data?.students)) {
        rawStudents = response.data.students;

        classData = response.data.class || null;
      } else if (Array.isArray(response)) {
        rawStudents = response;
      } else if (Array.isArray(response?.students)) {
        rawStudents = response.students;

        classData = response.class || null;
      }

      setClassInfo(classData);

      setStudents(rawStudents.map(normalizeStudent));

      setCurrentPage(1);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Không thể tải dữ liệu điểm danh.";

      setError(msg);

      message.error(msg);

      setStudents([]);
    } finally {
      setLoadingAttendance(false);
    }
  }, [selectedClassId, selectedDate]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (selectedClassId) {
      loadAttendance();
    }
  }, [selectedClassId, selectedDate, loadAttendance]);

  /* =======================================================
     RESET PAGE WHEN FILTER
  ======================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter, selectedClassId, selectedDate]);

  /* =======================================================
     SELECTED CLASS
  ======================================================= */

  const selectedClass = useMemo(() => {
    return (
      classes.find(
        (item) => Number(item.id || item.class_id) === Number(selectedClassId),
      ) ||
      classInfo ||
      null
    );
  }, [classes, selectedClassId, classInfo]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const total = students.length;

    const present = students.filter((item) => item.status === "present").length;

    const absent = students.filter((item) => item.status === "absent").length;

    const late = students.filter((item) => item.status === "late").length;

    const excused = students.filter((item) => item.status === "excused").length;

    const attended = present + late;

    const notMarked = students.filter(
      (item) => !item.status && !item.attendance_status && !item.attendance_id,
    ).length;

    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      late,
      excused,
      attended,
      notMarked,
      rate,
    };
  }, [students]);

  /* =======================================================
     FILTER STUDENTS
  ======================================================= */

  const filteredStudents = useMemo(() => {
    let result = [...students];

    /* STATUS */

    if (statusFilter !== "all") {
      if (statusFilter === "unmarked") {
        result = result.filter(
          (student) =>
            !student.status &&
            !student.attendance_status &&
            !student.attendance_id,
        );
      } else {
        result = result.filter(
          (student) =>
            (student.status || student.attendance_status) === statusFilter,
        );
      }
    }

    /* SEARCH */

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();

      result = result.filter((student) => {
        const name = (student.student_name || "").toLowerCase();

        const code = (student.code || "").toLowerCase();

        const id = String(student.student_id || "");

        return (
          name.includes(keyword) ||
          code.includes(keyword) ||
          id.includes(keyword)
        );
      });
    }

    return result;
  }, [students, statusFilter, searchText]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const paginationStart =
    filteredStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const paginationEnd = Math.min(
    currentPage * pageSize,
    filteredStudents.length,
  );

  /* =======================================================
     QR CAMERA TOGGLE
  ======================================================= */

  /* =======================================================
     QR SUCCESS
  ======================================================= */

  const handleQRSuccess = async (data) => {
    const student = data?.student;

    if (!student?.id) {
      await loadAttendance();

      return;
    }

    const attendance = data?.attendance;

    const studentId = Number(student.id);

    const nextStatus =
      attendance?.status || data?.attendance_status || "present";

    setStudents((prev) =>
      prev.map((item) =>
        Number(item.student_id) === studentId
          ? {
              ...item,

              attendance_id: attendance?.id || item.attendance_id || null,

              status: nextStatus,

              attendance_status: nextStatus,

              check_in_time:
                attendance?.check_in_time || item.check_in_time || null,

              attendance_date:
                attendance?.attendance_date ||
                selectedDate.format("YYYY-MM-DD"),
            }
          : item,
      ),
    );

    message.success(`${student.name || "Học viên"} điểm danh thành công.`);
  };

  /* =======================================================
     FINISH QR ATTENDANCE
  ======================================================= */

  const handleFinishQRScan = async () => {
    if (!selectedClassId) {
      setQrScannerOpen(false);

      return;
    }

    const unmarked = students.filter((student) => {
      const status = student.status ?? student.attendance_status ?? null;

      const hasAttendance = Boolean(student.attendance_id) || Boolean(status);

      return !hasAttendance;
    });

    if (unmarked.length === 0) {
      setQrScannerOpen(false);

      message.success("Tất cả học viên đã được điểm danh.");

      return;
    }

    Modal.confirm({
      title: "Kết thúc điểm danh?",

      icon: <ExclamationCircleOutlined />,

      content: (
        <div>
          <p>
            Còn <strong>{unmarked.length}</strong> học viên chưa được điểm danh.
          </p>

          <p>
            Nếu kết thúc, hệ thống sẽ đánh dấu các học viên này là{" "}
            <strong
              style={{
                color: "#E44848",
              }}
            >
              Vắng
            </strong>
            .
          </p>
        </div>
      ),

      okText: "Xác nhận kết thúc",

      cancelText: "Quay lại",

      okButtonProps: {
        danger: true,
      },

      async onOk() {
        try {
          const payload = {
            class_id: Number(selectedClassId),

            attendance_date: selectedDate.format("YYYY-MM-DD"),

            students: unmarked.map((student) => ({
              student_id: Number(student.student_id),

              status: "absent",

              check_in_time: null,

              note: "Không điểm danh",
            })),
          };

          await saveBulkAttendance(payload);

          message.success(`Đã đánh dấu ${unmarked.length} học viên vắng.`);

          setQrScannerOpen(false);

          await loadAttendance();
        } catch (err) {
          message.error(
            err?.response?.data?.message || "Không thể cập nhật trạng thái.",
          );
        }
      },
    });
  };

  /* =======================================================
     STUDENT HISTORY
  ======================================================= */

  const handleViewStudent = async (student) => {
    try {
      setSelectedStudent(student);

      setStudentDetailOpen(true);

      setLoadingStudentHistory(true);

      setStudentHistory([]);

      const response = await getStudentAttendance(Number(student.student_id));

      const attendances =
        response?.data?.attendances || response?.attendances || [];

      setStudentHistory(Array.isArray(attendances) ? attendances : []);
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Không thể tải lịch sử điểm danh.",
      );
    } finally {
      setLoadingStudentHistory(false);
    }
  };

  /* =======================================================
     MONTH HISTORY
  ======================================================= */

  const monthlyHistory = useMemo(() => {
    return studentHistory
      .filter((item) => {
        if (!item.attendance_date) {
          return false;
        }

        const date = dayjs(item.attendance_date);

        return (
          date.year() === selectedDate.year() &&
          date.month() === selectedDate.month()
        );
      })
      .sort(
        (a, b) =>
          dayjs(b.attendance_date).valueOf() -
          dayjs(a.attendance_date).valueOf(),
      );
  }, [studentHistory, selectedDate]);

  /* =======================================================
     MONTH STUDENT STATISTICS
  ======================================================= */

  const monthlyStatistics = useMemo(() => {
    const total = monthlyHistory.length;

    const present = monthlyHistory.filter(
      (item) => item.status === "present",
    ).length;

    const absent = monthlyHistory.filter(
      (item) => item.status === "absent",
    ).length;

    const late = monthlyHistory.filter((item) => item.status === "late").length;

    return {
      total,
      present,
      absent,
      late,
    };
  }, [monthlyHistory]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="attendance-page">
      {/* =================================================
          GLOBAL CSS
      ================================================= */}

      <style>
        {`

        /* =================================================
           RESET
        ================================================= */

        .attendance-page,
        .attendance-page * {
          box-sizing: border-box;
        }

        .attendance-page {
          width: 100%;
          min-height: 100vh;

          padding:
            20px
            clamp(12px, 2vw, 28px)
            80px;

          background:
            #fffafb;

          color:
            #334155;

          overflow-x: hidden;
        }


        /* =================================================
           HERO
        ================================================= */

        .attendance-hero {
          width: 100%;
          margin-bottom: 18px;
        }


        /* =================================================
           ALERT
        ================================================= */

        .attendance-alert {
          margin-bottom: 18px;
          border-radius: 14px;
        }


        /* =================================================
           FILTER
        ================================================= */

        .attendance-filter {
          width: 100%;

          display: grid;

          grid-template-columns:
            minmax(260px, 1.5fr)
            minmax(220px, .8fr)
            110px;

          gap: 14px;

          align-items: end;

          padding: 17px;

          margin-bottom: 18px;

          background: #ffffff;

          border:
            1px solid #e8edf3;

          border-radius: 20px;

          box-shadow:
            0 5px 20px
            rgba(148,163,184,.07);
        }


        .attendance-filter-item {
          min-width: 0;

          display: flex;

          flex-direction: column;

          gap: 7px;
        }


        .attendance-filter-label {
          color: #334155;

          font-size: 13px;

          font-weight: 700;
        }


        .attendance-filter
        .ant-select,
        .attendance-filter
        .ant-picker {
          width: 100%;
        }


        .attendance-filter
        .ant-select-selector,
        .attendance-filter
        .ant-picker {
          border-radius: 11px !important;
        }


        .attendance-reload {
          height: 40px;

          border:
            1px solid #dfe5ec;

          border-radius: 11px;

          background: #ffffff;

          color: #526175;

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          transition: .18s;
        }


        .attendance-reload:hover {
          border-color: #f45b7a;

          color: #f45b7a;

          background: #fff4f7;
        }


        /* =================================================
           MAIN TWO COLUMN
        ================================================= */

        .attendance-workspace {
          width: 100%;

          display: grid;

          grid-template-columns:
            minmax(0, 1.38fr)
            minmax(360px, .72fr);

          gap: 18px;

          align-items: start;
        }


        .attendance-panel {
          min-width: 0;

          background: #ffffff;

          border:
            1px solid #e7ecf2;

          border-radius: 22px;

          overflow: hidden;

          box-shadow:
            0 7px 28px
            rgba(148,163,184,.07);
        }


        /* =================================================
           PANEL HEADER
        ================================================= */

        .attendance-panel-header {
          min-width: 0;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding:
            18px 20px 15px;

          border-bottom:
            1px solid #f0f2f5;
        }


        .attendance-title-group {
          min-width: 0;

          display: flex;

          align-items: center;

          gap: 11px;
        }


        .attendance-icon {
          width: 43px;
          height: 43px;

          min-width: 43px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 13px;

          font-size: 19px;
        }


        .attendance-icon.pink {
          color: #f45b7a;
          background: #ffe9ef;
        }


        .attendance-icon.qr {
          color: #f45b7a;
          background: #ffe9ef;
        }


        .attendance-title-text {
          min-width: 0;
        }


        .attendance-title-text h2 {
          margin: 0;

          color: #334155;

          font-size: 17px;

          line-height: 1.3;

          font-weight: 750;
        }


        .attendance-title-text p {
          margin:
            3px 0 0;

          color: #98a3b2;

          font-size: 11px;

          line-height: 1.4;
        }


        /* =================================================
           SEARCH
        ================================================= */

        .attendance-search {
          width: 270px;

          flex-shrink: 0;
        }


        .attendance-search.ant-input-affix-wrapper {
          height: 39px;

          border-radius: 10px;
        }


        /* =================================================
           STATUS FILTER
        ================================================= */

        .attendance-status-tabs {
          width: 100%;

          display: flex;

          gap: 7px;

          padding:
            12px 18px;

          overflow-x: auto;

          scrollbar-width: thin;

          border-bottom:
            1px solid #f1f3f6;
        }


        .attendance-status-tabs::-webkit-scrollbar {
          height: 3px;
        }


        .attendance-status-tab {
          flex-shrink: 0;

          height: 32px;

          padding:
            0 12px;

          border:
            1px solid #e7ebf0;

          border-radius: 9px;

          background: #ffffff;

          color: #718096;

          font-size: 11px;

          font-weight: 650;

          white-space: nowrap;

          cursor: pointer;

          transition: .18s;
        }


        .attendance-status-tab:hover {
          border-color: #ffc0cd;

          color: #f45b7a;

          background: #fff8fa;
        }


        .attendance-status-tab.active {
          color: #f45b7a;

          border-color: #ffb1c1;

          background: #fff1f5;
        }


        .attendance-status-tab.present.active {
          color: #269653;

          border-color: #bfe6ca;

          background: #effaf2;
        }


        .attendance-status-tab.absent.active {
          color: #e44848;

          border-color: #ffcccc;

          background: #fff1f1;
        }


        .attendance-status-tab.late.active {
          color: #c58a13;

          border-color: #ffe4a5;

          background: #fff9e9;
        }


        .attendance-status-tab.excused.active {
          color: #3979c6;

          border-color: #c9dfff;

          background: #eef6ff;
        }


        /* =================================================
           TABLE WRAPPER
        ================================================= */

        .attendance-table-wrapper {
          width: 100%;

          overflow-x: auto;

          overflow-y: hidden;

          -webkit-overflow-scrolling: touch;

          scrollbar-width: thin;
        }


        .attendance-table-inner {
          min-width: 680px;
        }


        /* =================================================
           TABLE HEADER / ROW
        ================================================= */

        .attendance-table-head,
        .attendance-table-row {
          display: grid;

          grid-template-columns:
            35px
            minmax(180px, 1.7fr)
            105px
            110px
            65px
            30px;

          gap: 8px;

          align-items: center;

          padding:
            0 18px;
        }


        .attendance-table-head {
          height: 43px;

          background: #f8fafc;

          color: #8490a0;

          font-size: 10px;

          font-weight: 750;

          text-transform: uppercase;
        }


        .attendance-table-row {
          min-height: 70px;

          border-bottom:
            1px solid #f0f2f5;

          transition:
            background .16s ease;
        }


        .attendance-table-row:hover {
          background: #fff9fb;
        }


        /* =================================================
           NUMBER
        ================================================= */

        .attendance-number {
          width: 26px;
          height: 26px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 8px;

          background: #f3f6fa;

          color: #64748b;

          font-size: 10px;

          font-weight: 700;
        }


        /* =================================================
           STUDENT
        ================================================= */

        .attendance-student {
          min-width: 0;

          display: flex;

          align-items: center;

          gap: 9px;
        }


        .attendance-avatar {
          flex-shrink: 0 !important;

          background:
            linear-gradient(
              135deg,
              #ff7692,
              #ec4a70
            ) !important;

          color: #ffffff !important;

          font-weight: 750;
        }


        .attendance-student-info {
          min-width: 0;
        }


        .attendance-student-name {
          display: flex;

          align-items: center;

          gap: 4px;

          min-width: 0;

          color: #334155;

          font-size: 12px;

          font-weight: 700;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }


        .attendance-student-eye {
          width: 23px;
          height: 23px;

          flex-shrink: 0;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding: 0;

          border: none;

          border-radius: 7px;

          background: transparent;

          color: #5b8fe7;

          cursor: pointer;
        }


        .attendance-student-eye:hover {
          background: #eef5ff;
        }


        .attendance-student-meta {
          display: flex;

          align-items: center;

          gap: 6px;

          margin-top: 3px;

          color: #9aa5b3;

          font-size: 9px;
        }


        .attendance-checked {
          padding:
            2px 5px;

          border-radius: 5px;

          background: #effaf2;

          color: #42a55b;

          font-weight: 600;
        }


        /* =================================================
           CODE
        ================================================= */

        .attendance-code {
          color: #64748b;

          font-size: 11px;

          white-space: nowrap;
        }


        /* =================================================
           STATUS
        ================================================= */

        .attendance-status {
          width: fit-content;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 4px;

          padding:
            5px 8px;

          border: 1px solid;

          border-radius: 8px;

          font-size: 10px;

          font-weight: 700;

          white-space: nowrap;
        }


        .attendance-status-empty {
          padding:
            5px 8px;

          border:
            1px solid #e4e8ed;

          border-radius: 8px;

          background: #f8fafc;

          color: #a0a9b5;

          font-size: 10px;

          white-space: nowrap;
        }


        /* =================================================
           TIME
        ================================================= */

        .attendance-time {
          color: #4c7dbc;

          font-size: 11px;

          font-weight: 650;
        }


        .attendance-time.empty {
          color: #cbd5e1;

          font-weight: 400;
        }


        /* =================================================
           MORE
        ================================================= */

        .attendance-more {
          width: 28px;
          height: 28px;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 0;

          border: none;

          border-radius: 8px;

          background: transparent;

          color: #9aa5b3;

          cursor: pointer;
        }


        .attendance-more:hover {
          background: #fff1f5;

          color: #f45b7a;
        }


        /* =================================================
           TABLE FOOTER
        ================================================= */

        .attendance-table-footer {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 12px;

          padding:
            13px 18px;

          color: #9aa4b1;

          font-size: 10px;
        }


        .attendance-table-footer strong {
          color: #475569;
        }


        /* =================================================
           CAMERA PANEL
        ================================================= */

        .qr-panel {
          background:
            linear-gradient(
              180deg,
              #fffafb 0%,
              #ffffff 65%
            );
        }


        /* =================================================
           CAMERA TOGGLE
        ================================================= */

        .qr-toggle {
          position: relative;

          width: 108px;
          height: 38px;

          min-width: 108px;

          padding:
            0 10px 0 38px;

          border:
            1px solid #e2e7ed;

          border-radius: 22px;

          background: #f2f4f6;

          color: #99a3af;

          font-size: 10px;

          font-weight: 750;

          cursor: pointer;

          transition: .2s;
        }


        .qr-toggle-circle {
          position: absolute;

          top: 4px;
          left: 4px;

          width: 30px;
          height: 30px;

          border-radius: 50%;

          background: #ffffff;

          box-shadow:
            0 2px 7px
            rgba(0,0,0,.12);

          transition: .2s;
        }


        .qr-toggle.enabled {
          padding:
            0 37px 0 8px;

          background: #f45b7a;

          border-color: #f45b7a;

          color: #ffffff;
        }


        .qr-toggle.enabled
        .qr-toggle-circle {
          left: auto;

          right: 4px;
        }


        /* =================================================
           CAMERA AREA
        ================================================= */

        .qr-camera-area {
          padding:
            18px 18px 17px;
        }


        /* =================================================
           CAMERA OFF
        ================================================= */

        .qr-camera-off {
          min-height: 330px;

          width: 100%;

          padding: 30px 20px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          border:
            1px dashed #dfe5ec;

          border-radius: 18px;

          background: #fafbfd;
        }


        .qr-camera-off-icon {
          width: 68px;
          height: 68px;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 13px;

          border-radius: 18px;

          background: #f1f4f7;

          color: #a5afbc;

          font-size: 30px;
        }


        .qr-camera-off strong {
          margin-bottom: 6px;

          color: #475569;

          font-size: 15px;
        }


        .qr-camera-off-text {
          max-width: 270px;

          margin-bottom: 18px;

          color: #98a3b2;

          font-size: 11px;

          line-height: 1.6;
        }


        /* =================================================
           START BUTTON
        ================================================= */

        .qr-start-button {
          height: 42px;

          padding:
            0 20px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          border: none;

          border-radius: 10px;

          background: #f45b7a;

          color: #ffffff;

          font-size: 11px;

          font-weight: 750;

          cursor: pointer;

          transition: .18s;
        }


        .qr-start-button:hover {
          background: #ec4c70;
        }


        /* =================================================
           CAMERA ACTIVE
        ================================================= */

        .qr-camera-active {
          min-height: 330px;

          width: 100%;

          padding: 18px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          position: relative;

          overflow: hidden;

          border-radius: 18px;

          background: #182231;
        }


        .qr-camera-live {
          position: absolute;

          top: 13px;
          left: 13px;

          z-index: 2;

          display: flex;

          align-items: center;

          gap: 6px;

          padding:
            6px 9px;

          border-radius: 20px;

          background:
            rgba(255,255,255,.10);

          color: #ffffff;

          font-size: 9px;

          font-weight: 700;
        }


        .camera-live-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #ff5577;

          animation:
            cameraPulse 1.5s infinite;
        }


        @keyframes cameraPulse {
          0% {
            opacity: 1;
          }

          50% {
            opacity: .35;
          }

          100% {
            opacity: 1;
          }
        }


        .qr-scan-frame {
          width: 210px;
          height: 210px;

          max-width: 75%;

          border:
            2px solid
            rgba(255,255,255,.9);

          border-radius: 17px;

          display: flex;

          align-items: center;

          justify-content: center;

          text-align: center;

          position: relative;
        }


        .qr-scan-frame::before,
        .qr-scan-frame::after {
          content: "";

          position: absolute;

          width: 28px;
          height: 28px;

          border-color: #ff7190;

          border-style: solid;
        }


        .qr-scan-frame::before {
          top: -2px;
          left: -2px;

          border-width:
            3px 0 0 3px;

          border-radius:
            12px 0 0 0;
        }


        .qr-scan-frame::after {
          right: -2px;
          bottom: -2px;

          border-width:
            0 3px 3px 0;

          border-radius:
            0 0 12px 0;
        }


        .qr-scan-content {
          display: flex;

          flex-direction: column;

          align-items: center;

          gap: 7px;

          color: #ffffff;
        }


        .qr-scan-content .anticon {
          color: #ff7190;

          font-size: 38px;
        }


        .qr-scan-content strong {
          font-size: 12px;
        }


        .qr-scan-content span {
          max-width: 150px;

          color: #cbd5e1;

          font-size: 9px;

          line-height: 1.5;
        }


        .qr-stop-button {
          height: 36px;

          margin-top: 15px;

          padding:
            0 16px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 6px;

          border:
            1px solid
            rgba(255,255,255,.18);

          border-radius: 9px;

          background:
            rgba(255,255,255,.08);

          color: #ffffff;

          font-size: 10px;

          font-weight: 650;

          cursor: pointer;
        }


        .qr-stop-button:hover {
          background:
            rgba(255,255,255,.14);
        }


        /* =================================================
           GUIDE
        ================================================= */

        .qr-guide {
          margin:
            0 18px 18px;

          padding:
            15px;

          border:
            1px solid #f0e3e7;

          border-radius: 16px;

          background:
            linear-gradient(
              135deg,
              #fffdf7,
              #fff5f8
            );
        }


        .qr-guide-title {
          display: flex;

          align-items: center;

          gap: 8px;

          margin-bottom: 12px;
        }


        .qr-guide-icon {
          width: 33px;
          height: 33px;

          min-width: 33px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 9px;

          background: #fff3c8;

          font-size: 16px;
        }


        .qr-guide-title strong {
          display: block;

          color: #334155;

          font-size: 12px;
        }


        .qr-guide-title span {
          display: block;

          margin-top: 2px;

          color: #a0a9b6;

          font-size: 9px;
        }


        .qr-step {
          display: flex;

          align-items: center;

          gap: 8px;

          margin-top: 8px;
        }


        .qr-step-number {
          width: 22px;
          height: 22px;

          min-width: 22px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background: #ffe1e8;

          color: #f45b7a;

          font-size: 9px;

          font-weight: 750;
        }


        .qr-step p {
          margin: 0;

          color: #64748b;

          font-size: 10px;

          line-height: 1.4;
        }


        /* =================================================
           CAMERA SCANNER COMPONENT
        ================================================= */

        /*
          QRCodeScanner được render bên ngoài phần layout.
          Component tự quản lý phần camera thật.
          open = qrScannerOpen.
        */


        /* =================================================
           HISTORY
        ================================================= */

        .attendance-history-stat {
          padding: 8px 0;
        }


        .attendance-history-row {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;

          padding:
            10px 12px;

          margin-bottom: 7px;

          border-radius: 9px;
        }


        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1150px) {

          .attendance-workspace {
            grid-template-columns:
              minmax(0, 1.15fr)
              minmax(330px, .85fr);
          }

          .attendance-table-head,
          .attendance-table-row {
            grid-template-columns:
              32px
              minmax(165px, 1.5fr)
              90px
              105px
              60px
              28px;
          }

          .attendance-search {
            width: 220px;
          }

        }


        /* =================================================
           SMALL TABLET
        ================================================= */

        @media (max-width: 960px) {

          .attendance-workspace {
            grid-template-columns: 1fr;
          }

          .qr-panel {
            order: -1;
          }

          .qr-camera-area {
            padding:
              20px;
          }

          .qr-camera-off,
          .qr-camera-active {
            min-height: 350px;
          }

          .qr-scan-frame {
            width: 230px;
            height: 230px;
          }

        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 680px) {

          .attendance-page {
            padding:
              10px
              10px
              70px;
          }


          .attendance-filter {
            grid-template-columns: 1fr;

            gap: 11px;

            padding: 14px;

            border-radius: 16px;
          }


          .attendance-filter-item {
            width: 100%;
          }


          .attendance-reload {
            width: 100%;

            height: 42px;
          }


          .attendance-workspace {
            display: flex;

            flex-direction: column;

            gap: 13px;
          }


          .attendance-panel {
            width: 100%;

            border-radius: 17px;
          }


          .qr-panel {
            order: 1;
          }


          .student-panel {
            order: 2;
          }


          /* HEADER */

          .attendance-panel-header {
            padding:
              15px;

            flex-direction: column;

            align-items: stretch;

            gap: 12px;
          }


          .attendance-title-group {
            width: 100%;
          }


          .attendance-title-text h2 {
            font-size: 15px;
          }


          .attendance-title-text p {
            font-size: 10px;
          }


          .attendance-icon {
            width: 40px;
            height: 40px;

            min-width: 40px;

            font-size: 17px;
          }


          .attendance-search {
            width: 100%;
          }


          /* STATUS */

          .attendance-status-tabs {
            padding:
              10px 12px;
          }


          .attendance-status-tab {
            height: 34px;

            padding:
              0 11px;

            font-size: 10px;
          }


          /* TABLE */

          .attendance-table-head,
          .attendance-table-row {
            padding:
              0 13px;
          }


          .attendance-table-footer {
            padding:
              12px;

            flex-direction: column;

            align-items: flex-start;
          }


          /* QR */

          .qr-panel-header {
            padding:
              15px;

            align-items: center;
          }


          .qr-toggle {
            width: 100px;

            min-width: 100px;
          }


          .qr-camera-area {
            padding:
              13px;
          }


          .qr-camera-off,
          .qr-camera-active {
            min-height: 300px;

            border-radius: 15px;
          }


          .qr-camera-off {
            padding:
              25px 15px;
          }


          .qr-camera-off-icon {
            width: 60px;
            height: 60px;

            font-size: 27px;
          }


          .qr-camera-off strong {
            font-size: 14px;
          }


          .qr-camera-off-text {
            font-size: 10px;
          }


          .qr-scan-frame {
            width: 190px;
            height: 190px;

            max-width: 70%;
          }


          .qr-guide {
            margin:
              0 13px 13px;

            padding:
              13px;
          }


          /* SCANNER */

          .qr-stop-button {
            height: 38px;
          }

        }


        /* =================================================
           VERY SMALL MOBILE
        ================================================= */

        @media (max-width: 390px) {

          .attendance-page {
            padding:
              7px
              7px
              60px;
          }


          .attendance-filter {
            padding: 11px;
          }


          .attendance-title-group {
            gap: 8px;
          }


          .attendance-icon {
            width: 36px;
            height: 36px;

            min-width: 36px;

            border-radius: 10px;

            font-size: 15px;
          }


          .attendance-title-text h2 {
            font-size: 14px;
          }


          .attendance-title-text p {
            font-size: 9px;
          }


          .qr-toggle {
            width: 94px;

            min-width: 94px;

            height: 36px;

            font-size: 9px;
          }


          .qr-toggle-circle {
            width: 28px;
            height: 28px;
          }


          .qr-camera-off,
          .qr-camera-active {
            min-height: 275px;
          }


          .qr-scan-frame {
            width: 170px;
            height: 170px;
          }


          .attendance-table-inner {
            min-width: 650px;
          }

        }
          /* =========================================================
   INLINE QR SCANNER
========================================================= */

.inline-qr-scanner {
  width: 100%;
}


/* =========================================================
   CAMERA OFF
========================================================= */

.qr-camera-off-state {
  width: 100%;
  min-height: 330px;

  padding: 30px 20px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;

  border:
    1px dashed #dfe5ec;

  border-radius: 18px;

  background: #fafbfd;
}


.qr-camera-off-icon {
  width: 68px;
  height: 68px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 13px;

  border-radius: 18px;

  background: #f1f4f7;

  color: #a5afbc;

  font-size: 30px;
}


.qr-camera-off-state strong {
  margin-bottom: 7px;

  color: #475569;

  font-size: 15px;
}


.qr-camera-off-state span {
  max-width: 270px;

  color: #98a3b2;

  font-size: 11px;

  line-height: 1.6;
}


/* =========================================================
   CAMERA
========================================================= */

.inline-qr-camera {
  width: 100%;

  height: 390px;

  position: relative;

  overflow: hidden;

  border-radius: 18px;

  background: #111827;

  border: 2px solid #e2e8f0;
}


.inline-qr-camera video {
  width: 100% !important;
  height: 100% !important;

  object-fit: cover !important;
}


/* =========================================================
   OVERLAY
========================================================= */

.inline-qr-overlay {
  position: absolute;

  inset: 0;

  pointer-events: none;

  background:
    linear-gradient(
      to bottom,
      rgba(15,23,42,.30),
      transparent 30%,
      transparent 65%,
      rgba(15,23,42,.45)
    );
}


/* =========================================================
   LIVE
========================================================= */

.inline-qr-live {
  position: absolute;

  top: 13px;
  left: 13px;

  z-index: 5;

  display: flex;

  align-items: center;

  gap: 7px;

  padding:
    7px 10px;

  border-radius: 20px;

  background:
    rgba(15,23,42,.65);

  color: #fff;

  font-size: 10px;

  font-weight: 700;

  backdrop-filter:
    blur(6px);
}


.inline-qr-live span {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #ff5577;

  box-shadow:
    0 0 0 4px
    rgba(255,85,119,.18);

  animation:
    qrLivePulse 1.4s infinite;
}


@keyframes qrLivePulse {

  0% {
    opacity: 1;
  }

  50% {
    opacity: .35;
  }

  100% {
    opacity: 1;
  }

}


/* =========================================================
   QR FRAME
========================================================= */

.inline-qr-frame-wrapper {
  position: absolute;

  inset: 0;

  z-index: 3;

  display: flex;

  align-items: center;

  justify-content: center;

  pointer-events: none;
}


.inline-qr-frame {
  width: 215px;
  height: 215px;

  position: relative;

  border-radius: 20px;

  box-shadow:
    0 0 0 9999px
    rgba(15,23,42,.38);
}


/* =========================================================
   CORNERS
========================================================= */

.inline-qr-frame .corner {
  position: absolute;

  width: 32px;
  height: 32px;

  border-color:
    #FBBF24;

  border-style: solid;
}


.inline-qr-frame
.corner.top-left {

  top: 0;
  left: 0;

  border-width:
    4px 0 0 4px;

  border-radius:
    14px 0 0 0;
}


.inline-qr-frame
.corner.top-right {

  top: 0;
  right: 0;

  border-width:
    4px 4px 0 0;

  border-radius:
    0 14px 0 0;
}


.inline-qr-frame
.corner.bottom-left {

  left: 0;
  bottom: 0;

  border-width:
    0 0 4px 4px;

  border-radius:
    0 0 0 14px;
}


.inline-qr-frame
.corner.bottom-right {

  right: 0;
  bottom: 0;

  border-width:
    0 4px 4px 0;

  border-radius:
    0 0 14px 0;
}


/* =========================================================
   HINT
========================================================= */

.inline-qr-hint {
  position: absolute;

  z-index: 5;

  bottom: 20px;

  left: 0;
  right: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  color: #ffffff;

  font-size: 11px;

  font-weight: 650;

  text-shadow:
    0 1px 4px rgba(0,0,0,.5);
}


/* =========================================================
   PROCESSING
========================================================= */

.inline-qr-processing {
  position: absolute;

  inset: 0;

  z-index: 20;

  display: flex;

  align-items: center;

  justify-content: center;

  background:
    rgba(15,23,42,.55);

  backdrop-filter:
    blur(5px);
}


.inline-qr-processing-card {
  min-width: 155px;

  padding:
    18px;

  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 9px;

  border-radius: 18px;

  background:
    rgba(255,255,255,.96);

  box-shadow:
    0 12px 30px
    rgba(0,0,0,.18);
}


.inline-qr-processing-card strong {
  color: #475569;

  font-size: 12px;
}


/* =========================================================
   RESULT
========================================================= */

.inline-qr-result {
  position: absolute;

  z-index: 30;

  left: 12px;
  right: 12px;

  bottom: 12px;

  animation:
    inlineQRResultIn
    .3s ease;
}


@keyframes inlineQRResultIn {

  from {
    opacity: 0;

    transform:
      translateY(15px)
      scale(.97);
  }

  to {
    opacity: 1;

    transform:
      translateY(0)
      scale(1);
  }

}


.inline-qr-result-card {
  margin: 0 !important;

  border-radius: 17px !important;

  overflow: hidden;

  box-shadow:
    0 10px 25px
    rgba(0,0,0,.16);
}


.inline-qr-result-inner {
  display: flex;

  align-items: flex-start;

  gap: 10px;

  padding: 13px;
}


.inline-qr-result-icon {
  flex-shrink: 0;

  font-size: 27px;

  line-height: 1;
}


.inline-qr-result-content {
  min-width: 0;

  flex: 1;
}


.inline-qr-result-title {
  display: block;

  font-size: 14px;

  line-height: 1.3;
}


.inline-qr-student-name {
  display: block;

  margin-top: 3px;

  color: #1e293b;

  font-size: 16px;
}


.inline-qr-meta {
  display: block;

  margin-top: 2px;

  font-size: 10px;
}


.inline-qr-time {
  margin:
    6px 0 0 !important;

  border-radius: 10px !important;

  font-size: 10px !important;
}


.inline-qr-message {
  display: block;

  margin-top: 5px;

  font-size: 10px;

  line-height: 1.4;
}


/* =========================================================
   STATUS
========================================================= */

.inline-qr-status {
  min-height: 40px;

  margin-top: 10px;

  padding:
    8px 12px;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  border-radius: 10px;

  background: #f8fafc;

  border:
    1px solid #e2e8f0;

  color: #64748b;

  font-size: 10px;

  font-weight: 600;
}


.inline-qr-status-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #059669;

  box-shadow:
    0 0 0 4px
    rgba(5,150,105,.12);
}


.inline-qr-status-dot.processing {
  background: #d97706;

  box-shadow:
    0 0 0 4px
    rgba(217,119,6,.12);
}


.inline-qr-status-dot.warning {
  background: #d97706;
}


.inline-qr-status-dot.error,
.inline-qr-status-dot.class_error {
  background: #e11d48;

  box-shadow:
    0 0 0 4px
    rgba(225,29,72,.12);
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 680px) {

  .qr-camera-off-state {
    min-height: 280px;

    padding:
      25px 15px;
  }


  .qr-camera-off-icon {
    width: 60px;
    height: 60px;

    font-size: 27px;
  }


  .qr-camera-off-state strong {
    font-size: 14px;
  }


  .qr-camera-off-state span {
    font-size: 10px;
  }


  .inline-qr-camera {
    height:
      min(
        390px,
        58vh
      );

    min-height: 290px;

    border-radius: 15px;
  }


  .inline-qr-frame {
    width:
      min(
        210px,
        60vw
      );

    height:
      min(
        210px,
        60vw
      );
  }


  .inline-qr-result {
    left: 7px;
    right: 7px;

    bottom: 7px;
  }


  .inline-qr-result-inner {
    padding: 10px;

    gap: 8px;
  }


  .inline-qr-result-title {
    font-size: 12px;
  }


  .inline-qr-student-name {
    font-size: 14px;
  }


  .inline-qr-meta {
    font-size: 9px;
  }


  .inline-qr-message {
    font-size: 9px;
  }


  .inline-qr-status {
    min-height: 36px;

    font-size: 9px;
  }

}


/* =========================================================
   SMALL PHONE
========================================================= */

@media (max-width: 390px) {

  .inline-qr-camera {
    height: 270px;

    min-height: 270px;
  }


  .inline-qr-frame {
    width: 165px;
    height: 165px;
  }


  .inline-qr-live {
    top: 8px;
    left: 8px;

    padding:
      5px 8px;

    font-size: 8px;
  }


  .inline-qr-hint {
    bottom: 12px;

    font-size: 9px;
  }

}

        `}
      </style>

      {/* =================================================
          HERO
      ================================================= */}

      <div className="attendance-hero">
        <PageHeroHeader
          icon={<BookOutlined />}
          badgeText="🌸 QUẢN LÝ GIÁO LÝ"
          title="Điểm Danh"
          description="Quản lý điểm danh học viên bằng danh sách và camera QR."
        />
      </div>

      {/* =================================================
          DATE LOCK
      ================================================= */}

      {attendanceLocked && (
        <Alert
          className="attendance-alert"
          type="warning"
          showIcon
          icon={<LockOutlined />}
          message="Ngày điểm danh đã khóa chỉnh sửa"
          description={
            <>
              Bạn đang xem dữ liệu ngày{" "}
              <strong>{selectedDate.format("DD/MM/YYYY")}</strong>. Ngày đã qua
              chỉ được xem.
            </>
          }
        />
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Alert
          className="attendance-alert"
          type="error"
          showIcon
          closable
          message={error}
          onClose={() => setError("")}
        />
      )}

      {/* =================================================
          FILTER
      ================================================= */}

      <div className="attendance-filter">
        <div className="attendance-filter-item">
          <label className="attendance-filter-label">Chọn lớp 📚</label>

          <Select
            size="large"
            value={selectedClassId ? Number(selectedClassId) : undefined}
            loading={loadingClasses}
            placeholder="Chọn lớp..."
            showSearch
            optionFilterProp="label"
            onChange={(value) => setSelectedClassId(Number(value))}
            options={classes.map((item) => ({
              value: Number(item.id || item.class_id),

              label:
                item.name ||
                item.class_name ||
                `Lớp ${item.id || item.class_id}`,
            }))}
          />
        </div>

        <div className="attendance-filter-item">
          <label className="attendance-filter-label">Ngày điểm danh 🗓️</label>

          <DatePicker
            size="large"
            value={selectedDate}
            allowClear={false}
            format="DD/MM/YYYY"
            onChange={(date) => {
              if (date) {
                setSelectedDate(date);
              }
            }}
            suffixIcon={
              <CalendarOutlined
                style={{
                  color: "#f45b7a",
                }}
              />
            }
          />
        </div>

        <button
          type="button"
          className="attendance-reload"
          onClick={loadAttendance}
          disabled={loadingAttendance}
        >
          <ReloadOutlined />
          Tải lại
        </button>
      </div>

      {/* =================================================
          WORKSPACE
      ================================================= */}

      <div className="attendance-workspace">
        {/* =================================================
            LEFT — STUDENT LIST
        ================================================= */}

        <section className="attendance-panel student-panel">
          {/* HEADER */}

          <div className="attendance-panel-header">
            <div className="attendance-title-group">
              <div className="attendance-icon pink">
                <TeamOutlined />
              </div>

              <div className="attendance-title-text">
                <h2>Danh sách học viên</h2>

                <p>
                  {selectedClass?.name ||
                    selectedClass?.class_name ||
                    "Chưa chọn lớp"}
                  {" • "}
                  {statistics.total} học viên
                </p>
              </div>
            </div>

            <Input
              className="attendance-search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              placeholder="Tìm tên hoặc mã học viên..."
              prefix={
                <SearchOutlined
                  style={{
                    color: "#9AA5B3",
                  }}
                />
              }
            />
          </div>

          {/* STATUS */}

          <div className="attendance-status-tabs">
            <button
              type="button"
              className={`attendance-status-tab ${
                statusFilter === "all" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("all")}
            >
              Tất cả ({statistics.total})
            </button>

            <button
              type="button"
              className={`attendance-status-tab present ${
                statusFilter === "present" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("present")}
            >
              Có mặt ({statistics.present})
            </button>

            <button
              type="button"
              className={`attendance-status-tab absent ${
                statusFilter === "absent" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("absent")}
            >
              Vắng ({statistics.absent})
            </button>

            <button
              type="button"
              className={`attendance-status-tab late ${
                statusFilter === "late" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("late")}
            >
              Muộn ({statistics.late})
            </button>

            <button
              type="button"
              className={`attendance-status-tab excused ${
                statusFilter === "excused" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("excused")}
            >
              Có phép ({statistics.excused})
            </button>

            <button
              type="button"
              className={`attendance-status-tab ${
                statusFilter === "unmarked" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("unmarked")}
            >
              Chưa điểm danh ({statistics.notMarked})
            </button>
          </div>

          {/* TABLE */}

          <div className="attendance-table-wrapper">
            <div className="attendance-table-inner">
              {/* HEAD */}

              <div className="attendance-table-head">
                <span>#</span>

                <span>Họ và tên</span>

                <span>Mã học viên</span>

                <span>Trạng thái</span>

                <span>Thời gian</span>

                <span />
              </div>

              {/* LOADING */}

              {loadingAttendance ? (
                <div
                  style={{
                    minHeight: 330,

                    display: "flex",

                    flexDirection: "column",

                    alignItems: "center",

                    justifyContent: "center",

                    gap: 12,

                    color: "#94A3B8",
                  }}
                >
                  <Spin size="large" />

                  <span>Đang tải danh sách...</span>
                </div>
              ) : !selectedClassId ? (
                <Empty
                  description="Vui lòng chọn lớp"
                  style={{
                    padding: "70px 20px",
                  }}
                />
              ) : paginatedStudents.length === 0 ? (
                <Empty
                  description="Không tìm thấy học viên"
                  style={{
                    padding: "70px 20px",
                  }}
                />
              ) : (
                paginatedStudents.map((student, index) => {
                  const status =
                    student.status || student.attendance_status || null;

                  const config = status ? STATUS_CONFIG[status] : null;

                  const number = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <div
                      key={student.student_id}
                      className="attendance-table-row"
                    >
                      {/* NUMBER */}

                      <div>
                        <span className="attendance-number">{number}</span>
                      </div>

                      {/* STUDENT */}

                      <div className="attendance-student">
                        <Avatar size={39} className="attendance-avatar">
                          {(student.student_name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </Avatar>

                        <div className="attendance-student-info">
                          <div className="attendance-student-name">
                            <span>{student.student_name}</span>

                            <Tooltip title="Xem lịch sử">
                              <button
                                type="button"
                                className="attendance-student-eye"
                                onClick={() => handleViewStudent(student)}
                              >
                                <EyeOutlined />
                              </button>
                            </Tooltip>
                          </div>

                          <div className="attendance-student-meta">
                            <span>
                              {student.code || `ID: ${student.student_id}`}
                            </span>

                            {student.attendance_id && (
                              <span className="attendance-checked">
                                ✓ Đã điểm danh
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CODE */}

                      <div className="attendance-code">
                        {student.code ||
                          `HS${String(student.student_id).padStart(5, "0")}`}
                      </div>

                      {/* STATUS */}

                      <div>
                        {config ? (
                          <span
                            className="attendance-status"
                            style={{
                              color: config.color,

                              background: config.bg,

                              borderColor: config.border,
                            }}
                          >
                            {config.icon}

                            {config.label}
                          </span>
                        ) : (
                          <span className="attendance-status-empty">
                            Chưa điểm danh
                          </span>
                        )}
                      </div>

                      {/* TIME */}

                      <div>
                        {student.check_in_time ? (
                          <span className="attendance-time">
                            {student.check_in_time}
                          </span>
                        ) : (
                          <span className="attendance-time empty">-</span>
                        )}
                      </div>

                      {/* MORE */}

                      <div>
                        <Tooltip title="Xem chi tiết">
                          <button
                            type="button"
                            className="attendance-more"
                            onClick={() => handleViewStudent(student)}
                          >
                            <MoreOutlined />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* FOOTER */}

          {!loadingAttendance && students.length > 0 && (
            <div className="attendance-table-footer">
              <span>
                Hiển thị{" "}
                <strong>
                  {paginationStart}-{paginationEnd}
                </strong>{" "}
                trong tổng số <strong>{filteredStudents.length}</strong> học
                viên
              </span>

              <TablePagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredStudents.length}
                onChange={(page, size) => {
                  setCurrentPage(Number(page));

                  setPageSize(Number(size));
                }}
                showSizeChanger
                pageSizeOptions={[10, 20, 50]}
              />
            </div>
          )}
        </section>

        {/* =================================================
            RIGHT — CAMERA
        ================================================= */}

        <section className="attendance-panel qr-panel">
          <div className="attendance-panel-header">
            <div className="attendance-title-group">
              <div className="attendance-icon qr">
                <QrcodeOutlined />
              </div>

              <div className="attendance-title-text">
                <h2>Điểm danh bằng QR</h2>

                <p>Quét mã QR học viên trực tiếp</p>
              </div>
            </div>

            {/* TOGGLE */}

            <button
              type="button"
              className={`qr-toggle ${qrScannerOpen ? "enabled" : ""}`}
              onClick={() => {
                if (!selectedClassId) {
                  message.warning("Vui lòng chọn lớp trước.");

                  return;
                }

                if (attendanceLocked) {
                  message.warning("Ngày điểm danh đã khóa.");

                  return;
                }

                setQrScannerOpen((prev) => !prev);
              }}
            >
              <span className="qr-toggle-circle" />

              {qrScannerOpen ? "Đang bật" : "Đang tắt"}
            </button>
          </div>

          {/* =====================================================
      CAMERA HIỆN TRỰC TIẾP TẠI ĐÂY
  ===================================================== */}

          <div className="qr-camera-area">
            <QRCodeScanner
              open={qrScannerOpen}
              classId={selectedClassId}
              onSuccess={handleQRSuccess}
              onFinishAttendance={handleFinishQRScan}
            />
          </div>

          {/* GUIDE */}

          <div className="qr-guide">
            <div className="qr-guide-title">
              <div className="qr-guide-icon">💡</div>

              <div>
                <strong>Hướng dẫn điểm danh</strong>

                <span>Sử dụng camera QR</span>
              </div>
            </div>

            <div className="qr-step">
              <span className="qr-step-number">1</span>

              <p>Bật camera bằng công tắc phía trên.</p>
            </div>

            <div className="qr-step">
              <span className="qr-step-number">2</span>

              <p>Đưa mã QR của học viên vào khung.</p>
            </div>

            <div className="qr-step">
              <span className="qr-step-number">3</span>

              <p>Hệ thống tự động ghi nhận điểm danh.</p>
            </div>
          </div>
        </section>
      </div>

      {/* =================================================
          STUDENT HISTORY MODAL
      ================================================= */}

      <Modal
        open={studentDetailOpen}
        onCancel={() => setStudentDetailOpen(false)}
        footer={null}
        centered
        width={650}
        title={
          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 8,

              fontWeight: 700,
            }}
          >
            <UserOutlined />
            Lịch sử chuyên cần
          </div>
        }
      >
        {loadingStudentHistory ? (
          <div
            style={{
              minHeight: 250,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: 12,

                marginBottom: 18,
              }}
            >
              <Avatar
                size={48}
                style={{
                  background: "linear-gradient(135deg,#ff7692,#ec4a70)",
                }}
              >
                {(selectedStudent?.student_name || "?").charAt(0).toUpperCase()}
              </Avatar>

              <div>
                <div
                  style={{
                    fontSize: 15,

                    fontWeight: 750,

                    color: "#334155",
                  }}
                >
                  {selectedStudent?.student_name}
                </div>

                <div
                  style={{
                    color: "#94A3B8",

                    fontSize: 11,

                    marginTop: 3,
                  }}
                >
                  {selectedStudent?.code ||
                    `ID: ${selectedStudent?.student_id}`}
                </div>
              </div>
            </div>

            <Row gutter={[10, 10]}>
              <Col span={6}>
                <Statistic title="Tổng buổi" value={monthlyStatistics.total} />
              </Col>

              <Col span={6}>
                <Statistic
                  title="Có mặt"
                  value={monthlyStatistics.present}
                  valueStyle={{
                    color: "#269653",
                  }}
                />
              </Col>

              <Col span={6}>
                <Statistic
                  title="Muộn"
                  value={monthlyStatistics.late}
                  valueStyle={{
                    color: "#C58A13",
                  }}
                />
              </Col>

              <Col span={6}>
                <Statistic
                  title="Vắng"
                  value={monthlyStatistics.absent}
                  valueStyle={{
                    color: "#E44848",
                  }}
                />
              </Col>
            </Row>

            <Divider />

            {monthlyHistory.length === 0 ? (
              <Empty description="Không có lịch sử điểm danh trong tháng này." />
            ) : (
              <div
                style={{
                  maxHeight: 360,

                  overflowY: "auto",
                }}
              >
                {monthlyHistory.map((item, index) => {
                  const config = STATUS_CONFIG[item.status] || {};

                  return (
                    <div
                      key={item.id || item.attendance_id || index}
                      className="attendance-history-row"
                      style={{
                        background: config.bg || "#F8FAFC",

                        border: `1px solid ${config.border || "#E2E8F0"}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",

                          alignItems: "center",

                          gap: 8,
                        }}
                      >
                        <CalendarOutlined />

                        <strong>
                          {dayjs(item.attendance_date).format("DD/MM/YYYY")}
                        </strong>
                      </div>

                      <Tag
                        style={{
                          margin: 0,

                          color: config.color,

                          borderColor: config.border,

                          background: "#fff",
                        }}
                      >
                        {config.label || item.status}
                      </Tag>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default AttendancePage;
