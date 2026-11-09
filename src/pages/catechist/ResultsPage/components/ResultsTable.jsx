import React, { useMemo } from "react";

import { Avatar, Progress, Tag, Tooltip, Typography } from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  UserOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";

import AppButton from "../../../../components/common/AppButton";
import AppTable from "../../../../components/common/AppTable";

import { formatScore } from "../../../../utils/resultsUtils";

const { Text } = Typography;

// =========================================================
// HELPERS
// =========================================================

const normalizeSemester = (value) => {
  const note = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    note.includes("hoc ky 1") ||
    note.includes("hk1") ||
    note.includes("hk 1")
  ) {
    return "Học kỳ 1";
  }

  if (
    note.includes("hoc ky 2") ||
    note.includes("hk2") ||
    note.includes("hk 2")
  ) {
    return "Học kỳ 2";
  }

  return value || "";
};

// =========================================================
// COMPONENT
// =========================================================

const ResultsTable = ({
  data = [],
  rule,
  loading = false,
  currentPage = 1,
  pageSize = 10,
  onView,
  onExportStudent,
  exportingStudentId = null,
}) => {
  const roundingDigits = Number(rule?.rounding_digits ?? 1);
  const passScore = Number(rule?.pass_score ?? 5);

  // =======================================================
  // COLUMNS
  // =======================================================

  const columns = useMemo(() => {
    const resultColumns = [];

    // -----------------------------------------------------
    // STT
    // -----------------------------------------------------

    resultColumns.push({
      title: "STT",
      width: 52,
      align: "center",

      render: (_, __, index) => {
        const number = (currentPage - 1) * pageSize + index + 1;

        return (
          <span className="results-index">
            {String(number).padStart(2, "0")}
          </span>
        );
      },
    });

    // -----------------------------------------------------
    // HỌC VIÊN
    // -----------------------------------------------------

    resultColumns.push({
      title: "Học viên",
      key: "student",

      width: 220,

      render: (_, record) => (
        <div className="results-student-cell">
          <Avatar
            size={34}
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
    });

    // -----------------------------------------------------
    // CÁC THÀNH PHẦN ĐIỂM
    // -----------------------------------------------------

    (rule?.items || []).forEach((ruleItem) => {
      resultColumns.push({
        title: (
          <div className="results-score-column-title">
            <span>{ruleItem.name}</span>
          </div>
        ),

        key: `item-${ruleItem.id}`,
        width: 105,
        align: "center",

        render: (_, record) => {
          const items = (record.itemScores || []).filter(
            (value) =>
              Number(value.ruleItemId) === Number(ruleItem.id) &&
              value.score !== null &&
              value.score !== undefined,
          );

          if (!items.length) {
            return <span className="results-score-empty">—</span>;
          }

          return (
            <div className="results-score-list">
              {items.map((item, index) => {
                const semester = normalizeSemester(item.note);

                return (
                  <Tooltip
                    key={item.id || `${ruleItem.id}-${index}`}
                    title={
                      <div className="results-score-tooltip">
                        <div>
                          Đầu điểm: <strong>{ruleItem.name}</strong>
                        </div>

                        <div>
                          Điểm:{" "}
                          <strong>
                            {formatScore(item.score, roundingDigits)}
                          </strong>
                        </div>

                        <div>
                          Học kỳ: <strong>{semester || "Chưa xác định"}</strong>
                        </div>
                      </div>
                    }
                  >
                    <div className="results-score-entry">
                      <strong>{formatScore(item.score, roundingDigits)}</strong>

                      {semester && (
                        <Tag
                          bordered={false}
                          className={`results-item-semester ${
                            semester === "Học kỳ 1"
                              ? "semester-one"
                              : semester === "Học kỳ 2"
                                ? "semester-two"
                                : ""
                          }`}
                        >
                          {semester}
                        </Tag>
                      )}
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          );
        },
      });
    });

    // -----------------------------------------------------
    // ĐIỂM TỔNG KẾT
    // -----------------------------------------------------

    resultColumns.push({
      title: "Tổng kết",
      key: "final-score",
      width: 110,
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

    // -----------------------------------------------------
    // TIẾN ĐỘ
    // -----------------------------------------------------

    resultColumns.push({
      title: "Tiến độ",
      key: "progress",
      width: 120,
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

    // -----------------------------------------------------
    // ACTION
    // -----------------------------------------------------

    // -----------------------------------------------------
    // ACTION
    // -----------------------------------------------------

    resultColumns.push({
      title: "Thao tác",
      key: "action",
      width: 90,
      fixed: "right",
      align: "center",

      render: (_, record) => {
        const studentId = Number(record.student_id || record.id);

        const isExporting = Number(exportingStudentId) === studentId;

        return (
          <div className="results-action-group">
            <Tooltip title="Xuất bảng điểm Excel">
              <AppButton
                icon={<FileExcelOutlined />}
                size="small"
                variant="secondary"
                loading={isExporting}
                disabled={Boolean(exportingStudentId) && !isExporting}
                onClick={() => onExportStudent?.(record)}
              />
            </Tooltip>

            <Tooltip title="Xem chi tiết">
              <AppButton
                icon={<EyeOutlined />}
                size="small"
                variant="secondary"
                onClick={() => onView?.(record)}
              />
            </Tooltip>
          </div>
        );
      },
    });

    return resultColumns;
  }, [
    rule,
    currentPage,
    pageSize,
    onView,
    onExportStudent,
    exportingStudentId,
    passScore,
    roundingDigits,
  ]);
  // =========================================================
  // TABLE WIDTH
  // =========================================================
  const scrollWidth =
    52 + 220 + (rule?.items?.length || 0) * 100 + 110 + 120 + 90;
  // =========================================================
  // RENDER
  // =========================================================

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
          size="small"
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
        .results-table-wrapper {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(23, 59, 94, 0.035);
        }

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

        /* HEADER */

        .results-table .ant-table-thead > tr > th {
          height: 46px;
          padding: 0 10px;
          background: #fbfcfd !important;
          color: #7b8794;
          border-bottom: 1px solid #e7ebef;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.025em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .results-table .ant-table-thead > tr > th.ant-table-cell-fix-left,
        .results-table .ant-table-thead > tr > th.ant-table-cell-fix-right {
          background: #fbfcfd !important;
        }

        /* BODY */

        .results-table .ant-table-tbody > tr > td {
          height: 66px;
          padding: 7px 10px;
          background: #ffffff;
          border-bottom: 1px solid #f0f2f5;
          transition: background 0.18s ease, box-shadow 0.18s ease;
        }

        .results-table .ant-table-tbody > tr:last-child > td {
          border-bottom: 0;
        }

        .results-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }

        .results-table .ant-table-tbody > tr.results-row-passed > td:first-child {
          box-shadow: inset 2px 0 0 #5c9276;
        }

        /* FIXED */

        .results-table .ant-table-cell-fix-left,
        .results-table .ant-table-cell-fix-right {
          z-index: 2;
        }

        .results-table .ant-table-tbody > tr:hover > td.ant-table-cell-fix-left,
        .results-table .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right {
          background: #f8fafc !important;
        }

        /* STT */

        .results-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 26px;
          height: 26px;
          border-radius: 7px;
          background: #f5f7f9;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        /* STUDENT */

        .results-student-cell {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .results-student-avatar {
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          background: #eef3f7;
          color: #5d7387;
          border: 1px solid #dfe7ed;
        }

        .results-student-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .results-student-name {
          display: block;
          max-width: 155px;
          overflow: hidden;
          color: #1e293b !important;
          font-size: 12px;
          line-height: 1.3;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .results-student-code {
          display: block;
          color: #94a3b8;
          font-size: 9px;
          line-height: 1.2;
          white-space: nowrap;
        }

        /* SCORE TITLE */

        .results-score-column-title {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
          max-width: 85px;
        }

        .results-score-column-title span {
          display: block;
          max-width: 85px;
          overflow: hidden;
          color: #667585;
          font-size: 10px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* SCORE ITEM */

        .results-item-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          min-width: 65px;
        }

        .results-item-score strong {
          color: #334155;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.2;
          font-variant-numeric: tabular-nums;
        }

        .results-score-empty {
          color: #c2cbd4;
          font-size: 15px;
          font-weight: 500;
        }

        .results-item-semester {
          margin: 0;
          padding: 2px 6px;
          border: 0 !important;
          border-radius: 5px;
          font-size: 8px;
          font-weight: 600;
          line-height: 1.5;
          white-space: nowrap;
        }

        .results-item-semester.semester-one {
          background: #eaf2fb !important;
          color: #173b5e !important;
        }

        .results-item-semester.semester-two {
          background: #fff5df !important;
          color: #a66b12 !important;
        }

        .results-score-tooltip {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 11px;
        }

        /* FINAL SCORE */

        .results-final-score {
          min-width: 65px;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .results-final-score strong {
          font-size: 16px;
          line-height: 1.1;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .results-final-score span {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 9px;
          font-weight: 600;
        }

        .results-final-score.pass strong,
        .results-final-score.pass span {
          color: #3f8f68;
        }

        .results-final-score.fail strong,
        .results-final-score.fail span {
          color: #c77a5e;
        }

        .results-pending-tag {
          margin: 0;
          padding: 4px 6px;
          border: 0 !important;
          border-radius: 7px;
          background: #f4f6f8 !important;
          color: #8a97a6 !important;
          font-size: 8px;
          font-weight: 600;
          white-space: nowrap;
        }

        /* PROGRESS */

        .results-progress {
          width: 100px;
          margin: 0 auto;
        }

        .results-progress-top {
          margin-bottom: 3px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 5px;
        }

        .results-progress-top span {
          color: #8a97a6;
          font-size: 8px;
        }

        .results-progress-top strong {
          color: #64748b;
          font-size: 9px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .results-progress-main {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .results-progress-main .ant-progress {
          flex: 1;
          margin: 0;
        }

        .results-progress-main .ant-progress-inner {
          background: #e8edf2;
          border-radius: 20px;
        }

        .results-progress-main .ant-progress-bg {
          border-radius: 20px;
        }

        .results-progress-main > span {
          min-width: 23px;
          color: #64748b;
          font-size: 8px;
          font-weight: 600;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        /* ACTION */

        .results-table .ant-btn {
          box-shadow: none;
        }

        /* SORTER */

        .results-table .ant-table-column-sorter {
          color: #a7b1bb;
        }

        .results-table .ant-table-column-sorter-up.active,
        .results-table .ant-table-column-sorter-down.active {
          color: #173b5e;
        }

        /* EMPTY */

        .results-empty {
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .results-empty-icon {
          width: 42px;
          height: 42px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #f4f6f8;
          color: #a6b0ba;
          font-size: 17px;
        }

        .results-empty strong {
          color: #475569;
          font-size: 12px;
        }

        .results-empty span {
          color: #94a3b8;
          font-size: 11px;
        }

        /* LOADING */

        .results-table .ant-spin-container {
          min-height: 110px;
        }

        /* DESKTOP */

        @media (min-width: 1200px) {
          .results-table .ant-table-thead > tr > th {
            padding: 0 8px;
          }

          .results-table .ant-table-tbody > tr > td {
            padding: 6px 8px;
          }
        }

        /* TABLET */

        @media (max-width: 1100px) {
          .results-student-name {
            max-width: 130px;
          }

          .results-progress {
            width: 90px;
          }
        }

        /* MOBILE */

        @media (max-width: 768px) {
          .results-table-wrapper {
            border-radius: 12px;
          }

          .results-table .ant-table-thead > tr > th {
            height: 44px;
            padding: 0 7px;
            font-size: 9px;
          }

          .results-table .ant-table-tbody > tr > td {
            height: 62px;
            padding: 6px 7px;
          }

          .results-student-avatar {
            width: 32px;
            height: 32px;
          }

          .results-student-name {
            max-width: 120px;
            font-size: 11px;
          }

          .results-student-code {
            font-size: 8px;
          }

          .results-item-score strong {
            font-size: 13px;
          }

          .results-item-semester {
            font-size: 7px;
            padding: 2px 5px;
          }

          .results-final-score strong {
            font-size: 15px;
          }

          .results-progress {
            width: 85px;
          }
        }

        /* SMALL MOBILE */

        @media (max-width: 480px) {
          .results-student-name {
            max-width: 105px;
          }

          .results-progress {
            width: 80px;
          }
        }

.results-score-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 65px;
}

.results-score-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 100%;
  padding: 5px 2px;
  border-bottom: 1px dashed #e8edf2;
}

.results-score-entry:last-child {
  border-bottom: 0;
}

.results-score-entry strong {
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.results-item-semester {
  margin: 0;
  padding: 2px 6px;
  border: 0 !important;
  border-radius: 5px;
  font-size: 8px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

.results-item-semester.semester-one {
  background: #eaf2fb !important;
  color: #173b5e !important;
}

.results-item-semester.semester-two {
  background: #fff5df !important;
  color: #a66b12 !important;
}

.results-score-empty {
  color: #c2cbd4;
  font-size: 15px;
}
.results-action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.results-action-group .ant-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border-radius: 7px;
  transition: all 0.2s ease;
}

.results-action-group .ant-btn:first-child {
  color: #2e7d5b;
}

.results-action-group .ant-btn:first-child:hover {
  color: #ffffff !important;
  background: #2e7d5b !important;
  border-color: #2e7d5b !important;
}

.results-action-group .ant-btn:last-child:hover {
  color: #173b5e;
  border-color: #173b5e;
}
      `}</style>
    </>
  );
};

export default ResultsTable;
