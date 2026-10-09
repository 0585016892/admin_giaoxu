import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import SocketProvider from "./components/SocketProvider";
import ApiChecker from "./components/checkApiNF/ApiChecker";
import AppNotificationProvider from "./components/notification";
import NotificationListener from "./components/NotificationListener";

import { LicenseProvider } from "./context/LicenseContext";
import LicenseGuard from "./components/LicenseGuard";

import FaithAssistant from "./components/assistant/FaithAssistant";
import { useChurchSettings } from "./context/ChurchSettingsContext";

function AppContent() {
  const { settings } = useChurchSettings();

  // Mặc định bật Bot nếu chưa có cấu hình.
  const botEnabled =
    settings?.bot_enabled === undefined || settings?.bot_enabled === null
      ? true
      : settings.bot_enabled === true || Number(settings.bot_enabled) === 1;

  return (
    <ApiChecker>
      <LicenseProvider>
        <LicenseGuard>
          <SocketProvider>
            <NotificationListener />

            <AppNotificationProvider>
              <AppRoutes />

              {/* Chỉ hiển thị Bot khi được bật trong cấu hình giáo xứ */}
              {botEnabled && <FaithAssistant />}
            </AppNotificationProvider>
          </SocketProvider>
        </LicenseGuard>
      </LicenseProvider>
    </ApiChecker>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
