// src/pages/auth/register/RegisterForm.jsx

import React, { useState } from "react";

import { Alert, Button, Checkbox, Col, Form, Input, Row, Select } from "antd";

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BankOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateFilled,
  UserOutlined,
} from "@ant-design/icons";

import { motion, AnimatePresence } from "framer-motion";

import {
  CHURCH_TYPE_OPTIONS,
  REGISTER_FORM_INITIAL_VALUES,
} from "./registerConstants";

import "./RegisterForm.css";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const slideLeft = {
  initial: {
    opacity: 0,
    x: 30,
  },

  animate: {
    opacity: 1,
    x: 0,
  },

  exit: {
    opacity: 0,
    x: -30,
  },
};

const RegisterForm = ({
  form,
  accepted,
  setAccepted,
  loading,
  error,
  onSubmit,
  onTerms,
  onPrivacy,
  onLogin,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  /**
   * ============================================================
   * STEP 1
   * ============================================================
   */

  const handleNextStep = async () => {
    try {
      await form.validateFields([
        "full_name",
        "email",
        "phone",
        "password",
        "confirm_password",
      ]);

      setCurrentStep(2);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.log("[REGISTER] STEP 1 ERROR:", error);
    }
  };

  /**
   * ============================================================
   * BACK
   * ============================================================
   */

  const handleBackStep = () => {
    setCurrentStep(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  const handleFinish = async () => {
    try {
      await form.validateFields([
        "full_name",
        "email",
        "phone",
        "password",
        "confirm_password",
        "church_name",
        "church_type",
        "address",
        "district",
        "ward",
        "pastor_name",
      ]);

      if (!accepted) {
        return;
      }

      const values = form.getFieldsValue(true);

      /**
       * Backend registration schema
       *
       * CHỈ GỬI 10 FIELD:
       *
       * email
       * password
       * full_name
       * phone
       * church_name
       * church_type
       * address
       * district
       * ward
       * pastor_name
       */

      const payload = {
        email: values.email?.trim().toLowerCase(),
        password: values.password,
        full_name: values.full_name?.trim(),
        phone: values.phone?.trim() || null,
        church_name: values.church_name?.trim(),
        church_type: values.church_type || "GIAO_XU",
        address: values.address?.trim() || null,
        district: values.district?.trim() || null,
        ward: values.ward?.trim() || null,
        pastor_name: values.pastor_name?.trim() || null,
      };

      console.log("[REGISTER] PAYLOAD:", JSON.stringify(payload, null, 2));

      await onSubmit(payload);
    } catch (error) {
      console.error("[REGISTER] SUBMIT ERROR:", error);
    }
  };

  return (
    <div className="register-form-wrapper">
      <div className="register-form-content">
        {/* ======================================================
            HEADER
        ====================================================== */}

        {/* ======================================================
            STEPPER
        ====================================================== */}

        <div className="register-stepper">
          {/* STEP 1 */}

          <button
            type="button"
            className={`register-step ${
              currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""
            }`}
            onClick={() => setCurrentStep(1)}
          >
            <span className="register-step-number">
              {currentStep > 1 ? <CheckCircleFilled /> : "01"}
            </span>

            <span className="register-step-text">
              <strong>Tài khoản</strong>
              <small>Thông tin cá nhân</small>
            </span>
          </button>

          <div
            className={`register-step-line ${
              currentStep > 1 ? "completed" : ""
            }`}
          />

          {/* STEP 2 */}

          <button
            type="button"
            className={`register-step ${currentStep === 2 ? "active" : ""}`}
            onClick={() => {
              if (currentStep === 2) return;

              handleNextStep();
            }}
          >
            <span className="register-step-number">02</span>

            <span className="register-step-text">
              <strong>Giáo xứ</strong>
              <small>Thông tin giáo xứ</small>
            </span>
          </button>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <Alert
              type="error"
              showIcon
              message={error}
              className="register-error"
            />
          </motion.div>
        )}

        {/* ======================================================
            FORM
        ====================================================== */}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            ...REGISTER_FORM_INITIAL_VALUES,
            church_type: REGISTER_FORM_INITIAL_VALUES?.church_type || "GIAO_XU",
          }}
          autoComplete="off"
          className="register-form"
        >
          <AnimatePresence mode="wait">
            {/* ==================================================
                STEP 1
            ================================================== */}

            {currentStep === 1 && (
              <motion.div
                key="register-step-1"
                {...slideLeft}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                <div className="form-box">
                  {/* SECTION HEADER */}

                  <div className="section-heading">
                    <div className="section-icon">
                      <UserOutlined />
                    </div>

                    <div>
                      <div className="section-title">Thông tin tài khoản</div>

                      <div className="section-description">
                        Thông tin dùng để tạo tài khoản quản trị
                      </div>
                    </div>
                  </div>

                  {/* FIELDS */}

                  <Row gutter={[16, 0]}>
                    {/* FULL NAME */}

                    <Col span={24}>
                      <Form.Item
                        label="Họ và tên"
                        name="full_name"
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Vui lòng nhập họ và tên",
                          },
                          {
                            min: 2,
                            message: "Họ và tên quá ngắn",
                          },
                        ]}
                      >
                        <Input
                          size="small"
                          prefix={<UserOutlined />}
                          placeholder="Nhập họ và tên"
                        />
                      </Form.Item>
                    </Col>

                    {/* EMAIL */}

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
                          size="small"
                          prefix={<MailOutlined />}
                          placeholder="example@gmail.com"
                          autoComplete="email"
                        />
                      </Form.Item>
                    </Col>

                    {/* PHONE */}

                    <Col span={24}>
                      <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                          {
                            pattern: /^[0-9+\s().-]*$/,
                            message: "Số điện thoại không hợp lệ",
                          },
                        ]}
                      >
                        <Input
                          size="small"
                          prefix={<PhoneOutlined />}
                          placeholder="Nhập số điện thoại"
                          autoComplete="tel"
                        />
                      </Form.Item>
                    </Col>

                    {/* PASSWORD */}

                    <Col xs={24} sm={12}>
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
                          size="small"
                          prefix={<LockOutlined />}
                          placeholder="Tối thiểu 6 ký tự"
                          autoComplete="new-password"
                        />
                      </Form.Item>
                    </Col>

                    {/* CONFIRM PASSWORD */}

                    <Col xs={24} sm={12}>
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
                          size="small"
                          prefix={<LockOutlined />}
                          placeholder="Nhập lại mật khẩu"
                          autoComplete="new-password"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* SECURITY */}

                <motion.div
                  className="security-box"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="security-icon">
                    <SafetyCertificateFilled />
                  </div>

                  <div className="security-content">
                    <strong>Thông tin được bảo mật</strong>

                    <span>
                      Dữ liệu tài khoản của bạn được bảo vệ và chỉ sử dụng cho
                      hệ thống FaithEdu.
                    </span>
                  </div>
                </motion.div>

                {/* NEXT */}

                <Button
                  type="primary"
                  size="large"
                  block
                  className="register-submit"
                  onClick={handleNextStep}
                  icon={<ArrowRightOutlined />}
                >
                  Tiếp tục
                </Button>
              </motion.div>
            )}

            {/* ==================================================
                STEP 2
            ================================================== */}

            {currentStep === 2 && (
              <motion.div
                key="register-step-2"
                {...slideLeft}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                <div className="form-box">
                  {/* SECTION HEADER */}

                  <div className="section-heading">
                    <div className="section-icon">
                      <BankOutlined />
                    </div>

                    <div>
                      <div className="section-title">Thông tin giáo xứ</div>

                      <div className="section-description">
                        Thông tin không gian quản lý của bạn trên FaithEdu
                      </div>
                    </div>
                  </div>

                  <Row gutter={[16, 0]}>
                    {/* CHURCH NAME */}

                    <Col span={24}>
                      <Form.Item
                        label="Tên giáo xứ"
                        name="church_name"
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Vui lòng nhập tên giáo xứ",
                          },
                        ]}
                      >
                        <Input
                          size="small"
                          prefix={<BankOutlined />}
                          placeholder="Ví dụ: Giáo xứ Đồng Quan"
                        />
                      </Form.Item>
                    </Col>

                    {/* CHURCH TYPE */}

                    <Col span={24}>
                      <Form.Item
                        label="Loại hình"
                        name="church_type"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn loại hình",
                          },
                        ]}
                      >
                        <Select
                          size="small"
                          options={CHURCH_TYPE_OPTIONS}
                          placeholder="Chọn loại hình"
                        />
                      </Form.Item>
                    </Col>

                    {/* ADDRESS */}

                    <Col span={24}>
                      <Form.Item label="Địa chỉ" name="address">
                        <Input
                          size="small"
                          prefix={<EnvironmentOutlined />}
                          placeholder="Nhập địa chỉ giáo xứ"
                        />
                      </Form.Item>
                    </Col>

                    {/* DISTRICT */}

                    <Col xs={24} sm={12}>
                      <Form.Item label="Quận / Huyện" name="district">
                        <Input size="small" placeholder="Quận / huyện" />
                      </Form.Item>
                    </Col>

                    {/* WARD */}

                    <Col xs={24} sm={12}>
                      <Form.Item label="Phường / Xã" name="ward">
                        <Input size="small" placeholder="Phường / xã" />
                      </Form.Item>
                    </Col>

                    {/* PASTOR */}

                    <Col span={24}>
                      <Form.Item label="Tên cha xứ" name="pastor_name">
                        <Input
                          size="small"
                          prefix={<UserOutlined />}
                          placeholder="Tên cha xứ (nếu có)"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* SECURITY */}

                  <div className="security-box">
                    <div className="security-icon">
                      <SafetyCertificateFilled />
                    </div>

                    <div className="security-content">
                      <strong>Thông tin giáo xứ được bảo vệ</strong>

                      <span>
                        Thông tin chỉ được sử dụng cho hoạt động quản lý trên
                        nền tảng FaithEdu.
                      </span>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    TRIAL
                ================================================== */}

                <div className="trial-box">
                  <div className="trial-icon">
                    <CheckCircleFilled />
                  </div>

                  <div className="trial-content">
                    <div className="trial-title">Bắt đầu miễn phí</div>

                    <div className="trial-description">
                      Sau khi xác thực email, giáo xứ của bạn sẽ được khởi tạo
                      với thời gian dùng thử theo chính sách FaithEdu.
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    TERMS
                ================================================== */}

                <div
                  className={`terms-row ${
                    !accepted ? "terms-not-accepted" : ""
                  }`}
                >
                  <Checkbox
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                  />

                  <span>
                    Tôi đồng ý với{" "}
                    <button
                      type="button"
                      className="terms-link"
                      onClick={onTerms}
                    >
                      Điều khoản sử dụng
                    </button>{" "}
                    và{" "}
                    <button
                      type="button"
                      className="terms-link"
                      onClick={onPrivacy}
                    >
                      Chính sách bảo mật
                    </button>{" "}
                    của FaithEdu.
                  </span>
                </div>

                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div className="register-actions">
                  <Button
                    size="large"
                    className="register-back"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBackStep}
                    disabled={loading}
                  >
                    Quay lại
                  </Button>

                  <Button
                    type="primary"
                    size="large"
                    className="register-submit register-submit-main"
                    loading={loading}
                    disabled={!accepted || loading}
                    onClick={handleFinish}
                    icon={!loading && <ArrowRightOutlined />}
                  >
                    {loading
                      ? "Đang gửi mã xác thực..."
                      : "Tiếp tục xác thực email"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Form>

        {/* ======================================================
            LOGIN
        ====================================================== */}

        <div className="login-bottom">
          <span>Đã có tài khoản?</span>

          <Button type="link" onClick={onLogin}>
            Đăng nhập
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
