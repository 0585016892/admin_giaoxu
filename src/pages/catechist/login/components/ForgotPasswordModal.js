// src/components/auth/ForgotPasswordModal.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Progress,
  Steps,
  Typography,
} from "antd";

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { AnimatePresence, motion } from "framer-motion";

import {
  requestForgotPassword,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetForgotPassword,
} from "../../../../api/forgotPasswordApi";

const { Text, Title } = Typography;

// =====================================================
// CONSTANTS
// =====================================================

const STEP_ITEMS = [
  {
    title: "Xác minh",
    description: "Tài khoản",
  },
  {
    title: "Nhận mã",
    description: "Email",
  },
  {
    title: "OTP",
    description: "Xác thực",
  },
  {
    title: "Mật khẩu",
    description: "Hoàn tất",
  },
];

// =====================================================
// HELPERS
// =====================================================

const getErrorMessage = (error) => {
  if (!error) {
    return "Có lỗi xảy ra. Vui lòng thử lại.";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.response?.data?.message ||
    "Có lỗi xảy ra. Vui lòng thử lại."
  );
};

const normalizeEmail = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const maskEmail = (email) => {
  if (!email || !email.includes("@")) {
    return "***";
  }

  const [name, domain] = email.split("@");

  if (name.length <= 2) {
    return `${name.charAt(0)}***@${domain}`;
  }

  return `${name.slice(0, 2)}***@${domain}`;
};

// =====================================================
// COMPONENT
// =====================================================

const ForgotPasswordModal = ({ open, onClose }) => {
  const [form] = Form.useForm();

  // ---------------------------------------------------
  // STATE
  // ---------------------------------------------------

  const [step, setStep] = useState(0);

  const [loading, setLoading] = useState(false);

  const [oldEmail, setOldEmail] = useState("");

  const [newEmail, setNewEmail] = useState("");

  const [account, setAccount] = useState(null);

  const [useCurrentEmail, setUseCurrentEmail] = useState(true);

  const [otp, setOtp] = useState("");

  const [otpExpiresIn, setOtpExpiresIn] = useState(0);

  const [otpError, setOtpError] = useState("");

  const [resetRequestId, setResetRequestId] = useState(null);

  const [successData, setSuccessData] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  const [copied, setCopied] = useState(false);

  // ---------------------------------------------------
  // DERIVED
  // ---------------------------------------------------

  const targetEmail = useMemo(() => {
    if (useCurrentEmail) {
      return oldEmail;
    }

    return newEmail;
  }, [useCurrentEmail, oldEmail, newEmail]);

  const targetMaskedEmail = useMemo(() => {
    return maskEmail(targetEmail);
  }, [targetEmail]);

  const progressPercent = useMemo(() => {
    if (step === 0) return 12;
    if (step === 1) return 38;
    if (step === 2) return 68;
    if (step === 3) return 90;
    return 100;
  }, [step]);

  // ---------------------------------------------------
  // RESET
  // ---------------------------------------------------

  const resetFlow = useCallback(() => {
    setStep(0);
    setLoading(false);
    setOldEmail("");
    setNewEmail("");
    setAccount(null);
    setUseCurrentEmail(true);
    setOtp("");
    setOtpExpiresIn(0);
    setOtpError("");
    setResetRequestId(null);
    setSuccessData(null);
    setErrorMessage("");
    setCopied(false);

    form.resetFields();
  }, [form]);
  useEffect(() => {
    if (!open) {
      return;
    }

    resetFlow();
  }, [open, resetFlow]);
  // ---------------------------------------------------
  // CLOSE
  // ---------------------------------------------------

  const handleClose = () => {
    if (loading) {
      return;
    }

    resetFlow();
    onClose?.();
  };

  // ---------------------------------------------------
  // STEP 1
  // CHECK ACCOUNT
  // ---------------------------------------------------

  const handleRequestAccount = async (values) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const email = normalizeEmail(values.email);

      const response = await requestForgotPassword(email);

      const data = response?.data || {};

      setOldEmail(email);

      setAccount(data);

      setUseCurrentEmail(true);

      setStep(1);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // SEND OTP
  // ---------------------------------------------------

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const normalizedOldEmail = normalizeEmail(oldEmail);

      const normalizedNewEmail = useCurrentEmail
        ? null
        : normalizeEmail(newEmail);

      if (!normalizedOldEmail) {
        setErrorMessage("Không xác định được email tài khoản.");
        return;
      }

      if (!useCurrentEmail && !normalizedNewEmail) {
        setErrorMessage("Vui lòng nhập email mới.");
        return;
      }

      if (!useCurrentEmail && normalizedNewEmail === normalizedOldEmail) {
        setErrorMessage("Email mới phải khác email hiện tại.");
        return;
      }

      const response = await sendForgotPasswordOtp({
        oldEmail: normalizedOldEmail,
        newEmail: normalizedNewEmail,
      });

      const data = response?.data || response || {};

      const expiresIn = Number(data?.expires_in || response?.expires_in || 300);

      setOtp("");
      setOtpError("");
      setOtpExpiresIn(expiresIn);

      setStep(2);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // OTP COUNTDOWN
  // ---------------------------------------------------

  useEffect(() => {
    if (otpExpiresIn <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setOtpExpiresIn((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [otpExpiresIn]);

  // ---------------------------------------------------
  // VERIFY OTP
  // ---------------------------------------------------

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      setOtpError("");
      setErrorMessage("");

      const normalizedOtp = String(otp || "").trim();

      if (!/^\d{6}$/.test(normalizedOtp)) {
        setOtpError("Vui lòng nhập đúng 6 chữ số.");
        return;
      }

      if (otpExpiresIn <= 0) {
        setOtpError("Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.");
        return;
      }

      const normalizedOldEmail = normalizeEmail(oldEmail);

      const normalizedNewEmail = useCurrentEmail
        ? null
        : normalizeEmail(newEmail);

      const response = await verifyForgotPasswordOtp({
        oldEmail: normalizedOldEmail,
        newEmail: normalizedNewEmail,
        otp: normalizedOtp,
      });

      const data = response?.data || response || {};

      setResetRequestId(data?.reset_request_id || response?.reset_request_id);

      setStep(3);
    } catch (error) {
      setOtpError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // RESET PASSWORD
  // ---------------------------------------------------

  const handleResetPassword = async (values) => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!resetRequestId) {
        setErrorMessage(
          "Phiên đặt lại mật khẩu không hợp lệ. Vui lòng thực hiện lại.",
        );
        return;
      }

      const response = await resetForgotPassword({
        resetRequestId,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      });

      const data = response?.data || response || {};

      setSuccessData({
        email: data?.admin?.email || data?.email || targetEmail,

        password: values.password,
      });

      setStep(4);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // RESEND OTP
  // ---------------------------------------------------

  const handleResendOtp = async () => {
    if (otpExpiresIn > 0 || loading) {
      return;
    }

    await handleSendOtp();
  };

  // ---------------------------------------------------
  // COPY PASSWORD
  // ---------------------------------------------------

  const handleCopyPassword = async () => {
    if (!successData?.password) {
      return;
    }

    try {
      await navigator.clipboard.writeText(successData.password);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {}
  };

  // ---------------------------------------------------
  // BACK
  // ---------------------------------------------------

  const handleBack = () => {
    if (loading) {
      return;
    }

    setErrorMessage("");
    setOtpError("");

    if (step === 1) {
      setStep(0);
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
    }
  };

  // ---------------------------------------------------
  // RENDER HEADER
  // ---------------------------------------------------

  const renderHeader = () => {
    if (step === 4) {
      return (
        <div className="forgot-header forgot-header-success">
          <motion.div
            className="success-icon"
            initial={{
              scale: 0,
              rotate: -20,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 14,
            }}
          >
            <CheckCircleFilled />
          </motion.div>

          <div>
            <Title level={3}>Đổi mật khẩu thành công</Title>

            <Text>Tài khoản của bạn đã được bảo vệ bằng mật khẩu mới.</Text>
          </div>
        </div>
      );
    }

    return (
      <div className="forgot-header">
        <motion.div
          className="forgot-header-icon"
          animate={{
            y: [0, -4, 0],
            rotate: [0, 1, 0, -1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {step === 0 && <UserOutlined />}
          {step === 1 && <MailOutlined />}
          {step === 2 && <SafetyCertificateOutlined />}
          {step === 3 && <KeyOutlined />}
        </motion.div>

        <div className="forgot-header-content">
          <Title level={3}>Quên mật khẩu?</Title>

          <Text>
            {step === 0 && "Nhập email để tìm tài khoản của bạn."}

            {step === 1 && "Chọn cách bạn muốn nhận mã xác thực."}

            {step === 2 && "Nhập mã 6 số chúng tôi vừa gửi cho bạn."}

            {step === 3 && "Tạo một mật khẩu mới cho tài khoản."}
          </Text>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------
  // STEP CONTENT
  // ---------------------------------------------------

  const renderStepContent = () => {
    return (
      <AnimatePresence mode="wait">
        {/* ================================================= */}
        {/* STEP 0 */}
        {/* ================================================= */}

        {step === 0 && (
          <motion.div
            key="step-email"
            className="forgot-step-content"
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -20,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            <div className="step-intro">
              <div className="step-number">01</div>

              <div>
                <Text className="step-label">XÁC MINH TÀI KHOẢN</Text>

                <Text className="step-description">
                  Sử dụng email đã đăng ký với FaithEdu.
                </Text>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleRequestAccount}
              requiredMark={false}
              autoComplete="off"
            >
              <Form.Item
                label="Email đăng ký"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email.",
                  },
                  {
                    type: "email",
                    message: "Email không hợp lệ.",
                  },
                ]}
              >
                <Input
                  className="faith-forgot-input"
                  size="large"
                  prefix={<MailOutlined />}
                  placeholder="vd: ban@gmail.com"
                  autoComplete="email"
                />
              </Form.Item>

              {errorMessage && (
                <Alert
                  className="forgot-alert"
                  type="error"
                  showIcon
                  icon={<CloseCircleFilled />}
                  message={errorMessage}
                />
              )}

              <Button
                htmlType="submit"
                type="primary"
                size="large"
                block
                loading={loading}
                className="forgot-primary-btn"
                icon={<ArrowRightOutlined />}
              >
                Tiếp tục
              </Button>
            </Form>
          </motion.div>
        )}

        {/* ================================================= */}
        {/* STEP 1 */}
        {/* ================================================= */}

        {step === 1 && (
          <motion.div
            key="step-method"
            className="forgot-step-content"
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -20,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            <div className="account-found">
              <div className="account-avatar">
                {(account?.full_name || oldEmail || "F")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="account-info">
                <Text className="account-found-label">
                  ĐÃ TÌM THẤY TÀI KHOẢN
                </Text>

                <div className="account-name">
                  {account?.full_name || "Tài khoản FaithEdu"}
                </div>

                <div className="account-email">
                  <MailOutlined />
                  {maskEmail(oldEmail)}
                </div>
              </div>

              <CheckCircleFilled className="account-check" />
            </div>

            <div className="method-title">Bạn còn truy cập được email này?</div>

            <div className="method-description">
              Nếu còn, chúng tôi sẽ gửi mã xác thực trực tiếp vào email hiện
              tại.
            </div>

            <div className="method-options">
              <motion.button
                type="button"
                className={`method-card ${
                  useCurrentEmail ? "method-card-active" : ""
                }`}
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.985,
                }}
                onClick={() => {
                  setUseCurrentEmail(true);
                  setErrorMessage("");
                }}
              >
                <div className="method-card-icon">
                  <MailOutlined />
                </div>

                <div className="method-card-body">
                  <div className="method-card-title">
                    Tôi vẫn dùng email này
                  </div>

                  <div className="method-card-text">
                    Gửi mã đến <strong>{maskEmail(oldEmail)}</strong>
                  </div>
                </div>

                <div className="method-radio">
                  {useCurrentEmail && <CheckCircleFilled />}
                </div>
              </motion.button>

              <motion.button
                type="button"
                className={`method-card ${
                  !useCurrentEmail ? "method-card-active" : ""
                }`}
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.985,
                }}
                onClick={() => {
                  setUseCurrentEmail(false);
                  setErrorMessage("");
                }}
              >
                <div className="method-card-icon method-card-icon-alt">
                  <SendOutlined />
                </div>

                <div className="method-card-body">
                  <div className="method-card-title">
                    Tôi không còn dùng email này
                  </div>

                  <div className="method-card-text">
                    Nhận mã tại một email khác
                  </div>
                </div>

                <div className="method-radio">
                  {!useCurrentEmail && <CheckCircleFilled />}
                </div>
              </motion.button>
            </div>

            <AnimatePresence>
              {!useCurrentEmail && (
                <motion.div
                  className="new-email-box"
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                >
                  <div className="new-email-label">Email mới nhận mã</div>

                  <Input
                    className="faith-forgot-input"
                    size="large"
                    prefix={<MailOutlined />}
                    value={newEmail}
                    onChange={(event) => {
                      setNewEmail(event.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="Nhập email bạn đang sử dụng"
                    autoComplete="email"
                  />

                  <div className="new-email-hint">
                    Sau khi đặt lại mật khẩu thành công, email tài khoản sẽ được
                    cập nhật sang email này.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {errorMessage && (
              <Alert
                className="forgot-alert"
                type="error"
                showIcon
                icon={<CloseCircleFilled />}
                message={errorMessage}
              />
            )}

            <div className="step-actions">
              <Button
                size="large"
                className="forgot-back-btn"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                disabled={loading}
              >
                Quay lại
              </Button>

              <Button
                size="large"
                type="primary"
                className="forgot-primary-btn"
                loading={loading}
                onClick={handleSendOtp}
                icon={<SendOutlined />}
              >
                Gửi mã xác thực
              </Button>
            </div>
          </motion.div>
        )}

        {/* ================================================= */}
        {/* STEP 2 */}
        {/* ================================================= */}

        {step === 2 && (
          <motion.div
            key="step-otp"
            className="forgot-step-content"
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -20,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            <div className="otp-hero">
              <motion.div
                className="otp-icon"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <SafetyCertificateOutlined />
              </motion.div>

              <div className="otp-title">Kiểm tra email của bạn</div>

              <div className="otp-description">Mã xác thực đã được gửi đến</div>

              <div className="otp-email">{targetMaskedEmail}</div>
            </div>

            <div className="otp-input-wrapper">
              <Input.OTP
                length={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setOtpError("");
                  setErrorMessage("");
                }}
                autoFocus
                size="large"
                className="faith-otp"
              />
            </div>

            {otpError && (
              <Alert
                className="forgot-alert"
                type="error"
                showIcon
                icon={<CloseCircleFilled />}
                message={otpError}
              />
            )}

            <div className="otp-timer">
              {otpExpiresIn > 0 ? (
                <>
                  <span>Mã có hiệu lực trong</span>

                  <strong>
                    {Math.floor(otpExpiresIn / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(otpExpiresIn % 60).toString().padStart(2, "0")}
                  </strong>
                </>
              ) : (
                <span className="otp-expired">Mã OTP đã hết hạn</span>
              )}
            </div>

            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              disabled={loading || otp.length !== 6 || otpExpiresIn <= 0}
              className="forgot-primary-btn"
              onClick={handleVerifyOtp}
              icon={<SafetyCertificateOutlined />}
            >
              Xác nhận mã
            </Button>

            <div className="otp-resend">
              <span>Không nhận được mã?</span>

              <button
                type="button"
                disabled={otpExpiresIn > 0 || loading}
                onClick={handleResendOtp}
              >
                Gửi lại mã
              </button>
            </div>

            <button
              type="button"
              className="text-back-btn"
              onClick={handleBack}
              disabled={loading}
            >
              <ArrowLeftOutlined />
              Thay đổi email nhận mã
            </button>
          </motion.div>
        )}

        {/* ================================================= */}
        {/* STEP 3 */}
        {/* ================================================= */}

        {step === 3 && (
          <motion.div
            key="step-password"
            className="forgot-step-content"
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -20,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            <div className="password-hero">
              <div className="password-icon">
                <LockOutlined />
              </div>

              <div>
                <div className="password-title">Tạo mật khẩu mới</div>

                <div className="password-description">
                  Hãy chọn mật khẩu đủ mạnh và dễ nhớ với bạn.
                </div>
              </div>
            </div>

            <Form
              layout="vertical"
              onFinish={handleResetPassword}
              requiredMark={false}
              autoComplete="off"
            >
              <Form.Item
                label="Mật khẩu mới"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu mới.",
                  },
                  {
                    min: 8,
                    message: "Mật khẩu phải có ít nhất 8 ký tự.",
                  },
                ]}
              >
                <Input.Password
                  className="faith-forgot-input"
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu mới"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng xác nhận mật khẩu.",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp."),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  className="faith-forgot-input"
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                />
              </Form.Item>

              <div className="password-rules">
                <div>
                  <CheckCircleFilled />
                  Ít nhất 8 ký tự
                </div>

                <div>
                  <CheckCircleFilled />
                  Không nên dùng thông tin dễ đoán
                </div>
              </div>

              {errorMessage && (
                <Alert
                  className="forgot-alert"
                  type="error"
                  showIcon
                  icon={<CloseCircleFilled />}
                  message={errorMessage}
                />
              )}

              <div className="step-actions">
                <Button
                  size="large"
                  className="forgot-back-btn"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBack}
                  disabled={loading}
                >
                  Quay lại
                </Button>

                <Button
                  htmlType="submit"
                  type="primary"
                  size="large"
                  className="forgot-primary-btn"
                  loading={loading}
                  icon={<KeyOutlined />}
                >
                  Đặt mật khẩu mới
                </Button>
              </div>
            </Form>
          </motion.div>
        )}

        {/* ================================================= */}
        {/* STEP 4 */}
        {/* ================================================= */}

        {step === 4 && (
          <motion.div
            key="step-success"
            className="forgot-success"
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.35,
            }}
          >
            <motion.div
              className="success-ring"
              initial={{
                scale: 0.6,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                delay: 0.1,
                duration: 0.4,
              }}
            >
              <CheckCircleFilled />
            </motion.div>

            <div className="success-title">Mật khẩu đã được thay đổi!</div>

            <div className="success-description">
              Bạn có thể sử dụng thông tin dưới đây để đăng nhập vào FaithEdu.
            </div>

            <div className="success-credentials">
              <div className="credential-item">
                <div className="credential-icon">
                  <MailOutlined />
                </div>

                <div className="credential-content">
                  <span>Email đăng nhập</span>

                  <strong>{successData?.email}</strong>
                </div>
              </div>

              <div className="credential-item">
                <div className="credential-icon">
                  <LockOutlined />
                </div>

                <div className="credential-content">
                  <span>Mật khẩu mới</span>

                  <strong className="password-display">
                    {successData?.password}
                  </strong>
                </div>

                <button
                  type="button"
                  className="copy-password-btn"
                  onClick={handleCopyPassword}
                >
                  {copied ? "Đã sao chép" : "Sao chép"}
                </button>
              </div>
            </div>

            <div className="success-note">
              <SafetyCertificateOutlined />

              <span>
                Vì lý do bảo mật, hãy lưu mật khẩu ở nơi an toàn và không chia
                sẻ cho người khác.
              </span>
            </div>

            <Button
              type="primary"
              size="large"
              block
              className="forgot-primary-btn"
              onClick={handleClose}
              icon={<ArrowRightOutlined />}
            >
              Quay lại đăng nhập
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={520}
      destroyOnHidden
      closeIcon={<span className="forgot-close">×</span>}
      className="faith-forgot-modal"
      maskClosable={!loading}
    >
      <div className="faith-forgot">
        {/* Decorative background */}
        <div className="forgot-orb forgot-orb-1" />
        <div className="forgot-orb forgot-orb-2" />

        {/* Header */}
        {renderHeader()}

        {/* Progress */}
        {step !== 4 && (
          <div className="forgot-progress">
            <Progress
              percent={progressPercent}
              showInfo={false}
              strokeWidth={4}
              className="faith-progress"
            />

            <div className="forgot-progress-label">
              <span>Bước {step + 1}/4</span>

              <span>
                {step === 0 && "Tìm tài khoản"}

                {step === 1 && "Chọn email nhận mã"}

                {step === 2 && "Xác thực OTP"}

                {step === 3 && "Tạo mật khẩu"}
              </span>
            </div>
          </div>
        )}

        {/* Steps */}
        {step !== 4 && (
          <div className="forgot-steps-wrapper">
            <Steps current={step} size="small" responsive items={STEP_ITEMS} />
          </div>
        )}

        {/* Content */}
        <div className="forgot-content">{renderStepContent()}</div>

        {/* Footer */}
        {step !== 4 && (
          <div className="forgot-footer">
            <SafetyCertificateOutlined />

            <span>Thông tin của bạn được bảo mật</span>
          </div>
        )}
      </div>

      <style>{`
        /* =================================================
           MODAL
        ================================================= */

        .faith-forgot-modal .ant-modal {
          max-width: calc(100vw - 20px);
        }

        .faith-forgot-modal .ant-modal-content {
          padding: 0;
          overflow: hidden;
          border-radius: 28px;
          background: #ffffff;
          box-shadow:
            0 30px 80px rgba(16, 42, 67, 0.22),
            0 10px 30px rgba(16, 42, 67, 0.08);
        }

        .faith-forgot-modal .ant-modal-body {
          padding: 0;
        }

        .forgot-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.72);
          color: #64748b;
          font-size: 22px;
          line-height: 1;
          transition: all 0.2s ease;
        }

        .forgot-close:hover {
          background: #eef3f7;
          color: #173b5e;
          transform: rotate(90deg);
        }

        .faith-forgot {
          position: relative;
          overflow: hidden;
          padding: 30px;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(217, 164, 65, 0.09),
              transparent 28%
            ),
            radial-gradient(
              circle at 0% 100%,
              rgba(23, 59, 94, 0.06),
              transparent 32%
            ),
            #ffffff;
        }

        .faith-forgot > * {
          position: relative;
          z-index: 2;
        }

        /* =================================================
           DECORATIVE ORBS
        ================================================= */

        .forgot-orb {
          position: absolute !important;
          z-index: 0 !important;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(1px);
        }

        .forgot-orb-1 {
          width: 150px;
          height: 150px;
          top: -90px;
          right: -70px;
          background: rgba(217, 164, 65, 0.12);
          animation: forgotFloat 7s ease-in-out infinite;
        }

        .forgot-orb-2 {
          width: 120px;
          height: 120px;
          bottom: -80px;
          left: -65px;
          background: rgba(23, 59, 94, 0.06);
          animation: forgotFloat 9s ease-in-out infinite reverse;
        }

        @keyframes forgotFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, 10px, 0);
          }
        }

        /* =================================================
           HEADER
        ================================================= */

        .forgot-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 22px;
        }

        .forgot-header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          width: 54px;
          height: 54px;
          border-radius: 18px;
          color: #173b5e;
          font-size: 23px;
          background:
            linear-gradient(
              135deg,
              #fff9ee,
              #f4e7c1
            );
          box-shadow:
            inset 0 0 0 1px
              rgba(217, 164, 65, 0.16),
            0 8px 22px
              rgba(217, 164, 65, 0.12);
        }

        .forgot-header-content {
          min-width: 0;
        }

        .forgot-header h3 {
          margin: 0 0 3px;
          color: #102a43;
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -0.4px;
        }

        .forgot-header .ant-typography {
          color: #6b7280;
          font-size: 13px;
          line-height: 1.55;
        }

        /* =================================================
           PROGRESS
        ================================================= */

        .forgot-progress {
          margin-bottom: 18px;
        }

        .faith-progress {
          margin-bottom: 7px !important;
        }

        .faith-progress .ant-progress-inner {
          background: #edf1f5;
        }

        .faith-progress .ant-progress-bg {
          background:
            linear-gradient(
              90deg,
              #173b5e,
              #d9a441
            );
        }

        .forgot-progress-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
        }

        .forgot-progress-label span:last-child {
          color: #64748b;
        }

        /* =================================================
           STEPS
        ================================================= */

        .forgot-steps-wrapper {
          margin-bottom: 25px;
          padding: 14px 12px;
          border: 1px solid #edf1f5;
          border-radius: 16px;
          background: rgba(247, 249, 252, 0.72);
        }

        .forgot-steps-wrapper .ant-steps-item-title {
          color: #64748b !important;
          font-size: 10px !important;
          font-weight: 700;
        }

        .forgot-steps-wrapper
          .ant-steps-item-process
          .ant-steps-item-title {
          color: #173b5e !important;
        }

        .forgot-steps-wrapper
          .ant-steps-item-process
          .ant-steps-item-icon {
          background: #173b5e;
          border-color: #173b5e;
          box-shadow:
            0 0 0 4px
              rgba(23, 59, 94, 0.08);
        }

        .forgot-steps-wrapper
          .ant-steps-item-finish
          .ant-steps-item-icon {
          background: #e8f5ee;
          border-color: #2e7d5b;
        }

        .forgot-steps-wrapper
          .ant-steps-item-finish
          .ant-steps-icon {
          color: #2e7d5b;
        }

        /* =================================================
           CONTENT
        ================================================= */

        .forgot-content {
          min-height: 270px;
        }

        .forgot-step-content {
          width: 100%;
        }

        .step-intro {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          flex: 0 0 auto;
          border-radius: 13px;
          color: #173b5e;
          background: #eef3f7;
          font-size: 11px;
          font-weight: 800;
        }

        .step-label {
          display: block;
          margin-bottom: 2px;
          color: #173b5e;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.8px;
        }

        .step-description {
          color: #6b7280;
          font-size: 12px;
        }

        /* =================================================
           FORM
        ================================================= */

        .faith-forgot .ant-form-item {
          margin-bottom: 18px;
        }

        .faith-forgot
          .ant-form-item
          .ant-form-item-label {
          padding-bottom: 7px;
        }

        .faith-forgot
          .ant-form-item-label
          > label {
          color: #243447;
          font-size: 12px;
          font-weight: 700;
        }

        .faith-forgot-input.ant-input-affix-wrapper,
        .faith-forgot-input.ant-input {
          min-height: 48px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #ffffff;
          box-shadow: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .faith-forgot-input.ant-input-affix-wrapper:hover,
        .faith-forgot-input.ant-input:hover {
          border-color: #c8d3df;
        }

        .faith-forgot-input.ant-input-affix-wrapper:focus,
        .faith-forgot-input.ant-input-affix-wrapper-focused,
        .faith-forgot-input.ant-input:focus {
          border-color: #173b5e;
          box-shadow:
            0 0 0 4px
              rgba(23, 59, 94, 0.07);
        }

        /*
          IMPORTANT:
          16px prevents automatic mobile browser
          zoom when focusing inputs.
        */

        .faith-forgot-input .ant-input,
        .faith-forgot-input.ant-input {
          font-size: 16px !important;
        }

        .faith-forgot-input .ant-input-prefix {
          margin-right: 10px;
          color: #94a3b8;
        }

        .forgot-alert {
          margin-bottom: 16px;
          border-radius: 12px;
        }

        .forgot-alert .ant-alert-message {
          font-size: 12px;
        }

        /* =================================================
           PRIMARY BUTTON
        ================================================= */

        .forgot-primary-btn {
          height: 48px;
          border: none !important;
          border-radius: 13px !important;
          background:
            linear-gradient(
              135deg,
              #173b5e 0%,
              #102a43 100%
            ) !important;
          box-shadow:
            0 10px 22px
              rgba(23, 59, 94, 0.16);
          font-size: 13px;
          font-weight: 750;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .forgot-primary-btn:hover {
          transform: translateY(-1px);
          box-shadow:
            0 14px 28px
              rgba(23, 59, 94, 0.22);
        }

        .forgot-primary-btn:active {
          transform: translateY(0);
        }

        .forgot-back-btn {
          height: 48px;
          border-radius: 13px !important;
          border-color: #e2e8f0 !important;
          color: #64748b !important;
          font-size: 13px;
          font-weight: 700;
        }

        /* =================================================
           ACCOUNT
        ================================================= */

        .account-found {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
          padding: 14px;
          border: 1px solid #e8f0ea;
          border-radius: 17px;
          background:
            linear-gradient(
              135deg,
              #f8fcfa,
              #ffffff
            );
        }

        .account-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          flex: 0 0 auto;
          border-radius: 14px;
          color: #ffffff;
          background:
            linear-gradient(
              135deg,
              #173b5e,
              #2e7d5b
            );
          font-size: 18px;
          font-weight: 800;
          box-shadow:
            0 8px 18px
              rgba(23, 59, 94, 0.15);
        }

        .account-info {
          min-width: 0;
          flex: 1;
        }

        .account-found-label {
          display: block;
          color: #2e7d5b;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.7px;
        }

        .account-name {
          margin-top: 2px;
          overflow: hidden;
          color: #173b5e;
          font-size: 14px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .account-email {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 2px;
          overflow: hidden;
          color: #64748b;
          font-size: 11px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .account-check {
          color: #2e7d5b;
          font-size: 18px;
        }

        /* =================================================
           EMAIL METHOD
        ================================================= */

        .method-title {
          margin-bottom: 4px;
          color: #173b5e;
          font-size: 15px;
          font-weight: 800;
        }

        .method-description {
          margin-bottom: 16px;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.55;
        }

        .method-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .method-card {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          outline: none;
          background: #ffffff;
          text-align: left;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .method-card:hover {
          border-color: #c7d4df;
          box-shadow:
            0 7px 18px
              rgba(16, 42, 67, 0.06);
        }

        .method-card-active {
          border-color: #173b5e !important;
          background:
            linear-gradient(
              135deg,
              #f7fafc,
              #ffffff
            );
          box-shadow:
            0 0 0 3px
              rgba(23, 59, 94, 0.06);
        }

        .method-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          flex: 0 0 auto;
          margin-right: 11px;
          border-radius: 12px;
          color: #173b5e;
          background: #eef3f7;
          font-size: 17px;
        }

        .method-card-icon-alt {
          color: #b7791f;
          background: #fff7e0;
        }

        .method-card-body {
          min-width: 0;
          flex: 1;
        }

        .method-card-title {
          margin-bottom: 2px;
          color: #243447;
          font-size: 12px;
          font-weight: 800;
        }

        .method-card-text {
          color: #7b8794;
          font-size: 10px;
          line-height: 1.45;
        }

        .method-card-text strong {
          color: #173b5e;
        }

        .method-radio {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          margin-left: 8px;
          color: #173b5e;
          font-size: 18px;
        }

        .new-email-box {
          overflow: hidden;
          margin-top: 12px;
          padding: 14px;
          border: 1px solid #f0e3c4;
          border-radius: 15px;
          background: #fffdf7;
        }

        .new-email-label {
          margin-bottom: 8px;
          color: #7c5a17;
          font-size: 11px;
          font-weight: 800;
        }

        .new-email-hint {
          margin-top: 7px;
          color: #8a7a59;
          font-size: 10px;
          line-height: 1.5;
        }

        /* =================================================
           ACTIONS
        ================================================= */

        .step-actions {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 10px;
          margin-top: 4px;
        }

        /* =================================================
           OTP
        ================================================= */

        .otp-hero {
          margin-bottom: 22px;
          text-align: center;
        }

        .otp-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 58px;
          height: 58px;
          margin: 0 auto 12px;
          border-radius: 18px;
          color: #173b5e;
          background:
            linear-gradient(
              135deg,
              #eef3f7,
              #f4e7c1
            );
          font-size: 25px;
        }

        .otp-title {
          margin-bottom: 3px;
          color: #173b5e;
          font-size: 17px;
          font-weight: 800;
        }

        .otp-description {
          color: #7b8794;
          font-size: 12px;
        }

        .otp-email {
          margin-top: 3px;
          color: #102a43;
          font-size: 13px;
          font-weight: 800;
        }

        .otp-input-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .faith-otp {
          width: 100%;
        }

        .faith-otp .ant-otp-input {
          height: 50px;
          border-radius: 12px;
          border-color: #e2e8f0;
          color: #173b5e;
          font-size: 21px;
          font-weight: 800;
        }

        .faith-otp .ant-otp-input:focus {
          border-color: #173b5e;
          box-shadow:
            0 0 0 3px
              rgba(23, 59, 94, 0.07);
        }

        .otp-timer {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-bottom: 15px;
          color: #94a3b8;
          font-size: 11px;
        }

        .otp-timer strong {
          color: #173b5e;
          font-variant-numeric: tabular-nums;
        }

        .otp-expired {
          color: #c94c4c;
          font-weight: 700;
        }

        .otp-resend {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin-top: 13px;
          color: #94a3b8;
          font-size: 11px;
        }

        .otp-resend button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #173b5e;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        .otp-resend button:disabled {
          color: #b7c0ca;
          cursor: not-allowed;
        }

        .text-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          margin-top: 14px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #7b8794;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }

        .text-back-btn:hover {
          color: #173b5e;
        }

        /* =================================================
           PASSWORD
        ================================================= */

        .password-hero {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 14px;
          border-radius: 16px;
          background: #f7f9fc;
        }

        .password-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex: 0 0 auto;
          border-radius: 13px;
          color: #173b5e;
          background: #eef3f7;
          font-size: 18px;
        }

        .password-title {
          margin-bottom: 2px;
          color: #173b5e;
          font-size: 14px;
          font-weight: 800;
        }

        .password-description {
          color: #7b8794;
          font-size: 11px;
          line-height: 1.45;
        }

        .password-rules {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin: -3px 0 16px;
          color: #7b8794;
          font-size: 10px;
        }

        .password-rules div {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .password-rules .anticon {
          color: #2e7d5b;
        }

        /* =================================================
           SUCCESS
        ================================================= */

        .forgot-header-success {
          justify-content: center;
          text-align: left;
        }

        .success-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          flex: 0 0 auto;
          border-radius: 18px;
          color: #2e7d5b;
          background: #e8f5ee;
          font-size: 26px;
        }

        .forgot-success {
          text-align: center;
        }

        .success-ring {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 76px;
          height: 76px;
          margin: 4px auto 17px;
          border: 1px solid #cde8d8;
          border-radius: 50%;
          color: #2e7d5b;
          background:
            radial-gradient(
              circle,
              #e8f5ee 0%,
              #f8fcfa 70%
            );
          box-shadow:
            0 12px 30px
              rgba(46, 125, 91, 0.12);
          font-size: 36px;
        }

        .success-title {
          margin-bottom: 6px;
          color: #173b5e;
          font-size: 20px;
          font-weight: 850;
          letter-spacing: -0.3px;
        }

        .success-description {
          max-width: 390px;
          margin: 0 auto 20px;
          color: #7b8794;
          font-size: 12px;
          line-height: 1.6;
        }

        .success-credentials {
          overflow: hidden;
          margin-bottom: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: #ffffff;
          text-align: left;
        }

        .credential-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px;
        }

        .credential-item + .credential-item {
          border-top: 1px solid #edf1f5;
        }

        .credential-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          flex: 0 0 auto;
          border-radius: 11px;
          color: #173b5e;
          background: #eef3f7;
        }

        .credential-content {
          min-width: 0;
          flex: 1;
        }

        .credential-content span {
          display: block;
          margin-bottom: 2px;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 700;
        }

        .credential-content strong {
          display: block;
          overflow: hidden;
          color: #173b5e;
          font-size: 12px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .password-display {
          letter-spacing: 1.5px;
        }

        .copy-password-btn {
          flex: 0 0 auto;
          padding: 6px 9px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          color: #173b5e;
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
          transition: all 0.2s ease;
        }

        .copy-password-btn:hover {
          border-color: #173b5e;
          background: #eef3f7;
        }

        .success-note {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          margin-bottom: 17px;
          padding: 10px 12px;
          border-radius: 11px;
          background: #fff9ee;
          color: #8a7a59;
          font-size: 10px;
          line-height: 1.5;
          text-align: left;
        }

        .success-note .anticon {
          flex: 0 0 auto;
          margin-top: 1px;
          color: #b7791f;
        }

        /* =================================================
           FOOTER
        ================================================= */

        .forgot-footer {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin-top: 22px;
          padding-top: 14px;
          border-top: 1px solid #f0f2f5;
          color: #a0aab5;
          font-size: 10px;
        }

        .forgot-footer .anticon {
          color: #2e7d5b;
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 600px) {
          .faith-forgot-modal {
            margin: 10px;
          }

          .faith-forgot-modal .ant-modal {
            width: calc(100vw - 20px) !important;
            max-width: calc(100vw - 20px);
            margin: 10px auto;
          }

          .faith-forgot-modal .ant-modal-content {
            border-radius: 22px;
          }

          .faith-forgot {
            max-height: calc(100vh - 20px);
            overflow-y: auto;
            padding: 22px 18px 18px;
          }

          .forgot-header {
            gap: 11px;
            margin-bottom: 18px;
          }

          .forgot-header-icon {
            width: 47px;
            height: 47px;
            border-radius: 15px;
            font-size: 20px;
          }

          .forgot-header h3 {
            font-size: 20px;
          }

          .forgot-header .ant-typography {
            font-size: 11px;
          }

          .forgot-steps-wrapper {
            padding: 11px 7px;
            margin-bottom: 20px;
          }

          .forgot-steps-wrapper
            .ant-steps-item-title {
            font-size: 9px !important;
          }

          .forgot-steps-wrapper
            .ant-steps-item-description {
            display: none;
          }

          .forgot-content {
            min-height: 0;
          }

          .account-found {
            padding: 11px;
          }

          .account-avatar {
            width: 42px;
            height: 42px;
            border-radius: 12px;
          }

          .method-card {
            padding: 11px;
          }

          .method-card-icon {
            width: 37px;
            height: 37px;
          }

          .step-actions {
            grid-template-columns: 1fr;
          }

          .forgot-back-btn {
            order: 2;
          }

          .forgot-primary-btn {
            order: 1;
          }

          .faith-otp .ant-otp-input {
            height: 47px;
            font-size: 19px;
          }

          .success-title {
            font-size: 18px;
          }

          .credential-item {
            padding: 11px;
          }

          .copy-password-btn {
            font-size: 8px;
          }

          .forgot-footer {
            margin-top: 18px;
          }
        }

        @media (max-width: 380px) {
          .faith-forgot {
            padding: 18px 14px 15px;
          }

          .forgot-header h3 {
            font-size: 18px;
          }

          .forgot-steps-wrapper
            .ant-steps-item-title {
            font-size: 8px !important;
          }

          .method-card-title {
            font-size: 11px;
          }

          .method-card-text {
            font-size: 9px;
          }

          .credential-content strong {
            max-width: 145px;
          }
        }

        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {
          .forgot-orb,
          .forgot-header-icon,
          .otp-icon {
            animation: none !important;
          }

          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </Modal>
  );
};

export default ForgotPasswordModal;
