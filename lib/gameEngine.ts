export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank =
  | "A" | "2" | "3" | "4" | "5" | "6" | "7"
  | "8" | "9" | "10" | "J" | "Q" | "K" | "Joker";

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export interface GameState {
  playerHand: Card[];
  aiHand: Card[];
  drawPile: Card[];
  discardPile: Card[];
  currentSuit: Suit;
  currentPlayer: "player" | "ai";
  phase: "dealing" | "playing" | "choosing_suit" | "player_wins" | "ai_wins" | "draw";
  message: string;
  consecutiveDraws: number;
  difficulty: string;
  turnId: number;
  // Special card state — pendingDrawType is the rank that started the stack
  // ("A" | "2" | "3" | "Joker"). Each rank stacks ONLY with itself or Joker.
  pendingDraw: number;
  pendingDrawType: "A" | "2" | "3" | "Joker" | "two" | "seven" | null;
  pendingDrawSuit: Suit | null;
  jActive: boolean;   // legacy — kept for backwards compatibility, always false in new rules
  jSuit: Suit | null; // legacy
  direction: 1 | -1;
  lastPlayedCard: Card | null;
}

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const BASE_RANKS: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of BASE_RANKS) {
      deck.push({ id: `${rank}-${suit}-${makeId()}`, suit, rank });
    }
  }
  // 2 Jokers: black (spades) and red (diamonds)
  deck.push({ id: `Joker-spades-${makeId()}`, suit: "spades", rank: "Joker" });
  deck.push({ id: `Joker-diamonds-${makeId()}`, suit: "diamonds", rank: "Joker" });
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function initGame(cardsPerPlayer: number = 7, difficulty: string = "normal"): GameState {
  const deck = createDeck();
  const playerHand = deck.splice(0, cardsPerPlayer);
  const aiHand = deck.splice(0, cardsPerPlayer);

  let topCard = deck.splice(0, 1)[0];
  let safety = 0;
  while ((topCard.rank === "8" || topCard.rank === "Joker") && safety < 20) {
    deck.push(topCard);
    const shuffled = shuffleDeck(deck);
    shuffled.forEach((c, i) => { deck[i] = c; });
    topCard = deck.splice(0, 1)[0];
    safety++;
  }

  return {
    playerHand,
    aiHand,
    drawPile: deck,
    discardPile: [topCard],
    currentSuit: topCard.suit,
    currentPlayer: "player",
    phase: "playing",
    message: "Tu turno — juega una carta",
    consecutiveDraws: 0,
    difficulty,
    turnId: 0,
    pendingDraw: 0,
    pendingDrawType: null,
    pendingDrawSuit: null,
    jActive: false,
    jSuit: null,
    direction: 1,
    lastPlayedCard: null,
  };
}

export function getTopCard(state: GameState): Card {
  return state.discardPile[state.discardPile.length - 1];
}

export function canPlay(card: Card, state: GameState): boolean {
  // Joker is playable AT ANY TIME (per definitive rules).
  if (card.rank === "Joker") return true;

  // Pending draw active: must counter with the SAME rank (only A/2/3 can stack
  // with itself; Joker stack accepts only Joker — already handled above).
  if (state.pendingDraw > 0) {
    if (state.pendingDrawType === "A") return card.rank === "A";
    if (state.pendingDrawType === "2") return card.rank === "2";
    if (state.pendingDrawType === "3") return card.rank === "3";
    if (state.pendingDrawType === "Joker") return false; // only Joker, handled above
    return false;
  }

  // 8 is wild: always playable when no pending stack
  if (card.rank === "8") return true;

  // Normal: must match SUIT or RANK with top card
  return card.suit === state.currentSuit || card.rank === getTopCard(state).rank;
}

export function getPlayableCards(hand: Card[], state: GameState): Card[] {
  return hand.filter((c) => canPlay(c, state));
}

export function startPlaying(state: GameState): GameState {
  return { ...state, phase: "playing", message: "Tu turno — juega una carta" };
}

export function playCard(state: GameState, card: Card, chosenSuit?: Suit): GameState {
  const ns = deepClone(state);
  ns.turnId = (ns.turnId ?? 0) + 1;
  ns.playerHand = ns.playerHand.filter((c) => c.id !== card.id);
  ns.discardPile.push(card);
  ns.lastPlayedCard = card;
  ns.consecutiveDraws = 0;

  // Legacy J flags — always cleared in new rules
  ns.jActive = false;
  ns.jSuit = null;

  // ───────────────────────────────────────────────────────────────────────
  // DEFINITIVE CARD RULES (per spec doc)
  //   A=+1 acumulable · 2=+2 acumulable · 3=+3 acumulable · 7=normal
  //   8=wild (cambia palo) · 10=normal · J=skip · Q=reverse · K=turno extra
  //   Joker=+4 jugable en cualquier momento
  // ───────────────────────────────────────────────────────────────────────

  if (card.rank === "8") {
    // 8 — wild: choose suit
    if (chosenSuit) {
      ns.currentSuit = chosenSuit;
      ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
      ns.currentPlayer = "ai";
      ns.message = gm("crazy8Suit", { s: suitName(chosenSuit) });
    } else {
      ns.phase = "choosing_suit";
      ns.message = gm("chooseSuit");
      return ns;
    }
  } else if (card.rank === "Joker") {
    // Joker — +4 anytime, switches stack to "Joker" type (only Joker can defend)
    ns.pendingDraw += 4;
    ns.pendingDrawType = "Joker";
    ns.pendingDrawSuit = null;
    ns.currentPlayer = "ai";
    ns.message = gm("jokerCpuDraw", { n: String(ns.pendingDraw) });
  } else if (card.rank === "A") {
    // A — +1 acumulable
    ns.pendingDraw += 1;
    ns.pendingDrawType = "A";
    ns.pendingDrawSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.currentPlayer = "ai";
    ns.message = gm("play2youDraw", { n: String(ns.pendingDraw) });
  } else if (card.rank === "2") {
    // 2 — +2 acumulable
    ns.pendingDraw += 2;
    ns.pendingDrawType = "2";
    ns.pendingDrawSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.currentPlayer = "ai";
    ns.message = gm("play2youDraw", { n: String(ns.pendingDraw) });
  } else if (card.rank === "3") {
    // 3 — +3 acumulable
    ns.pendingDraw += 3;
    ns.pendingDrawType = "3";
    ns.pendingDrawSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.currentPlayer = "ai";
    ns.message = gm("play2youDraw", { n: String(ns.pendingDraw) });
  } else if (card.rank === "J") {
    // J — rival pierde turno (en 1v1: jugador continúa)
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("player3skip");
    // currentPlayer stays "player"
  } else if (card.rank === "Q") {
    // Q — cambia el sentido (en 1v1 el jugador continúa)
    ns.direction = (ns.direction === 1 ? -1 : 1) as 1 | -1;
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("player10reverse");
  } else if (card.rank === "K") {
    // K — turno adicional (jugador juega de nuevo)
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("player3skip");
  } else {
    // 4, 5, 6, 7, 9, 10 — cartas normales
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.currentPlayer = "ai";
    ns.message = gm("cpuTurn");
  }

  if (ns.playerHand.length === 0) {
    ns.phase = "player_wins";
    ns.message = gm("playerWins");
  }
  return ns;
}

export function chooseSuit(state: GameState, suit: Suit): GameState {
  const ns = deepClone(state);
  ns.turnId = (ns.turnId ?? 0) + 1;
  ns.currentSuit = suit;
  ns.phase = "playing";
  ns.currentPlayer = "ai";
  ns.message = gm("youChoseSuit", { s: suitName(suit) });
  return ns;
}

export function playerDraw(state: GameState): GameState {
  let ns = deepClone(state);
  ns.turnId = (ns.turnId ?? 0) + 1;

  // J is active: drawing clears it and passes turn
  if (ns.jActive) {
    ns.jActive = false;
    ns.jSuit = null;
  }

  if (ns.pendingDraw > 0) {
    const count = ns.pendingDraw;
    for (let i = 0; i < count; i++) {
      if (ns.drawPile.length === 0) ns = reshuffleDiscard(ns);
      if (ns.drawPile.length > 0) ns.playerHand.push(ns.drawPile.pop()!);
    }
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.currentPlayer = "ai";
    ns.message = gm("cpuDrewN", { n: String(count) });
    return ns;
  }

  if (ns.drawPile.length === 0) ns = reshuffleDiscard(ns);
  if (ns.drawPile.length === 0) {
    ns.currentPlayer = "ai";
    ns.message = gm("noCards");
    return ns;
  }

  const card = ns.drawPile.pop()!;
  ns.playerHand.push(card);
  ns.consecutiveDraws++;

  if (canPlay(card, ns)) {
    ns.message = gm("drewCard");
  } else {
    ns.message = gm("noPlay");
    ns.currentPlayer = "ai";
  }
  return ns;
}

export function aiTurn(state: GameState, difficulty: string = "normal", mode: string = "classic"): GameState {
  let ns = deepClone(state);
  ns.turnId = (ns.turnId ?? 0) + 1;

  // Legacy J flags — clear (no longer used in new rules)
  ns.jActive = false; ns.jSuit = null;

  const playable = getPlayableCards(ns.aiHand, ns);

  if (playable.length === 0) {
    // Must draw
    if (ns.pendingDraw > 0) {
      const count = ns.pendingDraw;
      for (let i = 0; i < count; i++) {
        if (ns.drawPile.length === 0) ns = reshuffleDiscard(ns);
        if (ns.drawPile.length > 0) ns.aiHand.push(ns.drawPile.pop()!);
      }
      ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
      ns.message = gm("cpuDrewN", { n: String(count) });
      ns.currentPlayer = "player";
    } else {
      if (ns.drawPile.length === 0) ns = reshuffleDiscard(ns);
      if (ns.drawPile.length > 0) {
        const card = ns.drawPile.pop()!;
        ns.aiHand.push(card);
        ns.message = gm("cpuDrewOne");
        ns.currentPlayer = "player";
      } else {
        ns.phase = "draw";
        ns.message = gm("emptyDraw");
      }
    }
    return ns;
  }

  const chosen = aiChooseCard(playable, ns, difficulty);
  ns.aiHand = ns.aiHand.filter(c => c.id !== chosen.id);
  ns.discardPile.push(chosen);
  ns.lastPlayedCard = chosen;
  ns.consecutiveDraws = 0;
  ns.jActive = false; ns.jSuit = null;

  // ───────────────────────────────────────────────────────────────────────
  // AI plays — DEFINITIVE RULES (mirror of player)
  // ───────────────────────────────────────────────────────────────────────
  if (chosen.rank === "8") {
    const suit = aiChooseSuit(ns.aiHand, difficulty);
    ns.currentSuit = suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("cpuCrazy8", { s: suitName(suit) });
    ns.currentPlayer = "player";
  } else if (chosen.rank === "Joker") {
    ns.pendingDraw += 4;
    ns.pendingDrawType = "Joker";
    ns.pendingDrawSuit = null;
    ns.message = gm("cpuJkrDraw", { n: String(ns.pendingDraw) });
    ns.currentPlayer = "player";
  } else if (chosen.rank === "A") {
    ns.pendingDraw += 1;
    ns.pendingDrawType = "A";
    ns.pendingDrawSuit = chosen.suit;
    ns.currentSuit = chosen.suit;
    ns.message = gm("cpuPlay2", { n: String(ns.pendingDraw) });
    ns.currentPlayer = "player";
  } else if (chosen.rank === "2") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "2";
    ns.pendingDrawSuit = chosen.suit;
    ns.currentSuit = chosen.suit;
    ns.message = gm("cpuPlay2", { n: String(ns.pendingDraw) });
    ns.currentPlayer = "player";
  } else if (chosen.rank === "3") {
    ns.pendingDraw += 3;
    ns.pendingDrawType = "3";
    ns.pendingDrawSuit = chosen.suit;
    ns.currentSuit = chosen.suit;
    ns.message = gm("cpuPlay2", { n: String(ns.pendingDraw) });
    ns.currentPlayer = "player";
  } else if (chosen.rank === "J") {
    // J — player pierde turno → AI plays again
    ns.currentSuit = chosen.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("cpuPlay3");
    // currentPlayer stays "ai"
  } else if (chosen.rank === "Q") {
    ns.direction = (ns.direction === 1 ? -1 : 1) as 1 | -1;
    ns.currentSuit = chosen.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("cpuPlay10");
    // currentPlayer stays "ai" (1v1 reverse = extra turn)
  } else if (chosen.rank === "K") {
    ns.currentSuit = chosen.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("cpuPlay3");
    // currentPlayer stays "ai" (extra turn)
  } else {
    // 4, 5, 6, 7, 9, 10 — cartas normales
    ns.currentSuit = chosen.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("cpuPlayedOf", { r: chosen.rank, s: suitName(chosen.suit) });
    ns.currentPlayer = "player";
  }

  if (ns.aiHand.length === 0) {
    ns.phase = "ai_wins";
    ns.message = gm("cpuWins");
    return ns;
  }

  return ns;
}

function aiChooseCard(playable: Card[], state: GameState, difficulty: string): Card {
  if (difficulty === "easy" && Math.random() > 0.5) {
    return playable[Math.floor(Math.random() * playable.length)];
  }

  // Priority 1: defend pending draw stack (same rank or Joker)
  if (state.pendingDraw > 0) {
    const stackRank = state.pendingDrawType;
    const counters = playable.filter(c =>
      c.rank === "Joker" ||
      (stackRank === "A" && c.rank === "A") ||
      (stackRank === "2" && c.rank === "2") ||
      (stackRank === "3" && c.rank === "3")
    );
    // Prefer non-Joker defense (save Joker for later)
    const nonJokerCounters = counters.filter(c => c.rank !== "Joker");
    if (nonJokerCounters.length > 0) return nonJokerCounters[0];
    if (counters.length > 0) return counters[0];
  }

  // Priority 2: aggressive specials when difficulty is high
  // K = extra turn (always good), J = skip rival, A/2/3 = punish, Q = reverse
  if (difficulty === "hard" || difficulty === "expert") {
    const aggressives = playable.filter(c => ["K","J","Q","A","2","3"].includes(c.rank));
    if (aggressives.length > 0 && Math.random() > 0.3) {
      // Prefer K (extra turn) > A/2/3 (punish) > J (skip) > Q (reverse)
      const k = aggressives.find(c => c.rank === "K");
      if (k) return k;
      const punish = aggressives.find(c => c.rank === "3" || c.rank === "2" || c.rank === "A");
      if (punish) return punish;
      return aggressives[0];
    }
  }

  const eights = playable.filter(c => c.rank === "8" || c.rank === "Joker");
  const nonSpecial = playable.filter(c => c.rank !== "8" && c.rank !== "Joker");

  if (nonSpecial.length > 0) {
    if (difficulty === "normal" || difficulty === "easy") {
      return nonSpecial[Math.floor(Math.random() * nonSpecial.length)];
    }
    // Intermediate/hard/expert: prefer suit matching most of hand
    const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
    for (const c of state.aiHand) if (c.rank !== "Joker") suitCounts[c.suit]++;
    const sorted = [...nonSpecial].sort((a, b) => suitCounts[b.suit] - suitCounts[a.suit]);
    return sorted[0];
  }

  return eights[0];
}

function aiChooseSuit(hand: Card[], difficulty: string): Suit {
  if (difficulty === "easy" && Math.random() > 0.6) {
    return SUITS[Math.floor(Math.random() * SUITS.length)];
  }
  const counts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
  for (const c of hand) if (c.rank !== "Joker") counts[c.suit]++;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (sorted[0][0] as Suit) ?? "hearts";
}

function reshuffleDiscard(state: GameState): GameState {
  if (state.discardPile.length <= 1) return state;
  const top = state.discardPile[state.discardPile.length - 1];
  const toShuffle = state.discardPile.slice(0, -1);
  state.drawPile = shuffleDeck(toShuffle);
  state.discardPile = [top];
  return state;
}

let _engineLang = "es";
export function setEngineLang(lang: string) { _engineLang = lang; }

const SUIT_NAMES: Record<string, Record<string, string>> = {
  hearts:   { es:"Corazones",en:"Hearts",pt:"Copas",fr:"Cœurs",de:"Herz",it:"Cuori",tr:"Kupa",ru:"Червы",pl:"Kiery",nl:"Harten",sv:"Hjärter",da:"Hjerter",fi:"Hertta",no:"Hjerter",zh:"红心",ja:"ハート",ko:"하트",hi:"दिल",th:"ใจ",vi:"Cơ",id:"Hati",ar:"قلوب" },
  diamonds: { es:"Diamantes",en:"Diamonds",pt:"Ouros",fr:"Carreaux",de:"Karo",it:"Quadri",tr:"Karo",ru:"Бубны",pl:"Karo",nl:"Ruiten",sv:"Ruter",da:"Ruder",fi:"Ruutu",no:"Ruter",zh:"方块",ja:"ダイヤ",ko:"다이아",hi:"ईंट",th:"ข้าวหลามตัด",vi:"Rô",id:"Berlian",ar:"الماس" },
  clubs:    { es:"Tréboles",en:"Clubs",pt:"Paus",fr:"Trèfles",de:"Kreuz",it:"Fiori",tr:"Sinek",ru:"Трефы",pl:"Trefle",nl:"Klaveren",sv:"Klöver",da:"Klør",fi:"Risti",no:"Kløver",zh:"梅花",ja:"クラブ",ko:"클럽",hi:"क्लब",th:"โบว์",vi:"Tép",id:"Kerisik",ar:"بستاني" },
  spades:   { es:"Espadas",en:"Spades",pt:"Espadas",fr:"Piques",de:"Pik",it:"Picche",tr:"Maça",ru:"Пики",pl:"Piki",nl:"Schoppen",sv:"Spader",da:"Spar",fi:"Pata",no:"Spar",zh:"黑桃",ja:"スペード",ko:"스페이드",hi:"पान",th:"โพธิ์",vi:"Bích",id:"Sekop",ar:"بستاني أسود" },
};

const GM: Record<string, Record<string, string>> = {
  chooseSuit:     { es:"Elige un palo",en:"Choose a suit",pt:"Escolha um naipe",fr:"Choisir une couleur",de:"Farbe wählen",it:"Scegli il seme",tr:"Sembol seç",ru:"Выберите масть",pl:"Wybierz kolor",nl:"Kies kleur",sv:"Välj färg",da:"Vælg farve",fi:"Valitse väri",no:"Velg farge",zh:"选花色",ja:"スートを選ぶ",ko:"수트 선택",hi:"पत्ता चुनें",th:"เลือกตรา",vi:"Chọn chất",id:"Pilih jenis",ar:"اختر اللون" },
  chooseSuitJkr:  { es:"Elige un palo (Comodín)",en:"Choose a suit (Joker)",pt:"Escolha um naipe (Curinga)",fr:"Choisir couleur (Joker)",de:"Farbe wählen (Joker)",it:"Scegli seme (Jolly)",tr:"Sembol seç (Joker)",ru:"Выберите масть (Джокер)",pl:"Wybierz kolor (Joker)",nl:"Kies kleur (Joker)",sv:"Välj färg (Joker)",da:"Vælg farve (Joker)",fi:"Valitse väri (Jokeri)",no:"Velg farge (Joker)",zh:"选花色（百搭）",ja:"スートを選ぶ（ジョーカー）",ko:"수트 선택 (조커)",hi:"पत्ता चुनें (जोकर)",th:"เลือกตรา (โจ๊กเกอร์)",vi:"Chọn chất (Joker)",id:"Pilih jenis (Joker)",ar:"اختر اللون (جوكر)" },
  crazy8Suit:     { es:"8 Loco → Palo: {s}",en:"Crazy 8 → Suit: {s}",pt:"8 Maluco → Naipe: {s}",fr:"8 Fou → Couleur: {s}",de:"Verrückte 8 → Farbe: {s}",it:"8 Matto → Seme: {s}",tr:"Çılgın 8 → Sembol: {s}",ru:"Дикая 8 → Масть: {s}",pl:"Szalona 8 → Kolor: {s}",nl:"Gekke 8 → Kleur: {s}",sv:"Galna 8 → Färg: {s}",da:"Vilde 8 → Farve: {s}",fi:"Hullu 8 → Väri: {s}",no:"Gale 8 → Farge: {s}",zh:"疯8 → 花色: {s}",ja:"クレイジー8 → スート: {s}",ko:"크레이지 8 → 수트: {s}",hi:"क्रेजी 8 → पत्ता: {s}",th:"8บ้า → ตรา: {s}",vi:"8 Điên → Chất: {s}",id:"8 Gila → Jenis: {s}",ar:"8 المجنونة → اللون: {s}" },
  jokerSuit:      { es:"¡Comodín! → {s}",en:"Joker! → {s}",pt:"Curinga! → {s}",fr:"Joker ! → {s}",de:"Joker! → {s}",it:"Jolly! → {s}",tr:"Joker! → {s}",ru:"Джокер! → {s}",pl:"Joker! → {s}",nl:"Joker! → {s}",sv:"Joker! → {s}",da:"Joker! → {s}",fi:"Jokeri! → {s}",no:"Joker! → {s}",zh:"百搭！→ {s}",ja:"ジョーカー！→ {s}",ko:"조커! → {s}",hi:"जोकर! → {s}",th:"โจ๊กเกอร์! → {s}",vi:"Joker! → {s}",id:"Joker! → {s}",ar:"جوكر! → {s}" },
  jokerCpuDraw:   { es:"¡Comodín! Rival debe robar {n} cartas",en:"Joker! Rival must draw {n} cards",pt:"Curinga! Rival deve comprar {n} cartas",fr:"Joker ! Rival doit piocher {n} cartes",de:"Joker! Rival muss {n} Karten ziehen",it:"Jolly! Rival deve pescare {n} carte",tr:"Joker! Rival {n} kart çekmeli",ru:"Джокер! Rival должен взять {n} карт",pl:"Joker! Rival musi dobrać {n} kart",nl:"Joker! Rival moet {n} kaarten pakken",sv:"Joker! Rival måste dra {n} kort",da:"Joker! Rival skal tage {n} kort",fi:"Jokeri! Rival:n on nostettava {n} korttia",no:"Joker! Rival må trekke {n} kort",zh:"百搭！CPU必须摸{n}张牌",ja:"ジョーカー！CPUは{n}枚引く",ko:"조커! CPU가 {n}장 뽑아야 함",hi:"जोकर! Rival को {n} पत्ते लेने होंगे",th:"โจ๊กเกอร์! Rival ต้องจั่ว {n} ใบ",vi:"Joker! Rival phải rút {n} lá",id:"Joker! Rival harus ambil {n} kartu",ar:"جوكر! يجب على Rival سحب {n} بطاقات" },
  youChoseSuit:   { es:"Elegiste {s} — Turno del Rival...",en:"You chose {s} — Rival's turn...",pt:"Você escolheu {s} — Turno do Rival...",fr:"Vous avez choisi {s} — Tour du Rival...",de:"Du wähltest {s} — Rival ist dran...",it:"Hai scelto {s} — Turno del Rivale...",tr:"{s} seçtin — Rakip sırası...",ru:"Вы выбрали {s} — Ход соперника...",pl:"Wybrałeś {s} — Tura rywala...",nl:"Je koos {s} — Rival is aan de beurt...",sv:"Du valde {s} — Rivals tur...",da:"Du valgte {s} — Rivals tur...",fi:"Valitsit {s} — Vastustajan vuoro...",no:"Du valgte {s} — Rivalens tur...",zh:"你选了{s} — 对手的回合...",ja:"{s}を選んだ — ライバルのターン...",ko:"{s} 선택 — 상대방 차례...",hi:"आपने {s} चुना — प्रतिद्वंद्वी की बारी...",th:"คุณเลือก {s} — ถึงตาคู่แข่ง...",vi:"Bạn chọn {s} — Lượt của đối thủ...",id:"Kamu memilih {s} — Giliran Rival...",ar:"اخترت {s} — دور المنافس..." },
  jackRule:       { es:"J → Juega otra de {s}, figura (J/Q/K), o roba 1",en:"J → Play another {s}, figure (J/Q/K), or draw 1",pt:"J → Jogue outro de {s}, figura (J/Q/K), ou compre 1",fr:"J → Jouez un autre {s}, figure (J/Q/K), ou piochez 1",de:"J → Spiele ein {s}, Bild (J/Q/K), oder ziehe 1",it:"J → Gioca un altro {s}, figura (J/Q/K), o pesca 1",tr:"J → Başka bir {s} veya resim kartı (J/Q/K) oyna, ya da çek 1",ru:"J → Сыграй {s}, фигуру (J/Q/K) или возьми 1",pl:"J → Zagraj {s}, figurę (J/Q/K) lub dobierz 1",nl:"J → Speel een {s}, figuurkaart (J/Q/K) of pak 1",sv:"J → Spela {s}, bilden (J/Q/K) eller dra 1",da:"J → Spil et {s}, billedkort (J/Q/K) eller tag 1",fi:"J → Pelaa {s}, kuvakortti (J/Q/K) tai nosta 1",no:"J → Spill {s}, bildekort (J/Q/K) eller trekk 1",zh:"J → 出{s}牌、花牌(J/Q/K)或摸1张",ja:"J → {s}、絵札(J/Q/K)、または1枚引く",ko:"J → {s} 출력, 그림패(J/Q/K), 또는 1장 뽑기",hi:"J → {s} या फिगर (J/Q/K) खेलें, या 1 लें",th:"J → เล่น {s}, ไพ่รูป (J/Q/K) หรือจั่ว 1",vi:"J → Đánh {s}, bài hình (J/Q/K), hoặc rút 1",id:"J → Main {s}, kartu gambar (J/Q/K), atau ambil 1",ar:"J → العب {s}، ورقة شخصية (J/Q/K)، أو اسحب 1" },
  cpuPlayed:      { es:"Rival jugó {r} → {s}",en:"Rival played {r} → {s}",pt:"Rival jogou {r} → {s}",fr:"Rival a joué {r} → {s}",de:"Rival spielte {r} → {s}",it:"Rival ha giocato {r} → {s}",tr:"Rival {r} → {s} oynadı",ru:"Rival сыграл {r} → {s}",pl:"Rival zagrał {r} → {s}",nl:"Rival speelde {r} → {s}",sv:"Rival spelade {r} → {s}",da:"Rival spillede {r} → {s}",fi:"Rival pelasi {r} → {s}",no:"Rival spilte {r} → {s}",zh:"CPU出了{r} → {s}",ja:"CPUが{r}を出した → {s}",ko:"CPU가 {r} → {s} 플레이",hi:"Rival ने {r} → {s} खेला",th:"Rival เล่น {r} → {s}",vi:"Rival đánh {r} → {s}",id:"Rival main {r} → {s}",ar:"Rival لعب {r} → {s}" },
  cpuPlayedOf:    { es:"Rival jugó {r} de {s}",en:"Rival played {r} of {s}",pt:"Rival jogou {r} de {s}",fr:"Rival a joué {r} de {s}",de:"Rival spielte {r} von {s}",it:"Rival ha giocato {r} di {s}",tr:"Rival {s} {r} oynadı",ru:"Rival сыграл {r} масти {s}",pl:"Rival zagrał {r} koloru {s}",nl:"Rival speelde {r} van {s}",sv:"Rival spelade {r} av {s}",da:"Rival spillede {r} af {s}",fi:"Rival pelasi {r}/{s}",no:"Rival spilte {r} av {s}",zh:"CPU出了{s}的{r}",ja:"CPUが{s}の{r}を出した",ko:"CPU가 {s}의 {r} 플레이",hi:"Rival ने {s} का {r} खेला",th:"Rival เล่น {r} ของ {s}",vi:"Rival đánh {r} của {s}",id:"Rival main {r} dari {s}",ar:"Rival لعب {r} من {s}" },
  cpuCrazy8:      { es:"Rival jugó 8 Loco → {s}",en:"Rival played Crazy 8 → {s}",pt:"Rival jogou 8 Maluco → {s}",fr:"Rival a joué 8 Fou → {s}",de:"Rival spielte Verrückte 8 → {s}",it:"Rival ha giocato 8 Matto → {s}",tr:"Rival Çılgın 8 → {s} oynadı",ru:"Rival сыграл Дикую 8 → {s}",pl:"Rival zagrał Szaloną 8 → {s}",nl:"Rival speelde Gekke 8 → {s}",sv:"Rival spelade Galna 8 → {s}",da:"Rival spillede Vilde 8 → {s}",fi:"Rival pelasi Hullu 8 → {s}",no:"Rival spilte Gale 8 → {s}",zh:"CPU出了疯8 → {s}",ja:"CPUがクレイジー8を出した → {s}",ko:"CPU가 크레이지 8 → {s} 플레이",hi:"Rival ने क्रेजी 8 → {s} खेला",th:"Rival เล่น 8บ้า → {s}",vi:"Rival đánh 8 Điên → {s}",id:"Rival main 8 Gila → {s}",ar:"Rival لعب 8 المجنونة → {s}" },
  cpuJkrDraw:     { es:"Rival jugó Comodín → Robas {n} cartas",en:"Rival played Joker → Draw {n} cards",pt:"Rival jogou Curinga → Você compra {n} cartas",fr:"Rival a joué Joker → Piochez {n} cartes",de:"Rival spielte Joker → Ziehe {n} Karten",it:"Rival ha giocato Jolly → Pesca {n} carte",tr:"Rival Joker oynadı → {n} kart çek",ru:"Rival сыграл Джокера → Возьми {n} карт",pl:"Rival zagrał Jokera → Dobierz {n} kart",nl:"Rival speelde Joker → Trek {n} kaarten",sv:"Rival spelade Joker → Dra {n} kort",da:"Rival spillede Joker → Tag {n} kort",fi:"Rival pelasi Jokerin → Nosta {n} korttia",no:"Rival spilte Joker → Trekk {n} kort",zh:"CPU出了百搭 → 你摸{n}张牌",ja:"CPUがジョーカーを出した → {n}枚引く",ko:"CPU가 조커 → {n}장 뽑기",hi:"Rival ने जोकर खेला → {n} पत्ते लो",th:"Rival เล่นโจ๊กเกอร์ → จั่ว {n} ใบ",vi:"Rival đánh Joker → Rút {n} lá",id:"Rival main Joker → Ambil {n} kartu",ar:"Rival لعب الجوكر → اسحب {n} بطاقات" },
  cpuJkrSuit:     { es:"Rival jugó Comodín → {s}",en:"Rival played Joker → {s}",pt:"Rival jogou Curinga → {s}",fr:"Rival a joué Joker → {s}",de:"Rival spielte Joker → {s}",it:"Rival ha giocato Jolly → {s}",tr:"Rival Joker oynadı → {s}",ru:"Rival сыграл Джокера → {s}",pl:"Rival zagrał Jokera → {s}",nl:"Rival speelde Joker → {s}",sv:"Rival spelade Joker → {s}",da:"Rival spillede Joker → {s}",fi:"Rival pelasi Jokerin → {s}",no:"Rival spilte Joker → {s}",zh:"CPU出了百搭 → {s}",ja:"CPUがジョーカー → {s}",ko:"CPU가 조커 → {s}",hi:"Rival ने जोकर खेला → {s}",th:"Rival เล่นโจ๊กเกอร์ → {s}",vi:"Rival đánh Joker → {s}",id:"Rival main Joker → {s}",ar:"Rival لعب الجوكر → {s}" },
  cpuPlay2:       { es:"Rival jugó 2 → Robas {n} cartas (o defiende)",en:"Rival played 2 → Draw {n} cards (or defend)",pt:"Rival jogou 2 → Você compra {n} cartas (ou defende)",fr:"Rival a joué 2 → Piochez {n} cartes (ou défendez)",de:"Rival spielte 2 → Ziehe {n} Karten (oder verteidige)",it:"Rival ha giocato 2 → Pesca {n} carte (o difendi)",tr:"Rival 2 oynadı → {n} kart çek (ya da savun)",ru:"Rival сыграл 2 → Возьми {n} карт (или защищайся)",pl:"Rival zagrał 2 → Dobierz {n} kart (lub bronij się)",nl:"Rival speelde 2 → Trek {n} kaarten (of verdedig)",sv:"Rival spelade 2 → Dra {n} kort (eller försvara)",da:"Rival spillede 2 → Tag {n} kort (eller forsvar dig)",fi:"Rival pelasi 2 → Nosta {n} korttia (tai puolusta)",no:"Rival spilte 2 → Trekk {n} kort (eller forsvar deg)",zh:"CPU出了2 → 你摸{n}张(或防守)",ja:"CPUが2を出した → {n}枚引く（または防御）",ko:"CPU가 2 → {n}장 뽑기 (또는 방어)",hi:"Rival ने 2 खेला → {n} पत्ते लो (या बचाव करो)",th:"Rival เล่น 2 → จั่ว {n} ใบ (หรือป้องกัน)",vi:"Rival đánh 2 → Rút {n} lá (hoặc phòng thủ)",id:"Rival main 2 → Ambil {n} kartu (atau bertahan)",ar:"Rival لعب 2 → اسحب {n} بطاقات (أو دافع)" },
  cpuAce:         { es:"Rival jugó As — ¡Robo cancelado!",en:"Rival played Ace — Draw cancelled!",pt:"Rival jogou Ás — Compra cancelada!",fr:"Rival a joué As — Pioche annulée !",de:"Rival spielte Ass — Ziehen abgebrochen!",it:"Rival ha giocato Asso — Pesca annullata!",tr:"Rival As oynadı — Çekme iptal!",ru:"Rival сыграл Туза — Добор отменён!",pl:"Rival zagrał Asa — Dobieranie anulowane!",nl:"Rival speelde Aas — Trek geannuleerd!",sv:"Rival spelade Ess — Drag avbrutet!",da:"Rival spillede Es — Trækning annulleret!",fi:"Rival pelasi Ässän — Nosto peruutettu!",no:"Rival spilte Ess — Trekk kansellert!",zh:"CPU出了A — 摸牌取消！",ja:"CPUがAを出した — 引くのキャンセル！",ko:"CPU가 에이스 → 드로우 취소!",hi:"Rival ने ए खेला — ड्रॉ रद्द!",th:"Rival เล่น A — ยกเลิกการจั่ว!",vi:"Rival đánh A — Hủy rút bài!",id:"Rival main As — Ambil dibatalkan!",ar:"Rival لعب الآس — السحب ملغى!" },
  cpuPlay3:       { es:"Rival jugó 3 → ¡Pierdes tu turno!",en:"Rival played 3 → You lose your turn!",pt:"Rival jogou 3 → Você perde a vez!",fr:"Rival a joué 3 → Vous perdez votre tour !",de:"Rival spielte 3 → Du verlierst deinen Zug!",it:"Rival ha giocato 3 → Perdi il tuo turno!",tr:"Rival 3 oynadı → Sıranı kaybedersin!",ru:"Rival сыграл 3 → Ты пропускаешь ход!",pl:"Rival zagrał 3 → Tracisz turę!",nl:"Rival speelde 3 → Je verliest je beurt!",sv:"Rival spelade 3 → Du förlorar din tur!",da:"Rival spillede 3 → Du mister din tur!",fi:"Rival pelasi 3 → Menetät vuorosi!",no:"Rival spilte 3 → Du mister turen din!",zh:"CPU出了3 → 你失去一回合！",ja:"CPUが3を出した → あなたはターンをスキップ！",ko:"CPU가 3 → 당신의 턴 잃기!",hi:"Rival ने 3 खेला → आपकी बारी छूट गई!",th:"Rival เล่น 3 → คุณเสียตาเดิน!",vi:"Rival đánh 3 → Bạn mất lượt!",id:"Rival main 3 → Kamu kehilangan giliran!",ar:"Rival لعب 3 → تخسر دورك!" },
  cpuPlay7:       { es:"Rival jugó 7 → Robas {n} cartas (o defiende)",en:"Rival played 7 → Draw {n} cards (or defend)",pt:"Rival jogou 7 → Você compra {n} cartas (ou defende)",fr:"Rival a joué 7 → Piochez {n} cartes (ou défendez)",de:"Rival spielte 7 → Ziehe {n} Karten (oder verteidige)",it:"Rival ha giocato 7 → Pesca {n} carte (o difendi)",tr:"Rival 7 oynadı → {n} kart çek (ya da savun)",ru:"Rival сыграл 7 → Возьми {n} карт (или защищайся)",pl:"Rival zagrał 7 → Dobierz {n} kart (lub bronij się)",nl:"Rival speelde 7 → Trek {n} kaarten (of verdedig)",sv:"Rival spelade 7 → Dra {n} kort (eller försvara)",da:"Rival spillede 7 → Tag {n} kort (eller forsvar dig)",fi:"Rival pelasi 7 → Nosta {n} korttia (tai puolusta)",no:"Rival spilte 7 → Trekk {n} kort (eller forsvar deg)",zh:"CPU出了7 → 你摸{n}张(或防守)",ja:"CPUが7を出した → {n}枚引く（または防御）",ko:"CPU가 7 → {n}장 뽑기 (또는 방어)",hi:"Rival ने 7 खेला → {n} पत्ते लो (या बचाव करो)",th:"Rival เล่น 7 → จั่ว {n} ใบ (หรือป้องกัน)",vi:"Rival đánh 7 → Rút {n} lá (hoặc phòng thủ)",id:"Rival main 7 → Ambil {n} kartu (atau bertahan)",ar:"Rival لعب 7 → اسحب {n} بطاقات (أو دافع)" },
  cpuPlay10:      { es:"Rival jugó 10 → ¡Dirección invertida! Rival juega de nuevo",en:"Rival played 10 → Direction reversed! Rival plays again",pt:"Rival jogou 10 → Direção invertida! Rival joga de novo",fr:"Rival a joué 10 → Direction inversée ! Rival rejoue",de:"Rival spielte 10 → Richtung umgekehrt! Rival spielt nochmal",it:"Rival ha giocato 10 → Direzione invertita! Rival gioca ancora",tr:"Rival 10 oynadı → Yön tersine döndü! Rival tekrar oynuyor",ru:"Rival сыграл 10 → Направление изменено! Rival ходит снова",pl:"Rival zagrał 10 → Kierunek odwrócony! Rival gra ponownie",nl:"Rival speelde 10 → Richting omgekeerd! Rival speelt opnieuw",sv:"Rival spelade 10 → Riktning omvänd! Rival spelar igen",da:"Rival spillede 10 → Retning vendt! Rival spiller igen",fi:"Rival pelasi 10 → Suunta kääntyi! Rival pelaa uudelleen",no:"Rival spilte 10 → Retning snudd! Rival spiller igjen",zh:"CPU出了10 → 方向反转！CPU再出一张",ja:"CPUが10を出した → 方向逆転！CPUがもう一度",ko:"CPU가 10 → 방향 역전! Rival 다시 플레이",hi:"Rival ने 10 खेला → दिशा पलटी! Rival फिर खेलेगा",th:"Rival เล่น 10 → ทิศทางกลับ! Rival เล่นอีกครั้ง",vi:"Rival đánh 10 → Đảo chiều! Rival đánh lại",id:"Rival main 10 → Arah terbalik! Rival main lagi",ar:"Rival لعب 10 → الاتجاه عكسي! Rival يلعب مجدداً" },
  cpuJackFollow:  { es:"Rival jugó J → {r} de {s}",en:"Rival played J → {r} of {s}",pt:"Rival jogou J → {r} de {s}",fr:"Rival a joué J → {r} de {s}",de:"Rival spielte J → {r} von {s}",it:"Rival ha giocato J → {r} di {s}",tr:"Rival J oynadı → {s} {r}",ru:"Rival сыграл J → {r} масти {s}",pl:"Rival zagrał J → {r} koloru {s}",nl:"Rival speelde J → {r} van {s}",sv:"Rival spelade J → {r} av {s}",da:"Rival spillede J → {r} af {s}",fi:"Rival pelasi J → {r}/{s}",no:"Rival spilte J → {r} av {s}",zh:"CPU出了J → {s}的{r}",ja:"CPUがJを出した → {s}の{r}",ko:"CPU가 J → {s}의 {r}",hi:"Rival ने J खेला → {s} का {r}",th:"Rival เล่น J → {r} ของ {s}",vi:"Rival đánh J → {r} của {s}",id:"Rival main J → {r} dari {s}",ar:"Rival لعب J → {r} من {s}" },
  player3skip:    { es:"3 → Rival pierde su turno. ¡Juegas de nuevo!",en:"3 → Rival loses their turn. Play again!",pt:"3 → Rival perde a vez. Jogue de novo!",fr:"3 → Rival perd son tour. Rejouez !",de:"3 → Rival verliert seinen Zug. Nochmal spielen!",it:"3 → Rivale perde il turno. Gioca ancora!",tr:"3 → Rakip sırasını kaybetti. Tekrar oyna!",ru:"3 → Соперник пропускает ход. Играй снова!",pl:"3 → Rywal traci turę. Graj ponownie!",nl:"3 → Rival verliest zijn beurt. Speel opnieuw!",sv:"3 → Rival förlorar sin tur. Spela igen!",da:"3 → Rival mister sin tur. Spil igen!",fi:"3 → Vastustaja menettää vuoronsa. Pelaa uudelleen!",no:"3 → Rival mister turen. Spill igjen!",zh:"3 → 对手失去回合，你再出一张！",ja:"3 → ライバルがターンをスキップ。もう一度！",ko:"3 → 상대방이 턴 잃기. 다시 플레이!",hi:"3 → प्रतिद्वंद्वी की बारी छूटी। फिर खेलें!",th:"3 → คู่แข่งเสียตาเดิน เล่นอีกครั้ง!",vi:"3 → Đối thủ mất lượt. Chơi lại!",id:"3 → Rival kehilangan giliran. Main lagi!",ar:"3 → المنافس يخسر دوره. العب مجدداً!" },
  playerAceCancel:{ es:"¡As! Robo cancelado — Turno del Rival",en:"Ace! Draw cancelled — Rival's turn",pt:"Ás! Compra cancelada — Vez do Rival",fr:"As ! Pioche annulée — Tour du Rival",de:"Ass! Ziehen abgebrochen — Rival ist dran",it:"Asso! Pesca annullata — Turno del Rivale",tr:"As! Çekme iptal — Rakip sırası",ru:"Туз! Добор отменён — Ход соперника",pl:"As! Dobieranie anulowane — Tura rywala",nl:"Aas! Trek geannuleerd — Rival is aan de beurt",sv:"Ess! Drag avbrutet — Rivals tur",da:"Es! Trækning annulleret — Rivals tur",fi:"Ässä! Nosto peruutettu — Vastustajan vuoro",no:"Ess! Trekk kansellert — Rivalens tur",zh:"A！摸牌取消 — 对手的回合",ja:"エース！引くのキャンセル — ライバルのターン",ko:"에이스! 드로우 취소 — 상대방 차례",hi:"ए! ड्रॉ रद्द — प्रतिद्वंद्वी की बारी",th:"A! ยกเลิกการจั่ว — ถึงตาคู่แข่ง",vi:"A! Hủy rút bài — Lượt của đối thủ",id:"As! Ambil dibatalkan — Giliran Rival",ar:"آس! السحب ملغى — دور المنافس" },
  player10reverse:{ es:"10 → ¡Dirección invertida! Juegas de nuevo",en:"10 → Direction reversed! You play again",pt:"10 → Direção invertida! Jogue de novo",fr:"10 → Direction inversée ! Rejouez",de:"10 → Richtung umgekehrt! Du spielst nochmal",it:"10 → Direzione invertita! Gioca di nuovo",tr:"10 → Yön tersine döndü! Tekrar oyna",ru:"10 → Направление изменено! Играй снова",pl:"10 → Kierunek odwrócony! Graj ponownie",nl:"10 → Richting omgekeerd! Speel opnieuw",sv:"10 → Riktning omvänd! Spela igen",da:"10 → Retning vendt! Spil igen",fi:"10 → Suunta kääntyi! Pelaa uudelleen",no:"10 → Retning snudd! Spill igjen",zh:"10 → 方向反转！你再出一张",ja:"10 → 方向逆転！もう一度プレイ",ko:"10 → 방향 역전! 다시 플레이",hi:"10 → दिशा पलटी! फिर खेलें",th:"10 → ทิศทางกลับ! เล่นอีกครั้ง",vi:"10 → Đảo chiều! Chơi lại",id:"10 → Arah terbalik! Main lagi",ar:"10 → الاتجاه عكسي! العب مجدداً" },
  cpuTurn:        { es:"Turno del Rival...",en:"Rival's turn...",pt:"Vez do Rival...",fr:"Tour du Rival...",de:"Rival ist dran...",it:"Turno del Rivale...",tr:"Rakip sırası...",ru:"Ход соперника...",pl:"Tura rywala...",nl:"Rival is aan de beurt...",sv:"Rivals tur...",da:"Rivals tur...",fi:"Vastustajan vuoro...",no:"Rivalens tur...",zh:"对手的回合...",ja:"ライバルのターン...",ko:"상대방 차례...",hi:"प्रतिद्वंद्वी की बारी...",th:"ถึงตาคู่แข่ง...",vi:"Lượt của đối thủ...",id:"Giliran Rival...",ar:"دور المنافس..." },
  playerWins:     { es:"¡Ganaste! ¡Increíble!",en:"You won! Incredible!",pt:"Você ganhou! Incrível!",fr:"Tu as gagné ! Incroyable !",de:"Du hast gewonnen! Unglaublich!",it:"Hai vinto! Incredibile!",tr:"Kazandın! İnanılmaz!",ru:"Вы победили! Невероятно!",pl:"Wygrałeś! Niesamowite!",nl:"Je hebt gewonnen! Ongelooflijk!",sv:"Du vann! Otroligt!",da:"Du vandt! Utroligt!",fi:"Voitit! Uskomaton!",no:"Du vant! Utrolig!",zh:"你赢了！难以置信！",ja:"勝利！すごい！",ko:"이겼습니다! 믿을 수 없어요!",hi:"आप जीत गए! अविश्वसनीय!",th:"คุณชนะ! น่าทึ่งมาก!",vi:"Bạn thắng! Tuyệt vời!",id:"Kamu menang! Luar biasa!",ar:"لقد فزت! لا يصدق!" },
  cpuWins:        { es:"¡El Rival ganó!",en:"Rival wins!",pt:"O Rival ganhou!",fr:"Le Rival a gagné !",de:"Rival gewinnt!",it:"Il Rival ha vinto!",tr:"Rival kazandı!",ru:"Rival победил!",pl:"Rival wygrał!",nl:"Rival wint!",sv:"Rival vann!",da:"Rival vandt!",fi:"Rival voitti!",no:"Rival vant!",zh:"CPU赢了！",ja:"CPUが勝利！",ko:"CPU가 이겼습니다!",hi:"Rival जीत गया!",th:"Rival ชนะ!",vi:"Rival thắng!",id:"Rival menang!",ar:"فاز Rival!" },
  noCards:        { es:"Sin cartas — Turno del Rival",en:"No cards — Rival's turn",pt:"Sem cartas — Vez do Rival",fr:"Pas de cartes — Tour du Rival",de:"Keine Karten — Rival ist dran",it:"Nessuna carta — Turno del Rivale",tr:"Kart yok — Rakip sırası",ru:"Нет карт — Ход соперника",pl:"Brak kart — Tura rywala",nl:"Geen kaarten — Rival is aan de beurt",sv:"Inga kort — Rivals tur",da:"Ingen kort — Rivals tur",fi:"Ei kortteja — Vastustajan vuoro",no:"Ingen kort — Rivalens tur",zh:"无牌 — 对手的回合",ja:"カードなし — ライバルのターン",ko:"카드 없음 — 상대방 차례",hi:"कोई कार्ड नहीं — प्रतिद्वंद्वी की बारी",th:"ไม่มีไพ่ — ถึงตาคู่แข่ง",vi:"Không có bài — Lượt của đối thủ",id:"Tidak ada kartu — Giliran Rival",ar:"لا بطاقات — دور المنافس" },
  drewCard:       { es:"Robaste una carta (puedes jugarla)",en:"You drew a card (you can play it)",pt:"Você comprou uma carta (pode jogá-la)",fr:"Vous avez pioché une carte (vous pouvez la jouer)",de:"Du hast eine Karte gezogen (du kannst sie spielen)",it:"Hai pescato una carta (puoi giocarla)",tr:"Bir kart çektin (oynayabilirsin)",ru:"Вы взяли карту (можете её сыграть)",pl:"Dobrałeś kartę (możesz ją zagrać)",nl:"Je hebt een kaart getrokken (je kunt hem spelen)",sv:"Du drog ett kort (du kan spela det)",da:"Du trak et kort (du kan spille det)",fi:"Nostit kortin (voit pelata sen)",no:"Du trakk et kort (du kan spille det)",zh:"你摸了一张牌（可以打出）",ja:"1枚引いた（プレイ可能）",ko:"카드 뽑음 (플레이 가능)",hi:"आपने एक पत्ता लिया (खेल सकते हैं)",th:"คุณจั่ว 1 ใบ (สามารถเล่นได้)",vi:"Bạn rút 1 lá (có thể đánh)",id:"Kamu ambil 1 kartu (bisa dimainkan)",ar:"سحبت بطاقة (يمكنك لعبها)" },
  noPlay:         { es:"Sin jugada — Turno del Rival",en:"No play — Rival's turn",pt:"Sem jogada — Vez do Rival",fr:"Pas de jeu — Tour du Rival",de:"Kein Zug — Rival ist dran",it:"Nessuna mossa — Turno del Rivale",tr:"Hamle yok — Rakip sırası",ru:"Нет хода — Ход соперника",pl:"Brak ruchu — Tura rywala",nl:"Geen zet — Rival is aan de beurt",sv:"Inget drag — Rivals tur",da:"Intet træk — Rivals tur",fi:"Ei siirtoa — Vastustajan vuoro",no:"Ingen trekk — Rivalens tur",zh:"无法出牌 — 对手的回合",ja:"プレイ不可 — ライバルのターン",ko:"플레이 없음 — 상대방 차례",hi:"कोई चाल नहीं — प्रतिद्वंद्वी की बारी",th:"ไม่มีการเล่น — ถึงตาคู่แข่ง",vi:"Không có nước đi — Lượt của đối thủ",id:"Tidak ada langkah — Giliran Rival",ar:"لا خطوة — دور المنافس" },
  cpuDrewN:       { es:"Rival robó {n} cartas",en:"Rival drew {n} cards",pt:"Rival comprou {n} cartas",fr:"Rival a pioché {n} cartes",de:"Rival zog {n} Karten",it:"Rival ha pescato {n} carte",tr:"Rival {n} kart çekti",ru:"Rival взял {n} карт",pl:"Rival dobrał {n} kart",nl:"Rival trok {n} kaarten",sv:"Rival drog {n} kort",da:"Rival trak {n} kort",fi:"Rival nosti {n} korttia",no:"Rival trakk {n} kort",zh:"CPU摸了{n}张牌",ja:"CPUが{n}枚引いた",ko:"CPU가 {n}장 뽑음",hi:"Rival ने {n} पत्ते लिए",th:"Rival จั่ว {n} ใบ",vi:"Rival rút {n} lá",id:"Rival ambil {n} kartu",ar:"Rival سحب {n} بطاقات" },
  cpuDrewOne:     { es:"Rival robó una carta",en:"Rival drew a card",pt:"Rival comprou uma carta",fr:"Rival a pioché une carte",de:"Rival zog eine Karte",it:"Rival ha pescato una carta",tr:"Rival bir kart çekti",ru:"Rival взял карту",pl:"Rival dobrał kartę",nl:"Rival trok een kaart",sv:"Rival drog ett kort",da:"Rival trak et kort",fi:"Rival nosti kortin",no:"Rival trakk ett kort",zh:"CPU摸了一张牌",ja:"CPUが1枚引いた",ko:"CPU가 1장 뽑음",hi:"Rival ने एक पत्ता लिया",th:"Rival จั่ว 1 ใบ",vi:"Rival rút 1 lá",id:"Rival ambil 1 kartu",ar:"Rival سحب بطاقة واحدة" },
  emptyDraw:      { es:"¡Sin cartas! Empate",en:"No cards left! Draw!",pt:"Sem cartas! Empate!",fr:"Plus de cartes ! Égalité !",de:"Keine Karten! Unentschieden!",it:"Nessuna carta! Pareggio!",tr:"Kart kalmadı! Beraberlik!",ru:"Нет карт! Ничья!",pl:"Brak kart! Remis!",nl:"Geen kaarten! Gelijkspel!",sv:"Inga kort! Oavgjort!",da:"Ingen kort! Uafgjort!",fi:"Ei kortteja! Tasapeli!",no:"Ingen kort! Uavgjort!",zh:"无牌可用！平局！",ja:"カードなし！引き分け！",ko:"카드 없음! 무승부!",hi:"कोई कार्ड नहीं! ड्रॉ!",th:"ไม่มีไพ่! เสมอ!",vi:"Hết bài! Hòa!",id:"Tidak ada kartu! Seri!",ar:"لا بطاقات! تعادل!" },
  cpuJ1Draw:      { es:"Rival robó 1 carta",en:"Rival drew 1 card",pt:"Rival comprou 1 carta",fr:"Rival a pioché 1 carte",de:"Rival zog 1 Karte",it:"Rival ha pescato 1 carta",tr:"Rival 1 kart çekti",ru:"Rival взял 1 карту",pl:"Rival dobrał 1 kartę",nl:"Rival trok 1 kaart",sv:"Rival drog 1 kort",da:"Rival trak 1 kort",fi:"Rival nosti 1 kortin",no:"Rival trakk 1 kort",zh:"CPU摸了1张牌",ja:"CPUが1枚引いた",ko:"CPU가 1장 뽑음",hi:"Rival ने 1 पत्ता लिया",th:"Rival จั่ว 1 ใบ",vi:"Rival rút 1 lá",id:"Rival ambil 1 kartu",ar:"Rival سحب بطاقة واحدة" },
  cpuJackDraw:    { es:"Rival jugó J → robó 1 carta",en:"Rival played J → drew 1 card",pt:"Rival jogou J → comprou 1 carta",fr:"Rival a joué J → a pioché 1 carte",de:"Rival spielte J → zog 1 Karte",it:"Rival ha giocato J → ha pescato 1 carta",tr:"Rival J oynadı → 1 kart çekti",ru:"Rival сыграл J → взял 1 карту",pl:"Rival zagrał J → dobrał 1 kartę",nl:"Rival speelde J → trok 1 kaart",sv:"Rival spelade J → drog 1 kort",da:"Rival spillede J → trak 1 kort",fi:"Rival pelasi J → nosti 1 kortin",no:"Rival spilte J → trakk 1 kort",zh:"CPU出了J → 摸了1张牌",ja:"CPUがJを出した → 1枚引いた",ko:"CPU가 J → 1장 뽑음",hi:"Rival ने J खेला → 1 पत्ता लिया",th:"Rival เล่น J → จั่ว 1 ใบ",vi:"Rival đánh J → rút 1 lá",id:"Rival main J → ambil 1 kartu",ar:"Rival لعب J → سحب بطاقة واحدة" },
  mp8Suit:        { es:"8 Loco → {s}",en:"Crazy 8 → {s}",pt:"8 Maluco → {s}",fr:"8 Fou → {s}",de:"Verrückte 8 → {s}",it:"8 Matto → {s}",tr:"Çılgın 8 → {s}",ru:"Дикая 8 → {s}",pl:"Szalona 8 → {s}",nl:"Gekke 8 → {s}",sv:"Galna 8 → {s}",da:"Vilde 8 → {s}",fi:"Hullu 8 → {s}",no:"Gale 8 → {s}",zh:"疯8 → {s}",ja:"クレイジー8 → {s}",ko:"크레이지 8 → {s}",hi:"क्रेजी 8 → {s}",th:"8บ้า → {s}",vi:"8 Điên → {s}",id:"8 Gila → {s}",ar:"8 المجنونة → {s}" },
  mpJkrSuit:      { es:"Comodín → {s}",en:"Joker → {s}",pt:"Curinga → {s}",fr:"Joker → {s}",de:"Joker → {s}",it:"Jolly → {s}",tr:"Joker → {s}",ru:"Джокер → {s}",pl:"Joker → {s}",nl:"Joker → {s}",sv:"Joker → {s}",da:"Joker → {s}",fi:"Jokeri → {s}",no:"Joker → {s}",zh:"百搭 → {s}",ja:"ジョーカー → {s}",ko:"조커 → {s}",hi:"जोकर → {s}",th:"โจ๊กเกอร์ → {s}",vi:"Joker → {s}",id:"Joker → {s}",ar:"جوكر → {s}" },
  mpJkrDraw:      { es:"Comodín → {p} roba {n}",en:"Joker → {p} draws {n}",pt:"Curinga → {p} compra {n}",fr:"Joker → {p} pioche {n}",de:"Joker → {p} zieht {n}",it:"Jolly → {p} pesca {n}",tr:"Joker → {p} {n} kart çeker",ru:"Джокер → {p} берёт {n}",pl:"Joker → {p} dobiera {n}",nl:"Joker → {p} trekt {n}",sv:"Joker → {p} drar {n}",da:"Joker → {p} trækker {n}",fi:"Jokeri → {p} nostaa {n}",no:"Joker → {p} trekker {n}",zh:"百搭 → {p}摸{n}张",ja:"ジョーカー → {p}が{n}枚引く",ko:"조커 → {p}가 {n}장 뽑기",hi:"जोकर → {p} {n} पत्ते लेता है",th:"โจ๊กเกอร์ → {p} จั่ว {n}",vi:"Joker → {p} rút {n}",id:"Joker → {p} ambil {n}",ar:"جوكر → {p} يسحب {n}" },
  mpWon:          { es:"¡{p} ganó!",en:"{p} won!",pt:"{p} ganhou!",fr:"{p} a gagné !",de:"{p} gewann!",it:"{p} ha vinto!",tr:"{p} kazandı!",ru:"{p} победил!",pl:"{p} wygrał!",nl:"{p} won!",sv:"{p} vann!",da:"{p} vandt!",fi:"{p} voitti!",no:"{p} vant!",zh:"{p}赢了！",ja:"{p}が勝利！",ko:"{p} 승리!",hi:"{p} जीत गया!",th:"{p} ชนะ!",vi:"{p} thắng!",id:"{p} menang!",ar:"{p} فاز!" },
  mpPlus2Draw:    { es:"+2 → {p} roba {n}",en:"+2 → {p} draws {n}",pt:"+2 → {p} compra {n}",fr:"+2 → {p} pioche {n}",de:"+2 → {p} zieht {n}",it:"+2 → {p} pesca {n}",tr:"+2 → {p} {n} kart çeker",ru:"+2 → {p} берёт {n}",pl:"+2 → {p} dobiera {n}",nl:"+2 → {p} trekt {n}",sv:"+2 → {p} drar {n}",da:"+2 → {p} trækker {n}",fi:"+2 → {p} nostaa {n}",no:"+2 → {p} trekker {n}",zh:"+2 → {p}摸{n}张",ja:"+2 → {p}が{n}枚引く",ko:"+2 → {p}가 {n}장 뽑기",hi:"+2 → {p} {n} पत्ते लेता है",th:"+2 → {p} จั่ว {n}",vi:"+2 → {p} rút {n}",id:"+2 → {p} ambil {n}",ar:"+2 → {p} يسحب {n}" },
  mpAceCancel:    { es:"As → Robo cancelado",en:"Ace → Draw cancelled",pt:"Ás → Compra cancelada",fr:"As → Pioche annulée",de:"Ass → Ziehen abgebrochen",it:"Asso → Pesca annullata",tr:"As → Çekme iptal",ru:"Туз → Добор отменён",pl:"As → Dobieranie anulowane",nl:"Aas → Trek geannuleerd",sv:"Ess → Drag avbrutet",da:"Es → Trækning annulleret",fi:"Ässä → Nosto peruutettu",no:"Ess → Trekk kansellert",zh:"A → 摸牌取消",ja:"エース → 引くのキャンセル",ko:"에이스 → 드로우 취소",hi:"ए → ड्रॉ रद्द",th:"A → ยกเลิกการจั่ว",vi:"A → Hủy rút bài",id:"As → Ambil dibatalkan",ar:"آس → السحب ملغى" },
  mp3SkipYou:     { es:"3 → {p} pierde turno. ¡Juegas de nuevo!",en:"3 → {p} loses turn. Play again!",pt:"3 → {p} perde a vez. Jogue de novo!",fr:"3 → {p} perd son tour. Rejouez !",de:"3 → {p} verliert Zug. Nochmal spielen!",it:"3 → {p} perde il turno. Gioca ancora!",tr:"3 → {p} sırasını kaybetti. Tekrar oyna!",ru:"3 → {p} пропускает ход. Играй снова!",pl:"3 → {p} traci turę. Graj ponownie!",nl:"3 → {p} verliest beurt. Speel opnieuw!",sv:"3 → {p} förlorar tur. Spela igen!",da:"3 → {p} mister tur. Spil igen!",fi:"3 → {p} menettää vuoron. Pelaa uudelleen!",no:"3 → {p} mister tur. Spill igjen!",zh:"3 → {p}失去回合，你再出牌！",ja:"3 → {p}がターンをスキップ。もう一度！",ko:"3 → {p}가 턴 잃기. 다시 플레이!",hi:"3 → {p} की बारी छूटी। फिर खेलें!",th:"3 → {p} เสียตาเดิน เล่นอีกครั้ง!",vi:"3 → {p} mất lượt. Chơi lại!",id:"3 → {p} kehilangan giliran. Main lagi!",ar:"3 → {p} يخسر دوره. العب مجدداً!" },
  mp3SkipOther:   { es:"3 → {p} pierde turno",en:"3 → {p} loses turn",pt:"3 → {p} perde a vez",fr:"3 → {p} perd son tour",de:"3 → {p} verliert Zug",it:"3 → {p} perde il turno",tr:"3 → {p} sırasını kaybetti",ru:"3 → {p} пропускает ход",pl:"3 → {p} traci turę",nl:"3 → {p} verliest beurt",sv:"3 → {p} förlorar tur",da:"3 → {p} mister tur",fi:"3 → {p} menettää vuoron",no:"3 → {p} mister tur",zh:"3 → {p}失去回合",ja:"3 → {p}がターンをスキップ",ko:"3 → {p}가 턴 잃기",hi:"3 → {p} की बारी छूटी",th:"3 → {p} เสียตาเดิน",vi:"3 → {p} mất lượt",id:"3 → {p} kehilangan giliran",ar:"3 → {p} يخسر دوره" },
  mp10RevYou:     { es:"10 → ¡Dirección invertida! Juegas de nuevo",en:"10 → Direction reversed! Play again",pt:"10 → Direção invertida! Jogue de novo",fr:"10 → Direction inversée ! Rejouez",de:"10 → Richtung umgekehrt! Nochmal spielen",it:"10 → Direzione invertita! Gioca ancora",tr:"10 → Yön tersine döndü! Tekrar oyna",ru:"10 → Направление изменено! Играй снова",pl:"10 → Kierunek odwrócony! Graj ponownie",nl:"10 → Richting omgekeerd! Speel opnieuw",sv:"10 → Riktning omvänd! Spela igen",da:"10 → Retning vendt! Spil igen",fi:"10 → Suunta kääntyi! Pelaa uudelleen",no:"10 → Retning snudd! Spill igjen",zh:"10 → 方向反转！你再出牌",ja:"10 → 方向逆転！もう一度プレイ",ko:"10 → 방향 역전! 다시 플레이",hi:"10 → दिशा पलटी! फिर खेलें",th:"10 → ทิศทางกลับ! เล่นอีกครั้ง",vi:"10 → Đảo chiều! Chơi lại",id:"10 → Arah terbalik! Main lagi",ar:"10 → الاتجاه عكسي! العب مجدداً" },
  mp10Rev:        { es:"10 → ¡Dirección invertida!",en:"10 → Direction reversed!",pt:"10 → Direção invertida!",fr:"10 → Direction inversée !",de:"10 → Richtung umgekehrt!",it:"10 → Direzione invertita!",tr:"10 → Yön tersine döndü!",ru:"10 → Направление изменено!",pl:"10 → Kierunek odwrócony!",nl:"10 → Richting omgekeerd!",sv:"10 → Riktning omvänd!",da:"10 → Retning vendt!",fi:"10 → Suunta kääntyi!",no:"10 → Retning snudd!",zh:"10 → 方向反转！",ja:"10 → 方向逆転！",ko:"10 → 방향 역전!",hi:"10 → दिशा पलटी!",th:"10 → ทิศทางกลับ!",vi:"10 → Đảo chiều!",id:"10 → Arah terbalik!",ar:"10 → الاتجاه عكسي!" },
  mpPlayedCard:   { es:"{r} de {s}",en:"{r} of {s}",pt:"{r} de {s}",fr:"{r} de {s}",de:"{r} von {s}",it:"{r} di {s}",tr:"{s} {r}",ru:"{r} масти {s}",pl:"{r} koloru {s}",nl:"{r} van {s}",sv:"{r} av {s}",da:"{r} af {s}",fi:"{r}/{s}",no:"{r} av {s}",zh:"{s}的{r}",ja:"{s}の{r}",ko:"{s}의 {r}",hi:"{s} का {r}",th:"{r} ของ {s}",vi:"{r} của {s}",id:"{r} dari {s}",ar:"{r} من {s}" },
  mpDrewN:        { es:"Robaste {n} cartas",en:"You drew {n} cards",pt:"Você comprou {n} cartas",fr:"Vous avez pioché {n} cartes",de:"Du zogst {n} Karten",it:"Hai pescato {n} carte",tr:"{n} kart çektin",ru:"Ты взял {n} карт",pl:"Dobrałeś {n} kart",nl:"Je trok {n} kaarten",sv:"Du drog {n} kort",da:"Du trak {n} kort",fi:"Nostit {n} korttia",no:"Du trakk {n} kort",zh:"你摸了{n}张牌",ja:"{n}枚引いた",ko:"{n}장 뽑음",hi:"आपने {n} पत्ते लिए",th:"คุณจั่ว {n} ใบ",vi:"Bạn rút {n} lá",id:"Kamu ambil {n} kartu",ar:"سحبت {n} بطاقات" },
  mpNoPlay:       { es:"Sin jugada — Turno de {p}",en:"No play — {p}'s turn",pt:"Sem jogada — Vez de {p}",fr:"Pas de jeu — Tour de {p}",de:"Kein Zug — {p} ist dran",it:"Nessuna mossa — Turno di {p}",tr:"Hamle yok — {p} sırası",ru:"Нет хода — Ход {p}",pl:"Brak ruchu — Tura {p}",nl:"Geen zet — {p} is aan de beurt",sv:"Inget drag — {p}:s tur",da:"Intet træk — {p}s tur",fi:"Ei siirtoa — {p}:n vuoro",no:"Ingen trekk — {p} sin tur",zh:"无法出牌 — {p}的回合",ja:"プレイ不可 — {p}のターン",ko:"플레이 없음 — {p} 차례",hi:"कोई चाल नहीं — {p} की बारी",th:"ไม่มีการเล่น — ถึงตา {p}",vi:"Không có nước đi — Lượt của {p}",id:"Tidak ada langkah — Giliran {p}",ar:"لا خطوة — دور {p}" },
  mpSuit:         { es:"Palo: {s}",en:"Suit: {s}",pt:"Naipe: {s}",fr:"Couleur: {s}",de:"Farbe: {s}",it:"Seme: {s}",tr:"Sembol: {s}",ru:"Масть: {s}",pl:"Kolor: {s}",nl:"Kleur: {s}",sv:"Färg: {s}",da:"Farve: {s}",fi:"Väri: {s}",no:"Farge: {s}",zh:"花色: {s}",ja:"スート: {s}",ko:"수트: {s}",hi:"पत्ता: {s}",th:"ตรา: {s}",vi:"Chất: {s}",id:"Jenis: {s}",ar:"اللون: {s}" },
  play2youDraw:   { es:"2 → Rival debe robar {n} cartas (o defender)",en:"2 → Rival must draw {n} cards (or defend)",pt:"2 → Rival deve comprar {n} cartas (ou defender)",fr:"2 → Rival doit piocher {n} cartes (ou défendre)",de:"2 → Rival muss {n} Karten ziehen (oder verteidigen)",it:"2 → Rival deve pescare {n} carte (o difendersi)",tr:"2 → Rival {n} kart çekmeli (ya da savunmalı)",ru:"2 → Rival должен взять {n} карт (или защититься)",pl:"2 → Rival musi dobrać {n} kart (lub się bronić)",nl:"2 → Rival moet {n} kaarten pakken (of verdedigen)",sv:"2 → Rival måste dra {n} kort (eller försvara)",da:"2 → Rival skal tage {n} kort (eller forsvare)",fi:"2 → Rival:n on nostettava {n} korttia (tai puolustaa)",no:"2 → Rival må trekke {n} kort (eller forsvare)",zh:"2 → CPU必须摸{n}张(或防守)",ja:"2 → CPUは{n}枚引く（または防御）",ko:"2 → CPU가 {n}장 뽑기 (또는 방어)",hi:"2 → Rival को {n} पत्ते लेने होंगे (या बचाव करे)",th:"2 → Rival ต้องจั่ว {n} ใบ (หรือป้องกัน)",vi:"2 → Rival phải rút {n} lá (hoặc phòng thủ)",id:"2 → Rival harus ambil {n} kartu (atau bertahan)",ar:"2 → يجب على Rival سحب {n} بطاقات (أو الدفاع)" },
};

export function gm(key: string, vars?: Record<string, string>): string {
  const lang = _engineLang;
  let s = GM[key]?.[lang] ?? GM[key]?.["es"] ?? key;
  if (vars) { Object.entries(vars).forEach(([k, v]) => { s = s.replace(`{${k}}`, v); }); }
  return s;
}

export function suitName(suit: Suit): string {
  return SUIT_NAMES[suit]?.[_engineLang] ?? SUIT_NAMES[suit]?.["es"] ?? suit;
}

export function suitSymbol(suit: Suit): string {
  return { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" }[suit];
}

export function suitColor(suit: Suit): string {
  if (suit === "hearts")   return "#E53935"; // vivid red
  if (suit === "diamonds") return "#E53935"; // vivid red
  if (suit === "clubs")    return "#1A1A2E"; // deep navy-black
  return "#1A1A2E"; // spades: deep navy-black
}

export function rankLabel(rank: Rank): string {
  if (rank === "Joker") return "★";
  return rank;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
