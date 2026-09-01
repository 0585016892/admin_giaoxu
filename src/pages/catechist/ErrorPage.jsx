import React from "react";
import { Button, Result, Typography, Space, Card } from "antd";
import {
  ReloadOutlined,
  HomeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const ErrorPage = ({
  title = "Không thể tải dữ liệu",
  message = "Đã xảy ra lỗi hệ thống hoặc đường truyền mạng không ổn định. Vui lòng thử lại sau.",
  onRetry,
  showHome = true,
}) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#F8FAFC",
      }}
    >
      <Card
        bordered={false}
        style={{
          width: "100%",
          maxWidth: 540,
          borderRadius: 28,
          boxShadow: "0 12px 40px rgba(148, 163, 184, 0.12)",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          textAlign: "center",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: "40px 32px" }}
      >
        <Result
          icon={
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                boxShadow: "0 8px 20px rgba(244, 63, 94, 0.15)",
              }}
            >
              <ExclamationCircleOutlined
                style={{
                  color: "#F43F5E",
                  fontSize: 48,
                }}
              />
            </div>
          }
          title={
            <span
              style={{
                color: "#1E293B",
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: "-0.3px",
              }}
            >
              {title}
            </span>
          }
          subTitle={
            <Text
              type="secondary"
              style={{
                display: "block",
                maxWidth: 420,
                margin: "8px auto 0 auto",
                fontSize: 14,
                lineHeight: 1.6,
                color: "#64748B",
              }}
            >
              {message}
            </Text>
          }
          extra={
            <Space size={12} style={{ marginTop: 12 }}>
              {onRetry && (
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={onRetry}
                  style={{
                    height: 44,
                    padding: "0 24px",
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)",
                    borderColor: "transparent",
                    fontWeight: 700,
                    boxShadow: "0 4px 14px rgba(244, 63, 94, 0.35)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Thử lại
                </Button>
              )}

              {showHome && (
                <Button
                  icon={<HomeOutlined />}
                  onClick={() => navigate("/catechist")}
                  style={{
                    height: 44,
                    padding: "0 24px",
                    borderRadius: 14,
                    fontWeight: 700,
                    color: "#334155",
                    background: "#F1F5F9",
                    borderColor: "#E2E8F0",
                    transition: "all 0.2s ease",
                  }}
                >
                  Về trang chủ
                </Button>
              )}
            </Space>
          }
        />
      </Card>
    </div>
  );
};

export default ErrorPage;
