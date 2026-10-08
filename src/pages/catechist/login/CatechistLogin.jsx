import React, { useEffect, useState } from "react";

import { Form, Input, ConfigProvider, Checkbox } from "antd";

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

import api from "../../../api/axios";

import { useNavigate } from "react-router-dom";

import { useUser } from "../../../context/UserContext";

import LoadingLogo from "../../../components/LoadingLogo";

import AppButton from "../../../components/common/AppButton";

import background from "../../../assets/images/login-background.png";

import logobackground from "../../../assets/images/TNTT.png";

import { useNotification } from "../../../components/notification";
import ForgotPasswordModal from "./components/ForgotPasswordModal";
/* =========================================================

   HÌNH ẢNH

\========================================================= */

const LOGIN_BACKGROUND = background;

const LOGIN_LOGO = logobackground;

/* =========================================================

   COLORS

\========================================================= */

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

/* =========================================================

   LOGIN

\========================================================= */

export default function Login() {
  const notify = useNotification();

  const navigate = useNavigate();

  const { login } = useUser();

  const [loading, setLoading] = useState(false);

  const [loadingProgress, setLoadingProgress] = useState(0);

  const [form] = Form.useForm();

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  /* =========================================================

     REMEMBER LOGIN

  \========================================================= */

  useEffect(() => {
    const savedUser = localStorage.getItem("remember_me");

    if (!savedUser) {
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);

      form.setFieldsValue({
        email: parsed.email || "",

        remember: true,
      });
    } catch (error) {
      localStorage.removeItem("remember_me");
    }
  }, [form]);

  /* =========================================================

     LOGIN

  \========================================================= */

  const onFinish = async (values) => {
    if (loading) {
      return;
    }

    setLoading(true);

    setLoadingProgress(0);

    /* =====================================================

       LOADING PROGRESS

    \===================================================== */

    const progressTimer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 88) {
          return 88;
        }

        let increment = 1;

        if (prev < 20) {
          increment = 1.5;
        } else if (prev < 50) {
          increment = 0.8;
        } else if (prev < 75) {
          increment = 0.4;
        } else {
          increment = 0.2;
        }

        return Math.min(prev + increment, 88);
      });
    }, 30);

    try {
      const res = await api.post("/auth/login", {
        // Giữ tên email để tương thích BE hiện tại.

        // BE xử lý cả email và username / số điện thoại.

        email: values.email,

        password: values.password,
      });

      /* =====================================================

         CHECK TOKEN

      \===================================================== */

      if (!res.data?.token) {
        clearInterval(progressTimer);

        setLoadingProgress(0);

        setLoading(false);

        notify.error(
          "Đăng nhập thất bại: Hệ thống phản hồi thiếu token xác thực.",
        );

        return;
      }

      /* =====================================================

         USER FROM LOGIN RESPONSE

      \===================================================== */

      const loginUser = res.data?.admin || null;

      if (!loginUser) {
        clearInterval(progressTimer);

        setLoadingProgress(0);

        setLoading(false);

        notify.error(
          "Đăng nhập thất bại: Không nhận được thông tin tài khoản.",
        );

        return;
      }

      /* =====================================================

         REMEMBER LOGIN

      \===================================================== */

      if (values.remember) {
        localStorage.setItem(
          "remember_me",

          JSON.stringify({
            email: values.email,
          }),
        );
      } else {
        localStorage.removeItem("remember_me");
      }

      /* =====================================================

         INIT USER SESSION

      \===================================================== */

      try {
        await login(res.data.token);
      } catch (loginError) {
        clearInterval(progressTimer);

        setLoadingProgress(0);

        setLoading(false);

        notify.error("Không thể khởi tạo phiên làm việc.");

        return;
      }

      /* =====================================================

         LOGIN SUCCESS

      \===================================================== */

      clearInterval(progressTimer);

      setLoadingProgress(100);

      /* =====================================================

         ROLE

      \===================================================== */

      const role = loginUser.role;

      /* =====================================================

         MESSAGE THEO ROLE

      \===================================================== */

      if (role === "parent") {
        notify.success("Đăng nhập thành công. Chào mừng phụ huynh!");
      } else {
        notify.success("Chào mừng Huynh Trưởng trở lại!");
      }

      /* =====================================================

         REDIRECT THEO ROLE

      \===================================================== */

      setTimeout(() => {
        /* -----------------------------------------------

           PARENT

        \------------------------------------------------ */

        if (role === "parent") {
          navigate("/parent", {
            replace: true,
          });

          return;
        }

        /* -----------------------------------------------

           CÁC ROLE HIỆN TẠI

        \------------------------------------------------ */

        navigate("/catechist", {
          replace: true,
        });
      }, 700);
    } catch (error) {
      clearInterval(progressTimer);

      setLoadingProgress(0);

      setLoading(false);

      /* =====================================================

         HTTP STATUS

      \===================================================== */

      const status = error?.response?.status;

      /* =====================================================

         ACCOUNT LOCKED

      \===================================================== */

      if (status === 403) {
        notify.error(
          error?.response?.data?.message ||
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
        );

        return;
      }

      /* =====================================================

         LOGIN FAILED

      \===================================================== */

      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Thông tin tài khoản hoặc mật khẩu không chính xác.";

      notify.error(msg);
    }
  };

  /* =========================================================

     RENDER

  \========================================================= */

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
          borderRadius: 14,
          controlHeightLG: 56,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <AnimatePresence>
        {loading && <LoadingLogo progress={loadingProgress} />}
      </AnimatePresence>

      <div className="faith-login">
        <div className="faith-login__background">
          <img src={LOGIN_BACKGROUND} alt="" />
          <div className="faith-login__overlay" />
          <div className="faith-login__glow faith-login__glow--1" />
          <div className="faith-login__glow faith-login__glow--2" />
          <div className="faith-login__grid" />
        </div>

        <header className="faith-login__header">
          <div className="brand">
            <div className="brand__logo">
              <img src={LOGIN_LOGO} alt="Thiếu Nhi Thánh Thể" />
            </div>
            <div className="brand__text">
              <strong>FaithEdu</strong>
              <span>Nền tảng giáo lý số</span>
            </div>
          </div>

          <div className="system-pill">
            <span className="system-pill__dot" />
            <span>Hệ thống đang hoạt động</span>
          </div>
        </header>

        <main className="faith-login__content">
          <motion.section
            className="faith-login__intro"
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="intro-badge">
              <ThunderboltOutlined />
              <span>CỔNG QUẢN TRỊ THIẾU NHI THÁNH THỂ</span>
            </div>

            <h1>
              Đồng hành cùng
              <br />
              <span>một thế hệ lớn lên</span>
              <br />
              trong đức tin.
            </h1>

            <p>
              Quản lý lớp học, đoàn sinh, điểm danh và hoạt động giáo lý trên
              một nền tảng đơn giản, hiện đại và an toàn.
            </p>

            <div className="intro-features">
              <div className="intro-feature">
                <span className="intro-feature__icon">
                  <CheckCircleOutlined />
                </span>
                <div>
                  <strong>Quản lý tập trung</strong>
                  <small>Thông tin lớp học & đoàn sinh</small>
                </div>
              </div>
              <div className="intro-feature">
                <span className="intro-feature__icon">
                  <SafetyCertificateOutlined />
                </span>
                <div>
                  <strong>An toàn & phân quyền</strong>
                  <small>Bảo vệ dữ liệu theo từng vai trò</small>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            className="login-card"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="login-card__top">
              <div className="login-card__mini-logo">
                <img src={LOGIN_LOGO} alt="" />
              </div>
              <div>
                <span>CHÀO MỪNG TRỞ LẠI</span>
                <h2>Đăng nhập</h2>
              </div>
            </div>

            <p className="login-card__desc">
              Đăng nhập để tiếp tục quản lý và đồng hành cùng các em thiếu nhi.
            </p>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              size="large"
              disabled={loading}
            >
              <Form.Item
                name="email"
                label="Tài khoản"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập Email hoặc Số điện thoại!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Email hoặc số điện thoại"
                  className="faith-input"
                  autoComplete="username"
                  allowClear
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu của bạn"
                  className="faith-input"
                  autoComplete="current-password"
                />
              </Form.Item>

              <div className="login-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="faith-checkbox">
                    Ghi nhớ tài khoản
                  </Checkbox>
                </Form.Item>

                <div className="login-links">
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Quên mật khẩu?
                  </button>

                  <button
                    type="button"
                    className="register-link"
                    onClick={() => navigate("/register")}
                  >
                    Tạo tài khoản mới
                  </button>
                </div>
              </div>
              <Form.Item className="submit-wrap">
                <AppButton
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<ArrowRightOutlined />}
                  loading={loading}
                >
                  ĐĂNG NHẬP HỆ THỐNG
                </AppButton>
              </Form.Item>
            </Form>

            <div className="login-card__trust">
              <div>
                <SafetyCertificateOutlined />
                <span>Bảo mật</span>
              </div>
              <i />
              <div>
                <CheckCircleOutlined />
                <span>Đồng bộ</span>
              </div>
              <i />
              <div>
                <HeartFilled />
                <span>Phụng sự</span>
              </div>
            </div>
          </motion.section>
        </main>

        <footer className="faith-login__footer">
          <span>© 2026 FaithEdu</span>
          <span>Quản trị Đoàn sinh & Huynh Trưởng</span>
        </footer>
      </div>
      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
      @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

      * {
        box-sizing: border-box;
      }

      html,
      body,
      #root {
        width: 100%;
        min-height: 100%;
        margin: 0;
        padding: 0;
        font-family: 'Be Vietnam Pro', sans-serif;
      }

      body {
        background: #0b1730;
      }

      /* =========================================================
         MAIN
      ========================================================= */

      .faith-login {
        position: relative;
        min-height: 100vh;
        width: 100%;
        overflow: hidden;
        color: #fff;
        display: flex;
        flex-direction: column;
        padding: 26px clamp(22px, 4vw, 64px) 20px;
        isolation: isolate;
      }

      /* =========================================================
         BACKGROUND
      ========================================================= */

      .faith-login__background {
        position: fixed;
        inset: 0;
        z-index: -2;
        overflow: hidden;
        background:
          radial-gradient(
            circle at 20% 30%,
            rgba(59, 130, 246, 0.25),
            transparent 35%
          ),
          radial-gradient(
            circle at 80% 70%,
            rgba(245, 158, 11, 0.13),
            transparent 35%
          ),
          #07111f;
      }

      .faith-login__background img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter:
          brightness(.60)
          saturate(1.02)
          contrast(1.02);
        transform: scale(1.055);
        animation: backgroundBreath 18s ease-in-out infinite alternate;
      }

      @keyframes backgroundBreath {
        0% {
          transform: scale(1.055) translate3d(0, 0, 0);
        }

        50% {
          transform: scale(1.075) translate3d(-0.5%, -0.4%, 0);
        }

        100% {
          transform: scale(1.055) translate3d(0.5%, 0.3%, 0);
        }
      }

      .faith-login__overlay {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(
            90deg,
            rgba(4, 15, 31, .82) 0%,
            rgba(4, 15, 31, .58) 43%,
            rgba(4, 15, 31, .40) 100%
          ),
          linear-gradient(
            180deg,
            rgba(3, 10, 22, .18),
            rgba(3, 10, 22, .58)
          );
      }

      /* =========================================================
         SOFT LIGHT
      ========================================================= */

      .faith-login__glow {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        filter: blur(85px);
        opacity: .8;
      }

      .faith-login__glow--1 {
        width: 440px;
        height: 440px;
        left: -150px;
        top: 8%;
        background: rgba(59, 130, 246, .28);
        animation: glowOne 10s ease-in-out infinite alternate;
      }

      .faith-login__glow--2 {
        width: 500px;
        height: 500px;
        right: -220px;
        bottom: -180px;
        background: rgba(245, 158, 11, .16);
        animation: glowTwo 13s ease-in-out infinite alternate;
      }

      @keyframes glowOne {
        0% {
          transform: translate3d(0, 0, 0) scale(1);
          opacity: .55;
        }

        50% {
          transform: translate3d(70px, 35px, 0) scale(1.12);
          opacity: .82;
        }

        100% {
          transform: translate3d(20px, 80px, 0) scale(.95);
          opacity: .62;
        }
      }

      @keyframes glowTwo {
        0% {
          transform: translate3d(0, 0, 0) scale(1);
          opacity: .42;
        }

        50% {
          transform: translate3d(-60px, -50px, 0) scale(1.14);
          opacity: .70;
        }

        100% {
          transform: translate3d(-20px, -80px, 0) scale(.96);
          opacity: .48;
        }
      }

      /* =========================================================
         GRID
      ========================================================= */

      .faith-login__grid {
        position: absolute;
        inset: 0;
        opacity: .14;
        background-image:
          linear-gradient(
            rgba(255,255,255,.055) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(255,255,255,.055) 1px,
            transparent 1px
          );
        background-size: 54px 54px;
        mask-image: linear-gradient(
          90deg,
          #000 0%,
          rgba(0,0,0,.7) 45%,
          transparent 88%
        );
        animation: gridMove 24s linear infinite;
      }

      @keyframes gridMove {
        from {
          background-position: 0 0;
        }

        to {
          background-position: 54px 54px;
        }
      }

      /* =========================================================
         HEADER
      ========================================================= */

      .faith-login__header,
      .faith-login__content,
      .faith-login__footer {
        position: relative;
        z-index: 2;
      }

      .faith-login__header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 13px;
      }

      .brand__logo {
        width: 50px;
        height: 50px;
        display: grid;
        place-items: center;
        border-radius: 15px;

        background:
          linear-gradient(
            145deg,
            rgba(255,255,255,.20),
            rgba(255,255,255,.07)
          );

        border: 1px solid rgba(255,255,255,.24);

        box-shadow:
          0 12px 35px rgba(0,0,0,.24),
          inset 0 1px 0 rgba(255,255,255,.18);

        backdrop-filter: blur(18px);

        animation:
          logoFloat 5s ease-in-out infinite,
          logoAppear .8s ease both;
      }

      @keyframes logoFloat {
        0%, 100% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(-4px);
        }
      }

      @keyframes logoAppear {
        from {
          opacity: 0;
          transform: scale(.8) translateY(-10px);
        }

        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .brand__logo img {
        width: 38px;
        height: 38px;
        object-fit: contain;
      }

      .brand__text {
        display: flex;
        flex-direction: column;
        line-height: 1.1;
      }

      .brand__text strong {
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -.3px;
      }

      .brand__text span {
        margin-top: 5px;
        font-size: 10px;
        color: rgba(255,255,255,.68);
        letter-spacing: .8px;
        text-transform: uppercase;
      }

      /* =========================================================
         SYSTEM PILL
      ========================================================= */

      .system-pill {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 9px 14px;
        border-radius: 999px;

        background: rgba(255,255,255,.09);
        border: 1px solid rgba(255,255,255,.16);

        color: rgba(255,255,255,.82);
        font-size: 11px;
        font-weight: 600;

        backdrop-filter: blur(16px);

        box-shadow:
          0 10px 30px rgba(0,0,0,.12),
          inset 0 1px 0 rgba(255,255,255,.10);

        animation:
          systemAppear 1s .25s ease both,
          systemFloat 5s 1.2s ease-in-out infinite;
      }

      @keyframes systemAppear {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes systemFloat {
        0%, 100% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(2px);
        }
      }

      .system-pill__dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #3affb7;

        box-shadow:
          0 0 0 4px rgba(52,211,153,.08),
          0 0 15px rgba(52,211,153,.95);

        animation: statusPulse 2s ease-in-out infinite;
      }

      @keyframes statusPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }

        50% {
          transform: scale(1.35);
          opacity: .72;
        }
      }

      /* =========================================================
         CONTENT
      ========================================================= */

      .faith-login__content {
        flex: 1;
        width: min(1180px, 100%);
        margin: 0 auto;

        display: grid;
        grid-template-columns: minmax(0, 1fr) 430px;

        align-items: center;

        gap: clamp(50px, 8vw, 120px);

        padding: 48px 0;
      }

      /* =========================================================
         INTRO
      ========================================================= */

      .faith-login__intro {
        max-width: 610px;
      }

      .intro-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;

        padding: 8px 13px;

        border-radius: 999px;

        color: #fcd34d;

        background:
          linear-gradient(
            135deg,
            rgba(245,158,11,.15),
            rgba(245,158,11,.07)
          );

        border: 1px solid rgba(251,191,36,.25);

        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1px;

        box-shadow:
          0 8px 25px rgba(245,158,11,.08),
          inset 0 1px 0 rgba(255,255,255,.08);

        animation:
          badgeGlow 3s ease-in-out infinite alternate;
      }

      @keyframes badgeGlow {
        from {
          box-shadow:
            0 8px 25px rgba(245,158,11,.06),
            inset 0 1px 0 rgba(255,255,255,.08);
        }

        to {
          box-shadow:
            0 8px 32px rgba(245,158,11,.16),
            inset 0 1px 0 rgba(255,255,255,.14);
        }
      }

      .faith-login__intro h1 {
        margin: 20px 0 18px;

        font-size: clamp(39px, 4.5vw, 66px);
        line-height: 1.05;

        letter-spacing: -2.6px;
        font-weight: 800;

        text-shadow:
          0 8px 35px rgba(0,0,0,.18);
      }

      .faith-login__intro h1 span {
        background:
          linear-gradient(
            90deg,
            #ffffff 10%,
            #fde68a 55%,
            #fbbf24 90%
          );

        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;

        background-size: 200% auto;

        animation: textShine 5s ease-in-out infinite alternate;
      }

      @keyframes textShine {
        from {
          background-position: 0% center;
        }

        to {
          background-position: 100% center;
        }
      }

      .faith-login__intro > p {
        max-width: 550px;
        margin: 0;

        color: rgba(255,255,255,.73);

        font-size: 15px;
        line-height: 1.75;

        text-shadow: 0 2px 15px rgba(0,0,0,.18);
      }

      /* =========================================================
         FEATURES
      ========================================================= */

      .intro-features {
        display: flex;
        gap: 14px;
        margin-top: 34px;
        flex-wrap: wrap;
      }

      .intro-feature {
        display: flex;
        align-items: center;
        gap: 10px;

        min-width: 205px;

        padding: 12px 15px;

        border-radius: 15px;

        background:
          linear-gradient(
            135deg,
            rgba(255,255,255,.095),
            rgba(255,255,255,.045)
          );

        border: 1px solid rgba(255,255,255,.12);

        backdrop-filter: blur(15px);

        box-shadow:
          0 12px 30px rgba(0,0,0,.08),
          inset 0 1px 0 rgba(255,255,255,.08);

        transition:
          transform .3s ease,
          background .3s ease,
          border-color .3s ease;
      }

      .intro-feature:hover {
        transform: translateY(-5px);
        background: rgba(255,255,255,.12);
        border-color: rgba(255,255,255,.20);
      }

      .intro-feature__icon {
        width: 34px;
        height: 34px;
        flex: 0 0 34px;

        display: grid;
        place-items: center;

        border-radius: 11px;

        color: #bfdbfe;
        background: rgba(59,130,246,.17);

        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.08);
      }

      .intro-feature strong,
      .intro-feature small {
        display: block;
      }

      .intro-feature strong {
        font-size: 11px;
        font-weight: 700;
        color: rgba(255,255,255,.93);
      }

      .intro-feature small {
        margin-top: 3px;
        font-size: 9px;
        color: rgba(255,255,255,.52);
      }

      /* =========================================================
         LOGIN CARD
      ========================================================= */

      .login-card {
        position: relative;

        width: 100%;
        padding: 32px;

        border-radius: 26px;

        background:
          linear-gradient(
            145deg,
            rgba(255,255,255,.985),
            rgba(248,250,252,.965)
          );

        color: #0f172a;

        border: 1px solid rgba(255,255,255,.95);

        box-shadow:
          0 35px 90px rgba(0,0,0,.34),
          0 10px 35px rgba(30,64,175,.08),
          inset 0 1px 0 rgba(255,255,255,1);

        overflow: hidden;

        transition:
          transform .4s cubic-bezier(.16,1,.3,1),
          box-shadow .4s ease;
      }

      .login-card::before {
        content: "";
        position: absolute;
        top: -120px;
        right: -100px;

        width: 260px;
        height: 260px;

        border-radius: 50%;

        background:
          radial-gradient(
            circle,
            rgba(99,102,241,.10),
            transparent 70%
          );

        pointer-events: none;

        animation: cardLight 7s ease-in-out infinite alternate;
      }

      @keyframes cardLight {
        from {
          transform: translate(0, 0) scale(1);
        }

        to {
          transform: translate(-35px, 25px) scale(1.18);
        }
      }

      .login-card:hover {
        transform: translateY(-3px);

        box-shadow:
          0 42px 100px rgba(0,0,0,.38),
          0 14px 40px rgba(30,64,175,.10),
          inset 0 1px 0 rgba(255,255,255,1);
      }

      .login-card__top {
        position: relative;
        z-index: 1;

        display: flex;
        align-items: center;
        gap: 13px;
      }

      .login-card__mini-logo {
        width: 50px;
        height: 50px;

        display: grid;
        place-items: center;

        border-radius: 14px;

        background:
          linear-gradient(
            145deg,
            #eef2ff,
            #ffffff
          );

        border: 1px solid #e2e8f0;

        box-shadow:
          0 8px 20px rgba(79,70,229,.08),
          inset 0 1px 0 #fff;

        animation: miniLogoFloat 4s ease-in-out infinite;
      }

      @keyframes miniLogoFloat {
        0%, 100% {
          transform: translateY(0) rotate(0deg);
        }

        50% {
          transform: translateY(-3px) rotate(.5deg);
        }
      }

      .login-card__mini-logo img {
        width: 38px;
        height: 38px;
        object-fit: contain;
      }

      .login-card__top span {
        color: #64748b;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1.3px;
      }

      .login-card__top h2 {
        margin: 3px 0 0;

        color: #0f172a;

        font-size: 29px;
        line-height: 1.1;

        letter-spacing: -1px;
        font-weight: 800;
      }

      .login-card__desc {
        position: relative;
        z-index: 1;

        margin: 17px 0 27px;

        color: #64748b;

        font-size: 12.5px;
        line-height: 1.6;
      }

      /* =========================================================
         FORM
      ========================================================= */

      .login-card .ant-form-item {
        margin-bottom: 18px;
      }

      .login-card .ant-form-item-label {
        padding-bottom: 7px;
      }

      .login-card .ant-form-item-label > label {
        color: #334155;
        font-size: 11px;
        font-weight: 700;
      }

      .faith-input {
        height: 54px !important;

        border-radius: 14px !important;

        background: #f8fafc !important;

        border: 1px solid #e2e8f0 !important;

        transition:
          border-color .25s ease,
          box-shadow .25s ease,
          background .25s ease,
          transform .2s ease !important;

        box-shadow: none !important;
      }

      .faith-input:hover {
        border-color: #a5b4fc !important;
        background: #fff !important;
        transform: translateY(-1px);
      }

      .faith-input:focus,
      .ant-input-affix-wrapper-focused {
        border-color: #6366f1 !important;

        background: #fff !important;

        box-shadow:
          0 0 0 4px rgba(99,102,241,.09),
          0 8px 20px rgba(99,102,241,.07) !important;
      }

      .faith-input .ant-input-prefix,
      .faith-input .ant-input-password-icon {
        color: #94a3b8;
        transition: color .2s ease;
      }

      .faith-input:focus-within .ant-input-prefix {
        color: #6366f1;
      }

     .faith-forgot-input .ant-input {
  font-size: 16px !important;
}
      /* =========================================================
         OPTIONS
      ========================================================= */

      .login-options {
        display: flex;
        align-items: center;
        justify-content: space-between;

        gap: 12px;
        margin-top: 2px;
      }

      .faith-checkbox {
        color: #64748b;
        font-size: 11px;
      }

      .register-link {
        padding: 0;

        border: 0;
        background: transparent;

        color: #4f46e5;

        cursor: pointer;

        font: inherit;

        font-size: 11px;
        font-weight: 700;

        transition:
          color .2s ease,
          transform .2s ease;
      }

      .register-link:hover {
        color: #4338ca;
        text-decoration: underline;
        transform: translateX(2px);
      }

      /* =========================================================
         SUBMIT
      ========================================================= */

      .submit-wrap {
        margin-top: 25px !important;
        margin-bottom: 0 !important;
      }

      .submit-wrap .ant-btn,
      .submit-wrap button {
        position: relative;
        overflow: hidden;

        min-height: 55px !important;

        border-radius: 15px !important;

        border: 0 !important;

        background:
          linear-gradient(
            135deg,
            #4338ca 0%,
            #6366f1 45%,
            #7c3aed 100%
          ) !important;

        background-size: 180% 180%;

        box-shadow:
          0 13px 28px rgba(79,70,229,.25),
          inset 0 1px 0 rgba(255,255,255,.18) !important;

        font-size: 12px !important;
        font-weight: 800 !important;
        letter-spacing: .5px;

        transition:
          transform .25s ease,
          box-shadow .25s ease,
          background-position .5s ease !important;
      }

      .submit-wrap .ant-btn::before,
      .submit-wrap button::before {
        content: "";

        position: absolute;

        top: 0;
        left: -100%;

        width: 70%;
        height: 100%;

        background:
          linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.20),
            transparent
          );

        transform: skewX(-20deg);

        transition: left .65s ease;

        pointer-events: none;
      }

      .submit-wrap .ant-btn:hover,
      .submit-wrap button:hover {
        transform: translateY(-2px);

        background-position: 100% 50% !important;

        box-shadow:
          0 18px 36px rgba(79,70,229,.32),
          inset 0 1px 0 rgba(255,255,255,.20) !important;
      }

      .submit-wrap .ant-btn:hover::before,
      .submit-wrap button:hover::before {
        left: 130%;
      }

      .submit-wrap .ant-btn:active,
      .submit-wrap button:active {
        transform: translateY(0) scale(.985);
      }

      /* =========================================================
         TRUST
      ========================================================= */

      .login-card__trust {
        display: flex;
        align-items: center;
        justify-content: space-around;

        gap: 8px;

        margin-top: 24px;
        padding-top: 18px;

        border-top: 1px solid #eef2f7;
      }

      .login-card__trust div {
        display: flex;
        align-items: center;
        gap: 5px;

        color: #64748b;

        font-size: 9px;
        font-weight: 600;

        transition:
          color .2s ease,
          transform .2s ease;
      }

      .login-card__trust div:hover {
        color: #334155;
        transform: translateY(-2px);
      }

      .login-card__trust div:nth-of-type(1) svg {
        color: #6366f1;
      }

      .login-card__trust div:nth-of-type(2) svg {
        color: #10b981;
      }

      .login-card__trust div:nth-of-type(3) svg {
        color: #ec4899;
      }

      .login-card__trust i {
        width: 1px;
        height: 14px;
        background: #e2e8f0;
      }

      /* =========================================================
         FOOTER
      ========================================================= */

      .faith-login__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;

        gap: 20px;

        color: rgba(255,255,255,.48);

        font-size: 9px;
        letter-spacing: .2px;
      }

      /* =========================================================
         RESPONSIVE
      ========================================================= */

      @media (max-width: 1100px) {
        .faith-login__content {
          grid-template-columns: minmax(0, 1fr) 400px;
          gap: 55px;
        }

        .faith-login__intro h1 {
          font-size: clamp(38px, 4.5vw, 56px);
        }
      }

      @media (max-width: 900px) {
        .faith-login__content {
          grid-template-columns: 1fr;

          gap: 34px;

          width: min(620px, 100%);

          padding: 35px 0;
        }

        .faith-login__intro {
          text-align: center;
          margin: 0 auto;
        }

        .faith-login__intro > p {
          margin: 0 auto;
        }

        .intro-features {
          justify-content: center;
        }

        .system-pill {
          display: none;
        }

        .login-card:hover {
          transform: none;
        }
      }

      @media (max-width: 600px) {
        .faith-login {
          padding: 18px 14px 14px;
        }

        .brand__text span {
          display: none;
        }

        .brand__logo {
          width: 43px;
          height: 43px;
          border-radius: 12px;
        }

        .brand__logo img {
          width: 32px;
          height: 32px;
        }

        .brand__text strong {
          font-size: 16px;
        }

        .faith-login__content {
          padding: 28px 0 20px;
        }

        .faith-login__intro {
          display: none;
        }

        .login-card {
          padding: 25px 20px 20px;
          border-radius: 23px;
        }

        .login-card__top h2 {
          font-size: 27px;
        }

        .login-options {
          align-items: flex-start;
        }

        .faith-login__footer {
          justify-content: center;
          text-align: center;
        }

        .faith-login__footer span:last-child {
          display: none;
        }

        .faith-login__glow--1 {
          width: 300px;
          height: 300px;
        }

        .faith-login__glow--2 {
          width: 320px;
          height: 320px;
        }
      }

      /* =========================================================
         REDUCED MOTION
      ========================================================= */

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
        }
      }
        .login-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.forgot-link,
.register-link {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  transition:
    color .2s ease,
    transform .2s ease;
}

.forgot-link {
  color: #64748b;
}

.forgot-link:hover {
  color: #4f46e5;
  transform: translateY(-1px);
}

.register-link {
  color: #4f46e5;
}

.register-link:hover {
  color: #4338ca;
  text-decoration: underline;
  transform: translateX(2px);
}

@media (max-width: 600px) {
  .login-links {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
}
    `,
        }}
      />
    </ConfigProvider>
  );
}
