import React, { memo } from "react";
import { Card, Flex, Typography } from "antd";

const { Text } = Typography;

const DashboardStatCard = memo(function DashboardStatCard({
  title,
  value,
  subText,
  icon,
  tag,
  bgGradient,
}) {
  return (
    <Card
      bordered={false}
      style={{
        height: "100%",
        minHeight: 118,
        borderRadius: 16,
        border: "1px solid #E7ECF2",
        background:
          bgGradient || "linear-gradient(135deg, #FFFFFF 0%, #F9FBFD 100%)",
        boxShadow: "0 3px 14px rgba(23, 59, 94, 0.04)",
        overflow: "hidden",
      }}
      styles={{
        body: {
          padding: 14,
          height: "100%",
          boxSizing: "border-box",
        },
      }}
    >
      <Flex
        align="center"
        gap={12}
        style={{
          height: "100%",
          minWidth: 0,
        }}
      >
        {/* ICON */}

        <div
          style={{
            width: 46,
            height: 46,
            minWidth: 46,
            borderRadius: 13,
            background: "#F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #E8EDF2",
          }}
        >
          {icon && (
            <img
              src={icon}
              alt=""
              aria-hidden="true"
              style={{
                width: 38,
                height: 38,
                objectFit: "contain",
                display: "block",
              }}
            />
          )}
        </div>

        {/* CONTENT */}

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* TITLE */}

          <Flex
            align="center"
            justify="space-between"
            gap={6}
            style={{
              minWidth: 0,
              marginBottom: 3,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#64748B",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Text>

            {tag && (
              <div
                style={{
                  flexShrink: 0,
                }}
              >
                {tag}
              </div>
            )}
          </Flex>

          {/* VALUE */}

          <div
            style={{
              fontSize: 23,
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#173B5E",
              letterSpacing: "-0.5px",
            }}
          >
            {value}
          </div>

          {/* SUB TEXT */}

          {subText && (
            <Text
              style={{
                display: "block",
                marginTop: 3,
                fontSize: 10,
                fontWeight: 500,
                color: "#94A3B8",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subText}
            </Text>
          )}
        </div>
      </Flex>
    </Card>
  );
});

export default DashboardStatCard;
