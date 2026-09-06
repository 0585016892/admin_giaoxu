import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import SocketProvider from "./components/SocketProvider";

import NotificationListener from "./components/NotificationListener";
export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <NotificationListener />

        <AppRoutes />
      </SocketProvider>
    </BrowserRouter>
  );
}
