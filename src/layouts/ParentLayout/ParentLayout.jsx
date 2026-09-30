import React, { useMemo, useState, useCallback, useEffect } from "react";

import { Layout, Drawer, Grid } from "antd";

import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useUser } from "../../context/UserContext";

import ParentSidebar, { MENU_ITEMS } from "./ParentSidebar";

import ParentHeader from "./ParentHeader";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

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
   LAYOUT CONFIG
========================================================= */

const SIDEBAR_WIDTH = 268;
const SIDEBAR_WIDTH_TABLET = 244;

const HEADER_HEIGHT = 76;
const HEADER_HEIGHT_MOBILE = 66;

/* =========================================================
   CSS
========================================================= */

const LAYOUT_CSS = `
.parent-layout,
.parent-layout *,
.parent-mobile-drawer,
.parent-mobile-drawer * {
  box-sizing: border-box;
}

.parent-layout {
  --layout-navy: ${COLORS.navy};
  --layout-gold: ${COLORS.gold};
  --layout-background: ${COLORS.background};
  --layout-white: ${COLORS.white};
  --layout-text: ${COLORS.text};
  --layout-secondary: ${COLORS.textSecondary};
  --layout-border: ${COLORS.border};

  --sidebar-width: ${SIDEBAR_WIDTH}px;
  --header-height: ${HEADER_HEIGHT}px;

  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;

  background: var(--layout-background);
  color: var(--layout-text);

  font-family:
    "Be Vietnam Pro",
    Inter,
    "Segoe UI",
    Arial,
    sans-serif;

  overflow-x: clip;
}

/* =========================================================
   DESKTOP SIDEBAR
========================================================= */

.parent-layout__sider {
  position: fixed !important;
  inset: 0 auto 0 0;
  z-index: 100;

  width: var(--sidebar-width) !important;
  min-width: var(--sidebar-width) !important;
  max-width: var(--sidebar-width) !important;

  height: 100vh;
  height: 100dvh;

  overflow: hidden;

  background: var(--layout-white) !important;
  border-right: 1px solid var(--layout-border);
}

.parent-layout__sider .ant-layout-sider-children {
  width: 100%;
  height: 100%;
  overflow: hidden;

  background: var(--layout-white) !important;
}

/* ParentSidebar fills the Sider */

.parent-layout__sider .parent-sidebar {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  flex: 1 1 auto;
  border-right: none;
}

/* =========================================================
   MAIN LAYOUT
========================================================= */

.parent-layout__main {
  min-width: 0;
  min-height: 100vh;
  min-height: 100dvh;

  margin-left: var(--sidebar-width);

  background: var(--layout-background);
}

/* =========================================================
   HEADER
========================================================= */

.parent-layout__header {
  position: sticky;
  top: 0;
  z-index: 90;

  width: 100%;
  height: var(--header-height);
  min-width: 0;

  background: var(--layout-white);
}

.parent-layout__header > .parent-header {
  position: relative;
  top: auto;

  width: 100%;
  height: var(--header-height) !important;
  min-width: 0;
}

/* =========================================================
   PAGE CONTENT
========================================================= */

.parent-layout__content {
  min-width: 0;
  min-height: calc(100vh - var(--header-height));

  padding: 28px 32px 44px;

  background: var(--layout-background);
}

.parent-layout__content-inner {
  width: 100%;
  max-width: 1560px;
  min-width: 0;

  margin: 0 auto;
}

/* Prevent child pages from stretching the entire layout */

.parent-layout__content-inner > * {
  min-width: 0;
  max-width: 100%;
}

/* =========================================================
   MOBILE DRAWER
========================================================= */

.parent-mobile-drawer .ant-drawer-content {
  background: var(--layout-white);
}

.parent-mobile-drawer .ant-drawer-mask {
  background: rgba(15, 44, 72, 0.4) !important;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.parent-mobile-drawer .ant-drawer-content-wrapper {
  max-width: 88vw;
  box-shadow: 12px 0 40px rgba(15, 44, 72, 0.16);
}

.parent-mobile-drawer .ant-drawer-body {
  padding: 0 !important;
  overflow-x: hidden;
  overflow-y: auto;
}

.parent-mobile-drawer .parent-sidebar {
  width: 100% !important;
  height: auto !important;
  min-height: 100% !important;
  border-right: none;
}

/* =========================================================
   TABLET
========================================================= */

@media (min-width: 768px) and (max-width: 1100px) {
  .parent-layout {
    --sidebar-width: ${SIDEBAR_WIDTH_TABLET}px;
  }

  .parent-layout__content {
    padding: 24px 22px 36px;
  }
}

@media (min-width: 1101px) and (max-width: 1399px) {
  .parent-layout__content {
    padding: 24px 26px 36px;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 767px) {
  .parent-layout {
    --header-height: ${HEADER_HEIGHT_MOBILE}px;
  }

  .parent-layout__main {
    width: 100%;
    margin-left: 0;
  }

  .parent-layout__header {
    width: 100%;
  }

  .parent-layout__content {
    min-height: calc(100vh - var(--header-height));
    padding: 16px 12px 28px;
  }

  .parent-layout__content-inner {
    max-width: 100%;
  }
}

@media (max-width: 420px) {
  .parent-layout__content {
    padding: 14px 10px 24px;
  }
}

/* =========================================================
   ACCESSIBILITY
========================================================= */

@media (prefers-reduced-motion: reduce) {
  .parent-layout *,
  .parent-mobile-drawer * {
    scroll-behavior: auto !important;
    transition: none !important;
  }
}
`;

/* =========================================================
   COMPONENT
========================================================= */

export default function ParentLayout() {
  const { user, logout } = useUser();

  const navigate = useNavigate();
  const location = useLocation();

  const screens = useBreakpoint();

  // Khi breakpoint chưa được xác định,
  // tạm thời hiển thị desktop để tránh layout nhảy.
  const isMobile = screens.md === false;

  const [drawerOpen, setDrawerOpen] = useState(false);

  /* =======================================================
     ACTIVE MENU
  ======================================================= */

  const selectedKey = useMemo(() => {
    const pathname = location.pathname || "/parent";

    if (pathname === "/parent" || pathname === "/parent/") {
      return "/parent";
    }

    const matchedItem = MENU_ITEMS.filter((item) => item.key !== "/parent")
      .sort((a, b) => b.key.length - a.key.length)
      .find((item) => {
        return pathname === item.key || pathname.startsWith(`${item.key}/`);
      });

    return matchedItem?.key || "/parent";
  }, [location.pathname]);

  /* =======================================================
     CLOSE DRAWER WHEN ROUTE CHANGES
  ======================================================= */

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  /* =======================================================
     NAVIGATION HANDLERS
  ======================================================= */

  const handleMenuClick = useCallback(
    ({ key }) => {
      navigate(key);
      setDrawerOpen(false);
    },
    [navigate],
  );

  const handleMenuOpen = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleProfile = useCallback(() => {
    navigate("/parent/profile");
    setDrawerOpen(false);
  }, [navigate]);

  const handleNotifications = useCallback(() => {
    navigate("/parent/notifications");
    setDrawerOpen(false);
  }, [navigate]);

  const handleContact = useCallback(() => {
    navigate("/parent/contact");
    setDrawerOpen(false);
  }, [navigate]);

  /* =======================================================
     LOGOUT
  ======================================================= */

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

  /* =======================================================
     AUTHORIZATION
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
     SIDEBAR
  ======================================================= */

  const sidebar = (
    <ParentSidebar
      user={user}
      selectedKey={selectedKey}
      onMenuClick={handleMenuClick}
      onContactClick={handleContact}
    />
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>{LAYOUT_CSS}</style>

      <Layout className="parent-layout">
        {/* DESKTOP SIDEBAR */}

        {!isMobile && (
          <Sider
            width={SIDEBAR_WIDTH}
            theme="light"
            trigger={null}
            className="parent-layout__sider"
          >
            {sidebar}
          </Sider>
        )}

        {/* MOBILE DRAWER */}

        {isMobile && (
          <Drawer
            placement="left"
            open={drawerOpen}
            onClose={handleDrawerClose}
            width={296}
            closable={false}
            destroyOnHidden
            rootClassName="parent-mobile-drawer"
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
            {sidebar}
          </Drawer>
        )}

        {/* MAIN CONTENT */}

        <Layout className="parent-layout__main">
          <div className="parent-layout__header">
            <ParentHeader
              user={user}
              isMobile={isMobile}
              onMenuOpen={handleMenuOpen}
              onProfile={handleProfile}
              onLogout={handleLogout}
              onNotifications={handleNotifications}
            />
          </div>

          <Content className="parent-layout__content">
            <main className="parent-layout__content-inner">
              <Outlet />
            </main>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
