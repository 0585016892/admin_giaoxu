import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tag,
  Avatar,
  Space,
  Modal,
  Form,
  Input,
  message,
  Empty,
  Skeleton,
  Drawer,
  Descriptions,
  Divider,
  Segmented,
  Badge,
} from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  UserSwitchOutlined,
  FilterOutlined,
  HeartFilled,
  StarFilled,
  SmileOutlined,
} from "@ant-design/icons";

import usePermission from "../../hooks/usePermission";
import AppFormModal from "../../components/common/AppFormModal";
import ClassForm from "../../components/forms/ClassForm";
import StatCard from "../../components/common/StatCard";
import ClassCard from "../../components/class/ClassCard";
import ClassDetailSkeleton from "../../components/class/ClassDetailSkeleton";
import dayjs from "dayjs";
import classApi from "../../api/classApi";
import { useUser } from "../../context/UserContext";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import catechistApi from "../../api/catechistApi";

const { Text } = Typography;

/* =========================================================
   FAITHEDU COLORS
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  gold: "#D9A441",
  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#173B5E",
  textSecondary: "#64748B",
  muted: "#94A3B8",
  border: "#E2E8F0",

  navyLight: "#EEF3F7",
  goldLight: "#FBF5E7",

  success: "#2E7D5B",
  successBg: "#EAF6F0",
  warning: "#B7791F",
  warningBg: "#FFF7E5",
  gray: "#64748B",
  grayBg: "#F1F5F9",

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

/* =========================================================
   HELPERS & NORMALIZE
========================================================= */

const normalizeListResponse = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const normalizeObjectResponse = (response) => {
  const data = response?.data;

  if (data?.data && !Array.isArray(data.data)) {
    return data.data;
  }

  return data || null;
};

const formatTime = (time) => {
  if (!time) return "—";
  return String(time).slice(0, 5);
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = dayjs(date);

  if (!parsed.isValid()) return "—";

  return parsed.format("DD/MM/YYYY");
};

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

    monday: "Thứ Hai",
    tuesday: "Thứ Ba",
    wednesday: "Thứ Tư",
    thursday: "Thứ Năm",
    friday: "Thứ Sáu",
    saturday: "Thứ Bảy",
    sunday: "Chúa Nhật",
  };

  return days[day] || day || "Chưa cập nhật";
};

const getStatusConfig = (status) => {
  const configs = {
    active: {
      label: "Đang hoạt động",
      color: COLORS.success,
      bg: COLORS.successBg,
      border: "#C8E6D7",
      icon: <CheckCircleOutlined />,
    },

    paused: {
      label: "Tạm dừng",
      color: COLORS.warning,
      bg: COLORS.warningBg,
      border: "#F1D48A",
      icon: <PauseCircleOutlined />,
    },

    completed: {
      label: "Đã kết thúc",
      color: COLORS.gray,
      bg: COLORS.grayBg,
      border: "#E2E8F0",
      icon: <StopOutlined />,
    },
  };

  return configs[status] || configs.active;
};

/* =========================================================
   STATUS TAG
========================================================= */

const StatusTag = ({ status }) => {
  const config = getStatusConfig(status);

  return (
    <Tag
      bordered={false}
      style={{
        margin: 0,
        borderRadius: 8,
        padding: "4px 10px",
        fontSize: 11,
        fontWeight: 700,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {config.icon}
      {config.label}
    </Tag>
  );
};

/* =========================================================
   SKELETON CARD
========================================================= */

const ClassCardSkeleton = () => {
  return (
    <Card
      bordered={false}
      style={{
        height: "100%",
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
        background: COLORS.white,
        boxShadow: "0 4px 18px rgba(23, 59, 94, 0.06)",
      }}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div
        style={{
          padding: 20,
          background: COLORS.navyLight,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <Row justify="space-between" align="start">
          <Space align="start" size={12}>
            <Skeleton.Avatar
              active
              size={48}
              shape="square"
              style={{
                borderRadius: 12,
              }}
            />

            <div>
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: 150,
                  height: 18,
                  borderRadius: 6,
                }}
              />

              <div style={{ marginTop: 8 }}>
                <Skeleton.Input
                  active
                  size="small"
                  style={{
                    width: 80,
                    height: 16,
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          </Space>

          <Skeleton.Button
            active
            size="small"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
            }}
          />
        </Row>
      </div>

      <div style={{ padding: 18 }}>
        <Row gutter={[10, 10]}>
          {[1, 2, 3, 4].map((item) => (
            <Col span={12} key={item}>
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: "100%",
                  height: 38,
                  borderRadius: 10,
                }}
              />
            </Col>
          ))}
        </Row>

        <div
          style={{
            marginTop: 14,
            padding: 10,
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            background: COLORS.background,
          }}
        >
          <Space size={10}>
            <Skeleton.Avatar active size={32} shape="circle" />

            <Skeleton.Input
              active
              size="small"
              style={{
                width: 90,
                height: 16,
                borderRadius: 6,
              }}
            />
          </Space>
        </div>
      </div>
    </Card>
  );
};

/* =========================================================
   CATECHIST ITEM
========================================================= */

const CatechistItem = ({ catechist, index, classId, onRemove, removing }) => {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        marginBottom: 12,
        boxShadow: "0 3px 12px rgba(23, 59, 94, 0.04)",
      }}
    >
      <Row gutter={[12, 12]} align="middle">
        <Col>
          <Avatar
            size={48}
            style={{
              background: index % 2 === 0 ? COLORS.navy : COLORS.gold,
              color: COLORS.white,
              fontWeight: 800,
              fontSize: 16,
              border: `2px solid ${COLORS.white}`,
              boxShadow: "0 4px 12px rgba(23, 59, 94, 0.12)",
            }}
          >
            {catechist.full_name?.charAt(0)?.toUpperCase() || "G"}
          </Avatar>
        </Col>

        <Col flex="auto">
          <Row justify="space-between" align="middle" gutter={[8, 8]}>
            <Col flex="auto">
              <Text
                strong
                style={{
                  color: COLORS.text,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {catechist.holy_name ? `${catechist.holy_name} ` : ""}
                {catechist.full_name || "Giáo lý viên"}
              </Text>
            </Col>

            <Col>
              {catechist.role && (
                <Tag
                  style={{
                    margin: 0,
                    border: `1px solid ${COLORS.gold}`,
                    borderRadius: 7,
                    background: COLORS.goldLight,
                    color: COLORS.navy,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                  }}
                >
                  {catechist.role}
                </Tag>
              )}
            </Col>
          </Row>

          <Space
            wrap
            size={[10, 4]}
            style={{
              marginTop: 5,
            }}
          >
            {catechist.catechist_code && (
              <Text
                style={{
                  fontSize: 11,
                  color: COLORS.muted,
                  fontWeight: 700,
                }}
              >
                <IdcardOutlined
                  style={{
                    color: COLORS.gold,
                    marginRight: 4,
                  }}
                />
                {catechist.catechist_code}
              </Text>
            )}

            {catechist.level && (
              <Text
                style={{
                  fontSize: 11,
                  color: COLORS.muted,
                  fontWeight: 700,
                }}
              >
                • Cấp: {catechist.level}
              </Text>
            )}
          </Space>
        </Col>

        <Col>
          <Button
            danger
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            loading={removing}
            disabled={removing}
            onClick={() => onRemove(catechist)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Col>
      </Row>

      <Divider
        style={{
          margin: "12px 0",
          borderColor: COLORS.border,
        }}
      />

      <Row gutter={[10, 8]}>
        <Col xs={24} sm={12}>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.textSecondary,
              fontWeight: 600,
            }}
          >
            <PhoneOutlined
              style={{
                marginRight: 6,
                color: COLORS.navy,
              }}
            />
            {catechist.phone || "Chưa cập nhật"}
          </Text>
        </Col>

        <Col xs={24} sm={12}>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.textSecondary,
              fontWeight: 600,
            }}
          >
            <MailOutlined
              style={{
                marginRight: 6,
                color: COLORS.navy,
              }}
            />
            {catechist.email || "Chưa cập nhật"}
          </Text>
        </Col>

        <Col span={24}>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.textSecondary,
              fontWeight: 600,
            }}
          >
            <CalendarOutlined
              style={{
                marginRight: 6,
                color: COLORS.gold,
              }}
            />
            Ngày phân công: {formatDate(catechist.assigned_date)}
          </Text>
        </Col>
      </Row>
    </div>
  );
};

/* =========================================================
   SECTION TITLE
========================================================= */

const SectionTitle = ({ icon, title, description, count }) => {
  return (
    <Row
      justify="space-between"
      align="middle"
      style={{
        marginBottom: 14,
      }}
    >
      <Col flex="auto">
        <Space align="center" size={10}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: COLORS.navyLight,
              color: COLORS.navy,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {icon}
          </div>

          <div>
            <Text
              strong
              style={{
                display: "block",
                color: COLORS.text,
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              {title}
            </Text>

            {description && (
              <Text
                style={{
                  fontSize: 11,
                  color: COLORS.muted,
                  fontWeight: 600,
                }}
              >
                {description}
              </Text>
            )}
          </div>
        </Space>
      </Col>

      {count !== undefined && (
        <Col>
          <Badge
            count={count}
            style={{
              backgroundColor: COLORS.navy,
              fontWeight: 800,
              boxShadow: "0 3px 8px rgba(23, 59, 94, 0.18)",
            }}
          />
        </Col>
      )}
    </Row>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ClassManagement = () => {
  const { user } = useUser();

  const churchId = user?.church_id;

  const { canCreateClass, canEditClass, canDeleteClass } = usePermission();

  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingClass, setEditingClass] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);

  const [detailLoading, setDetailLoading] = useState(false);

  const [classDetail, setClassDetail] = useState(null);

  const [removingCatechistId, setRemovingCatechistId] = useState(null);

  const [form] = Form.useForm();

  /* =====================================================
     FETCH DATA
  ===================================================== */

  const fetchClasses = useCallback(async (showMessage = false) => {
    try {
      setLoading(true);

      const response = await classApi.getAll();

      const data = normalizeListResponse(response);

      setClassesList(data);

      if (showMessage) {
        message.success("Đã làm mới danh sách lớp học");
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể tải danh sách lớp học",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  /* =====================================================
     EDIT FORM
  ===================================================== */

  useEffect(() => {
    if (!isModalOpen) return;

    if (editingClass) {
      form.setFieldsValue({
        name: editingClass.name || "",
        category: editingClass.category || "Giáo lý Hôn Nhân",

        description: editingClass.description || "",

        room: editingClass.room || "",

        day_of_week: editingClass.day_of_week ?? null,

        start_time: editingClass.start_time
          ? dayjs(editingClass.start_time, "HH:mm:ss")
          : null,

        end_time: editingClass.end_time
          ? dayjs(editingClass.end_time, "HH:mm:ss")
          : null,

        start_date: editingClass.start_date
          ? dayjs(editingClass.start_date)
          : null,

        end_date: editingClass.end_date ? dayjs(editingClass.end_date) : null,

        status: editingClass.status || "active",
      });
    } else {
      form.resetFields();

      form.setFieldsValue({
        category: "Giáo lý Hôn Nhân",
        status: "active",
      });
    }
  }, [editingClass, isModalOpen, form]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const statistics = useMemo(() => {
    const totalClasses = classesList.length;

    const activeClasses = classesList.filter(
      (item) => item.status === "active",
    ).length;

    const pausedClasses = classesList.filter(
      (item) => item.status === "paused",
    ).length;

    const completedClasses = classesList.filter(
      (item) => item.status === "completed",
    ).length;

    const totalStudents = classesList.reduce(
      (total, item) => total + Number(item.studentsCount || 0),
      0,
    );

    const totalCatechists = classesList.reduce(
      (total, item) => total + Number(item.catechists?.length || 0),
      0,
    );

    return {
      totalClasses,
      activeClasses,
      pausedClasses,
      completedClasses,
      totalStudents,
      totalCatechists,
    };
  }, [classesList]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredClasses = useMemo(() => {
    const keyword = searchText.toLowerCase().trim();

    return classesList.filter((item) => {
      const matchSearch =
        !keyword ||
        item.name?.toLowerCase().includes(keyword) ||
        item.code?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.room?.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [classesList, searchText, statusFilter]);

  /* =====================================================
     CREATE
  ===================================================== */

  const handleCreate = useCallback(() => {
    if (saving) return;

    setEditingClass(null);
    setIsModalOpen(true);
  }, [saving]);

  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = useCallback(
    (item) => {
      if (saving) return;

      setEditingClass(item);
      setIsModalOpen(true);
    },
    [saving],
  );

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = useCallback(() => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingClass(null);
    form.resetFields();
  }, [form, saving]);

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = useCallback(
    async (values) => {
      if (saving) return;

      if (!churchId) {
        message.error("Không xác định được giáo xứ của tài khoản");
        return;
      }

      try {
        setSaving(true);

        const payload = {
          name: values.name?.trim(),

          church_id: churchId,

          category: values.category || "Giáo lý Hôn Nhân",

          description: values.description?.trim() || null,

          room: values.room?.trim() || null,

          day_of_week: values.day_of_week || null,

          start_time: values.start_time
            ? values.start_time.format("HH:mm:ss")
            : null,

          end_time: values.end_time ? values.end_time.format("HH:mm:ss") : null,

          start_date: values.start_date
            ? values.start_date.format("YYYY-MM-DD")
            : null,

          end_date: values.end_date
            ? values.end_date.format("YYYY-MM-DD")
            : null,

          status: values.status || "active",
        };

        if (editingClass) {
          await classApi.update(editingClass.id, payload);

          message.success("Cập nhật lớp học thành công");
        } else {
          const response = await classApi.create(payload);

          const generatedCode = response?.data?.data?.code;

          if (generatedCode) {
            message.success(`Tạo lớp thành công • Mã lớp: ${generatedCode}`);
          } else {
            message.success("Tạo lớp học thành công");
          }
        }

        setIsModalOpen(false);
        setEditingClass(null);
        form.resetFields();

        await fetchClasses();
      } catch (error) {
        message.error(
          error?.response?.data?.message || "Không thể lưu lớp học",
        );
      } finally {
        setSaving(false);
      }
    },
    [editingClass, fetchClasses, form, saving, churchId],
  );

  /* =====================================================
     DELETE CLASS
  ===================================================== */

  const handleDelete = useCallback(
    (item) => {
      if (deletingId) return;

      Modal.confirm({
        title: "Xác nhận xóa lớp học",

        icon: (
          <DeleteOutlined
            style={{
              color: COLORS.danger,
            }}
          />
        ),

        content: (
          <div style={{ marginTop: 10 }}>
            <Text>
              Bạn có chắc chắn muốn xóa lớp <strong>{item.name}</strong>?
            </Text>

            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 10,
                background: COLORS.dangerBg,
                border: `1px solid #F5C6C2`,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.danger,
                }}
              >
                Việc xóa lớp có thể ảnh hưởng đến dữ liệu học viên và Giáo lý
                viên phụ trách.
              </Text>
            </div>
          </div>
        ),

        okText: "Xóa lớp",
        cancelText: "Hủy",

        okButtonProps: {
          danger: true,
          style: {
            borderRadius: 8,
            fontWeight: 700,
          },
        },

        cancelButtonProps: {
          style: {
            borderRadius: 8,
          },
        },

        onOk: async () => {
          try {
            setDeletingId(item.id);

            await classApi.remove(item.id);

            message.success("Đã xóa lớp học thành công");

            await fetchClasses();
          } catch (error) {
            message.error(
              error?.response?.data?.message || "Không thể xóa lớp học",
            );
          } finally {
            setDeletingId(null);
          }
        },
      });
    },
    [deletingId, fetchClasses],
  );

  /* =====================================================
     VIEW DETAIL
  ===================================================== */

  const handleViewDetail = useCallback(async (item) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setClassDetail(null);

      const response = await classApi.getById(item.id);

      setClassDetail(normalizeObjectResponse(response));
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể tải thông tin lớp học",
      );

      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /* =====================================================
     REMOVE CATECHIST
  ===================================================== */

  const handleRemoveCatechist = useCallback(
    (catechist) => {
      const classId = classDetail?.id;

      const catechistId = catechist?.catechist_id ?? catechist?.id;

      if (!classId) {
        message.error("Không xác định được lớp học");
        return;
      }

      if (!catechistId) {
        message.error("Không xác định được giáo lý viên");
        return;
      }

      Modal.confirm({
        title: "Xóa giáo lý viên khỏi lớp",

        icon: (
          <DeleteOutlined
            style={{
              color: COLORS.danger,
            }}
          />
        ),

        content: (
          <div style={{ marginTop: 10 }}>
            <Text>
              Bạn có chắc muốn xóa{" "}
              <strong>
                {catechist.holy_name ? `${catechist.holy_name} ` : ""}
                {catechist.full_name}
              </strong>{" "}
              khỏi lớp <strong>{classDetail.name}</strong>?
            </Text>

            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 10,
                background: COLORS.goldLight,
                border: `1px solid #EBD9A8`,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.warning,
                }}
              >
                Giáo lý viên sẽ không còn được phân công phụ trách lớp này.
              </Text>
            </div>
          </div>
        ),

        okText: "Xóa khỏi lớp",
        cancelText: "Hủy",

        okButtonProps: {
          danger: true,
          style: {
            borderRadius: 8,
            fontWeight: 700,
          },
        },

        cancelButtonProps: {
          style: {
            borderRadius: 8,
          },
        },

        onOk: async () => {
          try {
            setRemovingCatechistId(catechistId);

            await catechistApi.removeClass({
              catechist_id: Number(catechistId),

              class_id: Number(classId),
            });

            message.success(`Đã xóa ${catechist.full_name} khỏi lớp`);

            const response = await classApi.getById(classId);

            setClassDetail(normalizeObjectResponse(response));

            await fetchClasses();
          } catch (error) {
            message.error(
              error?.response?.data?.message ||
                "Không thể xóa giáo lý viên khỏi lớp",
            );
          } finally {
            setRemovingCatechistId(null);
          }
        },
      });
    },
    [classDetail, fetchClasses],
  );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.background,
        paddingBottom: 24,
      }}
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <PageHeroHeader
        icon={<BookOutlined />}
        badgeText="QUẢN LÝ GIÁO LÝ"
        title="Quản lý lớp học"
        description="Theo dõi lịch học, danh sách học viên và Giáo lý viên phụ trách."
        onRefresh={() => fetchClasses(true)}
        refreshLoading={loading}
        primaryButtonText={canCreateClass ? "Tạo lớp mới" : undefined}
        primaryButtonIcon={canCreateClass ? <PlusOutlined /> : undefined}
        onPrimaryClick={canCreateClass ? handleCreate : undefined}
        primaryDisabled={loading || saving || !canCreateClass}
      />

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <Row
        gutter={[16, 16]}
        style={{
          marginBottom: 20,
        }}
      >
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Tổng số lớp"
            value={statistics.totalClasses}
            loading={loading}
            icon={<BookOutlined />}
            iconColor={COLORS.navy}
            description="Tất cả lớp học"
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Đang hoạt động"
            value={statistics.activeClasses}
            loading={loading}
            icon={<CheckCircleOutlined />}
            iconColor={COLORS.navyHover}
            description={`${
              statistics.totalClasses
                ? Math.round(
                    (statistics.activeClasses / statistics.totalClasses) * 100,
                  )
                : 0
            }% tổng số lớp`}
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Tổng học viên"
            value={statistics.totalStudents}
            loading={loading}
            suffix="bé"
            icon={<TeamOutlined />}
            iconColor={COLORS.gold}
            description="Đang được quản lý"
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Giáo lý viên"
            value={statistics.totalCatechists}
            loading={loading}
            suffix="phụ trách"
            icon={<UserSwitchOutlined />}
            iconColor={COLORS.navy}
            description="Được phân công"
          />
        </Col>
      </Row>

      {/* =====================================================
          SEARCH / FILTER
      ===================================================== */}

      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          marginBottom: 20,
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 4px 18px rgba(23, 59, 94, 0.05)",
        }}
        styles={{
          body: {
            padding: 14,
          },
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} lg={15}>
            <Input
              size="large"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={
                <SearchOutlined
                  style={{
                    color: COLORS.navy,
                  }}
                />
              }
              placeholder="Tìm tên lớp, mã lớp, chương trình hoặc phòng học..."
              style={{
                height: 44,
                borderRadius: 9,
                background: COLORS.background,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                fontWeight: 600,
              }}
            />
          </Col>

          <Col xs={24} lg={9}>
            <Segmented
              block
              value={statusFilter}
              onChange={setStatusFilter}
              style={{
                background: COLORS.background,
                borderRadius: 9,
                padding: 3,
                border: `1px solid ${COLORS.border}`,
              }}
              options={[
                {
                  label: "Tất cả",
                  value: "all",
                },
                {
                  label: "Hoạt động",
                  value: "active",
                },
                {
                  label: "Tạm dừng",
                  value: "paused",
                },
                {
                  label: "Kết thúc",
                  value: "completed",
                },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* =====================================================
          LIST HEADER
      ===================================================== */}

      <Row
        justify="space-between"
        align="middle"
        style={{
          marginBottom: 16,
          padding: "0 4px",
        }}
      >
        <Col>
          <Space size={10} align="center">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.navy,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FilterOutlined />
            </div>

            <div>
              <Text
                strong
                style={{
                  display: "block",
                  color: COLORS.text,
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                Danh sách lớp học
              </Text>

              <Text
                style={{
                  fontSize: 11,
                  color: COLORS.muted,
                  fontWeight: 600,
                }}
              >
                {filteredClasses.length} lớp được hiển thị
              </Text>
            </div>
          </Space>
        </Col>

        <Col>
          <Tag
            style={{
              margin: 0,
              borderRadius: 8,
              background: COLORS.navyLight,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.navy,
              fontWeight: 700,
              padding: "4px 10px",
            }}
          >
            {filteredClasses.length}
          </Tag>
        </Col>
      </Row>

      {/* =====================================================
          CLASS GRID
      ===================================================== */}

      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <Col xs={24} sm={12} lg={8} key={key}>
              <ClassCardSkeleton />
            </Col>
          ))}
        </Row>
      ) : filteredClasses.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredClasses.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <ClassCard
                item={item}
                onView={handleViewDetail}
                onEdit={canEditClass ? handleEdit : undefined}
                onDelete={canDeleteClass ? handleDelete : undefined}
                canEdit={canEditClass}
                canDelete={canDeleteClass}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Card
          bordered={false}
          style={{
            borderRadius: 14,
            textAlign: "center",
            padding: "40px 20px",
            background: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 4px 18px rgba(23, 59, 94, 0.04)",
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text
                style={{
                  color: COLORS.muted,
                  fontWeight: 700,
                }}
              >
                Không tìm thấy lớp học phù hợp
              </Text>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              style={{
                borderRadius: 8,
                background: COLORS.navy,
                borderColor: COLORS.navy,
                fontWeight: 700,
                height: 40,
              }}
            >
              Tạo lớp mới
            </Button>
          </Empty>
        </Card>
      )}

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      <AppFormModal
        title={editingClass ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}
        open={isModalOpen}
        onCancel={closeModal}
        confirmLoading={saving}
        onOk={() => form.submit()}
      >
        <ClassForm
          form={form}
          editingClass={editingClass}
          loading={saving}
          onFinish={handleSave}
        />
      </AppFormModal>

      {/* =====================================================
          DETAIL DRAWER
      ===================================================== */}

      <Drawer
        title={
          <Space align="center" size={10}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                background: COLORS.navy,
                color: COLORS.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.navy}`,
              }}
            >
              <BookOutlined />
            </div>

            <div>
              <Text
                strong
                style={{
                  display: "block",
                  color: COLORS.text,
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                {classDetail?.name || "Chi tiết lớp học"}
              </Text>

              {classDetail?.code && (
                <Tag
                  style={{
                    margin: 0,
                    marginTop: 3,
                    borderRadius: 6,
                    background: COLORS.goldLight,
                    color: COLORS.navy,
                    border: `1px solid #EBD9A8`,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {classDetail.code}
                </Tag>
              )}
            </div>
          </Space>
        }
        width={520}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        styles={{
          header: {
            background: COLORS.white,
            borderBottom: `1px solid ${COLORS.border}`,
            padding: "16px 24px",
          },

          body: {
            padding: 20,
            background: COLORS.background,
          },
        }}
      >
        {detailLoading ? (
          <ClassDetailSkeleton />
        ) : classDetail ? (
          <div>
            {/* TỔNG QUAN */}

            <SectionTitle
              icon={<StarFilled />}
              title="Thông tin tổng quan"
              description="Lịch học và thời gian khóa học"
            />

            <Descriptions
              column={2}
              bordered
              size="small"
              style={{
                marginBottom: 24,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <Descriptions.Item label="Lịch học">
                {getDayName(classDetail.day_of_week)}
              </Descriptions.Item>

              <Descriptions.Item label="Thời gian">
                {formatTime(classDetail.start_time)} -{" "}
                {formatTime(classDetail.end_time)}
              </Descriptions.Item>

              <Descriptions.Item label="Phòng học">
                {classDetail.room || "Chưa cập nhật"}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <StatusTag status={classDetail.status} />
              </Descriptions.Item>

              <Descriptions.Item label="Ngày bắt đầu">
                {formatDate(classDetail.start_date)}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày kết thúc">
                {formatDate(classDetail.end_date)}
              </Descriptions.Item>
            </Descriptions>

            {/* GIÁO LÝ VIÊN */}

            <SectionTitle
              icon={<HeartFilled />}
              title="Giáo lý viên phụ trách"
              count={classDetail.catechists?.length || 0}
            />

            {classDetail.catechists?.length > 0 ? (
              classDetail.catechists.map((c, idx) => (
                <CatechistItem
                  key={c.id || idx}
                  catechist={c}
                  index={idx}
                  classId={classDetail.id}
                  onRemove={handleRemoveCatechist}
                  removing={removingCatechistId === c.id}
                />
              ))
            ) : (
              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  background: COLORS.white,
                  border: `1px dashed ${COLORS.border}`,
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                <SmileOutlined
                  style={{
                    fontSize: 24,
                    color: COLORS.gold,
                    marginBottom: 8,
                  }}
                />

                <Text
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: COLORS.muted,
                    fontWeight: 700,
                  }}
                >
                  Chưa có Giáo lý viên nào được phân công
                </Text>
              </div>
            )}
          </div>
        ) : (
          <Empty description="Không tìm thấy dữ liệu lớp học" />
        )}
      </Drawer>

      {/* =====================================================
          LOCAL OVERRIDE STYLE
      ===================================================== */}

      <style>
        {`
          .ant-btn-primary {
            background: ${COLORS.navy} !important;
            border-color: ${COLORS.navy} !important;
          }

          .ant-btn-primary:hover,
          .ant-btn-primary:focus {
            background: ${COLORS.navyHover} !important;
            border-color: ${COLORS.navyHover} !important;
          }

          .ant-segmented-item-selected {
            color: ${COLORS.navy} !important;
            font-weight: 700;
          }

          .ant-segmented-thumb {
            background: ${COLORS.white} !important;
            box-shadow:
              0 2px 6px rgba(23, 59, 94, 0.08) !important;
          }

          .ant-input:focus,
          .ant-input-focused,
          .ant-input-affix-wrapper:focus,
          .ant-input-affix-wrapper-focused {
            border-color: ${COLORS.navy} !important;
            box-shadow:
              0 0 0 2px rgba(23, 59, 94, 0.08) !important;
          }

          .ant-drawer .ant-drawer-header {
            min-height: 72px;
          }

          .ant-descriptions
            .ant-descriptions-item-label {
            color: ${COLORS.textSecondary};
            font-weight: 600;
            background: ${COLORS.background};
          }

          .ant-descriptions
            .ant-descriptions-item-content {
            color: ${COLORS.text};
            font-weight: 600;
            background: ${COLORS.white};
          }

          .ant-modal-confirm-title {
            color: ${COLORS.navy} !important;
            font-weight: 800 !important;
          }
        `}
      </style>
    </div>
  );
};

export default ClassManagement;
