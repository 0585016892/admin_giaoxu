import React from "react";
import { Button } from "antd";

// Bảng màu thiết kế tối giản hiện đại (Slate Concept)
const colors = {
  primary: "#0F172A", // Dark Slate (Đen xám sang trọng)
  primaryHover: "#1E293B",
  secondaryBg: "#F1F5F9", // Xám nhạt mềm
  secondaryText: "#334155",
  secondaryHover: "#E2E8F0",
  borderColor: "#D0D5DD",
  dangerBg: "#FEE2E2",
  dangerText: "#DC2626",
};

const AppButton = ({
  children,
  type = "default",
  variant = "default", // "primary" | "secondary" | "outline" | "ghost" | "danger"
  icon,
  loading = false,
  disabled = false,
  size = "middle",
  danger = false,
  block = false,
  onClick,
  width,
  minWidth,
  htmlType = "button",
  style,
  className = "",
  ...props
}) => {
  // Xác định variant ưu tiên
  const isPrimary = type === "primary" || variant === "primary";
  const isSecondary = variant === "secondary";
  const isDanger = danger || variant === "danger";

  // Cấu hình height & padding theo size
  const sizeStyles = {
    small: { height: 32, padding: "0 12px", fontSize: 13, borderRadius: 8 },
    middle: { height: 40, padding: "0 18px", fontSize: 14, borderRadius: 10 },
    large: { height: 48, padding: "0 24px", fontSize: 15, borderRadius: 12 },
  };

  const currentSize = sizeStyles[size] || sizeStyles.middle;

  // Xử lý Dynamic Style cho từng biến thể
  const getCustomStyle = () => {
    let customStyle = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: isPrimary ? 600 : 500,
      minWidth: minWidth ?? (isPrimary ? 110 : undefined),
      width,
      transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "none",
      ...currentSize,
    };

    if (isPrimary) {
      customStyle = {
        ...customStyle,
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        color: "#FFFFFF",
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
      };
    } else if (isSecondary) {
      customStyle = {
        ...customStyle,
        backgroundColor: colors.secondaryBg,
        borderColor: "transparent",
        color: colors.secondaryText,
      };
    } else if (isDanger) {
      customStyle = {
        ...customStyle,
        backgroundColor: "#FEF2F2",
        borderColor: "#FCA5A5",
        color: colors.dangerText,
      };
    } else {
      // Default / Outline
      customStyle = {
        ...customStyle,
        borderColor: colors.borderColor,
        color: "#344054",
        backgroundColor: "#FFFFFF",
      };
    }

    return customStyle;
  };

  return (
    <>
      {/* Scope Style CSS tùy chỉnh Hover & Active Effects */}
      <style>{`
        .app-btn-custom {
          border-style: solid;
          border-width: 1px;
        }
        
        /* Hiệu ứng Primary Hover */
        .app-btn-primary:hover:not(:disabled) {
          background-color: ${colors.primaryHover} !important;
          border-color: ${colors.primaryHover} !important;
          color: #ffffff !important;
          transform: translateY(-1px);
          boxShadow: 0 4px 12px rgba(15, 23, 42, 0.12) !important;
        }

        /* Hiệu ứng Secondary Hover */
        .app-btn-secondary:hover:not(:disabled) {
          background-color: ${colors.secondaryHover} !important;
          color: #0f172a !important;
        }

        /* Hiệu ứng Default Hover */
        .app-btn-default:hover:not(:disabled) {
          border-color: #94A3B8 !important;
          color: #0F172A !important;
          background-color: #F8FAFC !important;
        }

        /* Hiệu ứng Danger Hover */
        .app-btn-danger:hover:not(:disabled) {
          background-color: #FEE2E2 !important;
          border-color: #F87171 !important;
          color: #B91C1C !important;
        }

        /* Active Effect (khi nhấn xuống) */
        .app-btn-custom:active:not(:disabled) {
          transform: translateY(0px) scale(0.98) !important;
        }

        /* Disabled State */
        .app-btn-custom:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
      `}</style>

      <Button
        htmlType={htmlType}
        icon={icon}
        loading={loading}
        disabled={disabled}
        block={block}
        onClick={onClick}
        className={`app-btn-custom ${
          isPrimary
            ? "app-btn-primary"
            : isSecondary
              ? "app-btn-secondary"
              : isDanger
                ? "app-btn-danger"
                : "app-btn-default"
        } ${className}`}
        style={{
          ...getCustomStyle(),
          ...style,
        }}
        {...props}
      >
        {children}
      </Button>
    </>
  );
};

export default AppButton;
