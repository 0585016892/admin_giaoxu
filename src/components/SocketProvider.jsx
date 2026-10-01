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
      return;
    }

    const userId = Number(user.id);

    const churchId = Number(user.church_id || user.parish_id || 0);

    // ========================================================
    // VALIDATE
    // ========================================================

    if (!userId || !churchId) {
      return;
    }

    // ========================================================
    // JOIN FUNCTION
    // ========================================================

    const joinChurchRoom = () => {
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
