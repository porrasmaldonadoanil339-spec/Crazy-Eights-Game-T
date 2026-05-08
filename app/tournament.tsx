import { useEffect } from "react";
import { Redirect, useRouter } from "expo-router";
import { useGame } from "@/context/GameContext";

// Dedicated entry point for Torneo. See app/lightning.tsx for the rationale.
export default function TournamentScreen() {
  const router = useRouter();
  const { startGame } = useGame();

  useEffect(() => {
    startGame("tournament", "normal");
    router.replace("/game");
  }, []);

  return <Redirect href="/game" />;
}
