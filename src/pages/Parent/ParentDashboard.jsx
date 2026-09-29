import React from "react";
import { Avatar, Badge, Button, Card, Col, Empty, Row, Typography } from "antd";

import {
  CalendarOutlined,
  CheckCircleFilled,
  RightOutlined,
  BellOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * =========================================================
 * DESIGN TOKENS
 * =========================================================
 */

const COLORS = {
  navy: "#173B5E",
  navyDark: "#102E49",
  gold: "#D9A441",

  background: "#F6F8FB",
  white: "#FFFFFF",

  text: "#172033",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  border: "#E5EAF0",

  green: "#16A34A",
  greenBg: "#ECFDF3",

  blue: "#2563EB",
  blueBg: "#EFF6FF",

  orange: "#D97706",
  orangeBg: "#FFF7ED",
};

/**
 * =========================================================
 * FAKE DATA
 *
 * Sau này chỉ cần thay object này bằng API response.
 * =========================================================
 */

const DASHBOARD_DATA = {
  greeting: {
    name: "Anh Hùng",
    subtitle: "Chúc gia đình một ngày bình an.",
  },

  students: [
    {
      id: 1,
      name: "Nguyễn Minh An",
      className: "Lớp Ấu 2",
      code: "HS260012",
      avatar: null,
      attendanceRate: 96,
      latestAttendance: "Có mặt",
    },
    {
      id: 2,
      name: "Nguyễn Minh Anh",
      className: "Lớp Thiếu 1",
      code: "HS260018",
      avatar: null,
      attendanceRate: 91,
      latestAttendance: "Có mặt",
    },
  ],

  upcomingSchedule: {
    date: "Thứ 7",
    time: "19:00",
    subject: "Giáo lý",
    className: "Lớp Ấu 2",
    room: "Phòng Giáo lý 2",
  },

  latestResult: {
    studentName: "Nguyễn Minh An",
    subject: "Giáo lý",
    title: "Bài kiểm tra tháng 9",
    score: 8.5,
    maxScore: 10,
  },

  notifications: [
    {
      id: 1,
      title: "Thông báo lịch học tuần này",
      time: "2 giờ trước",
      unread: true,
    },
    {
      id: 2,
      title: "Lịch kiểm tra tháng 10",
      time: "Hôm qua",
      unread: true,
    },
    {
      id: 3,
      title: "Thông báo từ giáo xứ",
      time: "2 ngày trước",
      unread: false,
    },
  ],
};

/**
 * =========================================================
 * CSS
 * =========================================================
 */

const CSS = `
.parent-dashboard {
  width: 100%;
  color: ${COLORS.text};
  font-family:
    Inter,
    "Be Vietnam Pro",
    "Segoe UI",
    Arial,
    sans-serif;
}

/* =========================================================
   HEADER
========================================================= */

.parent-dashboard__hero {
  margin-bottom: 22px;

  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 20px;
}

.parent-dashboard__hero-left {
  min-width: 0;
}

.parent-dashboard__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  margin-bottom: 7px;

  color: ${COLORS.gold};

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 1px;
  text-transform: uppercase;
}

.parent-dashboard__eyebrow::before {
  content: "";

  width: 18px;
  height: 2px;

  border-radius: 10px;

  background: ${COLORS.gold};
}

.parent-dashboard__title {
  margin: 0 !important;

  color: ${COLORS.navy} !important;

  font-size: 27px !important;
  font-weight: 800 !important;

  line-height: 1.25 !important;

  letter-spacing: -0.7px;
}

.parent-dashboard__subtitle {
  display: block;

  margin-top: 5px;

  color: ${COLORS.textSecondary};

  font-size: 13px;
}

.parent-dashboard__date {
  flex-shrink: 0;

  padding: 9px 13px;

  display: flex;
  align-items: center;
  gap: 8px;

  border: 1px solid ${COLORS.border};
  border-radius: 10px;

  background: ${COLORS.white};

  color: ${COLORS.textSecondary};

  font-size: 11px;
  font-weight: 600;
}

/* =========================================================
   SECTION
========================================================= */

.parent-dashboard__section {
  margin-bottom: 20px;
}

.parent-dashboard__section-header {
  margin-bottom: 11px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;
}

.parent-dashboard__section-title {
  margin: 0;

  color: ${COLORS.navy};

  font-size: 13px;
  font-weight: 800;

  letter-spacing: 0.2px;
}

.parent-dashboard__section-action {
  padding: 0;

  color: ${COLORS.textSecondary};

  font-size: 11px;
  font-weight: 600;
}

.parent-dashboard__section-action:hover {
  color: ${COLORS.navy} !important;
}

/* =========================================================
   STUDENT CARD
========================================================= */

.parent-dashboard__student-card {
  height: 100%;

  border:
    1px solid
    ${COLORS.border};

  border-radius: 15px;

  background: ${COLORS.white};

  box-shadow:
    0 4px 18px
    rgba(15, 23, 42, 0.035);

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.parent-dashboard__student-card:hover {
  transform: translateY(-2px);

  border-color: #D9E2EC;

  box-shadow:
    0 10px 28px
    rgba(15, 23, 42, 0.065);
}

.parent-dashboard__student-card
.ant-card-body {
  padding: 17px;
}

.parent-dashboard__student-top {
  display: flex;
  align-items: center;

  gap: 12px;
}

.parent-dashboard__student-avatar {
  flex-shrink: 0;

  background:
    linear-gradient(
      135deg,
      ${COLORS.navy},
      #2D668F
    );

  color: #fff;

  font-weight: 700;
}

.parent-dashboard__student-info {
  min-width: 0;
  flex: 1;
}

.parent-dashboard__student-name {
  display: block;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;

  color: ${COLORS.text};

  font-size: 13px;
  font-weight: 750;
}

.parent-dashboard__student-class {
  display: block;

  margin-top: 3px;

  color: ${COLORS.textMuted};

  font-size: 10.5px;
}

.parent-dashboard__student-status {
  display: flex;
  align-items: center;
  gap: 5px;

  flex-shrink: 0;

  padding: 5px 7px;

  border-radius: 7px;

  background: ${COLORS.greenBg};

  color: ${COLORS.green};

  font-size: 9px;
  font-weight: 700;
}

.parent-dashboard__student-divider {
  height: 1px;

  margin: 15px 0 13px;

  background: #EEF2F6;
}

.parent-dashboard__student-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;
}

.parent-dashboard__attendance {
  min-width: 0;
}

.parent-dashboard__mini-label {
  display: block;

  margin-bottom: 3px;

  color: ${COLORS.textMuted};

  font-size: 9.5px;
}

.parent-dashboard__attendance-value {
  color: ${COLORS.navy};

  font-size: 16px;
  font-weight: 800;
}

.parent-dashboard__attendance-unit {
  margin-left: 3px;

  color: ${COLORS.textMuted};

  font-size: 10px;
  font-weight: 500;
}

.parent-dashboard__student-code {
  color: ${COLORS.textMuted};

  font-size: 9.5px;
}

/* =========================================================
   SMALL CARDS
========================================================= */

.parent-dashboard__info-card {
  height: 100%;

  border:
    1px solid
    ${COLORS.border};

  border-radius: 15px;

  background: ${COLORS.white};

  box-shadow:
    0 4px 18px
    rgba(15, 23, 42, 0.03);
}

.parent-dashboard__info-card
.ant-card-body {
  height: 100%;
  padding: 17px;
}

.parent-dashboard__info-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.parent-dashboard__info-icon {
  width: 35px;
  height: 35px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: ${COLORS.blueBg};

  color: ${COLORS.blue};

  font-size: 16px;
}

.parent-dashboard__info-label {
  color: ${COLORS.textMuted};

  font-size: 9.5px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.parent-dashboard__info-title {
  margin-top: 3px;

  color: ${COLORS.navy};

  font-size: 13px;
  font-weight: 800;
}

.parent-dashboard__schedule-time {
  margin-top: 18px;

  color: ${COLORS.navy};

  font-size: 22px;
  font-weight: 800;

  letter-spacing: -0.5px;
}

.parent-dashboard__schedule-meta {
  margin-top: 4px;

  color: ${COLORS.textSecondary};

  font-size: 11px;
  line-height: 1.6;
}

.parent-dashboard__result-score {
  margin-top: 17px;

  color: ${COLORS.navy};

  font-size: 27px;
  font-weight: 800;

  line-height: 1;
}

.parent-dashboard__result-score span {
  color: ${COLORS.textMuted};

  font-size: 12px;
  font-weight: 500;
}

.parent-dashboard__result-title {
  margin-top: 7px;

  color: ${COLORS.textSecondary};

  font-size: 10.5px;
}

.parent-dashboard__result-student {
  margin-top: 4px;

  color: ${COLORS.text};

  font-size: 11px;
  font-weight: 700;
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

.parent-dashboard__notifications {
  border:
    1px solid
    ${COLORS.border};

  border-radius: 15px;

  background: ${COLORS.white};

  overflow: hidden;

  box-shadow:
    0 4px 18px
    rgba(15, 23, 42, 0.03);
}

.parent-dashboard__notification {
  min-height: 58px;

  padding: 11px 15px;

  display: flex;
  align-items: center;

  gap: 11px;

  border-bottom:
    1px solid
    #EEF2F6;
}

.parent-dashboard__notification:last-child {
  border-bottom: none;
}

.parent-dashboard__notification-icon {
  width: 30px;
  height: 30px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: #F5F8FB;

  color: ${COLORS.navy};

  font-size: 14px;
}

.parent-dashboard__notification-content {
  min-width: 0;
  flex: 1;
}

.parent-dashboard__notification-title {
  display: block;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;

  color: ${COLORS.text};

  font-size: 11.5px;
  font-weight: 600;
}

.parent-dashboard__notification-time {
  display: block;

  margin-top: 3px;

  color: ${COLORS.textMuted};

  font-size: 9.5px;
}

.parent-dashboard__notification-dot {
  width: 6px;
  height: 6px;

  flex-shrink: 0;

  border-radius: 50%;

  background: ${COLORS.gold};
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {

  .parent-dashboard__title {
    font-size: 24px !important;
  }

  .parent-dashboard__hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .parent-dashboard__date {
    display: none;
  }
}

@media (max-width: 767px) {

  .parent-dashboard__hero {
    margin-bottom: 17px;
  }

  .parent-dashboard__title {
    font-size: 21px !important;
  }

  .parent-dashboard__subtitle {
    font-size: 11.5px;
  }

  .parent-dashboard__section {
    margin-bottom: 17px;
  }

  .parent-dashboard__student-card
  .ant-card-body {
    padding: 14px;
  }

  .parent-dashboard__student-status {
    display: none;
  }

  .parent-dashboard__info-card
  .ant-card-body {
    padding: 14px;
  }

  .parent-dashboard__schedule-time {
    margin-top: 14px;
  }

  .parent-dashboard__notifications {
    border-radius: 12px;
  }
}

@media (max-width: 380px) {

  .parent-dashboard__student-name {
    font-size: 12px;
  }

  .parent-dashboard__student-card
  .ant-card-body {
    padding: 12px;
  }
}

/* =========================================================
   REDUCE MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  .parent-dashboard * {
    transition: none !important;
  }
}
`;

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

function getInitials(name) {
  if (!name) return "HS";

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * =========================================================
 * STUDENT CARD
 * =========================================================
 */

function StudentCard({ student }) {
  return (
    <Card bordered={false} className="parent-dashboard__student-card">
      <div className="parent-dashboard__student-top">
        <Avatar
          size={42}
          src={student.avatar}
          className="parent-dashboard__student-avatar"
        >
          {!student.avatar && getInitials(student.name)}
        </Avatar>

        <div className="parent-dashboard__student-info">
          <span className="parent-dashboard__student-name">{student.name}</span>

          <span className="parent-dashboard__student-class">
            {student.className}
          </span>
        </div>

        <div className="parent-dashboard__student-status">
          <CheckCircleFilled />
          {student.latestAttendance}
        </div>
      </div>

      <div className="parent-dashboard__student-divider" />

      <div className="parent-dashboard__student-bottom">
        <div className="parent-dashboard__attendance">
          <span className="parent-dashboard__mini-label">Chuyên cần</span>

          <span className="parent-dashboard__attendance-value">
            {student.attendanceRate}
          </span>

          <span className="parent-dashboard__attendance-unit">%</span>
        </div>

        <span className="parent-dashboard__student-code">{student.code}</span>
      </div>
    </Card>
  );
}

/**
 * =========================================================
 * DASHBOARD
 * =========================================================
 */

export default function ParentDashboard() {
  const data = DASHBOARD_DATA;

  return (
    <div className="parent-dashboard">
      <style>{CSS}</style>

      {/* ===================================================
          HERO
      =================================================== */}

      <div className="parent-dashboard__hero">
        <div className="parent-dashboard__hero-left">
          <div className="parent-dashboard__eyebrow">Không gian gia đình</div>

          <Title level={1} className="parent-dashboard__title">
            Xin chào, {data.greeting.name}
          </Title>

          <Text className="parent-dashboard__subtitle">
            {data.greeting.subtitle}
          </Text>
        </div>

        <div className="parent-dashboard__date">
          <CalendarOutlined />
          Thứ Hai, 28/09/2026
        </div>
      </div>

      {/* ===================================================
          STUDENTS
      =================================================== */}

      <section className="parent-dashboard__section">
        <div className="parent-dashboard__section-header">
          <h2 className="parent-dashboard__section-title">Con của tôi</h2>

          <Button type="text" className="parent-dashboard__section-action">
            Xem tất cả
            <RightOutlined
              style={{
                fontSize: 8,
                marginLeft: 5,
              }}
            />
          </Button>
        </div>

        <Row gutter={[12, 12]}>
          {data.students.map((student) => (
            <Col key={student.id} xs={24} sm={12} lg={12}>
              <StudentCard student={student} />
            </Col>
          ))}
        </Row>
      </section>

      {/* ===================================================
          SCHEDULE + RESULT
      =================================================== */}

      <section className="parent-dashboard__section">
        <Row gutter={[12, 12]}>
          {/* SCHEDULE */}

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
                    {data.upcomingSchedule.subject}
                  </div>
                </div>
              </div>

              <div className="parent-dashboard__schedule-time">
                {data.upcomingSchedule.date}
                {" · "}
                {data.upcomingSchedule.time}
              </div>

              <div className="parent-dashboard__schedule-meta">
                {data.upcomingSchedule.className}

                <br />

                {data.upcomingSchedule.room}
              </div>
            </Card>
          </Col>

          {/* RESULT */}

          <Col xs={24} md={12}>
            <Card bordered={false} className="parent-dashboard__info-card">
              <div className="parent-dashboard__info-header">
                <div
                  className="parent-dashboard__info-icon"
                  style={{
                    background: COLORS.orangeBg,
                    color: COLORS.orange,
                  }}
                >
                  <BookOutlined />
                </div>

                <div>
                  <div className="parent-dashboard__info-label">
                    Kết quả gần nhất
                  </div>

                  <div className="parent-dashboard__info-title">
                    {data.latestResult.subject}
                  </div>
                </div>
              </div>

              <div className="parent-dashboard__result-score">
                {data.latestResult.score}

                <span> / {data.latestResult.maxScore}</span>
              </div>

              <div className="parent-dashboard__result-title">
                {data.latestResult.title}
              </div>

              <div className="parent-dashboard__result-student">
                {data.latestResult.studentName}
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      {/* ===================================================
          NOTIFICATIONS
      =================================================== */}

      <section className="parent-dashboard__section">
        <div className="parent-dashboard__section-header">
          <h2 className="parent-dashboard__section-title">Thông báo</h2>

          <Badge
            count={data.notifications.filter((item) => item.unread).length}
            size="small"
          />
        </div>

        <div className="parent-dashboard__notifications">
          {data.notifications.length > 0 ? (
            data.notifications.map((notification) => (
              <div
                key={notification.id}
                className="parent-dashboard__notification"
              >
                <div className="parent-dashboard__notification-icon">
                  <BellOutlined />
                </div>

                <div className="parent-dashboard__notification-content">
                  <span className="parent-dashboard__notification-title">
                    {notification.title}
                  </span>

                  <span className="parent-dashboard__notification-time">
                    {notification.time}
                  </span>
                </div>

                {notification.unread && (
                  <span className="parent-dashboard__notification-dot" />
                )}
              </div>
            ))
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có thông báo"
            />
          )}
        </div>
      </section>
    </div>
  );
}
