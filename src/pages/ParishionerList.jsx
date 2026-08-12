import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  message,
  Modal,
  Form,
  Popconfirm,
  Card,
  Typography,
  Select,
  Row,
  Col,
  Tag,
  Divider,
  Tooltip,
  ConfigProvider,
  Drawer,
  Descriptions,
  Radio,
  DatePicker,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  UserOutlined,
  SearchOutlined,
  CompassOutlined,
  ReloadOutlined,
  EyeOutlined,
  BookOutlined,
  HeartOutlined,
  TeamOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getParishioners,
  createParishioner,
  updateParishioner,
  deleteParishioner,
  getFamilyMembers,
  getAllHouseheads,
} from "../api/parishionerApi";
import { getChurches } from "../api/churchApi";
import { useUser } from "../context/UserContext";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

// =========================================================
// COMPONENT CON: HIỂN THỊ THÀNH VIÊN TRONG HỘ
// =========================================================
function FamilyMembersTable({ record, onViewDetail, onEdit, onDelete }) {
  const [members, setMembers] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setSubLoading(true);
        const res = await getFamilyMembers(record.id);
        setMembers(res.data?.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách thành viên hộ:", err);
      } finally {
        setSubLoading(false);
      }
    };
    fetchMembers();
  }, [record.id]);

  const subColumns = [
    {
      title: "Mã Nhân Khẩu",
      dataIndex: "code",
      width: 130,
      render: (c) => (
        <span
          style={{
            color: primaryNavy,
            fontWeight: 700,
            fontFamily: "monospace",
          }}
        >
          {c}
        </span>
      ),
    },
    {
      title: "Tên Thánh",
      dataIndex: "saint_name",
      render: (t) => (
        <span style={{ fontWeight: 600, color: textDark }}>{t}</span>
      ),
    },
    {
      title: "Họ và Tên",
      dataIndex: "full_name",
      render: (t) => (
        <span style={{ fontWeight: 600, color: textDark }}>{t}</span>
      ),
    },
    {
      title: "Quan hệ",
      dataIndex: "relationship_with_head",
      width: 160,
      render: (rel) => (
        <Tag className="gold-category-tag">{rel || "Thành viên"}</Tag>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      width: 90,
      render: (g) =>
        g === "male" ? (
          <Tag color="blue">Nam</Tag>
        ) : (
          <Tag color="magenta">Nữ</Tag>
        ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "date_of_birth",
      width: 120,
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "---"),
    },
    { title: "Nghề nghiệp", dataIndex: "occupation" },
    {
      title: "Thao tác",
      width: 110,
      align: "center",
      render: (_, subRecord) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={
                <EyeOutlined style={{ color: primaryNavy, fontSize: 15 }} />
              }
              onClick={() => onViewDetail(subRecord)}
              className="action-btn-view"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={
                <EditOutlined style={{ color: primaryNavy, fontSize: 15 }} />
              }
              onClick={() => onEdit(subRecord)}
              className="action-btn-edit"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa thành viên khỏi hộ?"
            description="Thành viên này sẽ bị xóa khỏi hồ sơ hộ gia đình."
            onConfirm={() => onDelete(subRecord.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                shape="circle"
                icon={<DeleteOutlined style={{ fontSize: 15 }} />}
                className="action-btn-delete"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="sub-table-container">
      <div className="sub-table-header">
        <TeamOutlined style={{ color: accentGold, marginRight: 6 }} />
        <span>DANH SÁCH THÀNH VIÊN THUỘC HỘ GIA ĐÌNH</span>
      </div>
      <Spin spinning={subLoading} tip="Đang tải danh sách thành viên...">
        <Table
          rowKey="id"
          columns={subColumns}
          dataSource={members}
          pagination={false}
          size="small"
          bordered={false}
          className="custom-sub-table"
        />
      </Spin>
    </div>
  );
}

// =========================================================
// COMPONENT CHÍNH
// =========================================================
export default function ParishionerManagement() {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [parishioners, setParishioners] = useState([]);
  const [churches, setChurches] = useState([]);
  const [houseHeads, setHouseHeads] = useState([]);

  const { user } = useUser();
  const allowRoles = ["admin", "priest"];

  // Bộ lọc & Phân trang
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [churchFilter, setChurchFilter] = useState("all");

  // Đóng mở Drawer & Modal
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);

  // Theo dõi trạng thái Form
  const [isHeadWatch, setIsHeadWatch] = useState(1);

  const [form] = Form.useForm();

  const loadChurches = async () => {
    try {
      const res = await getChurches();
      setChurches(res.data || []);
    } catch (error) {
      console.error("Không tải được danh sách giáo xứ:", error);
    }
  };

  const loadHouseHeadsOptions = async () => {
    try {
      const res = await getAllHouseheads();
      setHouseHeads(res.data?.data || []);
    } catch (error) {
      console.error("Không tải được danh sách chủ hộ:", error);
    }
  };

  const loadData = useCallback(
    async (
      page,
      pageSize,
      search = searchKeyword,
      status = statusFilter,
      churchId = churchFilter,
    ) => {
      try {
        setLoading(true);
        const params = {
          page: page ?? pagination.current,
          limit: pageSize ?? pagination.pageSize,
          ...(search && { keyword: search.trim() }),
          ...(status !== "all" && { status }),
          ...(churchId && churchId !== "all" && { churches_id: churchId }),
        };

        const res = await getParishioners(params);
        setParishioners(res.data?.data || []);
        setPagination((prev) => ({
          ...prev,
          current: page ?? prev.current,
          pageSize: pageSize ?? prev.pageSize,
          total: res.data?.total || 0,
        }));
      } catch (error) {
        message.error("Không thể tải danh sách dữ liệu giáo dân");
      } finally {
        setLoading(false);
      }
    },
    [searchKeyword, statusFilter, churchFilter, pagination],
  );

  useEffect(() => {
    loadData(1);
    loadChurches();
  }, [statusFilter, churchFilter, loadData]);
  const handleTableChange = (newPagination) => {
    loadData(
      newPagination.current,
      newPagination.pageSize,
      searchKeyword,
      statusFilter,
      churchFilter,
    );
  };

  const handleSearch = () => {
    loadData(1, pagination.pageSize, searchKeyword, statusFilter, churchFilter);
  };

  const handleResetSearch = () => {
    setSearchKeyword("");
    setStatusFilter("all");
    setChurchFilter("all");
    loadData(1, pagination.pageSize, "", "all", "all");
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);

      const payload = {
        ...values,
        date_of_birth: values.date_of_birth
          ? values.date_of_birth.format("YYYY-MM-DD")
          : null,
        baptism_date: values.baptism_date
          ? values.baptism_date.format("YYYY-MM-DD")
          : null,
        confirmation_date: values.confirmation_date
          ? values.confirmation_date.format("YYYY-MM-DD")
          : null,
        first_communion_date: values.first_communion_date
          ? values.first_communion_date.format("YYYY-MM-DD")
          : null,
      };

      if (editing) {
        await updateParishioner(editing.id, payload);
        message.success("Cập nhật hồ sơ giáo dân thành công");
      } else {
        await createParishioner(payload);
        message.success("Khai báo thông tin giáo dân mới thành công");
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
      loadData(editing ? pagination.current : 1);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditing(record);
    setIsHeadWatch(record.is_head);
    loadHouseHeadsOptions();
    form.setFieldsValue({
      ...record,
      date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
      baptism_date: record.baptism_date ? dayjs(record.baptism_date) : null,
      confirmation_date: record.confirmation_date
        ? dayjs(record.confirmation_date)
        : null,
      first_communion_date: record.first_communion_date
        ? dayjs(record.first_communion_date)
        : null,
    });
    setOpen(true);
  };

  const handleViewDetail = (record) => {
    setViewingRecord(record);
    setDetailOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteParishioner(id);
      message.success("Xóa dữ liệu giáo dân thành công");
      loadData(
        parishioners.length === 1 && pagination.current > 1
          ? pagination.current - 1
          : pagination.current,
      );
    } catch {
      message.error("Không thể thực hiện tác vụ xóa");
      setLoading(false);
    }
  };

  const getChurchName = (churchId) => {
    const match = churches.find((c) => c.id === churchId);
    return match ? (
      match.name
    ) : (
      <span style={{ color: "#94a3b8" }}>Chưa phân xứ</span>
    );
  };

  const actionColumn = {
    title: "Thao tác",
    width: 120,
    fixed: "right",
    align: "center",
    render: (_, record) => (
      <Space size="small">
        <Tooltip title="Xem chi tiết hồ sơ">
          <Button
            type="text"
            shape="circle"
            icon={<EyeOutlined style={{ color: primaryNavy, fontSize: 16 }} />}
            onClick={() => handleViewDetail(record)}
            className="action-btn-view"
          />
        </Tooltip>

        {allowRoles.includes(user?.role) && (
          <>
            <Tooltip title="Chỉnh sửa hồ sơ">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined style={{ color: primaryNavy, fontSize: 16 }} />
                }
                onClick={() => handleEdit(record)}
                className="action-btn-edit"
              />
            </Tooltip>

            <Popconfirm
              title="Xác nhận xóa hồ sơ?"
              description="Hành động này sẽ xóa dữ liệu vĩnh viễn khỏi hệ thống."
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa dữ liệu"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                  className="action-btn-delete"
                />
              </Tooltip>
            </Popconfirm>
          </>
        )}
      </Space>
    ),
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: "#94a3b8" }}>{index + 1}</span>
      ),
    },
    {
      title: "Mã Hộ",
      dataIndex: "code",
      key: "code",
      width: 130,
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (code) => (
        <span
          style={{
            fontWeight: 700,
            color: primaryNavy,
            fontFamily: "monospace",
          }}
        >
          {code}
        </span>
      ),
    },
    {
      title: "Tên Thánh",
      dataIndex: "saint_name",
      key: "saint_name",
      render: (name) => (
        <Text strong style={{ color: primaryNavy, fontSize: 15 }}>
          {name || "Chưa cập nhật"}
        </Text>
      ),
    },
    {
      title: "Họ Tên Chủ Hộ",
      dataIndex: "full_name",
      key: "full_name",
      render: (name) => (
        <Text strong style={{ color: primaryNavy, fontSize: 15 }}>
          {name || "Chưa cập nhật"}
        </Text>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      width: 100,
      align: "center",
      render: (v) =>
        v === "male" ? (
          <Tag color="blue">Nam</Tag>
        ) : (
          <Tag color="magenta">Nữ</Tag>
        ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      width: 130,
      render: (phone) =>
        phone ? (
          <span>{phone}</span>
        ) : (
          <span style={{ color: "#94a3b8" }}>---</span>
        ),
    },
    {
      title: "Thuộc Giáo Xứ / Giáo Họ",
      dataIndex: "churches_id",
      render: (id) => (
        <Tag className="gold-category-tag">{getChurchName(id)}</Tag>
      ),
    },
    // {
    //   title: "Trạng thái",
    //   dataIndex: "status",
    //   width: 140,
    //   align: "center",
    //   render: (status) => (
    //     <Tag
    //       color={
    //         status === "active"
    //           ? "green"
    //           : status === "moved"
    //             ? "blue"
    //             : status === "deceased"
    //               ? "red"
    //               : "orange"
    //       }
    //       style={{ fontWeight: 600, borderRadius: 8 }}
    //     >
    //       {status === "active"
    //         ? "Đang sinh hoạt"
    //         : status === "moved"
    //           ? "Chuyển xứ"
    //           : status === "deceased"
    //             ? "Qua đời"
    //             : "Tạm ngưng"}
    //     </Tag>
    //   ),
    // },
    ...(allowRoles.includes(user?.role) ? [actionColumn] : []),
  ];

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
      <div className="parishioner-editorial-layout">
        <div className="parishioner-editorial-container">
          {/* HEADER BAR */}
          <div className="parishioner-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG SỔ SÁCH MỤC VỤ GIÁO DÂN
              </span>
              <Title level={2} className="parishioner-main-title">
                HỘ GIA ĐÌNH
              </Title>
              <Paragraph className="parishioner-sub-title">
                Quản lý thông tin hồ sơ giáo dân, phân cấp hộ gia đình và đời
                sống bí tích toàn xứ.
              </Paragraph>
            </div>

            <div className="header-action-group">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadData(1)}
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
                  onClick={() => {
                    setEditing(null);
                    setIsHeadWatch(1);
                    form.resetFields();
                    loadHouseHeadsOptions();
                    setOpen(true);
                  }}
                  className="add-parishioner-btn"
                >
                  Thêm Giáo Dân Mới
                </Button>
              )}
            </div>
          </div>

          {/* CARD TÌM KIẾM BỘ LỌC */}
          <Card bordered={false} className="filter-card">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8} lg={8}>
                <Text strong className="form-field-label">
                  Tìm kiếm từ khóa
                </Text>
                <Input
                  placeholder="Nhập họ tên, mã hộ, SĐT..."
                  prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                  className="custom-filter-input"
                  allowClear
                />
              </Col>

              <Col xs={12} md={5} lg={5}>
                <Text strong className="form-field-label">
                  Trạng thái sinh hoạt
                </Text>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: "100%" }}
                  className="custom-filter-select"
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value="active">Đang sinh hoạt</Option>
                  <Option value="inactive">Tạm ngưng</Option>
                  <Option value="moved">Chuyển xứ</Option>
                  <Option value="deceased">Đã qua đời</Option>
                </Select>
              </Col>

              <Col xs={12} md={6} lg={6}>
                <Text strong className="form-field-label">
                  Thuộc Giáo xứ / Giáo họ
                </Text>
                <Select
                  showSearch
                  placeholder="Chọn Giáo xứ"
                  value={churchFilter}
                  onChange={setChurchFilter}
                  style={{ width: "100%" }}
                  optionFilterProp="children"
                  className="custom-filter-select"
                  allowClear
                >
                  <Option value="all">Tất cả Giáo xứ / Giáo họ</Option>
                  {churches.map((church) => (
                    <Option key={church.id} value={church.id}>
                      {church.name}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col
                xs={24}
                md={5}
                lg={5}
                style={{ display: "flex", gap: 8, marginTop: 22 }}
              >
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  style={{
                    backgroundColor: primaryNavy,
                    borderRadius: 10,
                    height: 40,
                    fontWeight: 600,
                    flex: 1,
                  }}
                >
                  Lọc
                </Button>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleResetSearch}
                  style={{ borderRadius: 10, height: 40, width: 40 }}
                />
              </Col>
            </Row>
          </Card>

          {/* MAIN DATA TABLE CARD */}
          <Card
            bordered={false}
            className="main-table-card"
            title={
              <div className="section-card-header">
                <HomeOutlined style={{ color: accentGold }} />
                <span>Sổ Quản Lý Hộ Gia Đình Toàn Xứ</span>
              </div>
            }
          >
            <Spin spinning={loading} tip="Đang tải danh sách hồ sơ giáo dân...">
              <Table
                rowKey="id"
                columns={columns}
                dataSource={parishioners}
                expandable={{
                  expandedRowRender: (record) => (
                    <FamilyMembersTable
                      record={record}
                      onViewDetail={handleViewDetail}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ),
                  rowExpandable: (record) => record.is_head === 1,
                }}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  style: { marginTop: 20 },
                }}
                onChange={handleTableChange}
                scroll={{ x: 900 }}
                className="custom-admin-table"
              />
            </Spin>
          </Card>
        </div>

        {/* DRAWER XEM CHI TIẾT HỒ SƠ */}
        <Drawer
          title={
            <div className="drawer-title-box">
              <UserOutlined style={{ color: accentGold }} />
              <div>
                <span
                  style={{ fontSize: 16, fontWeight: 700, display: "block" }}
                >
                  HỒ SƠ CHI TIẾT GIÁO DÂN
                </span>
                <small style={{ color: "#64748b", fontFamily: "monospace" }}>
                  Mã số: {viewingRecord?.code} (
                  {viewingRecord?.is_head ? "Chủ hộ" : "Thành viên"})
                </small>
              </div>
            </div>
          }
          placement="right"
          width={650}
          onClose={() => setDetailOpen(false)}
          open={detailOpen}
          className="editorial-drawer"
        >
          {viewingRecord && (
            <div>
              <Divider
                orientation="left"
                style={{
                  marginTop: 0,
                  color: primaryNavy,
                  borderColor: accentGold,
                }}
              >
                <UserOutlined style={{ marginRight: 6 }} /> Thông Tin Nhân Thân
              </Divider>

              <Descriptions
                column={2}
                bordered
                size="small"
                className="custom-modal-desc"
              >
                <Descriptions.Item label="Họ và Tên" span={2}>
                  <strong style={{ fontSize: 16, color: primaryNavy }}>
                    {viewingRecord.saint_name} {viewingRecord.full_name}
                  </strong>
                </Descriptions.Item>

                <Descriptions.Item label="Vai trò hộ">
                  {viewingRecord.is_head ? (
                    <Tag className="gold-category-tag">Chủ Hộ</Tag>
                  ) : (
                    <Tag color="default">Thành viên</Tag>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Mối quan hệ">
                  {viewingRecord.is_head
                    ? "Đại diện chủ hộ"
                    : viewingRecord.relationship_with_head || "Chưa cập nhật"}
                </Descriptions.Item>

                <Descriptions.Item label="Giới tính">
                  {viewingRecord.gender === "male" ? "Nam" : "Nữ"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày sinh">
                  {viewingRecord.date_of_birth
                    ? dayjs(viewingRecord.date_of_birth).format("DD/MM/YYYY")
                    : "---"}
                </Descriptions.Item>

                <Descriptions.Item label="Số điện thoại">
                  {viewingRecord.phone || "---"}
                </Descriptions.Item>

                <Descriptions.Item label="Email" span={2}>
                  {viewingRecord.email || "---"}
                </Descriptions.Item>

                <Descriptions.Item label="Giáo xứ trực thuộc" span={2}>
                  {getChurchName(viewingRecord.churches_id)}
                </Descriptions.Item>

                <Descriptions.Item label="Nghề nghiệp" span={2}>
                  {viewingRecord.occupation || "---"}
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ" span={2}>
                  {viewingRecord.address || "---"}
                </Descriptions.Item>
              </Descriptions>

              <Divider
                orientation="left"
                style={{
                  color: primaryNavy,
                  borderColor: accentGold,
                  marginTop: 24,
                }}
              >
                <BookOutlined style={{ marginRight: 6 }} /> Đời Sống Đức Tin (Bí
                Tích)
              </Divider>

              <Descriptions
                column={1}
                bordered
                size="small"
                className="custom-modal-desc"
              >
                <Descriptions.Item label="Bí tích Rửa Tội">
                  {viewingRecord.baptism_date ? (
                    dayjs(viewingRecord.baptism_date).format("DD/MM/YYYY")
                  ) : (
                    <span style={{ color: "#94a3b8" }}>
                      Chưa cập nhật dữ liệu
                    </span>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Rước Lễ Lần Đầu">
                  {viewingRecord.first_communion_date ? (
                    dayjs(viewingRecord.first_communion_date).format(
                      "DD/MM/YYYY",
                    )
                  ) : (
                    <span style={{ color: "#94a3b8" }}>
                      Chưa cập nhật dữ liệu
                    </span>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Bí tích Thêm Sức">
                  {viewingRecord.confirmation_date ? (
                    dayjs(viewingRecord.confirmation_date).format("DD/MM/YYYY")
                  ) : (
                    <span style={{ color: "#94a3b8" }}>
                      Chưa cập nhật dữ liệu
                    </span>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Divider
                orientation="left"
                style={{
                  color: primaryNavy,
                  borderColor: accentGold,
                  marginTop: 24,
                }}
              >
                <HeartOutlined style={{ marginRight: 6 }} /> Tình Trạng Mục Vụ
              </Divider>

              <Descriptions
                column={2}
                bordered
                size="small"
                className="custom-modal-desc"
              >
                <Descriptions.Item label="Hôn nhân">
                  {viewingRecord.marital_status === "single" && "Độc thân"}
                  {viewingRecord.marital_status === "married" && "Đã kết hôn"}
                  {viewingRecord.marital_status === "religious" &&
                    "Tu sĩ / Dâng hiến"}
                  {viewingRecord.marital_status === "widowed" && "Góa bụa"}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                  {viewingRecord.status === "active" && (
                    <Tag color="green">Đang sinh hoạt</Tag>
                  )}
                  {viewingRecord.status === "inactive" && (
                    <Tag color="orange">Tạm ngưng</Tag>
                  )}
                  {viewingRecord.status === "moved" && (
                    <Tag color="blue">Chuyển xứ</Tag>
                  )}
                  {viewingRecord.status === "deceased" && (
                    <Tag color="red">Đã qua đời</Tag>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Ghi chú mục vụ" span={2}>
                  {viewingRecord.notes || "Không có ghi chú nào thêm."}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Drawer>

        {/* MODAL FORM KHAI BÁO HOẶC CẬP NHẬT GIÁO DÂN */}
        <Modal
          width={1150}
          open={open}
          onCancel={() => setOpen(false)}
          onOk={handleSubmit}
          confirmLoading={submitLoading}
          centered
          okText={editing ? "Cập nhật dữ liệu" : "Xác nhận khai báo"}
          cancelText="Hủy bỏ"
          title={
            <div className="modal-custom-title">
              <IdcardOutlined style={{ color: accentGold }} />
              <span>
                {editing
                  ? "Cập Nhật Thông Tin Hồ Sơ Giáo Dân"
                  : "Khai Báo Thành Viên Giáo Dân Mới"}
              </span>
            </div>
          }
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
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              gender: "male",
              status: "active",
              marital_status: "single",
              is_head: 1,
            }}
            style={{ paddingTop: 12 }}
          >
            {/* VAI TRÒ CHỦ HỘ / THÀNH VIÊN */}
            <div className="role-selector-box">
              <Form.Item
                name="is_head"
                label={
                  <Text strong className="form-field-label">
                    Vai trò định danh trong Hộ gia đình
                  </Text>
                }
                rules={[{ required: true }]}
                style={{ marginBottom: 0 }}
              >
                <Radio.Group
                  onChange={(e) => setIsHeadWatch(e.target.value)}
                  disabled={!!editing}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value={1} style={{ padding: "0 24px" }}>
                    <HomeOutlined style={{ marginRight: 6 }} /> Thiết lập làm
                    Chủ Hộ
                  </Radio.Button>
                  <Radio.Button value={0} style={{ padding: "0 24px" }}>
                    <TeamOutlined style={{ marginRight: 6 }} /> Là Thành viên
                    phụ thuộc trong hộ
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </div>

            <Row gutter={32}>
              {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN & CƯ TRÚ */}
              <Col
                xs={24}
                lg={12}
                style={{ borderRight: "1px solid rgba(27, 54, 93, 0.08)" }}
              >
                <div className="form-section-title">
                  <UserOutlined style={{ color: accentGold }} />
                  <span>Thông tin hành chính & Cư trú</span>
                </div>

                {isHeadWatch === 0 && (
                  <Form.Item
                    name="head_id"
                    label={
                      <Text strong className="form-field-label">
                        Thuộc Hộ Gia Đình Của Chủ Hộ *
                      </Text>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn chủ hộ đại diện!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Tìm kiếm nhanh họ tên hoặc mã của chủ hộ"
                      showSearch
                      className="custom-form-input"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {houseHeads.map((head) => (
                        <Option
                          key={head.id}
                          value={head.id}
                          label={`${head.full_name} ${head.code}`}
                        >
                          {head.full_name}{" "}
                          <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                            ({head.code})
                          </span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="code"
                      label={
                        <Text strong className="form-field-label">
                          {isHeadWatch === 1 ? "Mã Số Hộ" : "Mã Định Danh"}
                        </Text>
                      }
                      tooltip="Hệ thống sẽ tự động cấp mã nếu để trống"
                    >
                      <Input
                        placeholder={editing ? "" : "Hệ thống tự động tạo mã"}
                        disabled={true}
                        style={{ fontFamily: "monospace", fontWeight: "bold" }}
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="full_name"
                      label={
                        <Text strong className="form-field-label">
                          Họ và Tên khai sinh *
                        </Text>
                      }
                      rules={[
                        { required: true, message: "Vui lòng nhập họ tên!" },
                      ]}
                    >
                      <Input
                        placeholder="Ví dụ: NGUYỄN VĂN A"
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  {isHeadWatch === 0 && (
                    <Col span={12}>
                      <Form.Item
                        name="relationship_with_head"
                        label={
                          <Text strong className="form-field-label">
                            Quan hệ với Chủ Hộ *
                          </Text>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn mối quan hệ!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Chọn mối quan hệ"
                          className="custom-form-input"
                        >
                          <Option value="Vợ">Vợ</Option>
                          <Option value="Chồng">Chồng</Option>
                          <Option value="Con ruột">Con ruột</Option>
                          <Option value="Con nuôi">Con nuôi</Option>
                          <Option value="Con dâu">Con dâu</Option>
                          <Option value="Con rể">Con rể</Option>
                          <Option value="Cháu">Cháu nội/ngoại</Option>
                          <Option value="Cha/Mẹ">Cha / Mẹ</Option>
                          <Option value="Anh/Chị/Em">Anh / Chị / Em</Option>
                          <Option value="Khác">Quan hệ khác</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  )}

                  <Col span={isHeadWatch === 0 ? 12 : 24}>
                    <Form.Item
                      name="gender"
                      label={
                        <Text strong className="form-field-label">
                          Giới tính
                        </Text>
                      }
                    >
                      <Select className="custom-form-input">
                        <Option value="male">Nam giới</Option>
                        <Option value="female">Nữ giới</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="saint_name"
                      label={
                        <Text strong className="form-field-label">
                          Tên Thánh *
                        </Text>
                      }
                      rules={[
                        { required: true, message: "Vui lòng nhập tên thánh!" },
                      ]}
                    >
                      <Input
                        placeholder="Ví dụ: Daminh, Giuse, Maria..."
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="date_of_birth"
                      label={
                        <Text strong className="form-field-label">
                          Ngày sinh
                        </Text>
                      }
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        disabledDate={(current) =>
                          current && current > dayjs().endOf("day")
                        }
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label={
                        <Text strong className="form-field-label">
                          Số điện thoại
                        </Text>
                      }
                      rules={[
                        {
                          pattern: /^[0-9]{10}$/,
                          message: "SĐT phải gồm 10 chữ số!",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập SĐT liên hệ"
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label={
                        <Text strong className="form-field-label">
                          Hòm thư Email
                        </Text>
                      }
                      rules={[
                        { type: "email", message: "Email không hợp lệ!" },
                      ]}
                    >
                      <Input
                        placeholder="nhap@email.com"
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="occupation"
                      label={
                        <Text strong className="form-field-label">
                          Nghề nghiệp
                        </Text>
                      }
                    >
                      <Input
                        placeholder="Ví dụ: Công nhân, Học sinh..."
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="churches_id"
                  label={
                    <Text strong className="form-field-label">
                      Thuộc Giáo Xứ / Giáo Họ trực thuộc
                    </Text>
                  }
                >
                  <Select
                    placeholder="Lựa chọn giáo xứ quản lý"
                    allowClear
                    className="custom-form-input"
                  >
                    {churches.map((church) => (
                      <Option key={church.id} value={church.id}>
                        {church.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="address"
                  label={
                    <Text strong className="form-field-label">
                      Địa chỉ thường trú
                    </Text>
                  }
                >
                  <Input.TextArea
                    rows={2}
                    placeholder="Số nhà, đường, xóm..."
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>

              {/* CỘT PHẢI: ĐỜI SỐNG ĐỨC TIN & MỤC VỤ */}
              <Col xs={24} lg={12}>
                <div className="form-section-title">
                  <BookOutlined style={{ color: accentGold }} />
                  <span>Đời sống đức tin (Khí tiết bí tích)</span>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="baptism_date"
                      label={
                        <Text strong className="form-field-label">
                          Ngày Bí tích Rửa Tội
                        </Text>
                      }
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="first_communion_date"
                      label={
                        <Text strong className="form-field-label">
                          Ngày Rước Lễ Lần Đầu
                        </Text>
                      }
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="confirmation_date"
                      label={
                        <Text strong className="form-field-label">
                          Ngày Bí tích Thêm Sức
                        </Text>
                      }
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <div className="form-section-title" style={{ marginTop: 20 }}>
                  <HeartOutlined style={{ color: accentGold }} />
                  <span>Tình trạng hôn nhân & Mục vụ</span>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="marital_status"
                      label={
                        <Text strong className="form-field-label">
                          Tình trạng Hôn nhân
                        </Text>
                      }
                    >
                      <Select className="custom-form-input">
                        <Option value="single">Độc thân</Option>
                        <Option value="married">Đã kết hôn (Hôn phối)</Option>
                        <Option value="religious">
                          Đời sống tu sĩ dâng hiến
                        </Option>
                        <Option value="widowed">Góa phụ / Góa chồng</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label={
                        <Text strong className="form-field-label">
                          Trạng thái sinh hoạt
                        </Text>
                      }
                    >
                      <Select className="custom-form-input">
                        <Option value="active">Đang sinh hoạt tại xứ</Option>
                        <Option value="inactive">Tạm ngưng sinh hoạt</Option>
                        <Option value="moved">Đã di chuyển xứ khác</Option>
                        <Option value="deceased">Đã qua đời</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="notes"
                  label={
                    <Text strong className="form-field-label">
                      Ghi chú mục vụ chi tiết
                    </Text>
                  }
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Nhập ghi chú đặc biệt về giáo dân (nếu có)..."
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .parishioner-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .parishioner-editorial-container {
              max-width: 1200px;
              margin: 0 auto;
            }

            /* Header Section */
            .parishioner-header-section {
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

            .parishioner-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .parishioner-sub-title {
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

            .add-parishioner-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 42px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

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

            /* Main Table Card */
            .main-table-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.25) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
              padding: 8px;
            }

            .section-card-header {
              display: flex;
              align-items: center;
              gap: 8px;
              color: ${primaryNavy};
              font-family: 'Playfair Display', serif;
              font-size: 16px;
              font-weight: 700;
            }

            .custom-admin-table .ant-table-thead > tr > th {
              background: ${softBg} !important;
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
              border-bottom: 1px solid rgba(27, 54, 93, 0.1) !important;
            }

            .gold-category-tag {
              background: rgba(212, 175, 55, 0.12) !important;
              border: 1px solid ${accentGold} !important;
              color: ${primaryNavy} !important;
              border-radius: 6px;
              font-weight: 600;
              font-size: 11px;
            }

            .action-btn-view:hover, .action-btn-edit:hover {
              background: rgba(27, 54, 93, 0.1) !important;
            }

            .action-btn-delete:hover {
              background: #fff5f5 !important;
            }

            /* Expandable Sub Table */
            .sub-table-container {
              padding: 12px 16px;
              background: ${softBg};
              border-radius: 12px;
              border: 1px solid rgba(212, 175, 55, 0.3);
              margin: 8px 0;
            }

            .sub-table-header {
              margin-bottom: 8px;
              font-weight: 700;
              color: ${primaryNavy};
              font-size: 12px;
              letter-spacing: 0.5px;
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

            .role-selector-box {
              background: ${softBg};
              padding: 14px 20px;
              border-radius: 12px;
              margin-bottom: 20px;
              border: 1px solid rgba(27, 54, 93, 0.1);
            }

            .form-section-title {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 14px;
              color: ${primaryNavy};
              font-weight: 700;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
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
