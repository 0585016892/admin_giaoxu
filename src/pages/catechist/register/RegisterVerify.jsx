// src/pages/auth/register/RegisterVerify.jsx

import React, { useEffect, useRef, useState } from "react";

import { Alert, Button, Input } from "antd";

import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  MailOutlined,
  ReloadOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";

import { motion, AnimatePresence } from "framer-motion";

const OTP_LENGTH = 6;

const RegisterVerify = ({
  email,
  loading,
  error,
  expiresIn = 300,
  onVerify,
  onBack,
  onResend,
}) => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(expiresIn);
  const [resending, setResending] = useState(false);

  const inputRef = useRef(null);

  /* ==========================================================
     COUNTDOWN
  ========================================================== */

  useEffect(() => {
    setCountdown(expiresIn);
  }, [expiresIn]);

  useEffect(() => {
    if (countdown <= 0) return undefined;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  /* ==========================================================
     AUTO FOCUS
  ========================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus?.();
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  /* ==========================================================
     FORMAT
  ========================================================== */

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
      2,
      "0",
    )}`;
  };

  /* ==========================================================
     OTP
  ========================================================== */

  const handleChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);

    setOtp(value);

    // Tự xác thực khi nhập đủ 6 số
    if (value.length === OTP_LENGTH) {
      setTimeout(() => {
        onVerify(value);
      }, 180);
    }
  };

  const handleSubmit = () => {
    if (otp.length !== OTP_LENGTH || loading) return;

    onVerify(otp);
  };

  /* ==========================================================
     RESEND
  ========================================================== */

  const handleResend = async () => {
    if (countdown > 0 || loading || resending) return;

    try {
      setResending(true);
      setOtp("");

      await onResend();

      setCountdown(expiresIn);

      setTimeout(() => {
        inputRef.current?.focus?.();
      }, 200);
    } finally {
      setResending(false);
    }
  };

  /* ==========================================================
     DATA
  ========================================================== */

  const otpDigits = Array.from(
    { length: OTP_LENGTH },
    (_, index) => otp[index] || "",
  );

  const progress = Math.max(0, Math.min(100, (countdown / expiresIn) * 100));

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <style>{`
        /* ======================================================
           ROOT
        ====================================================== */

        .fe-verify {
          width: 100%;
          max-width: 500px;

          margin: 0 auto;

          color: #14243a;
        }

        /* ======================================================
           TOP AREA
        ====================================================== */

        .fe-verify-top {
          text-align: center;

          margin-bottom: 26px;
        }

        .fe-verify-icon-wrap {
          position: relative;

          width: 76px;
          height: 76px;

          margin: 0 auto 17px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fe-verify-icon-glow {
          position: absolute;

          inset: 0;

          border-radius: 24px;

          background:
            radial-gradient(
              circle,
              rgba(42, 105, 210, 0.15),
              rgba(42, 105, 210, 0)
            );

          filter: blur(2px);
        }

        .fe-verify-icon {
          position: relative;

          width: 60px;
          height: 60px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 19px;

          color: #2167d5;

          background:
            linear-gradient(
              145deg,
              #ffffff 0%,
              #edf4ff 100%
            );

          border: 1px solid #dce8fa;

          box-shadow:
            0 14px 32px rgba(30, 76, 145, 0.11),
            inset 0 1px 0 #ffffff;

          font-size: 23px;
        }

        .fe-verify-success-dot {
          position: absolute;

          right: 1px;
          bottom: 1px;

          width: 21px;
          height: 21px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #2d9b72;

          border: 3px solid #ffffff;

          color: #ffffff;

          font-size: 8px;

          box-shadow:
            0 5px 12px rgba(45, 155, 114, 0.25);
        }

        .fe-verify-title {
          margin: 0;

          color: #122844;

          font-size: 27px;
          line-height: 1.18;

          font-weight: 800;

          letter-spacing: -0.8px;
        }

        .fe-verify-description {
          max-width: 360px;

          margin: 9px auto 0;

          color: #8793a4;

          font-size: 11px;

          line-height: 1.65;
        }

        /* ======================================================
           EMAIL IDENTITY
        ====================================================== */

        .fe-email-chip {
          display: inline-flex;
          align-items: center;

          gap: 9px;

          margin-top: 15px;

          padding: 7px 11px 7px 7px;

          border-radius: 11px;

          background: #f7faff;

          border: 1px solid #e3ebf7;

          box-shadow:
            0 5px 18px rgba(28, 59, 103, 0.045);
        }

        .fe-email-chip-icon {
          width: 27px;
          height: 27px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          color: #2167d5;

          background: #e8f1ff;

          font-size: 11px;
        }

        .fe-email-chip-content {
          display: flex;
          flex-direction: column;

          align-items: flex-start;

          gap: 1px;
        }

        .fe-email-chip-label {
          color: #a1aab7;

          font-size: 7px;

          line-height: 1;

          text-transform: uppercase;

          letter-spacing: 0.75px;

          font-weight: 800;
        }

        .fe-email-chip-value {
          color: #2b425f;

          font-size: 10px;

          line-height: 1.35;

          font-weight: 750;
        }

        /* ======================================================
           ERROR
        ====================================================== */

        .fe-verify-error {
          margin-bottom: 14px;

          border-radius: 10px !important;

          font-size: 10px;
        }

        /* ======================================================
           MAIN OTP PANEL
        ====================================================== */

        .fe-otp-panel {
          position: relative;

          padding: 22px 23px 21px;

          border-radius: 19px;

          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #fbfcfe 100%
            );

          border: 1px solid #e5ebf3;

          box-shadow:
            0 18px 50px rgba(22, 45, 78, 0.065),
            0 2px 8px rgba(22, 45, 78, 0.025);
        }

        .fe-otp-panel::before {
          content: "";

          position: absolute;

          top: 0;
          left: 22px;
          right: 22px;

          height: 2px;

          border-radius: 0 0 5px 5px;

          background:
            linear-gradient(
              90deg,
              #d5a343,
              #2167d5,
              #29916d
            );
        }

        .fe-otp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 18px;
        }

        .fe-otp-header-left {
          display: flex;
          align-items: center;

          gap: 9px;
        }

        .fe-otp-header-icon {
          width: 31px;
          height: 31px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          color: #2167d5;

          background: #edf4ff;

          font-size: 12px;
        }

        .fe-otp-header-text {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .fe-otp-header-title {
          color: #263952;

          font-size: 11px;

          font-weight: 800;
        }

        .fe-otp-header-subtitle {
          color: #a0aab7;

          font-size: 8px;
        }

        .fe-otp-number {
          padding: 5px 8px;

          border-radius: 7px;

          color: #4774ae;

          background: #f2f7ff;

          font-size: 8px;

          font-weight: 750;
        }

        /* ======================================================
           OTP BOX
        ====================================================== */

        .fe-otp-input-area {
          position: relative;
        }

        .fe-otp-boxes {
          display: grid;

          grid-template-columns:
            repeat(6, minmax(0, 1fr));

          gap: 9px;
        }

        .fe-otp-box {
          position: relative;

          height: 61px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          border: 1px solid #dce4ef;

          background:
            linear-gradient(
              180deg,
              #ffffff,
              #f9fbfd
            );

          color: #142b49;

          font-size: 22px;

          font-weight: 800;

          transition:
            border-color .2s ease,
            box-shadow .2s ease,
            background .2s ease,
            transform .2s ease;
        }

        .fe-otp-box.active {
          border-color: #3476d5;

          background: #f8fbff;

          box-shadow:
            0 0 0 3px rgba(33, 103, 213, 0.08),
            0 7px 18px rgba(33, 103, 213, 0.07);
        }

        .fe-otp-box.filled {
          border-color: #c8d8ed;

          background:
            linear-gradient(
              180deg,
              #f9fbff,
              #f4f8fd
            );
        }

        .fe-otp-box.active::after {
          content: "";

          position: absolute;

          bottom: 7px;

          width: 15px;
          height: 2px;

          border-radius: 2px;

          background: #2167d5;
        }

        .fe-otp-real-input {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          opacity: 0;

          z-index: 5;

          cursor: text;
        }

        .fe-otp-hint {
          margin-top: 10px;

          text-align: center;

          color: #a4adb9;

          font-size: 8px;
        }

        /* ======================================================
           TIMER
        ====================================================== */

        .fe-timer {
          margin: 19px 0 17px;
        }

        .fe-timer-row {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 6px;

          color: #8e99a8;

          font-size: 9px;
        }

        .fe-timer-icon {
          font-size: 10px;

          color: #9da9b8;
        }

        .fe-timer-value {
          min-width: 42px;

          color: #2865a8;

          font-size: 10px;

          font-weight: 800;

          font-variant-numeric: tabular-nums;
        }

        .fe-timer.expired .fe-timer-row {
          color: #bf7474;
        }

        .fe-timer.expired .fe-timer-value {
          color: #bf7474;
        }

        .fe-timer-track {
          height: 3px;

          margin-top: 8px;

          overflow: hidden;

          border-radius: 10px;

          background: #edf1f5;
        }

        .fe-timer-progress {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #d5a343,
              #2167d5
            );

          transition: width 1s linear;
        }

        /* ======================================================
           VERIFY BUTTON
        ====================================================== */

        .fe-verify-button {
          height: 48px !important;

          border: none !important;

          border-radius: 11px !important;

          background:
            linear-gradient(
              135deg,
              #102a56 0%,
              #2167d5 100%
            ) !important;

          box-shadow:
            0 10px 25px rgba(24, 74, 145, 0.19) !important;

          font-size: 11px !important;

          font-weight: 800 !important;

          transition:
            transform .2s ease,
            box-shadow .2s ease !important;
        }

        .fe-verify-button:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 14px 30px rgba(24, 74, 145, 0.25) !important;
        }

        /* ======================================================
           RESEND
        ====================================================== */

        .fe-resend {
          margin-top: 6px;

          height: 38px;

          border-radius: 9px;

          color: #718096 !important;

          font-size: 9px !important;

          font-weight: 650 !important;
        }

        .fe-resend:hover:not(:disabled) {
          color: #2167d5 !important;

          background: #f5f8fd !important;
        }

        /* ======================================================
           SECURITY
        ====================================================== */

        .fe-security {
          display: flex;
          align-items: flex-start;

          gap: 8px;

          margin-top: 14px;

          padding: 10px 11px;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #f7fbf9,
              #f4f9f7
            );

          border: 1px solid #e0ede6;

          color: #71857b;

          font-size: 8px;

          line-height: 1.55;
        }

        .fe-security-icon {
          flex: 0 0 auto;

          margin-top: 1px;

          color: #29916d;

          font-size: 11px;
        }

        /* ======================================================
           BACK
        ====================================================== */

        .fe-back {
          display: flex;

          margin: 17px auto 0;

          height: auto;

          padding: 0 !important;

          color: #8c97a5 !important;

          font-size: 9px !important;

          font-weight: 650 !important;
        }

        .fe-back:hover {
          color: #2167d5 !important;
        }

        /* ======================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 560px) {
          .fe-verify-title {
            font-size: 23px;
          }

          .fe-verify-description {
            font-size: 10px;
          }

          .fe-otp-panel {
            padding: 19px 14px 17px;

            border-radius: 15px;
          }

          .fe-otp-panel::before {
            left: 15px;
            right: 15px;
          }

          .fe-otp-header {
            margin-bottom: 15px;
          }

          .fe-otp-number {
            display: none;
          }

          .fe-otp-boxes {
            gap: 6px;
          }

          .fe-otp-box {
            height: 51px;

            border-radius: 9px;

            font-size: 19px;
          }
        }

        @media (max-width: 390px) {
          .fe-otp-panel {
            padding-left: 11px;
            padding-right: 11px;
          }

          .fe-otp-boxes {
            gap: 4px;
          }

          .fe-otp-box {
            height: 47px;

            font-size: 17px;
          }

          .fe-otp-hint {
            font-size: 7px;
          }
        }
      `}</style>

      <motion.div
        className="fe-verify"
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* ====================================================
            TOP
        ==================================================== */}

        <div className="fe-verify-top">
          <motion.div
            className="fe-verify-icon-wrap"
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.45,
              delay: 0.08,
            }}
          >
            <div className="fe-verify-icon-glow" />

            <motion.div
              className="fe-verify-icon"
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <MailOutlined />
            </motion.div>

            <div className="fe-verify-success-dot">
              <CheckCircleFilled />
            </div>
          </motion.div>

          <h1 className="fe-verify-title">Xác thực email</h1>

          <p className="fe-verify-description">
            Một mã xác thực gồm 6 chữ số đã được gửi đến email của bạn. Nhập mã
            bên dưới để hoàn tất đăng ký FaithEdu.
          </p>

          <div className="fe-email-chip">
            <div className="fe-email-chip-icon">
              <MailOutlined />
            </div>

            <div className="fe-email-chip-content">
              <span className="fe-email-chip-label">Email đăng ký</span>

              <strong className="fe-email-chip-value">
                {email || "Email của bạn"}
              </strong>
            </div>
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -5,
              }}
            >
              <Alert
                type="error"
                showIcon
                message={error}
                className="fe-verify-error"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====================================================
            OTP PANEL
        ==================================================== */}

        <motion.div
          className="fe-otp-panel"
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.12,
            duration: 0.4,
          }}
        >
          <div className="fe-otp-header">
            <div className="fe-otp-header-left">
              <div className="fe-otp-header-icon">
                <SafetyCertificateFilled />
              </div>

              <div className="fe-otp-header-text">
                <span className="fe-otp-header-title">Nhập mã xác thực</span>

                <span className="fe-otp-header-subtitle">
                  Nhập hoặc dán mã OTP gồm 6 chữ số
                </span>
              </div>
            </div>

            <span className="fe-otp-number">OTP • 6 SỐ</span>
          </div>

          <div className="fe-otp-input-area">
            <div className="fe-otp-boxes">
              {otpDigits.map((digit, index) => {
                const isActive = index === otp.length;
                const isFilled = Boolean(digit);

                return (
                  <motion.div
                    key={index}
                    className={[
                      "fe-otp-box",
                      isActive ? "active" : "",
                      isFilled ? "filled" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    animate={
                      isFilled
                        ? {
                            scale: [0.9, 1],
                          }
                        : undefined
                    }
                    transition={{
                      duration: 0.16,
                    }}
                  >
                    {digit}
                  </motion.div>
                );
              })}
            </div>

            <Input
              ref={inputRef}
              value={otp}
              onChange={handleChange}
              onPressEnter={handleSubmit}
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              autoComplete="one-time-code"
              disabled={loading || resending}
              className="fe-otp-real-input"
              aria-label="Mã xác thực OTP"
            />
          </div>

          <div className="fe-otp-hint">
            Mã OTP được bảo mật và chỉ dùng một lần
          </div>
        </motion.div>

        {/* ====================================================
            TIMER
        ==================================================== */}

        <div
          className={["fe-timer", countdown <= 0 ? "expired" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="fe-timer-row">
            <ClockCircleOutlined className="fe-timer-icon" />

            {countdown > 0 ? (
              <>
                <span>Mã có hiệu lực trong</span>

                <strong className="fe-timer-value">
                  {formatTime(countdown)}
                </strong>
              </>
            ) : (
              <strong className="fe-timer-value">Mã OTP đã hết hạn</strong>
            )}
          </div>

          <div className="fe-timer-track">
            <motion.div
              className="fe-timer-progress"
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.5,
              }}
            />
          </div>
        </div>

        {/* ====================================================
            VERIFY BUTTON
        ==================================================== */}

        <Button
          type="primary"
          block
          size="large"
          loading={loading}
          disabled={otp.length !== OTP_LENGTH || loading || resending}
          onClick={handleSubmit}
          icon={!loading ? <CheckCircleFilled /> : undefined}
          className="fe-verify-button"
        >
          {loading ? "Đang xác thực..." : "Xác nhận & hoàn tất đăng ký"}
        </Button>

        {/* ====================================================
            RESEND
        ==================================================== */}

        <Button
          type="text"
          block
          disabled={countdown > 0 || loading || resending}
          loading={resending}
          onClick={handleResend}
          icon={!resending ? <ReloadOutlined /> : undefined}
          className="fe-resend"
        >
          {countdown > 0
            ? `Gửi lại mã sau ${formatTime(countdown)}`
            : "Gửi lại mã xác thực"}
        </Button>

        {/* ====================================================
            SECURITY
        ==================================================== */}

        <div className="fe-security">
          <SafetyCertificateFilled className="fe-security-icon" />

          <span>
            Vì lý do bảo mật, không chia sẻ mã OTP với bất kỳ ai. FaithEdu sẽ
            không yêu cầu bạn cung cấp mã xác thực qua điện thoại hoặc tin nhắn.
          </span>
        </div>

        {/* ====================================================
            BACK
        ==================================================== */}

        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          disabled={loading || resending}
          className="fe-back"
        >
          Quay lại chỉnh sửa thông tin
        </Button>
      </motion.div>
    </>
  );
};

export default RegisterVerify;
