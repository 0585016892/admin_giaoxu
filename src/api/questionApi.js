import axios from "./axios";

export const getQuestions = (params = {}) => {
  return axios.get("/questions", {
    params,
  });
};

export const getQuestionById = (id) => {
  return axios.get(`/questions/${id}`);
};

export const createQuestion = (data) => {
  return axios.post("/questions", data);
};

export const updateQuestion = (id, data) => {
  return axios.put(`/questions/${id}`, data);
};

export const deleteQuestion = (id) => {
  return axios.delete(`/questions/${id}`);
};

export const generateExam = (params = {}) => {
  return axios.get("/questions/exam/generate", {
    params,
  });
};

export const submitExam = (data) => {
  return axios.post("/questions/exam/submit", data);
};

export const getQuizByLesson = (lessonId) =>
  axios.get(`/questions/play/${lessonId}`);

export const submitQuiz = (lessonId, answers) =>
  axios.post(`/questions/play/${lessonId}/submit`, {
    answers,
  });
