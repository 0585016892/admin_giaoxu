import api from "./axios";

/**
 * =========================================================
 * 1. GET ATTENDANCE THEO LỚP + NGÀY
 * =========================================================
 *
 * GET /attendance
 *
 * params:
 * {
 *   class_id: 17,
 *   date: "2026-09-01"
 * }
 */
export const getAttendance = async ({ class_id, date }) => {
  const response = await api.get("/attendance", {
    params: {
      class_id,
      date,
    },
  });

  return response.data;
};

/**
 * =========================================================
 * 2. SAVE BULK ATTENDANCE
 * =========================================================
 *
 * POST /attendance/bulk
 *
 * {
 *   class_id: 17,
 *   date: "2026-09-01",
 *
 *   students: [
 *     {
 *       student_id: 1,
 *       status: "present",
 *       check_in_time: "07:30:00",
 *       note: "Đi học đúng giờ"
 *     }
 *   ]
 * }
 */
export const saveBulkAttendance = async ({ class_id, date, students }) => {
  const response = await api.post("/attendance/bulk", {
    class_id,
    date,
    students,
  });

  return response.data;
};

/**
 * =========================================================
 * 3. UPDATE ONE ATTENDANCE
 * =========================================================
 *
 * PUT /attendance/:id
 *
 * {
 *   status: "late",
 *   check_in_time: "07:45:00",
 *   note: "Đến muộn"
 * }
 */
export const updateAttendance = async (id, { status, check_in_time, note }) => {
  const response = await api.put(`/attendance/${id}`, {
    status,
    check_in_time: check_in_time || null,
    note: note?.trim() || null,
  });

  return response.data;
};

/**
 * =========================================================
 * 4. DELETE ATTENDANCE
 * =========================================================
 *
 * DELETE /attendance/:id
 */
export const deleteAttendance = async (id) => {
  const response = await api.delete(`/attendance/${id}`);

  return response.data;
};

/**
 * =========================================================
 * 5. GET STUDENT ATTENDANCE
 * =========================================================
 *
 * GET /attendance/student/:studentId
 *
 * API hiện tại của bạn trả toàn bộ lịch sử.
 *
 * Frontend sẽ lọc theo tháng đang được chọn.
 */
export const getStudentAttendance = async (studentId) => {
  if (!studentId) {
    throw new Error("studentId không hợp lệ");
  }

  const response = await api.get(`/attendance/student/${studentId}`);

  return response.data;
};

/**
 * =========================================================
 * 6. GET CLASS STATISTICS
 * =========================================================
 *
 * GET /attendance/statistics/class/:classId
 *
 * params:
 *
 * {
 *   from: "2026-09-01",
 *   to: "2026-09-30"
 * }
 */
export const getClassStatistics = async (classId, { from, to } = {}) => {
  if (!classId) {
    throw new Error("classId không hợp lệ");
  }

  const response = await api.get(`/attendance/statistics/class/${classId}`, {
    params: {
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
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
  updateAttendance,
  deleteAttendance,
  getStudentAttendance,
  getClassStatistics,
};

export default attendanceApi;
