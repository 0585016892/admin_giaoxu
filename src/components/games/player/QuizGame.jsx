import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  Flag,
  Lightbulb,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
  X,
  XCircle,
} from "lucide-react";
import "./QuizGame.css";

const API_URL = process.env.REACT_APP_API_URL || "";
const assetUrl = (value) => {
  const path =
    typeof value === "string"
      ? value
      : value?.url || value?.path || value?.src || value?.location;
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
};
const shuffle = (items) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const isCorrect = (answer, question) => {
  if (!answer) return false;
  if (answer?.correct === true || answer?.isCorrect === true) return true;
  const expected =
    question?.correctAnswer ?? question?.answer ?? question?.correct;
  if (expected === undefined || expected === null) return false;
  return (
    String(answer?.value ?? answer?.id ?? answer?.text ?? answer)
      .trim()
      .toLowerCase() === String(expected).trim().toLowerCase()
  );
};
const labelOf = (a) =>
  typeof a === "object"
    ? (a?.text ?? a?.label ?? a?.answer ?? a?.value ?? "")
    : String(a ?? "");
const limitOf = (settings) => Math.max(1, Number(settings?.timeLimit) || 60);
const formatTime = (time) =>
  `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;

export default function QuizGame({ game = {}, onExit = () => {} }) {
  const settings = game.settings;
  const theme = game.theme;
  const media = game.media;
  const questionsSource = game.questions;
  const [run, setRun] = useState(0);

  const questions = useMemo(() => {
    const source = Array.isArray(questionsSource) ? questionsSource : [];

    // run được sử dụng để tạo dependency thực sự
    const currentRun = run;
    console.log(currentRun);

    const shuffledQuestions = settings?.shuffleQuestions
      ? shuffle(source)
      : [...source];

    return shuffledQuestions.map((q) => {
      const answersSource = q.answers || q.options || [];

      return {
        ...q,
        displayAnswers: settings?.shuffleAnswers
          ? shuffle(answersSource)
          : [...answersSource],
      };
    });
  }, [
    questionsSource,
    settings?.shuffleQuestions,
    settings?.shuffleAnswers,
    run,
  ]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [remaining, setRemaining] = useState(limitOf(settings));
  const [screen, setScreen] = useState("playing");
  const [muted, setMuted] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const audioRef = useRef({});
  const question = questions[index];
  const selected = answers[index];
  const answered = Boolean(selected);
  const primary = theme?.primary || "#173B5E";
  const secondary = theme?.secondary || "#D9A441";
  const radius = Math.min(32, Math.max(6, Number(theme?.borderRadius) || 12));
  const maxScore = questions.reduce(
    (sum, q) => sum + (Number(q.points) || 10),
    0,
  );
  const score = answers.reduce((sum, a) => sum + (a.correct ? a.points : 0), 0);
  const correctCount = answers.filter((a) => a.correct).length;
  const bgImage = assetUrl(
    game.background?.image || game.backgroundConfig?.image,
  );
  const style = {
    "--quiz-primary": primary,
    "--quiz-secondary": secondary,
    "--quiz-radius": `${radius}px`,
    fontFamily: `'${String(theme?.font || "Be Vietnam Pro").replace(/'/g, "")}', system-ui, sans-serif`,
    backgroundColor:
      game.background?.color || game.backgroundConfig?.color || "#F7F9FC",
    backgroundImage: bgImage
      ? `linear-gradient(rgba(247,249,252,.08),rgba(247,249,252,.08)),url("${bgImage.replace(/"/g, "%22")}")`
      : undefined,
  };

  useEffect(() => {
    const sounds = {
      correct: assetUrl(media?.correctSound),
      wrong: assetUrl(media?.wrongSound),
      music: assetUrl(media?.backgroundMusic),
    };
    const players = {};
    Object.entries(sounds).forEach(([key, src]) => {
      if (!src) return;
      const audio = new Audio(src);
      audio.preload = "auto";
      if (key === "music") {
        audio.loop = true;
        audio.volume = 0.25;
      }
      players[key] = audio;
    });
    audioRef.current = players;
    if (players.music) players.music.play().catch(() => {});
    return () =>
      Object.values(players).forEach((a) => {
        a.pause();
        a.currentTime = 0;
      });
  }, [media?.correctSound, media?.wrongSound, media?.backgroundMusic]);
  useEffect(() => {
    Object.values(audioRef.current).forEach((audio) => {
      audio.muted = muted;
    });
  }, [muted]);
  const choose = useCallback(
    (option, timeout = false, skipped = false) => {
      if (!question || answers[index]) return;
      const correct = !timeout && !skipped && isCorrect(option, question);
      const item = {
        questionId: question.id,
        questionIndex: index,
        option,
        correct,
        timeout,
        skipped,
        points: Number(question.points) || 10,
      };
      setAnswers((prev) => [...prev, item]);
      const audio = audioRef.current[correct ? "correct" : "wrong"];
      if (audio && !muted && !skipped) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    },
    [question, answers, index, muted],
  );
  useEffect(() => {
    if (screen !== "playing" || !question || answered || !settings?.showTimer)
      return;
    if (remaining <= 0) {
      choose(null, true);
      return;
    }
    const id = window.setTimeout(
      () => setRemaining((prev) => Math.max(0, prev - 1)),
      1000,
    );
    return () => window.clearTimeout(id);
  }, [screen, question, answered, settings?.showTimer, remaining, choose]);
  const next = () => {
    if (!answered) return;
    if (index === questions.length - 1) {
      setScreen("result");
      return;
    }
    setIndex((v) => v + 1);
    setRemaining(limitOf(settings));
    setHintOpen(false);
  };
  const restart = () => {
    setRun((v) => v + 1);
    setIndex(0);
    setAnswers([]);
    setRemaining(limitOf(settings));
    setScreen("playing");
    setHintOpen(false);
  };
  const progress = questions.length
    ? ((index + (answered ? 1 : 0)) / questions.length) * 100
    : 0;
  const canHint = Boolean(settings?.allowHint && question?.hint);

  if (!questions.length)
    return (
      <main className="fq-root" style={style}>
        <section className="fq-empty">
          <Flag size={38} />
          <h2>Trò chơi chưa có câu hỏi</h2>
          <p>Vui lòng kiểm tra lại cấu hình trò chơi.</p>
          <button className="fq-btn fq-primary" onClick={onExit}>
            Quay lại
          </button>
        </section>
      </main>
    );

  return (
    <main
      className={`fq-root ${screen === "playing" ? "fq-playing" : "fq-other-screen"}`}
      style={style}
    >
      <div className="fq-shell">
        <header className="fq-topbar">
          <div className="fq-game-name">
            <span className="fq-kicker">TRÒ CHƠI TRẮC NGHIỆM</span>
            <strong>{game.name || "Trò chơi giáo lý"}</strong>
          </div>
          <div className="fq-top-actions">
            <button
              className="fq-icon-btn fq-sound-btn"
              onClick={() => setMuted((v) => !v)}
              title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
              aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            {screen === "playing" && settings?.showScore !== false && (
              <span className="fq-score">
                <Trophy size={17} /> {score} điểm
              </span>
            )}
          </div>
        </header>

        {screen === "playing" && (
          <>
            <div className="fq-meta">
              <span className="fq-step">
                CÂU HỎI <b>{index + 1}</b>
                <span className="fq-muted"> / {questions.length}</span>
              </span>
              <div className="fq-meta-right">
                <span className="fq-points">
                  +{Number(question.points) || 10} điểm
                </span>
                {settings?.showTimer && (
                  <span
                    className={`fq-timer ${remaining <= 10 ? "fq-timer-urgent" : ""}`}
                  >
                    <Clock3 size={16} /> {formatTime(remaining)}
                  </span>
                )}
              </div>
            </div>
            {settings?.showProgress && (
              <div className="fq-progress">
                <span style={{ width: `${progress}%` }} />
              </div>
            )}
            <section className="fq-question-panel">
              <div className="fq-question-heading">
                <span className="fq-question-eyebrow">CHỌN ĐÁP ÁN ĐÚNG</span>
                {canHint && (
                  <button
                    className="fq-hint-btn"
                    onClick={() => setHintOpen((v) => !v)}
                  >
                    <Lightbulb size={16} /> Gợi ý
                  </button>
                )}
              </div>
              <h1 className="fq-question-text">
                {question.question || question.title || "Câu hỏi"}
              </h1>
              {canHint && hintOpen && (
                <p className="fq-hint">
                  <Lightbulb size={16} /> {question.hint}
                </p>
              )}
              <div className="fq-answers">
                {question.displayAnswers.map((answer, i) => {
                  const right = isCorrect(answer, question);
                  const picked =
                    selected?.option === answer ||
                    (selected?.option?.id != null &&
                      selected.option.id === answer?.id);
                  const state = answered
                    ? right
                      ? "fq-answer-correct"
                      : picked
                        ? "fq-answer-wrong"
                        : "fq-answer-dim"
                    : "";
                  return (
                    <button
                      key={`${answer?.id ?? i}-${i}`}
                      className={`fq-answer fq-answer-color-${i % 4} ${state}`}
                      disabled={answered}
                      onClick={() => choose(answer)}
                    >
                      <span className="fq-letter">
                        {answer?.id || String.fromCharCode(65 + i)}
                      </span>
                      <span className="fq-answer-text">{labelOf(answer)}</span>
                      {answered && right && (
                        <CheckCircle2 size={22} className="fq-answer-symbol" />
                      )}
                      {answered && picked && !right && (
                        <XCircle size={22} className="fq-answer-symbol" />
                      )}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div
                  className={`fq-feedback ${selected.correct ? "fq-feedback-right" : "fq-feedback-wrong"}`}
                >
                  <strong>
                    {selected.correct
                      ? "Chính xác!"
                      : selected.timeout
                        ? "Đã hết thời gian!"
                        : selected.skipped
                          ? "Đã bỏ qua câu hỏi"
                          : "Chưa chính xác!"}
                  </strong>
                  {question.explanation && (
                    <p>
                      <b>Giải thích:</b> {question.explanation}
                    </p>
                  )}
                </div>
              )}
            </section>
            <footer className="fq-bottom">
              <span className="fq-bottom-note">
                {answered
                  ? "Bạn đã hoàn thành câu hỏi"
                  : "Hãy chọn đáp án đúng nhé!"}
              </span>
              <div className="fq-bottom-actions">
                {!answered && settings?.allowSkip && (
                  <button
                    className="fq-btn fq-outline"
                    onClick={() => choose(null, false, true)}
                  >
                    Bỏ qua
                  </button>
                )}
                <button
                  className="fq-btn fq-primary fq-next"
                  onClick={next}
                  disabled={!answered}
                >
                  {index === questions.length - 1
                    ? "Xem kết quả"
                    : "Câu tiếp theo"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </footer>
          </>
        )}

        {screen === "result" && (
          <section className="fq-result-panel">
            <div className="fq-result-icon">
              <Trophy size={40} />
            </div>
            <span className="fq-kicker">BÀI LÀM ĐÃ HOÀN THÀNH</span>
            <h1>Hoàn thành trò chơi!</h1>
            <p className="fq-result-subtitle">{game.name}</p>
            <div className="fq-result-score">
              {score}
              <small> / {maxScore} điểm</small>
            </div>
            <div className="fq-result-track">
              <span
                style={{ width: `${maxScore ? (score / maxScore) * 100 : 0}%` }}
              />
            </div>
            <div className="fq-result-facts">
              <span>
                Trả lời đúng{" "}
                <b>
                  {correctCount}/{questions.length}
                </b>
              </span>
              <span>
                Đạt{" "}
                <b>{maxScore ? Math.round((score / maxScore) * 100) : 0}%</b>
              </span>
            </div>
            <div className="fq-result-buttons">
              <button
                className="fq-btn fq-outline"
                onClick={() => setScreen("review")}
              >
                <Eye size={18} /> Xem đáp án
              </button>
              <button className="fq-btn fq-primary" onClick={restart}>
                <RotateCcw size={18} /> Chơi lại
              </button>
              <button className="fq-btn fq-light" onClick={onExit}>
                <X size={18} /> Thoát
              </button>
            </div>
          </section>
        )}

        {screen === "review" && (
          <section className="fq-review-panel">
            <div className="fq-review-header">
              <div>
                <span className="fq-kicker">TỔNG KẾT</span>
                <h1>Xem lại đáp án</h1>
              </div>
              <button
                className="fq-btn fq-outline"
                onClick={() => setScreen("result")}
              >
                <ArrowLeft size={17} /> Kết quả
              </button>
            </div>
            {questions.map((q, i) => {
              const choice = answers[i];
              return (
                <article className="fq-review-item" key={q.id || i}>
                  <div className="fq-review-title">
                    <span className="fq-review-number">{i + 1}</span>
                    <strong>{q.question || q.title}</strong>
                    {choice?.correct ? (
                      <CheckCircle2 size={20} color="#168452" />
                    ) : (
                      <XCircle size={20} color="#D95151" />
                    )}
                  </div>
                  <div className="fq-review-answers">
                    {q.displayAnswers.map((a, j) => {
                      const correct = isCorrect(a, q);
                      const picked =
                        choice?.option === a ||
                        (choice?.option?.id != null &&
                          choice.option.id === a?.id);
                      return (
                        <div
                          className={`fq-review-answer ${correct ? "fq-review-correct" : picked ? "fq-review-wrong" : ""}`}
                          key={a?.id || j}
                        >
                          <span>{a?.id || String.fromCharCode(65 + j)}.</span>
                          {labelOf(a)}
                          {correct && <CheckCircle2 size={17} />}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <p className="fq-review-explanation">
                      <Lightbulb size={16} /> {q.explanation}
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
