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
  // Special card state
  pendingDraw: number;
  pendingDrawType: "two" | "seven" | null;
  pendingDrawSuit: Suit | null;
  jActive: boolean;
  jSuit: Suit | null;
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
  // J active: must play card of same suit OR any face card (J/Q/K) OR wild
  if (state.jActive && state.jSuit) {
    return card.suit === state.jSuit ||
      card.rank === "J" || card.rank === "Q" || card.rank === "K" ||
      card.rank === "8" || card.rank === "Joker";
  }
  // Pending draw: can only play counter cards
  if (state.pendingDraw > 0) {
    if (state.pendingDrawType === "two") {
      return card.rank === "2" ||
        (card.rank === "A" && card.suit === state.pendingDrawSuit) ||
        card.rank === "Joker";
    }
    if (state.pendingDrawType === "seven") {
      return card.rank === "7" || card.rank === "Joker";
    }
    return false;
  }
  // Normal rules
  if (card.rank === "8" || card.rank === "Joker") return true;
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

  // Clear J state when playing any card
  ns.jActive = false;
  ns.jSuit = null;

  if (card.rank === "8") {
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
    ns.pendingDraw += 5;
    ns.pendingDrawType = "seven";
    ns.currentPlayer = "ai";
    ns.message = gm("jokerCpuDraw", { n: String(ns.pendingDraw) });
  } else if (card.rank === "2") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "two";
    ns.pendingDrawSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.currentPlayer = "ai";
    ns.message = gm("play2youDraw", { n: String(ns.pendingDraw) });
  } else if (card.rank === "A" && state.pendingDraw > 0 && state.pendingDrawType === "two") {
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.currentSuit = card.suit;
    ns.currentPlayer = "ai";
    ns.message = gm("playerAceCancel");
  } else if (card.rank === "3") {
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("player3skip");
  } else if (card.rank === "7") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "seven";
    ns.currentSuit = card.suit;
    ns.currentPlayer = "ai";
    ns.message = gm("play2youDraw", { n: String(ns.pendingDraw) });
  } else if (card.rank === "10") {
    ns.direction = (ns.direction === 1 ? -1 : 1) as 1 | -1;
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("player10reverse");
  } else if (card.rank === "J") {
    ns.jActive = true;
    ns.jSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("jackRule", { s: suitName(card.suit) });
  } else {
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


  // Handle J active for AI — same suit OR face card (J/Q/K) OR wild
  if (ns.jActive && ns.jSuit) {
    const jPlayable = ns.aiHand.filter(c =>
      c.suit === ns.jSuit || c.rank === "J" || c.rank === "Q" || c.rank === "K" ||
      c.rank === "8" || c.rank === "Joker"
    );
    if (jPlayable.length > 0) {
      const pick = aiChooseCard(jPlayable, ns, difficulty);
      ns.aiHand = ns.aiHand.filter(c => c.id !== pick.id);
      ns.discardPile.push(pick);
      ns.lastPlayedCard = pick;
      ns.jActive = false; ns.jSuit = null;
      ns.currentSuit = pick.suit;
      if (pick.rank === "8" || pick.rank === "Joker") {
        const s = aiChooseSuit(ns.aiHand, difficulty);
        ns.currentSuit = s;
        ns.message = gm("cpuPlayed", { r: pick.rank, s: suitName(s) });
      } else {
        ns.message = gm("cpuPlayedOf", { r: pick.rank, s: suitName(pick.suit) });
      }
    } else {
      if (ns.drawPile.length === 0) ns = reshuffleDiscard(ns);
      if (ns.drawPile.length > 0) ns.aiHand.push(ns.drawPile.pop()!);
      ns.jActive = false; ns.jSuit = null;
      ns.message = gm("cpuJ1Draw");
    }
    if (ns.aiHand.length === 0) { ns.phase = "ai_wins"; ns.message = gm("cpuWins"); return ns; }
    ns.currentPlayer = "player";
    return ns;
  }

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

  if (chosen.rank === "8") {
    const suit = aiChooseSuit(ns.aiHand, difficulty);
    ns.currentSuit = suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("cpuCrazy8", { s: suitName(suit) });
    ns.currentPlayer = "player";
  } else if (chosen.rank === "Joker") {
    ns.pendingDraw += 5;
    ns.pendingDrawType = "seven";
    ns.message = gm("cpuJkrDraw", { n: String(ns.pendingDraw) });
    ns.currentPlayer = "player";
  } else if (chosen.rank === "2") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "two";
    ns.pendingDrawSuit = chosen.suit;
    ns.currentSuit = chosen.suit;
    ns.message = gm("cpuPlay2", { n: String(ns.pendingDraw) });
    ns.currentPlayer = "player";
  } else if (chosen.rank === "A" && state.pendingDraw > 0 && state.pendingDrawType === "two") {
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.currentSuit = chosen.suit;
    ns.message = gm("cpuAce");
    ns.currentPlayer = "player";
  } else if (chosen.rank === "3") {
    ns.currentSuit = chosen.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("cpuPlay3");
    // AI goes again
  } else if (chosen.rank === "7") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "seven";
    ns.currentSuit = chosen.suit;
    ns.message = gm("cpuPlay7", { n: String(ns.pendingDraw) });
    ns.currentPlayer = "player";
  } else if (chosen.rank === "10") {
    ns.direction = (ns.direction === 1 ? -1 : 1) as 1 | -1;
    ns.currentSuit = chosen.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = gm("cpuPlay10");
    // AI goes again (stays "ai")
  } else if (chosen.rank === "J") {
    ns.jActive = true;
    ns.jSuit = chosen.suit;
    ns.currentSuit = chosen.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    const jFollow = ns.aiHand.filter(c =>
      c.suit === ns.jSuit || c.rank === "J" || c.rank === "Q" || c.rank === "K" ||
      c.rank === "8" || c.rank === "Joker"
    );
    if (jFollow.length > 0) {
      const follow = aiChooseCard(jFollow, ns, difficulty);
      ns.aiHand = ns.aiHand.filter(c => c.id !== follow.id);
      ns.discardPile.push(follow);
      ns.jActive = false; ns.jSuit = null;
      ns.currentSuit = follow.rank === "8" ? aiChooseSuit(ns.aiHand, difficulty) : follow.suit;
      ns.message = gm("cpuJackFollow", { r: follow.rank, s: suitName(follow.suit) });
    } else {
      if (ns.drawPile.length === 0) ns = reshuffleDiscard(ns);
      if (ns.drawPile.length > 0) ns.aiHand.push(ns.drawPile.pop()!);
      ns.jActive = false; ns.jSuit = null;
      ns.message = gm("cpuJackDraw");
    }
    ns.currentPlayer = "player";
  } else {
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

  // Priority: counter cards when pendingDraw > 0
  if (state.pendingDraw > 0) {
    const counters = playable.filter(c =>
      (state.pendingDrawType === "two" && (c.rank === "2" || c.rank === "Joker")) ||
      (state.pendingDrawType === "seven" && (c.rank === "7" || c.rank === "Joker"))
    );
    if (counters.length > 0) return counters[0];
  }

  // Special cards priority (hard/intermediate)
  if (difficulty === "hard" || difficulty === "expert") {
    const specials = playable.filter(c => ["2","3","7","10"].includes(c.rank));
    if (specials.length > 0 && Math.random() > 0.35) return specials[0];
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
  jokerCpuDraw:   { es:"¡Comodín! CPU debe robar {n} cartas",en:"Joker! CPU must draw {n} cards",pt:"Curinga! CPU deve comprar {n} cartas",fr:"Joker ! CPU doit piocher {n} cartes",de:"Joker! CPU muss {n} Karten ziehen",it:"Jolly! CPU deve pescare {n} carte",tr:"Joker! CPU {n} kart çekmeli",ru:"Джокер! CPU должен взять {n} карт",pl:"Joker! CPU musi dobrać {n} kart",nl:"Joker! CPU moet {n} kaarten pakken",sv:"Joker! CPU måste dra {n} kort",da:"Joker! CPU skal tage {n} kort",fi:"Jokeri! CPU:n on nostettava {n} korttia",no:"Joker! CPU må trekke {n} kort",zh:"百搭！CPU必须摸{n}张牌",ja:"ジョーカー！CPUは{n}枚引く",ko:"조커! CPU가 {n}장 뽑아야 함",hi:"जोकर! CPU को {n} पत्ते लेने होंगे",th:"โจ๊กเกอร์! CPU ต้องจั่ว {n} ใบ",vi:"Joker! CPU phải rút {n} lá",id:"Joker! CPU harus ambil {n} kartu",ar:"جوكر! يجب على CPU سحب {n} بطاقات" },
  youChoseSuit:   { es:"Elegiste {s} — Turno del Rival...",en:"You chose {s} — Rival's turn...",pt:"Você escolheu {s} — Turno do Rival...",fr:"Vous avez choisi {s} — Tour du Rival...",de:"Du wähltest {s} — Rival ist dran...",it:"Hai scelto {s} — Turno del Rivale...",tr:"{s} seçtin — Rakip sırası...",ru:"Вы выбрали {s} — Ход соперника...",pl:"Wybrałeś {s} — Tura rywala...",nl:"Je koos {s} — Rival is aan de beurt...",sv:"Du valde {s} — Rivals tur...",da:"Du valgte {s} — Rivals tur...",fi:"Valitsit {s} — Vastustajan vuoro...",no:"Du valgte {s} — Rivalens tur...",zh:"你选了{s} — 对手的回合...",ja:"{s}を選んだ — ライバルのターン...",ko:"{s} 선택 — 상대방 차례...",hi:"आपने {s} चुना — प्रतिद्वंद्वी की बारी...",th:"คุณเลือก {s} — ถึงตาคู่แข่ง...",vi:"Bạn chọn {s} — Lượt của đối thủ...",id:"Kamu memilih {s} — Giliran Rival...",ar:"اخترت {s} — دور المنافس..." },
  jackRule:       { es:"J → Juega otra de {s}, figura (J/Q/K), o roba 1",en:"J → Play another {s}, figure (J/Q/K), or draw 1",pt:"J → Jogue outro de {s}, figura (J/Q/K), ou compre 1",fr:"J → Jouez un autre {s}, figure (J/Q/K), ou piochez 1",de:"J → Spiele ein {s}, Bild (J/Q/K), oder ziehe 1",it:"J → Gioca un altro {s}, figura (J/Q/K), o pesca 1",tr:"J → Başka bir {s} veya resim kartı (J/Q/K) oyna, ya da çek 1",ru:"J → Сыграй {s}, фигуру (J/Q/K) или возьми 1",pl:"J → Zagraj {s}, figurę (J/Q/K) lub dobierz 1",nl:"J → Speel een {s}, figuurkaart (J/Q/K) of pak 1",sv:"J → Spela {s}, bilden (J/Q/K) eller dra 1",da:"J → Spil et {s}, billedkort (J/Q/K) eller tag 1",fi:"J → Pelaa {s}, kuvakortti (J/Q/K) tai nosta 1",no:"J → Spill {s}, bildekort (J/Q/K) eller trekk 1",zh:"J → 出{s}牌、花牌(J/Q/K)或摸1张",ja:"J → {s}、絵札(J/Q/K)、または1枚引く",ko:"J → {s} 출력, 그림패(J/Q/K), 또는 1장 뽑기",hi:"J → {s} या फिगर (J/Q/K) खेलें, या 1 लें",th:"J → เล่น {s}, ไพ่รูป (J/Q/K) หรือจั่ว 1",vi:"J → Đánh {s}, bài hình (J/Q/K), hoặc rút 1",id:"J → Main {s}, kartu gambar (J/Q/K), atau ambil 1",ar:"J → العب {s}، ورقة شخصية (J/Q/K)، أو اسحب 1" },
  cpuPlayed:      { es:"CPU jugó {r} → {s}",en:"CPU played {r} → {s}",pt:"CPU jogou {r} → {s}",fr:"CPU a joué {r} → {s}",de:"CPU spielte {r} → {s}",it:"CPU ha giocato {r} → {s}",tr:"CPU {r} → {s} oynadı",ru:"CPU сыграл {r} → {s}",pl:"CPU zagrał {r} → {s}",nl:"CPU speelde {r} → {s}",sv:"CPU spelade {r} → {s}",da:"CPU spillede {r} → {s}",fi:"CPU pelasi {r} → {s}",no:"CPU spilte {r} → {s}",zh:"CPU出了{r} → {s}",ja:"CPUが{r}を出した → {s}",ko:"CPU가 {r} → {s} 플레이",hi:"CPU ने {r} → {s} खेला",th:"CPU เล่น {r} → {s}",vi:"CPU đánh {r} → {s}",id:"CPU main {r} → {s}",ar:"CPU لعب {r} → {s}" },
  cpuPlayedOf:    { es:"CPU jugó {r} de {s}",en:"CPU played {r} of {s}",pt:"CPU jogou {r} de {s}",fr:"CPU a joué {r} de {s}",de:"CPU spielte {r} von {s}",it:"CPU ha giocato {r} di {s}",tr:"CPU {s} {r} oynadı",ru:"CPU сыграл {r} масти {s}",pl:"CPU zagrał {r} koloru {s}",nl:"CPU speelde {r} van {s}",sv:"CPU spelade {r} av {s}",da:"CPU spillede {r} af {s}",fi:"CPU pelasi {r}/{s}",no:"CPU spilte {r} av {s}",zh:"CPU出了{s}的{r}",ja:"CPUが{s}の{r}を出した",ko:"CPU가 {s}의 {r} 플레이",hi:"CPU ने {s} का {r} खेला",th:"CPU เล่น {r} ของ {s}",vi:"CPU đánh {r} của {s}",id:"CPU main {r} dari {s}",ar:"CPU لعب {r} من {s}" },
  cpuCrazy8:      { es:"CPU jugó 8 Loco → {s}",en:"CPU played Crazy 8 → {s}",pt:"CPU jogou 8 Maluco → {s}",fr:"CPU a joué 8 Fou → {s}",de:"CPU spielte Verrückte 8 → {s}",it:"CPU ha giocato 8 Matto → {s}",tr:"CPU Çılgın 8 → {s} oynadı",ru:"CPU сыграл Дикую 8 → {s}",pl:"CPU zagrał Szaloną 8 → {s}",nl:"CPU speelde Gekke 8 → {s}",sv:"CPU spelade Galna 8 → {s}",da:"CPU spillede Vilde 8 → {s}",fi:"CPU pelasi Hullu 8 → {s}",no:"CPU spilte Gale 8 → {s}",zh:"CPU出了疯8 → {s}",ja:"CPUがクレイジー8を出した → {s}",ko:"CPU가 크레이지 8 → {s} 플레이",hi:"CPU ने क्रेजी 8 → {s} खेला",th:"CPU เล่น 8บ้า → {s}",vi:"CPU đánh 8 Điên → {s}",id:"CPU main 8 Gila → {s}",ar:"CPU لعب 8 المجنونة → {s}" },
  cpuJkrDraw:     { es:"CPU jugó Comodín → Robas {n} cartas",en:"CPU played Joker → Draw {n} cards",pt:"CPU jogou Curinga → Você compra {n} cartas",fr:"CPU a joué Joker → Piochez {n} cartes",de:"CPU spielte Joker → Ziehe {n} Karten",it:"CPU ha giocato Jolly → Pesca {n} carte",tr:"CPU Joker oynadı → {n} kart çek",ru:"CPU сыграл Джокера → Возьми {n} карт",pl:"CPU zagrał Jokera → Dobierz {n} kart",nl:"CPU speelde Joker → Trek {n} kaarten",sv:"CPU spelade Joker → Dra {n} kort",da:"CPU spillede Joker → Tag {n} kort",fi:"CPU pelasi Jokerin → Nosta {n} korttia",no:"CPU spilte Joker → Trekk {n} kort",zh:"CPU出了百搭 → 你摸{n}张牌",ja:"CPUがジョーカーを出した → {n}枚引く",ko:"CPU가 조커 → {n}장 뽑기",hi:"CPU ने जोकर खेला → {n} पत्ते लो",th:"CPU เล่นโจ๊กเกอร์ → จั่ว {n} ใบ",vi:"CPU đánh Joker → Rút {n} lá",id:"CPU main Joker → Ambil {n} kartu",ar:"CPU لعب الجوكر → اسحب {n} بطاقات" },
  cpuJkrSuit:     { es:"CPU jugó Comodín → {s}",en:"CPU played Joker → {s}",pt:"CPU jogou Curinga → {s}",fr:"CPU a joué Joker → {s}",de:"CPU spielte Joker → {s}",it:"CPU ha giocato Jolly → {s}",tr:"CPU Joker oynadı → {s}",ru:"CPU сыграл Джокера → {s}",pl:"CPU zagrał Jokera → {s}",nl:"CPU speelde Joker → {s}",sv:"CPU spelade Joker → {s}",da:"CPU spillede Joker → {s}",fi:"CPU pelasi Jokerin → {s}",no:"CPU spilte Joker → {s}",zh:"CPU出了百搭 → {s}",ja:"CPUがジョーカー → {s}",ko:"CPU가 조커 → {s}",hi:"CPU ने जोकर खेला → {s}",th:"CPU เล่นโจ๊กเกอร์ → {s}",vi:"CPU đánh Joker → {s}",id:"CPU main Joker → {s}",ar:"CPU لعب الجوكر → {s}" },
  cpuPlay2:       { es:"CPU jugó 2 → Robas {n} cartas (o defiende)",en:"CPU played 2 → Draw {n} cards (or defend)",pt:"CPU jogou 2 → Você compra {n} cartas (ou defende)",fr:"CPU a joué 2 → Piochez {n} cartes (ou défendez)",de:"CPU spielte 2 → Ziehe {n} Karten (oder verteidige)",it:"CPU ha giocato 2 → Pesca {n} carte (o difendi)",tr:"CPU 2 oynadı → {n} kart çek (ya da savun)",ru:"CPU сыграл 2 → Возьми {n} карт (или защищайся)",pl:"CPU zagrał 2 → Dobierz {n} kart (lub bronij się)",nl:"CPU speelde 2 → Trek {n} kaarten (of verdedig)",sv:"CPU spelade 2 → Dra {n} kort (eller försvara)",da:"CPU spillede 2 → Tag {n} kort (eller forsvar dig)",fi:"CPU pelasi 2 → Nosta {n} korttia (tai puolusta)",no:"CPU spilte 2 → Trekk {n} kort (eller forsvar deg)",zh:"CPU出了2 → 你摸{n}张(或防守)",ja:"CPUが2を出した → {n}枚引く（または防御）",ko:"CPU가 2 → {n}장 뽑기 (또는 방어)",hi:"CPU ने 2 खेला → {n} पत्ते लो (या बचाव करो)",th:"CPU เล่น 2 → จั่ว {n} ใบ (หรือป้องกัน)",vi:"CPU đánh 2 → Rút {n} lá (hoặc phòng thủ)",id:"CPU main 2 → Ambil {n} kartu (atau bertahan)",ar:"CPU لعب 2 → اسحب {n} بطاقات (أو دافع)" },
  cpuAce:         { es:"CPU jugó As — ¡Robo cancelado!",en:"CPU played Ace — Draw cancelled!",pt:"CPU jogou Ás — Compra cancelada!",fr:"CPU a joué As — Pioche annulée !",de:"CPU spielte Ass — Ziehen abgebrochen!",it:"CPU ha giocato Asso — Pesca annullata!",tr:"CPU As oynadı — Çekme iptal!",ru:"CPU сыграл Туза — Добор отменён!",pl:"CPU zagrał Asa — Dobieranie anulowane!",nl:"CPU speelde Aas — Trek geannuleerd!",sv:"CPU spelade Ess — Drag avbrutet!",da:"CPU spillede Es — Trækning annulleret!",fi:"CPU pelasi Ässän — Nosto peruutettu!",no:"CPU spilte Ess — Trekk kansellert!",zh:"CPU出了A — 摸牌取消！",ja:"CPUがAを出した — 引くのキャンセル！",ko:"CPU가 에이스 → 드로우 취소!",hi:"CPU ने ए खेला — ड्रॉ रद्द!",th:"CPU เล่น A — ยกเลิกการจั่ว!",vi:"CPU đánh A — Hủy rút bài!",id:"CPU main As — Ambil dibatalkan!",ar:"CPU لعب الآس — السحب ملغى!" },
  cpuPlay3:       { es:"CPU jugó 3 → ¡Pierdes tu turno!",en:"CPU played 3 → You lose your turn!",pt:"CPU jogou 3 → Você perde a vez!",fr:"CPU a joué 3 → Vous perdez votre tour !",de:"CPU spielte 3 → Du verlierst deinen Zug!",it:"CPU ha giocato 3 → Perdi il tuo turno!",tr:"CPU 3 oynadı → Sıranı kaybedersin!",ru:"CPU сыграл 3 → Ты пропускаешь ход!",pl:"CPU zagrał 3 → Tracisz turę!",nl:"CPU speelde 3 → Je verliest je beurt!",sv:"CPU spelade 3 → Du förlorar din tur!",da:"CPU spillede 3 → Du mister din tur!",fi:"CPU pelasi 3 → Menetät vuorosi!",no:"CPU spilte 3 → Du mister turen din!",zh:"CPU出了3 → 你失去一回合！",ja:"CPUが3を出した → あなたはターンをスキップ！",ko:"CPU가 3 → 당신의 턴 잃기!",hi:"CPU ने 3 खेला → आपकी बारी छूट गई!",th:"CPU เล่น 3 → คุณเสียตาเดิน!",vi:"CPU đánh 3 → Bạn mất lượt!",id:"CPU main 3 → Kamu kehilangan giliran!",ar:"CPU لعب 3 → تخسر دورك!" },
  cpuPlay7:       { es:"CPU jugó 7 → Robas {n} cartas (o defiende)",en:"CPU played 7 → Draw {n} cards (or defend)",pt:"CPU jogou 7 → Você compra {n} cartas (ou defende)",fr:"CPU a joué 7 → Piochez {n} cartes (ou défendez)",de:"CPU spielte 7 → Ziehe {n} Karten (oder verteidige)",it:"CPU ha giocato 7 → Pesca {n} carte (o difendi)",tr:"CPU 7 oynadı → {n} kart çek (ya da savun)",ru:"CPU сыграл 7 → Возьми {n} карт (или защищайся)",pl:"CPU zagrał 7 → Dobierz {n} kart (lub bronij się)",nl:"CPU speelde 7 → Trek {n} kaarten (of verdedig)",sv:"CPU spelade 7 → Dra {n} kort (eller försvara)",da:"CPU spillede 7 → Tag {n} kort (eller forsvar dig)",fi:"CPU pelasi 7 → Nosta {n} korttia (tai puolusta)",no:"CPU spilte 7 → Trekk {n} kort (eller forsvar deg)",zh:"CPU出了7 → 你摸{n}张(或防守)",ja:"CPUが7を出した → {n}枚引く（または防御）",ko:"CPU가 7 → {n}장 뽑기 (또는 방어)",hi:"CPU ने 7 खेला → {n} पत्ते लो (या बचाव करो)",th:"CPU เล่น 7 → จั่ว {n} ใบ (หรือป้องกัน)",vi:"CPU đánh 7 → Rút {n} lá (hoặc phòng thủ)",id:"CPU main 7 → Ambil {n} kartu (atau bertahan)",ar:"CPU لعب 7 → اسحب {n} بطاقات (أو دافع)" },
  cpuPlay10:      { es:"CPU jugó 10 → ¡Dirección invertida! CPU juega de nuevo",en:"CPU played 10 → Direction reversed! CPU plays again",pt:"CPU jogou 10 → Direção invertida! CPU joga de novo",fr:"CPU a joué 10 → Direction inversée ! CPU rejoue",de:"CPU spielte 10 → Richtung umgekehrt! CPU spielt nochmal",it:"CPU ha giocato 10 → Direzione invertita! CPU gioca ancora",tr:"CPU 10 oynadı → Yön tersine döndü! CPU tekrar oynuyor",ru:"CPU сыграл 10 → Направление изменено! CPU ходит снова",pl:"CPU zagrał 10 → Kierunek odwrócony! CPU gra ponownie",nl:"CPU speelde 10 → Richting omgekeerd! CPU speelt opnieuw",sv:"CPU spelade 10 → Riktning omvänd! CPU spelar igen",da:"CPU spillede 10 → Retning vendt! CPU spiller igen",fi:"CPU pelasi 10 → Suunta kääntyi! CPU pelaa uudelleen",no:"CPU spilte 10 → Retning snudd! CPU spiller igjen",zh:"CPU出了10 → 方向反转！CPU再出一张",ja:"CPUが10を出した → 方向逆転！CPUがもう一度",ko:"CPU가 10 → 방향 역전! CPU 다시 플레이",hi:"CPU ने 10 खेला → दिशा पलटी! CPU फिर खेलेगा",th:"CPU เล่น 10 → ทิศทางกลับ! CPU เล่นอีกครั้ง",vi:"CPU đánh 10 → Đảo chiều! CPU đánh lại",id:"CPU main 10 → Arah terbalik! CPU main lagi",ar:"CPU لعب 10 → الاتجاه عكسي! CPU يلعب مجدداً" },
  cpuJackFollow:  { es:"CPU jugó J → {r} de {s}",en:"CPU played J → {r} of {s}",pt:"CPU jogou J → {r} de {s}",fr:"CPU a joué J → {r} de {s}",de:"CPU spielte J → {r} von {s}",it:"CPU ha giocato J → {r} di {s}",tr:"CPU J oynadı → {s} {r}",ru:"CPU сыграл J → {r} масти {s}",pl:"CPU zagrał J → {r} koloru {s}",nl:"CPU speelde J → {r} van {s}",sv:"CPU spelade J → {r} av {s}",da:"CPU spillede J → {r} af {s}",fi:"CPU pelasi J → {r}/{s}",no:"CPU spilte J → {r} av {s}",zh:"CPU出了J → {s}的{r}",ja:"CPUがJを出した → {s}の{r}",ko:"CPU가 J → {s}의 {r}",hi:"CPU ने J खेला → {s} का {r}",th:"CPU เล่น J → {r} ของ {s}",vi:"CPU đánh J → {r} của {s}",id:"CPU main J → {r} dari {s}",ar:"CPU لعب J → {r} من {s}" },
  player3skip:    { es:"3 → Rival pierde su turno. ¡Juegas de nuevo!",en:"3 → Rival loses their turn. Play again!",pt:"3 → Rival perde a vez. Jogue de novo!",fr:"3 → Rival perd son tour. Rejouez !",de:"3 → Rival verliert seinen Zug. Nochmal spielen!",it:"3 → Rivale perde il turno. Gioca ancora!",tr:"3 → Rakip sırasını kaybetti. Tekrar oyna!",ru:"3 → Соперник пропускает ход. Играй снова!",pl:"3 → Rywal traci turę. Graj ponownie!",nl:"3 → Rival verliest zijn beurt. Speel opnieuw!",sv:"3 → Rival förlorar sin tur. Spela igen!",da:"3 → Rival mister sin tur. Spil igen!",fi:"3 → Vastustaja menettää vuoronsa. Pelaa uudelleen!",no:"3 → Rival mister turen. Spill igjen!",zh:"3 → 对手失去回合，你再出一张！",ja:"3 → ライバルがターンをスキップ。もう一度！",ko:"3 → 상대방이 턴 잃기. 다시 플레이!",hi:"3 → प्रतिद्वंद्वी की बारी छूटी। फिर खेलें!",th:"3 → คู่แข่งเสียตาเดิน เล่นอีกครั้ง!",vi:"3 → Đối thủ mất lượt. Chơi lại!",id:"3 → Rival kehilangan giliran. Main lagi!",ar:"3 → المنافس يخسر دوره. العب مجدداً!" },
  playerAceCancel:{ es:"¡As! Robo cancelado — Turno del Rival",en:"Ace! Draw cancelled — Rival's turn",pt:"Ás! Compra cancelada — Vez do Rival",fr:"As ! Pioche annulée — Tour du Rival",de:"Ass! Ziehen abgebrochen — Rival ist dran",it:"Asso! Pesca annullata — Turno del Rivale",tr:"As! Çekme iptal — Rakip sırası",ru:"Туз! Добор отменён — Ход соперника",pl:"As! Dobieranie anulowane — Tura rywala",nl:"Aas! Trek geannuleerd — Rival is aan de beurt",sv:"Ess! Drag avbrutet — Rivals tur",da:"Es! Trækning annulleret — Rivals tur",fi:"Ässä! Nosto peruutettu — Vastustajan vuoro",no:"Ess! Trekk kansellert — Rivalens tur",zh:"A！摸牌取消 — 对手的回合",ja:"エース！引くのキャンセル — ライバルのターン",ko:"에이스! 드로우 취소 — 상대방 차례",hi:"ए! ड्रॉ रद्द — प्रतिद्वंद्वी की बारी",th:"A! ยกเลิกการจั่ว — ถึงตาคู่แข่ง",vi:"A! Hủy rút bài — Lượt của đối thủ",id:"As! Ambil dibatalkan — Giliran Rival",ar:"آس! السحب ملغى — دور المنافس" },
  player10reverse:{ es:"10 → ¡Dirección invertida! Juegas de nuevo",en:"10 → Direction reversed! You play again",pt:"10 → Direção invertida! Jogue de novo",fr:"10 → Direction inversée ! Rejouez",de:"10 → Richtung umgekehrt! Du spielst nochmal",it:"10 → Direzione invertita! Gioca di nuovo",tr:"10 → Yön tersine döndü! Tekrar oyna",ru:"10 → Направление изменено! Играй снова",pl:"10 → Kierunek odwrócony! Graj ponownie",nl:"10 → Richting omgekeerd! Speel opnieuw",sv:"10 → Riktning omvänd! Spela igen",da:"10 → Retning vendt! Spil igen",fi:"10 → Suunta kääntyi! Pelaa uudelleen",no:"10 → Retning snudd! Spill igjen",zh:"10 → 方向反转！你再出一张",ja:"10 → 方向逆転！もう一度プレイ",ko:"10 → 방향 역전! 다시 플레이",hi:"10 → दिशा पलटी! फिर खेलें",th:"10 → ทิศทางกลับ! เล่นอีกครั้ง",vi:"10 → Đảo chiều! Chơi lại",id:"10 → Arah terbalik! Main lagi",ar:"10 → الاتجاه عكسي! العب مجدداً" },
  cpuTurn:        { es:"Turno del Rival...",en:"Rival's turn...",pt:"Vez do Rival...",fr:"Tour du Rival...",de:"Rival ist dran...",it:"Turno del Rivale...",tr:"Rakip sırası...",ru:"Ход соперника...",pl:"Tura rywala...",nl:"Rival is aan de beurt...",sv:"Rivals tur...",da:"Rivals tur...",fi:"Vastustajan vuoro...",no:"Rivalens tur...",zh:"对手的回合...",ja:"ライバルのターン...",ko:"상대방 차례...",hi:"प्रतिद्वंद्वी की बारी...",th:"ถึงตาคู่แข่ง...",vi:"Lượt của đối thủ...",id:"Giliran Rival...",ar:"دور المنافس..." },
  playerWins:     { es:"¡Ganaste! ¡Increíble!",en:"You won! Incredible!",pt:"Você ganhou! Incrível!",fr:"Tu as gagné ! Incroyable !",de:"Du hast gewonnen! Unglaublich!",it:"Hai vinto! Incredibile!",tr:"Kazandın! İnanılmaz!",ru:"Вы победили! Невероятно!",pl:"Wygrałeś! Niesamowite!",nl:"Je hebt gewonnen! Ongelooflijk!",sv:"Du vann! Otroligt!",da:"Du vandt! Utroligt!",fi:"Voitit! Uskomaton!",no:"Du vant! Utrolig!",zh:"你赢了！难以置信！",ja:"勝利！すごい！",ko:"이겼습니다! 믿을 수 없어요!",hi:"आप जीत गए! अविश्वसनीय!",th:"คุณชนะ! น่าทึ่งมาก!",vi:"Bạn thắng! Tuyệt vời!",id:"Kamu menang! Luar biasa!",ar:"لقد فزت! لا يصدق!" },
  cpuWins:        { es:"¡El CPU ganó!",en:"CPU wins!",pt:"O CPU ganhou!",fr:"Le CPU a gagné !",de:"CPU gewinnt!",it:"Il CPU ha vinto!",tr:"CPU kazandı!",ru:"CPU победил!",pl:"CPU wygrał!",nl:"CPU wint!",sv:"CPU vann!",da:"CPU vandt!",fi:"CPU voitti!",no:"CPU vant!",zh:"CPU赢了！",ja:"CPUが勝利！",ko:"CPU가 이겼습니다!",hi:"CPU जीत गया!",th:"CPU ชนะ!",vi:"CPU thắng!",id:"CPU menang!",ar:"فاز CPU!" },
  noCards:        { es:"Sin cartas — Turno del Rival",en:"No cards — Rival's turn",pt:"Sem cartas — Vez do Rival",fr:"Pas de cartes — Tour du Rival",de:"Keine Karten — Rival ist dran",it:"Nessuna carta — Turno del Rivale",tr:"Kart yok — Rakip sırası",ru:"Нет карт — Ход соперника",pl:"Brak kart — Tura rywala",nl:"Geen kaarten — Rival is aan de beurt",sv:"Inga kort — Rivals tur",da:"Ingen kort — Rivals tur",fi:"Ei kortteja — Vastustajan vuoro",no:"Ingen kort — Rivalens tur",zh:"无牌 — 对手的回合",ja:"カードなし — ライバルのターン",ko:"카드 없음 — 상대방 차례",hi:"कोई कार्ड नहीं — प्रतिद्वंद्वी की बारी",th:"ไม่มีไพ่ — ถึงตาคู่แข่ง",vi:"Không có bài — Lượt của đối thủ",id:"Tidak ada kartu — Giliran Rival",ar:"لا بطاقات — دور المنافس" },
  drewCard:       { es:"Robaste una carta (puedes jugarla)",en:"You drew a card (you can play it)",pt:"Você comprou uma carta (pode jogá-la)",fr:"Vous avez pioché une carte (vous pouvez la jouer)",de:"Du hast eine Karte gezogen (du kannst sie spielen)",it:"Hai pescato una carta (puoi giocarla)",tr:"Bir kart çektin (oynayabilirsin)",ru:"Вы взяли карту (можете её сыграть)",pl:"Dobrałeś kartę (możesz ją zagrać)",nl:"Je hebt een kaart getrokken (je kunt hem spelen)",sv:"Du drog ett kort (du kan spela det)",da:"Du trak et kort (du kan spille det)",fi:"Nostit kortin (voit pelata sen)",no:"Du trakk et kort (du kan spille det)",zh:"你摸了一张牌（可以打出）",ja:"1枚引いた（プレイ可能）",ko:"카드 뽑음 (플레이 가능)",hi:"आपने एक पत्ता लिया (खेल सकते हैं)",th:"คุณจั่ว 1 ใบ (สามารถเล่นได้)",vi:"Bạn rút 1 lá (có thể đánh)",id:"Kamu ambil 1 kartu (bisa dimainkan)",ar:"سحبت بطاقة (يمكنك لعبها)" },
  noPlay:         { es:"Sin jugada — Turno del Rival",en:"No play — Rival's turn",pt:"Sem jogada — Vez do Rival",fr:"Pas de jeu — Tour du Rival",de:"Kein Zug — Rival ist dran",it:"Nessuna mossa — Turno del Rivale",tr:"Hamle yok — Rakip sırası",ru:"Нет хода — Ход соперника",pl:"Brak ruchu — Tura rywala",nl:"Geen zet — Rival is aan de beurt",sv:"Inget drag — Rivals tur",da:"Intet træk — Rivals tur",fi:"Ei siirtoa — Vastustajan vuoro",no:"Ingen trekk — Rivalens tur",zh:"无法出牌 — 对手的回合",ja:"プレイ不可 — ライバルのターン",ko:"플레이 없음 — 상대방 차례",hi:"कोई चाल नहीं — प्रतिद्वंद्वी की बारी",th:"ไม่มีการเล่น — ถึงตาคู่แข่ง",vi:"Không có nước đi — Lượt của đối thủ",id:"Tidak ada langkah — Giliran Rival",ar:"لا خطوة — دور المنافس" },
  cpuDrewN:       { es:"CPU robó {n} cartas",en:"CPU drew {n} cards",pt:"CPU comprou {n} cartas",fr:"CPU a pioché {n} cartes",de:"CPU zog {n} Karten",it:"CPU ha pescato {n} carte",tr:"CPU {n} kart çekti",ru:"CPU взял {n} карт",pl:"CPU dobrał {n} kart",nl:"CPU trok {n} kaarten",sv:"CPU drog {n} kort",da:"CPU trak {n} kort",fi:"CPU nosti {n} korttia",no:"CPU trakk {n} kort",zh:"CPU摸了{n}张牌",ja:"CPUが{n}枚引いた",ko:"CPU가 {n}장 뽑음",hi:"CPU ने {n} पत्ते लिए",th:"CPU จั่ว {n} ใบ",vi:"CPU rút {n} lá",id:"CPU ambil {n} kartu",ar:"CPU سحب {n} بطاقات" },
  cpuDrewOne:     { es:"CPU robó una carta",en:"CPU drew a card",pt:"CPU comprou uma carta",fr:"CPU a pioché une carte",de:"CPU zog eine Karte",it:"CPU ha pescato una carta",tr:"CPU bir kart çekti",ru:"CPU взял карту",pl:"CPU dobrał kartę",nl:"CPU trok een kaart",sv:"CPU drog ett kort",da:"CPU trak et kort",fi:"CPU nosti kortin",no:"CPU trakk ett kort",zh:"CPU摸了一张牌",ja:"CPUが1枚引いた",ko:"CPU가 1장 뽑음",hi:"CPU ने एक पत्ता लिया",th:"CPU จั่ว 1 ใบ",vi:"CPU rút 1 lá",id:"CPU ambil 1 kartu",ar:"CPU سحب بطاقة واحدة" },
  emptyDraw:      { es:"¡Sin cartas! Empate",en:"No cards left! Draw!",pt:"Sem cartas! Empate!",fr:"Plus de cartes ! Égalité !",de:"Keine Karten! Unentschieden!",it:"Nessuna carta! Pareggio!",tr:"Kart kalmadı! Beraberlik!",ru:"Нет карт! Ничья!",pl:"Brak kart! Remis!",nl:"Geen kaarten! Gelijkspel!",sv:"Inga kort! Oavgjort!",da:"Ingen kort! Uafgjort!",fi:"Ei kortteja! Tasapeli!",no:"Ingen kort! Uavgjort!",zh:"无牌可用！平局！",ja:"カードなし！引き分け！",ko:"카드 없음! 무승부!",hi:"कोई कार्ड नहीं! ड्रॉ!",th:"ไม่มีไพ่! เสมอ!",vi:"Hết bài! Hòa!",id:"Tidak ada kartu! Seri!",ar:"لا بطاقات! تعادل!" },
  cpuJ1Draw:      { es:"CPU robó 1 carta",en:"CPU drew 1 card",pt:"CPU comprou 1 carta",fr:"CPU a pioché 1 carte",de:"CPU zog 1 Karte",it:"CPU ha pescato 1 carta",tr:"CPU 1 kart çekti",ru:"CPU взял 1 карту",pl:"CPU dobrał 1 kartę",nl:"CPU trok 1 kaart",sv:"CPU drog 1 kort",da:"CPU trak 1 kort",fi:"CPU nosti 1 kortin",no:"CPU trakk 1 kort",zh:"CPU摸了1张牌",ja:"CPUが1枚引いた",ko:"CPU가 1장 뽑음",hi:"CPU ने 1 पत्ता लिया",th:"CPU จั่ว 1 ใบ",vi:"CPU rút 1 lá",id:"CPU ambil 1 kartu",ar:"CPU سحب بطاقة واحدة" },
  cpuJackDraw:    { es:"CPU jugó J → robó 1 carta",en:"CPU played J → drew 1 card",pt:"CPU jogou J → comprou 1 carta",fr:"CPU a joué J → a pioché 1 carte",de:"CPU spielte J → zog 1 Karte",it:"CPU ha giocato J → ha pescato 1 carta",tr:"CPU J oynadı → 1 kart çekti",ru:"CPU сыграл J → взял 1 карту",pl:"CPU zagrał J → dobrał 1 kartę",nl:"CPU speelde J → trok 1 kaart",sv:"CPU spelade J → drog 1 kort",da:"CPU spillede J → trak 1 kort",fi:"CPU pelasi J → nosti 1 kortin",no:"CPU spilte J → trakk 1 kort",zh:"CPU出了J → 摸了1张牌",ja:"CPUがJを出した → 1枚引いた",ko:"CPU가 J → 1장 뽑음",hi:"CPU ने J खेला → 1 पत्ता लिया",th:"CPU เล่น J → จั่ว 1 ใบ",vi:"CPU đánh J → rút 1 lá",id:"CPU main J → ambil 1 kartu",ar:"CPU لعب J → سحب بطاقة واحدة" },
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
  play2youDraw:   { es:"2 → CPU debe robar {n} cartas (o defender)",en:"2 → CPU must draw {n} cards (or defend)",pt:"2 → CPU deve comprar {n} cartas (ou defender)",fr:"2 → CPU doit piocher {n} cartes (ou défendre)",de:"2 → CPU muss {n} Karten ziehen (oder verteidigen)",it:"2 → CPU deve pescare {n} carte (o difendersi)",tr:"2 → CPU {n} kart çekmeli (ya da savunmalı)",ru:"2 → CPU должен взять {n} карт (или защититься)",pl:"2 → CPU musi dobrać {n} kart (lub się bronić)",nl:"2 → CPU moet {n} kaarten pakken (of verdedigen)",sv:"2 → CPU måste dra {n} kort (eller försvara)",da:"2 → CPU skal tage {n} kort (eller forsvare)",fi:"2 → CPU:n on nostettava {n} korttia (tai puolustaa)",no:"2 → CPU må trekke {n} kort (eller forsvare)",zh:"2 → CPU必须摸{n}张(或防守)",ja:"2 → CPUは{n}枚引く（または防御）",ko:"2 → CPU가 {n}장 뽑기 (또는 방어)",hi:"2 → CPU को {n} पत्ते लेने होंगे (या बचाव करे)",th:"2 → CPU ต้องจั่ว {n} ใบ (หรือป้องกัน)",vi:"2 → CPU phải rút {n} lá (hoặc phòng thủ)",id:"2 → CPU harus ambil {n} kartu (atau bertahan)",ar:"2 → يجب على CPU سحب {n} بطاقات (أو الدفاع)" },
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
