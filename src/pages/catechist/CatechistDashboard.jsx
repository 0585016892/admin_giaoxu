import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Progress,
  Button,
  Tag,
  Avatar,
  List,
  Segmented,
  Flex,
  Badge,
  Tooltip,
  Spin,
  Empty,
  message,
  ConfigProvider,
} from "antd";
import {
  PlusOutlined,
  QuestionOutlined,
  SendOutlined,
  RiseOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Gamepad2, Sparkles, Heart, Trophy } from "lucide-react";

import { getDashboardCate } from "../../api/dashboardApi";
import dailyVerseApi from "../../api/dailyVerseApi";

import dash1 from "../../assets/images/dash1.png";
import dash2 from "../../assets/images/dash2.png";
import dash3 from "../../assets/images/dash3.png";
import dash4 from "../../assets/images/dash4.png";
import dash5 from "../../assets/images/dash5.png";

const { Title, Text, Paragraph } = Typography;

const IMAGES = {
  statStudents: dash1,
  statClasses: dash2,
  statLessons: dash3,
  statAchievements: dash4,
  wordOfGodBg: dash5,
};

export default function CatechistDashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("Tuần");
  const [dailyVerse, setDailyVerse] = useState(null);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // =====================================================
  // LẤY DATA DASHBOARD
  // =====================================================
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await getDashboardCate();
      const data = response?.data?.data || response?.data || response || null;

      if (!data) {
        throw new Error("Không có dữ liệu dashboard");
      }

      setDashboard(data);
    } catch (err) {
      console.error("❌ Lỗi lấy dashboard:", err);
      setError(true);
      message.error(
        err?.response?.data?.message || "Không thể tải dữ liệu dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        const res = await dailyVerseApi.getRandom();
        if (res.data?.success) {
          setDailyVerse(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy Lời Chúa:", error);
      }
    };

    fetchDailyVerse();
  }, []);

  // Card pastel base style
  const chibiCardStyle = {
    borderRadius: 24,
    border: "2px solid #FFF0F5",
    boxShadow: "0 10px 25px rgba(255, 107, 139, 0.06)",
    background: "#FFFFFF",
    overflow: "hidden",
    transition: "all 0.3s ease",
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div
        style={{
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF0F5 0%, #F3E8FF 100%)",
          borderRadius: 24,
          padding: 24,
        }}
      >
        <Flex vertical align="center" gap={16}>
          <Spin size="large" />
          <Text style={{ fontWeight: 700, color: "#FF6B8B" }}>
            Đang tải dữ liệu đáng yêu cho bạn... ✨
          </Text>
        </Flex>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================
  if (error || !dashboard) {
    return (
      <div
        style={{
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          bordered={false}
          style={{
            ...chibiCardStyle,
            textAlign: "center",
            maxWidth: 450,
            width: "100%",
            padding: 20,
          }}
        >
          <Empty description="Chưa tải được dữ liệu rồi!" />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchDashboard}
            style={{
              marginTop: 16,
              borderRadius: 16,
              background: "linear-gradient(135deg, #FF6B8B 0%, #FF85A1 100%)",
              border: "none",
              fontWeight: 700,
              height: 40,
            }}
          >
            Thử lại nhé
          </Button>
        </Card>
      </div>
    );
  }

  // DATA
  const metrics = dashboard?.top_metrics || {};
  const totalStudents = metrics?.total_students?.value ?? 0;
  const studentCompare = metrics?.total_students?.compare_last_month_pct ?? 0;
  const totalClasses = metrics?.classes?.total ?? 0;
  const activeClasses = metrics?.classes?.active ?? 0;
  const totalLessons = metrics?.lessons?.total ?? 0;
  const newLessons = metrics?.lessons?.new_this_month ?? 0;
  const completionRate = metrics?.completion_rate?.value_pct ?? 0;
  const completionCompare =
    metrics?.completion_rate?.compare_last_month_pct ?? 0;

  const weeklyProgress = dashboard?.weekly_progress?.chart_data || [];

  const quizMetrics = dashboard?.quiz_metrics || {};
  const correctPct = quizMetrics?.correct_pct ?? 0;
  const wrongPct = quizMetrics?.wrong_pct ?? 0;
  const uncompletedPct = quizMetrics?.uncompleted_pct ?? 0;

  const studentsSupportData = [
    {
      id: 1,
      name: "Maria An",
      class: "Lớp 3A - Ấu Nhi",
      status: "Cần hỗ trợ",
      color: "#FF6B8B",
      bg: "#FFF0F5",
      note: "Chưa hoàn thành 2 bài trắc nghiệm",
    },
    {
      id: 2,
      name: "Giuse Minh",
      class: "Lớp 4B - Thiếu Nhi",
      status: "Đang tiến bộ",
      color: "#F59E0B",
      bg: "#FEF3C7",
      note: "Điểm trắc nghiệm tăng 15%",
    },
    {
      id: 3,
      name: "Têrêsa Hân",
      class: "Lớp 5A - Nghĩa Sĩ",
      status: "Cần hỗ trợ",
      color: "#FF6B8B",
      bg: "#FFF0F5",
      note: "Vắng mặt 2 buổi học gần nhất",
    },
    {
      id: 4,
      name: "Phêrô Khang",
      class: "Lớp 4A - Thiếu Nhi",
      status: "Xuất sắc",
      color: "#10B981",
      bg: "#D1FAE5",
      note: "Đạt điểm tối đa bài kiểm tra",
    },
  ];

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: "4px",
        }}
      >
        {/* =====================================================
            1. TOP METRICS
        ====================================================== */}
        <Row gutter={[20, 20]}>
          {/* Tổng học sinh */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                background: "linear-gradient(135deg, #FFFFFF 0%, #FFF0F5 100%)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Flex align="center" gap={16}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: "#FFE4E6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "2px solid #FECDD3",
                  }}
                >
                  <img
                    src={IMAGES.statStudents}
                    alt="Total Students"
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: "contain",
                    }}
                  />
                </div>

                <Flex
                  vertical
                  justify="center"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <Text
                    style={{ fontSize: 13, fontWeight: 700, color: "#881337" }}
                  >
                    Tổng học sinh
                  </Text>
                  <Title
                    level={2}
                    style={{
                      margin: "2px 0 4px",
                      color: "#FF6B8B",
                      fontWeight: 800,
                    }}
                  >
                    {totalStudents}
                  </Title>

                  <Flex align="center" gap={4}>
                    <Tag
                      style={{
                        borderRadius: 12,
                        margin: 0,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#10B981",
                        background: "#D1FAE5",
                        border: "none",
                      }}
                    >
                      <RiseOutlined /> +{studentCompare}%
                    </Tag>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        fontWeight: 600,
                      }}
                    >
                      vs tháng trước
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          </Col>

          {/* Số lớp */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                background: "linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Flex align="center" gap={16}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: "#D1FAE5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "2px solid #A7F3D0",
                  }}
                >
                  <img
                    src={IMAGES.statClasses}
                    alt="Active Classes"
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: "contain",
                    }}
                  />
                </div>

                <Flex
                  vertical
                  justify="center"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <Text
                    style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}
                  >
                    Lớp phụ trách
                  </Text>
                  <Title
                    level={2}
                    style={{
                      margin: "2px 0 4px",
                      color: "#10B981",
                      fontWeight: 800,
                    }}
                  >
                    {String(totalClasses).padStart(1, "0")}
                  </Title>
                  <Text
                    style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}
                  >
                    <span style={{ color: "#059669", fontWeight: 700 }}>
                      {activeClasses} lớp
                    </span>{" "}
                    hoạt động 🌟
                  </Text>
                </Flex>
              </Flex>
            </Card>
          </Col>

          {/* Bài học */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                background: "linear-gradient(135deg, #FFFFFF 0%, #F3E8FF 100%)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Flex align="center" gap={16}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: "#E9D5FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "2px solid #DDD6FE",
                  }}
                >
                  <img
                    src={IMAGES.statLessons}
                    alt="Created Lessons"
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: "contain",
                    }}
                  />
                </div>

                <Flex
                  vertical
                  justify="center"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <Text
                    style={{ fontSize: 13, fontWeight: 700, color: "#581C87" }}
                  >
                    Bài học đã soạn
                  </Text>
                  <Title
                    level={2}
                    style={{
                      margin: "2px 0 4px",
                      color: "#9333EA",
                      fontWeight: 800,
                    }}
                  >
                    {totalLessons}
                  </Title>
                  <Text
                    style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}
                  >
                    <span style={{ color: "#7E22CE", fontWeight: 700 }}>
                      +{newLessons} bài mới
                    </span>{" "}
                    tháng này ✨
                  </Text>
                </Flex>
              </Flex>
            </Card>
          </Col>

          {/* Tỷ lệ hoàn thành */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                background: "linear-gradient(135deg, #FFFFFF 0%, #FEF3C7 100%)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Flex align="center" gap={16}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: "#FDE68A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "2px solid #FCD34D",
                  }}
                >
                  <img
                    src={IMAGES.statAchievements}
                    alt="Completion Rate"
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: "contain",
                    }}
                  />
                </div>

                <Flex
                  vertical
                  justify="center"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <Text
                    style={{ fontSize: 13, fontWeight: 700, color: "#78350F" }}
                  >
                    Tỷ lệ hoàn thành
                  </Text>
                  <Title
                    level={2}
                    style={{
                      margin: "2px 0 4px",
                      color: "#D97706",
                      fontWeight: 800,
                    }}
                  >
                    {completionRate}%
                  </Title>
                  <Flex align="center" gap={4}>
                    <Tag
                      style={{
                        borderRadius: 12,
                        margin: 0,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#D97706",
                        background: "#FEF3C7",
                        border: "none",
                      }}
                    >
                      <RiseOutlined /> +{completionCompare}%
                    </Tag>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        fontWeight: 600,
                      }}
                    >
                      vs tháng trước
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          </Col>
        </Row>

        {/* =====================================================
            2. CHART + QUIZ + WORD OF GOD
        ====================================================== */}
        <Row gutter={[20, 20]}>
          {/* Biểu đồ */}
          <Col xs={24} lg={10}>
            <Card
              title={
                <Flex align="center" gap={8}>
                  <Sparkles size={18} color="#3B82F6" />
                  <Title
                    level={5}
                    style={{ margin: 0, fontWeight: 800, color: "#1E3A8A" }}
                  >
                    Tiến độ học tập tuần này
                  </Title>
                </Flex>
              }
              extra={
                <Segmented
                  options={["Tuần", "Tháng"]}
                  value={timeRange}
                  onChange={setTimeRange}
                  style={{
                    background: "#EFF6FF",
                    padding: 3,
                    borderRadius: 14,
                    fontWeight: 700,
                  }}
                />
              }
              bordered={false}
              style={chibiCardStyle}
              bodyStyle={{ padding: 24 }}
            >
              <div
                style={{
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    height: 160,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    padding: "0 10px",
                    borderBottom: "2px dashed #BFDBFE",
                    position: "relative",
                  }}
                >
                  {weeklyProgress.length > 0 ? (
                    weeklyProgress.map((item, index) => {
                      const value = Math.min(
                        100,
                        Math.max(0, Number(item?.value || 0)),
                      );

                      return (
                        <Flex
                          vertical
                          align="center"
                          key={`${item?.day}-${index}`}
                          style={{
                            height: "100%",
                            justifyContent: "flex-end",
                            width: "11%",
                          }}
                        >
                          <Tooltip title={`${item?.day}: ${value}%`}>
                            <div
                              style={{
                                width: "100%",
                                maxWidth: 22,
                                height: `${value}%`,
                                minHeight: value > 0 ? 6 : 0,
                                background:
                                  item?.day === "CN"
                                    ? "linear-gradient(180deg, #FF6B8B 0%, #FF85A1 100%)"
                                    : "linear-gradient(180deg, #60A5FA 0%, #93C5FD 100%)",
                                borderRadius: "10px 10px 4px 4px",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                boxShadow: "0 4px 10px rgba(96, 165, 250, 0.2)",
                              }}
                            />
                          </Tooltip>
                        </Flex>
                      );
                    })
                  ) : (
                    <Flex
                      style={{ width: "100%", height: "100%" }}
                      align="center"
                      justify="center"
                    >
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có dữ liệu"
                      />
                    </Flex>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 10px 0",
                    fontSize: 12,
                    color: "#64748B",
                    fontWeight: 700,
                  }}
                >
                  {weeklyProgress.map((item, index) => (
                    <span
                      key={index}
                      style={{
                        color: item?.day === "CN" ? "#FF6B8B" : "#64748B",
                        fontWeight: item?.day === "CN" ? 800 : 700,
                      }}
                    >
                      {item?.day}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </Col>

          {/* Kết quả quiz */}
          <Col xs={24} lg={7}>
            <Card
              title={
                <Flex align="center" gap={8}>
                  <Trophy size={18} color="#10B981" />
                  <Title
                    level={5}
                    style={{ margin: 0, fontWeight: 800, color: "#065F46" }}
                  >
                    Kết quả trắc nghiệm
                  </Title>
                </Flex>
              }
              bordered={false}
              style={chibiCardStyle}
              bodyStyle={{ padding: 24 }}
            >
              <Flex
                vertical
                justify="center"
                align="center"
                gap={20}
                style={{ height: 200 }}
              >
                <Progress
                  type="dashboard"
                  percent={correctPct}
                  format={(percent) => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 26,
                          fontWeight: 800,
                          color: "#10B981",
                        }}
                      >
                        {percent}%
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                          fontWeight: 700,
                        }}
                      >
                        Chính xác
                      </span>
                    </div>
                  )}
                  strokeColor={{
                    "0%": "#10B981",
                    "100%": "#34D399",
                  }}
                  trailColor="#E5E7EB"
                  size={135}
                  strokeWidth={10}
                />

                <Flex
                  justify="space-between"
                  style={{
                    width: "100%",
                    background: "#F0FDF4",
                    padding: "10px 14px",
                    borderRadius: 16,
                    border: "1.5px solid #DCFCE7",
                  }}
                >
                  <Badge
                    color="#10B981"
                    text={
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#065F46",
                        }}
                      >
                        Đúng {correctPct}%
                      </Text>
                    }
                  />
                  <Badge
                    color="#FF6B8B"
                    text={
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#9F1239",
                        }}
                      >
                        Sai {wrongPct}%
                      </Text>
                    }
                  />
                  <Badge
                    color="#F59E0B"
                    text={
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#92400E",
                        }}
                      >
                        Chưa {uncompletedPct}%
                      </Text>
                    }
                  />
                </Flex>
              </Flex>
            </Card>
          </Col>

          {/* Lời Chúa */}
          <Col xs={24} lg={7}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)",
                border: "2px solid #FDE68A",
                position: "relative",
              }}
              bodyStyle={{ padding: 24, height: "100%" }}
            >
              <Flex
                vertical
                justify="space-between"
                style={{ height: 200, position: "relative", zIndex: 1 }}
              >
                <div>
                  <Flex align="center" justify="space-between">
                    <Tag
                      style={{
                        borderRadius: 14,
                        fontWeight: 800,
                        padding: "3px 12px",
                        margin: 0,
                        background: "#F59E0B",
                        color: "#FFFFFF",
                        border: "none",
                        boxShadow: "0 4px 10px rgba(245, 158, 11, 0.3)",
                      }}
                    >
                      <Sparkles
                        size={13}
                        style={{ marginRight: 4, display: "inline" }}
                      />
                      LỜI CHÚA HÔM NAY
                    </Tag>
                    <Heart size={20} fill="#FF6B8B" color="#FF6B8B" />
                  </Flex>

                  <Paragraph
                    style={{
                      marginTop: 16,
                      color: "#78350F",
                      fontWeight: 700,
                      fontSize: 13.5,
                      lineHeight: 1.6,
                      fontStyle: "italic",
                    }}
                  >
                    "
                    {dailyVerse?.verse_text || "Đang tải Lời Chúa ngọt ngào..."}
                    "
                  </Paragraph>
                </div>

                <Flex align="center" justify="flex-end">
                  <Text
                    strong
                    style={{
                      color: "#D97706",
                      fontSize: 12.5,
                      fontWeight: 800,
                    }}
                  >
                    – {dailyVerse?.reference || "Tân Ước"} –
                  </Text>
                </Flex>
              </Flex>
            </Card>
          </Col>
        </Row>

        {/* =====================================================
            3. QUICK ACTION + STUDENTS
        ====================================================== */}
        <Row gutter={[20, 20]}>
          {/* Thao tác nhanh */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Flex align="center" gap={8}>
                  <Sparkles size={18} color="#FF6B8B" />
                  <Title
                    level={5}
                    style={{ margin: 0, fontWeight: 800, color: "#881337" }}
                  >
                    Thao tác nhanh
                  </Title>
                </Flex>
              }
              bordered={false}
              style={{ ...chibiCardStyle, height: "100%" }}
              bodyStyle={{ padding: 20 }}
            >
              <Row gutter={[12, 12]}>
                {/* Soạn bài */}
                <Col span={12}>
                  <Button
                    type="text"
                    onClick={() => navigate("/catechist/lessons")}
                    style={{
                      height: 92,
                      width: "100%",
                      borderRadius: 20,
                      background: "#FFF0F5",
                      color: "#FF6B8B",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      border: "1.5px solid #FBCFE8",
                      fontWeight: 800,
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div
                      style={{
                        background: "#FF6B8B",
                        color: "#fff",
                        padding: 8,
                        borderRadius: 12,
                        display: "flex",
                        boxShadow: "0 4px 10px rgba(255, 107, 139, 0.3)",
                      }}
                    >
                      <PlusOutlined style={{ fontSize: 16 }} />
                    </div>
                    <span style={{ fontSize: 12 }}>Bài học</span>
                  </Button>
                </Col>

                {/* Học sinh */}
                <Col span={12}>
                  <Button
                    type="text"
                    onClick={() => navigate("/catechist/students")}
                    style={{
                      height: 92,
                      width: "100%",
                      borderRadius: 20,
                      background: "#ECFDF5",
                      color: "#059669",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      border: "1.5px solid #A7F3D0",
                      fontWeight: 800,
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div
                      style={{
                        background: "#10B981",
                        color: "#fff",
                        padding: 8,
                        borderRadius: 12,
                        display: "flex",
                        boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      <QuestionOutlined style={{ fontSize: 16 }} />
                    </div>
                    <span style={{ fontSize: 12 }}>Học sinh</span>
                  </Button>
                </Col>

                {/* Game */}
                <Col span={12}>
                  <Button
                    type="text"
                    onClick={() => navigate("/catechist/games")}
                    style={{
                      height: 92,
                      width: "100%",
                      borderRadius: 20,
                      background: "#F3E8FF",
                      color: "#7E22CE",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      border: "1.5px solid #DDD6FE",
                      fontWeight: 800,
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div
                      style={{
                        background: "#9333EA",
                        color: "#fff",
                        padding: 8,
                        borderRadius: 12,
                        display: "flex",
                        boxShadow: "0 4px 10px rgba(147, 51, 234, 0.3)",
                      }}
                    >
                      <Gamepad2 size={16} />
                    </div>
                    <span style={{ fontSize: 12 }}>Tạo trò chơi</span>
                  </Button>
                </Col>

                {/* Bảng thành tích */}
                <Col span={12}>
                  <Button
                    type="text"
                    onClick={() => navigate("/catechist/leaderboard")}
                    style={{
                      height: 92,
                      width: "100%",
                      borderRadius: 20,
                      background: "#FEF3C7",
                      color: "#D97706",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      border: "1.5px solid #FDE68A",
                      fontWeight: 800,
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div
                      style={{
                        background: "#F59E0B",
                        color: "#fff",
                        padding: 8,
                        borderRadius: 12,
                        display: "flex",
                        boxShadow: "0 4px 10px rgba(245, 158, 11, 0.3)",
                      }}
                    >
                      <SendOutlined style={{ fontSize: 16 }} />
                    </div>
                    <span style={{ fontSize: 12 }}>Thành tích</span>
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Học sinh cần quan tâm */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Flex align="center" gap={8}>
                  <Heart size={18} fill="#FF6B8B" color="#FF6B8B" />
                  <Title
                    level={5}
                    style={{ margin: 0, fontWeight: 800, color: "#881337" }}
                  >
                    Học sinh cần quan tâm
                  </Title>
                </Flex>
              }
              bordered={false}
              style={{ ...chibiCardStyle, height: "100%" }}
              bodyStyle={{ padding: "12px 20px" }}
            >
              <List
                itemLayout="horizontal"
                dataSource={studentsSupportData}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: "12px 14px",
                      borderRadius: 18,
                      marginBottom: 8,
                      background: "#FAFAFA",
                      border: "1px solid #F3F4F6",
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: "#FFE4E6",
                            color: "#FF6B8B",
                            fontWeight: 800,
                            border: "1.5px solid #FBCFE8",
                          }}
                        >
                          {item.name.charAt(0)}
                        </Avatar>
                      }
                      title={
                        <Flex align="center" gap={8}>
                          <Text
                            style={{
                              fontWeight: 800,
                              fontSize: 14,
                              color: "#374151",
                            }}
                          >
                            {item.name}
                          </Text>
                          <Tag
                            style={{
                              borderRadius: 12,
                              margin: 0,
                              fontWeight: 700,
                              fontSize: 11,
                              color: item.color,
                              background: item.bg,
                              border: "none",
                            }}
                          >
                            {item.status}
                          </Tag>
                        </Flex>
                      }
                      description={
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#6B7280",
                            fontWeight: 600,
                          }}
                        >
                          {item.class} • {item.note}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
}
