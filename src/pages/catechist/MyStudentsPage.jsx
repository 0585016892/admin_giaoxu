import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Input,
  Tag,
  Empty,
  Space,
  Select,
  message,
  Table,
  Button,
  Descriptions,
  Divider,
} from "antd";

import {
  TeamOutlined,
  SearchOutlined,
  BookOutlined,
  ManOutlined,
  WomanOutlined,
  FilterOutlined,
  EyeOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  MailOutlined,
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

// Các component dùng chung theo yêu cầu của bạn
import StatCard from "../../components/common/StatCard";
import AppDetailModal from "../../components/common/AppDetailModal";
import PageHeroHeader from "../../components/common/PageHeroHeader";

import studentApi from "../../api/studentApi";
import ErrorPage from "./ErrorPage";

const { Text } = Typography;

const MyStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [error, setError] = useState(null);
  // State cho Modal chi tiết học sinh
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // =====================================================
  // FETCH STUDENTS
  // =====================================================
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentApi.getStudentClass();
      const data = response?.data;

      if (Array.isArray(data)) {
        setStudents(data);
      } else if (Array.isArray(data?.data)) {
        setStudents(data.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      setError("Bạn chưa được phân vào lớp học nào!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // =====================================================
  // HÀM XEM CHI TIẾT (GET BY ID)
  // =====================================================
  const handleViewDetail = async (student) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedStudent(student);

    try {
      if (student?.id && typeof studentApi.getStudentById === "function") {
        const res = await studentApi.getStudentById(student.id);
        if (res?.data) {
          setSelectedStudent(res.data);
        }
      }
    } catch (error) {
      console.error("GET STUDENT DETAIL ERROR:", error);
      message.warning("Đang hiển thị thông tin sẵn có của học sinh.");
    } finally {
      setDetailLoading(false);
    }
  };

  // Helper hiển thị giá trị hoặc dấu "-" nếu null/undefined/rỗng
  const renderValue = (val) => {
    if (val === null || val === undefined || val === "") return "-";
    return val;
  };

  // Format ngày tháng an toàn
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (e) {
      return dateString;
    }
  };

  // =====================================================
  // DANH SÁCH LỚP
  // =====================================================
  const classes = useMemo(() => {
    const map = new Map();
    students.forEach((student) => {
      if (student.class_id) {
        map.set(student.class_id, {
          id: student.class_id,
          name: student.class_name,
          code: student.class_code,
        });
      }
    });
    return Array.from(map.values());
  }, [students]);

  // =====================================================
  // FILTER
  // =====================================================
  const filteredStudents = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return students.filter((student) => {
      const studentName = (student.name || "").toLowerCase();
      const studentCode = (student.code || "").toLowerCase();
      const studentPhone = (student.phone || "").toLowerCase();
      const className = (student.class_name || "").toLowerCase();

      const matchSearch =
        !keyword ||
        studentName.includes(keyword) ||
        studentCode.includes(keyword) ||
        studentPhone.includes(keyword) ||
        className.includes(keyword);

      const matchClass =
        classFilter === "all" ||
        String(student.class_id) === String(classFilter);

      return matchSearch && matchClass;
    });
  }, [students, searchText, classFilter]);

  // =====================================================
  // THỐNG KÊ
  // =====================================================
  const statistics = useMemo(() => {
    const male = students.filter(
      (student) =>
        student.gender?.toLowerCase() === "nam" || student.gender === "male",
    ).length;

    const female = students.filter(
      (student) =>
        student.gender?.toLowerCase() === "nữ" || student.gender === "female",
    ).length;

    return {
      total: students.length,
      classes: classes.length,
      male,
      female,
    };
  }, [students, classes]);

  const getAvatarColor = (index) => {
    const colors = ["#FF6B8B", "#FFC048", "#A855F7", "#38BDF8", "#34D399"];
    return colors[index % colors.length];
  };
  if (error) {
    return (
      <ErrorPage
        title="Không thể tải danh sách học sinh"
        message={error}
        onRetry={() => {
          setError(null);
          fetchStudents();
        }}
      />
    );
  }
  // =====================================================
  // TABLE COLUMNS
  // =====================================================
  const columns = [
    {
      title: "Học sinh",
      dataIndex: "name",
      key: "name",
      render: (text, record, index) => (
        <Space>
          <Avatar
            size={40}
            src={record.avatar}
            style={{
              background: getAvatarColor(index),
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: 14,
              border: "2px solid #FFFFFF",
              boxShadow: "0 3px 8px rgba(255, 107, 139, 0.2)",
            }}
          >
            {(text || "?").charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <Text
              strong
              style={{ display: "block", color: "#334155", fontSize: 13.5 }}
            >
              {record.saint_name ? `${record.saint_name} ` : ""}
              {text || "Chưa cập nhật"}
            </Text>
            {record.code && (
              <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700 }}>
                {record.code}
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Lớp học",
      dataIndex: "class_name",
      key: "class_name",
      render: (className, record) => (
        <Space>
          <BookOutlined style={{ color: "#FF6B8B" }} />
          <Text style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
            {className || "Chưa xếp lớp"}
          </Text>
          {record.class_code && (
            <Tag
              bordered={false}
              style={{
                borderRadius: 8,
                background: "#FEF3C7",
                color: "#D97706",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {record.class_code}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
        const isMale = gender?.toLowerCase() === "nam" || gender === "male";
        return (
          <Space>
            {isMale ? (
              <ManOutlined style={{ color: "#38BDF8" }} />
            ) : (
              <WomanOutlined style={{ color: "#A855F7" }} />
            )}
            <Text style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
              {renderValue(gender)}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (
        <Text style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
          {renderValue(phone)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "class_student_status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "studying" ? "success" : "default"}
          style={{ borderRadius: 8, fontSize: 11, fontWeight: 700 }}
        >
          {status === "studying" ? "Đang học" : renderValue(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          style={{
            borderRadius: 10,
            fontWeight: 700,
            borderColor: "#FF6B8B",
            color: "#FF6B8B",
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: "#FFF9FA" }}>
      {/* 1. PAGE HERO HEADER */}
      <PageHeroHeader
        title="Học sinh của tôi"
        subtitle="Danh sách học sinh thuộc các lớp bạn đang phụ trách."
        badgeText="🌸 QUẢN LÝ HỌC SINH"
        icon={<TeamOutlined />}
      />

      {/* 2. STAT CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Tổng học sinh"
            value={statistics.total}
            icon={<TeamOutlined />}
            color="#FF6B8B"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Học sinh Nam"
            value={statistics.male}
            icon={<ManOutlined />}
            color="#38BDF8"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Học sinh Nữ"
            value={statistics.female}
            icon={<WomanOutlined />}
            color="#A855F7"
          />
        </Col>
      </Row>

      {/* 3. FILTER BAR */}
      <Card
        bordered={false}
        style={{
          borderRadius: 24,
          marginBottom: 20,
          background: "#FFFFFF",
          border: "2px solid #FFE4E6",
          boxShadow: "0 10px 25px rgba(255, 182, 193, 0.12)",
        }}
        styles={{ body: { padding: 14 } }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={15}>
            <Input
              size="large"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined style={{ color: "#FF6B8B" }} />}
              placeholder="Tìm tên học sinh, mã học sinh, số điện thoại, lớp..."
              style={{
                height: 44,
                borderRadius: 16,
                background: "#FFF5F7",
                border: "1px solid #FFE4E6",
                fontSize: 13,
                fontWeight: 600,
              }}
            />
          </Col>
          <Col xs={24} lg={9}>
            <Select
              size="large"
              value={classFilter}
              onChange={setClassFilter}
              style={{ width: "100%" }}
              suffixIcon={<FilterOutlined style={{ color: "#FF6B8B" }} />}
              options={[
                { label: "🌸 Tất cả lớp", value: "all" },
                ...classes.map((item) => ({
                  label: `${item.name}${item.code ? ` • ${item.code}` : ""}`,
                  value: item.id,
                })),
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* 4. TABLE */}
      <Card
        bordered={false}
        style={{
          borderRadius: 24,
          border: "2px solid #FFE4E6",
          boxShadow: "0 10px 24px rgba(255, 182, 193, 0.12)",
          overflow: "hidden",
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={filteredStudents}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} học sinh`,
          }}
          locale={{
            emptyText: (
              <div style={{ padding: "40px 0" }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text style={{ color: "#94A3B8", fontWeight: 700 }}>
                      Chưa có học sinh nào trong các lớp bạn phụ trách 🌸
                    </Text>
                  }
                />
              </div>
            ),
          }}
        />
      </Card>

      {/* 5. APP DETAIL MODAL - HIỂN THỊ FULL 100% CÁC TRƯỜNG */}
      <AppDetailModal
        open={detailModalOpen}
        showEdit={false}
        title="Chi tiết học sinh"
        loading={detailLoading}
        width={850}
        onCancel={() => setDetailModalOpen(false)}
      >
        {selectedStudent && (
          <div>
            <Space align="center" size={16} style={{ marginBottom: 20 }}>
              <Avatar
                size={64}
                src={selectedStudent.avatar}
                style={{
                  background: "#FF6B8B",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: 22,
                  border: "3px solid #FFF0F5",
                }}
              >
                {(selectedStudent.name || "H").charAt(0)?.toUpperCase()}
              </Avatar>
              <div>
                <Text
                  strong
                  style={{ display: "block", fontSize: 18, color: "#334155" }}
                >
                  {selectedStudent.saint_name
                    ? `${selectedStudent.saint_name} `
                    : ""}
                  {selectedStudent.name}
                </Text>
                <Text style={{ fontSize: 13, color: "#94A3B8" }}>
                  Mã học sinh: {renderValue(selectedStudent.code)}
                </Text>
              </div>
            </Space>

            <Divider style={{ margin: "12px 0" }} />

            <Descriptions
              bordered
              column={2}
              size="small"
              labelStyle={{ fontWeight: "bold", width: "170px" }}
            >
              {/* Định danh & Hệ thống */}
              <Descriptions.Item label="Mã học sinh (code)">
                {renderValue(selectedStudent.code)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái hồ sơ">
                <Tag color="processing">
                  {renderValue(
                    selectedStudent.status === "active"
                      ? "Đang hoạt động"
                      : "Ngưng hoạt động",
                  )}
                </Tag>
              </Descriptions.Item>

              {/* Thông tin lớp học */}
              <Descriptions.Item
                label={
                  <span>
                    <BookOutlined
                      style={{ marginRight: 6, color: "#FF6B8B" }}
                    />
                    Lớp học
                  </span>
                }
              >
                {renderValue(selectedStudent.class_name)}
              </Descriptions.Item>
              <Descriptions.Item label="Mã lớp">
                {renderValue(selectedStudent.class_code)}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái trong lớp">
                <Tag color="success">
                  {renderValue(selectedStudent.class_student_status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia lớp">
                {formatDate(selectedStudent.joined_at)}
              </Descriptions.Item>

              {/* Thông tin cá nhân */}
              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined
                      style={{ marginRight: 6, color: "#38BDF8" }}
                    />
                    Tên Thánh
                  </span>
                }
              >
                {renderValue(selectedStudent.saint_name)}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <ManOutlined style={{ marginRight: 6, color: "#38BDF8" }} />
                    Giới tính
                  </span>
                }
              >
                {renderValue(selectedStudent.gender)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <CalendarOutlined
                      style={{ marginRight: 6, color: "#FFC048" }}
                    />
                    Ngày sinh
                  </span>
                }
              >
                {formatDate(selectedStudent.date_of_birth)}
              </Descriptions.Item>
              <Descriptions.Item label="Nơi sinh">
                {renderValue(selectedStudent.birth_place)}
              </Descriptions.Item>

              <Descriptions.Item label="Quốc tịch">
                {renderValue(selectedStudent.nationality)}
              </Descriptions.Item>
              <Descriptions.Item label="Xứ đạo (Parish)">
                {renderValue(selectedStudent.parish)}
              </Descriptions.Item>

              {/* Liên lạc & Địa chỉ */}
              <Descriptions.Item
                label={
                  <span>
                    <PhoneOutlined
                      style={{ marginRight: 6, color: "#34D399" }}
                    />
                    Số điện thoại
                  </span>
                }
              >
                {renderValue(selectedStudent.phone)}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <MailOutlined
                      style={{ marginRight: 6, color: "#34D399" }}
                    />
                    Email
                  </span>
                }
              >
                {renderValue(selectedStudent.email)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <EnvironmentOutlined
                      style={{ marginRight: 6, color: "#EF4444" }}
                    />
                    Địa chỉ (Address)
                  </span>
                }
                span={2}
              >
                {renderValue(selectedStudent.address)}
              </Descriptions.Item>

              {/* Thông tin gia đình */}
              <Descriptions.Item
                label={
                  <span>
                    <HeartOutlined
                      style={{ marginRight: 6, color: "#EC4899" }}
                    />
                    Họ tên Bố
                  </span>
                }
              >
                {renderValue(selectedStudent.father_name)}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại Bố">
                {renderValue(selectedStudent.father_phone)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <HeartOutlined
                      style={{ marginRight: 6, color: "#EC4899" }}
                    />
                    Họ tên Mẹ
                  </span>
                }
              >
                {renderValue(selectedStudent.mother_name)}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại Mẹ">
                {renderValue(selectedStudent.mother_phone)}
              </Descriptions.Item>

              <Descriptions.Item label="Người giám hộ">
                {renderValue(selectedStudent.guardian_name)} (
                {renderValue(selectedStudent.guardian_relationship)})
              </Descriptions.Item>
              <Descriptions.Item label="SĐT Người giám hộ">
                {renderValue(selectedStudent.guardian_phone)}
              </Descriptions.Item>

              {/* Thông tin giáo lý & bí tích */}
              <Descriptions.Item
                label={
                  <span>
                    <FileTextOutlined
                      style={{ marginRight: 6, color: "#A855F7" }}
                    />
                    Trình độ giáo lý
                  </span>
                }
              >
                {renderValue(selectedStudent.catechism_level)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái giáo lý">
                <Tag color="cyan">
                  {renderValue(selectedStudent.catechism_status)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <SafetyCertificateOutlined
                      style={{ marginRight: 6, color: "#38BDF8" }}
                    />
                    Rửa tội (Tên/Ngày/Nơi)
                  </span>
                }
                span={2}
              >
                Tên thánh: {renderValue(selectedStudent.baptism_name)} | Ngày:{" "}
                {formatDate(selectedStudent.baptism_date)} | Nơi:{" "}
                {renderValue(selectedStudent.baptism_place)}
              </Descriptions.Item>

              <Descriptions.Item label="Xứ rửa tội / Chứng chỉ">
                Xứ: {renderValue(selectedStudent.baptism_parish)} | Số chứng
                chỉ: {renderValue(selectedStudent.baptism_certificate_no)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày ghi danh ">
                {formatDate(selectedStudent.enrollment_date)}
              </Descriptions.Item>

              <Descriptions.Item label="Rước lễ lần đầu">
                Ngày: {formatDate(selectedStudent.first_communion_date)} | Nơi:{" "}
                {renderValue(selectedStudent.first_communion_place)}
              </Descriptions.Item>
              <Descriptions.Item label="Thêm sức">
                Ngày: {formatDate(selectedStudent.confirmation_date)} | Nơi:{" "}
                {renderValue(selectedStudent.confirmation_place)} (Tên thánh:{" "}
                {renderValue(selectedStudent.confirmation_saint_name)})
              </Descriptions.Item>

              {/* Thông tin thời gian & Ghi chú */}
              <Descriptions.Item label="Ghi chú (Note)" span={2}>
                {renderValue(selectedStudent.note)}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo tham gia">
                {renderValue(selectedStudent.created_at)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </AppDetailModal>
    </div>
  );
};

export default MyStudentsPage;
