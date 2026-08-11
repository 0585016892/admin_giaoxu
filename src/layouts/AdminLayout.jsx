import React, { useState } from "react";
import { Layout } from "antd";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const { Content } = Layout;

export default function AdminLayout({ children }) {
  // 1. Khởi tạo trạng thái đóng/mở cho thanh Sidebar (mặc định là mở - false)
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 2. Truyền trạng thái collapsed vào Sidebar */}
      <AdminSidebar collapsed={collapsed} />

      <Layout>
        {/* 3. Truyền cả collapsed và hàm thay đổi setCollapsed vào Header để bấm nút toggle */}
        <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* 4. Phần nội dung chính hiển thị Dashboard hoặc các trang con */}
        <Content
          style={{
            margin: "24px",
            background: "#f8fafc", // Đồng bộ màu nền tinh tế với Dashboard
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
