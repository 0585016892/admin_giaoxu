import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Tag,
  Empty,
  Select,
  message,
  Table,
  Button,
  Descriptions,
  Divider,
} from "antd";

import {
  TeamOutlined,
  BookOutlined,
  ManOutlined,
  WomanOutlined,
  FilterOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import StatCard from "../../components/common/StatCard";
import AppDetailModal from "../../components/common/AppDetailModal";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import AppSearchInput from "../../components/common/SearchInput";

import studentApi from "../../api/studentApi";
import ErrorPage from "./ErrorPage";

const { Text } = Typography;

/* =========================================================
   THEME (NAVY & GOLD)
========================================================= */
const primaryNavy = "#173B5E";
const accentGold = "#D9A441";
const borderColor = "#D9E2EC";

const MyStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [error, setError] = useState(null);

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
  // XEM CHI TIẾT
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
      message.warning("Đang hiển thị thông tin sẵn có của học sinh.");
    } finally {
      setDetailLoading(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================
  const renderValue = (val) => {
    if (val === null || val === undefined || val === "") {
      return "-";
    }
    return val;
  };

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

  // =====================================================
  // AVATAR
  // =====================================================
  const getAvatarColor = (index) => {
    const colors = [primaryNavy, accentGold, "#2563EB", "#0D9488", "#7C3AED"];
    return colors[index % colors.length];
  };

  // =====================================================
  // ERROR
  // =====================================================
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
      width: 250,
      fixed: "left",
      render: (text, record, index) => (
        <div className="student-table-cell">
          <Avatar
            size={40}
            src={`${process.env.REACT_APP_API_URL}${record.avatar}`}
            style={{
              background: getAvatarColor(index),
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 14,
              border: "2px solid #FFFFFF",
              boxShadow: "0 2px 6px rgba(23, 59, 94, 0.15)",
              flexShrink: 0,
            }}
          >
            {(text || "?").charAt(0)?.toUpperCase()}
          </Avatar>
          <div className="student-table-info">
            <Text strong className="student-table-name">
              {record.saint_name ? `${record.saint_name} ` : ""}
              {text || "Chưa cập nhật"}
            </Text>
            {record.code && (
              <Text className="student-table-code">{record.code}</Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Lớp học",
      dataIndex: "class_name",
      key: "class_name",
      width: 220,
      render: (className, record) => (
        <div className="class-table-cell">
          <BookOutlined style={{ color: accentGold, flexShrink: 0 }} />
          <Text className="class-name">{className || "Chưa xếp lớp"}</Text>
          {record.class_code && (
            <Tag className="class-code-tag">{record.class_code}</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 130,
      render: (gender) => {
        const isMale = gender?.toLowerCase() === "nam" || gender === "male";
        return (
          <div className="gender-cell">
            {isMale ? (
              <ManOutlined style={{ color: "#2563EB" }} />
            ) : (
              <WomanOutlined style={{ color: "#DB2777" }} />
            )}
            <Text className="table-secondary-text">
              {isMale ? "Nam" : "Nữ"}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 160,
      render: (phone) => (
        <Text className="table-secondary-text">{renderValue(phone)}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "class_student_status",
      key: "status",
      width: 140,
      render: (status) => (
        <Tag
          color={status === "studying" ? "success" : "default"}
          className="status-tag"
        >
          {status === "studying" ? "Đang học" : renderValue(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 110,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          className="detail-action-btn"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="my-students-page">
      {/* =================================================
          HERO
      ================================================= */}
      <PageHeroHeader
        title="Học sinh của tôi"
        subtitle="Danh sách học sinh thuộc các lớp bạn đang phụ trách."
        badgeText="QUẢN LÝ HỌC SINH"
        icon={<TeamOutlined />}
      />

      {/* =================================================
          STAT CARDS
      ================================================= */}
      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Tổng học sinh"
            value={statistics.total}
            icon={<TeamOutlined />}
            color={primaryNavy}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Học sinh Nam"
            value={statistics.male}
            icon={<ManOutlined />}
            color="#2563EB"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Học sinh Nữ"
            value={statistics.female}
            icon={<WomanOutlined />}
            color="#DB2777"
          />
        </Col>
      </Row>

      {/* =================================================
          FILTER
      ================================================= */}
      <Card
        bordered={false}
        className="students-filter-card"
        styles={{ body: { padding: 16 } }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={15}>
            <AppSearchInput
              value={searchText}
              onChange={(value) => {
                setSearchText(value);
              }}
              placeholder="Tìm tên học sinh, mã học sinh, số điện thoại, lớp..."
            />
          </Col>
          <Col xs={24} lg={9}>
            <Select
              size="large"
              value={classFilter}
              onChange={setClassFilter}
              style={{ width: "100%" }}
              suffixIcon={<FilterOutlined style={{ color: primaryNavy }} />}
              options={[
                { label: "Tất cả lớp", value: "all" },
                ...classes.map((item) => ({
                  label: `${item.name}${item.code ? ` • ${item.code}` : ""}`,
                  value: item.id,
                })),
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* =================================================
          TABLE
      ================================================= */}
      <Card
        bordered={false}
        className="students-table-card"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={filteredStudents}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 1010 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            responsive: true,
            showTotal: (total) => `Tổng số ${total} học sinh`,
          }}
          locale={{
            emptyText: (
              <div className="table-empty-box">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text className="empty-text">
                      Chưa có học sinh nào trong các lớp bạn phụ trách.
                    </Text>
                  }
                />
              </div>
            ),
          }}
        />
      </Card>

      {/* =================================================
          DETAIL MODAL
      ================================================= */}
      <AppDetailModal
        open={detailModalOpen}
        showEdit={false}
        title="Chi tiết học sinh"
        loading={detailLoading}
        width={850}
        onCancel={() => setDetailModalOpen(false)}
      >
        {selectedStudent && (
          <div className="student-detail-container">
            {/* PROFILE HEADER */}
            <div className="student-detail-header">
              <Avatar
                size={64}
                src={selectedStudent.avatar}
                className="student-detail-avatar-large"
              >
                {(selectedStudent.name || "H").charAt(0)?.toUpperCase()}
              </Avatar>
              <div className="student-detail-title-group">
                <Text className="student-detail-title-name">
                  {selectedStudent.saint_name
                    ? `${selectedStudent.saint_name} `
                    : ""}
                  {selectedStudent.name}
                </Text>
                <Text className="student-detail-title-code">
                  Mã học sinh: {renderValue(selectedStudent.code)}
                </Text>
              </div>
            </div>

            <Divider className="student-detail-divider" />

            {/* DESCRIPTIONS */}
            <div className="descriptions-wrapper">
              <Descriptions
                bordered
                column={{ xs: 1, sm: 2, md: 2 }}
                size="small"
                className="student-descriptions-custom"
                labelStyle={{
                  fontWeight: "bold",
                  background: "#F7F9FC",
                  width: "170px",
                }}
                contentStyle={{
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                <Descriptions.Item label="Mã học sinh (code)">
                  {renderValue(selectedStudent.code)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái hồ sơ">
                  <Tag color="processing" style={{ fontWeight: 600 }}>
                    {selectedStudent.status === "active"
                      ? "Đang hoạt động"
                      : "Ngưng hoạt động"}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Lớp học">
                  {renderValue(selectedStudent.class_name)}
                </Descriptions.Item>
                <Descriptions.Item label="Mã lớp">
                  {renderValue(selectedStudent.class_code)}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái trong lớp">
                  <Tag color="success" style={{ fontWeight: 600 }}>
                    {renderValue(selectedStudent.class_student_status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tham gia lớp">
                  {formatDate(selectedStudent.joined_at)}
                </Descriptions.Item>

                <Descriptions.Item label="Tên Thánh">
                  {renderValue(selectedStudent.saint_name)}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {renderValue(selectedStudent.gender) === "male"
                    ? "Nam"
                    : "Nữ"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày sinh">
                  {formatDate(selectedStudent.date_of_birth)}
                </Descriptions.Item>
                <Descriptions.Item label="Nơi sinh">
                  {renderValue(selectedStudent.birth_place)}
                </Descriptions.Item>

                <Descriptions.Item label="Quốc tịch">
                  {renderValue(selectedStudent.nationality)}
                </Descriptions.Item>
                <Descriptions.Item label="Giáo xứ">
                  {renderValue(selectedStudent.parish)}
                </Descriptions.Item>

                <Descriptions.Item label="Số điện thoại">
                  {renderValue(selectedStudent.phone)}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {renderValue(selectedStudent.email)}
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ" span={2}>
                  {renderValue(selectedStudent.address)}
                </Descriptions.Item>

                <Descriptions.Item label="Họ tên Bố">
                  {renderValue(selectedStudent.father_name)}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại Bố">
                  {renderValue(selectedStudent.father_phone)}
                </Descriptions.Item>

                <Descriptions.Item label="Họ tên Mẹ">
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

                <Descriptions.Item label="Trình độ giáo lý">
                  {renderValue(selectedStudent.catechism_level)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái giáo lý">
                  <Tag color="cyan" style={{ fontWeight: 600 }}>
                    {renderValue(selectedStudent.catechism_status)}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Bí tích Rửa tội" span={2}>
                  <div className="sub-info-block">
                    <span>
                      <strong>Tên thánh:</strong>{" "}
                      {renderValue(selectedStudent.baptism_name)}
                    </span>
                    <span>
                      <strong>Ngày:</strong>{" "}
                      {formatDate(selectedStudent.baptism_date)}
                    </span>
                    <span>
                      <strong>Nơi:</strong>{" "}
                      {renderValue(selectedStudent.baptism_place)}
                    </span>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Xứ rửa tội / Chứng chỉ">
                  {renderValue(selectedStudent.baptism_parish)}
                </Descriptions.Item>
                <Descriptions.Item label="Số chứng chỉ rửa tội">
                  {renderValue(selectedStudent.baptism_certificate_no)}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày ghi danh" span={2}>
                  {formatDate(selectedStudent.enrollment_date)}
                </Descriptions.Item>

                <Descriptions.Item label="Rước lễ lần đầu" span={2}>
                  <div className="sub-info-block">
                    <span>
                      <strong>Ngày:</strong>{" "}
                      {formatDate(selectedStudent.first_communion_date)}
                    </span>
                    <span>
                      <strong>Nơi:</strong>{" "}
                      {renderValue(selectedStudent.first_communion_place)}
                    </span>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Thêm sức" span={2}>
                  <div className="sub-info-block">
                    <span>
                      <strong>Ngày:</strong>{" "}
                      {formatDate(selectedStudent.confirmation_date)}
                    </span>
                    <span>
                      <strong>Nơi:</strong>{" "}
                      {renderValue(selectedStudent.confirmation_place)}
                    </span>
                    <span>
                      <strong>Tên thánh:</strong>{" "}
                      {renderValue(selectedStudent.confirmation_saint_name)}
                    </span>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Ghi chú" span={2}>
                  {renderValue(selectedStudent.note)}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày tạo hồ sơ" span={2}>
                  {renderValue(selectedStudent.created_at)}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        )}
      </AppDetailModal>

      {/* =================================================
          RESPONSIVE & DESCRIPTIONS CSS STYLES
      ================================================= */}
      <style>{`
        .my-students-page {
          padding: 0 0 24px 0;
          font-family: 'Be Vietnam Pro', -apple-system, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .statistics-row {
          margin-bottom: 24px;
        }

        .students-filter-card {
          border-radius: 16px;
          margin-bottom: 20px;
          background: #FFFFFF;
          border: 1px solid ${borderColor};
          box-shadow: 0 4px 12px rgba(23, 59, 94, 0.05);
        }

        .student-search-input {
          border-radius: 10px;
          border: 1.5px solid ${borderColor};
          font-weight: 500;
        }

        .students-table-card {
          border-radius: 16px;
          border: 1px solid ${borderColor};
          box-shadow: 0 4px 12px rgba(23, 59, 94, 0.05);
          overflow: hidden;
        }

        .student-table-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .student-table-info {
          min-width: 0;
        }

        .student-table-name {
          display: block;
          color: ${primaryNavy};
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .student-table-code {
          display: block;
          font-size: 11px;
          color: #64748B;
          font-weight: 600;
        }

        .class-table-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .class-name {
          font-weight: 600;
          color: #334155;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .class-code-tag {
          border-radius: 6px !important;
          background: #FEF3C7 !important;
          color: #D97706 !important;
          border: none !important;
          font-weight: 700;
          font-size: 10px;
          flex-shrink: 0;
          margin: 0 !important;
        }

        .gender-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .table-secondary-text {
          color: #475569;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-tag {
          border-radius: 6px !important;
          font-weight: 700;
          white-space: nowrap;
        }

        .detail-action-btn {
          border-radius: 8px !important;
          border-color: ${primaryNavy} !important;
          color: ${primaryNavy} !important;
          font-weight: 600;
          white-space: nowrap;
        }

        .table-empty-box {
          padding: 40px 20px;
        }

        .empty-text {
          color: #64748B;
          font-weight: 600;
        }

        /* Detail Modal Layout Fixes */
        .student-detail-container {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .student-detail-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          min-width: 0;
          flex-wrap: wrap;
        }

        .student-detail-avatar-large {
          background: ${primaryNavy} !important;
          color: #FFF !important;
          font-weight: 700 !important;
          font-size: 22px !important;
          flex-shrink: 0;
        }

        .student-detail-title-group {
          min-width: 0;
          flex: 1;
        }

        .student-detail-title-name {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: ${primaryNavy};
          word-break: break-word;
        }

        .student-detail-title-code {
          font-size: 13px;
          color: #64748B;
          font-weight: 600;
        }

        .student-detail-divider {
          border-color: ${borderColor} !important;
          margin: 16px 0 !important;
        }

        .descriptions-wrapper {
          width: 100%;
          overflow-x: hidden;
        }

        .student-descriptions-custom {
          width: 100%;
        }

        .student-descriptions-custom .ant-descriptions-item-label {
          color: #1E293B;
          font-weight: 600;
          white-space: normal !important;
        }

        .student-descriptions-custom .ant-descriptions-item-content {
          color: #334155;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .sub-info-block {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default MyStudentsPage;
