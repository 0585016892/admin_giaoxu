import React, { useState, useEffect } from "react";
import { Layout, Typography, ConfigProvider, theme as antdTheme } from "antd";
import { Outlet } from "react-router-dom";

import CatechistSidebar from "./CatechistSidebar";
import CatechistHeader from "./CatechistHeader";
import AppointmentModal from "../../pages/catechist/CatechistManagement/components/AppointmentModal";

const { Content, Footer } = Layout;
const { Text } = Typography;

export default function CatechistLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("faithEduTheme") === "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );

    localStorage.setItem("faithEduTheme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,

        token: {
          colorPrimary: dark ? "#D9A441" : "#173B5E",
          colorInfo: dark ? "#D9A441" : "#173B5E",

          colorSuccess: dark ? "#54C596" : "#2E7D5B",
          colorWarning: dark ? "#F0BB57" : "#B7791F",
          colorError: dark ? "#FF7777" : "#C0392B",

          colorLink: dark ? "#8CBFFF" : "#173B5E",

          colorBgBase: dark ? "#0B1422" : "#FFFFFF",
          colorTextBase: dark ? "#E6EDF6" : "#173B5E",
          colorBorder: dark ? "#293B52" : "#E2E8F0",

          borderRadius: 12,

          fontFamily:
            "'Be Vietnam Pro', 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },

        components: {
          Layout: {
            bodyBg: dark ? "#0B1422" : "#F6F8FB",
            headerBg: dark ? "#142338" : "transparent",
            footerBg: "transparent",
            siderBg: "#173B5E",
          },

          Drawer: {
            colorBgElevated: "#173B5E",
            borderRadiusLG: 0,
          },

          Button: {
            borderRadius: 10,
            primaryShadow: "none",
          },

          Menu: {
            itemBorderRadius: 10,
            itemSelectedColor: "#FFFFFF",
            itemColor: "#D7E2EC",
            itemHoverColor: "#FFFFFF",
            itemSelectedBg: "#244F78",
          },

          Card: {
            borderRadiusLG: 14,
            colorBgContainer: dark ? "#142338" : "#FFFFFF",
            colorBorderSecondary: dark ? "#293B52" : "#E2E8F0",
          },

          Table: {
            headerBg: dark ? "#1B304A" : "#F7F9FC",
            headerColor: dark ? "#E6EDF6" : "#173B5E",
            rowHoverBg: dark ? "#1B304A" : "#EEF3F7",
            borderColor: dark ? "#293B52" : "#E2E8F0",
            colorBgContainer: dark ? "#142338" : "#FFFFFF",
          },

          Modal: {
            contentBg: dark ? "#142338" : "#FFFFFF",
            headerBg: dark ? "#142338" : "#FFFFFF",
            footerBg: dark ? "#142338" : "#FFFFFF",
          },

          Dropdown: {
            colorBgElevated: dark ? "#142338" : "#FFFFFF",
          },

          Select: {
            colorBgContainer: dark ? "#142338" : "#FFFFFF",
          },

          Input: {
            colorBgContainer: dark ? "#0F1D30" : "#FFFFFF",
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
            MAIN
        ===================================================== */}

        <Layout className="faith-layout-main">
          {/* ===================================================
              HEADER
          =================================================== */}

          <div className="faith-header-container">
            <CatechistHeader
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              dark={dark}
              setDark={setDark}
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
            <div className="faith-footer">
              <span className="faith-footer-brand">FaithEdu</span>

              <span className="faith-footer-divider" />

              <Text className="faith-footer-text">
                Giáo Lý Số - version 3.0.0
              </Text>

              <span className="faith-footer-cross">✝</span>
            </div>
          </Footer>
        </Layout>

        {/* =====================================================
            THƯ BỔ NHIỆM
            Global cho toàn bộ khu vực GLV
        ===================================================== */}

        <AppointmentModal />

        {/* =====================================================
            GLOBAL STYLE
        ===================================================== */}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Quicksand:wght@500;600;700&display=swap');

          :root {
            --faith-navy: #173B5E;
            --faith-navy-dark: #102D48;
            --faith-navy-hover: #244F78;

            --faith-gold: #D9A441;
            --faith-gold-soft: #F8EBCF;

            --faith-background: #F6F8FB;
            --faith-surface: #FFFFFF;

            --faith-heading: #172B3A;
            --faith-text: #526273;
            --faith-muted: #8A97A6;

            --faith-border: #E4EAF0;

            --faith-shadow:
              0 8px 28px rgba(23, 59, 94, 0.055);

            --faith-radius-sm: 8px;
            --faith-radius-md: 12px;
            --faith-radius-lg: 16px;
          }
/* =========================
   DARK MODE - FAITHEDU
========================= */

:root {
  color-scheme: light;

  --faith-background: #F6F8FB;
  --faith-surface: #FFFFFF;
  --faith-heading: #172B3A;
  --faith-text: #526273;
  --faith-muted: #8A97A6;
  --faith-border: #E4EAF0;

  --faith-header-glass: linear-gradient(
    to bottom,
    rgba(246, 248, 251, 0.98),
    rgba(246, 248, 251, 0.88),
    rgba(246, 248, 251, 0)
  );

  --faith-footer-surface: rgba(255, 255, 255, 0.82);
  --faith-scrollbar: #CBD5DF;
}

:root[data-theme="dark"] {
  color-scheme: dark;

  --faith-background: #0B1422;
  --faith-surface: #142338;
  --faith-heading: #E6EDF6;
  --faith-text: #C1CDDA;
  --faith-muted: #8FA2B8;
  --faith-border: #293B52;

  --faith-header-glass: linear-gradient(
    to bottom,
    rgba(11, 20, 34, 0.98),
    rgba(11, 20, 34, 0.88),
    rgba(11, 20, 34, 0)
  );

  --faith-footer-surface: rgba(20, 35, 56, 0.92);
  --faith-scrollbar: #40536A;
}
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

            background: var(--faith-background);

            color: var(--faith-heading);

            font-family:
              'Be Vietnam Pro',
              'Quicksand',
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

          .faith-layout-root {
            width: 100%;
            min-height: 100vh;
            min-height: 100dvh;

            background: var(--faith-background) !important;
          }

          .faith-layout-main {
            min-width: 0 !important;
            width: 100%;

            min-height: 100vh;
            min-height: 100dvh;

            display: flex;
            flex-direction: column;

            background: var(--faith-background) !important;
          }

          .faith-header-container {
            position: sticky;
            top: 0;

            z-index: 1000;

            width: 100%;
            flex-shrink: 0;

            padding: 10px 16px 0;

           background: var(--faith-header-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
          }

          .faith-layout-content {
            flex: 1 1 auto;

            min-width: 0;
            width: 100%;

            padding: 12px 22px 8px;

            overflow-x: hidden;

            background: var(--faith-background) !important;
          }

          .faith-content-inner {
            width: 100%;
            max-width: 1600px;

            min-width: 0;

            margin: 0 auto;
            padding: 0;
          }

          .faith-layout-footer {
            width: 100%;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 10px 20px 16px !important;

            background: transparent !important;
          }

          .faith-footer {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            gap: 9px;

            min-height: 30px;

            padding: 5px 13px;

            border: 1px solid var(--faith-border);
            border-radius: 999px;

            background: rgba(255, 255, 255, 0.82);

            box-shadow:
              0 4px 16px rgba(23, 59, 94, 0.045);

            color: var(--faith-muted);

            white-space: nowrap;

            transition:
              border-color 0.2s ease,
              box-shadow 0.2s ease;
          }

          .faith-footer:hover {
            border-color: #D4DEE7;

            box-shadow:
              0 6px 20px rgba(23, 59, 94, 0.07);
          }

          .faith-footer-brand {
            color: var(--faith-navy);

            font-family:
              'Quicksand',
              sans-serif;

            font-size: 11px;
            font-weight: 700;

            letter-spacing: 0.1px;
          }

          .faith-footer-divider {
            width: 1px;
            height: 13px;

            background: #D9E0E7;
          }

          .faith-footer-text {
            color: var(--faith-muted) !important;

            font-size: 10.5px;
            font-weight: 500;
          }

          .faith-footer-cross {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            color: var(--faith-gold);

            font-size: 10px;
          }

          .faith-layout-root .ant-layout {
            min-width: 0;
          }

          .faith-layout-root .ant-layout-content {
            min-width: 0;
          }

          .faith-layout-root .ant-menu {
            font-family:
              'Be Vietnam Pro',
              'Quicksand',
              sans-serif;
          }

          .faith-layout-root ::-webkit-scrollbar {
            width: 7px;
            height: 7px;
          }

          .faith-layout-root ::-webkit-scrollbar-track {
            background: transparent;
          }

          .faith-layout-root ::-webkit-scrollbar-thumb {
            background: #CBD5DF;
            border-radius: 999px;
          }

          .faith-layout-root ::-webkit-scrollbar-thumb:hover {
            background: #AEBBC7;
          }

          @media (max-width: 1200px) {
            .faith-layout-content {
              padding:
                12px
                18px
                8px;
            }

            .faith-content-inner {
              max-width: 100%;
            }
          }

          @media (max-width: 1024px) {
            .faith-header-container {
              padding:
                8px
                12px
                0;
            }

            .faith-layout-content {
              padding:
                10px
                14px
                7px;
            }
          }

          @media (max-width: 767px) {
            .faith-layout-root {
              min-height: 100dvh;
            }

            .faith-layout-main {
              width: 100%;
              min-height: 100dvh;
            }

            .faith-header-container {
              position: sticky;
              top: 0;

              z-index: 1000;

              padding:
                6px
                7px
                0;

           background: var(--faith-header-glass);
            }

            .faith-layout-content {
              width: 100%;

              padding:
                6px
                7px
                3px;

              overflow-x: hidden;
            }

            .faith-content-inner {
              width: 100%;
              padding: 0;
            }

            .faith-layout-footer {
              padding:
                6px
                8px
                max(
                  12px,
                  env(safe-area-inset-bottom)
                ) !important;
            }

            .faith-footer {
              min-height: 28px;

              gap: 7px;

              padding:
                4px
                10px;
            }

            .faith-footer-brand {
              font-size: 10px;
            }

            .faith-footer-text {
              font-size: 9px;
            }

            .faith-footer-cross {
              font-size: 9px;
            }
          }

          @media (max-width: 480px) {
            .faith-header-container {
              padding:
                5px
                5px
                0;
            }

            .faith-layout-content {
              padding:
                5px
                5px
                2px;
            }

            .faith-footer {
              max-width:
                calc(100vw - 20px);

              gap: 6px;

              padding:
                4px
                9px;
            }

            .faith-footer-brand {
              font-size: 9.5px;
            }

            .faith-footer-text {
              font-size: 8.5px;
            }
          }

          @media (max-width: 360px) {
            .faith-layout-content {
              padding-left: 4px;
              padding-right: 4px;
            }

            .faith-footer-text {
              display: none;
            }

            .faith-footer {
              gap: 7px;
            }
          }

          @media (max-width: 767px) {
            .mobile-sidebar-drawer {
              z-index: 2000;
            }

            .mobile-sidebar-drawer .ant-drawer-content {
              border-radius:
                0
                18px
                18px
                0;

              overflow: hidden;
            }

            .mobile-sidebar-drawer .ant-drawer-body {
              padding: 0 !important;
            }
          }

          @media (min-width: 768px) {
            .mobile-sidebar-drawer {
              display: none;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .faith-footer {
              transition: none !important;
            }

          }
            /* Footer */
.faith-footer {
  background: var(--faith-footer-surface);
  border-color: var(--faith-border);
  color: var(--faith-muted);
}

.faith-footer-brand {
  color: var(--faith-heading);
}

.faith-footer-divider {
  background: var(--faith-border);
}

/* Scrollbar */
:root[data-theme="dark"] .faith-layout-root::-webkit-scrollbar-thumb,
:root[data-theme="dark"] .faith-layout-root ::-webkit-scrollbar-thumb {
  background: var(--faith-scrollbar);
}

/* Nền và chữ toàn bộ Layout */
:root[data-theme="dark"] body,
:root[data-theme="dark"] .faith-layout-root,
:root[data-theme="dark"] .faith-layout-main,
:root[data-theme="dark"] .faith-layout-content {
  background-color: var(--faith-background) !important;
  color: var(--faith-heading);
}
        `}</style>
      </Layout>
    </ConfigProvider>
  );
}
