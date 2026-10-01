import React from "react";
import { Avatar, Button, Dropdown, Badge } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  BellOutlined,
} from "@ant-design/icons";

/* =========================================================
   FAITHEDU THEME
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  gold: "#D9A441",
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#173B5E",
  secondary: "#64748B",
  border: "#E2E8F0",
  lightBlue: "#EEF3F7",
  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  if (!name || !String(name).trim()) return "PH";

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* =========================================================
   CSS - EMBEDDED
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
  position: sticky;
  top: 0;
  z-index: 90;

  width: 100%;
  min-height: 76px;
  padding: 0 28px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  background: ${COLORS.white};
  border-bottom: 1px solid ${COLORS.border};

  font-family: "Be Vietnam Pro", Inter, "Segoe UI", sans-serif;
}

/* LEFT */

.parent-header__left {
  flex: 1;
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 14px;
}

.parent-header__heading {
  min-width: 0;
}

.parent-header__title {
  overflow: hidden;
  color: ${COLORS.navy};

  font-size: 21px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.4px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-header__subtitle {
  margin-top: 3px;
  overflow: hidden;

  color: ${COLORS.secondary};
  font-size: 12px;
  line-height: 1.5;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* BUTTONS */

.parent-header__icon-button.ant-btn {
  position: relative;
  flex-shrink: 0;

  width: 42px;
  height: 42px;
  min-width: 42px;
  padding: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 1px solid ${COLORS.border};
  border-radius: 12px;

  background: ${COLORS.white};
  color: ${COLORS.navy};
  box-shadow: none;

  transition: all 0.2s ease;
}

.parent-header__icon-button.ant-btn:hover {
  color: ${COLORS.navy} !important;
  background: ${COLORS.lightBlue} !important;
  border-color: #CBD8E5 !important;
}

.parent-header__icon-button .anticon {
  font-size: 18px;
}

/* NOTIFICATION */

.parent-header__notification-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.parent-header__notification-badge .ant-badge-dot {
  width: 9px;
  height: 9px;
  background: ${COLORS.gold};
  box-shadow: 0 0 0 2px ${COLORS.white};
}

/* RIGHT */

.parent-header__right {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  gap: 12px;
}

/* ACCOUNT */

.parent-header__account.ant-btn {
  height: 52px;
  max-width: 320px;
  padding: 5px 12px 5px 6px;

  display: inline-flex;
  align-items: center;
  justify-content: flex-start;

  border: 1px solid ${COLORS.border};
  border-radius: 13px;

  background: ${COLORS.white};
  color: ${COLORS.text};
  box-shadow: none;

  transition: all 0.2s ease;
}

.parent-header__account.ant-btn:hover {
  color: ${COLORS.text} !important;
  background: ${COLORS.background} !important;
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

  background: ${COLORS.navy} !important;
  color: ${COLORS.white} !important;

  font-size: 14px;
  font-weight: 700;
}

.parent-header__user-info {
  width: 155px;
  min-width: 0;
  text-align: left;
}

.parent-header__user-name {
  overflow: hidden;

  color: ${COLORS.navy};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-header__username {
  margin-top: 2px;
  overflow: hidden;

  color: ${COLORS.secondary};
  font-size: 11px;
  font-weight: 400;
  line-height: 1.4;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-header__chevron {
  margin-left: 3px;
  color: #94A3B8;
  font-size: 10px;
}

/* DROPDOWN */

.parent-header-dropdown .ant-dropdown-menu {
  min-width: 230px;
  padding: 6px;

  border: 1px solid ${COLORS.border};
  border-radius: 13px;

  background: ${COLORS.white};
  box-shadow: 0 12px 32px rgba(23, 59, 94, 0.12);

  font-family: "Be Vietnam Pro", Inter, "Segoe UI", sans-serif;
}

.parent-header-dropdown .ant-dropdown-menu-item {
  min-height: 42px;
  margin: 2px 0;
  padding: 0 12px;

  display: flex;
  align-items: center;
  gap: 10px;

  border-radius: 9px;

  color: ${COLORS.secondary};
  font-size: 13px;
  font-weight: 500;
}

.parent-header-dropdown .ant-dropdown-menu-item:hover {
  color: ${COLORS.navy} !important;
  background: ${COLORS.lightBlue} !important;
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

/* TABLET */

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

/* MOBILE */

@media (max-width: 768px) {
  .parent-header {
    min-height: 66px;
    padding: 0 14px;
    gap: 8px;
  }

  .parent-header__left {
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

  .parent-header__account-inner {
    gap: 0;
  }

  .parent-header__user-info,
  .parent-header__chevron {
    display: none;
  }
}

/* SMALL MOBILE */

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

        <div className="parent-header__right">
          <Button
            type="text"
            className="parent-header__icon-button"
            onClick={onNotifications}
            aria-label="Mở thông báo"
          >
            <Badge dot className="parent-header__notification-badge">
              <BellOutlined />
            </Badge>
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
