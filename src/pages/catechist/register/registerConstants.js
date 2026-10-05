// src/pages/auth/register/registerConstants.js

export const REGISTER_STORAGE_KEYS = {
  token: "token",
  admin: "admin",
  user: "user",
  church: "church",
};

export const OTP_EXPIRES_SECONDS = 5 * 60;

export const REGISTER_FORM_INITIAL_VALUES = {
  church_type: "GIAO_XU",
};

export const CHURCH_TYPE_OPTIONS = [
  {
    value: "GIAO_XU",
    label: "Giáo xứ",
  },
  {
    value: "GIAO_HO",
    label: "Giáo họ",
  },
];

export const getRegisterErrorMessage = (error) => {
  const data = error?.response?.data;

  if (data?.message) {
    return data.message;
  }

  switch (data?.code) {
    case "EMAIL_ALREADY_EXISTS":
      return "Email này đã được sử dụng.";

    case "INVALID_OTP":
      return "Mã OTP không chính xác.";

    case "OTP_EXPIRED":
      return "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.";

    case "OTP_TOO_MANY_ATTEMPTS":
      return "Bạn đã nhập sai OTP quá số lần cho phép.";

    case "PENDING_REGISTRATION_EXPIRED":
      return "Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.";

    case "REGISTER_DUPLICATE":
      return "Thông tin đăng ký đã tồn tại. Vui lòng thử lại.";

    default:
      return "Không thể thực hiện đăng ký FaithEdu.";
  }
};
