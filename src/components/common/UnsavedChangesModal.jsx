import React from "react";

import { Modal, Space, Typography } from "antd";

import {
  ExclamationCircleOutlined,
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import AppButton from "./AppButton";
const { Text, Paragraph } = Typography;

export default function UnsavedChangesModal({
  open = false,
  changedCount = 0,
  loading = false,
  onCancel,
  onLeave,
  onSaveAndLeave,
}) {
  return (
    <Modal
      open={open}
      centered
      width={500}
      title={
        <Space size={10}>
          <ExclamationCircleOutlined
            style={{
              color: "#D9A441",
              fontSize: 22,
            }}
          />

          <span>Có thay đổi chưa lưu</span>
        </Space>
      }
      closable={!loading}
      maskClosable={false}
      keyboard={!loading}
      onCancel={onCancel}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <AppButton
            icon={<ArrowLeftOutlined />}
            disabled={loading}
            size="small"
            onClick={onCancel}
          >
            Ở lại
          </AppButton>
          <AppButton
            danger
            icon={<CloseOutlined />}
            size="small"
            disabled={loading}
            onClick={onLeave}
          >
            Rời trang
          </AppButton>

          <AppButton
            type="primary"
            size="small"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={onSaveAndLeave}
          >
            {loading ? "Đang lưu..." : "Lưu & rời trang"}
          </AppButton>
        </div>
      }
    >
      <div
        style={{
          padding: "8px 0 4px",
        }}
      >
        <Paragraph>
          Bạn đang có <Text strong>{changedCount}</Text> học sinh có dữ liệu
          chưa được lưu vào hệ thống.
        </Paragraph>

        <Paragraph
          type="secondary"
          style={{
            marginBottom: 0,
          }}
        >
          Nếu rời trang mà không lưu, các thay đổi hiện tại sẽ không được cập
          nhật lên máy chủ. FaithEdu đã lưu tạm bản nháp trên trình duyệt để có
          thể khôi phục khi bạn quay lại.
        </Paragraph>
      </div>
    </Modal>
  );
}
