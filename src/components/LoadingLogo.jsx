import React, { useEffect, useRef, useState } from "react";

import "../assets/css/LoadingLogo.css";

// =========================================================
// FAITHEDU COLORS
// =========================================================

export const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  gold: "#D9A441",
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#173B5E",
  textSecondary: "#64748B",
};

// =========================================================
// LOADING CONFIGURATION
// =========================================================

// Thời gian tối thiểu cho hiệu ứng 0% -> 95%.
const MIN_DURATION = 2500;

// Thời gian tô màu 95% -> 100%.
const FINISH_DURATION = 300;

// Giữ chữ đủ màu trước khi chuyển trang.
const COMPLETE_HOLD = 200;

// =========================================================
// LOADING COMPONENT
// =========================================================

const LoadingLogo = ({ loading = true, onComplete, className = "" }) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const loadingRef = useRef(loading);
  const onCompleteRef = useRef(onComplete);

  // Cập nhật trạng thái API ngay khi render.
  loadingRef.current = loading;
  onCompleteRef.current = onComplete;

  // =========================================================
  // LOADING ANIMATION
  // =========================================================

  useEffect(() => {
    let animationFrame = null;
    let holdTimer = null;

    let finishStart = null;
    let finished = false;

    const startTime = performance.now();

    const animate = (now) => {
      if (finished) return;

      const elapsed = now - startTime;

      // =====================================================
      // PHASE 1: TÔ MÀU 0% -> 95%
      // =====================================================

      const ratio = Math.min(elapsed / MIN_DURATION, 1);

      // Easing: nhanh lúc đầu, chậm dần.
      const eased = 1 - Math.pow(1 - ratio, 2);

      const baseProgress = 95 * eased;

      // Chỉ hoàn tất khi đã đủ thời gian
      // và API không còn đang tải.
      const canFinish = elapsed >= MIN_DURATION && !loadingRef.current;

      // =====================================================
      // PHASE 2: TÔ MÀU 95% -> 100%
      // =====================================================

      if (canFinish) {
        if (finishStart === null) {
          finishStart = now;
        }

        const finishElapsed = now - finishStart;

        const finishRatio = Math.min(finishElapsed / FINISH_DURATION, 1);

        const finishProgress = 95 + 5 * finishRatio;

        setProgress(finishProgress);

        if (finishRatio >= 1) {
          finished = true;

          setProgress(100);
          setCompleted(true);

          holdTimer = window.setTimeout(() => {
            onCompleteRef.current?.();
          }, COMPLETE_HOLD);

          return;
        }
      } else {
        setProgress(baseProgress);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }

      if (holdTimer !== null) {
        clearTimeout(holdTimer);
      }
    };
  }, []);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className={`faith-loading-wrapper ${className}`}
      role="status"
      aria-label={
        completed ? "FaithEdu đã tải xong" : "FaithEdu đang tải dữ liệu"
      }
    >
      <div className="faith-loading-container">
        {/* ===============================================
            FAITHEDU LOGO TEXT
            =============================================== */}

        <div className="faith-brand-loader">
          {/* Nền chữ xám bạc */}
          <div className="faith-brand-base" aria-hidden="true">
            <span>Faith</span>
            <span>Edu</span>
          </div>

          {/* Chữ được tô màu từ trái sang phải */}
          <div
            className="faith-brand-reveal"
            style={{
              clipPath: `inset(0 ${100 - progress}% 0 0)`,
            }}
            aria-hidden="true"
          >
            <span className="faith-text-navy">Faith</span>

            <span className="faith-text-gold">Edu</span>
          </div>
        </div>

        {/* ===============================================
            LOADING STATUS
            =============================================== */}

        <div className="faith-loading-caption">
          {completed ? "Hoàn tất" : "Đang tải dữ liệu"}

          {!completed && (
            <span className="faith-loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingLogo;
