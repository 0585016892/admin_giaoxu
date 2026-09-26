import React, { memo } from "react";
import { Card, Row, Col, Flex, Avatar, Typography } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const chibiCardStyle = {
  borderRadius: 24,
  border: "1px solid #F3F4F6",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
  background: "#FFFFFF",
  overflow: "hidden",
};

const AttendanceOverview = memo(function AttendanceOverview({ attendance }) {
  const data = {
    present: Number(attendance?.present ?? 0),
    absent: Number(attendance?.absent ?? 0),
    late: Number(attendance?.late ?? 0),
  };

  const items = [
    {
      key: "present",
      label: "Có mặt",
      value: data.present,
      icon: <CheckCircleOutlined />,
      color: "#15803D",
      iconColor: "#16A34A",
      background: "#F0FDF4",
      border: "#BBF7D0",
    },
    {
      key: "absent",
      label: "Vắng mặt",
      value: data.absent,
      icon: <CloseCircleOutlined />,
      color: "#B91C1C",
      iconColor: "#DC2626",
      background: "#FEF2F2",
      border: "#FECDD3",
    },
    {
      key: "late",
      label: "Đi muộn",
      value: data.late,
      icon: <ClockCircleOutlined />,
      color: "#B45309",
      iconColor: "#D97706",
      background: "#FFFBEB",
      border: "#FDE68A",
    },
  ];

  return (
    <Card
      bordered={false}
      style={chibiCardStyle}
      styles={{
        body: {
          padding: 18,
        },
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={8}>
          <Flex align="center" gap={12}>
            <Avatar
              size={48}
              style={{
                background: "#E0F2FE",
                color: "#0284C7",
                fontSize: 20,
              }}
            >
              ✓
            </Avatar>

            <div>
              <Text
                style={{
                  display: "block",
                  color: "#1F2937",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Điểm danh hôm nay
              </Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                Tình hình tham dự của học sinh toàn bộ các lớp
              </Text>
            </div>
          </Flex>
        </Col>

        <Col xs={24} md={16}>
          <Row gutter={[12, 12]}>
            {items.map((item) => (
              <Col xs={8} key={item.key}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: item.background,
                    border: `1px solid ${item.border}`,
                  }}
                >
                  <Flex align="center" gap={8}>
                    <span
                      style={{
                        color: item.iconColor,
                        fontSize: 16,
                      }}
                    >
                      {item.icon}
                    </span>

                    <div>
                      <Text
                        style={{
                          fontSize: 11,
                          color: item.color,
                          display: "block",
                        }}
                      >
                        {item.label}
                      </Text>

                      <Title
                        level={4}
                        style={{
                          margin: 0,
                          color: item.color,
                        }}
                      >
                        {item.value}
                      </Title>
                    </div>
                  </Flex>
                </div>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Card>
  );
});

export default AttendanceOverview;
