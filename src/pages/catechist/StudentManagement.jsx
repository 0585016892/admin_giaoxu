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
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
  TeamOutlined,
  UnlockOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import studentApi from "../../api/studentApi";
import classStudentApi from "../../api/classStudentApi";
import classApi from "../../api/classApi";
import AppFormModal from "../../components/common/AppFormModal";
import StudentForm from "../../components/forms/StudentForm";
import StatCard from "../../components/common/StatCard";
import AppButton from "../../components/common/AppButton";
import AppDetailModal from "../../components/common/AppDetailModal";
const { Title, Text } = Typography;
const primaryNavy = "#1B365D";

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

  const date = dayjs(value);

  return date.isValid() ? date.format("DD/MM/YYYY") : EMPTY_VALUE;
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
     GLOBAL LOADING
  =================================================== */

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /*
   * Loading cho create / edit / change class
   */
  const [saving, setSaving] = useState(false);

  /*
   * Loading bulk delete
   */
  const [bulkDeleting, setBulkDeleting] = useState(false);

  /*
   * Loading riêng từng học sinh
   */
  const [actionLoading, setActionLoading] = useState({
    delete: null,
    toggle: null,
    changeClass: null,
  });

  /*
   * React StrictMode có thể chạy effect 2 lần
   */
  const didInitialFetch = useRef(false);

  /*
   * Tránh update state sau unmount
   */
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

  /* ===================================================
     FORMS
  =================================================== */

  const [form] = Form.useForm();
  const [changeClassForm] = Form.useForm();

  /* ===================================================
     ACTION LOADING HELPERS
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

      /* ================= BASIC ================= */

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

      /* ================= FAMILY ================= */

      father_name: student.father_name || EMPTY_VALUE,

      father_phone: student.father_phone || EMPTY_VALUE,

      mother_name: student.mother_name || EMPTY_VALUE,

      mother_phone: student.mother_phone || EMPTY_VALUE,

      guardian_name: student.guardian_name || EMPTY_VALUE,

      guardian_phone: student.guardian_phone || EMPTY_VALUE,

      guardian_relationship: student.guardian_relationship || EMPTY_VALUE,

      /* ================= SACRAMENTS ================= */

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

      /* ================= CATECHISM ================= */

      catechism_level: student.catechism_level || EMPTY_VALUE,

      catechism_status: student.catechism_status || "new",

      enrollment_date: student.enrollment_date || null,

      note: student.note || EMPTY_VALUE,

      /* ================= STATUS ================= */

      status: student.status || "active",

      avatar: student.avatar || null,

      created_at: student.created_at || null,

      updated_at: student.updated_at || null,

      /* ================= CLASS ================= */

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

        /*
         * Lấy students + classes song song
         */
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
            }))
          : [];

        setClasses(formattedClasses);

        if (!Array.isArray(studentData)) {
          setStudents([]);
          return;
        }

        /*
         * Lấy relation lớp từng học sinh
         */
        const formattedStudents = await Promise.all(
          studentData.map(async (student) => {
            let relation = null;

            try {
              const relationRes = await classStudentApi.getByStudent(
                student.id,
              );

              const relationData = getResponseData(relationRes);

              if (Array.isArray(relationData)) {
                relation =
                  relationData.find((item) => item.status === "studying") ||
                  relationData[0] ||
                  null;
              } else if (relationData) {
                relation = relationData;
              }
            } catch (error) {
              console.warn(`Không lấy được lớp học sinh ${student.id}`, error);
            }

            return formatStudent(student, relation, formattedClasses);
          }),
        );

        if (!mountedRef.current) {
          return;
        }

        setStudents(formattedStudents);

        setSelectedRowKeys([]);
      } catch (error) {
        console.error("fetchStudents error:", error);

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

    /* ===== CLASS ===== */

    if (activeClassTab === "unassigned") {
      result = result.filter((student) => !student.classId);
    } else if (activeClassTab !== "all") {
      result = result.filter(
        (student) => String(student.classId) === String(activeClassTab),
      );
    }

    /* ===== SEARCH ===== */

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

    /* ===== STATUS ===== */

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

    const end = start + pageSize;

    return filteredStudents.slice(start, end);
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
     TAB CHANGE
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
        name: student.name,
        gender: student.gender,

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
      code: values.code?.trim() || null,

      name: values.name?.trim(),

      gender: values.gender || "Khác",

      date_of_birth: values.date_of_birth
        ? values.date_of_birth.format("YYYY-MM-DD")
        : null,

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

      baptism_date: values.baptism_date
        ? values.baptism_date.format("YYYY-MM-DD")
        : null,

      baptism_place: values.baptism_place?.trim() || null,

      baptism_parish: values.baptism_parish?.trim() || null,

      baptism_certificate_no: values.baptism_certificate_no?.trim() || null,

      saint_name: values.saint_name?.trim() || null,

      first_communion_date: values.first_communion_date
        ? values.first_communion_date.format("YYYY-MM-DD")
        : null,

      first_communion_place: values.first_communion_place?.trim() || null,

      confirmation_date: values.confirmation_date
        ? values.confirmation_date.format("YYYY-MM-DD")
        : null,

      confirmation_place: values.confirmation_place?.trim() || null,

      confirmation_saint_name: values.confirmation_saint_name?.trim() || null,

      catechism_level: values.catechism_level?.trim() || null,

      catechism_status: values.catechism_status || "new",

      enrollment_date: values.enrollment_date
        ? values.enrollment_date.format("YYYY-MM-DD")
        : null,

      note: values.note?.trim() || null,

      status: values.status || "active",
    };
  };

  /* ===================================================
     SAVE STUDENT
  =================================================== */

  const handleSaveStudent = async (values) => {
    if (saving) return;

    try {
      setSaving(true);

      const payload = buildStudentPayload(values);

      let studentId = editingStudent?.id;

      /* ================= CREATE ================= */

      if (!editingStudent) {
        const response = await studentApi.create(payload);

        studentId =
          response?.data?.data?.id || response?.data?.id || response?.id;

        if (!studentId) {
          throw new Error("Không lấy được ID học sinh mới");
        }
      } else {
        /* ================= UPDATE ================= */
        await studentApi.update(editingStudent.id, payload);
      }

      /* ================= CLASS ================= */

      const newClassId = values.class_id || null;

      const oldClassId = editingStudent?.classId || null;

      if (newClassId) {
        /*
         * Chuyển lớp
         */
        if (oldClassId && String(oldClassId) !== String(newClassId)) {
          await classStudentApi.update(oldClassId, studentId, {
            class_id: newClassId,
            status: "studying",
          });
        }

        /*
         * Chưa có lớp
         */
        if (!oldClassId) {
          await classStudentApi.add({
            class_id: newClassId,
            student_id: studentId,
            status: "studying",
          });
        }
      }

      message.success(
        editingStudent
          ? "Cập nhật học sinh thành công!"
          : "Thêm học sinh thành công!",
      );

      setIsFormModalOpen(false);

      setEditingStudent(null);

      form.resetFields();

      await fetchStudents({
        silent: true,
      });
    } catch (error) {
      console.error("handleSaveStudent error:", error);

      message.error(
        error?.response?.data?.message ||
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
      console.error("change class error:", error);

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

        const newStatus = student.status === "active" ? "inactive" : "active";

        await studentApi.update(student.id, {
          name: student.name,
          status: newStatus,
        });

        message.success(
          newStatus === "active" ? "Đã mở khóa học sinh!" : "Đã khóa học sinh!",
        );

        await fetchStudents();
      } catch (error) {
        console.error("toggle status error:", error);

        message.error(
          error?.response?.data?.message || "Không thể cập nhật trạng thái!",
        );
      } finally {
        setSaving(false);
      }
    },
    [fetchStudents],
  );

  /* ===================================================
     DELETE
  =================================================== */

  const handleDeleteStudent = useCallback(
    async (id) => {
      try {
        setSaving(true);

        await studentApi.delete(id);

        message.success("Đã xóa học sinh!");

        const nextTotal = filteredStudents.length - 1;

        const maxPage = Math.max(1, Math.ceil(nextTotal / pageSize));

        if (currentPage > maxPage) {
          setCurrentPage(maxPage);
        }

        await fetchStudents();
      } catch (error) {
        console.error("delete student error:", error);

        message.error(
          error?.response?.data?.message || "Không thể xóa học sinh!",
        );
      } finally {
        setSaving(false);
      }
    },
    [filteredStudents.length, pageSize, currentPage, fetchStudents],
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
      console.error("bulk delete error:", error);

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
        bg: "#ecfdf5",
        color: "#059669",
      },

      inactive: {
        text: "Tạm khóa",
        bg: "#fff7ed",
        color: "#ea580c",
      },

      graduated: {
        text: "Đã tốt nghiệp",
        bg: "#eff6ff",
        color: "#2563eb",
      },

      transferred: {
        text: "Đã chuyển đi",
        bg: "#f5f3ff",
        color: "#7c3aed",
      },

      dropped: {
        text: "Đã nghỉ",
        bg: "#fef2f2",
        color: "#dc2626",
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

    return <Tag>{map[status] || status}</Tag>;
  };

  /* ===================================================
     TABLE
  =================================================== */

  const columns = useMemo(
    () => [
      {
        title: "Học sinh",
        key: "student",
        width: 270,

        render: (_, record) => (
          <Space size={12}>
            <Avatar
              size={44}
              src={record.avatar}
              icon={<UserOutlined />}
              style={{
                background: "#eef2ff",
                color: "#6366f1",
                fontWeight: 700,
              }}
            />

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
                  maxWidth: 200,
                  cursor: "pointer",
                }}
                onClick={() => handleOpenDetail(record)}
              >
                {record.name}
              </Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                {record.code} • {record.gender}
              </Text>
            </div>
          </Space>
        ),
      },

      {
        title: "Lớp",
        key: "class",

        render: (_, record) =>
          record.classId ? (
            <Tag
              icon={<BookOutlined />}
              style={{
                borderRadius: 8,
              }}
            >
              {record.className}
            </Tag>
          ) : (
            <Text type="secondary">Chưa xếp lớp</Text>
          ),
      },

      {
        title: "Ngày sinh",
        dataIndex: "date_of_birth",
        width: 120,

        render: (value) => formatDate(value),
      },

      {
        title: "Giáo lý",
        dataIndex: "catechism_status",

        render: (value) => renderCatechismStatus(value),
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
          <Space>
            {/* XEM */}
            <Tooltip title="Xem">
              <Button
                type="text"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={() => handleOpenDetail(record)}
              />
            </Tooltip>

            {/* SỬA */}
            <Tooltip title="Sửa">
              <Button
                type="text"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => handleOpenEditModal(record)}
              />
            </Tooltip>

            {/* MORE */}
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
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
              <Button type="text" shape="circle" icon={<MoreOutlined />} />
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
          <Space>
            <TeamOutlined />

            <span>Tất cả</span>

            <Badge
              count={statistics.total}
              overflowCount={999}
              style={{
                background: "#6366f1",
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
          <Space>
            <BookOutlined />

            <span>{classItem.name}</span>

            <Badge
              count={count}
              showZero
              style={{
                background: "#94a3b8",
              }}
            />
          </Space>
        ),
      });
    });

    items.push({
      key: "unassigned",

      label: (
        <Space>
          <IdcardOutlined />

          <span>Chưa xếp lớp</span>

          <Badge
            count={statistics.unassigned}
            showZero
            style={{
              background: "#f59e0b",
            }}
          />
        </Space>
      ),
    });

    return items;
  }, [classes, students, statistics]);

  /* ===================================================
     FORM TABS
  =================================================== */

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
              column={{
                xs: 1,
                sm: 2,
              }}
            >
              <Descriptions.Item label="Mã học sinh">
                {displayValue(detailStudent.code)}
              </Descriptions.Item>

              <Descriptions.Item label="Họ tên">
                <strong>{detailStudent.name}</strong>
              </Descriptions.Item>

              <Descriptions.Item label="Giới tính">
                {detailStudent.gender}
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
              column={{
                xs: 1,
                sm: 2,
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
              column={{
                xs: 1,
                sm: 2,
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
              column={{
                xs: 1,
                sm: 2,
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
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
        padding: 28,
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{
          marginBottom: 28,
        }}
      >
        <Col>
          <Space direction="vertical" size={2}>
            <Title
              level={2}
              style={{
                margin: 0,
                color: "#1e293b",
              }}
            >
              Quản lý học sinh
            </Title>

            <Text type="secondary">
              Quản lý thông tin, lớp học và quá trình giáo lý của học sinh
            </Text>
          </Space>
        </Col>

        <Col>
          <Space>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`Xóa ${selectedRowKeys.length} học sinh?`}
                description="Dữ liệu sau khi xóa không thể khôi phục."
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{
                  danger: true,
                  loading: bulkDeleting,
                }}
                cancelButtonProps={{
                  disabled: bulkDeleting,
                }}
                onConfirm={handleBulkDelete}
              >
                <Button
                  danger
                  size="large"
                  icon={<DeleteOutlined />}
                  loading={bulkDeleting}
                  disabled={saving || loading}
                >
                  {bulkDeleting
                    ? "Đang xóa..."
                    : `Xóa (${selectedRowKeys.length})`}
                </Button>
              </Popconfirm>
            )}

            <Button
              size="large"
              icon={<ReloadOutlined />}
              loading={refreshing}
              disabled={loading || saving || bulkDeleting}
              onClick={() =>
                fetchStudents({
                  silent: true,
                })
              }
              style={{
                borderRadius: 12,
                height: 46,
              }}
            >
              Làm mới
            </Button>

            <AppButton
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              loading={saving && !editingStudent}
              disabled={loading || saving || bulkDeleting}
              onClick={handleOpenCreateModal}
            >
              {saving && !editingStudent ? "Đang thêm..." : "Thêm học sinh"}
            </AppButton>
          </Space>
        </Col>
      </Row>

      {/* =================================================
          STATISTICS
      ================================================= */}
      <Row
        gutter={[18, 18]}
        style={{
          marginBottom: 26,
        }}
      >
        {/* Tổng học sinh */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng học sinh"
            value={statistics.total}
            loading={loading}
            icon={<TeamOutlined />}
            iconColor={primaryNavy}
            description="Tất cả học sinh"
          />
        </Col>

        {/* Đang hoạt động */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Đang hoạt động"
            value={statistics.active}
            loading={loading}
            icon={<UserSwitchOutlined />}
            iconColor="#059669"
            description="Học sinh đang hoạt động"
          />
        </Col>

        {/* Tạm khóa */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tạm khóa"
            value={statistics.inactive}
            loading={loading}
            icon={<LockOutlined />}
            iconColor="#ea580c"
            description="Học sinh tạm khóa"
          />
        </Col>

        {/* Chưa xếp lớp */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Chưa xếp lớp"
            value={statistics.unassigned}
            loading={loading}
            icon={<BookOutlined />}
            iconColor="#d97706"
            description="Chưa được phân lớp"
          />
        </Col>
      </Row>
      {/* =================================================
          MAIN
      ================================================= */}

      <Card
        bordered={false}
        style={{
          borderRadius: 22,
        }}
        bodyStyle={{
          padding: 24,
        }}
      >
        <Tabs
          activeKey={activeClassTab}
          onChange={handleTabChange}
          type="card"
          items={classTabs}
          style={{
            marginBottom: 22,
          }}
        />

        {/* FILTER */}

        <Row
          gutter={[12, 12]}
          align="middle"
          style={{
            marginBottom: 22,
          }}
        >
          <Col xs={24} md={12} lg={9}>
            <Input
              allowClear
              size="large"
              prefix={
                <SearchOutlined
                  style={{
                    color: "#94a3b8",
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
                borderRadius: 12,
              }}
            />
          </Col>

          <Col xs={24} md={6} lg={4}>
            <Select
              size="large"
              value={selectedStatus}
              disabled={loading || bulkDeleting}
              onChange={(value) => {
                setSelectedStatus(value);

                setCurrentPage(1);
              }}
              style={{
                width: "100%",
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
                borderRadius: 12,
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

        {/* TABLE */}

        <Table
          rowKey="id"
          loading={{
            spinning: loading,
            indicator: (
              <Spin size="large" tip="Đang tải danh sách học sinh..." />
            ),
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

        {/* PAGINATION */}

        <Row
          justify="space-between"
          align="middle"
          gutter={[16, 16]}
          style={{
            marginTop: 24,
          }}
        >
          <Col>
            <Text type="secondary">
              Hiển thị <strong>{filteredStudents.length}</strong> học sinh
            </Text>
          </Col>

          <Col>
            <Space>
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
                current={currentPage}
                total={filteredStudents.length}
                pageSize={pageSize}
                disabled={loading || saving || bulkDeleting}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showTotal={(total) => `${total} học sinh`}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* =================================================
          CREATE / EDIT MODAL
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
          onFinish={handleSaveStudent}
        />
      </AppFormModal>
      {/* =================================================
          DETAIL MODAL
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
          CHANGE CLASS MODAL
      ================================================= */}

      <Modal
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
              background: "#f8fafc",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              marginBottom: 20,
            }}
          >
            <Space>
              <Avatar icon={<UserOutlined />} />

              <div>
                <Text type="secondary">Học sinh</Text>

                <br />

                <Text strong>{changeClassStudent?.name}</Text>

                <br />

                <Text type="secondary">
                  Lớp hiện tại:{" "}
                  {changeClassStudent?.className || "Chưa xếp lớp"}
                </Text>
              </div>
            </Space>
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
    </div>
  );
}
