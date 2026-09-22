import React from "react";
import { Button } from "antd";

/**
 * Modern Navy & Gold Design Tokens
 */
const BUTTON_STYLES = {
  primary: {
    bg: "linear-gradient(180deg, #244F78 0%, #173B5E 100%)",
    color: "#FFFFFF",
    border: "#173B5E",

    hoverBg: "linear-gradient(180deg, #2D5D8C 0%, #1B446A 100%)",
    hoverBorder: "#173B5E",

    activeBg: "linear-gradient(180deg, #173B5E 0%, #102E4A 100%)",

    shadow: "0 5px 0 #0E2D47, 0 7px 14px rgba(23, 59, 94, 0.20)",

    hoverShadow: "0 6px 0 #0E2D47, 0 9px 18px rgba(23, 59, 94, 0.24)",

    activeShadow: "0 2px 0 #0E2D47, 0 4px 8px rgba(23, 59, 94, 0.18)",
  },

  gold: {
    bg: "linear-gradient(180deg, #E2B254 0%, #D9A441 100%)",
    color: "#FFFFFF",
    border: "#C99531",

    hoverBg: "linear-gradient(180deg, #E8BB65 0%, #D9A441 100%)",
    hoverBorder: "#C99531",

    activeBg: "linear-gradient(180deg, #D9A441 0%, #B98222 100%)",

    shadow: "0 5px 0 #A8751D, 0 7px 14px rgba(217, 164, 65, 0.22)",

    hoverShadow: "0 6px 0 #A8751D, 0 9px 18px rgba(217, 164, 65, 0.28)",

    activeShadow: "0 2px 0 #A8751D, 0 4px 8px rgba(217, 164, 65, 0.18)",
  },

  secondary: {
    bg: "#EEF2F7",
    color: "#173B5E",
    border: "#E2E8F0",

    hoverBg: "#E5EBF2",
    hoverBorder: "#D5DEE9",

    activeBg: "#DCE4ED",

    shadow: "0 4px 0 #D2DAE4, 0 5px 10px rgba(23, 59, 94, 0.08)",

    hoverShadow: "0 5px 0 #D2DAE4, 0 7px 14px rgba(23, 59, 94, 0.10)",

    activeShadow: "0 2px 0 #D2DAE4, 0 3px 7px rgba(23, 59, 94, 0.06)",
  },

  danger: {
    bg: "linear-gradient(180deg, #FEF2F2 0%, #FEE2E2 100%)",
    color: "#DC2626",
    border: "#FECACA",

    hoverBg: "linear-gradient(180deg, #FEE2E2 0%, #FECACA 100%)",
    hoverBorder: "#F87171",

    activeBg: "#FCA5A5",

    shadow: "0 4px 0 #FCA5A5, 0 5px 10px rgba(220, 38, 38, 0.10)",

    hoverShadow: "0 5px 0 #FCA5A5, 0 7px 14px rgba(220, 38, 38, 0.14)",

    activeShadow: "0 2px 0 #FCA5A5, 0 3px 7px rgba(220, 38, 38, 0.08)",
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

    shadow: "0 4px 0 #E0E6ED, 0 5px 10px rgba(23, 59, 94, 0.06)",

    hoverShadow: "0 5px 0 #D8E0E8, 0 7px 14px rgba(23, 59, 94, 0.08)",

    activeShadow: "0 2px 0 #D8E0E8, 0 3px 7px rgba(23, 59, 94, 0.05)",
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
  /* ============================================================
     RESOLVE VARIANT
  ============================================================ */

  const resolveVariant = () => {
    if (danger || variant === "danger") {
      return "danger";
    }

    if (variant === "gold") {
      return "gold";
    }

    if (type === "primary" || variant === "primary") {
      return "primary";
    }

    if (variant === "secondary") {
      return "secondary";
    }

    if (variant === "ghost" || type === "text") {
      return "ghost";
    }

    return "default";
  };

  const currentVariant = resolveVariant();

  const theme = BUTTON_STYLES[currentVariant];

  const sizeConfig = SIZES[size] || SIZES.middle;

  const isCircle = shape === "circle";

  /* ============================================================
     DYNAMIC VARIABLES
  ============================================================ */

  const dynamicVars = {
    "--btn-bg": theme.bg,
    "--btn-color": theme.color,
    "--btn-border": theme.border,

    "--btn-hover-bg": theme.hoverBg,

    "--btn-hover-border": theme.hoverBorder,

    "--btn-active-bg": theme.activeBg,

    "--btn-shadow": theme.shadow,

    "--btn-hover-shadow": theme.hoverShadow,

    "--btn-active-shadow": theme.activeShadow,

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

        /* =====================================================
           BASE
        ===================================================== */

        .app-btn-navy-gold {
          position: relative !important;

          background:
            var(--btn-bg) !important;

          color:
            var(--btn-color) !important;

          border:
            1px solid var(--btn-border) !important;

          border-radius:
            var(--btn-radius) !important;

          box-shadow:
            var(--btn-shadow) !important;

          font-family:
            'Be Vietnam Pro',
            -apple-system,
            BlinkMacSystemFont,
            sans-serif !important;

          font-weight:
            600 !important;

          display:
            inline-flex !important;

          align-items:
            center !important;

          justify-content:
            center !important;

          gap:
            8px !important;

          white-space:
            nowrap !important;

          transition:
            transform .16s ease,
            box-shadow .16s ease,
            background .16s ease,
            border-color .16s ease !important;

          /*
           * Quan trọng:
           * không để Ant Design tự thêm
           * hiệu ứng khác.
           */
          outline:
            none !important;
        }


        /* =====================================================
           ICON
        ===================================================== */

        .app-btn-navy-gold
        .anticon {
          display:
            inline-flex !important;

          align-items:
            center !important;

          justify-content:
            center !important;

          font-size:
            1.15em !important;

          line-height:
            1 !important;
        }


        /* =====================================================
           HOVER
        ===================================================== */

        .app-btn-navy-gold:hover:not(:disabled) {

          background:
            var(--btn-hover-bg) !important;

          border-color:
            var(--btn-hover-border) !important;

          box-shadow:
            var(--btn-hover-shadow) !important;

          transform:
            translateY(-2px) !important;
        }


        /* =====================================================
           ACTIVE
        ===================================================== */

        .app-btn-navy-gold:active:not(:disabled) {

          background:
            var(--btn-active-bg) !important;

          box-shadow:
            var(--btn-active-shadow) !important;

          transform:
            translateY(3px) !important;
        }


        /* =====================================================
           DISABLED
        ===================================================== */

        .app-btn-navy-gold:disabled {

          opacity:
            .6 !important;

          cursor:
            not-allowed !important;

          transform:
            none !important;

          box-shadow:
            none !important;
        }


        /* =====================================================
           LARGE BUTTON
           Giống nút "Tạo mới" trong ảnh
        ===================================================== */

        .app-btn-navy-gold.ant-btn-lg {

          min-height:
            48px !important;

          padding-left:
            21px !important;

          padding-right:
            21px !important;

          border-radius:
            20px !important;
        }


        /* =====================================================
           ROUND
        ===================================================== */

        .app-btn-navy-gold.ant-btn-round {

          border-radius:
            999px !important;
        }


        /* =====================================================
           CIRCLE
        ===================================================== */

        .app-btn-navy-gold.ant-btn-circle {

          padding:
            0 !important;
        }


        /* =====================================================
           LOADING
        ===================================================== */

        .app-btn-navy-gold.ant-btn-loading {

          pointer-events:
            none !important;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

          .app-btn-navy-gold.ant-btn-lg {

            min-height:
              46px !important;

            border-radius:
              17px !important;

            padding-left:
              18px !important;

            padding-right:
              18px !important;
          }
        }

      `}</style>
    </>
  );
};

export default AppButton;
