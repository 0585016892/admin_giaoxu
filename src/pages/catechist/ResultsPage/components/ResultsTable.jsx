import React, { useMemo } from "react";

import { Avatar, Progress, Tag, Tooltip, Typography } from "antd";

import {
  CheckCircleOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";

import AppButton from "../../../../components/common/AppButton";
import AppTable from "../../../../components/common/AppTable";

import { formatScore } from "../../../../utils/resultsUtils";

const { Text } = Typography;

const ResultsTable = ({
  data = [],
  rule,
  loading = false,
  currentPage = 1,
  pageSize = 10,
  onView,
}) => {
  const roundingDigits = Number(rule?.rounding_digits ?? 1);
  const passScore = Number(rule?.pass_score ?? 5);

  const columns = useMemo(() => {
    const resultColumns = [
      // =====================================================
      // STT
      // =====================================================

      {
        title: "STT",
        width: 64,
        fixed: "left",
        align: "center",

        render: (_, __, index) => {
          const number = (currentPage - 1) * pageSize + index + 1;

          return (
            <span className="results-index">
              {String(number).padStart(2, "0")}
            </span>
          );
        },
      },

      // =====================================================
      // HỌC VIÊN
      // =====================================================

      {
        title: "Học viên",
        key: "student",
        width: 285,
        fixed: "left",

        render: (_, record) => (
          <div className="results-student-cell">
            <Avatar
              size={42}
              icon={<UserOutlined />}
              className="results-student-avatar"
            />

            <div className="results-student-info">
              <Text strong className="results-student-name">
                {record.student_name || "Chưa cập nhật"}
              </Text>

              <span className="results-student-code">
                {record.student_code || `HS #${record.student_id}`}
              </span>
            </div>
          </div>
        ),
      },
    ];

    // =====================================================
    // CÁC THÀNH PHẦN ĐIỂM
    // =====================================================

    (rule?.items || []).forEach((ruleItem) => {
      resultColumns.push({
        title: (
          <div className="results-score-column-title">
            <span>{ruleItem.name}</span>

            <small>× {Number(ruleItem.weight ?? 1).toFixed(1)}</small>
          </div>
        ),

        key: `item-${ruleItem.id}`,

        width: 135,

        align: "center",

        render: (_, record) => {
          const item = (record.itemScores || []).find(
            (value) => Number(value.ruleItemId) === Number(ruleItem.id),
          );

          if (!item || item.score === null || item.score === undefined) {
            return <span className="results-score-empty">—</span>;
          }

          const score = Number(item.score);
          const weight = Number(ruleItem.weight ?? 1);

          return (
            <Tooltip
              title={
                <div className="results-score-tooltip">
                  <div>
                    Điểm: <strong>{formatScore(score, 1)}</strong>
                  </div>

                  <div>
                    Hệ số: <strong>× {weight.toFixed(1)}</strong>
                  </div>
                </div>
              }
            >
              <div className="results-item-score">
                <strong>{formatScore(score, 1)}</strong>

                <span>× {weight.toFixed(1)}</span>
              </div>
            </Tooltip>
          );
        },
      });
    });

    // =====================================================
    // ĐIỂM TỔNG KẾT
    // =====================================================

    resultColumns.push({
      title: "Điểm tổng kết",
      key: "final-score",
      width: 155,
      align: "center",

      sorter: (a, b) => Number(a.score ?? -1) - Number(b.score ?? -1),

      render: (_, record) => {
        if (record.score === null || record.score === undefined) {
          return (
            <Tag bordered={false} className="results-pending-tag">
              Chưa đủ điểm
            </Tag>
          );
        }

        const score = Number(record.score);
        const passed = score >= passScore;

        return (
          <div className={`results-final-score ${passed ? "pass" : "fail"}`}>
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
    });

    // =====================================================
    // TIẾN ĐỘ
    // =====================================================

    resultColumns.push({
      title: "Tiến độ",
      key: "progress",
      width: 160,
      align: "center",

      render: (_, record) => {
        const total = Number(record.totalItems ?? 0);
        const completed = Number(record.completedItems ?? 0);

        const percent =
          total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

        return (
          <div className="results-progress">
            <div className="results-progress-top">
              <span>Hoàn thành</span>

              <strong>{percent}%</strong>
            </div>

            <div className="results-progress-main">
              <Progress
                percent={percent}
                size="small"
                showInfo={false}
                strokeColor="#173B5E"
                trailColor="#E8EDF2"
              />

              <span>
                {completed}/{total}
              </span>
            </div>
          </div>
        );
      },
    });

    // =====================================================
    // ACTION
    // =====================================================

    resultColumns.push({
      title: "",
      key: "action",
      width: 68,
      fixed: "right",
      align: "center",

      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <AppButton
            icon={<EyeOutlined />}
            size="small"
            variant="secondary"
            onClick={() => onView?.(record)}
          />
        </Tooltip>
      ),
    });

    return resultColumns;
  }, [rule, currentPage, pageSize, onView, passScore, roundingDigits]);

  const scrollWidth =
    64 + 285 + (rule?.items?.length || 0) * 135 + 155 + 160 + 68;

  return (
    <>
      <div className="results-table-wrapper">
        <AppTable
          className="results-table"
          rowKey={(record) => record.student_id}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          size="middle"
          scrollX={scrollWidth}
          rowClassName={(record) => {
            if (
              record.score !== null &&
              record.score !== undefined &&
              Number(record.score) >= passScore
            ) {
              return "results-row-passed";
            }

            return "";
          }}
          emptyText={
            <div className="results-empty">
              <div className="results-empty-icon">
                <UserOutlined />
              </div>

              <strong>Chưa có học viên</strong>

              <span>Không có học viên phù hợp với điều kiện hiện tại</span>
            </div>
          }
        />
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`
        /* ===================================================
           WRAPPER
        =================================================== */

        .results-table-wrapper {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(23, 59, 94, 0.035);
        }

        /* ===================================================
           TABLE BASE
        =================================================== */

        .results-table {
          width: 100%;
        }

        .results-table .ant-table {
          color: #334155;
          background: #ffffff;
        }

        .results-table .ant-table-container {
          border: 0;
        }

        /* ===================================================
           HEADER
        =================================================== */

        .results-table
          .ant-table-thead
          > tr
          > th {
          height: 52px;
          padding: 0 16px;

          background: #fbfcfd !important;

          color: #7b8794;

          border-bottom: 1px solid #e7ebef;

          font-size: 11px;
          font-weight: 700;

          letter-spacing: 0.035em;
          text-transform: uppercase;

          white-space: nowrap;
        }

        .results-table
          .ant-table-thead
          > tr
          > th.ant-table-cell-fix-left,
        .results-table
          .ant-table-thead
          > tr
          > th.ant-table-cell-fix-right {
          background: #fbfcfd !important;
        }

        /* ===================================================
           BODY
        =================================================== */

        .results-table
          .ant-table-tbody
          > tr
          > td {
          height: 76px;
          padding: 10px 16px;

          background: #ffffff;

          border-bottom: 1px solid #f0f2f5;

          transition:
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .results-table
          .ant-table-tbody
          > tr:last-child
          > td {
          border-bottom: 0;
        }

        .results-table
          .ant-table-tbody
          > tr:hover
          > td {
          background: #f8fafc !important;
        }

        .results-table
          .ant-table-tbody
          > tr.results-row-passed
          > td:first-child {
          box-shadow: inset 2px 0 0 #5c9276;
        }

        /* ===================================================
           FIXED COLUMNS
        =================================================== */

        .results-table
          .ant-table-cell-fix-left,
        .results-table
          .ant-table-cell-fix-right {
          z-index: 2;
        }

        .results-table
          .ant-table-tbody
          > tr:hover
          > td.ant-table-cell-fix-left,
        .results-table
          .ant-table-tbody
          > tr:hover
          > td.ant-table-cell-fix-right {
          background: #f8fafc !important;
        }

        /* ===================================================
           STT
        =================================================== */

        .results-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-width: 28px;
          height: 28px;

          border-radius: 8px;

          background: #f5f7f9;

          color: #94a3b8;

          font-size: 11px;
          font-weight: 700;

          font-variant-numeric: tabular-nums;
        }

        /* ===================================================
           STUDENT
        =================================================== */

        .results-student-cell {
          min-width: 0;

          display: flex;
          align-items: center;
          gap: 12px;
        }

        .results-student-avatar {
          flex: 0 0 auto;

          background: #eef3f7;
          color: #5d7387;

          border: 1px solid #dfe7ed;
        }

        .results-student-info {
          min-width: 0;

          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .results-student-name {
          display: block;

          overflow: hidden;

          color: #1e293b !important;

          font-size: 14px;
          line-height: 1.35;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .results-student-code {
          display: block;

          color: #94a3b8;

          font-size: 11px;
          line-height: 1.2;
        }

        /* ===================================================
           SCORE COLUMN TITLE
        =================================================== */

        .results-score-column-title {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 2px;

          max-width: 110px;
        }

        .results-score-column-title span {
          overflow: hidden;

          max-width: 110px;

          color: #667585;

          font-size: 11px;
          font-weight: 700;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .results-score-column-title small {
          color: #a0aab5;

          font-size: 10px;
          font-weight: 600;

          letter-spacing: 0;
          text-transform: none;
        }

        /* ===================================================
           SCORE ITEM
        =================================================== */

        .results-item-score {
          display: inline-flex;
          align-items: baseline;
          justify-content: center;

          gap: 5px;

          min-width: 70px;
        }

        .results-item-score strong {
          color: #334155;

          font-size: 15px;
          font-weight: 700;

          font-variant-numeric: tabular-nums;
        }

        .results-item-score span {
          color: #a0aab5;

          font-size: 10px;
          font-weight: 500;
        }

        .results-score-empty {
          color: #c2cbd4;

          font-size: 17px;
          font-weight: 500;
        }

        /* ===================================================
           TOOLTIP
        =================================================== */

        .results-score-tooltip {
          display: flex;
          flex-direction: column;
          gap: 4px;

          font-size: 12px;
        }

        /* ===================================================
           FINAL SCORE
        =================================================== */

        .results-final-score {
          min-width: 80px;

          display: inline-flex;
          flex-direction: column;
          align-items: center;

          gap: 3px;
        }

        .results-final-score strong {
          font-size: 19px;
          line-height: 1.1;
          font-weight: 700;

          font-variant-numeric: tabular-nums;
        }

        .results-final-score span {
          display: inline-flex;
          align-items: center;

          gap: 4px;

          font-size: 10px;
          font-weight: 600;
        }

        .results-final-score.pass strong {
          color: #3f8f68;
        }

        .results-final-score.pass span {
          color: #3f8f68;
        }

        .results-final-score.fail strong {
          color: #c77a5e;
        }

        .results-final-score.fail span {
          color: #c77a5e;
        }

        .results-pending-tag {
          margin: 0;

          padding: 5px 9px;

          border: 0 !important;
          border-radius: 8px;

          background: #f4f6f8 !important;

          color: #8a97a6 !important;

          font-size: 10px;
          font-weight: 600;
        }

        /* ===================================================
           PROGRESS
        =================================================== */

        .results-progress {
          width: 125px;
          margin: 0 auto;
        }

        .results-progress-top {
          margin-bottom: 5px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 8px;
        }

        .results-progress-top span {
          color: #8a97a6;

          font-size: 10px;
        }

        .results-progress-top strong {
          color: #64748b;

          font-size: 10px;
          font-weight: 700;

          font-variant-numeric: tabular-nums;
        }

        .results-progress-main {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .results-progress-main .ant-progress {
          flex: 1;
          margin: 0;
        }

        .results-progress-main
          .ant-progress-inner {
          background: #e8edf2;
          border-radius: 20px;
        }

        .results-progress-main
          .ant-progress-bg {
          border-radius: 20px;
        }

        .results-progress-main > span {
          min-width: 28px;

          color: #64748b;

          font-size: 10px;
          font-weight: 600;

          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        /* ===================================================
           ACTION
        =================================================== */

        .results-table .ant-btn {
          box-shadow: none;
        }

        /* ===================================================
           SORTER
        =================================================== */

        .results-table
          .ant-table-column-sorter {
          color: #a7b1bb;
        }

        .results-table
          .ant-table-column-sorter-up.active,
        .results-table
          .ant-table-column-sorter-down.active {
          color: #173b5e;
        }

        /* ===================================================
           EMPTY
        =================================================== */

        .results-empty {
          min-height: 220px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 5px;
        }

        .results-empty-icon {
          width: 44px;
          height: 44px;

          margin-bottom: 5px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: #f4f6f8;

          color: #a6b0ba;

          font-size: 18px;
        }

        .results-empty strong {
          color: #475569;

          font-size: 13px;
        }

        .results-empty span {
          color: #94a3b8;

          font-size: 12px;
        }

        /* ===================================================
           LOADING
        =================================================== */

        .results-table
          .ant-spin-container {
          min-height: 120px;
        }

        /* ===================================================
           MOBILE
        =================================================== */

        @media (max-width: 768px) {
          .results-table-wrapper {
            border-radius: 14px;
          }

          .results-table
            .ant-table-thead
            > tr
            > th {
            height: 48px;
            padding: 0 12px;
          }

          .results-table
            .ant-table-tbody
            > tr
            > td {
            height: 70px;
            padding: 9px 12px;
          }

          .results-student-avatar {
            width: 38px;
            height: 38px;
          }

          .results-student-name {
            max-width: 180px;
            font-size: 13px;
          }

          .results-student-code {
            font-size: 10px;
          }

          .results-item-score strong {
            font-size: 14px;
          }

          .results-final-score strong {
            font-size: 18px;
          }
        }

        @media (max-width: 480px) {
          .results-student-name {
            max-width: 145px;
          }

          .results-progress {
            width: 115px;
          }
        }
      `}</style>
    </>
  );
};

export default ResultsTable;
