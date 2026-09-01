import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function ProtectedRoute() {
  const { user, loading } = useUser();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function RoleGuard({ allowedRoles = [] }) {
  const { user, loading } = useUser();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Nếu là giáo lý viên
    if (user.role === "catechist" || user.role === "teacher") {
      return <Navigate to="/catechist" replace />;
    }

    // Các role admin
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
