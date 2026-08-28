import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Upload,
  Switch,
  Space,
  Avatar,
  Popconfirm,
  message,
  Modal,
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Tooltip,
  DatePicker,
  ConfigProvider,
  Statistic,
  Descriptions,
  Divider,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  KeyOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  IdcardOutlined,
  HomeOutlined,
  BookOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  SearchOutlined,
  ClearOutlined,
  CompassOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdmin,
  resetAdminPassword,
} from "../api/adminApi";
import { useUser } from "../context/UserContext";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

export default function AdminManager() {
  const { user } = useUser();

  const allowRoles = ["admin", "priest"];

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  // Trạng thái Drawer Quản lý (Thêm / Sửa)
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [currentRole, setCurrentRole] = useState("admin");

  // Trạng thái Drawer Xem chi tiết
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  const [form] = Form.useForm();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [resetForm] = Form.useForm();

  // Lọc
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await getAdmins();
      setAdmins(res.data || []);
    } catch (error) {
      message.error("Lỗi tải danh sách thành viên");
    } finally {
      setLoading(false);
    }
  };

  // Tính toán số liệu thống kê cho Bento Grid
  const totalStaff = admins.length;
  const totalPriests = admins.filter((a) => a.role === "priest").length;
  const activeStaff = admins.filter((a) => a.is_active === 1).length;

  const handleEmailChange = (e) => {
    if (!editing) {
      const email = e.target.value;
      if (email.includes("@")) {
        const username = email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        form.setFieldsValue({ username });
      }
    }
  };

  const openDrawer = (record = null) => {
    setEditing(record);
    setOpen(true);

    if (record) {
      setCurrentRole(record.role);
      form.setFieldsValue({
        ...record,
        birthday: record.birthday ? dayjs(record.birthday) : null,
        ordination_date: record.ordination_date
          ? dayjs(record.ordination_date)
          : null,
      });

      setFileList(
        record.avatar
          ? [
              {
                uid: "-1",
                name: "avatar.png",
                status: "done",
                url: `${process.env.REACT_APP_API_URL}${record.avatar}`,
              },
            ]
          : [],
      );
    } else {
      setCurrentRole("admin");
      form.resetFields();
      setFileList([]);
    }
  };

  const openViewDrawer = (record) => {
    setViewRecord(record);
    setViewOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (key === "avatar") return;

        if (values[key] !== undefined && values[key] !== null) {
          if (key === "birthday" || key === "ordination_date") {
            formData.append(
              key,
              values[key] ? values[key].format("YYYY-MM-DD") : "",
            );
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      if (fileList && fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }

      setLoading(true);

      if (editing) {
        await updateAdmin(editing.id, formData);
        message.success("Cập nhật thông tin nhân sự thành công");
      } else {
        await createAdmin(formData);
        message.success("Tạo tài khoản quản trị mới thành công");
      }

      setOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const values = await resetForm.validateFields();
      setLoading(true);
      await resetAdminPassword(resetUser.id, values.newPassword);
      message.success(`Đã cấp lại mật khẩu mới cho ${resetUser.full_name}`);
      setResetModalOpen(false);
      resetForm.resetFields();
    } catch {
      message.error("Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const disabledFutureDates = (current) => {
    return current && current > dayjs().endOf("day");
  };

  const disabledOrdinationDates = (current) => {
    if (!current) return false;
    const isFuture = current > dayjs().endOf("day");
    const birthdayValue = form.getFieldValue("birthday");
    const isBeforeBirthday = birthdayValue
      ? current.isBefore(dayjs(birthdayValue), "day")
      : false;

    return isFuture || isBeforeBirthday;
  };

  const columns = [
    {
      title: "Thành viên mục vụ",
      key: "user",
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            size={46}
            src={
              record.avatar
                ? `${process.env.REACT_APP_API_URL}${record.avatar}`
                : null
            }
            icon={<UserOutlined />}
            style={{
              background:
                record.role === "priest"
                  ? "linear-gradient(135deg, #8b0000 0%, #a81c1c 100%)"
                  : "linear-gradient(135deg, " +
                    primaryNavy +
                    " 0%, #0f2342 100%)",
              border: "1px solid " + accentGold,
              boxShadow: "0 2px 8px rgba(27, 54, 93, 0.12)",
            }}
          />
          <div>
            <div
              style={{ fontWeight: 700, color: primaryNavy, fontSize: "15px" }}
            >
              {record.saint_name ? (
                <span>
                  <Text
                    type="secondary"
                    style={{
                      marginRight: 4,
                      fontWeight: 600,
                      fontSize: "13px",
                      color: accentGold,
                    }}
                  >
                    {record.saint_name}
                  </Text>
                  {record.full_name}
                </span>
              ) : (
                record.full_name
              )}
            </div>
            <Text
              type="secondary"
              style={{
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#64748b",
              }}
            >
              @{record.username}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Chức danh",
      dataIndex: "position",
      render: (position) => (
        <span style={{ fontWeight: 600, color: textDark, fontSize: "13px" }}>
          {position || <Text type="secondary">—</Text>}
        </span>
      ),
    },
    {
      title: "Phân vị vai trò",
      dataIndex: "role",
      render: (role) => (
        <Tag
          color={
            role === "admin"
              ? "blue"
              : role === "priest"
                ? "red"
                : role === "liturgy_manager"
                  ? "gold"
                  : "green"
          }
          style={{ fontWeight: 600, borderRadius: 8 }}
        >
          {role === "admin"
            ? "QUẢN TRỊ"
            : role === "priest"
              ? "LINH MỤC"
              : role === "liturgy_manager"
                ? "QUẢN LÝ PHỤNG VỤ"
                : "QUẢN LÝ TRUYỀN THÔNG"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      width: 150,
      align: "center",
      render: (val, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {allowRoles.includes(user?.role) && (
            <Switch
              checked={val === 1}
              size="small"
              onChange={async () => {
                await toggleAdmin(record.id);
                message.success("Đã cập nhật trạng thái");
                fetchAdmins();
              }}
            />
          )}
          <Tag
            color={val === 1 ? "green" : "default"}
            style={{
              fontWeight: 600,
              borderRadius: 8,
              fontSize: 10,
              margin: 0,
            }}
          >
            {val === 1 ? "HOẠT ĐỘNG" : "ĐANG KHÓA"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết hồ sơ">
            <Button
              type="text"
              shape="circle"
              icon={
                <EyeOutlined style={{ color: primaryNavy, fontSize: 16 }} />
              }
              onClick={() => openViewDrawer(record)}
              className="action-btn-view"
            />
          </Tooltip>
          {allowRoles.includes(user?.role) && (
            <Tooltip title="Đổi mật khẩu">
              <Button
                type="text"
                shape="circle"
                icon={
                  <KeyOutlined style={{ color: accentGold, fontSize: 16 }} />
                }
                onClick={() => {
                  setResetUser(record);
                  setResetModalOpen(true);
                }}
                className="action-btn-edit"
              />
            </Tooltip>
          )}
          {allowRoles.includes(user?.role) && (
            <Tooltip title="Sửa hồ sơ">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined style={{ color: primaryNavy, fontSize: 16 }} />
                }
                onClick={() => openDrawer(record)}
                className="action-btn-edit"
              />
            </Tooltip>
          )}
          {allowRoles.includes(user?.role) && (
            <Popconfirm
              title="Xóa nhân sự này?"
              description="Tài khoản sẽ bị gỡ vĩnh viễn khỏi hệ thống."
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={async () => {
                await deleteAdmin(record.id);
                message.success("Đã xóa tài khoản");
                fetchAdmins();
              }}
            >
              <Tooltip title="Xóa nhân sự">
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                  className="action-btn-delete"
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const filteredAdmins = admins.filter((item) => {
    const matchName =
      !searchText ||
      item.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchText.toLowerCase());

    const matchRole = !roleFilter || item.role === roleFilter;

    const matchStatus =
      statusFilter === ""
        ? true
        : Number(item.is_active) === Number(statusFilter);

    return matchName && matchRole && matchStatus;
  });

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="admin-editorial-layout">
        <div className="admin-editorial-container">
          {/* HEADER BAR */}
          <div className="admin-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG ĐIỀU HÀNH MỤC VỤ
              </span>
              <Title level={2} className="admin-main-title">
                BAN ĐIỀU HÀNH & HỘI ĐỒNG MỤC VỤ
              </Title>
              <Paragraph className="admin-sub-title">
                Quản lý phân quyền tài khoản hệ thống nội bộ Giáo xứ Đồng Quan.
              </Paragraph>
            </div>

            <div className="header-action-group">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAdmins}
                loading={loading}
                className="refresh-btn"
                style={{ marginRight: 10 }}
              >
                Làm mới
              </Button>

              {allowRoles.includes(user?.role) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openDrawer()}
                  className="add-admin-btn"
                >
                  Thêm Nhân Sự Mới
                </Button>
              )}
            </div>
          </div>

          {/* BENTO GRID THỐNG KÊ */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Tổng Số Nhân Sự"
                  value={totalStaff}
                  prefix={<TeamOutlined className="stat-icon navy" />}
                  valueStyle={{
                    fontWeight: 700,
                    color: primaryNavy,
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Hàng Giáo Sĩ (Linh Mục)"
                  value={totalPriests}
                  prefix={
                    <SafetyCertificateOutlined className="stat-icon gold" />
                  }
                  valueStyle={{
                    fontWeight: 700,
                    color: accentGold,
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Tài Khoản Hoạt Động"
                  value={activeStaff}
                  prefix={<CheckCircleOutlined className="stat-icon green" />}
                  valueStyle={{
                    fontWeight: 700,
                    color: "#2e7d32",
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* CARD TÌM KIẾM BỘ LỌC */}
          <Card bordered={false} className="filter-card">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} lg={10}>
                <Input
                  allowClear
                  placeholder="Tìm theo tên, email hoặc username..."
                  prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="custom-filter-input"
                />
              </Col>

              <Col xs={24} md={12} lg={5}>
                <Select
                  allowClear
                  placeholder="Vai trò"
                  style={{ width: "100%" }}
                  value={roleFilter || undefined}
                  onChange={(value) => setRoleFilter(value || "")}
                  className="custom-filter-select"
                  options={[
                    { value: "admin", label: "Quản trị viên" },
                    { value: "priest", label: "Linh mục" },
                    { value: "liturgy_manager", label: "Quản lý phụng vụ" },
                    { value: "media_manager", label: "Quản lý truyền thông" },
                  ]}
                />
              </Col>

              <Col xs={24} md={12} lg={5}>
                <Select
                  allowClear
                  placeholder="Trạng thái"
                  style={{ width: "100%" }}
                  value={statusFilter !== "" ? statusFilter : undefined}
                  onChange={(value) => setStatusFilter(value ?? "")}
                  className="custom-filter-select"
                  options={[
                    { value: 1, label: "Đang hoạt động" },
                    { value: 0, label: "Đang khóa" },
                  ]}
                />
              </Col>

              <Col xs={24} lg={4}>
                <Button
                  block
                  icon={<ClearOutlined />}
                  onClick={() => {
                    setSearchText("");
                    setRoleFilter("");
                    setStatusFilter("");
                  }}
                  className="clear-filter-btn"
                >
                  Đặt lại
                </Button>
              </Col>
            </Row>
          </Card>

          {/* BẢNG DỮ LIỆU CHÍNH */}
          <Card bordered={false} className="main-table-card">
            <Table
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={filteredAdmins}
              pagination={{
                pageSize: 8,
                showTotal: (total) => `Tổng số: ${total} nhân sự`,
                style: { marginTop: 20 },
              }}
              scroll={{ x: 800 }}
              className="custom-admin-table"
            />
          </Card>
        </div>

        {/* DRAWER XEM CHI TIẾT HỒ SƠ */}
        <Drawer
          title={
            <div className="drawer-title-box">
              <UserOutlined style={{ color: accentGold }} />
              <span>Hồ Sơ Trích Ngang Nhân Sự</span>
            </div>
          }
          width={640}
          onClose={() => setViewOpen(false)}
          open={viewOpen}
          className="editorial-drawer"
        >
          {viewRecord && (
            <div>
              {/* Profile Header Box */}
              <div className="profile-header-card">
                <Avatar
                  size={80}
                  src={
                    viewRecord.avatar
                      ? `${process.env.REACT_APP_API_URL}${viewRecord.avatar}`
                      : null
                  }
                  icon={<UserOutlined />}
                  style={{
                    background:
                      viewRecord.role === "priest" ? "#8b0000" : primaryNavy,
                    border: "2px solid " + accentGold,
                    marginBottom: 12,
                  }}
                />

                <Title
                  level={4}
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    color: primaryNavy,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {viewRecord.saint_name
                    ? `${viewRecord.saint_name} ${viewRecord.full_name}`
                    : viewRecord.full_name}
                </Title>

                <Text
                  type="secondary"
                  style={{ fontSize: "13px", display: "block", marginTop: 4 }}
                >
                  Chức danh: <b>{viewRecord.position || "Thành viên"}</b>
                </Text>

                <div style={{ marginTop: 10 }}>
                  <Tag
                    color={viewRecord.role === "priest" ? "red" : "blue"}
                    style={{ fontWeight: 600, borderRadius: "6px" }}
                  >
                    {viewRecord.role === "priest"
                      ? "LINH MỤC GIÁO XỨ"
                      : "QUẢN TRỊ VIÊN HỆ THỐNG"}
                  </Tag>

                  <Tag
                    color={viewRecord.is_active === 1 ? "green" : "default"}
                    style={{ borderRadius: 6 }}
                  >
                    {viewRecord.is_active === 1
                      ? "Đang hoạt động"
                      : "Đang khóa"}
                  </Tag>
                </div>
              </div>

              {/* Khối Thông tin tài khoản */}
              <Card
                title={
                  <span
                    style={{
                      color: primaryNavy,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    1. Thông tin tài khoản & Hệ thống
                  </span>
                }
                size="small"
                bordered={false}
                className="modal-prayer-card"
                style={{ marginBottom: 16 }}
              >
                <Descriptions
                  column={1}
                  bordered
                  size="small"
                  className="custom-modal-desc"
                >
                  <Descriptions.Item label="Username">
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: primaryNavy,
                      }}
                    >
                      {viewRecord.username}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {viewRecord.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {viewRecord.phone || "—"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Khối Thông tin cá nhân */}
              <Card
                title={
                  <span
                    style={{
                      color: primaryNavy,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    2. Lý lịch & Nhân thân
                  </span>
                }
                size="small"
                bordered={false}
                className="modal-prayer-card"
                style={{ marginBottom: 16 }}
              >
                <Descriptions
                  column={1}
                  bordered
                  size="small"
                  className="custom-modal-desc"
                >
                  <Descriptions.Item label="Ngày sinh">
                    {viewRecord.birthday
                      ? dayjs(viewRecord.birthday).format("DD/MM/YYYY")
                      : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Quê quán">
                    {viewRecord.hometown || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ cư trú">
                    {viewRecord.address || "—"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Khối Thông tin mục vụ riêng cho Linh mục */}
              {viewRecord.role === "priest" && (
                <Card
                  title={
                    <span
                      style={{
                        color: primaryNavy,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      3. Thông tin Chức thánh Mục vụ
                    </span>
                  }
                  size="small"
                  bordered={false}
                  className="modal-prayer-card"
                >
                  <Descriptions
                    column={1}
                    bordered
                    size="small"
                    className="custom-modal-desc"
                  >
                    <Descriptions.Item label="Ngày thụ phong">
                      <span style={{ fontWeight: 700, color: primaryNavy }}>
                        {viewRecord.ordination_date
                          ? dayjs(viewRecord.ordination_date).format(
                              "DD [Tháng] MM, YYYY",
                            )
                          : "—"}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Khẩu hiệu mục vụ">
                      <span
                        style={{
                          fontStyle: "italic",
                          fontWeight: 700,
                          color: primaryNavy,
                        }}
                      >
                        "{viewRecord.motto || "Đang cập nhật..."}"
                      </span>
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider style={{ margin: "12px 0" }} />

                  <div style={{ padding: "0 8px" }}>
                    <Text
                      strong
                      style={{
                        color: primaryNavy,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Tiểu sử chặng đường phục vụ:
                    </Text>
                    <Paragraph
                      style={{
                        color: textDark,
                        margin: 0,
                        whiteSpace: "pre-line",
                        fontSize: "13px",
                      }}
                    >
                      {viewRecord.bio || "Chưa có dữ liệu tiểu sử."}
                    </Paragraph>
                  </div>
                </Card>
              )}
            </div>
          )}
        </Drawer>

        {/* DRAWER CẤU HÌNH THÊM / SỬA */}
        <Drawer
          title={
            <div className="drawer-title-box">
              <UserOutlined style={{ color: accentGold }} />
              <span>
                {editing ? "Cập Nhật Hồ Sơ Nhân Sự" : "Khởi Tạo Nhân Sự Mới"}
              </span>
            </div>
          }
          width={560}
          onClose={() => setOpen(false)}
          open={open}
          extra={
            <Space>
              <Button
                onClick={() => setOpen(false)}
                style={{ borderRadius: 8 }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                type="primary"
                loading={loading}
                style={{
                  backgroundColor: primaryNavy,
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Lưu dữ liệu
              </Button>
            </Space>
          }
        >
          <Form form={form} layout="vertical" style={{ paddingTop: 8 }}>
            <Card
              title={
                <Text strong className="form-field-label">
                  1. Quyền hạn & Tài khoản
                </Text>
              }
              size="small"
              bordered={false}
              className="modal-prayer-card"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Ảnh đại diện
                      </Text>
                    }
                  >
                    <Upload
                      listType="picture-circle"
                      fileList={fileList}
                      beforeUpload={() => false}
                      onChange={({ fileList }) => setFileList(fileList)}
                      maxCount={1}
                    >
                      {fileList.length < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 6, fontSize: 12 }}>
                            Tải lên
                          </div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                </Col>

                <Col span={18}>
                  <Paragraph
                    type="secondary"
                    style={{ fontSize: "12px", margin: 0 }}
                  >
                    Tải lên ảnh chân dung rõ nét. Định dạng cho phép PNG, JPG.
                  </Paragraph>
                </Col>
              </Row>

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Địa chỉ Email *
                  </Text>
                }
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Vui lòng điền đúng Email",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="name@example.com"
                  onChange={handleEmailChange}
                  className="custom-form-input"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Tên tài khoản (Username)
                      </Text>
                    }
                    name="username"
                  >
                    <Input
                      disabled
                      prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                      className="custom-form-input"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Vai trò chức vụ
                      </Text>
                    }
                    name="role"
                    initialValue="admin"
                  >
                    <Select
                      onChange={(value) => setCurrentRole(value)}
                      className="custom-form-input"
                    >
                      <Option value="admin">Quản trị viên</Option>
                      <Option value="priest">Linh mục Giáo xứ</Option>
                      <Option value="liturgy_manager">Quản lý phụng vụ</Option>
                      <Option value="media_manager">
                        Quản lý truyền thông
                      </Option>
                      <Option value="catechist">Giáo lý viên</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Chức danh đảm nhiệm cụ thể
                  </Text>
                }
                name="position"
              >
                <Input
                  placeholder="Ví dụ: Cha chánh xứ, Phó ban hành giáo, Thư ký..."
                  className="custom-form-input"
                />
              </Form.Item>

              {!editing && (
                <Form.Item
                  label={
                    <Text strong className="form-field-label">
                      Mật khẩu ban đầu *
                    </Text>
                  }
                  name="password"
                  rules={[{ required: true, message: "Mật khẩu bắt buộc" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                    placeholder="Nhập mật khẩu..."
                    className="custom-form-input"
                  />
                </Form.Item>
              )}
            </Card>

            <Card
              title={
                <Text strong className="form-field-label">
                  2. Thông tin lý lịch cá nhân
                </Text>
              }
              size="small"
              bordered={false}
              className="modal-prayer-card"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Tên Thánh
                      </Text>
                    }
                    name="saint_name"
                  >
                    <Input
                      placeholder="Giuse..."
                      className="custom-form-input"
                    />
                  </Form.Item>
                </Col>

                <Col span={16}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Họ và tên *
                      </Text>
                    }
                    name="full_name"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ tên" },
                    ]}
                  >
                    <Input
                      prefix={<IdcardOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="Nguyễn Văn A..."
                      className="custom-form-input"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Điện thoại di động
                      </Text>
                    }
                    name="phone"
                  >
                    <Input
                      prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="09xxxx..."
                      className="custom-form-input"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Ngày sinh
                      </Text>
                    }
                    name="birthday"
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày..."
                      disabledDate={disabledFutureDates}
                      className="custom-form-input"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Quê quán nguyên quán
                  </Text>
                }
                name="hometown"
              >
                <Input
                  prefix={<HomeOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="Địa chỉ quê hương..."
                  className="custom-form-input"
                />
              </Form.Item>

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Địa chỉ thường trú hiện nay
                  </Text>
                }
                name="address"
              >
                <Input
                  prefix={<HomeOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="Nơi ở hiện nay..."
                  className="custom-form-input"
                />
              </Form.Item>
            </Card>

            {currentRole === "priest" && (
              <Card
                title={
                  <Text strong className="form-field-label">
                    3. Hồ sơ chức thánh Mục vụ
                  </Text>
                }
                size="small"
                bordered={false}
                className="modal-prayer-card"
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Text strong className="form-field-label">
                          Ngày thụ phong Linh mục
                        </Text>
                      }
                      name="ordination_date"
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày..."
                        disabledDate={disabledOrdinationDates}
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <Text strong className="form-field-label">
                          Khẩu hiệu Mục vụ
                        </Text>
                      }
                      name="motto"
                    >
                      <Input
                        prefix={<BookOutlined style={{ color: "#94a3b8" }} />}
                        placeholder="Châm ngôn cuộc đời..."
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <Text strong className="form-field-label">
                      Tóm tắt tiểu sử phục vụ
                    </Text>
                  }
                  name="bio"
                >
                  <TextArea
                    rows={4}
                    placeholder="Các nơi đã từng mục vụ, công tác..."
                    className="custom-form-input"
                  />
                </Form.Item>
              </Card>
            )}
          </Form>
        </Drawer>

        {/* MODAL RESET MẬT KHẨU */}
        <Modal
          open={resetModalOpen}
          onCancel={() => {
            setResetModalOpen(false);
            resetForm.resetFields();
          }}
          onOk={handleResetPassword}
          confirmLoading={loading}
          title={
            <div className="modal-custom-title">
              <KeyOutlined style={{ color: accentGold }} />
              <span>Đặt Lại Mật Khẩu Truy Cập</span>
            </div>
          }
          centered
          okButtonProps={{
            style: {
              backgroundColor: primaryNavy,
              borderRadius: 8,
              height: 38,
              fontWeight: 600,
            },
          }}
          cancelButtonProps={{
            style: { borderRadius: 8, height: 38 },
          }}
        >
          <Form form={resetForm} layout="vertical" style={{ paddingTop: 12 }}>
            <Form.Item
              label={
                <Text strong className="form-field-label">
                  Mật khẩu mới *
                </Text>
              }
              name="newPassword"
              rules={[
                { required: true, message: "Bắt buộc nhập" },
                { min: 6, message: "Tối thiểu 6 ký tự" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                className="custom-form-input"
              />
            </Form.Item>

            <Form.Item
              label={
                <Text strong className="form-field-label">
                  Xác nhận lại mật khẩu *
                </Text>
              }
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Bắt buộc nhập" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value)
                      return Promise.resolve();
                    return Promise.reject(
                      new Error("Mật khẩu gõ lại chưa khớp"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                className="custom-form-input"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .admin-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .admin-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Section */
            .admin-header-section {
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

            .admin-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .admin-sub-title {
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

            .add-admin-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 42px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            /* Stats Bento Cards */
            .stat-card {
              border-radius: 16px !important;
              background: #ffffff !important;
              border: 1px solid rgba(27, 54, 93, 0.08) !important;
              box-shadow: 0 4px 16px rgba(27, 54, 93, 0.03) !important;
            }

            .stat-icon {
              margin-right: 8px;
            }
            .stat-icon.navy { color: ${primaryNavy}; }
            .stat-icon.gold { color: ${accentGold}; }
            .stat-icon.green { color: #2e7d32; }

            /* Filter Card */
            .filter-card {
              border-radius: 16px !important;
              background: #ffffff !important;
              border: 1px solid rgba(27, 54, 93, 0.08) !important;
              margin-bottom: 20px;
              padding: 4px;
            }

            .custom-filter-input {
              border-radius: 10px !important;
              height: 40px !important;
            }

            .custom-filter-select .ant-select-selector {
              border-radius: 10px !important;
              height: 40px !important;
              display: flex;
              align-items: center;
            }

            .clear-filter-btn {
              border-radius: 10px !important;
              height: 40px !important;
              color: #64748b !important;
            }

            /* Main Table Card */
            .main-table-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.25) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
              padding: 8px;
            }

            .custom-admin-table .ant-table-thead > tr > th {
              background: ${softBg} !important;
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
              border-bottom: 1px solid rgba(27, 54, 93, 0.1) !important;
            }

            .action-btn-view:hover, .action-btn-edit:hover {
              background: rgba(27, 54, 93, 0.1) !important;
            }

            .action-btn-delete:hover {
              background: #fff5f5 !important;
            }

            /* Profile Header in Drawer */
            .profile-header-card {
              background: #ffffff;
              padding: 24px;
              border-radius: 16px;
              border: 1px solid rgba(212, 175, 55, 0.3);
              text-align: center;
              margin-bottom: 20px;
              box-shadow: 0 4px 16px rgba(27, 54, 93, 0.04);
            }

            /* Modal Style */
            .modal-custom-title {
              display: flex;
              align-items: center;
              gap: 8px;
              font-family: 'Playfair Display', serif;
              color: ${primaryNavy};
              font-size: 18px;
              font-weight: 700;
            }

            .modal-prayer-card {
              border-radius: 12px !important;
              border: 1px solid rgba(27, 54, 93, 0.08) !important;
              background: ${softBg} !important;
            }

            .form-field-label {
              font-size: 13px;
              color: ${primaryNavy};
            }

            .custom-form-input {
              border-radius: 8px !important;
            }

            .custom-modal-desc {
              border-radius: 12px;
              overflow: hidden;
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
}
