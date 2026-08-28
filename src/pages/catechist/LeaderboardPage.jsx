import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { StarFilled, CrownFilled } from "@ant-design/icons";
import { getResultsLeaderBoard } from "../../api/resultApi";

// Assets
import l1 from "../../assets/images/l1.png"; // Top 1
import l2 from "../../assets/images/l2.png"; // Top 2
import l3 from "../../assets/images/l3.png"; // Top 3
import jesusImg from "../../assets/images/jesusImg.png";
import background from "../../assets/images/background.png";
import bocau from "../../assets/images/bocau.png";

const IMAGE_CONFIG = {
  BACKGROUND: background,
  DOVE_LEFT: bocau,
  DOVE_RIGHT: bocau,
  JESUS_CHARACTER: jesusImg,
};

const LeaderboardGame = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await getResultsLeaderBoard();

      if (response && response.success) {
        setStudents(response.data || []);
      } else {
        message.error(response?.message || "Không thể lấy bảng thành tích");
      }
    } catch (error) {
      console.error("LOAD LEADERBOARD ERROR:", error);
      message.error(
        error?.response?.data?.message || "Không thể kết nối máy chủ",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const getTopStudent = (rankNum) => {
    return students.find((s) => Number(s.rank) === rankNum) || null;
  };

  const top1 = getTopStudent(1);
  const top2 = getTopStudent(2);
  const top3 = getTopStudent(3);

  return (
    <div
      className="game-leaderboard-container"
      style={{ backgroundImage: `url(${IMAGE_CONFIG.BACKGROUND})` }}
    >
      {/* CHIM BỒ CÂU TRÁI & PHẢI */}
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

      {/* HẠT SAO LẤP LÁNH DECOR */}
      <div className="sparkle s1">✨</div>
      <div className="sparkle s2">⭐</div>
      <div className="sparkle s3">✨</div>
      <div className="sparkle s4">⭐</div>

      {loading ? (
        <div className="loading-wrapper">
          <Spin size="large" tip="Đang tải Bảng Xếp Hạng..." />
        </div>
      ) : (
        <div className="game-stage">
          {/* ================= BỤC TOP 2 (BÊN TRÁI) ================= */}
          <div className="podium-column top2-col">
            <div className="rank-badge badge-top2">HẠNG 2</div>
            <div className="character-area float-anim-2">
              <img src={l2} alt="Top 2" className="full-stand-img img-top2" />
            </div>

            <div className="podium-base base-top2">
              <div className="podium-shine"></div>
              <div className="rank-number-text">2</div>

              <div className="name-score-card">
                <div className="student-name-text">
                  {top2?.student_name || "Trần Hương Giang"}
                </div>
                <div className="score-badge">
                  <StarFilled style={{ color: "#FFD700", marginRight: 4 }} />
                  <span>{top2?.average_score ?? 0} đ</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BỤC TOP 1 (Ở GIỮA) ================= */}
          <div className="podium-column top1-col">
            <div className="crown-wrapper">
              <div className="crown-glow-ring"></div>
              <CrownFilled className="crown-icon" />
            </div>
            <div className="rank-badge badge-top1">QUÁN QUÂN</div>

            <div className="character-area float-anim-1">
              <div className="winner-glow"></div>
              <img src={l1} alt="Top 1" className="full-stand-img img-top1" />
            </div>

            <div className="podium-base base-top1">
              <div className="podium-shine"></div>
              <div className="rank-number-text">1</div>

              <div className="name-score-card">
                <div className="student-name-text">
                  {top1?.student_name || "Trần Hoàng Phúc"}
                </div>
                <div className="score-badge">
                  <StarFilled style={{ color: "#FFD700", marginRight: 4 }} />
                  <span>{top1?.average_score ?? 0} đ</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BỤC TOP 3 (BÊN PHẢI) ================= */}
          <div className="podium-column top3-col">
            <div className="rank-badge badge-top3">HẠNG 3</div>
            <div className="character-area float-anim-3">
              <img src={l3} alt="Top 3" className="full-stand-img img-top3" />
            </div>

            <div className="podium-base base-top3">
              <div className="podium-shine"></div>
              <div className="rank-number-text">3</div>

              <div className="name-score-card">
                <div className="student-name-text">
                  {top3?.student_name || "Chưa có học sinh"}
                </div>
                <div className="score-badge">
                  <StarFilled style={{ color: "#FFD700", marginRight: 4 }} />
                  <span>{top3?.average_score ?? 0} đ</span>
                </div>
              </div>
            </div>
          </div>

          {/* NHÂN VẬT CHÚA JESUS BÊN PHẢI */}
          <div className="jesus-wrapper">
            <img
              src={IMAGE_CONFIG.JESUS_CHARACTER}
              alt="Chibi Jesus"
              className="chibi-jesus-img"
            />
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@800;900&display=swap');

        .game-leaderboard-container {
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
          font-family: 'Nunito', sans-serif;
          overflow: hidden;
          background-color: #f0f4f8;
          padding-top: 15px;
        }

        /* HEADER & RIBBON */
        .leaderboard-header {
          text-align: center;
          z-index: 5;
          margin-bottom: 5px;
        }

        .header-ribbon {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          padding: 8px 32px;
          border-radius: 50px;
          box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.6);
          display: inline-flex;
          align-items: center;
          gap: 12px;
          border: 3px solid #FFF;
        }

        .trophy-icon {
          color: #FFD700;
          font-size: 26px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .header-title {
          font-family: 'Fredoka', cursive, sans-serif;
          font-size: 32px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
          letter-spacing: 1px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header-subtitle {
          font-size: 15px;
          font-weight: 800;
          color: #FFF;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
          margin-top: 6px;
          letter-spacing: 0.5px;
        }

        /* SPARKLE EFFECT */
        .sparkle {
          position: absolute;
          font-size: 20px;
          z-index: 2;
          pointer-events: none;
          animation: sparkleFloat 3s infinite ease-in-out alternate;
        }
        .s1 { top: 12%; left: 15%; animation-delay: 0s; }
        .s2 { top: 20%; right: 20%; animation-delay: 0.7s; }
        .s3 { top: 45%; left: 8%; animation-delay: 1.4s; }
        .s4 { top: 50%; right: 10%; animation-delay: 0.3s; }

        @keyframes sparkleFloat {
          0% { transform: scale(0.7) translateY(0); opacity: 0.3; }
          100% { transform: scale(1.2) translateY(-15px); opacity: 0.9; }
        }

        /* CHIM BỒ CÂU */
        .dove-img {
          position: absolute;
          width: 80px;
          z-index: 3;
          filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));
          animation: floatDove 4s ease-in-out infinite alternate;
        }
        .dove-left { top: 40px; left: 5%; }
        .dove-right { top: 25px; right: 8%; animation-delay: -2s; transform: scaleX(-1); }

        @keyframes floatDove {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-14px) rotate(4deg); }
        }

        .loading-wrapper {
          margin: auto;
          background: rgba(255, 255, 255, 0.95);
          padding: 30px 50px;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        /* STAGE & PODIUMS */
        .game-stage {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
          max-width: 940px;
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
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .podium-column:hover {
          transform: translateY(-8px);
        }

        /* RANK BADGES */
        .rank-badge {
          padding: 4px 14px;
          border-radius: 20px;
          font-family: 'Fredoka', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #FFF;
          margin-bottom: 6px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.18);
          letter-spacing: 0.5px;
          z-index: 6;
          border: 2px solid rgba(255, 255, 255, 0.8);
        }
        .badge-top1 { background: linear-gradient(135deg, #FFD700, #FF8F00); }
        .badge-top2 { background: linear-gradient(135deg, #4FC3F7, #0288D1); }
        .badge-top3 { background: linear-gradient(135deg, #FF8A65, #E65100); }

        /* CROWN WRAPPER */
        .crown-wrapper {
          position: absolute;
          top: -62px;
          z-index: 7;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .crown-icon {
          font-size: 46px;
          color: #FFD700;
          filter: drop-shadow(0 4px 10px rgba(255, 215, 0, 0.8));
          animation: crownFloat 2s infinite alternate ease-in-out;
        }
        @keyframes crownFloat {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-6px) scale(1.08); }
        }

        /* CHARACTER AREA & ANIMATIONS */
        .character-area {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          z-index: 5;
          margin-bottom: -15px;
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
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(255, 223, 0, 0.5) 0%, rgba(255, 255, 255, 0) 70%);
          bottom: 10px;
          border-radius: 50%;
          z-index: -1;
          animation: pulseGlow 2.5s infinite alternate;
        }
        @keyframes pulseGlow {
          0% { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 1; }
        }

        /* IMAGES */
        .full-stand-img {
          object-fit: contain;
          filter: drop-shadow(0 10px 18px rgba(0,0,0,0.25));
        }
        .img-top1 { height: 235px; }
        .img-top2 { height: 195px; }
        .img-top3 { height: 175px; }

        /* PODIUM BASES (3D GLOSSY DESIGN) */
        .podium-base {
          border-radius: 24px 24px 16px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px 12px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
          position: relative;
          overflow: hidden;
        }

        /* Shine overlay effect */
        .podium-shine {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 38%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 100%);
          pointer-events: none;
          border-radius: 20px 20px 0 0;
        }

        .top1-col { z-index: 5; }
        .base-top1 {
          height: 235px;
          width: 220px;
          background: linear-gradient(180deg, #FFD54F 0%, #FF8F00 100%);
          border: 4px solid #FFE082;
        }

        .top2-col { z-index: 4; }
        .base-top2 {
          height: 180px;
          width: 195px;
          background: linear-gradient(180deg, #81D4FA 0%, #0288D1 100%);
          border: 4px solid #E1F5FE;
        }

        .top3-col { z-index: 4; }
        .base-top3 {
          height: 150px;
          width: 195px;
          background: linear-gradient(180deg, #FFB74D 0%, #F57C00 100%);
          border: 4px solid #FFE0B2;
        }

        /* RANK NUMBER INSIDE PODIUM */
        .rank-number-text {
          font-family: 'Fredoka', cursive, sans-serif;
          font-size: 72px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.35);
          text-shadow: 0 2px 6px rgba(0,0,0,0.1);
          line-height: 1;
          margin-top: -2px;
          user-select: none;
        }

        /* NAME & SCORE GLASS CARD */
        .name-score-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          border-radius: 16px;
          padding: 8px 6px;
          text-align: center;
          box-shadow: 0 6px 16px rgba(0,0,0,0.12);
          border: 1px solid rgba(255, 255, 255, 0.8);
          z-index: 2;
        }

        .student-name-text {
          font-size: 14px;
          font-weight: 900;
          color: #2C3E50;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .score-badge {
          display: inline-flex;
          align-items: center;
          background: #2C3E50;
          color: #FFF;
          font-size: 13px;
          font-weight: 800;
          padding: 2px 10px;
          border-radius: 12px;
          margin-top: 4px;
        }

        /* CHÚA JESUS CHARACTER */
        .jesus-wrapper {
          position: absolute;
          right: -18%;
          bottom: -10px;
          z-index: 6;
          pointer-events: none;
          animation: jesusWave 3s ease-in-out infinite alternate;
        }
        .chibi-jesus-img {
          height: 310px;
          filter: drop-shadow(0 12px 24px rgba(0,0,0,0.25));
        }

        @keyframes jesusWave {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-8px) rotate(2deg); }
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 850px) {
          .game-stage {
            transform: scale(0.85);
            transform-origin: bottom center;
          }
          .header-title { font-size: 26px; }
          .jesus-wrapper { right: -60px; }
          .chibi-jesus-img { height: 250px; }
        }

        @media (max-width: 600px) {
          .game-stage {
            transform: scale(0.68);
            transform-origin: bottom center;
            margin-bottom: 0;
          }
          .header-title { font-size: 20px; }
          .jesus-wrapper { right: -70px; }
          .chibi-jesus-img { height: 210px; }
        }
      `}</style>
    </div>
  );
};

export default LeaderboardGame;
