import React from "react";
import { Button } from "antd";

/**
 * FaithEdu AppButton
 * Design: Modern Navy & Gold
 */

const BUTTON_STYLES = {
  primary: {
    bg: "linear-gradient(180deg, #244F78 0%, #173B5E 100%)",
    color: "#FFFFFF",
    border: "#173B5E",
    hoverBg: "linear-gradient(180deg, #2D5D8C 0%, #1B446A 100%)",
    hoverBorder: "#173B5E",
    activeBg: "linear-gradient(180deg, #173B5E 0%, #102E4A 100%)",
    shadow: "0 5px 0 #0E2D47, 0 7px 14px rgba(23,59,94,.20)",
    hoverShadow: "0 6px 0 #0E2D47, 0 9px 18px rgba(23,59,94,.24)",
    activeShadow: "0 2px 0 #0E2D47, 0 4px 8px rgba(23,59,94,.18)",
  },

  gold: {
    bg: "linear-gradient(180deg, #E2B254 0%, #D9A441 100%)",
    color: "#FFFFFF",
    border: "#C99531",
    hoverBg: "linear-gradient(180deg, #E8BB65 0%, #D9A441 100%)",
    hoverBorder: "#C99531",
    activeBg: "linear-gradient(180deg, #D9A441 0%, #B98222 100%)",
    shadow: "0 5px 0 #A8751D, 0 7px 14px rgba(217,164,65,.22)",
    hoverShadow: "0 6px 0 #A8751D, 0 9px 18px rgba(217,164,65,.28)",
    activeShadow: "0 2px 0 #A8751D, 0 4px 8px rgba(217,164,65,.18)",
  },

  secondary: {
    bg: "#EEF2F7",
    color: "#173B5E",
    border: "#E2E8F0",
    hoverBg: "#E5EBF2",
    hoverBorder: "#D5DEE9",
    activeBg: "#DCE4ED",
    shadow: "0 4px 0 #D2DAE4, 0 5px 10px rgba(23,59,94,.08)",
    hoverShadow: "0 5px 0 #D2DAE4, 0 7px 14px rgba(23,59,94,.10)",
    activeShadow: "0 2px 0 #D2DAE4, 0 3px 7px rgba(23,59,94,.06)",
  },

  danger: {
    bg: "linear-gradient(180deg, #FEF2F2 0%, #FEE2E2 100%)",
    color: "#DC2626",
    border: "#FECACA",
    hoverBg: "linear-gradient(180deg, #FEE2E2 0%, #FECACA 100%)",
    hoverBorder: "#F87171",
    activeBg: "#FCA5A5",
    shadow: "0 4px 0 #FCA5A5, 0 5px 10px rgba(220,38,38,.10)",
    hoverShadow: "0 5px 0 #FCA5A5, 0 7px 14px rgba(220,38,38,.14)",
    activeShadow: "0 2px 0 #FCA5A5, 0 3px 7px rgba(220,38,38,.08)",
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
    activeShadow: "none",
  },

  default: {
    bg: "#FFFFFF",
    color: "#173B5E",
    border: "#D9E2EC",
    hoverBg: "#F7F9FC",
    hoverBorder: "#173B5E",
    activeBg: "#EEF2F7",
    shadow: "0 4px 0 #E0E6ED, 0 5px 10px rgba(23,59,94,.06)",
    hoverShadow: "0 5px 0 #D8E0E8, 0 7px 14px rgba(23,59,94,.08)",
    activeShadow: "0 2px 0 #D8E0E8, 0 3px 7px rgba(23,59,94,.05)",
  },
};

const SIZES = {
  small: {
    height: 34,
    padding: "0 14px",
    fontSize: 13,
    radius: 12,
  },

  middle: {
    height: 42,
    padding: "0 17px",
    fontSize: 14,
    radius: 14,
  },

  large: {
    height: 48,
    padding: "0 21px",
    fontSize: 15,
    radius: 20,
  },
};

const AppButton = ({
  children,
  type = "default",
  variant,
  icon,
  iconPosition = "start",
  loading = false,
  disabled = false,
  size = "middle",
  danger = false,
  block = false,
  shape,
  onClick,
  width,
  minWidth,
  htmlType = "button",
  style,
  className = "",
  ...props
}) => {
  const resolveVariant = () => {
    if (danger || variant === "danger") return "danger";
    if (variant === "gold") return "gold";
    if (variant === "primary" || type === "primary") return "primary";
    if (variant === "secondary") return "secondary";
    if (variant === "ghost" || type === "text" || type === "link") {
      return "ghost";
    }

    return "default";
  };

  const currentVariant = resolveVariant();
  const theme = BUTTON_STYLES[currentVariant];
  const sizeConfig = SIZES[size] || SIZES.middle;
  const isCircle = shape === "circle";

  const buttonStyle = {
    "--fe-btn-bg": theme.bg,
    "--fe-btn-color": theme.color,
    "--fe-btn-border": theme.border,
    "--fe-btn-hover-bg": theme.hoverBg,
    "--fe-btn-hover-border": theme.hoverBorder,
    "--fe-btn-active-bg": theme.activeBg,
    "--fe-btn-shadow": theme.shadow,
    "--fe-btn-hover-shadow": theme.hoverShadow,
    "--fe-btn-active-shadow": theme.activeShadow,

    height: sizeConfig.height,
    width: isCircle ? sizeConfig.height : width,
    minWidth: isCircle ? sizeConfig.height : minWidth,
    padding: isCircle ? 0 : sizeConfig.padding,
    borderRadius: isCircle
      ? "50%"
      : shape === "round"
        ? 999
        : sizeConfig.radius,
    fontSize: sizeConfig.fontSize,

    ...style,
  };

  return (
    <>
      <Button
        {...props}
        type={type}
        htmlType={htmlType}
        icon={icon}
        iconPosition={iconPosition}
        loading={loading}
        disabled={disabled}
        block={block}
        danger={danger}
        shape={shape}
        size={
          size === "small" ? "small" : size === "large" ? "large" : "middle"
        }
        onClick={onClick}
        className={`fe-app-button fe-app-button--${currentVariant} ${className}`.trim()}
        style={buttonStyle}
      >
        {children}
      </Button>

      <style>{`
        .fe-app-button {
          position: relative !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;

          background: var(--fe-btn-bg) !important;
          color: var(--fe-btn-color) !important;
          border: 1px solid var(--fe-btn-border) !important;
          box-shadow: var(--fe-btn-shadow) !important;

          font-family:
            "Be Vietnam Pro",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif !important;
          font-weight: 600 !important;
          white-space: nowrap;
          transition:
            transform .16s ease,
            box-shadow .16s ease,
            background .16s ease,
            border-color .16s ease !important;
        }

        /* Giữ icon hiển thị rõ ràng */
        .fe-app-button .anticon {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex: 0 0 auto !important;

          width: 1em !important;
          height: 1em !important;
          font-size: 1.15em !important;
          line-height: 1 !important;

          color: inherit !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        .fe-app-button .anticon svg {
          display: block !important;
          width: 1em !important;
          height: 1em !important;
          overflow: visible !important;
          fill: currentColor;
        }

        .fe-app-button .anticon svg path {
          fill: currentColor;
        }

        .fe-app-button .ant-btn-icon {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          line-height: 1 !important;
        }

        .fe-app-button:hover:not(:disabled):not(.ant-btn-disabled) {
          background: var(--fe-btn-hover-bg) !important;
          border-color: var(--fe-btn-hover-border) !important;
          box-shadow: var(--fe-btn-hover-shadow) !important;
          transform: translateY(-2px);
        }

        .fe-app-button:active:not(:disabled):not(.ant-btn-disabled) {
          background: var(--fe-btn-active-bg) !important;
          box-shadow: var(--fe-btn-active-shadow) !important;
          transform: translateY(2px);
        }

        .fe-app-button:disabled,
        .fe-app-button.ant-btn-disabled {
          opacity: .6 !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        .fe-app-button.ant-btn-circle {
          padding: 0 !important;
        }

        .fe-app-button.ant-btn-round {
          border-radius: 999px !important;
        }

        .fe-app-button--ghost {
          box-shadow: none !important;
        }

        .fe-app-button--ghost:hover:not(:disabled):not(.ant-btn-disabled) {
          box-shadow: none !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .fe-app-button {
            transition: none !important;
          }
        }

        @media (max-width: 600px) {
          .fe-app-button.ant-btn-lg {
            min-height: 46px !important;
            padding-left: 18px !important;
            padding-right: 18px !important;
          }
        }
      `}</style>
    </>
  );
};

export default AppButton;
