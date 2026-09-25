import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";

import { Card, Col, Form, InputNumber, Row, Select, Switch } from "antd";

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

      status: rule?.status === "inactive" ? false : true,
    });
  }, [rule, form]);

  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        form.submit();
      },

      validate: () => form.validateFields(),

      getValues: () => form.getFieldsValue(true),

      reset: () => {
        form.resetFields();
      },
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
    <Card className="grading-rule-form-card" bordered={false}>
      <div className="grading-rule-section-header">
        <div className="grading-rule-section-icon">
          <CalculatorOutlined />
        </div>

        <div>
          <div className="grading-rule-section-title">Cấu hình công thức</div>

          <div className="grading-rule-section-description">
            Chọn phương pháp và các tham số sử dụng khi tính điểm.
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
        <Row gutter={[20, 0]}>
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
                size="large"
                disabled={saving}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Trạng thái" name="status" valuePropName="checked">
              <div className="grading-rule-status-switch">
                <Switch
                  checkedChildren="Đang áp dụng"
                  unCheckedChildren="Tạm ngưng"
                  disabled={saving}
                />
              </div>
            </Form.Item>
          </Col>
        </Row>

        <div className="grading-rule-form-info">
          <InfoCircleOutlined className="grading-rule-form-info-icon" />

          <span className="grading-rule-form-info-text">{description}</span>
        </div>

        <Row gutter={[20, 0]}>
          {calculationType === CALCULATION_TYPES.SUM_MULTIPLIER && (
            <>
              <Col xs={24} md={12}>
                <Form.Item
                  name="multiplier"
                  label="Hệ số nhân"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập hệ số nhân.",
                    },
                    {
                      type: "number",
                      min: 0,
                      message: "Hệ số phải lớn hơn hoặc bằng 0.",
                    },
                  ]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    step={0.1}
                    precision={4}
                    style={{
                      width: "100%",
                    }}
                    disabled={saving}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="divisor"
                  label="Mẫu số"
                  extra="Để trống nếu không cần chia."
                >
                  <InputNumber
                    size="large"
                    min={0.0001}
                    step={1}
                    precision={4}
                    style={{
                      width: "100%",
                    }}
                    disabled={saving}
                    placeholder="Không sử dụng"
                  />
                </Form.Item>
              </Col>
            </>
          )}

          <Col xs={24} md={12}>
            <Form.Item
              name="pass_score"
              label="Điểm đạt"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập điểm đạt.",
                },
                {
                  type: "number",
                  min: 0,
                  message: "Điểm đạt không hợp lệ.",
                },
              ]}
            >
              <InputNumber
                size="large"
                min={0}
                max={100}
                step={0.1}
                precision={2}
                style={{
                  width: "100%",
                }}
                disabled={saving}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="rounding_digits"
              label="Số chữ số làm tròn"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn số chữ số làm tròn.",
                },
              ]}
            >
              <Select
                size="large"
                disabled={saving}
                options={[
                  {
                    value: 0,
                    label: "0 chữ số",
                  },
                  {
                    value: 1,
                    label: "1 chữ số",
                  },
                  {
                    value: 2,
                    label: "2 chữ số",
                  },
                  {
                    value: 3,
                    label: "3 chữ số",
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <button
          type="submit"
          style={{
            display: "none",
          }}
          aria-hidden="true"
        />
      </Form>
    </Card>
  );
});

GradingRuleForm.displayName = "GradingRuleForm";

export default GradingRuleForm;
