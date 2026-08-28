import React, { useEffect, useMemo, useState } from "react";

import {
  Button,
  Card,
  Col,
  ColorPicker,
  Divider,
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
} from "antd";

import {
  ArrowLeft,
  ImagePlus,
  Music,
  Plus,
  Save,
  Trash2,
  Link2,
  Settings,
  Palette,
  FileCheck,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Volume2,
} from "lucide-react";

import { createGame, updateGame, getGameFileUrl } from "../../../api/gameApi";

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * =========================================================
 * DEFAULT PAIRS
 * =========================================================
 */

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

/**
 * =========================================================
 * COLORS
 * =========================================================
 */

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const MatchingGameEditor = ({ teacherId, game = null, onSuccess, onBack }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const [pairs, setPairs] = useState(DEFAULT_PAIRS);

  const [thumbnail, setThumbnail] = useState(null);
  const [background, setBackground] = useState(null);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [correctSound, setCorrectSound] = useState(null);
  const [wrongSound, setWrongSound] = useState(null);

  const [primaryColor, setPrimaryColor] = useState("#6C4BFF");
  const [secondaryColor, setSecondaryColor] = useState("#FFD54F");

  /**
   * Preview selected pair
   */
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);

  const isEdit = Boolean(game);

  /**
   * =========================================================
   * INIT FORM
   * =========================================================
   */

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

      setPrimaryColor("#6C4BFF");
      setSecondaryColor("#FFD54F");

      setThumbnail(null);
      setBackground(null);
      setBackgroundMusic(null);
      setCorrectSound(null);
      setWrongSound(null);

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

    /**
     * Backend:
     *
     * {
     *   pairs: [...]
     * }
     */

    if (Array.isArray(game.pairs) && game.pairs.length > 0) {
      setPairs(game.pairs);
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

  /**
   * =========================================================
   * ADD PAIR
   * =========================================================
   */

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

  /**
   * =========================================================
   * UPDATE PAIR
   * =========================================================
   */

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

  /**
   * =========================================================
   * DELETE PAIR
   * =========================================================
   */

  const removePair = (id) => {
    if (pairs.length <= 2) {
      message.warning("Trò chơi ghép đôi cần ít nhất 2 cặp");

      return;
    }

    setPairs((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * =========================================================
   * TOTAL
   * =========================================================
   */

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

  /**
   * =========================================================
   * FILE UPLOAD
   * =========================================================
   */

  const beforeUpload = (setter) => (file) => {
    setter(file);

    return false;
  };

  /**
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      /**
       * Minimum pairs
       */

      if (pairs.length < 2) {
        message.error("Trò chơi ghép đôi phải có ít nhất 2 cặp");

        return;
      }

      /**
       * Validate pair
       */

      const invalidIndex = pairs.findIndex(
        (item) =>
          !String(item.left || "").trim() || !String(item.right || "").trim(),
      );

      if (invalidIndex !== -1) {
        message.error(`Cặp số ${invalidIndex + 1} chưa nhập đầy đủ hai bên`);

        return;
      }

      setLoading(true);

      /**
       * Normalize pairs
       */

      const normalizedPairs = pairs.map((item, index) => ({
        id: item.id ?? index + 1,

        left: String(item.left || "").trim(),

        right: String(item.right || "").trim(),
      }));

      /**
       * SETTINGS
       */

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

      /**
       * =====================================================
       * GAME DATA
       * =====================================================
       *
       * QUAN TRỌNG:
       *
       * Backend validateMatching()
       * đang đọc:
       *
       * data.pairs
       *
       */

      const gameData = {
        name: String(values.name).trim(),

        description: String(values.description || "").trim(),

        type: "matching",

        backgroundConfig: {
          color: "#F8F9FC",
        },

        theme: {
          primary: primaryColor,

          secondary: secondaryColor,

          font: "Baloo 2",

          borderRadius: 20,
        },

        settings,

        media: {},

        /**
         * Matching data
         */
        pairs: normalizedPairs,

        /**
         * Không dùng questions
         */
        questions: [],

        /**
         * Files
         */
        thumbnail,

        background,

        backgroundMusic,

        correctSound,

        wrongSound,
      };

      /**
       * =====================================================
       * API
       * =====================================================
       */

      const result = isEdit
        ? await updateGame(game.id, gameData)
        : await createGame(gameData);

      if (result?.success) {
        message.success(
          isEdit
            ? "Cập nhật trò chơi ghép đôi thành công"
            : "Tạo trò chơi ghép đôi thành công",
        );

        onSuccess?.(result.data);

        return;
      }

      throw new Error(result?.message || "Không thể lưu trò chơi");
    } catch (error) {
      console.error("MATCHING SAVE ERROR:", error);

      if (!error?.errorFields) {
        message.error(error?.message || "Không thể lưu trò chơi ghép đôi");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * =========================================================
   * RESET PREVIEW
   * =========================================================
   */

  const resetPreview = () => {
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  /**
   * =========================================================
   * FILE COMPONENT
   * =========================================================
   */

  const FileUpload = ({ title, icon, accept, file, setter, existing }) => {
    const existingUrl = existing ? getGameFileUrl(existing) : null;

    return (
      <div
        style={{
          border: "1px dashed #d9d9d9",

          borderRadius: 12,

          padding: 14,

          background: "#fafafa",

          textAlign: "center",

          minHeight: 105,

          display: "flex",

          flexDirection: "column",

          justifyContent: "center",
        }}
      >
        <Space
          style={{
            marginBottom: 8,
            color: "#475569",
          }}
        >
          {icon}

          <Text
            strong
            style={{
              fontSize: 13,
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
              borderRadius: 8,
            }}
          >
            {file ? "Đổi file khác" : "Chọn tệp"}
          </Button>
        </Upload>

        {file ? (
          <div
            style={{
              marginTop: 6,
            }}
          >
            <Tag color="purple" icon={<FileCheck size={12} />}>
              {file.name}
            </Tag>
          </div>
        ) : (
          existingUrl && (
            <div
              style={{
                marginTop: 6,
              }}
            >
              <Tag color="blue">Đang có file sẵn</Tag>
            </div>
          )
        )}
      </div>
    );
  };

  /**
   * =========================================================
   * PREVIEW
   * =========================================================
   */

  const renderPreview = () => {
    if (!pairs.length) {
      return <Empty description="Chưa có cặp dữ liệu" />;
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {pairs.map((pair, index) => {
          return (
            <div
              key={pair.id}
              style={{
                display: "grid",

                gridTemplateColumns: "1fr 40px 1fr",

                gap: 8,

                alignItems: "center",
              }}
            >
              {/* LEFT */}

              <Button
                block
                onClick={() => setSelectedLeft(pair.id)}
                style={{
                  height: 54,

                  borderRadius: 12,

                  textAlign: "left",

                  border:
                    selectedLeft === pair.id
                      ? `2px solid ${primaryColor}`
                      : "1px solid #e2e8f0",

                  background:
                    selectedLeft === pair.id ? `${primaryColor}12` : "#fff",

                  boxShadow:
                    selectedLeft === pair.id
                      ? `0 4px 12px ${primaryColor}20`
                      : "none",

                  whiteSpace: "normal",

                  fontWeight: 600,

                  color: "#1e293b",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",

                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: `${primaryColor}15`,
                      color: primaryColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>

                  <span>{pair.left || "Chưa nhập"}</span>
                </div>
              </Button>

              {/* CONNECTOR */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  color: secondaryColor,
                }}
              >
                <Link2 size={18} />
              </div>

              {/* RIGHT */}

              <Button
                block
                onClick={() => setSelectedRight(pair.id)}
                style={{
                  height: 54,

                  borderRadius: 12,

                  textAlign: "left",

                  border:
                    selectedRight === pair.id
                      ? `2px solid ${secondaryColor}`
                      : "1px solid #e2e8f0",

                  background:
                    selectedRight === pair.id ? `${secondaryColor}20` : "#fff",

                  boxShadow:
                    selectedRight === pair.id
                      ? `0 4px 12px ${secondaryColor}25`
                      : "none",

                  whiteSpace: "normal",

                  fontWeight: 600,

                  color: "#1e293b",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",

                    gap: 8,
                  }}
                >
                  <span>{pair.right || "Chưa nhập"}</span>
                </div>
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      style={{
        background: "#F8F9FC",

        minHeight: "100vh",

        padding: 24,
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

          marginBottom: 24,

          background: "#fff",

          padding: "16px 24px",

          borderRadius: 16,

          boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        }}
      >
        <Space size={16}>
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={onBack}
            style={{
              borderRadius: 10,
            }}
          >
            Quay lại
          </Button>

          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                fontWeight: 700,
              }}
            >
              🔗 {isEdit ? "Chỉnh sửa ghép đôi" : "Tạo trò chơi ghép đôi"}
            </Title>

            <Text
              type="secondary"
              style={{
                fontSize: 13,
              }}
            >
              Tạo trò chơi nối các khái niệm, câu hỏi và đáp án cho học sinh
            </Text>
          </div>
        </Space>

        <Button
          type="primary"
          size="large"
          icon={<Save size={18} />}
          loading={loading}
          onClick={handleSubmit}
          style={{
            borderRadius: 12,

            background: primaryColor,

            fontWeight: 600,

            padding: "0 28px",

            boxShadow: `0 4px 12px ${primaryColor}40`,
          }}
        >
          {isEdit ? "Lưu thay đổi" : "Hoàn tất & Tạo"}
        </Button>
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={[20, 20]}>
          {/* =================================================
              LEFT
          ================================================= */}

          <Col xs={24} lg={15}>
            {/* =================================================
                BASIC
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 18,

                marginBottom: 20,

                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
              }}
            >
              <Title
                level={5}
                style={{
                  marginBottom: 16,

                  display: "flex",

                  alignItems: "center",

                  gap: 8,
                }}
              >
                <Settings size={18} color={primaryColor} />
                Thông tin cơ bản
              </Title>

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
                  size="large"
                  placeholder="Ví dụ: Ghép đôi - Các Bí tích"
                  style={{
                    borderRadius: 10,
                  }}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<Text strong>Mô tả ngắn</Text>}
              >
                <TextArea
                  rows={2}
                  placeholder="Nhập mô tả trò chơi..."
                  style={{
                    borderRadius: 10,
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
                borderRadius: 18,

                marginBottom: 20,

                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
              }}
              title={
                <Space>
                  <Link2 size={18} color={primaryColor} />

                  <span>Các cặp ghép đôi</span>

                  <Tag color="purple">{pairs.length} cặp</Tag>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<Plus size={15} />}
                  onClick={addPair}
                  style={{
                    borderRadius: 10,

                    background: primaryColor,

                    fontWeight: 600,
                  }}
                >
                  Thêm cặp
                </Button>
              }
            >
              {/* PROGRESS */}

              <div
                style={{
                  padding: "12px 16px",

                  borderRadius: 12,

                  background: completionPercent === 100 ? "#f6ffed" : "#fff7e6",

                  border: `1px solid ${
                    completionPercent === 100 ? "#b7eb8f" : "#ffd591"
                  }`,

                  marginBottom: 16,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Text
                    strong
                    style={{
                      color: completionPercent === 100 ? "#389e0d" : "#d48806",
                    }}
                  >
                    {validPairs.length}/{pairs.length} cặp đã hoàn thiện
                  </Text>

                  <Text
                    type="secondary"
                    style={{
                      display: "block",

                      fontSize: 12,
                    }}
                  >
                    Mỗi cặp gồm một nội dung bên trái và một nội dung bên phải
                  </Text>
                </div>

                <Progress
                  type="circle"
                  percent={completionPercent}
                  width={42}
                  strokeColor={
                    completionPercent === 100 ? "#52c41a" : primaryColor
                  }
                />
              </div>

              {/* PAIR LIST */}

              <div
                style={{
                  display: "flex",

                  flexDirection: "column",

                  gap: 12,

                  maxHeight: 500,

                  overflowY: "auto",

                  paddingRight: 4,
                }}
              >
                {pairs.map((pair, index) => (
                  <div
                    key={pair.id}
                    style={{
                      padding: "14px 16px",

                      border: "1px solid #e2e8f0",

                      borderRadius: 14,

                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",

                        justifyContent: "space-between",

                        alignItems: "center",

                        marginBottom: 10,
                      }}
                    >
                      <Space>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: `${primaryColor}15`,
                            color: primaryColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {index + 1}
                        </div>

                        <Text
                          strong
                          style={{
                            fontSize: 13,
                          }}
                        >
                          Cặp {index + 1}
                        </Text>
                      </Space>

                      <Button
                        danger
                        type="text"
                        icon={<Trash2 size={16} />}
                        onClick={() => removePair(pair.id)}
                      />
                    </div>

                    <Row gutter={[12, 12]}>
                      <Col xs={24} sm={11}>
                        <div
                          style={{
                            position: "relative",
                          }}
                        >
                          <Text
                            type="secondary"
                            style={{
                              display: "block",
                              marginBottom: 6,
                              fontSize: 12,
                            }}
                          >
                            Nội dung A
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
                            placeholder="Ví dụ: Bí tích Rửa Tội"
                            style={{
                              borderRadius: 9,
                            }}
                          />
                        </div>
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
                        <Link2 size={20} color={secondaryColor} />
                      </Col>

                      <Col xs={24} sm={11}>
                        <Text
                          type="secondary"
                          style={{
                            display: "block",
                            marginBottom: 6,
                            fontSize: 12,
                          }}
                        >
                          Nội dung B
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
                          placeholder="Ví dụ: Gia nhập Hội Thánh"
                          style={{
                            borderRadius: 9,
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </Card>

            {/* =================================================
                GAME SETTINGS
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 18,

                marginBottom: 20,

                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
              }}
            >
              <Title
                level={5}
                style={{
                  marginBottom: 16,
                }}
              >
                ⚙️ Cấu hình luật chơi
              </Title>

              <Row gutter={[16, 12]}>
                <Col xs={24} md={12}>
                  <Form.Item name="timeLimit" label="Thời gian chơi (giây)">
                    <InputNumber
                      min={10}
                      max={3600}
                      style={{
                        width: "100%",
                        borderRadius: 8,
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <div
                    style={{
                      padding: "8px 0",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Số cặp
                    </Text>

                    <Tag
                      color="purple"
                      style={{
                        fontSize: 14,
                        padding: "4px 12px",
                        borderRadius: 8,
                      }}
                    >
                      {pairs.length} cặp
                    </Tag>
                  </div>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="shuffleQuestions"
                    label="Xáo trộn câu hỏi"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="shuffleAnswers"
                    label="Xáo trộn đáp án"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="showProgress"
                    label="Hiện tiến độ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="showScore"
                    label="Hiện điểm"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="showTimer"
                    label="Hiện đồng hồ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="allowHint"
                    label="Cho phép gợi ý"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="allowSkip"
                    label="Cho phép bỏ qua"
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
                borderRadius: 18,

                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
              }}
            >
              <Title
                level={5}
                style={{
                  marginBottom: 16,
                }}
              >
                🎨 Hình ảnh & Âm thanh
              </Title>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Ảnh Thumbnail"
                    icon={<ImagePlus size={16} />}
                    accept="image/*"
                    file={thumbnail}
                    setter={setThumbnail}
                    existing={game?.thumbnail}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Ảnh Background"
                    icon={<ImagePlus size={16} />}
                    accept="image/*"
                    file={background}
                    setter={setBackground}
                    existing={game?.background?.image}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Nhạc nền"
                    icon={<Music size={16} />}
                    accept="audio/*"
                    file={backgroundMusic}
                    setter={setBackgroundMusic}
                    existing={game?.media?.backgroundMusic}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Âm thanh đúng"
                    icon={<CheckCircle2 size={16} />}
                    accept="audio/*"
                    file={correctSound}
                    setter={setCorrectSound}
                    existing={game?.media?.correctSound}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Âm thanh sai"
                    icon={<Volume2 size={16} />}
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
              RIGHT
          ================================================= */}

          <Col xs={24} lg={9}>
            <div
              style={{
                position: "sticky",
                top: 20,
              }}
            >
              {/* =================================================
                  PREVIEW
              ================================================= */}

              <Card
                bordered={false}
                style={{
                  borderRadius: 18,

                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",

                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center",
                  }}
                >
                  <Space>
                    <Sparkles size={18} color={primaryColor} />

                    <Text
                      strong
                      style={{
                        fontSize: 15,
                      }}
                    >
                      Màn hình xem trước
                    </Text>
                  </Space>

                  <Button
                    size="small"
                    type="dashed"
                    icon={<RotateCcw size={14} />}
                    onClick={resetPreview}
                  >
                    Làm lại
                  </Button>
                </div>

                <Divider
                  style={{
                    margin: "14px 0",
                  }}
                />

                <div
                  style={{
                    background: "#F4F0FF",

                    borderRadius: 16,

                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",

                      marginBottom: 16,
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: 16,
                      }}
                    >
                      🔗 Ghép đôi
                    </Text>

                    <Text
                      type="secondary"
                      style={{
                        display: "block",

                        fontSize: 12,

                        marginTop: 4,
                      }}
                    >
                      Chọn các nội dung tương ứng
                    </Text>
                  </div>

                  {renderPreview()}
                </div>

                {(selectedLeft || selectedRight) && (
                  <div
                    style={{
                      marginTop: 12,

                      padding: 12,

                      borderRadius: 10,

                      background: "#f6ffed",

                      border: "1px solid #b7eb8f",

                      textAlign: "center",
                    }}
                  >
                    <Space size={6}>
                      <CheckCircle2 size={15} color="#52c41a" />

                      <Text
                        style={{
                          fontSize: 12,
                          color: "#389e0d",
                        }}
                      >
                        Đang chọn một phần tử
                      </Text>
                    </Space>
                  </div>
                )}

                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,

                    display: "block",

                    textAlign: "center",

                    marginTop: 12,
                  }}
                >
                  Đây là bản xem trước. Học sinh sẽ được xáo trộn hai cột khi
                  bắt đầu chơi.
                </Text>
              </Card>

              {/* =================================================
                  COLOR
              ================================================= */}

              <Card
                bordered={false}
                style={{
                  borderRadius: 18,

                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                <Title
                  level={5}
                  style={{
                    fontSize: 14,

                    marginBottom: 14,

                    display: "flex",

                    alignItems: "center",

                    gap: 6,
                  }}
                >
                  <Palette size={16} color={primaryColor} />
                  Tùy chỉnh màu sắc
                </Title>

                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <div
                      style={{
                        padding: 10,

                        border: "1px solid #f0f0f0",

                        borderRadius: 10,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,

                          display: "block",
                        }}
                      >
                        Màu chính
                      </Text>

                      <div
                        style={{
                          marginTop: 6,
                        }}
                      >
                        <ColorPicker
                          value={primaryColor}
                          onChange={(color) =>
                            setPrimaryColor(color.toHexString())
                          }
                          showText
                        />
                      </div>
                    </div>
                  </Col>

                  <Col span={12}>
                    <div
                      style={{
                        padding: 10,

                        border: "1px solid #f0f0f0",

                        borderRadius: 10,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,

                          display: "block",
                        }}
                      >
                        Màu phụ
                      </Text>

                      <div
                        style={{
                          marginTop: 6,
                        }}
                      >
                        <ColorPicker
                          value={secondaryColor}
                          onChange={(color) =>
                            setSecondaryColor(color.toHexString())
                          }
                          showText
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                <Divider />

                <div
                  style={{
                    display: "flex",

                    gap: 8,

                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: primaryColor,
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: 12,
                      }}
                    >
                      Màu chính
                    </Text>

                    <Text
                      type="secondary"
                      style={{
                        display: "block",

                        fontSize: 11,
                      }}
                    >
                      {primaryColor}
                    </Text>
                  </div>

                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: secondaryColor,
                    }}
                  />

                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: 12,
                      }}
                    >
                      Màu phụ
                    </Text>

                    <Text
                      type="secondary"
                      style={{
                        display: "block",

                        fontSize: 11,
                      }}
                    >
                      {secondaryColor}
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
