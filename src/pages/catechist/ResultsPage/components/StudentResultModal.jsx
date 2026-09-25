import React, { useMemo } from "react";

import {
  Avatar,
  Button,
  Card,
  Divider,
  Empty,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";

import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  FormOutlined,
  TrophyOutlined,
  UserOutlined,
  DesktopOutlined,
} from "@ant-design/icons";

import {
  calculateStudentScore,
  formatDate,
  formatScore,
  getResultStatus,
} from "../../../../utils/resultsUtils";

const { Text } = Typography;

const StudentResultModal = ({
  open,
  onClose,
  student,
  results = [],
  rule,
  loading = false,
  onEdit,
  onDelete,
  deletingId,
}) => {
  const calculation = useMemo(
    () => calculateStudentScore(results, rule),
    [results, rule],
  );

  const status = getResultStatus(calculation.score, rule);

  const detailColumns = [
    {
      title: "#",
      width: 50,
      align: "center",

      render: (_, __, index) => index + 1,
    },

    {
      title: "Đầu điểm",
      width: 190,

      render: (_, record) => {
        const item = rule?.items?.find(
          (value) => Number(value.id) === Number(record.grading_rule_item_id),
        );

        return (
          <div>
            <Text strong>{item?.name || record.item_name || "Đầu điểm"}</Text>

            <span className="results-detail-item-meta">
              Hệ số {item?.weight || record.item_weight || 1}
            </span>
          </div>
        );
      },
    },

    {
      title: "Ngày",
      dataIndex: "exam_date",
      width: 110,

      render: (value) => formatDate(value),
    },

    {
      title: "Hình thức",
      dataIndex: "exam_type",
      width: 120,

      render: (value) =>
        value === "online" ? (
          <Tag icon={<DesktopOutlined />} color="blue" bordered={false}>
            Online
          </Tag>
        ) : (
          <Tag icon={<FormOutlined />} bordered={false}>
            Bài giấy
          </Tag>
        ),
    },

    {
      title: "Điểm",
      dataIndex: "score",
      width: 90,
      align: "center",

      render: (value) => (
        <strong className="results-detail-score-value">
          {formatScore(value, 1)}
        </strong>
      ),
    },

    {
      title: "Ghi chú",
      dataIndex: "note",
      ellipsis: true,

      render: (value) => value || "—",
    },

    {
      title: "",
      width: 90,
      align: "right",

      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="Sửa">
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa kết quả này?"
            description="Dữ liệu điểm sẽ bị xóa vĩnh viễn."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
              loading: deletingId === record.id,
            }}
            onConfirm={() => onDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={950}
      destroyOnClose
      className="student-result-modal"
      title={null}
    >
      <div className="student-result-modal-header">
        <div className="student-result-profile">
          <Avatar size={58} icon={<UserOutlined />} />

          <div>
            <div className="student-result-name">
              {student?.name || student?.full_name || "Học viên"}
            </div>

            <div className="student-result-code">
              {student?.code || `HS #${student?.id}`}
            </div>
          </div>
        </div>

        <div className="student-result-final">
          <span>Điểm tổng kết</span>

          {calculation.score === null ? (
            <strong className="pending">—</strong>
          ) : (
            <strong className={status.key}>
              {formatScore(calculation.score, rule?.rounding_digits ?? 1)}
            </strong>
          )}

          <Tag
            bordered={false}
            className={`student-result-status ${status.key}`}
          >
            {status.label}
          </Tag>
        </div>
      </div>

      <Divider />

      {rule && (
        <Card bordered={false} className="student-result-calculation">
          <div className="student-result-calculation-heading">
            <TrophyOutlined />

            <div>
              <strong>Công thức tính điểm</strong>

              <span>
                {rule.calculation_type === "weighted_average"
                  ? "Trung bình có hệ số"
                  : rule.calculation_type}
              </span>
            </div>
          </div>

          <div className="student-result-calculation-items">
            {calculation.itemScores.map((item, index) => (
              <React.Fragment key={item.ruleItemId}>
                <div className="student-result-calculation-item">
                  <span>{item.name}</span>

                  <strong>
                    {item.score === null ? "—" : formatScore(item.score, 1)}
                  </strong>

                  <small>× {item.weight}</small>
                </div>

                {index < calculation.itemScores.length - 1 && (
                  <span className="student-result-plus">+</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {rule.calculation_type === "weighted_average" && (
            <div className="student-result-calculation-result">
              <span>Tổng điểm có trọng số</span>

              <strong>{formatScore(calculation.weightedTotal, 2)}</strong>

              <span>
                ÷ tổng hệ số {formatScore(calculation.totalWeight, 1)}
              </span>
            </div>
          )}
        </Card>
      )}

      <div className="student-result-section-title">
        <div>
          <FileTextOutlined />

          <span>Lịch sử điểm</span>
        </div>

        <span>{results.length} lần nhập</span>
      </div>

      <Table
        columns={detailColumns}
        dataSource={results}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 8,
          hideOnSinglePage: true,
        }}
        size="small"
        scroll={{
          x: 750,
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có kết quả"
            />
          ),
        }}
      />
    </Modal>
  );
};

export default StudentResultModal;
