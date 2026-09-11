import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Select, Tag, message } from "antd";
import {
  StarFilled,
  CrownFilled,
  GlobalOutlined,
  TeamOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import {
  getResultsLeaderBoard,
  getClassLeaderboard,
} from "../../api/resultApi";
import LoadingLogo from "../../components/LoadingLogo";
import classApi from "../../api/classApi";

// =========================================================
// ASSETS & COLORS CONFIG
// =========================================================

import l1 from "../../assets/images/l1.png";
import l2 from "../../assets/images/l2.png";
import l3 from "../../assets/images/l3.png";
import jesusImg from "../../assets/images/jesusImg.png";
import background from "../../assets/images/background.png";
import bocau from "../../assets/images/bocau.png";

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

const IMAGE_CONFIG = {
  BACKGROUND: background,
  DOVE_LEFT: bocau,
  DOVE_RIGHT: bocau,
  JESUS_CHARACTER: jesusImg,
};

// =========================================================
// HELPERS
// =========================================================

const normalizeListResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.classes)) return response.classes;
  return [];
};

const normalizeLeaderboardData = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.leaderboard)) return response.leaderboard;
  return [];
};

const getStudentName = (student) => {
  return (
    student?.student_name ||
    student?.name ||
    student?.full_name ||
    student?.student?.name ||
    "Chưa có học sinh"
  );
};

const getStudentScore = (student) => {
  if (!student) return 0;
  const score =
    student?.average_score ??
    student?.averageScore ??
    student?.score ??
    student?.total_score ??
    student?.average ??
    0;
  const numericScore = Number(score);
  if (Number.isNaN(numericScore)) return 0;
  return numericScore % 1 === 0 ? numericScore : numericScore.toFixed(2);
};

const getStudentRank = (student, index) => {
  const rank = Number(student?.rank);
  return Number.isFinite(rank) && rank > 0 ? rank : index + 1;
};

const getClassId = (item) => item?.id ?? item?.class_id ?? item?.classId;

const getClassName = (item) => {
  return (
    item?.name ||
    item?.class_name ||
    item?.className ||
    item?.title ||
    `Lớp ${getClassId(item)}`
  );
};

// =========================================================
// COMPONENT
// =========================================================

const LeaderboardGame = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(false);

  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [leaderboardMode, setLeaderboardMode] = useState("all");
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedClassName, setSelectedClassName] = useState("");

  // =======================================================
  // LOAD CLASSES
  // =======================================================
  const fetchClasses = useCallback(async () => {
    try {
      setClassesLoading(true);
      setLoadingProgress(0);

      const progressTimer = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 88) return 88;
          if (prev < 30) return prev + 5;
          if (prev < 60) return prev + 3;
          return prev + 1;
        });
      }, 70);

      const response = await classApi.getAll();
      const data = normalizeListResponse(response);
      clearInterval(progressTimer);
      setLoadingProgress(100);
      setClassesList(data);
    } catch (error) {
      setClassesList([]);
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách lớp học",
      );
    } finally {
      setClassesLoading(false);
    }
  }, []);

  // =======================================================
  // LOAD GLOBAL LEADERBOARD
  // =======================================================
  const loadGlobalLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getResultsLeaderBoard();

      if (response?.success) {
        const data = normalizeLeaderboardData(response);
        setStudents(data);
        setLeaderboardMode("all");
        setSelectedClassId(null);
        setSelectedClassName("");
      } else {
        setStudents([]);
        message.error(response?.message || "Không thể lấy bảng thành tích");
      }
    } catch (error) {
      setStudents([]);
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể kết nối máy chủ",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================
  // LOAD CLASS LEADERBOARD
  // =======================================================
  const loadClassLeaderboard = useCallback(
    async (classId) => {
      if (!classId) return;
      try {
        setLoading(true);
        const response = await getClassLeaderboard(classId);

        if (response?.success) {
          const data = normalizeLeaderboardData(response);
          setStudents(data);
          setLeaderboardMode("class");

          const selectedClass = classesList.find(
            (item) => String(getClassId(item)) === String(classId),
          );
          const className = selectedClass
            ? getClassName(selectedClass)
            : `Lớp ${classId}`;
          setSelectedClassName(className);
        } else {
          setStudents([]);
          message.error(
            response?.message || "Không thể lấy bảng xếp hạng của lớp",
          );
        }
      } catch (error) {
        setStudents([]);
        message.error(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể tải bảng xếp hạng lớp",
        );
      } finally {
        setLoading(false);
      }
    },
    [classesList],
  );

  useEffect(() => {
    fetchClasses();
    loadGlobalLeaderboard();
  }, [fetchClasses, loadGlobalLeaderboard]);

  const classOptions = useMemo(() => {
    return classesList
      .filter((item) => getClassId(item))
      .map((item) => ({
        value: getClassId(item),
        label: getClassName(item),
      }));
  }, [classesList]);

  const getTopStudent = useCallback(
    (rankNumber) => {
      return (
        students.find(
          (student, index) => getStudentRank(student, index) === rankNumber,
        ) || null
      );
    },
    [students],
  );

  const top1 = getTopStudent(1);
  const top2 = getTopStudent(2);
  const top3 = getTopStudent(3);

  const handleClassChange = (classId) => {
    if (!classId) {
      loadGlobalLeaderboard();
      return;
    }
    setSelectedClassId(classId);
    loadClassLeaderboard(classId);
  };

  const handleGlobalLeaderboard = () => {
    loadGlobalLeaderboard();
  };

  const handleRefresh = async () => {
    try {
      if (leaderboardMode === "class" && selectedClassId) {
        await Promise.all([
          fetchClasses(),
          loadClassLeaderboard(selectedClassId),
        ]);
      } else {
        await Promise.all([fetchClasses(), loadGlobalLeaderboard()]);
      }
    } catch (error) {
      message.error("Lỗi làm mới dữ liệu!");
    }
  };

  return (
    <div
      className="chibi-leaderboard-container"
      style={{
        backgroundImage: `url(${IMAGE_CONFIG.BACKGROUND})`,
      }}
    >
      {/* DECOR */}
      <img
        src={IMAGE_CONFIG.DOVE_LEFT}
        alt="Dove Left"
        className="dove-img dove-left"
      />
      <img
        src={IMAGE_CONFIG.DOVE_RIGHT}
        alt="Dove Right"
        className="dove-img dove-right"
      />

      <div className="sparkle s1">✨</div>
      <div className="sparkle s2">🌸</div>
      <div className="sparkle s3">⭐</div>
      <div className="sparkle s4">💖</div>

      {/* HEADER & FILTER */}
      <div className="pastel-header-banner">
        <div className="ribbon-pill">
          <CrownFilled className="ribbon-trophy-icon" />
          <span className="ribbon-title-text">Bảng Vàng Giáo Lý</span>
          <CrownFilled className="ribbon-trophy-icon" />
        </div>

        <div className="leaderboard-filter-panel">
          <Button
            type={leaderboardMode === "all" ? "primary" : "default"}
            icon={<GlobalOutlined />}
            onClick={handleGlobalLeaderboard}
            loading={loading && leaderboardMode === "all"}
            className={`leaderboard-mode-btn ${
              leaderboardMode === "all" ? "active" : ""
            }`}
          >
            Toàn giáo xứ
          </Button>

          <Select
            allowClear
            showSearch
            placeholder="🏫 Xem theo lớp"
            value={selectedClassId}
            onChange={handleClassChange}
            options={classOptions}
            optionFilterProp="label"
            loading={classesLoading}
            className="leaderboard-class-select"
            notFoundContent={
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có lớp"
              />
            }
            suffixIcon={<TeamOutlined />}
          />

          {leaderboardMode === "class" && selectedClassName && (
            <Tag className="selected-class-tag">🏫 {selectedClassName}</Tag>
          )}

          <Button
            type="text"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={handleRefresh}
            className="refresh-btn"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <LoadingLogo progress={loadingProgress} />
      ) : students.length === 0 ? (
        <div className="chibi-empty-card">
          <Empty
            image={<div className="empty-icon">🏆</div>}
            description={
              <div>
                <div className="empty-title">Chưa có thành tích</div>
                <div className="empty-description">
                  {leaderboardMode === "class"
                    ? `Lớp ${selectedClassName || "này"} chưa có kết quả.`
                    : "Chưa có học sinh nào có kết quả trong bảng xếp hạng."}
                </div>
              </div>
            }
          />
        </div>
      ) : (
        <div className="game-stage">
          {/* TOP 2 */}
          <div className="podium-column top2-col">
            <div className="rank-badge badge-top2">🥈 HẠNG 2</div>
            <div className="character-area float-anim-2">
              {top2 ? (
                <img src={l2} alt="Top 2" className="full-stand-img img-top2" />
              ) : (
                <div className="empty-character">👤</div>
              )}
            </div>
            <div className="podium-base base-top2">
              <div className="podium-shine" />
              <div className="rank-number-text">2</div>
              <div className="chibi-name-card">
                <div className="student-name-text">
                  {top2 ? getStudentName(top2) : "Chưa có"}
                </div>
                {top2 && (
                  <div className="score-badge badge-mint">
                    <StarFilled
                      style={{ color: COLORS.gold, marginRight: 4 }}
                    />
                    <span>{getStudentScore(top2)} đ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TOP 1 */}
          <div className="podium-column top1-col">
            <div className="crown-wrapper">
              <div className="crown-glow-ring" />
              <CrownFilled className="crown-icon" />
            </div>
            <div className="rank-badge badge-top1">👑 QUÁN QUÂN</div>
            <div className="character-area float-anim-1">
              <div className="winner-glow" />
              {top1 ? (
                <img src={l1} alt="Top 1" className="full-stand-img img-top1" />
              ) : (
                <div className="empty-character winner-empty">👤</div>
              )}
            </div>
            <div className="podium-base base-top1">
              <div className="podium-shine" />
              <div className="rank-number-text">1</div>
              <div className="chibi-name-card card-top1">
                <div className="student-name-text highlight">
                  {top1 ? getStudentName(top1) : "Chưa có"}
                </div>
                {top1 && (
                  <div className="score-badge badge-gold">
                    <StarFilled
                      style={{ color: COLORS.gold, marginRight: 4 }}
                    />
                    <span>{getStudentScore(top1)} đ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TOP 3 */}
          <div className="podium-column top3-col">
            <div className="rank-badge badge-top3">🥉 HẠNG 3</div>
            <div className="character-area float-anim-3">
              {top3 ? (
                <img src={l3} alt="Top 3" className="full-stand-img img-top3" />
              ) : (
                <div className="empty-character">👤</div>
              )}
            </div>
            <div className="podium-base base-top3">
              <div className="podium-shine" />
              <div className="rank-number-text">3</div>
              <div className="chibi-name-card">
                <div className="student-name-text">
                  {top3 ? getStudentName(top3) : "Chưa có"}
                </div>
                {top3 && (
                  <div className="score-badge badge-pink">
                    <StarFilled
                      style={{ color: COLORS.gold, marginRight: 4 }}
                    />
                    <span>{getStudentScore(top3)} đ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* JESUS CHARACTER DECOR */}
          <div className="jesus-wrapper">
            <img
              src={IMAGE_CONFIG.JESUS_CHARACTER}
              alt="Chibi Jesus"
              className="chibi-jesus-img"
            />
          </div>
        </div>
      )}

      {/* STYLES CSS IN JS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .chibi-leaderboard-container {
          width: 100%;
          min-height: 92vh;
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          font-family: "Quicksand", sans-serif;
          overflow: hidden;
          background-color: ${COLORS.background};
          padding: 0;
          isolation: isolate;
        }

        .pastel-header-banner {
          z-index: 10;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .ribbon-pill {
          max-width: calc(100vw - 32px);
          background: linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyHover} 100%);
          padding: 8px 28px;
          border-radius: 30px;
          box-shadow: 0 8px 20px rgba(23, 59, 94, 0.25);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 3px solid ${COLORS.white};
          white-space: nowrap;
        }

        .ribbon-trophy-icon {
          color: ${COLORS.gold};
          font-size: 22px;
          flex-shrink: 0;
          filter: drop-shadow(0 2px 4px rgba(217, 164, 65, 0.4));
        }

        .ribbon-title-text {
          font-family: "Fredoka", cursive, sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: ${COLORS.white};
          letter-spacing: 0.8px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .leaderboard-filter-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          max-width: 100%;
          padding: 7px 12px;
          background: rgba(255, 255, 255, 0.94);
          border: 2px solid ${COLORS.border};
          border-radius: 22px;
          box-shadow: 0 8px 22px rgba(23, 59, 94, 0.08);
          backdrop-filter: blur(12px);
          flex-wrap: wrap;
        }

        .leaderboard-mode-btn {
          height: 38px !important;
          border-radius: 15px !important;
          font-weight: 700;
          border-color: ${COLORS.border} !important;
          color: ${COLORS.text} !important;
          background: ${COLORS.white} !important;
          flex-shrink: 0;
        }

        .leaderboard-mode-btn.active {
          background: linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyHover}) !important;
          border-color: ${COLORS.navy} !important;
          color: ${COLORS.white} !important;
        }

        .leaderboard-class-select {
          min-width: 180px;
          max-width: 100%;
        }

        .leaderboard-class-select .ant-select-selector {
          border-radius: 15px !important;
          border-color: ${COLORS.border} !important;
          min-height: 38px !important;
          display: flex;
          align-items: center;
          font-weight: 700;
          color: ${COLORS.text} !important;
        }

        .selected-class-tag {
          margin: 0 !important;
          border-radius: 12px !important;
          padding: 5px 10px !important;
          background: ${COLORS.navyLight} !important;
          border-color: ${COLORS.border} !important;
          color: ${COLORS.navy} !important;
          font-weight: 700;
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .refresh-btn {
          border-radius: 12px;
          font-weight: 700;
          color: ${COLORS.textSecondary};
          flex-shrink: 0;
        }

        .refresh-btn:hover {
          color: ${COLORS.navy} !important;
          background: ${COLORS.navyLight} !important;
        }

        .sparkle {
          position: absolute;
          font-size: 20px;
          z-index: 2;
          pointer-events: none;
          animation: sparkleFloat 3s infinite ease-in-out alternate;
        }
        .s1 { top: 12%; left: 12%; }
        .s2 { top: 18%; right: 15%; animation-delay: 0.6s; }
        .s3 { top: 42%; left: 6%; animation-delay: 1.2s; }
        .s4 { top: 48%; right: 8%; animation-delay: 0.4s; }

        @keyframes sparkleFloat {
          0% { transform: scale(0.8) translateY(0) rotate(0deg); opacity: 0.5; }
          100% { transform: scale(1.2) translateY(-14px) rotate(15deg); opacity: 1; }
        }

        .dove-img {
          position: absolute;
          width: 70px;
          z-index: 3;
          pointer-events: none;
          filter: drop-shadow(0 6px 12px rgba(23, 59, 94, 0.15));
          animation: floatDove 4s ease-in-out infinite alternate;
        }
        .dove-left { top: 35px; left: 4%; }
        .dove-right { top: 25px; right: 6%; animation-delay: -2s; }

        @keyframes floatDove {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-12px) rotate(5deg); }
        }

        .chibi-empty-card {
          margin: auto;
          background: rgba(255, 255, 255, 0.95);
          padding: 45px 60px;
          border-radius: 30px;
          border: 2px solid ${COLORS.border};
          box-shadow: 0 12px 30px rgba(23, 59, 94, 0.08);
          text-align: center;
          max-width: calc(100vw - 30px);
        }

        .empty-icon { font-size: 55px; }
        .empty-title { font-size: 18px; font-weight: 800; color: ${COLORS.text}; }
        .empty-description { margin-top: 5px; color: ${COLORS.textSecondary}; font-size: 13px; line-height: 1.5; }

        /* PODIUM STAGE */
        .game-stage {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
          max-width: 900px;
          min-height: 480px;
          position: relative;
          z-index: 3;
          margin-top: auto;
          margin-bottom: 20px;
          gap: 16px;
        }

        .podium-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0;
        }

        .podium-column:hover { transform: translateY(-6px); }

        .rank-badge {
          padding: 4px 14px;
          border-radius: 16px;
          font-family: "Fredoka", sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: ${COLORS.white};
          margin-bottom: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          z-index: 6;
          border: 2px solid ${COLORS.white};
          white-space: nowrap;
        }

        .badge-top1 { background: linear-gradient(135deg, ${COLORS.gold} 0%, #B7791F 100%); }
        .badge-top2 { background: linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyHover} 100%); }
        .badge-top3 { background: linear-gradient(135deg, #475569 0%, ${COLORS.gray} 100%); }

        .crown-wrapper {
          position: absolute;
          top: -55px;
          z-index: 7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .crown-icon {
          font-size: 40px;
          color: ${COLORS.gold};
          filter: drop-shadow(0 4px 10px rgba(217, 164, 65, 0.6));
          animation: crownFloat 2s infinite alternate ease-in-out;
        }

        @keyframes crownFloat {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-6px) scale(1.08); }
        }

        .character-area {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          z-index: 5;
          margin-bottom: -10px;
          min-height: 30px;
        }

        .float-anim-1 { animation: charFloat 3s ease-in-out infinite alternate; }
        .float-anim-2 { animation: charFloat 3.4s ease-in-out infinite alternate 0.3s; }
        .float-anim-3 { animation: charFloat 3.8s ease-in-out infinite alternate 0.6s; }

        @keyframes charFloat {
          0% { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }

        .winner-glow {
          position: absolute;
          width: 160px;
          height: 160px;
          background: radial-gradient(circle, rgba(217, 164, 65, 0.3) 0%, rgba(255, 255, 255, 0) 70%);
          bottom: 10px;
          border-radius: 50%;
          z-index: -1;
          animation: pulseGlow 2.5s infinite alternate;
        }

        @keyframes pulseGlow {
          0% { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.25); opacity: 1; }
        }

        .empty-character {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 75px;
          height: 75px;
          font-size: 40px;
          opacity: 0.4;
        }

        .full-stand-img {
          object-fit: contain;
          filter: drop-shadow(0 8px 16px rgba(23, 59, 94, 0.15));
          max-width: 100%;
        }

        .img-top1 { height: 210px; }
        .img-top2 { height: 175px; }
        .img-top3 { height: 155px; }

        /* PODIUM BASES (Custom visual representation if needed) */
        .podium-base {
          width: 150px;
          border-radius: 16px 16px 0 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 8px;
          position: relative;
          box-shadow: 0 10px 25px rgba(23, 59, 94, 0.1);
          border: 2px solid ${COLORS.border};
          border-bottom: none;
        }
        .base-top1 { background: linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.white} 100%); border-color: ${COLORS.gold}; height: 95px; }
        .base-top2 { background: linear-gradient(180deg, ${COLORS.navyLight} 0%, ${COLORS.white} 100%); height: 80px; }
        .base-top3 { background: linear-gradient(180deg, ${COLORS.grayBg} 0%, ${COLORS.white} 100%); height: 65px; }

        .rank-number-text {
          font-family: "Fredoka", sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: ${COLORS.textSecondary};
          opacity: 0.5;
          margin-bottom: 4px;
        }

        .chibi-name-card {
          width: 100%;
          background: ${COLORS.white};
          border-radius: 12px;
          padding: 6px 8px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border: 1px solid ${COLORS.border};
        }

        .student-name-text {
          font-size: 13px;
          font-weight: 800;
          color: ${COLORS.text};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .student-name-text.highlight {
          color: ${COLORS.gold};
        }

        .score-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          margin-top: 2px;
          color: ${COLORS.text};
        }

        .jesus-wrapper {
          position: absolute;
          right: 20px;
          bottom: 10px;
          z-index: 4;
          pointer-events: none;
          display: none;
        }
        @media (min-width: 992px) {
          .jesus-wrapper { display: block; }
          .chibi-jesus-img { height: 160px; object-fit: contain; opacity: 0.95; }
        }
      `}</style>
    </div>
  );
};

export default LeaderboardGame;
