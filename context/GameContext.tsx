import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  GameState,
  Card,
  Suit,
  initGame,
  playCard,
  playerDraw,
  aiTurn,
  chooseSuit,
  getPlayableCards,
} from "@/lib/gameEngine";
import type { GameModeId, Difficulty } from "@/lib/gameModes";
import { getModeById, getDifficultyById } from "@/lib/gameModes";
import { getRandomCpuProfile, CpuProfile } from "@/lib/cpuProfiles";

import { generateChallengeRules, ActiveChallengeRules } from "@/lib/challengeRules";

const BIYIS_PROFILE: CpuProfile = {
  name: "Biyis",
  avatarId: "avatar_developer",
  titleId: "title_god",
  level: 99,
  avatarColor: "#D4AF37",
  avatarIcon: "code-slash",
};

export interface GameSession {
  mode: GameModeId;
  difficulty: Difficulty;
  tournamentRound: number;
  tournamentScores: [number, number];
  gameStartTime: number;
  cardsDrawnThisGame: number;
  eightsPlayedThisGame: number;
  cardsPlayedThisGame: number;
  maxHandSizeReached: number;
  cpuProfile: CpuProfile | null;
  challengeRules?: import("@/lib/challengeRules").ActiveChallengeRules;
}

interface GameContextValue {
  gameState: GameState | null;
  session: GameSession | null;
  startGame: (mode: GameModeId, difficulty: Difficulty, overrideCpuProfile?: any) => void;
  handlePlayCard: (card: Card, chosenSuit?: Suit) => void;
  handleDraw: () => void;
  handleChooseSuit: (suit: Suit) => void;
  runAiTurn: () => void;
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
  dealAnimationDone: boolean;
  setDealAnimationDone: (done: boolean) => void;
  startNextTournamentRound: () => void;
  getGameResult: () => "player_wins" | "ai_wins" | "draw" | null;
  forceGameOver: () => void;
  forceAiDraw: () => void;
  forcePlayerWin: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

import { useProfile } from "./ProfileContext";

export function GameProvider({ children }: { children: ReactNode }) {
  const { level: playerLevel, profile: playerProfile } = useProfile();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [dealAnimationDone, setDealAnimationDone] = useState(false);

  const startGame = useCallback((mode: GameModeId, difficulty: Difficulty, overrideCpuProfile?: any) => {
    const modeConfig = getModeById(mode);
    const isExpert = difficulty === "expert";
    const cpuProfile = mode === "practice"
      ? BIYIS_PROFILE
      : (overrideCpuProfile || getRandomCpuProfile(undefined, playerLevel, isExpert, playerProfile?.avatarId));

    let challengeRules: ActiveChallengeRules | undefined;
    let cardsPerPlayer = modeConfig.cardsPerPlayer;
    if (mode === "challenge") {
      challengeRules = generateChallengeRules();
      if (challengeRules.startingCards) {
        cardsPerPlayer = challengeRules.startingCards;
      }
    }

    const newState = initGame(cardsPerPlayer, difficulty);
    setSelectedCard(null);
    setDealAnimationDone(false);
    setGameState(newState);
    setSession({
      mode,
      difficulty,
      tournamentRound: 1,
      tournamentScores: [0, 0],
      gameStartTime: Date.now(),
      cardsDrawnThisGame: 0,
      eightsPlayedThisGame: 0,
      cardsPlayedThisGame: 0,
      maxHandSizeReached: cardsPerPlayer,
      cpuProfile,
      challengeRules,
    });
  }, [playerLevel]);

  const handlePlayCard = useCallback((card: Card, chosenSuit?: Suit) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const next = playCard(prev, card, chosenSuit);
      return next;
    });
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        eightsPlayedThisGame: card.rank === "8" ? prev.eightsPlayedThisGame + 1 : prev.eightsPlayedThisGame,
        cardsPlayedThisGame: prev.cardsPlayedThisGame + 1,
      };
    });
    setSelectedCard(null);
  }, []);

  const handleDraw = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      return playerDraw(prev);
    });
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, cardsDrawnThisGame: prev.cardsDrawnThisGame + 1 };
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
      const difficulty = session?.difficulty ?? "normal";
      const mode = session?.mode ?? "classic";
      return aiTurn(prev, difficulty, mode);
    });
  }, [session?.difficulty, session?.mode]);

  const startNextTournamentRound = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const modeConfig = getModeById(prev.mode);
      const newState = initGame(modeConfig.cardsPerPlayer, prev.difficulty);
      const isExpert = prev.difficulty === "expert";
      const cpuProfile = prev.mode === "practice"
        ? BIYIS_PROFILE
        : getRandomCpuProfile(undefined, playerLevel, isExpert, playerProfile?.avatarId);

      setDealAnimationDone(false);
      setGameState(newState);
      return {
        ...prev,
        tournamentRound: prev.tournamentRound + 1,
        gameStartTime: Date.now(),
        cardsDrawnThisGame: 0,
        eightsPlayedThisGame: 0,
        cardsPlayedThisGame: 0,
        cpuProfile,
      };
    });
    setSelectedCard(null);
  }, [playerLevel]);

  const getGameResult = useCallback((): "player_wins" | "ai_wins" | "draw" | null => {
    if (!gameState) return null;
    if (gameState.phase === "player_wins") return "player_wins";
    if (gameState.phase === "ai_wins") return "ai_wins";
    if (gameState.phase === "draw") return "draw";
    return null;
  }, [gameState]);

  const forceGameOver = useCallback(() => {
    setGameState(prev => prev ? { ...prev, phase: "ai_wins", message: "¡Regla violada! — Derrota" } : prev);
  }, []);

  const forceAiDraw = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      const newDrawPile = [...prev.drawPile];
      const newAiHand = [...prev.aiHand];
      if (newDrawPile.length > 0) newAiHand.push(newDrawPile.pop()!);
      return { ...prev, drawPile: newDrawPile, aiHand: newAiHand };
    });
  }, []);

  const forcePlayerWin = useCallback(() => {
    setGameState(prev => prev ? { ...prev, phase: "player_wins", message: "rival_abandoned" } : prev);
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        session,
        startGame,
        handlePlayCard,
        handleDraw,
        handleChooseSuit,
        runAiTurn,
        selectedCard,
        setSelectedCard,
        dealAnimationDone,
        setDealAnimationDone,
        startNextTournamentRound,
        getGameResult,
        forceGameOver,
        forceAiDraw,
        forcePlayerWin,
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
