import axiosClient from "./axios";

// =========================================================
// STATISTICS
// =========================================================

/**
 * Thống kê kết quả toàn giáo xứ
 *
 * GET /api/results/statistics
 */
export const getResultStatistics = async () => {
  const response = await axiosClient.get("/results/statistics");

  return response.data;
};

/**
 * Thống kê kết quả của lớp
 *
 * GET /api/results/class/:classId/statistics
 *
 * @param {number|string} classId
 */
export const getClassStatistics = async (classId) => {
  if (!classId) {
    throw new Error("classId là bắt buộc");
  }

  const response = await axiosClient.get(
    `/results/class/${classId}/statistics`,
  );

  return response.data;
};

/**
 * Thống kê kết quả của học sinh
 *
 * GET /api/results/student/:studentId/statistics
 *
 * @param {number|string} studentId
 */
export const getStudentStatistics = async (studentId) => {
  if (!studentId) {
    throw new Error("studentId là bắt buộc");
  }

  const response = await axiosClient.get(
    `/results/student/${studentId}/statistics`,
  );

  return response.data;
};

// =========================================================
// CLASS
// =========================================================

/**
 * Lấy bảng điểm của lớp
 *
 * GET /api/results/class/:classId
 *
 * @param {number|string} classId
 * @param {object} params
 *
 * params:
 * - page
 * - limit
 */
export const getResultsByClass = async (classId, params = {}) => {
  if (!classId) {
    throw new Error("classId là bắt buộc");
  }

  const response = await axiosClient.get(`/results/class/${classId}`, {
    params,
  });

  return response.data;
};

// =========================================================
// STUDENT
// =========================================================

/**
 * Lấy toàn bộ điểm của học sinh
 *
 * GET /api/results/student/:studentId
 *
 * @param {number|string} studentId
 */
export const getResultsByStudent = async (studentId) => {
  if (!studentId) {
    throw new Error("studentId là bắt buộc");
  }

  const response = await axiosClient.get(`/results/student/${studentId}`);

  return response.data;
};

// =========================================================
// GRADING RULE
// =========================================================

/**
 * Lấy kết quả theo bộ quy tắc
 *
 * GET /api/results/rule/:ruleId
 *
 * @param {number|string} ruleId
 */
export const getResultsByRule = async (ruleId) => {
  if (!ruleId) {
    throw new Error("ruleId là bắt buộc");
  }

  const response = await axiosClient.get(`/results/rule/${ruleId}`);

  return response.data;
};

/**
 * Lấy kết quả theo một đầu điểm
 *
 * GET /api/results/rule-item/:ruleItemId
 *
 * @param {number|string} ruleItemId
 */
export const getResultsByRuleItem = async (ruleItemId) => {
  if (!ruleItemId) {
    throw new Error("ruleItemId là bắt buộc");
  }

  const response = await axiosClient.get(`/results/rule-item/${ruleItemId}`);

  return response.data;
};

// =========================================================
// LIST
// =========================================================

/**
 * Lấy danh sách kết quả
 *
 * GET /api/results
 *
 * @param {object} params
 *
 * Hỗ trợ:
 * - page
 * - limit
 * - student_id
 * - grading_rule_id
 * - grading_rule_item_id
 * - class_id
 * - exam_type
 *
 * Ví dụ:
 *
 * getResults({
 *   page: 1,
 *   limit: 20,
 *   class_id: 5,
 *   grading_rule_id: 1,
 *   grading_rule_item_id: 3,
 *   exam_type: "paper",
 * });
 */
export const getResults = async (params = {}) => {
  const response = await axiosClient.get("/results", {
    params,
  });

  return response.data;
};

// =========================================================
// DETAIL
// =========================================================

/**
 * Lấy chi tiết một kết quả
 *
 * GET /api/results/:id
 *
 * @param {number|string} id
 */
export const getResultById = async (id) => {
  if (!id) {
    throw new Error("result id là bắt buộc");
  }

  const response = await axiosClient.get(`/results/${id}`);

  return response.data;
};

// =========================================================
// CREATE
// =========================================================

/**
 * Tạo kết quả mới
 *
 * POST /api/results
 *
 * data:
 *
 * {
 *   student_id: 101,
 *   grading_rule_id: 1,
 *   grading_rule_item_id: 3,
 *   score: 8.5,
 *   exam_type: "paper",
 *   exam_date: "2026-09-24",
 *   note: ""
 * }
 *
 * @param {object} data
 */
export const createResult = async (data) => {
  if (!data) {
    throw new Error("Dữ liệu kết quả là bắt buộc");
  }

  if (!data.student_id) {
    throw new Error("student_id là bắt buộc");
  }

  if (!data.grading_rule_id) {
    throw new Error("grading_rule_id là bắt buộc");
  }

  if (!data.grading_rule_item_id) {
    throw new Error("grading_rule_item_id là bắt buộc");
  }

  if (data.score === undefined || data.score === null || data.score === "") {
    throw new Error("score là bắt buộc");
  }

  const response = await axiosClient.post("/results", data);

  return response.data;
};

// =========================================================
// UPDATE
// =========================================================

/**
 * Cập nhật kết quả
 *
 * PUT /api/results/:id
 *
 * @param {number|string} id
 * @param {object} data
 *
 * Có thể cập nhật:
 * - grading_rule_id
 * - grading_rule_item_id
 * - score
 * - exam_type
 * - exam_date
 * - note
 */
export const updateResult = async (id, data) => {
  if (!id) {
    throw new Error("result id là bắt buộc");
  }

  if (!data) {
    throw new Error("Dữ liệu cập nhật là bắt buộc");
  }

  const response = await axiosClient.put(`/results/${id}`, data);

  return response.data;
};

// =========================================================
// DELETE
// =========================================================

/**
 * Xóa kết quả
 *
 * DELETE /api/results/:id
 *
 * @param {number|string} id
 */
export const deleteResult = async (id) => {
  if (!id) {
    throw new Error("result id là bắt buộc");
  }

  const response = await axiosClient.delete(`/results/${id}`);

  return response.data;
};

export const getLeaderboard = async () => {
  const response = await axiosClient.get("/results/leaderboard");

  return response.data;
};

export const getResultsLeaderBoard = getLeaderboard;

export const getClassLeaderboard = async (classId) => {
  if (!classId) {
    throw new Error("classId là bắt buộc");
  }

  const response = await axiosClient.get(
    `/results/class/${classId}/leaderboard`,
  );

  return response.data;
};
