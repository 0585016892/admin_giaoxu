import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Card,
  Empty,
  Input,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Tooltip,
  Button,
} from "antd";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
  FilterOutlined,
  IdcardOutlined,
  PauseCircleFilled,
  ReadOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import classApi from "../../api/classApi";
import { useUser } from "../../context/UserContext";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";
import ErrorPage from "./ErrorPage";

const { Title, Text } = Typography;

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyDark: "#102A43",
  navyLight: "#F0F5FA",
  border: "#E4EAF1",
  gold: "#D9A441",
  goldLight: "#FFF8E8",
  green: "#15966A",
  greenLight: "#EAF8F1",
  amber: "#D99013",
  amberLight: "#FFF5DF",
  slate: "#64748B",
  slateLight: "#F1F5F9",
  text: "#182B43",
  muted: "#718096",
  white: "#FFFFFF",
};

const STATUS = {
  active: {
    label: "Đang học",
    color: COLORS.green,
    bg: COLORS.greenLight,
    icon: <CheckCircleFilled />,
  },
  paused: {
    label: "Tạm dừng",
    color: COLORS.amber,
    bg: COLORS.amberLight,
    icon: <PauseCircleFilled />,
  },
  completed: {
    label: "Đã hoàn thành",
    color: COLORS.slate,
    bg: COLORS.slateLight,
    icon: <CheckCircleFilled />,
  },
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeListResponse = (response) => {
  const data = response?.data;

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;

  return [];
};

const formatTime = (time) => (time ? String(time).slice(0, 5) : "—");

const formatDate = (date) =>
  date && dayjs(date).isValid()
    ? dayjs(date).format("DD/MM/YYYY")
    : "Chưa cập nhật";

const getDayName = (day) => {
  const days = {
    0: "Chúa Nhật",
    1: "Thứ Hai",
    2: "Thứ Ba",
    3: "Thứ Tư",
    4: "Thứ Năm",
    5: "Thứ Sáu",
    6: "Thứ Bảy",
    7: "Chúa Nhật",
    sunday: "Chúa Nhật",
    monday: "Thứ Hai",
    tuesday: "Thứ Ba",
    wednesday: "Thứ Tư",
    thursday: "Thứ Năm",
    friday: "Thứ Sáu",
    saturday: "Thứ Bảy",
  };

  if (day === null || day === undefined || day === "") {
    return "Chưa xếp lịch";
  }

  return days[String(day).toLowerCase()] ?? String(day);
};

const getStatusConfig = (status) => {
  const key = String(status || "active").toLowerCase();
  return STATUS[key] || STATUS.active;
};

const getInitials = (name) => {
  if (!name?.trim()) return "GL";

  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

/* =========================================================
   DETAIL ITEM
========================================================= */

const DetailItem = ({ icon, label, value, accent }) => (
  <div className="tc-detail-item">
    <div className="tc-detail-icon" style={{ color: accent || COLORS.navy }}>
      {icon}
    </div>

    <div className="tc-detail-content">
      <Text className="tc-detail-label">{label}</Text>
      <Text className="tc-detail-value" title={String(value ?? "")}>
        {value || "Chưa cập nhật"}
      </Text>
    </div>
  </div>
);

/* =========================================================
   CLASS CARD
========================================================= */
const getClassSchedule = (classData) => {
  const schedules = Array.isArray(classData?.schedules)
    ? classData.schedules
    : [];

  return schedules[0] || null;
};

const ClassCard = ({ classData }) => {
  const status = getStatusConfig(classData?.status);
  const schedule = getClassSchedule(classData);

  const role = classData?.catechist_role || "Giáo lý viên";

  const isMainRole =
    role.toLowerCase().includes("chủ nhiệm") ||
    role.toLowerCase().includes("trưởng");

  const studentCount = Number(classData?.studentsCount || 0);

  const hasSchedule = Boolean(schedule);

  return (
    <Card className="tc-class-card" bordered={false}>
      {/* HEADER */}
      <div className="tc-card-header">
        <div className="tc-class-identity">
          <div className="tc-class-icon">
            <ReadOutlined />
          </div>

          <div className="tc-class-heading">
            <Space size={6} wrap className="tc-tags">
              <span className="tc-code">
                MÃ LỚP: {classData?.code || "N/A"}
              </span>

              {classData?.academic_year && (
                <span className="tc-category">{classData.academic_year}</span>
              )}
            </Space>

            <Title level={4} className="tc-class-name">
              {classData?.name || "Lớp học chưa đặt tên"}
            </Title>

            <Text className="tc-class-category">
              {classData?.category || "Chưa phân loại"}
            </Text>
          </div>
        </div>

        <Tag
          bordered={false}
          className="tc-status"
          style={{
            color: status.color,
            background: status.bg,
          }}
        >
          {status.icon}
          {status.label}
        </Tag>
      </div>

      {/* NĂM HỌC */}
      <div className="tc-academic-year">
        <CalendarOutlined />
        <span>Năm học</span>
        <strong>{classData?.academic_year || "Chưa cập nhật"}</strong>
      </div>

      {/* LỊCH HỌC TỪ schedules[0] */}
      <div className="tc-schedule">
        <div className="tc-schedule-main">
          <div className="tc-schedule-icon">
            <CalendarOutlined />
          </div>

          <div>
            <Text className="tc-eyebrow">LỊCH SINH HOẠT</Text>

            <div className="tc-schedule-day">
              {hasSchedule ? getDayName(schedule.day_of_week) : "Chưa xếp lịch"}
            </div>
          </div>
        </div>

        <div className="tc-time-pill">
          <ClockCircleOutlined />

          <span>
            {hasSchedule
              ? `${formatTime(schedule.start_time)} – ${formatTime(
                  schedule.end_time,
                )}`
              : "Chưa có giờ học"}
          </span>
        </div>
      </div>

      {/* THÔNG TIN LỚP */}
      <div className="tc-details-grid">
        <DetailItem
          icon={<EnvironmentOutlined />}
          label="Phòng học"
          value={schedule?.room || classData?.room || "Chưa xếp phòng"}
        />

        <DetailItem
          icon={<TeamOutlined />}
          label="Sĩ số học viên"
          value={`${studentCount} học viên`}
          accent={COLORS.green}
        />
      </div>

      {/* THỜI GIAN KHÓA HỌC */}
      <div className="tc-duration">
        <div className="tc-duration-heading">
          <FieldTimeOutlined />
          <Text>Thời gian khóa học</Text>
        </div>

        <div className="tc-duration-dates">
          <span>{formatDate(classData?.start_date)}</span>
          <ArrowRightOutlined />
          <span>{formatDate(classData?.end_date)}</span>
        </div>
      </div>

      {/* GIÁO LÝ VIÊN */}
      <div className="tc-card-footer">
        <div className="tc-role-avatar">
          <SafetyCertificateOutlined />
        </div>

        <div className="tc-role-info">
          <Text className="tc-role-label">Vai trò được phân công</Text>
          <Text className="tc-role-value">{role}</Text>
        </div>

        {isMainRole && (
          <Tag bordered={false} className="tc-role-badge">
            Phụ trách chính
          </Tag>
        )}
      </div>

      {/* GHI CHÚ */}
      {(classData?.description || classData?.notes) && (
        <div className="tc-description">
          <span className="tc-description-mark">“</span>
          <Text>{classData.description || classData.notes}</Text>
        </div>
      )}
    </Card>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

const TeacherClassesPage = () => {
  const { user } = useUser();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await classApi.getClassTeacher();

      const list = normalizeListResponse(response);

      setClasses(list);
    } catch (err) {
      setClasses([]);
      setError(
        err?.response?.data?.message ||
          "Không thể tải danh sách lớp học phụ trách!",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const filteredClasses = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return classes.filter((item) => {
      const name = String(item?.name || "").toLowerCase();
      const code = String(item?.code || "").toLowerCase();
      const category = String(item?.category || "").toLowerCase();

      const matchSearch =
        !keyword ||
        name.includes(keyword) ||
        code.includes(keyword) ||
        category.includes(keyword);

      const matchStatus =
        statusFilter === "all" ||
        String(item?.status || "active")
          .trim()
          .toLowerCase() === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [classes, searchText, statusFilter]);

  const totalStudents = useMemo(
    () =>
      classes.reduce((sum, item) => sum + Number(item?.studentsCount || 0), 0),
    [classes],
  );

  const statusCounts = useMemo(() => {
    const normalizeStatus = (status) =>
      String(status || "active")
        .trim()
        .toLowerCase();

    return {
      active: classes.filter(
        (item) => normalizeStatus(item?.status) === "active",
      ).length,

      paused: classes.filter(
        (item) => normalizeStatus(item?.status) === "paused",
      ).length,

      completed: classes.filter(
        (item) => normalizeStatus(item?.status) === "completed",
      ).length,
    };
  }, [classes]);
  if (error) {
    return (
      <ErrorPage
        title="Không thể lấy danh sách lớp"
        message={error}
        onRetry={fetchClasses}
      />
    );
  }

  return (
    <div className="teacher-classes-page">
      <style>{`
        .teacher-classes-page {
          --tc-navy: #173B5E;
          --tc-border: #E4EAF1;
          max-width: 1440px;
          margin: 0 auto;
          padding-bottom: 40px;
          color: #182B43;
          font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .teacher-classes-page * {
          box-sizing: border-box;
        }

        /* PROFILE */
        .tc-profile {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px 24px;
          margin-top: 20px;
          border: 1px solid #E5EAF1;
          border-radius: 20px;
          background:
            radial-gradient(circle at 95% 0%, rgba(217,164,65,.13), transparent 30%),
            linear-gradient(120deg, #FFFFFF, #F7FAFD);
        }

        .tc-profile-left {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
          position: relative;
          z-index: 1;
        }

        .tc-profile-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 58px;
          height: 58px;
          border: 3px solid #FFFFFF;
          border-radius: 18px;
          background: linear-gradient(145deg, #173B5E, #285A84);
          box-shadow: 0 5px 15px rgba(23,59,94,.16);
          color: #F4D28B;
          font-size: 19px;
          font-weight: 800;
        }

        .tc-profile-kicker {
          display: block;
          margin-bottom: 4px;
          color: #A77A2D;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .tc-profile-name {
          margin: 0 !important;
          color: #173B5E !important;
          font-size: 18px !important;
          font-weight: 800 !important;
        }

        .tc-profile-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 8px;
        }

        .tc-profile-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border: 1px solid #E3EAF2;
          border-radius: 8px;
          background: #FFFFFF;
          color: #52677F;
          font-size: 11px;
          font-weight: 600;
        }

        .tc-profile-chip strong {
          color: #173B5E;
        }

        .tc-profile-decoration {
          position: absolute;
          right: 20px;
          bottom: -48px;
          color: rgba(23,59,94,.035);
          font-size: 170px;
          pointer-events: none;
        }

        /* SECTION HEADING */
        .tc-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin: 26px 0 14px;
        }

        .tc-section-title {
          margin: 0 !important;
          color: #182B43 !important;
          font-size: 19px !important;
          font-weight: 800 !important;
          letter-spacing: -.3px;
        }

        .tc-section-subtitle {
          display: block;
          margin-top: 4px;
          color: #8290A3;
          font-size: 12px;
        }

        .tc-count-pill {
          padding: 7px 11px;
          border: 1px solid #DCE6F0;
          border-radius: 9px;
          background: #F0F5FA;
          color: #173B5E;
          font-size: 11px;
          font-weight: 800;
        }

        /* TOOLBAR */
        .tc-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          margin-bottom: 16px;
          border: 1px solid #E5EAF1;
          border-radius: 15px;
          background: #FFFFFF;
          box-shadow: 0 3px 12px rgba(23,59,94,.025);
        }

        .tc-search {
          flex: 1;
          min-width: 150px;
        }

        .tc-search .ant-input-affix-wrapper {
          min-height: 42px;
          border-color: #E5EAF1;
          border-radius: 10px;
          background: #F9FBFD;
          box-shadow: none;
        }

        .tc-search .ant-input-affix-wrapper:hover,
        .tc-search .ant-input-affix-wrapper-focused {
          border-color: #9CB4CA;
        }

        .tc-search .ant-input {
          background: transparent;
          font-size: 12px;
        }

        .tc-filter {
          width: 200px;
          flex-shrink: 0;
        }

        .tc-filter .ant-select-selector {
          min-height: 42px !important;
          align-items: center;
          border-color: #E5EAF1 !important;
          border-radius: 10px !important;
          background: #F9FBFD !important;
          box-shadow: none !important;
        }

        .tc-filter .ant-select-selection-item {
          font-size: 12px;
          font-weight: 600;
        }

        .tc-view-switch {
          display: flex;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
          padding: 4px;
          border: 1px solid #E4EAF1;
          border-radius: 10px;
          background: #F5F8FB;
        }

        .tc-view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 32px;
          padding: 0;
          border: none;
          border-radius: 7px;
          background: transparent;
          color: #8190A3;
          font-size: 16px;
          cursor: pointer;
          transition: all .18s ease;
        }

        .tc-view-btn:hover {
          background: #E8EEF5;
          color: #173B5E;
        }

        .tc-view-btn.active {
          background: #173B5E;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(23,59,94,.16);
        }

        .tc-refresh {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 42px;
          padding: 0 12px;
          border: 1px solid #D9E3ED;
          border-radius: 10px;
          background: #FFFFFF;
          color: #173B5E;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all .18s ease;
        }

        .tc-refresh:hover:not(:disabled) {
          border-color: #173B5E;
          background: #F0F5FA;
        }

        .tc-refresh:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        /* GRID AND LIST */
        .tc-class-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .tc-class-grid.list-mode {
          grid-template-columns: minmax(0, 1fr);
          gap: 9px;
        }

        /* CLASS CARD */
        .tc-class-card {
          height: 100%;
          overflow: hidden;
          border: 1px solid #E3EAF2 !important;
          border-radius: 18px !important;
          background: #FFFFFF;
          box-shadow: 0 4px 16px rgba(23,59,94,.035);
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }

        .tc-class-card:hover {
          transform: translateY(-2px);
          border-color: #B8CADD !important;
          box-shadow: 0 10px 25px rgba(23,59,94,.075);
        }

        .tc-class-card .ant-card-body {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 18px;
        }

        .tc-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .tc-class-identity {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          min-width: 0;
        }
.tc-class-category {
  display: block;
  margin-top: 4px;
  color: #718096;
  font-size: 11px;
  line-height: 1.5;
}

.tc-academic-year {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 13px;
  color: #718096;
  font-size: 11px;
}

.tc-academic-year .anticon {
  color: #B58A39;
}

.tc-academic-year strong {
  color: #173B5E;
  font-weight: 800;
}

/* List mode */
.tc-class-grid.list-mode .tc-academic-year {
  grid-column: 1 / -1;
  margin-top: 0;
}
        .tc-class-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border: 1px solid #DCE7F2;
          border-radius: 13px;
          background: linear-gradient(145deg, #F0F5FA, #E5EEF7);
          color: #173B5E;
          font-size: 20px;
        }

        .tc-class-heading {
          min-width: 0;
        }

        .tc-tags {
          margin-bottom: 5px;
        }

        .tc-code,
        .tc-category {
          display: inline-flex;
          align-items: center;
          max-width: 180px;
          overflow: hidden;
          padding: 4px 7px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tc-code {
          border: 1px solid #DFE8F1;
          background: #F3F7FB;
          color: #526B85;
        }

        .tc-category {
          border: 1px solid #F0E0BB;
          background: #FFF8E8;
          color: #956B20;
        }

        .tc-class-name {
          margin: 0 !important;
          color: #182B43 !important;
          font-size: 16px !important;
          font-weight: 800 !important;
          line-height: 1.4 !important;
          overflow-wrap: anywhere;
        }

        .tc-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          margin: 0 !important;
          padding: 5px 8px;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 800;
        }

        /* SCHEDULE */
        .tc-schedule {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 17px;
          padding: 12px;
          border: 1px solid #E4EBF3;
          border-radius: 13px;
          background: linear-gradient(110deg, #F7FAFD, #F1F6FB);
        }

        .tc-schedule-main {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        .tc-schedule-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #FFFFFF;
          box-shadow: 0 2px 7px rgba(23,59,94,.06);
          color: #173B5E;
          font-size: 16px;
        }

        .tc-eyebrow {
          display: block;
          color: #8796A8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .7px;
        }

        .tc-schedule-day {
          margin-top: 3px;
          color: #173B5E;
          font-size: 13px;
          font-weight: 800;
        }

        .tc-time-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 9px;
          border: 1px solid #E6D5B3;
          border-radius: 8px;
          background: #FFFFFF;
          color: #8B692A;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        /* DETAILS */
        .tc-details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
          margin-top: 12px;
        }

        .tc-detail-item {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
          padding: 10px;
          border: 1px solid #E9EEF4;
          border-radius: 11px;
          background: #FFFFFF;
        }

        .tc-detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 31px;
          height: 31px;
          flex-shrink: 0;
          border-radius: 9px;
          background: #F2F6FA;
          font-size: 15px;
        }

        .tc-detail-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 3px;
        }

        .tc-detail-label {
          color: #8A97A8;
          font-size: 10px;
          font-weight: 600;
        }

        .tc-detail-value {
          overflow: hidden;
          color: #253B53;
          font-size: 11px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* DURATION */
        .tc-duration {
          margin-top: 12px;
          padding: 11px 0;
          border-top: 1px dashed #E2E8F0;
          border-bottom: 1px dashed #E2E8F0;
        }

        .tc-duration-heading {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #8290A3;
          font-size: 10px;
          font-weight: 700;
        }

        .tc-duration-heading .anticon {
          color: #B58A39;
        }

        .tc-duration-dates {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 7px;
          color: #334A63;
          font-size: 11px;
          font-weight: 700;
        }

        .tc-duration-dates .anticon {
          color: #A2AFBD;
          font-size: 10px;
        }

        /* ROLE */
        .tc-card-footer {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: auto;
          padding-top: 13px;
        }

        .tc-role-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 33px;
          height: 33px;
          flex-shrink: 0;
          border: 1px solid #F0DFB9;
          border-radius: 10px;
          background: #FFF8E8;
          color: #A57B2E;
          font-size: 15px;
        }

        .tc-role-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 3px;
        }

        .tc-role-label {
          color: #8A97A8;
          font-size: 10px;
        }

        .tc-role-value {
          color: #253B53;
          font-size: 11px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .tc-role-badge {
          margin: 0 0 0 auto !important;
          border: 1px solid #F0DFB9 !important;
          border-radius: 7px;
          background: #FFF8E8;
          color: #956B20;
          font-size: 9px;
          font-weight: 800;
        }

        .tc-description {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          margin-top: 11px;
          padding: 9px 11px;
          border-radius: 9px;
          background: #FAFBFC;
          color: #718096;
          font-size: 11px;
          line-height: 1.6;
        }

        .tc-description .ant-typography {
          color: #718096;
          font-size: 11px;
        }

        .tc-description-mark {
          color: #D9A441;
          font-family: Georgia, serif;
          font-size: 23px;
          font-weight: 800;
          line-height: 1;
        }

        /* LIST MODE: THẺ NGANG GỌN */
        .tc-class-grid.list-mode .tc-class-card .ant-card-body {
          display: grid;
          grid-template-columns: minmax(170px, 1.2fr) minmax(175px, .9fr) minmax(135px, .75fr);
          align-items: center;
          gap: 10px 18px;
          padding: 13px 16px;
        }

        .tc-class-grid.list-mode .tc-card-header {
          grid-column: 1;
          align-items: center;
        }

        .tc-class-grid.list-mode .tc-class-icon {
          width: 39px;
          height: 39px;
          border-radius: 11px;
          font-size: 17px;
        }

        .tc-class-grid.list-mode .tc-class-name {
          font-size: 13px !important;
        }

        .tc-class-grid.list-mode .tc-status {
          display: none;
        }

        .tc-class-grid.list-mode .tc-schedule {
          grid-column: 2;
          margin-top: 0;
          padding: 9px;
          gap: 7px;
        }

        .tc-class-grid.list-mode .tc-schedule-icon {
          width: 29px;
          height: 29px;
          font-size: 14px;
        }

        .tc-class-grid.list-mode .tc-schedule-day {
          font-size: 11px;
        }

        .tc-class-grid.list-mode .tc-eyebrow {
          font-size: 8px;
        }

        .tc-class-grid.list-mode .tc-time-pill {
          padding: 6px 7px;
          font-size: 9px;
        }

        .tc-class-grid.list-mode .tc-details-grid {
          grid-column: 3;
          grid-template-columns: 1fr;
          gap: 5px;
          margin-top: 0;
        }

        .tc-class-grid.list-mode .tc-detail-item {
          padding: 5px 7px;
          border: none;
          background: #F7F9FC;
        }

        .tc-class-grid.list-mode .tc-detail-icon {
          width: 26px;
          height: 26px;
          font-size: 13px;
        }

        .tc-class-grid.list-mode .tc-detail-label {
          font-size: 9px;
        }

        .tc-class-grid.list-mode .tc-detail-value {
          font-size: 10px;
        }

        .tc-class-grid.list-mode .tc-duration,
        .tc-class-grid.list-mode .tc-card-footer,
        .tc-class-grid.list-mode .tc-description {
          grid-column: 1 / -1;
        }

        .tc-class-grid.list-mode .tc-duration {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 0;
          padding: 9px 0 0;
          border-bottom: none;
        }

        .tc-class-grid.list-mode .tc-duration-dates {
          margin-top: 0;
        }

        .tc-class-grid.list-mode .tc-card-footer {
          padding-top: 8px;
          border-top: 1px dashed #E4EAF1;
        }

        .tc-class-grid.list-mode .tc-description {
          margin-top: 0;
        }

        /* EMPTY STATE */
        .tc-empty-card {
          padding: 35px 20px;
          border: 1px dashed #CCD8E5;
          border-radius: 18px;
          background: #FFFFFF;
          text-align: center;
        }

        .tc-empty-title {
          margin-top: 12px;
          color: #253B53;
          font-size: 14px;
          font-weight: 800;
        }

        .tc-empty-subtitle {
          margin-top: 6px;
          color: #8796A8;
          font-size: 12px;
        }

        .tc-clear-filter {
          margin-top: 15px;
          padding: 8px 13px;
          border: 1px solid #D9E3ED;
          border-radius: 9px;
          background: #FFFFFF;
          color: #173B5E;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 1050px) {
          .tc-class-grid {
            grid-template-columns: 1fr;
          }

          .tc-class-grid.list-mode .tc-class-card .ant-card-body {
            grid-template-columns: minmax(160px, 1fr) minmax(170px, 1fr);
          }

          .tc-class-grid.list-mode .tc-card-header,
          .tc-class-grid.list-mode .tc-schedule {
            grid-column: auto;
          }

          .tc-class-grid.list-mode .tc-details-grid {
            grid-column: 1 / -1;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .tc-toolbar {
            flex-wrap: wrap;
          }

          .tc-search {
            flex: 1 1 100%;
          }

          .tc-filter {
            flex: 1 1 160px;
            width: auto;
          }

          .tc-refresh {
            flex: 0 0 auto;
          }

          .tc-class-grid.list-mode .tc-class-card .ant-card-body {
            grid-template-columns: 1fr;
            gap: 11px;
            padding: 14px;
          }

          .tc-class-grid.list-mode .tc-card-header,
          .tc-class-grid.list-mode .tc-schedule,
          .tc-class-grid.list-mode .tc-details-grid,
          .tc-class-grid.list-mode .tc-duration,
          .tc-class-grid.list-mode .tc-card-footer,
          .tc-class-grid.list-mode .tc-description {
            grid-column: 1;
          }

          .tc-class-grid.list-mode .tc-schedule {
            align-items: flex-start;
          }

          .tc-class-grid.list-mode .tc-duration {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .tc-profile {
            padding: 14px;
          }

          .tc-profile-left {
            gap: 10px;
          }

          .tc-profile-avatar {
            width: 45px;
            height: 45px;
            border-radius: 13px;
            font-size: 15px;
          }

          .tc-profile-name {
            font-size: 15px !important;
          }

          .tc-profile-meta {
            gap: 5px;
          }

          .tc-profile-chip {
            padding: 4px 6px;
            font-size: 9px;
          }

          .tc-section-title {
            font-size: 17px !important;
          }

          .tc-class-card .ant-card-body {
            padding: 14px;
          }

          .tc-card-header {
            flex-direction: column;
          }

          .tc-status {
            margin-left: 54px !important;
          }

          .tc-schedule {
            align-items: flex-start;
            flex-direction: column;
          }

          .tc-time-pill {
            width: 100%;
            justify-content: center;
          }

          .tc-details-grid {
            gap: 7px;
          }

          .tc-detail-item {
            gap: 6px;
            padding: 8px;
          }

          .tc-detail-icon {
            width: 27px;
            height: 27px;
            font-size: 13px;
          }

          .tc-detail-value {
            font-size: 10px;
          }

          .tc-role-badge {
            max-width: 105px;
            white-space: normal;
          }

          .tc-view-btn {
            width: 31px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tc-class-card,
          .tc-view-btn,
          .tc-refresh {
            transition: none;
          }
        }
      `}</style>

      {/* HEADER */}
      <PageHeroHeader
        icon={<BookOutlined />}
        title="Lớp học phụ trách"
        description="Theo dõi lịch học, sĩ số và các lớp Giáo lý được phân công."
        onRefresh={fetchClasses}
        refreshLoading={loading}
      />

      {/* THỐNG KÊ */}
      <Row gutter={[14, 14]} style={{ marginTop: 20 }}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Tổng số lớp"
            value={classes.length}
            suffix="lớp"
            icon={<BookOutlined />}
            color={COLORS.navy}
            bg={COLORS.navyLight}
          />
        </Col>

        <Col xs={24} sm={8}>
          <StatCard
            title="Tổng sĩ số"
            value={totalStudents}
            suffix="học viên"
            icon={<TeamOutlined />}
            color={COLORS.green}
            bg={COLORS.greenLight}
          />
        </Col>

        <Col xs={24} sm={8}>
          <StatCard
            title="Sĩ số trung bình"
            value={
              classes.length ? Math.round(totalStudents / classes.length) : 0
            }
            suffix="em / lớp"
            icon={<IdcardOutlined />}
            color="#B58A39"
            bg={COLORS.goldLight}
          />
        </Col>
      </Row>

      {/* HỒ SƠ GIÁO LÝ VIÊN */}
      <div className="tc-profile">
        <div className="tc-profile-left">
          <Avatar className="tc-profile-avatar" icon={<UserOutlined />}>
            {getInitials(user?.full_name)}
          </Avatar>

          <div style={{ minWidth: 0 }}>
            <Text className="tc-profile-kicker">HỒ SƠ GIÁO LÝ VIÊN</Text>

            <Title level={4} className="tc-profile-name">
              {user?.full_name || "Giáo lý viên"}
            </Title>

            <div className="tc-profile-meta">
              <span className="tc-profile-chip">
                <SafetyCertificateOutlined />
                Thánh danh:
                <strong>{user?.holy_name || "Chưa cập nhật"}</strong>
              </span>

              <span className="tc-profile-chip">
                <IdcardOutlined />
                Mã GLV:
                <strong>{user?.catechist_code || "N/A"}</strong>
              </span>
            </div>
          </div>
        </div>

        <ReadOutlined className="tc-profile-decoration" />
      </div>

      {/* TIÊU ĐỀ DANH SÁCH */}
      <div className="tc-section-heading">
        <div>
          <Title level={4} className="tc-section-title">
            Danh sách lớp học
          </Title>

          <Text className="tc-section-subtitle">
            Các lớp học được phân công cho bạn trong hệ thống.
          </Text>
        </div>

        <div className="tc-count-pill">
          {filteredClasses.length} / {classes.length} lớp
        </div>
      </div>

      {/* TÌM KIẾM, LỌC VÀ CHUYỂN KIỂU */}
      <div className="tc-toolbar">
        <div className="tc-search">
          <Input
            allowClear
            prefix={
              <SearchOutlined style={{ color: "#8290A3", fontSize: 16 }} />
            }
            placeholder="Tìm tên lớp, mã lớp hoặc khối lớp..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        <Select
          className="tc-filter"
          value={statusFilter}
          onChange={setStatusFilter}
          suffixIcon={<FilterOutlined />}
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            {
              value: "active",
              label: `Đang học (${statusCounts.active})`,
            },
            {
              value: "paused",
              label: `Tạm dừng (${statusCounts.paused})`,
            },
            {
              value: "completed",
              label: `Đã hoàn thành (${statusCounts.completed})`,
            },
          ]}
        />

        {/* GRID / LIST */}
        <div className="tc-view-switch" aria-label="Kiểu hiển thị">
          <Tooltip title="Hiển thị dạng lưới">
            <button
              type="button"
              className={`tc-view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Hiển thị dạng lưới"
              aria-pressed={viewMode === "grid"}
            >
              <AppstoreOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Hiển thị dạng danh sách">
            <button
              type="button"
              className={`tc-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="Hiển thị dạng danh sách"
              aria-pressed={viewMode === "list"}
            >
              <UnorderedListOutlined />
            </button>
          </Tooltip>
        </div>

        <Tooltip title="Tải lại danh sách lớp học">
          <Button
            className="tc-refresh"
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchClasses}
            disabled={loading}
          >
            Làm mới
          </Button>
        </Tooltip>
      </div>

      {/* DANH SÁCH LỚP */}
      {loading && classes.length === 0 ? (
        <div className="tc-class-grid">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="tc-class-card" bordered={false}>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Card>
          ))}
        </div>
      ) : filteredClasses.length > 0 ? (
        <div
          className={`tc-class-grid ${viewMode === "list" ? "list-mode" : ""}`}
        >
          {filteredClasses.map((item, index) => (
            <ClassCard
              key={item?.assignment_id || item?.id || index}
              classData={item}
            />
          ))}
        </div>
      ) : (
        <div className="tc-empty-card">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null} />

          <div className="tc-empty-title">
            {searchText || statusFilter !== "all"
              ? "Không tìm thấy lớp học phù hợp"
              : "Chưa có lớp học được phân công"}
          </div>

          <div className="tc-empty-subtitle">
            {searchText || statusFilter !== "all"
              ? "Hãy thử thay đổi từ khóa hoặc trạng thái lọc."
              : "Các lớp học được phân công sẽ xuất hiện tại đây."}
          </div>

          {(searchText || statusFilter !== "all") && (
            <button
              type="button"
              className="tc-clear-filter"
              onClick={() => {
                setSearchText("");
                setStatusFilter("all");
              }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {loading && classes.length > 0 && (
        <Text
          type="secondary"
          style={{ display: "block", marginTop: 14, fontSize: 11 }}
        >
          <ReloadOutlined spin /> Đang cập nhật dữ liệu lớp học...
        </Text>
      )}
    </div>
  );
};

export default TeacherClassesPage;
