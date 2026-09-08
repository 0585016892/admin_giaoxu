import React, { useState } from "react";
import {
  Badge,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  DesktopOutlined,
  EditOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  MobileOutlined,
  ReloadOutlined,
  SendOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import notificationApi from "../../api/notificationApi";
import AppButton from "../../components/common/AppButton";
import PageHeroHeader from "../../components/common/PageHeroHeader";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

/* ============================================================
   DESIGN SYSTEM COLORS (FaithEdu Pastel)
============================================================ */

const colors = {
  pink: "#F4729A",
  pinkDark: "#E85D87",
  pinkLight: "#FFF0F5",
  pinkSoft: "#FFF8FB",
  pinkBorder: "#F8C8D8",

  lavender: "#B98AE8",
  lavenderLight: "#F6EEFF",

  text: "#493F47",
  muted: "#918792",
  softText: "#A59BA3",

  white: "#FFFFFF",
  success: "#34B27B",
  bgGradient: "linear-gradient(135deg, #FFF0F5 0%, #F6EEFF 100%)",
};

/* ============================================================
   OPTIONS CONFIG
============================================================ */

const TYPE_OPTIONS = [
  { value: "announcement", label: "📢 Thông báo chung" },
  { value: "system", label: "⚙️ Hệ thống" },
  { value: "class", label: "🏫 Lớp học" },
  { value: "attendance", label: "📅 Điểm danh" },
  { value: "student", label: "🎓 Học viên" },
  { value: "catechist", label: "✝️ Giáo lý viên" },
  { value: "exam", label: "📝 Bài thi" },
  { value: "achievement", label: "🏆 Thành tích" },
  { value: "security", label: "🔒 Bảo mật" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "🟢 Thấp (Thông tin phụ)", color: "default" },
  { value: "normal", label: "🔵 Bình thường", color: "processing" },
  { value: "high", label: "🟠 Cao (Quan trọng)", color: "warning" },
  { value: "urgent", label: "🔴 Khẩn cấp (Ngay lập tức)", color: "error" },
];

/* ============================================================
   MAIN COMPONENT
============================================================ */

const SendNotificationPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  // Theo dõi giá trị form để Live-Preview
  const watchedValues = Form.useWatch([], form) || {};

  const defaultValues = {
    type: "announcement",
    priority: "normal",
    title: "",
    content: "",
    action_url: null,
    related_type: null,
    related_id: null,
  };

  /* Submit Form */
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const payload = {
        type: values.type,
        title: String(values.title || "").trim(),
        content: String(values.content || "").trim(),
        priority: values.priority,
        action_url: null,
        related_type: null,
        related_id: null,
      };

      const response = await notificationApi.create(payload);

      const recipientCount =
        response?.data?.recipient_count ??
        response?.recipient_count ??
        response?.data?.data?.recipient_count;

      message.success({
        content:
          recipientCount !== undefined
            ? `Đã phát thông báo thành công tới ${recipientCount} thành viên!`
            : "Gửi thông báo thành công!",
        duration: 4,
      });

      form.resetFields();
      form.setFieldsValue(defaultValues);
      setActiveTab("1");
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể gửi thông báo. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  /* Reset Form */
  const handleReset = () => {
    form.resetFields();
    form.setFieldsValue(defaultValues);
    message.info("Đã làm sạch toàn bộ nội dung");
  };

  const getPriorityTag = (priority) => {
    switch (priority) {
      case "urgent":
        return <Tag color="error">Khẩn cấp</Tag>;
      case "high":
        return <Tag color="warning">Cao</Tag>;
      case "low":
        return <Tag color="default">Thấp</Tag>;
      default:
        return <Tag color="processing">Bình thường</Tag>;
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 40 }}>
      {/* PAGE HERO HEADER */}
      <PageHeroHeader
        title="Phát thông báo"
        description="Soạn thảo và gửi thông cáo tức thì đến toàn bộ giáo lý viên, học viên trong hệ thống."
        icon={<BellOutlined />}
        onBack={() => navigate(-1)}
      />

      {/* OVERVIEW STATS BANNER */}
      <Card
        bordered={false}
        style={{
          marginTop: 20,
          borderRadius: 18,
          background: colors.bgGradient,
          border: `1px solid ${colors.pinkBorder}`,
        }}
        bodyStyle={{ padding: "18px 24px" }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space size={14}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: colors.white,
                  color: colors.pink,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  boxShadow: "0 4px 12px rgba(244,114,154,0.15)",
                }}
              >
                <UsergroupAddOutlined />
              </div>
              <div>
                <Text
                  strong
                  style={{ fontSize: 15, color: colors.text, display: "block" }}
                >
                  Toàn hệ thống
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  Thông báo sẽ hiển thị trực tiếp trên tài khoản của tất cả các
                  thành viên Giáo xứ.
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Tag
              color="pink"
              style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12 }}
            >
              <CheckCircleOutlined /> Kênh gửi: App Notification
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* FORM & WORKFLOW CONTAINER */}
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultValues}
        onFinish={handleSubmit}
      >
        <Card
          bordered={false}
          style={{
            marginTop: 20,
            borderRadius: 20,
            background: colors.white,
            border: `1px solid ${colors.pinkBorder}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
          }}
          bodyStyle={{ padding: "12px 24px 28px 24px" }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarStyle={{ marginBottom: 24 }}
            items={[
              {
                key: "1",
                label: (
                  <span style={{ fontSize: 15, fontWeight: 500 }}>
                    <EditOutlined /> 1. Soạn thảo nội dung
                  </span>
                ),
                children: (
                  <div>
                    {/* Selectors Row */}
                    <Row gutter={20}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="type"
                          label={
                            <Text strong style={{ color: colors.text }}>
                              Phân loại thông báo
                            </Text>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn loại thông báo",
                            },
                          ]}
                        >
                          <Select size="large" options={TYPE_OPTIONS} />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          name="priority"
                          label={
                            <Text strong style={{ color: colors.text }}>
                              Mức độ ưu tiên
                            </Text>
                          }
                          rules={[
                            { required: true, message: "Vui lòng chọn mức độ" },
                          ]}
                        >
                          <Select size="large" options={PRIORITY_OPTIONS} />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Title */}
                    <Form.Item
                      name="title"
                      label={
                        <Text strong style={{ color: colors.text }}>
                          Tiêu đề thông báo
                        </Text>
                      }
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Vui lòng nhập tiêu đề",
                        },
                        { max: 255, message: "Không vượt quá 255 ký tự" },
                      ]}
                    >
                      <Input
                        size="large"
                        maxLength={255}
                        showCount
                        placeholder="Ví dụ: Lịch nghỉ lễ Phục Sinh dành cho các lớp Giáo lý..."
                        style={{ borderRadius: 10 }}
                      />
                    </Form.Item>

                    {/* Content */}
                    <Form.Item
                      name="content"
                      label={
                        <Text strong style={{ color: colors.text }}>
                          Nội dung chi tiết
                        </Text>
                      }
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Vui lòng nhập nội dung",
                        },
                      ]}
                    >
                      <TextArea
                        rows={8}
                        maxLength={3000}
                        showCount
                        placeholder="Nhập đầy đủ thông tin chi tiết cần truyền tải đến mọi người..."
                        style={{ borderRadius: 12 }}
                      />
                    </Form.Item>

                    {/* Guide Note */}
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: 12,
                        background: colors.pinkSoft,
                        border: `1px solid ${colors.pinkLight}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <InfoCircleOutlined
                        style={{ color: colors.pink, fontSize: 16 }}
                      />
                      <Text style={{ fontSize: 13, color: colors.muted }}>
                        Sau khi hoàn tất nội dung, bạn có thể chuyển sang tab{" "}
                        <b>"2. Xem trước"</b> để kiểm tra giao diện hiển thị.
                      </Text>
                    </div>
                  </div>
                ),
              },
              {
                key: "2",
                label: (
                  <span style={{ fontSize: 15, fontWeight: 500 }}>
                    <EyeOutlined /> 2. Xem trước hiển thị
                  </span>
                ),
                children: (
                  <div style={{ padding: "10px 0" }}>
                    <Row gutter={[28, 28]} justify="center">
                      {/* Mobile View Simulation */}
                      <Col xs={24} md={12}>
                        <div style={{ textAlign: "center", marginBottom: 12 }}>
                          <Tag
                            icon={<MobileOutlined />}
                            color="purple"
                            style={{ borderRadius: 10, padding: "2px 10px" }}
                          >
                            Hiển thị trên App Di Động
                          </Tag>
                        </div>
                        <div
                          style={{
                            maxWidth: 360,
                            margin: "0 auto",
                            borderRadius: 24,
                            border: `3px solid ${colors.pinkBorder}`,
                            padding: 16,
                            background: "#FAFAFA",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                          }}
                        >
                          <div
                            style={{
                              background: colors.white,
                              borderRadius: 16,
                              padding: 16,
                              border: "1px solid #E8E8E8",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                              }}
                            >
                              <Space size={4}>
                                <Badge
                                  status="processing"
                                  color={colors.pink}
                                />
                                <Text
                                  strong
                                  style={{
                                    fontSize: 11,
                                    color: colors.pinkDark,
                                  }}
                                >
                                  FaithEdu
                                </Text>
                              </Space>
                              <Text
                                style={{ fontSize: 10, color: colors.softText }}
                              >
                                Vừa xong
                              </Text>
                            </div>

                            <Text
                              strong
                              style={{
                                display: "block",
                                fontSize: 14,
                                color: colors.text,
                                marginBottom: 6,
                              }}
                            >
                              {watchedValues.title?.trim() ||
                                "Tiêu đề thông báo..."}
                            </Text>

                            <Paragraph
                              ellipsis={{ rows: 4 }}
                              style={{
                                fontSize: 12,
                                color: colors.muted,
                                margin: 0,
                                lineHeight: 1.5,
                              }}
                            >
                              {watchedValues.content?.trim() ||
                                "Nội dung chi tiết thông báo sẽ xuất hiện tại đây..."}
                            </Paragraph>

                            <div
                              style={{
                                marginTop: 12,
                                paddingTop: 8,
                                borderTop: "1px dashed #EEE",
                              }}
                            >
                              {getPriorityTag(watchedValues.priority)}
                            </div>
                          </div>
                        </div>
                      </Col>

                      {/* Web Desktop View Simulation */}
                      <Col xs={24} md={12}>
                        <div style={{ textAlign: "center", marginBottom: 12 }}>
                          <Tag
                            icon={<DesktopOutlined />}
                            color="cyan"
                            style={{ borderRadius: 10, padding: "2px 10px" }}
                          >
                            Hiển thị Màn hình Web
                          </Tag>
                        </div>

                        <div
                          style={{
                            borderRadius: 16,
                            border: `1px solid ${colors.pinkBorder}`,
                            background: colors.white,
                            padding: 20,
                            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "flex-start",
                            }}
                          >
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background: colors.pinkLight,
                                color: colors.pink,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                              }}
                            >
                              <BellOutlined />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: 4,
                                }}
                              >
                                <Text
                                  strong
                                  style={{ fontSize: 15, color: colors.text }}
                                >
                                  {watchedValues.title?.trim() ||
                                    "Tiêu đề thông báo..."}
                                </Text>
                                {getPriorityTag(watchedValues.priority)}
                              </div>

                              <Paragraph
                                style={{
                                  fontSize: 13,
                                  color: colors.muted,
                                  lineHeight: 1.6,
                                  whiteSpace: "pre-wrap",
                                  marginBottom: 12,
                                }}
                              >
                                {watchedValues.content?.trim() ||
                                  "Nội dung thông báo mẫu..."}
                              </Paragraph>

                              <Text
                                style={{ fontSize: 11, color: colors.softText }}
                              >
                                Gửi bởi: Ban Quản Trị Giáo Xứ • Ngay bây giờ
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ),
              },
            ]}
          />

          {/* ACTION BUTTONS BAR */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 20,
              borderTop: `1px solid ${colors.pinkLight}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <AppButton
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={loading}
            >
              Làm mới
            </AppButton>

            <Space size={12}>
              {activeTab === "1" ? (
                <AppButton onClick={() => setActiveTab("2")}>
                  Xem trước thông báo
                </AppButton>
              ) : (
                <AppButton onClick={() => setActiveTab("1")}>
                  Quay lại chỉnh sửa
                </AppButton>
              )}

              <AppButton
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                onClick={() => form.submit()}
                style={{ padding: "0 28px" }}
              >
                Gửi thông báo ngay
              </AppButton>
            </Space>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default SendNotificationPage;
