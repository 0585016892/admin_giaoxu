import axiosClient from "./axios";

/**
 * ============================================================
 * RESULT API
 * ============================================================
 *
 * Quản lý:
 * 1. Quy tắc tính điểm của giáo xứ
 * 2. Thành phần của quy tắc
 * 3. Kết quả điểm học sinh
 * 4. Thống kê
 * 5. Xếp hạng
 *
 * Backend base:
 * /api
 *
 * Route:
 * /grading-rules
 * /results
 */

/* ============================================================
 * COMMON
 * ============================================================ */

const unwrap = (response) => response.data;

const requireId = (value, field = "id") => {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${field} là bắt buộc`);
  }

  return value;
};

/* ============================================================
 * GRADING RULE
 * ============================================================ */

/**
 * Lấy quy tắc tính điểm của giáo xứ hiện tại.
 *
 * GET /grading-rules
 *
 * Mỗi giáo xứ chỉ có 1 grading rule.
 */
export const getGradingRule = async () => {
  const response = await axiosClient.get("/grading-rules");
  return unwrap(response);
};

/**
 * Lấy chi tiết một quy tắc.
 *
 * GET /grading-rules/:id
 */
export const getGradingRuleById = async (id) => {
  requireId(id, "grading rule id");

  const response = await axiosClient.get(`/grading-rules/${id}`);

  return unwrap(response);
};

/**
 * Tạo quy tắc tính điểm.
 *
 * POST /grading-rules
 *
 * data:
 * {
 *   calculation_type,
 *   multiplier,
 *   divisor,
 *   rounding_digits,
 *   pass_score,
 *   status,
 *   items: [...]
 * }
 */
export const createGradingRule = async (data) => {
  if (!data) {
    throw new Error("Dữ liệu quy tắc là bắt buộc");
  }

  const response = await axiosClient.post("/grading-rules", data);

  return unwrap(response);
};

/**
 * Cập nhật quy tắc tính điểm.
 *
 * PUT /grading-rules/:id
 */
export const updateGradingRule = async (id, data) => {
  requireId(id, "grading rule id");

  if (!data) {
    throw new Error("Dữ liệu cập nhật là bắt buộc");
  }

  const response = await axiosClient.put(`/grading-rules/${id}`, data);

  return unwrap(response);
};

/**
 * Xóa quy tắc.
 *
 * DELETE /grading-rules/:id
 */
export const deleteGradingRule = async (id) => {
  requireId(id, "grading rule id");

  const response = await axiosClient.delete(`/grading-rules/${id}`);

  return unwrap(response);
};

/* ============================================================
 * RESULTS - STATISTICS
 * ============================================================ */

/**
 * Thống kê kết quả toàn giáo xứ.
 *
 * GET /results/statistics
 */
export const getResultStatistics = async () => {
  const response = await axiosClient.get("/results/statistics");

  return unwrap(response);
};

/**
 * Thống kê kết quả của một lớp.
 *
 * GET /results/class/:classId/statistics
 */
export const getClassStatistics = async (classId) => {
  requireId(classId, "classId");

  const response = await axiosClient.get(
    `/results/class/${classId}/statistics`,
  );

  return unwrap(response);
};

/**
 * Thống kê kết quả của một học sinh.
 *
 * GET /results/student/:studentId/statistics
 */
export const getStudentStatistics = async (studentId) => {
  requireId(studentId, "studentId");

  const response = await axiosClient.get(
    `/results/student/${studentId}/statistics`,
  );

  return unwrap(response);
};

/* ============================================================
 * RESULTS - LEADERBOARD
 * ============================================================ */

/**
 * Xếp hạng toàn giáo xứ.
 *
 * GET /results/leaderboard
 *
 * params:
 * {
 *   limit,
 *   page,
 *   ...
 * }
 */
export const getLeaderboard = async (params = {}) => {
  const response = await axiosClient.get("/results/leaderboard", {
    params,
  });

  return unwrap(response);
};

/**
 * Xếp hạng trong lớp.
 *
 * GET /results/class/:classId/leaderboard
 */
export const getClassLeaderboard = async (classId, params = {}) => {
  requireId(classId, "classId");

  const response = await axiosClient.get(
    `/results/class/${classId}/leaderboard`,
    {
      params,
    },
  );

  return unwrap(response);
};

/* ============================================================
 * RESULTS - BY CLASS
 * ============================================================ */

/**
 * Lấy bảng điểm của lớp.
 *
 * GET /results/class/:classId
 *
 * Response dự kiến:
 *
 * {
 *   success: true,
 *   data: [...],
 *   grading_rule: {...},
 *   pagination: {...}
 * }
 */
export const getResultsByClass = async (classId, params = {}) => {
  requireId(classId, "classId");

  const response = await axiosClient.get(`/results/class/${classId}`, {
    params,
  });

  return unwrap(response);
};

/* ============================================================
 * RESULTS - BY STUDENT
 * ============================================================ */

/**
 * Lấy tất cả kết quả của học sinh.
 *
 * GET /results/student/:studentId
 */
export const getResultsByStudent = async (studentId, params = {}) => {
  requireId(studentId, "studentId");

  const response = await axiosClient.get(`/results/student/${studentId}`, {
    params,
  });

  return unwrap(response);
};

/* ============================================================
 * RESULTS - BY GRADING RULE
 * ============================================================ */

/**
 * Lấy kết quả theo quy tắc.
 *
 * GET /results/rule/:ruleId
 */
export const getResultsByRule = async (ruleId, params = {}) => {
  requireId(ruleId, "ruleId");

  const response = await axiosClient.get(`/results/rule/${ruleId}`, {
    params,
  });

  return unwrap(response);
};

/* ============================================================
 * RESULTS - BY GRADING RULE ITEM
 * ============================================================ */

/**
 * Lấy kết quả theo một thành phần điểm.
 *
 * GET /results/rule-item/:ruleItemId
 */
export const getResultsByRuleItem = async (ruleItemId, params = {}) => {
  requireId(ruleItemId, "ruleItemId");

  const response = await axiosClient.get(`/results/rule-item/${ruleItemId}`, {
    params,
  });

  return unwrap(response);
};

/* ============================================================
 * RESULTS - GENERAL LIST
 * ============================================================ */

/**
 * Lấy danh sách kết quả.
 *
 * GET /results
 *
 * params có thể gồm:
 *
 * {
 *   page,
 *   limit,
 *   student_id,
 *   class_id,
 *   grading_rule_id,
 *   grading_rule_item_id,
 *   exam_type,
 *   from_date,
 *   to_date,
 *   search
 * }
 */
export const getResults = async (params = {}) => {
  const response = await axiosClient.get("/results", {
    params,
  });

  return unwrap(response);
};

/* ============================================================
 * RESULTS - DETAIL
 * ============================================================ */

/**
 * Lấy một kết quả theo ID.
 *
 * GET /results/:id
 */
export const getResultById = async (id) => {
  requireId(id, "result id");

  const response = await axiosClient.get(`/results/${id}`);

  return unwrap(response);
};

/* ============================================================
 * RESULTS - CREATE
 * ============================================================ */

/**
 * Tạo kết quả.
 *
 * POST /results
 *
 * data:
 * {
 *   student_id,
 *   grading_rule_id,
 *   grading_rule_item_id,
 *   score,
 *   exam_type,
 *   exam_date,
 *   note
 * }
 */
export const createResult = async (data) => {
  if (!data) {
    throw new Error("Dữ liệu kết quả là bắt buộc");
  }

  requireId(data.student_id, "student_id");

  requireId(data.grading_rule_id, "grading_rule_id");

  requireId(data.grading_rule_item_id, "grading_rule_item_id");

  if (data.score === undefined || data.score === null || data.score === "") {
    throw new Error("score là bắt buộc");
  }

  const response = await axiosClient.post("/results", data);

  return unwrap(response);
};

/* ============================================================
 * RESULTS - UPDATE
 * ============================================================ */

/**
 * Cập nhật kết quả.
 *
 * PUT /results/:id
 */
export const updateResult = async (id, data) => {
  requireId(id, "result id");

  if (!data) {
    throw new Error("Dữ liệu cập nhật là bắt buộc");
  }

  const response = await axiosClient.put(`/results/${id}`, data);

  return unwrap(response);
};

/* ============================================================
 * RESULTS - DELETE
 * ============================================================ */

/**
 * Xóa kết quả.
 *
 * DELETE /results/:id
 */
export const deleteResult = async (id) => {
  requireId(id, "result id");

  const response = await axiosClient.delete(`/results/${id}`);

  return unwrap(response);
};

/* ============================================================
 * HELPER - GRADING RULE
 * ============================================================ */

/**
 * Lấy danh sách thành phần điểm.
 *
 * Ví dụ:
 *
 * const rule = await getGradingRule();
 * const items = getGradingRuleItems(rule);
 */
export const getGradingRuleItems = (ruleResponse) => {
  if (!ruleResponse) {
    return [];
  }

  const rule = ruleResponse?.data || ruleResponse;

  if (!Array.isArray(rule?.items)) {
    return [];
  }

  return rule.items;
};

/**
 * Tìm một thành phần điểm theo ID.
 */
export const findGradingRuleItem = (ruleResponse, itemId) => {
  const items = getGradingRuleItems(ruleResponse);

  return items.find((item) => String(item.id) === String(itemId)) || null;
};

/**
 * Tìm một thành phần điểm theo code.
 */
export const findGradingRuleItemByCode = (ruleResponse, code) => {
  const items = getGradingRuleItems(ruleResponse);

  return items.find((item) => item.code === code) || null;
};

/* ============================================================
 * HELPER - SCORE
 * ============================================================ */

/**
 * Kiểm tra điểm hợp lệ.
 */
export const isValidScore = (score, maxScore = 10) => {
  if (score === undefined || score === null || score === "") {
    return false;
  }

  const number = Number(score);

  if (!Number.isFinite(number)) {
    return false;
  }

  return number >= 0 && number <= Number(maxScore);
};

/**
 * Chuẩn hóa điểm trước khi gửi API.
 */
export const normalizeScore = (score) => {
  if (score === undefined || score === null || score === "") {
    return null;
  }

  const number = Number(score);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Number(number.toFixed(2));
};

/**
 * Kiểm tra học sinh đạt hay chưa.
 */
export const isPassedScore = (score, passScore = 5) => {
  if (score === undefined || score === null || score === "") {
    return false;
  }

  return Number(score) >= Number(passScore);
};

/* ============================================================
 * DEFAULT EXPORT
 * ============================================================ */

const resultApi = {
  // grading rule
  getGradingRule,
  getGradingRuleById,
  createGradingRule,
  updateGradingRule,
  deleteGradingRule,

  // statistics
  getResultStatistics,
  getClassStatistics,
  getStudentStatistics,

  // leaderboard
  getLeaderboard,
  getClassLeaderboard,

  // results
  getResultsByClass,
  getResultsByStudent,
  getResultsByRule,
  getResultsByRuleItem,
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,

  // helpers
  getGradingRuleItems,
  findGradingRuleItem,
  findGradingRuleItemByCode,
  isValidScore,
  normalizeScore,
  isPassedScore,
};

export default resultApi;

/**
 * RESULTS
├── CRUD kết quả
├── Bảng điểm
├── Thống kê
└── Xếp hạng

GRADING RULE
├── Lấy quy tắc
├── Lấy chi tiết
├── Tạo quy tắc
├── Cập nhật quy tắc
└── Xóa quy tắc
 */
