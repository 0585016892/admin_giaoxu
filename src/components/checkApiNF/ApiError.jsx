import React, { useState } from "react";
import { Button } from "antd";
import {
  ReloadOutlined,
  HomeOutlined,
  WarningFilled,
  HeartFilled,
  WifiOutlined,
  BookFilled,
  TeamOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ============================================================
// TODO: IMAGE - LOGO FAITHEDU
// Thay đường dẫn này bằng logo FaithEdu của m
// ============================================================
import logo from "../../assets/images/logoweb.png";

// ============================================================
// TODO: IMAGE - BACKGROUND DESKTOP
// Ảnh Chúa Giêsu + các bạn trẻ
// Khuyến nghị: 1920x1080 hoặc 1920x1200
// Không cần chèn chữ vào ảnh
// ============================================================
import backgroundPC from "../../assets/images/faithedu-error-bg.png";

// ============================================================
// TODO: IMAGE - BACKGROUND MOBILE
// Nếu chưa có ảnh mobile thì để null
// Khuyến nghị: 1080x1920
// ============================================================
// import backgroundMobile from "../../assets/images/faithedu-error-mobile.png";

// ============================================================
// COLOR SYSTEM
// ============================================================

const colors = {
  primary: "#185A96",
  primaryDark: "#0F3A63",
  primaryDeep: "#092B4A",

  blue: "#2876B9",
  blueLight: "#EAF5FF",
  blueSoft: "#F3F9FF",

  gold: "#D4A62A",
  goldLight: "#F7E5A8",

  text: "#334155",
  textLight: "#64748B",

  danger: "#EF5B67",
  dangerLight: "#FFF1F3",

  white: "#FFFFFF",
};

// ============================================================
// MOTION
// ============================================================

const pageVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      duration: 0.6,
    },
  },
};

const backgroundVariants = {
  hidden: {
    scale: 1.08,
    opacity: 0,
  },

  visible: {
    scale: 1,
    opacity: 1,

    transition: {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    x: 80,
    scale: 0.94,
  },

  visible: {
    opacity: 1,
    x: 0,
    scale: 1,

    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],

      staggerChildren: 0.08,

      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// ============================================================
// COMPONENT
// ============================================================

const ApiError = ({
  title = "Không thể kết nối đến máy chủ!",

  subTitle = (
    <>
      Hệ thống của <strong>FaithEdu</strong> hiện đang gặp sự cố hoặc đang trong
      quá trình nâng cấp.
      <br />
      Vui lòng kiểm tra kết nối mạng và thử lại sau giây lát.
    </>
  ),

  onRetry,
}) => {
  const navigate = useNavigate();

  const [isRetrying, setIsRetrying] = useState(false);

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry = () => {
    if (isRetrying) return;

    setIsRetrying(true);

    setTimeout(() => {
      if (onRetry) {
        onRetry();

        setIsRetrying(false);
      } else {
        window.location.reload();
      }
    }, 700);
  };

  return (
    <>
      <style>
        {`

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
          margin: 0;
        }

        body {
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
        }


        /* ======================================================
           PAGE
        ====================================================== */

        .faith-error-page {

          position: relative;

          width: 100%;

          min-height: 100vh;
          min-height: 100svh;

          overflow: hidden;

          display: flex;

          align-items: center;

          justify-content: flex-end;

          padding: 40px 7%;

          background:
            linear-gradient(
              135deg,
              #dcefff 0%,
              #eef7ff 50%,
              #ffffff 100%
            );
        }


        /* ======================================================
           BACKGROUND
        ====================================================== */

        .faith-error-background {

          position: absolute;

          inset: 0;

          z-index: 1;

          overflow: hidden;
        }


        .faith-error-background img {

          width: 100%;
          height: 100%;

          object-fit: cover;

          object-position: center;

          display: block;
        }


        /* ======================================================
           BACKGROUND OVERLAY
        ====================================================== */

        .faith-error-overlay {

          position: absolute;

          inset: 0;

          z-index: 2;

          pointer-events: none;

          background:
            linear-gradient(
              90deg,

              rgba(7, 39, 67, 0.03) 0%,

              rgba(255, 255, 255, 0.08) 28%,

              rgba(255, 255, 255, 0.42) 47%,

              rgba(255, 255, 255, 0.82) 67%,

              rgba(255, 255, 255, 0.97) 100%
            );
        }


        /* ======================================================
           LIGHT EFFECTS
        ====================================================== */

        .faith-glow {

          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          z-index: 3;

          filter: blur(80px);
        }


        .faith-glow-1 {

          width: 430px;
          height: 430px;

          top: -160px;

          right: 300px;

          background:
            rgba(95, 181, 255, 0.22);
        }


        .faith-glow-2 {

          width: 400px;
          height: 400px;

          right: -150px;

          bottom: -180px;

          background:
            rgba(212, 166, 42, 0.13);
        }


        /* ======================================================
           LEFT BRAND MESSAGE
        ====================================================== */

        .faith-left-message {

          position: absolute;

          z-index: 6;

          left: 7%;

          top: 16%;

          max-width: 360px;

          color: white;

          text-shadow:
            0 3px 18px rgba(0,0,0,0.2);
        }


        .faith-left-message h2 {

          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: clamp(30px, 3vw, 46px);

          line-height: 1.15;

          font-style: italic;

          font-weight: 700;
        }


        .faith-left-message p {

          margin: 15px 0 0;

          font-size: 12px;

          font-weight: 700;

          letter-spacing: 2px;
        }


        /* ======================================================
           WIFI FLOATING DECORATION
        ====================================================== */

        .faith-floating-wifi {

          position: absolute;

          z-index: 5;

          left: 43%;

          top: 21%;

          width: 92px;
          height: 92px;

          border-radius: 50%;

          display: flex;

          align-items: center;
          justify-content: center;

          background:
            rgba(255,255,255,0.23);

          border:
            1px solid
            rgba(255,255,255,0.5);

          backdrop-filter:
            blur(10px);

          box-shadow:
            0 15px 40px
            rgba(24,90,150,0.15);
        }


        .faith-floating-wifi-icon {

          font-size: 46px;

          color: white;

          opacity: 0.85;

          filter:
            drop-shadow(
              0 3px 8px
              rgba(0,0,0,0.12)
            );
        }


        .faith-floating-wifi-x {

          position: absolute;

          right: 1px;

          bottom: 0;

          width: 28px;
          height: 28px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            ${colors.danger};

          color: white;

          font-size: 13px;

          font-weight: 800;

          border:
            3px solid white;

          box-shadow:
            0 5px 15px
            rgba(239,91,103,0.35);
        }


        /* ======================================================
           MAIN CONTENT
        ====================================================== */

        .faith-error-content {

          position: relative;

          z-index: 20;

          width: 100%;

          max-width: 550px;
        }


        /* ======================================================
           CARD
        ====================================================== */

        .faith-error-card {

          position: relative;

          width: 100%;

          padding: 38px 42px 30px;

          border-radius: 32px;

          text-align: center;

          background:
            rgba(255,255,255,0.86);

          border:
            1px solid
            rgba(255,255,255,0.95);

          box-shadow:

            0 30px 80px
            rgba(15,58,99,0.16),

            0 8px 30px
            rgba(15,58,99,0.07),

            inset
            0 0 0 1px
            rgba(255,255,255,0.65);

          backdrop-filter:
            blur(22px);

          -webkit-backdrop-filter:
            blur(22px);
        }


        /* ======================================================
           CARD DECORATIVE LINE
        ====================================================== */

        .faith-card-top-line {

          position: absolute;

          top: 0;

          left: 12%;

          right: 12%;

          height: 3px;

          border-radius: 999px;

          background:
            linear-gradient(
              90deg,
              transparent,
              ${colors.gold},
              ${colors.primary},
              ${colors.gold},
              transparent
            );

          opacity: 0.75;
        }


        /* ======================================================
           BRAND
        ====================================================== */

        .faith-brand {

          display: flex;

          flex-direction: column;

          align-items: center;

          margin-bottom: 17px;
        }


        .faith-logo-wrapper {

          position: relative;

          margin-bottom: 10px;
        }


        .faith-logo {

          width: 62px;
          height: 62px;

          object-fit: contain;

          border-radius: 17px;

          filter:
            drop-shadow(
              0 8px 15px
              rgba(24,90,150,0.18)
            );
        }


        .faith-name {

          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 31px;

          line-height: 1;

          font-weight: 800;

          letter-spacing: -0.5px;

          color:
            ${colors.primaryDark};
        }


        .faith-name span {

          color:
            ${colors.gold};
        }


        .faith-tagline {

          margin-top: 7px;

          color:
            ${colors.textLight};

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 2px;

          text-transform: uppercase;
        }


        /* ======================================================
           ERROR ICON
        ====================================================== */

        .faith-error-icon-wrapper {

          position: relative;

          width: 88px;
          height: 88px;

          margin: 4px auto 15px;

          display: flex;

          align-items: center;

          justify-content: center;
        }


        .faith-error-icon-bg {

          position: absolute;

          inset: 0;

          border-radius: 50%;

          background:
            linear-gradient(
              145deg,
              #F0F8FF,
              #DCEEFF
            );

          box-shadow:

            inset
            0 2px 5px
            rgba(255,255,255,0.9),

            0 12px 25px
            rgba(24,90,150,0.1);
        }


        .faith-error-icon-ring {

          position: absolute;

          inset: 7px;

          border-radius: 50%;

          border:
            1px dashed
            rgba(24,90,150,0.18);
        }


        .faith-wifi-icon {

          position: relative;

          z-index: 3;

          color:
            ${colors.primary};

          font-size: 43px;

          opacity: 0.8;
        }


        .faith-error-x {

          position: absolute;

          z-index: 5;

          right: 0;

          bottom: 0;

          width: 30px;
          height: 30px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background:
            ${colors.danger};

          color: white;

          font-size: 13px;

          font-weight: 800;

          border:
            3px solid white;

          box-shadow:
            0 5px 15px
            rgba(239,68,68,0.35);
        }


        /* ======================================================
           ALERT
        ====================================================== */

        .faith-error-alert {

          display: inline-flex;

          align-items: center;

          gap: 7px;

          padding:
            6px 14px;

          margin-bottom: 12px;

          border-radius: 999px;

          background:
            ${colors.dangerLight};

          border:
            1px solid
            rgba(239,91,103,0.13);

          color:
            ${colors.danger};

          font-size: 11px;

          font-weight: 800;
        }


        /* ======================================================
           TITLE
        ====================================================== */

        .faith-error-title {

          margin: 0;

          color:
            ${colors.primaryDark};

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(25px, 2.5vw, 33px);

          line-height: 1.22;

          font-weight: 800;

          letter-spacing: -0.4px;
        }


        /* ======================================================
           DESCRIPTION
        ====================================================== */

        .faith-error-subtitle {

          max-width: 450px;

          margin:
            12px auto 23px;

          color:
            ${colors.text};

          font-size: 13px;

          line-height: 1.7;
        }


        .faith-error-subtitle strong {

          color:
            ${colors.primary};
        }


        /* ======================================================
           BUTTONS
        ====================================================== */

        .faith-error-actions {

          width: 100%;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 11px;

          margin-bottom: 23px;
        }


        .faith-error-btn {

          height: 46px !important;

          min-width: 150px;

          padding:
            0 23px !important;

          border-radius:
            999px !important;

          font-size:
            13px !important;

          font-weight:
            700 !important;

          display: inline-flex !important;

          align-items: center;

          justify-content: center;

          gap: 7px;

          transition:
            all 0.25s ease !important;
        }


        /* RETRY */

        .faith-error-btn-retry {

          color: white !important;

          background:
            linear-gradient(
              135deg,
              ${colors.primary},
              ${colors.blue}
            ) !important;

          border:
            none !important;

          box-shadow:
            0 9px 22px
            rgba(24,90,150,0.25) !important;
        }


        .faith-error-btn-retry:hover {

          transform:
            translateY(-2px);

          box-shadow:
            0 13px 28px
            rgba(24,90,150,0.32) !important;
        }


        /* HOME */

        .faith-error-btn-home {

          color:
            ${colors.primary} !important;

          background:
            rgba(255,255,255,0.85) !important;

          border:
            1.5px solid
            rgba(24,90,150,0.18) !important;
        }


        .faith-error-btn-home:hover {

          color:
            ${colors.primaryDark} !important;

          border-color:
            ${colors.primary} !important;

          background:
            white !important;

          transform:
            translateY(-2px);
        }


        /* ======================================================
           VERSE
        ====================================================== */

        .faith-error-verse {

          position: relative;

          width: 100%;

          padding-top: 18px;

          border-top:
            1px dashed
            rgba(24,90,150,0.14);
        }


        .faith-error-cross {

          position: absolute;

          top: -11px;

          left: 50%;

          transform:
            translateX(-50%);

          padding:
            0 10px;

          border-radius: 10px;

          background:
            rgba(255,255,255,0.95);

          color:
            ${colors.gold};

          font-size: 15px;
        }


        .faith-error-verse p {

          margin:
            0 0 4px;

          color:
            ${colors.primary};

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 12.5px;

          font-style: italic;

          line-height: 1.6;
        }


        .faith-error-heart {

          margin-left: 5px;

          color:
            ${colors.danger};

          font-size: 10px;
        }


        .verse-ref {

          color:
            ${colors.textLight};

          font-size: 10px;

          font-weight: 600;
        }


        /* ======================================================
           BOTTOM VALUE CARDS
        ====================================================== */

        .faith-values {

          position: absolute;

          z-index: 8;

          left: 5%;

          bottom: 28px;

          display: flex;

          gap: 9px;
        }


        .faith-value-card {

          display: flex;

          align-items: center;

          gap: 9px;

          padding:
            10px 14px;

          border-radius: 15px;

          background:
            rgba(255,255,255,0.76);

          border:
            1px solid
            rgba(255,255,255,0.88);

          backdrop-filter:
            blur(12px);

          box-shadow:
            0 10px 25px
            rgba(0,0,0,0.06);
        }


        .faith-value-icon {

          width: 32px;
          height: 32px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 9px;

          background:
            ${colors.blueLight};

          color:
            ${colors.primary};

          font-size: 16px;
        }


        .faith-value-title {

          display: block;

          color:
            ${colors.primaryDark};

          font-size: 10px;

          font-weight: 800;
        }


        .faith-value-desc {

          display: block;

          margin-top: 2px;

          color:
            ${colors.textLight};

          font-size: 9px;
        }


        /* ======================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 1200px) {

          .faith-error-page {

            padding-right: 4%;
          }

          .faith-error-content {

            max-width: 510px;
          }

          .faith-left-message {

            left: 4%;
          }

          .faith-values {

            left: 3%;
          }

        }


        @media (max-width: 1024px) {

          .faith-error-page {

            justify-content: center;

            padding:
              25px 20px;
          }


          .faith-error-overlay {

            background:
              linear-gradient(
                180deg,
                rgba(235,246,255,0.45),
                rgba(255,255,255,0.94)
              );
          }


          .faith-left-message {

            display: none;
          }


          .faith-floating-wifi {

            display: none;
          }


          .faith-values {

            display: none;
          }


          .faith-error-content {

            max-width: 560px;
          }

        }


        @media (max-width: 600px) {

          .faith-error-page {

            padding:
              16px 12px;
          }


          .faith-error-card {

            padding:
              29px 19px 24px;

            border-radius:
              25px;
          }


          .faith-logo {

            width: 57px;
            height: 57px;
          }


          .faith-name {

            font-size: 28px;
          }


          .faith-tagline {

            font-size: 8px;

            letter-spacing: 1.4px;
          }


          .faith-error-icon-wrapper {

            width: 82px;
            height: 82px;
          }


          .faith-wifi-icon {

            font-size: 40px;
          }


          .faith-error-x {

            width: 28px;
            height: 28px;

            font-size: 12px;
          }


          .faith-error-title {

            font-size: 23px;
          }


          .faith-error-subtitle {

            font-size: 12.5px;

            line-height: 1.65;
          }


          .faith-error-actions {

            flex-direction: column;

            gap: 8px;
          }


          .faith-error-btn {

            width: 100%;

            max-width: 310px;
          }


          .faith-error-verse p {

            font-size: 11.5px;
          }

        }

        `}
      </style>

      {/* ========================================================
          PAGE
      ======================================================== */}

      <motion.div
        className="faith-error-page"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ======================================================
            TODO: IMAGE - BACKGROUND
        ====================================================== */}

        <motion.div
          className="faith-error-background"
          variants={backgroundVariants}
          initial="hidden"
          animate="visible"
        >
          <picture>
            {/*
              TODO: IMAGE - MOBILE

              Nếu có ảnh mobile thì thêm:

              <source
                media="(max-width: 600px)"
                srcSet={backgroundMobile}
              />

            */}

            <img
              src={backgroundPC}
              alt="FaithEdu - Chúa Giêsu và các bạn trẻ"
            />
          </picture>
        </motion.div>

        {/* ======================================================
            OVERLAY
        ====================================================== */}

        <div className="faith-error-overlay" />

        {/* ======================================================
            AMBIENT LIGHT
        ====================================================== */}

        <motion.div
          className="faith-glow faith-glow-1"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.65, 1, 0.65],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="faith-glow faith-glow-2"
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* ======================================================
            BOTTOM VALUES
        ====================================================== */}

        <motion.div
          className="faith-values"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.8,
          }}
        >
          <div className="faith-value-card">
            <div className="faith-value-icon">
              <BookFilled />
            </div>

            <div>
              <span className="faith-value-title">Giáo dục đức tin</span>

              <span className="faith-value-desc">Học hỏi mỗi ngày</span>
            </div>
          </div>

          <div className="faith-value-card">
            <div className="faith-value-icon">
              <TeamOutlined />
            </div>

            <div>
              <span className="faith-value-title">Cộng đoàn</span>

              <span className="faith-value-desc">Cùng nhau lớn lên</span>
            </div>
          </div>

          <div className="faith-value-card">
            <div className="faith-value-icon">
              <HeartFilled />
            </div>

            <div>
              <span className="faith-value-title">Yêu thương</span>

              <span className="faith-value-desc">Sống và lan tỏa</span>
            </div>
          </div>

          <div className="faith-value-card">
            <div className="faith-value-icon">
              <StarFilled />
            </div>

            <div>
              <span className="faith-value-title">Đức tin</span>

              <span className="faith-value-desc">Kiến tạo tương lai</span>
            </div>
          </div>
        </motion.div>

        {/* ======================================================
            ERROR CARD
        ====================================================== */}

        <div className="faith-error-content">
          <motion.main
            className="faith-error-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="faith-card-top-line" />

            {/* ==================================================
                BRAND
            ================================================== */}

            <motion.div className="faith-brand" variants={itemVariants}>
              {/* TODO: IMAGE - LOGO */}

              <div className="faith-logo-wrapper">
                <motion.img
                  src={logo}
                  alt="FaithEdu"
                  className="faith-logo"
                  whileHover={{
                    scale: 1.08,
                    rotate: 4,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                  }}
                />
              </div>

              <h1 className="faith-name">
                Faith<span>Edu</span>
              </h1>

              <div className="faith-tagline">HỌC • HIỂU • SỐNG • LAN TỎA</div>
            </motion.div>

            {/* ==================================================
                WIFI ERROR ICON
                Không cần ảnh - dùng Ant Design Icon
            ================================================== */}

            <motion.div
              className="faith-error-icon-wrapper"
              variants={itemVariants}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="faith-error-icon-bg" />

              <div className="faith-error-icon-ring" />

              <WifiOutlined className="faith-wifi-icon" />

              <motion.div
                className="faith-error-x"
                animate={{
                  scale: [1, 1.12, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ×
              </motion.div>
            </motion.div>

            {/* ==================================================
                ALERT
            ================================================== */}

            <motion.div className="faith-error-alert" variants={itemVariants}>
              <WarningFilled />

              <span>Kết nối bị gián đoạn</span>
            </motion.div>

            {/* ==================================================
                TITLE
            ================================================== */}

            <motion.h2 className="faith-error-title" variants={itemVariants}>
              {title}
            </motion.h2>

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <motion.p className="faith-error-subtitle" variants={itemVariants}>
              {subTitle}
            </motion.p>

            {/* ==================================================
                BUTTONS
            ================================================== */}

            <motion.div className="faith-error-actions" variants={itemVariants}>
              <motion.div
                whileHover={{
                  scale: 1.025,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                <Button
                  type="primary"
                  icon={<ReloadOutlined spin={isRetrying} />}
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="
                    faith-error-btn
                    faith-error-btn-retry
                  "
                >
                  {isRetrying ? "Đang thử..." : "Thử lại"}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{
                  scale: 1.025,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                <Button
                  icon={<HomeOutlined />}
                  onClick={() => navigate("/")}
                  className="
                    faith-error-btn
                    faith-error-btn-home
                  "
                >
                  Trang chủ
                </Button>
              </motion.div>
            </motion.div>

            {/* ==================================================
                VERSE
            ================================================== */}

            <motion.div className="faith-error-verse" variants={itemVariants}>
              <div className="faith-error-cross">✝</div>

              <p>
                " Cứ để trẻ em đến với Thầy, đừng ngăn cấm chúng, vì Nước Thiên
                Chúa là của những ai giống như chúng."
                <HeartFilled className="faith-error-heart" />
              </p>

              <span className="verse-ref">Mc 10,14</span>
            </motion.div>
          </motion.main>
        </div>
      </motion.div>
    </>
  );
};

export default ApiError;
