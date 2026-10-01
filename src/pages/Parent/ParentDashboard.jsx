import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Col,
  Empty,
  Row,
  Skeleton,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BookOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  RightOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { getDashboardParent } from "../../api/dashboardApi";
import parentApi from "../../api/parentApi";

const { Title, Text } = Typography;

const C = {
  navy: "#0D2F56",
  navy2: "#153F70",
  blue: "#1769E0",
  blueLight: "#EDF5FF",
  gold: "#E9B949",
  text: "#172033",
  secondary: "#64748B",
  muted: "#94A3B8",
  border: "#E8EEF5",
  green: "#22A559",
  greenBg: "#EAF9F0",
  yellow: "#E9AD21",
  yellowBg: "#FFF8E6",
  red: "#E94B59",
  redBg: "#FFF0F1",
  purple: "#8B5CF6",
  purpleBg: "#F3EEFF",
};

/**
 * Put generated images in:
 * public/images/parent-dashboard/
 *
 * The image URLs below are intentionally ready to use.
 * API images take priority over these local fallback images.
 */
const DASHBOARD_IMAGES = {
  heroFamily: "/images/parent-dashboard/hero-family.png",
  heroChurch: "/images/parent-dashboard/hero-church.png",
  studentDefault: "/images/parent-dashboard/student-default.png",
  lessonDefault: "/images/parent-dashboard/lesson-default.png",
};

const CSS = `
.parent-dashboard {
  width: 100%;
  min-width: 0;
  color: ${C.text};
  font-family: Inter, "Be Vietnam Pro", "Segoe UI", Arial, sans-serif;
  font-size: 13px;
}
.parent-dashboard *, .parent-dashboard *::before, .parent-dashboard *::after {
  box-sizing: border-box;
}
.parent-dashboard button { font-family: inherit; }

.parent-dashboard__hero {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  min-height: 202px;
  overflow: hidden;
  padding: 30px 34px;
  margin-bottom: 18px;
  border-radius: 15px;
  background:
    radial-gradient(ellipse at 80% 110%, rgba(255,255,255,.8), transparent 35%),
    linear-gradient(110deg, #EAF5FF 0%, #D7EBFF 55%, #B8D9F1 100%);
}
.parent-dashboard__hero::before {
  content: "";
  position: absolute;
  z-index: 0;
  right: -30px;
  bottom: -95px;
  width: 420px;
  height: 190px;
  border-radius: 50%;
  background: rgba(255,255,255,.32);
  transform: rotate(-8deg);
}
.parent-dashboard__hero::after {
  content: "✝";
  position: absolute;
  z-index: 1;
  right: 10%;
  top: 12px;
  color: rgba(233,185,73,.9);
  font-size: 43px;
  text-shadow: 0 2px 5px rgba(255,255,255,.5);
}
.parent-dashboard__hero-content {
  position: relative;
  z-index: 3;
  width: 61%;
  min-width: 0;
}
.parent-dashboard__hero-title {
  margin: 0 !important;
  color: #112744 !important;
  font-size: clamp(25px, 2.2vw, 34px) !important;
  line-height: 1.25 !important;
  font-weight: 800 !important;
  letter-spacing: -.7px;
}
.parent-dashboard__hero-subtitle {
  display: block;
  max-width: 590px;
  margin-top: 8px;
  color: #203955;
  font-size: 14px;
  line-height: 1.7;
}
.parent-dashboard__verse {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
  padding: 10px 15px;
  border: 1px solid rgba(255,255,255,.85);
  border-radius: 10px;
  background: rgba(255,255,255,.84);
  color: ${C.blue};
  font-size: 12px;
  font-style: italic;
  box-shadow: 0 4px 15px rgba(35,85,135,.06);
}
.parent-dashboard__verse .anticon { font-size: 21px; }
.parent-dashboard__hero-family {
  position: absolute;
  z-index: 2;
  right: 16%;
  bottom: 0;
  width: auto;
  height: 96%;
  max-width: 43%;
  object-fit: contain;
  object-position: bottom;
}
.parent-dashboard__hero-church {
  position: absolute;
  z-index: 1;
  right: 0;
  bottom: 0;
  width: 34%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: .95;
  -webkit-mask-image: linear-gradient(to right, transparent, black 30%);
  mask-image: linear-gradient(to right, transparent, black 30%);
}

.parent-dashboard__grid {
  display: grid;
  grid-template-columns: minmax(280px, 1.02fr) minmax(0, 1.58fr);
  gap: 13px;
  margin-bottom: 14px;
}
.parent-dashboard__panel, .parent-dashboard__middle-panel,
.parent-dashboard__lessons-panel, .parent-dashboard__notifications-panel {
  min-width: 0;
  padding: 15px;
  border: 1px solid #EDF1F6;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 18px rgba(30,65,100,.025);
}
.parent-dashboard__panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  margin-bottom: 13px;
}
.parent-dashboard__panel-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.parent-dashboard__panel-mark {
  display: inline-block;
  width: 4px;
  height: 19px;
  flex-shrink: 0;
  border-radius: 5px;
  background: ${C.gold};
}
.parent-dashboard__panel-title {
  margin: 0 !important;
  color: ${C.text} !important;
  font-size: 15px !important;
  line-height: 1.4 !important;
  font-weight: 800 !important;
}
.parent-dashboard__action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  height: auto;
  padding: 2px 0;
  color: ${C.blue};
  font-size: 11px;
}
.parent-dashboard__action:hover { color: ${C.navy} !important; }

.parent-dashboard__student {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
  padding: 11px;
  border: 1px solid #EAF0F7;
  border-radius: 13px;
  background: #fff;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}
.parent-dashboard__student:hover {
  transform: translateY(-1px);
  border-color: #BFD7F7;
  box-shadow: 0 5px 15px rgba(23,105,224,.07);
}
.parent-dashboard__student-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #DCEBFA, #A7C9EC);
  color: ${C.navy};
  font-weight: 800;
}
.parent-dashboard__student-info { flex: 1; min-width: 0; }
.parent-dashboard__student-name {
  display: block;
  overflow: hidden;
  color: ${C.text};
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.parent-dashboard__student-class {
  display: block;
  margin-top: 5px;
  color: ${C.secondary};
  font-size: 11px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.parent-dashboard__student-status {
  display: inline-block;
  margin-top: 7px;
  padding: 3px 8px;
  border-radius: 15px;
  background: ${C.blueLight};
  color: ${C.blue};
  font-size: 10px;
  white-space: nowrap;
}
.parent-dashboard__student-arrow { flex-shrink: 0; color: #7185A0; }

.parent-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  height: 100%;
}
.parent-dashboard__stat {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  min-height: 145px;
  padding: 13px;
  border: 1px solid transparent;
  border-radius: 12px;
}
.parent-dashboard__stat--green { background: #EEFBF3; border-color: #E4F7EB; }
.parent-dashboard__stat--blue { background: #EFF7FF; border-color: #E5F0FF; }
.parent-dashboard__stat--yellow { background: #FFF9E9; border-color: #FFF4D8; }
.parent-dashboard__stat--red { background: #FFF2F3; border-color: #FFE9EB; }
.parent-dashboard__stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  margin-bottom: 8px;
  border-radius: 10px;
  background: rgba(255,255,255,.7);
  font-size: 21px;
}
.parent-dashboard__stat--green .parent-dashboard__stat-icon { color: #20A45B; }
.parent-dashboard__stat--blue .parent-dashboard__stat-icon { color: ${C.blue}; }
.parent-dashboard__stat--yellow .parent-dashboard__stat-icon { color: #E8AB21; }
.parent-dashboard__stat--red .parent-dashboard__stat-icon { color: ${C.red}; }
.parent-dashboard__stat-value {
  display: block;
  color: #141C2C;
  font-size: 21px;
  line-height: 1.35;
  font-weight: 800;
  overflow-wrap: anywhere;
}
.parent-dashboard__stat-label {
  display: block;
  margin-top: 2px;
  color: #253246;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
}
.parent-dashboard__stat-caption {
  display: block;
  margin-top: 3px;
  color: ${C.secondary};
  font-size: 10px;
  line-height: 1.5;
}

.parent-dashboard__middle-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 13px;
  margin-bottom: 14px;
}
.parent-dashboard__middle-panel { min-height: 280px; }

.parent-dashboard__schedule-list { display: flex; flex-direction: column; gap: 7px; }
.parent-dashboard__schedule-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 9px;
  border-radius: 10px;
  background: #F8FAFD;
}
.parent-dashboard__schedule-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 57px;
  min-height: 58px;
  border-radius: 9px;
  background: #EDF5FF;
  color: ${C.blue};
}
.parent-dashboard__schedule-weekday { font-size: 10px; }
.parent-dashboard__schedule-day { margin-top: 2px; font-size: 16px; line-height: 1.3; font-weight: 800; }
.parent-dashboard__schedule-detail { flex: 1; min-width: 0; }
.parent-dashboard__schedule-name {
  display: block;
  overflow: hidden;
  color: ${C.text};
  font-size: 11px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.parent-dashboard__schedule-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  color: ${C.secondary};
  font-size: 10px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.parent-dashboard__schedule-meta .anticon { flex-shrink: 0; }
.parent-dashboard__schedule-tag {
  flex-shrink: 0;
  padding: 5px 7px;
  border-radius: 7px;
  background: #E4F0FF;
  color: ${C.blue};
  font-size: 9px;
}

.parent-dashboard__attendance-list { display: flex; flex-direction: column; }
.parent-dashboard__attendance-row {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  min-height: 39px;
  border-bottom: 1px solid #EDF1F6;
}
.parent-dashboard__attendance-row:last-child { border-bottom: none; }
.parent-dashboard__attendance-date { color: ${C.secondary}; font-size: 11px; }
.parent-dashboard__attendance-lesson {
  min-width: 0;
  overflow: hidden;
  color: #263449;
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.parent-dashboard__attendance-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
  border-radius: 20px;
  font-size: 9px;
  white-space: nowrap;
}
.parent-dashboard__attendance-badge--present { background: ${C.greenBg}; color: ${C.green}; }
.parent-dashboard__attendance-badge--absent { background: ${C.redBg}; color: ${C.red}; }
.parent-dashboard__attendance-badge--late { background: ${C.yellowBg}; color: #B7791F; }

.parent-dashboard__chart-heading { margin: 3px 0 8px; color: #273449; font-size: 11px; font-weight: 650; }
.parent-dashboard__chart { display: block; width: 100%; height: 190px; overflow: visible; }
.parent-dashboard__chart-label { fill: #71809A; font-size: 10px; }
.parent-dashboard__chart-grid { stroke: #E9EFF7; stroke-width: 1; }
.parent-dashboard__chart-line { fill: none; stroke: ${C.blue}; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.parent-dashboard__chart-area { fill: url(#parentChartGradient); }
.parent-dashboard__chart-point { fill: ${C.blue}; stroke: white; stroke-width: 1.5; }

.parent-dashboard__bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.05fr) minmax(280px, 1fr);
  gap: 13px;
  margin-bottom: 12px;
}
.parent-dashboard__lessons-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.parent-dashboard__lesson {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #EAF0F7;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
}
.parent-dashboard__lesson:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(23,59,94,.09); }
.parent-dashboard__lesson-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 92px;
  overflow: hidden;
  background: linear-gradient(135deg, #E5F0FF, #C6DDF8);
}
.parent-dashboard__lesson-cover img { width: 100%; height: 100%; object-fit: cover; }
.parent-dashboard__lesson-cover-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: rgba(255,255,255,.8);
  font-size: 25px;
}
.parent-dashboard__lesson-body { padding: 9px; }
.parent-dashboard__lesson-title {
  display: -webkit-box;
  min-height: 32px;
  overflow: hidden;
  color: ${C.text};
  font-size: 10.5px;
  font-weight: 750;
  line-height: 1.5;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.parent-dashboard__lesson-type { display: flex; align-items: center; gap: 6px; margin-top: 5px; color: ${C.secondary}; font-size: 10px; }
.parent-dashboard__lesson-type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 6px;
}

.parent-dashboard__notification-list { display: flex; flex-direction: column; }
.parent-dashboard__notification {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 11px 0;
  border-bottom: 1px solid #EDF1F6;
}
.parent-dashboard__notification:last-child { border-bottom: none; }
.parent-dashboard__notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  background: ${C.blueLight};
  color: ${C.blue};
  font-size: 16px;
}
.parent-dashboard__notification-content { flex: 1; min-width: 0; }
.parent-dashboard__notification-title {
  display: block;
  overflow: hidden;
  color: ${C.text};
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.parent-dashboard__notification-description {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  color: ${C.secondary};
  font-size: 10px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.parent-dashboard__notification-date { align-self: flex-start; flex-shrink: 0; color: ${C.secondary}; font-size: 9px; }
.parent-dashboard__empty { padding: 18px 5px; }
.parent-dashboard__loading { padding: 20px; border-radius: 14px; background: white; }

@media (max-width: 1200px) {
  .parent-dashboard__hero-family { right: 12%; max-width: 40%; }
  .parent-dashboard__grid { grid-template-columns: minmax(240px, .9fr) minmax(0, 1.5fr); }
  .parent-dashboard__stats { gap: 7px; }
  .parent-dashboard__stat { padding: 10px; }
  .parent-dashboard__middle-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .parent-dashboard__middle-panel:last-child { grid-column: 1 / -1; }
}
@media (max-width: 900px) {
  .parent-dashboard__hero { min-height: 190px; padding: 25px; }
  .parent-dashboard__hero-content { width: 72%; }
  .parent-dashboard__hero-family { right: 3%; height: 78%; opacity: .8; }
  .parent-dashboard__grid { grid-template-columns: 1fr; }
  .parent-dashboard__stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .parent-dashboard__bottom-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .parent-dashboard__hero { min-height: 175px; padding: 22px 18px; margin-bottom: 13px; }
  .parent-dashboard__hero-content { width: 100%; }
  .parent-dashboard__hero-title { font-size: 24px !important; }
  .parent-dashboard__hero-subtitle { max-width: 90%; font-size: 12px; }
  .parent-dashboard__verse { max-width: 95%; margin-top: 11px; padding: 8px 10px; font-size: 10px; }
  .parent-dashboard__hero-family { right: -12px; height: 58%; max-width: 45%; opacity: .24; }
  .parent-dashboard__hero-church { width: 48%; opacity: .25; }
  .parent-dashboard__panel, .parent-dashboard__middle-panel,
  .parent-dashboard__lessons-panel, .parent-dashboard__notifications-panel { padding: 12px; }
  .parent-dashboard__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .parent-dashboard__stat { min-height: 125px; padding: 12px; }
  .parent-dashboard__middle-grid { grid-template-columns: 1fr; }
  .parent-dashboard__middle-panel:last-child { grid-column: auto; }
  .parent-dashboard__lessons-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .parent-dashboard__lesson-cover { height: 105px; }
}
@media (max-width: 360px) {
  .parent-dashboard__student { gap: 8px; padding: 8px; }
  .parent-dashboard__student-avatar { width: 40px !important; height: 40px !important; }
  .parent-dashboard__student-name { font-size: 12px; }
  .parent-dashboard__schedule-tag { display: none; }
  .parent-dashboard__attendance-row { grid-template-columns: 42px minmax(0, 1fr) auto; gap: 5px; }
}
@media (prefers-reduced-motion: reduce) {
  .parent-dashboard *, .parent-dashboard *::before, .parent-dashboard *::after { transition: none !important; }
}
`;

function getResponseData(response) {
  return response?.data?.data ?? response?.data ?? response ?? null;
}

function getField(object, ...keys) {
  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((current, part) => current?.[part], object);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

function getInitials(name) {
  const parts = String(name || "Học sinh")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function SectionHeader({ title, action, onClick, count }) {
  return (
    <div className="parent-dashboard__panel-header">
      <div className="parent-dashboard__panel-heading">
        <span className="parent-dashboard__panel-mark" />
        <Title level={5} className="parent-dashboard__panel-title">
          {title}
        </Title>
        {count !== undefined && (
          <Text type="secondary" style={{ fontSize: 10 }}>
            {count}
          </Text>
        )}
      </div>
      {action && (
        <Button
          type="text"
          className="parent-dashboard__action"
          onClick={onClick}
        >
          {action}
          <RightOutlined style={{ fontSize: 9 }} />
        </Button>
      )}
    </div>
  );
}

function StatCard({ variant, icon, value, label, caption }) {
  return (
    <div
      className={`parent-dashboard__stat parent-dashboard__stat--${variant}`}
    >
      <div className="parent-dashboard__stat-icon">{icon}</div>
      <div>
        <span className="parent-dashboard__stat-value">{value}</span>
        <span className="parent-dashboard__stat-label">{label}</span>
        {caption && (
          <span className="parent-dashboard__stat-caption">{caption}</span>
        )}
      </div>
    </div>
  );
}

function StudentCard({ student, onClick }) {
  const name = getField(student, "name", "full_name", "fullName") || "Học sinh";
  const apiAvatar = getField(student, "avatar", "avatar_url", "avatarUrl");
  const className =
    getField(student, "className", "class_name", "class.name") ||
    "Chưa cập nhật lớp";
  const status = getField(student, "status", "learningStatus") || "Đang học";

  return (
    <div
      className="parent-dashboard__student"
      onClick={onClick}
      onKeyDown={(event) => event.key === "Enter" && onClick?.()}
      role="button"
      tabIndex={0}
    >
      <Avatar
        size={70}
        src={apiAvatar || DASHBOARD_IMAGES.studentDefault}
        className="parent-dashboard__student-avatar"
        onError={() => true}
      >
        {!apiAvatar && getInitials(name)}
      </Avatar>
      <div className="parent-dashboard__student-info">
        <span className="parent-dashboard__student-name">{name}</span>
        <span className="parent-dashboard__student-class">{className}</span>
        <span className="parent-dashboard__student-status">{status}</span>
      </div>
      <RightOutlined className="parent-dashboard__student-arrow" />
    </div>
  );
}

function ScheduleList({ schedules }) {
  if (!schedules.length) {
    return (
      <div className="parent-dashboard__empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có lịch học sắp tới"
        />
      </div>
    );
  }

  return (
    <div className="parent-dashboard__schedule-list">
      {schedules.slice(0, 3).map((item, index) => {
        const dateValue = getField(item, "date", "startDate", "start_date");
        const date = dateValue ? new Date(dateValue) : null;
        const validDate = date && !Number.isNaN(date.getTime());
        const weekday = validDate
          ? new Intl.DateTimeFormat("vi-VN", { weekday: "short" })
              .format(date)
              .replace(".", "")
          : "Lịch học";
        const day = validDate
          ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`
          : formatDate(dateValue) || "--";
        const title =
          getField(item, "subject", "title", "name", "className") ||
          "Buổi học giáo lý";
        const time = getField(item, "time", "startTime", "start_time");
        const room = getField(item, "room", "location", "classroom");
        const status = getField(item, "status") || "Sắp diễn ra";

        return (
          <div
            className="parent-dashboard__schedule-item"
            key={item?.id ?? index}
          >
            <div className="parent-dashboard__schedule-date">
              <span className="parent-dashboard__schedule-weekday">
                {weekday}
              </span>
              <span className="parent-dashboard__schedule-day">{day}</span>
            </div>
            <div className="parent-dashboard__schedule-detail">
              <span className="parent-dashboard__schedule-name">{title}</span>
              <span className="parent-dashboard__schedule-meta">
                <ClockCircleOutlined />
                {time || "Chưa cập nhật giờ"}
              </span>
              <span className="parent-dashboard__schedule-meta">
                <EnvironmentOutlined />
                {room || "Chưa cập nhật địa điểm"}
              </span>
            </div>
            <span className="parent-dashboard__schedule-tag">{status}</span>
          </div>
        );
      })}
    </div>
  );
}

function ResultsChart({ results }) {
  const points = useMemo(
    () =>
      results
        .slice(-5)
        .map((item) => {
          const score = Number(
            getField(item, "score", "averageScore", "average_score", "value"),
          );
          return {
            label: getField(item, "label", "month", "date", "title") || "",
            score,
          };
        })
        .filter((item) => Number.isFinite(item.score)),
    [results],
  );

  if (!points.length) {
    return (
      <div className="parent-dashboard__empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có dữ liệu biểu đồ"
        />
      </div>
    );
  }

  const width = 340;
  const height = 185;
  const left = 27;
  const right = 8;
  const top = 12;
  const bottom = 29;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxValue = Math.max(10, ...points.map((point) => point.score));
  const coords = points.map((point, index) => {
    const x =
      points.length === 1
        ? left + chartWidth / 2
        : left + (index / (points.length - 1)) * chartWidth;
    const y = top + chartHeight - (point.score / maxValue) * chartHeight;
    return { ...point, x, y };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${left},${top + chartHeight} ${line} ${coords[coords.length - 1].x},${top + chartHeight}`;

  return (
    <div>
      <div className="parent-dashboard__chart-heading">
        Điểm trung bình theo thời gian
      </div>
      <svg
        className="parent-dashboard__chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Biểu đồ kết quả học tập"
      >
        <defs>
          <linearGradient id="parentChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.blue} stopOpacity=".22" />
            <stop offset="100%" stopColor={C.blue} stopOpacity=".015" />
          </linearGradient>
        </defs>
        {[0, 2, 4, 6, 8, 10].map((value) => {
          const y = top + chartHeight - (value / 10) * chartHeight;
          return (
            <g key={value}>
              <line
                className="parent-dashboard__chart-grid"
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
              />
              <text
                className="parent-dashboard__chart-label"
                x={left - 8}
                y={y + 3}
                textAnchor="end"
              >
                {value}
              </text>
            </g>
          );
        })}
        {coords.map((point, index) => (
          <line
            key={`grid-${index}`}
            className="parent-dashboard__chart-grid"
            x1={point.x}
            y1={top}
            x2={point.x}
            y2={top + chartHeight}
            opacity=".6"
          />
        ))}
        <polygon className="parent-dashboard__chart-area" points={area} />
        <polyline className="parent-dashboard__chart-line" points={line} />
        {coords.map((point, index) => (
          <g key={`point-${index}`}>
            <circle
              className="parent-dashboard__chart-point"
              cx={point.x}
              cy={point.y}
              r="3.8"
            />
            <text
              className="parent-dashboard__chart-label"
              x={point.x}
              y={height - 8}
              textAnchor="middle"
            >
              {String(point.label).length > 9
                ? String(point.label).slice(0, 8)
                : point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      const results = await Promise.allSettled([
        getDashboardParent(),
        parentApi.getMe(),
      ]);
      if (!active) return;

      const dashboardResult = results[0];
      const profileResult = results[1];

      if (dashboardResult.status === "fulfilled") {
        setDashboard(getResponseData(dashboardResult.value) || {});
      } else {
        setDashboard({});
        message.error(
          dashboardResult.reason?.response?.data?.message ||
            "Không thể tải dữ liệu dashboard",
        );
      }

      if (profileResult.status === "fulfilled") {
        setMe(getResponseData(profileResult.value) || {});
      } else {
        setMe({});
        message.error(
          profileResult.reason?.response?.data?.message ||
            "Không thể tải thông tin phụ huynh",
        );
      }

      setLoading(false);
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const students = useMemo(() => {
    return Array.isArray(dashboard?.students) ? dashboard.students : [];
  }, [dashboard?.students]);

  const schedules = Array.isArray(dashboard?.upcomingSchedules)
    ? dashboard.upcomingSchedules
    : Array.isArray(dashboard?.schedules)
      ? dashboard.schedules
      : dashboard?.upcomingSchedule &&
          Object.keys(dashboard.upcomingSchedule).length
        ? [dashboard.upcomingSchedule]
        : [];

  const resultHistory = Array.isArray(dashboard?.resultHistory)
    ? dashboard.resultHistory
    : Array.isArray(dashboard?.resultsHistory)
      ? dashboard.resultsHistory
      : Array.isArray(dashboard?.results)
        ? dashboard.results
        : [];

  const latestResult = dashboard?.latestResult || {};
  const averageScore = getField(
    dashboard,
    "averageScore",
    "average_score",
    "averageResult",
  );
  const resultScore =
    averageScore ??
    getField(latestResult, "score", "averageScore", "average_score");
  const certificateCount = getField(
    dashboard,
    "certificateCount",
    "certificatesCount",
    "certificate_count",
  );
  const fullName =
    getField(me, "full_name", "fullName", "name", "username") || "Phụ huynh";

  const attendanceAverage = useMemo(() => {
    const values = students
      .map((student) =>
        Number(
          getField(student, "attendanceRate", "attendance_rate", "attendance"),
        ),
      )
      .filter((value) => Number.isFinite(value) && value >= 0);

    if (values.length)
      return Math.round(
        values.reduce((sum, value) => sum + value, 0) / values.length,
      );

    const value = Number(
      getField(
        dashboard,
        "attendanceRate",
        "attendance_rate",
        "attendancePercentage",
      ),
    );
    return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
  }, [students, dashboard]);

  if (loading) {
    return (
      <div className="parent-dashboard">
        <style>{CSS}</style>
        <div className="parent-dashboard__loading">
          <Skeleton active paragraph={{ rows: 2 }} />
          <Row gutter={[14, 14]}>
            <Col span={8}>
              <Skeleton active />
            </Col>
            <Col span={16}>
              <Skeleton active />
            </Col>
          </Row>
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="parent-dashboard">
      <style>{CSS}</style>

      {/* Hero banner: generated image files are expected in public/images/parent-dashboard */}
      <section className="parent-dashboard__hero">
        <img
          className="parent-dashboard__hero-church"
          src={DASHBOARD_IMAGES.heroChurch}
          alt=""
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="parent-dashboard__hero-content">
          <Title level={1} className="parent-dashboard__hero-title">
            Xin Chào! {fullName}!
          </Title>
          <Text className="parent-dashboard__hero-subtitle">
            Cùng FaithEdu đồng hành với con trong hành trình học giáo lý và
            trưởng thành trong đức tin.
          </Text>
          <div className="parent-dashboard__verse">
            <BookOutlined />
            <span>“Hãy để trẻ em đến với Thầy...” (Mc 10, 14)</span>
          </div>
        </div>

        <img
          className="parent-dashboard__hero-family"
          src={DASHBOARD_IMAGES.heroFamily}
          alt="Gia đình đồng hành cùng con trên hành trình đức tin"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </section>

      {/* Student list and four summary cards */}
      <section className="parent-dashboard__grid">
        <div className="parent-dashboard__panel">
          <SectionHeader
            title="Con của tôi"
            action="Thêm con"
            onClick={() => navigate("/parent/students")}
            count={students.length || undefined}
          />
          {students.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {students.slice(0, 2).map((student, index) => {
                const id =
                  student?.id ?? student?.studentId ?? student?.student_id;
                return (
                  <StudentCard
                    key={id ?? index}
                    student={student}
                    onClick={() =>
                      navigate(
                        id ? `/parent/children/${id}` : "/parent/students",
                      )
                    }
                  />
                );
              })}
              {students.length > 2 && (
                <Button
                  type="link"
                  onClick={() => navigate("/parent/students")}
                  style={{ padding: 0, alignSelf: "flex-start", fontSize: 11 }}
                >
                  Xem thêm {students.length - 2} học sinh
                </Button>
              )}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có thông tin học sinh"
            />
          )}
        </div>

        <div className="parent-dashboard__panel">
          <div className="parent-dashboard__stats">
            <StatCard
              variant="green"
              icon={<BookOutlined />}
              value={
                attendanceAverage === null ? "--" : `${attendanceAverage}%`
              }
              label="Điểm danh"
              caption={
                getField(dashboard, "attendedSessions", "attended_sessions") !=
                null
                  ? `${getField(dashboard, "attendedSessions", "attended_sessions")} buổi đã tham gia`
                  : "Tỷ lệ chuyên cần"
              }
            />
            <StatCard
              variant="blue"
              icon={<BarChartOutlined />}
              value={resultScore == null ? "--" : resultScore}
              label="Điểm trung bình"
              caption="Kết quả học tập"
            />
            <StatCard
              variant="yellow"
              icon={<TrophyOutlined />}
              value={
                getField(dashboard, "learningStatus", "learning_status") ||
                "Theo dõi"
              }
              label="Kết quả học tập"
              caption="Tiến bộ của con"
            />
            <StatCard
              variant="red"
              icon={<FileTextOutlined />}
              value={certificateCount == null ? "--" : certificateCount}
              label="Chứng chỉ"
              caption="Đã được cấp"
            />
          </div>
        </div>
      </section>

      {/* Upcoming schedule, recent attendance and result chart */}
      <section className="parent-dashboard__middle-grid">
        <div className="parent-dashboard__middle-panel">
          <SectionHeader
            title="Lịch học sắp tới"
            action="Xem tất cả"
            onClick={() => navigate("/parent/schedule")}
          />
          <ScheduleList schedules={schedules} />
        </div>

        <div className="parent-dashboard__middle-panel">
          <SectionHeader
            title="Kết quả học tập"
            action="Chi tiết"
            onClick={() => navigate("/parent/results")}
          />
          <ResultsChart results={resultHistory} />
          {resultScore != null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                marginTop: 5,
                color: C.secondary,
                fontSize: 10,
              }}
            >
              <span>Kết quả gần nhất</span>
              <Tag color="blue" style={{ margin: 0, fontWeight: 700 }}>
                {resultScore}
              </Tag>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
