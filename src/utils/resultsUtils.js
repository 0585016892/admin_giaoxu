/* ============================================================
   RESULTS UTILS
   FaithEdu - Tính bảng điểm theo grading_rules
============================================================ */

/* ============================================================
   BASIC
============================================================ */

export const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

export const roundNumber = (value, digits = 1) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return null;
  }

  const safeDigits = Math.max(0, Math.min(10, Number(digits) || 0));

  const factor = 10 ** safeDigits;

  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

/* ============================================================
   RESPONSE
============================================================ */

export const extractList = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

export const extractObject = (response) => {
  if (!response) return null;

  if (response?.data?.data && !Array.isArray(response.data.data)) {
    return response.data.data;
  }

  if (response?.data && !Array.isArray(response.data)) {
    return response.data;
  }

  if (response?.data?.result && !Array.isArray(response.data.result)) {
    return response.data.result;
  }

  return response;
};

/* ============================================================
   RULE
============================================================ */

export const normalizeRule = (rule) => {
  if (!rule) return null;

  const rawItems =
    rule.items || rule.rule_items || rule.grading_rule_items || [];

  return {
    ...rule,

    id: Number(rule.id),

    church_id: rule.church_id !== undefined ? Number(rule.church_id) : null,

    calculation_type: rule.calculation_type || "weighted_average",

    multiplier: toNumber(rule.multiplier, 1),

    divisor:
      rule.divisor === null || rule.divisor === undefined || rule.divisor === ""
        ? null
        : toNumber(rule.divisor),

    rounding_digits: Number.isFinite(Number(rule.rounding_digits))
      ? Number(rule.rounding_digits)
      : 1,

    pass_score: toNumber(rule.pass_score, 5),

    status: rule.status || "active",

    items: rawItems
      .map((item, index) => ({
        ...item,

        id: Number(item.id),

        grading_rule_id: Number(item.grading_rule_id || rule.id),

        name: item.name || `Đầu điểm ${index + 1}`,

        code: item.code || `ITEM_${index + 1}`,

        weight: toNumber(item.weight, 1),

        max_score: toNumber(item.max_score, 10),

        sort_order: Number(item.sort_order) || index,

        allow_multiple: Boolean(Number(item.allow_multiple)),

        aggregation_method: item.aggregation_method || "latest",
      }))
      .sort((a, b) => a.sort_order - b.sort_order),
  };
};

/* ============================================================
   RESULT
============================================================ */

export const normalizeResult = (result) => {
  if (!result) return null;

  const student = result.student || result.students || {};

  const ruleItem = result.rule_item || result.grading_rule_item || {};

  const rule = result.grading_rule || result.rule || {};

  return {
    ...result,

    id: result.id !== undefined ? Number(result.id) : null,

    student_id: Number(result.student_id || student.id || 0) || null,

    student_name:
      result.student_name ||
      result.studentName ||
      student.name ||
      student.full_name ||
      "",

    student_code:
      result.student_code || result.studentCode || student.code || "",

    class_id:
      result.class_id !== undefined
        ? Number(result.class_id)
        : result.classId
          ? Number(result.classId)
          : null,

    class_name:
      result.class_name || result.className || result.class?.name || "",

    grading_rule_id:
      Number(
        result.grading_rule_id || ruleItem.grading_rule_id || rule.id || 0,
      ) || null,

    grading_rule_item_id:
      Number(
        result.grading_rule_item_id || result.rule_item_id || ruleItem.id || 0,
      ) || null,

    item_name: result.item_name || result.rule_item_name || ruleItem.name || "",

    item_code: result.item_code || ruleItem.code || "",

    item_weight: toNumber(
      result.item_weight ?? result.weight ?? ruleItem.weight,
      1,
    ),

    item_max_score: toNumber(
      result.item_max_score ?? result.max_score ?? ruleItem.max_score,
      10,
    ),

    score:
      result.score === null || result.score === undefined || result.score === ""
        ? null
        : toNumber(result.score),

    exam_type: result.exam_type || "paper",

    exam_date: result.exam_date || null,

    note: result.note || "",

    created_at: result.created_at || null,

    updated_at: result.updated_at || null,
  };
};

export const normalizeResults = (results) => {
  if (!Array.isArray(results)) {
    return [];
  }

  return results.map(normalizeResult).filter(Boolean);
};

/* ============================================================
   GROUP
============================================================ */

export const groupResultsByStudent = (results) => {
  const map = new Map();

  normalizeResults(results).forEach((result) => {
    const studentId = Number(result.student_id);

    if (!studentId) return;

    if (!map.has(studentId)) {
      map.set(studentId, []);
    }

    map.get(studentId).push(result);
  });

  return map;
};

export const groupResultsByItem = (results) => {
  const map = new Map();

  normalizeResults(results).forEach((result) => {
    const itemId = Number(result.grading_rule_item_id);

    if (!itemId) return;

    if (!map.has(itemId)) {
      map.set(itemId, []);
    }

    map.get(itemId).push(result);
  });

  return map;
};

/* ============================================================
   ATTEMPTS
============================================================ */

export const sortAttempts = (results) => {
  return [...results].sort((a, b) => {
    const dateA = a.exam_date ? new Date(a.exam_date).getTime() : 0;

    const dateB = b.exam_date ? new Date(b.exam_date).getTime() : 0;

    if (dateA !== dateB) {
      return dateB - dateA;
    }

    const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;

    const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;

    if (createdA !== createdB) {
      return createdB - createdA;
    }

    return Number(b.id || 0) - Number(a.id || 0);
  });
};

export const getStudentItemResults = (studentResults, ruleItemId) => {
  return sortAttempts(
    studentResults.filter(
      (result) => Number(result.grading_rule_item_id) === Number(ruleItemId),
    ),
  );
};

/* ============================================================
   AGGREGATION
============================================================ */

export const aggregateItemScore = (results, method = "latest") => {
  const validResults = sortAttempts(results).filter(
    (item) =>
      item.score !== null &&
      item.score !== undefined &&
      Number.isFinite(Number(item.score)),
  );

  if (!validResults.length) {
    return null;
  }

  const scores = validResults.map((item) => Number(item.score));

  switch (method) {
    case "average":
      return scores.reduce((sum, score) => sum + score, 0) / scores.length;

    case "highest":
      return Math.max(...scores);

    case "lowest":
      return Math.min(...scores);

    case "latest":
    default:
      return scores[0];
  }
};

/* ============================================================
   ITEM CALCULATION
============================================================ */

export const calculateItemScore = (studentResults, ruleItem) => {
  const attempts = getStudentItemResults(studentResults, ruleItem.id);

  const score = aggregateItemScore(attempts, ruleItem.aggregation_method);

  return {
    score: score === null ? null : roundNumber(score, 2),

    attempts,
  };
};

/* ============================================================
   FINAL SCORE
============================================================ */

export const calculateStudentScore = (studentResults = [], rule) => {
  if (!rule) {
    return {
      score: null,
      maxScore: 10,
      passed: false,
      completedItems: 0,
      totalItems: 0,
      itemScores: [],
      weightedTotal: 0,
      totalWeight: 0,
    };
  }

  const items = Array.isArray(rule.items) ? rule.items : [];

  const itemScores = items.map((ruleItem) => {
    const result = calculateItemScore(studentResults, ruleItem);

    return {
      ruleItemId: ruleItem.id,

      code: ruleItem.code,

      name: ruleItem.name,

      weight: toNumber(ruleItem.weight, 1),

      maxScore: toNumber(ruleItem.max_score, 10),

      aggregationMethod: ruleItem.aggregation_method,

      allowMultiple: Boolean(ruleItem.allow_multiple),

      score: result.score,

      attempts: result.attempts,
    };
  });

  const validItems = itemScores.filter(
    (item) => item.score !== null && item.score !== undefined,
  );

  const completedItems = validItems.length;

  const totalWeight = validItems.reduce((sum, item) => sum + item.weight, 0);

  const weightedTotal = validItems.reduce(
    (sum, item) => sum + item.score * item.weight,
    0,
  );

  let finalScore = null;

  switch (rule.calculation_type) {
    case "average":
      if (validItems.length) {
        finalScore =
          validItems.reduce((sum, item) => sum + item.score, 0) /
          validItems.length;
      }
      break;

    case "weighted_average":
      if (totalWeight > 0) {
        finalScore = weightedTotal / totalWeight;
      }
      break;

    case "sum":
      if (validItems.length) {
        finalScore = validItems.reduce((sum, item) => sum + item.score, 0);
      }
      break;

    case "sum_multiplier":
      if (validItems.length) {
        finalScore = validItems.reduce((sum, item) => sum + item.score, 0);

        finalScore *= toNumber(rule.multiplier, 1);

        if (rule.divisor !== null && Number(rule.divisor) > 0) {
          finalScore /= Number(rule.divisor);
        }
      }
      break;

    case "pass_fail":
      if (validItems.length) {
        finalScore =
          validItems.reduce((sum, item) => sum + item.score, 0) /
          validItems.length;
      }
      break;

    default:
      if (totalWeight > 0) {
        finalScore = weightedTotal / totalWeight;
      }
      break;
  }

  if (finalScore !== null) {
    finalScore = roundNumber(finalScore, rule.rounding_digits);
  }

  const passed =
    finalScore !== null && finalScore >= toNumber(rule.pass_score, 5);

  const maxScore =
    rule.calculation_type === "sum" ||
    rule.calculation_type === "sum_multiplier"
      ? items.reduce((sum, item) => sum + toNumber(item.max_score, 10), 0)
      : 10;

  return {
    score: finalScore,

    maxScore,

    passed,

    completedItems,

    totalItems: items.length,

    itemScores,

    weightedTotal,

    totalWeight,
  };
};

/* ============================================================
   STATUS
============================================================ */

export const getResultStatus = (score, rule) => {
  if (score === null || score === undefined) {
    return {
      key: "pending",
      label: "Chưa đủ điểm",
    };
  }

  const passScore = toNumber(rule?.pass_score, 5);

  if (Number(score) < passScore) {
    return {
      key: "fail",
      label: "Chưa đạt",
    };
  }

  if (Number(score) >= 8) {
    return {
      key: "good",
      label: "Giỏi",
    };
  }

  return {
    key: "pass",
    label: "Đạt",
  };
};

/* ============================================================
   SUMMARY
============================================================ */

export const buildStudentSummary = ({ student, results, rule }) => {
  const calculation = calculateStudentScore(results, rule);

  return {
    student_id: Number(student?.id),

    student_name: student?.name || student?.full_name || "Chưa có tên",

    student_code: student?.code || "",

    guardian_name: student?.guardian_name || "",

    results,

    ...calculation,

    status: getResultStatus(calculation.score, rule),
  };
};

export const buildClassSummaries = ({ students = [], results = [], rule }) => {
  const grouped = groupResultsByStudent(results);

  return students.map((student) =>
    buildStudentSummary({
      student,

      results: grouped.get(Number(student.id)) || [],

      rule,
    }),
  );
};

/* ============================================================
   STATISTICS
============================================================ */

export const calculateClassStatistics = (summaries = [], rule) => {
  const totalStudents = summaries.length;

  const completed = summaries.filter(
    (item) => item.score !== null && item.score !== undefined,
  );

  const passed = completed.filter((item) => item.passed);

  const failed = completed.filter(
    (item) => Number(item.score) < toNumber(rule?.pass_score, 5),
  );

  const good = completed.filter((item) => Number(item.score) >= 8);

  const average = completed.length
    ? completed.reduce((sum, item) => sum + Number(item.score), 0) /
      completed.length
    : 0;

  return {
    totalStudents,

    completedStudents: completed.length,

    pendingStudents: totalStudents - completed.length,

    passedStudents: passed.length,

    failedStudents: failed.length,

    goodStudents: good.length,

    averageScore: roundNumber(average, rule?.rounding_digits ?? 1) || 0,

    passRate:
      totalStudents > 0 ? Math.round((passed.length / totalStudents) * 100) : 0,

    completionRate:
      totalStudents > 0
        ? Math.round((completed.length / totalStudents) * 100)
        : 0,
  };
};

/* ============================================================
   LEADERBOARD
============================================================ */

export const sortStudentsByScore = (students) => {
  return [...students].sort((a, b) => {
    const scoreA = a.score === null ? -Infinity : Number(a.score);

    const scoreB = b.score === null ? -Infinity : Number(b.score);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    return String(a.student_name || "").localeCompare(
      String(b.student_name || ""),
      "vi",
    );
  });
};

export const getLeaderboardRows = (summaries) => {
  const sorted = sortStudentsByScore(summaries);

  let lastScore = null;
  let rank = 0;

  return sorted.map((student, index) => {
    const score = student.score === null ? null : Number(student.score);

    if (score !== null && score !== lastScore) {
      rank = index + 1;
      lastScore = score;
    }

    return {
      ...student,
      rank: score === null ? null : rank,
    };
  });
};

/* ============================================================
   FORMATTING
============================================================ */

export const formatScore = (score, digits = 1) => {
  if (score === null || score === undefined || score === "") {
    return "—";
  }

  return Number(score).toFixed(digits);
};

export const formatExamType = (type) => {
  if (type === "online") {
    return "Online";
  }

  if (type === "paper") {
    return "Bài giấy";
  }

  return type || "—";
};

export const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("vi-VN");
};

/* ============================================================
   CALCULATION LABEL
============================================================ */

export const CALCULATION_LABELS = {
  average: "Trung bình cộng",

  weighted_average: "Trung bình có hệ số",

  sum: "Tổng điểm",

  sum_multiplier: "Tổng điểm × hệ số",

  pass_fail: "Đạt / Chưa đạt",
};

export const AGGREGATION_LABELS = {
  latest: "Lần mới nhất",

  average: "Trung bình",

  highest: "Cao nhất",

  lowest: "Thấp nhất",
};

/* ============================================================
   EXPORT
============================================================ */

const resultsUtils = {
  toNumber,
  roundNumber,

  extractList,
  extractObject,

  normalizeRule,
  normalizeResult,
  normalizeResults,

  groupResultsByStudent,
  groupResultsByItem,

  sortAttempts,
  getStudentItemResults,
  aggregateItemScore,
  calculateItemScore,

  calculateStudentScore,

  getResultStatus,

  buildStudentSummary,
  buildClassSummaries,

  calculateClassStatistics,

  sortStudentsByScore,
  getLeaderboardRows,

  formatScore,
  formatExamType,
  formatDate,

  CALCULATION_LABELS,
  AGGREGATION_LABELS,
};

export default resultsUtils;
