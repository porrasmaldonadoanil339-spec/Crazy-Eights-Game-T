import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useGame } from "@/context/GameContext";

// Boots a Challenge session and navigates to the shared /game screen.
export default function ChallengeScreen() {
  const router = useRouter();
  const { startGame } = useGame();
  useEffect(() => {
    startGame("challenge", "normal");
    router.replace("/game");
  }, []);
  return null;
}
