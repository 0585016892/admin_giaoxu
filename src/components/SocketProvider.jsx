import { useEffect } from "react";

import socket from "../socket/socket";

// ============================================================
// GET AUTH USER
// ============================================================

const getAuthUser = () => {
  try {
    const userString = localStorage.getItem("user");

    if (!userString) {
      return null;
    }

    return JSON.parse(userString);
  } catch (error) {
    console.error("GET AUTH USER ERROR:", error);

    return null;
  }
};

// ============================================================
// COMPONENT
// ============================================================

const SocketProvider = ({ children }) => {
  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      console.warn("⚠️ Socket: Chưa có thông tin user");

      return;
    }

    const userId = Number(user.id);

    const churchId = Number(user.church_id || user.parish_id || 0);

    // ========================================================
    // VALIDATE
    // ========================================================

    if (!userId || !churchId) {
      console.warn("⚠️ Socket: Thiếu userId hoặc churchId", {
        userId,
        churchId,
        user,
      });

      return;
    }

    // ========================================================
    // JOIN FUNCTION
    // ========================================================

    const joinChurchRoom = () => {
      console.log("🔔 JOIN USER SOCKET:", {
        userId,
        churchId,
      });

      socket.emit("join:user", {
        userId,
        churchId,
      });
    };

    // ========================================================
    // IF ALREADY CONNECTED
    // ========================================================

    if (socket.connected) {
      joinChurchRoom();
    }

    // ========================================================
    // ON CONNECT / RECONNECT
    // ========================================================

    socket.on("connect", joinChurchRoom);

    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      socket.off("connect", joinChurchRoom);

      socket.emit("leave:user", {
        userId,
        churchId,
      });
    };
  }, []);

  return children;
};

export default SocketProvider;
