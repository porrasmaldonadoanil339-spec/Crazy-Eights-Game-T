import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import {
  initMultiGame, multiPlayCard, multiDraw, multiChooseSuit,
  multiGetTopCard, MultiGameState, cpuPlayMulti, multiApplyRandomShuffle,
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
  isBot?: boolean;
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
  lastShuffleTurnId?: number;
}

// "Cartas Aleatorias" event — change the active suit at random every N turns.
const RANDOM_SHUFFLE_EVERY = 4;
function maybeApplyRandomShuffle(room: Room): boolean {
  const gs = room.gameState;
  if (!gs) return false;
  if (gs.eventId !== "random") return false;
  if (gs.phase !== "playing" && gs.phase !== "pass_device") return false;
  if (gs.pendingDraw > 0) return false;
  const turnId = gs.turnId ?? 0;
  if (turnId === 0) return false;
  if (turnId % RANDOM_SHUFFLE_EVERY !== 0) return false;
  if (room.lastShuffleTurnId === turnId) return false;
  room.lastShuffleTurnId = turnId;
  room.gameState = multiApplyRandomShuffle(gs);
  return true;
}

interface MatchmakingEntry extends RoomPlayerProfile {
  socketId: string;
  joinedAt: number;
  rank: number; // 0..11 (used for progressive rank-window matching)
}

const rooms = new Map<string, Room>();
const matchmakingQueues = new Map<string, MatchmakingEntry[]>();
const matchmakingTickers = new Map<string, ReturnType<typeof setInterval>>();

// Progressive rank window for ranked matchmaking. After joining the queue, the
// acceptable rank delta widens over time so a player is never stuck waiting
// forever. Non-ranked modes use an unlimited window (any rank pairs).
function rankWindowForElapsed(elapsedMs: number): number {
  const s = elapsedMs / 1000;
  if (s < 5)  return 1;   // ±1 rank tier (e.g. Plata vs Bronce/Oro)
  if (s < 10) return 2;
  if (s < 18) return 3;
  if (s < 28) return 5;
  return 99;              // anyone
}

// Mirrors the live-event schedule from components/EventsCard.tsx so the server
// can determine which event is currently active without depending on
// per-player level gates (those only control client-side visibility).
const EVENT_IDS = ["speed", "random", "double", "survival"] as const;
const EVENT_DURATION_DAYS = 2;
const EVENT_CYCLE_MS = 3 * 24 * 3600 * 1000;
const EVENT_BASE_MS = new Date("2026-03-01T00:00:00Z").getTime();
function getActiveEventIdForServer(): string | null {
  const elapsed = Date.now() - EVENT_BASE_MS;
  if (elapsed < 0) return null;
  const cycleIndex = Math.floor(elapsed / EVENT_CYCLE_MS);
  const cyclePos = elapsed % EVENT_CYCLE_MS;
  if (cyclePos >= EVENT_DURATION_DAYS * 24 * 3600 * 1000) return null;
  return EVENT_IDS[cycleIndex % EVENT_IDS.length];
}

const DEFAULT_PROFILE: Omit<RoomPlayerProfile, "name"> = {
  avatarColor: "#D4AF37",
  avatarIcon: "person",
  level: 1,
  rankColor: "#8B7355",
  rankIcon: "shield",
  rankName: "Hierro V",
};

// Bot fill name pool
const BOT_NAMES = [
  "CarlosX99", "LunaMaster", "FireStrike", "ShadowKing", "CristinaPro",
  "NightWolf", "TigerBeat", "JokerPro", "AceHunter", "BlackCard",
  "DiamondX", "QueenBee", "KingSlayer", "WildCard88", "RoyalFlush",
];
const BOT_AVATAR_COLORS = [
  "#E74C3C", "#9B59B6", "#E67E22", "#1A8FC1", "#2ECC71",
  "#C0392B", "#27AE60", "#8E44AD", "#F39C12", "#D4AF37",
];
const BOT_RANK_NAMES = [
  "Hierro 5", "Hierro 4", "Bronce 5", "Bronce 4", "Plata 5",
  "Plata 4", "Oro 5", "Bronce 3", "Hierro 3", "Plata 3",
];
const BOT_RANK_COLORS = [
  "#8B7355", "#CD7F32", "#C0C0C0", "#FFD700", "#8B7355",
];

function makeBotPlayer(playerIndex: number, seed: number): RoomPlayer {
  const i = (seed + playerIndex) % BOT_NAMES.length;
  return {
    socketId: `bot_${playerIndex}_${Date.now()}`,
    name: BOT_NAMES[i],
    playerIndex,
    avatarColor: BOT_AVATAR_COLORS[i % BOT_AVATAR_COLORS.length],
    avatarIcon: "person",
    level: 5 + (i % 25),
    rankColor: BOT_RANK_COLORS[i % BOT_RANK_COLORS.length],
    rankIcon: "shield",
    rankName: BOT_RANK_NAMES[i % BOT_RANK_NAMES.length],
    isBot: true,
  };
}

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
    eventId: gs.eventId ?? null,
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
    isBot: p.isBot ?? false,
  }));
}

// Only real (non-bot) players
function realPlayers(room: Room): RoomPlayer[] {
  return room.players.filter(p => !p.isBot);
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
        isBot: false,
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
      // Count only real players for capacity check
      const realCount = realPlayers(room).length;
      if (realCount >= room.maxPlayers) {
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
        isBot: false,
      };
      room.players.push(player);
      currentRoom = code.toUpperCase();
      myPlayerIndex = playerIndex;
      socket.join(code.toUpperCase());

      const playersInfo = buildPlayersInfo(room);
      socket.emit("room_joined", { code: room.code, playerIndex, players: playersInfo });
      socket.to(code.toUpperCase()).emit("player_joined", { name: playerName, players: playersInfo });

      if (realPlayers(room).length === room.maxPlayers) {
        startPreMatch(room, io);
      }
    });

    // ─── Matchmaking queue ─────────────────────────────────────────────────
    socket.on("join_matchmaking", ({
      playerName, mode = "classic", playerCount = 2,
      avatarColor, avatarIcon, level, rankColor, rankIcon, rankName, rank,
    }: {
      playerName: string; mode?: string; playerCount?: number;
      avatarColor?: string; avatarIcon?: string; level?: number;
      rankColor?: string; rankIcon?: string; rankName?: string;
      rank?: number;
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
        rank: typeof rank === "number" ? Math.max(0, Math.min(11, Math.floor(rank))) : 0,
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
      socket.emit("matchmaking_status", {
        queueSize: queue.length, needed: playerCount,
        rankWindow: rankWindowForElapsed(0), expanding: false,
      });

      ensureMatchmakingTicker(key, mode, playerCount, io);
      tryProgressiveMatch(key, mode, playerCount, io);
    });

    socket.on("cancel_matchmaking", () => {
      leaveMatchmaking();
    });

    // ─── Start game (host only) ────────────────────────────────────────────
    // Accepts optional { botFill: true } to fill remaining slots with bots.
    // This allows ranked rooms to start with 1+ real player.
    socket.on("start_game", ({ botFill }: { botFill?: boolean } = {}) => {
      const roomCode = currentRoom ?? (socket as any)._currentRoom;
      if (!roomCode) return;
      const room = rooms.get(roomCode);
      if (!room || room.hostSocketId !== socket.id) return;

      const humanCount = realPlayers(room).length;

      if (botFill) {
        // Fill remaining player slots with bots
        const seed = Math.floor(Math.random() * BOT_NAMES.length);
        while (room.players.length < room.maxPlayers) {
          const botIdx = room.players.length;
          room.players.push(makeBotPlayer(botIdx, seed));
        }
      } else {
        if (humanCount < 2) {
          socket.emit("error_msg", { error: "Necesitas al menos 2 jugadores" });
          return;
        }
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
        maybeApplyRandomShuffle(room);
        broadcastGameState(room, io);
        if (room.gameState.phase !== "choosing_suit" && room.gameState.phase !== "game_over") {
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
        maybeApplyRandomShuffle(room);
        broadcastGameState(room, io);
        if (room.gameState.phase !== "game_over") {
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
        const prev = suitChoiceTimers.get(room.code);
        if (prev) { clearTimeout(prev); suitChoiceTimers.delete(room.code); }
        const newState = multiChooseSuit(room.gameState, suit);
        room.gameState = newState;
        maybeApplyRandomShuffle(room);
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

      // If an active game is running and other real players remain, convert the
      // disconnected slot to a bot so the match continues uninterrupted.
      const activeGame = room.status === "playing" || room.status === "pre_match";
      const otherRealPlayers = room.players.filter(
        p => p.socketId !== socket.id && !p.isBot
      );

      if (activeGame && otherRealPlayers.length > 0) {
        const leaver = room.players.find(p => p.socketId === socket.id);
        if (leaver) {
          // Promote slot to bot — keeps playerIndex intact for gameState
          leaver.isBot = true;
          leaver.socketId = `bot_${leaver.playerIndex}_${Date.now()}`;
          // Inform remaining players that someone left (but game continues)
          socket.to(roomCode).emit("player_disconnected", {
            playerIndex: pidx,
            playerName: leaver.name,
            players: buildPlayersInfo(room),
          });
          // Transfer host if needed
          if (room.hostSocketId === socket.id && otherRealPlayers.length > 0) {
            room.hostSocketId = otherRealPlayers[0].socketId;
          }
          // If the bot's turn is up immediately, trigger autoplay
          if (room.gameState && room.gameState.currentPlayerIndex === pidx) {
            scheduleAutoplay(room, io);
          }
        }
      } else {
        // Lobby stage or no other real players — remove normally
        room.players = room.players.filter(p => p.socketId !== socket.id);
        socket.to(roomCode).emit("player_left", {
          playerIndex: pidx,
          players: buildPlayersInfo(room),
        });

        if (realPlayers(room).length === 0) {
          clearRoomTimers(roomCode);
          rooms.delete(roomCode);
        } else if (room.hostSocketId === socket.id && realPlayers(room).length > 0) {
          room.hostSocketId = realPlayers(room)[0].socketId;
        }
      }

      currentRoom = null;
      myPlayerIndex = -1;
    }
  });

  return io;
}

function ensureMatchmakingTicker(key: string, mode: string, playerCount: number, io: SocketServer) {
  if (matchmakingTickers.has(key)) return;
  const id = setInterval(() => {
    const queue = matchmakingQueues.get(key);
    if (!queue || queue.length === 0) {
      const t = matchmakingTickers.get(key);
      if (t) clearInterval(t);
      matchmakingTickers.delete(key);
      return;
    }
    // Push live status (rank window / expanding flag) to each waiting player.
    const now = Date.now();
    for (const e of queue) {
      const elapsed = now - e.joinedAt;
      const win = mode === "ranked" ? rankWindowForElapsed(elapsed) : 99;
      io.sockets.sockets.get(e.socketId)?.emit("matchmaking_status", {
        queueSize: queue.length,
        needed: playerCount,
        rankWindow: win,
        expanding: mode === "ranked" && elapsed >= 5_000,
      });
    }
    tryProgressiveMatch(key, mode, playerCount, io);
  }, 750);
  matchmakingTickers.set(key, id);
}

// Greedy rank-window matcher: starts from the longest-waiting entry and pulls
// in the next playerCount-1 candidates whose rank deltas fit inside that
// entry's current widening window. Falls back to FIFO for non-ranked modes.
function tryProgressiveMatch(key: string, mode: string, playerCount: number, io: SocketServer) {
  const queue = matchmakingQueues.get(key);
  if (!queue || queue.length < playerCount) return;
  const now = Date.now();

  // Anchor = longest-waiting entry (queue is FIFO so it's index 0).
  const anchor = queue[0];
  const anchorWindow = mode === "ranked" ? rankWindowForElapsed(now - anchor.joinedAt) : 99;

  const matched: MatchmakingEntry[] = [anchor];
  for (let i = 1; i < queue.length && matched.length < playerCount; i++) {
    const cand = queue[i];
    if (mode === "ranked") {
      const candWindow = rankWindowForElapsed(now - cand.joinedAt);
      const allowed = Math.min(anchorWindow, candWindow);
      if (Math.abs(cand.rank - anchor.rank) > allowed) continue;
    }
    matched.push(cand);
  }

  if (matched.length < playerCount) return;

  // Remove matched entries from the queue (preserve order of the rest).
  const matchedIds = new Set(matched.map(m => m.socketId));
  matchmakingQueues.set(key, queue.filter(e => !matchedIds.has(e.socketId)));

  const code = uniqueCode();
  const room: Room = {
    code,
    hostSocketId: matched[0].socketId,
    players: matched.map((m, i) => ({ ...m, playerIndex: i, isBot: false })),
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

function startPreMatch(room: Room, io: SocketServer) {
  room.status = "pre_match";
  const playersInfo = buildPlayersInfo(room);

  // Only emit pre_match to real (non-bot) players
  for (const player of realPlayers(room)) {
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
  // Sort players by playerIndex to ensure correct hand assignment
  const sortedPlayers = [...room.players].sort((a, b) => a.playerIndex - b.playerIndex);
  const names = sortedPlayers.map(p => p.name);
  const gs = initMultiGame(names, 8, getActiveEventIdForServer());
  room.gameState = gs;
  room.hands = [...gs.hands];
  room.lastShuffleTurnId = undefined;

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

  // Only send game state to real (non-bot) players
  for (const player of realPlayers(room)) {
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
const humanTurnTimers = new Map<string, ReturnType<typeof setTimeout>>();
const suitChoiceTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Stability: if a connected human player doesn't act within this window, the
// server force-plays for them (bot logic). Prevents zombie matches when a
// player goes to background, loses focus, or has flaky network.
const HUMAN_TURN_TIMEOUT_MS = 45_000;
// Same idea but for the "choose suit" sub-phase after playing an 8: shorter
// because a single tap is all that's required.
const SUIT_CHOICE_TIMEOUT_MS = 15_000;

function pickAutoSuit(hand: Card[]): Suit {
  const counts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
  for (const c of hand) {
    if (c.rank !== "8" && (c.suit in counts)) counts[c.suit]++;
  }
  let best: Suit = "hearts"; let bestN = -1;
  (["hearts", "diamonds", "clubs", "spades"] as Suit[]).forEach(s => {
    if (counts[s] > bestN) { bestN = counts[s]; best = s; }
  });
  return best;
}

function clearRoomTimers(code: string) {
  const a = autoplayTimers.get(code); if (a) { clearTimeout(a); autoplayTimers.delete(code); }
  const h = humanTurnTimers.get(code); if (h) { clearTimeout(h); humanTurnTimers.delete(code); }
  const s = suitChoiceTimers.get(code); if (s) { clearTimeout(s); suitChoiceTimers.delete(code); }
}

function scheduleAutoplay(room: Room, io: SocketServer) {
  if (!room.gameState) return;
  if (room.gameState.phase === "game_over") { clearRoomTimers(room.code); return; }

  // ─── choosing_suit recovery ──────────────────────────────────────────────
  // The active player must pick a suit. If it's a bot, do it after a short
  // delay; if it's a human, arm a timeout that auto-picks for them.
  if (room.gameState.phase === "choosing_suit") {
    const curr = room.gameState.currentPlayerIndex;
    const isBot = !!room.players.find(p => p.playerIndex === curr && p.isBot);
    const prev = suitChoiceTimers.get(room.code);
    if (prev) clearTimeout(prev);

    const delay = isBot ? 700 + Math.random() * 600 : SUIT_CHOICE_TIMEOUT_MS;
    const t = setTimeout(() => {
      suitChoiceTimers.delete(room.code);
      if (!room.gameState) return;
      if (room.gameState.phase !== "choosing_suit") return;
      if (room.gameState.currentPlayerIndex !== curr) return;
      try {
        const hand = room.gameState.hands?.[curr] ?? [];
        const suit = pickAutoSuit(hand);
        room.gameState = multiChooseSuit(room.gameState, suit);
        maybeApplyRandomShuffle(room);
        broadcastGameState(room, io);
        scheduleAutoplay(room, io);
      } catch {}
    }, delay);
    suitChoiceTimers.set(room.code, t);
    return;
  }

  const curr = room.gameState.currentPlayerIndex;
  // Check if current player is a real (non-bot) human player
  const humanPlayer = room.players.find(p => p.playerIndex === curr && !p.isBot);
  if (humanPlayer) {
    // Arm a long-running idle-turn timer so a stuck human player can't freeze
    // the room. The timer is reset every time a new game_state is broadcast.
    const prevHuman = humanTurnTimers.get(room.code);
    if (prevHuman) clearTimeout(prevHuman);
    const idle = setTimeout(() => {
      if (!room.gameState) return;
      if (room.gameState.currentPlayerIndex !== curr) return;
      try {
        const newState = cpuPlayMulti(room.gameState);
        room.gameState = newState;
        maybeApplyRandomShuffle(room);
        broadcastGameState(room, io);
        if (room.gameState.phase !== "game_over" && room.gameState.phase !== "choosing_suit") {
          scheduleAutoplay(room, io);
        }
      } catch {}
    }, HUMAN_TURN_TIMEOUT_MS);
    humanTurnTimers.set(room.code, idle);
    return;
  }

  // Bot turn — clear any pending human idle timer so it doesn't fire later
  const prevHuman = humanTurnTimers.get(room.code);
  if (prevHuman) {
    clearTimeout(prevHuman);
    humanTurnTimers.delete(room.code);
  }

  const prev = autoplayTimers.get(room.code);
  if (prev) clearTimeout(prev);

  const delay = 900 + Math.random() * 800;
  const timer = setTimeout(() => {
    if (!room.gameState) return;
    if (room.gameState.currentPlayerIndex === curr) {
      try {
        const newState = cpuPlayMulti(room.gameState);
        room.gameState = newState;
        maybeApplyRandomShuffle(room);
        broadcastGameState(room, io);
        if (room.gameState.phase !== "game_over" && room.gameState.phase !== "choosing_suit") {
          scheduleAutoplay(room, io);
        }
      } catch {}
    }
  }, delay);

  autoplayTimers.set(room.code, timer);
}
