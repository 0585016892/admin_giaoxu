import axios from "./axios";

// ============================================================
// REGISTER - GỬI YÊU CẦU ĐĂNG KÝ + OTP
// ============================================================

export const registerRequest = async (payload) => {
  const response = await axios.post("/auth/register", payload);

  console.log("[REGISTER] Response:", response?.data);

  return response.data;
};

// ============================================================
// REGISTER VERIFY - XÁC THỰC OTP
// ============================================================

export const registerVerify = async ({ email, otp }) => {
  const response = await axios.post("/auth/register/verify", {
    email,
    otp,
  });

  console.log("[VERIFY] Response:", response?.data);

  return response.data;
};

// ============================================================
// DEFAULT API
// ============================================================

const authApi = {
  registerRequest,
  registerVerify,
};

export default authApi;
