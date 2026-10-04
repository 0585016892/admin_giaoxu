import axios from "./axios";

/**
 * =========================================================
 * STATISTICS API
 * =========================================================
 *
 * Các API:
 *
 * 1. Tổng quan
 *    GET /statistics/overview
 *
 * 2. Thống kê học sinh
 *    GET /statistics/students
 *
 * 3. Thống kê lớp
 *    GET /statistics/classes
 *
 * 4. Thống kê chuyên cần
 *    GET /statistics/attendance
 *
 * 5. Thống kê giáo lý viên
 *    GET /statistics/catechists
 *
 * 6. Thống kê điểm danh từng học sinh
 *    GET /statistics/attendance/students
 *
 * 7. Xuất báo cáo điểm danh
 *    GET /attendance/export
 *
 * =========================================================
 */

/**
 * =========================================================
 * LOG PREFIX
 * =========================================================
 */

const LOG_PREFIX = "[STATISTICS API]";

/**
 * =========================================================
 * XỬ LÝ LỖI CHUNG
 * =========================================================
 */
const handleError = (
  error,
  defaultMessage = "Không thể kết nối đến máy chủ.",
) => {
  console.error(`${LOG_PREFIX} ERROR:`, error);

  const message =
    error?.response?.data?.message || error?.message || defaultMessage;

  throw new Error(message);
};

/**
 * =========================================================
 * CHUẨN HÓA PARAMS
 * =========================================================
 *
 * Loại bỏ:
 * - undefined
 * - null
 * - ""
 *
 * Đặc biệt:
 *
 * attendance_type = mass
 *
 * => KHÔNG được gửi class_id
 *
 * Vì Thánh lễ không tổ chức theo lớp.
 * =========================================================
 */
const normalizeAttendanceParams = (params = {}) => {
  const normalized = {};

  /**
   * -------------------------------------------------------
   * MONTH
   * -------------------------------------------------------
   */
  if (
    params.month !== undefined &&
    params.month !== null &&
    params.month !== ""
  ) {
    normalized.month = Number(params.month);
  }

  /**
   * -------------------------------------------------------
   * YEAR
   * -------------------------------------------------------
   */
  if (params.year !== undefined && params.year !== null && params.year !== "") {
    normalized.year = Number(params.year);
  }

  /**
   * -------------------------------------------------------
   * FROM
   * -------------------------------------------------------
   */
  if (params.from) {
    normalized.from = params.from;
  }

  /**
   * -------------------------------------------------------
   * TO
   * -------------------------------------------------------
   */
  if (params.to) {
    normalized.to = params.to;
  }

  /**
   * -------------------------------------------------------
   * ATTENDANCE TYPE
   * -------------------------------------------------------
   */
  if (params.attendance_type) {
    normalized.attendance_type = params.attendance_type;
  }

  /**
   * -------------------------------------------------------
   * CLASS ID
   *
   * MASS:
   * KHÔNG BAO GIỜ gửi class_id
   *
   * CATECHISM:
   * được phép gửi class_id
   * -------------------------------------------------------
   */
  if (
    params.attendance_type !== "mass" &&
    params.class_id !== undefined &&
    params.class_id !== null &&
    params.class_id !== ""
  ) {
    normalized.class_id = Number(params.class_id);
  }

  return normalized;
};

/**
 * =========================================================
 * 1. TỔNG QUAN
 * =========================================================
 *
 * GET /statistics/overview
 *
 * params:
 *
 * {
 *   month,
 *   year
 * }
 *
 * Ví dụ:
 *
 * getStatisticsOverview({
 *   month: 10,
 *   year: 2026
 * });
 *
 * =========================================================
 */
export const getStatisticsOverview = async (params = {}) => {
  try {
    const cleanParams = {};

    if (
      params.month !== undefined &&
      params.month !== null &&
      params.month !== ""
    ) {
      cleanParams.month = Number(params.month);
    }

    if (
      params.year !== undefined &&
      params.year !== null &&
      params.year !== ""
    ) {
      cleanParams.year = Number(params.year);
    }

    const response = await axios.get("/statistics/overview", {
      params: cleanParams,
    });

    return response.data;
  } catch (error) {
    return handleError(error, "Không thể tải thống kê tổng quan.");
  }
};

/**
 * =========================================================
 * 2. THỐNG KÊ HỌC SINH
 * =========================================================
 *
 * GET /statistics/students
 *
 * Số liệu hiện tại của giáo xứ.
 *
 * Không cần month/year.
 *
 * =========================================================
 */
export const getStudentStatistics = async () => {
  try {
    const response = await axios.get("/statistics/students");

    return response.data;
  } catch (error) {
    return handleError(error, "Không thể tải thống kê học sinh.");
  }
};

/**
 * =========================================================
 * 3. THỐNG KÊ LỚP
 * =========================================================
 *
 * GET /statistics/classes
 *
 * Số liệu hiện tại của giáo xứ.
 *
 * Không cần month/year.
 *
 * =========================================================
 */
export const getClassStatistics = async () => {
  try {
    const response = await axios.get("/statistics/classes");

    return response.data;
  } catch (error) {
    return handleError(error, "Không thể tải thống kê lớp.");
  }
};

/**
 * =========================================================
 * 4. THỐNG KÊ CHUYÊN CẦN
 * =========================================================
 *
 * GET /statistics/attendance
 *
 * params:
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
 * attendance_type:
 *
 * - catechism
 * - mass
 *
 * MASS:
 *
 * class_id sẽ tự động bị loại bỏ.
 *
 * =========================================================
 */
export const getAttendanceStatistics = async (params = {}) => {
  try {
    const cleanParams = normalizeAttendanceParams(params);

    const response = await axios.get("/statistics/attendance", {
      params: cleanParams,
    });

    return response.data;
  } catch (error) {
    return handleError(error, "Không thể tải thống kê chuyên cần.");
  }
};

/**
 * =========================================================
 * 5. THỐNG KÊ GIÁO LÝ VIÊN
 * =========================================================
 *
 * GET /statistics/catechists
 *
 * Số liệu hiện tại của giáo xứ.
 *
 * Không cần month/year.
 *
 * =========================================================
 */
export const getCatechistStatistics = async () => {
  try {
    const response = await axios.get("/statistics/catechists");

    return response.data;
  } catch (error) {
    return handleError(error, "Không thể tải thống kê giáo lý viên.");
  }
};

/**
 * =========================================================
 * 6. THỐNG KÊ ĐIỂM DANH TỪNG HỌC SINH
 * =========================================================
 *
 * GET /statistics/attendance/students
 *
 * params:
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
 * MASS:
 *
 * class_id sẽ tự động bị loại bỏ.
 *
 * =========================================================
 */
export const getStudentAttendanceStatistics = async (params = {}) => {
  try {
    const cleanParams = normalizeAttendanceParams(params);

    const response = await axios.get("/statistics/attendance/students", {
      params: cleanParams,
    });

    return response.data;
  } catch (error) {
    return handleError(error, "Không thể tải thống kê điểm danh học sinh.");
  }
};

/**
 * =========================================================
 * 7. XUẤT BÁO CÁO ĐIỂM DANH
 * =========================================================
 *
 * GET /attendance/export
 *
 * params:
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
 * MASS:
 *
 * class_id sẽ tự động bị loại bỏ.
 *
 * response:
 *
 * Blob
 *
 * =========================================================
 */
export const exportAttendanceReport = async (params = {}) => {
  try {
    console.log("");
    console.log("============================================================");
    console.log("📤 EXPORT ATTENDANCE REPORT");
    console.log("============================================================");
    console.log("PARAMS:", params);

    const response = await axios.get("/statistics/attendance/export", {
      params,
      responseType: "blob",
    });

    console.log("✅ EXPORT STATUS:", response.status);
    console.log("✅ EXPORT CONTENT-TYPE:", response.headers?.["content-type"]);
    console.log("✅ EXPORT DATA SIZE:", response.data?.size);

    const contentType =
      response.headers?.["content-type"] || response.data?.type || "";

    // =====================================================
    // FILE EXCEL
    // =====================================================

    if (
      contentType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ) ||
      contentType.includes("application/octet-stream")
    ) {
      return response;
    }

    // =====================================================
    // JSON ERROR
    // =====================================================

    if (contentType.includes("application/json")) {
      try {
        const text = await response.data.text();

        console.error("❌ EXPORT JSON ERROR:", text);

        const data = JSON.parse(text);

        throw new Error(data?.message || "Không thể xuất báo cáo điểm danh.");
      } catch (error) {
        if (error instanceof Error && error.message) {
          throw error;
        }

        throw new Error("Không thể xuất báo cáo điểm danh.");
      }
    }

    // =====================================================
    // HTML ERROR
    // =====================================================

    if (contentType.includes("text/html")) {
      const text = await response.data.text();

      console.error("❌ EXPORT SERVER RETURNED HTML:");
      console.error(text.substring(0, 1000));

      throw new Error(
        "API xuất báo cáo đang trả về HTML thay vì file Excel. Kiểm tra route /attendance/export trên server.",
      );
    }

    // =====================================================
    // UNKNOWN
    // =====================================================

    console.error("❌ UNKNOWN EXPORT RESPONSE");
    console.error("Content-Type:", contentType);

    throw new Error("Máy chủ trả về dữ liệu không hợp lệ khi xuất báo cáo.");
  } catch (error) {
    console.error("");
    console.error(
      "============================================================",
    );
    console.error("❌ EXPORT ATTENDANCE ERROR");
    console.error(
      "============================================================",
    );
    console.error("MESSAGE:", error?.message);
    console.error("STATUS:", error?.response?.status);
    console.error("CONTENT-TYPE:", error?.response?.headers?.["content-type"]);

    // Axios có thể trả Blob dù HTTP 4xx/5xx
    if (error?.response?.data instanceof Blob) {
      try {
        const contentType =
          error.response.headers?.["content-type"] ||
          error.response.data.type ||
          "";

        if (contentType.includes("application/json")) {
          const text = await error.response.data.text();

          console.error("SERVER ERROR JSON:", text);

          const data = JSON.parse(text);

          throw new Error(data?.message || "Không thể xuất báo cáo điểm danh.");
        }

        if (contentType.includes("text/html")) {
          const text = await error.response.data.text();

          console.error("SERVER ERROR HTML:");
          console.error(text.substring(0, 1000));

          throw new Error(
            "Không tìm thấy API xuất báo cáo. Kiểm tra route /attendance/export.",
          );
        }
      } catch (parseError) {
        if (
          parseError instanceof Error &&
          parseError.message !== "Unexpected end of JSON input"
        ) {
          throw parseError;
        }
      }
    }

    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Không thể xuất báo cáo điểm danh.",
    );
  }
};

/**
 * =========================================================
 * 8. LẤY TOÀN BỘ THỐNG KÊ
 * =========================================================
 *
 * Gọi:
 *
 * - overview
 * - students
 * - classes
 * - attendance
 * - catechists
 * - studentAttendance
 *
 * attendanceParams:
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
 * =========================================================
 */
export const getAllStatistics = async (attendanceParams = {}) => {
  try {
    /**
     * -------------------------------------------------------
     * Chuẩn hóa params chuyên cần
     * -------------------------------------------------------
     */
    const cleanAttendanceParams = normalizeAttendanceParams(attendanceParams);

    /**
     * -------------------------------------------------------
     * OVERVIEW CHỈ DÙNG MONTH + YEAR
     * -------------------------------------------------------
     */
    const overviewParams = {};

    if (
      attendanceParams.month !== undefined &&
      attendanceParams.month !== null &&
      attendanceParams.month !== ""
    ) {
      overviewParams.month = Number(attendanceParams.month);
    }

    if (
      attendanceParams.year !== undefined &&
      attendanceParams.year !== null &&
      attendanceParams.year !== ""
    ) {
      overviewParams.year = Number(attendanceParams.year);
    }

    /**
     * -------------------------------------------------------
     * GỌI SONG SONG
     * -------------------------------------------------------
     */
    const [
      overview,
      students,
      classes,
      attendance,
      catechists,
      studentAttendance,
    ] = await Promise.all([
      /**
       * 1. OVERVIEW
       */
      getStatisticsOverview(overviewParams),

      /**
       * 2. STUDENTS
       */
      getStudentStatistics(),

      /**
       * 3. CLASSES
       */
      getClassStatistics(),

      /**
       * 4. ATTENDANCE
       */
      getAttendanceStatistics(cleanAttendanceParams),

      /**
       * 5. CATECHISTS
       */
      getCatechistStatistics(),

      /**
       * 6. STUDENT ATTENDANCE
       */
      getStudentAttendanceStatistics(cleanAttendanceParams),
    ]);

    return {
      overview,
      students,
      classes,
      attendance,
      catechists,
      studentAttendance,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} getAllStatistics ERROR:`, error);

    throw error;
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
  getStudentAttendanceStatistics,
  exportAttendanceReport,
  getAllStatistics,
};

export default statisticsApi;
