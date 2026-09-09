import React, { useState } from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
  message,
  Checkbox,
} from "antd";

import {
  BankOutlined,
  EnvironmentOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CheckCircleFilled,
  HeartFilled,
  TeamOutlined,
  BookFilled,
  ArrowRightOutlined,
  SafetyCertificateFilled,
  CloseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import { motion } from "framer-motion";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

import logoWeb from "../../assets/images/logoweb.png";
import registerHero from "../../assets/images/register-background.jpg";

const { Title } = Typography;

// ============================================================
// COLOR
// ============================================================

const colors = {
  primary: "#1769AA",
  primaryDark: "#103F70",
  primaryDeep: "#0B3157",

  blue: "#287ED0",
  blueLight: "#EAF5FF",
  blueVeryLight: "#F5FAFF",

  gold: "#D6A52D",
  goldLight: "#FFF6DD",
  goldDark: "#A97913",

  text: "#334155",
  textLight: "#718096",

  border: "#D7E3EF",

  danger: "#E85B66",

  white: "#FFFFFF",
};

// ============================================================
// MOTION
// ============================================================

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -35,
  },

  visible: {
    opacity: 1,
    x: 0,

    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 40,
  },

  visible: {
    opacity: 1,
    x: 0,

    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const stagger = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

// ============================================================
// COMPONENT
// ============================================================

const FaithEduRegister = () => {
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  // ==========================================================
  // MODAL
  // ==========================================================

  const [modalType, setModalType] = useState(null);

  const openTermsModal = (e) => {
    e?.preventDefault();
    setModalType("terms");
  };

  const openPrivacyModal = (e) => {
    e?.preventDefault();
    setModalType("privacy");
  };

  const closeModal = () => {
    setModalType(null);
  };
  const generateUsername = (email) => {
    if (!email) return "";

    const base = email
      .split("@")[0]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

    return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
  };
  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (values) => {
    setError("");
    setLoading(true);

    try {
      const payload = {
        email: values.email?.trim(),
        password: values.password,
        full_name: values.full_name?.trim(),
        username: generateUsername(values.email?.trim()),
        phone: values.phone?.trim() || null,

        church_name: values.church_name?.trim(),
        church_type: values.church_type || "GIAO_XU",
        address: values.address?.trim() || null,
        district: values.district?.trim() || null,
        ward: values.ward?.trim() || null,
        pastor_name: values.pastor_name?.trim() || null,
      };

      const response = await axios.post("/auth/register", payload);

      const data = response.data;

      if (!data?.success) {
        throw new Error(data?.message || "Đăng ký thất bại");
      }

      // ======================================================
      // SAVE TOKEN
      // ======================================================

      localStorage.setItem("token", data.token);

      // ======================================================
      // SAVE ADMIN
      // ======================================================

      localStorage.setItem("admin", JSON.stringify(data.admin));

      // ======================================================
      // COMPAT USER
      // ======================================================

      localStorage.setItem("user", JSON.stringify(data.admin));

      // ======================================================
      // SAVE CHURCH
      // ======================================================

      localStorage.setItem("church", JSON.stringify(data.church));

      message.success("Đăng ký FaithEdu thành công!");

      navigate("/", {
        replace: true,
      });
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể đăng ký FaithEdu";

      setError(apiMessage);

      message.error(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // MODAL CONTENT
  // ==========================================================

  const renderTermsContent = () => (
    <div className="legal-content">
      <div className="legal-intro">
        <FileTextOutlined />
        <div>
          <strong>Điều khoản sử dụng FaithEdu</strong>
          <span>Vui lòng đọc kỹ các điều khoản trước khi tạo tài khoản.</span>
        </div>
      </div>

      <section>
        <h3>1. Chấp nhận điều khoản</h3>

        <p>
          Khi đăng ký và sử dụng FaithEdu, bạn xác nhận đã đọc, hiểu và đồng ý
          tuân thủ các điều khoản sử dụng được quy định trên nền tảng.
        </p>
      </section>

      <section>
        <h3>2. Tài khoản người dùng</h3>

        <p>
          Người dùng có trách nhiệm cung cấp thông tin chính xác khi đăng ký tài
          khoản và bảo mật thông tin đăng nhập của mình.
        </p>

        <p>
          Tài khoản không được sử dụng cho các hoạt động vi phạm pháp luật, gây
          ảnh hưởng đến cộng đồng hoặc làm gián đoạn hoạt động của FaithEdu.
        </p>
      </section>

      <section>
        <h3>3. Thông tin giáo xứ</h3>

        <p>
          Các thông tin liên quan đến giáo xứ, giáo họ, giáo lý viên và hoạt
          động giáo lý cần được cung cấp chính xác và chỉ sử dụng cho mục đích
          quản lý, giáo dục đức tin trên FaithEdu.
        </p>
      </section>

      <section>
        <h3>4. Sử dụng hệ thống</h3>

        <p>
          FaithEdu cung cấp các công cụ hỗ trợ quản lý giáo lý, lớp học, học
          viên, bài học, trò chơi và các hoạt động giáo dục đức tin.
        </p>

        <p>
          Người dùng không được cố ý khai thác lỗi hệ thống, truy cập trái phép
          hoặc thực hiện các hành vi gây ảnh hưởng đến tính ổn định của nền
          tảng.
        </p>
      </section>

      <section>
        <h3>5. Thay đổi điều khoản</h3>

        <p>
          FaithEdu có thể cập nhật hoặc thay đổi các điều khoản sử dụng khi cần
          thiết. Những thay đổi quan trọng sẽ được thông báo phù hợp trên nền
          tảng.
        </p>
      </section>

      <div className="legal-footer-note">
        <HeartFilled />
        <span>
          Cùng nhau xây dựng một môi trường giáo dục đức tin an toàn, tích cực
          và yêu thương.
        </span>
      </div>
    </div>
  );

  const renderPrivacyContent = () => (
    <div className="legal-content">
      <div className="legal-intro privacy-intro">
        <SafetyCertificateFilled />
        <div>
          <strong>Chính sách bảo mật FaithEdu</strong>
          <span>FaithEdu tôn trọng và bảo vệ thông tin của người sử dụng.</span>
        </div>
      </div>

      <section>
        <h3>1. Thông tin được thu thập</h3>

        <p>
          Khi đăng ký tài khoản, FaithEdu có thể thu thập các thông tin như họ
          tên, tên đăng nhập, email, số điện thoại và thông tin liên quan đến
          giáo xứ.
        </p>
      </section>

      <section>
        <h3>2. Mục đích sử dụng</h3>

        <p>
          Thông tin được sử dụng nhằm tạo tài khoản, quản lý giáo xứ, hỗ trợ
          hoạt động giáo lý và cung cấp các chức năng của hệ thống FaithEdu.
        </p>
      </section>

      <section>
        <h3>3. Bảo vệ thông tin</h3>

        <p>
          FaithEdu áp dụng các biện pháp phù hợp nhằm hạn chế việc truy cập, sử
          dụng hoặc tiết lộ thông tin trái phép.
        </p>
      </section>

      <section>
        <h3>4. Không chia sẻ tùy tiện</h3>

        <p>
          Thông tin người dùng và thông tin giáo xứ không được tùy tiện cung cấp
          cho bên thứ ba ngoài phạm vi cần thiết để vận hành và hỗ trợ dịch vụ,
          trừ trường hợp pháp luật yêu cầu.
        </p>
      </section>

      <section>
        <h3>5. Quyền của người dùng</h3>

        <p>
          Người dùng có quyền yêu cầu kiểm tra, cập nhật hoặc xử lý thông tin
          tài khoản của mình theo các quy định và khả năng hỗ trợ của hệ thống.
        </p>
      </section>

      <div className="legal-footer-note privacy-note">
        <SafetyCertificateFilled />
        <span>
          FaithEdu cam kết hướng tới một môi trường số an toàn và đáng tin cậy
          cho cộng đoàn giáo lý.
        </span>
      </div>
    </div>
  );

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
            margin: 0;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Roboto,
              sans-serif;
            color: ${colors.text};
            background: #F4F9FD;
            -webkit-font-smoothing: antialiased;
          }

          button,
          input,
          textarea,
          select {
            font-family: inherit;
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          /* ====================================================
             PAGE
          ==================================================== */

          .register-page {
            width: 100%;
            height: 100vh;
            min-height: 100vh;
            overflow: hidden;
            position: relative;

            background:
              radial-gradient(
                circle at 10% 20%,
                rgba(65, 155, 220, 0.12),
                transparent 28%
              ),
              radial-gradient(
                circle at 90% 85%,
                rgba(242, 201, 76, 0.11),
                transparent 25%
              ),
              linear-gradient(
                135deg,
                #EFF8FF 0%,
                #F8FBFF 45%,
                #FFFFFF 100%
              );
          }

          /* ====================================================
             TOP BAR
          ==================================================== */

          .register-topbar {
            width: 100%;
            height: 72px;
            min-height: 72px;

            padding: 8px 5%;

            display: flex;
            align-items: center;
            justify-content: space-between;

            position: relative;
            z-index: 20;
          }

          .register-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
          }

          .register-logo-image {
            width: 52px;
            height: 52px;
            flex: 0 0 52px;

            object-fit: contain;
            border-radius: 15px;

            filter:
              drop-shadow(
                0 6px 14px
                rgba(23,105,170,0.18)
              );
          }

          .register-logo-name {
            margin: 0;

            font-family:
              Georgia,
              "Times New Roman",
              serif;

            font-size: 30px;
            line-height: 1;
            font-weight: 800;

            color: ${colors.primaryDark};
            letter-spacing: -0.7px;
          }

          .register-logo-name span {
            color: ${colors.gold};
          }

          .register-logo-slogan {
            margin-top: 5px;

            color: ${colors.textLight};
            font-size: 10px;
            font-weight: 600;
          }

          .register-login {
            display: flex;
            align-items: center;
            gap: 13px;

            color: ${colors.textLight};
            font-size: 13px;
            font-weight: 500;
          }

          .register-login-btn {
            height: 40px !important;

            padding: 0 19px !important;

            border-radius: 999px !important;

            border:
              1.5px solid
              ${colors.primary} !important;

            color: ${colors.primary} !important;

            background:
              rgba(255,255,255,0.8) !important;

            font-weight: 700 !important;

            display: flex !important;
            align-items: center;
            gap: 8px;
          }

          .register-login-btn:hover {
            background: ${colors.primary} !important;
            color: white !important;
          }

          /* ====================================================
             MAIN
          ==================================================== */

          .register-main {
            width: 100%;

            height:
              calc(100vh - 72px - 42px);

            padding:
              8px 4% 12px;

            display: flex;
            align-items: stretch;
          }

          .register-container {
            width: 100%;
            max-width: 1450px;

            height: 100%;
            min-height: 0;

            margin: 0 auto;

            position: relative;

            display: grid;

            grid-template-columns:
              34% 66%;

            overflow: hidden;

            border-radius: 28px;

            background:
              rgba(255,255,255,0.82);

            border:
              1px solid
              rgba(255,255,255,0.95);

            box-shadow:
              0 20px 60px
              rgba(20,75,115,0.11);

            backdrop-filter:
              blur(18px);
          }

          /* ====================================================
             LEFT VISUAL
          ==================================================== */

          .register-visual {
            position: relative;

            width: 100%;
            height: 100%;
            min-height: 0;

            overflow: hidden;

            background:
              linear-gradient(
                145deg,
                #CFEAFF,
                #EAF6FF
              );
          }

          .register-visual-image {
            position: absolute;
            inset: 0;

            width: 100%;
            height: 100%;

            object-fit: cover;
            object-position: center;
          }

          .register-visual-overlay {
            position: absolute;
            inset: 0;

            background:
              linear-gradient(
                180deg,
                rgba(17,76,125,0.02) 0%,
                rgba(17,76,125,0.05) 38%,
                rgba(8,48,84,0.62) 100%
              );
          }

          .register-visual-content {
            position: absolute;
            z-index: 4;

            left: 38px;
            right: 38px;
            bottom: 38px;

            color: white;
          }

          .visual-badge {
            display: inline-flex;
            align-items: center;
            gap: 7px;

            padding:
              7px 13px;

            border-radius: 999px;

            background:
              rgba(255,255,255,0.18);

            border:
              1px solid
              rgba(255,255,255,0.35);

            backdrop-filter:
              blur(10px);

            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.2px;
          }

          .register-visual-title {
            margin: 15px 0 8px;

            font-family:
              Georgia,
              "Times New Roman",
              serif;

            font-size:
              clamp(30px, 3vw, 45px);

            line-height: 1.12;
            font-style: italic;
            font-weight: 700;

            text-shadow:
              0 4px 18px
              rgba(0,0,0,0.16);
          }

          .register-visual-description {
            margin: 0;

            max-width: 360px;

            font-size: 13px;
            line-height: 1.7;

            color:
              rgba(255,255,255,0.92);
          }

          .visual-features {
            margin-top: 20px;

            display: flex;
            flex-wrap: wrap;
            gap: 7px;
          }

          .visual-feature {
            display: flex;
            align-items: center;
            gap: 7px;

            padding:
              7px 10px;

            border-radius: 12px;

            background:
              rgba(255,255,255,0.16);

            border:
              1px solid
              rgba(255,255,255,0.25);

            backdrop-filter:
              blur(8px);

            font-size: 10px;
            font-weight: 700;
          }

          /* ====================================================
             RIGHT FORM
          ==================================================== */

          .register-form-area {
            height: 100%;
            min-height: 0;

            padding:
              22px 38px 18px;

            background:
              rgba(255,255,255,0.95);

            overflow-y: auto;
            overflow-x: hidden;

            scrollbar-width: thin;
            scrollbar-color:
              #C7D9E8 transparent;
          }

          .register-form-area::-webkit-scrollbar {
            width: 5px;
          }

          .register-form-area::-webkit-scrollbar-track {
            background: transparent;
          }

          .register-form-area::-webkit-scrollbar-thumb {
            background: #C7D9E8;
            border-radius: 999px;
          }

          /* ====================================================
             HEADING
          ==================================================== */

          .register-heading {
            text-align: center;
            margin-bottom: 19px;
          }

          .register-heading-icon {
            width: 48px;
            height: 48px;

            margin:
              0 auto 9px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 15px;

            background:
              ${colors.blueLight};

            color:
              ${colors.primary};

            font-size: 21px;

            box-shadow:
              0 8px 20px
              rgba(23,105,170,0.08);
          }

          .register-heading h1 {
            margin: 0 !important;

            color:
              ${colors.primaryDark};

            font-family:
              Georgia,
              "Times New Roman",
              serif;

            font-size:
              clamp(27px, 2.5vw, 36px) !important;

            line-height: 1.15 !important;
            font-weight: 800 !important;
          }

          .register-heading p {
            margin:
              6px auto 0;

            max-width: 620px;

            color:
              ${colors.textLight};

            font-size: 12px;
            line-height: 1.5;
          }

          .register-error {
            margin-bottom: 15px;
            border-radius: 13px !important;
          }

          /* ====================================================
             FORM COLUMNS
          ==================================================== */

          .register-form-columns {
            display: grid;

            grid-template-columns:
              1fr 1fr;

            gap: 16px;
          }

          .form-box {
            border-radius: 20px;

            padding:
              18px 18px 9px;

            border: 1px solid;

            min-width: 0;
          }

          .account-box {
            background:
              linear-gradient(
                145deg,
                #F1F8FF,
                #F8FBFF
              );

            border-color:
              #DCECF9;
          }

          .church-box {
            background:
              linear-gradient(
                145deg,
                #FFF9EA,
                #FFFDF7
              );

            border-color:
              #F1E6C7;
          }

          /* ====================================================
             SECTION HEADER
          ==================================================== */

          .section-heading {
            display: flex;
            align-items: center;
            gap: 10px;

            padding-bottom: 12px;
            margin-bottom: 6px;

            border-bottom:
              1px solid
              rgba(23,105,170,0.09);
          }

          .church-box .section-heading {
            border-bottom-color:
              rgba(166,125,20,0.1);
          }

          .section-icon {
            width: 38px;
            height: 38px;

            flex: 0 0 38px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 12px;

            background:
              rgba(255,255,255,0.85);

            color:
              ${colors.primary};

            font-size: 17px;

            box-shadow:
              0 5px 15px
              rgba(23,105,170,0.07);
          }

          .church-box .section-icon {
            color:
              ${colors.goldDark};
          }

          .section-title {
            color:
              ${colors.primaryDark};

            font-size: 14px;
            font-weight: 800;
          }

          .church-box .section-title {
            color: #90650D;
          }

          .section-description {
            margin-top: 2px;

            color:
              ${colors.textLight};

            font-size: 9.5px;
            line-height: 1.4;
          }

          /* ====================================================
             FORM
          ==================================================== */

          .register-form {
            width: 100%;
          }

          .register-form .ant-form-item {
            margin-bottom: 9px;
          }

          .register-form .ant-form-item-label {
            padding:
              0 0 4px !important;
          }

          .register-form .ant-form-item-label > label {
            color:
              ${colors.primaryDark};

            font-size: 10.5px;
            font-weight: 700;
          }

          .church-box .ant-form-item-label > label {
            color: #72510E;
          }

          .register-form .ant-input,
          .register-form .ant-input-affix-wrapper,
          .register-form .ant-select-selector {
            border-radius:
              10px !important;

            border-color:
              ${colors.border} !important;

            background:
              rgba(255,255,255,0.9) !important;

            box-shadow:
              none !important;

            font-size: 11.5px;
          }

          .register-form .ant-input {
            height: 38px;
          }

          .register-form .ant-input-affix-wrapper {
            min-height: 38px;
          }

          .register-form .ant-input-prefix {
            color: #8AA1B7;
            margin-right: 6px;
          }

          .register-form .ant-input-password-icon {
            color: #91A2B3;
          }

          .register-form .ant-select {
            width: 100%;
          }

          .register-form .ant-select-selector {
            min-height: 38px !important;
            height: 38px !important;

            display: flex !important;
            align-items: center;
          }

          .register-form .ant-select-selection-item {
            font-size: 11.5px;
          }

          .register-form .ant-input:hover,
          .register-form .ant-input-affix-wrapper:hover,
          .register-form .ant-select-selector:hover {
            border-color:
              #8AB9DD !important;
          }

          .register-form .ant-input:focus,
          .register-form .ant-input-affix-wrapper-focused,
          .register-form .ant-select-focused .ant-select-selector {
            border-color:
              ${colors.primary} !important;

            box-shadow:
              0 0 0 3px
              rgba(23,105,170,0.08) !important;
          }

          /* ====================================================
             SECURITY
          ==================================================== */

          .security-box {
            margin-top: 3px;

            padding:
              10px 11px;

            border-radius: 11px;

            background:
              rgba(255,255,255,0.72);

            border:
              1px solid
              rgba(166,125,20,0.12);

            display: flex;
            gap: 8px;
            align-items: center;
          }

          .security-icon {
            color:
              ${colors.goldDark};

            font-size: 17px;
            flex: 0 0 auto;
          }

          .security-text {
            font-size: 9px;
            line-height: 1.45;
            color:
              ${colors.textLight};
          }

          /* ====================================================
             TRIAL BOX
          ==================================================== */

          .trial-box {
            margin-top: 14px;

            padding:
              11px 13px;

            border-radius: 14px;

            display: flex;
            align-items: center;
            gap: 10px;

            background:
              linear-gradient(
                135deg,
                #EFF9FF,
                #F7FCFF
              );

            border:
              1px solid
              #D9EDF9;
          }

          .trial-icon {
            width: 32px;
            height: 32px;

            flex: 0 0 32px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 9px;

            background: #DDF3FF;
            color: #159447;

            font-size: 16px;
          }

          .trial-title {
            color:
              ${colors.primaryDark};

            font-size: 10.5px;
            font-weight: 800;
          }

          .trial-description {
            margin-top: 2px;

            color:
              ${colors.textLight};

            font-size: 9px;
            line-height: 1.4;
          }

          /* ====================================================
             TERMS
          ==================================================== */

          .terms-row {
            margin-top: 11px;

            display: flex;
            align-items: flex-start;
            justify-content: center;

            gap: 7px;

            color:
              ${colors.textLight};

            font-size: 10px;
            line-height: 1.5;

            text-align: left;
          }

          .terms-row .ant-checkbox {
            margin-top: 1px;
          }

          .terms-row a {
            color:
              ${colors.primary};

            font-weight: 700;

            cursor: pointer;
          }

          .terms-row a:hover {
            text-decoration: underline;
          }

          /* ====================================================
             SUBMIT
          ==================================================== */

          .register-submit {
            margin-top: 13px;

            height: 47px !important;

            border-radius:
              999px !important;

            border: none !important;

            background:
              linear-gradient(
                135deg,
                #1769AA 0%,
                #287ED0 100%
              ) !important;

            box-shadow:
              0 10px 25px
              rgba(23,105,170,0.25) !important;

            font-size: 13px !important;
            font-weight: 800 !important;

            transition:
              all 0.25s ease !important;
          }

          .register-submit:not(:disabled):hover {
            transform:
              translateY(-2px);

            box-shadow:
              0 14px 30px
              rgba(23,105,170,0.3) !important;
          }

          .register-submit:disabled {
            opacity: 0.55;
          }

          /* ====================================================
             LOGIN BOTTOM
          ==================================================== */

          .login-bottom {
            margin-top: 8px;

            display: flex;
            justify-content: center;
            align-items: center;

            gap: 4px;

            color:
              ${colors.textLight};

            font-size: 10.5px;
          }

          .login-bottom button {
            padding:
              0 3px !important;

            font-size: 10.5px !important;
            font-weight: 800 !important;

            color:
              ${colors.primary} !important;
          }

          /* ====================================================
             FOOTER
          ==================================================== */

          .register-footer {
            height: 42px;
            min-height: 42px;

            display: flex;
            align-items: center;
            justify-content: center;

            gap: 8px;

            padding: 0 20px;

            color: #8291A2;

            font-size: 10px;

            position: relative;
            z-index: 5;
          }

          .footer-heart {
            color:
              ${colors.gold};
          }

          /* ====================================================
             DECORATIVE BLOBS
          ==================================================== */

          .decorative-blob {
            position: fixed;

            z-index: 0;

            border-radius: 50%;

            pointer-events: none;

            filter: blur(70px);
          }

          .blob-one {
            width: 280px;
            height: 280px;

            left: -100px;
            top: 200px;

            background:
              rgba(74,163,225,0.13);
          }

          .blob-two {
            width: 300px;
            height: 300px;

            right: -120px;
            bottom: -100px;

            background:
              rgba(242,201,76,0.12);
          }

          /* ====================================================
             LEGAL MODALS
          ==================================================== */

          .legal-modal .ant-modal-content {
            border-radius: 24px;
            overflow: hidden;

            padding: 0;

            box-shadow:
              0 30px 80px
              rgba(15, 61, 96, 0.22);
          }

          .legal-modal .ant-modal-header {
            margin: 0;
            padding: 0;
            border: none;
          }

          .legal-modal .ant-modal-body {
            padding: 0;
          }

          .legal-header {
            position: relative;

            padding:
              24px 28px 20px;

            background:
              linear-gradient(
                135deg,
                #EFF8FF,
                #FFFFFF
              );

            border-bottom:
              1px solid
              #E1EDF7;
          }

          .privacy-header {
            background:
              linear-gradient(
                135deg,
                #FFF9EA,
                #FFFFFF
              );
          }

          .legal-header-icon {
            width: 46px;
            height: 46px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin-bottom: 11px;

            border-radius: 14px;

            background:
              #E2F1FF;

            color:
              ${colors.primary};

            font-size: 21px;
          }

          .privacy-header .legal-header-icon {
            background: #FFF0C7;
            color: ${colors.goldDark};
          }

          .legal-header h2 {
            margin: 0;

            color:
              ${colors.primaryDark};

            font-family:
              Georgia,
              "Times New Roman",
              serif;

            font-size: 24px;
            font-weight: 800;
          }

          .legal-header p {
            margin:
              5px 0 0;

            color:
              ${colors.textLight};

            font-size: 12px;
            line-height: 1.5;
          }

          .legal-content {
            max-height: 58vh;

            overflow-y: auto;

            padding:
              22px 28px 26px;

            scrollbar-width: thin;
            scrollbar-color:
              #C7D9E8 transparent;
          }

          .legal-content::-webkit-scrollbar {
            width: 5px;
          }

          .legal-content::-webkit-scrollbar-track {
            background: transparent;
          }

          .legal-content::-webkit-scrollbar-thumb {
            background: #C7D9E8;
            border-radius: 999px;
          }

          .legal-intro {
            display: flex;
            align-items: center;
            gap: 12px;

            padding:
              13px 15px;

            margin-bottom: 20px;

            border-radius: 14px;

            background:
              #F4FAFF;

            border:
              1px solid
              #DDEEF9;
          }

          .privacy-intro {
            background:
              #FFFBF1;

            border-color:
              #F3E8C9;
          }

          .legal-intro > svg {
            color:
              ${colors.primary};

            font-size: 22px;
          }

          .privacy-intro > svg {
            color:
              ${colors.goldDark};
          }

          .legal-intro div {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .legal-intro strong {
            color:
              ${colors.primaryDark};

            font-size: 12px;
          }

          .legal-intro span {
            color:
              ${colors.textLight};

            font-size: 10px;
          }

          .legal-content section {
            margin-bottom: 18px;
          }

          .legal-content section h3 {
            margin:
              0 0 7px;

            color:
              ${colors.primaryDark};

            font-size: 13px;
            font-weight: 800;
          }

          .legal-content section p {
            margin:
              0 0 7px;

            color:
              ${colors.text};

            font-size: 11.5px;
            line-height: 1.7;
          }

          .legal-footer-note {
            display: flex;
            align-items: flex-start;
            gap: 9px;

            padding:
              12px 14px;

            margin-top: 20px;

            border-radius: 13px;

            background:
              linear-gradient(
                135deg,
                #F3FAFF,
                #F9FCFF
              );

            border:
              1px solid
              #DFEEF9;

            color:
              ${colors.primary};
          }

          .legal-footer-note svg {
            flex: 0 0 auto;
            margin-top: 2px;
          }

          .legal-footer-note span {
            color:
              ${colors.textLight};

            font-size: 10.5px;
            line-height: 1.5;
          }

          .privacy-note {
            background:
              linear-gradient(
                135deg,
                #FFFBF0,
                #FFFDF8
              );

            border-color:
              #F0E4C3;

            color:
              ${colors.goldDark};
          }

          /* ====================================================
             TABLET
          ==================================================== */

          @media (max-width: 1200px) {
            .register-container {
              grid-template-columns:
                31% 69%;
            }

            .register-form-area {
              padding:
                22px 25px 17px;
            }

            .register-visual-content {
              left: 26px;
              right: 26px;
            }

            .register-visual-title {
              font-size: 35px;
            }
          }

          /* ====================================================
             TABLET / SMALL LAPTOP
          ==================================================== */

          @media (max-width: 1000px) {
            .register-page {
              height: auto;
              min-height: 100vh;
              overflow: visible;
            }

            .register-main {
              height: auto;
              min-height: 0;

              padding:
                10px 20px 25px;
            }

            .register-container {
              height: auto;
              min-height: 0;

              grid-template-columns:
                1fr;

              overflow: hidden;
            }

            .register-visual {
              height: 300px;
              min-height: 300px;
            }

            .register-visual-content {
              left: 32px;
              right: 32px;
              bottom: 28px;
            }

            .register-form-area {
              height: auto;
              overflow: visible;

              padding:
                32px 28px 28px;
            }

            .register-form-columns {
              grid-template-columns:
                1fr 1fr;
            }

            .register-footer {
              height: auto;
              min-height: 42px;
              padding:
                10px 20px 15px;
            }

            .blob-one,
            .blob-two {
              opacity: 0.5;
            }
          }

          /* ====================================================
             MOBILE
          ==================================================== */

          @media (max-width: 700px) {
            .register-topbar {
              height: 64px;
              min-height: 64px;

              padding:
                8px 15px;
            }

            .register-logo {
              gap: 9px;
            }

            .register-logo-image {
              width: 43px;
              height: 43px;
              flex-basis: 43px;

              border-radius: 12px;
            }

            .register-logo-name {
              font-size: 25px;
            }

            .register-logo-slogan {
              display: none;
            }

            .register-login {
              gap: 0;
            }

            .register-login > span {
              display: none;
            }

            .register-login-btn {
              height: 36px !important;

              padding:
                0 13px !important;

              font-size: 11px !important;
            }

            .register-main {
              padding:
                8px 10px 20px;
            }

            .register-container {
              border-radius: 22px;
            }

            .register-visual {
              height: 235px;
              min-height: 235px;
            }

            .register-visual-content {
              left: 18px;
              right: 18px;
              bottom: 18px;
            }

            .visual-badge {
              padding:
                6px 10px;

              font-size: 8.5px;
            }

            .register-visual-title {
              margin:
                10px 0 0;

              font-size: 28px;
              line-height: 1.08;
            }

            .register-visual-description {
              display: none;
            }

            .visual-features {
              margin-top: 10px;
              gap: 5px;
            }

            .visual-feature {
              padding:
                5px 7px;

              border-radius: 9px;

              font-size: 8px;
            }

            .register-form-area {
              padding:
                25px 13px 22px;
            }

            .register-heading {
              margin-bottom: 18px;
            }

            .register-heading-icon {
              width: 45px;
              height: 45px;
            }

            .register-heading h1 {
              font-size: 25px !important;
            }

            .register-heading p {
              font-size: 10.5px;
              max-width: 300px;
            }

            .register-form-columns {
              grid-template-columns:
                1fr;

              gap: 12px;
            }

            .form-box {
              padding:
                16px 13px 8px;

              border-radius: 18px;
            }

            .section-heading {
              padding-bottom: 11px;
            }

            .section-icon {
              width: 35px;
              height: 35px;
              flex-basis: 35px;
              border-radius: 10px;
              font-size: 16px;
            }

            .section-title {
              font-size: 13px;
            }

            .section-description {
              font-size: 9px;
            }

            .register-form .ant-form-item {
              margin-bottom: 9px;
            }

            .register-form .ant-form-item-label > label {
              font-size: 10px;
            }

            .register-form .ant-input,
            .register-form .ant-input-affix-wrapper,
            .register-form .ant-select-selector {
              font-size: 11px;
            }

            .register-form .ant-input {
              height: 39px;
            }

            .register-form .ant-input-affix-wrapper {
              min-height: 39px;
            }

            .register-form .ant-select-selector {
              height: 39px !important;
              min-height: 39px !important;
            }

            .trial-box {
              align-items: flex-start;
              padding:
                10px 11px;
            }

            .trial-title {
              font-size: 10px;
            }

            .trial-description {
              font-size: 8.5px;
            }

            .terms-row {
              font-size: 9.5px;
            }

            .register-submit {
              height: 46px !important;
              font-size: 12px !important;
            }

            .login-bottom {
              font-size: 10px;
            }

            .register-footer {
              flex-direction: column;
              gap: 2px;

              padding:
                8px 15px 15px;

              font-size: 9px;
            }

            .footer-dot {
              display: none;
            }

            /* MOBILE MODAL */

            .legal-modal {
              width: calc(100vw - 20px) !important;
              max-width: calc(100vw - 20px) !important;
            }

            .legal-modal .ant-modal-content {
              border-radius: 20px;
            }

            .legal-header {
              padding:
                20px 18px 17px;
            }

            .legal-header-icon {
              width: 40px;
              height: 40px;

              border-radius: 12px;

              font-size: 18px;
            }

            .legal-header h2 {
              font-size: 20px;
            }

            .legal-header p {
              font-size: 10px;
            }

            .legal-content {
              max-height: 60vh;

              padding:
                17px 18px 20px;
            }

            .legal-intro {
              padding:
                11px 12px;

              margin-bottom: 16px;
            }

            .legal-intro strong {
              font-size: 10.5px;
            }

            .legal-intro span {
              font-size: 9px;
            }

            .legal-content section {
              margin-bottom: 15px;
            }

            .legal-content section h3 {
              font-size: 11.5px;
            }

            .legal-content section p {
              font-size: 10.5px;
              line-height: 1.65;
            }

            .legal-footer-note span {
              font-size: 9.5px;
            }
          }

          /* ====================================================
             VERY SMALL PHONE
          ==================================================== */

          @media (max-width: 400px) {
            .register-logo-name {
              font-size: 22px;
            }

            .register-login-btn {
              padding:
                0 10px !important;
            }

            .register-visual {
              height: 215px;
              min-height: 215px;
            }

            .register-visual-title {
              font-size: 25px;
            }

            .visual-feature:nth-child(3) {
              display: none;
            }

            .register-form-area {
              padding:
                22px 10px 20px;
            }

            .register-heading h1 {
              font-size: 23px !important;
            }
          }
        `}
      </style>

      {/* ======================================================
          PAGE WRAPPER
      ====================================================== */}

      <div className="register-page">
        {/* ======================================================
            DECORATIONS
        ====================================================== */}

        <motion.div
          className="decorative-blob blob-one"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="decorative-blob blob-two"
          animate={{
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* ======================================================
            TOP BAR
        ====================================================== */}

        <motion.header
          className="register-topbar"
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <div className="register-logo">
            <motion.img
              src={logoWeb}
              alt="FaithEdu"
              className="register-logo-image"
              whileHover={{
                scale: 1.06,
                rotate: 3,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
              }}
            />

            <div>
              <div className="register-logo-name">
                Faith<span>Edu</span>
              </div>

              <div className="register-logo-slogan">
                Quản lý Giáo Lý · Kết nối Đức Tin
              </div>
            </div>
          </div>

          <div className="register-login">
            <span>Đã có tài khoản?</span>

            <Button
              type="text"
              className="register-login-btn"
              onClick={() => navigate("/")}
            >
              Đăng nhập
              <ArrowRightOutlined />
            </Button>
          </div>
        </motion.header>

        {/* ======================================================
            MAIN
        ====================================================== */}

        <main className="register-main">
          <motion.div
            className="register-container"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* ==================================================
                LEFT VISUAL
            ================================================== */}

            <motion.section className="register-visual" variants={fadeLeft}>
              {/*
                TODO: IMAGE
                ẢNH CHÚA GIÊSU + CÁC BẠN TRẺ

                Hiện đang dùng:
                register-background.jpg
              */}

              <img
                src={registerHero}
                alt="FaithEdu - Cùng nhau lớn lên trong Đức Tin"
                className="register-visual-image"
              />

              <div className="register-visual-overlay" />

              <div className="register-visual-content">
                <div className="visual-badge">
                  <HeartFilled />
                  FAITHEDU
                </div>

                <h2 className="register-visual-title">
                  Cùng nhau
                  <br />
                  lớn lên trong
                  <br />
                  Đức Tin
                </h2>

                <p className="register-visual-description">
                  Nền tảng giúp giáo xứ quản lý giáo lý, kết nối cộng đoàn và
                  đồng hành cùng thế hệ trẻ trong hành trình đức tin.
                </p>

                <div className="visual-features">
                  <div className="visual-feature">
                    <BookFilled />
                    Học giáo lý
                  </div>

                  <div className="visual-feature">
                    <TeamOutlined />
                    Kết nối cộng đoàn
                  </div>

                  <div className="visual-feature">
                    <HeartFilled />
                    Sống yêu thương
                  </div>
                </div>
              </div>
            </motion.section>

            {/* ==================================================
                RIGHT FORM
            ================================================== */}

            <motion.section className="register-form-area" variants={fadeRight}>
              <div className="register-heading">
                <motion.div
                  className="register-heading-icon"
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <UserOutlined />
                </motion.div>

                <Title level={1}>Tạo tài khoản FaithEdu</Title>

                <p>
                  Bắt đầu hành trình giáo dục đức tin cùng cộng đoàn của bạn
                </p>
              </div>

              {/* ERROR */}

              {error && (
                <Alert
                  type="error"
                  showIcon
                  message={error}
                  className="register-error"
                />
              )}

              {/* FORM */}

              <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={handleSubmit}
                autoComplete="off"
                className="register-form"
              >
                <div className="register-form-columns">
                  {/* =================================================
                      USER INFORMATION
                  ================================================= */}

                  <motion.div
                    className="form-box account-box"
                    variants={fadeUp}
                  >
                    <div className="section-heading">
                      <div className="section-icon">
                        <UserOutlined />
                      </div>

                      <div>
                        <div className="section-title">
                          Thông tin người dùng
                        </div>

                        <div className="section-description">
                          Tạo tài khoản để sử dụng hệ thống
                        </div>
                      </div>
                    </div>

                    <Row gutter={[12, 0]}>
                      <Col span={24}>
                        <Form.Item
                          label="Họ và tên"
                          name="full_name"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập họ và tên",
                            },
                          ]}
                        >
                          <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập họ và tên của bạn"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item label="Username" name="username">
                          <Input
                            prefix={<UserOutlined />}
                            disabled
                            placeholder="Hệ thống sẽ tự động tạo tên đăng nhập dựa trên họ và tên của bạn"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item
                          label="Email"
                          name="email"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập email",
                            },
                            {
                              type: "email",
                              message: "Email không hợp lệ",
                            },
                          ]}
                        >
                          <Input
                            prefix={<MailOutlined />}
                            placeholder="Nhập địa chỉ email"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item label="Số điện thoại" name="phone">
                          <Input
                            prefix={<PhoneOutlined />}
                            placeholder="Nhập số điện thoại (nếu có)"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item
                          label="Mật khẩu"
                          name="password"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập mật khẩu",
                            },
                            {
                              min: 6,
                              message: "Mật khẩu tối thiểu 6 ký tự",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item
                          label="Xác nhận mật khẩu"
                          name="confirm_password"
                          dependencies={["password"]}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng xác nhận mật khẩu",
                            },

                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (
                                  !value ||
                                  getFieldValue("password") === value
                                ) {
                                  return Promise.resolve();
                                }

                                return Promise.reject(
                                  new Error("Mật khẩu xác nhận không khớp"),
                                );
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập lại mật khẩu"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </motion.div>

                  {/* =================================================
                      CHURCH INFORMATION
                  ================================================= */}

                  <motion.div className="form-box church-box" variants={fadeUp}>
                    <div className="section-heading">
                      <div className="section-icon">
                        <BankOutlined />
                      </div>

                      <div>
                        <div className="section-title">Thông tin giáo xứ</div>

                        <div className="section-description">
                          Cung cấp thông tin giáo xứ của bạn
                        </div>
                      </div>
                    </div>

                    <Row gutter={[12, 0]}>
                      <Col span={24}>
                        <Form.Item
                          label="Tên giáo xứ"
                          name="church_name"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tên giáo xứ",
                            },
                          ]}
                        >
                          <Input
                            prefix={<BankOutlined />}
                            placeholder="Nhập tên giáo xứ"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item
                          label="Loại hình"
                          name="church_type"
                          initialValue="GIAO_XU"
                        >
                          <Select
                            options={[
                              {
                                value: "GIAO_XU",
                                label: "Giáo xứ",
                              },
                              {
                                value: "GIAO_HO",
                                label: "Giáo họ",
                              },
                            ]}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item label="Địa chỉ" name="address">
                          <Input
                            prefix={<EnvironmentOutlined />}
                            placeholder="Nhập địa chỉ"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item label="Quận / Huyện" name="district">
                          <Input
                            prefix={<EnvironmentOutlined />}
                            placeholder="Quận / huyện"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item label="Phường / Xã" name="ward">
                          <Input
                            prefix={<EnvironmentOutlined />}
                            placeholder="Phường / xã"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item label="Tên cha xứ" name="pastor_name">
                          <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập tên cha xứ (nếu có)"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <div className="security-box">
                          <SafetyCertificateFilled className="security-icon" />

                          <span className="security-text">
                            Thông tin giáo xứ được bảo mật và chỉ sử dụng cho
                            mục đích quản lý trên FaithEdu.
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </motion.div>
                </div>

                {/* =================================================
                    TRIAL
                ================================================= */}

                <motion.div className="trial-box" variants={fadeUp}>
                  <div className="trial-icon">
                    <CheckCircleFilled />
                  </div>

                  <div>
                    <div className="trial-title">
                      Bắt đầu hành trình cùng FaithEdu
                    </div>

                    <div className="trial-description">
                      Tạo tài khoản miễn phí và bắt đầu quản lý giáo lý cho cộng
                      đoàn của bạn.
                    </div>
                  </div>
                </motion.div>

                {/* =================================================
                    TERMS
                ================================================= */}

                <motion.div className="terms-row" variants={fadeUp}>
                  <Checkbox
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />

                  <span>
                    Tôi đồng ý với{" "}
                    <a href="#terms" onClick={openTermsModal}>
                      Điều khoản sử dụng
                    </a>{" "}
                    và{" "}
                    <a href="#privacy" onClick={openPrivacyModal}>
                      Chính sách bảo mật
                    </a>{" "}
                    của FaithEdu.
                  </span>
                </motion.div>

                {/* =================================================
                    SUBMIT
                ================================================= */}

                <motion.div
                  variants={fadeUp}
                  whileHover={{
                    scale: 1.008,
                  }}
                  whileTap={{
                    scale: 0.985,
                  }}
                >
                  <Button
                    htmlType="submit"
                    type="primary"
                    block
                    loading={loading}
                    disabled={!accepted}
                    className="register-submit"
                    icon={!loading && <UserOutlined />}
                  >
                    {loading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}
                  </Button>
                </motion.div>

                {/* =================================================
                    LOGIN
                ================================================= */}

                <div className="login-bottom">
                  <span>Đã có tài khoản?</span>

                  <Button type="link" onClick={() => navigate("/")}>
                    Đăng nhập
                  </Button>
                </div>
              </Form>
            </motion.section>
          </motion.div>
        </main>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer className="register-footer">
          <span>FaithEdu · Nền tảng quản lý giáo lý</span>

          <span className="footer-dot">•</span>

          <span>Cùng nhau lớn lên trong Đức Tin</span>

          <HeartFilled className="footer-heart" />
        </footer>
      </div>

      {/* ==========================================================
          MODAL - TERMS
      ========================================================== */}

      <Modal
        open={modalType === "terms"}
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnHidden
        className="legal-modal"
        closeIcon={
          <CloseOutlined
            style={{
              fontSize: 15,
              color: "#64748B",
            }}
          />
        }
      >
        <div className="legal-header">
          <div className="legal-header-icon">
            <FileTextOutlined />
          </div>

          <h2>Điều khoản sử dụng</h2>

          <p>Các quy định khi sử dụng nền tảng FaithEdu</p>
        </div>

        {renderTermsContent()}
      </Modal>

      {/* ==========================================================
          MODAL - PRIVACY
      ========================================================== */}

      <Modal
        open={modalType === "privacy"}
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnHidden
        className="legal-modal"
        closeIcon={
          <CloseOutlined
            style={{
              fontSize: 15,
              color: "#64748B",
            }}
          />
        }
      >
        <div className="legal-header privacy-header">
          <div className="legal-header-icon">
            <SafetyCertificateFilled />
          </div>

          <h2>Chính sách bảo mật</h2>

          <p>Cách FaithEdu bảo vệ thông tin của người dùng</p>
        </div>

        {renderPrivacyContent()}
      </Modal>
    </>
  );
};

export default FaithEduRegister;
