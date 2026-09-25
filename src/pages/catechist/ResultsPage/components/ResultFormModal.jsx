import React, { useEffect } from "react";

import {
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

import {
  CalculatorOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import {
  getAggregationLabel,
  getCalculationLabel,
} from "../../../../utils/gradingRuleUtils";

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

  const selectedItem = (rule?.items || []).find(
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
          editingResult.score !== null && editingResult.score !== undefined
            ? Number(editingResult.score)
            : undefined,

        exam_type: editingResult.exam_type || "paper",

        exam_date: editingResult.exam_date
          ? dayjs(editingResult.exam_date)
          : dayjs(),

        note: editingResult.note || "",
      });

      return;
    }

    form.resetFields();

    form.setFieldsValue({
      exam_type: "paper",
      exam_date: dayjs(),
    });
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

  const maxScore = Number(selectedItem?.max_score ?? 10);

  const weight = Number(selectedItem?.weight ?? 1);

  const calculationLabel = getCalculationLabel(rule?.calculation_type);

  const aggregationLabel = getAggregationLabel(
    selectedItem?.aggregation_method,
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="result-modal-title">
          <div className="result-modal-title-icon">
            {editingResult ? <FileTextOutlined /> : <CalculatorOutlined />}
          </div>

          <div>
            <div className="result-modal-title-main">
              {editingResult ? "Chỉnh sửa điểm" : "Nhập điểm học viên"}
            </div>

            <div className="result-modal-title-sub">
              {editingResult
                ? "Cập nhật kết quả đã nhập"
                : "Thêm kết quả theo quy tắc của giáo xứ"}
            </div>
          </div>
        </div>
      }
      okText={editingResult ? "Lưu thay đổi" : "Lưu điểm"}
      cancelText="Hủy"
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
      width={620}
      centered
      className="result-form-modal"
    >
      {/* =====================================================
          GRADING RULE
      ===================================================== */}

      {rule && (
        <div className="result-form-rule-card">
          <div className="result-form-rule-header">
            <div className="result-form-rule-icon">
              <CalculatorOutlined />
            </div>

            <div>
              <div className="result-form-rule-title">Quy tắc tính điểm</div>

              <div className="result-form-rule-method">{calculationLabel}</div>
            </div>
          </div>

          <div className="result-form-rule-items">
            {(rule.items || []).map((item) => (
              <Tag key={item.id} className="result-form-rule-tag">
                <span>{item.name}</span>

                <strong>× {Number(item.weight ?? 1).toFixed(1)}</strong>
              </Tag>
            ))}
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="result-form"
      >
        {/* ===================================================
            STUDENT
        =================================================== */}

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
            prefix={<UserOutlined />}
            options={students.map((student) => ({
              value: Number(student.id),

              label: `${student.name || student.full_name || "Chưa có tên"}${
                student.code ? ` · ${student.code}` : ""
              }`,
            }))}
          />
        </Form.Item>

        {/* ===================================================
            RULE ITEM
        =================================================== */}

        <Form.Item
          label="Đầu điểm"
          name="grading_rule_item_id"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn đầu điểm",
            },
          ]}
        >
          <Select
            disabled={Boolean(editingResult)}
            placeholder="Chọn đầu điểm"
            options={(rule?.items || []).map((item) => ({
              value: Number(item.id),

              label: `${item.name} · × ${Number(item.weight ?? 1).toFixed(
                1,
              )} · tối đa ${Number(item.max_score ?? 10).toFixed(1)}`,
            }))}
          />
        </Form.Item>

        {/* ===================================================
            SELECTED ITEM INFO
        =================================================== */}

        {selectedItem && (
          <div className="result-form-selected-item">
            <div className="result-form-selected-item-main">
              <div className="result-form-selected-item-name">
                {selectedItem.name}
              </div>

              <div className="result-form-selected-item-meta">
                <span>
                  Điểm tối đa <strong>{maxScore.toFixed(1)}</strong>
                </span>

                <span className="result-form-dot">•</span>

                <span>
                  Hệ số{" "}
                  <strong className="result-form-weight">
                    × {weight.toFixed(1)}
                  </strong>
                </span>
              </div>
            </div>

            {Number(selectedItem.allow_multiple) === 1 && (
              <Tag color="blue" icon={<CheckCircleOutlined />}>
                {aggregationLabel}
              </Tag>
            )}
          </div>
        )}

        {/* ===================================================
            SCORE + EXAM TYPE
        =================================================== */}

        <Row gutter={14}>
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

                    const score = Number(value);

                    if (score < 0) {
                      throw new Error("Điểm không được nhỏ hơn 0");
                    }

                    if (score > maxScore) {
                      throw new Error(`Điểm không được lớn hơn ${maxScore}`);
                    }
                  },
                },
              ]}
            >
              <InputNumber
                className="result-score-input"
                min={0}
                max={maxScore}
                step={0.1}
                precision={2}
                controls
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
                  message: "Vui lòng chọn hình thức",
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

        {/* ===================================================
            DATE
        =================================================== */}

        <Form.Item label="Ngày thi / kiểm tra" name="exam_date">
          <DatePicker
            style={{
              width: "100%",
            }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày"
            allowClear
          />
        </Form.Item>

        {/* ===================================================
            NOTE
        =================================================== */}

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
