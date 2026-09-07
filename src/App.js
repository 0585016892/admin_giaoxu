import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import SocketProvider from "./components/SocketProvider";
import ApiChecker from "./components/checkApiNF/ApiChecker";

import NotificationListener from "./components/NotificationListener";
import { LicenseProvider } from "./context/LicenseContext";
import LicenseGuard from "./components/LicenseGuard";
export default function App() {
  return (
    <BrowserRouter>
      <ApiChecker>
        <LicenseProvider>
          <LicenseGuard>
            <SocketProvider>
              <NotificationListener />
              <AppRoutes />
            </SocketProvider>
          </LicenseGuard>
        </LicenseProvider>
      </ApiChecker>
    </BrowserRouter>
  );
}
