import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Dropdown,
  Space,
  Avatar,
  Typography,
  Badge,
  Tooltip,
  Button,
  ConfigProvider,
  notification,
  Empty,
  message,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  HistoryOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useUser } from "../../context/UserContext";
import socket from "../../socket/socket";
import {
  getNotificationsToday,
  markAllNotificationsAsRead,
} from "../../api/notificationApi";
import HelpModal from "../../components/HelpModal";

const { Header } = Layout;
const { Text, Title } = Typography;

export default function AdminHeader({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [notifyCount, setNotifyCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const DEFAULT_TITLE = "Giáo lý & Sống đạo";
  const [helpOpen, setHelpOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationsToday();
      const dataList = res.data || [];
      setNotifications(dataList);
      setNotifyCount(dataList.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Lỗi tải thông báo lịch sử:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleNotification = (data) => {
      const standardizedData = {
        id: data.id || Date.now() + Math.random(),
        title: data.title || "Thông báo hệ thống",
        content: data.content || data.message || "",
        type: data.type || "system",
        is_read: false,
        created_at: data.created_at || new Date(),
      };

      setNotifyCount((prev) => prev + 1);
      setNotifications((prev) => [standardizedData, ...prev]);

      notification.info({
        message: standardizedData.title,
        description: standardizedData.content,
        placement: "topRight",
        icon:
          standardizedData.type === "today_mass" ? (
            <CalendarOutlined style={{ color: "#D97706" }} />
          ) : (
            <HistoryOutlined style={{ color: "#2563EB" }} />
          ),
      });

      if (
        document.hidden &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(standardizedData.title, {
          body: standardizedData.content,
          tag: "church-notification",
        });
      }
    };

    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (notifyCount > 0) {
      document.title = `(${notifyCount}) Thông báo mới`;
    } else {
      document.title = DEFAULT_TITLE;
    }
  }, [notifyCount]);

  useEffect(() => {
    let interval = null;
    if (notifyCount > 0 && document.hidden) {
      interval = setInterval(() => {
        document.title =
          document.title === "🔔 Có thông báo mới!"
            ? DEFAULT_TITLE
            : "🔔 Có thông báo mới!";
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [notifyCount]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        document.title =
          notifyCount > 0 ? `(${notifyCount}) Thông báo mới` : DEFAULT_TITLE;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [notifyCount]);

  const clearNotifications = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifyCount(0);
      document.title = DEFAULT_TITLE;
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: 1,
        })),
      );
      message.success("Đã đánh dấu đọc tất cả thông báo");
    } catch (err) {
      message.error("Lỗi khi cập nhật thông báo");
    }
  };

  const formatNotifyTime = (date) => {
    const diffMs = new Date() - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined style={{ fontSize: "14px", color: "#344054" }} />,
      label: (
        <span style={{ fontWeight: 500, color: "#101828" }}>
          Thông tin cá nhân
        </span>
      ),
    },
    {
      key: "settings",
      icon: <SettingOutlined style={{ fontSize: "14px", color: "#344054" }} />,
      label: (
        <span style={{ fontWeight: 500, color: "#101828" }}>
          Cài đặt hệ thống
        </span>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ fontSize: "14px" }} />,
      label: <span style={{ fontWeight: 500 }}>Đăng xuất</span>,
      danger: true,
    },
  ];

  const notificationDropdown = () => (
    <div className="header-dropdown-card">
      <div className="dropdown-header">
        <div>
          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: "#101828",
            }}
          >
            Thông báo
          </Title>
          <Text style={{ fontSize: 12, color: "#667085" }}>
            Cập nhật hoạt động & Mục vụ Giáo xứ
          </Text>
        </div>
        {notifyCount > 0 && (
          <Button
            size="small"
            type="text"
            icon={<CheckOutlined style={{ fontSize: 12 }} />}
            onClick={clearNotifications}
            className="btn-mark-all"
          >
            Đọc tất cả
          </Button>
        )}
      </div>

      <div className="dropdown-body custom-header-scrollbar">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Empty
              description={
                <span style={{ color: "#98A2B3", fontSize: 13 }}>
                  Không có thông báo mới
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div className="notify-list-wrapper">
            {notifications.map((item) => {
              const isMass = item.type === "today_mass";
              return (
                <div
                  key={item.id}
                  className={`notify-card-item ${!item.is_read ? "unread" : ""}`}
                >
                  <Space align="start" size={12} style={{ width: "100%" }}>
                    <div
                      className={`notify-icon-avatar ${isMass ? "mass" : "sys"}`}
                    >
                      {isMass ? <CalendarOutlined /> : <HistoryOutlined />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="notify-item-meta">
                        <span className="notify-item-title">{item.title}</span>
                        <span className="notify-item-time">
                          {formatNotifyTime(item.created_at)}
                        </span>
                      </div>
                      <div className="notify-item-content">{item.content}</div>
                    </div>
                  </Space>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const userAvatarUrl = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${process.env.REACT_APP_API_URL}${user.avatar}`
    : null;

  const translateRole = (role) => {
    if (role === "priest") return "Linh mục Chánh xứ";
    if (role === "admin") return "Ban Quản Trị";
    return "Hội đồng Mục vụ";
  };

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      logout();
    } else if (key === "settings") {
      navigate("/settings");
    } else if (key === "profile") {
      navigate("/profile");
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0F172A",
          borderRadius: 10,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      }}
    >
      <Header className="modern-admin-header">
        {/* --- KHỐI ĐIỀU HƯỚNG BÊN TRÁI --- */}
        <Space size={12} className="brand-container">
          <div className="brand-logo-cube">ĐQ</div>
          <div className="brand-title-wrap">
            <Text className="brand-subtitle">Giáo Lý</Text>
            <Text className="brand-main-title">Sống Đạo</Text>
          </div>
        </Space>

        {/* --- KHỐI ĐIỀU KHIỂN & HỒ SƠ BÊN PHẢI --- */}
        <Space size={8}>
          <Tooltip title="Hướng dẫn sử dụng">
            <Button
              type="text"
              className="btn-header-icon"
              icon={<QuestionCircleOutlined style={{ fontSize: "17px" }} />}
              onClick={() => setHelpOpen(true)}
            />
          </Tooltip>

          {/* CHUÔNG THÔNG BÁO */}
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            dropdownRender={notificationDropdown}
            overlayClassName="header-dropdown-overlay"
          >
            <Badge
              count={notifyCount}
              size="small"
              color="#F04438"
              offset={[-4, 6]}
            >
              <Button
                type="text"
                className="btn-header-icon"
                icon={<BellOutlined style={{ fontSize: "17px" }} />}
              />
            </Badge>
          </Dropdown>

          <div className="header-divider" />

          {/* HỒ SƠ NGƯỜI ĐĂNG NHẬP */}
          <Dropdown
            menu={{
              items: menuItems,
              onClick: handleMenuClick,
            }}
            placement="bottomRight"
            trigger={["click"]}
            overlayClassName="header-dropdown-overlay"
          >
            <div className="user-profile-badge">
              <Avatar
                size={32}
                className="user-avatar-main"
                src={userAvatarUrl}
                icon={<UserOutlined />}
              />
              <div className="user-meta-info">
                <span className="user-name">
                  {user?.username || user?.full_name || "Quản trị viên"}
                </span>
                <span className="user-role-tag">
                  {translateRole(user?.role)}
                </span>
              </div>
            </div>
          </Dropdown>
        </Space>

        {/* CSS SCOPED TỐI GIẢN & HIỆN ĐẠI */}
        <style>{`
          .modern-admin-header {
            background: rgba(255, 255, 255, 0.85) !important;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 24px;
            position: sticky;
            top: 0;
            z-index: 100;
            width: 100%;
            height: 60px;
            border-bottom: 1px solid #EAECF0;
          }

          /* Thương hiệu */
          .brand-container {
            cursor: pointer;
          }
          .brand-logo-cube {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 700;
            font-size: 13px;
            background: #0F172A;
          }
          .brand-title-wrap {
            display: flex;
            flex-direction: column;
            line-height: 1.1;
          }
          .brand-subtitle {
            font-size: 10px;
            color: #667085;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
          }
          .brand-main-title {
            color: #101828;
            font-size: 14px;
            font-weight: 600;
          }

          /* Nút Icon */
          .btn-header-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #475467;
            border-radius: 8px;
            transition: all 0.15s ease;
          }
          .btn-header-icon:hover {
            background: #F2F4F7 !important;
            color: #101828 !important;
          }

          .header-divider {
            width: 1px;
            height: 20px;
            background: #EAECF0;
            margin: 0 4px;
          }

          /* User Profile Tag */
          .user-profile-badge {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 8px;
            transition: background 0.15s ease;
          }
          .user-profile-badge:hover {
            background: #F8FAFC;
          }
          .user-avatar-main {
            background-color: #0F172A;
            border: 1px solid #E2E8F0;
          }
          .user-meta-info {
            display: flex;
            flex-direction: column;
            text-align: left;
            line-height: 1.2;
          }
          .user-name {
            font-weight: 600;
            font-size: 13px;
            color: #344054;
          }
          .user-role-tag {
            font-size: 11px;
            color: #667085;
            font-weight: 400;
          }

          /* Dropdown Card Thông báo */
          .header-dropdown-card {
            width: 360px;
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #EAECF0;
            box-shadow: 0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03);
            overflow: hidden;
          }
          .dropdown-header {
            padding: 16px;
            border-bottom: 1px solid #F2F4F7;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .btn-mark-all {
            color: #475467 !important;
            font-size: 12px;
            font-weight: 500;
            padding: 0 6px;
            border-radius: 6px;
          }
          .btn-mark-all:hover {
            background-color: #F2F4F7 !important;
            color: #101828 !important;
          }

          /* Danh sách thông báo */
          .dropdown-body {
            max-height: 340px;
            overflow-y: auto;
          }
          .notify-list-wrapper {
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .notify-card-item {
            padding: 10px 12px;
            border-radius: 8px;
            transition: background 0.15s ease;
          }
          .notify-card-item:hover {
            background: #F8FAFC;
          }
          .notify-card-item.unread {
            background: #F0F9FF;
          }

          .notify-icon-avatar {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            flex-shrink: 0;
          }
          .notify-icon-avatar.mass {
            background: #FEF3C7;
            color: #D97706;
          }
          .notify-icon-avatar.sys {
            background: #F1F5F9;
            color: #475569;
          }

          .notify-item-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
          }
          .notify-item-title {
            font-weight: 600;
            color: #101828;
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .notify-item-time {
            font-size: 11px;
            color: #98A2B3;
            white-space: nowrap;
          }
          .notify-item-content {
            font-size: 12px;
            color: #475467;
            margin-top: 2px;
            line-height: 1.4;
          }

          .empty-state {
            padding: 32px 0;
            text-align: center;
          }

          /* Custom Scrollbar */
          .custom-header-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-header-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-header-scrollbar::-webkit-scrollbar-thumb {
            background: #EAECF0;
            border-radius: 10px;
          }
          .custom-header-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #D0D5DD;
          }
        `}</style>
        <HelpModal open={helpOpen} onCancel={() => setHelpOpen(false)} />
      </Header>
    </ConfigProvider>
  );
}
