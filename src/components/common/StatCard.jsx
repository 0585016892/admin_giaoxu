import React from "react";
import { Card, Col, Row, Skeleton, Typography } from "antd";

const { Text } = Typography;

const primaryNavy = "#1B365D";
// const accentGold = "#D4AF37";
const textDark = "#0F172A";
const textMuted = "#64748B";

const StatCard = ({
  title,
  value,
  suffix,
  description,
  icon,
  iconColor = primaryNavy,
  loading = false,
  trend, // Tùy chọn: { value: "+12.5%", isUp: true }
}) => {
  return (
    <Card
      bordered={false}
      style={{
        height: "100%",
        borderRadius: 20,
        background: "#FFFFFF",
        border: "1px solid #F1F5F9",
        boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.05)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
      }}
      styles={{
        body: {
          padding: "22px 24px",
        },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 20px 35px -12px rgba(27, 54, 93, 0.12)";
        e.currentTarget.style.borderColor = `${iconColor}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 10px 30px -10px rgba(15, 23, 42, 0.05)";
        e.currentTarget.style.borderColor = "#F1F5F9";
      }}
    >
      <Row justify="space-between" align="top" gutter={12}>
        <Col flex="auto">
          {/* TITLE */}
          <Text
            style={{
              display: "block",
              color: textMuted,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.2px",
              textTransform: "uppercase",
            }}
          >
            {title}
          </Text>

          {/* VALUE */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              marginTop: 10,
              minHeight: 36,
            }}
          >
            {loading ? (
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: 90,
                  height: 32,
                  borderRadius: 8,
                }}
              />
            ) : (
              <>
                <span
                  style={{
                    color: textDark,
                    fontSize: 32,
                    lineHeight: 1,
                    fontWeight: 800,
                    letterSpacing: "-1px",
                  }}
                >
                  {value}
                </span>

                {suffix && (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: textMuted,
                    }}
                  >
                    {suffix}
                  </Text>
                )}
              </>
            )}
          </div>

          {/* TREND & DESCRIPTION */}
          {(description || trend) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
              }}
            >
              {trend && !loading && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                    color: trend.isUp ? "#16A34A" : "#DC2626",
                    background: trend.isUp ? "#DCFCE7" : "#FEE2E2",
                  }}
                >
                  {trend.isUp ? "↑" : "↓"} {trend.value}
                </span>
              )}

              {description && (
                <Text
                  style={{
                    fontSize: 12,
                    color: textMuted,
                    fontWeight: 400,
                  }}
                >
                  {description}
                </Text>
              )}
            </div>
          )}
        </Col>

        {/* ICON */}
        {icon && (
          <Col>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${iconColor}1A 0%, ${iconColor}0D 100%)`,
                color: iconColor,
                fontSize: 22,
                flexShrink: 0,
                border: `1px solid ${iconColor}20`,
                boxShadow: `0 8px 16px -4px ${iconColor}1F`,
              }}
            >
              {icon}
            </div>
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default StatCard;
