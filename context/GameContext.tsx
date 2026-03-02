import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GameState,
  Card,
  Suit,
  initGame,
  playCard,
  playerDraw,
  aiTurn,
  chooseSuit,
} from "@/lib/gameEngine";

interface Stats {
  wins: number;
  losses: number;
  gamesPlayed: number;
}

interface GameContextValue {
  gameState: GameState | null;
  stats: Stats;
  startGame: () => void;
  handlePlayCard: (card: Card, chosenSuit?: Suit) => void;
  handleDraw: () => void;
  handleChooseSuit: (suit: Suit) => void;
  runAiTurn: () => void;
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
  loadStats: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, gamesPlayed: 0 });

  const loadStats = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem("ocho_stats");
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  const saveStats = useCallback(async (newStats: Stats) => {
    try {
      await AsyncStorage.setItem("ocho_stats", JSON.stringify(newStats));
    } catch {}
  }, []);

  const startGame = useCallback(() => {
    setSelectedCard(null);
    setGameState(initGame());
  }, []);

  const handlePlayCard = useCallback((card: Card, chosenSuit?: Suit) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const next = playCard(prev, card, chosenSuit);
      if (next.phase === "player_wins") {
        setStats((s) => {
          const updated = { ...s, wins: s.wins + 1, gamesPlayed: s.gamesPlayed + 1 };
          saveStats(updated);
          return updated;
        });
      }
      return next;
    });
    setSelectedCard(null);
  }, [saveStats]);

  const handleDraw = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      return playerDraw(prev);
    });
    setSelectedCard(null);
  }, []);

  const handleChooseSuit = useCallback((suit: Suit) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return chooseSuit(prev, suit);
    });
  }, []);

  const runAiTurn = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      const next = aiTurn(prev);
      if (next.phase === "ai_wins") {
        setStats((s) => {
          const updated = { ...s, losses: s.losses + 1, gamesPlayed: s.gamesPlayed + 1 };
          saveStats(updated);
          return updated;
        });
      }
      return next;
    });
  }, [saveStats]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        stats,
        startGame,
        handlePlayCard,
        handleDraw,
        handleChooseSuit,
        runAiTurn,
        selectedCard,
        setSelectedCard,
        loadStats,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
