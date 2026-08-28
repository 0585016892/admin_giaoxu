import React, { useState } from "react";
import { Layout, Typography, Flex } from "antd";
import { Outlet } from "react-router-dom";
import CatechistSidebar from "./CatechistSidebar";
import CatechistHeader from "./CatechistHeader";

const { Content, Footer } = Layout;
const { Text } = Typography;

export default function CatechistLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "#F8FAFC", // Nền xám nhạt SaaS hiện đại
      }}
    >
      {/* SIDEBAR */}
      <CatechistSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* MAIN LAYOUT */}
      <Layout
        style={{
          background: "transparent",
          transition: "all 0.2s ease",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <CatechistHeader />

        {/* CONTENT */}
        <Content
          style={{
            margin: "20px 24px",
            minHeight: 280,
            flex: 1,
            transition: "all 0.2s ease",
          }}
        >
          <Outlet />
        </Content>

        {/* FOOTER TỐI GIẢN & SANG TRỌNG */}
        <Footer
          style={{
            background: "transparent",
            textAlign: "center",
            padding: "0 24px 20px 24px",
          }}
        >
          <Flex align="center" justify="center" gap={8}>
            <div
              style={{
                width: 16,
                height: 2,
                background: "#D4AF37", // Điểm nhấn Gold
                borderRadius: 1,
              }}
            />
            <Text
              style={{
                color: "#64748B",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.2px",
              }}
            >
              Hệ thống Quản lý Giáo lý TNTT Anrê Phú Yên • Giáo Xứ Đồng Quan
            </Text>
            <div
              style={{
                width: 16,
                height: 2,
                background: "#D4AF37",
                borderRadius: 1,
              }}
            />
          </Flex>
        </Footer>
      </Layout>
    </Layout>
  );
}
