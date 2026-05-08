import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useGame } from "@/context/GameContext";

// Boots a Tournament session and navigates to the shared /game screen.
export default function TournamentScreen() {
  const router = useRouter();
  const { startGame } = useGame();
  useEffect(() => {
    startGame("tournament", "normal");
    router.replace("/game");
  }, []);
  return null;
}
