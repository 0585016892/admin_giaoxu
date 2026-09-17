import axios from "./axios";

// 1. GET ALL: Lấy danh sách tất cả quản trị viên
export const getAdmins = () => axios.get(`/admins`);

// 2. GET BY ID: Lấy thông tin chi tiết 1 admin theo ID
export const getAdminById = (id) => axios.get(`/admins/${id}`);

// 4. UPDATE: Cập nhật thông tin admin (nhận FormData nếu có upload avatar)
export const updateAdmin = (id, data) => axios.put(`/admins/${id}`, data);

// 6. TOGGLE ACTIVE: Khóa / mở khóa tài khoản admin
export const toggleAdmin = (id) =>
  axios.patch(`/admins/${id}/toggle-catechits`);

// 7. CHANGE PASSWORD: Bản thân Admin đổi mật khẩu của chính mình
export const changePassword = (id, data) =>
  axios.put(`/admins/password/${id}`, data);

// 8. RESET PASSWORD: Cấp lại mật khẩu mới cho admin khác (dành cho Admin tối cao/Priest)
export const resetAdminPassword = (id, newPassword) => {
  return axios.put(`/admins/${id}/reset-passwordcate`, {
    password: newPassword,
  });
};
