import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioOutlined,
  CaretRightOutlined,
  PauseOutlined,
  SoundOutlined,
  MutedOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "../../assets/css/AudioViewer.css";
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

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return [
      hours,
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ].join(":");
  }
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const getFileName = (url) => {
  if (!url) return "";
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    const fileName = pathname.split("/").filter(Boolean).pop();
    return fileName ? decodeURIComponent(fileName) : "";
  } catch {
    return "";
  }
};

const AudioViewer = ({
  url,
  title,
  description = "Phát nội dung âm thanh",
  className = "",
  showDownload = true,
  showFullscreen = true,
  showSpeed = true,
  seekStep = 10,
  defaultVolume = 0.8,
  onPlay,
  onPause,
  onEnded,
  onError,
}) => {
  const audioRef = useRef(null);
  const playerRef = useRef(null);
  const progressRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(defaultVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const fileName = getFileName(url);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(false);
    setIsLoading(false);
    setHasError(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackRate(1);
    setIsMuted(false);
    audio.pause();
    audio.currentTime = 0;
    audio.playbackRate = 1;
    audio.volume = defaultVolume;
    audio.muted = false;
  }, [url, defaultVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setHasError(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      onPlay?.();
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration || 0);
      onEnded?.();
    };
    const handleError = (e) => {
      setIsPlaying(false);
      setIsLoading(false);
      setHasError(true);
      onError?.(e);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [onPlay, onPause, onEnded, onError]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;
    try {
      if (audio.paused) {
        setIsLoading(true);
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error("Audio play error:", error);
      setIsLoading(false);
    }
  }, [hasError]);

  const seekTo = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const nextTime = Math.min(Math.max(time, 0), audio.duration);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const skipBackward = useCallback(
    () => seekTo(currentTime - seekStep),
    [currentTime, seekStep, seekTo],
  );
  const skipForward = useCallback(
    () => seekTo(currentTime + seekStep),
    [currentTime, seekStep, seekTo],
  );

  const handleProgressClick = useCallback(
    (event) => {
      const progress = progressRef.current;
      if (!progress || !duration) return;
      const rect = progress.getBoundingClientRect();
      const clickPosition = (event.clientX - rect.left) / rect.width;
      seekTo(clickPosition * duration);
    },
    [duration, seekTo],
  );

  const updateVolume = useCallback((nextVolume) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Math.min(Math.max(nextVolume, 0), 1);
    audio.volume = value;
    if (value > 0) {
      audio.muted = false;
      setIsMuted(false);
    }
    setVolume(value);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      const restoredVolume = volume > 0 ? volume : defaultVolume || 0.8;
      audio.volume = restoredVolume;
      setVolume(restoredVolume);
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  }, [defaultVolume, volume]);

  const changePlaybackRate = useCallback((rate) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "audio";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [fileName, url]);

  const enterFullscreen = async () => {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (player.requestFullscreen) {
        await player.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const targetTag = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(targetTag)) return;
      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        skipBackward();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        skipForward();
      }
      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [skipBackward, skipForward, toggleMute, togglePlay]);

  if (!url) {
    return (
      <div
        className="custom-audio-empty"
        style={{
          backgroundColor: COLORS.white,
          borderColor: COLORS.border,
          color: COLORS.muted,
        }}
      >
        <AudioOutlined
          style={{ fontSize: 36, marginBottom: 12, color: COLORS.muted }}
        />
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: COLORS.text,
            marginBottom: 4,
          }}
        >
          Không có file âm thanh
        </div>
        <div style={{ fontSize: 12 }}>Chưa có nội dung âm thanh để phát.</div>
      </div>
    );
  }

  const progressPercent =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <>
      <style>{`
        .custom-audio-container {
          background-color: ${COLORS.white};
          border: 1px solid ${COLORS.border};
          height:100%;
          border-radius: 16px;
          padding: 20px;
          color: ${COLORS.text};
          font-family: inherit;
          box-shadow: 0 10px 25px -5px rgba(23, 59, 94, 0.06);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .custom-audio-container.fullscreen {
          border-radius: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 32px;
          background-color: ${COLORS.background};
        }

        /* HEADER */
        .ca-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
        }
        .ca-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }
        .ca-logo-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: ${COLORS.navy};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: ${COLORS.white};
          box-shadow: 0 4px 12px rgba(23, 59, 94, 0.2);
          flex-shrink: 0;
        }
        .ca-meta h2 {
          font-size: 15px;
          font-weight: 600;
          color: ${COLORS.text};
          margin: 0 0 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ca-meta p {
          font-size: 12px;
          color: ${COLORS.textSecondary};
          margin: 0;
        }
        .ca-filename {
          display: inline-block;
          font-size: 10px;
          color: ${COLORS.navy};
          background: ${COLORS.navyLight};
          padding: 2px 8px;
          border-radius: 4px;
          margin-top: 4px;
          font-weight: 500;
        }
        .ca-actions-top {
          display: flex;
          gap: 8px;
        }
        .ca-top-btn {
          background: ${COLORS.grayBg};
          border: 1px solid ${COLORS.border};
          color: ${COLORS.gray};
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ca-top-btn:hover {
          background: ${COLORS.navyLight};
          color: ${COLORS.navy};
          border-color: ${COLORS.border};
        }

        /* VISUALIZER WAVE AREA */
        .ca-visual-box {
          position: relative;
          background: ${COLORS.background};
          border: 1px solid ${COLORS.border};
          border-radius: 12px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .ca-waves {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 50px;
        }
        .ca-wave-bar {
          width: 4px;
          background: ${COLORS.border};
          border-radius: 4px;
          height: 30%;
          transition: height 0.2s ease;
        }
        .ca-wave-bar.playing {
          background: linear-gradient(to top, ${COLORS.navy}, ${COLORS.gold});
          animation: caWavePulse 1.2s infinite ease-in-out alternate;
          animation-delay: var(--bar-delay);
        }
        @keyframes caWavePulse {
          0% { height: 20%; }
          100% { height: var(--bar-height); }
        }

        /* PROGRESS SECTION */
        .ca-progress-area {
          margin-bottom: 20px;
        }
        .ca-progress-bar-wrapper {
          position: relative;
          height: 24px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .ca-progress-bg {
          width: 100%;
          height: 6px;
          background: ${COLORS.grayBg};
          border-radius: 6px;
          position: relative;
          overflow: hidden;
          border: 1px solid ${COLORS.border};
        }
        .ca-progress-fill {
          height: 100%;
          background: ${COLORS.navy};
          border-radius: 6px;
          transition: width 0.1s linear;
        }
        .ca-progress-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          background: ${COLORS.gold};
          border: 2px solid ${COLORS.white};
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(217, 164, 65, 0.4);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .ca-progress-bar-wrapper:hover .ca-progress-thumb {
          opacity: 1;
        }
        .ca-time-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: ${COLORS.textSecondary};
          margin-top: 4px;
          font-weight: 500;
        }

        /* CONTROLS BAR */
        .ca-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ca-controls-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ca-ctrl-btn {
          background: ${COLORS.grayBg};
          border: 1px solid ${COLORS.border};
          color: ${COLORS.text};
          height: 38px;
          padding: 0 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ca-ctrl-btn:hover {
          background: ${COLORS.navyLight};
          color: ${COLORS.navy};
          border-color: ${COLORS.border};
        }
        .ca-main-play {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${COLORS.navy};
          border: none;
          color: ${COLORS.white};
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(23, 59, 94, 0.3);
          transition: all 0.2s;
        }
        .ca-main-play:hover:not(:disabled) {
          transform: scale(1.05);
          background: ${COLORS.navyHover};
        }
        .ca-main-play:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* VOLUME */
        .ca-volume-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ca-volume-slider-wrap {
          position: relative;
          width: 80px;
          height: 20px;
          display: flex;
          align-items: center;
        }
        .ca-volume-bg {
          width: 100%;
          height: 5px;
          background: ${COLORS.grayBg};
          border-radius: 5px;
          position: relative;
          border: 1px solid ${COLORS.border};
        }
        .ca-volume-fill {
          height: 100%;
          background: ${COLORS.navy};
          border-radius: 5px;
        }
        .ca-volume-slider-wrap input[type="range"] {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .ca-volume-text {
          font-size: 11px;
          color: ${COLORS.textSecondary};
          width: 32px;
          text-align: right;
          font-weight: 500;
        }

        /* SPEED MENU */
        .ca-speed-container {
          position: relative;
        }
        .ca-speed-btn {
          background: ${COLORS.grayBg};
          border: 1px solid ${COLORS.border};
          color: ${COLORS.text};
          height: 38px;
          padding: 0 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        .ca-speed-btn.active {
          background: ${COLORS.goldLight};
          color: ${COLORS.warning};
          border-color: ${COLORS.gold};
        }
        .ca-speed-dropdown {
          position: absolute;
          bottom: 115%;
          right: 0;
          background: ${COLORS.white};
          border: 1px solid ${COLORS.border};
          border-radius: 12px;
          padding: 6px;
          box-shadow: 0 10px 25px rgba(23, 59, 94, 0.12);
          z-index: 10;
          min-width: 90px;
        }
        .ca-speed-item {
          display: block;
          width: 100%;
          background: transparent;
          border: none;
          color: ${COLORS.text};
          padding: 6px 12px;
          text-align: left;
          font-size: 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        .ca-speed-item:hover {
          background: ${COLORS.navyLight};
          color: ${COLORS.navy};
        }
        .ca-speed-item.active {
          color: ${COLORS.gold};
          font-weight: 600;
        }

        /* ERROR & EMPTY STATES */
        .custom-audio-error {
          background: ${COLORS.dangerBg};
          border: 1px solid rgba(192, 57, 43, 0.2);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          color: ${COLORS.danger};
        }
        .custom-audio-empty {
          border: 1px dashed ${COLORS.border};
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
        }

        /* FOOTER INFO */
        .ca-footer-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid ${COLORS.border};
          font-size: 11px;
          color: ${COLORS.muted};
        }
        .ca-shortcuts b {
          background: ${COLORS.grayBg};
          padding: 1px 5px;
          border-radius: 4px;
          color: ${COLORS.textSecondary};
          margin: 0 3px;
          border: 1px solid ${COLORS.border};
        }
      `}</style>

      <div
        ref={playerRef}
        className={[
          "custom-audio-container",
          isFullscreen ? "fullscreen" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <audio ref={audioRef} src={url} preload="metadata" />

        {/* HEADER */}
        <div className="ca-header">
          <div className="ca-header-left">
            <div className="ca-logo-badge">
              <AudioOutlined />
            </div>
            <div className="ca-meta">
              <h2>{title || "Tệp âm thanh"}</h2>
              <p>{description}</p>
              {fileName && <span className="ca-filename">{fileName}</span>}
            </div>
          </div>

          <div className="ca-actions-top">
            {showDownload && (
              <button
                type="button"
                className="ca-top-btn"
                onClick={handleDownload}
                title="Tải xuống"
              >
                <DownloadOutlined />
              </button>
            )}
            {showFullscreen && (
              <button
                type="button"
                className="ca-top-btn"
                onClick={enterFullscreen}
                title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              >
                {isFullscreen ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                )}
              </button>
            )}
          </div>
        </div>

        {/* ERROR STATE */}
        {hasError ? (
          <div className="custom-audio-error">
            <AudioOutlined style={{ fontSize: 28, marginBottom: 8 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Không thể phát file âm thanh
            </div>
            <div style={{ fontSize: 12, marginBottom: 16 }}>
              File có thể không tồn tại hoặc định dạng không được hỗ trợ.
            </div>
            <button
              type="button"
              className="ca-ctrl-btn"
              style={{ margin: "0 auto", backgroundColor: COLORS.white }}
              onClick={() => {
                const audio = audioRef.current;
                if (!audio) return;
                setHasError(false);
                audio.load();
              }}
            >
              <ReloadOutlined /> Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* WAVEFORM VISUALIZER */}
            <div className="ca-visual-box">
              <div className="ca-waves">
                {Array.from({ length: 32 }).map((_, index) => (
                  <span
                    key={index}
                    className={`ca-wave-bar ${isPlaying ? "playing" : ""}`}
                    style={{
                      "--bar-delay": `${index * 0.04}s`,
                      "--bar-height": `${30 + ((index * 13) % 65)}%`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="ca-progress-area">
              <div
                ref={progressRef}
                className="ca-progress-bar-wrapper"
                onClick={handleProgressClick}
                role="slider"
                aria-label="Tiến trình âm thanh"
                aria-valuemin={0}
                aria-valuemax={duration || 0}
                aria-valuenow={currentTime}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    skipBackward();
                  }
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    skipForward();
                  }
                }}
              >
                <div className="ca-progress-bg">
                  <div
                    className="ca-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div
                  className="ca-progress-thumb"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>
              <div className="ca-time-row">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="ca-controls-row">
              <div className="ca-controls-group">
                <button
                  type="button"
                  className="ca-ctrl-btn"
                  onClick={skipBackward}
                  title={`Tua lại ${seekStep} giây`}
                >
                  <StepBackwardOutlined />
                  <span>{seekStep}s</span>
                </button>

                <button
                  type="button"
                  className="ca-main-play"
                  onClick={togglePlay}
                  disabled={isLoading}
                  title={isPlaying ? "Tạm dừng" : "Phát"}
                >
                  {isLoading ? (
                    <LoadingOutlined spin />
                  ) : isPlaying ? (
                    <PauseOutlined />
                  ) : (
                    <CaretRightOutlined />
                  )}
                </button>

                <button
                  type="button"
                  className="ca-ctrl-btn"
                  onClick={skipForward}
                  title={`Tua tới ${seekStep} giây`}
                >
                  <span>{seekStep}s</span>
                  <StepForwardOutlined />
                </button>
              </div>

              <div className="ca-controls-group">
                {/* VOLUME */}
                <div className="ca-volume-box">
                  <button
                    type="button"
                    className="ca-top-btn"
                    onClick={toggleMute}
                    title="Tắt/Bật âm thanh"
                  >
                    {isMuted || volume === 0 ? (
                      <MutedOutlined />
                    ) : (
                      <SoundOutlined />
                    )}
                  </button>
                  <div className="ca-volume-slider-wrap">
                    <div className="ca-volume-bg">
                      <div
                        className="ca-volume-fill"
                        style={{ width: `${volumePercent}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => updateVolume(Number(e.target.value))}
                      aria-label="Âm lượng"
                    />
                  </div>
                  <span className="ca-volume-text">
                    {Math.round(volumePercent)}%
                  </span>
                </div>

                {/* SPEED MENU */}
                {showSpeed && (
                  <div className="ca-speed-container">
                    <button
                      type="button"
                      className={`ca-speed-btn ${showSpeedMenu ? "active" : ""}`}
                      onClick={() => setShowSpeedMenu((prev) => !prev)}
                      title="Tốc độ phát"
                    >
                      <SettingOutlined />
                      <span>{playbackRate}x</span>
                    </button>

                    {showSpeedMenu && (
                      <div className="ca-speed-dropdown">
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: COLORS.muted,
                            padding: "4px 8px",
                          }}
                        >
                          Tốc độ
                        </div>
                        {PLAYBACK_RATES.map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            className={`ca-speed-item ${playbackRate === rate ? "active" : ""}`}
                            onClick={() => changePlaybackRate(rate)}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* FOOTER INFO */}
        {!hasError && (
          <div className="ca-footer-info">
            <span>
              <AudioOutlined style={{ marginRight: 6 }} /> Audio Stream
            </span>
            <span className="ca-shortcuts">
              <b>Space</b> phát/dừng <b>←</b>
              <b>→</b> tua <b>M</b> mute
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default AudioViewer;
