import React from "react";
import { Row, Col, Space, Typography, Tooltip, Button, Popconfirm } from "antd";
import { ReloadOutlined, DeleteOutlined } from "@ant-design/icons";
import AppButton from "./AppButton";

const { Title, Text } = Typography;

const PageHeroHeader = ({
  icon,
  badgeText,
  title,
  description,

  // --- Props cho Bulk Delete ---
  selectedCount = 0,
  onBulkDelete,
  bulkDeleting = false,
  bulkDeleteTitle,
  bulkDeleteConfirmText = "Dữ liệu sau khi xóa không thể khôi phục.",

  // --- Props cho Refresh ---
  onRefresh,
  refreshLoading = false,
  refreshTooltip = "Làm mới dữ liệu",

  // --- Props cho Action phụ ---
  secondaryButtonText,
  secondaryButtonIcon,
  onSecondaryClick,
  secondaryButtonDisabled = false,
  secondaryButtonLoading = false,

  // --- Props cho Action chính ---
  primaryButtonText,
  primaryButtonIcon,
  onPrimaryClick,
  primaryDisabled = false,
  primaryLoading = false,

  // --- Custom Extra ---
  extra,
}) => {
  return (
    <div className="hero-header-wrapper">
      {/* Các lớp họa tiết trang trí nền tinh tế */}
      <div className="hero-decor-circle-1" />
      <div className="hero-decor-circle-2" />
      <div className="hero-decor-sparkle">✦</div>

      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{ position: "relative", zIndex: 2 }}
      >
        {/* =========================
            BÊN TRÁI: ICON, BADGE, TITLE, DESC
        ========================== */}
        <Col xs={24} md={14} lg={16}>
          <div className="hero-left-content">
            {icon && <div className="hero-icon-box">{icon}</div>}

            <div className="hero-text-group">
              {badgeText && <span className="hero-badge">{badgeText}</span>}

              <Title level={2} className="hero-title">
                {title}
              </Title>

              {description && (
                <Text className="hero-description">{description}</Text>
              )}
            </div>
          </div>
        </Col>

        {/* =========================
            BÊN PHẢI: ACTION BUTTONS
        ========================== */}
        <Col xs={24} md={10} lg={8}>
          <Space size={10} wrap className="hero-actions-group">
            {/* 1. NÚT XÓA HÀNG LOẠT (BULK DELETE) */}
            {selectedCount > 0 && onBulkDelete && (
              <Popconfirm
                title={bulkDeleteTitle || `Xóa ${selectedCount} mục đã chọn?`}
                description={bulkDeleteConfirmText}
                okText="Xóa ngay"
                cancelText="Hủy"
                okButtonProps={{
                  danger: true,
                  loading: bulkDeleting,
                  style: { borderRadius: 10, fontWeight: 700 },
                }}
                cancelButtonProps={{
                  disabled: bulkDeleting,
                  style: { borderRadius: 10 },
                }}
                onConfirm={onBulkDelete}
              >
                <Button
                  danger
                  type="primary"
                  icon={<DeleteOutlined />}
                  loading={bulkDeleting}
                  disabled={primaryDisabled || bulkDeleting}
                  className="hero-btn-delete"
                >
                  {bulkDeleting ? "Đang xóa..." : `Xóa (${selectedCount})`}
                </Button>
              </Popconfirm>
            )}

            {/* 2. NÚT REFRESH */}
            {onRefresh && (
              <Tooltip title={refreshTooltip}>
                <Button
                  icon={<ReloadOutlined className="hero-refresh-icon" />}
                  loading={refreshLoading}
                  onClick={onRefresh}
                  disabled={bulkDeleting}
                  className="hero-btn-refresh"
                />
              </Tooltip>
            )}

            {/* 3. ACTION PHỤ (SECONDARY) */}
            {secondaryButtonText && (
              <Button
                icon={secondaryButtonIcon}
                loading={secondaryButtonLoading}
                disabled={secondaryButtonDisabled || bulkDeleting}
                onClick={onSecondaryClick}
                className="hero-btn-secondary"
              >
                {secondaryButtonText}
              </Button>
            )}

            {/* 4. ACTION CHÍNH (PRIMARY - GOLD) */}
            {primaryButtonText && (
              <AppButton
                type="primary"
                icon={primaryButtonIcon}
                onClick={onPrimaryClick}
                disabled={primaryDisabled || bulkDeleting}
                loading={primaryLoading}
                className="hero-btn-primary"
              >
                {primaryButtonText}
              </AppButton>
            )}

            {/* 5. EXTRA CONTENT MỞ RỘNG */}
            {extra}
          </Space>
        </Col>
      </Row>

      {/* =========================
          STYLES (NAVY & GOLD THEME)
      ========================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

        .hero-header-wrapper {
          position: relative;
          overflow: hidden;
          padding: 24px;
          margin-bottom: 24px;
          border-radius: 24px;
          background: linear-gradient(135deg, #FFFFFF 0%, #F7F9FC 60%, #EEF2F7 100%);
          border: 1.5px solid #D9E2EC;
          box-shadow: 0 10px 30px -5px rgba(23, 59, 94, 0.08);
          font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* --- DECORATIONS --- */
        .hero-decor-circle-1 {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(217,164,65,0.12) 0%, rgba(247,249,252,0) 70%);
          right: -40px;
          top: -50px;
          pointer-events: none;
        }

        .hero-decor-circle-2 {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(23, 59, 94, 0.03);
          left: 30%;
          bottom: -50px;
          pointer-events: none;
        }

        .hero-decor-sparkle {
          position: absolute;
          right: 24px;
          bottom: 12px;
          font-size: 16px;
          color: #D9A441;
          opacity: 0.6;
          user-select: none;
          pointer-events: none;
        }

        /* --- LEFT CONTENT --- */
        .hero-left-content {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .hero-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #173B5E 0%, #244F78 100%);
          color: #D9A441;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
          box-shadow: 0 6px 16px rgba(23, 59, 94, 0.2);
          border: 2px solid #FFFFFF;
        }

        .hero-text-group {
          flex: 1;
          min-width: 0;
        }

        /* --- BADGE --- */
        .hero-badge {
          display: inline-block;
          color: #173B5E;
          background: rgba(217, 164, 65, 0.15);
          padding: 2px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          border: 1px solid rgba(217, 164, 65, 0.3);
          font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif;
          text-transform: uppercase;
        }

        /* --- TITLE --- */
        .hero-title {
          margin: 0 !important;
          color: #173B5E !important;
          font-weight: 800 !important;
          font-size: clamp(1.25rem, 1.8vw, 1.55rem) !important;
          line-height: 1.3 !important;
          letter-spacing: -0.3px;
        }

        /* --- DESCRIPTION --- */
        .hero-description {
          display: block;
          margin-top: 4px;
          font-size: 13px;
          color: #4A5568;
          font-weight: 500;
          line-height: 1.45;
        }

        /* --- ACTION GROUP --- */
        .hero-actions-group {
          width: 100%;
          justify-content: flex-end;
        }

        /* --- BUTTON STYLES --- */
        .hero-btn-delete {
          height: 40px;
          border-radius: 12px;
          font-weight: 700;
          padding: 0 14px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .hero-btn-refresh {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #FFFFFF !important;
          border: 1.5px solid #D9E2EC !important;
          box-shadow: 0 4px 10px rgba(23, 59, 94, 0.05);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-btn-refresh:hover {
          border-color: #173B5E !important;
          background: #F7F9FC !important;
          transform: rotate(45deg);
        }

        .hero-refresh-icon {
          color: #173B5E;
          font-size: 15px;
        }

        .hero-btn-secondary {
          height: 40px;
          border-radius: 12px !important;
          padding: 0 14px !important;
          background: #FFFFFF !important;
          border: 1.5px solid #D9E2EC !important;
          color: #173B5E !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 10px rgba(23, 59, 94, 0.05);
          transition: all 0.2s ease !important;
        }

        .hero-btn-secondary:hover {
          color: #244F78 !important;
          border-color: #173B5E !important;
          background: #F7F9FC !important;
          transform: translateY(-1px);
        }

        .hero-btn-primary {
          border-radius: 12px !important;
          background: linear-gradient(135deg, #D9A441 0%, #C28D2B 100%) !important;
          border: none !important;
          height: 40px !important;
          padding: 0 18px !important;
          color: #FFFFFF !important;
          font-weight: 700 !important;
          box-shadow: 0 6px 16px rgba(217, 164, 65, 0.3) !important;
          transition: all 0.2s ease !important;
        }

        .hero-btn-primary:hover {
          background: linear-gradient(135deg, #E2B254 0%, #D9A441 100%) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(217, 164, 65, 0.4) !important;
        }

        /* --- RESPONSIVE --- */
        @media (max-width: 768px) {
          .hero-actions-group {
            justify-content: flex-start;
            margin-top: 12px;
          }
        }

        @media (max-width: 576px) {
          .hero-header-wrapper {
            padding: 16px;
            border-radius: 18px;
          }
          .hero-icon-box {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default PageHeroHeader;
