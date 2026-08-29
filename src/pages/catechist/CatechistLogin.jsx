import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  ConfigProvider,
  Checkbox,
  Spin,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  HeartFilled,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

import background from "../../assets/images/login-background.png";
import logobackground from "../../assets/images/logo-giao-ly.png.png";

/* =========================================================
   🖼️ HÌNH ẢNH BANNER & LOGO
   ========================================================= */
const LOGIN_BACKGROUND = background;
const LOGIN_LOGO = logobackground;

/* =========================================================
   🎨 PALETTE MÀU CAO CẤP (ROYAL HUYNH TRƯỞNG)
   ========================================================= */
const colors = {
  primary: "#6366F1", // Indigo Premium
  primaryGradient:
    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #C084FC 100%)",
  accentGold: "#F59E0B",
  accentCyan: "#06B6D4",
  bgDark: "#0B0F19",
  cardBg: "rgba(255, 255, 255, 0.92)",
  textMain: "#0F172A",
  textMuted: "#64748B",
};

const antIcon = (
  <LoadingOutlined style={{ fontSize: 44, color: colors.primary }} spin />
);

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const savedUser = localStorage.getItem("remember_me");
    if (savedUser) {
      try {
        const { email, password } = JSON.parse(savedUser);
        form.setFieldsValue({ email, password, remember: true });
      } catch (e) {
        console.error("Lỗi đọc ghi nhớ đăng nhập:", e);
      }
    }
  }, [form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { ...values, role: "teacher" });
      if (res.data?.token) {
        if (values.remember) {
          localStorage.setItem(
            "remember_me",
            JSON.stringify({ email: values.email, password: values.password }),
          );
        } else {
          localStorage.removeItem("remember_me");
        }

        login(res.data.token);
        message.success("Chào mừng Huynh Trưởng / GLV trở lại!");
        setTimeout(() => navigate("/"), 800);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Đăng nhập thất bại!";
      message.error(msg);
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
          borderRadius: 14,
          controlHeightLG: 52,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      {/* OVERLAY LOADING */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="neo-loading-overlay"
          >
            <motion.div
              initial={{ scale: 0.85, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="neo-loading-card"
            >
              <Spin indicator={antIcon} />
              <h3 className="loading-title">ĐANG KẾT NỐI HỆ THỐNG...</h3>
              <p className="loading-desc">
                Xác thực quyền Quản trị & Huynh Trưởng
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL CANVAS CONTAINER */}
      <div className="canvas-wrapper">
        {/* ARTWORK BACKGROUND */}
        <div className="art-layer">
          <img
            src={LOGIN_BACKGROUND}
            alt="Background Artwork"
            className="art-image"
          />
          <div className="art-overlay-vignette" />
          <div className="art-blur-spheres">
            <div className="sphere sphere-1" />
            <div className="sphere sphere-2" />
          </div>
        </div>

        {/* FLOATING HEADER */}
        <motion.header
          className="canvas-header"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="brand-pill">
            <img src={LOGIN_LOGO} alt="Logo" className="brand-logo" />
            <div className="brand-divider" />
            <span className="brand-tag">CỔNG HUYNH TRƯỞNG & GLV</span>
          </div>
          <div className="header-status">
            <span className="status-dot" />
            <span>Hệ thống Quản trị v2026</span>
          </div>
        </motion.header>

        {/* TYPOGRAPHY BACKGROUND CHÌM */}
        <div className="bg-typography">
          <span>LEADER</span>
          <span>&</span>
          <span>SERVE</span>
        </div>

        {/* FLOATING CENTRAL CARD */}
        <main className="canvas-content">
          <motion.div
            className="glass-card"
            initial={{ scale: 0.92, y: 25, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{
              duration: 0.65,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Card Heading */}
            <div className="card-header">
              <div className="role-tag">
                <ThunderboltOutlined /> HUYNH TRƯỞNG / GIÁO LÝ VIÊN
              </div>
              <h1 className="card-title">Trang Quản Trị Giáo Lý</h1>
              <p className="card-subtitle">
                Đăng nhập tài khoản quản trị để đồng hành cùng Thiếu Nhi.
              </p>
            </div>

            {/* Form Đăng Nhập */}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập Email hoặc Tên tài khoản!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="Email hoặc Tên tài khoản Huynh Trưởng"
                  className="neo-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập Mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Mật khẩu"
                  className="neo-input"
                />
              </Form.Item>

              <div className="card-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="neo-checkbox">
                    Ghi nhớ đăng nhập
                  </Checkbox>
                </Form.Item>
                <a
                  href="#forgot"
                  className="neo-forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    message.info(
                      "Vui lòng liên hệ Ban Quản Trị Hệ Thống để cấp lại mật khẩu!",
                    );
                  }}
                >
                  Quên mật khẩu?
                </a>
              </div>

              <Form.Item style={{ marginTop: 22, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<ArrowRightOutlined />}
                  className="neo-submit-btn"
                >
                  ĐĂNG NHẬP QUẢN TRỊ
                </Button>
              </Form.Item>
            </Form>

            {/* Footer Features Inside Card */}
            <div className="card-footer-info">
              <div className="info-chip">
                <SafetyCertificateOutlined /> <span>Quyền Quản Trị</span>
              </div>
              <div className="info-chip">
                <CheckCircleOutlined style={{ color: "#22C55E" }} />{" "}
                <span>Bảo Mật Cao</span>
              </div>
              <div className="info-chip">
                <HeartFilled style={{ color: "#EC4899" }} />{" "}
                <span>Phụng Sự</span>
              </div>
            </div>
          </motion.div>
        </main>

        {/* FLOATING FOOTER */}
        <footer className="canvas-footer">
          <span>© 2026 E-Catechism Leader Portal</span>
          <span>Nền tảng Giáo Lý Thông Minh</span>
        </footer>
      </div>

      {/* STYLES */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body, html, #root {
          width: 100%;
          height: 100%;
          font-family: 'Be Vietnam Pro', sans-serif;
          overflow: hidden;
          background: ${colors.bgDark};
        }

        .canvas-wrapper {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px 36px;
          overflow: hidden;
        }

        /* BACKGROUND ARTWORK & ATMOSPHERE */
        .art-layer {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .art-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: brightness(0.65) contrast(1.15) saturate(1.2);
          transform: scale(1.02);
        }

        .art-overlay-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(11, 15, 25, 0.25) 0%,
            rgba(11, 15, 25, 0.8) 70%,
            rgba(11, 15, 25, 0.95) 100%
          );
        }

        .art-blur-spheres .sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.45;
          pointer-events: none;
        }

        .sphere-1 {
          width: 380px;
          height: 380px;
          top: -120px;
          left: -100px;
          background: #4F46E5;
        }

        .sphere-2 {
          width: 420px;
          height: 420px;
          bottom: -160px;
          right: -100px;
          background: #7C3AED;
        }

        /* HEADER */
        .canvas-header {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(16px);
          padding: 8px 18px;
          border-radius: 40px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
        }

        .brand-logo {
          height: 36px;
          width: auto;
          object-fit: contain;
        }

        .brand-divider {
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.3);
        }

        .brand-tag {
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .header-status {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(12px);
          padding: 6px 14px;
          border-radius: 20px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 11px;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22C55E;
          box-shadow: 0 0 10px #22C55E;
        }

        /* TYPOGRAPHY BACKGROUND CHÌM */
        .bg-typography {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          display: flex;
          gap: 40px;
          pointer-events: none;
          user-select: none;
          opacity: 0.05;
          font-size: clamp(70px, 13vw, 170px);
          font-weight: 900;
          color: #FFFFFF;
          letter-spacing: -2px;
          white-space: nowrap;
        }

        /* MAIN CONTENT & GLASS CARD */
        .canvas-content {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          margin: 20px 0;
        }

        .glass-card {
          width: 100%;
          max-width: 430px;
          background: ${colors.cardBg};
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border-radius: 28px;
          padding: 38px 34px 28px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 
            0 25px 60px rgba(0, 0, 0, 0.35),
            0 0 40px rgba(99, 102, 241, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        .card-top-badge {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: ${colors.primaryGradient};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-size: 22px;
          margin-bottom: 18px;
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.38);
        }

        .card-header {
          margin-bottom: 24px;
        }

        .role-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: ${colors.primary};
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.8px;
          background: #EEF2FF;
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 8px;
          border: 1px solid #C7D2FE;
        }

        .card-title {
          font-size: 28px;
          font-weight: 800;
          color: ${colors.textMain};
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .card-subtitle {
          font-size: 13px;
          color: ${colors.textMuted};
          margin-top: 6px;
          line-height: 1.5;
        }

        /* FORM INPUTS */
        .neo-input {
          border-radius: 12px !important;
          background: #F8FAFC !important;
          border: 1px solid #E2E8F0 !important;
          transition: all 0.25s ease !important;
        }

        .neo-input:hover {
          border-color: #A5B4FC !important;
          background: #FFFFFF !important;
        }

        .neo-input:focus, .ant-input-affix-wrapper-focused {
          border-color: ${colors.primary} !important;
          background: #FFFFFF !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15) !important;
        }

        .input-icon {
          color: #94A3B8;
          font-size: 16px;
          margin-right: 8px;
        }

        .card-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .neo-checkbox {
          font-size: 12px;
          color: ${colors.textMuted};
        }

        .neo-forgot {
          font-size: 12px;
          font-weight: 700;
          color: ${colors.primary};
          text-decoration: none;
        }

        .neo-forgot:hover {
          text-decoration: underline;
        }

        .neo-submit-btn {
          height: 52px !important;
          border-radius: 14px !important;
          background: ${colors.primaryGradient} !important;
          border: none !important;
          font-size: 13px !important;
          font-weight: 800 !important;
          letter-spacing: 0.8px;
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.35) !important;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        .neo-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(79, 70, 229, 0.45) !important;
        }

        .card-footer-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px dashed rgba(203, 213, 225, 0.8);
        }

        .info-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: ${colors.textMuted};
        }

        /* FOOTER */
        .canvas-footer {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.6);
          font-size: 11px;
          font-weight: 500;
        }

        /* LOADING OVERLAY */
        .neo-loading-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(11, 15, 25, 0.82);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .neo-loading-card {
          background: #FFFFFF;
          padding: 38px 50px;
          border-radius: 24px;
          text-align: center;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }

        .loading-title {
          font-size: 15px;
          font-weight: 800;
          color: ${colors.textMain};
          margin-top: 16px;
          letter-spacing: 0.5px;
        }

        .loading-desc {
          font-size: 12px;
          color: ${colors.textMuted};
          margin-top: 4px;
        }

        @media (max-width: 576px) {
          .canvas-wrapper {
            padding: 16px;
          }
          .glass-card {
            padding: 28px 22px 22px;
          }
          .brand-tag, .header-status {
            display: none;
          }
        }
      `,
        }}
      />
    </ConfigProvider>
  );
}
