import React, { useMemo } from "react";

import { Card, Empty, Tag } from "antd";

import {
  CheckCircleOutlined,
  CalculatorOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
} from "@ant-design/icons";

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

  const isPassFail = calculationType === "pass_fail";

  return (
    <Card className="grading-rule-preview-card" bordered={false}>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="grading-rule-preview-header">
        <div className="grading-rule-preview-header-main">
          <div className="grading-rule-preview-icon">
            <CalculatorOutlined />
          </div>

          <div className="grading-rule-preview-heading">
            <div className="grading-rule-preview-title">
              Xem trước quy tắc tính điểm
            </div>

            <div className="grading-rule-preview-description">
              Kiểm tra cách hệ thống tính điểm trước khi áp dụng cho toàn bộ
              giáo xứ.
            </div>
          </div>
        </div>

        <Tag
          icon={<CheckCircleOutlined />}
          color="success"
          className="grading-rule-preview-status"
        >
          Quy tắc hợp lệ
        </Tag>
      </div>

      {/* =====================================================
          META
      ===================================================== */}
      <div className="grading-rule-preview-meta">
        <div className="grading-rule-preview-meta-item">
          <div className="grading-rule-preview-meta-icon">
            <CalculatorOutlined />
          </div>

          <div>
            <span>Phương pháp tính</span>

            <strong>{calculationLabel}</strong>
          </div>
        </div>

        <div className="grading-rule-preview-meta-item">
          <div className="grading-rule-preview-meta-icon">
            <CheckCircleOutlined />
          </div>

          <div>
            <span>Điểm đạt</span>

            <strong>{formatScore(passScore, 1)}</strong>
          </div>
        </div>

        <div className="grading-rule-preview-meta-item">
          <div className="grading-rule-preview-meta-icon">
            <PercentageOutlined />
          </div>

          <div>
            <span>Làm tròn</span>

            <strong>{roundingDigits} chữ số</strong>
          </div>
        </div>

        {calculationType === "sum_multiplier" && (
          <div className="grading-rule-preview-meta-item">
            <div className="grading-rule-preview-meta-icon">
              <PercentageOutlined />
            </div>

            <div>
              <span>Hệ số tổng</span>

              <strong>× {formatWeight(multiplier)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          FORMULA
      ===================================================== */}
      <div className="grading-rule-preview-formula">
        <div className="grading-rule-preview-formula-header">
          <div>
            <div className="grading-rule-preview-formula-eyebrow">
              CÔNG THỨC TÍNH
            </div>

            <div className="grading-rule-preview-formula-title">
              Hệ thống sẽ áp dụng công thức này
            </div>
          </div>

          <InfoCircleOutlined />
        </div>

        <div className="grading-rule-preview-formula-content">{formula}</div>

        <div className="grading-rule-preview-formula-note">
          Công thức được áp dụng thống nhất cho các kết quả thuộc giáo xứ.
        </div>
      </div>

      {/* =====================================================
          RESULT SUMMARY
      ===================================================== */}
      <div className="grading-rule-preview-result">
        <div className="grading-rule-preview-result-left">
          <div className="grading-rule-preview-result-icon">
            <CheckCircleOutlined />
          </div>

          <div>
            <div className="grading-rule-preview-result-label">
              {isPassFail ? "Điều kiện kết quả" : "Điểm tối đa dự kiến"}
            </div>

            <div className="grading-rule-preview-result-description">
              {isPassFail
                ? "Kết quả được xác định theo điểm đạt"
                : "Sau khi áp dụng toàn bộ hệ số"}
            </div>
          </div>
        </div>

        <div className="grading-rule-preview-result-score">
          {isPassFail ? "Đạt / Chưa đạt" : maxScore}
        </div>
      </div>

      {/* =====================================================
          ITEMS
      ===================================================== */}
      <div className="grading-rule-preview-items">
        <div className="grading-rule-preview-items-header">
          <div>
            <div className="grading-rule-preview-subtitle">Thành phần điểm</div>

            <div className="grading-rule-preview-items-count">
              {items.length} thành phần được cấu hình
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="grading-rule-preview-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có thành phần điểm"
            />
          </div>
        ) : (
          <div className="grading-rule-preview-item-list">
            {items.map((item, index) => (
              <div
                className="grading-rule-preview-item"
                key={item.id || item.code || index}
              >
                {/* STT */}
                <div className="grading-rule-preview-item-index">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* NAME */}
                <div className="grading-rule-preview-item-content">
                  <div className="grading-rule-preview-item-name">
                    {item.name}
                  </div>

                  <div className="grading-rule-preview-item-code">
                    {item.code}
                  </div>
                </div>

                {/* WEIGHT */}
                <div className="grading-rule-preview-item-column">
                  <span>Trọng số</span>

                  <strong className="grading-rule-preview-weight">
                    × {formatWeight(item.weight)}
                  </strong>
                </div>

                {/* MAX */}
                <div className="grading-rule-preview-item-column">
                  <span>Điểm tối đa</span>

                  <strong>{formatScore(item.max_score, 1)}</strong>
                </div>

                {/* MULTIPLE */}
                {Number(item.allow_multiple) === 1 ? (
                  <Tag
                    color="blue"
                    className="grading-rule-preview-aggregation"
                  >
                    {getAggregationLabel(item.aggregation_method)}
                  </Tag>
                ) : (
                  <Tag className="grading-rule-preview-single">Một lần</Tag>
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
