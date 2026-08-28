import axiosClient from "./axios";

/**
 * =========================================================
 * RESULT API
 * =========================================================
 *
 * GET    /api/results
 * GET    /api/results/:id
 * GET    /api/results/student/:studentId
 * GET    /api/results/statistics
 * GET    /api/results/student/:studentId/statistics
 *
 * POST   /api/results
 * PUT    /api/results/:id
 * DELETE /api/results/:id
 *
 * =========================================================
 */

// =========================================================
// GET ALL RESULTS
// =========================================================
export const getResults = async () => {
  const response = await axiosClient.get("/results");
  return response.data;
};
export const getResultsLeaderBoard = async () => {
  const response = await axiosClient.get("/results/leaderboard");
  return response.data;
};

// =========================================================
// GET RESULT BY ID
// =========================================================
export const getResultById = async (id) => {
  const response = await axiosClient.get(`/results/${id}`);
  return response.data;
};

// =========================================================
// GET RESULTS BY STUDENT
// =========================================================
export const getResultsByStudent = async (studentId) => {
  const response = await axiosClient.get(`/results/student/${studentId}`);

  return response.data;
};

// =========================================================
// GET RESULT STATISTICS
// =========================================================
export const getResultStatistics = async () => {
  const response = await axiosClient.get("/results/statistics");

  return response.data;
};

// =========================================================
// GET STUDENT RESULT STATISTICS
// =========================================================
export const getStudentStatistics = async (studentId) => {
  const response = await axiosClient.get(
    `/results/student/${studentId}/statistics`,
  );

  return response.data;
};

// =========================================================
// CREATE RESULT
// =========================================================
export const createResult = async (data) => {
  const response = await axiosClient.post("/results", data);

  return response.data;
};

// =========================================================
// UPDATE RESULT
// =========================================================
export const updateResult = async (id, data) => {
  const response = await axiosClient.put(`/results/${id}`, data);

  return response.data;
};

// =========================================================
// DELETE RESULT
// =========================================================
export const deleteResult = async (id) => {
  const response = await axiosClient.delete(`/results/${id}`);

  return response.data;
};
