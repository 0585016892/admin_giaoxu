import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Button,
  Modal,
  Typography,
  Space,
  Table,
  Progress,
  Tooltip,
} from "antd";

import {
  RotateCw,
  ArrowLeft,
  Volume2,
  VolumeX,
  Gift,
  PartyPopper,
  Sparkles,
  Clock3,
  Trophy,
  Star,
  Zap,
} from "lucide-react";

import { getGameFileUrl } from "../../../api/gameApi";

const { Title, Text } = Typography;

/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_ITEMS = [
  {
    id: 1,
    label: "Tràng hạt",
    value: "10 điểm",
    color: "#6C5CE7",
    probability: 25,
  },
  {
    id: 2,
    label: "Sách Kinh",
    value: "20 điểm",
    color: "#00CEC9",
    probability: 25,
  },
  {
    id: 3,
    label: "Bút Viết",
    value: "30 điểm",
    color: "#FF7675",
    probability: 25,
  },
  {
    id: 4,
    label: "Tượng Thánh",
    value: "50 điểm",
    color: "#FDCB6E",
    probability: 25,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getFileUrl = (file) => {
  if (!file || typeof file !== "string") return null;
  if (
    file.startsWith("http://") ||
    file.startsWith("https://") ||
    file.startsWith("blob:")
  ) {
    return file;
  }
  try {
    const url = getGameFileUrl(file);
    if (url) return url;
  } catch (error) {
    console.warn("getGameFileUrl error:", error);
  }
  const apiUrl =
    process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || "";
  if (!apiUrl) return file;
  return `${apiUrl.replace(/\/$/, "")}/${file.replace(/^\//, "")}`;
};

const parsePoints = (value) => {
  if (value === null || value === undefined) return 0;
  const match = String(value).match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return 0;
  return Number(match[0].replace(",", ".")) || 0;
};

/* =========================================================
   COMPONENT
========================================================= */

const WheelGame = ({ game, onExit }) => {
  const canvasRef = useRef(null);

  const backgroundAudioRef = useRef(null);
  const spinAudioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  const timerRef = useRef(null);
  const spinTimerRef = useRef(null);
  const autoSpinExecutedRef = useRef(false);

  /* CONFIG DATA */
  const theme = game?.theme || {};
  const settings = game?.settings || {};
  const wheelConfig = game?.wheel || {};
  const backgroundConfig = game?.background || {};
  const media = game?.media || {};

  const primaryColor = theme.primary || "#6C5CE7";
  const secondaryColor = theme.secondary || "#FFEAA7";
  const fontStyle = theme.font || "Baloo 2";

  const items = useMemo(() => {
    if (Array.isArray(wheelConfig?.items) && wheelConfig.items.length >= 2) {
      return wheelConfig.items.map((item, index) => ({
        id: item?.id ?? index + 1,
        label: item?.label || `Phần thưởng ${index + 1}`,
        value: item?.value || "",
        color: item?.color || primaryColor,
        probability: Number(item?.probability || 0),
      }));
    }
    return DEFAULT_ITEMS;
  }, [wheelConfig?.items, primaryColor]);

  const spinsPerPlayer = Math.max(1, Number(wheelConfig?.spinsPerPlayer ?? 1));
  const timeLimit = Math.max(0, Number(settings?.timeLimit ?? 60));
  const showResult =
    wheelConfig?.showResult !== undefined
      ? Boolean(wheelConfig.showResult)
      : true;
  const autoSpin = Boolean(wheelConfig?.autoSpin);
  const showScore =
    settings?.showScore !== undefined ? Boolean(settings.showScore) : true;
  const showTimer =
    settings?.showTimer !== undefined ? Boolean(settings.showTimer) : true;

  const backgroundImageUrl = getFileUrl(backgroundConfig?.image);
  const backgroundMusicUrl = getFileUrl(media?.backgroundMusic);
  const spinSoundUrl = getFileUrl(media?.spinSound);
  const correctSoundUrl = getFileUrl(media?.correctSound);
  const wrongSoundUrl = getFileUrl(media?.wrongSound);

  /* STATES */
  const [spinning, setSpinning] = useState(false);
  const [wonItem, setWonItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(spinsPerPlayer);
  const [isMuted, setIsMuted] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [remainingTime, setRemainingTime] = useState(timeLimit);
  const [wheelSize, setWheelSize] = useState(360);

  /* RESPONSIVE SIZE */
  useEffect(() => {
    const updateWheelSize = () => {
      const width = window.innerWidth;
      if (width <= 480) setWheelSize(260);
      else if (width <= 768) setWheelSize(310);
      else if (width <= 1100) setWheelSize(340);
      else setWheelSize(380);
    };
    updateWheelSize();
    window.addEventListener("resize", updateWheelSize);
    return () => window.removeEventListener("resize", updateWheelSize);
  }, []);

  /* AUDIO CREATION */
  const createAudio = useCallback(
    (url, options = {}) => {
      if (!url) return null;
      try {
        const audio = new Audio(url);
        audio.preload = "auto";
        if (options.loop) audio.loop = true;
        if (options.volume !== undefined) audio.volume = options.volume;
        audio.muted = isMuted;
        return audio;
      } catch (error) {
        console.warn("Audio error:", error);
        return null;
      }
    },
    [isMuted],
  );

  useEffect(() => {
    if (!backgroundMusicUrl) return;
    const audio = createAudio(backgroundMusicUrl, { loop: true, volume: 0.25 });
    if (!audio) return;
    backgroundAudioRef.current = audio;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
      backgroundAudioRef.current = null;
    };
  }, [backgroundMusicUrl, createAudio]);

  useEffect(() => {
    [backgroundAudioRef, spinAudioRef, correctAudioRef, wrongAudioRef].forEach(
      (ref) => {
        if (ref.current) ref.current.muted = isMuted;
      },
    );
  }, [isMuted]);

  const playSound = useCallback(
    (type) => {
      if (isMuted) return;
      let audio;
      if (type === "spin") {
        if (!spinAudioRef.current)
          spinAudioRef.current = createAudio(spinSoundUrl, { volume: 0.55 });
        audio = spinAudioRef.current;
      } else if (type === "correct") {
        if (!correctAudioRef.current)
          correctAudioRef.current = createAudio(correctSoundUrl, {
            volume: 0.8,
          });
        audio = correctAudioRef.current;
      } else if (type === "wrong") {
        if (!wrongAudioRef.current)
          wrongAudioRef.current = createAudio(wrongSoundUrl, { volume: 0.8 });
        audio = wrongAudioRef.current;
      }
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    },
    [isMuted, spinSoundUrl, correctSoundUrl, wrongSoundUrl, createAudio],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      [
        backgroundAudioRef,
        spinAudioRef,
        correctAudioRef,
        wrongAudioRef,
      ].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current = null;
        }
      });
    };
  }, []);

  /* TIMER */
  useEffect(() => {
    if (!showTimer || timeLimit <= 0 || remainingTime <= 0 || isModalOpen)
      return;
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showTimer, timeLimit, remainingTime, isModalOpen]);

  /* DRAW CANVAS */
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || items.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = wheelSize;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - size * 0.05;
    const numberOfSlots = items.length;
    const arcSize = (2 * Math.PI) / numberOfSlots;

    ctx.clearRect(0, 0, size, size);

    /* SEGMENTS */
    items.forEach((item, index) => {
      const startAngle = index * arcSize;
      const endAngle = startAngle + arcSize;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Shadow & Fill
      ctx.fillStyle =
        item.color || (index % 2 === 0 ? primaryColor : "#FFFFFF");
      ctx.fill();

      // Inner divider line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = Math.max(2, size * 0.008);
      ctx.stroke();
      ctx.restore();
    });

    /* TEXT & LABELS */
    items.forEach((item, index) => {
      const angle = index * arcSize + arcSize / 2;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      const labelSize = Math.max(12, Math.min(16, size * 0.042));
      const valueSize = Math.max(10, Math.min(13, size * 0.032));

      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 4;

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `800 ${labelSize}px "${fontStyle}", sans-serif`;

      let label = String(item.label || "");
      const maxLength = items.length >= 8 ? 10 : 15;
      if (label.length > maxLength) {
        label = label.substring(0, maxLength - 1) + "…";
      }

      ctx.fillText(label, radius - size * 0.08, -size * 0.016);

      ctx.fillStyle = "#FFEAA7";
      ctx.font = `700 ${valueSize}px "${fontStyle}", sans-serif`;
      ctx.fillText(
        String(item.value || ""),
        radius - size * 0.08,
        size * 0.045,
      );

      ctx.restore();
    });

    /* LIGHT BULBS AROUND WHEEL EDGE */
    const numBulbs = Math.max(12, items.length * 2);
    for (let i = 0; i < numBulbs; i++) {
      const bulbAngle = (i * (2 * Math.PI)) / numBulbs;
      const bulbRadius = radius - size * 0.02;
      const bx = centerX + bulbRadius * Math.cos(bulbAngle);
      const by = centerY + bulbRadius * Math.sin(bulbAngle);

      ctx.beginPath();
      ctx.arc(bx, by, size * 0.012, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? "#FFEAA7" : "#FFFFFF";
      ctx.shadowColor = "#FFEAA7";
      ctx.shadowBlur = 6;
      ctx.fill();
    }
  }, [items, wheelSize, primaryColor, fontStyle]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  /* RANDOM SELECTION BY PROBABILITY */
  const getRandomIndexByProbability = useCallback(() => {
    const total = items.reduce(
      (sum, item) => sum + Number(item.probability || 0),
      0,
    );
    if (total <= 0) return Math.floor(Math.random() * items.length);

    let random = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      const prob = Number(items[i].probability || 0);
      if (random < prob) return i;
      random -= prob;
    }
    return items.length - 1;
  }, [items]);

  /* SPIN LOGIC */
  const handleSpin = useCallback(() => {
    if (
      spinning ||
      spinsLeft <= 0 ||
      (showTimer && timeLimit > 0 && remainingTime <= 0) ||
      items.length < 2
    ) {
      return;
    }

    if (
      backgroundAudioRef.current &&
      backgroundAudioRef.current.paused &&
      !isMuted
    ) {
      backgroundAudioRef.current.play().catch(() => {});
    }

    setSpinning(true);
    setSpinsLeft((prev) => Math.max(0, prev - 1));
    setIsModalOpen(false);
    setWonItem(null);

    const selectedIndex = getRandomIndexByProbability();
    const selectedItem = items[selectedIndex];
    const numberOfSlots = items.length;
    const arcDegrees = 360 / numberOfSlots;
    const selectedCenter = selectedIndex * arcDegrees + arcDegrees / 2;
    const extraRounds = 360 * (5 + Math.floor(Math.random() * 3));
    const targetRotation =
      rotationDegree + extraRounds + (360 - selectedCenter);

    setRotationDegree(targetRotation);
    playSound("spin");

    spinTimerRef.current = setTimeout(() => {
      setSpinning(false);
      setWonItem(selectedItem);

      const points = parsePoints(selectedItem?.value);
      if (points > 0) setScore((prev) => prev + points);

      if (showResult) setIsModalOpen(true);
      playSound(points > 0 ? "correct" : "wrong");
    }, 4800);
  }, [
    spinning,
    spinsLeft,
    showTimer,
    timeLimit,
    remainingTime,
    items,
    rotationDegree,
    showResult,
    isMuted,
    getRandomIndexByProbability,
    playSound,
  ]);

  /* AUTO SPIN */
  useEffect(() => {
    if (!autoSpin || autoSpinExecutedRef.current) return;
    autoSpinExecutedRef.current = true;
    const timeout = setTimeout(() => handleSpin(), 1000);
    return () => clearTimeout(timeout);
  }, [autoSpin, handleSpin]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  /* REWARD TABLE COLUMNS */
  const rewardColumns = useMemo(
    () => [
      {
        title: "",
        dataIndex: "color",
        key: "color",
        width: 36,
        render: (color) => (
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: color,
              border: "2px solid #fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
          />
        ),
      },
      {
        title: "Phần thưởng",
        dataIndex: "label",
        key: "label",
        render: (text) => (
          <Text
            strong
            style={{ color: "#2D3436", fontSize: 13, fontWeight: 700 }}
          >
            {text}
          </Text>
        ),
      },
      {
        title: "Giá trị",
        dataIndex: "value",
        key: "value",
        align: "right",
        render: (value) => (
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              background: "rgba(108, 92, 231, 0.1)",
              color: primaryColor,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {value || "-"}
          </span>
        ),
      },
    ],
    [primaryColor],
  );

  const pageBackground = backgroundImageUrl
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(15, 12, 41, 0.4), rgba(48, 43, 99, 0.6)), url("${backgroundImageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      };

  const timePercent =
    timeLimit > 0
      ? Math.max(0, Math.min(100, (remainingTime / timeLimit) * 100))
      : 100;
  const spinDisabled =
    spinning ||
    spinsLeft <= 0 ||
    (showTimer && timeLimit > 0 && remainingTime <= 0);

  return (
    <div
      className="wheel-game-container"
      style={{
        height: "85vh",
        minHeight: 600,
        width: "100%",
        ...pageBackground,
        fontFamily: `"${fontStyle}", sans-serif`,
        padding: "16px 20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Dynamic CSS Styling for animations & custom rules */}
      <style>{`
        @keyframes pulse-btn {
          0% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(255, 234, 167, 0.7); }
          70% { transform: translate(-50%, -50%) scale(1.06); box-shadow: 0 0 0 14px rgba(255, 234, 167, 0); }
          100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(255, 234, 167, 0); }
        }
        @keyframes float-star {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(12deg); }
        }
        .spin-icon-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .stat-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          border-radius: 30px;
          font-weight: 800;
          color: #2D3436;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          border: 1px solid rgba(255,255,255,0.6);
        }
        .stat-badge.danger {
          background: #FF7675;
          color: #FFF;
        }
        .sound-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #2D3436;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }
        .sound-btn:hover {
          transform: scale(1.08);
          background: #FFF;
        }
        .main-btn {
          transition: all 0.15s ease-in-out;
        }
        .main-btn:not(:disabled):active {
          transform: translateY(3px) !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* BACKGROUND DECORATIONS */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 30,
          color: "#FFEAA7",
          opacity: 0.8,
          animation: "float-star 3s ease-in-out infinite",
          pointerEvents: "none",
        }}
      >
        <Sparkles size={28} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 30,
          color: "#FFEAA7",
          opacity: 0.7,
          animation: "float-star 4s ease-in-out infinite 1s",
          pointerEvents: "none",
        }}
      >
        <Star size={32} />
      </div>

      {/* HEADER BAR */}
      <div
        style={{
          width: "100%",
          height: 64,
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(12px)",
          borderRadius: 20,
          display: "grid",
          gridTemplateColumns: "140px 1fr auto",
          alignItems: "center",
          padding: "0 16px",
          boxSizing: "border-box",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          zIndex: 10,
        }}
      >
        <div>
          <Button
            type="text"
            icon={<ArrowLeft size={18} />}
            onClick={onExit}
            style={{
              height: 40,
              borderRadius: 12,
              fontWeight: 800,
              color: "#2D3436",
              display: "flex",
              alignItems: "center",
            }}
          >
            Thoát
          </Button>
        </div>

        <div style={{ textAlign: "center" }}>
          <Title
            level={4}
            style={{
              margin: 0,
              color: "#2D3436",
              fontSize: "clamp(18px, 2.2vw, 24px)",
              fontWeight: 900,
              letterSpacing: -0.3,
            }}
          >
            {game?.name || "VÒNG QUAY MAY MẮN"}
          </Title>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {showTimer && timeLimit > 0 && (
            <div
              className={`stat-badge ${remainingTime <= 10 ? "danger" : ""}`}
            >
              <Clock3 size={16} />
              <span>{remainingTime}s</span>
            </div>
          )}

          {showScore && (
            <div className="stat-badge" style={{ color: "#E17055" }}>
              <Trophy size={16} />
              <span>{score} điểm</span>
            </div>
          )}

          <Tooltip title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}>
            <button type="button" onClick={toggleMute} className="sound-btn">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* TIMER PROGRESS */}
      {showTimer && timeLimit > 0 && (
        <div style={{ width: "100%", marginTop: 8 }}>
          <Progress
            percent={timePercent}
            showInfo={false}
            strokeColor={remainingTime <= 10 ? "#FF7675" : secondaryColor}
            trailColor="rgba(255, 255, 255, 0.25)"
            size="small"
          />
        </div>
      )}

      {/* MAIN GAME BODY */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(320px, 0.8fr)",
          gap: 18,
          marginTop: 12,
        }}
      >
        {/* LEFT PANEL: WHEEL DISPLAY */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(16px)",
            borderRadius: 24,
            border: "1px solid rgba(255, 255, 255, 0.7)",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: "16px 24px",
            boxSizing: "border-box",
          }}
        >
          {/* BADGE */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 16px",
              background: "linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)",
              borderRadius: 20,
              color: "#FFF",
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: 0.5,
              marginBottom: 10,
              boxShadow: "0 4px 12px rgba(108, 92, 231, 0.3)",
            }}
          >
            <Zap size={14} /> QUAY LÀ TRÚNG
          </div>

          {/* WHEEL DISPLAY CONTAINER */}
          <div
            style={{
              position: "relative",
              width: wheelSize,
              height: wheelSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px 0",
            }}
          >
            {/* POINTER */}
            <div
              style={{
                position: "absolute",
                top: -12,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 35,
                width: 0,
                height: 0,
                borderLeft: "16px solid transparent",
                borderRight: "16px solid transparent",
                borderTop: `32px solid ${secondaryColor}`,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
              }}
            />

            {/* ROTATING CANVAS CONTAINER */}
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                transform: `rotate(${rotationDegree}deg)`,
                transition: spinning
                  ? "transform 4.8s cubic-bezier(0.15, 0.85, 0.15, 1)"
                  : "none",
                boxShadow:
                  "0 12px 36px rgba(0, 0, 0, 0.22), inset 0 0 0 8px rgba(255,255,255,0.8)",
                border: `6px solid ${primaryColor}`,
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              <canvas ref={canvasRef} />
            </div>

            {/* CENTER BUTTON */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={spinDisabled}
              style={{
                width: Math.max(56, wheelSize * 0.17),
                height: Math.max(56, wheelSize * 0.17),
                borderRadius: "50%",
                background: `linear-gradient(135deg, #FFFFFF, ${secondaryColor})`,
                border: `4px solid ${primaryColor}`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                cursor: spinDisabled ? "not-allowed" : "pointer",
                zIndex: 40,
                padding: 0,
                animation:
                  !spinDisabled && !spinning ? "pulse-btn 2s infinite" : "none",
              }}
            >
              <RotateCw
                size={Math.max(22, wheelSize * 0.07)}
                color={primaryColor}
                className={spinning ? "spin-icon-anim" : ""}
              />
            </button>
          </div>

          {/* MAIN ACTION BUTTON */}
          <Button
            type="primary"
            onClick={handleSpin}
            disabled={spinDisabled}
            className="main-btn"
            style={{
              height: 48,
              minWidth: 220,
              borderRadius: 24,
              border: "none",
              background: spinDisabled
                ? "#B2BEC3"
                : `linear-gradient(135deg, ${primaryColor} 0%, #a29bfe 100%)`,
              fontSize: 16,
              fontWeight: 900,
              boxShadow: spinDisabled
                ? "none"
                : "0 8px 20px rgba(108, 92, 231, 0.4)",
              marginTop: 10,
            }}
          >
            <Space size={8}>
              <RotateCw
                size={18}
                className={spinning ? "spin-icon-anim" : ""}
              />
              {spinning
                ? "ĐANG QUAY..."
                : spinsLeft > 0
                  ? "BẮT ĐẦU QUAY"
                  : "HẾT LƯỢT QUAY"}
            </Space>
          </Button>

          {/* SPINS REMAINING INFO */}
          <div style={{ marginTop: 8 }}>
            <Text
              type="secondary"
              style={{ fontWeight: 700, fontSize: 13, color: "#636E72" }}
            >
              Còn lại:{" "}
              <span style={{ color: primaryColor, fontWeight: 900 }}>
                {spinsLeft}
              </span>{" "}
              lượt quay
            </Text>
          </div>
        </div>

        {/* RIGHT PANEL: REWARD LIST & STATS */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(16px)",
            borderRadius: 24,
            border: "1px solid rgba(255, 255, 255, 0.7)",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Gift size={20} color={primaryColor} />
            <Title
              level={5}
              style={{ margin: 0, color: "#2D3436", fontWeight: 800 }}
            >
              Danh sách phần thưởng
            </Title>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            <Table
              dataSource={items}
              columns={rewardColumns}
              rowKey="id"
              pagination={false}
              size="small"
              bordered={false}
              style={{ background: "transparent" }}
            />
          </div>
        </div>
      </div>

      {/* WINNER MODAL */}
      <Modal
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        centered
        width={360}
        bodyStyle={{
          padding: "28px 20px",
          textAlign: "center",
          borderRadius: 24,
        }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FFEAA7, #FDCB6E)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
            boxShadow: "0 8px 20px rgba(253, 203, 110, 0.4)",
          }}
        >
          <PartyPopper size={36} color="#D63031" />
        </div>

        <Title
          level={3}
          style={{ margin: 0, color: "#2D3436", fontWeight: 900 }}
        >
          Xin chúc mừng!
        </Title>

        <Text
          style={{
            fontSize: 14,
            color: "#636E72",
            display: "block",
            marginTop: 6,
          }}
        >
          Bạn đã quay trúng phần thưởng:
        </Text>

        <div
          style={{
            margin: "18px 0",
            padding: "12px 16px",
            borderRadius: 16,
            background: "rgba(108, 92, 231, 0.08)",
            border: `1px dashed ${primaryColor}`,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: primaryColor }}>
            {wonItem?.label}
          </div>
          {wonItem?.value && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#E17055",
                marginTop: 2,
              }}
            >
              +{wonItem?.value}
            </div>
          )}
        </div>

        <Button
          type="primary"
          block
          onClick={() => setIsModalOpen(false)}
          style={{
            height: 44,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${primaryColor}, #a29bfe)`,
            fontWeight: 800,
            fontSize: 15,
            border: "none",
            boxShadow: "0 6px 16px rgba(108, 92, 231, 0.3)",
          }}
        >
          Nhận phần thưởng
        </Button>
      </Modal>
    </div>
  );
};

export default WheelGame;
