import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Typography,
  message,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleFilled,
  RightOutlined,
  BellOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { getDashboardParent } from "../../api/dashboardApi";
import parentApi from "../../api/parentApi";
import DashboardSkeleton from "./DashboardSkeleton";

const { Title, Text } = Typography;

/* =========================================================
   FAITHEDU DESIGN TOKENS
========================================================= */

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

  blue: "#2563EB",
  blueBg: "#EFF6FF",

  orange: "#C47A20",
  orangeBg: "#FBF1E3",
};

/* =========================================================
   CSS
========================================================= */

const CSS = `
.parent-dashboard {
  width: 100%;
  min-width: 0;
  color: ${COLORS.text};
  font-family: Inter, "Be Vietnam Pro", "Segoe UI", Arial, sans-serif;
}

.parent-dashboard *,
.parent-dashboard *::before,
.parent-dashboard *::after {
  box-sizing: border-box;
}

.parent-dashboard__hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.parent-dashboard__hero-left {
  min-width: 0;
}

.parent-dashboard__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: ${COLORS.gold};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.3px;
  text-transform: uppercase;
}

.parent-dashboard__eyebrow::before {
  content: "";
  display: inline-block;
  width: 20px;
  height: 2px;
  border-radius: 10px;
  background: ${COLORS.gold};
}

.parent-dashboard__title {
  margin: 0 !important;
  color: ${COLORS.navy} !important;
  font-size: 27px !important;
  font-weight: 800 !important;
  line-height: 1.35 !important;
  letter-spacing: -0.6px;
  overflow-wrap: anywhere;
}

.parent-dashboard__subtitle {
  display: block;
  margin-top: 7px;
  color: ${COLORS.textSecondary};
  font-size: 12px;
  line-height: 1.7;
}

.parent-dashboard__date {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 9px;
  padding: 10px 13px;
  border: 1px solid ${COLORS.border};
  border-radius: 11px;
  background: ${COLORS.white};
  color: ${COLORS.textSecondary};
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 3px 12px rgba(23, 59, 94, 0.025);
}

.parent-dashboard__date .anticon {
  color: ${COLORS.gold};
  font-size: 15px;
}

/* SECTION */

.parent-dashboard__section {
  margin-bottom: 24px;
}

.parent-dashboard__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 13px;
}

.parent-dashboard__section-heading {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.parent-dashboard__section-mark {
  width: 4px;
  height: 19px;
  flex-shrink: 0;
  border-radius: 5px;
  background: ${COLORS.gold};
}

.parent-dashboard__section-title {
  margin: 0;
  color: ${COLORS.navy};
  font-size: 14px;
  font-weight: 800;
}

.parent-dashboard__section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 7px;
  background: ${COLORS.navyLight};
  color: ${COLORS.navy};
  font-size: 10px;
  font-weight: 800;
}

.parent-dashboard__section-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: auto;
  padding: 5px 0;
  color: ${COLORS.textSecondary};
  font-size: 11px;
  font-weight: 600;
}

.parent-dashboard__section-action:hover {
  color: ${COLORS.navyHover} !important;
}

/* STUDENT CARD */

.parent-dashboard__student-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid ${COLORS.border};
  border-radius: 15px;
  background: ${COLORS.white};
  box-shadow: 0 3px 14px rgba(23, 59, 94, 0.025);
  transition: transform 0.2s ease, box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.parent-dashboard__student-card:hover {
  transform: translateY(-2px);
  border-color: #C8D6E3;
  box-shadow: 0 9px 24px rgba(23, 59, 94, 0.07);
}

.parent-dashboard__student-card .ant-card-body {
  padding: 17px;
}

.parent-dashboard__student-top {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.parent-dashboard__student-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, ${COLORS.navy}, #376B91);
  color: ${COLORS.white};
  font-size: 13px;
  font-weight: 800;
}

.parent-dashboard__student-info {
  flex: 1;
  min-width: 0;
}

.parent-dashboard__student-name {
  display: block;
  overflow: hidden;
  color: ${COLORS.text};
  font-size: 13px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.parent-dashboard__student-class {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  color: ${COLORS.muted};
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.parent-dashboard__student-status {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 5px;
  padding: 5px 7px;
  border-radius: 7px;
  background: ${COLORS.successBg};
  color: ${COLORS.success};
  font-size: 9px;
  font-weight: 700;
}

.parent-dashboard__student-divider {
  height: 1px;
  margin: 16px 0 13px;
  background: #EEF2F6;
}

.parent-dashboard__student-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.parent-dashboard__attendance {
  min-width: 0;
}

.parent-dashboard__mini-label {
  display: block;
  margin-bottom: 5px;
  color: ${COLORS.muted};
  font-size: 10px;
}

.parent-dashboard__attendance-value {
  color: ${COLORS.navy};
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.parent-dashboard__attendance-unit {
  margin-left: 3px;
  color: ${COLORS.textSecondary};
  font-size: 11px;
}

.parent-dashboard__student-code {
  max-width: 50%;
  overflow: hidden;
  color: ${COLORS.muted};
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* INFORMATION CARDS */

.parent-dashboard__info-card {
  height: 100%;
  border: 1px solid ${COLORS.border};
  border-radius: 15px;
  background: ${COLORS.white};
  box-shadow: 0 3px 14px rgba(23, 59, 94, 0.025);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.parent-dashboard__info-card:hover {
  border-color: #D1DCE7;
  box-shadow: 0 8px 22px rgba(23, 59, 94, 0.045);
}

.parent-dashboard__info-card .ant-card-body {
  height: 100%;
  padding: 18px;
}

.parent-dashboard__info-header {
  display: flex;
  align-items: center;
  gap: 11px;
}

.parent-dashboard__info-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 39px;
  height: 39px;
  border-radius: 11px;
  background: ${COLORS.navyLight};
  color: ${COLORS.navy};
  font-size: 17px;
}

.parent-dashboard__info-label {
  color: ${COLORS.muted};
  font-size: 9.5px;
  font-weight: 750;
  letter-spacing: 0.55px;
  text-transform: uppercase;
}

.parent-dashboard__info-title {
  margin-top: 4px;
  color: ${COLORS.navy};
  font-size: 13px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.parent-dashboard__schedule-time {
  margin-top: 20px;
  color: ${COLORS.navy};
  font-size: 21px;
  font-weight: 800;
  line-height: 1.4;
  letter-spacing: -0.5px;
  overflow-wrap: anywhere;
}

.parent-dashboard__schedule-meta {
  margin-top: 7px;
  color: ${COLORS.textSecondary};
  font-size: 11px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.parent-dashboard__result-score {
  margin-top: 21px;
  color: ${COLORS.navy};
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.8px;
}

.parent-dashboard__result-score span {
  color: ${COLORS.muted};
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
}

.parent-dashboard__result-title {
  margin-top: 8px;
  color: ${COLORS.textSecondary};
  font-size: 11px;
  line-height: 1.6;
}

.parent-dashboard__result-student {
  margin-top: 5px;
  color: ${COLORS.text};
  font-size: 11px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

/* NOTIFICATIONS */

.parent-dashboard__notifications {
  overflow: hidden;
  border: 1px solid ${COLORS.border};
  border-radius: 15px;
  background: ${COLORS.white};
  box-shadow: 0 3px 14px rgba(23, 59, 94, 0.025);
}

.parent-dashboard__notification {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 66px;
  padding: 12px 16px;
  border-bottom: 1px solid #EEF2F6;
  transition: background 0.15s ease;
}

.parent-dashboard__notification:last-child {
  border-bottom: none;
}

.parent-dashboard__notification:hover {
  background: #FAFBFD;
}

.parent-dashboard__notification-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 10px;
  background: ${COLORS.goldLight};
  color: ${COLORS.navy};
  font-size: 15px;
}

.parent-dashboard__notification-content {
  flex: 1;
  min-width: 0;
}

.parent-dashboard__notification-title {
  display: block;
  overflow: hidden;
  color: ${COLORS.text};
  font-size: 11.5px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.parent-dashboard__notification-time {
  display: block;
  margin-top: 5px;
  color: ${COLORS.muted};
  font-size: 10px;
}

.parent-dashboard__notification-dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${COLORS.gold};
}

.parent-dashboard__empty {
  padding: 24px 12px;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .parent-dashboard__hero {
    align-items: flex-start;
  }

  .parent-dashboard__title {
    font-size: 24px !important;
  }

  .parent-dashboard__date {
    font-size: 10px;
  }
}

@media (max-width: 767px) {
  .parent-dashboard__hero {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .parent-dashboard__title {
    font-size: 22px !important;
  }

  .parent-dashboard__subtitle {
    font-size: 11.5px;
  }

  .parent-dashboard__date {
    display: none;
  }

  .parent-dashboard__section {
    margin-bottom: 20px;
  }

  .parent-dashboard__student-card .ant-card-body,
  .parent-dashboard__info-card .ant-card-body {
    padding: 14px;
  }

  .parent-dashboard__student-status {
    display: none;
  }

  .parent-dashboard__schedule-time {
    margin-top: 16px;
    font-size: 19px;
  }

  .parent-dashboard__result-score {
    font-size: 27px;
  }

  .parent-dashboard__notification {
    padding: 12px;
  }
}

@media (max-width: 380px) {
  .parent-dashboard__title {
    font-size: 20px !important;
  }

  .parent-dashboard__student-name {
    font-size: 12px;
  }

  .parent-dashboard__student-card .ant-card-body {
    padding: 12px;
  }

  .parent-dashboard__section-title {
    font-size: 13px;
  }

  .parent-dashboard__section-action {
    font-size: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .parent-dashboard *,
  .parent-dashboard *::before,
  .parent-dashboard *::after {
    transition: none !important;
  }
}
`;

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  if (!name) return "HS";

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[parts.length - 2][0] + parts[parts.length - 1][0]
  ).toUpperCase();
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

function getResponseData(response) {
  return response?.data?.data ?? response?.data ?? response ?? null;
}

function formatDisplay(value, fallback = "Chưa có dữ liệu") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return value;
}

/* =========================================================
   STUDENT CARD
========================================================= */

function StudentCard({ student }) {
  const name =
    student?.name || student?.full_name || student?.fullName || "Học sinh";

  const avatar =
    student?.avatar || student?.avatar_url || student?.avatarUrl || null;

  const className =
    student?.className ||
    student?.class_name ||
    student?.class?.name ||
    "Chưa cập nhật lớp";

  const attendanceRate =
    student?.attendanceRate ??
    student?.attendance_rate ??
    student?.attendance ??
    null;

  const code =
    student?.code || student?.studentCode || student?.student_code || "";

  const latestAttendance =
    student?.latestAttendance || student?.latest_attendance || "";

  return (
    <Card bordered={false} className="parent-dashboard__student-card">
      <div className="parent-dashboard__student-top">
        <Avatar
          size={44}
          src={avatar}
          className="parent-dashboard__student-avatar"
        >
          {!avatar && getInitials(name)}
        </Avatar>

        <div className="parent-dashboard__student-info">
          <span className="parent-dashboard__student-name">{name}</span>

          <span className="parent-dashboard__student-class">{className}</span>
        </div>

        {latestAttendance && (
          <div className="parent-dashboard__student-status">
            <CheckCircleFilled />
            {latestAttendance}
          </div>
        )}
      </div>

      <div className="parent-dashboard__student-divider" />

      <div className="parent-dashboard__student-bottom">
        <div className="parent-dashboard__attendance">
          <span className="parent-dashboard__mini-label">Chuyên cần</span>

          <span className="parent-dashboard__attendance-value">
            {attendanceRate === null ? "--" : Number(attendanceRate)}
          </span>

          <span className="parent-dashboard__attendance-unit">
            {attendanceRate === null ? "" : "%"}
          </span>
        </div>

        {code && (
          <span className="parent-dashboard__student-code">Mã: {code}</span>
        )}
      </div>
    </Card>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function ParentDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);

      try {
        const results = await Promise.allSettled([
          getDashboardParent(),
          parentApi.getMe(),
        ]);

        if (!active) return;

        const dashboardResult = results[0];
        const profileResult = results[1];

        if (dashboardResult.status === "fulfilled") {
          const result = getResponseData(dashboardResult.value);

          if (result) {
            setDashboard(result);
          } else {
            message.error("Không có dữ liệu dashboard");
          }
        } else {
          message.error(
            dashboardResult.reason?.response?.data?.message ||
              "Không thể tải dữ liệu dashboard",
          );
        }

        if (profileResult.status === "fulfilled") {
          const result = getResponseData(profileResult.value);

          if (result) {
            setMe(result);
          }
        } else {
          message.error(
            profileResult.reason?.response?.data?.message ||
              "Không thể tải thông tin phụ huynh",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const students = Array.isArray(dashboard?.students) ? dashboard.students : [];

  const notifications = Array.isArray(dashboard?.notifications)
    ? dashboard.notifications
    : [];

  const upcomingSchedule = dashboard?.upcomingSchedule || {};
  const latestResult = dashboard?.latestResult || {};

  const unreadCount = notifications.filter((item) => item?.unread).length;

  const fullName =
    me?.full_name || me?.fullName || me?.name || me?.username || "Phụ huynh";

  const relationship =
    me?.relationship ||
    me?.relation ||
    (me?.role === "parent" ? "Phụ huynh" : null);

  if (loading) {
    return (
      <div className="parent-dashboard">
        <style>{CSS}</style>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="parent-dashboard">
      <style>{CSS}</style>

      {/* HERO */}

      <div className="parent-dashboard__hero">
        <div className="parent-dashboard__hero-left">
          <div className="parent-dashboard__eyebrow">Không gian gia đình</div>

          <Title level={1} className="parent-dashboard__title">
            Xin chào, {fullName}!
          </Title>

          <Text className="parent-dashboard__subtitle">
            {relationship
              ? `Quan hệ với học sinh: ${relationship}`
              : "Cùng theo dõi hành trình học tập và đức tin của con."}
          </Text>
        </div>

        <div className="parent-dashboard__date">
          <CalendarOutlined />
          <span>{getTodayLabel()}</span>
        </div>
      </div>

      {/* STUDENTS */}

      <section className="parent-dashboard__section">
        <div className="parent-dashboard__section-header">
          <div className="parent-dashboard__section-heading">
            <span className="parent-dashboard__section-mark" />
            <h2 className="parent-dashboard__section-title">Con của tôi</h2>
            <span className="parent-dashboard__section-count">
              {students.length}
            </span>
          </div>

          <Button
            type="text"
            className="parent-dashboard__section-action"
            onClick={() => navigate("/parent/students")}
          >
            Xem tất cả
            <RightOutlined style={{ fontSize: 9 }} />
          </Button>
        </div>

        {students.length > 0 ? (
          <Row gutter={[14, 14]}>
            {students.map((student, index) => (
              <Col
                key={student?.id ?? student?.studentId ?? index}
                xs={24}
                sm={12}
                lg={12}
              >
                <StudentCard student={student || {}} />
              </Col>
            ))}
          </Row>
        ) : (
          <Card bordered={false} className="parent-dashboard__student-card">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có thông tin học sinh"
            />
          </Card>
        )}
      </section>

      {/* SCHEDULE + RESULT */}

      <section className="parent-dashboard__section">
        <Row gutter={[14, 14]}>
          <Col xs={24} md={12}>
            <Card bordered={false} className="parent-dashboard__info-card">
              <div className="parent-dashboard__info-header">
                <div className="parent-dashboard__info-icon">
                  <CalendarOutlined />
                </div>

                <div>
                  <div className="parent-dashboard__info-label">
                    Lịch học gần nhất
                  </div>

                  <div className="parent-dashboard__info-title">
                    {formatDisplay(upcomingSchedule.subject)}
                  </div>
                </div>
              </div>

              <div className="parent-dashboard__schedule-time">
                {upcomingSchedule.date || "Chưa có lịch học"}
                {upcomingSchedule.time ? ` · ${upcomingSchedule.time}` : ""}
              </div>

              <div className="parent-dashboard__schedule-meta">
                {formatDisplay(
                  upcomingSchedule.className || upcomingSchedule.class_name,
                  "Chưa cập nhật lớp học",
                )}

                <br />

                {formatDisplay(upcomingSchedule.room, "Chưa cập nhật địa điểm")}
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card bordered={false} className="parent-dashboard__info-card">
              <div className="parent-dashboard__info-header">
                <div
                  className="parent-dashboard__info-icon"
                  style={{
                    background: COLORS.goldLight,
                    color: COLORS.navy,
                  }}
                >
                  <BookOutlined />
                </div>

                <div>
                  <div className="parent-dashboard__info-label">
                    Kết quả gần nhất
                  </div>

                  <div className="parent-dashboard__info-title">
                    {formatDisplay(latestResult.subject)}
                  </div>
                </div>
              </div>

              <div className="parent-dashboard__result-score">
                {formatDisplay(latestResult.score, "--")}

                <span> / {formatDisplay(latestResult.maxScore, "--")}</span>
              </div>

              <div className="parent-dashboard__result-title">
                {formatDisplay(latestResult.title, "Chưa có kết quả đánh giá")}
              </div>

              <div className="parent-dashboard__result-student">
                Tên con:{" "}
                {formatDisplay(
                  latestResult.studentName || latestResult.student_name,
                  "Chưa có dữ liệu",
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      {/* NOTIFICATIONS */}

      <section className="parent-dashboard__section">
        <div className="parent-dashboard__section-header">
          <div className="parent-dashboard__section-heading">
            <span className="parent-dashboard__section-mark" />

            <h2 className="parent-dashboard__section-title">Thông báo</h2>

            {unreadCount > 0 && (
              <Badge
                count={unreadCount}
                size="small"
                style={{
                  backgroundColor: COLORS.gold,
                  color: COLORS.navy,
                  boxShadow: "none",
                  fontWeight: 700,
                }}
              />
            )}
          </div>

          <Button
            type="text"
            className="parent-dashboard__section-action"
            onClick={() => navigate("/parent/notifications")}
          >
            Xem tất cả
            <RightOutlined style={{ fontSize: 9 }} />
          </Button>
        </div>

        <div className="parent-dashboard__notifications">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div
                key={notification?.id ?? index}
                className="parent-dashboard__notification"
              >
                <div className="parent-dashboard__notification-icon">
                  <BellOutlined />
                </div>

                <div className="parent-dashboard__notification-content">
                  <span className="parent-dashboard__notification-title">
                    {notification?.title || "Thông báo mới"}
                  </span>

                  <span className="parent-dashboard__notification-time">
                    {notification?.time ||
                      notification?.createdAt ||
                      notification?.created_at ||
                      "Chưa có thời gian"}
                  </span>
                </div>

                {notification?.unread && (
                  <span className="parent-dashboard__notification-dot" />
                )}
              </div>
            ))
          ) : (
            <div className="parent-dashboard__empty">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có thông báo"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
