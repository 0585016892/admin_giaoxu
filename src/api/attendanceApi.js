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

const normalizeClassId = (classId) => {
  const id = Number(classId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("class_id không hợp lệ");
  }

  return id;
};

const normalizeStudentId = (studentId) => {
  const id = Number(studentId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("student_id không hợp lệ");
  }

  return id;
};

const normalizeAttendanceType = (type) => {
  const attendanceType = type || ATTENDANCE_TYPES.CATECHISM;

  const validTypes = Object.values(ATTENDANCE_TYPES);

  if (!validTypes.includes(attendanceType)) {
    throw new Error("Loại điểm danh không hợp lệ");
  }

  return attendanceType;
};

const normalizeStatus = (status) => {
  const validStatuses = Object.values(ATTENDANCE_STATUS);

  if (!validStatuses.includes(status)) {
    throw new Error("Trạng thái điểm danh không hợp lệ");
  }

  return status;
};

const normalizeDate = (date) => {
  if (!date || typeof date !== "string") {
    throw new Error("Ngày điểm danh không hợp lệ");
  }

  return date.trim();
};

/**
 * =========================================================
 * 1. LẤY DANH SÁCH ĐIỂM DANH
 *
 * GET /attendance
 *
 * Query:
 *
 * class_id
 * date
 * attendance_type
 * page
 * limit
 * search
 * status
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
  const classId = normalizeClassId(class_id);

  const finalDate = normalizeDate(attendance_date || date);

  const attendanceType = normalizeAttendanceType(attendance_type);

  const response = await api.get("/attendance", {
    params: {
      class_id: classId,
      date: finalDate,
      attendance_type: attendanceType,
      page,
      limit,
      search,
      status,
    },
  });

  return response.data;
};

/**
 * =========================================================
 * 2. LƯU ĐIỂM DANH HÀNG LOẠT
 *
 * POST /attendance/bulk
 *
 * Body:
 *
 * {
 *   class_id,
 *   attendance_date,
 *   attendance_type,
 *   students
 * }
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
  const classId = normalizeClassId(class_id);

  const finalDate = normalizeDate(attendance_date || date);

  const attendanceType = normalizeAttendanceType(attendance_type);

  if (!Array.isArray(students)) {
    throw new Error("Danh sách học sinh không hợp lệ");
  }

  if (students.length === 0) {
    throw new Error("Danh sách học sinh không được để trống");
  }

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

  const response = await api.post("/attendance/bulk", {
    class_id: classId,

    attendance_date: finalDate,

    attendance_type: attendanceType,

    students: normalizedStudents,
  });

  return response.data;
};

/**
 * =========================================================
 * 3. QUÉT QR ĐIỂM DANH
 *
 * POST /attendance/scan-qr
 *
 * Body:
 *
 * {
 *   qr_token,
 *   class_id,
 *   attendance_type
 * }
 *
 * =========================================================
 */

export const scanQRCode = async ({
  qr_token,
  class_id,
  attendance_type = ATTENDANCE_TYPES.CATECHISM,
}) => {
  const classId = normalizeClassId(class_id);

  const attendanceType = normalizeAttendanceType(attendance_type);

  if (!qr_token || typeof qr_token !== "string" || !qr_token.trim()) {
    throw new Error("Mã QR không hợp lệ");
  }

  const response = await api.post("/attendance/scan-qr", {
    qr_token: qr_token.trim(),

    class_id: classId,

    attendance_type: attendanceType,
  });

  return response.data;
};

/**
 * =========================================================
 * 4. KẾT THÚC BUỔI ĐIỂM DANH
 *
 * POST /attendance/finish
 *
 * Các học sinh chưa được điểm danh
 * sẽ tự động chuyển sang absent.
 *
 * =========================================================
 */

export const finishAttendance = async ({
  class_id,
  date,
  attendance_date,
  attendance_type = ATTENDANCE_TYPES.CATECHISM,
}) => {
  const classId = normalizeClassId(class_id);

  const finalDate = normalizeDate(attendance_date || date);

  const attendanceType = normalizeAttendanceType(attendance_type);

  const response = await api.post("/attendance/finish", {
    class_id: classId,

    attendance_date: finalDate,

    attendance_type: attendanceType,
  });

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
 * Query optional:
 *
 * month
 * year
 * attendance_type
 *
 * Nếu không truyền attendance_type
 * backend có thể trả về toàn bộ lịch sử.
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
 * Giữ tương thích với AttendancePage cũ
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
 * Query:
 *
 * from
 * to
 * attendance_type
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
