import React from "react";
import { Col, Row, Typography } from "antd";
import {
  Check,
  HelpCircle,
  Puzzle,
  Disc,
  Brain,
  Grid2x2,
  ArrowUpDown,
  Hand,
  CheckCheck,
  Gamepad2,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const { Title, Text } = Typography;

/* =========================================================
   COLORS
========================================================= */

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

/* =========================================================
   ICON MAP
========================================================= */

const ICON_MAP = {
  quiz: HelpCircle,
  matching: Puzzle,
  wheel: Disc,
  memory: Brain,
  crossword: Grid2x2,
  sorting: ArrowUpDown,
  drag_drop: Hand,
  true_false: CheckCheck,
};

/* =========================================================
   GAME TYPE SELECTOR
========================================================= */

const GameTypeSelector = ({ types = [], value, onChange }) => {
  return (
    <div
      style={{
        padding: "12px 8px 20px",
        background: COLORS.white,
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        {/* BADGE */}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,

            background: COLORS.goldLight,

            padding: "6px 14px",

            borderRadius: 999,

            border: `1px solid rgba(217,164,65,0.45)`,

            marginBottom: 12,
          }}
        >
          <Sparkles size={16} strokeWidth={2.2} color={COLORS.gold} />

          <Text
            style={{
              fontWeight: 800,
              color: COLORS.warning,
              fontSize: 12,
              letterSpacing: 0.2,
            }}
          >
            TẠO TRÒ CHƠI GIÁO LÝ
          </Text>
        </div>

        {/* TITLE */}

        <Title
          level={3}
          style={{
            margin: "4px 0 7px",

            fontSize: 24,

            fontWeight: 800,

            color: COLORS.navy,

            letterSpacing: "-0.4px",
          }}
        >
          Chọn dạng trò chơi
        </Title>

        {/* DESCRIPTION */}

        <Text
          style={{
            color: COLORS.textSecondary,

            fontSize: 13,

            fontWeight: 500,

            lineHeight: 1.6,
          }}
        >
          Lựa chọn một dạng mini-game để bắt đầu xây dựng hoạt động giáo lý.
        </Text>
      </div>

      {/* =====================================================
          GAME TYPES
      ===================================================== */}

      <Row gutter={[16, 16]}>
        {types.map((type) => {
          const isSelected = value === type.key;

          /*
           * Chỉ lấy màu từ palette chính.
           * Không sử dụng màu custom cũ của từng game.
           */
          const isSuccessType = type.key === "memory" || type.key === "sorting";

          const isWarningType =
            type.key === "wheel" || type.key === "drag_drop";

          const themeColor = isSelected
            ? COLORS.navy
            : isSuccessType
              ? COLORS.success
              : isWarningType
                ? COLORS.warning
                : COLORS.navy;

          const bgColor = isSelected
            ? COLORS.navy
            : isSuccessType
              ? COLORS.successBg
              : isWarningType
                ? COLORS.warningBg
                : COLORS.navyLight;

          const borderColor = isSelected
            ? COLORS.navy
            : isSuccessType
              ? "#C7E6D7"
              : isWarningType
                ? "#F3D8A1"
                : COLORS.border;

          const IconComponent = ICON_MAP[type.key] || Gamepad2;

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={type.key}>
              <div
                onClick={() => onChange(type.key)}
                style={{
                  position: "relative",

                  height: "100%",

                  minHeight: 225,

                  borderRadius: 18,

                  padding: 20,

                  background: isSelected ? COLORS.navyLight : COLORS.white,

                  border: `1px solid ${borderColor}`,

                  cursor: "pointer",

                  transition: "all 0.25s ease",

                  boxShadow: isSelected
                    ? "0 10px 26px rgba(23,59,94,0.14)"
                    : "0 5px 16px rgba(23,59,94,0.04)",

                  transform: isSelected ? "translateY(-3px)" : "translateY(0)",

                  display: "flex",

                  flexDirection: "column",

                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = COLORS.gold;

                    e.currentTarget.style.transform = "translateY(-3px)";

                    e.currentTarget.style.boxShadow =
                      "0 10px 24px rgba(23,59,94,0.09)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = borderColor;

                    e.currentTarget.style.transform = "translateY(0)";

                    e.currentTarget.style.boxShadow =
                      "0 5px 16px rgba(23,59,94,0.04)";
                  }
                }}
              >
                {/* =================================================
                    SELECTED CHECK
                ================================================= */}

                {isSelected && (
                  <div
                    style={{
                      position: "absolute",

                      top: 13,
                      right: 13,

                      width: 28,
                      height: 28,

                      borderRadius: "50%",

                      background: COLORS.gold,

                      color: COLORS.white,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      boxShadow: "0 4px 12px rgba(217,164,65,0.30)",
                    }}
                  >
                    <Check size={15} strokeWidth={3} />
                  </div>
                )}

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div>
                  {/* ICON */}

                  <div
                    style={{
                      width: 58,
                      height: 58,

                      borderRadius: 15,

                      background: isSelected ? COLORS.navy : bgColor,

                      color: isSelected ? COLORS.white : themeColor,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      marginBottom: 16,

                      border: `1px solid ${
                        isSelected ? COLORS.navy : borderColor
                      }`,

                      boxShadow: isSelected
                        ? "0 7px 16px rgba(23,59,94,0.18)"
                        : "none",

                      transition: "all 0.25s ease",
                    }}
                  >
                    <IconComponent size={29} strokeWidth={2} />
                  </div>

                  {/* TITLE */}

                  <Title
                    level={4}
                    style={{
                      margin: 0,

                      marginBottom: 7,

                      fontSize: 16,

                      fontWeight: 800,

                      color: COLORS.navy,

                      lineHeight: 1.3,
                    }}
                  >
                    {type.name}
                  </Title>

                  {/* DESCRIPTION */}

                  <Text
                    style={{
                      color: COLORS.textSecondary,

                      fontSize: 12.5,

                      lineHeight: 1.55,

                      fontWeight: 500,

                      display: "-webkit-box",

                      WebkitLineClamp: 2,

                      WebkitBoxOrient: "vertical",

                      overflow: "hidden",
                    }}
                  >
                    {type.description}
                  </Text>
                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                  style={{
                    marginTop: 17,

                    paddingTop: 11,

                    borderTop: `1px solid ${
                      isSelected ? "rgba(217,164,65,0.35)" : COLORS.border
                    }`,

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,

                      fontWeight: 700,

                      color: isSelected ? COLORS.navy : COLORS.muted,
                    }}
                  >
                    {isSelected ? "Đã chọn" : "Chọn trò chơi"}
                  </Text>

                  <ChevronRight
                    size={15}
                    color={isSelected ? COLORS.gold : COLORS.muted}
                    strokeWidth={2.3}
                  />
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default GameTypeSelector;
