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
  CheckCircleOutlined,
  StopOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  UserSwitchOutlined,
  FilterOutlined,
  HeartFilled,
  StarFilled,
  SmileOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import { useUser } from "../../../context/UserContext";
import usePermission from "../../../hooks/usePermission";
import { useNotification } from "../../../components/notification";

import AppFormModal from "../../../components/common/AppFormModal";
import ClassForm from "./components/ClassForm";
import StatCard from "../../../components/common/StatCard";
import ClassCard from "./components/ClassCard";
import ClassDetailSkeleton from "./components/ClassDetailSkeleton";
import PageHeroHeader from "../../../components/common/PageHeroHeader";
import AppSearchInput from "../../../components/common/SearchInput";

import classApi from "../../../api/classApi";
import catechistApi from "../../../api/catechistApi";

const { Text } = Typography;

/* =========================================================
   COLORS
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
   DAY
========================================================= */

const DAY_NAMES = {
  1: "Thứ Hai",
  2: "Thứ Ba",
  3: "Thứ Tư",
  4: "Thứ Năm",
  5: "Thứ Sáu",
  6: "Thứ Bảy",
  7: "Chúa Nhật",
};

const DAY_SHORT_NAMES = {
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
  7: "CN",
};
/* =========================================================
   CURRENT ACADEMIC YEAR
========================================================= */

const getCurrentAcademicYear = () => {
  const now = dayjs();

  const year = now.year();

  /*
   * Quy ước:
   *
   * Tháng 9 -> bắt đầu năm học mới
   *
   * Ví dụ:
   * 08/2026 -> 2025-2026
   * 09/2026 -> 2026-2027
   */

  if (now.month() + 1 >= 9) {
    return `${year}-${year + 1}`;
  }

  return `${year - 1}-${year}`;
};
/* =========================================================
   RESPONSE NORMALIZE
========================================================= */

const normalizeListResponse = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
};

const normalizeObjectResponse = (response) => {
  const data = response?.data;

  if (!data) {
    return null;
  }

  if (data?.data && !Array.isArray(data.data)) {
    return data.data;
  }

  return data;
};

/* =========================================================
   NORMALIZE SCHEDULES
========================================================= */

const normalizeSchedules = (schedules) => {
  if (!Array.isArray(schedules)) {
    return [];
  }

  return schedules
    .map((schedule) => ({
      ...schedule,

      id:
        schedule?.id !== undefined && schedule?.id !== null
          ? Number(schedule.id)
          : undefined,

      class_id:
        schedule?.class_id !== undefined && schedule?.class_id !== null
          ? Number(schedule.class_id)
          : undefined,

      day_of_week: Number(schedule?.day_of_week),

      start_time: schedule?.start_time
        ? String(schedule.start_time).slice(0, 5)
        : "",

      end_time: schedule?.end_time ? String(schedule.end_time).slice(0, 5) : "",

      room: schedule?.room || "",
    }))
    .filter(
      (schedule) =>
        Number.isInteger(schedule.day_of_week) &&
        schedule.day_of_week >= 1 &&
        schedule.day_of_week <= 7,
    )
    .sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) {
        return a.day_of_week - b.day_of_week;
      }

      return String(a.start_time).localeCompare(String(b.start_time));
    });
};

/* =========================================================
   FORMAT
========================================================= */

const formatTime = (time) => {
  if (!time) {
    return "—";
  }

  return String(time).slice(0, 5);
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = dayjs(date);

  if (!parsed.isValid()) {
    return "—";
  }

  return parsed.format("DD/MM/YYYY");
};

const getDayName = (day) => {
  return DAY_NAMES[Number(day)] || "Chưa cập nhật";
};

/* =========================================================
   STATUS
========================================================= */

const getStatusConfig = (status) => {
  const configs = {
    active: {
      label: "Đang hoạt động",
      color: COLORS.success,
      bg: COLORS.successBg,
      border: "#C8E6D7",
      icon: <CheckCircleOutlined />,
    },

    completed: {
      label: "Đã kết thúc",
      color: COLORS.gray,
      bg: COLORS.grayBg,
      border: "#E2E8F0",
      icon: <StopOutlined />,
    },

    cancelled: {
      label: "Đã hủy",
      color: COLORS.danger,
      bg: COLORS.dangerBg,
      border: "#F5C6C2",
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
   SCHEDULE ITEM
========================================================= */

const ScheduleItem = ({ schedule, compact = false }) => {
  return (
    <div
      style={{
        padding: compact ? "9px 10px" : 12,
        borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.background,
      }}
    >
      <Row gutter={[8, 6]} align="middle">
        <Col flex="auto">
          <Space size={7}>
            <div
              style={{
                minWidth: 34,
                height: 28,
                padding: "0 7px",
                borderRadius: 7,
                background: COLORS.navy,
                color: COLORS.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {DAY_SHORT_NAMES[schedule.day_of_week] || "—"}
            </div>

            <Text
              strong
              style={{
                color: COLORS.text,
                fontSize: compact ? 12 : 13,
                fontWeight: 800,
              }}
            >
              {getDayName(schedule.day_of_week)}
            </Text>
          </Space>
        </Col>

        <Col>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.navy,
              fontWeight: 800,
            }}
          >
            <ClockCircleOutlined
              style={{
                marginRight: 4,
                color: COLORS.gold,
              }}
            />
            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
          </Text>
        </Col>
      </Row>

      {schedule.room && (
        <div
          style={{
            marginTop: 7,
            paddingLeft: 41,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: COLORS.textSecondary,
              fontWeight: 600,
            }}
          >
            <EnvironmentOutlined
              style={{
                marginRight: 5,
                color: COLORS.gold,
              }}
            />

            {schedule.room}
          </Text>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   SCHEDULE LIST
========================================================= */

const ScheduleList = ({ schedules = [], compact = false }) => {
  const normalized = normalizeSchedules(schedules);

  if (!normalized.length) {
    return (
      <Text
        style={{
          color: COLORS.muted,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Chưa có lịch học
      </Text>
    );
  }

  return (
    <Space
      direction="vertical"
      size={compact ? 6 : 8}
      style={{
        width: "100%",
      }}
    >
      {normalized.map((schedule, index) => (
        <ScheduleItem
          key={schedule.id || `${schedule.day_of_week}-${index}`}
          schedule={schedule}
          compact={compact}
        />
      ))}
    </Space>
  );
};

/* =========================================================
   CLASS SKELETON
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

const CatechistItem = ({ catechist, index, onRemove, removing }) => {
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
   MAIN
========================================================= */

const ClassManagement = () => {
  const notify = useNotification();

  const { user } = useUser();

  const churchId = user?.church_id;

  const { canCreateClass, canEditClass, canDeleteClass } = usePermission();

  /* =====================================================
     STATE
  ===================================================== */

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
  const [academicYearFilter, setAcademicYearFilter] = useState(
    getCurrentAcademicYear(),
  );
  /* =====================================================
     LOAD CLASSES
  ===================================================== */

  const fetchClasses = useCallback(
    async (showMessage = false) => {
      try {
        setLoading(true);

        const response = await classApi.getAll();

        const data = normalizeListResponse(response);

        const normalizedData = data.map((item) => ({
          ...item,

          id: Number(item.id),

          church_id:
            item.church_id !== undefined ? Number(item.church_id) : undefined,

          level_order:
            item.level_order !== null && item.level_order !== undefined
              ? Number(item.level_order)
              : null,

          studentsCount: Number(item.studentsCount || 0),

          schedules: normalizeSchedules(item.schedules),

          catechists: Array.isArray(item.catechists) ? item.catechists : [],
        }));

        setClassesList(normalizedData);

        if (showMessage) {
          notify.success("Đã làm mới danh sách lớp học");
        }
      } catch (error) {
        notify.error(
          error?.response?.data?.message || "Không thể tải danh sách lớp học",
        );
      } finally {
        setLoading(false);
      }
    },
    [notify],
  );

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    if (!churchId) {
      return;
    }

    fetchClasses();
  }, [churchId, fetchClasses]);

  /* =====================================================
     FORM INIT
  ===================================================== */

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    if (editingClass) {
      form.setFieldsValue({
        name: editingClass.name || "",

        category: editingClass.category || "Giáo lý Thiếu Nhi",

        academic_year: editingClass.academic_year || "",

        description: editingClass.description || "",

        schedules: normalizeSchedules(editingClass.schedules).map(
          (schedule) => ({
            day_of_week: schedule.day_of_week,

            start_time: schedule.start_time
              ? dayjs(schedule.start_time, "HH:mm")
              : null,

            end_time: schedule.end_time
              ? dayjs(schedule.end_time, "HH:mm")
              : null,

            room: schedule.room || "",
          }),
        ),

        start_date: editingClass.start_date
          ? dayjs(editingClass.start_date)
          : null,

        end_date: editingClass.end_date ? dayjs(editingClass.end_date) : null,

        status: editingClass.status || "active",
      });
    } else {
      form.resetFields();

      form.setFieldsValue({
        category: "Giáo lý Thiếu Nhi",
        academic_year: getCurrentAcademicYear(),
        status: "active",

        schedules: [],
      });
    }
  }, [editingClass, isModalOpen, form]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  /* =====================================================
   STATISTICS
===================================================== */

  const statistics = useMemo(() => {
    /*
     * Thống kê theo đúng năm học đang được chọn.
     */

    const statisticClasses = classesList.filter((item) => {
      if (academicYearFilter === "all") {
        return true;
      }

      return String(item.academic_year || "").trim() === academicYearFilter;
    });

    const totalClasses = statisticClasses.length;

    const activeClasses = statisticClasses.filter(
      (item) => item.status === "active",
    ).length;

    const completedClasses = statisticClasses.filter(
      (item) => item.status === "completed",
    ).length;

    const cancelledClasses = statisticClasses.filter(
      (item) => item.status === "cancelled",
    ).length;

    const totalStudents = statisticClasses.reduce(
      (total, item) => total + Number(item.studentsCount || 0),
      0,
    );

    const totalCatechists = statisticClasses.reduce(
      (total, item) => total + Number(item.catechists?.length || 0),
      0,
    );

    return {
      totalClasses,
      activeClasses,
      completedClasses,
      cancelledClasses,
      totalStudents,
      totalCatechists,
    };
  }, [classesList, academicYearFilter]);
  /* =====================================================
     FILTER
  ===================================================== */

  /* =====================================================
   ACADEMIC YEARS
===================================================== */

  const academicYears = useMemo(() => {
    const currentYear = getCurrentAcademicYear();

    const years = classesList
      .map((item) => item.academic_year)
      .filter(Boolean)
      .map((year) => String(year).trim())
      .filter(Boolean);

    /*
     * Luôn đảm bảo năm học hiện tại xuất hiện
     * trong bộ lọc, kể cả giáo xứ chưa có lớp.
     */

    const uniqueYears = Array.from(new Set([currentYear, ...years]));

    return uniqueYears.sort((a, b) => {
      const startA = Number(String(a).split("-")[0]);
      const startB = Number(String(b).split("-")[0]);

      return startB - startA;
    });
  }, [classesList]);

  /* =====================================================
   FILTER
===================================================== */

  const filteredClasses = useMemo(() => {
    const keyword = searchText.toLowerCase().trim();

    return classesList.filter((item) => {
      /*
       * ===================================================
       * YEAR FILTER
       * ===================================================
       *
       * Mặc định:
       * getCurrentAcademicYear()
       *
       * Khi user chọn năm khác:
       * chỉ hiện lớp của năm đó.
       */

      const matchAcademicYear =
        academicYearFilter === "all" ||
        String(item.academic_year || "").trim() === academicYearFilter;

      /*
       * ===================================================
       * SEARCH
       * ===================================================
       */

      const schedules = normalizeSchedules(item.schedules);

      const scheduleSearchText = schedules
        .map(
          (schedule) =>
            `${getDayName(schedule.day_of_week)} ${
              schedule.room || ""
            } ${formatTime(schedule.start_time)} ${formatTime(
              schedule.end_time,
            )}`,
        )
        .join(" ")
        .toLowerCase();

      const matchSearch =
        !keyword ||
        item.name?.toLowerCase().includes(keyword) ||
        item.code?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.academic_year?.toLowerCase().includes(keyword) ||
        String(item.level_order || "").includes(keyword) ||
        scheduleSearchText.includes(keyword);

      /*
       * ===================================================
       * STATUS
       * ===================================================
       */

      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchAcademicYear && matchSearch && matchStatus;
    });
  }, [classesList, searchText, statusFilter, academicYearFilter]);
  /* =====================================================
     CREATE
  ===================================================== */

  const handleCreate = useCallback(() => {
    if (saving) {
      return;
    }

    setEditingClass(null);
    setIsModalOpen(true);
  }, [saving]);

  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = useCallback(
    (item) => {
      if (saving) {
        return;
      }

      setEditingClass(item);
      setIsModalOpen(true);
    },
    [saving],
  );

  /* =====================================================
     CLOSE FORM
  ===================================================== */

  const closeModal = useCallback(() => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);

    setEditingClass(null);

    form.resetFields();
  }, [form, saving]);

  /* =====================================================
     NORMALIZE FORM SCHEDULES
  ===================================================== */

  const buildSchedulesPayload = (schedules) => {
    if (!Array.isArray(schedules)) {
      return [];
    }

    return schedules
      .filter(
        (schedule) =>
          schedule &&
          schedule.day_of_week &&
          schedule.start_time &&
          schedule.end_time,
      )
      .map((schedule) => ({
        day_of_week: Number(schedule.day_of_week),

        start_time: schedule.start_time.format("HH:mm:ss"),

        end_time: schedule.end_time.format("HH:mm:ss"),

        room: schedule.room?.trim() || null,
      }));
  };

  /* =====================================================
     VALIDATE SCHEDULES
  ===================================================== */

  const validateSchedules = (schedules) => {
    for (const schedule of schedules) {
      if (schedule.day_of_week < 1 || schedule.day_of_week > 7) {
        return "Thứ trong tuần không hợp lệ";
      }

      if (schedule.start_time >= schedule.end_time) {
        return "Giờ kết thúc phải lớn hơn giờ bắt đầu";
      }
    }

    const keys = schedules.map(
      (schedule) => `${schedule.day_of_week}-${schedule.start_time}`,
    );

    if (new Set(keys).size !== keys.length) {
      return "Lịch học bị trùng thứ và giờ bắt đầu";
    }

    return null;
  };

  /* =====================================================
     SAVE CLASS
  ===================================================== */

  const handleSave = useCallback(
    async (values) => {
      if (saving) {
        return;
      }

      if (!churchId) {
        notify.error("Không xác định được giáo xứ của tài khoản");

        return;
      }

      try {
        setSaving(true);

        const schedules = buildSchedulesPayload(values.schedules);

        const scheduleError = validateSchedules(schedules);

        if (scheduleError) {
          notify.error(scheduleError);

          return;
        }

        /*
         * IMPORTANT:
         *
         * KHÔNG gửi level_order.
         *
         * Backend tự sinh level_order
         * để đảm bảo toàn hệ thống
         * nhất quán.
         */

        const payload = {
          name: values.name?.trim(),

          church_id: churchId,

          category: values.category || "Giáo lý Thiếu Nhi",

          academic_year: values.academic_year || null,

          description: values.description?.trim() || null,

          start_date: values.start_date
            ? values.start_date.format("YYYY-MM-DD")
            : null,

          end_date: values.end_date
            ? values.end_date.format("YYYY-MM-DD")
            : null,

          status: values.status || "active",

          schedules,
        };

        /* =================================================
           CREATE
        ================================================= */

        if (!editingClass) {
          const response = await classApi.create(payload);

          const createdData = normalizeObjectResponse(response);

          const generatedCode = createdData?.code;

          notify.success(
            generatedCode
              ? `Tạo lớp thành công • Mã lớp: ${generatedCode}`
              : "Tạo lớp học thành công",
          );
        } else {
          /* ===============================================
             UPDATE
          =============================================== */

          await classApi.update(editingClass.id, payload);

          notify.success("Cập nhật lớp học thành công");
        }

        /*
         * ĐÓNG FORM
         */

        setIsModalOpen(false);

        setEditingClass(null);

        form.resetFields();

        /*
         * QUAN TRỌNG:
         *
         * Sau CREATE / UPDATE
         * luôn lấy lại dữ liệu thật
         * từ database.
         */

        await fetchClasses();
      } catch (error) {
        notify.error(error?.response?.data?.message || "Không thể lưu lớp học");
      } finally {
        setSaving(false);
      }
    },
    [saving, churchId, notify, editingClass, form, fetchClasses],
  );

  /* =====================================================
     DELETE CLASS
  ===================================================== */

  const handleDelete = useCallback(
    (item) => {
      if (deletingId !== null) {
        return;
      }

      notify.confirm({
        title: "Xác nhận xóa lớp học",

        icon: (
          <DeleteOutlined
            style={{
              color: COLORS.danger,
            }}
          />
        ),

        content: (
          <div
            style={{
              marginTop: 10,
            }}
          >
            <Text>
              Bạn có chắc chắn muốn xóa lớp <strong>{item.name}</strong>?
            </Text>

            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 10,
                background: COLORS.dangerBg,
                border: "1px solid #F5C6C2",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.danger,
                }}
              >
                Lịch học và các dữ liệu liên quan sẽ được xử lý theo chính sách
                xóa của hệ thống.
              </Text>
            </div>
          </div>
        ),

        okText: "Xóa lớp",

        cancelText: "Hủy",

        danger: true,

        cancelButtonProps: {
          style: {
            borderRadius: 8,
          },
        },

        onConfirm: async () => {
          try {
            setDeletingId(Number(item.id));

            /*
             * GỌI DELETE API
             */

            await classApi.remove(Number(item.id));

            notify.success("Đã xóa lớp học thành công");

            /*
             * ĐÓNG DETAIL NẾU ĐANG MỞ
             * VÀ DETAIL ĐANG LÀ LỚP VỪA XÓA
             */

            if (Number(classDetail?.id) === Number(item.id)) {
              setDetailOpen(false);
              setClassDetail(null);
            }

            /*
             * QUAN TRỌNG NHẤT:
             *
             * KHÔNG:
             *
             * setClassesList(prev =>
             *   prev.filter(...)
             * )
             *
             * Mà load lại từ DATABASE.
             */

            await fetchClasses();
          } catch (error) {
            notify.error(
              error?.response?.data?.message || "Không thể xóa lớp học",
            );
          } finally {
            setDeletingId(null);
          }
        },
      });
    },
    [deletingId, notify, classDetail, fetchClasses],
  );

  /* =====================================================
     VIEW DETAIL
  ===================================================== */

  const handleViewDetail = useCallback(
    async (item) => {
      try {
        setDetailOpen(true);

        setDetailLoading(true);

        setClassDetail(null);

        const response = await classApi.getById(item.id);

        const detail = normalizeObjectResponse(response);

        if (detail) {
          detail.id = Number(detail.id);

          detail.level_order =
            detail.level_order !== null && detail.level_order !== undefined
              ? Number(detail.level_order)
              : null;

          detail.schedules = normalizeSchedules(detail.schedules);

          detail.catechists = Array.isArray(detail.catechists)
            ? detail.catechists
            : [];
        }

        setClassDetail(detail);
      } catch (error) {
        notify.error(
          error?.response?.data?.message || "Không thể tải thông tin lớp học",
        );

        setDetailOpen(false);
      } finally {
        setDetailLoading(false);
      }
    },
    [notify],
  );

  /* =====================================================
     REMOVE CATECHIST
  ===================================================== */

  const handleRemoveCatechist = useCallback(
    (catechist) => {
      const classId = classDetail?.id;

      const catechistId = catechist?.catechist_id ?? catechist?.id;

      if (!classId) {
        notify.error("Không xác định được lớp học");

        return;
      }

      if (!catechistId) {
        notify.error("Không xác định được giáo lý viên");

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
          <div
            style={{
              marginTop: 10,
            }}
          >
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
                border: "1px solid #EBD9A8",
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
            setRemovingCatechistId(Number(catechistId));

            await catechistApi.removeClass({
              catechist_id: Number(catechistId),

              class_id: Number(classId),
            });

            notify.success(`Đã xóa ${catechist.full_name} khỏi lớp`);

            /*
             * LOAD LẠI DETAIL
             */

            const response = await classApi.getById(classId);

            const updatedDetail = normalizeObjectResponse(response);

            if (updatedDetail) {
              updatedDetail.schedules = normalizeSchedules(
                updatedDetail.schedules,
              );

              updatedDetail.catechists = Array.isArray(updatedDetail.catechists)
                ? updatedDetail.catechists
                : [];
            }

            setClassDetail(updatedDetail);

            /*
             * LOAD LẠI DANH SÁCH
             */

            await fetchClasses();
          } catch (error) {
            notify.error(
              error?.response?.data?.message ||
                "Không thể xóa giáo lý viên khỏi lớp",
            );
          } finally {
            setRemovingCatechistId(null);
          }
        },
      });
    },
    [classDetail, fetchClasses, notify],
  );

  /* =====================================================
     CLOSE DETAIL
  ===================================================== */

  const closeDetail = useCallback(() => {
    if (detailLoading) {
      return;
    }

    setDetailOpen(false);

    setClassDetail(null);
  }, [detailLoading]);

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
      {/* =================================================
          HERO
      ================================================= */}

      <PageHeroHeader
        icon={<BookOutlined />}
        badgeText="QUẢN LÝ GIÁO LÝ"
        title="Quản lý lớp học"
        description="Theo dõi lớp học, năm học, lịch học hàng tuần, học viên và Giáo lý viên phụ trách."
        onRefresh={() => fetchClasses(true)}
        refreshLoading={loading}
        primaryButtonText={canCreateClass ? "Tạo lớp mới" : undefined}
        primaryButtonIcon={canCreateClass ? <PlusOutlined /> : undefined}
        onPrimaryClick={canCreateClass ? handleCreate : undefined}
        primaryDisabled={loading || saving || !canCreateClass}
      />

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

      {/* =================================================
          SEARCH / FILTER
      ================================================= */}

      {/* =================================================
    SEARCH / FILTER
================================================= */}

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
          {/* =================================================
        SEARCH
    ================================================= */}

          <Col xs={24} lg={10}>
            <AppSearchInput
              value={searchText}
              onChange={setSearchText}
              placeholder="Tìm tên lớp, mã lớp, cấp lớp, chương trình, phòng học..."
            />
          </Col>

          {/* =================================================
        ACADEMIC YEAR
    ================================================= */}

          <Col xs={24} sm={12} lg={7}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 40,
                padding: "0 12px",
                borderRadius: 9,
                background: COLORS.background,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <CalendarOutlined
                style={{
                  color: COLORS.gold,
                  fontSize: 15,
                }}
              />

              <select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                style={{
                  width: "100%",
                  height: 36,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: COLORS.navy,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    Năm học {year}
                  </option>
                ))}

                <option value="all">Tất cả năm học</option>
              </select>
            </div>
          </Col>

          {/* =================================================
        STATUS
    ================================================= */}

          <Col xs={24} sm={12} lg={7}>
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
                  label: "Kết thúc",
                  value: "completed",
                },
                {
                  label: "Đã hủy",
                  value: "cancelled",
                },
              ]}
            />
          </Col>
        </Row>

        {/* =================================================
      CURRENT FILTER INFO
  ================================================= */}

        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <Space wrap size={[8, 6]}>
            <Text
              style={{
                fontSize: 11,
                color: COLORS.muted,
                fontWeight: 600,
              }}
            >
              Đang xem:
            </Text>

            <Tag
              style={{
                margin: 0,
                borderRadius: 7,
                background: COLORS.goldLight,
                border: "1px solid #EBD9A8",
                color: COLORS.navy,
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 9px",
              }}
            >
              {academicYearFilter === "all"
                ? "Tất cả năm học"
                : `Năm học ${academicYearFilter}`}
            </Tag>

            <Tag
              style={{
                margin: 0,
                borderRadius: 7,
                background: COLORS.navyLight,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.navy,
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 9px",
              }}
            >
              {filteredClasses.length} lớp
            </Tag>
          </Space>
        </div>
      </Card>

      {/* =================================================
          LIST HEADER
      ================================================= */}

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

      {/* =================================================
          CLASS GRID
      ================================================= */}

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
            {canCreateClass && (
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
            )}
          </Empty>
        </Card>
      )}

      {/* =================================================
          FORM
      ================================================= */}

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

      {/* =================================================
          DETAIL
      ================================================= */}

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

              <Space
                size={5}
                style={{
                  marginTop: 3,
                }}
              >
                {classDetail?.code && (
                  <Tag
                    style={{
                      margin: 0,
                      borderRadius: 6,
                      background: COLORS.goldLight,
                      color: COLORS.navy,
                      border: "1px solid #EBD9A8",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {classDetail.code}
                  </Tag>
                )}

                {classDetail?.academic_year && (
                  <Tag
                    style={{
                      margin: 0,
                      borderRadius: 6,
                      background: COLORS.navyLight,
                      color: COLORS.navy,
                      border: `1px solid ${COLORS.border}`,
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    Năm học {classDetail.academic_year}
                  </Tag>
                )}
              </Space>
            </div>
          </Space>
        }
        width={540}
        open={detailOpen}
        onClose={closeDetail}
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
            {/* =========================================
                OVERVIEW
            ========================================= */}

            <SectionTitle
              icon={<StarFilled />}
              title="Thông tin tổng quan"
              description="Thông tin cơ bản của lớp học"
            />

            <Descriptions
              column={{
                xs: 1,
                sm: 1,
                md: 2,
                lg: 2,
                xl: 2,
                xxl: 2,
              }}
              bordered
              size="small"
              style={{
                marginBottom: 24,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <Descriptions.Item label="Năm học">
                {classDetail.academic_year || "Chưa cập nhật"}
              </Descriptions.Item>

              <Descriptions.Item label="Cấp lớp">
                {classDetail.level_order !== null &&
                classDetail.level_order !== undefined
                  ? `Cấp ${classDetail.level_order}`
                  : "Chưa xác định"}
              </Descriptions.Item>

              <Descriptions.Item label="Chương trình">
                {classDetail.category || "Chưa cập nhật"}
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

              <Descriptions.Item label="Học viên">
                <Text
                  strong
                  style={{
                    color: COLORS.navy,
                  }}
                >
                  {Number(classDetail.studentsCount || 0)} học viên
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Giáo lý viên">
                <Text
                  strong
                  style={{
                    color: COLORS.navy,
                  }}
                >
                  {classDetail.catechists?.length || 0} người
                </Text>
              </Descriptions.Item>

              {classDetail.description && (
                <Descriptions.Item label="Mô tả" span={2}>
                  {classDetail.description}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* =========================================
                SCHEDULES
            ========================================= */}

            <SectionTitle
              icon={<CalendarOutlined />}
              title="Lịch học hàng tuần"
              description="Lịch học được lặp lại mỗi tuần"
              count={normalizeSchedules(classDetail.schedules).length}
            />

            <div
              style={{
                marginBottom: 24,
              }}
            >
              {normalizeSchedules(classDetail.schedules).length > 0 ? (
                <ScheduleList schedules={classDetail.schedules} />
              ) : (
                <div
                  style={{
                    padding: 24,
                    borderRadius: 12,
                    background: COLORS.white,
                    border: `1px dashed ${COLORS.border}`,
                    textAlign: "center",
                  }}
                >
                  <CalendarOutlined
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
                    Chưa có lịch học
                  </Text>
                </div>
              )}
            </div>

            {/* =========================================
                CATECHISTS
            ========================================= */}

            <SectionTitle
              icon={<HeartFilled />}
              title="Giáo lý viên phụ trách"
              count={classDetail.catechists?.length || 0}
            />

            {classDetail.catechists?.length > 0 ? (
              classDetail.catechists.map((catechist, index) => {
                const catechistId = catechist?.catechist_id ?? catechist?.id;

                return (
                  <CatechistItem
                    key={catechistId || index}
                    catechist={catechist}
                    index={index}
                    onRemove={handleRemoveCatechist}
                    removing={removingCatechistId === Number(catechistId)}
                  />
                );
              })
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

      {/* =================================================
          STYLE
      ================================================= */}

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
