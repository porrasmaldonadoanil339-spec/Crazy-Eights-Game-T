import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Challenge {
  id: string;
  title: string;
  titleEn: string;
  titlePt: string;
  description: string;
  descriptionEn: string;
  descriptionPt: string;
  icon: string;
  target: number;
  type: "wins" | "cards_played" | "specials" | "streak" | "play_mode";
  modeFilter?: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  coinReward: number;
  xpReward: number;
  resetAt: number;
}

export const CHALLENGES_POOL: Omit<Challenge, "progress" | "completed" | "claimed" | "resetAt">[] = [
  {
    id: "win_3_games",
    title: "Ganador Nato",
    titleEn: "Natural Winner",
    titlePt: "Vencedor Nato",
    description: "Gana 3 partidas en cualquier modo",
    descriptionEn: "Win 3 matches in any mode",
    descriptionPt: "Vença 3 partidas em qualquer modo",
    icon: "trophy",
    target: 3,
    type: "wins",
    coinReward: 100,
    xpReward: 200,
  },
  {
    id: "play_50_cards",
    title: "Lluvia de Cartas",
    titleEn: "Card Shower",
    titlePt: "Chuva de Cartas",
    description: "Juega un total de 50 cartas",
    descriptionEn: "Play a total of 50 cards",
    descriptionPt: "Jogue um total de 50 cartas",
    icon: "copy",
    target: 50,
    type: "cards_played",
    coinReward: 80,
    xpReward: 150,
  },
  {
    id: "win_classic_2",
    title: "Maestro Clásico",
    titleEn: "Classic Master",
    titlePt: "Mestre Clássico",
    description: "Gana 2 partidas en modo Clásico",
    descriptionEn: "Win 2 matches in Classic mode",
    descriptionPt: "Vença 2 partidas no modo Clássico",
    icon: "star",
    target: 2,
    type: "wins",
    modeFilter: "classic",
    coinReward: 120,
    xpReward: 250,
  },
  {
    id: "play_10_eights",
    title: "Ocho Loco",
    titleEn: "Crazy Eight",
    titlePt: "Oito Maluco",
    description: "Juega 10 ochos (comodines)",
    descriptionEn: "Play 10 eights (wildcards)",
    descriptionPt: "Jogue 10 oitos (curingas)",
    icon: "flash",
    target: 10,
    type: "specials",
    coinReward: 150,
    xpReward: 300,
  },
  {
    id: "win_lightning_1",
    title: "Velocista",
    titleEn: "Sprinter",
    titlePt: "Velocista",
    description: "Gana 1 partida en modo Relámpago",
    descriptionEn: "Win 1 match in Lightning mode",
    descriptionPt: "Vença 1 partida no modo Relâmpago",
    icon: "thunderstorm",
    target: 1,
    type: "wins",
    modeFilter: "lightning",
    coinReward: 90,
    xpReward: 180,
  },
  {
    id: "play_5_games",
    title: "Persistente",
    titleEn: "Persistent",
    titlePt: "Persistente",
    description: "Juega 5 partidas completas",
    descriptionEn: "Play 5 complete matches",
    descriptionPt: "Jogue 5 partidas completas",
    icon: "play",
    target: 5,
    type: "play_mode",
    coinReward: 70,
    xpReward: 140,
  },
  {
    id: "draw_20_cards",
    title: "Buscador",
    titleEn: "Searcher",
    titlePt: "Buscador",
    description: "Roba 20 cartas del mazo",
    descriptionEn: "Draw 20 cards from the deck",
    descriptionPt: "Compre 20 cartas do baralho",
    icon: "download",
    target: 20,
    type: "cards_played",
    coinReward: 60,
    xpReward: 120,
  },
  {
    id: "win_streak_2",
    title: "Racha Imparable",
    titleEn: "Unstoppable Streak",
    titlePt: "Sequência Imparável",
    description: "Gana 2 partidas seguidas",
    descriptionEn: "Win 2 matches in a row",
    descriptionPt: "Vença 2 partidas seguidas",
    icon: "flame",
    target: 2,
    type: "streak",
    coinReward: 200,
    xpReward: 400,
  },
  // Adding more to reach 30+...
  { id: "c9", title: "Estratega", titleEn: "Strategist", titlePt: "Estrategista", description: "Gana 1 partida en modo Torneo", descriptionEn: "Win 1 match in Tournament mode", descriptionPt: "Vença 1 partida no modo Torneio", icon: "medal", target: 1, type: "wins", modeFilter: "tournament", coinReward: 150, xpReward: 300 },
  { id: "c10", title: "Compañero", titleEn: "Partner", titlePt: "Parceiro", description: "Gana 1 partida en modo Cooperativo", descriptionEn: "Win 1 match in Co-op mode", descriptionPt: "Vença 1 partida no modo Cooperativo", icon: "people", target: 1, type: "wins", modeFilter: "coop", coinReward: 130, xpReward: 260 },
  { id: "c11", title: "Uso de Especiales", titleEn: "Specialist", titlePt: "Especialista", description: "Juega 15 cartas especiales (2, J, Q, K, As)", descriptionEn: "Play 15 special cards (2, J, Q, K, Ace)", descriptionPt: "Jogue 15 cartas especiais", icon: "sparkles", target: 15, type: "specials", coinReward: 110, xpReward: 220 },
  { id: "c12", title: "Madrugador", titleEn: "Early Bird", titlePt: "Madrugador", description: "Juega 3 partidas hoy", descriptionEn: "Play 3 matches today", descriptionPt: "Jogue 3 partidas hoje", icon: "sunny", target: 3, type: "play_mode", coinReward: 50, xpReward: 100 },
  { id: "c13", title: "Coleccionista", titleEn: "Collector", titlePt: "Colecionador", description: "Roba 40 cartas en total", descriptionEn: "Draw 40 cards in total", descriptionPt: "Compre 40 cartas no total", icon: "albums", target: 40, type: "cards_played", coinReward: 100, xpReward: 200 },
  { id: "c14", title: "Dominante", titleEn: "Dominant", titlePt: "Dominante", description: "Gana 5 partidas", descriptionEn: "Win 5 matches", descriptionPt: "Vença 5 partidas", icon: "ribbon", target: 5, type: "wins", coinReward: 180, xpReward: 360 },
  { id: "c15", title: "As del Aire", titleEn: "Air Ace", titlePt: "Ás do Ar", description: "Juega 5 cartas de As", descriptionEn: "Play 5 Ace cards", descriptionPt: "Jogue 5 cartas de Ás", icon: "airplane", target: 5, type: "specials", coinReward: 120, xpReward: 240 },
  { id: "c16", title: "Reina del Casino", titleEn: "Casino Queen", titlePt: "Rainha do Cassino", description: "Juega 5 cartas de Reina", descriptionEn: "Play 5 Queen cards", descriptionPt: "Jogue 5 cartas de Dama", icon: "woman", target: 5, type: "specials", coinReward: 120, xpReward: 240 },
  { id: "c17", title: "Rey de Corazones", titleEn: "King of Hearts", titlePt: "Rei de Copas", description: "Juega 5 cartas de Rey", descriptionEn: "Play 5 King cards", descriptionPt: "Jogue 5 cartas de Rei", icon: "man", target: 5, type: "specials", coinReward: 120, xpReward: 240 },
  { id: "c18", title: "Doble O", titleEn: "Double O", titlePt: "Duplo O", description: "Juega 5 cartas de 2 (+2)", descriptionEn: "Play 5 cards of 2 (+2)", descriptionPt: "Jogue 5 cartas de 2 (+2)", icon: "add", target: 5, type: "specials", coinReward: 120, xpReward: 240 },
  { id: "c19", title: "Experto en Clásico", titleEn: "Classic Expert", titlePt: "Expert em Clássico", description: "Gana 3 partidas en modo Clásico", descriptionEn: "Win 3 matches in Classic mode", descriptionPt: "Vença 3 partidas no modo Clássico", icon: "briefcase", target: 3, type: "wins", modeFilter: "classic", coinReward: 160, xpReward: 320 },
  { id: "c20", title: "Rayo Veloz", titleEn: "Fast Lightning", titlePt: "Raio Veloz", description: "Gana 2 partidas en modo Relámpago", descriptionEn: "Win 2 matches in Lightning mode", descriptionPt: "Vença 2 partidas no modo Relâmpago", icon: "bolt", target: 2, type: "wins", modeFilter: "lightning", coinReward: 140, xpReward: 280 },
  { id: "c21", title: "Veterano de Torneos", titleEn: "Tournament Veteran", titlePt: "Veterano de Torneios", description: "Gana 2 partidas en modo Torneo", descriptionEn: "Win 2 matches in Tournament mode", descriptionPt: "Vença 2 partidas no modo Torneio", icon: "shield-checkmark", target: 2, type: "wins", modeFilter: "tournament", coinReward: 200, xpReward: 400 },
  { id: "c22", title: "Socio de Oro", titleEn: "Gold Partner", titlePt: "Sócio de Ouro", description: "Gana 2 partidas en modo Cooperativo", descriptionEn: "Win 2 matches in Co-op mode", descriptionPt: "Vença 2 partidas no modo Cooperativo", icon: "heart", target: 2, type: "wins", modeFilter: "coop", coinReward: 180, xpReward: 360 },
  { id: "c23", title: "Gran Jugador", titleEn: "Big Player", titlePt: "Grande Jogador", description: "Juega 10 partidas hoy", descriptionEn: "Play 10 matches today", descriptionPt: "Jogue 10 partidas hoje", icon: "apps", target: 10, type: "play_mode", coinReward: 200, xpReward: 400 },
  { id: "c24", title: "Cazador de Ochos", titleEn: "Eight Hunter", titlePt: "Caçador de Oitos", description: "Juega 20 ochos", descriptionEn: "Play 20 eights", descriptionPt: "Jogue 20 oitos", icon: "eye", target: 20, type: "specials", coinReward: 300, xpReward: 600 },
  { id: "c25", title: "Incansable", titleEn: "Tireless", titlePt: "Incansável", description: "Gana 10 partidas en total", descriptionEn: "Win 10 matches in total", descriptionPt: "Vença 10 partidas no total", icon: "infinite", target: 10, type: "wins", coinReward: 400, xpReward: 800 },
  { id: "c26", title: "Maestro del Mazo", titleEn: "Deck Master", titlePt: "Mestre do Baralho", description: "Juega 200 cartas", descriptionEn: "Play 200 cards", descriptionPt: "Jogue 200 cartas", icon: "layers", target: 200, type: "cards_played", coinReward: 350, xpReward: 700 },
  { id: "c27", title: "Triple Amenaza", titleEn: "Triple Threat", titlePt: "Ameaça Tripla", description: "Gana 3 partidas seguidas", descriptionEn: "Win 3 matches in a row", descriptionPt: "Vença 3 partidas seguidas", icon: "trending-up", target: 3, type: "streak", coinReward: 450, xpReward: 900 },
  { id: "c28", title: "Rey del Lightning", titleEn: "Lightning King", titlePt: "Rei do Lightning", description: "Gana 5 partidas en modo Relámpago", descriptionEn: "Win 5 matches in Lightning mode", descriptionPt: "Vença 5 partidas no modo Relâmpago", icon: "flash-outline", target: 5, type: "wins", modeFilter: "lightning", coinReward: 300, xpReward: 600 },
  { id: "c29", title: "Maestro de Clásico", titleEn: "Classic Grandmaster", titlePt: "Grão-Mestre Clássico", description: "Gana 5 partidas en modo Clásico", descriptionEn: "Win 5 matches in Classic mode", descriptionPt: "Vença 5 partidas no modo Clássico", icon: "trophy-outline", target: 5, type: "wins", modeFilter: "classic", coinReward: 300, xpReward: 600 },
  { id: "c30", title: "Imbatible", titleEn: "Unbeatable", titlePt: "Imbatível", description: "Gana 5 partidas seguidas", descriptionEn: "Win 5 matches in a row", descriptionPt: "Vença 5 partidas seguidas", icon: "diamond", target: 5, type: "streak", coinReward: 1000, xpReward: 2000 },
];

const STORAGE_KEY = "ocho_challenges_v1";

export async function getDailyChallenges(level: number): Promise<Challenge[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resetAt = today.getTime() + 24 * 60 * 60 * 1000;

    if (raw) {
      const saved = JSON.parse(raw) as Challenge[];
      if (saved.length > 0 && saved[0].resetAt > now) {
        return saved;
      }
    }

    // Seed based on date + level for consistency but variety
    const dateSeed = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const seed = dateSeed + level;
    
    // Select 3 unique random challenges from pool
    const selected: Challenge[] = [];
    const pool = [...CHALLENGES_POOL];
    
    for (let i = 0; i < 3; i++) {
      const index = (seed + i * 7) % pool.length;
      const base = pool.splice(index, 1)[0];
      
      // Scale difficulty/rewards based on level (basic scaling)
      const scale = 1 + Math.floor(level / 10) * 0.2;
      
      selected.push({
        ...base,
        target: Math.round(base.target * scale),
        coinReward: Math.round(base.coinReward * scale),
        xpReward: Math.round(base.xpReward * scale),
        progress: 0,
        completed: false,
        claimed: false,
        resetAt,
      });
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    return selected;
  } catch (e) {
    console.error("Error getting challenges", e);
    return [];
  }
}

export async function updateChallengeProgress(
  type: Challenge["type"],
  value: number,
  modeFilter?: string,
  isWin: boolean = false
): Promise<Challenge[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    let challenges = JSON.parse(raw) as Challenge[];
    let changed = false;

    challenges = challenges.map((c) => {
      if (c.completed || c.claimed) return c;
      
      let match = false;
      if (c.type === type) {
        if (!c.modeFilter || c.modeFilter === modeFilter) {
          match = true;
        }
      }

      if (match) {
        const newProgress = Math.min(c.target, c.progress + value);
        if (newProgress !== c.progress) {
          changed = true;
          return {
            ...c,
            progress: newProgress,
            completed: newProgress >= c.target,
          };
        }
      }
      return c;
    });

    if (changed) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    }
    return challenges;
  } catch (e) {
    return [];
  }
}

export async function claimChallenge(id: string): Promise<Challenge[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  let challenges = JSON.parse(raw) as Challenge[];
  challenges = challenges.map((c) => {
    if (c.id === id && c.completed && !c.claimed) {
      return { ...c, claimed: true };
    }
    return c;
  });

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
  return challenges;
}
