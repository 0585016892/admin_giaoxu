import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Form,
  Input,
  Button,
  Upload,
  Space,
  Tag,
  Divider,
  message,
  ConfigProvider,
  Descriptions,
  DatePicker,
  Skeleton,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  LockOutlined,
  CameraOutlined,
  SaveOutlined,
  KeyOutlined,
  StarFilled,
  CrownFilled,
  BookOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import AppButton from "../../components/common/AppButton";
import { useUser } from "../../context/UserContext";
import { getAdminById, updateAdmin, changePassword } from "../../api/adminApi";

const { Title, Text } = Typography;

// =====================================================
// HELPER FUNCTIONS & CONFIG
// =====================================================

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  gold: "#D9A441",
  background: "#F7F9FC",
  white: "#FFFFFF",

  text: "#173B5E",
  textSecondary: "#64748B",
  muted: "#94A3B8",
  border: "#E2E8F0",

  navyLight: "#EEF3F7",
  goldLight: "#FBF5E7",

  success: "#2E7D5B",
  successBg: "#EAF6F0",
  warning: "#B7791F",
  warningBg: "#FFF7E5",
  gray: "#64748B",
  grayBg: "#F1F5F9",

  danger: "#C0392B",
  dangerBg: "#FDEDEC",
};

const translateRole = (role) => {
  const roleMap = {
    priest: "Linh mục Chánh xứ ✝️",
    admin: "Ban Quản Trị ✨",
    teacher: "Giáo lý viên / Huynh trưởng 🌸",
    admin_catechist: "Quản trị viên Giáo lý 🌸",
    catechist: "Huấn luyện viên Giáo lý 🌸",
    liturgy_manager: "Ban Phụng Vụ ⛪",
    media_manager: "Ban Truyền Thông 📸",
  };
  return roleMap[role] || "Hội đồng Mục vụ 🌿";
};

// =====================================================
// SUB-COMPONENTS (MEMOIZED FOR PERFORMANCE)
// =====================================================

// 1. Sidebar Thẻ Tóm Tắt Profile
const ProfileSidebar = memo(
  ({ profileData, accountType, fileList, onAvatarChange }) => {
    const userName =
      profileData?.full_name || profileData?.username || "Huynh Trưởng";
    const avatarUrl =
      fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : null;

    return (
      <Card bordered={false} className="custom-card">
        <div className="custom-avatar-upload-box">
          <div className="custom-avatar-ring">
            <Avatar
              size={116}
              src={avatarUrl}
              icon={<UserOutlined />}
              className="custom-main-avatar"
            />
            <span className={`custom-star-badge ${accountType.key}`}>
              {accountType.key === "vip" ? <CrownFilled /> : <StarFilled />}
            </span>
          </div>

          <Upload showUploadList={false} beforeUpload={onAvatarChange}>
            <Button
              type="primary"
              shape="circle"
              icon={<CameraOutlined />}
              className="custom-upload-btn"
            />
          </Upload>
        </div>

        <div className="custom-user-id-box">
          <Title level={4} className="custom-full-name">
            {profileData?.saint_name && (
              <span className="custom-saint">{profileData.saint_name} </span>
            )}
            {userName}
          </Title>

          <Text type="secondary" className="custom-username-text">
            @{profileData?.username || "username"}
          </Text>

          <div className="custom-tags-group">
            <Tag className="custom-tag-role">
              {translateRole(profileData?.role)}
            </Tag>
            <Tag
              icon={accountType.icon}
              style={{
                color: accountType.color,
                background: accountType.bg,
                borderColor: accountType.border,
              }}
              className="custom-tag-account"
            >
              {accountType.label}
            </Tag>
          </div>
        </div>

        <Divider style={{ margin: "20px 0", borderColor: COLORS.border }} />

        <Descriptions column={1} size="small" className="custom-quick-desc">
          <Descriptions.Item label="ID Hệ thống">
            <strong style={{ color: COLORS.gold }}>
              #{profileData?.id || "—"}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label="Chức danh">
            <span style={{ color: COLORS.text, fontWeight: 700 }}>
              {profileData?.position || "Chưa cập nhật"}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {profileData?.email || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Điện thoại">
            {profileData?.phone || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag className="custom-status-tag">● Đang hoạt động</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  },
);

// 2. Skeleton Loading Component
const ProfileSkeleton = () => (
  <Row gutter={[20, 20]}>
    <Col xs={24} lg={8}>
      <Card bordered={false} className="custom-card">
        <Space
          direction="vertical"
          align="center"
          style={{ width: "100%", padding: "20px 0" }}
        >
          <Skeleton.Avatar active size={116} shape="circle" />
          <Skeleton.Input active style={{ width: 160 }} size="small" />
          <Skeleton.Input active style={{ width: 100 }} size="small" />
        </Space>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    </Col>
    <Col xs={24} lg={16}>
      <Card bordered={false} className="custom-card">
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    </Col>
  </Row>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function ProfilePageCate() {
  const { user } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Cấu hình loại tài khoản (VIP/Member)
  const accountType = useMemo(() => {
    const type = String(profileData?.account_type || user?.account_type || "")
      .trim()
      .toLowerCase();

    if (type === "vip") {
      return {
        key: "vip",
        label: "Thành viên VIP",
        icon: <CrownFilled />,
        color: COLORS.gold,
        bg: COLORS.goldLight,
        border: COLORS.gold,
      };
    }
    return {
      key: "member",
      label: "Thành viên",
      icon: <StarFilled />,
      color: COLORS.textSecondary,
      bg: COLORS.grayBg,
      border: COLORS.muted,
    };
  }, [profileData?.account_type, user?.account_type]);

  // Tải dữ liệu hồ sơ từ API
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await getAdminById(user.id);
      const data = res.data?.data || res.data || {};

      setProfileData(data);

      profileForm.setFieldsValue({
        saint_name: data.saint_name || "",
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        position: data.position || "",
        birthday: data.birthday ? dayjs(data.birthday) : null,
        hometown: data.hometown || "",
        address: data.address || "",
        ordination_date: data.ordination_date
          ? dayjs(data.ordination_date)
          : null,
        motto: data.motto || "",
        bio: data.bio || "",
        role: data.role || "catechist",
      });

      if (data.avatar) {
        const fullAvatarUrl =
          data.avatar.startsWith("http://") ||
          data.avatar.startsWith("https://") ||
          data.avatar.startsWith("blob:")
            ? data.avatar
            : `${API_URL}${data.avatar.startsWith("/") ? "" : "/"}${data.avatar}`;

        setFileList([
          { uid: "-1", name: "avatar.png", status: "done", url: fullAvatarUrl },
        ]);
      } else {
        setFileList([]);
      }
    } catch (error) {
      message.error("Không thể tải thông tin hồ sơ cá nhân!");
    } finally {
      setLoading(false);
    }
  }, [user?.id, profileForm]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Xử lý xem trước ảnh khi người dùng chọn file mới
  const handleBeforeUploadAvatar = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setFileList([
        {
          uid: "-1",
          name: file.name,
          status: "done",
          url: reader.result,
          originFileObj: file,
        },
      ]);
    };
    return false;
  };

  // Cập nhật thông tin hồ sơ
  const handleUpdateProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setSubmitLoading(true);

      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (key === "avatar") return;
        const val = values[key];
        if (val !== undefined && val !== null) {
          if (key === "birthday" || key === "ordination_date") {
            if (val && dayjs.isDayjs(val)) {
              formData.append(key, val.format("YYYY-MM-DD"));
            } else if (typeof val === "string") {
              formData.append(key, val);
            }
          } else {
            formData.append(key, val);
          }
        }
      });

      if (fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }

      const res = await updateAdmin(user.id, formData);
      message.success(
        res.data?.message || "Cập nhật thông tin cá nhân thành công! ✨",
      );
      fetchProfile();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Cập nhật thông tin thất bại!",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setPasswordLoading(true);

      await changePassword(user.id, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success("Đổi mật khẩu thành công! 🔐");
      passwordForm.resetFields();
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại!",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: COLORS.navy,
          borderRadius: 16,
          colorBgLayout: COLORS.background,
          fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <div className="custom-profile-layout">
        <div className="custom-profile-container">
          {/* HEADER BANNER */}
          <div className="custom-header-banner">
            <PageHeroHeader
              icon={<UserOutlined />}
              badgeText="✦ HỒ SƠ QUẢN TRỊ VIÊN HỆ THỐNG"
              title="Trung Tâm Hồ Sơ"
              description="Quản lý định danh tài khoản, thông tin công tác mục vụ và bảo mật hệ thống."
            />
          </div>

          {loading ? (
            <ProfileSkeleton />
          ) : (
            <Row gutter={[20, 20]}>
              {/* CỘT TRÁI: AVATAR & TÓM TẮT */}
              <Col xs={24} lg={8}>
                <ProfileSidebar
                  profileData={profileData}
                  accountType={accountType}
                  fileList={fileList}
                  onAvatarChange={handleBeforeUploadAvatar}
                />
              </Col>

              {/* CỘT PHẢI: FORM CẬP NHẬT & ĐỔI MẬT KHẨU */}
              <Col xs={24} lg={16}>
                <Space direction="vertical" size={20} style={{ width: "100%" }}>
                  {/* 1. FORM CẬP NHẬT THÔNG TIN */}
                  <Card
                    bordered={false}
                    className="custom-card"
                    title={
                      <div className="custom-card-header">
                        <IdcardOutlined style={{ color: COLORS.gold }} />
                        <span>Cập Nhật Thông Tin Hồ Sơ</span>
                      </div>
                    }
                  >
                    <Form
                      form={profileForm}
                      layout="vertical"
                      onFinish={handleUpdateProfile}
                    >
                      <Form.Item name="role" hidden>
                        <Input />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} sm={8}>
                          <Form.Item
                            label={
                              <span className="custom-label">Tên Thánh</span>
                            }
                            name="saint_name"
                          >
                            <Input
                              placeholder="Ví dụ: Giuse, Maria..."
                              className="custom-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={16}>
                          <Form.Item
                            label={
                              <span className="custom-label">Họ và tên *</span>
                            }
                            name="full_name"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập họ tên đầy đủ",
                              },
                            ]}
                          >
                            <Input
                              placeholder="Nhập họ và tên..."
                              className="custom-input"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="custom-label">
                                Email liên hệ *
                              </span>
                            }
                            name="email"
                            rules={[
                              {
                                required: true,
                                type: "email",
                                message: "Email không hợp lệ",
                              },
                            ]}
                          >
                            <Input
                              prefix={
                                <MailOutlined style={{ color: COLORS.navy }} />
                              }
                              placeholder="email@example.com"
                              className="custom-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="custom-label">
                                Số điện thoại
                              </span>
                            }
                            name="phone"
                          >
                            <Input
                              prefix={
                                <PhoneOutlined style={{ color: COLORS.navy }} />
                              }
                              placeholder="09xxxx..."
                              className="custom-input"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="custom-label">
                                Chức danh / Nhiệm vụ
                              </span>
                            }
                            name="position"
                          >
                            <Input
                              placeholder="Ví dụ: Huynh trưởng, Quản trị viên..."
                              className="custom-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="custom-label">Ngày sinh</span>
                            }
                            name="birthday"
                          >
                            <DatePicker
                              style={{ width: "100%" }}
                              format="YYYY-MM-DD"
                              placeholder="Chọn ngày sinh..."
                              className="custom-input"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="custom-label">Quê quán</span>
                            }
                            name="hometown"
                          >
                            <Input
                              prefix={
                                <HomeOutlined style={{ color: COLORS.navy }} />
                              }
                              placeholder="Quê hương..."
                              className="custom-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="custom-label">
                                Địa chỉ hiện tại
                              </span>
                            }
                            name="address"
                          >
                            <Input
                              prefix={
                                <HomeOutlined style={{ color: COLORS.navy }} />
                              }
                              placeholder="Nơi cư trú..."
                              className="custom-input"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* KHỐI DÀNH RIÊNG CHO LINH MỤC */}
                      {profileData?.role === "priest" && (
                        <div className="custom-priest-box">
                          <Divider
                            orientation="left"
                            style={{ borderColor: COLORS.goldLight }}
                          >
                            <span
                              style={{
                                color: COLORS.gold,
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              <SafetyCertificateOutlined /> Chức Thánh Mục Vụ
                            </span>
                          </Divider>

                          <Row gutter={16}>
                            <Col xs={24} sm={12}>
                              <Form.Item
                                label={
                                  <span className="custom-label">
                                    Ngày thụ phong
                                  </span>
                                }
                                name="ordination_date"
                              >
                                <DatePicker
                                  style={{ width: "100%" }}
                                  format="YYYY-MM-DD"
                                  placeholder="Ngày thụ phong..."
                                  className="custom-input"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item
                                label={
                                  <span className="custom-label">
                                    Khẩu hiệu Mục vụ
                                  </span>
                                }
                                name="motto"
                              >
                                <Input
                                  prefix={
                                    <BookOutlined
                                      style={{ color: COLORS.gold }}
                                    />
                                  }
                                  placeholder="Châm ngôn dâng hiến..."
                                  className="custom-input"
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item
                            label={
                              <span className="custom-label">
                                Tiểu sử tóm tắt
                              </span>
                            }
                            name="bio"
                          >
                            <Input.TextArea
                              rows={3}
                              placeholder="Đoạn giới thiệu ngắn..."
                              className="custom-input"
                            />
                          </Form.Item>
                        </div>
                      )}

                      <div style={{ textAlign: "right", marginTop: 12 }}>
                        <AppButton
                          key="submit"
                          icon={<SaveOutlined />}
                          type="primary"
                          loading={submitLoading}
                          onClick={handleUpdateProfile}
                          size="middle"
                        >
                          Lưu Thay Đổi ✨
                        </AppButton>
                      </div>
                    </Form>
                  </Card>

                  {/* 2. FORM ĐỔI MẬT KHẨU */}
                  <Card
                    bordered={false}
                    className="custom-card"
                    title={
                      <div className="custom-card-header">
                        <KeyOutlined style={{ color: COLORS.navy }} />
                        <span>Bảo Mật & Đổi Mật Khẩu</span>
                      </div>
                    }
                  >
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={handleChangePassword}
                    >
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="custom-label">
                                Mật khẩu hiện tại *
                              </span>
                            }
                            name="oldPassword"
                            rules={[
                              {
                                required: true,
                                message: "Nhập mật khẩu hiện tại",
                              },
                            ]}
                          >
                            <Input.Password
                              prefix={
                                <LockOutlined style={{ color: COLORS.navy }} />
                              }
                              placeholder="Mật khẩu cũ..."
                              className="custom-input"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="custom-label">
                                Mật khẩu mới *
                              </span>
                            }
                            name="newPassword"
                            rules={[
                              { required: true, message: "Nhập mật khẩu mới" },
                              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                            ]}
                          >
                            <Input.Password
                              prefix={
                                <LockOutlined style={{ color: COLORS.navy }} />
                              }
                              placeholder="Mật khẩu mới..."
                              className="custom-input"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <div style={{ textAlign: "right" }}>
                        <AppButton
                          key="submit-password"
                          icon={<KeyOutlined />}
                          type="primary"
                          loading={passwordLoading}
                          onClick={handleChangePassword}
                          size="middle"
                        >
                          Cập Nhật Mật Khẩu 🔐
                        </AppButton>
                      </div>
                    </Form>
                  </Card>
                </Space>
              </Col>
            </Row>
          )}
        </div>

        {/* STYLES CSS IN JS */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

          .custom-profile-layout {
            min-height: 100vh;
            font-family: 'Quicksand', 'Be Vietnam Pro', sans-serif;
            padding: 12px 0;
            background-color: ${COLORS.background};
          }

          .custom-profile-container {
            max-width: 100%;
          }

          .custom-header-banner {
            margin-bottom: 20px;
          }

          .custom-card {
            background: ${COLORS.white} !important;
            border-radius: 20px !important;
            border: 1px solid ${COLORS.border} !important;
            box-shadow: 0 10px 25px -5px rgba(23, 59, 94, 0.08) !important;
          }

          .custom-card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            color: ${COLORS.text};
            font-size: 15px;
            font-weight: 800;
          }

          .custom-avatar-upload-box {
            position: relative;
            width: 120px;
            margin: 8px auto 16px;
          }

          .custom-avatar-ring {
            position: relative;
            display: inline-block;
          }

          .custom-main-avatar {
            border: 3px solid ${COLORS.white};
            box-shadow: 0 6px 18px rgba(23, 59, 94, 0.15);
            background: ${COLORS.navy};
          }

          .custom-star-badge {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: ${COLORS.white};
            border: 2px solid ${COLORS.white};
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          }
          .custom-star-badge.vip { background: ${COLORS.gold}; }
          .custom-star-badge.member { background: ${COLORS.gray}; }

          .custom-upload-btn {
            position: absolute;
            bottom: -2px;
            left: 2px;
            background: ${COLORS.navy} !important;
            border-color: ${COLORS.white} !important;
            color: ${COLORS.white} !important;
            box-shadow: 0 4px 10px rgba(23, 59, 94, 0.3);
          }
          .custom-upload-btn:hover {
            background: ${COLORS.navyHover} !important;
          }

          .custom-user-id-box {
            text-align: center;
          }

          .custom-full-name {
            color: ${COLORS.text} !important;
            font-weight: 800 !important;
            margin: 0 !important;
            font-size: 18px !important;
          }

          .custom-saint {
            color: ${COLORS.gold};
          }

          .custom-username-text {
            font-size: 12px;
            font-weight: 700;
            color: ${COLORS.textSecondary};
          }

          .custom-tags-group {
            display: flex;
            justify-content: center;
            gap: 6px;
            margin-top: 10px;
            flex-wrap: wrap;
          }

          .custom-tag-role {
            margin: 0;
            border-radius: 10px;
            border: 1px solid ${COLORS.border};
            background: ${COLORS.navyLight};
            color: ${COLORS.navy};
            font-size: 11px;
            font-weight: 700;
            padding: 2px 10px;
          }

          .custom-tag-account {
            margin: 0;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 800;
            padding: 2px 10px;
          }

          .custom-quick-desc .ant-descriptions-item-label {
            color: ${COLORS.textSecondary} !important;
            font-weight: 600;
          }
          .custom-quick-desc .ant-descriptions-item-content {
            color: ${COLORS.text} !important;
          }

          .custom-status-tag {
            border-radius: 8px;
            font-weight: 700;
            font-size: 10px;
            background: ${COLORS.successBg} !important;
            color: ${COLORS.success} !important;
            border: 1px solid ${COLORS.success} !important;
          }

          .custom-label {
            font-weight: 700;
            color: ${COLORS.text};
            font-size: 12.5px;
          }

          .custom-input {
            border-radius: 12px !important;
            border-color: ${COLORS.border} !important;
            background: ${COLORS.grayBg} !important;
            color: ${COLORS.text} !important;
            transition: all 0.2s ease;
          }
          .custom-input input, .custom-input textarea {
            color: ${COLORS.text} !important;
          }
          .custom-input:hover, .custom-input:focus {
            background: ${COLORS.white} !important;
            border-color: ${COLORS.navy} !important;
            box-shadow: 0 0 0 3px rgba(23, 59, 94, 0.1) !important;
          }

          .custom-priest-box {
            background: ${COLORS.warningBg};
            border: 1.5px dashed ${COLORS.gold};
            padding: 14px;
            border-radius: 16px;
            margin-bottom: 16px;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
}
