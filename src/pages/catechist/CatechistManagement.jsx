import React, { useEffect, useMemo, useState, useCallback } from "react";

import {
  Table,
  Card,
  Typography,
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
  Form,
  DatePicker,
  Popconfirm,
  Tabs,
  Divider,
  Empty,
  Badge,
  ConfigProvider,
  Image,
  Modal,
} from "antd";

import {
  UserOutlined,
  PlusOutlined,
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
  PhoneOutlined,
  BookOutlined,
  CrownOutlined,
  MailOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
} from "@ant-design/icons";

// Common components
import AppButton from "../../components/common/AppButton";
import AppFormModal from "../../components/common/AppFormModal";
import AppDetailModal from "../../components/common/AppDetailModal";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";
import AppSearchInput from "../../components/common/SearchInput";

// API
import catechistApi from "../../api/catechistApi";
import classApi from "../../api/classApi";
import { resetAdminPassword, toggleAdmin } from "../../api/adminApi";
import dayjs from "dayjs";

import avataImg from "../../assets/images/imgGLV.png";

const { Text } = Typography;

/* =========================================================
   OPTIONS
========================================================= */

const LEVEL_OPTIONS = [
  {
    value: "Dự bị",
    label: "Dự bị",
  },
  {
    value: "Cấp 1",
    label: "Cấp 1",
  },
  {
    value: "Cấp 2",
    label: "Cấp 2",
  },
  {
    value: "Cấp 3",
    label: "Cấp 3",
  },
  {
    value: "Huấn luyện viên",
    label: "Huấn luyện viên",
  },
];

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Đang hoạt động",
  },
  {
    value: "paused",
    label: "Tạm nghỉ",
  },
  {
    value: "inactive",
    label: "Ngừng hoạt động",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function CatechistManagement() {
  /* =======================================================
     STATE
  ======================================================= */

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
  const [resetForm] = Form.useForm();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  /* =======================================================
     FORMAT DATA
  ======================================================= */

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

    avatar: item.avatar ?? avataImg,
  });
  const getAvatarUrl = (avatar) => {
    if (!avatar) return avataImg;

    if (avatar.startsWith("http") || avatar === avataImg) {
      return avatar;
    }

    return `${process.env.REACT_APP_API_URL}${avatar}`;
  };

  const formatDateStr = (dateStr) => {
    return dateStr ? dayjs(dateStr).format("DD/MM/YYYY") : "—";
  };

  /* =======================================================
     FETCH DATA
  ======================================================= */

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        catechistApi.getAll(),

        classApi?.getAll
          ? classApi.getAll()
          : Promise.resolve({
              data: [],
            }),
      ]);

      /* ---------------- CATECHIST ---------------- */

      if (results[0].status === "fulfilled") {
        const response = results[0].value;

        const catechistData = response?.data?.data || response?.data || [];

        const list = Array.isArray(catechistData) ? catechistData : [];

        setCatechists(list.map(formatCatechist));
      } else {
        message.error("Không thể tải danh sách Giáo lý viên!");
      }

      /* ---------------- CLASS ---------------- */

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
      message.error("Có lỗi xảy ra khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =======================================================
     FILTER
  ======================================================= */

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

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    return {
      total: catechists.length,

      active: catechists.filter((item) => item.status === "active").length,

      paused: catechists.filter((item) => item.status === "paused").length,

      trainer: catechists.filter((item) => item.level === "Huấn luyện viên")
        .length,
    };
  }, [catechists]);

  /* =======================================================
     FORM MODAL
  ======================================================= */

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

      delete payload.password_confirm;

      if (editingCatechist && !payload.password) {
        delete payload.password;
      }

      if (!editingCatechist && !payload.password) {
        payload.password = "123456";
      }

      if (editingCatechist) {
        await catechistApi.update(editingCatechist.id, payload);

        message.success("Cập nhật Giáo lý viên thành công!");
      } else {
        await catechistApi.create(payload);

        message.success("Thêm Giáo lý viên mới thành công!");
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

  /* =======================================================
     DETAIL
  ======================================================= */

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

  /* =======================================================
     DELETE
  ======================================================= */

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

  /* =======================================================
     ASSIGN CLASS
  ======================================================= */

  const handleOpenAssignModal = (record) => {
    setAssignCatechist(record);

    assignForm.resetFields();

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

  // ======================================================
  // RESET PASSWORD
  // ======================================================

  const openResetPassword = (record) => {
    setResetUser(record);

    setResetModalOpen(true);

    resetForm.resetFields();
  };

  const closeResetPassword = () => {
    setResetModalOpen(false);

    setResetUser(null);

    resetForm.resetFields();
  };

  const handleResetPassword = async () => {
    try {
      const values = await resetForm.validateFields();

      setLoading(true);

      await resetAdminPassword(resetUser.id, values.newPassword);

      message.success(`Đã cấp lại mật khẩu mới cho ${resetUser.full_name}`);

      closeResetPassword();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }

      message.error(error?.response?.data?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = (record) => {
    const isActive = Boolean(record.status);

    Modal.confirm({
      title: isActive === true ? "Khóa tài khoản?" : "Mở khóa tài khoản?",

      content:
        isActive === true
          ? `Tài khoản "${
              record.name || record.full_name || "này"
            }" sẽ không thể đăng nhập sau khi bị khóa.`
          : `Bạn có chắc muốn mở khóa tài khoản "${
              record.name || record.full_name || "này"
            }"?`,

      okText: isActive === true ? "Khóa tài khoản" : "Mở khóa",
      cancelText: "Hủy",

      okButtonProps: {
        danger: isActive,
      },

      centered: true,

      onOk: async () => {
        try {
          await toggleAdmin(record.id);

          message.success(
            isActive === "active"
              ? "Đã khóa tài khoản"
              : "Đã mở khóa tài khoản",
          );

          fetchData();
        } catch (error) {
          message.error(
            error?.response?.data?.message ||
              "Không thể thay đổi trạng thái tài khoản",
          );
        }
      },
    });
  };
  /* =======================================================
     STATUS
  ======================================================= */

  const getStatusConfig = (status) => {
    const config = {
      active: {
        label: "Đang hoạt động",
        color: "#2E7D5B",
        bg: "#EAF6F0",
        border: "#B9DEC9",
      },

      paused: {
        label: "Tạm nghỉ",
        color: "#8A651B",
        bg: "#FBF5E7",
        border: "#D9A441",
      },

      inactive: {
        label: "Ngừng hoạt động",
        color: "#64748B",
        bg: "#F1F5F9",
        border: "#CBD5E1",
      },
    };

    return config[status] || config.active;
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [
    {
      title: "Giáo lý viên",
      key: "catechist",

      render: (_, record) => (
        <Space size={12}>
          <div className="chibi-avatar-wrapper--a">
            <Image
              size={48}
              src={getAvatarUrl(record.avatar)}
              className="chibi-avatar"
            />
          </div>

          <div>
            <Text
              strong
              className="chibi-name-text"
              onClick={() => handleOpenDetail(record)}
            >
              {record.holy_name ? `${record.holy_name} ` : ""}

              {record.full_name}
            </Text>

            <div>
              <Tag className="chibi-code-tag">
                <IdcardOutlined
                  style={{
                    marginRight: 4,
                  }}
                />

                {record.catechist_code}
              </Tag>
            </div>
          </div>
        </Space>
      ),
    },

    {
      title: "Thông tin liên hệ",

      render: (_, record) => (
        <div className="contact-cell">
          <Text className="phone-text">
            <PhoneOutlined />
            {record.phone || "—"}
          </Text>

          <Text className="email-text">
            <MailOutlined />
            {record.email || "—"}
          </Text>
        </div>
      ),
    },

    {
      title: "Cấp bậc",
      dataIndex: "level",

      render: (level) => (
        <Tag className="chibi-level-tag">
          <CrownOutlined />
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
            className="status-tag"
            style={{
              color: config.color,
              background: config.bg,
              borderColor: config.border,
            }}
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
        <Space size={6}>
          <Tooltip title="Xem chi tiết">
            <AppButton
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <AppButton
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>

          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  label: "Phân công lớp giảng dạy",
                  icon: <SwapOutlined />,
                  onClick: () => handleOpenAssignModal(record),
                },

                {
                  type: "divider",
                },

                {
                  key: "reset-password",
                  label: "Cấp lại mật khẩu",
                  icon: <KeyOutlined />,
                  onClick: () => openResetPassword(record),
                },

                {
                  key: "toggle-active",
                  label:
                    record.status === "active"
                      ? "Khóa tài khoản"
                      : "Mở khóa tài khoản",
                  icon:
                    record.status === "active" ? (
                      <LockOutlined />
                    ) : (
                      <UnlockOutlined />
                    ),
                  onClick: () => handleToggleAdmin(record),
                },

                {
                  type: "divider",
                },

                {
                  key: "delete",
                  danger: true,
                  label: (
                    <Popconfirm
                      title="Xóa Giáo lý viên?"
                      description="Dữ liệu này sẽ không thể khôi phục lại!"
                      onConfirm={() => handleDelete(record.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{
                        danger: true,
                      }}
                    >
                      Xóa thông tin
                    </Popconfirm>
                  ),
                  icon: <DeleteOutlined />,
                },
              ],
            }}
          >
            <AppButton
              className="chibi-action-btn chibi-btn-more"
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#173B5E",
          colorLink: "#173B5E",
          colorInfo: "#173B5E",
          borderRadius: 10,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },

        components: {
          Button: {
            primaryColor: "#FFFFFF",
            colorPrimary: "#173B5E",
            colorPrimaryHover: "#244F78",
            colorPrimaryActive: "#102E49",
            borderRadius: 9,
          },

          Input: {
            activeBorderColor: "#173B5E",
            hoverBorderColor: "#D9A441",
          },

          Select: {
            activeBorderColor: "#173B5E",
            hoverBorderColor: "#D9A441",
          },

          DatePicker: {
            activeBorderColor: "#173B5E",
            hoverBorderColor: "#D9A441",
          },

          Table: {
            headerBg: "#EEF3F7",
            headerColor: "#173B5E",
            rowHoverBg: "#F7F9FC",
            borderColor: "#E2E8F0",
          },

          Tabs: {
            itemColor: "#64748B",
            itemSelectedColor: "#173B5E",
            itemHoverColor: "#244F78",
            inkBarColor: "#D9A441",
          },

          Pagination: {
            itemActiveBg: "#173B5E",
            itemActiveColor: "#FFFFFF",
            itemActiveColorHover: "#FFFFFF",
          },

          Modal: {
            borderRadiusLG: 16,
          },

          Card: {
            borderRadiusLG: 14,
          },
        },
      }}
    >
      <div className="catechist-management-page">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="catechist-header-wrapper">
          <PageHeroHeader
            icon={<TeamOutlined />}
            badgeText="QUẢN LÝ GIÁO LÝ VIÊN"
            title="Quản lý Giáo lý viên"
            description="Quản lý hồ sơ, cấp bậc, trạng thái và phân công lớp giảng dạy"
            onRefresh={fetchData}
            refreshLoading={loading}
            primaryButtonText="Thêm Giáo lý viên"
            primaryButtonIcon={<PlusOutlined />}
            onPrimaryClick={handleOpenCreateModal}
            primaryDisabled={loading || saving}
          />
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <Row gutter={[18, 18]} className="catechist-statistics">
          <Col xs={24} sm={12} lg={6}>
            <div className="catechist-stat-wrapper">
              <StatCard
                title="Tổng số GLV"
                value={statistics.total}
                loading={loading}
                icon={<TeamOutlined />}
                iconColor="#173B5E"
                description="Toàn bộ Giáo lý viên"
              />
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div className="catechist-stat-wrapper">
              <StatCard
                title="Đang hoạt động"
                value={statistics.active}
                loading={loading}
                icon={<CheckCircleOutlined />}
                iconColor="#2E7D5B"
                description="GLV đang giảng dạy"
              />
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div className="catechist-stat-wrapper">
              <StatCard
                title="Tạm nghỉ"
                value={statistics.paused}
                loading={loading}
                icon={<PauseCircleOutlined />}
                iconColor="#D9A441"
                description="GLV đang tạm nghỉ"
              />
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div className="catechist-stat-wrapper">
              <StatCard
                title="Huấn luyện viên"
                value={statistics.trainer}
                loading={loading}
                icon={<CrownOutlined />}
                iconColor="#244F78"
                description="Cấp Huấn luyện viên"
              />
            </div>
          </Col>
        </Row>

        {/* =================================================
            FILTER
        ================================================= */}

        <Card bordered={false} className="catechist-filter-card">
          <Row gutter={[14, 14]}>
            <Col xs={24} md={10}>
              <div className="filter-field">
                <Text className="filter-label">Tìm kiếm</Text>
                <AppSearchInput
                  value={searchText}
                  onChange={(value) => {
                    setSearchText(value);
                    setCurrentPage(1);
                  }}
                  placeholder="Tên, tên Thánh, mã GLV, SĐT..."
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={5}>
              <div className="filter-field">
                <Text className="filter-label">Cấp bậc</Text>

                <Select
                  size="large"
                  value={selectedLevel}
                  onChange={setSelectedLevel}
                  style={{
                    width: "100%",
                  }}
                  options={[
                    {
                      value: "all",
                      label: "Tất cả cấp bậc",
                    },
                    ...LEVEL_OPTIONS,
                  ]}
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={5}>
              <div className="filter-field">
                <Text className="filter-label">Trạng thái</Text>

                <Select
                  size="large"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  style={{
                    width: "100%",
                  }}
                  options={[
                    {
                      value: "all",
                      label: "Tất cả trạng thái",
                    },
                    ...STATUS_OPTIONS,
                  ]}
                />
              </div>
            </Col>

            <Col xs={24} md={4}>
              <div className="filter-field">
                <Text className="filter-label">Thao tác</Text>

                <AppButton
                  block
                  size="large"
                  icon={<FilterOutlined />}
                  onClick={() => {
                    setSearchText("");
                    setSelectedLevel("all");
                    setSelectedStatus("all");
                  }}
                  className="catechist-reset-button"
                >
                  Đặt lại
                </AppButton>
              </div>
            </Col>
          </Row>
        </Card>

        {/* =================================================
            TABLE
        ================================================= */}

        <Card bordered={false} className="catechist-table-card">
          <div className="catechist-table-top">
            <div className="table-heading">
              <div className="table-heading-icon">
                <TeamOutlined />
              </div>

              <div>
                <Text className="table-heading-title">
                  Danh sách Giáo lý viên
                </Text>

                <Text className="table-heading-description">
                  Quản lý thông tin và phân công giảng dạy
                </Text>
              </div>
            </div>

            <div className="table-total">
              {filteredData.length}
              <span> GLV</span>
            </div>
          </div>

          <Divider
            style={{
              margin: 0,
            }}
          />

          <div className="catechist-table-wrapper">
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
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có thông tin Giáo lý viên"
                  />
                ),
              }}
              scroll={{
                x: 1000,
              }}
            />
          </div>

          <Divider
            style={{
              margin: 0,
            }}
          />

          <div className="catechist-pagination">
            <Text className="pagination-text">
              Hiển thị{" "}
              <strong>
                {filteredData.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}
              </strong>{" "}
              -{" "}
              <strong>
                {Math.min(currentPage * pageSize, filteredData.length)}
              </strong>{" "}
              / <strong>{filteredData.length}</strong> Giáo lý viên
            </Text>

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
          </div>
        </Card>

        {/* =================================================
            CREATE / EDIT MODAL
        ================================================= */}

        <AppFormModal
          title={
            <div className="catechist-modal-title">
              <div className="modal-title-icon">
                <UserOutlined />
              </div>

              <div>
                <div className="modal-title-main">
                  {editingCatechist
                    ? "Cập nhật Giáo lý viên"
                    : "Thêm Giáo lý viên"}
                </div>

                <div className="modal-title-sub">
                  {editingCatechist
                    ? "Cập nhật thông tin hồ sơ Giáo lý viên"
                    : "Nhập thông tin Giáo lý viên mới"}
                </div>
              </div>
            </div>
          }
          open={isFormModalOpen}
          onCancel={() => {
            setIsFormModalOpen(false);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          confirmLoading={saving}
          okText={editingCatechist ? "Lưu thay đổi" : "Thêm Giáo lý viên"}
          cancelText="Hủy"
          width={850}
          className="catechist-modal"
        >
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Tabs
              defaultActiveKey="personal"
              items={[
                {
                  key: "personal",

                  label: (
                    <span>
                      <UserOutlined />
                      Thông tin cá nhân
                    </span>
                  ),

                  children: (
                    <div className="form-section">
                      <Row gutter={16}>
                        <Col xs={24} md={6}>
                          <Form.Item name="holy_name" label="Tên Thánh">
                            <Input
                              size="large"
                              placeholder="VD: Giuse, Đaminh..."
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            name="full_name"
                            label="Họ và tên"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập họ và tên!",
                              },
                            ]}
                          >
                            <Input
                              size="large"
                              placeholder="Nhập họ và tên đầy đủ"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={6}>
                          <Form.Item name="gender" label="Giới tính">
                            <Select
                              size="large"
                              options={[
                                {
                                  value: "Nam",
                                  label: "Nam",
                                },
                                {
                                  value: "Nữ",
                                  label: "Nữ",
                                },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={8}>
                          <Form.Item name="date_of_birth" label="Ngày sinh">
                            <DatePicker
                              size="large"
                              style={{
                                width: "100%",
                              }}
                              format="DD/MM/YYYY"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item name="phone" label="Số điện thoại">
                            <Input
                              size="large"
                              prefix={<PhoneOutlined />}
                              placeholder="09xxxxxxxx"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            name="email"
                            label="Email đăng nhập"
                            rules={[
                              {
                                type: "email",
                                message: "Email không hợp lệ!",
                              },
                            ]}
                          >
                            <Input
                              size="large"
                              prefix={<MailOutlined />}
                              placeholder="example@email.com"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <div className="form-highlight-box">
                        <div className="form-highlight-title">
                          <IdcardOutlined />
                          Tài khoản đăng nhập
                        </div>

                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="password"
                              label={
                                editingCatechist ? "Mật khẩu mới" : "Mật khẩu"
                              }
                              extra={
                                editingCatechist
                                  ? "Để trống nếu không muốn thay đổi."
                                  : "Để trống sẽ sử dụng mật khẩu mặc định 123456."
                              }
                            >
                              <Input.Password
                                size="large"
                                placeholder={
                                  editingCatechist
                                    ? "Nhập mật khẩu mới"
                                    : "Nhập mật khẩu"
                                }
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              name="password_confirm"
                              label="Xác nhận mật khẩu"
                              dependencies={["password"]}
                              rules={[
                                ({ getFieldValue }) => ({
                                  validator(_, value) {
                                    if (
                                      !value ||
                                      value === getFieldValue("password")
                                    ) {
                                      return Promise.resolve();
                                    }

                                    return Promise.reject(
                                      new Error(
                                        "Mật khẩu xác nhận không khớp!",
                                      ),
                                    );
                                  },
                                }),
                              ]}
                            >
                              <Input.Password
                                size="large"
                                placeholder="Nhập lại mật khẩu"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <Form.Item name="address" label="Địa chỉ hiện tại">
                        <Input
                          size="large"
                          placeholder="Nhập địa chỉ cư trú..."
                        />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item name="level" label="Cấp bậc Giáo lý viên">
                            <Select size="large" options={LEVEL_OPTIONS} />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item name="status" label="Trạng thái">
                            <Select size="large" options={STATUS_OPTIONS} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ),
                },

                {
                  key: "church",

                  label: (
                    <span>
                      <BookOutlined />
                      Giáo xứ & Bí tích
                    </span>
                  ),

                  children: (
                    <div className="form-section">
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item name="parish" label="Giáo xứ">
                            <Input size="large" placeholder="Tên giáo xứ" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item name="diocese" label="Giáo phận">
                            <Input size="large" placeholder="Tên giáo phận" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <div className="form-subsection">
                        <div className="form-subsection-title">
                          Bí tích Rửa tội
                        </div>

                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item name="baptism_date" label="Ngày Rửa tội">
                              <DatePicker
                                size="large"
                                format="DD/MM/YYYY"
                                style={{
                                  width: "100%",
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item name="baptism_place" label="Nơi Rửa tội">
                              <Input
                                size="large"
                                placeholder="Giáo xứ Rửa tội"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="first_communion_date"
                            label="Ngày Rước lễ lần đầu"
                          >
                            <DatePicker
                              size="large"
                              format="DD/MM/YYYY"
                              style={{
                                width: "100%",
                              }}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            name="confirmation_date"
                            label="Ngày Thêm sức"
                          >
                            <DatePicker
                              size="large"
                              format="DD/MM/YYYY"
                              style={{
                                width: "100%",
                              }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        name="oath_date"
                        label="Ngày Tuyên hứa Giáo lý viên"
                      >
                        <DatePicker
                          size="large"
                          format="DD/MM/YYYY"
                          style={{
                            width: "100%",
                          }}
                        />
                      </Form.Item>
                    </div>
                  ),
                },

                {
                  key: "family",

                  label: (
                    <span>
                      <TeamOutlined />
                      Gia đình & Ghi chú
                    </span>
                  ),

                  children: (
                    <div className="form-section">
                      <div className="form-subsection">
                        <div className="form-subsection-title">
                          Thông tin Cha
                        </div>

                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item name="father_name" label="Họ tên Cha">
                              <Input
                                size="large"
                                placeholder="Nhập họ tên Cha"
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              name="father_phone"
                              label="Số điện thoại Cha"
                            >
                              <Input
                                size="large"
                                placeholder="Số điện thoại Cha"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <div className="form-subsection">
                        <div className="form-subsection-title">
                          Thông tin Mẹ
                        </div>

                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item name="mother_name" label="Họ tên Mẹ">
                              <Input
                                size="large"
                                placeholder="Nhập họ tên Mẹ"
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              name="mother_phone"
                              label="Số điện thoại Mẹ"
                            >
                              <Input
                                size="large"
                                placeholder="Số điện thoại Mẹ"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <Form.Item name="notes" label="Ghi chú">
                        <Input.TextArea
                          rows={4}
                          placeholder="Nhập ghi chú về Giáo lý viên..."
                        />
                      </Form.Item>
                    </div>
                  ),
                },
              ]}
            />
          </Form>
        </AppFormModal>

        {/* =================================================
            DETAIL MODAL
        ================================================= */}

        <AppDetailModal
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          width={950}
          className="catechist-detail-modal"
        >
          {detailCatechist && (
            <div className="catechist-detail">
              {/* PROFILE */}

              <div className="detail-profile">
                <div className="detail-avatar-wrapper">
                  <Avatar
                    size={82}
                    src={getAvatarUrl(detailCatechist.avatar)}
                    icon={<UserOutlined />}
                    className="detail-avatar"
                  />
                </div>

                <div className="detail-profile-info">
                  <div className="detail-name">
                    {detailCatechist.holy_name
                      ? `${detailCatechist.holy_name} `
                      : ""}

                    {detailCatechist.full_name}
                  </div>

                  <div className="detail-code">
                    <IdcardOutlined />
                    <span>{detailCatechist.catechist_code}</span>
                  </div>

                  <div className="detail-tags">
                    <Tag className="detail-level-tag">
                      <CrownOutlined />
                      {detailCatechist.level}
                    </Tag>

                    <Tag
                      className="detail-status-tag"
                      style={{
                        color: getStatusConfig(detailCatechist.status).color,

                        background: getStatusConfig(detailCatechist.status).bg,

                        borderColor: getStatusConfig(detailCatechist.status)
                          .border,
                      }}
                    >
                      {getStatusConfig(detailCatechist.status).label}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* DETAIL TABS */}

              <Tabs
                defaultActiveKey="info"
                className="catechist-detail-tabs"
                items={[
                  /* =========================================
                     PERSONAL INFO
                  ========================================= */

                  {
                    key: "info",

                    label: (
                      <span className="detail-tab-label">
                        <UserOutlined />
                        Thông tin cá nhân
                      </span>
                    ),

                    children: (
                      <div className="detail-info-content">
                        {/* PERSONAL */}

                        <div className="detail-section">
                          <div className="detail-section-title">
                            <div className="detail-section-icon">
                              <UserOutlined />
                            </div>

                            <div>
                              <div className="detail-section-heading">
                                Thông tin cá nhân
                              </div>

                              <div className="detail-section-subtitle">
                                Thông tin cơ bản của Giáo lý viên
                              </div>
                            </div>
                          </div>

                          <div className="detail-info-grid">
                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Họ và tên
                              </span>

                              <span className="detail-info-value detail-name-value">
                                {detailCatechist.full_name}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Tên Thánh
                              </span>

                              <span className="detail-info-value">
                                {detailCatechist.holy_name || "—"}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Mã Giáo lý viên
                              </span>

                              <span className="detail-info-value">
                                {detailCatechist.catechist_code || "—"}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Giới tính
                              </span>

                              <span className="detail-info-value">
                                {detailCatechist.gender || "—"}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Ngày sinh
                              </span>

                              <span className="detail-info-value">
                                {formatDateStr(detailCatechist.date_of_birth)}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Số điện thoại
                              </span>

                              <span className="detail-info-value detail-contact-value">
                                <PhoneOutlined />
                                {detailCatechist.phone || "—"}
                              </span>
                            </div>

                            <div className="detail-info-item detail-info-item-full">
                              <span className="detail-info-label">Email</span>

                              <span className="detail-info-value detail-contact-value">
                                <MailOutlined />
                                {detailCatechist.email || "—"}
                              </span>
                            </div>

                            <div className="detail-info-item detail-info-item-full">
                              <span className="detail-info-label">Địa chỉ</span>

                              <span className="detail-info-value">
                                {detailCatechist.address || "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* PARISH */}

                        <div className="detail-section">
                          <div className="detail-section-title">
                            <div className="detail-section-icon">
                              <BookOutlined />
                            </div>

                            <div>
                              <div className="detail-section-heading">
                                Giáo xứ & Giáo phận
                              </div>

                              <div className="detail-section-subtitle">
                                Thông tin sinh hoạt Giáo hội
                              </div>
                            </div>
                          </div>

                          <div className="detail-info-grid">
                            <div className="detail-info-item">
                              <span className="detail-info-label">Giáo xứ</span>

                              <span className="detail-info-value">
                                {detailCatechist.parish || "—"}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Giáo phận
                              </span>

                              <span className="detail-info-value">
                                {detailCatechist.diocese || "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* SACRAMENTS */}

                        <div className="detail-section">
                          <div className="detail-section-title">
                            <div className="detail-section-icon">
                              <CheckCircleOutlined />
                            </div>

                            <div>
                              <div className="detail-section-heading">
                                Thông tin Bí tích
                              </div>

                              <div className="detail-section-subtitle">
                                Các mốc Bí tích của Giáo lý viên
                              </div>
                            </div>
                          </div>

                          <div className="detail-info-grid">
                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Ngày Rửa tội
                              </span>

                              <span className="detail-info-value">
                                {formatDateStr(detailCatechist.baptism_date)}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Nơi Rửa tội
                              </span>

                              <span className="detail-info-value">
                                {detailCatechist.baptism_place || "—"}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Ngày Rước lễ lần đầu
                              </span>

                              <span className="detail-info-value">
                                {formatDateStr(
                                  detailCatechist.first_communion_date,
                                )}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Ngày Thêm sức
                              </span>

                              <span className="detail-info-value">
                                {formatDateStr(
                                  detailCatechist.confirmation_date,
                                )}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Ngày Tuyên hứa
                              </span>

                              <span className="detail-info-value">
                                {formatDateStr(detailCatechist.oath_date)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* FAMILY */}

                        <div className="detail-section">
                          <div className="detail-section-title">
                            <div className="detail-section-icon">
                              <TeamOutlined />
                            </div>

                            <div>
                              <div className="detail-section-heading">
                                Thông tin gia đình
                              </div>

                              <div className="detail-section-subtitle">
                                Thông tin liên hệ Cha và Mẹ
                              </div>
                            </div>
                          </div>

                          <div className="detail-info-grid">
                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Họ tên Cha
                              </span>

                              <span className="detail-info-value">
                                {detailCatechist.father_name || "—"}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">SĐT Cha</span>

                              <span className="detail-info-value">
                                {detailCatechist.father_phone || "—"}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">
                                Họ tên Mẹ
                              </span>

                              <span className="detail-info-value">
                                {detailCatechist.mother_name || "—"}
                              </span>
                            </div>

                            <div className="detail-info-item">
                              <span className="detail-info-label">SĐT Mẹ</span>

                              <span className="detail-info-value">
                                {detailCatechist.mother_phone || "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* NOTES */}

                        {detailCatechist.notes && (
                          <div className="detail-section">
                            <div className="detail-section-title">
                              <div className="detail-section-icon">
                                <IdcardOutlined />
                              </div>

                              <div>
                                <div className="detail-section-heading">
                                  Ghi chú
                                </div>
                              </div>
                            </div>

                            <div className="detail-note">
                              {detailCatechist.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },

                  /* =========================================
                     CLASSES
                  ========================================= */

                  {
                    key: "classes",

                    label: (
                      <span className="detail-tab-label">
                        <BookOutlined />
                        Lớp phụ trách
                      </span>
                    ),

                    children: (
                      <div className="detail-classes-content">
                        <div className="detail-section-title detail-class-heading">
                          <div className="detail-section-icon">
                            <BookOutlined />
                          </div>

                          <div>
                            <div className="detail-section-heading">
                              Danh sách lớp phụ trách
                            </div>

                            <div className="detail-section-subtitle">
                              Các lớp Giáo lý viên đang hoặc đã được phân công
                            </div>
                          </div>
                        </div>

                        {detailCatechist.classes &&
                        detailCatechist.classes.length > 0 ? (
                          <div className="detail-class-table-wrapper">
                            <Table
                              columns={[
                                {
                                  title: "Tên lớp",
                                  key: "class_name",
                                  width: 260,

                                  render: (_, record) => (
                                    <div className="detail-class-name">
                                      <div className="class-icon">
                                        <BookOutlined />
                                      </div>

                                      <div className="detail-class-name-content">
                                        <Text strong>
                                          {record.class_name ||
                                            `Lớp #${record.class_id}`}
                                        </Text>

                                        {record.class_id && (
                                          <span className="detail-class-id">
                                            Mã lớp: #{record.class_id}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ),
                                },

                                {
                                  title: "Vai trò",
                                  dataIndex: "role",
                                  key: "role",
                                  width: 180,

                                  render: (role) => (
                                    <Tag className="role-tag">
                                      {role || "Giáo lý viên"}
                                    </Tag>
                                  ),
                                },

                                {
                                  title: "Ngày phân công",
                                  dataIndex: "assigned_date",
                                  key: "assigned_date",
                                  width: 150,

                                  render: (date) => (
                                    <span className="detail-table-date">
                                      {formatDateStr(date)}
                                    </span>
                                  ),
                                },

                                {
                                  title: "Trạng thái",
                                  dataIndex: "status",
                                  key: "status",
                                  width: 150,

                                  render: (status) => (
                                    <Badge
                                      status={
                                        status === "teaching"
                                          ? "processing"
                                          : "default"
                                      }
                                      text={
                                        <span
                                          className={
                                            status === "teaching"
                                              ? "teaching-status"
                                              : "finished-status"
                                          }
                                        >
                                          {status === "teaching"
                                            ? "Đang dạy"
                                            : "Đã hoàn thành"}
                                        </span>
                                      }
                                    />
                                  ),
                                },
                              ]}
                              dataSource={detailCatechist.classes}
                              rowKey={(record) => record.class_id || record.id}
                              pagination={false}
                              size="middle"
                              scroll={{
                                x: 740,
                              }}
                            />
                          </div>
                        ) : (
                          <div className="detail-empty-class">
                            <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description="Giáo lý viên chưa được phân công lớp"
                            />
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </AppDetailModal>

        {/* =================================================
            ASSIGN CLASS
        ================================================= */}

        <AppFormModal
          title={
            <div className="catechist-modal-title">
              <div className="modal-title-icon gold-icon">
                <SwapOutlined />
              </div>

              <div>
                <div className="modal-title-main">Phân công lớp giảng dạy</div>

                <div className="modal-title-sub">
                  Thiết lập lớp và vai trò giảng dạy
                </div>
              </div>
            </div>
          }
          open={isAssignModalOpen}
          onCancel={() => setIsAssignModalOpen(false)}
          onOk={() => assignForm.submit()}
          confirmLoading={saving}
          okText="Phân công"
          cancelText="Hủy"
          width={550}
          className="catechist-modal"
        >
          <Form
            form={assignForm}
            layout="vertical"
            onFinish={handleAssignClass}
          >
            <div className="assign-info-box">
              <Avatar
                size={48}
                src={assignCatechist?.avatar}
                icon={<UserOutlined />}
              />

              <div>
                <Text className="assign-label">Giáo lý viên</Text>

                <Text className="assign-name">
                  {assignCatechist?.holy_name
                    ? `${assignCatechist.holy_name} `
                    : ""}

                  {assignCatechist?.full_name}
                </Text>

                <Text className="assign-code">
                  {assignCatechist?.catechist_code}
                </Text>
              </div>
            </div>

            <Form.Item
              name="class_id"
              label="Lớp học"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn lớp học!",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Chọn lớp học"
                options={classes.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </Form.Item>

            <Form.Item name="role" label="Vai trò">
              <Select
                size="large"
                options={[
                  {
                    value: "Giáo lý viên",
                    label: "Giáo lý viên Phụ trách",
                  },
                  {
                    value: "Trợ tá",
                    label: "Trợ tá",
                  },
                  {
                    value: "Trưởng lớp",
                    label: "Trưởng lớp",
                  },
                  {
                    value: "Phó lớp",
                    label: "Phó lớp",
                  },
                ]}
              />
            </Form.Item>

            <Form.Item name="assigned_date" label="Ngày bắt đầu">
              <DatePicker
                size="large"
                format="DD/MM/YYYY"
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea
                rows={4}
                placeholder="Ghi chú về việc phân công..."
              />
            </Form.Item>
          </Form>
        </AppFormModal>

        <Modal
          open={resetModalOpen}
          onCancel={closeResetPassword}
          onOk={handleResetPassword}
          confirmLoading={loading}
          title="Đặt Lại Mật Khẩu Truy Cập"
          centered
        >
          <Form
            form={resetForm}
            layout="vertical"
            style={{
              paddingTop: 12,
            }}
          >
            <Form.Item
              label="Mật khẩu mới *"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: "Bắt buộc nhập mật khẩu",
                },
                {
                  min: 6,
                  message: "Tối thiểu 6 ký tự",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu *"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Bắt buộc xác nhận",
                },

                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error("Mật khẩu chưa khớp"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>

        {/* =================================================
            CSS
        ================================================= */}

        <style>{`

/* =========================================================
   ROOT
========================================================= */

.catechist-management-page {
  min-height: 100vh;
  background: #F7F9FC;
  color: #173B5E;
  padding-bottom: 40px;
}

.catechist-header-wrapper {
  margin-bottom: 22px;
}

/* =========================================================
   STATISTICS
========================================================= */

.catechist-statistics {
  margin-bottom: 22px;
}

.catechist-stat-wrapper {
  height: 100%;
}

.catechist-stat-wrapper > * {
  height: 100%;
}

/* =========================================================
   FILTER
========================================================= */

.catechist-filter-card {
  border-radius: 14px !important;
  margin-bottom: 20px;

  border: 1px solid #E2E8F0 !important;

  box-shadow:
    0 6px 20px rgba(23, 59, 94, 0.05) !important;
}

.catechist-filter-card .ant-card-body {
  padding: 22px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-title-icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: #EEF3F7;
  color: #173B5E;

  font-size: 17px;
}

.filter-title-main {
  display: block;

  color: #173B5E;
  font-weight: 800;
  font-size: 15px;
}

.filter-title-sub {
  display: block;

  color: #64748B;
  font-size: 12px;

  margin-top: 2px;
}

.filter-field {
  width: 100%;
}

.filter-label {
  display: block;

  margin-bottom: 7px;

  color: #526273;
  font-size: 12px;
  font-weight: 700;
}

.catechist-input,
.catechist-select {
  width: 100%;
}

.catechist-filter-card .ant-input-affix-wrapper {
  border-radius: 9px !important;
  min-height: 42px;
  border-color: #DDE5EC;
}

.catechist-filter-card .ant-select-selector {
  min-height: 42px !important;

  border-radius: 9px !important;
  border-color: #DDE5EC !important;

  display: flex;
  align-items: center;
}

.catechist-reset-button {
  height: 42px !important;

  border-radius: 9px !important;

  color: #173B5E !important;
  border-color: #D9A441 !important;
  background: #FFFFFF !important;

  font-weight: 700 !important;
}

.catechist-reset-button:hover {
  color: #173B5E !important;
  border-color: #D9A441 !important;
  background: #FBF5E7 !important;
}

/* =========================================================
   TABLE
========================================================= */

.catechist-table-card {
  border-radius: 14px !important;

  overflow: hidden;

  border: 1px solid #E2E8F0 !important;

  box-shadow:
    0 8px 26px rgba(23, 59, 94, 0.06) !important;
}

.catechist-table-card .ant-card-body {
  padding: 0 !important;
}

.catechist-table-top {
  min-height: 78px;

  padding: 16px 22px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  background: #FFFFFF;
}

.table-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-heading-icon {
  width: 42px;
  height: 42px;

  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #173B5E;
  color: #FFFFFF;

  font-size: 18px;
}

.table-heading-title {
  display: block;

  color: #173B5E;
  font-size: 16px;
  font-weight: 800;
}

.table-heading-description {
  display: block;

  color: #64748B;
  font-size: 12px;

  margin-top: 3px;
}

.table-total {
  border: 1px solid #D9A441;

  background: #FBF5E7;
  color: #173B5E;

  padding: 7px 14px;

  border-radius: 20px;

  font-size: 13px;
  font-weight: 800;

  white-space: nowrap;
}

.table-total span {
  font-weight: 600;
  color: #64748B;
}

.catechist-table-wrapper {
  background: #FFFFFF;
}

.catechist-table-wrapper .ant-table {
  border-radius: 0 !important;
}

.catechist-table-wrapper .ant-table-thead > tr > th {
  background: #EEF3F7 !important;

  color: #173B5E !important;

  font-size: 12px;
  font-weight: 800;

  padding: 14px 16px !important;

  border-bottom: 1px solid #DCE5ED !important;
}

.catechist-table-wrapper .ant-table-tbody > tr > td {
  padding: 14px 16px !important;

  color: #334155;

  border-bottom: 1px solid #EEF2F5 !important;
}

.catechist-table-wrapper .ant-table-tbody > tr:hover > td {
  background: #F7F9FC !important;
}

/* =========================================================
   CONTACT
========================================================= */

.contact-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.phone-text,
.email-text {
  display: flex;
  align-items: center;
  gap: 7px;
}

.phone-text {
  color: #475569 !important;
  font-size: 13px;
  font-weight: 600;
}

.phone-text .anticon {
  color: #173B5E;
}

.email-text {
  color: #94A3B8 !important;
  font-size: 12px;
}

.email-text .anticon {
  color: #D9A441;
}

/* =========================================================
   AVATAR
========================================================= */

.chibi-avatar-wrapper--a {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  background: #f5f5f5;
}

.chibi-avatar {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.chibi-name-text {
  color: #173B5E !important;

  font-size: 14px;
  font-weight: 800 !important;

  cursor: pointer;

  transition: all 0.2s ease;
}

.chibi-name-text:hover {
  color: #244F78 !important;
}

/* =========================================================
   TAGS
========================================================= */

.chibi-code-tag {
  margin-top: 5px;

  background: #F1F5F9 !important;
  color: #64748B !important;

  border: 1px solid #E2E8F0 !important;

  border-radius: 6px !important;

  font-size: 11px;
  font-weight: 700;
}

.chibi-level-tag {
  background: #FBF5E7 !important;
  color: #8A651B !important;

  border: 1px solid #D9A441 !important;

  border-radius: 20px !important;

  padding: 3px 10px !important;

  font-size: 12px;
  font-weight: 700;
}

.chibi-level-tag .anticon {
  margin-right: 4px;
}

/* =========================================================
   STATUS
========================================================= */

.status-tag {
  border-radius: 20px !important;

  padding: 4px 12px !important;

  font-size: 12px !important;
  font-weight: 700 !important;
}

/* =========================================================
   ACTION
========================================================= */

.chibi-action-btn {
  border: 1px solid #E2E8F0 !important;

  background: #FFFFFF !important;
  color: #173B5E !important;

  transition: all 0.2s ease !important;
}

.chibi-btn-view:hover {
  background: #EEF3F7 !important;

  border-color: #173B5E !important;

  color: #173B5E !important;
}

.chibi-btn-edit:hover {
  background: #FBF5E7 !important;

  border-color: #D9A441 !important;

  color: #8A651B !important;
}

.chibi-btn-more:hover {
  background: #EEF3F7 !important;

  border-color: #244F78 !important;

  color: #244F78 !important;
}

/* =========================================================
   PAGINATION
========================================================= */

.catechist-pagination {
  min-height: 68px;

  padding: 14px 22px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  background: #FFFFFF;
}

.pagination-text {
  color: #64748B !important;
  font-size: 12px;
}

.pagination-text strong {
  color: #173B5E;
}

.catechist-pagination .ant-pagination-item-active {
  background: #173B5E !important;
  border-color: #173B5E !important;
}

.catechist-pagination .ant-pagination-item-active a {
  color: #FFFFFF !important;
}

.catechist-pagination .ant-pagination-item:hover {
  border-color: #D9A441 !important;
}

.catechist-pagination .ant-pagination-item:hover a {
  color: #173B5E !important;
}

/* =========================================================
   MODAL
========================================================= */

.catechist-modal .ant-modal-content,
.catechist-detail-modal .ant-modal-content {
  border-radius: 16px !important;

  overflow: hidden;

  box-shadow:
    0 20px 60px rgba(23, 59, 94, 0.18) !important;
}

.catechist-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title-icon {
  width: 40px;
  height: 40px;

  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #EEF3F7;
  color: #173B5E;

  font-size: 18px;
}

.modal-title-icon.gold-icon {
  background: #FBF5E7;
  color: #8A651B;
}

.modal-title-main {
  color: #173B5E;

  font-size: 17px;
  font-weight: 800;
}

.modal-title-sub {
  color: #64748B;

  font-size: 12px;
  font-weight: 500;

  margin-top: 2px;
}

/* =========================================================
   FORM
========================================================= */

.catechist-form-tabs .ant-tabs-nav {
  margin-bottom: 22px !important;
}

.catechist-form-tabs .ant-tabs-tab {
  font-weight: 700;
}

.catechist-form-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
  color: #173B5E !important;
}

.form-section {
  padding: 2px 2px 4px;
}

.form-highlight-box {
  padding: 16px;

  margin: 4px 0 18px;

  border: 1px solid #DDE5EC;

  border-radius: 12px;

  background: #F7F9FC;
}

.form-highlight-title {
  display: flex;
  align-items: center;
  gap: 7px;

  color: #173B5E;

  font-weight: 800;
  font-size: 13px;

  margin-bottom: 14px;
}

.form-subsection {
  padding: 16px;

  border: 1px solid #E2E8F0;

  border-radius: 12px;

  margin-bottom: 18px;

  background: #FFFFFF;
}

.form-subsection-title {
  padding-bottom: 10px;

  margin-bottom: 14px;

  color: #173B5E;

  font-size: 13px;
  font-weight: 800;

  border-bottom: 1px solid #E2E8F0;
}

.catechist-modal .ant-form-item-label > label {
  color: #526273 !important;

  font-size: 12px;
  font-weight: 700;
}

.catechist-modal .ant-input,
.catechist-modal .ant-input-affix-wrapper,
.catechist-modal .ant-select-selector,
.catechist-modal .ant-picker {
  border-radius: 9px !important;
  border-color: #DDE5EC !important;
}

.catechist-modal .ant-input:hover,
.catechist-modal .ant-input-affix-wrapper:hover,
.catechist-modal .ant-select-selector:hover,
.catechist-modal .ant-picker:hover {
  border-color: #D9A441 !important;
}

.catechist-modal .ant-input:focus,
.catechist-modal .ant-input-affix-wrapper-focused,
.catechist-modal .ant-select-focused .ant-select-selector,
.catechist-modal .ant-picker-focused {
  border-color: #173B5E !important;

  box-shadow:
    0 0 0 2px rgba(23, 59, 94, 0.08) !important;
}

/* =========================================================
   DETAIL
   FIX CHỮ DỌC
========================================================= */

.catechist-detail-modal .ant-modal-body {
  padding: 20px !important;
}

.catechist-detail {
  width: 100%;
  max-width: 100%;

  padding: 0;

  box-sizing: border-box;
}

/* =========================================================
   DETAIL PROFILE
========================================================= */

.detail-profile {
  width: 100%;
  box-sizing: border-box;

  display: flex;
  align-items: center;

  gap: 18px;

  padding: 18px 20px;
  margin-bottom: 20px;

  border-radius: 14px;

  border: 1px solid #E2E8F0;

  background: #F7F9FC;
}

.detail-avatar-wrapper {
  width: 88px;
  height: 88px;

  min-width: 88px;

  padding: 3px;

  box-sizing: border-box;

  border-radius: 50%;

  background: #D9A441;

  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-avatar {
  width: 82px !important;
  height: 82px !important;

  border: 3px solid #FFFFFF !important;

  background: #EEF3F7 !important;

  color: #173B5E !important;
}

.detail-profile-info {
  min-width: 0;

  flex: 1;
}

.detail-name {
  color: #173B5E;

  font-size: 21px;
  line-height: 1.35;

  font-weight: 800;

  word-break: normal;

  overflow-wrap: break-word;
}

.detail-code {
  display: flex;
  align-items: center;

  gap: 6px;

  margin-top: 6px;

  color: #64748B;

  font-size: 12px;

  font-weight: 600;
}

.detail-tags {
  display: flex;
  align-items: center;

  flex-wrap: wrap;

  gap: 8px;

  margin-top: 10px;
}

.detail-level-tag {
  margin: 0 !important;

  background: #FBF5E7 !important;

  color: #8A651B !important;

  border: 1px solid #D9A441 !important;

  border-radius: 20px !important;

  padding: 4px 11px !important;

  font-size: 12px;

  font-weight: 700;
}

.detail-level-tag .anticon {
  margin-right: 5px;
}

.detail-status-tag {
  margin: 0 !important;

  border-radius: 20px !important;

  padding: 4px 11px !important;

  font-size: 12px;

  font-weight: 700;
}

/* =========================================================
   DETAIL TABS
========================================================= */

.catechist-detail-tabs {
  width: 100%;
}

.catechist-detail-tabs .ant-tabs-nav {
  margin-bottom: 20px !important;
}

.catechist-detail-tabs .ant-tabs-tab {
  padding: 11px 16px !important;

  font-weight: 700;
}

.catechist-detail-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
  color: #173B5E !important;
}

.detail-tab-label {
  display: inline-flex;

  align-items: center;

  gap: 7px;

  white-space: nowrap;
}

/* =========================================================
   DETAIL SECTIONS
========================================================= */

.detail-info-content {
  width: 100%;
  box-sizing: border-box;
}

.detail-section {
  width: 100%;
  box-sizing: border-box;

  padding: 18px;

  margin-bottom: 16px;

  background: #FFFFFF;

  border: 1px solid #E2E8F0;

  border-radius: 12px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section-title {
  display: flex;

  align-items: center;

  gap: 11px;

  margin-bottom: 18px;
}

.detail-section-icon {
  width: 38px;
  height: 38px;

  min-width: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: #EEF3F7;

  color: #173B5E;

  font-size: 16px;
}

.detail-section-heading {
  color: #173B5E;

  font-size: 14px;

  line-height: 1.4;

  font-weight: 800;
}

.detail-section-subtitle {
  margin-top: 2px;

  color: #94A3B8;

  font-size: 11px;

  line-height: 1.4;
}

/* =========================================================
   DETAIL INFO GRID
========================================================= */

.detail-info-grid {
  width: 100%;

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  border-top: 1px solid #E2E8F0;

  border-left: 1px solid #E2E8F0;

  overflow: hidden;

  border-radius: 8px;
}

.detail-info-item {
  min-width: 0;

  display: grid;

  grid-template-columns:
    minmax(130px, 38%)
    minmax(0, 1fr);

  align-items: stretch;

  min-height: 54px;

  border-right: 1px solid #E2E8F0;

  border-bottom: 1px solid #E2E8F0;

  background: #FFFFFF;
}

.detail-info-item-full {
  grid-column: 1 / -1;
}

.detail-info-label {
  align-self: stretch;

  display: flex;

  align-items: center;

  padding: 10px 13px;

  background: #F7F9FC;

  color: #526273;

  font-size: 12px;

  line-height: 1.4;

  font-weight: 700;

  white-space: normal;
}

.detail-info-value {
  min-width: 0;

  display: flex;

  align-items: center;

  padding: 10px 14px;

  color: #334155;

  font-size: 13px;

  line-height: 1.5;

  font-weight: 500;

  white-space: normal;

  word-break: normal;

  overflow-wrap: anywhere;
}

.detail-name-value {
  color: #173B5E;

  font-weight: 700;
}

.detail-contact-value {
  display: flex;

  align-items: center;

  gap: 7px;

  color: #173B5E;
}

.detail-contact-value .anticon {
  flex-shrink: 0;

  color: #173B5E;
}

/* =========================================================
   DETAIL NOTE
========================================================= */

.detail-note {
  width: 100%;

  box-sizing: border-box;

  padding: 14px 16px;

  border-radius: 9px;

  background: #F7F9FC;

  border: 1px solid #E2E8F0;

  color: #475569;

  font-size: 13px;

  line-height: 1.7;

  white-space: pre-wrap;

  word-break: normal;

  overflow-wrap: anywhere;
}

/* =========================================================
   DETAIL CLASSES
========================================================= */

.detail-classes-content {
  width: 100%;

  box-sizing: border-box;
}

.detail-class-heading {
  margin-bottom: 18px;
}

.detail-class-table-wrapper {
  width: 100%;

  overflow: hidden;

  border: 1px solid #E2E8F0;

  border-radius: 10px;

  background: #FFFFFF;
}

.detail-class-table-wrapper .ant-table {
  width: 100%;
}

.detail-class-table-wrapper .ant-table-thead > tr > th {
  background: #EEF3F7 !important;

  color: #173B5E !important;

  font-size: 12px;

  font-weight: 800;

  white-space: nowrap;
}

.detail-class-table-wrapper .ant-table-tbody > tr > td {
  font-size: 13px;

  color: #334155;

  vertical-align: middle;
}

.detail-class-name {
  display: flex;

  align-items: center;

  gap: 10px;

  min-width: 0;
}

.detail-class-name-content {
  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 3px;
}

.detail-class-name-content .ant-typography {
  color: #173B5E !important;

  white-space: normal;

  word-break: normal;

  overflow-wrap: anywhere;
}

.detail-class-id {
  color: #94A3B8;

  font-size: 11px;
}

.class-icon {
  width: 34px;
  height: 34px;

  min-width: 34px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: #EEF3F7;

  color: #173B5E;
}

.role-tag {
  margin: 0 !important;

  background: #EEF3F7 !important;

  color: #173B5E !important;

  border: 1px solid #D7E1EA !important;

  border-radius: 7px !important;

  font-weight: 700;

  white-space: nowrap;
}

.detail-table-date {
  color: #475569;

  font-size: 12px;

  white-space: nowrap;
}

.teaching-status {
  color: #2E7D5B;

  font-weight: 700;
}

.finished-status {
  color: #64748B;

  font-weight: 600;
}

.detail-empty-class {
  min-height: 220px;

  display: flex;

  align-items: center;
  justify-content: center;

  border: 1px solid #E2E8F0;

  border-radius: 10px;

  background: #FFFFFF;
}

/* =========================================================
   ASSIGN
========================================================= */

.assign-info-box {
  display: flex;

  align-items: center;

  gap: 12px;

  padding: 14px;

  margin-bottom: 20px;

  border-radius: 12px;

  background: #F7F9FC;

  border: 1px solid #E2E8F0;
}

.assign-info-box > div:last-child {
  display: flex;

  flex-direction: column;
}

.assign-label {
  color: #94A3B8;

  font-size: 11px;
}

.assign-name {
  color: #173B5E;

  font-size: 14px;

  font-weight: 800;

  margin-top: 2px;
}

.assign-code {
  color: #64748B;

  font-size: 11px;

  margin-top: 2px;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {

  .catechist-detail-modal .ant-modal-body {
    padding: 16px !important;
  }

  .detail-info-grid {
    grid-template-columns: 1fr;
  }

  .detail-info-item-full {
    grid-column: auto;
  }

  .detail-profile {
    padding: 16px;
  }
}

@media (max-width: 768px) {

  .catechist-management-page {
    padding-bottom: 20px;
  }

  .catechist-filter-card .ant-card-body {
    padding: 16px;
  }

  .catechist-table-top {
    padding: 14px 16px;
  }

  .catechist-pagination {
    padding: 14px 16px;

    flex-direction: column;

    align-items: flex-start;
  }

  .catechist-pagination .ant-pagination {
    width: 100%;

    justify-content: center;
  }

  .detail-profile {
    align-items: flex-start;
  }

  .detail-name {
    font-size: 18px;
  }

  .detail-section {
    padding: 14px;
  }

  .detail-info-item {
    grid-template-columns:
      minmax(120px, 34%)
      minmax(0, 1fr);
  }
}

@media (max-width: 576px) {

  .table-heading-description {
    display: none;
  }

  .table-heading-title {
    font-size: 14px;
  }

  .table-heading-icon {
    width: 36px;
    height: 36px;
  }

  .table-total {
    padding: 5px 10px;

    font-size: 12px;
  }

  .detail-profile {
    flex-direction: column;

    align-items: center;

    text-align: center;
  }

  .detail-profile-info {
    width: 100%;
  }

  .detail-code {
    justify-content: center;
  }

  .detail-tags {
    justify-content: center;
  }

  .detail-section-title {
    align-items: flex-start;
  }

  .detail-section-heading {
    font-size: 13px;
  }

  .detail-info-grid {
    display: block;

    border-right: 1px solid #E2E8F0;

    border-radius: 8px;
  }

  .detail-info-item {
    display: grid;

    grid-template-columns:
      38%
      62%;

    min-height: 50px;
  }

  .detail-info-item-full {
    grid-column: auto;
  }

  .detail-info-label {
    padding: 9px 10px;

    font-size: 11px;
  }

  .detail-info-value {
    padding: 9px 10px;

    font-size: 12px;

    min-width: 0;
  }

  .catechist-detail-tabs .ant-tabs-tab {
    padding: 8px 7px !important;

    font-size: 12px;
  }

  .detail-class-table-wrapper {
    overflow-x: auto;
  }

  .detail-class-table-wrapper .ant-table {
    min-width: 740px;
  }

  .detail-tab-label {
    gap: 5px;
  }
}

@media (max-width: 400px) {

  .detail-info-item {
    grid-template-columns:
      42%
      58%;
  }

  .detail-info-label {
    font-size: 10px;

    padding: 8px;
  }

  .detail-info-value {
    font-size: 11px;

    padding: 8px;
  }

  .detail-name {
    font-size: 17px;
  }
}

`}</style>
      </div>
    </ConfigProvider>
  );
}
