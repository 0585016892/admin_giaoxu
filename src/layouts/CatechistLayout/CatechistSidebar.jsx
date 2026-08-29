import React from "react";
import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Button,
  Flex,
  ConfigProvider,
  Tooltip,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Gamepad2,
  BarChart3,
  Trophy,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Heart,
} from "lucide-react";

import imgSidebar from "../../assets/images/imgSidebar.png";

const { Sider } = Layout;
const { Title, Text } = Typography;

export default function CatechistSidebar({
  onLogout,
  collapsed,
  setCollapsed,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/catechist",
      label: "Tổng quan",
      icon: <Home size={18} strokeWidth={2.3} />,
    },
    {
      key: "/catechist/classes",
      label: "Lớp học",
      icon: <Users size={18} strokeWidth={2.3} />,
    },
    {
      key: "/catechist/students",
      label: "Học sinh",
      icon: <Users size={18} strokeWidth={2.3} />,
    },
    {
      key: "/catechist-management",
      label: "Danh sách GLV",
      icon: <Sparkles size={18} strokeWidth={2.3} />,
    },
    {
      key: "/catechist/games",
      label: "Trò chơi tương tác",
      icon: <Gamepad2 size={18} strokeWidth={2.3} />,
    },
    {
      key: "/catechist/results",
      label: "Kết quả học tập",
      icon: <BarChart3 size={18} strokeWidth={2.3} />,
    },
    {
      key: "/catechist/leaderboard",
      label: "Bảng thành tích",
      icon: <Trophy size={18} strokeWidth={2.3} />,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF6B8B",
          borderRadius: 18,
          fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
        },
        components: {
          Menu: {
            itemBg: "transparent",
            itemColor: "#4A5568",
            itemHoverColor: "#FF6B8B",
            itemHoverBg: "#FFF0F5",

            itemSelectedColor: "#FF6B8B",
            itemSelectedBg: "linear-gradient(135deg, #FF6B8B 0%, #FF85A1 100%)",

            itemRadius: 18,
            itemMarginInline: 0,
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
        collapsedWidth={84}
        theme="light"
        className="chibi-sidebar"
        style={{
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
          background: "rgba(255, 255, 255, 0.95)",
          borderRight: "2px solid #FFF0F5",
          boxShadow: "6px 0 24px rgba(255, 133, 161, 0.08)",
          zIndex: 99,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <Flex
          vertical
          style={{
            height: "100%",
            padding: collapsed ? "14px 10px" : "14px 14px",
            overflowY: "auto",
          }}
        >
          {/* BRAND PASTEL */}
          <div
            className="sidebar-brand-card"
            onClick={() => navigate("/catechist")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 12,
              padding: collapsed ? "8px 0" : "10px 12px",
              marginBottom: 12,
              borderRadius: 22,
              background: collapsed
                ? "transparent"
                : "linear-gradient(135deg, #FFF0F5 0%, #F3E8FF 100%)",
              border: collapsed ? "none" : "1.5px solid #FBCFE8",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
          >
            <div className="avatar-star-container">
              <Avatar
                size={collapsed ? 44 : 48}
                src={imgSidebar}
                style={{
                  backgroundColor: "#FFD6E0",
                  border: "2px solid #FF85A1",
                  boxShadow: "0 4px 12px rgba(255, 107, 139, 0.25)",
                  flexShrink: 0,
                }}
              />
            </div>

            {!collapsed && (
              <Flex vertical>
                <Flex align="center" gap={4}>
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      color: "#4A4E69",
                      fontWeight: 700,
                      lineHeight: 1.2,
                      fontSize: 14,
                    }}
                  >
                    Thiếu Nhi Thánh Thế
                  </Title>
                </Flex>
              </Flex>
            )}
          </div>

          {/* MENU */}
          <Menu
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              border: "none",
              fontWeight: 700,
              fontSize: 13.5,
              flex: 1,
            }}
          />

          {/* FOOTER ACTIONS */}
          <Flex vertical gap={6} style={{ marginTop: 8 }}>
            {/* TOGGLE */}
            <Tooltip title={collapsed ? "Mở rộng menu" : ""} placement="right">
              <Button
                type="text"
                onClick={() => setCollapsed(!collapsed)}
                icon={
                  collapsed ? (
                    <PanelLeftOpen size={19} color="#FF6B8B" />
                  ) : (
                    <PanelLeftClose size={19} color="#FF6B8B" />
                  )
                }
                style={{
                  height: 42,
                  borderRadius: 16,
                  color: "#4A5568",
                  fontWeight: 700,
                  fontSize: 13,
                  background: "#FAF5FF",
                  border: "1.5px solid #E9D5FF",
                  justifyContent: collapsed ? "center" : "flex-start",
                  paddingLeft: collapsed ? 0 : 16,
                }}
                block
              >
                {!collapsed && "Thu gọn menu"}
              </Button>
            </Tooltip>

            {/* LOGOUT */}
            <Tooltip
              title={collapsed ? "Tạm biệt / Đăng xuất" : ""}
              placement="right"
            >
              <Button
                type="text"
                icon={<LogOut size={18} strokeWidth={2.3} color="#EF4444" />}
                onClick={onLogout}
                block
                style={{
                  height: 42,
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#EF4444",
                  background: "#FEF2F2",
                  border: "1.5px solid #FCA5A5",
                  justifyContent: collapsed ? "center" : "flex-start",
                  paddingLeft: collapsed ? 0 : 16,
                }}
              >
                {!collapsed && "Tạm biệt / Đăng xuất"}
              </Button>
            </Tooltip>
          </Flex>

          {/* BANNER MINI CHIBI */}
          {!collapsed && (
            <div
              style={{
                marginTop: 12,
                borderRadius: 20,
                overflow: "hidden",
                width: "100%",
                background: "linear-gradient(135deg, #FFF0F5 0%, #F3E8FF 100%)",
                border: "1.5px solid #FBCFE8",
                padding: "8px",
                textAlign: "center",
              }}
            >
              <img
                src={imgSidebar}
                alt="Illustration Banner"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 110,
                  objectFit: "contain",
                  display: "block",
                  borderRadius: 14,
                }}
              />
            </div>
          )}
        </Flex>

        {/* CUSTOM CSS STYLES FOR MENU GLOW & SCROLLBAR */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap');

          .chibi-sidebar ::-webkit-scrollbar {
            width: 4px;
          }
          .chibi-sidebar ::-webkit-scrollbar-thumb {
            background: #FBCFE8;
            border-radius: 10px;
          }
          .chibi-sidebar .ant-menu-item-selected {
            box-shadow: 0 6px 16px rgba(255, 107, 139, 0.35) !important;
          }
          .sidebar-brand-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(255, 107, 139, 0.15);
          }
        `}</style>
      </Sider>
    </ConfigProvider>
  );
}
