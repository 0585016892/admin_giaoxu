import React, { useMemo, useState, useCallback } from "react";

import { Layout, Drawer, Grid } from "antd";

import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useUser } from "../../context/UserContext";

import ParentSidebar, { MENU_ITEMS } from "./ParentSidebar";

import ParentHeader from "./ParentHeader";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

/**
 * =========================================================
 * DESIGN TOKENS
 * =========================================================
 */

const COLORS = {
  navy: "#173B5E",
  navyDark: "#102E49",
  gold: "#D9A441",

  background: "#F6F8FB",
  white: "#FFFFFF",

  border: "#E5EAF0",
  borderLight: "#EEF2F6",

  text: "#172033",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  shadow: "0 8px 30px rgba(15, 23, 42, 0.05)",
};

const SIDEBAR_WIDTH = 264;
const HEADER_HEIGHT = 72;

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function ParentLayout() {
  const { user, logout } = useUser();

  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  const [drawerOpen, setDrawerOpen] = useState(false);

  /**
   * =======================================================
   * ACTIVE MENU
   * =======================================================
   */

  const selectedKey = useMemo(() => {
    const pathname = location.pathname;

    /**
     * Dashboard
     */
    if (pathname === "/parent" || pathname === "/parent/") {
      return "/parent";
    }

    /**
     * Các route con
     */
    const matchedItem = MENU_ITEMS.filter((item) => item.key !== "/parent")
      .sort((a, b) => b.key.length - a.key.length)
      .find((item) => pathname.startsWith(item.key));

    return matchedItem?.key || "/parent";
  }, [location.pathname]);

  /**
   * =======================================================
   * MENU NAVIGATION
   * =======================================================
   */

  const handleMenuClick = useCallback(
    ({ key }) => {
      navigate(key);

      if (isMobile) {
        setDrawerOpen(false);
      }
    },
    [navigate, isMobile],
  );

  /**
   * =======================================================
   * MOBILE DRAWER
   * =======================================================
   */

  const handleMenuOpen = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  /**
   * =======================================================
   * PROFILE
   * =======================================================
   */

  const handleProfile = useCallback(() => {
    navigate("/parent/profile");

    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [navigate, isMobile]);

  /**
   * =======================================================
   * NOTIFICATIONS
   * =======================================================
   */

  const handleNotifications = useCallback(() => {
    navigate("/parent/notifications");
  }, [navigate]);

  /**
   * =======================================================
   * LOGOUT
   * =======================================================
   */

  const handleLogout = useCallback(async () => {
    try {
      if (typeof logout === "function") {
        await logout();
      } else {
        localStorage.removeItem("token");

        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("PARENT LOGOUT ERROR:", error);

      localStorage.removeItem("token");

      localStorage.removeItem("user");
    } finally {
      setDrawerOpen(false);

      navigate("/", {
        replace: true,
      });
    }
  }, [logout, navigate]);

  /**
   * =======================================================
   * SECURITY
   * =======================================================
   */

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "parent") {
    if (["catechist", "teacher", "admin_catechist"].includes(user.role)) {
      return <Navigate to="/catechist" replace />;
    }

    return <Navigate to="/" replace />;
  }

  /**
   * =======================================================
   * SIDEBAR
   * =======================================================
   */

  const sidebar = (
    <ParentSidebar
      user={user}
      selectedKey={selectedKey}
      onMenuClick={handleMenuClick}
    />
  );

  /**
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <Layout
      className="parent-layout"
      style={{
        minHeight: "100vh",
        background: COLORS.background,
      }}
    >
      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      {!isMobile && (
        <Sider
          width={SIDEBAR_WIDTH}
          theme="light"
          trigger={null}
          className="parent-sidebar"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,

            width: SIDEBAR_WIDTH,
            maxWidth: SIDEBAR_WIDTH,
            minWidth: SIDEBAR_WIDTH,

            height: "100vh",

            overflow: "hidden",

            background: COLORS.white,

            borderRight: `1px solid ${COLORS.border}`,

            zIndex: 100,

            boxShadow: "4px 0 24px rgba(15,23,42,0.025)",
          }}
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
          width={292}
          closable={false}
          destroyOnHidden
          rootClassName="parent-mobile-drawer"
          styles={{
            body: {
              padding: 0,
              overflow: "hidden",
              background: COLORS.white,
            },

            content: {
              padding: 0,
              overflow: "hidden",
              background: COLORS.white,
            },

            wrapper: {
              boxShadow: "12px 0 40px rgba(15,23,42,0.15)",
            },
          }}
        >
          {sidebar}
        </Drawer>
      )}

      {/* =================================================
          MAIN
      ================================================= */}

      <Layout
        className="parent-main"
        style={{
          minHeight: "100vh",
          minWidth: 0,

          marginLeft: isMobile ? 0 : SIDEBAR_WIDTH,

          background: COLORS.background,
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="parent-header-wrapper">
          <ParentHeader
            user={user}
            isMobile={isMobile}
            onMenuOpen={handleMenuOpen}
            onProfile={handleProfile}
            onLogout={handleLogout}
            onNotifications={handleNotifications}
          />
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <Content
          className="parent-content"
          style={{
            minWidth: 0,
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,

            background: COLORS.background,

            padding: isMobile ? "18px 14px 28px" : "28px 30px 40px",
          }}
        >
          <main
            className="parent-content-inner"
            style={{
              width: "100%",
              maxWidth: 1560,
              margin: "0 auto",
            }}
          >
            <Outlet />
          </main>
        </Content>
      </Layout>

      {/* =================================================
          GLOBAL PARENT LAYOUT CSS
      ================================================= */}

      <style>{`

        /* ===================================================
           ROOT
        =================================================== */

        .parent-layout {
          width: 100%;
          min-height: 100vh;
          overflow-x: clip;
        }

        .parent-main {
          min-width: 0;
        }

        /* ===================================================
           SIDEBAR
        =================================================== */

        .parent-sidebar {
          box-sizing: border-box;
        }

        .parent-sidebar,
        .parent-sidebar .ant-layout-sider-children {
          background: #ffffff !important;
        }

        /* ===================================================
           HEADER
        =================================================== */

        .parent-header-wrapper {
          position: sticky;
          top: 0;
          z-index: 90;

          height: ${HEADER_HEIGHT}px;

          background:
            rgba(255,255,255,0.92);

          backdrop-filter:
            blur(18px);

          -webkit-backdrop-filter:
            blur(18px);

          border-bottom:
            1px solid ${COLORS.border};

          box-shadow:
            0 1px 0 rgba(15,23,42,0.015);
        }

        .parent-header-wrapper > header {
          height: 100% !important;

          background:
            transparent !important;

          border-bottom:
            none !important;
        }

        /* ===================================================
           CONTENT
        =================================================== */

        .parent-content {
          box-sizing: border-box;
        }

        .parent-content-inner {
          box-sizing: border-box;
          min-width: 0;
        }

        /* ===================================================
           ANT MENU
        =================================================== */

        .parent-sidebar .ant-menu {
          font-size: 13px;
        }

        .parent-sidebar .ant-menu-item {
          height: 46px;
          line-height: 46px;

          margin:
            4px 0 !important;

          width: 100%;

          border-radius: 11px;

          color: #64748B;

          font-weight: 500;

          transition:
            background 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease;
        }

        .parent-sidebar .ant-menu-item:hover {
          color: ${COLORS.navy} !important;

          background:
            #F3F7FA !important;

          transform:
            translateX(2px);
        }

        .parent-sidebar
        .ant-menu-item-selected {
          color: ${COLORS.navy} !important;

          background:
            linear-gradient(
              90deg,
              #EDF4F8 0%,
              #F5F8FA 100%
            ) !important;

          font-weight: 700;
        }

        .parent-sidebar
        .ant-menu-item-selected::after {
          display: none !important;
        }

        .parent-sidebar
        .ant-menu-item-selected
        .ant-menu-item-icon {
          color: ${COLORS.navy} !important;
        }

        .parent-sidebar
        .ant-menu-item
        .ant-menu-item-icon {
          font-size: 17px;
          color: #94A3B8;
        }

        .parent-sidebar
        .ant-menu-item-selected
        .ant-menu-item-icon {
          color: ${COLORS.navy} !important;
        }

        /* ===================================================
           DRAWER
        =================================================== */

        .parent-mobile-drawer
        .ant-drawer-mask {
          background:
            rgba(15,23,42,0.35);
          backdrop-filter:
            blur(2px);
        }

        .parent-mobile-drawer
        .ant-drawer-content {
          background: #ffffff;
        }

        .parent-mobile-drawer
        .ant-drawer-body {
          padding: 0 !important;
        }

        /* ===================================================
           SCROLLBAR
        =================================================== */

        .parent-sidebar
        ::-webkit-scrollbar {
          width: 5px;
        }

        .parent-sidebar
        ::-webkit-scrollbar-track {
          background: transparent;
        }

        .parent-sidebar
        ::-webkit-scrollbar-thumb {
          background:
            #DCE3EA;

          border-radius: 10px;
        }

        /* ===================================================
           TABLET
        =================================================== */

        @media (max-width: 1199px) {

          .parent-content {
            padding:
              24px 22px 32px !important;
          }

          .parent-content-inner {
            max-width: 100%;
          }

        }

        /* ===================================================
           MOBILE
        =================================================== */

        @media (max-width: 767px) {

          .parent-content {
            padding:
              16px 12px 26px !important;
          }

          .parent-content-inner {
            width: 100%;
            max-width: 100%;
          }

          .parent-header-wrapper {
            height: 64px;
          }

        }

        /* ===================================================
           SMALL MOBILE
        =================================================== */

        @media (max-width: 420px) {

          .parent-content {
            padding:
              13px 9px 22px !important;
          }

        }

        /* ===================================================
           VERY SMALL MOBILE
        =================================================== */

        @media (max-width: 360px) {

          .parent-content {
            padding:
              10px 7px 18px !important;
          }

        }

        /* ===================================================
           REDUCE MOTION
        =================================================== */

        @media (prefers-reduced-motion: reduce) {

          .parent-sidebar
          .ant-menu-item {
            transition: none !important;
          }

        }

      `}</style>
    </Layout>
  );
}
