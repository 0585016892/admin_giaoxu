import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  ConfigProvider,
  Table,
  Tag,
  Spin,
  Tabs,
  Badge,
} from "antd";

import {
  EyeOutlined,
  UserOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CompassOutlined,
  LineChartOutlined,
  DesktopOutlined,
  MobileOutlined,
  AppleOutlined,
  WindowsOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  TableOutlined,
} from "@ant-design/icons";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import socket from "../socket/socket";
import { getVisitorStats, getVisitorChart } from "../api/statApi";

const { Title, Text } = Typography;

// Bảng ánh xạ page_url từ DB ra tên trang hiển thị tiếng Việt
const FIXED_ROUTE_MAP = {
  "/": "Trang Chủ (Home)",
  "/giao-ly/hon-nhan": "Giáo Lý Hôn Nhân",
  "/giao-ly/du-tong": "Giáo Lý Dự Tòng",
  "/prayers": "Kinh Đọc Hằng Ngày",
  "/prayers/thanh-ca": "Thánh Ca Hôn Nhân",
  "/giao-xu": "Thông Tin Giáo Xứ",
  "/tai-lieu": "Kho Tài Liệu & Biểu Mẫu",
  "/contact": "Liên Hệ & Trợ Giúp",
  "/su-kien": "Trang Sự Kiện",
  "/bang-tin": "Bảng Tin Giáo Xứ",
  "/hoi-doan": "Hội Đoàn & Đoàn Thể",
  "/exam": "Thi Trắc Nghiệm Giáo Lý",
  "/exam-prayer": "Khảo Kinh Giọng Nói AI",
  "/exam-search": "Tra Cứu Kết Quả Kiểm Tra",
  "/terms": "Điều Khoản Sử Dụng",
  "/guide": "Hướng Dẫn Học Tập",
};

const getFriendlyPageName = (url) => {
  if (!url) return "Trang Không Xác Định";
  if (FIXED_ROUTE_MAP[url]) return FIXED_ROUTE_MAP[url];

  if (url.startsWith("/bang-tin/")) return "Chi Tiết Bảng Tin";
  if (url.startsWith("/su-kien/")) return "Chi Tiết Sự Kiện";
  if (url.startsWith("/hoi-doan/")) return "Chi Tiết Hội Đoàn";

  return url;
};

// Màu sắc cho biểu đồ tròn (Pie Chart)
const PIE_COLORS = [
  "#1B365D",
  "#D4AF37",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
];

const VisitorAnalytics = () => {
  // Bảng màu Truyền Thống & Tôn Nghiêm (Option 1)
  const primaryNavy = "#1B365D"; // Xanh Đêm Navy
  const deepNavy = "#0F1F38"; // Navy Đậm
  const accentGold = "#D4AF37"; // Vàng Đồng Ánh Kim
  const textDark = "#1E293B";
  const softBg = "#FAFAFA";

  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);

  // State nhận đầy đủ từ Controller getStats() mới
  const [stats, setStats] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    onlineUsers: 0,
    topPages: [],
    browsers: [],
    devices: [],
    visitors: [],
  });

  // State nhận từ Controller getVisitorChart()
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData();

    // Lắng nghe đếm online realtime qua Socket.io
    socket.on("onlineCount", (count) => {
      setOnlineUsers(count);
    });

    return () => {
      socket.off("onlineCount");
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statsRes, chartRes] = await Promise.all([
        getVisitorStats(),
        getVisitorChart(),
      ]);

      const statsPayload = statsRes?.data?.data || statsRes?.data || {};
      setStats({
        totalVisitors: statsPayload.totalVisitors || 0,
        todayVisitors: statsPayload.todayVisitors || 0,
        onlineUsers: statsPayload.onlineUsers || 0,
        topPages: statsPayload.topPages || [],
        browsers: statsPayload.browsers || [],
        devices: statsPayload.devices || [],
        visitors: statsPayload.visitors || [],
      });

      if (statsPayload.onlineUsers !== undefined) {
        setOnlineUsers(statsPayload.onlineUsers);
      }

      const chartPayload = chartRes?.data?.data || chartRes?.data || [];
      setChartData(chartPayload);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu thống kê:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trang Top 1 dẫn đầu
  const topOnePage = stats.topPages?.[0] || { page_url: "/", total: 0 };
  const topOneName = getFriendlyPageName(topOnePage.page_url);

  // Cột cho bảng Top Pages
  const columnsTopPages = [
    {
      title: "Trang / Đường Dẫn",
      dataIndex: "page_url",
      key: "page_url",
      render: (url) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
            {getFriendlyPageName(url)}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {url}
          </Text>
        </Space>
      ),
    },
    {
      title: "Lượt Xem",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (total) => (
        <Tag
          style={{
            background: "rgba(212, 175, 55, 0.15)",
            border: `1px solid ${accentGold}`,
            color: primaryNavy,
            fontWeight: "bold",
            borderRadius: 10,
          }}
        >
          {total} lượt
        </Tag>
      ),
    },
  ];

  // Cột cho bảng danh sách Khách truy cập gần đây (Visitors List)
  const columnsVisitors = [
    {
      title: "Trạng thái",
      dataIndex: "is_online",
      key: "is_online",
      width: 100,
      render: (isOnline) =>
        isOnline ? (
          <Badge
            status="processing"
            color="#52c41a"
            text={
              <Text style={{ color: "#52c41a", fontSize: 12, fontWeight: 600 }}>
                Online
              </Text>
            }
          />
        ) : (
          <Badge
            status="default"
            text={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Offline
              </Text>
            }
          />
        ),
    },
    {
      title: "Địa chỉ IP",
      dataIndex: "ip_address",
      key: "ip_address",
      render: (ip) => (
        <Text code style={{ color: primaryNavy }}>
          {ip || "N/A"}
        </Text>
      ),
    },
    {
      title: "Vị trí",
      key: "location",
      render: (_, record) => {
        const loc = [record.city, record.region, record.country]
          .filter(Boolean)
          .join(", ");
        return <Text style={{ fontSize: 13 }}>{loc || "Không xác định"}</Text>;
      },
    },
    {
      title: "Thiết bị & HĐH",
      key: "device_os",
      render: (_, record) => (
        <Space size={6}>
          <Tag color="blue">{record.device_type || "Desktop"}</Tag>
          <Tag color="gold">{record.os_name || "Unknown OS"}</Tag>
        </Space>
      ),
    },
    {
      title: "Trình duyệt",
      dataIndex: "browser",
      key: "browser",
      render: (browser, record) => (
        <Text style={{ fontSize: 13 }}>
          {browser || "Unknown"}{" "}
          {record.browser_version
            ? `(${record.browser_version.split(".")[0]})`
            : ""}
        </Text>
      ),
    },
    {
      title: "Trang hiện tại",
      dataIndex: "page_url",
      key: "page_url",
      render: (url) => (
        <Text style={{ fontSize: 12, color: primaryNavy }} strong>
          {getFriendlyPageName(url)}
        </Text>
      ),
    },
    {
      title: "Lần xem cuối",
      dataIndex: "updated_at",
      key: "updated_at",
      align: "right",
      render: (time) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {time ? new Date(time).toLocaleTimeString("vi-VN") : "—"}
        </Text>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 14,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="visitor-analytics-container">
        {/* HEADER SECTION */}
        <div className="analytics-header">
          <span className="analytics-badge-tag">
            <CompassOutlined /> THỐNG KÊ MỤC VỤ GIÁO XỨ
          </span>
          <Title level={2} className="analytics-main-title">
            Báo Cáo Lưu Lượng Truy Cập Website
          </Title>
          <div className="gold-accent-divider" />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Spin size="large" tip="Đang tải dữ liệu thống kê..." />
          </div>
        ) : (
          <>
            {/* 4 CARD THỐNG KÊ TỔNG QUAN */}
            <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
              {/* 1. Lượt hôm nay */}
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title={
                      <span className="stat-title-label">
                        LƯỢT TRUY CẬP HÔM NAY
                      </span>
                    }
                    value={stats.todayVisitors}
                    prefix={
                      <EyeOutlined
                        style={{ color: accentGold, marginRight: 8 }}
                      />
                    }
                    valueStyle={{
                      color: primaryNavy,
                      fontWeight: "bold",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  />
                </Card>
              </Col>

              {/* 2. Tổng người truy cập */}
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title={
                      <span className="stat-title-label">
                        TỔNG NGƯỜI TRUY CẬP
                      </span>
                    }
                    value={stats.totalVisitors}
                    prefix={
                      <UserOutlined
                        style={{ color: accentGold, marginRight: 8 }}
                      />
                    }
                    valueStyle={{
                      color: primaryNavy,
                      fontWeight: "bold",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  />
                </Card>
              </Col>

              {/* 3. Đang Online Realtime */}
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="stat-card online-card">
                  <Statistic
                    title={
                      <span
                        className="stat-title-label"
                        style={{ color: "#52c41a" }}
                      >
                        🔴 ĐANG ONLINE (5 PHÚT)
                      </span>
                    }
                    value={onlineUsers}
                    prefix={
                      <GlobalOutlined
                        style={{ color: "#52c41a", marginRight: 8 }}
                      />
                    }
                    valueStyle={{
                      color: "#52c41a",
                      fontWeight: "bold",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  />
                </Card>
              </Col>

              {/* 4. Trang xem nhiều nhất */}
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="stat-card">
                  <div className="top-page-stat-box">
                    <span className="stat-title-label">
                      TRANG XEM NHIỀU NHẤT
                    </span>
                    <div style={{ marginTop: 6 }}>
                      <Text
                        strong
                        style={{
                          color: primaryNavy,
                          fontSize: 15,
                          display: "block",
                        }}
                      >
                        {topOneName}
                      </Text>
                      <Space style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {topOnePage.page_url}
                        </Text>
                        <Tag
                          style={{
                            background: "rgba(212, 175, 55, 0.15)",
                            borderColor: accentGold,
                            color: primaryNavy,
                            fontWeight: "bold",
                            fontSize: 11,
                          }}
                        >
                          {topOnePage.total} lượt
                        </Tag>
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* BIỂU ĐỒ 7 NGÀY & PHÂN TÍCH THIẾT BỊ */}
            <Row gutter={[24, 24]} style={{ marginBottom: 28 }}>
              {/* Biểu đồ đường 7 ngày */}
              <Col xs={24} lg={16}>
                <Card
                  bordered={false}
                  className="analytics-chart-card"
                  title={
                    <span className="chart-card-title">
                      <LineChartOutlined
                        style={{ color: accentGold, marginRight: 8 }}
                      />
                      Lượt Truy Cập 7 Ngày Gần Đây
                    </span>
                  }
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(212, 175, 55, 0.15)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: primaryNavy,
                          borderRadius: 10,
                          border: `1px solid ${accentGold}`,
                          color: "#fff",
                        }}
                        itemStyle={{ color: accentGold }}
                        formatter={(value) => [
                          `${value} lượt truy cập`,
                          "Tổng",
                        ]}
                        labelFormatter={(label) => `Ngày ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke={accentGold}
                        strokeWidth={3}
                        dot={{
                          fill: primaryNavy,
                          stroke: accentGold,
                          strokeWidth: 2,
                          r: 5,
                        }}
                        activeDot={{ r: 8, fill: accentGold }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* Biểu đồ tròn Thiết bị truy cập */}
              <Col xs={24} lg={8}>
                <Card
                  bordered={false}
                  className="analytics-chart-card"
                  title={
                    <span className="chart-card-title">
                      <DesktopOutlined
                        style={{ color: accentGold, marginRight: 8 }}
                      />
                      Tỷ Lệ Thiết Bị Truy Cập
                    </span>
                  }
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={
                          stats.devices.length > 0
                            ? stats.devices
                            : [{ device_type: "Desktop", total: 1 }]
                        }
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="total"
                        nameKey="device_type"
                      >
                        {stats.devices.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            {/* BẢNG TOP PAGES & DANH SÁCH 100 VISITORS GẦN ĐÂY */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={10}>
                <Card
                  bordered={false}
                  className="analytics-chart-card"
                  title={
                    <span className="chart-card-title">
                      <FileTextOutlined
                        style={{ color: accentGold, marginRight: 8 }}
                      />
                      Top Trang Được Xem Nhiều Nhất
                    </span>
                  }
                >
                  <Table
                    columns={columnsTopPages}
                    dataSource={stats.topPages || []}
                    rowKey="page_url"
                    pagination={false}
                    size="small"
                    className="custom-analytics-table"
                  />
                </Card>
              </Col>

              <Col xs={24} lg={14}>
                <Card
                  bordered={false}
                  className="analytics-chart-card"
                  title={
                    <span className="chart-card-title">
                      <ClockCircleOutlined
                        style={{ color: accentGold, marginRight: 8 }}
                      />
                      Nhật Ký 100 Lượt Truy Cập Mới Nhất
                    </span>
                  }
                >
                  <Table
                    columns={columnsVisitors}
                    dataSource={stats.visitors || []}
                    rowKey="id"
                    pagination={{ pageSize: 6, size: "small" }}
                    size="small"
                    className="custom-analytics-table"
                    scroll={{ x: 600 }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

          .visitor-analytics-container {
            padding: 32px 24px;
            background: ${softBg};
            min-height: 100vh;
            font-family: 'Be Vietnam Pro', sans-serif;
            color: ${textDark};
          }

          .analytics-header {
            margin-bottom: 28px;
          }

          .analytics-badge-tag {
            background: rgba(212, 175, 55, 0.15);
            border: 1px solid ${accentGold};
            color: ${primaryNavy};
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
          }

          .analytics-main-title {
            font-family: 'Playfair Display', Georgia, serif !important;
            color: ${primaryNavy} !important;
            margin: 0 !important;
            font-weight: 700 !important;
          }

          .gold-accent-divider {
            width: 60px;
            height: 3px;
            background: ${accentGold};
            margin-top: 10px;
            border-radius: 2px;
          }

          /* Stat Cards */
          .stat-card {
            border-radius: 16px !important;
            background: #ffffff !important;
            border: 1px solid rgba(212, 175, 55, 0.25) !important;
            box-shadow: 0 4px 20px rgba(27, 54, 93, 0.04) !important;
            transition: all 0.3s ease !important;
            height: 100%;
          }

          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(27, 54, 93, 0.1) !important;
            border-color: ${accentGold} !important;
          }

          .online-card {
            border-color: rgba(82, 196, 26, 0.3) !important;
          }

          .stat-title-label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #64748b;
            display: block;
          }

          .top-page-stat-box {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          /* Chart & Table Cards */
          .analytics-chart-card {
            border-radius: 20px !important;
            background: #ffffff !important;
            border: 1px solid rgba(212, 175, 55, 0.25) !important;
            box-shadow: 0 8px 24px rgba(27, 54, 93, 0.05) !important;
            height: 100%;
          }

          .chart-card-title {
            font-family: 'Playfair Display', Georgia, serif;
            color: ${primaryNavy};
            font-size: 17px;
            font-weight: 700;
          }

          .custom-analytics-table .ant-table {
            background: transparent;
          }

          .custom-analytics-table .ant-table-thead > tr > th {
            background: ${softBg} !important;
            color: ${primaryNavy} !important;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
          }

          @media (max-width: 768px) {
            .visitor-analytics-container { padding: 20px 12px; }
          }
        `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default VisitorAnalytics;
