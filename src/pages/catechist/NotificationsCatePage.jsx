import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Empty,
  List,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  Tooltip,
  message,
} from "antd";

import {
  BellOutlined,
  CheckOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  WarningOutlined,
  TeamOutlined,
  SoundOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  ReadOutlined,
  NotificationOutlined,
  InfoCircleOutlined,
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
    color: "#1677ff",
    bg: "#e6f4ff",
    icon: <InfoCircleOutlined />,
  },

  announcement: {
    label: "Thông báo",
    color: "#d48806",
    bg: "#fff7e6",
    icon: <SoundOutlined />,
  },

  class: {
    label: "Lớp học",
    color: "#389e0d",
    bg: "#f6ffed",
    icon: <BookOutlined />,
  },

  attendance: {
    label: "Điểm danh",
    color: "#722ed1",
    bg: "#f9f0ff",
    icon: <CalendarOutlined />,
  },

  student: {
    label: "Học viên",
    color: "#08979c",
    bg: "#e6fffb",
    icon: <UserOutlined />,
  },

  catechist: {
    label: "Giáo lý viên",
    color: "#c41d7f",
    bg: "#fff0f6",
    icon: <TeamOutlined />,
  },

  exam: {
    label: "Bài thi",
    color: "#d46b08",
    bg: "#fff7e6",
    icon: <TrophyOutlined />,
  },

  achievement: {
    label: "Thành tích",
    color: "#d4b106",
    bg: "#fffbe6",
    icon: <TrophyOutlined />,
  },

  warning: {
    label: "Cảnh báo",
    color: "#cf1322",
    bg: "#fff1f0",
    icon: <WarningOutlined />,
  },

  security: {
    label: "Bảo mật",
    color: "#531dab",
    bg: "#f9f0ff",
    icon: <SafetyOutlined />,
  },
};

/* =========================================================
   PRIORITY CONFIG
========================================================= */

const PRIORITY_CONFIG = {
  low: {
    label: "Thấp",
    color: "#8c8c8c",
  },

  normal: {
    label: "Bình thường",
    color: "#1677ff",
  },

  high: {
    label: "Quan trọng",
    color: "#fa8c16",
  },

  urgent: {
    label: "Khẩn cấp",
    color: "#f5222d",
  },
};

/* =========================================================
   HELPERS
========================================================= */

const getTypeConfig = (type) => {
  return (
    TYPE_CONFIG[String(type || "system").toLowerCase()] || TYPE_CONFIG.system
  );
};

const getPriorityConfig = (priority) => {
  return (
    PRIORITY_CONFIG[String(priority || "normal").toLowerCase()] ||
    PRIORITY_CONFIG.normal
  );
};

const normalizeNotification = (item) => {
  if (!item) return null;

  const isRead =
    item.is_read === true ||
    item.is_read === 1 ||
    item.is_read === "1" ||
    item.is_read === "true";

  return {
    ...item,

    id: Number(item.id ?? item.notification_id),

    title: String(item.title || "Thông báo mới"),

    content: String(item.content || ""),

    type: String(item.type || "system").toLowerCase(),

    priority: String(item.priority || "normal").toLowerCase(),

    is_read: isRead,

    read_count: Number(item.read_count || 0),

    unread_count: Number(item.unread_count || 0),

    recipient_count: Number(item.recipient_count || 0),

    read_percent: Number(item.read_percent || 0),

    created_by_name: item.created_by_name || "Hệ thống",

    created_at: item.created_at || null,

    updated_at: item.updated_at || null,

    read_at: item.read_at || null,
  };
};

const getNotificationList = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) return response;

  if (Array.isArray(response.data)) return response.data;

  if (Array.isArray(response.notifications)) {
    return response.notifications;
  }

  if (Array.isArray(response.items)) return response.items;

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  return [];
};

const getPaginationTotal = (response) => {
  return (
    response?.pagination?.total ??
    response?.data?.pagination?.total ??
    response?.total ??
    response?.data?.total ??
    null
  );
};

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

const getRelativeTime = (date) => {
  if (!date) return "";

  const value = new Date(date);

  const diff = Date.now() - value.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Vừa xong";

  if (diff < hour) {
    return `${Math.floor(diff / minute)} phút trước`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)} giờ trước`;
  }

  if (diff < day * 7) {
    return `${Math.floor(diff / day)} ngày trước`;
  }

  return formatDate(date);
};

/* =========================================================
   AVATAR COLOR
========================================================= */

const getAvatarColor = (name = "") => {
  const colors = [
    "#1677ff",
    "#722ed1",
    "#eb2f96",
    "#13c2c2",
    "#52c41a",
    "#fa8c16",
  ];

  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const getInitial = (name = "") => {
  return String(name).charAt(0).toUpperCase();
};

/* =========================================================
   PAGE
========================================================= */

const NotificationsCatePage = () => {
  const { user } = useUser();

  const userRole = String(user?.role || "").toLowerCase();

  const canDelete =
    userRole === "catechist" ||
    userRole === "admin" ||
    userRole === "super_admin";

  /* ================= STATE ================= */

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

  const [paginationTotal, setPaginationTotal] = useState(0);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);

  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  /* =========================================================
     OPTIONS
  ========================================================= */

  const typeOptions = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả loại thông báo",
      },

      ...Object.entries(TYPE_CONFIG).map(([key, value]) => ({
        value: key,
        label: value.label,
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
        total: Number(data.total || 0),
        unread: Number(data.unread || 0),
        read: Number(data.read || data.read_count || 0),
      });
    } catch (error) {
      message.error("Lỗi khi tải thống kê thông báo:", error);
    }
  }, []);

  /* =========================================================
     LOAD LIST
  ========================================================= */

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pageSize,
      };

      if (filter === "unread") {
        params.unread_only = true;
      }

      if (typeFilter !== "all") {
        params.type = typeFilter;
      }

      const response = await notificationApi.getAll(params);

      const list = getNotificationList(response)
        .map(normalizeNotification)
        .filter(Boolean);

      setNotifications(list);

      setPaginationTotal(Number(getPaginationTotal(response) ?? list.length));
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể tải danh sách thông báo",
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter, typeFilter]);

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

    message.success("Đã cập nhật thông báo mới nhất");
  };

  /* =========================================================
     MARK READ
  ========================================================= */

  const handleMarkRead = async (notification) => {
    if (!notification?.id || notification.is_read) return;

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

      setSelectedNotification((prev) =>
        prev?.id === notification.id
          ? {
              ...prev,
              is_read: true,
              read_at: new Date().toISOString(),
            }
          : prev,
      );

      setStats((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1,
      }));
    } catch (error) {
      message.error("Không thể đánh dấu đã đọc");
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
     MARK ALL
  ========================================================= */

  const handleMarkAllRead = async () => {
    if (stats.unread === 0) {
      message.info("Bạn không còn thông báo chưa đọc");
      return;
    }

    try {
      setActionLoading(true);

      await notificationApi.markAllAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
        })),
      );

      setStats((prev) => ({
        ...prev,
        read: prev.read + prev.unread,
        unread: 0,
      }));

      message.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      message.error("Không thể thực hiện thao tác");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     DELETE ONE
  ========================================================= */

  const handleDelete = async (notification) => {
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

      setDetailOpen(false);

      message.success("Đã xóa thông báo");
    } catch (error) {
      message.error("Không thể xóa thông báo");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     DELETE ALL
  ========================================================= */

  const handleDeleteAll = async () => {
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

      message.success("Đã xóa toàn bộ thông báo");
    } catch (error) {
      message.error("Không thể xóa thông báo");
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
        .filter(Boolean);

      setNotifications(list);

      setPaginationTotal(list.length);

      message.success(`Tìm thấy ${list.length} thông báo hôm nay`);
    } catch (error) {
      message.error("Không thể tải thông báo hôm nay");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER CARD
  ========================================================= */

  const renderNotification = (notification) => {
    const type = getTypeConfig(notification.type);

    const priority = getPriorityConfig(notification.priority);

    const readPercent =
      notification.recipient_count > 0
        ? Math.round(
            (notification.read_count / notification.recipient_count) * 100,
          )
        : notification.read_percent || 0;

    return (
      <List.Item
        style={{
          padding: 0,
          border: 0,
          marginBottom: 14,
        }}
      >
        <div
          className={`notification-card ${
            !notification.is_read ? "notification-unread" : ""
          }`}
          onClick={() => handleOpenDetail(notification)}
          style={{
            width: "100%",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",

            background: notification.is_read ? "#fff" : "#f8fbff",

            border: notification.is_read
              ? "1px solid #eef1f5"
              : `1px solid ${type.color}35`,

            borderRadius: 18,

            transition: "all .25s ease",

            boxShadow: notification.is_read
              ? "0 3px 12px rgba(0,0,0,.025)"
              : "0 8px 24px rgba(22,119,255,.08)",
          }}
        >
          {/* LEFT PRIORITY BAR */}

          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 5,
              background: priority.color,
            }}
          />

          <div
            style={{
              padding: 20,
              paddingLeft: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              {/* TYPE ICON */}

              <div
                style={{
                  width: 52,
                  height: 52,

                  borderRadius: 16,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  flexShrink: 0,

                  background: type.bg,

                  color: type.color,

                  fontSize: 22,
                }}
              >
                {type.icon}
              </div>

              {/* MAIN */}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {/* TOP */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: 17,
                          color: "#1f2937",
                        }}
                      >
                        {notification.title}
                      </Text>

                      {!notification.is_read && (
                        <Badge
                          status="processing"
                          text={
                            <span
                              style={{
                                fontSize: 12,
                                color: "#1677ff",
                                fontWeight: 600,
                              }}
                            >
                              CHƯA ĐỌC
                            </span>
                          }
                        />
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        gap: 7,
                        flexWrap: "wrap",
                      }}
                    >
                      <Tag
                        style={{
                          margin: 0,
                          borderRadius: 20,
                          border: 0,
                          background: type.bg,
                          color: type.color,
                          padding: "3px 10px",
                        }}
                      >
                        {type.icon} {type.label}
                      </Tag>

                      {notification.priority !== "normal" && (
                        <Tag
                          style={{
                            margin: 0,
                            borderRadius: 20,
                            padding: "3px 10px",
                          }}
                          color={
                            notification.priority === "urgent"
                              ? "red"
                              : "orange"
                          }
                        >
                          {priority.label}
                        </Tag>
                      )}
                    </div>
                  </div>

                  {/* BUTTON */}

                  <Tooltip title="Xem chi tiết">
                    <AppButton
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenDetail(notification);
                      }}
                    />
                  </Tooltip>
                </div>

                {/* CONTENT */}

                <Paragraph
                  ellipsis={{
                    rows: 2,
                  }}
                  style={{
                    marginTop: 12,
                    marginBottom: 0,
                    color: "#64748b",
                    lineHeight: 1.7,
                  }}
                >
                  {notification.content || "Không có nội dung"}
                </Paragraph>

                {/* READ PROGRESS */}

                {notification.recipient_count > 0 && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: "12px 14px",
                      background: "#fafafa",
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 7,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                        }}
                      >
                        <EyeOutlined /> Người đã xem
                      </Text>

                      <Text
                        strong
                        style={{
                          fontSize: 12,
                        }}
                      >
                        {notification.read_count}/{notification.recipient_count}{" "}
                        người
                      </Text>
                    </div>

                    <Progress
                      percent={readPercent}
                      size="small"
                      showInfo={false}
                      strokeColor={type.color}
                    />
                  </div>
                )}

                {/* FOOTER */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    marginTop: 15,
                  }}
                >
                  <Space size={14} wrap>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Avatar
                        size={22}
                        style={{
                          background: getAvatarColor(
                            notification.created_by_name,
                          ),
                          fontSize: 10,
                        }}
                      >
                        {getInitial(notification.created_by_name)}
                      </Avatar>

                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                        }}
                      >
                        {notification.created_by_name}
                      </Text>
                    </div>

                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      <ClockCircleOutlined />{" "}
                      {getRelativeTime(notification.created_at)}
                    </Text>
                  </Space>

                  {!notification.is_read && (
                    <Text
                      style={{
                        color: "#1677ff",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Nhấn để xem
                    </Text>
                  )}
                </div>
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
        maxWidth: 1500,
        margin: "0 auto",
      }}
    >
      {/* HERO */}

      <PageHeroHeader
        icon={<NotificationOutlined />}
        title="Trung tâm thông báo"
        description="Cập nhật những thông tin mới nhất từ FaithEdu"
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
              disabled={stats.unread === 0}
              loading={actionLoading}
              onClick={handleMarkAllRead}
            >
              Đọc tất cả
            </AppButton>

            {canDelete && (
              <AppButton
                danger
                icon={<DeleteOutlined />}
                onClick={() => setDeleteAllOpen(true)}
              >
                Xóa tất cả
              </AppButton>
            )}
          </Space>
        }
      />

      {/* ALERT */}

      {stats.unread > 0 && (
        <Alert
          type="info"
          showIcon
          icon={<BellOutlined />}
          message={
            <span>
              Bạn có <strong style={{ fontSize: 16 }}>{stats.unread}</strong>{" "}
              thông báo chưa đọc
            </span>
          }
          description="Hãy kiểm tra các thông báo mới để không bỏ lỡ thông tin quan trọng."
          style={{
            marginTop: 20,
            borderRadius: 16,
          }}
        />
      )}

      {/* STATS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 16,
          margin: "20px 0",
        }}
      >
        <StatCard
          title="Tổng thông báo"
          value={stats.total}
          icon={<BellOutlined />}
        />

        <StatCard
          title="Chưa đọc"
          value={stats.unread}
          icon={<NotificationOutlined />}
        />

        <StatCard
          title="Đã đọc"
          value={stats.read}
          icon={<CheckCircleFilled />}
        />
      </div>

      {/* FILTER PANEL */}

      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #edf0f3",
          padding: 16,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
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
                    marginLeft: 8,
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
            onChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}
            style={{
              width: 210,
            }}
          />
        </div>
      </div>

      {/* LIST */}

      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          padding: 20,
          border: "1px solid #edf0f3",
          minHeight: 400,
        }}
      >
        {loading ? (
          <div
            style={{
              minHeight: 350,
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
            description="Chưa có thông báo nào"
            style={{
              padding: "90px 20px",
            }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={renderNotification}
            pagination={{
              current: page,
              pageSize,
              total: paginationTotal,

              showSizeChanger: true,

              pageSizeOptions: [10, 20, 50],

              showTotal: (total) => `Tổng cộng ${total} thông báo`,

              onChange: (nextPage, nextPageSize) => {
                if (nextPageSize !== pageSize) {
                  setPageSize(nextPageSize);
                  setPage(1);
                } else {
                  setPage(nextPage);
                }
              },
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
        showEdit={false}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedNotification(null);
        }}
      >
        {selectedNotification &&
          (() => {
            const type = getTypeConfig(selectedNotification.type);

            const priority = getPriorityConfig(selectedNotification.priority);

            const readPercent =
              selectedNotification.recipient_count > 0
                ? Math.round(
                    (selectedNotification.read_count /
                      selectedNotification.recipient_count) *
                      100,
                  )
                : selectedNotification.read_percent || 0;

            return (
              <div>
                {/* HEADER */}

                <div
                  style={{
                    padding: 22,
                    borderRadius: 18,
                    background: type.bg,
                    border: `1px solid ${type.color}25`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                    }}
                  >
                    <Avatar
                      size={56}
                      style={{
                        background: type.color,
                        fontSize: 22,
                      }}
                      icon={type.icon}
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
                          fontSize: 20,
                          lineHeight: 1.45,
                        }}
                      >
                        {selectedNotification.title}
                      </Text>

                      <Space
                        wrap
                        style={{
                          marginTop: 10,
                        }}
                      >
                        <Tag color="blue">{type.label}</Tag>

                        <Tag color={priority.color}>{priority.label}</Tag>

                        <Tag
                          color={
                            selectedNotification.is_read ? "success" : "warning"
                          }
                        >
                          {selectedNotification.is_read ? "Đã đọc" : "Chưa đọc"}
                        </Tag>
                      </Space>
                    </div>
                  </div>
                </div>

                {/* CONTENT */}

                <div
                  style={{
                    padding: "24px 4px",
                  }}
                >
                  <Paragraph
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: 15,
                      lineHeight: 1.9,
                      color: "#334155",
                      marginBottom: 0,
                    }}
                  >
                    {selectedNotification.content}
                  </Paragraph>
                </div>

                {/* VIEW STATS */}

                {selectedNotification.recipient_count > 0 && (
                  <div
                    style={{
                      background: "#fafafa",
                      borderRadius: 16,
                      padding: 18,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <Text strong>
                          <EyeOutlined /> Tình trạng người xem
                        </Text>

                        <div
                          style={{
                            marginTop: 3,
                          }}
                        >
                          <Text type="secondary">
                            Theo dõi mức độ tiếp cận thông báo
                          </Text>
                        </div>
                      </div>

                      <Text
                        strong
                        style={{
                          fontSize: 18,
                        }}
                      >
                        {readPercent}%
                      </Text>
                    </div>

                    <Progress percent={readPercent} strokeColor={type.color} />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 10,
                        marginTop: 16,
                      }}
                    >
                      <div>
                        <Text type="secondary">Đã đọc</Text>

                        <div>
                          <Text
                            strong
                            style={{
                              fontSize: 18,
                              color: "#52c41a",
                            }}
                          >
                            {selectedNotification.read_count}
                          </Text>
                        </div>
                      </div>

                      <div>
                        <Text type="secondary">Chưa đọc</Text>

                        <div>
                          <Text
                            strong
                            style={{
                              fontSize: 18,
                              color: "#fa8c16",
                            }}
                          >
                            {selectedNotification.unread_count}
                          </Text>
                        </div>
                      </div>

                      <div>
                        <Text type="secondary">Người nhận</Text>

                        <div>
                          <Text
                            strong
                            style={{
                              fontSize: 18,
                            }}
                          >
                            {selectedNotification.recipient_count}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* META */}

                <div
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 18,
                  }}
                >
                  <Space
                    direction="vertical"
                    size={12}
                    style={{
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Avatar
                        size={30}
                        style={{
                          background: getAvatarColor(
                            selectedNotification.created_by_name,
                          ),
                        }}
                      >
                        {getInitial(selectedNotification.created_by_name)}
                      </Avatar>

                      <div>
                        <Text type="secondary">Người tạo</Text>

                        <div>
                          <Text strong>
                            {selectedNotification.created_by_name}
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 30,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <Text type="secondary">
                          <CalendarOutlined /> Thời gian tạo
                        </Text>

                        <div>
                          <Text strong>
                            {formatDate(selectedNotification.created_at)}
                          </Text>
                        </div>
                      </div>

                      {selectedNotification.read_at && (
                        <div>
                          <Text type="secondary">
                            <ReadOutlined /> Bạn đã đọc lúc
                          </Text>

                          <div>
                            <Text strong>
                              {formatDate(selectedNotification.read_at)}
                            </Text>
                          </div>
                        </div>
                      )}
                    </div>
                  </Space>
                </div>

                {/* ACTION */}

                {canDelete && (
                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 18,
                      borderTop: "1px solid #f0f0f0",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <AppButton
                      danger
                      icon={<DeleteOutlined />}
                      loading={actionLoading}
                      onClick={() => handleDelete(selectedNotification)}
                    >
                      Xóa thông báo này
                    </AppButton>
                  </div>
                )}
              </div>
            );
          })()}
      </AppDetailModal>

      {/* DELETE ALL */}

      <AppFormModal
        open={deleteAllOpen}
        title="Xóa toàn bộ thông báo"
        onCancel={() => setDeleteAllOpen(false)}
        onOk={handleDeleteAll}
        confirmLoading={actionLoading}
        okText="Xóa toàn bộ"
        cancelText="Hủy"
        okButtonProps={{
          danger: true,
        }}
      >
        <Alert
          type="warning"
          showIcon
          message="Bạn có chắc chắn muốn xóa toàn bộ thông báo?"
          description="Các thông báo sẽ bị xóa khỏi tài khoản của bạn."
          style={{
            borderRadius: 12,
          }}
        />
      </AppFormModal>

      {/* CSS */}

      <style>
        {`
          .notification-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(15, 23, 42, .08) !important;
          }

          @media (max-width: 768px) {

            .notification-card {
              border-radius: 14px !important;
            }

          }
        `}
      </style>
    </div>
  );
};

export default NotificationsCatePage;
