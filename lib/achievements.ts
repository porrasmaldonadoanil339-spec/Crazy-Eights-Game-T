export type AchievementId =
  // Win milestones
  | "first_win" | "win_5" | "win_25" | "win_100" | "win_500"
  // Mode wins
  | "lightning_king" | "tournament_champ" | "coop_hero" | "challenge_master" | "expert_survivor"
  | "all_modes" | "practice_grad"
  // Special cards
  | "eight_wizard" | "eight_10" | "eight_50" | "joker_hero" | "chain_two" | "chain_seven"
  | "j_master" | "triple_play" | "reverse_master"
  // Hands
  | "perfect_hand" | "comeback_king" | "speed_demon" | "marathon_man" | "flawless_expert"
  // Coins
  | "collector_50" | "collector_500" | "collector_1000" | "spender" | "big_spender"
  // Streaks
  | "daily_streak_3" | "daily_streak_7" | "daily_streak_14" | "daily_streak_30"
  // Store
  | "first_purchase" | "collector_items5" | "collector_items10" | "fashion"
  // Difficulty
  | "hard_win" | "expert_win" | "no_draw_win" | "draw_5" | "draw_10"
  // Social/fun
  | "bad_luck" | "lucky_draw" | "domination" | "underdog" | "marathon_session";

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
  // Win milestones
  { id: "first_win",      title: "Primera Victoria",        description: "Gana tu primera partida.",             icon: "star",             iconColor: "#FFD700", target: 1,   coinsReward: 20,  xpReward: 50,  rarity: "common" },
  { id: "win_5",          title: "Jugador Experimentado",   description: "Gana 5 partidas.",                     icon: "star-half",        iconColor: "#FFD700", target: 5,   coinsReward: 30,  xpReward: 80,  rarity: "common" },
  { id: "win_25",         title: "Maestro de Cartas",       description: "Gana 25 partidas.",                    icon: "ribbon",           iconColor: "#C0C0C0", target: 25,  coinsReward: 80,  xpReward: 200, rarity: "rare" },
  { id: "win_100",        title: "Centurión",               description: "Gana 100 partidas.",                   icon: "trophy",           iconColor: "#D4AF37", target: 100, coinsReward: 250, xpReward: 500, rarity: "epic" },
  { id: "win_500",        title: "Leyenda Eterna",          description: "Gana 500 partidas.",                   icon: "diamond",          iconColor: "#A855F7", target: 500, coinsReward: 1000,xpReward: 2000,rarity: "legendary" },
  // Mode wins
  { id: "lightning_king", title: "Rey Relámpago",          description: "Gana 10 partidas en Relámpago.",       icon: "flash",            iconColor: "#FFD700", target: 10,  coinsReward: 50,  xpReward: 120, rarity: "rare" },
  { id: "tournament_champ",title: "Campeón de Torneo",     description: "Gana 3 torneos.",                      icon: "medal",            iconColor: "#E67E22", target: 3,   coinsReward: 100, xpReward: 300, rarity: "epic" },
  { id: "coop_hero",      title: "Héroe Cooperativo",      description: "Gana 5 partidas Cooperativo.",         icon: "people",           iconColor: "#27AE60", target: 5,   coinsReward: 60,  xpReward: 150, rarity: "rare" },
  { id: "challenge_master",title: "Maestro de Desafíos",   description: "Completa 10 desafíos.",                icon: "checkbox",         iconColor: "#9B59B6", target: 10,  coinsReward: 80,  xpReward: 200, rarity: "epic" },
  { id: "expert_survivor",title: "Superviviente Experto",  description: "Gana 5 partidas en modo Experto.",     icon: "timer",            iconColor: "#E74C3C", target: 5,   coinsReward: 150, xpReward: 400, rarity: "legendary" },
  { id: "all_modes",      title: "Todoterreno",            description: "Gana en todos los modos de juego.",    icon: "grid",             iconColor: "#9B59B6", target: 6,   coinsReward: 150, xpReward: 400, rarity: "legendary" },
  { id: "practice_grad",  title: "Graduado",               description: "Completa 10 partidas de Práctica.",   icon: "school",           iconColor: "#1A8FC1", target: 10,  coinsReward: 25,  xpReward: 60,  rarity: "common" },
  // Special cards
  { id: "eight_wizard",   title: "Mago del 8",             description: "Gana una partida con un 8 Loco.",      icon: "diamond",          iconColor: "#1A8FC1", target: 1,   coinsReward: 25,  xpReward: 60,  rarity: "rare" },
  { id: "eight_10",       title: "Locomoción",             description: "Juega 10 ochos locos en total.",       icon: "infinite",         iconColor: "#9B59B6", target: 10,  coinsReward: 40,  xpReward: 100, rarity: "rare" },
  { id: "eight_50",       title: "Maestro del Ocho",       description: "Juega 50 ochos locos en total.",       icon: "infinite",         iconColor: "#A855F7", target: 50,  coinsReward: 150, xpReward: 350, rarity: "epic" },
  { id: "joker_hero",     title: "El Comodín",             description: "Juega 20 comodines en total.",         icon: "star",             iconColor: "#FF6B00", target: 20,  coinsReward: 60,  xpReward: 150, rarity: "rare" },
  { id: "chain_two",      title: "Cadena del 2",           description: "Acumula 6+ cartas con el 2.",          icon: "link",             iconColor: "#E74C3C", target: 1,   coinsReward: 35,  xpReward: 90,  rarity: "rare" },
  { id: "chain_seven",    title: "Tormenta del 7",         description: "Acumula 6+ cartas con el 7.",          icon: "thunderstorm",     iconColor: "#FF6B00", target: 1,   coinsReward: 35,  xpReward: 90,  rarity: "rare" },
  { id: "j_master",       title: "Maestro de la J",        description: "Juega 15 Jotas en total.",             icon: "repeat",           iconColor: "#27AE60", target: 15,  coinsReward: 45,  xpReward: 110, rarity: "rare" },
  { id: "reverse_master", title: "Maestro del Reverso",    description: "Juega 20 cartas 10 en total.",         icon: "swap-horizontal",  iconColor: "#1A8FC1", target: 20,  coinsReward: 50,  xpReward: 120, rarity: "rare" },
  { id: "triple_play",    title: "Triple Jugada",          description: "Juega 3 cartas especiales seguidas.",  icon: "layers",           iconColor: "#D4AF37", target: 1,   coinsReward: 40,  xpReward: 100, rarity: "epic", hidden: true },
  // Hand quality
  { id: "perfect_hand",   title: "Mano Perfecta",          description: "Gana sin robar ninguna carta.",        icon: "sparkles",         iconColor: "#FFD700", target: 1,   coinsReward: 60,  xpReward: 150, rarity: "epic" },
  { id: "comeback_king",  title: "Rey del Comeback",       description: "Gana con 10+ cartas en mano.",         icon: "arrow-up-circle",  iconColor: "#E74C3C", target: 1,   coinsReward: 50,  xpReward: 130, rarity: "epic" },
  { id: "speed_demon",    title: "Demonio Veloz",          description: "Gana en Relámpago en <2 minutos.",     icon: "speedometer",      iconColor: "#E74C3C", target: 1,   coinsReward: 35,  xpReward: 90,  rarity: "rare" },
  { id: "marathon_man",   title: "Maratonista",            description: "Juega una partida >10 minutos.",       icon: "time",             iconColor: "#95A5A6", target: 1,   coinsReward: 20,  xpReward: 50,  rarity: "common" },
  { id: "flawless_expert",title: "Experto Impecable",      description: "Gana en Experto sin robar nada.",      icon: "shield-checkmark", iconColor: "#D4AF37", target: 1,   coinsReward: 200, xpReward: 500, rarity: "legendary", hidden: true },
  // Coins
  { id: "collector_50",   title: "Ahorrador",              description: "Acumula 50 monedas.",                  icon: "cash",             iconColor: "#F1C40F", target: 50,  coinsReward: 10,  xpReward: 30,  rarity: "common" },
  { id: "collector_500",  title: "Rico Rico",              description: "Acumula 500 monedas.",                 icon: "wallet",           iconColor: "#D4AF37", target: 500, coinsReward: 50,  xpReward: 150, rarity: "epic" },
  { id: "collector_1000", title: "Millonario de Cartas",   description: "Acumula 1000 monedas.",                icon: "diamond",          iconColor: "#A855F7", target: 1000,coinsReward: 150, xpReward: 400, rarity: "legendary" },
  { id: "spender",        title: "Comprador",              description: "Compra 3 artículos en la tienda.",     icon: "bag",              iconColor: "#E74C3C", target: 3,   coinsReward: 20,  xpReward: 50,  rarity: "common" },
  { id: "big_spender",    title: "Gran Comprador",         description: "Gasta 500 monedas en total.",          icon: "bag-add",          iconColor: "#D4AF37", target: 500, coinsReward: 60,  xpReward: 150, rarity: "rare" },
  // Streaks
  { id: "daily_streak_3",  title: "Constante",            description: "Juega 3 días seguidos.",               icon: "calendar",         iconColor: "#1A8FC1", target: 3,   coinsReward: 25,  xpReward: 60,  rarity: "common" },
  { id: "daily_streak_7",  title: "Adicto al Juego",      description: "Juega 7 días seguidos.",               icon: "flame",            iconColor: "#E67E22", target: 7,   coinsReward: 70,  xpReward: 180, rarity: "rare" },
  { id: "daily_streak_14", title: "Fanático",             description: "Juega 14 días seguidos.",              icon: "flame",            iconColor: "#E74C3C", target: 14,  coinsReward: 150, xpReward: 400, rarity: "epic" },
  { id: "daily_streak_30", title: "Obsesionado",          description: "Juega 30 días seguidos.",              icon: "infinite",         iconColor: "#A855F7", target: 30,  coinsReward: 500, xpReward: 1500,rarity: "legendary" },
  // Store
  { id: "first_purchase",     title: "Primera Compra",    description: "Compra tu primer artículo.",           icon: "bag-check",        iconColor: "#27AE60", target: 1,   coinsReward: 15,  xpReward: 40,  rarity: "common" },
  { id: "collector_items5",   title: "Coleccionista",     description: "Posee 5 artículos de la tienda.",      icon: "albums",           iconColor: "#9B59B6", target: 5,   coinsReward: 40,  xpReward: 100, rarity: "rare" },
  { id: "collector_items10",  title: "Gran Coleccionista",description: "Posee 10 artículos de la tienda.",     icon: "library",          iconColor: "#D4AF37", target: 10,  coinsReward: 100, xpReward: 250, rarity: "epic" },
  { id: "fashion",            title: "A la Moda",         description: "Equipa un dorso y avatar legendario.", icon: "color-palette",    iconColor: "#A855F7", target: 1,   coinsReward: 80,  xpReward: 200, rarity: "epic" },
  // Difficulty
  { id: "hard_win",       title: "Gladiador",              description: "Gana una partida en dificultad Difícil.",icon: "shield",        iconColor: "#E74C3C", target: 1,   coinsReward: 40,  xpReward: 100, rarity: "rare" },
  { id: "expert_win",     title: "Experto Real",           description: "Gana una partida en modo Experto.",   icon: "timer",            iconColor: "#FF0000", target: 1,   coinsReward: 100, xpReward: 300, rarity: "epic" },
  { id: "no_draw_win",    title: "Sin Piedad",             description: "Gana sin que el CPU robe una carta.", icon: "close-circle",     iconColor: "#27AE60", target: 1,   coinsReward: 45,  xpReward: 110, rarity: "rare", hidden: true },
  { id: "draw_5",         title: "Generoso",               description: "Haz robar 5+ cartas al CPU en 1 partida.", icon: "layers",     iconColor: "#E67E22", target: 5,   coinsReward: 30,  xpReward: 75,  rarity: "rare" },
  { id: "draw_10",        title: "Muy Generoso",           description: "Haz robar 10+ cartas al CPU en 1 partida.", icon: "layers",     iconColor: "#C0392B", target: 10,  coinsReward: 60,  xpReward: 150, rarity: "epic" },
  // Fun
  { id: "bad_luck",       title: "Mala Suerte",            description: "Roba 5+ cartas de más en 1 partida.", icon: "sad",              iconColor: "#95A5A6", target: 1,   coinsReward: 10,  xpReward: 20,  rarity: "common", hidden: true },
  { id: "lucky_draw",     title: "Golpe de Suerte",        description: "Roba y juega 3 cartas seguidas.",     icon: "happy",            iconColor: "#27AE60", target: 1,   coinsReward: 25,  xpReward: 60,  rarity: "rare", hidden: true },
  { id: "domination",     title: "Dominación Total",       description: "Gana en Difícil sin robar nada.",     icon: "flash",            iconColor: "#D4AF37", target: 1,   coinsReward: 120, xpReward: 350, rarity: "legendary", hidden: true },
  { id: "underdog",       title: "El Perro del Sota",      description: "Gana con 13+ cartas en mano.",        icon: "arrow-up",         iconColor: "#E74C3C", target: 1,   coinsReward: 80,  xpReward: 200, rarity: "epic", hidden: true },
  { id: "marathon_session",title: "Maratón Total",         description: "Juega 10 partidas en un día.",         icon: "fitness",          iconColor: "#27AE60", target: 10,  coinsReward: 50,  xpReward: 120, rarity: "rare" },
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
