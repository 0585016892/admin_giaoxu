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

// =========================================================
// LESSON RESOURCE API
// =========================================================

// Lấy danh sách tài liệu của bài học
export const getLessonResources = (lessonId) => {
  return axios.get(`/lesson-resources/${lessonId}/resources`);
};

// Upload tài liệu cho bài học
export const uploadLessonResource = (lessonId, formData) => {
  return axios.post(`/lesson-resources/${lessonId}/resources`, formData);
};

// Lấy chi tiết tài liệu
export const getLessonResourceById = (resourceId) => {
  return axios.get(`/lesson-resources/resources/${resourceId}`);
};

// Cập nhật thông tin tài liệu
export const updateLessonResource = (resourceId, data) => {
  return axios.put(`/lesson-resources/resources/${resourceId}`, data);
};

// Bật / tắt tài liệu
export const updateLessonResourceStatus = (resourceId, isActive) => {
  return axios.patch(`/lesson-resources/resources/${resourceId}/status`, {
    is_active: isActive,
  });
};

// Xóa tài liệu
export const deleteLessonResource = (resourceId) => {
  return axios.delete(`/lesson-resources/resources/${resourceId}`);
};

export const getQuestionsByLesson = (lessonId) =>
  axios.get(`/lesson-resources/lesson/${lessonId}`);
