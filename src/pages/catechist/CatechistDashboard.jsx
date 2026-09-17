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
  message,
  ConfigProvider,
} from "antd";
import {
  RiseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  RightOutlined,
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
// Thay đường dẫn này bằng ảnh minh họa Chúa và các em thiếu nhi trong thư mục assets của bạn
import jesusChildrenImg from "../../assets/images/jesus-children.png";

import FeedbackModal from "../../components/FeedbackModal";
import { checkFeedback } from "../../api/contactMessageApi";
import { useUser } from "../../context/UserContext";

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
  Tổng: "#2563EB", // Màu xanh dương giống ảnh mẫu
  Nam: "#2563EB",
  Nữ: "#DB2777",
  "Học sinh mới": "#9333EA",
};

const chibiCardStyle = {
  borderRadius: 24,
  border: "1px solid #F3F4F6",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
  background: "#FFFFFF",
  overflow: "hidden",
  transition: "all 0.3s ease",
};

// =====================================================
// SUB-COMPONENTS (MEMOIZED FOR PERFORMANCE)
// =====================================================

const StatCard = memo(({ title, value, subText, icon, tag, bgGradient }) => (
  <Card
    bordered={false}
    style={{
      ...chibiCardStyle,
      height: "100%",
      background: bgGradient || "#FFFFFF",
    }}
    bodyStyle={{ padding: 22 }}
  >
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="flex-start">
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={icon}
            alt={title}
            style={{ width: 36, height: 36, objectFit: "contain" }}
          />
        </div>
        {tag}
      </Flex>

      <div>
        <Text
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#6B7280",
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Title
          level={2}
          style={{
            margin: 0,
            fontWeight: 800,
            fontSize: 26,
            color: "#1F2937",
            lineHeight: 1.2,
          }}
        >
          {value}
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            fontWeight: 500,
            marginTop: 4,
            display: "block",
          }}
        >
          {subText}
        </Text>
      </div>
    </Flex>
  </Card>
));

const ClassChartTooltip = memo(({ active, payload, label, mode }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div
      style={{
        minWidth: 200,
        padding: 12,
        borderRadius: 14,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      }}
    >
      <Text
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 800,
          color: "#1F2937",
          marginBottom: 6,
        }}
      >
        📚 {label} {data.code ? `(${data.code})` : ""}
      </Text>
      <Flex
        justify="space-between"
        style={{
          marginBottom: 6,
          paddingBottom: 6,
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <Text style={{ fontSize: 12, color: "#6B7280" }}>{mode}:</Text>
        <Text style={{ fontSize: 13, fontWeight: 700, color: "#2563EB" }}>
          {Number(data.value || 0)}
        </Text>
      </Flex>
      <Flex vertical gap={4}>
        <Flex justify="space-between">
          <Text style={{ fontSize: 11, color: "#6B7280" }}>Nam:</Text>
          <Text style={{ fontSize: 11, fontWeight: 700 }}>{data.male}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text style={{ fontSize: 11, color: "#6B7280" }}>Nữ:</Text>
          <Text style={{ fontSize: 11, fontWeight: 700 }}>{data.female}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text style={{ fontSize: 11, color: "#6B7280" }}>Mới:</Text>
          <Text style={{ fontSize: 11, fontWeight: 700 }}>
            {data.newStudents}
          </Text>
        </Flex>
      </Flex>
    </div>
  );
});

const DashboardSkeleton = () => (
  <Row gutter={[20, 20]}>
    {[1, 2, 3, 4].map((key) => (
      <Col xs={24} sm={12} lg={6} key={key}>
        <Card bordered={false} style={chibiCardStyle}>
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        </Card>
      </Col>
    ))}
  </Row>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function CatechistDashboard() {
  const { user } = useUser();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [license, setLicense] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [classChartMode, setClassChartMode] = useState("Tổng");
  console.log(error);

  useEffect(() => {
    const loadLicense = async () => {
      try {
        const data = await getMyLicense();

        if (data?.success) setLicense(data);
      } catch (err) {
        message.error("Lỗi khi tải license:", err);
      }
    };
    loadLicense();
  }, []);

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

  const fetchDailyVerse = async () => {
    try {
      const response = await dailyVerseApi.getRandom();

      setDailyVerse(response.data.data);
    } catch (err) {
      message.error("Lỗi khi tải Lời Chúa:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchDailyVerse();
  }, []);

  useEffect(() => {
    const checkUserFeedback = async () => {
      try {
        if (!user?.email) return;

        const res = await checkFeedback(user.email);

        if (res?.success && !res.hasFeedback) {
          setFeedbackOpen(true);
        }
      } catch (error) {
        message.error("CHECK USER FEEDBACK ERROR:", error);
      }
    };

    checkUserFeedback();
  }, [user?.email]);

  const metrics = dashboard?.top_metrics || {};
  const totalStudents = Number(metrics?.total_students?.value ?? 420);
  const studentCompare = Number(
    metrics?.total_students?.compare_last_month_pct ?? 100,
  );
  const totalClasses = Number(metrics?.classes?.total ?? 13);
  const activeClasses = Number(metrics?.classes?.active ?? 13);

  const studentStatistics = dashboard?.student_statistics || {};
  const attendanceToday = studentStatistics?.overview?.attendance_today || {
    present: 4,
    absent: 23,
    late: 1,
  };

  const normalizedClassStatistics = useMemo(() => {
    const classList = Array.isArray(studentStatistics?.classes)
      ? studentStatistics.classes
      : [];
    if (classList.length === 0) {
      // Dữ liệu mẫu giả lập theo ảnh nếu API chưa trả về kịp để dễ xem giao diện
      return Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Lớp ${i + 1}`,
        code: `L0${i + 1}`,
        total: Math.floor(60 - i * 4),
        male: 20,
        female: 20,
        newStudents: 2,
      }));
    }
    return classList
      .map((item) => ({
        id: item?.class_id,
        name: item?.class_name || item?.name || `Lớp ${item?.class_id ?? ""}`,
        code: item?.class_code || "",
        total: Number(item?.students?.total ?? item?.total_students ?? 0),
        male: Number(item?.students?.male ?? item?.male_students ?? 0),
        female: Number(item?.students?.female ?? item?.female_students ?? 0),
        newStudents: Number(item?.students?.new_this_month ?? 0),
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

  if (loading)
    return (
      <div style={{ padding: 24 }}>
        <DashboardSkeleton />
      </div>
    );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#2563EB",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          borderRadius: 16,
        },
      }}
    >
      <Flex vertical gap={24} style={{ padding: 8 }}>
        {/* HEADER TITLE */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <div>
            <Title
              level={3}
              style={{ margin: 0, fontWeight: 800, color: "#1F2937" }}
            >
              Bảng Điều Khiển Giáo Lý
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Chào mừng quay trở lại công tác giảng dạy! ✨
            </Text>
          </div>
        </Flex>

        {/* 1. TOP METRICS CARDS */}
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Tổng học sinh"
              value={totalStudents}
              subText="học sinh đang quản lý"
              icon={IMAGE_ASSETS.students}
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 8,
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

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Lớp phụ trách"
              value={totalClasses}
              subText={`${activeClasses} lớp đang hoạt động`}
              icon={IMAGE_ASSETS.classes}
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 8,
                    background: "#DCFCE7",
                    color: "#15803D",
                    fontWeight: 700,
                  }}
                >
                  Đang hoạt động
                </Tag>
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Giáo Xứ Của Bạn"
              value={license?.church?.name ?? "Giáo Xứ Đông Chúa"}
              subText={`Địa chỉ: ${license?.church?.address ?? "Giáo Phận Phát Diệm"}`}
              icon={IMAGE_ASSETS.lessons}
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 8,
                    background: "#EFF6FF",
                    color: "#2563EB",
                    fontWeight: 700,
                  }}
                >
                  Giáo xứ
                </Tag>
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Gói FaithEdu"
              value="Vĩnh viễn"
              subText="Đã kích hoạt FaithEdu"
              icon={IMAGE_ASSETS.achievements}
              tag={
                <Tag
                  style={{
                    border: "none",
                    borderRadius: 8,
                    background: "#DCFCE7",
                    color: "#15803D",
                    fontWeight: 700,
                  }}
                >
                  Đang hoạt động
                </Tag>
              }
            />
          </Col>
        </Row>

        {/* 2. ATTENDANCE TODAY OVERVIEW */}
        <Card
          bordered={false}
          style={chibiCardStyle}
          bodyStyle={{ padding: 18 }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Flex align="center" gap={12}>
                <Avatar
                  size={48}
                  style={{
                    background: "#E0F2FE",
                    color: "#0284C7",
                    fontSize: 20,
                  }}
                >
                  ✓
                </Avatar>
                <div>
                  <Text
                    style={{
                      display: "block",
                      color: "#1F2937",
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    Điểm danh hôm nay
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tình hình tham dự của học sinh toàn bộ các lớp
                  </Text>
                </div>
              </Flex>
            </Col>
            <Col xs={24} md={16}>
              <Row gutter={[12, 12]}>
                <Col xs={8}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                    }}
                  >
                    <Flex align="center" gap={8}>
                      <CheckCircleOutlined
                        style={{ color: "#16A34A", fontSize: 16 }}
                      />
                      <div>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#15803D",
                            display: "block",
                          }}
                        >
                          Có mặt
                        </Text>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#15803D" }}
                        >
                          {attendanceToday.present}
                        </Title>
                      </div>
                    </Flex>
                  </div>
                </Col>
                <Col xs={8}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: "#FEF2F2",
                      border: "1px solid #FECDD3",
                    }}
                  >
                    <Flex align="center" gap={8}>
                      <CloseCircleOutlined
                        style={{ color: "#DC2626", fontSize: 16 }}
                      />
                      <div>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#B91C1C",
                            display: "block",
                          }}
                        >
                          Vắng mặt
                        </Text>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#B91C1C" }}
                        >
                          {attendanceToday.absent}
                        </Title>
                      </div>
                    </Flex>
                  </div>
                </Col>
                <Col xs={8}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: "#FFFBEB",
                      border: "1px solid #FDE68A",
                    }}
                  >
                    <Flex align="center" gap={8}>
                      <ClockCircleOutlined
                        style={{ color: "#D97706", fontSize: 16 }}
                      />
                      <div>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#B45309",
                            display: "block",
                          }}
                        >
                          Đi muộn
                        </Text>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#B45309" }}
                        >
                          {attendanceToday.late}
                        </Title>
                      </div>
                    </Flex>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* 3. CHART & DAILY VERSE SECTION */}
        <Row gutter={[20, 20]}>
          {/* Bar Chart */}
          <Col xs={24} lg={16}>
            <Card
              bordered={false}
              style={{ ...chibiCardStyle, height: "100%" }}
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
                    background: "#F3F4F6",
                    padding: 3,
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                />
              </Flex>

              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={visibleClassChartData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
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
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                    />
                    <RechartsTooltip
                      content={<ClassChartTooltip mode={classChartMode} />}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {visibleClassChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[classChartMode] || "#2563EB"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Daily Verse with Background Image */}
          <Col xs={24} lg={8}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                height: "100%",
                position: "relative",
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.75)), url(${jesusChildrenImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: "#FFFFFF",
              }}
              bodyStyle={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <Flex justify="space-between" align="center">
                <Tag
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    color: "#FFF",
                    borderRadius: 8,
                    fontWeight: 600,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  ✨ Lời Chúa Mỗi Ngày
                </Tag>
                <Button
                  type="text"
                  icon={<RightOutlined style={{ color: "#FFF" }} />}
                />
              </Flex>

              <div style={{ marginTop: 40 }}>
                <Typography.Paragraph
                  style={{
                    fontSize: 16,
                    fontStyle: "italic",
                    color: "#FFFFFF",
                    lineHeight: 1.5,
                    fontWeight: 600,
                    marginBottom: 12,
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  "
                  {dailyVerse?.verse_text ||
                    "Chúa là mục tử chăn dắt tôi, tôi chẳng thiếu thốn gì."}
                  "
                </Typography.Paragraph>
                <Text
                  style={{
                    display: "block",
                    fontWeight: 700,
                    color: "#E0E7FF",
                    fontSize: 13,
                    textAlign: "right",
                  }}
                >
                  — {dailyVerse?.reference || "Tv 23,1"}
                </Text>
              </div>

              {/* Slider dots indicator matching the image */}
              <Flex justify="center" gap={6} style={{ marginTop: 16 }}>
                <div
                  style={{
                    width: 16,
                    height: 6,
                    borderRadius: 3,
                    background: "#FFFFFF",
                  }}
                />
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.5)",
                  }}
                />
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.5)",
                  }}
                />
              </Flex>
            </Card>
          </Col>
        </Row>
      </Flex>
      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </ConfigProvider>
  );
}
