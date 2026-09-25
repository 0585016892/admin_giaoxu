import React, { useMemo } from "react";

import { Card, Empty, Tag } from "antd";

import { CheckCircleOutlined, FileTextOutlined } from "@ant-design/icons";

import {
  buildFormula,
  calculateMaxScore,
  getCalculationLabel,
  getAggregationLabel,
  formatScore,
  formatWeight,
} from "../../../../utils/gradingRuleUtils";

const GradingRulePreview = ({ rule, items = [] }) => {
  const calculationType = rule?.calculation_type || "weighted_average";

  const passScore = Number(rule?.pass_score ?? 5);

  const roundingDigits = Number(rule?.rounding_digits ?? 1);

  const multiplier = Number(rule?.multiplier ?? 1);

  const divisor =
    rule?.divisor === null || rule?.divisor === undefined
      ? null
      : Number(rule.divisor);

  const formula = useMemo(
    () =>
      buildFormula({
        calculationType,
        items,
        multiplier,
        divisor,
        passScore,
      }),
    [calculationType, items, multiplier, divisor, passScore],
  );

  const maxScore = useMemo(
    () =>
      calculateMaxScore({
        calculationType,
        items,
        multiplier,
        divisor,
        roundingDigits,
      }),
    [calculationType, items, multiplier, divisor, roundingDigits],
  );

  const calculationLabel = getCalculationLabel(calculationType);

  return (
    <Card className="grading-rule-preview-card" bordered={false}>
      <div className="grading-rule-preview-header">
        <div className="grading-rule-preview-header-main">
          <div className="grading-rule-preview-icon">
            <FileTextOutlined />
          </div>

          <div>
            <div className="grading-rule-section-title">Xem trước quy tắc</div>

            <div className="grading-rule-section-description">
              Kiểm tra cách công thức sẽ được áp dụng trước khi lưu.
            </div>
          </div>
        </div>
      </div>

      <div className="grading-rule-preview-meta">
        <div className="grading-rule-preview-meta-item">
          <span>Phương pháp</span>

          <strong>{calculationLabel}</strong>
        </div>

        <div className="grading-rule-preview-meta-item">
          <span>Điểm đạt</span>

          <strong>{formatScore(passScore, 1)}</strong>
        </div>

        <div className="grading-rule-preview-meta-item">
          <span>Làm tròn</span>

          <strong>{roundingDigits} chữ số</strong>
        </div>

        {calculationType === "sum_multiplier" && (
          <div className="grading-rule-preview-meta-item">
            <span>Hệ số</span>

            <strong>× {formatWeight(multiplier)}</strong>
          </div>
        )}
      </div>

      <div className="grading-rule-formula-box">
        <div className="grading-rule-formula-label">CÔNG THỨC</div>

        <div className="grading-rule-formula">{formula}</div>

        <div className="grading-rule-formula-description">
          Công thức được áp dụng thống nhất cho các kết quả thuộc giáo xứ.
        </div>
      </div>

      <div className="grading-rule-preview-result">
        <div className="grading-rule-preview-result-icon">
          <CheckCircleOutlined />
        </div>

        <div>
          <div className="grading-rule-preview-result-label">
            Kết quả tối đa dự kiến
          </div>

          <div className="grading-rule-preview-result-score">
            {calculationType === "pass_fail" ? "Đạt" : maxScore}
          </div>
        </div>
      </div>

      <div className="grading-rule-preview-items">
        <div className="grading-rule-preview-subtitle">Các thành phần</div>

        {items.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có thành phần điểm"
          />
        ) : (
          <div className="grading-rule-preview-item-list">
            {items.map((item, index) => (
              <div
                className="grading-rule-preview-item"
                key={item.id || item.code || index}
              >
                <div className="grading-rule-preview-item-index">
                  {index + 1}
                </div>

                <div className="grading-rule-preview-item-content">
                  <div className="grading-rule-preview-item-name">
                    {item.name}
                  </div>

                  <div className="grading-rule-preview-item-code">
                    {item.code}
                  </div>
                </div>

                <div className="grading-rule-preview-item-weight">
                  <Tag>Trọng số {formatWeight(item.weight)}</Tag>
                </div>

                <div className="grading-rule-preview-item-max">
                  Max {formatScore(item.max_score, 1)}
                </div>

                {Number(item.allow_multiple) === 1 && (
                  <div className="grading-rule-preview-item-aggregation">
                    {getAggregationLabel(item.aggregation_method)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default GradingRulePreview;
