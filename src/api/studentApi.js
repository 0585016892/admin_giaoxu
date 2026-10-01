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
  // LẤY DANH SÁCH HỌC SINH THEO LỚP
  // =========================================================
  getStudentClass: (id) => axiosClient.get(`/students/classes/${id}/students`),

  // Alias rõ nghĩa hơn
  getStudentsByClass: (classId) =>
    axiosClient.get(`/students/classes/${classId}/students`),

  // =========================================================
  // LẤY HỌC SINH CỦA GIÁO LÝ VIÊN
  // =========================================================
  getStudentsByTeacher: () => axiosClient.get("/students/student-class"),

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
  // CẬP NHẬT HÀNG LOẠT HỌC SINH TRONG LỚP
  // =========================================================
  bulkUpdateByClass: (classId, students) =>
    axiosClient.put(`/students/${classId}/bulk-update`, {
      students,
    }),

  // =========================================================
  // XÓA HỌC SINH
  // =========================================================
  delete: (id) => axiosClient.delete(`/students/${id}`),

  // =========================================================
  // XÓA HÀNG LOẠT
  // =========================================================
  deleteBulk: (studentIds) =>
    axiosClient.delete("/students/bulk", {
      data: {
        student_ids: studentIds,
      },
    }),

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

  // =========================================================
  // EXPORT EXCEL
  // =========================================================
  exportExcel: async ({ studentIds, fields }) => {
    const response = await axiosClient.post(
      "/students/export-excel",
      {
        student_ids: studentIds,
        fields,
      },
      {
        responseType: "blob",
      },
    );

    return response;
  },
};

export default studentApi;
