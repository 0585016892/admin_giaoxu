import React, { useMemo } from "react";

import { Avatar, Empty, Progress, Table, Tag, Typography } from "antd";

import {
  CheckCircleOutlined,
  CrownOutlined,
  UserOutlined,
} from "@ant-design/icons";

import AppButton from "../../../../components/common/AppButton";

import { formatScore } from "../../../../utils/resultsUtils";

const { Text } = Typography;

const Leaderboard = ({ data = [], rule, onView }) => {
  const roundingDigits = Number(rule?.rounding_digits ?? 1);
  const passScore = Number(rule?.pass_score ?? 5);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const scoreA =
        a.score === null || a.score === undefined ? -1 : Number(a.score);

      const scoreB =
        b.score === null || b.score === undefined ? -1 : Number(b.score);

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      return String(a.student_name || "").localeCompare(
        String(b.student_name || ""),
        "vi",
        {
          sensitivity: "base",
        },
      );
    });
  }, [data]);

  const columns = useMemo(
    () => [
      // =====================================================
      // RANK
      // =====================================================

      {
        title: "Hạng",
        key: "rank",
        width: 82,
        align: "center",

        render: (_, record, index) => {
          const rank = record.rank || index + 1;

          if (rank <= 3) {
            return (
              <div className={`leaderboard-rank rank-${rank}`}>
                <span className="leaderboard-rank-icon">
                  <CrownOutlined />
                </span>

                <strong>{rank}</strong>
              </div>
            );
          }

          return (
            <span className="leaderboard-rank-normal">
              {String(rank).padStart(2, "0")}
            </span>
          );
        },
      },

      // =====================================================
      // STUDENT
      // =====================================================

      {
        title: "Học viên",
        key: "student",
        width: 300,

        render: (_, record) => (
          <div className="leaderboard-student">
            <Avatar
              size={42}
              icon={<UserOutlined />}
              className="leaderboard-avatar"
            />

            <div className="leaderboard-student-info">
              <Text strong className="leaderboard-student-name">
                {record.student_name || "Chưa cập nhật"}
              </Text>

              <span className="leaderboard-student-code">
                {record.student_code || `HS #${record.student_id}`}
              </span>
            </div>
          </div>
        ),
      },

      // =====================================================
      // PROGRESS
      // =====================================================

      {
        title: "Tiến độ",
        key: "progress",
        width: 200,

        render: (_, record) => {
          const total = Number(record.totalItems ?? 0);
          const completed = Number(record.completedItems ?? 0);

          const percent =
            total > 0
              ? Math.min(100, Math.round((completed / total) * 100))
              : 0;

          return (
            <div className="leaderboard-progress">
              <div className="leaderboard-progress-top">
                <span>Hoàn thành</span>

                <strong>
                  {completed}/{total}
                </strong>
              </div>

              <Progress
                percent={percent}
                size="small"
                showInfo={false}
                strokeColor="#173B5E"
                trailColor="#E8EDF2"
              />

              <span className="leaderboard-progress-percent">{percent}%</span>
            </div>
          );
        },
      },

      // =====================================================
      // SCORE
      // =====================================================

      {
        title: "Điểm tổng kết",
        key: "score",
        width: 170,
        align: "center",

        render: (_, record) => {
          if (record.score === null || record.score === undefined) {
            return (
              <Tag bordered={false} className="leaderboard-pending">
                Chưa đủ điểm
              </Tag>
            );
          }

          const score = Number(record.score);
          const passed = score >= passScore;

          return (
            <div
              className={`leaderboard-score-box ${
                passed ? "passed" : "failed"
              }`}
            >
              <strong>{formatScore(score, roundingDigits)}</strong>

              <span>
                {passed ? (
                  <>
                    <CheckCircleOutlined />
                    Đạt
                  </>
                ) : (
                  "Chưa đạt"
                )}
              </span>
            </div>
          );
        },
      },

      // =====================================================
      // ACTION
      // =====================================================

      {
        title: "",
        key: "action",
        width: 64,
        align: "center",

        render: (_, record) => (
          <AppButton
            icon={<UserOutlined />}
            size="small"
            variant="secondary"
            onClick={() => onView?.(record)}
          />
        ),
      },
    ],
    [passScore, roundingDigits, onView],
  );

  return (
    <>
      <div className="leaderboard">
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="leaderboard-heading">
          <div className="leaderboard-heading-main">
            <div className="leaderboard-heading-icon">
              <CrownOutlined />
            </div>

            <div className="leaderboard-heading-content">
              <div className="leaderboard-title-row">
                <strong>Bảng xếp hạng</strong>

                <span className="leaderboard-total">
                  {sortedData.length} học viên
                </span>
              </div>

              <span className="leaderboard-description">
                Xếp theo điểm tổng kết sau khi áp dụng hệ số
              </span>
            </div>
          </div>

          {rule && (
            <div className="leaderboard-rule">
              <span>Điểm đạt</span>

              <strong>{passScore.toFixed(roundingDigits)}</strong>
            </div>
          )}
        </div>

        {/* ===================================================
            TOP SUMMARY
        =================================================== */}

        {sortedData.length > 0 && (
          <div className="leaderboard-summary">
            <div className="leaderboard-summary-item">
              <span className="summary-dot summary-dot-primary" />
              <div>
                <strong>{sortedData.length}</strong>
                <span>Tổng học viên</span>
              </div>
            </div>

            <div className="leaderboard-summary-divider" />

            <div className="leaderboard-summary-item">
              <span className="summary-dot summary-dot-success" />
              <div>
                <strong>
                  {
                    sortedData.filter(
                      (item) =>
                        item.score !== null &&
                        item.score !== undefined &&
                        Number(item.score) >= passScore,
                    ).length
                  }
                </strong>
                <span>Đạt</span>
              </div>
            </div>

            <div className="leaderboard-summary-divider" />

            <div className="leaderboard-summary-item">
              <span className="summary-dot summary-dot-warning" />
              <div>
                <strong>
                  {
                    sortedData.filter(
                      (item) =>
                        item.score !== null &&
                        item.score !== undefined &&
                        Number(item.score) < passScore,
                    ).length
                  }
                </strong>
                <span>Chưa đạt</span>
              </div>
            </div>

            <div className="leaderboard-summary-divider" />

            <div className="leaderboard-summary-item">
              <span className="summary-dot summary-dot-muted" />
              <div>
                <strong>
                  {
                    sortedData.filter(
                      (item) => item.score === null || item.score === undefined,
                    ).length
                  }
                </strong>
                <span>Chưa đủ điểm</span>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="leaderboard-table">
          <Table
            columns={columns}
            dataSource={sortedData}
            rowKey={(record) => record.student_id}
            pagination={false}
            size="middle"
            scroll={{
              x: 760,
            }}
            rowClassName={(_, index) => {
              if (index === 0) return "leaderboard-row-first";
              if (index === 1) return "leaderboard-row-second";
              if (index === 2) return "leaderboard-row-third";

              return "";
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có dữ liệu xếp hạng"
                />
              ),
            }}
          />
        </div>
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`
        /* ===================================================
           CONTAINER
        =================================================== */

        .leaderboard {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(23, 59, 94, 0.04);
        }

        /* ===================================================
           HEADER
        =================================================== */

        .leaderboard-heading {
          min-height: 82px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: #ffffff;
          border-bottom: 1px solid #edf1f5;
        }

        .leaderboard-heading-main {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .leaderboard-heading-icon {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #f7f1df;
          color: #b28a2e;
          font-size: 20px;
        }

        .leaderboard-heading-content {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .leaderboard-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .leaderboard-title-row strong {
          color: #173b5e;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.3;
        }

        .leaderboard-total {
          padding: 3px 9px;
          border-radius: 20px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .leaderboard-description {
          color: #8a97a6;
          font-size: 13px;
          line-height: 1.4;
        }

        .leaderboard-rule {
          min-width: 90px;
          padding: 8px 14px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
          border-left: 1px solid #edf1f5;
        }

        .leaderboard-rule span {
          color: #8a97a6;
          font-size: 11px;
          font-weight: 500;
        }

        .leaderboard-rule strong {
          color: #173b5e;
          font-size: 19px;
          line-height: 1.2;
        }

        /* ===================================================
           SUMMARY
        =================================================== */

        .leaderboard-summary {
          min-height: 78px;
          padding: 15px 22px;
          display: flex;
          align-items: center;
          gap: 22px;
          background: #fbfcfd;
          border-bottom: 1px solid #edf1f5;
        }

        .leaderboard-summary-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .leaderboard-summary-item > div {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .leaderboard-summary-item strong {
          color: #173b5e;
          font-size: 17px;
          line-height: 1.2;
        }

        .leaderboard-summary-item span:not(.summary-dot) {
          color: #8a97a6;
          font-size: 11px;
          white-space: nowrap;
        }

        .summary-dot {
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          border-radius: 50%;
        }

        .summary-dot-primary {
          background: #173b5e;
        }

        .summary-dot-success {
          background: #3f8f68;
        }

        .summary-dot-warning {
          background: #d49a38;
        }

        .summary-dot-muted {
          background: #a8b1bb;
        }

        .leaderboard-summary-divider {
          width: 1px;
          height: 30px;
          background: #e3e8ed;
        }

        /* ===================================================
           TABLE
        =================================================== */

        .leaderboard-table {
          width: 100%;
        }

        .leaderboard-table .ant-table {
          color: #334155;
        }

        .leaderboard-table .ant-table-container {
          border: 0;
        }

        .leaderboard-table .ant-table-thead > tr > th {
          height: 48px;
          padding: 0 16px;
          background: #ffffff !important;
          color: #7b8794;
          border-bottom: 1px solid #edf1f5;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .leaderboard-table .ant-table-tbody > tr > td {
          height: 72px;
          padding: 10px 16px;
          background: #ffffff;
          border-bottom: 1px solid #f0f2f5;
          transition:
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .leaderboard-table
          .ant-table-tbody
          > tr:hover
          > td {
          background: #f8fafc !important;
        }

        .leaderboard-table
          .ant-table-tbody
          > tr:last-child
          > td {
          border-bottom: 0;
        }

        /* ===================================================
           TOP 3 ROW
        =================================================== */

        .leaderboard-table
          .ant-table-tbody
          > .leaderboard-row-first
          > td {
          background: #fffdf7;
        }

        .leaderboard-table
          .ant-table-tbody
          > .leaderboard-row-second
          > td {
          background: #fcfdfe;
        }

        .leaderboard-table
          .ant-table-tbody
          > .leaderboard-row-third
          > td {
          background: #fdfcfb;
        }

        /* ===================================================
           RANK
        =================================================== */

        .leaderboard-rank {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          min-width: 40px;
          font-size: 14px;
        }

        .leaderboard-rank strong {
          color: #475569;
          font-size: 14px;
        }

        .leaderboard-rank-icon {
          display: inline-flex;
          font-size: 14px;
        }

        .rank-1 {
          color: #c29127;
        }

        .rank-1 strong {
          color: #a8791e;
        }

        .rank-2 {
          color: #8793a0;
        }

        .rank-2 strong {
          color: #64748b;
        }

        .rank-3 {
          color: #ae7c57;
        }

        .rank-3 strong {
          color: #916345;
        }

        .leaderboard-rank-normal {
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        /* ===================================================
           STUDENT
        =================================================== */

        .leaderboard-student {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .leaderboard-avatar {
          flex: 0 0 auto;
          background: #eef3f7;
          color: #5d7387;
          border: 1px solid #dfe7ed;
        }

        .leaderboard-student-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .leaderboard-student-name {
          overflow: hidden;
          color: #1e293b !important;
          font-size: 14px;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .leaderboard-student-code {
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.2;
        }

        /* ===================================================
           PROGRESS
        =================================================== */

        .leaderboard-progress {
          min-width: 140px;
          position: relative;
          padding-right: 42px;
        }

        .leaderboard-progress-top {
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .leaderboard-progress-top span {
          color: #8a97a6;
          font-size: 11px;
        }

        .leaderboard-progress-top strong {
          color: #475569;
          font-size: 11px;
          font-weight: 600;
        }

        .leaderboard-progress .ant-progress {
          display: block;
          margin: 0;
        }

        .leaderboard-progress .ant-progress-bg {
          border-radius: 20px;
        }

        .leaderboard-progress .ant-progress-inner {
          background: #e9eef3;
          border-radius: 20px;
        }

        .leaderboard-progress-percent {
          position: absolute;
          right: 0;
          bottom: 0;
          color: #64748b;
          font-size: 10px;
          font-weight: 600;
        }

        /* ===================================================
           SCORE
        =================================================== */

        .leaderboard-score-box {
          min-width: 78px;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .leaderboard-score-box strong {
          font-size: 19px;
          line-height: 1.15;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .leaderboard-score-box span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
        }

        .leaderboard-score-box.passed strong {
          color: #3f8f68;
        }

        .leaderboard-score-box.passed span {
          color: #3f8f68;
        }

        .leaderboard-score-box.failed strong {
          color: #c77a5e;
        }

        .leaderboard-score-box.failed span {
          color: #c77a5e;
        }

        .leaderboard-pending {
          margin: 0;
          padding: 5px 9px;
          border: 0 !important;
          border-radius: 8px;
          background: #f4f6f8 !important;
          color: #8a97a6 !important;
          font-size: 11px;
        }

        /* ===================================================
           ACTION
        =================================================== */

        .leaderboard-table .ant-btn {
          box-shadow: none;
        }

        /* ===================================================
           EMPTY
        =================================================== */

        .leaderboard-table .ant-empty {
          padding: 50px 20px;
        }

        .leaderboard-table .ant-empty-description {
          color: #94a3b8;
          font-size: 13px;
        }

        /* ===================================================
           MOBILE
        =================================================== */

        @media (max-width: 768px) {
          .leaderboard {
            border-radius: 14px;
          }

          .leaderboard-heading {
            padding: 16px;
            align-items: flex-start;
          }

          .leaderboard-heading-main {
            gap: 10px;
          }

          .leaderboard-heading-icon {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
          }

          .leaderboard-title-row strong {
            font-size: 15px;
          }

          .leaderboard-description {
            font-size: 12px;
          }

          .leaderboard-rule {
            min-width: auto;
            padding-right: 0;
          }

          .leaderboard-summary {
            padding: 13px 16px;
            gap: 14px;
            overflow-x: auto;
          }

          .leaderboard-summary-item {
            flex: 0 0 auto;
          }

          .leaderboard-summary-divider {
            flex: 0 0 1px;
          }

          .leaderboard-table .ant-table-thead > tr > th,
          .leaderboard-table .ant-table-tbody > tr > td {
            padding-left: 12px;
            padding-right: 12px;
          }

          .leaderboard-student-name {
            max-width: 180px;
          }
        }

        @media (max-width: 520px) {
          .leaderboard-heading {
            flex-direction: column;
          }

          .leaderboard-rule {
            width: 100%;
            padding: 10px 0 0;
            align-items: flex-start;
            border-left: 0;
            border-top: 1px solid #edf1f5;
          }

          .leaderboard-summary {
            gap: 18px;
          }
        }
      `}</style>
    </>
  );
};

export default Leaderboard;
