// ============================================================
// FaithEdu - Grading Rule Utils
// ============================================================

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------

export const CALCULATION_TYPES = {
  AVERAGE: "average",
  WEIGHTED_AVERAGE: "weighted_average",
  SUM: "sum",
  SUM_MULTIPLIER: "sum_multiplier",
  PASS_FAIL: "pass_fail",
};

export const AGGREGATION_METHODS = {
  LATEST: "latest",
  AVERAGE: "average",
  HIGHEST: "highest",
  LOWEST: "lowest",
};

export const CALCULATION_LABELS = {
  [CALCULATION_TYPES.AVERAGE]: "Trung bình cộng",

  [CALCULATION_TYPES.WEIGHTED_AVERAGE]: "Trung bình có trọng số",

  [CALCULATION_TYPES.SUM]: "Tổng điểm",

  [CALCULATION_TYPES.SUM_MULTIPLIER]: "Tổng điểm × hệ số",

  [CALCULATION_TYPES.PASS_FAIL]: "Đạt / Không đạt",
};

export const CALCULATION_DESCRIPTIONS = {
  [CALCULATION_TYPES.AVERAGE]:
    "Tính trung bình cộng của tất cả các thành phần điểm.",

  [CALCULATION_TYPES.WEIGHTED_AVERAGE]:
    "Mỗi thành phần điểm được tính theo trọng số đã cấu hình.",

  [CALCULATION_TYPES.SUM]: "Cộng toàn bộ điểm của các thành phần.",

  [CALCULATION_TYPES.SUM_MULTIPLIER]:
    "Cộng điểm, sau đó nhân với hệ số và có thể chia cho mẫu số.",

  [CALCULATION_TYPES.PASS_FAIL]:
    "Xác định kết quả Đạt hoặc Không đạt dựa trên điểm chuẩn.",
};

export const AGGREGATION_LABELS = {
  [AGGREGATION_METHODS.LATEST]: "Lần gần nhất",

  [AGGREGATION_METHODS.AVERAGE]: "Trung bình",

  [AGGREGATION_METHODS.HIGHEST]: "Cao nhất",

  [AGGREGATION_METHODS.LOWEST]: "Thấp nhất",
};

// ------------------------------------------------------------
// Basic helpers
// ------------------------------------------------------------

export const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

export const normalizeBoolean = (value) => {
  if (value === true || value === 1 || value === "1" || value === "true") {
    return 1;
  }

  return 0;
};

export const normalizeScore = (value, digits = 2) => {
  const number = toNumber(value, 0);

  return Number(number.toFixed(digits));
};

export const formatScore = (value, digits = 1) => {
  const number = toNumber(value, 0);

  return number.toFixed(digits);
};

export const formatWeight = (value) => {
  const number = toNumber(value, 1);

  if (Number.isInteger(number)) {
    return String(number);
  }

  return number.toFixed(4).replace(/\.?0+$/, "");
};

// ------------------------------------------------------------
// Calculation type helpers
// ------------------------------------------------------------

export const isValidCalculationType = (type) => {
  return Object.values(CALCULATION_TYPES).includes(type);
};

export const isValidAggregationMethod = (method) => {
  return Object.values(AGGREGATION_METHODS).includes(method);
};

// ------------------------------------------------------------
// Rule normalization
// ------------------------------------------------------------

export const normalizeRuleItem = (item = {}, index = 0) => {
  return {
    id: item.id ?? null,

    grading_rule_id: item.grading_rule_id ?? item.gradingRuleId ?? null,

    name: String(item.name ?? "").trim(),

    code: String(item.code ?? "")
      .trim()
      .toUpperCase(),

    weight: toNumber(item.weight, 1),

    max_score: toNumber(item.max_score ?? item.maxScore, 10),

    sort_order: toNumber(item.sort_order ?? item.sortOrder, index),

    allow_multiple: normalizeBoolean(item.allow_multiple ?? item.allowMultiple),

    aggregation_method:
      item.aggregation_method ??
      item.aggregationMethod ??
      AGGREGATION_METHODS.LATEST,
  };
};

export const sortRuleItems = (items = []) => {
  return [...items].sort((a, b) => {
    const sortA = toNumber(a.sort_order, 0);
    const sortB = toNumber(b.sort_order, 0);

    if (sortA !== sortB) {
      return sortA - sortB;
    }

    return String(a.name || "").localeCompare(String(b.name || ""), "vi");
  });
};

export const normalizeRule = (rule = {}) => {
  const rawItems = Array.isArray(rule.items)
    ? rule.items
    : Array.isArray(rule.rule_items)
      ? rule.rule_items
      : [];

  const items = sortRuleItems(
    rawItems.map((item, index) => normalizeRuleItem(item, index)),
  );

  const calculationType =
    rule.calculation_type ??
    rule.calculationType ??
    CALCULATION_TYPES.WEIGHTED_AVERAGE;

  return {
    id: rule.id ?? null,

    church_id: rule.church_id ?? rule.churchId ?? null,

    calculation_type: isValidCalculationType(calculationType)
      ? calculationType
      : CALCULATION_TYPES.WEIGHTED_AVERAGE,

    multiplier: toNumber(rule.multiplier, 1),

    divisor:
      rule.divisor === null || rule.divisor === undefined || rule.divisor === ""
        ? null
        : toNumber(rule.divisor, 1),

    rounding_digits: toNumber(rule.rounding_digits ?? rule.roundingDigits, 1),

    pass_score: toNumber(rule.pass_score ?? rule.passScore, 5),

    status: rule.status === "inactive" ? "inactive" : "active",

    items,
  };
};

// ------------------------------------------------------------
// Rule item helpers
// ------------------------------------------------------------

export const getTotalWeight = (items = []) => {
  return items.reduce((total, item) => total + toNumber(item.weight, 0), 0);
};

export const getTotalMaxScore = (items = []) => {
  return items.reduce((total, item) => total + toNumber(item.max_score, 0), 0);
};

export const getAverageMaxScore = (items = []) => {
  if (!items.length) {
    return 0;
  }

  return getTotalMaxScore(items) / items.length;
};

export const hasDuplicateItemCodes = (items = []) => {
  const codes = items
    .map((item) =>
      String(item.code || "")
        .trim()
        .toUpperCase(),
    )
    .filter(Boolean);

  return new Set(codes).size !== codes.length;
};

export const findDuplicateItemCodes = (items = []) => {
  const counter = {};

  items.forEach((item) => {
    const code = String(item.code || "")
      .trim()
      .toUpperCase();

    if (!code) {
      return;
    }

    counter[code] = (counter[code] || 0) + 1;
  });

  return Object.entries(counter)
    .filter(([, count]) => count > 1)
    .map(([code]) => code);
};

// ------------------------------------------------------------
// Rule validation
// ------------------------------------------------------------

export const validateRuleItems = (items = []) => {
  const errors = [];

  if (!Array.isArray(items) || items.length === 0) {
    errors.push("Quy tắc phải có ít nhất một thành phần điểm.");

    return errors;
  }

  const duplicateCodes = findDuplicateItemCodes(items);

  if (duplicateCodes.length > 0) {
    errors.push(`Mã thành phần bị trùng: ${duplicateCodes.join(", ")}.`);
  }

  items.forEach((item, index) => {
    const position = index + 1;

    const name = String(item.name || "").trim();

    const code = String(item.code || "")
      .trim()
      .toUpperCase();

    const weight = toNumber(item.weight, 0);

    const maxScore = toNumber(item.max_score, 0);

    const aggregationMethod =
      item.aggregation_method ?? AGGREGATION_METHODS.LATEST;

    if (!name) {
      errors.push(`Thành phần thứ ${position} chưa có tên.`);
    }

    if (!code) {
      errors.push(`Thành phần thứ ${position} chưa có mã.`);
    }

    if (weight <= 0) {
      errors.push(`Trọng số của thành phần thứ ${position} phải lớn hơn 0.`);
    }

    if (maxScore <= 0) {
      errors.push(`Điểm tối đa của thành phần thứ ${position} phải lớn hơn 0.`);
    }

    if (!isValidAggregationMethod(aggregationMethod)) {
      errors.push(
        `Phương thức lấy điểm của thành phần thứ ${position} không hợp lệ.`,
      );
    }
  });

  return errors;
};

export const validateRule = (rule = {}, items = []) => {
  const errors = [];

  const calculationType = rule.calculation_type ?? rule.calculationType;

  if (!isValidCalculationType(calculationType)) {
    errors.push("Loại tính điểm không hợp lệ.");
  }

  const roundingDigits = toNumber(
    rule.rounding_digits ?? rule.roundingDigits,
    1,
  );

  if (roundingDigits < 0 || roundingDigits > 4) {
    errors.push("Số chữ số làm tròn phải từ 0 đến 4.");
  }

  const passScore = toNumber(rule.pass_score ?? rule.passScore, 5);

  if (passScore < 0) {
    errors.push("Điểm đạt không được nhỏ hơn 0.");
  }

  if (calculationType === CALCULATION_TYPES.SUM_MULTIPLIER) {
    const multiplier = toNumber(rule.multiplier, 0);

    if (multiplier <= 0) {
      errors.push("Hệ số phải lớn hơn 0.");
    }

    if (
      rule.divisor !== null &&
      rule.divisor !== undefined &&
      rule.divisor !== ""
    ) {
      const divisor = toNumber(rule.divisor, 0);

      if (divisor <= 0) {
        errors.push("Mẫu số phải lớn hơn 0.");
      }
    }
  }

  errors.push(...validateRuleItems(items));

  return errors;
};

// ------------------------------------------------------------
// Score helpers
// ------------------------------------------------------------

export const isValidScore = (score, maxScore = 10) => {
  const value = Number(score);
  const max = Number(maxScore);

  if (!Number.isFinite(value)) {
    return false;
  }

  if (!Number.isFinite(max) || max <= 0) {
    return false;
  }

  return value >= 0 && value <= max;
};

export const isPassedScore = (score, passScore = 5) => {
  return toNumber(score, 0) >= toNumber(passScore, 5);
};

// ------------------------------------------------------------
// Aggregation
// ------------------------------------------------------------

export const aggregateScores = (
  scores = [],
  method = AGGREGATION_METHODS.LATEST,
) => {
  const normalizedScores = scores.map((score) => toNumber(score, 0));

  if (!normalizedScores.length) {
    return 0;
  }

  switch (method) {
    case AGGREGATION_METHODS.AVERAGE:
      return calculateAverage(normalizedScores);

    case AGGREGATION_METHODS.HIGHEST:
      return Math.max(...normalizedScores);

    case AGGREGATION_METHODS.LOWEST:
      return Math.min(...normalizedScores);

    case AGGREGATION_METHODS.LATEST:
    default:
      return normalizedScores[normalizedScores.length - 1];
  }
};

// ------------------------------------------------------------
// Calculation
// ------------------------------------------------------------

export const calculateAverage = (scores = []) => {
  if (!scores.length) {
    return 0;
  }

  const total = scores.reduce((sum, score) => sum + toNumber(score, 0), 0);

  return total / scores.length;
};

export const calculateWeightedAverage = (values = []) => {
  if (!values.length) {
    return 0;
  }

  let weightedTotal = 0;
  let totalWeight = 0;

  values.forEach((item) => {
    const score = toNumber(item.score, 0);

    const weight = toNumber(item.weight, 0);

    if (weight <= 0) {
      return;
    }

    weightedTotal += score * weight;

    totalWeight += weight;
  });

  if (totalWeight <= 0) {
    return 0;
  }

  return weightedTotal / totalWeight;
};

export const calculateResult = ({
  calculationType,
  items = [],
  scores = [],
  multiplier = 1,
  divisor = null,
  roundingDigits = 1,
  passScore = 5,
} = {}) => {
  let result = 0;

  const normalizedScores = scores.map((score) => toNumber(score, 0));

  switch (calculationType) {
    // --------------------------------------------------------
    // Average
    // --------------------------------------------------------

    case CALCULATION_TYPES.AVERAGE:
      result = calculateAverage(normalizedScores);
      break;

    // --------------------------------------------------------
    // Weighted average
    // --------------------------------------------------------

    case CALCULATION_TYPES.WEIGHTED_AVERAGE:
      result = calculateWeightedAverage(
        items.map((item, index) => ({
          score: normalizedScores[index] ?? 0,

          weight: toNumber(item.weight, 0),
        })),
      );
      break;

    // --------------------------------------------------------
    // Sum
    // --------------------------------------------------------

    case CALCULATION_TYPES.SUM:
      result = normalizedScores.reduce((sum, score) => sum + score, 0);
      break;

    // --------------------------------------------------------
    // Sum × multiplier / divisor
    // --------------------------------------------------------

    case CALCULATION_TYPES.SUM_MULTIPLIER: {
      const total = normalizedScores.reduce((sum, score) => sum + score, 0);

      result = total * toNumber(multiplier, 1);

      const normalizedDivisor = toNumber(divisor, 0);

      if (normalizedDivisor > 0) {
        result /= normalizedDivisor;
      }

      break;
    }

    // --------------------------------------------------------
    // Pass / Fail
    // --------------------------------------------------------

    case CALCULATION_TYPES.PASS_FAIL:
      result =
        calculateAverage(normalizedScores) >= toNumber(passScore, 5) ? 1 : 0;

      break;

    default:
      result = 0;
  }

  return normalizeScore(result, roundingDigits);
};

// ------------------------------------------------------------
// Maximum possible result
// ------------------------------------------------------------

export const calculateMaxScore = ({
  calculationType,
  items = [],
  multiplier = 1,
  divisor = null,
  roundingDigits = 1,
} = {}) => {
  if (!items.length) {
    return 0;
  }

  let result = 0;

  switch (calculationType) {
    // --------------------------------------------------------
    // Average
    // --------------------------------------------------------

    case CALCULATION_TYPES.AVERAGE: {
      const total = getTotalMaxScore(items);

      result = total / items.length;

      break;
    }

    // --------------------------------------------------------
    // Weighted average
    // --------------------------------------------------------

    case CALCULATION_TYPES.WEIGHTED_AVERAGE:
      result = calculateWeightedAverage(
        items.map((item) => ({
          score: toNumber(item.max_score, 0),

          weight: toNumber(item.weight, 1),
        })),
      );
      break;

    // --------------------------------------------------------
    // Sum
    // --------------------------------------------------------

    case CALCULATION_TYPES.SUM:
      result = getTotalMaxScore(items);
      break;

    // --------------------------------------------------------
    // Sum × multiplier / divisor
    // --------------------------------------------------------

    case CALCULATION_TYPES.SUM_MULTIPLIER: {
      result = getTotalMaxScore(items) * toNumber(multiplier, 1);

      const normalizedDivisor = toNumber(divisor, 0);

      if (normalizedDivisor > 0) {
        result /= normalizedDivisor;
      }

      break;
    }

    // --------------------------------------------------------
    // Pass / Fail
    // --------------------------------------------------------

    case CALCULATION_TYPES.PASS_FAIL:
      result = 1;
      break;

    default:
      result = 0;
  }

  return normalizeScore(result, roundingDigits);
};

// ------------------------------------------------------------
// Formula
// ------------------------------------------------------------

export const buildFormula = ({
  calculationType,
  items = [],
  multiplier = 1,
  divisor = null,
  passScore = 5,
} = {}) => {
  const itemCodes = items
    .map((item) =>
      String(item.code || "?")
        .trim()
        .toUpperCase(),
    )
    .filter(Boolean);

  switch (calculationType) {
    // --------------------------------------------------------
    // Average
    // --------------------------------------------------------

    case CALCULATION_TYPES.AVERAGE:
      return itemCodes.length
        ? `(${itemCodes.join(" + ")}) / ${itemCodes.length}`
        : "Trung bình cộng các thành phần";

    // --------------------------------------------------------
    // Weighted average
    // --------------------------------------------------------

    case CALCULATION_TYPES.WEIGHTED_AVERAGE:
      return itemCodes.length
        ? `${itemCodes
            .map((code) => `${code} × trọng số`)
            .join(" + ")} / tổng trọng số`
        : "Σ(Điểm × trọng số) / Σ trọng số";

    // --------------------------------------------------------
    // Sum
    // --------------------------------------------------------

    case CALCULATION_TYPES.SUM:
      return itemCodes.length ? itemCodes.join(" + ") : "Tổng các thành phần";

    // --------------------------------------------------------
    // Sum × multiplier / divisor
    // --------------------------------------------------------

    case CALCULATION_TYPES.SUM_MULTIPLIER: {
      let formula = itemCodes.length
        ? `(${itemCodes.join(" + ")})`
        : "(Tổng điểm)";

      formula += ` × ${formatWeight(multiplier)}`;

      if (
        divisor !== null &&
        divisor !== undefined &&
        toNumber(divisor, 0) > 0
      ) {
        formula += ` / ${formatWeight(divisor)}`;
      }

      return formula;
    }

    // --------------------------------------------------------
    // Pass / Fail
    // --------------------------------------------------------

    case CALCULATION_TYPES.PASS_FAIL:
      return `Điểm tổng kết ≥ ${formatScore(passScore, 1)} → Đạt`;

    default:
      return "Chưa xác định công thức";
  }
};

// ------------------------------------------------------------
// Payload
// ------------------------------------------------------------

export const normalizeRulePayload = (values = {}, items = []) => {
  const calculationType =
    values.calculation_type ??
    values.calculationType ??
    CALCULATION_TYPES.WEIGHTED_AVERAGE;

  const normalizedItems = sortRuleItems(
    items.map((item, index) => normalizeRuleItem(item, index)),
  ).map((item, index) => ({
    ...(item.id ? { id: item.id } : {}),

    name: item.name.trim(),

    code: item.code.trim().toUpperCase(),

    weight: toNumber(item.weight, 1),

    max_score: toNumber(item.max_score, 10),

    sort_order: index,

    allow_multiple: normalizeBoolean(item.allow_multiple),

    aggregation_method: isValidAggregationMethod(item.aggregation_method)
      ? item.aggregation_method
      : AGGREGATION_METHODS.LATEST,
  }));

  return {
    calculation_type: isValidCalculationType(calculationType)
      ? calculationType
      : CALCULATION_TYPES.WEIGHTED_AVERAGE,

    multiplier: toNumber(values.multiplier, 1),

    divisor:
      values.divisor === null ||
      values.divisor === undefined ||
      values.divisor === ""
        ? null
        : toNumber(values.divisor, 1),

    rounding_digits: Math.min(
      4,
      Math.max(0, toNumber(values.rounding_digits, 1)),
    ),

    pass_score: toNumber(values.pass_score, 5),

    status: values.status === "inactive" ? "inactive" : "active",

    items: normalizedItems,
  };
};

// ------------------------------------------------------------
// Labels
// ------------------------------------------------------------

export const getCalculationLabel = (type) => {
  return CALCULATION_LABELS[type] || "Chưa xác định";
};

export const getCalculationDescription = (type) => {
  return CALCULATION_DESCRIPTIONS[type] || "";
};

export const getAggregationLabel = (method) => {
  return AGGREGATION_LABELS[method] || "Lần gần nhất";
};

// ------------------------------------------------------------
// Default export
// ------------------------------------------------------------
//
// Có default export dạng biến có tên để ESLint
// không cảnh báo:
// import/no-anonymous-default-export
//
// Nếu project chỉ dùng named import thì vẫn có thể
// import trực tiếp các export ở trên.
// ------------------------------------------------------------

const gradingRuleUtils = {
  CALCULATION_TYPES,
  AGGREGATION_METHODS,

  CALCULATION_LABELS,
  CALCULATION_DESCRIPTIONS,
  AGGREGATION_LABELS,

  toNumber,
  normalizeBoolean,
  normalizeScore,

  formatScore,
  formatWeight,

  isValidCalculationType,
  isValidAggregationMethod,

  normalizeRule,
  normalizeRuleItem,
  sortRuleItems,

  getTotalWeight,
  getTotalMaxScore,
  getAverageMaxScore,

  hasDuplicateItemCodes,
  findDuplicateItemCodes,

  validateRuleItems,
  validateRule,

  isValidScore,
  isPassedScore,

  aggregateScores,

  calculateAverage,
  calculateWeightedAverage,
  calculateResult,
  calculateMaxScore,

  buildFormula,

  normalizeRulePayload,

  getCalculationLabel,
  getCalculationDescription,
  getAggregationLabel,
};

export default gradingRuleUtils;
