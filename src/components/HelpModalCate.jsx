import React, { useState } from "react";
import { Modal, Row, Col, Tabs, Tag } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  ScanOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  TrophyOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  HeartFilled,
  GlobalOutlined,
  RocketOutlined,
  StarOutlined,
} from "@ant-design/icons";

import logoWeb from "../assets/images/logoweb.png";

const HelpModalCate = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("1");

  const FeatureCard = ({ icon, title, description, tag }) => (
    <div className="faith-h-card">
      <div className="faith-h-card-icon">{icon}</div>
      <div className="faith-h-card-body">
        <div className="faith-h-card-header">
          <span className="faith-h-card-title">{title}</span>
          {tag && (
            <Tag color="pink" className="faith-h-card-tag">
              {tag}
            </Tag>
          )}
        </div>
        <p className="faith-h-card-desc">{description}</p>
      </div>
    </div>
  );

  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <BookOutlined /> Tính năng chính
        </span>
      ),
      children: (
        <div className="faith-tab-pane">
          <div className="faith-pane-header">
            <h3>Nền tảng hỗ trợ toàn diện</h3>
            <p>
              Giảm thiểu 80% công việc thủ công, giúp bạn tập trung vào sứ mạng
              đồng hành.
            </p>
          </div>
          <Row gutter={[14, 14]}>
            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<TeamOutlined />}
                title="Quản lý lớp học"
                description="Phân công giáo lý viên, sắp xếp thời khóa biểu và phòng học trực quan."
              />
            </Col>
            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<UserOutlined />}
                title="Sơ yếu học sinh"
                description="Lưu trữ hồ sơ, tên thánh, phụ huynh và tiến trình linh đạo từng em."
              />
            </Col>
            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<ScanOutlined />}
                title="Điểm danh QR"
                description="Quét mã tốc độ cao, tự động tổng hợp tỷ lệ chuyên cần hàng tuần."
                tag="Nổi bật"
              />
            </Col>
            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<PlayCircleOutlined />}
                title="Trò chơi tương tác"
                description="Kho câu hỏi Kinh Thánh, trắc nghiệm vui giúp giờ học sinh động."
              />
            </Col>
            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<BarChartOutlined />}
                title="Báo cáo kết quả"
                description="Tự động tính điểm trung bình, xuất sổ điểm và phiếu liên lạc."
              />
            </Col>
            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<TrophyOutlined />}
                title="Bảng thành tích"
                description="Tuyên dương các cá nhân, tập thể xuất sắc để tạo động lực."
              />
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <SafetyCertificateOutlined /> Điểm nổi bật
        </span>
      ),
      children: (
        <div className="faith-tab-pane">
          <div className="faith-pane-header">
            <h3>Tại sao chọn FaithEdu?</h3>
            <p>Giải pháp tối ưu hóa dành riêng cho các Giáo xứ tại Việt Nam.</p>
          </div>
          <div className="faith-highlights-grid">
            <div className="faith-hl-item">
              <div className="faith-hl-check">
                <CheckCircleFilled />
              </div>
              <div>
                <h4>Tập trung & Đồng bộ</h4>
                <p>
                  Mọi dữ liệu từ điểm danh, điểm số đến gia cảnh đều lưu trữ an
                  toàn trên Cloud.
                </p>
              </div>
            </div>
            <div className="faith-hl-item">
              <div className="faith-hl-check">
                <CheckCircleFilled />
              </div>
              <div>
                <h4>Điểm danh siêu tốc với Mã QR</h4>
                <p>
                  Tiết kiệm 15-20 phút mỗi đầu giờ học, tránh sai sót thủ công.
                </p>
              </div>
            </div>
            <div className="faith-hl-item">
              <div className="faith-hl-check">
                <CheckCircleFilled />
              </div>
              <div>
                <h4>Tương tác thế hệ Gen Z & Alpha</h4>
                <p>
                  Ứng dụng công nghệ vào bài giảng qua trò chơi giúp thiếu nhi
                  hăng hái đi học.
                </p>
              </div>
            </div>
            <div className="faith-hl-item">
              <div className="faith-hl-check">
                <CheckCircleFilled />
              </div>
              <div>
                <h4>Giao diện thân thiện mọi lứa tuổi</h4>
                <p>
                  Được thiết kế tối giản, dễ thao tác kể cả với Giáo lý viên lớn
                  tuổi.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <span>
          <HeartFilled /> Dành cho GLV
        </span>
      ),
      children: (
        <div className="faith-tab-pane">
          <div className="faith-role-banner">
            <div className="faith-role-badge">
              <RocketOutlined /> Sứ mạng đồng hành
            </div>
            <h2>"Người gieo mầm đức tin"</h2>
            <p>
              FaithEdu được xây dựng không chỉ là một công cụ quản lý, mà còn là
              người bạn đồng hành đắc lực giúp các Giáo lý viên giảm bớt gánh
              nặng hành chính, dành trọn tâm huyết cho việc giảng dạy Lời Chúa
              và yêu thương thiếu nhi.
            </p>
          </div>
          <div className="faith-footer-info">
            <div className="faith-info-link">
              <GlobalOutlined /> Website chính thức:{" "}
              <strong>giaolyso.site</strong>
            </div>
            <div className="faith-info-version">
              Phiên bản 2.5.0 • Build với HT Deverloper
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={960}
      destroyOnClose
      className="faithedu-help-modal-horizontal"
      styles={{ body: { padding: 0 } }}
    >
      <div className="faith-modal-layout">
        {/* ================= LEFT SIDEBAR (HERO) ================= */}
        <div className="faith-modal-sidebar">
          <div className="faith-sidebar-bg-glow" />

          <div className="faith-sidebar-top">
            <div className="faith-brand-badge">
              <StarOutlined /> Hệ thống Giáo lý số
            </div>
            <div className="faith-sidebar-logo">
              <img src={logoWeb} alt="FaithEdu" />
            </div>
            <h1 className="faith-sidebar-title">
              Faith<span>Edu</span>
            </h1>
            <p className="faith-sidebar-tagline">
              Số hóa giáo lý • Kết nối đức tin
            </p>
          </div>

          <div className="faith-sidebar-bottom">
            <div className="faith-sidebar-stat">
              <div className="stat-value">100%</div>
              <div className="stat-label">Tự động hóa báo cáo</div>
            </div>
            <div className="faith-sidebar-divider" />
            <div className="faith-sidebar-stat">
              <div className="stat-value">Nhanh chóng</div>
              <div className="stat-label">Điểm danh QR</div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT MAIN CONTENT ================= */}
        <div className="faith-modal-content-area">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="faith-horizontal-tabs"
          />
        </div>
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        .faithedu-help-modal-horizontal {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        .faithedu-help-modal-horizontal .ant-modal-content {
          padding: 0 !important;
          overflow: hidden;
          border-radius: 24px !important;
          background: #ffffff;
          box-shadow: 0 25px 50px -12px rgba(244, 114, 154, 0.25) !important;
        }

        .faithedu-help-modal-horizontal .ant-modal-close {
          top: 16px;
          right: 16px;
          z-index: 50;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          transition: all 0.2s;
        }

        .faithedu-help-modal-horizontal .ant-modal-close:hover {
          background: #ffe4e6;
          color: #e11d48;
        }

        /* LAYOUT MAIN */
        .faith-modal-layout {
          display: flex;
          min-height: 560px;
        }

        /* LEFT SIDEBAR */
        .faith-modal-sidebar {
          width: 310px;
          flex-shrink: 0;
          background: linear-gradient(160deg, #fff0f5 0%, #ffe4e6 50%, #fecdd3 100%);
          padding: 40px 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          border-right: 1px solid #ffe4e6;
        }

        .faith-sidebar-bg-glow {
          position: absolute;
          width: 200px;
          height: 200px;
          background: rgba(244, 114, 154, 0.2);
          filter: blur(50px);
          border-radius: 50%;
          top: -50px;
          left: -50px;
          pointer-events: none;
        }

        .faith-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          color: #be123c;
          border: 1px solid rgba(255, 255, 255, 0.8);
          margin-bottom: 24px;
        }

        .faith-sidebar-logo {
          width: 72px;
          height: 72px;
          background: #ffffff;
          border-radius: 20px;
          padding: 10px;
          box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.15);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .faith-sidebar-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .faith-sidebar-title {
          font-size: 32px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
          margin: 0 0 8px 0;
          letter-spacing: -1px;
        }

        .faith-sidebar-title span {
          color: #e11d48;
        }

        .faith-sidebar-tagline {
          font-size: 13px;
          font-weight: 600;
          color: #9f1239;
          margin: 0;
          line-height: 1.4;
        }

        .faith-sidebar-bottom {
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(255, 255, 255, 0.6);
        }

        .faith-sidebar-stat {
          flex: 1;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 800;
          color: #be123c;
        }

        .stat-label {
          font-size: 10px;
          font-weight: 600;
          color: #881337;
        }

        .faith-sidebar-divider {
          width: 1px;
          height: 28px;
          background: #fecdd3;
          margin: 0 12px;
        }

        /* RIGHT CONTENT AREA */
        .faith-modal-content-area {
          flex: 1;
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }

        /* TABS OVERRIDE */
        .faith-horizontal-tabs .ant-tabs-nav {
          margin-bottom: 20px !important;
        }

        .faith-horizontal-tabs .ant-tabs-tab {
          padding: 8px 12px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #64748b !important;
          transition: all 0.2s;
        }

        .faith-horizontal-tabs .ant-tabs-tab-active {
          color: #e11d48 !important;
        }

        .faith-horizontal-tabs .ant-tabs-ink-bar {
          background: #e11d48 !important;
          height: 3px !important;
          border-radius: 3px !important;
        }

        /* PANE HEADER */
        .faith-pane-header {
          margin-bottom: 18px;
        }

        .faith-pane-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .faith-pane-header p {
          font-size: 12.5px;
          color: #64748b;
          margin: 0;
        }

        /* CARDS */
        .faith-h-card {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid #f1f5f9;
          background: #f8fafc;
          height: 100%;
          transition: all 0.2s ease;
        }

        .faith-h-card:hover {
          background: #ffffff;
          border-color: #fecdd3;
          box-shadow: 0 10px 20px -5px rgba(244, 114, 154, 0.12);
          transform: translateY(-2px);
        }

        .faith-h-card-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #ffe4e6;
          color: #e11d48;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .faith-h-card-body {
          flex: 1;
          min-width: 0;
        }

        .faith-h-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .faith-h-card-title {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
        }

        .faith-h-card-tag {
          font-size: 9px !important;
          line-height: 14px !important;
          padding: 0 6px !important;
          border-radius: 10px !important;
        }

        .faith-h-card-desc {
          font-size: 11.5px;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }

        /* HIGHLIGHTS TAB */
        .faith-highlights-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faith-hl-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          background: #fff1f2;
          border-radius: 12px;
          border: 1px solid #ffe4e6;
        }

        .faith-hl-check {
          color: #e11d48;
          font-size: 18px;
          margin-top: 1px;
        }

        .faith-hl-item h4 {
          font-size: 13.5px;
          font-weight: 700;
          color: #9f1239;
          margin: 0 0 2px 0;
        }

        .faith-hl-item p {
          font-size: 12px;
          color: #475569;
          margin: 0;
        }

        /* ROLE TAB */
        .faith-role-banner {
          background: linear-gradient(135deg, #fff1f2 0%, #fff0f5 100%);
          border: 1px dashed #fecdd3;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .faith-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #be123c;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .faith-role-banner h2 {
          font-size: 20px;
          font-weight: 800;
          color: #881337;
          margin: 0 0 10px 0;
        }

        .faith-role-banner p {
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        .faith-footer-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
          font-size: 12px;
          color: #64748b;
        }

        .faith-info-link {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .faith-info-link strong {
          color: #e11d48;
        }

        /* RESPONSIVE MOBILE */
        @media (max-width: 768px) {
          .faith-modal-layout {
            flex-direction: column;
          }

          .faith-modal-sidebar {
            width: 100%;
            padding: 24px;
          }

          .faith-sidebar-bottom {
            margin-top: 16px;
          }

          .faith-modal-content-area {
            padding: 20px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default HelpModalCate;
