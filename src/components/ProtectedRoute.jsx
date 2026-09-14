import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

// ============================================================
// PROTECTED ROUTE
// ============================================================
export default function ProtectedRoute({ loginPath = "/" }) {
  const { user, authReady } = useUser();
  const location = useLocation();

  // ==========================================================
  // CHƯA RESTORE AUTH
  // ==========================================================
  if (!authReady) {
    return null;
  }

  // ==========================================================
  // KHÔNG CÓ USER
  // ==========================================================
  if (!user) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

// ============================================================
// ROLE GUARD
// ============================================================
export function RoleGuard({ allowedRoles = [], loginPath = "/" }) {
  const { user, authReady } = useUser();
  const location = useLocation();

  // ==========================================================
  // CHƯA RESTORE AUTH
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
          from: location.pathname,
        }}
      />
    );
  }

  // ==========================================================
  // KHÔNG ĐÚNG ROLE
  // ==========================================================
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/catechist" replace />;
  }

  return <Outlet />;
}
