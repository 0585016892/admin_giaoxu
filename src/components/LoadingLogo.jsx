import React from "react";
import "../assets/css/LoadingLogo.css";

const LoadingLogo = ({ progress = 0 }) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="faith-loading-wrapper">
      {/* Background ambient glow */}
      <div className="faith-ambient-glow" />

      <div className="faith-loading-container">
        {/* Logo reveal component */}
        <div className="faith-logo-box">
          {/* Chữ nền xám mờ (Base) */}
          <div className="logo-base">
            <span className="brand-primary">Faith</span>
            <span className="brand-secondary">Edu</span>
          </div>

          {/* Lớp chữ màu nổi lên từ dưới lên theo progress */}
          <div
            className="logo-fill"
            style={{
              clipPath: `inset(${100 - safeProgress}% 0 0 0)`,
            }}
          >
            <span className="brand-primary">Faith</span>
            <span className="brand-secondary">Edu</span>
          </div>
        </div>

        {/* Modern Progress Panel */}
        <div className="faith-progress-info">
          <div className="faith-progress-bar-track">
            <div
              className="faith-progress-bar-fill"
              style={{ width: `${safeProgress}%` }}
            >
              <div className="faith-progress-shine" />
            </div>
          </div>

          <div className="faith-progress-meta">
            <span className="faith-status-text">Đang tải hệ thống...</span>
            <span className="faith-percentage-text">
              {Math.round(safeProgress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingLogo;
