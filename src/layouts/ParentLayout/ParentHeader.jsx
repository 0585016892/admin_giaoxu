import React, { useMemo } from "react";
import { Avatar, Badge, Button, Dropdown } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  BellOutlined,
  SettingOutlined,
  HeartFilled,
  SafetyCertificateFilled,
} from "@ant-design/icons";

/* =========================================================
   FAITHEDU FAMILY DESIGN SYSTEM
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyDeep: "#102A43",
  navyHover: "#244F78",

  gold: "#D9A441",
  goldSoft: "#F4E7C1",
  cream: "#FFF9EE",

  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#243447",
  secondary: "#6B7280",
  muted: "#94A3B8",

  border: "#E2E8F0",
  blueSoft: "#EEF3F7",

  success: "#2E7D5B",
  successSoft: "#E8F5EE",

  danger: "#C94C4C",
  dangerSoft: "#FDECEC",
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

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return "Chào buổi sáng";
  }

  if (hour >= 11 && hour < 14) {
    return "Chúc buổi trưa an lành";
  }

  if (hour >= 14 && hour < 18) {
    return "Chúc buổi chiều bình an";
  }

  return "Chúc buổi tối an lành";
}

/* =========================================================
   CSS
========================================================= */

const HEADER_CSS = `
@import url(
  'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap'
);

/* =========================================================
   ROOT
========================================================= */

.parent-header,
.parent-header *,
.parent-header-dropdown,
.parent-header-dropdown * {
  box-sizing: border-box;
}

/* =========================================================
   HEADER
========================================================= */

.parent-header {
  position: sticky;
  top: 0;
  z-index: 90;

  width: 100%;
  min-height: 82px;

  padding: 11px 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  background:
    rgba(255, 255, 255, 0.94);

  border-bottom:
    1px solid
    rgba(226, 232, 240, 0.85);

  box-shadow:
    0 3px 20px
    rgba(16, 42, 67, 0.035);

  backdrop-filter:
    blur(18px);

  -webkit-backdrop-filter:
    blur(18px);

  font-family:
    "Be Vietnam Pro",
    Inter,
    "Segoe UI",
    sans-serif;
}

/* =========================================================
   LEFT
========================================================= */

.parent-header__left {
  min-width: 0;
  flex: 1;

  display: flex;
  align-items: center;

  gap: 13px;
}

/* =========================================================
   GREETING ICON
========================================================= */

.parent-header__greeting-icon {
  position: relative;

  width: 48px;
  height: 48px;

  flex: 0 0 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 15px;

  background:
    linear-gradient(
      145deg,
      ${COLORS.cream},
      ${COLORS.goldSoft}
    );

  border:
    1px solid
    rgba(217, 164, 65, 0.24);

  color:
    ${COLORS.gold};

  font-size: 19px;

  box-shadow:
    0 4px 14px
    rgba(217, 164, 65, 0.08);
}

.parent-header__greeting-icon::after {
  content: "";

  position: absolute;

  right: 4px;
  top: 4px;

  width: 6px;
  height: 6px;

  border-radius: 50%;

  background:
    ${COLORS.gold};
}

/* =========================================================
   HEADING
========================================================= */

.parent-header__heading {
  min-width: 0;
}

.parent-header__eyebrow {
  display: flex;
  align-items: center;

  gap: 5px;

  color:
    ${COLORS.gold};

  font-size: 9px;
  font-weight: 700;

  letter-spacing: 0.55px;

  text-transform: uppercase;
}

.parent-header__eyebrow-heart {
  font-size: 8px;
}

.parent-header__title {
  margin-top: 2px;

  overflow: hidden;

  color:
    ${COLORS.navy};

  font-family:
    "Playfair Display",
    Georgia,
    serif;

  font-size: 20px;
  font-weight: 600;

  line-height: 1.25;

  letter-spacing: -0.25px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-header__subtitle {
  margin-top: 3px;

  overflow: hidden;

  color:
    ${COLORS.secondary};

  font-size: 10px;
  font-weight: 400;

  line-height: 1.4;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* =========================================================
   RIGHT
========================================================= */

.parent-header__right {
  flex-shrink: 0;

  display: flex;
  align-items: center;

  gap: 9px;
}

/* =========================================================
   NOTIFICATION
========================================================= */

.parent-header__notification.ant-btn {
  position: relative;

  width: 44px;
  height: 44px;

  min-width: 44px;

  padding: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border:
    1px solid
    ${COLORS.border};

  border-radius: 13px;

  background:
    ${COLORS.white};

  color:
    ${COLORS.navy};

  box-shadow: none;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.parent-header__notification.ant-btn:hover {
  color:
    ${COLORS.navy} !important;

  background:
    ${COLORS.blueSoft} !important;

  border-color:
    #CBD8E5 !important;

  transform:
    translateY(-1px);
}

.parent-header__notification .anticon {
  font-size: 18px;
}

.parent-header__notification-badge {
  display: inline-flex;
}

.parent-header__notification-badge .ant-badge-dot {
  width: 9px;
  height: 9px;

  background:
    ${COLORS.danger};

  box-shadow:
    0 0 0 2px
    ${COLORS.white};
}

/* =========================================================
   ACCOUNT BUTTON
========================================================= */

.parent-header__account.ant-btn {
  height: 54px;

  max-width: 330px;

  padding:
    5px 9px 5px 6px;

  display: inline-flex;
  align-items: center;

  border:
    1px solid
    ${COLORS.border};

  border-radius: 15px;

  background:
    ${COLORS.white};

  color:
    ${COLORS.text};

  box-shadow:
    0 2px 8px
    rgba(16, 42, 67, 0.025);

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.parent-header__account.ant-btn:hover {
  color:
    ${COLORS.text} !important;

  background:
    ${COLORS.background} !important;

  border-color:
    #CBD8E5 !important;

  box-shadow:
    0 5px 16px
    rgba(16, 42, 67, 0.06);

  transform:
    translateY(-1px);
}

.parent-header__account-inner {
  display: flex;
  align-items: center;

  min-width: 0;

  gap: 10px;
}

/* =========================================================
   AVATAR
========================================================= */

.parent-header__avatar-wrap {
  position: relative;

  flex: 0 0 auto;
}

.parent-header__avatar {
  display: flex;
  align-items: center;
  justify-content: center;

  background:
    linear-gradient(
      145deg,
      ${COLORS.navy},
      ${COLORS.navyHover}
    ) !important;

  color:
    ${COLORS.white} !important;

  border:
    2px solid
    ${COLORS.white};

  box-shadow:
    0 3px 10px
    rgba(23, 59, 94, 0.15);

  font-size: 13px;
  font-weight: 700;
}

.parent-header__avatar-online {
  position: absolute;

  right: 0;
  bottom: 0;

  width: 10px;
  height: 10px;

  border:
    2px solid
    ${COLORS.white};

  border-radius: 50%;

  background:
    ${COLORS.success};
}

/* =========================================================
   USER INFO
========================================================= */

.parent-header__user-info {
  width: 160px;
  min-width: 0;

  text-align: left;
}

.parent-header__user-name {
  overflow: hidden;

  color:
    ${COLORS.navy};

  font-size: 12px;
  font-weight: 700;

  line-height: 1.4;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-header__username {
  margin-top: 3px;

  overflow: hidden;

  color:
    ${COLORS.secondary};

  font-size: 9px;
  font-weight: 400;

  line-height: 1.3;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-header__role {
  display: inline-flex;
  align-items: center;

  gap: 4px;

  margin-top: 4px;

  color:
    ${COLORS.success};

  font-size: 8px;
  font-weight: 600;
}

.parent-header__role-icon {
  font-size: 8px;
}

/* =========================================================
   CHEVRON
========================================================= */

.parent-header__chevron {
  margin-left: 2px;

  color:
    ${COLORS.muted};

  font-size: 9px;

  transition:
    transform 0.2s ease;
}

.parent-header__account.ant-btn:focus-visible
.parent-header__chevron {
  transform:
    rotate(180deg);
}

/* =========================================================
   DROPDOWN
========================================================= */

.parent-header-dropdown {
  z-index: 1000;
}

.parent-header-dropdown .ant-dropdown-menu {
  width: 270px;

  padding: 7px;

  border:
    1px solid
    ${COLORS.border};

  border-radius: 17px;

  background:
    ${COLORS.white};

  box-shadow:
    0 18px 45px
    rgba(16, 42, 67, 0.13);

  font-family:
    "Be Vietnam Pro",
    Inter,
    "Segoe UI",
    sans-serif;
}

.parent-header-dropdown .ant-dropdown-menu-item {
  min-height: 43px;

  margin: 2px 0;

  padding:
    0 11px;

  display: flex;
  align-items: center;

  gap: 9px;

  border-radius: 10px;

  color:
    ${COLORS.secondary};

  font-size: 11px;
  font-weight: 500;
}

.parent-header-dropdown .ant-dropdown-menu-item:hover {
  color:
    ${COLORS.navy} !important;

  background:
    ${COLORS.blueSoft} !important;
}

.parent-header-dropdown
.ant-dropdown-menu-item
.anticon {
  width: 18px;

  color:
    #8292A5;

  font-size: 15px;
}

.parent-header-dropdown
.ant-dropdown-menu-item:hover
.anticon {
  color:
    ${COLORS.navy};
}

.parent-header-dropdown
.ant-dropdown-menu-item-danger {
  color:
    ${COLORS.danger};
}

.parent-header-dropdown
.ant-dropdown-menu-item-danger:hover {
  color:
    ${COLORS.danger} !important;

  background:
    ${COLORS.dangerSoft} !important;
}

.parent-header-dropdown
.ant-dropdown-menu-item-danger
.anticon {
  color:
    ${COLORS.danger};
}

/* =========================================================
   CUSTOM PROFILE DROPDOWN HEADER
========================================================= */

.parent-header-dropdown__profile {
  padding:
    8px 9px 10px;

  margin-bottom: 5px;

  border-radius: 12px;

  background:
    linear-gradient(
      135deg,
      ${COLORS.background},
      ${COLORS.cream}
    );

  border:
    1px solid
    ${COLORS.border};
}

.parent-header-dropdown__profile-inner {
  display: flex;
  align-items: center;

  gap: 9px;
}

.parent-header-dropdown__profile-avatar {
  flex-shrink: 0;

  background:
    linear-gradient(
      145deg,
      ${COLORS.navy},
      ${COLORS.navyHover}
    ) !important;

  color:
    #fff !important;

  font-weight: 700;
}

.parent-header-dropdown__profile-info {
  min-width: 0;
}

.parent-header-dropdown__profile-name {
  overflow: hidden;

  color:
    ${COLORS.navy};

  font-size: 11px;
  font-weight: 700;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.parent-header-dropdown__profile-role {
  display: flex;
  align-items: center;

  gap: 4px;

  margin-top: 3px;

  color:
    ${COLORS.success};

  font-size: 8px;
  font-weight: 600;
}

.parent-header-dropdown__profile-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background:
    ${COLORS.success};
}

/* =========================================================
   DIVIDER
========================================================= */

.parent-header-dropdown .ant-dropdown-menu-item-divider {
  margin:
    6px 4px;

  background:
    ${COLORS.border};
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1100px) {

  .parent-header {
    padding:
      10px 18px;
  }

  .parent-header__greeting-icon {
    width: 44px;
    height: 44px;
    flex-basis: 44px;
  }

  .parent-header__title {
    font-size: 18px;
  }

  .parent-header__user-info {
    width: 125px;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 768px) {

  .parent-header {
    min-height: 66px;

    padding:
      8px 13px;

    gap: 7px;

    background:
      rgba(255, 255, 255, 0.97);

    box-shadow:
      0 4px 18px
      rgba(16, 42, 67, 0.05);
  }

  .parent-header__left {
    gap: 8px;
  }

  .parent-header__greeting-icon {
    width: 38px;
    height: 38px;

    flex-basis: 38px;

    border-radius: 11px;

    font-size: 15px;
  }

  .parent-header__greeting-icon::after {
    width: 5px;
    height: 5px;
  }

  .parent-header__eyebrow {
    display: none;
  }

  .parent-header__title {
    margin-top: 0;

    font-family:
      "Be Vietnam Pro",
      Inter,
      sans-serif;

    font-size: 15px;
    font-weight: 700;

    letter-spacing: -0.15px;
  }

  .parent-header__subtitle {
    display: none;
  }

  .parent-header__right {
    gap: 5px;
  }

  .parent-header__notification.ant-btn {
    width: 38px;
    height: 38px;

    min-width: 38px;

    border-radius: 11px;
  }

  .parent-header__notification .anticon {
    font-size: 16px;
  }

  .parent-header__account.ant-btn {
    width: 42px;
    height: 42px;

    min-width: 42px;

    padding: 0;

    justify-content: center;

    border-color:
      transparent;

    background:
      transparent;

    box-shadow: none;
  }

  .parent-header__account.ant-btn:hover {
    background:
      ${COLORS.blueSoft} !important;

    border-color:
      transparent !important;

    box-shadow: none;
  }

  .parent-header__account-inner {
    gap: 0;
  }

  .parent-header__user-info,
  .parent-header__role,
  .parent-header__chevron {
    display: none;
  }

  .parent-header__avatar {
    width: 39px !important;
    height: 39px !important;

    font-size: 12px;
  }

  .parent-header__avatar-online {
    width: 9px;
    height: 9px;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 380px) {

  .parent-header {
    padding:
      7px 9px;

    gap: 4px;
  }

  .parent-header__left {
    gap: 6px;
  }

  .parent-header__greeting-icon {
    width: 34px;
    height: 34px;

    flex-basis: 34px;

    border-radius: 10px;
  }

  .parent-header__title {
    max-width: 145px;

    font-size: 13px;
  }

  .parent-header__right {
    gap: 2px;
  }

  .parent-header__notification.ant-btn {
    width: 34px;
    height: 34px;

    min-width: 34px;
  }

  .parent-header__account.ant-btn {
    width: 37px;
    height: 37px;

    min-width: 37px;
  }

  .parent-header__avatar {
    width: 35px !important;
    height: 35px !important;
  }
}

/* =========================================================
   ACCESSIBILITY
========================================================= */

.parent-header button:focus-visible,
.parent-header-dropdown button:focus-visible {
  outline:
    2px solid
    ${COLORS.gold};

  outline-offset: 2px;
}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  .parent-header *,
  .parent-header *::before,
  .parent-header *::after,
  .parent-header-dropdown *,
  .parent-header-dropdown *::before,
  .parent-header-dropdown *::after {
    transition: none !important;
    animation: none !important;
  }
}
`;

/* =========================================================
   COMPONENT
========================================================= */

export default function ParentHeader({
  user,

  isMobile = false,

  onProfile,
  onLogout,
  onNotifications,

  notificationCount = 0,
}) {
  /* =======================================================
     USER DATA
  ======================================================= */

  const fullName =
    user?.full_name ||
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Phụ huynh";

  const username =
    user?.username || user?.phone || user?.email || "Tài khoản phụ huynh";

  const avatar = user?.avatar || user?.avatar_url || user?.avatarUrl || null;

  /* =======================================================
     GREETING
  ======================================================= */

  const greeting = useMemo(() => getGreeting(), []);

  /* =======================================================
     DROPDOWN MENU
  ======================================================= */

  const userMenuItems = [
    {
      key: "profile_header",

      label: (
        <div
          className="parent-header-dropdown__profile"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="parent-header-dropdown__profile-inner">
            <Avatar
              size={40}
              src={avatar}
              className="parent-header-dropdown__profile-avatar"
            >
              {!avatar && getInitials(fullName)}
            </Avatar>

            <div className="parent-header-dropdown__profile-info">
              <div
                className="parent-header-dropdown__profile-name"
                title={fullName}
              >
                {fullName}
              </div>

              <div className="parent-header-dropdown__profile-role">
                <span className="parent-header-dropdown__profile-dot" />
                <span>Phụ huynh</span>
              </div>
            </div>
          </div>
        </div>
      ),

      disabled: true,
    },

    {
      type: "divider",
    },

    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin tài khoản",
    },

    {
      key: "children",
      icon: <HeartFilled />,
      label: "Thông tin các con",
    },

    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt tài khoản",
    },

    {
      key: "divider_security",
      icon: <SafetyCertificateFilled />,
      label: "Bảo mật",
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

  /* =======================================================
     HANDLER
  ======================================================= */

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "profile":
        onProfile?.();
        break;

      case "children":
        onProfile?.("children");
        break;

      case "settings":
        onProfile?.("settings");
        break;

      case "divider_security":
        onProfile?.("security");
        break;

      case "logout":
        onLogout?.();
        break;

      default:
        break;
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>{HEADER_CSS}</style>

      <header
        className="parent-header"
        aria-label="Thanh điều hướng FaithEdu Family"
      >
        {/* =================================================
            LEFT
        ================================================= */}

        <div className="parent-header__left">
          <div className="parent-header__greeting-icon" aria-hidden="true">
            <HeartFilled />
          </div>

          <div className="parent-header__heading">
            <div className="parent-header__eyebrow">
              <HeartFilled className="parent-header__eyebrow-heart" />
              Không gian gia đình
            </div>

            <div
              className="parent-header__title"
              title={`${greeting}, ${fullName}`}
            >
              {greeting}, {fullName}
            </div>

            <div className="parent-header__subtitle">
              Cùng đồng hành với con trong hành trình học giáo lý và sống đức
              tin.
            </div>
          </div>
        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="parent-header__right">
          {/* =================================================
              NOTIFICATION
          ================================================= */}

          <Button
            type="text"
            className="parent-header__notification"
            onClick={onNotifications}
            aria-label="Thông báo"
          >
            <Badge
              dot={notificationCount > 0}
              className="parent-header__notification-badge"
            >
              <BellOutlined />
            </Badge>
          </Button>

          {/* =================================================
              ACCOUNT
          ================================================= */}

          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleMenuClick,
            }}
            placement="bottomRight"
            trigger={["click"]}
            overlayClassName="parent-header-dropdown"
            arrow
          >
            <Button
              type="text"
              className="parent-header__account"
              aria-label="Mở tài khoản"
            >
              <div className="parent-header__account-inner">
                <div className="parent-header__avatar-wrap">
                  <Avatar
                    size={42}
                    src={avatar}
                    className="parent-header__avatar"
                  >
                    {!avatar && getInitials(fullName)}
                  </Avatar>

                  <span
                    className="parent-header__avatar-online"
                    aria-hidden="true"
                  />
                </div>

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

                      <div className="parent-header__role">
                        <SafetyCertificateFilled className="parent-header__role-icon" />
                        Phụ huynh
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
