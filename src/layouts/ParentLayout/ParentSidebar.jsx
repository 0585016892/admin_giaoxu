import React, { useMemo, useState } from "react";

import { Avatar, Badge, Drawer, Menu, Tooltip } from "antd";

import {
  HomeFilled,
  TeamOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
  HeartFilled,
  MenuOutlined,
  CloseOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import { useLocation, useNavigate } from "react-router-dom";

import logoxn from "../../assets/images/logoXn.png";
/* =========================================================
   MENU
========================================================= */

export const MENU_ITEMS = [
  {
    key: "/parent",
    icon: <HomeFilled />,
    label: "Trang chủ",
    description: "Tổng quan gia đình",
  },
  {
    key: "/parent/students",
    icon: <TeamOutlined />,
    label: "Con của tôi",
    description: "Theo dõi các em",
  },
  {
    key: "/parent/notifications",
    icon: <BellOutlined />,
    label: "Thông báo",
    description: "Tin mới từ giáo xứ",
  },
  {
    key: "/parent/support",
    icon: <QuestionCircleOutlined />,
    label: "Hỗ trợ",
    description: "Liên hệ FaithEdu",
  },
];

/* =========================================================
   ACCOUNT
========================================================= */

export const ACCOUNT_ITEMS = [
  {
    key: "/parent/profile",
    icon: <UserOutlined />,
    label: "Hồ sơ của tôi",
    description: "Thông tin tài khoản",
  },
  {
    key: "/parent/settings",
    icon: <SettingOutlined />,
    label: "Cài đặt",
    description: "Thiết lập ứng dụng",
  },
];

/* =========================================================
   CSS
========================================================= */

const SIDEBAR_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');

:root {
  --fe-navy: #173B5E;
  --fe-navy-deep: #102A43;
  --fe-navy-hover: #244F78;

  --fe-gold: #D9A441;
  --fe-gold-soft: #F4E7C1;
  --fe-cream: #FFF9EE;

  --fe-background: #F7F9FC;
  --fe-white: #FFFFFF;

  --fe-text: #243447;
  --fe-muted: #64748B;
  --fe-light-muted: #94A3B8;

  --fe-border: #E2E8F0;

  --fe-green: #2E7D5B;
  --fe-danger: #C94C4C;

  --fe-blue-soft: #EEF3F7;

  --fe-shadow-sm:
    0 2px 8px rgba(16, 42, 67, .04);

  --fe-shadow-md:
    0 10px 30px rgba(16, 42, 67, .08);
}

/* =========================================================
   RESET
========================================================= */

.fe-family-sidebar,
.fe-family-sidebar *,
.fe-family-sidebar *::before,
.fe-family-sidebar *::after,

.fe-family-mobile-bottom,
.fe-family-mobile-bottom *,
.fe-family-mobile-bottom *::before,
.fe-family-mobile-bottom *::after,

.fe-family-mobile-drawer,
.fe-family-mobile-drawer *,
.fe-family-mobile-drawer *::before,
.fe-family-mobile-drawer *::after {
  box-sizing: border-box;
}

/* =========================================================
   DESKTOP SIDEBAR
========================================================= */

.fe-family-sidebar {
  position: relative;

  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;
  min-height: 100%;

  background:
    linear-gradient(
      180deg,
      #FFFFFF 0%,
      #FFFFFF 70%,
      #FFF9EE 100%
    );

  color: var(--fe-text);

  font-family:
    "Be Vietnam Pro",
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  overflow: hidden;
}

/* =========================================================
   DECORATION
========================================================= */

.fe-family-sidebar::before {
  content: "";

  position: absolute;

  top: -120px;
  right: -100px;

  width: 240px;
  height: 240px;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(217,164,65,.14) 0%,
      rgba(217,164,65,0) 70%
    );

  pointer-events: none;
}

/* =========================================================
   BRAND
========================================================= */

.fe-family-sidebar__brand {
  position: relative;

  display: flex;
  align-items: center;

  min-height: 84px;

  padding: 15px 17px;

  flex-shrink: 0;

  border-bottom:
    1px solid rgba(226,232,240,.75);
}

.fe-family-sidebar__brand-link {
  display: flex;
  align-items: center;

  gap: 11px;

  width: 100%;

  padding: 0;

  border: 0;

  background: transparent;

  color: inherit;

  text-align: left;

  cursor: pointer;
}

.fe-family-sidebar__logo {
  position: relative;

  width: 50px;
  height: 50px;

  flex: 0 0 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 15px;

  overflow: hidden;

  background:
    linear-gradient(
      145deg,
      #FFF9EE,
      #F4E7C1
    );

  border:
    1px solid rgba(217,164,65,.28);

  box-shadow:
    0 5px 16px rgba(217,164,65,.13);
}

.fe-family-sidebar__logo img {
  width: 100%;
  height: 100%;

  object-fit: contain;

  display: block;
}

.fe-family-sidebar__brand-copy {
  min-width: 0;

  overflow: hidden;
}

.fe-family-sidebar__brand-name {
  color: var(--fe-navy);

  font-size: 21px;
  font-weight: 700;

  line-height: 1.15;

  letter-spacing: -.6px;

  white-space: nowrap;
}

.fe-family-sidebar__brand-name span {
  color: var(--fe-gold);
}

.fe-family-sidebar__brand-subtitle {
  margin-top: 4px;

  color: var(--fe-muted);

  font-size: 8px;
  font-weight: 500;

  line-height: 1.4;

  white-space: nowrap;
}

/* =========================================================
   COLLAPSE
========================================================= */

.fe-family-sidebar__collapse {
  position: absolute;

  top: 18px;
  right: -13px;

  z-index: 30;

  width: 27px;
  height: 27px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border:
    1px solid var(--fe-border);

  border-radius: 50%;

  background: #fff;

  color: var(--fe-navy);

  box-shadow:
    var(--fe-shadow-sm);

  cursor: pointer;

  transition: all .2s ease;
}

.fe-family-sidebar__collapse:hover {
  color: #fff;

  background: var(--fe-navy);

  transform: scale(1.07);
}

/* =========================================================
   PROFILE
========================================================= */

.fe-family-sidebar__profile-wrap {
  padding: 15px 13px 11px;

  flex-shrink: 0;
}

.fe-family-sidebar__profile {
  position: relative;

  display: flex;
  align-items: center;

  gap: 11px;

  min-height: 68px;

  padding: 10px 11px;

  border:
    1px solid rgba(226,232,240,.9);

  border-radius: 16px;

  background:
    linear-gradient(
      135deg,
      #F7F9FC 0%,
      #FFFFFF 60%,
      #FFF9EE 100%
    );

  box-shadow:
    var(--fe-shadow-sm);

  overflow: hidden;
}

.fe-family-sidebar__profile::after {
  content: "";

  position: absolute;

  right: -25px;
  bottom: -30px;

  width: 85px;
  height: 85px;

  border-radius: 50%;

  background:
    rgba(217,164,65,.09);
}

.fe-family-sidebar__profile-avatar {
  position: relative;

  z-index: 1;

  flex: 0 0 auto;

  background:
    linear-gradient(
      145deg,
      var(--fe-gold),
      #E8BD62
    ) !important;

  color:
    var(--fe-navy-deep) !important;

  font-weight: 700;

  box-shadow:
    0 5px 14px rgba(217,164,65,.22);
}

.fe-family-sidebar__profile-info {
  position: relative;

  z-index: 1;

  min-width: 0;

  flex: 1;
}

.fe-family-sidebar__profile-name {
  display: block;

  overflow: hidden;

  color: var(--fe-navy);

  font-size: 12px;
  font-weight: 700;

  line-height: 1.35;

  white-space: nowrap;

  text-overflow: ellipsis;
}

.fe-family-sidebar__profile-role {
  display: flex;
  align-items: center;

  gap: 6px;

  margin-top: 5px;

  color: var(--fe-muted);

  font-size: 9px;
  font-weight: 500;
}

.fe-family-sidebar__online {
  width: 7px;
  height: 7px;

  flex: 0 0 7px;

  border-radius: 50%;

  background: var(--fe-green);

  box-shadow:
    0 0 0 3px rgba(46,125,91,.12);
}

/* =========================================================
   CONTENT
========================================================= */

.fe-family-sidebar__content {
  position: relative;

  display: flex;
  flex-direction: column;

  flex: 1;

  min-height: 0;

  overflow: hidden;
}

.fe-family-sidebar__navigation {
  flex: 1;

  min-height: 0;

  padding: 5px 12px 10px;

  overflow-x: hidden;
  overflow-y: auto;

  scrollbar-width: thin;
}

.fe-family-sidebar__section {
  margin-bottom: 17px;
}

.fe-family-sidebar__section-title {
  display: flex;
  align-items: center;

  padding: 0 10px 7px;

  color: var(--fe-light-muted);

  font-size: 9px;
  font-weight: 700;

  letter-spacing: .8px;

  text-transform: uppercase;
}

/* =========================================================
   ANT MENU
========================================================= */

.fe-family-sidebar__menu.ant-menu {
  width: 100%;

  border: 0 !important;

  background: transparent !important;

  font-family: inherit;
}

.fe-family-sidebar__menu .ant-menu-item {
  display: flex;
  align-items: center;

  width: 100%;
  height: 49px;

  margin: 3px 0 !important;

  padding: 0 11px !important;

  border-radius: 13px;

  color: #64748B;

  font-size: 11px;
  font-weight: 600;

  transition:
    background .18s ease,
    color .18s ease,
    transform .18s ease;
}

.fe-family-sidebar__menu .ant-menu-item::after {
  display: none !important;
}

.fe-family-sidebar__menu .ant-menu-item .anticon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 23px;
  height: 23px;

  flex: 0 0 23px;

  margin-right: 11px;

  color: #7890A6;

  font-size: 18px;

  transition:
    color .18s ease,
    transform .18s ease;
}

.fe-family-sidebar__menu .ant-menu-title-content {
  min-width: 0;

  overflow: hidden;

  white-space: nowrap;

  text-overflow: ellipsis;
}

.fe-family-sidebar__menu .ant-menu-item:hover {
  color: var(--fe-navy) !important;

  background: var(--fe-blue-soft) !important;

  transform: translateX(2px);
}

.fe-family-sidebar__menu .ant-menu-item:hover .anticon {
  color: var(--fe-navy);

  transform: scale(1.05);
}

.fe-family-sidebar__menu .ant-menu-item-selected,
.fe-family-sidebar__menu .ant-menu-item-selected:hover {
  color: var(--fe-navy) !important;

  background:
    linear-gradient(
      90deg,
      #FFF9EE 0%,
      #FBF5E7 100%
    ) !important;

  font-weight: 700;

  box-shadow:
    inset 3px 0 0 var(--fe-gold),
    0 3px 12px rgba(16,42,67,.04);
}

.fe-family-sidebar__menu
.ant-menu-item-selected
.anticon {
  color: var(--fe-gold) !important;
}

/* =========================================================
   MENU INNER
========================================================= */

.fe-family-sidebar__menu-item-inner {
  display: flex;
  align-items: center;

  width: 100%;
  min-width: 0;
}

.fe-family-sidebar__menu-badge {
  margin-left: auto;
}

.fe-family-sidebar__menu-badge .ant-badge-count {
  min-width: 18px;
  height: 18px;

  padding: 0 5px;

  border: 2px solid #fff;

  border-radius: 99px;

  background: var(--fe-danger);

  box-shadow: none;

  font-size: 8px;
  font-weight: 700;

  line-height: 14px;
}

/* =========================================================
   FAITH CARD
========================================================= */

.fe-family-sidebar__faith-card {
  position: relative;

  margin: 5px 12px 11px;

  min-height: 97px;

  padding: 12px 13px;

  border:
    1px solid rgba(217,164,65,.22);

  border-radius: 16px;

  background:
    linear-gradient(
      135deg,
      #FFF9EE 0%,
      #FFFFFF 100%
    );

  overflow: hidden;

  box-shadow:
    0 4px 16px rgba(217,164,65,.06);
}

.fe-family-sidebar__faith-card::before {
  content: "";

  position: absolute;

  right: -25px;
  top: -30px;

  width: 100px;
  height: 100px;

  border-radius: 50%;

  background:
    rgba(217,164,65,.08);
}

.fe-family-sidebar__faith-icon {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 29px;
  height: 29px;

  margin-bottom: 7px;

  border-radius: 9px;

  background: var(--fe-gold-soft);

  color: var(--fe-gold);

  font-size: 14px;
}

.fe-family-sidebar__faith-title {
  position: relative;

  color: var(--fe-navy);

  font-family:
    "Playfair Display",
    Georgia,
    serif;

  font-size: 12px;
  font-weight: 600;

  line-height: 1.3;
}

.fe-family-sidebar__faith-text {
  position: relative;

  margin-top: 3px;

  color: var(--fe-muted);

  font-size: 8px;

  line-height: 1.5;
}

/* =========================================================
   SUPPORT
========================================================= */

.fe-family-sidebar__support {
  flex-shrink: 0;

  padding: 0 12px 11px;
}

.fe-family-sidebar__support-button {
  width: 100%;
  min-height: 43px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  border:
    1px solid rgba(217,164,65,.3);

  border-radius: 12px;

  background: #fff;

  color: var(--fe-navy);

  font-family: inherit;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;

  transition: all .2s ease;
}

.fe-family-sidebar__support-button:hover {
  border-color: var(--fe-gold);

  background: var(--fe-cream);

  transform: translateY(-1px);

  box-shadow:
    0 5px 15px rgba(217,164,65,.1);
}

.fe-family-sidebar__support-icon {
  color: var(--fe-gold);

  font-size: 14px;
}

/* =========================================================
   FOOTER
========================================================= */

.fe-family-sidebar__footer {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 39px;

  padding: 0 15px;

  border-top:
    1px solid var(--fe-border);

  color: var(--fe-light-muted);

  font-size: 8px;
}

.fe-family-sidebar__footer-brand {
  color: var(--fe-navy);

  font-weight: 700;
}

/* =========================================================
   COLLAPSED
========================================================= */

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__brand {
  justify-content: center;

  padding: 14px 8px;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__brand-copy {
  display: none;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__profile-wrap {
  padding: 13px 8px;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__profile {
  justify-content: center;

  padding: 9px;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__profile-info {
  display: none;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__navigation {
  padding-left: 8px;
  padding-right: 8px;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__section-title {
  justify-content: center;

  padding: 0 0 7px;

  font-size: 0;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__section-title::before {
  content: "";

  width: 24px;
  height: 1px;

  background: var(--fe-border);
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__menu .ant-menu-item {
  justify-content: center;

  padding: 0 !important;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__menu .ant-menu-item .anticon {
  margin: 0;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__menu .ant-menu-title-content {
  display: none;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__faith-card {
  min-height: 44px;

  margin: 6px 8px 10px;

  padding: 8px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__faith-icon {
  margin: 0;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__faith-title,
.fe-family-sidebar.is-collapsed
.fe-family-sidebar__faith-text {
  display: none;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__support {
  padding: 0 8px 10px;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__support-button {
  width: 42px;

  margin: auto;

  padding: 0;

  font-size: 0;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__support-icon {
  font-size: 15px;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__footer {
  justify-content: center;

  padding: 0;
}

.fe-family-sidebar.is-collapsed
.fe-family-sidebar__footer-brand,
.fe-family-sidebar.is-collapsed
.fe-family-sidebar__footer-version {
  display: none;
}

/* =========================================================
   MOBILE BOTTOM
========================================================= */

.fe-family-mobile-bottom {
  display: none;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 767px) {

  .fe-family-sidebar {
    display: none !important;
  }

  .fe-family-mobile-bottom {
    position: fixed;

    left: 9px;
    right: 9px;

    bottom:
      calc(
        8px +
        env(safe-area-inset-bottom)
      );

    z-index: 1200;

    display: grid;

    grid-template-columns:
      repeat(4, minmax(0, 1fr));

    min-height: 68px;

    padding: 6px;

    border:
      1px solid rgba(226,232,240,.96);

    border-radius: 22px;

    background:
      rgba(255,255,255,.96);

    box-shadow:
      0 15px 40px rgba(16,42,67,.15);

    backdrop-filter:
      blur(18px);

    -webkit-backdrop-filter:
      blur(18px);
  }

  .fe-family-mobile-bottom__item {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap: 3px;

    min-width: 0;

    padding: 3px;

    border: 0;

    border-radius: 16px;

    background: transparent;

    color: #8190A1;

    font-family: inherit;

    font-size: 8px;
    font-weight: 600;

    cursor: pointer;

    transition:
      background .18s ease,
      color .18s ease,
      transform .18s ease;
  }

  .fe-family-mobile-bottom__item:active {
    transform: scale(.93);
  }

  .fe-family-mobile-bottom__icon {
    width: 30px;
    height: 30px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 10px;

    font-size: 17px;

    transition: all .18s ease;
  }

  .fe-family-mobile-bottom__item.is-active {
    color: var(--fe-navy);
  }

  .fe-family-mobile-bottom__item.is-active
  .fe-family-mobile-bottom__icon {
    color: var(--fe-gold);

    background: var(--fe-cream);
  }

  /* MORE */

  .fe-family-mobile-bottom__item.is-more {
    color: var(--fe-navy);
  }

  .fe-family-mobile-bottom__item.is-more
  .fe-family-mobile-bottom__icon {
    color: #fff;

    background: var(--fe-navy);

    box-shadow:
      0 6px 15px rgba(23,59,94,.22);
  }

  .fe-family-mobile-bottom__badge {
    position: absolute;

    top: 3px;

    right:
      calc(50% - 22px);

    min-width: 16px;
    height: 16px;

    padding: 0 4px;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      2px solid #fff;

    border-radius: 50px;

    background: var(--fe-danger);

    color: #fff;

    font-size: 7px;
    font-weight: 700;
  }
}

/* =========================================================
   MOBILE DRAWER
========================================================= */

.fe-family-mobile-drawer {
  min-height: 100%;

  display: flex;
  flex-direction: column;

  background:
    linear-gradient(
      180deg,
      #FFFFFF 0%,
      #FFFFFF 70%,
      #FFF9EE 100%
    );

  color: var(--fe-text);

  font-family:
    "Be Vietnam Pro",
    Inter,
    sans-serif;
}

.fe-family-mobile-drawer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding:
    18px
    18px
    14px;

  border-bottom:
    1px solid var(--fe-border);
}

.fe-family-mobile-drawer__brand {
  display: flex;
  align-items: center;

  gap: 10px;

  min-width: 0;
}

.fe-family-mobile-drawer__brand-logo {
  width: 43px;
  height: 43px;

  flex: 0 0 43px;

  border-radius: 13px;

  background: var(--fe-cream);

  border:
    1px solid rgba(217,164,65,.25);

  overflow: hidden;

  box-shadow:
    0 4px 12px rgba(217,164,65,.10);
}

.fe-family-mobile-drawer__brand-logo img {
  width: 100%;
  height: 100%;

  object-fit: contain;
}

.fe-family-mobile-drawer__brand-copy {
  min-width: 0;
}

.fe-family-mobile-drawer__brand-name {
  color: var(--fe-navy);

  font-size: 18px;
  font-weight: 700;

  line-height: 1.15;
}

.fe-family-mobile-drawer__brand-name span {
  color: var(--fe-gold);
}

.fe-family-mobile-drawer__brand-subtitle {
  margin-top: 3px;

  color: var(--fe-muted);

  font-size: 8px;

  white-space: nowrap;
}

.fe-family-mobile-drawer__close {
  width: 38px;
  height: 38px;

  flex: 0 0 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 0;

  border-radius: 12px;

  background: var(--fe-blue-soft);

  color: var(--fe-navy);

  font-size: 17px;

  cursor: pointer;
}

/* PROFILE */

.fe-family-mobile-drawer__profile {
  position: relative;

  margin: 15px 16px 12px;

  padding: 12px;

  display: flex;
  align-items: center;

  gap: 11px;

  border:
    1px solid var(--fe-border);

  border-radius: 17px;

  background:
    linear-gradient(
      135deg,
      #F7F9FC,
      #FFFFFF,
      #FFF9EE
    );

  overflow: hidden;
}

.fe-family-mobile-drawer__profile::after {
  content: "";

  position: absolute;

  right: -25px;
  bottom: -35px;

  width: 100px;
  height: 100px;

  border-radius: 50%;

  background:
    rgba(217,164,65,.09);
}

.fe-family-mobile-drawer__avatar {
  position: relative;

  z-index: 1;

  background:
    linear-gradient(
      145deg,
      var(--fe-gold),
      #E8BD62
    ) !important;

  color:
    var(--fe-navy-deep) !important;

  font-weight: 700;
}

.fe-family-mobile-drawer__profile-info {
  position: relative;

  z-index: 1;

  min-width: 0;
}

.fe-family-mobile-drawer__profile-name {
  display: block;

  max-width: 210px;

  overflow: hidden;

  color: var(--fe-navy);

  font-size: 12px;
  font-weight: 700;

  white-space: nowrap;

  text-overflow: ellipsis;
}

.fe-family-mobile-drawer__profile-role {
  display: flex;
  align-items: center;

  gap: 6px;

  margin-top: 4px;

  color: var(--fe-muted);

  font-size: 9px;
}

/* BODY */

.fe-family-mobile-drawer__body {
  flex: 1;

  overflow-y: auto;

  padding-bottom: 16px;
}

.fe-family-mobile-drawer__section {
  padding: 0 12px;

  margin-bottom: 10px;
}

.fe-family-mobile-drawer__title {
  padding:
    7px
    8px;

  color: var(--fe-light-muted);

  font-size: 9px;
  font-weight: 700;

  letter-spacing: .8px;

  text-transform: uppercase;
}

.fe-family-mobile-drawer__item {
  width: 100%;
  min-height: 54px;

  display: flex;
  align-items: center;

  gap: 12px;

  padding: 8px 11px;

  margin: 3px 0;

  border: 0;

  border-radius: 14px;

  background: transparent;

  color: var(--fe-muted);

  text-align: left;

  font-family: inherit;

  cursor: pointer;

  transition: all .18s ease;
}

.fe-family-mobile-drawer__item:hover {
  background: var(--fe-blue-soft);

  color: var(--fe-navy);
}

.fe-family-mobile-drawer__item.is-active {
  background:
    linear-gradient(
      90deg,
      #FFF9EE,
      #FBF5E7
    );

  color: var(--fe-navy);

  box-shadow:
    inset 3px 0 0 var(--fe-gold);
}

.fe-family-mobile-drawer__item-icon {
  width: 35px;
  height: 35px;

  flex: 0 0 35px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  background: #F7F9FC;

  color: #7890A6;

  font-size: 17px;
}

.fe-family-mobile-drawer__item.is-active
.fe-family-mobile-drawer__item-icon {
  background: var(--fe-gold-soft);

  color: var(--fe-gold);
}

.fe-family-mobile-drawer__item-copy {
  min-width: 0;

  flex: 1;
}

.fe-family-mobile-drawer__item-label {
  display: block;

  color: inherit;

  font-size: 11px;
  font-weight: 700;
}

.fe-family-mobile-drawer__item-description {
  display: block;

  margin-top: 2px;

  color: var(--fe-light-muted);

  font-size: 8px;
}

/* BADGE */

.fe-family-mobile-drawer__item-badge {
  margin-left: auto;
}

.fe-family-mobile-drawer__item-badge .ant-badge-count {
  background: var(--fe-danger);

  box-shadow: none;

  font-size: 8px;
}

/* FAITH */

.fe-family-mobile-drawer__faith {
  position: relative;

  margin:
    3px
    16px
    14px;

  padding: 13px;

  border:
    1px solid rgba(217,164,65,.22);

  border-radius: 16px;

  background:
    linear-gradient(
      135deg,
      #FFF9EE,
      #FFFFFF
    );

  overflow: hidden;
}

.fe-family-mobile-drawer__faith::before {
  content: "";

  position: absolute;

  right: -30px;
  top: -35px;

  width: 100px;
  height: 100px;

  border-radius: 50%;

  background:
    rgba(217,164,65,.08);
}

.fe-family-mobile-drawer__faith-icon {
  position: relative;

  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 7px;

  border-radius: 9px;

  background: var(--fe-gold-soft);

  color: var(--fe-gold);

  font-size: 14px;
}

.fe-family-mobile-drawer__faith-title {
  position: relative;

  color: var(--fe-navy);

  font-family:
    "Playfair Display",
    Georgia,
    serif;

  font-size: 12px;
  font-weight: 600;
}

.fe-family-mobile-drawer__faith-text {
  position: relative;

  margin-top: 3px;

  color: var(--fe-muted);

  font-size: 8px;

  line-height: 1.5;
}

/* LOGOUT */

.fe-family-mobile-drawer__logout {
  width: calc(100% - 32px);

  min-height: 46px;

  margin:
    auto
    16px
    16px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  border:
    1px solid rgba(201,76,76,.18);

  border-radius: 13px;

  background: #FFF7F7;

  color: var(--fe-danger);

  font-family: inherit;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;

  transition: all .18s ease;
}

.fe-family-mobile-drawer__logout:hover {
  background: #FDECEC;
}

/* =========================================================
   ANT DRAWER
========================================================= */

.fe-family-mobile-drawer-host.ant-drawer {
  z-index: 1500;
}

.fe-family-mobile-drawer-host
.ant-drawer-content {
  overflow: hidden;

  background:
    linear-gradient(
      180deg,
      #FFFFFF 0%,
      #FFFFFF 70%,
      #FFF9EE 100%
    );
}

.fe-family-mobile-drawer-host
.ant-drawer-body {
  padding: 0 !important;
}

.fe-family-mobile-drawer-host
.ant-drawer-mask {
  background:
    rgba(16,42,67,.38);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.fe-family-mobile-drawer-host
.ant-drawer-content-wrapper {
  box-shadow:
    12px 0 40px rgba(16,42,67,.15);
}

/* =========================================================
   ACCESSIBILITY
========================================================= */

.fe-family-sidebar button:focus-visible,
.fe-family-mobile-bottom button:focus-visible,
.fe-family-mobile-drawer button:focus-visible {
  outline:
    2px solid var(--fe-gold);

  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {

  .fe-family-sidebar *,
  .fe-family-mobile-bottom *,
  .fe-family-mobile-drawer * {
    transition: none !important;
    animation: none !important;
  }
}

/* =========================================================
   SMALL PHONE
========================================================= */

@media (max-width: 380px) {

  .fe-family-mobile-bottom {
    left: 7px;
    right: 7px;

    min-height: 64px;

    border-radius: 20px;
  }

  .fe-family-mobile-bottom__icon {
    width: 27px;
    height: 27px;

    font-size: 16px;
  }

  .fe-family-mobile-bottom__item {
    font-size: 7.5px;
  }
}
`;

/* =========================================================
   COMPONENT
========================================================= */

export default function ParentSidebar({
  user,

  selectedKey,

  onMenuClick,
  onContactClick,

  notificationCount = 0,

  onMoreClick,
  onLogout,

  mobileDrawerOpen,
  onCloseMobileDrawer,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  /* =======================================================
     USER
  ======================================================= */

  const displayName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    "Phụ huynh";

  const avatarText = displayName?.trim()?.charAt(0)?.toUpperCase() || "P";

  /* =======================================================
     CURRENT PATH
  ======================================================= */

  const currentPath = location.pathname.replace(/\/+$/, "") || "/";

  /* =======================================================
     ACTIVE
  ======================================================= */

  const routeSelectedKey = useMemo(() => {
    if (currentPath === "/parent") {
      return "/parent";
    }

    if (
      currentPath === "/parent/students" ||
      currentPath.startsWith("/parent/students/")
    ) {
      return "/parent/students";
    }

    if (
      currentPath === "/parent/children" ||
      currentPath.startsWith("/parent/children/")
    ) {
      return "/parent/students";
    }

    if (
      currentPath === "/parent/notifications" ||
      currentPath.startsWith("/parent/notifications/")
    ) {
      return "/parent/notifications";
    }

    if (
      currentPath === "/parent/support" ||
      currentPath.startsWith("/parent/support/") ||
      currentPath === "/parent/contact" ||
      currentPath.startsWith("/parent/contact/")
    ) {
      return "/parent/support";
    }

    if (
      currentPath === "/parent/profile" ||
      currentPath.startsWith("/parent/profile/")
    ) {
      return "/parent/profile";
    }

    if (
      currentPath === "/parent/settings" ||
      currentPath.startsWith("/parent/settings/")
    ) {
      return "/parent/settings";
    }

    return "/parent";
  }, [currentPath]);

  const activeKey = selectedKey || routeSelectedKey;

  /* =======================================================
     CLOSE DRAWER
  ======================================================= */

  const closeMobileDrawer = () => {
    onCloseMobileDrawer?.();
  };

  /* =======================================================
     OPEN DRAWER
  ======================================================= */

  const openMobileDrawer = () => {
    onMoreClick?.();
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goTo = (key, info = null) => {
    if (!key) {
      return;
    }

    /* HỖ TRỢ */
    if (key === "/parent/support") {
      closeMobileDrawer();

      if (onContactClick) {
        onContactClick(
          info || {
            key,
          },
        );
      } else if (currentPath !== "/parent/support") {
        navigate("/parent/support");
      }

      return;
    }

    closeMobileDrawer();

    if (key !== currentPath) {
      navigate(key);
    }

    onMenuClick?.(
      info || {
        key,
      },
    );
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    closeMobileDrawer();

    onLogout?.();
  };

  /* =======================================================
     DESKTOP MENU
  ======================================================= */

  const renderDesktopMenu = (items) => {
    return (
      <Menu
        mode="inline"
        selectedKeys={activeKey ? [activeKey] : []}
        className="fe-family-sidebar__menu"
        items={items.map((item) => ({
          key: item.key,

          icon: collapsed ? (
            <Tooltip title={item.label} placement="right">
              {item.icon}
            </Tooltip>
          ) : (
            item.icon
          ),

          label: (
            <div className="fe-family-sidebar__menu-item-inner">
              <span>{item.label}</span>

              {item.key === "/parent/notifications" &&
                notificationCount > 0 &&
                !collapsed && (
                  <Badge
                    className="fe-family-sidebar__menu-badge"
                    count={notificationCount}
                    overflowCount={99}
                  />
                )}
            </div>
          ),
        }))}
        onClick={(info) => goTo(info.key, info)}
      />
    );
  };

  /* =======================================================
     MOBILE BOTTOM
  ======================================================= */

  const mobileBottomItems = [MENU_ITEMS[0], MENU_ITEMS[1], MENU_ITEMS[2]];

  /* =======================================================
     MOBILE DRAWER MENU
  ======================================================= */

  const renderMobileDrawerItem = (item) => {
    const isActive =
      activeKey === item.key ||
      (item.key === "/parent/students" &&
        (currentPath.startsWith("/parent/children/") ||
          currentPath === "/parent/children"));

    return (
      <button
        key={item.key}
        type="button"
        className={[
          "fe-family-mobile-drawer__item",
          isActive ? "is-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => goTo(item.key)}
      >
        <span className="fe-family-mobile-drawer__item-icon">{item.icon}</span>

        <span className="fe-family-mobile-drawer__item-copy">
          <span className="fe-family-mobile-drawer__item-label">
            {item.label}
          </span>

          <span className="fe-family-mobile-drawer__item-description">
            {item.description}
          </span>
        </span>

        {item.key === "/parent/notifications" && notificationCount > 0 && (
          <Badge
            className="fe-family-mobile-drawer__item-badge"
            count={notificationCount}
            overflowCount={99}
          />
        )}
      </button>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>{SIDEBAR_CSS}</style>

      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside
        className={["fe-family-sidebar", collapsed ? "is-collapsed" : ""]
          .filter(Boolean)
          .join(" ")}
        aria-label="Thanh điều hướng FaithEdu Family"
      >
        {/* BRAND */}

        <div className="fe-family-sidebar__brand">
          <button
            type="button"
            className="fe-family-sidebar__collapse"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={
              collapsed
                ? "Mở rộng thanh điều hướng"
                : "Thu gọn thanh điều hướng"
            }
          >
            {collapsed ? <RightOutlined /> : <LeftOutlined />}
          </button>

          <button
            type="button"
            className="fe-family-sidebar__brand-link"
            onClick={() => goTo("/parent")}
          >
            <div className="fe-family-sidebar__logo">
              <img
                src={logoxn}
                alt="FaithEdu"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="fe-family-sidebar__brand-copy">
              <div className="fe-family-sidebar__brand-name">
                Faith
                <span>Edu</span>
              </div>

              <div className="fe-family-sidebar__brand-subtitle">
                Đồng hành cùng gia đình trong đức tin
              </div>
            </div>
          </button>
        </div>

        {/* PROFILE */}

        <div className="fe-family-sidebar__profile-wrap">
          <div className="fe-family-sidebar__profile">
            <Avatar size={42} className="fe-family-sidebar__profile-avatar">
              {avatarText}
            </Avatar>

            <div className="fe-family-sidebar__profile-info">
              <span className="fe-family-sidebar__profile-name">
                {displayName}
              </span>

              <div className="fe-family-sidebar__profile-role">
                <span className="fe-family-sidebar__online" />

                <span>Phụ huynh</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="fe-family-sidebar__content">
          <nav
            className="fe-family-sidebar__navigation"
            aria-label="Điều hướng gia đình"
          >
            {/* MAIN */}

            <div className="fe-family-sidebar__section">
              <div className="fe-family-sidebar__section-title">
                Không gian gia đình
              </div>

              {renderDesktopMenu(MENU_ITEMS)}
            </div>

            {/* ACCOUNT */}

            <div className="fe-family-sidebar__section">
              <div className="fe-family-sidebar__section-title">Tài khoản</div>

              {renderDesktopMenu(ACCOUNT_ITEMS)}
            </div>
          </nav>

          {/* FAITH */}

          {!collapsed && (
            <div className="fe-family-sidebar__faith-card">
              <div className="fe-family-sidebar__faith-icon">
                <HeartFilled />
              </div>

              <div className="fe-family-sidebar__faith-title">
                Cùng con lớn lên trong đức tin
              </div>

              <div className="fe-family-sidebar__faith-text">
                FaithEdu đồng hành cùng gia đình trong hành trình học giáo lý và
                sống đạo.
              </div>
            </div>
          )}

          {/* SUPPORT */}

          <div className="fe-family-sidebar__support">
            <button
              type="button"
              className="fe-family-sidebar__support-button"
              onClick={() => goTo("/parent/support")}
            >
              <QuestionCircleOutlined className="fe-family-sidebar__support-icon" />

              {!collapsed && <span>Cần hỗ trợ? Liên hệ FaithEdu</span>}
            </button>
          </div>
        </div>

        {/* FOOTER */}

        <div className="fe-family-sidebar__footer">
          <span className="fe-family-sidebar__footer-brand">
            FaithEdu Family
          </span>

          <span className="fe-family-sidebar__footer-version">v2026</span>
        </div>
      </aside>

      {/* =================================================
          MOBILE BOTTOM NAV
          
          QUAN TRỌNG:
          Component này KHÔNG nằm trong Drawer.
          Vì vậy nó luôn hiện trên mobile.
      ================================================= */}

      <nav className="fe-family-mobile-bottom" aria-label="Điều hướng nhanh">
        {mobileBottomItems.map((item) => {
          const isActive =
            activeKey === item.key ||
            (item.key === "/parent/students" &&
              (currentPath.startsWith("/parent/children/") ||
                currentPath === "/parent/children"));

          return (
            <button
              key={item.key}
              type="button"
              className={[
                "fe-family-mobile-bottom__item",
                isActive ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => goTo(item.key)}
            >
              <span className="fe-family-mobile-bottom__icon">{item.icon}</span>

              <span>{item.label}</span>

              {item.key === "/parent/notifications" &&
                notificationCount > 0 && (
                  <span className="fe-family-mobile-bottom__badge">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
            </button>
          );
        })}

        {/* MORE */}

        <button
          type="button"
          className={["fe-family-mobile-bottom__item", "is-more"].join(" ")}
          onClick={openMobileDrawer}
        >
          <span className="fe-family-mobile-bottom__icon">
            <MenuOutlined />
          </span>

          <span>Thêm</span>
        </button>
      </nav>

      {/* =================================================
          MOBILE DRAWER
          
          Drawer thuộc ParentSidebar.
          ParentLayout KHÔNG được bọc thêm Drawer nữa.
      ================================================= */}

      <Drawer
        placement="left"
        open={Boolean(mobileDrawerOpen)}
        onClose={closeMobileDrawer}
        width="min(318px, 88vw)"
        closable={false}
        destroyOnClose={false}
        className="fe-family-mobile-drawer-host"
      >
        <div className="fe-family-mobile-drawer">
          {/* TOP */}

          <div className="fe-family-mobile-drawer__top">
            <div className="fe-family-mobile-drawer__brand">
              <div className="fe-family-mobile-drawer__brand-logo">
                <img
                  src={logoxn}
                  alt="FaithEdu"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="fe-family-mobile-drawer__brand-copy">
                <div className="fe-family-mobile-drawer__brand-name">
                  Faith
                  <span>Edu</span>
                </div>

                <div className="fe-family-mobile-drawer__brand-subtitle">
                  Không gian gia đình
                </div>
              </div>
            </div>

            <button
              type="button"
              className="fe-family-mobile-drawer__close"
              onClick={closeMobileDrawer}
              aria-label="Đóng menu"
            >
              <CloseOutlined />
            </button>
          </div>

          {/* PROFILE */}

          <div className="fe-family-mobile-drawer__profile">
            <Avatar size={44} className="fe-family-mobile-drawer__avatar">
              {avatarText}
            </Avatar>

            <div className="fe-family-mobile-drawer__profile-info">
              <span className="fe-family-mobile-drawer__profile-name">
                {displayName}
              </span>

              <div className="fe-family-mobile-drawer__profile-role">
                <span className="fe-family-sidebar__online" />

                <span>Phụ huynh</span>
              </div>
            </div>
          </div>

          <div className="fe-family-mobile-drawer__body">
            {/* MAIN */}

            <div className="fe-family-mobile-drawer__section">
              <div className="fe-family-mobile-drawer__title">
                Không gian gia đình
              </div>

              {MENU_ITEMS.map(renderMobileDrawerItem)}
            </div>

            {/* ACCOUNT */}

            <div className="fe-family-mobile-drawer__section">
              <div className="fe-family-mobile-drawer__title">Tài khoản</div>

              {ACCOUNT_ITEMS.map(renderMobileDrawerItem)}
            </div>

            {/* FAITH */}

            <div className="fe-family-mobile-drawer__faith">
              <div className="fe-family-mobile-drawer__faith-icon">
                <HeartFilled />
              </div>

              <div className="fe-family-mobile-drawer__faith-title">
                Cùng con lớn lên trong đức tin
              </div>

              <div className="fe-family-mobile-drawer__faith-text">
                FaithEdu đồng hành cùng gia đình trong hành trình học giáo lý và
                sống đạo.
              </div>
            </div>
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            className="fe-family-mobile-drawer__logout"
            onClick={handleLogout}
          >
            <LogoutOutlined />

            <span>Đăng xuất</span>
          </button>
        </div>
      </Drawer>
    </>
  );
}
