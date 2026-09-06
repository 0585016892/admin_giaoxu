import { io } from "socket.io-client";

// ============================================================
// SOCKET URL
// ============================================================

const SOCKET_URL = process.env.REACT_APP_API_URL;

// ============================================================
// CREATE SOCKET
// ============================================================

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],

  reconnection: true,

  reconnectionAttempts: Infinity,

  reconnectionDelay: 1000,

  reconnectionDelayMax: 5000,

  timeout: 20000,

  autoConnect: true,
});

// ============================================================
// DEBUG
// ============================================================

socket.on("connect", () => {
  console.log("🟢 SOCKET CONNECTED:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 SOCKET DISCONNECTED:", reason);
});

socket.on("connect_error", (error) => {
  console.error("❌ SOCKET CONNECT ERROR:", error.message);
});

socket.io.on("reconnect_attempt", () => {
  console.log("🔄 SOCKET RECONNECTING...");
});

socket.io.on("reconnect", () => {
  console.log("🟢 SOCKET RECONNECTED:", socket.id);
});

export default socket;
