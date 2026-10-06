import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import SocketProvider from "./components/SocketProvider";
import ApiChecker from "./components/checkApiNF/ApiChecker";
import AppNotificationProvider from "./components/notification";

import NotificationListener from "./components/NotificationListener";
import { LicenseProvider } from "./context/LicenseContext";
import LicenseGuard from "./components/LicenseGuard";
import FaithAssistant from "./components/assistant/FaithAssistant";
export default function App() {
  return (
    <BrowserRouter>
      <ApiChecker>
        <LicenseProvider>
          <LicenseGuard>
            <SocketProvider>
              <NotificationListener />
              <AppNotificationProvider>
                <AppRoutes />
                <FaithAssistant />
              </AppNotificationProvider>
            </SocketProvider>
          </LicenseGuard>
        </LicenseProvider>
      </ApiChecker>
    </BrowserRouter>
  );
}
