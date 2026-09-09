import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  Divider,
  Empty,
  Input,
  List,
  Modal,
  Progress,
  Radio,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CheckOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  NotificationOutlined,
  ReadOutlined,
  ReloadOutlined,
  SafetyOutlined,
  SearchOutlined,
  SoundOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import AppButton from "../../components/common/AppButton";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";

import notificationApi from "../../api/notificationApi";
import { useUser } from "../../context/UserContext";

/* =========================================================
   CONFIG
========================================================= */

const { Text, Title, Paragraph } = Typography;

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

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const diff = Date.now() - value.getTime();

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

  if (diff < day * 7) {
    return `${Math.floor(diff / day)} ngày trước`;
  }

  return formatDate(date);
};

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
   COMPONENT
========================================================= */

const NotificationsCatePage = () => {
  const { user } = useUser();

  const userRole = String(user?.role || "").toLowerCase();

  const canDelete =
    userRole === "catechist" ||
    userRole === "admin" ||
    userRole === "super_admin";

  /* =======================================================
     STATE
  ======================================================= */

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

  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);

  const pageSize = 10;

  const [paginationTotal, setPaginationTotal] = useState(0);

  const [selectedNotification, setSelectedNotification] = useState(null);

  /* =======================================================
     TYPE OPTIONS
  ======================================================= */

  const typeOptions = useMemo(() => {
    return [
      {
        value: "all",
        label: "Tất cả danh mục",
      },

      ...Object.entries(TYPE_CONFIG).map(([key, value]) => ({
        value: key,
        label: value.label,
      })),
    ];
  }, []);

  /* =======================================================
     LOAD STATS
  ======================================================= */

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
      console.error("Lỗi tải thống kê:", error);
    }
  }, []);

  /* =======================================================
     LOAD NOTIFICATIONS
  ======================================================= */

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pageSize,
      };

      /*
       * Bộ lọc trạng thái đọc
       */
      if (filter === "unread") {
        params.unread_only = true;
      }

      if (filter === "read") {
        params.read_only = true;
      }

      /*
       * Bộ lọc loại thông báo
       */
      if (typeFilter !== "all") {
        params.type = typeFilter;
      }

      const response = await notificationApi.getAll(params);

      const list = getNotificationList(response)
        .map(normalizeNotification)
        .filter(Boolean);

      setNotifications(list);

      setPaginationTotal(Number(getPaginationTotal(response) ?? list.length));

      /*
       * Nếu chưa chọn notification nào
       * thì tự động chọn notification đầu tiên
       */
      if (list.length > 0) {
        setSelectedNotification((current) => {
          if (!current) {
            return list[0];
          }

          const stillExists = list.some((item) => item.id === current.id);

          return stillExists ? current : list[0];
        });
      } else {
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);

      message.error(
        error?.response?.data?.message || "Không thể tải danh sách thông báo",
      );
    } finally {
      setLoading(false);
    }
  }, [page, filter, typeFilter]);

  /* =======================================================
     EFFECT
  ======================================================= */

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    await Promise.all([loadNotifications(), loadStats()]);

    message.success("Đã làm mới dữ liệu");
  };

  /* =======================================================
     MARK ONE AS READ
  ======================================================= */

  const handleMarkRead = async (notification) => {
    if (!notification?.id || notification.is_read) {
      return;
    }

    try {
      await notificationApi.markAsRead(notification.id);

      const updatedItem = {
        ...notification,

        is_read: true,

        read_at: new Date().toISOString(),
      };

      setNotifications((prev) =>
        prev.map((item) => (item.id === notification.id ? updatedItem : item)),
      );

      setSelectedNotification((current) =>
        current?.id === notification.id ? updatedItem : current,
      );

      setStats((prev) => ({
        ...prev,

        unread: Math.max(0, prev.unread - 1),

        read: prev.read + 1,
      }));
    } catch (error) {
      console.error(error);

      message.error(
        error?.response?.data?.message || "Không thể đánh dấu đã đọc",
      );
    }
  };

  /* =======================================================
     SELECT NOTIFICATION
  ======================================================= */

  const handleSelectNotification = async (item) => {
    setSelectedNotification(item);

    if (!item.is_read) {
      await handleMarkRead(item);
    }
  };

  /* =======================================================
     MARK ALL READ
  ======================================================= */

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
          read_at: item.read_at || new Date().toISOString(),
        })),
      );

      setSelectedNotification((prev) =>
        prev
          ? {
              ...prev,
              is_read: true,
              read_at: prev.read_at || new Date().toISOString(),
            }
          : null,
      );

      setStats((prev) => ({
        ...prev,

        read: prev.read + prev.unread,

        unread: 0,
      }));

      message.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      console.error(error);

      message.error(error?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     DELETE ONE
  ======================================================= */

  const handleDelete = async (notification) => {
    if (!notification?.id) {
      return;
    }

    Modal.confirm({
      title: "Xóa thông báo này?",

      content: "Thông báo sẽ bị xóa và không thể khôi phục.",

      okText: "Xóa",

      okType: "danger",

      cancelText: "Hủy",

      onOk: async () => {
        try {
          setActionLoading(true);

          await notificationApi.delete(notification.id);

          const filtered = notifications.filter(
            (item) => item.id !== notification.id,
          );

          setNotifications(filtered);

          if (selectedNotification?.id === notification.id) {
            setSelectedNotification(filtered[0] || null);
          }

          setStats((prev) => ({
            total: Math.max(0, prev.total - 1),

            unread: notification.is_read
              ? prev.unread
              : Math.max(0, prev.unread - 1),

            read: notification.is_read ? Math.max(0, prev.read - 1) : prev.read,
          }));

          setPaginationTotal((prev) => Math.max(0, prev - 1));

          message.success("Đã xóa thông báo");
        } catch (error) {
          console.error(error);

          message.error(
            error?.response?.data?.message || "Không thể xóa thông báo",
          );
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  /* =======================================================
     DELETE ALL
  ======================================================= */

  const handleDeleteAll = () => {
    Modal.confirm({
      title: "Xác nhận xóa tất cả thông báo?",

      content: "Hành động này không thể hoàn tác.",

      okText: "Xóa toàn bộ",

      okType: "danger",

      cancelText: "Hủy",

      onOk: async () => {
        try {
          setActionLoading(true);

          await notificationApi.deleteAll();

          setNotifications([]);

          setSelectedNotification(null);

          setStats({
            total: 0,
            unread: 0,
            read: 0,
          });

          setPaginationTotal(0);

          message.success("Đã xóa toàn bộ thông báo");
        } catch (error) {
          console.error(error);

          message.error(
            error?.response?.data?.message || "Lỗi khi xóa thông báo",
          );
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const displayedNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return notifications;
    }

    return notifications.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.created_by_name.toLowerCase().includes(query)
      );
    });
  }, [notifications, searchQuery]);

  /* =======================================================
     SELECTED DETAIL
  ======================================================= */

  const selectedType = selectedNotification
    ? getTypeConfig(selectedNotification.type)
    : null;

  const selectedPriority = selectedNotification
    ? getPriorityConfig(selectedNotification.priority)
    : null;

  const readPercent = selectedNotification
    ? selectedNotification.recipient_count > 0
      ? Math.round(
          (selectedNotification.read_count /
            selectedNotification.recipient_count) *
            100,
        )
      : selectedNotification.read_percent || 0
    : 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="notifications-page">
      {/* ===================================================
          HEADER
      =================================================== */}

      <PageHeroHeader
        icon={<NotificationOutlined />}
        title="Trung tâm thông báo"
        description="Theo dõi tin tức, sự kiện và các cập nhật quan trọng từ FaithEdu"
        extra={
          <div className="notifications-page-header-extra">
            <Space wrap>
              <AppButton
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                disabled={loading}
              >
                Làm mới
              </AppButton>

              <AppButton
                type="primary"
                icon={<CheckOutlined />}
                disabled={stats.unread === 0 || actionLoading}
                loading={actionLoading}
                onClick={handleMarkAllRead}
              >
                Đọc tất cả ({stats.unread})
              </AppButton>

              {canDelete && (
                <AppButton
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteAll}
                  disabled={actionLoading}
                >
                  Xóa tất cả
                </AppButton>
              )}
            </Space>
          </div>
        }
      />

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="notifications-stats">
        <StatCard
          title="Tổng thông báo"
          value={stats.total}
          loading={loading}
          icon={<BellOutlined />}
          iconColor="#FF6B8B"
          description="Toàn bộ hệ thống"
        />

        <StatCard
          title="Chưa đọc"
          value={stats.unread}
          loading={loading}
          icon={<NotificationOutlined />}
          iconColor="#FF6B8B"
          description="Thông báo của bạn"
        />

        <StatCard
          title="Đã đọc"
          value={stats.read}
          loading={loading}
          icon={<CheckCircleFilled />}
          iconColor="#FF6B8B"
          description="Thông báo của bạn"
        />
      </div>

      {/* ===================================================
          FILTER
      =================================================== */}

      <Card
        bordered={false}
        className="notifications-filter-card"
        bodyStyle={{
          padding: "12px 20px",
        }}
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div className="notifications-filter">
          <div className="notifications-filter-left">
            <Radio.Group
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
                setSelectedNotification(null);
              }}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="all">Tất cả</Radio.Button>

              <Radio.Button value="unread">
                Chưa đọc{" "}
                {stats.unread > 0 && (
                  <Badge
                    count={stats.unread}
                    overflowCount={99}
                    offset={[5, -2]}
                  />
                )}
              </Radio.Button>

              <Radio.Button value="read">Đã đọc</Radio.Button>
            </Radio.Group>

            <Select
              value={typeFilter}
              options={typeOptions}
              onChange={(value) => {
                setTypeFilter(value);
                setPage(1);
                setSelectedNotification(null);
              }}
              style={{
                width: 180,
              }}
            />
          </div>

          <Input
            className="notifications-search"
            placeholder="Tìm kiếm thông báo..."
            prefix={
              <SearchOutlined
                style={{
                  color: "#bfbfbf",
                }}
              />
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{
              borderRadius: 8,
            }}
          />
        </div>
      </Card>

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="notifications-main">
        {/* =================================================
            LEFT - LIST
        ================================================= */}

        <Card
          bordered={false}
          className="notifications-list-card"
          bodyStyle={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div className="notifications-list-body">
            {loading ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                }}
              >
                <Spin tip="Đang tải..." />
              </div>
            ) : displayedNotifications.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có thông báo"
                style={{
                  margin: "60px 0",
                }}
              />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={displayedNotifications}
                split={false}
                renderItem={(item) => {
                  const type = getTypeConfig(item.type);

                  const priority = getPriorityConfig(item.priority);

                  const isSelected = selectedNotification?.id === item.id;

                  return (
                    <div
                      className="notification-item"
                      onClick={() => handleSelectNotification(item)}
                      style={{
                        backgroundColor: isSelected
                          ? "#e6f4ff"
                          : item.is_read
                            ? "#fff"
                            : "#f0f7ff",

                        borderLeft: `4px solid ${
                          isSelected ? "#1677ff" : priority.color
                        }`,

                        border: isSelected
                          ? "1px solid #91caff"
                          : "1px solid #f0f0f0",
                      }}
                    >
                      <div className="notification-item-inner">
                        {/* ICON */}

                        <Avatar
                          style={{
                            backgroundColor: type.bg,

                            color: type.color,

                            flexShrink: 0,
                          }}
                          icon={type.icon}
                        />

                        {/* CONTENT */}

                        <div className="notification-item-content">
                          <div className="notification-item-title-row">
                            <Text
                              ellipsis
                              strong={!item.is_read}
                              className="notification-item-title"
                              style={{
                                fontSize: 14,

                                color: item.is_read ? "#434343" : "#1f1f1f",
                              }}
                            >
                              {item.title}
                            </Text>

                            {!item.is_read && (
                              <Badge
                                status="processing"
                                style={{
                                  marginLeft: 6,
                                }}
                              />
                            )}
                          </div>

                          <Paragraph
                            ellipsis={{
                              rows: 1,
                            }}
                            type="secondary"
                            style={{
                              fontSize: 12,
                              margin: "4px 0 6px",
                              color: "#8c8c8c",
                            }}
                          >
                            {item.content}
                          </Paragraph>

                          <div className="notification-item-meta">
                            <Tag
                              bordered={false}
                              style={{
                                margin: 0,
                                fontSize: 10,
                                padding: "0 6px",
                                backgroundColor: type.bg,
                                color: type.color,
                              }}
                            >
                              {type.label}
                            </Tag>

                            <Text
                              type="secondary"
                              style={{
                                fontSize: 11,
                              }}
                            >
                              {getRelativeTime(item.created_at)}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </div>

          {/* PAGINATION */}

          <div className="notifications-pagination-footer">
            <Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              Tổng: {paginationTotal}
            </Text>
          </div>
        </Card>

        {/* =================================================
            RIGHT - DETAIL
        ================================================= */}

        <Card
          bordered={false}
          className="notifications-reader-card"
          bodyStyle={{
            padding: 28,
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
          }}
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          {selectedNotification ? (
            <div>
              {/* DETAIL HEADER */}

              <div className="notification-detail-header">
                <Space size={8} wrap>
                  <Tag
                    color={selectedType.color}
                    style={{
                      borderRadius: 12,
                      padding: "2px 10px",
                      fontSize: 12,
                    }}
                  >
                    {selectedType.icon} {selectedType.label}
                  </Tag>

                  {selectedNotification.priority !== "normal" && (
                    <Tag
                      color={
                        selectedNotification.priority === "urgent"
                          ? "red"
                          : "orange"
                      }
                      style={{
                        borderRadius: 12,
                        padding: "2px 10px",
                        fontSize: 12,
                      }}
                    >
                      {selectedPriority.label}
                    </Tag>
                  )}
                </Space>

                {canDelete && (
                  <Tooltip title="Xóa thông báo">
                    <AppButton
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      loading={actionLoading}
                      onClick={() => handleDelete(selectedNotification)}
                    />
                  </Tooltip>
                )}
              </div>

              {/* TITLE */}

              <Title
                level={3}
                className="notification-detail-title"
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                }}
              >
                {selectedNotification.title}
              </Title>

              {/* AUTHOR */}

              <div className="notification-author">
                <Avatar
                  style={{
                    backgroundColor: getAvatarColor(
                      selectedNotification.created_by_name,
                    ),
                  }}
                >
                  {getInitial(selectedNotification.created_by_name)}
                </Avatar>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Text
                    strong
                    style={{
                      display: "block",
                      fontSize: 13,
                    }}
                  >
                    {selectedNotification.created_by_name}
                  </Text>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    <ClockCircleOutlined
                      style={{
                        marginRight: 4,
                      }}
                    />

                    {formatDate(selectedNotification.created_at)}
                  </Text>
                </div>
              </div>

              {/* CONTENT */}

              <div className="notification-content">
                <Paragraph
                  style={{
                    whiteSpace: "pre-wrap",
                    marginBottom: 0,
                  }}
                >
                  {selectedNotification.content ||
                    "Không có nội dung chi tiết."}
                </Paragraph>
              </div>

              {/* READ PROGRESS */}

              {selectedNotification.recipient_count > 0 && (
                <>
                  <Divider
                    style={{
                      margin: "24px 0 16px",
                    }}
                  />

                  <div className="notification-progress">
                    <div className="notification-progress-header">
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 13,
                        }}
                      >
                        <ReadOutlined
                          style={{
                            marginRight: 6,
                          }}
                        />
                        Tiến độ đọc thông báo
                      </Text>

                      <Text
                        strong
                        style={{
                          fontSize: 13,
                        }}
                      >
                        {selectedNotification.read_count} /{" "}
                        {selectedNotification.recipient_count} đã xem (
                        {readPercent}%)
                      </Text>
                    </div>

                    <Progress
                      percent={readPercent}
                      strokeColor={selectedType.color}
                      size="small"
                      showInfo={false}
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              style={{
                height: "100%",
                minHeight: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chọn một thông báo ở danh sách bên trái để xem nội dung"
              />
            </div>
          )}
        </Card>
      </div>

      {/* ===================================================
          RESPONSIVE CSS
      =================================================== */}

      <style>{`
        /* ================================================
           BASE
        ================================================= */

        .notifications-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding-bottom: 24px;
        }

        /* ================================================
           STATS
        ================================================= */

        .notifications-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin: 16px 0 20px;
        }

        /* ================================================
           FILTER
        ================================================= */

        .notifications-filter-card {
          margin-bottom: 16px;
        }

        .notifications-filter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .notifications-filter-left {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .notifications-search {
          width: 260px;
        }

        /* ================================================
           MAIN
        ================================================= */

        .notifications-main {
          display: grid;
          grid-template-columns: 400px minmax(0, 1fr);
          gap: 16px;
          align-items: stretch;
        }

        .notifications-list-card,
        .notifications-reader-card {
          height: 720px;
        }

        /* ================================================
           LIST
        ================================================= */

        .notifications-list-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          min-height: 0;
        }

        .notification-item {
          padding: 12px 14px;
          border-radius: 10px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .notification-item:hover {
          transform: translateY(-1px);
        }

        .notification-item-inner {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .notification-item-content {
          flex: 1;
          min-width: 0;
        }

        .notification-item-title-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
        }

        .notification-item-title {
          min-width: 0;
        }

        .notification-item-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .notifications-pagination-footer {
          padding: 10px 16px;
          border-top: 1px solid #f0f0f0;
          text-align: right;
          background: #fafafa;
          border-radius: 0 0 12px 12px;
        }

        /* ================================================
           READER
        ================================================= */

        .notification-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .notification-author {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #fafafa;
          border-radius: 10px;
          margin-bottom: 24px;
        }

        .notification-content {
          min-height: 200px;
          font-size: 15px;
          line-height: 1.8;
          color: #262626;
        }

        .notification-progress {
          padding: 16px;
          background: #f9f9f9;
          border-radius: 10px;
          border: 1px solid #f0f0f0;
        }

        .notification-progress-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        /* ================================================
           TABLET
        ================================================= */

        @media (max-width: 1100px) {

          .notifications-main {
            grid-template-columns: 340px minmax(0, 1fr);
          }

          .notifications-search {
            width: 220px;
          }

          .notifications-reader-card {
            height: 720px;
          }

          .notifications-reader-card .ant-card-body {
            padding: 22px !important;
          }
        }

        /* ================================================
           MOBILE
        ================================================= */

        @media (max-width: 768px) {

          .notifications-page {
            padding-bottom: 16px;
          }

          /* ---------------------------------------------
             HEADER
          --------------------------------------------- */

          .notifications-page-header-extra {
            width: 100%;
          }

          .notifications-page-header-extra
          .ant-space {
            width: 100%;
          }

          .notifications-page-header-extra
          .ant-space-item {
            flex: 1;
          }

          .notifications-page-header-extra
          button {
            width: 100%;
          }

          /* ---------------------------------------------
             STATS
          --------------------------------------------- */

          .notifications-stats {
            grid-template-columns: 1fr;
            gap: 10px;
            margin: 12px 0 14px;
          }

          /* ---------------------------------------------
             FILTER
          --------------------------------------------- */

          .notifications-filter-card {
            margin-bottom: 12px;
          }

          .notifications-filter-card
          .ant-card-body {
            padding: 12px !important;
          }

          .notifications-filter {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .notifications-filter-left {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .notifications-filter-left
          .ant-radio-group {
            width: 100%;
            display: flex;
          }

          .notifications-filter-left
          .ant-radio-button-wrapper {
            flex: 1;
            text-align: center;
            padding-inline: 5px;
            font-size: 12px;
          }

          .notifications-filter-left
          .ant-select {
            width: 100% !important;
          }

          .notifications-search {
            width: 100%;
          }

          /* ---------------------------------------------
             MAIN
          --------------------------------------------- */

          .notifications-main {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          /* ---------------------------------------------
             LIST
          --------------------------------------------- */

          .notifications-list-card {
            height: 430px;
          }

          .notifications-list-body {
            padding: 8px;
          }

          .notification-item {
            padding: 11px 10px;
            margin-bottom: 6px;
          }

          .notification-item-inner {
            gap: 9px;
          }

          .notification-item-inner
          .ant-avatar {
            width: 34px !important;
            height: 34px !important;
            min-width: 34px !important;
            line-height: 34px !important;
          }

          .notification-item-title-row {
            gap: 4px;
          }

          .notification-item-title {
            font-size: 13px !important;
          }

          .notification-item-content
          .ant-typography {
            font-size: 11px !important;
          }

          .notification-item-meta {
            gap: 4px;
          }

          .notification-item-meta
          .ant-tag {
            font-size: 9px !important;
          }

          .notification-item-meta
          .ant-typography {
            font-size: 10px !important;
          }

          .notifications-pagination-footer {
            padding: 8px 12px;
          }

          /* ---------------------------------------------
             READER
          --------------------------------------------- */

          .notifications-reader-card {
            height: auto;
            min-height: 500px;
          }

          .notifications-reader-card
          .ant-card-body {
            padding: 18px 16px !important;
          }

          .notification-detail-header {
            margin-bottom: 12px;
          }

          .notification-detail-header
          .ant-tag {
            font-size: 11px;
            padding: 1px 8px;
          }

          .notification-detail-title {
            font-size: 22px !important;
            line-height: 1.35 !important;
            margin-bottom: 14px !important;
          }

          .notification-author {
            padding: 10px 12px;
            margin-bottom: 18px;
          }

          .notification-content {
            min-height: 150px;
            font-size: 14px;
            line-height: 1.75;
          }

          .notification-progress {
            padding: 12px;
          }

          .notification-progress-header {
            flex-direction: column;
            gap: 4px;
          }
        }

        /* ================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 480px) {

          .notifications-page {
            padding-bottom: 12px;
          }

          .notifications-stats {
            gap: 8px;
          }

          /* ---------------------------------------------
             HEADER BUTTONS
          --------------------------------------------- */

          .notifications-page-header-extra
          .ant-space {
            gap: 6px !important;
          }

          .notifications-page-header-extra
          .ant-space-item {
            flex: 1;
            min-width: 0;
          }

          .notifications-page-header-extra
          button {
            font-size: 11px;
            padding-inline: 8px;
          }

          /* ---------------------------------------------
             FILTER
          --------------------------------------------- */

          .notifications-filter-left
          .ant-radio-button-wrapper {
            font-size: 11px;
            padding-inline: 4px;
          }

          /* ---------------------------------------------
             LIST
          --------------------------------------------- */

          .notifications-list-card {
            height: 390px;
          }

          .notification-item {
            padding: 9px 8px;
          }

          .notification-item-inner {
            gap: 8px;
          }

          /* ---------------------------------------------
             READER
          --------------------------------------------- */

          .notifications-reader-card
          .ant-card-body {
            padding: 16px 14px !important;
          }

          .notification-detail-title {
            font-size: 20px !important;
          }

          .notification-content {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsCatePage;
