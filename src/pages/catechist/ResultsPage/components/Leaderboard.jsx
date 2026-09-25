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
        width: 80,
        align: "center",

        render: (_, record, index) => {
          const rank = record.rank || index + 1;

          if (rank <= 3) {
            return (
              <div className={`leaderboard-rank rank-${rank}`}>
                <CrownOutlined />

                <strong>{rank}</strong>
              </div>
            );
          }

          return <span className="leaderboard-rank-normal">{rank}</span>;
        },
      },

      // =====================================================
      // STUDENT
      // =====================================================

      {
        title: "Học viên",
        key: "student",
        width: 280,

        render: (_, record) => (
          <div className="leaderboard-student">
            <Avatar
              size={38}
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
        width: 180,

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
                trailColor="#E9EEF3"
              />
            </div>
          );
        },
      },

      // =====================================================
      // FINAL SCORE
      // =====================================================

      {
        title: "Điểm tổng kết",
        key: "score",
        width: 160,
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
        width: 65,
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
    <div className="leaderboard">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="leaderboard-heading">
        <div className="leaderboard-heading-main">
          <div className="leaderboard-heading-icon">
            <CrownOutlined />
          </div>

          <div>
            <strong>Bảng xếp hạng</strong>

            <span>Xếp theo điểm tổng kết sau khi áp dụng hệ số</span>
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
  );
};

export default Leaderboard;
