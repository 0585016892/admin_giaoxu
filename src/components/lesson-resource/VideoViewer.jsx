import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  VideoCameraOutlined,
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

const VideoViewer = ({
  url,
  title,
  description = "Phát nội dung video",
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
  const videoRef = useRef(null);
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
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);

  const controlsTimeoutRef = useRef(null);
  const fileName = getFileName(url);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setIsPlaying(false);
    setIsLoading(false);
    setHasError(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackRate(1);
    setIsMuted(false);
    video.pause();
    video.currentTime = 0;
    video.playbackRate = 1;
    video.volume = defaultVolume;
    video.muted = false;
  }, [url, defaultVolume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
      setHasError(false);
    };
    const handleTimeUpdate = () => setCurrentTime(video.currentTime || 0);
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
      setCurrentTime(video.duration || 0);
      onEnded?.();
    };
    const handleError = (e) => {
      setIsPlaying(false);
      setIsLoading(false);
      setHasError(true);
      onError?.(e);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [onPlay, onPause, onEnded, onError]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || hasError) return;
    try {
      if (video.paused) {
        setIsLoading(true);
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.error("Video play error:", error);
      setIsLoading(false);
    }
  }, [hasError]);

  const seekTo = useCallback((time) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const nextTime = Math.min(Math.max(time, 0), video.duration);
    video.currentTime = nextTime;
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
    const video = videoRef.current;
    if (!video) return;
    const value = Math.min(Math.max(nextVolume, 0), 1);
    video.volume = value;
    if (value > 0) {
      video.muted = false;
      setIsMuted(false);
    }
    setVolume(value);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted || video.volume === 0) {
      video.muted = false;
      const restoredVolume = volume > 0 ? volume : defaultVolume || 0.8;
      video.volume = restoredVolume;
      setVolume(restoredVolume);
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, [defaultVolume, volume]);

  const changePlaybackRate = useCallback((rate) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "video.mp4";
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
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        enterFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [skipBackward, skipForward, toggleMute, togglePlay]);

  const handleMouseMove = () => {
    setShowControlsOverlay(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControlsOverlay(false);
        setShowSpeedMenu(false);
      }, 3000);
    }
  };

  if (!url) {
    return (
      <div
        className="custom-video-empty"
        style={{
          backgroundColor: COLORS.white,
          borderColor: COLORS.border,
          color: COLORS.muted,
        }}
      >
        <VideoCameraOutlined
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
          Không có file video
        </div>
        <div style={{ fontSize: 12 }}>Chưa có nội dung video để phát.</div>
      </div>
    );
  }

  const progressPercent =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <>
      <style>{`
        .custom-video-container {
          background-color: #000000;
          border: 1px solid ${COLORS.border};
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          font-family: inherit;
          box-shadow: 0 10px 25px -5px rgba(23, 59, 94, 0.08);
          user-select: none;
        }
        .custom-video-container.fullscreen {
          border-radius: 0;
          width: 100vw;
          height: 100vh;
          aspect-ratio: unset;
        }

        .custom-video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        /* OVERLAY CONTROLS */
        .cv-controls-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%);
          padding: 16px;
          opacity: 1;
          transition: opacity 0.3s ease;
          pointer-events: auto;
        }
        .cv-controls-overlay.hidden {
          opacity: 0;
          pointer-events: none;
        }

        /* TOP HEADER */
        .cv-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .cv-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .cv-meta h3 {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cv-meta p {
          font-size: 11px;
          color: rgba(255,255,255,0.7);
          margin: 0;
        }
        .cv-top-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cv-top-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* CENTER PLAY BUTTON */
        .cv-center-play {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: ${COLORS.navy};
          border: 2px solid ${COLORS.gold};
          color: #fff;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          transition: all 0.2s;
        }
        .cv-center-play:hover {
          transform: translate(-50%, -50%) scale(1.1);
          background: ${COLORS.navyHover};
        }

        /* BOTTOM BAR */
        .cv-bottom-panel {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* PROGRESS */
        .cv-progress-bar-wrapper {
          position: relative;
          height: 16px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .cv-progress-bg {
          width: 100%;
          height: 5px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 5px;
          position: relative;
          overflow: hidden;
        }
        .cv-progress-fill {
          height: 100%;
          background: ${COLORS.gold};
          border-radius: 5px;
          transition: width 0.1s linear;
        }
        .cv-progress-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: #fff;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .cv-progress-bar-wrapper:hover .cv-progress-thumb {
          opacity: 1;
        }

        .cv-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .cv-controls-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cv-ctrl-btn {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 16px;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .cv-ctrl-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .cv-time-label {
          font-size: 12px;
          color: #fff;
          font-weight: 500;
          min-width: 85px;
        }

        /* VOLUME */
        .cv-volume-box {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cv-volume-slider-wrap {
          position: relative;
          width: 70px;
          height: 16px;
          display: flex;
          align-items: center;
        }
        .cv-volume-bg {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: 4px;
          position: relative;
        }
        .cv-volume-fill {
          height: 100%;
          background: #fff;
          border-radius: 4px;
        }
        .cv-volume-slider-wrap input[type="range"] {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        /* SPEED MENU */
        .cv-speed-container {
          position: relative;
        }
        .cv-speed-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          color: #fff;
          height: 32px;
          padding: 0 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .cv-speed-dropdown {
          position: absolute;
          bottom: 115%;
          right: 0;
          background: ${COLORS.white};
          border: 1px solid ${COLORS.border};
          border-radius: 10px;
          padding: 6px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          z-index: 10;
          min-width: 80px;
        }
        .cv-speed-item {
          display: block;
          width: 100%;
          background: transparent;
          border: none;
          color: ${COLORS.text};
          padding: 5px 10px;
          text-align: left;
          font-size: 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        .cv-speed-item:hover {
          background: ${COLORS.navyLight};
          color: ${COLORS.navy};
        }
        .cv-speed-item.active {
          color: ${COLORS.gold};
          font-weight: 600;
        }

        /* ERROR */
        .custom-video-error {
          background: ${COLORS.dangerBg};
          border: 1px solid rgba(192, 57, 43, 0.2);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          color: ${COLORS.danger};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        .custom-video-empty {
          border: 1px dashed ${COLORS.border};
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
        }
      `}</style>

      <div
        ref={playerRef}
        className={[
          "custom-video-container",
          isFullscreen ? "fullscreen" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControlsOverlay(false)}
      >
        <video
          ref={videoRef}
          src={url}
          preload="metadata"
          className="custom-video-element"
          playsInline
        />

        {hasError ? (
          <div className="custom-video-error">
            <VideoCameraOutlined style={{ fontSize: 28, marginBottom: 8 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Không thể phát file video
            </div>
            <div style={{ fontSize: 12, marginBottom: 16 }}>
              File có thể không tồn tại hoặc định dạng không được hỗ trợ.
            </div>
            <button
              type="button"
              className="cv-top-btn"
              style={{
                width: "auto",
                padding: "0 16px",
                backgroundColor: COLORS.white,
                color: COLORS.text,
              }}
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                setHasError(false);
                video.load();
              }}
            >
              <ReloadOutlined style={{ marginRight: 6 }} /> Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* CENTER PLAY BUTTON ON PAUSE */}
            {!isPlaying && !isLoading && (
              <button
                type="button"
                className="cv-center-play"
                onClick={togglePlay}
                title="Phát"
              >
                <CaretRightOutlined style={{ marginLeft: 3 }} />
              </button>
            )}

            {/* OVERLAY CONTROLS PANEL */}
            <div
              className={`cv-controls-overlay ${!showControlsOverlay && isPlaying ? "hidden" : ""}`}
            >
              {/* TOP HEADER */}
              <div className="cv-header">
                <div className="cv-header-left">
                  <div className="cv-meta">
                    <h3>{title || "Tệp video"}</h3>
                    {fileName && <p>{fileName}</p>}
                  </div>
                </div>
                <div className="cv-controls-group">
                  {showDownload && (
                    <button
                      type="button"
                      className="cv-top-btn"
                      onClick={handleDownload}
                      title="Tải xuống"
                    >
                      <DownloadOutlined />
                    </button>
                  )}
                  {showFullscreen && (
                    <button
                      type="button"
                      className="cv-top-btn"
                      onClick={enterFullscreen}
                      title={
                        isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"
                      }
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

              {/* BOTTOM CONTROLS */}
              <div className="cv-bottom-panel">
                {/* PROGRESS BAR */}
                <div
                  ref={progressRef}
                  className="cv-progress-bar-wrapper"
                  onClick={handleProgressClick}
                  role="slider"
                  aria-label="Tiến trình video"
                  aria-valuemin={0}
                  aria-valuemax={duration || 0}
                  aria-valuenow={currentTime}
                  tabIndex={0}
                >
                  <div className="cv-progress-bg">
                    <div
                      className="cv-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div
                    className="cv-progress-thumb"
                    style={{ left: `${progressPercent}%` }}
                  />
                </div>

                <div className="cv-controls-row">
                  <div className="cv-controls-group">
                    <button
                      type="button"
                      className="cv-ctrl-btn"
                      onClick={togglePlay}
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
                      className="cv-ctrl-btn"
                      onClick={skipBackward}
                      title={`Tua lại ${seekStep} giây`}
                    >
                      <StepBackwardOutlined />
                    </button>

                    <button
                      type="button"
                      className="cv-ctrl-btn"
                      onClick={skipForward}
                      title={`Tua tới ${seekStep} giây`}
                    >
                      <StepForwardOutlined />
                    </button>

                    <div className="cv-time-label">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="cv-controls-group">
                    {/* VOLUME */}
                    <div className="cv-volume-box">
                      <button
                        type="button"
                        className="cv-ctrl-btn"
                        onClick={toggleMute}
                        title="Tắt/Bật âm thanh"
                      >
                        {isMuted || volume === 0 ? (
                          <MutedOutlined />
                        ) : (
                          <SoundOutlined />
                        )}
                      </button>
                      <div className="cv-volume-slider-wrap">
                        <div className="cv-volume-bg">
                          <div
                            className="cv-volume-fill"
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
                    </div>

                    {/* SPEED */}
                    {showSpeed && (
                      <div className="cv-speed-container">
                        <button
                          type="button"
                          className="cv-speed-btn"
                          onClick={() => setShowSpeedMenu((prev) => !prev)}
                          title="Tốc độ phát"
                        >
                          <SettingOutlined style={{ marginRight: 4 }} />
                          {playbackRate}x
                        </button>

                        {showSpeedMenu && (
                          <div className="cv-speed-dropdown">
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: COLORS.muted,
                                padding: "2px 6px",
                              }}
                            >
                              Tốc độ
                            </div>
                            {PLAYBACK_RATES.map((rate) => (
                              <button
                                key={rate}
                                type="button"
                                className={`cv-speed-item ${playbackRate === rate ? "active" : ""}`}
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
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default VideoViewer;
