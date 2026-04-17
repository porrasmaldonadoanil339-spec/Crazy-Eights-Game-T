import { Card, Suit, Rank, createDeck, shuffleDeck, suitName, suitColor, suitSymbol, gm } from "./gameEngine";

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
  turnId: number;
  pendingDraw: number;
  pendingDrawType: "A" | "2" | "3" | "Joker" | "two" | "seven" | null;
  pendingDrawSuit: Suit | null;
  jActive: boolean;   // legacy
  jSuit: Suit | null; // legacy
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
    turnId: 0,
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
  // Joker — playable AT ANY TIME (definitive rules)
  if (card.rank === "Joker") return true;
  if (state.pendingDraw > 0) {
    if (state.pendingDrawType === "A") return card.rank === "A";
    if (state.pendingDrawType === "2") return card.rank === "2";
    if (state.pendingDrawType === "3") return card.rank === "3";
    if (state.pendingDrawType === "Joker") return false;
    return false;
  }
  if (card.rank === "8") return true;
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
  ns.turnId = (ns.turnId ?? 0) + 1;
  return ns;
}

export function multiPlayCard(state: MultiGameState, card: Card, chosenSuit?: Suit): MultiGameState {
  let ns = clone(state);
  ns.turnId = (ns.turnId ?? 0) + 1;
  const pidx = ns.currentPlayerIndex;

  ns.hands[pidx] = ns.hands[pidx].filter(c => c.id !== card.id);
  ns.discardPile.push(card);
  ns.jActive = false;
  ns.jSuit = null;
  ns.lastSkipped = undefined;

  if (ns.hands[pidx].length === 0) {
    ns.phase = "game_over";
    ns.winnerIndex = pidx;
    ns.message = gm("mpWon", { p: ns.playerNames[pidx] });
    return ns;
  }

  const next = nextPlayerIndex(ns);

  if (card.rank === "8") {
    if (chosenSuit) {
      ns.currentSuit = chosenSuit;
      ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
      ns.currentPlayerIndex = next;
      ns.phase = "pass_device";
      ns.message = gm("mp8Suit", { s: suitName(chosenSuit) });
    } else {
      ns.phase = "choosing_suit";
    }
    return ns;
  }

  if (card.rank === "Joker") {
    // Joker — +4 anytime, sets stack to "Joker" type
    ns.pendingDraw += 4;
    ns.pendingDrawType = "Joker";
    ns.pendingDrawSuit = null;
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = gm("mpJkrDraw", { p: ns.playerNames[next], n: String(ns.pendingDraw) });
    return ns;
  }

  if (card.rank === "A") {
    ns.pendingDraw += 1;
    ns.pendingDrawType = "A";
    ns.pendingDrawSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = gm("mpPlus2Draw", { p: ns.playerNames[next], n: String(ns.pendingDraw) });
    return ns;
  }

  if (card.rank === "2") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "2";
    ns.pendingDrawSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = gm("mpPlus2Draw", { p: ns.playerNames[next], n: String(ns.pendingDraw) });
    return ns;
  }

  if (card.rank === "3") {
    ns.pendingDraw += 3;
    ns.pendingDrawType = "3";
    ns.pendingDrawSuit = card.suit;
    ns.currentSuit = card.suit;
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = gm("mpPlus2Draw", { p: ns.playerNames[next], n: String(ns.pendingDraw) });
    return ns;
  }

  if (card.rank === "J") {
    // J — el siguiente pierde el turno (skip)
    const skipped = next;
    const skipNext = nextPlayerIndex({ ...ns, currentPlayerIndex: next });
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.lastSkipped = skipped;
    if (ns.playerCount === 2) {
      ns.currentPlayerIndex = pidx;
      ns.phase = "pass_device";
      ns.message = gm("mp3SkipYou", { p: ns.playerNames[next] });
    } else {
      ns.currentPlayerIndex = skipNext;
      ns.phase = "pass_device";
      ns.message = gm("mp3SkipOther", { p: ns.playerNames[skipped] });
    }
    return ns;
  }

  if (card.rank === "Q") {
    // Q — cambia el sentido del juego
    ns.direction = (ns.direction === 1 ? -1 : 1) as 1 | -1;
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    if (ns.playerCount === 2) {
      ns.currentPlayerIndex = pidx;
      ns.phase = "pass_device";
      ns.message = gm("mp10RevYou");
    } else {
      const newNext = nextPlayerIndex(ns);
      ns.currentPlayerIndex = newNext;
      ns.phase = "pass_device";
      ns.message = gm("mp10Rev");
    }
    return ns;
  }

  if (card.rank === "K") {
    // K — turno adicional (mismo jugador juega de nuevo)
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.currentPlayerIndex = pidx;
    ns.phase = "playing";
    ns.message = gm("mp3SkipYou", { p: ns.playerNames[next] });
    return ns;
  }

  // 7, 10 + 4/5/6/9 — cartas normales
  ns.currentSuit = card.suit;
  ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
  ns.currentPlayerIndex = next;
  ns.phase = "pass_device";
  ns.message = gm("mpPlayedCard", { r: card.rank, s: suitName(card.suit) });
  return ns;
}

export function multiDraw(state: MultiGameState): MultiGameState {
  let ns = clone(state);
  ns.turnId = (ns.turnId ?? 0) + 1;
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
    ns.message = gm("mpDrewN", { n: String(count) });
    return ns;
  }

  if (ns.drawPile.length === 0) ns = reshuffleMulti(ns);
  if (ns.drawPile.length === 0) {
    const next = nextPlayerIndex(ns);
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = gm("emptyDraw");
    return ns;
  }

  const card = ns.drawPile.pop()!;
  ns.hands[pidx] = [...ns.hands[pidx], card];

  if (multiCanPlay(card, ns)) {
    ns.message = gm("drewCard");
    ns.phase = "playing";
  } else {
    const next = nextPlayerIndex(ns);
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = gm("mpNoPlay", { p: ns.playerNames[next] });
  }
  return ns;
}

export function multiChooseSuit(state: MultiGameState, suit: Suit): MultiGameState {
  const ns = clone(state);
  ns.turnId = (ns.turnId ?? 0) + 1;
  ns.currentSuit = suit;
  const next = nextPlayerIndex(ns);
  ns.currentPlayerIndex = next;
  ns.phase = "pass_device";
  ns.message = gm("mpSuit", { s: suitName(suit) });
  return ns;
}

export function cpuPlayMulti(state: MultiGameState): MultiGameState {
  let ns = clone(state);
  ns.turnId = (ns.turnId ?? 0) + 1;
  const pidx = ns.currentPlayerIndex;
  const hand = ns.hands[pidx];

  const playable = hand.filter(c => multiCanPlay(c, ns));

  if (playable.length === 0) {
    return multiDraw(ns);
  }

  if (ns.pendingDraw > 0) {
    const stackRank = ns.pendingDrawType;
    const counters = playable.filter(c =>
      c.rank === "Joker" ||
      (stackRank === "A" && c.rank === "A") ||
      (stackRank === "2" && c.rank === "2") ||
      (stackRank === "3" && c.rank === "3")
    );
    if (counters.length > 0) {
      const nonJoker = counters.filter(c => c.rank !== "Joker");
      return multiPlayCard(ns, nonJoker[0] ?? counters[0], undefined);
    }
  }

  const specials = playable.filter(c => ["A", "2", "3", "J", "Q", "K"].includes(c.rank));
  const wilds = playable.filter(c => c.rank === "8" || c.rank === "Joker");
  const normal = playable.filter(c => !["8", "Joker"].includes(c.rank));

  let chosen: Card;
  if (specials.length > 0 && Math.random() > 0.4) {
    chosen = specials[Math.floor(Math.random() * specials.length)];
  } else if (normal.length > 0) {
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
