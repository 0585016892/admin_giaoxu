import React from "react";
import { Modal, Button, Space, Typography, Tag } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const AppFormModal = ({
  open,
  loading = false,
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
  createText = "Tạo mới",
  editText = "Lưu thay đổi",
  destroyOnClose = true,
  maskClosable = true,
  form,
}) => {
  const finalTitle = editing
    ? editTitle || title || "Chỉnh sửa"
    : createTitle || title || "Tạo mới";

  const finalButtonText = editing ? editText : createText;

  const handleSubmit = () => {
    if (loading) return;
    if (form) {
      form.submit();
      return;
    }
    onSubmit?.();
  };

  const handleCancel = () => {
    if (loading) return;
    onCancel?.();
  };

  return (
    <Modal
      open={open}
      width={width}
      centered
      destroyOnClose={destroyOnClose}
      maskClosable={!loading && maskClosable}
      closable={!loading}
      onCancel={handleCancel}
      closeIcon={
        <div className="modal-close-btn">
          <CloseOutlined style={{ fontSize: 13 }} />
        </div>
      }
      styles={{
        content: {
          borderRadius: 20,
          padding: 0,
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.07)",
          border: "1px solid #EAECF0",
          overflow: "hidden",
          background: "#FFFFFF",
        },
        header: {
          marginBottom: 0,
          padding: "20px 24px 16px",
          borderBottom: "1px solid #F2F4F7",
        },
        body: {
          padding: "20px 24px",
          maxHeight: "calc(80vh - 150px)",
          overflowY: "auto",
        },
        footer: {
          marginTop: 0,
          padding: "16px 24px",
          borderTop: "1px solid #F2F4F7",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 10,
        },
      }}
      footer={[
        <Button
          key="cancel"
          disabled={loading}
          onClick={handleCancel}
          style={{
            borderRadius: 10,
            height: 38,
            padding: "0 18px",
            borderColor: "#D0D5DD",
            color: "#344054",
            fontWeight: 500,
            fontSize: 14,
            boxShadow: "none",
          }}
        >
          Hủy
        </Button>,

        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          style={{
            backgroundColor: "#0F172A",
            borderColor: "#0F172A",
            borderRadius: 10,
            height: 38,
            padding: "0 20px",
            fontWeight: 500,
            fontSize: 14,
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
          }}
        >
          {finalButtonText}
        </Button>,
      ]}
      title={
        <Space align="start" size={12}>
          {icon && (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "#F8FAFC",
                color: "#0F172A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
                border: "1px solid #E2E8F0",
              }}
            >
              {icon}
            </div>
          )}

          <div style={{ marginTop: icon ? 1 : 0 }}>
            <Space align="center" size={8}>
              <Title
                level={5}
                style={{
                  margin: 0,
                  color: "#101828",
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: "24px",
                }}
              >
                {finalTitle}
              </Title>

              <Tag
                bordered={false}
                style={{
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "0 8px",
                  margin: 0,
                  backgroundColor: editing ? "#FFFAEB" : "#EFF8FF",
                  color: editing ? "#B54708" : "#175CD3",
                }}
              >
                {editing ? "Chỉnh sửa" : "Tạo mới"}
              </Tag>
            </Space>

            {subtitle && (
              <Text
                style={{
                  display: "block",
                  marginTop: 2,
                  fontSize: 13,
                  color: "#667085",
                  fontWeight: 400,
                  lineHeight: "18px",
                }}
              >
                {subtitle}
              </Text>
            )}
          </div>
        </Space>
      }
    >
      <style>{`
        /* Smooth Custom Scrollbar */
        .ant-modal-body::-webkit-scrollbar {
          width: 5px;
        }
        .ant-modal-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .ant-modal-body::-webkit-scrollbar-thumb {
          background: #EAECF0;
          border-radius: 10px;
        }
        .ant-modal-body::-webkit-scrollbar-thumb:hover {
          background: #D0D5DD;
        }

        /* Nút Close tối giản */
        .modal-close-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667085;
          transition: all 0.15s ease;
        }
        .modal-close-btn:hover {
          background-color: #F2F4F7;
          color: #101828;
        }
      `}</style>

      {children}
    </Modal>
  );
};

export default AppFormModal;
