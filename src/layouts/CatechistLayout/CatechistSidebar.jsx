import React, { useMemo } from "react";
import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Button,
  ConfigProvider,
  Tooltip,
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
} from "lucide-react";

import imgSidebar from "../../assets/images/imgSidebar.png";
import logoWeb from "../../assets/images/logoweb.png";
import usePermission from "../../hooks/usePermission";

const { Sider } = Layout;
const { Title, Text } = Typography;

/* =========================================================
   CONSTANTS
========================================================= */

const COLORS = {
  primary: "#FF6B8B",
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
   MENU CONFIG
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

  if (path === "/catechist") {
    return pathname === "/catechist";
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
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const { canViewClass, canViewStudents, canViewCatechists } = usePermission();

  /* =========================================================
     PERMISSIONS
  ========================================================= */

  const permission = {
    canViewClass: Boolean(canViewClass),
    canViewStudents: Boolean(canViewStudents),
    canViewCatechists: Boolean(canViewCatechists),
  };

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
  }, [
    permission.canViewClass,
    permission.canViewStudents,
    permission.canViewCatechists,
  ]);

  /* =========================================================
     ACTIVE MENU
  ========================================================= */

  const selectedKey = useMemo(() => {
    const pathname = location.pathname;

    const activeItem = menuItems
      .slice()
      .sort((a, b) => b.key.length - a.key.length)
      .find((item) => isPathActive(pathname, item.key));

    return activeItem ? [activeItem.key] : [];
  }, [location.pathname, menuItems]);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleMenuClick = ({ key }) => {
    if (!key) return;

    navigate(key);
  };

  /* =========================================================
     COLLAPSE
  ========================================================= */

  const handleToggleCollapse = () => {
    if (typeof setCollapsed === "function") {
      setCollapsed(!collapsed);
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
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
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={260}
        collapsedWidth={80}
        theme="light"
        className="chibi-sidebar"
        style={{
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,

          background: "rgba(255,255,255,0.98)",

          borderRight: `2px solid ${COLORS.primaryLight}`,

          boxShadow: "6px 0 24px rgba(255,133,161,0.08)",

          zIndex: 99,

          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div
          className="sidebar-inner"
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",

            padding: collapsed ? "14px 8px" : "14px 10px",

            overflow: "hidden",
          }}
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <div
            className="sidebar-brand-card"
            onClick={() => navigate(MENU_PATHS.dashboard)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                navigate(MENU_PATHS.dashboard);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",

              justifyContent: collapsed ? "center" : "flex-start",

              gap: 12,

              padding: collapsed ? "8px 0" : "10px 12px",

              marginBottom: 12,

              borderRadius: 20,

              background: collapsed
                ? "transparent"
                : "linear-gradient(135deg,#FFF0F5 0%,#F3E8FF 100%)",

              border: collapsed
                ? "none"
                : `1.5px solid ${COLORS.primaryBorder}`,

              cursor: "pointer",

              transition: "all 0.25s ease",

              flexShrink: 0,
            }}
          >
            <div
              className="avatar-star-container"
              style={{
                position: "relative",
                flexShrink: 0,
              }}
            >
              <Avatar
                size={collapsed ? 42 : 46}
                src={logoWeb}
                style={{
                  backgroundColor: "#FFD6E0",

                  border: "2px solid #FF85A1",

                  boxShadow: "0 4px 12px rgba(255,107,139,0.25)",
                }}
              />

              {!collapsed && (
                <span
                  style={{
                    position: "absolute",

                    right: -3,
                    bottom: -2,

                    width: 14,
                    height: 14,

                    borderRadius: "50%",

                    background: "#FFE4EC",

                    border: "2px solid #FFFFFF",

                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                />
              )}
            </div>

            {!collapsed && (
              <div
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <Title
                  level={5}
                  style={{
                    margin: 0,

                    color: "#4A4E69",

                    fontWeight: 700,

                    lineHeight: 1.3,

                    fontSize: 13.5,

                    whiteSpace: "nowrap",

                    overflow: "hidden",

                    textOverflow: "ellipsis",
                  }}
                >
                  Thiếu Nhi Thánh Thể
                </Title>

                <Text
                  style={{
                    display: "block",
                    marginTop: 2,

                    color: COLORS.textLight,

                    fontSize: 10.5,

                    fontWeight: 600,

                    whiteSpace: "nowrap",
                  }}
                >
                  FaithEdu
                </Text>
              </div>
            )}
          </div>

          {/* =================================================
              MENU
          ================================================= */}

          <div
            className="sidebar-menu-wrapper"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <Menu
              mode="inline"
              inlineCollapsed={collapsed}
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

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            style={{
              flexShrink: 0,
              marginTop: 12,
            }}
          >
            {/* -----------------------------------------------
                COLLAPSE
            ----------------------------------------------- */}

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
                style={{
                  height: 42,

                  width: "100%",

                  borderRadius: 16,

                  color: COLORS.text,

                  fontWeight: 700,

                  fontSize: 13,

                  background: "#FAF5FF",

                  border: `1.5px solid ${COLORS.purpleBorder}`,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: collapsed ? "center" : "flex-start",

                  padding: collapsed ? 0 : "0 16px",

                  marginBottom: 6,
                }}
              >
                {!collapsed && "Thu gọn menu"}
              </Button>
            </Tooltip>

            {/* -----------------------------------------------
                LOGOUT
            ----------------------------------------------- */}

            <Tooltip
              title={collapsed ? "Tạm biệt / Đăng xuất" : ""}
              placement="right"
            >
              <Button
                type="text"
                icon={
                  <LogOut size={17} strokeWidth={2.3} color={COLORS.danger} />
                }
                onClick={handleLogout}
                block
                style={{
                  height: 42,

                  width: "100%",

                  borderRadius: 16,

                  fontWeight: 700,

                  fontSize: 13,

                  color: COLORS.danger,

                  background: COLORS.dangerLight,

                  border: `1.5px solid ${COLORS.dangerBorder}`,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: collapsed ? "center" : "flex-start",

                  padding: collapsed ? 0 : "0 16px",
                }}
              >
                {!collapsed && "Tạm biệt / Đăng xuất"}
              </Button>
            </Tooltip>

            {/* -----------------------------------------------
                BANNER
            ----------------------------------------------- */}

            {!collapsed && (
              <div
                className="sidebar-banner"
                style={{
                  marginTop: 12,

                  borderRadius: 18,

                  overflow: "hidden",

                  width: "100%",

                  background: "linear-gradient(135deg,#FFF0F5 0%,#F3E8FF 100%)",

                  border: `1.5px solid ${COLORS.primaryBorder}`,

                  padding: 8,

                  textAlign: "center",
                }}
              >
                <img
                  src={imgSidebar}
                  alt="FaithEdu"
                  style={{
                    width: "100%",

                    height: "auto",

                    maxHeight: 100,

                    objectFit: "contain",

                    display: "block",

                    borderRadius: 12,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            CUSTOM CSS
        =================================================== */}

        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');

            .chibi-sidebar {
              font-family:
                'Quicksand',
                'Be Vietnam Pro',
                sans-serif;
            }

            /* ===============================
               SCROLLBAR
            =============================== */

            .chibi-sidebar
              .sidebar-menu-wrapper::-webkit-scrollbar {
              width: 4px;
            }

            .chibi-sidebar
              .sidebar-menu-wrapper::-webkit-scrollbar-track {
              background: transparent;
            }

            .chibi-sidebar
              .sidebar-menu-wrapper::-webkit-scrollbar-thumb {
              background: #FBCFE8;
              border-radius: 10px;
            }

            .chibi-sidebar
              .sidebar-menu-wrapper::-webkit-scrollbar-thumb:hover {
              background: #F9A8D4;
            }

            /* ===============================
               MENU
            =============================== */

            .chibi-sidebar
              .ant-menu {
              background: transparent !important;
            }

            .chibi-sidebar
              .ant-menu-item {
              transition:
                all 0.2s ease !important;
            }

            .chibi-sidebar
              .ant-menu-item:hover {
              transform:
                translateX(2px);
            }

            .chibi-sidebar
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
              .ant-menu-item-icon {
              color: #FFFFFF !important;
            }

            .chibi-sidebar
              .ant-menu-item
              .ant-menu-item-icon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
            }

            /* ===============================
               COLLAPSED MENU
            =============================== */

            .chibi-sidebar
              .ant-menu-inline-collapsed
              > .ant-menu-item {
              padding-inline: 0 !important;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .chibi-sidebar
              .ant-menu-inline-collapsed
              > .ant-menu-item
              .ant-menu-item-icon {
              margin-inline-end: 0 !important;
            }

            /* ===============================
               BRAND
            =============================== */

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

            .sidebar-brand-card:active {
              transform:
                translateY(0);
            }

            /* ===============================
               BUTTONS
            =============================== */

            .chibi-sidebar
              .ant-btn {
              transition:
                all 0.2s ease;
            }

            .chibi-sidebar
              .ant-btn:hover {
              transform:
                translateY(-1px);
            }

            /* ===============================
               BANNER
            =============================== */

            .sidebar-banner {
              transition:
                all 0.25s ease;
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
          `}
        </style>
      </Sider>
    </ConfigProvider>
  );
}
