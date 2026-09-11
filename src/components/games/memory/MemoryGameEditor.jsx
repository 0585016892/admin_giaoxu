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
  Tag,
  Typography,
  Upload,
  message,
  Modal,
  Empty,
  Segmented,
} from "antd";

import {
  ArrowLeft,
  Brain,
  ImagePlus,
  Music,
  Plus,
  Save,
  Trash2,
  Settings,
  Palette,
  PlayCircle,
  FileCheck,
  RotateCcw,
  Type,
  Image as ImageIcon,
  Layers3,
  Trophy,
  Timer,
  BarChart3,
  Lightbulb,
  SkipForward,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { createGame, updateGame } from "../../../api/gameApi";

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

  gray: "#64748B",
  grayBg: "#F1F5F9",

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

/* =========================================================
   API URL
========================================================= */

const API_URL = process.env.REACT_APP_API_URL || "";

/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_CARDS = [
  {
    id: 1,
    type: "text",
    content: "Chúa Giêsu",
    image: null,
    pairId: 1,
  },
  {
    id: 2,
    type: "text",
    content: "Con Thiên Chúa",
    image: null,
    pairId: 1,
  },
  {
    id: 3,
    type: "text",
    content: "Kinh Thánh",
    image: null,
    pairId: 2,
  },
  {
    id: 4,
    type: "text",
    content: "Lời Chúa",
    image: null,
    pairId: 2,
  },
];

/* =========================================================
   URL HELPERS
========================================================= */

const getFileUrl = (file) => {
  if (!file) return null;

  if (file instanceof File || file instanceof Blob) {
    return URL.createObjectURL(file);
  }

  if (typeof file === "string") {
    if (
      file.startsWith("http://") ||
      file.startsWith("https://") ||
      file.startsWith("blob:")
    ) {
      return file;
    }

    const normalized = file.startsWith("/") ? file : `/${file}`;

    return `${API_URL}${normalized}`;
  }

  if (typeof file === "object") {
    const possibleUrl =
      file.url ||
      file.path ||
      file.location ||
      file.response?.url ||
      file.response?.path ||
      file.response?.data?.url ||
      file.response?.data?.path;

    if (possibleUrl) {
      return getFileUrl(possibleUrl);
    }
  }

  return null;
};

const getFileName = (file) => {
  if (!file) return "";

  if (typeof file === "string") {
    return file.split("/").pop();
  }

  if (file.name) return file.name;

  return "File";
};

/* =========================================================
   COMPONENT
========================================================= */

const MemoryGameEditor = ({ teacherId, game = null, onSuccess, onBack }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const [cards, setCards] = useState(DEFAULT_CARDS);

  const [primaryColor, setPrimaryColor] = useState(COLORS.navy);
  const [secondaryColor, setSecondaryColor] = useState(COLORS.gold);
  const [backgroundColor, setBackgroundColor] = useState(COLORS.background);

  const [thumbnail, setThumbnail] = useState(null);
  const [background, setBackground] = useState(null);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [correctSound, setCorrectSound] = useState(null);
  const [wrongSound, setWrongSound] = useState(null);

  const [previewCards, setPreviewCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  const isEdit = Boolean(game);

  /* =========================================================
     LOAD GAME
  ========================================================= */

  useEffect(() => {
    if (!game) {
      form.setFieldsValue({
        name: "",
        description: "",
        timeLimit: 120,

        shuffleQuestions: true,
        shuffleAnswers: true,

        showScore: true,
        showTimer: true,
        showProgress: true,

        allowHint: true,
        allowSkip: false,
      });

      setCards(DEFAULT_CARDS);

      setPrimaryColor(COLORS.navy);
      setSecondaryColor(COLORS.gold);
      setBackgroundColor(COLORS.background);

      setThumbnail(null);
      setBackground(null);
      setBackgroundMusic(null);
      setCorrectSound(null);
      setWrongSound(null);

      return;
    }

    const settings = game?.settings || {};
    const theme = game?.theme || {};
    const gameBackground = game?.background || {};

    form.setFieldsValue({
      name: game?.name || "",
      description: game?.description || "",

      timeLimit: settings.timeLimit ?? 120,

      shuffleQuestions: settings.shuffleQuestions ?? true,
      shuffleAnswers: settings.shuffleAnswers ?? true,

      showScore: settings.showScore ?? true,
      showTimer: settings.showTimer ?? true,
      showProgress: settings.showProgress ?? true,

      allowHint: settings.allowHint ?? true,
      allowSkip: settings.allowSkip ?? false,
    });

    if (Array.isArray(game?.cards) && game.cards.length > 0) {
      setCards(
        game.cards.map((card) => ({
          id: Number(card.id),
          type: card.type || (card.image ? "image" : "text"),
          content: card.content || "",
          image: card.image || null,
          pairId: Number(card.pairId),
        })),
      );
    } else {
      setCards([]);
    }

    setPrimaryColor(theme.primary || COLORS.navy);
    setSecondaryColor(theme.secondary || COLORS.gold);

    setBackgroundColor(gameBackground.color || COLORS.background);

    setThumbnail(null);
    setBackground(null);
    setBackgroundMusic(null);
    setCorrectSound(null);
    setWrongSound(null);

    setPreviewCards([]);
    setFlipped([]);
    setMatched([]);
  }, [game, form]);

  /* =========================================================
     CARD ID
  ========================================================= */

  const getNextCardId = () => {
    if (!cards.length) return 1;

    return Math.max(...cards.map((card) => Number(card.id) || 0)) + 1;
  };

  /* =========================================================
     PAIR ID
  ========================================================= */

  const getNextPairId = () => {
    if (!cards.length) return 1;

    return Math.max(...cards.map((card) => Number(card.pairId) || 0)) + 1;
  };

  /* =========================================================
     ADD PAIR
  ========================================================= */

  const addPair = () => {
    const pairId = getNextPairId();

    const firstId = getNextCardId();
    const secondId = firstId + 1;

    setCards((prev) => [
      ...prev,
      {
        id: firstId,
        type: "text",
        content: `Mặt A - Cặp ${pairId}`,
        image: null,
        pairId,
      },
      {
        id: secondId,
        type: "text",
        content: `Mặt B - Cặp ${pairId}`,
        image: null,
        pairId,
      },
    ]);
  };

  /* =========================================================
     REMOVE PAIR
  ========================================================= */

  const removeCard = (id) => {
    const target = cards.find((card) => Number(card.id) === Number(id));

    if (!target) return;

    Modal.confirm({
      title: "Xóa cặp thẻ?",
      content: "Thẻ này thuộc một cặp. Xóa thẻ này sẽ xóa cả 2 thẻ trong cặp.",
      okText: "Xóa cả cặp",
      cancelText: "Hủy",

      okButtonProps: {
        danger: true,
      },

      onOk: () => {
        setCards((prev) =>
          prev.filter((card) => Number(card.pairId) !== Number(target.pairId)),
        );
      },
    });
  };

  /* =========================================================
     UPDATE CARD
  ========================================================= */

  const updateCard = (id, field, value) => {
    setCards((prev) =>
      prev.map((card) =>
        Number(card.id) === Number(id)
          ? {
              ...card,
              [field]: value,
            }
          : card,
      ),
    );
  };

  /* =========================================================
     GROUP PAIRS
  ========================================================= */

  const pairs = useMemo(() => {
    const map = new Map();

    cards.forEach((card) => {
      const pairId = Number(card.pairId);

      if (!map.has(pairId)) {
        map.set(pairId, []);
      }

      map.get(pairId).push(card);
    });

    return Array.from(map.entries()).map(([pairId, pairCards]) => ({
      pairId,
      cards: pairCards,
    }));
  }, [cards]);

  /* =========================================================
     VALIDATE
  ========================================================= */

  const validateCards = () => {
    if (!cards.length) {
      throw new Error("Vui lòng tạo ít nhất 1 cặp thẻ");
    }

    if (cards.length % 2 !== 0) {
      throw new Error("Số lượng thẻ phải là số chẵn");
    }

    const pairMap = new Map();

    cards.forEach((card, index) => {
      if (!card.pairId) {
        throw new Error(`Thẻ ${index + 1} thiếu Cặp ID`);
      }

      if (card.type === "text") {
        if (!String(card.content || "").trim()) {
          throw new Error(`Thẻ ${index + 1} chưa nhập nội dung`);
        }
      }

      if (card.type === "image") {
        if (!card.image) {
          throw new Error(`Thẻ ${index + 1} chưa chọn ảnh`);
        }
      }

      const pairId = Number(card.pairId);

      pairMap.set(pairId, (pairMap.get(pairId) || 0) + 1);
    });

    for (const [pairId, count] of pairMap) {
      if (count !== 2) {
        throw new Error(`Cặp ${pairId} phải có đúng 2 thẻ`);
      }
    }
  };

  /* =========================================================
     BUILD CARD DATA
  ========================================================= */

  const buildCards = () => {
    return cards.map((card) => {
      let image = null;

      if (card.type === "image") {
        if (card.image instanceof File) {
          image = card.image;
        } else if (card.image?.originFileObj instanceof File) {
          image = card.image.originFileObj;
        } else if (typeof card.image === "string") {
          image = card.image;
        } else if (card.image?.url) {
          image = card.image.url;
        } else if (card.image?.path) {
          image = card.image.path;
        }
      }

      return {
        id: Number(card.id),
        type: card.type,
        content: card.type === "text" ? card.content || "" : "",
        image,
        pairId: Number(card.pairId),
      };
    });
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      validateCards();

      setLoading(true);

      const memoryCards = buildCards();

      const backgroundImage = background || game?.background?.image || null;

      const finalBackgroundMusic =
        backgroundMusic || game?.media?.backgroundMusic || null;

      const finalCorrectSound =
        correctSound || game?.media?.correctSound || null;

      const finalWrongSound = wrongSound || game?.media?.wrongSound || null;

      const finalThumbnail = thumbnail || game?.thumbnail || null;

      const gameData = {
        teacher_id: teacherId,

        name: values.name,

        description: values.description || "",

        type: "memory",

        backgroundConfig: {
          color: backgroundColor,
          image: backgroundImage,
        },

        theme: {
          primary: primaryColor,
          secondary: secondaryColor,
          font: "Baloo 2",
          borderRadius: 20,
        },

        settings: {
          timeLimit: Number(values.timeLimit || 120),

          shuffleQuestions: Boolean(values.shuffleQuestions),

          shuffleAnswers: Boolean(values.shuffleAnswers),

          showScore: Boolean(values.showScore),

          showTimer: Boolean(values.showTimer),

          showProgress: Boolean(values.showProgress),

          allowHint: Boolean(values.allowHint),

          allowSkip: Boolean(values.allowSkip),
        },

        questions: [],

        cards: memoryCards,

        thumbnail: finalThumbnail,

        background: background instanceof File ? background : null,

        backgroundMusic: finalBackgroundMusic,

        correctSound: finalCorrectSound,

        wrongSound: finalWrongSound,
      };

      console.log("MEMORY GAME DATA:", gameData);

      let result;

      if (isEdit) {
        result = await updateGame(game.id, gameData);
      } else {
        result = await createGame(gameData);
      }

      if (result?.success) {
        message.success(
          isEdit ? "Cập nhật game thành công" : "Tạo game thành công",
        );

        onSuccess?.(result.data);
      } else {
        throw new Error(result?.message || "Không thể lưu game");
      }
    } catch (error) {
      console.error("SAVE MEMORY GAME ERROR:", error);

      if (!error?.errorFields) {
        message.error(error?.message || "Không thể lưu game ghi nhớ");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PREVIEW
  ========================================================= */

  const startPreview = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);

    setPreviewCards(shuffled);
    setFlipped([]);
    setMatched([]);
  };

  /* =========================================================
     PREVIEW CARD
  ========================================================= */

  const handlePreviewCard = (id) => {
    if (flipped.length >= 2 || flipped.includes(id) || matched.includes(id)) {
      return;
    }

    const nextFlipped = [...flipped, id];

    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const first = cards.find(
        (card) => Number(card.id) === Number(nextFlipped[0]),
      );

      const second = cards.find(
        (card) => Number(card.id) === Number(nextFlipped[1]),
      );

      if (first && second && Number(first.pairId) === Number(second.pairId)) {
        setTimeout(() => {
          setMatched((prev) => [...prev, first.id, second.id]);

          setFlipped([]);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  const FileUpload = ({ title, icon, accept, file, setter, existing }) => {
    const existingUrl = getFileUrl(existing);

    return (
      <div
        style={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: 14,
          background: COLORS.white,
          minHeight: 105,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Space
          style={{
            marginBottom: 9,
            color: COLORS.text,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: COLORS.navyLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.navy,
            }}
          >
            {icon}
          </div>

          <Text
            strong
            style={{
              fontSize: 13,
              color: COLORS.text,
            }}
          >
            {title}
          </Text>
        </Space>

        <Upload
          maxCount={1}
          beforeUpload={(uploadFile) => {
            setter(uploadFile);
            return false;
          }}
          showUploadList={false}
          accept={accept}
        >
          <Button
            size="small"
            style={{
              borderRadius: 8,
              width: "100%",
              borderColor: COLORS.border,
            }}
          >
            {file ? "Đổi tệp" : "Chọn tệp"}
          </Button>
        </Upload>

        {file ? (
          <Tag
            icon={<FileCheck size={12} />}
            style={{
              marginTop: 7,
              fontSize: 11,
              width: "fit-content",
              color: COLORS.success,
              background: COLORS.successBg,
              borderColor: "#C8E8D8",
            }}
          >
            {file.name}
          </Tag>
        ) : existingUrl ? (
          <Tag
            style={{
              marginTop: 7,
              fontSize: 11,
              width: "fit-content",
              color: COLORS.navy,
              background: COLORS.navyLight,
              borderColor: "#D7E2EB",
            }}
          >
            Đang có file
          </Tag>
        ) : null}
      </div>
    );
  };

  /* =========================================================
     CARD EDITOR
  ========================================================= */

  const renderCardEditor = (card, index) => {
    const imageUrl = getFileUrl(card.image);

    return (
      <div
        key={card.id}
        style={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: 16,
          background: COLORS.white,
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Space size={9}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: COLORS.navy,
                color: COLORS.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {index + 1}
            </div>

            <div>
              <Text
                strong
                style={{
                  display: "block",
                  color: COLORS.text,
                }}
              >
                Thẻ #{card.id}
              </Text>

              <Text
                style={{
                  fontSize: 11,
                  color: COLORS.muted,
                }}
              >
                Cặp {card.pairId}
              </Text>
            </div>
          </Space>

          <Button
            danger
            type="text"
            icon={<Trash2 size={16} />}
            onClick={() => removeCard(card.id)}
            style={{
              borderRadius: 8,
            }}
          />
        </div>

        {/* CONFIG */}

        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={10}>
            <Segmented
              block
              value={card.type || "text"}
              onChange={(value) => updateCard(card.id, "type", value)}
              options={[
                {
                  label: "Văn bản",
                  value: "text",
                  icon: <Type size={14} />,
                },
                {
                  label: "Hình ảnh",
                  value: "image",
                  icon: <ImageIcon size={14} />,
                },
              ]}
            />
          </Col>

          <Col xs={24} md={8}>
            {card.type === "text" ? (
              <Input
                value={card.content || ""}
                onChange={(e) => updateCard(card.id, "content", e.target.value)}
                placeholder="Nhập nội dung thẻ..."
                style={{
                  borderRadius: 8,
                }}
              />
            ) : (
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
                  const actualFile = file?.originFileObj || file;

                  updateCard(card.id, "image", actualFile);

                  return false;
                }}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  icon={<ImagePlus size={14} />}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                  }}
                >
                  {card.image ? "Đổi ảnh" : "Chọn ảnh"}
                </Button>
              </Upload>
            )}
          </Col>

          <Col xs={24} md={6}>
            <InputNumber
              min={1}
              value={card.pairId}
              onChange={(value) => updateCard(card.id, "pairId", value || 1)}
              addonBefore="Cặp"
              style={{
                width: "100%",
              }}
            />
          </Col>
        </Row>

        {/* IMAGE PREVIEW */}

        {card.type === "image" && imageUrl && (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              background: COLORS.grayBg,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <img
              src={imageUrl}
              alt="Card preview"
              style={{
                width: 64,
                height: 64,
                objectFit: "cover",
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
              }}
            />

            <div>
              <Text
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Hình ảnh thẻ
              </Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                }}
              >
                {getFileName(card.image)}
              </Text>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* =========================================================
     BACKGROUND PREVIEW
  ========================================================= */

  const backgroundPreviewUrl = getFileUrl(
    background || game?.background?.image,
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      style={{
        background: COLORS.background,
        minHeight: "100vh",
        padding: 20,
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Space size={14}>
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={onBack}
            style={{
              borderRadius: 9,
            }}
          >
            Quay lại
          </Button>

          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: COLORS.navyLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.navy,
            }}
          >
            <Brain size={22} />
          </div>

          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                color: COLORS.text,
                fontSize: 20,
              }}
            >
              {isEdit ? "Chỉnh sửa Game Ghi Nhớ" : "Tạo Game Ghi Nhớ"}
            </Title>

            <Text
              style={{
                color: COLORS.textSecondary,
                fontSize: 12,
              }}
            >
              Tạo game lật thẻ ghép cặp kiến thức giáo lý
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
            borderRadius: 9,
            background: COLORS.navy,
            borderColor: COLORS.navy,
            fontWeight: 600,
            padding: "0 24px",
          }}
        >
          {isEdit ? "Lưu thay đổi" : "Hoàn tất & Tạo"}
        </Button>
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={[18, 18]}>
          {/* =================================================
              LEFT
          ================================================= */}

          <Col xs={24} lg={15}>
            {/* BASIC */}

            <Card
              bordered
              style={{
                borderRadius: 14,
                marginBottom: 18,
                borderColor: COLORS.border,
              }}
              styles={{
                body: {
                  padding: 20,
                },
              }}
            >
              <SectionTitle
                icon={<Settings size={18} />}
                title="Thông tin cơ bản"
              />

              <Form.Item
                name="name"
                label={
                  <span
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    Tên trò chơi
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên game",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ví dụ: Lật thẻ Đức Tin"
                  style={{
                    borderRadius: 9,
                  }}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <span
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    Mô tả
                  </span>
                }
              >
                <TextArea
                  rows={3}
                  placeholder="Mô tả ngắn về trò chơi..."
                  style={{
                    borderRadius: 9,
                  }}
                />
              </Form.Item>
            </Card>

            {/* CARDS */}

            <Card
              bordered
              style={{
                borderRadius: 14,
                marginBottom: 18,
                borderColor: COLORS.border,
              }}
              title={
                <Space size={9}>
                  <Layers3 size={18} color={COLORS.navy} />

                  <span
                    style={{
                      color: COLORS.text,
                      fontWeight: 700,
                    }}
                  >
                    Cấu hình thẻ
                  </span>

                  <Tag
                    style={{
                      margin: 0,
                      color: COLORS.navy,
                      background: COLORS.navyLight,
                      borderColor: "#D7E2EB",
                    }}
                  >
                    {pairs.length} cặp · {cards.length} thẻ
                  </Tag>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<Plus size={15} />}
                  onClick={addPair}
                  style={{
                    borderRadius: 9,
                    background: COLORS.navy,
                    borderColor: COLORS.navy,
                  }}
                >
                  Thêm cặp
                </Button>
              }
            >
              {!cards.length ? (
                <Empty description="Chưa có thẻ nào">
                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={addPair}
                    style={{
                      background: COLORS.navy,
                      borderColor: COLORS.navy,
                    }}
                  >
                    Tạo cặp đầu tiên
                  </Button>
                </Empty>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    maxHeight: 650,
                    overflowY: "auto",
                    paddingRight: 4,
                  }}
                >
                  {cards.map((card, index) => renderCardEditor(card, index))}
                </div>
              )}
            </Card>

            {/* SETTINGS */}

            <Card
              bordered
              style={{
                borderRadius: 14,
                marginBottom: 18,
                borderColor: COLORS.border,
              }}
              styles={{
                body: {
                  padding: 20,
                },
              }}
            >
              <SectionTitle
                icon={<Settings size={18} />}
                title="Cài đặt trò chơi"
              />

              <Row gutter={[16, 10]}>
                <Col xs={24} md={12}>
                  <Form.Item name="timeLimit" label="Thời gian chơi">
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

                <SettingItem
                  col={6}
                  name="shuffleQuestions"
                  label="Xáo trộn thẻ"
                  icon={<Layers3 size={15} />}
                />

                <SettingItem
                  col={6}
                  name="shuffleAnswers"
                  label="Xáo trộn đáp án"
                  icon={<RotateCcw size={15} />}
                />

                <SettingItem
                  col={6}
                  name="showScore"
                  label="Hiện điểm"
                  icon={<Trophy size={15} />}
                />

                <SettingItem
                  col={6}
                  name="showTimer"
                  label="Hiện thời gian"
                  icon={<Timer size={15} />}
                />

                <SettingItem
                  col={6}
                  name="showProgress"
                  label="Hiện tiến độ"
                  icon={<BarChart3 size={15} />}
                />

                <SettingItem
                  col={6}
                  name="allowHint"
                  label="Cho phép gợi ý"
                  icon={<Lightbulb size={15} />}
                />

                <SettingItem
                  col={6}
                  name="allowSkip"
                  label="Cho phép bỏ qua"
                  icon={<SkipForward size={15} />}
                />
              </Row>
            </Card>

            {/* MEDIA */}

            <Card
              bordered
              style={{
                borderRadius: 14,
                marginBottom: 18,
                borderColor: COLORS.border,
              }}
              styles={{
                body: {
                  padding: 20,
                },
              }}
            >
              <SectionTitle
                icon={<ImagePlus size={18} />}
                title="Hình ảnh & Âm thanh"
              />

              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Thumbnail"
                    icon={<ImagePlus size={15} />}
                    accept="image/*"
                    file={thumbnail}
                    setter={setThumbnail}
                    existing={game?.thumbnail}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Background"
                    icon={<ImageIcon size={15} />}
                    accept="image/*"
                    file={background}
                    setter={setBackground}
                    existing={game?.background?.image}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Nhạc nền"
                    icon={<Music size={15} />}
                    accept="audio/*"
                    file={backgroundMusic}
                    setter={setBackgroundMusic}
                    existing={game?.media?.backgroundMusic}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Âm đúng"
                    icon={<CheckCircle2 size={15} />}
                    accept="audio/*"
                    file={correctSound}
                    setter={setCorrectSound}
                    existing={game?.media?.correctSound}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Âm sai"
                    icon={<XCircle size={15} />}
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
              RIGHT / PREVIEW
          ================================================= */}

          <Col xs={24} lg={9}>
            <div
              style={{
                position: "sticky",
                top: 16,
              }}
            >
              <Card
                bordered
                style={{
                  borderRadius: 14,
                  borderColor: COLORS.border,
                }}
                styles={{
                  body: {
                    padding: 18,
                  },
                }}
              >
                {/* PREVIEW HEADER */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Space size={9}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: COLORS.goldLight,
                        color: COLORS.gold,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Eye size={17} />
                    </div>

                    <div>
                      <Text
                        strong
                        style={{
                          display: "block",
                          color: COLORS.text,
                        }}
                      >
                        Xem trước Game
                      </Text>

                      <Text
                        style={{
                          fontSize: 11,
                          color: COLORS.muted,
                        }}
                      >
                        Kiểm tra trước khi lưu
                      </Text>
                    </div>
                  </Space>

                  <Button
                    size="small"
                    icon={<PlayCircle size={14} />}
                    onClick={startPreview}
                    style={{
                      borderRadius: 8,
                    }}
                  >
                    Chơi thử
                  </Button>
                </div>

                <Divider
                  style={{
                    margin: "14px 0",
                  }}
                />

                {/* GAME PREVIEW */}

                <div
                  style={{
                    background: backgroundPreviewUrl
                      ? `url(${backgroundPreviewUrl}) center/cover`
                      : backgroundColor,
                    borderRadius: 12,
                    padding: 16,
                    minHeight: 320,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  {!previewCards.length ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "78px 10px",
                      }}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 16,
                          margin: "0 auto",
                          background: COLORS.navy,
                          color: COLORS.white,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Brain size={30} />
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                        }}
                      >
                        <Text
                          strong
                          style={{
                            display: "block",
                            color: COLORS.text,
                            marginBottom: 4,
                          }}
                        >
                          Game ghi nhớ
                        </Text>

                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.textSecondary,
                          }}
                        >
                          Bấm "Chơi thử" để test lật thẻ
                        </Text>
                      </div>
                    </div>
                  ) : (
                    <Row gutter={[8, 8]}>
                      {previewCards.map((card) => {
                        const isFlipped =
                          flipped.includes(card.id) ||
                          matched.includes(card.id);

                        const isMatched = matched.includes(card.id);

                        const imageUrl = getFileUrl(card.image);

                        return (
                          <Col span={8} key={card.id}>
                            <div
                              onClick={() => handlePreviewCard(card.id)}
                              style={{
                                height: 90,
                                borderRadius: 10,
                                cursor: "pointer",

                                background: isFlipped
                                  ? isMatched
                                    ? COLORS.successBg
                                    : COLORS.white
                                  : primaryColor,

                                border: isMatched
                                  ? `2px solid ${COLORS.success}`
                                  : `1px solid ${COLORS.border}`,

                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 6,
                                textAlign: "center",
                                overflow: "hidden",

                                boxShadow: "0 2px 5px rgba(23,59,94,0.06)",

                                transition: "all .2s ease",
                              }}
                            >
                              {isFlipped ? (
                                card.type === "image" && imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt="Card"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                ) : (
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: COLORS.text,
                                    }}
                                  >
                                    {card.content || "—"}
                                  </Text>
                                )
                              ) : (
                                <Brain size={24} color={COLORS.white} />
                              )}
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </div>

                {/* COLOR */}

                <Divider
                  style={{
                    margin: "18px 0",
                  }}
                />

                <Space
                  size={8}
                  style={{
                    marginBottom: 14,
                  }}
                >
                  <Palette size={17} color={COLORS.navy} />

                  <Text
                    strong
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    Màu giao diện
                  </Text>
                </Space>

                <Row gutter={12}>
                  <ColorSetting
                    span={8}
                    label="Màu chính"
                    value={primaryColor}
                    onChange={(color) => setPrimaryColor(color.toHexString())}
                  />

                  <ColorSetting
                    span={8}
                    label="Màu phụ"
                    value={secondaryColor}
                    onChange={(color) => setSecondaryColor(color.toHexString())}
                  />

                  <ColorSetting
                    span={8}
                    label="Background"
                    value={backgroundColor}
                    onChange={(color) =>
                      setBackgroundColor(color.toHexString())
                    }
                  />
                </Row>

                {/* CURRENT COLORS */}

                <div
                  style={{
                    marginTop: 18,
                    padding: 12,
                    background: COLORS.grayBg,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: COLORS.muted,
                      marginBottom: 8,
                    }}
                  >
                    Màu hiện tại
                  </Text>

                  <Space size={8}>
                    <ColorDot color={primaryColor} label="Chính" />

                    <ColorDot color={secondaryColor} label="Phụ" />

                    <ColorDot color={backgroundColor} label="Nền" />
                  </Space>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

/* =========================================================
   SECTION TITLE
========================================================= */

const SectionTitle = ({ icon, title }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: COLORS.navyLight,
          color: COLORS.navy,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <Title
        level={5}
        style={{
          margin: 0,
          color: COLORS.text,
        }}
      >
        {title}
      </Title>
    </div>
  );
};

/* =========================================================
   SETTING ITEM
========================================================= */

const SettingItem = ({ col = 6, name, label, icon }) => {
  return (
    <Col xs={12} md={col}>
      <Form.Item
        name={name}
        label={
          <Space size={5}>
            <span
              style={{
                color: COLORS.textSecondary,
                display: "flex",
              }}
            >
              {icon}
            </span>

            <span>{label}</span>
          </Space>
        }
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </Col>
  );
};

/* =========================================================
   COLOR SETTING
========================================================= */

const ColorSetting = ({ span, label, value, onChange }) => {
  return (
    <Col span={span}>
      <Text
        style={{
          fontSize: 11,
          color: COLORS.textSecondary,
        }}
      >
        {label}
      </Text>

      <div
        style={{
          marginTop: 6,
        }}
      >
        <ColorPicker value={value} onChange={onChange} showText />
      </div>
    </Col>
  );
};

/* =========================================================
   COLOR DOT
========================================================= */

const ColorDot = ({ color, label }) => {
  return (
    <Space size={5}>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          background: color,
          border: `1px solid ${COLORS.border}`,
        }}
      />

      <Text
        style={{
          fontSize: 11,
          color: COLORS.textSecondary,
        }}
      >
        {label}
      </Text>
    </Space>
  );
};

export default MemoryGameEditor;
