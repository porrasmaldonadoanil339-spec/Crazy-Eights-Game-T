import { Card, Suit, Rank, createDeck, shuffleDeck, suitName, suitColor, suitSymbol } from "./gameEngine";

export type { Suit, Rank, Card };
export { suitName, suitColor, suitSymbol };

export interface MultiGameState {
  hands: Card[][];
  drawPile: Card[];
  discardPile: Card[];
  currentSuit: Suit;
  currentPlayerIndex: number;
  playerCount: number;
  playerNames: string[];
  phase: "pass_device" | "playing" | "choosing_suit" | "game_over";
  winnerIndex: number | null;
  message: string;
  direction: 1 | -1;
  pendingDraw: number;
  pendingDrawType: "two" | "seven" | null;
  pendingDrawSuit: Suit | null;
  jActive: boolean;
  jSuit: Suit | null;
  lastSkipped?: number;
}

export function initMultiGame(playerNames: string[], cardsPerPlayer = 8): MultiGameState {
  const deck = createDeck();
  const playerCount = playerNames.length;
  const hands: Card[][] = [];
  for (let i = 0; i < playerCount; i++) {
    hands.push(deck.splice(0, cardsPerPlayer));
  }

  let topCard = deck.splice(0, 1)[0];
  let safety = 0;
  while ((topCard.rank === "8" || topCard.rank === "Joker") && safety < 20) {
    deck.push(topCard);
    const sh = shuffleDeck(deck);
    sh.forEach((c, i) => { deck[i] = c; });
    topCard = deck.splice(0, 1)[0];
    safety++;
  }

  return {
    hands,
    drawPile: deck,
    discardPile: [topCard],
    currentSuit: topCard.suit,
    currentPlayerIndex: 0,
    playerCount,
    playerNames,
    phase: "pass_device",
    winnerIndex: null,
    message: `Turno de ${playerNames[0]}`,
    direction: 1,
    pendingDraw: 0,
    pendingDrawType: null,
    pendingDrawSuit: null,
    jActive: false,
    jSuit: null,
    lastSkipped: undefined,
  };
}

export function multiGetTopCard(state: MultiGameState): Card {
  return state.discardPile[state.discardPile.length - 1];
}

export function multiCanPlay(card: Card, state: MultiGameState): boolean {
  if (state.jActive && state.jSuit) {
    return card.suit === state.jSuit || card.rank === "8" || card.rank === "Joker";
  }
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
  if (card.rank === "8" || card.rank === "Joker") return true;
  return card.suit === state.currentSuit || card.rank === multiGetTopCard(state).rank;
}

export function nextPlayerIndex(state: MultiGameState, skip = 0): number {
  const n = state.playerCount;
  return (state.currentPlayerIndex + state.direction * (1 + skip) + n * 10) % n;
}

function reshuffleMulti(state: MultiGameState): MultiGameState {
  if (state.discardPile.length <= 1) return state;
  const top = state.discardPile[state.discardPile.length - 1];
  const toShuffle = state.discardPile.slice(0, -1);
  state.drawPile = shuffleDeck(toShuffle);
  state.discardPile = [top];
  return state;
}

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function drawCards(ns: MultiGameState, playerIdx: number, count: number): MultiGameState {
  for (let i = 0; i < count; i++) {
    if (ns.drawPile.length === 0) ns = reshuffleMulti(ns);
    if (ns.drawPile.length > 0) {
      ns.hands[playerIdx] = [...ns.hands[playerIdx], ns.drawPile.pop()!];
    }
  }
  return ns;
}

function chooseBestSuit(hand: Card[], excluding?: Card): Suit {
  const counts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
  for (const c of hand) {
    if (c.rank !== "Joker" && c.id !== excluding?.id) counts[c.suit]++;
  }
  const sorted = (Object.entries(counts) as [Suit, number][]).sort((a, b) => b[1] - a[1]);
  return sorted[0][0] ?? "hearts";
}

export function multiConfirmTurn(state: MultiGameState): MultiGameState {
  const ns = clone(state);
  ns.phase = "playing";
  ns.lastSkipped = undefined;
  return ns;
}

export function multiPlayCard(state: MultiGameState, card: Card, chosenSuit?: Suit): MultiGameState {
  let ns = clone(state);
  const pidx = ns.currentPlayerIndex;

  ns.hands[pidx] = ns.hands[pidx].filter(c => c.id !== card.id);
  ns.discardPile.push(card);
  ns.jActive = false;
  ns.jSuit = null;
  ns.lastSkipped = undefined;

  if (ns.hands[pidx].length === 0) {
    ns.phase = "game_over";
    ns.winnerIndex = pidx;
    ns.message = `¡${ns.playerNames[pidx]} ganó!`;
    return ns;
  }

  const next = nextPlayerIndex(ns);

  if (card.rank === "8") {
    if (chosenSuit) {
      ns.currentSuit = chosenSuit;
      ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
      ns.currentPlayerIndex = next;
      ns.phase = "pass_device";
      ns.message = `8 Loco → ${suitName(chosenSuit)}`;
    } else {
      ns.phase = "choosing_suit";
    }
    return ns;
  }

  if (card.rank === "Joker") {
    if (ns.pendingDraw > 0) {
      ns.pendingDraw += 5;
      ns.currentPlayerIndex = next;
      ns.phase = "pass_device";
      ns.message = `Comodín → ${ns.playerNames[next]} roba ${ns.pendingDraw}`;
    } else {
      if (chosenSuit) {
        ns.currentSuit = chosenSuit;
        ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
        ns.currentPlayerIndex = next;
        ns.phase = "pass_device";
        ns.message = `Comodín → ${suitName(chosenSuit)}`;
      } else {
        ns.phase = "choosing_suit";
      }
    }
    return ns;
  }

  if (card.rank === "2") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "two";
    ns.pendingDrawSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = `+2 → ${ns.playerNames[next]} roba ${ns.pendingDraw}`;
    return ns;
  }

  if (card.rank === "A" && state.pendingDraw > 0 && state.pendingDrawType === "two") {
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.currentSuit = card.suit;
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = `As → Robo cancelado`;
    return ns;
  }

  if (card.rank === "3") {
    const skipped = next;
    const skipNext = nextPlayerIndex({ ...ns, currentPlayerIndex: next });
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.lastSkipped = skipped;
    if (ns.playerCount === 2) {
      // In 2-player, player goes again
      ns.phase = "playing";
      ns.message = `3 → ${ns.playerNames[next]} pierde turno. ¡Juegas de nuevo!`;
    } else {
      ns.currentPlayerIndex = skipNext;
      ns.phase = "pass_device";
      ns.message = `3 → ${ns.playerNames[skipped]} pierde turno`;
    }
    return ns;
  }

  if (card.rank === "7") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "seven";
    ns.currentSuit = card.suit;
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = `+2 → ${ns.playerNames[next]} roba ${ns.pendingDraw}`;
    return ns;
  }

  if (card.rank === "10") {
    ns.direction = (ns.direction === 1 ? -1 : 1) as 1 | -1;
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    if (ns.playerCount === 2) {
      ns.phase = "playing";
      ns.message = `10 → ¡Dirección invertida! Juegas de nuevo`;
    } else {
      const newNext = nextPlayerIndex(ns); // recalculate with new direction
      ns.currentPlayerIndex = newNext;
      ns.phase = "pass_device";
      ns.message = `10 → ¡Dirección invertida!`;
    }
    return ns;
  }

  if (card.rank === "J") {
    ns.jActive = true;
    ns.jSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.phase = "playing";
    ns.message = `J → Juega otra de ${suitName(card.suit)}, o roba 1`;
    return ns;
  }

  ns.currentSuit = card.suit;
  ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
  ns.currentPlayerIndex = next;
  ns.phase = "pass_device";
  ns.message = `${card.rank} de ${suitName(card.suit)}`;
  return ns;
}

export function multiDraw(state: MultiGameState): MultiGameState {
  let ns = clone(state);
  const pidx = ns.currentPlayerIndex;

  if (ns.jActive) {
    ns.jActive = false;
    ns.jSuit = null;
  }

  if (ns.pendingDraw > 0) {
    const count = ns.pendingDraw;
    ns = drawCards(ns, pidx, count);
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    const next = nextPlayerIndex(ns);
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = `Robaste ${count} cartas`;
    return ns;
  }

  if (ns.drawPile.length === 0) ns = reshuffleMulti(ns);
  if (ns.drawPile.length === 0) {
    const next = nextPlayerIndex(ns);
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = `Sin cartas disponibles`;
    return ns;
  }

  const card = ns.drawPile.pop()!;
  ns.hands[pidx] = [...ns.hands[pidx], card];

  if (multiCanPlay(card, ns)) {
    ns.message = "Robaste una carta (puedes jugarla)";
    ns.phase = "playing";
  } else {
    const next = nextPlayerIndex(ns);
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = `Sin jugada — Turno de ${ns.playerNames[next]}`;
  }
  return ns;
}

export function multiChooseSuit(state: MultiGameState, suit: Suit): MultiGameState {
  const ns = clone(state);
  ns.currentSuit = suit;
  const next = nextPlayerIndex(ns);
  ns.currentPlayerIndex = next;
  ns.phase = "pass_device";
  ns.message = `Palo: ${suitName(suit)}`;
  return ns;
}

// CPU auto-play for online mode
export function cpuPlayMulti(state: MultiGameState): MultiGameState {
  let ns = clone(state);
  const pidx = ns.currentPlayerIndex;
  const hand = ns.hands[pidx];

  const playable = hand.filter(c => multiCanPlay(c, ns));

  if (playable.length === 0) {
    return multiDraw(ns);
  }

  // Priority: counter cards for pending draw
  if (ns.pendingDraw > 0) {
    const counters = playable.filter(c =>
      (ns.pendingDrawType === "two" && (c.rank === "2" || c.rank === "Joker" || c.rank === "A")) ||
      (ns.pendingDrawType === "seven" && (c.rank === "7" || c.rank === "Joker"))
    );
    if (counters.length > 0) {
      return multiPlayCard(ns, counters[0], undefined);
    }
  }

  // Prefer special attack cards
  const specials = playable.filter(c => ["2", "3", "7", "10"].includes(c.rank));
  const wilds = playable.filter(c => c.rank === "8" || c.rank === "Joker");
  const normal = playable.filter(c => !["8", "Joker"].includes(c.rank));

  let chosen: Card;
  if (specials.length > 0 && Math.random() > 0.4) {
    chosen = specials[Math.floor(Math.random() * specials.length)];
  } else if (normal.length > 0) {
    // Pick card that matches best suit in hand
    const counts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
    for (const c of hand) if (c.rank !== "Joker") counts[c.suit]++;
    const sorted = [...normal].sort((a, b) => counts[b.suit] - counts[a.suit]);
    chosen = sorted[0];
  } else {
    chosen = wilds[0];
  }

  let chosenSuit: Suit | undefined;
  if (chosen.rank === "8" || (chosen.rank === "Joker" && ns.pendingDraw === 0)) {
    chosenSuit = chooseBestSuit(hand, chosen);
  }

  return multiPlayCard(ns, chosen, chosenSuit);
}
