import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  IdcardOutlined,
  LockOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  SwapOutlined,
  TeamOutlined,
  UnlockOutlined,
  UserOutlined,
  UserSwitchOutlined,
  QrcodeOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import studentApi from "../../api/studentApi";
import classStudentApi from "../../api/classStudentApi";
import classApi from "../../api/classApi";

import AppFormModal from "../../components/common/AppFormModal";
import StudentForm from "../../components/forms/StudentForm";
import StatCard from "../../components/common/StatCard";
import AppDetailModal from "../../components/common/AppDetailModal";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import AppButton from "../../components/common/AppButton";

import { QRCodeCanvas } from "qrcode.react";

const { Text } = Typography;

/* =====================================================
   FAITHEDU THEME
===================================================== */

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

  danger: "#C0392B",
  dangerBg: "#FDEDEC",

  gray: "#64748B",
  grayBg: "#F1F5F9",
};

const EMPTY_VALUE = "-";

/* =====================================================
   HELPERS
===================================================== */

const getResponseData = (response, keys = []) => {
  const data = response?.data;

  if (data?.data !== undefined) {
    return data.data;
  }

  for (const key of keys) {
    if (data?.[key] !== undefined) {
      return data[key];
    }
  }

  return data ?? [];
};

const displayValue = (value) => {
  return value === null ||
    value === undefined ||
    value === "" ||
    value === EMPTY_VALUE
    ? EMPTY_VALUE
    : value;
};

const formatDate = (value) => {
  if (!value) return EMPTY_VALUE;

  const date = dayjs.isDayjs(value) ? value : dayjs(value);

  return date.isValid() ? date.format("DD/MM/YYYY") : EMPTY_VALUE;
};

const formatDateForApi = (value) => {
  if (!value) return null;

  const date = dayjs.isDayjs(value) ? value : dayjs(value);

  return date.isValid() ? date.format("YYYY-MM-DD") : null;
};

const getApiOrigin = () => {
  const baseURL = process.env.REACT_APP_API_URL || "http://localhost:12003/api";

  return baseURL.replace(/\/api\/?$/, "");
};

const getAvatarUrl = (avatar) => {
  if (!avatar) {
    return null;
  }

  if (/^https?:\/\//i.test(avatar)) {
    return avatar;
  }

  const origin = getApiOrigin();

  return `${origin}${avatar.startsWith("/") ? avatar : `/${avatar}`}`;
};
/* =====================================================
   COMPONENT
===================================================== */

export default function StudentManagement() {
  /* ===================================================
     DATA
  =================================================== */

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  /* ===================================================
     LOADING
  =================================================== */

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [actionLoading, setActionLoading] = useState({
    delete: null,
    toggle: null,
    changeClass: null,
  });

  const didInitialFetch = useRef(false);
  const mountedRef = useRef(true);

  /* ===================================================
     UI STATE
  =================================================== */

  const [activeClassTab, setActiveClassTab] = useState("all");

  const [searchText, setSearchText] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /* ===================================================
     FORM MODAL
  =================================================== */

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [editingStudent, setEditingStudent] = useState(null);

  /* ===================================================
     DETAIL MODAL
  =================================================== */

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [detailStudent, setDetailStudent] = useState(null);

  /* ===================================================
     CHANGE CLASS
  =================================================== */

  const [isChangeClassModalOpen, setIsChangeClassModalOpen] = useState(false);

  const [changeClassStudent, setChangeClassStudent] = useState(null);

  const [importing, setImporting] = useState(false);

  /* ===================================================
     QR
  =================================================== */

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const [qrStudent, setQrStudent] = useState(null);

  const handleOpenQR = useCallback((student) => {
    if (!student?.qr_token) {
      message.warning("Học sinh này chưa có mã QR. Vui lòng tạo mã QR trước!");
      return;
    }

    setQrStudent(student);
    setIsQRModalOpen(true);
  }, []);

  const handleDownloadQR = useCallback(() => {
    if (!qrStudent?.qr_token) {
      message.warning("Không có mã QR để tải!");
      return;
    }

    const qrCanvas = document.getElementById(`student-qr-${qrStudent.id}`);

    if (!qrCanvas) {
      message.error("Không tìm thấy ảnh QR!");
      return;
    }

    try {
      const studentName = qrStudent.full_name || qrStudent.name || "Học sinh";

      const studentCode = qrStudent.code || `HS-${qrStudent.id}`;

      const className =
        qrStudent.class_name ||
        qrStudent.className ||
        qrStudent.class?.name ||
        qrStudent.class?.class_name ||
        "Chưa xếp lớp";

      const qrSize = qrCanvas.width || 300;

      const padding = 30;

      const nameFontSize = 24;
      const codeFontSize = 19;
      const classFontSize = 18;

      const nameHeight = 40;
      const codeHeight = 32;
      const classHeight = 32;

      const canvasWidth = qrSize + padding * 2;

      const canvasHeight =
        qrSize + padding * 2 + nameHeight + codeHeight + classHeight + 20;

      const canvas = document.createElement("canvas");

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Không thể tạo Canvas Context");
      }

      ctx.fillStyle = COLORS.white;

      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#1E293B";

      ctx.font = `600 ${nameFontSize}px Arial`;

      ctx.fillText(studentName, canvasWidth / 2, qrSize + padding + 20);

      ctx.fillStyle = COLORS.textSecondary;

      ctx.font = `500 ${codeFontSize}px Arial`;

      ctx.fillText(studentCode, canvasWidth / 2, qrSize + padding + 52);

      ctx.fillStyle = COLORS.navy;

      ctx.font = `600 ${classFontSize}px Arial`;

      ctx.fillText(`Lớp: ${className}`, canvasWidth / 2, qrSize + padding + 84);

      const link = document.createElement("a");

      link.download = `${studentCode}-QR.png`;

      link.href = canvas.toDataURL("image/png");

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      message.success("Đã tải mã QR!");
    } catch (error) {
      message.error("Không thể tải mã QR!");
    }
  }, [qrStudent]);

  /* ===================================================
     FORMS
  =================================================== */

  const [form] = Form.useForm();

  const [changeClassForm] = Form.useForm();

  /* ===================================================
     ACTION LOADING
  =================================================== */

  const setActionLoadingState = useCallback((type, id) => {
    setActionLoading((prev) => ({
      ...prev,
      [type]: id,
    }));
  }, []);

  const clearActionLoadingState = useCallback((type) => {
    setActionLoading((prev) => ({
      ...prev,
      [type]: null,
    }));
  }, []);

  /* ===================================================
     FORMAT STUDENT
  =================================================== */

  const formatStudent = useCallback((student, relation, classData) => {
    const classId =
      relation?.class_id ??
      relation?.classId ??
      student?.class_id ??
      student?.classId ??
      null;

    const matchedClass = classData.find(
      (item) => String(item.id) === String(classId),
    );

    return {
      key: student.id,
      id: student.id,

      qr_token: student.qr_token || null,

      code: student.code || EMPTY_VALUE,

      name: student.name || "Chưa có tên",

      gender: student.gender || "Khác",

      date_of_birth: student.date_of_birth || null,

      birth_place: student.birth_place || EMPTY_VALUE,

      nationality: student.nationality || "Việt Nam",

      phone: student.phone || EMPTY_VALUE,

      email: student.email || EMPTY_VALUE,

      address: student.address || EMPTY_VALUE,

      parish: student.parish || EMPTY_VALUE,

      father_name: student.father_name || EMPTY_VALUE,

      father_phone: student.father_phone || EMPTY_VALUE,

      mother_name: student.mother_name || EMPTY_VALUE,

      mother_phone: student.mother_phone || EMPTY_VALUE,

      guardian_name: student.guardian_name || EMPTY_VALUE,

      guardian_phone: student.guardian_phone || EMPTY_VALUE,

      guardian_relationship: student.guardian_relationship || EMPTY_VALUE,

      baptism_name: student.baptism_name || EMPTY_VALUE,

      baptism_date: student.baptism_date || null,

      baptism_place: student.baptism_place || EMPTY_VALUE,

      baptism_parish: student.baptism_parish || EMPTY_VALUE,

      baptism_certificate_no: student.baptism_certificate_no || EMPTY_VALUE,

      saint_name: student.saint_name || EMPTY_VALUE,

      first_communion_date: student.first_communion_date || null,

      first_communion_place: student.first_communion_place || EMPTY_VALUE,

      confirmation_date: student.confirmation_date || null,

      confirmation_place: student.confirmation_place || EMPTY_VALUE,

      confirmation_saint_name: student.confirmation_saint_name || EMPTY_VALUE,

      catechism_level: student.catechism_level || EMPTY_VALUE,

      catechism_status: student.catechism_status || "new",

      enrollment_date: student.enrollment_date || null,

      note: student.note || EMPTY_VALUE,

      status: student.status || "active",

      avatar: getAvatarUrl(student.avatar),

      created_at: student.created_at || null,

      updated_at: student.updated_at || null,

      classId: matchedClass?.id || classId || null,

      className: matchedClass?.name || relation?.class_name || "Chưa xếp lớp",
    };
  }, []);

  /* ===================================================
     LOAD DATA
  =================================================== */

  const fetchStudents = useCallback(
    async (options = {}) => {
      const { silent = false } = options;

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [studentRes, classRes] = await Promise.all([
          studentApi.getAll(),
          classApi.getAll(),
        ]);

        if (!mountedRef.current) {
          return;
        }

        const studentData = getResponseData(studentRes, ["students"]);

        const classData = getResponseData(classRes, ["classes"]);

        const formattedClasses = Array.isArray(classData)
          ? classData.map((item) => ({
              id: item.id,

              name: item.name || item.className || `Lớp #${item.id}`,

              code: item.code || null,
            }))
          : [];

        setClasses(formattedClasses);

        if (!Array.isArray(studentData)) {
          setStudents([]);
          setSelectedRowKeys([]);
          return;
        }

        const formattedStudents = studentData.map((student) => {
          const relation = {
            class_id: student.class_id,

            class_name: student.class_name,

            class_code: student.class_code,

            status: student.class_student_status,

            joined_at: student.joined_at,
          };

          return formatStudent(student, relation, formattedClasses);
        });

        if (!mountedRef.current) {
          return;
        }

        setStudents(formattedStudents);

        setSelectedRowKeys([]);
      } catch (error) {
        if (mountedRef.current) {
          message.error(
            error?.response?.data?.message ||
              "Không thể tải danh sách học sinh!",
          );
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [formatStudent],
  );

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    mountedRef.current = true;

    if (!didInitialFetch.current) {
      didInitialFetch.current = true;

      fetchStudents();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchStudents]);

  /* ===================================================
     FILTER
  =================================================== */

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (activeClassTab === "unassigned") {
      result = result.filter((student) => !student.classId);
    } else if (activeClassTab !== "all") {
      result = result.filter(
        (student) => String(student.classId) === String(activeClassTab),
      );
    }

    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      result = result.filter(
        (student) =>
          student.name?.toLowerCase().includes(keyword) ||
          student.code?.toLowerCase().includes(keyword) ||
          student.phone?.toLowerCase().includes(keyword) ||
          student.email?.toLowerCase().includes(keyword),
      );
    }

    if (selectedStatus !== "all") {
      result = result.filter((student) => student.status === selectedStatus);
    }

    return result;
  }, [students, activeClassTab, searchText, selectedStatus]);

  /* ===================================================
     PAGINATION
  =================================================== */

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  /* ===================================================
     STATISTICS
  =================================================== */

  const statistics = useMemo(() => {
    const total = students.length;

    const active = students.filter(
      (student) => student.status === "active",
    ).length;

    const inactive = students.filter(
      (student) => student.status !== "active",
    ).length;

    const unassigned = students.filter((student) => !student.classId).length;

    return {
      total,
      active,
      inactive,
      unassigned,
    };
  }, [students]);

  /* ===================================================
     TAB
  =================================================== */

  const handleTabChange = (key) => {
    setActiveClassTab(key);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  /* ===================================================
     RESET FILTER
  =================================================== */

  const resetFilters = () => {
    setSearchText("");
    setSelectedStatus("all");
    setActiveClassTab("all");
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  /* ===================================================
     IMPORT EXCEL
  =================================================== */

  const handleImportExcel = async (file) => {
    if (!file || importing) {
      return;
    }

    const isExcel =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.name?.toLowerCase().endsWith(".xlsx") ||
      file.name?.toLowerCase().endsWith(".xls");

    if (!isExcel) {
      message.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)!");
      return;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;

    if (!isLt10M) {
      message.error("File Excel không được vượt quá 10MB!");
      return;
    }

    try {
      setImporting(true);

      const hide = message.loading("Đang import danh sách học sinh...", 0);

      try {
        const response = await studentApi.importExcel(file);

        message.success(
          response?.data?.message ||
            response?.data?.data?.message ||
            "Import học sinh thành công!",
        );
      } finally {
        hide();
      }

      await fetchStudents({
        silent: true,
      });

      setSelectedRowKeys([]);
      setCurrentPage(1);
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Không thể import danh sách học sinh!",
      );
    } finally {
      setImporting(false);
    }
  };

  /* ===================================================
     DOWNLOAD TEMPLATE
  =================================================== */

  const handleDownloadExcelTemplate = useCallback(() => {
    try {
      const link = document.createElement("a");

      link.href = "/templates/mau_import_hoc_sinh_FaithEdu.xlsx";

      link.download = "mau_import_hoc_sinh_FaithEdu.xlsx";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      message.success("Đã tải file Excel mẫu!");
    } catch (error) {
      message.error("Không thể tải file Excel mẫu!");
    }
  }, []);

  /* ===================================================
     CREATE
  =================================================== */

  const handleOpenCreateModal = () => {
    if (saving || loading || bulkDeleting) {
      return;
    }

    setEditingStudent(null);

    form.resetFields();

    form.setFieldsValue({
      gender: "Nam",
      nationality: "Việt Nam",
      status: "active",
      catechism_status: "new",
    });

    setIsFormModalOpen(true);
  };

  /* ===================================================
     EDIT
  =================================================== */

  const handleOpenEditModal = useCallback(
    (student) => {
      setEditingStudent(student);

      const value = (item) => (item === EMPTY_VALUE ? "" : item);

      form.setFieldsValue({
        code: value(student.code),

        name: student.name || "",

        gender:
          student.gender === "male"
            ? "Nam"
            : student.gender === "female"
              ? "Nữ"
              : student.gender || "Khác",

        date_of_birth: student.date_of_birth
          ? dayjs(student.date_of_birth)
          : null,

        birth_place: value(student.birth_place),

        nationality: value(student.nationality),

        phone: value(student.phone),

        email: value(student.email),

        address: value(student.address),

        parish: value(student.parish),

        class_id: student.classId ? String(student.classId) : undefined,

        father_name: value(student.father_name),

        father_phone: value(student.father_phone),

        mother_name: value(student.mother_name),

        mother_phone: value(student.mother_phone),

        guardian_name: value(student.guardian_name),

        guardian_phone: value(student.guardian_phone),

        guardian_relationship: value(student.guardian_relationship),

        baptism_name: value(student.baptism_name),

        baptism_date: student.baptism_date ? dayjs(student.baptism_date) : null,

        baptism_place: value(student.baptism_place),

        baptism_parish: value(student.baptism_parish),

        baptism_certificate_no: value(student.baptism_certificate_no),

        saint_name: value(student.saint_name),

        first_communion_date: student.first_communion_date
          ? dayjs(student.first_communion_date)
          : null,

        first_communion_place: value(student.first_communion_place),

        confirmation_date: student.confirmation_date
          ? dayjs(student.confirmation_date)
          : null,

        confirmation_place: value(student.confirmation_place),

        confirmation_saint_name: value(student.confirmation_saint_name),

        catechism_level: value(student.catechism_level),

        catechism_status: student.catechism_status || "new",

        enrollment_date: student.enrollment_date
          ? dayjs(student.enrollment_date)
          : null,

        status: student.status || "active",

        note: value(student.note),

        avatar: student.avatar || null,
      });

      setIsFormModalOpen(true);
    },
    [form],
  );

  /* ===================================================
     BUILD PAYLOAD
  =================================================== */

  const buildStudentPayload = (values) => {
    return {
      name: values.name?.trim() || "",

      gender: values.gender || "Khác",

      date_of_birth: formatDateForApi(values.date_of_birth),

      birth_place: values.birth_place?.trim() || null,

      nationality: values.nationality?.trim() || "Việt Nam",

      phone: values.phone?.trim() || null,

      email: values.email?.trim() || null,

      address: values.address?.trim() || null,

      parish: values.parish?.trim() || null,

      father_name: values.father_name?.trim() || null,

      father_phone: values.father_phone?.trim() || null,

      mother_name: values.mother_name?.trim() || null,

      mother_phone: values.mother_phone?.trim() || null,

      guardian_name: values.guardian_name?.trim() || null,

      guardian_phone: values.guardian_phone?.trim() || null,

      guardian_relationship: values.guardian_relationship?.trim() || null,

      baptism_name: values.baptism_name?.trim() || null,

      baptism_date: formatDateForApi(values.baptism_date),

      baptism_place: values.baptism_place?.trim() || null,

      baptism_parish: values.baptism_parish?.trim() || null,

      baptism_certificate_no: values.baptism_certificate_no?.trim() || null,

      saint_name: values.saint_name?.trim() || null,

      first_communion_date: formatDateForApi(values.first_communion_date),

      first_communion_place: values.first_communion_place?.trim() || null,

      confirmation_date: formatDateForApi(values.confirmation_date),

      confirmation_place: values.confirmation_place?.trim() || null,

      confirmation_saint_name: values.confirmation_saint_name?.trim() || null,

      catechism_level: values.catechism_level?.trim() || null,

      catechism_status: values.catechism_status || "new",

      enrollment_date: formatDateForApi(values.enrollment_date),

      note: values.note?.trim() || null,

      status: values.status || "active",

      class_id: values.class_id || null,
    };
  };
  const buildStudentFormData = useCallback((values) => {
    const payload = buildStudentPayload(values);

    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      if (value === null) {
        formData.append(key, "");
        return;
      }

      formData.append(key, String(value));
    });

    /*
     * ==========================================
     * AVATAR MỚI
     * ==========================================
     */

    if (values.avatarFile instanceof File) {
      formData.append("avatar", values.avatarFile, values.avatarFile.name);
    }

    /*
     * ==========================================
     * XÓA AVATAR
     * ==========================================
     */

    if (values.avatarRemoved === true) {
      formData.append("avatar", "");
    }

    return formData;
  }, []);
  /* ===================================================
     SAVE
  =================================================== */

  const handleSaveStudent = async (values) => {
    if (saving) return;

    try {
      setSaving(true);

      const formData = buildStudentFormData(values);

      if (!editingStudent) {
        await studentApi.create(formData);

        message.success("Thêm học sinh thành công!");
      } else {
        await studentApi.update(editingStudent.id, formData);

        message.success("Cập nhật học sinh thành công!");
      }

      setIsFormModalOpen(false);

      setEditingStudent(null);

      form.resetFields();

      await fetchStudents({
        silent: true,
      });
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Không thể lưu học sinh!",
      );
    } finally {
      setSaving(false);
    }
  };
  /* ===================================================
     DETAIL
  =================================================== */

  const handleOpenDetail = useCallback((student) => {
    setDetailStudent(student);

    setIsDetailModalOpen(true);
  }, []);

  /* ===================================================
     CHANGE CLASS
  =================================================== */

  const handleOpenChangeClass = useCallback(
    (student) => {
      setChangeClassStudent(student);

      changeClassForm.setFieldsValue({
        new_class_id: student.classId ? String(student.classId) : undefined,
      });

      setIsChangeClassModalOpen(true);
    },
    [changeClassForm],
  );

  const handleChangeClassSubmit = async (values) => {
    if (!changeClassStudent || saving) {
      return;
    }

    const studentId = changeClassStudent.id;

    try {
      setSaving(true);

      setActionLoadingState("changeClass", studentId);

      const newClassId = values.new_class_id;

      if (!newClassId) {
        throw new Error("Vui lòng chọn lớp mới");
      }

      if (
        changeClassStudent.classId &&
        String(changeClassStudent.classId) === String(newClassId)
      ) {
        message.info("Học sinh đã ở lớp này.");

        return;
      }

      const hide = message.loading(
        changeClassStudent.classId
          ? "Đang chuyển lớp..."
          : "Đang thêm vào lớp...",
        0,
      );

      try {
        if (changeClassStudent.classId) {
          await classStudentApi.changeClass(
            changeClassStudent.classId,
            studentId,
            newClassId,
          );
        } else {
          await classStudentApi.add({
            class_id: newClassId,

            student_id: studentId,

            status: "studying",
          });
        }
      } finally {
        hide();
      }

      message.success(
        changeClassStudent.classId
          ? "Chuyển lớp thành công!"
          : "Đã xếp lớp thành công!",
      );

      setIsChangeClassModalOpen(false);

      setChangeClassStudent(null);

      changeClassForm.resetFields();

      await fetchStudents({
        silent: true,
      });
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể chuyển lớp!",
      );
    } finally {
      clearActionLoadingState("changeClass");

      setSaving(false);
    }
  };

  /* ===================================================
     TOGGLE STATUS
  =================================================== */

  const handleToggleStatus = useCallback(
    async (student) => {
      try {
        setSaving(true);

        setActionLoadingState("toggle", student.id);

        const newStatus = student.status === "active" ? "inactive" : "active";

        const values = {
          name: student.name,

          gender: student.gender,

          date_of_birth: student.date_of_birth,

          birth_place:
            student.birth_place === EMPTY_VALUE ? "" : student.birth_place,

          nationality:
            student.nationality === EMPTY_VALUE
              ? "Việt Nam"
              : student.nationality,

          phone: student.phone === EMPTY_VALUE ? "" : student.phone,

          email: student.email === EMPTY_VALUE ? "" : student.email,

          address: student.address === EMPTY_VALUE ? "" : student.address,

          parish: student.parish === EMPTY_VALUE ? "" : student.parish,

          father_name:
            student.father_name === EMPTY_VALUE ? "" : student.father_name,

          father_phone:
            student.father_phone === EMPTY_VALUE ? "" : student.father_phone,

          mother_name:
            student.mother_name === EMPTY_VALUE ? "" : student.mother_name,

          mother_phone:
            student.mother_phone === EMPTY_VALUE ? "" : student.mother_phone,

          guardian_name:
            student.guardian_name === EMPTY_VALUE ? "" : student.guardian_name,

          guardian_phone:
            student.guardian_phone === EMPTY_VALUE
              ? ""
              : student.guardian_phone,

          guardian_relationship:
            student.guardian_relationship === EMPTY_VALUE
              ? ""
              : student.guardian_relationship,

          baptism_name:
            student.baptism_name === EMPTY_VALUE ? "" : student.baptism_name,

          baptism_date: student.baptism_date,

          baptism_place:
            student.baptism_place === EMPTY_VALUE ? "" : student.baptism_place,

          baptism_parish:
            student.baptism_parish === EMPTY_VALUE
              ? ""
              : student.baptism_parish,

          baptism_certificate_no:
            student.baptism_certificate_no === EMPTY_VALUE
              ? ""
              : student.baptism_certificate_no,

          saint_name:
            student.saint_name === EMPTY_VALUE ? "" : student.saint_name,

          first_communion_date: student.first_communion_date,

          first_communion_place:
            student.first_communion_place === EMPTY_VALUE
              ? ""
              : student.first_communion_place,

          confirmation_date: student.confirmation_date,

          confirmation_place:
            student.confirmation_place === EMPTY_VALUE
              ? ""
              : student.confirmation_place,

          confirmation_saint_name:
            student.confirmation_saint_name === EMPTY_VALUE
              ? ""
              : student.confirmation_saint_name,

          catechism_level:
            student.catechism_level === EMPTY_VALUE
              ? ""
              : student.catechism_level,

          catechism_status: student.catechism_status || "new",

          enrollment_date: student.enrollment_date,

          note: student.note === EMPTY_VALUE ? "" : student.note,

          status: newStatus,

          class_id: student.classId || null,
        };

        const formData = buildStudentFormData(values);

        await studentApi.update(student.id, formData);

        message.success(
          newStatus === "active" ? "Đã mở khóa học sinh!" : "Đã khóa học sinh!",
        );

        await fetchStudents();
      } catch (error) {
        message.error(
          error?.response?.data?.message || "Không thể cập nhật trạng thái!",
        );
      } finally {
        clearActionLoadingState("toggle");

        setSaving(false);
      }
    },
    [
      fetchStudents,
      setActionLoadingState,
      clearActionLoadingState,
      buildStudentFormData,
    ],
  );

  /* ===================================================
     DELETE
  =================================================== */

  const handleDeleteStudent = useCallback(
    async (id) => {
      try {
        setSaving(true);

        setActionLoadingState("delete", id);

        await studentApi.delete(id);

        message.success("Đã xóa học sinh!");

        const nextTotal = filteredStudents.length - 1;

        const maxPage = Math.max(1, Math.ceil(nextTotal / pageSize));

        if (currentPage > maxPage) {
          setCurrentPage(maxPage);
        }

        await fetchStudents();
      } catch (error) {
        message.error(
          error?.response?.data?.message || "Không thể xóa học sinh!",
        );
      } finally {
        clearActionLoadingState("delete");

        setSaving(false);
      }
    },
    [
      filteredStudents.length,
      pageSize,
      currentPage,
      fetchStudents,
      setActionLoadingState,
      clearActionLoadingState,
    ],
  );

  /* ===================================================
     BULK DELETE
  =================================================== */

  const handleBulkDelete = async () => {
    if (!selectedRowKeys.length || bulkDeleting) {
      return;
    }

    const deleteCount = selectedRowKeys.length;

    try {
      setBulkDeleting(true);

      const hide = message.loading(`Đang xóa ${deleteCount} học sinh...`, 0);

      try {
        await Promise.all(selectedRowKeys.map((id) => studentApi.delete(id)));
      } finally {
        hide();
      }

      message.success(`Đã xóa ${deleteCount} học sinh!`);

      setSelectedRowKeys([]);

      const nextTotal = filteredStudents.length - deleteCount;

      const maxPage = Math.max(1, Math.ceil(nextTotal / pageSize));

      if (currentPage > maxPage) {
        setCurrentPage(maxPage);
      }

      await fetchStudents({
        silent: true,
      });
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể xóa một số học sinh!",
      );

      await fetchStudents({
        silent: true,
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  /* ===================================================
     STATUS TAG
  =================================================== */

  const renderStatus = (status) => {
    const config = {
      active: {
        text: "Hoạt động",
        bg: COLORS.successBg,
        color: COLORS.success,
      },

      inactive: {
        text: "Tạm khóa",
        bg: "#FFF7ED",
        color: "#EA580C",
      },

      graduated: {
        text: "Đã tốt nghiệp",
        bg: COLORS.navyLight,
        color: COLORS.navyHover,
      },

      transferred: {
        text: "Đã chuyển đi",
        bg: COLORS.navyLight,
        color: COLORS.navy,
      },

      dropped: {
        text: "Đã nghỉ",
        bg: COLORS.dangerBg,
        color: COLORS.danger,
      },
    };

    const item = config[status] || config.inactive;

    return (
      <Tag
        bordered={false}
        style={{
          borderRadius: 20,
          padding: "4px 12px",
          background: item.bg,
          color: item.color,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        ● {item.text}
      </Tag>
    );
  };

  /* ===================================================
     CATECHISM STATUS
  =================================================== */

  const renderCatechismStatus = (status) => {
    const map = {
      new: "Mới",
      studying: "Đang học",
      completed: "Hoàn thành",
      graduated: "Tốt nghiệp",
      dropped: "Đã nghỉ",
    };

    return (
      <Tag
        style={{
          whiteSpace: "nowrap",
          background: COLORS.navyLight,
          borderColor: COLORS.border,
          color: COLORS.navy,
        }}
      >
        {map[status] || status}
      </Tag>
    );
  };

  /* ===================================================
     TABLE COLUMNS
  =================================================== */

  const columns = useMemo(
    () => [
      {
        title: "Học sinh",
        key: "student",
        width: 300,

        render: (_, record) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 230,
            }}
          >
            <Avatar
              size={44}
              src={record.avatar}
              icon={<UserOutlined />}
              style={{
                flexShrink: 0,
                background: COLORS.navyLight,
                color: COLORS.navy,
                fontWeight: 700,
                border: `1px solid ${COLORS.border}`,
              }}
            />

            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Text
                strong
                ellipsis
                style={{
                  display: "block",
                  maxWidth: 250,
                  cursor: "pointer",
                  color: COLORS.navy,
                }}
                onClick={() => handleOpenDetail(record)}
              >
                {record.name}
              </Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {record.code} •{" "}
                {record.gender === "Nam"
                  ? "Nam"
                  : record.gender === "Nữ"
                    ? "Nữ"
                    : "Khác"}
              </Text>
            </div>
          </div>
        ),
      },

      {
        title: "Ngày sinh",
        dataIndex: "date_of_birth",
        width: 120,

        render: (value) => formatDate(value),
      },

      {
        title: "Lớp",
        key: "class",
        width: 140,

        render: (_, record) =>
          record.classId ? (
            <Tag
              icon={<BookOutlined />}
              style={{
                borderRadius: 8,
                whiteSpace: "nowrap",
                background: COLORS.navyLight,
                borderColor: COLORS.border,
                color: COLORS.navy,
              }}
            >
              {record.className}
            </Tag>
          ) : (
            <Text
              type="secondary"
              style={{
                whiteSpace: "nowrap",
              }}
            >
              Chưa xếp lớp
            </Text>
          ),
      },

      {
        title: "Trạng thái",
        dataIndex: "status",
        width: 140,

        render: (value) => renderStatus(value),
      },

      {
        title: "",
        key: "action",
        width: 150,
        fixed: "right",

        render: (_, record) => (
          <Space size={2}>
            <Tooltip title="Xem QR">
              <Button
                type="text"
                shape="circle"
                icon={<QrcodeOutlined />}
                onClick={() => handleOpenQR(record)}
                style={{
                  color: COLORS.navy,
                }}
              />
            </Tooltip>

            <Tooltip title="Xem">
              <Button
                type="text"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={() => handleOpenDetail(record)}
                style={{
                  color: COLORS.navy,
                }}
              />
            </Tooltip>

            <Tooltip title="Sửa">
              <Button
                type="text"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => handleOpenEditModal(record)}
                style={{
                  color: COLORS.navy,
                }}
              />
            </Tooltip>

            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "qr",
                    icon: <QrcodeOutlined />,
                    label: "Xem mã QR",
                    onClick: () => handleOpenQR(record),
                  },

                  {
                    key: "change",
                    icon: <SwapOutlined />,
                    label: "Chuyển lớp",
                    onClick: () => handleOpenChangeClass(record),
                  },

                  {
                    key: "status",
                    icon:
                      record.status === "active" ? (
                        <LockOutlined />
                      ) : (
                        <UnlockOutlined />
                      ),

                    label:
                      record.status === "active" ? "Khóa học sinh" : "Mở khóa",

                    onClick: () => handleToggleStatus(record),
                  },

                  {
                    type: "divider",
                  },

                  {
                    key: "delete",
                    danger: true,
                    icon: <DeleteOutlined />,

                    label: (
                      <Popconfirm
                        title="Xóa học sinh?"
                        description="Dữ liệu sau khi xóa không thể khôi phục."
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{
                          danger: true,
                        }}
                        onConfirm={() => handleDeleteStudent(record.id)}
                      >
                        <span>Xóa học sinh</span>
                      </Popconfirm>
                    ),
                  },
                ],
              }}
            >
              <Button
                type="text"
                shape="circle"
                icon={<MoreOutlined />}
                style={{
                  color: COLORS.navy,
                }}
              />
            </Dropdown>
          </Space>
        ),
      },
    ],
    [
      handleDeleteStudent,
      handleOpenChangeClass,
      handleOpenDetail,
      handleOpenEditModal,
      handleToggleStatus,
      handleOpenQR,
    ],
  );

  /* ===================================================
     CLASS TABS
  =================================================== */

  const classTabs = useMemo(() => {
    const items = [
      {
        key: "all",

        label: (
          <Space size={6}>
            <TeamOutlined />

            <span>Tất cả</span>

            <Badge
              count={statistics.total}
              overflowCount={999}
              style={{
                background: COLORS.navy,
              }}
            />
          </Space>
        ),
      },
    ];

    classes.forEach((classItem) => {
      const count = students.filter(
        (student) => String(student.classId) === String(classItem.id),
      ).length;

      items.push({
        key: String(classItem.id),

        label: (
          <Space size={6}>
            <BookOutlined />

            <span>{classItem.name}</span>

            <Badge
              count={count}
              showZero
              style={{
                background: COLORS.gold,
              }}
            />
          </Space>
        ),
      });
    });

    items.push({
      key: "unassigned",

      label: (
        <Space size={6}>
          <IdcardOutlined />

          <span>Chưa xếp lớp</span>

          <Badge
            count={statistics.unassigned}
            showZero
            style={{
              background: COLORS.gold,
            }}
          />
        </Space>
      ),
    });

    return items;
  }, [classes, students, statistics]);

  /* ===================================================
     DETAIL TABS
  =================================================== */

  const detailTabs = detailStudent
    ? [
        {
          key: "general",
          label: "Thông tin chung",

          children: (
            <Descriptions
              bordered
              size="small"
              column={{
                xs: 1,
                sm: 2,
              }}
              labelStyle={{
                width: 150,
                minWidth: 150,
                whiteSpace: "nowrap",
                fontWeight: 500,
              }}
              contentStyle={{
                minWidth: 0,
                wordBreak: "break-word",
              }}
            >
              <Descriptions.Item label="Mã học sinh">
                {displayValue(detailStudent.code)}
              </Descriptions.Item>

              <Descriptions.Item label="Họ tên">
                <strong>{detailStudent.name}</strong>
              </Descriptions.Item>

              <Descriptions.Item label="Giới tính">
                {detailStudent.gender || "Khác"}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày sinh">
                {formatDate(detailStudent.date_of_birth)}
              </Descriptions.Item>

              <Descriptions.Item label="Nơi sinh">
                {detailStudent.birth_place}
              </Descriptions.Item>

              <Descriptions.Item label="Quốc tịch">
                {detailStudent.nationality}
              </Descriptions.Item>

              <Descriptions.Item label="Lớp">
                {detailStudent.className}
              </Descriptions.Item>

              <Descriptions.Item label="Giáo xứ">
                {detailStudent.parish}
              </Descriptions.Item>

              <Descriptions.Item label="SĐT">
                {detailStudent.phone}
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                {detailStudent.email}
              </Descriptions.Item>

              <Descriptions.Item label="Địa chỉ" span={2}>
                {detailStudent.address}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                {renderStatus(detailStudent.status)}
              </Descriptions.Item>

              <Descriptions.Item label="Giáo lý">
                {renderCatechismStatus(detailStudent.catechism_status)}
              </Descriptions.Item>
            </Descriptions>
          ),
        },

        {
          key: "church",
          label: "Bí tích",

          children: (
            <Descriptions
              bordered
              size="small"
              column={{
                xs: 1,
                sm: 2,
              }}
              labelStyle={{
                width: 160,
                minWidth: 160,
                whiteSpace: "nowrap",
                fontWeight: 500,
              }}
              contentStyle={{
                minWidth: 0,
                wordBreak: "break-word",
              }}
            >
              <Descriptions.Item label="Tên thánh Rửa tội">
                {detailStudent.baptism_name}
              </Descriptions.Item>

              <Descriptions.Item label="Tên thánh">
                {detailStudent.saint_name}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày Rửa tội">
                {formatDate(detailStudent.baptism_date)}
              </Descriptions.Item>

              <Descriptions.Item label="Nơi Rửa tội">
                {detailStudent.baptism_place}
              </Descriptions.Item>

              <Descriptions.Item label="Giáo xứ Rửa tội">
                {detailStudent.baptism_parish}
              </Descriptions.Item>

              <Descriptions.Item label="Số chứng thư">
                {detailStudent.baptism_certificate_no}
              </Descriptions.Item>

              <Descriptions.Item label="Rước lễ lần đầu">
                {formatDate(detailStudent.first_communion_date)}
              </Descriptions.Item>

              <Descriptions.Item label="Nơi Rước lễ">
                {detailStudent.first_communion_place}
              </Descriptions.Item>

              <Descriptions.Item label="Thêm sức">
                {formatDate(detailStudent.confirmation_date)}
              </Descriptions.Item>

              <Descriptions.Item label="Nơi Thêm sức">
                {detailStudent.confirmation_place}
              </Descriptions.Item>

              <Descriptions.Item label="Tên thánh Thêm sức">
                {detailStudent.confirmation_saint_name}
              </Descriptions.Item>
            </Descriptions>
          ),
        },

        {
          key: "family",
          label: "Gia đình",

          children: (
            <Descriptions
              bordered
              size="small"
              column={{
                xs: 1,
                sm: 2,
              }}
              labelStyle={{
                width: 160,
                minWidth: 160,
                whiteSpace: "nowrap",
                fontWeight: 500,
              }}
              contentStyle={{
                minWidth: 0,
                wordBreak: "break-word",
              }}
            >
              <Descriptions.Item label="Bố">
                {detailStudent.father_name}
              </Descriptions.Item>

              <Descriptions.Item label="SĐT bố">
                {detailStudent.father_phone}
              </Descriptions.Item>

              <Descriptions.Item label="Mẹ">
                {detailStudent.mother_name}
              </Descriptions.Item>

              <Descriptions.Item label="SĐT mẹ">
                {detailStudent.mother_phone}
              </Descriptions.Item>

              <Descriptions.Item label="Người giám hộ">
                {detailStudent.guardian_name}
              </Descriptions.Item>

              <Descriptions.Item label="SĐT giám hộ">
                {detailStudent.guardian_phone}
              </Descriptions.Item>

              <Descriptions.Item label="Quan hệ">
                {detailStudent.guardian_relationship}
              </Descriptions.Item>
            </Descriptions>
          ),
        },

        {
          key: "catechism",
          label: "Giáo lý",

          children: (
            <Descriptions
              bordered
              size="small"
              column={{
                xs: 1,
                sm: 2,
              }}
              labelStyle={{
                width: 160,
                minWidth: 160,
                whiteSpace: "nowrap",
                fontWeight: 500,
              }}
              contentStyle={{
                minWidth: 0,
                wordBreak: "break-word",
              }}
            >
              <Descriptions.Item label="Cấp giáo lý">
                {detailStudent.catechism_level}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                {renderCatechismStatus(detailStudent.catechism_status)}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày nhập học">
                {formatDate(detailStudent.enrollment_date)}
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú">
                {detailStudent.note}
              </Descriptions.Item>
            </Descriptions>
          ),
        },
      ]
    : [];

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <>
      <style>
        {`
          /* =====================================================
             PAGE
          ===================================================== */

          .student-management-page {
            min-height: 100vh;
            box-sizing: border-box;
            overflow-x: hidden;
            background: #F7F9FC;
            color: #173B5E;
          }

          /* =====================================================
             MAIN CARD
          ===================================================== */

          .student-main-card {
            border: 1px solid #E2E8F0 !important;
            background: #FFFFFF !important;
            box-shadow:
              0 8px 28px rgba(23, 59, 94, 0.06);
          }

          .student-main-card .ant-card-body {
            padding: 24px;
          }

          /* =====================================================
             TABS
          ===================================================== */

          .student-class-tabs {
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: thin;
          }

          .student-class-tabs .ant-tabs-nav {
            margin-bottom: 22px !important;
          }

          .student-class-tabs .ant-tabs-tab {
            white-space: nowrap;
            color: #64748B;
            font-weight: 600;
            border-color: #E2E8F0 !important;
            background: #FFFFFF;
            transition: all 0.2s ease;
          }

          .student-class-tabs .ant-tabs-tab:hover {
            color: #244F78;
            border-color: #D9A441 !important;
          }

          .student-class-tabs .ant-tabs-tab-active {
            background: #173B5E !important;
            border-color: #173B5E !important;
          }

          .student-class-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #FFFFFF !important;
          }

          .student-class-tabs .ant-tabs-ink-bar {
            background: #D9A441 !important;
          }

          /* =====================================================
             FILTER
          ===================================================== */

          .student-filter-row {
            width: 100%;
          }

          .student-filter-control {
            width: 100%;
          }

          .student-management-page
            .ant-input-affix-wrapper,
          .student-management-page
            .ant-input,
          .student-management-page
            .ant-select-selector {
            border-color: #E2E8F0 !important;
            background: #FFFFFF !important;
            color: #173B5E !important;
          }

          .student-management-page
            .ant-input-affix-wrapper:hover,
          .student-management-page
            .ant-input:hover,
          .student-management-page
            .ant-select-selector:hover {
            border-color: #D9A441 !important;
          }

          .student-management-page
            .ant-input-affix-wrapper-focused,
          .student-management-page
            .ant-input:focus,
          .student-management-page
            .ant-select-focused
            .ant-select-selector {
            border-color: #173B5E !important;
            box-shadow:
              0 0 0 2px rgba(23, 59, 94, 0.08) !important;
          }

          /* =====================================================
             BUTTON
          ===================================================== */

          .student-management-page
            .ant-btn-primary {
            background: #173B5E;
            border-color: #173B5E;
            color: #FFFFFF;
            font-weight: 700;
          }

          .student-management-page
            .ant-btn-primary:hover,
          .student-management-page
            .ant-btn-primary:focus {
            background: #244F78 !important;
            border-color: #244F78 !important;
          }

          .student-management-page
            .ant-btn:not(.ant-btn-primary):hover {
            color: #173B5E;
            border-color: #D9A441;
          }

          /* =====================================================
             TABLE
          ===================================================== */

          .student-table .ant-table {
            border-radius: 12px;
            overflow: hidden;
          }

          .student-table .ant-table-container {
            border-radius: 12px;
          }

          .student-table
            .ant-table-thead
            > tr
            > th {
            background: #EEF3F7 !important;
            color: #173B5E !important;
            font-weight: 800;
            border-bottom:
              1px solid #E2E8F0;
            white-space: nowrap;
          }

          .student-table
            .ant-table-tbody
            > tr
            > td {
            border-bottom:
              1px solid #EEF1F4;
          }

          .student-table
            .ant-table-tbody
            > tr:hover
            > td {
            background: #F7F9FC !important;
          }

          .student-table
            .ant-table-cell {
            vertical-align: middle;
          }

          /* =====================================================
             CHECKBOX
          ===================================================== */

          .student-management-page
            .ant-checkbox-checked
            .ant-checkbox-inner {
            background-color: #173B5E;
            border-color: #173B5E;
          }

          .student-management-page
            .ant-checkbox-indeterminate
            .ant-checkbox-inner:after {
            background-color: #173B5E;
          }

          /* =====================================================
             PAGINATION
          ===================================================== */

          .student-pagination-row {
            width: 100%;
          }

          .student-pagination-controls {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: 10px;
          }

          .student-management-page
            .ant-pagination-item-active {
            border-color: #173B5E;
          }

          .student-management-page
            .ant-pagination-item-active
            a {
            color: #173B5E;
            font-weight: 700;
          }

          /* =====================================================
             TEMPLATE BUTTON
          ===================================================== */

          .hero-btn-template {
            height: 42px;
            border-radius: 10px !important;
            padding: 0 16px !important;
            background: #FFFFFF !important;
            border: 1px solid #D9A441 !important;
            color: #173B5E !important;
            font-weight: 700 !important;
            font-family:
              'Be Vietnam Pro',
              sans-serif !important;
            box-shadow:
              0 4px 12px
              rgba(23, 59, 94, 0.06);
            transition: all 0.2s ease !important;
          }

          .hero-btn-template:hover {
            color: #173B5E !important;
            border-color: #D9A441 !important;
            background: #FBF5E7 !important;
            transform: translateY(-1px);
          }

          /* =====================================================
             QR
          ===================================================== */

          .student-qr-card {
            width: 330px;
            max-width: 100%;
            margin: 0 auto 20px;
            border:
              1px solid #E2E8F0 !important;
          }

          .student-qr-wrapper {
            max-width: 100%;
            overflow: hidden;
          }

          .student-qr-canvas {
            max-width: 100%;
            height: auto !important;
          }

          .student-qr-actions {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
          }

          /* =====================================================
             MODAL
          ===================================================== */

          .student-responsive-modal
            .ant-modal-content {
            border-radius: 16px;
            overflow: hidden;
          }

          /* =====================================================
             TABLET
          ===================================================== */

          @media (max-width: 992px) {
            .student-management-page {
              padding: 20px;
            }

            .student-main-card
              .ant-card-body {
              padding: 20px;
            }
          }

          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 767px) {
            .student-management-page {
              padding: 12px;
            }

            .student-main-card {
              border-radius: 16px !important;
            }

            .student-main-card
              .ant-card-body {
              padding: 14px !important;
            }

            .student-class-tabs {
              margin-left: -4px;
              margin-right: -4px;
            }

            .student-class-tabs
              .ant-tabs-nav {
              margin-bottom: 16px !important;
            }

            .student-class-tabs
              .ant-tabs-tab {
              padding: 8px 10px !important;
              font-size: 13px;
            }

            .student-filter-row {
              margin-bottom: 16px !important;
            }

            .student-table .ant-table {
              font-size: 13px;
            }

            .student-table
              .ant-table-thead
              > tr
              > th {
              padding: 10px 12px !important;
              font-size: 12px;
            }

            .student-table
              .ant-table-tbody
              > tr
              > td {
              padding: 10px 12px !important;
            }

            .student-pagination-row {
              display: flex !important;
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .student-pagination-info {
              width: 100%;
              text-align: center;
            }

            .student-pagination-controls {
              width: 100%;
              justify-content: center;
            }

            .student-responsive-modal {
              max-width:
                calc(100vw - 16px)
                !important;
              margin: 8px auto !important;
            }

            .student-qr-card {
              width: 100%;
              padding: 0 !important;
            }

            .student-qr-card
              .ant-card-body {
              padding: 12px !important;
            }

            .student-qr-wrapper {
              padding: 10px !important;
            }

            .student-qr-actions {
              width: 100%;
            }

            .student-qr-actions
              .ant-btn {
              flex: 1 1 140px;
              min-width: 0 !important;
            }

            .ant-descriptions {
              overflow: hidden;
            }

            .ant-descriptions-item-label,
            .ant-descriptions-item-content {
              word-break: break-word;
            }

            .hero-btn-template {
              height: 40px;
            }
          }

          /* =====================================================
             SMALL MOBILE
          ===================================================== */

          @media (max-width: 480px) {
            .student-management-page {
              padding: 8px;
            }

            .student-main-card
              .ant-card-body {
              padding: 10px !important;
            }

            .student-class-tabs
              .ant-tabs-tab {
              padding: 7px 8px !important;
              font-size: 12px;
            }

            .student-table
              .ant-table-thead
              > tr
              > th,
            .student-table
              .ant-table-tbody
              > tr
              > td {
              padding: 9px 10px !important;
            }

            .student-pagination-controls {
              flex-direction: column;
            }

            .student-pagination-controls
              .ant-select {
              width: 100%;
            }

            .student-pagination-controls
              .ant-pagination {
              width: 100%;
              justify-content: center;
            }

            .student-pagination-controls
              .ant-pagination-options {
              display: none;
            }

            .student-qr-actions {
              flex-direction: column;
            }

            .student-qr-actions
              .ant-btn {
              width: 100%;
            }
          }

          /* =====================================================
             VERY SMALL
          ===================================================== */

          @media (max-width: 360px) {
            .student-management-page {
              padding: 6px;
            }

            .student-main-card
              .ant-card-body {
              padding: 8px !important;
            }

            .student-class-tabs
              .ant-tabs-tab {
              padding: 6px !important;
              font-size: 11px;
            }
          }
        `}
      </style>

      <div
        className="student-management-page"
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <PageHeroHeader
          icon={<UserOutlined />}
          badgeText="QUẢN LÝ HỌC SINH"
          title="Quản lý học sinh"
          description="Quản lý thông tin, lớp học và quá trình giáo lý của học sinh"
          selectedCount={selectedRowKeys.length}
          onBulkDelete={handleBulkDelete}
          bulkDeleting={bulkDeleting}
          onRefresh={() =>
            fetchStudents({
              silent: true,
            })
          }
          refreshLoading={refreshing}
          secondaryButtonText={importing ? "Đang import..." : "Import Excel"}
          secondaryButtonIcon={<UploadOutlined />}
          onSecondaryClick={() => {
            document.getElementById("student-excel-input")?.click();
          }}
          secondaryButtonLoading={importing}
          secondaryButtonDisabled={loading || saving || bulkDeleting}
          primaryButtonText={
            saving && !editingStudent ? "Đang thêm..." : "Thêm học sinh"
          }
          primaryButtonIcon={<PlusOutlined />}
          onPrimaryClick={handleOpenCreateModal}
          primaryLoading={saving && !editingStudent}
          primaryDisabled={loading || saving || importing}
          extra={
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadExcelTemplate}
              disabled={loading || saving || importing || bulkDeleting}
              className="hero-btn-template"
            >
              Tải Excel mẫu
            </Button>
          }
        />

        <input
          id="student-excel-input"
          type="file"
          accept=".xlsx,.xls"
          style={{
            display: "none",
          }}
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              handleImportExcel(file);
            }

            e.target.value = "";
          }}
        />

        {/* =================================================
            STATISTICS
        ================================================= */}

        <Row
          gutter={[18, 18]}
          style={{
            marginBottom: 26,
          }}
        >
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Tổng học sinh"
              value={statistics.total}
              loading={loading}
              icon={<TeamOutlined />}
              iconColor={COLORS.navy}
              description="Tất cả học sinh"
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Đang hoạt động"
              value={statistics.active}
              loading={loading}
              icon={<UserSwitchOutlined />}
              iconColor={COLORS.navyHover}
              description="Học sinh đang hoạt động"
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Tạm khóa"
              value={statistics.inactive}
              loading={loading}
              icon={<LockOutlined />}
              iconColor={COLORS.gold}
              description="Học sinh tạm khóa"
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Chưa xếp lớp"
              value={statistics.unassigned}
              loading={loading}
              icon={<BookOutlined />}
              iconColor={COLORS.gold}
              description="Chưa được phân lớp"
            />
          </Col>
        </Row>

        {/* =================================================
            MAIN
        ================================================= */}

        <Card
          className="student-main-card"
          bordered={false}
          style={{
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          <div className="student-class-tabs">
            <Tabs
              activeKey={activeClassTab}
              onChange={handleTabChange}
              type="card"
              items={classTabs}
            />
          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <Row className="student-filter-row" gutter={[12, 12]} align="middle">
            <Col xs={24} md={12} lg={9}>
              <Input
                className="student-filter-control"
                allowClear
                size="large"
                prefix={
                  <SearchOutlined
                    style={{
                      color: COLORS.navy,
                    }}
                  />
                }
                placeholder="Tìm tên, mã, số điện thoại, email..."
                value={searchText}
                disabled={loading || bulkDeleting}
                onChange={(e) => {
                  setSearchText(e.target.value);

                  setCurrentPage(1);
                }}
                style={{
                  borderRadius: 10,
                }}
              />
            </Col>

            <Col xs={24} md={6} lg={4}>
              <Select
                className="student-filter-control"
                size="large"
                value={selectedStatus}
                disabled={loading || bulkDeleting}
                onChange={(value) => {
                  setSelectedStatus(value);

                  setCurrentPage(1);
                }}
                options={[
                  {
                    value: "all",
                    label: "Tất cả trạng thái",
                  },
                  {
                    value: "active",
                    label: "Đang hoạt động",
                  },
                  {
                    value: "inactive",
                    label: "Tạm khóa",
                  },
                  {
                    value: "graduated",
                    label: "Đã tốt nghiệp",
                  },
                  {
                    value: "transferred",
                    label: "Đã chuyển đi",
                  },
                  {
                    value: "dropped",
                    label: "Đã nghỉ",
                  },
                ]}
              />
            </Col>

            <Col xs={24} md={6} lg={3}>
              <Button
                size="large"
                block
                disabled={loading || saving || bulkDeleting}
                onClick={resetFilters}
                style={{
                  borderRadius: 10,
                }}
              >
                Đặt lại
              </Button>
            </Col>
          </Row>

          <Divider
            style={{
              margin: "0 0 18px",
            }}
          />

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="student-table">
            <Table
              rowKey="id"
              loading={{
                spinning: loading,
                indicator: <Spin size="large" />,
              }}
              columns={columns}
              dataSource={paginatedStudents}
              pagination={false}
              scroll={{
                x: 1150,
              }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      searchText || selectedStatus !== "all"
                        ? "Không tìm thấy học sinh phù hợp"
                        : "Chưa có học sinh"
                    }
                  />
                ),
              }}
              rowSelection={{
                selectedRowKeys,

                onChange: setSelectedRowKeys,

                getCheckboxProps: (record) => ({
                  disabled:
                    actionLoading.delete === record.id ||
                    actionLoading.toggle === record.id ||
                    actionLoading.changeClass === record.id ||
                    saving ||
                    bulkDeleting,
                }),
              }}
            />
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          <Row
            className="student-pagination-row"
            justify="space-between"
            align="middle"
            gutter={[16, 16]}
            style={{
              marginTop: 24,
            }}
          >
            <Col className="student-pagination-info">
              <Text type="secondary">
                Hiển thị <strong>{filteredStudents.length}</strong> học sinh
              </Text>
            </Col>

            <Col>
              <div className="student-pagination-controls">
                <Select
                  value={String(pageSize)}
                  disabled={loading || saving || bulkDeleting}
                  onChange={(value) => {
                    setPageSize(Number(value));

                    setCurrentPage(1);
                  }}
                  options={[
                    {
                      value: "10",
                      label: "10 / trang",
                    },
                    {
                      value: "20",
                      label: "20 / trang",
                    },
                    {
                      value: "50",
                      label: "50 / trang",
                    },
                  ]}
                />

                <Pagination
                  responsive
                  current={currentPage}
                  total={filteredStudents.length}
                  pageSize={pageSize}
                  disabled={loading || saving || bulkDeleting}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  showTotal={(total) => `${total} học sinh`}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* =================================================
            CREATE / EDIT
        ================================================= */}

        <AppFormModal
          open={isFormModalOpen}
          loading={saving}
          editing={!!editingStudent}
          form={form}
          width={900}
          title="Học sinh"
          createTitle="Thêm học sinh mới"
          editTitle="Chỉnh sửa học sinh"
          subtitle="Thiết lập thông tin và lưu thay đổi."
          icon={<UserOutlined />}
          createText="Thêm học sinh"
          editText="Lưu thay đổi"
          onCancel={() => {
            if (saving) return;

            setIsFormModalOpen(false);

            setEditingStudent(null);

            form.resetFields();
          }}
        >
          <StudentForm
            form={form}
            classes={classes}
            saving={saving}
            initialValues={editingStudent || {}}
            onFinish={handleSaveStudent}
          />{" "}
        </AppFormModal>

        {/* =================================================
            DETAIL
        ================================================= */}

        <AppDetailModal
          open={isDetailModalOpen}
          width={850}
          title="Thông tin học sinh"
          subtitle={
            detailStudent
              ? `Thông tin chi tiết học sinh #${detailStudent.id}`
              : undefined
          }
          avatar={detailStudent?.avatar}
          loading={saving || bulkDeleting}
          onCancel={() => setIsDetailModalOpen(false)}
          onEdit={() => {
            setIsDetailModalOpen(false);

            handleOpenEditModal(detailStudent);
          }}
        >
          {detailStudent && (
            <Tabs
              style={{
                marginTop: 20,
              }}
              items={detailTabs}
            />
          )}
        </AppDetailModal>

        {/* =================================================
            CHANGE CLASS
        ================================================= */}

        <Modal
          className="student-responsive-modal"
          title="Chuyển lớp học"
          open={isChangeClassModalOpen}
          maskClosable={!saving}
          closable={!saving}
          keyboard={!saving}
          onCancel={() => {
            if (saving) return;

            setIsChangeClassModalOpen(false);

            setChangeClassStudent(null);

            changeClassForm.resetFields();
          }}
          onOk={() => changeClassForm.submit()}
          confirmLoading={saving}
          okText="Chuyển lớp"
          cancelText="Hủy"
          okButtonProps={{
            disabled: saving,
          }}
          cancelButtonProps={{
            disabled: saving,
          }}
          width={500}
        >
          <Form
            form={changeClassForm}
            layout="vertical"
            onFinish={handleChangeClassSubmit}
            style={{
              marginTop: 20,
            }}
          >
            <Card
              size="small"
              style={{
                background: COLORS.navyLight,
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 0,
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    flexShrink: 0,
                    background: COLORS.navy,
                    color: COLORS.white,
                  }}
                />

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <Text type="secondary">Học sinh</Text>

                  <div>
                    <Text strong>{changeClassStudent?.name}</Text>
                  </div>

                  <Text
                    type="secondary"
                    style={{
                      wordBreak: "break-word",
                    }}
                  >
                    Lớp hiện tại:{" "}
                    {changeClassStudent?.className || "Chưa xếp lớp"}
                  </Text>
                </div>
              </div>
            </Card>

            <Form.Item
              name="new_class_id"
              label="Lớp mới"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn lớp!",
                },
              ]}
            >
              <Select
                size="large"
                showSearch
                optionFilterProp="label"
                placeholder="Chọn lớp học"
                loading={loading}
                disabled={saving || loading}
                options={classes.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* =================================================
            QR MODAL
        ================================================= */}

        <Modal
          className="student-responsive-modal"
          open={isQRModalOpen}
          onCancel={() => {
            setIsQRModalOpen(false);

            setQrStudent(null);
          }}
          footer={null}
          centered
          width={430}
          destroyOnClose
          title={
            <Space>
              <QrcodeOutlined
                style={{
                  color: COLORS.navy,
                  fontSize: 20,
                }}
              />

              <span>Mã QR học sinh</span>
            </Space>
          }
        >
          {qrStudent && (
            <div
              style={{
                textAlign: "center",
                padding: "10px 0 20px",
              }}
            >
              <Avatar
                size={64}
                src={qrStudent.avatar}
                icon={<UserOutlined />}
                style={{
                  background: COLORS.navyLight,
                  color: COLORS.navy,
                  marginBottom: 12,
                  border: `1px solid ${COLORS.border}`,
                }}
              />

              <Typography.Title
                level={4}
                style={{
                  margin: "0 0 4px",
                  color: COLORS.navy,
                  wordBreak: "break-word",
                }}
              >
                {qrStudent.name}
              </Typography.Title>

              <Typography.Text
                type="secondary"
                style={{
                  display: "block",
                  marginBottom: 20,
                }}
              >
                {qrStudent.code}
              </Typography.Text>

              <Card
                className="student-qr-card"
                bordered={false}
                style={{
                  background: COLORS.background,
                  borderRadius: 16,
                  border: `1px solid ${COLORS.border}`,
                }}
                bodyStyle={{
                  padding: 20,
                }}
              >
                <div
                  className="student-qr-wrapper"
                  style={{
                    background: COLORS.white,
                    padding: 16,
                    borderRadius: 12,
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <QRCodeCanvas
                    id={`student-qr-${qrStudent.id}`}
                    value={qrStudent.qr_token}
                    size={260}
                    level="H"
                    includeMargin
                    className="student-qr-canvas"
                  />
                </div>
              </Card>

              <Typography.Text
                type="secondary"
                style={{
                  display: "block",
                  fontSize: 12,
                  marginBottom: 20,
                }}
              >
                Mã này dùng để điểm danh bằng QR
              </Typography.Text>

              <div className="student-qr-actions">
                <AppButton
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadQR}
                  style={{
                    borderRadius: 10,
                    height: 40,
                    padding: "0 16px",
                    fontWeight: 800,
                    background: COLORS.navy,
                    borderColor: COLORS.navy,
                    boxShadow: "0 8px 18px rgba(23, 59, 94, 0.18)",
                  }}
                >
                  Tải QR
                </AppButton>

                <AppButton
                  type="primary"
                  size="large"
                  onClick={() => {
                    setIsQRModalOpen(false);

                    setQrStudent(null);
                  }}
                  style={{
                    borderRadius: 10,
                    minWidth: 100,
                    background: COLORS.navy,
                    borderColor: COLORS.navy,
                  }}
                >
                  Đóng
                </AppButton>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}
