import { useRef } from "react";
import { PanResponder } from "react-native";
import { router } from "expo-router";

const TAB_ROUTES = [
  "/(tabs)/",
  "/(tabs)/achievements",
  "/(tabs)/store",
  "/(tabs)/profile",
];

export function useSwipeTabs(currentIndex: number) {
  const indexRef = useRef(currentIndex);
  indexRef.current = currentIndex;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => {
        const dx = Math.abs(gs.dx);
        const dy = Math.abs(gs.dy);
        return dx > 20 && dx > dy * 2;
      },
      onPanResponderRelease: (_, gs) => {
        const dx = gs.dx;
        const dy = Math.abs(gs.dy);
        if (Math.abs(dx) < 60 || dy > Math.abs(dx) * 0.6) return;
        const idx = indexRef.current;
        if (dx < 0 && idx < TAB_ROUTES.length - 1) {
          router.push(TAB_ROUTES[idx + 1] as any);
        } else if (dx > 0 && idx > 0) {
          router.push(TAB_ROUTES[idx - 1] as any);
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
}
