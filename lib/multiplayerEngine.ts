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

function nextPlayerIndex(state: MultiGameState, skip = 0): number {
  const n = state.playerCount;
  let idx = (state.currentPlayerIndex + state.direction * (1 + skip) + n * 10) % n;
  return idx;
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

export function multiConfirmTurn(state: MultiGameState): MultiGameState {
  const ns = clone(state);
  ns.phase = "playing";
  ns.message = `Tu turno — juega una carta`;
  return ns;
}

export function multiPlayCard(state: MultiGameState, card: Card, chosenSuit?: Suit): MultiGameState {
  let ns = clone(state);
  const pidx = ns.currentPlayerIndex;

  ns.hands[pidx] = ns.hands[pidx].filter(c => c.id !== card.id);
  ns.discardPile.push(card);
  ns.jActive = false;
  ns.jSuit = null;

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
      ns.message = `8 Loco → ${suitName(chosenSuit)}. Turno de ${ns.playerNames[next]}`;
    } else {
      ns.phase = "choosing_suit";
      ns.message = "Elige un palo";
    }
    return ns;
  }

  if (card.rank === "Joker") {
    if (ns.pendingDraw > 0) {
      ns.pendingDraw += 5;
      ns.currentPlayerIndex = next;
      ns.phase = "pass_device";
      ns.message = `Comodín → ${ns.playerNames[next]} debe robar ${ns.pendingDraw}`;
    } else {
      if (chosenSuit) {
        ns.currentSuit = chosenSuit;
        ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
        ns.currentPlayerIndex = next;
        ns.phase = "pass_device";
        ns.message = `Comodín → ${suitName(chosenSuit)}. Turno de ${ns.playerNames[next]}`;
      } else {
        ns.phase = "choosing_suit";
        ns.message = "Elige un palo (Comodín)";
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
    ns.message = `2 → ${ns.playerNames[next]} roba ${ns.pendingDraw} (o defiende)`;
    return ns;
  }

  if (card.rank === "A" && state.pendingDraw > 0 && state.pendingDrawType === "two") {
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.currentSuit = card.suit;
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = `As → Robo cancelado. Turno de ${ns.playerNames[next]}`;
    return ns;
  }

  if (card.rank === "3") {
    // Skip next player, go to the one after
    const skipNext = nextPlayerIndex(ns, 1);
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    ns.currentPlayerIndex = skipNext;
    ns.phase = "pass_device";
    ns.message = `3 → ${ns.playerNames[next]} pierde turno. Turno de ${ns.playerNames[skipNext]}`;
    return ns;
  }

  if (card.rank === "7") {
    ns.pendingDraw += 2;
    ns.pendingDrawType = "seven";
    ns.currentSuit = card.suit;
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = `7 → ${ns.playerNames[next]} roba ${ns.pendingDraw} (o defiende)`;
    return ns;
  }

  if (card.rank === "10") {
    ns.direction = (ns.direction === 1 ? -1 : 1) as 1 | -1;
    ns.currentSuit = card.suit;
    ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
    if (ns.playerCount === 2) {
      // In 2 players, reverse = same player goes again
      ns.phase = "playing";
      ns.message = `10 → Dirección invertida. ¡Juegas de nuevo!`;
    } else {
      // In 3-4 players, reverse changes order, current player goes again
      ns.phase = "playing";
      ns.message = `10 → Dirección invertida. ¡Juegas de nuevo!`;
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

  // Normal card
  ns.currentSuit = card.suit;
  ns.pendingDraw = 0; ns.pendingDrawType = null; ns.pendingDrawSuit = null;
  ns.currentPlayerIndex = next;
  ns.phase = "pass_device";
  ns.message = `Turno de ${ns.playerNames[next]}`;
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
    ns.message = `Robaste ${count} cartas. Turno de ${ns.playerNames[next]}`;
    return ns;
  }

  if (ns.drawPile.length === 0) ns = reshuffleMulti(ns);
  if (ns.drawPile.length === 0) {
    const next = nextPlayerIndex(ns);
    ns.currentPlayerIndex = next;
    ns.phase = "pass_device";
    ns.message = `Sin cartas. Turno de ${ns.playerNames[next]}`;
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
    ns.message = `Sin jugada. Turno de ${ns.playerNames[next]}`;
  }
  return ns;
}

export function multiChooseSuit(state: MultiGameState, suit: Suit): MultiGameState {
  const ns = clone(state);
  ns.currentSuit = suit;
  const next = nextPlayerIndex(ns);
  ns.currentPlayerIndex = next;
  ns.phase = "pass_device";
  ns.message = `Palo: ${suitName(suit)}. Turno de ${ns.playerNames[next]}`;
  return ns;
}
