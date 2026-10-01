import axiosClient from "./axios"; // Axios instance của bạn

const catechistApi = {
  // =========================================================
  // LẤY DANH SÁCH TẤT CẢ GLV
  // =========================================================
  getAll: () => {
    return axiosClient.get("/catechist");
  },

  // =========================================================
  // LẤY CHI TIẾT 1 GLV
  // =========================================================
  getById: (id) => {
    return axiosClient.get(`/catechist/${id}`);
  },

  // =========================================================
  // TẠO MỚI GLV
  // Mã GLV tự sinh ở backend
  // =========================================================
  create: (data) => {
    return axiosClient.post("/catechist", data);
  },

  // =========================================================
  // CẬP NHẬT THÔNG TIN GLV
  // =========================================================
  update: (id, data) => {
    return axiosClient.put(`/catechist/${id}`, data);
  },

  // =========================================================
  // XÓA GLV
  // =========================================================
  delete: (id) => {
    return axiosClient.delete(`/catechist/${id}`);
  },

  // =========================================================
  // PHÂN LỚP CHO GLV
  // =========================================================
  assignClass: (data) => {
    return axiosClient.post("/catechist/assign-class", data);
  },

  // =========================================================
  // GỠ GLV KHỎI LỚP
  // =========================================================
  removeClass: (data) => {
    return axiosClient.delete("/catechist/remove-class", {
      data,
    });
  },

  // =========================================================
  // THƯ BỔ NHIỆM
  // =========================================================

  /**
   * Lấy danh sách thư bổ nhiệm chưa đọc
   *
   * GET /catechist/appointments/pending
   */
  getPendingAppointments: () => {
    return axiosClient.get("/catechist/appointments/pending");
  },

  /**
   * Đánh dấu thư bổ nhiệm đã đọc/đã nhận
   *
   * PATCH /catechist/appointments/:id/read
   */
  readAppointment: (id) => {
    return axiosClient.patch(`/catechist/appointments/${id}/read`);
  },
};

export default catechistApi;
