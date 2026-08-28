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
} from "antd";
import {
  PlusOutlined,
  QuestionOutlined,
  SendOutlined,
  RiseOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Gamepad2, Sparkles } from "lucide-react";

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

      console.log("📊 Dashboard Catechist:", response);

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
  console.log(dailyVerse);

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
        }}
      >
        <Flex vertical align="center" gap={16}>
          <Spin size="large" />

          <Text type="secondary">Đang tải dữ liệu dashboard...</Text>
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
            borderRadius: 20,
            textAlign: "center",
            maxWidth: 450,
            width: "100%",
          }}
        >
          <Empty description="Không thể tải dữ liệu dashboard" />

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchDashboard}
            style={{
              marginTop: 16,
              borderRadius: 10,
            }}
          >
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

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

  // =====================================================
  // WEEKLY PROGRESS
  // =====================================================

  const weeklyProgress = dashboard?.weekly_progress?.chart_data || [];

  // =====================================================
  // QUIZ
  // =====================================================

  const quizMetrics = dashboard?.quiz_metrics || {};

  const correctPct = quizMetrics?.correct_pct ?? 0;

  const wrongPct = quizMetrics?.wrong_pct ?? 0;

  const uncompletedPct = quizMetrics?.uncompleted_pct ?? 0;

  // =====================================================
  // CARD STYLE
  // =====================================================

  const cardStyle = {
    borderRadius: 20,
    border: "1px solid #f1f5f9",
    boxShadow:
      "0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 8px 10px -6px rgba(15, 23, 42, 0.02)",
    background: "#ffffff",
    overflow: "hidden",
  };

  // =====================================================
  // STUDENTS SUPPORT MOCK
  // =====================================================

  const studentsSupportData = [
    {
      id: 1,
      name: "Maria An",
      class: "Lớp 3A - Ấu Nhi",
      status: "Cần hỗ trợ",
      color: "error",
      note: "Chưa hoàn thành 2 bài trắc nghiệm",
    },
    {
      id: 2,
      name: "Giuse Minh",
      class: "Lớp 4B - Thiếu Nhi",
      status: "Đang tiến bộ",
      color: "warning",
      note: "Điểm trắc nghiệm tăng 15%",
    },
    {
      id: 3,
      name: "Têrêsa Hân",
      class: "Lớp 5A - Nghĩa Sĩ",
      status: "Cần hỗ trợ",
      color: "error",
      note: "Vắng mặt 2 buổi học gần nhất",
    },
    {
      id: 4,
      name: "Phêrô Khang",
      class: "Lớp 4A - Thiếu Nhi",
      status: "Xuất sắc",
      color: "success",
      note: "Đạt điểm tối đa bài kiểm tra",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: "8px 4px",
      }}
    >
      {/* =====================================================
          1. TOP METRICS
      ====================================================== */}

      <Row gutter={[20, 20]}>
        {/* Tổng học sinh */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={cardStyle} bodyStyle={{ padding: 20 }}>
            <Flex align="center" gap={16}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src={IMAGES.statStudents}
                  alt="Total Students"
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: "contain",
                  }}
                />
              </div>

              <Flex
                vertical
                justify="center"
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Tổng học sinh
                </Text>

                <Title
                  level={2}
                  style={{
                    margin: "2px 0 4px",
                    color: "#0f172a",
                    fontWeight: 700,
                  }}
                >
                  {totalStudents}
                </Title>

                <Flex align="center" gap={4}>
                  <Tag
                    color="success"
                    style={{
                      borderRadius: 12,
                      margin: 0,
                      padding: "0 6px",
                      fontSize: 11,
                    }}
                  >
                    <RiseOutlined /> +{studentCompare}%
                  </Tag>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                      whiteSpace: "nowrap",
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
          <Card bordered={false} style={cardStyle} bodyStyle={{ padding: 20 }}>
            <Flex align="center" gap={16}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src={IMAGES.statClasses}
                  alt="Active Classes"
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: "contain",
                  }}
                />
              </div>

              <Flex
                vertical
                justify="center"
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Số lớp phụ trách
                </Text>

                <Title
                  level={2}
                  style={{
                    margin: "2px 0 4px",
                    color: "#0f172a",
                    fontWeight: 700,
                  }}
                >
                  {String(totalClasses).padStart(2, "0")}
                </Title>

                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: "#16a34a",
                      fontWeight: 600,
                    }}
                  >
                    {activeClasses} lớp
                  </span>{" "}
                  đang hoạt động
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Col>

        {/* Bài học */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={cardStyle} bodyStyle={{ padding: 20 }}>
            <Flex align="center" gap={16}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "#faf5ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src={IMAGES.statLessons}
                  alt="Created Lessons"
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: "contain",
                  }}
                />
              </div>

              <Flex
                vertical
                justify="center"
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Bài học đã soạn
                </Text>

                <Title
                  level={2}
                  style={{
                    margin: "2px 0 4px",
                    color: "#0f172a",
                    fontWeight: 700,
                  }}
                >
                  {totalLessons}
                </Title>

                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: "#9333ea",
                      fontWeight: 600,
                    }}
                  >
                    +{newLessons} bài mới
                  </span>{" "}
                  tháng này
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Col>

        {/* Tỷ lệ hoàn thành */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={cardStyle} bodyStyle={{ padding: 20 }}>
            <Flex align="center" gap={16}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "#fffbeb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src={IMAGES.statAchievements}
                  alt="Completion Rate"
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: "contain",
                  }}
                />
              </div>

              <Flex
                vertical
                justify="center"
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Tỷ lệ hoàn thành
                </Text>

                <Title
                  level={2}
                  style={{
                    margin: "2px 0 4px",
                    color: "#0f172a",
                    fontWeight: 700,
                  }}
                >
                  {completionRate}%
                </Title>

                <Flex align="center" gap={4}>
                  <Tag
                    color="warning"
                    style={{
                      borderRadius: 12,
                      margin: 0,
                      padding: "0 6px",
                      fontSize: 11,
                    }}
                  >
                    <RiseOutlined /> +{completionCompare}%
                  </Tag>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                      whiteSpace: "nowrap",
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
                <div
                  style={{
                    width: 4,
                    height: 16,
                    background: "#2563eb",
                    borderRadius: 2,
                  }}
                />

                <Title
                  level={5}
                  style={{
                    margin: 0,
                    fontWeight: 700,
                  }}
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
                  background: "#f8fafc",
                  padding: 3,
                }}
              />
            }
            bordered={false}
            style={cardStyle}
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
                  borderBottom: "1px dashed #e2e8f0",
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
                              maxWidth: 24,
                              height: `${value}%`,
                              minHeight: value > 0 ? 4 : 0,
                              background:
                                item?.day === "CN"
                                  ? "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)"
                                  : "#e2e8f0",
                              borderRadius: "6px 6px 0 0",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                            }}
                          />
                        </Tooltip>
                      </Flex>
                    );
                  })
                ) : (
                  <Flex
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
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
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                {weeklyProgress.map((item, index) => (
                  <span
                    key={index}
                    style={{
                      color: item?.day === "CN" ? "#2563eb" : "#64748b",
                      fontWeight: item?.day === "CN" ? 700 : 600,
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
                <div
                  style={{
                    width: 4,
                    height: 16,
                    background: "#10b981",
                    borderRadius: 2,
                  }}
                />

                <Title
                  level={5}
                  style={{
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  Kết quả trắc nghiệm
                </Title>
              </Flex>
            }
            bordered={false}
            style={cardStyle}
            bodyStyle={{ padding: 24 }}
          >
            <Flex
              vertical
              justify="center"
              align="center"
              gap={20}
              style={{
                height: 200,
              }}
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
                        fontSize: 24,
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {percent}%
                    </span>

                    <span
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      Chính xác
                    </span>
                  </div>
                )}
                strokeColor={{
                  "0%": "#10b981",
                  "100%": "#059669",
                }}
                trailColor="#f1f5f9"
                size={140}
                strokeWidth={10}
              />

              <Flex
                justify="space-between"
                style={{
                  width: "100%",
                  background: "#f8fafc",
                  padding: "10px 16px",
                  borderRadius: 12,
                }}
              >
                <Badge
                  color="#10b981"
                  text={
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Đúng {correctPct}%
                    </Text>
                  }
                />

                <Badge
                  color="#ef4444"
                  text={
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Sai {wrongPct}%
                    </Text>
                  }
                />

                <Badge
                  color="#f59e0b"
                  text={
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Chưa làm {uncompletedPct}%
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
              ...cardStyle,
              backgroundImage: `url(${IMAGES.wordOfGodBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              position: "relative",
              overflow: "hidden",
            }}
            bodyStyle={{
              padding: 24,
              height: "100%",
            }}
          >
            <Flex
              vertical
              justify="space-between"
              style={{
                height: 200,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div>
                <Flex align="center" justify="space-between">
                  <Tag
                    color="warning"
                    style={{
                      borderRadius: 12,
                      fontWeight: 700,
                      padding: "2px 10px",
                      margin: 0,
                      boxShadow: "0 2px 6px rgba(217, 119, 6, 0.15)",
                    }}
                  >
                    <Sparkles
                      size={12}
                      style={{
                        marginRight: 4,
                        display: "inline",
                      }}
                    />
                    LỜI CHÚA HÔM NAY
                  </Tag>

                  <Text
                    style={{
                      fontSize: 20,
                      color: "#d97706",
                    }}
                  >
                    ✝
                  </Text>
                </Flex>

                <Paragraph
                  style={{
                    marginTop: 16,
                    color: "#78350f",
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontStyle: "italic",
                  }}
                >
                  "{dailyVerse?.verse_text || "Đang tải Lời Chúa..."}"
                </Paragraph>
              </div>

              <Flex align="center" justify="space-between">
                <Text
                  strong
                  style={{
                    color: "#b45309",
                    fontSize: 13,
                  }}
                >
                  – {dailyVerse?.reference || ""} –
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
                <div
                  style={{
                    width: 4,
                    height: 16,
                    background: "#f97316",
                    borderRadius: 2,
                  }}
                />

                <Title
                  level={5}
                  style={{
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  Thao tác nhanh
                </Title>
              </Flex>
            }
            bordered={false}
            style={{
              ...cardStyle,
              height: "100%",
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Row gutter={[12, 12]}>
              {/* Soạn bài */}
              <Col span={12}>
                <Button
                  type="text"
                  onClick={() => navigate("/catechist/lessons")}
                  style={{
                    height: 90,
                    width: "100%",
                    borderRadius: 16,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    border: "1px solid #dbeafe",
                  }}
                >
                  <div
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      padding: 8,
                      borderRadius: 10,
                      display: "flex",
                    }}
                  >
                    <PlusOutlined style={{ fontSize: 16 }} />
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Bài học
                  </span>
                </Button>
              </Col>

              {/* Tạo câu hỏi */}
              <Col span={12}>
                <Button
                  type="text"
                  onClick={() => navigate("/catechist/students")}
                  style={{
                    height: 90,
                    width: "100%",
                    borderRadius: 16,
                    background: "#ecfdf5",
                    color: "#047857",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    border: "1px solid #a7f3d0",
                  }}
                >
                  <div
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      padding: 8,
                      borderRadius: 10,
                      display: "flex",
                    }}
                  >
                    <QuestionOutlined style={{ fontSize: 16 }} />
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Học sinh
                  </span>
                </Button>
              </Col>

              {/* Game */}
              <Col span={12}>
                <Button
                  type="text"
                  onClick={() => navigate("/catechist/games")}
                  style={{
                    height: 90,
                    width: "100%",
                    borderRadius: 16,
                    background: "#faf5ff",
                    color: "#6b21a8",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    border: "1px solid #e9d5ff",
                  }}
                >
                  <div
                    style={{
                      background: "#9333ea",
                      color: "#fff",
                      padding: 8,
                      borderRadius: 10,
                      display: "flex",
                    }}
                  >
                    <Gamepad2 size={16} />
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Tạo trò chơi
                  </span>
                </Button>
              </Col>

              {/* Giao bài */}
              <Col span={12}>
                <Button
                  type="text"
                  onClick={() => navigate("/catechist/classes")}
                  style={{
                    height: 90,
                    width: "100%",
                    borderRadius: 16,
                    background: "#fff7ed",
                    color: "#c2410c",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    border: "1px solid #ffedd5",
                  }}
                >
                  <div
                    style={{
                      background: "#f97316",
                      color: "#fff",
                      padding: 8,
                      borderRadius: 10,
                      display: "flex",
                    }}
                  >
                    <SendOutlined style={{ fontSize: 16 }} />
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Lớp học
                  </span>
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Học sinh */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Flex align="center" gap={8}>
                <div
                  style={{
                    width: 4,
                    height: 16,
                    background: "#ef4444",
                    borderRadius: 2,
                  }}
                />

                <Title
                  level={5}
                  style={{
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  Theo dõi học sinh
                </Title>
              </Flex>
            }
            extra={
              <Button
                type="link"
                style={{
                  padding: 0,
                  color: "#2563eb",
                  fontWeight: 600,
                }}
              >
                Xem danh sách lớp
              </Button>
            }
            bordered={false}
            style={cardStyle}
            bodyStyle={{
              padding: "8px 20px",
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={studentsSupportData}
              renderItem={(student) => (
                <List.Item
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #f8fafc",
                  }}
                  actions={[
                    <Button
                      key="remind"
                      type="default"
                      size="small"
                      style={{
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    >
                      Nhắc nhở
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                        style={{
                          backgroundColor: "#f1f5f9",
                          width: 40,
                          height: 40,
                        }}
                      />
                    }
                    title={
                      <Flex align="center" gap={8}>
                        <Text
                          strong
                          style={{
                            fontSize: 14,
                          }}
                        >
                          {student.name}
                        </Text>

                        <Tag
                          color={student.color}
                          style={{
                            borderRadius: 10,
                            fontSize: 11,
                            border: "none",
                          }}
                        >
                          {student.status}
                        </Tag>
                      </Flex>
                    }
                    description={
                      <Flex gap={12} align="center">
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                          }}
                        >
                          {student.class}
                        </Text>

                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                          }}
                        >
                          • {student.note}
                        </Text>
                      </Flex>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
