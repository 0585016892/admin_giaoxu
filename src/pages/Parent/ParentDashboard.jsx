import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Empty,
  Progress,
  Skeleton,
  Typography,
  message,
} from "antd";
import {
  ArrowRightOutlined,
  BarChartOutlined,
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  HeartFilled,
  ReadOutlined,
  RightOutlined,
  TrophyFilled,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { getDashboardParent } from "../../api/dashboardApi";
import parentApi from "../../api/parentApi";

const { Title, Text } = Typography;

/* =========================================================
   FAITHEDU FAMILY
   DESIGN SYSTEM
========================================================= */

const C = {
  navy: "#173B5E",
  navyDark: "#102A43",
  navySoft: "#EEF3F7",
  navyLight: "#F5F8FB",

  gold: "#D9A441",
  goldDark: "#B98524",
  goldSoft: "#F4E7C1",
  cream: "#FFF9EE",

  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#243447",
  textDark: "#172B3E",
  secondary: "#64748B",
  muted: "#94A3B8",

  border: "#E2E8F0",

  green: "#2E7D5B",
  greenBg: "#ECF8F1",

  blue: "#466F92",
  blueBg: "#EEF5FA",

  orange: "#C58A22",
  orangeBg: "#FFF7E5",

  red: "#C94C4C",
  redBg: "#FFF1F1",

  purple: "#8065A9",
  purpleBg: "#F4F0FA",
};

/* =========================================================
   IMAGE CONFIG
========================================================= */

const DASHBOARD_IMAGES = {
  heroFamily: "/images/parent-dashboard/hero-family.png",
  heroChurch: "/images/parent-dashboard/hero-church.png",
  studentDefault: "/images/parent-dashboard/student-default.png",
  lessonDefault: "/images/parent-dashboard/lesson-default.png",
};

/* =========================================================
   CSS
========================================================= */

const CSS = `
/* =========================================================
   ROOT
========================================================= */

.parent-dashboard {
  --fe-navy: ${C.navy};
  --fe-navy-dark: ${C.navyDark};
  --fe-gold: ${C.gold};
  --fe-cream: ${C.cream};

  width: 100%;
  min-width: 0;
  color: ${C.text};
  font-family:
    "Be Vietnam Pro",
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.parent-dashboard *,
.parent-dashboard *::before,
.parent-dashboard *::after {
  box-sizing: border-box;
}

.parent-dashboard button {
  font-family: inherit;
}

/* =========================================================
   PAGE
========================================================= */

.fe-home {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
}

/* =========================================================
   TOP GREETING
========================================================= */

.fe-home-greeting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 18px;
}

.fe-home-greeting__left {
  min-width: 0;
}

.fe-home-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;

  margin-bottom: 5px;

  color: ${C.goldDark};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.fe-home-eyebrow .anticon {
  font-size: 13px;
}

.fe-home-title {
  margin: 0 !important;

  color: ${C.navyDark} !important;
  font-family:
    "Be Vietnam Pro",
    Inter,
    sans-serif !important;

  font-size: clamp(24px, 2.2vw, 32px) !important;
  line-height: 1.25 !important;
  font-weight: 800 !important;
  letter-spacing: -.6px;
}

.fe-home-description {
  display: block;

  max-width: 650px;
  margin-top: 7px;

  color: ${C.secondary};
  font-size: 13px;
  line-height: 1.7;
}

.fe-home-date {
  display: flex;
  align-items: center;
  gap: 8px;

  flex-shrink: 0;

  padding: 9px 13px;

  border: 1px solid ${C.border};
  border-radius: 12px;

  background: ${C.white};

  color: ${C.secondary};
  font-size: 11px;
  font-weight: 600;

  box-shadow: 0 5px 18px rgba(23, 59, 94, .04);
}

.fe-home-date .anticon {
  color: ${C.gold};
}

/* =========================================================
   HERO
========================================================= */

.fe-home-hero {
  position: relative;
  isolation: isolate;

  min-height: 220px;

  margin-bottom: 18px;

  overflow: hidden;

  border-radius: 24px;

  background:
    radial-gradient(
      circle at 75% 20%,
      rgba(217,164,65,.20),
      transparent 27%
    ),
    linear-gradient(
      120deg,
      ${C.navyDark} 0%,
      ${C.navy} 55%,
      #234F73 100%
    );

  box-shadow:
    0 14px 40px rgba(16, 42, 67, .13);
}

.fe-home-hero::before {
  content: "";

  position: absolute;
  z-index: 0;

  right: -90px;
  bottom: -130px;

  width: 470px;
  height: 270px;

  border-radius: 50%;

  background: rgba(217,164,65,.13);
}

.fe-home-hero::after {
  content: "";

  position: absolute;
  z-index: 0;

  left: 38%;
  bottom: -100px;

  width: 300px;
  height: 190px;

  border-radius: 50%;

  border: 1px solid rgba(255,255,255,.08);
}

.fe-home-hero__content {
  position: relative;
  z-index: 5;

  width: 57%;

  padding: 32px 34px;
}

.fe-home-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  margin-bottom: 12px;
  padding: 6px 10px;

  border: 1px solid rgba(255,255,255,.18);
  border-radius: 999px;

  background: rgba(255,255,255,.09);

  color: #F7E8BE;

  font-size: 10px;
  font-weight: 700;
}

.fe-home-hero__badge .anticon {
  color: ${C.gold};
}

.fe-home-hero__title {
  margin: 0 !important;

  color: white !important;

  font-family:
    "Be Vietnam Pro",
    Inter,
    sans-serif !important;

  font-size: clamp(25px, 2.5vw, 37px) !important;
  line-height: 1.22 !important;

  font-weight: 800 !important;
  letter-spacing: -.8px;
}

.fe-home-hero__subtitle {
  display: block;

  max-width: 570px;

  margin-top: 10px;

  color: rgba(255,255,255,.78);

  font-size: 13px;
  line-height: 1.75;
}

.fe-home-hero__verse {
  display: flex;
  align-items: center;
  gap: 9px;

  width: fit-content;
  max-width: 100%;

  margin-top: 17px;
  padding: 9px 12px;

  border: 1px solid rgba(217,164,65,.25);
  border-radius: 11px;

  background: rgba(255,255,255,.07);

  color: #F7E8BE;

  font-size: 10px;
  font-style: italic;
  line-height: 1.5;
}

.fe-home-hero__verse .anticon {
  flex-shrink: 0;

  color: ${C.gold};

  font-size: 17px;
}

.fe-home-hero__family {
  position: absolute;
  z-index: 3;

  right: 4%;
  bottom: 0;

  width: auto;
  height: 97%;
  max-width: 46%;

  object-fit: contain;
  object-position: bottom;

  filter: drop-shadow(
    0 12px 18px rgba(0,0,0,.10)
  );
}

.fe-home-hero__church {
  position: absolute;
  z-index: 1;

  right: 0;
  bottom: 0;

  width: 35%;
  height: 100%;

  object-fit: cover;

  opacity: .16;

  -webkit-mask-image:
    linear-gradient(to right, transparent, black 35%);

  mask-image:
    linear-gradient(to right, transparent, black 35%);
}

/* =========================================================
   SECTION
========================================================= */

.fe-section {
  margin-bottom: 18px;
}

.fe-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  margin-bottom: 10px;
}

.fe-section-heading {
  display: flex;
  align-items: center;
  gap: 9px;

  min-width: 0;
}

.fe-section-heading__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  flex-shrink: 0;

  border-radius: 10px;

  background: ${C.cream};

  color: ${C.goldDark};

  font-size: 15px;
}

.fe-section-title {
  margin: 0 !important;

  color: ${C.navyDark} !important;

  font-size: 16px !important;
  line-height: 1.4 !important;
  font-weight: 800 !important;
}

.fe-section-subtitle {
  display: block;

  margin-top: 1px;

  color: ${C.muted};

  font-size: 10px;
}

.fe-section-action {
  display: inline-flex !important;
  align-items: center;
  gap: 5px;

  padding: 5px 0 !important;

  color: ${C.navy} !important;

  font-size: 11px !important;
  font-weight: 700 !important;
}

.fe-section-action:hover {
  color: ${C.goldDark} !important;
}

/* =========================================================
   CHILDREN
========================================================= */

.fe-children-shell {
  padding: 16px;

  border: 1px solid ${C.border};
  border-radius: 18px;

  background: ${C.white};

  box-shadow:
    0 7px 24px rgba(23,59,94,.045);
}

.fe-children-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 11px;
}

.fe-child-card {
  position: relative;

  display: flex;
  align-items: center;

  min-width: 0;

  padding: 13px;

  border: 1px solid ${C.border};
  border-radius: 15px;

  background:
    linear-gradient(
      135deg,
      #FFFFFF 0%,
      #FBFCFE 100%
    );

  cursor: pointer;

  transition:
    transform .2s ease,
    border-color .2s ease,
    box-shadow .2s ease;
}

.fe-child-card:hover {
  transform: translateY(-2px);

  border-color: #D4C08A;

  box-shadow:
    0 9px 22px rgba(23,59,94,.08);
}

.fe-child-card__avatar {
  flex-shrink: 0;

  border: 3px solid ${C.cream};

  background: ${C.navySoft};

  color: ${C.navy};

  font-weight: 800;
}

.fe-child-card__info {
  flex: 1;
  min-width: 0;

  margin-left: 11px;
}

.fe-child-card__name {
  display: block;

  overflow: hidden;

  color: ${C.textDark};

  font-size: 13px;
  font-weight: 800;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.fe-child-card__class {
  display: block;

  margin-top: 4px;

  overflow: hidden;

  color: ${C.secondary};

  font-size: 10px;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.fe-child-card__status {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  margin-top: 7px;
  padding: 3px 7px;

  border-radius: 999px;

  background: ${C.greenBg};

  color: ${C.green};

  font-size: 9px;
  font-weight: 700;
}

.fe-child-card__status .anticon {
  font-size: 8px;
}

.fe-child-card__arrow {
  flex-shrink: 0;

  color: ${C.muted};

  transition: transform .2s ease;
}

.fe-child-card:hover .fe-child-card__arrow {
  color: ${C.goldDark};

  transform: translateX(3px);
}

.fe-add-child {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  min-height: 92px;

  border: 1px dashed #D7C58D;
  border-radius: 15px;

  background: ${C.cream};

  color: ${C.goldDark};

  cursor: pointer;

  transition:
    background .2s ease,
    border-color .2s ease;
}

.fe-add-child:hover {
  background: #FFF5DD;
  border-color: ${C.gold};
}

.fe-add-child__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 29px;
  height: 29px;

  border-radius: 50%;

  background: ${C.white};

  font-size: 14px;
}

/* =========================================================
   JOURNEY STATS
========================================================= */

.fe-journey {
  display: grid;

  grid-template-columns:
    1.25fr
    repeat(3, minmax(0, 1fr));

  gap: 11px;
}

.fe-journey-main {
  position: relative;

  min-width: 0;

  padding: 16px;

  overflow: hidden;

  border-radius: 18px;

  background:
    linear-gradient(
      135deg,
      ${C.navyDark},
      ${C.navy}
    );

  color: white;

  box-shadow:
    0 8px 22px rgba(23,59,94,.10);
}

.fe-journey-main::after {
  content: "";

  position: absolute;

  right: -35px;
  bottom: -50px;

  width: 150px;
  height: 150px;

  border-radius: 50%;

  background: rgba(217,164,65,.13);
}

.fe-journey-main__top {
  position: relative;
  z-index: 1;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 10px;
}

.fe-journey-main__label {
  color: rgba(255,255,255,.68);

  font-size: 10px;
  font-weight: 700;
}

.fe-journey-main__value {
  display: block;

  margin-top: 4px;

  color: white;

  font-size: 27px;
  line-height: 1;

  font-weight: 800;
}

.fe-journey-main__caption {
  display: block;

  margin-top: 6px;

  color: rgba(255,255,255,.63);

  font-size: 9px;
}

.fe-journey-main__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 38px;
  height: 38px;

  border-radius: 12px;

  background: rgba(255,255,255,.10);

  color: ${C.gold};

  font-size: 19px;
}

.fe-journey-progress {
  position: relative;
  z-index: 1;

  margin-top: 14px;
}

.fe-journey-progress .ant-progress-inner {
  background: rgba(255,255,255,.12) !important;
}

.fe-journey-progress .ant-progress-bg {
  background: ${C.gold} !important;
}

.fe-journey-stat {
  display: flex;
  flex-direction: column;

  min-width: 0;

  min-height: 136px;

  padding: 14px;

  border: 1px solid ${C.border};
  border-radius: 17px;

  background: ${C.white};

  box-shadow:
    0 6px 20px rgba(23,59,94,.035);
}

.fe-journey-stat__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 35px;
  height: 35px;

  border-radius: 10px;

  font-size: 17px;
}

.fe-journey-stat--score .fe-journey-stat__icon {
  background: ${C.blueBg};
  color: ${C.blue};
}

.fe-journey-stat--result .fe-journey-stat__icon {
  background: ${C.goldSoft};
  color: ${C.goldDark};
}

.fe-journey-stat--certificate .fe-journey-stat__icon {
  background: ${C.purpleBg};
  color: ${C.purple};
}

.fe-journey-stat__value {
  display: block;

  margin-top: auto;

  color: ${C.textDark};

  font-size: 20px;
  font-weight: 800;

  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.fe-journey-stat__label {
  display: block;

  margin-top: 3px;

  color: ${C.text};

  font-size: 10px;
  font-weight: 700;
}

.fe-journey-stat__caption {
  display: block;

  margin-top: 2px;

  color: ${C.muted};

  font-size: 9px;
}

/* =========================================================
   TWO COLUMN AREA
========================================================= */

.fe-main-grid {
  display: grid;

  grid-template-columns:
    minmax(0, 1.35fr)
    minmax(320px, .85fr);

  gap: 18px;

  align-items: start;
}

/* =========================================================
   CARD
========================================================= */

.fe-card {
  min-width: 0;

  padding: 16px;

  border: 1px solid ${C.border};
  border-radius: 18px;

  background: ${C.white};

  box-shadow:
    0 7px 24px rgba(23,59,94,.035);
}

/* =========================================================
   SCHEDULE
========================================================= */

.fe-schedule {
  display: flex;
  flex-direction: column;

  gap: 8px;
}

.fe-schedule-item {
  position: relative;

  display: grid;

  grid-template-columns: 57px minmax(0, 1fr) auto;

  align-items: center;

  gap: 11px;

  padding: 9px;

  border-radius: 13px;

  background: ${C.background};

  transition:
    background .2s ease,
    transform .2s ease;
}

.fe-schedule-item:hover {
  background: ${C.navySoft};

  transform: translateX(2px);
}

.fe-schedule-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 61px;

  border-radius: 11px;

  background: ${C.cream};

  color: ${C.goldDark};
}

.fe-schedule-weekday {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
}

.fe-schedule-day {
  margin-top: 2px;

  font-size: 17px;
  line-height: 1;

  font-weight: 800;
}

.fe-schedule-detail {
  min-width: 0;
}

.fe-schedule-name {
  display: block;

  overflow: hidden;

  color: ${C.textDark};

  font-size: 11px;
  font-weight: 800;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.fe-schedule-meta {
  display: flex;
  align-items: center;
  gap: 5px;

  margin-top: 5px;

  color: ${C.secondary};

  font-size: 9px;
}

.fe-schedule-meta .anticon {
  color: ${C.goldDark};
}

.fe-schedule-tag {
  flex-shrink: 0;

  padding: 5px 7px;

  border-radius: 999px;

  background: ${C.navySoft};

  color: ${C.navy};

  font-size: 8px;
  font-weight: 700;
}

/* =========================================================
   RESULT
========================================================= */

.fe-result-card {
  position: relative;

  overflow: hidden;

  min-height: 250px;

  padding: 18px;

  border-radius: 18px;

  background:
    linear-gradient(
      145deg,
      #FFFDF7,
      ${C.cream}
    );

  border: 1px solid #EFE4C8;
}

.fe-result-card__glow {
  position: absolute;

  right: -55px;
  top: -55px;

  width: 160px;
  height: 160px;

  border-radius: 50%;

  background: rgba(217,164,65,.10);
}

.fe-result-card__content {
  position: relative;
  z-index: 1;
}

.fe-result-score {
  display: flex;
  align-items: center;

  gap: 14px;

  margin: 13px 0 16px;
}

.fe-result-score__circle {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 82px;
  height: 82px;

  flex-shrink: 0;

  border-radius: 50%;

  background: white;

  box-shadow:
    0 5px 18px rgba(185,133,36,.10);
}

.fe-result-score__circle .ant-progress {
  position: absolute;
}

.fe-result-score__number {
  position: relative;
  z-index: 2;

  color: ${C.navyDark};

  font-size: 20px;
  font-weight: 800;
}

.fe-result-score__label {
  color: ${C.secondary};

  font-size: 10px;
  line-height: 1.5;
}

.fe-result-score__title {
  display: block;

  margin-bottom: 3px;

  color: ${C.textDark};

  font-size: 13px;
  font-weight: 800;
}

.fe-result-mini {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 8px;
}

.fe-result-mini__item {
  padding: 10px;

  border: 1px solid rgba(217,164,65,.16);
  border-radius: 11px;

  background: rgba(255,255,255,.72);
}

.fe-result-mini__label {
  display: block;

  color: ${C.muted};

  font-size: 8px;
}

.fe-result-mini__value {
  display: block;

  margin-top: 3px;

  color: ${C.navy};

  font-size: 13px;
  font-weight: 800;
}

/* =========================================================
   BOTTOM INFORMATION
========================================================= */

.fe-bottom-grid {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    minmax(300px, .8fr);

  gap: 18px;

  margin-top: 18px;
}

.fe-faith-card {
  position: relative;

  min-height: 140px;

  overflow: hidden;

  padding: 19px;

  border-radius: 18px;

  background:
    linear-gradient(
      135deg,
      ${C.navyDark},
      ${C.navy}
    );

  color: white;
}

.fe-faith-card::after {
  content: "✝";

  position: absolute;

  right: 25px;
  bottom: -18px;

  color: rgba(217,164,65,.13);

  font-size: 100px;
  line-height: 1;
}

.fe-faith-card__label {
  position: relative;
  z-index: 1;

  color: ${C.gold};

  font-size: 9px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.fe-faith-card__title {
  position: relative;
  z-index: 1;

  display: block;

  margin-top: 7px;

  color: white;

  font-size: 16px;
  font-weight: 800;
}

.fe-faith-card__text {
  position: relative;
  z-index: 1;

  display: block;

  max-width: 520px;

  margin-top: 7px;

  color: rgba(255,255,255,.68);

  font-size: 10px;
  line-height: 1.65;
}

.fe-faith-card__verse {
  position: relative;
  z-index: 1;

  display: inline-flex;
  align-items: center;
  gap: 6px;

  margin-top: 10px;

  color: #F7E8BE;

  font-size: 9px;
  font-style: italic;
}

.fe-notice-card {
  padding: 18px;

  border: 1px solid ${C.border};
  border-radius: 18px;

  background: ${C.white};

  box-shadow:
    0 7px 24px rgba(23,59,94,.035);
}

.fe-notice-card__item {
  display: flex;
  align-items: flex-start;

  gap: 10px;
}

.fe-notice-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 35px;
  height: 35px;

  flex-shrink: 0;

  border-radius: 10px;

  background: ${C.navySoft};

  color: ${C.navy};

  font-size: 15px;
}

.fe-notice-card__title {
  display: block;

  color: ${C.textDark};

  font-size: 11px;
  font-weight: 800;
}

.fe-notice-card__text {
  display: block;

  margin-top: 4px;

  color: ${C.secondary};

  font-size: 9px;
  line-height: 1.6;
}

/* =========================================================
   EMPTY
========================================================= */

.fe-empty {
  padding: 24px 10px;
}

/* =========================================================
   LOADING
========================================================= */

.fe-loading {
  padding: 18px;

  border: 1px solid ${C.border};
  border-radius: 18px;

  background: white;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1150px) {
  .fe-home-hero__content {
    width: 63%;
  }

  .fe-home-hero__family {
    right: 1%;
    max-width: 43%;
  }

  .fe-journey {
    grid-template-columns:
      1.15fr
      repeat(3, minmax(0, 1fr));
  }

  .fe-main-grid {
    grid-template-columns:
      minmax(0, 1fr)
      minmax(290px, .8fr);
  }
}

@media (max-width: 900px) {
  .fe-home-hero {
    min-height: 205px;
  }

  .fe-home-hero__content {
    width: 70%;
    padding: 27px;
  }

  .fe-home-hero__family {
    right: -5%;
    height: 82%;
    opacity: .68;
  }

  .fe-journey {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .fe-journey-main {
    grid-column: 1 / -1;
  }

  .fe-main-grid,
  .fe-bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .fe-home-greeting {
    align-items: flex-start;
  }

  .fe-home-date {
    display: none;
  }

  .fe-home-title {
    font-size: 23px !important;
  }

  .fe-home-description {
    font-size: 11px;
    line-height: 1.6;
  }

  .fe-home-hero {
    min-height: 235px;

    margin-bottom: 14px;

    border-radius: 20px;
  }

  .fe-home-hero__content {
    width: 100%;

    padding: 23px 19px;
  }

  .fe-home-hero__badge {
    margin-bottom: 9px;
  }

  .fe-home-hero__title {
    max-width: 80%;

    font-size: 25px !important;
  }

  .fe-home-hero__subtitle {
    max-width: 82%;

    font-size: 11px;
  }

  .fe-home-hero__verse {
    max-width: 75%;

    font-size: 9px;
  }

  .fe-home-hero__family {
    right: -8px;
    bottom: -3px;

    width: auto;
    height: 56%;
    max-width: 52%;

    opacity: .48;
  }

  .fe-home-hero__church {
    width: 60%;

    opacity: .12;
  }

  .fe-section {
    margin-bottom: 14px;
  }

  .fe-section-title {
    font-size: 14px !important;
  }

  .fe-section-heading__icon {
    width: 29px;
    height: 29px;
  }

  .fe-children-shell {
    padding: 11px;

    border-radius: 15px;
  }

  .fe-children-grid {
    grid-template-columns: 1fr;

    gap: 8px;
  }

  .fe-child-card {
    padding: 10px;
  }

  .fe-add-child {
    min-height: 60px;
  }

  .fe-journey {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 8px;
  }

  .fe-journey-main {
    grid-column: 1 / -1;

    min-height: 145px;
  }

  .fe-journey-stat {
    min-height: 120px;

    padding: 12px;
  }

  .fe-journey-stat__value {
    font-size: 17px;
  }

  .fe-card {
    padding: 12px;

    border-radius: 15px;
  }

  .fe-schedule-item {
    grid-template-columns:
      49px minmax(0, 1fr);

    gap: 9px;
  }

  .fe-schedule-date {
    min-height: 55px;
  }

  .fe-schedule-tag {
    display: none;
  }

  .fe-result-card {
    min-height: auto;

    padding: 15px;
  }

  .fe-bottom-grid {
    gap: 12px;
  }
}

@media (max-width: 380px) {
  .fe-home-hero__title {
    max-width: 78%;

    font-size: 22px !important;
  }

  .fe-home-hero__subtitle {
    max-width: 75%;
  }

  .fe-home-hero__family {
    height: 49%;
    opacity: .38;
  }

  .fe-journey-main__value {
    font-size: 24px;
  }

  .fe-result-score__circle {
    width: 72px;
    height: 72px;
  }

  .fe-result-score__number {
    font-size: 18px;
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

function getResponseData(response) {
  return response?.data?.data ?? response?.data ?? response ?? null;
}

function getField(object, ...keys) {
  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((current, part) => current?.[part], object);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function getInitials(name) {
  const parts = String(name || "Học sinh")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "HS";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[parts.length - 2][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatFullDate() {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ title, subtitle, icon, action, onClick }) {
  return (
    <div className="fe-section-header">
      <div className="fe-section-heading">
        <span className="fe-section-heading__icon">{icon}</span>

        <div>
          <Title level={5} className="fe-section-title">
            {title}
          </Title>

          {subtitle && <span className="fe-section-subtitle">{subtitle}</span>}
        </div>
      </div>

      {action && (
        <Button type="text" className="fe-section-action" onClick={onClick}>
          {action}

          <ArrowRightOutlined style={{ fontSize: 9 }} />
        </Button>
      )}
    </div>
  );
}

/* =========================================================
   CHILD CARD
========================================================= */

function ChildCard({ student, onClick }) {
  const name = getField(student, "name", "full_name", "fullName") || "Học sinh";

  const avatar = getField(student, "avatar", "avatar_url", "avatarUrl");

  const className =
    getField(student, "className", "class_name", "class.name") ||
    "Chưa cập nhật lớp";

  const status = getField(student, "status", "learningStatus") || "Đang học";

  return (
    <div
      className="fe-child-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onClick?.();
        }
      }}
    >
      <Avatar
        size={54}
        src={avatar || DASHBOARD_IMAGES.studentDefault}
        className="fe-child-card__avatar"
        icon={!avatar ? <UserOutlined /> : undefined}
      >
        {!avatar && getInitials(name)}
      </Avatar>

      <div className="fe-child-card__info">
        <span className="fe-child-card__name">{name}</span>

        <span className="fe-child-card__class">{className}</span>

        <span className="fe-child-card__status">
          <CheckCircleFilled />
          {status}
        </span>
      </div>

      <RightOutlined className="fe-child-card__arrow" />
    </div>
  );
}

/* =========================================================
   SCHEDULE
========================================================= */

function ScheduleList({ schedules }) {
  if (!schedules.length) {
    return (
      <div className="fe-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có lịch học sắp tới"
        />
      </div>
    );
  }

  return (
    <div className="fe-schedule">
      {schedules.slice(0, 4).map((item, index) => {
        const dateValue = getField(item, "date", "startDate", "start_date");

        const date = dateValue ? new Date(dateValue) : null;

        const validDate = date && !Number.isNaN(date.getTime());

        const weekday = validDate
          ? new Intl.DateTimeFormat("vi-VN", {
              weekday: "short",
            })
              .format(date)
              .replace(".", "")
          : "Lịch";

        const day = validDate
          ? `${String(date.getDate()).padStart(2, "0")}/${String(
              date.getMonth() + 1,
            ).padStart(2, "0")}`
          : formatDate(dateValue) || "--";

        const title =
          getField(item, "subject", "title", "name", "className") ||
          "Buổi học giáo lý";

        const time = getField(item, "time", "startTime", "start_time");

        const room = getField(item, "room", "location", "classroom");

        const status = getField(item, "status") || "Sắp diễn ra";

        return (
          <div className="fe-schedule-item" key={item?.id ?? index}>
            <div className="fe-schedule-date">
              <span className="fe-schedule-weekday">{weekday}</span>

              <span className="fe-schedule-day">{day}</span>
            </div>

            <div className="fe-schedule-detail">
              <span className="fe-schedule-name">{title}</span>

              <span className="fe-schedule-meta">
                <ClockCircleOutlined />
                {time || "Chưa cập nhật giờ"}
              </span>

              <span className="fe-schedule-meta">
                <EnvironmentOutlined />
                {room || "Chưa cập nhật địa điểm"}
              </span>
            </div>

            <span className="fe-schedule-tag">{status}</span>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   RESULT CARD
========================================================= */

function ResultCard({ resultScore, resultHistory, certificateCount }) {
  const numericScore = resultScore != null ? Number(resultScore) : null;

  const validScore = Number.isFinite(numericScore)
    ? Math.max(0, Math.min(10, numericScore))
    : 0;

  const progress = (validScore / 10) * 100;

  const latest = resultHistory.length
    ? resultHistory[resultHistory.length - 1]
    : null;

  const latestLabel =
    getField(latest, "label", "month", "date", "title") || "Gần đây";

  return (
    <div className="fe-result-card">
      <div className="fe-result-card__glow" />

      <div className="fe-result-card__content">
        <SectionHeader
          title="Kết quả học tập"
          subtitle="Theo dõi hành trình tiến bộ của con"
          icon={<BarChartOutlined />}
        />

        <div className="fe-result-score">
          <div className="fe-result-score__circle">
            <Progress
              type="circle"
              percent={progress}
              size={82}
              strokeWidth={7}
              strokeColor={C.gold}
              trailColor="#F0E8D4"
              showInfo={false}
            />

            <span className="fe-result-score__number">
              {resultScore == null ? "--" : resultScore}
            </span>
          </div>

          <div>
            <span className="fe-result-score__title">Điểm trung bình</span>

            <span className="fe-result-score__label">
              {resultScore == null
                ? "Chưa có kết quả"
                : "Kết quả hiện tại của con"}
            </span>
          </div>
        </div>

        <div className="fe-result-mini">
          <div className="fe-result-mini__item">
            <span className="fe-result-mini__label">Kết quả gần nhất</span>

            <span className="fe-result-mini__value">{latestLabel}</span>
          </div>

          <div className="fe-result-mini__item">
            <span className="fe-result-mini__label">Chứng chỉ</span>

            <span className="fe-result-mini__value">
              {certificateCount == null ? "--" : certificateCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function ParentDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);

  const [me, setMe] = useState(null);

  const [loading, setLoading] = useState(true);

  /* =======================================================
     LOAD DATA
  ======================================================= */

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

      /* DASHBOARD */

      if (dashboardResult.status === "fulfilled") {
        setDashboard(getResponseData(dashboardResult.value) || {});
      } else {
        setDashboard({});

        message.error(
          dashboardResult.reason?.response?.data?.message ||
            "Không thể tải dữ liệu dashboard",
        );
      }

      /* PROFILE */

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

  /* =======================================================
     DATA
  ======================================================= */

  const students = useMemo(() => {
    return Array.isArray(dashboard?.students) ? dashboard.students : [];
  }, [dashboard?.students]);

  const schedules = useMemo(() => {
    if (Array.isArray(dashboard?.upcomingSchedules)) {
      return dashboard.upcomingSchedules;
    }

    if (Array.isArray(dashboard?.schedules)) {
      return dashboard.schedules;
    }

    if (
      dashboard?.upcomingSchedule &&
      Object.keys(dashboard.upcomingSchedule).length
    ) {
      return [dashboard.upcomingSchedule];
    }

    return [];
  }, [dashboard]);

  const resultHistory = useMemo(() => {
    if (Array.isArray(dashboard?.resultHistory)) {
      return dashboard.resultHistory;
    }

    if (Array.isArray(dashboard?.resultsHistory)) {
      return dashboard.resultsHistory;
    }

    if (Array.isArray(dashboard?.results)) {
      return dashboard.results;
    }

    return [];
  }, [dashboard]);

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

  const learningStatus =
    getField(dashboard, "learningStatus", "learning_status") || "Đang theo dõi";

  const attendedSessions = getField(
    dashboard,
    "attendedSessions",
    "attended_sessions",
  );

  /* =======================================================
     ATTENDANCE
  ======================================================= */

  const attendanceAverage = useMemo(() => {
    const values = students
      .map((student) =>
        Number(
          getField(student, "attendanceRate", "attendance_rate", "attendance"),
        ),
      )
      .filter((value) => Number.isFinite(value) && value >= 0);

    if (values.length) {
      return Math.round(
        values.reduce((sum, value) => sum + value, 0) / values.length,
      );
    }

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

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="parent-dashboard">
        <style>{CSS}</style>

        <div className="fe-loading">
          <Skeleton active paragraph={{ rows: 2 }} />

          <div
            style={{
              height: 220,
              marginTop: 15,
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>

          <div style={{ marginTop: 15 }}>
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="parent-dashboard">
      <style>{CSS}</style>

      <div className="fe-home">
        {/* =================================================
            GREETING
        ================================================= */}

        <div className="fe-home-greeting">
          <div className="fe-home-greeting__left">
            <div className="fe-home-eyebrow">
              <HeartFilled />
              FaithEdu Family
            </div>

            <Title level={1} className="fe-home-title">
              Xin chào, {fullName}
            </Title>

            <Text className="fe-home-description">
              Cùng đồng hành với con trong từng bước nhỏ trên hành trình học
              giáo lý và lớn lên trong đức tin.
            </Text>
          </div>

          <div className="fe-home-date">
            <CalendarOutlined />
            {formatFullDate()}
          </div>
        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="fe-home-hero">
          <img
            className="fe-home-hero__church"
            src={DASHBOARD_IMAGES.heroChurch}
            alt=""
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="fe-home-hero__content">
            <div className="fe-home-hero__badge">
              <HeartFilled />
              Gia đình cùng lớn lên trong đức tin
            </div>

            <Title level={1} className="fe-home-hero__title">
              Mỗi ngày một bước,
              <br />
              cùng con tiến gần Chúa hơn.
            </Title>

            <Text className="fe-home-hero__subtitle">
              FaithEdu giúp gia đình theo dõi việc học giáo lý, điểm danh và
              những bước tiến của con một cách nhẹ nhàng và gần gũi.
            </Text>

            <div className="fe-home-hero__verse">
              <BookOutlined />

              <span>“Hãy để trẻ em đến với Thầy...” (Mc 10, 14)</span>
            </div>
          </div>

          <img
            className="fe-home-hero__family"
            src={DASHBOARD_IMAGES.heroFamily}
            alt="Gia đình đồng hành cùng con"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </section>

        {/* =================================================
            CHILDREN
        ================================================= */}

        <section className="fe-section">
          <SectionHeader
            title="Các con"
            subtitle={
              students.length
                ? `${students.length} học sinh đang được kết nối`
                : "Quản lý thông tin các con"
            }
            icon={<UserOutlined />}
            action="Xem tất cả"
            onClick={() => navigate("/parent/students")}
          />

          <div className="fe-children-shell">
            {students.length ? (
              <div className="fe-children-grid">
                {students.slice(0, 3).map((student, index) => {
                  const id =
                    student?.id ?? student?.studentId ?? student?.student_id;

                  return (
                    <ChildCard
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

                <div
                  className="fe-add-child"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate("/parent/students")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      navigate("/parent/students");
                    }
                  }}
                >
                  <span className="fe-add-child__icon">
                    <ArrowRightOutlined />
                  </span>

                  <span>
                    {students.length > 3
                      ? `Xem thêm ${students.length - 3} con`
                      : "Quản lý các con"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="fe-empty">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có thông tin học sinh"
                />

                <Button
                  type="primary"
                  onClick={() => navigate("/parent/students")}
                  style={{
                    background: C.navy,
                    borderColor: C.navy,
                  }}
                >
                  Thêm thông tin con
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            JOURNEY
        ================================================= */}

        <section className="fe-section">
          <SectionHeader
            title="Hành trình của con"
            subtitle="Một vài con số đáng nhớ"
            icon={<TrophyFilled />}
          />

          <div className="fe-journey">
            {/* ATTENDANCE */}

            <div className="fe-journey-main">
              <div className="fe-journey-main__top">
                <div>
                  <span className="fe-journey-main__label">CHUYÊN CẦN</span>

                  <span className="fe-journey-main__value">
                    {attendanceAverage === null
                      ? "--"
                      : `${attendanceAverage}%`}
                  </span>

                  <span className="fe-journey-main__caption">
                    {attendedSessions != null
                      ? `${attendedSessions} buổi đã tham gia`
                      : "Tỷ lệ tham gia học"}
                  </span>
                </div>

                <div className="fe-journey-main__icon">
                  <CheckCircleFilled />
                </div>
              </div>

              <div className="fe-journey-progress">
                <Progress
                  percent={attendanceAverage ?? 0}
                  showInfo={false}
                  strokeWidth={6}
                  trailColor="rgba(255,255,255,.10)"
                  strokeColor={C.gold}
                />
              </div>
            </div>

            {/* SCORE */}

            <div className="fe-journey-stat fe-journey-stat--score">
              <div className="fe-journey-stat__icon">
                <BarChartOutlined />
              </div>

              <span className="fe-journey-stat__value">
                {resultScore == null ? "--" : resultScore}
              </span>

              <span className="fe-journey-stat__label">Điểm trung bình</span>

              <span className="fe-journey-stat__caption">Kết quả học tập</span>
            </div>

            {/* STATUS */}

            <div className="fe-journey-stat fe-journey-stat--result">
              <div className="fe-journey-stat__icon">
                <TrophyOutlined />
              </div>

              <span className="fe-journey-stat__value">{learningStatus}</span>

              <span className="fe-journey-stat__label">Kết quả học tập</span>

              <span className="fe-journey-stat__caption">Tiến bộ của con</span>
            </div>

            {/* CERTIFICATE */}

            <div className="fe-journey-stat fe-journey-stat--certificate">
              <div className="fe-journey-stat__icon">
                <FileTextOutlined />
              </div>

              <span className="fe-journey-stat__value">
                {certificateCount == null ? "--" : certificateCount}
              </span>

              <span className="fe-journey-stat__label">Chứng chỉ</span>

              <span className="fe-journey-stat__caption">Đã được cấp</span>
            </div>
          </div>
        </section>

        {/* =================================================
            SCHEDULE + RESULT
        ================================================= */}

        <div className="fe-main-grid">
          {/* SCHEDULE */}

          <section className="fe-card">
            <SectionHeader
              title="Lịch học sắp tới"
              subtitle="Đừng bỏ lỡ những buổi học của con"
              icon={<CalendarOutlined />}
              action="Xem tất cả"
              onClick={() => navigate("/parent/schedule")}
            />

            <ScheduleList schedules={schedules} />
          </section>

          {/* RESULT */}

          <ResultCard
            resultScore={resultScore}
            resultHistory={resultHistory}
            certificateCount={certificateCount}
          />
        </div>

        {/* =================================================
            FOOTER CARDS
        ================================================= */}

        <div className="fe-bottom-grid">
          {/* FAITH */}

          <div className="fe-faith-card">
            <span className="fe-faith-card__label">Gia đình & Đức tin</span>

            <span className="fe-faith-card__title">
              Cùng con lớn lên trong tình yêu của Chúa.
            </span>

            <span className="fe-faith-card__text">
              Việc học giáo lý không chỉ diễn ra trong lớp học. Mỗi lời cầu
              nguyện, mỗi việc tốt và mỗi khoảnh khắc gia đình cùng nhau đều là
              một bước nhỏ trên hành trình đức tin.
            </span>

            <span className="fe-faith-card__verse">
              <HeartFilled />
              Sống đức tin từ những điều nhỏ bé.
            </span>
          </div>

          {/* NOTICE */}

          <div className="fe-notice-card">
            <SectionHeader
              title="Đồng hành cùng con"
              subtitle="Một vài gợi ý dành cho gia đình"
              icon={<BellOutlined />}
            />

            <div className="fe-notice-card__item">
              <div className="fe-notice-card__icon">
                <ReadOutlined />
              </div>

              <div>
                <span className="fe-notice-card__title">
                  Cùng con ôn lại bài giáo lý
                </span>

                <span className="fe-notice-card__text">
                  Dành một chút thời gian mỗi tuần để hỏi con hôm nay đã học
                  được điều gì.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
