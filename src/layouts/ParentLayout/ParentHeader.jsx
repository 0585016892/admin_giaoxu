import React from "react";
import { Avatar, Button, Dropdown } from "antd";

import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  BellOutlined,
} from "@ant-design/icons";

/* =========================================================
   COLORS - FAITHEDU
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
  gray: "#64748B",
  grayBg: "#F1F5F9",
  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  if (!name || !String(name).trim()) {
    return "PH";
  }

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/* =========================================================
   CSS
========================================================= */

const HEADER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

.parent-header,
.parent-header *,
.parent-header-dropdown,
.parent-header-dropdown * {
  box-sizing: border-box;
}

.parent-header {
  --header-navy: ${COLORS.navy};
  --header-navy-hover: ${COLORS.navyHover};
  --header-gold: ${COLORS.gold};
  --header-background: ${COLORS.background};
  --header-white: ${COLORS.white};
  --header-text: ${COLORS.text};
  --header-secondary: ${COLORS.textSecondary};
  --header-muted: ${COLORS.muted};
  --header-border: ${COLORS.border};
  --header-navy-light: ${COLORS.navyLight};
  --header-gold-light: ${COLORS.goldLight};
  --header-danger: ${COLORS.danger};
  --header-danger-bg: ${COLORS.dangerBg};

  position: sticky;
  top: 0;
  z-index: 90;

  width: 100%;
  height: 76px;
  padding: 0 28px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  background: var(--header-white);
  border-bottom: 1px solid var(--header-border);

  font-family: "Be Vietnam Pro", Inter, "Segoe UI", Arial, sans-serif;
}

/* =========================================================
   LEFT
========================================================= */

.parent-header__left {
  min-width: 0;
  flex: 1;

  display: flex;
  align-items: center;
  gap: 14px;
}

.parent-header__heading {
  min-width: 0;
}

.parent-header__title {
  overflow: hidden;

  color: var(--header-navy);
  font-size: 21px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.4px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-header__subtitle {
  margin-top: 3px;
  overflow: hidden;

  color: var(--header-secondary);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* =========================================================
   ICON BUTTONS
========================================================= */

.parent-header__icon-button.ant-btn {
  position: relative;

  width: 42px;
  height: 42px;
  min-width: 42px;
  padding: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--header-border);
  border-radius: 12px;

  background: var(--header-white);
  color: var(--header-navy);

  box-shadow: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.parent-header__icon-button.ant-btn:hover {
  color: var(--header-navy) !important;
  background: var(--header-navy-light) !important;
  border-color: #CBD8E5 !important;
}

.parent-header__icon-button.ant-btn:active {
  background: var(--header-gold-light) !important;
}

.parent-header__icon-button .anticon {
  font-size: 18px;
}

.parent-header__icon-button.ant-btn:focus-visible,
.parent-header__account.ant-btn:focus-visible {
  outline: 3px solid rgba(217, 164, 65, 0.55);
  outline-offset: 2px;
}

/* Notification dot */

.parent-header__notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;

  width: 9px;
  height: 9px;

  border: 2px solid var(--header-white);
  border-radius: 50%;
  background: var(--header-gold);
}

/* =========================================================
   RIGHT
========================================================= */

.parent-header__right {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  gap: 12px;
}

/* =========================================================
   ACCOUNT BUTTON
========================================================= */

.parent-header__account.ant-btn {
  height: 52px;
  max-width: 320px;
  padding: 5px 12px 5px 6px;

  display: inline-flex;
  align-items: center;
  justify-content: flex-start;

  border: 1px solid var(--header-border);
  border-radius: 13px;

  background: var(--header-white);
  color: var(--header-text);

  box-shadow: none;

  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.parent-header__account.ant-btn:hover {
  color: var(--header-text) !important;
  background: var(--header-background) !important;
  border-color: #CBD8E5 !important;
}

.parent-header__account-inner {
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 10px;
}

.parent-header__avatar {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--header-navy) !important;
  color: var(--header-white) !important;

  font-size: 14px;
  font-weight: 700;
}

.parent-header__avatar.ant-avatar-image {
  background: var(--header-white) !important;
}

.parent-header__user-info {
  min-width: 0;
  width: 155px;
  text-align: left;
}

.parent-header__user-name {
  overflow: hidden;

  color: var(--header-text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-header__username {
  margin-top: 2px;
  overflow: hidden;

  color: var(--header-secondary);
  font-size: 11px;
  font-weight: 400;
  line-height: 1.4;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-header__chevron {
  margin-left: 3px;
  color: var(--header-muted);
  font-size: 10px;
}

/* =========================================================
   DROPDOWN
========================================================= */

.parent-header-dropdown .ant-dropdown-menu {
  min-width: 230px;
  padding: 6px;

  border: 1px solid ${COLORS.border};
  border-radius: 13px;

  background: ${COLORS.white};
  box-shadow: 0 12px 32px rgba(23, 59, 94, 0.12);

  font-family: "Be Vietnam Pro", Inter, "Segoe UI", Arial, sans-serif;
}

.parent-header-dropdown .ant-dropdown-menu-item {
  min-height: 42px;
  margin: 2px 0;
  padding: 0 12px;

  display: flex;
  align-items: center;
  gap: 10px;

  border-radius: 9px;

  color: ${COLORS.textSecondary};
  font-size: 13px;
  font-weight: 500;

  transition: background 0.2s ease, color 0.2s ease;
}

.parent-header-dropdown .ant-dropdown-menu-item:hover {
  color: ${COLORS.navy} !important;
  background: ${COLORS.navyLight} !important;
}

.parent-header-dropdown .ant-dropdown-menu-item .anticon {
  width: 18px;
  font-size: 16px;
}

.parent-header-dropdown .ant-dropdown-menu-item-danger {
  color: ${COLORS.danger};
}

.parent-header-dropdown .ant-dropdown-menu-item-danger:hover {
  color: ${COLORS.danger} !important;
  background: ${COLORS.dangerBg} !important;
}

.parent-header-dropdown .ant-dropdown-menu-item-divider {
  margin: 5px 4px;
  background: ${COLORS.border};
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1024px) {
  .parent-header {
    padding: 0 20px;
  }

  .parent-header__title {
    font-size: 19px;
  }

  .parent-header__user-info {
    width: 125px;
  }

  .parent-header__right {
    gap: 8px;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 768px) {
  .parent-header {
    height: 66px;
    padding: 0 14px;
    gap: 8px;
  }

  .parent-header__left {
    flex: 1;
    gap: 9px;
  }

  .parent-header__title {
    font-size: 17px;
    letter-spacing: -0.2px;
  }

  .parent-header__subtitle {
    display: none;
  }

  .parent-header__right {
    gap: 7px;
  }

  .parent-header__icon-button.ant-btn {
    width: 39px;
    height: 39px;
    min-width: 39px;
    border-radius: 11px;
  }

  .parent-header__account.ant-btn {
    width: 42px;
    height: 42px;
    min-width: 42px;
    padding: 1px;

    justify-content: center;
    border-color: transparent;
    background: transparent;
  }

  .parent-header__account.ant-btn:hover {
    background: var(--header-navy-light) !important;
    border-color: transparent !important;
  }

  .parent-header__account-inner {
    gap: 0;
  }

  .parent-header__avatar {
    width: 39px !important;
    height: 39px !important;
  }

  .parent-header__user-info,
  .parent-header__chevron {
    display: none;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 380px) {
  .parent-header {
    padding: 0 9px;
    gap: 5px;
  }

  .parent-header__left {
    gap: 6px;
  }

  .parent-header__title {
    max-width: 120px;
    font-size: 15px;
  }

  .parent-header__right {
    gap: 4px;
  }

  .parent-header__icon-button.ant-btn {
    width: 35px;
    height: 35px;
    min-width: 35px;
  }

  .parent-header__account.ant-btn {
    width: 38px;
    height: 38px;
    min-width: 38px;
  }

  .parent-header__avatar {
    width: 36px !important;
    height: 36px !important;
  }
}

/* ACCESSIBILITY */

@media (prefers-reduced-motion: reduce) {
  .parent-header *,
  .parent-header-dropdown * {
    transition: none !important;
  }
}
`;

/* =========================================================
   COMPONENT
========================================================= */

export default function ParentHeader({
  user,
  isMobile = false,
  onMenuOpen,
  onProfile,
  onLogout,
  onNotifications,
}) {
  const fullName =
    user?.full_name ||
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Phụ huynh";

  const username =
    user?.username || user?.phone || user?.email || "Tài khoản phụ huynh";

  const avatar = user?.avatar || user?.avatar_url || user?.avatarUrl || null;

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin tài khoản",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      danger: true,
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "profile") {
      onProfile?.();
    }

    if (key === "logout") {
      onLogout?.();
    }
  };

  return (
    <>
      <style>{HEADER_CSS}</style>

      <header className="parent-header">
        {/* LEFT */}
        <div className="parent-header__left">
          {isMobile && (
            <Button
              type="text"
              className="parent-header__icon-button"
              icon={<MenuOutlined />}
              onClick={onMenuOpen}
              aria-label="Mở menu điều hướng"
            />
          )}

          <div className="parent-header__heading">
            <div className="parent-header__title" title="Cổng phụ huynh">
              Cổng phụ huynh
            </div>

            <div className="parent-header__subtitle">
              Theo dõi hành trình học tập và đức tin của con
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="parent-header__right">
          <Button
            type="text"
            className="parent-header__icon-button"
            onClick={onNotifications}
            aria-label="Mở thông báo"
          >
            <BellOutlined />
            <span className="parent-header__notification-dot" />
          </Button>

          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleMenuClick,
            }}
            placement="bottomRight"
            trigger={["click"]}
            overlayClassName="parent-header-dropdown"
          >
            <Button
              type="text"
              className="parent-header__account"
              aria-label="Mở menu tài khoản"
            >
              <div className="parent-header__account-inner">
                <Avatar
                  size={40}
                  src={avatar}
                  className="parent-header__avatar"
                >
                  {!avatar && getInitials(fullName)}
                </Avatar>

                {!isMobile && (
                  <>
                    <div className="parent-header__user-info">
                      <div
                        className="parent-header__user-name"
                        title={fullName}
                      >
                        {fullName}
                      </div>

                      <div className="parent-header__username" title={username}>
                        {username}
                      </div>
                    </div>

                    <DownOutlined className="parent-header__chevron" />
                  </>
                )}
              </div>
            </Button>
          </Dropdown>
        </div>
      </header>
    </>
  );
}
