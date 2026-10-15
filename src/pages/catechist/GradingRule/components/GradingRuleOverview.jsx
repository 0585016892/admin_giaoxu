import React, { useMemo } from "react";
import { Card, Col, Row, Tag } from "antd";

import {
  CalculatorOutlined,
  CheckCircleOutlined,
  NumberOutlined,
  PercentageOutlined,
} from "@ant-design/icons";

import {
  getCalculationLabel,
  getTotalWeight,
  formatWeight,
} from "../../../../utils/gradingRuleUtils";

const GradingRuleOverview = ({ rule, itemCount = 0, loading = false }) => {
  const totalWeight = useMemo(
    () => getTotalWeight(rule?.items || []),
    [rule?.items],
  );

  const calculationLabel = getCalculationLabel(rule?.calculation_type);

  const isActive = rule?.status === "active";

  const statistics = [
    {
      title: "Thành phần điểm",
      value: itemCount,
      icon: <NumberOutlined />,
      color: "#173B5E",
    },
    {
      title: "Tổng trọng số",
      value: formatWeight(totalWeight),
      icon: <PercentageOutlined />,
      color: "#B7791F",
    },
    {
      title: "Điểm đạt",
      value: rule?.pass_score ?? 5,
      icon: <CheckCircleOutlined />,
      color: "#2E7D5B",
    },
    {
      title: "Phương pháp tính",
      value: calculationLabel || "—",
      icon: <CalculatorOutlined />,
      color: "#7C3AED",
      status: (
        <Tag
          color={isActive ? "success" : "default"}
          style={{
            margin: 0,
            fontSize: 10,
            lineHeight: "18px",
            padding: "0 5px",
          }}
        >
          {isActive ? "Đang áp dụng" : "Tạm ngưng"}
        </Tag>
      ),
    },
  ];

  return (
    <section className="grading-rule-overview">
      <Card
        size="small"
        style={{
          marginBottom: 20,
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 8px rgba(16, 42, 67, 0.04)",
        }}
        styles={{
          body: {
            padding: "12px 16px",
          },
        }}
      >
        <Row align="middle" gutter={[20, 12]}>
          {statistics.map((item) => (
            <Col
              key={item.title}
              xs={12}
              sm={12}
              lg={6}
              style={{ minWidth: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  minWidth: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 15,
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>

                <span
                  style={{
                    fontSize: 12,
                    color: "#64748B",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.title}
                </span>

                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  {loading ? "..." : item.value}
                </span>

                {!loading && item.status}
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </section>
  );
};

export default GradingRuleOverview;
