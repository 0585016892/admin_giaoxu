import { Routes, Route, Navigate } from "react-router-dom";

import { useUser } from "../context/UserContext";

// ============================================================
// AUTH
// ============================================================

import CatechistLogin from "../pages/catechist/CatechistLogin";

// ============================================================
// LAYOUT
// ============================================================

import CatechistLayout from "../layouts/CatechistLayout/CatechistLayout";
import ParentLayout from "../layouts/ParentLayout/ParentLayout";

// ============================================================
// GUARDS
// ============================================================

import ProtectedRoute, { RoleGuard } from "../components/ProtectedRoute";

// ============================================================
// CATECHIST
// ============================================================

import CatechistManagement from "../pages/catechist/CatechistManagement/CatechistManagement";
import CatechistDashboard from "../pages/catechist/Dashboard/CatechistDashboard";
import ClassManagementDashboard from "../pages/catechist/Class/ClassManagement";
import StudentManagement from "../pages/catechist/Students/StudentManagement";
import GameManagementPage from "../pages/catechist/GameManagementPage";
import ResultsPage from "../pages/catechist/ResultsPage/ResultsPage";
import LeaderboardPage from "../pages/catechist/LeaderboardPage";
import ProfilePageCate from "../pages/catechist/ProfilePageCate";
import ParishSettingsPage from "../pages/catechist/ParishSettingsPage";
import AttendancePage from "../pages/catechist/Attendance/AttendancePage";
import TeacherClassesPage from "../pages/catechist/TeacherClassesPage";
import MyStudentsPage from "../pages/catechist/Students/MyStudentsPage";
import SendNotificationPage from "../pages/catechist/SendNotificationPage";
import NotificationsCatePage from "../pages/catechist/NotificationsCatePage";
import ErrorPage from "../pages/catechist/ErrorPage";
import FaithEduRegister from "../pages/catechist/FaithEduRegister";
import Statistics from "../pages/catechist/Statistics";
import CertificatePage from "../pages/catechist/CertificatePage";
import LessonLibraryPage from "../pages/catechist/LessonLibraryPage";
import ResourceViewerPage from "../pages/catechist/ResourceViewerPage";
import GradingRulePage from "../pages/catechist/GradingRule/GradingRulePage";
import QuestionPlayPage from "../pages/catechist/QuestionPlayPage";
import LicensePage from "../pages/catechist/License/LicensePage";
import QuestionPage from "../pages/catechist/QuestionPage";
import StudentBulkEditPage from "../pages/catechist/Students/StudentBulkEditPage";
import ChurchSettingPage from "../pages/catechist/settings/ChurchSettingPage";
// ============================================================
// PARENTS
// ============================================================
import ParentDashboard from "../pages/Parent/ParentDashboard";
import ParentChildren from "../pages/Parent/Children/ParentChildren";
import ChildDetail from "../pages/Parent/Children/components/ChildDetail";

// ============================================================
// PUBLIC
// ============================================================

import LandingPage from "../pages/LandingPage/LandingPage";
import VerifyCertificate from "../components/VerifyCertificate";

// ============================================================
// PARENT
// ============================================================

// Sau này thay bằng page thật.
// Tạm thời dùng các component bên dưới nếu chưa tạo page.

function ParentAttendance() {
  return <div>Điểm danh</div>;
}

function ParentResults() {
  return <div>Kết quả học tập</div>;
}

function ParentCertificates() {
  return <div>Chứng chỉ</div>;
}

function ParentProfile() {
  return <div>Thông tin tài khoản</div>;
}

// ============================================================
// ROLES
// ============================================================

const CATECHIST_ROLES = ["catechist", "teacher", "admin_catechist"];

const PARENT_ROLES = ["parent"];

// ============================================================
// ROOT REDIRECT
// ============================================================

function RootRedirect() {
  const { user, authReady } = useUser();

  // ==========================================================
  // ĐỢI RESTORE AUTH
  // ==========================================================

  if (!authReady) {
    return null;
  }

  // ==========================================================
  // CHƯA LOGIN
  // ==========================================================

  if (!user) {
    return <CatechistLogin />;
  }

  // ==========================================================
  // PARENT
  // ==========================================================

  if (user.role === "parent") {
    return <Navigate to="/parent" replace />;
  }

  // ==========================================================
  // CATECHIST / TEACHER / ADMIN CATECHIST
  // ==========================================================

  if (CATECHIST_ROLES.includes(user.role)) {
    return <Navigate to="/catechist" replace />;
  }

  // ==========================================================
  // ROLE KHÔNG XÁC ĐỊNH
  // ==========================================================

  return <Navigate to="/" replace />;
}

// ============================================================
// ROUTES
// ============================================================

export default function AppRoutes() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route path="/" element={<RootRedirect />} />

      <Route path="/register" element={<FaithEduRegister />} />

      <Route path="/intro" element={<LandingPage />} />

      <Route path="/xac-thuc" element={<VerifyCertificate />} />

      {/* ======================================================
          ======================================================
          CATECHIST SYSTEM
          ======================================================
          ====================================================== */}

      <Route element={<ProtectedRoute loginPath="/" />}>
        <Route
          element={<RoleGuard allowedRoles={CATECHIST_ROLES} loginPath="/" />}
        >
          <Route element={<CatechistLayout />}>
            {/* ================= DASHBOARD ================= */}

            <Route path="/catechist" element={<CatechistDashboard />} />

            {/* ================= CLASSES ================= */}

            <Route
              path="/catechist/classes"
              element={<ClassManagementDashboard />}
            />

            <Route
              path="/catechist/classes-teacher"
              element={<TeacherClassesPage />}
            />

            {/* ================= STUDENTS ================= */}

            <Route path="/catechist/students" element={<StudentManagement />} />

            <Route
              path="/catechist/student-class"
              element={<MyStudentsPage />}
            />
            <Route
              path="/catechist/students/bulk-edit/:classId"
              element={<StudentBulkEditPage />}
            />

            {/* ================= GAMES ================= */}

            <Route path="/catechist/games" element={<GameManagementPage />} />

            {/* ================= RESULTS ================= */}

            <Route path="/catechist/results" element={<ResultsPage />} />

            <Route
              path="/catechist/leaderboard"
              element={<LeaderboardPage />}
            />

            {/* ================= CATECHISTS ================= */}

            <Route
              path="/catechist-management"
              element={<CatechistManagement />}
            />

            {/* ================= ATTENDANCE ================= */}

            <Route path="/attendance" element={<AttendancePage />} />

            {/* ================= PROFILE ================= */}

            <Route path="/catechist/profile" element={<ProfilePageCate />} />

            {/* ================= NOTIFICATIONS ================= */}

            <Route
              path="/catechist/notifications"
              element={<SendNotificationPage />}
            />

            <Route
              path="/catechist/my-notifications"
              element={<NotificationsCatePage />}
            />

            {/* ================= CERTIFICATE ================= */}

            <Route
              path="/catechist/certificate"
              element={<CertificatePage />}
            />

            {/* ================= STATISTICS ================= */}

            <Route path="/catechist/statistics" element={<Statistics />} />

            {/* ================= SETTINGS ================= */}

            <Route
              path="/catechist/settings"
              element={<ParishSettingsPage />}
            />
            <Route
              path="/catechist/settings/church"
              element={<ChurchSettingPage />}
            />
            {/* ================= LESSON ================= */}

            <Route
              path="/catechist/lesson-library"
              element={<LessonLibraryPage />}
            />

            <Route
              path="/catechist/resources/:id"
              element={<ResourceViewerPage />}
            />

            {/* ================= QUESTIONS ================= */}

            <Route
              path="/catechist/questions/play/:lessonId"
              element={<QuestionPlayPage />}
            />

            <Route path="/catechist/questions" element={<QuestionPage />} />

            {/* ================= GRADING ================= */}

            <Route
              path="/catechist/grading-rule"
              element={<GradingRulePage />}
            />

            {/* ================= LICENSE ================= */}

            <Route path="/catechist/license" element={<LicensePage />} />
          </Route>
        </Route>
      </Route>

      {/* ======================================================
          ======================================================
          PARENT SYSTEM
          ======================================================
          ====================================================== */}

      <Route element={<ProtectedRoute loginPath="/" />}>
        <Route
          element={<RoleGuard allowedRoles={PARENT_ROLES} loginPath="/" />}
        >
          <Route element={<ParentLayout />}>
            {/* ================= DASHBOARD ================= */}

            <Route path="/parent" element={<ParentDashboard />} />

            {/* ================= CHILDREN ================= */}

            <Route path="/parent/students" element={<ParentChildren />} />
            <Route
              path="/parent/children/:studentId"
              element={<ChildDetail />}
            />
            {/* ================= ATTENDANCE ================= */}

            <Route path="/parent/attendance" element={<ParentAttendance />} />

            {/* ================= RESULTS ================= */}

            <Route path="/parent/results" element={<ParentResults />} />

            {/* ================= CERTIFICATES ================= */}

            <Route
              path="/parent/certificates"
              element={<ParentCertificates />}
            />

            {/* ================= PROFILE ================= */}

            <Route path="/parent/profile" element={<ParentProfile />} />
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
