import React, { useEffect } from "react";
import {
  View, Text, StyleSheet, Modal, Pressable, ScrollView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { GameModeId } from "@/lib/gameModes";
import { useT } from "@/hooks/useT";
import { Lang, t as i18nT } from "@/lib/i18n";

interface ModeRule {
  icon: string;
  color: string;
  text: string;
}

interface TeamInfo {
  label: string;
  members: string[];
  color: string;
}

interface TurnStep {
  label: string;
  isPlayer?: boolean;
}

interface ModeContent {
  subtitle: string;
  description: string;
  teams?: TeamInfo[];
  rules: ModeRule[];
  turns?: TurnStep[];
  objective: string;
  rewardNote?: string;
}

function getModeContent(id: GameModeId, lang: Lang): ModeContent {
  const isEn = lang !== "es" && lang !== "pt";
  const isPt = lang === "pt";
  const isOther = lang !== "es" && lang !== "pt" && lang !== "en";

  const descKey: Partial<Record<GameModeId, "modeClassicDesc"|"modeRankedDesc"|"modeCoopDesc"|"modeLightningDesc"|"modeTournamentDesc"|"modeChallengeDesc"|"modePracticeDesc">> = {
    classic: "modeClassicDesc", ranked: "modeRankedDesc", coop: "modeCoopDesc",
    lightning: "modeLightningDesc", tournament: "modeTournamentDesc",
    challenge: "modeChallengeDesc", practice: "modePracticeDesc",
  };
  const dKey = descKey[id];
  const i18nDesc = isOther && dKey ? i18nT(dKey, lang) : null;

  const data: Record<GameModeId, { es: ModeContent; en: ModeContent; pt: ModeContent }> = {
    classic: {
      es: {
        subtitle: "El modo original de Ocho Locos",
        description:
          "Enfrenta a un rival con 8 cartas cada uno. Usa las cartas especiales para dominar: el 2 hace robar, el 7 da cartas al rival, el 8 cambia el palo, el 10 invierte el turno, la J salta y el Comodín es salvaje. ¡El primero en vaciar su mano gana!",
        teams: [
          { label: "Tú", members: ["Tú"], color: "#D4AF37" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "card", color: "#D4AF37", text: "8 cartas por jugador" },
          { icon: "flash", color: "#FFD700", text: "Cartas especiales: 2, 3, 7, 8, 10, J, Comodín" },
          { icon: "trophy", color: "#27AE60", text: "Gana vaciando tu mano primero" },
          { icon: "timer", color: "#E74C3C", text: "Modo Experto: timer de 8 seg por turno" },
        ],
        turns: [
          { label: "Tú", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Vaciar tu mano de cartas antes que el rival.",
        rewardNote: "Recompensa extra por dificultad más alta.",
      },
      en: {
        subtitle: "The original Ocho Locos mode",
        description:
          "Face one opponent with 8 cards each. Use special cards to dominate: 2 makes them draw, 7 passes cards to the rival, 8 changes the suit, 10 reverses turn order, J skips, and the Joker is wild. First to empty their hand wins!",
        teams: [
          { label: "You", members: ["You"], color: "#D4AF37" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "card", color: "#D4AF37", text: "8 cards per player" },
          { icon: "flash", color: "#FFD700", text: "Special cards: 2, 3, 7, 8, 10, J, Joker" },
          { icon: "trophy", color: "#27AE60", text: "Win by emptying your hand first" },
          { icon: "timer", color: "#E74C3C", text: "Expert mode: 8-second turn timer" },
        ],
        turns: [
          { label: "You", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Empty your hand of cards before the opponent.",
        rewardNote: "Higher difficulty = higher reward multiplier.",
      },
      pt: {
        subtitle: "O modo original do Ocho Locos",
        description:
          "Enfrente um rival com 8 cartas cada. Use cartas especiais: 2 faz comprar, 7 passa cartas ao rival, 8 muda o naipe, 10 inverte a ordem, J pula e o Curinga é coringa. Quem esvaziar a mão primeiro vence!",
        teams: [
          { label: "Você", members: ["Você"], color: "#D4AF37" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "card", color: "#D4AF37", text: "8 cartas por jogador" },
          { icon: "flash", color: "#FFD700", text: "Cartas especiais: 2, 3, 7, 8, 10, J, Curinga" },
          { icon: "trophy", color: "#27AE60", text: "Vença esvaziando sua mão primeiro" },
          { icon: "timer", color: "#E74C3C", text: "Modo Especialista: timer de 8 seg por turno" },
        ],
        turns: [
          { label: "Você", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Esvaziar sua mão antes do oponente.",
        rewardNote: "Dificuldade maior = multiplicador de recompensa maior.",
      },
    },
    lightning: {
      es: {
        subtitle: "Velocidad y reflejos al límite",
        description:
          "Partida exprés con solo 5 cartas. ¡Cada decisión cuenta! Si juegas en modo Experto tendrás solo 8 segundos por turno. El que vacíe la mano primero se lleva la victoria.",
        teams: [
          { label: "Tú", members: ["Tú"], color: "#FFD700" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "flash", color: "#FFD700", text: "Solo 5 cartas por jugador" },
          { icon: "timer", color: "#E74C3C", text: "Partida ultrarrápida" },
          { icon: "card", color: "#D4AF37", text: "Todas las cartas especiales activas" },
          { icon: "trophy", color: "#27AE60", text: "Sin desempates: el primero en vaciar gana" },
        ],
        turns: [
          { label: "Tú", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Vaciar 5 cartas antes que el rival en el menor tiempo posible.",
        rewardNote: "Partidas más cortas pero recompensa garantizada.",
      },
      en: {
        subtitle: "Speed and reflexes to the limit",
        description:
          "Express match with only 5 cards. Every decision counts! In Expert mode you have just 8 seconds per turn. The one who empties their hand first takes the victory.",
        teams: [
          { label: "You", members: ["You"], color: "#FFD700" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "flash", color: "#FFD700", text: "Only 5 cards per player" },
          { icon: "timer", color: "#E74C3C", text: "Ultra-fast matches" },
          { icon: "card", color: "#D4AF37", text: "All special cards active" },
          { icon: "trophy", color: "#27AE60", text: "No tiebreaker: first to empty hand wins" },
        ],
        turns: [
          { label: "You", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Empty 5 cards before the rival as fast as possible.",
        rewardNote: "Shorter games, guaranteed reward.",
      },
      pt: {
        subtitle: "Velocidade e reflexos no limite",
        description:
          "Partida expresso com apenas 5 cartas. Cada decisão conta! No modo Especialista você tem apenas 8 segundos por turno. Quem esvaziar a mão primeiro leva a vitória.",
        teams: [
          { label: "Você", members: ["Você"], color: "#FFD700" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "flash", color: "#FFD700", text: "Apenas 5 cartas por jogador" },
          { icon: "timer", color: "#E74C3C", text: "Partidas ultra-rápidas" },
          { icon: "card", color: "#D4AF37", text: "Todas as cartas especiais ativas" },
          { icon: "trophy", color: "#27AE60", text: "Sem desempate: quem esvaziar primeiro vence" },
        ],
        turns: [
          { label: "Você", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Esvaziar 5 cartas antes do rival o mais rápido possível.",
        rewardNote: "Partidas mais curtas, recompensa garantida.",
      },
    },
    tournament: {
      es: {
        subtitle: "El camino del campeón — mejor de 3",
        description:
          "Compite en un torneo al mejor de 3 rondas. Gana la primera o segunda ronda para obtener ventaja; si quedas 1-1, una ronda final decide al ganador. ¡Solo el mejor avanza!",
        teams: [
          { label: "Tú", members: ["Tú"], color: "#E67E22" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "trophy", color: "#E67E22", text: "Formato: mejor de 3 rondas" },
          { icon: "card", color: "#D4AF37", text: "8 cartas por ronda" },
          { icon: "star", color: "#FFD700", text: "Gana rondas para acumular estrellas" },
          { icon: "shield-checkmark", color: "#27AE60", text: "Al 1-1 se juega ronda final decisiva" },
        ],
        turns: [
          { label: "Tú", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Ganar 2 de 3 rondas para llevarte el trofeo.",
        rewardNote: "Mayor recompensa que el modo Clásico por la intensidad.",
      },
      en: {
        subtitle: "The champion's path — best of 3",
        description:
          "Compete in a best-of-3 tournament. Win the first or second round for an advantage; if it's 1-1, a final round decides the winner. Only the best advances!",
        teams: [
          { label: "You", members: ["You"], color: "#E67E22" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "trophy", color: "#E67E22", text: "Format: best of 3 rounds" },
          { icon: "card", color: "#D4AF37", text: "8 cards per round" },
          { icon: "star", color: "#FFD700", text: "Win rounds to accumulate stars" },
          { icon: "shield-checkmark", color: "#27AE60", text: "At 1-1, a decisive final round is played" },
        ],
        turns: [
          { label: "You", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Win 2 of 3 rounds to take the trophy.",
        rewardNote: "Higher reward than Classic due to intensity.",
      },
      pt: {
        subtitle: "O caminho do campeão — melhor de 3",
        description:
          "Compita em um torneio no melhor de 3 rodadas. Vença a primeira ou segunda rodada para ter vantagem; se ficar 1-1, uma rodada final decide o vencedor. Apenas o melhor avança!",
        teams: [
          { label: "Você", members: ["Você"], color: "#E67E22" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "trophy", color: "#E67E22", text: "Formato: melhor de 3 rodadas" },
          { icon: "card", color: "#D4AF37", text: "8 cartas por rodada" },
          { icon: "star", color: "#FFD700", text: "Vença rodadas para acumular estrelas" },
          { icon: "shield-checkmark", color: "#27AE60", text: "No 1-1, rodada final decisiva é jogada" },
        ],
        turns: [
          { label: "Você", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Vencer 2 de 3 rodadas para levar o troféu.",
        rewardNote: "Recompensa maior que o Clássico pela intensidade.",
      },
    },
    coop: {
      es: {
        subtitle: "2 vs 2 — Trabajo en equipo",
        description:
          "Únete a un aliado y enfrenten juntos a dos rivales. El turno alterna: Tú → Aliado → Rival 1 → Rival 2. Cada equipo comparte un mazo de 8 cartas. ¡Coordínate con tu aliado para vaciar el mazo primero!",
        teams: [
          { label: "Equipo 1", members: ["Tú", "Aliado CPU"], color: "#27AE60" },
          { label: "Equipo 2", members: ["Rival 1", "Rival 2"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "people", color: "#27AE60", text: "2 vs 2: Tú + Aliado vs 2 Rivales" },
          { icon: "card", color: "#D4AF37", text: "Cada equipo comparte un mazo de 8 cartas" },
          { icon: "swap-horizontal", color: "#27AE60", text: "Turnos: Tú → Aliado → Rival 1 → Rival 2" },
          { icon: "trophy", color: "#FFD700", text: "Gana el equipo que vacíe el mazo primero" },
        ],
        turns: [
          { label: "Tú", isPlayer: true },
          { label: "Aliado" },
          { label: "Rival 1" },
          { label: "Rival 2" },
        ],
        objective: "Coordínate con tu aliado para vaciar el mazo antes que los rivales.",
        rewardNote: "Bonificación de equipo por victoria cooperativa.",
      },
      en: {
        subtitle: "2 vs 2 — Teamwork",
        description:
          "Join an ally and face two rivals together. Turns alternate: You → Ally → Rival 1 → Rival 2. Each team shares a deck of 8 cards. Coordinate with your ally to empty the deck first!",
        teams: [
          { label: "Team 1", members: ["You", "CPU Ally"], color: "#27AE60" },
          { label: "Team 2", members: ["Rival 1", "Rival 2"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "people", color: "#27AE60", text: "2 vs 2: You + Ally vs 2 Rivals" },
          { icon: "card", color: "#D4AF37", text: "Each team shares one deck of 8 cards" },
          { icon: "swap-horizontal", color: "#27AE60", text: "Turns: You → Ally → Rival 1 → Rival 2" },
          { icon: "trophy", color: "#FFD700", text: "Team that empties their deck first wins" },
        ],
        turns: [
          { label: "You", isPlayer: true },
          { label: "Ally" },
          { label: "Rival 1" },
          { label: "Rival 2" },
        ],
        objective: "Coordinate with your ally to empty the deck before the rivals.",
        rewardNote: "Team bonus for cooperative victory.",
      },
      pt: {
        subtitle: "2 vs 2 — Trabalho em equipe",
        description:
          "Una-se a um aliado e enfrente dois rivais juntos. Os turnos se alternam: Você → Aliado → Rival 1 → Rival 2. Cada equipe compartilha um baralho de 8 cartas. Coordene-se com seu aliado para esvaziar o baralho primeiro!",
        teams: [
          { label: "Equipe 1", members: ["Você", "Aliado CPU"], color: "#27AE60" },
          { label: "Equipe 2", members: ["Rival 1", "Rival 2"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "people", color: "#27AE60", text: "2 vs 2: Você + Aliado vs 2 Rivais" },
          { icon: "card", color: "#D4AF37", text: "Cada equipe compartilha um baralho de 8 cartas" },
          { icon: "swap-horizontal", color: "#27AE60", text: "Turnos: Você → Aliado → Rival 1 → Rival 2" },
          { icon: "trophy", color: "#FFD700", text: "A equipe que esvaziar o baralho primeiro vence" },
        ],
        turns: [
          { label: "Você", isPlayer: true },
          { label: "Aliado" },
          { label: "Rival 1" },
          { label: "Rival 2" },
        ],
        objective: "Coordene-se com seu aliado para esvaziar o baralho antes dos rivais.",
        rewardNote: "Bônus de equipe pela vitória cooperativa.",
      },
    },
    challenge: {
      es: {
        subtitle: "Retos diarios con reglas especiales",
        description:
          "Cada partida trae una regla mutante que cambia las normas del juego: solo cartas rojas, victoria en 15 turnos, sin robar cartas, modo espejo y más. Completa los retos para ganar recompensas únicas y monedas extra.",
        teams: [
          { label: "Tú", members: ["Tú"], color: "#9B59B6" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "ribbon", color: "#9B59B6", text: "Regla aleatoria activa en cada partida" },
          { icon: "flash", color: "#FFD700", text: "Ejemplos: Solo Rojas, Victoria Rápida, Sin Robar" },
          { icon: "checkmark-circle", color: "#27AE60", text: "Cumple objetivos diarios para recompensas" },
          { icon: "gift", color: "#D4AF37", text: "Recompensas únicas y monedas extra al completar" },
        ],
        turns: [
          { label: "Tú", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Completar los desafíos diarios y ganar con las reglas especiales activas.",
        rewardNote: "Las recompensas de desafío son únicas y no se consiguen en otros modos.",
      },
      en: {
        subtitle: "Daily challenges with special rules",
        description:
          "Each match brings a mutant rule that changes the game: red cards only, win in 15 turns, no drawing, mirror mode and more. Complete challenges to earn unique rewards and extra coins.",
        teams: [
          { label: "You", members: ["You"], color: "#9B59B6" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "ribbon", color: "#9B59B6", text: "Random rule active each match" },
          { icon: "flash", color: "#FFD700", text: "Examples: Reds Only, Speed Win, No Drawing" },
          { icon: "checkmark-circle", color: "#27AE60", text: "Complete daily objectives for rewards" },
          { icon: "gift", color: "#D4AF37", text: "Unique rewards and bonus coins on completion" },
        ],
        turns: [
          { label: "You", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Complete daily challenges and win with special rules active.",
        rewardNote: "Challenge rewards are unique — only available in this mode.",
      },
      pt: {
        subtitle: "Desafios diários com regras especiais",
        description:
          "Cada partida traz uma regra mutante que muda o jogo: apenas cartas vermelhas, vitória em 15 turnos, sem comprar cartas, modo espelho e mais. Complete desafios para ganhar recompensas únicas e moedas extras.",
        teams: [
          { label: "Você", members: ["Você"], color: "#9B59B6" },
          { label: "Rival", members: ["CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "ribbon", color: "#9B59B6", text: "Regra aleatória ativa em cada partida" },
          { icon: "flash", color: "#FFD700", text: "Exemplos: Apenas Vermelhas, Vitória Rápida, Sem Comprar" },
          { icon: "checkmark-circle", color: "#27AE60", text: "Complete objetivos diários para recompensas" },
          { icon: "gift", color: "#D4AF37", text: "Recompensas únicas e moedas extras ao completar" },
        ],
        turns: [
          { label: "Você", isPlayer: true },
          { label: "CPU" },
        ],
        objective: "Completar os desafios diários e vencer com as regras especiais ativas.",
        rewardNote: "Recompensas de desafio são únicas — só disponíveis neste modo.",
      },
    },
    practice: {
      es: {
        subtitle: "Aprende sin presión ni penalización",
        description:
          "Modo ideal para nuevos jugadores. La IA juega despacio, hay pistas visuales que te muestran la mejor jugada y no hay timer. No importa si pierdes: cada partida de Práctica te hace mejor jugador.",
        teams: [
          { label: "Tú", members: ["Tú"], color: "#1A8FC1" },
          { label: "Rival", members: ["CPU Fácil"], color: "#7F8C8D" },
        ],
        rules: [
          { icon: "school", color: "#1A8FC1", text: "IA en nivel más fácil (Easy)" },
          { icon: "bulb", color: "#FFD700", text: "Pistas visuales para la mejor jugada" },
          { icon: "timer-outline", color: "#7F8C8D", text: "Sin límite de tiempo (30 seg timer)" },
          { icon: "happy", color: "#27AE60", text: "Sin penalización por perder" },
        ],
        turns: [
          { label: "Tú", isPlayer: true },
          { label: "CPU Fácil" },
        ],
        objective: "Practicar las reglas sin presión. Aprende a dominar las cartas especiales.",
        rewardNote: "Recompensa reducida, pero sin riesgo de perder.",
      },
      en: {
        subtitle: "Learn without pressure or penalties",
        description:
          "Ideal mode for new players. The AI plays slowly, visual hints show you the best play, and there's no timer. It doesn't matter if you lose — each Practice game makes you a better player.",
        teams: [
          { label: "You", members: ["You"], color: "#1A8FC1" },
          { label: "Rival", members: ["Easy CPU"], color: "#7F8C8D" },
        ],
        rules: [
          { icon: "school", color: "#1A8FC1", text: "AI at lowest difficulty (Easy)" },
          { icon: "bulb", color: "#FFD700", text: "Visual hints for best play" },
          { icon: "timer-outline", color: "#7F8C8D", text: "No time pressure (30s timer)" },
          { icon: "happy", color: "#27AE60", text: "No penalty for losing" },
        ],
        turns: [
          { label: "You", isPlayer: true },
          { label: "Easy CPU" },
        ],
        objective: "Practice the rules without pressure. Learn to master the special cards.",
        rewardNote: "Reduced reward, but zero risk.",
      },
      pt: {
        subtitle: "Aprenda sem pressão ou penalidades",
        description:
          "Modo ideal para novos jogadores. A IA joga devagar, dicas visuais mostram a melhor jogada e não há timer. Não importa se perder — cada partida de Prática te torna um jogador melhor.",
        teams: [
          { label: "Você", members: ["Você"], color: "#1A8FC1" },
          { label: "Rival", members: ["CPU Fácil"], color: "#7F8C8D" },
        ],
        rules: [
          { icon: "school", color: "#1A8FC1", text: "IA no nível mais fácil (Fácil)" },
          { icon: "bulb", color: "#FFD700", text: "Dicas visuais para a melhor jogada" },
          { icon: "timer-outline", color: "#7F8C8D", text: "Sem pressão de tempo (timer de 30s)" },
          { icon: "happy", color: "#27AE60", text: "Sem penalidade por perder" },
        ],
        turns: [
          { label: "Você", isPlayer: true },
          { label: "CPU Fácil" },
        ],
        objective: "Praticar as regras sem pressão. Aprenda a dominar as cartas especiais.",
        rewardNote: "Recompensa reduzida, mas sem risco de perder.",
      },
    },
    ranked: {
      es: {
        subtitle: "Sube de rango en la Clasificatoria",
        description:
          "El modo más competitivo. Sube estrellas ganando, pierde estrellas con las derrotas. Asciende de Bronce a Gran Maestro. Solo disponible desde el nivel 5. ¡Demuestra tu nivel!",
        teams: [
          { label: "Tú", members: ["Tú"], color: "#D4AF37" },
          { label: "Rival", members: ["CPU Rankeado"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "trophy", color: "#D4AF37", text: "Sistema de estrellas por partida" },
          { icon: "trending-up", color: "#27AE60", text: "Gana: +1 estrella / Pierde: -1 estrella" },
          { icon: "medal", color: "#FFD700", text: "Rangos: Bronce → Plata → Oro → Platino → Diamante → Maestro → Gran Maestro" },
          { icon: "lock-open", color: "#1A8FC1", text: "Requiere nivel 5 para desbloquear" },
        ],
        turns: [
          { label: "Tú", isPlayer: true },
          { label: "CPU Rival" },
        ],
        objective: "Ganar estrellas para ascender de rango y llegar al Gran Maestro.",
        rewardNote: "Recompensas especiales de temporada al final de cada season.",
      },
      en: {
        subtitle: "Climb the Ranked ladder",
        description:
          "The most competitive mode. Gain stars by winning, lose stars with defeats. Climb from Bronze to Grand Master. Available from level 5 only. Show your true skill!",
        teams: [
          { label: "You", members: ["You"], color: "#D4AF37" },
          { label: "Rival", members: ["Ranked CPU"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "trophy", color: "#D4AF37", text: "Star system per match" },
          { icon: "trending-up", color: "#27AE60", text: "Win: +1 star / Lose: -1 star" },
          { icon: "medal", color: "#FFD700", text: "Ranks: Bronze → Silver → Gold → Platinum → Diamond → Master → Grand Master" },
          { icon: "lock-open", color: "#1A8FC1", text: "Requires level 5 to unlock" },
        ],
        turns: [
          { label: "You", isPlayer: true },
          { label: "CPU Rival" },
        ],
        objective: "Win stars to climb ranks and reach Grand Master.",
        rewardNote: "Special season rewards at the end of every season.",
      },
      pt: {
        subtitle: "Suba na Classificatória",
        description:
          "O modo mais competitivo. Ganhe estrelas vencendo, perca estrelas com derrotas. Suba de Bronze a Gran Maestro. Disponível a partir do nível 5. Mostre seu verdadeiro nível!",
        teams: [
          { label: "Você", members: ["Você"], color: "#D4AF37" },
          { label: "Rival", members: ["CPU Ranqueado"], color: "#E74C3C" },
        ],
        rules: [
          { icon: "trophy", color: "#D4AF37", text: "Sistema de estrelas por partida" },
          { icon: "trending-up", color: "#27AE60", text: "Vencer: +1 estrela / Perder: -1 estrela" },
          { icon: "medal", color: "#FFD700", text: "Ranks: Bronze → Prata → Ouro → Platina → Diamante → Mestre → Gran Maestro" },
          { icon: "lock-open", color: "#1A8FC1", text: "Requer nível 5 para desbloquear" },
        ],
        turns: [
          { label: "Você", isPlayer: true },
          { label: "CPU Rival" },
        ],
        objective: "Ganhar estrelas para subir de rank e chegar ao Gran Maestro.",
        rewardNote: "Recompensas especiais de temporada no final de cada season.",
      },
    },
  };

  const entry = data[id];
  if (!entry) return data.classic.en;
  if (isOther && i18nDesc) {
    const base = entry.en;
    return { ...base, description: i18nDesc };
  }
  if (isEn) return entry.en;
  if (isPt) return entry.pt;
  return entry.es;
}

interface ModeInfoModalProps {
  visible: boolean;
  modeId: GameModeId | null;
  modeName: string;
  modeColor: string;
  modeIcon: string;
  coins: number;
  xp: number;
  hasDifficulty: boolean;
  lang: Lang;
  onClose: () => void;
  onPlay: () => void;
}

export function ModeInfoModal({
  visible, modeId, modeName, modeColor, modeIcon, coins, xp, hasDifficulty, lang, onClose, onPlay,
}: ModeInfoModalProps) {
  const T = useT();
  const insets = useSafeAreaInsets();
  const sc = useSharedValue(0.92);
  const op = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      sc.value = withSpring(1, { damping: 18, stiffness: 200 });
      op.value = withTiming(1, { duration: 200 });
    } else {
      sc.value = 0.92;
      op.value = 0;
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sc.value }],
    opacity: op.value,
  }));

  if (!modeId) return null;

  const content = getModeContent(modeId, lang);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const playLabel = lang === "pt" ? "JOGAR" : lang === "es" ? "JUGAR" : "PLAY";
  const selectDiffLabel = lang === "pt" ? "SELECIONAR DIFICULDADE" : lang === "es" ? "SELECCIONAR DIFICULTAD" : "SELECT DIFFICULTY";
  const teamsLabel = lang === "pt" ? "EQUIPES" : lang === "es" ? "EQUIPOS" : "TEAMS";
  const rulesLabel = lang === "pt" ? "REGRAS" : lang === "es" ? "REGLAS" : "RULES";
  const turnsLabel = lang === "pt" ? "ORDEM DE TURNOS" : lang === "es" ? "ORDEN DE TURNOS" : "TURN ORDER";
  const objectiveLabel = lang === "pt" ? "OBJETIVO" : lang === "es" ? "OBJETIVO" : "OBJECTIVE";
  const rewardsLabel = lang === "pt" ? "RECOMPENSAS" : lang === "es" ? "RECOMPENSAS" : "REWARDS";

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.sheet, { paddingTop: topPad + 8, paddingBottom: botPad + 8 }, animStyle]}>
          <Pressable onPress={() => {}} style={{ flex: 1 }}>
            <LinearGradient
              colors={["#041008", "#071510", "#0a1a0f"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.topAccent, { backgroundColor: modeColor + "22" }]} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

              {/* Header */}
              <View style={styles.header}>
                <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
                  <Ionicons name="close" size={22} color="#ffffff88" />
                </Pressable>
                <View style={[styles.modeIconWrap, { backgroundColor: modeColor + "25", borderColor: modeColor + "44" }]}>
                  <Ionicons name={modeIcon as any} size={36} color={modeColor} />
                </View>
                <Text style={[styles.modeName, { color: modeColor }]}>{modeName.toUpperCase()}</Text>
                <Text style={styles.modeSubtitle}>{content.subtitle}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: modeColor + "30" }]} />

              {/* Description */}
              <View style={styles.section}>
                <Text style={styles.description}>{content.description}</Text>
              </View>

              {/* Teams */}
              {content.teams && content.teams.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="people" size={13} color={Colors.gold} />
                    <Text style={styles.sectionLabel}>{teamsLabel}</Text>
                  </View>
                  <View style={styles.teamsRow}>
                    {content.teams.map((team, i) => (
                      <React.Fragment key={i}>
                        <View style={[styles.teamCard, { borderColor: team.color + "44", backgroundColor: team.color + "12" }]}>
                          <Text style={[styles.teamLabel, { color: team.color }]}>{team.label}</Text>
                          {team.members.map((m, j) => (
                            <View key={j} style={styles.teamMember}>
                              <Ionicons name="person" size={12} color={team.color + "bb"} />
                              <Text style={[styles.teamMemberText, { color: team.color + "cc" }]}>{m}</Text>
                            </View>
                          ))}
                        </View>
                        {i < content.teams!.length - 1 && (
                          <View style={styles.vsWrap}>
                            <Text style={styles.vsText}>VS</Text>
                          </View>
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              )}

              {/* Rules */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="book" size={13} color={Colors.gold} />
                  <Text style={styles.sectionLabel}>{rulesLabel}</Text>
                </View>
                {content.rules.map((rule, i) => (
                  <View key={i} style={styles.ruleRow}>
                    <View style={[styles.ruleIcon, { backgroundColor: rule.color + "20" }]}>
                      <Ionicons name={rule.icon as any} size={16} color={rule.color} />
                    </View>
                    <Text style={styles.ruleText}>{rule.text}</Text>
                  </View>
                ))}
              </View>

              {/* Turn order */}
              {content.turns && content.turns.length > 1 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="sync" size={13} color={Colors.gold} />
                    <Text style={styles.sectionLabel}>{turnsLabel}</Text>
                  </View>
                  <View style={styles.turnsRow}>
                    {content.turns.map((t, i) => (
                      <React.Fragment key={i}>
                        <View style={[
                          styles.turnStep,
                          t.isPlayer && { backgroundColor: modeColor + "20", borderColor: modeColor + "55" },
                          !t.isPlayer && { backgroundColor: "#ffffff08", borderColor: "#ffffff22" },
                        ]}>
                          <Ionicons
                            name={t.isPlayer ? "person" : "laptop-outline"}
                            size={14}
                            color={t.isPlayer ? modeColor : "#ffffff66"}
                          />
                          <Text style={[styles.turnLabel, { color: t.isPlayer ? modeColor : "#ffffff88" }]}>
                            {t.label}
                          </Text>
                        </View>
                        {i < content.turns!.length - 1 && (
                          <Ionicons name="chevron-forward" size={14} color="#ffffff33" />
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              )}

              {/* Objective */}
              <View style={[styles.section, styles.objectiveBox]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="flag" size={13} color={Colors.gold} />
                  <Text style={styles.sectionLabel}>{objectiveLabel}</Text>
                </View>
                <Text style={styles.objectiveText}>{content.objective}</Text>
              </View>

              {/* Rewards */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="cash" size={13} color={Colors.gold} />
                  <Text style={styles.sectionLabel}>{rewardsLabel}</Text>
                </View>
                <View style={styles.rewardsRow}>
                  <View style={styles.rewardChip}>
                    <Ionicons name="cash" size={16} color={Colors.gold} />
                    <Text style={styles.rewardNum}>+{coins}</Text>
                  </View>
                  <View style={styles.rewardChip}>
                    <Ionicons name="star" size={16} color="#4A90E2" />
                    <Text style={[styles.rewardNum, { color: "#4A90E2" }]}>+{xp} XP</Text>
                  </View>
                </View>
                {content.rewardNote && (
                  <Text style={styles.rewardNote}>{content.rewardNote}</Text>
                )}
              </View>

              <View style={{ height: 16 }} />
            </ScrollView>

            {/* Play button */}
            <View style={styles.playBtnWrap}>
              <Pressable
                onPress={onPlay}
                style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
              >
                <LinearGradient colors={[modeColor, modeColor + "cc"]} style={styles.playBtnGrad}>
                  <Ionicons name="play" size={18} color="#000" />
                  <Text style={styles.playBtnText}>
                    {hasDifficulty ? selectDiffLabel : playLabel}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "92%",
    backgroundColor: "#041008",
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 4,
    padding: 8,
  },
  modeIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modeName: {
    fontSize: 22,
    fontFamily: "Nunito_900ExtraBold",
    letterSpacing: 2,
    marginBottom: 4,
  },
  modeSubtitle: {
    fontSize: 13,
    color: "#ffffff66",
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  divider: {
    height: 1,
    marginHorizontal: -20,
    marginBottom: 4,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    color: Colors.gold,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  description: {
    fontSize: 14,
    color: "#ffffffcc",
    fontFamily: "Nunito_400Regular",
    lineHeight: 21,
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  teamCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
    gap: 4,
  },
  teamLabel: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    marginBottom: 2,
  },
  teamMember: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  teamMemberText: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
  },
  vsWrap: {
    paddingHorizontal: 4,
  },
  vsText: {
    fontSize: 14,
    color: "#ffffff66",
    fontFamily: "Nunito_700Bold",
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  ruleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    color: "#ffffffcc",
    fontFamily: "Nunito_400Regular",
    lineHeight: 18,
  },
  turnsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  turnStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  turnLabel: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
  },
  objectiveBox: {
    backgroundColor: "#D4AF3710",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D4AF3722",
    marginTop: 16,
  },
  objectiveText: {
    fontSize: 13,
    color: "#ffffffcc",
    fontFamily: "Nunito_400Regular",
    lineHeight: 19,
  },
  rewardsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  rewardChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff08",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rewardNum: {
    fontSize: 15,
    color: Colors.gold,
    fontFamily: "Nunito_700Bold",
  },
  rewardNote: {
    fontSize: 12,
    color: "#ffffff55",
    fontFamily: "Nunito_400Regular",
    fontStyle: "italic",
  },
  playBtnWrap: {
    padding: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#ffffff10",
  },
  playBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  playBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  playBtnText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Nunito_900ExtraBold",
    letterSpacing: 1.5,
  },
});
