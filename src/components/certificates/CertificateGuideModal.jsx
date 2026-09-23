import React from "react";
import { Modal, Steps, Alert, Typography } from "antd";

const { Paragraph } = Typography;

const COLORS = {
  navy: "#173B5E",
  gold: "#D9A441",
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#173B5E",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  navyLight: "#EEF3F7",
  goldLight: "#FBF5E7",
};

const CertificateGuideModal = ({ open, onClose }) => {
  return (
    <>
      <style>{`
        .cert-guide-modal .ant-modal-content {
          border-radius: 12px;
          padding: 24px;
          overflow: hidden;
        }
        .cert-guide-modal .ant-modal-header {
          margin-bottom: 20px;
          border-bottom: 1px solid ${COLORS.border};
          padding-bottom: 12px;
        }
        .cert-guide-modal .ant-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: ${COLORS.navy};
        }
        /* Tùy chỉnh Steps gọn gàng hơn */
        .cert-steps .ant-steps-item-icon {
          background-color: ${COLORS.navyLight} !important;
          border-color: ${COLORS.navy} !important;
          color: ${COLORS.navy} !important;
        }
        .cert-steps .ant-steps-item-process .ant-steps-item-icon {
          background-color: ${COLORS.navy} !important;
          color: ${COLORS.white} !important;
        }
        .cert-steps .ant-steps-item-title {
          font-weight: 600 !important;
          color: ${COLORS.text} !important;
          font-size: 14px !important;
        }
        .cert-steps .ant-steps-item-description {
          color: ${COLORS.textSecondary} !important;
          font-size: 12px !important;
        }
      `}</style>

      <Modal
        title="Hướng dẫn cấp chứng chỉ"
        open={open}
        onCancel={onClose}
        footer={null}
        width={700}
        className="cert-guide-modal"
      >
        <Steps
          direction="vertical"
          current={-1}
          className="cert-steps"
          items={[
            {
              title: "Chọn loại chứng chỉ",
              description: "Chọn mẫu phù hợp với nội dung cần cấp.",
            },
            {
              title: "Cấp theo lớp",
              description: "Chọn lớp giáo lý để tải danh sách học sinh.",
            },
            {
              title: "Kiểm tra danh sách",
              description: "Xác thực họ tên và thông tin liên quan.",
            },
            {
              title: "Chọn xếp loại",
              description:
                "Đánh giá trực tiếp cho lần cấp này mà không ảnh hưởng hồ sơ gốc.",
            },
            {
              title: "Xem trước",
              description:
                "Xem chi tiết thông tin hiển thị trên mẫu chứng chỉ.",
            },
            {
              title: "Xuất PDF hoặc ZIP",
              description: "Tải xuống file đơn lẻ hoặc toàn bộ danh sách.",
            },
          ]}
        />

        <Alert
          style={{
            marginTop: 20,
            borderRadius: 8,
            backgroundColor: COLORS.navyLight,
            border: `1px solid ${COLORS.border}`,
          }}
          type="info"
          showIcon
          message={
            <span style={{ fontWeight: 600, color: COLORS.navy }}>
              Lưu ý về xếp loại
            </span>
          }
          description={
            <Paragraph
              style={{
                marginBottom: 0,
                fontSize: 12,
                color: COLORS.textSecondary,
              }}
            >
              Xếp loại trong màn hình này chỉ áp dụng cho lần cấp hiện tại và
              không tự động cập nhật ngược vào hồ sơ học sinh.
            </Paragraph>
          }
        />
      </Modal>
    </>
  );
};

export default CertificateGuideModal;
