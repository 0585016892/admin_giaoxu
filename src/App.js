import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import SocketProvider from "./components/SocketProvider";
import ApiChecker from "./components/checkApiNF/ApiChecker";

import NotificationListener from "./components/NotificationListener";
export default function App() {
  return (
    <BrowserRouter>
      <ApiChecker>
        <SocketProvider>
          <NotificationListener />
          <AppRoutes />
        </SocketProvider>
      </ApiChecker>
    </BrowserRouter>
  );
}
