import type { Lang } from "./i18n";

export type CpuPhraseEvent =
  | "match_start"
  | "ai_plays_special"
  | "ai_plays_eight"
  | "ai_draws"
  | "ai_one_card"
  | "ai_wins"
  | "ai_loses"
  | "player_eight"
  | "player_one_card"
  | "long_silence";

const PHRASES: Record<CpuPhraseEvent, Record<"es" | "en" | "pt", string[]>> = {
  match_start: {
    es: ["¿Listo? Yo sí.", "Voy con todo.", "Hoy te toca perder.", "Tranqui, no muerdo... mucho."],
    en: ["Ready? I am.", "Bringing the heat.", "Today you lose.", "Easy now, I won't bite... much."],
    pt: ["Pronto? Eu sim.", "Vim com tudo.", "Hoje você perde.", "Calma, não mordo... muito."],
  },
  ai_plays_special: {
    es: ["¡Toma esa!", "Ay, se me cayó.", "Ups, sin querer.", "¡Doble combo!"],
    en: ["Take that!", "Oops, dropped it.", "Whoops, sorry not sorry.", "Double combo!"],
    pt: ["Toma essa!", "Aí, escorregou.", "Ops, foi sem querer.", "Combo duplo!"],
  },
  ai_plays_eight: {
    es: ["¡OCHO LOCO!", "El 8 es mío.", "Eight la magia."],
    en: ["CRAZY EIGHT!", "The 8 is mine.", "Eight the magic."],
    pt: ["OITO LOUCO!", "O 8 é meu.", "Eight a mágica."],
  },
  ai_draws: {
    es: ["Más cartas, más amor.", "Bueno, otra vuelta.", "Esto va para largo."],
    en: ["More cards, more love.", "Well, another round.", "This is gonna take a while."],
    pt: ["Mais cartas, mais amor.", "Bom, outra rodada.", "Vai demorar."],
  },
  ai_one_card: {
    es: ["¡Una carta! Tiembla.", "Ya casi, ya casi.", "Despídete del trono."],
    en: ["One card! Tremble.", "Almost there.", "Say bye to the crown."],
    pt: ["Uma carta! Tremam.", "Tô quase lá.", "Tchau, coroa."],
  },
  ai_wins: {
    es: ["¡Otra victoria al saco!", "Era obvio, ¿no?", "GG fácil.", "Mejor suerte la próxima."],
    en: ["Another W in the bag!", "Was obvious, right?", "Easy GG.", "Better luck next time."],
    pt: ["Mais uma vitória!", "Era óbvio, né?", "GG fácil.", "Mais sorte na próxima."],
  },
  ai_loses: {
    es: ["Me dejaste ganar, ¿cierto?", "Bah, las cartas me odian.", "Revancha. Ya."],
    en: ["You let me lose, right?", "Bah, cards hate me.", "Rematch. Now."],
    pt: ["Me deixou perder, né?", "Bah, as cartas me odeiam.", "Revanche. Já."],
  },
  player_eight: {
    es: ["Eso fue suerte.", "Ahora me toca a mí.", "Calculado... por ti."],
    en: ["Pure luck.", "My turn now.", "Calculated... by you."],
    pt: ["Foi sorte.", "Agora é minha vez.", "Calculado... por você."],
  },
  player_one_card: {
    es: ["No tan rápido.", "Aún no cantes victoria.", "Te traigo regalitos..."],
    en: ["Not so fast.", "Don't sing victory yet.", "Got little gifts for you..."],
    pt: ["Não tão rápido.", "Não canta vitória ainda.", "Trouxe presentinhos..."],
  },
  long_silence: {
    es: ["¿Sigues ahí?", "Hola, ¿hay alguien?", "El reloj corre, eh."],
    en: ["You still there?", "Hello, anybody?", "Clock's ticking."],
    pt: ["Ainda tá aí?", "Olá, alguém?", "O relógio tá andando."],
  },
};

export function getCpuPhrase(event: CpuPhraseEvent, lang: Lang | string): string {
  const langKey = (lang === "es" || lang === "en" || lang === "pt") ? (lang as "es" | "en" | "pt") : "es";
  const bank = PHRASES[event][langKey] ?? PHRASES[event].es;
  return bank[Math.floor(Math.random() * bank.length)];
}
