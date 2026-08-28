import React from "react";
import { Alert, Button, Space, Typography, Tag } from "antd";
import {
  ArrowLeft,
  HelpCircle,
  Puzzle,
  Disc,
  Brain,
  Grid2x2,
  ArrowUpDown,
  Hand,
  CheckCheck,
  Gamepad2,
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

// Map Icon & cấu hình hiển thị cho Header Editor
const GAME_CONFIG = {
  quiz: { name: "Trắc nghiệm", icon: HelpCircle, color: "#6C4BFF" },
  matching: { name: "Ghép hình", icon: Puzzle, color: "#1677FF" },
  wheel: { name: "Vòng quay", icon: Disc, color: "#FF7A45" },
  memory: { name: "Tìm điểm khác", icon: Brain, color: "#13C2C2" },
  crossword: { name: "Ô chữ", icon: Grid2x2, color: "#722ED1" },
  sorting: { name: "Sắp xếp", icon: ArrowUpDown, color: "#52C41A" },
  drag_drop: { name: "Kéo thả", icon: Hand, color: "#FAAD14" },
  true_false: { name: "Đúng / Sai", icon: CheckCheck, color: "#F5222D" },
};

const GameBuilder = ({ type, teacherId, game, onBack, onSuccess }) => {
  const commonProps = {
    teacherId,
    game,
    onSuccess,
  };

  const currentConfig = GAME_CONFIG[type] || {
    name: "Trò chơi",
    icon: Gamepad2,
    color: "#6C4BFF",
  };
  const IconComponent = currentConfig.icon;

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
            message="Loại trò chơi không hợp lệ"
            description="Vui lòng quay lại và chọn một dạng trò chơi đúng trong danh sách."
            style={{ borderRadius: 12, padding: 16 }}
          />
        );
    }
  };

  return (
    <div style={{ padding: "4px 0" }}>
      {/* TOP NAVBAR / HEADER TOOLBAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          marginBottom: 20,
          background: "#f8fafc",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Info Dạng Game đang tạo/sửa */}
        <Space size={14} align="center">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${currentConfig.color} 0%, ${currentConfig.color}CC 100%)`,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 14px ${currentConfig.color}35`,
            }}
          >
            <IconComponent size={22} strokeWidth={2.2} />
          </div>

          <div>
            <Space size={8} align="center">
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {game ? "Cấu hình trò chơi" : "Tạo trò chơi mới"}
              </Title>
              <Tag
                color={`${currentConfig.color}15`}
                style={{
                  color: currentConfig.color,
                  border: `1px solid ${currentConfig.color}30`,
                  borderRadius: 8,
                  fontWeight: 600,
                  padding: "2px 10px",
                }}
              >
                {currentConfig.name}
              </Tag>
            </Space>
            <Text style={{ color: "#64748b", fontSize: 13, display: "block" }}>
              {game
                ? `Đang chỉnh sửa: ${game.name || "Không có tên"}`
                : "Thiết lập các câu hỏi và nội dung cho trò chơi"}
            </Text>
          </div>
        </Space>

        {/* Action switch back */}
        <Button
          type="default"
          icon={<ArrowLeft size={16} />}
          onClick={onBack}
          style={{
            borderRadius: 10,
            height: 38,
            fontWeight: 600,
            color: "#475569",
            borderColor: "#cbd5e1",
          }}
        >
          Đổi dạng game
        </Button>
      </div>

      {/* EDITOR CONTENT WRAPPER */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: 24,
          border: "1px solid #f1f5f9",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        }}
      >
        {renderEditor()}
      </div>
    </div>
  );
};

export default GameBuilder;
