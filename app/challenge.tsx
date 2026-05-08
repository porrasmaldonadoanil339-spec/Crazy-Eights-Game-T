import { useEffect } from "react";
import { Redirect, useRouter } from "expo-router";
import { useGame } from "@/context/GameContext";

// Dedicated entry point for Desafíos. See app/lightning.tsx for the rationale.
export default function ChallengeScreen() {
  const router = useRouter();
  const { startGame } = useGame();

  useEffect(() => {
    startGame("challenge", "normal");
    router.replace("/game");
  }, []);

  return <Redirect href="/game" />;
}
