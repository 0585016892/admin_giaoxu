import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Tag,
  Avatar,
  Space,
  Input,
  Select,
  Row,
  Col,
  Pagination,
  message,
  Dropdown,
  Tooltip,
  Modal,
  Form,
  DatePicker,
  Popconfirm,
  Descriptions,
  Tabs,
  Statistic,
  Divider,
  Empty,
  Badge,
} from "antd";

import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  DeleteOutlined,
  SwapOutlined,
  IdcardOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  CompassOutlined,
  PhoneOutlined,
  BookOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import catechistApi from "../../api/catechistApi";
import classApi from "../../api/classApi";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const LEVEL_OPTIONS = [
  { value: "Dự bị", label: "Dự bị" },
  { value: "Cấp 1", label: "Cấp 1" },
  { value: "Cấp 2", label: "Cấp 2" },
  { value: "Cấp 3", label: "Cấp 3" },
  { value: "Huấn luyện viên", label: "Huấn luyện viên" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Đang hoạt động" },
  { value: "paused", label: "Tạm nghỉ" },
  { value: "inactive", label: "Ngừng hoạt động" },
];

export default function CatechistManagement() {
  const [catechists, setCatechists] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCatechist, setEditingCatechist] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailCatechist, setDetailCatechist] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignCatechist, setAssignCatechist] = useState(null);

  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  /* =========================
     FORMAT DATA
  ========================= */
  const formatCatechist = (item) => ({
    ...item,
    key: item.id,
    catechist_code: item.catechist_code || "-",
    holy_name: item.holy_name || "",
    full_name: item.full_name || "Chưa có tên",
    gender: item.gender || "Nam",
    date_of_birth: item.date_of_birth || null,
    phone: item.phone || "",
    email: item.email || "",
    address: item.address || "",
    parish: item.parish || "",
    diocese: item.diocese || "",
    baptism_date: item.baptism_date || null,
    baptism_place: item.baptism_place || "",
    first_communion_date: item.first_communion_date || null,
    confirmation_date: item.confirmation_date || null,
    oath_date: item.oath_date || null,
    father_name: item.father_name || "",
    father_phone: item.father_phone || "",
    mother_name: item.mother_name || "",
    mother_phone: item.mother_phone || "",
    level: item.level || "Dự bị",
    status: item.status || "active",
    notes: item.notes || "",
    classes: item.classes || [],
    created_at: item.created_at || null,
    updated_at: item.updated_at || null,
    avatar: item.avatar
      ? item.avatar
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          item.full_name || "GLV",
        )}`,
  });

  const formatDateStr = (dateStr) => {
    return dateStr ? dayjs(dateStr).format("DD/MM/YYYY") : "—";
  };

  /* =========================
     FETCH DATA
  ========================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        catechistApi.getAll(),
        classApi?.getAll ? classApi.getAll() : Promise.resolve({ data: [] }),
      ]);

      // =====================================================
      // CATECHISTS
      // =====================================================

      if (results[0].status === "fulfilled") {
        const response = results[0].value;

        const catechistData = response?.data?.data || response?.data || [];

        const list = Array.isArray(catechistData) ? catechistData : [];

        setCatechists(list.map(formatCatechist));
      } else {
        message.error("Không thể tải danh sách Giáo lý viên!");
      }

      // =====================================================
      // CLASSES
      // =====================================================

      if (results[1].status === "fulfilled") {
        const response = results[1].value;

        const classData = response?.data?.data || response?.data || [];

        const list = Array.isArray(classData) ? classData : [];

        setClasses(
          list.map((item) => ({
            id: item.id,
            name: item.name || item.class_name || "Chưa đặt tên",
          })),
        );
      }
    } catch (error) {
      console.error("FETCH CATECHIST DATA ERROR:", error);

      message.error("Có lỗi xảy ra khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  /* =========================
     FILTER
  ========================= */
  const filteredData = useMemo(() => {
    let result = [...catechists];
    if (searchText.trim()) {
      const keyword = searchText.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.full_name?.toLowerCase().includes(keyword) ||
          item.holy_name?.toLowerCase().includes(keyword) ||
          item.catechist_code?.toLowerCase().includes(keyword) ||
          item.phone?.toLowerCase().includes(keyword) ||
          item.email?.toLowerCase().includes(keyword),
      );
    }
    if (selectedLevel !== "all") {
      result = result.filter((item) => item.level === selectedLevel);
    }
    if (selectedStatus !== "all") {
      result = result.filter((item) => item.status === selectedStatus);
    }
    return result;
  }, [catechists, searchText, selectedLevel, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedLevel, selectedStatus]);

  const statistics = useMemo(() => {
    return {
      total: catechists.length,
      active: catechists.filter((item) => item.status === "active").length,
      paused: catechists.filter((item) => item.status === "paused").length,
      trainer: catechists.filter((item) => item.level === "Huấn luyện viên")
        .length,
    };
  }, [catechists]);

  /* =========================
     MODAL ACTIONS
  ========================= */
  const handleOpenCreateModal = () => {
    setEditingCatechist(null);
    form.resetFields();
    form.setFieldsValue({
      gender: "Nam",
      level: "Dự bị",
      status: "active",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingCatechist(record);
    form.setFieldsValue({
      ...record,
      date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
      baptism_date: record.baptism_date ? dayjs(record.baptism_date) : null,
      first_communion_date: record.first_communion_date
        ? dayjs(record.first_communion_date)
        : null,
      confirmation_date: record.confirmation_date
        ? dayjs(record.confirmation_date)
        : null,
      oath_date: record.oath_date ? dayjs(record.oath_date) : null,
    });
    setIsFormModalOpen(true);
  };

  const formatDate = (date) => (date ? dayjs(date).format("YYYY-MM-DD") : null);

  const handleSave = async (values) => {
    try {
      setSaving(true);
      const payload = {
        ...values,
        date_of_birth: formatDate(values.date_of_birth),
        baptism_date: formatDate(values.baptism_date),
        first_communion_date: formatDate(values.first_communion_date),
        confirmation_date: formatDate(values.confirmation_date),
        oath_date: formatDate(values.oath_date),
      };

      if (editingCatechist) {
        await catechistApi.update(editingCatechist.id, payload);
        message.success("Cập nhật Giáo lý viên thành công!");
      } else {
        await catechistApi.create(payload);
        message.success("Thêm Giáo lý viên thành công!");
      }

      setIsFormModalOpen(false);
      form.resetFields();
      await fetchData();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin!",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDetail = async (record) => {
    try {
      setIsDetailModalOpen(true);
      setDetailCatechist(record);

      const response = await catechistApi.getById(record.id);
      const data = response?.data?.data || response?.data;
      if (data) {
        setDetailCatechist(formatCatechist(data));
      }
    } catch (error) {
      message.warning("Không thể tải thêm thông tin chi tiết.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await catechistApi.delete(id);
      message.success("Xóa Giáo lý viên thành công!");
      await fetchData();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể xóa Giáo lý viên!",
      );
    }
  };

  /* =========================
     ASSIGN CLASS (CẬP NHẬT PRE-SELECT)
  ========================= */
  const handleOpenAssignModal = (record) => {
    setAssignCatechist(record);
    assignForm.resetFields();

    // Tìm lớp học hiện tại (đang giảng dạy hoặc thuộc mảng classes)
    const currentClassAssignment =
      record.classes && record.classes.length > 0
        ? record.classes.find((c) => c.status === "teaching") ||
          record.classes[0]
        : null;

    assignForm.setFieldsValue({
      class_id: currentClassAssignment
        ? currentClassAssignment.class_id
        : undefined,
      role: currentClassAssignment
        ? currentClassAssignment.role
        : "Giáo lý viên",
      assigned_date:
        currentClassAssignment && currentClassAssignment.assigned_date
          ? dayjs(currentClassAssignment.assigned_date)
          : dayjs(),
      notes: currentClassAssignment ? currentClassAssignment.notes : null,
    });

    setIsAssignModalOpen(true);
  };

  const handleAssignClass = async (values) => {
    try {
      setSaving(true);
      const payload = {
        catechist_id: assignCatechist.id,
        class_id: values.class_id,
        role: values.role,
        assigned_date: values.assigned_date
          ? values.assigned_date.format("YYYY-MM-DD")
          : null,
        notes: values.notes || null,
      };

      await catechistApi.assignClass(payload);
      message.success("Phân công lớp thành công!");
      setIsAssignModalOpen(false);
      assignForm.resetFields();
      await fetchData();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể phân công lớp!",
      );
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      active: { label: "Đang hoạt động", color: "success" },
      paused: { label: "Tạm nghỉ", color: "warning" },
      inactive: { label: "Ngừng hoạt động", color: "error" },
    };
    return config[status] || config.active;
  };

  /* =========================
     TABLE COLUMNS
  ========================= */
  const columns = [
    {
      title: "Giáo lý viên",
      key: "catechist",
      render: (_, record) => (
        <Space size={12}>
          <Avatar
            size={46}
            src={record.avatar}
            style={{ border: `2px solid ${accentGold}` }}
          />
          <div>
            <Text
              strong
              style={{
                color: primaryNavy,
                cursor: "pointer",
                display: "block",
                fontSize: 14,
              }}
              onClick={() => handleOpenDetail(record)}
            >
              {record.holy_name ? `${record.holy_name} ` : ""}
              {record.full_name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <IdcardOutlined /> {record.catechist_code}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Liên hệ",
      render: (_, record) => (
        <div>
          <div>
            <PhoneOutlined style={{ color: accentGold, marginRight: 6 }} />
            <Text>{record.phone || "—"}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.email || "—"}
          </Text>
        </div>
      ),
    },
    {
      title: "Cấp bậc",
      dataIndex: "level",
      render: (level) => (
        <Tag
          style={{
            borderRadius: 20,
            padding: "3px 10px",
            borderColor: `${accentGold}55`,
            color: primaryNavy,
            background: "#fffaf0",
            fontWeight: 500,
          }}
        >
          {level}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag
            color={config.color}
            style={{ borderRadius: 20, padding: "3px 10px" }}
          >
            ● {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "assign",
                  label: "Phân công lớp",
                  icon: <SwapOutlined />,
                  onClick: () => handleOpenAssignModal(record),
                },
                { type: "divider" },
                {
                  key: "delete",
                  danger: true,
                  label: (
                    <Popconfirm
                      title="Xóa Giáo lý viên?"
                      description="Dữ liệu này có thể không khôi phục được."
                      onConfirm={() => handleDelete(record.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      Xóa Giáo lý viên
                    </Popconfirm>
                  ),
                  icon: <DeleteOutlined />,
                },
              ],
            }}
          >
            <Button type="text" shape="circle" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  /* Columns cho table lớp học trong Modal Detail */
  const assignedClassColumns = [
    {
      title: "Mã/Tên Lớp",
      key: "class_name",
      render: (_, record) => (
        <Space>
          <BookOutlined style={{ color: primaryNavy }} />
          <Text strong>{record.class_name || `Lớp ${record.class_id}`}</Text>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color="blue" style={{ borderRadius: 12 }}>
          {role || "Giáo lý viên"}
        </Tag>
      ),
    },
    {
      title: "Ngày phân công",
      dataIndex: "assigned_date",
      key: "assigned_date",
      render: (date) => formatDateStr(date),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "teaching" ? "processing" : "default"}
          text={status === "teaching" ? "Đang dạy" : "Đã kết thúc"}
        />
      ),
    },
  ];

  return (
    <div
      style={{ minHeight: "100vh", background: softBg, padding: 24 }}
      className="event-editorial-layout"
    >
      {/* ================= HEADER ================= */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Space direction="vertical" size={2}>
              <div className="event-header-section">
                <div className="header-text-group">
                  <span className="sacred-badge">
                    <CompassOutlined /> HỆ THỐNG QUẢN LÝ GIÁO LÝ VIÊN
                  </span>
                  <Title level={2} className="event-main-title">
                    Danh sách Giáo lý viên
                  </Title>
                  <Paragraph className="event-sub-title">
                    Quản lý hồ sơ, thông tin cá nhân, cấp bậc và phân công giảng
                    dạy của đội ngũ Giáo lý viên.
                  </Paragraph>
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchData}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreateModal}
                style={{
                  background: primaryNavy,
                  borderColor: primaryNavy,
                  borderRadius: 10,
                  height: 40,
                  padding: "0 18px",
                  boxShadow: "0 6px 16px rgba(27,54,93,0.18)",
                }}
              >
                Thêm Giáo lý viên
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* ================= STATISTICS ================= */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 16, borderLeft: `4px solid ${primaryNavy}` }}
          >
            <Statistic
              title="Tổng Giáo lý viên"
              value={statistics.total}
              prefix={<TeamOutlined style={{ color: primaryNavy }} />}
              valueStyle={{ color: textDark, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 16, borderLeft: "4px solid #22c55e" }}
          >
            <Statistic
              title="Đang hoạt động"
              value={statistics.active}
              prefix={<CheckCircleOutlined style={{ color: "#22c55e" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 16, borderLeft: `4px solid ${accentGold}` }}
          >
            <Statistic
              title="Tạm nghỉ"
              value={statistics.paused}
              prefix={<PauseCircleOutlined style={{ color: accentGold }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 16, borderLeft: "4px solid #7c3aed" }}
          >
            <Statistic
              title="Huấn luyện viên"
              value={statistics.trainer}
              prefix={<BookOutlined style={{ color: "#7c3aed" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* ================= FILTER ================= */}
      <Card
        bordered={false}
        style={{ borderRadius: 16, marginBottom: 20 }}
        bodyStyle={{ padding: 18 }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} md={10}>
            <Input
              size="large"
              placeholder="Tìm theo tên, tên Thánh, mã GLV, SĐT..."
              prefix={<SearchOutlined style={{ color: accentGold }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 10 }}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              size="large"
              value={selectedLevel}
              onChange={setSelectedLevel}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "Tất cả cấp bậc" },
                ...LEVEL_OPTIONS,
              ]}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              size="large"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                ...STATUS_OPTIONS,
              ]}
            />
          </Col>
          <Col xs={24} md={4}>
            <Button
              size="large"
              icon={<FilterOutlined />}
              style={{ width: "100%", borderRadius: 10 }}
              onClick={() => {
                setSearchText("");
                setSelectedLevel("all");
                setSelectedStatus("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ================= TABLE MAIN ================= */}
      <Card
        bordered={false}
        style={{ borderRadius: 18, overflow: "hidden" }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}
        >
          <Text strong style={{ color: primaryNavy, fontSize: 16 }}>
            Danh sách Giáo lý viên
          </Text>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            ({filteredData.length})
          </Text>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize,
          )}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: <Empty description="Chưa có Giáo lý viên nào" />,
          }}
          scroll={{ x: 900 }}
        />

        <Divider style={{ margin: 0 }} />

        <Row
          justify="space-between"
          align="middle"
          style={{ padding: "16px 20px" }}
        >
          <Col>
            <Text type="secondary">
              Hiển thị{" "}
              {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              {" - "}
              {Math.min(currentPage * pageSize, filteredData.length)}
              {" / "}
              {filteredData.length}
            </Text>
          </Col>
          <Col>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredData.length}
              showSizeChanger
              pageSizeOptions={[10, 20, 50]}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* ================= MODAL CREATE / EDIT ================= */}
      <Modal
        title={
          <Space>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: `${primaryNavy}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserOutlined style={{ color: primaryNavy }} />
            </div>
            <span style={{ color: primaryNavy }}>
              {editingCatechist
                ? "Cập nhật Giáo lý viên"
                : "Thêm Giáo lý viên mới"}
            </span>
          </Space>
        }
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText={editingCatechist ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        width={850}
        styles={{ content: { borderRadius: 18 } }}
        okButtonProps={{
          style: { background: primaryNavy, borderColor: primaryNavy },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Tabs
            defaultActiveKey="personal"
            items={[
              {
                key: "personal",
                label: "Thông tin cá nhân",
                children: (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} md={6}>
                        <Form.Item name="holy_name" label="Tên Thánh">
                          <Input placeholder="VD: Đaminh" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="full_name"
                          label="Họ và tên"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập họ tên!",
                            },
                          ]}
                        >
                          <Input placeholder="Nhập họ và tên" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name="gender" label="Giới tính">
                          <Select
                            options={[
                              { value: "Nam", label: "Nam" },
                              { value: "Nữ", label: "Nữ" },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={8}>
                        <Form.Item name="date_of_birth" label="Ngày sinh">
                          <DatePicker
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="phone" label="Số điện thoại">
                          <Input placeholder="09xxxxxxxx" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="email" label="Email">
                          <Input placeholder="example@email.com" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="address" label="Địa chỉ">
                      <Input placeholder="Nhập địa chỉ..." />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="level" label="Cấp bậc">
                          <Select options={LEVEL_OPTIONS} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="status" label="Trạng thái">
                          <Select options={STATUS_OPTIONS} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ),
              },
              {
                key: "church",
                label: "Giáo xứ & Bí tích",
                children: (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="parish" label="Giáo xứ">
                          <Input placeholder="VD: Đồng quan" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="diocese" label="Giáo phận">
                          <Input placeholder="VD: Thái Bình" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="baptism_date" label="Ngày Rửa tội">
                          <DatePicker
                            format="DD/MM/YYYY"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="baptism_place" label="Nơi Rửa tội">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="first_communion_date"
                          label="Ngày Rước lễ lần đầu"
                        >
                          <DatePicker
                            format="DD/MM/YYYY"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="confirmation_date"
                          label="Ngày Thêm sức"
                        >
                          <DatePicker
                            format="DD/MM/YYYY"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="oath_date" label="Ngày Tuyên hứa">
                      <DatePicker
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "family",
                label: "Gia đình & Ghi chú",
                children: (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="father_name" label="Họ tên Cha">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="father_phone" label="SĐT Cha">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="mother_name" label="Họ tên Mẹ">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="mother_phone" label="SĐT Mẹ">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="notes" label="Ghi chú">
                      <Input.TextArea rows={3} placeholder="Ghi chú thêm..." />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Modal>

      {/* ================= MODAL FULL DETAIL (CHI TIẾT ĐẦY ĐỦ DATA API) ================= */}
      <Modal
        title={
          <Space>
            <IdcardOutlined style={{ color: primaryNavy, fontSize: 20 }} />
            <span style={{ color: primaryNavy, fontWeight: 600 }}>
              Hồ sơ chi tiết Giáo lý viên
            </span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            style={{ background: primaryNavy }}
            onClick={() => setIsDetailModalOpen(false)}
          >
            Đóng
          </Button>,
        ]}
        width={850}
        styles={{ content: { borderRadius: 18 } }}
      >
        {detailCatechist && (
          <div>
            {/* Header hồ sơ */}
            <Row
              gutter={16}
              align="middle"
              style={{
                marginBottom: 20,
                padding: 12,
                background: "#f8fafc",
                borderRadius: 12,
              }}
            >
              <Col>
                <Avatar
                  size={64}
                  src={detailCatechist.avatar}
                  style={{ border: `2px solid ${accentGold}` }}
                />
              </Col>
              <Col flex="1">
                <Title level={4} style={{ margin: 0, color: primaryNavy }}>
                  {detailCatechist.holy_name} {detailCatechist.full_name}
                </Title>
                <Space style={{ marginTop: 4 }}>
                  <Tag color="gold">Mã: {detailCatechist.catechist_code}</Tag>
                  <Tag color="blue">Cấp: {detailCatechist.level}</Tag>
                  <Tag color={getStatusConfig(detailCatechist.status).color}>
                    {getStatusConfig(detailCatechist.status).label}
                  </Tag>
                </Space>
              </Col>
            </Row>

            <Tabs
              defaultActiveKey="info"
              items={[
                {
                  key: "info",
                  label: "Thông tin cá nhân & Liên hệ",
                  children: (
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 2 }}
                      size="small"
                    >
                      <Descriptions.Item label="Họ và tên">
                        {detailCatechist.full_name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tên Thánh">
                        {detailCatechist.holy_name || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giới tính">
                        {detailCatechist.gender}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày sinh">
                        {formatDateStr(detailCatechist.date_of_birth)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        {detailCatechist.phone || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {detailCatechist.email || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ" span={2}>
                        {detailCatechist.address || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày tạo">
                        {formatDateStr(detailCatechist.created_at)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Cập nhật cuối">
                        {formatDateStr(detailCatechist.updated_at)}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "church",
                  label: "Giáo xứ & Bí tích",
                  children: (
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 2 }}
                      size="small"
                    >
                      <Descriptions.Item label="Giáo xứ">
                        {detailCatechist.parish || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giáo phận">
                        {detailCatechist.diocese || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày Rửa tội">
                        {formatDateStr(detailCatechist.baptism_date)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Nơi Rửa tội">
                        {detailCatechist.baptism_place || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày Rước lễ lần đầu">
                        {formatDateStr(detailCatechist.first_communion_date)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày Thêm sức">
                        {formatDateStr(detailCatechist.confirmation_date)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày Tuyên hứa" span={2}>
                        {formatDateStr(detailCatechist.oath_date)}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "family",
                  label: "Gia đình & Ghi chú",
                  children: (
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 2 }}
                      size="small"
                    >
                      <Descriptions.Item label="Tên Cha">
                        {detailCatechist.father_name || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="SĐT Cha">
                        {detailCatechist.father_phone || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tên Mẹ">
                        {detailCatechist.mother_name || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="SĐT Mẹ">
                        {detailCatechist.mother_phone || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ghi chú" span={2}>
                        {detailCatechist.notes || "—"}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "classes",
                  label: `Phân công lớp (${detailCatechist.classes ? detailCatechist.classes.length : 0})`,
                  children: (
                    <Table
                      size="small"
                      columns={assignedClassColumns}
                      dataSource={detailCatechist.classes || []}
                      rowKey="id"
                      pagination={false}
                      locale={{
                        emptyText: (
                          <Empty description="Chưa được phân công lớp nào" />
                        ),
                      }}
                    />
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* ================= MODAL ASSIGN CLASS (HIỂN THỊ ĐÚNG LỚP ĐÃ PHÂN CÔNG) ================= */}
      <Modal
        title={
          <Space>
            <SwapOutlined style={{ color: primaryNavy }} />
            <span style={{ color: primaryNavy }}>
              Phân công giảng dạy cho: {assignCatechist?.holy_name}{" "}
              {assignCatechist?.full_name}
            </span>
          </Space>
        }
        open={isAssignModalOpen}
        onCancel={() => {
          setIsAssignModalOpen(false);
          assignForm.resetFields();
        }}
        onOk={() => assignForm.submit()}
        confirmLoading={saving}
        okText="Lưu Phân Công"
        cancelText="Hủy"
        styles={{ content: { borderRadius: 18 } }}
        okButtonProps={{
          style: { background: primaryNavy, borderColor: primaryNavy },
        }}
      >
        <Form form={assignForm} layout="vertical" onFinish={handleAssignClass}>
          {assignCatechist?.classes && assignCatechist.classes.length > 0 && (
            <Card
              size="small"
              style={{
                marginBottom: 16,
                background: "#f0f9ff",
                borderColor: "#bae6fd",
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                Lớp học phân công gần nhất:
              </Text>
              <div>
                <Text strong style={{ color: primaryNavy }}>
                  {assignCatechist.classes[0].class_name}
                </Text>{" "}
                - <Tag color="blue">{assignCatechist.classes[0].role}</Tag>
              </div>
            </Card>
          )}

          <Form.Item
            name="class_id"
            label="Chọn Lớp học"
            rules={[{ required: true, message: "Vui lòng chọn lớp học!" }]}
          >
            <Select
              placeholder="Chọn lớp học..."
              showSearch
              optionFilterProp="children"
              options={classes.map((cls) => ({
                value: cls.id,
                label: cls.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò đảm nhận"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select
              options={[
                { value: "Trưởng lớp", label: "Trưởng lớp" },
                { value: "Phó lớp", label: "Phó lớp" },
                { value: "Giáo lý viên", label: "Giáo lý viên" },
                { value: "Trợ tá", label: "Trợ tá" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="assigned_date"
            label="Ngày bắt đầu phân công"
            rules={[
              { required: true, message: "Vui lòng chọn ngày phân công!" },
            ]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú phân công">
            <Input.TextArea
              rows={2}
              placeholder="Nhập ghi chú thêm nếu có..."
            />
          </Form.Item>
        </Form>
      </Modal>
      {/* STYLES SCOPED */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .event-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .event-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Section */
            .event-header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-bottom: 28px;
              flex-wrap: wrap;
              gap: 16px;
            }

            .sacred-badge {
              background: rgba(212, 175, 55, 0.15);
              border: 1px solid ${accentGold};
              color: ${primaryNavy};
              padding: 4px 14px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 10px;
            }

            .event-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .event-sub-title {
              color: #64748b;
              margin: 4px 0 0 0 !important;
              font-size: 14px;
            }

            .refresh-btn {
              border-radius: 10px !important;
              border-color: rgba(27, 54, 93, 0.2) !important;
              color: ${primaryNavy} !important;
              font-weight: 600;
              height: 42px;
            }

            .add-event-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 42px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

           
          `,
        }}
      />
    </div>
  );
}
