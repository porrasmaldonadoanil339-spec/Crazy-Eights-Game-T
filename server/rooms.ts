import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import {
  initMultiGame, multiPlayCard, multiDraw, multiChooseSuit,
  multiGetTopCard, MultiGameState, cpuPlayMulti,
} from "../lib/multiplayerEngine";
import type { Card, Suit } from "../lib/multiplayerEngine";

interface RoomPlayer {
  socketId: string;
  name: string;
  playerIndex: number;
}

interface Room {
  code: string;
  hostSocketId: string;
  players: RoomPlayer[];
  maxPlayers: number;
  gameState: MultiGameState | null;
  hands: Card[][];
  status: "waiting" | "playing" | "done";
  createdAt: number;
}

const rooms = new Map<string, Room>();

function genCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function uniqueCode(): string {
  let c = genCode();
  while (rooms.has(c)) c = genCode();
  return c;
}

function cleanOldRooms() {
  const cutoff = Date.now() - 3 * 60 * 60 * 1000;
  for (const [code, room] of rooms) {
    if (room.createdAt < cutoff) rooms.delete(code);
  }
}

function publicState(room: Room) {
  if (!room.gameState) return null;
  const gs = room.gameState;
  return {
    discardTop: multiGetTopCard(gs),
    drawPileSize: gs.drawPile.length,
    currentPlayerIndex: gs.currentPlayerIndex,
    currentSuit: gs.currentSuit,
    phase: gs.phase,
    winnerIndex: gs.winnerIndex,
    playerNames: gs.playerNames,
    handSizes: gs.hands.map(h => h.length),
    message: gs.message,
    direction: gs.direction,
    pendingDraw: gs.pendingDraw,
    pendingDrawType: gs.pendingDrawType,
    jActive: gs.jActive,
    jSuit: gs.jSuit,
  };
}

export function setupRooms(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io/",
  });

  setInterval(cleanOldRooms, 30 * 60 * 1000);

  io.on("connection", (socket) => {
    let currentRoom: string | null = null;
    let myPlayerIndex = -1;

    socket.on("create_room", ({ playerName, maxPlayers }: { playerName: string; maxPlayers: number }) => {
      cleanOldRooms();
      const code = uniqueCode();
      const room: Room = {
        code,
        hostSocketId: socket.id,
        players: [{ socketId: socket.id, name: playerName || "Jugador 1", playerIndex: 0 }],
        maxPlayers: Math.min(Math.max(maxPlayers || 2, 2), 4),
        gameState: null,
        hands: [],
        status: "waiting",
        createdAt: Date.now(),
      };
      rooms.set(code, room);
      currentRoom = code;
      myPlayerIndex = 0;
      socket.join(code);
      socket.emit("room_created", { code, playerIndex: 0, players: room.players.map(p => ({ name: p.name, playerIndex: p.playerIndex })) });
    });

    socket.on("join_room", ({ code, playerName }: { code: string; playerName: string }) => {
      const room = rooms.get(code.toUpperCase());
      if (!room) {
        socket.emit("join_error", { error: "Sala no encontrada" });
        return;
      }
      if (room.status !== "waiting") {
        socket.emit("join_error", { error: "La partida ya comenzó" });
        return;
      }
      if (room.players.length >= room.maxPlayers) {
        socket.emit("join_error", { error: "Sala llena" });
        return;
      }

      const playerIndex = room.players.length;
      room.players.push({ socketId: socket.id, name: playerName || `Jugador ${playerIndex + 1}`, playerIndex });
      currentRoom = code.toUpperCase();
      myPlayerIndex = playerIndex;
      socket.join(code.toUpperCase());

      const playersInfo = room.players.map(p => ({ name: p.name, playerIndex: p.playerIndex }));
      socket.emit("room_joined", { code: room.code, playerIndex, players: playersInfo });
      socket.to(code.toUpperCase()).emit("player_joined", { name: playerName, players: playersInfo });

      if (room.players.length === room.maxPlayers) {
        startGame(room, io);
      }
    });

    socket.on("start_game", () => {
      if (!currentRoom) return;
      const room = rooms.get(currentRoom);
      if (!room || room.hostSocketId !== socket.id) return;
      if (room.players.length < 2) {
        socket.emit("error_msg", { error: "Necesitas al menos 2 jugadores" });
        return;
      }
      startGame(room, io);
    });

    socket.on("play_card", ({ card }: { card: Card }) => {
      if (!currentRoom) return;
      const room = rooms.get(currentRoom);
      if (!room?.gameState) return;
      if (room.gameState.currentPlayerIndex !== myPlayerIndex) return;
      if (room.gameState.phase === "game_over") return;

      try {
        const newState = multiPlayCard(room.gameState, card);
        room.gameState = newState;
        broadcastGameState(room, io);
        if (newState.phase !== "choosing_suit" && newState.phase !== "game_over") {
          scheduleAutoplay(room, io);
        }
      } catch {}
    });

    socket.on("draw_card", () => {
      if (!currentRoom) return;
      const room = rooms.get(currentRoom);
      if (!room?.gameState) return;
      if (room.gameState.currentPlayerIndex !== myPlayerIndex) return;
      if (room.gameState.phase === "game_over") return;

      try {
        const newState = multiDraw(room.gameState);
        room.gameState = newState;
        broadcastGameState(room, io);
        if (newState.phase !== "game_over") {
          scheduleAutoplay(room, io);
        }
      } catch {}
    });

    socket.on("choose_suit", ({ suit }: { suit: Suit }) => {
      if (!currentRoom) return;
      const room = rooms.get(currentRoom);
      if (!room?.gameState) return;
      if (room.gameState.currentPlayerIndex !== myPlayerIndex) return;
      if (room.gameState.phase !== "choosing_suit") return;

      try {
        const newState = multiChooseSuit(room.gameState, suit);
        room.gameState = newState;
        broadcastGameState(room, io);
        scheduleAutoplay(room, io);
      } catch {}
    });

    socket.on("leave_room", () => {
      handleLeave();
    });

    socket.on("disconnect", () => {
      handleLeave();
    });

    function handleLeave() {
      if (!currentRoom) return;
      const room = rooms.get(currentRoom);
      if (!room) return;

      room.players = room.players.filter(p => p.socketId !== socket.id);
      socket.to(currentRoom).emit("player_left", {
        playerIndex: myPlayerIndex,
        players: room.players.map(p => ({ name: p.name, playerIndex: p.playerIndex })),
      });

      if (room.players.length === 0) {
        rooms.delete(currentRoom);
      } else if (room.hostSocketId === socket.id && room.players.length > 0) {
        room.hostSocketId = room.players[0].socketId;
      }

      currentRoom = null;
      myPlayerIndex = -1;
    }
  });

  return io;
}

function startGame(room: Room, io: SocketServer) {
  room.status = "playing";
  const names = room.players.map(p => p.name);
  const gs = initMultiGame(names, 8);
  room.gameState = gs;
  room.hands = [...gs.hands];

  io.to(room.code).emit("game_starting", { playerCount: room.players.length, playerNames: names });

  setTimeout(() => {
    broadcastGameState(room, io);
    scheduleAutoplay(room, io);
  }, 500);
}

function broadcastGameState(room: Room, io: SocketServer) {
  if (!room.gameState) return;
  const pub = publicState(room);

  for (const player of room.players) {
    const hand = room.gameState.hands[player.playerIndex] ?? [];
    io.to(player.socketId).emit("game_state", {
      ...pub,
      myHand: hand,
      myPlayerIndex: player.playerIndex,
    });
  }

  if (room.gameState.phase === "game_over") {
    room.status = "done";
    io.to(room.code).emit("game_over", { winnerIndex: room.gameState.winnerIndex, playerNames: room.gameState.playerNames });
  }
}

let autoplayTimers = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleAutoplay(room: Room, io: SocketServer) {
  if (!room.gameState) return;
  if (room.gameState.phase === "game_over") return;
  if (room.gameState.phase === "choosing_suit") return;

  const curr = room.gameState.currentPlayerIndex;
  const humanPlayer = room.players.find(p => p.playerIndex === curr);
  if (humanPlayer) return;

  const prev = autoplayTimers.get(room.code);
  if (prev) clearTimeout(prev);

  const timer = setTimeout(() => {
    if (!room.gameState) return;
    if (room.gameState.currentPlayerIndex === curr) {
      try {
        const newState = cpuPlayMulti(room.gameState);
        room.gameState = newState;
        broadcastGameState(room, io);
        if (newState.phase !== "game_over" && newState.phase !== "choosing_suit") {
          scheduleAutoplay(room, io);
        }
      } catch {}
    }
  }, 1200 + Math.random() * 600);

  autoplayTimers.set(room.code, timer);
}
