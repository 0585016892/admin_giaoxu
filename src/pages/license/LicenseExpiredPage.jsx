import React from "react";
import { Button, Typography, Tag } from "antd";
import {
  SafetyCertificateFilled,
  LoginOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined,
  UserOutlined,
  WechatOutlined,
  ArrowRightOutlined,
  LockOutlined,
  CrownFilled,
  DatabaseOutlined,
  ThunderboltFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLicense } from "../../context/LicenseContext";

const { Title, Paragraph, Text } = Typography;

const LicenseExpiredPage = () => {
  const navigate = useNavigate();
  const { license, refreshLicense } = useLicense();

  const handleRefresh = async () => {
    await refreshLicense();
  };

  const handleCall = () => {
    window.location.href = "tel:0336041807";
  };

  const handleZalo = () => {
    window.open("https://zalo.me/0336041807", "_blank", "noopener,noreferrer");
  };

  const handleEmail = () => {
    window.location.href =
      "mailto:tranhung6829@gmail.com?subject=Đăng ký kích hoạt FaithEdu";
  };

  const handleActivate = () => {
    handleZalo();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("faidedu_license_expired");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="license-split-wrapper">
      {/* =========================================
          LEFT SIDE: CONTROL CENTER & SYSTEM STATUS
      ========================================= */}
      <div className="split-left">
        <div className="left-glow" />

        {/* BRAND HEADER */}
        <div className="brand-header">
          <div className="brand-logo">
            <SafetyCertificateFilled />
          </div>
          <div className="brand-info">
            <span className="brand-name">FaithEdu</span>
            <span className="brand-tag">Hệ thống quản lý giáo lý</span>
          </div>
        </div>

        {/* HERO STATUS */}
        <div className="hero-status">
          <div className="status-pill">
            <span className="pulse-dot" />
            THỜI GIAN DÙNG THỬ ĐÃ HẾT HẠN
          </div>

          <Title level={1} className="left-title">
            Giữ kết nối cho <br />
            <span>Giáo xứ của bạn</span>
          </Title>

          <Paragraph className="left-desc">
            Thời gian trải nghiệm miễn phí đã kết thúc. Mọi dữ liệu lớp học,
            giáo lý viên và thiếu nhi vẫn được **bảo toàn tuyệt đối** trên hệ
            thống.
          </Paragraph>
        </div>

        {/* DATA METRICS CARD */}
        <div className="data-safety-card">
          <div className="safety-header">
            <DatabaseOutlined className="safety-icon" />
            <div>
              <Text className="safety-title">Bảo lưu dữ liệu an toàn</Text>
              <Text className="safety-sub">
                Sẵn sàng khôi phục ngay sau khi kích hoạt
              </Text>
            </div>
          </div>
          {license?.trial_expires_at && (
            <div className="expiry-date-tag">
              <ClockCircleOutlined />
              <span>
                Hết hạn dùng thử:{" "}
                {new Date(license.trial_expires_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="left-footer-actions">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            className="glass-btn"
          >
            Kiểm tra lại
          </Button>
          <Button
            icon={<LoginOutlined />}
            onClick={handleLogout}
            className="glass-btn danger-glass"
          >
            Đổi tài khoản
          </Button>
        </div>
      </div>

      {/* =========================================
          RIGHT SIDE: ACTIVATION BENTO & CONTACT
      ========================================= */}
      <div className="split-right">
        <div className="bento-container">
          {/* MAIN PRICING BENTO */}
          <div className="bento-card bento-pricing">
            <div className="pricing-badge">
              <CrownFilled />
              <span>GÓI CHÍNH THỨC</span>
            </div>

            <div className="pricing-content">
              <div className="pricing-text">
                <Text className="pricing-label">CHI PHÍ KÍCH HOẠT</Text>
                <div className="price-tag">
                  <span className="amount">299.000</span>
                  <span className="currency">đ</span>
                </div>
                <Text className="pricing-sub">
                  Thanh toán 1 lần · Sử dụng ổn định
                </Text>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<ThunderboltFilled />}
                onClick={handleActivate}
                className="btn-activate-main"
              >
                Kích hoạt ngay <ArrowRightOutlined />
              </Button>
            </div>

            <div className="features-grid">
              <div className="feat-item">
                <CheckCircleOutlined /> <span>Không giới hạn tính năng</span>
              </div>
              <div className="feat-item">
                <CheckCircleOutlined /> <span>Đồng bộ dữ liệu tức thì</span>
              </div>
              <div className="feat-item">
                <CheckCircleOutlined /> <span>Hỗ trợ kỹ thuật 24/7</span>
              </div>
              <div className="feat-item">
                <CheckCircleOutlined /> <span>Cập nhật miễn phí</span>
              </div>
            </div>
          </div>

          {/* ADMIN & CONTACT BENTO */}
          <div className="bento-grid-bottom">
            {/* ADMIN INFO */}
            <div className="bento-card bento-admin">
              <div className="admin-header">
                <div className="avatar-box">
                  <UserOutlined />
                </div>
                <div>
                  <Text className="admin-name">Trần Khánh Hưng</Text>
                  <Text className="admin-role">Quản trị viên hệ thống</Text>
                </div>
              </div>
              <Tag color="gold" className="verified-tag">
                <SafetyCertificateFilled /> Quản trị viên đã xác minh
              </Tag>
            </div>

            {/* ACTION BUTTONS */}
            <div className="bento-card bento-actions">
              <Text className="contact-title">Liên hệ hỗ trợ nhanh</Text>
              <div className="quick-actions-list">
                <button className="action-tile zalo" onClick={handleZalo}>
                  <WechatOutlined />
                  <span>Zalo</span>
                </button>
                <button className="action-tile phone" onClick={handleCall}>
                  <PhoneOutlined />
                  <span>Gọi ngay</span>
                </button>
                <button className="action-tile email" onClick={handleEmail}>
                  <MailOutlined />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECURITY FOOTER NOTE */}
          <div className="bento-security-note">
            <LockOutlined />
            <span>
              Thanh toán và kích hoạt được xác nhận trực tiếp qua Zalo/SĐT chính
              thức của Quản trị viên.
            </span>
          </div>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .license-split-wrapper {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #0d1527;
          font-family: "Be Vietnam Pro", "Inter", -apple-system, sans-serif;
        }

        /* =========================================
           LEFT PANEL (DARK & GLASS)
        ========================================= */
        .split-left {
          flex: 1.1;
          position: relative;
          background: linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%);
          padding: 60px 80px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .left-glow {
          position: absolute;
          top: -20%;
          left: -20%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 14px;
          z-index: 2;
        }

        .brand-logo {
          width: 46px;
          height: 46px;
          background: linear-gradient(135deg, #d4af37, #aa820a);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: #fff;
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
        }

        .brand-info {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          color: #ffffff;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brand-tag {
          color: #7d8fb3;
          font-size: 11px;
        }

        .hero-status {
          z-index: 2;
          margin: 40px 0;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(229, 72, 77, 0.15);
          border: 1px solid rgba(229, 72, 77, 0.3);
          border-radius: 30px;
          color: #ff6b6b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 24px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #e5484d;
          border-radius: 50%;
          box-shadow: 0 0 10px #e5484d;
        }

        .left-title {
          color: #ffffff !important;
          font-size: 42px !important;
          font-weight: 800 !important;
          line-height: 1.2 !important;
          margin-bottom: 16px !important;
        }

        .left-title span {
          background: linear-gradient(90deg, #f3d06b, #d4af37);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .left-desc {
          color: #94a3b8 !important;
          font-size: 15px;
          line-height: 1.7;
          max-width: 480px;
        }

        .left-desc strong {
          color: #e2e8f0;
        }

        .data-safety-card {
          z-index: 2;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          padding: 20px;
          border-radius: 20px;
          margin-bottom: 30px;
        }

        .safety-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .safety-icon {
          font-size: 24px;
          color: #d4af37;
          background: rgba(212, 175, 55, 0.1);
          padding: 10px;
          border-radius: 12px;
        }

        .safety-title {
          display: block;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
        }

        .safety-sub {
          display: block;
          color: #64748b;
          font-size: 12px;
        }

        .expiry-date-tag {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .left-footer-actions {
          z-index: 2;
          display: flex;
          gap: 12px;
        }

        .glass-btn {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          color: #ffffff !important;
          border-radius: 12px !important;
          height: 44px !important;
          font-weight: 600 !important;
        }

        .glass-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: #d4af37 !important;
          color: #d4af37 !important;
        }

        .danger-glass:hover {
          border-color: #ff6b6b !important;
          color: #ff6b6b !important;
        }

        /* =========================================
           RIGHT PANEL (BENTO LIGHT/NEUMORPHIC)
        ========================================= */
        .split-right {
          flex: 1;
          background: #f4f6f9;
          padding: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bento-container {
          width: 100%;
          max-width: 520px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bento-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 28px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
        }

        /* PRICING BENTO */
        .bento-pricing {
          background: linear-gradient(180deg, #ffffff 0%, #fffdfa 100%);
          border: 2px solid rgba(212, 175, 55, 0.3);
          position: relative;
        }

        .pricing-badge {
          position: absolute;
          top: -12px;
          right: 28px;
          background: #1b263b;
          color: #d4af37;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.5px;
        }

        .pricing-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .pricing-label {
          font-size: 11px;
          font-weight: 800;
          color: #d4af37;
          letter-spacing: 1px;
        }

        .price-tag {
          display: flex;
          align-items: baseline;
          margin: 4px 0;
        }

        .price-tag .amount {
          font-size: 36px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1;
        }

        .price-tag .currency {
          font-size: 20px;
          font-weight: 700;
          color: #d4af37;
          margin-left: 4px;
        }

        .pricing-sub {
          font-size: 11px;
          color: #64748b;
          display: block;
        }

        .btn-activate-main {
          height: 52px !important;
          padding: 0 24px !important;
          border-radius: 16px !important;
          background: linear-gradient(135deg, #1b263b, #0d1b2a) !important;
          border: none !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          box-shadow: 0 10px 20px rgba(13, 27, 42, 0.2) !important;
        }

        .btn-activate-main:hover {
          transform: translateY(-2px);
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }

        .feat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #475569;
          font-weight: 500;
        }

        .feat-item span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .feat-item .anticon {
          color: #d4af37;
        }

        /* BOTTOM BENTO GRID */
        .bento-grid-bottom {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 16px;
        }

        .bento-admin {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .admin-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .avatar-box {
          width: 38px;
          height: 38px;
          background: #f1f5f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1b263b;
          font-size: 16px;
        }

        .admin-name {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }

        .admin-role {
          display: block;
          font-size: 10px;
          color: #64748b;
        }

        .verified-tag {
          border-radius: 8px;
          font-size: 9px;
          padding: 2px 6px;
          border: none;
        }

        /* ACTIONS BENTO */
        .contact-title {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          display: block;
          margin-bottom: 10px;
        }

        .quick-actions-list {
          display: flex;
          gap: 8px;
        }

        .action-tile {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 4px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }

        .action-tile span {
          font-size: 10px;
          font-weight: 700;
        }

        .action-tile.zalo { color: #0068ff; }
        .action-tile.phone { color: #16a34a; }
        .action-tile.email { color: #d4af37; }

        .action-tile:hover {
          transform: translateY(-2px);
          background: #ffffff;
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
        }

        .bento-security-note {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 11px;
        }

        .bento-security-note .anticon {
          color: #d4af37;
        }

        /* RESPONSIVE LAYOUT */
        @media (max-width: 1024px) {
          .license-split-wrapper {
            flex-direction: column;
          }

          .split-left {
            padding: 40px 24px;
          }

          .left-title {
            font-size: 32px !important;
          }

          .split-right {
            padding: 32px 20px;
          }

          .bento-grid-bottom {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default LicenseExpiredPage;
