import type { GameModeId } from "@/lib/gameModes";

// Per-mode identity used by the in-game screen to give each mode a distinct
// look, feel, and atmosphere. Centralised here so the game screen has a
// single source of truth for palette / ambience per mode.
//
// Music routing lives in lib/audioManager.ts (MODE_TO_MUSIC_TRACK +
// startGameMusicForMode). Each gameplay mode now owns a dedicated
// procedurally-generated loop (assets/sounds/game-music-<mode>.wav).

export type ModeIdentity = {
  /** Primary accent (text/icons/border highlights). */
  accent: string;
  /** Secondary glow used for the table-felt overlay. */
  glow: string;
  /** Three-stop gradient layered on top of the table felt. */
  overlay: [string, string, string];
  /** Whether to layer the casino-ambience SFX under the in-game music. */
  ambience: boolean;
};

const MODE_IDENTITY: Record<GameModeId, ModeIdentity> = {
  practice: {
    accent: "#00AA66",
    glow: "#1A8FC1",
    overlay: ["#00553311", "#1A8FC10D", "#00553311"],
    ambience: false,
  },
  classic: {
    accent: "#D4AF37",
    glow: "#D4AF37",
    overlay: ["#0A0A0A00", "#D4AF3708", "#0A0A0A00"],
    ambience: false,
  },
  lightning: {
    accent: "#FFD700",
    glow: "#FF6F00",
    overlay: ["#FF6F0014", "#FFD7000A", "#FF6F0014"],
    ambience: false,
  },
  tournament: {
    accent: "#E67E22",
    glow: "#FFD700",
    overlay: ["#3D1F0022", "#E67E2214", "#FFD70014"],
    ambience: true,
  },
  challenge: {
    accent: "#9B59B6",
    glow: "#9B59B6",
    overlay: ["#3B0A5A22", "#9B59B610", "#3B0A5A22"],
    ambience: false,
  },
  ranked: {
    accent: "#4A90E2",
    glow: "#6AADFF",
    overlay: ["#0A1A3322", "#4A90E20F", "#0A1A3322"],
    ambience: true,
  },
};

// Reto de Fichas overrides classic. Kept distinct because Fichas runs are
// classic-mode sessions flagged via lib/fichasChallenge.
export const FICHAS_IDENTITY: ModeIdentity = {
  accent: "#D4AF37",
  glow: "#A855F7",
  overlay: ["#6B21A833", "#A855F71A", "#D4AF3722"],
  ambience: true,
};

export function getModeIdentity(
  modeId: string | undefined,
  opts?: { isFichasRun?: boolean },
): ModeIdentity {
  if (opts?.isFichasRun) return FICHAS_IDENTITY;
  if (modeId && modeId in MODE_IDENTITY) {
    return MODE_IDENTITY[modeId as GameModeId];
  }
  return MODE_IDENTITY.classic;
}
