import axiosClient from "./axios";

const classStudentApi = {
  // Học sinh trong lớp
  getByClass: (classId) => axiosClient.get(`/class-students/class/${classId}`),

  // Các lớp của học sinh
  getByStudent: (studentId) =>
    axiosClient.get(`/class-students/student/${studentId}`),

  // Thêm học sinh vào lớp
  add: (data) => axiosClient.post("/class-students", data),

  // Cập nhật
  update: (classId, studentId, data) =>
    axiosClient.put(`/class-students/update/${classId}/${studentId}`, data),

  // Xóa khỏi lớp
  remove: (classId, studentId) =>
    axiosClient.delete(`/class-students/${classId}/${studentId}`),

  // =========================================================
  // CHUYỂN 1 HỌC SINH SANG LỚP KHÁC
  // =========================================================
  changeClass: (classId, studentId, newClassId) =>
    axiosClient.put(`/class-students/${classId}/${studentId}/change-class`, {
      newClassId,
    }),

  // =========================================================
  // CHUYỂN NHIỀU HỌC SINH SANG 1 LỚP KHÁC
  // =========================================================
  changeClasses: (classId, studentIds, newClassId) =>
    axiosClient.put(`/class-students/classes/${classId}/change-students`, {
      studentIds,
      newClassId,
    }),
};

export default classStudentApi;
