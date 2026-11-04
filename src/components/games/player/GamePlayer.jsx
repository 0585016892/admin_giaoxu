import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal, Spin, Tooltip, Typography } from "antd";
import {
  ArrowLeft,
  Gamepad2,
  Maximize,
  Minimize,
  Play,
  Clock3,
  CircleHelp,
  Trophy,
  Sparkles,
  Star,
  ShieldAlert,
  Heart,
  CheckCircle2,
  X,
  Zap,
} from "lucide-react";

import QuizPlayer from "./QuizGame";
import MatchingPlayer from "./MatchingGame";
import WheelPlayer from "./WheelGame";
import MemoryPlayer from "./MemoryGame";
import CrosswordPlayer from "./CrosswordGame";
import SortingPlayer from "./SortingGame";
import DragDropPlayer from "./DragDropGame";
import TrueFalsePlayer from "./TrueFalseGame";

const { Text, Title } = Typography;

// ============================================================
// CẤU HÌNH CÁC LOẠI GAME
// ============================================================

const GAME_PLAYERS = {
  quiz: QuizPlayer,
  matching: MatchingPlayer,
  wheel: WheelPlayer,
  memory: MemoryPlayer,
  crossword: CrosswordPlayer,
  sorting: SortingPlayer,
  drag_drop: DragDropPlayer,
  true_false: TrueFalsePlayer,
};

// ============================================================
// GAME PLAYER
// ============================================================

const GamePlayer = ({ game, loading = false, onExit }) => {
  const containerRef = useRef(null);
  const exitCallbackRef = useRef(onExit);
  const gameRef = useRef(game);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingHref, setPendingHref] = useState(null);
  const [fullscreenSupported, setFullscreenSupported] = useState(true);

  useEffect(() => {
    exitCallbackRef.current = onExit;
  }, [onExit]);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // ==========================================================
  // RESET KHI CHUYỂN SANG GAME KHÁC
  // ==========================================================

  useEffect(() => {
    setHasStarted(false);
    setShowExitModal(false);
    setPendingHref(null);
    setFullscreenSupported(true);
  }, [game?.id]);

  // ==========================================================
  // THEO DÕI FULLSCREEN
  // ==========================================================

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === containerRef.current;

      setIsFullscreen(active);

      console.log(
        active
          ? "[GAME PLAYER] Đang ở chế độ toàn màn hình"
          : "[GAME PLAYER] Đã thoát chế độ toàn màn hình",
      );
    };

    const handleFullscreenError = (event) => {
      console.warn("[GAME PLAYER] Lỗi fullscreen:", event);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    document.addEventListener("fullscreenerror", handleFullscreenError);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);

      document.removeEventListener("fullscreenerror", handleFullscreenError);
    };
  }, []);

  // ==========================================================
  // BẬT FULLSCREEN
  // ==========================================================

  const enterFullscreen = useCallback(async () => {
    const container = containerRef.current;

    if (!container) {
      console.warn("[GAME PLAYER] Không tìm thấy container");
      return false;
    }

    if (document.fullscreenElement === container) {
      return true;
    }

    if (
      !document.fullscreenEnabled ||
      typeof container.requestFullscreen !== "function"
    ) {
      console.warn("[GAME PLAYER] Trình duyệt không hỗ trợ fullscreen");

      setFullscreenSupported(false);
      return false;
    }

    try {
      await container.requestFullscreen();

      console.log("[GAME PLAYER] Bật fullscreen thành công");

      return true;
    } catch (error) {
      console.warn(
        "[GAME PLAYER] Không thể bật fullscreen:",
        error?.message || error,
      );

      setFullscreenSupported(false);

      return false;
    }
  }, []);

  // ==========================================================
  // BẬT / TẮT FULLSCREEN
  // ==========================================================

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await enterFullscreen();
      }
    } catch (error) {
      console.error(
        "[GAME PLAYER] Lỗi thay đổi fullscreen:",
        error?.message || error,
      );
    }
  }, [enterFullscreen]);

  // ==========================================================
  // BẮT ĐẦU GAME
  // ==========================================================

  const handleStartGame = useCallback(async () => {
    if (!gameRef.current) return;

    console.log("[GAME PLAYER] Bắt đầu trò chơi", {
      id: gameRef.current.id,
      name: gameRef.current.name,
      type: gameRef.current.type,
    });

    // Yêu cầu fullscreen ngay từ thao tác bấm.
    await enterFullscreen();

    // Dù fullscreen thất bại vẫn cho phép chơi.
    setShowExitModal(false);
    setPendingHref(null);
    setHasStarted(true);
  }, [enterFullscreen]);

  // ==========================================================
  // XỬ LÝ THOÁT GAME
  // ==========================================================

  const handleExitRequest = useCallback(() => {
    if (!hasStarted) {
      // Chưa chơi: quay lại bình thường.
      if (typeof exitCallbackRef.current === "function") {
        exitCallbackRef.current();
      }

      return;
    }

    // Đang chơi: tuyệt đối không thoát trực tiếp qua nút này.
    setPendingHref(null);
    setShowExitModal(true);

    console.log("[GAME PLAYER] Yêu cầu thoát - chờ người dùng xác nhận");
  }, [hasStarted]);

  // ==========================================================
  // XÁC NHẬN THOÁT GAME
  // ==========================================================

  const confirmExitGame = useCallback(async () => {
    console.log("[GAME PLAYER] Người dùng xác nhận thoát");

    const destination = pendingHref;

    // Đóng modal trước.
    setShowExitModal(false);
    setPendingHref(null);
    setHasStarted(false);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn(
        "[GAME PLAYER] Không thể thoát fullscreen:",
        error?.message || error,
      );
    }

    // Nếu xác nhận điều hướng sang URL khác.
    if (destination) {
      window.location.assign(destination);
      return;
    }

    // Nếu xác nhận thoát game, trở về màn hình trước.
    if (typeof exitCallbackRef.current === "function") {
      exitCallbackRef.current();
    }
  }, [pendingHref]);

  // ==========================================================
  // CHẶN BACK / ĐIỀU HƯỚNG / ĐÓNG TAB KHI ĐANG CHƠI
  // ==========================================================

  useEffect(() => {
    if (!hasStarted) return undefined;

    let isHandlingBack = false;

    const currentUrl = () => window.location.href;

    // Tạo history entry bảo vệ.
    const pushGuardState = () => {
      try {
        window.history.pushState(
          {
            ...window.history.state,
            faithEduGameGuard: true,
          },
          "",
          currentUrl(),
        );
      } catch (error) {
        console.warn("[GAME PLAYER] Không thể tạo history guard:", error);
      }
    };

    pushGuardState();

    // Bấm Back trình duyệt.
    const handlePopState = () => {
      if (isHandlingBack) return;

      isHandlingBack = true;

      // Giữ người chơi ở URL hiện tại.
      pushGuardState();

      setPendingHref(null);
      setShowExitModal(true);

      console.log("[GAME PLAYER] Đã chặn nút Back");

      Promise.resolve().then(() => {
        isHandlingBack = false;
      });
    };

    // Cảnh báo khi tải lại hoặc đóng tab.
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    // Chặn các liên kết điều hướng thông thường.
    const handleDocumentClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) return;

      const link = target.closest("a[href]");

      if (!link) return;

      if (
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        link.hasAttribute("data-allow-navigation")
      ) {
        return;
      }

      let targetUrl;

      try {
        targetUrl = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      if (targetUrl.origin !== window.location.origin) {
        return;
      }

      if (targetUrl.href === window.location.href) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      setPendingHref(targetUrl.href);
      setShowExitModal(true);

      console.log("[GAME PLAYER] Đã chặn liên kết điều hướng:", targetUrl.href);
    };

    // Chặn một số phím tắt quay lại phổ biến.
    const handleKeyDown = (event) => {
      const target = event.target;

      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (isTyping) return;

      const isBackShortcut =
        (event.altKey && event.key === "ArrowLeft") ||
        (event.key === "Backspace" &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey);

      if (isBackShortcut) {
        event.preventDefault();

        setPendingHref(null);
        setShowExitModal(true);

        console.log("[GAME PLAYER] Đã chặn phím tắt quay lại");
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    document.addEventListener("click", handleDocumentClick, true);

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("popstate", handlePopState);

      window.removeEventListener("beforeunload", handleBeforeUnload);

      document.removeEventListener("click", handleDocumentClick, true);

      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [hasStarted]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="gp-loading">
        <div className="gp-loading-orb">
          <Gamepad2 size={42} />
        </div>

        <Spin size="large" />

        <Title level={4} style={{ margin: 0, color: "#312E81" }}>
          Đang chuẩn bị thế giới giáo lý...
        </Title>

        <Text type="secondary">
          Một chút nữa thôi, cuộc vui sắp bắt đầu! ✨
        </Text>

        <GamePlayerStyles />
      </div>
    );
  }

  // ==========================================================
  // KHÔNG TÌM THẤY GAME
  // ==========================================================

  if (!game) {
    return (
      <div className="gp-empty">
        <GamePlayerStyles />

        <div className="gp-empty-icon">
          <Gamepad2 size={56} />
        </div>

        <Title level={3} style={{ color: "#312E81" }}>
          Chưa tìm thấy trò chơi
        </Title>

        <Text type="secondary">
          Trò chơi có thể đã bị xóa hoặc chưa được tải.
        </Text>

        <Button
          type="primary"
          size="large"
          icon={<ArrowLeft size={18} />}
          onClick={onExit}
          style={{ marginTop: 20, borderRadius: 14, height: 48 }}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // ==========================================================
  // KIỂM TRA LOẠI GAME
  // ==========================================================

  const PlayerComponent = GAME_PLAYERS[game.type];

  if (!PlayerComponent) {
    return (
      <div className="gp-empty">
        <GamePlayerStyles />

        <div className="gp-empty-icon gp-empty-error">
          <ShieldAlert size={52} />
        </div>

        <Title level={3} style={{ color: "#9F1239" }}>
          Loại trò chơi chưa được hỗ trợ
        </Title>

        <Text type="secondary">Mã loại: {game.type}</Text>

        <Button
          icon={<ArrowLeft size={18} />}
          onClick={onExit}
          style={{ marginTop: 20, borderRadius: 14, height: 44 }}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  const questionCount = game?.questions?.length || 0;
  const timeLimit = game?.settings?.timeLimit || 30;

  return (
    <div
      ref={containerRef}
      className={`gp-root ${isFullscreen ? "gp-fullscreen" : ""}`}
    >
      <GamePlayerStyles />

      {/* ======================================================
          MÀN HÌNH GIỚI THIỆU GAME
      ======================================================= */}

      {!hasStarted ? (
        <main className="gp-start-screen">
          <div className="gp-background-glow gp-glow-one" />
          <div className="gp-background-glow gp-glow-two" />

          <div className="gp-dot-pattern" />

          <div className="gp-floating gp-floating-star">
            <Star size={34} fill="currentColor" />
          </div>

          <div className="gp-floating gp-floating-zap">
            <Zap size={36} fill="currentColor" />
          </div>

          <div className="gp-floating gp-floating-sparkles">
            <Sparkles size={38} />
          </div>

          <div className="gp-start-layout">
            {/* Phần giới thiệu bên trái */}
            <section className="gp-intro-panel">
              <div className="gp-brand">
                <div className="gp-brand-icon">
                  <Heart size={20} fill="currentColor" />
                </div>

                <span>FaithEdu</span>

                <span className="gp-brand-divider">/</span>

                <span className="gp-brand-subtitle">HỌC GIÁO LÝ</span>
              </div>

              <div className="gp-intro-content">
                <div className="gp-eyebrow">
                  <Sparkles size={15} />
                  HỌC VUI · NHỚ LÂU · SỐNG ĐẠO
                </div>

                <Title className="gp-hero-title">
                  Khám phá
                  <br />
                  <span>đức tin</span>
                  <br />
                  qua trò chơi!
                </Title>

                <Text className="gp-hero-description">
                  Mỗi câu hỏi là một khám phá mới. Sẵn sàng thử sức và chinh
                  phục thử thách giáo lý chưa?
                </Text>

                <div className="gp-feature-list">
                  <div className="gp-feature">
                    <div className="gp-feature-icon gp-feature-purple">
                      <CircleHelp size={19} />
                    </div>

                    <div>
                      <strong>Học qua trải nghiệm</strong>
                      <span>Vừa chơi vừa củng cố kiến thức</span>
                    </div>
                  </div>

                  <div className="gp-feature">
                    <div className="gp-feature-icon gp-feature-yellow">
                      <Trophy size={19} />
                    </div>

                    <div>
                      <strong>Chinh phục điểm số</strong>
                      <span>Cố gắng đạt điểm tối đa</span>
                    </div>
                  </div>

                  <div className="gp-feature">
                    <div className="gp-feature-icon gp-feature-green">
                      <CheckCircle2 size={19} />
                    </div>

                    <div>
                      <strong>Sẵn sàng thử thách</strong>
                      <span>Khám phá từng câu hỏi của trò chơi</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="gp-intro-footer">
                <span className="gp-footer-dot" />
                SỐ HÓA GIÁO LÝ · KẾT NỐI ĐỨC TIN
              </div>
            </section>

            {/* Thẻ game bên phải */}
            <section className="gp-game-card">
              <div className="gp-card-top">
                <div className="gp-card-label">
                  <span className="gp-live-dot" />
                  SẴN SÀNG CHƯA?
                </div>

                <div className="gp-card-index">FAITHEDU GAME</div>
              </div>

              <div className="gp-mascot-stage">
                <div className="gp-mascot-ring gp-ring-one" />
                <div className="gp-mascot-ring gp-ring-two" />

                <div className="gp-mascot-shadow" />

                <div className="gp-mascot">
                  <Gamepad2 size={70} strokeWidth={1.8} color="#FFFFFF" />

                  <div className="gp-mascot-sparkle">
                    <Sparkles size={22} />
                  </div>
                </div>

                <div className="gp-mascot-badge">
                  <Star size={14} fill="currentColor" />
                  LET'S PLAY
                </div>
              </div>

              <div className="gp-game-info">
                <Text className="gp-game-kicker">THỬ THÁCH DÀNH CHO BẠN</Text>

                <Title className="gp-game-name">{game.name}</Title>

                <Text className="gp-game-description">
                  Hoàn thành thử thách và khám phá những điều thú vị trong hành
                  trình học giáo lý.
                </Text>
              </div>

              {/* Thông số game */}
              <div className="gp-stats">
                <div className="gp-stat gp-stat-purple">
                  <div className="gp-stat-icon">
                    <CircleHelp size={20} />
                  </div>

                  <strong>{questionCount}</strong>

                  <span>Câu hỏi</span>
                </div>

                <div className="gp-stat gp-stat-orange">
                  <div className="gp-stat-icon">
                    <Clock3 size={20} />
                  </div>

                  <strong>{timeLimit}s</strong>

                  <span>Mỗi câu</span>
                </div>

                <div className="gp-stat gp-stat-green">
                  <div className="gp-stat-icon">
                    <Trophy size={20} />
                  </div>

                  <strong>{questionCount * 10}</strong>

                  <span>Điểm tối đa</span>
                </div>
              </div>

              {/* Bắt đầu */}
              <button
                type="button"
                className="gp-start-button"
                onClick={handleStartGame}
              >
                <span className="gp-start-button-icon">
                  <Play size={22} fill="currentColor" />
                </span>

                <span>BẮT ĐẦU CHƠI</span>

                <span className="gp-start-arrow">→</span>
              </button>

              <div className="gp-card-bottom">
                <div>
                  <ShieldAlert size={14} />
                  Sẵn sàng tập trung?
                </div>

                <Tooltip title="Thoát về màn hình trước">
                  <button
                    type="button"
                    className="gp-back-button"
                    onClick={handleExitRequest}
                  >
                    <ArrowLeft size={16} />
                    Quay lại
                  </button>
                </Tooltip>
              </div>

              {!fullscreenSupported && (
                <div className="gp-browser-notice">
                  <Text type="secondary">
                    Không thể mở fullscreen. Bạn vẫn có thể chơi bình thường.
                  </Text>
                </div>
              )}
            </section>
          </div>
        </main>
      ) : (
        /* ====================================================
           GIAO DIỆN TRONG GAME
        ===================================================== */

        <div className="gp-playing-layout">
          <header className="gp-playing-header">
            <button
              type="button"
              className="gp-playing-exit"
              onClick={handleExitRequest}
            >
              <ArrowLeft size={18} />
              <span>Thoát</span>
            </button>

            <div className="gp-playing-brand">
              <div className="gp-playing-brand-icon">
                <Gamepad2 size={20} />
              </div>

              <div className="gp-playing-title">
                <span>{game.name}</span>
                <small>FAITHEDU · THỬ THÁCH GIÁO LÝ</small>
              </div>
            </div>

            <div className="gp-playing-actions">
              <Tooltip
                title={isFullscreen ? "Thu nhỏ màn hình" : "Mở toàn màn hình"}
              >
                <button
                  type="button"
                  className="gp-icon-button"
                  onClick={toggleFullscreen}
                  aria-label={
                    isFullscreen ? "Thoát toàn màn hình" : "Mở toàn màn hình"
                  }
                >
                  {isFullscreen ? (
                    <Minimize size={20} />
                  ) : (
                    <Maximize size={20} />
                  )}
                </button>
              </Tooltip>

              <button
                type="button"
                className="gp-icon-button gp-close-button"
                onClick={handleExitRequest}
                aria-label="Yêu cầu thoát game"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          <main className="gp-playing-content">
            <PlayerComponent game={game} onExit={handleExitRequest} />
          </main>

          <div className="gp-playing-footer">
            <div>
              <Heart size={14} fill="currentColor" />
              FaithEdu
            </div>

            <span>Học giáo lý bằng niềm vui và đức tin</span>

            <div className="gp-footer-secure">
              <ShieldAlert size={14} />
              Đang trong trò chơi
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL XÁC NHẬN THOÁT
          Được render bên trong container để hiển thị cả fullscreen.
      ======================================================= */}

      <Modal
        open={showExitModal}
        getContainer={() => containerRef.current || document.body}
        centered
        closable={false}
        maskClosable={false}
        keyboard={false}
        footer={null}
        width={440}
        zIndex={99999}
        transitionName=""
        maskTransitionName=""
        styles={{
          mask: {
            background: "rgba(15, 23, 42, 0.72)",
            backdropFilter: "blur(7px)",
          },
          content: {
            padding: 0,
            borderRadius: 26,
            overflow: "hidden",
            boxShadow: "0 30px 100px rgba(0,0,0,0.3)",
          },
          body: {
            padding: 0,
          },
        }}
      >
        <div className="gp-exit-modal">
          <div className="gp-exit-modal-top">
            <div className="gp-exit-modal-icon">
              <ShieldAlert size={34} />
            </div>

            <div className="gp-exit-modal-label">BẠN ĐANG TRONG TRÒ CHƠI</div>

            <Title level={3} className="gp-exit-modal-title">
              Khoan đã! Đừng vội rời đi
            </Title>

            <Text className="gp-exit-modal-description">
              Bạn có chắc muốn kết thúc trò chơi này không? Tiến trình và kết
              quả hiện tại có thể bị mất.
            </Text>
          </div>

          <div className="gp-exit-modal-game">
            <div className="gp-exit-modal-game-icon">
              <Gamepad2 size={23} />
            </div>

            <div>
              <span>TRÒ CHƠI HIỆN TẠI</span>
              <strong>{game.name}</strong>
            </div>

            <div className="gp-exit-modal-status">ĐANG CHƠI</div>
          </div>

          <div className="gp-exit-modal-actions">
            <Button
              block
              size="large"
              onClick={() => {
                setShowExitModal(false);
                setPendingHref(null);

                console.log("[GAME PLAYER] Người dùng chọn tiếp tục chơi");
              }}
              className="gp-stay-button"
            >
              <Play size={18} fill="currentColor" />Ở LẠI CHƠI TIẾP
            </Button>

            <Button
              block
              size="large"
              danger
              onClick={confirmExitGame}
              className="gp-confirm-exit-button"
            >
              <ArrowLeft size={18} />
              Xác nhận thoát game
            </Button>
          </div>

          <div className="gp-exit-modal-note">
            <Heart size={14} fill="currentColor" />
            <span>Kiên trì thêm một chút, bạn sẽ làm được!</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================
// CSS GIAO DIỆN
// ============================================================

function GamePlayerStyles() {
  return (
    <style>{`
      .gp-root {
        --gp-ink: #20204A;
        --gp-muted: #777A99;
        --gp-purple: #6D4AFF;
        --gp-purple-dark: #4B32C8;
        --gp-border: #ECEBFA;
        width: 100%;
        min-height: 80vh;
        position: relative;
        background: #F7F7FF;
        color: var(--gp-ink);
        font-family: 'Fredoka', 'Baloo 2', 'Nunito', sans-serif;
        box-sizing: border-box;
        isolation: isolate;
      }

      .gp-root *,
      .gp-root *::before,
      .gp-root *::after {
        box-sizing: border-box;
      }

      .gp-root button {
        font-family: inherit;
      }

      .gp-root button:focus-visible {
        outline: 3px solid #A78BFA;
        outline-offset: 4px;
      }

      .gp-root:fullscreen {
        width: 100%;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        background: #F7F7FF;
      }

      .gp-root:fullscreen .gp-playing-layout {
        height: 100%;
        min-height: 0;
      }

      .gp-root:fullscreen .gp-playing-content {
        flex: 1;
        min-height: 0;
        overflow: auto;
        overscroll-behavior: contain;
      }

      .gp-root:fullscreen .gp-playing-footer {
        flex-shrink: 0;
      }

      .gp-root:fullscreen .gp-start-screen {
        height: 100%;
        min-height: 0;
        overflow: auto;
      }

      .gp-root .ant-modal-root {
        position: relative;
        z-index: 99999;
      }

      .gp-loading,
      .gp-empty {
        min-height: 80vh;
        width: 100%;
        padding: 28px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        text-align: center;
        background:
          radial-gradient(circle at 20% 20%, #EEE9FF, transparent 34%),
          radial-gradient(circle at 80% 75%, #FFE9F1, transparent 30%),
          #F8F8FF;
        font-family: 'Fredoka', 'Baloo 2', sans-serif;
      }

      .gp-loading-orb,
      .gp-empty-icon {
        width: 104px;
        height: 104px;
        border-radius: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(145deg, #8B5CF6, #5B3BE8);
        color: white;
        box-shadow: 0 12px 0 #DDD6FE, 0 22px 38px rgba(91,59,232,.2);
      }

      .gp-empty-icon {
        width: 94px;
        height: 94px;
        border-radius: 50%;
      }

      .gp-empty-error {
        background: linear-gradient(145deg, #FB7185, #E11D48);
        box-shadow: 0 10px 0 #FECDD3;
      }

      /* START SCREEN */

      .gp-start-screen {
        min-height: 80vh;
        width: 100%;
        padding: clamp(28px, 5vw, 68px);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background:
          linear-gradient(130deg, #EEEAFE 0%, #F8F6FF 48%, #FFF0F6 100%);
      }

      .gp-background-glow {
        position: absolute;
        width: 460px;
        height: 460px;
        border-radius: 50%;
        filter: blur(2px);
        pointer-events: none;
      }

      .gp-glow-one {
        left: -230px;
        top: -170px;
        background: radial-gradient(circle, rgba(139,92,246,.20), transparent 70%);
      }

      .gp-glow-two {
        right: -180px;
        bottom: -220px;
        background: radial-gradient(circle, rgba(244,114,182,.22), transparent 70%);
      }

      .gp-dot-pattern {
        position: absolute;
        inset: 0;
        opacity: .32;
        pointer-events: none;
        background-image: radial-gradient(#C4B5FD 1.2px, transparent 1.2px);
        background-size: 26px 26px;
        mask-image: linear-gradient(120deg, black, transparent 65%);
      }

      .gp-floating {
        position: absolute;
        z-index: 0;
        pointer-events: none;
        animation: gpFloat 4s ease-in-out infinite;
      }

      .gp-floating-star {
        top: 12%;
        left: 8%;
        color: #F5B82E;
      }

      .gp-floating-zap {
        top: 20%;
        right: 8%;
        color: #A78BFA;
        animation-delay: .8s;
      }

      .gp-floating-sparkles {
        bottom: 12%;
        left: 11%;
        color: #EC75A9;
        animation-delay: 1.2s;
      }

      .gp-start-layout {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 1180px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(370px, 470px);
        gap: clamp(36px, 7vw, 96px);
        align-items: center;
      }

      .gp-intro-panel {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .gp-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        color: #33246C;
        font-size: 21px;
        font-weight: 900;
        letter-spacing: -.5px;
      }

      .gp-brand-icon {
        width: 39px;
        height: 39px;
        border-radius: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #8B5CF6, #6542ED);
        color: #FFFFFF;
        box-shadow: 0 5px 0 #D8CEFF;
      }

      .gp-brand-divider {
        color: #C4B8F5;
        font-weight: 400;
      }

      .gp-brand-subtitle {
        font-size: 10px;
        letter-spacing: 1.7px;
        color: #8176AD;
        font-weight: 800;
      }

      .gp-intro-content {
        padding: 60px 0 45px;
      }

      .gp-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: fit-content;
        max-width: 100%;
        padding: 9px 14px;
        border-radius: 100px;
        border: 1px solid #DED5FF;
        background: rgba(255,255,255,.7);
        color: #6D4AFF;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 1px;
      }

      .gp-hero-title.ant-typography {
        margin: 24px 0 20px;
        font-size: clamp(42px, 5vw, 66px);
        font-weight: 900;
        letter-spacing: -2.5px;
        line-height: 1.12;
        color: #27204F;
      }

      .gp-hero-title span {
        color: #754FF6;
        position: relative;
        display: inline-block;
      }

      .gp-hero-title span::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -5px;
        width: 100%;
        height: 8px;
        border-radius: 100px;
        background: #F6C96B;
        transform: rotate(-1.5deg);
      }

      .gp-hero-description {
        display: block;
        max-width: 460px;
        color: #737391;
        font-size: 15px;
        line-height: 1.9;
      }

      .gp-feature-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-top: 36px;
      }

      .gp-feature {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .gp-feature-icon {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 15px;
      }

      .gp-feature-purple {
        color: #7046E8;
        background: #E9E1FF;
      }

      .gp-feature-yellow {
        color: #B77912;
        background: #FFF0C6;
      }

      .gp-feature-green {
        color: #13845C;
        background: #DDF7E9;
      }

      .gp-feature strong,
      .gp-feature span {
        display: block;
      }

      .gp-feature strong {
        color: #332D5E;
        font-size: 14px;
        font-weight: 900;
        margin-bottom: 3px;
      }

      .gp-feature span {
        color: #8987A6;
        font-size: 12px;
      }

      .gp-intro-footer {
        display: flex;
        align-items: center;
        gap: 9px;
        color: #9992BB;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.3px;
      }

      .gp-footer-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #8B5CF6;
        box-shadow: 0 0 0 4px #E9E1FF;
      }

      /* GAME CARD */

      .gp-game-card {
        min-width: 0;
        padding: 26px;
        border-radius: 30px;
        background: rgba(255,255,255,.94);
        border: 1px solid rgba(255,255,255,.95);
        box-shadow:
          0 30px 90px rgba(67, 49, 140, .13),
          0 5px 18px rgba(67, 49, 140, .05);
        backdrop-filter: blur(20px);
        position: relative;
      }

      .gp-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .gp-card-label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #51438C;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1.2px;
      }

      .gp-live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10B981;
        box-shadow: 0 0 0 4px #D1FAE5;
      }

      .gp-card-index {
        color: #A8A2C3;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1px;
      }

      .gp-mascot-stage {
        height: 195px;
        margin: 18px 0 14px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-radius: 23px;
        background:
          radial-gradient(circle at 50% 30%, rgba(255,255,255,.95), transparent 40%),
          linear-gradient(135deg, #EEE8FF, #E3E7FF 55%, #FCE7F3);
      }

      .gp-mascot-ring {
        position: absolute;
        border: 1px dashed rgba(117, 79, 246, .23);
        border-radius: 50%;
      }

      .gp-ring-one {
        width: 170px;
        height: 170px;
      }

      .gp-ring-two {
        width: 220px;
        height: 220px;
      }

      .gp-mascot-shadow {
        position: absolute;
        bottom: 28px;
        width: 100px;
        height: 15px;
        border-radius: 50%;
        background: rgba(74, 54, 154, .16);
        filter: blur(7px);
      }

      .gp-mascot {
        position: relative;
        width: 116px;
        height: 116px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 35px;
        background: linear-gradient(145deg, #9A7BFF, #6440E8);
        border: 5px solid rgba(255,255,255,.95);
        box-shadow:
          0 10px 0 #4D30BF,
          0 20px 35px rgba(89, 62, 202, .3);
        animation: gpFloat 3s ease-in-out infinite;
      }

      .gp-mascot-sparkle {
        position: absolute;
        right: -17px;
        top: -13px;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 13px;
        color: #A16207;
        background: #FDE68A;
        border: 3px solid #FFFFFF;
        transform: rotate(12deg);
      }

      .gp-mascot-badge {
        position: absolute;
        bottom: 15px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 100px;
        background: #FFFFFF;
        color: #7350DC;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 1px;
        box-shadow: 0 4px 12px rgba(80, 55, 160, .1);
      }

      .gp-game-info {
        text-align: center;
      }

      .gp-game-kicker {
        color: #9489C5;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1.7px;
      }

      .gp-game-name.ant-typography {
        margin: 8px 0 9px;
        color: #30245F;
        font-size: clamp(23px, 2.2vw, 30px);
        font-weight: 900;
        line-height: 1.3;
        overflow-wrap: anywhere;
      }

      .gp-game-description {
        display: block;
        color: #85829F;
        font-size: 12px;
        line-height: 1.8;
      }

      /* STATS */

      .gp-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin: 24px 0;
      }

      .gp-stat {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px 5px;
        border-radius: 17px;
        border: 1px solid transparent;
      }

      .gp-stat-purple {
        color: #7046E8;
        background: #F1EDFF;
        border-color: #E7DEFF;
      }

      .gp-stat-orange {
        color: #D97706;
        background: #FFF6E7;
        border-color: #FCE8C2;
      }

      .gp-stat-green {
        color: #13845C;
        background: #E8F9F0;
        border-color: #D2F2E0;
      }

      .gp-stat-icon {
        margin-bottom: 2px;
      }

      .gp-stat strong {
        font-size: 21px;
        line-height: 1.2;
        font-weight: 900;
        overflow-wrap: anywhere;
      }

      .gp-stat span {
        font-size: 10px;
        font-weight: 700;
        opacity: .8;
      }

      /* START BUTTON */

      .gp-start-button {
        width: 100%;
        min-height: 62px;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        border: none;
        border-radius: 19px;
        cursor: pointer;
        color: #FFFFFF;
        background: linear-gradient(110deg, #805BFF, #643FE9);
        box-shadow:
          0 6px 0 #4828B9,
          0 13px 25px rgba(100, 63, 233, .24);
        font-size: 15px;
        font-weight: 900;
        letter-spacing: .5px;
        transition: transform .16s ease, box-shadow .16s ease, filter .16s ease;
      }

      .gp-start-button:hover {
        color: #FFFFFF !important;
        filter: brightness(1.07);
        transform: translateY(-2px);
        box-shadow:
          0 8px 0 #4828B9,
          0 17px 30px rgba(100, 63, 233, .25);
      }

      .gp-start-button:active {
        transform: translateY(4px);
        box-shadow: 0 2px 0 #4828B9;
      }

      .gp-start-button-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .gp-start-arrow {
        margin-left: auto;
        font-size: 24px;
        font-weight: 500;
        opacity: .85;
      }

      .gp-card-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 20px;
      }

      .gp-card-bottom > div {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #9A95B4;
        font-size: 10px;
      }

      .gp-back-button {
        display: flex;
        align-items: center;
        gap: 5px;
        border: none;
        background: transparent;
        color: #7567AC;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
        padding: 6px;
      }

      .gp-back-button:hover {
        color: #4B32C8;
      }

      .gp-browser-notice {
        margin-top: 12px;
        text-align: center;
        font-size: 11px;
      }

      /* PLAYING HEADER */

      .gp-playing-layout {
        width: 100%;
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        background: #F7F7FF;
      }

      .gp-playing-header {
        min-height: 68px;
        padding: 0 24px;
        display: grid;
        grid-template-columns: 1fr minmax(0, 2fr) 1fr;
        align-items: center;
        gap: 15px;
        flex-shrink: 0;
        background: #FFFFFF;
        border-bottom: 1px solid #E9E7FA;
        box-shadow: 0 3px 15px rgba(57, 42, 120, .05);
        position: relative;
        z-index: 5;
      }

      .gp-playing-exit {
        width: fit-content;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 15px;
        border: 1px solid #FBCBD7;
        border-radius: 13px;
        background: #FFF1F5;
        color: #BE315A;
        font-size: 13px;
        font-weight: 900;
        cursor: pointer;
        transition: background .15s ease;
      }

      .gp-playing-exit:hover {
        background: #FFE1EA;
      }

      .gp-playing-brand {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .gp-playing-brand-icon {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 13px;
        background: #EEE9FF;
        color: #7046E8;
      }

      .gp-playing-title {
        min-width: 0;
        text-align: center;
      }

      .gp-playing-title span {
        display: block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #30245F;
        font-size: 16px;
        font-weight: 900;
      }

      .gp-playing-title small {
        display: block;
        margin-top: 3px;
        color: #A09ABF;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1.2px;
      }

      .gp-playing-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 9px;
      }

      .gp-icon-button {
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #E7E3FC;
        border-radius: 14px;
        background: #F5F2FF;
        color: #6D4AFF;
        cursor: pointer;
        transition: all .15s ease;
      }

      .gp-icon-button:hover {
        background: #EAE3FF;
        transform: translateY(-1px);
      }

      .gp-close-button {
        display: none;
      }

      .gp-playing-content {
        flex: 1;
        min-height: 0;
        width: 100%;
        background: #F7F7FF;
      }

      .gp-playing-footer {
        min-height: 42px;
        padding: 8px 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        border-top: 1px solid #E9E7FA;
        background: #FFFFFF;
        color: #A09ABF;
        font-size: 10px;
      }

      .gp-playing-footer > div {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .gp-playing-footer > div:first-child {
        color: #7153DA;
        font-weight: 900;
      }

      .gp-footer-secure {
        color: #16865D;
        font-weight: 800;
      }

      /* EXIT MODAL */

      .gp-exit-modal {
        background: #FFFFFF;
        color: #27204F;
        font-family: 'Fredoka', 'Baloo 2', 'Nunito', sans-serif;
      }

      .gp-exit-modal-top {
        padding: 34px 30px 22px;
        text-align: center;
        background:
          radial-gradient(circle at 50% 0%, #FFF0F4, transparent 75%),
          #FFFFFF;
      }

      .gp-exit-modal-icon {
        width: 76px;
        height: 76px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 18px;
        border-radius: 25px;
        background: linear-gradient(145deg, #FFE0E8, #FFF0F3);
        border: 1px solid #FFD1DD;
        color: #E3446A;
        box-shadow: 0 7px 0 #FBC5D3;
      }

      .gp-exit-modal-label {
        margin-bottom: 10px;
        color: #D94670;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1.5px;
      }

      .gp-exit-modal-title.ant-typography {
        margin: 0 0 12px;
        color: #30245F;
        font-size: 23px;
        font-weight: 900;
        line-height: 1.35;
      }

      .gp-exit-modal-description {
        display: block;
        color: #85829F;
        font-size: 13px;
        line-height: 1.9;
      }

      .gp-exit-modal-game {
        margin: 0 25px;
        padding: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        border: 1px solid #EAE6FC;
        border-radius: 17px;
        background: #F9F7FF;
      }

      .gp-exit-modal-game-icon {
        width: 43px;
        height: 43px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 13px;
        background: #E9E2FF;
        color: #7046E8;
      }

      .gp-exit-modal-game > div:nth-child(2) {
        min-width: 0;
        flex: 1;
      }

      .gp-exit-modal-game span,
      .gp-exit-modal-game strong {
        display: block;
      }

      .gp-exit-modal-game span {
        color: #9A93BB;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }

      .gp-exit-modal-game strong {
        color: #382A70;
        font-size: 13px;
        overflow-wrap: anywhere;
      }

      .gp-exit-modal-status {
        padding: 6px 8px;
        border-radius: 8px;
        background: #FCE7F3;
        color: #BE185D;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: .5px;
      }

      .gp-exit-modal-actions {
        padding: 24px 25px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .gp-exit-modal-actions .ant-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        border-radius: 14px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 900;
      }

      .gp-exit-modal-actions .gp-stay-button {
        height: 52px;
        border: none;
        color: #FFFFFF;
        background: linear-gradient(110deg, #17B982, #079968);
        box-shadow: 0 5px 0 #087B55;
      }

      .gp-exit-modal-actions .gp-stay-button:hover {
        color: #FFFFFF !important;
        background: linear-gradient(110deg, #20C98F, #0CA875) !important;
      }

      .gp-exit-modal-actions .gp-confirm-exit-button {
        height: 46px;
        border: 1px solid #FAD2DD;
        background: #FFF5F7;
        color: #C43C60;
      }

      .gp-exit-modal-actions .gp-confirm-exit-button:hover {
        color: #BE123C !important;
        border-color: #F4AFC1 !important;
        background: #FFEAF0 !important;
      }

      .gp-exit-modal-note {
        min-height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border-top: 1px solid #F1EFF9;
        background: #FBFAFF;
        color: #9388BA;
        font-size: 10px;
      }

      .gp-exit-modal-note svg {
        color: #E879A7;
      }

      /* ANIMATION */

      @keyframes gpFloat {
        0%, 100% {
          transform: translateY(0) rotate(0);
        }
        50% {
          transform: translateY(-9px) rotate(2deg);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .gp-root *,
        .gp-root *::before,
        .gp-root *::after {
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
          transition-duration: .01ms !important;
        }
      }

      /* TABLET */

      @media (max-width: 950px) {
        .gp-start-screen {
          padding: 40px 24px;
        }

        .gp-start-layout {
          max-width: 600px;
          grid-template-columns: minmax(0, 1fr);
          gap: 28px;
        }

        .gp-intro-content {
          padding: 35px 0 20px;
        }

        .gp-hero-title.ant-typography {
          font-size: clamp(42px, 7vw, 58px);
        }

        .gp-feature-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 25px;
        }

        .gp-feature span {
          line-height: 1.5;
        }

        .gp-intro-footer {
          margin-top: 20px;
        }

        .gp-game-card {
          width: 100%;
          max-width: 470px;
          margin: 0 auto;
        }

        .gp-floating-star {
          top: 5%;
          left: 5%;
        }

        .gp-floating-zap {
          top: 5%;
          right: 5%;
        }
      }

      /* MOBILE */

      @media (max-width: 600px) {
        .gp-root {
          min-height: 100dvh;
        }

        .gp-start-screen {
          min-height: 100dvh;
          padding: 28px 15px;
          align-items: flex-start;
        }

        .gp-start-layout {
          gap: 25px;
        }

        .gp-brand {
          gap: 8px;
          font-size: 18px;
        }

        .gp-brand-icon {
          width: 34px;
          height: 34px;
          border-radius: 11px;
        }

        .gp-brand-subtitle {
          font-size: 8px;
          letter-spacing: 1px;
        }

        .gp-intro-content {
          padding: 30px 0 10px;
        }

        .gp-eyebrow {
          font-size: 9px;
          padding: 8px 11px;
        }

        .gp-hero-title.ant-typography {
          margin: 20px 0 16px;
          font-size: clamp(38px, 11vw, 53px);
          letter-spacing: -1.8px;
        }

        .gp-hero-description {
          font-size: 13px;
          line-height: 1.8;
        }

        .gp-feature-list {
          grid-template-columns: minmax(0, 1fr);
          gap: 13px;
          margin-top: 23px;
        }

        .gp-feature-icon {
          width: 39px;
          height: 39px;
          border-radius: 13px;
        }

        .gp-feature strong {
          font-size: 12px;
        }

        .gp-feature span {
          font-size: 11px;
        }

        .gp-intro-footer {
          font-size: 8px;
          letter-spacing: .8px;
          margin-top: 22px;
        }

        .gp-game-card {
          padding: 17px;
          border-radius: 24px;
        }

        .gp-card-index {
          font-size: 8px;
        }

        .gp-mascot-stage {
          height: 165px;
          margin: 15px 0;
          border-radius: 18px;
        }

        .gp-mascot {
          width: 98px;
          height: 98px;
          border-radius: 29px;
        }

        .gp-mascot > svg {
          width: 58px;
          height: 58px;
        }

        .gp-ring-one {
          width: 145px;
          height: 145px;
        }

        .gp-ring-two {
          width: 190px;
          height: 190px;
        }

        .gp-game-name.ant-typography {
          font-size: 23px;
        }

        .gp-game-description {
          font-size: 11px;
        }

        .gp-stats {
          gap: 7px;
          margin: 19px 0;
        }

        .gp-stat {
          padding: 10px 3px;
          border-radius: 13px;
        }

        .gp-stat strong {
          font-size: 18px;
        }

        .gp-stat span {
          font-size: 9px;
        }

        .gp-start-button {
          min-height: 56px;
          font-size: 13px;
          border-radius: 16px;
        }

        .gp-card-bottom > div {
          font-size: 9px;
        }

        .gp-back-button {
          font-size: 10px;
        }

        .gp-playing-layout {
          min-height: 100dvh;
        }

        .gp-playing-header {
          min-height: 58px;
          padding: 0 10px;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 7px;
        }

        .gp-playing-exit {
          gap: 5px;
          padding: 8px 9px;
          border-radius: 11px;
          font-size: 11px;
        }

        .gp-playing-exit svg {
          width: 15px;
          height: 15px;
        }

        .gp-playing-brand {
          gap: 6px;
        }

        .gp-playing-brand-icon {
          display: none;
        }

        .gp-playing-title span {
          font-size: 12px;
        }

        .gp-playing-title small {
          font-size: 7px;
          letter-spacing: .4px;
        }

        .gp-playing-actions {
          gap: 5px;
        }

        .gp-icon-button {
          width: 34px;
          height: 34px;
          border-radius: 11px;
        }

        .gp-icon-button svg {
          width: 17px;
          height: 17px;
        }

        .gp-close-button {
          display: flex;
        }

        .gp-playing-footer {
          min-height: 35px;
          padding: 7px 10px;
          font-size: 8px;
        }

        .gp-playing-footer > span {
          display: none;
        }

        .gp-exit-modal-top {
          padding: 28px 20px 18px;
        }

        .gp-exit-modal-title.ant-typography {
          font-size: 21px;
        }

        .gp-exit-modal-description {
          font-size: 12px;
        }

        .gp-exit-modal-game {
          margin: 0 16px;
          padding: 11px;
          gap: 9px;
        }

        .gp-exit-modal-status {
          font-size: 7px;
          padding: 5px 6px;
        }

        .gp-exit-modal-actions {
          padding: 20px 16px 16px;
        }

        .gp-exit-modal-note {
          padding: 0 10px;
          font-size: 9px;
        }
      }

      /* MÀN HÌNH NGANG NHỎ */

      @media (max-height: 520px) and (orientation: landscape) {
        .gp-start-screen {
          padding: 22px;
        }

        .gp-start-layout {
          max-width: 1050px;
          grid-template-columns: minmax(0, 1fr) minmax(300px, 390px);
          gap: 30px;
        }

        .gp-intro-content {
          padding: 18px 0;
        }

        .gp-hero-title.ant-typography {
          margin: 14px 0;
          font-size: 38px;
        }

        .gp-feature-list {
          margin-top: 18px;
          gap: 10px;
        }

        .gp-feature:nth-child(3) {
          display: none;
        }

        .gp-game-card {
          padding: 16px;
        }

        .gp-mascot-stage {
          height: 105px;
          margin: 10px 0;
        }

        .gp-mascot {
          width: 75px;
          height: 75px;
          border-radius: 23px;
        }

        .gp-mascot > svg {
          width: 45px;
          height: 45px;
        }

        .gp-game-description {
          display: none;
        }

        .gp-stats {
          margin: 12px 0;
        }

        .gp-playing-header {
          min-height: 52px;
        }

        .gp-playing-footer {
          display: none;
        }
      }
    `}</style>
  );
}

export default GamePlayer;
