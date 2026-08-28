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
  BookOpen,
  Gamepad2,
  BarChart3,
  Trophy,
  BookMarked,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
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
      icon: <Home size={18} strokeWidth={2.2} />,
    },
    {
      key: "/catechist/classes",
      label: "Lớp học",
      icon: <Users size={18} strokeWidth={2.2} />,
    },
    {
      key: "/catechist/students",
      label: "Học sinh",
      icon: <Users size={18} strokeWidth={2.2} />,
    },
    {
      key: "/catechist/lessons",
      label: "Ngân hàng câu hỏi",
      icon: <BookOpen size={18} strokeWidth={2.2} />,
    },
    {
      key: "/catechist/games",
      label: "Trò chơi tương tác",
      icon: <Gamepad2 size={18} strokeWidth={2.2} />,
    },
    {
      key: "/catechist/results",
      label: "Kết quả học tập",
      icon: <BarChart3 size={18} strokeWidth={2.2} />,
    },
    {
      key: "/catechist/leaderboard",
      label: "Thành tích",
      icon: <Trophy size={18} strokeWidth={2.2} />,
    },

    {
      key: "/catechist/documents",
      label: "Tài liệu giáo lý",
      icon: <BookMarked size={18} strokeWidth={2.2} />,
    },
    {
      key: "/catechist/settings",
      label: "Cài đặt",
      icon: <Settings size={18} strokeWidth={2.2} />,
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      width={260}
      collapsedWidth={80}
      theme="light"
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        background: "#fff",
        borderRight: "1px solid #f0f0f0",
        boxShadow: "4px 0 24px rgba(0,0,0,0.02)",
        zIndex: 100,
        transition: "all 0.2s ease",
      }}
    >
      <Flex
        vertical
        style={{
          height: "100%",
          padding: collapsed ? "16px 8px" : "16px 12px",
          overflowY: "auto",
        }}
      >
        {/* BRAND */}
        <Flex
          align="center"
          justify={collapsed ? "center" : "flex-start"}
          gap={12}
          style={{
            padding: collapsed ? "8px 0 16px" : "8px 8px 16px",
            minHeight: 70,
          }}
        >
          <Avatar
            size={collapsed ? 42 : 52}
            src={imgSidebar}
            style={{
              backgroundColor: "#e6f4ff",
              border: "1px solid #bae0ff",
              flexShrink: 0,
            }}
          />

          {!collapsed && (
            <Flex vertical>
              <Title
                level={5}
                style={{
                  margin: 0,
                  color: "#1d4ed8",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  fontSize: 16,
                }}
              >
                TNTT Anrê Phú Yên
                <br />
                Đồng Quan
              </Title>

              <Text
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  marginTop: 2,
                  color: "#64748b",
                }}
              >
                Học – Hiểu – Sống Đạo
              </Text>
            </Flex>
          )}
        </Flex>

        {/* MENU */}
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemBg: "transparent",
                itemColor: "#334155",
                itemHoverColor: "#1d4ed8",
                itemHoverBg: "#f1f5f9",

                itemSelectedColor: "#fff",
                itemSelectedBg: "#1d4ed8",

                itemRadius: 14,
                itemMarginInline: 0,
                itemPaddingInline: collapsed ? 0 : 16,
                itemHeight: 44,

                collapsedIconSize: 19,
              },
            },
          }}
        >
          <Menu
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              border: "none",
              fontWeight: 600,
              fontSize: 14,
              flex: 1,
            }}
          />
        </ConfigProvider>

        {/* TOGGLE */}
        <Tooltip
          title={collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
          placement="right"
        >
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            icon={
              collapsed ? (
                <PanelLeftOpen size={19} />
              ) : (
                <PanelLeftClose size={19} />
              )
            }
            style={{
              height: 44,
              borderRadius: 14,
              marginTop: 8,
              color: "#475569",
              justifyContent: collapsed ? "center" : "flex-start",
              paddingLeft: collapsed ? 0 : 16,
            }}
            block
          >
            {!collapsed && "Thu nhỏ menu"}
          </Button>
        </Tooltip>

        {/* LOGOUT */}
        <Tooltip title={collapsed ? "Đăng xuất" : ""} placement="right">
          <Button
            type="text"
            danger
            icon={<LogOut size={18} strokeWidth={2.2} />}
            onClick={onLogout}
            block
            style={{
              height: 44,
              borderRadius: 14,
              fontWeight: 600,
              justifyContent: collapsed ? "center" : "flex-start",
              paddingLeft: collapsed ? 0 : 16,
              marginTop: 8,
            }}
          >
            {!collapsed && "Đăng xuất"}
          </Button>
        </Tooltip>

        {/* BANNER */}
        {!collapsed && (
          <Flex
            justify="center"
            align="center"
            style={{
              marginTop: 12,
              borderRadius: 16,
              overflow: "hidden",
              width: "100%",
            }}
          >
            <img
              src={imgSidebar}
              alt="Illustration Banner"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: 160,
                objectFit: "contain",
                display: "block",
              }}
            />
          </Flex>
        )}
      </Flex>
    </Sider>
  );
}
