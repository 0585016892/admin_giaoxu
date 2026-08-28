import React from "react";
import { Avatar, Button, Modal, Space, Typography, Tag } from "antd";
import { EditOutlined, UserOutlined, CloseOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const AppDetailModal = ({
  open,
  loading = false,
  title = "Thông tin chi tiết",
  subtitle = "Xem toàn bộ chi tiết thông tin dữ liệu",
  avatar,
  avatarIcon = <UserOutlined />,
  children,
  width = 800,
  onCancel,
  onEdit,
  editText = "Chỉnh sửa",
  closeText = "Đóng",
  showEdit = true,
  showClose = true,
  extraHeader, // Prop mở rộng nếu muốn thêm Tag/Status riêng ở Header
}) => {
  const handleCancel = () => {
    if (loading) return;
    onCancel?.();
  };

  const handleEdit = () => {
    if (loading) return;
    onEdit?.();
  };

  return (
    <Modal
      open={open}
      centered
      width={width}
      destroyOnClose
      maskClosable={!loading}
      closable={!loading}
      onCancel={handleCancel}
      closeIcon={
        <div className="detail-modal-close-btn">
          <CloseOutlined style={{ fontSize: 13 }} />
        </div>
      }
      styles={{
        content: {
          borderRadius: 20,
          padding: 0,
          boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.08)",
          border: "1px solid #EAECF0",
          overflow: "hidden",
          background: "#FFFFFF",
        },
        header: {
          marginBottom: 0,
          padding: "20px 24px 16px",
          background: "#F8FAFC",
          borderBottom: "1px solid #F1F5F9",
        },
        body: {
          padding: "24px",
          maxHeight: "calc(80vh - 150px)",
          overflowY: "auto",
        },
        footer: {
          marginTop: 0,
          padding: "16px 24px",
          background: "#FFFFFF",
          borderTop: "1px solid #F1F5F9",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 10,
        },
      }}
      footer={[
        showClose && (
          <Button
            key="close"
            disabled={loading}
            onClick={handleCancel}
            style={{
              borderRadius: 10,
              height: 38,
              padding: "0 20px",
              borderColor: "#D0D5DD",
              color: "#344054",
              fontWeight: 500,
              fontSize: 14,
              boxShadow: "none",
            }}
          >
            {closeText}
          </Button>
        ),

        showEdit && (
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            loading={loading}
            onClick={handleEdit}
            style={{
              backgroundColor: "#0F172A",
              borderColor: "#0F172A",
              borderRadius: 10,
              height: 38,
              padding: "0 22px",
              fontWeight: 500,
              fontSize: 14,
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
            }}
          >
            {editText}
          </Button>
        ),
      ].filter(Boolean)}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingRight: 28,
          }}
        >
          <Space align="center" size={14}>
            <Avatar
              size={46}
              src={avatar}
              icon={avatar ? undefined : avatarIcon}
              style={{
                backgroundColor: "#F1F5F9",
                color: "#0F172A",
                borderRadius: 14,
                border: "1px solid #E2E8F0",
                fontSize: 20,
                flexShrink: 0,
              }}
            />

            <div>
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
                  {title}
                </Title>

                <Tag
                  bordered={false}
                  style={{
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "0 8px",
                    margin: 0,
                    backgroundColor: "#F1F5F9",
                    color: "#475569",
                  }}
                >
                  Chi tiết
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

          {extraHeader && <div>{extraHeader}</div>}
        </div>
      }
    >
      {/* CSS Nhúng tinh chỉnh hiệu ứng nút Close & Scrollbar */}
      <style>{`
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

        .detail-modal-close-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667085;
          transition: all 0.15s ease;
        }
        .detail-modal-close-btn:hover {
          background-color: #E2E8F0;
          color: #101828;
        }
      `}</style>

      {children}
    </Modal>
  );
};

export default AppDetailModal;
