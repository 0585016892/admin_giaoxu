import React from "react";
import { Alert, Button, Space, Typography, Tag } from "antd";
import {
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Puzzle,
  Disc,
  Brain,
  Grid2x2,
  ArrowUpDown,
  Hand,
  CheckCheck,
  Gamepad2,
  AlertCircle,
} from "lucide-react";

import QuizGameEditor from "./quiz/QuizGameEditor";
import MatchingGameEditor from "./matching/MatchingGameEditor";
import WheelGameEditor from "./wheel/WheelGameEditor";
import MemoryGameEditor from "./memory/MemoryGameEditor";
import CrosswordGameEditor from "./crossword/CrosswordGameEditor";
import SortingGameEditor from "./sorting/SortingGameEditor";
import DragDropGameEditor from "./dragDrop/DragDropGameEditor";
import TrueFalseGameEditor from "./trueFalse/TrueFalseGameEditor";

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

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

/* =========================================================
   GAME CONFIG
========================================================= */
const GAME_CONFIG = {
  quiz: {
    name: "Trắc nghiệm",
    icon: HelpCircle,
    color: COLORS.navy,
    bgColor: COLORS.navyLight,
    borderColor: COLORS.border,
  },

  matching: {
    name: "Ghép hình",
    icon: Puzzle,
    color: COLORS.navy,
    bgColor: COLORS.navyLight,
    borderColor: COLORS.border,
  },

  wheel: {
    name: "Vòng quay",
    icon: Disc,
    color: COLORS.warning,
    bgColor: COLORS.warningBg,
    borderColor: "#F3D9A3",
  },

  memory: {
    name: "Tìm điểm khác",
    icon: Brain,
    color: COLORS.success,
    bgColor: COLORS.successBg,
    borderColor: "#C8E6D7",
  },

  crossword: {
    name: "Ô chữ",
    icon: Grid2x2,
    color: COLORS.navy,
    bgColor: COLORS.navyLight,
    borderColor: COLORS.border,
  },

  sorting: {
    name: "Sắp xếp",
    icon: ArrowUpDown,
    color: COLORS.success,
    bgColor: COLORS.successBg,
    borderColor: "#C8E6D7",
  },

  drag_drop: {
    name: "Kéo thả",
    icon: Hand,
    color: COLORS.warning,
    bgColor: COLORS.warningBg,
    borderColor: "#F3D9A3",
  },

  true_false: {
    name: "Đúng / Sai",
    icon: CheckCheck,
    color: COLORS.navy,
    bgColor: COLORS.navyLight,
    borderColor: COLORS.border,
  },
};

/* =========================================================
   COMPONENT
========================================================= */
const GameBuilder = ({ type, teacherId, game, onBack, onSuccess }) => {
  const commonProps = {
    teacherId,
    game,
    onSuccess,
  };

  const currentConfig = GAME_CONFIG[type] || {
    name: "Trò chơi",
    icon: Gamepad2,
    color: COLORS.navy,
    bgColor: COLORS.navyLight,
    borderColor: COLORS.border,
  };

  const CurrentIcon = currentConfig.icon;

  /* =========================================================
     RENDER EDITOR
  ========================================================= */
  const renderEditor = () => {
    switch (type) {
      case "quiz":
        return <QuizGameEditor {...commonProps} />;

      case "matching":
        return <MatchingGameEditor {...commonProps} />;

      case "wheel":
        return <WheelGameEditor {...commonProps} />;

      case "memory":
        return <MemoryGameEditor {...commonProps} />;

      case "crossword":
        return <CrosswordGameEditor {...commonProps} />;

      case "sorting":
        return <SortingGameEditor {...commonProps} />;

      case "drag_drop":
        return <DragDropGameEditor {...commonProps} />;

      case "true_false":
        return <TrueFalseGameEditor {...commonProps} />;

      default:
        return (
          <Alert
            type="error"
            showIcon
            icon={<AlertCircle size={20} />}
            message={
              <span
                style={{
                  fontWeight: 700,
                  color: COLORS.danger,
                }}
              >
                Không tìm thấy dạng trò chơi
              </span>
            }
            description="Vui lòng quay lại và chọn một dạng trò chơi hợp lệ."
            style={{
              borderRadius: 14,
              padding: 18,
              background: COLORS.dangerBg,
              border: `1px solid #F5C6C2`,
            }}
          />
        );
    }
  };

  return (
    <div
      style={{
        padding: "8px 0",
        background: COLORS.background,
        minHeight: "100%",
        fontFamily:
          "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 22px",
          marginBottom: 18,
          background: COLORS.white,
          borderRadius: 16,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 2px 8px rgba(23, 59, 94, 0.04)",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        {/* LEFT INFO */}
        <Space
          size={14}
          align="center"
          style={{
            minWidth: 0,
          }}
        >
          {/* GAME ICON */}
          <div
            style={{
              width: 52,
              height: 52,
              minWidth: 52,
              borderRadius: 13,
              background: currentConfig.bgColor,
              border: `1px solid ${currentConfig.borderColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: currentConfig.color,
            }}
          >
            <CurrentIcon size={25} strokeWidth={2} />
          </div>

          {/* TITLE */}
          <div
            style={{
              minWidth: 0,
            }}
          >
            <Space size={9} align="center" wrap>
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: 1.4,
                  fontWeight: 750,
                  color: COLORS.text,
                }}
              >
                {game ? "Cấu hình trò chơi" : "Tạo trò chơi mới"}
              </Title>

              <Tag
                icon={<CurrentIcon size={12} strokeWidth={2.2} />}
                style={{
                  margin: 0,
                  color: currentConfig.color,
                  background: currentConfig.bgColor,
                  border: `1px solid ${currentConfig.borderColor}`,
                  borderRadius: 6,
                  fontWeight: 700,
                  padding: "2px 9px",
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {currentConfig.name}
              </Tag>
            </Space>

            <Text
              style={{
                color: COLORS.textSecondary,
                fontSize: 12.5,
                fontWeight: 500,
                display: "block",
                marginTop: 3,
              }}
            >
              {game ? (
                <>
                  Đang chỉnh sửa:{" "}
                  <b
                    style={{
                      color: COLORS.navy,
                      fontWeight: 700,
                    }}
                  >
                    {game.name || "Chưa đặt tên"}
                  </b>
                </>
              ) : (
                "Thiết lập nội dung và câu hỏi cho trò chơi."
              )}
            </Text>
          </div>
        </Space>

        {/* BACK BUTTON */}
        <Button
          type="default"
          icon={<ArrowLeft size={16} />}
          onClick={onBack}
          style={{
            height: 40,
            borderRadius: 9,
            fontWeight: 650,
            color: COLORS.navy,
            background: COLORS.white,
            borderColor: COLORS.border,
            padding: "0 16px",
            boxShadow: "none",
            display: "inline-flex",
            alignItems: "center",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.navyLight;
            e.currentTarget.style.borderColor = COLORS.navy;
            e.currentTarget.style.color = COLORS.navy;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = COLORS.white;
            e.currentTarget.style.borderColor = COLORS.border;
            e.currentTarget.style.color = COLORS.navy;
          }}
        >
          Đổi dạng game
        </Button>
      </div>

      {/* =====================================================
          EDITOR CONTENT
      ===================================================== */}
      <div
        style={{
          background: COLORS.white,
          borderRadius: 16,
          padding: "24px",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 2px 10px rgba(23, 59, 94, 0.035)",
        }}
      >
        {/* EDITOR HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingBottom: 16,
            marginBottom: 20,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: COLORS.goldLight,
              color: COLORS.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={17} strokeWidth={2} />
          </div>

          <div>
            <div
              style={{
                color: COLORS.text,
                fontSize: 14,
                fontWeight: 750,
                lineHeight: 1.4,
              }}
            >
              Nội dung trò chơi
            </div>

            <div
              style={{
                color: COLORS.muted,
                fontSize: 12,
                marginTop: 1,
              }}
            >
              Cấu hình các thông tin cần thiết cho game
            </div>
          </div>
        </div>

        {renderEditor()}
      </div>
    </div>
  );
};

export default GameBuilder;
