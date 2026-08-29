import React from "react";
import { Modal, Typography, Space, Tag, Row, Col } from "antd";
import {
  QuestionCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  StarFilled,
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;

const HelpModal = ({ open, onCancel }) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
      title={
        <Space align="center" size={10}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 14,
              background: "#FFF5F7",
              color: "#FF6B8B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #FFE4E6",
            }}
          >
            <QuestionCircleOutlined />
          </div>
          <div>
            <Text
              strong
              style={{
                display: "block",
                color: "#334155",
                fontSize: 16,
                fontWeight: 800,
                fontFamily: "'Quicksand', sans-serif",
              }}
            >
              Hướng Dẫn Quản Lý Bảng Điểm ✨
            </Text>
            <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>
              Quy định tính điểm và hướng dẫn thao tác
            </Text>
          </div>
        </Space>
      }
      styles={{
        header: {
          background: "#FFF5F7",
          borderBottom: "1.5px dashed #FFD1D9",
          padding: "16px 24px",
        },
        body: {
          padding: "20px 24px",
          maxHeight: "75vh",
          overflowY: "auto",
        },
      }}
    >
      {/* SECTION 1: HƯỚNG DẪN BẮT ĐẦU */}
      <Space align="center" size={8} style={{ marginBottom: 12 }}>
        <BookOutlined style={{ color: "#FF6B8B", fontSize: 16 }} />
        <Text strong style={{ color: "#334155", fontSize: 14 }}>
          1. Quy trình nhập điểm
        </Text>
      </Space>

      <div
        style={{
          background: "#FFF9FA",
          padding: 14,
          borderRadius: 16,
          border: "1px solid #FFE4E6",
          marginBottom: 16,
        }}
      >
        <Paragraph style={{ margin: 0, fontSize: 13, color: "#64748B" }}>
          • <strong>Bước 1:</strong> Chọn đúng <i>Lớp học</i> và <i>Học kỳ</i> ở
          bộ lọc phía trên.
          <br />• <strong>Bước 2:</strong> Nhấp nút <strong>"Nhập điểm"</strong>{" "}
          để mở bảng điền điểm.
          <br />• <strong>Bước 3:</strong> Nhập điểm các cột (Điểm danh, Giữa
          kỳ, Cuối kỳ) cho từng bé.
          <br />• <strong>Bước 4:</strong> Nhấp <strong>"Lưu thay đổi"</strong>.
          Hệ thống sẽ tự động tính điểm trung bình và xếp loại.
        </Paragraph>
      </div>

      {/* SECTION 2: CÔNG THỨC & TRỌNG SỐ */}
      <Space align="center" size={8} style={{ marginBottom: 12 }}>
        <TrophyOutlined style={{ color: "#FFC048", fontSize: 16 }} />
        <Text strong style={{ color: "#334155", fontSize: 14 }}>
          2. Trọng số & Công thức tính
        </Text>
      </Space>

      <Row gutter={[10, 10]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <div
            style={{
              background: "#F0F9FF",
              padding: 10,
              borderRadius: 12,
              border: "1px solid #BAE6FD",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: "#0284C7",
                fontWeight: 700,
                display: "block",
              }}
            >
              Chuyên cần
            </Text>
            <Tag
              color="cyan"
              style={{ marginTop: 4, borderRadius: 8, fontWeight: 800 }}
            >
              10%
            </Tag>
          </div>
        </Col>
        <Col span={8}>
          <div
            style={{
              background: "#FEF3C7",
              padding: 10,
              borderRadius: 12,
              border: "1px solid #FDE68A",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: "#D97706",
                fontWeight: 700,
                display: "block",
              }}
            >
              Giữa kỳ
            </Text>
            <Tag
              color="gold"
              style={{ marginTop: 4, borderRadius: 8, fontWeight: 800 }}
            >
              30%
            </Tag>
          </div>
        </Col>
        <Col span={8}>
          <div
            style={{
              background: "#FEE2E2",
              padding: 10,
              borderRadius: 12,
              border: "1px solid #FECACA",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: "#DC2626",
                fontWeight: 700,
                display: "block",
              }}
            >
              Cuối kỳ
            </Text>
            <Tag
              color="red"
              style={{ marginTop: 4, borderRadius: 8, fontWeight: 800 }}
            >
              60%
            </Tag>
          </div>
        </Col>
      </Row>

      {/* SECTION 3: XẾP LOẠI HỌC LỰC */}
      <Space align="center" size={8} style={{ marginBottom: 12 }}>
        <StarFilled style={{ color: "#FF6B8B", fontSize: 16 }} />
        <Text strong style={{ color: "#334155", fontSize: 14 }}>
          3. Tiêu chuẩn xếp loại
        </Text>
      </Space>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            background: "#F8FAFC",
            borderRadius: 12,
          }}
        >
          <Tag color="success" style={{ borderRadius: 8, fontWeight: 800 }}>
            🌸 Giỏi
          </Tag>
          <Text style={{ fontSize: 12, color: "#475569" }}>
            Điểm TB ≥ 8.0 (không cột nào &lt; 6.5)
          </Text>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            background: "#F8FAFC",
            borderRadius: 12,
          }}
        >
          <Tag color="processing" style={{ borderRadius: 8, fontWeight: 800 }}>
            🌼 Khá
          </Tag>
          <Text style={{ fontSize: 12, color: "#475569" }}>
            Điểm TB ≥ 6.5 (không cột nào &lt; 5.0)
          </Text>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            background: "#F8FAFC",
            borderRadius: 12,
          }}
        >
          <Tag color="warning" style={{ borderRadius: 8, fontWeight: 800 }}>
            🌺 Trung Bình
          </Tag>
          <Text style={{ fontSize: 12, color: "#475569" }}>Điểm TB ≥ 5.0</Text>
        </div>
      </div>

      {/* LƯU Ý BỔ SUNG */}
      <div
        style={{
          padding: 12,
          borderRadius: 14,
          background: "#FFF5F7",
          border: "1px dashed #FF6B8B",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <InfoCircleOutlined style={{ color: "#FF6B8B", marginTop: 2 }} />
        <Text style={{ fontSize: 12, color: "#FF6B8B", fontWeight: 600 }}>
          Lưu ý: Nếu cần sửa lại điểm sau khi đã khóa sổ học kỳ, vui lòng liên
          hệ với Ban Quản Lý Giáo Lý để mở lại quyền chỉnh sửa.
        </Text>
      </div>
    </Modal>
  );
};

export default HelpModal;
