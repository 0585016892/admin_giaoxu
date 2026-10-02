import React, { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Divider, Modal, Space, Typography } from "antd";
import {
  DownloadOutlined,
  FileExcelOutlined,
  CheckOutlined,
  ClearOutlined,
  TeamOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import studentApi from "../../../../api/studentApi";
import { useNotification } from "../../../../components/notification";

const { Text } = Typography;

/**
 * =========================================================
 * EXPORT FIELD CONFIG
 * =========================================================
 */

export const STUDENT_EXPORT_GROUPS = [
  {
    key: "basic",
    label: "Thông tin cơ bản",
    icon: <TeamOutlined />,
    fields: [
      {
        key: "code",
        label: "Mã học sinh",
        default: true,
      },
      {
        key: "name",
        label: "Họ và tên",
        default: true,
      },
      {
        key: "date_of_birth",
        label: "Ngày sinh",
        default: true,
      },
      {
        key: "gender",
        label: "Giới tính",
        default: true,
      },
      {
        key: "nationality",
        label: "Quốc tịch",
      },
      {
        key: "birth_place",
        label: "Nơi sinh",
      },
      {
        key: "saint_name",
        label: "Tên thánh",
      },
    ],
  },

  {
    key: "class",
    label: "Thông tin lớp",
    icon: <DatabaseOutlined />,
    fields: [
      {
        key: "class_code",
        label: "Mã lớp",
        default: true,
      },
      {
        key: "class_name",
        label: "Tên lớp",
        default: true,
      },
      {
        key: "class_student_status",
        label: "Trạng thái học",
      },
      {
        key: "joined_at",
        label: "Ngày vào lớp",
      },
    ],
  },

  {
    key: "contact",
    label: "Thông tin liên hệ",
    fields: [
      {
        key: "phone",
        label: "Số điện thoại",
      },
      {
        key: "email",
        label: "Email",
      },
      {
        key: "address",
        label: "Địa chỉ",
      },
      {
        key: "parish",
        label: "Giáo xứ",
      },
    ],
  },

  {
    key: "guardian",
    label: "Thông tin phụ huynh",
    fields: [
      {
        key: "father_name",
        label: "Tên cha",
      },
      {
        key: "father_phone",
        label: "SĐT cha",
      },
      {
        key: "mother_name",
        label: "Tên mẹ",
      },
      {
        key: "mother_phone",
        label: "SĐT mẹ",
      },
      {
        key: "guardian_name",
        label: "Người giám hộ",
      },
      {
        key: "guardian_phone",
        label: "SĐT người giám hộ",
      },
      {
        key: "guardian_relationship",
        label: "Quan hệ giám hộ",
      },
    ],
  },

  {
    key: "baptism",
    label: "Thông tin Rửa tội",
    icon: <SafetyCertificateOutlined />,
    fields: [
      {
        key: "baptism_certificate_no",
        label: "Số chứng chỉ Rửa tội",
      },
      {
        key: "baptism_date",
        label: "Ngày Rửa tội",
      },
      {
        key: "baptism_name",
        label: "Tên Rửa tội",
      },
      {
        key: "baptism_parish",
        label: "Giáo xứ Rửa tội",
      },
      {
        key: "baptism_place",
        label: "Nơi Rửa tội",
      },
    ],
  },

  {
    key: "confirmation",
    label: "Thông tin Thêm sức",
    fields: [
      {
        key: "confirmation_date",
        label: "Ngày Thêm sức",
      },
      {
        key: "confirmation_place",
        label: "Nơi Thêm sức",
      },
      {
        key: "confirmation_saint_name",
        label: "Tên thánh Thêm sức",
      },
    ],
  },

  {
    key: "communion",
    label: "Thông tin Rước lễ lần đầu",
    fields: [
      {
        key: "first_communion_date",
        label: "Ngày Rước lễ lần đầu",
      },
      {
        key: "first_communion_place",
        label: "Nơi Rước lễ lần đầu",
      },
    ],
  },

  {
    key: "other",
    label: "Thông tin khác",
    fields: [
      {
        key: "catechism_level",
        label: "Cấp giáo lý",
      },
      {
        key: "catechism_status",
        label: "Trạng thái giáo lý",
      },
      {
        key: "enrollment_date",
        label: "Ngày nhập học",
      },
      {
        key: "note",
        label: "Ghi chú",
      },
      {
        key: "status",
        label: "Trạng thái",
      },
    ],
  },
];

/**
 * =========================================================
 * DEFAULT FIELDS
 * =========================================================
 */

const getDefaultFields = () => {
  return STUDENT_EXPORT_GROUPS.flatMap((group) =>
    group.fields.filter((field) => field.default).map((field) => field.key),
  );
};

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const StudentExportModal = ({ open, onCancel, selectedStudentIds = [] }) => {
  const notify = useNotification();
  const [selectedFields, setSelectedFields] = useState(getDefaultFields());

  const [exporting, setExporting] = useState(false);

  /**
   * =======================================================
   * RESET
   * =======================================================
   */

  useEffect(() => {
    if (open) {
      setSelectedFields(getDefaultFields());
    }
  }, [open]);

  /**
   * =======================================================
   * ALL FIELDS
   * =======================================================
   */

  const allFields = useMemo(() => {
    return STUDENT_EXPORT_GROUPS.flatMap((group) =>
      group.fields.map((field) => field.key),
    );
  }, []);

  /**
   * =======================================================
   * ACTIONS
   * =======================================================
   */

  const selectAll = () => {
    setSelectedFields(allFields);
  };

  const clearAll = () => {
    setSelectedFields([]);
  };

  const toggleField = (fieldKey, checked) => {
    setSelectedFields((prev) => {
      if (checked) {
        if (prev.includes(fieldKey)) {
          return prev;
        }

        return [...prev, fieldKey];
      }

      return prev.filter((key) => key !== fieldKey);
    });
  };

  const toggleGroup = (group, checked) => {
    const groupKeys = group.fields.map((field) => field.key);

    setSelectedFields((prev) => {
      if (checked) {
        return [...prev, ...groupKeys.filter((key) => !prev.includes(key))];
      }

      return prev.filter((key) => !groupKeys.includes(key));
    });
  };

  const getGroupState = (group) => {
    const groupKeys = group.fields.map((field) => field.key);

    const selectedCount = groupKeys.filter((key) =>
      selectedFields.includes(key),
    ).length;

    return {
      checked: groupKeys.length > 0 && selectedCount === groupKeys.length,

      indeterminate: selectedCount > 0 && selectedCount < groupKeys.length,
    };
  };

  /**
   * =======================================================
   * EXPORT EXCEL
   * =======================================================
   */

  const handleExport = async () => {
    if (!selectedStudentIds.length) {
      notify.warning("Vui lòng chọn học sinh");
      return;
    }

    if (!selectedFields.length) {
      notify.warning("Vui lòng chọn ít nhất một thông tin");
      return;
    }

    try {
      setExporting(true);

      const response = await studentApi.exportExcel({
        studentIds: selectedStudentIds,
        fields: selectedFields,
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      const contentDisposition = response.headers?.["content-disposition"];

      let filename = `danh_sach_hoc_sinh_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/i);

        if (match?.[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      link.setAttribute("download", filename);

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      notify.success(`Đã xuất ${selectedStudentIds.length} học sinh`);

      onCancel?.();
    } catch (error) {
      let errorMessage =
        error?.response?.data?.message || "Không thể xuất danh sách học sinh";

      try {
        if (error?.response?.data instanceof Blob) {
          const text = await error.response.data.text();

          const json = JSON.parse(text);

          if (json?.message) {
            errorMessage = json.message;
          }
        }
      } catch (parseError) {}

      notify.error(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  /**
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <>
      <Modal
        open={open}
        onCancel={onCancel}
        width={820}
        centered
        destroyOnClose
        className="student-export-modal-wrapper"
        title={
          <div className="student-export-header">
            <div className="student-export-header-icon">
              <FileExcelOutlined />
            </div>

            <div className="student-export-header-content">
              <div className="student-export-header-title">
                Xuất danh sách học sinh
              </div>

              <div className="student-export-header-description">
                Chọn các thông tin cần xuất sang Excel
              </div>
            </div>
          </div>
        }
        footer={
          <div className="student-export-footer">
            <div className="student-export-footer-info">
              <span className="student-export-footer-dot" />
              <span>{selectedStudentIds.length} học sinh được chọn</span>
            </div>

            <Space>
              <Button onClick={onCancel} disabled={exporting}>
                Hủy
              </Button>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={exporting}
                disabled={
                  selectedStudentIds.length === 0 || selectedFields.length === 0
                }
                onClick={handleExport}
              >
                {exporting ? "Đang xuất..." : "Xuất Excel"}
              </Button>
            </Space>
          </div>
        }
      >
        <div className="student-export">
          {/* ================================================= */}
          {/* SUMMARY */}
          {/* ================================================= */}

          <div className="student-export-summary">
            <div className="student-export-summary-card student-count">
              <div className="student-export-summary-icon">
                <TeamOutlined />
              </div>

              <div className="student-export-summary-content">
                <div className="student-export-summary-label">
                  Học sinh được chọn
                </div>

                <div className="student-export-summary-value">
                  {selectedStudentIds.length}
                </div>

                <div className="student-export-summary-note">
                  Sẽ được xuất ra Excel
                </div>
              </div>
            </div>

            <div className="student-export-summary-card field-count">
              <div className="student-export-summary-icon">
                <DatabaseOutlined />
              </div>

              <div className="student-export-summary-content">
                <div className="student-export-summary-label">
                  Trường dữ liệu
                </div>

                <div className="student-export-summary-value">
                  {selectedFields.length}
                  <span> / {allFields.length}</span>
                </div>

                <div className="student-export-summary-note">
                  Thông tin được chọn
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* TOOLBAR */}
          {/* ================================================= */}

          <div className="student-export-toolbar">
            <div>
              <div className="student-export-toolbar-title">Nội dung xuất</div>

              <div className="student-export-toolbar-description">
                Chọn từng trường hoặc chọn toàn bộ nhóm thông tin
              </div>
            </div>

            <div className="student-export-toolbar-actions">
              <Button
                size="small"
                icon={<CheckOutlined />}
                onClick={selectAll}
                disabled={selectedFields.length === allFields.length}
              >
                Chọn tất cả
              </Button>

              <Button
                size="small"
                icon={<ClearOutlined />}
                onClick={clearAll}
                disabled={selectedFields.length === 0}
              >
                Bỏ chọn
              </Button>
            </div>
          </div>

          <Divider className="student-export-divider" />

          {/* ================================================= */}
          {/* GROUPS */}
          {/* ================================================= */}

          <div className="student-export-groups">
            {STUDENT_EXPORT_GROUPS.map((group) => {
              const groupState = getGroupState(group);

              return (
                <div key={group.key} className="student-export-group">
                  {/* GROUP HEADER */}

                  <div className="student-export-group-header">
                    <Checkbox
                      checked={groupState.checked}
                      indeterminate={groupState.indeterminate}
                      onChange={(e) => toggleGroup(group, e.target.checked)}
                    >
                      <span className="student-export-group-checkbox-label" />
                    </Checkbox>

                    <div className="student-export-group-icon">
                      {group.icon || <DatabaseOutlined />}
                    </div>

                    <div className="student-export-group-info">
                      <div className="student-export-group-title">
                        {group.label}
                      </div>

                      <div className="student-export-group-count">
                        {group.fields.length} trường thông tin
                      </div>
                    </div>

                    <div className="student-export-group-selected">
                      {
                        group.fields.filter((field) =>
                          selectedFields.includes(field.key),
                        ).length
                      }
                      /{group.fields.length}
                    </div>
                  </div>

                  {/* FIELDS */}

                  <div className="student-export-fields">
                    {group.fields.map((field) => {
                      const checked = selectedFields.includes(field.key);

                      return (
                        <label
                          key={field.key}
                          className={`student-export-field ${
                            checked ? "is-selected" : ""
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onChange={(e) =>
                              toggleField(field.key, e.target.checked)
                            }
                          />

                          <span className="student-export-field-label">
                            {field.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================================================= */}
          {/* INFO */}
          {/* ================================================= */}

          <div className="student-export-info">
            <div className="student-export-info-icon">
              <SafetyCertificateOutlined />
            </div>

            <div>
              <div className="student-export-info-title">Bảo mật dữ liệu</div>

              <Text type="secondary">
                Chỉ những học sinh bạn đã chọn mới được xuất. Dữ liệu được lấy
                trực tiếp từ giáo xứ hiện tại.
              </Text>
            </div>
          </div>
        </div>
      </Modal>

      {/* =====================================================
          INLINE CSS
      ===================================================== */}

      <style>{`
        /* =====================================================
           MODAL
        ===================================================== */

        .student-export-modal-wrapper .ant-modal-content {
          padding: 0;
          overflow: hidden;
          border-radius: 18px;
          background: #ffffff;
          box-shadow:
            0 20px 60px rgba(23, 59, 94, 0.16),
            0 4px 16px rgba(15, 23, 42, 0.06);
        }

        .student-export-modal-wrapper .ant-modal-header {
          margin: 0;
          padding: 22px 26px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .student-export-modal-wrapper .ant-modal-body {
          padding: 0;
          max-height: calc(100vh - 250px);
          overflow-y: auto;
        }

        .student-export-modal-wrapper .ant-modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .student-export-modal-wrapper .ant-modal-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .student-export-modal-wrapper .ant-modal-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .student-export-modal-wrapper .ant-modal-footer {
          margin: 0;
          padding: 16px 26px;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .student-export-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .student-export-header-icon {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #ffffff;
          background: linear-gradient(
            135deg,
            #173b5e 0%,
            #245b89 100%
          );
          font-size: 21px;
          box-shadow: 0 6px 16px rgba(23, 59, 94, 0.18);
        }

        .student-export-header-content {
          min-width: 0;
        }

        .student-export-header-title {
          color: #173b5e;
          font-size: 18px;
          line-height: 24px;
          font-weight: 700;
          letter-spacing: -0.2px;
        }

        .student-export-header-description {
          margin-top: 2px;
          color: #64748b;
          font-size: 13px;
          font-weight: 400;
        }

        /* =====================================================
           MAIN
        ===================================================== */

        .student-export {
          padding: 22px 26px 24px;
        }

        /* =====================================================
           SUMMARY
        ===================================================== */

        .student-export-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .student-export-summary-card {
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 92px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #f8fafc;
        }

        .student-export-summary-card.student-count {
          border-color: #d9e5f0;
          background: #f5f9fc;
        }

        .student-export-summary-card.field-count {
          border-color: #eadfbe;
          background: #fffdf7;
        }

        .student-export-summary-icon {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          color: #173b5e;
          background: #e7eff6;
          font-size: 19px;
        }

        .field-count .student-export-summary-icon {
          color: #9a701d;
          background: #f7edcf;
        }

        .student-export-summary-content {
          min-width: 0;
        }

        .student-export-summary-label {
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
        }

        .student-export-summary-value {
          margin-top: 2px;
          color: #173b5e;
          font-size: 25px;
          line-height: 30px;
          font-weight: 750;
        }

        .student-export-summary-value span {
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
        }

        .student-export-summary-note {
          margin-top: 1px;
          color: #94a3b8;
          font-size: 11px;
        }

        /* =====================================================
           TOOLBAR
        ===================================================== */

        .student-export-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 22px;
        }

        .student-export-toolbar-title {
          color: #1e293b;
          font-size: 14px;
          font-weight: 700;
        }

        .student-export-toolbar-description {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 12px;
        }

        .student-export-toolbar-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .student-export-toolbar-actions .ant-btn {
          border-radius: 8px;
          font-size: 12px;
        }

        .student-export-divider {
          margin: 14px 0 16px;
          border-color: #e2e8f0;
        }

        /* =====================================================
           GROUPS
        ===================================================== */

        .student-export-groups {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .student-export-group {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #ffffff;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .student-export-group:hover {
          border-color: #c8d5e2;
          box-shadow: 0 5px 16px rgba(15, 23, 42, 0.045);
        }

        .student-export-group-header {
          display: flex;
          align-items: center;
          min-height: 62px;
          padding: 10px 13px;
          border-bottom: 1px solid #eef2f6;
          background: #fafbfc;
        }

        .student-export-group-header
          .ant-checkbox-wrapper {
          margin-right: 2px;
        }

        .student-export-group-icon {
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 9px;
          border-radius: 8px;
          color: #173b5e;
          background: #edf3f8;
          font-size: 14px;
        }

        .student-export-group-info {
          min-width: 0;
          flex: 1;
        }

        .student-export-group-title {
          display: block;
          color: #1e293b;
          font-size: 13px;
          line-height: 18px;
          font-weight: 650;
        }

        .student-export-group-count {
          margin-top: 1px;
          color: #94a3b8;
          font-size: 10px;
        }

        .student-export-group-selected {
          flex-shrink: 0;
          margin-left: 8px;
          padding: 3px 7px;
          border-radius: 999px;
          color: #64748b;
          background: #f1f5f9;
          font-size: 10px;
          font-weight: 600;
        }

        /* =====================================================
           FIELDS
        ===================================================== */

        .student-export-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          padding: 10px;
        }

        .student-export-field {
          display: flex;
          align-items: center;
          min-height: 36px;
          padding: 6px 8px;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          user-select: none;
          transition:
            background 0.16s ease,
            border-color 0.16s ease;
        }

        .student-export-field:hover {
          background: #f8fafc;
        }

        .student-export-field.is-selected {
          border-color: #dbe7f0;
          background: #f4f8fb;
        }

        .student-export-field .ant-checkbox {
          flex-shrink: 0;
        }

        .student-export-field-label {
          margin-left: 8px;
          overflow: hidden;
          color: #475569;
          font-size: 12px;
          line-height: 17px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .student-export-field.is-selected
          .student-export-field-label {
          color: #173b5e;
          font-weight: 550;
        }

        /* =====================================================
           INFO
        ===================================================== */

        .student-export-info {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-top: 18px;
          padding: 12px 14px;
          border: 1px solid #e5eaf0;
          border-radius: 11px;
          background: #f8fafc;
        }

        .student-export-info-icon {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #173b5e;
          background: #e9f0f6;
          font-size: 13px;
        }

        .student-export-info-title {
          margin-bottom: 2px;
          color: #334155;
          font-size: 12px;
          font-weight: 650;
        }

        .student-export-info .ant-typography {
          display: block;
          font-size: 11px;
          line-height: 17px;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .student-export-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .student-export-footer-info {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #64748b;
          font-size: 12px;
        }

        .student-export-footer-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d9a441;
          box-shadow: 0 0 0 3px #f8eed5;
        }

        .student-export-footer .ant-btn {
          min-width: 82px;
          height: 36px;
          border-radius: 8px;
          font-size: 13px;
        }

        .student-export-footer
          .ant-btn-primary:not(:disabled) {
          background: #173b5e;
          border-color: #173b5e;
          box-shadow: 0 5px 12px rgba(23, 59, 94, 0.15);
        }

        .student-export-footer
          .ant-btn-primary:not(:disabled):hover {
          background: #214d75;
          border-color: #214d75;
        }

        /* =====================================================
           CHECKBOX
        ===================================================== */

        .student-export-modal-wrapper
          .ant-checkbox-checked
          .ant-checkbox-inner {
          background-color: #173b5e;
          border-color: #173b5e;
        }

        .student-export-modal-wrapper
          .ant-checkbox-indeterminate
          .ant-checkbox-inner:after {
          background-color: #173b5e;
        }

        .student-export-modal-wrapper
          .ant-checkbox-wrapper:hover
          .ant-checkbox-inner,
        .student-export-modal-wrapper
          .ant-checkbox:hover
          .ant-checkbox-inner {
          border-color: #173b5e;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 768px) {
          .student-export-modal-wrapper {
            margin: 0 auto;
            max-width: calc(100vw - 24px);
          }

          .student-export-modal-wrapper .ant-modal-header {
            padding: 17px 18px;
          }

          .student-export {
            padding: 17px 18px 20px;
          }

          .student-export-summary {
            grid-template-columns: 1fr;
            gap: 9px;
          }

          .student-export-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .student-export-toolbar-actions {
            width: 100%;
          }

          .student-export-toolbar-actions .ant-btn {
            flex: 1;
          }

          .student-export-groups {
            grid-template-columns: 1fr;
          }

          .student-export-footer {
            align-items: stretch;
            flex-direction: column;
          }

          .student-export-footer-info {
            display: none;
          }

          .student-export-footer .ant-space {
            width: 100%;
          }

          .student-export-footer .ant-space-item {
            flex: 1;
          }

          .student-export-footer .ant-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .student-export-modal-wrapper {
            max-width: calc(100vw - 12px);
          }

          .student-export-modal-wrapper .ant-modal-header {
            padding: 15px;
          }

          .student-export {
            padding: 14px 15px 17px;
          }

          .student-export-header-icon {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
            font-size: 18px;
          }

          .student-export-header-title {
            font-size: 16px;
          }

          .student-export-header-description {
            font-size: 11px;
          }

          .student-export-summary-card {
            min-height: 78px;
            padding: 12px;
          }

          .student-export-summary-value {
            font-size: 22px;
          }

          .student-export-fields {
            grid-template-columns: 1fr;
          }

          .student-export-group-header {
            padding: 9px 10px;
          }

          .student-export-field {
            min-height: 38px;
          }
        }
      `}</style>
    </>
  );
};

export default StudentExportModal;
