import React, { useEffect } from "react";

import {
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Col,
  Select,
  Switch,
} from "antd";

import { AppstoreAddOutlined } from "@ant-design/icons";

import {
  AGGREGATION_METHODS,
  AGGREGATION_LABELS,
} from "../../../../utils/gradingRuleUtils";

const aggregationOptions = Object.values(AGGREGATION_METHODS).map((value) => ({
  value,
  label: AGGREGATION_LABELS[value],
}));

const GradingRuleItemModal = ({
  open,
  loading = false,
  editingItem = null,
  existingItems = [],
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const isEditing = Boolean(editingItem?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingItem) {
      form.setFieldsValue({
        name: editingItem.name,
        code: editingItem.code,
        weight: editingItem.weight ?? 1,
        max_score: editingItem.max_score ?? 10,
        sort_order: editingItem.sort_order ?? 0,
        allow_multiple: Number(editingItem.allow_multiple) === 1,
        aggregation_method:
          editingItem.aggregation_method ?? AGGREGATION_METHODS.LATEST,
      });
    } else {
      form.resetFields();

      form.setFieldsValue({
        weight: 1,
        max_score: 10,
        sort_order: existingItems.length,
        allow_multiple: false,
        aggregation_method: AGGREGATION_METHODS.LATEST,
      });
    }
  }, [open, editingItem, existingItems.length, form]);

  const handleFinish = (values) => {
    const code = String(values.code || "")
      .trim()
      .toUpperCase();

    const duplicate = existingItems.some((item) => {
      const sameCode =
        String(item.code || "")
          .trim()
          .toUpperCase() === code;

      if (!sameCode) {
        return false;
      }

      if (editingItem?.id) {
        return item.id !== editingItem.id;
      }

      return true;
    });

    if (duplicate) {
      form.setFields([
        {
          name: "code",
          errors: ["Mã này đã được sử dụng."],
        },
      ]);

      return;
    }

    onSubmit({
      ...values,
      code,
      allow_multiple: values.allow_multiple ? 1 : 0,
    });
  };

  return (
    <Modal
      open={open}
      title={
        <div className="grading-rule-item-modal-title">
          <div className="grading-rule-item-modal-icon">
            <AppstoreAddOutlined />
          </div>

          <div>
            <div className="grading-rule-item-modal-heading">
              {isEditing ? "Chỉnh sửa thành phần" : "Thêm thành phần điểm"}
            </div>

            <div className="grading-rule-item-modal-subtitle">
              Cấu hình một đầu điểm trong quy tắc
            </div>
          </div>
        </div>
      }
      okText={isEditing ? "Lưu thay đổi" : "Thêm thành phần"}
      cancelText="Hủy"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
      width={680}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
        className="grading-rule-item-form"
      >
        <div className="grading-rule-item-form-section">
          <div className="grading-rule-item-form-section-title">
            Thông tin thành phần
          </div>

          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name="name"
                label="Tên thành phần"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Vui lòng nhập tên thành phần.",
                  },
                  {
                    max: 100,
                    message: "Tên không được vượt quá 100 ký tự.",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ví dụ: Điểm chuyên cần"
                  disabled={loading}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="code"
                label="Mã"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Vui lòng nhập mã.",
                  },
                  {
                    max: 50,
                    message: "Mã không được vượt quá 50 ký tự.",
                  },
                  {
                    pattern: /^[A-Za-z0-9_-]+$/,
                    message:
                      "Mã chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới.",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="CC"
                  disabled={loading}
                  onChange={(event) => {
                    const value = event.target.value.toUpperCase();

                    form.setFieldValue("code", value);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="grading-rule-item-form-section">
          <div className="grading-rule-item-form-section-title">Cách tính</div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="weight"
                label="Trọng số"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập trọng số.",
                  },
                  {
                    type: "number",
                    min: 0.0001,
                    message: "Trọng số phải lớn hơn 0.",
                  },
                ]}
              >
                <InputNumber
                  size="large"
                  min={0.0001}
                  step={0.5}
                  precision={4}
                  style={{
                    width: "100%",
                  }}
                  disabled={loading}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="max_score"
                label="Điểm tối đa"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập điểm tối đa.",
                  },
                  {
                    type: "number",
                    min: 0.01,
                    message: "Điểm tối đa phải lớn hơn 0.",
                  },
                ]}
              >
                <InputNumber
                  size="large"
                  min={0.01}
                  max={100}
                  step={0.5}
                  precision={2}
                  style={{
                    width: "100%",
                  }}
                  disabled={loading}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="allow_multiple"
                label="Cho phép nhiều lần nhập điểm"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Có"
                  unCheckedChildren="Không"
                  disabled={loading}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="aggregation_method" label="Cách gom nhiều điểm">
                <Select
                  size="large"
                  options={aggregationOptions}
                  disabled={loading}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="grading-rule-item-form-section">
          <div className="grading-rule-item-form-section-title">
            Thứ tự hiển thị
          </div>

          <Form.Item
            name="sort_order"
            label="Vị trí"
            extra="Vị trí càng nhỏ sẽ hiển thị càng trước."
          >
            <InputNumber
              size="large"
              min={0}
              precision={0}
              style={{
                width: "100%",
              }}
              disabled={loading}
            />
          </Form.Item>
        </div>

        <div className="grading-rule-item-modal-note">
          Mã thành phần phải là duy nhất trong cùng một quy tắc tính điểm.
        </div>
      </Form>
    </Modal>
  );
};

export default GradingRuleItemModal;
