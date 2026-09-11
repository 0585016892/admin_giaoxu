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

  // ============================================================
  // FEATURE CARD
  // ============================================================

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

  // ============================================================
  // TAB ITEMS
  // ============================================================

  const tabItems = [
    {
      key: "1",

      label: (
        <span className="faith-tab-label">
          <BookOutlined />
          <span>Tính năng chính</span>
        </span>
      ),

      children: (
        <div className="faith-tab-pane">
          <div className="faith-pane-header">
            <div className="faith-pane-kicker">
              <BookOutlined />
              HỆ SINH THÁI GIÁO LÝ
            </div>

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
        <span className="faith-tab-label">
          <SafetyCertificateOutlined />
          <span>Điểm nổi bật</span>
        </span>
      ),

      children: (
        <div className="faith-tab-pane">
          <div className="faith-pane-header">
            <div className="faith-pane-kicker">
              <StarOutlined />
              TRẢI NGHIỆM FAITHEDU
            </div>

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
        <span className="faith-tab-label">
          <HeartFilled />
          <span>Dành cho GLV</span>
        </span>
      ),

      children: (
        <div className="faith-tab-pane">
          <div className="faith-role-banner">
            <div className="faith-role-top">
              <div className="faith-role-badge">
                <RocketOutlined />
                SỨ MẠNG ĐỒNG HÀNH
              </div>

              <div className="faith-role-decoration">
                <HeartFilled />
              </div>
            </div>

            <h2>"Người gieo mầm đức tin"</h2>

            <p>
              FaithEdu được xây dựng không chỉ là một công cụ quản lý, mà còn là
              người bạn đồng hành đắc lực giúp các Giáo lý viên giảm bớt gánh
              nặng hành chính, dành trọn tâm huyết cho việc giảng dạy Lời Chúa
              và yêu thương thiếu nhi.
            </p>

            <div className="faith-role-points">
              <div>
                <CheckCircleFilled />
                Giảm gánh nặng hành chính
              </div>

              <div>
                <CheckCircleFilled />
                Tập trung vào giảng dạy
              </div>

              <div>
                <CheckCircleFilled />
                Đồng hành cùng thiếu nhi
              </div>
            </div>
          </div>

          <div className="faith-footer-info">
            <div className="faith-info-link">
              <GlobalOutlined />

              <span>Website chính thức:</span>

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
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={1000}
        destroyOnClose
        className="faithedu-help-modal-horizontal"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div className="faith-modal-layout">
          {/* =====================================================
              LEFT SIDEBAR
          ===================================================== */}

          <aside className="faith-modal-sidebar">
            <div className="faith-sidebar-decoration decoration-one" />
            <div className="faith-sidebar-decoration decoration-two" />

            <div className="faith-sidebar-top">
              <div className="faith-brand-badge">
                <StarOutlined />
                HỆ THỐNG GIÁO LÝ SỐ
              </div>

              <div className="faith-sidebar-logo">
                <img src={logoWeb} alt="FaithEdu" />
              </div>

              <h1 className="faith-sidebar-title">
                Faith
                <span>Edu</span>
              </h1>

              <p className="faith-sidebar-tagline">
                Số hóa giáo lý
                <span>•</span>
                Kết nối đức tin
              </p>

              <div className="faith-sidebar-line">
                <span />
              </div>

              <p className="faith-sidebar-description">
                Nền tảng hỗ trợ Giáo xứ quản lý giáo lý, lớp học và đồng hành
                cùng các em thiếu nhi.
              </p>
            </div>

            <div className="faith-sidebar-bottom">
              <div className="faith-sidebar-stat">
                <div className="stat-icon">
                  <BarChartOutlined />
                </div>

                <div>
                  <div className="stat-value">100%</div>

                  <div className="stat-label">Tự động hóa báo cáo</div>
                </div>
              </div>

              <div className="faith-sidebar-divider" />

              <div className="faith-sidebar-stat">
                <div className="stat-icon">
                  <ScanOutlined />
                </div>

                <div>
                  <div className="stat-value stat-text">Nhanh chóng</div>

                  <div className="stat-label">Điểm danh QR</div>
                </div>
              </div>
            </div>
          </aside>

          {/* =====================================================
              RIGHT CONTENT
          ===================================================== */}

          <main className="faith-modal-content-area">
            <div className="faith-content-top">
              <div className="faith-content-heading">
                <span>KHÁM PHÁ FAITHEDU</span>

                <div />
              </div>

              <div className="faith-content-title">
                Đồng hành cùng Giáo lý viên
              </div>
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              className="faith-horizontal-tabs"
            />

            <div className="faith-content-bottom">
              <SafetyCertificateOutlined />

              <span>Thiết kế dành riêng cho cộng đoàn giáo lý Việt Nam</span>
            </div>
          </main>
        </div>
      </Modal>

      {/* ==========================================================
          STYLES
      ========================================================== */}

      <style>
        {`
          /* ======================================================
             MODAL
          ====================================================== */

          .faithedu-help-modal-horizontal {
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Roboto,
              sans-serif;
          }

          .faithedu-help-modal-horizontal
          .ant-modal-content {
            padding: 0 !important;
            overflow: hidden;

            border-radius: 26px !important;

            background: #ffffff;

            box-shadow:
              0 24px 70px
              rgba(15, 53, 85, 0.22) !important;
          }

          .faithedu-help-modal-horizontal
          .ant-modal-close {
            top: 14px;
            right: 14px;

            z-index: 100;

            width: 34px;
            height: 34px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background: #f8fafc;

            color: #64748b;

            transition:
              all 0.2s ease;
          }

          .faithedu-help-modal-horizontal
          .ant-modal-close:hover {
            background: #ffe4e6;
            color: #e11d48;
          }

          /* ======================================================
             MAIN LAYOUT
          ====================================================== */

          .faith-modal-layout {
            display: flex;

            width: 100%;
            min-height: 580px;

            background: #ffffff;
          }

          /* ======================================================
             LEFT SIDEBAR
          ====================================================== */

          .faith-modal-sidebar {
            position: relative;

            width: 310px;
            min-width: 310px;

            padding:
              34px 28px 26px;

            display: flex;
            flex-direction: column;
            justify-content: space-between;

            overflow: hidden;

            background:
              linear-gradient(
                155deg,
                #fff7fa 0%,
                #fff0f4 42%,
                #ffe4e9 100%
              );

            border-right:
              1px solid #fce0e6;
          }

          .faith-sidebar-decoration {
            position: absolute;

            border-radius: 50%;

            pointer-events: none;
          }

          .decoration-one {
            width: 190px;
            height: 190px;

            top: -90px;
            right: -75px;

            background:
              rgba(244, 114, 154, 0.13);
          }

          .decoration-two {
            width: 140px;
            height: 140px;

            bottom: -65px;
            left: -55px;

            background:
              rgba(225, 29, 72, 0.07);
          }

          .faith-sidebar-top {
            position: relative;
            z-index: 2;
          }

          .faith-brand-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;

            padding:
              6px 10px;

            margin-bottom: 25px;

            border-radius: 999px;

            background:
              rgba(255,255,255,0.78);

            border:
              1px solid #fbcfd8;

            color:
              #be123c;

            font-size: 9px;
            font-weight: 800;

            letter-spacing: 0.4px;
          }

          .faith-sidebar-logo {
            width: 68px;
            height: 68px;

            margin-bottom: 17px;

            padding: 10px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 18px;

            background: #ffffff;

            border:
              1px solid #fce7eb;

            box-shadow:
              0 10px 25px
              rgba(190, 18, 60, 0.10);
          }

          .faith-sidebar-logo img {
            width: 100%;
            height: 100%;

            object-fit: contain;
          }

          .faith-sidebar-title {
            margin: 0;

            color: #0f172a;

            font-family:
              Georgia,
              "Times New Roman",
              serif;

            font-size: 34px;
            font-weight: 800;

            line-height: 1;

            letter-spacing: -1.2px;
          }

          .faith-sidebar-title span {
            color: #e11d48;
          }

          .faith-sidebar-tagline {
            margin:
              9px 0 0;

            display: flex;
            align-items: center;
            gap: 7px;

            color: #9f1239;

            font-size: 11px;
            font-weight: 700;
          }

          .faith-sidebar-tagline span {
            color: #e11d48;
          }

          .faith-sidebar-line {
            width: 100%;

            margin:
              21px 0 18px;

            display: flex;
            align-items: center;
          }

          .faith-sidebar-line span {
            width: 48px;
            height: 3px;

            border-radius: 99px;

            background:
              #e11d48;
          }

          .faith-sidebar-description {
            max-width: 220px;

            margin: 0;

            color: #64748b;

            font-size: 11px;
            line-height: 1.7;
          }

          /* ======================================================
             SIDEBAR BOTTOM
          ====================================================== */

          .faith-sidebar-bottom {
            position: relative;
            z-index: 2;

            display: flex;
            align-items: center;

            padding:
              13px 12px;

            border-radius: 15px;

            background:
              rgba(255,255,255,0.68);

            border:
              1px solid
              rgba(255,255,255,0.9);
          }

          .faith-sidebar-stat {
            flex: 1;

            display: flex;
            align-items: center;
            gap: 8px;

            min-width: 0;
          }

          .stat-icon {
            width: 30px;
            height: 30px;

            flex: 0 0 30px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 9px;

            background: #ffe4e6;

            color: #e11d48;

            font-size: 14px;
          }

          .stat-value {
            color: #be123c;

            font-size: 12px;
            font-weight: 800;

            line-height: 1.2;
          }

          .stat-text {
            font-size: 10px;
          }

          .stat-label {
            margin-top: 2px;

            color: #881337;

            font-size: 8px;
            font-weight: 600;

            white-space: nowrap;
          }

          .faith-sidebar-divider {
            width: 1px;
            height: 30px;

            margin:
              0 10px;

            background:
              #fecdd3;
          }

          /* ======================================================
             RIGHT CONTENT
          ====================================================== */

          .faith-modal-content-area {
            flex: 1;
            min-width: 0;

            padding:
              27px 34px 18px;

            display: flex;
            flex-direction: column;

            background: #ffffff;
          }

          .faith-content-top {
            padding-right: 30px;

            margin-bottom: 6px;
          }

          .faith-content-heading {
            display: flex;
            align-items: center;
            gap: 9px;

            color: #be123c;

            font-size: 8px;
            font-weight: 800;

            letter-spacing: 1.3px;
          }

          .faith-content-heading div {
            width: 32px;
            height: 2px;

            border-radius: 99px;

            background: #fecdd3;
          }

          .faith-content-title {
            margin-top: 5px;

            color: #0f172a;

            font-family:
              Georgia,
              "Times New Roman",
              serif;

            font-size: 19px;
            font-weight: 800;
          }

          /* ======================================================
             TABS
          ====================================================== */

          .faith-horizontal-tabs {
            flex: 1;

            display: flex;
            flex-direction: column;
          }

          .faith-horizontal-tabs
          .ant-tabs-nav {
            margin:
              10px 0 18px !important;
          }

          .faith-horizontal-tabs
          .ant-tabs-nav::before {
            border-bottom:
              1px solid #f1f5f9 !important;
          }

          .faith-horizontal-tabs
          .ant-tabs-tab {
            padding:
              9px 12px !important;

            margin:
              0 8px 0 0 !important;

            color:
              #64748b !important;

            font-size: 11px !important;
            font-weight: 700 !important;

            border-radius: 9px;

            transition:
              all 0.2s ease;
          }

          .faith-horizontal-tabs
          .ant-tabs-tab:hover {
            color:
              #e11d48 !important;

            background:
              #fff5f7;
          }

          .faith-horizontal-tabs
          .ant-tabs-tab-active {
            color:
              #e11d48 !important;
          }

          .faith-horizontal-tabs
          .ant-tabs-ink-bar {
            height: 3px !important;

            border-radius:
              99px !important;

            background:
              #e11d48 !important;
          }

          .faith-tab-label {
            display: inline-flex;
            align-items: center;
            gap: 7px;
          }

          .faith-tab-label svg {
            font-size: 14px;
          }

          .faith-horizontal-tabs
          .ant-tabs-content-holder {
            flex: 1;
          }

          /* ======================================================
             PANE
          ====================================================== */

          .faith-tab-pane {
            width: 100%;
          }

          .faith-pane-header {
            margin-bottom: 17px;
          }

          .faith-pane-kicker {
            display: flex;
            align-items: center;
            gap: 6px;

            margin-bottom: 5px;

            color: #e11d48;

            font-size: 8px;
            font-weight: 800;

            letter-spacing: 0.8px;
          }

          .faith-pane-kicker svg {
            font-size: 11px;
          }

          .faith-pane-header h3 {
            margin:
              0 0 4px;

            color: #0f172a;

            font-size: 18px;
            font-weight: 800;

            line-height: 1.25;
          }

          .faith-pane-header p {
            margin: 0;

            color: #64748b;

            font-size: 11px;
            line-height: 1.5;
          }

          /* ======================================================
             FEATURE CARDS
          ====================================================== */

          .faith-h-card {
            height: 100%;

            display: flex;
            align-items: flex-start;

            gap: 11px;

            padding:
              12px;

            border-radius: 13px;

            border:
              1px solid #edf1f5;

            background:
              #fafbfc;

            transition:
              all 0.22s ease;
          }

          .faith-h-card:hover {
            transform:
              translateY(-2px);

            border-color:
              #fecdd3;

            background:
              #ffffff;

            box-shadow:
              0 8px 20px
              rgba(225,29,72,0.08);
          }

          .faith-h-card-icon {
            width: 37px;
            height: 37px;

            flex: 0 0 37px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 10px;

            background:
              #ffe4e6;

            color:
              #e11d48;

            font-size: 16px;
          }

          .faith-h-card-body {
            flex: 1;
            min-width: 0;
          }

          .faith-h-card-header {
            display: flex;
            align-items: center;
            gap: 6px;

            margin-bottom: 3px;
          }

          .faith-h-card-title {
            color: #1e293b;

            font-size: 11.5px;
            font-weight: 800;

            line-height: 1.3;
          }

          .faith-h-card-tag {
            margin: 0 !important;

            padding:
              0 6px !important;

            border-radius: 99px !important;

            font-size: 7.5px !important;
            line-height: 14px !important;
          }

          .faith-h-card-desc {
            margin: 0;

            color: #64748b;

            font-size: 9.5px;

            line-height: 1.5;
          }

          /* ======================================================
             HIGHLIGHTS
          ====================================================== */

          .faith-highlights-grid {
            display: grid;

            grid-template-columns:
              1fr 1fr;

            gap: 11px;
          }

          .faith-hl-item {
            min-height: 95px;

            display: flex;
            align-items: flex-start;

            gap: 10px;

            padding:
              13px;

            border-radius: 13px;

            background:
              #fff8f9;

            border:
              1px solid #ffe4e6;

            transition:
              all 0.2s ease;
          }

          .faith-hl-item:hover {
            background: #fff1f3;

            transform:
              translateY(-1px);
          }

          .faith-hl-check {
            flex: 0 0 auto;

            color: #e11d48;

            font-size: 17px;

            margin-top: 1px;
          }

          .faith-hl-item h4 {
            margin:
              0 0 4px;

            color: #9f1239;

            font-size: 11.5px;
            font-weight: 800;

            line-height: 1.35;
          }

          .faith-hl-item p {
            margin: 0;

            color: #64748b;

            font-size: 9.5px;
            line-height: 1.5;
          }

          /* ======================================================
             ROLE BANNER
          ====================================================== */

          .faith-role-banner {
            position: relative;

            overflow: hidden;

            padding:
              23px;

            margin-bottom: 18px;

            border-radius: 17px;

            background:
              linear-gradient(
                135deg,
                #fff6f8 0%,
                #fff0f4 100%
              );

            border:
              1px solid #ffdbe3;
          }

          .faith-role-banner::after {
            content: "";

            position: absolute;

            width: 150px;
            height: 150px;

            right: -65px;
            top: -70px;

            border-radius: 50%;

            background:
              rgba(244,114,154,0.09);
          }

          .faith-role-top {
            position: relative;
            z-index: 2;

            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .faith-role-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;

            color: #be123c;

            font-size: 9px;
            font-weight: 800;

            letter-spacing: 0.8px;
          }

          .faith-role-decoration {
            width: 32px;
            height: 32px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 10px;

            background: #ffe4e6;

            color: #e11d48;

            font-size: 14px;
          }

          .faith-role-banner h2 {
            position: relative;
            z-index: 2;

            margin:
              11px 0 8px;

            color: #881337;

            font-family:
              Georgia,
              "Times New Roman",
              serif;

            font-size: 21px;
            font-weight: 800;
          }

          .faith-role-banner p {
            position: relative;
            z-index: 2;

            max-width: 670px;

            margin: 0;

            color: #475569;

            font-size: 11px;

            line-height: 1.7;
          }

          .faith-role-points {
            position: relative;
            z-index: 2;

            display: flex;
            flex-wrap: wrap;

            gap: 8px;

            margin-top: 15px;
          }

          .faith-role-points div {
            display: flex;
            align-items: center;
            gap: 5px;

            padding:
              6px 9px;

            border-radius: 8px;

            background:
              rgba(255,255,255,0.72);

            color: #9f1239;

            font-size: 8.5px;
            font-weight: 700;
          }

          .faith-role-points svg {
            color: #e11d48;
            font-size: 11px;
          }

          /* ======================================================
             FOOTER INFO
          ====================================================== */

          .faith-footer-info {
            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 15px;

            padding-top: 13px;

            border-top:
              1px solid #f1f5f9;

            color: #64748b;

            font-size: 9.5px;
          }

          .faith-info-link {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .faith-info-link svg {
            color: #e11d48;
          }

          .faith-info-link strong {
            color: #e11d48;
          }

          .faith-info-version {
            text-align: right;

            white-space: nowrap;
          }

          /* ======================================================
             CONTENT BOTTOM
          ====================================================== */

          .faith-content-bottom {
            display: flex;
            align-items: center;
            gap: 6px;

            margin-top: auto;
            padding-top: 10px;

            color: #94a3b8;

            font-size: 8.5px;
          }

          .faith-content-bottom svg {
            color: #e11d48;
            font-size: 11px;
          }

          /* ======================================================
             TABLET
          ====================================================== */

          @media (max-width: 900px) {

            .faith-modal-layout {
              min-height: 560px;
            }

            .faith-modal-sidebar {
              width: 265px;
              min-width: 265px;

              padding:
                30px 22px 22px;
            }

            .faith-modal-content-area {
              padding:
                25px 25px 17px;
            }

            .faith-sidebar-description {
              font-size: 10px;
            }

            .faith-sidebar-title {
              font-size: 30px;
            }

            .faith-highlights-grid {
              grid-template-columns:
                1fr;
            }
          }

          /* ======================================================
             MOBILE
          ====================================================== */

          @media (max-width: 768px) {

            .faithedu-help-modal-horizontal {
              width:
                calc(100vw - 20px) !important;

              max-width:
                calc(100vw - 20px) !important;

              margin: 10px auto;
            }

            .faith-modal-layout {
              flex-direction: column;

              min-height: auto;
            }

            .faith-modal-sidebar {
              width: 100%;
              min-width: 0;

              padding:
                23px 20px 18px;
            }

            .faith-brand-badge {
              margin-bottom: 16px;
            }

            .faith-sidebar-logo {
              width: 55px;
              height: 55px;

              padding: 8px;

              margin-bottom: 12px;
            }

            .faith-sidebar-title {
              font-size: 28px;
            }

            .faith-sidebar-description {
              display: none;
            }

            .faith-sidebar-line {
              margin:
                13px 0;
            }

            .faith-sidebar-bottom {
              margin-top: 18px;
            }

            .faith-modal-content-area {
              padding:
                20px 17px 15px;
            }

            .faith-content-top {
              padding-right: 30px;
            }

            .faith-content-title {
              font-size: 17px;
            }

            .faith-horizontal-tabs
            .ant-tabs-nav {
              overflow-x: auto;

              scrollbar-width: none;
            }

            .faith-horizontal-tabs
            .ant-tabs-nav::-webkit-scrollbar {
              display: none;
            }

            .faith-horizontal-tabs
            .ant-tabs-tab {
              white-space: nowrap;
            }

            .faith-highlights-grid {
              grid-template-columns:
                1fr;
            }

            .faith-role-banner {
              padding: 17px;
            }

            .faith-role-banner h2 {
              font-size: 18px;
            }

            .faith-role-banner p {
              font-size: 10px;
            }

            .faith-role-points {
              flex-direction: column;
            }

            .faith-footer-info {
              flex-direction: column;
              align-items: flex-start;
            }

            .faith-info-version {
              text-align: left;
            }

            .faith-content-bottom {
              display: none;
            }
          }

          /* ======================================================
             VERY SMALL MOBILE
          ====================================================== */

          @media (max-width: 430px) {

            .faith-sidebar-bottom {
              padding:
                10px;
            }

            .faith-sidebar-stat {
              gap: 6px;
            }

            .stat-icon {
              width: 27px;
              height: 27px;
              flex-basis: 27px;
            }

            .stat-label {
              font-size: 7px;
            }

            .faith-horizontal-tabs
            .ant-tabs-tab {
              padding:
                8px 7px !important;

              margin-right:
                3px !important;

              font-size: 9px !important;
            }

            .faith-h-card {
              padding: 10px;
            }

            .faith-h-card-icon {
              width: 34px;
              height: 34px;
              flex-basis: 34px;
            }
          }
        `}
      </style>
    </>
  );
};

export default HelpModalCate;
