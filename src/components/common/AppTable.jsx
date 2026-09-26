import React, { memo } from "react";
import { Table, Empty, Spin } from "antd";

const AppTable = memo(function AppTable({
  loading = false,
  columns = [],
  dataSource = [],
  rowKey = "id",

  // Row selection
  rowSelection,

  // Pagination
  pagination = false,

  // Empty state
  emptyText = "Chưa có dữ liệu",

  // Scroll
  scrollX = 1000,
  scrollY,

  // Table
  bordered = false,
  size = "middle",
  className,
  style,
  rowClassName,

  ...restProps
}) {
  return (
    <Table
      rowKey={rowKey}
      loading={{
        spinning: loading,
        indicator: <Spin size="large" />,
      }}
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
      rowSelection={rowSelection}
      bordered={bordered}
      size={size}
      className={className}
      style={style}
      rowClassName={rowClassName}
      scroll={{
        x: scrollX,
        ...(scrollY ? { y: scrollY } : {}),
      }}
      locale={{
        emptyText:
          typeof emptyText === "string" ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyText}
            />
          ) : (
            emptyText
          ),
      }}
      {...restProps}
    />
  );
});

export default AppTable;
