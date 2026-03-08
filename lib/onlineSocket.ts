import { io, Socket } from "socket.io-client";
import { getApiUrl } from "@/lib/query-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket || !socket.connected) {
    const base = getApiUrl();
    socket = io(base, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function ensureDisconnected() {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
}
