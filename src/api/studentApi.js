import axiosClient from "./axios";

const studentApi = {
  // =========================================================
  // LẤY DANH SÁCH HỌC SINH
  // =========================================================
  getAll: (params = {}) =>
    axiosClient.get("/students", {
      params,
    }),

  // =========================================================
  // LẤY LỚP CỦA HỌC SINH
  // =========================================================
  getStudentClass: (id) => axiosClient.get(`/students/classes/${id}/students`),
  getStudentsByTeacher: () => axiosClient.get(`/students/student-class`),

  // =========================================================
  // CHI TIẾT HỌC SINH
  // =========================================================
  getById: (id) => axiosClient.get(`/students/${id}`),

  // =========================================================
  // THÊM HỌC SINH
  // =========================================================
  create: (data) => axiosClient.post("/students", data),

  // =========================================================
  // CẬP NHẬT HỌC SINH
  // =========================================================
  update: (id, data) => axiosClient.put(`/students/${id}`, data),

  // =========================================================
  // XÓA HỌC SINH
  // =========================================================
  delete: (id) => axiosClient.delete(`/students/${id}`),

  // =========================================================
  // IMPORT HỌC SINH TỪ EXCEL
  // =========================================================
  importExcel: (file) => {
    const formData = new FormData();

    // Ant Design UploadFile -> lấy file thật
    const actualFile = file?.originFileObj || file;

    formData.append("file", actualFile);

    return axiosClient.post("/students/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default studentApi;
