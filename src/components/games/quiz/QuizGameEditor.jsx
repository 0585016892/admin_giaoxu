import React, { useEffect, useState } from "react";

import {
  Button,
  Card,
  Col,
  ColorPicker,
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
  CheckCircle2,
  XCircle,
  UploadCloud,
  ImageIcon,
  X,
  SlidersHorizontal,
  Eye,
  Trophy,
  FileQuestion,
  Check,
} from "lucide-react";

import {
  createGame,
  updateGame,
  getGameBackground,
} from "../../../api/gameApi";

const { Text, Title } = Typography;
const { TextArea } = Input;

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

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

/* =========================================================
   DEFAULT THEME
========================================================= */

const DEFAULT_THEME = {
  primary: COLORS.navy,
  secondary: COLORS.gold,
  font: "Be Vietnam Pro",
  borderRadius: 12,
  backgroundColor: "#F7F9FC",
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
   MAIN COMPONENT
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
     BACKGROUND
  ======================================================= */

  const [backgroundFile, setBackgroundFile] = useState(null);

  const [backgroundPreview, setBackgroundPreview] = useState(null);

  const [oldBackground, setOldBackground] = useState(null);

  /* =======================================================
     LIVE FORM VALUES
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
     INITIALIZE
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

      const existingBackground = getGameBackground(game);

      setOldBackground(existingBackground);

      setBackgroundPreview(existingBackground);

      setBackgroundFile(null);

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
     BACKGROUND CHANGE
  ======================================================= */

  const handleBackgroundChange = (info) => {
    const file = info.file?.originFileObj || info.file;

    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      message.error("Vui lòng chọn file hình ảnh.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error("Dung lượng ảnh không được vượt quá 5MB.");
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
     QUESTION ACTIONS
  ======================================================= */

  const handleAddQuestion = () => {
    setEditingQuestion(createEmptyQuestion());

    setQuestionModalOpen(true);
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(JSON.parse(JSON.stringify(q)));

    setQuestionModalOpen(true);
  };

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

    message.success("Đã xóa câu hỏi.");
  };

  /* =======================================================
     SAVE QUESTION
  ======================================================= */

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;

    if (!editingQuestion.question.trim()) {
      message.warning("Vui lòng nhập nội dung câu hỏi.");
      return;
    }

    const validAnswers = editingQuestion.answers.filter((a) => a.text.trim());

    if (validAnswers.length < 2) {
      message.warning("Cần ít nhất 2 đáp án.");
      return;
    }

    if (!validAnswers.some((a) => a.correct)) {
      message.warning("Vui lòng chọn ít nhất 1 đáp án đúng.");
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

    message.success("Lưu câu hỏi thành công.");
  };

  /* =======================================================
     SUBMIT GAME
  ======================================================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (questions.length === 0) {
        message.warning("Thêm ít nhất 1 câu hỏi để tạo trò chơi.");

        return;
      }

      const backgroundColor = getColorValue(
        values.backgroundColor,
        DEFAULT_THEME.backgroundColor,
      );

      const primary = getColorValue(values.primary, DEFAULT_THEME.primary);

      const secondary = getColorValue(
        values.secondary,
        DEFAULT_THEME.secondary,
      );

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

      const backgroundConfig = {
        color: backgroundColor,
      };

      const media = {
        backgroundMusic: game?.media?.backgroundMusic || null,

        correctSound: game?.media?.correctSound || null,

        wrongSound: game?.media?.wrongSound || null,
      };

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

        background: backgroundFile || null,
      };

      setSubmitting(true);

      let result;

      if (game?.id) {
        result = await updateGame(game.id, payload);
      } else {
        result = await createGame(payload);
      }

      if (result?.success) {
        message.success(
          game?.id
            ? "Cập nhật trò chơi thành công."
            : "Tạo trò chơi thành công.",
        );

        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        message.error(result?.message || "Có lỗi xảy ra.");
      }
    } catch (err) {
      console.error("SAVE GAME ERROR:", err);

      message.error(err?.message || "Vui lòng kiểm tra lại thông tin.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentPreviewQuestion = questions[previewIndex] || null;

  /* =======================================================
     SMALL LABEL
  ======================================================= */

  const labelStyle = {
    fontWeight: 700,
    color: COLORS.text,
    fontSize: 13,
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      style={{
        position: "relative",
        paddingBottom: 24,

        fontFamily: `'${formValues.font}', 'Be Vietnam Pro', sans-serif`,
      }}
    >
      <Row gutter={[20, 20]}>
        {/* =================================================
            LEFT PANEL
        ================================================= */}

        <Col xs={24} lg={14}>
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
          >
            <Card
              style={{
                borderRadius: 16,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.white,
                boxShadow: "0 3px 12px rgba(23,59,94,0.04)",
              }}
              styles={{
                body: {
                  padding: 22,
                },
              }}
            >
              <Tabs
                defaultActiveKey="questions"
                items={[
                  /* =================================================
                      QUESTIONS
                  ================================================= */

                  {
                    key: "questions",

                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontWeight: 700,
                        }}
                      >
                        <HelpCircle size={17} />
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
                            gap: 12,
                            marginBottom: 16,
                          }}
                        >
                          <div>
                            <Text
                              style={{
                                display: "block",
                                color: COLORS.text,
                                fontWeight: 700,
                                fontSize: 14,
                              }}
                            >
                              Danh sách câu hỏi
                            </Text>

                            <Text
                              style={{
                                color: COLORS.muted,
                                fontSize: 12,
                              }}
                            >
                              Quản lý nội dung và đáp án
                            </Text>
                          </div>

                          <Button
                            type="primary"
                            icon={<Plus size={16} />}
                            onClick={handleAddQuestion}
                            style={{
                              height: 38,
                              borderRadius: 9,
                              background: COLORS.navy,
                              borderColor: COLORS.navy,
                              fontWeight: 700,
                            }}
                          >
                            Thêm câu hỏi
                          </Button>
                        </div>

                        {questions.length === 0 ? (
                          <div
                            style={{
                              padding: "38px 16px",
                              textAlign: "center",
                              background: COLORS.navyLight,
                              borderRadius: 12,
                              border: `1px dashed ${COLORS.border}`,
                            }}
                          >
                            <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description={
                                <span
                                  style={{
                                    color: COLORS.textSecondary,
                                    fontWeight: 500,
                                    fontSize: 13,
                                  }}
                                >
                                  Chưa có câu hỏi. Hãy thêm câu hỏi đầu tiên.
                                </span>
                              }
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 9,
                              maxHeight: 440,
                              overflowY: "auto",
                              paddingRight: 4,
                            }}
                          >
                            {questions.map((q, idx) => {
                              const isSelected = previewIndex === idx;

                              return (
                                <div
                                  key={q.id}
                                  onClick={() => setPreviewIndex(idx)}
                                  style={{
                                    padding: "12px 14px",
                                    borderRadius: 11,

                                    border: isSelected
                                      ? `1.5px solid ${COLORS.navy}`
                                      : `1px solid ${COLORS.border}`,

                                    background: isSelected
                                      ? COLORS.navyLight
                                      : COLORS.white,

                                    display: "flex",

                                    alignItems: "center",

                                    justifyContent: "space-between",

                                    gap: 10,

                                    cursor: "pointer",

                                    transition: "all 0.18s ease",

                                    boxShadow: isSelected
                                      ? "0 3px 10px rgba(23,59,94,0.07)"
                                      : "none",
                                  }}
                                >
                                  <Space
                                    style={{
                                      flex: 1,
                                      minWidth: 0,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 30,
                                        height: 30,
                                        minWidth: 30,
                                        borderRadius: 8,

                                        background: isSelected
                                          ? COLORS.navy
                                          : COLORS.navyLight,

                                        color: isSelected
                                          ? COLORS.white
                                          : COLORS.navy,

                                        display: "flex",

                                        alignItems: "center",

                                        justifyContent: "center",

                                        fontWeight: 800,

                                        fontSize: 12,
                                      }}
                                    >
                                      {idx + 1}
                                    </div>

                                    <Text
                                      strong
                                      ellipsis={{
                                        tooltip: q.question,
                                      }}
                                      style={{
                                        fontSize: 13,
                                        color: COLORS.text,
                                        fontWeight: 650,
                                      }}
                                    >
                                      {q.question || "Chưa nhập nội dung..."}
                                    </Text>
                                  </Space>

                                  <Space size={5}>
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<Edit3 size={15} />}
                                      onClick={(e) => {
                                        e.stopPropagation();

                                        handleEditQuestion(q);
                                      }}
                                      style={{
                                        color: COLORS.navy,
                                        background: COLORS.navyLight,
                                        borderRadius: 7,
                                        width: 32,
                                        height: 32,
                                      }}
                                    />

                                    <Popconfirm
                                      title="Xóa câu hỏi này?"
                                      okText="Xóa"
                                      cancelText="Hủy"
                                      okButtonProps={{
                                        danger: true,
                                      }}
                                      onConfirm={() =>
                                        handleDeleteQuestion(q.id)
                                      }
                                    >
                                      <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<Trash2 size={15} />}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          background: COLORS.dangerBg,
                                          borderRadius: 7,
                                          width: 32,
                                          height: 32,
                                        }}
                                      />
                                    </Popconfirm>
                                  </Space>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ),
                  },

                  /* =================================================
                      INFO
                  ================================================= */

                  {
                    key: "info",

                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontWeight: 700,
                        }}
                      >
                        <Settings size={17} />
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
                          label={<span style={labelStyle}>Tên trò chơi</span>}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tên trò chơi.",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Nhập tên trò chơi..."
                            prefix={
                              <FileQuestion size={16} color={COLORS.muted} />
                            }
                            style={{
                              borderRadius: 9,
                              height: 42,
                              fontSize: 13,
                            }}
                          />
                        </Form.Item>
                      </div>
                    ),
                  },

                  /* =================================================
                      THEME
                  ================================================= */

                  {
                    key: "theme",

                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontWeight: 700,
                        }}
                      >
                        <Palette size={17} />
                        Giao diện
                      </span>
                    ),

                    children: (
                      <div
                        style={{
                          paddingTop: 12,
                        }}
                      >
                        <Row gutter={[16, 4]}>
                          <Col span={12}>
                            <Form.Item
                              name="backgroundColor"
                              label={<span style={labelStyle}>Màu nền</span>}
                            >
                              <ColorPicker
                                showText
                                format="hex"
                                style={{
                                  width: "100%",
                                  height: 40,
                                  borderRadius: 9,
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              name="primary"
                              label={
                                <span style={labelStyle}>Màu chủ đạo</span>
                              }
                            >
                              <ColorPicker
                                showText
                                format="hex"
                                style={{
                                  width: "100%",
                                  height: 40,
                                  borderRadius: 9,
                                }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* BACKGROUND IMAGE */}

                        <Form.Item
                          label={
                            <span style={labelStyle}>
                              <ImageIcon
                                size={15}
                                style={{
                                  marginRight: 6,
                                  verticalAlign: "middle",
                                }}
                              />
                              Hình nền trò chơi
                            </span>
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
                                height: 39,
                                borderRadius: 9,
                                fontWeight: 650,
                                borderColor: COLORS.border,
                                color: COLORS.navy,
                                background: COLORS.navyLight,
                              }}
                            >
                              Tải hình nền
                            </Button>
                          </Upload>

                          <Text
                            style={{
                              display: "block",
                              marginTop: 6,
                              fontSize: 11.5,
                              color: COLORS.muted,
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
                                border: `1px solid ${COLORS.border}`,
                              }}
                            >
                              <Image
                                src={backgroundPreview}
                                preview
                                width="100%"
                                height={145}
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
                                  right: 10,
                                  top: 10,
                                }}
                              />
                            </div>
                          )}

                          {!backgroundPreview && oldBackground && (
                            <Text
                              style={{
                                display: "block",
                                marginTop: 8,
                                color: COLORS.muted,
                                fontSize: 12,
                              }}
                            >
                              Chưa chọn hình nền mới.
                            </Text>
                          )}
                        </Form.Item>

                        <Form.Item
                          name="font"
                          label={<span style={labelStyle}>Kiểu chữ</span>}
                        >
                          <Select
                            style={{
                              height: 40,
                            }}
                            options={[
                              {
                                value: "Baloo 2",
                                label: "Baloo 2",
                              },
                              {
                                value: "Be Vietnam Pro",
                                label: "Be Vietnam Pro",
                              },
                              {
                                value: "Nunito",
                                label: "Nunito",
                              },
                            ]}
                          />
                        </Form.Item>
                      </div>
                    ),
                  },

                  /* =================================================
                      SETTINGS
                  ================================================= */

                  {
                    key: "settings",

                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontWeight: 700,
                        }}
                      >
                        <SlidersHorizontal size={17} />
                        Tùy chọn
                      </span>
                    ),

                    children: (
                      <div
                        style={{
                          paddingTop: 12,
                        }}
                      >
                        <Row gutter={[16, 12]}>
                          <Col span={12}>
                            <Form.Item
                              name="timeLimit"
                              label={
                                <span style={labelStyle}>
                                  Thời gian mỗi câu
                                </span>
                              }
                            >
                              <InputNumber
                                min={5}
                                max={300}
                                addonAfter="giây"
                                style={{
                                  width: "100%",
                                  height: 40,
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <div
                              style={{
                                paddingTop: 4,
                              }}
                            >
                              <Form.Item
                                name="showTimer"
                                valuePropName="checked"
                                style={{
                                  marginBottom: 12,
                                }}
                              >
                                <Switch size="small" />

                                <Text
                                  style={{
                                    marginLeft: 8,
                                    color: COLORS.text,
                                    fontWeight: 600,
                                  }}
                                >
                                  Hiện đồng hồ
                                </Text>
                              </Form.Item>

                              <Form.Item
                                name="showScore"
                                valuePropName="checked"
                                style={{
                                  marginBottom: 0,
                                }}
                              >
                                <Switch size="small" />

                                <Text
                                  style={{
                                    marginLeft: 8,
                                    color: COLORS.text,
                                    fontWeight: 600,
                                  }}
                                >
                                  Hiện điểm số
                                </Text>
                              </Form.Item>
                            </div>
                          </Col>
                        </Row>

                        <div
                          style={{
                            background: COLORS.navyLight,
                            padding: 15,
                            borderRadius: 11,
                            border: `1px solid ${COLORS.border}`,
                            display: "flex",
                            flexDirection: "column",
                            gap: 11,
                          }}
                        >
                          <Form.Item
                            name="shuffleQuestions"
                            valuePropName="checked"
                            style={{
                              marginBottom: 0,
                            }}
                          >
                            <Switch size="small" />

                            <Text
                              style={{
                                marginLeft: 8,
                                color: COLORS.text,
                                fontWeight: 600,
                              }}
                            >
                              Trộn câu hỏi
                            </Text>
                          </Form.Item>

                          <Form.Item
                            name="shuffleAnswers"
                            valuePropName="checked"
                            style={{
                              marginBottom: 0,
                            }}
                          >
                            <Switch size="small" />

                            <Text
                              style={{
                                marginLeft: 8,
                                color: COLORS.text,
                                fontWeight: 600,
                              }}
                            >
                              Trộn đáp án
                            </Text>
                          </Form.Item>

                          <Form.Item
                            name="enableSound"
                            valuePropName="checked"
                            style={{
                              marginBottom: 0,
                            }}
                          >
                            <Switch size="small" />

                            <Text
                              style={{
                                marginLeft: 8,
                                color: COLORS.text,
                                fontWeight: 600,
                              }}
                            >
                              Bật âm thanh
                            </Text>
                          </Form.Item>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />

              {/* =================================================
                  SAVE
              ================================================= */}

              <div
                style={{
                  marginTop: 22,
                  paddingTop: 16,
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<Save size={18} />}
                  loading={submitting}
                  onClick={handleSubmit}
                  block
                  style={{
                    height: 46,
                    borderRadius: 9,
                    background: COLORS.navy,
                    borderColor: COLORS.navy,
                    fontWeight: 750,
                    fontSize: 14,
                    boxShadow: "0 4px 12px rgba(23,59,94,0.15)",
                  }}
                >
                  {game ? "Cập nhật trò chơi" : "Hoàn tất & Tạo trò chơi"}
                </Button>
              </div>
            </Card>
          </Form>
        </Col>

        {/* =================================================
            RIGHT PREVIEW
        ================================================= */}

        <Col xs={24} lg={10}>
          <div
            style={{
              position: "sticky",
              top: 20,

              backgroundColor: formValues.backgroundColor,

              backgroundImage: backgroundPreview
                ? `url(${backgroundPreview})`
                : "none",

              backgroundSize: "cover",
              backgroundPosition: "center",

              borderRadius: 16,

              padding: 20,

              border: `1px solid ${COLORS.border}`,

              boxShadow: "0 5px 18px rgba(23,59,94,0.06)",

              minHeight: 520,

              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* PREVIEW HEADER */}

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <Tag
                  icon={<Eye size={13} />}
                  style={{
                    margin: 0,
                    background: COLORS.white,
                    color: COLORS.navy,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 7,
                    padding: "3px 9px",
                    fontWeight: 700,
                  }}
                >
                  Xem trước
                </Tag>

                {formValues.showTimer && (
                  <div
                    style={{
                      background: COLORS.white,
                      padding: "5px 10px",
                      borderRadius: 7,
                      fontWeight: 700,
                      color: COLORS.navy,
                      border: `1px solid ${COLORS.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                    }}
                  >
                    <Clock size={13} />
                    {formValues.timeLimit}s
                  </div>
                )}
              </div>

              {/* TITLE */}

              <Title
                level={4}
                style={{
                  textAlign: "center",
                  color: COLORS.navy,
                  fontWeight: 800,
                  marginBottom: 18,
                  fontSize: 19,
                }}
              >
                {formValues.name || "Tên trò chơi"}
              </Title>

              {/* QUESTION */}

              {currentPreviewQuestion ? (
                <div
                  style={{
                    background: "rgba(255,255,255,0.96)",
                    borderRadius: 13,
                    padding: 18,
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: "0 4px 14px rgba(23,59,94,0.05)",
                  }}
                >
                  {/* QUESTION META */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 13,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 750,
                        color: COLORS.navy,
                        fontSize: 12,
                      }}
                    >
                      Câu {previewIndex + 1}/{questions.length}
                    </Text>

                    <Tag
                      icon={<Trophy size={12} />}
                      style={{
                        margin: 0,
                        border: `1px solid #F3D9A3`,
                        background: COLORS.goldLight,
                        color: COLORS.warning,
                        borderRadius: 6,
                        fontWeight: 700,
                      }}
                    >
                      +{currentPreviewQuestion.points || 10} điểm
                    </Tag>
                  </div>

                  {/* QUESTION TEXT */}

                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: 750,
                      color: COLORS.text,
                      display: "block",
                      marginBottom: 15,
                      lineHeight: 1.5,
                    }}
                  >
                    {currentPreviewQuestion.question ||
                      "Chưa có nội dung câu hỏi"}
                  </Text>

                  {/* ANSWERS */}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {currentPreviewQuestion.answers.map((ans, aIdx) => (
                      <div
                        key={aIdx}
                        style={{
                          padding: "10px 12px",

                          borderRadius: 9,

                          background: ans.correct
                            ? COLORS.successBg
                            : COLORS.background,

                          border: ans.correct
                            ? `1px solid #B8DDC9`
                            : `1px solid ${COLORS.border}`,

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "space-between",

                          gap: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: 600,
                            color: ans.correct
                              ? COLORS.success
                              : COLORS.textSecondary,
                            fontSize: 12.5,
                          }}
                        >
                          <b
                            style={{
                              marginRight: 6,
                            }}
                          >
                            {ans.id || String.fromCharCode(65 + aIdx)}.
                          </b>

                          {ans.text || "Chưa nhập đáp án"}
                        </Text>

                        {ans.correct && (
                          <CheckCircle2 size={16} color={COLORS.success} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    borderRadius: 13,
                    padding: "48px 20px",
                    textAlign: "center",
                    border: `1px dashed ${COLORS.border}`,
                  }}
                >
                  <FileQuestion
                    size={34}
                    color={COLORS.muted}
                    style={{
                      marginBottom: 10,
                    }}
                  />

                  <Text
                    style={{
                      display: "block",
                      fontWeight: 600,
                      color: COLORS.textSecondary,
                      fontSize: 13,
                    }}
                  >
                    Thêm câu hỏi để xem trước.
                  </Text>
                </div>
              )}
            </div>

            {/* PREVIEW NAV */}

            {questions.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <Button
                  shape="circle"
                  icon={<ChevronLeft size={17} />}
                  disabled={previewIndex === 0}
                  onClick={() => setPreviewIndex((prev) => prev - 1)}
                />

                <Text
                  style={{
                    fontWeight: 700,
                    color: COLORS.navy,
                    fontSize: 12,
                  }}
                >
                  {previewIndex + 1} / {questions.length}
                </Text>

                <Button
                  shape="circle"
                  icon={<ChevronRight size={17} />}
                  disabled={previewIndex === questions.length - 1}
                  onClick={() => setPreviewIndex((prev) => prev + 1)}
                />
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* =========================================================
          QUESTION MODAL
      ========================================================= */}

      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: COLORS.goldLight,
                color: COLORS.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileQuestion size={18} />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 750,
                  color: COLORS.navy,
                  fontSize: 16,
                }}
              >
                {editingQuestion?.id?.startsWith("question_") &&
                !questions.some((q) => q.id === editingQuestion.id)
                  ? "Thêm câu hỏi"
                  : "Chỉnh sửa câu hỏi"}
              </div>

              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                Nhập nội dung và thiết lập đáp án
              </div>
            </div>
          </div>
        }
        open={questionModalOpen}
        onOk={handleSaveQuestion}
        onCancel={() => {
          setQuestionModalOpen(false);

          setEditingQuestion(null);
        }}
        okText="Lưu câu hỏi"
        cancelText="Hủy"
        width={640}
        centered
        styles={{
          content: {
            borderRadius: 16,
            padding: 22,
          },

          header: {
            marginBottom: 10,
          },
        }}
        okButtonProps={{
          style: {
            borderRadius: 8,
            height: 38,
            fontWeight: 700,
            background: COLORS.navy,
            borderColor: COLORS.navy,
          },
        }}
        cancelButtonProps={{
          style: {
            borderRadius: 8,
            height: 38,
            fontWeight: 600,
          },
        }}
      >
        {editingQuestion && (
          <div
            style={{
              padding: "8px 0 2px",
            }}
          >
            {/* QUESTION INPUT */}

            <div
              style={{
                marginBottom: 18,
              }}
            >
              <Text
                style={{
                  fontWeight: 700,
                  color: COLORS.text,
                  display: "block",
                  marginBottom: 7,
                  fontSize: 13,
                }}
              >
                Nội dung câu hỏi
              </Text>

              <TextArea
                rows={3}
                placeholder="Nhập nội dung câu hỏi..."
                value={editingQuestion.question}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    question: e.target.value,
                  })
                }
                style={{
                  borderRadius: 9,
                  fontSize: 13,
                  borderColor: COLORS.border,
                }}
              />
            </div>

            {/* ANSWERS */}

            <div
              style={{
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontWeight: 700,
                    color: COLORS.text,
                    fontSize: 13,
                  }}
                >
                  Đáp án
                </Text>

                <Text
                  style={{
                    color: COLORS.muted,
                    fontSize: 11,
                  }}
                >
                  Chọn đáp án đúng
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {editingQuestion.answers.map((ans, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,

                      background: ans.correct
                        ? COLORS.successBg
                        : COLORS.background,

                      padding: "8px 10px",

                      borderRadius: 9,

                      border: ans.correct
                        ? `1px solid #B8DDC9`
                        : `1px solid ${COLORS.border}`,
                    }}
                  >
                    <Button
                      shape="circle"
                      type={ans.correct ? "primary" : "default"}
                      icon={
                        ans.correct ? (
                          <Check size={16} />
                        ) : (
                          <XCircle size={16} />
                        )
                      }
                      onClick={() => {
                        const updated = editingQuestion.answers.map(
                          (item, i) => ({
                            ...item,
                            correct: i === idx,
                          }),
                        );

                        setEditingQuestion({
                          ...editingQuestion,
                          answers: updated,
                        });
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        minWidth: 32,

                        background: ans.correct ? COLORS.success : COLORS.white,

                        borderColor: ans.correct
                          ? COLORS.success
                          : COLORS.border,

                        color: ans.correct ? COLORS.white : COLORS.muted,
                      }}
                    />

                    <div
                      style={{
                        width: 22,
                        color: COLORS.textSecondary,
                        fontWeight: 750,
                        fontSize: 12,
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>

                    <Input
                      placeholder={`Nhập đáp án ${String.fromCharCode(
                        65 + idx,
                      )}`}
                      value={ans.text}
                      onChange={(e) => {
                        const updated = [...editingQuestion.answers];

                        updated[idx].text = e.target.value;

                        setEditingQuestion({
                          ...editingQuestion,
                          answers: updated,
                        });
                      }}
                      style={{
                        borderRadius: 7,
                        fontWeight: 500,
                        background: COLORS.white,
                        borderColor: COLORS.border,
                      }}
                    />

                    {ans.correct && (
                      <Tag
                        style={{
                          margin: 0,
                          background: COLORS.successBg,
                          border: "none",
                          color: COLORS.success,
                          fontWeight: 700,
                          fontSize: 10,
                        }}
                      >
                        ĐÚNG
                      </Tag>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* POINT + EXPLANATION */}

            <Row gutter={14}>
              <Col span={8}>
                <Text
                  style={{
                    fontWeight: 700,
                    color: COLORS.text,
                    display: "block",
                    marginBottom: 7,
                    fontSize: 13,
                  }}
                >
                  Điểm
                </Text>

                <InputNumber
                  min={1}
                  max={100}
                  value={editingQuestion.points}
                  onChange={(val) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      points: val || 10,
                    })
                  }
                  style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 8,
                  }}
                />
              </Col>

              <Col span={16}>
                <Text
                  style={{
                    fontWeight: 700,
                    color: COLORS.text,
                    display: "block",
                    marginBottom: 7,
                    fontSize: 13,
                  }}
                >
                  Giải thích đáp án
                </Text>

                <Input
                  placeholder="Nhập giải thích nếu cần..."
                  value={editingQuestion.explanation}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      explanation: e.target.value,
                    })
                  }
                  style={{
                    borderRadius: 8,
                    height: 40,
                    borderColor: COLORS.border,
                  }}
                />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuizGameEditor;
