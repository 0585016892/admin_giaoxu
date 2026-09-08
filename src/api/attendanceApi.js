import api from "./axios";

/**
 * =========================================================
 * ATTENDANCE API
 * =========================================================
 */

/**
 * 1. LẤY DANH SÁCH ĐIỂM DANH THEO LỚP + NGÀY
 *
 * GET /attendance
 */
export const getAttendance = async ({
  class_id,
  date,
  page = 1,
  limit = 10,
  search = "",
  status = "all",
}) => {
  if (!class_id) {
    throw new Error("class_id không hợp lệ");
  }

  if (!date) {
    throw new Error("Ngày điểm danh không hợp lệ");
  }

  const response = await api.get("/attendance", {
    params: {
      class_id,
      date,
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
 * 2. LƯU ĐIỂM DANH
 *
 * POST /attendance/bulk
 * =========================================================
 */
export const saveBulkAttendance = async ({
  class_id,
  date,
  attendance_date,
  students,
}) => {
  if (!class_id) {
    throw new Error("class_id không hợp lệ");
  }

  const finalDate = attendance_date || date;

  if (!finalDate) {
    throw new Error("Ngày điểm danh không hợp lệ");
  }

  if (!Array.isArray(students) || students.length === 0) {
    throw new Error("Danh sách học sinh không hợp lệ");
  }

  const response = await api.post("/attendance/bulk", {
    class_id: Number(class_id),
    attendance_date: finalDate,
    students,
  });

  return response.data;
};

/**
 * =========================================================
 * 3. QUÉT QR ĐIỂM DANH
 *
 * POST /attendance/scan-qr
 * =========================================================
 */
export const scanQRCode = async ({ qr_token, class_id, attendance_date }) => {
  if (!class_id) {
    throw new Error("Vui lòng chọn lớp trước khi quét QR");
  }

  if (!qr_token || typeof qr_token !== "string") {
    throw new Error("Mã QR không hợp lệ");
  }

  const payload = {
    qr_token: qr_token.trim(),
    class_id: Number(class_id),
  };

  if (attendance_date) {
    payload.attendance_date = attendance_date;
  }

  const response = await api.post("/attendance/scan-qr", payload);

  return response.data;
};

/**
 * =========================================================
 * 4. KẾT THÚC BUỔI ĐIỂM DANH
 *
 * POST /attendance/finish
 * =========================================================
 */
export const finishAttendance = async ({ class_id, date, attendance_date }) => {
  if (!class_id) {
    throw new Error("class_id không hợp lệ");
  }

  const finalDate = attendance_date || date;

  if (!finalDate) {
    throw new Error("Ngày điểm danh không hợp lệ");
  }

  const response = await api.post("/attendance/finish", {
    class_id: Number(class_id),
    attendance_date: finalDate,
  });

  return response.data;
};

/**
 * =========================================================
 * 5. CẬP NHẬT MỘT BẢN GHI ĐIỂM DANH
 *
 * PUT /attendance/:id
 * =========================================================
 */
export const updateAttendance = async (
  id,
  { status, check_in_time = null, note = null },
) => {
  if (!id) {
    throw new Error("ID điểm danh không hợp lệ");
  }

  if (!status) {
    throw new Error("Trạng thái điểm danh không hợp lệ");
  }

  const response = await api.put(`/attendance/${id}`, {
    status,
    check_in_time,
    note: typeof note === "string" ? note.trim() || null : null,
  });

  return response.data;
};

/**
 * =========================================================
 * 6. XÓA BẢN GHI ĐIỂM DANH
 *
 * DELETE /attendance/:id
 * =========================================================
 */
export const deleteAttendance = async (id) => {
  if (!id) {
    throw new Error("ID điểm danh không hợp lệ");
  }

  const response = await api.delete(`/attendance/${id}`);

  return response.data;
};

/**
 * =========================================================
 * 7. LỊCH SỬ ĐIỂM DANH HỌC SINH
 *
 * GET /attendance/student/:studentId
 * =========================================================
 */
export const getStudentAttendance = async (studentId, { month, year } = {}) => {
  if (!studentId) {
    throw new Error("studentId không hợp lệ");
  }

  const params = {};

  if (month) {
    params.month = month;
  }

  if (year) {
    params.year = year;
  }

  const response = await api.get(`/attendance/student/${studentId}`, {
    params,
  });

  return response.data;
};

/**
 * Alias để tương thích với AttendancePage
 */
export const getStudentHistory = async (studentId, options = {}) => {
  return getStudentAttendance(studentId, options);
};

/**
 * =========================================================
 * 8. THỐNG KÊ ĐIỂM DANH CỦA LỚP
 *
 * GET /attendance/statistics/:classId
 * =========================================================
 */
export const getClassStatistics = async (classId, { from, to } = {}) => {
  if (!classId) {
    throw new Error("classId không hợp lệ");
  }

  const params = {};

  if (from) {
    params.from = from;
  }

  if (to) {
    params.to = to;
  }

  const response = await api.get(`/attendance/statistics/${classId}`, {
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
