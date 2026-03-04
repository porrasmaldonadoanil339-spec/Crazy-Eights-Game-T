export type AchievementId =
  // Win milestones
  | "first_win" | "win_5" | "win_25" | "win_100" | "win_250" | "win_500"
  // Mode wins
  | "lightning_king" | "tournament_champ" | "coop_hero" | "challenge_master" | "expert_survivor"
  | "all_modes" | "practice_grad"
  // Special cards
  | "eight_wizard" | "eight_10" | "eight_50" | "joker_hero" | "joker_final"
  | "chain_two" | "chain_seven" | "j_master" | "triple_play" | "reverse_master"
  // Hands
  | "perfect_hand" | "comeback_king" | "speed_demon" | "marathon_man" | "flawless_expert"
  | "no_special_win" | "speed_30s"
  // Coins
  | "collector_50" | "collector_500" | "collector_1000" | "spender" | "big_spender"
  // Streaks
  | "daily_streak_3" | "daily_streak_7" | "daily_streak_14" | "daily_streak_30" | "daily_streak_60"
  // Store & Collection
  | "first_purchase" | "collector_items5" | "collector_items10" | "collector_items20" | "collector_items30"
  | "fashion" | "effect_equipped" | "frame_equipped" | "title_equipped"
  // Difficulty
  | "hard_win" | "expert_win" | "no_draw_win" | "draw_5" | "draw_10"
  // Social/fun
  | "bad_luck" | "lucky_draw" | "domination" | "underdog" | "marathon_session"
  // Multiplayer
  | "first_multi_win" | "online_winner" | "multi_sessions_5" | "multi_sessions_20"
  // XP/Level milestones
  | "xp_1000" | "xp_10000" | "xp_50000"
  // Battle Pass
  | "bp_tier_10" | "bp_tier_40" | "bp_tier_80"
  // Cards played stats
  | "cards_played_100" | "cards_played_500" | "cards_played_1000"
  // Session streaks
  | "win_3_streak" | "win_5_streak" | "win_10_streak"
  // Multiplier wins/stats
  | "multi_win_5" | "multi_win_10" | "online_win_5" | "online_win_10"
  // Language & Themes
  | "portuguese_player" | "polyglot" | "theme_changer" | "dark_side" | "light_bringer"
  // Store & Collection expansion
  | "collector_items50" | "collector_items70" | "avatar_collector" | "frame_collector"
  // Gameplay specifics
  | "fast_draw" | "no_thinking" | "strategic_win" | "wild_frenzy" | "j_spam" | "seven_trap"
  | "draw_20_total" | "win_with_one_card_left" | "epic_comeback"
  // Level & XP expansion
  | "level_50" | "level_100" | "xp_100000"
  // Social & Others
  | "emote_master" | "silent_player" | "sound_lover" | "session_30m" | "session_1h"
  | "early_bird" | "night_owl" | "weekend_warrior"
  | "lucky_seven" | "crazy_eights_5" | "joker_madness"
  // Expert challenges
  | "expert_10" | "expert_timeout_survive" | "expert_god"
  // ── Expansion to 300 ──────────────────────────────────────────────────────
  // Win milestones+
  | "win_10" | "win_50" | "win_1000" | "win_2500" | "win_5000"
  // Games played milestones
  | "games_10" | "games_25" | "games_50" | "games_100" | "games_500" | "games_1000"
  // Mode-specific expansion
  | "lightning_3" | "lightning_10" | "lightning_25"
  | "tournament_3" | "tournament_10" | "tournament_25"
  | "coop_3" | "coop_15" | "coop_30"
  | "challenge_1" | "challenge_5" | "challenge_25" | "challenge_100"
  | "practice_25" | "practice_50" | "practice_100"
  // Special cards expansion
  | "eight_25" | "eight_100" | "eight_200"
  | "joker_5" | "joker_30" | "joker_100"
  | "j_game_5" | "ace_block"
  // Hand quality expansion
  | "perfect_hand_3" | "perfect_hand_10"
  | "comeback_3" | "comeback_10"
  | "speed_1m" | "no_special_5"
  | "marathon_15m" | "marathon_25m"
  // Coins expansion
  | "collector_2000" | "collector_5000" | "collector_10000"
  | "big_spender_1000" | "big_spender_5000"
  // Streaks expansion
  | "daily_streak_90" | "daily_streak_180" | "daily_streak_365"
  // Store expansion
  | "collector_items90"
  | "avatar_collector_30" | "frame_collector_25"
  | "title_collector_10" | "effect_collector" | "store_addict"
  // Difficulty expansion
  | "hard_win_5" | "hard_win_25"
  | "expert_25" | "expert_50" | "expert_100" | "expert_no_draw"
  // Multiplayer expansion
  | "multi_win_25" | "multi_win_50" | "multi_win_100"
  | "online_win_25" | "online_win_50" | "online_win_100"
  | "multi_sessions_50" | "multi_sessions_100"
  // XP / Level expansion
  | "xp_500" | "xp_5000" | "xp_25000" | "xp_200000" | "xp_500000"
  | "level_5" | "level_10" | "level_25" | "level_75" | "level_99"
  // Battle Pass expansion
  | "bp_tier_150" | "bp_tier_200" | "bp_tier_250" | "bp_tier_300"
  // Cards played expansion
  | "cards_played_2000" | "cards_played_5000" | "cards_played_10000" | "cards_played_50000"
  // Win streak expansion
  | "win_7_streak" | "win_15_streak" | "win_20_streak"
  // Emote
  | "emote_first" | "emote_5" | "emote_25" | "emote_100"
  // Daily rewards
  | "daily_reward_7" | "daily_reward_30" | "daily_reward_100" | "daily_reward_365"
  // Audio / Settings
  | "mute_toggle" | "sound_all_on" | "audio_lover"
  // Special wins
  | "tournament_perfect" | "coop_undefeated" | "domination_5" | "perfect_streak" | "clutch_king"
  // Gameplay specific expansion
  | "wild_frenzy_3" | "j_spam_5" | "seven_trap_3" | "two_chain_3"
  | "joker_comeback" | "perfect_eight" | "defensive_master" | "offensive_master"
  | "rainbow_win" | "last_card_win"
  // Time-based expansion
  | "early_bird_5" | "night_owl_5" | "weekend_warrior_5" | "speed_45s" | "marathon_30m"
  // Language expansion
  | "all_languages" | "spanish_player" | "english_player"
  // Customization
  | "legendary_back" | "legendary_avatar" | "legendary_frame" | "legendary_effect"
  | "legendary_title" | "full_legendary_set"
  // Rarity collection
  | "rare_collector_5" | "epic_collector_3"
  | "legendary_collector_1" | "legendary_collector_3" | "legendary_collector_5"
  // Wild 8 mastery
  | "eight_redirect_10" | "eight_redirect_50"
  | "eight_game_3" | "eight_game_5"
  // Ocho calls
  | "ocho_call_10" | "ocho_call_50" | "ocho_call_100" | "ocho_master"
  // Level extra
  | "level_50_wins"
  // Expert extras
  | "expert_no_timeout" | "expert_masterclass" | "expert_streak_5"
  // Social
  | "emote_master_full" | "silent_champion" | "team_player"
  // Battle pass collection
  | "bp_collector_10" | "bp_collector_50" | "bp_collector_100"
  // Comeback milestones
  | "epic_comeback_3" | "ultimate_comeback" | "miracle_win"
  // Challenge expansion
  | "challenge_streak_3" | "challenge_master_50" | "challenge_legend"
  // Collectors
  | "coin_millionaire" | "coin_spender_master"
  // Pattern wins
  | "all_same_suit" | "multisuit_win"
  // Tournament deep
  | "tournament_champion_25"
  // Wins from behind
  | "never_give_up";

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  target: number;
  coinsReward: number;
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  hidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ─── Win milestones ──────────────────────────────────────────────
  { id: "first_win",        title: "Primera Victoria",          description: "Gana tu primera partida.",                        icon: "star",             iconColor: "#FFD700", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "win_5",            title: "Jugador Experimentado",     description: "Gana 5 partidas.",                                icon: "star-half",        iconColor: "#FFD700", target: 5,    coinsReward: 30,   xpReward: 80,   rarity: "common" },
  { id: "win_25",           title: "Maestro de Cartas",         description: "Gana 25 partidas.",                              icon: "ribbon",           iconColor: "#C0C0C0", target: 25,   coinsReward: 80,   xpReward: 200,  rarity: "rare" },
  { id: "win_100",          title: "Centurión",                 description: "Gana 100 partidas.",                             icon: "trophy",           iconColor: "#D4AF37", target: 100,  coinsReward: 250,  xpReward: 500,  rarity: "epic" },
  { id: "win_250",          title: "Semidiós",                  description: "Gana 250 partidas.",                             icon: "diamond",          iconColor: "#E74C3C", target: 250,  coinsReward: 600,  xpReward: 1200, rarity: "epic" },
  { id: "win_500",          title: "Leyenda Eterna",            description: "Gana 500 partidas.",                             icon: "diamond",          iconColor: "#A855F7", target: 500,  coinsReward: 1000, xpReward: 2000, rarity: "legendary" },
  // ─── Mode wins ───────────────────────────────────────────────────
  { id: "lightning_king",   title: "Rey Relámpago",             description: "Gana 10 partidas en modo Relámpago.",            icon: "flash",            iconColor: "#FFD700", target: 10,   coinsReward: 50,   xpReward: 120,  rarity: "rare" },
  { id: "tournament_champ", title: "Campeón de Torneo",         description: "Gana 3 torneos.",                                icon: "medal",            iconColor: "#E67E22", target: 3,    coinsReward: 100,  xpReward: 300,  rarity: "epic" },
  { id: "coop_hero",        title: "Héroe Cooperativo",         description: "Gana 5 partidas en modo Cooperativo.",           icon: "people",           iconColor: "#27AE60", target: 5,    coinsReward: 60,   xpReward: 150,  rarity: "rare" },
  { id: "challenge_master", title: "Maestro de Desafíos",       description: "Completa 10 desafíos.",                          icon: "checkbox",         iconColor: "#9B59B6", target: 10,   coinsReward: 80,   xpReward: 200,  rarity: "epic" },
  { id: "expert_survivor",  title: "Superviviente Experto",     description: "Gana 5 partidas en modo Experto.",               icon: "timer",            iconColor: "#E74C3C", target: 5,    coinsReward: 150,  xpReward: 400,  rarity: "legendary" },
  { id: "all_modes",        title: "Todoterreno",               description: "Gana en todos los modos de juego.",              icon: "grid",             iconColor: "#9B59B6", target: 6,    coinsReward: 150,  xpReward: 400,  rarity: "legendary" },
  { id: "practice_grad",    title: "Graduado",                  description: "Completa 10 partidas de Práctica.",              icon: "school",           iconColor: "#1A8FC1", target: 10,   coinsReward: 25,   xpReward: 60,   rarity: "common" },
  // ─── Special cards ───────────────────────────────────────────────
  { id: "eight_wizard",     title: "Mago del 8",                description: "Gana una partida con un 8 Loco.",                icon: "diamond",          iconColor: "#1A8FC1", target: 1,    coinsReward: 25,   xpReward: 60,   rarity: "rare" },
  { id: "eight_10",         title: "Locomoción",                description: "Juega 10 ochos locos en total.",                 icon: "infinite",         iconColor: "#9B59B6", target: 10,   coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "eight_50",         title: "Maestro del Ocho",          description: "Juega 50 ochos locos en total.",                 icon: "infinite",         iconColor: "#A855F7", target: 50,   coinsReward: 150,  xpReward: 350,  rarity: "epic" },
  { id: "joker_hero",       title: "El Comodín",                description: "Juega 20 comodines en total.",                   icon: "star",             iconColor: "#FF6B00", target: 20,   coinsReward: 60,   xpReward: 150,  rarity: "rare" },
  { id: "joker_final",      title: "El Comodín Final",          description: "Gana una partida con un Comodín.",               icon: "star",             iconColor: "#A855F7", target: 1,    coinsReward: 80,   xpReward: 200,  rarity: "epic", hidden: true },
  { id: "chain_two",        title: "Cadena del 2",              description: "Acumula 6+ cartas con el 2.",                    icon: "link",             iconColor: "#E74C3C", target: 1,    coinsReward: 35,   xpReward: 90,   rarity: "rare" },
  { id: "chain_seven",      title: "Tormenta del 7",            description: "Acumula 6+ cartas con el 7.",                    icon: "thunderstorm",     iconColor: "#FF6B00", target: 1,    coinsReward: 35,   xpReward: 90,   rarity: "rare" },
  { id: "j_master",         title: "Maestro de la J",           description: "Juega 15 Jotas en total.",                       icon: "repeat",           iconColor: "#27AE60", target: 15,   coinsReward: 45,   xpReward: 110,  rarity: "rare" },
  { id: "reverse_master",   title: "Maestro del Reverso",       description: "Juega 20 cartas 10 en total.",                   icon: "swap-horizontal",  iconColor: "#1A8FC1", target: 20,   coinsReward: 50,   xpReward: 120,  rarity: "rare" },
  { id: "triple_play",      title: "Triple Jugada",             description: "Juega 3 cartas especiales seguidas.",            icon: "layers",           iconColor: "#D4AF37", target: 1,    coinsReward: 40,   xpReward: 100,  rarity: "epic", hidden: true },
  // ─── Hand quality ─────────────────────────────────────────────────
  { id: "perfect_hand",     title: "Mano Perfecta",             description: "Gana sin robar ninguna carta.",                  icon: "sparkles",         iconColor: "#FFD700", target: 1,    coinsReward: 60,   xpReward: 150,  rarity: "epic" },
  { id: "comeback_king",    title: "Rey del Comeback",          description: "Gana con 10+ cartas en mano.",                   icon: "arrow-up-circle",  iconColor: "#E74C3C", target: 1,    coinsReward: 50,   xpReward: 130,  rarity: "epic" },
  { id: "speed_demon",      title: "Demonio Veloz",             description: "Gana en Relámpago en menos de 2 minutos.",       icon: "speedometer",      iconColor: "#E74C3C", target: 1,    coinsReward: 35,   xpReward: 90,   rarity: "rare" },
  { id: "speed_30s",        title: "Relámpago Puro",            description: "Gana una partida en menos de 30 segundos.",      icon: "flash",            iconColor: "#FFD700", target: 1,    coinsReward: 150,  xpReward: 400,  rarity: "legendary", hidden: true },
  { id: "marathon_man",     title: "Maratonista",               description: "Juega una partida de más de 10 minutos.",        icon: "time",             iconColor: "#95A5A6", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "flawless_expert",  title: "Experto Impecable",         description: "Gana en Experto sin robar ninguna carta.",       icon: "shield-checkmark", iconColor: "#D4AF37", target: 1,    coinsReward: 200,  xpReward: 500,  rarity: "legendary", hidden: true },
  { id: "no_special_win",   title: "Sin Poderes",               description: "Gana sin jugar ninguna carta especial.",         icon: "close-circle",     iconColor: "#9B59B6", target: 1,    coinsReward: 100,  xpReward: 250,  rarity: "epic", hidden: true },
  // ─── Coins ────────────────────────────────────────────────────────
  { id: "collector_50",     title: "Ahorrador",                 description: "Acumula 50 monedas.",                            icon: "cash",             iconColor: "#F1C40F", target: 50,   coinsReward: 10,   xpReward: 30,   rarity: "common" },
  { id: "collector_500",    title: "Rico Rico",                 description: "Acumula 500 monedas.",                           icon: "wallet",           iconColor: "#D4AF37", target: 500,  coinsReward: 50,   xpReward: 150,  rarity: "epic" },
  { id: "collector_1000",   title: "Millonario de Cartas",      description: "Acumula 1000 monedas.",                          icon: "diamond",          iconColor: "#A855F7", target: 1000, coinsReward: 150,  xpReward: 400,  rarity: "legendary" },
  { id: "spender",          title: "Comprador",                 description: "Compra 3 artículos en la tienda.",               icon: "bag",              iconColor: "#E74C3C", target: 3,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "big_spender",      title: "Gran Comprador",            description: "Gasta 500 monedas en total.",                    icon: "bag-add",          iconColor: "#D4AF37", target: 500,  coinsReward: 60,   xpReward: 150,  rarity: "rare" },
  // ─── Streaks ──────────────────────────────────────────────────────
  { id: "daily_streak_3",   title: "Constante",                 description: "Juega 3 días seguidos.",                         icon: "calendar",         iconColor: "#1A8FC1", target: 3,    coinsReward: 25,   xpReward: 60,   rarity: "common" },
  { id: "daily_streak_7",   title: "Adicto al Juego",           description: "Juega 7 días seguidos.",                         icon: "flame",            iconColor: "#E67E22", target: 7,    coinsReward: 70,   xpReward: 180,  rarity: "rare" },
  { id: "daily_streak_14",  title: "Fanático",                  description: "Juega 14 días seguidos.",                        icon: "flame",            iconColor: "#E74C3C", target: 14,   coinsReward: 150,  xpReward: 400,  rarity: "epic" },
  { id: "daily_streak_30",  title: "Obsesionado",               description: "Juega 30 días seguidos.",                        icon: "infinite",         iconColor: "#A855F7", target: 30,   coinsReward: 500,  xpReward: 1500, rarity: "legendary" },
  { id: "daily_streak_60",  title: "Adicto Total",              description: "Juega 60 días seguidos.",                        icon: "trophy",           iconColor: "#FF4400", target: 60,   coinsReward: 1000, xpReward: 3000, rarity: "legendary" },
  // ─── Store & Collection ───────────────────────────────────────────
  { id: "first_purchase",   title: "Primera Compra",            description: "Compra tu primer artículo en la tienda.",        icon: "bag-check",        iconColor: "#27AE60", target: 1,    coinsReward: 15,   xpReward: 40,   rarity: "common" },
  { id: "collector_items5", title: "Coleccionista",             description: "Posee 5 artículos de la tienda.",                icon: "albums",           iconColor: "#9B59B6", target: 5,    coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "collector_items10",title: "Gran Coleccionista",        description: "Posee 10 artículos de la tienda.",               icon: "library",          iconColor: "#D4AF37", target: 10,   coinsReward: 100,  xpReward: 250,  rarity: "epic" },
  { id: "collector_items20",title: "Connoisseur",               description: "Posee 20 artículos de la tienda.",               icon: "diamond",          iconColor: "#E74C3C", target: 20,   coinsReward: 200,  xpReward: 500,  rarity: "epic" },
  { id: "collector_items30",title: "Maestro Coleccionista",     description: "Posee 30 artículos de la tienda.",               icon: "star",             iconColor: "#A855F7", target: 30,   coinsReward: 400,  xpReward: 1000, rarity: "legendary" },
  { id: "fashion",          title: "A la Moda",                 description: "Equipa un dorso y avatar legendarios.",          icon: "color-palette",    iconColor: "#A855F7", target: 1,    coinsReward: 80,   xpReward: 200,  rarity: "epic" },
  { id: "effect_equipped",  title: "Efectista",                 description: "Equipa un efecto visual en tu perfil.",          icon: "sparkles",         iconColor: "#D4AF37", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "frame_equipped",   title: "Enmarcado",                 description: "Equipa un marco en tu avatar.",                  icon: "ellipse",          iconColor: "#C0C0C0", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "title_equipped",   title: "Con Identidad",             description: "Equipa un título en tu perfil.",                 icon: "ribbon",           iconColor: "#2196F3", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  // ─── Difficulty ───────────────────────────────────────────────────
  { id: "hard_win",         title: "Gladiador",                 description: "Gana una partida en dificultad Difícil.",        icon: "shield",           iconColor: "#E74C3C", target: 1,    coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "expert_win",       title: "Experto Real",              description: "Gana una partida en modo Experto.",              icon: "timer",            iconColor: "#FF0000", target: 1,    coinsReward: 100,  xpReward: 300,  rarity: "epic" },
  { id: "expert_10",        title: "Maestro del Tiempo",        description: "Gana 10 partidas en modo Experto.",              icon: "timer",            iconColor: "#FF4400", target: 10,   coinsReward: 300,  xpReward: 800,  rarity: "legendary" },
  { id: "expert_timeout_survive", title: "Sangre Fría",        description: "Juega con menos de 2 segundos en experto sin perder.", icon: "timer",      iconColor: "#A855F7", target: 1,    coinsReward: 80,   xpReward: 200,  rarity: "epic", hidden: true },
  { id: "no_draw_win",      title: "Sin Piedad",                description: "Gana sin que el CPU robe una carta.",            icon: "close-circle",     iconColor: "#27AE60", target: 1,    coinsReward: 45,   xpReward: 110,  rarity: "rare", hidden: true },
  { id: "draw_5",           title: "Generoso",                  description: "Haz robar 5+ cartas al CPU en 1 partida.",       icon: "layers",           iconColor: "#E67E22", target: 5,    coinsReward: 30,   xpReward: 75,   rarity: "rare" },
  { id: "draw_10",          title: "Muy Generoso",              description: "Haz robar 10+ cartas al CPU en 1 partida.",      icon: "layers",           iconColor: "#C0392B", target: 10,   coinsReward: 60,   xpReward: 150,  rarity: "epic" },
  // ─── Social / Fun ─────────────────────────────────────────────────
  { id: "bad_luck",         title: "Mala Suerte",               description: "Roba 5+ cartas de más en 1 partida.",            icon: "sad",              iconColor: "#95A5A6", target: 1,    coinsReward: 10,   xpReward: 20,   rarity: "common", hidden: true },
  { id: "lucky_draw",       title: "Golpe de Suerte",           description: "Roba y juega 3 cartas seguidas.",                icon: "happy",            iconColor: "#27AE60", target: 1,    coinsReward: 25,   xpReward: 60,   rarity: "rare", hidden: true },
  { id: "domination",       title: "Dominación Total",          description: "Gana en Difícil sin robar ninguna carta.",       icon: "flash",            iconColor: "#D4AF37", target: 1,    coinsReward: 120,  xpReward: 350,  rarity: "legendary", hidden: true },
  { id: "underdog",         title: "El Perro del Sota",         description: "Gana con 13+ cartas en mano.",                   icon: "arrow-up",         iconColor: "#E74C3C", target: 1,    coinsReward: 80,   xpReward: 200,  rarity: "epic", hidden: true },
  { id: "marathon_session", title: "Maratón Total",             description: "Juega 10 partidas en un día.",                   icon: "fitness",          iconColor: "#27AE60", target: 10,   coinsReward: 50,   xpReward: 120,  rarity: "rare" },
  // ─── Multiplayer ──────────────────────────────────────────────────
  { id: "first_multi_win",  title: "Victoria en Mesa",          description: "Gana una partida de multijugador local.",        icon: "people",           iconColor: "#27AE60", target: 1,    coinsReward: 40,   xpReward: 100,  rarity: "common" },
  { id: "online_winner",    title: "Campeón Online",            description: "Gana una partida en modo online.",               icon: "globe",            iconColor: "#4A90E2", target: 1,    coinsReward: 60,   xpReward: 150,  rarity: "rare" },
  { id: "multi_sessions_5", title: "Social",                    description: "Juega 5 partidas multijugador.",                 icon: "chatbubbles",      iconColor: "#1A8FC1", target: 5,    coinsReward: 30,   xpReward: 80,   rarity: "common" },
  { id: "multi_sessions_20",title: "Muy Social",                description: "Juega 20 partidas multijugador.",                icon: "people-circle",    iconColor: "#9B59B6", target: 20,   coinsReward: 100,  xpReward: 250,  rarity: "epic" },
  // ─── XP / Level milestones ────────────────────────────────────────
  { id: "xp_1000",          title: "Subida de Nivel",           description: "Gana 1000 XP en total.",                        icon: "star",             iconColor: "#D4AF37", target: 1000,  coinsReward: 30,  xpReward: 0,    rarity: "common" },
  { id: "xp_10000",         title: "Veterano de XP",            description: "Gana 10000 XP en total.",                       icon: "star",             iconColor: "#D4AF37", target: 10000, coinsReward: 100, xpReward: 0,    rarity: "rare" },
  { id: "xp_50000",         title: "Maestro de la Experiencia", description: "Gana 50000 XP en total.",                       icon: "diamond",          iconColor: "#A855F7", target: 50000, coinsReward: 300, xpReward: 0,    rarity: "epic" },
  // ─── Battle Pass ──────────────────────────────────────────────────
  { id: "bp_tier_10",       title: "Pase Desbloqueado",         description: "Alcanza el nivel 10 del Pase de Batalla.",      icon: "star",             iconColor: "#1A8FC1", target: 10,   coinsReward: 50,   xpReward: 100,  rarity: "rare" },
  { id: "bp_tier_40",       title: "Pase Élite",                description: "Alcanza el nivel 40 del Pase de Batalla.",      icon: "medal",            iconColor: "#D4AF37", target: 40,   coinsReward: 200,  xpReward: 500,  rarity: "epic" },
  { id: "bp_tier_80",       title: "Pase Legendario",           description: "Alcanza el nivel 80 del Pase de Batalla.",      icon: "trophy",           iconColor: "#A855F7", target: 80,   coinsReward: 1000, xpReward: 2000, rarity: "legendary" },
  // ─── Cards played stats ───────────────────────────────────────────
  { id: "cards_played_100", title: "Baraja Activa",             description: "Juega 100 cartas en total.",                    icon: "albums",           iconColor: "#95A5A6", target: 100,  coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "cards_played_500", title: "La Baraja Infinita",        description: "Juega 500 cartas en total.",                    icon: "infinite",         iconColor: "#2196F3", target: 500,  coinsReward: 60,   xpReward: 150,  rarity: "rare" },
  { id: "cards_played_1000",title: "Maestro Baraja",            description: "Juega 1000 cartas en total.",                   icon: "layers",           iconColor: "#D4AF37", target: 1000, coinsReward: 150,  xpReward: 400,  rarity: "epic" },
  // ─── Win streaks ──────────────────────────────────────────────────
  { id: "win_3_streak",     title: "Racha Caliente",            description: "Gana 3 partidas seguidas.",                     icon: "flame",            iconColor: "#E67E22", target: 3,    coinsReward: 30,   xpReward: 75,   rarity: "common" },
  { id: "win_5_streak",     title: "Imparable",                 description: "Gana 5 partidas seguidas.",                     icon: "flash",            iconColor: "#E74C3C", target: 5,    coinsReward: 80,   xpReward: 200,  rarity: "rare" },
  { id: "win_10_streak",    title: "Invicto",                   description: "Gana 10 partidas seguidas.",                    icon: "trophy",           iconColor: "#D4AF37", target: 10,   coinsReward: 200,  xpReward: 500,  rarity: "legendary", hidden: true },
  // ─── Multiplayer Expansion ───────────────────────────────────────
  { id: "multi_win_5",      title: "Dominio Local",             description: "Gana 5 partidas multijugador local.",           icon: "people",           iconColor: "#2196F3", target: 5,    coinsReward: 50,   xpReward: 150,  rarity: "rare" },
  { id: "multi_win_10",     title: "Rey de la Mesa",            description: "Gana 10 partidas multijugador local.",          icon: "ribbon",           iconColor: "#9B59B6", target: 10,   coinsReward: 100,  xpReward: 300,  rarity: "epic" },
  { id: "online_win_5",     title: "Pro Online",                description: "Gana 5 partidas online.",                        icon: "globe",            iconColor: "#E74C3C", target: 5,    coinsReward: 80,   xpReward: 200,  rarity: "rare" },
  { id: "online_win_10",    title: "Leyenda de la Red",         description: "Gana 10 partidas online.",                       icon: "diamond",          iconColor: "#A855F7", target: 10,   coinsReward: 200,  xpReward: 500,  rarity: "legendary" },
  // ─── Language & Themes ──────────────────────────────────────────
  { id: "portuguese_player",title: "Tudo Bem!",                 description: "Juega en Portugués.",                            icon: "language",         iconColor: "#27AE60", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "polyglot",         title: "Políglota",                 description: "Cambia el idioma 5 veces.",                      icon: "repeat",           iconColor: "#1A8FC1", target: 5,    coinsReward: 30,   xpReward: 80,   rarity: "rare" },
  { id: "theme_changer",    title: "Decorador",                 description: "Cambia el tema visual.",                         icon: "color-palette",    iconColor: "#9B59B6", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "dark_side",        title: "Lado Oscuro",               description: "Juega 10 partidas en modo oscuro.",              icon: "moon",             iconColor: "#4A90E2", target: 10,   coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "light_bringer",    title: "Portador de Luz",           description: "Juega 10 partidas en modo claro.",               icon: "sunny",            iconColor: "#FFD700", target: 10,   coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  // ─── Store & Collection expansion ───────────────────────────────
  { id: "collector_items50",title: "Magnate de la Tienda",      description: "Posee 50 artículos de la tienda.",                icon: "cart",             iconColor: "#D4AF37", target: 50,   coinsReward: 600,  xpReward: 1500, rarity: "epic" },
  { id: "collector_items70",title: "Colección Completa",        description: "Posee 70 artículos de la tienda.",                icon: "trophy",           iconColor: "#A855F7", target: 70,   coinsReward: 1500, xpReward: 4000, rarity: "legendary" },
  { id: "avatar_collector", title: "Mil Caras",                 description: "Posee 20 avatares diferentes.",                   icon: "person-circle",    iconColor: "#1A8FC1", target: 20,   coinsReward: 100,  xpReward: 250,  rarity: "rare" },
  { id: "frame_collector",  title: "Enmarcador Pro",            description: "Posee 15 marcos diferentes.",                     icon: "square",           iconColor: "#9B59B6", target: 15,   coinsReward: 80,   xpReward: 200,  rarity: "rare" },
  // ─── Gameplay Specifics ──────────────────────────────────────────
  { id: "fast_draw",        title: "Mano Rápida",               description: "Roba una carta en menos de 1 segundo.",          icon: "flash",            iconColor: "#FF6B00", target: 1,    coinsReward: 15,   xpReward: 40,   rarity: "common" },
  { id: "no_thinking",      title: "Pura Intuición",            description: "Gana una partida sin usar sugerencias.",         icon: "bulb",             iconColor: "#27AE60", target: 1,    coinsReward: 50,   xpReward: 120,  rarity: "rare" },
  { id: "strategic_win",    title: "Estratega",                 description: "Guarda una carta especial para el final y gana.", icon: "star",             iconColor: "#D4AF37", target: 1,    coinsReward: 60,   xpReward: 150,  rarity: "epic" },
  { id: "wild_frenzy",      title: "Frenesí Loco",              description: "Juega 3 ochos locos en una sola partida.",        icon: "infinite",         iconColor: "#A855F7", target: 1,    coinsReward: 45,   xpReward: 110,  rarity: "epic" },
  { id: "j_spam",           title: "Bloqueador",                description: "Juega 5 Jotas en una sola partida.",              icon: "hand-left",        iconColor: "#E74C3C", target: 1,    coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "seven_trap",       title: "Trampa del 7",              description: "Haz que un oponente robe 10 cartas seguidas.",   icon: "layers",           iconColor: "#FF4400", target: 1,    coinsReward: 100,  xpReward: 250,  rarity: "legendary", hidden: true },
  { id: "draw_20_total",    title: "Aspiradora de Cartas",      description: "Roba 20 cartas en una sola partida.",            icon: "nuclear",          iconColor: "#95A5A6", target: 1,    coinsReward: 30,   xpReward: 70,   rarity: "rare", hidden: true },
  { id: "win_with_one_card_left", title: "Al Límite",           description: "Gana cuando el CPU solo tiene 1 carta.",         icon: "alert-circle",     iconColor: "#E67E22", target: 1,    coinsReward: 35,   xpReward: 90,   rarity: "rare" },
  { id: "epic_comeback",    title: "Remontada Legendaria",      description: "Gana después de tener 15+ cartas más que el rival.", icon: "trending-up",      iconColor: "#A855F7", target: 1,    coinsReward: 150,  xpReward: 400,  rarity: "legendary" },
  // ─── Level & XP expansion ───────────────────────────────────────
  { id: "level_50",         title: "Veterano de Oro",           description: "Alcanza el nivel 50.",                           icon: "shield",           iconColor: "#D4AF37", target: 50,   coinsReward: 500,  xpReward: 0,    rarity: "epic" },
  { id: "level_100",        title: "Maestro Supremo",           description: "Alcanza el nivel 100.",                          icon: "trophy",           iconColor: "#A855F7", target: 100,  coinsReward: 2000, xpReward: 0,    rarity: "legendary" },
  { id: "xp_100000",        title: "Acumulador de Saber",       description: "Gana 100000 XP en total.",                      icon: "star",             iconColor: "#FFD700", target: 100000, coinsReward: 1000, xpReward: 0,   rarity: "legendary" },
  // ─── Social & Others ────────────────────────────────────────────
  { id: "emote_master",     title: "Expresivo",                 description: "Usa 50 emotes en partidas.",                     icon: "happy",            iconColor: "#F1C40F", target: 50,   coinsReward: 40,   xpReward: 100,  rarity: "common" },
  { id: "silent_player",    title: "Silencioso",                description: "Gana 5 partidas sin usar emotes.",               icon: "volume-mute",      iconColor: "#95A5A6", target: 5,    coinsReward: 30,   xpReward: 80,   rarity: "rare" },
  { id: "sound_lover",      title: "Melómano",                  description: "Escucha música por más de 30 minutos.",          icon: "musical-notes",    iconColor: "#FF4400", target: 1,    coinsReward: 25,   xpReward: 60,   rarity: "common" },
  { id: "session_30m",      title: "Sesión Intensa",            description: "Juega por 30 minutos seguidos.",                 icon: "time",             iconColor: "#1A8FC1", target: 1,    coinsReward: 40,   xpReward: 100,  rarity: "rare" },
  { id: "session_1h",       title: "Maratón Real",              description: "Juega por 1 hora seguida.",                      icon: "stopwatch",        iconColor: "#E74C3C", target: 1,    coinsReward: 100,  xpReward: 250,  rarity: "epic" },
  { id: "early_bird",       title: "Madrugador",                description: "Gana una partida antes de las 8 AM.",            icon: "sunny",            iconColor: "#FFD700", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "night_owl",        title: "Búho Nocturno",             description: "Gana una partida después de la medianoche.",     icon: "moon",             iconColor: "#4A90E2", target: 1,    coinsReward: 20,   xpReward: 50,   rarity: "common" },
  { id: "weekend_warrior",  title: "Guerrero del Finde",        description: "Gana 10 partidas en un solo fin de semana.",      icon: "calendar",         iconColor: "#E67E22", target: 10,   coinsReward: 70,   xpReward: 180,  rarity: "rare" },
  { id: "lucky_seven",      title: "Siete de la Suerte",        description: "Juega un 7 para ganar la partida.",              icon: "star",             iconColor: "#FFD700", target: 1,    coinsReward: 50,   xpReward: 120,  rarity: "rare", hidden: true },
  { id: "crazy_eights_5",   title: "Locura de Ochos",           description: "Juega 5 ochos en una partida.",                  icon: "infinite",         iconColor: "#A855F7", target: 1,    coinsReward: 100,  xpReward: 250,  rarity: "epic" },
  { id: "joker_madness",    title: "Caos del Comodín",          description: "Gana una partida donde se jugaron 4 comodines.", icon: "star-half",        iconColor: "#FF6B00", target: 1,    coinsReward: 80,   xpReward: 200,  rarity: "epic" },
  // ─── Expert Expansion ───────────────────────────────────────────
  { id: "expert_god",       title: "Dios del Tiempo",           description: "Gana 50 partidas en modo Experto.",              icon: "timer",            iconColor: "#000000", target: 50,   coinsReward: 2000, xpReward: 5000, rarity: "legendary" },
  // ── Expansion Block (114 → 300) ──────────────────────────────────────────
  // Win milestones+
  { id: "win_10",           title: "En Racha",                   description: "Gana 10 partidas.",                              icon: "trending-up",      iconColor: "#27AE60", target: 10,    coinsReward: 35,   xpReward: 90,    rarity: "common" },
  { id: "win_50",           title: "Veterano",                   description: "Gana 50 partidas.",                              icon: "ribbon",           iconColor: "#1A8FC1", target: 50,    coinsReward: 120,  xpReward: 300,   rarity: "rare" },
  { id: "win_1000",         title: "Mil Victorias",              description: "Gana 1000 partidas.",                            icon: "trophy",           iconColor: "#FF4400", target: 1000,  coinsReward: 1500, xpReward: 4000,  rarity: "legendary" },
  { id: "win_2500",         title: "Leyenda de las Cartas",      description: "Gana 2500 partidas.",                            icon: "diamond",          iconColor: "#A855F7", target: 2500,  coinsReward: 3000, xpReward: 8000,  rarity: "legendary" },
  { id: "win_5000",         title: "Inmortal de la Mesa",        description: "Gana 5000 partidas.",                            icon: "infinite",         iconColor: "#D4AF37", target: 5000,  coinsReward: 5000, xpReward: 15000, rarity: "legendary" },
  // Games played milestones
  { id: "games_10",         title: "Practicante",                description: "Juega 10 partidas.",                             icon: "game-controller",  iconColor: "#95A5A6", target: 10,    coinsReward: 10,   xpReward: 25,    rarity: "common" },
  { id: "games_25",         title: "Aficionado",                 description: "Juega 25 partidas.",                             icon: "game-controller",  iconColor: "#1A8FC1", target: 25,    coinsReward: 20,   xpReward: 50,    rarity: "common" },
  { id: "games_50",         title: "Habitual",                   description: "Juega 50 partidas.",                             icon: "game-controller",  iconColor: "#27AE60", target: 50,    coinsReward: 40,   xpReward: 100,   rarity: "common" },
  { id: "games_100",        title: "Dedicado",                   description: "Juega 100 partidas.",                            icon: "game-controller",  iconColor: "#D4AF37", target: 100,   coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "games_500",        title: "Obsesionado con el Juego",   description: "Juega 500 partidas.",                            icon: "game-controller",  iconColor: "#9B59B6", target: 500,   coinsReward: 250,  xpReward: 600,   rarity: "epic" },
  { id: "games_1000",       title: "Dios del Mazo",              description: "Juega 1000 partidas.",                           icon: "game-controller",  iconColor: "#A855F7", target: 1000,  coinsReward: 600,  xpReward: 1500,  rarity: "legendary" },
  // Mode-specific expansion
  { id: "lightning_3",      title: "Buen Comienzo Relámpago",    description: "Gana 3 partidas en modo Relámpago.",             icon: "flash",            iconColor: "#FFD700", target: 3,     coinsReward: 20,   xpReward: 50,    rarity: "common" },
  { id: "lightning_10",     title: "Señor del Relámpago",        description: "Gana 10 partidas en modo Relámpago.",            icon: "flash",            iconColor: "#E74C3C", target: 10,    coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "lightning_25",     title: "Rayo Imparable",             description: "Gana 25 partidas en modo Relámpago.",            icon: "flash",            iconColor: "#A855F7", target: 25,    coinsReward: 150,  xpReward: 400,   rarity: "epic" },
  { id: "tournament_3",     title: "Tres Torneos",               description: "Gana 3 torneos.",                                icon: "medal",            iconColor: "#D4AF37", target: 3,     coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "tournament_10",    title: "Campeón Consistente",        description: "Gana 10 torneos.",                               icon: "medal",            iconColor: "#E67E22", target: 10,    coinsReward: 200,  xpReward: 600,   rarity: "epic" },
  { id: "tournament_25",    title: "Leyenda del Torneo",         description: "Gana 25 torneos.",                               icon: "trophy",           iconColor: "#A855F7", target: 25,    coinsReward: 600,  xpReward: 1500,  rarity: "legendary" },
  { id: "coop_3",           title: "Equipo Unido",               description: "Gana 3 partidas en modo Cooperativo.",           icon: "people",           iconColor: "#27AE60", target: 3,     coinsReward: 30,   xpReward: 75,    rarity: "common" },
  { id: "coop_15",          title: "Cooperador Veterano",        description: "Gana 15 partidas en modo Cooperativo.",          icon: "people",           iconColor: "#1A8FC1", target: 15,    coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "coop_30",          title: "Maestro del Equipo",         description: "Gana 30 partidas en modo Cooperativo.",          icon: "people",           iconColor: "#D4AF37", target: 30,    coinsReward: 300,  xpReward: 800,   rarity: "epic" },
  { id: "challenge_1",      title: "El Primer Desafío",          description: "Completa 1 desafío.",                            icon: "checkbox",         iconColor: "#27AE60", target: 1,     coinsReward: 15,   xpReward: 40,    rarity: "common" },
  { id: "challenge_5",      title: "Desafiante en Serio",        description: "Completa 5 desafíos.",                           icon: "checkbox",         iconColor: "#E67E22", target: 5,     coinsReward: 50,   xpReward: 130,   rarity: "rare" },
  { id: "challenge_25",     title: "Cazador de Desafíos",        description: "Completa 25 desafíos.",                          icon: "checkbox",         iconColor: "#9B59B6", target: 25,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "challenge_100",    title: "Rey de los Desafíos",        description: "Completa 100 desafíos.",                         icon: "trophy",           iconColor: "#D4AF37", target: 100,   coinsReward: 800,  xpReward: 2000,  rarity: "legendary" },
  { id: "practice_25",      title: "Constante Practicante",      description: "Completa 25 partidas de Práctica.",              icon: "school",           iconColor: "#2196F3", target: 25,    coinsReward: 40,   xpReward: 100,   rarity: "common" },
  { id: "practice_50",      title: "Eterno Estudiante",          description: "Completa 50 partidas de Práctica.",              icon: "school",           iconColor: "#9B59B6", target: 50,    coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "practice_100",     title: "Maestro del Entrenamiento",  description: "Completa 100 partidas de Práctica.",             icon: "school",           iconColor: "#D4AF37", target: 100,   coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  // Special cards expansion
  { id: "eight_25",         title: "Cazador de Ochos",           description: "Juega 25 ochos locos en total.",                 icon: "infinite",         iconColor: "#1A8FC1", target: 25,    coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "eight_100",        title: "Experto del Ocho",           description: "Juega 100 ochos locos en total.",                icon: "infinite",         iconColor: "#E74C3C", target: 100,   coinsReward: 250,  xpReward: 600,   rarity: "epic" },
  { id: "eight_200",        title: "Adicto al Ocho",             description: "Juega 200 ochos locos en total.",                icon: "infinite",         iconColor: "#D4AF37", target: 200,   coinsReward: 600,  xpReward: 1500,  rarity: "legendary" },
  { id: "joker_5",          title: "Comodín Iniciado",           description: "Juega 5 comodines en total.",                    icon: "star",             iconColor: "#FFD700", target: 5,     coinsReward: 20,   xpReward: 50,    rarity: "common" },
  { id: "joker_30",         title: "Mago del Comodín",           description: "Juega 30 comodines en total.",                   icon: "star",             iconColor: "#E67E22", target: 30,    coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "joker_100",        title: "El Joker Supremo",           description: "Juega 100 comodines en total.",                  icon: "star",             iconColor: "#A855F7", target: 100,   coinsReward: 400,  xpReward: 1000,  rarity: "legendary" },
  { id: "j_game_5",         title: "Bloqueador Élite",           description: "Juega 5 Jotas en una sola partida.",             icon: "hand-left",        iconColor: "#27AE60", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "ace_block",        title: "As Bloqueador",              description: "Usa un As para bloquear una cadena de robos.",   icon: "shield",           iconColor: "#1A8FC1", target: 1,     coinsReward: 30,   xpReward: 75,    rarity: "rare", hidden: true },
  // Hand quality expansion
  { id: "perfect_hand_3",   title: "Perfección x3",              description: "Gana sin robar cartas 3 veces.",                 icon: "sparkles",         iconColor: "#1A8FC1", target: 3,     coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "perfect_hand_10",  title: "Perfección x10",             description: "Gana sin robar cartas 10 veces.",                icon: "sparkles",         iconColor: "#D4AF37", target: 10,    coinsReward: 400,  xpReward: 1000,  rarity: "legendary" },
  { id: "comeback_3",       title: "Regresa Siempre",            description: "Gana con 10+ cartas en mano 3 veces.",           icon: "arrow-up-circle",  iconColor: "#27AE60", target: 3,     coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "comeback_10",      title: "El Rey del Regreso",         description: "Gana con 10+ cartas en mano 10 veces.",          icon: "arrow-up-circle",  iconColor: "#D4AF37", target: 10,    coinsReward: 300,  xpReward: 800,   rarity: "legendary" },
  { id: "speed_1m",         title: "Un Minuto Exacto",           description: "Gana una partida en menos de 1 minuto.",         icon: "speedometer",      iconColor: "#FFD700", target: 1,     coinsReward: 80,   xpReward: 200,   rarity: "epic", hidden: true },
  { id: "no_special_5",     title: "Sin Poderes x5",             description: "Gana sin cartas especiales 5 veces.",            icon: "close-circle",     iconColor: "#D4AF37", target: 5,     coinsReward: 250,  xpReward: 600,   rarity: "legendary" },
  { id: "marathon_15m",     title: "Maratonista Serio",          description: "Juega una partida de más de 15 minutos.",        icon: "time",             iconColor: "#9B59B6", target: 1,     coinsReward: 30,   xpReward: 75,    rarity: "rare" },
  { id: "marathon_25m",     title: "Resistencia Total",          description: "Juega una partida de más de 25 minutos.",        icon: "time",             iconColor: "#A855F7", target: 1,     coinsReward: 80,   xpReward: 200,   rarity: "epic" },
  // Coins expansion
  { id: "collector_2000",   title: "Banquero",                   description: "Acumula 2000 monedas.",                          icon: "wallet",           iconColor: "#27AE60", target: 2000,  coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "collector_5000",   title: "Empresario",                 description: "Acumula 5000 monedas.",                          icon: "wallet",           iconColor: "#E67E22", target: 5000,  coinsReward: 300,  xpReward: 750,   rarity: "epic" },
  { id: "collector_10000",  title: "Magnate",                    description: "Acumula 10000 monedas.",                         icon: "diamond",          iconColor: "#D4AF37", target: 10000, coinsReward: 800,  xpReward: 2000,  rarity: "legendary" },
  { id: "big_spender_1000", title: "Derrochador",                description: "Gasta 1000 monedas en total.",                   icon: "bag-add",          iconColor: "#9B59B6", target: 1000,  coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "big_spender_5000", title: "Magnate Gastador",           description: "Gasta 5000 monedas en total.",                   icon: "bag",              iconColor: "#A855F7", target: 5000,  coinsReward: 300,  xpReward: 800,   rarity: "epic" },
  // Streaks expansion
  { id: "daily_streak_90",  title: "Tres Meses Firme",           description: "Juega 90 días seguidos.",                        icon: "trophy",           iconColor: "#E74C3C", target: 90,    coinsReward: 1500, xpReward: 4000,  rarity: "legendary" },
  { id: "daily_streak_180", title: "Medio Año Imparable",        description: "Juega 180 días seguidos.",                       icon: "infinite",         iconColor: "#D4AF37", target: 180,   coinsReward: 3000, xpReward: 8000,  rarity: "legendary" },
  { id: "daily_streak_365", title: "Un Año de Gloria",           description: "Juega 365 días seguidos.",                       icon: "diamond",          iconColor: "#FFD700", target: 365,   coinsReward: 5000, xpReward: 15000, rarity: "legendary" },
  // Store expansion
  { id: "collector_items90",title: "Colección Total",            description: "Posee 90 artículos de la tienda.",                icon: "trophy",           iconColor: "#D4AF37", target: 90,    coinsReward: 2500, xpReward: 6000,  rarity: "legendary" },
  { id: "avatar_collector_30",title:"Avatar Fanático",           description: "Posee 30 avatares diferentes.",                   icon: "person-circle",    iconColor: "#E74C3C", target: 30,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "frame_collector_25",title:"Enmarcador Élite",           description: "Posee 25 marcos diferentes.",                     icon: "square",           iconColor: "#A855F7", target: 25,    coinsReward: 150,  xpReward: 400,   rarity: "epic" },
  { id: "title_collector_10",title:"Títulos al Poder",           description: "Posee 10 títulos diferentes.",                    icon: "ribbon",           iconColor: "#D4AF37", target: 10,    coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "effect_collector", title: "Efecto Master",              description: "Posee 10 efectos visuales distintos.",            icon: "sparkles",         iconColor: "#A855F7", target: 10,    coinsReward: 150,  xpReward: 400,   rarity: "rare" },
  { id: "store_addict",     title: "Adicto a la Tienda",         description: "Compra 50 artículos en la tienda.",               icon: "cart",             iconColor: "#E74C3C", target: 50,    coinsReward: 500,  xpReward: 1200,  rarity: "epic" },
  // Difficulty expansion
  { id: "hard_win_5",       title: "Gladiador Veterano",         description: "Gana 5 partidas en dificultad Difícil.",         icon: "shield",           iconColor: "#9B59B6", target: 5,     coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "hard_win_25",      title: "Maestro Difícil",            description: "Gana 25 partidas en dificultad Difícil.",        icon: "shield",           iconColor: "#D4AF37", target: 25,    coinsReward: 400,  xpReward: 1000,  rarity: "epic" },
  { id: "expert_25",        title: "Experto Veterano",           description: "Gana 25 partidas en modo Experto.",              icon: "timer",            iconColor: "#E67E22", target: 25,    coinsReward: 600,  xpReward: 1500,  rarity: "legendary" },
  { id: "expert_50",        title: "Maestro Experto",            description: "Gana 50 partidas en modo Experto.",              icon: "timer",            iconColor: "#E74C3C", target: 50,    coinsReward: 1200, xpReward: 3000,  rarity: "legendary" },
  { id: "expert_100",       title: "El Gran Experto",            description: "Gana 100 partidas en modo Experto.",             icon: "timer",            iconColor: "#A855F7", target: 100,   coinsReward: 2500, xpReward: 7000,  rarity: "legendary" },
  { id: "expert_no_draw",   title: "Sin Robar en Experto",       description: "Gana en modo Experto sin robar ninguna carta.", icon: "shield-checkmark", iconColor: "#FFD700", target: 1,     coinsReward: 300,  xpReward: 800,   rarity: "legendary", hidden: true },
  // Multiplayer expansion
  { id: "multi_win_25",     title: "Veterano Local",             description: "Gana 25 partidas multijugador local.",           icon: "people",           iconColor: "#9B59B6", target: 25,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "multi_win_50",     title: "Señor de la Mesa",           description: "Gana 50 partidas multijugador local.",           icon: "ribbon",           iconColor: "#D4AF37", target: 50,    coinsReward: 500,  xpReward: 1200,  rarity: "legendary" },
  { id: "multi_win_100",    title: "Leyenda Local",              description: "Gana 100 partidas multijugador local.",          icon: "trophy",           iconColor: "#FF4400", target: 100,   coinsReward: 1200, xpReward: 3000,  rarity: "legendary" },
  { id: "online_win_25",    title: "Pro Online Veterano",        description: "Gana 25 partidas online.",                       icon: "globe",            iconColor: "#9B59B6", target: 25,    coinsReward: 300,  xpReward: 800,   rarity: "epic" },
  { id: "online_win_50",    title: "Elite Online",               description: "Gana 50 partidas online.",                       icon: "diamond",          iconColor: "#D4AF37", target: 50,    coinsReward: 700,  xpReward: 1800,  rarity: "legendary" },
  { id: "online_win_100",   title: "Leyenda de la Red",          description: "Gana 100 partidas online.",                      icon: "infinite",         iconColor: "#FFD700", target: 100,   coinsReward: 1500, xpReward: 4000,  rarity: "legendary" },
  { id: "multi_sessions_50",title: "Social Comprometido",        description: "Juega 50 partidas multijugador.",                 icon: "people-circle",    iconColor: "#E67E22", target: 50,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "multi_sessions_100",title:"Ultra Social",               description: "Juega 100 partidas multijugador.",                icon: "people-circle",    iconColor: "#A855F7", target: 100,   coinsReward: 500,  xpReward: 1200,  rarity: "legendary" },
  // XP / Level expansion
  { id: "xp_500",           title: "Primer XP",                  description: "Gana 500 XP en total.",                          icon: "star",             iconColor: "#95A5A6", target: 500,   coinsReward: 15,   xpReward: 0,     rarity: "common" },
  { id: "xp_5000",          title: "Subiendo Fuerte",            description: "Gana 5000 XP en total.",                         icon: "star",             iconColor: "#1A8FC1", target: 5000,  coinsReward: 60,   xpReward: 0,     rarity: "common" },
  { id: "xp_25000",         title: "Imparable en XP",            description: "Gana 25000 XP en total.",                        icon: "star",             iconColor: "#E67E22", target: 25000, coinsReward: 200,  xpReward: 0,     rarity: "rare" },
  { id: "xp_200000",        title: "Monstruo de XP",             description: "Gana 200000 XP en total.",                       icon: "diamond",          iconColor: "#9B59B6", target: 200000,coinsReward: 600,  xpReward: 0,     rarity: "epic" },
  { id: "xp_500000",        title: "XP Legendario",              description: "Gana 500000 XP en total.",                       icon: "diamond",          iconColor: "#D4AF37", target: 500000,coinsReward: 1500, xpReward: 0,     rarity: "legendary" },
  { id: "level_5",          title: "Nivel 5",                    description: "Alcanza el nivel 5.",                            icon: "star",             iconColor: "#95A5A6", target: 5,     coinsReward: 20,   xpReward: 0,     rarity: "common" },
  { id: "level_10",         title: "Nivel 10",                   description: "Alcanza el nivel 10.",                           icon: "star",             iconColor: "#1A8FC1", target: 10,    coinsReward: 50,   xpReward: 0,     rarity: "common" },
  { id: "level_25",         title: "Nivel 25",                   description: "Alcanza el nivel 25.",                           icon: "ribbon",           iconColor: "#27AE60", target: 25,    coinsReward: 150,  xpReward: 0,     rarity: "rare" },
  { id: "level_75",         title: "Nivel 75",                   description: "Alcanza el nivel 75.",                           icon: "trophy",           iconColor: "#E74C3C", target: 75,    coinsReward: 800,  xpReward: 0,     rarity: "epic" },
  { id: "level_99",         title: "Nivel Máximo",               description: "Alcanza el nivel 99.",                           icon: "infinite",         iconColor: "#D4AF37", target: 99,    coinsReward: 5000, xpReward: 0,     rarity: "legendary" },
  // Battle Pass expansion
  { id: "bp_tier_150",      title: "Pase de Batalla Épico",      description: "Alcanza el nivel 150 del Pase de Batalla.",     icon: "medal",            iconColor: "#9B59B6", target: 150,   coinsReward: 500,  xpReward: 1200,  rarity: "epic" },
  { id: "bp_tier_200",      title: "Pase de Batalla Legendario", description: "Alcanza el nivel 200 del Pase de Batalla.",     icon: "trophy",           iconColor: "#D4AF37", target: 200,   coinsReward: 1200, xpReward: 3000,  rarity: "legendary" },
  { id: "bp_tier_250",      title: "Pase de Batalla Supremo",    description: "Alcanza el nivel 250 del Pase de Batalla.",     icon: "diamond",          iconColor: "#FF4400", target: 250,   coinsReward: 2500, xpReward: 6000,  rarity: "legendary" },
  { id: "bp_tier_300",      title: "Pase de Batalla Divino",     description: "Alcanza el nivel 300 del Pase de Batalla.",     icon: "infinite",         iconColor: "#A855F7", target: 300,   coinsReward: 5000, xpReward: 12000, rarity: "legendary" },
  // Cards played expansion
  { id: "cards_played_2000",title: "Baraja Incansable",          description: "Juega 2000 cartas en total.",                    icon: "layers",           iconColor: "#9B59B6", target: 2000,  coinsReward: 300,  xpReward: 800,   rarity: "epic" },
  { id: "cards_played_5000",title: "La Mano que Nunca Para",     description: "Juega 5000 cartas en total.",                    icon: "infinite",         iconColor: "#D4AF37", target: 5000,  coinsReward: 600,  xpReward: 1500,  rarity: "legendary" },
  { id: "cards_played_10000",title:"Maestro Baraja Supremo",     description: "Juega 10000 cartas en total.",                   icon: "infinite",         iconColor: "#FF4400", target: 10000, coinsReward: 1500, xpReward: 4000,  rarity: "legendary" },
  { id: "cards_played_50000",title:"Dios de las Cartas",         description: "Juega 50000 cartas en total.",                   icon: "diamond",          iconColor: "#A855F7", target: 50000, coinsReward: 5000, xpReward: 12000, rarity: "legendary" },
  // Win streak expansion
  { id: "win_7_streak",     title: "Siete Seguidas",             description: "Gana 7 partidas seguidas.",                     icon: "flash",            iconColor: "#9B59B6", target: 7,     coinsReward: 120,  xpReward: 300,   rarity: "epic" },
  { id: "win_15_streak",    title: "Quince sin Perder",          description: "Gana 15 partidas seguidas.",                    icon: "trophy",           iconColor: "#D4AF37", target: 15,    coinsReward: 400,  xpReward: 1000,  rarity: "legendary", hidden: true },
  { id: "win_20_streak",    title: "Máquina Perfecta",           description: "Gana 20 partidas seguidas.",                    icon: "infinite",         iconColor: "#FF4400", target: 20,    coinsReward: 1000, xpReward: 3000,  rarity: "legendary", hidden: true },
  // Emote system
  { id: "emote_first",      title: "Primer Emote",               description: "Usa un emote por primera vez.",                  icon: "happy",            iconColor: "#27AE60", target: 1,     coinsReward: 10,   xpReward: 25,    rarity: "common" },
  { id: "emote_5",          title: "Expresivo",                  description: "Usa 5 emotes en una partida.",                   icon: "happy",            iconColor: "#1A8FC1", target: 1,     coinsReward: 20,   xpReward: 50,    rarity: "common" },
  { id: "emote_25",         title: "Emoticón Activo",            description: "Usa 25 emotes en total.",                        icon: "happy",            iconColor: "#E67E22", target: 25,    coinsReward: 40,   xpReward: 100,   rarity: "rare" },
  { id: "emote_100",        title: "Rey de los Emotes",          description: "Usa 100 emotes en total.",                       icon: "happy",            iconColor: "#D4AF37", target: 100,   coinsReward: 100,  xpReward: 250,   rarity: "epic" },
  // Daily rewards
  { id: "daily_reward_7",   title: "Semana de Recompensas",      description: "Reclama 7 recompensas diarias.",                 icon: "calendar",         iconColor: "#27AE60", target: 7,     coinsReward: 30,   xpReward: 75,    rarity: "common" },
  { id: "daily_reward_30",  title: "Mes de Recompensas",         description: "Reclama 30 recompensas diarias.",                icon: "calendar",         iconColor: "#1A8FC1", target: 30,    coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "daily_reward_100", title: "100 Recompensas Diarias",    description: "Reclama 100 recompensas diarias.",               icon: "calendar",         iconColor: "#D4AF37", target: 100,   coinsReward: 400,  xpReward: 1000,  rarity: "epic" },
  { id: "daily_reward_365", title: "Un Año de Recompensas",      description: "Reclama 365 recompensas diarias.",               icon: "calendar",         iconColor: "#A855F7", target: 365,   coinsReward: 2000, xpReward: 5000,  rarity: "legendary" },
  // Audio/Settings
  { id: "mute_toggle",      title: "Silencioso",                 description: "Activa o desactiva el sonido.",                  icon: "volume-mute",      iconColor: "#95A5A6", target: 1,     coinsReward: 5,    xpReward: 10,    rarity: "common" },
  { id: "sound_all_on",     title: "Todo al Máximo",             description: "Activa todos los sonidos del juego.",            icon: "volume-high",      iconColor: "#27AE60", target: 1,     coinsReward: 10,   xpReward: 25,    rarity: "common" },
  { id: "audio_lover",      title: "Amante del Audio",           description: "Juega 50 partidas con todos los sonidos activos.", icon: "musical-notes",  iconColor: "#E67E22", target: 50,    coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  // Special wins
  { id: "tournament_perfect",title:"Torneo Sin Derrota",         description: "Gana un torneo sin perder ninguna ronda.",        icon: "trophy",           iconColor: "#FFD700", target: 1,     coinsReward: 200,  xpReward: 500,   rarity: "epic", hidden: true },
  { id: "coop_undefeated",  title: "Cooperativo Invicto",        description: "Gana 10 partidas coop sin perder.",              icon: "people",           iconColor: "#D4AF37", target: 10,    coinsReward: 400,  xpReward: 1000,  rarity: "legendary" },
  { id: "domination_5",     title: "Dominación Cinco",           description: "Gana 5 partidas en Difícil sin robar.",          icon: "flash",            iconColor: "#A855F7", target: 5,     coinsReward: 600,  xpReward: 1500,  rarity: "legendary", hidden: true },
  { id: "perfect_streak",   title: "Perfectas Seguidas",         description: "Gana 3 partidas perfectas consecutivas.",        icon: "sparkles",         iconColor: "#FFD700", target: 3,     coinsReward: 300,  xpReward: 800,   rarity: "legendary", hidden: true },
  { id: "clutch_king",      title: "Rey del Clutch",             description: "Gana 10 partidas cuando estabas perdiendo.",     icon: "arrow-up-circle",  iconColor: "#E74C3C", target: 10,    coinsReward: 500,  xpReward: 1200,  rarity: "legendary" },
  // Gameplay specific expansion
  { id: "wild_frenzy_3",    title: "Trifuerza de Ochos",         description: "Juega 3+ ochos locos en 3 partidas distintas.",  icon: "infinite",         iconColor: "#E67E22", target: 3,     coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "j_spam_5",         title: "Spam de Jotas",              description: "Juega 5+ Jotas en 5 partidas distintas.",        icon: "hand-left",        iconColor: "#27AE60", target: 5,     coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "seven_trap_3",     title: "Maestro del 7",              description: "Atrapa al rival con el 7 en 3 partidas.",        icon: "thunderstorm",     iconColor: "#D4AF37", target: 3,     coinsReward: 150,  xpReward: 400,   rarity: "epic" },
  { id: "two_chain_3",      title: "Maestro del 2",              description: "Encadena cartas 2 en 3 partidas.",               icon: "link",             iconColor: "#E74C3C", target: 3,     coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "joker_comeback",   title: "Comodín al Rescate",         description: "Gana con un Comodín desde una posición mala.",   icon: "star",             iconColor: "#FF6B00", target: 1,     coinsReward: 120,  xpReward: 300,   rarity: "epic", hidden: true },
  { id: "perfect_eight",    title: "Ocho Perfecto",              description: "Juega 8 ochos locos en una sola partida.",       icon: "infinite",         iconColor: "#A855F7", target: 1,     coinsReward: 300,  xpReward: 800,   rarity: "legendary", hidden: true },
  { id: "defensive_master", title: "Maestro Defensivo",          description: "Bloquea 20 robos con Ases en total.",            icon: "shield-checkmark", iconColor: "#1A8FC1", target: 20,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "offensive_master", title: "Maestro Ofensivo",           description: "Fuerza 20 robos al rival con 2 o 7.",            icon: "layers",           iconColor: "#E74C3C", target: 20,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "rainbow_win",      title: "Arcoíris",                   description: "Gana usando cartas de los 4 palos.",             icon: "color-palette",    iconColor: "#FF69B4", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "last_card_win",    title: "La Última Carta",            description: "Gana con la última carta siendo especial.",      icon: "star",             iconColor: "#FFD700", target: 1,     coinsReward: 80,   xpReward: 200,   rarity: "epic", hidden: true },
  // Time-based expansion
  { id: "early_bird_5",     title: "Madrugador Constante",       description: "Gana 5 partidas antes de las 8 AM.",             icon: "sunny",            iconColor: "#E67E22", target: 5,     coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "night_owl_5",      title: "Búho de la Medianoche",      description: "Gana 5 partidas después de la medianoche.",      icon: "moon",             iconColor: "#4A90E2", target: 5,     coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "weekend_warrior_5",title: "Guerrero de Fin de Semana",  description: "Gana 50 partidas en fines de semana.",           icon: "calendar",         iconColor: "#D4AF37", target: 50,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  { id: "speed_45s",        title: "45 Segundos",                description: "Gana una partida en menos de 45 segundos.",      icon: "flash",            iconColor: "#E74C3C", target: 1,     coinsReward: 200,  xpReward: 500,   rarity: "legendary", hidden: true },
  { id: "marathon_30m",     title: "Ultramaratón",               description: "Juega una partida de más de 30 minutos.",        icon: "time",             iconColor: "#D4AF37", target: 1,     coinsReward: 100,  xpReward: 250,   rarity: "epic" },
  // Language expansion
  { id: "all_languages",    title: "Trilingüe",                  description: "Juega en los 3 idiomas disponibles.",            icon: "language",         iconColor: "#D4AF37", target: 3,     coinsReward: 80,   xpReward: 200,   rarity: "epic" },
  { id: "spanish_player",   title: "¡Español al 100!",           description: "Juega 30 partidas en Español.",                  icon: "language",         iconColor: "#E74C3C", target: 30,    coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "english_player",   title: "English Gamer",              description: "Play 30 games in English.",                      icon: "language",         iconColor: "#1A8FC1", target: 30,    coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  // Customization
  { id: "legendary_back",   title: "Dorso Legendario",           description: "Equipa un dorso de cartas legendario.",          icon: "card",             iconColor: "#D4AF37", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "legendary_avatar", title: "Avatar Legendario",          description: "Equipa un avatar legendario.",                   icon: "person-circle",    iconColor: "#D4AF37", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "legendary_frame",  title: "Marco Legendario",           description: "Equipa un marco legendario.",                    icon: "square",           iconColor: "#D4AF37", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "legendary_effect", title: "Efecto Legendario",          description: "Equipa un efecto visual legendario.",            icon: "sparkles",         iconColor: "#D4AF37", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "legendary_title",  title: "Título Legendario",          description: "Equipa un título legendario.",                   icon: "ribbon",           iconColor: "#D4AF37", target: 1,     coinsReward: 50,   xpReward: 120,   rarity: "rare" },
  { id: "full_legendary_set",title:"Set Legendario Completo",    description: "Equipa los 5 artículos legendarios a la vez.",   icon: "diamond",          iconColor: "#A855F7", target: 1,     coinsReward: 500,  xpReward: 1500,  rarity: "legendary", hidden: true },
  // Rarity collection
  { id: "rare_collector_5", title: "Colector de Rarezas",        description: "Posee 5 artículos raros.",                       icon: "albums",           iconColor: "#2196F3", target: 5,     coinsReward: 30,   xpReward: 75,    rarity: "rare" },
  { id: "epic_collector_3", title: "Colector Épico",             description: "Posee 3 artículos épicos.",                      icon: "diamond",          iconColor: "#9B59B6", target: 3,     coinsReward: 80,   xpReward: 200,   rarity: "epic" },
  { id: "legendary_collector_1",title:"Primera Legendaria",      description: "Posee tu primer artículo legendario.",           icon: "star",             iconColor: "#D4AF37", target: 1,     coinsReward: 100,  xpReward: 300,   rarity: "epic" },
  { id: "legendary_collector_3",title:"Tres Legendarias",        description: "Posee 3 artículos legendarios.",                 icon: "star",             iconColor: "#D4AF37", target: 3,     coinsReward: 300,  xpReward: 800,   rarity: "legendary" },
  { id: "legendary_collector_5",title:"Cinco Legendarias",       description: "Posee 5 artículos legendarios.",                 icon: "diamond",          iconColor: "#A855F7", target: 5,     coinsReward: 800,  xpReward: 2000,  rarity: "legendary" },
  // Wild 8 mastery
  { id: "eight_redirect_10",title: "10 Cambios de Palo",         description: "Cambia el palo activo 10 veces con el ocho.",    icon: "shuffle",          iconColor: "#1A8FC1", target: 10,    coinsReward: 30,   xpReward: 75,    rarity: "common" },
  { id: "eight_redirect_50",title: "50 Cambios de Palo",         description: "Cambia el palo activo 50 veces con el ocho.",    icon: "shuffle",          iconColor: "#9B59B6", target: 50,    coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "eight_game_3",     title: "Trío de Ochos",              description: "Juega 3 ochos locos en una sola partida.",       icon: "infinite",         iconColor: "#E67E22", target: 1,     coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "eight_game_5",     title: "Quinteto de Ochos",          description: "Juega 5 ochos locos en una sola partida.",       icon: "infinite",         iconColor: "#D4AF37", target: 1,     coinsReward: 200,  xpReward: 500,   rarity: "epic", hidden: true },
  // Ocho calls
  { id: "ocho_call_10",     title: "¡10 veces Ocho!",            description: "Llama '¡Ocho!' 10 veces en total.",              icon: "megaphone",        iconColor: "#FFD700", target: 10,    coinsReward: 20,   xpReward: 50,    rarity: "common" },
  { id: "ocho_call_50",     title: "Locutor de Ocho",            description: "Llama '¡Ocho!' 50 veces en total.",              icon: "megaphone",        iconColor: "#E67E22", target: 50,    coinsReward: 60,   xpReward: 150,   rarity: "rare" },
  { id: "ocho_call_100",    title: "El Gran Anunciador",         description: "Llama '¡Ocho!' 100 veces en total.",             icon: "megaphone",        iconColor: "#D4AF37", target: 100,   coinsReward: 150,  xpReward: 400,   rarity: "epic" },
  { id: "ocho_master",      title: "Maestro del Ocho",           description: "Llama '¡Ocho!' en 10 partidas consecutivas.",    icon: "trophy",           iconColor: "#A855F7", target: 10,    coinsReward: 400,  xpReward: 1000,  rarity: "legendary" },
  // Level extra
  { id: "level_50_wins",    title: "50 Victorias por Nivel",     description: "Gana 50 partidas en cualquier nivel.",           icon: "trending-up",      iconColor: "#27AE60", target: 50,    coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  // Expert extras
  { id: "expert_no_timeout",title: "Sin Tiempo Límite",          description: "Gana 5 partidas Experto sin que se acabe el tiempo.", icon: "timer",        iconColor: "#9B59B6", target: 5,     coinsReward: 300,  xpReward: 800,   rarity: "epic" },
  { id: "expert_masterclass",title:"Clase Magistral Experto",    description: "Gana 25 partidas Experto perfectas.",             icon: "school",           iconColor: "#D4AF37", target: 25,    coinsReward: 1000, xpReward: 3000,  rarity: "legendary" },
  { id: "expert_streak_5",  title: "5 Seguidas en Experto",      description: "Gana 5 partidas Experto consecutivas.",           icon: "flash",            iconColor: "#E74C3C", target: 5,     coinsReward: 500,  xpReward: 1200,  rarity: "legendary", hidden: true },
  // Social
  { id: "emote_master_full",title: "Maestro de Emotes",          description: "Usa todos los tipos de emote disponibles.",       icon: "happy",            iconColor: "#9B59B6", target: 1,     coinsReward: 100,  xpReward: 250,   rarity: "epic" },
  { id: "silent_champion",  title: "Campeón Silencioso",         description: "Gana 20 partidas sin usar ningún emote.",        icon: "volume-mute",      iconColor: "#95A5A6", target: 20,    coinsReward: 100,  xpReward: 250,   rarity: "rare" },
  { id: "team_player",      title: "Jugador de Equipo",          description: "Gana 20 partidas cooperativas.",                  icon: "people",           iconColor: "#27AE60", target: 20,    coinsReward: 200,  xpReward: 500,   rarity: "epic" },
  // Battle pass collection
  { id: "bp_collector_10",  title: "10 Premios del Pase",        description: "Reclama 10 recompensas del Pase de Batalla.",    icon: "gift",             iconColor: "#1A8FC1", target: 10,    coinsReward: 50,   xpReward: 120,   rarity: "common" },
  { id: "bp_collector_50",  title: "50 Premios del Pase",        description: "Reclama 50 recompensas del Pase de Batalla.",    icon: "gift",             iconColor: "#D4AF37", target: 50,    coinsReward: 200,  xpReward: 500,   rarity: "rare" },
  { id: "bp_collector_100", title: "100 Premios del Pase",       description: "Reclama 100 recompensas del Pase de Batalla.",   icon: "gift",             iconColor: "#A855F7", target: 100,   coinsReward: 600,  xpReward: 1500,  rarity: "epic" },
  // Comeback milestones
  { id: "epic_comeback_3",  title: "Epico Regreso x3",           description: "Regresa de 15+ cartas 3 veces.",                 icon: "arrow-up-circle",  iconColor: "#E74C3C", target: 3,     coinsReward: 200,  xpReward: 500,   rarity: "epic", hidden: true },
  { id: "ultimate_comeback",title: "Regreso Definitivo",         description: "Gana desde 20+ cartas en mano.",                 icon: "arrow-up",         iconColor: "#D4AF37", target: 1,     coinsReward: 500,  xpReward: 1500,  rarity: "legendary", hidden: true },
  { id: "miracle_win",      title: "Victoria Milagrosa",         description: "Gana con 18+ cartas en mano.",                   icon: "star",             iconColor: "#FFD700", target: 1,     coinsReward: 300,  xpReward: 800,   rarity: "legendary", hidden: true },
  // Challenge expansion
  { id: "challenge_streak_3",title:"Racha de Desafíos",          description: "Gana 3 desafíos seguidos.",                      icon: "flash",            iconColor: "#E67E22", target: 3,     coinsReward: 80,   xpReward: 200,   rarity: "rare" },
  { id: "challenge_master_50",title:"Maestro Desafiante",        description: "Completa 50 desafíos.",                          icon: "checkbox",         iconColor: "#9B59B6", target: 50,    coinsReward: 300,  xpReward: 800,   rarity: "epic" },
  { id: "challenge_legend", title: "Leyenda de los Desafíos",    description: "Completa 100 desafíos.",                         icon: "trophy",           iconColor: "#D4AF37", target: 100,   coinsReward: 1000, xpReward: 3000,  rarity: "legendary" },
  // Collectors
  { id: "coin_millionaire", title: "Millonario de Monedas",      description: "Acumula 100000 monedas en toda tu vida.",        icon: "diamond",          iconColor: "#D4AF37", target: 100000,coinsReward: 2000, xpReward: 5000,  rarity: "legendary" },
  { id: "coin_spender_master",title:"Gastador Supremo",          description: "Gasta 10000 monedas en total.",                  icon: "bag",              iconColor: "#A855F7", target: 10000, coinsReward: 1000, xpReward: 2500,  rarity: "legendary" },
  // Pattern wins
  { id: "all_same_suit",    title: "Monocolor",                  description: "Gana usando cartas de un solo palo.",            icon: "color-palette",    iconColor: "#9B59B6", target: 1,     coinsReward: 100,  xpReward: 250,   rarity: "epic", hidden: true },
  { id: "multisuit_win",    title: "Cuatro Palos",               description: "Juega cartas de los 4 palos en una partida.",    icon: "shuffle",          iconColor: "#E67E22", target: 1,     coinsReward: 40,   xpReward: 100,   rarity: "rare" },
  // Tournament
  { id: "tournament_champion_25",title:"Campeón de 25 Torneos",  description: "Gana 25 torneos en total.",                      icon: "diamond",          iconColor: "#A855F7", target: 25,    coinsReward: 1000, xpReward: 2500,  rarity: "legendary" },
  // Comeback
  { id: "never_give_up",    title: "Nunca Rendirse",             description: "Gana 5 partidas cuando tenías más cartas.",      icon: "arrow-up",         iconColor: "#27AE60", target: 5,     coinsReward: 200,  xpReward: 500,   rarity: "epic" },
];

export const RARITY_COLORS = {
  common: "#95A5A6",
  rare: "#2196F3",
  epic: "#9B59B6",
  legendary: "#D4AF37",
};

export function getAchievementById(id: AchievementId): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
