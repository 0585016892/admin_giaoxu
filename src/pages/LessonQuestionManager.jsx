import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Tag,
  Descriptions,
  Tooltip,
  Typography,
  ConfigProvider,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  CompassOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CheckOutlined,
} from "@ant-design/icons";

import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../api/lessonApi";
import { useUser } from "../context/UserContext";

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

export default function LessonQuestionManager() {
  const { user } = useUser();
  const allowRoles = ["admin", "priest"];

  const [activeTab, setActiveTab] = useState("1"); // Active Tab
  const [lessons, setLessons] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  // CHỐNG SPAM
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals & Editing State
  const [lessonModal, setLessonModal] = useState(false);
  const [questionModal, setQuestionModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);

  const [editingLesson, setEditingLesson] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedQuestionDetail, setSelectedQuestionDetail] = useState(null);

  // Search & Filter States
  const [lessonSearchText, setLessonSearchText] = useState("");
  const [questionSearchText, setQuestionSearchText] = useState("");
  const [selectedLessonFilter, setSelectedLessonFilter] = useState(null);

  const [lessonForm] = Form.useForm();
  const [questionForm] = Form.useForm();

  // =========================
  // LESSON API CALLS
  // =========================
  const loadLessons = async () => {
    setLoadingLesson(true);
    try {
      const res = await getLessons({ page: 1, limit: 1000 });
      setLessons(res.data?.data || []);
    } catch {
      message.error("Lỗi tải danh sách bài học");
    } finally {
      setLoadingLesson(false);
    }
  };

  const saveLesson = async () => {
    if (isSubmitting) return;
    try {
      const values = await lessonForm.validateFields();
      setIsSubmitting(true);

      if (editingLesson) {
        await updateLesson(editingLesson.id, values);
        message.success("Cập nhật bài học thành công");
      } else {
        await createLesson(values);
        message.success("Thêm bài học thành công");
      }
      setLessonModal(false);
      lessonForm.resetFields();
      loadLessons();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (id) => {
    try {
      await deleteLesson(id);
      message.success("Đã xoá bài học");
      loadLessons();
      loadQuestions();
    } catch {
      message.error("Xóa bài học thất bại");
    }
  };

  // =========================
  // QUESTION API CALLS
  // =========================
  const loadQuestions = async () => {
    setLoadingQuestion(true);
    try {
      const res = await getQuestions({ page: 1, limit: 1000 });
      setQuestions(res.data?.data || []);
    } catch {
      message.error("Lỗi tải danh sách câu hỏi");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const saveQuestion = async () => {
    if (isSubmitting) return;
    try {
      const values = await questionForm.validateFields();
      setIsSubmitting(true);

      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, values);
        message.success("Cập nhật câu hỏi thành công");
      } else {
        await createQuestion(values);
        message.success("Thêm câu hỏi thành công");
      }
      setQuestionModal(false);
      questionForm.resetFields();
      loadQuestions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await deleteQuestion(id);
      message.success("Đã xoá câu hỏi");
      loadQuestions();
    } catch {
      message.error("Xóa câu hỏi thất bại");
    }
  };

  useEffect(() => {
    loadLessons();
    loadQuestions();
  }, []);

  // =========================
  // SEARCH & FILTER LOGIC
  // =========================
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) =>
      lesson.title?.toLowerCase().includes(lessonSearchText.toLowerCase()),
    );
  }, [lessons, lessonSearchText]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q.question
        ?.toLowerCase()
        .includes(questionSearchText.toLowerCase());
      const matchesLesson = selectedLessonFilter
        ? q.lesson_id === selectedLessonFilter
        : true;
      return matchesSearch && matchesLesson;
    });
  }, [questions, questionSearchText, selectedLessonFilter]);

  // =========================
  // TABLE COLUMNS CONFIG
  // =========================
  const lessonColumns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: "center",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: "#94a3b8" }}>{index + 1}</span>
      ),
    },
    {
      title: "Tên bài học",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text) => (
        <Space>
          <BookOutlined style={{ color: accentGold, fontSize: 16 }} />
          <span style={{ fontWeight: 700, color: primaryNavy, fontSize: 15 }}>
            {text}
          </span>
        </Space>
      ),
    },
    ...(allowRoles.includes(user?.role)
      ? [
          {
            title: "Thao tác",
            key: "action",
            width: 130,
            align: "center",
            render: (_, record) => (
              <Space size="small">
                <Tooltip title="Chỉnh sửa">
                  <Button
                    type="text"
                    shape="circle"
                    icon={
                      <EditOutlined
                        style={{ color: primaryNavy, fontSize: 16 }}
                      />
                    }
                    onClick={() => {
                      setEditingLesson(record);
                      lessonForm.setFieldsValue(record);
                      setLessonModal(true);
                    }}
                    className="action-btn-edit"
                  />
                </Tooltip>
                <Popconfirm
                  title="Xóa bài học này?"
                  description="Các câu hỏi liên quan bài học này có thể bị ảnh hưởng."
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleDeleteLesson(record.id)}
                >
                  <Tooltip title="Xóa bài học">
                    <Button
                      type="text"
                      danger
                      shape="circle"
                      icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                      className="action-btn-delete"
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const questionColumns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: "center",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: "#94a3b8" }}>{index + 1}</span>
      ),
    },
    {
      title: "Bài học liên kết",
      dataIndex: "lesson_title",
      width: 220,
      ellipsis: true,
      render: (text) => (
        <Tag className="gold-category-tag">{text || "Chưa phân loại"}</Tag>
      ),
    },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "question",
      ellipsis: true,
      render: (text) => (
        <span style={{ fontWeight: 600, color: textDark, fontSize: 14 }}>
          {text}
        </span>
      ),
    },
    {
      title: "Đáp án đúng",
      dataIndex: "correct_answer",
      width: 140,
      align: "center",
      render: (text) => (
        <Tag className="correct-answer-pill">Đáp án {text}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={
                <EyeOutlined style={{ color: primaryNavy, fontSize: 16 }} />
              }
              onClick={() => {
                setSelectedQuestionDetail(record);
                setDetailModal(true);
              }}
              className="action-btn-view"
            />
          </Tooltip>
          {allowRoles.includes(user?.role) && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined style={{ color: primaryNavy, fontSize: 16 }} />
                }
                onClick={() => {
                  setEditingQuestion(record);
                  questionForm.setFieldsValue(record);
                  setQuestionModal(true);
                }}
                className="action-btn-edit"
              />
            </Tooltip>
          )}
          {allowRoles.includes(user?.role) && (
            <Popconfirm
              title="Xóa câu hỏi này?"
              description="Dữ liệu câu hỏi sẽ bị loại bỏ khỏi ngân hàng trắc nghiệm."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeleteQuestion(record.id)}
            >
              <Tooltip title="Xóa câu hỏi">
                <Button
                  type="text"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                  className="action-btn-delete"
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="lesson-editorial-layout">
        <div className="lesson-editorial-container">
          {/* HEADER BAR & PILL NAVIGATION */}
          <div className="lesson-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG GIÁO LÝ DỰ TÒNG
              </span>
              <Title level={2} className="lesson-main-title">
                NGÂN HÀNG CÂU HỎI & BÀI HỌC
              </Title>
              <Paragraph className="lesson-sub-title">
                Quản lý kho dữ liệu bài học và thiết lập bộ câu hỏi trắc nghiệm
                kiểm tra.
              </Paragraph>
            </div>

            {/* TAB VIÊN THUỐC (Pill Tabs) */}
            <div className="pill-navigation-box">
              <button
                onClick={() => setActiveTab("1")}
                className={`pill-tab-btn ${activeTab === "1" ? "active" : ""}`}
              >
                <BookOutlined style={{ marginRight: 6 }} /> Bài học (
                {lessons.length})
              </button>
              <button
                onClick={() => setActiveTab("2")}
                className={`pill-tab-btn ${activeTab === "2" ? "active" : ""}`}
              >
                <QuestionCircleOutlined style={{ marginRight: 6 }} /> Câu hỏi (
                {questions.length})
              </button>
            </div>
          </div>

          {/* STATS BENTO CARDS */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Tổng Số Bài Học"
                  value={lessons.length}
                  prefix={<BookOutlined className="stat-icon gold" />}
                  valueStyle={{
                    fontWeight: 700,
                    color: primaryNavy,
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Ngân Hàng Câu Hỏi"
                  value={questions.length}
                  prefix={<FileTextOutlined className="stat-icon navy" />}
                  valueStyle={{
                    fontWeight: 700,
                    color: primaryNavy,
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Trung Bình Câu / Bài"
                  value={
                    lessons.length > 0
                      ? (questions.length / lessons.length).toFixed(1)
                      : 0
                  }
                  prefix={<CheckCircleOutlined className="stat-icon green" />}
                  valueStyle={{
                    fontWeight: 700,
                    color: "#2e7d32",
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* =========================
              NỘI DUNG TAB 1: BÀI HỌC
             ========================= */}
          {activeTab === "1" && (
            <Card bordered={false} className="main-table-card">
              <Row
                gutter={[16, 16]}
                style={{ marginBottom: 20 }}
                justify="space-between"
                align="middle"
              >
                <Col xs={24} sm={14} md={10}>
                  <Input
                    placeholder="Tìm theo tên bài học..."
                    prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                    allowClear
                    value={lessonSearchText}
                    onChange={(e) => setLessonSearchText(e.target.value)}
                    className="custom-filter-input"
                  />
                </Col>

                <Col>
                  {allowRoles.includes(user?.role) && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingLesson(null);
                        lessonForm.resetFields();
                        setLessonModal(true);
                      }}
                      className="add-editorial-btn"
                    >
                      Thêm Bài Học Mới
                    </Button>
                  )}
                </Col>
              </Row>

              <Table
                rowKey="id"
                columns={lessonColumns}
                dataSource={filteredLessons}
                loading={loadingLesson}
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng số: ${total} bài học`,
                  style: { marginTop: 20 },
                }}
                scroll={{ x: 600 }}
                className="custom-admin-table"
              />
            </Card>
          )}

          {/* =========================
              NỘI DUNG TAB 2: CÂU HỎI
             ========================= */}
          {activeTab === "2" && (
            <Card bordered={false} className="main-table-card">
              <Row
                gutter={[16, 16]}
                style={{ marginBottom: 20 }}
                justify="space-between"
                align="middle"
              >
                <Col xs={24} sm={24} md={16}>
                  <Space wrap style={{ width: "100%" }} size="middle">
                    <Input
                      placeholder="Tìm nội dung câu hỏi..."
                      prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                      allowClear
                      style={{ width: 300 }}
                      value={questionSearchText}
                      onChange={(e) => setQuestionSearchText(e.target.value)}
                      className="custom-filter-input"
                    />

                    <Select
                      placeholder="Bộ lọc bài học"
                      allowClear
                      style={{ width: 240 }}
                      value={selectedLessonFilter}
                      onChange={(value) => setSelectedLessonFilter(value)}
                      className="custom-filter-select"
                    >
                      {lessons.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.title}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </Col>

                {allowRoles.includes(user?.role) && (
                  <Col xs={24} sm={24} md={8} style={{ textAlign: "right" }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingQuestion(null);
                        questionForm.resetFields();
                        setQuestionModal(true);
                      }}
                      className="add-editorial-btn"
                    >
                      Thêm Câu Hỏi Mới
                    </Button>
                  </Col>
                )}
              </Row>

              <Table
                rowKey="id"
                columns={questionColumns}
                dataSource={filteredQuestions}
                loading={loadingQuestion}
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng số: ${total} câu hỏi`,
                  style: { marginTop: 20 },
                }}
                scroll={{ x: 800 }}
                className="custom-admin-table"
              />
            </Card>
          )}
        </div>

        {/* MODAL BÀI HỌC */}
        <Modal
          open={lessonModal}
          title={
            <div className="modal-custom-title">
              <BookOutlined style={{ color: accentGold }} />
              <span>
                {editingLesson ? "Chỉnh Sửa Bài Học" : "Tạo Bài Học Mới"}
              </span>
            </div>
          }
          onOk={saveLesson}
          onCancel={() => setLessonModal(false)}
          okText={editingLesson ? "Cập nhật" : "Tạo mới"}
          cancelText="Hủy"
          destroyOnClose
          confirmLoading={isSubmitting}
          centered
          okButtonProps={{
            disabled: isSubmitting,
            style: {
              backgroundColor: primaryNavy,
              borderRadius: 8,
              height: 38,
              fontWeight: 600,
            },
          }}
          cancelButtonProps={{
            style: { borderRadius: 8, height: 38 },
          }}
        >
          <Form form={lessonForm} layout="vertical" style={{ paddingTop: 12 }}>
            <Form.Item
              label={
                <Text strong className="form-field-label">
                  Tên bài học *
                </Text>
              }
              name="title"
              rules={[
                { required: true, message: "Vui lòng nhập tên bài học!" },
              ]}
            >
              <Input
                placeholder="Ví dụ: Bài 1: Thiên Chúa là Cha..."
                className="custom-form-input"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* MODAL CÂU HỎI */}
        <Modal
          open={questionModal}
          width={720}
          title={
            <div className="modal-custom-title">
              <QuestionCircleOutlined style={{ color: accentGold }} />
              <span>
                {editingQuestion ? "Chỉnh Sửa Câu Hỏi" : "Tạo Câu Hỏi Mới"}
              </span>
            </div>
          }
          onOk={saveQuestion}
          onCancel={() => setQuestionModal(false)}
          okText={editingQuestion ? "Cập nhật" : "Tạo mới"}
          cancelText="Hủy"
          destroyOnClose
          confirmLoading={isSubmitting}
          centered
          okButtonProps={{
            disabled: isSubmitting,
            style: {
              backgroundColor: primaryNavy,
              borderRadius: 8,
              height: 38,
              fontWeight: 600,
            },
          }}
          cancelButtonProps={{
            style: { borderRadius: 8, height: 38 },
          }}
        >
          <Form
            form={questionForm}
            layout="vertical"
            style={{ paddingTop: 12 }}
          >
            <Form.Item
              label={
                <Text strong className="form-field-label">
                  Thuộc bài học *
                </Text>
              }
              name="lesson_id"
              rules={[{ required: true, message: "Vui lòng chọn bài học!" }]}
            >
              <Select
                placeholder="Chọn bài học liên kết"
                className="custom-form-input"
              >
                {lessons.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <Text strong className="form-field-label">
                  Nội dung câu hỏi *
                </Text>
              }
              name="question"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung câu hỏi!" },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Nhập câu hỏi tại đây..."
                className="custom-form-input"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <Text strong className="form-field-label">
                      Đáp án A *
                    </Text>
                  }
                  name="answer_a"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input
                    placeholder="Nhập đáp án A"
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <Text strong className="form-field-label">
                      Đáp án B *
                    </Text>
                  }
                  name="answer_b"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input
                    placeholder="Nhập đáp án B"
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <Text strong className="form-field-label">
                      Đáp án C *
                    </Text>
                  }
                  name="answer_c"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input
                    placeholder="Nhập đáp án C"
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <Text strong className="form-field-label">
                      Đáp án D *
                    </Text>
                  }
                  name="answer_d"
                  rules={[{ required: true, message: "Không được để trống" }]}
                >
                  <Input
                    placeholder="Nhập đáp án D"
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={
                <Text strong className="form-field-label">
                  Đáp án đúng chính xác *
                </Text>
              }
              name="correct_answer"
              rules={[
                { required: true, message: "Vui lòng chọn đáp án chính xác!" },
              ]}
              style={{ width: "50%" }}
            >
              <Select placeholder="Chọn đáp án" className="custom-form-input">
                <Option value="A">Lựa chọn A</Option>
                <Option value="B">Lựa chọn B</Option>
                <Option value="C">Lựa chọn C</Option>
                <Option value="D">Lựa chọn D</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* MODAL XEM CHI TIẾT CÂU HỎI */}
        <Modal
          open={detailModal}
          title={
            <div className="modal-custom-title">
              <EyeOutlined style={{ color: accentGold }} />
              <span>
                Chi Tiết Câu Hỏi Trắc Nghiệm #{selectedQuestionDetail?.id}
              </span>
            </div>
          }
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setDetailModal(false)}
              style={{
                backgroundColor: primaryNavy,
                borderRadius: 8,
                height: 38,
              }}
            >
              Đóng cửa sổ
            </Button>,
          ]}
          onCancel={() => setDetailModal(false)}
          width={650}
          centered
          destroyOnClose
        >
          {selectedQuestionDetail && (
            <div style={{ paddingTop: 10 }}>
              <Descriptions
                bordered
                column={1}
                size="small"
                className="custom-modal-desc"
              >
                <Descriptions.Item label="Bài học">
                  <Tag className="gold-category-tag">
                    {selectedQuestionDetail.lesson_title || "Chưa phân loại"}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Nội dung">
                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      fontWeight: 600,
                      color: primaryNavy,
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedQuestionDetail.question}
                  </div>
                </Descriptions.Item>
              </Descriptions>

              <Title
                level={5}
                style={{
                  marginTop: 20,
                  marginBottom: 12,
                  color: primaryNavy,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Danh Sách Các Đáp Án Lựa Chọn:
              </Title>

              <Row gutter={[12, 12]}>
                {[
                  { key: "A", val: selectedQuestionDetail.answer_a },
                  { key: "B", val: selectedQuestionDetail.answer_b },
                  { key: "C", val: selectedQuestionDetail.answer_c },
                  { key: "D", val: selectedQuestionDetail.answer_d },
                ].map((ans) => {
                  const isCorrect =
                    selectedQuestionDetail.correct_answer === ans.key;
                  return (
                    <Col span={24} key={ans.key}>
                      <div
                        className={`answer-choice-card ${
                          isCorrect ? "correct" : ""
                        }`}
                      >
                        <Tag
                          color={isCorrect ? "success" : "default"}
                          style={{
                            marginRight: 10,
                            fontWeight: "bold",
                            borderRadius: 6,
                          }}
                        >
                          {ans.key}
                        </Tag>
                        <span
                          style={{
                            color: isCorrect ? "#1e4620" : textDark,
                            fontWeight: isCorrect ? 700 : 500,
                          }}
                        >
                          {ans.val}
                        </span>

                        {isCorrect && (
                          <Tag
                            color="success"
                            style={{
                              marginLeft: "auto",
                              fontWeight: 600,
                              borderRadius: 8,
                            }}
                          >
                            <CheckOutlined /> Đáp án đúng
                          </Tag>
                        )}
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}
        </Modal>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .lesson-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .lesson-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Styling */
            .lesson-header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-bottom: 28px;
              flex-wrap: wrap;
              gap: 16px;
            }

            .sacred-badge {
              background: rgba(212, 175, 55, 0.15);
              border: 1px solid ${accentGold};
              color: ${primaryNavy};
              padding: 4px 14px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 10px;
            }

            .lesson-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .lesson-sub-title {
              color: #64748b;
              margin: 4px 0 0 0 !important;
              font-size: 14px;
            }

            /* Pill Navigation Tab */
            .pill-navigation-box {
              background: #ffffff;
              padding: 6px;
              border-radius: 30px;
              display: flex;
              gap: 6px;
              border: 1px solid rgba(212, 175, 55, 0.3);
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.04);
            }

            .pill-tab-btn {
              border: none;
              padding: 10px 22px;
              border-radius: 24px;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.25s ease;
              background: transparent;
              color: #64748b;
            }

            .pill-tab-btn.active {
              background: ${primaryNavy};
              color: #ffffff;
              box-shadow: 0 4px 12px rgba(27, 54, 93, 0.2);
            }

            /* Stats Bento Cards */
            .stat-card {
              border-radius: 16px !important;
              background: #ffffff !important;
              border: 1px solid rgba(27, 54, 93, 0.08) !important;
              box-shadow: 0 4px 16px rgba(27, 54, 93, 0.03) !important;
            }

            .stat-icon {
              margin-right: 8px;
            }
            .stat-icon.navy { color: ${primaryNavy}; }
            .stat-icon.gold { color: ${accentGold}; }
            .stat-icon.green { color: #2e7d32; }

            /* Table Card */
            .main-table-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.25) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
              padding: 8px;
            }

            .custom-filter-input {
              border-radius: 10px !important;
              height: 40px !important;
            }

            .custom-filter-select .ant-select-selector {
              border-radius: 10px !important;
              height: 40px !important;
              display: flex;
              align-items: center;
            }

            .add-editorial-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 40px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            .custom-admin-table .ant-table-thead > tr > th {
              background: ${softBg} !important;
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
              border-bottom: 1px solid rgba(27, 54, 93, 0.1) !important;
            }

            .gold-category-tag {
              background: rgba(212, 175, 55, 0.12) !important;
              border: 1px solid ${accentGold} !important;
              color: ${primaryNavy} !important;
              border-radius: 8px;
              font-weight: 600;
              font-size: 11px;
            }

            .correct-answer-pill {
              background: #f6ffed !important;
              color: #276749 !important;
              border: 1px solid #b7eb8f !important;
              font-weight: 700;
              border-radius: 12px;
              padding: 2px 12px;
            }

            .action-btn-view:hover, .action-btn-edit:hover {
              background: rgba(27, 54, 93, 0.1) !important;
            }

            .action-btn-delete:hover {
              background: #fff5f5 !important;
            }

            /* Modal Style */
            .modal-custom-title {
              display: flex;
              align-items: center;
              gap: 8px;
              font-family: 'Playfair Display', serif;
              color: ${primaryNavy};
              font-size: 18px;
              font-weight: 700;
            }

            .form-field-label {
              font-size: 13px;
              color: ${primaryNavy};
            }

            .custom-form-input {
              border-radius: 8px !important;
            }

            .custom-modal-desc {
              border-radius: 12px;
              overflow: hidden;
            }

            .answer-choice-card {
              padding: 12px 16px;
              border-radius: 10px;
              border: 1px solid rgba(27, 54, 93, 0.1);
              background: ${softBg};
              display: flex;
              align-items: center;
              transition: all 0.2s ease;
            }

            .answer-choice-card.correct {
              border-color: #b7eb8f;
              background: #f6ffed;
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
}
