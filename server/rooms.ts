import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import {
  initMultiGame, multiPlayCard, multiDraw, multiChooseSuit,
  multiGetTopCard, MultiGameState, cpuPlayMulti,
} from "../lib/multiplayerEngine";
import type { Card, Suit } from "../lib/multiplayerEngine";

interface RoomPlayerProfile {
  name: string;
  avatarColor: string;
  avatarIcon: string;
  level: number;
  rankColor: string;
  rankIcon: string;
  rankName: string;
}

interface RoomPlayer extends RoomPlayerProfile {
  socketId: string;
  playerIndex: number;
}

interface Room {
  code: string;
  hostSocketId: string;
  players: RoomPlayer[];
  maxPlayers: number;
  gameState: MultiGameState | null;
  hands: Card[][];
  status: "waiting" | "pre_match" | "playing" | "done";
  createdAt: number;
  mode: string;
}

interface MatchmakingEntry extends RoomPlayerProfile {
  socketId: string;
  joinedAt: number;
}

const rooms = new Map<string, Room>();
const matchmakingQueues = new Map<string, MatchmakingEntry[]>();

const DEFAULT_PROFILE: Omit<RoomPlayerProfile, "name"> = {
  avatarColor: "#D4AF37",
  avatarIcon: "person",
  level: 1,
  rankColor: "#8B7355",
  rankIcon: "shield",
  rankName: "Hierro V",
};

function genCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function uniqueCode(): string {
  let c = genCode();
  while (rooms.has(c)) c = genCode();
  return c;
}

function queueKey(mode: string, playerCount: number): string {
  return `${mode}:${playerCount}`;
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

function buildPlayersInfo(room: Room) {
  return room.players.map(p => ({
    name: p.name,
    playerIndex: p.playerIndex,
    avatarColor: p.avatarColor,
    avatarIcon: p.avatarIcon,
    level: p.level,
    rankColor: p.rankColor,
    rankIcon: p.rankIcon,
    rankName: p.rankName,
  }));
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
    let inMatchmaking = false;
    let matchmakingQueueKey: string | null = null;

    // ─── Room creation ────────────────────────────────────────────────────
    socket.on("create_room", ({
      playerName, maxPlayers, mode = "classic",
      avatarColor, avatarIcon, level, rankColor, rankIcon, rankName,
    }: {
      playerName: string; maxPlayers: number; mode?: string;
      avatarColor?: string; avatarIcon?: string; level?: number;
      rankColor?: string; rankIcon?: string; rankName?: string;
    }) => {
      cleanOldRooms();
      const code = uniqueCode();
      const player: RoomPlayer = {
        socketId: socket.id,
        name: playerName || "Jugador 1",
        playerIndex: 0,
        avatarColor: avatarColor ?? DEFAULT_PROFILE.avatarColor,
        avatarIcon: avatarIcon ?? DEFAULT_PROFILE.avatarIcon,
        level: level ?? DEFAULT_PROFILE.level,
        rankColor: rankColor ?? DEFAULT_PROFILE.rankColor,
        rankIcon: rankIcon ?? DEFAULT_PROFILE.rankIcon,
        rankName: rankName ?? DEFAULT_PROFILE.rankName,
      };
      const room: Room = {
        code,
        hostSocketId: socket.id,
        players: [player],
        maxPlayers: Math.min(Math.max(maxPlayers || 2, 2), 4),
        gameState: null,
        hands: [],
        status: "waiting",
        createdAt: Date.now(),
        mode,
      };
      rooms.set(code, room);
      currentRoom = code;
      myPlayerIndex = 0;
      socket.join(code);
      socket.emit("room_created", {
        code,
        playerIndex: 0,
        players: buildPlayersInfo(room),
      });
    });

    // ─── Join by room code ─────────────────────────────────────────────────
    socket.on("join_room", ({
      code, playerName,
      avatarColor, avatarIcon, level, rankColor, rankIcon, rankName,
    }: {
      code: string; playerName: string;
      avatarColor?: string; avatarIcon?: string; level?: number;
      rankColor?: string; rankIcon?: string; rankName?: string;
    }) => {
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
      const player: RoomPlayer = {
        socketId: socket.id,
        name: playerName || `Jugador ${playerIndex + 1}`,
        playerIndex,
        avatarColor: avatarColor ?? DEFAULT_PROFILE.avatarColor,
        avatarIcon: avatarIcon ?? DEFAULT_PROFILE.avatarIcon,
        level: level ?? DEFAULT_PROFILE.level,
        rankColor: rankColor ?? DEFAULT_PROFILE.rankColor,
        rankIcon: rankIcon ?? DEFAULT_PROFILE.rankIcon,
        rankName: rankName ?? DEFAULT_PROFILE.rankName,
      };
      room.players.push(player);
      currentRoom = code.toUpperCase();
      myPlayerIndex = playerIndex;
      socket.join(code.toUpperCase());

      const playersInfo = buildPlayersInfo(room);
      socket.emit("room_joined", { code: room.code, playerIndex, players: playersInfo });
      socket.to(code.toUpperCase()).emit("player_joined", { name: playerName, players: playersInfo });

      if (room.players.length === room.maxPlayers) {
        startPreMatch(room, io);
      }
    });

    // ─── Matchmaking queue ─────────────────────────────────────────────────
    socket.on("join_matchmaking", ({
      playerName, mode = "classic", playerCount = 2,
      avatarColor, avatarIcon, level, rankColor, rankIcon, rankName,
    }: {
      playerName: string; mode?: string; playerCount?: number;
      avatarColor?: string; avatarIcon?: string; level?: number;
      rankColor?: string; rankIcon?: string; rankName?: string;
    }) => {
      if (inMatchmaking) return;

      const key = queueKey(mode, playerCount);
      if (!matchmakingQueues.has(key)) {
        matchmakingQueues.set(key, []);
      }

      const entry: MatchmakingEntry = {
        socketId: socket.id,
        name: playerName || "Jugador",
        joinedAt: Date.now(),
        avatarColor: avatarColor ?? DEFAULT_PROFILE.avatarColor,
        avatarIcon: avatarIcon ?? DEFAULT_PROFILE.avatarIcon,
        level: level ?? DEFAULT_PROFILE.level,
        rankColor: rankColor ?? DEFAULT_PROFILE.rankColor,
        rankIcon: rankIcon ?? DEFAULT_PROFILE.rankIcon,
        rankName: rankName ?? DEFAULT_PROFILE.rankName,
      };

      const queue = matchmakingQueues.get(key)!;
      queue.push(entry);
      inMatchmaking = true;
      matchmakingQueueKey = key;

      socket.emit("matchmaking_joined", { queueSize: queue.length, needed: playerCount });

      io.sockets.sockets.get(socket.id)?.emit("matchmaking_status", { queueSize: queue.length, needed: playerCount });

      if (queue.length >= playerCount) {
        const matched = queue.splice(0, playerCount);
        matchmakingQueues.set(key, queue);

        const code = uniqueCode();
        const room: Room = {
          code,
          hostSocketId: matched[0].socketId,
          players: matched.map((m, i) => ({
            ...m,
            playerIndex: i,
          })),
          maxPlayers: playerCount,
          gameState: null,
          hands: [],
          status: "waiting",
          createdAt: Date.now(),
          mode,
        };
        rooms.set(code, room);

        for (const p of room.players) {
          const s = io.sockets.sockets.get(p.socketId);
          if (s) {
            s.join(code);
            (s as any)._currentRoom = code;
            (s as any)._myPlayerIndex = p.playerIndex;
            (s as any)._inMatchmaking = false;
            (s as any)._matchmakingQueueKey = null;
            s.emit("matchmaking_found", { code, playerIndex: p.playerIndex, players: buildPlayersInfo(room) });
          }
        }

        startPreMatch(room, io);
      }
    });

    socket.on("cancel_matchmaking", () => {
      leaveMatchmaking();
    });

    // ─── Start game (host only) ────────────────────────────────────────────
    socket.on("start_game", () => {
      const roomCode = currentRoom ?? (socket as any)._currentRoom;
      if (!roomCode) return;
      const room = rooms.get(roomCode);
      if (!room || room.hostSocketId !== socket.id) return;
      if (room.players.length < 2) {
        socket.emit("error_msg", { error: "Necesitas al menos 2 jugadores" });
        return;
      }
      startPreMatch(room, io);
    });

    // ─── Gameplay events ───────────────────────────────────────────────────
    socket.on("play_card", ({ card }: { card: Card }) => {
      const roomCode = currentRoom ?? (socket as any)._currentRoom;
      const pidx = myPlayerIndex >= 0 ? myPlayerIndex : ((socket as any)._myPlayerIndex ?? -1);
      if (!roomCode || pidx < 0) return;
      const room = rooms.get(roomCode);
      if (!room?.gameState) return;
      if (room.gameState.currentPlayerIndex !== pidx) return;
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
      const roomCode = currentRoom ?? (socket as any)._currentRoom;
      const pidx = myPlayerIndex >= 0 ? myPlayerIndex : ((socket as any)._myPlayerIndex ?? -1);
      if (!roomCode || pidx < 0) return;
      const room = rooms.get(roomCode);
      if (!room?.gameState) return;
      if (room.gameState.currentPlayerIndex !== pidx) return;
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
      const roomCode = currentRoom ?? (socket as any)._currentRoom;
      const pidx = myPlayerIndex >= 0 ? myPlayerIndex : ((socket as any)._myPlayerIndex ?? -1);
      if (!roomCode || pidx < 0) return;
      const room = rooms.get(roomCode);
      if (!room?.gameState) return;
      if (room.gameState.currentPlayerIndex !== pidx) return;
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
      leaveMatchmaking();
      handleLeave();
    });

    function leaveMatchmaking() {
      if (!inMatchmaking || !matchmakingQueueKey) return;
      const q = matchmakingQueues.get(matchmakingQueueKey);
      if (q) {
        const idx = q.findIndex(e => e.socketId === socket.id);
        if (idx !== -1) q.splice(idx, 1);
      }
      inMatchmaking = false;
      matchmakingQueueKey = null;
    }

    function handleLeave() {
      const roomCode = currentRoom ?? (socket as any)._currentRoom;
      if (!roomCode) return;
      const room = rooms.get(roomCode);
      if (!room) return;

      const pidx = myPlayerIndex >= 0 ? myPlayerIndex : ((socket as any)._myPlayerIndex ?? -1);

      room.players = room.players.filter(p => p.socketId !== socket.id);
      socket.to(roomCode).emit("player_left", {
        playerIndex: pidx,
        players: buildPlayersInfo(room),
      });

      if (room.players.length === 0) {
        rooms.delete(roomCode);
      } else if (room.hostSocketId === socket.id && room.players.length > 0) {
        room.hostSocketId = room.players[0].socketId;
      }

      currentRoom = null;
      myPlayerIndex = -1;
    }
  });

  return io;
}

function startPreMatch(room: Room, io: SocketServer) {
  room.status = "pre_match";
  const playersInfo = room.players.map(p => ({
    name: p.name,
    playerIndex: p.playerIndex,
    avatarColor: p.avatarColor,
    avatarIcon: p.avatarIcon,
    level: p.level,
    rankColor: p.rankColor,
    rankIcon: p.rankIcon,
    rankName: p.rankName,
  }));

  for (const player of room.players) {
    io.to(player.socketId).emit("pre_match", {
      code: room.code,
      myPlayerIndex: player.playerIndex,
      players: playersInfo,
      mode: room.mode,
    });
  }

  setTimeout(() => {
    startGame(room, io);
  }, 4500);
}

function startGame(room: Room, io: SocketServer) {
  room.status = "playing";
  const names = room.players.map(p => p.name);
  const gs = initMultiGame(names, 8, room.mode === "coop");
  room.gameState = gs;
  room.hands = [...gs.hands];

  io.to(room.code).emit("game_starting", {
    playerCount: room.players.length,
    playerNames: names,
  });

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
    io.to(room.code).emit("game_over", {
      winnerIndex: room.gameState.winnerIndex,
      playerNames: room.gameState.playerNames,
    });
  }
}

const autoplayTimers = new Map<string, ReturnType<typeof setTimeout>>();

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
