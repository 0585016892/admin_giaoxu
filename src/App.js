import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import CertificatePage from "./components/CertificatePage";
import PrayerManager from "./pages/PrayerManager";
import SlideManager from "./pages/SlideManager";
import EventAdmin from "./pages/EventAdmin";
import AdminScheduleCalendar from "./pages/AdminScheduleCalendar";
import ChurchPage from "./pages/ChurchPage";
import NotFound from "./pages/NotFound";
import GroupPage from "./pages/GroupsPage";
import AdminManager from "./pages/AdminManager";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import SettingsPage from "./pages/SettingsPage";
import LessonQuestionManager from "./pages/LessonQuestionManager";
import Gallery from "./pages/Gallery";
import ParishionerList from "./pages/ParishionerList";
import ExamManagementPage from "./pages/ExamManagementPage";
import ProfilePage from "./pages/ProfilePage";
import RagTrainingPage from "./pages/RagTrainingPage";
import VerifyCertificate from "./components/VerifyCertificate";
import VisitorAnalytics from "./pages/VisitorAnalytics";
import DocumentsPage from "./pages/DocumentPage";
import NotificationManagementPage from "./pages/NotificationManagementPage";
import ReportDashboard from "./pages/ReportDashboard";
import SacramentPage from "./pages/SacramentPage";
import MediaManager from "./pages/MediaManager";
import ContactPage from "./pages/ContactPage";
import AdminGuard from "./components/AdminGuard";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminGuard>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/prayers" element={<PrayerManager />} />
                    <Route path="/admins" element={<AdminManager />} />
                    <Route path="/slides" element={<SlideManager />} />
                    <Route path="/news" element={<EventAdmin />} />
                    <Route path="/quan-ly" element={<ChurchPage />} />
                    <Route path="/doan-the" element={<GroupPage />} />
                    <Route
                      path="/activity-logs"
                      element={<ActivityLogsPage />}
                    />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/certificates" element={<CertificatePage />} />
                    <Route path="/parishioners" element={<ParishionerList />} />
                    <Route
                      path="/exam-prayer"
                      element={<ExamManagementPage />}
                    />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/rag" element={<RagTrainingPage />} />
                    <Route path="/statistics" element={<VisitorAnalytics />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/reports" element={<ReportDashboard />} />
                    <Route path="/sacraments" element={<SacramentPage />} />
                    <Route
                      path="/announcements"
                      element={<NotificationManagementPage />}
                    />
                    <Route
                      path="/lich-phung-vu"
                      element={<AdminScheduleCalendar />}
                    />
                    <Route
                      path="/lessons"
                      element={<LessonQuestionManager />}
                    />
                    <Route path="media-library" element={<MediaManager />} />
                    <Route path="feedbacks" element={<ContactPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AdminLayout>
              </AdminGuard>
            </ProtectedRoute>
          }
        />
        <Route path="/xac-thuc" element={<VerifyCertificate />} />
      </Routes>
    </BrowserRouter>
  );
}
