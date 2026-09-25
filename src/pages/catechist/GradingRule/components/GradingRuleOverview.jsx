import React, { useMemo } from "react";

import { Col, Row, Tag } from "antd";

import {
  CalculatorOutlined,
  CheckCircleOutlined,
  NumberOutlined,
  PercentageOutlined,
} from "@ant-design/icons";

import StatCard from "../../../../components/common/StatCard";

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

  return (
    <section className="grading-rule-overview">
      <Row gutter={[16, 16]}>
        {/* =====================================================
            THÀNH PHẦN ĐIỂM
        ===================================================== */}
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Thành phần điểm"
            value={itemCount}
            loading={loading}
            icon={<NumberOutlined />}
            iconColor="#173B5E"
            description="Thành phần"
          />
        </Col>

        {/* =====================================================
            TỔNG TRỌNG SỐ
        ===================================================== */}
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Tổng trọng số"
            value={formatWeight(totalWeight)}
            loading={loading}
            icon={<PercentageOutlined />}
            iconColor="#D9A441"
            description="Tổng hệ số"
          />
        </Col>

        {/* =====================================================
            ĐIỂM ĐẠT
        ===================================================== */}
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Điểm đạt"
            value={rule?.pass_score ?? 5}
            loading={loading}
            icon={<CheckCircleOutlined />}
            iconColor="#16A34A"
            description="tối thiểu để đạt"
          />
        </Col>

        {/* =====================================================
            PHƯƠNG PHÁP TÍNH
        ===================================================== */}
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Phương pháp tính"
            value={calculationLabel || "—"}
            loading={loading}
            icon={<CalculatorOutlined />}
            iconColor="#7C3AED"
            description={
              isActive ? (
                <Tag color="success">Đang áp dụng</Tag>
              ) : (
                <Tag>Tạm ngưng</Tag>
              )
            }
          />
        </Col>
      </Row>
    </section>
  );
};

export default GradingRuleOverview;
