import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useGame } from "@/context/GameContext";

// Boots a Lightning session and navigates to the shared /game screen.
export default function LightningScreen() {
  const router = useRouter();
  const { startGame } = useGame();
  useEffect(() => {
    startGame("lightning", "normal");
    router.replace("/game");
  }, []);
  return null;
}
