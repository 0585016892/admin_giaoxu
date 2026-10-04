import React, { useEffect } from "react";
import {
  Alert,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Spin,
  Switch,
  TimePicker,
  Typography,
  message,
} from "antd";

import {
  BookOutlined,
  CheckCircleOutlined,
  PictureOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import AppButton from "../../../components/common/AppButton";
import { useChurchSettings } from "../../../context/ChurchSettingsContext";

import "./ChurchSettingPage.css";

const { Title, Text } = Typography;

export default function ChurchSettingPage() {
  const [form] = Form.useForm();

  const { settings, loading, saving, saveSettings } = useChurchSettings();

  // ============================================================
  // SET FORM DATA
  // ============================================================

  useEffect(() => {
    if (!settings) return;

    form.setFieldsValue({
      logo: settings.logo || "",
      cover_image: settings.cover_image || "",
      slogan: settings.slogan || "",

      catechism_enabled: Boolean(settings.catechism_enabled),
      catechism_attendance_enabled: Boolean(
        settings.catechism_attendance_enabled,
      ),
      catechism_start_time: settings.catechism_start_time
        ? dayjs(settings.catechism_start_time, "HH:mm:ss")
        : null,
      catechism_end_time: settings.catechism_end_time
        ? dayjs(settings.catechism_end_time, "HH:mm:ss")
        : null,
      allow_late: Boolean(settings.allow_late),
      late_minutes: Number(settings.late_minutes ?? 15),
      auto_absent: Boolean(settings.auto_absent),

      attendance_enabled: Boolean(settings.attendance_enabled),
      attendance_qr_enabled: Boolean(settings.attendance_qr_enabled),
      attendance_manual_enabled: Boolean(settings.attendance_manual_enabled),
      attendance_edit_enabled: Boolean(settings.attendance_edit_enabled),
      attendance_duration_minutes: Number(
        settings.attendance_duration_minutes ?? 120,
      ),
      attendance_auto_lock: Boolean(settings.attendance_auto_lock),
      attendance_auto_absent: Boolean(settings.attendance_auto_absent),
      attendance_late_enabled: Boolean(settings.attendance_late_enabled),
    });
  }, [settings, form]);

  // ============================================================
  // SAVE SETTINGS
  // ============================================================

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        // THÔNG TIN GIÁO XỨ
        logo: values.logo?.trim() || null,
        cover_image: values.cover_image?.trim() || null,
        slogan: values.slogan?.trim() || null,

        // GIÁO LÝ
        catechism_enabled: Boolean(values.catechism_enabled),
        catechism_attendance_enabled: Boolean(
          values.catechism_attendance_enabled,
        ),
        catechism_start_time: values.catechism_start_time
          ? values.catechism_start_time.format("HH:mm:ss")
          : null,
        catechism_end_time: values.catechism_end_time
          ? values.catechism_end_time.format("HH:mm:ss")
          : null,
        allow_late: Boolean(values.allow_late),
        late_minutes: Number(values.late_minutes ?? 0),
        auto_absent: Boolean(values.auto_absent),

        // ĐIỂM DANH
        attendance_enabled: Boolean(values.attendance_enabled),
        attendance_qr_enabled: Boolean(values.attendance_qr_enabled),
        attendance_manual_enabled: Boolean(values.attendance_manual_enabled),
        attendance_edit_enabled: Boolean(values.attendance_edit_enabled),
        attendance_duration_minutes: Number(
          values.attendance_duration_minutes ?? 120,
        ),
        attendance_auto_lock: Boolean(values.attendance_auto_lock),
        attendance_auto_absent: Boolean(values.attendance_auto_absent),
        attendance_late_enabled: Boolean(values.attendance_late_enabled),
      };

      await saveSettings(payload);

      message.success("Đã lưu cấu hình giáo xứ thành công");
    } catch (error) {
      if (error?.errorFields) {
        message.warning("Vui lòng kiểm tra lại thông tin cấu hình");
        return;
      }

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu cấu hình giáo xứ",
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading && !settings) {
    return (
      <div className="church-setting-loading">
        <Spin size="large" />
        <Text>Đang tải cấu hình giáo xứ...</Text>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="church-setting-page">
      {/* HEADER */}
      <div className="church-setting-header">
        <div className="church-setting-title-row">
          <div className="church-setting-title-icon">
            <SettingOutlined />
          </div>

          <div>
            <Title level={3} className="church-setting-title">
              Cài đặt giáo xứ
            </Title>

            <Text className="church-setting-subtitle">
              Cấu hình thông tin và hệ thống điểm danh của giáo xứ
            </Text>
          </div>
        </div>

        <AppButton
          type="primary"
          size="small"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
        >
          Lưu cấu hình
        </AppButton>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          catechism_enabled: true,
          catechism_attendance_enabled: true,
          catechism_start_time: null,
          catechism_end_time: null,
          allow_late: true,
          late_minutes: 15,
          auto_absent: false,

          attendance_enabled: true,
          attendance_qr_enabled: true,
          attendance_manual_enabled: true,
          attendance_edit_enabled: true,
          attendance_duration_minutes: 120,
          attendance_auto_lock: true,
          attendance_auto_absent: false,
          attendance_late_enabled: true,
        }}
      >
        <Row gutter={[14, 14]}>
          {/* ==================================================
              THÔNG TIN GIÁO XỨ
          ================================================== */}

          <Col xs={24}>
            <Card className="church-setting-card">
              <div className="setting-section-header">
                <div className="setting-section-icon">
                  <PictureOutlined />
                </div>

                <div>
                  <Title level={4}>Thông tin giáo xứ</Title>
                  <Text type="secondary">Thông tin hiển thị trên hệ thống</Text>
                </div>
              </div>

              <Divider />

              <Row gutter={[14, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="logo" label="Logo giáo xứ">
                    <Input
                      size="small"
                      placeholder="Nhập đường dẫn logo"
                      allowClear
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="cover_image" label="Ảnh bìa">
                    <Input
                      size="small"
                      placeholder="Nhập đường dẫn ảnh bìa"
                      allowClear
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="slogan" label="Khẩu hiệu / Slogan">
                    <Input
                      size="small"
                      placeholder="Nhập khẩu hiệu của giáo xứ"
                      maxLength={255}
                      showCount
                      allowClear
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* ==================================================
              CẤU HÌNH GIÁO LÝ
          ================================================== */}

          <Col xs={24} lg={12}>
            <Card className="church-setting-card setting-card-height">
              <div className="setting-section-header">
                <div className="setting-section-icon">
                  <BookOutlined />
                </div>

                <div>
                  <Title level={4}>Cấu hình giáo lý</Title>
                  <Text type="secondary">
                    Thiết lập giờ học và điểm danh giáo lý
                  </Text>
                </div>
              </div>

              <Divider />

              {/* CÁC CÔNG TẮC - 2 CỘT */}
              <div className="setting-switch-grid">
                <Form.Item
                  name="catechism_enabled"
                  label="Bật quản lý giáo lý"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>

                <Form.Item
                  name="catechism_attendance_enabled"
                  label="Điểm danh giáo lý"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>

                <Form.Item
                  name="allow_late"
                  label="Cho phép điểm danh trễ"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>

                <Form.Item
                  name="auto_absent"
                  label="Tự động tính vắng"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>
              </div>

              <Divider className="setting-inner-divider" />

              {/* THỜI GIAN */}
              <div className="setting-subtitle">Thời gian học giáo lý</div>

              <Row gutter={12}>
                <Col xs={12}>
                  <Form.Item name="catechism_start_time" label="Giờ bắt đầu">
                    <TimePicker
                      size="small"
                      format="HH:mm"
                      style={{ width: "100%" }}
                      placeholder="Giờ bắt đầu"
                    />
                  </Form.Item>
                </Col>

                <Col xs={12}>
                  <Form.Item name="catechism_end_time" label="Giờ kết thúc">
                    <TimePicker
                      size="small"
                      format="HH:mm"
                      style={{ width: "100%" }}
                      placeholder="Giờ kết thúc"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="late_minutes" label="Số phút tính là trễ">
                    <InputNumber
                      size="small"
                      min={0}
                      max={1440}
                      addonAfter="phút"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* ==================================================
              CẤU HÌNH ĐIỂM DANH
          ================================================== */}

          <Col xs={24} lg={12}>
            <Card className="church-setting-card setting-card-height">
              <div className="setting-section-header">
                <div className="setting-section-icon">
                  <CheckCircleOutlined />
                </div>

                <div>
                  <Title level={4}>Cấu hình điểm danh</Title>
                  <Text type="secondary">
                    Thiết lập cách thức và thời gian điểm danh
                  </Text>
                </div>
              </div>

              <Divider />

              {/* CÁC CÔNG TẮC - 2 CỘT */}
              <div className="setting-switch-grid">
                <Form.Item
                  name="attendance_enabled"
                  label="Cho phép điểm danh"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>

                <Form.Item
                  name="attendance_qr_enabled"
                  label="Điểm danh bằng QR"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>

                <Form.Item
                  name="attendance_manual_enabled"
                  label="Điểm danh thủ công"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>

                <Form.Item
                  name="attendance_edit_enabled"
                  label="Cho phép sửa điểm danh"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>

                <Form.Item
                  name="attendance_auto_lock"
                  label="Tự động khóa điểm danh"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>

                <Form.Item
                  name="attendance_auto_absent"
                  label="Chưa điểm danh thành vắng"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>

                <Form.Item
                  name="attendance_late_enabled"
                  label='Cho phép trạng thái "Trễ"'
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>
              </div>

              <Divider className="setting-inner-divider" />

              <Form.Item
                name="attendance_duration_minutes"
                label="Thời gian cho phép điểm danh"
              >
                <InputNumber
                  size="small"
                  min={1}
                  max={1440}
                  addonAfter="phút"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Card>
          </Col>

          {/* ==================================================
              NOTICE
          ================================================== */}

          <Col xs={24}>
            <Alert
              showIcon
              type="info"
              message="Lưu ý"
              description="Các thay đổi cấu hình sẽ được áp dụng cho giáo xứ hiện tại."
            />
          </Col>
        </Row>
      </Form>
    </div>
  );
}
