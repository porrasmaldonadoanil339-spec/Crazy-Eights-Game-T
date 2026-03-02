export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank =
  | "A" | "2" | "3" | "4" | "5" | "6" | "7"
  | "8" | "9" | "10" | "J" | "Q" | "K";

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
}

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const RANKS: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        suit,
        rank,
      });
    }
  }
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
  while (topCard.rank === "8" && safety < 20) {
    deck.push(topCard);
    shuffleDeck(deck);
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
  };
}

export function getTopCard(state: GameState): Card {
  return state.discardPile[state.discardPile.length - 1];
}

export function canPlay(card: Card, state: GameState): boolean {
  if (card.rank === "8") return true;
  return card.suit === state.currentSuit || card.rank === getTopCard(state).rank;
}

export function getPlayableCards(hand: Card[], state: GameState): Card[] {
  return hand.filter((c) => canPlay(c, state));
}

export function startPlaying(state: GameState): GameState {
  return { ...state, phase: "playing", message: "Tu turno — juega una carta" };
}

export function playCard(state: GameState, card: Card, chosenSuit?: Suit): GameState {
  const newState = deepClone(state);
  newState.playerHand = newState.playerHand.filter((c) => c.id !== card.id);
  newState.discardPile.push(card);
  newState.consecutiveDraws = 0;

  if (card.rank === "8") {
    if (chosenSuit) {
      newState.currentSuit = chosenSuit;
      newState.currentPlayer = "ai";
      newState.message = `Elegiste ${suitName(chosenSuit)}`;
    } else {
      newState.phase = "choosing_suit";
      newState.message = "Elige un palo";
      return newState;
    }
  } else {
    newState.currentSuit = card.suit;
    newState.currentPlayer = "ai";
    newState.message = "Turno del CPU...";
  }

  if (newState.playerHand.length === 0) {
    newState.phase = "player_wins";
    newState.message = "¡Ganaste!";
    return newState;
  }
  return newState;
}

export function chooseSuit(state: GameState, suit: Suit): GameState {
  const newState = deepClone(state);
  newState.currentSuit = suit;
  newState.phase = "playing";
  newState.currentPlayer = "ai";
  newState.message = `Elegiste ${suitName(suit)} — Turno del CPU...`;
  return newState;
}

export function playerDraw(state: GameState): GameState {
  let newState = deepClone(state);
  if (newState.drawPile.length === 0) {
    newState = reshuffleDiscard(newState);
  }
  if (newState.drawPile.length === 0) {
    newState.currentPlayer = "ai";
    newState.message = "Sin cartas — Turno del CPU";
    return newState;
  }
  const card = newState.drawPile.pop()!;
  newState.playerHand.push(card);
  newState.consecutiveDraws++;

  if (canPlay(card, newState)) {
    newState.message = "Robaste una carta (puedes jugarla)";
  } else {
    newState.message = "No puedes jugar — Turno del CPU";
    newState.currentPlayer = "ai";
  }
  return newState;
}

export function aiTurn(state: GameState, difficulty: string = "normal"): GameState {
  let newState = deepClone(state);
  const playable = getPlayableCards(newState.aiHand, newState);

  if (playable.length > 0) {
    const chosen = aiChooseCard(playable, newState, difficulty);
    newState.aiHand = newState.aiHand.filter((c) => c.id !== chosen.id);
    newState.discardPile.push(chosen);
    newState.consecutiveDraws = 0;

    if (chosen.rank === "8") {
      const suit = aiChooseSuit(newState.aiHand, difficulty);
      newState.currentSuit = suit;
      newState.message = `CPU jugó 8 y eligió ${suitName(suit)}`;
    } else {
      newState.currentSuit = chosen.suit;
      newState.message = `CPU jugó ${chosen.rank} de ${suitName(chosen.suit)}`;
    }

    if (newState.aiHand.length === 0) {
      newState.phase = "ai_wins";
      newState.message = "¡El CPU ganó!";
      return newState;
    }
    newState.currentPlayer = "player";
  } else {
    if (newState.drawPile.length === 0) {
      newState = reshuffleDiscard(newState);
    }
    if (newState.drawPile.length > 0) {
      const card = newState.drawPile.pop()!;
      newState.aiHand.push(card);
      newState.message = `CPU robó una carta (${newState.aiHand.length} cartas)`;
      newState.currentPlayer = "player";
    } else {
      newState.message = "Sin cartas — Empate";
      newState.phase = "draw";
    }
  }
  return newState;
}

function aiChooseCard(playable: Card[], state: GameState, difficulty: string): Card {
  // Easy: random
  if (difficulty === "easy") {
    if (Math.random() > 0.5) return playable[Math.floor(Math.random() * playable.length)];
  }

  const eights = playable.filter((c) => c.rank === "8");
  const nonEights = playable.filter((c) => c.rank !== "8");

  // Intermediate/Hard: save 8s for when needed
  if (nonEights.length > 0) {
    if (difficulty === "normal" || difficulty === "easy") {
      return nonEights[Math.floor(Math.random() * nonEights.length)];
    }
    // Intermediate/Hard: prefer cards that match most of hand suit
    const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
    for (const c of state.aiHand) suitCounts[c.suit]++;
    const sorted = [...nonEights].sort((a, b) => suitCounts[b.suit] - suitCounts[a.suit]);
    return sorted[0];
  }

  // Use 8 as last resort or if strategic
  return eights[0];
}

function aiChooseSuit(hand: Card[], difficulty: string): Suit {
  if (difficulty === "easy" && Math.random() > 0.6) {
    return SUITS[Math.floor(Math.random() * SUITS.length)];
  }
  const counts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
  for (const c of hand) counts[c.suit]++;
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
  const names: Record<Suit, string> = {
    hearts: "Corazones", diamonds: "Diamantes",
    clubs: "Treboles", spades: "Espadas",
  };
  return names[suit];
}

export function suitSymbol(suit: Suit): string {
  return { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" }[suit];
}

export function suitColor(suit: Suit): string {
  return suit === "hearts" || suit === "diamonds" ? "#C0392B" : "#111";
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
