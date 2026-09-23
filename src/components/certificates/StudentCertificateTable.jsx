import React from "react";
import { Table, Select, Tag, Empty, Tooltip } from "antd";
import { EyeOutlined, UserOutlined } from "@ant-design/icons";
import AppButton from "../../components/common/AppButton";

const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  gold: "#D9A441",
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#173B5E",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  navyLight: "#EEF3F7",
  success: "#2E7D5B",
  successBg: "#EAF6F0",
};

const RANK_OPTIONS = [
  { value: "Xuất Sắc", label: "Xuất Sắc" },
  { value: "Giỏi", label: "Giỏi" },
  { value: "Khá", label: "Khá" },
  { value: "Trung Bình", label: "Trung Bình" },
  { value: "Đạt", label: "Đạt" },
];

const StudentCertificateTable = ({
  students = [],
  loading = false,
  selectedStudentKey,
  onRankChange,
  onPreview,
}) => {
  const columns = [
    {
      title: "#",
      width: 50,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã học sinh",
      dataIndex: "code",
      width: 120,
      render: (value) => (
        <span style={{ fontWeight: 600, color: COLORS.navy }}>
          {value || "—"}
        </span>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      width: 220,
      render: (value, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: COLORS.navyLight,
              color: COLORS.navy,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            <UserOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 13 }}>
              {value || "Chưa có tên"}
            </div>
            {record.godName && (
              <div style={{ fontSize: 11, color: COLORS.textSecondary }}>
                {record.godName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      width: 110,
      align: "center",
      render: (value) => (
        <span style={{ fontSize: 13, color: COLORS.textSecondary }}>
          {value || "—"}
        </span>
      ),
    },
    {
      title: "Xếp loại cấp chứng chỉ",
      dataIndex: "rank",
      width: 200,
      render: (value, record) => (
        <Select
          size="middle"
          value={value || undefined}
          placeholder="Chọn xếp loại..."
          options={RANK_OPTIONS}
          style={{ width: "100%" }}
          onChange={(rank) => onRankChange(record._key, rank)}
        />
      ),
    },
    {
      title: "Trạng thái",
      width: 110,
      align: "center",
      render: (_, record) => {
        if (!record.rank) {
          return (
            <Tag style={{ borderRadius: 4, fontSize: 11 }}>Chưa xếp loại</Tag>
          );
        }
        return (
          <Tag
            color="success"
            style={{
              borderRadius: 4,
              fontSize: 11,
              background: COLORS.successBg,
              color: COLORS.success,
              border: "none",
            }}
          >
            Đã chọn
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const isSelected = selectedStudentKey === record._key;
        return (
          <Tooltip title="Xem trước chứng chỉ">
            <AppButton
              type={isSelected ? "primary" : "default"}
              icon={<EyeOutlined />}
              onClick={() => onPreview(record)}
              size="small"
              style={
                isSelected
                  ? { backgroundColor: COLORS.navy, borderColor: COLORS.navy }
                  : {}
              }
            />
          </Tooltip>
        );
      },
    },
  ];

  if (!loading && students.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Lớp chưa có học sinh"
        style={{ margin: "32px 0" }}
      />
    );
  }

  return (
    <>
      <style>{`
        .student-cert-table .ant-table-thead > tr > th {
          background: ${COLORS.background} !important;
          color: ${COLORS.navy} !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          border-bottom: 1px solid ${COLORS.border} !important;
        }
        .student-cert-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${COLORS.border} !important;
          padding: 10px 16px !important;
        }
        .student-cert-table .ant-table-tbody > tr:hover > td {
          background-color: ${COLORS.navyLight} !important;
        }
        .cert-row-selected > td {
          background-color: ${COLORS.navyLight} !important;
        }
      `}</style>

      <Table
        rowKey="_key"
        loading={loading}
        columns={columns}
        dataSource={students}
        className="student-cert-table"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total) => `Tổng ${total} học sinh`,
        }}
        scroll={{ x: 1000 }}
        rowClassName={(record) =>
          selectedStudentKey === record._key ? "cert-row-selected" : ""
        }
      />
    </>
  );
};

export { RANK_OPTIONS };
export default StudentCertificateTable;
