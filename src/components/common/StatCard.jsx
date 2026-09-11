import React from "react";
import { Card, Col, Row, Skeleton, Typography } from "antd";

const { Text } = Typography;

const StatCard = ({
  title,
  value,
  suffix,
  description,
  icon,
  iconColor = "#D9A441", // Tông Gold mặc định sang trọng
  loading = false,
  trend, // { value: "+12.5%", isUp: true }
  className = "",
  style,
  ...props
}) => {
  return (
    <Card
      bordered={false}
      className={`stat-card-navy-gold ${className}`}
      style={{
        height: "100%",
        borderRadius: 20,
        background: "#FFFFFF",
        border: "1.5px solid #D9E2EC",
        boxShadow: "0 10px 30px -5px rgba(23, 59, 94, 0.06)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        position: "relative",
        ...style,
      }}
      styles={{
        body: {
          padding: "20px 24px",
        },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 16px 36px -6px rgba(23, 59, 94, 0.12)";
        e.currentTarget.style.borderColor = "#173B5E";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 10px 30px -5px rgba(23, 59, 94, 0.06)";
        e.currentTarget.style.borderColor = "#D9E2EC";
      }}
      {...props}
    >
      <Row justify="space-between" align="top" gutter={12}>
        <Col flex="auto">
          {/* TITLE */}
          <Text
            style={{
              display: "block",
              color: "#64748B",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
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
              marginTop: 6,
              minHeight: 38,
            }}
          >
            {loading ? (
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: 100,
                  height: 34,
                  borderRadius: 8,
                }}
              />
            ) : (
              <>
                <span
                  style={{
                    color: "#173B5E",
                    fontSize: 30,
                    lineHeight: 1,
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    fontFamily:
                      "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
                  }}
                >
                  {value}
                </span>

                {suffix && (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#64748B",
                      fontFamily: "'Be Vietnam Pro', sans-serif",
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
                marginTop: 10,
              }}
            >
              {trend && !loading && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 8,
                    color: trend.isUp ? "#0284C7" : "#DC2626",
                    background: trend.isUp ? "#E0F2FE" : "#FEF2F2",
                    border: trend.isUp
                      ? "1px solid #BAE6FD"
                      : "1px solid #FECACA",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {trend.isUp ? "↑" : "↓"} {trend.value}
                </span>
              )}

              {description && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#64748B",
                    fontWeight: 500,
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                  }}
                >
                  {description}
                </Text>
              )}
            </div>
          )}
        </Col>

        {/* ICON BOX */}
        {icon && (
          <Col>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#F7F9FC",
                color: iconColor,
                fontSize: 22,
                flexShrink: 0,
                border: `1.5px solid ${iconColor}40`,
                boxShadow: `0 6px 16px ${iconColor}15`,
              }}
            >
              {icon}
            </div>
          </Col>
        )}
      </Row>

      {/* DECORATION CORNER ACCENT */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 14,
          fontSize: 12,
          color: "#D9A441",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      >
        ✦
      </div>
    </Card>
  );
};

export default StatCard;
