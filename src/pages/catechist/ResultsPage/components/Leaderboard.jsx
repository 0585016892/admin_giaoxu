import React from "react";

import { Avatar, Empty, Table, Tag, Typography } from "antd";

import { CrownOutlined, UserOutlined } from "@ant-design/icons";

import { formatScore } from "../../../../utils/resultsUtils";

const { Text } = Typography;

const Leaderboard = ({ data = [], rule }) => {
  const columns = [
    {
      title: "Hạng",
      key: "rank",
      width: 80,
      align: "center",

      render: (_, record) => {
        if (!record.rank) {
          return "—";
        }

        if (record.rank <= 3) {
          return (
            <div className="leaderboard-rank-top">
              <CrownOutlined />

              <strong>{record.rank}</strong>
            </div>
          );
        }

        return <strong>{record.rank}</strong>;
      },
    },

    {
      title: "Học viên",
      key: "student",

      render: (_, record) => (
        <div className="leaderboard-student">
          <Avatar size={36} icon={<UserOutlined />} />

          <div>
            <Text strong>{record.student_name}</Text>

            <span>{record.student_code || `HS #${record.student_id}`}</span>
          </div>
        </div>
      ),
    },

    {
      title: "Tiến độ",
      key: "progress",
      width: 130,
      align: "center",

      render: (_, record) => (
        <span>
          {record.completedItems}/{record.totalItems}
        </span>
      ),
    },

    {
      title: "Điểm tổng kết",
      key: "score",
      width: 160,
      align: "center",

      render: (_, record) => {
        if (record.score === null) {
          return <Tag bordered={false}>Chưa đủ điểm</Tag>;
        }

        return (
          <strong className="leaderboard-score">
            {formatScore(record.score, rule?.rounding_digits ?? 1)}
          </strong>
        );
      },
    },
  ];

  return (
    <div className="leaderboard">
      <div className="leaderboard-heading">
        <div>
          <CrownOutlined />

          <div>
            <strong>Bảng xếp hạng</strong>

            <span>Xếp theo điểm tổng kết sau khi áp dụng hệ số</span>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="student_id"
        pagination={false}
        size="small"
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
  );
};

export default Leaderboard;
