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
  BookOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  EditOutlined,
  FileSearchOutlined,
  FilterOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  AppstoreOutlined,
  ReadOutlined,
} from "@ant-design/icons";

import AppButton from "../../components/common/AppButton";
import AppFormModal from "../../components/common/AppFormModal";
import AppDetailModal from "../../components/common/AppDetailModal";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";
import AppTable from "../../components/common/AppTable";
import { useNotification } from "../../components/notification";

import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonTypes,
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

const FALLBACK_LESSON_TYPES = [
  { value: "khai_tam", label: "Giáo lý Khai Tâm" },
  { value: "den_ban_tiec_thanh", label: "Đến Bàn Tiệc Thánh" },
  { value: "lon_len_trong_chua_thanh", label: "Lớn Lên Trong Chúa Thánh" },
  { value: "song_dao", label: "Sống Đạo" },
  { value: "vao_doi", label: "Vào Đời" },
  { value: "huynh_truong", label: "Huynh Trưởng" },
  { value: "hon_nhan", label: "Hôn Nhân" },
  { value: "du_tong", label: "Dự Tòng" },
  { value: "nguoi_lon", label: "Giáo lý Người Lớn" },
  { value: "kinh_thanh", label: "Kinh Thánh" },
  { value: "mua_chay", label: "Mùa Chay" },
  { value: "mua_he", label: "Mùa Hè" },
  { value: "hiep_thong", label: "Hiệp Thông" },
];

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
  red: "#C94C4C",
  redSoft: "#FDECEC",
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

const LessonQuestionPage = () => {
  const notify = useNotification();

  const [activeTab, setActiveTab] = useState("lessons");

  // Lessons
  const [lessons, setLessons] = useState([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonSaving, setLessonSaving] = useState(false);
  const [lessonSearchInput, setLessonSearchInput] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");
  const [selectedLessonType, setSelectedLessonType] = useState(null);
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
  const [lessonTypeOptions, setLessonTypeOptions] = useState(
    FALLBACK_LESSON_TYPES,
  );
  const [lessonForm] = Form.useForm();

  // Questions
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
  const questionsInitialLoadStartedRef = useRef(false);
  const loadLessonTypes = useCallback(async () => {
    try {
      const response = await getLessonTypes();
      const data = normalizeListResponse(response);
      const options = data
        .map((item) => ({
          value: item.value || item.key || item.code,
          label: item.label || item.name || item.title,
        }))
        .filter((item) => item.value && item.label);
      setLessonTypeOptions(options.length ? options : FALLBACK_LESSON_TYPES);
    } catch {
      setLessonTypeOptions(FALLBACK_LESSON_TYPES);
    }
  }, []);

  const loadLessons = useCallback(
    async (
      page = 1,
      pageSize = PAGE_SIZE,
      search = lessonSearch,
      catechismType = selectedLessonType,
    ) => {
      try {
        setLessonLoading(true);
        const params = {
          page: Number(page) || 1,
          limit: Number(pageSize) || PAGE_SIZE,
          search: String(search || "").trim() || undefined,
          // Requires backend GET /lessons to support catechism_type.
          catechism_type: catechismType || undefined,
        };
        const response = await getLessons(params);
        setLessons(normalizeListResponse(response));
        setLessonPagination(
          normalizePagination(response, params.page, params.limit),
        );
      } catch (error) {
        notify.error(getErrorMessage(error, "Không thể tải danh sách bài học"));
      } finally {
        setLessonLoading(false);
      }
    },
    [notify, lessonSearch, selectedLessonType],
  );

  const loadQuestions = useCallback(
    async (
      page = 1,
      pageSize = PAGE_SIZE,
      search = questionSearch,
      lessonId = questionLessonFilter,
    ) => {
      try {
        setQuestionLoading(true);
        const params = {
          page: Number(page) || 1,
          limit: Number(pageSize) || PAGE_SIZE,
          search: String(search || "").trim() || undefined,
          lesson_id: lessonId || undefined,
        };
        const response = await getQuestions(params);
        setQuestions(normalizeListResponse(response));
        setQuestionPagination(
          normalizePagination(response, params.page, params.limit),
        );
      } catch (error) {
        notify.error(getErrorMessage(error, "Không thể tải ngân hàng câu hỏi"));
      } finally {
        setQuestionLoading(false);
      }
    },
    [notify, questionSearch, questionLessonFilter],
  );

  useEffect(() => {
    loadLessonTypes();
    loadLessons(1, PAGE_SIZE, "", null);
    // Initial page load only; filters are applied by explicit user actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab !== "questions" || questionsInitialLoadStartedRef.current) {
      return;
    }

    // Đánh dấu trước khi gọi API để tránh vòng lặp khi dữ liệu rỗng.
    questionsInitialLoadStartedRef.current = true;

    loadQuestions(1, PAGE_SIZE, questionSearch, questionLessonFilter);
  }, [activeTab, loadQuestions, questionSearch, questionLessonFilter]);

  const lessonTypeLabel = useCallback(
    (value) =>
      lessonTypeOptions.find((item) => item.value === value)?.label ||
      value ||
      "Chưa xác định",
    [lessonTypeOptions],
  );

  const lessonOptions = useMemo(
    () =>
      lessons
        .map((lesson) => ({ value: lesson.id, label: lesson.title }))
        .filter((item) => item.value != null && item.label),
    [lessons],
  );

  const openCreateLesson = () => {
    setEditingLesson(null);
    lessonForm.resetFields();
    lessonForm.setFieldsValue({
      catechism_type: selectedLessonType || undefined,
    });
    setLessonModalOpen(true);
  };

  const openEditLesson = (record) => {
    setEditingLesson(record);
    lessonForm.setFieldsValue({
      title: record.title || "",
      catechism_type: record.catechism_type || undefined,
      description: record.description || "",
    });
    setLessonModalOpen(true);
  };

  const handleLessonSubmit = async () => {
    try {
      const values = await lessonForm.validateFields();
      const payload = {
        title: String(values.title || "").trim(),
        catechism_type: values.catechism_type,
        description: String(values.description || "").trim(),
      };
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
      await loadLessons(
        1,
        lessonPagination.pageSize,
        lessonSearch,
        selectedLessonType,
      );
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
          await loadLessons(
            nextPage,
            lessonPagination.pageSize,
            lessonSearch,
            selectedLessonType,
          );
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
      const payload = normalizePayload(response);
      setLessonDetail(payload?.data || payload);
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải chi tiết bài học"));
      setLessonDetailOpen(false);
    } finally {
      setLessonDetailLoading(false);
    }
  };

  const openCreateQuestion = () => {
    setEditingQuestion(null);
    questionForm.resetFields();
    setQuestionModalOpen(true);
  };

  const openEditQuestion = (record) => {
    setEditingQuestion(record);
    questionForm.setFieldsValue({
      lesson_id: record.lesson_id,
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
      const payload = normalizePayload(response);
      setQuestionDetail(payload?.data || payload);
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải chi tiết câu hỏi"));
      setQuestionDetailOpen(false);
    } finally {
      setQuestionDetailLoading(false);
    }
  };

  const lessonColumns = [
    {
      title: "BÀI HỌC",
      dataIndex: "title",
      key: "title",
      width: 360,
      fixed: "left",
      render: (value, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            minWidth: 220,
          }}
        >
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
                lineHeight: 1.5,
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
        </div>
      ),
    },
    {
      title: "CHƯƠNG TRÌNH",
      dataIndex: "catechism_type",
      key: "catechism_type",
      width: 240,
      render: (value) => (
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
          {lessonTypeLabel(value)}
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

  const questionColumns = [
    {
      title: "NỘI DUNG CÂU HỎI",
      dataIndex: "question",
      key: "question",
      width: 430,
      fixed: "left",
      render: (value, record) => (
        <div
          style={{
            display: "flex",
            gap: 12,
            minWidth: 220,
            alignItems: "flex-start",
          }}
        >
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
                lineHeight: 1.6,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
              }}
            >
              {value || "Chưa có nội dung"}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mã câu hỏi: #{record.id}
            </Text>
          </div>
        </div>
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

  const selectedTypeOption = lessonTypeOptions.find(
    (item) => item.value === selectedLessonType,
  );

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
            value={lessonTypeOptions.length}
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
                  <Tag style={{ marginInlineStart: 2 }}>
                    {lessonPagination.total}
                  </Tag>
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
                              background: "#FFFFFF",
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
                              Lọc danh sách theo từng chương trình
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
                          value={selectedLessonType}
                          options={lessonTypeOptions}
                          onChange={(value) => {
                            const nextType = value || null;
                            setSelectedLessonType(nextType);
                            setLessonPagination((prev) => ({
                              ...prev,
                              current: 1,
                            }));
                            loadLessons(
                              1,
                              lessonPagination.pageSize,
                              lessonSearch,
                              nextType,
                            );
                          }}
                          style={{ width: "100%" }}
                          size="large"
                        />
                      </Col>
                    </Row>
                    {selectedTypeOption && (
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
                          {selectedTypeOption.label}
                        </Text>
                        <Text type="secondary">
                          — đang xem các bài học thuộc chương trình này
                        </Text>
                        <AppButton
                          size="small"
                          variant="secondary"
                          onClick={() => {
                            setSelectedLessonType(null);
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
                          selectedLessonType,
                        );
                      }}
                      prefix={
                        <SearchOutlined style={{ color: COLORS.muted }} />
                      }
                      placeholder="Tìm theo tên bài học hoặc nội dung..."
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
                            selectedLessonType,
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
                          selectedLessonType,
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
                  <Tag style={{ marginInlineStart: 2 }}>
                    {questionPagination.total}
                  </Tag>
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
                          value={questionLessonFilter}
                          options={lessonOptions}
                          onChange={(value) => {
                            const lessonId = value || null;
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

      {/* Lesson create/edit */}
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
            description="Chọn đúng chương trình giáo lý để giáo lý viên dễ tìm kiếm và sử dụng nội dung."
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
              { min: 2, message: "Tên bài học phải có ít nhất 2 ký tự" },
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
            name="catechism_type"
            rules={[
              { required: true, message: "Vui lòng chọn chương trình giáo lý" },
            ]}
          >
            <Select
              size="large"
              showSearch
              optionFilterProp="label"
              placeholder="Chọn chương trình giáo lý"
              options={lessonTypeOptions}
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

      {/* Question create/edit */}
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
            />
          </Form.Item>
          {lessonOptions.length === 0 && (
            <Alert
              type="warning"
              showIcon
              message="Chưa có bài học trong danh sách hiện tại"
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

      {/* Lesson detail */}
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
                  {lessonTypeLabel(lessonDetail.catechism_type)}
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

      {/* Question detail */}
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
                      border: `1px solid ${isCorrect ? "#A7D7BC" : COLORS.border}`,
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
