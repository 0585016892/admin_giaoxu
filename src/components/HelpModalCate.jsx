import React from "react";
import { Modal, Row, Col, Divider } from "antd";

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
} from "@ant-design/icons";

import logoWeb from "../assets/images/logoweb.png";

const HelpModal = ({ open, onClose }) => {
  const FeatureCard = ({ icon, title, description }) => (
    <div className="faith-feature-card">
      <div className="faith-feature-icon">{icon}</div>

      <div className="faith-feature-content">
        <div className="faith-feature-title">{title}</div>

        <div className="faith-feature-description">{description}</div>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={900}
      destroyOnClose
      className="faithedu-help-modal"
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      {/* =====================================================
          HERO
      ===================================================== */}
      <div className="faith-hero">
        <div className="faith-hero-decoration faith-hero-decoration-1" />
        <div className="faith-hero-decoration faith-hero-decoration-2" />
        <div className="faith-hero-decoration faith-hero-decoration-3" />

        <div className="faith-hero-logo">
          <img src={logoWeb} alt="FaithEdu" />
        </div>

        <div className="faith-hero-content">
          <div className="faith-hero-title">Chào mừng đến với FaithEdu</div>

          <div className="faith-hero-subtitle">
            Số hóa giáo lý, kết nối đức tin
          </div>

          <p>
            FaithEdu là nền tảng hỗ trợ số hóa và quản lý hoạt động giáo lý
            trong giáo xứ, giúp giáo lý viên quản lý lớp học, học sinh và quá
            trình học tập thuận tiện hơn.
          </p>
        </div>
      </div>

      <Divider />

      {/* =====================================================
          TỔNG QUAN
      ===================================================== */}
      <div className="faith-section">
        <div className="faith-section-title">
          <div className="faith-title-icon">
            <BookOutlined />
          </div>

          <span>FaithEdu giúp bạn làm gì?</span>
        </div>

        <p className="faith-section-description">
          FaithEdu giúp giáo lý viên giảm bớt những công việc quản lý thủ công
          và có thêm thời gian để tập trung vào việc giảng dạy, đồng hành cùng
          các em.
        </p>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <FeatureCard
              icon={<TeamOutlined />}
              title="Quản lý lớp học"
              description="Quản lý các lớp giáo lý, thông tin lớp học và giáo lý viên phụ trách."
            />
          </Col>

          <Col xs={24} md={12}>
            <FeatureCard
              icon={<UserOutlined />}
              title="Quản lý học sinh"
              description="Theo dõi danh sách học sinh và thông tin học tập của từng em."
            />
          </Col>

          <Col xs={24} md={12}>
            <FeatureCard
              icon={<ScanOutlined />}
              title="Điểm danh bằng QR"
              description="Mỗi học sinh có một mã QR riêng giúp điểm danh nhanh chóng và chính xác."
            />
          </Col>

          <Col xs={24} md={12}>
            <FeatureCard
              icon={<PlayCircleOutlined />}
              title="Học tập tương tác"
              description="Tạo trải nghiệm học giáo lý sinh động thông qua các trò chơi tương tác."
            />
          </Col>

          <Col xs={24} md={12}>
            <FeatureCard
              icon={<BarChartOutlined />}
              title="Kết quả học tập"
              description="Theo dõi kết quả học tập và quá trình tiến bộ của học sinh."
            />
          </Col>

          <Col xs={24} md={12}>
            <FeatureCard
              icon={<TrophyOutlined />}
              title="Bảng thành tích"
              description="Ghi nhận sự cố gắng và tạo động lực học tập cho các em."
            />
          </Col>
        </Row>
      </div>

      <Divider />

      {/* =====================================================
          ĐIỂM NỔI BẬT
      ===================================================== */}
      <div className="faith-section faith-highlight-section">
        <div className="faith-section-title">
          <div className="faith-title-icon pink">
            <SafetyCertificateOutlined />
          </div>

          <span>Điểm nổi bật</span>
        </div>

        <div className="faith-check-list">
          <div>
            <CheckCircleFilled />
            <span>Quản lý giáo lý tập trung trên một nền tảng.</span>
          </div>

          <div>
            <CheckCircleFilled />
            <span>Điểm danh học sinh nhanh chóng bằng mã QR.</span>
          </div>

          <div>
            <CheckCircleFilled />
            <span>Hỗ trợ nhiều hình thức học tập và trò chơi tương tác.</span>
          </div>

          <div>
            <CheckCircleFilled />
            <span>Theo dõi kết quả và thành tích học tập của học sinh.</span>
          </div>

          <div>
            <CheckCircleFilled />
            <span>Giúp giáo lý viên tiết kiệm thời gian quản lý.</span>
          </div>
        </div>
      </div>

      <Divider />

      {/* =====================================================
          DÀNH CHO GIÁO LÝ VIÊN
      ===================================================== */}
      <div className="faith-role-box">
        <div className="faith-role-logo">
          <img src={logoWeb} alt="FaithEdu" />
        </div>

        <div className="faith-role-content">
          <div className="faith-role-title">Dành cho giáo lý viên</div>

          <div className="faith-role-description">
            FaithEdu được xây dựng với mục tiêu trở thành công cụ hỗ trợ giáo lý
            viên trong công tác giảng dạy, quản lý lớp học và đồng hành cùng học
            sinh.
          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <div className="faith-footer">
        <div className="faith-footer-decoration faith-footer-decoration-1" />
        <div className="faith-footer-decoration faith-footer-decoration-2" />

        <div className="faith-footer-brand">
          <div className="faith-footer-logo">
            <img src={logoWeb} alt="FaithEdu" />
          </div>

          <span>FaithEdu</span>
        </div>

        <div className="faith-footer-slogan">
          Số hóa giáo lý, kết nối đức tin.
        </div>

        <div className="faith-footer-domain">giaolyso.site</div>
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}
      <style>{`
        /* =====================================================
           MODAL
        ===================================================== */

        .faithedu-help-modal .ant-modal-content {
          padding: 0 !important;
          overflow: hidden;

          border-radius: 26px !important;

          background: #fffdfd;

          box-shadow:
            0 30px 80px rgba(189, 115, 145, 0.20),
            0 10px 30px rgba(180, 130, 150, 0.10);
        }

        .faithedu-help-modal .ant-modal-close {
          top: 16px;
          right: 16px;

          z-index: 30;

          width: 34px;
          height: 34px;

          border-radius: 50%;

          background: rgba(255, 255, 255, 0.88);

          color: #c9839d;

          transition: all 0.2s ease;
        }

        .faithedu-help-modal .ant-modal-close:hover {
          background: #ffffff;

          color: #b96786;

          transform: scale(1.05);
        }

        /* =====================================================
           HERO
        ===================================================== */

        .faith-hero {
          position: relative;

          display: flex;
          align-items: center;

          gap: 22px;

          min-height: 175px;

          padding: 32px 42px;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 8% 15%,
              rgba(255,255,255,.95) 0,
              rgba(255,255,255,0) 28%
            ),
            radial-gradient(
              circle at 90% 10%,
              rgba(255,218,231,.85) 0,
              rgba(255,218,231,0) 32%
            ),
            linear-gradient(
              135deg,
              #fff6f9 0%,
              #fffaf5 50%,
              #fff0f5 100%
            );

          border-bottom: 1px solid #f5dfe6;
        }

        .faith-hero::before {
          content: "";

          position: absolute;

          width: 260px;
          height: 260px;

          right: -120px;
          bottom: -180px;

          border-radius: 50%;

          background: rgba(246, 194, 211, 0.22);
        }

        .faith-hero::after {
          content: "";

          position: absolute;

          width: 110px;
          height: 110px;

          left: -55px;
          top: -55px;

          border-radius: 50%;

          border: 1px solid rgba(224, 157, 180, 0.25);
        }

        /* =====================================================
           HERO LOGO
        ===================================================== */

        .faith-hero-logo {
          position: relative;

          z-index: 5;

          width: 82px;
          height: 82px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 10px;

          border-radius: 24px;

          background: rgba(255,255,255,.9);

          border: 1px solid #f1cad7;

          box-shadow:
            0 10px 24px rgba(206, 125, 153, 0.14);
        }

        .faith-hero-logo img {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: contain;
        }

        /* =====================================================
           HERO CONTENT
        ===================================================== */

        .faith-hero-content {
          position: relative;

          z-index: 5;
        }

        .faith-hero-title {
          margin-bottom: 5px;

          color: #70465a;

          font-size: 27px;
          font-weight: 800;

          letter-spacing: -0.5px;
        }

        .faith-hero-subtitle {
          display: inline-flex;

          align-items: center;

          margin-bottom: 9px;

          color: #cc7898;

          font-size: 14px;
          font-weight: 700;
        }

        .faith-hero-subtitle::before {
          content: "";

          width: 24px;
          height: 2px;

          margin-right: 8px;

          border-radius: 10px;

          background: #df9bb2;
        }

        .faith-hero-content p {
          max-width: 670px;

          margin: 0;

          color: #806e77;

          font-size: 13.5px;

          line-height: 1.7;
        }

        /* =====================================================
           DECORATION
        ===================================================== */

        .faith-hero-decoration {
          position: absolute;

          pointer-events: none;

          border-radius: 50%;
        }

        .faith-hero-decoration-1 {
          width: 9px;
          height: 9px;

          right: 155px;
          top: 28px;

          background: #e4bd6e;

          opacity: .7;
        }

        .faith-hero-decoration-2 {
          width: 6px;
          height: 6px;

          right: 110px;
          top: 55px;

          background: #dfa0b7;

          opacity: .65;
        }

        .faith-hero-decoration-3 {
          width: 14px;
          height: 14px;

          right: 58px;
          bottom: 28px;

          border: 2px solid #e5b7c7;

          opacity: .65;
        }

        /* =====================================================
           DIVIDER
        ===================================================== */

        .faithedu-help-modal .ant-divider {
          margin: 0;

          border-color: #f4e4e9;
        }

        /* =====================================================
           SECTION
        ===================================================== */

        .faith-section {
          padding: 26px 34px 28px;
        }

        .faith-section-title {
          display: flex;
          align-items: center;

          gap: 10px;

          margin-bottom: 9px;

          color: #70495a;

          font-size: 18px;
          font-weight: 800;
        }

        .faith-title-icon {
          width: 36px;
          height: 36px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: #fff0f5;

          border: 1px solid #f2d4df;

          color: #cf7898;

          font-size: 17px;
        }

        .faith-title-icon.pink {
          background: #fff1f5;

          color: #d384a0;
        }

        .faith-section-description {
          margin: 0 0 20px;

          color: #8b787f;

          font-size: 13.5px;

          line-height: 1.65;
        }

        /* =====================================================
           FEATURE CARDS
        ===================================================== */

        .faith-feature-card {
          position: relative;

          display: flex;
          align-items: flex-start;

          gap: 13px;

          height: 100%;

          padding: 16px;

          border: 1px solid #f1dfe5;

          border-radius: 18px;

          background: #ffffff;

          box-shadow:
            0 5px 16px rgba(211, 139, 164, 0.055);

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease;
        }

        .faith-feature-card:hover {
          transform: translateY(-3px);

          border-color: #ebbed0;

          box-shadow:
            0 12px 25px rgba(208, 123, 153, 0.12);
        }

        .faith-feature-card::after {
          content: "";

          position: absolute;

          right: 12px;
          top: 10px;

          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #e7bdca;

          opacity: .7;
        }

        .faith-feature-icon {
          width: 44px;
          height: 44px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          background:
            linear-gradient(
              145deg,
              #fff4f7,
              #ffe9f1
            );

          border: 1px solid #f2d2de;

          color: #ce7897;

          font-size: 20px;
        }

        .faith-feature-title {
          margin-bottom: 4px;

          color: #765162;

          font-size: 14px;
          font-weight: 800;
        }

        .faith-feature-description {
          color: #8c7981;

          font-size: 12.5px;

          line-height: 1.6;
        }

        /* =====================================================
           HIGHLIGHT
        ===================================================== */

        .faith-check-list {
          display: flex;

          flex-direction: column;

          gap: 11px;

          padding: 17px 19px;

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              #fff8fa,
              #fffaf6
            );

          border: 1px solid #f3e0e6;
        }

        .faith-check-list > div {
          display: flex;
          align-items: center;

          gap: 10px;

          color: #7f6d75;

          font-size: 13.5px;
        }

        .faith-check-list .anticon {
          flex-shrink: 0;

          color: #dc8ba7;

          font-size: 16px;
        }

        /* =====================================================
           ROLE BOX
        ===================================================== */

        .faith-role-box {
          display: flex;
          align-items: center;

          gap: 16px;

          margin: 25px 34px;

          padding: 18px 20px;

          border: 1px solid #f0d9e1;

          border-radius: 20px;

          background:
            linear-gradient(
              135deg,
              #fff7fa,
              #fffaf5
            );

          box-shadow:
            0 6px 18px rgba(211, 135, 160, 0.07);
        }

        .faith-role-logo {
          width: 56px;
          height: 56px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 7px;

          border-radius: 17px;

          background: #ffffff;

          border: 1px solid #f0d0dc;

          box-shadow:
            0 5px 12px rgba(211, 130, 158, .09);
        }

        .faith-role-logo img {
          width: 100%;
          height: 100%;

          object-fit: contain;
        }

        .faith-role-title {
          margin-bottom: 5px;

          color: #71495a;

          font-size: 15px;
          font-weight: 800;
        }

        .faith-role-description {
          color: #88757d;

          font-size: 13px;

          line-height: 1.65;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .faith-footer {
          position: relative;

          overflow: hidden;

          padding: 25px 20px 23px;

          text-align: center;

          background:
            radial-gradient(
              circle at 15% 80%,
              rgba(255,255,255,.65),
              transparent 25%
            ),
            linear-gradient(
              135deg,
              #fff0f5,
              #ffe7ef
            );

          border-top: 1px solid #f3d9e1;
        }

        .faith-footer-decoration {
          position: absolute;

          width: 90px;
          height: 90px;

          border: 1px solid rgba(215, 137, 163, .16);

          border-radius: 50%;

          pointer-events: none;
        }

        .faith-footer-decoration-1 {
          left: -45px;
          top: -45px;
        }

        .faith-footer-decoration-2 {
          right: -45px;
          bottom: -45px;
        }

        .faith-footer-brand {
          position: relative;

          z-index: 2;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 9px;

          color: #70475a;

          font-size: 22px;
          font-weight: 900;
        }

        .faith-footer-logo {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 4px;

          border-radius: 10px;

          background: #ffffff;

          border: 1px solid #f1d2dc;

          box-shadow:
            0 4px 10px rgba(208, 125, 151, .10);
        }

        .faith-footer-logo img {
          width: 100%;
          height: 100%;

          object-fit: contain;
        }

        .faith-footer-slogan {
          position: relative;

          z-index: 2;

          margin-top: 6px;

          color: #c17693;

          font-size: 13px;

          font-weight: 700;
        }

        .faith-footer-domain {
          position: relative;

          z-index: 2;

          margin-top: 5px;

          color: #b69aa4;

          font-size: 11.5px;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 576px) {
          .faithedu-help-modal .ant-modal-content {
            border-radius: 20px !important;
          }

          .faith-hero {
            flex-direction: column;

            text-align: center;

            padding: 30px 22px 26px;
          }

          .faith-hero-logo {
            width: 70px;
            height: 70px;
          }

          .faith-hero-title {
            font-size: 21px;
          }

          .faith-hero-subtitle {
            justify-content: center;

            font-size: 12.5px;
          }

          .faith-hero-content p {
            font-size: 13px;
          }

          .faith-section {
            padding: 22px 20px;
          }

          .faith-role-box {
            margin: 20px;
            padding: 16px;
          }

          .faith-role-logo {
            width: 50px;
            height: 50px;
          }

          .faith-role-description {
            font-size: 12.5px;
          }

          .faith-feature-card {
            padding: 14px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default HelpModal;
