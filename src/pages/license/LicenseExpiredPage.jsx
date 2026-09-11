import React from "react";
import { Button, Typography, Tag } from "antd";
import {
  ShieldCheck,
  LogIn,
  Mail,
  Phone,
  RefreshCw,
  UserRound,
  MessageCircle,
  ArrowRight,
  LockKeyhole,
  Crown,
  Database,
  Zap,
  CircleCheck,
  Clock3,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLicense } from "../../context/LicenseContext";

const { Title, Paragraph, Text } = Typography;

const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  gold: "#D9A441",
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#173B5E",
  textSecondary: "#64748B",
  muted: "#94A3B8",
  border: "#E2E8F0",
  navyLight: "#EEF3F7",
  goldLight: "#FBF5E7",
  success: "#2E7D5B",
  successBg: "#EAF6F0",
  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

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
    <div className="license-expired-page">
      {/* =========================================
          LEFT - SYSTEM STATUS
      ========================================= */}
      <section className="license-left">
        <div className="left-decoration decoration-one" />
        <div className="left-decoration decoration-two" />

        {/* Brand */}
        <div className="brand-header">
          <div className="brand-logo">
            <ShieldCheck size={25} strokeWidth={2.2} />
          </div>

          <div className="brand-info">
            <span className="brand-name">FaithEdu</span>
            <span className="brand-tag">Hệ thống quản lý giáo lý</span>
          </div>
        </div>

        {/* Main status */}
        <div className="status-content">
          <div className="status-badge">
            <span className="status-dot" />
            THỜI GIAN DÙNG THỬ ĐÃ HẾT HẠN
          </div>

          <Title level={1} className="license-title">
            Giữ kết nối cho
            <br />
            <span>Giáo xứ của bạn</span>
          </Title>

          <Paragraph className="license-description">
            Thời gian trải nghiệm miễn phí đã kết thúc. Mọi dữ liệu lớp học,
            giáo lý viên và thiếu nhi vẫn được <strong>bảo toàn an toàn</strong>{" "}
            trên hệ thống.
          </Paragraph>
        </div>

        {/* Data safety */}
        <div className="data-safety-card">
          <div className="safety-main">
            <div className="safety-icon">
              <Database size={22} strokeWidth={2} />
            </div>

            <div className="safety-content">
              <Text className="safety-title">Bảo lưu dữ liệu an toàn</Text>

              <Text className="safety-description">
                Sẵn sàng khôi phục ngay sau khi kích hoạt
              </Text>
            </div>

            <div className="safety-check">
              <CheckCircle2 size={18} />
            </div>
          </div>

          {license?.trial_expires_at && (
            <div className="expiry-info">
              <Clock3 size={15} />

              <span>
                Hết hạn dùng thử:{" "}
                <strong>
                  {new Date(license.trial_expires_at).toLocaleDateString(
                    "vi-VN",
                  )}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="left-actions">
          <Button
            icon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            className="outline-action"
          >
            Kiểm tra lại
          </Button>

          <Button
            icon={<LogIn size={16} />}
            onClick={handleLogout}
            className="outline-action logout-action"
          >
            Đổi tài khoản
          </Button>
        </div>
      </section>

      {/* =========================================
          RIGHT - ACTIVATION
      ========================================= */}
      <section className="license-right">
        <div className="activation-container">
          {/* Pricing */}
          <div className="activation-card pricing-card">
            <div className="official-badge">
              <Crown size={13} />
              GÓI CHÍNH THỨC
            </div>

            <div className="pricing-header">
              <div>
                <div className="pricing-label">CHI PHÍ KÍCH HOẠT</div>

                <div className="price">
                  <span className="price-number">299.000</span>
                  <span className="price-currency">đ</span>
                </div>

                <div className="price-note">
                  Thanh toán 1 lần · Sử dụng ổn định
                </div>
              </div>

              <div className="price-icon">
                <Zap size={25} fill="currentColor" />
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<Zap size={17} />}
              onClick={handleActivate}
              className="activate-button"
            >
              Kích hoạt ngay
              <ArrowRight size={17} />
            </Button>

            {/* Features */}
            <div className="features-grid">
              <div className="feature-item">
                <CircleCheck size={16} />
                <span>Không giới hạn tính năng</span>
              </div>

              <div className="feature-item">
                <CircleCheck size={16} />
                <span>Đồng bộ dữ liệu tức thì</span>
              </div>

              <div className="feature-item">
                <CircleCheck size={16} />
                <span>Hỗ trợ kỹ thuật 24/7</span>
              </div>

              <div className="feature-item">
                <CircleCheck size={16} />
                <span>Cập nhật miễn phí</span>
              </div>
            </div>
          </div>

          {/* Bottom cards */}
          <div className="bottom-grid">
            {/* Admin */}
            <div className="activation-card admin-card">
              <div className="admin-header">
                <div className="admin-avatar">
                  <UserRound size={19} />
                </div>

                <div className="admin-info">
                  <Text className="admin-name">Trần Khánh Hưng</Text>

                  <Text className="admin-role">Quản trị viên hệ thống</Text>
                </div>
              </div>

              <Tag className="verified-tag">
                <ShieldCheck size={12} />
                Quản trị viên đã xác minh
              </Tag>
            </div>

            {/* Contact */}
            <div className="activation-card contact-card">
              <div className="contact-heading">
                <div>
                  <Text className="contact-title">Liên hệ hỗ trợ nhanh</Text>

                  <Text className="contact-subtitle">
                    Chọn phương thức bạn muốn sử dụng
                  </Text>
                </div>

                <Sparkles size={18} className="contact-sparkle" />
              </div>

              <div className="quick-actions">
                <button
                  type="button"
                  className="contact-action"
                  onClick={handleZalo}
                >
                  <div className="contact-icon zalo-icon">
                    <MessageCircle size={18} />
                  </div>

                  <span>Zalo</span>
                </button>

                <button
                  type="button"
                  className="contact-action"
                  onClick={handleCall}
                >
                  <div className="contact-icon phone-icon">
                    <Phone size={18} />
                  </div>

                  <span>Gọi ngay</span>
                </button>

                <button
                  type="button"
                  className="contact-action"
                  onClick={handleEmail}
                >
                  <div className="contact-icon email-icon">
                    <Mail size={18} />
                  </div>

                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="security-note">
            <div className="security-icon">
              <LockKeyhole size={15} />
            </div>

            <span>
              Thanh toán và kích hoạt được xác nhận trực tiếp qua Zalo/SĐT chính
              thức của Quản trị viên.
            </span>
          </div>
        </div>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .license-expired-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          background: ${COLORS.background};
          font-family:
            "Be Vietnam Pro",
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* =========================================
           LEFT
        ========================================= */

        .license-left {
          width: 52%;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 64px;
          background:
            linear-gradient(
              145deg,
              #102f4d 0%,
              ${COLORS.navy} 55%,
              #0f304d 100%
            );
          border-right: 1px solid rgba(255,255,255,0.08);
        }

        .left-decoration {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          border: 1px solid rgba(217,164,65,0.13);
        }

        .decoration-one {
          width: 420px;
          height: 420px;
          top: -220px;
          right: -160px;
        }

        .decoration-two {
          width: 600px;
          height: 600px;
          bottom: -430px;
          left: -300px;
          background: rgba(255,255,255,0.015);
        }

        .brand-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .brand-logo {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: ${COLORS.gold};
          color: ${COLORS.navy};
          box-shadow:
            0 8px 24px rgba(0,0,0,0.18);
        }

        .brand-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .brand-name {
          color: ${COLORS.white};
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brand-tag {
          color: #AFC0D0;
          font-size: 11px;
          font-weight: 500;
        }

        .status-content {
          position: relative;
          z-index: 2;
          max-width: 570px;
          margin: 35px 0;
        }

        .status-badge {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border-radius: 8px;
          color: #F5D98C;
          background: rgba(217,164,65,0.10);
          border: 1px solid rgba(217,164,65,0.24);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.45px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${COLORS.gold};
          box-shadow: 0 0 0 4px rgba(217,164,65,0.10);
        }

        .license-title {
          margin: 22px 0 17px !important;
          color: ${COLORS.white} !important;
          font-size: clamp(34px, 4vw, 48px) !important;
          line-height: 1.16 !important;
          font-weight: 800 !important;
          letter-spacing: -1.4px;
        }

        .license-title span {
          color: ${COLORS.gold};
        }

        .license-description {
          max-width: 500px;
          margin: 0 !important;
          color: #AFC0D0 !important;
          font-size: 14px;
          line-height: 1.8;
        }

        .license-description strong {
          color: #E7EDF3;
          font-weight: 700;
        }

        /* Data card */

        .data-safety-card {
          position: relative;
          z-index: 2;
          padding: 17px;
          border-radius: 15px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .safety-main {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .safety-icon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          color: ${COLORS.gold};
          background: rgba(217,164,65,0.10);
        }

        .safety-content {
          flex: 1;
          min-width: 0;
        }

        .safety-title {
          display: block;
          color: ${COLORS.white};
          font-size: 13px;
          font-weight: 700;
        }

        .safety-description {
          display: block;
          margin-top: 2px;
          color: #8095A9;
          font-size: 11px;
        }

        .safety-check {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #77C9A4;
          background: rgba(46,125,91,0.14);
        }

        .expiry-info {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 13px;
          padding-top: 12px;
          border-top: 1px dashed rgba(255,255,255,0.10);
          color: #91A4B6;
          font-size: 11px;
        }

        .expiry-info svg {
          color: ${COLORS.gold};
        }

        .expiry-info strong {
          color: #DCE5ED;
        }

        /* Actions */

        .left-actions {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 10px;
        }

        .outline-action {
          height: 42px !important;
          padding: 0 16px !important;
          border-radius: 10px !important;
          border: 1px solid rgba(255,255,255,0.16) !important;
          background: rgba(255,255,255,0.045) !important;
          color: #E7EDF3 !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          box-shadow: none !important;
        }

        .outline-action:hover {
          color: ${COLORS.gold} !important;
          border-color: ${COLORS.gold} !important;
          background: rgba(217,164,65,0.07) !important;
        }

        .logout-action:hover {
          color: #E8A19A !important;
          border-color: #C97B73 !important;
          background: rgba(192,57,43,0.08) !important;
        }

        /* =========================================
           RIGHT
        ========================================= */

        .license-right {
          width: 48%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 45px 50px;
          background: ${COLORS.background};
        }

        .activation-container {
          width: 100%;
          max-width: 590px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .activation-card {
          position: relative;
          background: ${COLORS.white};
          border: 1px solid ${COLORS.border};
          border-radius: 18px;
          box-shadow: 0 5px 20px rgba(23,59,94,0.045);
        }

        /* Pricing */

        .pricing-card {
          padding: 27px;
          border: 1px solid rgba(217,164,65,0.42);
        }

        .official-badge {
          position: absolute;
          top: -11px;
          right: 23px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px;
          border-radius: 7px;
          background: ${COLORS.navy};
          color: ${COLORS.gold};
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.6px;
        }

        .pricing-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .pricing-label {
          color: ${COLORS.gold};
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .price {
          display: flex;
          align-items: baseline;
          margin: 5px 0 3px;
        }

        .price-number {
          color: ${COLORS.navy};
          font-size: 38px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -1.3px;
        }

        .price-currency {
          margin-left: 5px;
          color: ${COLORS.gold};
          font-size: 20px;
          font-weight: 800;
        }

        .price-note {
          color: ${COLORS.textSecondary};
          font-size: 11px;
        }

        .price-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: ${COLORS.gold};
          background: ${COLORS.goldLight};
          border: 1px solid #F0DFB5;
        }

        .activate-button {
          width: 100%;
          height: 48px !important;
          margin-top: 22px;
          display: flex !important;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: none !important;
          border-radius: 10px !important;
          background: ${COLORS.navy} !important;
          color: ${COLORS.white} !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          box-shadow: none !important;
        }

        .activate-button:hover {
          background: ${COLORS.navyHover} !important;
          transform: translateY(-1px);
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 11px 20px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #EEF2F6;
        }

        .feature-item {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          color: #536477;
          font-size: 11px;
          font-weight: 600;
        }

        .feature-item svg {
          flex: 0 0 auto;
          color: ${COLORS.gold};
        }

        /* Bottom */

        .bottom-grid {
          display: grid;
          grid-template-columns: 0.95fr 1.35fr;
          gap: 14px;
        }

        .admin-card {
          min-height: 138px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .admin-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          color: ${COLORS.navy};
          background: ${COLORS.navyLight};
        }

        .admin-info {
          min-width: 0;
        }

        .admin-name {
          display: block;
          color: ${COLORS.navy};
          font-size: 12px;
          font-weight: 800;
        }

        .admin-role {
          display: block;
          margin-top: 2px;
          color: ${COLORS.textSecondary};
          font-size: 10px;
        }

        .verified-tag {
          width: fit-content;
          margin: 12px 0 0 !important;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 7px !important;
          border: 1px solid #E8D5A7 !important;
          border-radius: 6px !important;
          background: ${COLORS.goldLight} !important;
          color: #8A671D !important;
          font-size: 9px !important;
          font-weight: 700;
        }

        /* Contact */

        .contact-card {
          min-height: 138px;
          padding: 20px;
        }

        .contact-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 13px;
        }

        .contact-title {
          display: block;
          color: ${COLORS.navy};
          font-size: 12px;
          font-weight: 800;
        }

        .contact-subtitle {
          display: block;
          margin-top: 2px;
          color: ${COLORS.textSecondary};
          font-size: 10px;
        }

        .contact-sparkle {
          color: ${COLORS.gold};
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
        }

        .contact-action {
          min-height: 57px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid ${COLORS.border};
          border-radius: 10px;
          background: #FAFBFC;
          cursor: pointer;
          color: ${COLORS.text};
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          transition: all 0.18s ease;
        }

        .contact-action:hover {
          border-color: #C9D4DF;
          background: ${COLORS.white};
          transform: translateY(-1px);
        }

        .contact-icon {
          width: 29px;
          height: 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .zalo-icon {
          color: #1976D2;
          background: #EAF3FC;
        }

        .phone-icon {
          color: ${COLORS.success};
          background: ${COLORS.successBg};
        }

        .email-icon {
          color: #967221;
          background: ${COLORS.goldLight};
        }

        /* Security */

        .security-note {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 14px;
          border: 1px solid ${COLORS.border};
          border-radius: 11px;
          background: #FBFCFD;
          color: ${COLORS.textSecondary};
          font-size: 10px;
          line-height: 1.5;
        }

        .security-icon {
          width: 27px;
          height: 27px;
          flex: 0 0 27px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          color: ${COLORS.gold};
          background: ${COLORS.goldLight};
        }

        /* =========================================
           RESPONSIVE
        ========================================= */

        @media (max-width: 1100px) {
          .license-left {
            padding: 40px;
          }

          .license-right {
            padding: 35px;
          }

          .license-title {
            font-size: 38px !important;
          }
        }

        @media (max-width: 900px) {
          .license-expired-page {
            flex-direction: column;
          }

          .license-left,
          .license-right {
            width: 100%;
            min-height: auto;
          }

          .license-left {
            padding: 35px 28px;
            gap: 25px;
          }

          .status-content {
            margin: 20px 0;
          }

          .license-right {
            padding: 30px 20px 40px;
          }
        }

        @media (max-width: 600px) {
          .license-left {
            padding: 28px 20px;
          }

          .license-title {
            font-size: 31px !important;
            letter-spacing: -0.8px;
          }

          .license-description {
            font-size: 13px;
          }

          .left-actions {
            flex-direction: column;
          }

          .outline-action {
            width: 100%;
          }

          .pricing-card {
            padding: 22px 18px;
          }

          .pricing-header {
            align-items: flex-start;
          }

          .price-number {
            font-size: 32px;
          }

          .price-icon {
            width: 42px;
            height: 42px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .admin-card,
          .contact-card {
            min-height: auto;
          }

          .security-note {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default LicenseExpiredPage;
