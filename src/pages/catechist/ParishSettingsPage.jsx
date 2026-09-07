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
} from "@ant-design/icons";

import PageHeroHeader from "../../components/common/PageHeroHeader";
import AppButton from "../../components/common/AppButton";
import { useUser } from "../../context/UserContext";
import { useChurch } from "../../hooks/useChurch";

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

// ======================================================
// DESIGN TOKENS
// ======================================================

const COLORS = {
  navy: "#1B365D",
  navyDark: "#122845",
  gold: "#D4AF37",
  goldDark: "#A78318",

  text: "#1E293B",
  textSecondary: "#64748B",

  bg: "#F8FAFC",
  white: "#FFFFFF",
  border: "#E2E8F0",

  success: "#15803D",
  successBg: "#F0FDF4",

  warning: "#B45309",
  warningBg: "#FFFBEB",

  danger: "#B91C1C",
  dangerBg: "#FEF2F2",

  blueBg: "#EFF6FF",
};

// ======================================================
// HELPERS
// ======================================================

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

// ======================================================
// LICENSE CONFIG
// ======================================================

const getLicenseConfig = (status) => {
  switch (status) {
    case "active":
      return {
        label: "Đang hoạt động",
        shortLabel: "Hoạt động",
        color: COLORS.success,
        background: COLORS.successBg,
        border: "#BBF7D0",
        icon: <CheckCircleFilled />,
      };

    case "expired":
      return {
        label: "Đã hết hạn",
        shortLabel: "Hết hạn",
        color: COLORS.danger,
        background: COLORS.dangerBg,
        border: "#FECACA",
        icon: <ExclamationCircleFilled />,
      };

    case "trial":
    default:
      return {
        label: "Đang dùng thử",
        shortLabel: "Dùng thử",
        color: COLORS.warning,
        background: COLORS.warningBg,
        border: "#FDE68A",
        icon: <ClockCircleOutlined />,
      };
  }
};

// ======================================================
// COMPONENT
// ======================================================

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

  // ======================================================
  // CHURCH ID
  // ======================================================

  const churchId =
    user?.church_id || user?.church?.id || user?.parish_id || user?.parish?.id;

  // ======================================================
  // LICENSE
  // ======================================================

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

  // ======================================================
  // FETCH CHURCH
  // ======================================================

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

      // Có API trả trực tiếp object
      // Có API trả { data: {...} }
      // Có API trả { church: {...} }
      const rawData = res?.data ?? res;

      const data = rawData?.church ?? rawData;

      console.log("🏛️ Fetched church data:", data);

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
      console.error("❌ Fetch parish info error:", error);

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

  // ======================================================
  // SAVE
  // ======================================================

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
      console.error("❌ Save church error:", error);

      message.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi lưu thông tin giáo xứ!",
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // IMAGE UPLOAD
  // ======================================================

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

  // ======================================================
  // LICENSE CARD
  // ======================================================

  const renderLicenseCard = () => {
    const isTrial = licenseStatus === "trial";
    const isActive = licenseStatus === "active";
    const isExpired = licenseStatus === "expired";

    return (
      <Card
        bordered={false}
        style={{
          borderRadius: 24,
          border: `1px solid ${licenseConfig.border}`,
          background: licenseConfig.background,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
          {/* HEADER */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div>
              <Space align="center" size={10}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: COLORS.white,
                    color: licenseConfig.color,
                    border: `1px solid ${licenseConfig.border}`,
                    fontSize: 20,
                  }}
                >
                  <SafetyCertificateOutlined />
                </div>

                <div>
                  <Text
                    strong
                    style={{
                      display: "block",
                      color: COLORS.text,
                      fontSize: 15,
                    }}
                  >
                    License FaithEdu
                  </Text>

                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Quyền sử dụng hệ thống
                  </Text>
                </div>
              </Space>
            </div>

            <Tag
              icon={licenseConfig.icon}
              style={{
                margin: 0,
                borderRadius: 10,
                border: `1px solid ${licenseConfig.border}`,
                background: COLORS.white,
                color: licenseConfig.color,
                fontWeight: 700,
                padding: "4px 9px",
              }}
            >
              {licenseConfig.shortLabel}
            </Tag>
          </div>

          {/* MAIN VALUE */}

          <div
            style={{
              padding: "18px",
              background: COLORS.white,
              borderRadius: 18,
              border: `1px solid ${licenseConfig.border}`,
            }}
          >
            {isTrial && (
              <>
                <Text
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: COLORS.textSecondary,
                    marginBottom: 3,
                  }}
                >
                  Thời gian dùng thử còn lại
                </Text>

                <Title
                  level={2}
                  style={{
                    margin: 0,
                    fontSize: 32,
                    lineHeight: 1.2,
                    color: licenseConfig.color,
                    fontWeight: 800,
                  }}
                >
                  {daysRemaining !== null ? `${daysRemaining} ngày` : "--"}
                </Title>
              </>
            )}

            {isActive && (
              <>
                <Text
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: COLORS.textSecondary,
                    marginBottom: 3,
                  }}
                >
                  Trạng thái sử dụng
                </Text>

                <Title
                  level={2}
                  style={{
                    margin: 0,
                    fontSize: 28,
                    lineHeight: 1.2,
                    color: COLORS.success,
                    fontWeight: 800,
                  }}
                >
                  Vĩnh viễn
                </Title>
              </>
            )}

            {isExpired && (
              <>
                <Text
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: COLORS.textSecondary,
                    marginBottom: 3,
                  }}
                >
                  Trạng thái sử dụng
                </Text>

                <Title
                  level={2}
                  style={{
                    margin: 0,
                    fontSize: 28,
                    lineHeight: 1.2,
                    color: COLORS.danger,
                    fontWeight: 800,
                  }}
                >
                  Đã hết hạn
                </Title>
              </>
            )}
          </div>

          {/* DATE INFO */}

          <div>
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

          {/* ALERT */}

          {isTrial && (
            <Alert
              showIcon
              icon={<InfoCircleOutlined />}
              message="Thời gian dùng thử"
              description={`Hệ thống đang trong thời gian dùng thử. ${
                daysRemaining ?? 0
              } ngày còn lại.`}
              style={{
                borderRadius: 14,
                border: "1px solid #FDE68A",
              }}
            />
          )}

          {isActive && (
            <Alert
              type="success"
              showIcon
              message="License đang hoạt động"
              description="Giáo xứ đã được kích hoạt và có thể sử dụng FaithEdu không giới hạn thời gian."
              style={{
                borderRadius: 14,
              }}
            />
          )}

          {isExpired && (
            <Alert
              type="error"
              showIcon
              message="License đã hết hạn"
              description="Dữ liệu giáo xứ vẫn được bảo toàn. Vui lòng kích hoạt FaithEdu để tiếp tục sử dụng hệ thống."
              style={{
                borderRadius: 14,
              }}
            />
          )}
        </Space>
      </Card>
    );
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div
      style={{
        paddingBottom: 40,
        background: COLORS.bg,
        minHeight: "100%",
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

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

      {/* ==================================================
          CONTENT
      ================================================== */}

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
            {/* ==================================================
                LEFT
            ================================================== */}

            <Col xs={24} lg={7}>
              <Space direction="vertical" size={20} style={{ width: "100%" }}>
                {/* CHURCH IMAGE */}

                <Card
                  bordered={false}
                  style={{
                    borderRadius: 24,
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                    textAlign: "center",
                  }}
                  bodyStyle={{ padding: 22 }}
                >
                  <div style={{ marginBottom: 18 }}>
                    <Text
                      strong
                      style={{
                        color: COLORS.text,
                        display: "block",
                        fontSize: 15,
                      }}
                    >
                      Hình Ảnh Nhà Thờ / Logo
                    </Text>

                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Ảnh hiển thị trên báo cáo và ứng dụng
                    </Text>
                  </div>

                  {/* IMAGE */}

                  <div
                    style={{
                      width: 160,
                      height: 160,
                      margin: "0 auto 18px",
                      borderRadius: 22,
                      border: `2px dashed ${COLORS.gold}`,
                      padding: 5,
                      overflow: "hidden",
                      background: "#FFFCF2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={getImageUrl(imageUrl)}
                        alt="Church Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 17,
                        }}
                        onError={(e) => {
                          console.error(
                            "❌ Không tải được ảnh:",
                            e.currentTarget.src,
                          );
                        }}
                      />
                    ) : (
                      <BankOutlined
                        style={{
                          fontSize: 48,
                          color: COLORS.gold,
                        }}
                      />
                    )}
                  </div>

                  {isCatechist && (
                    <Upload
                      showUploadList={false}
                      beforeUpload={handleBeforeUpload}
                      accept="image/*"
                    >
                      <AppButton
                        icon={<UploadOutlined />}
                        style={{
                          borderRadius: 12,
                        }}
                      >
                        Chọn ảnh mới
                      </AppButton>
                    </Upload>
                  )}

                  {!isCatechist && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: "9px 12px",
                        borderRadius: 12,
                        background: "#F8FAFC",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textAlign: "left",
                      }}
                    >
                      <InfoCircleOutlined style={{ marginRight: 6 }} />
                      Tài khoản của bạn chỉ có quyền xem thông tin.
                    </div>
                  )}

                  {/* ACTIVE STATUS */}

                  <div
                    style={{
                      marginTop: 22,
                      paddingTop: 18,
                      borderTop: `1px dashed ${COLORS.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size={0}
                      style={{ textAlign: "left" }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: 13,
                          color: COLORS.text,
                        }}
                      >
                        Trạng thái hoạt động
                      </Text>

                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Trạng thái của giáo xứ
                      </Text>
                    </Space>

                    <Form.Item name="is_active" valuePropName="checked" noStyle>
                      <Switch disabled />
                    </Form.Item>
                  </div>
                </Card>

                {/* LICENSE */}

                {renderLicenseCard()}
              </Space>
            </Col>

            {/* ==================================================
                RIGHT
            ================================================== */}

            <Col xs={24} lg={17}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 24,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                }}
                bodyStyle={{ padding: 22 }}
              >
                <Tabs
                  defaultActiveKey="1"
                  items={[
                    // ==========================================
                    // TAB 1
                    // ==========================================

                    {
                      key: "1",

                      label: (
                        <span>
                          <HomeOutlined /> Thông Tin Cơ Bản
                        </span>
                      ),

                      children: (
                        <Row gutter={[16, 0]}>
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
                                style={{
                                  borderRadius: 12,
                                  height: 42,
                                }}
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
                              <Select
                                disabled
                                style={{
                                  height: 42,
                                }}
                              >
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
                                placeholder="VD: Giáo xứ Thái Hà"
                                style={{
                                  borderRadius: 12,
                                  height: 42,
                                }}
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
                                  <UserOutlined
                                    style={{
                                      color: "#94A3B8",
                                    }}
                                  />
                                }
                                placeholder="VD: Lm. Giuse Nguyễn Văn A"
                                style={{
                                  borderRadius: 12,
                                  height: 42,
                                }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      ),
                    },

                    // ==========================================
                    // TAB 2
                    // ==========================================

                    {
                      key: "2",

                      label: (
                        <span>
                          <EnvironmentOutlined /> Liên Hệ & Địa Chỉ
                        </span>
                      ),

                      children: (
                        <Row gutter={[16, 0]}>
                          <Col xs={24} sm={12}>
                            <Form.Item label="Số Điện Thoại" name="phone">
                              <Input
                                prefix={
                                  <PhoneOutlined
                                    style={{
                                      color: "#94A3B8",
                                    }}
                                  />
                                }
                                placeholder="0336 041 807"
                                style={{
                                  borderRadius: 12,
                                  height: 42,
                                }}
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
                                  <MailOutlined
                                    style={{
                                      color: "#94A3B8",
                                    }}
                                  />
                                }
                                placeholder="giaoxu@gmail.com"
                                style={{
                                  borderRadius: 12,
                                  height: 42,
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24}>
                            <Form.Item label="Địa Chỉ Chi Tiết" name="address">
                              <Input
                                placeholder="Số nhà, đường/thôn"
                                style={{
                                  borderRadius: 12,
                                  height: 42,
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item label="Phường / Xã" name="ward">
                              <Input
                                placeholder="VD: Quang Trung"
                                style={{
                                  borderRadius: 12,
                                  height: 42,
                                }}
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
                                style={{
                                  borderRadius: 12,
                                  height: 42,
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item label="Vĩ Độ (Latitude)" name="latitude">
                              <InputNumber
                                style={{
                                  width: "100%",
                                  borderRadius: 12,
                                  height: 42,
                                }}
                                step={0.000001}
                                placeholder="VD: 21.012345"
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
                                  borderRadius: 12,
                                  height: 42,
                                }}
                                step={0.000001}
                                placeholder="VD: 105.823456"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      ),
                    },

                    // ==========================================
                    // TAB 3
                    // ==========================================

                    {
                      key: "3",

                      label: (
                        <span>
                          <InfoCircleOutlined /> Mô Tả Bổ Sung
                        </span>
                      ),

                      children: (
                        <Form.Item
                          label="Giới Thiệu / Ghi Chú"
                          name="description"
                        >
                          <TextArea
                            rows={6}
                            placeholder="Nhập lược sử, thông tin giờ Lễ hoặc thông báo chung..."
                            style={{
                              borderRadius: 12,
                            }}
                          />
                        </Form.Item>
                      ),
                    },
                  ]}
                />
              </Card>

              {/* ==================================================
                  SUMMARY
              ================================================== */}

              <Card
                bordered={false}
                style={{
                  marginTop: 20,
                  borderRadius: 24,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
                }}
                bodyStyle={{ padding: 20 }}
              >
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <Text
                    strong
                    style={{
                      color: COLORS.navy,
                      fontSize: 14,
                    }}
                  >
                    <BankOutlined style={{ marginRight: 8 }} />
                    Thông tin hệ thống
                  </Text>

                  <Divider style={{ margin: "12px 0" }} />

                  <Row gutter={[20, 12]}>
                    <Col xs={24} sm={8}>
                      <SummaryItem
                        label="Mã giáo xứ"
                        value={churchData?.code || "--"}
                      />
                    </Col>

                    <Col xs={24} sm={8}>
                      <SummaryItem
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
                        label="Ngày tạo"
                        value={formatDate(churchData?.created_at)}
                      />
                    </Col>
                  </Row>
                </Space>
              </Card>
            </Col>
          </Row>
        </Form>
      </Spin>
    </div>
  );
};

// ======================================================
// LICENSE INFO ROW
// ======================================================

const LicenseInfoRow = ({ icon, label, value }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "9px 0",
        borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
      }}
    >
      <Space size={8}>
        <span
          style={{
            color: "#94A3B8",
            fontSize: 13,
          }}
        >
          {icon}
        </span>

        <Text
          style={{
            fontSize: 12,
            color: "#64748B",
          }}
        >
          {label}
        </Text>
      </Space>

      <Text
        strong
        style={{
          fontSize: 12,
          color: "#1E293B",
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </div>
  );
};

// ======================================================
// SUMMARY ITEM
// ======================================================

const SummaryItem = ({ label, value }) => {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 14,
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
      }}
    >
      <Text
        type="secondary"
        style={{
          display: "block",
          fontSize: 11,
          marginBottom: 3,
        }}
      >
        {label}
      </Text>

      <Text
        strong
        style={{
          color: "#1E293B",
          fontSize: 13,
        }}
      >
        {value}
      </Text>
    </div>
  );
};

export default ParishSettingsPage;
