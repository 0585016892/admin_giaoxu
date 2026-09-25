import React, { useMemo } from "react";

import {
  Button,
  Card,
  Empty,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";

import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import {
  getAggregationLabel,
  getTotalMaxScore,
  getTotalWeight,
  formatWeight,
} from "../../../../utils/gradingRuleUtils";

const GradingRuleItems = ({
  items = [],
  disabled = false,
  onChange,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const normalizedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
      ),
    [items],
  );

  const totalWeight = getTotalWeight(normalizedItems);

  const totalMaxScore = getTotalMaxScore(normalizedItems);

  const handleDelete = (item) => {
    if (onDelete) {
      onDelete(item);
      return;
    }

    const nextItems = normalizedItems.filter((current) => {
      if (item.id && current.id) {
        return current.id !== item.id;
      }

      return current.code !== item.code;
    });

    onChange?.(nextItems);
  };

  const columns = [
    {
      title: "",
      key: "drag",
      width: 44,
      render: () => <HolderOutlined className="grading-rule-drag-icon" />,
    },

    {
      title: "#",
      key: "index",
      width: 55,
      render: (_, __, index) => index + 1,
    },

    {
      title: "Thành phần",
      key: "name",
      render: (_, record) => (
        <div>
          <div className="grading-rule-item-name">{record.name}</div>

          <div className="grading-rule-item-code">{record.code}</div>
        </div>
      ),
    },

    {
      title: "Trọng số",
      dataIndex: "weight",
      key: "weight",
      width: 110,
      align: "center",
      render: (value) => <Tag>{formatWeight(value)}</Tag>,
    },

    {
      title: "Điểm tối đa",
      dataIndex: "max_score",
      key: "max_score",
      width: 120,
      align: "center",
      render: (value) => Number(value).toFixed(1),
    },

    {
      title: "Nhiều lần",
      dataIndex: "allow_multiple",
      key: "allow_multiple",
      width: 110,
      align: "center",
      render: (value) =>
        Number(value) === 1 ? <Tag color="blue">Có</Tag> : <Tag>Không</Tag>,
    },

    {
      title: "Khi có nhiều điểm",
      dataIndex: "aggregation_method",
      key: "aggregation_method",
      width: 150,
      render: (value) => getAggregationLabel(value),
    },

    {
      title: "",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              disabled={disabled}
              onClick={() => onEdit?.(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa thành phần này?"
            description="Thành phần chỉ được xóa khỏi cấu hình hiện tại."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
            }}
            onConfirm={() => handleDelete(record)}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={disabled}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card className="grading-rule-items-card" bordered={false}>
      <div className="grading-rule-items-header">
        <div>
          <div className="grading-rule-section-title">Thành phần điểm</div>

          <div className="grading-rule-section-description">
            Khai báo các đầu điểm được sử dụng trong quy tắc.
          </div>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          disabled={disabled}
        >
          Thêm thành phần
        </Button>
      </div>

      {normalizedItems.length === 0 ? (
        <div className="grading-rule-items-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span>Chưa có thành phần điểm</span>}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
            disabled={disabled}
          >
            Thêm thành phần đầu tiên
          </Button>
        </div>
      ) : (
        <>
          <div className="grading-rule-items-table">
            <Table
              rowKey={(record) => record.id || record.code}
              columns={columns}
              dataSource={normalizedItems}
              pagination={false}
              scroll={{
                x: 1000,
              }}
              size="middle"
            />
          </div>

          <div className="grading-rule-items-summary">
            <div className="grading-rule-items-summary-item">
              <span>Thành phần</span>
              <strong>{normalizedItems.length}</strong>
            </div>

            <div className="grading-rule-items-summary-item">
              <span>Tổng trọng số</span>
              <strong>{formatWeight(totalWeight)}</strong>
            </div>

            <div className="grading-rule-items-summary-item">
              <span>Tổng điểm tối đa</span>
              <strong>{Number(totalMaxScore).toFixed(1)}</strong>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default GradingRuleItems;
