import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  DatePicker,
  Empty,
  Input,
  Layout,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";

import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  QrcodeOutlined,
  SaveOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";

import studentApi from "../../../api/studentApi";
import AppButton from "../../../components/common/AppButton";
import UnsavedChangesModal from "../../../components/common/UnsavedChangesModal";
import useUnsavedChangesGuard from "../../../hooks/useUnsavedChangesGuard";
import { useNotification } from "../../../components/notification";

import {
  getStudentDraft,
  removeStudentDraft,
  restoreStudentDraft,
  saveStudentDraft,
} from "../../../utils/studentDraftStorage";

const { Content } = Layout;
const { Title, Text } = Typography;

/* =========================================================
   OPTIONS
========================================================= */

const GENDER_OPTIONS = [
  {
    value: "male",
    label: "Nam",
  },
  {
    value: "female",
    label: "Nữ",
  },
];

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Đang học",
  },
  {
    value: "inactive",
    label: "Ngừng học",
  },
];

const CATECHISM_STATUS_OPTIONS = [
  {
    value: "new",
    label: "Mới",
  },
  {
    value: "studying",
    label: "Đang học",
  },
  {
    value: "completed",
    label: "Đã hoàn thành",
  },
  {
    value: "paused",
    label: "Tạm nghỉ",
  },
  {
    value: "left",
    label: "Đã nghỉ",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const normalizeDateForApi = (value) => {
  if (!value) {
    return null;
  }

  if (dayjs.isDayjs(value)) {
    return value.isValid() ? value.format("YYYY-MM-DD") : null;
  }

  if (typeof value === "string") {
    const parsed = dayjs(value);

    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
  }

  return null;
};

const EDITABLE_FIELDS = [
  "name",
  "gender",
  "date_of_birth",
  "birth_place",
  "nationality",
  "phone",
  "email",
  "address",
  "parish",

  "father_name",
  "father_phone",
  "mother_name",
  "mother_phone",
  "guardian_name",
  "guardian_phone",
  "guardian_relationship",

  "baptism_name",
  "baptism_date",
  "baptism_place",
  "baptism_parish",
  "baptism_certificate_no",

  "saint_name",
  "first_communion_date",
  "first_communion_place",
  "confirmation_date",
  "confirmation_place",
  "confirmation_saint_name",

  "catechism_level",
  "catechism_status",
  "enrollment_date",

  "note",
  "status",
];

const DATE_FIELDS = [
  "date_of_birth",
  "baptism_date",
  "first_communion_date",
  "confirmation_date",
  "enrollment_date",
];

/**
 * =========================================================
 * BUILD API PAYLOAD
 * =========================================================
 */
const buildPayloadStudent = (student) => {
  const payload = {
    id: student.id,
  };

  EDITABLE_FIELDS.forEach((field) => {
    if (DATE_FIELDS.includes(field)) {
      payload[field] = normalizeDateForApi(student[field]);
    } else {
      payload[field] = student[field] === undefined ? null : student[field];
    }
  });

  return payload;
};

/* =========================================================
   EDITABLE TEXT CELL
========================================================= */

function EditableTextCell({
  value,
  onChange,
  placeholder = "",
  width = 120,
  multiline = false,
}) {
  const commonProps = {
    value: value ?? "",
    placeholder,
    onChange: (event) => {
      onChange(event.target.value);
    },
    className: "student-bulk-input",
    style: {
      width,
      minWidth: width,
    },
  };

  if (multiline) {
    return (
      <Input.TextArea
        {...commonProps}
        autoSize={{
          minRows: 1,
          maxRows: 3,
        }}
      />
    );
  }

  return (
    <Tooltip
      title={value || undefined}
      placement="topLeft"
      mouseEnterDelay={0.6}
    >
      <Input {...commonProps} />
    </Tooltip>
  );
}

/* =========================================================
   EDITABLE DATE CELL
========================================================= */

function EditableDateCell({ value, onChange, width = 112 }) {
  const dateValue = value ? dayjs(value) : null;

  return (
    <DatePicker
      value={dateValue && dateValue.isValid() ? dateValue : null}
      format="DD/MM/YYYY"
      placeholder="Chọn ngày"
      allowClear
      onChange={(date) => {
        onChange(date ? date.format("YYYY-MM-DD") : null);
      }}
      className="student-bulk-picker"
      style={{
        width,
        minWidth: width,
      }}
    />
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function StudentBulkEditPage() {
  const notify = useNotification();

  const navigate = useNavigate();
  const { classId } = useParams();

  /* =======================================================
     REFS
  ======================================================= */

  const mountedRef = useRef(false);

  /**
   * Tránh restore draft nhiều lần.
   */
  const restoredDraftRef = useRef(false);

  /**
   * Debounce localStorage.
   */
  const draftSaveTimerRef = useRef(null);

  /**
   * Tránh load chồng nhau.
   */
  const loadingRef = useRef(false);

  /* =======================================================
     STATE
  ======================================================= */

  const [students, setStudents] = useState([]);

  const [classInfo, setClassInfo] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  /**
   * ID học sinh đã thay đổi.
   */
  const [changedIds, setChangedIds] = useState(new Set());

  /**
   * Có draft trong localStorage.
   */
  const [draftExists, setDraftExists] = useState(false);

  const changedCount = changedIds.size;

  /* =========================================================
     CLEANUP DRAFT TIMER
  ========================================================= */

  useEffect(() => {
    return () => {
      if (draftSaveTimerRef.current) {
        clearTimeout(draftSaveTimerRef.current);

        draftSaveTimerRef.current = null;
      }
    };
  }, []);

  /* =========================================================
     LOAD STUDENTS
  ========================================================= */

  const loadStudents = useCallback(
    async ({ preserveDraft = false } = {}) => {
      if (!classId) {
        notify.error("Không xác định được lớp học");

        setLoading(false);

        return false;
      }

      if (loadingRef.current) {
        return false;
      }

      loadingRef.current = true;

      try {
        setLoading(true);

        const response = await studentApi.getStudentsByClass(classId);

        const result = response?.data;

        if (!result?.success) {
          throw new Error(
            result?.message || "Không thể lấy danh sách học sinh",
          );
        }

        if (!mountedRef.current) {
          return false;
        }

        // Backend trả về:
        // {
        //   success: true,
        //   data: {
        //     class: {...},
        //     schedules: [...],
        //     students: [...],
        //     total: number
        //   }
        // }
        //
        // Tuyệt đối không dùng result.data ở đây vì
        // result.data là OBJECT, không phải ARRAY.
        const serverStudents = Array.isArray(result?.data?.students)
          ? result.data.students
          : [];

        setClassInfo(result?.data?.class || null);

        /**
         * =====================================================
         * RESTORE LOCAL DRAFT
         * =====================================================
         */
        if (preserveDraft && !restoredDraftRef.current) {
          restoredDraftRef.current = true;

          const draft = getStudentDraft(classId);

          if (draft) {
            const restored = restoreStudentDraft({
              serverStudents,
              draft,
            });

            setStudents(restored.students);

            setChangedIds(restored.changedIds);

            setDraftExists(restored.changedIds.size > 0);

            if (restored.changedIds.size > 0) {
              notify.success(
                `Đã khôi phục bản nháp của ${restored.changedIds.size} học sinh`,
              );

              return true;
            }

            /**
             * Draft không còn học sinh hợp lệ.
             */
            removeStudentDraft(classId);

            setDraftExists(false);
          }

          setStudents(serverStudents);

          setChangedIds(new Set());

          setDraftExists(false);

          return true;
        }

        /**
         * =====================================================
         * LOAD SERVER BÌNH THƯỜNG
         * =====================================================
         */

        setStudents(serverStudents);

        setChangedIds(new Set());

        setDraftExists(false);

        return true;
      } catch (error) {
        if (!mountedRef.current) {
          return false;
        }

        notify.error(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể lấy danh sách học sinh",
        );

        return false;
      } finally {
        loadingRef.current = false;

        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [classId, notify],
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    mountedRef.current = true;

    restoredDraftRef.current = false;

    loadStudents({
      preserveDraft: true,
    });

    return () => {
      mountedRef.current = false;

      if (draftSaveTimerRef.current) {
        clearTimeout(draftSaveTimerRef.current);

        draftSaveTimerRef.current = null;
      }
    };
  }, [loadStudents]);

  /* =========================================================
     UPDATE STUDENT FIELD
  ========================================================= */

  const updateStudentField = useCallback((studentId, field, value) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) {
          return student;
        }

        return {
          ...student,
          [field]: value,
        };
      }),
    );

    setChangedIds((prev) => {
      const next = new Set(prev);

      next.add(studentId);

      return next;
    });

    setDraftExists(true);
  }, []);

  /* =========================================================
     AUTO SAVE DRAFT
     
     Không lưu API.
     Chỉ lưu localStorage.
  ========================================================= */

  useEffect(() => {
    if (!classId) {
      return;
    }

    /**
     * Nếu không dirty:
     * xóa draft.
     */
    if (changedIds.size === 0) {
      if (draftSaveTimerRef.current) {
        clearTimeout(draftSaveTimerRef.current);

        draftSaveTimerRef.current = null;
      }

      removeStudentDraft(classId);

      setDraftExists(false);

      return;
    }

    /**
     * Debounce 700ms.
     */
    if (draftSaveTimerRef.current) {
      clearTimeout(draftSaveTimerRef.current);
    }

    draftSaveTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }

      const saved = saveStudentDraft({
        classId,
        students,
        changedIds,
      });

      if (saved) {
        setDraftExists(true);
      }

      draftSaveTimerRef.current = null;
    }, 700);

    return () => {
      if (draftSaveTimerRef.current) {
        clearTimeout(draftSaveTimerRef.current);
      }
    };
  }, [classId, students, changedIds]);

  /* =========================================================
     SAVE CHANGES
     
     PHẢI NẰM TRƯỚC useUnsavedChangesGuard
  ========================================================= */

  const handleSave = useCallback(async () => {
    /**
     * Không có thay đổi.
     */
    if (changedIds.size === 0) {
      notify.info("Chưa có thay đổi nào cần lưu");

      return true;
    }

    /**
     * Lấy đúng học sinh thay đổi.
     */
    const changedStudents = students
      .filter((student) => changedIds.has(student.id))
      .map(buildPayloadStudent);

    /**
     * Không còn dữ liệu.
     */
    if (changedStudents.length === 0) {
      setChangedIds(new Set());

      removeStudentDraft(classId);

      setDraftExists(false);

      return true;
    }

    try {
      setSaving(true);

      const response = await studentApi.bulkUpdateByClass(
        classId,
        changedStudents,
      );

      /**
       * Backend lỗi từng học sinh.
       */
      const errors = Array.isArray(response.errors) ? response.errors : [];

      if (errors.length > 0) {
        notify.warning(
          `Đã lưu một phần. Có ${errors.length} học sinh cập nhật lỗi.`,
        );

        /**
         * Không xóa draft.
         * Không reset dirty.
         */
        return false;
      }

      /**
       * =====================================================
       * API THÀNH CÔNG HOÀN TOÀN
       * =====================================================
       */

      /**
       * Xóa draft NGAY SAU khi API thành công.
       */
      removeStudentDraft(classId);

      setDraftExists(false);

      /**
       * Reset dirty.
       */
      setChangedIds(new Set());

      notify.success(`Đã lưu ${changedStudents.length} học sinh`);

      /**
       * Reload server.
       */
      const reloadSuccess = await loadStudents({
        preserveDraft: false,
      });

      if (!reloadSuccess) {
        /**
         * API đã lưu thành công,
         * nên vẫn xem là save thành công.
         */
        return true;
      }

      return true;
    } catch (error) {
      notify.error(
        error?.response?.data?.message ||
          error?.message ||
          "Lưu dữ liệu thất bại",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }, [changedIds, students, classId, loadStudents, notify]);

  /* =========================================================
     UNSAVED CHANGES GUARD
  ========================================================= */

  const {
    open: unsavedModalOpen,
    saving: unsavedModalSaving,
    requestLeave,
    stay: stayOnPage,
    leave: leaveWithoutSave,
    saveAndLeave,
  } = useUnsavedChangesGuard({
    hasChanges: changedCount > 0,
    changedCount,
    onSave: handleSave,
  });

  /* =========================================================
     BACK
  ========================================================= */

  const handleBack = useCallback(() => {
    requestLeave(() => {
      navigate(-1);
    });
  }, [requestLeave, navigate]);

  /* =========================================================
     OPEN QR
  ========================================================= */

  const handleOpenQR = useCallback(
    (student) => {
      /**
       * Thay bằng modal QR hiện tại
       * nếu dự án đã có.
       */
      notify.info(`Mã học sinh: ${student.code || "-"}`);
    },
    [notify],
  );

  /* =========================================================
     DISCARD DRAFT
     
     Dùng khi người dùng muốn bỏ
     bản nháp localStorage.
  ========================================================= */

  const handleDiscardDraft = useCallback(() => {
    if (!classId) {
      return;
    }

    if (changedCount === 0) {
      removeStudentDraft(classId);

      setDraftExists(false);

      return;
    }

    Modal.confirm({
      title: "Bỏ bản nháp chỉnh sửa?",
      icon: <ExclamationCircleOutlined />,
      content:
        "Các thay đổi hiện tại sẽ bị bỏ và dữ liệu sẽ được lấy lại từ máy chủ.",
      okText: "Bỏ bản nháp",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        removeStudentDraft(classId);

        setDraftExists(false);

        setChangedIds(new Set());

        /**
         * Cho phép load server
         * mà không restore draft.
         */
        restoredDraftRef.current = true;

        await loadStudents({
          preserveDraft: false,
        });

        notify.success("Đã bỏ bản nháp");
      },
    });
  }, [classId, changedCount, loadStudents, notify]);

  /* =========================================================
     RELOAD
  ========================================================= */

  const handleReload = useCallback(() => {
    /**
     * Nếu có thay đổi:
     * đưa qua guard.
     */
    if (changedCount > 0) {
      requestLeave(async () => {
        /**
         * Nếu người dùng chọn RỜI TRANG
         * cho reload thì phải bỏ dirty
         * và lấy server.
         */
        removeStudentDraft(classId);

        setDraftExists(false);

        setChangedIds(new Set());

        restoredDraftRef.current = true;

        await loadStudents({
          preserveDraft: false,
        });
      });

      return;
    }

    restoredDraftRef.current = true;

    loadStudents({
      preserveDraft: false,
    });
  }, [changedCount, requestLeave, classId, loadStudents]);

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const columns = useMemo(() => {
    /**
     * TEXT COLUMN
     */
    const makeTextColumn = ({
      title,
      dataIndex,
      width = 125,
      fixed,
      placeholder,
      multiline = false,
    }) => ({
      title,
      dataIndex,
      key: dataIndex,
      width,
      fixed,
      ellipsis: true,

      render: (_, record) => (
        <EditableTextCell
          value={record[dataIndex]}
          placeholder={placeholder || title}
          width={width - 14}
          multiline={multiline}
          onChange={(value) => updateStudentField(record.id, dataIndex, value)}
        />
      ),
    });

    /**
     * DATE COLUMN
     */
    const makeDateColumn = ({ title, dataIndex, width = 112 }) => ({
      title,
      dataIndex,
      key: dataIndex,
      width,

      render: (_, record) => (
        <EditableDateCell
          value={record[dataIndex]}
          width={width - 10}
          onChange={(value) => updateStudentField(record.id, dataIndex, value)}
        />
      ),
    });

    /**
     * SELECT COLUMN
     */
    const makeSelectColumn = ({ title, dataIndex, options, width = 110 }) => ({
      title,
      dataIndex,
      key: dataIndex,
      width,

      render: (_, record) => (
        <Select
          value={record[dataIndex] || undefined}
          placeholder={title}
          options={options}
          allowClear
          size="small"
          onChange={(value) =>
            updateStudentField(record.id, dataIndex, value || null)
          }
          style={{
            width: width - 12,
          }}
        />
      ),
    });

    return [
      /* ===================================================
         STT
      =================================================== */

      {
        title: "STT",
        key: "index",
        width: 55,
        fixed: "left",
        align: "center",

        render: (_, __, index) => (
          <Text className="student-index">{index + 1}</Text>
        ),
      },

      /* ===================================================
         CODE
      =================================================== */

      {
        title: "Mã HS",
        dataIndex: "code",
        key: "code",
        width: 100,
        fixed: "left",

        render: (value) => (
          <Text strong className="student-code">
            {value || "-"}
          </Text>
        ),
      },

      /* ===================================================
         BASIC INFORMATION
      =================================================== */

      makeTextColumn({
        title: "Họ tên",
        dataIndex: "name",
        width: 170,
        fixed: "left",
      }),

      makeSelectColumn({
        title: "Giới tính",
        dataIndex: "gender",
        options: GENDER_OPTIONS,
        width: 100,
      }),

      makeDateColumn({
        title: "Ngày sinh",
        dataIndex: "date_of_birth",
        width: 120,
      }),

      makeTextColumn({
        title: "Nơi sinh",
        dataIndex: "birth_place",
        width: 135,
      }),

      makeTextColumn({
        title: "Quốc tịch",
        dataIndex: "nationality",
        width: 110,
      }),

      makeTextColumn({
        title: "SĐT",
        dataIndex: "phone",
        width: 120,
      }),

      makeTextColumn({
        title: "Email",
        dataIndex: "email",
        width: 175,
      }),

      makeTextColumn({
        title: "Địa chỉ",
        dataIndex: "address",
        width: 175,
      }),

      makeTextColumn({
        title: "Giáo xứ",
        dataIndex: "parish",
        width: 140,
      }),

      /* ===================================================
         FAMILY
      =================================================== */

      makeTextColumn({
        title: "Tên cha",
        dataIndex: "father_name",
        width: 140,
      }),

      makeTextColumn({
        title: "SĐT cha",
        dataIndex: "father_phone",
        width: 120,
      }),

      makeTextColumn({
        title: "Tên mẹ",
        dataIndex: "mother_name",
        width: 140,
      }),

      makeTextColumn({
        title: "SĐT mẹ",
        dataIndex: "mother_phone",
        width: 120,
      }),

      makeTextColumn({
        title: "Giám hộ",
        dataIndex: "guardian_name",
        width: 140,
      }),

      makeTextColumn({
        title: "SĐT giám hộ",
        dataIndex: "guardian_phone",
        width: 130,
      }),

      makeTextColumn({
        title: "Quan hệ",
        dataIndex: "guardian_relationship",
        width: 120,
      }),

      /* ===================================================
         BAPTISM
      =================================================== */

      makeTextColumn({
        title: "Tên thánh Rửa tội",
        dataIndex: "baptism_name",
        width: 155,
      }),

      makeDateColumn({
        title: "Ngày Rửa tội",
        dataIndex: "baptism_date",
        width: 125,
      }),

      makeTextColumn({
        title: "Nơi Rửa tội",
        dataIndex: "baptism_place",
        width: 145,
      }),

      makeTextColumn({
        title: "Giáo xứ Rửa tội",
        dataIndex: "baptism_parish",
        width: 145,
      }),

      makeTextColumn({
        title: "Số chứng thư",
        dataIndex: "baptism_certificate_no",
        width: 145,
      }),

      /* ===================================================
         SACRAMENTS
      =================================================== */

      makeTextColumn({
        title: "Tên thánh",
        dataIndex: "saint_name",
        width: 120,
      }),

      makeDateColumn({
        title: "Ngày Rước lễ",
        dataIndex: "first_communion_date",
        width: 125,
      }),

      makeTextColumn({
        title: "Nơi Rước lễ",
        dataIndex: "first_communion_place",
        width: 145,
      }),

      makeDateColumn({
        title: "Ngày Thêm sức",
        dataIndex: "confirmation_date",
        width: 125,
      }),

      makeTextColumn({
        title: "Nơi Thêm sức",
        dataIndex: "confirmation_place",
        width: 145,
      }),

      makeTextColumn({
        title: "Tên thánh Thêm sức",
        dataIndex: "confirmation_saint_name",
        width: 160,
      }),

      /* ===================================================
         CATECHISM
      =================================================== */

      makeTextColumn({
        title: "Khối giáo lý",
        dataIndex: "catechism_level",
        width: 125,
      }),

      makeSelectColumn({
        title: "Trạng thái giáo lý",
        dataIndex: "catechism_status",
        options: CATECHISM_STATUS_OPTIONS,
        width: 155,
      }),

      makeDateColumn({
        title: "Ngày nhập học",
        dataIndex: "enrollment_date",
        width: 130,
      }),

      /* ===================================================
         NOTE / STATUS
      =================================================== */

      makeTextColumn({
        title: "Ghi chú",
        dataIndex: "note",
        width: 170,
        multiline: true,
      }),

      makeSelectColumn({
        title: "Trạng thái",
        dataIndex: "status",
        options: STATUS_OPTIONS,
        width: 130,
      }),

      /* ===================================================
         QR
      =================================================== */

      {
        title: "QR",
        key: "qr",
        width: 65,
        fixed: "right",
        align: "center",

        render: (_, record) => (
          <AppButton
            size="small"
            className="student-qr-button"
            title={`Mã QR của ${record.name || "học sinh"}`}
            onClick={() => handleOpenQR(record)}
          >
            <QrcodeOutlined />
          </AppButton>
        ),
      },
    ];
  }, [updateStudentField, handleOpenQR]);

  /* =========================================================
     TABLE DATA
  ========================================================= */

  const tableData = useMemo(
    () =>
      students.map((student) => ({
        ...student,
        key: student.id,
      })),
    [students],
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Layout className="student-bulk-layout">
      <Content className="student-bulk-content">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="student-bulk-header">
          <div className="student-bulk-header-left">
            <AppButton
              size="small"
              type="button"
              className="student-back-button"
              onClick={handleBack}
            >
              <ArrowLeftOutlined />
            </AppButton>
            <div className="student-heading">
              <div className="student-heading-icon">
                <EditOutlined />
              </div>

              <div className="student-heading-content">
                <Title level={4}>Chỉnh sửa danh sách học sinh</Title>

                <Text className="student-heading-subtitle">
                  Quản lý và cập nhật thông tin học sinh trong lớp
                </Text>
              </div>
            </div>

            {classInfo && (
              <div className="student-class-info">
                <span className="student-class-label">
                  <TeamOutlined />
                  Lớp học
                </span>

                <span className="student-class-name">{classInfo.name}</span>

                {classInfo.code && (
                  <Tag className="student-class-code">{classInfo.code}</Tag>
                )}
              </div>
            )}
          </div>

          {/* =================================================
              HEADER ACTIONS
          ================================================= */}

          <div className="student-bulk-actions">
            <div className="student-total-card">
              <div className="student-total-icon">
                <TeamOutlined />
              </div>

              <div>
                <div className="student-total-number">{students.length}</div>

                <div className="student-total-label">Học sinh</div>
              </div>
            </div>

            <div
              className={`student-pending-card ${
                changedCount > 0 ? "has-changes" : ""
              }`}
            >
              <div className="student-pending-icon">
                {changedCount > 0 ? (
                  <ExclamationCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )}
              </div>

              <div>
                <div className="student-pending-number">{changedCount}</div>

                <div className="student-pending-label">Chưa lưu</div>
              </div>
            </div>

            <div className="student-action-buttons">
              <AppButton
                size="small"
                type="button"
                className="student-btn student-btn-refresh"
                disabled={loading || saving}
                onClick={handleReload}
              >
                Tải lại
              </AppButton>

              <AppButton
                size="small"
                type="button"
                className="student-btn student-btn-save"
                disabled={changedCount === 0 || saving}
                onClick={handleSave}
              >
                {saving ? <Spin size="small" /> : <SaveOutlined />}

                <span>
                  {saving
                    ? "Đang lưu..."
                    : `Lưu thay đổi${
                        changedCount > 0 ? ` (${changedCount})` : ""
                      }`}
                </span>
              </AppButton>
            </div>
          </div>
        </div>

        {/* =================================================
            DRAFT NOTICE
        ================================================= */}

        {draftExists && changedCount > 0 && (
          <Alert
            className="student-draft-alert"
            type="info"
            showIcon
            message={<span>Đã khôi phục bản nháp chưa lưu</span>}
            description={
              <span>
                FaithEdu đã khôi phục các thay đổi trước đó từ trình duyệt. Bản
                nháp sẽ được xóa sau khi lưu thành công.{" "}
                <AppButton
                  size="small"
                  type="button"
                  className="student-discard-draft"
                  onClick={handleDiscardDraft}
                >
                  Bỏ bản nháp
                </AppButton>
              </span>
            }
          />
        )}

        {/* =================================================
            UNSAVED NOTICE
        ================================================= */}

        {changedCount > 0 && (
          <Alert
            className="student-unsaved-alert"
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            message={
              <span>
                Có <strong>{changedCount}</strong> học sinh đang có thay đổi
                chưa lưu.
              </span>
            }
            description="Các dòng được đánh dấu màu vàng là những học sinh đã chỉnh sửa. Hãy lưu để cập nhật dữ liệu."
          />
        )}

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="student-bulk-table-wrapper">
          <div className="student-table-toolbar">
            <div className="student-table-toolbar-left">
              <div className="student-table-title-icon">
                <TeamOutlined />
              </div>

              <div>
                <div className="student-table-title">Danh sách học sinh</div>

                <div className="student-table-description">
                  Chỉnh sửa trực tiếp tại từng ô dữ liệu
                </div>
              </div>
            </div>

            <div className="student-table-toolbar-right">
              <span className="student-table-hint">
                <EditOutlined />
                Nhấn vào ô để chỉnh sửa
              </span>

              {changedCount > 0 && (
                <span className="student-changed-badge">
                  {changedCount} dòng đã sửa
                </span>
              )}
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="student-bulk-loading">
              <Spin size="large" />

              <Text>Đang tải danh sách học sinh...</Text>
            </div>
          ) : students.length === 0 ? (
            <div className="student-bulk-empty">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Lớp học chưa có học sinh"
              />
            </div>
          ) : (
            <Table
              className="student-bulk-table"
              rowKey="id"
              columns={columns}
              dataSource={tableData}
              loading={saving}
              pagination={false}
              bordered={false}
              size="small"
              scroll={{
                x: "max-content",
                y: "calc(100vh - 290px)",
              }}
              rowClassName={(record) =>
                changedIds.has(record.id) ? "student-bulk-row-changed" : ""
              }
            />
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          {!loading && students.length > 0 && (
            <div className="student-table-footer">
              <div className="student-footer-left">
                Hiển thị <strong>{students.length}</strong> học sinh
              </div>

              <div className="student-footer-right">
                <span className="student-footer-dot" />

                <span>
                  {changedCount > 0
                    ? `${changedCount} học sinh cần lưu`
                    : "Dữ liệu đã được tải"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            UNSAVED CHANGES MODAL
        ================================================= */}

        <UnsavedChangesModal
          open={unsavedModalOpen}
          changedCount={changedCount}
          loading={unsavedModalSaving || saving}
          onCancel={stayOnPage}
          onLeave={leaveWithoutSave}
          onSaveAndLeave={saveAndLeave}
        />
      </Content>

      {/* ===================================================
          STYLES
      =================================================== */}

      <style>{`
        /* =========================================
           PAGE
        ========================================= */

        .student-bulk-layout {
          min-height: 100vh !important;
          background: #f3f6fb !important;
          color: #203552;
        }

        .student-bulk-content {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding: 22px 24px !important;
        }

        /* =========================================
           HEADER
        ========================================= */

        .student-bulk-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          padding: 22px 24px;
          margin-bottom: 18px;
          background: #fff;
          border: 1px solid #e4eaf3;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(26, 52, 91, 0.045);
        }

        .student-bulk-header-left {
          min-width: 0;
          flex: 1;
        }

        .student-back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 30px;
          padding: 0 9px;
          margin: 0 0 13px -9px;
          color: #65758d;
          background: transparent;
          border: 0;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 550;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .student-back-button:hover {
          color: #1c4e91;
          background: #eff5ff;
        }

        .student-heading {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .student-heading-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 49px;
          height: 49px;
          color: #fff;
          background: linear-gradient(145deg, #285da7, #173c75);
          border-radius: 13px;
          box-shadow: 0 5px 12px rgba(35, 79, 145, 0.2);
          font-size: 21px;
        }

        .student-heading-content {
          min-width: 0;
        }

        .student-heading-content h4 {
          margin: 0 !important;
          color: #19365f !important;
          font-size: 22px !important;
          font-weight: 750 !important;
          letter-spacing: -0.5px;
          line-height: 1.4 !important;
        }

        .student-heading-subtitle {
          display: block;
          margin-top: 5px;
          color: #8190a6;
          font-size: 12px;
          line-height: 1.6;
        }

        /* =========================================
           CLASS INFO
        ========================================= */

        .student-class-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid #edf1f6;
        }

        .student-class-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #7b8ba2;
          font-size: 12px;
        }

        .student-class-label .anticon {
          color: #416eae;
        }

        .student-class-name {
          color: #234878;
          font-size: 13px;
          font-weight: 700;
        }

        .student-class-code {
          margin: 0 !important;
          padding: 2px 9px !important;
          color: #3b6299 !important;
          background: #edf4ff !important;
          border: 1px solid #dce8fa !important;
          border-radius: 20px !important;
          font-size: 11px;
        }

        /* =========================================
           HEADER STATISTICS
        ========================================= */

        .student-bulk-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .student-total-card,
        .student-pending-card {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 112px;
          padding: 10px 13px;
          background: #f5f8fd;
          border: 1px solid #e8eef7;
          border-radius: 11px;
        }

        .student-total-icon,
        .student-pending-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          color: #2f62a6;
          background: #e4edfc;
          border-radius: 9px;
          font-size: 16px;
        }

        .student-pending-icon {
          color: #8695a9;
          background: #edf1f6;
        }

        .student-pending-card.has-changes {
          background: #fffbef;
          border-color: #f2dfad;
        }

        .student-pending-card.has-changes
          .student-pending-icon {
          color: #a77718;
          background: #fff0c6;
        }

        .student-total-number,
        .student-pending-number {
          color: #1d3c67;
          font-size: 18px;
          font-weight: 750;
          line-height: 1.2;
          font-variant-numeric: tabular-nums;
        }

        .student-pending-number {
          color: #64748b;
        }

        .student-pending-card.has-changes
          .student-pending-number {
          color: #946715;
        }

        .student-total-label,
        .student-pending-label {
          margin-top: 3px;
          color: #8492a6;
          font-size: 10px;
          white-space: nowrap;
        }

        .student-action-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 4px;
        }

        .student-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 14px;
          border: 1px solid transparent;
          border-radius: 9px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 650;
          white-space: nowrap;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .student-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .student-btn-refresh {
          color: #415b7e;
          background: #fff;
          border-color: #dfe7f1;
        }

        .student-btn-refresh:hover:not(:disabled) {
          color: #1d4d8e;
          background: #f1f6ff;
          border-color: #b9cce8;
        }

        .student-btn-save {
          color: #fff;
          background: #204c8a;
          box-shadow: 0 3px 8px rgba(32, 76, 138, 0.14);
        }

        .student-btn-save:hover:not(:disabled) {
          background: #173a6d;
          box-shadow: 0 5px 12px rgba(32, 76, 138, 0.2);
        }

        /* =========================================
           DRAFT ALERT
        ========================================= */

        .student-draft-alert {
          margin-bottom: 12px !important;
          padding: 11px 15px !important;
          background: #f4f8ff !important;
          border: 1px solid #d8e6fa !important;
          border-radius: 12px !important;
        }

        .student-draft-alert .ant-alert-message {
          color: #315b98 !important;
          font-size: 13px;
          font-weight: 650;
        }

        .student-draft-alert .ant-alert-description {
          margin-top: 4px;
          color: #7185a1 !important;
          font-size: 12px;
        }

        .student-discard-draft {
          padding: 0;
          color: #b33d3d;
          background: transparent;
          border: 0;
          font: inherit;
          font-weight: 650;
          text-decoration: underline;
          cursor: pointer;
        }

        .student-discard-draft:hover {
          color: #8f2020;
        }

        /* =========================================
           UNSAVED ALERT
        ========================================= */

        .student-unsaved-alert {
          margin-bottom: 16px !important;
          padding: 12px 16px !important;
          background: #fffaf0 !important;
          border: 1px solid #f1dfb2 !important;
          border-radius: 12px !important;
        }

        .student-unsaved-alert .ant-alert-message {
          color: #79591b !important;
          font-size: 13px;
          font-weight: 650;
        }

        .student-unsaved-alert .ant-alert-description {
          margin-top: 4px;
          color: #927b4e !important;
          font-size: 12px;
        }

        /* =========================================
           TABLE WRAPPER
        ========================================= */

        .student-bulk-table-wrapper {
          width: 100%;
          min-width: 0;
          overflow: hidden;
          background: #fff;
          border: 1px solid #e1e8f2;
          border-radius: 15px;
          box-shadow: 0 4px 18px rgba(26, 52, 91, 0.045);
        }

        .student-table-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          padding: 15px 20px;
          background: #fff;
          border-bottom: 1px solid #e9eef5;
        }

        .student-table-toolbar-left {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .student-table-title-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 37px;
          height: 37px;
          color: #2c5a99;
          background: #edf4ff;
          border-radius: 10px;
          font-size: 17px;
        }

        .student-table-title {
          color: #233e65;
          font-size: 14px;
          font-weight: 750;
        }

        .student-table-description {
          margin-top: 4px;
          color: #8b98ab;
          font-size: 11px;
        }

        .student-table-toolbar-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }

        .student-table-hint {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #8492a6;
          font-size: 11px;
        }

        .student-changed-badge {
          padding: 5px 10px;
          color: #916a1d;
          background: #fff5d9;
          border: 1px solid #f0dfb3;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 650;
        }

        /* =========================================
           TABLE
        ========================================= */

        .student-bulk-table {
          width: 100%;
        }

        .student-bulk-table .ant-table {
          color: #344762;
          font-size: 11px !important;
        }

        .student-bulk-table .ant-table-container {
          border-radius: 0 !important;
        }

        .student-bulk-table .ant-table-thead > tr > th {
          height: 41px !important;
          padding: 9px 8px !important;
          color: #304c72 !important;
          background: #eef3fb !important;
          border-bottom: 1px solid #dce5f1 !important;
          white-space: nowrap;
          font-size: 11px !important;
          font-weight: 750 !important;
        }

        .student-bulk-table
          .ant-table-thead
          > tr
          > th::before {
          display: none !important;
        }

        .student-bulk-table
          .ant-table-tbody
          > tr
          > td {
          height: 42px;
          padding: 5px 7px !important;
          color: #465873;
          background: #fff;
          border-bottom: 1px solid #edf1f6 !important;
          font-size: 11px !important;
          vertical-align: middle;
          transition: background 0.15s ease;
        }

        .student-bulk-table
          .ant-table-tbody
          > tr:nth-child(even)
          > td {
          background: #fafbfd;
        }

        .student-bulk-table
          .ant-table-tbody
          > tr:hover
          > td {
          background: #f0f6ff !important;
        }

        .student-index {
          color: #94a3b8;
          font-size: 11px;
          font-variant-numeric: tabular-nums;
        }

        .student-code {
          color: #315b98;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* =========================================
           INPUT
        ========================================= */

        .student-bulk-input {
          height: 30px !important;
          padding: 4px 7px !important;
          color: #2e425f !important;
          background: #fff !important;
          border: 1px solid #e1e7f0 !important;
          border-radius: 6px !important;
          box-shadow: none !important;
          font-size: 11px !important;
          transition: all 0.18s ease;
        }

        .student-bulk-input:hover {
          border-color: #b4c7e4 !important;
        }

        .student-bulk-input:focus,
        .student-bulk-input:focus-within {
          border-color: #5285d5 !important;
          box-shadow: 0 0 0 2px rgba(82, 133, 213, 0.12) !important;
        }

        .student-bulk-input::placeholder {
          color: #a2afc1 !important;
          font-size: 10px;
        }

        textarea.student-bulk-input {
          min-height: 30px !important;
          line-height: 1.5;
          resize: vertical;
        }

        /* =========================================
           SELECT
        ========================================= */

        .student-bulk-table .ant-select {
          font-size: 11px !important;
        }

        .student-bulk-table
          .ant-select-selector {
          height: 30px !important;
          min-height: 30px !important;
          padding: 0 7px !important;
          background: #fff !important;
          border: 1px solid #e1e7f0 !important;
          border-radius: 6px !important;
          box-shadow: none !important;
        }

        .student-bulk-table
          .ant-select:hover
          .ant-select-selector {
          border-color: #b4c7e4 !important;
        }

        .student-bulk-table
          .ant-select-focused
          .ant-select-selector {
          border-color: #5285d5 !important;
          box-shadow: 0 0 0 2px rgba(82, 133, 213, 0.12) !important;
        }

        .student-bulk-table
          .ant-select-selection-item,
        .student-bulk-table
          .ant-select-selection-placeholder {
          line-height: 28px !important;
          font-size: 11px !important;
        }

        /* =========================================
           DATE PICKER
        ========================================= */

        .student-bulk-picker {
          height: 30px !important;
          padding: 3px 6px !important;
          background: #fff !important;
          border: 1px solid #e1e7f0 !important;
          border-radius: 6px !important;
          box-shadow: none !important;
          transition: all 0.18s ease;
        }

        .student-bulk-picker:hover {
          border-color: #b4c7e4 !important;
        }

        .student-bulk-picker.ant-picker-focused {
          border-color: #5285d5 !important;
          box-shadow: 0 0 0 2px rgba(82, 133, 213, 0.12) !important;
        }

        .student-bulk-picker input {
          color: #2e425f;
          font-size: 10px !important;
        }

        .student-bulk-picker input::placeholder {
          color: #a2afc1;
        }

        /* =========================================
           CHANGED ROW
        ========================================= */

        .student-bulk-table
          .ant-table-tbody
          > tr.student-bulk-row-changed
          > td {
          background: #fff8e5 !important;
          border-bottom-color: #f3e7c6 !important;
        }

        .student-bulk-table
          .ant-table-tbody
          > tr.student-bulk-row-changed:hover
          > td {
          background: #fff0c9 !important;
        }

        .student-bulk-table
          .ant-table-tbody
          > tr.student-bulk-row-changed
          > td:first-child {
          box-shadow: inset 3px 0 0 #e5ad35;
        }

        .student-bulk-row-changed
          .student-bulk-input,
        .student-bulk-row-changed
          .student-bulk-picker,
        .student-bulk-row-changed
          .ant-select-selector {
          border-color: #ead7a5 !important;
        }

        /* =========================================
           FIXED COLUMNS
        ========================================= */

        .student-bulk-table
          .ant-table-cell-fix-left,
        .student-bulk-table
          .ant-table-cell-fix-right {
          background: #fff;
        }

        .student-bulk-table
          .ant-table-tbody
          > tr:nth-child(even)
          > .ant-table-cell-fix-left,
        .student-bulk-table
          .ant-table-tbody
          > tr:nth-child(even)
          > .ant-table-cell-fix-right {
          background: #fafbfd;
        }

        .student-bulk-table
          .ant-table-tbody
          > tr:hover
          > .ant-table-cell-fix-left,
        .student-bulk-table
          .ant-table-tbody
          > tr:hover
          > .ant-table-cell-fix-right {
          background: #f0f6ff !important;
        }

        .student-bulk-table
          .ant-table-tbody
          > tr.student-bulk-row-changed
          > .ant-table-cell-fix-left,
        .student-bulk-table
          .ant-table-tbody
          > tr.student-bulk-row-changed
          > .ant-table-cell-fix-right {
          background: #fff8e5 !important;
        }

        /* =========================================
           QR BUTTON
        ========================================= */

        .student-qr-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 31px;
          height: 31px;
          color: #315b98;
          background: #edf4ff;
          border: 1px solid #d9e7fc;
          border-radius: 8px;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .student-qr-button:hover {
          color: #fff;
          background: #315b98;
          border-color: #315b98;
        }

        /* =========================================
           FOOTER
        ========================================= */

        .student-table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          min-height: 43px;
          padding: 10px 18px;
          color: #8492a6;
          background: #fff;
          border-top: 1px solid #e9eef5;
          font-size: 11px;
        }

        .student-footer-left strong {
          color: #35547e;
          font-weight: 750;
        }

        .student-footer-right {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .student-footer-dot {
          width: 7px;
          height: 7px;
          background: #40a878;
          border-radius: 50%;
        }

        /* =========================================
           LOADING / EMPTY
        ========================================= */

        .student-bulk-loading,
        .student-bulk-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 16px;
          min-height: 360px;
          background: #fff;
        }

        .student-bulk-loading
          > .ant-typography {
          color: #8190a6;
          font-size: 12px;
        }

        .student-bulk-empty
          .ant-empty-description {
          color: #8190a6;
          font-size: 12px;
        }

        /* =========================================
           SCROLLBAR
        ========================================= */

        .student-bulk-table
          .ant-table-body,
        .student-bulk-table
          .ant-table-content {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f5f7fb;
        }

        .student-bulk-table
          .ant-table-body::-webkit-scrollbar,
        .student-bulk-table
          .ant-table-content::-webkit-scrollbar {
          width: 8px;
          height: 9px;
        }

        .student-bulk-table
          .ant-table-body::-webkit-scrollbar-thumb,
        .student-bulk-table
          .ant-table-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border: 2px solid #f8fafc;
          border-radius: 20px;
        }

        .student-bulk-table
          .ant-table-body::-webkit-scrollbar-thumb:hover,
        .student-bulk-table
          .ant-table-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* =========================================
           LARGE DESKTOP
        ========================================= */

        @media (min-width: 1600px) {
          .student-bulk-content {
            padding: 24px 28px !important;
          }

          .student-bulk-table
            .ant-table-thead
            > tr
            > th {
            height: 43px !important;
            font-size: 11px !important;
          }

          .student-bulk-table
            .ant-table-tbody
            > tr
            > td {
            height: 44px;
          }
        }

        /* =========================================
           LAPTOP
        ========================================= */

        @media (max-width: 1366px) {
          .student-bulk-content {
            padding: 14px !important;
          }

          .student-bulk-header {
            padding: 17px;
            gap: 16px;
          }

          .student-heading-content h4 {
            font-size: 19px !important;
          }

          .student-heading-icon {
            width: 43px;
            height: 43px;
            font-size: 18px;
          }

          .student-total-card,
          .student-pending-card {
            min-width: 95px;
            padding: 9px;
          }

          .student-bulk-actions {
            gap: 7px;
          }

          .student-action-buttons {
            gap: 6px;
            margin-left: 0;
          }

          .student-btn {
            min-height: 36px;
            padding: 0 10px;
            font-size: 11px;
          }

          .student-bulk-table
            .ant-table-thead
            > tr
            > th {
            padding: 8px 6px !important;
            font-size: 10px !important;
          }

          .student-bulk-table
            .ant-table-tbody
            > tr
            > td {
            padding: 5px !important;
            font-size: 10px !important;
          }

          .student-bulk-input {
            font-size: 10px !important;
          }
        }

        /* =========================================
           TABLET / MOBILE
        ========================================= */

        @media (max-width: 768px) {
          .student-bulk-content {
            padding: 10px !important;
          }

          .student-bulk-header {
            align-items: stretch;
            flex-direction: column;
            padding: 15px;
            gap: 16px;
            border-radius: 12px;
          }

          .student-heading {
            align-items: flex-start;
            gap: 10px;
          }

          .student-heading-icon {
            width: 39px;
            height: 39px;
            border-radius: 10px;
            font-size: 16px;
          }

          .student-heading-content h4 {
            font-size: 17px !important;
          }

          .student-heading-subtitle {
            font-size: 11px;
          }

          .student-class-info {
            margin-top: 13px;
            padding-top: 12px;
          }

          .student-bulk-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .student-total-card,
          .student-pending-card {
            min-width: 0;
          }

          .student-action-buttons {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 1fr 1.4fr;
            margin-top: 3px;
          }

          .student-btn {
            width: 100%;
            min-height: 40px;
          }

          .student-table-toolbar {
            align-items: flex-start;
            flex-direction: column;
            padding: 13px;
          }

          .student-table-toolbar-right {
            justify-content: flex-start;
          }

          .student-bulk-table-wrapper {
            border-radius: 11px;
          }

          .student-unsaved-alert,
          .student-draft-alert {
            padding: 10px 12px !important;
          }

          .student-table-footer {
            padding: 10px 12px;
          }
        }

        /* =========================================
           REDUCED MOTION
        ========================================= */

        @media (prefers-reduced-motion: reduce) {
          .student-bulk-layout *,
          .student-bulk-layout *::before,
          .student-bulk-layout *::after {
            transition: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}
