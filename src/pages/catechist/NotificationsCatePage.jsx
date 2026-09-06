import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Empty,
  List,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";

import {
  BellOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  WarningOutlined,
  TeamOutlined,
  SoundOutlined,
  SafetyOutlined,
  FireOutlined,
} from "@ant-design/icons";

import StatCard from "../../components/common/StatCard";
import AppButton from "../../components/common/AppButton";
import AppFormModal from "../../components/common/AppFormModal";
import AppDetailModal from "../../components/common/AppDetailModal";
import PageHeroHeader from "../../components/common/PageHeroHeader";

import notificationApi from "../../api/notificationApi";
import { useUser } from "../../context/UserContext";

const { Text, Paragraph } = Typography;

/* =========================================================
   TYPE CONFIG
========================================================= */

const TYPE_CONFIG = {
  system: {
    label: "Hệ thống",
    color: "blue",
    icon: <InfoCircleOutlined />,
  },

  announcement: {
    label: "Thông báo",
    color: "gold",
    icon: <SoundOutlined />,
  },

  class: {
    label: "Lớp học",
    color: "green",
    icon: <BookOutlined />,
  },

  attendance: {
    label: "Điểm danh",
    color: "purple",
    icon: <CalendarOutlined />,
  },

  student: {
    label: "Học viên",
    color: "cyan",
    icon: <UserOutlined />,
  },

  catechist: {
    label: "Giáo lý viên",
    color: "magenta",
    icon: <TeamOutlined />,
  },

  exam: {
    label: "Bài thi",
    color: "orange",
    icon: <TrophyOutlined />,
  },

  achievement: {
    label: "Thành tích",
    color: "gold",
    icon: <TrophyOutlined />,
  },

  warning: {
    label: "Cảnh báo",
    color: "red",
    icon: <WarningOutlined />,
  },

  security: {
    label: "Bảo mật",
    color: "volcano",
    icon: <SafetyOutlined />,
  },

  urgent: {
    label: "Khẩn cấp",
    color: "red",
    icon: <FireOutlined />,
  },
};

/* =========================================================
   PRIORITY CONFIG
========================================================= */

const PRIORITY_CONFIG = {
  low: {
    label: "Thấp",
    color: "default",
  },

  normal: {
    label: "Bình thường",
    color: "blue",
  },

  high: {
    label: "Quan trọng",
    color: "orange",
  },

  urgent: {
    label: "Khẩn cấp",
    color: "red",
  },
};

/* =========================================================
   HELPERS
========================================================= */

const getTypeConfig = (type) => {
  const normalizedType = String(type || "system").toLowerCase();

  return (
    TYPE_CONFIG[normalizedType] || {
      label: "Hệ thống",
      color: "blue",
      icon: <BellOutlined />,
    }
  );
};

const getPriorityConfig = (priority) => {
  const normalizedPriority = String(priority || "normal").toLowerCase();

  return (
    PRIORITY_CONFIG[normalizedPriority] || {
      label: "Bình thường",
      color: "blue",
    }
  );
};

/* =========================================================
   NORMALIZE BACKEND DATA
========================================================= */

const normalizeNotification = (item) => {
  if (!item) return null;

  const rawRead = item.is_read;

  const isRead =
    rawRead === true || rawRead === 1 || rawRead === "1" || rawRead === "true";

  return {
    ...item,

    id: Number(item.id ?? item.notification_id),

    church_id:
      item.church_id !== null && item.church_id !== undefined
        ? Number(item.church_id)
        : null,

    created_by:
      item.created_by !== null && item.created_by !== undefined
        ? Number(item.created_by)
        : null,

    title: String(item.title || "Thông báo mới").trim(),

    content: String(item.content || "").trim(),

    type: String(item.type || "system")
      .trim()
      .toLowerCase(),

    priority: String(item.priority || "normal")
      .trim()
      .toLowerCase(),

    is_read: isRead,

    read_at: item.read_at || null,

    created_at: item.created_at || null,

    updated_at: item.updated_at || null,

    action_url: item.action_url ? String(item.action_url).trim() : null,

    related_id:
      item.related_id !== null && item.related_id !== undefined
        ? item.related_id
        : null,

    related_type:
      item.related_type !== null && item.related_type !== undefined
        ? String(item.related_type)
        : null,
  };
};

/* =========================================================
   GET LIST
========================================================= */

const getNotificationList = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.notifications)) {
    return response.notifications;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.data?.notifications)) {
    return response.data.notifications;
  }

  if (Array.isArray(response.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  return [];
};

/* =========================================================
   GET PAGINATION TOTAL
========================================================= */

const getPaginationTotal = (response) => {
  return (
    response?.pagination?.total ??
    response?.data?.pagination?.total ??
    response?.total ??
    response?.data?.total ??
    response?.data?.data?.total ??
    null
  );
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (date) => {
  if (!date) return "Không xác định";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return String(date);
  }

  return value.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   RELATIVE TIME
========================================================= */

const getRelativeTime = (date) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const diff = Date.now() - value.getTime();

  if (diff < 0) {
    return "Vừa xong";
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "Vừa xong";
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)} phút trước`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)} giờ trước`;
  }

  if (diff < 7 * day) {
    return `${Math.floor(diff / day)} ngày trước`;
  }

  return formatDate(date);
};

/* =========================================================
   PAGE
========================================================= */

const NotificationsCatePage = () => {
  /* =========================================================
     USER
  ========================================================= */

  const { user } = useUser();

  const userRole = String(user?.role || "").toLowerCase();

  const canDelete = userRole === "catechist";

  /* =========================================================
     STATE
  ========================================================= */

  const [loading, setLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
  });

  const [filter, setFilter] = useState("all");

  const [typeFilter, setTypeFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [paginationTotal, setPaginationTotal] = useState(null);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);

  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  /* =========================================================
     TYPE OPTIONS
  ========================================================= */

  const typeOptions = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả loại",
      },

      ...Object.entries(TYPE_CONFIG).map(([value, config]) => ({
        value,
        label: config.label,
      })),
    ],
    [],
  );

  /* =========================================================
     LOAD STATS
  ========================================================= */

  const loadStats = useCallback(async () => {
    try {
      const response = await notificationApi.getStats();

      const data = response?.data ?? response ?? {};

      setStats({
        total: Number(
          data.total ?? data.total_notifications ?? data.count ?? 0,
        ),

        unread: Number(
          data.unread ?? data.unread_count ?? data.total_unread ?? 0,
        ),

        read: Number(data.read ?? data.read_count ?? data.total_read ?? 0),
      });
    } catch (error) {
      console.error("GET NOTIFICATION STATS:", error);
    }
  }, []);

  /* =========================================================
     LOAD NOTIFICATIONS
  ========================================================= */

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pageSize,
      };

      if (filter === "unread") {
        params.is_read = 0;
      }

      if (filter === "read") {
        params.is_read = 1;
      }

      if (typeFilter !== "all") {
        params.type = typeFilter;
      }

      const response = await notificationApi.getAll(params);

      const list = getNotificationList(response)
        .map(normalizeNotification)
        .filter((item) => item && Number.isFinite(item.id) && item.id > 0)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

      setNotifications(list);

      const total = getPaginationTotal(response);

      if (total !== null) {
        setPaginationTotal(Number(total));
      } else {
        setPaginationTotal(list.length);
      }
    } catch (error) {
      console.error("GET NOTIFICATIONS:", error);

      message.error(
        error?.response?.data?.message || "Không thể tải danh sách thông báo",
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter, typeFilter]);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    await Promise.all([loadNotifications(), loadStats()]);
  };

  /* =========================================================
     MARK ONE AS READ
  ========================================================= */

  const handleMarkRead = async (notification) => {
    if (!notification?.id) return;

    if (notification.is_read) return;

    try {
      await notificationApi.markAsRead(notification.id);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : item,
        ),
      );

      setStats((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1,
      }));
    } catch (error) {
      console.error("MARK READ ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể đánh dấu đã đọc",
      );
    }
  };

  /* =========================================================
     OPEN DETAIL
  ========================================================= */

  const handleOpenDetail = async (notification) => {
    setSelectedNotification(notification);
    setDetailOpen(true);

    if (!notification.is_read) {
      await handleMarkRead(notification);
    }
  };

  /* =========================================================
     MARK ALL READ
  ========================================================= */

  const handleMarkAllRead = async () => {
    if (stats.unread <= 0) {
      message.info("Không có thông báo chưa đọc");
      return;
    }

    try {
      setActionLoading(true);

      await notificationApi.markAllAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at || new Date().toISOString(),
        })),
      );

      setStats((prev) => ({
        total: prev.total,
        unread: 0,
        read: prev.read + prev.unread,
      }));

      message.success("Đã đánh dấu tất cả thông báo là đã đọc");
    } catch (error) {
      console.error("MARK ALL READ ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể đánh dấu tất cả đã đọc",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     DELETE ONE
  ========================================================= */

  const handleDelete = async (notification) => {
    if (!canDelete) {
      message.warning("Chỉ giáo lý viên mới có quyền xóa thông báo");
      return;
    }

    if (!notification?.id) return;

    try {
      setActionLoading(true);

      await notificationApi.delete(notification.id);

      setNotifications((prev) =>
        prev.filter((item) => item.id !== notification.id),
      );

      setStats((prev) => ({
        total: Math.max(0, prev.total - 1),

        unread: notification.is_read
          ? prev.unread
          : Math.max(0, prev.unread - 1),

        read: notification.is_read ? Math.max(0, prev.read - 1) : prev.read,
      }));

      if (selectedNotification?.id === notification.id) {
        setSelectedNotification(null);
        setDetailOpen(false);
      }

      message.success("Đã xóa thông báo");
    } catch (error) {
      console.error("DELETE NOTIFICATION:", error);

      message.error(
        error?.response?.data?.message || "Không thể xóa thông báo",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     DELETE ALL
  ========================================================= */

  const handleDeleteAll = async () => {
    if (!canDelete) {
      message.warning("Chỉ giáo lý viên mới có quyền xóa thông báo");
      return;
    }

    try {
      setActionLoading(true);

      await notificationApi.deleteAll();

      setNotifications([]);

      setStats({
        total: 0,
        unread: 0,
        read: 0,
      });

      setPaginationTotal(0);

      setDeleteAllOpen(false);

      message.success("Đã xóa tất cả thông báo");
    } catch (error) {
      console.error("DELETE ALL NOTIFICATIONS:", error);

      message.error(
        error?.response?.data?.message || "Không thể xóa tất cả thông báo",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     TODAY
  ========================================================= */

  const handleToday = async () => {
    try {
      setLoading(true);

      const response = await notificationApi.getToday();

      const list = getNotificationList(response)
        .map(normalizeNotification)
        .filter((item) => item && Number.isFinite(item.id) && item.id > 0)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

      setNotifications(list);

      setPaginationTotal(list.length);

      message.success(`Có ${list.length} thông báo hôm nay`);
    } catch (error) {
      console.error("GET TODAY:", error);

      message.error(
        error?.response?.data?.message || "Không thể tải thông báo hôm nay",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const handlePageChange = (nextPage, nextPageSize) => {
    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
      setPage(1);
      return;
    }

    setPage(nextPage);
  };

  /* =========================================================
     STAT CARDS
  ========================================================= */

  const statCards = [
    {
      title: "Tổng thông báo",
      value: stats.total,
      icon: <BellOutlined />,
    },

    {
      title: "Chưa đọc",
      value: stats.unread,
      icon: <BellOutlined />,
    },

    {
      title: "Đã đọc",
      value: stats.read,
      icon: <CheckCircleOutlined />,
    },
  ];

  /* =========================================================
     RENDER NOTIFICATION
  ========================================================= */

  const renderNotification = (notification) => {
    const type = getTypeConfig(notification.type);

    const priority = getPriorityConfig(notification.priority);

    return (
      <List.Item
        key={notification.id}
        style={{
          padding: 0,
          border: 0,
          marginBottom: 14,
        }}
      >
        <div
          onClick={() => handleOpenDetail(notification)}
          style={{
            width: "100%",
            padding: 18,
            borderRadius: 18,

            border: notification.is_read
              ? "1px solid #E2E8F0"
              : "1px solid #F1D48A",

            background: notification.is_read ? "#FFFFFF" : "#FFFDF7",

            cursor: "pointer",

            boxShadow: notification.is_read
              ? "0 2px 8px rgba(15,23,42,.03)"
              : "0 4px 14px rgba(212,175,55,.08)",

            transition: "all .2s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            {/* ICON */}

            <Avatar
              size={50}
              icon={type.icon}
              style={{
                flexShrink: 0,

                background: notification.is_read ? "#F1F5F9" : "#FFF4C2",

                color: notification.is_read ? "#64748B" : "#B28A00",
              }}
            />

            {/* CONTENT */}

            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* TITLE + ACTION */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Space wrap size={7}>
                    <Text
                      strong
                      style={{
                        fontSize: 16,
                        color: "#1E293B",
                      }}
                    >
                      {notification.title}
                    </Text>

                    {!notification.is_read && (
                      <Badge status="processing" text="Mới" />
                    )}
                  </Space>

                  {/* TAGS */}

                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    <Tag
                      color={type.color}
                      icon={type.icon}
                      style={{
                        margin: 0,
                      }}
                    >
                      {type.label}
                    </Tag>

                    {notification.priority !== "normal" && (
                      <Tag
                        color={priority.color}
                        style={{
                          margin: 0,
                        }}
                      >
                        {priority.label}
                      </Tag>
                    )}
                  </div>

                  {/* CONTENT */}

                  <Paragraph
                    ellipsis={{
                      rows: 3,
                    }}
                    style={{
                      margin: "9px 0 0",
                      color: "#64748B",
                      lineHeight: 1.65,
                    }}
                  >
                    {notification.content || "Không có nội dung"}
                  </Paragraph>
                </div>

                {/* ACTIONS */}

                <Space size={2} onClick={(event) => event.stopPropagation()}>
                  <AppButton
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleOpenDetail(notification)}
                  />

                  {canDelete && (
                    <AppButton
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(notification)}
                    />
                  )}
                </Space>
              </div>

              {/* META */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 14,
                  marginTop: 10,
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  <CalendarOutlined />{" "}
                  {getRelativeTime(notification.created_at)}
                </Text>

                {notification.created_by && (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    <UserOutlined /> Người tạo: {notification.created_by}
                  </Text>
                )}

                {notification.related_type && (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    Liên kết: {notification.related_type}
                    {notification.related_id
                      ? ` #${notification.related_id}`
                      : ""}
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>
      </List.Item>
    );
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div
      style={{
        padding: 24,
      }}
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <PageHeroHeader
        icon={<BellOutlined />}
        title="Thông báo"
        description="Theo dõi và quản lý các thông báo trong hệ thống FaithEdu"
        extra={
          <Space wrap>
            <AppButton icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm mới
            </AppButton>

            <AppButton icon={<CalendarOutlined />} onClick={handleToday}>
              Hôm nay
            </AppButton>

            <AppButton
              type="primary"
              icon={<CheckOutlined />}
              loading={actionLoading}
              disabled={stats.unread === 0}
              onClick={handleMarkAllRead}
            >
              Đánh dấu đã đọc
            </AppButton>

            {canDelete && (
              <AppButton
                danger
                icon={<DeleteOutlined />}
                loading={actionLoading}
                onClick={() => setDeleteAllOpen(true)}
              >
                Xóa tất cả
              </AppButton>
            )}
          </Space>
        }
      />

      {/* =====================================================
          UNREAD ALERT
      ===================================================== */}

      {stats.unread > 0 && (
        <Alert
          showIcon
          type="info"
          icon={<BellOutlined />}
          message={
            <span>
              Bạn đang có <strong>{stats.unread}</strong> thông báo chưa đọc.
            </span>
          }
          style={{
            marginTop: 20,
            marginBottom: 20,
            borderRadius: 14,
          }}
        />
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: stats.unread > 0 ? 0 : 20,
          marginBottom: 20,
        }}
      >
        {statCards.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>

      {/* =====================================================
          FILTER
      ===================================================== */}

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          padding: 16,
          marginBottom: 16,
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Space wrap>
            <AppButton
              type={filter === "all" ? "primary" : "default"}
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
            >
              Tất cả
            </AppButton>

            <AppButton
              type={filter === "unread" ? "primary" : "default"}
              onClick={() => {
                setFilter("unread");
                setPage(1);
              }}
            >
              Chưa đọc
              {stats.unread > 0 && (
                <Badge
                  count={stats.unread}
                  size="small"
                  style={{
                    marginLeft: 7,
                  }}
                />
              )}
            </AppButton>

            <AppButton
              type={filter === "read" ? "primary" : "default"}
              onClick={() => {
                setFilter("read");
                setPage(1);
              }}
            >
              Đã đọc
            </AppButton>
          </Space>

          <Select
            value={typeFilter}
            options={typeOptions}
            style={{
              width: 190,
            }}
            onChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* =====================================================
          LIST
      ===================================================== */}

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 20,
          padding: 20,
          border: "1px solid #E2E8F0",
        }}
      >
        {loading ? (
          <div
            style={{
              minHeight: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spin size="large" tip="Đang tải thông báo..." />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo"
            style={{
              padding: "70px 20px",
            }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={renderNotification}
            pagination={{
              current: page,
              pageSize,
              total: paginationTotal ?? notifications.length,

              showSizeChanger: true,

              pageSizeOptions: [10, 20, 50],

              showTotal: (total) => `Tổng ${total} thông báo`,

              onChange: handlePageChange,
            }}
          />
        )}
      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      <AppDetailModal
        open={detailOpen}
        title="Chi tiết thông báo"
        onCancel={() => {
          setDetailOpen(false);
          setSelectedNotification(null);
        }}
      >
        {selectedNotification && (
          <>
            {(() => {
              const type = getTypeConfig(selectedNotification.type);

              const priority = getPriorityConfig(selectedNotification.priority);

              return (
                <>
                  {/* HEADER */}

                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: 18,
                      background: "#FFFDF7",
                      border: "1px solid #F1E6B8",
                      borderRadius: 16,
                      marginBottom: 20,
                    }}
                  >
                    <Avatar
                      size={54}
                      icon={type.icon}
                      style={{
                        background: "#FFF4C2",
                        color: "#B28A00",
                      }}
                    />

                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        strong
                        style={{
                          display: "block",
                          fontSize: 19,
                          color: "#1E293B",
                        }}
                      >
                        {selectedNotification.title}
                      </Text>

                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        <Tag color={type.color} icon={type.icon}>
                          {type.label}
                        </Tag>

                        {selectedNotification.priority !== "normal" && (
                          <Tag color={priority.color}>{priority.label}</Tag>
                        )}

                        <Tag
                          color={
                            selectedNotification.is_read ? "green" : "orange"
                          }
                        >
                          {selectedNotification.is_read ? "Đã đọc" : "Chưa đọc"}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  {/* CONTENT */}

                  <Paragraph
                    style={{
                      fontSize: 15,
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                      color: "#334155",
                    }}
                  >
                    {selectedNotification.content || "Không có nội dung"}
                  </Paragraph>

                  {/* META */}

                  <div
                    style={{
                      borderTop: "1px solid #E2E8F0",
                      paddingTop: 16,
                      marginTop: 20,
                    }}
                  >
                    <Space
                      direction="vertical"
                      size={9}
                      style={{
                        width: "100%",
                      }}
                    >
                      <Text type="secondary">
                        ID thông báo:{" "}
                        <Text strong>{selectedNotification.id}</Text>
                      </Text>

                      <Text type="secondary">
                        Người tạo:{" "}
                        <Text strong>
                          {selectedNotification.created_by ?? "Không xác định"}
                        </Text>
                      </Text>

                      <Text type="secondary">
                        Thời gian tạo:{" "}
                        <Text strong>
                          {formatDate(selectedNotification.created_at)}
                        </Text>
                      </Text>

                      {selectedNotification.read_at && (
                        <Text type="secondary">
                          Thời gian đọc:{" "}
                          <Text strong>
                            {formatDate(selectedNotification.read_at)}
                          </Text>
                        </Text>
                      )}

                      <Text type="secondary">
                        Mức độ:{" "}
                        <Tag color={priority.color}>{priority.label}</Tag>
                      </Text>

                      {selectedNotification.related_type && (
                        <Text type="secondary">
                          Loại liên kết:{" "}
                          <Text strong>
                            {selectedNotification.related_type}
                          </Text>
                        </Text>
                      )}

                      {selectedNotification.related_id && (
                        <Text type="secondary">
                          ID liên kết:{" "}
                          <Text strong>{selectedNotification.related_id}</Text>
                        </Text>
                      )}

                      <Text type="secondary">
                        Đường dẫn:{" "}
                        <Text strong>
                          {selectedNotification.action_url || "Không có"}
                        </Text>
                      </Text>
                    </Space>
                  </div>

                  {/* ACTION */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                      marginTop: 24,
                    }}
                  >
                    {canDelete && (
                      <AppButton
                        danger
                        icon={<DeleteOutlined />}
                        loading={actionLoading}
                        onClick={() => handleDelete(selectedNotification)}
                      >
                        Xóa thông báo
                      </AppButton>
                    )}
                  </div>
                </>
              );
            })()}
          </>
        )}
      </AppDetailModal>

      {/* =====================================================
          DELETE ALL MODAL
      ===================================================== */}

      <AppFormModal
        open={deleteAllOpen}
        title="Xóa tất cả thông báo"
        onCancel={() => setDeleteAllOpen(false)}
        onOk={handleDeleteAll}
        confirmLoading={actionLoading}
        okText="Xóa tất cả"
        cancelText="Hủy"
        okButtonProps={{
          danger: true,
        }}
      >
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="Bạn có chắc chắn muốn xóa tất cả thông báo?"
          description="Toàn bộ thông báo của tài khoản hiện tại sẽ bị xóa và không thể khôi phục."
        />
      </AppFormModal>
    </div>
  );
};

export default NotificationsCatePage;
