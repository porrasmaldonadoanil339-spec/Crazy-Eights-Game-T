import { io, type Socket } from "socket.io-client";
import { getApiUrl } from "./query-client";

let socket: Socket | null = null;

function getServerUrl(): string {
  try {
    const base = getApiUrl();
    return base.endsWith("/") ? base.slice(0, -1) : base;
  } catch {
    return "http://localhost:5000";
  }
}

export function getSocket(): Socket {
  if (!socket || !socket.connected) {
    const url = getServerUrl();
    socket = io(url, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
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

export type RoomPlayer = { name: string; playerIndex: number };

export type PublicGameState = {
  discardTop: { suit: string; rank: string };
  drawPileSize: number;
  currentPlayerIndex: number;
  currentSuit: string;
  phase: string;
  winnerIndex: number | null;
  playerNames: string[];
  handSizes: number[];
  message: string;
  direction: 1 | -1;
  pendingDraw: number;
  pendingDrawType: "two" | "seven" | null;
  jActive: boolean;
  jSuit: string | null;
  myHand: Array<{ suit: string; rank: string }>;
  myPlayerIndex: number;
};
