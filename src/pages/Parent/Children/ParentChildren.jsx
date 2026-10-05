import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Avatar, Button, Spin, Typography, message } from "antd";

import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ReloadOutlined,
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  HeartFilled,
  IdcardOutlined,
  SmileOutlined,
} from "@ant-design/icons";

import parentApi from "../../../api/parentApi";
import heroFamily from "../../../assets/images/student-default.png";
const { Text } = Typography;

/* =========================================================
   FAITHEDU FAMILY — NEW DESIGN
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyDeep: "#102A43",
  navySoft: "#EAF1F7",

  gold: "#D9A441",
  goldDark: "#B98524",
  goldSoft: "#FBF3DF",

  cream: "#FFF9EE",
  creamDark: "#F8EFD9",

  white: "#FFFFFF",
  background: "#F5F7FA",

  text: "#243447",
  secondary: "#64748B",
  muted: "#94A3B8",

  border: "#E5EAF0",

  green: "#2E7D5B",
  greenSoft: "#EAF6F0",

  pink: "#D66B7A",
  pinkSoft: "#FCEDEF",

  blue: "#4C78A8",
  blueSoft: "#EEF5FB",

  orange: "#C98232",
  orangeSoft: "#FFF4E5",

  danger: "#C94C4C",
};

/* =========================================================
   PAGE CSS
========================================================= */

const PAGE_CSS = `
/* =========================================================
   ROOT
========================================================= */

.fe-family-children-page {
  width: 100%;
  min-height: 100%;
  color: ${COLORS.text};
  font-family:
    "Be Vietnam Pro",
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  background:
    radial-gradient(
      circle at 85% 0%,
      rgba(217, 164, 65, 0.08),
      transparent 28%
    ),
    ${COLORS.background};
}

.fe-family-children-page *,
.fe-family-children-page *::before,
.fe-family-children-page *::after {
  box-sizing: border-box;
}

.fe-family-children-page button {
  font-family: inherit;
}

.fe-family-children-container {
  width: 100%;
  max-width: 1420px;
  margin: 0 auto;
  padding: 4px 0 40px;
}

/* =========================================================
   TOP HERO
========================================================= */

.fe-family-children-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 30px;

  min-height: 215px;
  padding: 32px 36px;

  border-radius: 30px;
  background:
    radial-gradient(
      circle at 88% 15%,
      rgba(217, 164, 65, 0.25),
      transparent 24%
    ),
    radial-gradient(
      circle at 70% 100%,
      rgba(255, 255, 255, 0.08),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      ${COLORS.navyDeep} 0%,
      ${COLORS.navy} 55%,
      #285578 100%
    );

  box-shadow:
    0 20px 45px rgba(16, 42, 67, 0.13),
    inset 0 1px 0 rgba(255,255,255,0.08);

  margin-bottom: 28px;
}

.fe-family-children-hero::before {
  content: "";
  position: absolute;
  width: 210px;
  height: 210px;
  right: 90px;
  top: -105px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.08);
}

.fe-family-children-hero::after {
  content: "";
  position: absolute;
  width: 300px;
  height: 300px;
  right: -100px;
  bottom: -210px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.08);
}

.fe-family-children-hero-content {
  position: relative;
  z-index: 2;
  min-width: 0;
}

.fe-family-children-hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  margin-bottom: 12px;
  padding: 6px 10px;

  border: 1px solid rgba(255,255,255,0.13);
  border-radius: 999px;

  background: rgba(255,255,255,0.08);

  color: #F7D98E;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.3px;
  text-transform: uppercase;
}

.fe-family-children-hero-kicker-icon {
  font-size: 11px;
}

.fe-family-children-hero-title {
  margin: 0 !important;

  color: #FFFFFF !important;

  font-family:
    "Be Vietnam Pro",
    Inter,
    sans-serif !important;

  font-size: 32px !important;
  line-height: 1.25 !important;
  font-weight: 800 !important;
  letter-spacing: -0.8px;
}

.fe-family-children-hero-description {
  display: block;
  max-width: 640px;

  margin-top: 9px;

  color: rgba(255,255,255,0.72) !important;
  font-size: 13px;
  line-height: 1.75;
}

.fe-family-children-hero-description strong {
  color: #F7D98E;
  font-weight: 700;
}

.fe-family-children-hero-family {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 190px;
  height: 150px;
  flex-shrink: 0;
}

.fe-family-children-hero-family-circle {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 128px;
  height: 128px;

  border: 7px solid rgba(255,255,255,0.13);
  border-radius: 50%;

  background:
    radial-gradient(
      circle at 35% 25%,
      rgba(255,255,255,0.2),
      transparent 30%
    ),
    rgba(255,255,255,0.07);

  box-shadow:
    0 12px 30px rgba(0,0,0,0.12),
    inset 0 0 0 1px rgba(255,255,255,0.08);
}

.fe-family-children-hero-family-circle::before {
  content: "";
  position: absolute;
  inset: 12px;
  border: 1px dashed rgba(247,217,142,0.5);
  border-radius: 50%;
}

.fe-family-children-hero-heart {
  color: #F7D98E;
  font-size: 42px;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15));
}

.fe-family-children-hero-number {
  position: absolute;
  right: -5px;
  bottom: 2px;

  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 44px;
  height: 44px;
  padding: 0 10px;

  border: 4px solid ${COLORS.navy};
  border-radius: 50%;

  background: ${COLORS.gold};
  color: ${COLORS.navyDeep};

  font-size: 16px;
  font-weight: 900;

  box-shadow: 0 8px 18px rgba(0,0,0,0.16);
}

/* =========================================================
   OVERVIEW BAR
========================================================= */

.fe-family-children-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  margin-bottom: 30px;
}

.fe-family-children-overview-item {
  display: flex;
  align-items: center;
  gap: 13px;

  min-width: 0;
  padding: 15px 17px;

  border: 1px solid ${COLORS.border};
  border-radius: 17px;

  background: ${COLORS.white};

  box-shadow: 0 5px 18px rgba(23,59,94,0.035);
}

.fe-family-children-overview-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 43px;
  height: 43px;
  flex-shrink: 0;

  border-radius: 13px;

  font-size: 18px;
}

.fe-family-children-overview-icon.blue {
  background: ${COLORS.blueSoft};
  color: ${COLORS.blue};
}

.fe-family-children-overview-icon.gold {
  background: ${COLORS.goldSoft};
  color: ${COLORS.goldDark};
}

.fe-family-children-overview-icon.green {
  background: ${COLORS.greenSoft};
  color: ${COLORS.green};
}

.fe-family-children-overview-label {
  color: ${COLORS.muted};
  font-size: 10px;
  line-height: 1.4;
}

.fe-family-children-overview-value {
  margin-top: 2px;
  color: ${COLORS.navy};
  font-size: 17px;
  font-weight: 800;
  line-height: 1.25;
}

/* =========================================================
   SECTION HEADER
========================================================= */

.fe-family-children-section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 15px;

  margin-bottom: 17px;
}

.fe-family-children-section-heading {
  min-width: 0;
}

.fe-family-children-section-kicker {
  display: flex;
  align-items: center;
  gap: 7px;

  margin-bottom: 5px;

  color: ${COLORS.goldDark};
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.15px;
  text-transform: uppercase;
}

.fe-family-children-section-kicker::before {
  content: "";
  width: 18px;
  height: 2px;
  border-radius: 99px;
  background: ${COLORS.gold};
}

.fe-family-children-section-title {
  margin: 0 !important;

  color: ${COLORS.navy} !important;
  font-size: 22px !important;
  font-weight: 800 !important;
  letter-spacing: -0.45px;
}

.fe-family-children-section-description {
  display: block;
  margin-top: 4px;

  color: ${COLORS.secondary};
  font-size: 11px;
  line-height: 1.6;
}

.fe-family-children-refresh {
  display: inline-flex !important;
  align-items: center;
  gap: 6px;

  height: 34px !important;
  padding: 0 11px !important;

  border: 1px solid ${COLORS.border} !important;
  border-radius: 10px !important;

  background: ${COLORS.white} !important;
  color: ${COLORS.navy} !important;

  font-size: 10px !important;
  font-weight: 700 !important;
}

/* =========================================================
   CHILDREN GRID
========================================================= */

.fe-family-children-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

/* =========================================================
   CHILD PROFILE CARD
========================================================= */

.fe-family-child-card {
  position: relative;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  min-width: 0;

  border: 1px solid ${COLORS.border};
  border-radius: 24px;

  background: ${COLORS.white};

  box-shadow:
    0 8px 26px rgba(23,59,94,0.045);

  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.fe-family-child-card:hover {
  transform: translateY(-4px);

  border-color: rgba(217,164,65,0.4);

  box-shadow:
    0 18px 38px rgba(23,59,94,0.10);
}

/* CARD TOP */

.fe-family-child-card-top {
  position: relative;
  overflow: hidden;

  min-height: 132px;
  padding: 23px 24px;

  background:
    radial-gradient(
      circle at 88% 15%,
      rgba(217,164,65,0.17),
      transparent 27%
    ),
    linear-gradient(
      135deg,
      ${COLORS.cream} 0%,
      #FFFDF9 55%,
      ${COLORS.white} 100%
    );
}

.fe-family-child-card-top::after {
  content: "";
  position: absolute;

  width: 150px;
  height: 150px;

  right: -70px;
  top: -75px;

  border: 1px solid rgba(217,164,65,0.14);
  border-radius: 50%;
}

.fe-family-child-card-profile {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  gap: 16px;

  min-width: 0;
}

.fe-family-child-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.fe-family-child-avatar {
  border: 4px solid ${COLORS.white} !important;

  background:
    linear-gradient(
      145deg,
      #E9F0F5,
      #DCE7EF
    ) !important;

  color: ${COLORS.navy} !important;

  box-shadow:
    0 8px 18px rgba(23,59,94,0.12);
}

.fe-family-child-online {
  position: absolute;

  right: 0;
  bottom: 2px;

  width: 15px;
  height: 15px;

  border: 3px solid ${COLORS.white};
  border-radius: 50%;

  background: ${COLORS.green};
}

.fe-family-child-main {
  min-width: 0;
}

.fe-family-child-name {
  margin: 0;

  overflow: hidden;

  color: ${COLORS.navy};

  font-size: 19px;
  font-weight: 800;
  line-height: 1.35;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.fe-family-child-code {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  margin-top: 6px;

  color: ${COLORS.secondary};

  font-size: 10px;
  font-weight: 600;
}

.fe-family-child-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  margin-top: 8px;
  padding: 4px 8px;

  border-radius: 999px;

  background: ${COLORS.greenSoft};
  color: ${COLORS.green};

  font-size: 9px;
  font-weight: 800;
}

.fe-family-child-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

/* CARD INFO */

.fe-family-child-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  padding: 18px 24px 19px;

  border-top: 1px solid ${COLORS.border};

  gap: 10px 18px;
}

.fe-family-child-info-item {
  display: flex;
  align-items: center;
  gap: 9px;

  min-width: 0;
}

.fe-family-child-info-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 30px;
  flex-shrink: 0;

  border-radius: 9px;

  background: ${COLORS.navySoft};
  color: ${COLORS.navy};

  font-size: 12px;
}

.fe-family-child-info-content {
  min-width: 0;
}

.fe-family-child-info-label {
  color: ${COLORS.muted};
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.fe-family-child-info-value {
  margin-top: 2px;

  overflow: hidden;

  color: ${COLORS.text};
  font-size: 10.5px;
  font-weight: 700;

  text-overflow: ellipsis;
  white-space: nowrap;
}

/* CARD FOOTER */

.fe-family-child-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 13px 16px 13px 24px;

  border-top: 1px solid ${COLORS.border};

  background: #FCFDFE;
}

.fe-family-child-footer-message {
  display: flex;
  align-items: center;
  gap: 7px;

  min-width: 0;

  color: ${COLORS.secondary};
  font-size: 9.5px;
  line-height: 1.5;
}

.fe-family-child-footer-message-icon {
  color: ${COLORS.gold};
  font-size: 12px;
}

.fe-family-child-detail-button {
  display: inline-flex !important;
  align-items: center;
  gap: 7px;

  height: 34px !important;
  flex-shrink: 0;

  padding: 0 12px !important;

  border: none !important;
  border-radius: 10px !important;

  background: ${COLORS.navy} !important;
  color: #FFFFFF !important;

  font-size: 9.5px !important;
  font-weight: 800 !important;

  box-shadow: 0 6px 13px rgba(23,59,94,0.13);
}

.fe-family-child-detail-button:hover {
  background: ${COLORS.navyHover} !important;
}

/* =========================================================
   BOTTOM FAMILY MESSAGE
========================================================= */

.fe-family-children-message {
  position: relative;
  overflow: hidden;

  display: flex;
  align-items: center;
  gap: 15px;

  margin-top: 24px;
  padding: 17px 20px;

  border: 1px solid #F0E4C9;
  border-radius: 18px;

  background:
    radial-gradient(
      circle at 100% 50%,
      rgba(217,164,65,0.12),
      transparent 30%
    ),
    ${COLORS.cream};
}

.fe-family-children-message-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 43px;
  height: 43px;
  flex-shrink: 0;

  border-radius: 13px;

  background: ${COLORS.white};
  color: ${COLORS.goldDark};

  box-shadow: 0 5px 13px rgba(185,133,36,0.09);

  font-size: 18px;
}

.fe-family-children-message-content {
  min-width: 0;
}

.fe-family-children-message-title {
  color: ${COLORS.navy};
  font-size: 11px;
  font-weight: 800;
}

.fe-family-children-message-text {
  margin-top: 3px;

  color: ${COLORS.secondary};
  font-size: 9.5px;
  line-height: 1.65;
}

/* =========================================================
   LOADING
========================================================= */

.fe-family-children-loading {
  display: flex;
  min-height: 520px;

  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 15px;

  border: 1px solid ${COLORS.border};
  border-radius: 26px;

  background: ${COLORS.white};

  box-shadow: 0 8px 28px rgba(23,59,94,0.035);
}

.fe-family-children-loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 72px;
  height: 72px;

  border-radius: 22px;

  background: ${COLORS.navySoft};
  color: ${COLORS.navy};

  font-size: 30px;
}

.fe-family-children-loading .ant-spin-dot-item {
  background-color: ${COLORS.gold};
}

.fe-family-children-loading-text {
  color: ${COLORS.secondary};
  font-size: 11px;
}

/* =========================================================
   ERROR
========================================================= */

.fe-family-children-error {
  padding: 24px;

  border: 1px solid ${COLORS.border};
  border-radius: 22px;

  background: ${COLORS.white};
}

.fe-family-children-error .ant-alert {
  border-radius: 14px;
}

.fe-family-children-error-button {
  margin-top: 13px;

  border-radius: 10px !important;

  background: ${COLORS.navy} !important;
  border-color: ${COLORS.navy} !important;

  font-size: 11px !important;
}

/* =========================================================
   EMPTY
========================================================= */

.fe-family-children-empty {
  display: flex;
  min-height: 430px;

  align-items: center;
  justify-content: center;

  padding: 30px;

  border: 1px dashed #CCD6E0;
  border-radius: 24px;

  background: ${COLORS.white};
}

.fe-family-children-empty-inner {
  text-align: center;
}

.fe-family-children-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 76px;
  height: 76px;
  margin: 0 auto 15px;

  border-radius: 24px;

  background: ${COLORS.goldSoft};
  color: ${COLORS.goldDark};

  font-size: 29px;
}

.fe-family-children-empty-title {
  color: ${COLORS.navy};
  font-size: 16px;
  font-weight: 800;
}

.fe-family-children-empty-text {
  max-width: 390px;
  margin: 7px auto 0;

  color: ${COLORS.secondary};
  font-size: 10.5px;
  line-height: 1.7;
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1050px) {
  .fe-family-children-container {
    padding-bottom: 30px;
  }

  .fe-family-children-hero {
    padding: 28px;
  }

  .fe-family-children-grid {
    grid-template-columns: 1fr;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 767px) {
  .fe-family-children-container {
    padding: 0 0 105px;
  }

  .fe-family-children-hero {
    grid-template-columns: 1fr;

    min-height: auto;

    padding: 25px 21px 20px;

    border-radius: 24px;

    margin-bottom: 14px;
  }

  .fe-family-children-hero-title {
    font-size: 25px !important;
  }

  .fe-family-children-hero-description {
    font-size: 11px;
  }

  .fe-family-children-hero-family {
    width: 100%;
    height: 85px;
    justify-content: flex-start;
    padding-left: 5px;
  }

  .fe-family-children-hero-family-circle {
    width: 78px;
    height: 78px;
    border-width: 5px;
  }

  .fe-family-children-hero-family-circle::before {
    inset: 8px;
  }

  .fe-family-children-hero-heart {
    font-size: 26px;
  }

  .fe-family-children-hero-number {
    right: auto;
    left: 54px;
    bottom: -1px;

    min-width: 31px;
    height: 31px;

    border-width: 3px;

    font-size: 11px;
  }

  .fe-family-children-overview {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;

    margin-bottom: 21px;
  }

  .fe-family-children-overview-item {
    display: block;
    padding: 11px 7px;

    border-radius: 14px;

    text-align: center;
  }

  .fe-family-children-overview-icon {
    width: 32px;
    height: 32px;

    margin: 0 auto 7px;

    border-radius: 10px;

    font-size: 13px;
  }

  .fe-family-children-overview-label {
    font-size: 7px;
  }

  .fe-family-children-overview-value {
    margin-top: 2px;
    font-size: 13px;
  }

  .fe-family-children-section-header {
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .fe-family-children-section-title {
    font-size: 18px !important;
  }

  .fe-family-children-section-description {
    font-size: 9px;
  }

  .fe-family-children-refresh {
    width: 34px;
    padding: 0 !important;

    justify-content: center;

    font-size: 0 !important;
  }

  .fe-family-children-refresh .anticon {
    margin: 0 !important;
    font-size: 12px;
  }

  .fe-family-children-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .fe-family-child-card {
    border-radius: 19px;
  }

  .fe-family-child-card-top {
    min-height: 118px;
    padding: 18px;
  }

  .fe-family-child-card-profile {
    gap: 12px;
  }

  .fe-family-child-avatar {
    width: 64px !important;
    height: 64px !important;
  }

  .fe-family-child-name {
    font-size: 16px;
  }

  .fe-family-child-code {
    font-size: 8.5px;
  }

  .fe-family-child-status {
    font-size: 8px;
  }

  .fe-family-child-info {
    padding: 14px 18px;
    gap: 10px;
  }

  .fe-family-child-info-icon {
    width: 27px;
    height: 27px;

    border-radius: 8px;

    font-size: 10px;
  }

  .fe-family-child-info-label {
    font-size: 7px;
  }

  .fe-family-child-info-value {
    font-size: 9.5px;
  }

  .fe-family-child-footer {
    padding: 11px 12px 11px 18px;
  }

  .fe-family-child-footer-message {
    font-size: 8px;
  }

  .fe-family-child-detail-button {
    height: 32px !important;
    padding: 0 10px !important;

    font-size: 8.5px !important;
  }

  .fe-family-children-message {
    margin-top: 14px;
    padding: 13px;

    border-radius: 15px;
  }

  .fe-family-children-message-icon {
    width: 36px;
    height: 36px;

    border-radius: 10px;

    font-size: 15px;
  }

  .fe-family-children-message-title {
    font-size: 9.5px;
  }

  .fe-family-children-message-text {
    font-size: 8.5px;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 380px) {
  .fe-family-children-hero-title {
    font-size: 22px !important;
  }

  .fe-family-child-info {
    grid-template-columns: 1fr;
  }

  .fe-family-child-footer-message {
    display: none;
  }

  .fe-family-child-detail-button {
    width: 100%;
    justify-content: center;
  }
}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {
  .fe-family-children-page *,
  .fe-family-children-page *::before,
  .fe-family-children-page *::after {
    transition: none !important;
  }
}
`;

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật";
  }

  return date.toLocaleDateString("vi-VN");
};

const normalizeChild = (child) => {
  if (!child) return null;

  const dateOfBirth =
    child.date_of_birth ??
    child.dateOfBirth ??
    child.birth_date ??
    child.birthDate ??
    null;

  return {
    ...child,

    id: child.id ?? child.studentId ?? child.student_id ?? null,

    code:
      child.code ??
      child.studentCode ??
      child.student_code ??
      child.qr_code ??
      "",

    name: child.name ?? child.full_name ?? child.fullName ?? "Chưa cập nhật",

    gender: child.gender ?? null,

    date_of_birth: dateOfBirth,

    avatar: child.avatar ?? child.avatar_url ?? child.avatarUrl ?? null,

    class_id: child.class_id ?? child.classId ?? null,

    class_name:
      child.class_name ?? child.className ?? child.class?.name ?? null,

    class_code: child.class_code ?? child.classCode ?? null,

    catechism_level:
      child.catechism_level ??
      child.catechismLevel ??
      child.level_name ??
      child.levelName ??
      null,

    status: child.status ?? "studying",

    formattedDateOfBirth: formatDate(dateOfBirth),
  };
};

const extractChildren = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  const candidates = [
    response.data?.data?.children,
    response.data?.data?.items,
    response.data?.data,
    response.data?.children,
    response.data?.items,
    response.data,
    response.children,
    response.items,
  ];

  return candidates.find(Array.isArray) || [];
};

const getInitials = (name = "") => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "?";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const getGenderLabel = (gender) => {
  if (!gender) return "Chưa cập nhật";

  const value = String(gender).toLowerCase();

  if (value === "male" || value === "nam" || value === "m" || value === "1") {
    return "Nam";
  }

  if (
    value === "female" ||
    value === "nữ" ||
    value === "nu" ||
    value === "f" ||
    value === "2"
  ) {
    return "Nữ";
  }

  return gender;
};

const getStatusLabel = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    value === "studying" ||
    value === "active" ||
    value === "dang_hoc" ||
    value === "đang học"
  ) {
    return "Đang học";
  }

  if (value === "inactive" || value === "paused" || value === "tam_nghi") {
    return "Tạm nghỉ";
  }

  return status || "Đang học";
};

/* =========================================================
   COMPONENT
========================================================= */

const ParentChildren = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD CHILDREN
  ===================================================== */

  const loadChildren = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await parentApi.getChildren();

      const isApiResponse = typeof response?.status === "boolean";

      if (isApiResponse && response.status === false) {
        throw new Error(response.message || "Không thể tải danh sách các con");
      }

      const payload = isApiResponse ? response.data : response;

      const rawChildren = extractChildren(payload);

      const normalizedChildren = rawChildren
        .map(normalizeChild)
        .filter(
          (child) => child && child.id !== null && child.id !== undefined,
        );

      setChildren(normalizedChildren);
    } catch (err) {
      console.error("[ParentChildren] LOAD CHILDREN ERROR:", err);

      setChildren([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách các con",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  /* =====================================================
     DISPLAY DATA
  ===================================================== */

  const displayChildren = useMemo(
    () =>
      children.map((child) => ({
        ...child,
        formattedDateOfBirth:
          child.formattedDateOfBirth || formatDate(child.date_of_birth),
      })),
    [children],
  );

  /* =====================================================
     VIEW DETAIL
  ===================================================== */

  const handleViewChild = useCallback(
    (child) => {
      if (child?.id == null) {
        message.warning("Không tìm thấy mã học sinh");
        return;
      }

      navigate(`/parent/children/${encodeURIComponent(String(child.id))}`);
    },
    [navigate],
  );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="fe-family-children-page">
        <style>{PAGE_CSS}</style>

        <div className="fe-family-children-container">
          <div className="fe-family-children-loading">
            <div className="fe-family-children-loading-icon">
              <HeartFilled />
            </div>

            <Spin size="small" />

            <div className="fe-family-children-loading-text">
              Đang chuẩn bị không gian gia đình...
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */
  console.log(children);

  if (error) {
    return (
      <div className="fe-family-children-page">
        <style>{PAGE_CSS}</style>

        <div className="fe-family-children-container">
          <div className="fe-family-children-error">
            <Alert
              type="error"
              showIcon
              message="Không thể tải thông tin các con"
              description={error}
            />

            <Button
              type="primary"
              icon={<ReloadOutlined />}
              className="fe-family-children-error-button"
              onClick={loadChildren}
            >
              Thử tải lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  if (displayChildren.length === 0) {
    return (
      <div className="fe-family-children-page">
        <style>{PAGE_CSS}</style>

        <div className="fe-family-children-container">
          <section className="fe-family-children-hero">
            <div className="fe-family-children-hero-content">
              <div className="fe-family-children-hero-kicker">
                <HeartFilled className="fe-family-children-hero-kicker-icon" />
                FaithEdu Family
              </div>

              <h1 className="fe-family-children-hero-title">
                Gia đình của bạn
              </h1>

              <Text className="fe-family-children-hero-description">
                Nơi phụ huynh đồng hành cùng con trên hành trình{" "}
                <strong>học giáo lý</strong> và lớn lên trong đức tin.
              </Text>
            </div>

            <div className="fe-family-children-hero-family">
              <div className="fe-family-children-hero-family-circle">
                <HeartFilled className="fe-family-children-hero-heart" />
              </div>
            </div>
          </section>

          <div className="fe-family-children-empty">
            <div className="fe-family-children-empty-inner">
              <div className="fe-family-children-empty-icon">
                <TeamOutlined />
              </div>

              <div className="fe-family-children-empty-title">
                Chưa có học sinh được liên kết
              </div>

              <div className="fe-family-children-empty-text">
                Hiện chưa có thông tin học sinh nào được liên kết với tài khoản
                phụ huynh này. Vui lòng liên hệ giáo xứ hoặc giáo lý viên để
                được hỗ trợ.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN RENDER
  ===================================================== */

  return (
    <div className="fe-family-children-page">
      <style>{PAGE_CSS}</style>

      <div className="fe-family-children-container">
        {/* =================================================
            HERO
        ================================================= */}

        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section className="fe-family-children-overview">
          <div className="fe-family-children-overview-item">
            <div className="fe-family-children-overview-icon blue">
              <TeamOutlined />
            </div>

            <div>
              <div className="fe-family-children-overview-label">
                Thành viên
              </div>

              <div className="fe-family-children-overview-value">
                {displayChildren.length} con
              </div>
            </div>
          </div>

          <div className="fe-family-children-overview-item">
            <div className="fe-family-children-overview-icon gold">
              <BookOutlined />
            </div>

            <div>
              <div className="fe-family-children-overview-label">
                Hành trình
              </div>

              <div className="fe-family-children-overview-value">Giáo lý</div>
            </div>
          </div>

          <div className="fe-family-children-overview-item">
            <div className="fe-family-children-overview-icon green">
              <CheckCircleFilled />
            </div>

            <div>
              <div className="fe-family-children-overview-label">Đồng hành</div>

              <div className="fe-family-children-overview-value">
                Cùng gia đình
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div className="fe-family-children-section-header">
          <div className="fe-family-children-section-heading">
            <div className="fe-family-children-section-kicker">
              Family members
            </div>

            <h2 className="fe-family-children-section-title">
              Danh sách các con
            </h2>

            <Text className="fe-family-children-section-description">
              Chạm vào hồ sơ để xem hành trình riêng của từng con.
            </Text>
          </div>

          <Button
            type="text"
            icon={<ReloadOutlined />}
            className="fe-family-children-refresh"
            onClick={loadChildren}
          >
            Làm mới
          </Button>
        </div>

        {/* =================================================
            CHILDREN
        ================================================= */}

        <section className="fe-family-children-grid">
          {displayChildren.map((child) => {
            const statusLabel = getStatusLabel(child.status);

            const genderLabel = getGenderLabel(child.gender);

            return (
              <article key={child.id} className="fe-family-child-card">
                {/* =========================================
                    TOP
                ========================================= */}

                <div className="fe-family-child-card-top">
                  <div className="fe-family-child-profile">
                    <div className="fe-family-child-avatar-wrap">
                      <Avatar
                        size={76}
                        src={
                          child.avatar
                            ? `${process.env.REACT_APP_API_URL}${child.avatar}`
                            : heroFamily
                        }
                        icon={!child.avatar ? <UserOutlined /> : undefined}
                        className="fe-family-child-avatar"
                      >
                        {!child.avatar ? getInitials(child.name) : null}
                      </Avatar>
                      <span className="fe-family-child-online" />
                    </div>

                    <div className="fe-family-child-main">
                      <h3 className="fe-family-child-name" title={child.name}>
                        {child.name}
                      </h3>

                      <div className="fe-family-child-code">
                        <IdcardOutlined />

                        {child.code
                          ? `Mã học sinh: ${child.code}`
                          : "Chưa có mã học sinh"}
                      </div>

                      <div className="fe-family-child-status">
                        <span className="fe-family-child-status-dot" />

                        {statusLabel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================================
                    INFO
                ========================================= */}

                <div className="fe-family-child-info">
                  <div className="fe-family-child-info-item">
                    <div className="fe-family-child-info-icon">
                      <BookOutlined />
                    </div>

                    <div className="fe-family-child-info-content">
                      <div className="fe-family-child-info-label">
                        Lớp giáo lý
                      </div>

                      <div
                        className="fe-family-child-info-value"
                        title={child.class_name || "Chưa xếp lớp"}
                      >
                        {child.class_name || "Chưa xếp lớp"}
                      </div>
                    </div>
                  </div>

                  <div className="fe-family-child-info-item">
                    <div className="fe-family-child-info-icon">
                      <SmileOutlined />
                    </div>

                    <div className="fe-family-child-info-content">
                      <div className="fe-family-child-info-label">
                        Khối giáo lý
                      </div>

                      <div
                        className="fe-family-child-info-value"
                        title={child.catechism_level || "Chưa cập nhật"}
                      >
                        {child.catechism_level || "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>

                  <div className="fe-family-child-info-item">
                    <div className="fe-family-child-info-icon">
                      <CalendarOutlined />
                    </div>

                    <div className="fe-family-child-info-content">
                      <div className="fe-family-child-info-label">
                        Ngày sinh
                      </div>

                      <div className="fe-family-child-info-value">
                        {child.formattedDateOfBirth}
                      </div>
                    </div>
                  </div>

                  <div className="fe-family-child-info-item">
                    <div className="fe-family-child-info-icon">
                      <UserOutlined />
                    </div>

                    <div className="fe-family-child-info-content">
                      <div className="fe-family-child-info-label">
                        Giới tính
                      </div>

                      <div className="fe-family-child-info-value">
                        {genderLabel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================================
                    FOOTER
                ========================================= */}

                <div className="fe-family-child-footer">
                  <div className="fe-family-child-footer-message">
                    <HeartFilled className="fe-family-child-footer-message-icon" />

                    <span>Đồng hành cùng con mỗi ngày</span>
                  </div>

                  <Button
                    type="primary"
                    className="fe-family-child-detail-button"
                    onClick={() => handleViewChild(child)}
                  >
                    Xem hành trình
                    <ArrowRightOutlined />
                  </Button>
                </div>
              </article>
            );
          })}
        </section>

        {/* =================================================
            FAMILY MESSAGE
        ================================================= */}

        <section className="fe-family-children-message">
          <div className="fe-family-children-message-icon">
            <HeartFilled />
          </div>

          <div className="fe-family-children-message-content">
            <div className="fe-family-children-message-title">
              Gia đình là nơi đức tin bắt đầu
            </div>

            <div className="fe-family-children-message-text">
              Hãy cùng con tham dự Thánh lễ, học giáo lý và sống những điều tốt
              đẹp mỗi ngày. FaithEdu giúp gia đình dễ dàng đồng hành cùng con
              trên hành trình ấy.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ParentChildren;
