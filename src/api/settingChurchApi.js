import axiosClient from "./axios";

// ============================================================
// CHURCH SETTINGS API
// ============================================================

// Lấy cấu hình giáo xứ
export const getChurchSettings = async () => {
  const response = await axiosClient.get("/settings_church/church");
  return response.data;
};

// Cập nhật cấu hình giáo xứ
export const updateChurchSettings = async (data) => {
  const response = await axiosClient.put("/settings_church/church", data);
  return response.data;
};
