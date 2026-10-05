// src/pages/auth/register/FaithEduRegister.jsx

import React, { useState } from "react";

import { Form, Modal } from "antd";

import {
  CheckCircleFilled,
  CloseOutlined,
  FileTextOutlined,
  HeartFilled,
  SafetyCertificateFilled,
} from "@ant-design/icons";

import { motion, AnimatePresence } from "framer-motion";

import { useNavigate } from "react-router-dom";

import logoWeb from "../../../assets/images/logoweb.png";

import LoadingLogo from "../../../components/LoadingLogo";
import { useNotification } from "../../../components/notification";

import { registerRequest, registerVerify } from "../../../api/authApi";

import RegisterForm from "./RegisterForm";
import RegisterVerify from "./RegisterVerify";

import {
  getRegisterErrorMessage,
  OTP_EXPIRES_SECONDS,
} from "./registerConstants";

/* ============================================================
   PAGE CSS
============================================================ */

const REGISTER_CSS = `
  * {
    box-sizing: border-box;
  }

  .fe-register {
    --navy: #071a35;
    --blue: #2167d5;
    --blue-dark: #174da8;
    --gold: #d5a343;
    --text: #17263d;
    --muted: #8792a3;
    --line: #e7ebf1;

    width: 100%;
    min-height: 100vh;

    display: grid;
    grid-template-columns: 42% 58%;

    background: #fff;

    color: var(--text);

    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Arial,
      sans-serif;

    overflow: hidden;
  }

  /* ==========================================================
     LEFT BRAND
  ========================================================== */

  .fe-brand-panel {
    position: relative;

    min-height: 100vh;

    padding: 42px 55px;

    display: flex;
    flex-direction: column;

    overflow: hidden;

    color: #fff;

    background:
      radial-gradient(
        circle at 80% 20%,
        rgba(55, 111, 206, 0.35),
        transparent 30%
      ),
      radial-gradient(
        circle at 10% 90%,
        rgba(213, 163, 67, 0.14),
        transparent 28%
      ),
      linear-gradient(
        145deg,
        #06172f,
        #0a2348 55%,
        #071a35
      );
  }

  .fe-brand-grid {
    position: absolute;
    inset: 0;

    opacity: 0.15;

    background-image:
      linear-gradient(
        rgba(255,255,255,.06) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(255,255,255,.06) 1px,
        transparent 1px
      );

    background-size: 45px 45px;

    mask-image:
      linear-gradient(
        135deg,
        #000,
        transparent 75%
      );
  }

  .fe-brand-panel::before {
    content: "";

    position: absolute;

    width: 600px;
    height: 600px;

    right: -310px;
    top: 90px;

    border-radius: 50%;

    border: 1px solid rgba(255,255,255,.07);
  }

  .fe-brand-panel::after {
    content: "";

    position: absolute;

    width: 420px;
    height: 420px;

    right: -220px;
    top: 180px;

    border-radius: 50%;

    border: 1px solid rgba(255,255,255,.06);
  }

  .fe-brand-top {
    position: relative;
    z-index: 2;

    display: flex;
    align-items: center;

    gap: 12px;
  }

  .fe-logo {
    width: 47px;
    height: 47px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 13px;

    background: #fff;

    box-shadow:
      0 12px 30px rgba(0,0,0,.18);
  }

  .fe-logo img {
    width: 37px;
    height: 37px;

    object-fit: contain;
  }

  .fe-brand-title {
    display: flex;
    flex-direction: column;

    gap: 2px;
  }

  .fe-brand-title strong {
    font-size: 21px;
    font-weight: 800;

    letter-spacing: -.7px;
  }

  .fe-brand-title strong span {
    color: #6da1ff;
  }

  .fe-brand-title small {
    color: rgba(255,255,255,.45);

    font-size: 8px;

    letter-spacing: .8px;
  }

  .fe-brand-content {
    position: relative;
    z-index: 2;

    margin-top: auto;
    margin-bottom: auto;

    max-width: 480px;
  }

  .fe-brand-kicker {
    display: flex;
    align-items: center;

    gap: 8px;

    margin-bottom: 22px;

    color: #d7b66e;

    font-size: 8px;
    font-weight: 800;

    letter-spacing: 2px;
  }

  .fe-brand-kicker i {
    width: 24px;
    height: 1px;

    background: #d7b66e;
  }

  .fe-brand-content h1 {
    margin: 0;

    font-size: clamp(40px, 4vw, 60px);

    line-height: 1.03;

    letter-spacing: -3px;

    font-weight: 800;
  }

  .fe-brand-content h1 span {
    color: #70a2ff;
  }

  .fe-brand-description {
    max-width: 440px;

    margin: 23px 0 30px;

    color: rgba(255,255,255,.54);

    font-size: 13px;

    line-height: 1.8;
  }

  .fe-brand-points {
    display: flex;
    flex-direction: column;

    gap: 11px;
  }

  .fe-brand-point {
    display: flex;
    align-items: center;

    gap: 10px;
  }

  .fe-brand-point-icon {
    width: 31px;
    height: 31px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 9px;

    background: rgba(68,125,218,.13);

    color: #71a3ff;

    font-size: 12px;
  }

  .fe-brand-point span {
    color: rgba(255,255,255,.72);

    font-size: 10px;
    font-weight: 650;
  }

  .fe-brand-quote {
    position: relative;
    z-index: 2;

    padding-top: 21px;

    border-top: 1px solid rgba(255,255,255,.08);
  }

  .fe-brand-quote p {
    margin: 0 0 5px;

    color: rgba(255,255,255,.55);

    font-family: Georgia, serif;

    font-size: 11px;

    line-height: 1.6;
  }

  .fe-brand-quote strong {
    color: #fff;
  }

  .fe-brand-quote span {
    color: #d5a343;

    font-size: 8px;
    font-weight: 800;
  }

  /* ==========================================================
     RIGHT
  ========================================================== */

  .fe-form-panel {
    min-width: 0;
    min-height: 100vh;

    display: flex;
    flex-direction: column;

    overflow-y: auto;

    background: #fff;
  }

  .fe-form-top {
    width: min(680px, calc(100% - 70px));

    margin: 0 auto;

    padding-top: 36px;

    display: flex;
    justify-content: flex-end;
  }

  .fe-login {
    display: flex;
    align-items: center;

    gap: 9px;

    color: #929cab;

    font-size: 10px;
  }

  .fe-login button {
    border: 0;

    padding: 7px 11px;

    border-radius: 7px;

    background: #f1f5fb;

    color: #1f5fc8;

    font-size: 9px;
    font-weight: 800;

    cursor: pointer;

    transition:
      background .2s ease,
      color .2s ease;
  }

  .fe-login button:hover {
    color: #fff;

    background: #2167d5;
  }

  .fe-form-area {
    width: min(680px, calc(100% - 70px));

    margin: auto auto;

    padding: 38px 0 40px;
  }

  .fe-heading {
    margin-bottom: 25px;
  }

  .fe-heading-kicker {
    display: flex;
    align-items: center;

    gap: 7px;

    margin-bottom: 10px;

    color: #8d98a8;

    font-size: 8px;
    font-weight: 800;

    letter-spacing: 1.5px;
  }

  .fe-heading-kicker i {
    width: 6px;
    height: 6px;

    border-radius: 50%;

    background: var(--gold);
  }

  .fe-heading h2 {
    margin: 0;

    color: #112641;

    font-size: 30px;

    line-height: 1.1;

    letter-spacing: -1.2px;

    font-weight: 800;
  }

  .fe-heading p {
    margin: 8px 0 0;

    color: #8a95a5;

    font-size: 11px;

    line-height: 1.6;
  }

  /* ==========================================================
     OTP AREA
  ========================================================== */

  .fe-verify-area {
    min-height: 350px;
  }

  /* ==========================================================
     FOOTER
  ========================================================== */

  .fe-footer {
    width: min(680px, calc(100% - 70px));

    margin: 0 auto;

    padding-bottom: 23px;

    display: flex;
    justify-content: space-between;

    color: #abb3bf;

    font-size: 8px;
  }

  .fe-footer span {
    display: flex;
    align-items: center;

    gap: 5px;
  }

  .fe-footer .anticon {
    color: #339577;
  }

  /* ==========================================================
     MODAL
  ========================================================== */

  .fe-legal-modal .ant-modal-content {
    padding: 0;

    overflow: hidden;

    border-radius: 20px;

    box-shadow:
      0 30px 90px rgba(7,28,58,.2);
  }

  .fe-legal-head {
    padding: 28px 30px 23px;

    background:
      linear-gradient(
        135deg,
        #f4f8ff,
        #fff
      );

    border-bottom: 1px solid #edf0f4;
  }

  .fe-legal-icon {
    width: 40px;
    height: 40px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 11px;

    border-radius: 11px;

    color: #2167d5;

    background: #eaf2ff;

    font-size: 17px;
  }

  .fe-legal-head h2 {
    margin: 0;

    color: #132742;

    font-size: 20px;
    font-weight: 800;
  }

  .fe-legal-head p {
    margin: 4px 0 0;

    color: #8d98a8;

    font-size: 9px;
  }

  .fe-legal-body {
    max-height: 60vh;

    overflow-y: auto;

    padding: 25px 30px;
  }

  .fe-legal-body section {
    margin-bottom: 18px;
  }

  .fe-legal-body h3 {
    margin: 0 0 5px;

    color: #293952;

    font-size: 11px;
    font-weight: 800;
  }

  .fe-legal-body p {
    margin: 0;

    color: #6d798c;

    font-size: 10px;

    line-height: 1.75;
  }

  .fe-legal-note {
    display: flex;
    gap: 8px;

    padding: 11px;

    border-radius: 9px;

    background: #fff9ed;

    border: 1px solid #f0e3c7;

    color: #826d40;

    font-size: 9px;

    line-height: 1.5;
  }

  .fe-legal-note .anticon {
    color: #d29c35;
  }

  /* ==========================================================
     RESPONSIVE
  ========================================================== */

  @media (max-width: 1050px) {
    .fe-register {
      grid-template-columns: 36% 64%;
    }

    .fe-brand-panel {
      padding: 35px 32px;
    }

    .fe-brand-content h1 {
      font-size: 43px;
    }

    .fe-brand-description {
      font-size: 11px;
    }
  }

  @media (max-width: 800px) {
    .fe-register {
      display: block;

      overflow: visible;
    }

    .fe-brand-panel {
      min-height: 220px;

      padding: 25px;
    }

    .fe-brand-content {
      margin-top: 35px;
      margin-bottom: 0;
    }

    .fe-brand-content h1 {
      font-size: 35px;
    }

    .fe-brand-description,
    .fe-brand-points,
    .fe-brand-quote {
      display: none;
    }

    .fe-form-panel {
      min-height: calc(100vh - 220px);

      overflow: visible;
    }

    .fe-form-area {
      margin: 0 auto;

      padding-top: 30px;
    }
  }

  @media (max-width: 560px) {
    .fe-brand-panel {
      min-height: 175px;

      padding: 20px;
    }

    .fe-logo {
      width: 40px;
      height: 40px;
    }

    .fe-logo img {
      width: 32px;
      height: 32px;
    }

    .fe-brand-title strong {
      font-size: 18px;
    }

    .fe-brand-title small {
      display: none;
    }

    .fe-brand-content {
      margin-top: 25px;
    }

    .fe-brand-kicker {
      margin-bottom: 9px;

      font-size: 7px;
    }

    .fe-brand-content h1 {
      font-size: 29px;

      letter-spacing: -1.3px;
    }

    .fe-form-top,
    .fe-form-area,
    .fe-footer {
      width: calc(100% - 36px);
    }

    .fe-form-top {
      padding-top: 20px;
    }

    .fe-form-area {
      padding-top: 25px;
    }

    .fe-heading h2 {
      font-size: 27px;
    }
  }
`;

/* ============================================================
   COMPONENT
============================================================ */

const FaithEduRegister = () => {
  const navigate = useNavigate();

  const notify = useNotification();

  /*
   * Dùng chung Form instance với RegisterForm.
   *
   * Điều này rất quan trọng vì RegisterForm cần:
   * - validateFields()
   * - getFieldsValue()
   * - giữ dữ liệu khi chuyển step
   */
  const [form] = Form.useForm();

  /* ==========================================================
     STATE
  ========================================================== */

  const [step, setStep] = useState("form");

  const [registerEmail, setRegisterEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [loadingProgress, setLoadingProgress] = useState(0);

  const [error, setError] = useState("");

  const [modalType, setModalType] = useState(null);

  /*
   * Checkbox điều khoản.
   */
  const [accepted, setAccepted] = useState(false);

  /*
   * Lưu payload cuối cùng đã đăng ký.
   *
   * Dùng để resend OTP.
   */
  const [lastRegisterPayload, setLastRegisterPayload] = useState(null);

  /* ==========================================================
     REGISTER
  ========================================================== */

  const handleRegister = async (payload) => {
    setError("");

    setLoading(true);

    setLoadingProgress(10);

    try {
      /*
       * Payload đã được chuẩn hóa từ RegisterForm.
       *
       * Vẫn tạo lại một object mới ở đây để đảm bảo
       * API chỉ nhận đúng 10 field.
       */
      const cleanPayload = {
        email: payload?.email?.trim().toLowerCase(),

        password: payload?.password,

        full_name: payload?.full_name?.trim(),

        phone: payload?.phone?.trim() || null,

        church_name: payload?.church_name?.trim(),

        church_type: payload?.church_type || "GIAO_XU",

        address: payload?.address?.trim() || null,

        district: payload?.district?.trim() || null,

        ward: payload?.ward?.trim() || null,

        pastor_name: payload?.pastor_name?.trim() || null,
      };

      console.log("[REGISTER] PAYLOAD:", JSON.stringify(cleanPayload, null, 2));

      setLoadingProgress(30);

      const data = await registerRequest(cleanPayload);

      setLoadingProgress(80);

      console.log("[REGISTER] RESPONSE:", data);

      if (!data?.success) {
        throw new Error(data?.message || "Không thể gửi mã xác thực.");
      }

      /*
       * Lưu payload để resend OTP.
       */
      setLastRegisterPayload(cleanPayload);

      /*
       * Lưu email để verify.
       */
      setRegisterEmail(cleanPayload.email);

      setLoadingProgress(100);

      /*
       * Chuyển sang màn hình OTP.
       */
      setStep("verify");

      notify.success("Mã xác thực đã được gửi đến email của bạn.");
    } catch (err) {
      console.error("[REGISTER] STATUS:", err?.response?.status);

      console.error("[REGISTER] RESPONSE:", err?.response?.data);

      console.error("[REGISTER] ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        getRegisterErrorMessage(err) ||
        "Không thể đăng ký FaithEdu.";

      setError(message);

      notify.error(message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 250);
    }
  };

  /* ==========================================================
     VERIFY OTP
  ========================================================== */

  const handleVerify = async (otp) => {
    try {
      setLoading(true);
      setError("");

      const data = await registerVerify({
        email: registerEmail,
        otp,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Mã xác thực không chính xác.");
      }

      notify.success({
        message: "Đăng ký thành công!",
        description:
          "Tài khoản đã được xác thực. Vui lòng đăng nhập để tiếp tục.",
      });

      // KHÔNG lưu token
      // KHÔNG lưu admin
      // KHÔNG lưu church
      // KHÔNG navigate vào Dashboard

      navigate("/", {
        replace: true,
        state: {
          email: registerEmail,
          registered: true,
        },
      });
    } catch (err) {
      console.error("[VERIFY OTP ERROR]", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        "Xác thực OTP thất bại.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     RESEND OTP
  ========================================================== */

  const handleResend = async () => {
    if (!lastRegisterPayload) {
      const message = "Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại.";

      setError(message);

      notify.error(message);

      return;
    }

    try {
      setError("");

      setLoading(true);

      setLoadingProgress(15);

      console.log(
        "[REGISTER] RESEND PAYLOAD:",
        JSON.stringify(lastRegisterPayload, null, 2),
      );

      const data = await registerRequest(lastRegisterPayload);

      setLoadingProgress(85);

      console.log("[REGISTER] RESEND RESPONSE:", data);

      if (!data?.success) {
        throw new Error(data?.message || "Không thể gửi lại mã xác thực.");
      }

      setLoadingProgress(100);

      notify.success("Mã xác thực mới đã được gửi đến email của bạn.");
    } catch (err) {
      console.error("[RESEND] STATUS:", err?.response?.status);

      console.error("[RESEND] RESPONSE:", err?.response?.data);

      console.error("[RESEND] ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        getRegisterErrorMessage(err) ||
        "Không thể gửi lại mã xác thực.";

      setError(message);

      notify.error(message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 250);
    }
  };

  /* ==========================================================
     BACK FROM OTP
  ========================================================== */

  const handleBackToRegister = () => {
    setError("");

    setStep("form");

    /*
     * Không reset form.
     *
     * Người dùng quay lại vẫn giữ nguyên
     * thông tin đã nhập.
     */
  };

  /* ==========================================================
     MODAL CONTENT
  ========================================================== */

  const termsContent = (
    <div className="fe-legal-body">
      <section>
        <h3>1. Chấp nhận điều khoản</h3>

        <p>
          Khi đăng ký và sử dụng FaithEdu, bạn xác nhận đã đọc, hiểu và đồng ý
          tuân thủ các điều khoản sử dụng của nền tảng.
        </p>
      </section>

      <section>
        <h3>2. Tài khoản người dùng</h3>

        <p>
          Người dùng có trách nhiệm cung cấp thông tin chính xác và bảo mật
          thông tin đăng nhập.
        </p>
      </section>

      <section>
        <h3>3. Thông tin giáo xứ</h3>

        <p>
          Thông tin giáo xứ cần được cung cấp chính xác và sử dụng cho mục đích
          quản lý, giáo dục đức tin trên FaithEdu.
        </p>
      </section>

      <section>
        <h3>4. Sử dụng hệ thống</h3>

        <p>
          Không được cố ý khai thác lỗi hệ thống, truy cập trái phép hoặc thực
          hiện các hành vi gây ảnh hưởng đến hoạt động của nền tảng.
        </p>
      </section>

      <section>
        <h3>5. Thay đổi điều khoản</h3>

        <p>
          FaithEdu có thể cập nhật điều khoản khi cần thiết và sẽ thông báo
          những thay đổi quan trọng.
        </p>
      </section>

      <div className="fe-legal-note">
        <HeartFilled />

        <span>
          Cùng nhau xây dựng một môi trường giáo dục đức tin an toàn, tích cực
          và yêu thương.
        </span>
      </div>
    </div>
  );

  const privacyContent = (
    <div className="fe-legal-body">
      <section>
        <h3>1. Thông tin được thu thập</h3>

        <p>
          FaithEdu có thể thu thập họ tên, email, số điện thoại và thông tin
          liên quan đến giáo xứ khi đăng ký.
        </p>
      </section>

      <section>
        <h3>2. Mục đích sử dụng</h3>

        <p>
          Thông tin được sử dụng để tạo tài khoản, quản lý giáo xứ, hỗ trợ hoạt
          động giáo lý và cung cấp dịch vụ.
        </p>
      </section>

      <section>
        <h3>3. Bảo vệ thông tin</h3>

        <p>
          FaithEdu áp dụng các biện pháp phù hợp nhằm hạn chế truy cập và sử
          dụng thông tin trái phép.
        </p>
      </section>

      <section>
        <h3>4. Không chia sẻ tùy tiện</h3>

        <p>
          Thông tin người dùng và giáo xứ không được tùy tiện cung cấp cho bên
          thứ ba ngoài phạm vi cần thiết để vận hành dịch vụ, trừ trường hợp
          pháp luật yêu cầu.
        </p>
      </section>

      <section>
        <h3>5. Quyền của người dùng</h3>

        <p>
          Người dùng có quyền yêu cầu kiểm tra, cập nhật hoặc xử lý thông tin
          tài khoản theo chính sách của FaithEdu.
        </p>
      </section>

      <div className="fe-legal-note">
        <SafetyCertificateFilled />

        <span>
          FaithEdu hướng tới một môi trường số an toàn và đáng tin cậy cho cộng
          đoàn.
        </span>
      </div>
    </div>
  );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <style>{REGISTER_CSS}</style>

      <div className="fe-register">
        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && <LoadingLogo progress={loadingProgress} />}

        {/* ====================================================
            LEFT BRAND PANEL
        ==================================================== */}

        <aside className="fe-brand-panel">
          <div className="fe-brand-grid" />

          {/* LOGO */}

          <div className="fe-brand-top">
            <div className="fe-logo">
              <img src={logoWeb} alt="FaithEdu" />
            </div>

            <div className="fe-brand-title">
              <strong>
                Faith<span>Edu</span>
              </strong>

              <small>NỀN TẢNG GIÁO LÝ SỐ</small>
            </div>
          </div>

          {/* CONTENT */}

          <div className="fe-brand-content">
            <div className="fe-brand-kicker">
              <i />
              FAITHEDU · 2026
            </div>

            <h1>
              Quản lý giáo lý.
              <br />
              <span>Kết nối Đức Tin.</span>
            </h1>

            <p className="fe-brand-description">
              Một không gian số dành riêng cho giáo xứ, giúp quản lý hoạt động
              giáo lý và cộng đoàn đơn giản, hiện đại và hiệu quả hơn.
            </p>

            <div className="fe-brand-points">
              <div className="fe-brand-point">
                <div className="fe-brand-point-icon">
                  <CheckCircleFilled />
                </div>

                <span>Quản lý giáo xứ tập trung</span>
              </div>

              <div className="fe-brand-point">
                <div className="fe-brand-point-icon">
                  <SafetyCertificateFilled />
                </div>

                <span>Không gian dữ liệu riêng biệt</span>
              </div>

              <div className="fe-brand-point">
                <div className="fe-brand-point-icon">
                  <HeartFilled />
                </div>

                <span>Công nghệ phục vụ Đức Tin</span>
              </div>
            </div>
          </div>

          {/* QUOTE */}

          <div className="fe-brand-quote">
            <p>
              “Hãy để công nghệ phục vụ việc
              <strong> gieo mầm Đức Tin.</strong>
            </p>

            <span>— FaithEdu</span>
          </div>
        </aside>

        {/* ====================================================
            RIGHT FORM PANEL
        ==================================================== */}

        <main className="fe-form-panel">
          {/* LOGIN */}

          <div className="fe-form-top">
            <div className="fe-login">
              <span>Đã có tài khoản?</span>

              <button type="button" onClick={() => navigate("/")}>
                Đăng nhập
              </button>
            </div>
          </div>

          {/* FORM AREA */}

          <div className="fe-form-area">
            {/* ==================================================
                HEADING
            ================================================== */}

            <div className="fe-heading">
              <div className="fe-heading-kicker">
                <i />

                {step === "form"
                  ? "TẠO KHÔNG GIAN GIÁO XỨ"
                  : "XÁC THỰC TÀI KHOẢN"}
              </div>
            </div>

            {/* ==================================================
                CONTENT
            ================================================== */}

            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key="register-form"
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                >
                  <RegisterForm
                    form={form}
                    accepted={accepted}
                    setAccepted={setAccepted}
                    loading={loading}
                    error={error}
                    onSubmit={handleRegister}
                    onTerms={() => setModalType("terms")}
                    onPrivacy={() => setModalType("privacy")}
                    onLogin={() => navigate("/")}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register-verify"
                  className="fe-verify-area"
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                >
                  <RegisterVerify
                    email={registerEmail}
                    loading={loading}
                    error={error}
                    expiresIn={OTP_EXPIRES_SECONDS}
                    onVerify={handleVerify}
                    onBack={handleBackToRegister}
                    onResend={handleResend}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER */}

          <footer className="fe-footer">
            <span>
              <SafetyCertificateFilled />
              Dữ liệu được bảo vệ
            </span>

            <span>FaithEdu · Nền tảng giáo lý số</span>
          </footer>
        </main>
      </div>

      {/* ======================================================
          TERMS MODAL
      ====================================================== */}

      <Modal
        open={modalType === "terms"}
        onCancel={() => setModalType(null)}
        footer={null}
        centered
        destroyOnHidden
        className="fe-legal-modal"
        closeIcon={
          <CloseOutlined
            style={{
              color: "#64748b",
              fontSize: 14,
            }}
          />
        }
      >
        <div className="fe-legal-head">
          <div className="fe-legal-icon">
            <FileTextOutlined />
          </div>

          <h2>Điều khoản sử dụng</h2>

          <p>Các quy định khi sử dụng FaithEdu</p>
        </div>

        {termsContent}
      </Modal>

      {/* ======================================================
          PRIVACY MODAL
      ====================================================== */}

      <Modal
        open={modalType === "privacy"}
        onCancel={() => setModalType(null)}
        footer={null}
        centered
        destroyOnHidden
        className="fe-legal-modal"
        closeIcon={
          <CloseOutlined
            style={{
              color: "#64748b",
              fontSize: 14,
            }}
          />
        }
      >
        <div className="fe-legal-head">
          <div className="fe-legal-icon">
            <SafetyCertificateFilled />
          </div>

          <h2>Chính sách bảo mật</h2>

          <p>Cách FaithEdu bảo vệ thông tin</p>
        </div>

        {privacyContent}
      </Modal>
    </>
  );
};

export default FaithEduRegister;
