import axiosClient from "./axios";

const studentApi = {
  // Lấy danh sách học sinh
  // Có thể truyền:
  // studentApi.getAll()
  // studentApi.getAll({ class_id: 33 })
  getAll: (params = {}) =>
    axiosClient.get("/students", {
      params,
    }),

  getStudentClass: (id) => axiosClient.get(`/students/student-class`),

  getById: (id) => axiosClient.get(`/students/${id}`),

  create: (data) => axiosClient.post("/students", data),

  update: (id, data) => axiosClient.put(`/students/${id}`, data),

  delete: (id) => axiosClient.delete(`/students/${id}`),
  // Import học sinh từ Excel
  importExcel: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post("/students/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default studentApi;
