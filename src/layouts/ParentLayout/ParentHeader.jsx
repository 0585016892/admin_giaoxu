import React from "react";
import { Avatar, Button, Dropdown, Space } from "antd";

import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  BellOutlined,
} from "@ant-design/icons";

function getInitials(name) {
  if (!name || !String(name).trim()) return "PH";

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const HEADER_CSS = `
.parent-header,
.parent-header * {
  box-sizing: border-box;
}

.parent-header {
  height: 76px;
  width: 100%;
  padding: 0 28px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  position: sticky;
  top: 0;
  z-index: 90;

  background: rgba(255, 255, 255, 0.97);
  border-bottom: 1px solid #E5EAF0;
  backdrop-filter: blur(12px);

  font-family: Inter, "Segoe UI", Arial, sans-serif;
}

.parent-header__left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.parent-header__menu-button.ant-btn {
  width: 40px;
  height: 40px;
  flex-shrink: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #E5EAF0;
  border-radius: 11px;
  color: #173B5E;
  background: #fff;
  box-shadow: none;
}

.parent-header__menu-button.ant-btn:hover {
  color: #173B5E !important;
  background: #F3F7FC !important;
  border-color: #D5E2F0 !important;
}

.parent-header__heading {
  min-width: 0;
}

.parent-header__title {
  color: #173B5E;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.4px;
}

.parent-header__subtitle {
  margin-top: 4px;
  color: #7B8798;
  font-size: 11px;
  line-height: 1.4;
}

.parent-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.parent-header__notification.ant-btn {
  width: 40px;
  height: 40px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #E5EAF0;
  border-radius: 11px;
  background: #fff;
  color: #526782;
  box-shadow: none;
}

.parent-header__notification.ant-btn:hover {
  color: #173B5E !important;
  background: #F3F7FC !important;
  border-color: #D5E2F0 !important;
}

.parent-header__account.ant-btn {
  height: 52px;
  max-width: 280px;
  padding: 5px 9px;

  display: inline-flex;
  align-items: center;

  border: 1px solid transparent;
  border-radius: 13px;
  background: transparent;
  box-shadow: none;
}

.parent-header__account.ant-btn:hover {
  background: #F8FAFC !important;
  border-color: #E5EAF0 !important;
}

.parent-header__avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #173B5E, #285E86);
  color: #fff;
  font-weight: 700;
}

.parent-header__user-info {
  min-width: 0;
  max-width: 155px;
  text-align: left;
}

.parent-header__user-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  color: #1E293B;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.parent-header__username {
  margin-top: 3px;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  color: #94A3B8;
  font-size: 10px;
  line-height: 1.4;
}

.parent-header__chevron {
  color: #94A3B8;
  font-size: 10px;
}

/* Dropdown Ant Design */

.parent-header-dropdown .ant-dropdown-menu {
  min-width: 205px;
  padding: 6px;
  border: 1px solid #E5EAF0;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(23, 59, 94, 0.12);
}

.parent-header-dropdown .ant-dropdown-menu-item {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 9px;
  border-radius: 8px;
  font-size: 12px;
}

.parent-header-dropdown .ant-dropdown-menu-item .anticon {
  font-size: 15px;
}

/* Tablet */

@media (max-width: 1024px) {
  .parent-header {
    padding: 0 20px;
  }

  .parent-header__title {
    font-size: 18px;
  }

  .parent-header__user-info {
    max-width: 125px;
  }
}

/* Mobile */

@media (max-width: 768px) {
  .parent-header {
    height: 64px;
    padding: 0 14px;
    gap: 8px;
  }

  .parent-header__left {
    gap: 10px;
  }

  .parent-header__title {
    font-size: 16px;
    letter-spacing: -0.2px;
  }

  .parent-header__subtitle {
    display: none;
  }

  .parent-header__right {
    gap: 6px;
  }

  .parent-header__account.ant-btn {
    height: 44px;
    padding: 3px;
  }

  .parent-header__avatar {
    width: 36px;
    height: 36px;
  }
}

/* Small mobile */

@media (max-width: 380px) {
  .parent-header {
    padding: 0 9px;
  }

  .parent-header__left {
    gap: 7px;
  }

  .parent-header__title {
    font-size: 14px;
  }

  .parent-header__right {
    gap: 4px;
  }

  .parent-header__notification.ant-btn {
    width: 34px;
    height: 36px;
  }

  .parent-header__menu-button.ant-btn {
    width: 36px;
    height: 36px;
  }
}
`;

export default function ParentHeader({
  user,
  isMobile,
  onMenuOpen,
  onProfile,
  onLogout,
  onNotifications,
}) {
  const fullName = user?.full_name || user?.name || "Phụ huynh";

  const avatar = user?.avatar || null;

  const username = user?.username || user?.phone || "Phụ huynh";

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
              className="parent-header__menu-button"
              icon={<MenuOutlined />}
              onClick={onMenuOpen}
              aria-label="Mở menu"
            />
          )}

          <div className="parent-header__heading">
            <div className="parent-header__title">Cổng phụ huynh</div>

            <div className="parent-header__subtitle">
              Theo dõi hành trình học tập và đức tin của con
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="parent-header__right">
          <Button
            type="text"
            className="parent-header__notification"
            icon={<BellOutlined />}
            onClick={onNotifications}
            aria-label="Thông báo"
          />

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
              aria-label="Menu tài khoản"
            >
              <Space size={9}>
                <Avatar
                  size={38}
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
              </Space>
            </Button>
          </Dropdown>
        </div>
      </header>
    </>
  );
}
