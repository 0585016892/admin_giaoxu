import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Layout,
  Dropdown,
  Space,
  Avatar,
  Tooltip,
  ConfigProvider,
  Tag,
  Badge,
  Spin,
  message,
} from "antd";

import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  StarFilled,
  CrownFilled,
  SmileOutlined,
  DownOutlined,
  HomeOutlined,
  BellOutlined,
  CheckOutlined,
  RightOutlined,
  MenuOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import { io } from "socket.io-client";

import { useUser } from "../../context/UserContext";
import HelpModalCate from "../../components/HelpModalCate";
import notificationApi from "../../api/notificationApi";
import logoWeb from "../../assets/images/logoXn.png";

const { Header } = Layout;

const API_URL = process.env.REACT_APP_API_URL;

/* =========================================================
   NOTIFICATION HELPERS
========================================================= */

const normalizeNotification = (item) => {
  if (!item) return null;

  return {
    ...item,

    id: Number(item?.id),

    church_id:
      item?.church_id !== null && item?.church_id !== undefined
        ? Number(item.church_id)
        : null,

    created_by:
      item?.created_by !== null && item?.created_by !== undefined
        ? Number(item.created_by)
        : null,

    related_id:
      item?.related_id !== null &&
      item?.related_id !== undefined &&
      item?.related_id !== ""
        ? Number(item.related_id)
        : null,

    action_url:
      item?.action_url !== null &&
      item?.action_url !== undefined &&
      String(item.action_url).trim() !== ""
        ? String(item.action_url).trim()
        : null,

    related_type:
      item?.related_type !== null &&
      item?.related_type !== undefined &&
      String(item.related_type).trim() !== ""
        ? String(item.related_type).trim()
        : null,

    is_read:
      item?.is_read === true ||
      item?.is_read === 1 ||
      item?.is_read === "1" ||
      item?.is_read === "true",
  };
};

const getNotificationList = (res) => {
  if (Array.isArray(res)) return res;

  if (Array.isArray(res?.data)) {
    return res.data;
  }

  if (Array.isArray(res?.notifications)) {
    return res.notifications;
  }

  if (Array.isArray(res?.data?.notifications)) {
    return res.data.notifications;
  }

  return [];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CatechistHeader({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useUser();

  const [helpOpen, setHelpOpen] = useState(false);

  /* =========================================================
     NOTIFICATIONS STATE
  ========================================================= */

  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  /* =========================================================
     PAGE TITLE
  ========================================================= */

  useEffect(() => {
    const path = location.pathname;

    let title = "Tổng quan";

    if (path === "/catechist/classes-teacher") {
      title = "Lớp học của bạn";
    } else if (path === "/catechist/student-class") {
      title = "Học sinh của bạn";
    } else if (path === "/catechist-management") {
      title = "Quản lý giáo lý viên";
    } else if (path === "/catechist/classes") {
      title = "Quản lý lớp học";
    } else if (path === "/catechist/students") {
      title = "Quản lý học sinh";
    } else if (path === "/attendance") {
      title = "Điểm danh";
    } else if (path === "/catechist/games") {
      title = "Kho trò chơi";
    } else if (path === "/catechist/results") {
      title = "Kết quả học tập";
    } else if (path === "/catechist/leaderboard") {
      title = "Bảng thành tích";
    } else if (path === "/catechist/lessons") {
      title = "Bài học & Câu hỏi";
    } else if (path === "/catechist/notifications") {
      title = "Gửi thông báo";
    } else if (path === "/catechist/my-notifications") {
      title = "Thông báo của giáo xứ";
    } else if (path === "/catechist/profile") {
      title = "Trang cá nhân";
    } else if (path === "/catechist/settings") {
      title = "Thiết lập hệ thống";
    } else if (path === "/catechist/statistics") {
      title = "Báo cáo hệ thống";
    } else if (path === "/catechist/certificate") {
      title = "In chứng chỉ & văn bằng";
    } else if (path === "/login") {
      title = "Đăng nhập";
    } else if (path === "/catechist") {
      title = "Tổng quan";
    }

    document.title = `${title} | FaithEdu`;
  }, [location.pathname]);

  /* =========================================================
     AVATAR URL
  ========================================================= */

  const userAvatarUrl = useMemo(() => {
    if (!user?.avatar) return null;

    const avatar = String(user.avatar).trim();

    if (
      avatar.startsWith("http://") ||
      avatar.startsWith("https://") ||
      avatar.startsWith("blob:")
    ) {
      return avatar;
    }

    return `${API_URL}${avatar}`;
  }, [user?.avatar]);

  /* =========================================================
     ROLE
  ========================================================= */

  const translateRole = useCallback((role) => {
    switch (role) {
      case "priest":
        return "Linh mục Chánh xứ";

      case "admin":
        return "Ban Quản Trị";

      case "teacher":
        return "Giáo lý viên";

      case "catechist":
        return "Huấn Luyện Viên";

      case "admin_catechist":
        return "Ban Quản Trị";

      case "liturgy_manager":
        return "Ban Phụng Vụ";

      case "media_manager":
        return "Ban Truyền Thông";

      default:
        return "Hội đồng Mục vụ";
    }
  }, []);

  /* =========================================================
     ACCOUNT TYPE
  ========================================================= */

  const accountType = useMemo(() => {
    const type = String(user?.account_type || "")
      .trim()
      .toLowerCase();

    if (type === "vip") {
      return {
        key: "vip",
        label: "VIP",
        icon: <CrownFilled />,
        color: "#A8781D",
        bg: "#FFF8E8",
        border: "#E8C66A",
      };
    }

    return {
      key: "member",
      label: "Thành viên",
      icon: <StarFilled />,
      color: "#526273",
      bg: "#F4F7FA",
      border: "#DCE4EC",
    };
  }, [user?.account_type]);

  /* =========================================================
     USER
  ========================================================= */

  const userName = user?.full_name || user?.email || "Giáo lý viên";

  const userRole = translateRole(user?.role);

  /* =========================================================
     LOAD NOTIFICATIONS
  ========================================================= */

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setNotificationLoading(true);

      const res = await notificationApi.getToday();

      const list = getNotificationList(res)
        .map(normalizeNotification)
        .filter((item) => item && item.id);

      list.sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();

        const timeB = new Date(b.created_at || 0).getTime();

        return timeB - timeA;
      });

      setNotifications(list);
    } catch (error) {
      message.error("Lỗi khi lấy thông báo");
    } finally {
      setNotificationLoading(false);
    }
  }, [user?.id]);

  /* =========================================================
     UNREAD COUNT
  ========================================================= */

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.is_read).length;
  }, [notifications]);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (!user?.id) return;

    loadNotifications();
  }, [user?.id, loadNotifications]);

  /* =========================================================
     SOCKET REALTIME
  ========================================================= */

  useEffect(() => {
    if (!user?.id || !API_URL) return;

    const socket = io(API_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      socket.emit("join:user", {
        userId: user.id,
        churchId: user.church_id,
      });
    });

    socket.on("notification", (notification) => {
      const newNotification = normalizeNotification(notification);

      if (!newNotification?.id) return;

      setNotifications((prev) => {
        const exists = prev.some(
          (item) => Number(item.id) === Number(newNotification.id),
        );

        if (exists) return prev;

        return [newNotification, ...prev].slice(0, 50);
      });

      if (
        typeof window !== "undefined" &&
        document.hidden &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification(newNotification.title || "Thông báo mới", {
            body:
              newNotification.content ||
              "Bạn có một thông báo mới từ FaithEdu.",
            icon: logoWeb,
          });
        } catch (error) {
          console.error("Browser notification error:", error);
        }
      }

      const currentTitle = document.title;

      if (!currentTitle.startsWith("🔔")) {
        document.title = `🔔 ${currentTitle}`;
      }
    });

    return () => {
      socket.emit("leave:user", {
        userId: user.id,
        churchId: user.church_id,
      });

      socket.disconnect();
    };
  }, [user?.id, user?.church_id]);

  /* =========================================================
     BROWSER NOTIFICATION
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  /* =========================================================
     NOTIFICATION HELPERS
  ========================================================= */

  const getNotificationIcon = useCallback((type) => {
    switch (String(type || "").toLowerCase()) {
      case "attendance":
        return "📋";

      case "class":
        return "🏫";

      case "student":
        return "👨‍🎓";

      case "exam":
        return "📝";

      case "game":
        return "🎮";

      case "achievement":
        return "🏆";

      case "catechist":
        return "👨‍🏫";

      case "schedule":
        return "📅";

      case "announcement":
        return "📢";

      case "security":
        return "🔐";

      case "system":
        return "⚙️";

      default:
        return "🔔";
    }
  }, []);

  const getNotificationTypeLabel = useCallback((type) => {
    switch (String(type || "").toLowerCase()) {
      case "attendance":
        return "Điểm danh";

      case "class":
        return "Lớp học";

      case "student":
        return "Học sinh";

      case "exam":
        return "Bài kiểm tra";

      case "game":
        return "Trò chơi";

      case "achievement":
        return "Thành tích";

      case "catechist":
        return "Giáo lý viên";

      case "schedule":
        return "Lịch học";

      case "announcement":
        return "Thông báo";

      case "security":
        return "Bảo mật";

      case "system":
        return "Hệ thống";

      default:
        return "Thông báo";
    }
  }, []);

  const getPriorityConfig = useCallback((priority) => {
    switch (String(priority || "").toLowerCase()) {
      case "urgent":
        return {
          label: "Khẩn cấp",
          className: "urgent",
        };

      case "high":
        return {
          label: "Quan trọng",
          className: "high",
        };

      case "low":
        return {
          label: "Thấp",
          className: "low",
        };

      default:
        return {
          label: "Bình thường",
          className: "normal",
        };
    }
  }, []);

  const formatNotificationTime = useCallback((date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const now = new Date();

    const diff = Math.floor((now.getTime() - parsed.getTime()) / 1000);

    if (diff < 60) {
      return "Vừa xong";
    }

    if (diff < 3600) {
      return `${Math.floor(diff / 60)} phút trước`;
    }

    if (diff < 86400) {
      return `${Math.floor(diff / 3600)} giờ trước`;
    }

    if (diff < 172800) {
      return "Hôm qua";
    }

    return parsed.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  /* =========================================================
     ACTIONS
  ========================================================= */

  const handleNotificationRead = async (notification) => {
    if (!notification?.id) return;

    try {
      if (!notification.is_read) {
        await notificationApi.markAsRead(notification.id);

        setNotifications((prev) =>
          prev.map((item) =>
            Number(item.id) === Number(notification.id)
              ? {
                  ...item,
                  is_read: true,
                  read_at: new Date().toISOString(),
                }
              : item,
          ),
        );
      }

      setNotificationOpen(false);

      if (notification.action_url) {
        const actionUrl = String(notification.action_url).trim();

        if (actionUrl.startsWith("http")) {
          window.location.href = actionUrl;
        } else {
          navigate(actionUrl);
        }
      }
    } catch (error) {
      message.error("Lỗi cập nhật thông báo");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount <= 0) return;

    try {
      await notificationApi.markAllAsRead();

      const now = new Date().toISOString();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at || now,
        })),
      );
    } catch (error) {
      message.error("Đã xảy ra lỗi");
    }
  };

  const handleNotificationOpenChange = async (open) => {
    setNotificationOpen(open);

    if (open) {
      await loadNotifications();
    }
  };

  const handleLogout = () => {
    try {
      if (typeof logout === "function") {
        logout();
      }
    } finally {
      navigate("/");
    }
  };

  /* =========================================================
     MENU ITEMS
  ========================================================= */

  const menuItems = [
    {
      key: "account-info",
      disabled: true,

      label: (
        <div className="faith-user-menu-header">
          <div className="faith-user-menu-caption">TÀI KHOẢN HIỆN TẠI</div>

          <div className="faith-user-menu-name">{userName}</div>

          <div className="faith-user-menu-tags">
            <Tag className="faith-role-tag">{userRole}</Tag>

            <Tag
              icon={accountType.icon}
              className="faith-account-tag"
              style={{
                color: accountType.color,
                background: accountType.bg,
                borderColor: accountType.border,
              }}
            >
              {accountType.label}
            </Tag>
          </div>
        </div>
      ),
    },

    {
      type: "divider",
    },

    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Trang chủ",
    },

    {
      key: "profile",
      icon: <SmileOutlined />,
      label: "Trang cá nhân",
    },

    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Thiết lập hệ thống",
    },

    {
      type: "divider",
    },

    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "home":
        navigate("/catechist");
        break;

      case "profile":
        navigate("/catechist/profile");
        break;

      case "settings":
        navigate("/catechist/settings");
        break;

      case "logout":
        handleLogout();
        break;

      default:
        break;
    }
  };

  /* =========================================================
     NOTIFICATION DROPDOWN
  ========================================================= */

  const notificationDropdownContent = (
    <div className="faith-notification-dropdown">
      {/* HEADER */}
      <div className="faith-notification-header">
        <div className="faith-notification-header-left">
          <div className="faith-notification-header-icon">
            <BellOutlined />
          </div>

          <div className="faith-notification-header-info">
            <div className="faith-notification-title-row">
              <h3 className="faith-notification-title">Thông báo</h3>

              {unreadCount > 0 && (
                <span className="faith-notification-count">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>

            <div className="faith-notification-subtitle">
              {unreadCount > 0
                ? `Bạn có ${unreadCount} thông báo chưa đọc`
                : "Bạn đã xem tất cả thông báo"}
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="faith-notification-read-all"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAllAsRead();
            }}
          >
            <CheckOutlined />
            <span>Đọc tất cả</span>
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="faith-notification-list">
        {notificationLoading ? (
          <div className="faith-notification-loading">
            <Spin size="small" />
            <span>Đang tải thông báo...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="faith-notification-empty">
            <div className="faith-notification-empty-icon">
              <BellOutlined />
            </div>

            <div className="faith-notification-empty-title">
              Chưa có thông báo
            </div>

            <div className="faith-notification-empty-description">
              Các thông báo mới từ giáo xứ sẽ xuất hiện tại đây.
            </div>
          </div>
        ) : (
          notifications.slice(0, 8).map((notification) => {
            const priority = getPriorityConfig(notification.priority);

            return (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                className={`faith-notification-item ${
                  notification.is_read ? "read" : "unread"
                }`}
                onClick={() => handleNotificationRead(notification)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();

                    handleNotificationRead(notification);
                  }
                }}
              >
                <div
                  className={`faith-notification-item-icon ${priority.className}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="faith-notification-item-content">
                  <div className="faith-notification-item-top">
                    <span className="faith-notification-item-type">
                      {getNotificationTypeLabel(notification.type)}
                    </span>

                    <span className="faith-notification-item-time">
                      {formatNotificationTime(notification.created_at)}
                    </span>
                  </div>

                  <div className="faith-notification-item-title">
                    {notification.title || "Thông báo mới"}
                  </div>

                  {notification.content && (
                    <div className="faith-notification-item-description">
                      {notification.content}
                    </div>
                  )}

                  {notification.priority &&
                    notification.priority !== "normal" && (
                      <div className="faith-notification-item-bottom">
                        <span
                          className={`faith-notification-priority ${priority.className}`}
                        >
                          <span className="faith-notification-priority-dot" />
                          {priority.label}
                        </span>
                      </div>
                    )}
                </div>

                <RightOutlined className="faith-notification-arrow" />
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER */}
      <div className="faith-notification-footer">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();

            setNotificationOpen(false);

            navigate("/catechist/my-notifications");
          }}
        >
          <span>Xem tất cả thông báo</span>

          <RightOutlined />
        </button>
      </div>
    </div>
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#173B5E",
          borderRadius: 12,
          fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <div className="faith-header-wrapper">
        <Header className="faith-header">
          {/* MOBILE TOGGLE BUTTON */}
          <button
            type="button"
            className={`faith-mobile-menu-button ${
              mobileOpen ? "is-open" : ""
            }`}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          >
            {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>

          {/* BRAND */}
          <div
            className="faith-brand"
            onClick={() => navigate("/catechist")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();

                navigate("/catechist");
              }
            }}
          >
            <div className="faith-brand-logo--img">
              <img src={logoWeb} alt="FaithEdu" className="faith-logo-image" />
            </div>

            <div className="faith-brand-content">
              <div className="faith-brand-name">
                Faith
                <span>Edu</span>
              </div>

              <div className="faith-brand-slogan">
                Số hóa giáo lý • Kết nối đức tin
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <Space className="faith-header-right" size={10} align="center">
            {/* HELP */}
            <Tooltip title="Khám phá FaithEdu" placement="bottom">
              <button
                type="button"
                className="faith-help-button"
                onClick={() => setHelpOpen(true)}
              >
                <span className="faith-help-icon">
                  <QuestionCircleOutlined />
                </span>

                <span className="faith-help-text">Về FaithEdu</span>
              </button>
            </Tooltip>

            {/* NOTIFICATION */}
            <Dropdown
              open={notificationOpen}
              onOpenChange={handleNotificationOpenChange}
              dropdownRender={() => notificationDropdownContent}
              placement="bottomRight"
              trigger={["click"]}
              overlayClassName="faith-notification-overlay"
            >
              <Tooltip title="Thông báo" placement="bottom">
                <button
                  type="button"
                  className={`faith-notification-button ${
                    unreadCount > 0 ? "has-unread" : ""
                  }`}
                  aria-label="Thông báo"
                >
                  <Badge
                    count={unreadCount}
                    overflowCount={99}
                    size="small"
                    offset={[-1, 2]}
                  >
                    <span className="faith-notification-icon">
                      <BellOutlined />
                    </span>
                  </Badge>
                </button>
              </Tooltip>
            </Dropdown>

            {/* USER */}
            <Dropdown
              menu={{
                items: menuItems,
                onClick: handleMenuClick,
              }}
              placement="bottomRight"
              trigger={["click"]}
              overlayClassName="faith-dropdown"
            >
              <div className="faith-user" role="button" tabIndex={0}>
                <div className="faith-avatar-wrapper">
                  <Avatar
                    size={38}
                    className="faith-avatar"
                    src={userAvatarUrl}
                    icon={<UserOutlined />}
                  />

                  <span className={`faith-account-badge ${accountType.key}`}>
                    {accountType.key === "vip" ? (
                      <CrownFilled />
                    ) : (
                      <StarFilled />
                    )}
                  </span>
                </div>

                <div className="faith-user-info">
                  <div className="faith-user-name">{userName}</div>

                  <div className="faith-user-role">{userRole}</div>
                </div>

                <DownOutlined className="faith-user-arrow" />
              </div>
            </Dropdown>
          </Space>

          {/* HELP MODAL */}
          <HelpModalCate open={helpOpen} onClose={() => setHelpOpen(false)} />
        </Header>
      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&display=swap');

        /* =====================================================
           DESIGN SYSTEM
        ===================================================== */

        :root {
          --faith-navy: #173B5E;
          --faith-navy-hover: #244F78;
          --faith-gold: #D9A441;

          --faith-bg: #F7F9FC;
          --faith-white: #FFFFFF;

          --faith-heading: #172B3A;
          --faith-text: #526273;
          --faith-muted: #8A97A6;

          --faith-border: #E4EAF0;

          --faith-success: #2E8B68;
          --faith-warning: #D98A2B;
          --faith-error: #D9534F;

          --faith-radius: 12px;
        }

        /* =====================================================
           HEADER WRAPPER
        ===================================================== */

        .faith-header-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 12px 20px 0;
          background: transparent;
          box-sizing: border-box;
          transition: padding 0.3s ease;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .faith-header {
          position: relative;
          width: 100%;
          height: 70px !important;
          padding: 0 18px !important;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.95) !important;
          border: 1px solid rgba(228, 234, 240, 0.9);
          box-shadow: 0 6px 20px rgba(23, 59, 94, 0.05), 0 1px 3px rgba(23, 59, 94, 0.03);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-sizing: border-box;
          transition: all 0.3s ease;
        }

        /* =====================================================
           MOBILE MENU BUTTON
        ===================================================== */

        .faith-mobile-menu-button {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #C8D7E5;
          background: #FFFFFF;
          color: var(--faith-navy);
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .faith-mobile-menu-button:hover,
        .faith-mobile-menu-button.is-open {
          background: var(--faith-navy);
          border-color: var(--faith-navy);
          color: #FFFFFF;
        }

        /* =====================================================
           BRAND
        ===================================================== */

        .faith-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
          flex-shrink: 0;
        }

        .faith-brand-logo--img {
        background:none;
        border: 2px solid rgba(255, 255, 255, 0.9) !important;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .faith-logo-image {
          width: auto;
          height: 38px;
          object-fit: contain;
          transition: transform 0.2s ease;
        }

        .faith-brand:hover .faith-logo-image {
          transform: scale(1.05);
        }

        .faith-brand-content {
          display: flex;
          flex-direction: column;
        }

        .faith-brand-name {
          font-family: "Quicksand", sans-serif;
          font-size: 21px;
          font-weight: 800;
          color: var(--faith-navy);
          line-height: 1;
          letter-spacing: -0.4px;
        }

        .faith-brand-name span {
          color: var(--faith-gold);
        }

        .faith-brand-slogan {
          margin-top: 4px;
          font-family: "Quicksand", sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: var(--faith-muted);
          line-height: 1;
          letter-spacing: 0.2px;
        }/* =====================================================
   USER PROFILE DROPDOWN MENU UI & STYLING
   (Áp dụng cho overlayClassName="faith-dropdown")
===================================================== */

/* Khung dropdown chính của Ant Design */
.ant-dropdown.faith-dropdown .ant-dropdown-menu {
  padding: 6px;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 12px 36px rgba(23, 59, 94, 0.12), 0 4px 12px rgba(23, 59, 94, 0.06);
  border: 1px solid var(--faith-border);
  font-family: 'Quicksand', sans-serif;
  min-width: 240px;
}

/* Phần Header hiển thị thông tin tài khoản */
.faith-user-menu-header {
  padding: 10px 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.faith-user-menu-caption {
  font-size: 10px;
  font-weight: 800;
  color: var(--faith-muted);
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.faith-user-menu-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--faith-heading);
  line-height: 1.3;
  word-break: break-word;
}

.faith-user-menu-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.faith-role-tag {
  margin: 0 !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  padding: 1px 8px !important;
  border-radius: 6px !important;
  background: #EBF2F9 !important;
  border: 1px solid #C8D7E5 !important;
  color: var(--faith-navy) !important;
}

.faith-account-tag {
  margin: 0 !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  padding: 1px 8px !important;
  border-radius: 6px !important;
  display: inline-flex !important;
  align-items: center;
  gap: 4px;
}

/* Đường phân cách (Divider) */
.ant-dropdown.faith-dropdown .ant-dropdown-menu-item-divider {
  margin: 6px 0 !important;
  background-color: #EFEFEF !important;
}

/* Các mục menu tương tác (Trang chủ, Cá nhân, Cài đặt, Đăng xuất) */
.ant-dropdown.faith-dropdown .ant-dropdown-menu-item {
  padding: 10px 12px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  color: var(--faith-text) !important;
  transition: all 0.2s ease !important;
  margin-bottom: 2px;
}

.ant-dropdown.faith-dropdown .ant-dropdown-menu-item:hover {
  background: #F4F8FC !important;
  color: var(--faith-navy) !important;
}

/* Biểu tượng trong menu */
.ant-dropdown.faith-dropdown .ant-dropdown-menu-item .anticon {
  font-size: 15px !important;
  margin-right: 8px !important;
  color: var(--faith-muted);
  transition: color 0.2s ease;
}

.ant-dropdown.faith-dropdown .ant-dropdown-menu-item:hover .anticon {
  color: var(--faith-navy);
}

/* Mục Đăng xuất (Danger) */
.ant-dropdown.faith-dropdown .ant-dropdown-menu-item-danger {
  color: var(--faith-error) !important;
}

.ant-dropdown.faith-dropdown .ant-dropdown-menu-item-danger .anticon {
  color: var(--faith-error) !important;
}

.ant-dropdown.faith-dropdown .ant-dropdown-menu-item-danger:hover {
  background: #FDF2F2 !important;
  color: #C82333 !important;
}

/* Tối ưu responsive cho mobile */
@media screen and (max-width: 480px) {
  .ant-dropdown.faith-dropdown .ant-dropdown-menu {
    min-width: 220px;
    max-width: calc(100vw - 24px);
  }
}

        /* =====================================================
           RIGHT
        ===================================================== */

        .faith-header-right {
          flex-shrink: 0;
        }

        /* =====================================================
           HELP BUTTON
        ===================================================== */

        .faith-help-button {
          height: 40px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 10px;
          border: 1px solid #C8D7E5;
          background: #FFFFFF;
          color: var(--faith-navy);
          font-family: "Quicksand", sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .faith-help-button:hover {
          background: #F5F8FB;
          border-color: var(--faith-navy);
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(23, 59, 94, 0.08);
        }

        .faith-help-icon {
          font-size: 15px;
        }

        /* =====================================================
           NOTIFICATION BUTTON
        ===================================================== */

        .faith-notification-button {
          height: 40px;
          width: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid #fefeff;
          background: #FFFFFF;
          color: var(--faith-navy);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .faith-notification-button:hover {
          background: #F5F8FB;
          border-color: var(--faith-navy);
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(23, 59, 94, 0.08);
        }

        .faith-notification-icon {
          font-size: 16px;
        }

        /* =====================================================
           USER DROPDOWN TRIGGER
        ===================================================== */

        .faith-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 10px 4px 4px;
          border-radius: 12px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .faith-user:hover {
          background: #F5F8FB;
          border-color: #C8D7E5;
        }

        .faith-avatar-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .faith-avatar {
          border: 2px solid #C8D7E5;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .faith-account-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: #fff;
          border: 1.5px solid #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }

        .faith-account-badge.vip {
          background: var(--faith-gold);
        }

        .faith-account-badge.member {
          background: var(--faith-navy);
        }

        .faith-user-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .faith-user-name {
          font-family: "Quicksand", sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: var(--faith-heading);
          line-height: 1.2;
          max-width: 130px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .faith-user-role {
          font-family: "Quicksand", sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: var(--faith-muted);
          line-height: 1.2;
        }

        .faith-user-arrow {
          font-size: 10px;
          color: var(--faith-muted);
          margin-left: 2px;
          transition: transform 0.2s ease;
        }

        .faith-user:hover .faith-user-arrow {
          transform: translateY(1px);
        }

        /* =====================================================
           NOTIFICATION DROPDOWN UI & STYLING
        ===================================================== */

        .faith-notification-dropdown {
          width: 380px;
          max-height: 520px;
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(23, 59, 94, 0.12), 0 2px 8px rgba(23, 59, 94, 0.08);
          border: 1px solid var(--faith-border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: 'Quicksand', sans-serif;
        }

        .faith-notification-header {
          padding: 16px;
          background: #FAFCFF;
          border-bottom: 1px solid var(--faith-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .faith-notification-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .faith-notification-header-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(23, 59, 94, 0.08);
          color: var(--faith-navy);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .faith-notification-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .faith-notification-title {
          margin: 0;
          font-size: 15px;
          font-weight: 800;
          color: var(--faith-heading);
        }

        .faith-notification-count {
          background: var(--faith-error);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
          line-height: 1.2;
        }

        .faith-notification-subtitle {
          font-size: 11px;
          color: var(--faith-muted);
          margin-top: 2px;
        }

        .faith-notification-read-all {
          background: transparent;
          border: 1px solid var(--faith-border);
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          color: var(--faith-navy);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .faith-notification-read-all:hover {
          background: var(--faith-navy);
          color: #fff;
          border-color: var(--faith-navy);
        }

        .faith-notification-list {
          flex: 1;
          overflow-y: auto;
          max-height: 360px;
        }

        .faith-notification-loading,
        .faith-notification-empty {
          padding: 40px 20px;
          text-align: center;
          color: var(--faith-muted);
          font-size: 13px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .faith-notification-empty-icon {
          font-size: 32px;
          color: #C8D7E5;
          margin-bottom: 4px;
        }

        .faith-notification-empty-title {
          font-weight: 700;
          color: var(--faith-heading);
          font-size: 14px;
        }

        .faith-notification-empty-description {
          font-size: 12px;
          max-width: 240px;
          line-height: 1.4;
        }

        .faith-notification-item {
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border-bottom: 1px solid #F0F4F8;
          cursor: pointer;
          transition: background 0.2s ease;
          position: relative;
        }

        .faith-notification-item.unread {
          background: #F4F8FC;
        }

        .faith-notification-item.unread::before {
          content: '';
          position: absolute;
          left: 6px;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--faith-navy);
        }

        .faith-notification-item:hover {
          background: #EBF2F9;
        }

        .faith-notification-item-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          background: #E8F0F8;
        }

        .faith-notification-item-icon.urgent { background: #FDE8E8; color: #D9534F; }
        .faith-notification-item-icon.high { background: #FEF3E2; color: #D98A2B; }

        .faith-notification-item-content {
          flex: 1;
          min-width: 0;
        }

        .faith-notification-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 3px;
        }

        .faith-notification-item-type {
          font-size: 10px;
          font-weight: 700;
          color: var(--faith-muted);
          text-transform: uppercase;
        }

        .faith-notification-item-time {
          font-size: 10px;
          color: var(--faith-muted);
        }

        .faith-notification-item-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--faith-heading);
          line-height: 1.3;
          margin-bottom: 2px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .faith-notification-item-description {
          font-size: 12px;
          color: var(--faith-text);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .faith-notification-priority {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          margin-top: 4px;
        }

        .faith-notification-priority.urgent { color: var(--faith-error); }
        .faith-notification-priority.high { color: var(--faith-warning); }

        .faith-notification-priority-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .faith-notification-arrow {
          font-size: 10px;
          color: var(--faith-muted);
          align-self: center;
        }

        .faith-notification-footer {
          padding: 10px 16px;
          background: #FAFCFF;
          border-top: 1px solid var(--faith-border);
          text-align: center;
        }

        .faith-notification-footer button {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--faith-navy);
          font-size: 12px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          padding: 6px 0;
          transition: opacity 0.2s ease;
        }

        .faith-notification-footer button:hover {
          opacity: 0.8;
        }

        /* =====================================================
           RESPONSIVE DESIGN (MEDIA QUERIES)
        ===================================================== */

        /* Laptops & Medium Screens (max-width: 1024px) */
        @media screen and (max-width: 1024px) {
          .faith-header-wrapper {
            padding: 10px 14px 0;
          }

          .faith-brand-slogan {
            display: none;
          }
        }

        /* Tablets (max-width: 768px) */
        @media screen and (max-width: 768px) {
          .faith-mobile-menu-button {
            display: flex;
          }

          .faith-header-wrapper {
            padding: 8px 10px 0;
          }

          .faith-header {
            height: 62px !important;
            padding: 0 12px !important;
            border-radius: 14px;
            gap: 12px;
          }

          .faith-brand-logo--img {
            width: 38px;
            height: 38px;
          }

          .faith-logo-image {
            height: 32px;
          }

          .faith-brand-name {
            font-size: 18px;
          }

          .faith-help-text {
            display: none;
          }

          .faith-help-button {
            width: 38px;
            height: 38px;
            padding: 0;
            border-radius: 10px;
          }

          .faith-notification-button {
            width: 38px;
            height: 38px;
          }

          .faith-user-info,
          .faith-user-arrow {
            display: none;
          }

          .faith-user {
            padding: 2px;
            border-radius: 50%;
          }
          
          .faith-user:hover {
            border-color: transparent;
            background: transparent;
          }
        }

        /* Small Mobile Phones (max-width: 480px) */
        @media screen and (max-width: 480px) {
          .faith-header-wrapper {
            padding: 6px 6px 0;
          }

          .faith-header {
            height: 56px !important;
            padding: 0 8px !important;
            border-radius: 10px;
            gap: 8px;
          }

          .faith-brand-name {
            font-size: 16px;
          }

          .faith-header-right {
            gap: 6px !important;
          }

          .faith-help-button {
            display: none;
          }

          .faith-notification-button,
          .faith-mobile-menu-button {
            width: 34px;
            height: 34px;
            font-size: 16px;
            border-radius: 8px;
          }

          .faith-avatar {
            width: 32px !important;
            height: 32px !important;
          }

          /* Tối ưu hóa popup thông báo tràn màn hình gọn gàng hơn trên điện thoại nhỏ */
          .faith-notification-dropdown {
            width: 90vw !important;
            max-width: 340px;
          }
        }

      `}</style>
    </ConfigProvider>
  );
}
