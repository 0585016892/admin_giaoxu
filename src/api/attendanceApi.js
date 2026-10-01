import api from "./axios";

/**
 * =========================================================
 * ATTENDANCE API
 * =========================================================
 *
 * Loại điểm danh:
 *
 * mass       = Điểm danh Thánh lễ
 * catechism  = Điểm danh học Giáo lý
 *
 * QUY TẮC:
 *
 * - catechism:
 *   FE bắt buộc truyền class_id
 *
 * - mass:
 *   FE KHÔNG cần truyền class_id
 *   Backend tự xác định lớp theo giáo viên đăng nhập
 *
 * =========================================================
 */

export const ATTENDANCE_TYPES = {
  MASS: "mass",
  CATECHISM: "catechism",
};

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  EXCUSED: "excused",
};

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

/**
 * Chuẩn hóa class_id.
 *
 * required = true:
 *   class_id bắt buộc.
 *
 * required = false:
 *   class_id có thể undefined/null/rỗng.
 *
 * Dùng:
 *
 * catechism -> required: true
 * mass      -> required: false
 */
const normalizeClassId = (classId, { required = true } = {}) => {
  /**
   * Không truyền class_id
   */
  if (classId === undefined || classId === null || classId === "") {
    if (!required) {
      return undefined;
    }

    throw new Error("class_id không hợp lệ");
  }

  const id = Number(classId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("class_id không hợp lệ");
  }

  return id;
};

/**
 * =========================================================
 * STUDENT ID
 * =========================================================
 */

const normalizeStudentId = (studentId) => {
  const id = Number(studentId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("student_id không hợp lệ");
  }

  return id;
};

/**
 * =========================================================
 * ATTENDANCE TYPE
 * =========================================================
 */

const normalizeAttendanceType = (type) => {
  const attendanceType = type || ATTENDANCE_TYPES.CATECHISM;

  const validTypes = Object.values(ATTENDANCE_TYPES);

  if (!validTypes.includes(attendanceType)) {
    throw new Error("Loại điểm danh không hợp lệ");
  }

  return attendanceType;
};

/**
 * =========================================================
 * STATUS
 * =========================================================
 */

const normalizeStatus = (status) => {
  const validStatuses = Object.values(ATTENDANCE_STATUS);

  if (!validStatuses.includes(status)) {
    throw new Error("Trạng thái điểm danh không hợp lệ");
  }

  return status;
};

/**
 * =========================================================
 * DATE
 * =========================================================
 */

const normalizeDate = (date) => {
  if (!date || typeof date !== "string") {
    throw new Error("Ngày điểm danh không hợp lệ");
  }

  const finalDate = date.trim();

  if (!finalDate) {
    throw new Error("Ngày điểm danh không hợp lệ");
  }

  return finalDate;
};

/**
 * =========================================================
 * 1. LẤY DANH SÁCH ĐIỂM DANH
 *
 * GET /attendance
 *
 * catechism:
 *
 * {
 *   class_id,
 *   date,
 *   attendance_type: "catechism"
 * }
 *
 * mass:
 *
 * {
 *   date,
 *   attendance_type: "mass"
 * }
 *
 * Khi mass:
 * KHÔNG gửi class_id.
 *
 * Backend tự xác định lớp.
 *
 * =========================================================
 */

export const getAttendance = async ({
  class_id,
  date,
  attendance_date,
  attendance_type = ATTENDANCE_TYPES.CATECHISM,
  page = 1,
  limit = 10,
  search = "",
  status = "all",
}) => {
  /**
   * -------------------------------------------------------
   * TYPE
   * -------------------------------------------------------
   */

  const attendanceType = normalizeAttendanceType(attendance_type);

  /**
   * -------------------------------------------------------
   * CLASS
   *
   * Giáo lý -> bắt buộc
   * Thánh lễ -> không bắt buộc
   * -------------------------------------------------------
   */

  const classId =
    attendanceType === ATTENDANCE_TYPES.CATECHISM
      ? normalizeClassId(class_id, { required: true })
      : normalizeClassId(class_id, { required: false });

  /**
   * -------------------------------------------------------
   * DATE
   * -------------------------------------------------------
   */

  const finalDate = normalizeDate(attendance_date || date);

  /**
   * -------------------------------------------------------
   * PARAMS
   * -------------------------------------------------------
   */

  const params = {
    date: finalDate,

    attendance_type: attendanceType,

    page: Number(page) || 1,

    limit: Number(limit) || 10,

    search: typeof search === "string" ? search.trim() : "",

    status: typeof status === "string" ? status.trim().toLowerCase() : "all",
  };

  /**
   * Chỉ gửi class_id khi thực sự có.
   *
   * MASS:
   * không gửi class_id.
   */
  if (classId !== undefined) {
    params.class_id = classId;
  }

  console.log("[attendanceApi] getAttendance:", params);

  const response = await api.get("/attendance", {
    params,
  });

  return response.data;
};

/**
 * =========================================================
 * 2. LƯU ĐIỂM DANH HÀNG LOẠT
 *
 * POST /attendance/bulk
 *
 * catechism:
 * {
 *   class_id,
 *   attendance_date,
 *   attendance_type,
 *   students
 * }
 *
 * mass:
 * {
 *   attendance_date,
 *   attendance_type: "mass",
 *   students
 * }
 *
 * Backend tự xác định class_id khi mass.
 *
 * =========================================================
 */

export const saveBulkAttendance = async ({
  class_id,
  date,
  attendance_date,
  attendance_type = ATTENDANCE_TYPES.CATECHISM,
  students,
}) => {
  /**
   * -------------------------------------------------------
   * TYPE
   * -------------------------------------------------------
   */

  const attendanceType = normalizeAttendanceType(attendance_type);

  /**
   * -------------------------------------------------------
   * CLASS
   * -------------------------------------------------------
   */

  const classId =
    attendanceType === ATTENDANCE_TYPES.CATECHISM
      ? normalizeClassId(class_id, { required: true })
      : normalizeClassId(class_id, { required: false });

  /**
   * -------------------------------------------------------
   * DATE
   * -------------------------------------------------------
   */

  const finalDate = normalizeDate(attendance_date || date);

  /**
   * -------------------------------------------------------
   * STUDENTS
   * -------------------------------------------------------
   */

  if (!Array.isArray(students)) {
    throw new Error("Danh sách học sinh không hợp lệ");
  }

  if (students.length === 0) {
    throw new Error("Danh sách học sinh không được để trống");
  }

  /**
   * -------------------------------------------------------
   * NORMALIZE STUDENTS
   * -------------------------------------------------------
   */

  const normalizedStudents = students.map((student) => {
    const studentId = normalizeStudentId(student.student_id);

    const status = normalizeStatus(student.status);

    return {
      student_id: studentId,

      status,

      check_in_time: student.check_in_time || null,

      note:
        typeof student.note === "string" ? student.note.trim() || null : null,
    };
  });

  /**
   * -------------------------------------------------------
   * BODY
   * -------------------------------------------------------
   */

  const body = {
    attendance_date: finalDate,

    attendance_type: attendanceType,

    students: normalizedStudents,
  };

  /**
   * Chỉ gửi class_id nếu có.
   */
  if (classId !== undefined) {
    body.class_id = classId;
  }

  console.log("[attendanceApi] saveBulkAttendance:", body);

  const response = await api.post("/attendance/bulk", body);

  return response.data;
};

/**
 * =========================================================
 * 3. QUÉT QR ĐIỂM DANH
 *
 * POST /attendance/scan-qr
 *
 * catechism:
 *
 * {
 *   qr_token,
 *   class_id,
 *   attendance_type
 * }
 *
 * mass:
 *
 * {
 *   qr_token,
 *   attendance_type: "mass"
 * }
 *
 * Backend tự xác định lớp khi mass.
 *
 * =========================================================
 */

export const scanQRCode = async ({
  qr_token,
  class_id,
  attendance_type = ATTENDANCE_TYPES.CATECHISM,
}) => {
  /**
   * -------------------------------------------------------
   * TYPE
   * -------------------------------------------------------
   */

  const attendanceType = normalizeAttendanceType(attendance_type);

  /**
   * -------------------------------------------------------
   * CLASS
   * -------------------------------------------------------
   */

  const classId =
    attendanceType === ATTENDANCE_TYPES.CATECHISM
      ? normalizeClassId(class_id, { required: true })
      : normalizeClassId(class_id, { required: false });

  /**
   * -------------------------------------------------------
   * QR
   * -------------------------------------------------------
   */

  if (!qr_token || typeof qr_token !== "string" || !qr_token.trim()) {
    throw new Error("Mã QR không hợp lệ");
  }

  /**
   * -------------------------------------------------------
   * BODY
   * -------------------------------------------------------
   */

  const body = {
    qr_token: qr_token.trim(),

    attendance_type: attendanceType,
  };

  /**
   * MASS:
   * không gửi class_id.
   *
   * CATECHISM:
   * gửi class_id.
   */
  if (classId !== undefined) {
    body.class_id = classId;
  }

  console.log("[attendanceApi] scanQRCode:", {
    ...body,
    qr_token: "***",
  });

  const response = await api.post("/attendance/scan-qr", body);

  return response.data;
};

/**
 * =========================================================
 * 4. KẾT THÚC BUỔI ĐIỂM DANH
 *
 * POST /attendance/finish
 *
 * catechism:
 * {
 *   class_id,
 *   attendance_date,
 *   attendance_type
 * }
 *
 * mass:
 * {
 *   attendance_date,
 *   attendance_type: "mass"
 * }
 *
 * Các học sinh chưa được điểm danh
 * sẽ tự động chuyển thành absent.
 *
 * =========================================================
 */

export const finishAttendance = async ({
  class_id,
  date,
  attendance_date,
  attendance_type = ATTENDANCE_TYPES.CATECHISM,
}) => {
  /**
   * -------------------------------------------------------
   * TYPE
   * -------------------------------------------------------
   */

  const attendanceType = normalizeAttendanceType(attendance_type);

  /**
   * -------------------------------------------------------
   * CLASS
   * -------------------------------------------------------
   */

  const classId =
    attendanceType === ATTENDANCE_TYPES.CATECHISM
      ? normalizeClassId(class_id, { required: true })
      : normalizeClassId(class_id, { required: false });

  /**
   * -------------------------------------------------------
   * DATE
   * -------------------------------------------------------
   */

  const finalDate = normalizeDate(attendance_date || date);

  /**
   * -------------------------------------------------------
   * BODY
   * -------------------------------------------------------
   */

  const body = {
    attendance_date: finalDate,

    attendance_type: attendanceType,
  };

  /**
   * MASS:
   * không gửi class_id.
   *
   * CATECHISM:
   * gửi class_id.
   */
  if (classId !== undefined) {
    body.class_id = classId;
  }

  console.log("[attendanceApi] finishAttendance:", body);

  const response = await api.post("/attendance/finish", body);

  return response.data;
};

/**
 * =========================================================
 * 5. CẬP NHẬT MỘT BẢN GHI ĐIỂM DANH
 *
 * PUT /attendance/:id
 *
 * =========================================================
 */

export const updateAttendance = async (
  id,
  { status, check_in_time = null, note = null },
) => {
  const attendanceId = Number(id);

  if (!Number.isInteger(attendanceId) || attendanceId <= 0) {
    throw new Error("ID điểm danh không hợp lệ");
  }

  const finalStatus = normalizeStatus(status);

  const response = await api.put(`/attendance/${attendanceId}`, {
    status: finalStatus,

    check_in_time: check_in_time || null,

    note: typeof note === "string" ? note.trim() || null : null,
  });

  return response.data;
};

/**
 * =========================================================
 * 6. XÓA BẢN GHI ĐIỂM DANH
 *
 * DELETE /attendance/:id
 *
 * =========================================================
 */

export const deleteAttendance = async (id) => {
  const attendanceId = Number(id);

  if (!Number.isInteger(attendanceId) || attendanceId <= 0) {
    throw new Error("ID điểm danh không hợp lệ");
  }

  const response = await api.delete(`/attendance/${attendanceId}`);

  return response.data;
};

/**
 * =========================================================
 * 7. LỊCH SỬ ĐIỂM DANH HỌC SINH
 *
 * GET /attendance/student/:studentId
 *
 * =========================================================
 */

export const getStudentAttendance = async (
  studentId,
  { month, year, attendance_type } = {},
) => {
  const id = normalizeStudentId(studentId);

  const params = {};

  if (month) {
    params.month = Number(month);
  }

  if (year) {
    params.year = Number(year);
  }

  if (attendance_type) {
    params.attendance_type = normalizeAttendanceType(attendance_type);
  }

  const response = await api.get(`/attendance/student/${id}`, {
    params,
  });

  return response.data;
};

/**
 * =========================================================
 * ALIAS
 *
 * =========================================================
 */

export const getStudentHistory = async (studentId, options = {}) => {
  return getStudentAttendance(studentId, options);
};

/**
 * =========================================================
 * 8. THỐNG KÊ ĐIỂM DANH CỦA LỚP
 *
 * GET /attendance/statistics/:classId
 *
 * API này luôn cần class_id
 * vì đây là thống kê của một lớp cụ thể.
 *
 * =========================================================
 */

export const getClassStatistics = async (
  classId,
  { from, to, attendance_type } = {},
) => {
  const id = normalizeClassId(classId);

  const params = {};

  if (from) {
    params.from = from;
  }

  if (to) {
    params.to = to;
  }

  if (attendance_type) {
    params.attendance_type = normalizeAttendanceType(attendance_type);
  }

  const response = await api.get(`/attendance/statistics/${id}`, {
    params,
  });

  return response.data;
};

/**
 * =========================================================
 * DEFAULT EXPORT
 * =========================================================
 */

const attendanceApi = {
  ATTENDANCE_TYPES,

  ATTENDANCE_STATUS,

  getAttendance,

  saveBulkAttendance,

  scanQRCode,

  finishAttendance,

  updateAttendance,

  deleteAttendance,

  getStudentAttendance,

  getStudentHistory,

  getClassStatistics,
};

export default attendanceApi;
