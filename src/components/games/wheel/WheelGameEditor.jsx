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
  Tooltip,
} from "antd";

import {
  ArrowLeft,
  ImagePlus,
  Music,
  Plus,
  RotateCw,
  Save,
  Trash2,
  Trophy,
  Volume2,
  Sparkles,
  Settings,
  Palette,
  PlayCircle,
  FileCheck,
  Dice5,
} from "lucide-react";

import { createGame, updateGame, getGameFileUrl } from "../../../api/gameApi";

const { Title, Text } = Typography;
const { TextArea } = Input;

/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_ITEMS = [
  {
    id: 1,
    label: "Phần thưởng 1",
    value: "10 điểm",
    color: "#6C4BFF",
    probability: 25,
  },
  {
    id: 2,
    label: "Phần thưởng 2",
    value: "20 điểm",
    color: "#1677FF",
    probability: 25,
  },
  {
    id: 3,
    label: "Phần thưởng 3",
    value: "30 điểm",
    color: "#13C2C2",
    probability: 25,
  },
  {
    id: 4,
    label: "Phần thưởng 4",
    value: "50 điểm",
    color: "#FF7A45",
    probability: 25,
  },
];

const COLOR_LIST = [
  "#6C4BFF",
  "#1677FF",
  "#13C2C2",
  "#52C41A",
  "#FAAD14",
  "#FF7A45",
  "#F5222D",
  "#EB2F96",
  "#722ED1",
  "#1890FF",
];

/* =========================================================
   DEFAULT CONFIG
========================================================= */

const DEFAULT_BACKGROUND = {
  color: "#F8F9FC",
  image: null,
};

const DEFAULT_THEME = {
  primary: "#6C4BFF",
  secondary: "#FFD54F",
  font: "Baloo 2",
  borderRadius: 20,
};

const DEFAULT_SETTINGS = {
  timeLimit: 60,
  shuffleQuestions: false,
  shuffleAnswers: false,
  showScore: true,
  showTimer: true,
  showProgress: false,
  allowHint: false,
  allowSkip: false,
};

const DEFAULT_WHEEL = {
  items: DEFAULT_ITEMS,
  wheelColor: "#6C4BFF",
  pointerColor: "#FFD54F",
  spinsPerPlayer: 1,
  autoSpin: false,
  showResult: true,
  allowReplay: false,
};

/* =========================================================
   COMPONENT
========================================================= */

const WheelGameEditor = ({ teacherId, game = null, onSuccess, onBack }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  /* =========================================================
     WHEEL STATE
  ========================================================= */

  const [items, setItems] = useState(DEFAULT_ITEMS);

  const [wheelColor, setWheelColor] = useState(DEFAULT_WHEEL.wheelColor);

  const [pointerColor, setPointerColor] = useState(DEFAULT_WHEEL.pointerColor);

  /* =========================================================
     PREVIEW STATE
  ========================================================= */

  const [isSpinning, setIsSpinning] = useState(false);

  const [rotationDegree, setRotationDegree] = useState(0);

  /* =========================================================
     FILE STATE
  ========================================================= */

  const [thumbnail, setThumbnail] = useState(null);

  const [background, setBackground] = useState(null);

  const [backgroundMusic, setBackgroundMusic] = useState(null);

  const [spinSound, setSpinSound] = useState(null);

  const [winSound, setWinSound] = useState(null);

  const isEdit = Boolean(game);

  /* =========================================================
     LOAD GAME DATA
  ========================================================= */

  useEffect(() => {
    if (!game) {
      form.setFieldsValue({
        name: "",
        description: "",
        timeLimit: DEFAULT_SETTINGS.timeLimit,
        spinsPerPlayer: DEFAULT_WHEEL.spinsPerPlayer,
        autoSpin: DEFAULT_WHEEL.autoSpin,
        showResult: DEFAULT_WHEEL.showResult,
        allowReplay: DEFAULT_WHEEL.allowReplay,
      });

      setItems(DEFAULT_ITEMS);
      setWheelColor(DEFAULT_WHEEL.wheelColor);
      setPointerColor(DEFAULT_WHEEL.pointerColor);

      setThumbnail(null);
      setBackground(null);
      setBackgroundMusic(null);
      setSpinSound(null);
      setWinSound(null);

      return;
    }

    /* =======================================================
       BASIC
    ======================================================= */

    const settings = game?.settings || {};
    const wheel = game?.wheel || {};
    const theme = game?.theme || {};
    const gameBackground = game?.background || {};
    const media = game?.media || {};

    form.setFieldsValue({
      name: game?.name || "",

      description: game?.description || "",

      timeLimit:
        settings?.timeLimit !== undefined
          ? Number(settings.timeLimit)
          : DEFAULT_SETTINGS.timeLimit,

      spinsPerPlayer:
        wheel?.spinsPerPlayer !== undefined
          ? Number(wheel.spinsPerPlayer)
          : DEFAULT_WHEEL.spinsPerPlayer,

      autoSpin:
        wheel?.autoSpin !== undefined
          ? Boolean(wheel.autoSpin)
          : DEFAULT_WHEEL.autoSpin,

      showResult:
        wheel?.showResult !== undefined
          ? Boolean(wheel.showResult)
          : DEFAULT_WHEEL.showResult,

      allowReplay:
        wheel?.allowReplay !== undefined
          ? Boolean(wheel.allowReplay)
          : DEFAULT_WHEEL.allowReplay,
    });

    /* =======================================================
       WHEEL ITEMS
    ======================================================= */

    if (Array.isArray(wheel?.items) && wheel.items.length > 0) {
      setItems(
        wheel.items.map((item, index) => ({
          id: item?.id ?? index + 1,

          label: item?.label || "",

          value: item?.value || "",

          color: item?.color || COLOR_LIST[index % COLOR_LIST.length],

          probability: Number(item?.probability) || 0,
        })),
      );
    } else {
      setItems(DEFAULT_ITEMS);
    }

    /* =======================================================
       THEME
    ======================================================= */

    setWheelColor(wheel?.wheelColor || theme?.primary || DEFAULT_THEME.primary);

    setPointerColor(
      wheel?.pointerColor || theme?.secondary || DEFAULT_THEME.secondary,
    );

    /* =======================================================
       FILE STATE
    ======================================================= */

    /*
      Không set URL vào state File.

      File state chỉ dùng cho file mới được upload.
      File cũ sẽ lấy từ game.thumbnail,
      game.background.image,
      game.media.backgroundMusic...
    */

    setThumbnail(null);
    setBackground(null);
    setBackgroundMusic(null);
    setSpinSound(null);
    setWinSound(null);

    console.log("EDIT WHEEL GAME:", {
      game,
      background: gameBackground,
      media,
    });
  }, [game, form]);

  /* =========================================================
     PROBABILITY
  ========================================================= */

  const totalProbability = useMemo(() => {
    return items.reduce(
      (total, item) => total + Number(item?.probability || 0),
      0,
    );
  }, [items]);

  const isProbabilityValid = Math.abs(totalProbability - 100) < 0.01;

  /* =========================================================
     ITEM FUNCTIONS
  ========================================================= */

  const addItem = () => {
    const maxId =
      items.length > 0
        ? Math.max(...items.map((item) => Number(item?.id) || 0))
        : 0;

    const newId = maxId + 1;

    const color = COLOR_LIST[items.length % COLOR_LIST.length];

    setItems((prev) => [
      ...prev,
      {
        id: newId,
        label: `Phần thưởng ${newId}`,
        value: "",
        color,
        probability: 0,
      },
    ]);
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
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

  const removeItem = (id) => {
    if (items.length <= 2) {
      message.warning("Vòng quay phải có ít nhất 2 ô");

      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* =========================================================
     AUTO DISTRIBUTE
  ========================================================= */

  const autoDistributeProbability = () => {
    if (items.length < 1) return;

    const base = Math.floor(100 / items.length);

    const remainder = 100 - base * items.length;

    setItems((prev) =>
      prev.map((item, index) => ({
        ...item,

        probability: index === 0 ? base + remainder : base,
      })),
    );

    message.success("Đã tự động chia tỷ lệ");
  };

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  const beforeUpload = (setter) => (file) => {
    setter(file);

    return false;
  };

  /* =========================================================
     PREVIEW SPIN
  ========================================================= */

  const handleTestSpin = () => {
    if (isSpinning || items.length < 2) {
      return;
    }

    setIsSpinning(true);

    const randomSpin = 1800 + Math.floor(Math.random() * 360);

    setRotationDegree((prev) => prev + randomSpin);

    setTimeout(() => {
      setIsSpinning(false);
    }, 3500);
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      /* =====================================================
         VALIDATE ITEMS
      ===================================================== */

      if (items.length < 2) {
        message.error("Vòng quay phải có ít nhất 2 ô");

        return;
      }

      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        if (!String(item?.label || "").trim()) {
          message.error(`Ô số ${index + 1} chưa có tên`);

          return;
        }

        const probability = Number(item?.probability);

        if (
          !Number.isFinite(probability) ||
          probability < 0 ||
          probability > 100
        ) {
          message.error(`Tỷ lệ ô ${index + 1} không hợp lệ`);

          return;
        }
      }

      if (!isProbabilityValid) {
        message.error(
          `Tổng tỷ lệ phải bằng 100%. Hiện tại: ${totalProbability}%`,
        );

        return;
      }

      setLoading(true);

      /* =====================================================
         WHEEL DATA
      ===================================================== */

      const wheelData = {
        items: items.map((item, index) => ({
          id: item?.id ?? index + 1,

          label: String(item?.label || "").trim(),

          value: item?.value || "",

          color: item?.color || COLOR_LIST[index % COLOR_LIST.length],

          probability: Number(item?.probability || 0),
        })),

        wheelColor: wheelColor || DEFAULT_WHEEL.wheelColor,

        pointerColor: pointerColor || DEFAULT_WHEEL.pointerColor,

        spinsPerPlayer: Number(values?.spinsPerPlayer || 1),

        autoSpin: Boolean(values?.autoSpin),

        showResult: Boolean(values?.showResult),

        allowReplay: Boolean(values?.allowReplay),
      };

      /* =====================================================
         SETTINGS
      ===================================================== */

      const settings = {
        timeLimit: Number(values?.timeLimit || 60),

        shuffleQuestions: false,

        shuffleAnswers: false,

        showScore: true,

        showTimer: true,

        showProgress: false,

        allowHint: false,

        allowSkip: false,
      };

      /* =====================================================
         BACKGROUND
         
         QUAN TRỌNG:
         Chỉ có MỘT key background.
      ===================================================== */

      const backgroundConfig = {
        color: DEFAULT_BACKGROUND.color,

        /*
          Nếu upload file mới:
          background sẽ là File.

          Nếu không upload:
          giữ image cũ từ game.background.image.
        */
        image: background || game?.background?.image || null,
      };

      /* =====================================================
         MEDIA
      ===================================================== */

      const media = {
        /*
          Nếu upload file mới thì dùng File.
          Nếu không thì giữ file cũ.
        */

        backgroundMusic:
          backgroundMusic || game?.media?.backgroundMusic || null,

        correctSound: game?.media?.correctSound || null,

        wrongSound: game?.media?.wrongSound || null,
      };

      /*
        spinSound / winSound:
        Nếu backend của bạn đang dùng:
          spinSound
          winSound

        thì thêm vào media.
      */

      if (spinSound || game?.media?.spinSound) {
        media.spinSound = spinSound || game?.media?.spinSound || null;
      }

      if (winSound || game?.media?.winSound) {
        media.winSound = winSound || game?.media?.winSound || null;
      }

      /* =====================================================
         THEME
      ===================================================== */

      const theme = {
        primary: wheelColor || DEFAULT_THEME.primary,

        secondary: pointerColor || DEFAULT_THEME.secondary,

        font: game?.theme?.font || DEFAULT_THEME.font,

        borderRadius:
          Number(game?.theme?.borderRadius) || DEFAULT_THEME.borderRadius,
      };

      /* =====================================================
         GAME DATA
      ===================================================== */

      const gameData = {
        teacher_id: teacherId || game?.teacher_id || null,

        name: String(values?.name || "").trim(),

        description: values?.description || "",

        type: "wheel",

        /* BACKGROUND DUY NHẤT */
        background: backgroundConfig,

        /* THEME */
        theme,

        /* SETTINGS */
        settings,

        /* MEDIA */
        media,

        /* QUESTIONS */
        questions: [],

        /* OTHER GAME DATA */
        pairs: [],

        cards: [],

        crossword: {},

        sorting: {},

        dragDrop: {},

        /* WHEEL */
        wheel: wheelData,

        /* THUMBNAIL */
        thumbnail: thumbnail || game?.thumbnail || null,
      };

      console.log("WHEEL GAME DATA:", gameData);

      /* =====================================================
         CREATE / UPDATE
      ===================================================== */

      const result = isEdit
        ? await updateGame(game.id, gameData)
        : await createGame(gameData);

      if (!result?.success) {
        throw new Error(result?.message || "Không thể lưu trò chơi");
      }

      message.success(
        isEdit ? "Cập nhật vòng quay thành công" : "Tạo vòng quay thành công",
      );

      onSuccess?.(result?.data);
    } catch (error) {
      console.error("WHEEL SAVE ERROR:", error);

      if (!error?.errorFields) {
        message.error(error?.message || "Không thể lưu vòng quay");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     WHEEL PREVIEW
  ========================================================= */

  const renderWheelPreview = () => {
    if (!items.length) {
      return null;
    }

    const size = 280;

    const segment = 360 / items.length;

    return (
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          margin: "24px auto",
        }}
      >
        {/* WHEEL */}

        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",

            background: `conic-gradient(
              ${items
                .map(
                  (item, index) =>
                    `${item.color} ${index * segment}deg ${
                      (index + 1) * segment
                    }deg`,
                )
                .join(", ")}
            )`,

            border: `8px solid ${wheelColor}`,

            boxShadow: "0 12px 32px rgba(108,75,255,0.18)",

            position: "relative",

            transform: `rotate(${rotationDegree}deg)`,

            transition: isSpinning
              ? "transform 3.5s cubic-bezier(0.15, 0.9, 0.15, 1)"
              : "none",

            overflow: "hidden",
          }}
        >
          {items.map((item, index) => {
            const angle = index * segment + segment / 2;

            return (
              <div
                key={item.id}
                style={{
                  position: "absolute",

                  left: "50%",

                  top: "50%",

                  transform: `
                      rotate(${angle}deg)
                      translateY(-98px)
                      rotate(-${angle}deg)
                    `,

                  transformOrigin: "center",

                  width: 86,

                  marginLeft: -43,

                  textAlign: "center",

                  color: "#ffffff",

                  fontWeight: 700,

                  fontSize: 11,

                  textShadow: "0 1px 3px rgba(0,0,0,0.45)",

                  whiteSpace: "nowrap",

                  overflow: "hidden",

                  textOverflow: "ellipsis",
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>

        {/* POINTER */}

        <div
          style={{
            position: "absolute",

            top: -12,

            left: "50%",

            transform: "translateX(-50%)",

            width: 0,

            height: 0,

            borderLeft: "16px solid transparent",

            borderRight: "16px solid transparent",

            borderTop: `34px solid ${pointerColor}`,

            zIndex: 5,

            filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))",
          }}
        />

        {/* CENTER BUTTON */}

        <div
          onClick={handleTestSpin}
          style={{
            position: "absolute",

            width: 62,

            height: 62,

            borderRadius: "50%",

            background: "#ffffff",

            border: `5px solid ${wheelColor}`,

            left: "50%",

            top: "50%",

            transform: "translate(-50%, -50%)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            boxShadow: "0 5px 16px rgba(0,0,0,0.18)",

            cursor: isSpinning ? "not-allowed" : "pointer",

            zIndex: 10,
          }}
        >
          <RotateCw size={24} color={wheelColor} />
        </div>
      </div>
    );
  };

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

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

          minHeight: 130,

          display: "flex",

          flexDirection: "column",

          justifyContent: "center",
        }}
      >
        <Space
          style={{
            marginBottom: 10,
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
            {file ? "Đổi file" : "Chọn tệp"}
          </Button>
        </Upload>

        {file && (
          <div
            style={{
              marginTop: 8,
            }}
          >
            <Tag color="purple" icon={<FileCheck size={12} />}>
              {file.name}
            </Tag>
          </div>
        )}

        {!file && existingUrl && (
          <div
            style={{
              marginTop: 8,
            }}
          >
            <Tag color="blue">Đang có file</Tag>
          </div>
        )}
      </div>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

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

          gap: 16,

          marginBottom: 24,

          background: "#ffffff",

          padding: "16px 24px",

          borderRadius: 18,

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
              🎡 {isEdit ? "Chỉnh sửa vòng quay" : "Tạo vòng quay mới"}
            </Title>

            <Text
              type="secondary"
              style={{
                fontSize: 13,
              }}
            >
              Tạo trò chơi vòng quay tương tác cho học sinh
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

            background: "#6C4BFF",

            fontWeight: 600,

            padding: "0 28px",

            boxShadow: "0 4px 12px rgba(108,75,255,0.25)",
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
            {/* BASIC */}

            <Card
              bordered={false}
              style={{
                borderRadius: 18,
                marginBottom: 20,
              }}
            >
              <Title
                level={5}
                style={{
                  display: "flex",

                  alignItems: "center",

                  gap: 8,
                }}
              >
                <Settings size={18} color="#6C4BFF" />
                Thông tin cơ bản
              </Title>

              <Form.Item
                name="name"
                label="Tên trò chơi"
                rules={[
                  {
                    required: true,

                    message: "Vui lòng nhập tên trò chơi",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ví dụ: Vòng quay may mắn"
                  style={{
                    borderRadius: 10,
                  }}
                />
              </Form.Item>

              <Form.Item name="description" label="Mô tả">
                <TextArea
                  rows={3}
                  placeholder="Nhập mô tả trò chơi..."
                  style={{
                    borderRadius: 10,
                  }}
                />
              </Form.Item>
            </Card>

            {/* ITEMS */}

            <Card
              bordered={false}
              style={{
                borderRadius: 18,
                marginBottom: 20,
              }}
              title={
                <Space>
                  <Trophy size={18} color="#6C4BFF" />
                  Cấu hình ô vòng quay
                </Space>
              }
              extra={
                <Space>
                  <Tooltip title="Tự động chia đều tỷ lệ">
                    <Button
                      icon={<Dice5 size={16} />}
                      onClick={autoDistributeProbability}
                      style={{
                        borderRadius: 10,
                      }}
                    >
                      Chia đều
                    </Button>
                  </Tooltip>

                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={addItem}
                    style={{
                      borderRadius: 10,
                      background: "#6C4BFF",
                    }}
                  >
                    Thêm ô
                  </Button>
                </Space>
              }
            >
              {/* PROBABILITY */}

              <div
                style={{
                  padding: 16,

                  borderRadius: 14,

                  background: isProbabilityValid ? "#f6ffed" : "#fff2f0",

                  border: `1px solid ${
                    isProbabilityValid ? "#b7eb8f" : "#ffccc7"
                  }`,

                  marginBottom: 18,

                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",
                }}
              >
                <div>
                  <Text
                    strong
                    style={{
                      color: isProbabilityValid ? "#389e0d" : "#cf1322",
                    }}
                  >
                    Tổng tỷ lệ: {totalProbability}%
                  </Text>

                  <Text
                    type="secondary"
                    style={{
                      display: "block",

                      fontSize: 12,

                      marginTop: 3,
                    }}
                  >
                    {isProbabilityValid
                      ? "Tỷ lệ đã hợp lệ"
                      : "Tổng tỷ lệ phải bằng 100%"}
                  </Text>
                </div>

                <Progress
                  type="circle"
                  percent={Math.min(totalProbability, 100)}
                  width={45}
                  strokeColor={isProbabilityValid ? "#52c41a" : "#ff4d4f"}
                />
              </div>

              {/* LIST */}

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
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 14,

                      border: "1px solid #e2e8f0",

                      borderRadius: 14,

                      background: "#ffffff",
                    }}
                  >
                    <Row gutter={[10, 10]} align="middle">
                      <Col xs={4} sm={2}>
                        <div
                          style={{
                            width: 30,

                            height: 30,

                            borderRadius: "50%",

                            background: item.color,

                            color: "#fff",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </div>
                      </Col>

                      <Col xs={20} sm={7}>
                        <Input
                          value={item.label}
                          placeholder="Tên phần thưởng"
                          onChange={(e) =>
                            updateItem(item.id, "label", e.target.value)
                          }
                          style={{
                            borderRadius: 8,
                          }}
                        />
                      </Col>

                      <Col xs={12} sm={6}>
                        <Input
                          value={item.value}
                          placeholder="Giá trị"
                          onChange={(e) =>
                            updateItem(item.id, "value", e.target.value)
                          }
                          style={{
                            borderRadius: 8,
                          }}
                        />
                      </Col>

                      <Col xs={8} sm={4}>
                        <InputNumber
                          min={0}
                          max={100}
                          addonAfter="%"
                          value={item.probability}
                          onChange={(value) =>
                            updateItem(item.id, "probability", value ?? 0)
                          }
                          style={{
                            width: "100%",
                          }}
                        />
                      </Col>

                      <Col xs={4} sm={2}>
                        <ColorPicker
                          value={item.color}
                          onChange={(color) =>
                            updateItem(item.id, "color", color.toHexString())
                          }
                        />
                      </Col>

                      <Col
                        xs={24}
                        sm={3}
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <Button
                          danger
                          type="text"
                          icon={<Trash2 size={17} />}
                          onClick={() => removeItem(item.id)}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </Card>

            {/* SETTINGS */}

            <Card
              bordered={false}
              style={{
                borderRadius: 18,
                marginBottom: 20,
              }}
            >
              <Title level={5}>⚙️ Cấu hình lượt chơi</Title>

              <Row gutter={[16, 12]}>
                <Col xs={24} md={12}>
                  <Form.Item name="timeLimit" label="Thời gian chơi (giây)">
                    <InputNumber
                      min={10}
                      max={3600}
                      style={{
                        width: "100%",
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="spinsPerPlayer" label="Số lượt quay / người">
                    <InputNumber
                      min={1}
                      max={100}
                      style={{
                        width: "100%",
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="autoSpin"
                    label="Tự động quay"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="showResult"
                    label="Hiển thị kết quả"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={8}>
                  <Form.Item
                    name="allowReplay"
                    label="Cho phép quay lại"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* MEDIA */}

            <Card
              bordered={false}
              style={{
                borderRadius: 18,
              }}
            >
              <Title level={5}>🎨 Hình ảnh & Âm thanh</Title>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Ảnh thumbnail"
                    icon={<ImagePlus size={17} />}
                    accept="image/*"
                    file={thumbnail}
                    setter={setThumbnail}
                    existing={game?.thumbnail}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Ảnh nền"
                    icon={<ImagePlus size={17} />}
                    accept="image/*"
                    file={background}
                    setter={setBackground}
                    existing={game?.background?.image}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Nhạc nền"
                    icon={<Music size={17} />}
                    accept="audio/*"
                    file={backgroundMusic}
                    setter={setBackgroundMusic}
                    existing={game?.media?.backgroundMusic}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Âm thanh quay"
                    icon={<Volume2 size={17} />}
                    accept="audio/*"
                    file={spinSound}
                    setter={setSpinSound}
                    existing={game?.media?.spinSound}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Âm thanh trúng thưởng"
                    icon={<Trophy size={17} />}
                    accept="audio/*"
                    file={winSound}
                    setter={setWinSound}
                    existing={game?.media?.winSound}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* =================================================
              RIGHT PREVIEW
          ================================================= */}

          <Col xs={24} lg={9}>
            <div
              style={{
                position: "sticky",

                top: 20,
              }}
            >
              <Card
                bordered={false}
                style={{
                  borderRadius: 18,

                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
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
                    <Sparkles size={18} color="#6C4BFF" />

                    <Text strong>Xem trước</Text>
                  </Space>

                  <Button
                    size="small"
                    type="dashed"
                    icon={<PlayCircle size={14} />}
                    loading={isSpinning}
                    onClick={handleTestSpin}
                  >
                    Quay thử
                  </Button>
                </div>

                <Divider />

                <div
                  style={{
                    background: "#F4F0FF",

                    borderRadius: 18,

                    padding: "20px 10px",

                    textAlign: "center",

                    overflow: "hidden",
                  }}
                >
                  {renderWheelPreview()}

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    Bấm vào giữa vòng quay để thử
                  </Text>
                </div>

                <Divider />

                {/* COLORS */}

                <Title
                  level={5}
                  style={{
                    fontSize: 14,

                    display: "flex",

                    alignItems: "center",

                    gap: 6,
                  }}
                >
                  <Palette size={16} color="#6C4BFF" />
                  Tùy chỉnh màu sắc
                </Title>

                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <div
                      style={{
                        padding: 12,

                        border: "1px solid #f0f0f0",

                        borderRadius: 12,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,

                          display: "block",

                          marginBottom: 8,
                        }}
                      >
                        Màu viền
                      </Text>

                      <ColorPicker
                        value={wheelColor}
                        onChange={(color) => setWheelColor(color.toHexString())}
                        showText
                      />
                    </div>
                  </Col>

                  <Col span={12}>
                    <div
                      style={{
                        padding: 12,

                        border: "1px solid #f0f0f0",

                        borderRadius: 12,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,

                          display: "block",

                          marginBottom: 8,
                        }}
                      >
                        Màu kim
                      </Text>

                      <ColorPicker
                        value={pointerColor}
                        onChange={(color) =>
                          setPointerColor(color.toHexString())
                        }
                        showText
                      />
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default WheelGameEditor;
