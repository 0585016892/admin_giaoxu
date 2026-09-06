import { Routes, Route } from "react-router-dom";

// ==================== AUTH ====================
import CatechistLogin from "../pages/catechist/CatechistLogin";

// ==================== LAYOUT ====================
import CatechistLayout from "../layouts/CatechistLayout/CatechistLayout";

// ==================== GUARDS ====================
import ProtectedRoute, { RoleGuard } from "../components/ProtectedRoute";

// ==================== CERTIFICATE ====================

// ==================== CATECHIST ====================
import CatechistManagement from "../pages/catechist/CatechistManagement";
import CatechistDashboard from "../pages/catechist/CatechistDashboard";
import ClassManagementDashboard from "../pages/catechist/ClassManagement";
import StudentManagement from "../pages/catechist/StudentManagement";
import GameManagementPage from "../pages/catechist/GameManagementPage";
import ResultsPage from "../pages/catechist/ResultsPage";
import LeaderboardPage from "../pages/catechist/LeaderboardPage";
import ProfilePageCate from "../pages/catechist/ProfilePageCate";
import ParishSettingsPage from "../pages/catechist/ParishSettingsPage";
import AttendancePage from "../pages/catechist/AttendancePage";
import TeacherClassesPage from "../pages/catechist/TeacherClassesPage";
import MyStudentsPage from "../pages/catechist/MyStudentsPage";
import SendNotificationPage from "../pages/catechist/SendNotificationPage";
import NotificationsCatePage from "../pages/catechist/NotificationsCatePage";
import ErrorPage from "../pages/catechist/ErrorPage";
import LandingPage from "../pages/LandingPage/LandingPage";

// ============================================================
// ROLES
// ============================================================

// Giáo lý viên
const CATECHIST_ROLES = ["catechist", "teacher"];

export default function AppRoutes() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}

      {/* Đăng nhập hệ thống Giáo lý */}
      <Route path="/" element={<CatechistLogin />} />

      <Route path="/intro" element={<LandingPage />} />
      {/* ------------------------------------------------------
          Xác thực chứng chỉ - Public
          ------------------------------------------------------ */}

      {/* ======================================================
          PARISH ADMIN SYSTEM
      ====================================================== */}

      {/* ======================================================
          CATECHIST / GIÁO LÝ SYSTEM
      ====================================================== */}

      <Route element={<ProtectedRoute loginPath="/" />}>
        <Route element={<RoleGuard allowedRoles={CATECHIST_ROLES} />}>
          <Route element={<CatechistLayout />}>
            {/* --------------------------------------------------
                Giáo lý Dashboard
                -------------------------------------------------- */}
            <Route path="/catechist" element={<CatechistDashboard />} />

            {/* --------------------------------------------------
                Quản lý lớp
                -------------------------------------------------- */}
            <Route
              path="/catechist/classes"
              element={<ClassManagementDashboard />}
            />
            <Route
              path="/catechist/classes-teacher"
              element={<TeacherClassesPage />}
            />
            {/* --------------------------------------------------
                Quản lý học sinh
                -------------------------------------------------- */}
            <Route path="/catechist/students" element={<StudentManagement />} />
            <Route
              path="/catechist/student-class"
              element={<MyStudentsPage />}
            />

            {/* --------------------------------------------------
                Game giáo lý
                -------------------------------------------------- */}
            <Route path="/catechist/games" element={<GameManagementPage />} />

            {/* --------------------------------------------------
                Kết quả
                -------------------------------------------------- */}
            <Route path="/catechist/results" element={<ResultsPage />} />

            {/* --------------------------------------------------
                Bảng xếp hạng
                -------------------------------------------------- */}
            <Route
              path="/catechist/leaderboard"
              element={<LeaderboardPage />}
            />

            {/* --------------------------------------------------
                Bài học / câu hỏi
                -------------------------------------------------- */}
            <Route
              path="/catechist-management"
              element={<CatechistManagement />}
            />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/catechist/profile" element={<ProfilePageCate />} />
            <Route
              path="/catechist/notifications"
              element={<SendNotificationPage />}
            />
            <Route
              path="/catechist/my-notifications"
              element={<NotificationsCatePage />}
            />
            <Route
              path="/catechist/settings"
              element={<ParishSettingsPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* ======================================================
          FALLBACK
      ====================================================== */}

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
