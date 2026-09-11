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
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Bell,
  UserRound,
  GraduationCap,
  BookOpen,
  Send,
  X,
  Layers,
} from "lucide-react";

import imgSidebar from "../../assets/images/logosidebar.png";
import logoWeb from "../../assets/images/logoweb.png";
import usePermission from "../../hooks/usePermission";

const { Sider } = Layout;
const { Title, Text } = Typography;

/* =========================================================
   FAITHEDU DESIGN SYSTEM
========================================================= */

const COLORS = {
  /* Brand */
  navy: "#173B5E",
  navyDark: "#102E49",
  navyHover: "#244F78",
  navyLight: "#EEF4F8",

  /* Accent */
  gold: "#D9A441",
  goldDark: "#B9872D",
  goldLight: "#FFF7E5",

  /* Text */
  textDark: "#172B3A",
  text: "#526273",
  textMuted: "#8A97A6",

  /* Surface */
  white: "#FFFFFF",
  background: "#F7F9FC",

  /* Border */
  border: "#E4EAF0",

  /* State */
  success: "#2E8B68",

  /* Shadow */
  shadow: "0 8px 28px rgba(23, 59, 94, 0.08)",
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
  statistics: "/catechist/statistics",
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
   MAIN COMPONENT
========================================================= */

export default function CatechistSidebar({
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const { canViewClass, canViewStudents, canViewCatechists } = usePermission();

  const permission = useMemo(
    () => ({
      canViewClass: Boolean(canViewClass),
      canViewStudents: Boolean(canViewStudents),
      canViewCatechists: Boolean(canViewCatechists),
    }),
    [canViewClass, canViewStudents, canViewCatechists],
  );

  /* =========================================================
     MENU ITEMS
  ========================================================= */

  const menuItems = useMemo(() => {
    const items = [];

    /* -------------------------------------------------------
       TỔNG QUAN
    ------------------------------------------------------- */

    items.push({
      key: MENU_PATHS.dashboard,
      label: "Tổng quan",
      icon: <Home size={18} strokeWidth={2.2} />,
    });

    /* -------------------------------------------------------
       QUẢN LÝ LỚP HỌC
    ------------------------------------------------------- */

    const classChildren = [];

    if (permission.canViewClass) {
      classChildren.push({
        key: MENU_PATHS.classes,
        label: "Tất cả lớp học",
        icon: <BookOpen size={16} strokeWidth={2.2} />,
      });
    }

    classChildren.push({
      key: MENU_PATHS.myClasses,
      label: "Lớp của tôi",
      icon: <GraduationCap size={16} strokeWidth={2.2} />,
    });

    items.push({
      key: "group-classes",
      label: "Quản lý lớp học",
      icon: <GraduationCap size={18} strokeWidth={2.2} />,
      children: classChildren,
    });

    /* -------------------------------------------------------
       QUẢN LÝ HỌC SINH
    ------------------------------------------------------- */

    const studentChildren = [];

    if (permission.canViewStudents) {
      studentChildren.push({
        key: MENU_PATHS.students,
        label: "Tất cả học sinh",
        icon: <Users size={16} strokeWidth={2.2} />,
      });
    }

    studentChildren.push({
      key: MENU_PATHS.myStudents,
      label: "Học sinh của tôi",
      icon: <UserRound size={16} strokeWidth={2.2} />,
    });

    items.push({
      key: "group-students",
      label: "Quản lý học sinh",
      icon: <Users size={18} strokeWidth={2.2} />,
      children: studentChildren,
    });

    /* -------------------------------------------------------
       GIÁO LÝ VIÊN
    ------------------------------------------------------- */

    if (permission.canViewCatechists) {
      items.push({
        key: MENU_PATHS.catechists,
        label: "Quản lý giáo lý viên",
        icon: <Sparkles size={18} strokeWidth={2.2} />,
      });
    }

    /* -------------------------------------------------------
       ĐIỂM DANH
    ------------------------------------------------------- */

    items.push({
      key: MENU_PATHS.attendance,
      label: "Điểm danh",
      icon: <ClipboardCheck size={18} strokeWidth={2.2} />,
    });
    if (permission.canViewCatechists) {
      items.push({
        key: MENU_PATHS.statistics,
        label: "Báo cáo giáo lý",
        icon: <BarChart3 size={18} strokeWidth={2.2} />,
      });
    }

    /* -------------------------------------------------------
       HỌC TẬP & TRÒ CHƠI
    ------------------------------------------------------- */

    items.push({
      key: "group-learning",
      label: "Học tập & trò chơi",
      icon: <Layers size={18} strokeWidth={2.2} />,
      children: [
        {
          key: MENU_PATHS.games,
          label: "Trò chơi tương tác",
          icon: <Gamepad2 size={16} strokeWidth={2.2} />,
        },
        {
          key: MENU_PATHS.results,
          label: "Kết quả học tập",
          icon: <BarChart3 size={16} strokeWidth={2.2} />,
        },
        {
          key: MENU_PATHS.leaderboard,
          label: "Bảng thành tích",
          icon: <Trophy size={16} strokeWidth={2.2} />,
        },
      ],
    });

    /* -------------------------------------------------------
       THÔNG BÁO
    ------------------------------------------------------- */

    const notificationChildren = [];

    if (permission.canViewStudents) {
      notificationChildren.push({
        key: MENU_PATHS.sendNotifications,
        label: "Gửi thông báo",
        icon: <Send size={16} strokeWidth={2.2} />,
      });
    }

    notificationChildren.push({
      key: MENU_PATHS.notifications,
      label: "Thông báo giáo xứ",
      icon: <Bell size={16} strokeWidth={2.2} />,
    });

    items.push({
      key: "group-notifications",
      label: "Thông báo",
      icon: <Bell size={18} strokeWidth={2.2} />,
      children: notificationChildren,
    });

    return items;
  }, [permission]);

  /* =========================================================
     ACTIVE MENU
  ========================================================= */

  const { selectedKeys, openKeys } = useMemo(() => {
    const pathname = location.pathname;

    let foundKey = "";
    let foundOpenKey = "";

    menuItems.forEach((item) => {
      if (item.children) {
        item.children.forEach((sub) => {
          if (isPathActive(pathname, sub.key)) {
            foundKey = sub.key;
            foundOpenKey = item.key;
          }
        });
      } else if (isPathActive(pathname, item.key)) {
        foundKey = item.key;
      }
    });

    return {
      selectedKeys: foundKey ? [foundKey] : [],

      openKeys: foundOpenKey ? [foundOpenKey] : [],
    };
  }, [location.pathname, menuItems]);

  /* =========================================================
     ACTIONS
  ========================================================= */

  const closeMobileMenu = () => {
    if (typeof setMobileOpen === "function") {
      setMobileOpen(false);
    }
  };

  const handleMenuClick = ({ key }) => {
    if (!key || key.startsWith("group-")) {
      return;
    }

    navigate(key);

    closeMobileMenu();
  };

  const handleBrandClick = () => {
    navigate(MENU_PATHS.dashboard);

    closeMobileMenu();
  };

  const handleToggleCollapse = () => {
    if (typeof setCollapsed === "function") {
      setCollapsed(!collapsed);
    }
  };

  /* =========================================================
     BRAND
  ========================================================= */

  const Brand = ({ compact = false }) => {
    const showInfo = !collapsed || compact;

    return (
      <div
        className={`
          faith-sidebar-brand
          ${compact ? "compact" : ""}
          ${collapsed ? "collapsed" : ""}
        `}
        onClick={handleBrandClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleBrandClick();
          }
        }}
      >
        <div className="faith-brand-logo-wrap">
          <Avatar
            size={compact ? 44 : collapsed ? 40 : 44}
            src={logoWeb}
            className="faith-brand-logo"
          />

          {!collapsed && !compact && <span className="faith-status-dot" />}
        </div>

        {showInfo && (
          <div className="faith-brand-info">
            <Title level={5} className="faith-brand-title">
              TNTT FaithEdu
            </Title>

            <Text className="faith-brand-subtitle">Cổng Giáo Lý Viên</Text>
          </div>
        )}
      </div>
    );
  };

  /* =========================================================
     MENU
  ========================================================= */

  const SidebarMenu = ({ mobile = false }) => (
    <div
      className={`
        faith-sidebar-menu
        ${mobile ? "mobile" : ""}
      `}
    >
      <Menu
        mode="inline"
        inlineCollapsed={mobile ? false : collapsed}
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </div>
  );

  /* =========================================================
     FOOTER
  ========================================================= */

  const SidebarFooter = ({ mobile = false }) => (
    <div
      className={`
        faith-sidebar-footer
        ${mobile ? "mobile" : ""}
      `}
    >
      {!mobile && (
        <Tooltip title={collapsed ? "Mở rộng menu" : ""} placement="right">
          <Button
            type="text"
            onClick={handleToggleCollapse}
            icon={
              collapsed ? (
                <PanelLeftOpen size={19} />
              ) : (
                <PanelLeftClose size={19} />
              )
            }
            className={`
              faith-collapse-btn
              ${collapsed ? "collapsed" : ""}
            `}
          >
            {!collapsed && <span>Thu gọn</span>}
          </Button>
        </Tooltip>
      )}

      {(!collapsed || mobile) && (
        <div className="faith-sidebar-banner">
          <img src={imgSidebar} alt="FaithEdu Illustration" />
        </div>
      )}
    </div>
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: COLORS.navy,

            borderRadius: 10,

            fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
          },

          components: {
            Menu: {
              itemBg: "transparent",

              itemColor: "#D6E0E9",

              itemHoverColor: "#FFFFFF",

              itemHoverBg: COLORS.navyHover,

              itemSelectedColor: "#FFFFFF",

              itemSelectedBg: COLORS.navyHover,

              itemBorderRadius: 10,

              itemMarginInline: 6,

              itemMarginBlock: 3,

              itemHeight: 43,

              subMenuItemBg: "transparent",

              activeBarWidth: 0,
            },
          },
        }}
      >
        {/* ===================================================
            DESKTOP SIDEBAR
        =================================================== */}

        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={260}
          collapsedWidth={78}
          theme="dark"
          className="faith-custom-sidebar desktop-sidebar"
        >
          <div className="faith-sidebar-inner">
            {/* BRAND */}

            <Brand />

            {/* SECTION LABEL */}

            {!collapsed && (
              <div className="faith-sidebar-section-label">MENU CHÍNH</div>
            )}

            {/* MENU */}

            <SidebarMenu />

            {/* FOOTER */}

            <SidebarFooter />
          </div>
        </Sider>

        {/* ===================================================
            MOBILE DRAWER
        =================================================== */}

        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={closeMobileMenu}
          width={285}
          closable={false}
          destroyOnHidden
          className="faith-mobile-sidebar-drawer"
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          <div className="faith-mobile-sidebar">
            <div className="faith-mobile-header">
              <Brand compact />

              <button
                type="button"
                className="faith-close-drawer"
                onClick={closeMobileMenu}
                aria-label="Đóng menu"
              >
                <X size={19} />
              </button>
            </div>

            <div className="faith-sidebar-section-label mobile-label">
              MENU CHÍNH
            </div>

            <SidebarMenu mobile />

            <SidebarFooter mobile />
          </div>
        </Drawer>
      </ConfigProvider>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        @import url(
          'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap'
        );


        /* =====================================================
           SIDEBAR
        ===================================================== */

        .faith-custom-sidebar {

          font-family:
            'Quicksand',
            'Be Vietnam Pro',
            sans-serif;

          height:
            100vh !important;

          position:
            sticky !important;

          top:
            0 !important;

          left:
            0 !important;

          background:
            ${COLORS.navy} !important;

          border-right:
            1px solid
            rgba(255,255,255,0.06)
            !important;

          box-shadow:
            4px 0 24px
            rgba(16, 46, 73, 0.08)
            !important;

          z-index:
            99;

          transition:
            width 0.25s ease;
        }


        .faith-sidebar-inner {

          height:
            100%;

          display:
            flex;

          flex-direction:
            column;

          padding:
            16px 10px;

          overflow:
            hidden;

          background:
            ${COLORS.navy};
        }


        /* =====================================================
           BRAND
        ===================================================== */

        .faith-sidebar-brand {

          display:
            flex;

          align-items:
            center;

          gap:
            11px;

          padding:
            10px 11px;

          margin-bottom:
            12px;

          border-radius:
            13px;

          background:
            rgba(255,255,255,0.07);

          border:
            1px solid
            rgba(255,255,255,0.09);

          cursor:
            pointer;

          user-select:
            none;

          flex-shrink:
            0;

          transition:
            all 0.2s ease;
        }


        .faith-sidebar-brand:hover {

          background:
            rgba(255,255,255,0.11);

          border-color:
            rgba(217,164,65,0.35);
        }


        .faith-sidebar-brand.collapsed {

          justify-content:
            center;

          padding:
            8px 0;

          background:
            transparent;

          border:
            none;
        }


        .faith-brand-logo-wrap {

          position:
            relative;

          flex-shrink:
            0;
        }


        .faith-brand-logo {

          background:
            #FFFFFF !important;

          border:
            2px solid
            rgba(217,164,65,0.9)
            !important;

          box-shadow:
            0 3px 10px
            rgba(0,0,0,0.14);
        }


        .faith-status-dot {

          position:
            absolute;

          right:
            -1px;

          bottom:
            -1px;

          width:
            11px;

          height:
            11px;

          border-radius:
            50%;

          background:
            ${COLORS.success};

          border:
            2px solid
            ${COLORS.navy};
        }


        .faith-brand-info {

          min-width:
            0;

          overflow:
            hidden;
        }


        .faith-brand-title {

          margin:
            0 !important;

          color:
            #FFFFFF !important;

          font-weight:
            800 !important;

          font-size:
            14px !important;

          line-height:
            1.2 !important;

          white-space:
            nowrap;
        }


        .faith-brand-subtitle {

          display:
            block;

          margin-top:
            3px;

          color:
            #B9C7D4 !important;

          font-size:
            10.5px !important;

          font-weight:
            600 !important;

          white-space:
            nowrap;
        }


        /* =====================================================
           SECTION LABEL
        ===================================================== */

        .faith-sidebar-section-label {

          padding:
            4px 13px 7px;

          color:
            #8195A8;

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            0.08em;

          text-transform:
            uppercase;

          flex-shrink:
            0;
        }


        .faith-sidebar-section-label.mobile-label {

          padding:
            4px 10px 8px;
        }


        /* =====================================================
           MENU
        ===================================================== */

        .faith-sidebar-menu {

          flex:
            1;

          min-height:
            0;

          overflow-y:
            auto;

          overflow-x:
            hidden;

          padding:
            0 1px;
        }


        .faith-sidebar-menu::-webkit-scrollbar {

          width:
            4px;
        }


        .faith-sidebar-menu::-webkit-scrollbar-track {

          background:
            transparent;
        }


        .faith-sidebar-menu::-webkit-scrollbar-thumb {

          background:
            rgba(255,255,255,0.16);

          border-radius:
            999px;
        }


        .faith-custom-sidebar
        .ant-menu {

          background:
            transparent !important;

          border:
            none !important;

          font-family:
            'Quicksand',
            sans-serif;
        }


        .faith-custom-sidebar
        .ant-menu-item,
        .faith-custom-sidebar
        .ant-menu-submenu-title {

          font-size:
            13px !important;

          font-weight:
            600 !important;

          color:
            #D6E0E9 !important;

          margin:
            3px 0 !important;

          width:
            calc(100% - 4px);

          transition:
            all 0.18s ease !important;
        }


        .faith-custom-sidebar
        .ant-menu-item:hover,
        .faith-custom-sidebar
        .ant-menu-submenu-title:hover {

          color:
            #FFFFFF !important;

          background:
            ${COLORS.navyHover}
            !important;

          transform:
            translateX(1px);
        }


        .faith-custom-sidebar
        .ant-menu-item-selected {

          color:
            #FFFFFF !important;

          background:
            ${COLORS.navyHover}
            !important;

          box-shadow:
            inset 3px 0 0
            ${COLORS.gold},

            0 4px 12px
            rgba(0,0,0,0.12)
            !important;
        }


        .faith-custom-sidebar
        .ant-menu-item-selected
        .ant-menu-item-icon {

          color:
            ${COLORS.gold} !important;
        }


        .faith-custom-sidebar
        .ant-menu-item
        .ant-menu-item-icon,
        .faith-custom-sidebar
        .ant-menu-submenu-title
        .ant-menu-item-icon {

          color:
            #AFC0CF !important;

          min-width:
            22px !important;
        }


        .faith-custom-sidebar
        .ant-menu-item-selected
        .ant-menu-item-icon,
        .faith-custom-sidebar
        .ant-menu-submenu-selected
        > .ant-menu-submenu-title
        .ant-menu-item-icon {

          color:
            ${COLORS.gold} !important;
        }


        /* =====================================================
           SUB MENU
        ===================================================== */

        .faith-custom-sidebar
        .ant-menu-sub {

          background:
            rgba(0,0,0,0.10)
            !important;

          border-radius:
            8px;

          margin:
            2px 3px 5px;

          padding:
            2px 0;
        }


        .faith-custom-sidebar
        .ant-menu-sub
        .ant-menu-item {

          height:
            39px !important;

          line-height:
            39px !important;

          font-size:
            12.5px !important;

          color:
            #B8C8D6 !important;

          margin:
            2px 0 !important;

          width:
            100% !important;

          padding-left:
            43px !important;
        }


        .faith-custom-sidebar
        .ant-menu-sub
        .ant-menu-item:hover {

          color:
            #FFFFFF !important;

          background:
            rgba(255,255,255,0.07)
            !important;
        }


        .faith-custom-sidebar
        .ant-menu-sub
        .ant-menu-item-selected {

          color:
            #FFFFFF !important;

          background:
            rgba(217,164,65,0.14)
            !important;

          box-shadow:
            inset 2px 0 0
            ${COLORS.gold}
            !important;
        }


        /* =====================================================
           ARROW
        ===================================================== */

        .faith-custom-sidebar
        .ant-menu-submenu-arrow {

          color:
            #8EA2B4 !important;
        }


        .faith-custom-sidebar
        .ant-menu-submenu-open
        > .ant-menu-submenu-title
        .ant-menu-submenu-arrow {

          color:
            ${COLORS.gold} !important;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .faith-sidebar-footer {

          flex-shrink:
            0;

          margin-top:
            10px;

          display:
            flex;

          flex-direction:
            column;

          gap:
            9px;
        }


        /* =====================================================
           COLLAPSE BUTTON
        ===================================================== */

        .faith-collapse-btn {

          height:
            40px !important;

          width:
            100% !important;

          border-radius:
            9px !important;

          display:
            flex !important;

          align-items:
            center !important;

          justify-content:
            ${collapsed ? "center" : "flex-start"} !important;

          gap:
            8px;

          padding:
            ${collapsed ? "0" : "0 12px"} !important;

          color:
            #BFD0DE !important;

          background:
            rgba(255,255,255,0.06)
            !important;

          border:
            1px solid
            rgba(255,255,255,0.08)
            !important;

          font-size:
            12px !important;

          font-weight:
            700 !important;

          transition:
            all 0.2s ease !important;
        }


        .faith-collapse-btn:hover {

          color:
            #FFFFFF !important;

          background:
            rgba(255,255,255,0.10)
            !important;

          border-color:
            rgba(217,164,65,0.35)
            !important;
        }


        .faith-collapse-btn
        svg {

          color:
            ${COLORS.gold};
        }


        /* =====================================================
           BANNER
        ===================================================== */

        .faith-sidebar-banner {

          position:
            relative;

          overflow:
            hidden;

          border-radius:
            12px;

          background:
            linear-gradient(
              145deg,
              #244F78 0%,
              #173B5E 65%,
              #102E49 100%
            );

          border:
            1px solid
            rgba(255,255,255,0.09);

          padding:
            7px;

          text-align:
            center;
        }


        .faith-sidebar-banner::before {

          content:
            "";

          position:
            absolute;

          width:
            80px;

          height:
            80px;

          right:
            -35px;

          top:
            -35px;

          border-radius:
            50%;

          border:
            1px solid
            rgba(217,164,65,0.22);
        }


        .faith-sidebar-banner::after {

          content:
            "";

          position:
            absolute;

          width:
            60px;

          height:
            60px;

          left:
            -30px;

          bottom:
            -30px;

          border-radius:
            50%;

          border:
            1px solid
            rgba(255,255,255,0.07);
        }


        .faith-banner-label {

          position:
            relative;

          z-index:
            2;

          display:
            flex;

          justify-content:
            center;

          align-items:
            center;

          gap:
            5px;

          margin-bottom:
            3px;

          color:
            #DCE7EF;

          font-size:
            8.5px;

          font-weight:
            700;
        }


        .faith-banner-cross {

          color:
            ${COLORS.gold};

          font-size:
            11px;
        }


        .faith-sidebar-banner img {

          position:
            relative;

          z-index:
            2;

          display:
            block;

          width:
            100%;

          height:
            auto;

          max-height:
            140px;

          object-fit:
            contain;

          border-radius:
            8px;
        }


        /* =====================================================
           MOBILE DRAWER
        ===================================================== */

        .faith-mobile-sidebar-drawer {

          z-index:
            2000;
        }


        .faith-mobile-sidebar-drawer
        .ant-drawer-content {

          background:
            ${COLORS.navy}
            !important;

          border-radius:
            0 18px 18px 0;

          overflow:
            hidden;
        }


        .faith-mobile-sidebar-drawer
        .ant-drawer-body {

          padding:
            0 !important;

          background:
            ${COLORS.navy}
            !important;
        }


        .faith-mobile-sidebar {

          height:
            100%;

          display:
            flex;

          flex-direction:
            column;

          padding:
            15px 12px;

          background:
            ${COLORS.navy};
        }


        .faith-mobile-header {

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            8px;

          margin-bottom:
            4px;
        }


        .faith-mobile-header
        .faith-sidebar-brand {

          flex:
            1;

          margin-bottom:
            0;

          padding:
            7px 8px;
        }


        .faith-close-drawer {

          width:
            38px;

          height:
            38px;

          border-radius:
            9px;

          border:
            1px solid
            rgba(255,255,255,0.10);

          background:
            rgba(255,255,255,0.07);

          color:
            #D6E0E9;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          cursor:
            pointer;

          flex-shrink:
            0;

          transition:
            all 0.2s ease;
        }


        .faith-close-drawer:hover {

          background:
            rgba(255,255,255,0.13);

          color:
            #FFFFFF;

          border-color:
            rgba(217,164,65,0.4);
        }


        .faith-mobile-sidebar
        .faith-sidebar-menu {

          flex:
            1;

          min-height:
            0;
        }


        .faith-mobile-sidebar
        .ant-menu {

          background:
            transparent !important;

          border:
            none !important;

          color:
            #D6E0E9 !important;
        }


        .faith-mobile-sidebar
        .ant-menu-item,
        .faith-mobile-sidebar
        .ant-menu-submenu-title {

          font-size:
            13px !important;

          font-weight:
            600 !important;

          color:
            #D6E0E9 !important;

          height:
            43px !important;

          line-height:
            43px !important;

          margin:
            3px 0 !important;
        }


        .faith-mobile-sidebar
        .ant-menu-item:hover,
        .faith-mobile-sidebar
        .ant-menu-submenu-title:hover {

          color:
            #FFFFFF !important;

          background:
            ${COLORS.navyHover}
            !important;
        }


        .faith-mobile-sidebar
        .ant-menu-item-selected {

          color:
            #FFFFFF !important;

          background:
            ${COLORS.navyHover}
            !important;

          box-shadow:
            inset 3px 0 0
            ${COLORS.gold}
            !important;
        }


        .faith-mobile-sidebar
        .ant-menu-sub {

          background:
            rgba(0,0,0,0.10)
            !important;

          border-radius:
            8px;
        }


        .faith-mobile-sidebar
        .ant-menu-sub
        .ant-menu-item {

          padding-left:
            43px !important;

          font-size:
            12.5px !important;
        }


        .faith-mobile-sidebar
        .faith-sidebar-footer {

          margin-top:
            10px;
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 767px) {

          .desktop-sidebar {

            display:
              none !important;
          }

        }


        @media (min-width: 768px) {

          .faith-mobile-sidebar-drawer {

            display:
              none !important;
          }

        }


        /* =====================================================
           REDUCE MOTION
        ===================================================== */

        @media (
          prefers-reduced-motion: reduce
        ) {

          .faith-sidebar-brand,
          .faith-collapse-btn,
          .faith-close-drawer {

            transition:
              none !important;
          }

        }

      `}</style>
    </>
  );
}
