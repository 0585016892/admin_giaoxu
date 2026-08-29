import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Progress,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  TrophyOutlined,
  BulbOutlined,
  SmileOutlined,
  StarOutlined,
  SendOutlined,
  KeyOutlined,
  FireOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// =========================================================
// PREMIUM GAME UI COLOR PALETTE
// =========================================================

const DEFAULT_COLORS = {
  primary: "#7C3AED", // Vivid Purple
  secondary: "#FF6B8B", // Coral Neon Pink
  accent: "#06B6D4", // Electric Cyan
  yellow: "#F59E0B", // Warm Gold
  text: "#1E1B4B", // Deep Indigo Text
  subText: "#64748B", // Cool Gray Text
  bg: "#F1F5F9", // Slate Light Neutral BG
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  success: "#10B981", // Emerald Green
  danger: "#EF4444", // Rose Red
  warning: "#F59E0B", // Amber Yellow
};

// =========================================================
// HELPER FUNCTIONS
// =========================================================

const normalizeAnswer = (value = "") => {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
};

const getWordId = (item, index) => {
  return String(item?.id ?? item?.number ?? index + 1);
};

const formatTime = (seconds = 0) => {
  const safeSeconds = Math.max(Number(seconds) || 0, 0);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remainSeconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainSeconds}`;
};

// =========================================================
// MAIN COMPONENT
// =========================================================

const CrosswordGame = ({ game, onExit }) => {
  const settings = game?.settings || {};
  const showTimer = settings.showTimer !== false;
  const showScore = settings.showScore !== false;
  const allowHint = settings.allowHint !== false;
  const allowRetry = settings.allowRetry !== false;
  const timeLimit = Math.max(Number(settings.timeLimit) || 60, 1);

  const COLORS = useMemo(() => {
    return {
      ...DEFAULT_COLORS,
      primary:
        game?.theme?.primary ||
        game?.theme?.primaryColor ||
        DEFAULT_COLORS.primary,
      secondary:
        game?.theme?.secondary ||
        game?.theme?.secondaryColor ||
        DEFAULT_COLORS.secondary,
      bg:
        game?.background?.color || game?.theme?.background || DEFAULT_COLORS.bg,
    };
  }, [game]);

  const crossword = useMemo(() => game?.crossword || {}, [game]);

  const words = useMemo(() => {
    const source = Array.isArray(crossword.words)
      ? crossword.words
      : Array.isArray(crossword.questions)
        ? crossword.questions
        : [];

    return source
      .map((item, index) => {
        const answer = item?.answer || item?.word || item?.answerDisplay || "";
        return {
          ...item,
          id: getWordId(item, index),
          number: Number(item?.number) || index + 1,
          answer,
          answerDisplay:
            item?.answerDisplay || item?.answer || item?.word || "",
          question:
            item?.question ||
            item?.clue ||
            `Câu hỏi số ${Number(item?.number) || index + 1}`,
          points: Number(item?.points) || 10,
          direction:
            String(item?.direction || "horizontal").toLowerCase() === "vertical"
              ? "vertical"
              : "horizontal",
          row: Math.max(Number(item?.row ?? index) || 0, 0),
          col: Math.max(Number(item?.col ?? 0) || 0, 0),
          answerIndex: Math.max(Number(item?.answerIndex ?? 0) || 0, 0),
        };
      })
      .filter((item) => normalizeAnswer(item.answer));
  }, [crossword]);

  const verticalAnswer = useMemo(() => {
    return normalizeAnswer(
      crossword.verticalAnswer ||
        crossword.verticalAnswerDisplay ||
        crossword.keyword ||
        "",
    );
  }, [crossword]);

  const verticalAnswerDisplay =
    crossword.verticalAnswerDisplay ||
    crossword.verticalAnswer ||
    crossword.keyword ||
    "";

  const gridSize = useMemo(() => {
    let maxRow = 0;
    let maxCol = 0;

    words.forEach((item) => {
      const answer = normalizeAnswer(item.answer);
      if (!answer) return;
      const row = item.row;
      const col = item.col;

      if (item.direction === "vertical") {
        maxRow = Math.max(maxRow, row + answer.length - 1);
        maxCol = Math.max(maxCol, col);
      } else {
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, col + answer.length - 1);
      }
    });

    const savedRows = Math.max(Number(crossword.rows) || 0, 1);
    const savedCols = Math.max(Number(crossword.cols) || 0, 1);

    return {
      rows: Math.max(savedRows, maxRow + 1, 1),
      cols: Math.max(savedCols, maxCol + 1, 1),
    };
  }, [words, crossword]);

  const rows = gridSize.rows;
  const cols = gridSize.cols;

  // Game States
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState({});
  const [revealed, setRevealed] = useState({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameOver, setGameOver] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [finalCompleted, setFinalCompleted] = useState(false);
  const [finalWrong, setFinalWrong] = useState(false);

  const resetState = () => {
    setAnswers({});
    setCompleted({});
    setRevealed({});
    setScore(0);
    setTimeLeft(timeLimit);
    setGameOver(false);
    setFinalAnswer("");
    setFinalCompleted(false);
    setFinalWrong(false);
  };

  useEffect(() => {
    resetState();
  }, [game?.id, timeLimit]);

  const grid = useMemo(() => {
    const result = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        active: false,
        letters: {},
        wordIds: [],
        numbers: [],
      })),
    );

    words.forEach((item, wordIndex) => {
      const word = normalizeAnswer(item.answer);
      if (!word) return;

      const wordId = getWordId(item, wordIndex);

      word.split("").forEach((letter, letterIndex) => {
        const currentRow =
          item.direction === "vertical" ? item.row + letterIndex : item.row;
        const currentCol =
          item.direction === "horizontal" ? item.col + letterIndex : item.col;

        if (
          currentRow < 0 ||
          currentRow >= rows ||
          currentCol < 0 ||
          currentCol >= cols
        ) {
          return;
        }

        const cell = result[currentRow][currentCol];
        cell.active = true;
        cell.letters[wordId] = letter;

        if (!cell.wordIds.includes(wordId)) cell.wordIds.push(wordId);
        if (letterIndex === 0 && !cell.numbers.includes(Number(item.number))) {
          cell.numbers.push(Number(item.number));
        }
      });
    });

    return result;
  }, [words, rows, cols]);

  useEffect(() => {
    if (!showTimer || gameOver || finalCompleted) return;

    if (timeLeft <= 0) {
      setGameOver(true);
      message.warning("⏰ Hết giờ rồi bạn ơi!");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimer, gameOver, finalCompleted, timeLeft]);

  const completedCount = useMemo(() => {
    return words.filter((item, index) => completed[getWordId(item, index)])
      .length;
  }, [words, completed]);

  const revealedCount = useMemo(() => {
    return words.filter((item, index) => revealed[getWordId(item, index)])
      .length;
  }, [words, revealed]);

  const allWordsCompleted = words.length > 0 && completedCount === words.length;

  const handleAnswerChange = (wordId, value) => {
    if (gameOver || finalCompleted || completed[wordId] || revealed[wordId])
      return;
    setAnswers((prev) => ({ ...prev, [wordId]: value }));
  };

  const checkAnswer = (item, index) => {
    const wordId = getWordId(item, index);
    if (gameOver || finalCompleted || completed[wordId] || revealed[wordId])
      return;

    const input = normalizeAnswer(answers[wordId] || "");
    const correct = normalizeAnswer(item.answer);

    if (!input) {
      message.warning(`Câu ${item.number}: Vui lòng nhập câu trả lời! ✨`);
      return;
    }

    if (input === correct) {
      setCompleted((prev) => ({ ...prev, [wordId]: true }));
      setScore((prev) => prev + Number(item.points || 10));
      message.success(`🎉 Câu ${item.number}: Chính xác! ✨`);
      return;
    }

    message.error(`❌ Câu ${item.number}: Chưa đúng, hãy thử lại!`);
  };

  const revealAnswer = (item, index) => {
    if (!allowHint) {
      message.warning("Trò chơi này không bật chế độ gợi ý! 🔒");
      return;
    }

    const wordId = getWordId(item, index);
    if (gameOver || finalCompleted || completed[wordId] || revealed[wordId])
      return;

    setRevealed((prev) => ({ ...prev, [wordId]: true }));
    setAnswers((prev) => ({
      ...prev,
      [wordId]: item.answerDisplay || item.answer || item.word || "",
    }));

    message.info(`💡 Đã mở đáp án câu ${item.number}!`);
  };

  const checkFinalAnswer = () => {
    if (gameOver || finalCompleted) return;

    if (!verticalAnswer) {
      message.warning("Game chưa được thiết lập từ khóa bí mật!");
      return;
    }

    const input = normalizeAnswer(finalAnswer);

    if (!input) {
      message.warning("Vui lòng nhập từ khóa bí mật! 🗝️");
      return;
    }

    if (input === verticalAnswer) {
      setFinalCompleted(true);
      setFinalWrong(false);
      setScore((prev) => prev + 50);
      message.success(
        "🎉 CHÚC MỪNG! Bạn đã giải mã thành công từ khóa bí mật! ⭐",
      );
      return;
    }

    setFinalWrong(true);
    message.error("❌ Từ khóa chưa chính xác, hãy suy luận lại nhé!");
  };

  const resetGame = () => {
    if (!allowRetry) {
      message.warning("Trò chơi không hỗ trợ chơi lại!");
      return;
    }
    resetState();
    message.success("Đã làm mới vòng chơi! Cố lên nhé 🎉");
  };

  if (!game || words.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          style={{
            borderRadius: 28,
            textAlign: "center",
            padding: 24,
            maxWidth: 420,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <Empty
            description={<Text strong>Chưa có dữ liệu ô chữ rồi...</Text>}
          />
          <Button
            size="large"
            type="primary"
            shape="round"
            style={{
              marginTop: 20,
              backgroundColor: COLORS.primary,
              borderColor: COLORS.primary,
              height: 46,
              fontWeight: 700,
              boxShadow: "0 8px 20px rgba(124, 58, 237, 0.3)",
            }}
            onClick={onExit}
          >
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );
  }

  const backgroundImage =
    game?.background?.image ||
    (typeof game?.background === "string" ? game.background : null);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px 16px",
        backgroundColor: COLORS.bg,
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        fontFamily: "'Plus Jakarta Sans', 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* HEADER HUD BAR */}
      <Card
        bordered={false}
        style={{
          maxWidth: 1320,
          margin: "0 auto 24px",
          borderRadius: 24,
          boxShadow: "0 12px 32px rgba(31, 38, 135, 0.08)",
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
        }}
        bodyStyle={{ padding: "16px 24px" }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14} lg={16}>
            <Space size={16} align="center">
              <Button
                shape="circle"
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={onExit}
                style={{
                  border: `2px solid ${COLORS.border}`,
                  color: COLORS.text,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  fontWeight: 700,
                }}
              />
              <div>
                <Space size={8} wrap>
                  <Tag
                    color="purple"
                    style={{
                      borderRadius: 10,
                      padding: "2px 10px",
                      fontWeight: 800,
                      fontSize: 11,
                      border: "none",
                      backgroundColor: "#F3E8FF",
                      color: COLORS.primary,
                      textTransform: "uppercase",
                    }}
                  >
                    <FireOutlined /> GAME Ô CHỮ
                  </Tag>
                  <Tag
                    style={{
                      borderRadius: 10,
                      padding: "2px 10px",
                      fontWeight: 700,
                      fontSize: 11,
                      border: "none",
                      backgroundColor: "#E0F2FE",
                      color: "#0284C7",
                    }}
                  >
                    {gridSize.rows}x{gridSize.cols} GRID
                  </Tag>
                </Space>
                <Title
                  level={3}
                  style={{
                    margin: "2px 0 0",
                    color: COLORS.text,
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {game.name || "Ô Chữ Thông Thái"}
                </Title>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={10} lg={8} style={{ textAlign: "right" }}>
            <Space
              size={12}
              wrap
              style={{ justifyContent: "flex-end", width: "100%" }}
            >
              {showScore && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                    border: "1px solid #F59E0B",
                    padding: "6px 16px",
                    borderRadius: 20,
                    fontWeight: 800,
                    color: "#92400E",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
                  }}
                >
                  <TrophyOutlined style={{ fontSize: 18, color: "#D97706" }} />
                  <span style={{ fontSize: 15 }}>{score} ĐIỂM</span>
                </div>
              )}

              {showTimer && (
                <div
                  style={{
                    background:
                      timeLeft <= 10
                        ? "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)"
                        : "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
                    border:
                      timeLeft <= 10
                        ? "1px solid #EF4444"
                        : "1px solid #38BDF8",
                    padding: "6px 16px",
                    borderRadius: 20,
                    fontWeight: 800,
                    color: timeLeft <= 10 ? "#991B1B" : "#075985",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow:
                      timeLeft <= 10
                        ? "0 4px 12px rgba(239, 68, 68, 0.2)"
                        : "0 4px 12px rgba(56, 189, 248, 0.2)",
                  }}
                >
                  <ClockCircleOutlined style={{ fontSize: 18 }} />
                  <span style={{ fontSize: 15 }}>{formatTime(timeLeft)}</span>
                </div>
              )}

              {allowRetry && (
                <Button
                  shape="circle"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={resetGame}
                  style={{
                    borderColor: COLORS.border,
                    fontWeight: 700,
                    color: COLORS.text,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  }}
                />
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* MAIN GAME CONTAINER */}
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <Row gutter={[24, 24]}>
          {/* LEFT COLUMN: GRID BOARD & SECRET KEYWORD */}
          <Col xs={24} lg={15}>
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 28,
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.05)",
                  background: COLORS.cardBg,
                }}
                bodyStyle={{ padding: 24 }}
                title={
                  <Row
                    justify="space-between"
                    align="middle"
                    style={{ width: "100%" }}
                  >
                    <Space align="center" size={10}>
                      <span style={{ fontSize: 20 }}>🧩</span>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 18,
                          color: COLORS.text,
                        }}
                      >
                        Bảng Ô Chữ
                      </span>
                    </Space>
                    <Space size={8}>
                      <Tag
                        style={{
                          borderRadius: 12,
                          padding: "4px 12px",
                          backgroundColor: "#ECFDF5",
                          color: COLORS.success,
                          fontWeight: 800,
                          border: "1px solid #A7F3D0",
                        }}
                      >
                        {completedCount}/{words.length} đã hoàn thành
                      </Tag>
                      {revealedCount > 0 && (
                        <Tag
                          style={{
                            borderRadius: 12,
                            padding: "4px 12px",
                            backgroundColor: "#FFFBEB",
                            color: COLORS.warning,
                            fontWeight: 800,
                            border: "1px solid #FDE68A",
                          }}
                        >
                          {revealedCount} gợi ý
                        </Tag>
                      )}
                    </Space>
                  </Row>
                }
              >
                {finalCompleted && (
                  <Alert
                    type="success"
                    showIcon
                    icon={
                      <SmileOutlined
                        style={{ color: COLORS.success, fontSize: 22 }}
                      />
                    }
                    message={
                      <span style={{ fontWeight: 800, fontSize: 16 }}>
                        XUẤT SẮC! BẠN ĐÃ CHIẾN THẮNG 🏆
                      </span>
                    }
                    description={
                      <div style={{ marginTop: 4, fontSize: 14 }}>
                        Từ khóa bí mật:{" "}
                        <span
                          style={{
                            fontWeight: 900,
                            color: COLORS.primary,
                            fontSize: 18,
                            letterSpacing: 1,
                          }}
                        >
                          {verticalAnswerDisplay}
                        </span>
                        {" • "}Tổng điểm: <strong>{score}</strong>
                      </div>
                    }
                    style={{
                      marginBottom: 20,
                      borderRadius: 20,
                      backgroundColor: "#ECFDF5",
                      border: "2px solid #6EE7B7",
                      padding: 16,
                    }}
                  />
                )}

                {allWordsCompleted && !finalCompleted && verticalAnswer && (
                  <Alert
                    type="info"
                    showIcon
                    icon={
                      <StarOutlined
                        style={{ color: COLORS.primary, fontSize: 22 }}
                      />
                    }
                    message={
                      <span style={{ fontWeight: 800, fontSize: 15 }}>
                        Đã mở khóa tất cả các hàng ngang!
                      </span>
                    }
                    description="Hãy quan sát các ký tự vừa mở và đưa ra dự đoán cho TỪ KHÓA BÍ MẬT bên dưới nhé ✨"
                    style={{
                      marginBottom: 20,
                      borderRadius: 20,
                      backgroundColor: "#F3E8FF",
                      border: "2px solid #C084FC",
                      padding: 16,
                    }}
                  />
                )}

                {gameOver && (
                  <Alert
                    type="warning"
                    showIcon
                    message={
                      <span style={{ fontWeight: 800 }}>HẾT GIỜ RỒI!</span>
                    }
                    description="Đừng nản lòng, bấm nút Làm mới để bắt đầu lượt chơi khác nhen 🥳"
                    style={{
                      marginBottom: 20,
                      borderRadius: 20,
                      backgroundColor: "#FEF3C7",
                      border: "2px solid #FCD34D",
                      padding: 16,
                    }}
                  />
                )}

                {showTimer && (
                  <Progress
                    percent={Math.max(
                      0,
                      Math.min(100, Math.round((timeLeft / timeLimit) * 100)),
                    )}
                    showInfo={false}
                    strokeColor={{
                      "0%": COLORS.primary,
                      "100%": timeLeft <= 10 ? COLORS.danger : COLORS.accent,
                    }}
                    trailColor="#F1F5F9"
                    strokeWidth={10}
                    style={{ marginBottom: 20 }}
                  />
                )}

                {/* GAME GRID MATRIX DISPLAY */}
                <div
                  style={{
                    overflowX: "auto",
                    padding: "28px 16px",
                    background:
                      "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
                    borderRadius: 24,
                    border: `2px dashed ${COLORS.border}`,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      minWidth: cols * 48,
                    }}
                  >
                    {grid.map((row, rowIndex) => (
                      <div
                        key={rowIndex}
                        style={{ display: "flex", gap: 6, marginBottom: 6 }}
                      >
                        {row.map((cell, colIndex) => {
                          const completedWordId = cell.wordIds.find(
                            (wordId) => completed[wordId],
                          );
                          const revealedWordId = cell.wordIds.find(
                            (wordId) => revealed[wordId],
                          );

                          const visibleWordId =
                            completedWordId || revealedWordId;
                          const visibleLetter = visibleWordId
                            ? cell.letters[visibleWordId]
                            : "";

                          const isCompleted = Boolean(completedWordId);
                          const isRevealed =
                            !isCompleted && Boolean(revealedWordId);

                          return (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              style={{
                                width: 44,
                                height: 44,
                                flex: "0 0 44px",
                                borderRadius: 14,
                                border: cell.active
                                  ? `2px solid ${
                                      isCompleted
                                        ? COLORS.success
                                        : isRevealed
                                          ? COLORS.warning
                                          : COLORS.primary
                                    }`
                                  : "none",
                                background: !cell.active
                                  ? "transparent"
                                  : isCompleted
                                    ? "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)"
                                    : isRevealed
                                      ? "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"
                                      : "#FFFFFF",
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: cell.active
                                  ? "0 6px 12px rgba(0, 0, 0, 0.05)"
                                  : "none",
                                transition:
                                  "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                transform: visibleLetter
                                  ? "scale(1.05)"
                                  : "scale(1)",
                              }}
                            >
                              {cell.active && cell.numbers.length > 0 && (
                                <span
                                  style={{
                                    position: "absolute",
                                    top: 3,
                                    left: 5,
                                    fontSize: 10,
                                    fontWeight: 900,
                                    color: isCompleted
                                      ? "#065F46"
                                      : isRevealed
                                        ? "#92400E"
                                        : COLORS.primary,
                                  }}
                                >
                                  {cell.numbers.join(",")}
                                </span>
                              )}

                              {cell.active && (
                                <span
                                  style={{
                                    fontSize: 20,
                                    fontWeight: 900,
                                    color: visibleLetter
                                      ? isCompleted
                                        ? "#065F46"
                                        : isRevealed
                                          ? "#92400E"
                                          : COLORS.text
                                      : "#CBD5E1",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {visibleLetter}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    padding: "12px 18px",
                    background: "#F8FAFC",
                    borderRadius: 16,
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <BulbOutlined
                    style={{ color: COLORS.yellow, fontSize: 18 }}
                  />
                  <Text
                    style={{
                      color: COLORS.subText,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Mẹo chơi: Nhập câu trả lời ở danh sách bên phải. Đáp án
                    chính xác sẽ mở các ô tương ứng trên ô chữ!
                  </Text>
                </div>
              </Card>

              {/* SECRET KEYWORD SECTION */}
              {verticalAnswer && (
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 28,
                    boxShadow: "0 12px 32px rgba(255, 107, 139, 0.12)",
                    border: `2px solid ${
                      finalCompleted ? COLORS.success : COLORS.secondary
                    }`,
                    background: finalCompleted
                      ? "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)"
                      : "linear-gradient(135deg, #FFF5F5 0%, #FFE4E6 100%)",
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  <Space
                    direction="vertical"
                    size={16}
                    style={{ width: "100%" }}
                  >
                    <Row justify="space-between" align="middle">
                      <Space align="center" size={10}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            background: finalCompleted
                              ? COLORS.success
                              : COLORS.secondary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FFF",
                            fontSize: 18,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        >
                          <KeyOutlined />
                        </div>
                        <div>
                          <Title
                            level={4}
                            style={{
                              margin: 0,
                              color: COLORS.text,
                              fontWeight: 800,
                            }}
                          >
                            Từ Khóa Bí Mật 🗝️
                          </Title>
                          <Text style={{ color: COLORS.subText, fontSize: 13 }}>
                            Đoán chính xác từ khóa chìa khóa để nhận điểm thưởng
                            cực lớn!
                          </Text>
                        </div>
                      </Space>
                    </Row>

                    <Row gutter={12}>
                      <Col flex="1">
                        <Input
                          size="large"
                          value={
                            finalCompleted ? verticalAnswerDisplay : finalAnswer
                          }
                          disabled={gameOver || finalCompleted}
                          onChange={(e) => {
                            setFinalAnswer(e.target.value);
                            setFinalWrong(false);
                          }}
                          onPressEnter={checkFinalAnswer}
                          placeholder="Nhập dự đoán từ khóa tại đây..."
                          style={{
                            borderRadius: 16,
                            fontWeight: 800,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                            borderColor: COLORS.secondary,
                            textAlign: "center",
                            fontSize: 16,
                            height: 50,
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                          }}
                        />
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          size="large"
                          disabled={gameOver || finalCompleted}
                          onClick={checkFinalAnswer}
                          icon={<SendOutlined />}
                          style={{
                            background: COLORS.secondary,
                            borderColor: COLORS.secondary,
                            fontWeight: 800,
                            borderRadius: 16,
                            height: 50,
                            paddingLeft: 24,
                            paddingRight: 24,
                            boxShadow: "0 6px 16px rgba(255, 107, 139, 0.35)",
                          }}
                        >
                          Giải Mật Mã
                        </Button>
                      </Col>
                    </Row>

                    {finalWrong && (
                      <Alert
                        type="error"
                        showIcon
                        message="Chưa chính xác!"
                        description="Quan sát kỹ hơn các chữ cái gợi ý trên hàng dọc rồi thử lại nhen!"
                        style={{ borderRadius: 14 }}
                      />
                    )}
                  </Space>
                </Card>
              )}
            </Space>
          </Col>

          {/* RIGHT COLUMN: QUESTIONS & INPUT LIST */}
          <Col xs={24} lg={9}>
            <Card
              bordered={false}
              title={
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ width: "100%" }}
                >
                  <Space align="center" size={10}>
                    <span style={{ fontSize: 20 }}>📝</span>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: 18,
                        color: COLORS.text,
                      }}
                    >
                      Danh Sách Câu Hỏi
                    </span>
                  </Space>
                  <Tag
                    style={{
                      borderRadius: 12,
                      padding: "4px 10px",
                      backgroundColor: "#F3E8FF",
                      color: COLORS.primary,
                      fontWeight: 800,
                      border: "none",
                    }}
                  >
                    {words.length} Hàng ngang
                  </Tag>
                </Row>
              }
              style={{
                borderRadius: 28,
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.05)",
                background: COLORS.cardBg,
              }}
              bodyStyle={{ padding: 20 }}
            >
              <div
                style={{
                  maxHeight: "calc(100vh - 220px)",
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {words.map((item, index) => {
                    const wordId = getWordId(item, index);
                    const isDone = Boolean(completed[wordId]);
                    const isRevealed = Boolean(revealed[wordId]);

                    return (
                      <Card
                        key={wordId}
                        size="small"
                        bordered={false}
                        style={{
                          borderRadius: 20,
                          border: `2px solid ${
                            isDone
                              ? "#10B981"
                              : isRevealed
                                ? "#F59E0B"
                                : "#E2E8F0"
                          }`,
                          background: isDone
                            ? "#F0FDF4"
                            : isRevealed
                              ? "#FFFBEB"
                              : "#F8FAFC",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                          transition: "all 0.2s ease",
                        }}
                        bodyStyle={{ padding: 16 }}
                      >
                        <Space
                          direction="vertical"
                          size={12}
                          style={{ width: "100%" }}
                        >
                          <Row justify="space-between" align="start">
                            <Space align="start" size={10}>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 10,
                                  background: isDone
                                    ? COLORS.success
                                    : isRevealed
                                      ? COLORS.warning
                                      : COLORS.primary,
                                  color: "#FFF",
                                  fontWeight: 800,
                                  fontSize: 13,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {item.number}
                              </div>
                              <Text
                                strong
                                style={{
                                  color: COLORS.text,
                                  fontSize: 14,
                                  lineHeight: "20px",
                                }}
                              >
                                {item.question}
                              </Text>
                            </Space>
                            <Tag
                              style={{
                                borderRadius: 8,
                                fontWeight: 800,
                                border: "none",
                                backgroundColor: isDone
                                  ? "#DCFCE7"
                                  : isRevealed
                                    ? "#FEF3C7"
                                    : "#E0E7FF",
                                color: isDone
                                  ? "#15803D"
                                  : isRevealed
                                    ? "#B45309"
                                    : COLORS.primary,
                              }}
                            >
                              +{item.points || 10} đ
                            </Tag>
                          </Row>

                          <Row gutter={8}>
                            <Col flex="1">
                              <Input
                                disabled={
                                  gameOver ||
                                  finalCompleted ||
                                  isDone ||
                                  isRevealed
                                }
                                value={answers[wordId] || ""}
                                onChange={(e) =>
                                  handleAnswerChange(wordId, e.target.value)
                                }
                                onPressEnter={() => checkAnswer(item, index)}
                                placeholder="Gõ câu trả lời..."
                                style={{
                                  borderRadius: 12,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  height: 40,
                                  borderColor: isDone
                                    ? "#A7F3D0"
                                    : isRevealed
                                      ? "#FDE68A"
                                      : "#CBD5E1",
                                  background:
                                    isDone || isRevealed
                                      ? "#FFFFFF"
                                      : "#FFFFFF",
                                }}
                              />
                            </Col>

                            {!isDone && !isRevealed && (
                              <Col>
                                <Space size={4}>
                                  <Button
                                    type="primary"
                                    disabled={gameOver || finalCompleted}
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => checkAnswer(item, index)}
                                    style={{
                                      borderRadius: 12,
                                      backgroundColor: COLORS.primary,
                                      borderColor: COLORS.primary,
                                      fontWeight: 700,
                                      height: 40,
                                      boxShadow:
                                        "0 4px 10px rgba(124, 58, 237, 0.2)",
                                    }}
                                  >
                                    Nộp
                                  </Button>

                                  {allowHint && (
                                    <Button
                                      disabled={gameOver || finalCompleted}
                                      icon={<BulbOutlined />}
                                      onClick={() => revealAnswer(item, index)}
                                      style={{
                                        borderRadius: 12,
                                        borderColor: COLORS.warning,
                                        color: COLORS.warning,
                                        fontWeight: 700,
                                        height: 40,
                                        backgroundColor: "#FFFBEB",
                                      }}
                                    />
                                  )}
                                </Space>
                              </Col>
                            )}
                          </Row>
                        </Space>
                      </Card>
                    );
                  })}
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CrosswordGame;
