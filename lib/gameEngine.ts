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
      ns.message = `8 Loco → Palo: ${suitName(chosenSuit)}`;
    } else {
      ns.phase = "choosing_suit";
      ns.message = "Elige un palo";
      return ns;
    }
  } else if (card.rank === "Joker") {
    if (ns.pendingDraw > 0) {
      // Counter: add 5 to pending draw
      ns.pendingDraw += 5;
      ns.currentPlayer = "ai";
      ns.message = `¡Comodín! CPU debe robar ${ns.pendingDraw} cartas`;
    } else {
      // Act like 8 — choose suit
      if (chosenSuit) {
        ns.currentSuit = chosenSuit;
        ns.currentPlayer = "ai";
        ns.message = `¡Comodín! → ${suitName(chosenSuit)}`;
      } else {
        ns.phase = "choosing_suit";
        ns.message = "Elige un palo (Comodín)";
        return ns;
      }
    }
  } else if (card.rank === "2") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "two";
    ns.pendingDrawSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.currentPlayer = "ai";
    ns.message = `2 → CPU debe robar ${ns.pendingDraw} cartas (o defender)`;
  } else if (card.rank === "A" && state.pendingDraw > 0 && state.pendingDrawType === "two") {
    // Ace counters pending 2s
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.currentSuit = card.suit;
    ns.currentPlayer = "ai";
    ns.message = "¡As! Robo cancelado — Turno del CPU";
  } else if (card.rank === "3") {
    // Skip opponent: player goes again
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = "3 → CPU pierde su turno. ¡Juegas de nuevo!";
    // currentPlayer stays "player"
  } else if (card.rank === "7") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "seven";
    ns.currentSuit = card.suit;
    ns.currentPlayer = "ai";
    ns.message = `7 → CPU debe robar ${ns.pendingDraw} cartas (o defender)`;
  } else if (card.rank === "10") {
    // Reverse — in 2-player means player goes again
    ns.direction = (ns.direction === 1 ? -1 : 1) as 1 | -1;
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = "10 → ¡Dirección invertida! Juegas de nuevo";
    // currentPlayer stays "player"
  } else if (card.rank === "J") {
    // Repeat turn with same-suit requirement
    ns.jActive = true;
    ns.jSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = `J → Juega otra de ${suitName(card.suit)}, figura (J/Q/K), o roba 1`;
    // currentPlayer stays "player"
  } else {
    // Normal card (A in normal context, Q, K, 5, 6, 9)
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.currentPlayer = "ai";
    ns.message = "Turno del CPU...";
  }

  if (ns.playerHand.length === 0) {
    ns.phase = "player_wins";
    ns.message = "¡Ganaste! ¡Increíble!";
  }
  return ns;
}

export function chooseSuit(state: GameState, suit: Suit): GameState {
  const ns = deepClone(state);
  ns.turnId = (ns.turnId ?? 0) + 1;
  ns.currentSuit = suit;
  ns.phase = "playing";
  ns.currentPlayer = "ai";
  ns.message = `Elegiste ${suitName(suit)} — Turno del CPU...`;
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
    ns.message = `Robaste ${count} cartas — Turno del CPU`;
    return ns;
  }

  if (ns.drawPile.length === 0) ns = reshuffleDiscard(ns);
  if (ns.drawPile.length === 0) {
    ns.currentPlayer = "ai";
    ns.message = "Sin cartas — Turno del CPU";
    return ns;
  }

  const card = ns.drawPile.pop()!;
  ns.playerHand.push(card);
  ns.consecutiveDraws++;

  if (canPlay(card, ns)) {
    ns.message = "Robaste una carta (puedes jugarla)";
  } else {
    ns.message = "Sin jugada — Turno del CPU";
    ns.currentPlayer = "ai";
  }
  return ns;
}

export function aiTurn(state: GameState, difficulty: string = "normal"): GameState {
  let ns = deepClone(state);
  ns.turnId = (ns.turnId ?? 0) + 1;

  // Handle J active for AI — same suit OR face card (J/Q/K) OR wild
  if (ns.jActive && ns.jSuit) {
    const jPlayable = ns.aiHand.filter(c =>
      c.suit === ns.jSuit || c.rank === "J" || c.rank === "Q" || c.rank === "K" ||
      c.rank === "8" || c.rank === "Joker"
    );
    if (jPlayable.length > 0) {
      const pick = jPlayable[0];
      ns.aiHand = ns.aiHand.filter(c => c.id !== pick.id);
      ns.discardPile.push(pick);
      ns.lastPlayedCard = pick;
      ns.jActive = false; ns.jSuit = null;
      ns.currentSuit = pick.suit;
      if (pick.rank === "8" || pick.rank === "Joker") {
        const s = aiChooseSuit(ns.aiHand, difficulty);
        ns.currentSuit = s;
        ns.message = `CPU jugó ${pick.rank} → ${suitName(s)}`;
      } else {
        ns.message = `CPU jugó ${pick.rank} de ${suitName(pick.suit)}`;
      }
    } else {
      // AI draws 1 for J
      if (ns.drawPile.length === 0) ns = reshuffleDiscard(ns);
      if (ns.drawPile.length > 0) ns.aiHand.push(ns.drawPile.pop()!);
      ns.jActive = false; ns.jSuit = null;
      ns.message = "CPU robó 1 carta (sin jugada para J)";
    }
    if (ns.aiHand.length === 0) { ns.phase = "ai_wins"; ns.message = "¡El CPU ganó!"; return ns; }
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
      ns.message = `CPU robó ${count} cartas`;
      ns.currentPlayer = "player";
    } else {
      if (ns.drawPile.length === 0) ns = reshuffleDiscard(ns);
      if (ns.drawPile.length > 0) {
        const card = ns.drawPile.pop()!;
        ns.aiHand.push(card);
        ns.message = `CPU robó una carta`;
        ns.currentPlayer = "player";
      } else {
        ns.phase = "draw";
        ns.message = "¡Sin cartas! Empate";
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
    ns.message = `CPU jugó 8 Loco → ${suitName(suit)}`;
    ns.currentPlayer = "player";
  } else if (chosen.rank === "Joker") {
    if (ns.pendingDraw > 0) {
      ns.pendingDraw += 5;
      ns.message = `CPU jugó Comodín → Robas ${ns.pendingDraw} cartas`;
      ns.currentPlayer = "player";
    } else {
      const suit = aiChooseSuit(ns.aiHand, difficulty);
      ns.currentSuit = suit;
      ns.message = `CPU jugó Comodín → ${suitName(suit)}`;
      ns.currentPlayer = "player";
    }
  } else if (chosen.rank === "2") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "two";
    ns.pendingDrawSuit = chosen.suit;
    ns.currentSuit = chosen.suit;
    ns.message = `CPU jugó 2 → Robas ${ns.pendingDraw} cartas (o defiende)`;
    ns.currentPlayer = "player";
  } else if (chosen.rank === "A" && state.pendingDraw > 0 && state.pendingDrawType === "two") {
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.currentSuit = chosen.suit;
    ns.message = "CPU jugó As — ¡Robo cancelado!";
    ns.currentPlayer = "player";
  } else if (chosen.rank === "3") {
    ns.currentSuit = chosen.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = "CPU jugó 3 → ¡Pierdes tu turno!";
    // AI goes again
  } else if (chosen.rank === "7") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "seven";
    ns.currentSuit = chosen.suit;
    ns.message = `CPU jugó 7 → Robas ${ns.pendingDraw} cartas (o defiende)`;
    ns.currentPlayer = "player";
  } else if (chosen.rank === "10") {
    ns.direction = (ns.direction === 1 ? -1 : 1) as 1 | -1;
    ns.currentSuit = chosen.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = "CPU jugó 10 → ¡Dirección invertida! CPU juega de nuevo";
    // AI goes again (stays "ai")
  } else if (chosen.rank === "J") {
    ns.jActive = true;
    ns.jSuit = chosen.suit;
    ns.currentSuit = chosen.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    // Immediately resolve J for AI: same suit OR face card (J/Q/K) OR wild
    const jFollow = ns.aiHand.filter(c =>
      c.suit === ns.jSuit || c.rank === "J" || c.rank === "Q" || c.rank === "K" ||
      c.rank === "8" || c.rank === "Joker"
    );
    if (jFollow.length > 0) {
      const follow = jFollow[0];
      ns.aiHand = ns.aiHand.filter(c => c.id !== follow.id);
      ns.discardPile.push(follow);
      ns.jActive = false; ns.jSuit = null;
      ns.currentSuit = follow.rank === "8" ? aiChooseSuit(ns.aiHand, difficulty) : follow.suit;
      ns.message = `CPU jugó J → ${follow.rank} de ${suitName(follow.suit)}`;
    } else {
      // No follow card: AI draws 1
      if (ns.drawPile.length === 0) ns = reshuffleDiscard(ns);
      if (ns.drawPile.length > 0) ns.aiHand.push(ns.drawPile.pop()!);
      ns.jActive = false; ns.jSuit = null;
      ns.message = `CPU jugó J → robó 1 carta`;
    }
    ns.currentPlayer = "player";
  } else {
    ns.currentSuit = chosen.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.message = `CPU jugó ${chosen.rank} de ${suitName(chosen.suit)}`;
    ns.currentPlayer = "player";
  }

  if (ns.aiHand.length === 0) {
    ns.phase = "ai_wins";
    ns.message = "¡El CPU ganó!";
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

export function suitName(suit: Suit): string {
  return { hearts: "Corazones", diamonds: "Diamantes", clubs: "Tréboles", spades: "Espadas" }[suit];
}

export function suitSymbol(suit: Suit): string {
  return { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" }[suit];
}

export function suitColor(suit: Suit): string {
  return suit === "hearts" || suit === "diamonds" ? "#C0392B" : "#111111";
}

export function rankLabel(rank: Rank): string {
  if (rank === "Joker") return "★";
  return rank;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
