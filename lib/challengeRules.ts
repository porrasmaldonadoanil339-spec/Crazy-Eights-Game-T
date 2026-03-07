export interface ChallengeRule {
  id: string;
  titleEs: string;
  titleEn: string;
  titlePt: string;
  descEs: string;
  descEn: string;
  descPt: string;
  icon: string;
  color: string;
}

export const CHALLENGE_RULES: ChallengeRule[] = [
  {
    id: "only_red",
    titleEs: "Solo Rojas",
    titleEn: "Reds Only",
    titlePt: "Apenas Vermelhas",
    descEs: "Solo puedes jugar cartas rojas (corazones/diamantes) excepto el 8.",
    descEn: "You can only play red cards (hearts/diamonds) except 8s.",
    descPt: "Você só pode jogar cartas vermelhas (copas/ouros) exceto o 8.",
    icon: "heart",
    color: "#E74C3C",
  },
  {
    id: "only_black",
    titleEs: "Solo Negras",
    titleEn: "Blacks Only",
    titlePt: "Apenas Pretas",
    descEs: "Solo puedes jugar cartas negras (picas/tréboles) excepto el 8.",
    descEn: "You can only play black cards (spades/clubs) except 8s.",
    descPt: "Você só pode jogar cartas pretas (espadas/paus) exceto o 8.",
    icon: "leaf",
    color: "#2C3E50",
  },
  {
    id: "double_eights",
    titleEs: "Locos Dobles",
    titleEn: "Double Crazy",
    titlePt: "Loucos Duplos",
    descEs: "Los 8s aparecen con el doble de frecuencia en el mazo.",
    descEn: "8s appear twice as often in the deck.",
    descPt: "Os 8s aparecem com o dobro de frequência no baralho.",
    icon: "infinite",
    color: "#9B59B6",
  },
  {
    id: "win_fast",
    titleEs: "Victoria Rápida",
    titleEn: "Speed Win",
    titlePt: "Vitória Rápida",
    descEs: "Debes ganar en 15 turnos o menos.",
    descEn: "You must win in 15 turns or fewer.",
    descPt: "Você deve vencer em 15 turnos ou menos.",
    icon: "flash",
    color: "#FFD700",
  },
  {
    id: "no_draw",
    titleEs: "Sin Robar",
    titleEn: "No Drawing",
    titlePt: "Sem Comprar",
    descEs: "No puedes robar cartas. Si no puedes jugar, pierdes un turno.",
    descEn: "You cannot draw cards. If you cannot play, you lose a turn.",
    descPt: "Você não pode comprar cartas. Se não puder jogar, perde um turno.",
    icon: "ban",
    color: "#E67E22",
  },
  {
    id: "mirror",
    titleEs: "Espejo",
    titleEn: "Mirror Mode",
    titlePt: "Modo Espelho",
    descEs: "Cada vez que robas una carta, el rival también roba una.",
    descEn: "Each time you draw a card, the opponent draws one too.",
    descPt: "Cada vez que você comprar uma carta, o adversário também compra uma.",
    icon: "swap-horizontal",
    color: "#00BCD4",
  },
  {
    id: "face_only",
    titleEs: "Solo Figuras",
    titleEn: "Face Cards Only",
    titlePt: "Apenas Figuras",
    descEs: "El mazo tiene el doble de J, Q y K para más jugadas especiales.",
    descEn: "The deck has double J, Q, K for more special plays.",
    descPt: "O baralho tem o dobro de J, Q, K para mais jogadas especiais.",
    icon: "people",
    color: "#27AE60",
  },
  {
    id: "chaos",
    titleEs: "Caos Total",
    titleEn: "Total Chaos",
    titlePt: "Caos Total",
    descEs: "Cartas especiales (2, 7, 8, J) aparecen el doble de veces.",
    descEn: "Special cards (2, 7, 8, J) appear twice as often.",
    descPt: "Cartas especiais (2, 7, 8, J) aparecem o dobro das vezes.",
    icon: "skull",
    color: "#FF1744",
  },
  {
    id: "low_hand",
    titleEs: "Mano Pequeña",
    titleEn: "Small Hand",
    titlePt: "Mão Pequena",
    descEs: "Empiezas con solo 4 cartas en tu mano.",
    descEn: "You start with only 4 cards in your hand.",
    descPt: "Você começa com apenas 4 cartas na mão.",
    icon: "hand-left",
    color: "#4A90D9",
  },
  {
    id: "big_hand",
    titleEs: "Mano Grande",
    titleEn: "Big Hand",
    titlePt: "Mão Grande",
    descEs: "Empiezas con 12 cartas. ¡Vacíalas todas para ganar!",
    descEn: "You start with 12 cards. Empty them all to win!",
    descPt: "Você começa com 12 cartas. Esvazie todas para vencer!",
    icon: "layers",
    color: "#8B4513",
  },
];

export interface ActiveChallengeRules {
  rules: ChallengeRule[];
  maxTurns?: number;
  startingCards?: number;
}

export function generateChallengeRules(): ActiveChallengeRules {
  const shuffled = [...CHALLENGE_RULES].sort(() => Math.random() - 0.5);
  const count = Math.random() < 0.4 ? 2 : 1;
  const selectedRules = shuffled.slice(0, count);

  let maxTurns: number | undefined;
  let startingCards: number | undefined;

  for (const rule of selectedRules) {
    if (rule.id === "win_fast") maxTurns = 15;
    if (rule.id === "low_hand") startingCards = 4;
    if (rule.id === "big_hand") startingCards = 12;
  }

  return { rules: selectedRules, maxTurns, startingCards };
}

export function getChallengeRuleById(id: string): ChallengeRule | undefined {
  return CHALLENGE_RULES.find(r => r.id === id);
}

export function getRuleTitle(rule: ChallengeRule, lang: string): string {
  if (lang === "en") return rule.titleEn;
  if (lang === "pt") return rule.titlePt;
  return rule.titleEs;
}

export function getRuleDesc(rule: ChallengeRule, lang: string): string {
  if (lang === "en") return rule.descEn;
  if (lang === "pt") return rule.descPt;
  return rule.descEs;
}
