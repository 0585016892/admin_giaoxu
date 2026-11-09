import React, { useMemo, useState } from "react";

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
  Tabs,
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

/* =========================================================
   HELPER: XÁC ĐỊNH HỌC KỲ TỪ NOTE
========================================================= */

const getSemester = (note) => {
  const value = String(note || "")
    .trim()
    .toLowerCase();

  if (/học\s*kỳ\s*1/.test(value) || /hk\s*1/.test(value) || /hk1/.test(value)) {
    return "1";
  }

  if (/học\s*kỳ\s*2/.test(value) || /hk\s*2/.test(value) || /hk2/.test(value)) {
    return "2";
  }

  return null;
};

/* =========================================================
   HELPER: KIỂM TRA ĐIỂM HỢP LỆ
========================================================= */

const hasValidScore = (score) => {
  return (
    score !== null &&
    score !== undefined &&
    score !== "" &&
    Number.isFinite(Number(score))
  );
};

/* =========================================================
   COMPONENT
========================================================= */

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
  const [activeSemester, setActiveSemester] = useState("1");

  const digits = Number(rule?.rounding_digits ?? 1);
  const passScore = Number(rule?.pass_score ?? 5);

  /* =========================================================
     1. CHIA KẾT QUẢ THEO HỌC KỲ
  ========================================================= */

  const semesterResults = useMemo(() => {
    const list = Array.isArray(results) ? results : [];

    return {
      1: list.filter((item) => getSemester(item.note) === "1"),
      2: list.filter((item) => getSemester(item.note) === "2"),
      unknown: list.filter((item) => !getSemester(item.note)),
    };
  }, [results]);

  /* =========================================================
     2. TÍNH ĐIỂM HỌC KỲ 1
  ========================================================= */

  const calculationHK1 = useMemo(() => {
    return calculateStudentScore(semesterResults["1"], rule);
  }, [semesterResults, rule]);

  /* =========================================================
     3. TÍNH ĐIỂM HỌC KỲ 2
  ========================================================= */

  const calculationHK2 = useMemo(() => {
    return calculateStudentScore(semesterResults["2"], rule);
  }, [semesterResults, rule]);

  /* =========================================================
     4. ĐIỂM TRUNG BÌNH CẢ NĂM

     ĐTB cả năm = (ĐTB HK1 + ĐTB HK2) / 2

     Chỉ tính khi cả hai học kỳ đều có điểm.
  ========================================================= */

  const annualScore = useMemo(() => {
    const score1 = calculationHK1?.score;
    const score2 = calculationHK2?.score;

    if (!hasValidScore(score1) || !hasValidScore(score2)) {
      return null;
    }

    const average = (Number(score1) + Number(score2)) / 2;

    return Number(average.toFixed(digits));
  }, [calculationHK1, calculationHK2, digits]);

  const annualStatus = getResultStatus(annualScore, rule);

  /* =========================================================
     5. ĐIỂM THEO TAB ĐANG CHỌN
  ========================================================= */

  const currentResults = semesterResults[activeSemester];

  const currentCalculation =
    activeSemester === "1" ? calculationHK1 : calculationHK2;

  const currentStatus = getResultStatus(currentCalculation?.score, rule);

  /* =========================================================
     6. RULE ITEMS
  ========================================================= */

  const ruleItems = useMemo(() => {
    return Array.isArray(rule?.items) ? rule.items : [];
  }, [rule]);

  const totalWeight = useMemo(() => {
    return ruleItems.reduce((sum, item) => {
      const weight = Number(item?.weight ?? 1);

      return sum + (Number.isFinite(weight) ? weight : 0);
    }, 0);
  }, [ruleItems]);

  /* =========================================================
     7. CÔNG THỨC THEO HỌC KỲ ĐANG CHỌN
  ========================================================= */

  const formula = useMemo(() => {
    if (!currentCalculation?.itemScores?.length) {
      return "Chưa có dữ liệu điểm";
    }

    const numerator = currentCalculation.itemScores
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

    if (rule?.calculation_type === "average") {
      return `(${numerator}) ÷ ${currentCalculation.itemScores.length}`;
    }

    if (rule?.calculation_type === "weighted_average") {
      return `(${numerator}) ÷ ${formatScore(
        currentCalculation.totalWeight || totalWeight,
        1,
      )}`;
    }

    return numerator;
  }, [currentCalculation, rule, totalWeight]);

  /* =========================================================
     8. STATUS CONFIG
  ========================================================= */

  const statusConfig = {
    passed: {
      icon: <CheckCircleOutlined />,
    },

    pass: {
      icon: <CheckCircleOutlined />,
    },

    failed: {
      icon: <CloseCircleOutlined />,
    },

    fail: {
      icon: <CloseCircleOutlined />,
    },

    pending: {
      icon: <ClockCircleOutlined />,
    },
  };

  const annualStatusConfig = statusConfig[annualStatus.key] || {
    icon: <ClockCircleOutlined />,
  };

  const currentStatusConfig = statusConfig[currentStatus.key] || {
    icon: <ClockCircleOutlined />,
  };

  /* =========================================================
     9. TABLE COLUMNS
  ========================================================= */

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
        const item = ruleItems.find(
          (value) => Number(value.id) === Number(record.grading_rule_item_id),
        );

        return (
          <div className="student-result-item-cell">
            <Text strong>{item?.name || record.item_name || "Đầu điểm"}</Text>

            <span>Hệ số {item?.weight ?? record.item_weight ?? 1}</span>
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
              onClick={() => onEdit?.(record)}
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
            onConfirm={() => onDelete?.(record.id)}
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

  /* =========================================================
     10. TAB ITEMS
  ========================================================= */

  const tabItems = [
    {
      key: "1",
      label: (
        <div className="student-result-tab-label">
          <span>Học kỳ 1</span>

          <span className="student-result-tab-count">
            {semesterResults["1"].length}
          </span>
        </div>
      ),
    },

    {
      key: "2",
      label: (
        <div className="student-result-tab-label">
          <span>Học kỳ 2</span>

          <span className="student-result-tab-count">
            {semesterResults["2"].length}
          </span>
        </div>
      ),
    },
  ];

  /* =========================================================
     11. RENDER
  ========================================================= */

  return (
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

        {/* ĐIỂM TRUNG BÌNH CẢ NĂM */}

        <div className="student-result-final">
          <div className="student-result-final-label">
            ĐIỂM TRUNG BÌNH CẢ NĂM
          </div>

          <div className="student-result-final-row">
            {annualScore === null ? (
              <strong className="student-result-final-score pending">—</strong>
            ) : (
              <strong
                className={`student-result-final-score ${annualStatus.key}`}
              >
                {formatScore(annualScore, digits)}
              </strong>
            )}

            <Tag
              bordered={false}
              icon={annualStatusConfig.icon}
              className={`student-result-status ${annualStatus.key}`}
            >
              {annualScore === null ? "Chưa đủ điểm" : annualStatus.label}
            </Tag>
          </div>

          <div className="student-result-pass-info">
            (Điểm HK1 + Điểm HK2) / 2
          </div>
        </div>
      </div>

      {/* =====================================================
          ANNUAL SUMMARY
      ===================================================== */}

      <div className="student-result-annual-summary">
        <div className="student-result-semester-card">
          <div className="student-result-semester-card-label">
            ĐIỂM HỌC KỲ 1
          </div>

          <div className="student-result-semester-card-score">
            {hasValidScore(calculationHK1?.score)
              ? formatScore(calculationHK1.score, digits)
              : "—"}
          </div>

          <div className="student-result-semester-card-count">
            {semesterResults["1"].length} lần nhập điểm
          </div>
        </div>

        <div className="student-result-annual-operator">+</div>

        <div className="student-result-semester-card">
          <div className="student-result-semester-card-label">
            ĐIỂM HỌC KỲ 2
          </div>

          <div className="student-result-semester-card-score">
            {hasValidScore(calculationHK2?.score)
              ? formatScore(calculationHK2.score, digits)
              : "—"}
          </div>

          <div className="student-result-semester-card-count">
            {semesterResults["2"].length} lần nhập điểm
          </div>
        </div>

        <div className="student-result-annual-equals">=</div>

        <div className="student-result-semester-card annual">
          <div className="student-result-semester-card-label">
            TRUNG BÌNH CẢ NĂM
          </div>

          <div className="student-result-semester-card-score">
            {annualScore === null ? "—" : formatScore(annualScore, digits)}
          </div>

          <div className="student-result-semester-card-count">
            {annualScore === null ? "Chưa đủ hai học kỳ" : "Đã hoàn thành"}
          </div>
        </div>
      </div>

      {/* =====================================================
          SEMESTER TABS
      ===================================================== */}

      <div className="student-result-semester-section">
        <div className="student-result-history-header">
          <div className="student-result-history-title">
            <div className="student-result-history-icon">
              <FileTextOutlined />
            </div>

            <div>
              <div className="student-result-history-name">
                Bảng điểm theo học kỳ
              </div>

              <div className="student-result-history-subtitle">
                Xem điểm và kết quả từng học kỳ riêng biệt
              </div>
            </div>
          </div>
        </div>

        <Tabs
          activeKey={activeSemester}
          onChange={setActiveSemester}
          items={tabItems}
          className="student-result-semester-tabs"
        />

        {/* =====================================================
            CURRENT SEMESTER SCORE
        ===================================================== */}

        <div className="student-result-current-summary">
          <div className="student-result-current-summary-left">
            <div className="student-result-current-label">
              ĐIỂM TỔNG KẾT HỌC KỲ {activeSemester}
            </div>

            <div className="student-result-current-score">
              {hasValidScore(currentCalculation?.score)
                ? formatScore(currentCalculation.score, digits)
                : "—"}
            </div>
          </div>

          <Tag
            bordered={false}
            icon={currentStatusConfig.icon}
            className={`student-result-status ${currentStatus.key}`}
          >
            {hasValidScore(currentCalculation?.score)
              ? currentStatus.label
              : "Chưa có điểm"}
          </Tag>
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
                    Cách tính điểm học kỳ {activeSemester}
                  </div>

                  <div className="student-result-section-subtitle">
                    {rule.calculation_type === "weighted_average"
                      ? "Trung bình có hệ số"
                      : "Theo quy tắc tính điểm"}
                  </div>
                </div>
              </div>
            </div>

            <div className="student-result-formula-box">
              <div className="student-result-formula-label">CÔNG THỨC</div>

              <div className="student-result-formula">{formula}</div>

              {hasValidScore(currentCalculation?.score) && (
                <div className="student-result-formula-result">
                  ={" "}
                  <strong>
                    {formatScore(currentCalculation.score, digits)}
                  </strong>{" "}
                  điểm
                </div>
              )}
            </div>

            {currentCalculation?.itemScores?.length > 0 && (
              <div className="student-result-components">
                {currentCalculation.itemScores.map((item, index) => (
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
            </div>
          </div>
        )}

        {/* =====================================================
            HISTORY TABLE
        ===================================================== */}

        <div className="student-result-table-heading">
          <span>Chi tiết điểm học kỳ {activeSemester}</span>

          <span className="student-result-history-count">
            {currentResults.length} lần nhập
          </span>
        </div>

        <div className="student-result-table">
          <Table
            columns={detailColumns}
            dataSource={currentResults}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 8,
              hideOnSinglePage: true,
              showSizeChanger: false,
            }}
            size="middle"
            scroll={{ x: 750 }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={`Chưa có điểm học kỳ ${activeSemester}`}
                />
              ),
            }}
          />
        </div>
      </div>

      {/* =====================================================
          UNKNOWN NOTES
      ===================================================== */}

      {semesterResults.unknown.length > 0 && (
        <div className="student-result-unknown-warning">
          <ClockCircleOutlined />
          Có {semesterResults.unknown.length} kết quả chưa xác định được học kỳ
          vì ghi chú không có thông tin Học kỳ 1 hoặc Học kỳ 2. Những kết quả
          này chưa được đưa vào điểm trung bình học kỳ.
        </div>
      )}

      {/* =====================================================
          STYLE
      ===================================================== */}

      <style>{`
        .student-result-modal .ant-modal-content {
          padding: 0;
          overflow: hidden;
          border-radius: 20px;
          background: #fff;
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

        .student-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          padding: 24px 28px;
          background: linear-gradient(135deg, #f8fafc, #fff);
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
          border: 3px solid #fff;
          box-shadow: 0 3px 10px rgba(15,23,42,.08);
        }

        .student-result-name {
          color: #173b5e;
          font-size: 19px;
          font-weight: 800;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .student-result-code {
          margin-top: 4px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
        }

        .student-result-final {
          padding-right: 35px;
          text-align: right;
        }

        .student-result-final-label,
        .student-result-semester-card-label,
        .student-result-current-label {
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .08em;
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
          line-height: 1.3;
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
          margin-top: 4px;
          color: #94a3b8;
          font-size: 11px;
        }

        /* Annual summary */

        .student-result-annual-summary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          margin: 20px 28px 0;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #f8fafc;
        }

        .student-result-semester-card {
          flex: 1;
          min-width: 0;
          padding: 12px;
          border: 1px solid #e8edf3;
          border-radius: 11px;
          background: #fff;
          text-align: center;
        }

        .student-result-semester-card.annual {
          border-color: #ead9a8;
          background: #fffcf3;
        }

        .student-result-semester-card-score {
          margin: 5px 0;
          color: #173b5e;
          font-size: 25px;
          font-weight: 900;
        }

        .student-result-semester-card.annual
          .student-result-semester-card-score {
          color: #b88618;
        }

        .student-result-semester-card-count {
          color: #94a3b8;
          font-size: 10px;
        }

        .student-result-annual-operator,
        .student-result-annual-equals {
          color: #94a3b8;
          font-size: 19px;
          font-weight: 800;
        }

        /* Semester section */

        .student-result-semester-section {
          margin: 20px 28px 24px;
        }

        .student-result-history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
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

        .student-result-semester-tabs .ant-tabs-nav {
          margin-bottom: 14px;
        }

        .student-result-semester-tabs .ant-tabs-tab {
          padding: 10px 15px;
          font-weight: 700;
        }

        .student-result-tab-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .student-result-tab-count {
          min-width: 21px;
          padding: 2px 6px;
          border-radius: 20px;
          background: #eef3f8;
          color: #64748b;
          font-size: 10px;
          text-align: center;
        }

        .student-result-current-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 16px;
          margin-bottom: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
          background: #f8fafc;
        }

        .student-result-current-score {
          margin-top: 3px;
          color: #173b5e;
          font-size: 25px;
          font-weight: 900;
        }

        /* Formula */

        .student-result-formula-section {
          margin-bottom: 17px;
          padding: 17px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #fff;
        }

        .student-result-section-heading {
          display: flex;
          align-items: center;
          margin-bottom: 14px;
        }

        .student-result-section-heading-left {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .student-result-section-icon {
          width: 36px;
          height: 36px;
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
        }

        .student-result-formula-box {
          padding: 16px;
          border: 1px solid #dbe5ef;
          border-radius: 12px;
          background: linear-gradient(135deg, #f8fafc, #fff);
          text-align: center;
        }

        .student-result-formula-label {
          margin-bottom: 7px;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .12em;
        }

        .student-result-formula {
          color: #173b5e;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .student-result-formula-result {
          margin-top: 5px;
          color: #64748b;
          font-size: 13px;
        }

        .student-result-formula-result strong {
          color: #16a34a;
          font-size: 16px;
          font-weight: 900;
        }

        /* Components */

        .student-result-components {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
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

        .student-result-rule-meta {
          display: flex;
          align-items: center;
          margin-top: 13px;
          padding-top: 13px;
          border-top: 1px solid #eef2f6;
        }

        .student-result-rule-meta > div:not(.student-result-rule-divider) {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .student-result-rule-meta span {
          color: #94a3b8;
          font-size: 11px;
        }

        .student-result-rule-meta strong {
          color: #334155;
          font-size: 12px;
        }

        .student-result-rule-divider {
          width: 1px;
          height: 18px;
          margin: 0 16px;
          background: #e2e8f0;
        }

        /* Table */

        .student-result-table-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 16px 0 10px;
          color: #173b5e;
          font-size: 13px;
          font-weight: 800;
        }

        .student-result-history-count {
          padding: 5px 9px;
          border-radius: 7px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
        }

        .student-result-table {
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
          border-bottom: 1px solid #e5eaf0;
        }

        .student-result-table .ant-table-tbody > tr > td {
          padding: 10px 12px;
          border-bottom-color: #f0f2f5;
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

        .student-result-item-cell span,
        .student-result-date,
        .student-result-note {
          color: #94a3b8;
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

        .student-result-unknown-warning {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 0 28px 22px;
          padding: 11px 13px;
          border: 1px solid #f3dfad;
          border-radius: 9px;
          background: #fffcf3;
          color: #946b13;
          font-size: 11px;
          line-height: 1.6;
        }

        /* Responsive */

        @media (max-width: 767px) {
          .student-result-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 16px;
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

          .student-result-annual-summary {
            gap: 6px;
            margin: 15px 12px 0;
            padding: 9px 6px;
          }

          .student-result-semester-card {
            padding: 9px 4px;
          }

          .student-result-semester-card-label {
            font-size: 8px;
          }

          .student-result-semester-card-score {
            font-size: 19px;
          }

          .student-result-semester-card-count {
            font-size: 9px;
          }

          .student-result-annual-operator,
          .student-result-annual-equals {
            font-size: 14px;
          }

          .student-result-semester-section {
            margin: 18px 14px;
          }

          .student-result-components {
            grid-template-columns: 1fr;
          }

          .student-result-rule-meta {
            flex-wrap: wrap;
            gap: 8px;
          }

          .student-result-rule-divider {
            margin: 0 5px;
          }

          .student-result-unknown-warning {
            margin: 0 14px 18px;
          }
        }

        @media (max-width: 380px) {
          .student-result-annual-summary {
            gap: 3px;
            margin-left: 8px;
            margin-right: 8px;
          }

          .student-result-semester-card-label {
            font-size: 7px;
          }

          .student-result-semester-card-score {
            font-size: 17px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default StudentResultModal;
