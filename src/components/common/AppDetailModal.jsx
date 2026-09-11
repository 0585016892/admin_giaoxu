import React from "react";
import { Avatar, Modal, Space, Typography, Tag } from "antd";
import {
  EditOutlined,
  UserOutlined,
  CloseOutlined,
  StarFilled,
} from "@ant-design/icons";
import AppButton from "./AppButton";

const { Text, Title } = Typography;

const AppDetailModal = ({
  open,
  loading = false,
  title = "Thông Tin Chi Tiết",
  subtitle = "Xem toàn bộ thông tin hồ sơ chi tiết",
  avatar,
  avatarIcon = <UserOutlined />,
  children,
  width = 900, // Tăng độ rộng mặc định để Descriptions thoáng hơn, tránh bóp chữ
  onCancel,
  onEdit,
  editText = "Chỉnh sửa",
  closeText = "Đóng",
  showEdit = true,
  showClose = true,
  extraHeader,
  className = "",
  ...props
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
      className={`navy-gold-detail-modal ${className}`}
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
          background: "#F7F9FC",
          borderBottom: "1.5px dashed #D9E2EC",
        },
        body: {
          padding: "24px",
          maxHeight: "75vh", // Nới lỏng chiều cao tối đa để tránh bị bóp méo nội dung dài
          overflowY: "auto",
          overflowX: "hidden", // Chống tràn ngang vô ý
          backgroundColor: "#FFFFFF",
        },
        footer: {
          marginTop: 0,
          padding: "16px 24px",
          background: "#F7F9FC",
          borderTop: "1.5px dashed #D9E2EC",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 12,
        },
      }}
      footer={[
        showClose && (
          <AppButton
            key="close"
            disabled={loading}
            onClick={handleCancel}
            variant="secondary"
            size="middle"
            style={{
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            {closeText}
          </AppButton>
        ),

        showEdit && (
          <AppButton
            key="edit"
            variant="gold"
            icon={<EditOutlined />}
            loading={loading}
            onClick={handleEdit}
            size="middle"
            style={{
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            {editText}
          </AppButton>
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
              size={50}
              src={avatar}
              icon={avatar ? undefined : avatarIcon}
              style={{
                backgroundColor: "#EEF2F7",
                color: "#173B5E",
                borderRadius: 14,
                border: "1.5px solid #D9E2EC",
                fontSize: 22,
                flexShrink: 0,
                boxShadow: "0 4px 10px rgba(23, 59, 94, 0.08)",
              }}
            />

            <div>
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
                  {title}
                </Title>

                <Tag
                  bordered={false}
                  style={{
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    margin: 0,
                    backgroundColor: "#EEF2F7",
                    color: "#173B5E",
                    border: "1px solid #D9E2EC",
                  }}
                >
                  <StarFilled
                    style={{ fontSize: 10, marginRight: 4, color: "#D9A441" }}
                  />
                  Chi tiết
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

          {extraHeader && <div>{extraHeader}</div>}
        </div>
      }
      {...props}
    >
      {/* Bổ sung lớp bao bọc chống bóp chữ cho các bảng descriptions bên trong */}
      <div className="app-detail-modal-content-wrapper">{children}</div>

      <style>{`
        /* Đảm bảo bảng Descriptions bên trong Modal không bị bóp dọc chữ */
        .app-detail-modal-content-wrapper .ant-descriptions {
          table-layout: fixed;
          width: 100%;
        }
        .app-detail-modal-content-wrapper .ant-descriptions-item-label {
          width: 35%;
          white-space: normal !important;
          word-break: break-word;
        }
        .app-detail-modal-content-wrapper .ant-descriptions-item-content {
          width: 15%;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        @media (max-width: 768px) {
          .app-detail-modal-content-wrapper .ant-descriptions-item-label,
          .app-detail-modal-content-wrapper .ant-descriptions-item-content {
            width: 100% !important;
          }
        }
      `}</style>
    </Modal>
  );
};

export default AppDetailModal;
