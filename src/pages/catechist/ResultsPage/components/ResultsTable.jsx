import React, { useMemo } from "react";

import {
  Avatar,
  Button,
  Progress,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";

import { EyeOutlined, UserOutlined } from "@ant-design/icons";

import { formatScore } from "../../../../utils/resultsUtils";

const { Text } = Typography;

const ResultsTable = ({
  data = [],
  rule,
  loading = false,
  currentPage,
  pageSize,
  onView,
}) => {
  const columns = useMemo(() => {
    const columns = [
      {
        title: "STT",
        width: 60,
        fixed: "left",
        align: "center",

        render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      },

      {
        title: "Học viên",
        key: "student",
        width: 260,
        fixed: "left",

        render: (_, record) => (
          <Space size={10}>
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{
                background: "#EEF3F7",
                color: "#173B5E",
              }}
            />

            <div>
              <Text
                strong
                style={{
                  display: "block",
                  color: "#1E293B",
                }}
              >
                {record.student_name}
              </Text>

              <Text
                style={{
                  fontSize: 11,
                  color: "#94A3B8",
                }}
              >
                {record.student_code || `HS #${record.student_id}`}
              </Text>
            </div>
          </Space>
        ),
      },
    ];

    (rule?.items || []).forEach((ruleItem) => {
      columns.push({
        title: (
          <div className="results-score-column-title">
            <span>{ruleItem.name}</span>

            <small>Hệ số {Number(ruleItem.weight).toFixed(1)}</small>
          </div>
        ),

        key: `item-${ruleItem.id}`,

        width: 130,

        align: "center",

        render: (_, record) => {
          const item = record.itemScores?.find(
            (value) => Number(value.ruleItemId) === Number(ruleItem.id),
          );

          if (!item || item.score === null) {
            return <span className="results-score-empty">—</span>;
          }

          return (
            <Tooltip
              title={`Điểm ${formatScore(item.score, 1)} × hệ số ${
                ruleItem.weight
              }`}
            >
              <div className="results-item-score">
                <strong>{formatScore(item.score, 1)}</strong>

                <span>× {ruleItem.weight}</span>
              </div>
            </Tooltip>
          );
        },
      });
    });

    columns.push(
      {
        title: "Điểm tổng kết",
        key: "final-score",
        width: 145,
        align: "center",

        sorter: (a, b) => Number(a.score || 0) - Number(b.score || 0),

        render: (_, record) => {
          if (record.score === null) {
            return (
              <Tag bordered={false} className="results-pending-tag">
                Chưa đủ điểm
              </Tag>
            );
          }

          const score = Number(record.score);

          const pass = Number(rule?.pass_score || 5);

          if (score < pass) {
            return (
              <div className="results-final-score fail">
                <strong>
                  {formatScore(score, rule?.rounding_digits ?? 1)}
                </strong>

                <span>Chưa đạt</span>
              </div>
            );
          }

          if (score >= 8) {
            return (
              <div className="results-final-score good">
                <strong>
                  {formatScore(score, rule?.rounding_digits ?? 1)}
                </strong>

                <span>Giỏi</span>
              </div>
            );
          }

          return (
            <div className="results-final-score pass">
              <strong>{formatScore(score, rule?.rounding_digits ?? 1)}</strong>

              <span>Đạt</span>
            </div>
          );
        },
      },

      {
        title: "Tiến độ",
        key: "progress",
        width: 125,
        align: "center",

        render: (_, record) => {
          const total = Number(record.totalItems || 0);

          const completed = Number(record.completedItems || 0);

          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div className="results-progress">
              <Progress
                percent={percent}
                size="small"
                showInfo={false}
                strokeColor="#173B5E"
              />

              <span>
                {completed}/{total}
              </span>
            </div>
          );
        },
      },

      {
        title: "",
        key: "action",
        width: 65,
        fixed: "right",
        align: "center",

        render: (_, record) => (
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              className="results-view-button"
            />
          </Tooltip>
        ),
      },
    );

    return columns;
  }, [rule, currentPage, pageSize, onView]);

  return (
    <Table
      className="results-table"
      rowKey="student_id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      scroll={{
        x: 1000 + (rule?.items?.length || 0) * 130,
      }}
      locale={{
        emptyText: "Chưa có học viên phù hợp",
      }}
    />
  );
};

export default ResultsTable;
