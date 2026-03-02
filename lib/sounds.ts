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

import {
  playCardFlip,
  playCardDraw,
  playCardWild,
  playShuffle,
  playWin,
  playLose,
  playButton,
  playError,
  playAchievement,
} from "@/lib/audioManager";

export async function playSound(event: SoundEvent) {
  switch (event) {
    case "card_play":   return playCardFlip();
    case "card_draw":   return playCardDraw();
    case "card_wild":   return playCardWild();
    case "card_deal":   return playCardFlip();
    case "shuffle":     return playShuffle();
    case "win":         return playWin();
    case "lose":        return playLose();
    case "button_press": return playButton();
    case "achievement": return playAchievement();
    case "purchase":    return playCardWild();
    case "error":       return playError();
    case "turn_change": return playButton();
  }
}
