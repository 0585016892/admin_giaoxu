import React, { useState } from "react";
import { Layout, Typography, ConfigProvider } from "antd";
import { Outlet } from "react-router-dom";
import { HeartFilled, SmileOutlined } from "@ant-design/icons";
import CatechistSidebar from "./CatechistSidebar";
import CatechistHeader from "./CatechistHeader";

const { Content, Footer } = Layout;
const { Text } = Typography;

export default function CatechistLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF6B8B",
          borderRadius: 20,
          fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <Layout className="chibi-layout-root">
        {/* SIDEBAR */}
        <CatechistSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* MAIN LAYOUT */}
        <Layout className="chibi-layout-main">
          {/* HEADER */}
          <CatechistHeader />

          {/* MAIN CONTENT */}
          <Content className="chibi-layout-content">
            <Outlet />
          </Content>

          {/* FOOTER CHIBI DỄ THƯƠNG */}
          <Footer className="chibi-layout-footer">
            <div className="chibi-footer-pill">
              <SmileOutlined className="chibi-footer-sparkle" />
              <Text className="chibi-footer-text">Giáo lý công giáo</Text>
              <HeartFilled className="chibi-footer-heart" />
            </div>
          </Footer>
        </Layout>

        {/* CSS SCOPED STYLES */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

          .chibi-layout-root {
            min-height: 100vh;
            background: #FFF5F7 !important;
            font-family: 'Quicksand', 'Be Vietnam Pro', sans-serif;
          }

          .chibi-layout-main {
            background: transparent !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }

          .chibi-layout-content {
            margin: 16px 20px 8px;
            min-height: 280px;
            flex: 1;
            transition: all 0.3s ease;
          }

          /* FOOTER STYLES */
          .chibi-layout-footer {
            background: transparent !important;
            text-align: center;
            padding: 12px 20px 20px !important;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .chibi-footer-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 18px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(10px);
            border: 1.5px solid #FFE4E6;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(255, 182, 193, 0.2);
            transition: all 0.25s ease;
          }

          .chibi-footer-pill:hover {
            transform: translateY(-2px);
            background: #FFFFFF;
            box-shadow: 0 6px 18px rgba(255, 107, 139, 0.25);
          }

          .chibi-footer-sparkle {
            color: #A855F7;
            font-size: 14px;
          }

          .chibi-footer-text {
            color: #64748B;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.2px;
          }

          .chibi-footer-heart {
            color: #FF6B8B;
            font-size: 13px;
            animation: chibiHeartBeat 1.8s infinite ease-in-out;
          }

          @keyframes chibiHeartBeat {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.25); }
          }

          /* RESPONSIVE MOBILE */
          @media (max-width: 640px) {
            .chibi-layout-content {
              margin: 12px 10px 6px;
            }
            .chibi-footer-pill {
              padding: 5px 12px;
            }
            .chibi-footer-text {
              font-size: 10.5px;
            }
          }
        `}</style>
      </Layout>
    </ConfigProvider>
  );
}
