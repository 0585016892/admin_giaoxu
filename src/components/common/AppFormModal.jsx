import React from "react";
import { Modal, Space, Typography, Tag } from "antd";
import { CloseOutlined, StarFilled } from "@ant-design/icons";
import AppButton from "./AppButton";

const { Text, Title } = Typography;

const AppFormModal = ({
  open,
  loading = false,
  confirmLoading = false,
  editing = false,
  width = 680,
  title,
  createTitle,
  editTitle,
  subtitle,
  icon,
  children,
  onCancel,
  onSubmit,
  onOk,
  okText,
  cancelText = "Hủy",
  createText = "Tạo mới",
  editText = "Lưu thay đổi",
  destroyOnClose = true,
  maskClosable = true,
  form,
  className = "",
  ...props
}) => {
  const isSubmitting = loading || confirmLoading;

  const resolveTitle = () => {
    if (editing) return editTitle || title || "Chỉnh Sửa Thông Tin";
    return createTitle || title || "Thêm Mới Dữ Liệu";
  };

  const finalTitle = resolveTitle();
  const finalOkText = okText || (editing ? editText : createText);

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (onOk) {
      onOk();
      return;
    }
    if (form) {
      form.submit();
      return;
    }
    onSubmit?.();
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    onCancel?.();
  };

  return (
    <Modal
      open={open}
      width={width}
      centered
      destroyOnClose={destroyOnClose}
      maskClosable={!isSubmitting && maskClosable}
      closable={!isSubmitting}
      onCancel={handleCancel}
      className={`navy-gold-modal ${className}`}
      closeIcon={
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#173B5E",
            backgroundColor: "#EEF2F7",
            border: "1.5px solid #D9E2EC",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
          }}
          className="modal-close-hover"
        >
          <CloseOutlined style={{ fontSize: 13, fontWeight: "bold" }} />
        </div>
      }
      styles={{
        content: {
          borderRadius: 24,
          padding: 0,
          boxShadow: "0 20px 40px rgba(23, 59, 94, 0.15)",
          border: "1.5px solid #D9E2EC",
          overflow: "hidden",
          background: "#FFFFFF",
        },
        header: {
          marginBottom: 0,
          padding: "20px 24px 16px",
          borderBottom: "1.5px dashed #D9E2EC",
          backgroundColor: "#F7F9FC",
        },
        body: {
          padding: "24px",
          maxHeight: "calc(80vh - 140px)",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
        },
        footer: {
          marginTop: 0,
          padding: "16px 24px",
          borderTop: "1.5px dashed #D9E2EC",
          backgroundColor: "#F7F9FC",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 12,
        },
      }}
      footer={[
        <AppButton
          key="cancel"
          disabled={isSubmitting}
          onClick={handleCancel}
          variant="secondary"
          size="middle"
          style={{
            borderRadius: 12,
            fontWeight: 700,
          }}
        >
          {cancelText}
        </AppButton>,

        <AppButton
          key="submit"
          variant="gold"
          loading={isSubmitting}
          onClick={handleSubmit}
          size="middle"
          style={{
            borderRadius: 12,
            fontWeight: 700,
          }}
        >
          {finalOkText}
        </AppButton>,
      ]}
      title={
        typeof finalTitle !== "string" ? (
          finalTitle
        ) : (
          <Space align="start" size={14}>
            {icon ? (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "#EEF2F7",
                  color: "#173B5E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                  border: "1.5px solid #D9E2EC",
                  boxShadow: "0 4px 10px rgba(23, 59, 94, 0.08)",
                }}
              >
                {icon}
              </div>
            ) : (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "#EEF2F7",
                  color: "#D9A441",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                  border: "1.5px solid #D9E2EC",
                }}
              >
                <StarFilled />
              </div>
            )}

            <div style={{ marginTop: 2 }}>
              <Space align="center" size={8}>
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    color: "#173B5E",
                    fontSize: 17,
                    fontWeight: 800,
                    lineHeight: "24px",
                    fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
                  }}
                >
                  {finalTitle}
                </Title>

                <Tag
                  bordered={false}
                  style={{
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    margin: 0,
                    backgroundColor: editing ? "#FEF3C7" : "#E0F2FE",
                    color: editing ? "#B45309" : "#0369A1",
                    border: editing ? "1px solid #FDE68A" : "1px solid #BAE6FD",
                  }}
                >
                  {editing ? "Chỉnh sửa" : "Tạo mới"}
                </Tag>
              </Space>

              {subtitle && (
                <Text
                  style={{
                    display: "block",
                    marginTop: 3,
                    fontSize: 13,
                    color: "#64748B",
                    fontWeight: 500,
                    lineHeight: "18px",
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </div>
          </Space>
        )
      }
      {...props}
    >
      {children}
    </Modal>
  );
};

export default AppFormModal;
