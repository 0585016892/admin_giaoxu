import React from "react";

import { Card, Col, Row, Statistic, Tag } from "antd";

import {
  CheckCircleOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import { CALCULATION_LABELS } from "../../../../utils/resultsUtils";

const ResultsOverview = ({ statistics, rule }) => {
  const stats = statistics || {
    totalStudents: 0,
    completedStudents: 0,
    averageScore: 0,
    passRate: 0,
  };

  const digits = Number(rule?.rounding_digits) || 1;

  return (
    <div className="results-overview">
      <Row gutter={[14, 14]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="results-stat-card">
            <div className="results-stat-icon navy">
              <TeamOutlined />
            </div>

            <Statistic title="Tổng học viên" value={stats.totalStudents} />

            <div className="results-stat-description">Học viên trong lớp</div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} className="results-stat-card">
            <div className="results-stat-icon gold">
              <TrophyOutlined />
            </div>

            <Statistic title="Đã đủ điểm" value={stats.completedStudents} />

            <div className="results-stat-description">
              Đã hoàn thành đầu điểm
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} className="results-stat-card">
            <div className="results-stat-icon green">
              <RiseOutlined />
            </div>

            <Statistic
              title="Điểm TB lớp"
              value={Number(stats.averageScore).toFixed(digits)}
              suffix="/10"
            />

            <div className="results-stat-description">
              {CALCULATION_LABELS[rule?.calculation_type] || "Điểm tổng kết"}
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} className="results-stat-card">
            <div className="results-stat-icon blue">
              <CheckCircleOutlined />
            </div>

            <Statistic title="Tỷ lệ đạt" value={stats.passRate} suffix="%" />

            <div className="results-stat-description">
              Đạt từ <strong>{Number(rule?.pass_score || 5).toFixed(1)}</strong>{" "}
              điểm
            </div>
          </Card>
        </Col>
      </Row>

      {rule && (
        <Card bordered={false} className="results-rule-card">
          <div className="results-rule-main">
            <div className="results-rule-heading">
              <TrophyOutlined />

              <div>
                <strong>Quy tắc tính điểm</strong>

                <span>{CALCULATION_LABELS[rule.calculation_type]}</span>
              </div>
            </div>

            <div className="results-rule-items">
              {rule.items.map((item) => (
                <Tag key={item.id} className="results-rule-tag">
                  <span>{item.name}</span>

                  <b>× {Number(item.weight).toFixed(1)}</b>
                </Tag>
              ))}
            </div>

            <div className="results-rule-meta">
              <span>
                Đạt từ <b>{Number(rule.pass_score).toFixed(1)}</b>
              </span>

              <span>
                Làm tròn <b>{rule.rounding_digits}</b> chữ số
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResultsOverview;
