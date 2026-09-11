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
  PlusOutlined,
  SaveOutlined,
  SoundOutlined,
  UpOutlined,
} from "@ant-design/icons";

import {
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Grid3X3,
  Lightbulb,
  ListChecks,
  RotateCcw,
  Save,
  Shuffle,
  SkipForward,
  Sparkles,
  Target,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";

import { createGame, updateGame } from "../../../api/gameApi";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",

  gold: "#D9A441",
  goldDark: "#B8892F",
  goldLight: "#FBF5E7",

  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#173B5E",
  textSecondary: "#64748B",
  muted: "#94A3B8",

  border: "#E2E8F0",
  navyLight: "#EEF3F7",

  grayBg: "#F1F5F9",

  success: "#2E7D5B",
  successBg: "#EAF6F0",

  warning: "#B7791F",
  warningBg: "#FFF7E5",

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

const { Title, Text } = Typography;

/* =========================================================
   HELPERS
========================================================= */

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

/* =========================================================
   COMPONENT
========================================================= */

const CrosswordGameEditor = ({ teacherId, game = null, onSuccess, onBack }) => {
  const isEdit = Boolean(game?.id);

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  /* =======================================================
     BASIC
  ======================================================= */

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  /* =======================================================
     CROSSWORD
  ======================================================= */

  const [verticalAnswer, setVerticalAnswer] = useState("");

  const [questions, setQuestions] = useState([createEmptyQuestion(1, 1)]);

  /* =======================================================
     SETTINGS
  ======================================================= */

  const [showTimer, setShowTimer] = useState(true);
  const [timeLimit, setTimeLimit] = useState(60);

  const [allowRetry, setAllowRetry] = useState(true);
  const [showAnswerAfterSubmit, setShowAnswerAfterSubmit] = useState(true);

  const [allowHint, setAllowHint] = useState(false);
  const [allowSkip, setAllowSkip] = useState(false);

  const [showProgress, setShowProgress] = useState(false);
  const [showScore, setShowScore] = useState(true);
  const [showPoints, setShowPoints] = useState(true);

  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  const [shuffleAnswers, setShuffleAnswers] = useState(false);

  /* =======================================================
     FILES
  ======================================================= */

  const [thumbnail, setThumbnail] = useState(null);
  const [background, setBackground] = useState(null);

  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [correctSound, setCorrectSound] = useState(null);
  const [wrongSound, setWrongSound] = useState(null);

  /* =======================================================
     BACKGROUND CONFIG
  ======================================================= */

  const [bgColor, setBgColor] = useState(COLORS.background);
  const [bgImage, setBgImage] = useState(null);

  /* =======================================================
     OLD FILE URLS
  ======================================================= */

  const [oldThumbnail, setOldThumbnail] = useState(null);
  const [oldBackground, setOldBackground] = useState(null);

  const [oldBackgroundMusic, setOldBackgroundMusic] = useState(null);

  const [oldCorrectSound, setOldCorrectSound] = useState(null);
  const [oldWrongSound, setOldWrongSound] = useState(null);

  /* =======================================================
     SELECTED CELL
  ======================================================= */

  const [selectedCell, setSelectedCell] = useState(null);

  /* =======================================================
     LOAD GAME
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadGame = () => {
      try {
        setInitializing(true);

        /* =================================================
           CREATE MODE
        ================================================= */

        if (!game) {
          setName("");
          setDescription("");

          setVerticalAnswer("");

          setQuestions([createEmptyQuestion(1, 1)]);

          setShowTimer(true);
          setTimeLimit(60);

          setAllowRetry(true);
          setShowAnswerAfterSubmit(true);

          setAllowHint(false);
          setAllowSkip(false);

          setShowProgress(false);
          setShowScore(true);
          setShowPoints(true);

          setShuffleQuestions(false);
          setShuffleAnswers(false);

          setThumbnail(null);
          setBackground(null);

          setBackgroundMusic(null);
          setCorrectSound(null);
          setWrongSound(null);

          setBgColor(COLORS.background);
          setBgImage(null);

          setOldThumbnail(null);
          setOldBackground(null);

          setOldBackgroundMusic(null);
          setOldCorrectSound(null);
          setOldWrongSound(null);

          return;
        }

        /* =================================================
           BASIC
        ================================================= */

        setName(game.name || "");
        setDescription(game.description || "");

        /* =================================================
           CROSSWORD
        ================================================= */

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

        /* =================================================
           QUESTIONS
        ================================================= */

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

        /* =================================================
           SETTINGS
        ================================================= */

        const settings = game.settings || {};

        setShowTimer(
          settings.showTimer !== undefined ? Boolean(settings.showTimer) : true,
        );

        setTimeLimit(
          settings.timeLimit !== undefined
            ? Number(settings.timeLimit) || 60
            : 60,
        );

        setAllowRetry(
          settings.allowRetry !== undefined
            ? Boolean(settings.allowRetry)
            : true,
        );

        setShowAnswerAfterSubmit(
          settings.showAnswerAfterSubmit !== undefined
            ? Boolean(settings.showAnswerAfterSubmit)
            : true,
        );

        setAllowHint(
          settings.allowHint !== undefined
            ? Boolean(settings.allowHint)
            : false,
        );

        setAllowSkip(
          settings.allowSkip !== undefined
            ? Boolean(settings.allowSkip)
            : false,
        );

        setShowProgress(
          settings.showProgress !== undefined
            ? Boolean(settings.showProgress)
            : false,
        );

        setShowScore(
          settings.showScore !== undefined ? Boolean(settings.showScore) : true,
        );

        setShowPoints(
          settings.showPoints !== undefined
            ? Boolean(settings.showPoints)
            : true,
        );

        setShuffleQuestions(
          settings.shuffleQuestions !== undefined
            ? Boolean(settings.shuffleQuestions)
            : false,
        );

        setShuffleAnswers(
          settings.shuffleAnswers !== undefined
            ? Boolean(settings.shuffleAnswers)
            : false,
        );

        /* =================================================
           BACKGROUND
        ================================================= */

        const bgConfig = game.background;

        if (
          bgConfig &&
          typeof bgConfig === "object" &&
          !Array.isArray(bgConfig)
        ) {
          const loadedColor = bgConfig.color || COLORS.background;

          const loadedImage = bgConfig.image || null;

          setBgColor(loadedColor);
          setBgImage(loadedImage);
          setOldBackground(loadedImage);
        } else if (typeof bgConfig === "string") {
          setBgColor(COLORS.background);
          setBgImage(bgConfig);
          setOldBackground(bgConfig);
        } else {
          setBgColor(COLORS.background);
          setBgImage(null);
          setOldBackground(null);
        }

        /* =================================================
           THUMBNAIL
        ================================================= */

        setOldThumbnail(game.thumbnail || null);

        /* =================================================
           MEDIA
        ================================================= */

        const media = game.media || {};

        setOldBackgroundMusic(media.backgroundMusic || null);

        setOldCorrectSound(media.correctSound || null);

        setOldWrongSound(media.wrongSound || null);
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

  /* =======================================================
     UPDATE QUESTION
  ======================================================= */

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

        if (field === "answer") {
          next.answerIndex = null;
          next.answerDisplay = value;
        }

        return next;
      }),
    );
  };

  /* =======================================================
     SELECT INTERSECTION
  ======================================================= */

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

  /* =======================================================
     ADD QUESTION
  ======================================================= */

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

  /* =======================================================
     DELETE QUESTION
  ======================================================= */

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

  /* =======================================================
     MOVE QUESTION
  ======================================================= */

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

  /* =======================================================
     BUILD CROSSWORD
  ======================================================= */

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

      if (!answer) {
        return;
      }

      const requiredLetter = vertical[questionIndex] || "";

      if (!requiredLetter) {
        return;
      }

      let answerIndex = Number.isInteger(Number(item.answerIndex))
        ? Number(item.answerIndex)
        : -1;

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

    vertical.split("").forEach((letter, index) => {
      const row = index + offsetRow;

      if (row < 0 || row >= height) {
        return;
      }

      grid[row][actualVerticalCol] = {
        active: true,

        letter,

        numbers: [index + 1],

        wordIds: [questions[index]?.id].filter(Boolean),

        type: "vertical",
      };
    });

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

  /* =======================================================
     VALIDATION
  ======================================================= */

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

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {
    if (!validation.valid) {
      message.warning(validation.errors[0] || "Vui lòng kiểm tra dữ liệu.");

      return;
    }

    const normalizedVertical = normalizeAnswer(verticalAnswer);

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

        answerIndex: placement?.answerIndex ?? item.answerIndex ?? null,

        requiredLetter: normalizedVertical[index] || null,
      };
    });

    const grid = crossword.grid.map((row) =>
      row.map((cell) => ({
        active: Boolean(cell.active),

        letter: cell.letter || "",

        numbers: cell.numbers || [],

        wordIds: cell.wordIds || [],

        type: cell.type || null,
      })),
    );

    const questionData = questions.map((item, index) => ({
      id: item.id,

      number: index + 1,

      question: item.question?.trim() || "",

      answer: normalizeAnswer(item.answer),

      answerDisplay: item.answer?.trim() || "",

      points: Number(item.points) || 10,

      answerIndex:
        item.answerIndex !== null && item.answerIndex !== undefined
          ? Number(item.answerIndex)
          : null,

      requiredLetter: normalizedVertical[index] || null,
    }));

    const placements = crossword.placements.map((item) => ({
      questionId: item.questionId,

      number: item.number,

      answer: item.answer,

      row: item.row,

      col: item.col,

      answerIndex: item.answerIndex,

      requiredLetter: item.requiredLetter || null,
    }));

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

    const gameData = {
      name: name.trim(),

      description: description.trim(),

      type: "crossword",

      teacher_id: teacherId || game?.teacher_id || null,

      thumbnail:
        thumbnail instanceof File
          ? thumbnail
          : game?.thumbnail || oldThumbnail || undefined,

      background: {
        color: bgColor || COLORS.background,

        image:
          background instanceof File
            ? background
            : bgImage || oldBackground || null,
      },

      /*
       * Giữ cấu trúc theme.
       * Chỉ đổi màu mặc định sang Navy/Gold.
       */

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
        showTimer: Boolean(showTimer),

        timeLimit: Number(timeLimit) || 60,

        allowRetry: Boolean(allowRetry),

        showAnswerAfterSubmit: Boolean(showAnswerAfterSubmit),

        allowHint: Boolean(allowHint),

        allowSkip: Boolean(allowSkip),

        showProgress: Boolean(showProgress),

        showScore: Boolean(showScore),

        showPoints: Boolean(showPoints),

        shuffleQuestions: Boolean(shuffleQuestions),

        shuffleAnswers: Boolean(shuffleAnswers),
      },

      media: {
        backgroundMusic:
          backgroundMusic instanceof File
            ? backgroundMusic
            : oldBackgroundMusic || null,

        correctSound:
          correctSound instanceof File ? correctSound : oldCorrectSound || null,

        wrongSound:
          wrongSound instanceof File ? wrongSound : oldWrongSound || null,
      },

      crossword: crosswordData,

      questions: [],

      pairs: [],

      wheel: {},

      cards: [],

      sorting: {},

      dragDrop: {},

      backgroundMusic:
        backgroundMusic instanceof File ? backgroundMusic : undefined,

      correctSound: correctSound instanceof File ? correctSound : undefined,

      wrongSound: wrongSound instanceof File ? wrongSound : undefined,
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

  /* =======================================================
     UPLOAD
  ======================================================= */

  const beforeUpload = (setter) => (file) => {
    setter(file);
    return false;
  };

  const removeUpload = (setter) => () => {
    setter(null);
  };

  /* =======================================================
     SETTING ITEM
  ======================================================= */

  const SettingItem = ({ icon, title, description, checked, onChange }) => {
    return (
      <div
        style={{
          padding: 14,
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.white,
          height: "100%",
        }}
      >
        <Row justify="space-between" align="middle" gutter={12}>
          <Col flex="auto">
            <Space align="start" size={10}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: COLORS.navyLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.navy,
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>

              <div>
                <Text
                  strong
                  style={{
                    color: COLORS.text,
                    display: "block",
                    fontSize: 13,
                  }}
                >
                  {title}
                </Text>

                <Text
                  style={{
                    fontSize: 11,
                    lineHeight: 1.45,
                    color: COLORS.textSecondary,
                  }}
                >
                  {description}
                </Text>
              </div>
            </Space>
          </Col>

          <Col>
            <Switch checked={checked} onChange={onChange} />
          </Col>
        </Row>
      </div>
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (initializing) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: COLORS.background,
        }}
      >
        <Space direction="vertical" align="center" size={12}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: COLORS.navyLight,
              color: COLORS.navy,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Grid3X3 size={25} />
          </div>

          <Spin />

          <Text
            style={{
              color: COLORS.textSecondary,
            }}
          >
            Đang tải dữ liệu game...
          </Text>
        </Space>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.background,
        padding: 20,
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Card
        bordered
        style={{
          borderRadius: 14,
          marginBottom: 18,
          borderColor: COLORS.border,
          background: COLORS.white,
        }}
        styles={{
          body: {
            padding: "14px 18px",
          },
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space size={14}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                disabled={loading}
                style={{
                  borderRadius: 9,
                  height: 38,
                }}
              >
                Quay lại
              </Button>

              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: COLORS.navy,
                  color: COLORS.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Grid3X3 size={21} />
              </div>

              <div>
                <Text
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: COLORS.goldDark,
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                  }}
                >
                  Game giáo lý
                </Text>

                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: COLORS.text,
                    fontSize: 20,
                  }}
                >
                  {isEdit ? "Chỉnh sửa Game Ô Chữ" : "Tạo Game Ô Chữ"}
                </Title>

                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 12,
                  }}
                >
                  Tạo trò chơi ô chữ tương tác cho học viên
                </Text>
              </div>
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
                borderRadius: 9,
                height: 44,
                padding: "0 24px",
                fontWeight: 700,
              }}
            >
              {isEdit ? "Lưu thay đổi" : "Tạo game"}
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
          icon={<Target size={17} />}
          message={
            <Text
              strong
              style={{
                color: "#7C5A13",
              }}
            >
              Game chưa hoàn chỉnh
            </Text>
          }
          description={
            <ul
              style={{
                margin: "7px 0 0 18px",
                padding: 0,
                color: COLORS.textSecondary,
              }}
            >
              {validation.errors.slice(0, 10).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
          style={{
            marginBottom: 18,
            borderRadius: 12,
            borderColor: "#E8D7A8",
            background: COLORS.warningBg,
          }}
        />
      )}

      <Row gutter={[18, 18]} align="top">
        {/* =================================================
            LEFT
        ================================================= */}

        <Col xs={24} xl={10}>
          {/* BASIC */}

          <Card
            bordered
            style={{
              borderRadius: 14,
              marginBottom: 18,
              borderColor: COLORS.border,
            }}
            title={
              <CardTitle icon={<FileText size={17} />} title="Thông tin game" />
            }
          >
            <div
              style={{
                marginBottom: 16,
              }}
            >
              <FieldLabel>
                Tên game
                <Required />
              </FieldLabel>

              <Input
                size="large"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Ô chữ Giáo lý"
                style={{
                  borderRadius: 9,
                }}
              />
            </div>

            <div>
              <FieldLabel>Mô tả</FieldLabel>

              <Input.TextArea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả ngắn cho game..."
                style={{
                  borderRadius: 9,
                }}
              />
            </div>
          </Card>

          {/* VERTICAL */}

          <Card
            bordered
            style={{
              borderRadius: 14,
              marginBottom: 18,
              borderColor: COLORS.border,
            }}
            title={
              <CardTitle
                icon={<Sparkles size={17} />}
                title="Đáp án hàng dọc"
              />
            }
          >
            <div
              style={{
                padding: 16,
                background: COLORS.goldLight,
                border: `1px solid #EBD9A8`,
                borderRadius: 12,
              }}
            >
              <Input
                size="large"
                value={verticalAnswer}
                onChange={(e) => setVerticalAnswer(e.target.value)}
                placeholder="VD: MARIA"
                style={{
                  height: 48,
                  borderRadius: 9,
                  textAlign: "center",
                  fontWeight: 800,
                  fontSize: 20,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: COLORS.navy,
                  borderColor: "#D9C17C",
                  background: COLORS.white,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 10,
                }}
              >
                <Tag
                  style={{
                    margin: 0,
                    borderRadius: 7,
                    color: COLORS.goldDark,
                    background: COLORS.white,
                    borderColor: "#D9C17C",
                    fontWeight: 700,
                  }}
                >
                  {normalizeAnswer(verticalAnswer).length} ký tự
                </Tag>
              </div>

              <Text
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: 10,
                  fontSize: 12,
                  color: COLORS.textSecondary,
                }}
              >
                Mỗi ký tự tương ứng với một câu hỏi hàng ngang.
              </Text>
            </div>
          </Card>

          {/* QUESTIONS */}

          <Card
            bordered
            style={{
              borderRadius: 14,
              marginBottom: 18,
              borderColor: COLORS.border,
            }}
            title={
              <CardTitle
                icon={<ListChecks size={17} />}
                title="Câu hỏi hàng ngang"
                extra={
                  <Tag
                    style={{
                      margin: 0,
                      borderRadius: 7,
                      color: COLORS.navy,
                      background: COLORS.navyLight,
                      borderColor: "#D7E2EB",
                    }}
                  >
                    {questions.length} câu
                  </Tag>
                }
              />
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addQuestion}
                style={{
                  background: COLORS.navy,
                  borderColor: COLORS.navy,
                  borderRadius: 8,
                }}
              >
                Thêm câu
              </Button>
            }
          >
            <Space
              direction="vertical"
              size={12}
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
                  <div
                    key={item.id}
                    style={{
                      border: `1px solid ${valid ? "#B7D9C7" : COLORS.border}`,
                      borderRadius: 12,
                      background: COLORS.white,
                      overflow: "hidden",
                    }}
                  >
                    {/* QUESTION HEADER */}

                    <div
                      style={{
                        padding: "10px 12px",
                        background: valid ? COLORS.successBg : COLORS.grayBg,
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space size={7} wrap>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 7,
                                background: COLORS.navy,
                                color: COLORS.white,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              {item.number}
                            </div>

                            <Text
                              strong
                              style={{
                                color: COLORS.text,
                              }}
                            >
                              Câu {item.number}
                            </Text>

                            {requiredLetter && (
                              <Tag
                                style={{
                                  margin: 0,
                                  borderRadius: 6,
                                  color: COLORS.goldDark,
                                  background: COLORS.goldLight,
                                  borderColor: "#EBD9A8",
                                  fontWeight: 700,
                                }}
                              >
                                Giao: {requiredLetter}
                              </Tag>
                            )}

                            {valid && (
                              <Tag
                                icon={<CheckCircleOutlined />}
                                style={{
                                  margin: 0,
                                  borderRadius: 6,
                                  color: COLORS.success,
                                  background: COLORS.successBg,
                                  borderColor: "#B7D9C7",
                                }}
                              >
                                Hợp lệ
                              </Tag>
                            )}
                          </Space>
                        </Col>

                        <Col>
                          <Space size={3}>
                            <Tooltip title="Đưa lên">
                              <Button
                                size="small"
                                disabled={index === 0}
                                icon={<UpOutlined />}
                                onClick={() => moveQuestion(index, -1)}
                                style={{
                                  borderRadius: 6,
                                }}
                              />
                            </Tooltip>

                            <Tooltip title="Đưa xuống">
                              <Button
                                size="small"
                                disabled={index === questions.length - 1}
                                icon={<DownOutlined />}
                                onClick={() => moveQuestion(index, 1)}
                                style={{
                                  borderRadius: 6,
                                }}
                              />
                            </Tooltip>

                            <Tooltip title="Xóa câu">
                              <Button
                                size="small"
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => removeQuestion(item.id)}
                              />
                            </Tooltip>
                          </Space>
                        </Col>
                      </Row>
                    </div>

                    <div
                      style={{
                        padding: 14,
                      }}
                    >
                      {/* QUESTION */}

                      <div
                        style={{
                          marginBottom: 12,
                        }}
                      >
                        <FieldLabel>Nội dung câu hỏi</FieldLabel>

                        <Input
                          value={item.question}
                          onChange={(e) =>
                            updateQuestion(item.id, "question", e.target.value)
                          }
                          placeholder="Nhập câu hỏi..."
                          style={{
                            borderRadius: 8,
                          }}
                        />
                      </div>

                      {/* ANSWER */}

                      <Row gutter={10}>
                        <Col xs={24} md={16}>
                          <FieldLabel>Đáp án ngang</FieldLabel>

                          <Input
                            value={item.answer}
                            onChange={(e) =>
                              updateQuestion(item.id, "answer", e.target.value)
                            }
                            placeholder="Ví dụ: ADAM"
                            style={{
                              borderRadius: 8,
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          />
                        </Col>

                        <Col xs={24} md={8}>
                          <FieldLabel>Điểm</FieldLabel>

                          <InputNumber
                            min={1}
                            max={100}
                            value={item.points}
                            onChange={(value) =>
                              updateQuestion(item.id, "points", value ?? 10)
                            }
                            style={{
                              width: "100%",
                              borderRadius: 8,
                            }}
                          />
                        </Col>
                      </Row>

                      {/* INTERSECTION */}

                      {answer && requiredLetter && (
                        <div
                          style={{
                            marginTop: 14,
                            padding: 12,
                            borderRadius: 10,
                            background: COLORS.goldLight,
                            border: "1px dashed #D9C17C",
                          }}
                        >
                          <Space size={6} align="center">
                            <Target size={15} color={COLORS.goldDark} />

                            <Text
                              strong
                              style={{
                                fontSize: 12,
                                color: COLORS.text,
                              }}
                            >
                              Chọn ô giao
                            </Text>

                            <Tag
                              style={{
                                margin: 0,
                                borderRadius: 5,
                                color: COLORS.navy,
                                background: COLORS.white,
                                borderColor: "#D7E2EB",
                                fontWeight: 800,
                              }}
                            >
                              {requiredLetter}
                            </Tag>
                          </Space>

                          <div
                            style={{
                              marginTop: 10,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 5,
                            }}
                          >
                            {answer.split("").map((char, charIndex) => {
                              const isSelected = item.answerIndex === charIndex;

                              const isMatch = char === requiredLetter;

                              return (
                                <Tooltip
                                  key={charIndex}
                                  title={
                                    isMatch ? "Đây là ký tự giao" : undefined
                                  }
                                >
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      selectIntersection(item.id, charIndex)
                                    }
                                    style={{
                                      minWidth: 34,
                                      height: 34,
                                      padding: "0 8px",
                                      borderRadius: 7,
                                      fontWeight: 800,
                                      color: isSelected
                                        ? COLORS.white
                                        : COLORS.text,
                                      background: isSelected
                                        ? COLORS.navy
                                        : isMatch
                                          ? COLORS.goldLight
                                          : COLORS.white,
                                      borderColor: isSelected
                                        ? COLORS.navy
                                        : isMatch
                                          ? COLORS.gold
                                          : COLORS.border,
                                    }}
                                  >
                                    {char}
                                  </Button>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>

        {/* =================================================
            RIGHT
        ================================================= */}

        <Col xs={24} xl={14}>
          {/* PREVIEW */}

          <Card
            bordered
            style={{
              borderRadius: 14,
              marginBottom: 18,
              borderColor: COLORS.border,
            }}
            title={
              <CardTitle
                icon={<Eye size={17} />}
                title="Xem trước bảng ô chữ"
              />
            }
          >
            {crossword.grid.length === 0 ? (
              <div
                style={{
                  padding: 60,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 12,
                    background: COLORS.navyLight,
                    color: COLORS.navy,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Grid3X3 size={27} />
                </div>

                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text
                      style={{
                        color: COLORS.textSecondary,
                      }}
                    >
                      Nhập đáp án hàng dọc để xem trước bảng ô chữ
                    </Text>
                  }
                />
              </div>
            ) : (
              <div
                style={{
                  background: bgImage
                    ? `url(${bgImage})`
                    : bgColor || COLORS.background,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 12,
                  padding: 20,
                  overflowX: "auto",
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    minWidth: "max-content",
                  }}
                >
                  <div>
                    {crossword.grid.map((row, rowIndex) => (
                      <div
                        key={rowIndex}
                        style={{
                          display: "flex",
                        }}
                      >
                        {row.map((cell, colIndex) => {
                          const isVerticalCol =
                            colIndex === crossword.verticalCol;

                          const isSelected =
                            selectedCell &&
                            selectedCell.row === rowIndex &&
                            selectedCell.col === colIndex;

                          return (
                            <div
                              key={colIndex}
                              onClick={() =>
                                cell.active &&
                                setSelectedCell({
                                  row: rowIndex,
                                  col: colIndex,
                                  cell,
                                })
                              }
                              style={{
                                width: 38,
                                height: 38,
                                margin: 2,
                                borderRadius: 6,

                                background: cell.active
                                  ? isVerticalCol
                                    ? COLORS.gold
                                    : COLORS.white
                                  : "transparent",

                                border: cell.active
                                  ? isSelected
                                    ? `3px solid ${COLORS.navy}`
                                    : `1px solid ${
                                        isVerticalCol
                                          ? COLORS.goldDark
                                          : COLORS.border
                                      }`
                                  : "1px solid transparent",

                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",

                                cursor: cell.active ? "pointer" : "default",

                                boxShadow: cell.active
                                  ? "0 2px 5px rgba(23,59,94,0.08)"
                                  : "none",

                                transition: "all .15s ease",
                              }}
                            >
                              {cell.numbers && cell.numbers.length > 0 && (
                                <span
                                  style={{
                                    position: "absolute",
                                    top: 2,
                                    left: 4,
                                    fontSize: 8,
                                    lineHeight: 1,
                                    fontWeight: 800,
                                    color: COLORS.navy,
                                  }}
                                >
                                  {cell.numbers[0]}
                                </span>
                              )}

                              <span
                                style={{
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: COLORS.navy,
                                }}
                              >
                                {cell.letter}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GRID SUMMARY */}

            {crossword.grid.length > 0 && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  background: COLORS.grayBg,
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Row gutter={[8, 8]}>
                  <Col xs={8}>
                    <SummaryBox
                      icon={<Grid3X3 size={15} />}
                      label="Kích thước"
                      value={`${crossword.width} × ${crossword.height}`}
                    />
                  </Col>

                  <Col xs={8}>
                    <SummaryBox
                      icon={<ListChecks size={15} />}
                      label="Đáp án"
                      value={crossword.placements.length}
                    />
                  </Col>

                  <Col xs={8}>
                    <SummaryBox
                      icon={<Target size={15} />}
                      label="Hàng dọc"
                      value={normalizeAnswer(verticalAnswer).length}
                    />
                  </Col>
                </Row>
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
            title={
              <CardTitle icon={<Target size={17} />} title="Cài đặt trò chơi" />
            }
          >
            {/* TIMER */}

            <SectionHeader icon={<Clock3 size={16} />} title="Thời gian" />

            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: COLORS.grayBg,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <FieldLabel>Thời gian làm bài (giây)</FieldLabel>

                  <InputNumber
                    min={10}
                    max={3600}
                    value={timeLimit}
                    onChange={(value) => setTimeLimit(value || 60)}
                    disabled={!showTimer}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                    }}
                  />
                </div>
              </Col>

              <Col xs={24} md={12}>
                <SettingItem
                  icon={<Clock3 size={17} />}
                  title="Hiển thị đồng hồ"
                  description="Đếm ngược thời gian khi chơi"
                  checked={showTimer}
                  onChange={setShowTimer}
                />
              </Col>
            </Row>

            <Divider />

            {/* GAMEPLAY */}

            <SectionHeader icon={<Target size={16} />} title="Luật chơi" />

            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <SettingItem
                  icon={<RotateCcw size={17} />}
                  title="Cho phép thử lại"
                  description="Người chơi được làm lại game"
                  checked={allowRetry}
                  onChange={setAllowRetry}
                />
              </Col>

              <Col xs={24} md={12}>
                <SettingItem
                  icon={<Eye size={17} />}
                  title="Hiện đáp án sau khi nộp"
                  description="Hiển thị đáp án sau khi submit"
                  checked={showAnswerAfterSubmit}
                  onChange={setShowAnswerAfterSubmit}
                />
              </Col>

              <Col xs={24} md={12}>
                <SettingItem
                  icon={<Lightbulb size={17} />}
                  title="Cho phép gợi ý"
                  description="Người chơi có thể dùng hint"
                  checked={allowHint}
                  onChange={setAllowHint}
                />
              </Col>

              <Col xs={24} md={12}>
                <SettingItem
                  icon={<SkipForward size={17} />}
                  title="Cho phép bỏ qua"
                  description="Người chơi có thể bỏ qua câu"
                  checked={allowSkip}
                  onChange={setAllowSkip}
                />
              </Col>
            </Row>

            <Divider />

            {/* DISPLAY */}

            <SectionHeader icon={<Eye size={16} />} title="Hiển thị" />

            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <SettingItem
                  icon={<Target size={17} />}
                  title="Hiển thị tiến độ"
                  description="Hiển thị tiến độ câu hỏi"
                  checked={showProgress}
                  onChange={setShowProgress}
                />
              </Col>

              <Col xs={24} md={12}>
                <SettingItem
                  icon={<Trophy size={17} />}
                  title="Hiển thị điểm"
                  description="Hiển thị tổng điểm"
                  checked={showScore}
                  onChange={setShowScore}
                />
              </Col>

              <Col xs={24} md={12}>
                <SettingItem
                  icon={<Sparkles size={17} />}
                  title="Hiển thị điểm từng câu"
                  description="Hiển thị điểm của từng câu"
                  checked={showPoints}
                  onChange={setShowPoints}
                />
              </Col>
            </Row>

            <Divider />

            {/* SHUFFLE */}

            <SectionHeader icon={<Shuffle size={16} />} title="Xáo trộn" />

            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <SettingItem
                  icon={<Shuffle size={17} />}
                  title="Xáo trộn câu hỏi"
                  description="Thay đổi thứ tự câu hỏi"
                  checked={shuffleQuestions}
                  onChange={setShuffleQuestions}
                />
              </Col>

              <Col xs={24} md={12}>
                <SettingItem
                  icon={<Shuffle size={17} />}
                  title="Xáo trộn đáp án"
                  description="Xáo trộn đáp án khi chơi"
                  checked={shuffleAnswers}
                  onChange={setShuffleAnswers}
                />
              </Col>
            </Row>
          </Card>

          {/* BACKGROUND */}

          <Card
            bordered
            style={{
              borderRadius: 14,
              marginBottom: 18,
              borderColor: COLORS.border,
            }}
            title={
              <CardTitle
                icon={<FileImageOutlined />}
                title="Hình nền & giao diện"
              />
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <FieldLabel>Màu nền</FieldLabel>

                <Space
                  style={{
                    width: "100%",
                  }}
                  align="center"
                >
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{
                      width: 44,
                      height: 38,
                      padding: 2,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 8,
                      background: COLORS.white,
                      cursor: "pointer",
                    }}
                  />

                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{
                      borderRadius: 8,
                    }}
                  />
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <FieldLabel>Hình nền</FieldLabel>

                <Upload
                  maxCount={1}
                  beforeUpload={beforeUpload(setBackground)}
                  fileList={createPreviewFileList(
                    background,
                    oldBackground,
                    "background.png",
                  )}
                  onRemove={removeUpload(setBackground)}
                  accept="image/*"
                >
                  <Button
                    icon={<FileImageOutlined />}
                    style={{
                      borderRadius: 8,
                    }}
                  >
                    Chọn hình nền
                  </Button>
                </Upload>
              </Col>
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
            title={
              <CardTitle
                icon={<Volume2 size={17} />}
                title="Tệp đa phương tiện"
              />
            }
          >
            <Row gutter={[16, 20]}>
              <MediaUpload
                title="Ảnh thu nhỏ"
                icon={<FileImageOutlined />}
                file={thumbnail}
                oldFile={oldThumbnail}
                setter={setThumbnail}
                remove={removeUpload(setThumbnail)}
                accept="image/*"
              />

              <MediaUpload
                title="Nhạc nền"
                icon={<SoundOutlined />}
                file={backgroundMusic}
                oldFile={oldBackgroundMusic}
                setter={setBackgroundMusic}
                remove={removeUpload(setBackgroundMusic)}
                accept="audio/*"
              />

              <MediaUpload
                title="Âm thanh trả lời đúng"
                icon={<CheckCircle2 size={17} />}
                file={correctSound}
                oldFile={oldCorrectSound}
                setter={setCorrectSound}
                remove={removeUpload(setCorrectSound)}
                accept="audio/*"
              />

              <MediaUpload
                title="Âm thanh trả lời sai"
                icon={<XCircle size={17} />}
                file={wrongSound}
                oldFile={oldWrongSound}
                setter={setWrongSound}
                remove={removeUpload(setWrongSound)}
                accept="audio/*"
              />
            </Row>
          </Card>

          {/* SUMMARY */}

          <Card
            bordered
            style={{
              borderRadius: 14,
              borderColor: COLORS.border,
            }}
            title={
              <CardTitle
                icon={<CheckCircle2 size={17} />}
                title="Trạng thái game"
              />
            }
          >
            <Row gutter={[10, 10]}>
              <Col xs={12} sm={6}>
                <SummaryBox
                  icon={<ListChecks size={16} />}
                  label="Câu hỏi"
                  value={questions.length}
                />
              </Col>

              <Col xs={12} sm={6}>
                <SummaryBox
                  icon={<Grid3X3 size={16} />}
                  label="Ký tự dọc"
                  value={normalizeAnswer(verticalAnswer).length}
                />
              </Col>

              <Col xs={12} sm={6}>
                <SummaryBox
                  icon={<Clock3 size={16} />}
                  label="Thời gian"
                  value={showTimer ? `${timeLimit}s` : "∞"}
                />
              </Col>

              <Col xs={12} sm={6}>
                <SummaryBox
                  icon={<CheckCircle2 size={16} />}
                  label="Trạng thái"
                  value={validation.valid ? "Sẵn sàng" : "Chưa xong"}
                  success={validation.valid}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          BOTTOM SAVE
      ===================================================== */}

      <div
        style={{
          position: "sticky",
          bottom: 16,
          zIndex: 30,
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 18,
          pointerEvents: "none",
        }}
      >
        <Button
          type="primary"
          size="large"
          icon={<Save size={18} />}
          loading={loading}
          disabled={!validation.valid}
          onClick={handleSave}
          style={{
            pointerEvents: "auto",
            height: 48,
            padding: "0 26px",
            borderRadius: 10,
            background: COLORS.navy,
            borderColor: COLORS.navy,
            fontWeight: 700,
            boxShadow: "0 8px 20px rgba(23,59,94,0.22)",
          }}
        >
          {isEdit ? "Lưu thay đổi" : "Tạo game"}
        </Button>
      </div>
    </div>
  );
};

/* =========================================================
   CARD TITLE
========================================================= */

const CardTitle = ({ icon, title, extra }) => {
  return (
    <Space size={9}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: COLORS.navyLight,
          color: COLORS.navy,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <Text
        strong
        style={{
          color: COLORS.text,
          fontSize: 15,
        }}
      >
        {title}
      </Text>

      {extra}
    </Space>
  );
};

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({ icon, title }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: COLORS.goldLight,
          color: COLORS.goldDark,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <Text
        strong
        style={{
          color: COLORS.text,
          fontSize: 13,
        }}
      >
        {title}
      </Text>
    </div>
  );
};

/* =========================================================
   FIELD LABEL
========================================================= */

const FieldLabel = ({ children }) => {
  return (
    <Text
      strong
      style={{
        display: "block",
        marginBottom: 6,
        color: COLORS.textSecondary,
        fontSize: 12,
      }}
    >
      {children}
    </Text>
  );
};

const Required = () => (
  <span
    style={{
      color: COLORS.danger,
      marginLeft: 3,
    }}
  >
    *
  </span>
);

/* =========================================================
   MEDIA UPLOAD
========================================================= */

const MediaUpload = ({
  title,
  icon,
  file,
  oldFile,
  setter,
  remove,
  accept,
}) => {
  return (
    <Col xs={24} md={12}>
      <div
        style={{
          padding: 14,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          background: COLORS.white,
        }}
      >
        <Space
          size={8}
          style={{
            marginBottom: 9,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: COLORS.navyLight,
              color: COLORS.navy,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>

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
          beforeUpload={(uploadFile) => {
            setter(uploadFile);
            return false;
          }}
          fileList={createPreviewFileList(file, oldFile, "file")}
          onRemove={remove}
          accept={accept}
        >
          <Button
            size="small"
            icon={<FileImageOutlined />}
            style={{
              borderRadius: 7,
            }}
          >
            {file ? "Đổi tệp" : "Chọn tệp"}
          </Button>
        </Upload>
      </div>
    </Col>
  );
};

/* =========================================================
   SUMMARY BOX
========================================================= */

const SummaryBox = ({ icon, label, value, success = false }) => {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 9,
        background: success ? COLORS.successBg : COLORS.grayBg,
        border: `1px solid ${success ? "#C8E2D3" : COLORS.border}`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          color: success ? COLORS.success : COLORS.navy,
          marginBottom: 4,
        }}
      >
        {icon}
      </div>

      <Text
        style={{
          display: "block",
          fontSize: 10,
          color: COLORS.muted,
        }}
      >
        {label}
      </Text>

      <Text
        strong
        style={{
          display: "block",
          marginTop: 2,
          fontSize: 12,
          color: success ? COLORS.success : COLORS.text,
        }}
      >
        {value}
      </Text>
    </div>
  );
};

export default CrosswordGameEditor;
