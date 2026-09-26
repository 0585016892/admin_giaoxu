import React, { useMemo, useState } from "react";
import { Col, Modal, Row, Tag } from "antd";

import {
  CalculatorOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import StatCard from "../../../../components/common/StatCard";
import AppButton from "../../../../components/common/AppButton";

import { CALCULATION_LABELS } from "../../../../utils/resultsUtils";

const ResultsOverview = ({ statistics, rule, loading = false }) => {
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);

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

  const formatNumber = (value, decimal = 1) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return Number(0).toFixed(decimal);
    }

    return number.toFixed(decimal);
  };

  /* =========================================================
     AVERAGE SCORE
  ========================================================= */

  const averageScore = useMemo(() => {
    const value = Number(stats.averageScore ?? 0);

    return Number.isFinite(value) ? value.toFixed(digits) : "0.0";
  }, [stats.averageScore, digits]);

  /* =========================================================
     PASS RATE
  ========================================================= */

  const passRate = useMemo(() => {
    const value = Number(stats.passRate ?? 0);

    return Number.isFinite(value) ? Number(value.toFixed(1)) : 0;
  }, [stats.passRate]);

  /* =========================================================
     RULE ITEMS
  ========================================================= */

  const ruleItems = useMemo(() => {
    return Array.isArray(rule?.items) ? rule.items : [];
  }, [rule]);

  /* =========================================================
     TOTAL WEIGHT
  ========================================================= */

  const totalWeight = useMemo(() => {
    return ruleItems.reduce((sum, item) => {
      const weight = Number(item?.weight ?? 1);

      return sum + (Number.isFinite(weight) ? weight : 0);
    }, 0);
  }, [ruleItems]);

  /* =========================================================
     FORMULA
  ========================================================= */

  const formula = useMemo(() => {
    if (!ruleItems.length) {
      return "Chưa cấu hình thành phần điểm";
    }

    const numerator = ruleItems
      .map((item) => {
        const name = item?.name || "Điểm";
        const weight = Number(item?.weight ?? 1);

        return `${name} × ${formatNumber(weight, 1)}`;
      })
      .join(" + ");

    if (
      rule?.calculation_type === "sum" ||
      rule?.calculation_type === "total"
    ) {
      return numerator;
    }

    return `(${numerator}) / ${formatNumber(totalWeight, 1)}`;
  }, [ruleItems, rule?.calculation_type, totalWeight]);

  /* =========================================================
     DESCRIPTION
  ========================================================= */

  const formulaDescription = useMemo(() => {
    if (rule?.calculation_type === "sum") {
      return "Cộng các thành phần điểm";
    }

    if (rule?.calculation_type === "weighted_average") {
      return "Tính trung bình có trọng số";
    }

    return "Cộng điểm theo hệ số rồi chia cho tổng hệ số";
  }, [rule?.calculation_type]);

  return (
    <>
      <section className="results-overview">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="results-overview-header">
          <div>
            <div className="results-overview-title">Tổng quan kết quả</div>

            <div className="results-overview-subtitle">
              Thống kê kết quả học tập của lớp
            </div>
          </div>

          {rule && (
            <AppButton
              type="default"
              icon={<CalculatorOutlined />}
              onClick={() => setFormulaModalOpen(true)}
            >
              Công thức tính điểm
            </AppButton>
          )}
        </div>

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
      </section>

      {/* =====================================================
          FORMULA MODAL
      ===================================================== */}

      <Modal
        open={formulaModalOpen}
        onCancel={() => setFormulaModalOpen(false)}
        footer={null}
        centered
        width={680}
        title={
          <div className="results-modal-title">
            <div className="results-modal-title-icon">
              <CalculatorOutlined />
            </div>

            <div>
              <div className="results-modal-title-main">
                Công thức tính điểm
              </div>

              <div className="results-modal-title-sub">
                {formulaDescription}
              </div>
            </div>
          </div>
        }
        className="results-formula-modal"
      >
        <div className="results-modal-content">
          {/* METHOD */}

          <div className="results-modal-method">
            <span>Phương pháp</span>

            <Tag>{calculationLabel}</Tag>
          </div>

          {/* FORMULA */}

          <div className="results-formula-box">
            <div className="results-formula-label">ĐIỂM TỔNG KẾT</div>

            <div className="results-formula">{formula}</div>

            {ruleItems.length > 0 && rule?.calculation_type !== "sum" && (
              <div className="results-formula-note">
                Tổng hệ số = <strong>{formatNumber(totalWeight, 1)}</strong>
              </div>
            )}
          </div>

          {/* COMPONENTS */}

          <div className="results-modal-section">
            <div className="results-modal-section-title">Thành phần điểm</div>

            <div className="results-modal-items">
              {ruleItems.length > 0 ? (
                ruleItems.map((item, index) => {
                  const weight = Number(item?.weight ?? 1);

                  return (
                    <div
                      className="results-modal-item"
                      key={item.id || item.code || index}
                    >
                      <div className="results-modal-item-index">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="results-modal-item-name">
                        {item?.name || "Thành phần điểm"}
                      </div>

                      <div className="results-modal-item-weight">
                        × {formatNumber(weight, 1)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="results-modal-empty">
                  Chưa cấu hình thành phần điểm.
                </div>
              )}
            </div>
          </div>

          {/* META */}

          <div className="results-modal-meta">
            <div className="results-modal-meta-item">
              <span>Điểm đạt</span>
              <strong className="results-modal-pass">
                {formatNumber(passScore, 1)}
              </strong>
            </div>

            <div className="results-modal-divider" />

            <div className="results-modal-meta-item">
              <span>Làm tròn</span>
              <strong>{digits} chữ số</strong>
            </div>

            {rule?.multiplier && Number(rule.multiplier) !== 1 && (
              <>
                <div className="results-modal-divider" />

                <div className="results-modal-meta-item">
                  <span>Hệ số tổng</span>

                  <strong>× {formatNumber(rule.multiplier, 1)}</strong>
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>

      <style>{`
        /* =====================================================
           OVERVIEW
        ===================================================== */

        .results-overview {
          width: 100%;
        }

        .results-overview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .results-overview-title {
          color: #173b5e;
          font-size: 17px;
          font-weight: 800;
          line-height: 1.4;
        }

        .results-overview-subtitle {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
        }

        .results-stat-suffix {
          color: #94a3b8;
          font-weight: 500;
        }

        /* =====================================================
           MODAL HEADER
        ===================================================== */

        .results-formula-modal .ant-modal-content {
          padding: 0;
          overflow: hidden;
          border-radius: 18px;
        }

        .results-formula-modal .ant-modal-header {
          margin: 0;
          padding: 20px 22px;
          border-bottom: 1px solid #eef2f6;
          background: #ffffff;
        }

        .results-formula-modal .ant-modal-body {
          padding: 0;
        }

        .results-modal-title {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .results-modal-title-icon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;
          background: #fdf8eb;
          color: #b88618;

          font-size: 19px;
        }

        .results-modal-title-main {
          color: #173b5e;
          font-size: 16px;
          font-weight: 800;
          line-height: 1.4;
        }

        .results-modal-title-sub {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 500;
        }

        /* =====================================================
           MODAL CONTENT
        ===================================================== */

        .results-modal-content {
          padding: 20px 22px 22px;
        }

        .results-modal-method {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .results-modal-method > span {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .results-modal-method .ant-tag {
          margin: 0;
          padding: 4px 10px;
          border-radius: 7px;
          border-color: #dbe5ef;
          background: #f8fafc;
          color: #475569;
          font-size: 12px;
          font-weight: 700;
        }

        /* =====================================================
           FORMULA
        ===================================================== */

        .results-formula-box {
          padding: 20px 16px;

          border: 1px solid #dbe5ef;
          border-radius: 14px;

          background: linear-gradient(
            135deg,
            #f8fafc 0%,
            #ffffff 100%
          );

          text-align: center;
        }

        .results-formula-label {
          margin-bottom: 9px;

          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .results-formula {
          color: #173b5e;
          font-size: 18px;
          font-weight: 800;
          line-height: 1.7;
          word-break: break-word;
        }

        .results-formula-note {
          margin-top: 8px;
          color: #64748b;
          font-size: 12px;
        }

        .results-formula-note strong {
          color: #173b5e;
          font-weight: 800;
        }

        /* =====================================================
           SECTION
        ===================================================== */

        .results-modal-section {
          margin-top: 20px;
        }

        .results-modal-section-title {
          margin-bottom: 10px;

          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .results-modal-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .results-modal-item {
          display: flex;
          align-items: center;
          gap: 11px;

          padding: 11px 12px;

          border: 1px solid #edf1f5;
          border-radius: 10px;
          background: #fbfcfd;
        }

        .results-modal-item-index {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;
          background: #eef3f8;

          color: #64748b;
          font-size: 10px;
          font-weight: 800;
        }

        .results-modal-item-name {
          flex: 1;
          min-width: 0;

          color: #334155;
          font-size: 13px;
          font-weight: 700;
        }

        .results-modal-item-weight {
          flex-shrink: 0;

          color: #173b5e;
          font-size: 13px;
          font-weight: 800;
        }

        .results-modal-empty {
          padding: 16px;
          border: 1px dashed #dbe5ef;
          border-radius: 10px;
          color: #94a3b8;
          text-align: center;
          font-size: 13px;
        }

        /* =====================================================
           META
        ===================================================== */

        .results-modal-meta {
          display: flex;
          align-items: center;

          margin-top: 20px;
          padding: 14px 16px;

          border: 1px solid #edf1f5;
          border-radius: 11px;

          background: #fafbfd;
        }

        .results-modal-meta-item {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .results-modal-meta-item span {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
        }

        .results-modal-meta-item strong {
          color: #334155;
          font-size: 13px;
          font-weight: 800;
        }

        .results-modal-pass {
          color: #16a34a !important;
        }

        .results-modal-divider {
          width: 1px;
          height: 20px;
          margin: 0 18px;
          background: #e2e8f0;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767px) {
          .results-overview-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .results-overview-header .ant-btn {
            width: 100%;
          }

          .results-formula-modal {
            max-width: calc(100vw - 24px);
          }

          .results-modal-content {
            padding: 16px;
          }

          .results-formula {
            font-size: 15px;
          }

          .results-modal-meta {
            align-items: flex-start;
            flex-direction: column;
            gap: 11px;
          }

          .results-modal-divider {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default ResultsOverview;
