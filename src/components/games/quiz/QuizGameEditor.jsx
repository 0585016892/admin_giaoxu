import React, { useEffect, useState } from "react";

import {
  Button,
  Card,
  Col,
  ColorPicker,
  Divider,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Tabs,
  message,
  Progress,
  Tooltip,
  Upload,
} from "antd";

import {
  Plus,
  Trash2,
  Edit3,
  Save,
  HelpCircle,
  Settings,
  Palette,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  UploadCloud,
  ImageIcon,
  X,
} from "lucide-react";

import {
  createGame,
  updateGame,
  getGameBackground,
} from "../../../api/gameApi";

const { Text } = Typography;
const { TextArea } = Input;

/* =========================================================
   DEFAULT THEME
========================================================= */

const DEFAULT_THEME = {
  primary: "#6C4BFF",
  secondary: "#FFD54F",
  font: "Baloo 2",
  borderRadius: 16,
  backgroundColor: "#EAF5FF",
};

/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {
  timeLimit: 60,
  shuffleQuestions: true,
  shuffleAnswers: true,
  showScore: true,
  showTimer: true,

  showProgress: false,
  allowHint: false,
  allowSkip: false,

  showExplanation: false,
  instantFeedback: false,
  enableSound: true,
};

/* =========================================================
   CREATE QUESTION
========================================================= */

const createEmptyQuestion = () => ({
  id: `question_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,

  question: "",

  answers: [
    {
      id: "A",
      text: "",
      correct: true,
    },
    {
      id: "B",
      text: "",
      correct: false,
    },
    {
      id: "C",
      text: "",
      correct: false,
    },
    {
      id: "D",
      text: "",
      correct: false,
    },
  ],

  explanation: "",

  points: 10,
});

/* =========================================================
   NORMALIZE QUESTION
========================================================= */

const normalizeQuestion = (q) => ({
  id: q?.id || `question_${Date.now()}`,

  question: q?.question || "",

  answers: Array.isArray(q?.answers)
    ? q.answers.map((a, idx) => ({
        id: a?.id || String.fromCharCode(65 + idx),

        text: a?.text || "",

        correct: Boolean(a?.correct),
      }))
    : createEmptyQuestion().answers,

  explanation: q?.explanation || "",

  points: Number(q?.points ?? 10),
});

/* =========================================================
   COLOR HELPER
========================================================= */

const getColorValue = (value, fallback) => {
  if (!value) return fallback;

  if (typeof value === "string") {
    return value;
  }

  if (typeof value?.toHexString === "function") {
    return value.toHexString();
  }

  return fallback;
};

/* =========================================================
   COMPONENT
========================================================= */

const QuizGameEditor = ({ teacherId, game, onSuccess }) => {
  const [form] = Form.useForm();

  /* =======================================================
     STATES
  ======================================================= */

  const [questions, setQuestions] = useState([]);

  const [editingQuestion, setEditingQuestion] = useState(null);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [previewIndex, setPreviewIndex] = useState(0);

  /* =======================================================
     BACKGROUND FILE
  ======================================================= */

  const [backgroundFile, setBackgroundFile] = useState(null);

  const [backgroundPreview, setBackgroundPreview] = useState(null);

  const [oldBackground, setOldBackground] = useState(null);

  /* =======================================================
     FORM VALUES FOR LIVE PREVIEW
  ======================================================= */

  const [formValues, setFormValues] = useState({
    name: "Tên trò chơi",

    backgroundColor: DEFAULT_THEME.backgroundColor,

    primary: DEFAULT_THEME.primary,

    secondary: DEFAULT_THEME.secondary,

    font: DEFAULT_THEME.font,

    borderRadius: DEFAULT_THEME.borderRadius,

    ...DEFAULT_SETTINGS,
  });

  /* =======================================================
     INITIALIZE GAME
     
     form là instance ổn định của Form.useForm().
     Không cần đưa form vào dependency.
  ======================================================= */

  useEffect(() => {
    let initialValues;

    if (game) {
      initialValues = {
        name: game.name || "",

        backgroundColor:
          game.background?.color || DEFAULT_THEME.backgroundColor,

        primary: game.theme?.primary || DEFAULT_THEME.primary,

        secondary: game.theme?.secondary || DEFAULT_THEME.secondary,

        font: game.theme?.font || DEFAULT_THEME.font,

        borderRadius: game.theme?.borderRadius ?? DEFAULT_THEME.borderRadius,

        timeLimit: game.settings?.timeLimit ?? DEFAULT_SETTINGS.timeLimit,

        shuffleQuestions:
          game.settings?.shuffleQuestions ?? DEFAULT_SETTINGS.shuffleQuestions,

        shuffleAnswers:
          game.settings?.shuffleAnswers ?? DEFAULT_SETTINGS.shuffleAnswers,

        showScore: game.settings?.showScore ?? DEFAULT_SETTINGS.showScore,

        showTimer: game.settings?.showTimer ?? DEFAULT_SETTINGS.showTimer,

        showProgress:
          game.settings?.showProgress ?? DEFAULT_SETTINGS.showProgress,

        allowHint: game.settings?.allowHint ?? DEFAULT_SETTINGS.allowHint,

        allowSkip: game.settings?.allowSkip ?? DEFAULT_SETTINGS.allowSkip,

        showExplanation:
          game.settings?.showExplanation ?? DEFAULT_SETTINGS.showExplanation,

        instantFeedback:
          game.settings?.instantFeedback ?? DEFAULT_SETTINGS.instantFeedback,

        enableSound: game.settings?.enableSound ?? DEFAULT_SETTINGS.enableSound,
      };

      /* -----------------------------------------------
         OLD BACKGROUND
      ------------------------------------------------ */

      const existingBackground = getGameBackground(game);

      setOldBackground(existingBackground);

      setBackgroundPreview(existingBackground);

      setBackgroundFile(null);

      /* -----------------------------------------------
         QUESTIONS
      ------------------------------------------------ */

      setQuestions(
        Array.isArray(game.questions)
          ? game.questions.map(normalizeQuestion)
          : [],
      );
    } else {
      initialValues = {
        name: "",

        backgroundColor: DEFAULT_THEME.backgroundColor,

        primary: DEFAULT_THEME.primary,

        secondary: DEFAULT_THEME.secondary,

        font: DEFAULT_THEME.font,

        borderRadius: DEFAULT_THEME.borderRadius,

        ...DEFAULT_SETTINGS,
      };

      setOldBackground(null);

      setBackgroundPreview(null);

      setBackgroundFile(null);

      setQuestions([]);
    }

    /* -----------------------------------------------
       SET FORM
    ------------------------------------------------ */

    form.setFieldsValue(initialValues);

    setFormValues(initialValues);

    setPreviewIndex(0);
  }, [game, form]);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleValuesChange = (_, allValues) => {
    setFormValues((prev) => ({
      ...prev,

      ...allValues,

      backgroundColor: getColorValue(
        allValues.backgroundColor,
        prev.backgroundColor,
      ),

      primary: getColorValue(allValues.primary, prev.primary),

      secondary: getColorValue(allValues.secondary, prev.secondary),
    }));
  };

  /* =======================================================
     BACKGROUND UPLOAD
  ======================================================= */

  const handleBackgroundChange = (info) => {
    const file = info.file?.originFileObj || info.file;

    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      message.error("Vui lòng chọn file hình ảnh!");

      return;
    }

    /* -----------------------------------------------
       Giới hạn 5MB
    ------------------------------------------------ */

    if (file.size > 5 * 1024 * 1024) {
      message.error("Ảnh nền không được vượt quá 5MB!");

      return;
    }

    setBackgroundFile(file);

    const previewUrl = URL.createObjectURL(file);

    setBackgroundPreview(previewUrl);
  };

  /* =======================================================
     REMOVE BACKGROUND
  ======================================================= */

  const handleRemoveBackground = () => {
    setBackgroundFile(null);

    setBackgroundPreview(null);

    setOldBackground(null);
  };

  /* =======================================================
     ADD QUESTION
  ======================================================= */

  const handleAddQuestion = () => {
    setEditingQuestion(createEmptyQuestion());

    setQuestionModalOpen(true);
  };

  /* =======================================================
     EDIT QUESTION
  ======================================================= */

  const handleEditQuestion = (q) => {
    setEditingQuestion(JSON.parse(JSON.stringify(q)));

    setQuestionModalOpen(true);
  };

  /* =======================================================
     DELETE QUESTION
  ======================================================= */

  const handleDeleteQuestion = (id) => {
    setQuestions((prev) => {
      const updated = prev.filter((q) => q.id !== id);

      if (previewIndex >= updated.length && updated.length > 0) {
        setPreviewIndex(updated.length - 1);
      }

      if (updated.length === 0) {
        setPreviewIndex(0);
      }

      return updated;
    });

    message.success("Đã xóa câu hỏi");
  };

  /* =======================================================
     SAVE QUESTION
  ======================================================= */

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;

    if (!editingQuestion.question.trim()) {
      message.warning("Vui lòng nhập nội dung câu hỏi");

      return;
    }

    const validAnswers = editingQuestion.answers.filter((a) => a.text.trim());

    if (validAnswers.length < 2) {
      message.warning("Câu hỏi phải có ít nhất 2 đáp án đầy đủ nội dung");

      return;
    }

    if (!validAnswers.some((a) => a.correct)) {
      message.warning("Vui lòng đánh dấu ít nhất 1 đáp án đúng");

      return;
    }

    const newQuestion = {
      ...editingQuestion,

      answers: validAnswers.map((answer, index) => ({
        ...answer,

        id: answer.id || String.fromCharCode(65 + index),

        correct: Boolean(answer.correct),
      })),
    };

    setQuestions((prev) => {
      const idx = prev.findIndex((item) => item.id === newQuestion.id);

      if (idx >= 0) {
        const updated = [...prev];

        updated[idx] = newQuestion;

        return updated;
      }

      return [...prev, newQuestion];
    });

    setQuestionModalOpen(false);

    setEditingQuestion(null);

    message.success("Đã lưu câu hỏi");
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (questions.length === 0) {
        message.warning("Vui lòng thêm ít nhất một câu hỏi!");

        return;
      }

      /* -----------------------------------------------
         COLOR
      ------------------------------------------------ */

      const backgroundColor = getColorValue(
        values.backgroundColor,
        DEFAULT_THEME.backgroundColor,
      );

      const primary = getColorValue(values.primary, DEFAULT_THEME.primary);

      const secondary = getColorValue(
        values.secondary,
        DEFAULT_THEME.secondary,
      );

      /* -----------------------------------------------
         SETTINGS
      ------------------------------------------------ */

      const settings = {
        timeLimit: Number(values.timeLimit ?? DEFAULT_SETTINGS.timeLimit),

        shuffleQuestions: Boolean(values.shuffleQuestions),

        shuffleAnswers: Boolean(values.shuffleAnswers),

        showScore: Boolean(values.showScore),

        showTimer: Boolean(values.showTimer),

        showProgress: Boolean(values.showProgress),

        allowHint: Boolean(values.allowHint),

        allowSkip: Boolean(values.allowSkip),

        showExplanation: Boolean(values.showExplanation),

        instantFeedback: Boolean(values.instantFeedback),

        enableSound: Boolean(values.enableSound),
      };

      /* -----------------------------------------------
         BACKGROUND CONFIG
         
         LƯU MÀU.
         FILE ẢNH gửi riêng bằng field "background".
      ------------------------------------------------ */

      const backgroundConfig = {
        color: backgroundColor,
      };

      /* -----------------------------------------------
         MEDIA
      ------------------------------------------------ */

      const media = {
        backgroundMusic: game?.media?.backgroundMusic || null,

        correctSound: game?.media?.correctSound || null,

        wrongSound: game?.media?.wrongSound || null,
      };

      /* -----------------------------------------------
         PAYLOAD
      ------------------------------------------------ */

      const payload = {
        name: values.name,

        description: game?.description || "",

        type: "quiz",

        backgroundConfig,

        theme: {
          primary,

          secondary,

          font: values.font || DEFAULT_THEME.font,

          borderRadius: Number(
            values.borderRadius ?? DEFAULT_THEME.borderRadius,
          ),
        },

        settings,

        media,

        questions: questions.map((q) => ({
          id: q.id,

          question: q.question,

          answers: q.answers.map((answer) => ({
            id: answer.id,

            text: answer.text,

            correct: Boolean(answer.correct),
          })),

          explanation: q.explanation || "",

          points: Number(q.points ?? 10),
        })),

        /* ---------------------------------------------
           QUAN TRỌNG:
           File ảnh nền
        ---------------------------------------------- */

        background: backgroundFile || null,
      };

      console.log("GAME PAYLOAD:", payload);

      setSubmitting(true);

      let result;

      if (game?.id) {
        result = await updateGame(game.id, payload);
      } else {
        result = await createGame(payload);
      }

      if (result?.success) {
        message.success(
          game?.id ? "Cập nhật thành công!" : "Tạo game thành công!",
        );

        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        message.error(result?.message || "Lỗi khi lưu trò chơi");
      }
    } catch (err) {
      console.error("SAVE GAME ERROR:", err);

      message.error(err?.message || "Vui lòng nhập đầy đủ thông tin bắt buộc");
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     CURRENT PREVIEW
  ======================================================= */

  const currentPreviewQuestion = questions[previewIndex] || null;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      style={{
        position: "relative",
        paddingBottom: 24,
      }}
    >
      <Row gutter={[24, 24]}>
        {/* =================================================
            LEFT
        ================================================= */}

        <Col xs={24} lg={12}>
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
          >
            <Card
              style={{
                borderRadius: 20,
                border: "1px solid #f0f0f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              }}
              styles={{
                body: {
                  padding: 20,
                },
              }}
            >
              <Tabs
                defaultActiveKey="questions"
                items={[
                  /* =========================================
                     QUESTIONS
                  ========================================= */

                  {
                    key: "questions",

                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontWeight: 600,
                        }}
                      >
                        <HelpCircle size={16} />
                        Câu hỏi ({questions.length})
                      </span>
                    ),

                    children: (
                      <div
                        style={{
                          paddingTop: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 13,
                            }}
                          >
                            Danh sách câu hỏi trong game
                          </Text>

                          <Button
                            type="primary"
                            icon={<Plus size={15} />}
                            onClick={handleAddQuestion}
                            style={{
                              background: formValues.primary,
                              borderRadius: 10,
                              fontWeight: 600,
                            }}
                          >
                            Thêm câu hỏi
                          </Button>
                        </div>

                        {questions.length === 0 ? (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Chưa có câu hỏi nào được thêm"
                          />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                              maxHeight: 420,
                              overflowY: "auto",
                              paddingRight: 4,
                            }}
                          >
                            {questions.map((q, idx) => (
                              <div
                                key={q.id}
                                onClick={() => setPreviewIndex(idx)}
                                style={{
                                  padding: "12px 16px",
                                  borderRadius: 12,

                                  border:
                                    previewIndex === idx
                                      ? `2px solid ${formValues.primary}`
                                      : "1px solid #e2e8f0",

                                  background:
                                    previewIndex === idx ? "#f4f0ff" : "#fff",

                                  display: "flex",

                                  alignItems: "center",

                                  justifyContent: "space-between",

                                  cursor: "pointer",
                                }}
                              >
                                <Space
                                  style={{
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  <Tag
                                    color={
                                      previewIndex === idx
                                        ? "purple"
                                        : "default"
                                    }
                                    style={{
                                      borderRadius: 6,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {idx + 1}
                                  </Tag>

                                  <Text
                                    strong
                                    style={{
                                      fontSize: 13,
                                    }}
                                    ellipsis={{
                                      tooltip: q.question,
                                    }}
                                  >
                                    {q.question || "Chưa nhập nội dung..."}
                                  </Text>
                                </Space>

                                <Space size={4}>
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<Edit3 size={15} />}
                                    onClick={(e) => {
                                      e.stopPropagation();

                                      handleEditQuestion(q);
                                    }}
                                  />

                                  <Popconfirm
                                    title="Xóa câu hỏi?"
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{
                                      danger: true,
                                    }}
                                    onConfirm={() => handleDeleteQuestion(q.id)}
                                  >
                                    <Button
                                      type="text"
                                      danger
                                      size="small"
                                      icon={<Trash2 size={15} />}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </Popconfirm>
                                </Space>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ),
                  },

                  /* =========================================
                     INFO
                  ========================================= */

                  {
                    key: "info",

                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontWeight: 600,
                        }}
                      >
                        <Settings size={16} />
                        Thông tin
                      </span>
                    ),

                    children: (
                      <div
                        style={{
                          paddingTop: 12,
                        }}
                      >
                        <Form.Item
                          name="name"
                          label={<Text strong>Tên trò chơi</Text>}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tên trò chơi",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Ví dụ: Ai nhanh hơn!"
                            style={{
                              borderRadius: 10,
                              height: 40,
                            }}
                          />
                        </Form.Item>
                      </div>
                    ),
                  },

                  /* =========================================
                     THEME
                  ========================================= */

                  {
                    key: "theme",

                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontWeight: 600,
                        }}
                      >
                        <Palette size={16} />
                        Giao diện
                      </span>
                    ),

                    children: (
                      <div
                        style={{
                          paddingTop: 12,
                        }}
                      >
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Form.Item
                              name="backgroundColor"
                              label={<Text strong>Màu nền</Text>}
                            >
                              <ColorPicker
                                showText
                                format="hex"
                                style={{
                                  width: "100%",
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              name="primary"
                              label={<Text strong>Màu chủ đạo</Text>}
                            >
                              <ColorPicker
                                showText
                                format="hex"
                                style={{
                                  width: "100%",
                                }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* =================================
                            BACKGROUND IMAGE
                        ================================= */}

                        <Form.Item
                          label={
                            <Text strong>
                              <ImageIcon
                                size={15}
                                style={{
                                  marginRight: 6,
                                  verticalAlign: "middle",
                                }}
                              />
                              Ảnh nền
                            </Text>
                          }
                        >
                          <Upload
                            accept="image/*"
                            maxCount={1}
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleBackgroundChange}
                          >
                            <Button
                              icon={<UploadCloud size={16} />}
                              style={{
                                borderRadius: 10,
                              }}
                            >
                              Chọn ảnh nền
                            </Button>
                          </Upload>

                          <Text
                            type="secondary"
                            style={{
                              display: "block",
                              fontSize: 12,
                              marginTop: 6,
                            }}
                          >
                            JPG, PNG, WEBP · tối đa 5MB
                          </Text>

                          {backgroundPreview && (
                            <div
                              style={{
                                marginTop: 12,
                                position: "relative",
                                borderRadius: 12,
                                overflow: "hidden",
                                border: "1px solid #e2e8f0",
                                background: "#f8fafc",
                              }}
                            >
                              <Image
                                src={backgroundPreview}
                                preview
                                width="100%"
                                height={150}
                                style={{
                                  objectFit: "cover",
                                }}
                              />

                              <Button
                                danger
                                type="primary"
                                shape="circle"
                                size="small"
                                icon={<X size={14} />}
                                onClick={handleRemoveBackground}
                                style={{
                                  position: "absolute",
                                  right: 8,
                                  top: 8,
                                }}
                              />
                            </div>
                          )}

                          {!backgroundPreview && oldBackground && (
                            <div
                              style={{
                                marginTop: 10,
                              }}
                            >
                              <Text type="secondary">Không có ảnh nền</Text>
                            </div>
                          )}
                        </Form.Item>

                        <Form.Item
                          name="font"
                          label={<Text strong>Font chữ</Text>}
                        >
                          <Select
                            style={{
                              height: 40,
                            }}
                            options={[
                              {
                                value: "Baloo 2",
                                label: "Baloo 2 (Thơ mộng, vui tươi)",
                              },
                              {
                                value: "Be Vietnam Pro",
                                label: "Be Vietnam Pro (Hiện đại, rõ ràng)",
                              },
                              {
                                value: "Nunito",
                                label: "Nunito (Thân thiện, mềm mại)",
                              },
                            ]}
                          />
                        </Form.Item>

                        <Form.Item
                          name="borderRadius"
                          label={<Text strong>Độ bo góc (px)</Text>}
                        >
                          <InputNumber
                            min={0}
                            max={32}
                            style={{
                              width: "100%",
                            }}
                          />
                        </Form.Item>
                      </div>
                    ),
                  },

                  /* =========================================
                     SETTINGS
                  ========================================= */

                  {
                    key: "settings",

                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontWeight: 600,
                        }}
                      >
                        <Settings size={16} />
                        Cài đặt
                      </span>
                    ),

                    children: (
                      <div
                        style={{
                          paddingTop: 12,
                        }}
                      >
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="timeLimit"
                              label={
                                <Text strong>Thời gian mỗi câu (giây)</Text>
                              }
                            >
                              <InputNumber
                                min={5}
                                max={300}
                                style={{
                                  width: "100%",
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              name="passingScore"
                              label={<Text strong>Điểm đạt (%)</Text>}
                            >
                              <InputNumber
                                min={0}
                                max={100}
                                style={{
                                  width: "100%",
                                }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider />

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 14,
                          }}
                        >
                          {/* SHOW TIMER */}

                          <SettingSwitch
                            name="showTimer"
                            label="Hiển thị đồng hồ đếm ngược"
                          />

                          {/* SHOW SCORE */}

                          <SettingSwitch
                            name="showScore"
                            label="Hiển thị điểm số"
                          />

                          {/* SHOW PROGRESS */}

                          <SettingSwitch
                            name="showProgress"
                            label="Hiển thị tiến trình"
                          />

                          {/* SHOW EXPLANATION */}

                          <SettingSwitch
                            name="showExplanation"
                            label="Hiển thị giải thích sau khi trả lời"
                          />

                          {/* INSTANT FEEDBACK */}

                          <SettingSwitch
                            name="instantFeedback"
                            label="Báo đúng/sai ngay khi chọn đáp án"
                          />

                          {/* SHUFFLE QUESTIONS */}

                          <SettingSwitch
                            name="shuffleQuestions"
                            label="Tự động xáo trộn câu hỏi"
                          />

                          {/* SHUFFLE ANSWERS */}

                          <SettingSwitch
                            name="shuffleAnswers"
                            label="Tự động xáo trộn đáp án"
                          />

                          {/* ALLOW HINT */}

                          <SettingSwitch
                            name="allowHint"
                            label="Cho phép sử dụng gợi ý"
                          />

                          {/* ALLOW SKIP */}

                          <SettingSwitch
                            name="allowSkip"
                            label="Cho phép bỏ qua câu hỏi"
                          />

                          {/* SOUND */}

                          <SettingSwitch
                            name="enableSound"
                            label="Bật âm thanh & hiệu ứng"
                          />
                        </div>
                      </div>
                    ),
                  },
                ]}
              />

              <Divider
                style={{
                  margin: "16px 0",
                }}
              />

              <Button
                type="primary"
                size="large"
                block
                icon={<Save size={18} />}
                loading={submitting}
                onClick={handleSubmit}
                style={{
                  background: formValues.primary,
                  borderRadius: 12,
                  fontWeight: 700,
                  height: 46,
                }}
              >
                Lưu trò chơi
              </Button>
            </Card>
          </Form>
        </Col>

        {/* =================================================
            RIGHT PREVIEW
        ================================================= */}

        <Col xs={24} lg={12}>
          <div
            style={{
              position: "sticky",
              top: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Space>
                <Sparkles size={18} color={formValues.primary} />

                <Text
                  strong
                  style={{
                    fontSize: 15,
                  }}
                >
                  Màn hình Xem trước
                </Text>
              </Space>

              {questions.length > 0 && (
                <Space size={6}>
                  <Button
                    size="small"
                    icon={<ChevronLeft size={16} />}
                    disabled={previewIndex === 0}
                    onClick={() => setPreviewIndex((prev) => prev - 1)}
                  />

                  <Text strong>
                    {previewIndex + 1} / {questions.length}
                  </Text>

                  <Button
                    size="small"
                    icon={<ChevronRight size={16} />}
                    disabled={previewIndex >= questions.length - 1}
                    onClick={() => setPreviewIndex((prev) => prev + 1)}
                  />
                </Space>
              )}
            </div>

            {/* =================================================
                GAME SCREEN
            ================================================= */}

            <div
              style={{
                width: "100%",
                minHeight: 500,

                backgroundColor:
                  formValues.backgroundColor || DEFAULT_THEME.backgroundColor,

                backgroundImage: backgroundPreview
                  ? `linear-gradient(rgba(255,255,255,0.15), rgba(255,255,255,0.15)), url("${backgroundPreview}")`
                  : "none",

                backgroundSize: "cover",

                backgroundPosition: "center",

                backgroundRepeat: "no-repeat",

                borderRadius: formValues.borderRadius || 16,

                padding: 24,

                boxShadow: "0 12px 32px rgba(0,0,0,0.06)",

                border: "2px solid #e2e8f0",

                display: "flex",

                flexDirection: "column",

                justifyContent: "space-between",

                fontFamily: formValues.font || "sans-serif",

                transition: "all 0.3s ease",
              }}
            >
              {/* =============================================
                  HEADER
              ============================================= */}

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: 16,
                        color: "#0f172a",
                        display: "block",
                      }}
                    >
                      {formValues.name || "Tên trò chơi"}
                    </Text>

                    {formValues.showScore && (
                      <Tag
                        color="gold"
                        icon={<Award size={12} />}
                        style={{
                          borderRadius: 6,
                          border: "none",
                        }}
                      >
                        Điểm: 0
                      </Tag>
                    )}
                  </div>

                  {formValues.showTimer && (
                    <div
                      style={{
                        background: "#fff",
                        padding: "6px 14px",
                        borderRadius: 20,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <Clock size={15} color={formValues.primary} />

                      <Text
                        strong
                        style={{
                          color: formValues.primary,
                          fontSize: 13,
                        }}
                      >
                        {formValues.timeLimit || 60}s
                      </Text>
                    </div>
                  )}
                </div>

                {formValues.showProgress && (
                  <Progress
                    percent={
                      questions.length > 0
                        ? ((previewIndex + 1) / questions.length) * 100
                        : 0
                    }
                    strokeColor={formValues.primary}
                    showInfo={false}
                    size="small"
                  />
                )}
              </div>

              {/* =============================================
                  QUESTION
              ============================================= */}

              <div
                style={{
                  margin: "20px 0",
                }}
              >
                {currentPreviewQuestion ? (
                  <div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.96)",
                        borderRadius: Math.max(
                          4,
                          (formValues.borderRadius || 16) - 4,
                        ),
                        padding: "16px 20px",
                        marginBottom: 16,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: 15,
                          color: "#1e293b",
                          lineHeight: 1.5,
                          display: "block",
                          wordBreak: "break-word",
                        }}
                      >
                        {currentPreviewQuestion.question}
                      </Text>
                    </div>

                    {/* =======================================
                        ANSWERS
                    ======================================== */}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        maxHeight: 260,
                        overflowY: "auto",
                      }}
                    >
                      {currentPreviewQuestion.answers.map((ans, idx) => (
                        <div
                          key={ans.id || idx}
                          style={{
                            padding: "12px 16px",
                            background: "rgba(255,255,255,0.96)",
                            borderRadius: Math.max(
                              4,
                              (formValues.borderRadius || 16) - 4,
                            ),
                            border: "1.5px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                          }}
                        >
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              background: `${formValues.primary}18`,
                              color: formValues.primary,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 12,
                              flexShrink: 0,
                            }}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>

                          <Text
                            style={{
                              fontSize: 13,
                              color: "#334155",
                              flex: 1,
                              wordBreak: "break-word",
                              lineHeight: 1.4,
                            }}
                          >
                            {ans.text ||
                              `Đáp án ${String.fromCharCode(65 + idx)}`}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                      }}
                    >
                      Hãy thêm câu hỏi để xem trước giao diện trò chơi
                    </Text>
                  </div>
                )}
              </div>

              {/* =============================================
                  FOOTER
              ============================================= */}

              <div
                style={{
                  textAlign: "center",
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                  }}
                >
                  Giao diện mô phỏng trải nghiệm thực tế của học sinh
                </Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* =====================================================
          QUESTION MODAL
      ===================================================== */}

      <Modal
        open={questionModalOpen}
        title={
          <Text
            strong
            style={{
              fontSize: 16,
            }}
          >
            {editingQuestion?.id.includes("question_") &&
            !questions.some((q) => q.id === editingQuestion.id)
              ? "Thêm câu hỏi mới"
              : "Chỉnh sửa câu hỏi"}
          </Text>
        }
        onCancel={() => {
          setQuestionModalOpen(false);

          setEditingQuestion(null);
        }}
        onOk={handleSaveQuestion}
        okText="Lưu câu hỏi"
        cancelText="Hủy"
        width={620}
        centered
        destroyOnClose
      >
        {editingQuestion && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              paddingTop: 12,
            }}
          >
            {/* QUESTION */}

            <div>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Nội dung câu hỏi <Text type="danger">*</Text>
              </Text>

              <TextArea
                rows={3}
                placeholder="Nhập nội dung câu hỏi tại đây..."
                value={editingQuestion.question}
                onChange={(e) =>
                  setEditingQuestion((prev) => ({
                    ...prev,
                    question: e.target.value,
                  }))
                }
                style={{
                  borderRadius: 10,
                }}
              />
            </div>

            {/* ANSWERS */}

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text strong>Các đáp án lựa chọn</Text>

                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  Bấm nút để chọn đáp án đúng
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {editingQuestion.answers.map((ans, idx) => (
                  <div
                    key={ans.id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: ans.correct ? "#f6ffed" : "#f8fafc",
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: ans.correct
                        ? "1px solid #b7eb8f"
                        : "1px solid #e2e8f0",
                    }}
                  >
                    <Tooltip
                      title={
                        ans.correct ? "Đáp án đúng" : "Đánh dấu là đáp án đúng"
                      }
                    >
                      <Button
                        type={ans.correct ? "primary" : "default"}
                        shape="circle"
                        size="small"
                        icon={
                          ans.correct ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <XCircle size={16} />
                          )
                        }
                        onClick={() => {
                          const updated = editingQuestion.answers.map(
                            (a, i) => ({
                              ...a,
                              correct: i === idx,
                            }),
                          );

                          setEditingQuestion((prev) => ({
                            ...prev,
                            answers: updated,
                          }));
                        }}
                        style={{
                          background: ans.correct ? "#52c41a" : "transparent",

                          borderColor: ans.correct ? "#52c41a" : "#cbd5e1",

                          color: ans.correct ? "#fff" : "#94a3b8",

                          flexShrink: 0,
                        }}
                      />
                    </Tooltip>

                    <Input
                      placeholder={`Đáp án ${String.fromCharCode(65 + idx)}...`}
                      value={ans.text}
                      onChange={(e) => {
                        const updated = [...editingQuestion.answers];

                        updated[idx] = {
                          ...updated[idx],
                          text: e.target.value,
                        };

                        setEditingQuestion((prev) => ({
                          ...prev,
                          answers: updated,
                        }));
                      }}
                      style={{
                        borderRadius: 8,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/* =========================================================
   SETTING SWITCH
========================================================= */

const SettingSwitch = ({ name, label }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Text>{label}</Text>

      <Form.Item name={name} valuePropName="checked" noStyle>
        <Switch />
      </Form.Item>
    </div>
  );
};

export default QuizGameEditor;
