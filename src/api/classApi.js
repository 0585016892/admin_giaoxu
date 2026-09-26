import axios from "./axios";

const classApi = {
  // =========================================================
  // CLASS
  // =========================================================

  /**
   * Lấy danh sách tất cả lớp của giáo xứ
   */
  getAll: async () => {
    const res = await axios.get("/classes");
    return res.data;
  },

  /**
   * Lấy các lớp mà giáo lý viên đang được phân công
   */
  getClassTeacher: async () => {
    const res = await axios.get("/classes/teacher-class");
    return res.data;
  },

  /**
   * Lấy chi tiết một lớp
   */
  getById: async (id) => {
    const res = await axios.get(`/classes/${id}`);
    return res.data;
  },

  /**
   * Tạo lớp mới
   *
   * data:
   * {
   *   name,
   *   category,
   *   catechist_id,
   *   description,
   *   start_date,
   *   end_date,
   *   status,
   *   schedules: [
   *     {
   *       day_of_week: 1,
   *       start_time: "19:00",
   *       end_time: "20:30",
   *       room: "Phòng 1"
   *     }
   *   ]
   * }
   */
  create: async (data) => {
    const res = await axios.post("/classes", data);
    return res.data;
  },

  /**
   * Cập nhật thông tin lớp
   *
   * Nếu data có schedules:
   * - BE sẽ thay thế toàn bộ lịch học hiện tại
   *
   * Nếu không truyền schedules:
   * - Giữ nguyên lịch học hiện tại
   */
  update: async (id, data) => {
    const res = await axios.put(`/classes/${id}`, data);
    return res.data;
  },

  /**
   * Xóa lớp
   *
   * class_schedules sẽ được xóa tự động
   * nhờ ON DELETE CASCADE ở database.
   */
  remove: async (id) => {
    const res = await axios.delete(`/classes/${id}`);
    return res.data;
  },

  // =========================================================
  // CLASS SCHEDULES
  // =========================================================

  /**
   * Lấy toàn bộ lịch học hàng tuần của giáo xứ
   *
   * Dùng cho màn hình thời khóa biểu:
   *
   * Thứ 2 | Thứ 3 | Thứ 4 | ... | Chủ nhật
   */
  getSchedules: async () => {
    const res = await axios.get("/classes/schedules");
    return res.data;
  },

  /**
   * Thêm một lịch học cho lớp
   *
   * data:
   * {
   *   day_of_week: 1,
   *   start_time: "19:00",
   *   end_time: "20:30",
   *   room: "Phòng 1"
   * }
   */
  createSchedule: async (classId, data) => {
    const res = await axios.post(`/classes/${classId}/schedules`, data);
    return res.data;
  },

  /**
   * Cập nhật một lịch học
   */
  updateSchedule: async (classId, scheduleId, data) => {
    const res = await axios.put(
      `/classes/${classId}/schedules/${scheduleId}`,
      data,
    );

    return res.data;
  },

  /**
   * Xóa một lịch học
   */
  removeSchedule: async (classId, scheduleId) => {
    const res = await axios.delete(
      `/classes/${classId}/schedules/${scheduleId}`,
    );

    return res.data;
  },
};

export default classApi;
