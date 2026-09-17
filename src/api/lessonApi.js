import axios from "./axios";

// =========================================================
// LESSON API
// =========================================================

// Lấy danh sách bài học của giáo xứ hiện tại
export const getLessons = (params = {}) => {
  return axios.get("/lessons", {
    params,
  });
};

// Lấy chi tiết bài học
export const getLessonById = (id) => {
  return axios.get(`/lessons/${id}`);
};

// Thêm bài học
export const createLesson = (data) => {
  return axios.post("/lessons", data);
};

// Cập nhật bài học
export const updateLesson = (id, data) => {
  return axios.put(`/lessons/${id}`, data);
};

// Xóa bài học
export const deleteLesson = (id) => {
  return axios.delete(`/lessons/${id}`);
};

// Lấy danh sách loại giáo lý
export const getLessonTypes = () => {
  return axios.get("/lessons/types");
};
