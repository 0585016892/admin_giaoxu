import React, { useEffect, useState } from "react";

import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Slider,
  Switch,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";

import {
  CheckCircleOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SettingOutlined,
  PictureOutlined,
  FontSizeOutlined,
  AppstoreOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  BORDER_OPTIONS,
  DEFAULT_CERTIFICATE_DESIGN,
  FONT_OPTIONS,
  PAPER_SIZES_MM,
  STYLE_PRESETS,
} from "./certificateDesign";

const { Text } = Typography;

const CertificateSettingsPanel = ({
  open,
  onClose,
  design,
  onChange,
  onReset,
  certData,
  certType,
  parish,
  diocese,
  pastorName,
  issuedDate,
  onIssuedDateChange,
  onCertDataChange,
}) => {
  // ============================================================
  // STATE
  // ============================================================

  const [localDesign, setLocalDesign] = useState({
    ...DEFAULT_CERTIFICATE_DESIGN,
  });

  const [activeTab, setActiveTab] = useState("certificate");

  const [certDataForm, setCertDataForm] = useState({
    certNo: "",
    type: "",
    student: "",
    parish: "",
    diocese: "",
    pastor_name: "",
    achievement: "",
  });

  // ============================================================
  // ĐỒNG BỘ THIẾT KẾ
  // ============================================================

  useEffect(() => {
    setLocalDesign({
      ...DEFAULT_CERTIFICATE_DESIGN,
      ...(design || {}),
    });
  }, [design]);

  // ============================================================
  // ĐỒNG BỘ DỮ LIỆU CHỨNG CHỈ TỪ COMPONENT CHA
  // ============================================================

  useEffect(() => {
    setCertDataForm({
      certNo: certData?.certNo ?? "",
      type: certType ?? "",
      student: certData?.fullName ?? "",
      parish: parish ?? "",
      diocese: diocese ?? "",
      pastor_name: pastorName ?? "",
      achievement: certData?.achievement || "",
    });
  }, [
    certData?.certNo,
    certData?.fullName,
    certData?.achievement,
    certType,
    parish,
    diocese,
    pastorName,
  ]);

  // ============================================================
  // CẬP NHẬT THIẾT KẾ
  // ============================================================

  const update = (field, value) => {
    const next = {
      ...localDesign,
      [field]: value,
    };

    setLocalDesign(next);

    onChange?.(field, value);
  };

  // ============================================================
  // ÁP DỤNG MẪU THIẾT KẾ
  // ============================================================

  const applyPreset = (presetKey) => {
    const preset = STYLE_PRESETS[presetKey];

    if (!preset) return;

    const next = {
      ...localDesign,
      ...preset,
      stylePreset: presetKey,
    };

    setLocalDesign(next);

    Object.entries(next).forEach(([key, value]) => {
      if (key !== "label" && key !== "description") {
        onChange?.(key, value);
      }
    });
  };

  // ============================================================
  // KHÔI PHỤC THIẾT KẾ MẶC ĐỊNH
  // ============================================================

  const reset = () => {
    const next = {
      ...DEFAULT_CERTIFICATE_DESIGN,
    };

    setLocalDesign(next);

    onReset?.();
  };

  // ============================================================
  // CẬP NHẬT THÔNG TIN CHỨNG CHỈ
  // ============================================================

  const handleCertDataChange = (field, value) => {
    const next = {
      ...certDataForm,
      [field]: value,
    };

    setCertDataForm(next);

    onCertDataChange?.({
      certNo: next.certNo,
      fullName: next.student,
      achievement: next.achievement,

      certType: next.type,

      parish: next.parish,
      diocese: next.diocese,

      pastorName: next.pastor_name,
    });
  };

  // ============================================================
  // KHỔ GIẤY HIỆN TẠI
  // ============================================================

  const currentPaper =
    localDesign.paperSize === "CUSTOM"
      ? null
      : PAPER_SIZES_MM[localDesign.paperSize];

  // ============================================================
  // ẨN PANEL
  // ============================================================

  if (!open) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <style>{`
        .certificate-settings-panel {
          margin-top: 12px;
          margin-bottom: 16px;
          border-radius: 12px !important;
          border: 1px solid #E2E8F0 !important;
          box-shadow: 0 4px 18px rgba(23, 59, 94, 0.06);
          overflow: hidden;
        }

        .certificate-settings-panel .ant-card-body {
          padding: 18px;
        }

        .certificate-settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1px solid #E2E8F0;
        }

        .certificate-settings-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .certificate-settings-header-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 8px;
          background: #EEF3F7;
          color: #173B5E;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .certificate-settings-header-title {
          font-size: 14px;
          font-weight: 700;
          color: #173B5E;
        }

        .certificate-settings-header-subtitle {
          font-size: 11px;
          color: #64748B;
          margin-top: 2px;
        }

        .certificate-settings-tabs .ant-tabs-nav {
          margin-bottom: 14px;
        }

        .certificate-settings-tabs .ant-tabs-tab {
          padding: 8px 12px;
          font-size: 12px;
        }

        .certificate-settings-tabs .ant-tabs-tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .certificate-settings-tabs .ant-tabs-ink-bar {
          background: #173B5E;
        }

        .certificate-settings-section {
          background: #F8FAFC;
          border: 1px solid #EDF1F5;
          border-radius: 9px;
          padding: 16px;
          min-height: 260px;
        }

        .certificate-settings-section-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 700;
          color: #173B5E;
          margin-bottom: 14px;
        }

        .certificate-setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-height: 36px;
        }

        .certificate-setting-item + .certificate-setting-item {
          margin-top: 10px;
        }

        .certificate-setting-label {
          font-size: 12px;
          color: #475569;
        }

        .certificate-setting-control {
          flex: 1;
          max-width: 220px;
        }

        .certificate-setting-control .ant-select,
        .certificate-setting-control .ant-input-number {
          width: 100%;
        }

        .certificate-color-input {
          width: 100%;
          height: 38px;
          padding: 3px;
          cursor: pointer;
          border: 1px solid #D9E1EA;
          border-radius: 6px;
        }

        .certificate-background-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .certificate-background-card {
          position: relative;
          cursor: pointer;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 9px;
          overflow: hidden;
          transition: border-color 0.2s ease,
                      box-shadow 0.2s ease,
                      transform 0.2s ease;
        }

        .certificate-background-card:hover {
          border-color: #9DB3C8;
          box-shadow: 0 4px 12px rgba(23, 59, 94, 0.10);
          transform: translateY(-1px);
        }

        .certificate-background-card.selected {
          border: 2px solid #173B5E;
          box-shadow: 0 0 0 2px rgba(23, 59, 94, 0.08);
        }

        .certificate-background-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          background: #F1F5F9;
          overflow: hidden;
        }

        .certificate-background-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.25s ease;
        }

        .certificate-background-card:hover .certificate-background-image {
          transform: scale(1.03);
        }

        .certificate-background-selected {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background: #173B5E;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
        }

        .certificate-background-info {
          padding: 8px 9px;
        }

        .certificate-background-name {
          font-size: 12px;
          font-weight: 700;
          color: #173B5E;
        }

        .certificate-background-description {
          margin-top: 2px;
          font-size: 10px;
          line-height: 1.4;
          color: #64748B;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .certificate-settings-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid #E2E8F0;
        }

        .certificate-settings-footer-right {
          display: flex;
          gap: 8px;
        }

        .certificate-info-note {
          display: block;
          margin-top: 8px;
          font-size: 11px;
          color: #64748B;
        }

        @media (max-width: 1000px) {
          .certificate-background-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .certificate-settings-header {
            align-items: flex-start;
          }

          .certificate-settings-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .certificate-settings-footer-right {
            flex-direction: column;
          }

          .certificate-settings-footer .ant-btn {
            width: 100%;
          }

          .certificate-background-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .certificate-settings-tabs .ant-tabs-tab {
            padding: 8px 7px;
          }
        }

        @media (max-width: 480px) {
          .certificate-background-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Card className="certificate-settings-panel" bordered={false}>
        {/* HEADER */}

        <div className="certificate-settings-header">
          <div className="certificate-settings-header-left">
            <div className="certificate-settings-header-icon">
              <SettingOutlined />
            </div>

            <div>
              <div className="certificate-settings-header-title">
                Cấu hình thiết kế & in chứng chỉ
              </div>

              <div className="certificate-settings-header-subtitle">
                Chỉnh sửa thông tin và tùy chỉnh thiết kế chứng chỉ
              </div>
            </div>
          </div>

          <Button size="small" icon={<CheckCircleOutlined />} onClick={onClose}>
            Hoàn tất
          </Button>
        </div>

        {/* TABS */}

        <Tabs
          className="certificate-settings-tabs"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            // ==================================================
            // TAB 1 - THÔNG TIN CHỨNG CHỈ
            // ==================================================

            {
              key: "certificate",
              label: (
                <>
                  <IdcardOutlined />
                  Thông tin chứng chỉ
                </>
              ),

              children: (
                <div className="certificate-settings-section">
                  <div className="certificate-settings-section-title">
                    <IdcardOutlined />
                    Chỉnh sửa thông tin chứng chỉ
                  </div>

                  <Text type="secondary">
                    Các thông tin dưới đây được gửi về component cha khi bạn
                    chỉnh sửa.
                  </Text>

                  <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
                    <Col xs={24} md={12}>
                      <Text strong>Số chứng chỉ</Text>

                      <Input
                        value={certDataForm.certNo}
                        placeholder="Nhập số chứng chỉ"
                        onChange={(event) =>
                          handleCertDataChange("certNo", event.target.value)
                        }
                        style={{ marginTop: 8 }}
                      />
                    </Col>

                    <Col xs={24} md={12}>
                      <Text strong>Loại chứng chỉ</Text>

                      <Input
                        value={certDataForm.type}
                        placeholder="Nhập loại chứng chỉ"
                        onChange={(event) =>
                          handleCertDataChange("type", event.target.value)
                        }
                        style={{ marginTop: 8 }}
                      />
                    </Col>

                    <Col span={24}>
                      <Text strong>Họ và tên học viên</Text>

                      <Input
                        value={certDataForm.student}
                        placeholder="Nhập họ và tên học viên"
                        onChange={(event) =>
                          handleCertDataChange("student", event.target.value)
                        }
                        style={{ marginTop: 8 }}
                      />
                    </Col>

                    <Col xs={24} md={12}>
                      <Text strong>Giáo xứ</Text>

                      <Input
                        value={certDataForm.parish}
                        placeholder="Nhập tên giáo xứ"
                        onChange={(event) =>
                          handleCertDataChange("parish", event.target.value)
                        }
                        style={{ marginTop: 8 }}
                      />
                    </Col>

                    <Col xs={24} md={12}>
                      <Text strong>Giáo phận</Text>

                      <Input
                        value={certDataForm.diocese}
                        placeholder="Nhập tên giáo phận"
                        onChange={(event) =>
                          handleCertDataChange("diocese", event.target.value)
                        }
                        style={{ marginTop: 8 }}
                      />
                    </Col>

                    <Col span={24}>
                      <Text strong>Tên linh mục quản xứ</Text>

                      <Input
                        value={certDataForm.pastor_name}
                        placeholder="Nhập tên linh mục quản xứ"
                        onChange={(event) =>
                          handleCertDataChange(
                            "pastor_name",
                            event.target.value,
                          )
                        }
                        style={{ marginTop: 8 }}
                      />
                    </Col>
                    <Card
                      bordered={false}
                      style={{
                        marginBottom: 16,
                        border: "1px solid #E2E8F0",
                        borderRadius: 10,
                      }}
                    >
                      <Typography.Text
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#64748B",
                          letterSpacing: 0.8,
                          marginBottom: 8,
                        }}
                      >
                        NGÀY CẤP CHỨNG CHỈ
                      </Typography.Text>

                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        value={
                          issuedDate ? dayjs(issuedDate, "DD/MM/YYYY") : null
                        }
                        onChange={(date) => {
                          const value = date ? date.format("DD/MM/YYYY") : "";

                          onIssuedDateChange?.(value);
                        }}
                        placeholder="Chọn ngày cấp chứng chỉ"
                        allowClear
                      />

                      <Typography.Text
                        type="secondary"
                        style={{
                          display: "block",
                          marginTop: 6,
                          fontSize: 12,
                        }}
                      >
                        Ngày này sẽ được hiển thị trên chứng chỉ.
                      </Typography.Text>
                    </Card>
                    <Col span={24}>
                      <Typography.Text strong>Thành tích</Typography.Text>

                      <Select
                        style={{ width: "100%", marginTop: 6 }}
                        placeholder="Chọn mẫu thành tích hoặc tự nhập"
                        value={
                          [
                            "Đạt thành tích xuất sắc trong học tập Giáo lý",
                            "Đạt thành tích tốt trong học tập Giáo lý",
                            "Có nhiều tiến bộ trong học tập và sinh hoạt",
                            "Chuyên cần, tích cực trong học tập và sinh hoạt",
                            "Có tinh thần nhiệt tình, tích cực trong các hoạt động",
                            "Hoàn thành tốt chương trình Giáo lý năm học",
                            "Hoàn thành xuất sắc chương trình Giáo lý năm học",
                            "Có nhiều đóng góp tích cực cho lớp Giáo lý",
                          ].includes(certDataForm.achievement)
                            ? certDataForm.achievement
                            : undefined
                        }
                        options={[
                          {
                            value:
                              "Đạt thành tích xuất sắc trong học tập Giáo lý",
                            label:
                              "Đạt thành tích xuất sắc trong học tập Giáo lý",
                          },
                          {
                            value: "Đạt thành tích tốt trong học tập Giáo lý",
                            label: "Đạt thành tích tốt trong học tập Giáo lý",
                          },
                          {
                            value:
                              "Có nhiều tiến bộ trong học tập và sinh hoạt",
                            label:
                              "Có nhiều tiến bộ trong học tập và sinh hoạt",
                          },
                          {
                            value:
                              "Chuyên cần, tích cực trong học tập và sinh hoạt",
                            label:
                              "Chuyên cần, tích cực trong học tập và sinh hoạt",
                          },
                          {
                            value:
                              "Có tinh thần nhiệt tình, tích cực trong các hoạt động",
                            label:
                              "Có tinh thần nhiệt tình, tích cực trong các hoạt động",
                          },
                          {
                            value:
                              "Hoàn thành tốt chương trình Giáo lý năm học",
                            label:
                              "Hoàn thành tốt chương trình Giáo lý năm học",
                          },
                          {
                            value:
                              "Hoàn thành xuất sắc chương trình Giáo lý năm học",
                            label:
                              "Hoàn thành xuất sắc chương trình Giáo lý năm học",
                          },
                          {
                            value: "Có nhiều đóng góp tích cực cho lớp Giáo lý",
                            label: "Có nhiều đóng góp tích cực cho lớp Giáo lý",
                          },
                        ]}
                        onChange={(value) =>
                          handleCertDataChange("achievement", value)
                        }
                        allowClear
                      />

                      <Input
                        style={{ marginTop: 8 }}
                        value={certDataForm.achievement}
                        placeholder="Hoặc nhập thành tích riêng..."
                        onChange={(e) =>
                          handleCertDataChange("achievement", e.target.value)
                        }
                      />
                    </Col>
                  </Row>

                  <Divider />

                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      setActiveTab("paper");
                      message.success("Thông tin đã được cập nhật");
                    }}
                  >
                    Hoàn tất chỉnh sửa
                  </Button>
                </div>
              ),
            },

            // ==================================================
            // TAB 2 - KHỔ GIẤY
            // ==================================================

            {
              key: "paper",
              label: (
                <>
                  <PrinterOutlined />
                  Khổ giấy
                </>
              ),

              children: (
                <div className="certificate-settings-section">
                  <div className="certificate-settings-section-title">
                    <PrinterOutlined />
                    Khổ giấy & kích thước in
                  </div>

                  <div className="certificate-setting-item">
                    <Text className="certificate-setting-label">Khổ giấy</Text>

                    <div className="certificate-setting-control">
                      <Select
                        size="small"
                        value={localDesign.paperSize}
                        onChange={(value) => update("paperSize", value)}
                        options={[
                          ...Object.entries(PAPER_SIZES_MM).map(
                            ([key, item]) => ({
                              value: key,
                              label:
                                `${item.label} — ` +
                                `${item.width} × ${item.height} mm`,
                            }),
                          ),
                          {
                            value: "CUSTOM",
                            label: "Tùy chỉnh",
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="certificate-setting-item">
                    <Text className="certificate-setting-label">
                      Hướng giấy
                    </Text>

                    <Radio.Group
                      size="small"
                      value={localDesign.orientation}
                      onChange={(event) =>
                        update("orientation", event.target.value)
                      }
                      optionType="button"
                      buttonStyle="solid"
                      options={[
                        {
                          label: "Ngang",
                          value: "landscape",
                        },
                        {
                          label: "Dọc",
                          value: "portrait",
                        },
                      ]}
                    />
                  </div>

                  <div className="certificate-setting-item">
                    <Text className="certificate-setting-label">
                      Kích thước
                    </Text>

                    <div>
                      {currentPaper ? (
                        <Tag color="blue">
                          {currentPaper.width} × {currentPaper.height} mm
                        </Tag>
                      ) : (
                        <Tag color="gold">Kích thước tùy chỉnh</Tag>
                      )}
                    </div>
                  </div>

                  {localDesign.paperSize === "CUSTOM" && (
                    <>
                      <div className="certificate-setting-item">
                        <Text className="certificate-setting-label">
                          Chiều rộng
                        </Text>

                        <InputNumber
                          size="small"
                          min={80}
                          max={1000}
                          addonAfter="mm"
                          value={localDesign.customWidth}
                          onChange={(value) => update("customWidth", value)}
                        />
                      </div>

                      <div className="certificate-setting-item">
                        <Text className="certificate-setting-label">
                          Chiều cao
                        </Text>

                        <InputNumber
                          size="small"
                          min={80}
                          max={1000}
                          addonAfter="mm"
                          value={localDesign.customHeight}
                          onChange={(value) => update("customHeight", value)}
                        />
                      </div>
                    </>
                  )}

                  <div className="certificate-setting-item">
                    <Text className="certificate-setting-label">
                      Khoảng cách mép
                    </Text>

                    <InputNumber
                      size="small"
                      min={0}
                      max={40}
                      addonAfter="mm"
                      value={localDesign.padding}
                      onChange={(value) => update("padding", value)}
                    />
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <Text strong>Độ rộng vùng nội dung</Text>

                    <Slider
                      min={60}
                      max={98}
                      value={localDesign.contentWidth}
                      onChange={(value) => update("contentWidth", value)}
                      tooltip={{
                        formatter: (value) => `${value}%`,
                      }}
                    />
                  </div>
                </div>
              ),
            },

            // ==================================================
            // TAB 3 - BACKGROUND
            // ==================================================

            {
              key: "background",
              label: (
                <>
                  <PictureOutlined />
                  Background
                </>
              ),

              children: (
                <div className="certificate-settings-section">
                  <div className="certificate-settings-section-title">
                    <PictureOutlined />
                    Mẫu background chứng chỉ
                  </div>

                  <Text strong>Chọn mẫu thiết kế</Text>

                  <div className="certificate-background-grid">
                    {Object.entries(STYLE_PRESETS).map(([key, item]) => {
                      const selected = localDesign.stylePreset === key;

                      return (
                        <div
                          key={key}
                          className={
                            `certificate-background-card ` +
                            (selected ? "selected" : "")
                          }
                          onClick={() => applyPreset(key)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              applyPreset(key);
                            }
                          }}
                        >
                          <div className="certificate-background-image-wrapper">
                            {item.backgroundImage ? (
                              <img
                                src={item.backgroundImage}
                                alt={item.label}
                                className="certificate-background-image"
                              />
                            ) : (
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#94A3B8",
                                  fontSize: 11,
                                }}
                              >
                                Chưa có ảnh
                              </div>
                            )}

                            {selected && (
                              <div className="certificate-background-selected">
                                <CheckCircleOutlined />
                              </div>
                            )}
                          </div>

                          <div className="certificate-background-info">
                            <div className="certificate-background-name">
                              {item.label}
                            </div>

                            <div className="certificate-background-description">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <Tag color="blue">
                      Đang chọn:{" "}
                      {STYLE_PRESETS[localDesign.stylePreset]?.label ||
                        "Tùy chỉnh"}
                    </Tag>
                  </div>

                  <Divider style={{ margin: "16px 0" }} />

                  <Text strong>Màu sắc</Text>

                  <Row gutter={[10, 10]} style={{ marginTop: 10 }}>
                    <Col span={8}>
                      <Text strong>Màu chính</Text>

                      <Input
                        type="color"
                        className="certificate-color-input"
                        value={localDesign.primaryColor}
                        onChange={(event) =>
                          update("primaryColor", event.target.value)
                        }
                      />
                    </Col>

                    <Col span={8}>
                      <Text strong>Màu nhấn</Text>

                      <Input
                        type="color"
                        className="certificate-color-input"
                        value={localDesign.secondaryColor}
                        onChange={(event) =>
                          update("secondaryColor", event.target.value)
                        }
                      />
                    </Col>

                    <Col span={8}>
                      <Text strong>Màu chữ</Text>

                      <Input
                        type="color"
                        className="certificate-color-input"
                        value={localDesign.textColor}
                        onChange={(event) =>
                          update("textColor", event.target.value)
                        }
                      />
                    </Col>
                  </Row>

                  <Divider style={{ margin: "16px 0" }} />

                  <div className="certificate-setting-item">
                    <Text className="certificate-setting-label">Kiểu viền</Text>

                    <Select
                      size="small"
                      className="certificate-setting-control"
                      value={localDesign.borderStyle}
                      onChange={(value) => update("borderStyle", value)}
                      options={BORDER_OPTIONS}
                    />
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <Text strong>Độ dày viền</Text>

                    <Slider
                      min={0}
                      max={8}
                      value={localDesign.borderWidth}
                      onChange={(value) => update("borderWidth", value)}
                    />
                  </div>

                  <div>
                    <Text strong>Bo góc</Text>

                    <Slider
                      min={0}
                      max={30}
                      value={localDesign.borderRadius}
                      onChange={(value) => update("borderRadius", value)}
                    />
                  </div>
                </div>
              ),
            },

            // ==================================================
            // TAB 4 - TYPOGRAPHY
            // ==================================================

            {
              key: "typography",
              label: (
                <>
                  <FontSizeOutlined />
                  Kiểu chữ
                </>
              ),

              children: (
                <div className="certificate-settings-section">
                  <div className="certificate-settings-section-title">
                    <FontSizeOutlined />
                    Kiểu chữ & typography
                  </div>

                  <Text strong>Font nội dung</Text>

                  <Select
                    size="small"
                    style={{
                      width: "100%",
                      marginTop: 8,
                    }}
                    value={localDesign.fontFamily}
                    onChange={(value) => update("fontFamily", value)}
                    options={FONT_OPTIONS}
                  />

                  <div style={{ marginTop: 16 }}>
                    <Text strong>Font tiêu đề</Text>

                    <Select
                      size="small"
                      style={{
                        width: "100%",
                        marginTop: 8,
                      }}
                      value={localDesign.headingFontFamily}
                      onChange={(value) => update("headingFontFamily", value)}
                      options={FONT_OPTIONS}
                    />
                  </div>

                  <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
                    <Col xs={24} md={12}>
                      <Text strong>Cỡ tiêu đề</Text>

                      <InputNumber
                        size="small"
                        min={14}
                        max={60}
                        addonAfter="px"
                        value={localDesign.titleFontSize}
                        onChange={(value) => update("titleFontSize", value)}
                        style={{
                          width: "100%",
                          marginTop: 8,
                        }}
                      />
                    </Col>

                    <Col xs={24} md={12}>
                      <Text strong>Cỡ tên</Text>

                      <InputNumber
                        size="small"
                        min={14}
                        max={60}
                        addonAfter="px"
                        value={localDesign.nameFontSize}
                        onChange={(value) => update("nameFontSize", value)}
                        style={{
                          width: "100%",
                          marginTop: 8,
                        }}
                      />
                    </Col>

                    <Col xs={24} md={12}>
                      <Text strong>Cỡ nội dung</Text>

                      <InputNumber
                        size="small"
                        min={9}
                        max={30}
                        addonAfter="px"
                        value={localDesign.bodyFontSize}
                        onChange={(value) => update("bodyFontSize", value)}
                        style={{
                          width: "100%",
                          marginTop: 8,
                        }}
                      />
                    </Col>

                    <Col xs={24} md={12}>
                      <Text strong>Cỡ phụ đề</Text>

                      <InputNumber
                        size="small"
                        min={9}
                        max={30}
                        addonAfter="px"
                        value={localDesign.subtitleFontSize}
                        onChange={(value) => update("subtitleFontSize", value)}
                        style={{
                          width: "100%",
                          marginTop: 8,
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },

            // ==================================================
            // TAB 5 - THÀNH PHẦN
            // ==================================================

            {
              key: "elements",
              label: (
                <>
                  <AppstoreOutlined />
                  Thành phần
                </>
              ),

              children: (
                <div className="certificate-settings-section">
                  <div className="certificate-settings-section-title">
                    <AppstoreOutlined />
                    Thành phần hiển thị
                  </div>

                  <div className="certificate-setting-item">
                    <div>
                      <Text strong>Hoa văn</Text>

                      <div style={{ fontSize: 11, color: "#64748B" }}>
                        Hiển thị họa tiết trang trí
                      </div>
                    </div>

                    <Switch
                      size="small"
                      checked={localDesign.ornament}
                      onChange={(value) => update("ornament", value)}
                    />
                  </div>

                  <div className="certificate-setting-item">
                    <div>
                      <Text strong>Watermark</Text>

                      <div style={{ fontSize: 11, color: "#64748B" }}>
                        Hiển thị dấu chìm trên nền
                      </div>
                    </div>

                    <Switch
                      size="small"
                      checked={localDesign.watermark}
                      onChange={(value) => update("watermark", value)}
                    />
                  </div>

                  <div className="certificate-setting-item">
                    <div>
                      <Text strong>Đổ bóng</Text>

                      <div style={{ fontSize: 11, color: "#64748B" }}>
                        Tạo hiệu ứng chiều sâu
                      </div>
                    </div>

                    <Switch
                      size="small"
                      checked={localDesign.shadow}
                      onChange={(value) => update("shadow", value)}
                    />
                  </div>

                  <Divider />

                  <div className="certificate-setting-item">
                    <div>
                      <Text strong>Chữ ký</Text>

                      <div style={{ fontSize: 11, color: "#64748B" }}>
                        Hiển thị khu vực chữ ký
                      </div>
                    </div>

                    <Switch
                      size="small"
                      checked={localDesign.showSignature}
                      onChange={(value) => update("showSignature", value)}
                    />
                  </div>

                  <div className="certificate-setting-item">
                    <div>
                      <Text strong>QR xác thực</Text>

                      <div style={{ fontSize: 11, color: "#64748B" }}>
                        Hiển thị mã QR xác thực chứng chỉ
                      </div>
                    </div>

                    <Switch
                      size="small"
                      checked={localDesign.showQRCode}
                      onChange={(value) => update("showQRCode", value)}
                    />
                  </div>

                  {localDesign.showQRCode && (
                    <div style={{ marginTop: 16 }}>
                      <Text strong>Kích thước QR</Text>

                      <InputNumber
                        size="small"
                        min={40}
                        max={150}
                        addonAfter="px"
                        value={localDesign.qrSize}
                        onChange={(value) => update("qrSize", value)}
                        style={{
                          width: "100%",
                          marginTop: 8,
                        }}
                      />
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />

        {/* FOOTER */}

        <div className="certificate-settings-footer">
          <Button icon={<ReloadOutlined />} onClick={reset}>
            Khôi phục mặc định
          </Button>

          <div className="certificate-settings-footer-right">
            <Button onClick={onClose}>Hủy</Button>

            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={onClose}
            >
              Hoàn tất
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default CertificateSettingsPanel;
