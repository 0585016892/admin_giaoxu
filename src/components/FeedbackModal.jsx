import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Rate, message, Divider } from "antd";
import {
  SendOutlined,
  HeartFilled,
  MessageOutlined,
  CloseOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

import { sendFeedback } from "../api/contactMessageApi";
import { useUser } from "../context/UserContext";
import LoadingLogo from "../components/LoadingLogo";
import AppButton from "../components/common/AppButton";

const { TextArea } = Input;

const COLORS = {
  navy: "#173B5E",
  navyDark: "#102E4A",
  gold: "#D9A441",
  text: "#1E293B",
  muted: "#64748B",
  border: "#E7ECF2",
  soft: "#F8FAFC",
};

const FeedbackModal = ({ open, onClose }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [rating, setRating] = useState(5);

  const { user } = useUser();

  const userName = user?.full_name || user?.name || user?.fullName || "";

  const userEmail = user?.email || "";

  /*
   * =========================================================
   * OPEN MODAL
   * =========================================================
   */

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      email: userEmail,
      rating: 5,
    });

    setRating(5);
    setLoading(false);
    setLoadingProgress(0);
  }, [open, userEmail, form]);

  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit = async (values) => {
    let progressTimer;

    try {
      setLoading(true);
      setLoadingProgress(0);

      progressTimer = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return 90;

          let increment = 1;

          if (prev < 20) {
            increment = 2;
          } else if (prev < 45) {
            increment = 1.2;
          } else if (prev < 70) {
            increment = 0.7;
          } else {
            increment = 0.3;
          }

          return Math.min(prev + increment, 90);
        });
      }, 40);

      await sendFeedback({
        name: userName,
        email: values.email,
        subject: values.subject,
        message: values.message,
        rating: values.rating,
      });

      clearInterval(progressTimer);

      setLoadingProgress(100);

      await new Promise((resolve) => setTimeout(resolve, 500));

      message.success("Cảm ơn bạn! Góp ý đã được gửi thành công.");

      form.resetFields();

      setRating(5);
      setLoadingProgress(0);

      onClose?.();
    } catch (error) {
      if (progressTimer) {
        clearInterval(progressTimer);
      }

      setLoadingProgress(0);

      message.error(
        error?.response?.data?.message ||
          "Không thể gửi góp ý. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * CLOSE
   * =========================================================
   */

  const handleClose = () => {
    if (loading) return;

    form.resetFields();

    setRating(5);
    setLoadingProgress(0);

    onClose?.();
  };

  /*
   * =========================================================
   * AVATAR
   * =========================================================
   */

  const avatarLetter = userName?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={640}
      destroyOnClose
      closable={false}
      maskClosable={!loading}
      styles={{
        body: {
          padding: 0,
        },
        mask: {
          backdropFilter: "blur(6px)",
          background: "rgba(15, 23, 42, 0.48)",
        },
      }}
    >
      <div className="faith-feedback-modal">
        {/* =====================================================
            TOP HEADER
        ===================================================== */}

        <div className="faith-feedback-top">
          <div className="faith-feedback-top-left">
            <div className="faith-feedback-top-icon">
              <MessageOutlined />
            </div>

            <div>
              <div className="faith-feedback-eyebrow">FAITHEDU</div>

              <div className="faith-feedback-title">Chia sẻ cùng chúng con</div>

              <div className="faith-feedback-subtitle">
                Mỗi góp ý của bạn giúp FaithEdu hoàn thiện hơn.
              </div>
            </div>
          </div>

          <button
            type="button"
            className="faith-feedback-close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Đóng"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="faith-feedback-content">
          {/* ===================================================
              USER
          =================================================== */}

          <div className="faith-feedback-user">
            <div className="faith-feedback-user-avatar">{avatarLetter}</div>

            <div className="faith-feedback-user-info">
              <strong>{userName || "Người dùng FaithEdu"}</strong>

              <span>Góp ý được gửi từ tài khoản FaithEdu của bạn</span>
            </div>

            <div className="faith-feedback-user-check">
              <CheckCircleFilled />
              Đã đăng nhập
            </div>
          </div>

          {/* ===================================================
              WELCOME
          =================================================== */}

          <div className="faith-feedback-welcome">
            <div className="faith-feedback-welcome-icon">
              <HeartFilled />
            </div>

            <div className="faith-feedback-welcome-content">
              <div className="faith-feedback-welcome-title">
                Cảm ơn bạn đã đồng hành cùng FaithEdu
              </div>

              <div className="faith-feedback-welcome-text">
                Chúng con xin Quý Cha, Quý Anh Chị Giáo lý viên dành khoảng 2
                phút để chia sẻ cảm nhận về hệ thống.
              </div>
            </div>
          </div>

          {/* ===================================================
              FORM
          =================================================== */}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            {/* NAME + EMAIL */}

            <div className="faith-feedback-grid">
              <Form.Item label="Họ và tên">
                <Input
                  size="large"
                  value={userName}
                  disabled
                  className="faith-input"
                  placeholder="Họ và tên"
                />
              </Form.Item>

              <Form.Item
                label="Email nhận liên hệ"
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
                  size="large"
                  className="faith-input"
                  placeholder="you@example.com"
                />
              </Form.Item>
            </div>

            {/* SUBJECT */}

            <Form.Item
              label="Bạn muốn góp ý về điều gì?"
              name="subject"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn nội dung",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Chọn nội dung góp ý"
                className="faith-select"
                options={[
                  {
                    value: "Góp ý chung",
                    label: "Góp ý chung",
                  },
                  {
                    value: "Báo lỗi hệ thống",
                    label: "Báo lỗi hệ thống",
                  },
                  {
                    value: "Đề xuất tính năng",
                    label: "Đề xuất tính năng",
                  },
                  {
                    value: "Giao diện",
                    label: "Giao diện",
                  },
                  {
                    value: "Trải nghiệm sử dụng",
                    label: "Trải nghiệm sử dụng",
                  },
                  {
                    value: "Khác",
                    label: "Khác",
                  },
                ]}
              />
            </Form.Item>

            {/* RATING */}

            <Form.Item
              name="rating"
              initialValue={5}
              style={{
                marginBottom: 18,
              }}
            >
              <div className="faith-rating-box">
                <div className="faith-rating-left">
                  <div className="faith-rating-title">Đánh giá trải nghiệm</div>

                  <div className="faith-rating-description">
                    Bạn cảm thấy FaithEdu như thế nào?
                  </div>
                </div>

                <div className="faith-rating-right">
                  <Rate
                    value={rating}
                    onChange={(value) => {
                      setRating(value);
                      form.setFieldValue("rating", value);
                    }}
                  />

                  <span className="faith-rating-number">{rating}/5</span>
                </div>
              </div>
            </Form.Item>

            {/* MESSAGE */}

            <Form.Item
              label="Nội dung góp ý"
              name="message"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập nội dung góp ý",
                },
                {
                  min: 10,
                  message: "Nội dung tối thiểu 10 ký tự",
                },
              ]}
            >
              <TextArea
                rows={5}
                maxLength={2000}
                showCount
                className="faith-textarea"
                placeholder="Hãy chia sẻ điều bạn thích, điều chưa thuận tiện hoặc tính năng bạn mong muốn..."
              />
            </Form.Item>

            <Divider
              style={{
                margin: "2px 0 18px",
                borderColor: "#EEF2F6",
              }}
            />

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="faith-feedback-footer">
              <div className="faith-feedback-note">
                Ý kiến của bạn sẽ được đội ngũ FaithEdu tiếp nhận và xem xét để
                cải thiện hệ thống.
              </div>

              <div className="faith-feedback-actions">
                <AppButton
                  variant="secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Để sau
                </AppButton>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    height: 42,
                    padding: "0 18px",
                    border: 0,
                    borderRadius: 10,
                    background: "#173B5E",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <SendOutlined style={{ marginRight: 8 }} />
                  {loading ? "Đang gửi..." : "Gửi góp ý"}
                </button>
              </div>
            </div>
          </Form>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="faith-feedback-loading">
            <div className="faith-feedback-loading-box">
              <LoadingLogo progress={loadingProgress} />

              <div className="faith-feedback-loading-text">
                {loadingProgress >= 100 ? "Đã gửi góp ý" : "Đang gửi góp ý..."}
              </div>

              <div className="faith-feedback-loading-sub">
                {loadingProgress >= 100
                  ? "Đang hoàn tất..."
                  : "Vui lòng chờ một chút"}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* =====================================================
           MODAL
        ===================================================== */

        .faith-feedback-modal {
          position: relative;
          overflow: hidden;

          background: #ffffff;

          border-radius: 18px;

          font-family: inherit;
        }

        /* =====================================================
           TOP
        ===================================================== */

        .faith-feedback-top {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 22px 24px;

          background:
            radial-gradient(
              circle at 92% 0%,
              rgba(217, 164, 65, 0.18),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #102e4a 0%,
              #173b5e 55%,
              #244d76 100%
            );

          color: #ffffff;
        }

        .faith-feedback-top-left {
          display: flex;
          align-items: center;

          gap: 14px;

          min-width: 0;

          padding-right: 35px;
        }

        .faith-feedback-top-icon {
          flex: 0 0 48px;

          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          background: rgba(255, 255, 255, 0.11);

          border: 1px solid rgba(255, 255, 255, 0.16);

          color: ${COLORS.gold};

          font-size: 21px;
        }

        .faith-feedback-eyebrow {
          margin-bottom: 3px;

          color: ${COLORS.gold};

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 1.8px;
        }

        .faith-feedback-title {
          color: #ffffff;

          font-size: 19px;
          font-weight: 750;

          line-height: 1.25;
        }

        .faith-feedback-subtitle {
          margin-top: 4px;

          color: rgba(255, 255, 255, 0.68);

          font-size: 11px;
          line-height: 1.45;
        }

        .faith-feedback-close {
          position: absolute;

          top: 18px;
          right: 18px;

          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 0;
          border-radius: 9px;

          background: rgba(255, 255, 255, 0.09);

          color: rgba(255, 255, 255, 0.72);

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .faith-feedback-close:hover {
          background: rgba(255, 255, 255, 0.17);
          color: #ffffff;
        }

        .faith-feedback-close:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .faith-feedback-content {
          padding: 22px 25px 24px;
        }

        /* =====================================================
           USER
        ===================================================== */

        .faith-feedback-user {
          display: flex;
          align-items: center;

          gap: 11px;

          padding: 10px 12px;

          margin-bottom: 14px;

          border: 1px solid ${COLORS.border};
          border-radius: 12px;

          background: #ffffff;
        }

        .faith-feedback-user-avatar {
          flex: 0 0 40px;

          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            linear-gradient(
              145deg,
              ${COLORS.navy},
              #28567f
            );

          color: #ffffff;

          font-size: 14px;
          font-weight: 750;
        }

        .faith-feedback-user-info {
          min-width: 0;
          flex: 1;

          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .faith-feedback-user-info strong {
          overflow: hidden;

          color: ${COLORS.text};

          font-size: 12px;
          font-weight: 700;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .faith-feedback-user-info span {
          overflow: hidden;

          color: #94a3b8;

          font-size: 10px;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .faith-feedback-user-check {
          display: flex;
          align-items: center;

          gap: 4px;

          padding: 5px 8px;

          border-radius: 7px;

          background: #f0fdf4;

          color: #15803d;

          font-size: 9px;
          font-weight: 700;

          white-space: nowrap;
        }

        /* =====================================================
           WELCOME
        ===================================================== */

        .faith-feedback-welcome {
          display: flex;
          align-items: center;

          gap: 12px;

          padding: 13px 14px;

          margin-bottom: 19px;

          border: 1px solid #f0e6c6;
          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #fffdf7,
              #fff9eb
            );
        }

        .faith-feedback-welcome-icon {
          flex: 0 0 38px;

          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #fff3c9;

          color: ${COLORS.gold};

          font-size: 16px;
        }

        .faith-feedback-welcome-content {
          min-width: 0;
        }

        .faith-feedback-welcome-title {
          margin-bottom: 2px;

          color: ${COLORS.text};

          font-size: 12px;
          font-weight: 750;
        }

        .faith-feedback-welcome-text {
          color: #64748b;

          font-size: 11px;
          line-height: 1.5;
        }

        /* =====================================================
           FORM
        ===================================================== */

        .faith-feedback-grid {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 14px;
        }

        .faith-feedback-content
          .ant-form-item {
          margin-bottom: 15px;
        }

        .faith-feedback-content
          .ant-form-item-label {
          padding-bottom: 5px;
        }

        .faith-feedback-content
          .ant-form-item-label
          > label {
          height: auto;

          color: #334155;

          font-size: 11px;
          font-weight: 700;
        }

        .faith-input {
          height: 42px !important;

          padding: 0 12px !important;

          border-color: #e1e7ee !important;

          border-radius: 9px !important;

          box-shadow: none !important;

          color: ${COLORS.text};

          font-size: 12px;

          transition: all 0.2s ease !important;
        }

        .faith-input:hover {
          border-color: #bdc9d7 !important;
        }

        .faith-input:focus,
        .faith-input.ant-input-focused {
          border-color: ${COLORS.navy} !important;

          box-shadow:
            0 0 0 3px
            rgba(23, 59, 94, 0.07) !important;
        }

        .faith-input:disabled {
          color: #475569 !important;

          background: #f8fafc !important;

          cursor: not-allowed;
        }

        .faith-input::placeholder {
          color: #a4afbd;
        }

        /* =====================================================
           SELECT
        ===================================================== */

        .faith-select {
          width: 100%;
        }

        .faith-select .ant-select-selector {
          height: 42px !important;

          display: flex;
          align-items: center;

          padding: 0 11px !important;

          border-color: #e1e7ee !important;

          border-radius: 9px !important;

          box-shadow: none !important;

          font-size: 12px;
        }

        .faith-select:hover
          .ant-select-selector {
          border-color: #bdc9d7 !important;
        }

        .faith-select.ant-select-focused
          .ant-select-selector {
          border-color: ${COLORS.navy} !important;

          box-shadow:
            0 0 0 3px
            rgba(23, 59, 94, 0.07) !important;
        }

        /* =====================================================
           TEXTAREA
        ===================================================== */

        .faith-textarea {
          padding: 10px 12px !important;

          border-color: #e1e7ee !important;

          border-radius: 9px !important;

          box-shadow: none !important;

          color: ${COLORS.text};

          font-size: 12px;

          line-height: 1.55;

          resize: vertical;
        }

        .faith-textarea:hover {
          border-color: #bdc9d7 !important;
        }

        .faith-textarea:focus,
        .faith-textarea.ant-input-focused {
          border-color: ${COLORS.navy} !important;

          box-shadow:
            0 0 0 3px
            rgba(23, 59, 94, 0.07) !important;
        }

        /* =====================================================
           RATING
        ===================================================== */

        .faith-rating-box {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding: 13px 15px;

          border: 1px solid #f0e6c6;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #fffdf7,
              #fff9eb
            );
        }

        .faith-rating-left {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .faith-rating-title {
          color: #334155;

          font-size: 12px;
          font-weight: 700;
        }

        .faith-rating-description {
          color: #94a3b8;

          font-size: 10px;
        }

        .faith-rating-right {
          display: flex;
          align-items: center;

          gap: 8px;

          white-space: nowrap;
        }

        .faith-rating-right
          .ant-rate {
          font-size: 19px;
        }

        .faith-rating-right
          .ant-rate-star {
          margin-inline-end: 2px;
        }

        .faith-rating-number {
          min-width: 27px;

          color: #b18418;

          font-size: 11px;
          font-weight: 750;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .faith-feedback-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 18px;
        }

        .faith-feedback-note {
          max-width: 280px;

          color: #94a3b8;

          font-size: 10px;
          line-height: 1.5;
        }

        .faith-feedback-actions {
          display: flex;
          align-items: center;

          gap: 8px;

          flex-shrink: 0;
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .faith-feedback-loading {
          position: absolute;

          inset: 0;

          z-index: 100;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 18px;

          background: rgba(255, 255, 255, 0.91);

          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }

        .faith-feedback-loading-box {
          min-width: 225px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 27px 35px;

          border: 1px solid #edf1f5;

          border-radius: 15px;

          background: rgba(255, 255, 255, 0.98);

          box-shadow:
            0 18px 50px
            rgba(15, 23, 42, 0.12);
        }

        .faith-feedback-loading-text {
          margin-top: 11px;

          color: ${COLORS.navy};

          font-size: 13px;
          font-weight: 750;
        }

        .faith-feedback-loading-sub {
          margin-top: 3px;

          color: #94a3b8;

          font-size: 10px;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {
          .faith-feedback-top {
            padding: 19px 18px;
          }

          .faith-feedback-top-icon {
            flex-basis: 42px;

            width: 42px;
            height: 42px;

            border-radius: 12px;

            font-size: 18px;
          }

          .faith-feedback-title {
            font-size: 17px;
          }

          .faith-feedback-subtitle {
            font-size: 10px;
          }

          .faith-feedback-content {
            padding: 18px;
          }

          .faith-feedback-grid {
            grid-template-columns: 1fr;

            gap: 0;
          }

          .faith-feedback-user-check {
            display: none;
          }

          .faith-feedback-welcome {
            align-items: flex-start;

            padding: 12px;
          }

          .faith-rating-box {
            flex-direction: column;

            align-items: flex-start;
          }

          .faith-rating-right {
            width: 100%;

            justify-content: space-between;
          }

          .faith-feedback-footer {
            flex-direction: column;

            align-items: stretch;
          }

          .faith-feedback-note {
            max-width: none;
          }

          .faith-feedback-actions {
            width: 100%;
          }

          .faith-feedback-actions > * {
            flex: 1;
          }

          .faith-feedback-loading-box {
            min-width: 190px;

            padding: 24px 28px;
          }
        }

        @media (max-width: 380px) {
          .faith-feedback-content {
            padding: 15px;
          }

          .faith-feedback-top-left {
            gap: 10px;
          }

          .faith-feedback-top-icon {
            display: none;
          }

          .faith-feedback-title {
            font-size: 16px;
          }

          .faith-feedback-welcome-text {
            font-size: 10px;
          }

          .faith-rating-right
            .ant-rate {
            font-size: 17px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default FeedbackModal;
