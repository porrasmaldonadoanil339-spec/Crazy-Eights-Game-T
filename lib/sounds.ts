import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export type SoundEvent =
  | "card_play"
  | "card_draw"
  | "card_wild"
  | "card_deal"
  | "shuffle"
  | "win"
  | "lose"
  | "button_press"
  | "achievement"
  | "purchase"
  | "error"
  | "turn_change";

async function safeHaptic(fn: () => Promise<void>) {
  try {
    if (Platform.OS !== "web") {
      await fn();
    }
  } catch {}
}

export async function playSound(event: SoundEvent) {
  switch (event) {
    case "card_play":
      await safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      break;
    case "card_draw":
      await safeHaptic(() => Haptics.selectionAsync());
      break;
    case "card_wild":
      await safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
      break;
    case "card_deal":
      await safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      break;
    case "shuffle":
      await safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
      break;
    case "win":
      await safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
      break;
    case "lose":
      await safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
      break;
    case "button_press":
      await safeHaptic(() => Haptics.selectionAsync());
      break;
    case "achievement":
      await safeHaptic(async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
      });
      break;
    case "purchase":
      await safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
      break;
    case "error":
      await safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
      break;
    case "turn_change":
      await safeHaptic(() => Haptics.selectionAsync());
      break;
  }
}
