/**
 * Parse ngày dạng DD/MM/YYYY
 */
export const getIssuedDateParts = (dateString) => {
  if (!dateString) {
    return {
      day: "",
      month: "",
      year: "",
      full: "",
    };
  }

  const parts = String(dateString).split("/");

  if (parts.length !== 3) {
    return {
      day: "",
      month: "",
      year: "",
      full: String(dateString),
    };
  }

  const [day = "", month = "", year = ""] = parts;

  const cleanDay = day ? String(Number(day)) : "";
  const cleanMonth = month ? String(Number(month)) : "";
  const cleanYear = String(year).trim();

  const full =
    cleanDay && cleanMonth && cleanYear
      ? `Ngày ${cleanDay} tháng ${cleanMonth} năm ${cleanYear}`
      : "";

  return {
    day: cleanDay,
    month: cleanMonth,
    year: cleanYear,
    full,
  };
};

/**
 * Chuyển DD/MM/YYYY
 * thành: Ngày 23 tháng 9 năm 2026
 */
export const formatVietnameseDate = (dateString) => {
  return getIssuedDateParts(dateString).full;
};

/**
 * Chuyển DD/MM/YYYY thành:
 * 23 tháng 9 năm 2026
 */
export const formatVietnameseDateShort = (dateString) => {
  const { day, month, year } = getIssuedDateParts(dateString);

  if (!day || !month || !year) {
    return "";
  }

  return `${day} tháng ${month} năm ${year}`;
};

/**
 * Kiểm tra ngày có đúng format DD/MM/YYYY hay không
 */
export const isValidDateString = (dateString) => {
  if (!dateString) return false;

  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(String(dateString))) {
    return false;
  }

  const [day, month, year] = String(dateString).split("/").map(Number);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};
