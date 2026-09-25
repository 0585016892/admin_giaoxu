import React, { useMemo } from "react";

import { Avatar, Progress, Space, Table, Tag, Tooltip, Typography } from "antd";

import {
  CheckCircleOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";

import AppButton from "../../../../components/common/AppButton";

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
        width: 60,
        fixed: "left",
        align: "center",

        render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      },

      // =====================================================
      // HỌC VIÊN
      // =====================================================

      {
        title: "Học viên",
        key: "student",
        width: 260,
        fixed: "left",

        render: (_, record) => (
          <Space size={10} className="results-student-cell">
            <Avatar
              size={40}
              icon={<UserOutlined />}
              className="results-student-avatar"
            />

            <div className="results-student-info">
              <Text strong className="results-student-name">
                {record.student_name || "Chưa cập nhật"}
              </Text>

              <Text className="results-student-code">
                {record.student_code || `HS #${record.student_id}`}
              </Text>
            </div>
          </Space>
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

        width: 130,

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
                <div>
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
      width: 150,
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
      width: 125,
      align: "center",

      render: (_, record) => {
        const total = Number(record.totalItems ?? 0);

        const completed = Number(record.completedItems ?? 0);

        const percent =
          total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

        return (
          <div className="results-progress">
            <div className="results-progress-bar">
              <Progress
                percent={percent}
                size="small"
                showInfo={false}
                strokeColor="#173B5E"
                trailColor="#E9EEF3"
              />
            </div>

            <span>
              {completed}/{total}
            </span>
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
      width: 65,
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

  return (
    <Table
      className="results-table"
      rowKey={(record) => record.student_id}
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      size="middle"
      scroll={{
        x: 60 + 260 + (rule?.items?.length || 0) * 130 + 150 + 125 + 65,
      }}
      locale={{
        emptyText: "Chưa có học viên phù hợp",
      }}
    />
  );
};

export default ResultsTable;
