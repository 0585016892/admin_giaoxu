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
  ArrowRightOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import logoWeb from "../assets/images/logoweb.png";

const HelpModalCate = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("1");

  // ============================================================
  // FEATURE CARD
  // ============================================================

  const FeatureCard = ({ icon, title, description, tag }) => (
    <div className="faith-feature-card">
      <div className="faith-feature-icon">{icon}</div>

      <div className="faith-feature-content">
        <div className="faith-feature-heading">
          <span className="faith-feature-title">{title}</span>

          {tag && <Tag className="faith-feature-tag">{tag}</Tag>}
        </div>

        <p>{description}</p>
      </div>

      <div className="faith-feature-arrow">
        <ArrowRightOutlined />
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
          <span>Tính năng</span>
        </span>
      ),

      children: (
        <div className="faith-tab-content">
          <div className="faith-section-intro">
            <div className="faith-section-kicker">
              <span />
              HỆ SINH THÁI GIÁO LÝ
            </div>

            <h3>
              Mọi công việc quản lý
              <br />
              trong một nền tảng
            </h3>

            <p>
              FaithEdu giúp Giáo xứ số hóa các công việc quản lý giáo lý, giảm
              thao tác thủ công và dễ dàng theo dõi hoạt động của các lớp.
            </p>
          </div>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<TeamOutlined />}
                title="Quản lý lớp học"
                description="Quản lý lớp, giáo lý viên, phòng học và phân công giảng dạy."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<UserOutlined />}
                title="Quản lý học sinh"
                description="Lưu trữ hồ sơ, thông tin gia đình và quá trình học giáo lý."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<ScanOutlined />}
                title="Điểm danh QR"
                description="Điểm danh nhanh bằng QR và tự động tổng hợp dữ liệu chuyên cần."
                tag="Nổi bật"
              />
            </Col>

            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<PlayCircleOutlined />}
                title="Hoạt động giáo lý"
                description="Tổ chức trò chơi, câu hỏi và các hoạt động tương tác cho thiếu nhi."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<BarChartOutlined />}
                title="Báo cáo"
                description="Theo dõi tình hình học tập, chuyên cần và hoạt động giáo lý."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FeatureCard
                icon={<TrophyOutlined />}
                title="Thành tích"
                description="Ghi nhận và tuyên dương các em, các lớp có thành tích tốt."
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
        <div className="faith-tab-content">
          <div className="faith-section-intro">
            <div className="faith-section-kicker">
              <span />
              TRẢI NGHIỆM FAITHEDU
            </div>

            <h3>
              Được xây dựng cho
              <br />
              cộng đoàn giáo lý
            </h3>

            <p>
              Không chỉ là một phần mềm quản lý, FaithEdu hướng tới việc trở
              thành công cụ đồng hành cùng Giáo lý viên và Giáo xứ.
            </p>
          </div>

          <div className="faith-highlights">
            <div className="faith-highlight">
              <div className="faith-highlight-number">01</div>

              <div className="faith-highlight-icon">
                <CheckCircleFilled />
              </div>

              <div>
                <h4>Tập trung dữ liệu</h4>

                <p>
                  Thông tin lớp học, học sinh, điểm danh và báo cáo được quản lý
                  tập trung.
                </p>
              </div>
            </div>

            <div className="faith-highlight">
              <div className="faith-highlight-number">02</div>

              <div className="faith-highlight-icon">
                <ScanOutlined />
              </div>

              <div>
                <h4>Điểm danh nhanh</h4>

                <p>
                  QR giúp giảm thời gian điểm danh và hạn chế sai sót khi nhập
                  dữ liệu thủ công.
                </p>
              </div>
            </div>

            <div className="faith-highlight">
              <div className="faith-highlight-number">03</div>

              <div className="faith-highlight-icon">
                <RocketOutlined />
              </div>

              <div>
                <h4>Hiện đại hóa quản lý</h4>

                <p>
                  Đưa những công việc quản lý giáo lý truyền thống lên môi
                  trường số.
                </p>
              </div>
            </div>

            <div className="faith-highlight">
              <div className="faith-highlight-number">04</div>

              <div className="faith-highlight-icon">
                <HeartFilled />
              </div>

              <div>
                <h4>Đồng hành cùng GLV</h4>

                <p>
                  Giảm bớt công việc hành chính để Giáo lý viên có thêm thời
                  gian đồng hành với các em.
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
        <div className="faith-tab-content">
          <div className="faith-role-card">
            <div className="faith-role-glow" />

            <div className="faith-role-top">
              <div className="faith-role-badge">
                <RocketOutlined />
                SỨ MẠNG ĐỒNG HÀNH
              </div>

              <div className="faith-role-cross">✦</div>
            </div>

            <h2>
              Người gieo mầm
              <br />
              <span>đức tin</span>
            </h2>

            <p>
              FaithEdu được xây dựng với mong muốn trở thành một người bạn đồng
              hành của Giáo lý viên. Những công việc quản lý thường ngày được số
              hóa để Giáo lý viên có thể dành nhiều thời gian hơn cho việc giảng
              dạy, đồng hành và yêu thương các em thiếu nhi.
            </p>

            <div className="faith-role-points">
              <div>
                <CheckCircleFilled />
                Giảm công việc hành chính
              </div>

              <div>
                <CheckCircleFilled />
                Quản lý dễ dàng hơn
              </div>

              <div>
                <CheckCircleFilled />
                Đồng hành cùng thiếu nhi
              </div>
            </div>
          </div>

          <div className="faith-role-footer">
            <div className="faith-website">
              <div className="faith-website-icon">
                <GlobalOutlined />
              </div>

              <div>
                <span>Website chính thức</span>
                <strong>giaolyso.site</strong>
              </div>
            </div>

            <div className="faith-version">
              FaithEdu 2.5.0
              <span>•</span>
              Built with HT Developer
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
        width={1050}
        destroyOnClose
        closeIcon={
          <div className="faith-modal-close">
            <CloseOutlined />
          </div>
        }
        className="faith-help-modal"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div className="faith-help-layout">
          {/* =====================================================
              SIDEBAR
          ===================================================== */}

          <aside className="faith-help-sidebar">
            <div className="faith-sidebar-orb orb-one" />
            <div className="faith-sidebar-orb orb-two" />

            <div className="faith-sidebar-content">
              <div className="faith-system-label">
                <StarOutlined />
                <span>FAITHEDU</span>
              </div>

              <div className="faith-logo-wrapper">
                <img src={logoWeb} alt="FaithEdu" />
              </div>

              <div className="faith-brand">
                <span>Faith</span>
                <strong>Edu</strong>
              </div>

              <div className="faith-brand-line">
                <span />
                <small>SỐ HÓA GIÁO LÝ</small>
              </div>

              <p className="faith-sidebar-text">
                Nền tảng quản lý giáo lý giúp Giáo xứ kết nối dữ liệu, Giáo lý
                viên và thiếu nhi trong một hệ thống thống nhất.
              </p>
            </div>

            {/* SIDEBAR STATS */}

            <div className="faith-sidebar-bottom">
              <div className="faith-side-stat">
                <div className="faith-side-stat-icon">
                  <BarChartOutlined />
                </div>

                <div>
                  <strong>Quản lý</strong>
                  <span>tập trung dữ liệu</span>
                </div>
              </div>

              <div className="faith-side-divider" />

              <div className="faith-side-stat">
                <div className="faith-side-stat-icon">
                  <ScanOutlined />
                </div>

                <div>
                  <strong>QR</strong>
                  <span>điểm danh nhanh</span>
                </div>
              </div>
            </div>
          </aside>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <main className="faith-help-content">
            <div className="faith-content-header">
              <div>
                <div className="faith-content-kicker">
                  <span />
                  KHÁM PHÁ NỀN TẢNG
                </div>

                <h1>
                  Đồng hành cùng
                  <br />
                  <span>Giáo lý viên</span>
                </h1>
              </div>

              <div className="faith-header-mark">
                <HeartFilled />
              </div>
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              className="faith-help-tabs"
            />

            <div className="faith-content-footer">
              <div className="faith-footer-message">
                <SafetyCertificateOutlined />

                <span>Thiết kế dành riêng cho cộng đoàn giáo lý Việt Nam</span>
              </div>

              <div className="faith-footer-site">giaolyso.site</div>
            </div>
          </main>
        </div>
      </Modal>

      {/* ==========================================================
          STYLES
      ========================================================== */}

      <style>{`

        /* ========================================================
           BASE
        ======================================================== */

        .faith-help-modal {
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .faith-help-modal
        .ant-modal-content {
          padding: 0 !important;

          overflow: hidden;

          border-radius: 24px !important;

          background: #ffffff;

          box-shadow:
            0 35px 90px
            rgba(15, 35, 60, 0.22) !important;
        }

        .faith-help-modal
        .ant-modal-body {
          padding: 0 !important;
        }

        .faith-modal-close {
          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: rgba(255,255,255,.95);

          color: #64748b;

          font-size: 12px;

          transition: all .2s ease;
        }

        .faith-modal-close:hover {
          color: #1b365d;

          background: #f7f3e7;
        }

        /* ========================================================
           LAYOUT
        ======================================================== */

        .faith-help-layout {
          display: flex;

          min-height: 610px;

          background: #ffffff;
        }

        /* ========================================================
           SIDEBAR
        ======================================================== */

        .faith-help-sidebar {
          position: relative;

          width: 300px;
          min-width: 300px;

          padding:
            34px 29px 25px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          overflow: hidden;

          color: #ffffff;

          background:
            linear-gradient(
              150deg,
              #102b4a 0%,
              #1b365d 55%,
              #24486f 100%
            );
        }

        .faith-sidebar-orb {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;
        }

        .orb-one {
          width: 230px;
          height: 230px;

          top: -115px;
          right: -105px;

          border:
            1px solid
            rgba(212,175,55,.18);

          background:
            rgba(212,175,55,.055);
        }

        .orb-two {
          width: 180px;
          height: 180px;

          bottom: -105px;
          left: -90px;

          border:
            1px solid
            rgba(255,255,255,.07);

          background:
            rgba(255,255,255,.025);
        }

        .faith-sidebar-content {
          position: relative;
          z-index: 2;
        }

        /* ========================================================
           SYSTEM LABEL
        ======================================================== */

        .faith-system-label {
          display: inline-flex;

          align-items: center;
          gap: 7px;

          margin-bottom: 27px;

          color: #d4af37;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 1.3px;
        }

        .faith-system-label svg {
          font-size: 11px;
        }

        /* ========================================================
           LOGO
        ======================================================== */

        .faith-logo-wrapper {
          width: 72px;
          height: 72px;

          margin-bottom: 20px;

          padding: 11px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 19px;

          background: #ffffff;

          box-shadow:
            0 12px 28px
            rgba(0,0,0,.16);
        }

        .faith-logo-wrapper img {
          width: 100%;
          height: 100%;

          object-fit: contain;
        }

        /* ========================================================
           BRAND
        ======================================================== */

        .faith-brand {
          display: flex;
          align-items: baseline;
          gap: 3px;

          color: #ffffff;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 37px;
          font-weight: 700;

          letter-spacing: -1.6px;
        }

        .faith-brand strong {
          color: #d4af37;

          font-weight: 700;
        }

        .faith-brand-line {
          display: flex;
          align-items: center;
          gap: 9px;

          margin-top: 9px;
        }

        .faith-brand-line span {
          width: 32px;
          height: 2px;

          border-radius: 99px;

          background: #d4af37;
        }

        .faith-brand-line small {
          color:
            rgba(255,255,255,.65);

          font-size: 7px;
          font-weight: 800;

          letter-spacing: 1.5px;
        }

        .faith-sidebar-text {
          max-width: 220px;

          margin:
            20px 0 0;

          color:
            rgba(255,255,255,.66);

          font-size: 11px;

          line-height: 1.8;
        }

        /* ========================================================
           SIDEBAR BOTTOM
        ======================================================== */

        .faith-sidebar-bottom {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;

          padding:
            13px 12px;

          border-radius: 14px;

          border:
            1px solid
            rgba(255,255,255,.10);

          background:
            rgba(255,255,255,.055);

          backdrop-filter: blur(8px);
        }

        .faith-side-stat {
          flex: 1;

          display: flex;
          align-items: center;

          gap: 9px;

          min-width: 0;
        }

        .faith-side-stat-icon {
          width: 31px;
          height: 31px;

          flex: 0 0 31px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            rgba(212,175,55,.13);

          color: #d4af37;

          font-size: 14px;
        }

        .faith-side-stat div:last-child {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .faith-side-stat strong {
          color: #ffffff;

          font-size: 10px;
          font-weight: 750;
        }

        .faith-side-stat span {
          color:
            rgba(255,255,255,.48);

          font-size: 8px;

          white-space: nowrap;
        }

        .faith-side-divider {
          width: 1px;
          height: 30px;

          margin:
            0 10px;

          background:
            rgba(255,255,255,.10);
        }

        /* ========================================================
           MAIN CONTENT
        ======================================================== */

        .faith-help-content {
          flex: 1;

          min-width: 0;

          padding:
            32px 35px 18px;

          display: flex;
          flex-direction: column;

          background:
            #ffffff;
        }

        /* ========================================================
           HEADER
        ======================================================== */

        .faith-content-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          margin-bottom: 4px;
        }

        .faith-content-kicker {
          display: flex;
          align-items: center;
          gap: 8px;

          color: #a17c1d;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 1.4px;
        }

        .faith-content-kicker span {
          width: 25px;
          height: 2px;

          border-radius: 99px;

          background: #d4af37;
        }

        .faith-content-header h1 {
          margin:
            8px 0 0;

          color: #172b43;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 25px;
          line-height: 1.2;

          letter-spacing: -.6px;
        }

        .faith-content-header h1 span {
          color: #1b365d;
        }

        .faith-header-mark {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background: #f7f3e7;

          color: #d4af37;

          font-size: 16px;
        }

        /* ========================================================
           TABS
        ======================================================== */

        .faith-help-tabs {
          flex: 1;

          display: flex;
          flex-direction: column;

          min-height: 0;
        }

        .faith-help-tabs
        .ant-tabs-nav {
          margin:
            18px 0 21px !important;
        }

        .faith-help-tabs
        .ant-tabs-nav::before {
          border-bottom:
            1px solid #edf1f5 !important;
        }

        .faith-help-tabs
        .ant-tabs-tab {
          padding:
            9px 13px !important;

          margin:
            0 5px 0 0 !important;

          border-radius: 9px;

          color: #64748b !important;

          font-size: 11px !important;
          font-weight: 700 !important;

          transition:
            all .2s ease;
        }

        .faith-help-tabs
        .ant-tabs-tab:hover {
          color: #1b365d !important;

          background: #f8fafc;
        }

        .faith-help-tabs
        .ant-tabs-tab-active {
          color: #1b365d !important;

          background: #f8fafc;
        }

        .faith-help-tabs
        .ant-tabs-ink-bar {
          height: 2px !important;

          border-radius: 99px;

          background: #d4af37 !important;
        }

        .faith-tab-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .faith-tab-label svg {
          font-size: 13px;
        }

        .faith-help-tabs
        .ant-tabs-content-holder {
          flex: 1;
        }

        /* ========================================================
           SECTION INTRO
        ======================================================== */

        .faith-section-intro {
          margin-bottom: 17px;
        }

        .faith-section-kicker {
          display: flex;
          align-items: center;
          gap: 7px;

          margin-bottom: 7px;

          color: #a17c1d;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 1.1px;
        }

        .faith-section-kicker span {
          width: 20px;
          height: 2px;

          background: #d4af37;

          border-radius: 99px;
        }

        .faith-section-intro h3 {
          margin:
            0 0 6px;

          color: #172b43;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 20px;
          line-height: 1.25;

          letter-spacing: -.3px;
        }

        .faith-section-intro p {
          max-width: 600px;

          margin: 0;

          color: #64748b;

          font-size: 10.5px;
          line-height: 1.65;
        }

        /* ========================================================
           FEATURE CARD
        ======================================================== */

        .faith-feature-card {
          position: relative;

          height: 100%;

          display: flex;
          align-items: flex-start;

          gap: 11px;

          padding:
            13px 35px 13px 13px;

          border:
            1px solid #edf1f5;

          border-radius: 13px;

          background: #ffffff;

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease;
        }

        .faith-feature-card:hover {
          transform:
            translateY(-2px);

          border-color:
            #e5d39a;

          box-shadow:
            0 9px 25px
            rgba(27,54,93,.07);
        }

        .faith-feature-icon {
          width: 37px;
          height: 37px;

          flex: 0 0 37px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            #f7f3e7;

          color: #a17c1d;

          font-size: 16px;
        }

        .faith-feature-content {
          min-width: 0;
          flex: 1;
        }

        .faith-feature-heading {
          display: flex;
          align-items: center;
          gap: 6px;

          margin-bottom: 3px;
        }

        .faith-feature-title {
          color: #1e293b;

          font-size: 11px;
          font-weight: 800;
        }

        .faith-feature-content p {
          margin: 0;

          color: #64748b;

          font-size: 9.5px;
          line-height: 1.55;
        }

        .faith-feature-tag {
          margin: 0 !important;

          padding:
            0 6px !important;

          border:
            0 !important;

          border-radius: 99px !important;

          background:
            #f7f3e7 !important;

          color:
            #a17c1d !important;

          font-size: 7px !important;
          font-weight: 750 !important;

          line-height: 15px !important;
        }

        .faith-feature-arrow {
          position: absolute;

          top: 14px;
          right: 13px;

          color: #cbd5e1;

          font-size: 9px;

          transition: all .2s ease;
        }

        .faith-feature-card:hover
        .faith-feature-arrow {
          color: #d4af37;

          transform:
            translateX(2px);
        }

        /* ========================================================
           HIGHLIGHTS
        ======================================================== */

        .faith-highlights {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 10px;
        }

        .faith-highlight {
          position: relative;

          min-height: 108px;

          display: grid;

          grid-template-columns:
            25px 34px 1fr;

          gap: 8px;

          padding:
            14px;

          border:
            1px solid #edf1f5;

          border-radius: 13px;

          background:
            #fbfcfd;

          transition:
            all .2s ease;
        }

        .faith-highlight:hover {
          border-color:
            #e5d39a;

          background:
            #fffdf7;
        }

        .faith-highlight-number {
          color: #cbd5e1;

          font-size: 9px;
          font-weight: 800;

          padding-top: 2px;
        }

        .faith-highlight-icon {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: #f7f3e7;

          color: #a17c1d;

          font-size: 14px;
        }

        .faith-highlight h4 {
          margin:
            0 0 4px;

          color: #1e293b;

          font-size: 11px;
          font-weight: 800;
        }

        .faith-highlight p {
          margin: 0;

          color: #64748b;

          font-size: 9.5px;
          line-height: 1.55;
        }

        /* ========================================================
           ROLE CARD
        ======================================================== */

        .faith-role-card {
          position: relative;

          overflow: hidden;

          padding:
            24px 25px;

          border-radius: 17px;

          background:
            linear-gradient(
              135deg,
              #172f4e 0%,
              #1b365d 65%,
              #244b73 100%
            );

          color: #ffffff;

          box-shadow:
            0 13px 35px
            rgba(27,54,93,.14);
        }

        .faith-role-glow {
          position: absolute;

          width: 220px;
          height: 220px;

          right: -100px;
          top: -120px;

          border-radius: 50%;

          border:
            1px solid
            rgba(212,175,55,.18);

          background:
            rgba(212,175,55,.05);
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

          color: #d4af37;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 1px;
        }

        .faith-role-cross {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            rgba(212,175,55,.10);

          color: #d4af37;

          font-size: 15px;
        }

        .faith-role-card h2 {
          position: relative;
          z-index: 2;

          margin:
            14px 0 9px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 25px;
          line-height: 1.2;
        }

        .faith-role-card h2 span {
          color: #d4af37;
        }

        .faith-role-card p {
          position: relative;
          z-index: 2;

          max-width: 650px;

          margin: 0;

          color:
            rgba(255,255,255,.69);

          font-size: 10.5px;
          line-height: 1.75;
        }

        .faith-role-points {
          position: relative;
          z-index: 2;

          display: flex;
          flex-wrap: wrap;

          gap: 7px;

          margin-top: 17px;
        }

        .faith-role-points div {
          display: flex;
          align-items: center;
          gap: 5px;

          padding:
            7px 10px;

          border-radius: 8px;

          background:
            rgba(255,255,255,.07);

          color:
            rgba(255,255,255,.82);

          font-size: 8.5px;
          font-weight: 650;
        }

        .faith-role-points svg {
          color: #d4af37;

          font-size: 10px;
        }

        /* ========================================================
           ROLE FOOTER
        ======================================================== */

        .faith-role-footer {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 15px;

          margin-top: 15px;
          padding-top: 14px;

          border-top:
            1px solid #edf1f5;
        }

        .faith-website {
          display: flex;
          align-items: center;

          gap: 9px;
        }

        .faith-website-icon {
          width: 31px;
          height: 31px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: #f7f3e7;

          color: #a17c1d;

          font-size: 13px;
        }

        .faith-website div:last-child {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .faith-website span {
          color: #94a3b8;

          font-size: 8px;
        }

        .faith-website strong {
          color: #1b365d;

          font-size: 10px;
        }

        .faith-version {
          color: #94a3b8;

          font-size: 8px;
        }

        .faith-version span {
          margin:
            0 5px;

          color: #d4af37;
        }

        /* ========================================================
           FOOTER
        ======================================================== */

        .faith-content-footer {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 15px;

          margin-top: auto;
          padding-top: 13px;

          border-top:
            1px solid #f1f5f9;
        }

        .faith-footer-message {
          display: flex;
          align-items: center;

          gap: 6px;

          color: #94a3b8;

          font-size: 8.5px;
        }

        .faith-footer-message svg {
          color: #d4af37;

          font-size: 11px;
        }

        .faith-footer-site {
          color: #a17c1d;

          font-size: 8.5px;
          font-weight: 750;
        }

        /* ========================================================
           TABLET
        ======================================================== */

        @media (max-width: 900px) {

          .faith-help-sidebar {
            width: 255px;
            min-width: 255px;

            padding:
              30px 22px 22px;
          }

          .faith-help-content {
            padding:
              27px 25px 17px;
          }

          .faith-brand {
            font-size: 31px;
          }

          .faith-content-header h1 {
            font-size: 22px;
          }

          .faith-highlights {
            grid-template-columns: 1fr;
          }

        }

        /* ========================================================
           MOBILE
        ======================================================== */

        @media (max-width: 700px) {

          .faith-help-modal {
            width:
              calc(100vw - 18px) !important;

            max-width:
              calc(100vw - 18px) !important;

            margin:
              9px auto;
          }

          .faith-help-layout {
            flex-direction: column;

            min-height: auto;
          }

          .faith-help-sidebar {
            width: 100%;
            min-width: 0;

            padding:
              22px 20px 17px;
          }

          .faith-system-label {
            margin-bottom: 17px;
          }

          .faith-logo-wrapper {
            width: 55px;
            height: 55px;

            padding: 8px;

            margin-bottom: 13px;
          }

          .faith-brand {
            font-size: 29px;
          }

          .faith-sidebar-text {
            display: none;
          }

          .faith-brand-line {
            margin-top: 6px;
          }

          .faith-sidebar-bottom {
            margin-top: 18px;
          }

          .faith-help-content {
            padding:
              21px 17px 15px;
          }

          .faith-content-header h1 {
            font-size: 20px;
          }

          .faith-header-mark {
            width: 36px;
            height: 36px;

            font-size: 14px;
          }

          .faith-help-tabs
          .ant-tabs-nav {
            overflow-x: auto;

            scrollbar-width: none;
          }

          .faith-help-tabs
          .ant-tabs-nav::-webkit-scrollbar {
            display: none;
          }

          .faith-help-tabs
          .ant-tabs-tab {
            white-space: nowrap;

            padding:
              8px 9px !important;

            font-size: 9px !important;
          }

          .faith-highlights {
            grid-template-columns: 1fr;
          }

          .faith-role-card {
            padding:
              20px 18px;
          }

          .faith-role-card h2 {
            font-size: 21px;
          }

          .faith-role-card p {
            font-size: 9.5px;
          }

          .faith-role-points {
            flex-direction: column;
          }

          .faith-role-footer {
            align-items: flex-start;

            flex-direction: column;
          }

          .faith-content-footer {
            display: none;
          }

        }

        /* ========================================================
           SMALL MOBILE
        ======================================================== */

        @media (max-width: 430px) {

          .faith-sidebar-bottom {
            padding:
              9px;
          }

          .faith-side-divider {
            margin:
              0 7px;
          }

          .faith-side-stat {
            gap: 6px;
          }

          .faith-side-stat-icon {
            width: 27px;
            height: 27px;

            flex-basis: 27px;

            font-size: 12px;
          }

          .faith-side-stat strong {
            font-size: 9px;
          }

          .faith-side-stat span {
            font-size: 7px;
          }

          .faith-feature-card {
            padding:
              11px 32px 11px 11px;
          }

          .faith-feature-icon {
            width: 34px;
            height: 34px;

            flex-basis: 34px;
          }

          .faith-feature-title {
            font-size: 10.5px;
          }

          .faith-feature-content p {
            font-size: 9px;
          }

          .faith-highlight {
            grid-template-columns:
              20px 32px 1fr;

            padding:
              12px;
          }

        }

      `}</style>
    </>
  );
};

export default HelpModalCate;
