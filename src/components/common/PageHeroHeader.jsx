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
      {/* Họa tiết trang trí */}
      <div className="hero-decor-circle-1" />
      <div className="hero-decor-circle-2" />
      <div className="hero-decor-sparkle">✨</div>

      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* =========================
            BÊN TRÁI
        ========================== */}
        <Col xs={24} md={14} lg={16}>
          <div className="hero-left-content">
            {icon && <div className="hero-icon-box">{icon}</div>}

            <div className="hero-text-group">
              {badgeText && <Text className="hero-badge">{badgeText}</Text>}

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
            BÊN PHẢI
        ========================== */}
        <Col xs={24} md={10} lg={8}>
          <Space size={10} wrap className="hero-actions-group">
            {/* =================================
                1. NÚT XÓA HÀNG LOẠT
            ================================= */}
            {selectedCount > 0 && onBulkDelete && (
              <Popconfirm
                title={bulkDeleteTitle || `Xóa ${selectedCount} mục đã chọn?`}
                description={bulkDeleteConfirmText}
                okText="Xóa ngay"
                cancelText="Hủy"
                okButtonProps={{
                  danger: true,
                  loading: bulkDeleting,
                  style: {
                    borderRadius: 10,
                    fontWeight: 700,
                  },
                }}
                cancelButtonProps={{
                  disabled: bulkDeleting,
                  style: {
                    borderRadius: 10,
                  },
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

            {/* =================================
                2. NÚT REFRESH
            ================================= */}
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

            {/* =================================
                3. ACTION PHỤ
                Ví dụ: Import Excel
            ================================= */}
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

            {/* =================================
                4. ACTION CHÍNH
            ================================= */}
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

            {/* =================================
                5. EXTRA
            ================================= */}
            {extra}
          </Space>
        </Col>
      </Row>

      {/* =========================
          CSS
      ========================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,500;0,600;0,700;0,800;0,900;1,600&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

        .hero-header-wrapper {
          position: relative;
          overflow: hidden;
          padding: 22px 24px;
          margin-bottom: 20px;
          border-radius: 24px;
          background: linear-gradient(
            135deg,
            #FFFFFF 0%,
            #FFF0F3 50%,
            #FFE4E6 100%
          );
          border: 1.5px solid #FFCCD5;
          box-shadow: 0 12px 32px -4px rgba(255, 182, 193, 0.3);
          font-family: 'Be Vietnam Pro',
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
        }

        /* =========================
           DECOR
        ========================== */

        .hero-decor-circle-1 {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255,255,255,0.85) 0%,
            rgba(255,228,230,0) 70%
          );
          right: -30px;
          top: -50px;
          pointer-events: none;
        }

        .hero-decor-circle-2 {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255, 107, 139, 0.08);
          left: 40%;
          bottom: -40px;
          pointer-events: none;
        }

        .hero-decor-sparkle {
          position: absolute;
          right: 20px;
          bottom: 12px;
          font-size: 18px;
          opacity: 0.6;
          user-select: none;
          pointer-events: none;
        }

        /* =========================
           LEFT CONTENT
        ========================== */

        .hero-left-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hero-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: linear-gradient(
            135deg,
            #FF6B8B 0%,
            #FF85A1 100%
          );
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
          box-shadow: 0 8px 20px rgba(255, 107, 139, 0.35);
          border: 2px solid #FFFFFF;
        }

        .hero-text-group {
          flex: 1;
          min-width: 0;
        }

        /* =========================
           BADGE
        ========================== */

        .hero-badge {
          display: inline-block;
          color: #E11D48;
          background: rgba(255, 228, 230, 0.85);
          padding: 2px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.6px;
          margin-bottom: 4px;
          border: 1px solid #FECDD3;
          font-family: 'Plus Jakarta Sans',
            'Be Vietnam Pro',
            sans-serif;
          text-transform: uppercase;
        }

        /* =========================
           TITLE
        ========================== */

        .hero-title {
          margin: 0 !important;
          color: #0F172A !important;
          font-weight: 800 !important;
          font-size: clamp(
            1.25rem,
            2vw,
            1.6rem
          ) !important;
          line-height: 1.3 !important;
          font-family: 'Be Vietnam Pro',
            sans-serif !important;
          letter-spacing: -0.3px;
          word-break: break-word;
        }

        /* =========================
           DESCRIPTION
        ========================== */

        .hero-description {
          display: block;
          margin-top: 4px;
          font-size: 13px;
          color: #64748B;
          font-weight: 500;
          line-height: 1.45;
          font-family: 'Be Vietnam Pro',
            sans-serif;
        }

        /* =========================
           ACTION GROUP
        ========================== */

        .hero-actions-group {
          width: 100%;
          justify-content: flex-end;
        }

        /* =========================
           DELETE
        ========================== */

        .hero-btn-delete {
          height: 42px;
          border-radius: 14px;
          font-weight: 700;
          padding: 0 16px;
          font-family: 'Be Vietnam Pro',
            sans-serif;
          box-shadow: 0 6px 16px rgba(
            239,
            68,
            68,
            0.25
          );
        }

        /* =========================
           REFRESH
        ========================== */

        .hero-btn-refresh {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: #FFFFFF !important;
          border: 1.5px solid #FFE4E6 !important;
          box-shadow: 0 4px 12px rgba(
            255,
            182,
            193,
            0.2
          );
          transition: all 0.2s ease;
        }

        .hero-btn-refresh:hover {
          border-color: #FF6B8B !important;
          transform: rotate(45deg);
        }

        .hero-refresh-icon {
          color: #FF6B8B;
          font-size: 16px;
        }

        /* =========================
           SECONDARY BUTTON
        ========================== */

        .hero-btn-secondary {
          height: 42px;
          border-radius: 14px !important;
          padding: 0 16px !important;
          background: rgba(255, 255, 255, 0.9) !important;
          border: 1.5px solid #FFCCD5 !important;
          color: #BE123C !important;
          font-weight: 700 !important;
          font-family: 'Be Vietnam Pro',
            sans-serif !important;
          box-shadow: 0 4px 12px rgba(
            255,
            182,
            193,
            0.18
          );
          transition: all 0.2s ease !important;
        }

        .hero-btn-secondary:hover {
          color: #E11D48 !important;
          border-color: #FF6B8B !important;
          background: #FFFFFF !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(
            255,
            107,
            139,
            0.2
          );
        }

        /* =========================
           PRIMARY
        ========================== */

        .hero-btn-primary {
          border-radius: 14px !important;
          background: linear-gradient(
            135deg,
            #FF6B8B 0%,
            #FF85A1 100%
          ) !important;
          border: none !important;
          height: 42px !important;
          padding: 0 20px !important;
          font-weight: 700 !important;
          font-family: 'Be Vietnam Pro',
            sans-serif !important;
          box-shadow: 0 8px 20px rgba(
            255,
            107,
            139,
            0.35
          ) !important;
          transition: all 0.2s ease !important;
        }

        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(
            255,
            107,
            139,
            0.45
          ) !important;
        }

        /* =========================
           RESPONSIVE
        ========================== */

        @media (max-width: 768px) {
          .hero-actions-group {
            justify-content: flex-start;
            margin-top: 8px;
          }
        }

        @media (max-width: 576px) {
          .hero-header-wrapper {
            padding: 18px;
            border-radius: 20px;
          }

          .hero-left-content {
            gap: 12px;
          }

          .hero-icon-box {
            width: 48px;
            height: 48px;
            border-radius: 15px;
            font-size: 21px;
          }

          .hero-actions-group {
            width: 100%;
          }

          .hero-actions-group > * {
            max-width: 100%;
          }

          .hero-btn-secondary,
          .hero-btn-primary,
          .hero-btn-delete {
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
};

export default PageHeroHeader;
