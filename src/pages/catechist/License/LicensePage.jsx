import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
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
  Modal,
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
} from "@ant-design/icons";

import qr_img from "../../../assets/images/qr_img.JPG";
import qr_zalo from "../../../assets/images/qr_zalo.JPG";

import PageHeroHeader from "../../../components/common/PageHeroHeader";
import AppButton from "../../../components/common/AppButton";

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
        className: "approved",
        icon: <CheckCircleFilled />,
        label: "Đã duyệt",
      };

    case "rejected":
      return {
        color: "error",
        className: "rejected",
        icon: <InfoCircleOutlined />,
        label: "Từ chối",
      };

    case "pending":
    default:
      return {
        color: "warning",
        className: "pending",
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
  const [paymentPreview, setPaymentPreview] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [configResponse, registrationResponse] = await Promise.all([
        licenseApi.getConfig(),
        licenseApi.getMyRegistrations(),
      ]);

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

  useEffect(() => {
    return () => {
      if (paymentPreview) {
        URL.revokeObjectURL(paymentPreview);
      }
    };
  }, [paymentPreview]);

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

    if (paymentPreview) {
      URL.revokeObjectURL(paymentPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setPaymentFile(file);
    setPaymentPreview(previewUrl);

    return false;
  };

  const handleRemovePaymentImage = () => {
    if (paymentPreview) {
      URL.revokeObjectURL(paymentPreview);
    }

    setPaymentFile(null);
    setPaymentPreview("");
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
      handleRemovePaymentImage();

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
      centered: true,

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
        <div className="license-loading-card">
          <div className="license-loading-logo">
            <SafetyCertificateOutlined />
          </div>

          <Spin indicator={<LoadingOutlined style={{ fontSize: 28 }} spin />} />

          <strong>Đang tải thông tin FaithEdu</strong>

          <span>Vui lòng chờ trong giây lát...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="license-page">
      <PageHeroHeader
        title="Gói FaithEdu"
        subtitle="Đăng ký và kích hoạt hệ thống quản lý giáo lý cho giáo xứ"
        icon={<SafetyCertificateOutlined />}
      />

      <div className="license-page-container">
        {/* =====================================================
            STATUS
        ====================================================== */}

        {latestRegistration?.status === "pending" && (
          <Alert
            className="license-status-alert pending"
            type="warning"
            showIcon
            icon={<ClockCircleOutlined />}
            message="Yêu cầu đăng ký đang được xử lý"
            description={
              <span>
                Yêu cầu được gửi lúc{" "}
                <strong>{formatDateTime(latestRegistration.created_at)}</strong>
                . Vui lòng chờ hệ thống xác nhận.
              </span>
            }
            action={
              <AppButton
                icon={<DeleteOutlined />}
                size="small"
                danger
                variant="secondary"
                onClick={() => handleDeletePending(latestRegistration)}
              >
                Xóa yêu cầu
              </AppButton>
            }
          />
        )}

        {latestRegistration?.status === "rejected" && (
          <Alert
            className="license-status-alert rejected"
            type="error"
            showIcon
            message="Yêu cầu đăng ký chưa được chấp nhận"
            description={
              latestRegistration.reject_reason ||
              "Vui lòng kiểm tra lại thông tin và gửi yêu cầu mới."
            }
          />
        )}

        {latestRegistration?.status === "approved" && (
          <Alert
            className="license-status-alert approved"
            type="success"
            showIcon
            message="Đăng ký FaithEdu đã được xác nhận"
            description="Gói FaithEdu của giáo xứ đã được hệ thống ghi nhận."
          />
        )}

        {/* =====================================================
            PACKAGE HERO
        ====================================================== */}

        <section className="license-package-hero">
          <div className="license-package-decoration decoration-one" />
          <div className="license-package-decoration decoration-two" />

          <div className="license-package-left">
            <div className="license-package-badge">
              <SafetyCertificateOutlined />
              GÓI DỊCH VỤ CHO GIÁO XỨ
            </div>

            <h1>{packageInfo.name}</h1>

            <p>
              Nền tảng số hỗ trợ giáo xứ quản lý lớp giáo lý, học viên, điểm
              danh, kết quả học tập và báo cáo tập trung.
            </p>

            <div className="license-package-price-large">
              <strong>{formatMoney(packageInfo.amount)}</strong>

              <span>đ</span>
            </div>

            <div className="license-package-note">
              <CheckCircleFilled />
              Kích hoạt gói dịch vụ cho giáo xứ
            </div>
          </div>

          <div className="license-package-right">
            <div className="license-package-icon-large">
              <ShopOutlined />
            </div>

            <div className="license-package-mini-card">
              <CheckOutlined />
              <span>Quản lý lớp học</span>
            </div>

            <div className="license-package-mini-card">
              <CheckOutlined />
              <span>Quản lý học viên</span>
            </div>

            <div className="license-package-mini-card">
              <CheckOutlined />
              <span>Điểm danh & kết quả</span>
            </div>

            <div className="license-package-mini-card">
              <CheckOutlined />
              <span>Báo cáo giáo lý</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <Row gutter={[24, 24]} className="license-main-grid">
          {/* ===================================================
              LEFT
          ==================================================== */}

          <Col xs={24} lg={14}>
            <Card bordered={false} className="license-form-card">
              <div className="license-card-top">
                <div className="license-section-icon">
                  <UserOutlined />
                </div>

                <div>
                  <span className="license-section-label">
                    ĐĂNG KÝ GÓI DỊCH VỤ
                  </span>

                  <h2>Thông tin đăng ký</h2>

                  <p>Nhập thông tin người phụ trách đăng ký FaithEdu</p>
                </div>
              </div>

              {church?.name && (
                <div className="license-church-info">
                  <div className="license-church-avatar">
                    <ShopOutlined />
                  </div>

                  <div>
                    <span>GIÁO XỨ</span>
                    <strong>{church.name}</strong>
                  </div>
                </div>
              )}

              <Divider />

              <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={handleSubmit}
                disabled={hasPendingRegistration || submitting}
              >
                <Row gutter={16}>
                  <Col xs={24}>
                    <Form.Item
                      label="Họ và tên người đăng ký"
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
                        placeholder="Nhập họ và tên"
                      />
                    </Form.Item>
                  </Col>

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

                {/* TRANSFER CONTENT */}

                <div className="license-transfer-box">
                  <div className="license-transfer-header">
                    <div>
                      <span>NỘI DUNG CHUYỂN KHOẢN</span>

                      <strong>Sử dụng chính xác nội dung này</strong>
                    </div>

                    <Tag color="blue">TỰ ĐỘNG</Tag>
                  </div>

                  <div className="license-transfer-code">
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
                    Nội dung giúp hệ thống đối soát giao dịch nhanh chóng.
                  </small>
                </div>

                {/* UPLOAD */}

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
                        Kéo thả ảnh vào đây hoặc bấm để chọn ảnh
                      </div>

                      <div className="license-upload-hint">
                        JPG, PNG, WEBP · tối đa 5MB
                      </div>
                    </Upload.Dragger>
                  ) : (
                    <div className="license-upload-preview">
                      <div className="license-upload-preview-image">
                        <Image src={paymentPreview} alt="Ảnh chuyển khoản" />
                      </div>

                      <div className="license-upload-preview-content">
                        <div className="license-upload-file">
                          <FileImageOutlined />

                          <div>
                            <strong>{paymentFile.name}</strong>

                            <span>
                              {(paymentFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
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
                    </div>
                  )}
                </Form.Item>

                {/* NOTE */}

                <div className="license-submit-note">
                  <InfoCircleOutlined />

                  <span>
                    Sau khi gửi, yêu cầu sẽ được kiểm tra và xác nhận. Hãy đảm
                    bảo ảnh giao dịch rõ ràng và đầy đủ.
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

          {/* ===================================================
              RIGHT PAYMENT
          ==================================================== */}

          <Col xs={24} lg={10}>
            <Card bordered={false} className="license-payment-card">
              <div className="license-card-top">
                <div className="license-section-icon gold">
                  <WalletOutlined />
                </div>

                <div>
                  <span className="license-section-label">THANH TOÁN</span>

                  <h2>Thông tin chuyển khoản</h2>

                  <p>Quét mã QR hoặc chuyển khoản trực tiếp</p>
                </div>
              </div>

              <Divider />

              {/* QR */}

              <div className="license-payment-qr-wrapper">
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

                <div className="license-scan-label">
                  <QrcodeOutlined />
                  Quét mã QR để thanh toán
                </div>
              </div>

              {/* PRICE */}

              <div className="license-payment-amount">
                <span>Số tiền thanh toán</span>

                <strong>{formatMoney(packageInfo.amount)}đ</strong>
              </div>

              {/* BANK */}

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

              {/* CONTENT */}

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
                message="Sau khi chuyển khoản"
                description="Tải ảnh giao dịch lên biểu mẫu bên trái rồi gửi đăng ký để hoàn tất."
              />
            </Card>
          </Col>
        </Row>

        {/* =====================================================
            SUPPORT
        ====================================================== */}

        <Row gutter={[24, 24]} className="license-support-grid">
          <Col xs={24} md={14}>
            <Card bordered={false} className="license-support-banner">
              <div className="license-support-content">
                <div className="license-support-icon">
                  <CustomerServiceOutlined />
                </div>

                <div>
                  <span>CẦN HỖ TRỢ?</span>

                  <h2>Đồng hành cùng FaithEdu</h2>

                  <p>
                    Tham gia nhóm hỗ trợ để trao đổi, nhận hướng dẫn sử dụng và
                    cập nhật những thông tin mới nhất.
                  </p>
                </div>
              </div>

              {support.zalo_group_url && (
                <AppButton
                  href={support.zalo_group_url}
                  target="_blank"
                  variant="secondary"
                  className="license-support-button"
                >
                  Mở nhóm hỗ trợ
                </AppButton>
              )}
            </Card>
          </Col>

          <Col xs={24} md={10}>
            <Card bordered={false} className="license-zalo-card">
              <div className="license-zalo-content">
                <div>
                  <span>NHÓM ZALO FAITHEDU</span>

                  <h3>Hỗ trợ & cập nhật</h3>

                  <p>Quét mã QR để tham gia nhóm.</p>
                </div>

                <div className="license-zalo-qr-box">
                  {support.zalo_qr_url ? (
                    <Image src={qr_zalo} preview alt="QR nhóm Zalo FaithEdu" />
                  ) : (
                    <QrcodeOutlined />
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* =====================================================
            HISTORY
        ====================================================== */}

        <Card bordered={false} className="license-history-card">
          <div className="license-history-header">
            <div className="license-card-top compact">
              <div className="license-section-icon">
                <ClockCircleOutlined />
              </div>

              <div>
                <span className="license-section-label">THEO DÕI ĐĂNG KÝ</span>

                <h2>Lịch sử đăng ký</h2>

                <p>Các yêu cầu đăng ký FaithEdu của giáo xứ</p>
              </div>
            </div>

            <AppButton
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={loadData}
            >
              Làm mới
            </AppButton>
          </div>

          <Divider />

          {registrations.length === 0 ? (
            <div className="license-history-empty">
              <Empty
                image={
                  <Avatar size={72} icon={<SafetyCertificateOutlined />} />
                }
                description="Chưa có lịch sử đăng ký"
              />
            </div>
          ) : (
            <div className="license-history-list">
              {registrations.map((registration, index) => {
                const status = getStatusConfig(registration.status);

                return (
                  <div
                    className={`license-history-item ${status.className}`}
                    key={registration.id}
                  >
                    <div className="license-history-line">
                      <div className="license-history-dot">{status.icon}</div>

                      {index < registrations.length - 1 && (
                        <div className="license-history-connector" />
                      )}
                    </div>

                    <div className="license-history-main">
                      <div className="license-history-title">
                        <div>
                          <strong>{registration.package_name}</strong>

                          <span>{formatDateTime(registration.created_at)}</span>
                        </div>

                        <Tag color={status.color} icon={status.icon}>
                          {status.label}
                        </Tag>
                      </div>

                      <div className="license-history-meta">
                        <div>
                          <span>Người đăng ký</span>

                          <strong>{registration.name || "--"}</strong>
                        </div>

                        <div>
                          <span>Số tiền</span>

                          <strong>{formatMoney(registration.amount)}đ</strong>
                        </div>
                      </div>

                      {registration.status === "rejected" &&
                        registration.reject_reason && (
                          <div className="license-history-reason">
                            <InfoCircleOutlined />

                            <div>
                              <strong>Lý do từ chối</strong>

                              <span>{registration.reject_reason}</span>
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="license-history-action">
                      {registration.payment_image && (
                        <Image
                          width={58}
                          height={58}
                          src={`${process.env.REACT_APP_API_URL}${registration.payment_image}`}
                          preview
                          className="license-history-image"
                          alt="Ảnh chuyển khoản"
                        />
                      )}

                      {registration.status === "pending" && (
                        <Button
                          size="small"
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

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="license-footer-note">
          <SafetyCertificateOutlined />

          <span>FaithEdu · Số hóa giáo lý - Kết nối đức tin</span>
        </div>
      </div>
    </div>
  );
};

export default LicensePage;
