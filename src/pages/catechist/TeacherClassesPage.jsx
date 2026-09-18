import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Card,
  Col,
  Empty,
  Row,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  PauseCircleOutlined,
  ReadOutlined,
  StopOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import classApi from "../../api/classApi";
import { useUser } from "../../context/UserContext";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";
import ErrorPage from "./ErrorPage";
import AppSearchInput from "../../components/common/SearchInput";

const { Title, Text } = Typography;

/* =========================================================
   DESIGN SYSTEM COLORS (Navy & Gold Professional Theme)
========================================================= */

const COLORS = {
  primary: "#173B5E", // Navy chủ đạo
  primaryDark: "#0F2942", // Navy đậm
  primaryLight: "#F0F4F8", // Nền phụ Navy nhạt
  primaryBorder: "#D9E2EC", // Viền xám ánh Navy

  gold: "#D9A441", // Vàng Gold điểm nhấn
  goldLight: "#FDF8ED", // Nền Gold nhạt

  green: "#10B981",
  greenLight: "#ECFDF5",

  amber: "#F59E0B",
  amberLight: "#FEF3C7",

  slate: "#64748B",
  slateLight: "#F8FAFC",

  textMain: "#1E293B",
  textMuted: "#64748B",
  cardBg: "#FFFFFF",
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeListResponse = (response) => {
  const data = response?.data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

const formatTime = (time) => (time ? String(time).slice(0, 5) : "—");

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
    sunday: "Chúa Nhật",
    monday: "Thứ Hai",
    tuesday: "Thứ Ba",
    wednesday: "Thứ Tư",
    thursday: "Thứ Năm",
    friday: "Thứ Sáu",
    saturday: "Thứ Bảy",
  };
  return days[day] || day || "Chưa cập nhật";
};

const getStatusConfig = (status) => {
  const configs = {
    active: {
      label: "Đang học",
      color: COLORS.green,
      bg: COLORS.greenLight,
      icon: <CheckCircleOutlined />,
    },
    paused: {
      label: "Tạm dừng",
      color: COLORS.amber,
      bg: COLORS.amberLight,
      icon: <PauseCircleOutlined />,
    },
    completed: {
      label: "Đã hoàn thành",
      color: COLORS.slate,
      bg: COLORS.slateLight,
      icon: <StopOutlined />,
    },
  };
  return configs[status] || configs.active;
};

/* =========================================================
   SUB-COMPONENTS
========================================================= */

// Item hiển thị thông tin chi tiết trong thẻ lớp học
const InfoBlock = ({ icon, label, value }) => (
  <div
    style={{
      padding: "12px 14px",
      borderRadius: 14,
      background: COLORS.primaryLight,
      border: `1.5px solid ${COLORS.primaryBorder}`,
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <div
      style={{
        fontSize: 16,
        color: COLORS.primary,
        display: "flex",
        alignItems: "center",
      }}
    >
      {icon}
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <Text
        style={{
          display: "block",
          fontSize: 10,
          color: COLORS.textMuted,
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <Text strong ellipsis style={{ fontSize: 13, color: COLORS.textMain }}>
        {value}
      </Text>
    </div>
  </div>
);

/* =========================================================
   CLASS CARD COMPONENT
========================================================= */

const ClassCard = ({ classData }) => {
  const statusCfg = getStatusConfig(classData?.status);
  const isMainRole =
    classData?.catechist_role?.toLowerCase()?.includes("chủ nhiệm") ||
    classData?.catechist_role?.toLowerCase()?.includes("trưởng");

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 20,
        background: COLORS.cardBg,
        border: `1.5px solid ${COLORS.primaryBorder}`,
        boxShadow: "0 10px 30px -5px rgba(23, 59, 94, 0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      styles={{ body: { padding: "20px 24px" } }}
    >
      {/* HEADER LỚP HỌC */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Space size={12} align="start">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, #173B5E 0%, #204E7A 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(23, 59, 94, 0.2)",
            }}
          >
            <ReadOutlined />
          </div>
          <div>
            <Space size={8} wrap style={{ marginBottom: 4 }}>
              <Tag
                bordered={false}
                style={{
                  borderRadius: 6,
                  fontWeight: 800,
                  color: COLORS.primaryDark,
                  background: COLORS.primaryLight,
                  border: `1px solid ${COLORS.primaryBorder}`,
                  margin: 0,
                }}
              >
                MÃ: {classData?.code || "N/A"}
              </Tag>
              {classData?.category && (
                <Tag
                  bordered={false}
                  style={{
                    borderRadius: 6,
                    fontWeight: 700,
                    color: "#9A6B1F",
                    background: COLORS.goldLight,
                    border: "1px solid #F3E2C2",
                    margin: 0,
                  }}
                >
                  {classData.category}
                </Tag>
              )}
            </Space>
            <Title
              level={4}
              style={{ margin: 0, color: COLORS.textMain, fontWeight: 800 }}
            >
              {classData?.name || "Chưa đặt tên lớp"}
            </Title>
          </div>
        </Space>

        <Tag
          bordered={false}
          style={{
            margin: 0,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 700,
            color: statusCfg.color,
            background: statusCfg.bg,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {statusCfg.icon}
          {statusCfg.label}
        </Tag>
      </div>

      {/* GRID LỊCH HỌC VÀ ĐỊA ĐIỂM */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <InfoBlock
            icon={<CalendarOutlined />}
            label="Thứ học"
            value={getDayName(classData?.day_of_week)}
          />
        </Col>
        <Col xs={12} sm={6}>
          <InfoBlock
            icon={<ClockCircleOutlined />}
            label="Giờ học"
            value={`${formatTime(classData?.start_time)} - ${formatTime(classData?.end_time)}`}
          />
        </Col>
        <Col xs={12} sm={6}>
          <InfoBlock
            icon={<EnvironmentOutlined />}
            label="Phòng học"
            value={classData?.room || "Chưa xếp"}
          />
        </Col>
        <Col xs={12} sm={6}>
          <InfoBlock
            icon={<TeamOutlined />}
            label="Sĩ số lớp"
            value={`${classData?.studentsCount || 0} Học viên`}
          />
        </Col>
      </Row>

      {/* FOOTER CHỨA THỜI GIAN VÀ VAI TRÒ */}
      <div
        style={{
          padding: "10px 16px",
          borderRadius: 14,
          background: COLORS.primaryLight,
          border: `1.5px solid ${COLORS.primaryBorder}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Space size={6}>
          <CalendarOutlined style={{ color: COLORS.primary }} />
          <Text style={{ fontSize: 12, color: COLORS.slate, fontWeight: 600 }}>
            Thời gian:{" "}
            <span style={{ color: COLORS.textMain, fontWeight: 700 }}>
              {classData?.start_date
                ? dayjs(classData.start_date).format("DD/MM/YYYY")
                : "—"}
              {" đến "}
              {classData?.end_date
                ? dayjs(classData.end_date).format("DD/MM/YYYY")
                : "—"}
            </span>
          </Text>
        </Space>

        <Tag
          bordered={false}
          style={{
            margin: 0,
            borderRadius: 8,
            fontWeight: 700,
            color: isMainRole ? "#9A6B1F" : COLORS.primary,
            background: isMainRole ? COLORS.goldLight : "#E2E8F0",
            padding: "3px 10px",
          }}
        >
          Vai trò: {classData?.catechist_role || "Giáo lý viên"}
        </Tag>
      </div>

      {classData?.description && (
        <Text
          type="secondary"
          style={{
            display: "block",
            fontSize: 12,
            marginTop: 10,
            paddingLeft: 4,
            fontStyle: "italic",
          }}
        >
          💬 {classData.description}
        </Text>
      )}
    </Card>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

const TeacherClassesPage = () => {
  const { user } = useUser();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classApi.getClassTeacher();
      const list = normalizeListResponse(response);
      setClasses(Array.isArray(list) ? list : []);
    } catch (err) {
      setClasses([]);
      setError(
        err?.response?.data?.message ||
          "Không thể tải danh sách lớp học phụ trách!",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Lọc danh sách lớp học
  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      const matchSearch =
        !searchText.trim() ||
        item?.name?.toLowerCase().includes(searchText.trim().toLowerCase()) ||
        item?.code?.toLowerCase().includes(searchText.trim().toLowerCase());

      const matchStatus =
        statusFilter === "all" || (item?.status || "active") === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [classes, searchText, statusFilter]);

  // Tính tổng sĩ số học viên
  const totalStudents = useMemo(() => {
    return classes.reduce(
      (sum, item) => sum + Number(item?.studentsCount || 0),
      0,
    );
  }, [classes]);

  if (error) {
    return (
      <ErrorPage
        title="Không thể lấy danh sách lớp"
        message={error}
        onRetry={fetchClasses}
      />
    );
  }

  return (
    <div
      style={{
        maxWidth: 1250,
        margin: "0 auto",
        paddingBottom: 40,
        fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
      }}
    >
      {/* PAGE HERO HEADER */}
      <PageHeroHeader
        icon={<BookOutlined />}
        title="Lớp Học Phụ Trách"
        description="Danh sách các lớp Giáo lý được phân công quản lý và giảng dạy"
        onRefresh={fetchClasses}
        refreshLoading={loading}
      />

      {/* STAT CARDS ROW */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Tổng số lớp"
            value={classes.length}
            suffix="lớp"
            icon={<BookOutlined />}
            color={COLORS.primary}
            bg={COLORS.primaryLight}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Tổng sĩ số"
            value={totalStudents}
            suffix="học viên"
            icon={<TeamOutlined />}
            color="#2563EB"
            bg="#EFF6FF"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Sĩ số trung bình"
            value={
              classes.length ? Math.round(totalStudents / classes.length) : 0
            }
            suffix="em / lớp"
            icon={<IdcardOutlined />}
            color={COLORS.gold}
            bg={COLORS.goldLight}
          />
        </Col>
      </Row>

      {/* CATECHIST PROFILE BANNER */}
      <Card
        bordered={false}
        style={{
          borderRadius: 20,
          background: "linear-gradient(135deg, #173B5E 0%, #204E7A 100%)",
          border: `1.5px solid ${COLORS.primaryBorder}`,
          boxShadow: "0 10px 30px -5px rgba(23, 59, 94, 0.1)",
          marginTop: 20,
        }}
        styles={{ body: { padding: "20px 24px" } }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} sm={18}>
            <Space size={16} align="center">
              <Avatar
                size={54}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: COLORS.gold,
                  color: "#173B5E",
                  boxShadow: "0 4px 12px rgba(217, 164, 65, 0.3)",
                  border: "2px solid #FFFFFF",
                  fontWeight: 700,
                }}
              />
              <div>
                <Text
                  style={{
                    fontSize: 11,
                    color: COLORS.gold,
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  GIÁO LÝ VIÊN PHỤ TRÁCH
                </Text>
                <Title
                  level={4}
                  style={{
                    margin: "2px 0 4px",
                    color: "#FFFFFF",
                    fontWeight: 800,
                  }}
                >
                  {user?.full_name || "Khánh Hưng"}
                </Title>
                <Space wrap size={8}>
                  <Tag
                    bordered={false}
                    style={{
                      borderRadius: 8,
                      fontWeight: 700,
                      margin: 0,
                      background: "rgba(255,255,255,0.15)",
                      color: "#FFFFFF",
                    }}
                  >
                    Thánh danh: {user?.holy_name || "Chưa cập nhật"}
                  </Tag>
                  <Tag
                    bordered={false}
                    style={{
                      borderRadius: 8,
                      fontWeight: 700,
                      margin: 0,
                      background: COLORS.gold,
                      color: "#173B5E",
                    }}
                  >
                    Mã GLV: {user?.catechist_code || "N/A"}
                  </Tag>
                </Space>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* FILTER & SEARCH BAR */}
      <Row
        gutter={[16, 16]}
        align="middle"
        style={{ marginTop: 20, marginBottom: 20 }}
      >
        <Col xs={24} sm={14} md={16}>
          <AppSearchInput
            value={searchText}
            onChange={(value) => {
              setSearchText(value);
            }}
            placeholder="Tìm kiếm theo tên lớp hoặc mã lớp..."
          />
        </Col>
        <Col xs={24} sm={10} md={8}>
          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            style={{ width: "100%" }}
            size="large"
            options={[
              { value: "all", label: "🔍 Tất cả trạng thái" },
              { value: "active", label: "🟢 Đang học" },
              { value: "paused", label: "🟠 Tạm dừng" },
              { value: "completed", label: "⚪ Đã hoàn thành" },
            ]}
          />
        </Col>
      </Row>

      {/* CLASS CARDS GRID */}
      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2].map((k) => (
            <Col span={24} key={k}>
              <Card
                style={{
                  borderRadius: 20,
                  border: `1.5px solid ${COLORS.primaryBorder}`,
                }}
              >
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : filteredClasses.length > 0 ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {filteredClasses.map((item, index) => (
            <ClassCard
              key={item?.assignment_id || item?.id || index}
              classData={item}
            />
          ))}
        </Space>
      ) : (
        <Card
          bordered={false}
          style={{
            borderRadius: 20,
            border: `1.5px solid ${COLORS.primaryBorder}`,
            textAlign: "center",
          }}
          styles={{ body: { padding: "40px 20px" } }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text style={{ color: COLORS.textMuted, fontWeight: 600 }}>
                {searchText || statusFilter !== "all"
                  ? "Không tìm thấy lớp học phù hợp với bộ lọc"
                  : "Bạn chưa được phân công quản lý lớp học nào ✝"}
              </Text>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default TeacherClassesPage;
