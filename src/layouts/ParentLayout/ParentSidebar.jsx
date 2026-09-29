import React from "react";
import { Menu } from "antd";

import {
  DashboardOutlined,
  TeamOutlined,
  HomeOutlined,
  BellOutlined,
  UserOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

/**
 * =========================================================
 * DESIGN TOKENS
 * =========================================================
 */

const SIDEBAR_IMAGES = {
  logo: "/images/faith-edu-logo.png",
  church: "/images/church-illustration.png",
};

/**
 * =========================================================
 * MENU
 * =========================================================
 */

export const MENU_ITEMS = [
  {
    key: "/parent",
    icon: <DashboardOutlined />,
    label: "Tổng quan",
  },
  {
    key: "/parent/students",
    icon: <TeamOutlined />,
    label: "Con của tôi",
  },
  {
    key: "/parent/notifications",
    icon: <BellOutlined />,
    label: "Thông báo",
  },
  {
    key: "/parent/contact",
    icon: <CustomerServiceOutlined />,
    label: "Liên hệ giáo xứ",
  },
  {
    key: "/parent/account",
    icon: <UserOutlined />,
    label: "Tài khoản",
  },
];

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

/**
 * =========================================================
 * CSS
 * =========================================================
 */

const SIDEBAR_CSS = `
.parent-sidebar,
.parent-sidebar * {
  box-sizing: border-box;
}

.parent-sidebar {
  --parent-navy: #173B5E;
  --parent-navy-dark: #102F4B;
  --parent-gold: #D9A441;

  --parent-bg: #FFFFFF;
  --parent-soft: #F7F9FC;
  --parent-border: #E7ECF2;

  --parent-text: #1E293B;
  --parent-muted: #718096;

  width: 250px;
  height: 100vh;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  background: var(--parent-bg);

  font-family:
    Inter,
    "Be Vietnam Pro",
    "Segoe UI",
    Arial,
    sans-serif;

  color: var(--parent-text);
}

/* =========================================================
   BRAND
========================================================= */

.parent-sidebar__brand {
  position: relative;

  height: 76px;
  min-height: 76px;

  padding: 0 18px;

  display: flex;
  align-items: center;
  gap: 11px;

  border-bottom: 1px solid var(--parent-border);

  background: #fff;
}

.parent-sidebar__brand::after {
  content: "";

  position: absolute;

  left: 18px;
  bottom: -1px;

  width: 34px;
  height: 2px;

  border-radius: 10px;

  background: var(--parent-gold);
}

.parent-sidebar__logo {
  width: 43px;
  height: 43px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;
}

.parent-sidebar__logo img {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: contain;
}

.parent-sidebar__logo-fallback {
  width: 43px;
  height: 43px;

  display: none;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background:
    linear-gradient(
      135deg,
      #173B5E,
      #285E86
    );

  color: #fff;

  font-size: 15px;
  font-weight: 800;

  box-shadow:
    0 5px 14px rgba(23, 59, 94, 0.16);
}

.parent-sidebar__brand-text {
  min-width: 0;
}

.parent-sidebar__brand-name {
  color: var(--parent-navy);

  font-size: 19px;
  font-weight: 800;

  line-height: 1.15;

  letter-spacing: -0.4px;
}

.parent-sidebar__brand-subtitle {
  margin-top: 5px;

  color: #8A96A8;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 1.1px;
  text-transform: uppercase;
}

/* =========================================================
   USER
========================================================= */

.parent-sidebar__user-wrap {
  padding: 16px 13px 12px;

  flex-shrink: 0;
}

.parent-sidebar__user-card {
  position: relative;

  min-width: 0;

  padding: 11px;

  display: flex;
  align-items: center;

  gap: 10px;

  border:
    1px solid
    #E8EDF3;

  border-radius: 14px;

  background:
    linear-gradient(
      145deg,
      #FAFCFE 0%,
      #F5F8FB 100%
    );

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.parent-sidebar__user-card:hover {
  border-color: #D9E3ED;

  box-shadow:
    0 5px 18px
    rgba(23, 59, 94, 0.05);
}

.parent-sidebar__avatar {
  flex-shrink: 0;

  background:
    linear-gradient(
      135deg,
      #173B5E,
      #2C638D
    ) !important;

  color: #fff;

  font-weight: 700;

  box-shadow:
    0 4px 10px
    rgba(23, 59, 94, 0.14);
}

.parent-sidebar__user-info {
  min-width: 0;
  flex: 1;
}

.parent-sidebar__user-name {
  display: block;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;

  color: #172B45 !important;

  font-size: 12.5px;
  font-weight: 700;

  line-height: 1.3;
}

.parent-sidebar__user-role {
  margin-top: 5px;

  display: flex;
  align-items: center;
  gap: 6px;

  color: #8190A3;

  font-size: 10.5px;
}

.parent-sidebar__status-dot {
  width: 6px;
  height: 6px;

  flex-shrink: 0;

  border-radius: 50%;

  background: #22C55E;

  box-shadow:
    0 0 0 3px
    rgba(34, 197, 94, 0.09);
}

/* =========================================================
   NAVIGATION
========================================================= */

.parent-sidebar__navigation {
  flex: 1;
  min-height: 0;

  padding: 4px 10px 8px;

  overflow-x: hidden;
  overflow-y: auto;

  overscroll-behavior: contain;
}

.parent-sidebar__section-title {
  padding: 7px 10px 9px;

  color: #A0ACBA;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 1px;

  text-transform: uppercase;
}

.parent-sidebar__menu {
  width: 100%;

  border-inline-end: none !important;

  background: transparent !important;
}

/* MENU ITEM */

.parent-sidebar__menu
.ant-menu-item {
  position: relative;

  width: 100%;

  height: 43px;
  line-height: 43px;

  margin: 2px 0 !important;

  padding:
    0 13px !important;

  display: flex;
  align-items: center;

  gap: 11px;

  border-radius: 10px;

  color: #63748A;

  font-size: 12px;
  font-weight: 500;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.parent-sidebar__menu
.ant-menu-item
.anticon {
  width: 19px;

  flex-shrink: 0;

  color: #8494A8;

  font-size: 17px;

  transition:
    color 0.18s ease,
    transform 0.18s ease;
}

.parent-sidebar__menu
.ant-menu-title-content {
  min-width: 0;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* HOVER */

.parent-sidebar__menu
.ant-menu-item:hover {
  color:
    var(--parent-navy) !important;

  background:
    #F5F8FB !important;

  transform:
    translateX(2px);
}

.parent-sidebar__menu
.ant-menu-item:hover
.anticon {
  color:
    var(--parent-navy);

  transform:
    scale(1.04);
}

/* ACTIVE */

.parent-sidebar__menu
.ant-menu-item-selected {
  color:
    var(--parent-navy) !important;

  background:
    linear-gradient(
      90deg,
      #EDF4F8 0%,
      #F6F9FC 100%
    ) !important;

  font-weight: 700;
}

.parent-sidebar__menu
.ant-menu-item-selected::before {
  content: "";

  position: absolute;

  left: 0;
  top: 9px;
  bottom: 9px;

  width: 3px;

  border-radius:
    0 4px 4px 0;

  background:
    var(--parent-gold);
}

.parent-sidebar__menu
.ant-menu-item-selected
.anticon {
  color:
    var(--parent-navy) !important;
}

.parent-sidebar__menu
.ant-menu-item::after {
  display: none !important;
}

/* =========================================================
   BOTTOM AREA
========================================================= */

.parent-sidebar__bottom {
  position: relative;

  flex-shrink: 0;

  padding:
    0 12px 13px;

  background: #fff;
}

/* CHURCH */

.parent-sidebar__church {
  height: 76px;

  margin:
    0 -2px -3px;

  display: flex;
  align-items: flex-end;
  justify-content: center;

  overflow: hidden;

  pointer-events: none;
}

.parent-sidebar__church img {
  display: block;

  width: 92%;
  height: 100%;

  object-fit: contain;
  object-position: center bottom;

  opacity: 0.95;
}

/* =========================================================
   SUPPORT CARD
========================================================= */

.parent-sidebar__support {
  position: relative;

  padding: 11px;

  overflow: hidden;

  border:
    1px solid
    #E4EBF2;

  border-radius: 13px;

  background:
    linear-gradient(
      145deg,
      #F8FBFF 0%,
      #F0F6FC 100%
    );

  box-shadow:
    0 5px 18px
    rgba(23, 59, 94, 0.045);
}

.parent-sidebar__support::after {
  content: "";

  position: absolute;

  width: 80px;
  height: 80px;

  right: -42px;
  bottom: -46px;

  border-radius: 50%;

  background:
    rgba(217, 164, 65, 0.09);

  pointer-events: none;
}

.parent-sidebar__support-heading {
  position: relative;
  z-index: 1;

  display: flex;
  align-items: center;

  gap: 9px;
}

.parent-sidebar__support-icon {
  width: 32px;
  height: 32px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    #E6F0FB;

  color:
    #27618D;

  font-size: 16px;
}

.parent-sidebar__support-content {
  min-width: 0;
}

.parent-sidebar__support-title {
  color:
    var(--parent-navy);

  font-size: 11px;
  font-weight: 800;
}

.parent-sidebar__support-desc {
  margin-top: 2px;

  color: #7B8798;

  font-size: 9.5px;

  line-height: 1.45;
}

.parent-sidebar__support-button {
  position: relative;
  z-index: 1;

  width: 100%;
  min-height: 34px;

  margin-top: 9px;

  padding: 6px 9px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  border: none;
  border-radius: 8px;

  background:
    var(--parent-navy);

  color: #fff;

  font-family: inherit;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.parent-sidebar__support-button:hover {
  background:
    var(--parent-navy-dark);

  transform:
    translateY(-1px);

  box-shadow:
    0 5px 12px
    rgba(23, 59, 94, 0.16);
}

.parent-sidebar__support-button:active {
  transform:
    translateY(0);
}

.parent-sidebar__support-button:focus-visible {
  outline:
    3px solid
    rgba(217, 164, 65, 0.28);

  outline-offset: 2px;
}

/* =========================================================
   SCROLLBAR
========================================================= */

.parent-sidebar__navigation::-webkit-scrollbar {
  width: 4px;
}

.parent-sidebar__navigation::-webkit-scrollbar-track {
  background: transparent;
}

.parent-sidebar__navigation::-webkit-scrollbar-thumb {
  background:
    #DDE5ED;

  border-radius: 10px;
}

.parent-sidebar__navigation {
  scrollbar-width: thin;
  scrollbar-color:
    #DDE5ED
    transparent;
}

/* =========================================================
   SHORT DESKTOP
========================================================= */

@media
  (min-width: 769px)
  and (max-height: 760px) {

  .parent-sidebar__brand {
    height: 64px;
    min-height: 64px;
  }

  .parent-sidebar__logo {
    width: 38px;
    height: 38px;
  }

  .parent-sidebar__user-wrap {
    padding-top: 10px;
    padding-bottom: 7px;
  }

  .parent-sidebar__menu
  .ant-menu-item {
    height: 38px;
    line-height: 38px;
  }

  .parent-sidebar__church {
    height: 45px;
  }

  .parent-sidebar__support {
    padding: 8px;
  }

  .parent-sidebar__support-button {
    margin-top: 6px;
    min-height: 30px;
  }
}

/* =========================================================
   TABLET
========================================================= */

@media
  (min-width: 769px)
  and (max-width: 1100px) {

  .parent-sidebar {
    width: 225px;
  }

  .parent-sidebar__brand {
    padding-inline: 14px;
  }

  .parent-sidebar__brand-name {
    font-size: 17px;
  }

  .parent-sidebar__user-wrap {
    padding-inline: 9px;
  }

  .parent-sidebar__navigation {
    padding-inline: 8px;
  }

  .parent-sidebar__menu
  .ant-menu-item {
    padding-inline: 11px !important;
    font-size: 11.5px;
  }

  .parent-sidebar__church {
    height: 62px;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 768px) {

  .parent-sidebar {
    width: 100%;
    height: auto;
    min-height: 100%;

    overflow: visible;

    border-right: none;
  }

  .parent-sidebar__brand {
    height: 64px;
    min-height: 64px;

    padding-inline: 14px;
  }

  .parent-sidebar__logo {
    width: 38px;
    height: 38px;
  }

  .parent-sidebar__brand-name {
    font-size: 18px;
  }

  .parent-sidebar__user-wrap {
    padding:
      10px 12px 8px;
  }

  .parent-sidebar__navigation {
    flex: none;

    padding:
      3px 12px 12px;

    overflow: visible;
  }

  .parent-sidebar__section-title {
    padding:
      7px 3px 8px;
  }

  .parent-sidebar__menu.ant-menu-inline {
    display: grid;

    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 5px 7px;

    border: none !important;
  }

  .parent-sidebar__menu
  .ant-menu-item {
    width: 100%;

    min-height: 43px;
    height: auto;

    margin: 0 !important;

    padding:
      8px 9px !important;

    line-height: 1.35;

    gap: 7px;

    font-size: 11px;
  }

  .parent-sidebar__menu
  .ant-menu-item
  .anticon {
    width: 17px;
    font-size: 15px;
  }

  .parent-sidebar__menu
  .ant-menu-title-content {
    white-space: normal;
  }

  .parent-sidebar__bottom {
    padding:
      0 12px 12px;
  }

  .parent-sidebar__church {
    display: none;
  }

  .parent-sidebar__support {
    padding: 11px;
  }

  .parent-sidebar__support-desc {
    font-size: 10px;
  }

  .parent-sidebar__support-button {
    min-height: 38px;
    font-size: 11px;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 420px) {

  .parent-sidebar__brand {
    height: 58px;
    min-height: 58px;
  }

  .parent-sidebar__logo {
    width: 35px;
    height: 35px;
  }

  .parent-sidebar__brand-name {
    font-size: 17px;
  }

  .parent-sidebar__brand-subtitle {
    font-size: 8px;
  }

  .parent-sidebar__user-wrap {
    padding:
      8px 9px 7px;
  }

  .parent-sidebar__navigation {
    padding-inline: 8px;
  }

  .parent-sidebar__menu.ant-menu-inline {
    gap: 4px 5px;
  }

  .parent-sidebar__menu
  .ant-menu-item {
    min-height: 41px;
    padding:
      7px !important;

    font-size: 10.5px;
  }

  .parent-sidebar__menu
  .ant-menu-item
  .anticon {
    width: 16px;
    font-size: 14px;
  }

  .parent-sidebar__bottom {
    padding:
      0 9px 9px;
  }
}

/* =========================================================
   REDUCE MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  .parent-sidebar *,
  .parent-sidebar__menu
  .ant-menu-item,
  .parent-sidebar__support-button {
    transition: none !important;
  }
}
`;

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function ParentSidebar({
  user,
  selectedKey = "/parent",
  onMenuClick,
  onContactClick,
}) {
  return (
    <>
      <style>{SIDEBAR_CSS}</style>

      <aside className="parent-sidebar">
        {/* =================================================
            BRAND
        ================================================= */}

        <div className="parent-sidebar__brand">
          <div className="parent-sidebar__logo">
            <img
              src={SIDEBAR_IMAGES.logo}
              alt="FaithEdu"
              onError={(event) => {
                event.currentTarget.style.display = "none";

                const fallback = event.currentTarget.nextElementSibling;

                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />

            <span className="parent-sidebar__logo-fallback">FE</span>
          </div>

          <div className="parent-sidebar__brand-text">
            <div className="parent-sidebar__brand-name">FaithEdu</div>

            <div className="parent-sidebar__brand-subtitle">Cổng phụ huynh</div>
          </div>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="parent-sidebar__navigation">
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={MENU_ITEMS}
            onClick={onMenuClick}
            className="parent-sidebar__menu"
          />
        </nav>

        {/* =================================================
            SUPPORT
        ================================================= */}

        <div className="parent-sidebar__bottom">
          <div className="parent-sidebar__church">
            <img
              src={SIDEBAR_IMAGES.church}
              alt="Nhà thờ"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="parent-sidebar__support">
            <div className="parent-sidebar__support-heading">
              <div className="parent-sidebar__support-icon">
                <HomeOutlined />
              </div>

              <div className="parent-sidebar__support-content">
                <div className="parent-sidebar__support-title">
                  Đồng hành cùng gia đình
                </div>

                <div className="parent-sidebar__support-desc">
                  Cùng giáo xứ nuôi dưỡng đức tin nơi các em.
                </div>
              </div>
            </div>

            <button
              type="button"
              className="parent-sidebar__support-button"
              onClick={onContactClick}
            >
              Liên hệ giáo xứ
              <CustomerServiceOutlined />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
