import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, ConfigProvider, Checkbox } from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  HeartFilled,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import LoadingLogo from "../../components/LoadingLogo";
import background from "../../assets/images/login-background.png";
import logobackground from "../../assets/images/logo-giao-ly.png.png";

/* =========================================================
   🖼️ HÌNH ẢNH & THÔNG SỐ
========================================================= */

const LOGIN_BACKGROUND = background;
const LOGIN_LOGO = logobackground;

const colors = {
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  primaryGradient:
    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)",
  accentGold: "#F59E0B",
  bgDark: "#030712",
  cardBg: "rgba(255, 255, 255, 0.85)",
  cardBorder: "rgba(255, 255, 255, 0.6)",
  textMain: "#0F172A",
  textMuted: "#475569",
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [form] = Form.useForm();

  /* =========================================================
     REMEMBER LOGIN
  ========================================================= */

  useEffect(() => {
    const savedUser = localStorage.getItem("remember_me");
    if (savedUser) {
      try {
        const { email } = JSON.parse(savedUser);
        form.setFieldsValue({
          email,
          remember: true,
        });
      } catch (e) {
        // Fallback silently if parsing fails
      }
    }
  }, [form]);

  const onFinish = async (values) => {
    setLoading(true);
    setLoadingProgress(0);

    const progressTimer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 88) return 88;

        // Chia nhỏ từng phân khúc để thanh loading trôi mượt như nước
        let increment = 1;
        if (prev < 20)
          increment = 1.5; // Đầu chạy nhanh một chút cho phấn khích
        else if (prev < 50)
          increment = 0.8; // Đoạn giữa chạy đều đặn
        else if (prev < 75)
          increment = 0.4; // Đoạn gần cuối bắt đầu chậm dần
        else increment = 0.2; // Gần mốc 88% bò rất chậm tạo cảm giác đang xử lý dữ liệu nặng

        return Math.min(prev + increment, 88);
      });
    }, 30); // Giảm interval xuống 30ms để các bước nhảy nhỏ liên tục không bị giật

    try {
      const res = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      if (!res.data?.token) {
        clearInterval(progressTimer);
        setLoadingProgress(0);
        setLoading(false);
        message.error(
          "Đăng nhập thất bại: Hệ thống phản hồi thiếu token xác thực.",
        );
        return;
      }

      if (values.remember) {
        localStorage.setItem(
          "remember_me",
          JSON.stringify({ email: values.email }),
        );
      } else {
        localStorage.removeItem("remember_me");
      }

      try {
        await login(res.data.token);
      } catch (loginError) {
        clearInterval(progressTimer);
        setLoadingProgress(0);
        setLoading(false);
        message.error("Không thể khởi tạo phiên làm việc.");
        return;
      }

      clearInterval(progressTimer);
      setLoadingProgress(100);
      message.success("Chào mừng Huynh Trưởng trở lại!");

      setTimeout(() => {
        navigate("/catechist", { replace: true });
      }, 700);
    } catch (error) {
      clearInterval(progressTimer);
      setLoadingProgress(0);
      setLoading(false);

      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Thông tin tài khoản hoặc mật khẩu không chính xác.";
      message.error(msg);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
          borderRadius: 16,
          controlHeightLG: 54,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      {/* =====================================================
          LOADING OVERLAY CAO CẤP
      ====================================================== */}
      <AnimatePresence>
        {loading && <LoadingLogo progress={loadingProgress} />}
      </AnimatePresence>

      {/* =====================================================
          GIAO DIỆN CHÍNH
      ====================================================== */}
      <div className="faith-canvas">
        {/* Lớp nền nghệ thuật hiệu ứng chiều sâu */}
        <div className="faith-backdrop">
          <img
            src={LOGIN_BACKGROUND}
            alt="Faith Background"
            className="backdrop-image"
          />
          <div className="backdrop-gradient-mask" />
          <div className="ambient-orb orb-one" />
          <div className="ambient-orb orb-two" />
        </div>

        {/* Header tối giản */}
        <motion.header
          className="faith-header"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="header-badge">
            <img src={LOGIN_LOGO} alt="Faith Logo" className="badge-logo" />
            <div className="badge-divider" />
            <span className="badge-title">CỔNG THIẾU NHI THÁNH THỂ</span>
          </div>

          <div className="header-status-pill">
            <span className="live-dot" />
            <span>Hệ thống FaithEdu v2026</span>
          </div>
        </motion.header>

        {/* Khung đăng nhập trung tâm */}
        <main className="faith-main">
          <motion.div
            className="faith-glass-panel"
            initial={{ scale: 0.94, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="panel-heading">
              <div className="panel-tag">
                <ThunderboltOutlined />
                <span>HUYNH TRƯỞNG & GIÁO LÝ VIÊN</span>
              </div>
              <h1 className="panel-title">Cổng Đăng Nhập Quản Trị</h1>
              <p className="panel-subtitle">
                Kết nối yêu thương, phụng sự và đồng hành cùng các em thiếu nhi
                mỗi ngày.
              </p>
            </div>

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
                  { required: true, message: "Vui lòng nhập Email tài khoản!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="form-icon" />}
                  placeholder="Email hoặc Tên tài khoản quản trị"
                  className="faith-input"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu bảo mật!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="form-icon" />}
                  placeholder="Mật khẩu của bạn"
                  className="faith-input"
                  autoComplete="current-password"
                />
              </Form.Item>

              <div className="panel-row-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="faith-checkbox">
                    Ghi nhớ tài khoản
                  </Checkbox>
                </Form.Item>
                <button
                  type="button"
                  className="faith-link-btn"
                  onClick={() => navigate("/register")}
                >
                  Đăng ký tài khoản mới
                </button>
              </div>

              <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<ArrowRightOutlined />}
                  className="faith-submit-btn"
                  loading={loading}
                >
                  TRUY CẬP HỆ THỐNG
                </Button>
              </Form.Item>
            </Form>

            <div className="panel-trust-badges">
              <div className="trust-item">
                <SafetyCertificateOutlined className="trust-icon text-indigo" />
                <span>Bảo mật phân quyền</span>
              </div>
              <div className="trust-item">
                <CheckCircleOutlined className="trust-icon text-emerald" />
                <span>Đồng bộ thời gian thực</span>
              </div>
              <div className="trust-item">
                <HeartFilled className="trust-icon text-rose" />
                <span>Phụng sự tông đồ</span>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="faith-footer">
          <span>© 2026 FaithEdu Management Suite. All rights reserved.</span>
          <span>Nền tảng Quản trị Đoàn sinh & Huynh Trưởng</span>
        </footer>
      </div>

      {/* =====================================================
          HỆ THỐNG CSS CAO CẤP (NEOMORPHISM & GLASS)
      ====================================================== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

            * {
              box-sizing: border-box;
            }

            html, body, #root {
              width: 100%;
              min-height: 100%;
              margin: 0;
              padding: 0;
              font-family: 'Be Vietnam Pro', sans-serif;
              background-color: ${colors.bgDark};
            }

            .faith-canvas {
              position: relative;
              width: 100%;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 24px 40px;
              overflow-x: hidden;
            }

            /* --- BACKDROP & AMBIENT EFFECTS --- */
            .faith-backdrop {
              position: fixed;
              inset: 0;
              z-index: 0;
              overflow: hidden;
            }

            .backdrop-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
              filter: brightness(0.55) contrast(1.15) saturate(1.1);
              transform: scale(1.03);
            }

            .backdrop-gradient-mask {
              position: absolute;
              inset: 0;
              background: radial-gradient(circle at center, rgba(3, 7, 18, 0.3) 0%, rgba(3, 7, 18, 0.75) 75%, rgba(3, 7, 18, 0.95) 100%);
            }

            .ambient-orb {
              position: absolute;
              border-radius: 50%;
              filter: blur(120px);
              opacity: 0.45;
              pointer-events: none;
            }

            .orb-one {
              width: 450px;
              height: 450px;
              top: -150px;
              left: -100px;
              background: #4F46E5;
            }

            .orb-two {
              width: 500px;
              height: 500px;
              bottom: -150px;
              right: -100px;
              background: #9333EA;
            }

            /* --- HEADER --- */
            .faith-header {
              position: relative;
              z-index: 10;
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
            }

            .header-badge {
              display: flex;
              align-items: center;
              gap: 14px;
              padding: 8px 20px;
              background: rgba(255, 255, 255, 0.08);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border-radius: 40px;
              border: 1px solid rgba(255, 255, 255, 0.15);
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }

            .badge-logo {
              height: 38px;
              width: auto;
              object-fit: contain;
            }

            .badge-divider {
              width: 1px;
              height: 20px;
              background: rgba(255, 255, 255, 0.25);
            }

            .badge-title {
              color: #FFFFFF;
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 1.2px;
              white-space: nowrap;
            }

            .header-status-pill {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 7px 16px;
              background: rgba(3, 7, 18, 0.6);
              backdrop-filter: blur(12px);
              border-radius: 20px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: rgba(255, 255, 255, 0.85);
              font-size: 12px;
              font-weight: 500;
            }

            .live-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #10B981;
              box-shadow: 0 0 12px #10B981;
            }

            /* --- MAIN PANEL --- */
            .faith-main {
              position: relative;
              z-index: 5;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px 0;
            }

            .faith-glass-panel {
              width: min(100%, 460px);
              background: rgba(255, 255, 255, 0.92);
              backdrop-filter: blur(35px) saturate(200%);
              -webkit-backdrop-filter: blur(35px) saturate(200%);
              border-radius: 32px;
              padding: 42px 38px 32px;
              border: 1px solid rgba(255, 255, 255, 0.9);
              box-shadow: 
                0 30px 60px rgba(0, 0, 0, 0.35),
                0 0 50px rgba(79, 70, 229, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 1);
            }

            .panel-heading {
              margin-bottom: 28px;
            }

            .panel-tag {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              color: ${colors.primary};
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.9px;
              background: #EEF2FF;
              padding: 5px 12px;
              border-radius: 20px;
              margin-bottom: 12px;
              border: 1px solid #C7D2FE;
            }

            .panel-title {
              font-size: 30px;
              font-weight: 800;
              color: ${colors.textMain};
              letter-spacing: -0.6px;
              line-height: 1.15;
              margin: 0;
            }

            .panel-subtitle {
              font-size: 13.5px;
              color: ${colors.textMuted};
              margin-top: 8px;
              margin-bottom: 0;
              line-height: 1.55;
            }

            /* --- INPUT FIELDS --- */
            .faith-input {
              width: 100%;
              border-radius: 14px !important;
              background: #F8FAFC !important;
              border: 1.5px solid #E2E8F0 !important;
              transition: all 0.25s ease !important;
            }

            .faith-input:hover {
              border-color: #A5B4FC !important;
              background: #FFFFFF !important;
            }

            .faith-input:focus,
            .ant-input-affix-wrapper-focused {
              border-color: ${colors.primary} !important;
              background: #FFFFFF !important;
              box-shadow: 0 0 0 5px rgba(79, 70, 229, 0.12) !important;
            }

            .form-icon {
              color: #94A3B8;
              font-size: 16px;
              margin-right: 10px;
            }

            /* --- OPTIONS --- */
            .panel-row-options {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              margin-top: 6px;
              margin-bottom: 4px;
            }

            .faith-checkbox {
              font-size: 13px;
              color: ${colors.textMuted};
              font-weight: 500;
            }

            .faith-link-btn {
              border: none;
              padding: 0;
              background: transparent;
              cursor: pointer;
              font-family: inherit;
              font-size: 13px;
              font-weight: 700;
              color: ${colors.primary};
              transition: color 0.2s;
            }

            .faith-link-btn:hover {
              color: ${colors.primaryHover};
              text-decoration: underline;
            }

            /* --- SUBMIT BUTTON --- */
            .faith-submit-btn {
              height: 54px !important;
              border-radius: 16px !important;
              background: ${colors.primaryGradient} !important;
              border: none !important;
              font-size: 14px !important;
              font-weight: 800 !important;
              letter-spacing: 0.8px;
              box-shadow: 0 12px 28px rgba(79, 70, 229, 0.4) !important;
              transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
            }

            .faith-submit-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 16px 35px rgba(79, 70, 229, 0.5) !important;
            }

            /* --- TRUST BADGES --- */
            .panel-trust-badges {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;
              margin-top: 26px;
              padding-top: 20px;
              border-top: 1px dashed rgba(203, 213, 225, 0.8);
            }

            .trust-item {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 11px;
              font-weight: 600;
              color: ${colors.textMuted};
            }

            .trust-icon.text-indigo { color: #6366F1; }
            .trust-icon.text-emerald { color: #10B981; }
            .trust-icon.text-rose { color: #EC4899; }

            /* --- FOOTER --- */
            .faith-footer {
              position: relative;
              z-index: 10;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 20px;
              color: rgba(255, 255, 255, 0.6);
              font-size: 12px;
              font-weight: 500;
            }

            /* --- LOADING DIALOG --- */
            .faith-loading-overlay {
              position: fixed;
              inset: 0;
              z-index: 9999;
              background: rgba(3, 7, 18, 0.85);
              backdrop-filter: blur(14px);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }

            .faith-loading-card {
              width: min(100%, 380px);
              background: #FFFFFF;
              padding: 40px 32px;
              border-radius: 28px;
              text-align: center;
              box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
            }

            .loading-desc {
              font-size: 13px;
              color: ${colors.textMuted};
              margin-top: 16px;
              margin-bottom: 0;
              font-weight: 500;
            }

            /* --- RESPONSIVE THIẾT KẾ --- */
            @media (max-width: 768px) {
              .faith-canvas {
                padding: 18px 20px;
              }
              .faith-glass-panel {
                max-width: 420px;
                padding: 34px 28px 24px;
              }
              .panel-title {
                font-size: 26px;
              }
            }

            @media (max-width: 576px) {
              .faith-canvas {
                padding: 14px 12px;
                min-height: 100svh;
              }
              .faith-header {
                justify-content: center;
              }
              .header-badge {
                padding: 7px 16px;
              }
              .badge-logo {
                height: 32px;
              }
              .badge-title, .badge-divider, .header-status-pill {
                display: none;
              }
              .faith-main {
                margin: 10px 0;
              }
              .faith-glass-panel {
                width: 100%;
                padding: 28px 20px 22px;
                border-radius: 24px;
              }
              .panel-heading {
                text-align: center;
                margin-bottom: 22px;
              }
              .panel-title {
                font-size: 24px;
              }
              .panel-subtitle {
                font-size: 12.5px;
              }
              .faith-input {
                min-height: 50px;
              }
              .faith-submit-btn {
                height: 50px !important;
              }
              .panel-trust-badges {
                margin-top: 20px;
                padding-top: 15px;
                gap: 4px;
              }
              .trust-item {
                font-size: 9.5px;
              }
              .faith-footer {
                justify-content: center;
                text-align: center;
                font-size: 10px;
              }
              .faith-footer span:last-child {
                display: none;
              }
            }
          `,
        }}
      />
    </ConfigProvider>
  );
}
