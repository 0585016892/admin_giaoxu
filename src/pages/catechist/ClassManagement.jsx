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
  Dropdown,
  message,
  Empty,
  Skeleton,
  Drawer,
  Descriptions,
  Divider,
  Tooltip,
  Segmented,
  Badge,
  Progress,
  Spin,
} from "antd";

import {
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  EyeOutlined,
  SearchOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  FileTextOutlined,
  UserSwitchOutlined,
  CloseOutlined,
  ArrowRightOutlined,
  FilterOutlined,
  CalendarFilled,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import AppFormModal from "../../components/common/AppFormModal";
import ClassForm from "../../components/forms/ClassForm";
import StatCard from "../../components/common/StatCard";
import dayjs from "dayjs";
import classApi from "../../api/classApi";
import AppButton from "../../components/common/AppButton";

const { Title, Text, Paragraph } = Typography;

/* =========================================================
   THEME
========================================================= */

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";

const textDark = "#1E293B";
const textMuted = "#64748B";
const textLight = "#94A3B8";

const softBg = "#F5F7FA";
const borderColor = "#E8ECF1";
const white = "#FFFFFF";

/* =========================================================
   OPTIONS
========================================================= */

/* =========================================================
   HELPERS
========================================================= */

const normalizeListResponse = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

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
      color: "success",
      icon: <CheckCircleOutlined />,
    },

    paused: {
      label: "Tạm dừng",
      color: "warning",
      icon: <PauseCircleOutlined />,
    },

    completed: {
      label: "Đã kết thúc",
      color: "default",
      icon: <StopOutlined />,
    },
  };

  return configs[status] || configs.active;
};

const getCategoryShortName = (category) => {
  if (!category) return "GL";

  if (category.includes("Hôn Nhân")) return "HN";
  if (category.includes("Dự Tòng")) return "DT";
  if (category.includes("Tân Tòng")) return "TT";
  if (category.includes("Thiếu Nhi")) return "TN";
  if (category.includes("Thêm Sức")) return "TS";

  return "GL";
};

/* =========================================================
   STATUS TAG
========================================================= */

const StatusTag = ({ status }) => {
  const config = getStatusConfig(status);

  return (
    <Tag
      color={config.color}
      icon={config.icon}
      style={{
        margin: 0,
        borderRadius: 999,
        padding: "4px 11px",
        fontSize: 11,
        fontWeight: 650,
        border: "none",
      }}
    >
      {config.label}
    </Tag>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

/* =========================================================
   INFO ITEM
========================================================= */

const InfoItem = ({ icon, label, value }) => {
  return (
    <div
      style={{
        minWidth: 0,
      }}
    >
      <Text
        style={{
          display: "block",
          color: textLight,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: 0.7,
          marginBottom: 7,
        }}
      >
        {label.toUpperCase()}
      </Text>

      <Space
        size={7}
        align="start"
        style={{
          maxWidth: "100%",
        }}
      >
        <span
          style={{
            width: 27,
            height: 27,
            flexShrink: 0,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${primaryNavy}09`,
            color: primaryNavy,
            fontSize: 12,
          }}
        >
          {icon}
        </span>

        <Text
          ellipsis
          style={{
            color: textDark,
            fontSize: 12,
            lineHeight: "27px",
            maxWidth: "100%",
          }}
        >
          {value}
        </Text>
      </Space>
    </div>
  );
};

/* =========================================================
   CLASS CARD
========================================================= */

const ClassCard = ({ item, onView, onEdit, onDelete }) => {
  const catechists = Array.isArray(item.catechists) ? item.catechists : [];

  const studentsCount = Number(item.studentsCount || 0);

  return (
    <Card
      bordered={false}
      hoverable
      onClick={() => onView(item)}
      style={{
        height: "100%",
        borderRadius: 22,
        overflow: "hidden",
        cursor: "pointer",
        background: white,
        border: `1px solid ${borderColor}`,
        boxShadow: "0 7px 28px rgba(15,23,42,0.035)",
        transition: "all .25s ease",
      }}
      bodyStyle={{
        padding: 0,
      }}
    >
      {/* HEADER */}

      <div
        style={{
          position: "relative",
          padding: 20,
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #F9FBFD 65%, #F5F8FC 100%)",
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: `${primaryNavy}04`,
            pointerEvents: "none",
          }}
        />

        <Row
          justify="space-between"
          align="start"
          gutter={12}
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Col flex="auto">
            <Space align="start" size={12}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  flexShrink: 0,
                  borderRadius: 16,
                  background: `${primaryNavy}0D`,
                  color: primaryNavy,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                <BookOutlined />
              </div>

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <Text
                  strong
                  ellipsis
                  style={{
                    display: "block",
                    maxWidth: 225,
                    color: textDark,
                    fontSize: 16,
                    lineHeight: 1.35,
                  }}
                >
                  {item.name || "Chưa đặt tên"}
                </Text>

                <Space
                  size={7}
                  wrap
                  style={{
                    marginTop: 8,
                  }}
                >
                  {item.code && (
                    <Tag
                      style={{
                        margin: 0,
                        border: 0,
                        borderRadius: 999,
                        background: `${accentGold}1A`,
                        color: "#96751A",
                        fontSize: 10,
                        fontWeight: 750,
                        padding: "2px 9px",
                      }}
                    >
                      {item.code}
                    </Tag>
                  )}

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {getCategoryShortName(item.category)}
                  </Text>
                </Space>
              </div>
            </Space>
          </Col>

          <Col>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "view",
                    icon: <EyeOutlined />,
                    label: "Xem chi tiết",
                    onClick: ({ domEvent }) => {
                      domEvent.stopPropagation();
                      onView(item);
                    },
                  },
                  {
                    key: "edit",
                    icon: <EditOutlined />,
                    label: "Chỉnh sửa",
                    onClick: ({ domEvent }) => {
                      domEvent.stopPropagation();
                      onEdit(item);
                    },
                  },
                  {
                    type: "divider",
                  },
                  {
                    key: "delete",
                    danger: true,
                    icon: <DeleteOutlined />,
                    label: "Xóa lớp",
                    onClick: ({ domEvent }) => {
                      domEvent.stopPropagation();
                      onDelete(item);
                    },
                  },
                ],
              }}
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={(event) => event.stopPropagation()}
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: 11,
                  color: textMuted,
                }}
              />
            </Dropdown>
          </Col>
        </Row>

        <Row
          justify="space-between"
          align="middle"
          style={{
            marginTop: 17,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Col>
            <Text
              style={{
                color: textMuted,
                fontSize: 11,
              }}
            >
              {item.category || "Chưa phân loại"}
            </Text>
          </Col>

          <Col>
            <StatusTag status={item.status} />
          </Col>
        </Row>
      </div>

      {/* BODY */}

      <div
        style={{
          padding: 20,
        }}
      >
        <Row gutter={[14, 20]}>
          <Col span={12}>
            <InfoItem
              icon={<CalendarOutlined />}
              label="Lịch học"
              value={getDayName(item.day_of_week)}
            />
          </Col>

          <Col span={12}>
            <InfoItem
              icon={<ClockCircleOutlined />}
              label="Thời gian"
              value={`${formatTime(
                item.start_time,
              )} - ${formatTime(item.end_time)}`}
            />
          </Col>

          <Col span={12}>
            <InfoItem
              icon={<EnvironmentOutlined />}
              label="Phòng học"
              value={item.room || "Chưa cập nhật"}
            />
          </Col>

          <Col span={12}>
            <InfoItem
              icon={<TeamOutlined />}
              label="Học viên"
              value={`${studentsCount} học viên`}
            />
          </Col>
        </Row>

        <div
          style={{
            marginTop: 20,
            padding: "13px 14px",
            borderRadius: 14,
            background: "#FAFBFC",
            border: `1px solid ${borderColor}`,
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space size={9}>
                <Avatar.Group
                  max={{
                    count: 3,
                    style: {
                      background: primaryNavy,
                      color: white,
                      fontSize: 10,
                    },
                  }}
                >
                  {catechists.length > 0 ? (
                    catechists.map((catechist, index) => (
                      <Tooltip
                        key={catechist.id || catechist.catechist_id || index}
                        title={catechist.full_name || "Giáo lý viên"}
                      >
                        <Avatar
                          size={30}
                          style={{
                            background:
                              index % 2 === 0 ? primaryNavy : accentGold,
                            color: white,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {catechist.full_name?.charAt(0)?.toUpperCase() || "G"}
                        </Avatar>
                      </Tooltip>
                    ))
                  ) : (
                    <Avatar
                      size={30}
                      icon={<UserOutlined />}
                      style={{
                        background: "#EEF1F5",
                        color: textLight,
                      }}
                    />
                  )}
                </Avatar.Group>

                <div>
                  <Text
                    strong
                    style={{
                      display: "block",
                      color: textDark,
                      fontSize: 11,
                    }}
                  >
                    {catechists.length > 0
                      ? `${catechists.length} Giáo lý viên`
                      : "Chưa phân công"}
                  </Text>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 10,
                    }}
                  >
                    Phụ trách lớp
                  </Text>
                </div>
              </Space>
            </Col>

            <Col>
              <Button
                type="text"
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onView(item);
                }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  color: primaryNavy,
                  background: `${primaryNavy}07`,
                }}
                icon={<ArrowRightOutlined />}
              />
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

/* =========================================================
   CLASS CARD SKELETON
========================================================= */

const ClassCardSkeleton = () => {
  return (
    <Card
      bordered={false}
      style={{
        height: "100%",
        borderRadius: 22,
        overflow: "hidden",
        border: `1px solid ${borderColor}`,
      }}
      bodyStyle={{
        padding: 0,
      }}
    >
      <div
        style={{
          padding: 20,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Row justify="space-between" align="start">
          <Space align="start" size={12}>
            <Skeleton.Avatar active size={50} shape="square" />

            <div>
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: 175,
                  height: 18,
                }}
              />

              <div style={{ marginTop: 9 }}>
                <Skeleton.Input
                  active
                  size="small"
                  style={{
                    width: 85,
                    height: 18,
                  }}
                />
              </div>
            </div>
          </Space>

          <Skeleton.Button
            active
            size="small"
            style={{
              width: 34,
            }}
          />
        </Row>

        <Row
          justify="space-between"
          style={{
            marginTop: 17,
          }}
        >
          <Skeleton.Input
            active
            size="small"
            style={{
              width: 130,
              height: 15,
            }}
          />

          <Skeleton.Input
            active
            size="small"
            style={{
              width: 105,
              height: 24,
            }}
          />
        </Row>
      </div>

      <div style={{ padding: 20 }}>
        <Row gutter={[12, 22]}>
          {[1, 2, 3, 4].map((item) => (
            <Col span={12} key={item}>
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: "90%",
                  height: 38,
                }}
              />
            </Col>
          ))}
        </Row>

        <div
          style={{
            marginTop: 20,
            padding: 13,
            borderRadius: 14,
            border: `1px solid ${borderColor}`,
          }}
        >
          <Space>
            <Skeleton.Avatar active size={30} />

            <Skeleton.Input
              active
              size="small"
              style={{
                width: 100,
              }}
            />
          </Space>
        </div>
      </div>
    </Card>
  );
};

/* =========================================================
   DETAIL SKELETON
========================================================= */

const ClassDetailSkeleton = () => {
  return (
    <div style={{ padding: 20 }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 20,
          marginBottom: 16,
        }}
      >
        <Skeleton
          active
          avatar
          paragraph={{
            rows: 4,
          }}
        />
      </Card>

      <Card
        bordered={false}
        style={{
          borderRadius: 20,
          marginBottom: 16,
        }}
      >
        <Skeleton
          active
          paragraph={{
            rows: 8,
          }}
        />
      </Card>

      <Card
        bordered={false}
        style={{
          borderRadius: 20,
        }}
      >
        <Skeleton
          active
          avatar
          paragraph={{
            rows: 5,
          }}
        />
      </Card>
    </div>
  );
};

/* =========================================================
   CATECHIST ITEM
========================================================= */

const CatechistItem = ({ catechist, index }) => {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background: "#FAFBFC",
        border: `1px solid ${borderColor}`,
      }}
    >
      <Row gutter={[14, 14]} align="middle">
        <Col>
          <Avatar
            size={52}
            style={{
              background: index % 2 === 0 ? primaryNavy : accentGold,
              color: white,
              fontWeight: 700,
            }}
          >
            {catechist.full_name?.charAt(0)?.toUpperCase() || "G"}
          </Avatar>
        </Col>

        <Col flex="auto">
          <Row justify="space-between" align="middle" gutter={[10, 8]}>
            <Col>
              <Text
                strong
                style={{
                  color: textDark,
                  fontSize: 14,
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
                    border: 0,
                    borderRadius: 999,
                    background: `${primaryNavy}0C`,
                    color: primaryNavy,
                    fontSize: 10,
                    padding: "3px 9px",
                  }}
                >
                  {catechist.role}
                </Tag>
              )}
            </Col>
          </Row>

          <Space
            wrap
            size={[12, 5]}
            style={{
              marginTop: 6,
            }}
          >
            {catechist.catechist_code && (
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                }}
              >
                <IdcardOutlined /> {catechist.catechist_code}
              </Text>
            )}

            {catechist.level && (
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                }}
              >
                • {catechist.level}
              </Text>
            )}
          </Space>
        </Col>
      </Row>

      <Divider style={{ margin: "14px 0" }} />

      <Row gutter={[12, 10]}>
        <Col xs={24} md={12}>
          <Text
            type="secondary"
            style={{
              fontSize: 12,
            }}
          >
            <PhoneOutlined
              style={{
                marginRight: 6,
                color: primaryNavy,
              }}
            />
            {catechist.phone || "Chưa cập nhật"}
          </Text>
        </Col>

        <Col xs={24} md={12}>
          <Text
            type="secondary"
            style={{
              fontSize: 12,
            }}
          >
            <MailOutlined
              style={{
                marginRight: 6,
                color: primaryNavy,
              }}
            />
            {catechist.email || "Chưa cập nhật"}
          </Text>
        </Col>

        <Col span={24}>
          <Text
            type="secondary"
            style={{
              fontSize: 12,
            }}
          >
            <CalendarOutlined
              style={{
                marginRight: 6,
                color: accentGold,
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
      gutter={12}
      style={{
        marginBottom: 18,
      }}
    >
      <Col flex="auto">
        <Space align="start" size={11}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: `${primaryNavy}0C`,
              color: primaryNavy,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div>
            <Text
              strong
              style={{
                display: "block",
                color: textDark,
                fontSize: 15,
              }}
            >
              {title}
            </Text>

            {description && (
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
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
              backgroundColor: primaryNavy,
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

  const [form] = Form.useForm();

  /* =====================================================
     FETCH
  ===================================================== */

  const fetchClasses = useCallback(async (showMessage = false) => {
    try {
      setLoading(true);

      const response = await classApi.getAll();

      console.log("📚 GET CLASSES:", response);

      const data = normalizeListResponse(response);

      setClassesList(data);

      if (showMessage) {
        message.success("Đã làm mới danh sách lớp học");
      }
    } catch (error) {
      console.error("❌ GET CLASSES ERROR:", error);

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

    form.resetFields();

    form.setFieldsValue({
      category: "Giáo lý Hôn Nhân",
      status: "active",
    });

    setIsModalOpen(true);
  }, [form, saving]);
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

      try {
        setSaving(true);

        const payload = {
          name: values.name?.trim(),

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

        console.log("📤 CLASS PAYLOAD:", payload);

        if (editingClass) {
          await classApi.update(editingClass.id, payload);

          message.success("Cập nhật lớp học thành công");
        } else {
          const response = await classApi.create(payload);

          console.log("✅ CREATE CLASS:", response);

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
        console.error("❌ SAVE CLASS ERROR:", error);

        message.error(
          error?.response?.data?.message || "Không thể lưu lớp học",
        );
      } finally {
        setSaving(false);
      }
    },
    [editingClass, fetchClasses, form, saving],
  );

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = useCallback(
    (item) => {
      if (deletingId) return;

      Modal.confirm({
        title: "Xác nhận xóa lớp học",

        icon: <DeleteOutlined />,

        content: (
          <div
            style={{
              marginTop: 12,
            }}
          >
            <Text>
              Bạn có chắc chắn muốn xóa lớp <strong>{item.name}</strong>?
            </Text>

            <div
              style={{
                marginTop: 12,
                padding: 13,
                borderRadius: 12,
                background: "#FFF7E6",
                border: "1px solid #FFE7BA",
              }}
            >
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                Việc xóa lớp có thể ảnh hưởng đến dữ liệu học viên và phân công
                Giáo lý viên.
              </Text>
            </div>
          </div>
        ),

        okText: "Xóa lớp",

        cancelText: "Hủy",

        okButtonProps: {
          danger: true,
        },

        onOk: async () => {
          try {
            setDeletingId(item.id);

            await classApi.remove(item.id);

            message.success("Đã xóa lớp học");

            await fetchClasses();
          } catch (error) {
            console.error("❌ DELETE CLASS ERROR:", error);

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
     DETAIL
  ===================================================== */

  const handleViewDetail = useCallback(async (item) => {
    try {
      setDetailOpen(true);

      setDetailLoading(true);

      setClassDetail(null);

      const response = await classApi.getById(item.id);

      console.log("📖 CLASS DETAIL:", response);

      setClassDetail(normalizeObjectResponse(response));
    } catch (error) {
      console.error("❌ GET CLASS DETAIL ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể tải thông tin lớp học",
      );

      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: softBg,
        padding: "26px",
      }}
    >
      {/* =================================================
          HERO HEADER
      ================================================= */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "25px 27px",
          marginBottom: 20,
          borderRadius: 24,
          background: "linear-gradient(135deg, #FFFFFF 0%, #F9FBFD 100%)",
          border: `1px solid ${borderColor}`,
          boxShadow: "0 8px 30px rgba(15,23,42,0.035)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: `${primaryNavy}05`,
            right: -70,
            top: -90,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `${accentGold}09`,
            right: 100,
            bottom: -70,
          }}
        />

        <Row
          justify="space-between"
          align="middle"
          gutter={[20, 20]}
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Col xs={24} lg={17}>
            <Space align="start" size={15}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,
                  background: primaryNavy,
                  color: white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                  boxShadow: "0 8px 20px rgba(27,54,93,.16)",
                }}
              >
                <BookOutlined />
              </div>

              <div>
                <Text
                  style={{
                    display: "block",
                    color: accentGold,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1.8,
                    marginBottom: 4,
                  }}
                >
                  QUẢN LÝ GIÁO LÝ
                </Text>

                <Title
                  level={2}
                  style={{
                    margin: 0,
                    color: textDark,
                    fontWeight: 800,
                    letterSpacing: -0.5,
                  }}
                >
                  Quản lý lớp học
                </Title>

                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    marginTop: 5,
                    fontSize: 13,
                  }}
                >
                  Theo dõi lớp học, lịch học, học viên và Giáo lý viên phụ
                  trách.
                </Text>
              </div>
            </Space>
          </Col>

          <Col>
            <Space>
              <Tooltip title="Làm mới dữ liệu">
                <Button
                  icon={<ReloadOutlined />}
                  loading={loading}
                  onClick={() => fetchClasses(true)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background: white,
                  }}
                />
              </Tooltip>

              <AppButton
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                disabled={loading || saving}
              >
                Tạo lớp mới
              </AppButton>
            </Space>
          </Col>
        </Row>
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

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
            iconColor={primaryNavy}
            description="Tất cả lớp học"
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Đang hoạt động"
            value={statistics.activeClasses}
            loading={loading}
            icon={<CheckCircleOutlined />}
            iconColor="#52C41A"
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
            suffix="học viên"
            icon={<TeamOutlined />}
            iconColor={accentGold}
            description="Đang được quản lý"
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Giáo lý viên"
            value={statistics.totalCatechists}
            loading={loading}
            suffix="phân công"
            icon={<UserSwitchOutlined />}
            iconColor={primaryNavy}
            description="Theo các lớp học"
          />
        </Col>
      </Row>

      {/* =================================================
          OVERVIEW
      ================================================= */}

      <Card
        bordered={false}
        style={{
          borderRadius: 20,
          marginBottom: 18,
          boxShadow: "0 6px 25px rgba(15,23,42,0.035)",
        }}
        bodyStyle={{
          padding: "14px 19px",
        }}
      >
        <Row align="middle" justify="space-between" gutter={[20, 14]}>
          <Col flex="auto">
            <Space size={20} wrap>
              <Space size={9}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: `${primaryNavy}0B`,
                    color: primaryNavy,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FilterOutlined />
                </div>

                <Text
                  strong
                  style={{
                    color: textDark,
                    fontSize: 12,
                  }}
                >
                  Tình trạng lớp
                </Text>
              </Space>

              <Space size={7}>
                <Badge status="success" />

                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                  }}
                >
                  {statistics.activeClasses} hoạt động
                </Text>
              </Space>

              <Space size={7}>
                <Badge status="warning" />

                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                  }}
                >
                  {statistics.pausedClasses} tạm dừng
                </Text>
              </Space>

              <Space size={7}>
                <Badge status="default" />

                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                  }}
                >
                  {statistics.completedClasses} kết thúc
                </Text>
              </Space>
            </Space>
          </Col>

          <Col>
            <Text
              type="secondary"
              style={{
                fontSize: 11,
              }}
            >
              Đang hiển thị{" "}
              <strong
                style={{
                  color: textDark,
                }}
              >
                {filteredClasses.length}
              </strong>{" "}
              lớp
            </Text>
          </Col>
        </Row>
      </Card>

      {/* =================================================
          SEARCH / FILTER
      ================================================= */}

      <Card
        bordered={false}
        style={{
          borderRadius: 20,
          marginBottom: 22,
          boxShadow: "0 6px 25px rgba(15,23,42,0.035)",
        }}
        bodyStyle={{
          padding: 15,
        }}
      >
        <Row gutter={[13, 13]} align="middle">
          <Col xs={24} lg={15}>
            <Input
              size="large"
              allowClear
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              prefix={
                <SearchOutlined
                  style={{
                    color: accentGold,
                  }}
                />
              }
              placeholder="Tìm tên lớp, mã lớp, chương trình hoặc phòng học..."
              style={{
                height: 45,
                borderRadius: 12,
                background: "#FAFBFC",
              }}
            />
          </Col>

          <Col xs={24} lg={9}>
            <Segmented
              block
              value={statusFilter}
              onChange={setStatusFilter}
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

      {/* =================================================
          LIST HEADER
      ================================================= */}

      <Row
        justify="space-between"
        align="middle"
        style={{
          marginBottom: 15,
        }}
      >
        <Col>
          <Space size={10}>
            <div
              style={{
                width: 39,
                height: 39,
                borderRadius: 12,
                background: white,
                border: `1px solid ${borderColor}`,
                color: primaryNavy,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(15,23,42,.03)",
              }}
            >
              <AppstoreOutlined />
            </div>

            <div>
              <Text
                strong
                style={{
                  display: "block",
                  color: textDark,
                  fontSize: 15,
                }}
              >
                Danh sách lớp học
              </Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                }}
              >
                {filteredClasses.length} lớp đang hiển thị
              </Text>
            </div>
          </Space>
        </Col>

        <Col>
          {searchText && (
            <Tag
              closable
              onClose={() => setSearchText("")}
              style={{
                borderRadius: 999,
                padding: "4px 10px",
                background: white,
              }}
            >
              Tìm kiếm: {searchText}
            </Tag>
          )}
        </Col>
      </Row>

      {/* =================================================
          CLASS LIST
      ================================================= */}

      {loading ? (
        <Row gutter={[18, 18]}>
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <Col key={`skeleton-${index}`} xs={24} md={12} xl={8}>
              <ClassCardSkeleton />
            </Col>
          ))}
        </Row>
      ) : filteredClasses.length === 0 ? (
        <Card
          bordered={false}
          style={{
            borderRadius: 22,
            padding: "35px 0",
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchText || statusFilter !== "all"
                ? "Không tìm thấy lớp học phù hợp"
                : "Chưa có lớp học"
            }
          >
            {!searchText && statusFilter === "all" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                style={{
                  background: primaryNavy,
                  borderColor: primaryNavy,
                  borderRadius: 11,
                }}
              >
                Tạo lớp đầu tiên
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <Row gutter={[18, 18]}>
          {filteredClasses.map((item) => (
            <Col key={item.id} xs={24} md={12} xl={8}>
              <ClassCard
                item={item}
                onView={handleViewDetail}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      <AppFormModal
        open={isModalOpen}
        loading={saving}
        editing={!!editingClass}
        form={form}
        icon={editingClass ? <EditOutlined /> : <BookOutlined />}
        createTitle="Tạo lớp học mới"
        editTitle="Cập nhật lớp học"
        subtitle="Thiết lập thông tin lớp, lịch học và trạng thái."
        createText="Tạo lớp học"
        editText="Lưu thay đổi"
        width={790}
        onCancel={closeModal}
      >
        <ClassForm
          form={form}
          editingClass={editingClass}
          loading={saving}
          onFinish={handleSave}
        />
      </AppFormModal>
      {/* =================================================
          DETAIL DRAWER
      ================================================= */}

      <Drawer
        open={detailOpen}
        width={780}
        closable={false}
        onClose={() => {
          if (detailLoading) return;

          setDetailOpen(false);
          setClassDetail(null);
        }}
        styles={{
          body: {
            padding: 0,
            background: softBg,
          },
        }}
      >
        {/* HEADER */}

        <div
          style={{
            background: white,
            padding: "14px 21px",
            borderBottom: `1px solid ${borderColor}`,
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <Row justify="space-between" align="middle">
            <Space size={12}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: primaryNavy,
                  color: white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                <BookOutlined />
              </div>

              <div>
                <Text
                  strong
                  style={{
                    display: "block",
                    color: textDark,
                    fontSize: 15,
                  }}
                >
                  Chi tiết lớp học
                </Text>

                <Text
                  type="secondary"
                  style={{
                    fontSize: 10,
                  }}
                >
                  Thông tin lớp và phân công
                </Text>
              </div>
            </Space>

            <Button
              type="text"
              icon={<CloseOutlined />}
              loading={detailLoading}
              onClick={() => {
                if (detailLoading) return;

                setDetailOpen(false);
                setClassDetail(null);
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
              }}
            />
          </Row>
        </div>

        {detailLoading ? (
          <ClassDetailSkeleton />
        ) : !classDetail ? (
          <div
            style={{
              padding: 50,
            }}
          >
            <Empty />
          </div>
        ) : (
          <div
            style={{
              padding: 20,
            }}
          >
            {/* DETAIL HERO */}

            <div
              style={{
                position: "relative",
                overflow: "hidden",
                padding: 22,
                marginBottom: 16,
                borderRadius: 20,
                background: "linear-gradient(135deg,#FFFFFF 0%,#F7FAFD 100%)",
                border: `1px solid ${borderColor}`,
                boxShadow: "0 5px 22px rgba(15,23,42,0.035)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -45,
                  top: -45,
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  background: `${primaryNavy}05`,
                }}
              />

              <Row
                justify="space-between"
                align="start"
                gutter={[15, 15]}
                style={{
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Col flex="auto">
                  <Space direction="vertical" size={7}>
                    <Space wrap>
                      <Title
                        level={3}
                        style={{
                          margin: 0,
                          color: textDark,
                          fontSize: 22,
                        }}
                      >
                        {classDetail.name}
                      </Title>

                      {classDetail.code && (
                        <Tag
                          style={{
                            margin: 0,
                            background: `${accentGold}18`,
                            color: "#96751A",
                            border: 0,
                            borderRadius: 999,
                            fontWeight: 700,
                          }}
                        >
                          {classDetail.code}
                        </Tag>
                      )}
                    </Space>

                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      {classDetail.category || "Chưa phân loại"}
                    </Text>
                  </Space>
                </Col>

                <Col>
                  <StatusTag status={classDetail.status} />
                </Col>
              </Row>

              <Row
                gutter={12}
                style={{
                  marginTop: 22,
                }}
              >
                <Col xs={12}>
                  <div
                    style={{
                      padding: 17,
                      borderRadius: 16,
                      background: `${primaryNavy}07`,
                      border: `1px solid ${primaryNavy}08`,
                    }}
                  >
                    <Space size={7}>
                      <TeamOutlined
                        style={{
                          color: primaryNavy,
                        }}
                      />

                      <Text
                        type="secondary"
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        HỌC VIÊN
                      </Text>
                    </Space>

                    <Text
                      strong
                      style={{
                        display: "block",
                        color: primaryNavy,
                        fontSize: 28,
                        lineHeight: 1,
                        marginTop: 7,
                      }}
                    >
                      {Number(classDetail.studentsCount || 0)}
                    </Text>

                    <Progress
                      percent={Math.min(
                        100,
                        Number(classDetail.studentsCount || 0) * 2,
                      )}
                      showInfo={false}
                      size="small"
                      strokeColor={primaryNavy}
                      style={{
                        margin: "9px 0 0",
                      }}
                    />
                  </div>
                </Col>

                <Col xs={12}>
                  <div
                    style={{
                      padding: 17,
                      borderRadius: 16,
                      background: `${accentGold}0D`,
                      border: `1px solid ${accentGold}12`,
                    }}
                  >
                    <Space size={7}>
                      <UsergroupAddOutlined
                        style={{
                          color: "#9A771B",
                        }}
                      />

                      <Text
                        type="secondary"
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        GIÁO LÝ VIÊN
                      </Text>
                    </Space>

                    <Text
                      strong
                      style={{
                        display: "block",
                        color: "#9A771B",
                        fontSize: 28,
                        lineHeight: 1,
                        marginTop: 7,
                      }}
                    >
                      {classDetail.catechists?.length || 0}
                    </Text>

                    <Text
                      type="secondary"
                      style={{
                        fontSize: 10,
                        display: "block",
                        marginTop: 7,
                      }}
                    >
                      Đang được phân công
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>

            {/* INFORMATION */}

            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                marginBottom: 16,
                boxShadow: "0 5px 20px rgba(15,23,42,0.025)",
              }}
            >
              <SectionTitle
                icon={<BookOutlined />}
                title="Thông tin lớp học"
                description="Lịch học và thông tin cơ bản"
              />

              <Descriptions
                column={1}
                size="small"
                labelStyle={{
                  color: textMuted,
                  width: 125,
                }}
                contentStyle={{
                  color: textDark,
                  fontWeight: 500,
                }}
              >
                <Descriptions.Item label="Lịch học">
                  <Space size={7}>
                    <CalendarFilled
                      style={{
                        color: accentGold,
                      }}
                    />

                    {getDayName(classDetail.day_of_week)}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Thời gian">
                  <Space size={7}>
                    <ClockCircleOutlined
                      style={{
                        color: accentGold,
                      }}
                    />

                    {formatTime(classDetail.start_time)}

                    {" - "}

                    {formatTime(classDetail.end_time)}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Phòng học">
                  <Space size={7}>
                    <EnvironmentOutlined
                      style={{
                        color: accentGold,
                      }}
                    />

                    {classDetail.room || "Chưa cập nhật"}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Thời gian khóa">
                  <Space size={7} wrap>
                    <CalendarOutlined
                      style={{
                        color: primaryNavy,
                      }}
                    />

                    {formatDate(classDetail.start_date)}

                    <ArrowRightOutlined
                      style={{
                        color: textLight,
                      }}
                    />

                    {classDetail.end_date
                      ? formatDate(classDetail.end_date)
                      : "Chưa xác định"}
                  </Space>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Space
                size={8}
                style={{
                  marginBottom: 7,
                }}
              >
                <FileTextOutlined
                  style={{
                    color: accentGold,
                  }}
                />

                <Text
                  strong
                  style={{
                    color: primaryNavy,
                  }}
                >
                  Mô tả
                </Text>
              </Space>

              <Paragraph
                style={{
                  color: textMuted,
                  marginBottom: 0,
                  lineHeight: 1.75,
                  fontSize: 12,
                }}
              >
                {classDetail.description || "Chưa có mô tả cho lớp học này."}
              </Paragraph>
            </Card>

            {/* CATECHISTS */}

            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                boxShadow: "0 5px 20px rgba(15,23,42,0.025)",
              }}
            >
              <SectionTitle
                icon={<UserSwitchOutlined />}
                title="Giáo lý viên phụ trách"
                description="Danh sách Giáo lý viên được phân công"
                count={classDetail.catechists?.length || 0}
              />

              {!classDetail.catechists ||
              classDetail.catechists.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa phân công Giáo lý viên"
                />
              ) : (
                <Space
                  direction="vertical"
                  size={12}
                  style={{
                    width: "100%",
                  }}
                >
                  {classDetail.catechists.map((catechist, index) => (
                    <CatechistItem
                      key={
                        catechist.assignment_id ||
                        catechist.catechist_id ||
                        index
                      }
                      catechist={catechist}
                      index={index}
                    />
                  ))}
                </Space>
              )}
            </Card>
          </div>
        )}
      </Drawer>

      {/* =================================================
          GLOBAL DELETE LOADING
      ================================================= */}

      {deletingId && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 9999,
            padding: "12px 17px",
            borderRadius: 13,
            background: white,
            boxShadow: "0 8px 30px rgba(15,23,42,.15)",
            border: `1px solid ${borderColor}`,
          }}
        >
          <Space>
            <Spin size="small" />

            <Text
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: textDark,
              }}
            >
              Đang xóa lớp học...
            </Text>
          </Space>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
