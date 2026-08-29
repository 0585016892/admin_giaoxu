import React, { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Input,
  InputNumber,
  message,
  Row,
  Space,
  Spin,
  Switch,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";

import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  FileImageOutlined,
  InboxOutlined,
  PlusOutlined,
  SaveOutlined,
  SoundOutlined,
  UpOutlined,
} from "@ant-design/icons";

import { createGame, updateGame } from "../../../api/gameApi";

const { Title, Text } = Typography;
const { Dragger } = Upload;

// =========================================================
// COLORS
// =========================================================

const COLORS = {
  navy: "#1B365D",
  gold: "#D4AF37",
  text: "#1E293B",
  bg: "#FAFAFA",
  border: "#E5E7EB",
  soft: "#F8FAFC",
  success: "#52C41A",
  danger: "#FF4D4F",
};

// =========================================================
// HELPERS
// =========================================================

const normalizeAnswer = (value = "") => {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
};

const createPreviewFileList = (file, fallbackUrl = null, name = "file") => {
  if (file instanceof File) {
    return [
      {
        uid: "-1",
        name: file.name,
        status: "done",
        originFileObj: file,
      },
    ];
  }

  if (fallbackUrl) {
    return [
      {
        uid: "-1",
        name,
        status: "done",
        url: fallbackUrl,
      },
    ];
  }

  return [];
};

const createEmptyQuestion = (id, number) => ({
  id,
  number,
  question: "",
  answer: "",
  answerDisplay: "",
  points: 10,
  answerIndex: null,
});

// =========================================================
// COMPONENT
// =========================================================

const CrosswordGameEditor = ({ teacherId, game = null, onSuccess, onBack }) => {
  const isEdit = Boolean(game?.id);

  // =======================================================
  // LOADING
  // =======================================================

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // =======================================================
  // BASIC
  // =======================================================

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // =======================================================
  // CROSSWORD
  // =======================================================

  const [verticalAnswer, setVerticalAnswer] = useState("");

  const [questions, setQuestions] = useState([createEmptyQuestion(1, 1)]);

  // =======================================================
  // SETTINGS
  // =======================================================

  const [showTimer, setShowTimer] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);

  const [allowRetry, setAllowRetry] = useState(true);
  const [showAnswerAfterSubmit, setShowAnswerAfterSubmit] = useState(true);

  // =======================================================
  // FILES
  // =======================================================

  const [thumbnail, setThumbnail] = useState(null);
  const [background, setBackground] = useState(null);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [correctSound, setCorrectSound] = useState(null);
  const [wrongSound, setWrongSound] = useState(null);

  // =======================================================
  // OLD FILE URLS
  // =======================================================

  const [oldThumbnail, setOldThumbnail] = useState(null);
  const [oldBackground, setOldBackground] = useState(null);
  const [oldBackgroundMusic, setOldBackgroundMusic] = useState(null);
  const [oldCorrectSound, setOldCorrectSound] = useState(null);
  const [oldWrongSound, setOldWrongSound] = useState(null);

  // =======================================================
  // SELECTED CELL
  // =======================================================

  const [selectedCell, setSelectedCell] = useState(null);

  // =======================================================
  // LOAD GAME
  // =======================================================

  useEffect(() => {
    let cancelled = false;

    const loadGame = () => {
      try {
        setInitializing(true);

        // =================================================
        // CREATE MODE
        // =================================================

        if (!game) {
          setName("");
          setDescription("");

          setVerticalAnswer("");

          setQuestions([createEmptyQuestion(1, 1)]);

          setShowTimer(false);
          setTimeLimit(60);

          setAllowRetry(true);
          setShowAnswerAfterSubmit(true);

          setThumbnail(null);
          setBackground(null);
          setBackgroundMusic(null);
          setCorrectSound(null);
          setWrongSound(null);

          setOldThumbnail(null);
          setOldBackground(null);
          setOldBackgroundMusic(null);
          setOldCorrectSound(null);
          setOldWrongSound(null);

          return;
        }

        // =================================================
        // BASIC
        // =================================================

        setName(game.name || "");
        setDescription(game.description || "");

        // =================================================
        // CROSSWORD
        // =================================================

        const crosswordData = game.crossword || {};

        const words = Array.isArray(crosswordData.words)
          ? crosswordData.words
          : [];

        let loadedVertical =
          crosswordData.verticalAnswerDisplay ||
          crosswordData.verticalAnswer ||
          "";

        if (!loadedVertical && words.length > 0) {
          const sortedWords = [...words].sort(
            (a, b) => Number(a.number || 0) - Number(b.number || 0),
          );

          loadedVertical = sortedWords
            .map((item) => item.requiredLetter || "")
            .join("");
        }

        setVerticalAnswer(loadedVertical);

        // =================================================
        // QUESTIONS
        // =================================================

        const loadedQuestions = words
          .slice()
          .sort((a, b) => Number(a.number || 0) - Number(b.number || 0))
          .map((item, index) => {
            const rawAnswer =
              item.answerDisplay || item.answer || item.word || "";

            return {
              id: item.id ?? index + 1,

              number: Number(item.number) || index + 1,

              question: item.question || item.clue || "",

              answer: rawAnswer,

              answerDisplay: rawAnswer,

              points: Number(item.points) || 10,

              answerIndex:
                item.answerIndex !== undefined && item.answerIndex !== null
                  ? Number(item.answerIndex)
                  : null,
            };
          });

        // fallback data cũ
        if (loadedQuestions.length > 0) {
          setQuestions(loadedQuestions);
        } else {
          const oldQuestions = Array.isArray(crosswordData.questions)
            ? crosswordData.questions
            : [];

          if (oldQuestions.length > 0) {
            setQuestions(
              oldQuestions.map((item, index) => ({
                id: item.id ?? index + 1,

                number: Number(item.number) || index + 1,

                question: item.question || item.clue || "",

                answer: item.answerDisplay || item.answer || "",

                answerDisplay: item.answerDisplay || item.answer || "",

                points: Number(item.points) || 10,

                answerIndex:
                  item.answerIndex !== undefined && item.answerIndex !== null
                    ? Number(item.answerIndex)
                    : null,
              })),
            );
          } else {
            setQuestions([createEmptyQuestion(1, 1)]);
          }
        }

        // =================================================
        // SETTINGS
        // =================================================

        const settings = game.settings || {};

        setShowTimer(Boolean(settings.showTimer));

        setTimeLimit(Number(settings.timeLimit) || 60);

        setAllowRetry(settings.allowRetry !== false);

        setShowAnswerAfterSubmit(settings.showAnswerAfterSubmit !== false);

        // =================================================
        // OLD MEDIA
        // =================================================

        setOldThumbnail(game.thumbnail || null);

        setOldBackground(
          game.background?.image ||
            game.background?.value ||
            game.background ||
            null,
        );

        setOldBackgroundMusic(game.media?.backgroundMusic || null);

        setOldCorrectSound(game.media?.correctSound || null);

        setOldWrongSound(game.media?.wrongSound || null);
      } catch (error) {
        console.error("LOAD CROSSWORD GAME ERROR:", error);

        message.error("Không thể đọc dữ liệu game.");
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };

    loadGame();

    return () => {
      cancelled = true;
    };
  }, [game]);

  // =======================================================
  // UPDATE QUESTION
  // =======================================================

  const updateQuestion = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const next = {
          ...item,
          [field]: value,
        };

        // Khi đổi đáp án, reset chữ giao
        if (field === "answer") {
          next.answerIndex = null;
        }

        return next;
      }),
    );
  };

  // =======================================================
  // SELECT INTERSECTION LETTER
  // =======================================================

  const selectIntersection = (questionId, charIndex) => {
    setQuestions((prev) =>
      prev.map((item) =>
        item.id === questionId
          ? {
              ...item,
              answerIndex: charIndex,
            }
          : item,
      ),
    );
  };

  // =======================================================
  // ADD QUESTION
  // =======================================================

  const addQuestion = () => {
    const nextId =
      questions.length > 0
        ? Math.max(...questions.map((item) => Number(item.id) || 0)) + 1
        : 1;

    setQuestions((prev) => [
      ...prev,
      createEmptyQuestion(nextId, prev.length + 1),
    ]);
  };

  // =======================================================
  // DELETE QUESTION
  // =======================================================

  const removeQuestion = (id) => {
    setQuestions((prev) => {
      const next = prev
        .filter((item) => item.id !== id)
        .map((item, index) => ({
          ...item,
          number: index + 1,
        }));

      return next.length ? next : [createEmptyQuestion(1, 1)];
    });
  };

  // =======================================================
  // MOVE QUESTION
  // =======================================================

  const moveQuestion = (index, direction) => {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= questions.length) {
      return;
    }

    const clone = [...questions];

    [clone[index], clone[newIndex]] = [clone[newIndex], clone[index]];

    setQuestions(
      clone.map((item, index) => ({
        ...item,
        number: index + 1,
      })),
    );
  };

  // =======================================================
  // BUILD CROSSWORD
  // =======================================================

  const crossword = useMemo(() => {
    const vertical = normalizeAnswer(verticalAnswer);

    if (!vertical) {
      return {
        grid: [],
        placements: [],
        width: 0,
        height: 0,
        verticalCol: 0,
      };
    }

    const placements = [];

    const verticalCol = 0;

    questions.forEach((item, questionIndex) => {
      const answer = normalizeAnswer(item.answer);

      if (!answer) return;

      const requiredLetter = vertical[questionIndex] || "";

      if (!requiredLetter) return;

      let answerIndex = Number.isInteger(Number(item.answerIndex))
        ? Number(item.answerIndex)
        : -1;

      // Không chọn thủ công thì tự tìm
      if (
        answerIndex < 0 ||
        answerIndex >= answer.length ||
        answer[answerIndex] !== requiredLetter
      ) {
        answerIndex = answer.indexOf(requiredLetter);
      }

      if (answerIndex === -1) {
        return;
      }

      placements.push({
        questionId: item.id,

        number: Number(item.number) || questionIndex + 1,

        answer,

        row: questionIndex,

        // Chữ giao nằm cùng cột
        col: verticalCol - answerIndex,

        answerIndex,

        requiredLetter,
      });
    });

    let minCol = verticalCol;
    let maxCol = verticalCol;

    placements.forEach((placement) => {
      minCol = Math.min(minCol, placement.col);

      maxCol = Math.max(maxCol, placement.col + placement.answer.length - 1);
    });

    const padding = 2;

    const width = maxCol - minCol + 1 + padding * 2;

    const height = Math.max(vertical.length, questions.length) + padding * 2;

    const offsetCol = padding - minCol;

    const offsetRow = padding;

    const actualVerticalCol = verticalCol + offsetCol;

    const grid = Array.from(
      {
        length: height,
      },
      () =>
        Array.from(
          {
            length: width,
          },
          () => ({
            active: false,
            letter: "",
            numbers: [],
            wordIds: [],
            type: null,
          }),
        ),
    );

    // =====================================================
    // VERTICAL
    // =====================================================

    vertical.split("").forEach((letter, index) => {
      const row = index + offsetRow;

      grid[row][actualVerticalCol] = {
        active: true,

        letter,

        numbers: [index + 1],

        wordIds: [questions[index]?.id].filter(Boolean),

        type: "vertical",
      };
    });

    // =====================================================
    // HORIZONTAL
    // =====================================================

    placements.forEach((placement) => {
      const row = placement.row + offsetRow;

      const startCol = placement.col + offsetCol;

      placement.answer.split("").forEach((letter, charIndex) => {
        const col = startCol + charIndex;

        if (row < 0 || row >= height || col < 0 || col >= width) {
          return;
        }

        const existing = grid[row][col];

        const isIntersection = existing.active;

        grid[row][col] = {
          active: true,

          letter,

          numbers: [
            ...new Set([
              ...(existing.numbers || []),
              ...(charIndex === placement.answerIndex
                ? [placement.number]
                : []),
            ]),
          ],

          wordIds: [
            ...new Set([...(existing.wordIds || []), placement.questionId]),
          ],

          type: isIntersection ? "intersection" : "horizontal",
        };
      });
    });

    return {
      grid,

      placements,

      width,

      height,

      verticalCol: actualVerticalCol,
    };
  }, [verticalAnswer, questions]);

  // =======================================================
  // VALIDATION
  // =======================================================

  const validation = useMemo(() => {
    const errors = [];

    const vertical = normalizeAnswer(verticalAnswer);

    if (!name.trim()) {
      errors.push("Chưa nhập tên game.");
    }

    if (!vertical) {
      errors.push("Chưa nhập đáp án hàng dọc.");
    }

    if (vertical && questions.length !== vertical.length) {
      errors.push(
        `Số câu hỏi (${questions.length}) phải bằng số chữ của đáp án hàng dọc (${vertical.length}).`,
      );
    }

    questions.forEach((item, index) => {
      if (!item.question?.trim()) {
        errors.push(`Câu ${index + 1}: chưa nhập câu hỏi.`);
      }

      const answer = normalizeAnswer(item.answer);

      if (!answer) {
        errors.push(`Câu ${index + 1}: chưa nhập đáp án.`);

        return;
      }

      const requiredLetter = vertical[index];

      if (requiredLetter && !answer.includes(requiredLetter)) {
        errors.push(
          `Câu ${index + 1}: đáp án phải chứa chữ "${requiredLetter}".`,
        );
      }

      if (
        requiredLetter &&
        (item.answerIndex === null || item.answerIndex === undefined)
      ) {
        errors.push(`Câu ${index + 1}: chưa chọn ô chữ giao.`);
      }

      if (
        item.answerIndex !== null &&
        item.answerIndex !== undefined &&
        requiredLetter &&
        answer[item.answerIndex] !== requiredLetter
      ) {
        errors.push(
          `Câu ${index + 1}: ô chữ giao phải là "${requiredLetter}".`,
        );
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }, [name, verticalAnswer, questions]);

  // =======================================================
  // SAVE
  // =======================================================

  const handleSave = async () => {
    if (!validation.valid) {
      message.warning(validation.errors[0] || "Vui lòng kiểm tra dữ liệu.");

      return;
    }

    const normalizedVertical = normalizeAnswer(verticalAnswer);

    // =====================================================
    // WORDS
    // =====================================================

    const words = questions.map((item, index) => {
      const answer = normalizeAnswer(item.answer);

      const placement = crossword.placements.find(
        (p) => p.questionId === item.id,
      );

      return {
        id: item.id,

        number: index + 1,

        word: answer,

        answer,

        answerDisplay: item.answer?.trim() || "",

        clue: item.question?.trim() || "",

        question: item.question?.trim() || "",

        points: Number(item.points) || 10,

        direction: "horizontal",

        row: placement?.row ?? index,

        col: placement?.col ?? 0,

        answerIndex: placement?.answerIndex ?? item.answerIndex ?? 0,

        requiredLetter: normalizedVertical[index] || null,
      };
    });

    // =====================================================
    // GRID
    // =====================================================

    const grid = crossword.grid.map((row) =>
      row.map((cell) => ({
        active: Boolean(cell.active),

        letter: cell.letter || "",

        numbers: cell.numbers || [],

        wordIds: cell.wordIds || [],

        type: cell.type || null,
      })),
    );

    // =====================================================
    // QUESTIONS
    // =====================================================

    const questionData = questions.map((item, index) => ({
      id: item.id,

      number: index + 1,

      question: item.question?.trim() || "",

      answer: normalizeAnswer(item.answer),

      answerDisplay: item.answer?.trim() || "",

      points: Number(item.points) || 10,

      answerIndex: Number(item.answerIndex),

      requiredLetter: normalizedVertical[index] || null,
    }));

    // =====================================================
    // PLACEMENTS
    // =====================================================

    const placements = crossword.placements.map((item) => ({
      questionId: item.questionId,

      number: item.number,

      answer: item.answer,

      row: item.row,

      col: item.col,

      answerIndex: item.answerIndex,

      requiredLetter: item.requiredLetter || null,
    }));

    // =====================================================
    // CROSSWORD DATA
    // =====================================================

    const crosswordData = {
      version: 2,

      verticalAnswer: normalizedVertical,

      verticalAnswerDisplay: verticalAnswer.trim(),

      width: crossword.width,

      height: crossword.height,

      rows: crossword.height,

      cols: crossword.width,

      verticalCol: crossword.verticalCol,

      words,

      questions: questionData,

      placements,

      grid,
    };

    // =====================================================
    // GAME DATA
    // =====================================================

    const gameData = {
      name: name.trim(),

      description: description.trim(),

      type: "crossword",

      teacher_id: teacherId || game?.teacher_id,

      backgroundConfig: {
        type: "color",

        value: "#F8F9FC",
      },

      theme: {
        primary: COLORS.navy,

        secondary: COLORS.gold,

        primaryColor: COLORS.navy,

        secondaryColor: COLORS.gold,

        font: "Be Vietnam Pro",

        fontFamily: "Be Vietnam Pro",

        borderRadius: 20,
      },

      settings: {
        showTimer,

        timeLimit: Number(timeLimit) || 60,

        allowRetry,

        showAnswerAfterSubmit,

        shuffleQuestions: false,

        shuffleAnswers: false,

        showPoints: true,

        showScore: true,

        showProgress: false,

        allowHint: false,

        allowSkip: false,
      },

      media: {
        backgroundMusic: oldBackgroundMusic || null,

        correctSound: oldCorrectSound || null,

        wrongSound: oldWrongSound || null,
      },

      crossword: crosswordData,

      questions: [],

      pairs: [],

      wheel: {},

      cards: [],

      sorting: {},

      dragDrop: {},

      thumbnail: thumbnail || undefined,

      background: background || undefined,

      backgroundMusic: backgroundMusic || undefined,

      correctSound: correctSound || undefined,

      wrongSound: wrongSound || undefined,
    };

    console.log("SAVE CROSSWORD:", gameData);

    try {
      setLoading(true);

      let response;

      if (isEdit) {
        response = await updateGame(game.id, gameData);
      } else {
        response = await createGame(gameData);
      }

      message.success(
        isEdit
          ? "Cập nhật game ô chữ thành công!"
          : "Tạo game ô chữ thành công!",
      );

      if (typeof onSuccess === "function") {
        onSuccess(response);
      }
    } catch (error) {
      console.error("SAVE CROSSWORD ERROR:", error);

      message.error(error?.message || "Không thể lưu game ô chữ.");
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // UPLOAD
  // =======================================================

  const beforeUpload = (setter) => (file) => {
    setter(file);

    return false;
  };

  const removeUpload = (setter) => () => {
    setter(null);
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (initializing) {
    return (
      <div
        style={{
          minHeight: 500,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",
        }}
      >
        <Space direction="vertical" align="center">
          <Spin size="large" />

          <Text type="secondary">Đang tải dữ liệu game...</Text>
        </Space>
      </div>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div
      style={{
        minHeight: "100%",
        background: COLORS.bg,
        padding: 24,
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          marginBottom: 20,
          boxShadow: "0 4px 18px rgba(15,23,42,.05)",
        }}
      >
        <Row justify="space-between" align="middle" gutter={[20, 20]}>
          <Col>
            <Space size={12}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                disabled={loading}
              >
                Quay lại
              </Button>

              <Divider type="vertical" />

              <Space direction="vertical" size={2}>
                <Text
                  style={{
                    color: COLORS.gold,
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Game giáo lý
                </Text>

                <Title
                  level={2}
                  style={{
                    margin: 0,
                    color: COLORS.navy,
                  }}
                >
                  ✝️ {isEdit ? "Chỉnh sửa ô chữ" : "Tạo game ô chữ"}
                </Title>
              </Space>
            </Space>
          </Col>

          <Col>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={loading}
              disabled={!validation.valid}
              onClick={handleSave}
              style={{
                background: COLORS.navy,
                borderColor: COLORS.navy,
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              {isEdit ? "Cập nhật game" : "Lưu game"}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* =================================================
          VALIDATION
      ================================================= */}

      {!validation.valid && validation.errors.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{
            marginBottom: 20,
            borderRadius: 12,
          }}
          message="Game chưa hoàn chỉnh"
          description={
            <ul
              style={{
                margin: "6px 0 0 18px",
                padding: 0,
              }}
            >
              {validation.errors.slice(0, 10).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
        />
      )}

      <Row gutter={[20, 20]}>
        {/* =============================================
            LEFT
        ============================================== */}

        <Col xs={24} lg={10}>
          {/* BASIC */}

          <Card
            bordered={false}
            title="Thông tin game"
            style={{
              borderRadius: 16,
              marginBottom: 20,
            }}
          >
            <Space
              direction="vertical"
              size={18}
              style={{
                width: "100%",
              }}
            >
              <div>
                <Text strong>
                  Tên game{" "}
                  <span
                    style={{
                      color: COLORS.danger,
                    }}
                  >
                    *
                  </span>
                </Text>

                <Input
                  size="large"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Ô chữ Giáo lý"
                  style={{
                    marginTop: 8,
                  }}
                />
              </div>

              <div>
                <Text strong>Mô tả</Text>

                <Input.TextArea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả game..."
                  style={{
                    marginTop: 8,
                  }}
                />
              </div>
            </Space>
          </Card>

          {/* VERTICAL */}

          <Card
            bordered={false}
            title={
              <Space>
                <span>Đáp án hàng dọc</span>

                <Tag color="gold">
                  {normalizeAnswer(verticalAnswer).length} chữ
                </Tag>
              </Space>
            }
            style={{
              borderRadius: 16,
              marginBottom: 20,
            }}
          >
            <Input
              size="large"
              value={verticalAnswer}
              onChange={(e) => setVerticalAnswer(e.target.value)}
              placeholder="VD: GIESU"
              style={{
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            />

            <Text
              type="secondary"
              style={{
                display: "block",
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              Số câu hỏi hàng ngang phải bằng số chữ của đáp án hàng dọc.
            </Text>
          </Card>

          {/* QUESTIONS */}

          <Card
            bordered={false}
            title={
              <Space>
                <span>Câu hỏi hàng ngang</span>

                <Tag color="blue">{questions.length}</Tag>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addQuestion}
                style={{
                  background: COLORS.navy,
                  borderColor: COLORS.navy,
                }}
              >
                Thêm câu
              </Button>
            }
            style={{
              borderRadius: 16,
            }}
          >
            <Space
              direction="vertical"
              size={14}
              style={{
                width: "100%",
              }}
            >
              {questions.map((item, index) => {
                const answer = normalizeAnswer(item.answer);

                const vertical = normalizeAnswer(verticalAnswer);

                const requiredLetter = vertical[index];

                const selectedLetter =
                  item.answerIndex !== null && item.answerIndex !== undefined
                    ? answer[item.answerIndex]
                    : null;

                const valid =
                  Boolean(item.question?.trim()) &&
                  Boolean(answer) &&
                  Boolean(requiredLetter) &&
                  selectedLetter === requiredLetter;

                return (
                  <Card
                    key={item.id}
                    size="small"
                    style={{
                      borderRadius: 14,

                      border: valid
                        ? `1px solid ${COLORS.border}`
                        : "1px solid #ffccc7",

                      background: valid ? "#fff" : "#fffafa",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size={12}
                      style={{
                        width: "100%",
                      }}
                    >
                      {/* HEADER */}

                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space wrap>
                            <Tag color="blue">Câu {index + 1}</Tag>

                            {requiredLetter && (
                              <Tag color="gold">Chữ giao: {requiredLetter}</Tag>
                            )}

                            {valid && (
                              <Tag color="green" icon={<CheckCircleOutlined />}>
                                Hợp lệ
                              </Tag>
                            )}
                          </Space>
                        </Col>

                        <Col>
                          <Space size={2}>
                            <Button
                              size="small"
                              type="text"
                              disabled={index === 0}
                              icon={<UpOutlined />}
                              onClick={() => moveQuestion(index, -1)}
                            />

                            <Button
                              size="small"
                              type="text"
                              disabled={index === questions.length - 1}
                              icon={<DownOutlined />}
                              onClick={() => moveQuestion(index, 1)}
                            />

                            <Button
                              danger
                              size="small"
                              type="text"
                              icon={<DeleteOutlined />}
                              onClick={() => removeQuestion(item.id)}
                            />
                          </Space>
                        </Col>
                      </Row>

                      {/* QUESTION */}

                      <Input.TextArea
                        rows={3}
                        value={item.question}
                        onChange={(e) =>
                          updateQuestion(item.id, "question", e.target.value)
                        }
                        placeholder="Nhập câu hỏi..."
                      />

                      {/* ANSWER */}

                      <Row gutter={[8, 8]}>
                        <Col xs={24} sm={17}>
                          <Input
                            value={item.answer}
                            onChange={(e) =>
                              updateQuestion(item.id, "answer", e.target.value)
                            }
                            placeholder="Nhập đáp án"
                          />
                        </Col>

                        <Col xs={24} sm={7}>
                          <InputNumber
                            min={1}
                            max={1000}
                            value={item.points}
                            onChange={(value) =>
                              updateQuestion(item.id, "points", value || 10)
                            }
                            addonAfter="đ"
                            style={{
                              width: "100%",
                            }}
                          />
                        </Col>
                      </Row>

                      {/* =====================================
                            SELECT INTERSECTION LETTER
                        ====================================== */}

                      {answer && (
                        <div
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: COLORS.soft,
                            border: `1px solid ${COLORS.border}`,
                          }}
                        >
                          <Text
                            strong
                            style={{
                              display: "block",
                              marginBottom: 8,
                            }}
                          >
                            Chọn ô chữ giao{" "}
                            {requiredLetter && `với chữ "${requiredLetter}"`}
                          </Text>

                          <Space wrap size={6}>
                            {answer.split("").map((letter, charIndex) => {
                              const isSelected = item.answerIndex === charIndex;

                              const isCorrectLetter = letter === requiredLetter;

                              return (
                                <Tooltip
                                  key={charIndex}
                                  title={
                                    isCorrectLetter
                                      ? "Có thể chọn làm chữ giao"
                                      : requiredLetter
                                        ? `Phải chọn chữ "${requiredLetter}"`
                                        : "Chưa có chữ hàng dọc tương ứng"
                                  }
                                >
                                  <Button
                                    onClick={() =>
                                      selectIntersection(item.id, charIndex)
                                    }
                                    disabled={
                                      Boolean(requiredLetter) &&
                                      !isCorrectLetter
                                    }
                                    style={{
                                      width: 42,
                                      height: 42,
                                      padding: 0,
                                      fontWeight: 800,
                                      fontSize: 16,
                                      borderRadius: 8,

                                      background: isSelected
                                        ? COLORS.gold
                                        : isCorrectLetter
                                          ? "#FFF8E1"
                                          : "#fff",

                                      borderColor: isSelected
                                        ? COLORS.gold
                                        : isCorrectLetter
                                          ? COLORS.gold
                                          : COLORS.border,

                                      color: isSelected
                                        ? COLORS.navy
                                        : COLORS.text,
                                    }}
                                  >
                                    {letter}
                                  </Button>
                                </Tooltip>
                              );
                            })}
                          </Space>

                          <Text
                            type="secondary"
                            style={{
                              display: "block",
                              marginTop: 8,
                              fontSize: 12,
                            }}
                          >
                            Ô màu vàng là chữ bạn đã chọn làm giao điểm.
                          </Text>
                        </div>
                      )}

                      {!valid && (
                        <Alert
                          type="warning"
                          showIcon
                          message={
                            !item.question?.trim()
                              ? "Chưa nhập câu hỏi."
                              : !answer
                                ? "Chưa nhập đáp án."
                                : !requiredLetter
                                  ? "Đáp án hàng dọc chưa đủ chữ cho câu này."
                                  : !answer.includes(requiredLetter)
                                    ? `Đáp án phải chứa chữ "${requiredLetter}".`
                                    : item.answerIndex === null ||
                                        item.answerIndex === undefined
                                      ? "Hãy chọn ô chữ giao."
                                      : `Ô được chọn phải là chữ "${requiredLetter}".`
                          }
                        />
                      )}
                    </Space>
                  </Card>
                );
              })}
            </Space>
          </Card>

          {/* SETTINGS */}

          <Card
            bordered={false}
            title="Thiết lập game"
            style={{
              borderRadius: 16,
              marginTop: 20,
            }}
          >
            <Space
              direction="vertical"
              size={18}
              style={{
                width: "100%",
              }}
            >
              <Row justify="space-between" align="middle">
                <Text>⏱️ Hiển thị thời gian</Text>

                <Switch checked={showTimer} onChange={setShowTimer} />
              </Row>

              {showTimer && (
                <div>
                  <Text strong>Thời gian chơi</Text>

                  <InputNumber
                    min={10}
                    max={3600}
                    value={timeLimit}
                    onChange={(value) => setTimeLimit(value || 60)}
                    addonAfter="giây"
                    style={{
                      width: "100%",
                      marginTop: 8,
                    }}
                  />
                </div>
              )}

              <Row justify="space-between" align="middle">
                <Text>🔄 Cho phép chơi lại</Text>

                <Switch checked={allowRetry} onChange={setAllowRetry} />
              </Row>

              <Row justify="space-between" align="middle">
                <Text>💡 Hiển thị đáp án sau khi trả lời</Text>

                <Switch
                  checked={showAnswerAfterSubmit}
                  onChange={setShowAnswerAfterSubmit}
                />
              </Row>
            </Space>
          </Card>

          {/* MEDIA */}

          <Card
            bordered={false}
            title="Media"
            style={{
              borderRadius: 16,
              marginTop: 20,
            }}
          >
            <Space
              direction="vertical"
              size={20}
              style={{
                width: "100%",
              }}
            >
              <div>
                <Text strong>
                  <FileImageOutlined /> Thumbnail
                </Text>

                <Dragger
                  multiple={false}
                  maxCount={1}
                  accept="image/*"
                  beforeUpload={beforeUpload(setThumbnail)}
                  onRemove={removeUpload(setThumbnail)}
                  defaultFileList={createPreviewFileList(
                    thumbnail,
                    oldThumbnail,
                    "thumbnail",
                  )}
                  style={{
                    marginTop: 8,
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>

                  <p className="ant-upload-text">Click hoặc kéo ảnh vào đây</p>
                </Dragger>
              </div>

              <div>
                <Text strong>
                  <FileImageOutlined /> Background
                </Text>

                <Dragger
                  multiple={false}
                  maxCount={1}
                  accept="image/*"
                  beforeUpload={beforeUpload(setBackground)}
                  onRemove={removeUpload(setBackground)}
                  defaultFileList={createPreviewFileList(
                    background,
                    oldBackground,
                    "background",
                  )}
                  style={{
                    marginTop: 8,
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>

                  <p className="ant-upload-text">Chọn ảnh nền game</p>
                </Dragger>
              </div>

              <div>
                <Text strong>
                  <SoundOutlined /> Nhạc nền
                </Text>

                <Dragger
                  multiple={false}
                  maxCount={1}
                  accept="audio/*"
                  beforeUpload={beforeUpload(setBackgroundMusic)}
                  onRemove={removeUpload(setBackgroundMusic)}
                >
                  <p className="ant-upload-drag-icon">
                    <SoundOutlined />
                  </p>

                  <p className="ant-upload-text">Chọn nhạc nền</p>
                </Dragger>
              </div>

              <div>
                <Text strong>
                  <SoundOutlined /> Âm thanh đúng
                </Text>

                <Dragger
                  multiple={false}
                  maxCount={1}
                  accept="audio/*"
                  beforeUpload={beforeUpload(setCorrectSound)}
                  onRemove={removeUpload(setCorrectSound)}
                >
                  <p className="ant-upload-drag-icon">
                    <SoundOutlined />
                  </p>

                  <p className="ant-upload-text">Chọn âm thanh đúng</p>
                </Dragger>
              </div>

              <div>
                <Text strong>
                  <SoundOutlined /> Âm thanh sai
                </Text>

                <Dragger
                  multiple={false}
                  maxCount={1}
                  accept="audio/*"
                  beforeUpload={beforeUpload(setWrongSound)}
                  onRemove={removeUpload(setWrongSound)}
                >
                  <p className="ant-upload-drag-icon">
                    <SoundOutlined />
                  </p>

                  <p className="ant-upload-text">Chọn âm thanh sai</p>
                </Dragger>
              </div>
            </Space>
          </Card>
        </Col>

        {/* =============================================
            RIGHT - PREVIEW
        ============================================== */}

        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            title={
              <Space wrap>
                <span>Preview ô chữ</span>

                <Tag color="gold">
                  {crossword.placements.length}/{questions.length} giao điểm
                </Tag>
              </Space>
            }
            style={{
              borderRadius: 16,
              minHeight: 500,
            }}
          >
            <Alert
              type="info"
              showIcon
              message="Preview dành cho giáo lý viên"
              description="Bạn đang nhìn thấy toàn bộ đáp án. Khi người chơi tham gia, các chữ cái sẽ được ẩn."
              style={{
                marginBottom: 20,
              }}
            />

            {crossword.grid.length === 0 ? (
              <Empty description="Nhập đáp án hàng dọc để tạo ô chữ" />
            ) : (
              <div
                style={{
                  overflowX: "auto",
                  padding: 24,
                  background: COLORS.soft,
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    minWidth: crossword.width * 42,
                  }}
                >
                  {crossword.grid.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      style={{
                        display: "flex",
                        gap: 3,
                      }}
                    >
                      {row.map((cell, colIndex) => {
                        const selected =
                          selectedCell?.row === rowIndex &&
                          selectedCell?.col === colIndex;

                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => {
                              if (cell.active) {
                                setSelectedCell({
                                  row: rowIndex,
                                  col: colIndex,
                                });
                              }
                            }}
                            style={{
                              width: 40,
                              height: 40,

                              borderRadius: 7,

                              border: cell.active
                                ? `1px solid ${COLORS.navy}`
                                : "1px solid transparent",

                              background: !cell.active
                                ? "transparent"
                                : selected
                                  ? COLORS.gold
                                  : cell.type === "intersection"
                                    ? "#FFF8E1"
                                    : "#fff",

                              display: "flex",

                              alignItems: "center",

                              justifyContent: "center",

                              position: "relative",

                              cursor: cell.active ? "pointer" : "default",

                              boxShadow: cell.active
                                ? "0 1px 3px rgba(15,23,42,.05)"
                                : "none",
                            }}
                          >
                            {cell.active && (
                              <>
                                {cell.numbers?.length > 0 && (
                                  <span
                                    style={{
                                      position: "absolute",

                                      top: 2,

                                      left: 4,

                                      fontSize: 8,

                                      fontWeight: 700,

                                      color: COLORS.navy,
                                    }}
                                  >
                                    {cell.numbers[0]}
                                  </span>
                                )}

                                <span
                                  style={{
                                    fontSize: 16,

                                    fontWeight: 800,

                                    color: COLORS.navy,
                                  }}
                                >
                                  {cell.letter}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Divider />

            {/* STATS */}

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={8}>
                <Card
                  size="small"
                  style={{
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  <Text type="secondary">Câu hỏi</Text>

                  <Title
                    level={3}
                    style={{
                      margin: "4px 0 0",
                      color: COLORS.navy,
                    }}
                  >
                    {questions.length}
                  </Title>
                </Card>
              </Col>

              <Col xs={24} sm={8}>
                <Card
                  size="small"
                  style={{
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  <Text type="secondary">Giao điểm</Text>

                  <Title
                    level={3}
                    style={{
                      margin: "4px 0 0",
                      color: COLORS.gold,
                    }}
                  >
                    {crossword.placements.length}
                  </Title>
                </Card>
              </Col>

              <Col xs={24} sm={8}>
                <Card
                  size="small"
                  style={{
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  <Text type="secondary">Tổng điểm</Text>

                  <Title
                    level={3}
                    style={{
                      margin: "4px 0 0",
                      color: COLORS.navy,
                    }}
                  >
                    {questions.reduce(
                      (total, item) => total + Number(item.points || 0),
                      0,
                    )}
                  </Title>
                </Card>
              </Col>
            </Row>

            <Divider />

            {/* QUESTION PREVIEW */}

            <Title
              level={4}
              style={{
                color: COLORS.navy,
              }}
            >
              Danh sách câu hỏi
            </Title>

            <Space
              direction="vertical"
              size={8}
              style={{
                width: "100%",
              }}
            >
              {questions.map((item, index) => {
                const answer = normalizeAnswer(item.answer);

                const intersection =
                  item.answerIndex !== null && item.answerIndex !== undefined
                    ? answer[item.answerIndex]
                    : "—";

                return (
                  <Card
                    key={item.id}
                    size="small"
                    style={{
                      borderRadius: 10,
                    }}
                  >
                    <Row
                      justify="space-between"
                      align="middle"
                      gutter={[10, 10]}
                    >
                      <Col flex="1">
                        <Space direction="vertical" size={2}>
                          <Text strong>
                            {index + 1}. {item.question || "Chưa có câu hỏi"}
                          </Text>

                          <Space wrap>
                            <Text type="secondary">
                              Đáp án: {answer || "—"}
                            </Text>

                            <Tag color="gold">Giao: {intersection}</Tag>
                          </Space>
                        </Space>
                      </Col>

                      <Col>
                        <Tag color="blue">{Number(item.points || 0)} điểm</Tag>
                      </Col>
                    </Row>
                  </Card>
                );
              })}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* =============================================
          BOTTOM SAVE
      ============================================== */}

      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <Row justify="end" gutter={12}>
          <Col>
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              disabled={loading}
            >
              Hủy
            </Button>
          </Col>

          <Col>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={loading}
              disabled={!validation.valid}
              onClick={handleSave}
              style={{
                background: COLORS.navy,
                borderColor: COLORS.navy,
                minWidth: 160,
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              {isEdit ? "Cập nhật game" : "Tạo game"}
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CrosswordGameEditor;
