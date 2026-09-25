import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Modal,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Image,
  Input,
  Row,
  Spin,
  Tag,
  Upload,
  message,
} from "antd";

import {
  BankOutlined,
  CheckCircleFilled,
  CheckOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  FileImageOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  ShopOutlined,
  UserOutlined,
  WalletOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import qr_img from "../../../assets/images/qr_img.JPG";
import qr_zalo from "../../../assets/images/qr_zalo.JPG";
import PageHeroHeader from "../../../components/common/PageHeroHeader";

import licenseApi from "../../../api/licenseApi";

import "./licensePage.css";

const PACKAGE_AMOUNT = 299000;

const formatMoney = (value) => {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
};

const formatDateTime = (value) => {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusConfig = (status) => {
  switch (status) {
    case "approved":
      return {
        color: "success",
        icon: <CheckCircleFilled />,
        label: "Đã duyệt",
      };

    case "rejected":
      return {
        color: "error",
        icon: <InfoCircleOutlined />,
        label: "Từ chối",
      };

    case "pending":
    default:
      return {
        color: "warning",
        icon: <ClockCircleOutlined />,
        label: "Đang xử lý",
      };
  }
};

const LicensePage = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [config, setConfig] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  const [paymentFile, setPaymentFile] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [configResponse, registrationResponse] = await Promise.all([
        licenseApi.getConfig(),
        licenseApi.getMyRegistrations(),
      ]);

      console.log("configResponse:::", configResponse);
      console.log("registrationResponse:::", registrationResponse);

      if (configResponse?.success) {
        setConfig(configResponse.data);
      } else {
        throw new Error(
          configResponse?.message || "Không thể tải thông tin gói FaithEdu",
        );
      }

      if (registrationResponse?.success) {
        setRegistrations(
          Array.isArray(registrationResponse.data)
            ? registrationResponse.data
            : [],
        );
      }
    } catch (error) {
      console.error("LOAD LICENSE PAGE ERROR:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải thông tin đăng ký",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const latestRegistration = registrations[0] || null;

  const hasPendingRegistration = useMemo(() => {
    return registrations.some((item) => item.status === "pending");
  }, [registrations]);

  const packageInfo = config?.package || {
    name: "FaithEdu - Giáo xứ",
    amount: PACKAGE_AMOUNT,
  };

  const church = config?.church || {};

  const payment = config?.payment || {};

  const support = config?.support || {};

  const transferContent =
    config?.transfer_content ||
    `DANG KY FAITHEDU - GIAO XU ${church?.name || ""}`;

  const copyText = async (text, successMessage) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      message.success(successMessage || "Đã sao chép");
    } catch (error) {
      console.error("COPY ERROR:", error);

      message.error("Không thể sao chép");
    }
  };

  const handleBeforeUpload = (file) => {
    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(
      file.type,
    );

    if (!isImage) {
      message.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP");

      return Upload.LIST_IGNORE;
    }

    const isUnder5MB = file.size / 1024 / 1024 <= 5;

    if (!isUnder5MB) {
      message.error("Ảnh chuyển khoản không được vượt quá 5MB");

      return Upload.LIST_IGNORE;
    }

    setPaymentFile(file);

    return false;
  };

  const handleRemovePaymentImage = () => {
    setPaymentFile(null);
  };

  const handleSubmit = async (values) => {
    if (hasPendingRegistration) {
      message.warning("Giáo xứ đang có yêu cầu đăng ký chờ xử lý");

      return;
    }

    if (!paymentFile) {
      message.error("Vui lòng tải ảnh xác nhận chuyển khoản");

      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("name", values.name?.trim() || "");

      formData.append("phone", values.phone?.trim() || "");

      formData.append("email", values.email?.trim() || "");

      formData.append("payment_image", paymentFile);

      const response = await licenseApi.createRegistration(formData);

      if (!response?.success) {
        throw new Error(response?.message || "Không thể gửi đăng ký");
      }

      message.success("Đã gửi đăng ký FaithEdu thành công");

      form.resetFields();

      setPaymentFile(null);

      await loadData();
    } catch (error) {
      console.error("SUBMIT LICENSE REGISTRATION ERROR:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể gửi đăng ký",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePending = (registration) => {
    Modal.confirm({
      title: "Xóa yêu cầu đăng ký?",
      content: "Yêu cầu đang chờ xử lý sẽ bị xóa khỏi hệ thống.",
      okText: "Xóa yêu cầu",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
      },

      onOk: async () => {
        try {
          await licenseApi.deleteRegistration(registration.id);

          message.success("Đã xóa yêu cầu đăng ký");

          await loadData();
        } catch (error) {
          message.error(
            error?.response?.data?.message ||
              error?.message ||
              "Không thể xóa yêu cầu",
          );
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="license-page-loading">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 28 }} spin />} />

        <span>Đang tải thông tin FaithEdu...</span>
      </div>
    );
  }

  return (
    <div className="license-page">
      <PageHeroHeader
        title="Gói FaithEdu"
        subtitle="Đăng ký và gia hạn dịch vụ FaithEdu cho giáo xứ"
        icon={<SafetyCertificateOutlined />}
      />

      <div className="license-page-container">
        {latestRegistration?.status === "pending" && (
          <Alert
            className="license-status-alert"
            type="warning"
            showIcon
            icon={<ClockCircleOutlined />}
            message="Yêu cầu đăng ký đang được xử lý"
            description={
              <span>
                Giáo xứ đã gửi yêu cầu vào{" "}
                <strong>{formatDateTime(latestRegistration.created_at)}</strong>
                . Vui lòng chờ hệ thống xác nhận.
              </span>
            }
            action={
              <Button
                size="small"
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleDeletePending(latestRegistration)}
              >
                Xóa yêu cầu
              </Button>
            }
          />
        )}

        {latestRegistration?.status === "rejected" && (
          <Alert
            className="license-status-alert"
            type="error"
            showIcon
            message="Yêu cầu đăng ký chưa được chấp nhận"
            description={
              latestRegistration.reject_reason ||
              "Vui lòng kiểm tra lại thông tin chuyển khoản và gửi yêu cầu mới."
            }
          />
        )}

        {latestRegistration?.status === "approved" && (
          <Alert
            className="license-status-alert"
            type="success"
            showIcon
            message="Đăng ký FaithEdu đã được xác nhận"
            description="Gói FaithEdu của giáo xứ đã được hệ thống ghi nhận."
          />
        )}

        <Row gutter={[20, 20]} className="license-top-grid">
          <Col xs={24} lg={8}>
            <Card bordered={false} className="license-support-card">
              <div className="license-card-label">
                <CustomerServiceOutlined />
                HỖ TRỢ FAITHEDU
              </div>

              <h2>Tham gia nhóm Zalo</h2>

              <p className="license-card-description">
                Trao đổi, nhận hỗ trợ kỹ thuật và cập nhật thông tin mới nhất từ
                FaithEdu.
              </p>

              <div className="license-qr-box license-zalo-qr">
                {support.zalo_qr_url ? (
                  <Image src={qr_zalo} preview alt="QR nhóm Zalo FaithEdu" />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa cấu hình QR Zalo"
                  />
                )}
              </div>

              {support.zalo_group_url && (
                <Button
                  block
                  size="large"
                  icon={<WhatsAppOutlined />}
                  className="license-zalo-button"
                  href={support.zalo_group_url}
                  target="_blank"
                >
                  Mở nhóm Zalo hỗ trợ
                </Button>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card bordered={false} className="license-package-card">
              <div className="license-package-glow" />

              <div className="license-package-content">
                <div className="license-package-icon">
                  <ShopOutlined />
                </div>

                <div className="license-package-heading">
                  <span className="license-eyebrow">GÓI DỊCH VỤ</span>

                  <h2>{packageInfo.name}</h2>

                  <p>Dành cho công tác quản lý giáo lý tại giáo xứ</p>
                </div>

                <div className="license-package-price">
                  <strong>{formatMoney(packageInfo.amount)}</strong>

                  <span>đ</span>
                </div>

                <div className="license-package-divider" />

                <div className="license-feature-list">
                  <div>
                    <CheckOutlined />
                    Quản lý lớp học và học viên
                  </div>

                  <div>
                    <CheckOutlined />
                    Điểm danh và quản lý kết quả
                  </div>

                  <div>
                    <CheckOutlined />
                    Thư viện giáo lý và kiểm tra
                  </div>

                  <div>
                    <CheckOutlined />
                    Báo cáo quản lý giáo lý
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[20, 20]} className="license-main-grid">
          <Col xs={24} lg={14}>
            <Card bordered={false} className="license-form-card">
              <div className="license-section-heading">
                <div className="license-section-icon">
                  <UserOutlined />
                </div>

                <div>
                  <h2>Thông tin đăng ký</h2>

                  <p>Nhập thông tin người phụ trách đăng ký FaithEdu</p>
                </div>
              </div>

              <Divider />

              <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={handleSubmit}
                disabled={hasPendingRegistration || submitting}
              >
                <Form.Item
                  label="Họ và tên"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập họ và tên",
                    },
                    {
                      max: 255,
                      message: "Họ và tên không được vượt quá 255 ký tự",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<UserOutlined />}
                    placeholder="Nhập họ và tên người đăng ký"
                  />
                </Form.Item>

                <Row gutter={14}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Số điện thoại"
                      name="phone"
                      rules={[
                        {
                          max: 30,
                          message: "Số điện thoại không hợp lệ",
                        },
                      ]}
                    >
                      <Input size="large" placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        {
                          type: "email",
                          message: "Email không hợp lệ",
                        },
                      ]}
                    >
                      <Input size="large" placeholder="Nhập email" />
                    </Form.Item>
                  </Col>
                </Row>

                <div className="license-transfer-content">
                  <div className="license-transfer-label">
                    <span>Nội dung chuyển khoản</span>

                    <Tag color="blue">Tự động</Tag>
                  </div>

                  <div className="license-transfer-value">
                    <span>{transferContent}</span>

                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() =>
                        copyText(
                          transferContent,
                          "Đã sao chép nội dung chuyển khoản",
                        )
                      }
                    />
                  </div>

                  <small>
                    Sử dụng đúng nội dung này khi chuyển khoản để hệ thống dễ
                    đối soát.
                  </small>
                </div>

                <Form.Item
                  label="Ảnh xác nhận chuyển khoản"
                  required
                  className="license-upload-form-item"
                >
                  {!paymentFile ? (
                    <Upload.Dragger
                      accept=".jpg,.jpeg,.png,.webp"
                      beforeUpload={handleBeforeUpload}
                      showUploadList={false}
                      multiple={false}
                      disabled={hasPendingRegistration || submitting}
                    >
                      <div className="license-upload-icon">
                        <CloudUploadOutlined />
                      </div>

                      <div className="license-upload-title">
                        Tải ảnh chuyển khoản
                      </div>

                      <div className="license-upload-description">
                        Kéo thả ảnh vào đây hoặc bấm để chọn
                      </div>

                      <div className="license-upload-hint">
                        JPG, PNG, WEBP · tối đa 5MB
                      </div>
                    </Upload.Dragger>
                  ) : (
                    <div className="license-upload-preview">
                      <div className="license-upload-preview-image">
                        <Image
                          src={URL.createObjectURL(paymentFile)}
                          alt="Ảnh chuyển khoản"
                        />
                      </div>

                      <div className="license-upload-preview-info">
                        <div className="license-upload-file-name">
                          <FileImageOutlined />
                          <span>{paymentFile.name}</span>
                        </div>

                        <span>
                          {(paymentFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>

                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={handleRemovePaymentImage}
                      >
                        Xóa ảnh
                      </Button>
                    </div>
                  )}
                </Form.Item>

                <div className="license-submit-note">
                  <InfoCircleOutlined />

                  <span>
                    Sau khi gửi, yêu cầu sẽ được kiểm tra và xác nhận. Vui lòng
                    đảm bảo ảnh chuyển khoản rõ ràng.
                  </span>
                </div>

                <Button
                  htmlType="submit"
                  type="primary"
                  size="large"
                  block
                  loading={submitting}
                  icon={!submitting && <SendOutlined />}
                  className="license-submit-button"
                >
                  {submitting ? "Đang gửi đăng ký..." : "Gửi đăng ký FaithEdu"}
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card bordered={false} className="license-payment-card">
              <div className="license-section-heading">
                <div className="license-section-icon gold">
                  <WalletOutlined />
                </div>

                <div>
                  <h2>Thanh toán</h2>

                  <p>Quét QR hoặc chuyển khoản theo thông tin bên dưới</p>
                </div>
              </div>

              <Divider />

              <div className="license-payment-qr">
                {payment.qr_url ? (
                  <Image src={qr_img} preview alt="QR thanh toán FaithEdu" />
                ) : (
                  <div className="license-payment-qr-empty">
                    <QrcodeOutlined />
                    <span>Chưa cấu hình QR thanh toán</span>
                  </div>
                )}
              </div>

              <div className="license-payment-amount">
                <span>Số tiền thanh toán</span>

                <strong>{formatMoney(packageInfo.amount)}đ</strong>
              </div>

              <div className="license-bank-info">
                <div className="license-bank-row">
                  <span>
                    <BankOutlined />
                    Ngân hàng
                  </span>

                  <strong>{payment.bank_name || "--"}</strong>
                </div>

                <div className="license-bank-row">
                  <span>Số tài khoản</span>

                  <strong className="license-copy-value">
                    {payment.account_number || "--"}

                    {payment.account_number && (
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() =>
                          copyText(
                            payment.account_number,
                            "Đã sao chép số tài khoản",
                          )
                        }
                      />
                    )}
                  </strong>
                </div>

                <div className="license-bank-row">
                  <span>Chủ tài khoản</span>

                  <strong>{payment.account_name || "--"}</strong>
                </div>
              </div>

              <div className="license-payment-content">
                <span>Nội dung chuyển khoản</span>

                <div>
                  <strong>{transferContent}</strong>

                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() =>
                      copyText(
                        transferContent,
                        "Đã sao chép nội dung chuyển khoản",
                      )
                    }
                  />
                </div>
              </div>

              <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message="Lưu ý"
                description="Sau khi chuyển khoản, hãy tải ảnh giao dịch lên biểu mẫu bên trái để hoàn tất đăng ký."
              />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} className="license-history-card">
          <div className="license-history-header">
            <div className="license-section-heading compact">
              <div className="license-section-icon">
                <ClockCircleOutlined />
              </div>

              <div>
                <h2>Lịch sử đăng ký</h2>

                <p>Các yêu cầu đăng ký FaithEdu của giáo xứ</p>
              </div>
            </div>

            <Button icon={<ReloadOutlined />} onClick={loadData}>
              Làm mới
            </Button>
          </div>

          <Divider />

          {registrations.length === 0 ? (
            <div className="license-history-empty">
              <Empty
                image={
                  <Avatar size={64} icon={<SafetyCertificateOutlined />} />
                }
                description="Chưa có lịch sử đăng ký"
              />
            </div>
          ) : (
            <div className="license-history-list">
              {registrations.map((registration) => {
                const status = getStatusConfig(registration.status);

                return (
                  <div className="license-history-item" key={registration.id}>
                    <div className="license-history-icon">{status.icon}</div>

                    <div className="license-history-main">
                      <div className="license-history-title">
                        <strong>{registration.package_name}</strong>

                        <Tag color={status.color} icon={status.icon}>
                          {status.label}
                        </Tag>
                      </div>

                      <div className="license-history-meta">
                        <span>
                          Người đăng ký: <strong>{registration.name}</strong>
                        </span>

                        <span>
                          Số tiền:{" "}
                          <strong>{formatMoney(registration.amount)}đ</strong>
                        </span>

                        <span>{formatDateTime(registration.created_at)}</span>
                      </div>

                      {registration.status === "rejected" &&
                        registration.reject_reason && (
                          <div className="license-history-reason">
                            <strong>Lý do:</strong> {registration.reject_reason}
                          </div>
                        )}
                    </div>

                    <div className="license-history-action">
                      {registration.payment_image && (
                        <Image
                          width={54}
                          height={54}
                          src={`${process.env.REACT_APP_API_URL}${registration.payment_image}`}
                          preview
                          className="license-history-image"
                          alt="Ảnh chuyển khoản"
                        />
                      )}

                      {registration.status === "pending" && (
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeletePending(registration)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="license-footer-note">
          <SafetyCertificateOutlined />

          <span>FaithEdu · Số hóa giáo lý - Kết nối đức tin</span>
        </div>
      </div>
    </div>
  );
};

export default LicensePage;
