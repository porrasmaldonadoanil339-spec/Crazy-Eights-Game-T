export type SoundEvent =
  | "card_play"
  | "card_draw"
  | "card_wild"
  | "card_deal"
  | "card_flip"
  | "shuffle"
  | "win"
  | "lose"
  | "button_press"
  | "achievement"
  | "purchase"
  | "equip"
  | "error"
  | "turn_change"
  | "daily_reward"
  | "level_up"
  | "battle_pass_unlock"
  | "purchase_success"
  | "notification"
  | "tab"
  | "select"
  | "mode_select"
  | "menu_open"
  | "menu_close"
  | "coin_earn"
  | "streak";

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
  playTabSwitch,
  playEquip,
  playSelect,
  playCoinEarn,
  playStreak,
  playMenuOpen,
} from "@/lib/audioManager";

export async function playSound(event: SoundEvent) {
  switch (event) {
    case "card_play":          return playCardFlip();
    case "card_draw":          return playCardDraw();
    case "card_wild":          return playCardWild();
    case "card_deal":          return playCardFlip();
    case "card_flip":          return playCardFlip();
    case "shuffle":            return playShuffle();
    case "win":                return playWin();
    case "lose":               return playLose();
    case "button_press":       return playButton();
    case "achievement":        return playAchievement();
    case "purchase":           return playCardWild();
    case "equip":              return playEquip();
    case "error":              return playError();
    case "turn_change":        return playTabSwitch();
    case "daily_reward":       return playWin();
    case "level_up":           return playAchievement();
    case "battle_pass_unlock": return playAchievement();
    case "purchase_success":   return playCardWild();
    case "notification":       return playButton();
    case "tab":                return playTabSwitch();
    case "select":             return playSelect();
    case "mode_select":        return playSelect();
    case "menu_open":          return playMenuOpen();
    case "menu_close":         return playButton();
    case "coin_earn":          return playCoinEarn();
    case "streak":             return playStreak();
  }
}
