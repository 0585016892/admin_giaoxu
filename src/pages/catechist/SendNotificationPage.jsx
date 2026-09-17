import React, { useState } from "react";
import {
  Alert,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
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
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  ReloadOutlined,
  SendOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import notificationApi from "../../api/notificationApi";
import AppButton from "../../components/common/AppButton";
import PageHeroHeader from "../../components/common/PageHeroHeader";

import { useUser } from "../../context/UserContext";

const { Title } = Typography;
const { TextArea } = Input;

/* ============================================================
   DESIGN SYSTEM
============================================================ */

const colors = {
  navy: "#173B5E",
  navyDark: "#102C46",
  navyHover: "#244F78",
  navyLight: "#EEF3F7",

  gold: "#D9A441",
  goldDark: "#B8862F",
  goldLight: "#FBF5E7",

  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#173B5E",
  textDark: "#1E293B",
  muted: "#64748B",
  softText: "#94A3B8",

  border: "#E2E8F0",

  success: "#2E7D5B",
  successLight: "#EAF6F0",

  danger: "#C0392B",
  dangerLight: "#FDEDEC",

  blue: "#356FA3",
  blueLight: "#EDF4FA",

  purple: "#7653A6",
  purpleLight: "#F4EFFA",

  bg: "#F7F9FC",
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

  const isAdminCatechist = user?.role === "admin_catechist";

  /* ============================================================
     STATE
  ============================================================ */

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("1");

  /* ============================================================
     WATCH FORM
  ============================================================ */

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
     PRIORITY TAG
  ============================================================ */

  const getPriorityTag = (priority) => {
    switch (priority) {
      case "urgent":
        return (
          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 6,
              color: colors.danger,
              background: colors.dangerLight,
              fontWeight: 700,
            }}
          >
            Khẩn cấp
          </Tag>
        );

      case "high":
        return (
          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 6,
              color: colors.goldDark,
              background: colors.goldLight,
              fontWeight: 700,
            }}
          >
            Cao
          </Tag>
        );

      case "low":
        return (
          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 6,
              color: colors.muted,
              background: "#F1F5F9",
              fontWeight: 600,
            }}
          >
            Thấp
          </Tag>
        );

      default:
        return (
          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 6,
              color: colors.blue,
              background: colors.blueLight,
              fontWeight: 700,
            }}
          >
            Bình thường
          </Tag>
        );
    }
  };

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async (values) => {
    /*
     * Chặn role không được gửi Email
     */

    if (values.send_email && !isAdminCatechist) {
      message.error(
        "Chỉ Quản trị viên Giáo lý mới có quyền gửi thông báo qua Email!",
      );

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

        send_email: isAdminCatechist ? Boolean(values.send_email) : false,

        action_url: null,

        related_type: null,

        related_id: null,
      };

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
         SUCCESS
      ======================================================== */

      let successContent = "";

      if (recipientCount !== undefined) {
        successContent = `Đã phát thông báo thành công tới ${recipientCount} thành viên!`;

        if (payload.send_email) {
          if (emailCount !== undefined) {
            successContent += ` Email đã được gửi tới ${emailCount} người.`;
          } else {
            successContent +=
              " Hệ thống đã yêu cầu gửi Email tới các thành viên.";
          }
        }
      } else {
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
    if (checked && !isAdminCatechist) {
      message.warning("Chỉ Quản trị viên Giáo lý mới có quyền gửi Email!");

      form.setFieldValue("send_email", false);

      return;
    }

    form.setFieldValue("send_email", checked);
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="send-notification-page">
      <style>{`

        /* ======================================================
           PAGE
        ====================================================== */

        .send-notification-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding-bottom: 40px;

          color: ${colors.text};

          font-family:
            "Be Vietnam Pro",
            "Inter",
            Arial,
            sans-serif;
        }

        .send-notification-page * {
          box-sizing: border-box;
        }


        /* ======================================================
           PERMISSION BAR
        ====================================================== */

        .notification-permission {
          display: flex;

          align-items: center;

          gap: 8px;

          flex-wrap: wrap;

          margin-top: 14px;
        }

        .permission-tag {
          margin: 0 !important;

          padding:
            5px 11px !important;

          border-radius: 7px !important;

          font-size: 11px !important;

          font-weight: 600;
        }


        /* ======================================================
           OVERVIEW CARD
        ====================================================== */

        .notification-overview {
          margin-top: 18px;

          border-radius: 14px !important;

          border:
            1px solid
            ${colors.border} !important;

          background:
            ${colors.white};

          box-shadow:
            0 5px 18px
            rgba(15, 23, 42, 0.035);
        }

        .notification-overview-inner {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;
        }

        .notification-overview-left {
          display: flex;

          align-items: center;

          gap: 13px;
        }

        .notification-overview-icon {
          width: 46px;
          height: 46px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 10px;

          color:
            ${colors.navy};

          background:
            ${colors.navyLight};

          border:
            1px solid
            ${colors.border};

          font-size: 19px;
        }

        .notification-overview-title {
          display: block;

          color:
            ${colors.text};

          font-size: 14px;

          font-weight: 800;
        }

        .notification-overview-description {
          display: block;

          margin-top: 3px;

          color:
            ${colors.muted};

          font-size: 11px;

          line-height: 1.5;
        }

        .notification-channel {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          padding:
            7px 12px;

          border-radius: 7px;

          color:
            ${colors.navy};

          background:
            ${colors.navyLight};

          border:
            1px solid
            ${colors.border};

          font-size: 11px;

          font-weight: 700;
        }


        /* ======================================================
           MAIN CARD
        ====================================================== */

        .notification-main-card {
          margin-top: 18px;

          border-radius: 14px !important;

          border:
            1px solid
            ${colors.border} !important;

          background:
            ${colors.white};

          box-shadow:
            0 6px 22px
            rgba(15, 23, 42, 0.035);
        }

        .notification-main-card
        .ant-card-body {
          padding:
            0 24px 24px !important;
        }


        /* ======================================================
           TABS
        ====================================================== */

        .notification-tabs
        .ant-tabs-nav {
          margin-bottom:
            24px !important;
        }

        .notification-tabs
        .ant-tabs-tab {
          padding:
            16px 4px !important;

          color:
            ${colors.muted};

          font-size: 13px;

          font-weight: 600;
        }

        .notification-tabs
        .ant-tabs-tab-active {
          color:
            ${colors.navy} !important;
        }

        .notification-tabs
        .ant-tabs-ink-bar {
          height: 2px;

          background:
            ${colors.gold};
        }


        /* ======================================================
           FORM
        ====================================================== */

        .notification-form-label {
          color:
            ${colors.text};

          font-size: 12px;

          font-weight: 700;
        }

        .notification-main-card
        .ant-form-item-label
        > label {
          color:
            ${colors.text};

          font-size: 12px;

          font-weight: 700;
        }

        .notification-main-card
        .ant-input,
        .notification-main-card
        .ant-input-affix-wrapper,
        .notification-main-card
        .ant-select-selector {
          border-color:
            ${colors.border} !important;

          border-radius: 8px !important;

          box-shadow: none !important;
        }

        .notification-main-card
        .ant-input:hover,
        .notification-main-card
        .ant-input-affix-wrapper:hover,
        .notification-main-card
        .ant-select-selector:hover {
          border-color:
            #C8D3DE !important;
        }

        .notification-main-card
        .ant-input:focus,
        .notification-main-card
        .ant-input-affix-wrapper-focused,
        .notification-main-card
        .ant-select-focused
        .ant-select-selector {
          border-color:
            ${colors.gold} !important;

          box-shadow:
            0 0 0 2px
            rgba(217,164,65,0.08)
            !important;
        }

        .notification-main-card
        .ant-input-lg {
          min-height: 42px;
        }

        .notification-main-card
        .ant-select-single.ant-select-lg
        .ant-select-selector {
          height: 42px;
        }


        /* ======================================================
           EMAIL CARD
        ====================================================== */

        .email-setting-card {
          border-radius: 11px !important;

          transition:
            border-color
            0.2s ease,
            background
            0.2s ease;
        }

        .email-setting-card.enabled {
          border:
            1px solid
            ${colors.gold} !important;

          background:
            ${colors.goldLight};
        }

        .email-setting-card.disabled {
          border:
            1px solid
            ${colors.border} !important;

          background:
            ${colors.background};
        }

        .email-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 9px;

          font-size: 17px;
        }

        .email-icon.enabled {
          color:
            ${colors.goldDark};

          background:
            ${colors.white};

          border:
            1px solid
            rgba(217,164,65,0.3);
        }

        .email-icon.disabled {
          color:
            ${colors.muted};

          background:
            ${colors.grayLight};
        }

        .email-title {
          display: block;

          color:
            ${colors.text};

          font-size: 13px;

          font-weight: 800;
        }

        .email-description {
          display: block;

          margin-top: 3px;

          color:
            ${colors.muted};

          font-size: 11px;

          line-height: 1.5;
        }


        /* ======================================================
           GUIDE
        ====================================================== */

        .notification-guide {
          display: flex;

          align-items: flex-start;

          gap: 10px;

          padding:
            12px 14px;

          border-radius: 9px;

          background:
            ${colors.navyLight};

          border:
            1px solid
            ${colors.border};
        }

        .notification-guide-icon {
          color:
            ${colors.navy};

          font-size: 15px;

          margin-top: 2px;
        }

        .notification-guide-text {
          color:
            ${colors.muted};

          font-size: 11px;

          line-height: 1.6;
        }

        .notification-guide-text b {
          color:
            ${colors.navy};
        }


        /* ======================================================
           ACTION BAR
        ====================================================== */

        .notification-actions {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 12px;

          padding-top: 20px;

          border-top:
            1px solid
            ${colors.border};
        }

        .notification-actions-right {
          display: flex;

          align-items: center;

          gap: 9px;
        }


        /* ======================================================
           PREVIEW
        ====================================================== */

        .preview-section-title {
          text-align: center;

          margin-bottom: 12px;
        }

        .preview-device-tag {
          margin: 0 !important;

          border-radius: 7px !important;

          padding:
            4px 10px !important;

          font-size: 11px !important;

          font-weight: 700;
        }

        .mobile-frame {
          max-width: 350px;

          margin: 0 auto;

          padding: 12px;

          border-radius: 22px;

          background:
            #182B3D;

          border:
            4px solid
            #0E1D2B;

          box-shadow:
            0 12px 30px
            rgba(15,23,42,0.12);
        }

        .mobile-screen {
          min-height: 430px;

          overflow: hidden;

          border-radius: 14px;

          background:
            ${colors.background};
        }

        .mobile-topbar {
          height: 50px;

          display: flex;

          align-items: center;

          justify-content:
            center;

          color:
            ${colors.white};

          background:
            ${colors.navy};

          font-size: 12px;

          font-weight: 800;
        }

        .mobile-content {
          padding: 16px 12px;
        }

        .mobile-notification {
          padding: 14px;

          border-radius: 10px;

          background:
            ${colors.white};

          border:
            1px solid
            ${colors.border};

          box-shadow:
            0 4px 12px
            rgba(15,23,42,0.04);
        }

        .mobile-notification-header {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 8px;

          margin-bottom: 10px;
        }

        .mobile-brand {
          display: flex;

          align-items: center;

          gap: 6px;

          color:
            ${colors.navy};

          font-size: 10px;

          font-weight: 800;
        }

        .mobile-brand-icon {
          width: 24px;
          height: 24px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 6px;

          color:
            ${colors.goldDark};

          background:
            ${colors.goldLight};
        }

        .mobile-time {
          color:
            ${colors.softText};

          font-size: 9px;
        }

        .mobile-title {
          display: block;

          margin-bottom: 7px;

          color:
            ${colors.text};

          font-size: 13px;

          font-weight: 800;

          line-height: 1.4;
        }

        .mobile-content-text {
          color:
            ${colors.muted};

          font-size: 11px;

          line-height: 1.6;
        }

        .mobile-footer {
          margin-top: 13px;

          padding-top: 10px;

          border-top:
            1px dashed
            ${colors.border};
        }


        /* ======================================================
           WEB PREVIEW
        ====================================================== */

        .web-preview {
          min-height: 300px;

          padding: 16px;

          border-radius: 12px;

          background:
            ${colors.background};

          border:
            1px solid
            ${colors.border};
        }

        .web-sidebar {
          display: flex;

          align-items: center;

          gap: 8px;

          padding:
            9px 11px;

          margin-bottom: 12px;

          border-radius: 8px;

          color:
            ${colors.white};

          background:
            ${colors.navy};

          font-size: 10px;

          font-weight: 700;
        }

        .web-notification {
          padding: 15px;

          border-radius: 10px;

          background:
            ${colors.white};

          border:
            1px solid
            ${colors.border};

          box-shadow:
            0 4px 12px
            rgba(15,23,42,0.03);
        }

        .web-notification-top {
          display: flex;

          align-items:
            flex-start;

          gap: 10px;
        }

        .web-notification-icon {
          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 8px;

          color:
            ${colors.goldDark};

          background:
            ${colors.goldLight};

          border:
            1px solid
            rgba(217,164,65,0.25);
        }

        .web-notification-body {
          min-width: 0;

          flex: 1;
        }

        .web-notification-title-row {
          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 8px;

          margin-bottom: 6px;
        }

        .web-notification-title {
          color:
            ${colors.text};

          font-size: 13px;

          font-weight: 800;

          line-height: 1.4;
        }

        .web-notification-content {
          color:
            ${colors.muted};

          font-size: 11px;

          line-height: 1.6;

          white-space: pre-wrap;
        }

        .web-notification-meta {
          margin-top: 12px;

          padding-top: 9px;

          border-top:
            1px solid
            ${colors.border};

          color:
            ${colors.softText};

          font-size: 9px;
        }


        /* ======================================================
           EMAIL PREVIEW
        ====================================================== */

        .email-preview-wrapper {
          max-width: 720px;

          margin: 24px auto 0;
        }

        .email-preview {
          overflow: hidden;

          border-radius: 12px;

          background:
            ${colors.white};

          border:
            1px solid
            ${colors.border};

          box-shadow:
            0 5px 20px
            rgba(15,23,42,0.04);
        }

        .email-preview-header {
          padding:
            15px 18px;

          color:
            ${colors.white};

          background:
            ${colors.navy};
        }

        .email-preview-brand {
          display: flex;

          align-items: center;

          gap: 8px;

          font-size: 12px;

          font-weight: 800;
        }

        .email-preview-brand-icon {
          width: 28px;
          height: 28px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 7px;

          color:
            ${colors.navy};

          background:
            ${colors.gold};
        }

        .email-preview-body {
          padding: 22px;
        }

        .email-preview-title {
          margin: 0 0 10px !important;

          color:
            ${colors.text} !important;

          font-size: 19px !important;

          font-weight: 800 !important;
        }

        .email-preview-content {
          color:
            ${colors.textDark};

          font-size: 12px;

          line-height: 1.7;

          white-space: pre-wrap;
        }

        .email-preview-footer {
          padding:
            13px 18px;

          background:
            ${colors.background};

          border-top:
            1px solid
            ${colors.border};

          color:
            ${colors.softText};

          font-size: 10px;
        }


        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 768px) {

          .send-notification-page {
            padding-bottom: 25px;
          }

          .notification-overview-inner {
            flex-direction:
              column;

            align-items:
              flex-start;
          }

          .notification-channel {
            width: 100%;

            justify-content:
              center;
          }

          .notification-main-card
          .ant-card-body {
            padding:
              0 15px 20px !important;
          }

          .notification-actions {
            flex-direction:
              column;

            align-items:
              stretch;
          }

          .notification-actions-right {
            width: 100%;

            display: flex;
          }

          .notification-actions-right > * {
            flex: 1;
          }

          .mobile-frame {
            max-width:
              100%;
          }

        }

      `}</style>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <PageHeroHeader
        title="Phát thông báo"
        description="Soạn thảo và gửi thông báo đến giáo lý viên, học viên và các thành viên trong hệ thống."
        icon={<BellOutlined />}
        onBack={() => navigate(-1)}
      />

      {/* ======================================================
          PERMISSIONS
      ====================================================== */}

      <div className="notification-permission">
        <Tag
          className="permission-tag"
          icon={<CheckCircleOutlined />}
          style={{
            color: colors.success,

            background: colors.successLight,

            borderColor: "#C9E8D9",
          }}
        >
          Được phép gửi App Notification
        </Tag>

        {isAdminCatechist ? (
          <Tag
            className="permission-tag"
            icon={<MailOutlined />}
            style={{
              color: colors.navy,

              background: colors.navyLight,

              borderColor: colors.border,
            }}
          >
            Được phép gửi Email
          </Tag>
        ) : (
          <Tag
            className="permission-tag"
            icon={<LockOutlined />}
            style={{
              color: colors.muted,

              background: "#F1F5F9",

              borderColor: colors.border,
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
        className="notification-overview"
        bordered={false}
        bodyStyle={{
          padding: "18px 20px",
        }}
      >
        <div className="notification-overview-inner">
          <div className="notification-overview-left">
            <div className="notification-overview-icon">
              <UsergroupAddOutlined />
            </div>

            <div>
              <span className="notification-overview-title">
                Gửi đến toàn hệ thống
              </span>

              <span className="notification-overview-description">
                Thông báo sẽ được phân phối đến các thành viên phù hợp trong hệ
                thống.
              </span>
            </div>
          </div>

          <div className="notification-channel">
            <BellOutlined />
            App Notification
          </div>
        </div>
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
        <Card className="notification-main-card" bordered={false}>
          <Tabs
            className="notification-tabs"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              /* ==================================================
                 TAB 1
              ================================================== */

              {
                key: "1",

                label: (
                  <span>
                    <EditOutlined /> Soạn thảo
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
                          label="Phân loại thông báo"
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
                          label="Mức độ ưu tiên"
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
                      label="Tiêu đề thông báo"
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
                        placeholder="Nhập tiêu đề thông báo..."
                      />
                    </Form.Item>

                    {/* ==========================================
                        CONTENT
                    ========================================== */}

                    <Form.Item
                      name="content"
                      label="Nội dung chi tiết"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Vui lòng nhập nội dung",
                        },
                      ]}
                    >
                      <TextArea
                        rows={9}
                        maxLength={3000}
                        showCount
                        placeholder="Nhập nội dung chi tiết cần gửi đến các thành viên..."
                      />
                    </Form.Item>

                    {/* ==========================================
                        EMAIL
                    ========================================== */}

                    <Divider
                      style={{
                        margin: "20px 0",
                      }}
                    />

                    <Form.Item
                      name="send_email"
                      valuePropName="checked"
                      style={{
                        marginBottom: 15,
                      }}
                    >
                      <Card
                        size="small"
                        bordered={false}
                        className={`email-setting-card ${
                          watchedValues.send_email ? "enabled" : "disabled"
                        }`}
                        bodyStyle={{
                          padding: "14px 16px",
                        }}
                      >
                        <Row
                          align="middle"
                          justify="space-between"
                          gutter={[15, 12]}
                        >
                          <Col flex="auto">
                            <Space align="start" size={11}>
                              <div
                                className={`email-icon ${
                                  watchedValues.send_email
                                    ? "enabled"
                                    : "disabled"
                                }`}
                              >
                                {watchedValues.send_email ? (
                                  <MailOutlined />
                                ) : (
                                  <LockOutlined />
                                )}
                              </div>

                              <div>
                                <span className="email-title">
                                  Gửi kèm thông báo qua Email
                                </span>

                                <span className="email-description">
                                  Gửi thêm nội dung thông báo đến email của các
                                  thành viên.
                                </span>

                                {!isAdminCatechist && (
                                  <Tag
                                    bordered={false}
                                    icon={<LockOutlined />}
                                    style={{
                                      marginTop: 6,

                                      marginRight: 0,

                                      borderRadius: 5,

                                      color: colors.muted,

                                      background: "#EDEFF2",

                                      fontSize: 10,
                                    }}
                                  >
                                    Chỉ admin_catechist
                                  </Tag>
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
                        message="Đã bật gửi Email"
                        description="Thông báo sẽ được gửi trên ứng dụng và đồng thời gửi email tới các thành viên có địa chỉ email hợp lệ."
                        style={{
                          marginBottom: 18,

                          borderRadius: 9,
                        }}
                      />
                    )}

                    {/* ==========================================
                        GUIDE
                    ========================================== */}

                    <div className="notification-guide">
                      <InfoCircleOutlined className="notification-guide-icon" />

                      <span className="notification-guide-text">
                        Sau khi hoàn tất nội dung, chuyển sang tab{" "}
                        <b>"Xem trước"</b> để kiểm tra cách thông báo hiển thị
                        trước khi gửi.
                      </span>
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
                  <span>
                    <EyeOutlined /> Xem trước
                  </span>
                ),

                children: (
                  <div>
                    <Row gutter={[28, 28]}>
                      {/* ==========================================
                          MOBILE
                      ========================================== */}

                      <Col xs={24} md={12}>
                        <div className="preview-section-title">
                          <Tag
                            className="preview-device-tag"
                            icon={<MobileOutlined />}
                            style={{
                              color: colors.navy,

                              background: colors.navyLight,

                              borderColor: colors.border,
                            }}
                          >
                            Ứng dụng di động
                          </Tag>
                        </div>

                        <div className="mobile-frame">
                          <div className="mobile-screen">
                            <div className="mobile-topbar">FaithEdu</div>

                            <div className="mobile-content">
                              <div className="mobile-notification">
                                <div className="mobile-notification-header">
                                  <div className="mobile-brand">
                                    <div className="mobile-brand-icon">
                                      <BellOutlined />
                                    </div>
                                    FaithEdu
                                  </div>

                                  <span className="mobile-time">Vừa xong</span>
                                </div>

                                <span className="mobile-title">
                                  {watchedValues.title?.trim() ||
                                    "Tiêu đề thông báo..."}
                                </span>

                                <div className="mobile-content-text">
                                  {watchedValues.content?.trim() ||
                                    "Nội dung chi tiết của thông báo sẽ hiển thị tại đây..."}
                                </div>

                                <div className="mobile-footer">
                                  {getPriorityTag(watchedValues.priority)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Col>

                      {/* ==========================================
                          WEB
                      ========================================== */}

                      <Col xs={24} md={12}>
                        <div className="preview-section-title">
                          <Tag
                            className="preview-device-tag"
                            icon={<DesktopOutlined />}
                            style={{
                              color: colors.navy,

                              background: colors.navyLight,

                              borderColor: colors.border,
                            }}
                          >
                            Giao diện Web
                          </Tag>
                        </div>

                        <div className="web-preview">
                          <div className="web-sidebar">
                            <BellOutlined />
                            Trung tâm thông báo
                          </div>

                          <div className="web-notification">
                            <div className="web-notification-top">
                              <div className="web-notification-icon">
                                <BellOutlined />
                              </div>

                              <div className="web-notification-body">
                                <div className="web-notification-title-row">
                                  <span className="web-notification-title">
                                    {watchedValues.title?.trim() ||
                                      "Tiêu đề thông báo..."}
                                  </span>

                                  {getPriorityTag(watchedValues.priority)}
                                </div>

                                <div className="web-notification-content">
                                  {watchedValues.content?.trim() ||
                                    "Nội dung thông báo mẫu..."}
                                </div>

                                <div className="web-notification-meta">
                                  Gửi bởi: Ban Quản Trị Giáo Xứ • Ngay bây giờ
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* ==========================================
                        EMAIL PREVIEW
                    ========================================== */}

                    {watchedValues.send_email && isAdminCatechist && (
                      <div className="email-preview-wrapper">
                        <div className="preview-section-title">
                          <Tag
                            className="preview-device-tag"
                            icon={<MailOutlined />}
                            style={{
                              color: colors.goldDark,

                              background: colors.goldLight,

                              borderColor: "#EAD6A5",
                            }}
                          >
                            Email
                          </Tag>
                        </div>

                        <div className="email-preview">
                          <div className="email-preview-header">
                            <div className="email-preview-brand">
                              <div className="email-preview-brand-icon">
                                <BellOutlined />
                              </div>
                              FaithEdu Notification
                            </div>
                          </div>

                          <div className="email-preview-body">
                            <Title level={4} className="email-preview-title">
                              {watchedValues.title || "Tiêu đề thông báo"}
                            </Title>

                            <div className="email-preview-content">
                              {watchedValues.content || "Nội dung thông báo"}
                            </div>
                          </div>

                          <div className="email-preview-footer">
                            Email được gửi tự động bởi hệ thống FaithEdu.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />

          {/* ====================================================
              ACTION BAR
          ==================================================== */}

          <div className="notification-actions">
            <AppButton
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={loading}
            >
              Làm mới
            </AppButton>

            <div className="notification-actions-right">
              {activeTab === "1" ? (
                <AppButton onClick={() => setActiveTab("2")}>
                  <EyeOutlined /> Xem trước
                </AppButton>
              ) : (
                <AppButton onClick={() => setActiveTab("1")}>
                  <EditOutlined /> Chỉnh sửa
                </AppButton>
              )}

              <AppButton
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                onClick={() => form.submit()}
                style={{
                  minWidth: 175,

                  background: colors.navy,

                  borderColor: colors.navy,
                }}
              >
                {watchedValues.send_email && isAdminCatechist
                  ? "Gửi thông báo & Email"
                  : "Gửi thông báo ngay"}
              </AppButton>
            </div>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default SendNotificationPage;
