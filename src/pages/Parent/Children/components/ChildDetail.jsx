import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from "antd";

import {
  ArrowLeftOutlined,
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  FireFilled,
  HomeOutlined,
  IdcardOutlined,
  ManOutlined,
  PhoneOutlined,
  ReadOutlined,
  ReloadOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  StarFilled,
  TeamOutlined,
  TrophyFilled,
  UserOutlined,
  WomanOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import parentApi from "../../../../api/parentApi";
import AppButton from "../../../../components/common/AppButton";
import heroFamily from "../../../../assets/images/student-default.png";

const { Title, Text } = Typography;
const { Option } = Select;

/* =========================================================
   HELPERS
========================================================= */

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

const getAvatarUrl = (avatar) => {
  if (!avatar) return heroFamily;

  if (
    String(avatar).startsWith("http://") ||
    String(avatar).startsWith("https://")
  ) {
    return avatar;
  }

  const baseUrl = process.env.REACT_APP_API_URL || "";

  return `${baseUrl}${avatar}`;
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

  if (value === "online") {
    return "Trực tuyến";
  }

  if (value === "paper") {
    return "Trên giấy";
  }

  return type || "Bài kiểm tra";
};

const getScoreColor = (score) => {
  const value = Number(score);

  if (Number.isNaN(value)) {
    return "#173B5E";
  }

  if (value >= 8) {
    return "#2E7D5B";
  }

  if (value >= 5) {
    return "#D9A441";
  }

  return "#C94B4B";
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

/* =========================================================
   NORMALIZE CHILD
========================================================= */

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

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ChildDetail() {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [messageApi, contextHolder] = message.useMessage();

  /* =======================================================
     RESPONSIVE CSS
  ======================================================= */

  useEffect(() => {
    const styleId = "faith-edu-family-child-detail-v2";

    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");

    style.id = styleId;

    style.textContent = `
      .fe-child-page {
        min-height: 100vh;
   
        color: #173B5E;
        font-family: "Be Vietnam Pro", Inter, "Segoe UI", sans-serif;
      }

      .fe-child-container {
        width: 100%;
        max-width: 1500px;
        margin: 0 auto;
        padding: 20px 28px 40px;
        box-sizing: border-box;
      }

      .fe-child-card {
        border: 1px solid rgba(226,232,240,.85) !important;
        border-radius: 24px !important;
        box-shadow: 0 10px 35px rgba(23,59,94,.055) !important;
      }

      .fe-child-card .ant-card-head {
        border-bottom: 1px solid #EEF2F6 !important;
      }

      .fe-child-card .ant-card-head-title {
        font-weight: 800 !important;
        color: #173B5E !important;
      }

      .fe-child-hero {
        position: relative;
        overflow: hidden;
        border: 0 !important;
        border-radius: 32px !important;
        background:
          radial-gradient(circle at 90% 18%, rgba(255,255,255,.95), transparent 22%),
          radial-gradient(circle at 78% 100%, rgba(217,164,65,.14), transparent 30%),
          linear-gradient(125deg, #FFFFFF 0%, #F1F8FF 52%, #E6F3FF 100%);
        box-shadow: 0 18px 50px rgba(23,59,94,.09) !important;
      }

      .fe-child-hero::before {
        content: "";
        position: absolute;
        width: 220px;
        height: 220px;
        right: -70px;
        top: -85px;
        border-radius: 50%;
        border: 35px solid rgba(217,164,65,.08);
        pointer-events: none;
      }

      .fe-child-hero::after {
        content: "✦";
        position: absolute;
        right: 11%;
        bottom: 18px;
        color: rgba(217,164,65,.25);
        font-size: 46px;
        pointer-events: none;
      }

      .fe-child-hero-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 26px;
      }

      .fe-child-avatar {
        width: 132px;
        height: 132px;
        flex: 0 0 132px;
        border-radius: 42px;
        padding: 5px;
        background: linear-gradient(145deg, #D9A441, #F2D58C);
        box-shadow:
          0 12px 30px rgba(217,164,65,.20),
          0 0 0 8px rgba(255,255,255,.72);
      }

      .fe-child-avatar-inner {
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 37px;
        background: #FFF;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .fe-child-avatar-inner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .fe-child-avatar-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(145deg, #FBF5E7, #F5E3B5);
        color: #173B5E;
        font-size: 34px;
        font-weight: 900;
      }

      .fe-child-hero-main {
        min-width: 0;
        flex: 1;
      }

      .fe-child-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 6px 11px;
        border-radius: 999px;
        background: rgba(255,255,255,.78);
        color: #B78316;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: .02em;
      }

      .fe-child-name {
        margin: 9px 0 3px !important;
        color: #173B5E !important;
        font-size: 34px !important;
        line-height: 1.15 !important;
        font-weight: 900 !important;
        letter-spacing: -.03em;
      }

      .fe-child-saint {
        color: #64748B;
        font-size: 14px;
      }

      .fe-child-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
        margin-top: 17px;
      }

      .fe-child-meta-pill {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 12px;
        border-radius: 12px;
        background: rgba(255,255,255,.72);
        border: 1px solid rgba(255,255,255,.95);
        color: #52657F;
        font-size: 13px;
      }

      .fe-child-meta-pill strong {
        color: #173B5E;
      }

      .fe-child-class-badge {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        margin-top: 15px;
        padding: 10px 14px;
        border-radius: 14px;
        background: #173B5E;
        color: white;
        font-size: 13px;
        font-weight: 700;
        box-shadow: 0 8px 18px rgba(23,59,94,.15);
      }

      .fe-child-class-badge .anticon {
        color: #F0CA6D;
      }

      .fe-child-tabs {
        margin-top: 18px;
        padding: 7px;
        border-radius: 20px;
        background: rgba(255,255,255,.9);
        border: 1px solid #E4EAF1;
        box-shadow: 0 8px 28px rgba(23,59,94,.05);
        overflow-x: auto;
        scrollbar-width: none;
      }

      .fe-child-tabs::-webkit-scrollbar {
        display: none;
      }

      .fe-child-tabs-inner {
        display: flex;
        min-width: max-content;
        gap: 4px;
      }

      .fe-child-tab {
        height: 44px !important;
        border: 0 !important;
        border-radius: 14px !important;
        padding: 0 15px !important;
        background: transparent !important;
        color: #64748B !important;
        font-weight: 700 !important;
        display: inline-flex !important;
        align-items: center;
        gap: 7px;
      }

      .fe-child-tab:hover {
        color: #173B5E !important;
        background: #F2F6FA !important;
      }

      .fe-child-tab-active {
        color: white !important;
        background: #173B5E !important;
        box-shadow: 0 6px 16px rgba(23,59,94,.16);
      }

      .fe-child-content {
        margin-top: 18px;
      }

      .fe-insight-card {
        position: relative;
        height: 100%;
        overflow: hidden;
        border: 0 !important;
        border-radius: 22px !important;
        box-shadow: 0 9px 28px rgba(23,59,94,.055) !important;
      }

      .fe-insight-card::after {
        content: "";
        position: absolute;
        width: 75px;
        height: 75px;
        right: -24px;
        top: -24px;
        border-radius: 50%;
        background: rgba(255,255,255,.48);
      }

      .fe-insight-blue {
        background: linear-gradient(145deg, #EFF7FF, #E2F0FF);
      }

      .fe-insight-green {
        background: linear-gradient(145deg, #EEF9F3, #E1F4EA);
      }

      .fe-insight-gold {
        background: linear-gradient(145deg, #FFF9EA, #FDF0C9);
      }

      .fe-insight-purple {
        background: linear-gradient(145deg, #F5F0FF, #ECE4FF);
      }

      .fe-insight-icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 15px;
        margin-bottom: 15px;
        font-size: 20px;
        background: rgba(255,255,255,.8);
      }

      .fe-insight-label {
        color: #64748B;
        font-size: 12px;
        font-weight: 700;
      }

      .fe-insight-value {
        margin-top: 4px;
        color: #173B5E;
        font-size: 29px;
        font-weight: 900;
        letter-spacing: -.04em;
      }

      .fe-insight-action {
        margin-top: 5px;
        padding: 0 !important;
        color: #52708F !important;
        font-weight: 700;
      }

      .fe-section {
        border-radius: 24px !important;
      }

      .fe-section-title {
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .fe-section-title-icon {
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 11px;
        background: #FBF5E7;
        color: #B78316;
      }

      .fe-info-row {
        display: grid;
        grid-template-columns: 30px 125px minmax(0,1fr);
        align-items: start;
        gap: 10px;
        padding: 13px 0;
        border-bottom: 1px dashed #E9EEF4;
      }

      .fe-info-row:last-child {
        border-bottom: 0;
      }

      .fe-info-icon {
        color: #D9A441;
        padding-top: 2px;
      }

      .fe-info-label {
        color: #7A8799;
        font-size: 13px;
      }

      .fe-info-value {
        color: #26384F;
        font-size: 14px;
        font-weight: 700;
        word-break: break-word;
      }

      .fe-family-card {
        height: 100%;
        padding: 17px;
        border-radius: 19px;
        background: #F8FAFC;
        border: 1px solid #E8EDF3;
        transition: transform .2s ease, box-shadow .2s ease;
      }

      .fe-family-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(23,59,94,.06);
      }

      .fe-family-avatar {
        width: 43px;
        height: 43px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        color: #173B5E;
        border: 1px solid #E4EAF0;
        font-size: 18px;
      }

      .fe-next-class {
        display: flex;
        gap: 16px;
        align-items: center;
        padding: 20px;
        border-radius: 21px;
        background:
          radial-gradient(circle at 100% 0%, rgba(217,164,65,.12), transparent 30%),
          linear-gradient(135deg, #F8FBFF, #FFFFFF);
        border: 1px solid #E2EAF2;
      }

      .fe-next-class-icon {
        width: 58px;
        height: 58px;
        flex: 0 0 58px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 18px;
        background: #173B5E;
        color: #F4CF75;
        font-size: 23px;
      }

      .fe-sacrament {
        position: relative;
        padding: 18px 18px 18px 52px;
        border-radius: 18px;
        background: #FFFDF8;
        border: 1px solid #F0E4C4;
      }

      .fe-sacrament-dot {
        position: absolute;
        left: 18px;
        top: 20px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #D9A441;
        color: white;
        font-size: 10px;
      }

      .fe-filter-card {
        border-radius: 20px !important;
        background: rgba(255,255,255,.88);
      }

      .fe-rate-card {
        border-radius: 24px !important;
        background: linear-gradient(135deg, #173B5E, #24567F);
        color: white;
        overflow: hidden;
        position: relative;
      }

      .fe-rate-card::after {
        content: "";
        position: absolute;
        width: 220px;
        height: 220px;
        right: -80px;
        top: -110px;
        border-radius: 50%;
        border: 40px solid rgba(217,164,65,.13);
      }

      .fe-rate-number {
        font-size: 42px;
        line-height: 1;
        font-weight: 900;
        color: #FFFFFF;
      }

      .fe-rate-label {
        color: rgba(255,255,255,.68);
        font-size: 12px;
        font-weight: 700;
      }

      .fe-attendance-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid #F0F3F6;
      }

      .fe-attendance-item:last-child {
        border-bottom: 0;
      }

      .fe-date-box {
        width: 76px;
        flex: 0 0 76px;
        padding: 9px 5px;
        text-align: center;
        border-radius: 14px;
        background: #F7F9FC;
      }

      .fe-date-box strong {
        display: block;
        color: #173B5E;
        font-size: 13px;
      }

      .fe-date-box span {
        color: #8A97A8;
        font-size: 10px;
      }

      .fe-result-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 17px 0;
        border-bottom: 1px solid #F0F3F6;
      }

      .fe-result-item:last-child {
        border-bottom: 0;
      }

      .fe-score {
        width: 65px;
        height: 65px;
        flex: 0 0 65px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        background: #F8FAFC;
        border: 1px solid #E6ECF2;
      }

      .fe-score strong {
        font-size: 20px;
        font-weight: 900;
      }

      .fe-score span {
        color: #94A0B0;
        font-size: 10px;
      }

      .fe-schedule-item {
        display: grid;
        grid-template-columns: 100px 16px minmax(0,1fr);
        gap: 16px;
        padding: 18px 0;
        border-bottom: 1px solid #EEF2F6;
      }

      .fe-schedule-item:last-child {
        border-bottom: 0;
      }

      .fe-schedule-day {
        text-align: right;
        color: #173B5E;
        font-weight: 800;
        font-size: 13px;
      }

      .fe-schedule-line {
        width: 3px;
        border-radius: 10px;
        background: linear-gradient(#D9A441, #EED38E);
      }

      .fe-certificate {
        height: 100%;
        padding: 20px;
        border-radius: 22px;
        background: linear-gradient(145deg, #FFFFFF, #FBF8F0);
        border: 1px solid #EDE3C8;
      }

      .fe-certificate-icon {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 18px;
        background: #FBF1D7;
        color: #B78316;
        font-size: 25px;
      }

      .fe-empty-card {
        margin-top: 18px;
        border-radius: 24px !important;
      }

      .fe-mobile-only {
        display: none;
      }

      @media (max-width: 900px) {
        .fe-child-container {
          padding: 15px 17px 30px;
        }

        .fe-child-name {
          font-size: 29px !important;
        }
      }

      @media (max-width: 700px) {
        .fe-child-container {
          padding: 12px 11px 25px;
        }

        .fe-child-hero-content {
          align-items: flex-start;
          flex-direction: column;
        }

        .fe-child-avatar {
          width: 100px;
          height: 100px;
          flex-basis: 100px;
          border-radius: 32px;
        }

        .fe-child-avatar-inner {
          border-radius: 27px;
        }

        .fe-child-name {
          font-size: 26px !important;
        }

        .fe-child-meta {
          gap: 7px;
        }

        .fe-child-meta-pill {
          padding: 7px 9px;
          font-size: 12px;
        }

        .fe-child-class-badge {
          width: 100%;
          box-sizing: border-box;
        }

        .fe-info-row {
          grid-template-columns: 26px 100px minmax(0,1fr);
        }

        .fe-next-class {
          align-items: flex-start;
        }

        .fe-schedule-item {
          grid-template-columns: 75px 10px minmax(0,1fr);
          gap: 10px;
        }
      }

      @media (max-width: 480px) {
        .fe-child-card {
          border-radius: 19px !important;
        }

        .fe-child-hero {
          border-radius: 24px !important;
        }

        .fe-child-name {
          font-size: 23px !important;
        }

        .fe-child-tabs {
          border-radius: 17px;
        }

        .fe-child-tab {
          height: 40px !important;
          padding: 0 11px !important;
          font-size: 12px !important;
        }

        .fe-info-row {
          grid-template-columns: 25px minmax(0,1fr);
        }

        .fe-info-label {
          display: none;
        }

        .fe-info-value {
          font-size: 13px;
        }

        .fe-attendance-item {
          align-items: flex-start;
        }

        .fe-date-box {
          width: 64px;
          flex-basis: 64px;
        }

        .fe-result-item {
          align-items: flex-start;
        }

        .fe-score {
          width: 58px;
          height: 58px;
          flex-basis: 58px;
        }

        .fe-rate-number {
          font-size: 35px;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, []);

  /* =======================================================
     STATE
  ======================================================= */

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

  const [attendanceMonth, setAttendanceMonth] = useState("");

  const [attendanceType, setAttendanceType] = useState("all");

  const [resultExamType, setResultExamType] = useState("all");

  const [scheduleType, setScheduleType] = useState("all");

  /* =======================================================
     LOAD CHILD
  ======================================================= */

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

  /* =======================================================
     LOAD ATTENDANCE
  ======================================================= */

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
      });
    } finally {
      setLoadingAttendance(false);
    }
  }, [studentId, attendanceMonth, attendanceType]);

  /* =======================================================
     LOAD RESULTS
  ======================================================= */

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

  /* =======================================================
     LOAD SCHEDULE
  ======================================================= */

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

  /* =======================================================
     LOAD CERTIFICATES
  ======================================================= */

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

  /* =======================================================
     INITIAL
  ======================================================= */

  useEffect(() => {
    loadChild();
  }, [loadChild]);

  /* =======================================================
     TAB DATA
  ======================================================= */

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

  /* =======================================================
     DERIVED
  ======================================================= */

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

  const latestScore = useMemo(() => {
    const result = child?.latestResult;

    if (!result) return null;

    return result.score ?? result.result ?? result.point ?? null;
  }, [child]);

  const nextClass = useMemo(() => {
    if (!currentClass) return null;

    const schedule = currentClass?.schedules?.[0];

    if (!schedule) return null;

    return {
      day: schedule.day_of_week ?? schedule.dayOfWeek,

      start: schedule.start_time ?? schedule.startTime,

      end: schedule.end_time ?? schedule.endTime,

      room: schedule.room,

      name: currentClass.name || child?.className || "Lớp Giáo lý",
    };
  }, [currentClass, child]);

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

  const resultSummary = useMemo(() => {
    return resultsData?.summary || resultsData?.data?.summary || {};
  }, [resultsData]);

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

  /* =======================================================
     LOADING
  ======================================================= */

  if (loadingChild) {
    return (
      <div className="fe-child-page">
        {contextHolder}

        <div className="fe-child-container">
          <Card className="fe-child-card">
            <Skeleton active avatar={{ size: 110 }} paragraph={{ rows: 7 }} />
          </Card>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !child) {
    return (
      <div className="fe-child-page">
        {contextHolder}

        <div className="fe-child-container">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{
              marginBottom: 15,
              color: "#173B5E",
              fontWeight: 700,
            }}
          >
            Quay lại
          </Button>

          <Alert
            type="error"
            showIcon
            message="Không thể tải thông tin học sinh"
            description={error || "Không tìm thấy thông tin học sinh"}
          />
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="fe-child-page">
      {contextHolder}

      <div className="fe-child-container">
        {/* BACK */}

        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{
            marginBottom: 14,
            paddingLeft: 2,
            color: "#52657F",
            fontWeight: 700,
          }}
        >
          Danh sách các con
        </Button>

        {/* =================================================
            HERO
        ================================================= */}

        <Card
          bordered={false}
          className="fe-child-hero"
          bodyStyle={{
            padding: 30,
          }}
        >
          <div className="fe-child-hero-content">
            <div className="fe-child-avatar">
              <div className="fe-child-avatar-inner">
                <img
                  src={getAvatarUrl(child.avatar)}
                  alt={`Ảnh đại diện ${child.name || "học sinh"}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = heroFamily;
                  }}
                />
              </div>
            </div>

            <div className="fe-child-hero-main">
              <div className="fe-child-eyebrow">
                <StarFilled />
                HỒ SƠ CỦA CON
              </div>

              <Title className="fe-child-name">
                {child.saint_name ? `† ${child.saint_name} ` : ""}
                {child.name}
              </Title>

              <Text className="fe-child-saint">
                Hành trình học Giáo lý & sống Đức tin
              </Text>

              <div className="fe-child-meta">
                <div className="fe-child-meta-pill">
                  <IdcardOutlined />
                  Mã HS <strong>{child.code || "--"}</strong>
                </div>

                <div className="fe-child-meta-pill">
                  {String(child.gender || "").toLowerCase() === "female" ? (
                    <WomanOutlined />
                  ) : (
                    <ManOutlined />
                  )}

                  {getGenderText(child.gender)}
                </div>

                <div className="fe-child-meta-pill">
                  <CalendarOutlined />
                  {formatDate(child.date_of_birth)}
                </div>

                <div className="fe-child-meta-pill">
                  <CheckCircleFilled
                    style={{
                      color: "#2E7D5B",
                    }}
                  />
                  <strong>
                    {child.status === "studying"
                      ? "Đang học"
                      : child.status || "Đang học"}
                  </strong>
                </div>
              </div>

              <div className="fe-child-class-badge">
                <TeamOutlined />

                <span>{child.className || "Chưa xếp lớp"}</span>

                {child.classCode && (
                  <span
                    style={{
                      opacity: 0.7,
                    }}
                  >
                    • {child.classCode}
                  </span>
                )}

                {child.room && (
                  <>
                    <span
                      style={{
                        opacity: 0.5,
                      }}
                    >
                      •
                    </span>

                    <EnvironmentOutlined />

                    <span>{child.room}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="fe-child-tabs">
          <div className="fe-child-tabs-inner">
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
                label: "Chứng nhận",
                icon: <SafetyCertificateOutlined />,
              },
              {
                key: "notifications",
                label: "Thông báo",
                icon: <BellOutlined />,
              },
            ].map((tab) => (
              <Button
                key={tab.key}
                className={`fe-child-tab ${
                  activeTab === tab.key ? "fe-child-tab-active" : ""
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

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
            LESSONS
        ================================================= */}

        {activeTab === "lessons" && (
          <EmptyFeature
            icon={<BookOutlined />}
            title="Bài học của con"
            description="Kho bài học Giáo lý sẽ được bổ sung trong phiên bản tiếp theo."
          />
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
            NOTIFICATIONS
        ================================================= */}

        {activeTab === "notifications" && (
          <EmptyFeature
            icon={<BellOutlined />}
            title="Thông báo của con"
            description="Các thông báo liên quan đến việc học và sinh hoạt của con sẽ hiển thị tại đây."
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

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
    <div className="fe-child-content">
      {/* =================================================
          INSIGHTS
      ================================================= */}

      <Row gutter={[14, 14]}>
        <Col xs={12} sm={12} lg={6}>
          <Card
            bordered={false}
            className="fe-insight-card fe-insight-blue"
            bodyStyle={{
              padding: 19,
            }}
          >
            <div
              className="fe-insight-icon"
              style={{
                color: "#1769E8",
              }}
            >
              <CheckCircleFilled />
            </div>

            <div className="fe-insight-label">CHUYÊN CẦN</div>

            <div className="fe-insight-value">{attendance.rate}%</div>

            <Button
              type="link"
              className="fe-insight-action"
              onClick={onOpenAttendance}
            >
              Xem điểm danh →
            </Button>
          </Card>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Card
            bordered={false}
            className="fe-insight-card fe-insight-green"
            bodyStyle={{
              padding: 19,
            }}
          >
            <div
              className="fe-insight-icon"
              style={{
                color: "#2E7D5B",
              }}
            >
              <TeamOutlined />
            </div>

            <div className="fe-insight-label">THAM GIA</div>

            <div className="fe-insight-value">{attendance.present}</div>

            <Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              buổi có mặt
            </Text>
          </Card>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Card
            bordered={false}
            className="fe-insight-card fe-insight-gold"
            bodyStyle={{
              padding: 19,
            }}
          >
            <div
              className="fe-insight-icon"
              style={{
                color: "#B78316",
              }}
            >
              <TrophyFilled />
            </div>

            <div className="fe-insight-label">KẾT QUẢ GẦN NHẤT</div>

            <div className="fe-insight-value">
              {latestScore === null || latestScore === undefined
                ? "--"
                : Number(latestScore).toFixed(1)}
            </div>

            <Button
              type="link"
              className="fe-insight-action"
              onClick={onOpenResults}
            >
              Xem kết quả →
            </Button>
          </Card>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Card
            bordered={false}
            className="fe-insight-card fe-insight-purple"
            bodyStyle={{
              padding: 19,
            }}
          >
            <div
              className="fe-insight-icon"
              style={{
                color: "#7654B7",
              }}
            >
              <SafetyCertificateOutlined />
            </div>

            <div className="fe-insight-label">CHỨNG NHẬN</div>

            <div className="fe-insight-value">{certificateCount || 0}</div>

            <Button
              type="link"
              className="fe-insight-action"
              onClick={onOpenCertificates}
            >
              Xem chứng nhận →
            </Button>
          </Card>
        </Col>
      </Row>

      {/* =================================================
          NEXT CLASS + PERSONAL
      ================================================= */}

      <Row
        gutter={[16, 16]}
        style={{
          marginTop: 16,
        }}
      >
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            className="fe-child-card fe-section"
            title={
              <SectionTitle
                icon={<ScheduleOutlined />}
                title="Điều đang chờ con"
              />
            }
          >
            {nextClass ? (
              <div className="fe-next-class">
                <div className="fe-next-class-icon">
                  <CalendarOutlined />
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    LỊCH HỌC TIẾP THEO
                  </Text>

                  <Title
                    level={4}
                    style={{
                      margin: "5px 0 8px",
                      color: "#173B5E",
                    }}
                  >
                    {nextClass.name}
                  </Title>

                  <Space wrap size={[14, 8]}>
                    <Text>
                      <CalendarOutlined /> {getDayName(nextClass.day)}
                    </Text>

                    <Text>
                      <ClockCircleOutlined /> {formatTime(nextClass.start)} -{" "}
                      {formatTime(nextClass.end)}
                    </Text>

                    <Text>
                      <EnvironmentOutlined />{" "}
                      {nextClass.room || "Chưa cập nhật"}
                    </Text>
                  </Space>
                </div>
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có lịch học"
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            className="fe-child-card fe-section"
            title={
              <SectionTitle icon={<UserOutlined />} title="Một chút về con" />
            }
          >
            <InfoRow
              icon={<CalendarOutlined />}
              label="Ngày sinh"
              value={formatDate(child.date_of_birth)}
            />

            <InfoRow
              icon={<IdcardOutlined />}
              label="Mã học sinh"
              value={child.code || "--"}
            />

            <InfoRow
              icon={<HomeOutlined />}
              label="Giáo xứ"
              value={child.parish || "Chưa cập nhật"}
            />

            <InfoRow
              icon={<PhoneOutlined />}
              label="Điện thoại"
              value={child.phone || "Chưa cập nhật"}
            />
          </Card>
        </Col>
      </Row>

      {/* =================================================
          CLASS + FAMILY
      ================================================= */}

      <Row
        gutter={[16, 16]}
        style={{
          marginTop: 16,
        }}
      >
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            className="fe-child-card fe-section"
            title={<SectionTitle icon={<TeamOutlined />} title="Lớp Giáo lý" />}
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

        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            className="fe-child-card fe-section"
            title={<SectionTitle icon={<TeamOutlined />} title="Gia đình" />}
          >
            <Row gutter={[10, 10]}>
              <Col xs={24} sm={12}>
                <FamilyCard
                  title="Cha"
                  icon={<ManOutlined />}
                  name={child.family?.father?.name}
                  phone={child.family?.father?.phone}
                />
              </Col>

              <Col xs={24} sm={12}>
                <FamilyCard
                  title="Mẹ"
                  icon={<WomanOutlined />}
                  name={child.family?.mother?.name}
                  phone={child.family?.mother?.phone}
                />
              </Col>

              <Col xs={24}>
                <FamilyCard
                  title="Người đỡ đầu"
                  icon={<UserOutlined />}
                  name={child.family?.guardian?.name}
                  phone={child.family?.guardian?.phone}
                  relationship={child.family?.guardian?.relationship}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* =================================================
          SACRAMENTS
      ================================================= */}

      <Card
        bordered={false}
        className="fe-child-card fe-section"
        title={
          <SectionTitle
            icon={<SafetyCertificateOutlined />}
            title="Hành trình Bí tích"
          />
        }
        style={{
          marginTop: 16,
        }}
      >
        {Array.isArray(child.sacraments) && child.sacraments.length > 0 ? (
          <Row gutter={[12, 12]}>
            {child.sacraments.map((sacrament, index) => (
              <Col xs={24} md={12} key={sacrament.id || index}>
                <div className="fe-sacrament">
                  <div className="fe-sacrament-dot">
                    <CheckCircleFilled />
                  </div>

                  <Text
                    strong
                    style={{
                      color: "#173B5E",
                    }}
                  >
                    {sacrament.name || sacrament.type || "Bí tích"}
                  </Text>

                  {sacrament.date_received && (
                    <Text
                      type="secondary"
                      style={{
                        display: "block",
                        marginTop: 6,
                      }}
                    >
                      Ngày lãnh nhận: {formatDate(sacrament.date_received)}
                    </Text>
                  )}

                  {sacrament.saint_name && (
                    <Text
                      type="secondary"
                      style={{
                        display: "block",
                        marginTop: 4,
                      }}
                    >
                      Tên thánh: {sacrament.saint_name}
                    </Text>
                  )}

                  {sacrament.church_name_custom && (
                    <Text
                      type="secondary"
                      style={{
                        display: "block",
                        marginTop: 4,
                      }}
                    >
                      Nơi lãnh nhận: {sacrament.church_name_custom}
                    </Text>
                  )}
                </div>
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

/* =========================================================
   ATTENDANCE
========================================================= */

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
    <div className="fe-child-content">
      <Card bordered={false} className="fe-child-card fe-filter-card">
        <Space wrap size={[12, 12]}>
          <div>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              THÁNG
            </Text>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{
                height: 34,
                border: "1px solid #DCE4EC",
                borderRadius: 9,
                padding: "0 10px",
                color: "#173B5E",
              }}
            />
          </div>

          <div>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              LOẠI ĐIỂM DANH
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

          <AppButton
            size="small"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={onReload}
            style={{
              marginTop: 22,
            }}
          >
            Tải lại
          </AppButton>
        </Space>
      </Card>

      <Row
        gutter={[12, 12]}
        style={{
          marginTop: 14,
        }}
      >
        {[
          ["Tổng buổi", total, "#173B5E", <CalendarOutlined />],
          ["Có mặt", present, "#2E7D5B", <CheckCircleFilled />],
          ["Đi muộn", late, "#B78316", <ClockCircleOutlined />],
          ["Vắng", absent, "#C94B4B", <FireFilled />],
          ["Có phép", excused, "#3878B9", <SafetyCertificateOutlined />],
        ].map(([title, value, color, icon]) => (
          <Col xs={12} sm={12} md={8} lg={4} key={title}>
            <Card
              bordered={false}
              className="fe-insight-card"
              style={{
                background: "#FFFFFF",
              }}
              bodyStyle={{
                padding: 17,
              }}
            >
              <div
                style={{
                  color,
                  fontSize: 20,
                  marginBottom: 9,
                }}
              >
                {icon}
              </div>

              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                {title}
              </Text>

              <div
                style={{
                  color,
                  fontSize: 26,
                  fontWeight: 900,
                  marginTop: 2,
                }}
              >
                {value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        bordered={false}
        className="fe-rate-card"
        style={{
          marginTop: 14,
        }}
        bodyStyle={{
          padding: 24,
        }}
      >
        <Row align="middle" gutter={[25, 20]}>
          <Col xs={24} sm={8}>
            <div className="fe-rate-label">TỶ LỆ CHUYÊN CẦN</div>

            <div
              className="fe-rate-number"
              style={{
                marginTop: 7,
              }}
            >
              {Math.round(rate)}%
            </div>
          </Col>

          <Col xs={24} sm={16}>
            <Progress
              percent={Math.min(Math.max(rate, 0), 100)}
              showInfo={false}
              strokeWidth={12}
              trailColor="rgba(255,255,255,.15)"
              strokeColor="#D9A441"
            />

            <div
              style={{
                marginTop: 9,
                color: "rgba(255,255,255,.7)",
                fontSize: 12,
              }}
            >
              Có mặt {present} buổi · Đi muộn {late} buổi · Vắng {absent} buổi
            </div>
          </Col>
        </Row>
      </Card>

      <Card
        bordered={false}
        className="fe-child-card fe-section"
        title={
          <SectionTitle
            icon={<CheckCircleOutlined />}
            title="Nhật ký điểm danh"
          />
        }
        style={{
          marginTop: 14,
        }}
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 7 }} />
        ) : records.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có dữ liệu điểm danh"
          />
        ) : (
          <div>
            {records.map((item, index) => {
              const status = item.status || item.attendance_status;

              const date = item.attendance_date || item.date;

              const className =
                item.class_name || item.className || "Lớp Giáo lý";

              const attendanceType = item.attendance_type || item.type;

              return (
                <div
                  key={item.id || `${date}-${index}`}
                  className="fe-attendance-item"
                >
                  <div className="fe-date-box">
                    <strong>{formatDate(date)}</strong>

                    <span>{getAttendanceTypeText(attendanceType)}</span>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Text strong>{className}</Text>

                    {item.room && (
                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          fontSize: 12,
                          marginTop: 4,
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

/* =========================================================
   RESULTS
========================================================= */

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
    <div className="fe-child-content">
      <Card bordered={false} className="fe-child-card fe-filter-card">
        <Space wrap size={[12, 12]}>
          <div>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              HÌNH THỨC KIỂM TRA
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

          <AppButton
            size="small"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={onReload}
            style={{
              marginTop: 22,
            }}
          >
            Tải lại
          </AppButton>
        </Space>
      </Card>

      <Row
        gutter={[14, 14]}
        style={{
          marginTop: 14,
        }}
      >
        <Col xs={24} sm={8}>
          <ScoreSummary
            title="Điểm trung bình"
            value={average}
            icon={<RiseOutlined />}
          />
        </Col>

        <Col xs={24} sm={8}>
          <ScoreSummary
            title="Điểm cao nhất"
            value={highest}
            icon={<TrophyFilled />}
            accent="#2E7D5B"
          />
        </Col>

        <Col xs={24} sm={8}>
          <ScoreSummary
            title="Điểm gần nhất"
            value={latest}
            icon={<StarFilled />}
            accent={getScoreColor(latest)}
          />
        </Col>
      </Row>

      <Card
        bordered={false}
        className="fe-child-card fe-section"
        title={
          <SectionTitle icon={<RiseOutlined />} title="Hành trình học tập" />
        }
        style={{
          marginTop: 14,
        }}
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 7 }} />
        ) : records.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có kết quả học tập"
          />
        ) : (
          <div>
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
                <div key={item.id || index} className="fe-result-item">
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Text strong>{title}</Text>

                    <div
                      style={{
                        marginTop: 7,
                      }}
                    >
                      <Space wrap size={8}>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                          }}
                        >
                          {formatDate(
                            item.exam_date || item.examDate || item.date,
                          )}
                        </Text>

                        <Tag>{getExamTypeText(examTypeValue)}</Tag>
                      </Space>
                    </div>
                  </div>

                  <div className="fe-score">
                    <strong
                      style={{
                        color: getScoreColor(score),
                      }}
                    >
                      {score === null || score === undefined
                        ? "--"
                        : Number(score).toFixed(1)}
                    </strong>

                    <span>/ 10</span>
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
              marginTop: 15,
            }}
          >
            Điểm thấp nhất: {Number(lowest).toFixed(2)}
          </Text>
        )}
      </Card>
    </div>
  );
}

/* =========================================================
   SCORE SUMMARY
========================================================= */

function ScoreSummary({ title, value, icon, accent = "#173B5E" }) {
  return (
    <Card
      bordered={false}
      className="fe-insight-card"
      style={{
        background: "linear-gradient(145deg,#FFFFFF,#F8FAFC)",
      }}
      bodyStyle={{
        padding: 20,
      }}
    >
      <div
        style={{
          color: accent,
          fontSize: 21,
          marginBottom: 10,
        }}
      >
        {icon}
      </div>

      <Text
        type="secondary"
        style={{
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {title}
      </Text>

      <div
        style={{
          marginTop: 3,
          color: accent,
          fontSize: 31,
          fontWeight: 900,
        }}
      >
        {Number(value) || 0}
        <span
          style={{
            fontSize: 13,
            marginLeft: 3,
            color: "#94A0B0",
          }}
        >
          /10
        </span>
      </div>
    </Card>
  );
}

/* =========================================================
   SCHEDULE
========================================================= */

function ScheduleTab({ loading, type, setType, records, onReload }) {
  return (
    <div className="fe-child-content">
      <Card bordered={false} className="fe-child-card fe-filter-card">
        <Space wrap size={[12, 12]}>
          <div>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              LOẠI LỊCH
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

          <AppButton
            size="small"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={onReload}
            style={{
              marginTop: 22,
            }}
          >
            Tải lại
          </AppButton>
        </Space>
      </Card>

      <Card
        bordered={false}
        className="fe-child-card fe-section"
        title={
          <SectionTitle
            icon={<ScheduleOutlined />}
            title="Nhịp học trong tuần"
          />
        }
        style={{
          marginTop: 14,
        }}
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : records.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có lịch học"
          />
        ) : (
          <div>
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
                <div key={item.id || index} className="fe-schedule-item">
                  <div className="fe-schedule-day">
                    {getDayName(day)}

                    <div
                      style={{
                        marginTop: 5,
                        color: "#8B98A9",
                        fontWeight: 500,
                        fontSize: 11,
                      }}
                    >
                      {formatTime(start)}
                    </div>
                  </div>

                  <div className="fe-schedule-line" />

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <Text strong>{className}</Text>

                      <Tag>{getAttendanceTypeText(scheduleType)}</Tag>
                    </div>

                    <Space
                      wrap
                      size={[13, 7]}
                      style={{
                        marginTop: 9,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                        }}
                      >
                        <ClockCircleOutlined /> {formatTime(start)} -{" "}
                        {formatTime(end)}
                      </Text>

                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                        }}
                      >
                        <EnvironmentOutlined /> {room || "Chưa cập nhật"}
                      </Text>
                    </Space>

                    {(item.catechist_name || item.catechistName) && (
                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          marginTop: 7,
                          fontSize: 12,
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

/* =========================================================
   CERTIFICATES
========================================================= */

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
    <div className="fe-child-content">
      <Card
        bordered={false}
        className="fe-child-card fe-section"
        title={
          <SectionTitle
            icon={<SafetyCertificateOutlined />}
            title="Những dấu mốc của con"
          />
        }
        extra={
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={onReload}
            loading={loading}
          />
        }
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : records.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có chứng nhận"
          />
        ) : (
          <Row gutter={[15, 15]}>
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
                  <div className="fe-certificate">
                    <div className="fe-certificate-icon">
                      <SafetyCertificateOutlined />
                    </div>

                    <Title
                      level={5}
                      style={{
                        margin: "15px 0 8px",
                        color: "#173B5E",
                      }}
                    >
                      {title}
                    </Title>

                    {type && <Tag>{type}</Tag>}

                    <div
                      style={{
                        marginTop: 15,
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
                        marginTop: 15,
                        borderRadius: 11,
                        height: 40,
                      }}
                    >
                      {fileUrl ? "Mở chứng nhận" : "Chưa có file"}
                    </Button>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>
    </div>
  );
}

/* =========================================================
   EMPTY FEATURE
========================================================= */

function EmptyFeature({ icon, title, description }) {
  return (
    <Card
      bordered={false}
      className="fe-child-card fe-empty-card"
      bodyStyle={{
        padding: "65px 25px",
      }}
    >
      <div
        style={{
          width: 74,
          height: 74,
          margin: "0 auto 18px",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBF5E7",
          color: "#B78316",
          fontSize: 29,
        }}
      >
        {icon}
      </div>

      <Title
        level={4}
        style={{
          textAlign: "center",
          marginBottom: 7,
          color: "#173B5E",
        }}
      >
        {title}
      </Title>

      <Text
        type="secondary"
        style={{
          display: "block",
          maxWidth: 500,
          margin: "0 auto",
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        {description}
      </Text>
    </Card>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({ icon, title }) {
  return (
    <div className="fe-section-title">
      <span className="fe-section-title-icon">{icon}</span>

      <span>{title}</span>
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({ icon, label, value }) {
  return (
    <div className="fe-info-row">
      <div className="fe-info-icon">{icon}</div>

      <div className="fe-info-label">{label}</div>

      <div className="fe-info-value">{value || "Chưa cập nhật"}</div>
    </div>
  );
}

/* =========================================================
   FAMILY CARD
========================================================= */

function FamilyCard({ title, icon, name, phone, relationship }) {
  return (
    <div className="fe-family-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}
      >
        <div className="fe-family-avatar">{icon}</div>

        <div
          style={{
            minWidth: 0,
          }}
        >
          <Text
            type="secondary"
            style={{
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {title}
          </Text>

          <div>
            <Text
              strong
              style={{
                color: "#173B5E",
              }}
            >
              {name || "Chưa cập nhật"}
            </Text>
          </div>
        </div>
      </div>

      {relationship && (
        <Text
          type="secondary"
          style={{
            display: "block",
            marginTop: 10,
            fontSize: 12,
          }}
        >
          Quan hệ: {relationship}
        </Text>
      )}

      <Text
        type="secondary"
        style={{
          display: "block",
          marginTop: 10,
          fontSize: 12,
        }}
      >
        <PhoneOutlined /> {phone || "Chưa cập nhật"}
      </Text>
    </div>
  );
}
