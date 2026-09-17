import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
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
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";

import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import AppButton from "../../components/common/AppButton";
import AppFormModal from "../../components/common/AppFormModal";
import AppDetailModal from "../../components/common/AppDetailModal";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";

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

const { Text, Title } = Typography;

const PAGE_SIZE = 10;

/* =========================================================
   FALLBACK LESSON TYPES
========================================================= */

const FALLBACK_LESSON_TYPES = [
  {
    value: "khai_tam",
    label: "Giáo lý Khai Tâm",
  },
  {
    value: "den_ban_tiec_thanh",
    label: "Đến Bàn Tiệc Thánh",
  },
  {
    value: "lon_len_trong_chua_thanh",
    label: "Lớn Lên Trong Chúa Thánh",
  },
  {
    value: "song_dao",
    label: "Sống Đạo",
  },
  {
    value: "vao_doi",
    label: "Vào Đời",
  },
  {
    value: "huynh_truong",
    label: "Huynh Trưởng",
  },
  {
    value: "hon_nhan",
    label: "Hôn Nhân",
  },
  {
    value: "du_tong",
    label: "Dự Tòng",
  },
  {
    value: "nguoi_lon",
    label: "Giáo lý Người Lớn",
  },
  {
    value: "kinh_thanh",
    label: "Kinh Thánh",
  },
  {
    value: "mua_chay",
    label: "Mùa Chay",
  },
  {
    value: "mua_he",
    label: "Mùa Hè",
  },
];

/* =========================================================
   RESPONSE HELPERS
========================================================= */

const normalizeListResponse = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.rows)) {
    return payload.rows;
  }

  return [];
};

const normalizePagination = (
  response,
  fallbackPage = 1,
  fallbackLimit = PAGE_SIZE,
) => {
  const payload = response?.data ?? response;
  const pagination = payload?.pagination;

  return {
    current: Number(pagination?.page || fallbackPage),
    pageSize: Number(pagination?.limit || fallbackLimit),
    total: Number(pagination?.total || 0),
  };
};

/* =========================================================
   COMPONENT
========================================================= */

const LessonQuestionPage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  /* =======================================================
     TAB
  ======================================================= */

  const [activeTab, setActiveTab] = useState("lessons");

  /* =======================================================
     LESSON STATE
  ======================================================= */

  const [lessons, setLessons] = useState([]);

  const [lessonLoading, setLessonLoading] = useState(false);

  const [lessonSaving, setLessonSaving] = useState(false);

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

  const [lessonTypeOptions, setLessonTypeOptions] = useState(
    FALLBACK_LESSON_TYPES,
  );

  const [lessonForm] = Form.useForm();

  /* =======================================================
     QUESTION STATE
  ======================================================= */

  const [questions, setQuestions] = useState([]);

  const [questionLoading, setQuestionLoading] = useState(false);

  const [questionSaving, setQuestionSaving] = useState(false);

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

  /* =========================================================
     LOAD LESSON TYPES
  ========================================================= */

  const loadLessonTypes = useCallback(async () => {
    try {
      const response = await getLessonTypes();

      const data = normalizeListResponse(response);

      if (!data.length) {
        setLessonTypeOptions(FALLBACK_LESSON_TYPES);

        return;
      }

      const options = data
        .map((item) => ({
          value: item.value || item.key || item.code,

          label: item.label || item.name || item.title,
        }))
        .filter((item) => item.value && item.label);

      setLessonTypeOptions(options.length ? options : FALLBACK_LESSON_TYPES);
    } catch (error) {
      setLessonTypeOptions(FALLBACK_LESSON_TYPES);
    }
  }, []);

  /* =========================================================
     LOAD LESSONS
     
     Không phụ thuộc lessonPagination.
  ========================================================= */

  const loadLessons = useCallback(
    async (page = 1, pageSize = PAGE_SIZE, search = "") => {
      const safePage = Number(page) || 1;

      const safePageSize = Number(pageSize) || PAGE_SIZE;

      const safeSearch = String(search || "").trim();

      try {
        setLessonLoading(true);

        const response = await getLessons({
          page: safePage,
          limit: safePageSize,
          search: safeSearch || undefined,
        });

        const data = normalizeListResponse(response);

        setLessons(data);

        setLessonPagination(
          normalizePagination(response, safePage, safePageSize),
        );
      } catch (error) {
        messageApi.error(
          error?.response?.data?.message || "Không thể tải danh sách bài học",
        );
      } finally {
        setLessonLoading(false);
      }
    },
    [messageApi],
  );

  /* =========================================================
     LOAD QUESTIONS
     
     Không phụ thuộc questionPagination.
  ========================================================= */

  const loadQuestions = useCallback(
    async (page = 1, pageSize = PAGE_SIZE, search = "", lessonId = null) => {
      const safePage = Number(page) || 1;

      const safePageSize = Number(pageSize) || PAGE_SIZE;

      const safeSearch = String(search || "").trim();

      try {
        setQuestionLoading(true);

        const response = await getQuestions({
          page: safePage,
          limit: safePageSize,
          search: safeSearch || undefined,
          lesson_id: lessonId || undefined,
        });

        const data = normalizeListResponse(response);

        setQuestions(data);

        setQuestionPagination(
          normalizePagination(response, safePage, safePageSize),
        );
      } catch (error) {
        messageApi.error(
          error?.response?.data?.message || "Không thể tải ngân hàng câu hỏi",
        );
      } finally {
        setQuestionLoading(false);
      }
    },
    [messageApi],
  );

  /* =========================================================
     INITIAL LOAD
     
     Chỉ chạy một lần khi component mount.
  ========================================================= */

  useEffect(() => {
    loadLessonTypes();
    loadLessons(1, PAGE_SIZE, "");
  }, [loadLessonTypes, loadLessons]);

  /* =========================================================
     LOAD QUESTIONS WHEN OPEN TAB
     
     Không dùng questionPagination trong dependency.
     Chỉ load lần đầu khi mở tab.
  ========================================================= */

  useEffect(() => {
    if (activeTab !== "questions") {
      return;
    }

    if (questions.length > 0) {
      return;
    }

    loadQuestions(1, PAGE_SIZE, questionSearch, questionLessonFilter);
  }, [
    activeTab,
    loadQuestions,
    questions.length,
    questionSearch,
    questionLessonFilter,
  ]);

  /* =========================================================
     LESSON OPTIONS
  ========================================================= */

  const lessonOptions = useMemo(() => {
    return lessons
      .map((lesson) => ({
        value: lesson.id,
        label: lesson.title,
      }))
      .filter((item) => item.value && item.label);
  }, [lessons]);

  /* =========================================================
     CREATE LESSON
  ========================================================= */

  const openCreateLesson = () => {
    setEditingLesson(null);

    lessonForm.resetFields();

    setLessonModalOpen(true);
  };

  /* =========================================================
     EDIT LESSON
  ========================================================= */

  const openEditLesson = (record) => {
    try {
      setEditingLesson(record);

      lessonForm.setFieldsValue({
        title: record.title || "",

        catechism_type: record.catechism_type || undefined,

        description: record.description || "",
      });

      setLessonModalOpen(true);
    } catch (error) {
      message.error("OPEN EDIT LESSON ERROR:", error);
    }
  };

  /* =========================================================
     SUBMIT LESSON
  ========================================================= */

  const handleLessonSubmit = async () => {
    try {
      const values = await lessonForm.validateFields();

      const payload = {
        title: String(values.title || "").trim(),

        catechism_type: values.catechism_type,

        description: String(values.description || "").trim(),
      };

      if (!payload.title) {
        messageApi.error("Tiêu đề không được bỏ trống");

        return;
      }

      if (payload.title.length < 2) {
        messageApi.error("Tên bài học phải có ít nhất 2 ký tự");

        return;
      }

      if (!payload.catechism_type) {
        messageApi.error("Vui lòng chọn loại giáo lý");

        return;
      }

      setLessonSaving(true);

      if (editingLesson) {
        await updateLesson(editingLesson.id, payload);

        messageApi.success("Đã cập nhật bài học");
      } else {
        await createLesson(payload);

        messageApi.success("Đã tạo bài học mới");
      }

      setLessonModalOpen(false);
      setEditingLesson(null);

      lessonForm.resetFields();

      await loadLessons(
        lessonPagination.current,
        lessonPagination.pageSize,
        lessonSearch,
      );
    } catch (error) {
      if (error?.errorFields) {
        return;
      }

      messageApi.error(
        error?.response?.data?.message || "Không thể lưu bài học",
      );
    } finally {
      setLessonSaving(false);
    }
  };

  /* =========================================================
     DELETE LESSON
  ========================================================= */

  const handleDeleteLesson = (record) => {
    Modal.confirm({
      title: "Xóa bài học?",

      content: (
        <div>
          Bạn có chắc muốn xóa bài học <strong>{record.title}</strong>?
        </div>
      ),

      okText: "Xóa",

      cancelText: "Hủy",

      okButtonProps: {
        danger: true,
      },

      async onOk() {
        try {
          await deleteLesson(record.id);

          messageApi.success("Đã xóa bài học");

          let page = lessonPagination.current;

          if (lessons.length === 1 && page > 1) {
            page -= 1;
          }

          await loadLessons(page, lessonPagination.pageSize, lessonSearch);
        } catch (error) {
          messageApi.error(
            error?.response?.data?.message || "Không thể xóa bài học",
          );
        }
      },
    });
  };

  /* =========================================================
     LESSON DETAIL
  ========================================================= */

  const openLessonDetail = async (record) => {
    try {
      setLessonDetail(null);

      setLessonDetailOpen(true);

      setLessonDetailLoading(true);

      const response = await getLessonById(record.id);

      const payload = response?.data ?? response;

      setLessonDetail(payload?.data || payload);
    } catch (error) {
      messageApi.error(
        error?.response?.data?.message || "Không thể tải chi tiết bài học",
      );

      setLessonDetailOpen(false);
    } finally {
      setLessonDetailLoading(false);
    }
  };

  /* =========================================================
     CREATE QUESTION
  ========================================================= */

  const openCreateQuestion = () => {
    setEditingQuestion(null);

    questionForm.resetFields();

    setQuestionModalOpen(true);
  };

  /* =========================================================
     EDIT QUESTION
  ========================================================= */

  const openEditQuestion = (record) => {
    try {
      setEditingQuestion(record);

      questionForm.setFieldsValue({
        lesson_id: record.lesson_id,

        question: record.question || "",

        answer_a: record.answer_a || "",

        answer_b: record.answer_b || "",

        answer_c: record.answer_c || "",

        answer_d: record.answer_d || "",

        correct_answer: record.correct_answer || undefined,
      });

      setQuestionModalOpen(true);
    } catch (error) {
      message.error("OPEN EDIT QUESTION ERROR:", error);
    }
  };

  /* =========================================================
     SUBMIT QUESTION
  ========================================================= */

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

      if (!payload.question) {
        messageApi.error("Nội dung câu hỏi không được bỏ trống");

        return;
      }

      if (
        !payload.answer_a ||
        !payload.answer_b ||
        !payload.answer_c ||
        !payload.answer_d
      ) {
        messageApi.error("Vui lòng nhập đầy đủ 4 đáp án");

        return;
      }

      if (!["A", "B", "C", "D"].includes(payload.correct_answer)) {
        messageApi.error("Đáp án đúng không hợp lệ");

        return;
      }

      setQuestionSaving(true);

      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, payload);

        messageApi.success("Đã cập nhật câu hỏi");
      } else {
        await createQuestion(payload);

        messageApi.success("Đã tạo câu hỏi mới");
      }

      setQuestionModalOpen(false);

      setEditingQuestion(null);

      questionForm.resetFields();

      await loadQuestions(
        questionPagination.current,
        questionPagination.pageSize,
        questionSearch,
        questionLessonFilter,
      );
    } catch (error) {
      if (error?.errorFields) {
        return;
      }

      messageApi.error(
        error?.response?.data?.message || "Không thể lưu câu hỏi",
      );
    } finally {
      setQuestionSaving(false);
    }
  };

  /* =========================================================
     DELETE QUESTION
  ========================================================= */

  const handleDeleteQuestion = (record) => {
    Modal.confirm({
      title: "Xóa câu hỏi?",

      content: <div>Bạn có chắc muốn xóa câu hỏi này?</div>,

      okText: "Xóa",

      cancelText: "Hủy",

      okButtonProps: {
        danger: true,
      },

      async onOk() {
        try {
          await deleteQuestion(record.id);

          messageApi.success("Đã xóa câu hỏi");

          let page = questionPagination.current;

          if (questions.length === 1 && page > 1) {
            page -= 1;
          }

          await loadQuestions(
            page,
            questionPagination.pageSize,
            questionSearch,
            questionLessonFilter,
          );
        } catch (error) {
          messageApi.error(
            error?.response?.data?.message || "Không thể xóa câu hỏi",
          );
        }
      },
    });
  };

  /* =========================================================
     QUESTION DETAIL
  ========================================================= */

  const openQuestionDetail = async (record) => {
    try {
      setQuestionDetail(null);

      setQuestionDetailOpen(true);

      setQuestionDetailLoading(true);

      const response = await getQuestionById(record.id);

      const payload = response?.data ?? response;

      setQuestionDetail(payload?.data || payload);
    } catch (error) {
      messageApi.error(
        error?.response?.data?.message || "Không thể tải chi tiết câu hỏi",
      );

      setQuestionDetailOpen(false);
    } finally {
      setQuestionDetailLoading(false);
    }
  };

  /* =========================================================
     LESSON TABLE
  ========================================================= */
  /* =========================================================
   LESSON TABLE
   ========================================================= */

  const lessonColumns = [
    {
      title: "Bài học",
      dataIndex: "title",
      key: "title",
      width: 320,
      fixed: "left",

      render: (value, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            minWidth: 0,
            width: "100%",
          }}
        >
          {/* ICON */}
          <div
            style={{
              width: 38,
              minWidth: 38,
              height: 38,
              borderRadius: 10,
              background: "#EEF2F7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1B365D",
              flexShrink: 0,
            }}
          >
            <BookOutlined />
          </div>

          {/* CONTENT */}
          <div
            style={{
              minWidth: 0,
              flex: 1,
              overflow: "hidden",
            }}
          >
            <Text
              strong
              style={{
                color: "#1E293B",
                display: "block",
                whiteSpace: "normal",
                wordBreak: "normal",
                overflowWrap: "break-word",
                lineHeight: 1.5,
              }}
            >
              {value || "Chưa có tiêu đề"}
            </Text>

            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
              >
                ID: {record.id}
              </Text>
            </div>
          </div>
        </div>
      ),
    },

    {
      title: "Loại giáo lý",
      dataIndex: "catechism_type",
      key: "catechism_type",
      width: 220,

      render: (value) => {
        const option = lessonTypeOptions.find((item) => item.value === value);

        return (
          <Tag
            style={{
              borderRadius: 8,
              fontWeight: 600,
              whiteSpace: "normal",
              wordBreak: "normal",
              overflowWrap: "break-word",
              maxWidth: "100%",
            }}
          >
            {option?.label || value || "Chưa xác định"}
          </Tag>
        );
      },
    },

    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      align: "right",

      render: (_, record) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          <AppButton
            variant="secondary"
            size="small"
            icon={<FileTextOutlined />}
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
        </div>
      ),
    },
  ];

  /* =========================================================
   QUESTION TABLE
   ========================================================= */

  const questionColumns = [
    {
      title: "Câu hỏi",
      dataIndex: "question",
      key: "question",
      width: 430,
      fixed: "left",

      render: (value, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            minWidth: 0,
            width: "100%",
          }}
        >
          {/* ICON */}
          <div
            style={{
              width: 38,
              minWidth: 38,
              height: 38,
              borderRadius: 10,
              background: "#EEF2F7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1B365D",
              flexShrink: 0,
            }}
          >
            <QuestionCircleOutlined />
          </div>

          {/* CONTENT */}
          <div
            style={{
              minWidth: 0,
              flex: 1,
              overflow: "hidden",
            }}
          >
            <Text
              strong
              style={{
                color: "#1E293B",
                display: "block",
                whiteSpace: "normal",
                wordBreak: "normal",
                overflowWrap: "break-word",
                lineHeight: 1.5,
              }}
            >
              {value || "Chưa có nội dung"}
            </Text>

            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
              >
                ID: {record.id}
              </Text>
            </div>
          </div>
        </div>
      ),
    },

    {
      title: "Bài học",
      dataIndex: "lesson_title",
      key: "lesson_title",
      width: 280,

      render: (value) => (
        <div
          style={{
            minWidth: 0,
            whiteSpace: "normal",
            wordBreak: "normal",
            overflowWrap: "break-word",
            lineHeight: 1.5,
          }}
        >
          <Text>{value || "Chưa xác định"}</Text>
        </div>
      ),
    },

    {
      title: "Đáp án",
      dataIndex: "correct_answer",
      key: "correct_answer",
      width: 100,
      align: "center",

      render: (value) => (
        <Tag
          color="gold"
          style={{
            fontWeight: 800,
            borderRadius: 8,
          }}
        >
          {value || "-"}
        </Tag>
      ),
    },

    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      align: "right",

      render: (_, record) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          <AppButton
            variant="secondary"
            size="small"
            icon={<FileTextOutlined />}
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
        </div>
      ),
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {contextHolder}

      <div
        style={{
          paddingBottom: 40,
        }}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <PageHeroHeader
          title="Bài học & Ngân hàng câu hỏi"
          subtitle="Quản lý nội dung giáo lý và hệ thống câu hỏi cho giáo lý viên"
          icon={<BookOutlined />}
        />

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <Row
          gutter={[16, 16]}
          style={{
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <Col xs={24} sm={12} lg={8}>
            <StatCard
              title="Tổng bài học"
              value={lessonPagination.total}
              icon={<BookOutlined />}
            />
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <StatCard
              title="Tổng câu hỏi"
              value={questionPagination.total}
              icon={<QuestionCircleOutlined />}
            />
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <StatCard
              title="Loại giáo lý"
              value={lessonTypeOptions.length}
              icon={<FileTextOutlined />}
            />
          </Col>
        </Row>

        {/* ===================================================
            MAIN CARD
        =================================================== */}

        <Card
          bordered={false}
          style={{
            borderRadius: 18,
            boxShadow: "0 8px 30px rgba(27, 54, 93, 0.06)",
          }}
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{
              padding: "0 20px",
            }}
            items={[
              /* =================================================
                 LESSON TAB
              ================================================= */

              {
                key: "lessons",

                label: (
                  <Space>
                    <BookOutlined />
                    Bài học
                  </Space>
                ),

                children: (
                  <div
                    style={{
                      paddingBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <Input.Search
                        value={lessonSearch}
                        onChange={(e) => setLessonSearch(e.target.value)}
                        onSearch={(value) => {
                          const search = value.trim();

                          setLessonSearch(search);

                          loadLessons(1, lessonPagination.pageSize, search);
                        }}
                        allowClear
                        placeholder="Tìm kiếm bài học..."
                        style={{
                          width: 320,
                        }}
                      />

                      <Space>
                        <AppButton
                          variant="secondary"
                          icon={<ReloadOutlined />}
                          onClick={() =>
                            loadLessons(
                              lessonPagination.current,
                              lessonPagination.pageSize,
                              lessonSearch,
                            )
                          }
                        >
                          Làm mới
                        </AppButton>

                        <AppButton
                          variant="gold"
                          icon={<PlusOutlined />}
                          onClick={openCreateLesson}
                        >
                          Tạo bài học
                        </AppButton>
                      </Space>
                    </div>

                    <Table
                      rowKey="id"
                      loading={lessonLoading}
                      columns={lessonColumns}
                      dataSource={lessons}
                      pagination={{
                        current: lessonPagination.current,

                        pageSize: lessonPagination.pageSize,

                        total: lessonPagination.total,

                        showSizeChanger: true,

                        pageSizeOptions: ["10", "20", "50", "100"],

                        onChange: (page, pageSize) =>
                          loadLessons(page, pageSize, lessonSearch),
                      }}
                      locale={{
                        emptyText: <Empty description="Chưa có bài học" />,
                      }}
                    />
                  </div>
                ),
              },

              /* =================================================
                 QUESTION TAB
              ================================================= */

              {
                key: "questions",

                label: (
                  <Space>
                    <QuestionCircleOutlined />
                    Ngân hàng câu hỏi
                  </Space>
                ),

                children: (
                  <div
                    style={{
                      paddingBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <Space wrap>
                        <Input.Search
                          value={questionSearch}
                          onChange={(e) => setQuestionSearch(e.target.value)}
                          onSearch={(value) => {
                            const search = value.trim();

                            setQuestionSearch(search);

                            loadQuestions(
                              1,
                              questionPagination.pageSize,
                              search,
                              questionLessonFilter,
                            );
                          }}
                          allowClear
                          placeholder="Tìm câu hỏi..."
                          style={{
                            width: 280,
                          }}
                        />

                        <Select
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          placeholder="Lọc theo bài học"
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
                          style={{
                            width: 260,
                          }}
                        />
                      </Space>

                      <Space>
                        <AppButton
                          variant="secondary"
                          icon={<ReloadOutlined />}
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

                        <AppButton
                          variant="gold"
                          icon={<PlusOutlined />}
                          onClick={openCreateQuestion}
                        >
                          Tạo câu hỏi
                        </AppButton>
                      </Space>
                    </div>

                    <Table
                      rowKey="id"
                      loading={questionLoading}
                      columns={questionColumns}
                      dataSource={questions}
                      pagination={{
                        current: questionPagination.current,

                        pageSize: questionPagination.pageSize,

                        total: questionPagination.total,

                        showSizeChanger: true,

                        pageSizeOptions: ["10", "20", "50", "100"],

                        onChange: (page, pageSize) =>
                          loadQuestions(
                            page,
                            pageSize,
                            questionSearch,
                            questionLessonFilter,
                          ),
                      }}
                      locale={{
                        emptyText: <Empty description="Chưa có câu hỏi" />,
                      }}
                    />
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* ===================================================
            LESSON FORM
        =================================================== */}

        <AppFormModal
          open={lessonModalOpen}
          title={editingLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
          form={lessonForm}
          onCancel={() => {
            if (lessonSaving) {
              return;
            }

            setLessonModalOpen(false);
            setEditingLesson(null);
            lessonForm.resetFields();
          }}
          onOk={handleLessonSubmit}
          confirmLoading={lessonSaving}
          width={650}
        >
          <Form
            form={lessonForm}
            layout="vertical"
            onFinish={handleLessonSubmit}
          >
            <Form.Item
              label="Tên bài học"
              name="title"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Tiêu đề không được bỏ trống",
                },
                {
                  min: 2,
                  message: "Tên bài học phải có ít nhất 2 ký tự",
                },
              ]}
            >
              <Input
                placeholder="Ví dụ: Thiên Chúa tạo dựng con người"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Loại giáo lý"
              name="catechism_type"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn loại giáo lý",
                },
              ]}
            >
              <Select
                placeholder="Chọn loại giáo lý"
                options={lessonTypeOptions}
                showSearch
                optionFilterProp="label"
                size="large"
              />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea
                rows={5}
                placeholder="Nhập mô tả ngắn cho bài học..."
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Form>
        </AppFormModal>

        {/* ===================================================
            QUESTION FORM
        =================================================== */}

        <AppFormModal
          open={questionModalOpen}
          title={editingQuestion ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
          form={questionForm}
          onCancel={() => {
            if (questionSaving) {
              return;
            }

            setQuestionModalOpen(false);
            setEditingQuestion(null);
            questionForm.resetFields();
          }}
          onOk={handleQuestionSubmit}
          confirmLoading={questionSaving}
          width={700}
        >
          <Form
            form={questionForm}
            layout="vertical"
            onFinish={handleQuestionSubmit}
          >
            <Form.Item
              label="Bài học"
              name="lesson_id"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn bài học",
                },
              ]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Chọn bài học"
                options={lessonOptions}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Nội dung câu hỏi"
              name="question"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập câu hỏi",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập nội dung câu hỏi..."
                showCount
                maxLength={1000}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Đáp án A"
                  name="answer_a"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Vui lòng nhập đáp án A",
                    },
                  ]}
                >
                  <Input placeholder="Nhập đáp án A" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Đáp án B"
                  name="answer_b"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Vui lòng nhập đáp án B",
                    },
                  ]}
                >
                  <Input placeholder="Nhập đáp án B" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Đáp án C"
                  name="answer_c"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Vui lòng nhập đáp án C",
                    },
                  ]}
                >
                  <Input placeholder="Nhập đáp án C" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Đáp án D"
                  name="answer_d"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Vui lòng nhập đáp án D",
                    },
                  ]}
                >
                  <Input placeholder="Nhập đáp án D" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Đáp án đúng"
              name="correct_answer"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn đáp án đúng",
                },
              ]}
            >
              <Select
                placeholder="Chọn đáp án đúng"
                size="large"
                options={[
                  {
                    value: "A",
                    label: "A",
                  },
                  {
                    value: "B",
                    label: "B",
                  },
                  {
                    value: "C",
                    label: "C",
                  },
                  {
                    value: "D",
                    label: "D",
                  },
                ]}
              />
            </Form.Item>
          </Form>
        </AppFormModal>

        {/* ===================================================
            LESSON DETAIL
        =================================================== */}

        <AppDetailModal
          open={lessonDetailOpen}
          title="Chi tiết bài học"
          onCancel={() => setLessonDetailOpen(false)}
          width={700}
        >
          {lessonDetailLoading ? (
            <div
              style={{
                minHeight: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spin />
            </div>
          ) : lessonDetail ? (
            <Space
              direction="vertical"
              size={16}
              style={{
                width: "100%",
              }}
            >
              <div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  TIÊU ĐỀ
                </Text>

                <Title
                  level={4}
                  style={{
                    marginTop: 4,
                    marginBottom: 0,
                    color: "#1B365D",
                  }}
                >
                  {lessonDetail.title}
                </Title>
              </div>

              <div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  LOẠI GIÁO LÝ
                </Text>

                <div
                  style={{
                    marginTop: 6,
                  }}
                >
                  <Tag>
                    {lessonTypeOptions.find(
                      (item) => item.value === lessonDetail.catechism_type,
                    )?.label ||
                      lessonDetail.catechism_type ||
                      "-"}
                  </Tag>
                </div>
              </div>

              <div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  MÔ TẢ
                </Text>

                <div
                  style={{
                    marginTop: 6,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.7,
                  }}
                >
                  {lessonDetail.description || "Chưa có mô tả."}
                </div>
              </div>
            </Space>
          ) : (
            <Empty description="Không có dữ liệu" />
          )}
        </AppDetailModal>

        {/* ===================================================
            QUESTION DETAIL
        =================================================== */}

        <AppDetailModal
          open={questionDetailOpen}
          title="Chi tiết câu hỏi"
          onCancel={() => setQuestionDetailOpen(false)}
          width={700}
        >
          {questionDetailLoading ? (
            <div
              style={{
                minHeight: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spin />
            </div>
          ) : questionDetail ? (
            <Space
              direction="vertical"
              size={16}
              style={{
                width: "100%",
              }}
            >
              <div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  BÀI HỌC
                </Text>

                <Title
                  level={5}
                  style={{
                    marginTop: 4,
                    marginBottom: 0,
                    color: "#1B365D",
                  }}
                >
                  {questionDetail.lesson_title || "Chưa xác định"}
                </Title>
              </div>

              <div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  CÂU HỎI
                </Text>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: 1.6,
                  }}
                >
                  {questionDetail.question}
                </div>
              </div>

              {["A", "B", "C", "D"].map((letter) => {
                const key = `answer_${letter.toLowerCase()}`;

                const isCorrect =
                  String(questionDetail.correct_answer || "").toUpperCase() ===
                  letter;

                return (
                  <div
                    key={letter}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: isCorrect
                        ? "1px solid #D4AF37"
                        : "1px solid #E2E8F0",
                      background: isCorrect ? "#FFFBEB" : "#F8FAFC",
                    }}
                  >
                    <Space>
                      <Tag color={isCorrect ? "gold" : undefined}>{letter}</Tag>

                      <Text>{questionDetail[key] || "-"}</Text>
                    </Space>
                  </div>
                );
              })}
            </Space>
          ) : (
            <Empty description="Không có dữ liệu" />
          )}
        </AppDetailModal>
      </div>
    </>
  );
};

export default LessonQuestionPage;
