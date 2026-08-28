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
} from "lucide-react";

const { Title, Text } = Typography;

// Map icon Lucide tương ứng với từng loại game
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

const GameTypeSelector = ({ types = [], value, onChange }) => {
  return (
    <div style={{ padding: "8px 4px" }}>
      {/* HEADER SECTION */}
      <div style={{ marginBottom: 28, textAlign: "left" }}>
        <Title
          level={3}
          style={{
            marginBottom: 6,
            fontSize: 22,
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          Chọn dạng trò chơi
        </Title>
        <Text style={{ color: "#64748b", fontSize: 14 }}>
          Mỗi dạng trò chơi có cách tương tác và cấu hình câu hỏi riêng biệt
        </Text>
      </div>

      {/* GAME TYPES GRID */}
      <Row gutter={[20, 20]}>
        {types.map((type) => {
          const isSelected = value === type.key;
          const themeColor = type.color || "#6C4BFF";

          // Lấy Icon component từ MAP
          const IconComponent = ICON_MAP[type.key] || Gamepad2;

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={type.key}>
              <div
                onClick={() => onChange(type.key)}
                style={{
                  position: "relative",
                  height: "100%",
                  borderRadius: 20,
                  padding: 20,
                  background: isSelected ? "#F4F0FF" : "#ffffff",
                  border: isSelected
                    ? `2px solid ${themeColor}`
                    : "1px solid #e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isSelected
                    ? `0 10px 25px -5px ${themeColor}33`
                    : "0 2px 8px rgba(0, 0, 0, 0.04)",
                  transform: isSelected ? "translateY(-4px)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = themeColor;
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(0,0,0,0.06)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0, 0, 0, 0.04)";
                  }
                }}
              >
                {/* ACTIVE CHECK BADGE */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: themeColor,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </div>
                )}

                <div>
                  {/* BEAUTIFUL ICON CONTAINER WITH GRADIENT BACKGROUND */}
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 18,
                      background: isSelected
                        ? `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}CC 100%)`
                        : `${themeColor}15`,
                      color: isSelected ? "#ffffff" : themeColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                      boxShadow: isSelected
                        ? `0 8px 16px ${themeColor}40`
                        : "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <IconComponent size={30} strokeWidth={2.2} />
                  </div>

                  {/* TITLE */}
                  <div style={{ marginBottom: 8 }}>
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {type.name}
                    </Title>
                  </div>

                  {/* DESCRIPTION */}
                  <Text
                    style={{
                      color: "#64748b",
                      fontSize: 13,
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {type.description}
                  </Text>
                </div>

                {/* FOOTER INDICATOR */}
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: "1px dashed #e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isSelected ? themeColor : "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {isSelected ? "Đang chọn" : "Nhấn để chọn →"}
                  </Text>
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
