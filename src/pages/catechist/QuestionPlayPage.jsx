import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Card,
  Empty,
  Progress,
  Radio,
  Result,
  Spin,
  Tag,
  message,
} from "antd";

import {
  ArrowLeftOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import AppButton from "../../components/common/AppButton";

import { getQuizByLesson, submitQuiz } from "../../api/questionApi";

import "../../assets/css/QuestionPlayPage.css";

// =========================================================
// CONSTANTS
// =========================================================

const ANSWERS = [
  {
    key: "A",
    field: "answer_a",
  },
  {
    key: "B",
    field: "answer_b",
  },
  {
    key: "C",
    field: "answer_c",
  },
  {
    key: "D",
    field: "answer_d",
  },
];

// =========================================================
// COMPONENT
// =========================================================

const QuestionPlayPage = () => {
  const navigate = useNavigate();

  const { lessonId } = useParams();

  const [messageApi, contextHolder] = message.useMessage();

  // -------------------------------------------------------
  // STATE
  // -------------------------------------------------------

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [lesson, setLesson] = useState(null);

  const [questions, setQuestions] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState({});

  const [result, setResult] = useState(null);

  // =======================================================
  // LOAD QUIZ
  // =======================================================

  const loadQuiz = useCallback(async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await getQuizByLesson(lessonId);
      console.log("getQuizByLesson:::", response);

      const data = response?.data;

      if (!data?.success) {
        throw new Error(data?.message || "Không thể tải câu hỏi");
      }

      setLesson(data.lesson || null);

      setQuestions(Array.isArray(data.questions) ? data.questions : []);

      setCurrentIndex(0);

      setAnswers({});

      setResult(null);
    } catch (error) {
      console.error("LOAD QUIZ ERROR:", error);

      messageApi.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải câu hỏi",
      );

      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [lessonId, messageApi]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  // =======================================================
  // CURRENT QUESTION
  // =======================================================

  const currentQuestion = questions[currentIndex];

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  // =======================================================
  // PROGRESS
  // =======================================================

  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const progressPercent = useMemo(() => {
    if (!questions.length) {
      return 0;
    }

    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  // =======================================================
  // SELECT ANSWER
  // =======================================================

  const handleSelectAnswer = (answer) => {
    if (!currentQuestion) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  // =======================================================
  // PREVIOUS
  // =======================================================

  const handlePrevious = () => {
    if (currentIndex <= 0) {
      return;
    }

    setCurrentIndex((prev) => prev - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =======================================================
  // NEXT
  // =======================================================

  const handleNext = () => {
    if (!currentQuestion) {
      return;
    }

    if (!currentAnswer) {
      messageApi.warning("Vui lòng chọn một đáp án trước khi tiếp tục");

      return;
    }

    if (currentIndex >= questions.length - 1) {
      handleSubmit();
      return;
    }

    setCurrentIndex((prev) => prev + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = async () => {
    if (!questions.length) {
      return;
    }

    const unanswered = questions.filter((question) => !answers[question.id]);

    if (unanswered.length > 0) {
      messageApi.warning(`Còn ${unanswered.length} câu chưa trả lời`);

      const firstUnansweredIndex = questions.findIndex(
        (question) => !answers[question.id],
      );

      if (firstUnansweredIndex >= 0) {
        setCurrentIndex(firstUnansweredIndex);
      }

      return;
    }

    try {
      setSubmitting(true);

      const answerPayload = questions.map((question) => ({
        question_id: question.id,
        selected: answers[question.id],
      }));

      const response = await submitQuiz(lessonId, answerPayload);

      const data = response?.data;

      if (!data?.success) {
        throw new Error(data?.message || "Không thể nộp bài");
      }

      setResult(data);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("SUBMIT QUIZ ERROR:", error);

      messageApi.error(
        error?.response?.data?.message || error?.message || "Không thể nộp bài",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =======================================================
  // BACK
  // =======================================================

  const handleBack = () => {
    navigate(-1);
  };

  // =======================================================
  // RETRY
  // =======================================================

  const handleRetry = () => {
    setAnswers({});

    setCurrentIndex(0);

    setResult(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="question-play-page">
        {contextHolder}

        <div className="qp-loading">
          <Spin size="large" />

          <span>Đang tải câu hỏi...</span>
        </div>
      </div>
    );
  }

  // =======================================================
  // EMPTY
  // =======================================================

  if (!questions.length) {
    return (
      <div className="question-play-page">
        {contextHolder}

        <div className="qp-page-inner">
          <div className="qp-topbar">
            <AppButton icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Quay lại
            </AppButton>
          </div>

          <Card bordered={false} className="qp-empty-card">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Bài học này chưa có câu hỏi kiến thức"
            />

            <AppButton type="primary" onClick={handleBack}>
              Quay lại
            </AppButton>
          </Card>
        </div>
      </div>
    );
  }

  // =======================================================
  // RESULT
  // =======================================================

  if (result) {
    const summary = result.summary || {};

    const score = Number(summary.score || 0);

    const percentage = Number(summary.percentage || 0);

    return (
      <div className="question-play-page">
        {contextHolder}

        <div className="qp-page-inner">
          {/* HEADER */}
          <div className="qp-topbar">
            <AppButton icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Quay lại
            </AppButton>

            <div className="qp-topbar-title">
              <BookOutlined />

              <span>Kết quả bài làm</span>
            </div>
          </div>

          {/* RESULT */}
          <Card bordered={false} className="qp-result-card">
            <Result
              icon={
                <div className="qp-result-icon">
                  <TrophyOutlined />
                </div>
              }
              title="Hoàn thành bài học"
              subTitle={lesson?.title}
            />

            <div className="qp-score">
              <div className="qp-score-number">{score}</div>

              <div className="qp-score-label">điểm</div>
            </div>

            <div className="qp-result-progress">
              <Progress
                percent={percentage}
                size="small"
                format={(percent) => `${percent}%`}
              />
            </div>

            <div className="qp-result-stats">
              <div className="qp-result-stat">
                <div className="qp-result-stat-icon success">
                  <CheckCircleOutlined />
                </div>

                <div>
                  <strong>{summary.correct || 0}</strong>

                  <span>Đúng</span>
                </div>
              </div>

              <div className="qp-result-stat">
                <div className="qp-result-stat-icon error">
                  <CloseCircleOutlined />
                </div>

                <div>
                  <strong>{summary.wrong || 0}</strong>

                  <span>Sai</span>
                </div>
              </div>

              <div className="qp-result-stat">
                <div className="qp-result-stat-icon warning">
                  <ClockCircleOutlined />
                </div>

                <div>
                  <strong>{summary.unanswered || 0}</strong>

                  <span>Chưa trả lời</span>
                </div>
              </div>
            </div>

            {/* ACTION */}
            <div className="qp-result-actions">
              <AppButton onClick={handleBack}>Quay lại bài học</AppButton>

              <AppButton type="primary" onClick={handleRetry}>
                Làm lại
              </AppButton>
            </div>

            {/* REVIEW */}
            {Array.isArray(result.results) && result.results.length > 0 && (
              <div className="qp-review">
                <div className="qp-review-title">
                  <CheckOutlined />

                  <span>Xem lại câu trả lời</span>
                </div>

                <div className="qp-review-list">
                  {result.results.map((item, index) => (
                    <div
                      key={item.question_id}
                      className={`qp-review-item ${
                        item.isCorrect ? "is-correct" : "is-wrong"
                      }`}
                    >
                      <div className="qp-review-number">{index + 1}</div>

                      <div className="qp-review-content">
                        <div className="qp-review-question">
                          {item.question}
                        </div>

                        <div className="qp-review-answer">
                          <span>Bạn chọn:</span>

                          <strong>{item.selected || "Chưa trả lời"}</strong>

                          {!item.isCorrect && (
                            <>
                              <span>· Đáp án đúng:</span>

                              <strong className="correct-answer">
                                {item.correct_answer}
                              </strong>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="qp-review-status">
                        {item.isCorrect ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CloseCircleOutlined />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // =======================================================
  // QUIZ
  // =======================================================

  return (
    <div className="question-play-page">
      {contextHolder}

      <div className="qp-page-inner">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="qp-topbar">
          <AppButton icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Quay lại
          </AppButton>

          <div className="qp-topbar-title">
            <BookOutlined />

            <div>
              <strong>{lesson?.title}</strong>

              <span>Câu hỏi kiến thức</span>
            </div>
          </div>

          <Tag className="qp-progress-tag">
            {currentIndex + 1}/{questions.length}
          </Tag>
        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <div className="qp-progress">
          <div className="qp-progress-info">
            <span>
              Câu {currentIndex + 1} / {questions.length}
            </span>

            <span>
              Đã trả lời {answeredCount}/{questions.length}
            </span>
          </div>

          <Progress percent={progressPercent} showInfo={false} size="small" />
        </div>

        {/* =================================================
            QUESTION
        ================================================= */}

        <Card bordered={false} className="qp-question-card">
          <div className="qp-question-number">
            CÂU {String(currentIndex + 1).padStart(2, "0")}
          </div>

          <h1 className="qp-question-title">{currentQuestion?.question}</h1>

          <div className="qp-answer-list">
            <Radio.Group
              value={currentAnswer}
              onChange={(event) => handleSelectAnswer(event.target.value)}
            >
              {ANSWERS.map((answer) => {
                const value = currentQuestion?.[answer.field];

                if (!value) {
                  return null;
                }

                return (
                  <div
                    key={answer.key}
                    className={`qp-answer-option ${
                      currentAnswer === answer.key ? "selected" : ""
                    }`}
                    onClick={() => handleSelectAnswer(answer.key)}
                  >
                    <Radio value={answer.key}>
                      <span className="qp-answer-letter">{answer.key}</span>

                      <span className="qp-answer-text">{value}</span>
                    </Radio>
                  </div>
                );
              })}
            </Radio.Group>
          </div>

          {/* =================================================
              NAVIGATION
          ================================================= */}

          <div className="qp-navigation">
            <AppButton
              icon={<ArrowLeftOutlined />}
              disabled={currentIndex === 0}
              onClick={handlePrevious}
            >
              Câu trước
            </AppButton>

            <div className="qp-question-dots">
              {questions.map((question, index) => (
                <button
                  type="button"
                  key={question.id}
                  className={`qp-question-dot ${
                    index === currentIndex ? "active" : ""
                  } ${answers[question.id] ? "answered" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                  title={`Câu ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <AppButton type="primary" loading={submitting} onClick={handleNext}>
              {currentIndex === questions.length - 1
                ? "Nộp bài"
                : "Câu tiếp theo"}
            </AppButton>
          </div>
        </Card>

        {/* =================================================
            NOTE
        ================================================= */}

        <Alert
          className="qp-note"
          type="info"
          showIcon
          message="Lưu ý"
          description="Hãy kiểm tra lại các câu trả lời trước khi nộp bài."
        />
      </div>
    </div>
  );
};

export default QuestionPlayPage;
