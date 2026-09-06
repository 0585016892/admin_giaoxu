import React, { useMemo } from "react";

import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Button,
  ConfigProvider,
  Tooltip,
  Drawer,
} from "antd";

import { useNavigate, useLocation } from "react-router-dom";

import {
  Home,
  Users,
  Gamepad2,
  BarChart3,
  ClipboardCheck,
  Trophy,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Bell,
  UserRound,
  GraduationCap,
  BookOpen,
  Send,
  X,
} from "lucide-react";

import imgSidebar from "../../assets/images/imgSidebar.png";
import logoWeb from "../../assets/images/logoweb.png";
import usePermission from "../../hooks/usePermission";

const { Sider } = Layout;
const { Title, Text } = Typography;

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  primary: "#FF6B8B",
  primaryDark: "#F43F6A",
  primaryLight: "#FFF0F5",
  primaryBorder: "#FBCFE8",

  purpleLight: "#F3E8FF",
  purpleBorder: "#E9D5FF",

  text: "#4A5568",
  textLight: "#718096",

  white: "#FFFFFF",

  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  dangerBorder: "#FCA5A5",

  menuHover: "#FFF0F5",

  shadow: "rgba(255, 107, 139, 0.12)",
};

/* =========================================================
   MENU PATHS
========================================================= */

const MENU_PATHS = {
  dashboard: "/catechist",

  classes: "/catechist/classes",
  myClasses: "/catechist/classes-teacher",

  students: "/catechist/students",
  myStudents: "/catechist/student-class",

  catechists: "/catechist-management",

  attendance: "/attendance",

  games: "/catechist/games",
  results: "/catechist/results",
  leaderboard: "/catechist/leaderboard",

  sendNotifications: "/catechist/notifications",
  notifications: "/catechist/my-notifications",
};

/* =========================================================
   HELPERS
========================================================= */

const isPathActive = (pathname, path) => {
  if (!pathname || !path) return false;

  if (path === MENU_PATHS.dashboard) {
    return pathname === MENU_PATHS.dashboard;
  }

  return pathname === path || pathname.startsWith(`${path}/`);
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CatechistSidebar({
  onLogout,
  collapsed = false,
  setCollapsed,

  /*
   * MOBILE STATE
   * Được quản lý ở CatechistLayout
   */
  mobileOpen = false,
  setMobileOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const { canViewClass, canViewStudents, canViewCatechists } = usePermission();

  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const permission = useMemo(
    () => ({
      canViewClass: Boolean(canViewClass),
      canViewStudents: Boolean(canViewStudents),
      canViewCatechists: Boolean(canViewCatechists),
    }),
    [canViewClass, canViewStudents, canViewCatechists],
  );

  /* =======================================================
     MENU ITEMS
  ======================================================= */

  const menuItems = useMemo(() => {
    const items = [];

    /* -------------------------------------------------------
       TỔNG QUAN
    ------------------------------------------------------- */

    items.push({
      key: MENU_PATHS.dashboard,
      label: "Tổng quan",
      icon: <Home size={18} strokeWidth={2.3} />,
    });

    /* -------------------------------------------------------
       QUẢN LÝ
    ------------------------------------------------------- */

    if (permission.canViewClass) {
      items.push({
        key: MENU_PATHS.classes,
        label: "Quản lý lớp học",
        icon: <BookOpen size={18} strokeWidth={2.3} />,
      });
    }

    items.push({
      key: MENU_PATHS.myClasses,
      label: "Lớp học của bạn",
      icon: <GraduationCap size={18} strokeWidth={2.3} />,
    });

    if (permission.canViewStudents) {
      items.push({
        key: MENU_PATHS.students,
        label: "Quản lý học sinh",
        icon: <Users size={18} strokeWidth={2.3} />,
      });
    }

    items.push({
      key: MENU_PATHS.myStudents,
      label: "Học sinh của bạn",
      icon: <UserRound size={18} strokeWidth={2.3} />,
    });

    if (permission.canViewCatechists) {
      items.push({
        key: MENU_PATHS.catechists,
        label: "Quản lý giáo lý viên",
        icon: <Sparkles size={18} strokeWidth={2.3} />,
      });
    }

    /* -------------------------------------------------------
       HỌC TẬP
    ------------------------------------------------------- */

    items.push({
      key: MENU_PATHS.attendance,
      label: "Điểm danh",
      icon: <ClipboardCheck size={18} strokeWidth={2.3} />,
    });

    items.push({
      key: MENU_PATHS.games,
      label: "Trò chơi tương tác",
      icon: <Gamepad2 size={18} strokeWidth={2.3} />,
    });

    items.push({
      key: MENU_PATHS.results,
      label: "Kết quả học tập",
      icon: <BarChart3 size={18} strokeWidth={2.3} />,
    });

    items.push({
      key: MENU_PATHS.leaderboard,
      label: "Bảng thành tích",
      icon: <Trophy size={18} strokeWidth={2.3} />,
    });

    /* -------------------------------------------------------
       THÔNG BÁO
    ------------------------------------------------------- */

    if (permission.canViewStudents) {
      items.push({
        key: MENU_PATHS.sendNotifications,
        label: "Gửi thông báo",
        icon: <Send size={18} strokeWidth={2.3} />,
      });
    }

    items.push({
      key: MENU_PATHS.notifications,
      label: "Thông báo của giáo xứ",
      icon: <Bell size={18} strokeWidth={2.3} />,
    });

    return items;
  }, [permission]);

  /* =======================================================
     ACTIVE MENU
  ======================================================= */

  const selectedKey = useMemo(() => {
    const pathname = location.pathname;

    const activeItem = menuItems
      .slice()
      .sort((a, b) => b.key.length - a.key.length)
      .find((item) => isPathActive(pathname, item.key));

    return activeItem ? [activeItem.key] : [];
  }, [location.pathname, menuItems]);

  /* =======================================================
     MOBILE CLOSE
  ======================================================= */

  const closeMobileMenu = () => {
    if (typeof setMobileOpen === "function") {
      setMobileOpen(false);
    }
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleMenuClick = ({ key }) => {
    if (!key) return;

    navigate(key);

    closeMobileMenu();
  };

  /* =======================================================
     BRAND CLICK
  ======================================================= */

  const handleBrandClick = () => {
    navigate(MENU_PATHS.dashboard);

    closeMobileMenu();
  };

  /* =======================================================
     DESKTOP COLLAPSE
  ======================================================= */

  const handleToggleCollapse = () => {
    if (typeof setCollapsed === "function") {
      setCollapsed(!collapsed);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    closeMobileMenu();

    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  /* =======================================================
     BRAND
  ======================================================= */

  const Brand = ({ compact = false }) => {
    const showInfo = !collapsed || compact;

    return (
      <div
        className={`
          sidebar-brand-card
          ${compact ? "sidebar-brand-mobile" : ""}
        `}
        onClick={handleBrandClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            handleBrandClick();
          }
        }}
      >
        <div className="avatar-star-container">
          <Avatar
            size={compact ? 46 : collapsed ? 42 : 46}
            src={logoWeb}
            className="sidebar-logo-avatar"
          />

          {!collapsed && !compact && <span className="brand-online-dot" />}
        </div>

        {showInfo && (
          <div className="sidebar-brand-info">
            <Title level={5} className="sidebar-brand-title">
              Thiếu Nhi Thánh Thể
            </Title>

            <Text className="sidebar-brand-subtitle">FaithEdu</Text>
          </div>
        )}
      </div>
    );
  };

  /* =======================================================
     MENU
  ======================================================= */

  const SidebarMenu = ({ mobile = false }) => {
    return (
      <div
        className={
          mobile
            ? "sidebar-menu-wrapper mobile-menu-wrapper"
            : "sidebar-menu-wrapper"
        }
      >
        <Menu
          mode="inline"
          inlineCollapsed={mobile ? false : collapsed}
          selectedKeys={selectedKey}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: "none",
            fontWeight: 700,
            fontSize: 13,
            background: "transparent",
            width: "100%",
          }}
        />
      </div>
    );
  };

  /* =======================================================
     FOOTER
  ======================================================= */

  const SidebarFooter = ({ mobile = false }) => {
    return (
      <div
        className={
          mobile ? "sidebar-footer mobile-sidebar-footer" : "sidebar-footer"
        }
      >
        {/* -----------------------------------------------
            DESKTOP COLLAPSE
        ----------------------------------------------- */}

        {!mobile && (
          <Tooltip title={collapsed ? "Mở rộng menu" : ""} placement="right">
            <Button
              type="text"
              onClick={handleToggleCollapse}
              icon={
                collapsed ? (
                  <PanelLeftOpen size={18} color={COLORS.primary} />
                ) : (
                  <PanelLeftClose size={18} color={COLORS.primary} />
                )
              }
              className="sidebar-collapse-btn"
            >
              {!collapsed && "Thu gọn menu"}
            </Button>
          </Tooltip>
        )}

        {/* -----------------------------------------------
            LOGOUT
        ----------------------------------------------- */}

        <Tooltip
          title={!mobile && collapsed ? "Đăng xuất" : ""}
          placement="right"
        >
          <Button
            type="text"
            icon={<LogOut size={17} strokeWidth={2.3} color={COLORS.danger} />}
            onClick={handleLogout}
            className="sidebar-logout-btn"
          >
            {mobile || !collapsed ? "Tạm biệt / Đăng xuất" : null}
          </Button>
        </Tooltip>

        {/* -----------------------------------------------
            BANNER
        ----------------------------------------------- */}

        {(!collapsed || mobile) && (
          <div className="sidebar-banner">
            <img src={imgSidebar} alt="FaithEdu" />
          </div>
        )}
      </div>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: COLORS.primary,

            borderRadius: 16,

            fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
          },

          components: {
            Menu: {
              itemBg: "transparent",

              itemColor: COLORS.text,

              itemHoverColor: COLORS.primary,

              itemHoverBg: COLORS.menuHover,

              itemSelectedColor: COLORS.white,

              itemSelectedBg: COLORS.primary,

              itemActiveBg: COLORS.primaryLight,

              itemRadius: 16,

              itemMarginInline: 8,

              itemMarginBlock: 4,

              itemPaddingInline: collapsed ? 0 : 16,

              itemHeight: 46,

              collapsedIconSize: 20,
            },
          },
        }}
      >
        {/* =================================================
            DESKTOP SIDEBAR
        ================================================= */}

        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={260}
          collapsedWidth={80}
          theme="light"
          className="chibi-sidebar desktop-sidebar"
        >
          <div className="sidebar-inner">
            {/* BRAND */}

            <Brand />

            {/* MENU */}

            <SidebarMenu />

            {/* FOOTER */}

            <SidebarFooter />
          </div>
        </Sider>

        {/* =================================================
            MOBILE DRAWER
        ================================================= */}

        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={closeMobileMenu}
          width={285}
          closable={false}
          destroyOnHidden
          className="mobile-sidebar-drawer"
          styles={{
            body: {
              padding: 0,
            },

            header: {
              display: "none",
            },
          }}
        >
          <div className="mobile-sidebar">
            {/* ---------------------------------------------
                MOBILE HEADER
            --------------------------------------------- */}

            <div className="mobile-sidebar-header">
              <Brand compact />

              <button
                type="button"
                className="mobile-close-button"
                onClick={closeMobileMenu}
                aria-label="Đóng menu"
              >
                <X size={19} />
              </button>
            </div>

            {/* ---------------------------------------------
                MOBILE MENU
            --------------------------------------------- */}

            <SidebarMenu mobile />

            {/* ---------------------------------------------
                MOBILE FOOTER
            --------------------------------------------- */}

            <SidebarFooter mobile />
          </div>
        </Drawer>
      </ConfigProvider>

      {/* ===================================================
          CSS
      =================================================== */}

      <style>
        {`
          @import url(
            'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap'
          );

          /* =================================================
             DESKTOP SIDEBAR
          ================================================= */

          .chibi-sidebar {
            font-family:
              'Quicksand',
              'Be Vietnam Pro',
              sans-serif;

            height: 100vh !important;

            position: sticky !important;

            top: 0 !important;

            left: 0 !important;

            background:
              rgba(
                255,
                255,
                255,
                0.98
              ) !important;

            border-right:
              2px solid
              ${COLORS.primaryLight} !important;

            box-shadow:
              6px 0 24px
              rgba(
                255,
                133,
                161,
                0.08
              ) !important;

            z-index: 99;

            transition:
              all .3s
              cubic-bezier(
                .34,
                1.56,
                .64,
                1
              );
          }

          .sidebar-inner {
            height: 100%;

            display: flex;

            flex-direction: column;

            padding:
              ${collapsed ? "14px 8px" : "14px 10px"};

            overflow: hidden;
          }

          /* =================================================
             BRAND
          ================================================= */

          .sidebar-brand-card {
            display: flex;

            align-items: center;

            justify-content:
              ${collapsed ? "center" : "flex-start"};

            gap: 12px;

            padding:
              ${collapsed ? "8px 0" : "10px 12px"};

            margin-bottom: 12px;

            border-radius: 20px;

            background:
              ${
                collapsed
                  ? "transparent"
                  : "linear-gradient(135deg,#FFF0F5 0%,#F3E8FF 100%)"
              };

            border:
              ${collapsed ? "none" : `1.5px solid ${COLORS.primaryBorder}`};

            cursor: pointer;

            transition:
              all .25s ease;

            flex-shrink: 0;
          }

          .sidebar-brand-card:hover {
            transform:
              translateY(-1px);

            box-shadow:
              0 6px 16px
              rgba(
                255,
                107,
                139,
                0.15
              );
          }

          .avatar-star-container {
            position: relative;

            flex-shrink: 0;
          }

          .sidebar-logo-avatar {
            background-color:
              #FFD6E0 !important;

            border:
              2px solid
              #FF85A1 !important;

            box-shadow:
              0 4px 12px
              rgba(
                255,
                107,
                139,
                0.25
              );
          }

          .brand-online-dot {
            position: absolute;

            right: -3px;

            bottom: -2px;

            width: 14px;

            height: 14px;

            border-radius: 50%;

            background:
              #FFE4EC;

            border:
              2px solid
              #FFFFFF;

            box-shadow:
              0 2px 6px
              rgba(
                0,
                0,
                0,
                .08
              );
          }

          .sidebar-brand-info {
            min-width: 0;

            overflow: hidden;
          }

          .sidebar-brand-title {
            margin: 0 !important;

            color:
              #4A4E69 !important;

            font-weight:
              700 !important;

            line-height:
              1.3 !important;

            font-size:
              13.5px !important;

            white-space:
              nowrap;

            overflow:
              hidden;

            text-overflow:
              ellipsis;
          }

          .sidebar-brand-subtitle {
            display: block;

            margin-top: 2px;

            color:
              ${COLORS.textLight} !important;

            font-size:
              10.5px !important;

            font-weight:
              600 !important;

            white-space:
              nowrap;
          }

          /* =================================================
             MENU WRAPPER
          ================================================= */

          .sidebar-menu-wrapper {
            flex: 1;

            min-height: 0;

            overflow-y: auto;

            overflow-x: hidden;

            padding-right: 2px;
          }

          .sidebar-menu-wrapper::-webkit-scrollbar {
            width: 4px;
          }

          .sidebar-menu-wrapper::-webkit-scrollbar-track {
            background:
              transparent;
          }

          .sidebar-menu-wrapper::-webkit-scrollbar-thumb {
            background:
              #FBCFE8;

            border-radius:
              10px;
          }

          .sidebar-menu-wrapper::-webkit-scrollbar-thumb:hover {
            background:
              #F9A8D4;
          }

          /* =================================================
             MENU
          ================================================= */

          .chibi-sidebar .ant-menu,
          .mobile-sidebar .ant-menu {
            background:
              transparent !important;
          }

          .chibi-sidebar
          .ant-menu-item,
          .mobile-sidebar
          .ant-menu-item {
            transition:
              all .2s ease !important;
          }

          .chibi-sidebar
          .ant-menu-item:hover,
          .mobile-sidebar
          .ant-menu-item:hover {
            transform:
              translateX(2px);
          }

          .chibi-sidebar
          .ant-menu-item-selected,
          .mobile-sidebar
          .ant-menu-item-selected {
            box-shadow:
              0 6px 16px
              rgba(
                255,
                107,
                139,
                0.35
              ) !important;
          }

          .chibi-sidebar
          .ant-menu-item-selected
          .ant-menu-item-icon,
          .mobile-sidebar
          .ant-menu-item-selected
          .ant-menu-item-icon {
            color:
              #FFFFFF !important;
          }

          .chibi-sidebar
          .ant-menu-item
          .ant-menu-item-icon,
          .mobile-sidebar
          .ant-menu-item
          .ant-menu-item-icon {
            display:
              inline-flex;

            align-items:
              center;

            justify-content:
              center;
          }

          .chibi-sidebar
          .ant-menu-inline-collapsed
          > .ant-menu-item {
            padding-inline:
              0 !important;

            display:
              flex;

            align-items:
              center;

            justify-content:
              center;
          }

          .chibi-sidebar
          .ant-menu-inline-collapsed
          > .ant-menu-item
          .ant-menu-item-icon {
            margin-inline-end:
              0 !important;
          }

          /* =================================================
             FOOTER
          ================================================= */

          .sidebar-footer {
            flex-shrink: 0;

            margin-top: 12px;
          }

          .sidebar-collapse-btn,
          .sidebar-logout-btn {
            height:
              42px !important;

            width:
              100% !important;

            border-radius:
              16px !important;

            font-weight:
              700 !important;

            font-size:
              13px !important;

            display:
              flex !important;

            align-items:
              center !important;

            transition:
              all .2s ease !important;
          }

          .sidebar-collapse-btn {
            justify-content:
              ${collapsed ? "center" : "flex-start"};

            padding:
              ${collapsed ? "0" : "0 16px"} !important;

            color:
              ${COLORS.text} !important;

            background:
              #FAF5FF !important;

            border:
              1.5px solid
              ${COLORS.purpleBorder} !important;

            margin-bottom:
              6px;
          }

          .sidebar-logout-btn {
            justify-content:
              ${collapsed ? "center" : "flex-start"};

            padding:
              ${collapsed ? "0" : "0 16px"} !important;

            color:
              ${COLORS.danger} !important;

            background:
              ${COLORS.dangerLight} !important;

            border:
              1.5px solid
              ${COLORS.dangerBorder} !important;
          }

          .sidebar-collapse-btn:hover,
          .sidebar-logout-btn:hover {
            transform:
              translateY(-1px);
          }

          /* =================================================
             BANNER
          ================================================= */

          .sidebar-banner {
            margin-top:
              12px;

            border-radius:
              18px;

            overflow:
              hidden;

            width:
              100%;

            background:
              linear-gradient(
                135deg,
                #FFF0F5 0%,
                #F3E8FF 100%
              );

            border:
              1.5px solid
              ${COLORS.primaryBorder};

            padding:
              8px;

            text-align:
              center;

            transition:
              all .25s ease;
          }

          .sidebar-banner:hover {
            transform:
              translateY(-1px);

            box-shadow:
              0 6px 16px
              rgba(
                255,
                107,
                139,
                0.12
              );
          }

          .sidebar-banner img {
            width:
              100%;

            height:
              auto;

            max-height:
              100px;

            object-fit:
              contain;

            display:
              block;

            border-radius:
              12px;
          }

          /* =================================================
             MOBILE DRAWER
          ================================================= */

          .mobile-sidebar-drawer
          .ant-drawer-content {
            background:
              rgba(
                255,
                255,
                255,
                .98
              ) !important;
          }

          .mobile-sidebar-drawer
          .ant-drawer-body {
            padding:
              0 !important;
          }

          .mobile-sidebar {
            height:
              100%;

            display:
              flex;

            flex-direction:
              column;

            padding:
              14px 12px 16px;

            background:
              linear-gradient(
                180deg,
                #FFFFFF 0%,
                #FFFBFD 100%
              );
          }

          /* =================================================
             MOBILE HEADER
          ================================================= */

          .mobile-sidebar-header {
            display:
              flex;

            align-items:
              center;

            justify-content:
              space-between;

            gap:
              10px;

            margin-bottom:
              8px;
          }

          .mobile-sidebar-header
          .sidebar-brand-card {
            flex:
              1;

            margin:
              0;

            padding:
              8px 10px;

            background:
              linear-gradient(
                135deg,
                #FFF0F5 0%,
                #F3E8FF 100%
              );

            border:
              1.5px solid
              ${COLORS.primaryBorder};

            justify-content:
              flex-start;
          }

          .sidebar-brand-mobile
          .sidebar-brand-title {
            font-size:
              13px !important;
          }

          .mobile-close-button {
            width:
              38px;

            height:
              38px;

            flex-shrink:
              0;

            display:
              flex;

            align-items:
              center;

            justify-content:
              center;

            border-radius:
              12px;

            border:
              1px solid
              #FBCFE8;

            background:
              #FFF0F5;

            color:
              ${COLORS.primary};

            cursor:
              pointer;

            transition:
              all .2s ease;
          }

          .mobile-close-button:hover {
            background:
              ${COLORS.primary};

            color:
              #FFFFFF;
          }

          /* =================================================
             MOBILE MENU
          ================================================= */

          .mobile-menu-wrapper {
            padding-top:
              4px;
          }

          .mobile-menu-wrapper
          .ant-menu-item {
            height:
              48px !important;

            line-height:
              48px !important;

            margin:
              4px 0 !important;

            padding-inline:
              16px !important;

            border-radius:
              14px !important;
          }

          /* =================================================
             MOBILE FOOTER
          ================================================= */

          .mobile-sidebar-footer {
            margin-top:
              12px;

            padding-top:
              12px;

            border-top:
              1px solid
              rgba(
                255,
                107,
                139,
                .12
              );
          }

          .mobile-sidebar-footer
          .sidebar-logout-btn {
            justify-content:
              flex-start;

            padding:
              0 16px !important;
          }

          /* =================================================
             HIDE DESKTOP / MOBILE
          ================================================= */

          @media (max-width: 767px) {
            .desktop-sidebar {
              display:
                none !important;
            }
          }

          @media (min-width: 768px) {
            .mobile-sidebar-drawer {
              display:
                none !important;
            }
          }

          /* =================================================
             SMALL MOBILE
          ================================================= */

          @media (max-width: 380px) {
            .mobile-sidebar-drawer
            .ant-drawer-content-wrapper {
              width:
                275px !important;
            }

            .mobile-sidebar {
              padding:
                12px 10px 14px;
            }

            .mobile-menu-wrapper
            .ant-menu-item {
              height:
                46px !important;

              line-height:
                46px !important;
            }
          }
        `}
      </style>
    </>
  );
}
