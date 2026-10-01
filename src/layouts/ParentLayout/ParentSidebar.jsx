import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, Menu } from "antd";
import {
  HomeFilled,
  TeamOutlined,
  BellOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import logoxn from "../../assets/images/logoXn.png";
import churchSidebar from "../../assets/images/church-sidebar.png";

// ========================================
// MENU
// ========================================

export const MENU_ITEMS = [
  {
    key: "/parent",
    icon: <HomeFilled />,
    label: "Trang chủ",
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
    key: "/parent/support",
    icon: <QuestionCircleOutlined />,
    label: "Hỗ trợ",
  },
];

// ========================================
// CSS NHÚNG TRỰC TIẾP TRONG JS
// ========================================

const SIDEBAR_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

.parent-sidebar,
.parent-sidebar * {
  box-sizing: border-box;
}

.parent-sidebar {
  --ps-navy: #06264c;
  --ps-gold: #f0c453;
  --ps-white: #ffffff;
  --ps-muted: #d5deed;

  position: relative;
  isolation: isolate;

  display: flex;
  flex-direction: column;
  flex: 0 0 255px;

  width: 255px;
  height: 100vh;
  min-height: 0;

  overflow: hidden;
  color: var(--ps-white);

  background: linear-gradient(
    180deg,
    #06264c 0%,
    #082d59 55%,
    #06264c 100%
  );

  font-family: 'Be Vietnam Pro', sans-serif;
}

/* BRAND */

.parent-sidebar__brand {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  gap: 10px;

  min-height: 124px;
  padding: 20px 23px;

  flex-shrink: 0;
}

.parent-sidebar__logo {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 55px;
  height: 55px;
  flex: 0 0 55px;
  overflow: hidden;
}

.parent-sidebar__logo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.parent-sidebar__brand-text {
  min-width: 0;
}

.parent-sidebar__brand-name {
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -1px;
  white-space: nowrap;
}

.parent-sidebar__brand-name span {
  color: var(--ps-gold);
}

.parent-sidebar__brand-subtitle {
  margin-top: 4px;
  color: #d8e2f0;
  font-size: 10px;
  line-height: 1.5;
  white-space: nowrap;
}

/* USER CARD */

.parent-sidebar__user-wrap {
  flex-shrink: 0;
  padding: 0 14px 18px;
}

.parent-sidebar__user-card {
  display: flex;
  align-items: center;
  gap: 11px;

  min-width: 0;
  padding: 11px;

  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}

.parent-sidebar__avatar {
  flex-shrink: 0;
  background: var(--ps-gold) !important;
  color: var(--ps-navy) !important;
  font-size: 16px;
  font-weight: 700;
}

.parent-sidebar__user-info {
  flex: 1;
  min-width: 0;
}

.parent-sidebar__user-name {
  display: block;
  overflow: hidden;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-sidebar__user-role {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 5px;
  color: #d5deed;
  font-size: 10px;
}

.parent-sidebar__status-dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #65d6a0;
  box-shadow: 0 0 0 3px rgba(101, 214, 160, 0.12);
}

/* NAVIGATION */

.parent-sidebar__navigation {
  position: relative;
  z-index: 2;

  flex: 1;
  min-height: 0;
  padding: 10px 12px 12px;

  overflow-x: hidden;
  overflow-y: auto;

  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.2) transparent;
}

.parent-sidebar__section-title {
  padding: 0 12px 10px;
  color: #9eb2cc;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.parent-sidebar__menu.ant-menu,
.parent-sidebar__menu.ant-menu-inline {
  width: 100%;
  color: var(--ps-muted);
  background: transparent !important;
  border-inline-end: none !important;
  font-family: inherit;
}

.parent-sidebar__menu .ant-menu-item {
  position: relative;

  display: flex;
  align-items: center;
  gap: 12px;

  width: 100%;
  height: 45px;
  line-height: 45px;

  margin: 4px 0 !important;
  padding: 0 15px !important;

  border-radius: 10px;
  color: #d5deed;

  font-size: 12px;
  font-weight: 500;

  transition: background .2s ease, color .2s ease;
}

.parent-sidebar__menu .ant-menu-item .anticon {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  flex: 0 0 20px;

  color: #d5e1f1;
  font-size: 19px;

  transition: color .2s ease;
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

/* HOVER */

.parent-sidebar__menu .ant-menu-item:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, .09) !important;
}

.parent-sidebar__menu .ant-menu-item:hover .anticon {
  color: #fff;
}

/* ACTIVE: NỀN VÀNG */

.parent-sidebar__menu .ant-menu-item-selected,
.parent-sidebar__menu .ant-menu-item-selected:hover {
  color: #102746 !important;

  background: linear-gradient(
    100deg,
    #f5d16f 0%,
    #efbd4b 100%
  ) !important;

  font-weight: 700;
  box-shadow: 0 3px 8px rgba(0, 0, 0, .1);
}

.parent-sidebar__menu .ant-menu-item-selected .anticon,
.parent-sidebar__menu .ant-menu-item-selected:hover .anticon {
  color: #102746 !important;
}

.parent-sidebar__menu .ant-menu-item:focus-visible {
  outline: 2px solid #fff;
  outline-offset: -3px;
}

/* FOOTER / CHURCH */

.parent-sidebar__footer {
  position: relative;
  z-index: 0;
  isolation: isolate;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  flex: 0 0 260px;
  min-height: 0;

  padding: 0 24px 26px;
  overflow: hidden;
}

.parent-sidebar__church {
  position: absolute;
  z-index: -2;
  inset: 0;

  overflow: hidden;
  pointer-events: none;
}

.parent-sidebar__church img {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: center bottom;

  opacity: .55;
}

.parent-sidebar__church::after {
  content: "";
  position: absolute;
  inset: 0;

  background: linear-gradient(
    180deg,
    #082d59 0%,
    rgba(8, 45, 89, .75) 18%,
    rgba(6, 38, 76, .28) 55%,
    rgba(4, 28, 57, .12) 100%
  );
}

.parent-sidebar__quote {
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  color: #e0e8f5;

  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-style: italic;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: .1px;
}

/* SUPPORT BUTTON */

.parent-sidebar__support-button {
  width: 100%;
  min-height: 38px;
  margin-top: 14px;
  padding: 8px 10px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border: none;
  border-radius: 9px;

  background: var(--ps-gold);
  color: var(--ps-navy);

  font-family: inherit;
  font-size: 11px;
  font-weight: 700;

  cursor: pointer;
  transition: background .2s ease, transform .2s ease;
}

.parent-sidebar__support-button:hover {
  background: #ffda78;
  transform: translateY(-1px);
}

.parent-sidebar__support-button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

/* SHORT SCREENS */

@media (max-height: 760px) {
  .parent-sidebar__brand {
    min-height: 95px;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .parent-sidebar__logo {
    width: 47px;
    height: 47px;
    flex-basis: 47px;
  }

  .parent-sidebar__brand-name {
    font-size: 23px;
  }

  .parent-sidebar__user-wrap {
    padding-bottom: 10px;
  }

  .parent-sidebar__navigation {
    padding-top: 5px;
  }

  .parent-sidebar__menu .ant-menu-item {
    height: 39px;
    line-height: 39px;
    margin: 3px 0 !important;
  }

  .parent-sidebar__footer {
    flex-basis: 190px;
    padding-bottom: 18px;
  }

  .parent-sidebar__quote {
    font-size: 17px;
  }
}

/* TABLET */

@media (min-width: 769px) and (max-width: 1100px) {
  .parent-sidebar {
    width: 235px;
    flex-basis: 235px;
  }

  .parent-sidebar__brand {
    gap: 8px;
    padding-right: 14px;
    padding-left: 14px;
  }

  .parent-sidebar__brand-name {
    font-size: 23px;
  }

  .parent-sidebar__brand-subtitle {
    font-size: 9px;
  }

  .parent-sidebar__menu .ant-menu-item {
    padding-right: 10px !important;
    padding-left: 12px !important;
    font-size: 11px;
  }

  .parent-sidebar__footer {
    padding-right: 18px;
    padding-left: 18px;
  }
}

/* MOBILE */

@media (max-width: 768px) {
  .parent-sidebar {
    width: 100%;
    height: auto;
    min-height: 0;
    flex: 0 0 auto;
  }

  .parent-sidebar__brand {
    min-height: 90px;
    padding: 15px 20px;
  }

  .parent-sidebar__user-wrap {
    padding-bottom: 12px;
  }

  .parent-sidebar__navigation {
    flex: none;
    max-height: 50vh;
  }

  .parent-sidebar__footer {
    flex-basis: 170px;
  }

  .parent-sidebar__quote {
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .parent-sidebar *,
  .parent-sidebar *::before,
  .parent-sidebar *::after {
    transition: none !important;
  }
`;

// ========================================
// COMPONENT
// ========================================

export default function ParentSidebar({
  user,
  selectedKey,
  onMenuClick,
  onContactClick,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const displayName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    "Phụ huynh";

  const avatarText = displayName.trim().charAt(0).toUpperCase() || "P";

  const currentPath = location.pathname.replace(/\/+$/, "") || "/";

  const routeSelectedKey =
    MENU_ITEMS.find((item) => item.key === currentPath)?.key ||
    (currentPath.startsWith("/parent/children/")
      ? "/parent/students"
      : currentPath === "/parent/profile"
        ? ""
        : "");

  const activeKey = selectedKey ?? routeSelectedKey;

  const handleMenuClick = (info) => {
    const { key } = info;

    if (key === "/parent/support" && onContactClick) {
      onContactClick(info);
      return;
    }

    if (key !== currentPath) {
      navigate(key);
    }

    onMenuClick?.(info);
  };

  return (
    <>
      <style>{SIDEBAR_CSS}</style>

      <aside className="parent-sidebar">
        {/* BRAND */}

        <div className="parent-sidebar__brand">
          <div className="parent-sidebar__logo">
            <img
              src={logoxn}
              alt="FaithEdu"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="parent-sidebar__brand-text">
            <div className="parent-sidebar__brand-name">
              Faith<span>Edu</span>
            </div>

            <div className="parent-sidebar__brand-subtitle">
              Nền tảng giáo lý số
            </div>
          </div>
        </div>

        {/* USER CARD */}

        <div className="parent-sidebar__user-wrap">
          <div className="parent-sidebar__user-card">
            <Avatar size={40} className="parent-sidebar__avatar">
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

        <nav className="parent-sidebar__navigation" aria-label="Menu phụ huynh">
          <div className="parent-sidebar__section-title">
            Không gian gia đình
          </div>

          <Menu
            mode="inline"
            selectedKeys={activeKey ? [activeKey] : []}
            items={MENU_ITEMS}
            onClick={handleMenuClick}
            className="parent-sidebar__menu"
          />
        </nav>

        {/* CHURCH FOOTER */}

        <div className="parent-sidebar__footer">
          <div className="parent-sidebar__church">
            <img
              src={churchSidebar}
              alt=""
              aria-hidden="true"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="parent-sidebar__quote">
            <span>“Đồng hành</span>
            <span>cùng con trong</span>
            <span>hành trình đức tin”</span>
          </div>
        </div>
      </aside>
    </>
  );
}
