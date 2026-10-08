import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Card,
  Col,
  Empty,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import academicYearApi from "../../../api/academicYearApi";
import PageHeroHeader from "../../../components/common/PageHeroHeader";
import AppButton from "../../../components/common/AppButton";
import AppSearchInput from "../../../components/common/SearchInput";

const { Title, Text, Paragraph } = Typography;

// ============================================================

// CONSTANTS

// ============================================================

const CURRENT_YEAR = new Date().getFullYear();

const PAGE_SIZE = 20;

// ============================================================

// HELPERS

// ============================================================

const buildAcademicYear = (year) => {
  const value = Number(year);

  if (!Number.isInteger(value)) {
    return "";
  }

  return `${value}-${value + 1}`;
};

const getYearNumber = (academicYear) => {
  if (!academicYear) {
    return null;
  }

  const match = String(academicYear).match(/^(\d{4})-(\d{4})$/);

  if (!match) {
    return null;
  }

  const start = Number(match[1]);

  const end = Number(match[2]);

  if (end !== start + 1) {
    return null;
  }

  return start;
};

const getNextAcademicYear = (academicYear) => {
  const year = getYearNumber(academicYear);

  if (year === null) {
    return null;
  }

  return buildAcademicYear(year + 1);
};

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.message || fallback;
};

const normalizeId = (value) => {
  const number = Number(value);

  return Number.isInteger(number) ? number : null;
};

// ============================================================

// COMPONENT

// ============================================================

const AcademicYearPage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  // ==========================================================

  // STEP

  // ==========================================================

  const [currentStep, setCurrentStep] = useState(0);

  // ==========================================================

  // YEAR

  // ==========================================================

  const [fromAcademicYear, setFromAcademicYear] = useState(
    buildAcademicYear(CURRENT_YEAR),
  );

  const [toAcademicYear, setToAcademicYear] = useState(
    buildAcademicYear(CURRENT_YEAR + 1),
  );

  // ==========================================================

  // LOADING

  // ==========================================================

  const [previewCreateLoading, setPreviewCreateLoading] = useState(false);

  const [createLoading, setCreateLoading] = useState(false);

  const [previewPromotionLoading, setPreviewPromotionLoading] = useState(false);

  const [confirmLoading, setConfirmLoading] = useState(false);

  // ==========================================================

  // DATA

  // ==========================================================

  const [createPreview, setCreatePreview] = useState(null);

  const [promotionPreview, setPromotionPreview] = useState(null);

  const [confirmResult, setConfirmResult] = useState(null);

  // ==========================================================

  // FILTER

  // ==========================================================

  const [studentKeyword, setStudentKeyword] = useState("");

  const [studentStatusFilter, setStudentStatusFilter] = useState("all");

  const [sourceClassFilter, setSourceClassFilter] = useState("all");

  // ==========================================================

  // YEAR OPTIONS

  // ==========================================================

  const academicYearOptions = useMemo(() => {
    const years = [];

    for (let year = CURRENT_YEAR - 5; year <= CURRENT_YEAR + 4; year += 1) {
      years.push({
        label: buildAcademicYear(year),

        value: buildAcademicYear(year),
      });
    }

    return years.reverse();
  }, []);

  // ==========================================================

  // TARGET CLASS OPTIONS

  // ==========================================================

  const targetClassOptions = useMemo(() => {
    if (!promotionPreview) {
      return [];
    }

    const map = new Map();

    (promotionPreview.classes || []).forEach((item) => {
      if (!item?.destination?.id) {
        return;
      }

      const destination = item.destination;

      map.set(Number(destination.id), destination);
    });

    return Array.from(map.values())

      .sort((a, b) => {
        const levelA = Number(a.level_order ?? 9999);

        const levelB = Number(b.level_order ?? 9999);

        if (levelA !== levelB) {
          return levelA - levelB;
        }

        return String(a.name || "").localeCompare(String(b.name || ""), "vi");
      })

      .map((item) => ({
        value: Number(item.id),

        label: item.name,

        code: item.code,

        level: item.level_order,
      }));
  }, [promotionPreview]);

  // ==========================================================

  // SOURCE CLASS OPTIONS

  // ==========================================================

  const sourceClassOptions = useMemo(() => {
    if (!promotionPreview) {
      return [];
    }

    const map = new Map();

    (promotionPreview.students || []).forEach((student) => {
      const id = normalizeId(student.source_class_id);

      if (!id) {
        return;
      }

      if (!map.has(id)) {
        map.set(id, {
          value: id,

          label: student.source_class_name,

          code: student.source_class_code,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a.label || "").localeCompare(String(b.label || ""), "vi"),
    );
  }, [promotionPreview]);

  // ==========================================================

  // VALIDATE YEAR

  // ==========================================================

  const validateYears = useCallback(() => {
    const fromYear = getYearNumber(fromAcademicYear);

    const toYear = getYearNumber(toAcademicYear);

    if (fromYear === null || toYear === null) {
      messageApi.error("Năm học không hợp lệ.");

      return false;
    }

    if (toYear !== fromYear + 1) {
      messageApi.error(
        `Chỉ được chuyển từ ${fromAcademicYear} sang ${buildAcademicYear(
          fromYear + 1,
        )}.`,
      );

      return false;
    }

    return true;
  }, [fromAcademicYear, toAcademicYear, messageApi]);

  // ==========================================================

  // PREVIEW CREATE

  // ==========================================================

  const handlePreviewCreate = useCallback(async () => {
    if (!validateYears()) {
      return null;
    }

    setPreviewCreateLoading(true);

    try {
      const result = await academicYearApi.previewCreate({
        fromAcademicYear,

        toAcademicYear,
      });

      setCreatePreview(result);

      if (!result?.can_create) {
        messageApi.warning("Chưa thể khởi tạo năm học.");
      } else {
        messageApi.success("Kiểm tra năm học thành công.");
      }

      return result;
    } catch (error) {
      messageApi.error(getErrorMessage(error, "Không thể kiểm tra năm học."));

      return null;
    } finally {
      setPreviewCreateLoading(false);
    }
  }, [validateYears, fromAcademicYear, toAcademicYear, messageApi]);

  // ==========================================================

  // PREVIEW PROMOTION

  // ==========================================================

  const handlePreviewPromotion = useCallback(async () => {
    if (!validateYears()) {
      return null;
    }

    setPreviewPromotionLoading(true);

    try {
      const result = await academicYearApi.previewPromotion({
        fromAcademicYear,

        toAcademicYear,
      });

      setPromotionPreview(result);

      return result;
    } catch (error) {
      messageApi.error(
        getErrorMessage(error, "Không thể tạo dữ liệu phân lớp."),
      );

      return null;
    } finally {
      setPreviewPromotionLoading(false);
    }
  }, [validateYears, fromAcademicYear, toAcademicYear, messageApi]);

  // ==========================================================

  // CREATE YEAR

  // ==========================================================

  const handleCreateAcademicYear = useCallback(() => {
    if (!createPreview?.can_create) {
      return;
    }

    Modal.confirm({
      title: `Khởi tạo năm học ${toAcademicYear}?`,

      icon: <SafetyCertificateOutlined />,

      width: 520,

      content: (
        <div>
          <Paragraph>
            Hệ thống sẽ tạo cơ cấu lớp của năm <b>{toAcademicYear}</b> dựa trên
            năm <b>{fromAcademicYear}</b>.
          </Paragraph>

          <Alert
            type="info"
            showIcon
            message="Chưa chuyển học sinh"
            description={
              <>
                Hệ thống chỉ tạo <b>cơ cấu lớp</b>.
                <br />
                Học sinh sẽ được phân lớp ở bước tiếp theo.
                <br />
                Giáo lý viên và lịch học sẽ được cấu hình riêng.
              </>
            }
          />
        </div>
      ),

      okText: "Khởi tạo",

      cancelText: "Hủy",

      centered: true,

      onOk: async () => {
        setCreateLoading(true);

        try {
          const result = await academicYearApi.create({
            fromAcademicYear,

            toAcademicYear,
          });

          messageApi.success(result?.message || "Đã khởi tạo năm học.");

          setCurrentStep(1);

          setStudentKeyword("");

          setStudentStatusFilter("all");

          setSourceClassFilter("all");

          const previewResult = await handlePreviewPromotion();

          if (!previewResult) {
            return;
          }
        } catch (error) {
          messageApi.error(
            getErrorMessage(error, "Không thể khởi tạo năm học."),
          );
        } finally {
          setCreateLoading(false);
        }
      },
    });
  }, [
    createPreview,

    toAcademicYear,

    fromAcademicYear,

    messageApi,

    handlePreviewPromotion,
  ]);

  // ==========================================================

  // CHANGE DESTINATION

  // ==========================================================

  const updateStudentAssignment = useCallback(
    (studentId, destinationClassId, action = "promote") => {
      setPromotionPreview((previous) => {
        if (!previous) {
          return previous;
        }

        const normalizedStudentId = Number(studentId);

        const normalizedDestinationId =
          destinationClassId === null ||
          destinationClassId === undefined ||
          destinationClassId === ""
            ? null
            : Number(destinationClassId);

        const destination = normalizedDestinationId
          ? (previous.classes || [])

              .map((item) => item?.destination)

              .find((item) => Number(item?.id) === normalizedDestinationId)
          : null;

        const nextStudents = (previous.students || []).map((student) => {
          if (Number(student.student_id) !== normalizedStudentId) {
            return student;
          }

          if (!destination) {
            return {
              ...student,

              destination_class_id: null,

              destination_class_name: null,

              destination_class_code: null,

              destination_level_order: null,

              action: "unassigned",

              reason: "MANUAL",
            };
          }

          return {
            ...student,

            destination_class_id: Number(destination.id),

            destination_class_name: destination.name,

            destination_class_code: destination.code,

            destination_level_order: destination.level_order,

            action,

            reason: "MANUAL",
          };
        });

        const promoteCount = nextStudents.filter(
          (item) => item.action === "promote",
        ).length;

        const stayCount = nextStudents.filter(
          (item) => item.action === "stay",
        ).length;

        const unassignedCount = nextStudents.filter(
          (item) => item.action === "unassigned",
        ).length;

        return {
          ...previous,

          students: nextStudents,

          summary: {
            ...previous.summary,

            promote_count: promoteCount,

            stay_count: stayCount,

            unassigned_count: unassignedCount,
          },
        };
      });
    },

    [],
  );

  // ==========================================================

  // CHANGE STUDENT CLASS

  // ==========================================================

  const handleChangeStudentClass = useCallback(
    (studentId, destinationClassId) => {
      updateStudentAssignment(studentId, destinationClassId, "promote");
    },

    [updateStudentAssignment],
  );

  // ==========================================================

  // STAY

  // ==========================================================

  const handleStayStudent = useCallback((studentId) => {
    setPromotionPreview((previous) => {
      if (!previous) {
        return previous;
      }

      const nextStudents = previous.students.map((student) => {
        if (Number(student.student_id) !== Number(studentId)) {
          return student;
        }

        return {
          ...student,

          action: "stay",

          reason: "MANUAL",
        };
      });

      return {
        ...previous,

        students: nextStudents,

        summary: {
          ...previous.summary,

          promote_count: nextStudents.filter(
            (item) => item.action === "promote",
          ).length,

          stay_count: nextStudents.filter((item) => item.action === "stay")
            .length,

          unassigned_count: nextStudents.filter(
            (item) => item.action === "unassigned",
          ).length,
        },
      };
    });
  }, []);

  // ==========================================================

  // UNASSIGN

  // ==========================================================

  const handleUnassignStudent = useCallback(
    (studentId) => {
      updateStudentAssignment(studentId, null, "unassigned");
    },

    [updateStudentAssignment],
  );

  // ==========================================================

  // FILTERED STUDENTS

  // ==========================================================

  const filteredStudents = useMemo(() => {
    const students = promotionPreview?.students || [];

    const keyword = String(studentKeyword || "")
      .trim()

      .toLowerCase();

    return students.filter((student) => {
      // ----------------------------------------------------

      // KEYWORD

      // ----------------------------------------------------

      if (keyword) {
        const searchText = [
          student.name,

          student.saint_name,

          student.code,

          student.source_class_name,

          student.source_class_code,

          student.destination_class_name,

          student.destination_class_code,
        ]

          .filter(Boolean)

          .join(" ")

          .toLowerCase();

        if (!searchText.includes(keyword)) {
          return false;
        }
      }

      // ----------------------------------------------------

      // STATUS

      // ----------------------------------------------------

      if (studentStatusFilter !== "all") {
        if (student.action !== studentStatusFilter) {
          return false;
        }
      }

      // ----------------------------------------------------

      // SOURCE CLASS

      // ----------------------------------------------------

      if (sourceClassFilter !== "all") {
        if (Number(student.source_class_id) !== Number(sourceClassFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [
    promotionPreview,

    studentKeyword,

    studentStatusFilter,

    sourceClassFilter,
  ]);

  // ==========================================================

  // CONFIRM
  const handleConfirmPromotion = useCallback(async () => {
    if (!promotionPreview) {
      return;
    }

    setConfirmLoading(true);

    try {
      const students = (promotionPreview.students || []).map((student) => ({
        student_id: student.student_id,

        from_class_id: student.source_class_id,

        to_class_id: student.destination_class_id,

        action: student.action,
      }));

      const result = await academicYearApi.confirmPromotion({
        fromAcademicYear,

        toAcademicYear,

        students,
      });

      setConfirmResult(result);

      setCurrentStep(2);

      messageApi.success(result?.message || "Đã chốt phân lớp.");
    } catch (error) {
      messageApi.error(getErrorMessage(error, "Không thể chốt phân lớp."));
    } finally {
      setConfirmLoading(false);
    }
  }, [promotionPreview, fromAcademicYear, toAcademicYear, messageApi]);

  // ==========================================================

  const handleConfirm = useCallback(() => {
    if (!promotionPreview) {
      return;
    }

    const students = promotionPreview.students || [];

    if (students.length === 0) {
      messageApi.warning("Không có học sinh để phân lớp.");
      return;
    }

    const unassigned = students.filter((item) => item.action === "unassigned");

    if (unassigned.length > 0) {
      Modal.confirm({
        title: "Vẫn còn học sinh chưa phân lớp",
        icon: <ExclamationCircleOutlined />,
        width: 500,

        content: (
          <div>
            <Paragraph>
              Hiện có <b>{unassigned.length}</b> học sinh chưa được phân lớp
              trong năm <b>{toAcademicYear}</b>.
            </Paragraph>

            <Alert
              type="warning"
              showIcon
              message="Lưu ý"
              description="Những học sinh này sẽ không được tạo bản ghi lớp mới và vẫn giữ lịch sử lớp cũ."
            />
          </div>
        ),

        okText: "Vẫn chốt",
        cancelText: "Quay lại",

        okButtonProps: {
          danger: true,
        },

        centered: true,

        onOk: handleConfirmPromotion,
      });

      return;
    }

    Modal.confirm({
      title: `Chốt phân lớp ${toAcademicYear}?`,
      icon: <SafetyCertificateOutlined />,
      width: 520,

      content: (
        <div>
          <Paragraph>Sau khi chốt:</Paragraph>

          <ul
            style={{
              paddingLeft: 20,
            }}
          >
            <li>Học sinh được tạo bản ghi lớp mới.</li>

            <li>
              Lớp cũ được đóng bằng trạng thái
              <b> completed</b>.
            </li>

            <li>Lịch sử năm học cũ vẫn được giữ nguyên.</li>
          </ul>

          <Alert
            type="warning"
            showIcon
            message="Thao tác này sẽ ghi dữ liệu thật"
            description="Hãy kiểm tra kỹ danh sách trước khi chốt."
          />
        </div>
      ),

      okText: "Chốt phân lớp",
      cancelText: "Hủy",
      centered: true,

      onOk: handleConfirmPromotion,
    });
  }, [promotionPreview, messageApi, toAcademicYear, handleConfirmPromotion]);
  // ==========================================================

  // CONFIRM PROMOTION

  // ==========================================================

  // ==========================================================

  // YEAR CHANGE

  // ==========================================================

  const handleFromYearChange = useCallback((value) => {
    setFromAcademicYear(value);

    const next = getNextAcademicYear(value);

    if (next) {
      setToAcademicYear(next);
    }

    setCreatePreview(null);

    setPromotionPreview(null);

    setConfirmResult(null);

    setCurrentStep(0);

    setStudentKeyword("");

    setStudentStatusFilter("all");

    setSourceClassFilter("all");
  }, []);

  const handleToYearChange = useCallback((value) => {
    setToAcademicYear(value);

    setCreatePreview(null);

    setPromotionPreview(null);

    setConfirmResult(null);

    setCurrentStep(0);
  }, []);

  // ==========================================================

  // LOAD PROMOTION WHEN ENTER STEP 2

  // ==========================================================

  useEffect(() => {
    if (currentStep !== 1 || promotionPreview || createLoading) {
      return;
    }

    handlePreviewPromotion();
  }, [currentStep, promotionPreview, createLoading, handlePreviewPromotion]);

  // ==========================================================

  // PROGRESS

  // ==========================================================

  const promotionSummary = promotionPreview?.summary || {};

  const totalStudents = Number(promotionSummary.student_count || 0);

  const promoteCount = Number(promotionSummary.promote_count || 0);

  const stayCount = Number(promotionSummary.stay_count || 0);

  const unassignedCount = Number(promotionSummary.unassigned_count || 0);

  const assignedCount = promoteCount + stayCount;

  const assignedPercent =
    totalStudents > 0 ? Math.round((assignedCount / totalStudents) * 100) : 0;

  // ==========================================================

  // TABLE COLUMNS

  // ==========================================================

  const studentColumns = useMemo(
    () => [
      {
        title: "HỌC SINH",

        key: "student",

        width: 280,

        fixed: "left",

        render: (_, record) => (
          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 10,

              minWidth: 220,
            }}
          >
            <Avatar
              size={40}
              src={record.avatar || undefined}
              icon={!record.avatar ? <UserOutlined /> : null}
            />

            <div
              style={{
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontWeight: 600,

                  whiteSpace: "nowrap",

                  overflow: "hidden",

                  textOverflow: "ellipsis",
                }}
                title={[record.saint_name, record.name]

                  .filter(Boolean)

                  .join(" ")}
              >
                {record.saint_name ? `${record.saint_name} ` : ""}

                {record.name}
              </div>

              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                {record.code || "Chưa có mã"}
              </Text>
            </div>
          </div>
        ),
      },

      {
        title: "LỚP CŨ",

        key: "source",

        width: 190,

        render: (_, record) => (
          <div>
            <Text strong>{record.source_class_name || "-"}</Text>

            {record.source_class_code && (
              <>
                <br />

                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  {record.source_class_code}
                </Text>
              </>
            )}
          </div>
        ),
      },

      {
        title: "LỚP MỚI",

        key: "destination",

        width: 300,

        render: (_, record) => (
          <Select
            style={{
              width: "100%",
            }}
            value={record.destination_class_id || undefined}
            placeholder="Chọn lớp mới"
            showSearch
            optionFilterProp="label"
            options={targetClassOptions.map((item) => ({
              value: item.value,

              label: item.label,

              code: item.code,

              level: item.level,
            }))}
            optionRender={(option) => (
              <div>
                <div
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {option.data.label}
                </div>

                {option.data.code && (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    {option.data.code}

                    {option.data.level !== null &&
                    option.data.level !== undefined
                      ? ` • Cấp ${option.data.level}`
                      : ""}
                  </Text>
                )}
              </div>
            )}
            onChange={(value) =>
              handleChangeStudentClass(record.student_id, value)
            }
          />
        ),
      },

      {
        title: "TRẠNG THÁI",

        key: "action",

        width: 170,

        render: (_, record) => {
          if (record.action === "unassigned") {
            return <Tag color="orange">Chưa phân lớp</Tag>;
          }

          if (record.action === "stay") {
            return <Tag color="purple">Ở lại lớp</Tag>;
          }

          if (record.reason === "MANUAL") {
            return <Tag color="blue">Đã chỉnh</Tag>;
          }

          return <Tag color="green">Tự động</Tag>;
        },
      },

      {
        title: "THAO TÁC",

        key: "action_button",

        width: 170,

        render: (_, record) => {
          if (record.action === "unassigned") {
            return (
              <AppButton
                type="link"
                size="small"
                onClick={() => handleStayStudent(record.student_id)}
              >
                Giữ lựa chọn
              </AppButton>
            );
          }

          return (
            <Space size={0}>
              <AppButton
                type="link"
                size="small"
                onClick={() => handleStayStudent(record.student_id)}
              >
                Ở lại
              </AppButton>

              <AppButton
                type="link"
                danger
                size="small"
                onClick={() => handleUnassignStudent(record.student_id)}
              >
                Bỏ lớp
              </AppButton>
            </Space>
          );
        },
      },
    ],

    [
      targetClassOptions,

      handleChangeStudentClass,

      handleStayStudent,

      handleUnassignStudent,
    ],
  );

  // ==========================================================

  // RENDER

  // ==========================================================

  return (
    <div
      className="academic-year-page"
      style={{
        padding: 24,

        maxWidth: 1500,

        margin: "0 auto",

        width: "100%",
      }}
    >
      {contextHolder}

      <style>{`
        .academic-year-page {
          font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #173B5E;
        }
        .academic-year-page .ant-card {
          border-color: #E8EEF5;
        }
        .academic-year-page .ant-statistic-title {
          color: #64748B;
          font-weight: 600;
        }
        .academic-year-page .ant-table-thead > tr > th {
          background: #F7F9FC;
          color: #173B5E;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .02em;
        }
        .academic-year-page .ant-table-tbody > tr:hover > td {
          background: #F8FBFE !important;
        }
        .academic-year-page .ant-select-selector,
        .academic-year-page .ant-input-affix-wrapper {
          border-radius: 10px !important;
        }
        .academic-year-page .ant-btn {
          border-radius: 10px;
          font-weight: 600;
        }
        .academic-year-page .ant-alert {
          border-radius: 12px;
        }
        @media (max-width: 768px) {
          .academic-year-page {
            padding-left: 8px;
            padding-right: 8px;
          }
        }
      `}</style>

      {/* ====================================================== */}

      {/* ======================================================
        HERO HEADER
    ====================================================== */}

      <PageHeroHeader
        icon={<SafetyCertificateOutlined />}
        badgeText="QUẢN LÝ NĂM HỌC"
        title="Quản lý năm học"
        description="Khởi tạo năm học mới, kiểm tra dữ liệu và phân lớp học sinh nhanh chóng."
        onRefresh={handlePreviewCreate}
        refreshLoading={previewCreateLoading}
        primaryButtonText={
          currentStep === 2 ? "Hoàn tất quy trình" : "Kiểm tra năm học"
        }
        primaryButtonIcon={<ReloadOutlined />}
        onPrimaryClick={
          currentStep === 2
            ? () => {
                setCurrentStep(0);
                setCreatePreview(null);
                setPromotionPreview(null);
                setConfirmResult(null);
              }
            : handlePreviewCreate
        }
        primaryLoading={previewCreateLoading}
        primaryDisabled={currentStep === 2}
      />

      {/* STEPS */}

      {/* ====================================================== */}

      <Card
        style={{
          marginBottom: 24,

          borderRadius: 16,
        }}
      >
        <Steps
          current={currentStep}
          responsive
          items={[
            {
              title: "Khởi tạo năm học",

              description: "Tạo cơ cấu lớp",
            },

            {
              title: "Phân lớp",

              description: "Kiểm tra học sinh",
            },

            {
              title: "Hoàn tất",

              description: "Chốt dữ liệu",
            },
          ]}
        />
      </Card>

      {/* ====================================================== */}

      {/* YEAR SELECT */}

      {/* ====================================================== */}

      <Card
        style={{
          marginBottom: 24,

          borderRadius: 16,
        }}
      >
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={9}>
            <Text
              strong
              style={{ color: "#fff", display: "block", marginBottom: 6 }}
            >
              Năm học hiện tại
            </Text>

            <Select
              style={{
                width: "100%",

                marginTop: 8,
              }}
              value={fromAcademicYear}
              options={academicYearOptions}
              onChange={handleFromYearChange}
              disabled={currentStep === 2}
            />
          </Col>

          <Col xs={24} md={9}>
            <Text
              strong
              style={{ color: "#fff", display: "block", marginBottom: 6 }}
            >
              Năm học mới
            </Text>

            <Select
              style={{
                width: "100%",

                marginTop: 8,
              }}
              value={toAcademicYear}
              options={academicYearOptions}
              onChange={handleToYearChange}
              disabled={currentStep === 2}
            />
          </Col>

          <Col xs={24} md={6}>
            <AppButton
              block
              icon={<ReloadOutlined />}
              loading={previewCreateLoading}
              disabled={currentStep === 2}
              onClick={handlePreviewCreate}
            >
              Kiểm tra
            </AppButton>
          </Col>
        </Row>
      </Card>

      {/* ====================================================== */}

      {/* STEP 1 */}

      {/* ====================================================== */}

      {currentStep === 0 && (
        <>
          {!createPreview && (
            <Card
              style={{
                borderRadius: 16,
              }}
            >
              <Empty
                description={
                  <>
                    <Text strong>Chưa kiểm tra năm học</Text>

                    <br />

                    <Text type="secondary">
                      Chọn năm học hiện tại và năm học mới rồi bấm "Kiểm tra".
                    </Text>
                  </>
                }
              />
            </Card>
          )}

          {createPreview && (
            <>
              {/* SUMMARY */}

              <Row
                gutter={[16, 16]}
                style={{
                  marginBottom: 24,
                }}
              >
                <Col xs={24} sm={12} md={8}>
                  <Card
                    style={{
                      borderRadius: 16,
                    }}
                  >
                    <Statistic
                      title="Lớp hiện tại"
                      value={createPreview.source?.class_count || 0}
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Card
                    style={{
                      borderRadius: 16,
                    }}
                  >
                    <Statistic
                      title="Học sinh"
                      value={createPreview.source?.student_count || 0}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Card
                    style={{
                      borderRadius: 16,
                    }}
                  >
                    <Statistic
                      title="Lớp năm mới"
                      value={createPreview.target?.class_count || 0}
                    />
                  </Card>
                </Col>
              </Row>

              {/* WARNINGS */}

              {createPreview.warnings?.length > 0 && (
                <div
                  style={{
                    marginBottom: 20,
                  }}
                >
                  {createPreview.warnings.map((warning, index) => (
                    <Alert
                      key={`${warning.code}-${index}`}
                      type={
                        warning.code === "TARGET_YEAR_EXISTS"
                          ? "error"
                          : "warning"
                      }
                      showIcon
                      style={{
                        marginBottom: 8,
                      }}
                      message={warning.message}
                    />
                  ))}
                </div>
              )}

              {/* INFO */}

              {createPreview.can_create && (
                <Alert
                  type="success"
                  showIcon
                  style={{
                    marginBottom: 20,
                  }}
                  message={`Có thể khởi tạo năm học ${toAcademicYear}`}
                  description="Hệ thống sẽ sao chép cơ cấu lớp. Học sinh và lịch học chưa được chuyển ở bước này."
                />
              )}

              {/* CLASS LIST */}

              <Card
                title={<span>Cơ cấu lớp sẽ được tạo</span>}
                style={{
                  borderRadius: 16,

                  marginBottom: 20,
                }}
              >
                <Table
                  rowKey="id"
                  pagination={false}
                  scroll={{
                    x: 800,
                  }}
                  dataSource={createPreview.source?.classes || []}
                  columns={[
                    {
                      title: "LỚP",

                      dataIndex: "name",

                      render: (value, record) => (
                        <div>
                          <Text strong>{value}</Text>

                          {record.category && (
                            <>
                              <br />

                              <Text
                                type="secondary"
                                style={{
                                  fontSize: 12,
                                }}
                              >
                                {record.category}
                              </Text>
                            </>
                          )}
                        </div>
                      ),
                    },

                    {
                      title: "MÃ LỚP",

                      dataIndex: "code",

                      render: (value) => value || "-",
                    },

                    {
                      title: "CẤP ĐỘ",

                      dataIndex: "level_order",

                      render: (value) => value ?? "-",
                    },

                    {
                      title: "HỌC SINH",

                      dataIndex: "student_count",

                      render: (value) => <Tag>{value || 0}</Tag>,
                    },
                  ]}
                />
              </Card>

              {/* CREATE */}

              <div
                style={{
                  display: "flex",

                  justifyContent: "flex-end",
                }}
              >
                <AppButton
                  type="primary"
                  size="small"
                  icon={<RightOutlined />}
                  disabled={!createPreview.can_create}
                  loading={createLoading}
                  onClick={handleCreateAcademicYear}
                >
                  Khởi tạo {toAcademicYear}
                </AppButton>
              </div>
            </>
          )}
        </>
      )}

      {/* ====================================================== */}

      {/* STEP 2 */}

      {/* ====================================================== */}

      {currentStep === 1 && (
        <>
          {previewPromotionLoading && !promotionPreview && (
            <Card
              style={{
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  textAlign: "center",

                  padding: 40,
                }}
              >
                <Text type="secondary">Đang tải dữ liệu phân lớp...</Text>
              </div>
            </Card>
          )}

          {promotionPreview && (
            <>
              {/* HEADER */}

              <Card
                style={{
                  borderRadius: 16,

                  marginBottom: 20,
                }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} md={14}>
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                      }}
                    >
                      Phân lớp năm học {toAcademicYear}
                    </Title>

                    <Text type="secondary">
                      Kiểm tra và chỉnh lớp trước khi chốt.
                    </Text>
                  </Col>

                  <Col xs={24} md={10}>
                    <Progress
                      percent={assignedPercent}
                      status={unassignedCount > 0 ? "active" : "success"}
                      format={() => `${assignedCount} / ${totalStudents}`}
                    />
                  </Col>
                </Row>
              </Card>

              {/* SCHEDULE NOTICE */}

              <Alert
                type="info"
                showIcon
                style={{
                  marginBottom: 20,
                }}
                message="Lịch học của năm mới"
                description="Cơ cấu lớp đã được tạo nhưng lịch học trong class_schedules chưa được sao chép. Sau khi chốt phân lớp, bạn có thể cấu hình lịch học riêng cho từng lớp năm mới."
              />

              {/* STATISTICS */}

              <Row
                gutter={[16, 16]}
                style={{
                  marginBottom: 20,
                }}
              >
                <Col xs={12} md={6}>
                  <Card
                    style={{
                      borderRadius: 16,
                    }}
                  >
                    <Statistic
                      title="Tổng học sinh"
                      value={totalStudents}
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>

                <Col xs={12} md={6}>
                  <Card
                    style={{
                      borderRadius: 16,
                    }}
                  >
                    <Statistic
                      title="Tự động"
                      value={promoteCount}
                      valueStyle={{
                        color: "#2E7D5B",
                      }}
                    />
                  </Card>
                </Col>

                <Col xs={12} md={6}>
                  <Card
                    style={{
                      borderRadius: 16,
                    }}
                  >
                    <Statistic
                      title="Ở lại lớp"
                      value={stayCount}
                      valueStyle={{
                        color: "#6B46C1",
                      }}
                    />
                  </Card>
                </Col>

                <Col xs={12} md={6}>
                  <Card
                    style={{
                      borderRadius: 16,
                    }}
                  >
                    <Statistic
                      title="Chưa phân lớp"
                      value={unassignedCount}
                      valueStyle={{
                        color: "#B7791F",
                      }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* WARNINGS */}

              {promotionPreview.warnings?.length > 0 && (
                <div
                  style={{
                    marginBottom: 20,
                  }}
                >
                  {promotionPreview.warnings.map((warning, index) => (
                    <Alert
                      key={`${warning.code}-${warning.source_class_id || ""}-${index}`}
                      type="warning"
                      showIcon
                      style={{
                        marginBottom: 8,
                      }}
                      message={warning.message}
                      description={
                        warning.student_count !== undefined
                          ? `${warning.student_count} học sinh bị ảnh hưởng.`
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}

              {/* FILTER */}

              <Card
                style={{
                  borderRadius: 16,

                  marginBottom: 20,
                }}
              >
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={10}>
                    <AppSearchInput
                      value={studentKeyword}
                      onChange={setStudentKeyword}
                      placeholder="Tìm tên, tên thánh, mã học sinh..."
                    />
                  </Col>

                  <Col xs={24} sm={12} md={7}>
                    <Select
                      style={{
                        width: "100%",
                      }}
                      value={studentStatusFilter}
                      onChange={setStudentStatusFilter}
                      options={[
                        {
                          value: "all",

                          label: "Tất cả trạng thái",
                        },

                        {
                          value: "promote",

                          label: "Tự động / Đã phân",
                        },

                        {
                          value: "stay",

                          label: "Ở lại lớp",
                        },

                        {
                          value: "unassigned",

                          label: "Chưa phân lớp",
                        },
                      ]}
                    />
                  </Col>

                  <Col xs={24} sm={12} md={7}>
                    <Select
                      style={{
                        width: "100%",
                      }}
                      value={sourceClassFilter}
                      onChange={setSourceClassFilter}
                      showSearch
                      optionFilterProp="label"
                      options={[
                        {
                          value: "all",

                          label: "Tất cả lớp cũ",
                        },

                        ...sourceClassOptions,
                      ]}
                    />
                  </Col>
                </Row>

                <div
                  style={{
                    marginTop: 12,
                  }}
                >
                  <Text type="secondary">
                    Hiển thị <b>{filteredStudents.length}</b> /{" "}
                    <b>{totalStudents}</b> học sinh
                  </Text>
                </div>
              </Card>

              {/* TABLE */}

              <Card
                style={{
                  borderRadius: 16,

                  marginBottom: 20,
                }}
                styles={{
                  body: {
                    padding: 0,
                  },
                }}
              >
                <Table
                  rowKey="student_id"
                  loading={previewPromotionLoading}
                  columns={studentColumns}
                  dataSource={filteredStudents}
                  pagination={{
                    pageSize: PAGE_SIZE,

                    showSizeChanger: true,

                    pageSizeOptions: [20, 50, 100],

                    showTotal: (total) => `${total} học sinh`,
                  }}
                  locale={{
                    emptyText: (
                      <Empty description="Không tìm thấy học sinh phù hợp" />
                    ),
                  }}
                  scroll={{
                    x: 1150,
                  }}
                />
              </Card>

              {/* ACTION */}

              <div
                style={{
                  display: "flex",

                  justifyContent: "space-between",

                  gap: 12,

                  flexWrap: "wrap",
                }}
              >
                <AppButton
                  icon={<ReloadOutlined />}
                  loading={previewPromotionLoading}
                  onClick={handlePreviewPromotion}
                >
                  Tải lại phân lớp
                </AppButton>

                <Space wrap>
                  <AppButton
                    onClick={() => {
                      setCurrentStep(0);
                    }}
                  >
                    Quay lại
                  </AppButton>

                  <AppButton
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    loading={confirmLoading}
                    onClick={handleConfirm}
                  >
                    Chốt phân lớp
                  </AppButton>
                </Space>
              </div>
            </>
          )}
        </>
      )}

      {/* ====================================================== */}

      {/* STEP 3 */}

      {/* ====================================================== */}

      {currentStep === 2 && (
        <Card
          style={{
            borderRadius: 20,

            textAlign: "center",

            padding: "40px 20px",
          }}
        >
          <CheckCircleOutlined
            style={{
              fontSize: 64,

              color: "#2E7D5B",

              marginBottom: 20,
            }}
          />

          <Title level={3}>Đã hoàn tất phân lớp</Title>

          <Paragraph type="secondary">
            Năm học <b>{toAcademicYear}</b> đã được cập nhật thành công.
          </Paragraph>

          {confirmResult && (
            <Row
              gutter={[16, 16]}
              justify="center"
              style={{
                marginTop: 24,
              }}
            >
              <Col xs={12} sm={6}>
                <Statistic
                  title="Tổng"
                  value={confirmResult.summary?.total_student_count || 0}
                />
              </Col>

              <Col xs={12} sm={6}>
                <Statistic
                  title="Tự động"
                  value={confirmResult.summary?.promote_count || 0}
                />
              </Col>

              <Col xs={12} sm={6}>
                <Statistic
                  title="Ở lại"
                  value={confirmResult.summary?.stay_count || 0}
                />
              </Col>

              <Col xs={12} sm={6}>
                <Statistic
                  title="Chưa xếp"
                  value={confirmResult.summary?.unassigned_count || 0}
                />
              </Col>
            </Row>
          )}

          <Alert
            type="success"
            showIcon
            style={{
              maxWidth: 700,

              margin: "28px auto 0",

              textAlign: "left",
            }}
            message="Dữ liệu đã được lưu"
            description={
              <>
                Học sinh đã được cập nhật sang năm học <b>{toAcademicYear}</b>.
                Lịch sử lớp của năm học <b>{fromAcademicYear}</b> vẫn được giữ
                nguyên.
              </>
            }
          />

          <Space
            style={{
              marginTop: 32,
            }}
          >
            <AppButton
              onClick={() => {
                setCurrentStep(1);
              }}
            >
              Xem lại
            </AppButton>

            <AppButton
              type="primary"
              onClick={() => {
                setCurrentStep(0);

                setCreatePreview(null);

                setPromotionPreview(null);

                setConfirmResult(null);

                setStudentKeyword("");

                setStudentStatusFilter("all");

                setSourceClassFilter("all");
              }}
            >
              Hoàn tất
            </AppButton>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default AcademicYearPage;
