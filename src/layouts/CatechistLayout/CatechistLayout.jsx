import React, { useState } from "react";
import { Layout, Typography, ConfigProvider } from "antd";
import { Outlet } from "react-router-dom";
import { HeartFilled, SmileOutlined } from "@ant-design/icons";

import CatechistSidebar from "./CatechistSidebar";
import CatechistHeader from "./CatechistHeader";

const { Content, Footer } = Layout;
const { Text } = Typography;

export default function CatechistLayout() {
  /* =========================================================
     SIDEBAR STATE
  ========================================================= */

  // Desktop sidebar
  const [collapsed, setCollapsed] = useState(false);

  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ConfigProvider
      theme={{
        token: {
          /* =====================================================
             FAITHEDU BRAND
          ===================================================== */

          colorPrimary: "#173B5E",
          colorInfo: "#173B5E",

          /* =====================================================
             GLOBAL
          ===================================================== */

          borderRadius: 12,

          fontFamily:
            "'Quicksand', 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

          colorText: "#172B3A",
          colorTextSecondary: "#526273",

          colorBgBase: "#F7F9FC",

          colorBorder: "#E4EAF0",
        },

        components: {
          /* =====================================================
             LAYOUT
          ===================================================== */

          Layout: {
            bodyBg: "#F7F9FC",
            headerBg: "transparent",
            footerBg: "transparent",
            siderBg: "#173B5E",
          },

          /* =====================================================
             DRAWER
          ===================================================== */

          Drawer: {
            colorBgElevated: "#173B5E",
            borderRadiusLG: 0,
          },

          /* =====================================================
             BUTTON
          ===================================================== */

          Button: {
            borderRadius: 10,
          },

          /* =====================================================
             MENU
          ===================================================== */

          Menu: {
            itemBorderRadius: 10,
            itemSelectedColor: "#FFFFFF",
            itemColor: "#D9E4ED",
            itemHoverColor: "#FFFFFF",
            itemSelectedBg: "#244F78",
          },

          /* =====================================================
             CARD
          ===================================================== */

          Card: {
            borderRadiusLG: 14,
          },
        },
      }}
    >
      <Layout className="faith-layout-root">
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

        <Layout className="faith-layout-main">
          {/* ===================================================
              HEADER
          =================================================== */}

          <div className="faith-header-container">
            <CatechistHeader
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />
          </div>

          {/* ===================================================
              CONTENT
          =================================================== */}

          <Content className="faith-layout-content">
            <main className="faith-content-inner">
              <Outlet />
            </main>
          </Content>

          {/* ===================================================
              FOOTER
          =================================================== */}

          <Footer className="faith-layout-footer">
            <div className="faith-footer-pill">
              <span className="faith-footer-icon">
                <SmileOutlined />
              </span>

              <Text className="faith-footer-text">FaithEdu · Giáo Lý Số</Text>

              <span className="faith-footer-cross">✝</span>

              <span className="faith-footer-heart">
                <HeartFilled />
              </span>
            </div>
          </Footer>
        </Layout>

        {/* =====================================================
            GLOBAL STYLE
        ===================================================== */}

        <style>{`

          /* =====================================================
             GOOGLE FONT
          ===================================================== */

          @import url(
            'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap'
          );


          /* =====================================================
             DESIGN TOKENS
          ===================================================== */

          :root {

            /* Brand */
            --faith-navy: #173B5E;
            --faith-navy-hover: #244F78;
            --faith-navy-light: #EEF4F8;

            --faith-gold: #D9A441;
            --faith-gold-light: #FFF7E5;

            /* Background */
            --faith-background: #F7F9FC;
            --faith-surface: #FFFFFF;

            /* Text */
            --faith-heading: #172B3A;
            --faith-text: #526273;
            --faith-muted: #8A97A6;

            /* Border */
            --faith-border: #E4EAF0;

            /* Status */
            --faith-success: #2E8B68;
            --faith-warning: #D98A2B;
            --faith-error: #D9534F;
            --faith-info: #3B82B6;

            /* Radius */
            --faith-radius-sm: 8px;
            --faith-radius-md: 12px;
            --faith-radius-lg: 16px;
          }


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

            background:
              var(--faith-background);

            font-family:
              'Quicksand',
              'Be Vietnam Pro',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              sans-serif;

            color:
              var(--faith-heading);

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

          .faith-layout-root {
            width: 100%;

            min-height: 100vh;
            min-height: 100dvh;

            background:
              var(--faith-background) !important;

            font-family:
              'Quicksand',
              'Be Vietnam Pro',
              sans-serif;
          }


          /* =====================================================
             MAIN
          ===================================================== */

          .faith-layout-main {
            min-width: 0 !important;

            width: 100%;

            min-height: 100vh;
            min-height: 100dvh;

            display: flex;

            flex-direction: column;

            background:
              var(--faith-background) !important;
          }


          /* =====================================================
             HEADER CONTAINER
          ===================================================== */

          .faith-header-container {
            position: sticky;

            top: 0;

            z-index: 1000;

            width: 100%;

            flex-shrink: 0;

            background:
              rgba(247, 249, 252, 0.94);

            backdrop-filter:
              blur(12px);

            -webkit-backdrop-filter:
              blur(12px);
          }


          /* =====================================================
             CONTENT
          ===================================================== */

          .faith-layout-content {
            flex: 1 1 auto;

            min-width: 0;

            width: 100%;

            margin: 0;

            padding:
              22px 24px 10px;

            overflow-x: hidden;

            background:
              var(--faith-background) !important;
          }


          .faith-content-inner {
            width: 100%;

            min-width: 0;

            margin: 0 auto;

            padding: 0;

            max-width: 1600px;
          }


          /* =====================================================
             FOOTER
          ===================================================== */

          .faith-layout-footer {
            width: 100%;

            flex-shrink: 0;

            display: flex;

            justify-content: center;
            align-items: center;

            padding:
              10px 20px 18px !important;

            background:
              transparent !important;
          }


          /* =====================================================
             FOOTER PILL
          ===================================================== */

          .faith-footer-pill {
            display: inline-flex;

            align-items: center;
            justify-content: center;

            gap: 7px;

            min-height: 32px;

            padding:
              5px 14px;

            background:
              rgba(
                255,
                255,
                255,
                0.9
              );

            border:
              1px solid
              var(--faith-border);

            border-radius: 999px;

            box-shadow:
              0 3px 12px
              rgba(
                23,
                59,
                94,
                0.05
              );

            transition:
              all 0.2s ease;
          }


          .faith-footer-pill:hover {
            background:
              #FFFFFF;

            border-color:
              #CCD9E3;

            transform:
              translateY(-1px);

            box-shadow:
              0 6px 18px
              rgba(
                23,
                59,
                94,
                0.08
              );
          }


          /* =====================================================
             FOOTER ICON
          ===================================================== */

          .faith-footer-icon {
            display: inline-flex;

            align-items: center;
            justify-content: center;

            color:
              var(--faith-navy);

            font-size: 13px;

            flex-shrink: 0;
          }


          /* =====================================================
             FOOTER TEXT
          ===================================================== */

          .faith-footer-text {
            color:
              var(--faith-muted) !important;

            font-family:
              'Quicksand',
              sans-serif;

            font-size: 11px;

            font-weight: 700;

            white-space: nowrap;
          }


          /* =====================================================
             CROSS
          ===================================================== */

          .faith-footer-cross {
            display: inline-flex;

            align-items: center;
            justify-content: center;

            color:
              var(--faith-gold);

            font-size: 14px;

            font-weight: 700;

            line-height: 1;
          }


          /* =====================================================
             HEART
          ===================================================== */

          .faith-footer-heart {
            display: inline-flex;

            align-items: center;
            justify-content: center;

            color:
              var(--faith-navy);

            font-size: 11px;

            flex-shrink: 0;

            animation:
              faithHeartBeat
              2.4s
              infinite
              ease-in-out;
          }


          @keyframes faithHeartBeat {

            0%,
            100% {
              transform:
                scale(1);
            }

            50% {
              transform:
                scale(1.12);
            }

          }


          /* =====================================================
             ANT DESIGN LAYOUT FIX
          ===================================================== */

          .faith-layout-root
          .ant-layout {
            min-width: 0;
          }


          .faith-layout-root
          .ant-layout-content {
            min-width: 0;
          }


          /* =====================================================
             ANT MENU GLOBAL
          ===================================================== */

          .faith-layout-root
          .ant-menu {
            font-family:
              'Quicksand',
              sans-serif;
          }


          /* =====================================================
             SCROLLBAR
          ===================================================== */

          .faith-layout-root
          ::-webkit-scrollbar {
            width: 7px;
            height: 7px;
          }


          .faith-layout-root
          ::-webkit-scrollbar-track {
            background:
              transparent;
          }


          .faith-layout-root
          ::-webkit-scrollbar-thumb {
            background:
              #CBD5DF;

            border-radius:
              999px;
          }


          .faith-layout-root
          ::-webkit-scrollbar-thumb:hover {
            background:
              #AEBBC7;
          }


          /* =====================================================
             TABLET
          ===================================================== */

          @media (max-width: 1200px) {

            .faith-layout-content {
              padding:
                18px 18px 8px;
            }

            .faith-content-inner {
              max-width:
                100%;
            }

          }


          /* =====================================================
             TABLET SMALL
          ===================================================== */

          @media (max-width: 1024px) {

            .faith-layout-content {
              padding:
                16px 14px 8px;
            }

          }


          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 767px) {

            .faith-layout-root {
              min-height:
                100dvh;
            }


            .faith-layout-main {
              width: 100%;

              min-height:
                100dvh;
            }


            /* -----------------------------
               HEADER
            ----------------------------- */

            .faith-header-container {
              position:
                sticky;

              top: 0;

              z-index: 1000;
            }


            /* -----------------------------
               CONTENT
            ----------------------------- */

            .faith-layout-content {
              width: 100%;

              margin: 0;

              padding:
                8px 8px 4px;

              min-height: 0;

              overflow-x: hidden;
            }


            .faith-content-inner {
              width: 100%;

              padding: 0;
            }


            /* -----------------------------
               FOOTER
            ----------------------------- */

            .faith-layout-footer {
              padding:
                7px 10px 14px !important;
            }


            .faith-footer-pill {
              min-height:
                30px;

              gap:
                6px;

              padding:
                5px 12px;

              max-width:
                calc(100vw - 24px);
            }


            .faith-footer-text {
              font-size:
                10px;
            }


            .faith-footer-icon {
              font-size:
                12px;
            }


            .faith-footer-cross {
              font-size:
                12px;
            }


            .faith-footer-heart {
              font-size:
                10px;
            }

          }


          /* =====================================================
             SMALL MOBILE
          ===================================================== */

          @media (max-width: 480px) {

            .faith-layout-content {
              padding:
                6px 6px 3px;
            }


            .faith-layout-footer {
              padding:
                6px
                8px
                max(
                  12px,
                  env(
                    safe-area-inset-bottom
                  )
                )
                !important;
            }


            .faith-footer-pill {
              min-height:
                28px;

              gap:
                5px;

              padding:
                4px 10px;
            }


            .faith-footer-text {
              font-size:
                9.5px;
            }


            .faith-footer-icon {
              font-size:
                11px;
            }


            .faith-footer-cross {
              font-size:
                11px;
            }


            .faith-footer-heart {
              font-size:
                9px;
            }

          }


          /* =====================================================
             VERY SMALL MOBILE
          ===================================================== */

          @media (max-width: 360px) {

            .faith-layout-content {
              padding-left:
                5px;

              padding-right:
                5px;
            }


            .faith-footer-pill {
              padding:
                4px 9px;
            }


            .faith-footer-text {
              font-size:
                9px;
            }

          }


          /* =====================================================
             DESKTOP MOBILE DRAWER
          ===================================================== */

          @media (max-width: 767px) {

            .mobile-sidebar-drawer {
              z-index:
                2000;
            }


            .mobile-sidebar-drawer
            .ant-drawer-content {
              border-radius:
                0 18px 18px 0;

              overflow:
                hidden;
            }


            .mobile-sidebar-drawer
            .ant-drawer-body {
              padding:
                0 !important;
            }

          }


          /* =====================================================
             DESKTOP
          ===================================================== */

          @media (min-width: 768px) {

            .mobile-sidebar-drawer {
              display:
                none;
            }

          }


          /* =====================================================
             REDUCE MOTION
          ===================================================== */

          @media (
            prefers-reduced-motion: reduce
          ) {

            .faith-footer-pill,
            .faith-footer-heart {
              animation:
                none !important;

              transition:
                none !important;
            }

          }

        `}</style>
      </Layout>
    </ConfigProvider>
  );
}
