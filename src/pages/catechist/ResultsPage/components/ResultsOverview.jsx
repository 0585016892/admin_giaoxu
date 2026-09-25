import React, { useMemo } from "react";

import { Col, Row } from "antd";

import {
  CheckCircleOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import StatCard from "../../../../components/common/StatCard";

import { CALCULATION_LABELS } from "../../../../utils/resultsUtils";

const ResultsOverview = ({ statistics, rule, loading = false }) => {
  const stats = statistics || {
    totalStudents: 0,
    completedStudents: 0,
    averageScore: 0,
    passRate: 0,
  };

  const digits = Number(rule?.rounding_digits ?? 1);

  const passScore = Number(rule?.pass_score ?? 5);

  const calculationLabel =
    CALCULATION_LABELS?.[rule?.calculation_type] || "Điểm tổng kết";

  const averageScore = useMemo(() => {
    const value = Number(stats.averageScore ?? 0);

    return Number.isFinite(value) ? value.toFixed(digits) : "0.0";
  }, [stats.averageScore, digits]);

  const passRate = useMemo(() => {
    const value = Number(stats.passRate ?? 0);

    return Number.isFinite(value) ? Number(value.toFixed(1)) : 0;
  }, [stats.passRate]);

  return (
    <section className="results-overview">
      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Tổng học viên"
            value={stats.totalStudents}
            loading={loading}
            icon={<TeamOutlined />}
            iconColor="#173B5E"
            description="Học viên trong lớp"
          />
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Đã đủ điểm"
            value={stats.completedStudents}
            loading={loading}
            icon={<TrophyOutlined />}
            iconColor="#D9A441"
            description="Đã hoàn thành"
          />
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Điểm TB lớp"
            value={averageScore}
            loading={loading}
            icon={<RiseOutlined />}
            iconColor="#16A34A"
            description={
              <>
                {calculationLabel}
                <span className="results-stat-suffix"> /10</span>
              </>
            }
          />
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Tỷ lệ đạt"
            value={`${passRate}%`}
            loading={loading}
            icon={<CheckCircleOutlined />}
            iconColor="#2563EB"
            description={
              <>
                Đạt từ <strong>{passScore.toFixed(1)}</strong> điểm
              </>
            }
          />
        </Col>
      </Row>

      {/* =====================================================
          GRADING RULE
      ===================================================== */}

      {rule && (
        <div className="results-rule-card">
          <div className="results-rule-main">
            {/* HEADER */}
            <div className="results-rule-heading">
              <div className="results-rule-icon">
                <TrophyOutlined />
              </div>

              <div className="results-rule-heading-content">
                <div className="results-rule-title">Quy tắc tính điểm</div>

                <div className="results-rule-method">{calculationLabel}</div>
              </div>
            </div>

            {/* ITEMS */}
            <div className="results-rule-items">
              {(rule.items || []).map((item, index) => (
                <div
                  className="results-rule-item"
                  key={item.id || item.code || index}
                >
                  <div className="results-rule-item-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="results-rule-item-name">{item.name}</div>

                  <div className="results-rule-item-weight">
                    × {Number(item.weight ?? 1).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>

            {/* META */}
            <div className="results-rule-meta">
              <div className="results-rule-meta-item">
                <span>Điểm đạt</span>

                <strong>{passScore.toFixed(1)}</strong>
              </div>

              <div className="results-rule-meta-divider" />

              <div className="results-rule-meta-item">
                <span>Làm tròn</span>

                <strong>{digits} chữ số</strong>
              </div>

              {rule.multiplier && Number(rule.multiplier) !== 1 && (
                <>
                  <div className="results-rule-meta-divider" />

                  <div className="results-rule-meta-item">
                    <span>Hệ số tổng</span>

                    <strong>× {Number(rule.multiplier).toFixed(1)}</strong>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ResultsOverview;
