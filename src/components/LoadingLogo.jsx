import React from "react";
import "../assets/css/LoadingLogo.css";

// Bảng màu chuẩn dùng chung nếu cần ép kiểu inline hoặc tham chiếu
export const COLORS = {
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

const LoadingLogo = ({ progress = 0 }) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="faith-loading-wrapper">
      {/* Hiệu ứng nền Ambient Glow nhẹ nhàng với màu Navy/Gold light */}
      <div className="faith-ambient-glow" />

      <div className="faith-loading-container">
        {/* Logo reveal component */}
        <div className="faith-logo-box">
          {/* Chữ nền mờ (Base - màu muted/border tinh tế) */}
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
