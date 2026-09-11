import React, { useEffect, useMemo, useState } from "react";

import {
  Button,
  Card,
  Col,
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  Typography,
  Upload,
  Progress,
  Tag,
  message,
  Empty,
  Divider,
} from "antd";

import {
  ArrowLeft,
  ImagePlus,
  Music,
  Plus,
  Save,
  Trash2,
  Settings,
  FileCheck,
  RotateCcw,
  Volume2,
  Link2,
  Palette,
  SlidersHorizontal,
  CheckCircle2,
  CircleAlert,
  Eye,
  Timer,
  MousePointer2,
} from "lucide-react";

import { createGame, updateGame, getGameFileUrl } from "../../../api/gameApi";

const { Title, Text } = Typography;
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
   DEFAULT PAIRS
========================================================= */

const DEFAULT_PAIRS = [
  {
    id: 1,
    left: "Thiên Chúa",
    right: "Đấng tạo dựng muôn loài",
  },
  {
    id: 2,
    left: "Đức Giêsu",
    right: "Con Một Thiên Chúa",
  },
  {
    id: 3,
    left: "Kinh Thánh",
    right: "Lời Chúa",
  },
  {
    id: 4,
    left: "Bí tích Rửa Tội",
    right: "Gia nhập Hội Thánh",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const MatchingGameEditor = ({ teacherId, game = null, onSuccess, onBack }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const [pairs, setPairs] = useState(DEFAULT_PAIRS);

  const [thumbnail, setThumbnail] = useState(null);

  const [background, setBackground] = useState(null);

  const [backgroundMusic, setBackgroundMusic] = useState(null);

  const [correctSound, setCorrectSound] = useState(null);

  const [wrongSound, setWrongSound] = useState(null);

  const [primaryColor, setPrimaryColor] = useState(COLORS.navy);

  const [secondaryColor, setSecondaryColor] = useState(COLORS.gold);

  const [selectedLeft, setSelectedLeft] = useState(null);

  const [selectedRight, setSelectedRight] = useState(null);

  const isEdit = Boolean(game);

  /* =========================================================
     INIT FORM
  ========================================================= */

  useEffect(() => {
    if (!game) {
      form.setFieldsValue({
        name: "",
        description: "",
        timeLimit: 60,
        shuffleQuestions: false,
        shuffleAnswers: true,
        showScore: true,
        showTimer: true,
        showProgress: true,
        allowHint: false,
        allowSkip: false,
      });

      setPairs(DEFAULT_PAIRS);

      setPrimaryColor(COLORS.navy);
      setSecondaryColor(COLORS.gold);

      setThumbnail(null);
      setBackground(null);
      setBackgroundMusic(null);
      setCorrectSound(null);
      setWrongSound(null);

      setSelectedLeft(null);
      setSelectedRight(null);

      return;
    }

    const settings = game?.settings || {};

    const theme = game?.theme || {};

    form.setFieldsValue({
      name: game.name || "",

      description: game.description || "",

      timeLimit: settings.timeLimit ?? 60,

      shuffleQuestions: settings.shuffleQuestions ?? false,

      shuffleAnswers: settings.shuffleAnswers ?? true,

      showScore: settings.showScore !== undefined ? settings.showScore : true,

      showTimer: settings.showTimer !== undefined ? settings.showTimer : true,

      showProgress:
        settings.showProgress !== undefined ? settings.showProgress : true,

      allowHint: settings.allowHint ?? false,

      allowSkip: settings.allowSkip ?? false,
    });

    if (Array.isArray(game.pairs) && game.pairs.length > 0) {
      setPairs(game.pairs);
    } else {
      setPairs(DEFAULT_PAIRS);
    }

    if (theme.primary) {
      setPrimaryColor(theme.primary);
    }

    if (theme.secondary) {
      setSecondaryColor(theme.secondary);
    }

    setThumbnail(null);
    setBackground(null);
    setBackgroundMusic(null);
    setCorrectSound(null);
    setWrongSound(null);

    setSelectedLeft(null);
    setSelectedRight(null);
  }, [game, form]);

  /* =========================================================
     ADD PAIR
  ========================================================= */

  const addPair = () => {
    const newId =
      pairs.length > 0
        ? Math.max(...pairs.map((item) => Number(item.id) || 0)) + 1
        : 1;

    setPairs((prev) => [
      ...prev,
      {
        id: newId,
        left: "",
        right: "",
      },
    ]);
  };

  /* =========================================================
     UPDATE PAIR
  ========================================================= */

  const updatePair = (id, field, value) => {
    setPairs((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  /* =========================================================
     DELETE PAIR
  ========================================================= */

  const removePair = (id) => {
    if (pairs.length <= 2) {
      message.warning("Trò chơi ghép đôi cần ít nhất 2 cặp.");
      return;
    }

    setPairs((prev) => prev.filter((item) => item.id !== id));
  };

  /* =========================================================
     VALID PAIRS
  ========================================================= */

  const validPairs = useMemo(() => {
    return pairs.filter(
      (item) =>
        String(item.left || "").trim() && String(item.right || "").trim(),
    );
  }, [pairs]);

  const completionPercent = useMemo(() => {
    if (!pairs.length) return 0;

    return Math.round((validPairs.length / pairs.length) * 100);
  }, [pairs.length, validPairs.length]);

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  const beforeUpload = (setter) => (file) => {
    setter(file);
    return false;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (pairs.length < 2) {
        message.error("Trò chơi ghép đôi phải có ít nhất 2 cặp.");
        return;
      }

      const invalidIndex = pairs.findIndex(
        (item) =>
          !String(item.left || "").trim() || !String(item.right || "").trim(),
      );

      if (invalidIndex !== -1) {
        message.error(`Cặp số ${invalidIndex + 1} chưa nhập đầy đủ hai bên.`);
        return;
      }

      setLoading(true);

      const normalizedPairs = pairs.map((item, index) => ({
        id: item.id ?? index + 1,

        left: String(item.left || "").trim(),

        right: String(item.right || "").trim(),
      }));

      const settings = {
        timeLimit: Number(values.timeLimit || 60),

        shuffleQuestions: Boolean(values.shuffleQuestions),

        shuffleAnswers: Boolean(values.shuffleAnswers),

        showScore:
          values.showScore !== undefined ? Boolean(values.showScore) : true,

        showTimer:
          values.showTimer !== undefined ? Boolean(values.showTimer) : true,

        showProgress:
          values.showProgress !== undefined
            ? Boolean(values.showProgress)
            : true,

        allowHint: Boolean(values.allowHint),

        allowSkip: Boolean(values.allowSkip),
      };

      const gameData = {
        name: String(values.name).trim(),

        description: String(values.description || "").trim(),

        type: "matching",

        backgroundConfig: {
          color: "#EEF3F7",
        },

        theme: {
          primary: primaryColor,

          secondary: secondaryColor,

          font: "Be Vietnam Pro",

          borderRadius: 12,
        },

        settings,

        media: {},

        pairs: normalizedPairs,

        questions: [],

        thumbnail,

        background,

        backgroundMusic,

        correctSound,

        wrongSound,
      };

      const result = isEdit
        ? await updateGame(game.id, gameData)
        : await createGame(gameData);

      if (result?.success) {
        message.success(
          isEdit
            ? "Cập nhật trò chơi ghép đôi thành công."
            : "Tạo trò chơi ghép đôi thành công.",
        );

        onSuccess?.(result.data);

        return;
      }

      throw new Error(result?.message || "Không thể lưu trò chơi.");
    } catch (error) {
      console.error("MATCHING SAVE ERROR:", error);

      if (!error?.errorFields) {
        message.error(error?.message || "Không thể lưu trò chơi ghép đôi.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RESET PREVIEW
  ========================================================= */

  const resetPreview = () => {
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  /* =========================================================
     FILE UPLOAD BOX
  ========================================================= */

  const FileUploadBox = ({ title, icon, accept, file, setter, existing }) => {
    const existingUrl = existing ? getGameFileUrl(existing) : null;

    return (
      <div
        style={{
          border: `1px dashed ${COLORS.border}`,

          borderRadius: 10,

          padding: 12,

          background: COLORS.background,

          textAlign: "center",

          minHeight: 108,

          display: "flex",

          flexDirection: "column",

          justifyContent: "center",

          transition: "all 0.2s ease",
        }}
      >
        <Space
          style={{
            marginBottom: 7,
            color: COLORS.textSecondary,
            justifyContent: "center",
          }}
        >
          {icon}

          <Text
            strong
            style={{
              fontSize: 12,
              color: COLORS.text,
            }}
          >
            {title}
          </Text>
        </Space>

        <Upload
          maxCount={1}
          beforeUpload={beforeUpload(setter)}
          showUploadList={false}
          accept={accept}
        >
          <Button
            size="small"
            style={{
              height: 30,
              borderRadius: 7,
              background: COLORS.white,
              borderColor: COLORS.border,
              color: COLORS.navy,
              fontWeight: 650,
            }}
          >
            {file ? "Đổi file" : "Chọn tệp"}
          </Button>
        </Upload>

        {file ? (
          <div
            style={{
              marginTop: 5,
            }}
          >
            <Tag
              icon={<FileCheck size={11} />}
              style={{
                margin: 0,
                background: COLORS.successBg,
                border: "1px solid #C8E6D7",
                color: COLORS.success,
                borderRadius: 5,
                fontSize: 10,
              }}
            >
              {file.name}
            </Tag>
          </div>
        ) : (
          existingUrl && (
            <div
              style={{
                marginTop: 5,
              }}
            >
              <Tag
                style={{
                  margin: 0,
                  background: COLORS.navyLight,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.navy,
                  borderRadius: 5,
                  fontSize: 10,
                }}
              >
                Đã có tệp
              </Tag>
            </div>
          )
        )}
      </div>
    );
  };

  /* =========================================================
     PREVIEW
  ========================================================= */

  const renderPreview = () => {
    if (!pairs.length) {
      return <Empty description="Chưa có dữ liệu" />;
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {pairs.map((pair, index) => (
          <div
            key={pair.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 32px 1fr",
              gap: 7,
              alignItems: "center",
            }}
          >
            {/* LEFT */}

            <Button
              block
              onClick={() => setSelectedLeft(pair.id)}
              style={{
                height: 54,
                borderRadius: 9,

                textAlign: "left",

                border:
                  selectedLeft === pair.id
                    ? `2px solid ${primaryColor}`
                    : `1px solid ${COLORS.border}`,

                background:
                  selectedLeft === pair.id ? COLORS.navyLight : COLORS.white,

                boxShadow:
                  selectedLeft === pair.id
                    ? "0 3px 10px rgba(23,59,94,0.10)"
                    : "none",

                whiteSpace: "normal",

                fontWeight: 600,

                color: COLORS.text,

                transition: "all 0.18s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background:
                      selectedLeft === pair.id ? COLORS.navy : COLORS.navyLight,

                    color:
                      selectedLeft === pair.id ? COLORS.white : COLORS.navy,

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    fontSize: 11,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>

                <span>{pair.left || "Chưa nhập..."}</span>
              </div>
            </Button>

            {/* CONNECTOR */}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: COLORS.gold,
              }}
            >
              <Link2 size={17} strokeWidth={2.2} />
            </div>

            {/* RIGHT */}

            <Button
              block
              onClick={() => setSelectedRight(pair.id)}
              style={{
                height: 54,
                borderRadius: 9,

                textAlign: "left",

                border:
                  selectedRight === pair.id
                    ? `2px solid ${secondaryColor}`
                    : `1px solid ${COLORS.border}`,

                background:
                  selectedRight === pair.id ? COLORS.goldLight : COLORS.white,

                boxShadow:
                  selectedRight === pair.id
                    ? "0 3px 10px rgba(217,164,65,0.12)"
                    : "none",

                whiteSpace: "normal",

                fontWeight: 600,

                color: COLORS.text,

                transition: "all 0.18s",
              }}
            >
              <span>{pair.right || "Chưa nhập..."}</span>
            </Button>
          </div>
        ))}
      </div>
    );
  };

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div
      style={{
        background: COLORS.background,

        minHeight: "100vh",

        padding: 20,

        fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",

          marginBottom: 18,

          background: COLORS.white,

          padding: "15px 20px",

          borderRadius: 13,

          border: `1px solid ${COLORS.border}`,

          boxShadow: "0 3px 12px rgba(23,59,94,0.04)",

          gap: 16,

          flexWrap: "wrap",
        }}
      >
        <Space size={13}>
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={onBack}
            style={{
              height: 38,
              borderRadius: 8,
              borderColor: COLORS.border,
              color: COLORS.navy,
              fontWeight: 650,
            }}
          >
            Quay lại
          </Button>

          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 9,
              background: COLORS.navyLight,
              color: COLORS.navy,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Link2 size={21} strokeWidth={2} />
          </div>

          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                fontWeight: 750,
                color: COLORS.navy,
                fontSize: 17,
              }}
            >
              {isEdit ? "Chỉnh sửa trò chơi ghép đôi" : "Tạo trò chơi ghép đôi"}
            </Title>

            <Text
              style={{
                fontSize: 11.5,
                color: COLORS.textSecondary,
              }}
            >
              Thiết lập các cặp nội dung và luật chơi
            </Text>
          </div>
        </Space>

        <Button
          type="primary"
          size="large"
          icon={<Save size={17} />}
          loading={loading}
          onClick={handleSubmit}
          style={{
            height: 40,
            borderRadius: 8,
            background: COLORS.navy,
            borderColor: COLORS.navy,
            fontWeight: 700,
            padding: "0 22px",
            boxShadow: "0 4px 12px rgba(23,59,94,0.15)",
          }}
        >
          {isEdit ? "Lưu thay đổi" : "Tạo trò chơi"}
        </Button>
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={[18, 18]}>
          {/* =================================================
              LEFT
          ================================================= */}

          <Col xs={24} lg={14}>
            {/* BASIC INFO */}

            <Card
              bordered={false}
              style={{
                borderRadius: 13,
                marginBottom: 18,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 3px 12px rgba(23,59,94,0.035)",
              }}
              styles={{
                body: {
                  padding: 19,
                },
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 17,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    background: COLORS.navyLight,
                    color: COLORS.navy,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Settings size={17} />
                </div>

                <div>
                  <div
                    style={{
                      color: COLORS.navy,
                      fontWeight: 750,
                      fontSize: 14,
                    }}
                  >
                    Thông tin cơ bản
                  </div>

                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: 11,
                    }}
                  >
                    Thông tin hiển thị của trò chơi
                  </div>
                </div>
              </div>

              <Form.Item
                name="name"
                label={
                  <Text
                    strong
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    Tên trò chơi
                  </Text>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên trò chơi.",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nhập tên trò chơi..."
                  style={{
                    borderRadius: 8,
                    background: COLORS.background,
                  }}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <Text
                    strong
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    Mô tả
                  </Text>
                }
                style={{
                  marginBottom: 0,
                }}
              >
                <TextArea
                  rows={3}
                  placeholder="Nhập mô tả ngắn cho trò chơi..."
                  style={{
                    borderRadius: 8,
                    background: COLORS.background,
                  }}
                />
              </Form.Item>
            </Card>

            {/* =================================================
                PAIRS
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 13,
                marginBottom: 18,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 3px 12px rgba(23,59,94,0.035)",
              }}
              styles={{
                body: {
                  padding: 19,
                },
              }}
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                  }}
                >
                  <Link2 size={18} color={COLORS.navy} />

                  <span
                    style={{
                      color: COLORS.navy,
                      fontWeight: 750,
                    }}
                  >
                    Các cặp nối
                  </span>

                  <Tag
                    style={{
                      margin: 0,
                      background: COLORS.navyLight,
                      color: COLORS.navy,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 5,
                      fontWeight: 700,
                    }}
                  >
                    {pairs.length} cặp
                  </Tag>
                </div>
              }
              extra={
                <Button
                  type="primary"
                  icon={<Plus size={15} />}
                  onClick={addPair}
                  style={{
                    height: 34,
                    borderRadius: 7,
                    background: COLORS.navy,
                    borderColor: COLORS.navy,
                    fontWeight: 650,
                  }}
                >
                  Thêm cặp
                </Button>
              }
            >
              {/* COMPLETION */}

              <div
                style={{
                  padding: "12px 14px",

                  borderRadius: 9,

                  background:
                    completionPercent === 100
                      ? COLORS.successBg
                      : COLORS.navyLight,

                  border: `1px solid ${
                    completionPercent === 100 ? "#C8E6D7" : COLORS.border
                  }`,

                  marginBottom: 14,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Text
                    strong
                    style={{
                      color:
                        completionPercent === 100
                          ? COLORS.success
                          : COLORS.navy,
                      fontSize: 12.5,
                    }}
                  >
                    {completionPercent === 100 ? (
                      <CheckCircle2
                        size={14}
                        style={{
                          marginRight: 5,
                          verticalAlign: "middle",
                        }}
                      />
                    ) : (
                      <CircleAlert
                        size={14}
                        style={{
                          marginRight: 5,
                          verticalAlign: "middle",
                        }}
                      />
                    )}
                    {validPairs.length}/{pairs.length} cặp đã hoàn chỉnh
                  </Text>

                  <Text
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: COLORS.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Mỗi nội dung bên trái sẽ nối với một đáp án bên phải.
                  </Text>
                </div>

                <Progress
                  type="circle"
                  percent={completionPercent}
                  width={42}
                  strokeColor={
                    completionPercent === 100 ? COLORS.success : COLORS.navy
                  }
                  trailColor={COLORS.border}
                />
              </div>

              {/* PAIR LIST */}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,

                  maxHeight: 520,

                  overflowY: "auto",

                  paddingRight: 3,
                }}
              >
                {pairs.map((pair, index) => (
                  <div
                    key={pair.id}
                    style={{
                      padding: "13px 14px",

                      border: `1px solid ${COLORS.border}`,

                      borderRadius: 10,

                      background: COLORS.white,

                      transition: "all 0.18s ease",
                    }}
                  >
                    {/* PAIR HEADER */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Space size={8}>
                        <div
                          style={{
                            width: 29,
                            height: 29,
                            borderRadius: 7,

                            background: COLORS.navy,

                            color: COLORS.white,

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            fontWeight: 750,

                            fontSize: 11,
                          }}
                        >
                          {index + 1}
                        </div>

                        <Text
                          strong
                          style={{
                            color: COLORS.text,
                            fontSize: 12.5,
                          }}
                        >
                          Cặp số {index + 1}
                        </Text>
                      </Space>

                      <Button
                        danger
                        type="text"
                        icon={<Trash2 size={15} />}
                        onClick={() => removePair(pair.id)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 7,
                          background: COLORS.dangerBg,
                        }}
                      />
                    </div>

                    {/* PAIR CONTENT */}

                    <Row gutter={[10, 10]}>
                      <Col xs={24} sm={11}>
                        <Text
                          style={{
                            display: "block",
                            marginBottom: 5,
                            fontSize: 11,
                            fontWeight: 650,
                            color: COLORS.textSecondary,
                          }}
                        >
                          Nội dung bên trái
                        </Text>

                        <Input.TextArea
                          value={pair.left}
                          onChange={(e) =>
                            updatePair(pair.id, "left", e.target.value)
                          }
                          autoSize={{
                            minRows: 2,
                            maxRows: 4,
                          }}
                          placeholder="Nhập nội dung..."
                          style={{
                            borderRadius: 8,
                            background: COLORS.background,
                          }}
                        />
                      </Col>

                      <Col
                        xs={24}
                        sm={2}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: COLORS.goldLight,
                            color: COLORS.gold,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Link2 size={14} />
                        </div>
                      </Col>

                      <Col xs={24} sm={11}>
                        <Text
                          style={{
                            display: "block",
                            marginBottom: 5,
                            fontSize: 11,
                            fontWeight: 650,
                            color: COLORS.textSecondary,
                          }}
                        >
                          Đáp án bên phải
                        </Text>

                        <Input.TextArea
                          value={pair.right}
                          onChange={(e) =>
                            updatePair(pair.id, "right", e.target.value)
                          }
                          autoSize={{
                            minRows: 2,
                            maxRows: 4,
                          }}
                          placeholder="Nhập đáp án..."
                          style={{
                            borderRadius: 8,
                            background: COLORS.background,
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </Card>

            {/* =================================================
                THEME + SETTINGS
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 13,
                marginBottom: 18,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 3px 12px rgba(23,59,94,0.035)",
              }}
              styles={{
                body: {
                  padding: 19,
                },
              }}
            >
              {/* THEME */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    background: COLORS.goldLight,
                    color: COLORS.gold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Palette size={17} />
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 750,
                      color: COLORS.navy,
                      fontSize: 14,
                    }}
                  >
                    Giao diện
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: COLORS.muted,
                    }}
                  >
                    Thiết lập màu sắc cho trò chơi
                  </div>
                </div>
              </div>

              <Row gutter={20}>
                <Col span={12}>
                  <Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: 7,
                      color: COLORS.text,
                      fontSize: 12,
                    }}
                  >
                    Màu chủ đạo
                  </Text>

                  <ColorPicker
                    value={primaryColor}
                    onChange={(color) => setPrimaryColor(color.toHexString())}
                    showText
                  />
                </Col>

                <Col span={12}>
                  <Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: 7,
                      color: COLORS.text,
                      fontSize: 12,
                    }}
                  >
                    Màu phụ
                  </Text>

                  <ColorPicker
                    value={secondaryColor}
                    onChange={(color) => setSecondaryColor(color.toHexString())}
                    showText
                  />
                </Col>
              </Row>

              <Divider
                style={{
                  margin: "20px 0",
                  borderColor: COLORS.border,
                }}
              />

              {/* SETTINGS */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    background: COLORS.navyLight,
                    color: COLORS.navy,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SlidersHorizontal size={17} />
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 750,
                      color: COLORS.navy,
                      fontSize: 14,
                    }}
                  >
                    Cài đặt trò chơi
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: COLORS.muted,
                    }}
                  >
                    Điều chỉnh cách trò chơi hoạt động
                  </div>
                </div>
              </div>

              <Row gutter={[14, 4]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="timeLimit"
                    label={
                      <Text
                        strong
                        style={{
                          color: COLORS.text,
                        }}
                      >
                        Thời gian làm bài
                      </Text>
                    }
                  >
                    <InputNumber
                      min={10}
                      max={3600}
                      addonAfter="giây"
                      style={{
                        width: "100%",
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Item
                    name="shuffleQuestions"
                    label="Trộn câu hỏi"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Item
                    name="shuffleAnswers"
                    label="Trộn đáp án"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="showProgress"
                    label="Hiển thị tiến độ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="showScore"
                    label="Hiển thị điểm"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="showTimer"
                    label="Đồng hồ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* =================================================
                MEDIA
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 13,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 3px 12px rgba(23,59,94,0.035)",
              }}
              styles={{
                body: {
                  padding: 19,
                },
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    background: COLORS.goldLight,
                    color: COLORS.gold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Volume2 size={17} />
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 750,
                      color: COLORS.navy,
                      fontSize: 14,
                    }}
                  >
                    Hình ảnh & âm thanh
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: COLORS.muted,
                    }}
                  >
                    Tùy chọn media cho trò chơi
                  </div>
                </div>
              </div>

              <Row gutter={[10, 10]}>
                <Col xs={12} sm={8}>
                  <FileUploadBox
                    title="Ảnh thu nhỏ"
                    icon={<ImagePlus size={15} />}
                    accept="image/*"
                    file={thumbnail}
                    setter={setThumbnail}
                    existing={game?.thumbnail}
                  />
                </Col>

                <Col xs={12} sm={8}>
                  <FileUploadBox
                    title="Hình nền"
                    icon={<ImagePlus size={15} />}
                    accept="image/*"
                    file={background}
                    setter={setBackground}
                    existing={game?.background}
                  />
                </Col>

                <Col xs={12} sm={8}>
                  <FileUploadBox
                    title="Nhạc nền"
                    icon={<Music size={15} />}
                    accept="audio/*"
                    file={backgroundMusic}
                    setter={setBackgroundMusic}
                    existing={game?.media?.backgroundMusic}
                  />
                </Col>

                <Col xs={12} sm={12}>
                  <FileUploadBox
                    title="Âm thanh đúng"
                    icon={<Volume2 size={15} />}
                    accept="audio/*"
                    file={correctSound}
                    setter={setCorrectSound}
                    existing={game?.media?.correctSound}
                  />
                </Col>

                <Col xs={12} sm={12}>
                  <FileUploadBox
                    title="Âm thanh sai"
                    icon={<Volume2 size={15} />}
                    accept="audio/*"
                    file={wrongSound}
                    setter={setWrongSound}
                    existing={game?.media?.wrongSound}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* =================================================
              RIGHT PREVIEW
          ================================================= */}

          <Col xs={24} lg={10}>
            <div
              style={{
                position: "sticky",
                top: 20,
              }}
            >
              <Card
                bordered={false}
                style={{
                  borderRadius: 13,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 4px 15px rgba(23,59,94,0.05)",
                }}
                styles={{
                  body: {
                    padding: 16,
                  },
                }}
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Space size={8}>
                      <Eye size={17} color={COLORS.navy} />

                      <span
                        style={{
                          color: COLORS.navy,
                          fontWeight: 750,
                          fontSize: 14,
                        }}
                      >
                        Xem trước
                      </span>
                    </Space>

                    <Button
                      size="small"
                      icon={<RotateCcw size={13} />}
                      onClick={resetPreview}
                      style={{
                        height: 29,
                        borderRadius: 7,
                        borderColor: COLORS.border,
                        color: COLORS.navy,
                      }}
                    >
                      Làm mới
                    </Button>
                  </div>
                }
              >
                {/* PREVIEW GAME */}

                <div
                  style={{
                    background: COLORS.navyLight,

                    borderRadius: 11,

                    padding: 15,

                    minHeight: 450,

                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  {/* PREVIEW TITLE */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 15,
                    }}
                  >
                    <Tag
                      icon={<Link2 size={12} />}
                      style={{
                        margin: 0,
                        background: COLORS.white,
                        color: COLORS.navy,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 6,
                        fontWeight: 700,
                      }}
                    >
                      Ghép đôi
                    </Tag>

                    <Tag
                      icon={<Timer size={12} />}
                      style={{
                        margin: 0,
                        background: COLORS.white,
                        color: COLORS.textSecondary,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 6,
                        fontWeight: 650,
                      }}
                    >
                      {form.getFieldValue("timeLimit") || 60}s
                    </Tag>
                  </div>

                  <Title
                    level={4}
                    style={{
                      textAlign: "center",
                      color: COLORS.navy,
                      fontWeight: 800,
                      fontSize: 18,
                      margin: "0 0 16px",
                    }}
                  >
                    {form.getFieldValue("name") || "Tên trò chơi"}
                  </Title>

                  {/* INSTRUCTION */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      color: COLORS.textSecondary,
                      fontSize: 11,
                      marginBottom: 12,
                    }}
                  >
                    <MousePointer2 size={13} />
                    Chọn nội dung tương ứng ở hai bên
                  </div>

                  {renderPreview()}

                  {/* SCORE */}

                  <div
                    style={{
                      marginTop: 15,
                      paddingTop: 12,
                      borderTop: `1px solid ${COLORS.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.textSecondary,
                        fontSize: 11,
                      }}
                    >
                      Tiến độ
                    </Text>

                    <Text
                      strong
                      style={{
                        color: COLORS.navy,
                        fontSize: 12,
                      }}
                    >
                      {validPairs.length}/{pairs.length}
                    </Text>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default MatchingGameEditor;
