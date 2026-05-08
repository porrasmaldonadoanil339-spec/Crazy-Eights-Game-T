import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";

/**
 * Task #79 — Unified hardware-back confirmation for every gameplay screen.
 *
 * Wires Android's hardware back button so the player always sees a
 * "¿Salir de la partida?" confirm modal before leaving a match — covering
 * Practice / Classic / Lightning / Tournament / Challenge / Ranked
 * (`app/game.tsx`), local Coop / multi (`app/game-multi.tsx`) and online
 * (`app/game-online.tsx`).
 *
 * Behaviour:
 *  - First back press:  open the confirm modal (intercepts back).
 *  - Second back press: mirrors the on-screen "No" button and just
 *    dismisses the modal — never silently pops the screen.
 *  - When `enabled` is `false` (e.g. the player hasn't actually started
 *    the match yet in `game-multi`), the system back behaves normally.
 *  - iOS/web: no-op. iOS has no hardware back button and web is handled
 *    by the browser/router.
 */
export function useGameBackHandler({
  visible,
  setVisible,
  enabled = true,
}: {
  visible: boolean;
  setVisible: (v: boolean) => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!enabled) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (visible) {
        setVisible(false);
        return true;
      }
      setVisible(true);
      return true;
    });
    return () => sub.remove();
  }, [visible, setVisible, enabled]);
}
