import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  BookOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  EditOutlined,
  FileSearchOutlined,
  FilterOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import AppButton from "../../components/common/AppButton";
import AppFormModal from "../../components/common/AppFormModal";
import AppDetailModal from "../../components/common/AppDetailModal";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";
import AppTable from "../../components/common/AppTable";
import { useNotification } from "../../components/notification";

import catechismProgramApi from "../../api/catechismProgramApi";
import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../../api/lessonApi";
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../api/questionApi";

const { Text, Title, Paragraph } = Typography;
const PAGE_SIZE = 10;

const COLORS = {
  navy: "#173B5E",
  navyDeep: "#102A43",
  gold: "#D9A441",
  goldSoft: "#FFF7E0",
  background: "#F7F9FC",
  pale: "#EEF3F7",
  border: "#E2E8F0",
  text: "#243447",
  muted: "#6B7280",
  green: "#2E7D5B",
  greenSoft: "#E8F5EE",
  white: "#FFFFFF",
};

const normalizePayload = (response) => response?.data ?? response;

const normalizeListResponse = (response) => {
  const payload = normalizePayload(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;

  return [];
};

const normalizePagination = (
  response,
  fallbackPage = 1,
  fallbackLimit = PAGE_SIZE,
) => {
  const payload = normalizePayload(response);
  const pagination = payload?.pagination;

  return {
    current: Number(pagination?.page) || fallbackPage,
    pageSize: Number(pagination?.limit) || fallbackLimit,
    total: Number(pagination?.total) || 0,
  };
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const unwrapRecord = (response) => {
  const payload = normalizePayload(response);
  return payload?.data ?? payload;
};

const LessonQuestionPage = () => {
  const notify = useNotification();

  const [activeTab, setActiveTab] = useState("lessons");

  // =========================================================
  // CHƯƠNG TRÌNH GIÁO LÝ
  // =========================================================

  const [programOptions, setProgramOptions] = useState([]);
  const [programLoading, setProgramLoading] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  // =========================================================
  // BÀI HỌC
  // =========================================================

  const [lessons, setLessons] = useState([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonSaving, setLessonSaving] = useState(false);

  const [lessonSearchInput, setLessonSearchInput] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");

  const [lessonPagination, setLessonPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  const [lessonDetailOpen, setLessonDetailOpen] = useState(false);
  const [lessonDetail, setLessonDetail] = useState(null);
  const [lessonDetailLoading, setLessonDetailLoading] = useState(false);

  const [lessonForm] = Form.useForm();

  // =========================================================
  // DANH SÁCH BÀI HỌC DÀNH CHO FORM CÂU HỎI
  // Không phụ thuộc trang bài học đang hiển thị.
  // =========================================================

  const [questionLessonOptions, setQuestionLessonOptions] = useState([]);
  const [questionLessonOptionsLoading, setQuestionLessonOptionsLoading] =
    useState(false);

  // =========================================================
  // NGÂN HÀNG CÂU HỎI
  // =========================================================

  const [questions, setQuestions] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionSaving, setQuestionSaving] = useState(false);

  const [questionSearchInput, setQuestionSearchInput] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionLessonFilter, setQuestionLessonFilter] = useState(null);

  const [questionPagination, setQuestionPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [questionDetailOpen, setQuestionDetailOpen] = useState(false);
  const [questionDetail, setQuestionDetail] = useState(null);
  const [questionDetailLoading, setQuestionDetailLoading] = useState(false);

  const [questionForm] = Form.useForm();

  // Chỉ tự động tải ngân hàng câu hỏi một lần khi mở tab.
  // Những lần lọc/tìm kiếm sau đó chỉ tải khi người dùng thao tác.
  const questionsInitialLoadStartedRef = useRef(false);

  // Chặn phản hồi của lần tải cũ ghi đè dữ liệu mới.
  const lessonRequestIdRef = useRef(0);
  const questionRequestIdRef = useRef(0);
  const questionLessonOptionsRequestRef = useRef(0);

  // =========================================================
  // TẢI CHƯƠNG TRÌNH
  // =========================================================

  const loadPrograms = useCallback(async () => {
    try {
      setProgramLoading(true);

      const response = await catechismProgramApi.getAll({
        status: "active",
      });

      const data = normalizeListResponse(response);

      const options = data
        .map((item) => ({
          value: Number(item.id),
          label: String(item.name || item.program_name || "").trim(),
        }))
        .filter(
          (item) => Number.isFinite(item.value) && item.value > 0 && item.label,
        );

      setProgramOptions(options);
    } catch (error) {
      notify.error(
        getErrorMessage(error, "Không thể tải danh sách chương trình giáo lý"),
      );
    } finally {
      setProgramLoading(false);
    }
  }, [notify]);

  const programLabel = useCallback(
    (programId, record = null) => {
      const rawId = programId ?? record?.program_id;
      const id = Number(rawId);

      if (!rawId || !Number.isFinite(id)) {
        return (
          record?.program_name ||
          record?.program?.name ||
          "Chưa xác định chương trình"
        );
      }

      const program = programOptions.find((item) => Number(item.value) === id);

      return (
        program?.label ||
        record?.program_name ||
        record?.program?.name ||
        `Chương trình #${id}`
      );
    },
    [programOptions],
  );

  // =========================================================
  // TẢI DANH SÁCH BÀI HỌC
  // =========================================================

  const loadLessons = useCallback(
    async (
      page = 1,
      pageSize = PAGE_SIZE,
      search = lessonSearch,
      programId = selectedProgramId,
    ) => {
      const requestId = ++lessonRequestIdRef.current;

      try {
        setLessonLoading(true);

        const params = {
          page: Number(page) || 1,
          limit: Number(pageSize) || PAGE_SIZE,
          search: String(search || "").trim() || undefined,
          program_id:
            programId !== null && programId !== undefined && programId !== ""
              ? Number(programId)
              : undefined,
        };

        const response = await getLessons(params);

        // Không cho kết quả request cũ ghi đè request mới.
        if (requestId !== lessonRequestIdRef.current) return;

        setLessons(normalizeListResponse(response));
        setLessonPagination(
          normalizePagination(response, params.page, params.limit),
        );
      } catch (error) {
        if (requestId === lessonRequestIdRef.current) {
          notify.error(
            getErrorMessage(error, "Không thể tải danh sách bài học"),
          );
        }
      } finally {
        if (requestId === lessonRequestIdRef.current) {
          setLessonLoading(false);
        }
      }
    },
    [notify, lessonSearch, selectedProgramId],
  );

  // =========================================================
  // TẢI BÀI HỌC CHO SELECT CÂU HỎI
  // =========================================================

  const loadQuestionLessonOptions = useCallback(async () => {
    const requestId = ++questionLessonOptionsRequestRef.current;

    try {
      setQuestionLessonOptionsLoading(true);

      // Lấy danh sách riêng, không dùng lessons của trang hiện tại.
      // Nếu backend giới hạn số bản ghi, hãy điều chỉnh limit tương ứng.
      const response = await getLessons({
        page: 1,
        limit: 1000,
      });

      if (requestId !== questionLessonOptionsRequestRef.current) return;

      const data = normalizeListResponse(response);

      setQuestionLessonOptions(
        data
          .map((lesson) => ({
            value: Number(lesson.id),
            label: String(lesson.title || "").trim(),
          }))
          .filter(
            (item) =>
              Number.isFinite(item.value) && item.value > 0 && item.label,
          ),
      );
    } catch (error) {
      if (requestId === questionLessonOptionsRequestRef.current) {
        notify.error(getErrorMessage(error, "Không thể tải danh sách bài học"));
      }
    } finally {
      if (requestId === questionLessonOptionsRequestRef.current) {
        setQuestionLessonOptionsLoading(false);
      }
    }
  }, [notify]);

  // =========================================================
  // TẢI NGÂN HÀNG CÂU HỎI
  // =========================================================

  const loadQuestions = useCallback(
    async (
      page = 1,
      pageSize = PAGE_SIZE,
      search = questionSearch,
      lessonId = questionLessonFilter,
    ) => {
      const requestId = ++questionRequestIdRef.current;

      try {
        setQuestionLoading(true);

        const params = {
          page: Number(page) || 1,
          limit: Number(pageSize) || PAGE_SIZE,
          search: String(search || "").trim() || undefined,
          lesson_id:
            lessonId !== null && lessonId !== undefined && lessonId !== ""
              ? Number(lessonId)
              : undefined,
        };

        const response = await getQuestions(params);

        if (requestId !== questionRequestIdRef.current) return;

        setQuestions(normalizeListResponse(response));
        setQuestionPagination(
          normalizePagination(response, params.page, params.limit),
        );
      } catch (error) {
        if (requestId === questionRequestIdRef.current) {
          notify.error(
            getErrorMessage(error, "Không thể tải ngân hàng câu hỏi"),
          );
        }
      } finally {
        if (requestId === questionRequestIdRef.current) {
          setQuestionLoading(false);
        }
      }
    },
    [notify, questionSearch, questionLessonFilter],
  );

  // Tải chương trình và trang bài học đầu tiên khi mở trang.
  useEffect(() => {
    loadPrograms();
    loadLessons(1, PAGE_SIZE, "", null);
    loadQuestionLessonOptions();

    // Chỉ chạy lúc mount; các thao tác tải lại nằm ở sự kiện người dùng.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chỉ tải câu hỏi lần đầu khi người dùng mở tab ngân hàng câu hỏi.
  useEffect(() => {
    if (activeTab !== "questions") return;
    if (questionsInitialLoadStartedRef.current) return;

    questionsInitialLoadStartedRef.current = true;
    loadQuestions(1, PAGE_SIZE, "", null);

    // Không phụ thuộc callback thay đổi theo bộ lọc.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const lessonOptions = useMemo(
    () =>
      questionLessonOptions.length > 0
        ? questionLessonOptions
        : lessons
            .map((lesson) => ({
              value: Number(lesson.id),
              label: lesson.title,
            }))
            .filter((item) => item.value && item.label),
    [questionLessonOptions, lessons],
  );

  // =========================================================
  // CRUD BÀI HỌC
  // =========================================================

  const openCreateLesson = () => {
    setEditingLesson(null);
    lessonForm.resetFields();

    lessonForm.setFieldsValue({
      program_id: selectedProgramId || undefined,
    });

    setLessonModalOpen(true);
  };

  const openEditLesson = (record) => {
    setEditingLesson(record);

    lessonForm.setFieldsValue({
      title: record.title || "",
      program_id: record.program_id ? Number(record.program_id) : undefined,
      description: record.description || "",
    });

    setLessonModalOpen(true);
  };

  const handleLessonSubmit = async () => {
    try {
      const values = await lessonForm.validateFields();

      const payload = {
        title: String(values.title || "").trim(),
        program_id: Number(values.program_id),
      };

      // Chỉ gửi description khi người dùng nhập.
      // Backend/database phải hỗ trợ cột description nếu sử dụng trường này.
      if (String(values.description || "").trim()) {
        payload.description = String(values.description).trim();
      }

      setLessonSaving(true);

      if (editingLesson) {
        await updateLesson(editingLesson.id, payload);
        notify.success("Đã cập nhật bài học");
      } else {
        await createLesson(payload);
        notify.success("Đã tạo bài học mới");
      }

      setLessonModalOpen(false);
      setEditingLesson(null);
      lessonForm.resetFields();

      await Promise.all([
        loadLessons(
          1,
          lessonPagination.pageSize,
          lessonSearch,
          selectedProgramId,
        ),
        loadQuestionLessonOptions(),
      ]);
    } catch (error) {
      if (error?.errorFields) return;

      notify.error(getErrorMessage(error, "Không thể lưu bài học"));
    } finally {
      setLessonSaving(false);
    }
  };

  const handleDeleteLesson = (record) => {
    Modal.confirm({
      title: "Xóa bài học?",
      content: (
        <span>
          Bạn có chắc muốn xóa bài học <strong>{record.title}</strong>? Nếu bài
          học đang có câu hỏi liên quan, hệ thống có thể từ chối xóa.
        </span>
      ),
      okText: "Xóa bài học",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await deleteLesson(record.id);
          notify.success("Đã xóa bài học");

          const nextPage =
            lessons.length === 1 && lessonPagination.current > 1
              ? lessonPagination.current - 1
              : lessonPagination.current;

          await Promise.all([
            loadLessons(
              nextPage,
              lessonPagination.pageSize,
              lessonSearch,
              selectedProgramId,
            ),
            loadQuestionLessonOptions(),
          ]);
        } catch (error) {
          notify.error(getErrorMessage(error, "Không thể xóa bài học"));
        }
      },
    });
  };

  const openLessonDetail = async (record) => {
    setLessonDetail(null);
    setLessonDetailOpen(true);
    setLessonDetailLoading(true);

    try {
      const response = await getLessonById(record.id);
      setLessonDetail(unwrapRecord(response));
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải chi tiết bài học"));
      setLessonDetailOpen(false);
    } finally {
      setLessonDetailLoading(false);
    }
  };

  // =========================================================
  // CRUD CÂU HỎI
  // =========================================================

  const openCreateQuestion = () => {
    setEditingQuestion(null);
    questionForm.resetFields();
    setQuestionModalOpen(true);
  };

  const openEditQuestion = (record) => {
    setEditingQuestion(record);

    questionForm.setFieldsValue({
      lesson_id: record.lesson_id ? Number(record.lesson_id) : undefined,
      question: record.question || "",
      answer_a: record.answer_a || "",
      answer_b: record.answer_b || "",
      answer_c: record.answer_c || "",
      answer_d: record.answer_d || "",
      correct_answer:
        String(record.correct_answer || "").toUpperCase() || undefined,
    });

    setQuestionModalOpen(true);
  };

  const handleQuestionSubmit = async () => {
    try {
      const values = await questionForm.validateFields();

      const payload = {
        lesson_id: Number(values.lesson_id),
        question: String(values.question || "").trim(),
        answer_a: String(values.answer_a || "").trim(),
        answer_b: String(values.answer_b || "").trim(),
        answer_c: String(values.answer_c || "").trim(),
        answer_d: String(values.answer_d || "").trim(),
        correct_answer: String(values.correct_answer || "").toUpperCase(),
      };

      setQuestionSaving(true);

      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, payload);
        notify.success("Đã cập nhật câu hỏi");
      } else {
        await createQuestion(payload);
        notify.success("Đã tạo câu hỏi mới");
      }

      setQuestionModalOpen(false);
      setEditingQuestion(null);
      questionForm.resetFields();

      await loadQuestions(
        1,
        questionPagination.pageSize,
        questionSearch,
        questionLessonFilter,
      );
    } catch (error) {
      if (error?.errorFields) return;

      notify.error(getErrorMessage(error, "Không thể lưu câu hỏi"));
    } finally {
      setQuestionSaving(false);
    }
  };

  const handleDeleteQuestion = (record) => {
    Modal.confirm({
      title: "Xóa câu hỏi?",
      content:
        "Bạn có chắc muốn xóa câu hỏi này? Thao tác này không thể hoàn tác.",
      okText: "Xóa câu hỏi",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await deleteQuestion(record.id);
          notify.success("Đã xóa câu hỏi");

          const nextPage =
            questions.length === 1 && questionPagination.current > 1
              ? questionPagination.current - 1
              : questionPagination.current;

          await loadQuestions(
            nextPage,
            questionPagination.pageSize,
            questionSearch,
            questionLessonFilter,
          );
        } catch (error) {
          notify.error(getErrorMessage(error, "Không thể xóa câu hỏi"));
        }
      },
    });
  };

  const openQuestionDetail = async (record) => {
    setQuestionDetail(null);
    setQuestionDetailOpen(true);
    setQuestionDetailLoading(true);

    try {
      const response = await getQuestionById(record.id);
      setQuestionDetail(unwrapRecord(response));
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải chi tiết câu hỏi"));
      setQuestionDetailOpen(false);
    } finally {
      setQuestionDetailLoading(false);
    }
  };

  // =========================================================
  // CỘT BẢNG BÀI HỌC
  // =========================================================

  const lessonColumns = [
    {
      title: "BÀI HỌC",
      dataIndex: "title",
      key: "title",
      width: 340,
      fixed: "left",
      render: (value, record) => (
        <Space align="start" size={12}>
          <div
            style={{
              width: 40,
              height: 40,
              flex: "0 0 40px",
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              color: COLORS.navy,
              background: COLORS.pale,
              fontSize: 17,
            }}
          >
            <BookOutlined />
          </div>
          <div style={{ minWidth: 0 }}>
            <Text
              strong
              style={{
                display: "block",
                color: COLORS.text,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
              }}
            >
              {value || "Chưa có tiêu đề"}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mã bài học: #{record.id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "CHƯƠNG TRÌNH",
      dataIndex: "program_id",
      key: "program_id",
      width: 240,
      render: (value, record) => (
        <Tag
          style={{
            margin: 0,
            padding: "4px 9px",
            borderRadius: 8,
            whiteSpace: "normal",
            lineHeight: 1.5,
            color: COLORS.navy,
            background: COLORS.pale,
            borderColor: "transparent",
          }}
        >
          {programLabel(value, record)}
        </Tag>
      ),
    },
    {
      title: "MÔ TẢ",
      dataIndex: "description",
      key: "description",
      width: 280,
      render: (value) => (
        <Text
          type="secondary"
          style={{ whiteSpace: "normal", lineHeight: 1.6 }}
        >
          {value || "Chưa có mô tả"}
        </Text>
      ),
    },
    {
      title: "THAO TÁC",
      key: "actions",
      width: 150,
      fixed: "right",
      align: "right",
      render: (_, record) => (
        <Space size={4}>
          <AppButton
            variant="secondary"
            size="small"
            icon={<FileSearchOutlined />}
            onClick={() => openLessonDetail(record)}
          />
          <AppButton
            variant="secondary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditLesson(record)}
          />
          <AppButton
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteLesson(record)}
          />
        </Space>
      ),
    },
  ];

  // =========================================================
  // CỘT BẢNG CÂU HỎI
  // =========================================================

  const questionColumns = [
    {
      title: "NỘI DUNG CÂU HỎI",
      dataIndex: "question",
      key: "question",
      width: 430,
      fixed: "left",
      render: (value, record) => (
        <Space align="start" size={12}>
          <div
            style={{
              width: 40,
              height: 40,
              flex: "0 0 40px",
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              color: COLORS.navy,
              background: COLORS.pale,
              fontSize: 17,
            }}
          >
            <QuestionCircleOutlined />
          </div>
          <div style={{ minWidth: 0 }}>
            <Text
              strong
              style={{
                display: "block",
                color: COLORS.text,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                lineHeight: 1.6,
              }}
            >
              {value || "Chưa có nội dung"}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mã câu hỏi: #{record.id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "BÀI HỌC",
      dataIndex: "lesson_title",
      key: "lesson_title",
      width: 280,
      render: (value) => (
        <Text style={{ whiteSpace: "normal", lineHeight: 1.6 }}>
          {value || "Chưa xác định"}
        </Text>
      ),
    },
    {
      title: "ĐÁP ÁN ĐÚNG",
      dataIndex: "correct_answer",
      key: "correct_answer",
      width: 140,
      align: "center",
      render: (value) => (
        <Tag
          icon={<CheckCircleFilled />}
          style={{
            margin: 0,
            padding: "4px 10px",
            borderRadius: 8,
            fontWeight: 700,
            color: COLORS.green,
            background: COLORS.greenSoft,
            borderColor: "transparent",
          }}
        >
          {String(value || "-").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "THAO TÁC",
      key: "actions",
      width: 150,
      fixed: "right",
      align: "right",
      render: (_, record) => (
        <Space size={4}>
          <AppButton
            variant="secondary"
            size="small"
            icon={<FileSearchOutlined />}
            onClick={() => openQuestionDetail(record)}
          />
          <AppButton
            variant="secondary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditQuestion(record)}
          />
          <AppButton
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteQuestion(record)}
          />
        </Space>
      ),
    },
  ];

  // =========================================================
  // GIAO DIỆN
  // =========================================================

  return (
    <div style={{ paddingBottom: 36, background: "transparent" }}>
      <PageHeroHeader
        title="Bài học & ngân hàng câu hỏi"
        subtitle="Tổ chức chương trình giáo lý, biên soạn bài học và quản lý câu hỏi ôn tập tại một nơi."
        icon={<BookOutlined />}
      />

      <Row gutter={[14, 14]} style={{ marginTop: 20, marginBottom: 20 }}>
        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Tổng bài học"
            value={lessonPagination.total}
            icon={<BookOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Tổng câu hỏi"
            value={questionPagination.total}
            icon={<QuestionCircleOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Chương trình giáo lý"
            value={programOptions.length}
            icon={<AppstoreOutlined />}
          />
        </Col>
      </Row>

      <Card
        bordered={false}
        style={{
          borderRadius: 18,
          boxShadow: "0 8px 30px rgba(16,42,67,0.06)",
          overflow: "hidden",
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          destroyInactiveTabPane={false}
          tabBarStyle={{
            margin: 0,
            padding: "0 22px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
          items={[
            {
              key: "lessons",
              label: (
                <Space>
                  <BookOutlined />
                  Bài học
                  <Tag>{lessonPagination.total}</Tag>
                </Space>
              ),
              children: (
                <div style={{ padding: 22 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                      flexWrap: "wrap",
                      marginBottom: 18,
                    }}
                  >
                    <div>
                      <Title
                        level={4}
                        style={{ margin: 0, color: COLORS.navy }}
                      >
                        Quản lý bài học
                      </Title>
                      <Paragraph
                        type="secondary"
                        style={{ margin: "5px 0 0", maxWidth: 620 }}
                      >
                        Chọn chương trình trước, sau đó tìm kiếm hoặc thêm bài
                        học vào đúng nhóm giáo lý.
                      </Paragraph>
                    </div>
                    <AppButton
                      variant="gold"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={openCreateLesson}
                    >
                      Tạo bài học
                    </AppButton>
                  </div>

                  <Card
                    size="small"
                    bordered
                    style={{
                      borderRadius: 14,
                      marginBottom: 18,
                      background: COLORS.background,
                      borderColor: COLORS.border,
                    }}
                    styles={{ body: { padding: 16 } }}
                  >
                    <Row gutter={[14, 12]} align="middle">
                      <Col xs={24} lg={15}>
                        <Space align="start" size={12}>
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              flex: "0 0 42px",
                              borderRadius: 12,
                              display: "grid",
                              placeItems: "center",
                              color: COLORS.navy,
                              background: COLORS.white,
                              border: `1px solid ${COLORS.border}`,
                              fontSize: 18,
                            }}
                          >
                            <ReadOutlined />
                          </div>
                          <div>
                            <Text
                              strong
                              style={{ display: "block", color: COLORS.navy }}
                            >
                              Chương trình giáo lý
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Lọc bài học theo từng chương trình
                            </Text>
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} lg={9}>
                        <Select
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          placeholder="Tất cả chương trình giáo lý"
                          value={selectedProgramId ?? undefined}
                          options={programOptions}
                          loading={programLoading}
                          onChange={(value) => {
                            const nextProgramId =
                              value !== undefined && value !== null
                                ? Number(value)
                                : null;

                            setSelectedProgramId(nextProgramId);
                            setLessonPagination((prev) => ({
                              ...prev,
                              current: 1,
                            }));

                            loadLessons(
                              1,
                              lessonPagination.pageSize,
                              lessonSearch,
                              nextProgramId,
                            );
                          }}
                          style={{ width: "100%" }}
                          size="large"
                        />
                      </Col>
                    </Row>

                    {selectedProgramId && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: COLORS.goldSoft,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <CheckCircleFilled style={{ color: COLORS.gold }} />
                        <Text strong style={{ color: COLORS.navy }}>
                          {programLabel(selectedProgramId)}
                        </Text>
                        <Text type="secondary">
                          — đang xem các bài học thuộc chương trình này
                        </Text>
                        <AppButton
                          size="small"
                          variant="secondary"
                          onClick={() => {
                            setSelectedProgramId(null);
                            setLessonPagination((prev) => ({
                              ...prev,
                              current: 1,
                            }));
                            loadLessons(
                              1,
                              lessonPagination.pageSize,
                              lessonSearch,
                              null,
                            );
                          }}
                        >
                          Bỏ lọc
                        </AppButton>
                      </div>
                    )}
                  </Card>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 14,
                    }}
                  >
                    <Input
                      allowClear
                      value={lessonSearchInput}
                      onChange={(event) =>
                        setLessonSearchInput(event.target.value)
                      }
                      onPressEnter={() => {
                        const value = lessonSearchInput.trim();
                        setLessonSearch(value);
                        loadLessons(
                          1,
                          lessonPagination.pageSize,
                          value,
                          selectedProgramId,
                        );
                      }}
                      onClear={() => {
                        setLessonSearchInput("");
                        setLessonSearch("");
                        loadLessons(
                          1,
                          lessonPagination.pageSize,
                          "",
                          selectedProgramId,
                        );
                      }}
                      prefix={
                        <SearchOutlined style={{ color: COLORS.muted }} />
                      }
                      placeholder="Tìm theo tên bài học..."
                      style={{ width: "min(100%, 390px)" }}
                      size="large"
                    />
                    <Space wrap>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {lessonPagination.total} bài học
                      </Text>
                      <AppButton
                        variant="secondary"
                        icon={<ReloadOutlined />}
                        size="small"
                        onClick={() =>
                          loadLessons(
                            lessonPagination.current,
                            lessonPagination.pageSize,
                            lessonSearch,
                            selectedProgramId,
                          )
                        }
                      >
                        Làm mới
                      </AppButton>
                    </Space>
                  </div>

                  <AppTable
                    rowKey="id"
                    loading={lessonLoading}
                    columns={lessonColumns}
                    dataSource={lessons}
                    scroll={{ x: 980 }}
                    pagination={{
                      current: lessonPagination.current,
                      pageSize: lessonPagination.pageSize,
                      total: lessonPagination.total,
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50", "100"],
                      showTotal: (total, range) =>
                        `${range[0]}–${range[1]} trong ${total} bài học`,
                      onChange: (page, pageSize) =>
                        loadLessons(
                          page,
                          pageSize,
                          lessonSearch,
                          selectedProgramId,
                        ),
                    }}
                    emptyText="Chưa có bài học. Hãy chọn chương trình hoặc tạo bài học đầu tiên."
                  />
                </div>
              ),
            },
            {
              key: "questions",
              label: (
                <Space>
                  <QuestionCircleOutlined />
                  Ngân hàng câu hỏi
                  <Tag>{questionPagination.total}</Tag>
                </Space>
              ),
              children: (
                <div style={{ padding: 22 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                      flexWrap: "wrap",
                      marginBottom: 18,
                    }}
                  >
                    <div>
                      <Title
                        level={4}
                        style={{ margin: 0, color: COLORS.navy }}
                      >
                        Ngân hàng câu hỏi
                      </Title>
                      <Paragraph
                        type="secondary"
                        style={{ margin: "5px 0 0", maxWidth: 620 }}
                      >
                        Mỗi câu hỏi gắn với một bài học và có bốn lựa chọn A, B,
                        C, D.
                      </Paragraph>
                    </div>
                    <AppButton
                      variant="gold"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={openCreateQuestion}
                    >
                      Tạo câu hỏi
                    </AppButton>
                  </div>

                  <Card
                    size="small"
                    bordered
                    style={{
                      borderRadius: 14,
                      marginBottom: 18,
                      background: COLORS.background,
                      borderColor: COLORS.border,
                    }}
                    styles={{ body: { padding: 16 } }}
                  >
                    <Row gutter={[12, 12]} align="middle">
                      <Col xs={24} lg={10}>
                        <Input
                          allowClear
                          value={questionSearchInput}
                          onChange={(event) =>
                            setQuestionSearchInput(event.target.value)
                          }
                          onPressEnter={() => {
                            const value = questionSearchInput.trim();
                            setQuestionSearch(value);
                            loadQuestions(
                              1,
                              questionPagination.pageSize,
                              value,
                              questionLessonFilter,
                            );
                          }}
                          prefix={
                            <SearchOutlined style={{ color: COLORS.muted }} />
                          }
                          placeholder="Tìm nội dung câu hỏi..."
                          size="large"
                        />
                      </Col>
                      <Col xs={24} lg={10}>
                        <Select
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          placeholder="Tất cả bài học"
                          value={questionLessonFilter ?? undefined}
                          options={lessonOptions}
                          loading={questionLessonOptionsLoading}
                          onChange={(value) => {
                            const lessonId =
                              value !== undefined && value !== null
                                ? Number(value)
                                : null;

                            setQuestionLessonFilter(lessonId);
                            loadQuestions(
                              1,
                              questionPagination.pageSize,
                              questionSearch,
                              lessonId,
                            );
                          }}
                          style={{ width: "100%" }}
                          size="large"
                          suffixIcon={<FilterOutlined />}
                        />
                      </Col>
                      <Col xs={24} lg={4}>
                        <AppButton
                          block
                          variant="secondary"
                          icon={<ReloadOutlined />}
                          size="small"
                          onClick={() =>
                            loadQuestions(
                              questionPagination.current,
                              questionPagination.pageSize,
                              questionSearch,
                              questionLessonFilter,
                            )
                          }
                        >
                          Làm mới
                        </AppButton>
                      </Col>
                    </Row>
                  </Card>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 14,
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {questionPagination.total} câu hỏi
                    </Text>
                    {(questionSearch || questionLessonFilter) && (
                      <AppButton
                        size="small"
                        variant="secondary"
                        onClick={() => {
                          setQuestionSearch("");
                          setQuestionSearchInput("");
                          setQuestionLessonFilter(null);
                          loadQuestions(
                            1,
                            questionPagination.pageSize,
                            "",
                            null,
                          );
                        }}
                      >
                        Xóa bộ lọc
                      </AppButton>
                    )}
                  </div>

                  <AppTable
                    rowKey="id"
                    loading={questionLoading}
                    columns={questionColumns}
                    dataSource={questions}
                    scroll={{ x: 980 }}
                    pagination={{
                      current: questionPagination.current,
                      pageSize: questionPagination.pageSize,
                      total: questionPagination.total,
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50", "100"],
                      showTotal: (total, range) =>
                        `${range[0]}–${range[1]} trong ${total} câu hỏi`,
                      onChange: (page, pageSize) =>
                        loadQuestions(
                          page,
                          pageSize,
                          questionSearch,
                          questionLessonFilter,
                        ),
                    }}
                    emptyText="Chưa có câu hỏi phù hợp với bộ lọc hiện tại."
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* =====================================================
          FORM TẠO / SỬA BÀI HỌC
      ====================================================== */}

      <AppFormModal
        open={lessonModalOpen}
        title={editingLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
        form={lessonForm}
        onCancel={() => {
          if (lessonSaving) return;
          setLessonModalOpen(false);
          setEditingLesson(null);
          lessonForm.resetFields();
        }}
        onOk={handleLessonSubmit}
        confirmLoading={lessonSaving}
        width={680}
      >
        <Form form={lessonForm} layout="vertical" onFinish={handleLessonSubmit}>
          <Alert
            type="info"
            showIcon
            message="Thông tin bài học"
            description="Chọn đúng chương trình giáo lý để dễ quản lý và tìm kiếm nội dung."
            style={{ marginBottom: 18, borderRadius: 10 }}
          />

          <Form.Item
            label="Tên bài học"
            name="title"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập tên bài học",
              },
              {
                min: 2,
                message: "Tên bài học phải có ít nhất 2 ký tự",
              },
              {
                max: 255,
                message: "Tên bài học không được vượt quá 255 ký tự",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Ví dụ: Thiên Chúa tạo dựng con người"
              maxLength={255}
            />
          </Form.Item>

          <Form.Item
            label="Chương trình giáo lý"
            name="program_id"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn chương trình giáo lý",
              },
            ]}
          >
            <Select
              size="large"
              showSearch
              optionFilterProp="label"
              placeholder="Chọn chương trình giáo lý"
              options={programOptions}
              loading={programLoading}
              notFoundContent={
                programLoading ? <Spin size="small" /> : "Không có chương trình"
              }
            />
          </Form.Item>

          <Form.Item label="Mô tả bài học" name="description">
            <Input.TextArea
              rows={4}
              placeholder="Mục tiêu, nội dung chính hoặc ghi chú cho bài học..."
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Form>
      </AppFormModal>

      {/* =====================================================
          FORM TẠO / SỬA CÂU HỎI
      ====================================================== */}

      <AppFormModal
        open={questionModalOpen}
        title={editingQuestion ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
        form={questionForm}
        onCancel={() => {
          if (questionSaving) return;
          setQuestionModalOpen(false);
          setEditingQuestion(null);
          questionForm.resetFields();
        }}
        onOk={handleQuestionSubmit}
        confirmLoading={questionSaving}
        width={760}
      >
        <Form
          form={questionForm}
          layout="vertical"
          onFinish={handleQuestionSubmit}
        >
          <Form.Item
            label="Bài học"
            name="lesson_id"
            rules={[{ required: true, message: "Vui lòng chọn bài học" }]}
          >
            <Select
              size="large"
              showSearch
              optionFilterProp="label"
              placeholder="Chọn bài học chứa câu hỏi này"
              options={lessonOptions}
              loading={questionLessonOptionsLoading}
              notFoundContent={
                questionLessonOptionsLoading ? (
                  <Spin size="small" />
                ) : (
                  "Chưa có bài học"
                )
              }
            />
          </Form.Item>

          {lessonOptions.length === 0 && (
            <Alert
              type="warning"
              showIcon
              message="Chưa có bài học trong danh sách"
              description="Hãy tạo bài học trước hoặc tải lại danh sách bài học."
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            label="Nội dung câu hỏi"
            name="question"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập nội dung câu hỏi",
              },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập câu hỏi rõ ràng, dễ hiểu..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Row gutter={14}>
            {["a", "b", "c", "d"].map((letter) => (
              <Col xs={24} md={12} key={letter}>
                <Form.Item
                  label={`Đáp án ${letter.toUpperCase()}`}
                  name={`answer_${letter}`}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: `Vui lòng nhập đáp án ${letter.toUpperCase()}`,
                    },
                  ]}
                >
                  <Input placeholder={`Nhập đáp án ${letter.toUpperCase()}`} />
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Form.Item
            label="Đáp án đúng"
            name="correct_answer"
            rules={[{ required: true, message: "Vui lòng chọn đáp án đúng" }]}
          >
            <Select
              size="large"
              placeholder="Chọn đáp án đúng"
              options={[
                { value: "A", label: "A — Đáp án A" },
                { value: "B", label: "B — Đáp án B" },
                { value: "C", label: "C — Đáp án C" },
                { value: "D", label: "D — Đáp án D" },
              ]}
            />
          </Form.Item>
        </Form>
      </AppFormModal>

      {/* =====================================================
          CHI TIẾT BÀI HỌC
      ====================================================== */}

      <AppDetailModal
        open={lessonDetailOpen}
        title="Chi tiết bài học"
        onCancel={() => setLessonDetailOpen(false)}
        width={700}
      >
        {lessonDetailLoading ? (
          <div
            style={{ minHeight: 180, display: "grid", placeItems: "center" }}
          >
            <Spin />
          </div>
        ) : lessonDetail ? (
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, letterSpacing: 1 }}>
                TÊN BÀI HỌC
              </Text>
              <Title
                level={4}
                style={{ color: COLORS.navy, margin: "5px 0 0" }}
              >
                {lessonDetail.title || "Chưa có tiêu đề"}
              </Title>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 11, letterSpacing: 1 }}>
                CHƯƠNG TRÌNH GIÁO LÝ
              </Text>
              <div style={{ marginTop: 7 }}>
                <Tag color="gold">
                  {programLabel(lessonDetail.program_id, lessonDetail)}
                </Tag>
              </div>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 11, letterSpacing: 1 }}>
                MÔ TẢ
              </Text>
              <Paragraph
                style={{
                  margin: "7px 0 0",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.8,
                }}
              >
                {lessonDetail.description || "Chưa có mô tả cho bài học này."}
              </Paragraph>
            </div>
          </Space>
        ) : (
          <Empty description="Không có dữ liệu bài học" />
        )}
      </AppDetailModal>

      {/* =====================================================
          CHI TIẾT CÂU HỎI
      ====================================================== */}

      <AppDetailModal
        open={questionDetailOpen}
        title="Chi tiết câu hỏi"
        onCancel={() => setQuestionDetailOpen(false)}
        width={700}
      >
        {questionDetailLoading ? (
          <div
            style={{ minHeight: 180, display: "grid", placeItems: "center" }}
          >
            <Spin />
          </div>
        ) : questionDetail ? (
          <Space direction="vertical" size={14} style={{ width: "100%" }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, letterSpacing: 1 }}>
                BÀI HỌC
              </Text>
              <Title
                level={5}
                style={{ color: COLORS.navy, margin: "5px 0 0" }}
              >
                {questionDetail.lesson_title || "Chưa xác định"}
              </Title>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 11, letterSpacing: 1 }}>
                NỘI DUNG CÂU HỎI
              </Text>
              <Paragraph
                strong
                style={{ fontSize: 16, margin: "7px 0 0", lineHeight: 1.7 }}
              >
                {questionDetail.question || "Chưa có nội dung"}
              </Paragraph>
            </div>

            <div style={{ display: "grid", gap: 9 }}>
              {["A", "B", "C", "D"].map((letter) => {
                const answerKey = `answer_${letter.toLowerCase()}`;
                const isCorrect =
                  String(questionDetail.correct_answer || "").toUpperCase() ===
                  letter;

                return (
                  <div
                    key={letter}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "13px 14px",
                      borderRadius: 12,
                      border: `1px solid ${
                        isCorrect ? "#A7D7BC" : COLORS.border
                      }`,
                      background: isCorrect ? COLORS.greenSoft : COLORS.white,
                    }}
                  >
                    <Tag
                      style={{
                        margin: 0,
                        minWidth: 30,
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                      color={isCorrect ? "success" : "default"}
                    >
                      {letter}
                    </Tag>

                    <div style={{ flex: 1, lineHeight: 1.65 }}>
                      {questionDetail[answerKey] || "Chưa nhập đáp án"}
                    </div>

                    {isCorrect && (
                      <Tag color="success" icon={<CheckCircleFilled />}>
                        Đáp án đúng
                      </Tag>
                    )}
                  </div>
                );
              })}
            </div>
          </Space>
        ) : (
          <Empty description="Không có dữ liệu câu hỏi" />
        )}
      </AppDetailModal>
    </div>
  );
};

export default LessonQuestionPage;
