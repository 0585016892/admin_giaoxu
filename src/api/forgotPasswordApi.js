// src/api/forgotPasswordApi.js

import axios from "./axios";

// ============================================================
// HELPER
// ============================================================

const getErrorResponse = (error) => {
  return (
    error?.response?.data || {
      success: false,
      code: "NETWORK_ERROR",
      message:
        error?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
    }
  );
};

// ============================================================
// NORMALIZE EMAIL
// ============================================================

const normalizeEmail = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

// ============================================================
// 1. KIỂM TRA EMAIL CŨ
// ============================================================
//
// POST forgot-password/forgot-password/request
//
// Body:
// {
//   email: "email-cu@example.com"
// }
//
// ============================================================

export const requestForgotPassword = async (email) => {
  try {
    const normalizedEmail = normalizeEmail(email);

    const response = await axios.post("/forgot-password/request", {
      email: normalizedEmail,
    });

    return response.data;
  } catch (error) {
    const errorData = getErrorResponse(error);

    throw errorData;
  }
};

// ============================================================
// 2. GỬI OTP ĐẾN EMAIL MỚI
// ============================================================
//
// POST forgot-password/forgot-password/send-otp
//
// Body:
// {
//   old_email: "email-cu@example.com",
//   new_email: "email-moi@gmail.com"
// }
//
// ============================================================

export const sendForgotPasswordOtp = async ({ oldEmail, newEmail }) => {
  try {
    const normalizedOldEmail = normalizeEmail(oldEmail);

    const normalizedNewEmail = normalizeEmail(newEmail);

    const response = await axios.post("/forgot-password/send-otp", {
      old_email: normalizedOldEmail,
      new_email: normalizedNewEmail,
    });

    return response.data;
  } catch (error) {
    const errorData = getErrorResponse(error);

    throw errorData;
  }
};

// ============================================================
// 3. XÁC THỰC OTP
// ============================================================
//
// POST forgot-password/forgot-password/verify-otp
//
// Body:
// {
//   old_email: "email-cu@example.com",
//   new_email: "email-moi@gmail.com",
//   otp: "123456"
// }
//
// ============================================================

export const verifyForgotPasswordOtp = async ({ oldEmail, newEmail, otp }) => {
  try {
    const normalizedOldEmail = normalizeEmail(oldEmail);

    const normalizedNewEmail = normalizeEmail(newEmail);

    const normalizedOtp = String(otp || "").trim();

    const response = await axios.post("/forgot-password/verify-otp", {
      old_email: normalizedOldEmail,
      new_email: normalizedNewEmail,
      otp: normalizedOtp,
    });

    return response.data;
  } catch (error) {
    const errorData = getErrorResponse(error);

    throw errorData;
  }
};

// ============================================================
// 4. RESET PASSWORD + UPDATE EMAIL
// ============================================================
//
// POST forgot-password/forgot-password/reset
//
// Body:
// {
//   reset_request_id: 123,
//   new_password: "...",
//   confirm_password: "..."
// }
//
// ============================================================

export const resetForgotPassword = async ({
  resetRequestId,
  newPassword,
  confirmPassword,
}) => {
  try {
    const requestId = Number(resetRequestId);

    const response = await axios.post("/forgot-password/reset", {
      reset_request_id: requestId,

      new_password: newPassword,

      confirm_password: confirmPassword,
    });

    return response.data;
  } catch (error) {
    const errorData = getErrorResponse(error);

    throw errorData;
  }
};

// ============================================================
// DEFAULT
// ============================================================

const forgotPasswordApi = {
  requestForgotPassword,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetForgotPassword,
};

export default forgotPasswordApi;
