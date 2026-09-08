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
import logoWeb from "../../assets/images/logoweb.png";

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
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.notifications)) return res.notifications;
  if (Array.isArray(res?.data?.notifications)) return res.data.notifications;
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

    const normalized = avatar.startsWith("/catechist") ? avatar : `${avatar}`;
    return `${API_URL}${normalized}`;
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
        color: "#B7791F",
        bg: "#FFF8E1",
        border: "#F6D98B",
      };
    }

    return {
      key: "member",
      label: "Thành viên",
      icon: <StarFilled />,
      color: "#64748B",
      bg: "#F8FAFC",
      border: "#E2E8F0",
    };
  }, [user?.account_type]);

  /* =========================================================
     USER
  ========================================================= */

  const userName = user?.full_name || user?.email || "Giáo lý viên";
  const userRole = translateRole(user?.role);

  /* =========================================================
     LOAD TODAY NOTIFICATIONS
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
          message.error("Browser notification error:", error);
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
     BROWSER NOTIFICATION PERMISSION
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
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
        return { label: "Khẩn cấp", className: "urgent" };
      case "high":
        return { label: "Quan trọng", className: "high" };
      case "low":
        return { label: "Thấp", className: "low" };
      default:
        return { label: "Bình thường", className: "normal" };
    }
  }, []);

  const formatNotificationTime = useCallback((date) => {
    if (!date) return "";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";

    const now = new Date();
    const diff = Math.floor((now.getTime() - parsed.getTime()) / 1000);

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 172800) return "Hôm qua";

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
              ? { ...item, is_read: true, read_at: new Date().toISOString() }
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
    if (open) await loadNotifications();
  };

  const handleLogout = () => {
    try {
      if (typeof logout === "function") logout();
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
    { type: "divider" },
    { key: "home", icon: <HomeOutlined />, label: "Trang chủ" },
    { key: "profile", icon: <SmileOutlined />, label: "Trang cá nhân" },
    { key: "settings", icon: <SettingOutlined />, label: "Thiết lập hệ thống" },
    { type: "divider" },
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
          colorPrimary: "#F4729A",
          borderRadius: 16,
          fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <div className="faith-header-wrapper">
        <Header className="faith-header">
          {/* MOBILE TOGGLE */}
          <button
            type="button"
            className={`faith-mobile-menu-button ${mobileOpen ? "is-open" : ""}`}
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
            <div className="faith-brand-logo">
              <img src={logoWeb} alt="FaithEdu" className="faith-logo-image" />
            </div>

            <div className="faith-brand-content">
              <div className="faith-brand-name">
                Faith<span>Edu</span>
              </div>
              <div className="faith-brand-slogan">
                Số hóa giáo lý • Kết nối đức tin
              </div>
            </div>
          </div>

          {/* RIGHT ACTIONS */}
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

        .faith-header-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 8px 16px 0;
          background: transparent;
        }

        .faith-header {
          position: relative;
          width: 100%;
          height: 64px !important;
          line-height: normal !important;
          padding: 0 12px !important;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.95) !important;
          border: 1px solid rgba(248, 194, 208, 0.7);
          box-shadow: 0 8px 25px rgba(224, 136, 164, 0.10), 0 2px 6px rgba(224, 136, 164, 0.06);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-sizing: border-box;
        }

        /* BRAND */
        .faith-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
          flex-shrink: 0;
        }

        .faith-brand-logo {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .faith-logo-image {
          height: 32px;
          width: auto;
          object-fit: contain;
        }

        .faith-brand-content {
          display: flex;
          flex-direction: column;
        }

        .faith-brand-name {
          font-family: 'Quicksand', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #1E293B;
          line-height: 1.1;
        }

        .faith-brand-name span {
          color: #F4729A;
        }

        .faith-brand-slogan {
          font-size: 10px;
          font-weight: 600;
          color: #64748B;
        }

        /* RIGHT SECTION */
        .faith-header-right {
          flex-shrink: 0;
        }

        /* HELP BUTTON */
        .faith-help-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid #F8C2D0;
          background: #FFF0F5;
          color: #D95880;
          font-family: 'Quicksand', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .faith-help-button:hover {
          background: #FFE6EF;
          border-color: #EFAAC1;
          transform: translateY(-1px);
        }

        .faith-help-icon {
          font-size: 15px;
        }

        /* NOTIFICATION BUTTON */
        .faith-notification-button {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 1px solid #F3C9D8;
          background: #FFF0F5;
          color: #E66B91;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .faith-notification-button:hover,
        .faith-notification-button.has-unread {
          background: #FFE6EF;
          color: #D95880;
        }

        .faith-notification-icon {
          font-size: 16px;
        }

        /* USER PROFILE */
        .faith-user {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 8px 3px 4px;
          border-radius: 20px;
          background: #FFF8FB;
          border: 1px solid #F3C9D8;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .faith-user:hover {
          background: #FFE6EF;
        }

        .faith-avatar-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .faith-avatar {
          background: #F4729A;
        }

        .faith-account-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          border: 1px solid #FFFFFF;
        }

        .faith-account-badge.vip {
          background: #F59E0B;
          color: #FFFFFF;
        }

        .faith-account-badge.member {
          background: #64748B;
          color: #FFFFFF;
        }

        .faith-user-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .faith-user-name {
          font-size: 12px;
          font-weight: 700;
          color: #1E293B;
          line-height: 1.2;
          max-width: 110px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .faith-user-role {
          font-size: 10px;
          color: #64748B;
          font-weight: 600;
        }

        .faith-user-arrow {
          font-size: 10px;
          color: #94A3B8;
        }

        /* MOBILE MENU BUTTON */
        .faith-mobile-menu-button {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 1px solid #F3C9D8;
          background: #FFF0F5;
          color: #E66B91;
          font-size: 16px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* USER MENU DROPDOWN */
        .faith-user-menu-header {
          padding: 6px 4px;
        }

        .faith-user-menu-caption {
          font-size: 10px;
          color: #94A3B8;
          font-weight: 700;
        }

        .faith-user-menu-name {
          font-size: 13px;
          font-weight: 700;
          color: #1E293B;
          margin: 2px 0 6px;
        }

        .faith-user-menu-tags {
          display: flex;
          gap: 4px;
        }

        .faith-role-tag {
          font-size: 10px;
          border-radius: 4px;
        }

        .faith-account-tag {
          font-size: 10px;
          border-radius: 4px;
        }

        /* NOTIFICATION DROPDOWN CONTENT */
        .faith-notification-dropdown {
          width: 350px;
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          overflow: hidden;
          border: 1px solid #F1F5F9;
        }

        .faith-notification-header {
          padding: 12px 16px;
          background: #FFF0F5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #FFE4E6;
        }

        .faith-notification-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .faith-notification-header-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #FFE4E6;
          color: #FB7185;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .faith-notification-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }

        .faith-notification-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .faith-notification-count {
          background: #E11D48;
          color: #FFFFFF;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 8px;
        }

        .faith-notification-subtitle {
          font-size: 11px;
          color: #64748B;
        }

        .faith-notification-read-all {
          border: none;
          background: transparent;
          color: #E11D48;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .faith-notification-list {
          max-height: 320px;
          overflow-y: auto;
        }

        .faith-notification-loading,
        .faith-notification-empty {
          padding: 30px 16px;
          text-align: center;
          color: #94A3B8;
          font-size: 12px;
        }

        .faith-notification-empty-icon {
          font-size: 24px;
          color: #CBD5E1;
          margin-bottom: 6px;
        }

        .faith-notification-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 14px;
          border-bottom: 1px solid #F8FAFC;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .faith-notification-item:hover {
          background: #F8FAFC;
        }

        .faith-notification-item.unread {
          background: rgba(255, 241, 242, 0.4);
        }

        .faith-notification-item-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .faith-notification-item-content {
          flex: 1;
          min-width: 0;
        }

        .faith-notification-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .faith-notification-item-type {
          font-size: 10px;
          font-weight: 700;
          color: #64748B;
        }

        .faith-notification-item-time {
          font-size: 10px;
          color: #94A3B8;
        }

        .faith-notification-item-title {
          font-size: 12px;
          font-weight: 700;
          color: #1E293B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .faith-notification-item-description {
          font-size: 11px;
          color: #64748B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .faith-notification-arrow {
          font-size: 10px;
          color: #CBD5E1;
          margin-top: 4px;
        }

        .faith-notification-footer {
          padding: 8px;
          background: #F8FAFC;
          text-align: center;
          border-top: 1px solid #F1F5F9;
        }

        .faith-notification-footer button {
          border: none;
          background: transparent;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .faith-mobile-menu-button {
            display: flex;
          }

          .faith-brand-slogan,
          .faith-help-text,
          .faith-user-info {
            display: none;
          }

          .faith-notification-dropdown {
            width: 300px;
          }
        }
      `}</style>
    </ConfigProvider>
  );
}
