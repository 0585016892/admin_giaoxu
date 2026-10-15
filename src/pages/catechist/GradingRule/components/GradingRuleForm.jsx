import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";

import { Card, Col, Form, InputNumber, Row, Select } from "antd";

import { CalculatorOutlined, InfoCircleOutlined } from "@ant-design/icons";

import {
  CALCULATION_TYPES,
  CALCULATION_LABELS,
  CALCULATION_DESCRIPTIONS,
} from "../../../../utils/gradingRuleUtils";

const calculationOptions = Object.values(CALCULATION_TYPES).map((value) => ({
  value,
  label: CALCULATION_LABELS[value],
}));

const GradingRuleForm = forwardRef(({ rule, saving = false, onSave }, ref) => {
  const [form] = Form.useForm();

  const calculationType = Form.useWatch("calculation_type", form);

  useEffect(() => {
    form.setFieldsValue({
      calculation_type:
        rule?.calculation_type ?? CALCULATION_TYPES.WEIGHTED_AVERAGE,
      multiplier: rule?.multiplier ?? 1,
      divisor: rule?.divisor ?? null,
      rounding_digits: rule?.rounding_digits ?? 1,
      pass_score: rule?.pass_score ?? 5,
      status: rule?.status !== "inactive",
    });
  }, [rule, form]);

  useImperativeHandle(
    ref,
    () => ({
      submit: () => form.submit(),
      validate: () => form.validateFields(),
      getValues: () => form.getFieldsValue(true),
      reset: () => form.resetFields(),
    }),
    [form],
  );

  const description = useMemo(
    () => CALCULATION_DESCRIPTIONS[calculationType] || "",
    [calculationType],
  );

  const handleFinish = (values) => {
    onSave({
      ...values,
      status: values.status ? "active" : "inactive",
    });
  };

  return (
    <Card
      size="small"
      className="grading-rule-form-card"
      style={{
        borderRadius: 12,
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 8px rgba(16, 42, 67, 0.04)",
      }}
      styles={{
        body: {
          padding: "14px 16px 4px",
        },
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9,
            background: "#EEF3F7",
            color: "#173B5E",
            fontSize: 16,
          }}
        >
          <CalculatorOutlined />
        </div>

        <div>
          <div
            style={{
              color: "#173B5E",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Cấu hình công thức
          </div>

          <div
            style={{
              color: "#64748B",
              fontSize: 11,
              marginTop: 2,
            }}
          >
            Thiết lập phương pháp và tham số tính điểm
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        className="grading-rule-form"
      >
        {/* PHƯƠNG PHÁP TÍNH */}
        <Row gutter={[12, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="calculation_type"
              label="Phương pháp tính"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn phương pháp tính.",
                },
              ]}
            >
              <Select
                options={calculationOptions}
                size="middle"
                disabled={saving}
                showSearch
                optionFilterProp="label"
                placeholder="Chọn phương pháp"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* MÔ TẢ */}
        {description && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 7,
              marginBottom: 12,
              padding: "7px 10px",
              borderRadius: 8,
              background: "#F4F7FA",
              color: "#64748B",
              fontSize: 11,
              lineHeight: 1.6,
            }}
          >
            <InfoCircleOutlined
              style={{
                marginTop: 3,
                color: "#173B5E",
                flexShrink: 0,
              }}
            />
            <span>{description}</span>
          </div>
        )}

        {/* TẤT CẢ Ô THAM SỐ TRÊN CÙNG MỘT HÀNG */}
        <Row gutter={[12, 0]} align="top">
          {calculationType === CALCULATION_TYPES.SUM_MULTIPLIER && (
            <>
              <Col xs={12} sm={6} lg={4}>
                <Form.Item
                  name="multiplier"
                  label="Hệ số nhân"
                  rules={[
                    {
                      required: true,
                      message: "Nhập hệ số nhân.",
                    },
                    {
                      type: "number",
                      min: 0,
                      message: "Hệ số phải ≥ 0.",
                    },
                  ]}
                >
                  <InputNumber
                    size="middle"
                    min={0}
                    step={0.1}
                    precision={4}
                    style={{ width: "100%" }}
                    disabled={saving}
                  />
                </Form.Item>
              </Col>

              <Col xs={12} sm={6} lg={4}>
                <Form.Item name="divisor" label="Mẫu số">
                  <InputNumber
                    size="middle"
                    min={0.0001}
                    step={1}
                    precision={4}
                    style={{ width: "100%" }}
                    disabled={saving}
                    placeholder="Không bắt buộc"
                  />
                </Form.Item>
              </Col>
            </>
          )}

          <Col xs={12} sm={6} lg={4}>
            <Form.Item
              name="pass_score"
              label="Điểm đạt"
              rules={[
                {
                  required: true,
                  message: "Nhập điểm đạt.",
                },
                {
                  type: "number",
                  min: 0,
                  message: "Điểm đạt không hợp lệ.",
                },
              ]}
            >
              <InputNumber
                size="middle"
                min={0}
                max={100}
                step={0.1}
                precision={2}
                style={{ width: "100%" }}
                disabled={saving}
              />
            </Form.Item>
          </Col>

          <Col xs={12} sm={6} lg={4}>
            <Form.Item
              name="rounding_digits"
              label="Làm tròn"
              rules={[
                {
                  required: true,
                  message: "Chọn số chữ số làm tròn.",
                },
              ]}
            >
              <Select
                size="middle"
                disabled={saving}
                options={[
                  { value: 0, label: "0 chữ số" },
                  { value: 1, label: "1 chữ số" },
                  { value: 2, label: "2 chữ số" },
                  { value: 3, label: "3 chữ số" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <button type="submit" style={{ display: "none" }} aria-hidden="true" />
      </Form>

      <style>{`
      .grading-rule-form-card .ant-form-item {
        margin-bottom: 12px;
      }

      .grading-rule-form-card .ant-form-item-label {
        padding-bottom: 4px;
      }

      .grading-rule-form-card .ant-form-item-label > label {
        height: auto;
        color: #475569;
        font-size: 12px;
        font-weight: 600;
      }

      .grading-rule-form-card .ant-form-item-explain,
      .grading-rule-form-card .ant-form-item-extra {
        font-size: 10px;
      }

      .grading-rule-form-card .ant-select-selector,
      .grading-rule-form-card .ant-input-number {
        border-radius: 8px !important;
      }

      @media (max-width: 575px) {
        .grading-rule-form-card .ant-card-body {
          padding: 12px !important;
        }
      }
    `}</style>
    </Card>
  );
});

GradingRuleForm.displayName = "GradingRuleForm";

export default GradingRuleForm;
