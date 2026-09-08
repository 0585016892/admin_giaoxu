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

import imgSidebar from "../../assets/images/imgSidebar.png";
import logoWeb from "../../assets/images/logoweb.png";
import usePermission from "../../hooks/usePermission";

const { Sider } = Layout;
const { Title, Text } = Typography;

/* =========================================================
   COLORS & THEME
========================================================= */
const COLORS = {
  primary: "#FF6B8B",
  primaryHover: "#FF5277",
  primaryLight: "#FFF0F5",
  primaryBorder: "#FBCFE8",

  purpleLight: "#F3E8FF",
  purpleBorder: "#E9D5FF",

  textDark: "#2D3748",
  textMuted: "#718096",

  white: "#FFFFFF",
  menuHoverBg: "#FFF5F7",
  shadowSoft: "0 10px 30px rgba(255, 107, 139, 0.08)",
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

  /* GOM NHÓM MENU ITEMS */
  const menuItems = useMemo(() => {
    const items = [];

    // 1. TỔNG QUAN
    items.push({
      key: MENU_PATHS.dashboard,
      label: "Tổng quan",
      icon: <Home size={19} strokeWidth={2.2} />,
    });

    // 2. NHÓM QUẢN LÝ LỚP HỌC
    const classChildren = [];
    if (permission.canViewClass) {
      classChildren.push({
        key: MENU_PATHS.classes,
        label: "Tất cả lớp học",
        icon: <BookOpen size={17} strokeWidth={2.2} />,
      });
    }
    classChildren.push({
      key: MENU_PATHS.myClasses,
      label: "Lớp của tôi",
      icon: <GraduationCap size={17} strokeWidth={2.2} />,
    });

    items.push({
      key: "group-classes",
      label: "Quản lý Lớp học",
      icon: <GraduationCap size={19} strokeWidth={2.2} />,
      children: classChildren,
    });

    // 3. NHÓM QUẢN LÝ HỌC SINH
    const studentChildren = [];
    if (permission.canViewStudents) {
      studentChildren.push({
        key: MENU_PATHS.students,
        label: "Tất cả học sinh",
        icon: <Users size={17} strokeWidth={2.2} />,
      });
    }
    studentChildren.push({
      key: MENU_PATHS.myStudents,
      label: "Học sinh của tôi",
      icon: <UserRound size={17} strokeWidth={2.2} />,
    });

    items.push({
      key: "group-students",
      label: "Quản lý Học sinh",
      icon: <Users size={19} strokeWidth={2.2} />,
      children: studentChildren,
    });

    // 4. QUẢN LÝ GIÁO LÝ VIÊN
    if (permission.canViewCatechists) {
      items.push({
        key: MENU_PATHS.catechists,
        label: "Quản lý GLV",
        icon: <Sparkles size={19} strokeWidth={2.2} />,
      });
    }
    items.push({
      key: MENU_PATHS.attendance,
      label: "Điểm danh",
      icon: <ClipboardCheck size={17} strokeWidth={2.2} />,
    });
    // 5. NHÓM HỌC TẬP & TƯƠNG TÁC
    items.push({
      key: "group-learning",
      label: "Học tập & Trò chơi",
      icon: <Layers size={19} strokeWidth={2.2} />,
      children: [
        {
          key: MENU_PATHS.games,
          label: "Trò chơi tương tác",
          icon: <Gamepad2 size={17} strokeWidth={2.2} />,
        },
        {
          key: MENU_PATHS.results,
          label: "Kết quả học tập",
          icon: <BarChart3 size={17} strokeWidth={2.2} />,
        },
        {
          key: MENU_PATHS.leaderboard,
          label: "Bảng thành tích",
          icon: <Trophy size={17} strokeWidth={2.2} />,
        },
      ],
    });

    // 6. NHÓM THÔNG BÁO
    const notificationChildren = [];
    if (permission.canViewStudents) {
      notificationChildren.push({
        key: MENU_PATHS.sendNotifications,
        label: "Gửi thông báo",
        icon: <Send size={17} strokeWidth={2.2} />,
      });
    }
    notificationChildren.push({
      key: MENU_PATHS.notifications,
      label: "Thông báo Giáo xứ",
      icon: <Bell size={17} strokeWidth={2.2} />,
    });

    items.push({
      key: "group-notifications",
      label: "Thông báo",
      icon: <Bell size={19} strokeWidth={2.2} />,
      children: notificationChildren,
    });

    return items;
  }, [permission]);

  /* Tìm active key và open keys cho menu */
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

  const closeMobileMenu = () => {
    if (typeof setMobileOpen === "function") setMobileOpen(false);
  };

  const handleMenuClick = ({ key }) => {
    if (!key || key.startsWith("group-")) return;
    navigate(key);
    closeMobileMenu();
  };

  const handleBrandClick = () => {
    navigate(MENU_PATHS.dashboard);
    closeMobileMenu();
  };

  const handleToggleCollapse = () => {
    if (typeof setCollapsed === "function") setCollapsed(!collapsed);
  };

  /* Component Brand */
  const Brand = ({ compact = false }) => {
    const showInfo = !collapsed || compact;

    return (
      <div
        className={`sidebar-brand-card ${compact ? "compact" : ""}`}
        onClick={handleBrandClick}
        role="button"
        tabIndex={0}
      >
        <div className="brand-avatar-wrapper">
          <Avatar
            size={compact ? 44 : collapsed ? 40 : 44}
            src={logoWeb}
            className="brand-logo"
          />
          {!collapsed && !compact && <span className="status-dot" />}
        </div>

        {showInfo && (
          <div className="brand-info">
            <Title level={5} className="brand-title">
              TNTT FaithEdu
            </Title>
            <Text className="brand-subtitle">Cổng Giáo Lý Viên</Text>
          </div>
        )}
      </div>
    );
  };

  /* Component Menu */
  const SidebarMenu = ({ mobile = false }) => (
    <div className={`sidebar-menu-wrapper ${mobile ? "mobile" : ""}`}>
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

  /* Component Footer */
  const SidebarFooter = ({ mobile = false }) => (
    <div className={`sidebar-footer ${mobile ? "mobile" : ""}`}>
      {!mobile && (
        <Tooltip title={collapsed ? "Mở rộng menu" : ""} placement="right">
          <Button
            type="text"
            onClick={handleToggleCollapse}
            icon={
              collapsed ? (
                <PanelLeftOpen size={20} color={COLORS.primary} />
              ) : (
                <PanelLeftClose size={20} color={COLORS.primary} />
              )
            }
            className="collapse-toggle-btn"
          >
            {!collapsed && <span>Thu gọn</span>}
          </Button>
        </Tooltip>
      )}

      {(!collapsed || mobile) && (
        <div className="sidebar-banner-card">
          <img src={imgSidebar} alt="FaithEdu Illustration" />
        </div>
      )}
    </div>
  );

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: COLORS.primary,
            borderRadius: 14,
            fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
          },
          components: {
            Menu: {
              itemBg: "transparent",
              itemColor: COLORS.textDark,
              itemHoverColor: COLORS.primary,
              itemHoverBg: COLORS.menuHoverBg,
              itemSelectedColor: COLORS.white,
              itemSelectedBg: COLORS.primary,
              itemRadius: 12,
              itemMarginInline: 8,
              itemMarginBlock: 4,
              itemHeight: 44,
              subMenuItemBg: "transparent",
            },
          },
        }}
      >
        {/* DESKTOP SIDEBAR */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={260}
          collapsedWidth={84}
          theme="light"
          className="custom-sidebar desktop-sidebar"
        >
          <div className="sidebar-inner">
            <Brand />
            <SidebarMenu />
            <SidebarFooter />
          </div>
        </Sider>

        {/* MOBILE DRAWER */}
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={closeMobileMenu}
          width={280}
          closable={false}
          destroyOnHidden
          className="mobile-sidebar-drawer"
          styles={{ body: { padding: 0 } }}
        >
          <div className="mobile-sidebar">
            <div className="mobile-sidebar-header">
              <Brand compact />
              <button
                type="button"
                className="close-drawer-btn"
                onClick={closeMobileMenu}
                aria-label="Đóng menu"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarMenu mobile />
            <SidebarFooter mobile />
          </div>
        </Drawer>
      </ConfigProvider>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');

        /* DESKTOP SIDEBAR CONTAINER */
        .custom-sidebar {
          font-family: 'Quicksand', sans-serif;
          height: 100vh !important;
          position: sticky !important;
          top: 0 !important;
          left: 0 !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px);
          border-right: 1px solid #F3E8FF !important;
          box-shadow: ${COLORS.shadowSoft} !important;
          z-index: 99;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .sidebar-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: ${collapsed ? "16px 8px" : "16px 10px"};
          overflow: hidden;
        }

        /* BRAND SECTION */
        .sidebar-brand-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: ${collapsed ? "10px 0" : "10px 14px"};
          justify-content: ${collapsed ? "center" : "flex-start"};
          margin-bottom: 16px;
          border-radius: 18px;
          background: ${collapsed ? "transparent" : "linear-gradient(135deg, #FFF0F5 0%, #F3E8FF 100%)"};
          border: ${collapsed ? "none" : `1.5px solid ${COLORS.primaryBorder}`};
          cursor: pointer;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .sidebar-brand-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 139, 0.15);
        }

        .brand-avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .brand-logo {
          background-color: #FFE4EC !important;
          border: 2px solid #FF85A1 !important;
        }

        .status-dot {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #10B981;
          border: 2px solid #FFFFFF;
        }

        .brand-info {
          overflow: hidden;
        }

        .brand-title {
          margin: 0 !important;
          color: #2D3748 !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          line-height: 1.2 !important;
          white-space: nowrap;
        }

        .brand-subtitle {
          display: block;
          margin-top: 2px;
          color: ${COLORS.textMuted} !important;
          font-size: 11px !important;
          font-weight: 600 !important;
        }

        /* MENU SECTION */
        .sidebar-menu-wrapper {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-menu-wrapper::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-menu-wrapper::-webkit-scrollbar-thumb {
          background: #FBCFE8;
          border-radius: 10px;
        }

        .custom-sidebar .ant-menu-item,
        .mobile-sidebar .ant-menu-item,
        .custom-sidebar .ant-menu-submenu-title,
        .mobile-sidebar .ant-menu-submenu-title {
          font-weight: 600 !important;
          font-size: 13.5px !important;
          transition: all 0.2s ease !important;
        }

        .custom-sidebar .ant-menu-sub .ant-menu-item,
        .mobile-sidebar .ant-menu-sub .ant-menu-item {
          padding-left: 44px !important;
          font-size: 13px !important;
        }

        .custom-sidebar .ant-menu-item:hover,
        .mobile-sidebar .ant-menu-item:hover,
        .custom-sidebar .ant-menu-submenu-title:hover {
          transform: translateX(2px);
        }

        .custom-sidebar .ant-menu-item-selected,
        .mobile-sidebar .ant-menu-item-selected {
          box-shadow: 0 6px 16px rgba(255, 107, 139, 0.28) !important;
        }

        /* FOOTER & TOGGLE BUTTON */
        .sidebar-footer {
          flex-shrink: 0;
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .collapse-toggle-btn {
          height: 42px !important;
          width: 100% !important;
          border-radius: 14px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: ${collapsed ? "center" : "flex-start"} !important;
          padding: ${collapsed ? "0" : "0 14px"} !important;
          color: ${COLORS.textDark} !important;
          background: #FAF5FF !important;
          border: 1.5px solid ${COLORS.purpleBorder} !important;
          transition: all 0.2s ease !important;
        }

        .collapse-toggle-btn:hover {
          background: #F3E8FF !important;
          transform: translateY(-1px);
        }

        .sidebar-banner-card {
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #FFF0F5 0%, #F3E8FF 100%);
          border: 1.5px solid ${COLORS.primaryBorder};
          padding: 8px;
          text-align: center;
        }

        .sidebar-banner-card img {
          width: 100%;
          height: auto;
          max-height: 90px;
          object-fit: contain;
          border-radius: 10px;
        }

        /* MOBILE SIDEBAR */
        .mobile-sidebar {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 16px 12px;
          background: #FFFFFF;
        }

        .mobile-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .mobile-sidebar-header .sidebar-brand-card {
          flex: 1;
          margin-bottom: 0;
        }

        .close-drawer-btn {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 1px solid ${COLORS.primaryBorder};
          background: ${COLORS.primaryLight};
          color: ${COLORS.primary};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-left: 8px;
        }

        /* BREAKPOINTS */
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
        }
        @media (min-width: 768px) {
          .mobile-sidebar-drawer { display: none !important; }
        }
      `}</style>
    </>
  );
}
