import axiosClient from "./axios";

// ============================================================
// CHURCH SETTINGS API
// ============================================================

/**
 * Lấy cấu hình giáo xứ
 */
export const getChurchSettings = async () => {
  try {
    const response = await axiosClient.get("/settings_church/church");

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật cấu hình giáo xứ
 *
 * Hỗ trợ:
 * - logoFile       -> File ảnh logo
 * - coverImageFile -> File ảnh bìa
 * - Các setting khác
 */
export const updateChurchSettings = async (data = {}) => {
  try {
    const formData = new FormData();

    // ========================================================
    // 1. LOGO
    // ========================================================

    if (data.logoFile instanceof File) {
      formData.append("logo", data.logoFile);
    }

    // ========================================================
    // 2. COVER IMAGE
    // ========================================================

    if (data.coverImageFile instanceof File) {
      formData.append("cover_image", data.coverImageFile);
    }

    // ========================================================
    // 3. CÁC SETTING KHÁC
    // ========================================================

    Object.entries(data).forEach(([key, value]) => {
      // File đã xử lý riêng ở trên
      if (key === "logoFile" || key === "coverImageFile") {
        return;
      }

      // Không gửi undefined
      if (value === undefined) {
        return;
      }

      // null
      if (value === null) {
        formData.append(key, "");
        return;
      }

      // Boolean
      if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");

        return;
      }

      // Array / Object
      if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));

        return;
      }

      // String / Number
      formData.append(key, String(value));
    });

    // ========================================================
    // 4. LOG FORM DATA
    // ========================================================

    // ========================================================
    // 5. REQUEST
    // ========================================================

    const response = await axiosClient.put("/settings_church/church", formData);

    // ========================================================
    // 6. SUCCESS
    // ========================================================

    return response.data;
  } catch (error) {
    throw error;
  }
};
