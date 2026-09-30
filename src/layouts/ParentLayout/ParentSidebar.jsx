import React from "react";
import { Avatar, Menu } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  // BellOutlined,
  // UserOutlined,
  CustomerServiceOutlined,
  RightOutlined,
} from "@ant-design/icons";

import logoxn from "../../assets/images/logoXn.png";

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
  gray: "#64748B",
  grayBg: "#F1F5F9",
  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

const SIDEBAR_IMAGES = {
  logo: logoxn,
  church: logoxn,
};

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
  // {
  //   key: "/parent/notifications",
  //   icon: <BellOutlined />,
  //   label: "Thông báo",
  // },
  // {
  //   key: "/parent/contact",
  //   icon: <CustomerServiceOutlined />,
  //   label: "Liên hệ giáo xứ",
  // },
  // {
  //   key: "/parent/profile",
  //   icon: <UserOutlined />,
  //   label: "Tài khoản",
  // },
];

const SIDEBAR_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

.parent-sidebar,
.parent-sidebar * {
  box-sizing: border-box;
}

.parent-sidebar {
  --ps-navy: ${COLORS.navy};
  --ps-navy-hover: ${COLORS.navyHover};
  --ps-gold: ${COLORS.gold};
  --ps-bg: ${COLORS.background};
  --ps-white: ${COLORS.white};
  --ps-text: ${COLORS.text};
  --ps-secondary: ${COLORS.textSecondary};
  --ps-muted: ${COLORS.muted};
  --ps-border: ${COLORS.border};
  --ps-navy-light: ${COLORS.navyLight};
  --ps-gold-light: ${COLORS.goldLight};
  --ps-success: ${COLORS.success};
  --ps-success-bg: ${COLORS.successBg};

  width: 268px;
  height: 100vh;
  flex: 0 0 268px;
  display: flex;
  flex-direction: column;

  background: var(--ps-white);
  color: var(--ps-text);
  border-right: 1px solid var(--ps-border);

  font-family: "Be Vietnam Pro", sans-serif;
  overflow: hidden;
}

/* BRAND */

.parent-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 22px;
  flex-shrink: 0;
}

.parent-sidebar__logo {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--ps-white);
  border: 1.5px solid var(--ps-border);
  border-radius: 13px;
  overflow: hidden;
}

.parent-sidebar__logo img {
  width: 84%;
  height: 84%;
  object-fit: contain;
}

.parent-sidebar__logo-fallback {
  display: none;
  color: var(--ps-navy);
  font-size: 14px;
  font-weight: 700;
}

.parent-sidebar__brand-text {
  min-width: 0;
}

.parent-sidebar__brand-name {
  color: var(--ps-navy);
  font-size: 23px;
  font-weight: 700;
  letter-spacing: -0.7px;
  line-height: 1.25;
}

.parent-sidebar__brand-subtitle {
  margin-top: 3px;
  color: var(--ps-secondary);
  font-size: 12px;
  font-weight: 500;
}

/* USER CARD */

.parent-sidebar__user-wrap {
  padding: 0 14px 22px;
  flex-shrink: 0;
}

.parent-sidebar__user-card {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  padding: 12px;

  background: var(--ps-bg);
  border: 1px solid var(--ps-border);
  border-radius: 14px;
}

.parent-sidebar__avatar {
  flex-shrink: 0;
  background: var(--ps-navy) !important;
  color: var(--ps-white) !important;
  font-size: 16px;
  font-weight: 600;
}

.parent-sidebar__user-info {
  flex: 1;
  min-width: 0;
}

.parent-sidebar__user-name {
  display: block;
  overflow: hidden;
  color: var(--ps-text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-sidebar__user-role {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  color: var(--ps-secondary);
  font-size: 11px;
}

.parent-sidebar__status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ps-success);
  box-shadow: 0 0 0 3px var(--ps-success-bg);
  flex-shrink: 0;
}

/* NAVIGATION */

.parent-sidebar__navigation {
  flex: 1;
  min-height: 0;
  padding: 0 12px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--ps-border) transparent;
}

.parent-sidebar__section-title {
  padding: 0 12px 12px;
  color: var(--ps-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.parent-sidebar__menu.ant-menu {
  width: 100%;
  background: transparent !important;
  border-inline-end: none !important;
}

.parent-sidebar__menu.ant-menu-inline {
  border-inline-end: none !important;
}

.parent-sidebar__menu .ant-menu-item {
  position: relative;
  width: 100%;
  height: 46px;
  line-height: 46px;
  margin: 4px 0 !important;
  padding: 0 13px !important;

  display: flex;
  align-items: center;
  gap: 12px;

  border-radius: 10px;
  color: var(--ps-secondary);
  font-size: 13px;
  font-weight: 500;

  transition: background 0.2s ease, color 0.2s ease;
}

.parent-sidebar__menu .ant-menu-item .anticon {
  flex-shrink: 0;
  width: 20px;
  color: var(--ps-muted);
  font-size: 18px;
  transition: color 0.2s ease;
}

.parent-sidebar__menu .ant-menu-title-content {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-sidebar__menu .ant-menu-item::after {
  display: none !important;
}

.parent-sidebar__menu .ant-menu-item:hover {
  color: var(--ps-navy) !important;
  background: var(--ps-navy-light) !important;
}

.parent-sidebar__menu .ant-menu-item:hover .anticon {
  color: var(--ps-navy);
}

.parent-sidebar__menu .ant-menu-item-selected,
.parent-sidebar__menu .ant-menu-item-selected:hover {
  color: var(--ps-white) !important;
  background: var(--ps-navy) !important;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(23, 59, 94, 0.12);
}

.parent-sidebar__menu .ant-menu-item-selected .anticon,
.parent-sidebar__menu .ant-menu-item-selected:hover .anticon {
  color: var(--ps-gold) !important;
}

.parent-sidebar__menu .ant-menu-item-selected::before {
  content: "";
  position: absolute;
  top: 50%;
  right: 12px;
  width: 5px;
  height: 5px;
  margin-top: -2.5px;
  border-radius: 50%;
  background: var(--ps-gold);
}

.parent-sidebar__menu .ant-menu-item:focus-visible {
  outline: 2px solid var(--ps-gold);
  outline-offset: 2px;
}

/* BOTTOM SUPPORT */

.parent-sidebar__bottom {
  flex-shrink: 0;
  padding: 12px 14px 18px;
  border-top: 1px solid var(--ps-border);
}

.parent-sidebar__support {
  position: relative;
  padding: 17px 15px 15px;
  display: flex;
  flex-direction: column;
  gap: 13px;

  background: var(--ps-navy);
  border-radius: 15px;
  overflow: hidden;
  isolation: isolate;
}

.parent-sidebar__support::before {
  content: "";
  position: absolute;
  z-index: -1;
  width: 145px;
  height: 145px;
  top: -70px;
  right: -50px;
  border: 1px solid rgba(217, 164, 65, 0.25);
  border-radius: 50%;
}

.parent-sidebar__support::after {
  content: "";
  position: absolute;
  z-index: -1;
  width: 110px;
  height: 110px;
  top: -42px;
  right: -32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.parent-sidebar__church {
  position: absolute;
  z-index: -1;
  right: 0;
  bottom: 0;
  width: 100px;
  height: 90px;
  opacity: 0.09;
  pointer-events: none;
}

.parent-sidebar__church img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom right;
  filter: brightness(0) invert(1);
}

.parent-sidebar__support-content {
  position: relative;
}

.parent-sidebar__support-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
  color: var(--ps-gold);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.parent-sidebar__support-title {
  color: var(--ps-white);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.parent-sidebar__support-desc {
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 11px;
  line-height: 1.65;
}

.parent-sidebar__support-button {
  width: 100%;
  min-height: 39px;
  padding: 8px 11px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border: none;
  border-radius: 9px;
  background: var(--ps-gold);
  color: var(--ps-navy);

  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  transition: background 0.2s ease, transform 0.2s ease;
}

.parent-sidebar__support-button:hover {
  background: #E8BE66;
  transform: translateY(-1px);
}

.parent-sidebar__support-button:active {
  transform: translateY(0);
}

.parent-sidebar__support-button:focus-visible {
  outline: 2px solid var(--ps-white);
  outline-offset: 3px;
}

.parent-sidebar__support-button .anticon {
  font-size: 14px;
}

/* SHORT SCREENS */

@media (min-width: 769px) and (max-height: 760px) {
  .parent-sidebar__brand {
    padding-top: 14px;
    padding-bottom: 15px;
  }

  .parent-sidebar__user-wrap {
    padding-bottom: 14px;
  }

  .parent-sidebar__menu .ant-menu-item {
    height: 41px;
    line-height: 41px;
  }

  .parent-sidebar__bottom {
    padding-top: 8px;
    padding-bottom: 10px;
  }

  .parent-sidebar__support {
    padding: 12px;
    gap: 9px;
  }

  .parent-sidebar__support-desc {
    line-height: 1.45;
  }
}

/* TABLET */

@media (min-width: 769px) and (max-width: 1100px) {
  .parent-sidebar {
    width: 244px;
    flex-basis: 244px;
  }

  .parent-sidebar__brand {
    padding-inline: 16px;
  }

  .parent-sidebar__brand-name {
    font-size: 21px;
  }

  .parent-sidebar__user-wrap,
  .parent-sidebar__bottom {
    padding-inline: 10px;
  }

  .parent-sidebar__navigation {
    padding-inline: 9px;
  }
}

/* MOBILE */

@media (max-width: 768px) {
  .parent-sidebar {
    width: 100%;
    height: auto;
    min-height: 100%;
    flex: 0 0 auto;
    overflow: visible;
    border-right: none;
  }

  .parent-sidebar__brand {
    padding: 17px 16px;
  }

  .parent-sidebar__user-wrap {
    padding: 0 14px 16px;
  }

  .parent-sidebar__navigation {
    flex: none;
    overflow: visible;
    padding: 0 12px 14px;
  }

  .parent-sidebar__menu .ant-menu-item {
    height: 46px;
    line-height: 46px;
  }

  .parent-sidebar__bottom {
    padding: 12px 14px 16px;
  }
}

@media (max-width: 420px) {
  .parent-sidebar__brand-name {
    font-size: 21px;
  }

  .parent-sidebar__user-wrap,
  .parent-sidebar__bottom {
    padding-inline: 10px;
  }

  .parent-sidebar__navigation {
    padding-inline: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .parent-sidebar *,
  .parent-sidebar *::before,
  .parent-sidebar *::after {
    transition: none !important;
  }
}
`;

export default function ParentSidebar({
  user,
  selectedKey = "/parent",
  onMenuClick,
  onContactClick,
}) {
  const displayName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    "Phụ huynh";

  const avatarText = displayName.trim().charAt(0).toUpperCase() || "P";

  return (
    <>
      <style>{SIDEBAR_CSS}</style>

      <aside className="parent-sidebar">
        {/* BRAND */}
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

        {/* USER */}
        <div className="parent-sidebar__user-wrap">
          <div className="parent-sidebar__user-card">
            <Avatar size={42} className="parent-sidebar__avatar">
              {avatarText}
            </Avatar>

            <div className="parent-sidebar__user-info">
              <span className="parent-sidebar__user-name">{displayName}</span>

              <div className="parent-sidebar__user-role">
                <span className="parent-sidebar__status-dot" />
                <span>Phụ huynh</span>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="parent-sidebar__navigation">
          <div className="parent-sidebar__section-title">
            Không gian gia đình
          </div>

          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={MENU_ITEMS}
            onClick={onMenuClick}
            className="parent-sidebar__menu"
          />
        </nav>

        {/* SUPPORT */}
        <div className="parent-sidebar__bottom">
          <div className="parent-sidebar__support">
            <div className="parent-sidebar__church">
              <img
                src={SIDEBAR_IMAGES.church}
                alt=""
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="parent-sidebar__support-content">
              <div className="parent-sidebar__support-label">
                <span>✦</span>
                FaithEdu đồng hành
              </div>

              <div className="parent-sidebar__support-title">
                Đồng hành cùng gia đình
              </div>

              <div className="parent-sidebar__support-desc">
                Cùng giáo xứ nuôi dưỡng đức tin nơi các em.
              </div>
            </div>

            <button
              type="button"
              className="parent-sidebar__support-button"
              onClick={onContactClick}
            >
              <CustomerServiceOutlined />
              <span>Liên hệ giáo xứ</span>
              <RightOutlined />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
