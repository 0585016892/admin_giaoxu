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

const { Text, Title, Paragraph } = Typography;

/* =========================================================
   COLOR SYSTEM
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyDark: "#102C46",
  navyLight: "#EEF3F7",
  navySoft: "#F5F8FB",

  gold: "#D9A441",
  goldDark: "#B8862F",
  goldLight: "#FBF5E7",

  white: "#FFFFFF",
  background: "#F6F8FB",

  text: "#172B3A",
  textSecondary: "#6B7A89",
  muted: "#8A98A8",

  border: "#E4EAF0",
  borderDark: "#D5DEE8",

  danger: "#C93C3C",
  success: "#328A62",
};

/* =========================================================
   CONFIG
========================================================= */

const TYPE_CONFIG = {
  system: {
    label: "Hệ thống",
    color: "#2F6B9A",
    bg: "#EAF2F8",
    icon: <InfoCircleOutlined />,
  },

  announcement: {
    label: "Thông báo",
    color: "#B27A16",
    bg: "#FBF3DF",
    icon: <SoundOutlined />,
  },

  class: {
    label: "Lớp học",
    color: "#43815D",
    bg: "#EDF7F0",
    icon: <BookOutlined />,
  },

  attendance: {
    label: "Điểm danh",
    color: "#73569A",
    bg: "#F4EFF9",
    icon: <CalendarOutlined />,
  },

  student: {
    label: "Học viên",
    color: "#287C80",
    bg: "#EAF7F7",
    icon: <UserOutlined />,
  },

  catechist: {
    label: "Giáo lý viên",
    color: "#9A4D78",
    bg: "#F9EEF5",
    icon: <TeamOutlined />,
  },

  exam: {
    label: "Bài thi",
    color: "#A76621",
    bg: "#FAF1E7",
    icon: <TrophyOutlined />,
  },

  achievement: {
    label: "Thành tích",
    color: "#9B7A18",
    bg: "#FBF6DF",
    icon: <TrophyOutlined />,
  },

  warning: {
    label: "Cảnh báo",
    color: "#B83B3B",
    bg: "#FBECEC",
    icon: <WarningOutlined />,
  },

  security: {
    label: "Bảo mật",
    color: "#654A91",
    bg: "#F2EFF8",
    icon: <SafetyOutlined />,
  },
};

const PRIORITY_CONFIG = {
  low: {
    label: "Thấp",
    color: "#8793A0",
  },

  normal: {
    label: "Bình thường",
    color: COLORS.navy,
  },

  high: {
    label: "Quan trọng",
    color: COLORS.goldDark,
  },

  urgent: {
    label: "Khẩn cấp",
    color: COLORS.danger,
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
    "#2F6B9A",
    "#73569A",
    "#9A4D78",
    "#287C80",
    "#43815D",
    "#B27A16",
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

      if (filter === "unread") {
        params.unread_only = true;
      }

      if (filter === "read") {
        params.read_only = true;
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
          <div className="notifications-header-actions">
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
              Đọc tất cả
              {stats.unread > 0 && ` (${stats.unread})`}
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
          iconColor={COLORS.navy}
          description="Toàn bộ hệ thống"
        />

        <StatCard
          title="Chưa đọc"
          value={stats.unread}
          loading={loading}
          icon={<NotificationOutlined />}
          iconColor={COLORS.gold}
          description="Thông báo của bạn"
        />

        <StatCard
          title="Đã đọc"
          value={stats.read}
          loading={loading}
          icon={<CheckCircleFilled />}
          iconColor={COLORS.success}
          description="Thông báo của bạn"
        />
      </div>

      {/* ===================================================
          FILTER
      =================================================== */}

      <Card
        bordered={false}
        className="notifications-filter-card"
        bodyStyle={{ padding: 0 }}
      >
        <div className="filter-card-inner">
          <div className="filter-left">
            <div className="filter-title">
              <BellOutlined />
              <span>Bộ lọc</span>
            </div>

            <Radio.Group
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
                setSelectedNotification(null);
              }}
              optionType="button"
              buttonStyle="solid"
              className="notification-filter-radio"
            >
              <Radio.Button value="all">Tất cả</Radio.Button>

              <Radio.Button value="unread">
                Chưa đọc
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
              className="notification-type-select"
              suffixIcon={<BellOutlined />}
            />
          </div>

          <Input
            className="notifications-search"
            placeholder="Tìm kiếm thông báo..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </div>
      </Card>

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="notifications-main">
        {/* =================================================
            LEFT LIST
        ================================================= */}

        <Card
          bordered={false}
          className="notifications-list-card"
          bodyStyle={{
            padding: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="list-card-header">
            <div>
              <Text className="section-label">DANH SÁCH</Text>

              <Title level={5} className="list-card-title">
                Thông báo
              </Title>
            </div>

            <Tag className="total-tag">{paginationTotal} thông báo</Tag>
          </div>

          <Divider style={{ margin: 0 }} />

          <div className="notifications-list-body">
            {loading ? (
              <div className="notification-loading">
                <Spin />

                <Text>Đang tải thông báo...</Text>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="notification-empty">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có thông báo"
                />
              </div>
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
                      className={`notification-item ${
                        isSelected ? "selected" : ""
                      } ${!item.is_read ? "unread" : ""}`}
                      onClick={() => handleSelectNotification(item)}
                      style={{
                        "--item-accent": isSelected
                          ? COLORS.navy
                          : priority.color,
                      }}
                    >
                      <div className="notification-item-inner">
                        <div
                          className="notification-type-icon"
                          style={{
                            background: type.bg,
                            color: type.color,
                          }}
                        >
                          {type.icon}
                        </div>

                        <div className="notification-item-content">
                          <div className="notification-item-title-row">
                            <Text
                              ellipsis
                              strong={!item.is_read}
                              className="notification-item-title"
                            >
                              {item.title}
                            </Text>

                            {!item.is_read && <span className="unread-dot" />}
                          </div>

                          <Paragraph
                            ellipsis={{ rows: 1 }}
                            className="notification-item-description"
                          >
                            {item.content}
                          </Paragraph>

                          <div className="notification-item-meta">
                            <Tag
                              bordered={false}
                              style={{
                                background: type.bg,
                                color: type.color,
                              }}
                            >
                              {type.label}
                            </Tag>

                            <Text className="notification-time">
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

          <div className="notifications-pagination-footer">
            <Text>
              Trang <strong>{page}</strong>
            </Text>

            <Text>
              Tổng <strong>{paginationTotal}</strong>
            </Text>
          </div>
        </Card>

        {/* =================================================
            RIGHT DETAIL
        ================================================= */}

        <Card
          bordered={false}
          className="notifications-reader-card"
          bodyStyle={{
            padding: 0,
            height: "100%",
          }}
        >
          {selectedNotification ? (
            <div className="reader-wrapper">
              {/* DETAIL TOP */}

              <div className="reader-top">
                <div className="reader-top-left">
                  <span className="reader-label">
                    <ReadOutlined />
                    CHI TIẾT THÔNG BÁO
                  </span>

                  <Space size={8} wrap>
                    <Tag
                      className="detail-type-tag"
                      style={{
                        color: selectedType.color,
                        background: selectedType.bg,
                        borderColor: "transparent",
                      }}
                    >
                      {selectedType.icon}
                      {selectedType.label}
                    </Tag>

                    {selectedNotification.priority !== "normal" && (
                      <Tag
                        className="detail-priority-tag"
                        style={{
                          color: selectedPriority.color,
                          borderColor: `${selectedPriority.color}33`,
                          background: `${selectedPriority.color}10`,
                        }}
                      >
                        {selectedPriority.label}
                      </Tag>
                    )}
                  </Space>
                </div>

                {canDelete && (
                  <Tooltip title="Xóa thông báo">
                    <AppButton
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      loading={actionLoading}
                      onClick={() => handleDelete(selectedNotification)}
                      className="detail-delete-button"
                    />
                  </Tooltip>
                )}
              </div>

              {/* TITLE */}

              <div className="reader-content">
                <Title className="notification-detail-title">
                  {selectedNotification.title}
                </Title>

                {/* AUTHOR */}

                <div className="notification-author">
                  <Avatar
                    size={44}
                    style={{
                      background: getAvatarColor(
                        selectedNotification.created_by_name,
                      ),
                    }}
                  >
                    {getInitial(selectedNotification.created_by_name)}
                  </Avatar>

                  <div className="author-info">
                    <Text strong>{selectedNotification.created_by_name}</Text>

                    <Text className="author-date">
                      <ClockCircleOutlined />
                      {formatDate(selectedNotification.created_at)}
                    </Text>
                  </div>
                </div>

                <Divider />

                {/* CONTENT */}

                <div className="notification-content">
                  <Paragraph>
                    {selectedNotification.content ||
                      "Không có nội dung chi tiết."}
                  </Paragraph>
                </div>

                {/* READ PROGRESS */}

                {selectedNotification.recipient_count > 0 && (
                  <div className="notification-progress-section">
                    <div className="progress-heading">
                      <div>
                        <span className="progress-icon">
                          <ReadOutlined />
                        </span>

                        <div>
                          <Text strong>Tiến độ đọc thông báo</Text>

                          <Text className="progress-subtitle">
                            Mức độ tiếp cận của thông báo
                          </Text>
                        </div>
                      </div>

                      <div className="progress-number">
                        <strong>{readPercent}%</strong>

                        <span>
                          {selectedNotification.read_count}/
                          {selectedNotification.recipient_count} đã xem
                        </span>
                      </div>
                    </div>

                    <Progress
                      percent={readPercent}
                      strokeColor={COLORS.gold}
                      trailColor="#E9EEF3"
                      size="small"
                      showInfo={false}
                    />
                  </div>
                )}

                {/* META */}

                <div className="notification-detail-meta">
                  <div className="detail-meta-item">
                    <span>Danh mục</span>

                    <strong>{selectedType.label}</strong>
                  </div>

                  <div className="detail-meta-item">
                    <span>Mức độ</span>

                    <strong
                      style={{
                        color: selectedPriority.color,
                      }}
                    >
                      {selectedPriority.label}
                    </strong>
                  </div>

                  <div className="detail-meta-item">
                    <span>Trạng thái</span>

                    <strong
                      style={{
                        color: selectedNotification.is_read
                          ? COLORS.success
                          : COLORS.goldDark,
                      }}
                    >
                      {selectedNotification.is_read ? "Đã đọc" : "Chưa đọc"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="reader-empty">
              <div className="reader-empty-icon">
                <NotificationOutlined />
              </div>

              <Title level={4}>Chưa chọn thông báo</Title>

              <Text>
                Chọn một thông báo ở danh sách bên trái để xem nội dung
              </Text>
            </div>
          )}
        </Card>
      </div>

      {/* ===================================================
          CSS
      =================================================== */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .notifications-page {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding-bottom: 28px;
          color: ${COLORS.text};
        }

        /* =================================================
           HEADER
        ================================================= */

        .notifications-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* =================================================
           STATS
        ================================================= */

        .notifications-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin: 18px 0;
        }

        /* =================================================
           FILTER
        ================================================= */

        .notifications-filter-card {
          border-radius: 14px !important;
          border: 1px solid ${COLORS.border};
          box-shadow: none !important;
          margin-bottom: 16px;
          overflow: hidden;
          background: ${COLORS.white};
        }

        .filter-card-inner {
          min-height: 72px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .filter-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-title {
          display: flex;
          align-items: center;
          gap: 7px;
          color: ${COLORS.navy};
          font-size: 13px;
          font-weight: 700;
          padding-right: 4px;
        }

        .filter-title .anticon {
          color: ${COLORS.goldDark};
        }

        .notification-filter-radio .ant-radio-button-wrapper {
          height: 38px;
          line-height: 36px;
          border-color: ${COLORS.borderDark};
          color: ${COLORS.textSecondary};
          font-size: 13px;
          font-weight: 500;
        }

        .notification-filter-radio
        .ant-radio-button-wrapper:hover {
          color: ${COLORS.navy};
        }

        .notification-filter-radio
        .ant-radio-button-wrapper-checked {
          background: ${COLORS.navy} !important;
          border-color: ${COLORS.navy} !important;
          color: #fff !important;
        }

        .notification-type-select {
          min-width: 190px;
        }

        .notification-type-select .ant-select-selector {
          height: 38px !important;
          border-radius: 8px !important;
          border-color: ${COLORS.borderDark} !important;
          display: flex;
          align-items: center;
        }

        .notifications-search {
          width: 280px;
          height: 38px;
          border-radius: 8px;
          border-color: ${COLORS.borderDark};
        }

        .notifications-search:hover,
        .notifications-search:focus {
          border-color: ${COLORS.navy};
        }

        .notifications-search .anticon {
          color: ${COLORS.muted};
        }

        /* =================================================
           MAIN
        ================================================= */

        .notifications-main {
          display: grid;
          grid-template-columns: 420px minmax(0, 1fr);
          gap: 16px;
          align-items: stretch;
        }

        .notifications-list-card,
        .notifications-reader-card {
          height: 720px;
          border-radius: 14px !important;
          border: 1px solid ${COLORS.border};
          box-shadow: none !important;
          overflow: hidden;
          background: ${COLORS.white};
        }

        /* =================================================
           LIST HEADER
        ================================================= */

        .list-card-header {
          min-height: 78px;
          padding: 16px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .section-label {
          display: block;
          color: ${COLORS.goldDark};
          font-size: 10px;
          letter-spacing: 1.3px;
          font-weight: 800;
          margin-bottom: 3px;
        }

        .list-card-title {
          margin: 0 !important;
          color: ${COLORS.navyDark};
        }

        .total-tag {
          margin: 0;
          border: 1px solid ${COLORS.border};
          background: ${COLORS.navySoft};
          color: ${COLORS.navy};
          border-radius: 20px;
          font-size: 11px;
        }

        /* =================================================
           LIST
        ================================================= */

        .notifications-list-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 10px;
          background: #FAFBFC;
        }

        .notification-item {
          position: relative;
          margin-bottom: 7px;
          padding: 13px 13px 13px 15px;
          border-radius: 10px;
          border: 1px solid transparent;
          border-left: 3px solid var(--item-accent);
          background: ${COLORS.white};
          cursor: pointer;
          transition:
            background 0.18s ease,
            border-color 0.18s ease;
        }

        .notification-item:hover {
          background: ${COLORS.navySoft};
          border-color: ${COLORS.border};
        }

        .notification-item.selected {
          background: ${COLORS.navyLight};
          border-color: #C8D7E5;
        }

        .notification-item.unread {
          background: #FDFBF6;
        }

        .notification-item.selected.unread {
          background: ${COLORS.navyLight};
        }

        .notification-item-inner {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .notification-type-icon {
          width: 38px;
          height: 38px;
          min-width: 38px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .notification-item-content {
          min-width: 0;
          flex: 1;
        }

        .notification-item-title-row {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
        }

        .notification-item-title {
          min-width: 0;
          flex: 1;
          color: ${COLORS.navyDark};
          font-size: 13px;
          line-height: 1.4;
        }

        .unread-dot {
          width: 7px;
          height: 7px;
          min-width: 7px;
          border-radius: 50%;
          background: ${COLORS.gold};
        }

        .notification-item-description {
          margin: 5px 0 8px !important;
          color: ${COLORS.muted};
          font-size: 11px;
          line-height: 1.45;
        }

        .notification-item-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .notification-item-meta .ant-tag {
          margin: 0;
          padding: 1px 7px;
          border-radius: 5px;
          font-size: 9px;
          line-height: 18px;
        }

        .notification-time {
          color: ${COLORS.muted};
          font-size: 10px;
          white-space: nowrap;
        }

        .notification-loading {
          height: 100%;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 12px;
          color: ${COLORS.muted};
        }

        .notification-empty {
          min-height: 360px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .notifications-pagination-footer {
          min-height: 42px;
          padding: 10px 16px;
          border-top: 1px solid ${COLORS.border};
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: ${COLORS.white};
          color: ${COLORS.muted};
          font-size: 11px;
        }

        /* =================================================
           READER
        ================================================= */

        .reader-wrapper {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .reader-top {
          min-height: 82px;
          padding: 17px 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          border-bottom: 1px solid ${COLORS.border};
          background: ${COLORS.white};
        }

        .reader-top-left {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .reader-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: ${COLORS.goldDark};
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .detail-type-tag,
        .detail-priority-tag {
          margin: 0;
          border-radius: 6px;
          font-size: 11px;
          padding: 2px 8px;
        }

        .detail-delete-button {
          width: 36px;
          height: 36px;
        }

        .reader-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px 32px 34px;
        }

        .notification-detail-title {
          max-width: 850px;
          margin: 0 0 20px !important;
          color: ${COLORS.navyDark} !important;
          font-size: 27px !important;
          line-height: 1.35 !important;
        }

        .notification-author {
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 850px;
          padding: 11px 0;
        }

        .author-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .author-info > .ant-typography:first-child {
          color: ${COLORS.navyDark};
          font-size: 13px;
        }

        .author-date {
          display: flex;
          align-items: center;
          gap: 5px;
          color: ${COLORS.muted} !important;
          font-size: 11px;
        }

        .notification-content {
          max-width: 850px;
          min-height: 190px;
          color: ${COLORS.text};
        }

        .notification-content .ant-typography {
          margin: 0;
          white-space: pre-wrap;
          font-size: 15px;
          line-height: 1.85;
          color: ${COLORS.text};
        }

        /* =================================================
           PROGRESS
        ================================================= */

        .notification-progress-section {
          max-width: 850px;
          margin-top: 26px;
          padding: 17px 18px;
          border: 1px solid ${COLORS.border};
          border-radius: 10px;
          background: ${COLORS.navySoft};
        }

        .progress-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 12px;
        }

        .progress-heading > div:first-child {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: ${COLORS.goldLight};
          color: ${COLORS.goldDark};
        }

        .progress-heading > div:first-child > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .progress-subtitle {
          color: ${COLORS.muted};
          font-size: 10px;
        }

        .progress-number {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .progress-number strong {
          color: ${COLORS.navy};
          font-size: 18px;
        }

        .progress-number span {
          color: ${COLORS.muted};
          font-size: 10px;
        }

        /* =================================================
           DETAIL META
        ================================================= */

        .notification-detail-meta {
          max-width: 850px;
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid ${COLORS.border};
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .detail-meta-item {
          padding: 12px;
          border: 1px solid ${COLORS.border};
          border-radius: 8px;
          background: ${COLORS.white};
        }

        .detail-meta-item span {
          display: block;
          color: ${COLORS.muted};
          font-size: 10px;
          margin-bottom: 4px;
        }

        .detail-meta-item strong {
          color: ${COLORS.navyDark};
          font-size: 12px;
        }

        /* =================================================
           EMPTY READER
        ================================================= */

        .reader-empty {
          height: 100%;
          min-height: 500px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 30px;
        }

        .reader-empty-icon {
          width: 70px;
          height: 70px;
          margin-bottom: 18px;
          border-radius: 18px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: ${COLORS.navyLight};
          color: ${COLORS.navy};
          font-size: 28px;
        }

        .reader-empty .ant-typography {
          margin-bottom: 5px;
        }

        .reader-empty > span {
          color: ${COLORS.muted};
          font-size: 12px;
          max-width: 360px;
        }

        /* =================================================
           SCROLLBAR
        ================================================= */

        .notifications-list-body::-webkit-scrollbar,
        .reader-content::-webkit-scrollbar {
          width: 6px;
        }

        .notifications-list-body::-webkit-scrollbar-thumb,
        .reader-content::-webkit-scrollbar-thumb {
          background: #CBD5DF;
          border-radius: 10px;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1150px) {
          .notifications-main {
            grid-template-columns: 350px minmax(0, 1fr);
          }

          .notifications-search {
            width: 230px;
          }

          .reader-content {
            padding: 24px;
          }

          .notification-detail-title {
            font-size: 24px !important;
          }
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 768px) {
          .notifications-page {
            padding-bottom: 16px;
          }

          .notifications-header-actions {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .notifications-header-actions .ant-btn {
            width: 100%;
            padding-inline: 7px;
            font-size: 11px;
          }

          .notifications-stats {
            grid-template-columns: 1fr;
            gap: 10px;
            margin: 12px 0;
          }

          .filter-card-inner {
            flex-direction: column;
            align-items: stretch;
            padding: 12px;
          }

          .filter-left {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-title {
            display: none;
          }

          .notification-filter-radio {
            display: flex;
            width: 100%;
          }

          .notification-filter-radio
          .ant-radio-button-wrapper {
            flex: 1;
            text-align: center;
            padding-inline: 5px;
            font-size: 11px;
          }

          .notification-type-select {
            width: 100%;
          }

          .notifications-search {
            width: 100%;
          }

          .notifications-main {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .notifications-list-card {
            height: 430px;
          }

          .notifications-reader-card {
            height: auto;
            min-height: 560px;
          }

          .reader-top {
            padding: 14px 16px;
          }

          .reader-content {
            padding: 20px 16px 26px;
          }

          .notification-detail-title {
            font-size: 22px !important;
            line-height: 1.4 !important;
          }

          .notification-content {
            min-height: 140px;
          }

          .notification-content .ant-typography {
            font-size: 14px;
            line-height: 1.75;
          }

          .progress-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .progress-number {
            align-items: flex-start;
          }

          .notification-detail-meta {
            grid-template-columns: 1fr;
          }
        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 480px) {
          .notifications-header-actions {
            grid-template-columns: 1fr;
            gap: 6px;
          }

          .notifications-list-card {
            height: 390px;
          }

          .list-card-header {
            min-height: 66px;
            padding: 12px 14px;
          }

          .notification-item {
            padding: 11px 10px 11px 12px;
          }

          .notification-type-icon {
            width: 34px;
            height: 34px;
            min-width: 34px;
            font-size: 14px;
          }

          .notification-item-title {
            font-size: 12px;
          }

          .notification-item-description {
            font-size: 10px;
          }

          .notification-time {
            font-size: 9px;
          }

          .reader-top {
            padding: 12px;
          }

          .reader-content {
            padding: 18px 14px 22px;
          }

          .notification-detail-title {
            font-size: 20px !important;
          }

          .notification-author {
            padding: 8px 0;
          }

          .notification-progress-section {
            padding: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsCatePage;
