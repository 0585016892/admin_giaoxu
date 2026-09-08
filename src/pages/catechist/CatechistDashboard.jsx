import React, { useEffect, useMemo, useState, memo } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tag,
  Avatar,
  Segmented,
  Flex,
  Skeleton,
  Empty,
  message,
  ConfigProvider,
} from "antd";
import {
  RiseOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";

import { getDashboardCate, getMyLicense } from "../../api/dashboardApi";
import dailyVerseApi from "../../api/dailyVerseApi";

import dash1 from "../../assets/images/dash1.png";
import dash2 from "../../assets/images/dash2.png";
import dash3 from "../../assets/images/dash3.png";
import dash4 from "../../assets/images/dash4.png";

const { Title, Text } = Typography;

// =====================================================
// CONSTANTS & STYLES
// =====================================================

const IMAGE_ASSETS = {
  students: dash1,
  classes: dash2,
  lessons: dash3,
  achievements: dash4,
};

const CHART_COLORS = {
  Tổng: "#FF6B8B",
  Nam: "#2563EB",
  Nữ: "#DB2777",
  "Học sinh mới": "#9333EA",
};

const chibiCardStyle = {
  borderRadius: 24,
  border: "2px solid #FFF0F5",
  boxShadow: "0 10px 25px rgba(255, 107, 139, 0.06)",
  background: "#FFFFFF",
  overflow: "hidden",
  transition: "all 0.3s ease",
};

// =====================================================
// SUB-COMPONENTS (MEMOIZED FOR PERFORMANCE)
// =====================================================

// 1. Metric Stat Card
const StatCard = memo(({ title, value, subText, icon, tag, bgGradient }) => (
  <Card
    bordered={false}
    style={{
      ...chibiCardStyle,
      height: "100%",
      background: bgGradient,
    }}
    bodyStyle={{ padding: 20 }}
  >
    <Flex vertical gap={14}>
      <Flex justify="space-between" align="flex-start">
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "rgba(255, 255, 255, 0.6)",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          <img
            src={icon}
            alt={title}
            style={{ width: 42, height: 42, objectFit: "contain" }}
          />
        </div>
        {tag}
      </Flex>

      <div>
        <Text
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 700,
            color: "#4B5563",
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        <Title
          level={2}
          style={{
            margin: 0,
            fontWeight: 800,
            fontSize: 28,
            lineHeight: 1.2,
          }}
        >
          {value}
        </Title>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
          {subText}
        </Text>
      </div>
    </Flex>
  </Card>
));

// 2. Custom Chart Tooltip
const ClassChartTooltip = memo(({ active, payload, label, mode }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div
      style={{
        minWidth: 220,
        padding: 14,
        borderRadius: 16,
        background: "#FFFFFF",
        border: "1px solid #FBCFE8",
        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
      }}
    >
      <Text
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 800,
          color: "#374151",
          marginBottom: 4,
        }}
      >
        📚 {label}
      </Text>
      {data.code && (
        <Text
          style={{
            display: "block",
            fontSize: 11,
            color: "#9CA3AF",
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          {data.code}
        </Text>
      )}
      <div
        style={{
          padding: "8px 10px",
          borderRadius: 10,
          background: "#FFF7F9",
          marginBottom: 8,
        }}
      >
        <Flex justify="space-between">
          <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
            {mode}
          </Text>
          <Text style={{ fontSize: 14, color: "#FF6B8B", fontWeight: 800 }}>
            {Number(data.value || 0)} học sinh
          </Text>
        </Flex>
      </div>
      <Flex vertical gap={5}>
        <Flex justify="space-between">
          <Text style={{ fontSize: 11, color: "#6B7280" }}>👨 Nam</Text>
          <Text style={{ fontSize: 11, fontWeight: 800, color: "#2563EB" }}>
            {data.male}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text style={{ fontSize: 11, color: "#6B7280" }}>👩 Nữ</Text>
          <Text style={{ fontSize: 11, fontWeight: 800, color: "#DB2777" }}>
            {data.female}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text style={{ fontSize: 11, color: "#6B7280" }}>
            ✨ Học sinh mới
          </Text>
          <Text style={{ fontSize: 11, fontWeight: 800, color: "#9333EA" }}>
            {data.newStudents}
          </Text>
        </Flex>
      </Flex>
    </div>
  );
});

// 3. Skeleton Loading State Component
const DashboardSkeleton = () => (
  <Row gutter={[20, 20]}>
    {[1, 2, 3, 4].map((key) => (
      <Col xs={24} sm={12} lg={6} key={key}>
        <Card bordered={false} style={chibiCardStyle}>
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        </Card>
      </Col>
    ))}
    <Col xs={24}>
      <Card bordered={false} style={chibiCardStyle}>
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    </Col>
    <Col xs={24} lg={16}>
      <Card bordered={false} style={chibiCardStyle}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    </Col>
    <Col xs={24} lg={8}>
      <Card bordered={false} style={chibiCardStyle}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    </Col>
  </Row>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function CatechistDashboard() {
  // State Management
  const [license, setLicense] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [classChartMode, setClassChartMode] = useState("Tổng");

  // Fetch License Data
  useEffect(() => {
    const loadLicense = async () => {
      try {
        const data = await getMyLicense();
        if (data?.success) setLicense(data);
      } catch (err) {
        console.error("Lỗi khi tải license:", err);
      }
    };
    loadLicense();
  }, []);

  // Fetch Main Dashboard Data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await getDashboardCate();
      const data = response?.data?.data || response?.data || response || null;
      if (!data) throw new Error("Không có dữ liệu dashboard");
      setDashboard(data);
    } catch (err) {
      setError(true);
      message.error(
        err?.response?.data?.message || "Không thể tải dữ liệu dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Daily Verse
  const fetchDailyVerse = async () => {
    try {
      const response = await dailyVerseApi.getRandom();
      if (response?.data?.success) setDailyVerse(response.data.data);
    } catch (err) {
      console.error("Lỗi khi tải Lời Chúa:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchDailyVerse();
  }, []);

  // Normalized Data & Computations
  const metrics = dashboard?.top_metrics || {};
  const totalStudents = Number(metrics?.total_students?.value ?? 0);
  const studentCompare = Number(
    metrics?.total_students?.compare_last_month_pct ?? 0,
  );
  const totalClasses = Number(metrics?.classes?.total ?? 0);
  const activeClasses = Number(metrics?.classes?.active ?? 0);
  const totalLessons = Number(metrics?.lessons?.total ?? 0);

  const studentStatistics = dashboard?.student_statistics || {};
  const attendanceToday = studentStatistics?.overview?.attendance_today || {};

  const normalizedClassStatistics = useMemo(() => {
    const classList = Array.isArray(studentStatistics?.classes)
      ? studentStatistics.classes
      : [];

    return classList
      .map((item) => ({
        id: item?.class_id,
        name: item?.class_name || item?.name || `Lớp ${item?.class_id ?? ""}`,
        code: item?.class_code || "",
        category: item?.category || "",
        status: item?.class_status || item?.status || "active",
        total: Number(item?.students?.total ?? item?.total_students ?? 0),
        male: Number(item?.students?.male ?? item?.male_students ?? 0),
        female: Number(item?.students?.female ?? item?.female_students ?? 0),
        newStudents: Number(
          item?.students?.new_this_month ?? item?.new_students_this_month ?? 0,
        ),
      }))
      .sort((a, b) => b.total - a.total);
  }, [studentStatistics?.classes]);

  const visibleClassChartData = useMemo(() => {
    return normalizedClassStatistics.map((item) => {
      let value = item.total;
      if (classChartMode === "Nam") value = item.male;
      if (classChartMode === "Nữ") value = item.female;
      if (classChartMode === "Học sinh mới") value = item.newStudents;
      return { ...item, value };
    });
  }, [normalizedClassStatistics, classChartMode]);

  // Render Views
  if (loading) {
    return (
      <ConfigProvider theme={{ token: { colorPrimary: "#FF6B8B" } }}>
        <div style={{ padding: 16 }}>
          <DashboardSkeleton />
        </div>
      </ConfigProvider>
    );
  }

  if (error || !dashboard) {
    return (
      <div
        style={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Card
          bordered={false}
          style={{ ...chibiCardStyle, maxWidth: 420, width: "100%" }}
          bodyStyle={{ padding: 32, textAlign: "center" }}
        >
          <Empty description="Không thể tải dữ liệu dashboard" />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchDashboard}
            style={{
              marginTop: 16,
              borderRadius: 16,
              height: 42,
              background: "linear-gradient(135deg, #FF6B8B 0%, #FF85A1 100%)",
              border: "none",
              fontWeight: 700,
            }}
          >
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF6B8B",
          fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
          borderRadius: 20,
        },
      }}
    >
      <Flex vertical gap={24} style={{ padding: 4 }}>
        {/* =================================================
            HEADER & EXPORT
        ================================================= */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
              Bảng Điều Khiển Giáo Lý
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Chào mừng quay trở lại công tác giảng dạy! ✨
            </Text>
          </div>
        </Flex>

        {/* =================================================
            1. TOP METRICS CARDS
        ================================================= */}
        <Row gutter={[20, 20]}>
          {/* Tổng học sinh */}
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Tổng học sinh"
              value={totalStudents}
              subText="học sinh đang quản lý"
              icon={IMAGE_ASSETS.students}
              bgGradient="linear-gradient(135deg, #FFFFFF 0%, #FFF1F5 100%)"
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 10,
                    background: "#DCFCE7",
                    color: "#15803D",
                    fontWeight: 700,
                  }}
                >
                  <RiseOutlined /> +{studentCompare}%
                </Tag>
              }
            />
          </Col>

          {/* Lớp phụ trách */}
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Lớp phụ trách"
              value={totalClasses}
              subText={`${activeClasses} lớp đang hoạt động`}
              icon={IMAGE_ASSETS.classes}
              bgGradient="linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)"
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 10,
                    background: "#D1FAE5",
                    color: "#047857",
                    fontWeight: 700,
                  }}
                >
                  Đang hoạt động
                </Tag>
              }
            />
          </Col>

          {/* Giáo xứ */}
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Giáo Xứ Của Bạn"
              value={license?.church?.name ?? totalLessons}
              subText={`Địa chỉ: ${
                license?.church?.address ?? "Chưa cập nhật"
              }`}
              icon={IMAGE_ASSETS.lessons}
              bgGradient="linear-gradient(135deg, #FFFFFF 0%, #F3E8FF 100%)"
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 10,
                    background: "#F3E8FF",
                    color: "#7E22CE",
                    fontWeight: 700,
                  }}
                >
                  {license?.church?.type === "GIAO_XU" ? "Giáo xứ" : "Giáo họ"}
                </Tag>
              }
            />
          </Col>

          {/* Bản quyền / License */}
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Gói FaithEdu"
              value={
                license?.license?.status === "active"
                  ? "Vĩnh viễn"
                  : license?.license?.status === "expired"
                    ? "Đã hết hạn"
                    : `${license?.license?.days_remaining ?? 0} ngày`
              }
              subText={
                license?.license?.status === "trial"
                  ? "Thời gian dùng thử còn lại"
                  : license?.license?.status === "active"
                    ? "Đã kích hoạt FaithEdu"
                    : "Vui lòng kích hoạt lại"
              }
              icon={IMAGE_ASSETS.achievements}
              bgGradient="linear-gradient(135deg, #FFFFFF 0%, #FEF3C7 100%)"
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 10,
                    background:
                      license?.license?.status === "active"
                        ? "#DCFCE7"
                        : license?.license?.status === "expired"
                          ? "#FEE2E2"
                          : "#FEF3C7",
                    color:
                      license?.license?.status === "active"
                        ? "#15803D"
                        : license?.license?.status === "expired"
                          ? "#B91C1C"
                          : "#B45309",
                    fontWeight: 700,
                  }}
                >
                  {license?.license?.status === "active"
                    ? "Đang hoạt động"
                    : license?.license?.status === "expired"
                      ? "Đã hết hạn"
                      : "Dùng thử"}
                </Tag>
              }
            />
          </Col>
        </Row>

        {/* =================================================
            2. ATTENDANCE TODAY OVERVIEW
        ================================================= */}
        <Card
          bordered={false}
          style={{
            ...chibiCardStyle,
            background: "linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)",
          }}
          bodyStyle={{ padding: 20 }}
        >
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={8}>
              <Flex align="center" gap={14}>
                <Avatar
                  size={52}
                  style={{
                    background: "#D1FAE5",
                    color: "#059669",
                    fontSize: 22,
                    fontWeight: 800,
                  }}
                >
                  ✓
                </Avatar>
                <div>
                  <Text
                    style={{
                      display: "block",
                      color: "#065F46",
                      fontSize: 15,
                      fontWeight: 800,
                    }}
                  >
                    Điểm danh hôm nay
                  </Text>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, fontWeight: 600 }}
                  >
                    Tình hình tham dự của học sinh toàn bộ các lớp
                  </Text>
                </div>
              </Flex>
            </Col>

            <Col xs={24} md={16}>
              <Row gutter={[12, 12]}>
                <Col xs={12} sm={8}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 16,
                      background: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                    }}
                  >
                    <Flex align="center" gap={8}>
                      <CheckCircleOutlined
                        style={{ color: "#16A34A", fontSize: 16 }}
                      />
                      <div>
                        <Text style={{ fontSize: 11, color: "#15803D" }}>
                          Có mặt
                        </Text>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#15803D" }}
                        >
                          {attendanceToday?.present ?? 0}
                        </Title>
                      </div>
                    </Flex>
                  </div>
                </Col>

                <Col xs={12} sm={8}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 16,
                      background: "#FEF2F2",
                      border: "1px solid #FECDD3",
                    }}
                  >
                    <Flex align="center" gap={8}>
                      <CloseCircleOutlined
                        style={{ color: "#DC2626", fontSize: 16 }}
                      />
                      <div>
                        <Text style={{ fontSize: 11, color: "#B91C1C" }}>
                          Vắng mặt
                        </Text>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#B91C1C" }}
                        >
                          {attendanceToday?.absent ?? 0}
                        </Title>
                      </div>
                    </Flex>
                  </div>
                </Col>

                <Col xs={24} sm={8}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 16,
                      background: "#FFFBEB",
                      border: "1px solid #FDE68A",
                    }}
                  >
                    <Flex align="center" gap={8}>
                      <ClockCircleOutlined
                        style={{ color: "#D97706", fontSize: 16 }}
                      />
                      <div>
                        <Text style={{ fontSize: 11, color: "#B45309" }}>
                          Đi muộn
                        </Text>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#B45309" }}
                        >
                          {attendanceToday?.late ?? 0}
                        </Title>
                      </div>
                    </Flex>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* =================================================
            3. CHART SECTION & DAILY VERSE
        ================================================= */}
        <Row gutter={[20, 20]}>
          {/* Class Statistics Chart */}
          <Col xs={24} lg={16}>
            <Card
              bordered={false}
              style={chibiCardStyle}
              bodyStyle={{ padding: 20 }}
            >
              <Flex
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={12}
                style={{ marginBottom: 20 }}
              >
                <div>
                  <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
                    Thống kê học sinh theo lớp
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Phân bổ sĩ số học sinh giữa các lớp giáo lý
                  </Text>
                </div>
                <Segmented
                  options={["Tổng", "Nam", "Nữ", "Học sinh mới"]}
                  value={classChartMode}
                  onChange={setClassChartMode}
                  style={{
                    background: "#FFF0F5",
                    padding: 3,
                    borderRadius: 12,
                    fontWeight: 700,
                  }}
                />
              </Flex>

              {visibleClassChartData.length > 0 ? (
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={visibleClassChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#F3F4F6"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                      />
                      <RechartsTooltip
                        content={<ClassChartTooltip mode={classChartMode} />}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        {visibleClassChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              CHART_COLORS[classChartMode] ||
                              CHART_COLORS["Tổng"]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Empty description="Chưa có dữ liệu thống kê lớp học" />
              )}
            </Card>
          </Col>

          {/* Daily Verse Section */}
          <Col xs={24} lg={8}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                height: "100%",
                background: "linear-gradient(135deg, #FFF7F9 0%, #FEE2E2 100%)",
                border: "2px solid #FECDD3",
              }}
              bodyStyle={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <div>
                <Tag
                  color="magenta"
                  style={{
                    borderRadius: 10,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  ✨ Lời Chúa Mỗi Ngày
                </Tag>

                <Typography.Paragraph
                  style={{
                    fontSize: 15,
                    fontStyle: "italic",
                    color: "#881337",
                    lineHeight: 1.6,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  "
                  {dailyVerse?.content ||
                    "Chúa là mục tử chăn dắt tôi, tôi chẳng thiếu thứ gì."}
                  "
                </Typography.Paragraph>
              </div>

              <div>
                <Text
                  style={{
                    display: "block",
                    fontWeight: 800,
                    color: "#9F1239",
                    fontSize: 13,
                    textAlign: "right",
                  }}
                >
                  — {dailyVerse?.book || "Thánh Vịnh 23:1"}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Flex>
    </ConfigProvider>
  );
}
