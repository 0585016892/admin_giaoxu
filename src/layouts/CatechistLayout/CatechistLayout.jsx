import React, { useState } from "react";
import { Layout, Typography, ConfigProvider } from "antd";
import { Outlet } from "react-router-dom";
import { HeartFilled, SmileOutlined } from "@ant-design/icons";

import CatechistSidebar from "./CatechistSidebar";
import CatechistHeader from "./CatechistHeader";

const { Content, Footer } = Layout;
const { Text } = Typography;

export default function CatechistLayout() {
  /**
   * =========================================================
   * SIDEBAR STATE
   * =========================================================
   */

  // Desktop sidebar
  const [collapsed, setCollapsed] = useState(false);

  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF6B8B",
          colorInfo: "#FF6B8B",

          borderRadius: 16,

          fontFamily:
            "'Quicksand', 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },

        components: {
          Layout: {
            bodyBg: "#FFF5F7",
            headerBg: "transparent",
            footerBg: "transparent",
            siderBg: "#FFFFFF",
          },

          Drawer: {
            colorBgElevated: "#FFFFFF",
            borderRadiusLG: 0,
          },

          Button: {
            borderRadius: 12,
          },

          Menu: {
            itemBorderRadius: 14,
          },
        },
      }}
    >
      <Layout className="chibi-layout-root">
        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <CatechistSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* =====================================================
            MAIN LAYOUT
        ===================================================== */}

        <Layout className="chibi-layout-main">
          {/* ===================================================
              HEADER
          =================================================== */}

          <div className="chibi-header-wrapper">
            <CatechistHeader
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />
          </div>

          {/* ===================================================
              CONTENT
          =================================================== */}

          <Content className="chibi-layout-content">
            <main className="chibi-content-inner">
              <Outlet />
            </main>
          </Content>

          {/* ===================================================
              FOOTER
          =================================================== */}

          <Footer className="chibi-layout-footer">
            <div className="chibi-footer-pill">
              <span className="chibi-footer-sparkle">
                <SmileOutlined />
              </span>

              <Text className="chibi-footer-text">FaithEdu - Giáo Lý Số</Text>

              <span className="chibi-footer-heart">
                <HeartFilled />
              </span>
            </div>
          </Footer>
        </Layout>

        {/* =====================================================
            GLOBAL STYLE
        ===================================================== */}

        <style>{`
          @import url(
            'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap'
          );

          /* =====================================================
             RESET
          ===================================================== */

          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }

          html {
            width: 100%;
            min-height: 100%;
            margin: 0;
            padding: 0;
          }

          body {
            width: 100%;
            min-height: 100%;
            margin: 0;
            padding: 0;

            overflow-x: hidden;

            background: #FFF5F7;

            font-family:
              'Quicksand',
              'Be Vietnam Pro',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              sans-serif;

            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          #root {
            width: 100%;
            min-height: 100vh;
            min-height: 100dvh;
          }

          button,
          input,
          textarea,
          select {
            font-family: inherit;
          }

          /* =====================================================
             ROOT LAYOUT
          ===================================================== */

          .chibi-layout-root {
            width: 100%;
            min-height: 100vh;
            min-height: 100dvh;

            background:
              radial-gradient(
                circle at 8% 5%,
                rgba(255, 107, 139, 0.035),
                transparent 22%
              ),
              radial-gradient(
                circle at 92% 8%,
                rgba(168, 85, 247, 0.035),
                transparent 24%
              ),
              #FFF5F7 !important;

            font-family:
              'Quicksand',
              'Be Vietnam Pro',
              sans-serif;
          }

          /* =====================================================
             MAIN
          ===================================================== */

          .chibi-layout-main {
            min-width: 0 !important;

            width: 100%;

            min-height: 100vh;
            min-height: 100dvh;

            display: flex;
            flex-direction: column;

            background:
              radial-gradient(
                circle at 85% 10%,
                rgba(255, 107, 139, 0.045),
                transparent 25%
              ),
              #FFF5F7 !important;
          }

          /* =====================================================
             HEADER WRAPPER
          ===================================================== */

          .chibi-header-wrapper {
            position: sticky;
            top: 0;

            z-index: 1000;

            width: 100%;

            flex-shrink: 0;
          }

          /* =====================================================
             CONTENT
          ===================================================== */

          .chibi-layout-content {
            flex: 1 1 auto;

            min-width: 0;

            margin: 25px ;

            padding: 0;

            overflow-x: hidden;
          }

          .chibi-content-inner {
            width: 100%;
            min-width: 0;

            margin: 0;
            padding: 0;
          }

          /* =====================================================
             FOOTER
          ===================================================== */

          .chibi-layout-footer {
            width: 100%;

            flex-shrink: 0;

            display: flex;
            justify-content: center;
            align-items: center;

            padding: 10px 20px 18px !important;

            background: transparent !important;
          }

          .chibi-footer-pill {
            display: inline-flex;

            align-items: center;
            justify-content: center;

            gap: 8px;

            min-height: 34px;

            padding: 6px 16px;

            background:
              rgba(255, 255, 255, 0.88);

            border: 1px solid #FFE4E6;

            border-radius: 999px;

            box-shadow:
              0 4px 14px rgba(255, 182, 193, 0.12);

            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);

            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease,
              background 0.2s ease;
          }

          .chibi-footer-pill:hover {
            transform: translateY(-2px);

            background: #FFFFFF;

            box-shadow:
              0 8px 22px rgba(255, 107, 139, 0.15);
          }

          .chibi-footer-sparkle {
            display: inline-flex;

            align-items: center;
            justify-content: center;

            color: #A855F7;

            font-size: 14px;

            flex-shrink: 0;
          }

          .chibi-footer-text {
            color: #64748B !important;

            font-size: 12px;
            font-weight: 700;

            white-space: nowrap;
          }

          .chibi-footer-heart {
            display: inline-flex;

            align-items: center;
            justify-content: center;

            color: #FF6B8B;

            font-size: 13px;

            flex-shrink: 0;

            animation:
              chibiHeartBeat 1.8s infinite ease-in-out;
          }

          @keyframes chibiHeartBeat {
            0%,
            100% {
              transform: scale(1);
            }

            50% {
              transform: scale(1.25);
            }
          }

          /* =====================================================
             TABLET
          ===================================================== */

          @media (max-width: 1200px) {

            .chibi-layout-content {
              margin: 14px 16px 8px;
            }

          }

          @media (max-width: 1024px) {

            .chibi-layout-content {
              margin: 12px 14px 8px;
            }

          }

          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 767px) {

            .chibi-layout-root {
              min-height: 100dvh;
            }

            .chibi-layout-main {
              min-height: 100dvh;

              width: 100%;
            }

            /* -----------------------------
               CONTENT
            ----------------------------- */

            .chibi-layout-content {
              width: 100%;

              margin: 6px 0 4px;

              padding: 0 8px;

              min-height: 0;

              overflow-x: hidden;
            }

            .chibi-content-inner {
              width: 100%;

              padding: 0;
            }

            /* -----------------------------
               FOOTER
            ----------------------------- */

            .chibi-layout-footer {
              padding: 7px 10px 14px !important;
            }

            .chibi-footer-pill {
              min-height: 30px;

              gap: 6px;

              padding: 5px 12px;

              max-width: calc(100vw - 24px);
            }

            .chibi-footer-text {
              font-size: 10.5px;
            }

            .chibi-footer-sparkle {
              font-size: 12px;
            }

            .chibi-footer-heart {
              font-size: 11px;
            }

          }

          /* =====================================================
             SMALL MOBILE
          ===================================================== */

          @media (max-width: 480px) {

            .chibi-layout-content {
              margin-top: 4px;

              padding-left: 6px;
              padding-right: 6px;
            }

            .chibi-layout-footer {
              padding:
                6px
                8px
                max(12px, env(safe-area-inset-bottom))
                !important;
            }

            .chibi-footer-pill {
              min-height: 28px;

              gap: 5px;

              padding: 4px 10px;
            }

            .chibi-footer-text {
              font-size: 10px;
            }

            .chibi-footer-sparkle {
              font-size: 11px;
            }

            .chibi-footer-heart {
              font-size: 10px;
            }

          }

          /* =====================================================
             VERY SMALL MOBILE
          ===================================================== */

          @media (max-width: 360px) {

            .chibi-layout-content {
              padding-left: 5px;
              padding-right: 5px;
            }

            .chibi-footer-pill {
              padding: 4px 9px;
            }

            .chibi-footer-text {
              font-size: 9.5px;
            }

          }

          /* =====================================================
             SAFE AREA
          ===================================================== */

          @supports (padding: max(0px)) {

            .chibi-layout-footer {
              padding-bottom:
                max(
                  18px,
                  env(safe-area-inset-bottom)
                ) !important;
            }

            @media (max-width: 767px) {

              .chibi-layout-footer {
                padding-bottom:
                  max(
                    14px,
                    env(safe-area-inset-bottom)
                  ) !important;
              }

            }

          }

          /* =====================================================
             ANT DESIGN FIX
          ===================================================== */

          .chibi-layout-root .ant-layout {
            min-width: 0;
          }

          .chibi-layout-root .ant-layout-content {
            min-width: 0;
          }

          /* =====================================================
             MOBILE DRAWER
          ===================================================== */

          @media (max-width: 767px) {

            .mobile-sidebar-drawer {
              z-index: 2000;
            }

            .mobile-sidebar-drawer
            .ant-drawer-content {
              border-radius: 0 22px 22px 0;
              overflow: hidden;
            }

            .mobile-sidebar-drawer
            .ant-drawer-body {
              padding: 0 !important;
            }

          }

          /* =====================================================
             DESKTOP
          ===================================================== */

          @media (min-width: 768px) {

            .mobile-sidebar-drawer {
              display: none;
            }

          }

          /* =====================================================
             REDUCE MOTION
          ===================================================== */

          @media (prefers-reduced-motion: reduce) {

            .chibi-footer-pill,
            .chibi-footer-heart {
              animation: none !important;

              transition: none !important;
            }

          }
        `}</style>
      </Layout>
    </ConfigProvider>
  );
}
