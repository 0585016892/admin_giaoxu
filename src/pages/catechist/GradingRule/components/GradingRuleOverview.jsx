import React, { useMemo } from "react";

import { Card, Col, Row, Statistic, Tag } from "antd";

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

const GradingRuleOverview = ({ rule, itemCount = 0 }) => {
  const totalWeight = useMemo(
    () => getTotalWeight(rule?.items || []),
    [rule?.items],
  );

  const calculationLabel = getCalculationLabel(rule?.calculation_type);

  return (
    <section className="grading-rule-overview">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="grading-rule-stat-card">
            <Statistic
              title="Thành phần điểm"
              value={itemCount}
              prefix={<NumberOutlined />}
              suffix="mục"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="grading-rule-stat-card">
            <Statistic
              title="Tổng trọng số"
              value={formatWeight(totalWeight)}
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="grading-rule-stat-card">
            <Statistic
              title="Điểm đạt"
              value={rule?.pass_score ?? 5}
              precision={1}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="grading-rule-stat-card">
            <div className="grading-rule-stat-label">
              <CalculatorOutlined />
              <span>Phương pháp tính</span>
            </div>

            <div className="grading-rule-stat-value">{calculationLabel}</div>

            <Tag color={rule?.status === "active" ? "success" : "default"}>
              {rule?.status === "active" ? "Đang áp dụng" : "Tạm ngưng"}
            </Tag>
          </Card>
        </Col>
      </Row>
    </section>
  );
};

export default GradingRuleOverview;
