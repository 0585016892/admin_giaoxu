import React, { memo } from "react";
import { Flex, Tag, Typography } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Text } = Typography;

const formatTime = (time) => {
  if (!time) return "";

  return String(time).slice(0, 5);
};

const ScheduleItem = memo(function ScheduleItem({ schedule }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 14,
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
      }}
    >
      {/* TIME */}
      <Flex align="center" gap={7} style={{ marginBottom: 7 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "#E8F0F7",
            color: "#173B5E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ClockCircleOutlined />
        </div>

        <Text
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#173B5E",
          }}
        >
          {formatTime(schedule.start_time)}
          {" - "}
          {formatTime(schedule.end_time)}
        </Text>
      </Flex>

      {/* CLASS */}
      <Text
        ellipsis={{
          tooltip: schedule.class_name,
        }}
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 700,
          color: "#1F2937",
          marginBottom: 5,
        }}
      >
        {schedule.class_name || "Lớp chưa đặt tên"}
      </Text>

      {/* CODE */}
      {schedule.class_code && (
        <Tag
          style={{
            margin: 0,
            border: "none",
            borderRadius: 6,
            background: "#EEF2FF",
            color: "#4338CA",
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {schedule.class_code}
        </Tag>
      )}

      {/* ROOM */}
      {schedule.room && (
        <Flex
          align="center"
          gap={5}
          style={{
            marginTop: 7,
          }}
        >
          <EnvironmentOutlined
            style={{
              color: "#94A3B8",
              fontSize: 11,
            }}
          />

          <Text
            ellipsis={{
              tooltip: schedule.room,
            }}
            style={{
              fontSize: 11,
              color: "#64748B",
            }}
          >
            {schedule.room}
          </Text>
        </Flex>
      )}
    </div>
  );
});

export default ScheduleItem;
