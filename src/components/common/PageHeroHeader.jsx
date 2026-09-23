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

  // =====================================================
  // BULK DELETE
  // =====================================================
  selectedCount = 0,
  onBulkDelete,
  bulkDeleting = false,
  bulkDeleteTitle,
  bulkDeleteConfirmText = "Dữ liệu sau khi xóa không thể khôi phục.",

  // =====================================================
  // REFRESH
  // =====================================================
  onRefresh,
  refreshLoading = false,
  refreshTooltip = "Làm mới dữ liệu",

  // =====================================================
  // SECONDARY ACTION
  // =====================================================
  secondaryButtonText,
  secondaryButtonIcon,
  onSecondaryClick,
  secondaryButtonDisabled = false,
  secondaryButtonLoading = false,

  // =====================================================
  // PRIMARY ACTION
  // =====================================================
  primaryButtonText,
  primaryButtonIcon,
  onPrimaryClick,
  primaryDisabled = false,
  primaryLoading = false,

  // =====================================================
  // EXTRA
  // =====================================================
  extra,
}) => {
  const hasBulkDelete = selectedCount > 0 && typeof onBulkDelete === "function";

  const hasSecondary = Boolean(secondaryButtonText);

  const hasPrimary = Boolean(primaryButtonText);

  const hasActions =
    hasBulkDelete || onRefresh || hasSecondary || hasPrimary || extra;

  return (
    <section className="page-hero-header">
      {/* =====================================================
          DECORATION
          ===================================================== */}

      <div className="page-hero-decoration page-hero-decoration-one" />

      <div className="page-hero-decoration page-hero-decoration-two" />

      <div className="page-hero-sparkle">✦</div>

      <Row gutter={[24, 20]} align="middle" className="page-hero-row">
        {/* =====================================================
            LEFT
            ===================================================== */}

        <Col xs={24} lg={hasActions ? 15 : 24} xl={hasActions ? 16 : 24}>
          <div className="page-hero-content">
            {icon && <div className="page-hero-icon">{icon}</div>}

            <div className="page-hero-text">
              {badgeText && (
                <div className="page-hero-badge">
                  <span className="page-hero-badge-dot" />
                  {badgeText}
                </div>
              )}

              {title && (
                <Title level={2} className="page-hero-title">
                  {title}
                </Title>
              )}

              {description && (
                <Text className="page-hero-description">{description}</Text>
              )}
            </div>
          </div>
        </Col>

        {/* =====================================================
            RIGHT - ACTIONS
            ===================================================== */}

        {hasActions && (
          <Col xs={24} lg={9} xl={8} className="page-hero-actions-col">
            <div className="page-hero-actions">
              {/* ===============================================
                  BULK DELETE
                  =============================================== */}

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
                    icon={<DeleteOutlined />}
                    loading={bulkDeleting}
                    disabled={primaryDisabled || bulkDeleting}
                    className="page-hero-delete-button"
                  >
                    {bulkDeleting ? "Đang xóa..." : `Xóa (${selectedCount})`}
                  </Button>
                </Popconfirm>
              )}

              {/* ===============================================
                  REFRESH
                  =============================================== */}

              {onRefresh && (
                <Tooltip title={refreshTooltip}>
                  <Button
                    type="default"
                    icon={<ReloadOutlined />}
                    loading={refreshLoading}
                    disabled={bulkDeleting}
                    onClick={onRefresh}
                    className="page-hero-refresh-button"
                    aria-label={refreshTooltip}
                  />
                </Tooltip>
              )}

              {/* ===============================================
                  SECONDARY
                  =============================================== */}

              {hasSecondary && (
                <Button
                  icon={secondaryButtonIcon}
                  loading={secondaryButtonLoading}
                  disabled={secondaryButtonDisabled || bulkDeleting}
                  onClick={onSecondaryClick}
                  className="page-hero-secondary-button"
                >
                  {secondaryButtonText}
                </Button>
              )}

              {/* ===============================================
                  PRIMARY - APP BUTTON
                  =============================================== */}

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

              {/* ===============================================
                  EXTRA
                  =============================================== */}

              {extra && <div className="page-hero-extra">{extra}</div>}
            </div>
          </Col>
        )}
      </Row>
    </section>
  );
};

export default PageHeroHeader;
