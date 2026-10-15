import React from "react";
import { Row, Col, Typography, Tooltip, Button, Popconfirm } from "antd";
import { ReloadOutlined, DeleteOutlined } from "@ant-design/icons";

import "../../assets/css/PageHeroHeader.css";
import AppButton from "./AppButton";

const { Title, Text } = Typography;

const PageHeroHeader = ({
  icon,
  badgeText,
  title,
  description,

  // Bulk delete
  selectedCount = 0,
  onBulkDelete,
  bulkDeleting = false,
  bulkDeleteTitle,
  bulkDeleteConfirmText = "Dữ liệu sau khi xóa không thể khôi phục.",

  // Refresh
  onRefresh,
  refreshLoading = false,
  refreshTooltip = "Làm mới dữ liệu",

  // Secondary action
  secondaryButtonText,
  secondaryButtonIcon,
  onSecondaryClick,
  secondaryButtonDisabled = false,
  secondaryButtonLoading = false,

  // Primary action
  primaryButtonText,
  primaryButtonIcon,
  onPrimaryClick,
  primaryDisabled = false,
  primaryLoading = false,

  // Extra
  extra,
}) => {
  const hasBulkDelete = selectedCount > 0 && typeof onBulkDelete === "function";

  const hasSecondary = Boolean(secondaryButtonText);
  const hasPrimary = Boolean(primaryButtonText);

  const hasActions = Boolean(
    hasBulkDelete || onRefresh || hasSecondary || hasPrimary || extra,
  );

  return (
    <section className="page-hero-header">
      <Row gutter={[16, 12]} align="middle" className="page-hero-row">
        {/* Nội dung tiêu đề */}
        <Col xs={24} lg={hasActions ? 15 : 24} xl={hasActions ? 16 : 24}>
          <div className="page-hero-content">
            {icon && <div className="page-hero-icon">{icon}</div>}

            <div className="page-hero-text">
              {badgeText && (
                <div className="page-hero-badge">
                  <span className="page-hero-badge-dot" />
                  <span>{badgeText}</span>
                </div>
              )}

              {title && (
                <Title level={3} className="page-hero-title">
                  {title}
                </Title>
              )}

              {description && (
                <Text className="page-hero-description">{description}</Text>
              )}
            </div>
          </div>
        </Col>

        {/* Các nút thao tác */}
        {hasActions && (
          <Col xs={24} lg={9} xl={8} className="page-hero-actions-col">
            <div className="page-hero-actions">
              {hasBulkDelete && (
                <Popconfirm
                  title={bulkDeleteTitle || `Xóa ${selectedCount} mục đã chọn?`}
                  description={bulkDeleteConfirmText}
                  okText="Xóa ngay"
                  cancelText="Hủy"
                  placement="bottomRight"
                  okButtonProps={{
                    danger: true,
                    loading: bulkDeleting,
                  }}
                  cancelButtonProps={{
                    disabled: bulkDeleting,
                  }}
                  onConfirm={onBulkDelete}
                >
                  <Button
                    danger
                    type="primary"
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={bulkDeleting}
                    disabled={bulkDeleting}
                    className="page-hero-delete-button"
                  >
                    {bulkDeleting ? "Đang xóa..." : `Xóa (${selectedCount})`}
                  </Button>
                </Popconfirm>
              )}

              {onRefresh && (
                <Tooltip title={refreshTooltip}>
                  <Button
                    type="default"
                    size="small"
                    icon={<ReloadOutlined />}
                    loading={refreshLoading}
                    disabled={bulkDeleting}
                    onClick={onRefresh}
                    className="page-hero-refresh-button"
                    aria-label={refreshTooltip}
                  />
                </Tooltip>
              )}

              {hasSecondary && (
                <Button
                  size="small"
                  icon={secondaryButtonIcon}
                  loading={secondaryButtonLoading}
                  disabled={secondaryButtonDisabled || bulkDeleting}
                  onClick={onSecondaryClick}
                  className="page-hero-secondary-button"
                >
                  {secondaryButtonText}
                </Button>
              )}

              {hasPrimary && (
                <AppButton
                  size="small"
                  type="primary"
                  icon={primaryButtonIcon}
                  onClick={onPrimaryClick}
                  disabled={primaryDisabled || bulkDeleting}
                  loading={primaryLoading}
                  className="page-hero-primary-button"
                >
                  {primaryButtonText}
                </AppButton>
              )}

              {extra && <div className="page-hero-extra">{extra}</div>}
            </div>
          </Col>
        )}
      </Row>
    </section>
  );
};

export default PageHeroHeader;
