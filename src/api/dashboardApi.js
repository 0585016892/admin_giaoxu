// src/api/dashboardApi.js

import axios from "./axios";

export const getDashboardCate = async () => {
  try {
    const response = await axios.get("/dashboard/dashboard-cate");

    return response.data;
  } catch (error) {
    console.error("Dashboard API error:", error);
    throw error;
  }
};

// Lấy thông tin license của giáo xứ hiện tại
export const getMyLicense = async () => {
  try {
    const response = await axios.get("/license/me");

    return response.data;
  } catch (error) {
    console.error("License API error:", error);
    throw error;
  }
};
