import axiosClient from "./axios";

const classStudentApi = {
  // =========================================================
  // HỌC SINH TRONG LỚP
  // =========================================================
  getByClass: (classId) => axiosClient.get(`/class-students/class/${classId}`),

  // =========================================================
  // CÁC LỚP CỦA HỌC SINH
  // =========================================================
  getByStudent: (studentId) =>
    axiosClient.get(`/class-students/student/${studentId}`),

  // =========================================================
  // TOÀN BỘ HỌC SINH CỦA GIÁO XỨ THEO NĂM HỌC
  // Bao gồm học sinh chưa được xếp lớp
  // =========================================================
  getByChurch: (academicYear) =>
    axiosClient.get("/class-students/students", {
      params: {
        academic_year: academicYear,
      },
    }),

  // =========================================================
  // THÊM HỌC SINH VÀO LỚP
  // =========================================================
  add: (data) => axiosClient.post("/class-students", data),

  // =========================================================
  // CẬP NHẬT QUAN HỆ HỌC SINH - LỚP
  // =========================================================
  update: (classId, studentId, data) =>
    axiosClient.put(`/class-students/update/${classId}/${studentId}`, data),

  // =========================================================
  // XÓA HỌC SINH KHỎI LỚP
  // =========================================================
  remove: (classId, studentId) =>
    axiosClient.delete(`/class-students/${classId}/${studentId}`),

  // =========================================================
  // CHUYỂN MỘT HỌC SINH SANG LỚP KHÁC
  // =========================================================
  changeClass: (classId, studentId, newClassId) =>
    axiosClient.put(`/class-students/${classId}/${studentId}/change-class`, {
      newClassId,
    }),

  // =========================================================
  // CHUYỂN NHIỀU HỌC SINH SANG MỘT LỚP KHÁC
  // =========================================================
  changeClassStudents: (targetClassId, studentIds) =>
    axiosClient.put(
      `/class-students/classes/${targetClassId}/change-students`,
      {
        studentIds,
      },
    ),
};

export default classStudentApi;
