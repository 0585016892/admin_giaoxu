import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Form,
  Input,
  Select,
  Switch,
  Row,
  Col,
  Card,
  Space,
  Upload,
  message,
  Tabs,
  InputNumber,
  Spin,
  Typography,
  Tag,
  Divider,
  Alert,
} from "antd";

import {
  HomeOutlined,
  SaveOutlined,
  UploadOutlined,
  BankOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  ExclamationCircleFilled,
  CalendarOutlined,
  FileTextOutlined,
  GlobalOutlined,
  EditOutlined,
} from "@ant-design/icons";

import PageHeroHeader from "../../components/common/PageHeroHeader";
import AppButton from "../../components/common/AppButton";
import { useUser } from "../../context/UserContext";
import { useChurch } from "../../hooks/useChurch";

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

/* =========================================================
   DESIGN TOKENS
========================================================= */

const COLORS = {
  navy: "#173B5E",
  navyDark: "#102C46",
  navyHover: "#244F78",
  navyLight: "#EEF3F7",
  navySoft: "#F6F9FC",

  gold: "#D9A441",
  goldDark: "#B8862F",
  goldLight: "#FBF5E7",

  text: "#172B3A",
  textSecondary: "#66788A",
  muted: "#94A3B8",

  bg: "#F5F7FA",
  white: "#FFFFFF",

  border: "#E1E7ED",
  borderDark: "#D3DCE5",

  success: "#2F7D5A",
  successBg: "#EEF8F2",

  warning: "#A96E17",
  warningBg: "#FCF6E8",

  danger: "#B64040",
  dangerBg: "#FDF0F0",

  info: "#356B96",
  infoBg: "#EEF5FA",
};

/* =========================================================
   HELPERS
========================================================= */

const getApiBaseUrl = () => {
  const base = process.env.REACT_APP_API_URL || "";

  return base.replace(/\/$/, "");
};

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("blob:") ||
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const baseUrl = getApiBaseUrl();

  return `${baseUrl}/${image.replace(/^\/+/, "")}`;
};

const formatDate = (date) => {
  if (!date) return "--";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "--";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return parsed.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   LICENSE CONFIG
========================================================= */

const getLicenseConfig = (status) => {
  switch (status) {
    case "active":
      return {
        label: "Đang hoạt động",
        shortLabel: "Hoạt động",
        color: COLORS.success,
        background: COLORS.successBg,
        border: "#BFE5CD",
        icon: <CheckCircleFilled />,
      };

    case "expired":
      return {
        label: "Đã hết hạn",
        shortLabel: "Hết hạn",
        color: COLORS.danger,
        background: COLORS.dangerBg,
        border: "#F1C5C5",
        icon: <ExclamationCircleFilled />,
      };

    case "trial":
    default:
      return {
        label: "Đang dùng thử",
        shortLabel: "Dùng thử",
        color: COLORS.warning,
        background: COLORS.warningBg,
        border: "#F0D78F",
        icon: <ClockCircleOutlined />,
      };
  }
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

const LicenseInfoRow = ({ icon, label, value }) => {
  return (
    <div className="license-info-row">
      <div className="license-info-label">
        <span className="license-info-icon">{icon}</span>

        <Text>{label}</Text>
      </div>

      <Text strong className="license-info-value">
        {value}
      </Text>
    </div>
  );
};

const SummaryItem = ({ icon, label, value }) => {
  return (
    <div className="summary-item">
      <div className="summary-item-icon">{icon}</div>

      <div className="summary-item-content">
        <Text className="summary-item-label">{label}</Text>

        <Text strong className="summary-item-value">
          {value}
        </Text>
      </div>
    </div>
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const ParishSettingsPage = () => {
  const { user } = useUser();

  const isCatechist = user?.role === "admin_catechist";

  const { editChurch, getChurchId } = useChurch();

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [churchData, setChurchData] = useState(null);

  /* =======================================================
     CHURCH ID
  ======================================================= */

  const churchId =
    user?.church_id || user?.church?.id || user?.parish_id || user?.parish?.id;

  /* =======================================================
     LICENSE
  ======================================================= */

  const licenseStatus = churchData?.license_status || "trial";

  const licenseConfig = useMemo(
    () => getLicenseConfig(licenseStatus),
    [licenseStatus],
  );

  const daysRemaining =
    churchData?.days_remaining ?? churchData?.license?.days_remaining ?? null;

  const trialStartedAt =
    churchData?.trial_started_at ??
    churchData?.license?.trial_started_at ??
    null;

  const trialExpiresAt =
    churchData?.trial_expires_at ??
    churchData?.license?.trial_expires_at ??
    null;

  const activatedAt =
    churchData?.activated_at ?? churchData?.license?.activated_at ?? null;

  /* =======================================================
     FETCH CHURCH
  ======================================================= */

  const fetchParishInfo = useCallback(async () => {
    if (!churchId) {
      message.warning(
        "Không tìm thấy thông tin Giáo xứ của tài khoản hiện tại!",
      );

      return;
    }

    setLoading(true);

    try {
      const res = await getChurchId(churchId);

      const rawData = res?.data ?? res;

      const data = rawData?.church ?? rawData;

      if (!data) {
        message.error("Không nhận được dữ liệu giáo xứ!");

        return;
      }

      setChurchData(data);

      form.setFieldsValue({
        code: data.code || "",
        name: data.name || "",
        type: data.type || "GIAO_XU",

        pastor_name: data.pastor_name || "",

        phone: data.phone || "",
        email: data.email || "",

        address: data.address || "",
        ward: data.ward || "",
        district: data.district || "",

        latitude:
          data.latitude !== null && data.latitude !== undefined
            ? Number(data.latitude)
            : null,

        longitude:
          data.longitude !== null && data.longitude !== undefined
            ? Number(data.longitude)
            : null,

        is_active:
          data.is_active === 1 ||
          data.is_active === true ||
          data.is_active === "1",

        description: data.description || "",
      });

      setImageUrl(data.image || "");
      setSelectedFile(null);
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Lỗi khi tải thông tin giáo xứ!",
      );
    } finally {
      setLoading(false);
    }
  }, [churchId, getChurchId, form]);

  useEffect(() => {
    fetchParishInfo();
  }, [fetchParishInfo]);

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async (values) => {
    if (!isCatechist) {
      message.warning("Bạn không có quyền chỉnh sửa thông tin giáo xứ!");

      return;
    }

    if (!churchId) {
      message.error("Không tìm thấy ID giáo xứ để cập nhật!");

      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...values,
        is_active: values.is_active ? 1 : 0,
      };

      if (selectedFile) {
        const formData = new FormData();

        Object.keys(payload).forEach((key) => {
          const value = payload[key];

          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });

        formData.append("image", selectedFile);

        await editChurch(churchId, formData);
      } else {
        payload.image = churchData?.image || imageUrl || "";

        await editChurch(churchId, payload);
      }

      message.success("Cập nhật thông tin giáo xứ thành công!");

      await fetchParishInfo();
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi lưu thông tin giáo xứ!",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleBeforeUpload = (file) => {
    if (!file.type?.startsWith("image/")) {
      message.error("Vui lòng chọn file hình ảnh!");

      return Upload.LIST_IGNORE;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error("Ảnh không được vượt quá 5MB!");

      return Upload.LIST_IGNORE;
    }

    setSelectedFile(file);

    const previewUrl = URL.createObjectURL(file);

    setImageUrl(previewUrl);

    message.success("Đã chọn ảnh mới. Bấm 'Lưu Thay Đổi' để hoàn tất!");

    return false;
  };

  /* =======================================================
     LICENSE CARD
  ======================================================= */

  const renderLicenseCard = () => {
    const isTrial = licenseStatus === "trial";
    const isActive = licenseStatus === "active";
    const isExpired = licenseStatus === "expired";

    return (
      <Card
        bordered={false}
        className="license-card"
        bodyStyle={{ padding: 0 }}
      >
        <div
          className="license-card-top"
          style={{
            background: licenseConfig.background,
          }}
        >
          <div className="license-heading">
            <div className="license-heading-icon">
              <SafetyCertificateOutlined />
            </div>

            <div>
              <Text className="license-heading-title">License FaithEdu</Text>

              <Text className="license-heading-subtitle">
                Quyền sử dụng hệ thống
              </Text>
            </div>
          </div>

          <Tag
            icon={licenseConfig.icon}
            className="license-status-tag"
            style={{
              color: licenseConfig.color,
              borderColor: licenseConfig.border,
              background: COLORS.white,
            }}
          >
            {licenseConfig.shortLabel}
          </Tag>
        </div>

        <div className="license-card-body">
          <div
            className="license-main-value"
            style={{
              borderColor: licenseConfig.border,
            }}
          >
            {isTrial && (
              <>
                <Text className="license-value-label">
                  Thời gian dùng thử còn lại
                </Text>

                <Title
                  level={2}
                  className="license-value"
                  style={{
                    color: licenseConfig.color,
                  }}
                >
                  {daysRemaining !== null ? `${daysRemaining} ngày` : "--"}
                </Title>
              </>
            )}

            {isActive && (
              <>
                <Text className="license-value-label">Trạng thái sử dụng</Text>

                <Title
                  level={2}
                  className="license-value"
                  style={{
                    color: COLORS.success,
                  }}
                >
                  Vĩnh viễn
                </Title>
              </>
            )}

            {isExpired && (
              <>
                <Text className="license-value-label">Trạng thái sử dụng</Text>

                <Title
                  level={2}
                  className="license-value"
                  style={{
                    color: COLORS.danger,
                  }}
                >
                  Đã hết hạn
                </Title>
              </>
            )}
          </div>

          <div className="license-info-list">
            <LicenseInfoRow
              icon={<CalendarOutlined />}
              label="Ngày bắt đầu"
              value={formatDate(trialStartedAt)}
            />

            <LicenseInfoRow
              icon={<ClockCircleOutlined />}
              label="Ngày hết hạn"
              value={isActive ? "Không giới hạn" : formatDate(trialExpiresAt)}
            />

            {activatedAt && (
              <LicenseInfoRow
                icon={<CheckCircleFilled />}
                label="Ngày kích hoạt"
                value={formatDateTime(activatedAt)}
              />
            )}
          </div>

          {isTrial && (
            <Alert
              showIcon
              icon={<InfoCircleOutlined />}
              message="Thời gian dùng thử"
              description={`Hệ thống đang trong thời gian dùng thử. ${
                daysRemaining ?? 0
              } ngày còn lại.`}
              className="license-alert"
            />
          )}

          {isActive && (
            <Alert
              type="success"
              showIcon
              message="License đang hoạt động"
              description="Giáo xứ đã được kích hoạt và có thể sử dụng FaithEdu không giới hạn thời gian."
              className="license-alert"
            />
          )}

          {isExpired && (
            <Alert
              type="error"
              showIcon
              message="License đã hết hạn"
              description="Dữ liệu giáo xứ vẫn được bảo toàn. Vui lòng kích hoạt FaithEdu để tiếp tục sử dụng hệ thống."
              className="license-alert"
            />
          )}
        </div>
      </Card>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="parish-settings-page">
      {/* ===================================================
          HEADER
      =================================================== */}

      <PageHeroHeader
        icon={<BankOutlined />}
        badgeText="CẤU HÌNH GIÁO XỨ"
        title="Thông Tin Giáo Xứ / Giáo Họ"
        description={
          isCatechist
            ? "Chỉnh sửa thông tin nhà thờ, linh mục phụ trách và địa chỉ"
            : "Thông tin nhà thờ, linh mục phụ trách và địa chỉ"
        }
        onRefresh={fetchParishInfo}
        refreshLoading={loading}
        primaryButtonText={
          isCatechist ? (saving ? "Đang lưu..." : "Lưu Thay Đổi") : undefined
        }
        primaryButtonIcon={isCatechist ? <SaveOutlined /> : undefined}
        onPrimaryClick={isCatechist ? () => form.submit() : undefined}
        primaryLoading={saving}
        primaryDisabled={loading || !isCatechist}
      />

      {/* ===================================================
          FORM
      =================================================== */}

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          disabled={!isCatechist}
          initialValues={{
            is_active: true,
            type: "GIAO_XU",
          }}
        >
          <Row gutter={[20, 20]}>
            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <Col xs={24} lg={7}>
              <Space
                direction="vertical"
                size={20}
                style={{
                  width: "100%",
                }}
              >
                {/* ===============================================
                    CHURCH IMAGE
                =============================================== */}

                <Card
                  bordered={false}
                  className="settings-card image-card"
                  bodyStyle={{
                    padding: 22,
                  }}
                >
                  <div className="card-section-heading">
                    <div className="card-section-icon">
                      <BankOutlined />
                    </div>

                    <div>
                      <Text className="card-section-title">
                        Hình Ảnh Nhà Thờ
                      </Text>

                      <Text className="card-section-description">
                        Logo hoặc hình ảnh đại diện
                      </Text>
                    </div>
                  </div>

                  <div className="church-image-wrapper">
                    <div className="church-image">
                      {imageUrl ? (
                        <img
                          src={getImageUrl(imageUrl)}
                          alt="Church Logo"
                          onError={(e) => {
                            console.error(
                              "❌ Không tải được ảnh:",
                              e.currentTarget.src,
                            );
                          }}
                        />
                      ) : (
                        <BankOutlined />
                      )}
                    </div>
                  </div>

                  {isCatechist && (
                    <Upload
                      showUploadList={false}
                      beforeUpload={handleBeforeUpload}
                      accept="image/*"
                    >
                      <AppButton
                        icon={<UploadOutlined />}
                        className="upload-button"
                      >
                        Chọn ảnh mới
                      </AppButton>
                    </Upload>
                  )}

                  <Text className="image-hint">
                    JPG, PNG hoặc WEBP · Tối đa 5MB
                  </Text>

                  {!isCatechist && (
                    <div className="view-only-alert">
                      <InfoCircleOutlined />

                      <span>Tài khoản của bạn chỉ có quyền xem thông tin.</span>
                    </div>
                  )}

                  <Divider />

                  {/* ACTIVE */}

                  <div className="active-status-row">
                    <div>
                      <Text className="active-status-title">
                        Trạng thái hoạt động
                      </Text>

                      <Text className="active-status-description">
                        Trạng thái hiện tại của giáo xứ
                      </Text>
                    </div>

                    <Form.Item name="is_active" valuePropName="checked" noStyle>
                      <Switch disabled />
                    </Form.Item>
                  </div>
                </Card>

                {/* ===============================================
                    LICENSE
                =============================================== */}

                {renderLicenseCard()}
              </Space>
            </Col>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <Col xs={24} lg={17}>
              {/* ===============================================
                  INFORMATION CARD
              =============================================== */}

              <Card
                bordered={false}
                className="settings-card information-card"
                bodyStyle={{
                  padding: 0,
                }}
              >
                <div className="information-card-header">
                  <div>
                    <Text className="section-eyebrow">THÔNG TIN CẤU HÌNH</Text>

                    <Title level={4} className="information-card-title">
                      Thông tin giáo xứ
                    </Title>

                    <Text className="information-card-description">
                      Quản lý thông tin cơ bản, liên hệ và giới thiệu
                    </Text>
                  </div>

                  {isCatechist && (
                    <Tag className="editable-tag">
                      <EditOutlined />
                      Có quyền chỉnh sửa
                    </Tag>
                  )}
                </div>

                <Divider style={{ margin: 0 }} />

                <div className="information-card-content">
                  <Tabs
                    defaultActiveKey="1"
                    className="parish-tabs"
                    items={[
                      /* =========================================
                         TAB 1
                      ========================================= */

                      {
                        key: "1",

                        label: (
                          <span>
                            <HomeOutlined />
                            Thông Tin Cơ Bản
                          </span>
                        ),

                        children: (
                          <Row gutter={[18, 0]}>
                            <Col xs={24} sm={12}>
                              <Form.Item
                                label="Mã Giáo Xứ / Họ"
                                name="code"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập mã!",
                                  },
                                ]}
                              >
                                <Input
                                  disabled
                                  placeholder="VD: GX-THAIHA"
                                  className="form-input"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item
                                label="Phân Loại"
                                name="type"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng chọn phân loại!",
                                  },
                                ]}
                              >
                                <Select disabled className="form-select">
                                  <Option value="GIAO_XU">Giáo Xứ</Option>

                                  <Option value="GIAO_HO">Giáo Họ</Option>
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col xs={24}>
                              <Form.Item
                                label="Tên Giáo Xứ / Họ"
                                name="name"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                  },
                                ]}
                              >
                                <Input
                                  prefix={
                                    <HomeOutlined className="input-icon" />
                                  }
                                  placeholder="VD: Giáo xứ Thái Hà"
                                  className="form-input"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24}>
                              <Form.Item
                                label="Linh Mục Quản Xứ / Phụ Trách"
                                name="pastor_name"
                              >
                                <Input
                                  prefix={
                                    <UserOutlined className="input-icon" />
                                  }
                                  placeholder="VD: Lm. Giuse Nguyễn Văn A"
                                  className="form-input"
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        ),
                      },

                      /* =========================================
                         TAB 2
                      ========================================= */

                      {
                        key: "2",

                        label: (
                          <span>
                            <EnvironmentOutlined />
                            Liên Hệ & Địa Chỉ
                          </span>
                        ),

                        children: (
                          <Row gutter={[18, 0]}>
                            <Col xs={24} sm={12}>
                              <Form.Item label="Số Điện Thoại" name="phone">
                                <Input
                                  prefix={
                                    <PhoneOutlined className="input-icon" />
                                  }
                                  placeholder="0336 041 807"
                                  className="form-input"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item
                                label="Email Liên Hệ"
                                name="email"
                                rules={[
                                  {
                                    type: "email",
                                    message: "Email không đúng định dạng!",
                                  },
                                ]}
                              >
                                <Input
                                  prefix={
                                    <MailOutlined className="input-icon" />
                                  }
                                  placeholder="giaoxu@gmail.com"
                                  className="form-input"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24}>
                              <Form.Item label="Giáo phận" name="address">
                                <Input
                                  prefix={
                                    <EnvironmentOutlined className="input-icon" />
                                  }
                                  placeholder="Vui lòng nhập -Thái Bình- "
                                  className="form-input"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item label="Phường / Xã" name="ward">
                                <Input
                                  placeholder="VD: Quang Trung"
                                  className="form-input"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item
                                label="Quận / Huyện / Thị Xã"
                                name="district"
                              >
                                <Input
                                  placeholder="VD: Đống Đa"
                                  className="form-input"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item
                                label="Vĩ Độ (Latitude)"
                                name="latitude"
                              >
                                <InputNumber
                                  style={{
                                    width: "100%",
                                  }}
                                  step={0.000001}
                                  placeholder="VD: 21.012345"
                                  className="form-input-number"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item
                                label="Kinh Độ (Longitude)"
                                name="longitude"
                              >
                                <InputNumber
                                  style={{
                                    width: "100%",
                                  }}
                                  step={0.000001}
                                  placeholder="VD: 105.823456"
                                  className="form-input-number"
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        ),
                      },

                      /* =========================================
                         TAB 3
                      ========================================= */

                      {
                        key: "3",

                        label: (
                          <span>
                            <FileTextOutlined />
                            Mô Tả Bổ Sung
                          </span>
                        ),

                        children: (
                          <div>
                            <div className="description-heading">
                              <div className="description-heading-icon">
                                <InfoCircleOutlined />
                              </div>

                              <div>
                                <Text strong>Giới thiệu / Ghi chú</Text>

                                <Text type="secondary">
                                  Thông tin bổ sung về giáo xứ
                                </Text>
                              </div>
                            </div>

                            <Form.Item label="Nội dung" name="description">
                              <TextArea
                                rows={8}
                                placeholder="Nhập lược sử, thông tin giờ Lễ hoặc thông báo chung..."
                                className="description-textarea"
                              />
                            </Form.Item>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              </Card>

              {/* ===============================================
                  SYSTEM SUMMARY
              =============================================== */}

              <Card
                bordered={false}
                className="settings-card summary-card"
                bodyStyle={{
                  padding: 22,
                }}
              >
                <div className="summary-header">
                  <div className="summary-header-icon">
                    <GlobalOutlined />
                  </div>

                  <div>
                    <Text className="summary-title">Thông tin hệ thống</Text>

                    <Text className="summary-description">
                      Thông tin định danh và trạng thái của giáo xứ
                    </Text>
                  </div>
                </div>

                <Divider />

                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={8}>
                    <SummaryItem
                      icon={<BankOutlined />}
                      label="Mã giáo xứ"
                      value={churchData?.code || "--"}
                    />
                  </Col>

                  <Col xs={24} sm={8}>
                    <SummaryItem
                      icon={<HomeOutlined />}
                      label="Loại hình"
                      value={
                        churchData?.type === "GIAO_XU"
                          ? "Giáo Xứ"
                          : churchData?.type === "GIAO_HO"
                            ? "Giáo Họ"
                            : "--"
                      }
                    />
                  </Col>

                  <Col xs={24} sm={8}>
                    <SummaryItem
                      icon={<CalendarOutlined />}
                      label="Ngày tạo"
                      value={formatDate(churchData?.created_at)}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Form>
      </Spin>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`
        /* =====================================================
           BASE
        ===================================================== */

        .parish-settings-page {
          width: 100%;
          min-height: 100%;
          padding-bottom: 32px;
          background: ${COLORS.bg};
          color: ${COLORS.text};
        }

        .parish-settings-page .ant-card {
          color: ${COLORS.text};
        }

        /* =====================================================
           COMMON CARD
        ===================================================== */

        .settings-card {
          border-radius: 18px !important;
          border: 1px solid ${COLORS.border} !important;
          box-shadow: none !important;
          background: ${COLORS.white} !important;
          overflow: hidden;
        }

        /* =====================================================
           IMAGE CARD
        ===================================================== */

        .image-card {
          text-align: center;
        }

        .card-section-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          text-align: left;
          margin-bottom: 20px;
        }

        .card-section-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: ${COLORS.navyLight};
          color: ${COLORS.navy};
          font-size: 17px;
        }

        .card-section-title {
          display: block;
          color: ${COLORS.navyDark};
          font-size: 14px;
          font-weight: 700;
        }

        .card-section-description {
          display: block;
          margin-top: 2px;
          color: ${COLORS.textSecondary};
          font-size: 11px;
        }

        .church-image-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .church-image {
          width: 168px;
          height: 168px;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          border: 1px solid ${COLORS.gold};
          background: #FFFCF4;
        }

        .church-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 15px;
        }

        .church-image .anticon {
          color: ${COLORS.gold};
          font-size: 46px;
        }

        .upload-button {
          border-radius: 9px !important;
        }

        .image-hint {
          display: block;
          margin-top: 9px;
          color: ${COLORS.muted};
          font-size: 10px;
        }

        .view-only-alert {
          margin-top: 14px;
          padding: 10px 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          text-align: left;
          border-radius: 9px;
          border: 1px solid ${COLORS.border};
          background: ${COLORS.navySoft};
          color: ${COLORS.textSecondary};
          font-size: 11px;
          line-height: 1.5;
        }

        .view-only-alert .anticon {
          color: ${COLORS.navy};
          margin-top: 1px;
        }

        .image-card .ant-divider {
          margin: 20px 0;
          border-color: ${COLORS.border};
        }

        /* =====================================================
           ACTIVE STATUS
        ===================================================== */

        .active-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-align: left;
        }

        .active-status-title {
          display: block;
          color: ${COLORS.text};
          font-size: 13px;
          font-weight: 700;
        }

        .active-status-description {
          display: block;
          margin-top: 2px;
          color: ${COLORS.muted};
          font-size: 10px;
        }

        .active-status-row .ant-switch-checked {
          background: ${COLORS.navy};
        }

        /* =====================================================
           LICENSE
        ===================================================== */

        .license-card {
          border-radius: 18px !important;
          border: 1px solid ${COLORS.border} !important;
          box-shadow: none !important;
          overflow: hidden;
        }

        .license-card-top {
          padding: 17px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }

        .license-heading {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .license-heading-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${COLORS.white};
          color: ${COLORS.goldDark};
          border: 1px solid rgba(217, 164, 65, 0.3);
          font-size: 18px;
        }

        .license-heading-title {
          display: block;
          color: ${COLORS.text};
          font-size: 13px;
          font-weight: 700;
        }

        .license-heading-subtitle {
          display: block;
          margin-top: 2px;
          color: ${COLORS.textSecondary};
          font-size: 10px;
        }

        .license-status-tag {
          margin: 0 !important;
          border-radius: 7px !important;
          font-size: 10px !important;
          font-weight: 700;
          padding: 2px 7px !important;
        }

        .license-card-body {
          padding: 17px;
          background: ${COLORS.white};
        }

        .license-main-value {
          padding: 15px;
          margin-bottom: 13px;
          border: 1px solid;
          border-radius: 12px;
          background: ${COLORS.white};
        }

        .license-value-label {
          display: block;
          margin-bottom: 3px;
          color: ${COLORS.textSecondary};
          font-size: 10px;
        }

        .license-value {
          margin: 0 !important;
          font-size: 26px !important;
          line-height: 1.25 !important;
          font-weight: 800 !important;
        }

        .license-info-list {
          margin-bottom: 14px;
        }

        .license-info-row {
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-bottom: 1px solid ${COLORS.border};
        }

        .license-info-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: ${COLORS.textSecondary};
          font-size: 10px;
        }

        .license-info-icon {
          color: ${COLORS.muted};
          font-size: 12px;
        }

        .license-info-value {
          color: ${COLORS.text};
          font-size: 10px;
          text-align: right;
        }

        .license-alert {
          border-radius: 10px !important;
          font-size: 10px;
        }

        .license-alert .ant-alert-message {
          font-size: 11px;
          font-weight: 700;
        }

        .license-alert .ant-alert-description {
          font-size: 10px;
          line-height: 1.5;
        }

        /* =====================================================
           INFORMATION CARD
        ===================================================== */

        .information-card {
          overflow: hidden;
        }

        .information-card-header {
          padding: 21px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .section-eyebrow {
          display: block;
          margin-bottom: 4px;
          color: ${COLORS.goldDark};
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .information-card-title {
          margin: 0 !important;
          color: ${COLORS.navyDark} !important;
          font-size: 18px !important;
        }

        .information-card-description {
          display: block;
          margin-top: 3px;
          color: ${COLORS.textSecondary};
          font-size: 11px;
        }

        .editable-tag {
          margin: 0;
          padding: 5px 9px;
          border-radius: 7px;
          border-color: #C9D7E4;
          background: ${COLORS.navyLight};
          color: ${COLORS.navy};
          font-size: 10px;
        }

        .information-card-content {
          padding: 0 22px 22px;
        }

        /* =====================================================
           TABS
        ===================================================== */

        .parish-tabs .ant-tabs-nav {
          margin-bottom: 22px;
        }

        .parish-tabs .ant-tabs-tab {
          padding: 13px 4px;
          margin-right: 25px;
          color: ${COLORS.textSecondary};
          font-size: 12px;
        }

        .parish-tabs .ant-tabs-tab:hover {
          color: ${COLORS.navy};
        }

        .parish-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: ${COLORS.navy};
          font-weight: 700;
        }

        .parish-tabs .ant-tabs-ink-bar {
          height: 2px;
          background: ${COLORS.gold};
        }

        .parish-tabs .ant-tabs-tab .anticon {
          margin-right: 6px;
        }

        /* =====================================================
           FORM
        ===================================================== */

        .parish-settings-page .ant-form-item {
          margin-bottom: 18px;
        }

        .parish-settings-page .ant-form-item-label {
          padding-bottom: 6px;
        }

        .parish-settings-page .ant-form-item-label > label {
          color: ${COLORS.text};
          font-size: 11px;
          font-weight: 600;
        }

        .form-input {
          height: 42px;
          border-radius: 9px !important;
          border-color: ${COLORS.borderDark};
          box-shadow: none !important;
        }

        .form-input:hover,
        .form-input:focus {
          border-color: ${COLORS.navy};
        }

        .form-input .ant-input {
          box-shadow: none !important;
        }

        .input-icon {
          color: ${COLORS.muted};
        }

        .form-select {
          width: 100%;
        }

        .form-select .ant-select-selector {
          height: 42px !important;
          border-radius: 9px !important;
          border-color: ${COLORS.borderDark} !important;
          box-shadow: none !important;
          display: flex;
          align-items: center;
        }

        .form-select.ant-select-focused
        .ant-select-selector {
          border-color: ${COLORS.navy} !important;
          box-shadow: none !important;
        }

        .form-input-number {
          height: 42px;
          border-radius: 9px !important;
          border-color: ${COLORS.borderDark};
          box-shadow: none !important;
        }

        .form-input-number:hover,
        .form-input-number:focus {
          border-color: ${COLORS.navy};
        }

        .description-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border-radius: 10px;
          background: ${COLORS.navySoft};
          border: 1px solid ${COLORS.border};
        }

        .description-heading-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: ${COLORS.navyLight};
          color: ${COLORS.navy};
        }

        .description-heading > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .description-heading > div:last-child .ant-typography:first-child {
          color: ${COLORS.text};
          font-size: 12px;
        }

        .description-heading > div:last-child .ant-typography:last-child {
          font-size: 10px;
        }

        .description-textarea {
          border-radius: 10px !important;
          border-color: ${COLORS.borderDark};
          resize: vertical;
          box-shadow: none !important;
        }

        .description-textarea:hover,
        .description-textarea:focus {
          border-color: ${COLORS.navy};
        }

        /* =====================================================
           SUMMARY
        ===================================================== */

        .summary-card {
          margin-top: 20px;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .summary-header-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: ${COLORS.goldLight};
          color: ${COLORS.goldDark};
          font-size: 17px;
        }

        .summary-title {
          display: block;
          color: ${COLORS.navyDark};
          font-size: 14px;
          font-weight: 700;
        }

        .summary-description {
          display: block;
          margin-top: 2px;
          color: ${COLORS.textSecondary};
          font-size: 10px;
        }

        .summary-card .ant-divider {
          margin: 16px 0;
          border-color: ${COLORS.border};
        }

        .summary-item {
          min-height: 70px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 11px;
          border: 1px solid ${COLORS.border};
          background: ${COLORS.navySoft};
        }

        .summary-item-icon {
          width: 32px;
          height: 32px;
          min-width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: ${COLORS.white};
          color: ${COLORS.navy};
          border: 1px solid ${COLORS.border};
          font-size: 13px;
        }

        .summary-item-content {
          min-width: 0;
        }

        .summary-item-label {
          display: block;
          margin-bottom: 3px;
          color: ${COLORS.muted};
          font-size: 9px;
        }

        .summary-item-value {
          display: block;
          color: ${COLORS.text};
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =====================================================
           RESPONSIVE - TABLET
        ===================================================== */

        @media (max-width: 1100px) {
          .information-card-header {
            padding: 18px;
          }

          .information-card-content {
            padding: 0 18px 18px;
          }

          .church-image {
            width: 145px;
            height: 145px;
          }
        }

        /* =====================================================
           RESPONSIVE - MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .parish-settings-page {
            padding-bottom: 20px;
          }

          .settings-card,
          .license-card {
            border-radius: 14px !important;
          }

          .information-card-header {
            align-items: flex-start;
            flex-direction: column;
            padding: 17px;
          }

          .information-card-content {
            padding: 0 14px 16px;
          }

          .editable-tag {
            width: fit-content;
          }

          .parish-tabs .ant-tabs-nav {
            overflow-x: auto;
          }

          .parish-tabs .ant-tabs-tab {
            margin-right: 17px;
            white-space: nowrap;
          }

          .license-card-top {
            padding: 14px;
          }

          .license-card-body {
            padding: 14px;
          }

          .license-value {
            font-size: 24px !important;
          }

          .church-image {
            width: 150px;
            height: 150px;
          }

          .summary-card {
            margin-top: 14px;
          }

          .summary-item {
            min-height: 62px;
          }
        }

        /* =====================================================
           RESPONSIVE - SMALL MOBILE
        ===================================================== */

        @media (max-width: 480px) {
          .information-card-title {
            font-size: 16px !important;
          }

          .information-card-description {
            font-size: 10px;
          }

          .parish-tabs .ant-tabs-tab {
            font-size: 11px;
            margin-right: 14px;
          }

          .form-input,
          .form-input-number {
            height: 40px;
          }

          .form-select .ant-select-selector {
            height: 40px !important;
          }

          .license-heading-title {
            font-size: 12px;
          }

          .license-status-tag {
            font-size: 9px !important;
          }

          .license-value {
            font-size: 22px !important;
          }

          .license-info-label,
          .license-info-value {
            font-size: 9px;
          }

          .summary-item-value {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default ParishSettingsPage;
