import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Rate, message, Divider } from "antd";
import { SendOutlined, HeartFilled } from "@ant-design/icons";

import { sendFeedback } from "../api/contactMessageApi";
import { useUser } from "../context/UserContext";
import LoadingLogo from "../components/LoadingLogo";

const { TextArea } = Input;

const FeedbackModal = ({ open, onClose }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [rating, setRating] = useState(5);

  const { user } = useUser();

  /*
   * ==========================================
   * USER
   * ==========================================
   */

  const userName = user?.full_name || user?.name || user?.fullName || "";

  const userEmail = user?.email || "";

  /*
   * ==========================================
   * KHI MỞ MODAL
   * ==========================================
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
   * ==========================================
   * SUBMIT
   * ==========================================
   */

  const handleSubmit = async (values) => {
    let progressTimer;

    try {
      setLoading(true);
      setLoadingProgress(0);

      /*
       * Progress giả lập trong lúc chờ API
       */
      progressTimer = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            return 90;
          }

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

      /*
       * Gửi feedback
       */
      await sendFeedback({
        name: userName,
        email: values.email,
        subject: values.subject,
        message: values.message,
        rating: values.rating,
      });

      /*
       * API thành công
       */
      clearInterval(progressTimer);

      setLoadingProgress(100);

      /*
       * Cho LoadingLogo chạy tới 100%
       */
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
   * ==========================================
   * CLOSE
   * ==========================================
   */

  const handleClose = () => {
    if (loading) return;

    form.resetFields();

    setRating(5);
    setLoadingProgress(0);

    onClose?.();
  };

  /*
   * ==========================================
   * AVATAR
   * ==========================================
   */

  const avatarLetter = userName?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={620}
      destroyOnClose
      closable={false}
      maskClosable={!loading}
      styles={{
        body: {
          padding: 0,
        },
        mask: {
          backdropFilter: "blur(5px)",
        },
      }}
    >
      <div className="faith-feedback-modal">
        {/* ==========================================
            HEADER
        ========================================== */}

        {/* ==========================================
            CONTENT
        ========================================== */}

        <div className="faith-feedback-content">
          {/* USER */}

          <div className="faith-feedback-user">
            <div className="faith-feedback-user-avatar">{avatarLetter}</div>

            <div className="faith-feedback-user-info">
              <strong>{userName || "Người dùng FaithEdu"}</strong>

              <span>Họ tên được lấy từ tài khoản FaithEdu</span>
            </div>

            <div className="faith-feedback-user-check">Tài khoản</div>
          </div>

          {/* WELCOME */}

          <div className="faith-feedback-welcome">
            <div className="welcome-heart">
              <HeartFilled />
            </div>

            <div className="faith-feedback-welcome-text">
              <strong>Cảm ơn bạn đã sử dụng FaithEdu</strong>

              <span>
                Hãy chia sẻ điều bạn thích, điều chưa thuận tiện hoặc tính năng
                bạn mong muốn.
              </span>
            </div>
          </div>

          {/* ==========================================
              FORM
          ========================================== */}

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
                marginBottom: 20,
              }}
            >
              <div className="faith-rating-box">
                <div className="faith-rating-left">
                  <span className="faith-rating-title">
                    Trải nghiệm của bạn
                  </span>

                  <span className="faith-rating-description">
                    Bạn cảm thấy FaithEdu như thế nào?
                  </span>
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
                margin: "4px 0 18px",
              }}
            />

            {/* FOOTER */}

            <div className="faith-feedback-footer">
              <div className="faith-feedback-note">
                Ý kiến của bạn sẽ được đội ngũ FaithEdu tiếp nhận và xem xét.
              </div>

              <div className="faith-feedback-actions">
                <button
                  type="button"
                  className="faith-btn-cancel"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Để sau
                </button>

                <button
                  type="submit"
                  className="faith-btn-submit"
                  disabled={loading}
                >
                  <SendOutlined />

                  <span>{loading ? "Đang gửi..." : "Gửi góp ý"}</span>
                </button>
              </div>
            </div>
          </Form>
        </div>

        {/* ==========================================
            LOADING OVERLAY
        ========================================== */}

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
        /* ==========================================
           MODAL
        ========================================== */

        .faith-feedback-modal {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          background: #ffffff;
        }

        /* ==========================================
           HEADER
        ========================================== */

        .faith-feedback-header {
          position: relative;
          padding: 28px 30px 26px;

          background:
            radial-gradient(
              circle at 90% 10%,
              rgba(212, 175, 55, 0.18),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #142d4c 0%,
              #1b365d 55%,
              #244b78 100%
            );

          color: #ffffff;
        }

        .faith-feedback-header-content {
          display: flex;
          align-items: center;
          gap: 17px;
          padding-right: 35px;
        }

        .faith-feedback-icon {
          flex: 0 0 52px;

          width: 52px;
          height: 52px;

          border-radius: 15px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(255, 255, 255, 0.13);
          border: 1px solid rgba(255, 255, 255, 0.2);

          color: #d4af37;

          font-size: 24px;

          box-shadow:
            0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .faith-feedback-eyebrow {
          margin-bottom: 5px;

          color: #d4af37;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .faith-feedback-header h2 {
          margin: 0 0 5px;

          color: #ffffff;

          font-size: 24px;
          line-height: 1.25;
          font-weight: 750;
          letter-spacing: -0.3px;
        }

        .faith-feedback-header p {
          margin: 0;

          max-width: 450px;

          color: rgba(255, 255, 255, 0.78);

          font-size: 13px;
          line-height: 1.6;
        }

        .faith-feedback-close {
          position: absolute;

          top: 17px;
          right: 18px;

          width: 34px;
          height: 34px;

          border: 0;
          border-radius: 9px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(255, 255, 255, 0.09);

          color: rgba(255, 255, 255, 0.8);

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .faith-feedback-close:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #ffffff;
        }

        .faith-feedback-close:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* ==========================================
           CONTENT
        ========================================== */

        .faith-feedback-content {
          padding: 25px 30px 27px;
        }

        /* ==========================================
           USER
        ========================================== */

        .faith-feedback-user {
          display: flex;
          align-items: center;
          gap: 12px;

          padding: 12px 14px;
          margin-bottom: 17px;

          border: 1px solid #edf1f5;
          border-radius: 12px;

          background: #ffffff;
        }

        .faith-feedback-user-avatar {
          width: 42px;
          height: 42px;

          flex: 0 0 42px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #1b365d;

          color: #ffffff;

          font-size: 15px;
          font-weight: 700;
        }

        .faith-feedback-user-info {
          min-width: 0;
          flex: 1;

          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .faith-feedback-user-info strong {
          color: #1e293b;

          font-size: 13px;
          font-weight: 700;
        }

        .faith-feedback-user-info span {
          color: #94a3b8;

          font-size: 11px;
        }

        .faith-feedback-user-check {
          padding: 5px 9px;

          border-radius: 7px;

          background: #f0fdf4;

          color: #15803d;

          font-size: 10px;
          font-weight: 650;

          white-space: nowrap;
        }

        /* ==========================================
           WELCOME
        ========================================== */

        .faith-feedback-welcome {
          display: flex;
          align-items: center;
          gap: 13px;

          padding: 13px 15px;
          margin-bottom: 22px;

          border-radius: 12px;

          background: #f8fafc;
          border: 1px solid #edf1f5;
        }

        .welcome-heart {
          flex: 0 0 38px;

          width: 38px;
          height: 38px;

          border-radius: 11px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #fff8df;

          color: #d4af37;

          font-size: 16px;
        }

        .faith-feedback-welcome-text {
          min-width: 0;
        }

        .faith-feedback-welcome strong {
          display: block;

          margin-bottom: 2px;

          color: #1e293b;

          font-size: 13px;
          font-weight: 700;
        }

        .faith-feedback-welcome span {
          display: block;

          color: #64748b;

          font-size: 12px;
          line-height: 1.5;
        }

        /* ==========================================
           FORM
        ========================================== */

        .faith-feedback-grid {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 16px;
        }

        .faith-feedback-content .ant-form-item {
          margin-bottom: 17px;
        }

        .faith-feedback-content
          .ant-form-item
          .ant-form-item-label {
          padding-bottom: 6px;
        }

        .faith-feedback-content
          .ant-form-item
          .ant-form-item-label
          > label {
          color: #334155;

          font-size: 12px;
          font-weight: 650;
        }

        .faith-input {
          height: 44px;

          border-color: #e2e8f0 !important;
          border-radius: 10px !important;

          box-shadow: none !important;

          font-size: 13px;

          transition: all 0.2s ease !important;
        }

        .faith-input:hover {
          border-color: #b8c6d8 !important;
        }

        .faith-input:focus,
        .faith-input.ant-input-focused {
          border-color: #1b365d !important;

          box-shadow:
            0 0 0 3px
            rgba(27, 54, 93, 0.07) !important;
        }

        .faith-input:disabled {
          color: #475569 !important;

          background: #f8fafc !important;

          cursor: not-allowed;
        }

        .faith-input::placeholder {
          color: #a0aec0;
        }

        .faith-select .ant-select-selector {
          height: 44px !important;

          display: flex;
          align-items: center;

          border-color: #e2e8f0 !important;
          border-radius: 10px !important;

          box-shadow: none !important;
        }

        .faith-select.ant-select-focused
          .ant-select-selector {
          border-color: #1b365d !important;

          box-shadow:
            0 0 0 3px
            rgba(27, 54, 93, 0.07) !important;
        }

        .faith-textarea {
          padding: 11px 13px;

          border-color: #e2e8f0 !important;
          border-radius: 10px !important;

          box-shadow: none !important;

          font-size: 13px;

          resize: vertical;
        }

        .faith-textarea:focus,
        .faith-textarea.ant-input-focused {
          border-color: #1b365d !important;

          box-shadow:
            0 0 0 3px
            rgba(27, 54, 93, 0.07) !important;
        }

        /* ==========================================
           RATING
        ========================================== */

        .faith-rating-box {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding: 15px 17px;

          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #fffdf6,
              #fff9e8
            );

          border: 1px solid #f2e8c4;
        }

        .faith-rating-left {
          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .faith-rating-title {
          color: #334155;

          font-size: 13px;
          font-weight: 700;
        }

        .faith-rating-description {
          color: #94a3b8;

          font-size: 11px;
        }

        .faith-rating-right {
          display: flex;

          align-items: center;

          gap: 9px;

          white-space: nowrap;
        }

        .faith-rating-right .ant-rate {
          font-size: 20px;
        }

        .faith-rating-right
          .ant-rate-star {
          margin-inline-end: 3px;
        }

        .faith-rating-number {
          min-width: 31px;

          color: #b58d16;

          font-size: 12px;
          font-weight: 750;
        }

        /* ==========================================
           FOOTER
        ========================================== */

        .faith-feedback-footer {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 20px;
        }

        .faith-feedback-note {
          max-width: 250px;

          color: #94a3b8;

          font-size: 11px;
          line-height: 1.5;
        }

        .faith-feedback-actions {
          display: flex;

          align-items: center;

          gap: 9px;
        }

        .faith-btn-cancel,
        .faith-btn-submit {
          height: 42px;

          padding: 0 18px;

          border-radius: 10px;

          font-family: inherit;

          font-size: 12px;
          font-weight: 650;

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .faith-btn-cancel {
          border: 1px solid #e2e8f0;

          background: #ffffff;

          color: #64748b;
        }

        .faith-btn-cancel:hover {
          border-color: #cbd5e1;

          color: #334155;

          background: #f8fafc;
        }

        .faith-btn-submit {
          min-width: 135px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 8px;

          border: 0;

          background: #1b365d;

          color: #ffffff;

          box-shadow:
            0 5px 14px
            rgba(27, 54, 93, 0.18);
        }

        .faith-btn-submit:hover {
          background: #244875;

          transform: translateY(-1px);
        }

        .faith-btn-submit:disabled,
        .faith-btn-cancel:disabled {
          opacity: 0.55;

          cursor: not-allowed;

          transform: none;
        }

        /* ==========================================
           LOADING OVERLAY
        ========================================== */

        .faith-feedback-loading {
          position: absolute;

          inset: 0;

          z-index: 100;

          display: flex;

          align-items: center;
          justify-content: center;

          background: rgba(255, 255, 255, 0.90);

          backdrop-filter: blur(5px);

          -webkit-backdrop-filter: blur(5px);

          border-radius: 18px;
        }

        .faith-feedback-loading-box {
          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: center;

          min-width: 230px;

          padding: 28px 38px;

          border-radius: 16px;

          background: rgba(255, 255, 255, 0.97);

          border: 1px solid #edf1f5;

          box-shadow:
            0 15px 45px
            rgba(15, 23, 42, 0.12);
        }

        .faith-feedback-loading-text {
          margin-top: 12px;

          color: #1b365d;

          font-size: 14px;
          font-weight: 700;
        }

        .faith-feedback-loading-sub {
          margin-top: 4px;

          color: #94a3b8;

          font-size: 11px;
        }

        /* ==========================================
           MOBILE
        ========================================== */

        @media (max-width: 600px) {
          .faith-feedback-header {
            padding: 23px 20px;
          }

          .faith-feedback-header h2 {
            font-size: 21px;
          }

          .faith-feedback-header p {
            font-size: 12px;
          }

          .faith-feedback-content {
            padding: 20px;
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

          .faith-btn-cancel,
          .faith-btn-submit {
            flex: 1;
          }

          .faith-feedback-loading-box {
            min-width: 190px;

            padding: 25px 30px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default FeedbackModal;
