import React from "react";
import { Button } from "antd";

/**
 * Modern Navy & Gold Design Tokens
 */
const BUTTON_STYLES = {
  primary: {
    bg: "linear-gradient(135deg, #173B5E 0%, #244F78 100%)",
    color: "#FFFFFF",
    border: "#173B5E",
    hoverBg: "linear-gradient(135deg, #244F78 0%, #173B5E 100%)",
    hoverBorder: "#244F78",
    activeBg: "#0F2842",
    shadow: "0 4px 12px rgba(23, 59, 94, 0.2)",
    hoverShadow: "0 6px 16px rgba(23, 59, 94, 0.3)",
  },
  gold: {
    bg: "linear-gradient(135deg, #D9A441 0%, #C28D2B 100%)",
    color: "#FFFFFF",
    border: "#D9A441",
    hoverBg: "linear-gradient(135deg, #E2B254 0%, #D9A441 100%)",
    hoverBorder: "#E2B254",
    activeBg: "#B07D20",
    shadow: "0 4px 12px rgba(217, 164, 65, 0.25)",
    hoverShadow: "0 6px 16px rgba(217, 164, 65, 0.35)",
  },
  secondary: {
    bg: "#EEF2F7",
    color: "#173B5E",
    border: "transparent",
    hoverBg: "#E2E8F0",
    hoverBorder: "transparent",
    activeBg: "#CBD5E1",
    shadow: "none",
    hoverShadow: "none",
  },
  danger: {
    bg: "#FEF2F2",
    color: "#DC2626",
    border: "#FECACA",
    hoverBg: "#FEE2E2",
    hoverBorder: "#F87171",
    activeBg: "#FCA5A5",
    shadow: "none",
    hoverShadow: "0 4px 12px rgba(220, 38, 38, 0.12)",
  },
  ghost: {
    bg: "transparent",
    color: "#173B5E",
    border: "transparent",
    hoverBg: "#F7F9FC",
    hoverBorder: "transparent",
    activeBg: "#EEF2F7",
    shadow: "none",
    hoverShadow: "none",
  },
  default: {
    bg: "#FFFFFF",
    color: "#173B5E",
    border: "#D9E2EC",
    hoverBg: "#F7F9FC",
    hoverBorder: "#173B5E",
    activeBg: "#EEF2F7",
    shadow: "0 1px 2px rgba(23, 59, 94, 0.04)",
    hoverShadow: "0 2px 6px rgba(23, 59, 94, 0.08)",
  },
};

const SIZES = {
  small: { height: 32, padding: "0 12px", fontSize: 13, radius: 8 },
  middle: { height: 40, padding: "0 16px", fontSize: 14, radius: 10 },
  large: { height: 48, padding: "0 20px", fontSize: 15, radius: 12 },
};

const AppButton = ({
  children,
  type = "default",
  variant, // "primary" | "gold" | "secondary" | "ghost" | "danger"
  icon,
  loading = false,
  disabled = false,
  size = "middle",
  danger = false,
  block = false,
  shape, // "circle" | "round"
  onClick,
  width,
  minWidth,
  htmlType = "button",
  style,
  className = "",
  ...props
}) => {
  // 1. Phân giải Variant theo tone Navy & Gold
  const resolveVariant = () => {
    if (danger || variant === "danger") return "danger";
    if (variant === "gold") return "gold";
    if (type === "primary" || variant === "primary") return "primary";
    if (variant === "secondary") return "secondary";
    if (variant === "ghost" || type === "text") return "ghost";
    return "default";
  };

  const currentVariant = resolveVariant();
  const theme = BUTTON_STYLES[currentVariant];
  const sizeConfig = SIZES[size] || SIZES.middle;
  const isCircle = shape === "circle";

  // 2. Tính toán Style động qua Inline CSS Variables
  const dynamicVars = {
    "--btn-bg": theme.bg,
    "--btn-color": theme.color,
    "--btn-border": theme.border,
    "--btn-hover-bg": theme.hoverBg,
    "--btn-hover-border": theme.hoverBorder,
    "--btn-active-bg": theme.activeBg,
    "--btn-shadow": theme.shadow,
    "--btn-hover-shadow": theme.hoverShadow,
    "--btn-radius": isCircle
      ? "50%"
      : shape === "round"
        ? "999px"
        : `${sizeConfig.radius}px`,
    height: `${sizeConfig.height}px`,
    width: isCircle ? `${sizeConfig.height}px` : width,
    minWidth: isCircle ? `${sizeConfig.height}px` : minWidth,
    padding: isCircle ? 0 : sizeConfig.padding,
    fontSize: `${sizeConfig.fontSize}px`,
  };

  return (
    <>
      <Button
        htmlType={htmlType}
        icon={icon}
        loading={loading}
        disabled={disabled}
        block={block}
        onClick={onClick}
        shape={shape}
        className={`app-btn-navy-gold ${className}`}
        style={{
          ...dynamicVars,
          ...style,
        }}
        {...props}
      >
        {children}
      </Button>

      <style>{`
        .app-btn-navy-gold {
          background: var(--btn-bg) !important;
          color: var(--btn-color) !important;
          border-color: var(--btn-border) !important;
          box-shadow: var(--btn-shadow) !important;
          border-radius: var(--btn-radius) !important;
          font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-weight: 600 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .app-btn-navy-gold:hover:not(:disabled) {
          background: var(--btn-hover-bg) !important;
          border-color: var(--btn-hover-border) !important;
          box-shadow: var(--btn-hover-shadow) !important;
          transform: translateY(-1px);
        }

        .app-btn-navy-gold:active:not(:disabled) {
          background: var(--btn-active-bg) !important;
          transform: translateY(0);
        }

        .app-btn-navy-gold:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
};

export default AppButton;
