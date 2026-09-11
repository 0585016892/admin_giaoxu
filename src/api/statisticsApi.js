import axios from "./axios";

/**
 * =========================================================
 * XỬ LÝ LỖI API
 * =========================================================
 */
const handleError = (error) => {
  console.error("Statistics API Error:", error);

  const message =
    error?.response?.data?.message || "Không thể kết nối đến máy chủ.";

  throw new Error(message);
};

/**
 * =========================================================
 * TỔNG QUAN
 *
 * params:
 * {
 *   month,
 *   year
 * }
 *
 * Ví dụ:
 * getStatisticsOverview({
 *   month: 9,
 *   year: 2026
 * });
 * =========================================================
 */
export const getStatisticsOverview = async (params = {}) => {
  try {
    const response = await axios.get("/statistics/overview", {
      params,
    });

    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * =========================================================
 * THỐNG KÊ HỌC SINH
 *
 * Đây là số liệu hiện tại của giáo xứ.
 *
 * Không cần month/year.
 * =========================================================
 */
export const getStudentStatistics = async () => {
  try {
    const response = await axios.get("/statistics/students");

    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * =========================================================
 * THỐNG KÊ LỚP
 *
 * Đây là số liệu hiện tại của giáo xứ.
 *
 * Không cần month/year.
 * =========================================================
 */
export const getClassStatistics = async () => {
  try {
    const response = await axios.get("/statistics/classes");

    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * =========================================================
 * THỐNG KÊ CHUYÊN CẦN
 *
 * params có thể gồm:
 *
 * {
 *   month,
 *   year,
 *   from,
 *   to,
 *   class_id,
 *   attendance_type
 * }
 *
 * Ví dụ:
 *
 * {
 *   month: 9,
 *   year: 2026,
 *   attendance_type: "catechism"
 * }
 *
 * Hoặc:
 *
 * {
 *   from: "2026-09-01",
 *   to: "2026-09-30"
 * }
 * =========================================================
 */
export const getAttendanceStatistics = async (params = {}) => {
  try {
    const response = await axios.get("/statistics/attendance", {
      params,
    });

    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * =========================================================
 * THỐNG KÊ GIÁO LÝ VIÊN
 *
 * Đây là số liệu hiện tại của giáo xứ.
 *
 * Không cần month/year.
 * =========================================================
 */
export const getCatechistStatistics = async () => {
  try {
    const response = await axios.get("/statistics/catechists");

    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * =========================================================
 * LẤY TOÀN BỘ THỐNG KÊ
 *
 * attendanceParams:
 * {
 *   month,
 *   year,
 *   from,
 *   to,
 *   class_id,
 *   attendance_type
 * }
 *
 * Ví dụ:
 *
 * getAllStatistics({
 *   month: 9,
 *   year: 2026
 * });
 *
 * =========================================================
 */
export const getAllStatistics = async (attendanceParams = {}) => {
  try {
    const [overview, students, classes, attendance, catechists] =
      await Promise.all([
        /**
         * Overview cần month/year
         * vì chuyên cần trong overview
         * cũng cần lọc theo tháng.
         */
        getStatisticsOverview({
          month: attendanceParams.month,
          year: attendanceParams.year,
        }),

        /**
         * Số liệu hiện tại
         */
        getStudentStatistics(),

        getClassStatistics(),

        /**
         * Chuyên cần theo bộ lọc
         */
        getAttendanceStatistics(attendanceParams),

        /**
         * Số liệu giáo lý viên hiện tại
         */
        getCatechistStatistics(),
      ]);

    return {
      overview,
      students,
      classes,
      attendance,
      catechists,
    };
  } catch (error) {
    console.error("getAllStatistics error:", error);

    throw error;
  }
};
export const getStudentAttendanceStatistics = async (params = {}) => {
  try {
    const response = await axios.get("/statistics/attendance/students", {
      params,
    });

    return response.data;
  } catch (error) {
    return handleError(error);
  }
};
/**
 * =========================================================
 * DEFAULT EXPORT
 * =========================================================
 */

const statisticsApi = {
  getStatisticsOverview,
  getStudentStatistics,
  getClassStatistics,
  getAttendanceStatistics,
  getCatechistStatistics,
  getAllStatistics,
  getStudentAttendanceStatistics,
};

export default statisticsApi;
