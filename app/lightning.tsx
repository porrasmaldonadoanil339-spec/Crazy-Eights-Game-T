import { useEffect } from "react";
import { Redirect, useRouter } from "expo-router";
import { useGame } from "@/context/GameContext";

// Dedicated entry point for Relámpago. Boots the Lightning session and
// hands off to the shared /game screen (single source of truth for the
// in-match UI). Lets deep-links and AAA-mode shortcuts route here directly
// without each call site re-implementing the startGame/router.push pair.
export default function LightningScreen() {
  const router = useRouter();
  const { startGame } = useGame();

  useEffect(() => {
    startGame("lightning", "normal");
    router.replace("/game");
  }, []);

  return <Redirect href="/game" />;
}
