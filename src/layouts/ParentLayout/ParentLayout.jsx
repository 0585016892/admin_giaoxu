import React, { useMemo, useState, useCallback, useEffect } from "react";

import { Layout, Drawer, Grid, Avatar } from "antd";

import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useUser } from "../../context/UserContext";

import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HeartFilled,
  HomeFilled,
  TeamOutlined,
  BellOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import ParentSidebar, { MENU_ITEMS } from "./ParentSidebar";

import ParentHeader from "./ParentHeader";

const { Sider, Content } = Layout;

const { useBreakpoint } = Grid;

/* =========================================================
   DESIGN SYSTEM
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyDeep: "#102A43",
  navyHover: "#244F78",

  gold: "#D9A441",
  goldSoft: "#F4E7C1",
  goldCream: "#FFF9EE",

  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#243447",
  textPrimary: "#173B5E",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  border: "#E2E8F0",

  green: "#2E7D5B",
  danger: "#C94C4C",

  overlay: "rgba(16, 42, 67, 0.46)",
};

/* =========================================================
   CONFIG
========================================================= */

const SIDEBAR_WIDTH = 276;

const SIDEBAR_WIDTH_TABLET = 252;

const HEADER_HEIGHT = 78;

const HEADER_HEIGHT_MOBILE = 64;

const MOBILE_DRAWER_WIDTH = 318;

/* =========================================================
   HELPERS
========================================================= */

const getParentName = (user) => {
  return (
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.display_name ||
    user?.username ||
    "Phụ huynh"
  );
};

const getParentAvatar = (user) => {
  return user?.avatar || user?.avatar_url || user?.avatarUrl || null;
};

/* =========================================================
   CSS
========================================================= */

const LAYOUT_CSS = `
/* =========================================================
   ROOT
========================================================= */

.parent-layout,
.parent-layout *,
.parent-mobile-drawer,
.parent-mobile-drawer * {
  box-sizing: border-box;
}

.parent-layout {
  --fe-navy: ${COLORS.navy};
  --fe-navy-deep: ${COLORS.navyDeep};
  --fe-navy-hover: ${COLORS.navyHover};

  --fe-gold: ${COLORS.gold};
  --fe-gold-soft: ${COLORS.goldSoft};
  --fe-gold-cream: ${COLORS.goldCream};

  --fe-bg: ${COLORS.background};
  --fe-white: ${COLORS.white};

  --fe-text: ${COLORS.text};
  --fe-text-primary: ${COLORS.textPrimary};
  --fe-text-secondary: ${COLORS.textSecondary};
  --fe-text-muted: ${COLORS.textMuted};

  --fe-border: ${COLORS.border};

  --fe-green: ${COLORS.green};
  --fe-danger: ${COLORS.danger};

  --fe-sidebar-width: ${SIDEBAR_WIDTH}px;
  --fe-header-height: ${HEADER_HEIGHT}px;

  width: 100%;

  min-width: 0;

  min-height: 100vh;
  min-height: 100dvh;

  margin: 0;
  padding: 0;

  background: var(--fe-bg);

  color: var(--fe-text);

  font-family:
    "Be Vietnam Pro",
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  overflow-x: clip;
}

/* =========================================================
   HTML
========================================================= */

html,
body,
#root {
  width: 100%;

  min-width: 0;

  min-height: 100%;

  margin: 0;
  padding: 0;
}

body {
  overflow-x: hidden;
}

/* =========================================================
   ANT DESIGN
========================================================= */

.parent-layout .ant-layout {
  min-width: 0;

  background: transparent;
}

.parent-layout .ant-layout-content {
  min-width: 0;
}

/* =========================================================
   DESKTOP SIDEBAR
========================================================= */

.parent-layout__sider {
  position: fixed !important;

  top: 0;
  left: 0;
  bottom: 0;

  z-index: 1100;

  width: var(--fe-sidebar-width) !important;

  min-width: var(--fe-sidebar-width) !important;

  max-width: var(--fe-sidebar-width) !important;

  height: 100vh;
  height: 100dvh;

  background: #fff !important;

  border-right:
    1px solid
    rgba(226, 232, 240, 0.9);

  box-shadow:
    5px 0 25px
    rgba(23, 59, 94, 0.035);

  overflow: hidden;
}

.parent-layout__sider
.ant-layout-sider-children {
  width: 100%;
  height: 100%;

  margin: 0;
  padding: 0;

  overflow: hidden;

  display: flex;
  flex-direction: column;
}

/* =========================================================
   MAIN
========================================================= */

.parent-layout__main {
  position: relative;

  width: auto;

  min-width: 0;

  min-height: 100vh;
  min-height: 100dvh;

  margin-left:
    var(--fe-sidebar-width);

  background:
    var(--fe-bg);

  overflow: visible;

  transition:
    margin-left 0.25s ease;
}

/* =========================================================
   HEADER
========================================================= */

.parent-layout__header {
  position: sticky;

  top: 0;

  z-index: 900;

  width: 100%;

  height:
    var(--fe-header-height);

  min-height:
    var(--fe-header-height);

  padding: 0;
  margin: 0;

  background:
    rgba(255, 255, 255, 0.94);

  border-bottom:
    1px solid
    rgba(226, 232, 240, 0.86);

  backdrop-filter:
    blur(18px);

  -webkit-backdrop-filter:
    blur(18px);

  box-shadow:
    0 3px 20px
    rgba(23, 59, 94, 0.028);
}

.parent-layout__header
> .parent-header {
  position: relative;

  width: 100% !important;

  height:
    var(--fe-header-height) !important;

  min-height:
    var(--fe-header-height) !important;

  margin: 0;
}

/* =========================================================
   CONTENT
========================================================= */

.parent-layout__content {
  position: relative;

  width: 100%;

  min-width: 0;

  min-height:
    calc(
      100vh -
      var(--fe-header-height)
    );

  min-height:
    calc(
      100dvh -
      var(--fe-header-height)
    );

  padding:
    30px
    32px
    48px;

  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(217, 164, 65, 0.045),
      transparent 30%
    ),

    radial-gradient(
      circle at 0% 45%,
      rgba(23, 59, 94, 0.018),
      transparent 28%
    ),

    var(--fe-bg);

  overflow-x: clip;
}

.parent-layout__content-inner {
  position: relative;

  width: 100%;

  max-width: 1580px;

  min-width: 0;

  margin: 0 auto;

  animation:
    parentPageEnter
    0.22s
    ease-out;
}

@keyframes parentPageEnter {
  from {
    opacity: 0;

    transform:
      translateY(4px);
  }

  to {
    opacity: 1;

    transform:
      translateY(0);
  }
}

.parent-layout__content-inner > * {
  min-width: 0;

  max-width: 100%;
}

/* =========================================================
   TABLE
========================================================= */

.parent-layout__content-inner
.ant-table-wrapper {
  width: 100%;

  max-width: 100%;

  overflow-x: auto;

  -webkit-overflow-scrolling:
    touch;
}

/* =========================================================
   MOBILE DRAWER
========================================================= */

.parent-mobile-drawer {
  z-index: 2100;
}

.parent-mobile-drawer
.ant-drawer-mask {
  background:
    ${COLORS.overlay} !important;

  backdrop-filter:
    blur(5px);

  -webkit-backdrop-filter:
    blur(5px);
}

.parent-mobile-drawer
.ant-drawer-content-wrapper {
  width:
    min(
      ${MOBILE_DRAWER_WIDTH}px,
      88vw
    ) !important;

  max-width: 88vw;

  height: 100dvh;

  box-shadow:
    20px 0 60px
    rgba(16, 42, 67, 0.22);
}

.parent-mobile-drawer
.ant-drawer-content {
  height: 100%;

  padding: 0 !important;

  background: #fff !important;

  border-radius:
    0 24px 24px 0;

  overflow: hidden;
}

.parent-mobile-drawer
.ant-drawer-body {
  height: 100%;

  padding: 0 !important;

  overflow-x: hidden;

  overflow-y: auto;

  background: #fff;
}

.parent-mobile-drawer
.ant-drawer-header,
.parent-mobile-drawer
.ant-drawer-close {
  display: none !important;
}

/* =========================================================
   MOBILE BOTTOM NAV
========================================================= */

.parent-mobile-bottom-nav {
  display: none;
}

@media (max-width: 767px) {

  .parent-layout {
    --fe-header-height:
      ${HEADER_HEIGHT_MOBILE}px;
  }

  .parent-layout__sider {
    display: none !important;
  }

  .parent-layout__main {
    width: 100%;

    min-width: 0;

    margin-left: 0;
  }

  .parent-layout__header {
    height:
      var(--fe-header-height);

    min-height:
      var(--fe-header-height);
  }

  .parent-layout__header
  > .parent-header {
    height:
      var(--fe-header-height) !important;

    min-height:
      var(--fe-header-height) !important;
  }

  .parent-layout__content {
    width: 100%;

    min-height:
      calc(
        100dvh -
        var(--fe-header-height)
      );

    padding:
      15px
      13px
      calc(
        104px +
        env(safe-area-inset-bottom)
      );
  }

  .parent-layout__content-inner {
    width: 100%;

    max-width: 100%;
  }

  /* =======================================================
     BOTTOM NAV
  ======================================================= */

  .parent-mobile-bottom-nav {
    position: fixed;

    left: 9px;
    right: 9px;

    bottom:
      calc(
        8px +
        env(safe-area-inset-bottom)
      );

    z-index: 2200;

    height: 68px;

    padding: 6px;

    display: grid;

    grid-template-columns:
      repeat(4, minmax(0, 1fr));

    gap: 4px;

    align-items: stretch;

    background:
      rgba(255, 255, 255, 0.97);

    border:
      1px solid
      rgba(226, 232, 240, 0.96);

    border-radius: 22px;

    box-shadow:
      0 12px 35px
      rgba(16, 42, 67, 0.16),

      0 3px 10px
      rgba(16, 42, 67, 0.07);

    backdrop-filter:
      blur(20px);

    -webkit-backdrop-filter:
      blur(20px);

    box-sizing: border-box;
  }

  .parent-mobile-bottom-nav__item {
    position: relative;

    min-width: 0;

    height: 56px;

    padding:
      5px 2px;

    border: 0;

    outline: 0;

    border-radius: 17px;

    background: transparent;

    color:
      ${COLORS.textSecondary};

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    gap: 3px;

    font-family:
      "Be Vietnam Pro",
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;

    font-size: 10px;

    font-weight: 600;

    cursor: pointer;

    transition:
      color 0.18s ease,
      background 0.18s ease,
      transform 0.18s ease;

    -webkit-tap-highlight-color:
      transparent;
  }

  .parent-mobile-bottom-nav__item:active {
    transform:
      scale(0.94);
  }

  .parent-mobile-bottom-nav__item.is-active {
    color:
      ${COLORS.navy};

    background:
      #EEF3F7;
  }

  .parent-mobile-bottom-nav__icon {
    position: relative;

    width: 30px;

    height: 27px;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 20px;

    line-height: 1;
  }

  .parent-mobile-bottom-nav__label {
    line-height: 1;

    white-space: nowrap;
  }

  .parent-mobile-bottom-nav__badge {
    position: absolute;

    top: -5px;

    right: -7px;

    min-width: 17px;

    height: 17px;

    padding:
      0 4px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 99px;

    background:
      ${COLORS.danger};

    color: #fff;

    border:
      2px solid #fff;

    font-size: 9px;

    font-weight: 700;

    line-height: 13px;
  }

  .parent-mobile-bottom-nav__more {
    color:
      ${COLORS.navy};
  }

  .parent-mobile-bottom-nav__more
  .parent-mobile-bottom-nav__icon {
    width: 34px;

    height: 34px;

    border-radius: 12px;

    background:
      ${COLORS.navy};

    color: #fff;

    font-size: 17px;

    transition:
      transform 0.22s ease;
  }

  .parent-mobile-bottom-nav__more.is-open
  .parent-mobile-bottom-nav__icon {
    transform:
      rotate(90deg);
  }

  .parent-mobile-bottom-nav__more
  .parent-mobile-bottom-nav__label {
    color:
      ${COLORS.navy};
  }
}

/* =========================================================
   MOBILE DRAWER CONTENT
========================================================= */

.fe-family-mobile-drawer {
  min-height: 100%;

  display: flex;

  flex-direction: column;

  padding:
    18px 15px
    calc(
      20px +
      env(safe-area-inset-bottom)
    );

  background:
    radial-gradient(
      circle at top left,
      rgba(217, 164, 65, 0.10),
      transparent 31%
    ),

    #fff;

  font-family:
    "Be Vietnam Pro",
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.fe-family-mobile-drawer__top {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 10px;

  padding-bottom: 16px;

  border-bottom:
    1px solid
    #EEF2F6;
}

.fe-family-mobile-drawer__brand {
  display: flex;

  align-items: center;

  gap: 10px;
}

.fe-family-mobile-drawer__brand-logo {
  width: 44px;

  height: 44px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 14px;

  background:
    ${COLORS.goldCream};

  border:
    1px solid
    ${COLORS.goldSoft};

  overflow: hidden;
}

.fe-family-mobile-drawer__brand-logo img {
  width: 34px;

  height: 34px;

  object-fit: contain;
}

.fe-family-mobile-drawer__brand-name {
  color:
    ${COLORS.navy};

  font-family:
    "Playfair Display",
    Georgia,
    serif;

  font-size: 21px;

  font-weight: 700;

  line-height: 1;
}

.fe-family-mobile-drawer__brand-name span {
  color:
    ${COLORS.gold};
}

.fe-family-mobile-drawer__close {
  width: 38px;

  height: 38px;

  display: flex;

  align-items: center;

  justify-content: center;

  border: none;

  border-radius: 11px;

  background:
    #F7F9FC;

  color:
    ${COLORS.textSecondary};

  cursor: pointer;

  font-size: 17px;
}

.fe-family-mobile-drawer__profile {
  display: flex;

  align-items: center;

  gap: 12px;

  margin:
    15px 0 17px;

  padding: 12px;

  border-radius: 16px;

  border:
    1px solid
    #EDF1F5;

  background:
    linear-gradient(
      135deg,
      #F7F9FC,
      #FFFDF8
    );
}

.fe-family-mobile-drawer__avatar {
  flex: 0 0 auto;

  background:
    ${COLORS.navy} !important;

  color: #fff;

  border:
    2px solid
    ${COLORS.goldSoft};
}

.fe-family-mobile-drawer__profile-name {
  color:
    ${COLORS.navy};

  font-size: 14px;

  font-weight: 700;
}

.fe-family-mobile-drawer__profile-role {
  margin-top: 3px;

  color:
    ${COLORS.textMuted};

  font-size: 10px;
}

.fe-family-mobile-drawer__section {
  margin-bottom: 9px;
}

.fe-family-mobile-drawer__title {
  padding:
    5px 9px 6px;

  color:
    ${COLORS.textMuted};

  font-size: 9px;

  font-weight: 800;

  letter-spacing: 1.2px;

  text-transform: uppercase;
}

.fe-family-mobile-drawer__item {
  width: 100%;

  display: flex;

  align-items: center;

  gap: 11px;

  margin:
    3px 0;

  padding:
    10px 11px;

  border: none;

  border-radius: 13px;

  background:
    transparent;

  color:
    ${COLORS.textSecondary};

  text-align: left;

  cursor: pointer;

  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.fe-family-mobile-drawer__item:hover {
  background:
    #F7F9FC;

  color:
    ${COLORS.navy};
}

.fe-family-mobile-drawer__item:active {
  transform:
    scale(0.985);
}

.fe-family-mobile-drawer__item.is-active {
  background:
    #EEF3F7;

  color:
    ${COLORS.navy};
}

.fe-family-mobile-drawer__item-icon {
  width: 38px;

  height: 38px;

  flex: 0 0 38px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 11px;

  background:
    #F7F9FC;

  color:
    #94A3B8;

  font-size: 17px;
}

.fe-family-mobile-drawer__item.is-active
.fe-family-mobile-drawer__item-icon {
  background:
    ${COLORS.goldSoft};

  color:
    ${COLORS.gold};
}

.fe-family-mobile-drawer__item-copy {
  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 2px;
}

.fe-family-mobile-drawer__item-label {
  color: inherit;

  font-size: 12px;

  font-weight: 700;
}

.fe-family-mobile-drawer__item-description {
  color:
    ${COLORS.textMuted};

  font-size: 9px;

  line-height: 1.3;
}

.fe-family-mobile-drawer__logout {
  width: 100%;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  margin-top: 5px;

  padding:
    11px 12px;

  border: none;

  border-radius: 12px;

  background:
    #FFF5F5;

  color:
    ${COLORS.danger};

  font-size: 11px;

  font-weight: 700;

  cursor: pointer;
}

/* =========================================================
   TABLET
========================================================= */

@media (min-width: 768px)
and (max-width: 1100px) {

  .parent-layout {
    --fe-sidebar-width:
      ${SIDEBAR_WIDTH_TABLET}px;
  }

  .parent-layout__content {
    padding:
      24px
      22px
      38px;
  }
}

/* =========================================================
   SMALL DESKTOP
========================================================= */

@media (min-width: 1101px)
and (max-width: 1399px) {

  .parent-layout__content {
    padding:
      26px
      26px
      42px;
  }
}

/* =========================================================
   LARGE DESKTOP
========================================================= */

@media (min-width: 1600px) {

  .parent-layout__content {
    padding-left: 40px;

    padding-right: 40px;
  }

  .parent-layout__content-inner {
    max-width: 1640px;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 576px) {

  .parent-layout__content {
    padding-left: 11px;

    padding-right: 11px;

    padding-bottom:
      calc(
        103px +
        env(safe-area-inset-bottom)
      );
  }
}

/* =========================================================
   VERY SMALL MOBILE
========================================================= */

@media (max-width: 380px) {

  .parent-layout__content {
    padding:
      11px
      9px
      calc(
        98px +
        env(safe-area-inset-bottom)
      );
  }

  .parent-mobile-bottom-nav {
    left: 7px;

    right: 7px;

    bottom:
      calc(
        6px +
        env(safe-area-inset-bottom)
      );

    height: 64px;

    border-radius: 19px;
  }

  .parent-mobile-bottom-nav__item {
    height: 52px;

    font-size: 9px;
  }

  .parent-mobile-bottom-nav__icon {
    font-size: 18px;
  }
}

/* =========================================================
   ACCESSIBILITY
========================================================= */

.parent-layout button,
.parent-layout a {
  -webkit-tap-highlight-color:
    transparent;
}

.parent-layout
button:focus-visible,
.parent-layout
a:focus-visible {
  outline:
    3px solid
    rgba(217, 164, 65, 0.38);

  outline-offset:
    2px;
}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  .parent-layout *,
  .parent-mobile-drawer * {
    animation: none !important;

    transition: none !important;
  }
}

/* =========================================================
   PRINT
========================================================= */

@media print {

  .parent-layout__sider,
  .parent-layout__header,
  .parent-mobile-bottom-nav {
    display: none !important;
  }

  .parent-layout__main {
    margin-left: 0 !important;
  }

  .parent-layout__content {
    padding: 0 !important;

    background: #fff !important;
  }
}
`;

/* =========================================================
   COMPONENT
========================================================= */

export default function ParentLayout() {
  /* =======================================================
     USER
  ======================================================= */

  const { user, logout } = useUser();

  /* =======================================================
     ROUTER
  ======================================================= */

  const navigate = useNavigate();

  const location = useLocation();

  /* =======================================================
     RESPONSIVE
  ======================================================= */

  const screens = useBreakpoint();

  const isMobile = screens.md === false;

  /* =======================================================
     MOBILE DRAWER
  ======================================================= */

  const [drawerOpen, setDrawerOpen] = useState(false);

  /* =======================================================
     SELECTED KEY
  ======================================================= */

  const selectedKey = useMemo(() => {
    const pathname = location.pathname || "/parent";

    if (pathname === "/parent" || pathname === "/parent/") {
      return "/parent";
    }

    if (
      pathname === "/parent/students" ||
      pathname.startsWith("/parent/students/")
    ) {
      return "/parent/students";
    }

    if (
      pathname === "/parent/children" ||
      pathname.startsWith("/parent/children/")
    ) {
      return "/parent/students";
    }

    if (
      pathname === "/parent/notifications" ||
      pathname.startsWith("/parent/notifications/")
    ) {
      return "/parent/notifications";
    }

    if (
      pathname === "/parent/support" ||
      pathname.startsWith("/parent/support/") ||
      pathname === "/parent/contact" ||
      pathname.startsWith("/parent/contact/")
    ) {
      return "/parent/support";
    }

    if (
      pathname === "/parent/profile" ||
      pathname.startsWith("/parent/profile/")
    ) {
      return "/parent/profile";
    }

    if (
      pathname === "/parent/settings" ||
      pathname.startsWith("/parent/settings/")
    ) {
      return "/parent/settings";
    }

    const matchedItem = [...MENU_ITEMS]
      .filter((item) => item && item.key && item.key !== "/parent")
      .sort((a, b) => b.key.length - a.key.length)
      .find((item) => {
        return pathname === item.key || pathname.startsWith(`${item.key}/`);
      });

    return matchedItem?.key || "/parent";
  }, [location.pathname]);

  /* =======================================================
     CLOSE WHEN ROUTE CHANGES
  ======================================================= */

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  /* =======================================================
     CLOSE WHEN DESKTOP
  ======================================================= */

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  /* =======================================================
     BODY LOCK
  ======================================================= */

  useEffect(() => {
    if (!isMobile || !drawerOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, drawerOpen]);

  /* =======================================================
     OPEN DRAWER
  ======================================================= */

  const handleMenuOpen = useCallback(() => {
    if (!isMobile) {
      return;
    }

    setDrawerOpen(true);
  }, [isMobile]);

  /* =======================================================
     CLOSE DRAWER
  ======================================================= */

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigate = useCallback(
    (path) => {
      if (!path) {
        return;
      }

      setDrawerOpen(false);

      if (location.pathname !== path) {
        navigate(path);
      }
    },
    [navigate, location.pathname],
  );

  /* =======================================================
     MENU CLICK
  ======================================================= */

  const handleMenuClick = useCallback(
    ({ key }) => {
      handleNavigate(key);
    },
    [handleNavigate],
  );

  /* =======================================================
     PROFILE
  ======================================================= */

  const handleProfile = useCallback(() => {
    handleNavigate("/parent/profile");
  }, [handleNavigate]);

  /* =======================================================
     SETTINGS
  ======================================================= */

  const handleSettings = useCallback(() => {
    handleNavigate("/parent/settings");
  }, [handleNavigate]);

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const handleNotifications = useCallback(() => {
    handleNavigate("/parent/notifications");
  }, [handleNavigate]);

  /* =======================================================
     CONTACT
  ======================================================= */

  const handleContact = useCallback(() => {
    /*
     * Giữ đúng route mà code hiện tại
     * của bạn đang dùng.
     */
    handleNavigate("/parent/contact");
  }, [handleNavigate]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = useCallback(async () => {
    console.log("");

    console.log("============================================================");

    console.log("                 PARENT LOGOUT");

    console.log("============================================================");

    try {
      if (typeof logout === "function") {
        console.log("[PARENT LOGOUT] Calling UserContext.logout()");

        await logout();
      } else {
        console.warn("[PARENT LOGOUT] logout() không tồn tại");

        localStorage.removeItem("token");

        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("[PARENT LOGOUT] ERROR:", error);

      try {
        localStorage.removeItem("token");

        localStorage.removeItem("user");
      } catch (storageError) {
        console.error("[PARENT LOGOUT] STORAGE ERROR:", storageError);
      }
    } finally {
      setDrawerOpen(false);

      navigate("/", {
        replace: true,
      });

      console.log("[PARENT LOGOUT] Redirect -> /");

      console.log(
        "============================================================",
      );
    }
  }, [logout, navigate]);

  /* =======================================================
     AUTH
  ======================================================= */

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "parent") {
    if (["catechist", "teacher", "admin_catechist"].includes(user.role)) {
      return <Navigate to="/catechist" replace />;
    }

    return <Navigate to="/" replace />;
  }

  /* =======================================================
     USER DATA
  ======================================================= */

  const parentName = getParentName(user);

  const parentAvatar = getParentAvatar(user);

  const parentFirstLetter = parentName.trim().charAt(0).toUpperCase() || "P";

  /*
   * Nếu sau này API có notificationCount
   * thì tự lấy.
   */
  const notificationCount = Number(
    user?.notificationCount || user?.unreadNotificationCount || 0,
  );

  /* =======================================================
     DESKTOP SIDEBAR
  ======================================================= */

  const sidebar = (
    <ParentSidebar
      user={user}
      selectedKey={selectedKey}
      onMenuClick={handleMenuClick}
      onContactClick={handleContact}
      onMoreClick={handleMenuOpen}
      onCloseMobileDrawer={handleDrawerClose}
      onLogout={handleLogout}
      notificationCount={notificationCount}
    />
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>{LAYOUT_CSS}</style>

      <Layout className="parent-layout">
        {/* =================================================
            DESKTOP SIDEBAR
        ================================================= */}

        {!isMobile && (
          <Sider
            width={SIDEBAR_WIDTH}
            theme="light"
            trigger={null}
            className="parent-layout__sider"
            aria-label="Thanh điều hướng phụ huynh"
          >
            {sidebar}
          </Sider>
        )}

        {/* =================================================
            MOBILE DRAWER
        ================================================= */}

        {isMobile && (
          <Drawer
            placement="left"
            open={drawerOpen}
            onClose={handleDrawerClose}
            width={MOBILE_DRAWER_WIDTH}
            closable={false}
            destroyOnClose
            rootClassName="parent-mobile-drawer"
            title={null}
            styles={{
              body: {
                padding: 0,

                background: COLORS.white,

                overflowX: "hidden",

                overflowY: "auto",
              },

              content: {
                padding: 0,

                background: COLORS.white,
              },

              header: {
                display: "none",
              },
            }}
          >
            <div className="fe-family-mobile-drawer">
              {/* =========================================
                  HEADER
              ========================================= */}

              <div className="fe-family-mobile-drawer__top">
                <div className="fe-family-mobile-drawer__brand">
                  <div className="fe-family-mobile-drawer__brand-logo">
                    <img
                      src={require("../../assets/images/logoXn.png")}
                      alt="FaithEdu"
                    />
                  </div>

                  <div className="fe-family-mobile-drawer__brand-name">
                    Faith
                    <span>Edu</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="fe-family-mobile-drawer__close"
                  onClick={handleDrawerClose}
                  aria-label="Đóng menu"
                >
                  <CloseOutlined />
                </button>
              </div>

              {/* =========================================
                  PROFILE
              ========================================= */}

              <div className="fe-family-mobile-drawer__profile">
                <Avatar
                  size={46}
                  src={parentAvatar}
                  className="fe-family-mobile-drawer__avatar"
                  icon={!parentAvatar ? <UserOutlined /> : undefined}
                >
                  {!parentAvatar && parentFirstLetter}
                </Avatar>

                <div>
                  <div className="fe-family-mobile-drawer__profile-name">
                    {parentName}
                  </div>

                  <div className="fe-family-mobile-drawer__profile-role">
                    Phụ huynh • FaithEdu Family
                  </div>
                </div>
              </div>

              {/* =========================================
                  FAMILY
              ========================================= */}

              <div className="fe-family-mobile-drawer__section">
                <div className="fe-family-mobile-drawer__title">
                  Không gian gia đình
                </div>

                {MENU_ITEMS.map((item) => {
                  if (!item) {
                    return null;
                  }

                  const itemKey = item.key;

                  const active = selectedKey === itemKey;

                  let description = "";

                  if (itemKey === "/parent") {
                    description = "Tổng quan gia đình";
                  }

                  if (itemKey === "/parent/students") {
                    description = "Theo dõi các con";
                  }

                  if (itemKey === "/parent/notifications") {
                    description = "Tin tức và thông báo";
                  }

                  if (itemKey === "/parent/support") {
                    description = "Liên hệ và trợ giúp";
                  }

                  return (
                    <button
                      key={itemKey}
                      type="button"
                      className={[
                        "fe-family-mobile-drawer__item",

                        active ? "is-active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => {
                        if (itemKey === "/parent/support") {
                          handleContact();

                          return;
                        }

                        handleNavigate(itemKey);
                      }}
                    >
                      <span className="fe-family-mobile-drawer__item-icon">
                        {item.icon}
                      </span>

                      <span className="fe-family-mobile-drawer__item-copy">
                        <span className="fe-family-mobile-drawer__item-label">
                          {item.label}
                        </span>

                        <span className="fe-family-mobile-drawer__item-description">
                          {description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* =========================================
                  ACCOUNT
              ========================================= */}

              <div className="fe-family-mobile-drawer__section">
                <div className="fe-family-mobile-drawer__title">Tài khoản</div>

                <button
                  type="button"
                  className={[
                    "fe-family-mobile-drawer__item",

                    selectedKey === "/parent/profile" ? "is-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={handleProfile}
                >
                  <span className="fe-family-mobile-drawer__item-icon">
                    <UserOutlined />
                  </span>

                  <span className="fe-family-mobile-drawer__item-copy">
                    <span className="fe-family-mobile-drawer__item-label">
                      Hồ sơ của tôi
                    </span>

                    <span className="fe-family-mobile-drawer__item-description">
                      Thông tin tài khoản
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  className={[
                    "fe-family-mobile-drawer__item",

                    selectedKey === "/parent/settings" ? "is-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={handleSettings}
                >
                  <span className="fe-family-mobile-drawer__item-icon">
                    <SettingOutlined />
                  </span>

                  <span className="fe-family-mobile-drawer__item-copy">
                    <span className="fe-family-mobile-drawer__item-label">
                      Cài đặt
                    </span>

                    <span className="fe-family-mobile-drawer__item-description">
                      Thiết lập ứng dụng
                    </span>
                  </span>
                </button>
              </div>

              {/* =========================================
                  FAITH CARD
              ========================================= */}

              <div
                style={{
                  margin: "4px 16px 16px",

                  padding: "13px",

                  border: "1px solid rgba(217,164,65,.22)",

                  borderRadius: "15px",

                  background: "linear-gradient(135deg,#FFF9EE,#FFFFFF)",
                }}
              >
                <div
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: "8px",

                    color: COLORS.navy,

                    fontFamily: "Playfair Display, Georgia, serif",

                    fontSize: "12px",

                    fontWeight: 600,
                  }}
                >
                  <HeartFilled
                    style={{
                      color: COLORS.gold,
                    }}
                  />
                  Cùng con lớn lên trong đức tin
                </div>

                <div
                  style={{
                    marginTop: "5px",

                    color: COLORS.textSecondary,

                    fontSize: "9px",

                    lineHeight: 1.55,
                  }}
                >
                  Đồng hành cùng con trong hành trình học giáo lý và sống đạo.
                </div>
              </div>

              {/* =========================================
                  LOGOUT
              ========================================= */}

              <button
                type="button"
                className="fe-family-mobile-drawer__logout"
                onClick={handleLogout}
              >
                <LogoutOutlined />
                Đăng xuất tài khoản
              </button>
            </div>
          </Drawer>
        )}

        {/* =================================================
            MAIN
        ================================================= */}

        <Layout className="parent-layout__main">
          {/* ===============================================
              HEADER
          =============================================== */}

          <header className="parent-layout__header">
            <ParentHeader
              user={user}
              isMobile={isMobile}
              onMenuOpen={handleMenuOpen}
              onProfile={handleProfile}
              onLogout={handleLogout}
              onNotifications={handleNotifications}
              notificationCount={notificationCount}
            />
          </header>

          {/* ===============================================
              CONTENT
          =============================================== */}

          <Content className="parent-layout__content">
            <main
              className="parent-layout__content-inner"
              key={location.pathname}
              aria-live="polite"
            >
              <Outlet />
            </main>
          </Content>
        </Layout>

        {/* =================================================
            MOBILE BOTTOM NAV
        ================================================= */}

        {isMobile && (
          <nav
            className="parent-mobile-bottom-nav"
            aria-label="Điều hướng FaithEdu Family"
          >
            {/* =============================================
                HOME
            ============================================= */}

            <button
              type="button"
              className={[
                "parent-mobile-bottom-nav__item",

                selectedKey === "/parent" ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleNavigate("/parent")}
              aria-label="Trang chủ"
            >
              <span className="parent-mobile-bottom-nav__icon">
                <HomeFilled />
              </span>

              <span className="parent-mobile-bottom-nav__label">Trang chủ</span>
            </button>

            {/* =============================================
                STUDENTS
            ============================================= */}

            <button
              type="button"
              className={[
                "parent-mobile-bottom-nav__item",

                selectedKey === "/parent/students" ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleNavigate("/parent/students")}
              aria-label="Các con"
            >
              <span className="parent-mobile-bottom-nav__icon">
                <TeamOutlined />
              </span>

              <span className="parent-mobile-bottom-nav__label">Các con</span>
            </button>

            {/* =============================================
                NOTIFICATIONS
            ============================================= */}

            <button
              type="button"
              className={[
                "parent-mobile-bottom-nav__item",

                selectedKey === "/parent/notifications" ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleNavigate("/parent/notifications")}
              aria-label="Thông báo"
            >
              <span className="parent-mobile-bottom-nav__icon">
                <BellOutlined />

                {notificationCount > 0 && (
                  <span className="parent-mobile-bottom-nav__badge">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </span>

              <span className="parent-mobile-bottom-nav__label">Thông báo</span>
            </button>

            {/* =============================================
                MORE
            ============================================= */}

            <button
              type="button"
              className={[
                "parent-mobile-bottom-nav__item",

                "parent-mobile-bottom-nav__more",

                drawerOpen ? "is-open" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={handleMenuOpen}
              aria-label="Thêm"
              aria-expanded={drawerOpen}
            >
              <span className="parent-mobile-bottom-nav__icon">
                {drawerOpen ? <CloseOutlined /> : <MenuOutlined />}
              </span>

              <span className="parent-mobile-bottom-nav__label">Thêm</span>
            </button>
          </nav>
        )}
      </Layout>
    </>
  );
}
