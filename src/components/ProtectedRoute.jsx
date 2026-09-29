import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useUser } from "../context/UserContext";

// ============================================================
// PROTECTED ROUTE
//
// Chỉ có nhiệm vụ:
// - Chờ restore auth
// - Kiểm tra đã đăng nhập chưa
//
// Không kiểm tra role ở đây.
// Role được xử lý bởi RoleGuard.
// ============================================================

export default function ProtectedRoute({ loginPath = "/" }) {
  const { user, authReady } = useUser();

  const location = useLocation();

  // ==========================================================
  // ĐANG RESTORE AUTH
  // ==========================================================

  if (!authReady) {
    return null;
  }

  // ==========================================================
  // CHƯA ĐĂNG NHẬP
  // ==========================================================

  if (!user) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{
          from: location.pathname + location.search,
        }}
      />
    );
  }

  // ==========================================================
  // ĐÃ ĐĂNG NHẬP
  // ==========================================================

  return <Outlet />;
}

// ============================================================
// ROLE GUARD
//
// Kiểm tra user có quyền truy cập route hay không.
// ============================================================

export function RoleGuard({ allowedRoles = [], loginPath = "/" }) {
  const { user, authReady } = useUser();

  const location = useLocation();

  // ==========================================================
  // ĐANG RESTORE AUTH
  // ==========================================================

  if (!authReady) {
    return null;
  }

  // ==========================================================
  // CHƯA LOGIN
  // ==========================================================

  if (!user) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{
          from: location.pathname + location.search,
        }}
      />
    );
  }

  // ==========================================================
  // ROLE KHÔNG ĐƯỢC PHÉP
  // ==========================================================

  if (!allowedRoles.includes(user.role)) {
    // ========================================================
    // Nếu là phụ huynh
    // ========================================================

    if (user.role === "parent") {
      return <Navigate to="/parent" replace />;
    }

    // ========================================================
    // Nếu là GLV / giáo viên
    // ========================================================

    if (["catechist", "teacher", "admin_catechist"].includes(user.role)) {
      return <Navigate to="/catechist" replace />;
    }

    // ========================================================
    // Role không xác định
    // ========================================================

    return <Navigate to="/" replace />;
  }

  // ==========================================================
  // ĐƯỢC PHÉP
  // ==========================================================

  return <Outlet />;
}
