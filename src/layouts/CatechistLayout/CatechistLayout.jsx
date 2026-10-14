import React, { useState } from "react";
import { Layout, Typography, ConfigProvider } from "antd";
import { Outlet } from "react-router-dom";

import CatechistSidebar from "./CatechistSidebar";
import CatechistHeader from "./CatechistHeader";
import AppointmentModal from "../../pages/catechist/CatechistManagement/components/AppointmentModal";
import faitheduBackground from "../../assets/images/faithedu-background.png";
const { Content, Footer } = Layout;
const { Text } = Typography;

export default function CatechistLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#173B5E",
          colorInfo: "#173B5E",
          colorSuccess: "#2E7D5B",
          colorWarning: "#B7791F",
          colorError: "#C0392B",
          colorLink: "#173B5E",
          colorBgBase: "#FFFFFF",
          colorTextBase: "#173B5E",
          colorBorder: "#E2E8F0",
          borderRadius: 12,
          fontFamily:
            "'Be Vietnam Pro', 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: {
          Layout: {
            bodyBg: "transparent",
            headerBg: "transparent",
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
            colorBgContainer: "#FFFFFF",
            colorBorderSecondary: "#E2E8F0",
          },
          Table: {
            headerBg: "#F7F9FC",
            headerColor: "#173B5E",
            rowHoverBg: "#EEF5FC",
            borderColor: "#E2E8F0",
            colorBgContainer: "#FFFFFF",
          },
          Modal: {
            contentBg: "#FFFFFF",
            headerBg: "#FFFFFF",
            footerBg: "#FFFFFF",
          },
          Dropdown: {
            colorBgElevated: "#FFFFFF",
          },
          Select: {
            colorBgContainer: "#FFFFFF",
          },
          Input: {
            colorBgContainer: "#FFFFFF",
          },
        },
      }}
    >
      <Layout
        className="faith-layout-root"
        style={{
          backgroundImage: `url(${faitheduBackground})`,
        }}
      >
        <CatechistSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <Layout className="faith-layout-main">
          <div className="faith-header-container">
            <CatechistHeader
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />
          </div>

          <Content className="faith-layout-content">
            <main className="faith-content-inner">
              <Outlet />
            </main>
          </Content>

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

        <AppointmentModal />

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Quicksand:wght@500;600;700&display=swap');

          :root {
            color-scheme: light;
            --faith-navy: #173B5E;
            --faith-navy-dark: #102D48;
            --faith-navy-hover: #244F78;
            --faith-gold: #D9A441;
            --faith-gold-soft: #F8EBCF;
            --faith-background: #F4F8FD;
            --faith-surface: #FFFFFF;
            --faith-heading: #172B3A;
            --faith-text: #526273;
            --faith-muted: #8A97A6;
            --faith-border: #E1EAF4;
            --faith-shadow: 0 8px 28px rgba(23, 59, 94, 0.055);
            --faith-radius-sm: 8px;
            --faith-radius-md: 12px;
            --faith-radius-lg: 16px;
            --faith-scrollbar: #CBD8E7;
          }

          *, *::before, *::after { box-sizing: border-box; }

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
            background: #F4F8FD;
            color: var(--faith-heading);
            font-family: 'Be Vietnam Pro', 'Quicksand', -apple-system,
              BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          #root {
            width: 100%;
            min-height: 100vh;
            min-height: 100dvh;
          }

          button, input, textarea, select { font-family: inherit; }

          /* Ảnh nền hiển thị trực tiếp, không phủ gradient/overlay lên ảnh.
             Đặt ảnh tại: public/images/faithedu-background.png */
         .faith-layout-root {
  position: relative;
  isolation: isolate;
  display: flex;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background-color: #F4F8FD;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

          /* Cho ảnh nền xuyên qua toàn bộ layout chính */
          .faith-layout-root > .ant-layout,
          .faith-layout-main,
          .faith-layout-content {
            background: transparent !important;
          }

          .faith-layout-main {
            display: flex;
            flex: 1 1 auto;
            flex-direction: column;
            width: 0;
            min-width: 0 !important;
            min-height: 100vh;
            min-height: 100dvh;
          }

          .faith-header-container {
            position: sticky;
            top: 0;
            z-index: 1000;
            width: 100%;
            flex-shrink: 0;
            padding: 10px 16px 0;
            /* Trong suốt hoàn toàn để ảnh nền không bị làm mờ */
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }

          .faith-layout-content {
            flex: 1 1 auto;
            width: 100%;
            min-width: 0;
            padding: 12px 22px 8px;
            overflow-x: hidden;
            background: transparent !important;
          }

          .faith-content-inner {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 1600px;
            min-width: 0;
            margin: 0 auto;
            padding: 0;
          }

          .faith-layout-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            flex-shrink: 0;
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
            border: 1px solid rgba(215, 228, 241, 0.9);
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.78);
            box-shadow: 0 4px 16px rgba(23, 59, 94, 0.045);
            color: var(--faith-muted);
            white-space: nowrap;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }

          .faith-footer:hover {
            border-color: #D4DEE7;
            box-shadow: 0 6px 20px rgba(23, 59, 94, 0.07);
          }

          .faith-footer-brand {
            color: var(--faith-heading);
            font-family: 'Quicksand', sans-serif;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1px;
          }

          .faith-footer-divider {
            width: 1px;
            height: 13px;
            background: var(--faith-border);
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

          .faith-layout-root .ant-layout,
          .faith-layout-root .ant-layout-content {
            min-width: 0;
          }

          .faith-layout-root .ant-menu {
            font-family: 'Be Vietnam Pro', 'Quicksand', sans-serif;
          }

          .faith-layout-root ::-webkit-scrollbar {
            width: 7px;
            height: 7px;
          }

          .faith-layout-root ::-webkit-scrollbar-track {
            background: transparent;
          }

          .faith-layout-root ::-webkit-scrollbar-thumb {
            background: var(--faith-scrollbar);
            border-radius: 999px;
          }

          .faith-layout-root ::-webkit-scrollbar-thumb:hover {
            background: #AEBBC7;
          }

          @media (max-width: 1200px) {
            .faith-layout-content { padding: 12px 18px 8px; }
            .faith-content-inner { max-width: 100%; }
          }

          @media (max-width: 1024px) {
            .faith-header-container { padding: 8px 12px 0; }
            .faith-layout-content { padding: 10px 14px 7px; }
          }

          @media (max-width: 767px) {
            .faith-layout-root,
            .faith-layout-main {
              min-height: 100dvh;
            }

            .faith-layout-root {
              background-attachment: scroll !important;
              background-position: center top !important;
            }

            .faith-header-container {
              padding: 6px 7px 0;
            }

            .faith-layout-content {
              width: 100%;
              padding: 6px 7px 3px;
              overflow-x: hidden;
            }

            .faith-content-inner {
              width: 100%;
              padding: 0;
            }

            .faith-layout-footer {
              padding: 6px 8px max(12px, env(safe-area-inset-bottom)) !important;
            }

            .faith-footer {
              min-height: 28px;
              gap: 7px;
              padding: 4px 10px;
            }

            .faith-footer-brand { font-size: 10px; }
            .faith-footer-text { font-size: 9px; }
            .faith-footer-cross { font-size: 9px; }

            .mobile-sidebar-drawer { z-index: 2000; }

            .mobile-sidebar-drawer .ant-drawer-content {
              border-radius: 0 18px 18px 0;
              overflow: hidden;
            }

            .mobile-sidebar-drawer .ant-drawer-body {
              padding: 0 !important;
            }
          }

          @media (min-width: 768px) {
            .mobile-sidebar-drawer { display: none; }
          }

          @media (max-width: 480px) {
            .faith-header-container { padding: 5px 5px 0; }
            .faith-layout-content { padding: 5px 5px 2px; }

            .faith-footer {
              max-width: calc(100vw - 20px);
              gap: 6px;
              padding: 4px 9px;
            }

            .faith-footer-brand { font-size: 9.5px; }
            .faith-footer-text { font-size: 8.5px; }
          }

          @media (max-width: 360px) {
            .faith-layout-content {
              padding-left: 4px;
              padding-right: 4px;
            }

            .faith-footer-text { display: none; }
            .faith-footer { gap: 7px; }
          }

          @media (prefers-reduced-motion: reduce) {
            .faith-footer { transition: none !important; }
          }
        `}</style>
      </Layout>
    </ConfigProvider>
  );
}
