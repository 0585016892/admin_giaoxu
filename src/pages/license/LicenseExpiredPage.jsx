import React from "react";
import { Button, Typography } from "antd";
import {
  ShieldCheck,
  LogIn,
  Mail,
  Phone,
  RefreshCw,
  MessageCircle,
  ArrowRight,
  Crown,
  Clock3,
  CalendarDays,
  Infinity as InfinityIcon,
  CreditCard,
  Sparkles,
  BookOpen,
  Users,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  Headphones,
  QrCode,
  CheckCircle2,
  LockKeyhole,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLicense } from "../../context/LicenseContext";

import logo from "../../assets/images/logoXn.png";
import backqr from "../../assets/images/qr_img.JPG";
import qr_zalo from "../../assets/images/qr_zalo.JPG";
import heroChildren from "../../assets/images/heroChildren.png";

const { Title, Paragraph } = Typography;

/* =========================================================
   ASSETS
========================================================= */

const ASSETS = {
  logo,
  heroChildren,

  bankQr: backqr,
  zaloQr: qr_zalo,
};

/* =========================================================
   CONFIG
========================================================= */

const YEARLY_PACKAGE_AMOUNT = 599000;
const LIFETIME_PACKAGE_AMOUNT = 2599000;

const ADMIN_PHONE = "0336041807";
const ADMIN_EMAIL = "tranhung6829@gmail.com";

/* =========================================================
   HELPERS
========================================================= */

const formatMoney = (value) => {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
};

const formatDate = (value) => {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* =========================================================
   QR COMPONENT
========================================================= */

const QrBox = ({ src, title, subtitle }) => {
  return (
    <div className="fe-qr-box">
      <div className="fe-qr-title">{title}</div>

      <div className="fe-qr-image-wrap">
        {src ? (
          <img src={src} alt={title} className="fe-qr-image" />
        ) : (
          <div className="fe-qr-placeholder">
            <QrCode size={42} />

            <strong>Chưa cấu hình QR</strong>

            <span>Thêm QR tại ASSETS</span>
          </div>
        )}
      </div>

      {subtitle && <div className="fe-qr-subtitle">{subtitle}</div>}
    </div>
  );
};

/* =========================================================
   FEATURE ITEM
========================================================= */

const Feature = ({ children }) => {
  return (
    <div className="fe-feature">
      <CheckCircle2 size={18} />

      <span>{children}</span>
    </div>
  );
};

/* =========================================================
   PACKAGE CARD
========================================================= */

const PackageCard = ({
  premium = false,
  popular,
  icon,
  title,
  subtitle,
  price,
  unit,
  features = [],
  offerTitle,
  offerDescription,
  buttonText,
  onClick,
}) => {
  return (
    <article
      className={`fe-package-card ${premium ? "fe-package-premium" : ""}`}
    >
      {popular && (
        <div className="fe-popular">
          <Crown size={15} />
          {popular}
        </div>
      )}

      {/* HEADER */}

      <div className="fe-package-header">
        <div className="fe-package-icon">{icon}</div>

        <div className="fe-package-header-text">
          <h3>{title}</h3>

          <p>{subtitle}</p>
        </div>
      </div>

      {/* PRICE */}

      <div className="fe-package-price">
        <span>{formatMoney(price)}</span>

        <small>{unit}</small>
      </div>

      {/* OFFER */}

      <div className="fe-package-offer">
        <Sparkles size={19} />

        <div>
          <strong>{offerTitle}</strong>

          <span>{offerDescription}</span>
        </div>
      </div>

      {/* FEATURES */}

      <div className="fe-package-features">
        {features.map((feature, index) => (
          <Feature key={`${title}-${index}`}>{feature}</Feature>
        ))}
      </div>

      {/* BUTTON */}

      <Button className="fe-package-button" onClick={onClick}>
        {buttonText}

        <ArrowRight size={18} />
      </Button>
    </article>
  );
};

/* =========================================================
   INTRO FEATURE
========================================================= */

const IntroFeature = ({ icon, title, description }) => {
  return (
    <div className="fe-intro-feature">
      <div className="fe-intro-feature-icon">{icon}</div>

      <div>
        <strong>{title}</strong>

        <span>{description}</span>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

const LicenseExpiredPage = () => {
  const navigate = useNavigate();

  const { license, refreshLicense } = useLicense();

  /* =======================================================
     LICENSE DATA
  ======================================================= */

  const licenseData = license?.license || license || {};

  const licenseType =
    licenseData?.license_type ||
    licenseData?.type ||
    license?.license_type ||
    license?.type ||
    null;

  const isTrial =
    licenseType === "trial" ||
    licenseData?.is_trial === true ||
    license?.is_trial === true;

  const isYearly =
    licenseType === "yearly" ||
    licenseData?.is_yearly === true ||
    license?.is_yearly === true;

  const isLifetime =
    licenseType === "lifetime" ||
    licenseData?.is_lifetime === true ||
    license?.is_lifetime === true;

  const trialExpiresAt =
    licenseData?.trial_expires_at || license?.trial_expires_at || null;

  const licenseExpiresAt =
    licenseData?.license_expires_at ||
    licenseData?.expires_at ||
    license?.license_expires_at ||
    null;

  const church = license?.church || {};

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleRefresh = async () => {
    try {
      await refreshLicense();
    } catch (error) {}
  };

  const handleCall = () => {
    window.location.href = `tel:${ADMIN_PHONE}`;
  };

  const handleZalo = () => {
    window.open(
      `https://zalo.me/${ADMIN_PHONE}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleEmail = () => {
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=Đăng ký kích hoạt FaithEdu`;
  };

  const handleYearly = () => {
    navigate("/license");
  };

  const handleLifetime = () => {
    handleZalo();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("faidedu_license_expired");

    sessionStorage.clear();

    window.location.replace("/");
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const getStatus = () => {
    if (isLifetime) {
      return {
        label: "GÓI VĨNH VIỄN",
        title: "FaithEdu đồng hành cùng giáo xứ mãi mãi",
        description:
          "Giáo xứ đang sử dụng gói FaithEdu Vĩnh viễn. Hệ thống không yêu cầu gia hạn thời gian sử dụng.",
        type: "lifetime",
      };
    }

    if (isYearly) {
      return {
        label: "GÓI 1 NĂM ĐÃ HẾT HẠN",
        title: "Tiếp tục đồng hành cùng giáo xứ của bạn",
        description:
          "Thời hạn sử dụng FaithEdu 1 năm đã kết thúc. Dữ liệu lớp học, giáo lý viên và thiếu nhi vẫn được bảo lưu trên hệ thống.",
        type: "yearly",
      };
    }

    return {
      label: "THỜI GIAN DÙNG THỬ ĐÃ HẾT HẠN",
      title: "Tiếp tục quản lý giáo lý cùng FaithEdu",
      description:
        "Thời gian trải nghiệm miễn phí đã kết thúc. Dữ liệu giáo xứ vẫn được bảo toàn để bạn có thể tiếp tục sử dụng sau khi kích hoạt.",
      type: "trial",
    };
  };

  const status = getStatus();

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="faith-expired-page">
      <style>{`

        /* =====================================================
           GLOBAL
        ===================================================== */

        .faith-expired-page,
        .faith-expired-page * {
          box-sizing: border-box;
        }

        .faith-expired-page {
          --navy: #073b78;
          --navy-dark: #052d5c;

          --blue: #1268c4;
          --blue-light: #eaf4ff;

          --gold: #f5b92f;
          --gold-light: #fff4d2;

          --green: #16965a;
          --green-light: #e9f9f0;

          --text: #163653;
          --text-dark: #0d3155;
          --muted: #70849a;

          --border: #dce8f4;

          min-height: 100vh;

          width: 100%;

          overflow-x: hidden;

          color: var(--text);

          font-family:
            "Be Vietnam Pro",
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          background:
            radial-gradient(
              circle at 50% -20%,
              #cce8ff 0,
              rgba(204,232,255,0) 45%
            ),
            linear-gradient(
              135deg,
              #f7fbff 0%,
              #edf5fc 50%,
              #f9fbff 100%
            );
        }

        .faith-expired-page button {
          font-family: inherit;
        }

        /* =====================================================
           PAGE CONTAINER
        ===================================================== */

        .fe-page-container {
          position: relative;

          z-index: 2;

          width: 100%;

          max-width: 1700px;

          margin: 0 auto;

          padding:
            26px
            30px
            22px;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .fe-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          margin-bottom: 22px;
        }

        .fe-logo-area {
          display: flex;

          align-items: center;

          gap: 13px;
        }

        .fe-logo {
          width: 58px;
          height: 58px;

          display: grid;

          place-items: center;

          overflow: hidden;

          border-radius: 16px;

          background: white;

          box-shadow:
            0 8px 25px
            rgba(20,73,125,.12);
        }

        .fe-logo img {
          width: 100%;
          height: 100%;

          object-fit: contain;
        }

        .fe-logo-text strong {
          display: block;

          color: var(--navy);

          font-size: 25px;

          font-weight: 900;

          line-height: 1.1;

          letter-spacing: -.8px;
        }

        .fe-logo-text strong span {
          color: var(--gold);
        }

        .fe-logo-text small {
          display: block;

          margin-top: 5px;

          color: var(--muted);

          font-size: 11px;

          font-weight: 600;
        }

        .fe-header-security {
          display: flex;

          align-items: center;

          gap: 9px;

          padding:
            10px
            14px;

          color: #286086;

          font-size: 11px;

          font-weight: 700;

          border:
            1px solid
            var(--border);

          border-radius: 12px;

          background:
            rgba(255,255,255,.8);
        }

        .fe-header-security svg {
          color: var(--green);
        }

        /* =====================================================
           HERO STATUS
        ===================================================== */

        .fe-status-hero {
          position: relative;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            300px;

          gap: 25px;

          min-height: 280px;

          overflow: hidden;

          padding:
            32px
            36px;

          color: white;

          border-radius: 28px;

          background:
            radial-gradient(
              circle at 90% 20%,
              rgba(46,151,239,.65),
              transparent 35%
            ),
            radial-gradient(
              circle at 10% 100%,
              rgba(16,135,213,.4),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #063576,
              #0c4d9f 55%,
              #0875c9
            );

          box-shadow:
            0 22px 55px
            rgba(9,65,126,.18);
        }

        .fe-status-hero::before {
          content: "";

          position: absolute;

          width: 440px;
          height: 440px;

          right: -220px;
          bottom: -300px;

          border:
            1px solid
            rgba(255,255,255,.13);

          border-radius: 50%;
        }

        .fe-status-content {
          position: relative;

          z-index: 2;

          min-width: 0;
        }

        .fe-status-badge {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          padding:
            8px
            13px;

          color: #fff;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: .6px;

          border:
            1px solid
            rgba(255,255,255,.22);

          border-radius: 999px;

          background:
            rgba(255,255,255,.1);
        }

        .fe-status-badge svg {
          color: #ffdc70;
        }

        .fe-status-title.ant-typography {
          margin:
            18px
            0
            12px !important;

          max-width: 850px;

          color: white !important;

          font-size:
            clamp(
              30px,
              3.2vw,
              48px
            ) !important;

          font-weight: 900 !important;

          line-height: 1.18 !important;

          letter-spacing: -1.8px;
        }

        .fe-status-description.ant-typography {
          max-width: 850px;

          margin: 0 !important;

          color: #e4f1ff !important;

          font-size: 14px;

          line-height: 1.8;
        }

        .fe-status-description strong {
          color: white;
        }

        .fe-church {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          margin-top: 18px;

          padding:
            8px
            12px;

          color: #e7f3ff;

          font-size: 11px;

          border:
            1px solid
            rgba(255,255,255,.16);

          border-radius: 10px;

          background:
            rgba(255,255,255,.08);
        }

        .fe-church strong {
          color: white;
        }

        /* =====================================================
           HERO IMAGE
        ===================================================== */

        .fe-hero-image {
          position: relative;

          z-index: 2;

          display: flex;

          align-items: flex-end;

          justify-content: center;

          min-width: 0;
        }

        .fe-hero-image img {
          width: 100%;

          max-width: 300px;

          max-height: 240px;

          object-fit: contain;

          filter:
            drop-shadow(
              0 18px 18px
              rgba(0,25,70,.28)
            );
        }

        /* =====================================================
           QUICK FEATURES
        ===================================================== */

        .fe-intro-features {
          display: grid;

          grid-template-columns:
            repeat(5, minmax(0,1fr));

          gap: 12px;

          margin-top: 18px;
        }

        .fe-intro-feature {
          display: flex;

          align-items: center;

          gap: 10px;

          min-width: 0;

          padding:
            13px
            12px;

          border:
            1px solid
            var(--border);

          border-radius: 15px;

          background:
            rgba(255,255,255,.9);

          box-shadow:
            0 5px 18px
            rgba(30,77,125,.04);
        }

        .fe-intro-feature-icon {
          display: grid;

          flex: 0 0 38px;

          width: 38px;
          height: 38px;

          place-items: center;

          color: var(--blue);

          border-radius: 11px;

          background:
            var(--blue-light);
        }

        .fe-intro-feature strong {
          display: block;

          color: #20466c;

          font-size: 10px;

          line-height: 1.45;
        }

        .fe-intro-feature span {
          display: block;

          margin-top: 3px;

          color: var(--muted);

          font-size: 9px;

          line-height: 1.45;
        }

        /* =====================================================
           MAIN GRID
        ===================================================== */

        .fe-main-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.7fr)
            minmax(300px, .7fr);

          gap: 20px;

          margin-top: 22px;

          align-items: stretch;
        }

        /* =====================================================
           PACKAGES SECTION
        ===================================================== */

        .fe-packages-section {
          min-width: 0;

          padding:
            25px;

          border:
            1px solid
            var(--border);

          border-radius: 24px;

          background:
            rgba(255,255,255,.92);

          box-shadow:
            0 10px 30px
            rgba(24,73,124,.055);
        }

        .fe-section-heading {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 15px;

          margin-bottom: 20px;
        }

        .fe-section-label {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          color: #1267c4;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 1px;
        }

        .fe-section-heading h2 {
          margin:
            6px
            0
            5px;

          color: var(--text-dark);

          font-size:
            clamp(
              24px,
              2vw,
              32px
            );

          font-weight: 900;

          line-height: 1.25;

          letter-spacing: -.8px;
        }

        .fe-section-heading p {
          max-width: 680px;

          margin: 0;

          color: var(--muted);

          font-size: 12px;

          line-height: 1.7;
        }

        .fe-package-grid {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0,1fr));

          gap: 18px;
        }

        /* =====================================================
           PACKAGE CARD
        ===================================================== */

        .fe-package-card {
          position: relative;

          display: flex;

          flex-direction: column;

          min-width: 0;

          padding:
            21px;

          border:
            1px solid
            #d9e6f3;

          border-radius: 21px;

          background: white;

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease;
        }

        .fe-package-card:hover {
          transform: translateY(-3px);

          border-color: #a5c9ed;

          box-shadow:
            0 16px 35px
            rgba(25,77,130,.1);
        }

        .fe-package-premium {
          border:
            1.5px solid
            #e8bd48;

          background:
            linear-gradient(
              150deg,
              #fffdf8,
              #fff8e5
            );
        }

        .fe-popular {
          position: absolute;

          top: -13px;
          right: 17px;

          display: inline-flex;

          align-items: center;

          gap: 5px;

          padding:
            7px
            12px;

          color: #6d4700;

          font-size: 9px;

          font-weight: 900;

          border:
            2px solid
            white;

          border-radius: 999px;

          background:
            #ffd45e;

          box-shadow:
            0 5px 15px
            rgba(180,120,0,.15);
        }

        .fe-package-header {
          display: flex;

          align-items: center;

          gap: 13px;

          padding-bottom: 17px;

          border-bottom:
            1px solid
            #e7eef6;
        }

        .fe-package-premium
          .fe-package-header {
          border-bottom-color:
            #f0e1bd;
        }

        .fe-package-icon {
          display: grid;

          flex: 0 0 50px;

          width: 50px;
          height: 50px;

          place-items: center;

          color: #0968c9;

          border-radius: 14px;

          background:
            #e8f4ff;
        }

        .fe-package-premium
          .fe-package-icon {
          color: #a86a00;

          background:
            #fff0bd;
        }

        .fe-package-header-text {
          min-width: 0;
        }

        .fe-package-header h3 {
          margin: 0;

          color: var(--text-dark);

          font-size: 19px;

          font-weight: 900;

          line-height: 1.3;
        }

        .fe-package-header p {
          margin:
            4px
            0
            0;

          color: var(--muted);

          font-size: 11px;

          line-height: 1.5;
        }

        /* =====================================================
           PRICE
        ===================================================== */

        .fe-package-price {
          display: flex;

          align-items: baseline;

          justify-content: center;

          gap: 5px;

          padding:
            19px
            0
            14px;
        }

        .fe-package-price span {
          color: var(--blue);

          font-size:
            clamp(
              28px,
              2.5vw,
              38px
            );

          font-weight: 900;

          line-height: 1;

          letter-spacing: -1.2px;
        }

        .fe-package-premium
          .fe-package-price span {
          color: #bd7600;
        }

        .fe-package-price small {
          color: #8292a5;

          font-size: 11px;

          font-weight: 700;
        }

        /* =====================================================
           OFFER
        ===================================================== */

        .fe-package-offer {
          display: flex;

          align-items: flex-start;

          gap: 9px;

          margin-bottom: 16px;

          padding:
            11px;

          color: #76561d;

          border:
            1px solid
            #f1dfae;

          border-radius: 12px;

          background:
            #fff9e9;
        }

        .fe-package-offer svg {
          flex: 0 0 auto;

          margin-top: 1px;

          color: #d89400;
        }

        .fe-package-offer strong {
          display: block;

          color: #8d5d00;

          font-size: 11px;

          font-weight: 900;
        }

        .fe-package-offer span {
          display: block;

          margin-top: 2px;

          font-size: 10px;

          line-height: 1.55;
        }

        /* =====================================================
           FEATURES
        ===================================================== */

        .fe-package-features {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0,1fr));

          gap: 10px 12px;

          flex: 1;

          padding-bottom: 18px;
        }

        .fe-feature {
          display: flex;

          align-items: flex-start;

          gap: 7px;

          color: #45627e;

          font-size: 10px;

          line-height: 1.55;
        }

        .fe-feature svg {
          flex: 0 0 auto;

          margin-top: 1px;

          color: #16965a;
        }

        .fe-package-premium
          .fe-feature svg {
          color: #d3920c;
        }

        /* =====================================================
           PACKAGE BUTTON
        ===================================================== */

        .fe-package-button {
          display: flex !important;

          align-items: center;

          justify-content: center;

          gap: 8px;

          width: 100%;

          height: 47px !important;

          margin-top: auto;

          color: white !important;

          font-size: 11px !important;

          font-weight: 900 !important;

          border: none !important;

          border-radius: 12px !important;

          background:
            linear-gradient(
              110deg,
              #1478dc,
              #0c4ca9
            ) !important;

          box-shadow:
            0 7px 18px
            rgba(15,91,180,.17) !important;
        }

        .fe-package-button:hover {
          filter: brightness(1.06);
        }

        .fe-package-premium
          .fe-package-button {
          color: #624000 !important;

          background:
            linear-gradient(
              110deg,
              #ffdc70,
              #f4a91e
            ) !important;
        }

        /* =====================================================
           PAYMENT SIDE
        ===================================================== */

        .fe-payment-side {
          display: flex;

          flex-direction: column;

          gap: 18px;

          min-width: 0;
        }

        .fe-payment-card {
          padding:
            22px;

          border:
            1px solid
            var(--border);

          border-radius: 24px;

          background:
            rgba(255,255,255,.94);

          box-shadow:
            0 10px 30px
            rgba(24,73,124,.055);
        }

        .fe-payment-title {
          display: flex;

          align-items: center;

          gap: 9px;

          color: var(--text-dark);

          font-size: 15px;

          font-weight: 900;
        }

        .fe-payment-title svg {
          color: var(--blue);
        }

        .fe-payment-description {
          margin:
            7px
            0
            17px;

          color: var(--muted);

          font-size: 10px;

          line-height: 1.6;
        }

        .fe-bank-badge {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          width: fit-content;

          margin: 0 auto 13px;

          padding:
            7px
            12px;

          color: #157548;

          font-size: 10px;

          font-weight: 900;

          border-radius: 9px;

          background:
            var(--green-light);
        }

        .fe-bank-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background:
            #1ca767;
        }

        /* =====================================================
           QR
        ===================================================== */

        .fe-qr-box {
          text-align: center;
        }

        .fe-qr-title {
          margin-bottom: 8px;

          color: #45627e;

          font-size: 10px;

          font-weight: 800;
        }

        .fe-qr-image-wrap {
          display: grid;

          width: min(100%, 190px);

          aspect-ratio: 1;

          place-items: center;

          margin: 0 auto;

          padding: 8px;

          overflow: hidden;

          border:
            1px solid
            #dbe7f2;

          border-radius: 16px;

          background: white;

          box-shadow:
            0 6px 20px
            rgba(30,75,125,.08);
        }

        .fe-qr-image {
          width: 100%;
          height: 100%;

          object-fit: contain;
        }

        .fe-qr-placeholder {
          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 7px;

          width: 100%;
          height: 100%;

          color: #5590c9;

          border:
            1px dashed
            #a9c9e7;

          border-radius: 11px;

          background:
            #f5faff;
        }

        .fe-qr-placeholder strong {
          font-size: 10px;
        }

        .fe-qr-placeholder span {
          font-size: 9px;
        }

        .fe-qr-subtitle {
          margin-top: 8px;

          color: #8192a5;

          font-size: 9px;

          line-height: 1.55;
        }

        /* =====================================================
           PAYMENT DETAILS
        ===================================================== */

        .fe-payment-details {
          margin-top: 15px;

          padding:
            12px;

          color: #5e7389;

          font-size: 9px;

          line-height: 1.9;

          text-align: left;

          border:
            1px solid
            #e2ebf4;

          border-radius: 12px;

          background:
            #f6f9fc;
        }

        .fe-payment-details strong {
          color: #244868;
        }

        /* =====================================================
           ZALO CARD
        ===================================================== */

        .fe-zalo-card {
          background:
            linear-gradient(
              145deg,
              #eef8ff,
              white
            );

          border-color:
            #d2e8f9;
        }

        .fe-zalo-title {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          color: #0875d1;

          font-size: 14px;

          font-weight: 900;
        }

        .fe-zalo-card .fe-qr-image-wrap {
          width: 140px;

          margin-top: 13px;
        }

        .fe-contact-actions {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0,1fr));

          gap: 5px;

          margin-top: 14px;
        }

        .fe-contact-actions .ant-btn {
          display: flex !important;

          align-items: center;

          justify-content: center;

          gap: 4px;

          height: 34px;

          padding:
            0
            5px;

          color: #1268c4;

          font-size: 9px;

          font-weight: 800;

          border-radius: 9px;
        }

        /* =====================================================
           BOTTOM BENEFITS
        ===================================================== */

        .fe-benefits {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0,1fr));

          gap: 12px;

          margin-top: 20px;
        }

        .fe-benefit {
          display: flex;

          align-items: center;

          gap: 11px;

          min-width: 0;

          padding:
            14px;

          border:
            1px solid
            var(--border);

          border-radius: 15px;

          background:
            rgba(255,255,255,.88);
        }

        .fe-benefit-icon {
          display: grid;

          flex: 0 0 39px;

          width: 39px;
          height: 39px;

          place-items: center;

          color: #0875e1;

          border-radius: 11px;

          background:
            #e6f4ff;
        }

        .fe-benefit:nth-child(2)
          .fe-benefit-icon {
          color: #c98a00;

          background:
            #fff2ca;
        }

        .fe-benefit:nth-child(3)
          .fe-benefit-icon {
          color: #168d58;

          background:
            #e7f8ee;
        }

        .fe-benefit:nth-child(4)
          .fe-benefit-icon {
          color: #a148bd;

          background:
            #f7e7fd;
        }

        .fe-benefit strong {
          display: block;

          color: #264a6c;

          font-size: 10px;

          font-weight: 900;
        }

        .fe-benefit span {
          display: block;

          margin-top: 3px;

          color: var(--muted);

          font-size: 8px;

          line-height: 1.45;
        }

        /* =====================================================
           LICENSE BAR
        ===================================================== */

        .fe-license-bar {
          display: flex;

          align-items: center;

          gap: 13px;

          margin-top: 18px;

          padding:
            13px
            15px;

          border:
            1px solid
            var(--border);

          border-radius: 15px;

          background:
            rgba(255,255,255,.95);
        }

        .fe-license-icon {
          display: grid;

          flex: 0 0 40px;

          width: 40px;
          height: 40px;

          place-items: center;

          color: #1768bf;

          border-radius: 11px;

          background:
            #eaf3ff;
        }

        .fe-license-copy {
          flex: 1;

          min-width: 0;
        }

        .fe-license-copy strong {
          display: block;

          color: #183f66;

          font-size: 10px;

          font-weight: 900;
        }

        .fe-license-copy span {
          display: block;

          margin-top: 3px;

          color: #7b8da1;

          font-size: 9px;

          line-height: 1.55;
        }

        .fe-license-actions {
          display: flex;

          gap: 7px;
        }

        .fe-license-actions .ant-btn {
          display: flex !important;

          align-items: center;

          justify-content: center;

          gap: 6px;

          height: 38px;

          padding:
            0
            13px;

          font-size: 9px;

          font-weight: 800;

          border-radius: 10px;
        }

        .fe-refresh-btn {
          color: #0757b3 !important;

          border-color:
            #b7d5f5 !important;

          background: white !important;
        }

        .fe-logout-btn {
          color: white !important;

          border: none !important;

          background:
            #124b99 !important;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .fe-footer {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 6px;

          margin-top: 15px;

          color: #8494a7;

          font-size: 9px;

          text-align: center;
        }

        .fe-footer svg {
          color: #e5a817;
        }

        /* =====================================================
           LARGE DESKTOP
        ===================================================== */

        @media (min-width: 1500px) {
          .fe-page-container {
            padding-top: 32px;
          }

          .fe-status-hero {
            min-height: 310px;

            padding:
              40px
              45px;
          }

          .fe-status-title.ant-typography {
            font-size: 52px !important;
          }

          .fe-status-description.ant-typography {
            font-size: 15px;
          }

          .fe-intro-feature strong {
            font-size: 11px;
          }

          .fe-intro-feature span {
            font-size: 10px;
          }
        }

        /* =====================================================
           LAPTOP
        ===================================================== */

        @media (max-width: 1250px) {
          .fe-page-container {
            padding:
              20px;
          }

          .fe-intro-features {
            grid-template-columns:
              repeat(3, minmax(0,1fr));
          }

          .fe-main-grid {
            grid-template-columns:
              minmax(0, 1.55fr)
              minmax(280px, .7fr);
          }

          .fe-package-features {
            grid-template-columns:
              minmax(0,1fr);
          }
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 900px) {
          .fe-page-container {
            padding:
              18px;
          }

          .fe-header {
            margin-bottom: 16px;
          }

          .fe-header-security {
            display: none;
          }

          .fe-status-hero {
            grid-template-columns:
              minmax(0,1fr);

            min-height: auto;

            padding:
              28px;
          }

          .fe-hero-image {
            display: none;
          }

          .fe-status-title.ant-typography {
            font-size: 38px !important;
          }

          .fe-intro-features {
            grid-template-columns:
              repeat(2, minmax(0,1fr));
          }

          .fe-main-grid {
            grid-template-columns:
              minmax(0,1fr);
          }

          .fe-payment-side {
            display: grid;

            grid-template-columns:
              repeat(2, minmax(0,1fr));
          }

          .fe-benefits {
            grid-template-columns:
              repeat(2, minmax(0,1fr));
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {
          .fe-page-container {
            padding:
              12px;
          }

          .fe-header {
            align-items: flex-start;
          }

          .fe-logo {
            width: 48px;
            height: 48px;

            border-radius: 13px;
          }

          .fe-logo-text strong {
            font-size: 21px;
          }

          .fe-logo-text small {
            font-size: 9px;
          }

          .fe-status-hero {
            padding:
              23px;

            border-radius: 22px;
          }

          .fe-status-badge {
            font-size: 9px;
          }

          .fe-status-title.ant-typography {
            margin-top: 14px !important;

            font-size: 30px !important;

            letter-spacing: -1px;
          }

          .fe-status-description.ant-typography {
            font-size: 12px;

            line-height: 1.7;
          }

          .fe-church {
            align-items: flex-start;

            font-size: 9px;

            line-height: 1.5;
          }

          .fe-intro-features {
            grid-template-columns:
              minmax(0,1fr);

            gap: 8px;
          }

          .fe-packages-section {
            padding:
              17px;

            border-radius: 20px;
          }

          .fe-section-heading {
            display: block;
          }

          .fe-section-heading h2 {
            font-size: 24px;
          }

          .fe-section-heading p {
            font-size: 10px;
          }

          .fe-package-grid {
            grid-template-columns:
              minmax(0,1fr);
          }

          .fe-package-card {
            padding:
              18px;
          }

          .fe-package-header {
            padding-bottom: 15px;
          }

          .fe-package-price span {
            font-size: 34px;
          }

          .fe-package-features {
            grid-template-columns:
              minmax(0,1fr);
          }

          .fe-payment-side {
            grid-template-columns:
              minmax(0,1fr);
          }

          .fe-payment-card {
            padding:
              18px;
          }

          .fe-qr-image-wrap {
            width: 180px;
          }

          .fe-benefits {
            grid-template-columns:
              minmax(0,1fr);
          }

          .fe-license-bar {
            align-items: flex-start;

            flex-wrap: wrap;
          }

          .fe-license-copy {
            flex:
              1
              1
              calc(100% - 55px);
          }

          .fe-license-actions {
            width: 100%;
          }

          .fe-license-actions .ant-btn {
            flex: 1;
          }
        }

        /* =====================================================
           VERY SMALL
        ===================================================== */

        @media (max-width: 380px) {
          .fe-page-container {
            padding:
              8px;
          }

          .fe-status-hero {
            padding:
              19px;
          }

          .fe-status-title.ant-typography {
            font-size: 27px !important;
          }

          .fe-packages-section {
            padding:
              14px;
          }

          .fe-package-card {
            padding:
              15px;
          }

          .fe-package-price span {
            font-size: 30px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .fe-package-card {
            transition: none;
          }
        }

      `}</style>

      {/* =====================================================
          PAGE
      ===================================================== */}

      <div className="fe-page-container">
        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="fe-header">
          <div className="fe-logo-area">
            <div className="fe-logo">
              {ASSETS.logo ? (
                <img src={ASSETS.logo} alt="FaithEdu" />
              ) : (
                <ShieldCheck size={30} />
              )}
            </div>

            <div className="fe-logo-text">
              <strong>
                Faith<span>Edu</span>
              </strong>

              <small>Nền tảng quản lý giáo lý số</small>
            </div>
          </div>

          <div className="fe-header-security">
            <LockKeyhole size={17} />
            Dữ liệu giáo xứ vẫn được bảo toàn
          </div>
        </header>

        {/* ===================================================
            STATUS HERO
        =================================================== */}

        <section className="fe-status-hero">
          <div className="fe-status-content">
            <div className="fe-status-badge">
              {isLifetime ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}

              {status.label}
            </div>

            <Title level={1} className="fe-status-title">
              {status.title}
            </Title>

            <Paragraph className="fe-status-description">
              {status.description}
            </Paragraph>

            {church?.name && (
              <div className="fe-church">
                <ShieldCheck size={15} />

                <span>
                  Giáo xứ: <strong>{church.name}</strong>
                  {church.address ? ` · ${church.address}` : ""}
                </span>
              </div>
            )}
          </div>

          <div className="fe-hero-image">
            {ASSETS.heroChildren && (
              <img src={ASSETS.heroChildren} alt="Thiếu nhi FaithEdu" />
            )}
          </div>
        </section>

        {/* ===================================================
            FEATURES
        =================================================== */}

        <section className="fe-intro-features">
          <IntroFeature
            icon={<Users size={20} />}
            title="Quản lý lớp học"
            description="Lớp, giáo viên và học sinh"
          />

          <IntroFeature
            icon={<BookOpen size={20} />}
            title="Kho giáo lý"
            description="Bài giảng và câu hỏi"
          />

          <IntroFeature
            icon={<ClipboardCheck size={20} />}
            title="Điểm danh"
            description="Theo dõi chuyên cần"
          />

          <IntroFeature
            icon={<FileText size={20} />}
            title="Kết quả"
            description="Điểm số và chứng chỉ"
          />

          <IntroFeature
            icon={<HeartHandshake size={20} />}
            title="Đồng hành"
            description="Kết nối giáo xứ"
          />
        </section>

        {/* ===================================================
            MAIN
        =================================================== */}

        <div className="fe-main-grid">
          {/* =================================================
              PACKAGES
          ================================================= */}

          <section className="fe-packages-section">
            <div className="fe-section-heading">
              <div>
                <div className="fe-section-label">
                  <Sparkles size={14} />
                  GÓI DỊCH VỤ FAITHEDU
                </div>

                <h2>Tiếp tục sử dụng FaithEdu</h2>

                <p>
                  Chọn gói phù hợp để giáo xứ tiếp tục quản lý lớp giáo lý, học
                  sinh, điểm danh, kết quả và các hoạt động giáo lý trên cùng
                  một hệ thống.
                </p>
              </div>
            </div>

            <div className="fe-package-grid">
              {/* =============================================
                  YEARLY
              ============================================= */}

              <PackageCard
                title="Gói 1 năm"
                subtitle="Phù hợp cho giáo xứ muốn gia hạn theo năm"
                icon={<CalendarDays size={26} />}
                price={YEARLY_PACKAGE_AMOUNT}
                unit="đ / năm"
                features={[
                  "Quản lý lớp giáo lý",
                  "Quản lý giáo lý viên",
                  "Quản lý học sinh",
                  "Điểm danh và theo dõi kết quả",
                  "Báo cáo giáo lý",
                  "Thư viện bài giảng",
                  "Ngân hàng câu hỏi",
                  "Hỗ trợ sử dụng",
                ]}
                offerTitle="Sử dụng trong 1 năm"
                offerDescription="Có thể tiếp tục gia hạn khi hết thời hạn."
                buttonText="Đăng ký gói 1 năm"
                onClick={handleYearly}
              />

              {/* =============================================
                  LIFETIME
              ============================================= */}

              <PackageCard
                premium
                popular="GÓI DÀI HẠN"
                title="Gói Vĩnh viễn"
                subtitle="Kích hoạt một lần, không cần gia hạn"
                icon={<InfinityIcon size={29} />}
                price={LIFETIME_PACKAGE_AMOUNT}
                unit="đ"
                features={[
                  "Không giới hạn thời gian sử dụng",
                  "Quản lý lớp giáo lý",
                  "Quản lý giáo lý viên",
                  "Quản lý học sinh",
                  "Điểm danh và kết quả",
                  "Báo cáo giáo lý",
                  "Thư viện bài giảng",
                  "Hỗ trợ kích hoạt",
                ]}
                offerTitle="Kích hoạt vĩnh viễn"
                offerDescription="Liên hệ Admin để xác nhận và kích hoạt."
                buttonText="Liên hệ Admin"
                onClick={handleLifetime}
              />
            </div>
          </section>

          {/* =================================================
              PAYMENT
          ================================================= */}

          <aside className="fe-payment-side">
            {/* ===============================================
                BANK
            =============================================== */}

            <div className="fe-payment-card">
              <div className="fe-payment-title">
                <CreditCard size={20} />
                Thanh toán FaithEdu
              </div>

              <p className="fe-payment-description">
                Quét mã QR bên dưới để chuyển khoản. Sau khi thanh toán, vui
                lòng gửi thông tin cho Admin để được xác nhận và kích hoạt.
              </p>

              <div className="fe-bank-badge">
                <span className="fe-bank-dot" />
                MBBANK
              </div>

              <QrBox
                src={ASSETS.bankQr}
                title="QR chuyển khoản"
                subtitle="Dùng cho cả gói 1 năm và gói Vĩnh viễn"
              />

              <div className="fe-payment-details">
                Ngân hàng: <strong>MBBank</strong>
                <br />
                Chủ tài khoản: <strong>TRAN KHANH HUNG</strong>
                <br />
                Nội dung: <strong>Tên giáo xứ + Gói đăng ký</strong>
              </div>
            </div>

            {/* ===============================================
                ZALO
            =============================================== */}

            <div className="fe-payment-card fe-zalo-card">
              <div className="fe-zalo-title">
                <MessageCircle size={20} />
                Hỗ trợ qua Zalo
              </div>

              <p className="fe-payment-description">
                Quét mã Zalo hoặc sử dụng một trong các phương thức liên hệ bên
                dưới.
              </p>

              <QrBox
                src={ASSETS.zaloQr}
                title="Zalo hỗ trợ FaithEdu"
                subtitle="Tư vấn gói dịch vụ và xác nhận thanh toán"
              />

              <div className="fe-contact-actions">
                <Button type="link" onClick={handleZalo}>
                  <MessageCircle size={14} />
                  Zalo
                </Button>

                <Button type="link" onClick={handleCall}>
                  <Phone size={14} />
                  Gọi
                </Button>

                <Button type="link" onClick={handleEmail}>
                  <Mail size={14} />
                  Email
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* ===================================================
            BENEFITS
        =================================================== */}

        <section className="fe-benefits">
          <div className="fe-benefit">
            <div className="fe-benefit-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>Bảo mật dữ liệu</strong>

              <span>Dữ liệu giáo xứ được lưu trữ an toàn</span>
            </div>
          </div>

          <div className="fe-benefit">
            <div className="fe-benefit-icon">
              <HeartHandshake size={20} />
            </div>

            <div>
              <strong>Hỗ trợ tận tâm</strong>

              <span>Đồng hành trong quá trình sử dụng</span>
            </div>
          </div>

          <div className="fe-benefit">
            <div className="fe-benefit-icon">
              <Smartphone size={20} />
            </div>

            <div>
              <strong>Dễ sử dụng</strong>

              <span>Giao diện trực quan trên mọi thiết bị</span>
            </div>
          </div>

          <div className="fe-benefit">
            <div className="fe-benefit-icon">
              <Headphones size={20} />
            </div>

            <div>
              <strong>Cập nhật liên tục</strong>

              <span>Hoàn thiện tính năng theo nhu cầu</span>
            </div>
          </div>
        </section>

        {/* ===================================================
            LICENSE STATUS
        =================================================== */}

        <section className="fe-license-bar">
          <div className="fe-license-icon">
            <Clock3 size={21} />
          </div>

          <div className="fe-license-copy">
            <strong>{status.label}</strong>

            <span>
              {isTrial && trialExpiresAt && (
                <>
                  Hết hạn dùng thử:{" "}
                  <strong>{formatDate(trialExpiresAt)}</strong>.{" "}
                </>
              )}

              {isYearly && licenseExpiresAt && (
                <>
                  Hết hạn gói 1 năm:{" "}
                  <strong>{formatDate(licenseExpiresAt)}</strong>.{" "}
                </>
              )}

              {isLifetime
                ? "Giấy phép vĩnh viễn đã được kích hoạt."
                : "Vui lòng đăng ký hoặc liên hệ Admin để tiếp tục sử dụng đầy đủ FaithEdu."}
            </span>
          </div>

          <div className="fe-license-actions">
            <Button
              className="fe-refresh-btn"
              icon={<RefreshCw size={15} />}
              onClick={handleRefresh}
            >
              Kiểm tra lại
            </Button>

            <Button
              className="fe-logout-btn"
              icon={<LogIn size={15} />}
              onClick={handleLogout}
            >
              Đổi tài khoản
            </Button>
          </div>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="fe-footer">
          <Sparkles size={13} />
          FaithEdu · Số hóa giáo lý – Kết nối đức tin
        </footer>
      </div>
    </div>
  );
};

export default LicenseExpiredPage;
