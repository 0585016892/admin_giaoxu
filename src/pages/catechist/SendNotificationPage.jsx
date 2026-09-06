import React, { useState } from "react";

import {
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";

import {
  BellOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import notificationApi from "../../api/notificationApi";

import AppButton from "../../components/common/AppButton";

import PageHeroHeader from "../../components/common/PageHeroHeader";

import { useUser } from "../../context/UserContext";

const { Title, Text, Paragraph } = Typography;

const { TextArea } = Input;

/* ============================================================
   FAITHEDU PINK PASTEL DESIGN SYSTEM
============================================================ */

const colors = {
  pink: "#F4729A",
  pinkDark: "#E85D87",
  pinkLight: "#FFF0F5",
  pinkSoft: "#FFF8FB",
  pinkBorder: "#F8C8D8",

  lavender: "#B98AE8",
  lavenderLight: "#F6EEFF",
  lavenderBorder: "#E9D5FF",

  champagne: "#E6B95C",
  champagneLight: "#FFF8E7",

  text: "#493F47",
  muted: "#918792",
  softText: "#A59BA3",

  white: "#FFFFFF",

  success: "#34B27B",
  successLight: "#ECFDF5",
};

/* ============================================================
   OPTIONS
============================================================ */

const TYPE_OPTIONS = [
  {
    value: "system",
    label: "Hệ thống",
  },
  {
    value: "attendance",
    label: "Điểm danh",
  },
  {
    value: "class",
    label: "Lớp học",
  },
  {
    value: "student",
    label: "Học sinh",
  },
  {
    value: "exam",
    label: "Kỳ thi",
  },
  {
    value: "game",
    label: "Trò chơi",
  },
  {
    value: "achievement",
    label: "Thành tích",
  },
  {
    value: "catechist",
    label: "Giáo lý viên",
  },
  {
    value: "schedule",
    label: "Lịch học",
  },
  {
    value: "announcement",
    label: "Thông báo chung",
  },
  {
    value: "security",
    label: "Bảo mật",
  },
];

const PRIORITY_OPTIONS = [
  {
    value: "low",
    label: "Thấp",
    color: "default",
    description: "Thông báo thông thường",
  },
  {
    value: "normal",
    label: "Bình thường",
    color: "blue",
    description: "Mức độ mặc định",
  },
  {
    value: "high",
    label: "Cao",
    color: "orange",
    description: "Cần chú ý",
  },
  {
    value: "urgent",
    label: "Khẩn cấp",
    color: "red",
    description: "Thông báo quan trọng",
  },
];

/* ============================================================
   HELPERS
============================================================ */

const getTypeLabel = (value) => {
  return (
    TYPE_OPTIONS.find((item) => item.value === value)?.label || "Thông báo"
  );
};

const getPriorityInfo = (value) => {
  return (
    PRIORITY_OPTIONS.find((item) => item.value === value) || {
      label: "Bình thường",
      color: "blue",
      description: "",
    }
  );
};

/* ============================================================
   COMPONENT
============================================================ */

const SendNotificationPage = () => {
  const navigate = useNavigate();

  const { user } = useUser();

  const email = user?.email;

  console.log("Current user:", email);

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const watchedValues = Form.useWatch([], form) || {};

  /* ==========================================================
     DEFAULT VALUES
  ========================================================== */

  const defaultValues = {
    type: "announcement",

    priority: "normal",

    title: "",

    content: "",

    // Giữ các field này để BE không báo lỗi
    // nhưng KHÔNG hiển thị trên giao diện.
    action_url: null,

    related_type: null,

    related_id: null,
  };

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      /* ======================================================
         PAYLOAD
         
         UI không có action_url / related_type / related_id
         nhưng vẫn gửi null xuống BE.
      ====================================================== */

      const payload = {
        type: values.type,

        title: String(values.title || "").trim(),

        content: String(values.content || "").trim(),

        priority: values.priority,

        action_url: null,

        related_type: null,

        related_id: null,
      };

      console.log("========================================");

      console.log("📢 SEND NOTIFICATION");

      console.log(payload);

      console.log("========================================");

      /* ======================================================
         API
      ====================================================== */

      const response = await notificationApi.create(payload);

      console.log("📢 NOTIFICATION RESPONSE:", response);

      /* ======================================================
         RECIPIENT COUNT
      ====================================================== */

      const recipientCount =
        response?.data?.recipient_count ??
        response?.recipient_count ??
        response?.data?.data?.recipient_count;

      /* ======================================================
         SUCCESS
      ====================================================== */

      message.success({
        content:
          recipientCount !== undefined
            ? `Đã gửi thông báo đến ${recipientCount} người dùng trong giáo xứ`
            : "Gửi thông báo thành công",

        duration: 4,
      });

      /* ======================================================
         RESET
      ====================================================== */

      form.resetFields();

      form.setFieldsValue(defaultValues);
    } catch (error) {
      console.error("❌ SEND NOTIFICATION ERROR:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể gửi thông báo",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     RESET
  ========================================================== */

  const handleReset = () => {
    form.resetFields();

    form.setFieldsValue(defaultValues);

    message.info("Đã xóa nội dung thông báo");
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      style={{
        minHeight: "100%",
        padding: 24,

        background: `
          radial-gradient(
            circle at 5% 0%,
            rgba(244,114,154,0.07),
            transparent 28%
          ),
          radial-gradient(
            circle at 95% 10%,
            rgba(185,138,232,0.07),
            transparent 28%
          )
        `,
      }}
    >
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div
        style={{
          marginBottom: 22,
          padding: 4,
        }}
      >
        <PageHeroHeader
          title="Gửi thông báo"
          description="Tạo và gửi thông báo đến toàn bộ người dùng thuộc giáo xứ"
          icon={<BellOutlined />}
          onBack={() => navigate(-1)}
          extra={
            <AppButton
              type="primary"
              icon={<SendOutlined />}
              loading={loading}
              onClick={() => form.submit()}
            >
              Gửi thông báo
            </AppButton>
          }
        />
      </div>

      {/* ======================================================
          FORM
      ====================================================== */}

      <Form
        form={form}
        layout="vertical"
        initialValues={defaultValues}
        onFinish={handleSubmit}
      >
        <Row gutter={[22, 22]}>
          {/* ==================================================
              LEFT CONTENT
          ================================================== */}

          <Col xs={24} xl={16}>
            <Card
              bordered={false}
              style={{
                borderRadius: 24,
                overflow: "hidden",

                background: colors.white,

                border: `1px solid ${colors.pinkBorder}`,

                boxShadow: "0 12px 40px rgba(244,114,154,0.08)",
              }}
              styles={{
                body: {
                  padding: 0,
                },
              }}
            >
              {/* TOP GRADIENT */}

              <div
                style={{
                  height: 5,

                  background:
                    "linear-gradient(90deg, #F4729A 0%, #F8A8BF 45%, #B98AE8 100%)",
                }}
              />

              <div
                style={{
                  padding: 30,
                }}
              >
                {/* HEADER */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 15,
                    marginBottom: 30,
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      minWidth: 50,

                      borderRadius: 16,

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      background: "linear-gradient(135deg, #FFF0F5, #F6EEFF)",

                      color: colors.pink,

                      fontSize: 22,

                      boxShadow: "0 8px 20px rgba(244,114,154,0.10)",
                    }}
                  >
                    <BellOutlined />
                  </div>

                  <div>
                    <Title
                      level={4}
                      style={{
                        margin: 0,

                        color: colors.text,

                        fontWeight: 750,
                      }}
                    >
                      Nội dung thông báo
                    </Title>

                    <Text
                      style={{
                        display: "block",

                        marginTop: 5,

                        color: colors.muted,

                        fontSize: 13,
                      }}
                    >
                      Nội dung này sẽ xuất hiện trên hệ thống của toàn bộ người
                      dùng trong giáo xứ.
                    </Text>
                  </div>
                </div>

                {/* TYPE + PRIORITY */}

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="type"
                      label={
                        <span
                          style={{
                            color: colors.text,
                            fontWeight: 650,
                          }}
                        >
                          Loại thông báo
                        </span>
                      }
                      rules={[
                        {
                          required: true,

                          message: "Vui lòng chọn loại thông báo",
                        },
                      ]}
                    >
                      <Select
                        size="large"
                        placeholder="Chọn loại thông báo"
                        options={TYPE_OPTIONS}
                        style={{
                          width: "100%",
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="priority"
                      label={
                        <span
                          style={{
                            color: colors.text,
                            fontWeight: 650,
                          }}
                        >
                          Mức độ ưu tiên
                        </span>
                      }
                      rules={[
                        {
                          required: true,

                          message: "Vui lòng chọn mức độ",
                        },
                      ]}
                    >
                      <Select
                        size="large"
                        placeholder="Chọn mức độ"
                        options={PRIORITY_OPTIONS.map((item) => ({
                          value: item.value,

                          label: item.label,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* TITLE */}

                <Form.Item
                  name="title"
                  label={
                    <span
                      style={{
                        color: colors.text,

                        fontWeight: 650,
                      }}
                    >
                      Tiêu đề thông báo
                    </span>
                  }
                  rules={[
                    {
                      required: true,

                      whitespace: true,

                      message: "Vui lòng nhập tiêu đề thông báo",
                    },

                    {
                      max: 255,

                      message: "Tiêu đề tối đa 255 ký tự",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    maxLength={255}
                    showCount
                    placeholder="Ví dụ: Thông báo nghỉ học Chủ nhật"
                  />
                </Form.Item>

                {/* CONTENT */}

                <Form.Item
                  name="content"
                  label={
                    <span
                      style={{
                        color: colors.text,

                        fontWeight: 650,
                      }}
                    >
                      Nội dung thông báo
                    </span>
                  }
                  rules={[
                    {
                      required: true,

                      whitespace: true,

                      message: "Vui lòng nhập nội dung thông báo",
                    },
                  ]}
                >
                  <TextArea
                    rows={12}
                    maxLength={5000}
                    showCount
                    placeholder={
                      "Nhập nội dung thông báo...\n\nVí dụ:\nChủ nhật tuần này lớp giáo lý sẽ nghỉ học. Các giáo lý viên vui lòng thông báo lại cho học sinh."
                    }
                  />
                </Form.Item>

                {/* SIMPLE INFO */}

                <div
                  style={{
                    marginTop: 8,

                    padding: 14,

                    borderRadius: 14,

                    background: colors.pinkSoft,

                    border: `1px dashed ${colors.pinkBorder}`,

                    display: "flex",

                    alignItems: "center",

                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,

                      minWidth: 30,

                      borderRadius: 10,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      background: colors.pinkLight,

                      color: colors.pink,
                    }}
                  >
                    <BellOutlined />
                  </div>

                  <Text
                    style={{
                      color: colors.muted,

                      fontSize: 12,

                      lineHeight: 1.6,
                    }}
                  >
                    Thông báo sẽ được gửi đến toàn bộ người dùng thuộc giáo xứ
                    của tài khoản hiện tại.
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* ==================================================
              RIGHT SIDEBAR
          ================================================== */}

          <Col xs={24} xl={8}>
            <Space
              direction="vertical"
              size={22}
              style={{
                width: "100%",
              }}
            >
              {/* ==================================================
                  RECIPIENT
              ================================================== */}

              <Card
                bordered={false}
                style={{
                  borderRadius: 24,

                  background: colors.white,

                  border: `1px solid ${colors.pinkBorder}`,

                  boxShadow: "0 12px 35px rgba(244,114,154,0.07)",
                }}
                styles={{
                  body: {
                    padding: 24,
                  },
                }}
              >
                <div
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: 12,

                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 42,

                      height: 42,

                      borderRadius: 14,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      background: colors.pinkLight,

                      color: colors.pink,

                      fontSize: 19,
                    }}
                  >
                    <TeamOutlined />
                  </div>

                  <Title
                    level={4}
                    style={{
                      margin: 0,

                      color: colors.text,
                    }}
                  >
                    Người nhận
                  </Title>
                </div>

                <Text
                  style={{
                    display: "block",

                    color: colors.muted,

                    fontSize: 12,

                    lineHeight: 1.65,

                    marginBottom: 18,
                  }}
                >
                  Hệ thống tự động xác định người nhận dựa trên giáo xứ của tài
                  khoản đang gửi.
                </Text>

                <div
                  style={{
                    padding: 18,

                    borderRadius: 18,

                    background: "linear-gradient(135deg, #FFF0F5, #F8F0FF)",

                    border: `1px solid ${colors.pinkBorder}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: 13,
                    }}
                  >
                    <div
                      style={{
                        width: 48,

                        height: 48,

                        borderRadius: 16,

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        background: colors.white,

                        color: colors.pink,

                        fontSize: 21,

                        boxShadow: "0 6px 16px rgba(244,114,154,0.12)",
                      }}
                    >
                      <TeamOutlined />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 15,

                          fontWeight: 750,

                          color: colors.text,
                        }}
                      >
                        Toàn bộ giáo lý viên
                      </div>

                      <div
                        style={{
                          marginTop: 4,

                          fontSize: 11,

                          color: colors.muted,
                        }}
                      >
                        Trong giáo xứ hiện tại
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ==================================================
                  PREVIEW
              ================================================== */}

              <Card
                bordered={false}
                style={{
                  borderRadius: 24,

                  background: colors.white,

                  border: `1px solid ${colors.pinkBorder}`,

                  boxShadow: "0 12px 35px rgba(185,138,232,0.07)",
                }}
                styles={{
                  body: {
                    padding: 24,
                  },
                }}
              >
                <div
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: 12,

                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 42,

                      height: 42,

                      borderRadius: 14,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      background: colors.lavenderLight,

                      color: colors.lavender,

                      fontSize: 19,
                    }}
                  >
                    <EyeOutlined />
                  </div>

                  <Title
                    level={4}
                    style={{
                      margin: 0,

                      color: colors.text,
                    }}
                  >
                    Xem trước
                  </Title>
                </div>

                {/* NOTIFICATION PREVIEW */}

                <div
                  style={{
                    borderRadius: 20,

                    overflow: "hidden",

                    background: colors.white,

                    border: `1px solid ${colors.pinkBorder}`,

                    boxShadow: "0 8px 25px rgba(244,114,154,0.09)",
                  }}
                >
                  {/* TOP */}

                  <div
                    style={{
                      padding: "15px 16px",

                      background: "linear-gradient(135deg, #FFF0F5, #F7F0FF)",

                      borderBottom: `1px solid ${colors.pinkBorder}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",

                        alignItems: "center",

                        gap: 11,
                      }}
                    >
                      <div
                        style={{
                          width: 42,

                          height: 42,

                          borderRadius: 14,

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          background: colors.white,

                          color: colors.pink,

                          fontSize: 19,

                          boxShadow: "0 5px 15px rgba(244,114,154,0.12)",
                        }}
                      >
                        <BellOutlined />
                      </div>

                      <div>
                        <div
                          style={{
                            fontWeight: 750,

                            color: colors.text,

                            fontSize: 14,
                          }}
                        >
                          FaithEdu
                        </div>

                        <div
                          style={{
                            marginTop: 2,

                            color: colors.muted,

                            fontSize: 10,
                          }}
                        >
                          Thông báo mới
                        </div>
                      </div>

                      <div
                        style={{
                          width: 7,

                          height: 7,

                          borderRadius: "50%",

                          background: colors.pink,

                          marginLeft: "auto",

                          boxShadow: "0 0 0 4px rgba(244,114,154,0.12)",
                        }}
                      />
                    </div>
                  </div>

                  {/* BODY */}

                  <div
                    style={{
                      padding: 17,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",

                        justifyContent: "space-between",

                        alignItems: "center",

                        gap: 8,

                        marginBottom: 13,

                        flexWrap: "wrap",
                      }}
                    >
                      <Tag
                        style={{
                          margin: 0,

                          borderRadius: 999,

                          background: colors.pinkLight,

                          borderColor: colors.pinkBorder,

                          color: colors.pinkDark,

                          fontSize: 10,

                          padding: "2px 9px",
                        }}
                      >
                        {getTypeLabel(watchedValues.type || "announcement")}
                      </Tag>

                      <Tag
                        style={{
                          margin: 0,

                          borderRadius: 999,

                          fontSize: 10,
                        }}
                        color={
                          getPriorityInfo(watchedValues.priority || "normal")
                            .color
                        }
                      >
                        {
                          getPriorityInfo(watchedValues.priority || "normal")
                            .label
                        }
                      </Tag>
                    </div>

                    <div
                      style={{
                        fontWeight: 750,

                        fontSize: 15,

                        color: colors.text,

                        marginBottom: 8,

                        lineHeight: 1.45,

                        wordBreak: "break-word",
                      }}
                    >
                      {watchedValues.title?.trim() || "Tiêu đề thông báo"}
                    </div>

                    <Paragraph
                      ellipsis={{
                        rows: 5,
                      }}
                      style={{
                        margin: 0,

                        color: colors.muted,

                        fontSize: 12,

                        lineHeight: 1.7,

                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {watchedValues.content?.trim() ||
                        "Nội dung thông báo sẽ hiển thị tại đây..."}
                    </Paragraph>

                    <div
                      style={{
                        display: "flex",

                        justifyContent: "space-between",

                        alignItems: "center",

                        marginTop: 16,

                        paddingTop: 12,

                        borderTop: "1px dashed #F3DCE5",
                      }}
                    >
                      <span
                        style={{
                          color: colors.softText,

                          fontSize: 10,
                        }}
                      >
                        Vừa xong
                      </span>

                      <span
                        style={{
                          color: colors.pink,

                          fontSize: 11,

                          fontWeight: 650,
                        }}
                      >
                        Thông báo FaithEdu
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ==================================================
                  SCOPE
              ================================================== */}
            </Space>
          </Col>
        </Row>

        {/* ======================================================
            ACTION BAR
        ====================================================== */}

        <Card
          bordered={false}
          style={{
            marginTop: 22,

            borderRadius: 22,

            background: "rgba(255,255,255,0.92)",

            border: `1px solid ${colors.pinkBorder}`,

            boxShadow: "0 10px 35px rgba(244,114,154,0.08)",
          }}
          styles={{
            body: {
              padding: "17px 22px",
            },
          }}
        >
          <div
            style={{
              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",

              gap: 18,

              flexWrap: "wrap",
            }}
          >
            {/* LEFT */}

            <div>
              <Space size={9}>
                <div
                  style={{
                    width: 27,

                    height: 27,

                    borderRadius: 9,

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    background: colors.successLight,
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      color: colors.success,

                      fontSize: 14,
                    }}
                  />
                </div>

                <Text
                  strong
                  style={{
                    color: colors.text,
                  }}
                >
                  Sẵn sàng gửi thông báo
                </Text>
              </Space>

              <div
                style={{
                  marginTop: 6,

                  color: colors.muted,

                  fontSize: 11,
                }}
              >
                Vui lòng kiểm tra lại nội dung trước khi gửi đến toàn bộ người
                dùng.
              </div>
            </div>

            {/* RIGHT */}

            <Space wrap size={9}>
              <AppButton
                icon={<DeleteOutlined />}
                onClick={handleReset}
                disabled={loading}
              >
                Xóa nội dung
              </AppButton>

              <AppButton onClick={() => navigate(-1)} disabled={loading}>
                Hủy
              </AppButton>

              <AppButton
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                onClick={() => form.submit()}
              >
                Gửi đến giáo xứ
              </AppButton>
            </Space>
          </div>
        </Card>
      </Form>

      {/* ======================================================
          ANT DESIGN PINK OVERRIDES
      ====================================================== */}

      <style>
        {`
          .ant-input,
          .ant-input-number,
          .ant-select-selector {
            border-radius: 13px !important;
            border-color: #F8D8E3 !important;
            background: #FFFCFD !important;
          }

          .ant-input:hover,
          .ant-input-number:hover,
          .ant-select-selector:hover {
            border-color: #F4729A !important;
          }

          .ant-input:focus,
          .ant-input-focused,
          .ant-input-number-focused,
          .ant-select-focused .ant-select-selector {
            border-color: #F4729A !important;
            box-shadow:
              0 0 0 3px rgba(244,114,154,0.10) !important;
          }

          .ant-input-textarea textarea {
            border-radius: 13px !important;
          }

          .ant-form-item-label > label {
            color: #493F47 !important;
          }

          .ant-select-selection-placeholder {
            color: #B1A6AE !important;
          }

          .ant-input::placeholder,
          .ant-input-number-input::placeholder,
          textarea::placeholder {
            color: #B8ADB5 !important;
          }

          .ant-select-dropdown {
            border-radius: 14px !important;

            box-shadow:
              0 15px 40px rgba(244,114,154,0.12) !important;
          }

          .ant-select-item-option-selected {
            background: #FFF0F5 !important;

            color: #E85D87 !important;
          }

          .ant-select-item-option-active {
            background: #FFF8FB !important;
          }

          @media (max-width: 768px) {
            .ant-card {
              border-radius: 18px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SendNotificationPage;
