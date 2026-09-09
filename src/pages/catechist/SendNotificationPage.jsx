import React, { useState } from "react";
import {
  Alert,
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
  Switch,
  Divider,
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
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import notificationApi from "../../api/notificationApi";
import AppButton from "../../components/common/AppButton";
import PageHeroHeader from "../../components/common/PageHeroHeader";

import { useUser } from "../../context/UserContext";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

/* ============================================================
   DESIGN SYSTEM COLORS
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
  danger: "#E85D75",

  bgGradient: "linear-gradient(135deg, #FFF0F5 0%, #F6EEFF 100%)",
};

/* ============================================================
   OPTIONS
============================================================ */

const TYPE_OPTIONS = [
  {
    value: "announcement",
    label: "📢 Thông báo chung",
  },
  {
    value: "system",
    label: "⚙️ Hệ thống",
  },
  {
    value: "class",
    label: "🏫 Lớp học",
  },
  {
    value: "attendance",
    label: "📅 Điểm danh",
  },
  {
    value: "student",
    label: "🎓 Học viên",
  },
  {
    value: "catechist",
    label: "✝️ Giáo lý viên",
  },
  {
    value: "exam",
    label: "📝 Bài thi",
  },
  {
    value: "achievement",
    label: "🏆 Thành tích",
  },
  {
    value: "security",
    label: "🔒 Bảo mật",
  },
];

const PRIORITY_OPTIONS = [
  {
    value: "low",
    label: "🟢 Thấp (Thông tin phụ)",
    color: "default",
  },
  {
    value: "normal",
    label: "🔵 Bình thường",
    color: "processing",
  },
  {
    value: "high",
    label: "🟠 Cao (Quan trọng)",
    color: "warning",
  },
  {
    value: "urgent",
    label: "🔴 Khẩn cấp (Ngay lập tức)",
    color: "error",
  },
];

/* ============================================================
   COMPONENT
============================================================ */

const SendNotificationPage = () => {
  const navigate = useNavigate();

  /* ============================================================
     USER CONTEXT
  ============================================================ */

  const { user } = useUser();

  console.log("Current user:", user);

  /*
   * Chỉ role này mới được phép gửi Email.
   *
   * Các role khác:
   * - Vẫn gửi Notification bình thường
   * - Không được bật Email
   */
  const isAdminCatechist = user?.role === "admin_catechist";

  /* ============================================================
     STATE
  ============================================================ */

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("1");

  /*
   * Theo dõi toàn bộ Form để Live Preview
   */
  const watchedValues = Form.useWatch([], form) || {};

  /* ============================================================
     DEFAULT VALUES
  ============================================================ */

  const defaultValues = {
    type: "announcement",

    priority: "normal",

    title: "",

    content: "",

    send_email: false,

    action_url: null,

    related_type: null,

    related_id: null,
  };

  /* ============================================================
     GET PRIORITY TAG
  ============================================================ */

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

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async (values) => {
    /*
     * Nếu role không phải admin_catechist
     * mà somehow send_email = true
     * thì chặn luôn.
     */
    if (values.send_email && !isAdminCatechist) {
      message.error(
        "Chỉ Quản trị viên Giáo lý mới có quyền gửi thông báo qua Email!",
      );

      /*
       * Reset lại Switch
       */
      form.setFieldValue("send_email", false);

      return;
    }

    try {
      setLoading(true);

      /* ========================================================
         PAYLOAD
      ======================================================== */

      const payload = {
        type: values.type,

        title: String(values.title || "").trim(),

        content: String(values.content || "").trim(),

        priority: values.priority,

        /*
         * Bảo mật thêm:
         *
         * admin_catechist:
         *   có thể true / false
         *
         * role khác:
         *   luôn false
         */
        send_email: isAdminCatechist ? Boolean(values.send_email) : false,

        action_url: null,

        related_type: null,

        related_id: null,
      };

      console.log("Notification payload:", payload);

      /* ========================================================
         API
      ======================================================== */

      const response = await notificationApi.create(payload);

      /* ========================================================
         RECIPIENT COUNT
      ======================================================== */

      const recipientCount =
        response?.data?.recipient_count ??
        response?.recipient_count ??
        response?.data?.data?.recipient_count;

      /* ========================================================
         EMAIL COUNT
      ======================================================== */

      const emailCount =
        response?.data?.email_recipient_count ??
        response?.email_recipient_count ??
        response?.data?.data?.email_recipient_count;

      /* ========================================================
         SUCCESS MESSAGE
      ======================================================== */

      let successContent = "";

      /*
       * Có số người nhận Notification
       */
      if (recipientCount !== undefined) {
        successContent = `Đã phát thông báo thành công tới ${recipientCount} thành viên!`;

        /*
         * Có bật Email
         */
        if (payload.send_email) {
          if (emailCount !== undefined) {
            successContent += ` Email đã được gửi tới ${emailCount} người.`;
          } else {
            successContent +=
              " Hệ thống đã yêu cầu gửi Email tới các thành viên.";
          }
        }
      } else {
        /*
         * Không có recipient_count
         */
        successContent = payload.send_email
          ? "Gửi thông báo và Email thành công!"
          : "Gửi thông báo thành công!";
      }

      message.success({
        content: successContent,

        duration: 5,
      });

      /* ========================================================
         RESET
      ======================================================== */

      form.resetFields();

      form.setFieldsValue(defaultValues);

      setActiveTab("1");
    } catch (error) {
      console.error("Send notification error:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể gửi thông báo. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     RESET
  ============================================================ */

  const handleReset = () => {
    form.resetFields();

    form.setFieldsValue(defaultValues);

    setActiveTab("1");

    message.info("Đã làm sạch toàn bộ nội dung");
  };

  /* ============================================================
     EMAIL SWITCH
  ============================================================ */

  const handleEmailChange = (checked) => {
    /*
     * Role khác không thể bật
     */
    if (checked && !isAdminCatechist) {
      message.warning("Chỉ Quản trị viên Giáo lý mới có quyền gửi Email!");

      form.setFieldValue("send_email", false);

      return;
    }

    form.setFieldValue("send_email", checked);
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        paddingBottom: 40,
      }}
    >
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <PageHeroHeader
        title="Phát thông báo"
        description="Soạn thảo và gửi thông cáo tức thì đến toàn bộ giáo lý viên, học viên trong hệ thống."
        icon={<BellOutlined />}
        onBack={() => navigate(-1)}
      />

      {/* ======================================================
          ROLE INFORMATION
      ====================================================== */}

      <div
        style={{
          marginTop: 12,
        }}
      >
        <Tag
          icon={<CheckCircleOutlined />}
          color="success"
          style={{
            padding: "5px 12px",
            borderRadius: 20,
          }}
        >
          Được phép gửi App Notification
        </Tag>

        {isAdminCatechist ? (
          <Tag
            icon={<MailOutlined />}
            color="pink"
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              marginLeft: 8,
            }}
          >
            Được phép gửi Email
          </Tag>
        ) : (
          <Tag
            icon={<LockOutlined />}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              marginLeft: 8,
            }}
          >
            Email chỉ dành cho admin_catechist
          </Tag>
        )}
      </div>

      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      <Card
        bordered={false}
        style={{
          marginTop: 20,
          borderRadius: 18,
          background: colors.bgGradient,
          border: `1px solid ${colors.pinkBorder}`,
        }}
        bodyStyle={{
          padding: "18px 24px",
        }}
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
                  style={{
                    fontSize: 15,
                    color: colors.text,
                    display: "block",
                  }}
                >
                  Toàn hệ thống
                </Text>

                <Text
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                  }}
                >
                  Thông báo sẽ hiển thị trực tiếp trên tài khoản của tất cả
                  thành viên thuộc Giáo xứ.
                </Text>
              </div>
            </Space>
          </Col>

          <Col
            xs={24}
            md={8}
            style={{
              textAlign: "right",
            }}
          >
            <Tag
              color="pink"
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
              }}
            >
              <CheckCircleOutlined /> Kênh: App Notification
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* ======================================================
          FORM
      ====================================================== */}

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
          bodyStyle={{
            padding: "12px 24px 28px 24px",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarStyle={{
              marginBottom: 24,
            }}
            items={[
              /* ==================================================
                 TAB 1
              ================================================== */

              {
                key: "1",

                label: (
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    <EditOutlined /> 1. Soạn thảo nội dung
                  </span>
                ),

                children: (
                  <div>
                    {/* ==========================================
                        TYPE + PRIORITY
                    ========================================== */}

                    <Row gutter={20}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="type"
                          label={
                            <Text
                              strong
                              style={{
                                color: colors.text,
                              }}
                            >
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
                            <Text
                              strong
                              style={{
                                color: colors.text,
                              }}
                            >
                              Mức độ ưu tiên
                            </Text>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn mức độ",
                            },
                          ]}
                        >
                          <Select size="large" options={PRIORITY_OPTIONS} />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* ==========================================
                        TITLE
                    ========================================== */}

                    <Form.Item
                      name="title"
                      label={
                        <Text
                          strong
                          style={{
                            color: colors.text,
                          }}
                        >
                          Tiêu đề thông báo
                        </Text>
                      }
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Vui lòng nhập tiêu đề",
                        },
                        {
                          max: 255,
                          message: "Không vượt quá 255 ký tự",
                        },
                      ]}
                    >
                      <Input
                        size="large"
                        maxLength={255}
                        showCount
                        placeholder="Ví dụ: Lịch nghỉ lễ Phục Sinh dành cho các lớp Giáo lý..."
                        style={{
                          borderRadius: 10,
                        }}
                      />
                    </Form.Item>

                    {/* ==========================================
                        CONTENT
                    ========================================== */}

                    <Form.Item
                      name="content"
                      label={
                        <Text
                          strong
                          style={{
                            color: colors.text,
                          }}
                        >
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
                        style={{
                          borderRadius: 12,
                        }}
                      />
                    </Form.Item>

                    {/* ==========================================
                        EMAIL
                    ========================================== */}

                    <Divider />

                    <Form.Item
                      name="send_email"
                      valuePropName="checked"
                      style={{
                        marginBottom: 12,
                      }}
                    >
                      <Card
                        size="small"
                        bordered={false}
                        style={{
                          borderRadius: 14,

                          background: watchedValues.send_email
                            ? "#FFF8FB"
                            : "#FAFAFA",

                          border: watchedValues.send_email
                            ? `1px solid ${colors.pinkBorder}`
                            : "1px solid #EEEEEE",

                          opacity: !isAdminCatechist ? 0.85 : 1,
                        }}
                        bodyStyle={{
                          padding: "16px 18px",
                        }}
                      >
                        <Row
                          align="middle"
                          justify="space-between"
                          gutter={[16, 12]}
                        >
                          <Col flex="auto">
                            <Space align="start" size={12}>
                              <div
                                style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: 12,

                                  background: watchedValues.send_email
                                    ? colors.pinkLight
                                    : "#F0F0F0",

                                  color: watchedValues.send_email
                                    ? colors.pink
                                    : colors.muted,

                                  display: "flex",

                                  alignItems: "center",

                                  justifyContent: "center",

                                  fontSize: 18,
                                }}
                              >
                                <MailOutlined />
                              </div>

                              <div>
                                <Text
                                  strong
                                  style={{
                                    display: "block",
                                    color: colors.text,
                                    fontSize: 14,
                                  }}
                                >
                                  Gửi kèm thông báo qua Email
                                </Text>

                                <Text
                                  style={{
                                    color: colors.muted,
                                    fontSize: 12,
                                  }}
                                >
                                  Gửi thêm nội dung thông báo tới email của các
                                  thành viên.
                                </Text>

                                {/* ==================================
                                    ROLE WARNING
                                ================================== */}

                                {!isAdminCatechist && (
                                  <div
                                    style={{
                                      marginTop: 7,
                                    }}
                                  >
                                    <Tag
                                      icon={<LockOutlined />}
                                      color="default"
                                      style={{
                                        borderRadius: 8,
                                        fontSize: 11,
                                      }}
                                    >
                                      Chỉ admin_catechist
                                    </Tag>
                                  </div>
                                )}
                              </div>
                            </Space>
                          </Col>

                          <Col>
                            <Switch
                              checked={Boolean(watchedValues.send_email)}
                              disabled={!isAdminCatechist || loading}
                              onChange={handleEmailChange}
                              checkedChildren={<MailOutlined />}
                              unCheckedChildren={<LockOutlined />}
                            />
                          </Col>
                        </Row>
                      </Card>
                    </Form.Item>

                    {/* ==========================================
                        EMAIL ALERT
                    ========================================== */}

                    {watchedValues.send_email && isAdminCatechist && (
                      <Alert
                        type="info"
                        showIcon
                        icon={<MailOutlined />}
                        message="Email sẽ được gửi"
                        description="Thông báo sẽ được gửi trên ứng dụng và đồng thời gửi email tới các thành viên có địa chỉ email hợp lệ."
                        style={{
                          borderRadius: 12,
                          marginBottom: 20,
                        }}
                      />
                    )}

                    {/* ==========================================
                        GUIDE
                    ========================================== */}

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
                        style={{
                          color: colors.pink,
                          fontSize: 16,
                        }}
                      />

                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.muted,
                        }}
                      >
                        Sau khi hoàn tất nội dung, bạn có thể chuyển sang tab{" "}
                        <b>"2. Xem trước"</b> để kiểm tra giao diện hiển thị.
                      </Text>
                    </div>
                  </div>
                ),
              },

              /* ==================================================
                 TAB 2
              ================================================== */

              {
                key: "2",

                label: (
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    <EyeOutlined /> 2. Xem trước hiển thị
                  </span>
                ),

                children: (
                  <div
                    style={{
                      padding: "10px 0",
                    }}
                  >
                    <Row gutter={[28, 28]} justify="center">
                      {/* ==========================================
                          MOBILE PREVIEW
                      ========================================== */}

                      <Col xs={24} md={12}>
                        <div
                          style={{
                            textAlign: "center",
                            marginBottom: 12,
                          }}
                        >
                          <Tag
                            icon={<MobileOutlined />}
                            color="purple"
                            style={{
                              borderRadius: 10,
                              padding: "2px 10px",
                            }}
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
                                style={{
                                  fontSize: 10,
                                  color: colors.softText,
                                }}
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
                              ellipsis={{
                                rows: 4,
                              }}
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

                      {/* ==========================================
                          WEB PREVIEW
                      ========================================== */}

                      <Col xs={24} md={12}>
                        <div
                          style={{
                            textAlign: "center",
                            marginBottom: 12,
                          }}
                        >
                          <Tag
                            icon={<DesktopOutlined />}
                            color="cyan"
                            style={{
                              borderRadius: 10,
                              padding: "2px 10px",
                            }}
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

                            <div
                              style={{
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: 4,
                                }}
                              >
                                <Text
                                  strong
                                  style={{
                                    fontSize: 15,
                                    color: colors.text,
                                  }}
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
                                style={{
                                  fontSize: 11,
                                  color: colors.softText,
                                }}
                              >
                                Gửi bởi: Ban Quản Trị Giáo Xứ • Ngay bây giờ
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Col>

                      {/* ==========================================
                          EMAIL PREVIEW
                      ========================================== */}

                      {watchedValues.send_email && isAdminCatechist && (
                        <Col span={24}>
                          <div
                            style={{
                              maxWidth: 700,
                              margin: "0 auto",
                            }}
                          >
                            <div
                              style={{
                                textAlign: "center",
                                marginBottom: 12,
                              }}
                            >
                              <Tag
                                icon={<MailOutlined />}
                                color="pink"
                                style={{
                                  borderRadius: 10,
                                  padding: "2px 10px",
                                }}
                              >
                                Email sẽ được gửi
                              </Tag>
                            </div>

                            <Card
                              style={{
                                borderRadius: 16,
                                border: `1px solid ${colors.pinkBorder}`,
                              }}
                            >
                              <Space
                                direction="vertical"
                                size={8}
                                style={{
                                  width: "100%",
                                }}
                              >
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: 12,
                                  }}
                                >
                                  ✉️ FaithEdu Notification
                                </Text>

                                <Text
                                  strong
                                  style={{
                                    fontSize: 18,
                                    color: colors.text,
                                  }}
                                >
                                  {watchedValues.title || "Tiêu đề thông báo"}
                                </Text>

                                <Paragraph
                                  style={{
                                    whiteSpace: "pre-wrap",
                                    marginBottom: 0,
                                  }}
                                >
                                  {watchedValues.content ||
                                    "Nội dung thông báo"}
                                </Paragraph>

                                <Divider
                                  style={{
                                    margin: "12px 0",
                                  }}
                                />

                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: 11,
                                  }}
                                >
                                  Email được gửi tự động bởi hệ thống FaithEdu.
                                </Text>
                              </Space>
                            </Card>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </div>
                ),
              },
            ]}
          />

          {/* ====================================================
              ACTION BAR
          ==================================================== */}

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
            {/* RESET */}

            <AppButton
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={loading}
            >
              Làm mới
            </AppButton>

            <Space size={12}>
              {/* PREVIEW / BACK */}

              {activeTab === "1" ? (
                <AppButton onClick={() => setActiveTab("2")}>
                  Xem trước thông báo
                </AppButton>
              ) : (
                <AppButton onClick={() => setActiveTab("1")}>
                  Quay lại chỉnh sửa
                </AppButton>
              )}

              {/* SEND */}

              <AppButton
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                onClick={() => form.submit()}
                style={{
                  padding: "0 28px",
                }}
              >
                {watchedValues.send_email && isAdminCatechist
                  ? "Gửi thông báo & Email"
                  : "Gửi thông báo ngay"}
              </AppButton>
            </Space>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default SendNotificationPage;
