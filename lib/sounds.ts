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
  | "streak"
  | "ocho"
  | "special_card"
  | "block_card"
  | "draw_penalty"
  | "reverse_card"
  | "countdown"
  | "match_start"
  | "effect_burst"
  | "timer_warning"
  | "joker_play"
  | "inactivity_warning"
  | "last_card"
  | "combo"
  | "friend_request"
  | "invite_accepted"
  | "deal_card"
  | "tension"
  | "searching"
  | "mock_laugh"
  | "applause"
  | "crowd_gasp"
  | "dramatic_drum"
  | "boo"
  | "cackle"
  | "victory_fanfare"
  // Task #83 — unique opening sound per chest rarity.
  | "chest_open_common"
  | "chest_open_rare"
  | "chest_open_magic"
  | "chest_open_epic"
  | "chest_open_event"
  | "chest_open_fichas"
  | "chest_open_giant"
  | "chest_open_legendary"
  | "chest_open_supreme";

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
  playLevelUp,
  playOcho,
  playSpecialCard,
  playBlockCard,
  playDrawPenalty,
  playReverseCard,
  playCountdownBeep,
  playMatchStart,
  playEffectBurst,
  playTimerWarning,
  playJokerPlay,
  playInactivityWarning,
  playLastCard,
  playCombo,
  playFriendRequest,
  playInviteAccepted,
  playDealCard,
  playTension,
  playMockLaugh,
  playApplause,
  playCrowdGasp,
  playDramaticDrum,
  playBoo,
  playCackle,
  playVictoryFanfare,
  playChestOpen,
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
    case "level_up":           return playLevelUp();
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
    case "ocho":               return playOcho();
    case "special_card":       return playSpecialCard();
    case "block_card":         return playBlockCard();
    case "draw_penalty":       return playDrawPenalty();
    case "reverse_card":       return playReverseCard();
    case "countdown":          return playCountdownBeep();
    case "match_start":        return playMatchStart();
    case "effect_burst":       return playEffectBurst();
    case "timer_warning":      return playTimerWarning();
    case "joker_play":         return playJokerPlay();
    case "inactivity_warning": return playInactivityWarning();
    case "last_card":          return playLastCard();
    case "combo":              return playCombo();
    case "friend_request":     return playFriendRequest();
    case "invite_accepted":    return playInviteAccepted();
    case "deal_card":          return playDealCard();
    case "tension":            return playTension();
    case "searching":          return playMenuOpen();
    case "mock_laugh":         return playMockLaugh();
    case "applause":           return playApplause();
    case "crowd_gasp":         return playCrowdGasp();
    case "dramatic_drum":      return playDramaticDrum();
    case "boo":                return playBoo();
    case "cackle":             return playCackle();
    case "victory_fanfare":    return playVictoryFanfare();
    case "chest_open_common":    return playChestOpen("common");
    case "chest_open_rare":      return playChestOpen("rare");
    case "chest_open_magic":     return playChestOpen("magic");
    case "chest_open_epic":      return playChestOpen("epic");
    case "chest_open_event":     return playChestOpen("event");
    case "chest_open_fichas":    return playChestOpen("fichas");
    case "chest_open_giant":     return playChestOpen("giant");
    case "chest_open_legendary": return playChestOpen("legendary");
    case "chest_open_supreme":   return playChestOpen("supreme");
  }
}
