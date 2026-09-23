import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Select,
  Space,
  Typography,
  Alert,
  Progress,
  Divider,
  Button,
  message,
} from "antd";
import { TeamOutlined, FileZipOutlined, EyeOutlined } from "@ant-design/icons";
import StudentCertificateTable from "./StudentCertificateTable";

const { Text } = Typography;

const COLORS = {
  navy: "#173B5E",
  navyHover: "#244F78",
  gold: "#D9A441",
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#173B5E",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  navyLight: "#EEF3F7",
  goldLight: "#FBF5E7",
};

/* =========================================================
   RESPONSE
========================================================= */

const getResponseData = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) return response;

  if (Array.isArray(response.data)) return response.data;

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.rows)) return response.rows;

  if (Array.isArray(response.students)) {
    return response.students;
  }

  if (Array.isArray(response.data?.students)) {
    return response.data.students;
  }

  return [];
};

/* =========================================================
   VALUE
========================================================= */

const getValue = (obj, keys, fallback = "") => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== "") {
      return obj[key];
    }
  }

  return fallback;
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const text = value.trim();

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
      return text;
    }

    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
  }

  return value;
};

/* =========================================================
   NORMALIZE CLASS
========================================================= */

const normalizeClass = (item, index) => {
  const id = getValue(item, ["id", "class_id", "classId"], `class-${index}`);

  return {
    ...item,

    _key: String(id),

    id,

    code: getValue(item, ["code", "class_code", "classCode", "ma_lop"], ""),

    name: getValue(
      item,
      ["name", "class_name", "className", "ten_lop"],
      `Lớp ${index + 1}`,
    ),
  };
};

/* =========================================================
   NORMALIZE STUDENT
========================================================= */

const normalizeStudent = (item, index) => {
  const studentId = getValue(item, ["student_id", "studentId", "id"], "");

  const code = getValue(item, ["student_code", "studentCode", "code"], "");

  const fullName = getValue(
    item,
    ["full_name", "fullName", "name", "student_name", "studentName"],
    "",
  );

  const godName = getValue(
    item,
    ["god_name", "saint_name", "ten_thanh", "tenThanh"],
    "",
  );

  const dob = getValue(
    item,
    ["dob", "date_of_birth", "birth_date", "ngay_sinh"],
    "",
  );

  const classId = getValue(
    item,
    ["class_id", "classId", "catechist_class_id"],
    "",
  );

  const className = getValue(item, ["class_name", "className", "ten_lop"], "");

  return {
    ...item,

    _key: String(studentId || code || `${classId}-${index}`),

    id: studentId,

    code,

    fullName,

    godName,

    dob: formatDate(dob),

    classId,

    className,

    // Chỉ lưu để tham khảo.
    // Không sử dụng làm xếp loại cấp chứng chỉ.
    originalRank: getValue(item, ["rank", "rank_level", "xep_loai"], ""),

    // Xếp loại của đợt cấp hiện tại
    rank: "",
  };
};

/* =========================================================
   COMPONENT
========================================================= */

const ClassCertificateModal = ({
  open,
  onClose,
  classApi,
  studentApi,
  onPreviewStudent,
  onBatchExport,
  exporting = false,
  batchExporting = false,
  exportProgress = 0,
}) => {
  const [loading, setLoading] = useState(false);

  const [classes, setClasses] = useState([]);

  /*
   * Không reset khi modal đóng/mở.
   *
   * Đây là state phiên cấp chứng chỉ.
   */
  const [selectedClassId, setSelectedClassId] = useState(null);

  const [students, setStudents] = useState([]);

  const [selectedStudentKey, setSelectedStudentKey] = useState(null);

  /* =======================================================
     LOAD CLASS
  ======================================================= */

  const loadClasses = async () => {
    setLoading(true);

    try {
      const response = await classApi.getAll();

      const data = getResponseData(response);

      const list = Array.isArray(data)
        ? data
        : data?.rows || data?.classes || [];

      setClasses(list.map(normalizeClass));
    } catch (error) {
      console.error("Load classes error:", error);

      message.error("Không thể tải danh sách lớp.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     OPEN MODAL
     
     CHỈ LOAD DANH SÁCH LỚP.
     
     KHÔNG:
     - setSelectedClassId(null)
     - setStudents([])
     ======================================================= */

  useEffect(() => {
    if (!open) return;

    loadClasses();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* =======================================================
     CLASS OPTIONS
  ======================================================= */

  const classOptions = useMemo(
    () =>
      classes.map((item) => ({
        value: String(item.id),

        label: (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: COLORS.navy,
              }}
            >
              {item.name}
            </span>

            <span
              style={{
                color: COLORS.textSecondary,
                fontSize: 12,
              }}
            >
              {item.code}
            </span>
          </div>
        ),
      })),
    [classes],
  );

  /* =======================================================
     SELECT CLASS
     
     Chỉ khi chọn LỚP KHÁC mới:
     - đổi selectedClassId
     - tải học sinh mới
     - reset selectedStudentKey
     ======================================================= */

  const handleClassChange = async (classId) => {
    if (!classId) {
      return;
    }

    const nextClassId = String(classId);

    const currentClassId =
      selectedClassId !== null && selectedClassId !== undefined
        ? String(selectedClassId)
        : null;

    /*
     * Nếu click lại đúng lớp hiện tại
     * => không gọi API lại
     * => giữ nguyên danh sách + xếp loại
     */
    if (currentClassId === nextClassId && students.length > 0) {
      return;
    }

    /*
     * Đây thực sự là chọn lớp khác.
     */
    setSelectedClassId(classId);

    setSelectedStudentKey(null);

    setLoading(true);

    try {
      const response = await studentApi.getStudentClass(classId);

      const data = getResponseData(response);

      const list = Array.isArray(data)
        ? data
        : data?.rows || data?.students || [];

      const normalizedStudents = list.map(normalizeStudent);

      setStudents(normalizedStudents);
    } catch (error) {
      console.error("Load students error:", error);

      message.error("Không thể tải học sinh của lớp.");

      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     CHANGE RANK
  ======================================================= */

  const handleRankChange = (studentKey, rank) => {
    setStudents((prev) =>
      prev.map((student) =>
        student._key === studentKey
          ? {
              ...student,
              rank,
            }
          : student,
      ),
    );
  };

  /* =======================================================
     PREVIEW
  ======================================================= */

  const handlePreview = (student) => {
    if (!student.rank) {
      message.warning("Vui lòng chọn xếp loại trước khi xem chứng chỉ.");

      return;
    }

    setSelectedStudentKey(student._key);

    onPreviewStudent(student);
  };

  /* =======================================================
     BATCH EXPORT
  ======================================================= */

  const handleBatchExport = () => {
    if (!students.length) {
      message.warning("Không có học sinh để xuất chứng chỉ.");

      return;
    }

    const missingRank = students.filter((student) => !student.rank);

    if (missingRank.length > 0) {
      message.warning(`Còn ${missingRank.length} học sinh chưa chọn xếp loại.`);

      return;
    }

    onBatchExport(students);
  };

  /* =======================================================
     SELECTED CLASS
  ======================================================= */

  const selectedClass = classes.find(
    (item) => String(item.id) === String(selectedClassId),
  );

  /* =======================================================
     CLOSE
     
     Không reset state.
     
     Người dùng:
     Chọn lớp A
     → xem học sinh
     → xem chứng chỉ
     → đóng modal
     → mở lại
     
     Vẫn ở lớp A.
  ======================================================= */

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <style>{`
        .class-cert-modal .ant-modal-content {
          border-radius: 12px;
          padding: 24px;
        }

        .class-cert-modal .ant-modal-header {
          border-bottom: 1px solid ${COLORS.border};
          margin-bottom: 16px;
          padding-bottom: 12px;
        }

        .class-cert-modal .ant-modal-title {
          font-size: 16px;
          font-weight: 700;
          color: ${COLORS.navy};
        }

        .class-selector-box {
          background: ${COLORS.background};
          padding: 16px;
          border-radius: 8px;
          border: 1px solid ${COLORS.border};
        }

        .class-summary-badges {
          margin-top: 10px;
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: ${COLORS.textSecondary};
        }

        .class-summary-badges strong {
          color: ${COLORS.navy};
          margin-left: 4px;
        }

        .class-cert-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }
      `}</style>

      <Modal
        open={open}
        onCancel={handleClose}
        width={1200}
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: COLORS.navyLight,
                color: COLORS.navy,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              <TeamOutlined />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: COLORS.navy,
                }}
              >
                Cấp chứng chỉ theo lớp
              </div>

              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textSecondary,
                }}
              >
                Chọn lớp → Kiểm tra học sinh → Xếp loại → Xuất chứng chỉ
              </Text>
            </div>
          </div>
        }
        footer={null}
        destroyOnClose={false}
        className="class-cert-modal"
      >
        <div className="class-selector-box">
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: COLORS.text,
              marginBottom: 6,
            }}
          >
            CHỌN LỚP GIÁO LÝ
          </div>

          <Select
            showSearch
            optionFilterProp="label"
            value={selectedClassId}
            options={classOptions}
            onChange={handleClassChange}
            loading={loading}
            placeholder="Chọn lớp giáo lý..."
            size="large"
            style={{
              width: "100%",
            }}
          />

          {selectedClass && (
            <div className="class-summary-badges">
              <span>
                Lớp:
                <strong>{selectedClass.name}</strong>
              </span>

              {selectedClass.code && (
                <span>
                  Mã lớp:
                  <strong>{selectedClass.code}</strong>
                </span>
              )}

              <span>
                Sĩ số:
                <strong>{students.length} học sinh</strong>
              </span>
            </div>
          )}
        </div>

        <Divider
          style={{
            margin: "16px 0",
          }}
        />

        {selectedClassId && (
          <Alert
            type="info"
            showIcon
            message="Lưu ý về xếp loại"
            description="Xếp loại chỉ áp dụng cho đợt cấp hiện tại và không làm thay đổi hồ sơ gốc của học sinh."
            style={{
              marginBottom: 16,
              borderRadius: 6,
              background: COLORS.navyLight,
              border: `1px solid ${COLORS.border}`,
            }}
          />
        )}

        <StudentCertificateTable
          students={students}
          loading={loading}
          selectedStudentKey={selectedStudentKey}
          onRankChange={handleRankChange}
          onPreview={handlePreview}
        />

        {students.length > 0 && (
          <>
            <Divider
              style={{
                margin: "16px 0",
              }}
            />

            <div className="class-cert-footer">
              <div
                style={{
                  fontSize: 13,
                  color: COLORS.textSecondary,
                }}
              >
                Đã chọn xếp loại:{" "}
                <strong
                  style={{
                    color: COLORS.navy,
                  }}
                >
                  {students.filter((student) => !!student.rank).length}/
                  {students.length}
                </strong>
              </div>

              <Space>
                <Button onClick={handleClose}>Đóng</Button>

                <Button
                  icon={<EyeOutlined />}
                  disabled={!students.some((student) => !!student.rank)}
                  onClick={() => {
                    const first = students.find((student) => !!student.rank);

                    if (first) {
                      handlePreview(first);
                    }
                  }}
                >
                  Xem chứng chỉ
                </Button>

                <Button
                  type="primary"
                  icon={<FileZipOutlined />}
                  loading={batchExporting || exporting}
                  onClick={handleBatchExport}
                  style={{
                    backgroundColor: COLORS.navy,
                    borderColor: COLORS.navy,
                  }}
                >
                  Xuất toàn bộ ZIP
                </Button>
              </Space>
            </div>

            {batchExporting && (
              <div
                style={{
                  marginTop: 12,
                }}
              >
                <Progress
                  percent={exportProgress}
                  status="active"
                  strokeColor={COLORS.gold}
                />
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default ClassCertificateModal;
