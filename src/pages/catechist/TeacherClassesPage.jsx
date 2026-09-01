import React, { useCallback, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Empty,
  Skeleton,
  Tag,
  Space,
  Divider,
} from "antd";

import {
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import classApi from "../../api/classApi";
import { useUser } from "../../context/UserContext";
import ErrorPage from "./ErrorPage";

const { Title, Text } = Typography;

/* =========================================================
   HELPERS
========================================================= */

const normalizeListResponse = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const formatTime = (time) => {
  if (!time) return "—";
  return String(time).slice(0, 5);
};

const getDayName = (day) => {
  const days = {
    0: "Chúa Nhật",
    1: "Thứ Hai",
    2: "Thứ Ba",
    3: "Thứ Tư",
    4: "Thứ Năm",
    5: "Thứ Sáu",
    6: "Thứ Bảy",
    7: "Chúa Nhật",
    monday: "Thứ Hai",
    tuesday: "Thứ Ba",
    wednesday: "Thứ Tư",
    thursday: "Thứ Năm",
    friday: "Thứ Sáu",
    saturday: "Thứ Bảy",
    sunday: "Chúa Nhật",
  };
  return days[day] || day || "Chưa cập nhật";
};

const getStatusConfig = (status) => {
  const configs = {
    active: {
      label: "Đang hoạt động",
      color: "#0284C7",
      bg: "#E0F2FE",
      icon: <CheckCircleOutlined />,
    },
    paused: {
      label: "Tạm dừng",
      color: "#D97706",
      bg: "#FEF3C7",
      icon: <PauseCircleOutlined />,
    },
    completed: {
      label: "Đã kết thúc",
      color: "#64748B",
      bg: "#F1F5F9",
      icon: <StopOutlined />,
    },
  };
  return configs[status] || configs.active;
};

/* =========================================================
   STATUS TAG
========================================================= */

const StatusTag = ({ status }) => {
  const config = getStatusConfig(status);
  return (
    <Tag
      bordered={false}
      style={{
        margin: 0,
        borderRadius: 12,
        padding: "5px 12px",
        fontSize: 12,
        fontWeight: 800,
        color: config.color,
        background: config.bg,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {config.icon}
      {config.label}
    </Tag>
  );
};

/* =========================================================
   INFO ITEM
========================================================= */

const InfoItem = ({ icon, label, value }) => {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 18,
        background: "#FFF9FA",
        border: "1px solid #FFE4E6",
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: "100%",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "#FFF5F7",
          color: "#FF6B8B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <Text
          style={{
            display: "block",
            fontSize: 11,
            color: "#94A3B8",
            fontWeight: 700,
          }}
        >
          {label}
        </Text>
        <Text
          strong
          ellipsis
          style={{
            display: "block",
            fontSize: 14,
            color: "#334155",
            marginTop: 2,
          }}
        >
          {value}
        </Text>
      </div>
    </div>
  );
};

/* =========================================================
   PAGE
========================================================= */

const TeacherClassesPage = () => {
  const { user } = useUser();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await classApi.getClassTeacher();
      const list = normalizeListResponse(response);
      // Lấy lớp đầu tiên nếu có dữ liệu
      setClassData(list.length > 0 ? list[0] : null);
    } catch (error) {
      setError("Bạn chưa được phân vào lớp học nào!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);
  if (error) {
    return (
      <ErrorPage
        title="Không thể tải danh sách lớp học"
        message={error}
        onRetry={() => {
          setError(null);
          fetchClasses();
        }}
      />
    );
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#FFF9FA",
      }}
    >
      {/* HEADER: THÔNG TIN GIÁO LÝ VIÊN */}
      <Card
        bordered={false}
        style={{
          marginBottom: 24,
          borderRadius: 26,
          overflow: "hidden",
          background: "linear-gradient(135deg, #FFF5F7 0%, #FFFFFF 100%)",
          border: "2px solid #FFE4E6",
          boxShadow: "0 12px 28px rgba(255, 182, 193, 0.15)",
        }}
      >
        <Row justify="space-between" align="middle" gutter={[20, 20]}>
          <Col flex="auto">
            <Space align="center" size={16}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 20,
                  background: "#FF6B8B",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  boxShadow: "0 8px 18px rgba(255, 107, 139, 0.25)",
                }}
              >
                <UserOutlined />
              </div>

              <div>
                <Text
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "#FF6B8B",
                    fontWeight: 800,
                    letterSpacing: 1,
                  }}
                >
                  🌸 GIÁO LÝ VIÊN PHỤ TRÁCH
                </Text>

                <Title
                  level={3}
                  style={{
                    margin: "4px 0",
                    color: "#334155",
                    fontWeight: 800,
                  }}
                >
                  {user?.full_name ||
                    classData?.catechist_name ||
                    "Khánh Hưng ( Admin )"}
                </Title>

                <Space size={8} wrap>
                  <Tag
                    color="magenta"
                    style={{ borderRadius: 8, fontWeight: 700 }}
                  >
                    Thánh danh: {user?.holy_name || "Đaminh"}
                  </Tag>
                  <Tag
                    color="volcano"
                    style={{ borderRadius: 8, fontWeight: 700 }}
                  >
                    Mã GLV: {user?.catechist_code || "GLV20260028"}
                  </Tag>
                </Space>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* NỘI DUNG CHI TIẾT LỚP HỌC */}
      <Text
        strong
        style={{
          fontSize: 16,
          color: "#334155",
          display: "block",
          marginBottom: 16,
        }}
      >
        📚 Lớp học được phân công
      </Text>

      {loading ? (
        <Card
          bordered={false}
          style={{ borderRadius: 24, border: "2px solid #FFE4E6", padding: 24 }}
        >
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      ) : classData ? (
        <Card
          bordered={false}
          style={{
            borderRadius: 24,
            overflow: "hidden",
            background: "#FFFFFF",
            border: "2px solid #FFE4E6",
            boxShadow: "0 10px 25px rgba(255, 182, 193, 0.15)",
          }}
          styles={{ body: { padding: 28 } }}
        >
          {/* TÊN LỚP & TRẠNG THÁI */}
          <Row
            justify="space-between"
            align="middle"
            gutter={[16, 16]}
            style={{ marginBottom: 24 }}
          >
            <Col flex="auto">
              <Space size={14} align="center">
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: "#FFF5F7",
                    color: "#FF6B8B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    border: "1.5px solid #FFD1D9",
                  }}
                >
                  <BookOutlined />
                </div>
                <div>
                  <Title
                    level={3}
                    style={{ margin: 0, color: "#334155", fontWeight: 800 }}
                  >
                    {classData.name}
                  </Title>
                  <Space size={8} style={{ marginTop: 4 }}>
                    <Tag
                      color="gold"
                      style={{ borderRadius: 8, fontWeight: 800, margin: 0 }}
                    >
                      ✨ {classData.code}
                    </Tag>
                    {classData.category && (
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#FF6B8B",
                          fontWeight: 700,
                        }}
                      >
                        {classData.category}
                      </Text>
                    )}
                  </Space>
                </div>
              </Space>
            </Col>
            <Col>
              <StatusTag status={classData.status} />
            </Col>
          </Row>

          <Divider style={{ borderColor: "#FFE4E6", margin: "0 0 24px 0" }} />

          {/* CÁC THÔNG TIN CHI TIẾT DẠNG LƯỚI */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} sm={12} lg={6}>
              <InfoItem
                icon={<CalendarOutlined />}
                label="Lịch học hàng tuần"
                value={getDayName(classData.day_of_week)}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <InfoItem
                icon={<ClockCircleOutlined />}
                label="Khung giờ học"
                value={`${formatTime(classData.start_time)} - ${formatTime(classData.end_time)}`}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <InfoItem
                icon={<EnvironmentOutlined />}
                label="Địa điểm phòng học"
                value={classData.room || "Chưa cập nhật"}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <InfoItem
                icon={<TeamOutlined />}
                label="Sĩ số học viên"
                value={`${classData.studentsCount || 0} học viên`}
              />
            </Col>
          </Row>

          {/* THỜI GIAN KHÓA HỌC */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 16,
              background: "#FFF5F7",
              border: "1px solid #FFE4E6",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <Space size={8}>
              <CalendarOutlined style={{ color: "#FF6B8B", fontSize: 16 }} />
              <Text style={{ fontSize: 13, color: "#64748B", fontWeight: 700 }}>
                Thời gian khóa học:{" "}
                <span style={{ color: "#334155" }}>
                  {classData.start_date
                    ? dayjs(classData.start_date).format("DD/MM/YYYY")
                    : "—"}
                  {" đến "}
                  {classData.end_date
                    ? dayjs(classData.end_date).format("DD/MM/YYYY")
                    : "—"}
                </span>
              </Text>
            </Space>
            <Tag
              color="pink"
              style={{ borderRadius: 8, fontWeight: 700, margin: 0 }}
            >
              Vai trò: {classData.catechist_role || "Giáo lý viên"}
            </Tag>
          </div>

          {/* MÔ TẢ NẾU CÓ */}
          {classData.description && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 16,
                background: "#FFF9FA",
                border: "1px solid #FFE4E6",
              }}
            >
              <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
                <strong>Ghi chú/Mô tả:</strong> {classData.description}
              </Text>
            </div>
          )}
        </Card>
      ) : (
        <Card
          bordered={false}
          style={{
            borderRadius: 24,
            border: "2px solid #FFE4E6",
            textAlign: "center",
            padding: 40,
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text style={{ color: "#94A3B8", fontWeight: 700 }}>
                Bạn chưa được phân công lớp học nào 🌸
              </Text>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default TeacherClassesPage;
