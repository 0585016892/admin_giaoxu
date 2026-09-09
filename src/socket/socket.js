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

socket.on("connect", () => {});

socket.on("disconnect", () => {});

socket.on("connect_error", () => {});

socket.io.on("reconnect_attempt", () => {});

socket.io.on("reconnect", () => {});
export default socket;
