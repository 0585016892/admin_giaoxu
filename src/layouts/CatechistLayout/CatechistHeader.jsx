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
} from "antd";

import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BookOutlined,
  StarFilled,
  CrownFilled,
  SmileOutlined,
  DownOutlined,
  HomeOutlined,
  BellOutlined,
  CheckOutlined,
  RightOutlined,
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
  if (Array.isArray(res)) {
    return res;
  }

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

export default function AdminHeader() {
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

    /*
     * IMPORTANT:
     * Các route dài phải kiểm tra trước route ngắn
     */

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

    const normalized = avatar.startsWith("/catechist") ? avatar : `/${avatar}`;

    return `${API_URL}${normalized}`;
  }, [user?.avatar]);

  /* =========================================================
     ROLE
  ========================================================= */

  const translateRole = (role) => {
    switch (role) {
      case "priest":
        return "Linh mục Chánh xứ";

      case "admin":
        return "Ban Quản Trị";

      case "teacher":
        return "Giáo lý viên";

      case "catechist":
        return "Ban Quản Trị";

      case "liturgy_manager":
        return "Ban Phụng Vụ";

      case "media_manager":
        return "Ban Truyền Thông";

      default:
        return "Hội đồng Mục vụ";
    }
  };

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

      // Mới nhất lên đầu
      list.sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();

        return timeB - timeA;
      });

      setNotifications(list);
    } catch (error) {
      console.error("GET TODAY NOTIFICATIONS ERROR:", error);
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
      console.log("🔌 Notification socket connected:", socket.id);

      socket.emit("join:user", {
        userId: user.id,
        churchId: user.church_id,
      });
    });

    socket.on("notification", (notification) => {
      console.log("🔔 NEW NOTIFICATION:", notification);

      const newNotification = normalizeNotification(notification);

      if (!newNotification?.id) return;

      setNotifications((prev) => {
        const exists = prev.some(
          (item) => Number(item.id) === Number(newNotification.id),
        );

        if (exists) {
          return prev;
        }

        return [newNotification, ...prev].slice(0, 50);
      });

      /*
       * Browser notification
       */

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
          console.warn("Browser notification error:", error);
        }
      }

      /*
       * Update browser title
       */

      const currentTitle = document.title;

      if (!currentTitle.startsWith("🔔")) {
        document.title = `🔔 ${currentTitle}`;
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Notification socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.warn("Notification socket error:", error?.message);
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
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  /* =========================================================
     NOTIFICATION ICON
  ========================================================= */

  const getNotificationIcon = (type) => {
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
  };

  /* =========================================================
     NOTIFICATION TYPE LABEL
  ========================================================= */

  const getNotificationTypeLabel = (type) => {
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
  };

  /* =========================================================
     PRIORITY
  ========================================================= */

  const getPriorityConfig = (priority) => {
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
  };

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  const formatNotificationTime = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const now = new Date();

    const diff = Math.floor((now.getTime() - parsed.getTime()) / 1000);

    if (diff < 0) {
      return "Vừa xong";
    }

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
  };

  /* =========================================================
     MARK ONE AS READ
  ========================================================= */

  const handleNotificationRead = async (notification) => {
    if (!notification?.id) return;

    try {
      /*
       * Chỉ gọi API nếu chưa đọc
       */
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

      /*
       * Nếu notification có action_url
       * thì mới điều hướng.
       *
       * Data hiện tại của m:
       *
       * action_url: null
       *
       * => chỉ đánh dấu đã đọc,
       * không navigate.
       */

      if (notification.action_url) {
        const actionUrl = String(notification.action_url).trim();

        if (actionUrl.startsWith("http")) {
          window.location.href = actionUrl;
        } else {
          navigate(actionUrl);
        }

        return;
      }

      /*
       * Không có action_url
       * => không điều hướng.
       */
    } catch (error) {
      console.error("MARK NOTIFICATION READ ERROR:", error);
    }
  };

  /* =========================================================
     MARK ALL AS READ
  ========================================================= */

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
      console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);
    }
  };

  /* =========================================================
     OPEN NOTIFICATION DROPDOWN
  ========================================================= */

  const handleNotificationOpenChange = async (open) => {
    setNotificationOpen(open);

    if (open) {
      await loadNotifications();
    }
  };

  /* =========================================================
     NOTIFICATION DROPDOWN
  ========================================================= */

  const notificationDropdownContent = (
    <div className="faith-notification-dropdown">
      {/* =====================================================
         HEADER
      ===================================================== */}

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

      {/* =====================================================
         DIVIDER
      ===================================================== */}

      <div className="faith-notification-divider" />

      {/* =====================================================
         LIST
      ===================================================== */}

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
                {/* =========================================
                     ICON
                  ========================================= */}

                <div
                  className={`faith-notification-item-icon ${priority.className}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* =========================================
                     CONTENT
                  ========================================= */}

                <div className="faith-notification-item-content">
                  <div className="faith-notification-item-top">
                    <div className="faith-notification-type-wrap">
                      <span className="faith-notification-item-type">
                        {getNotificationTypeLabel(notification.type)}
                      </span>

                      {!notification.is_read && (
                        <span className="faith-notification-unread-dot" />
                      )}
                    </div>

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

                {/* =========================================
                     ARROW
                  ========================================= */}

                <RightOutlined className="faith-notification-arrow" />
              </div>
            );
          })
        )}
      </div>

      {/* =====================================================
         FOOTER
      ===================================================== */}

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
     HELP
  ========================================================= */

  const handleOpenHelp = () => {
    setHelpOpen(true);
  };

  const handleCloseHelp = () => {
    setHelpOpen(false);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

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
     USER MENU
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

  /* =========================================================
     MENU CLICK
  ========================================================= */

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
          {/* =================================================
             BRAND
          ================================================= */}

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

          {/* =================================================
             RIGHT
          ================================================= */}

          <Space className="faith-header-right" size={10} align="center">
            {/* =================================================
               HELP
            ================================================= */}

            <Tooltip title="Khám phá FaithEdu" placement="bottom">
              <button
                type="button"
                className="faith-help-button"
                onClick={handleOpenHelp}
                aria-label="Về FaithEdu"
              >
                <span className="faith-help-icon">
                  <BookOutlined />
                </span>

                <span className="faith-help-text">Về FaithEdu</span>
              </button>
            </Tooltip>

            {/* =================================================
               NOTIFICATION
            ================================================= */}

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

            {/* =================================================
               USER
            ================================================= */}

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

          {/* =================================================
             HELP MODAL
          ================================================= */}

          <HelpModalCate open={helpOpen} onClose={handleCloseHelp} />
        </Header>
      </div>

      {/* =====================================================
         STYLES
      ===================================================== */}

      <style>{`

        @import url(
          'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&display=swap'
        );

        /* =====================================================
           HEADER WRAPPER
        ===================================================== */

        .faith-header-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;

          padding: 9px 16px 0;

          background: transparent;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .faith-header {
          position: relative;

          height: 64px !important;
          min-height: 64px !important;

          padding: 0 10px 0 8px !important;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-radius: 22px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.97),
              rgba(255,249,252,.95)
            ) !important;

          border: 1px solid rgba(248,194,208,.7);

          box-shadow:
            0 8px 25px rgba(224,136,164,.10),
            0 2px 6px rgba(224,136,164,.06);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        /* =====================================================
           BRAND
        ===================================================== */

        .faith-brand {
          display: flex;
          align-items: center;

          gap: 10px;

          padding: 4px 14px 4px 5px;

          border-radius: 17px;

          cursor: pointer;
          user-select: none;

          background:
            linear-gradient(
              135deg,
              #fff5f8 0%,
              #fffafa 55%,
              #fffdf8 100%
            );

          border: 1px solid #f7dce4;

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease,
            background .2s ease;
        }

        .faith-brand:hover {
          transform: translateY(-1px);

          border-color: #efbdce;

          background:
            linear-gradient(
              135deg,
              #ffedf3,
              #fff8fa
            );

          box-shadow:
            0 7px 18px rgba(231,130,159,.14);
        }

        .faith-brand:active {
          transform: translateY(0);
        }

        /* =====================================================
           LOGO
        ===================================================== */

        .faith-brand-logo {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 15px;

          background: #fff;

          border: 2px solid #fff;

          box-shadow:
            0 5px 12px rgba(232,113,150,.20);
        }

        .faith-logo-image {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: contain;

          border-radius: 13px;
        }

        /* =====================================================
           BRAND TEXT
        ===================================================== */

        .faith-brand-content {
          display: flex;
          flex-direction: column;

          justify-content: center;

          gap: 2px;

          line-height: 1;
        }

        .faith-brand-name {
          color: #694455;

          font-size: 18px;
          font-weight: 800;

          letter-spacing: -.5px;
        }

        .faith-brand-name span {
          color: #ef7194;
        }

        .faith-brand-slogan {
          color: #b9788d;

          font-size: 9.5px;
          font-weight: 700;

          white-space: nowrap;
        }

        /* =====================================================
           RIGHT
        ===================================================== */

        .faith-header-right {
          display: flex;
          align-items: center;
        }

        /* =====================================================
           HELP
        ===================================================== */

        .faith-help-button {
          height: 40px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          padding: 0 14px;

          border-radius: 13px;

          border: 1px solid #ead79e;

          background:
            linear-gradient(
              135deg,
              #fffdf5,
              #fff8df
            );

          color: #806414;

          cursor: pointer;

          font-family: inherit;

          box-shadow:
            0 3px 8px rgba(168,132,35,.07);

          transition: all .2s ease;
        }

        .faith-help-button:hover {
          transform: translateY(-1px);

          border-color: #d8b94e;

          background:
            linear-gradient(
              135deg,
              #fff9df,
              #fff2c4
            );

          box-shadow:
            0 6px 14px rgba(168,132,35,.12);
        }

        .faith-help-icon {
          width: 25px;
          height: 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: #fff3c4;

          color: #b18b28;

          font-size: 14px;
        }

        .faith-help-text {
          color: #765b13;

          font-size: 12px;
          font-weight: 800;

          white-space: nowrap;
        }

        /* =====================================================
           NOTIFICATION BUTTON
        ===================================================== */

        .faith-notification-button {
          width: 40px;
          height: 40px;

          padding: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          border: 1px solid #f3c9d8;

          background:
            linear-gradient(
              135deg,
              #fff3f7,
              #fff9fb
            );

          color: #e26b91;

          cursor: pointer;

          box-shadow:
            0 3px 8px rgba(217,107,140,.07);

          transition: all .2s ease;
        }

        .faith-notification-button:hover {
          transform: translateY(-1px);

          border-color: #efaac1;

          background:
            linear-gradient(
              135deg,
              #ffe9f0,
              #fff4f8
            );

          box-shadow:
            0 7px 16px rgba(217,107,140,.14);
        }

        .faith-notification-button.has-unread {
          border-color: #eea5be;

          background:
            linear-gradient(
              135deg,
              #ffeaf1,
              #fff4f8
            );

          color: #df5e86;
        }

        .faith-notification-icon {
          width: 27px;
          height: 27px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 17px;
        }

        .faith-notification-button .ant-badge-count {
          min-width: 17px;
          height: 17px;

          padding: 0 4px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          color: #fff;

          background: #ed6f94;

          font-size: 9px;
          font-weight: 800;

          box-shadow:
            0 0 0 2px #fff;
        }

        /* =====================================================
           NOTIFICATION DROPDOWN
        ===================================================== */

        .faith-notification-dropdown {
          width: 420px;
          max-width: calc(100vw - 24px);

          overflow: hidden;

          border-radius: 20px;

          background: #fff;

          border: 1px solid #f4dce5;

          box-shadow:
            0 24px 65px rgba(107,72,88,.16),
            0 6px 20px rgba(107,72,88,.08);
        }

        /* =====================================================
           NOTIFICATION HEADER
        ===================================================== */

        .faith-notification-header {
          min-height: 82px;

          padding: 17px 18px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          background:
            linear-gradient(
              135deg,
              #fff3f7,
              #fff9fb 58%,
              #fdf8ff
            );
        }

        .faith-notification-header-left {
          min-width: 0;

          display: flex;
          align-items: center;

          gap: 11px;
        }

        .faith-notification-header-icon {
          width: 43px;
          height: 43px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          color: #e66c92;

          background:
            linear-gradient(
              135deg,
              #ffe1eb,
              #fff0f5
            );

          border: 1px solid #f5c5d5;

          font-size: 18px;

          box-shadow:
            0 5px 12px rgba(226,107,145,.10);
        }

        .faith-notification-header-info {
          min-width: 0;
        }

        .faith-notification-title-row {
          display: flex;
          align-items: center;

          gap: 7px;
        }

        .faith-notification-title {
          margin: 0;

          color: #543845;

          font-size: 17px;
          font-weight: 800;

          line-height: 1.2;
        }

        .faith-notification-count {
          min-width: 20px;
          height: 20px;

          padding: 0 6px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          border-radius: 20px;

          color: #fff;

          background: #ed6f94;

          font-size: 10px;
          font-weight: 800;

          box-shadow:
            0 3px 7px rgba(237,111,148,.20);
        }

        .faith-notification-subtitle {
          margin-top: 4px;

          color: #a27f8d;

          font-size: 10px;
          font-weight: 600;
        }

        /* =====================================================
           READ ALL
        ===================================================== */

        .faith-notification-read-all {
          height: 33px;

          padding: 0 10px;

          flex-shrink: 0;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 5px;

          border: 1px solid #f2cad8;

          border-radius: 10px;

          background: #fff;

          color: #d85e84;

          font-family: inherit;

          font-size: 10px;
          font-weight: 800;

          cursor: pointer;

          transition: all .2s ease;
        }

        .faith-notification-read-all:hover {
          color: #fff;

          border-color: #ed6f94;

          background: #ed6f94;

          box-shadow:
            0 5px 12px rgba(237,111,148,.18);
        }

        .faith-notification-divider {
          height: 1px;

          background: #f8e8ee;
        }

        /* =====================================================
           LIST
        ===================================================== */

        .faith-notification-list {
          max-height: 500px;

          overflow-y: auto;

          background: #fff;
        }

        .faith-notification-list::-webkit-scrollbar {
          width: 5px;
        }

        .faith-notification-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .faith-notification-list::-webkit-scrollbar-thumb {
          border-radius: 10px;

          background: #efd5df;
        }

        .faith-notification-list::-webkit-scrollbar-thumb:hover {
          background: #e4b9ca;
        }

        /* =====================================================
           ITEM
        ===================================================== */

        .faith-notification-item {
          position: relative;

          padding: 14px 16px;

          display: flex;
          align-items: flex-start;

          gap: 11px;

          border-bottom: 1px solid #f7edf1;

          background: #fff;

          cursor: pointer;

          transition:
            background .2s ease,
            transform .2s ease;
        }

        .faith-notification-item:last-child {
          border-bottom: none;
        }

        .faith-notification-item:hover {
          background: #fff7fa;
        }

        .faith-notification-item.unread {
          background:
            linear-gradient(
              90deg,
              #fff4f8 0%,
              #fffafb 65%,
              #fff 100%
            );
        }

        .faith-notification-item.unread::before {
          content: "";

          position: absolute;

          left: 0;
          top: 13px;
          bottom: 13px;

          width: 3px;

          border-radius: 0 5px 5px 0;

          background: #ed6f94;
        }

        .faith-notification-item.read {
          opacity: .88;
        }

        /* =====================================================
           ITEM ICON
        ===================================================== */

        .faith-notification-item-icon {
          width: 40px;
          height: 40px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          font-size: 17px;

          border: 1px solid transparent;
        }

        .faith-notification-item-icon.normal {
          background: #fff0f5;
          border-color: #f8d4e0;
        }

        .faith-notification-item-icon.low {
          background: #f7f5fa;
          border-color: #ebe6ef;
        }

        .faith-notification-item-icon.high {
          background: #fff7e6;
          border-color: #f6dfae;
        }

        .faith-notification-item-icon.urgent {
          background: #fff0f0;
          border-color: #f5cccc;
        }

        /* =====================================================
           ITEM CONTENT
        ===================================================== */

        .faith-notification-item-content {
          min-width: 0;

          flex: 1;
        }

        .faith-notification-item-top {
          min-width: 0;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 8px;

          margin-bottom: 3px;
        }

        .faith-notification-type-wrap {
          min-width: 0;

          display: flex;
          align-items: center;

          gap: 6px;
        }

        .faith-notification-item-type {
          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color: #b36f87;

          font-size: 8px;
          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: .45px;
        }

        .faith-notification-unread-dot {
          width: 6px;
          height: 6px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #ed6f94;

          box-shadow:
            0 0 0 3px rgba(237,111,148,.11);
        }

        .faith-notification-item-time {
          flex-shrink: 0;

          color: #b59da7;

          font-size: 8px;
          font-weight: 600;

          white-space: nowrap;
        }

        .faith-notification-item-title {
          overflow: hidden;

          display: -webkit-box;

          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;

          color: #4a303b;

          font-size: 12px;
          font-weight: 800;

          line-height: 1.4;
        }

        .faith-notification-item-description {
          margin-top: 3px;

          overflow: hidden;

          display: -webkit-box;

          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;

          color: #806c76;

          font-size: 10px;
          font-weight: 500;

          line-height: 1.5;
        }

        /* =====================================================
           PRIORITY
        ===================================================== */

        .faith-notification-item-bottom {
          margin-top: 6px;

          display: flex;
          align-items: center;
        }

        .faith-notification-priority {
          display: inline-flex;
          align-items: center;

          gap: 5px;

          padding: 3px 7px;

          border-radius: 7px;

          font-size: 7px;
          font-weight: 800;
        }

        .faith-notification-priority-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: currentColor;
        }

        .faith-notification-priority.normal {
          color: #c25e82;
          background: #fff0f5;
        }

        .faith-notification-priority.low {
          color: #718096;
          background: #f1f5f9;
        }

        .faith-notification-priority.high {
          color: #a8750b;
          background: #fff5d9;
        }

        .faith-notification-priority.urgent {
          color: #c24141;
          background: #fff0f0;
        }

        /* =====================================================
           ARROW
        ===================================================== */

        .faith-notification-arrow {
          align-self: center;

          flex-shrink: 0;

          color: #d8bac6;

          font-size: 9px;

          transition:
            transform .2s ease,
            color .2s ease;
        }

        .faith-notification-item:hover
          .faith-notification-arrow {
          color: #ed6f94;

          transform: translateX(2px);
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .faith-notification-loading {
          min-height: 190px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-direction: column;

          gap: 9px;

          color: #a78391;

          font-size: 10px;
          font-weight: 600;
        }

        .faith-notification-loading
          .ant-spin-dot-item {
          background: #ed6f94;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .faith-notification-empty {
          min-height: 230px;

          padding: 30px 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-direction: column;

          text-align: center;
        }

        .faith-notification-empty-icon {
          width: 60px;
          height: 60px;

          margin-bottom: 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 19px;

          color: #e56b91;

          background:
            linear-gradient(
              135deg,
              #ffe9f0,
              #fff3f7
            );

          border: 1px solid #f6cedb;

          font-size: 23px;
        }

        .faith-notification-empty-title {
          color: #59404c;

          font-size: 13px;
          font-weight: 800;
        }

        .faith-notification-empty-description {
          max-width: 245px;

          margin-top: 5px;

          color: #a58d98;

          font-size: 10px;
          font-weight: 500;

          line-height: 1.6;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .faith-notification-footer {
          padding: 10px;

          border-top: 1px solid #f6e8ed;

          background: #fffafd;
        }

        .faith-notification-footer button {
          width: 100%;
          height: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          border: none;

          border-radius: 10px;

          background: #fff0f5;

          color: #d45f82;

          font-family: inherit;

          font-size: 10px;
          font-weight: 800;

          cursor: pointer;

          transition: all .2s ease;
        }

        .faith-notification-footer button:hover {
          color: #c84e75;

          background: #ffe3ec;
        }

        .faith-notification-footer button svg {
          font-size: 9px;

          transition: transform .2s ease;
        }

        .faith-notification-footer button:hover svg {
          transform: translateX(3px);
        }

        /* =====================================================
           USER
        ===================================================== */

        .faith-user {
          display: flex;
          align-items: center;

          gap: 9px;

          min-width: 0;

          padding: 4px 10px 4px 5px;

          border-radius: 17px;

          border: 1px solid #eadcf6;

          background:
            linear-gradient(
              135deg,
              #fcf8ff,
              #faf5ff
            );

          cursor: pointer;

          transition: all .2s ease;
        }

        .faith-user:hover {
          transform: translateY(-1px);

          background:
            linear-gradient(
              135deg,
              #f8efff,
              #f5ebff
            );

          border-color: #dcbff4;

          box-shadow:
            0 5px 14px rgba(168,85,247,.10);
        }

        /* =====================================================
           AVATAR
        ===================================================== */

        .faith-avatar-wrapper {
          position: relative;

          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .faith-avatar {
          width: 38px !important;
          height: 38px !important;

          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          margin: 0 !important;
          padding: 0 !important;

          background: #f28caf !important;

          border: 2px solid #fff;

          box-shadow:
            0 3px 8px rgba(177,88,126,.18);
        }

        .faith-avatar .anticon {
          display: flex !important;

          align-items: center;
          justify-content: center;

          line-height: 1 !important;
        }

        /* =====================================================
           ACCOUNT BADGE
        ===================================================== */

        .faith-account-badge {
          position: absolute;

          right: -3px;
          bottom: -2px;

          width: 15px;
          height: 15px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          border: 1.5px solid #fff;

          color: #fff;

          font-size: 7px;

          box-shadow:
            0 2px 4px rgba(0,0,0,.08);
        }

        .faith-account-badge.vip {
          background: #f3a51a;
        }

        .faith-account-badge.member {
          background: #94a3b8;
        }

        /* =====================================================
           USER INFO
        ===================================================== */

        .faith-user-info {
          display: flex;
          flex-direction: column;

          justify-content: center;

          min-width: 0;

          line-height: 1.15;
        }

        .faith-user-name {
          max-width: 125px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color: #334155;

          font-size: 12px;
          font-weight: 800;
        }

        .faith-user-role {
          max-width: 135px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          margin-top: 2px;

          color: #9b59c8;

          font-size: 9px;
          font-weight: 700;
        }

        .faith-user-arrow {
          margin-left: 2px;

          color: #a855f7;

          font-size: 9px;
        }

        /* =====================================================
           USER DROPDOWN
        ===================================================== */

        .faith-dropdown .ant-dropdown-menu {
          min-width: 245px;

          padding: 8px !important;

          border-radius: 18px !important;

          border: 1px solid #eadcf6 !important;

          box-shadow:
            0 15px 35px rgba(115,73,140,.13) !important;
        }

        .faith-dropdown
          .ant-dropdown-menu-item {
          min-height: 40px;

          border-radius: 11px;

          font-family:
            "Quicksand",
            "Be Vietnam Pro",
            sans-serif;

          font-size: 12px;
          font-weight: 700;
        }

        .faith-dropdown
          .ant-dropdown-menu-item:hover {
          background: #faf5ff !important;
        }

        .faith-dropdown
          .ant-dropdown-menu-item
          .anticon {
          color: #a855f7;
        }

        /* =====================================================
           USER MENU HEADER
        ===================================================== */

        .faith-user-menu-header {
          min-width: 215px;

          padding: 5px 6px 8px;
        }

        .faith-user-menu-caption {
          color: #a1a1aa;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: .7px;
        }

        .faith-user-menu-name {
          margin-top: 3px;
          margin-bottom: 7px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color: #1e293b;

          font-size: 15px;
          font-weight: 800;
        }

        .faith-user-menu-tags {
          display: flex;
          align-items: center;

          gap: 5px;

          flex-wrap: wrap;
        }

        .faith-role-tag {
          margin: 0 !important;

          border-radius: 8px !important;

          border: 1px solid #eadcf6 !important;

          background: #faf5ff !important;

          color: #9333ea !important;

          font-size: 9px !important;
          font-weight: 800 !important;
        }

        .faith-account-tag {
          margin: 0 !important;

          border-radius: 8px !important;

          font-size: 9px !important;
          font-weight: 800 !important;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .faith-header-wrapper {
            padding: 6px 8px 0;
          }

          .faith-header {
            height: 56px !important;
            min-height: 56px !important;

            padding: 0 7px !important;

            border-radius: 18px;
          }

          .faith-brand {
            gap: 0;

            padding: 3px;

            border-radius: 14px;
          }

          .faith-brand-content {
            display: none;
          }

          .faith-brand-logo {
            width: 38px;
            height: 38px;

            border-radius: 13px;
          }

          .faith-help-button {
            width: 38px;
            height: 38px;

            padding: 0;

            border-radius: 11px;
          }

          .faith-help-text {
            display: none;
          }

          .faith-help-icon {
            width: 26px;
            height: 26px;
          }

          .faith-notification-button {
            width: 38px;
            height: 38px;

            border-radius: 11px;
          }

          .faith-user {
            padding: 3px;

            border-radius: 14px;
          }

          .faith-user-info,
          .faith-user-arrow {
            display: none;
          }

          .faith-avatar-wrapper,
          .faith-avatar {
            width: 38px !important;
            height: 38px !important;
          }

          .faith-notification-dropdown {
            width: min(
              390px,
              calc(100vw - 20px)
            );
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 400px) {

          .faith-header {
            padding: 0 5px !important;
          }

          .faith-header-right {
            gap: 5px !important;
          }

          .faith-help-button {
            width: 36px;
            height: 36px;
          }

          .faith-notification-button {
            width: 36px;
            height: 36px;
          }

          .faith-user {
            padding: 2px;
          }

          .faith-brand-logo {
            width: 36px;
            height: 36px;
          }

          .faith-notification-dropdown {
            width: calc(100vw - 16px);
          }

          .faith-notification-header {
            padding: 14px;
          }

          .faith-notification-item {
            padding: 13px;
          }

          .faith-notification-read-all {
            width: 33px;

            padding: 0;
          }

          .faith-notification-read-all span {
            display: none;
          }
        }

      `}</style>
    </ConfigProvider>
  );
}
