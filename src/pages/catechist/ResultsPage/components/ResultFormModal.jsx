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
} from "antd";

import {
  CalculatorOutlined,
  CheckCircleOutlined,
  FormOutlined,
  UserOutlined,
  DesktopOutlined,
  CalendarOutlined,
  EditOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import { getAggregationLabel } from "../../../../utils/gradingRuleUtils";

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

  /* =========================================================
     FORM INIT
  ========================================================= */

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

  /* =========================================================
     SUBMIT
  ========================================================= */

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

  /* =========================================================
     SELECTED ITEM
  ========================================================= */

  const maxScore = Number(selectedItem?.max_score ?? 10);

  const weight = Number(selectedItem?.weight ?? 1);

  const aggregationLabel = getAggregationLabel(
    selectedItem?.aggregation_method,
  );

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        title={
          <div className="result-form-header">
            <div className="result-form-header-icon">
              {editingResult ? <EditOutlined /> : <CalculatorOutlined />}
            </div>

            <div>
              <div className="result-form-header-title">
                {editingResult ? "Chỉnh sửa điểm" : "Nhập điểm học viên"}
              </div>

              <div className="result-form-header-subtitle">
                {editingResult
                  ? "Cập nhật kết quả đã nhập"
                  : "Thêm kết quả theo quy tắc tính điểm"}
              </div>
            </div>
          </div>
        }
        onOk={() => form.submit()}
        okText={editingResult ? "Lưu thay đổi" : "Lưu điểm"}
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnClose
        width={640}
        centered
        className="result-form-modal"
      >
        {/* =====================================================
            RULE SUMMARY
        ===================================================== */}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="result-form"
        >
          {/* ===================================================
              STUDENT
          =================================================== */}

          <div className="result-form-section-title">
            <div className="result-form-section-number">01</div>

            <div>
              <div className="result-form-section-name">Thông tin học viên</div>

              <div className="result-form-section-desc">
                Chọn học viên và đầu điểm cần nhập
              </div>
            </div>
          </div>

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
              suffixIcon={<UserOutlined />}
              options={students.map((student) => ({
                value: Number(student.id),

                label: `${student.name || student.full_name || "Chưa có tên"}${
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
          >
            <Select
              disabled={Boolean(editingResult)}
              placeholder="Chọn đầu điểm"
              options={(rule?.items || []).map((item) => ({
                value: Number(item.id),

                label: `${item.name} · × ${Number(item.weight ?? 1).toFixed(
                  1,
                )}`,
              }))}
            />
          </Form.Item>

          {/* ===================================================
              SELECTED ITEM
          =================================================== */}

          {selectedItem && (
            <div className="result-form-selected">
              <div className="result-form-selected-icon">
                <CheckCircleOutlined />
              </div>

              <div className="result-form-selected-content">
                <div className="result-form-selected-name">
                  {selectedItem.name}
                </div>

                <div className="result-form-selected-meta">
                  <span>
                    Tối đa <strong>{maxScore.toFixed(1)}</strong>
                  </span>

                  <span className="result-form-dot">•</span>

                  <span>
                    Hệ số <strong>× {weight.toFixed(1)}</strong>
                  </span>

                  {Number(selectedItem.allow_multiple) === 1 && (
                    <>
                      <span className="result-form-dot">•</span>

                      <span>{aggregationLabel}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              SCORE
          =================================================== */}

          <div className="result-form-section-title result-form-section-score">
            <div className="result-form-section-number">02</div>

            <div>
              <div className="result-form-section-name">Kết quả</div>

              <div className="result-form-section-desc">
                Nhập điểm và thông tin bài kiểm tra
              </div>
            </div>
          </div>

          <Row gutter={[14, 0]}>
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
                  addonAfter={`/ ${maxScore}`}
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
                      label: (
                        <span className="result-form-select-option">
                          <FormOutlined />
                          Bài giấy
                        </span>
                      ),
                    },

                    {
                      value: "online",
                      label: (
                        <span className="result-form-select-option">
                          <DesktopOutlined />
                          Online
                        </span>
                      ),
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
              suffixIcon={<CalendarOutlined />}
            />
          </Form.Item>

          {/* ===================================================
              NOTE
          =================================================== */}

          <Form.Item label="Ghi chú" name="note" className="result-form-note">
            <Input.TextArea
              rows={3}
              maxLength={500}
              showCount
              placeholder="Nhập ghi chú nếu có..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        /* =====================================================
           MODAL
        ===================================================== */

        .result-form-modal .ant-modal-content {
          padding: 0;
          overflow: hidden;
          border-radius: 18px;
        }

        .result-form-modal .ant-modal-header {
          margin: 0;
          padding: 20px 24px;

          border-bottom: 1px solid #eef2f6;

          background: #ffffff;
        }

        .result-form-modal .ant-modal-body {
          padding: 20px 24px 6px;
        }

        .result-form-modal .ant-modal-footer {
          margin-top: 0;
          padding: 14px 24px;

          border-top: 1px solid #eef2f6;
        }

        .result-form-modal .ant-btn {
          height: 38px;
          border-radius: 9px;
          font-weight: 700;
        }

        .result-form-modal .ant-btn-primary {
          background: #173b5e;
          border-color: #173b5e;
        }

        .result-form-modal .ant-btn-primary:hover {
          background: #204d75 !important;
          border-color: #204d75 !important;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .result-form-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .result-form-header-icon {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #fdf8eb;
          color: #b88618;

          font-size: 18px;
        }

        .result-form-header-title {
          color: #173b5e;
          font-size: 16px;
          font-weight: 800;
          line-height: 1.35;
        }

        .result-form-header-subtitle {
          margin-top: 3px;

          color: #94a3b8;
          font-size: 12px;
          font-weight: 500;
        }

        /* =====================================================
           RULE
        ===================================================== */

        .result-form-rule {
          margin-bottom: 22px;

          padding: 14px;

          border: 1px solid #e2e8f0;
          border-radius: 13px;

          background: #f8fafc;
        }

        .result-form-rule-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .result-form-rule-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .result-form-rule-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: #ffffff;
          color: #b88618;

          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
        }

        .result-form-rule-title {
          color: #334155;
          font-size: 13px;
          font-weight: 800;
        }

        .result-form-rule-method {
          margin-top: 2px;

          color: #94a3b8;
          font-size: 11px;
          font-weight: 500;
        }

        .result-form-rule-tag {
          margin: 0;

          border: 1px solid #dbe5ef;
          border-radius: 7px;

          background: #ffffff;
          color: #64748b;

          font-size: 10px;
          font-weight: 700;
        }

        .result-form-rule-list {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;

          margin-top: 11px;
          padding-top: 11px;

          border-top: 1px solid #e8edf2;
        }

        .result-form-rule-item {
          display: flex;
          align-items: center;
          gap: 6px;

          padding: 5px 8px;

          border: 1px solid #e3e9ef;
          border-radius: 7px;

          background: #ffffff;
        }

        .result-form-rule-item span {
          color: #475569;
          font-size: 10px;
          font-weight: 600;
        }

        .result-form-rule-item strong {
          color: #173b5e;
          font-size: 10px;
          font-weight: 800;
        }

        /* =====================================================
           SECTION
        ===================================================== */

        .result-form-section-title {
          display: flex;
          align-items: center;
          gap: 9px;

          margin: 4px 0 13px;
        }

        .result-form-section-number {
          width: 27px;
          height: 27px;
          flex: 0 0 27px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 7px;

          background: #eef3f8;
          color: #173b5e;

          font-size: 9px;
          font-weight: 800;
        }

        .result-form-section-name {
          color: #334155;
          font-size: 13px;
          font-weight: 800;
        }

        .result-form-section-desc {
          margin-top: 1px;

          color: #94a3b8;
          font-size: 10px;
        }

        .result-form-section-score {
          margin-top: 7px;
        }

        /* =====================================================
           FORM
        ===================================================== */

        .result-form .ant-form-item {
          margin-bottom: 16px;
        }

        .result-form .ant-form-item-label {
          padding-bottom: 5px;
        }

        .result-form .ant-form-item-label > label {
          color: #475569;
          font-size: 12px;
          font-weight: 700;
        }

        .result-form .ant-input,
        .result-form .ant-input-number,
        .result-form .ant-select-selector,
        .result-form .ant-picker {
          border-color: #dfe5eb !important;
          border-radius: 9px !important;
          box-shadow: none !important;
        }

        .result-form .ant-select-selector {
          min-height: 40px !important;
        }

        .result-form .ant-input,
        .result-form .ant-input-number,
        .result-form .ant-picker {
          min-height: 40px;
        }

        .result-form .ant-input:focus,
        .result-form .ant-input-number-focused,
        .result-form .ant-select-focused .ant-select-selector,
        .result-form .ant-picker-focused {
          border-color: #173b5e !important;
          box-shadow: 0 0 0 2px rgba(23, 59, 94, 0.07) !important;
        }

        .result-form .ant-select-selection-placeholder,
        .result-form .ant-input::placeholder,
        .result-form .ant-input-number-input::placeholder {
          color: #a0aab5;
        }

        /* =====================================================
           SELECTED ITEM
        ===================================================== */

        .result-form-selected {
          display: flex;
          align-items: center;
          gap: 10px;

          margin: -4px 0 17px;
          padding: 10px 11px;

          border: 1px solid #dceee3;
          border-radius: 10px;

          background: #f5fbf7;
        }

        .result-form-selected-icon {
          width: 27px;
          height: 27px;
          flex: 0 0 27px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #dcfce7;
          color: #16a34a;

          font-size: 13px;
        }

        .result-form-selected-content {
          min-width: 0;
          flex: 1;
        }

        .result-form-selected-name {
          color: #166534;
          font-size: 12px;
          font-weight: 800;
        }

        .result-form-selected-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;

          margin-top: 2px;

          color: #64748b;
          font-size: 10px;
        }

        .result-form-selected-meta strong {
          color: #334155;
          font-weight: 800;
        }

        .result-form-dot {
          color: #cbd5e1;
        }

        /* =====================================================
           SCORE
        ===================================================== */

        .result-score-input {
          width: 100%;
        }

        .result-score-input .ant-input-number-input {
          height: 38px;
          font-size: 15px;
          font-weight: 800;
          color: #173b5e;
        }

        .result-score-input .ant-input-number-handler-wrap {
          border-radius: 0 8px 8px 0;
        }

        .result-score-input .ant-input-number-group-addon {
          color: #94a3b8;
          background: #f8fafc;
          border-color: #dfe5eb;
          font-size: 11px;
          font-weight: 700;
        }

        .result-form-select-option {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .result-form-select-option svg {
          color: #64748b;
        }

        /* =====================================================
           NOTE
        ===================================================== */

        .result-form-note {
          margin-bottom: 4px !important;
        }

        .result-form-note .ant-input {
          resize: vertical;
        }

        .result-form-note .ant-input-data-count {
          color: #94a3b8;
          font-size: 10px;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767px) {
          .result-form-modal {
            max-width: calc(100vw - 20px);
          }

          .result-form-modal .ant-modal-header {
            padding: 17px;
          }

          .result-form-modal .ant-modal-body {
            padding: 17px 17px 3px;
          }

          .result-form-modal .ant-modal-footer {
            padding: 12px 17px;
          }

          .result-form-rule {
            margin-bottom: 18px;
          }

          .result-form-rule-top {
            align-items: flex-start;
          }

          .result-form-rule-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .result-form-rule-item {
            min-width: 0;
          }

          .result-form-rule-item span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        @media (max-width: 480px) {
          .result-form-rule-list {
            grid-template-columns: 1fr;
          }

          .result-form-header-title {
            font-size: 15px;
          }

          .result-form-header-subtitle {
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
};

export default ResultFormModal;
