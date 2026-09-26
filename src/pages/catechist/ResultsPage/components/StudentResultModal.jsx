import React, { useMemo } from "react";

import {
  Avatar,
  Button,
  Empty,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";

import {
  CheckCircleOutlined,
  DeleteOutlined,
  DesktopOutlined,
  EditOutlined,
  FileTextOutlined,
  FormOutlined,
  CalculatorOutlined,
  UserOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import {
  calculateStudentScore,
  formatDate,
  formatScore,
  getResultStatus,
} from "../../../../utils/resultsUtils";

const { Text } = Typography;

const StudentResultModal = ({
  open,
  onClose,
  student,
  results = [],
  rule,
  loading = false,
  onEdit,
  onDelete,
  deletingId,
}) => {
  const calculation = useMemo(
    () => calculateStudentScore(results, rule),
    [results, rule],
  );

  const status = getResultStatus(calculation.score, rule);

  const digits = Number(rule?.rounding_digits ?? 1);

  const passScore = Number(rule?.pass_score ?? 5);

  /**
   * =========================================================
   * RULE ITEMS
   * =========================================================
   */

  const ruleItems = useMemo(() => {
    return Array.isArray(rule?.items) ? rule.items : [];
  }, [rule]);

  /**
   * =========================================================
   * TOTAL WEIGHT
   * =========================================================
   */

  const totalWeight = useMemo(() => {
    return ruleItems.reduce((sum, item) => {
      const weight = Number(item?.weight ?? 1);

      return sum + (Number.isFinite(weight) ? weight : 0);
    }, 0);
  }, [ruleItems]);

  /**
   * =========================================================
   * FORMULA
   * =========================================================
   */

  const formula = useMemo(() => {
    if (!calculation?.itemScores?.length) {
      return "Chưa có dữ liệu điểm";
    }

    const numerator = calculation.itemScores
      .map((item) => {
        const score =
          item.score === null || item.score === undefined
            ? "—"
            : formatScore(item.score, 1);

        return `(${score} × ${item.weight})`;
      })
      .join(" + ");

    if (rule?.calculation_type === "sum") {
      return numerator;
    }

    return `(${numerator}) ÷ ${formatScore(
      calculation.totalWeight || totalWeight,
      1,
    )}`;
  }, [calculation, rule?.calculation_type, totalWeight]);

  /**
   * =========================================================
   * STATUS
   * =========================================================
   */

  const statusConfig = {
    passed: {
      icon: <CheckCircleOutlined />,
      label: status.label,
    },

    pass: {
      icon: <CheckCircleOutlined />,
      label: status.label,
    },

    failed: {
      icon: <CloseCircleOutlined />,
      label: status.label,
    },

    fail: {
      icon: <CloseCircleOutlined />,
      label: status.label,
    },

    pending: {
      icon: <ClockCircleOutlined />,
      label: status.label,
    },
  };

  const currentStatus = statusConfig[status.key] || {
    icon: <ClockCircleOutlined />,
    label: status.label,
  };

  /**
   * =========================================================
   * TABLE
   * =========================================================
   */

  const detailColumns = [
    {
      title: "#",
      width: 52,
      align: "center",

      render: (_, __, index) => (
        <span className="student-result-index">{index + 1}</span>
      ),
    },

    {
      title: "Đầu điểm",
      width: 190,

      render: (_, record) => {
        const item = rule?.items?.find(
          (value) => Number(value.id) === Number(record.grading_rule_item_id),
        );

        return (
          <div className="student-result-item-cell">
            <Text strong>{item?.name || record.item_name || "Đầu điểm"}</Text>

            <span>Hệ số {item?.weight || record.item_weight || 1}</span>
          </div>
        );
      },
    },

    {
      title: "Ngày",
      dataIndex: "exam_date",
      width: 110,

      render: (value) => (
        <span className="student-result-date">{formatDate(value)}</span>
      ),
    },

    {
      title: "Hình thức",
      dataIndex: "exam_type",
      width: 120,

      render: (value) =>
        value === "online" ? (
          <Tag
            icon={<DesktopOutlined />}
            className="student-result-type-tag online"
            bordered={false}
          >
            Online
          </Tag>
        ) : (
          <Tag
            icon={<FormOutlined />}
            className="student-result-type-tag paper"
            bordered={false}
          >
            Bài giấy
          </Tag>
        ),
    },

    {
      title: "Điểm",
      dataIndex: "score",
      width: 90,
      align: "center",

      render: (value) => (
        <span className="student-result-score">{formatScore(value, 1)}</span>
      ),
    },

    {
      title: "Ghi chú",
      dataIndex: "note",
      ellipsis: true,

      render: (value) => (
        <span className="student-result-note">{value || "—"}</span>
      ),
    },

    {
      title: "",
      width: 90,
      align: "right",

      render: (_, record) => (
        <Space size={2}>
          <Tooltip title="Sửa">
            <Button
              type="text"
              shape="circle"
              className="student-result-action edit"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa kết quả này?"
            description="Dữ liệu điểm sẽ bị xóa vĩnh viễn."
            okText="Xóa"
            cancelText="Hủy"
            placement="topRight"
            okButtonProps={{
              danger: true,
              loading: deletingId === record.id,
            }}
            onConfirm={() => onDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                shape="circle"
                className="student-result-action delete"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={1000}
        destroyOnClose
        centered
        className="student-result-modal"
        title={null}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="student-result-header">
          <div className="student-result-profile">
            <Avatar
              size={58}
              icon={<UserOutlined />}
              className="student-result-avatar"
            />

            <div className="student-result-profile-info">
              <div className="student-result-name">
                {student?.name || student?.full_name || "Học viên"}
              </div>

              <div className="student-result-code">
                {student?.code || `HS #${student?.id}`}
              </div>
            </div>
          </div>

          <div className="student-result-final">
            <div className="student-result-final-label">ĐIỂM TỔNG KẾT</div>

            <div className="student-result-final-row">
              {calculation.score === null ? (
                <strong className="student-result-final-score pending">
                  —
                </strong>
              ) : (
                <strong className={`student-result-final-score ${status.key}`}>
                  {formatScore(calculation.score, digits)}
                </strong>
              )}

              <Tag
                bordered={false}
                icon={currentStatus.icon}
                className={`student-result-status ${status.key}`}
              >
                {currentStatus.label}
              </Tag>
            </div>

            <div className="student-result-pass-info">
              Đạt từ {passScore.toFixed(1)} điểm
            </div>
          </div>
        </div>

        {/* =====================================================
            FORMULA
        ===================================================== */}

        {rule && (
          <div className="student-result-formula-section">
            <div className="student-result-section-heading">
              <div className="student-result-section-heading-left">
                <div className="student-result-section-icon">
                  <CalculatorOutlined />
                </div>

                <div>
                  <div className="student-result-section-title">
                    Cách tính điểm
                  </div>

                  <div className="student-result-section-subtitle">
                    {rule.calculation_type === "weighted_average"
                      ? "Trung bình có hệ số"
                      : "Theo quy tắc của lớp"}
                  </div>
                </div>
              </div>
            </div>

            <div className="student-result-formula-box">
              <div className="student-result-formula-label">CÔNG THỨC</div>

              <div className="student-result-formula">{formula}</div>

              {calculation.score !== null && (
                <div className="student-result-formula-result">
                  = <strong>{formatScore(calculation.score, digits)}</strong>
                  {" điểm"}
                </div>
              )}
            </div>

            {/* COMPONENTS */}

            {calculation.itemScores?.length > 0 && (
              <div className="student-result-components">
                {calculation.itemScores.map((item, index) => (
                  <div
                    className="student-result-component"
                    key={item.ruleItemId || index}
                  >
                    <div className="student-result-component-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="student-result-component-info">
                      <span className="student-result-component-name">
                        {item.name}
                      </span>

                      <span className="student-result-component-weight">
                        Hệ số × {item.weight}
                      </span>
                    </div>

                    <strong className="student-result-component-score">
                      {item.score === null ? "—" : formatScore(item.score, 1)}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            <div className="student-result-rule-meta">
              <div>
                <span>Điểm đạt</span>
                <strong>{passScore.toFixed(1)}</strong>
              </div>

              <div className="student-result-rule-divider" />

              <div>
                <span>Làm tròn</span>
                <strong>{digits} chữ số</strong>
              </div>

              {rule?.multiplier && Number(rule.multiplier) !== 1 && (
                <>
                  <div className="student-result-rule-divider" />

                  <div>
                    <span>Hệ số tổng</span>
                    <strong>× {Number(rule.multiplier).toFixed(1)}</strong>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            HISTORY HEADER
        ===================================================== */}

        <div className="student-result-history-header">
          <div className="student-result-history-title">
            <div className="student-result-history-icon">
              <FileTextOutlined />
            </div>

            <div>
              <div className="student-result-history-name">Lịch sử điểm</div>

              <div className="student-result-history-subtitle">
                Các lần nhập kết quả của học viên
              </div>
            </div>
          </div>

          <div className="student-result-history-count">
            {results.length} lần nhập
          </div>
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="student-result-table">
          <Table
            columns={detailColumns}
            dataSource={results}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 8,
              hideOnSinglePage: true,
              showSizeChanger: false,
            }}
            size="middle"
            scroll={{
              x: 750,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có kết quả"
                />
              ),
            }}
          />
        </div>
      </Modal>

      <style>{`
        /* =====================================================
           MODAL
        ===================================================== */

        .student-result-modal .ant-modal-content {
          padding: 0;
          overflow: hidden;
          border-radius: 20px;
          background: #ffffff;
        }

        .student-result-modal .ant-modal-close {
          top: 16px;
          right: 16px;
          z-index: 5;

          width: 34px;
          height: 34px;

          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
        }

        .student-result-modal .ant-modal-close:hover {
          background: #e2e8f0;
          color: #173b5e;
        }

        .student-result-modal .ant-modal-body {
          padding: 0;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .student-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;

          padding: 24px 28px;

          background:
            linear-gradient(
              135deg,
              #f8fafc 0%,
              #ffffff 70%
            );

          border-bottom: 1px solid #eef2f6;
        }

        .student-result-profile {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .student-result-avatar {
          flex-shrink: 0;

          background: #e9eff5;
          color: #173b5e;

          border: 3px solid #ffffff;
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.08);
        }

        .student-result-profile-info {
          min-width: 0;
        }

        .student-result-name {
          color: #173b5e;
          font-size: 19px;
          font-weight: 800;
          line-height: 1.35;
        }

        .student-result-code {
          margin-top: 4px;

          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
        }

        /* =====================================================
           FINAL SCORE
        ===================================================== */

        .student-result-final {
          padding-right: 35px;
          text-align: right;
        }

        .student-result-final-label {
          margin-bottom: 2px;

          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .student-result-final-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .student-result-final-score {
          font-size: 30px;
          font-weight: 900;
          line-height: 1.2;
        }

        .student-result-final-score.passed,
        .student-result-final-score.pass {
          color: #16a34a;
        }

        .student-result-final-score.failed,
        .student-result-final-score.fail {
          color: #dc2626;
        }

        .student-result-final-score.pending {
          color: #94a3b8;
        }

        .student-result-status {
          margin: 0;

          display: inline-flex;
          align-items: center;
          gap: 4px;

          padding: 4px 9px;

          border-radius: 7px;

          font-size: 11px;
          font-weight: 700;
        }

        .student-result-status.passed,
        .student-result-status.pass {
          background: #ecfdf3;
          color: #15803d;
        }

        .student-result-status.failed,
        .student-result-status.fail {
          background: #fef2f2;
          color: #dc2626;
        }

        .student-result-status.pending {
          background: #f8fafc;
          color: #64748b;
        }

        .student-result-pass-info {
          margin-top: 3px;

          color: #94a3b8;
          font-size: 11px;
          font-weight: 500;
        }

        /* =====================================================
           FORMULA SECTION
        ===================================================== */

        .student-result-formula-section {
          margin: 20px 28px 0;
          padding: 18px;

          border: 1px solid #e2e8f0;
          border-radius: 15px;

          background: #ffffff;
        }

        .student-result-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .student-result-section-heading-left {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .student-result-section-icon {
          width: 36px;
          height: 36px;
          flex: 0 0 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: #fdf8eb;
          color: #b88618;

          font-size: 17px;
        }

        .student-result-section-title {
          color: #173b5e;
          font-size: 14px;
          font-weight: 800;
        }

        .student-result-section-subtitle {
          margin-top: 2px;

          color: #94a3b8;
          font-size: 11px;
          font-weight: 500;
        }

        /* =====================================================
           FORMULA BOX
        ===================================================== */

        .student-result-formula-box {
          padding: 17px 15px;

          border: 1px solid #dbe5ef;
          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #f8fafc 0%,
              #ffffff 100%
            );

          text-align: center;
        }

        .student-result-formula-label {
          margin-bottom: 7px;

          color: #94a3b8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .student-result-formula {
          color: #173b5e;
          font-size: 16px;
          font-weight: 800;
          line-height: 1.7;
          word-break: break-word;
        }

        .student-result-formula-result {
          margin-top: 5px;

          color: #64748b;
          font-size: 13px;
          font-weight: 600;
        }

        .student-result-formula-result strong {
          color: #16a34a;
          font-size: 16px;
          font-weight: 900;
        }

        /* =====================================================
           COMPONENTS
        ===================================================== */

        .student-result-components {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(190px, 1fr)
          );

          gap: 8px;

          margin-top: 13px;
        }

        .student-result-component {
          display: flex;
          align-items: center;
          gap: 9px;

          padding: 9px 10px;

          border: 1px solid #edf1f5;
          border-radius: 9px;

          background: #fbfcfd;
        }

        .student-result-component-number {
          width: 27px;
          height: 27px;
          flex: 0 0 27px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 7px;

          background: #eef3f8;
          color: #64748b;

          font-size: 9px;
          font-weight: 800;
        }

        .student-result-component-info {
          min-width: 0;
          flex: 1;
        }

        .student-result-component-name {
          display: block;

          overflow: hidden;

          color: #334155;
          font-size: 12px;
          font-weight: 700;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .student-result-component-weight {
          display: block;
          margin-top: 1px;

          color: #94a3b8;
          font-size: 10px;
        }

        .student-result-component-score {
          flex-shrink: 0;

          color: #173b5e;
          font-size: 13px;
          font-weight: 800;
        }

        /* =====================================================
           RULE META
        ===================================================== */

        .student-result-rule-meta {
          display: flex;
          align-items: center;

          margin-top: 13px;
          padding-top: 13px;

          border-top: 1px solid #eef2f6;
        }

        .student-result-rule-meta > div:not(
            .student-result-rule-divider
          ) {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .student-result-rule-meta span {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
        }

        .student-result-rule-meta strong {
          color: #334155;
          font-size: 12px;
          font-weight: 800;
        }

        .student-result-rule-divider {
          width: 1px;
          height: 18px;

          margin: 0 16px;

          background: #e2e8f0;
        }

        /* =====================================================
           HISTORY HEADER
        ===================================================== */

        .student-result-history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin: 22px 28px 12px;
        }

        .student-result-history-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .student-result-history-icon {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: #eef3f8;
          color: #173b5e;

          font-size: 15px;
        }

        .student-result-history-name {
          color: #173b5e;
          font-size: 14px;
          font-weight: 800;
        }

        .student-result-history-subtitle {
          margin-top: 2px;

          color: #94a3b8;
          font-size: 11px;
        }

        .student-result-history-count {
          padding: 5px 9px;

          border-radius: 7px;

          background: #f8fafc;
          color: #64748b;

          font-size: 11px;
          font-weight: 700;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .student-result-table {
          margin: 0 28px 24px;

          border: 1px solid #e5eaf0;
          border-radius: 13px;
          overflow: hidden;
        }

        .student-result-table .ant-table {
          font-size: 12px;
        }

        .student-result-table .ant-table-thead > tr > th {
          padding: 11px 12px;

          background: #f8fafc;

          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.02em;

          border-bottom: 1px solid #e5eaf0;
        }

        .student-result-table .ant-table-tbody > tr > td {
          padding: 10px 12px;

          border-bottom-color: #f0f2f5;
        }

        .student-result-table
          .ant-table-tbody
          > tr:hover
          > td {
          background: #fafcfe;
        }

        .student-result-table
          .ant-table-tbody
          > tr:last-child
          > td {
          border-bottom: none;
        }

        .student-result-index {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
        }

        .student-result-item-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .student-result-item-cell strong {
          color: #334155;
          font-size: 12px;
        }

        .student-result-item-cell span {
          color: #94a3b8;
          font-size: 10px;
        }

        .student-result-date {
          color: #64748b;
          font-size: 11px;
        }

        .student-result-type-tag {
          margin: 0;
          padding: 3px 7px;

          border-radius: 6px;

          font-size: 10px;
          font-weight: 700;
        }

        .student-result-type-tag.online {
          background: #eff6ff;
          color: #2563eb;
        }

        .student-result-type-tag.paper {
          background: #f8fafc;
          color: #64748b;
        }

        .student-result-score {
          color: #173b5e;
          font-size: 13px;
          font-weight: 800;
        }

        .student-result-note {
          color: #64748b;
          font-size: 11px;
        }

        .student-result-action {
          color: #64748b;
        }

        .student-result-action.edit:hover {
          background: #eff6ff;
          color: #2563eb;
        }

        .student-result-action.delete:hover {
          background: #fef2f2;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767px) {
          .student-result-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
            padding: 20px 16px;
          }

          .student-result-final {
            width: 100%;
            padding-right: 0;
            text-align: left;
          }

          .student-result-final-row {
            justify-content: flex-start;
          }

          .student-result-formula-section {
            margin: 16px;
            padding: 14px;
          }

          .student-result-formula {
            font-size: 14px;
          }

          .student-result-components {
            grid-template-columns: 1fr;
          }

          .student-result-rule-meta {
            align-items: flex-start;
            flex-direction: column;
            gap: 9px;
          }

          .student-result-rule-divider {
            display: none;
          }

          .student-result-history-header {
            margin: 18px 16px 10px;
          }

          .student-result-history-subtitle {
            display: none;
          }

          .student-result-table {
            margin: 0 16px 18px;
          }

          .student-result-final-score {
            font-size: 27px;
          }
        }

        @media (max-width: 480px) {
          .student-result-name {
            font-size: 17px;
          }

          .student-result-status {
            font-size: 10px;
          }

          .student-result-formula {
            font-size: 13px;
          }

          .student-result-history-count {
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default StudentResultModal;
