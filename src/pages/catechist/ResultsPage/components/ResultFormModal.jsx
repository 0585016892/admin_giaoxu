import React, { useEffect } from "react";

import {
  Alert,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Tag,
} from "antd";

import { CalculatorOutlined } from "@ant-design/icons";

import dayjs from "dayjs";

const ResultFormModal = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
  students = [],
  rule,
  editingResult = null,
}) => {
  const [form] = Form.useForm();

  const selectedItemId = Form.useWatch("grading_rule_item_id", form);

  const selectedItem = rule?.items?.find(
    (item) => Number(item.id) === Number(selectedItemId),
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingResult) {
      form.setFieldsValue({
        student_id: Number(editingResult.student_id),

        grading_rule_item_id: Number(editingResult.grading_rule_item_id),

        score:
          editingResult.score !== null
            ? Number(editingResult.score)
            : undefined,

        exam_type: editingResult.exam_type || "paper",

        exam_date: editingResult.exam_date
          ? dayjs(editingResult.exam_date)
          : dayjs(),

        note: editingResult.note || "",
      });
    } else {
      form.resetFields();

      form.setFieldsValue({
        exam_type: "paper",
        exam_date: dayjs(),
      });
    }
  }, [open, editingResult, form]);

  const handleFinish = async (values) => {
    const payload = {
      student_id: Number(values.student_id),

      grading_rule_id: Number(rule.id),

      grading_rule_item_id: Number(values.grading_rule_item_id),

      score: Number(values.score),

      exam_type: values.exam_type || "paper",

      exam_date: values.exam_date
        ? values.exam_date.format("YYYY-MM-DD")
        : null,

      note: values.note?.trim() || null,
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingResult ? "Chỉnh sửa điểm" : "Nhập điểm học viên"}
      okText="Lưu điểm"
      cancelText="Hủy"
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
      width={600}
    >
      {rule && (
        <Alert
          type="info"
          showIcon
          icon={<CalculatorOutlined />}
          className="result-form-rule-alert"
          message={
            <div>
              <strong>
                {rule.calculation_type === "weighted_average"
                  ? "Tính điểm theo hệ số"
                  : "Quy tắc tính điểm"}
              </strong>

              <div className="result-form-rule-tags">
                {rule.items.map((item) => (
                  <Tag key={item.id}>
                    {item.name} × {item.weight}
                  </Tag>
                ))}
              </div>
            </div>
          }
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="result-form"
      >
        <Form.Item
          label="Học viên"
          name="student_id"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn học viên",
            },
          ]}
        >
          <Select
            showSearch
            disabled={Boolean(editingResult)}
            optionFilterProp="label"
            placeholder="Chọn học viên"
            options={students.map((student) => ({
              value: Number(student.id),

              label: `${student.name || student.full_name}${
                student.code ? ` · ${student.code}` : ""
              }`,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Đầu điểm"
          name="grading_rule_item_id"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn đầu điểm",
            },
          ]}
          extra={
            selectedItem
              ? `Tối đa ${selectedItem.max_score} điểm · Hệ số ${selectedItem.weight} · ${selectedItem.aggregation_method}`
              : undefined
          }
        >
          <Select
            disabled={Boolean(editingResult)}
            placeholder="Chọn đầu điểm"
            options={(rule?.items || []).map((item) => ({
              value: Number(item.id),

              label: `${item.name} · Hệ số ${item.weight} · tối đa ${item.max_score}`,
            }))}
          />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Điểm"
              name="score"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập điểm",
                },

                {
                  validator: async (_, value) => {
                    if (value === undefined || value === null) {
                      return;
                    }

                    const max = Number(selectedItem?.max_score || 10);

                    if (Number(value) < 0) {
                      throw new Error("Điểm không được nhỏ hơn 0");
                    }

                    if (Number(value) > max) {
                      throw new Error(`Điểm không được lớn hơn ${max}`);
                    }
                  },
                },
              ]}
            >
              <InputNumber
                style={{
                  width: "100%",
                }}
                min={0}
                max={Number(selectedItem?.max_score || 10)}
                step={0.1}
                precision={2}
                placeholder="Nhập điểm"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Hình thức"
              name="exam_type"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                options={[
                  {
                    value: "paper",
                    label: "Bài giấy",
                  },
                  {
                    value: "online",
                    label: "Online",
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Ngày thi / kiểm tra" name="exam_date">
          <DatePicker
            style={{
              width: "100%",
            }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày"
          />
        </Form.Item>

        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder="Nhập ghi chú nếu có..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResultFormModal;
