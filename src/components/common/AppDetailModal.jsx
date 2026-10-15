import React from "react";
import { Avatar, Modal, Typography, Tag } from "antd";
import {
  EditOutlined,
  UserOutlined,
  CloseOutlined,
  StarFilled,
} from "@ant-design/icons";

import AppButton from "./AppButton";
import "../../assets/css/AppDetailModal.css";

const { Text, Title } = Typography;

const AppDetailModal = ({
  open,
  loading = false,
  title = "Thông tin chi tiết",
  subtitle = "Xem toàn bộ thông tin hồ sơ chi tiết",
  avatar,
  avatarIcon = <UserOutlined />,
  children,
  width = 900,
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

  const footerItems = [
    showClose && (
      <AppButton
        key="close"
        disabled={loading}
        onClick={handleCancel}
        variant="secondary"
        size="middle"
        className="app-detail-modal-close-btn"
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
        disabled={loading}
        onClick={handleEdit}
        size="middle"
        className="app-detail-modal-edit-btn"
      >
        {editText}
      </AppButton>
    ),
  ].filter(Boolean);

  return (
    <Modal
      open={open}
      centered
      width={width}
      destroyOnClose
      maskClosable={!loading}
      closable={!loading}
      onCancel={handleCancel}
      className={`navy-gold-detail-modal ${className}`.trim()}
      closeIcon={
        <span className="app-detail-modal-close-icon">
          <CloseOutlined />
        </span>
      }
      styles={{
        content: {
          padding: 0,
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          background: "#FFFFFF",
          boxShadow: "0 16px 48px rgba(16, 42, 67, 0.16)",
        },
        header: {
          margin: 0,
          padding: "16px 20px",
          background: "#F7F9FC",
          borderBottom: "1px solid #E2E8F0",
        },
        body: {
          padding: 20,
          maxHeight: "min(68vh, 680px)",
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          background: "#FFFFFF",
        },
        footer: {
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 8,
          margin: 0,
          padding: "12px 20px",
          background: "#F7F9FC",
          borderTop: "1px solid #E2E8F0",
        },
      }}
      footer={footerItems.length ? footerItems : null}
      title={
        <div className="app-detail-modal-header">
          <Avatar
            className="app-detail-modal-avatar"
            size={52}
            src={avatar}
            icon={avatar ? undefined : avatarIcon}
          />

          <div className="app-detail-modal-heading">
            <div className="app-detail-modal-title-row">
              <Title level={5} className="app-detail-modal-title">
                {title}
              </Title>

              <Tag className="app-detail-modal-tag">
                <StarFilled />
                <span>Chi tiết</span>
              </Tag>
            </div>

            {subtitle && (
              <Text className="app-detail-modal-subtitle">{subtitle}</Text>
            )}
          </div>

          {extraHeader && (
            <div className="app-detail-modal-extra">{extraHeader}</div>
          )}
        </div>
      }
      {...props}
    >
      <div className="app-detail-modal-content-wrapper">{children}</div>
    </Modal>
  );
};

export default AppDetailModal;
