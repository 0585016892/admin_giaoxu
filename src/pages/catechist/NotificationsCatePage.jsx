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
   CONFIGS & HELPERS
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

const PRIORITY_CONFIG = {
  low: { label: "Thấp", color: "#8c8c8c" },
  normal: { label: "Bình thường", color: "#1677ff" },
  high: { label: "Quan trọng", color: "#fa8c16" },
  urgent: { label: "Khẩn cấp", color: "#f5222d" },
};

const getTypeConfig = (type) =>
  TYPE_CONFIG[String(type || "system").toLowerCase()] || TYPE_CONFIG.system;

const getPriorityConfig = (priority) =>
  PRIORITY_CONFIG[String(priority || "normal").toLowerCase()] ||
  PRIORITY_CONFIG.normal;

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
  if (Array.isArray(response.notifications)) return response.notifications;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data?.data)) return response.data.data;
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
  if (Number.isNaN(value.getTime())) return String(date);
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
  if (diff < hour) return `${Math.floor(diff / minute)} phút trước`;
  if (diff < day) return `${Math.floor(diff / hour)} giờ trước`;
  if (diff < day * 7) return `${Math.floor(diff / day)} ngày trước`;
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

const getInitial = (name = "") => String(name).charAt(0).toUpperCase();

/* =========================================================
   MAIN COMPONENT
========================================================= */

const NotificationsCatePage = () => {
  const { user } = useUser();
  const userRole = String(user?.role || "").toLowerCase();
  const canDelete =
    userRole === "catechist" ||
    userRole === "admin" ||
    userRole === "super_admin";

  /* State */
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });

  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [paginationTotal, setPaginationTotal] = useState(0);

  const [selectedNotification, setSelectedNotification] = useState(null);

  /* Select Options */
  const typeOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả danh mục" },
      ...Object.entries(TYPE_CONFIG).map(([key, value]) => ({
        value: key,
        label: value.label,
      })),
    ],
    [],
  );

  /* Load Stats */
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

  /* Load Notifications */
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: pageSize };
      if (filter === "unread") params.unread_only = true;
      if (typeFilter !== "all") params.type = typeFilter;

      const response = await notificationApi.getAll(params);
      const list = getNotificationList(response)
        .map(normalizeNotification)
        .filter(Boolean);

      setNotifications(list);
      setPaginationTotal(Number(getPaginationTotal(response) ?? list.length));

      // Mặc định chọn item đầu tiên nếu chưa chọn item nào
      if (list.length > 0 && !selectedNotification) {
        setSelectedNotification(list[0]);
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể tải danh sách thông báo",
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter, typeFilter, selectedNotification]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /* Actions */
  const handleRefresh = async () => {
    await Promise.all([loadNotifications(), loadStats()]);
    message.success("Đã làm mới dữ liệu");
  };

  const handleMarkRead = async (notification) => {
    if (!notification?.id || notification.is_read) return;

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

      if (selectedNotification?.id === notification.id) {
        setSelectedNotification(updatedItem);
      }

      setStats((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1,
      }));
    } catch (error) {
      message.error("Không thể đánh dấu đã đọc");
    }
  };

  const handleSelectNotification = async (item) => {
    setSelectedNotification(item);
    if (!item.is_read) {
      await handleMarkRead(item);
    }
  };

  const handleMarkAllRead = async () => {
    if (stats.unread === 0) {
      message.info("Bạn không còn thông báo chưa đọc");
      return;
    }

    try {
      setActionLoading(true);
      await notificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true })),
      );
      if (selectedNotification) {
        setSelectedNotification((prev) =>
          prev ? { ...prev, is_read: true } : null,
        );
      }
      setStats((prev) => ({
        ...prev,
        read: prev.read + prev.unread,
        unread: 0,
      }));
      message.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      message.error("Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (notification) => {
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

      message.success("Đã xóa thông báo");
    } catch (error) {
      message.error("Không thể xóa thông báo");
    } finally {
      setActionLoading(false);
    }
  };

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
          setStats({ total: 0, unread: 0, read: 0 });
          setPaginationTotal(0);
          message.success("Đã xóa toàn bộ thông báo");
        } catch (error) {
          message.error("Lỗi khi xóa thông báo");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  /* Client-side search filtering */
  const displayedNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const query = searchQuery.toLowerCase();
    return notifications.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.created_by_name.toLowerCase().includes(query),
    );
  }, [notifications, searchQuery]);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 24 }}>
      {/* PAGE HEADER */}
      <PageHeroHeader
        icon={<NotificationOutlined />}
        title="Trung tâm thông báo"
        description="Theo dõi tin tức, sự kiện và các cập nhật quan trọng từ FaithEdu"
        extra={
          <Space wrap>
            <AppButton icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm mới
            </AppButton>
            <AppButton
              type="primary"
              icon={<CheckOutlined />}
              disabled={stats.unread === 0}
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
              >
                Xóa tất cả
              </AppButton>
            )}
          </Space>
        }
      />

      {/* COMPACT STATS BAR */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          margin: "16px 0 20px",
        }}
      >
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

      {/* FILTER & TOOLBAR */}
      <Card
        bordered={false}
        bodyStyle={{ padding: "12px 20px" }}
        style={{
          borderRadius: 12,
          marginBottom: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Space size={12} wrap>
            <Radio.Group
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="all">Tất cả</Radio.Button>
              <Radio.Button value="unread">
                Chưa đọc{" "}
                {stats.unread > 0 && (
                  <Badge count={stats.unread} offset={[6, -2]} />
                )}
              </Radio.Button>
              <Radio.Button value="read">Đã đọc</Radio.Button>
            </Radio.Group>

            <Select
              value={typeFilter}
              options={typeOptions}
              onChange={(val) => {
                setTypeFilter(val);
                setPage(1);
              }}
              style={{ width: 180 }}
            />
          </Space>

          <Input
            placeholder="Tìm kiếm thông báo..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
            allowClear
          />
        </div>
      </Card>

      {/* MAIN SPLIT CONTENT */}
      <div
        style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 16 }}
      >
        {/* LEFT COLUMN: NOTIFICATION LIST */}
        <Card
          bordered={false}
          bodyStyle={{ padding: 0 }}
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            height: 720,
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <Spin tip="Đang tải..." />
              </div>
            ) : displayedNotifications.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có thông báo"
                style={{ margin: "60px 0" }}
              />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={displayedNotifications}
                renderItem={(item) => {
                  const type = getTypeConfig(item.type);
                  const priority = getPriorityConfig(item.priority);
                  const isSelected = selectedNotification?.id === item.id;

                  return (
                    <div
                      onClick={() => handleSelectNotification(item)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        marginBottom: 8,
                        cursor: "pointer",
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
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "flex-start",
                        }}
                      >
                        <Avatar
                          style={{
                            backgroundColor: type.bg,
                            color: type.color,
                            flexShrink: 0,
                          }}
                          icon={type.icon}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "baseline",
                            }}
                          >
                            <Text
                              ellipsis
                              strong={!item.is_read}
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
                                style={{ marginLeft: 6 }}
                              />
                            )}
                          </div>

                          <Paragraph
                            ellipsis={{ rows: 1 }}
                            type="secondary"
                            style={{
                              fontSize: 12,
                              margin: "4px 0 6px",
                              color: "#8c8c8c",
                            }}
                          >
                            {item.content}
                          </Paragraph>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
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
                            <Text type="secondary" style={{ fontSize: 11 }}>
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

          {/* PAGINATION FOOTER */}
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid #f0f0f0",
              textAlign: "right",
              backgroundColor: "#fafafa",
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tổng: {paginationTotal}
            </Text>
          </div>
        </Card>

        {/* RIGHT COLUMN: READER VIEW */}
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            height: 720,
            display: "flex",
            flexDirection: "column",
          }}
          bodyStyle={{ padding: 28, flex: 1, overflowY: "auto" }}
        >
          {selectedNotification ? (
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
                  {/* DETAIL HEADER */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <Space size={8} wrap>
                      <Tag
                        color={type.color}
                        style={{
                          borderRadius: 12,
                          padding: "2px 10px",
                          fontSize: 12,
                        }}
                      >
                        {type.icon} {type.label}
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
                          {priority.label}
                        </Tag>
                      )}
                    </Space>

                    {canDelete && (
                      <Tooltip title="Xóa thông báo">
                        <AppButton
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(selectedNotification)}
                        />
                      </Tooltip>
                    )}
                  </div>

                  <Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>
                    {selectedNotification.title}
                  </Title>

                  {/* AUTHOR & TIME INFO */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      backgroundColor: "#fafafa",
                      borderRadius: 10,
                      marginBottom: 24,
                    }}
                  >
                    <Avatar
                      style={{
                        backgroundColor: getAvatarColor(
                          selectedNotification.created_by_name,
                        ),
                      }}
                    >
                      {getInitial(selectedNotification.created_by_name)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ display: "block", fontSize: 13 }}>
                        {selectedNotification.created_by_name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {formatDate(selectedNotification.created_at)}
                      </Text>
                    </div>
                  </div>

                  {/* CONTENT BODY */}
                  <div
                    style={{
                      minHeight: 200,
                      fontSize: 15,
                      lineHeight: 1.8,
                      color: "#262626",
                    }}
                  >
                    <Paragraph style={{ whiteSpace: "pre-wrap" }}>
                      {selectedNotification.content ||
                        "Không có nội dung chi tiết."}
                    </Paragraph>
                  </div>

                  {/* RECIPIENT PROGRESS (ADMIN/TEACHER VIEW) */}
                  {selectedNotification.recipient_count > 0 && (
                    <>
                      <Divider style={{ margin: "24px 0 16px" }} />
                      <div
                        style={{
                          padding: 16,
                          backgroundColor: "#f9f9f9",
                          borderRadius: 10,
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            <ReadOutlined style={{ marginRight: 6 }} /> Tiến độ
                            đọc thông báo
                          </Text>
                          <Text strong style={{ fontSize: 13 }}>
                            {selectedNotification.read_count} /{" "}
                            {selectedNotification.recipient_count} đã xem (
                            {readPercent}%)
                          </Text>
                        </div>
                        <Progress
                          percent={readPercent}
                          strokeColor={type.color}
                          size="small"
                          showInfo={false}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })()
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
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
    </div>
  );
};

export default NotificationsCatePage;
