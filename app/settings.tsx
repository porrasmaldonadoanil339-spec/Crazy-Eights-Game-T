import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Switch, Platform, ScrollView,
  Modal, Pressable, Vibration, Linking, Alert, TextInput, Animated,
  PanResponder, LayoutChangeEvent, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { reloadAppAsync } from "expo";
import { getApiUrl } from "@/lib/query-client";
import { useProfile } from "@/context/ProfileContext";
import { useAuth } from "@/context/AuthContext";
import { stopMusic, startMenuMusic, syncSettings, getCurrentTrack, LOGO_STINGERS, DEFAULT_LOGO_STINGER_ID, CUSTOM_LOGO_STINGER_MAX_MS, CUSTOM_LOGO_STINGER_SOURCE_MAX_BYTES, CUSTOM_LOGO_STINGER_SHRINK_MAX_INPUT_BYTES, previewLogoStinger, setCustomStingerUri, isStingerUnlocked, previewCustomStingerWindow, stopCustomStingerWindowPreview, releaseCustomStingerWindowPreview, setCustomStingerTrim, type LogoStingerId } from "@/lib/audioManager";
import { uploadCustomStinger, deleteRemoteCustomStinger, cacheLocalCopyForRemote, clearCustomStingerCache, trimCustomStingerToFile, shrinkCustomStingerToFile, computeStingerWaveform, type UploadStingerErrorReason, type ShrinkStingerErrorReason } from "@/lib/customStingerCache";
import { createAudioPlayer, useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { useT } from "@/hooks/useT";
import type { TranslationKey } from "@/lib/i18n";
import { playSound } from "@/lib/sounds";
import { Colors } from "@/constants/colors";

// Task #87 — recording cap. Sources picked via the file picker can be any
// length (the trim modal scrolls a 2-second window across them). Recordings
// auto-stop at this length so the user has enough material to pick a slice
// from without holding the mic button forever.
const CUSTOM_STINGER_RECORD_MAX_MS = 6000;

const LANGUAGES = [
  { code: "es",  label: "Español",          subtitle: "Español (Latinoamérica)", flag: "🇲🇽" },
  { code: "es",  label: "Español (España)",  subtitle: "Español (España)",        flag: "🇪🇸" },
  { code: "en",  label: "English",           subtitle: "English (USA)",            flag: "🇺🇸" },
  { code: "en",  label: "English (UK)",      subtitle: "English (UK)",             flag: "🇬🇧" },
  { code: "pt",  label: "Português",         subtitle: "Português (Brasil)",       flag: "🇧🇷" },
  { code: "pt",  label: "Português (PT)",    subtitle: "Português (Portugal)",     flag: "🇵🇹" },
  { code: "fr",  label: "Français",          subtitle: "Français (France)",        flag: "🇫🇷" },
  { code: "de",  label: "Deutsch",           subtitle: "Deutsch (Deutschland)",    flag: "🇩🇪" },
  { code: "it",  label: "Italiano",          subtitle: "Italiano (Italia)",        flag: "🇮🇹" },
  { code: "tr",  label: "Türkçe",            subtitle: "Türkçe (Türkiye)",         flag: "🇹🇷" },
  { code: "ru",  label: "Русский",           subtitle: "Russian",                  flag: "🇷🇺" },
  { code: "pl",  label: "Polski",            subtitle: "Polish",                   flag: "🇵🇱" },
  { code: "nl",  label: "Nederlands",        subtitle: "Dutch",                    flag: "🇳🇱" },
  { code: "sv",  label: "Svenska",           subtitle: "Swedish",                  flag: "🇸🇪" },
  { code: "da",  label: "Dansk",             subtitle: "Danish",                   flag: "🇩🇰" },
  { code: "fi",  label: "Suomi",             subtitle: "Finnish",                  flag: "🇫🇮" },
  { code: "no",  label: "Norsk",             subtitle: "Norwegian",                flag: "🇳🇴" },
  { code: "zh",  label: "中文 (简体)",        subtitle: "Chinese (Simplified)",     flag: "🇨🇳" },
  { code: "zh",  label: "中文 (繁體)",        subtitle: "Chinese (Traditional)",    flag: "🇹🇼" },
  { code: "ja",  label: "日本語",             subtitle: "Japanese",                 flag: "🇯🇵" },
  { code: "ko",  label: "한국어",             subtitle: "Korean",                   flag: "🇰🇷" },
  { code: "hi",  label: "हिन्दी",             subtitle: "Hindi",                    flag: "🇮🇳" },
  { code: "th",  label: "ไทย",               subtitle: "Thai",                     flag: "🇹🇭" },
  { code: "vi",  label: "Tiếng Việt",        subtitle: "Vietnamese",               flag: "🇻🇳" },
  { code: "id",  label: "Bahasa Indonesia",  subtitle: "Indonesian",               flag: "🇮🇩" },
  { code: "ar",  label: "العربية",            subtitle: "Arabic",                   flag: "🇸🇦" },
];

const SECTION_ICONS: Record<string, { name: string; color: string; bg: string }> = {
  language:      { name: "globe",           color: "#4FC3F7", bg: "#1a2a3a" },
  sound:         { name: "musical-notes",   color: "#D4AF37", bg: "#1a3a1a" },
  notifications: { name: "notifications",   color: "#E74C3C", bg: "#3a1a1a" },
  gameplay:      { name: "game-controller", color: "#27AE60", bg: "#1a3a2a" },
  graphics:      { name: "color-palette",   color: "#9B59B6", bg: "#2a1a3a" },
  appearance:    { name: "moon",            color: "#F39C12", bg: "#2a2a1a" },
  account:       { name: "person-circle",   color: "#4A90E2", bg: "#1a2a3a" },
  privacy:       { name: "shield-checkmark",color: "#27AE60", bg: "#1a3a1a" },
  help:          { name: "help-circle",     color: "#E67E22", bg: "#3a2a1a" },
  info:          { name: "information-circle", color: "#95A5A6", bg: "#2a2a2a" },
};

function SectionHeader({ icon, label, isDark }: { icon: keyof typeof SECTION_ICONS; label: string; isDark: boolean }) {
  const ic = SECTION_ICONS[icon];
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={[styles.sectionHeaderIcon, { backgroundColor: ic.bg }]}>
        <Ionicons name={ic.name as any} size={16} color={ic.color} />
      </View>
      <Text style={[styles.sectionHeaderLabel, { color: isDark ? ic.color : "#2a4a2a" }]}>{label}</Text>
    </View>
  );
}

function SettingRow({ label, sub, icon, iconColor, iconBg, right, isDark, onPress, last }: {
  label: string; sub?: string; icon: string; iconColor: string; iconBg: string;
  right: React.ReactNode; isDark: boolean; onPress?: () => void; last?: boolean;
}) {
  const labelColor = isDark ? "#E8DCC8" : "#1a2e1a";
  const subColor   = isDark ? "#6B7A5C" : "#4a7a4a";
  const content = (
    <View style={[styles.row, !last && styles.rowBorder, { borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }]}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={19} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
          {sub ? <Text style={[styles.rowSub, { color: subColor }]}>{sub}</Text> : null}
        </View>
      </View>
      <View style={styles.rowRight}>{right}</View>
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }
  return content;
}

function QualitySelector({ value, onChange, isDark }: {
  value: "low" | "medium" | "high"; onChange: (v: "low" | "medium" | "high") => void; isDark: boolean;
}) {
  const T = useT();
  const opts: ("low" | "medium" | "high")[] = ["low", "medium", "high"];
  const labels = [T("qualityLow"), T("qualityMedium"), T("qualityHigh")];
  const icons: any[] = ["speedometer-outline", "speedometer", "flame"];
  return (
    <View style={styles.qualityRow}>
      {opts.map((opt, i) => {
        const active = value === opt;
        const activeBg = isDark ? (opt === "low" ? "#1a4020" : opt === "medium" ? "#1a3a18" : "#1a2a10") : (opt === "low" ? "#e8f5e9" : opt === "medium" ? "#c8e6c9" : "#a5d6a7");
        const activeColor = isDark ? Colors.gold : "#1b5e20";
        const inactiveColor = isDark ? "#6B7A5C" : "#4a7a4a";
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.qualityBtn,
              {
                borderColor: isDark ? (active ? Colors.gold : "rgba(255,255,255,0.12)") : (active ? "#2a6a2a" : "rgba(0,0,0,0.1)"),
                backgroundColor: active ? activeBg : "transparent",
              },
            ]}
          >
            <Ionicons name={icons[i]} size={14} color={active ? activeColor : inactiveColor} style={{ marginBottom: 2 }} />
            <Text style={[styles.qualityBtnText, { color: active ? activeColor : inactiveColor }]}>
              {labels[i]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const FAQ_ES = [
  { q: "¿Cómo se juega Ocho Locos?", a: "El objetivo es ser el primero en vaciar tu mano de cartas. En tu turno puedes jugar una carta del mismo palo o mismo valor, o robar si no puedes." },
  { q: "¿Qué hace el 8?", a: "El 8 es 'loco': puedes jugarlo sobre cualquier carta y elegir el nuevo palo que seguirá la ronda." },
  { q: "¿Qué hace el 2?", a: "Obliga al siguiente jugador a robar 2 cartas (o 4 si ya había un 2 activo). Se puede encadenar." },
  { q: "¿Qué hace el 3?", a: "Bloquea el turno del siguiente jugador y le hace robar 3 cartas." },
  { q: "¿Qué hace el 7?", a: "Invierte el sentido del juego (sentido horario ↔ antihorario)." },
  { q: "¿Qué hace el 10?", a: "Quema el mazo: el siguiente jugador pierde su turno." },
  { q: "¿Qué hace la J?", a: "Jota especial: puede cambiarse de palo o aplicar efecto según el modo activo." },
  { q: "¿Qué hace el Comodín (Joker)?", a: "Carta comodín: puedes jugarlo en cualquier momento y elegir palo libremente. ¡Muy poderoso!" },
  { q: "¿Qué es el modo Relámpago?", a: "Partidas ultra-rápidas con sólo 5 cartas por jugador y 8 segundos por turno. Gana el primero en vaciar." },
  { q: "¿Cómo funciona el modo Ranked?", a: "Compites por estrellas y rangos. Gana para subir; pierde y puedes bajar. Hay 12 rangos desde Novato hasta Leyenda." },
  { q: "¿Para qué sirven las monedas?", a: "Las monedas se usan en la Tienda para desbloquear avatares, marcos, efectos de cartas y emotes." },
  { q: "¿Qué son los Cofres?", a: "Recompensas que consigues al ganar partidas. Tócalos para abrirlos y recibir monedas, XP y objetos exclusivos." },
];
const FAQ_EN = [
  { q: "How do you play Crazy Eights?", a: "Be the first to empty your hand. On your turn play a card matching suit or rank, or draw if you can't." },
  { q: "What does the 8 do?", a: "The 8 is 'crazy': play it on any card and choose the new suit." },
  { q: "What does the 2 do?", a: "Forces the next player to draw 2 cards (or 4 if a 2 was already active). Can be chained." },
  { q: "What does the 3 do?", a: "Blocks the next player's turn and makes them draw 3 cards." },
  { q: "What does the 7 do?", a: "Reverses the direction of play (clockwise ↔ counterclockwise)." },
  { q: "What does the 10 do?", a: "Burns the deck: the next player loses their turn." },
  { q: "What does the J (Jack) do?", a: "Special Jack: change suit or apply an effect depending on the active mode." },
  { q: "What does the Joker do?", a: "Wild card: play it anytime and choose any suit freely. Very powerful!" },
  { q: "What is Lightning mode?", a: "Ultra-fast games with only 5 cards per player and 8 seconds per turn. First to empty their hand wins." },
  { q: "How does Ranked mode work?", a: "Compete for stars and ranks. Win to climb; lose and you might drop. There are 12 ranks from Rookie to Legend." },
  { q: "What are coins for?", a: "Coins are spent in the Store to unlock avatars, card frames, effects and emotes." },
  { q: "What are Chests?", a: "Rewards earned by winning games. Tap them to open and receive coins, XP and exclusive items." },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateSettings } = useProfile();
  const { user, logout } = useAuth();
  const T = useT();
  const [showLangModal, setShowLangModal] = useState(false);
  const [showStingerModal, setShowStingerModal] = useState(false);
  // Task #85 — busy flags for the custom intro slot (file picker + recorder).
  const [customStingerBusy, setCustomStingerBusy] = useState(false);
  const [isRecordingStinger, setIsRecordingStinger] = useState(false);
  // Task #94 — cloud-backup status for the custom clip. Derived from the
  // profile URI on mount: a remote https URL means we already synced, a
  // local file:// URI means the upload either never ran or failed (so the
  // clip won't roam to other devices until the player retries).
  // Task #97 — failed states carry the structured server reason so the
  // badge can show "Clip too big" / "Cloud backup is full" instead of the
  // generic "Backup failed — tap to retry".
  type StingerBackupStatus =
    | { phase: "idle" }
    | { phase: "uploading" }
    | { phase: "synced" }
    | { phase: "failed"; reason: UploadStingerErrorReason | "unknown" };
  const [customStingerBackupStatus, setCustomStingerBackupStatus] = useState<StingerBackupStatus>(() => {
    const uri = profile.customLogoStingerUri || "";
    if (!uri) return { phase: "idle" };
    return /^https?:\/\//i.test(uri) ? { phase: "synced" } : { phase: "failed", reason: "unknown" };
  });
  // Re-derive when the profile URI changes from elsewhere (cloud sync,
  // remove, etc.) — but never overwrite an in-flight "uploading" state
  // and don't downgrade a known failure reason to "unknown".
  useEffect(() => {
    setCustomStingerBackupStatus((prev) => {
      if (prev.phase === "uploading") return prev;
      const uri = profile.customLogoStingerUri || "";
      if (!uri) return { phase: "idle" };
      if (/^https?:\/\//i.test(uri)) return { phase: "synced" };
      if (prev.phase === "failed") return prev;
      return { phase: "failed", reason: "unknown" };
    });
  }, [profile.customLogoStingerUri]);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // Task #87 — draft state for the trim modal. After picking/recording a clip
  // we hold the source URI + measured duration here so the player can scrub
  // a 2-second window and preview it before committing to disk + profile.
  const [stingerDraft, setStingerDraft] = useState<
    | null
    | { srcUri: string; ext: string; durationMs: number; srcSizeBytes: number }
  >(null);
  const [draftStartMs, setDraftStartMs] = useState(0);
  const [draftEndMs, setDraftEndMs] = useState(CUSTOM_LOGO_STINGER_MAX_MS);
  const [trimTrackWidth, setTrimTrackWidth] = useState(0);
  // Task #104 — busy flag while the server-side shrink is running so the
  // button can show a spinner-style label and avoid duplicate taps.
  const [isShrinkingDraft, setIsShrinkingDraft] = useState(false);
  // Task #104 — epoch counter incremented every time the trim modal opens
  // (or closes) so an in-flight shrink whose result lands after the
  // player cancels doesn't re-open the modal with the shrunk clip.
  const stingerDraftEpochRef = useRef(0);
  const draftPreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPreviewingDraft, setIsPreviewingDraft] = useState(false);
  // Task #92 — real-amplitude bars for the trim modal. `null` while the
  // server-side ffmpeg decode is in flight (we show a spinner), an empty
  // array if it failed (we fall back to deterministic placeholder bars), or
  // ~36 normalized peaks (0..1) once decoded. Reset whenever the source
  // changes so reopening the modal with a new clip kicks off a fresh decode.
  const [waveformBars, setWaveformBars] = useState<number[] | null>(null);
  const waveformRequestId = useRef(0);
  // Mutable refs so PanResponder callbacks always read the latest values
  // without stale-closure bugs.
  const draftStartMsRef = useRef(0);
  const draftEndMsRef = useRef(CUSTOM_LOGO_STINGER_MAX_MS);
  const trimTrackWidthRef = useRef(0);
  const draftDurationMsRef = useRef(0);
  useEffect(() => { draftStartMsRef.current = draftStartMs; }, [draftStartMs]);
  useEffect(() => { draftEndMsRef.current = draftEndMs; }, [draftEndMs]);
  useEffect(() => { trimTrackWidthRef.current = trimTrackWidth; }, [trimTrackWidth]);
  useEffect(() => { draftDurationMsRef.current = stingerDraft?.durationMs ?? 0; }, [stingerDraft]);
  const [langSearch, setLangSearch] = useState("");
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPlayerName, setReportPlayerName] = useState("");
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [showResetToast, setShowResetToast] = useState(false);
  const resetToastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showResetToast) return;
    Animated.timing(resetToastOpacity, {
      toValue: 1, duration: 180, useNativeDriver: true,
    }).start();
    const t = setTimeout(() => {
      Animated.timing(resetToastOpacity, {
        toValue: 0, duration: 180, useNativeDriver: true,
      }).start(() => {
        reloadAppAsync().catch((err) => {
          Alert.alert("Reload failed", err?.message ?? String(err));
        });
      });
    }, 1200);
    return () => clearTimeout(t);
  }, [showResetToast, resetToastOpacity]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isDark = profile.darkMode !== false;

  const bg      = isDark ? ["#041008", "#061510", "#041008"] as const : ["#e8f5e2", "#d4edce", "#e8f5e2"] as const;
  const cardBg   = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const cardBorder = isDark ? "rgba(212,175,55,0.12)" : "rgba(0,100,0,0.12)";
  const titleColor = isDark ? "#D4AF37" : "#1a4a1a";
  const subColor   = isDark ? "#6B7A5C" : "#4a7a4a";

  const sw = (val: boolean, color: string) => ({
    trackColor: { false: isDark ? "#333" : "#ccc", true: color + "66" },
    thumbColor: val ? color : isDark ? "#666" : "#aaa",
  });

  const toggleMusic = async () => {
    const next = !profile.musicEnabled;
    updateSettings({ musicEnabled: next });
    syncSettings(next, profile.sfxEnabled, profile.vibrationEnabled, profile.voiceFxEnabled ?? true);
    if (!next) { stopMusic().catch(() => {}); }
    else if (getCurrentTrack() === null) { startMenuMusic().catch(() => {}); }
  };

  const toggleSfx = () => {
    const next = !profile.sfxEnabled;
    updateSettings({ sfxEnabled: next });
    syncSettings(profile.musicEnabled, next, profile.vibrationEnabled, profile.voiceFxEnabled ?? true);
  };

  const toggleVibration = () => {
    const next = !profile.vibrationEnabled;
    updateSettings({ vibrationEnabled: next });
    syncSettings(profile.musicEnabled, profile.sfxEnabled, next, profile.voiceFxEnabled ?? true);
    if (next) Vibration.vibrate(80);
  };

  const toggleVoiceFx = () => {
    const next = !(profile.voiceFxEnabled ?? true);
    updateSettings({ voiceFxEnabled: next });
    syncSettings(profile.musicEnabled, profile.sfxEnabled, profile.vibrationEnabled, next);
  };

  const selectLogoStinger = (id: LogoStingerId) => {
    // Task #85 — block selecting "custom" if no clip exists yet; the upload /
    // record buttons handle setting it. Also remember the last built-in pick
    // so removing a custom clip can revert to it.
    if (id === "custom" && !(profile.customLogoStingerUri || "")) return;
    // Task #86 — locked premium stingers can be previewed but not selected
    // until the player unlocks them via chests or the battle pass.
    if (!isStingerUnlocked(id, profile.ownedItems)) return;
    if (id === "custom") {
      updateSettings({ logoStingerId: id });
    } else {
      updateSettings({ logoStingerId: id, lastBuiltInLogoStingerId: id });
    }
    if (profile.sfxEnabled) {
      previewLogoStinger(id).catch(() => {});
    }
    if (profile.vibrationEnabled) Vibration.vibrate(30);
  };

  const previewCurrentStinger = () => {
    if (!profile.sfxEnabled) return;
    previewLogoStinger(profile.logoStingerId ?? DEFAULT_LOGO_STINGER_ID).catch(() => {});
  };

  // Task #85 — measure clip duration by briefly opening it as an AudioPlayer
  // and polling `duration` until it's a positive number (or the timeout
  // expires). Returns ms.
  const measureClipDurationMs = async (uri: string): Promise<number> => {
    let player: ReturnType<typeof createAudioPlayer> | null = null;
    try {
      player = createAudioPlayer({ uri });
      const start = Date.now();
      while (Date.now() - start < 2500) {
        const d = player.duration;
        if (typeof d === "number" && isFinite(d) && d > 0) {
          return Math.round(d * 1000);
        }
        await new Promise((r) => setTimeout(r, 80));
      }
      const d = player.duration;
      return typeof d === "number" && isFinite(d) ? Math.round(d * 1000) : 0;
    } finally {
      if (player) {
        try { player.remove(); } catch {}
      }
    }
  };

  // Best-effort cleanup of the previously-stored custom clip (if any) so the
  // document directory doesn't accumulate orphaned audio files. Task #91 —
  // the trimmed clip itself is now written by `trimCustomStingerToFile`
  // (via the server's ffmpeg endpoint), so the local persist helper is no
  // longer needed here.
  const cleanupOldCustomClip = (uri: string | undefined | null) => {
    if (!uri) return;
    try {
      const f = new File(uri);
      if (f.exists) f.delete();
    } catch {}
  };

  const stingerTitle = (): string => T("logoStinger") || "Sonido del logo";
  const errorMessage = (err: unknown, fallbackKey: TranslationKey, fallback: string): string => {
    const msg = err instanceof Error ? err.message : "";
    return msg || T(fallbackKey) || fallback;
  };

  // Task #87 — instead of persisting immediately, open the trim modal so the
  // player can pick which 2-second window of the source clip to keep. The
  // modal's Save handler is what actually copies the file + updates profile.
  const openStingerTrim = async (srcUri: string, ext: string) => {
    const durationMs = await measureClipDurationMs(srcUri);
    if (!durationMs) {
      Alert.alert(stingerTitle(), T("logoStingerLoadFailed") || "Could not load the audio");
      return;
    }
    // Task #101 — measure the source file's on-disk size so the trim modal
    // can show it and warn when the clip is too big to be trimmed / backed
    // up server-side. Best-effort: 0 means "unknown" and the warning row
    // simply won't render.
    let srcSizeBytes = 0;
    try {
      const f = new File(srcUri);
      const s = f.size;
      if (typeof s === "number" && isFinite(s) && s > 0) srcSizeBytes = s;
    } catch {}
    // Default the trim window to the first 2 seconds of the source (or the
    // full clip if shorter than the cap). The player can then drag handles
    // to move the window before previewing / saving.
    const initialEnd = Math.min(durationMs, CUSTOM_LOGO_STINGER_MAX_MS);
    setStingerDraft({ srcUri, ext, durationMs, srcSizeBytes });
    setDraftStartMs(0);
    setDraftEndMs(initialEnd);
    // Task #92 — kick off the real waveform decode in parallel with opening
    // the modal. The modal renders a spinner over the bar row until the
    // amplitudes arrive (or fall back to deterministic placeholder bars on
    // failure). Use a request id so a second pick mid-flight wins.
    setWaveformBars(null);
    const requestId = ++waveformRequestId.current;
    computeStingerWaveform(srcUri, ext, 36)
      .then((bars) => {
        if (waveformRequestId.current !== requestId) return;
        setWaveformBars(bars && bars.length > 0 ? bars : []);
      })
      .catch(() => {
        if (waveformRequestId.current !== requestId) return;
        setWaveformBars([]);
      });
  };

  // Task #101 — human-readable file size used by the trim modal. Returns
  // "" for 0/unknown sizes so callers can hide the label entirely.
  const formatStingerSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Task #104 — re-encode the oversized source clip via the server's shrink
  // endpoint, swap the draft over to the (smaller) result, and re-measure
  // its duration so the trim window stays valid. Source files outside the
  // shrink endpoint's input cap are rejected client-side with a clear
  // alert; everything else routes through ShrinkStingerErrorReason. Best
  // effort cleanup of the original picked clip on success — the path is
  // either in the OS picker cache or the recorder's temp dir; either is
  // safe to drop once we've taken its bytes.
  const shrinkErrorMessage = (reason: ShrinkStingerErrorReason): string => {
    const limit = `${(CUSTOM_LOGO_STINGER_SOURCE_MAX_BYTES / (1024 * 1024)).toFixed(0)} MB`;
    if (reason === "input_too_large")
      return T("logoStingerShrinkInputTooLarge")
        || `Clip is too long to shrink. Try a shorter recording.`;
    if (reason === "still_too_large")
      return (T("logoStingerShrinkStillTooLarge") || "Even after shrinking the clip is over {limit}. Try a shorter recording.")
        .replace("{limit}", limit);
    if (reason === "rate_limited")
      return T("logoStingerShrinkRateLimited") || "Too many shrink requests right now — try again in a minute.";
    if (reason === "bad_request")
      return T("logoStingerShrinkBadRequest") || "This audio format isn't supported.";
    return T("logoStingerShrinkTransient") || "Couldn't shrink the clip. Check your connection and try again.";
  };

  const shrinkStingerSource = () => {
    if (!stingerDraft || isShrinkingDraft) return;
    if (stingerDraft.srcSizeBytes > CUSTOM_LOGO_STINGER_SHRINK_MAX_INPUT_BYTES) {
      Alert.alert(
        stingerTitle(),
        T("logoStingerShrinkInputTooLarge")
          || "Clip is too long to shrink. Try a shorter recording.",
      );
      return;
    }
    teardownDraftPreview();
    setIsShrinkingDraft(true);
    const draft = stingerDraft;
    // Task #104 — capture the current epoch so a slow shrink whose result
    // lands after the player cancels (or closes) the modal can drop its
    // result on the floor instead of re-opening the modal or stomping on
    // a different draft.
    const epoch = stingerDraftEpochRef.current;
    (async () => {
      try {
        const result = await shrinkCustomStingerToFile(draft.srcUri, draft.ext);
        if (epoch !== stingerDraftEpochRef.current) {
          if (result.ok) cleanupOldCustomClip(result.uri);
          return;
        }
        if (!result.ok) {
          Alert.alert(stingerTitle(), shrinkErrorMessage(result.reason));
          return;
        }
        // Re-measure duration of the shrunk clip — ffmpeg preserves it,
        // but the player's previously-set start/end markers are clamped
        // against the new value defensively in case re-encoding rounded.
        const newDuration = await measureClipDurationMs(result.uri);
        if (epoch !== stingerDraftEpochRef.current) {
          cleanupOldCustomClip(result.uri);
          return;
        }
        if (!newDuration) {
          cleanupOldCustomClip(result.uri);
          Alert.alert(stingerTitle(), T("logoStingerLoadFailed") || "Could not load the audio");
          return;
        }
        cleanupOldCustomClip(draft.srcUri);
        setStingerDraft({
          srcUri: result.uri,
          ext: result.ext,
          durationMs: newDuration,
          srcSizeBytes: result.sizeBytes,
        });
        const initialEnd = Math.min(newDuration, CUSTOM_LOGO_STINGER_MAX_MS);
        setDraftStartMs(0);
        setDraftEndMs(initialEnd);
      } finally {
        if (epoch === stingerDraftEpochRef.current) setIsShrinkingDraft(false);
      }
    })();
  };

  const stopDraftPreview = () => {
    if (draftPreviewTimer.current) {
      clearTimeout(draftPreviewTimer.current);
      draftPreviewTimer.current = null;
    }
    stopCustomStingerWindowPreview();
    setIsPreviewingDraft(false);
  };

  const previewDraftWindow = () => {
    if (!stingerDraft) return;
    // Trim preview routes through the audio manager so the modal doesn't own
    // its own AudioPlayer lifecycle. Bypasses the global SFX toggle on
    // purpose: the player explicitly tapped Preview. Auto-saved playback
    // (after Save / on boot) still respects the SFX toggle.
    stopDraftPreview();
    const start = draftStartMsRef.current;
    const end = draftEndMsRef.current;
    const windowMs = Math.max(50, end - start);
    previewCustomStingerWindow(stingerDraft.srcUri, start, end)
      .then((ok) => {
        if (!ok) {
          Alert.alert(stingerTitle(), T("logoStingerLoadFailed") || "Could not load the audio");
          return;
        }
        setIsPreviewingDraft(true);
        draftPreviewTimer.current = setTimeout(() => {
          draftPreviewTimer.current = null;
          setIsPreviewingDraft(false);
        }, windowMs);
      })
      .catch(() => {
        Alert.alert(stingerTitle(), T("logoStingerLoadFailed") || "Could not load the audio");
      });
  };

  // Tear down the preview state when the trim modal closes so the audio
  // manager's cached draft player is released before we persist (or discard)
  // the source clip.
  const teardownDraftPreview = () => {
    if (draftPreviewTimer.current) {
      clearTimeout(draftPreviewTimer.current);
      draftPreviewTimer.current = null;
    }
    releaseCustomStingerWindowPreview();
    setIsPreviewingDraft(false);
  };

  const cancelStingerTrim = () => {
    teardownDraftPreview();
    // Task #104 — bump the epoch so any in-flight shrink that resolves
    // after this point sees a stale token and bails before touching state.
    stingerDraftEpochRef.current += 1;
    setIsShrinkingDraft(false);
    setStingerDraft(null);
    // Task #92 — bump the request id so any in-flight waveform fetch from
    // the previous source can't land on the next modal open.
    waveformRequestId.current++;
    setWaveformBars(null);
  };

  const saveStingerTrim = () => {
    if (!stingerDraft) return;
    // Task #101 — server-side ffmpeg trim rejects sources over the upload
    // limit with 413, so there's no path to save an oversized clip (we
    // don't have a local trimmer). Bail out early with a clear message
    // instead of letting trim fail with the generic "could not load" alert.
    if (stingerDraft.srcSizeBytes > CUSTOM_LOGO_STINGER_SOURCE_MAX_BYTES) {
      Alert.alert(
        stingerTitle(),
        (T("logoStingerTrimTooBigBlock") || "This clip is too big to save. Try picking or recording a shorter one.")
          .replace("{limit}", `${(CUSTOM_LOGO_STINGER_SOURCE_MAX_BYTES / (1024 * 1024)).toFixed(0)} MB`),
      );
      return;
    }
    const startMs = Math.max(0, Math.floor(draftStartMs));
    const endMs = Math.min(
      stingerDraft.durationMs,
      Math.max(startMs + 100, Math.floor(draftEndMs)),
    );
    teardownDraftPreview();
    setCustomStingerBusy(true);

    // Task #91 — re-encode the trimmed [startMs, endMs] window into a real
    // standalone m4a file via the server's ffmpeg endpoint, then save that
    // file to the document directory. The saved file is the trimmed clip
    // itself (always 0..durationMs at playback time), so the audio manager
    // no longer needs the seek + scheduled-pause trick for the custom slot.
    // Task #88 — back the clip up to the cloud so signing in on another
    // device (or reinstalling the app) restores the same intro instead of
    // pointing at a now-missing local file. Task #94/#97 — surface the
    // status (uploading / synced / failed-with-reason) so the player knows
    // whether the clip will roam, and can retry without re-running trim.
    const draft = stingerDraft;
    (async () => {
      try {
        const trimmed = await trimCustomStingerToFile(draft.srcUri, draft.ext, startMs, endMs);
        if (!trimmed) {
          Alert.alert(stingerTitle(), T("logoStingerLoadFailed") || "Could not load the audio");
          return;
        }
        const savedUri = trimmed.uri;
        const trimmedDurationMs = trimmed.durationMs;
        const trimmedExt = trimmed.ext;
        const previousUri = profile.customLogoStingerUri || "";
        setCustomStingerUri(savedUri);
        // Sync the (now trivial) markers into the audio manager *before* the
        // optional preview so the immediate playStingerById("custom") call
        // sees the fresh file's full window. isTrimmedFile=true tells the
        // audio manager to skip seek + scheduled-pause and just play.
        setCustomStingerTrim(0, trimmedDurationMs, true);
        updateSettings({
          customLogoStingerUri: savedUri,
          customLogoStingerStartMs: 0,
          customLogoStingerEndMs: trimmedDurationMs,
          customLogoStingerIsTrimmedFile: true,
          logoStingerId: "custom",
        });
        if (previousUri && !/^https?:\/\//i.test(previousUri) && previousUri !== savedUri) {
          cleanupOldCustomClip(previousUri);
        }
        setStingerDraft(null);
        if (profile.sfxEnabled) previewLogoStinger("custom").catch(() => {});
        if (profile.vibrationEnabled) Vibration.vibrate(30);

        setCustomStingerBackupStatus({ phase: "uploading" });
        const result = await uploadCustomStinger(savedUri, trimmedExt);
        if (!result.ok) {
          setCustomStingerBackupStatus({ phase: "failed", reason: result.reason });
          return;
        }
        cacheLocalCopyForRemote(result.url, savedUri);
        updateSettings({ customLogoStingerUri: result.url });
        setCustomStingerBackupStatus({ phase: "synced" });
      } finally {
        setCustomStingerBusy(false);
      }
    })();
  };

  // Task #94 — retry the cloud upload of the currently-saved local clip
  // without re-running the trim flow. Used by the "Backup failed" badge.
  const retryCustomStingerUpload = () => {
    const localUri = profile.customLogoStingerUri || "";
    if (!localUri || /^https?:\/\//i.test(localUri)) return;
    if (customStingerBackupStatus.phase === "uploading") return;
    const dotIdx = localUri.lastIndexOf(".");
    const ext = dotIdx >= 0 ? localUri.slice(dotIdx + 1).toLowerCase() : "m4a";
    setCustomStingerBackupStatus({ phase: "uploading" });
    (async () => {
      const result = await uploadCustomStinger(localUri, ext);
      if (!result.ok) {
        setCustomStingerBackupStatus({ phase: "failed", reason: result.reason });
        return;
      }
      cacheLocalCopyForRemote(result.url, localUri);
      updateSettings({ customLogoStingerUri: result.url });
      setCustomStingerBackupStatus({ phase: "synced" });
    })();
  };

  // Cleanup any in-flight preview when the screen unmounts.
  useEffect(() => () => { teardownDraftPreview(); }, []);

  // PanResponder factory for the start/end trim handles. `which` controls
  // which marker is being dragged. Conversion factor: pixels → ms based on
  // the measured track width and the source clip's full duration. We snapshot
  // the start/end values at grant time and apply gesture.dx on top of those —
  // reading the live refs during onMove would double-count because they
  // update on every setState round-trip.
  const dragOriginStartMs = useRef(0);
  const dragOriginEndMs = useRef(0);
  const makeHandlePanResponder = (which: "start" | "end") =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Stop any in-flight preview so dragging doesn't fight playback.
        if (isPreviewingDraft) stopDraftPreview();
        dragOriginStartMs.current = draftStartMsRef.current;
        dragOriginEndMs.current = draftEndMsRef.current;
      },
      onPanResponderMove: (_evt, gesture) => {
        const trackW = trimTrackWidthRef.current;
        const totalMs = draftDurationMsRef.current;
        if (trackW <= 0 || totalMs <= 0) return;
        const msPerPx = totalMs / trackW;
        if (which === "start") {
          let nextStart = dragOriginStartMs.current + gesture.dx * msPerPx;
          nextStart = Math.max(0, Math.min(nextStart, totalMs));
          // Keep end fixed; window can shrink to a 100ms minimum and is
          // always capped at MAX_MS.
          let nextEnd = draftEndMsRef.current;
          if (nextEnd - nextStart > CUSTOM_LOGO_STINGER_MAX_MS) {
            nextEnd = nextStart + CUSTOM_LOGO_STINGER_MAX_MS;
          }
          if (nextEnd - nextStart < 100) {
            nextStart = nextEnd - 100;
          }
          setDraftStartMs(nextStart);
          setDraftEndMs(nextEnd);
        } else {
          let nextEnd = dragOriginEndMs.current + gesture.dx * msPerPx;
          nextEnd = Math.max(0, Math.min(nextEnd, totalMs));
          let nextStart = draftStartMsRef.current;
          if (nextEnd - nextStart > CUSTOM_LOGO_STINGER_MAX_MS) {
            nextStart = nextEnd - CUSTOM_LOGO_STINGER_MAX_MS;
          }
          if (nextEnd - nextStart < 100) {
            nextEnd = nextStart + 100;
          }
          setDraftStartMs(Math.max(0, nextStart));
          setDraftEndMs(nextEnd);
        }
      },
      onPanResponderRelease: () => {
        // No state work needed — the refs already track the live values via
        // the useEffect syncs at the top of the component, so the next drag's
        // `gesture.dx` is applied on top of the freshly-released positions.
        if (profile.vibrationEnabled) Vibration.vibrate(10);
      },
    });

  const startHandlePan = useRef(makeHandlePanResponder("start")).current;
  const endHandlePan = useRef(makeHandlePanResponder("end")).current;

  const pickCustomStingerFile = async () => {
    if (customStingerBusy || isRecordingStinger) return;
    setCustomStingerBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const dotIdx = asset.name?.lastIndexOf(".") ?? -1;
      const ext = dotIdx >= 0 ? asset.name.slice(dotIdx + 1) : "m4a";
      await openStingerTrim(asset.uri, ext);
    } catch (err) {
      Alert.alert(stingerTitle(), errorMessage(err, "logoStingerLoadFailed", "Could not load the audio"));
    } finally {
      setCustomStingerBusy(false);
    }
  };

  const recordCustomStinger = async () => {
    if (customStingerBusy || isRecordingStinger) return;
    if (Platform.OS === "web") {
      Alert.alert(stingerTitle(), "Recording is not supported on web. Upload a file instead.");
      return;
    }
    setCustomStingerBusy(true);
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(stingerTitle(), T("logoStingerMicDenied") || "Microphone permission denied");
        return;
      }
      await recorder.prepareToRecordAsync();
      setIsRecordingStinger(true);
      if (profile.vibrationEnabled) Vibration.vibrate(40);
      recorder.record();
      // Task #87 — record for up to 6 seconds so the trim modal has a real
      // window to scrub across. The 2-second cap is enforced by the trim
      // handles + saved end-start when the player commits.
      await new Promise<void>((r) => setTimeout(r, CUSTOM_STINGER_RECORD_MAX_MS));
      try { await recorder.stop(); } catch {}
      setIsRecordingStinger(false);
      const uri = recorder.uri;
      if (!uri) {
        Alert.alert(stingerTitle(), T("logoStingerLoadFailed") || "Could not load the audio");
        return;
      }
      await openStingerTrim(uri, "m4a");
    } catch (err) {
      setIsRecordingStinger(false);
      Alert.alert(stingerTitle(), errorMessage(err, "logoStingerLoadFailed", "Could not load the audio"));
    } finally {
      setCustomStingerBusy(false);
    }
  };

  const removeCustomStinger = () => {
    const prevUri = profile.customLogoStingerUri || "";
    const prevWasRemote = /^https?:\/\//i.test(prevUri);
    setCustomStingerUri(null);
    // Fall back to the *previously selected* built-in stinger if Custom was
    // the active pick, not the global default.
    // Reset trim markers to defaults so a freshly-picked replacement clip
    // doesn't inherit the previous selection's window.
    if ((profile.logoStingerId ?? DEFAULT_LOGO_STINGER_ID) === "custom") {
      const fallbackId: LogoStingerId = profile.lastBuiltInLogoStingerId ?? DEFAULT_LOGO_STINGER_ID;
      updateSettings({
        customLogoStingerUri: "",
        customLogoStingerStartMs: 0,
        customLogoStingerEndMs: CUSTOM_LOGO_STINGER_MAX_MS,
        customLogoStingerIsTrimmedFile: false,
        logoStingerId: fallbackId,
      });
    } else {
      updateSettings({
        customLogoStingerUri: "",
        customLogoStingerStartMs: 0,
        customLogoStingerEndMs: CUSTOM_LOGO_STINGER_MAX_MS,
        customLogoStingerIsTrimmedFile: false,
      });
    }
    if (!prevWasRemote) cleanupOldCustomClip(prevUri);
    // Task #88 — drop the cloud copy + any cached downloads so reinstalling
    // / signing back in doesn't restore a clip the user just cleared.
    if (prevWasRemote) clearCustomStingerCache();
    deleteRemoteCustomStinger().catch(() => {});
    if (profile.vibrationEnabled) Vibration.vibrate(30);
  };

  const toggleMuteEmotes = () => {
    updateSettings({ muteEmotes: !(profile.muteEmotes ?? false) });
  };

  const selectLanguage = (code: string) => {
    updateSettings({ language: code });
    setShowLangModal(false);
    playSound("button_press").catch(() => {});
    if (profile.vibrationEnabled) Vibration.vibrate(40);
  };

  const currentLang = LANGUAGES.find(l => l.code === (profile.language ?? "es")) ?? LANGUAGES[0];

  return (
    <LinearGradient colors={bg} style={StyleSheet.absoluteFill}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topPad + 12, paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: titleColor + "22", borderColor: titleColor + "40" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={titleColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: titleColor }]}>{T("settings")}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ──── 🌐 IDIOMA ──── */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <SectionHeader icon="language" label={T("language").toUpperCase()} isDark={isDark} />
          <SettingRow
            label={T("selectLanguage")}
            sub={`${currentLang.flag} ${currentLang.label} — ${currentLang.subtitle}`}
            icon="globe" iconColor="#4FC3F7" iconBg="#1a2a3a"
            isDark={isDark} last
            onPress={() => setShowLangModal(true)}
            right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
          />
        </View>

        {/* ──── 🔊 SONIDO ──── */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <SectionHeader icon="sound" label={T("audio").toUpperCase()} isDark={isDark} />
          <SettingRow
            label={T("music")} sub={T("musicDesc")}
            icon="musical-notes" iconColor="#D4AF37" iconBg="#1a3a1a"
            isDark={isDark}
            right={<Switch value={profile.musicEnabled} onValueChange={toggleMusic} {...sw(profile.musicEnabled, "#D4AF37")} />}
          />
          <SettingRow
            label={T("soundEffects")} sub={T("sfxDesc")}
            icon="volume-high" iconColor="#4FC3F7" iconBg="#1a2a3a"
            isDark={isDark}
            right={<Switch value={profile.sfxEnabled} onValueChange={toggleSfx} {...sw(profile.sfxEnabled, "#4FC3F7")} />}
          />
          <SettingRow
            label={T("vibration")} sub={T("vibrationDesc")}
            icon="phone-portrait" iconColor="#9B59B6" iconBg="#2a1a3a"
            isDark={isDark}
            right={<Switch value={profile.vibrationEnabled ?? true} onValueChange={toggleVibration} {...sw(profile.vibrationEnabled ?? true, "#9B59B6")} />}
          />
          <SettingRow
            label={T("voiceFx") || "Voz y efectos especiales"}
            sub={T("voiceFxDesc") || "Voz \"Ocho Locos\" y cues de eventos"}
            icon="mic" iconColor="#E67E22" iconBg="#2a1a0a"
            isDark={isDark}
            right={<Switch value={profile.voiceFxEnabled ?? true} onValueChange={toggleVoiceFx} {...sw(profile.voiceFxEnabled ?? true, "#E67E22")} />}
          />
          <SettingRow
            label={T("logoStinger") || "Sonido del logo"}
            sub={T(`logoStinger${(profile.logoStingerId ?? DEFAULT_LOGO_STINGER_ID).charAt(0).toUpperCase()}${(profile.logoStingerId ?? DEFAULT_LOGO_STINGER_ID).slice(1)}` as any) || (profile.logoStingerId ?? DEFAULT_LOGO_STINGER_ID)}
            icon="musical-note" iconColor="#F1C40F" iconBg="#2a2a1a"
            isDark={isDark}
            onPress={() => { previewCurrentStinger(); setShowStingerModal(true); }}
            right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
          />
          <SettingRow
            label={T("muteEmotes" as any) || "Silenciar Emotes del Rival"} sub={T("muteEmotesDesc" as any) || "Ocultar mensajes del rival"}
            icon="chatbubble-ellipses" iconColor="#E67E22" iconBg="#2a1a0a"
            isDark={isDark} last
            right={<Switch value={profile.muteEmotes ?? false} onValueChange={toggleMuteEmotes} {...sw(profile.muteEmotes ?? false, "#E67E22")} />}
          />
        </View>

        {/* ──── 🔔 NOTIFICACIONES ──── */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <SectionHeader icon="notifications" label={T("notificationsSection")} isDark={isDark} />
          <SettingRow
            label={T("enableNotifications")} sub={T("enableNotificationsDesc")}
            icon="notifications" iconColor="#E74C3C" iconBg="#3a1a1a"
            isDark={isDark}
            right={<Switch value={profile.notificationsEnabled ?? true} onValueChange={v => updateSettings({ notificationsEnabled: v })} {...sw(profile.notificationsEnabled ?? true, "#E74C3C")} />}
          />
          <SettingRow
            label={T("missionAvailable")} sub={T("missionAvailableDesc")}
            icon="list" iconColor="#F39C12" iconBg="#2a2a1a"
            isDark={isDark}
            right={<Switch value={(profile.notificationsEnabled ?? true) && (profile.missionNotifications ?? true)} onValueChange={v => updateSettings({ missionNotifications: v })} {...sw(profile.missionNotifications ?? true, "#F39C12")} />}
          />
          <SettingRow
            label={T("rewardsToClaim")} sub={T("rewardsToClaimDesc")}
            icon="gift" iconColor="#27AE60" iconBg="#1a3a1a"
            isDark={isDark}
            right={<Switch value={(profile.notificationsEnabled ?? true) && (profile.rewardNotifications ?? true)} onValueChange={v => updateSettings({ rewardNotifications: v })} {...sw(profile.rewardNotifications ?? true, "#27AE60")} />}
          />
          <SettingRow
            label={T("specialEvents")} sub={T("specialEventsDesc")}
            icon="star" iconColor="#D4AF37" iconBg="#2a2a1a"
            isDark={isDark}
            right={<Switch value={(profile.notificationsEnabled ?? true) && (profile.eventNotifications ?? true)} onValueChange={v => updateSettings({ eventNotifications: v })} {...sw(profile.eventNotifications ?? true, "#D4AF37")} />}
          />
          <SettingRow
            label={T("reminders")} sub={T("remindersDesc")}
            icon="time" iconColor="#9B59B6" iconBg="#2a1a3a"
            isDark={isDark} last
            right={<Switch value={(profile.notificationsEnabled ?? true) && (profile.reminderNotifications ?? true)} onValueChange={v => updateSettings({ reminderNotifications: v })} {...sw(profile.reminderNotifications ?? true, "#9B59B6")} />}
          />
        </View>

        {/* ──── 🎮 JUGABILIDAD ──── */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <SectionHeader icon="gameplay" label={T("gameplaySection")} isDark={isDark} />
          <SettingRow
            label={T("fastAnimations")} sub={T("fastAnimationsDesc")}
            icon="flash" iconColor="#F1C40F" iconBg="#2a2a1a"
            isDark={isDark}
            right={<Switch value={profile.fastAnimations ?? false} onValueChange={v => updateSettings({ fastAnimations: v })} {...sw(profile.fastAnimations ?? false, "#F1C40F")} />}
          />
          <SettingRow
            label={T("confirmSpecialCards")} sub={T("confirmSpecialDesc")}
            icon="checkmark-circle" iconColor="#27AE60" iconBg="#1a3a1a"
            isDark={isDark}
            right={<Switch value={profile.confirmSpecialCards ?? true} onValueChange={v => updateSettings({ confirmSpecialCards: v })} {...sw(profile.confirmSpecialCards ?? true, "#27AE60")} />}
          />
          <SettingRow
            label={T("showTutorials")} sub={T("showTutorialsDesc")}
            icon="help-buoy" iconColor="#4FC3F7" iconBg="#1a2a3a"
            isDark={isDark}
            right={<Switch value={profile.showTutorials ?? true} onValueChange={v => updateSettings({ showTutorials: v })} {...sw(profile.showTutorials ?? true, "#4FC3F7")} />}
          />
          <Pressable
            onPress={() => { playSound("button_press").catch(() => {}); router.push("/tutorial"); }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <SettingRow
              label={T("replayTutorial")} sub={T("replayTutorialDesc")}
              icon="play-circle" iconColor="#4FC3F7" iconBg="#1a2a3a"
              isDark={isDark} last
              right={<Ionicons name="chevron-forward" size={18} color={subColor} />}
            />
          </Pressable>
        </View>

        {/* ──── 🎨 GRÁFICOS ──── */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <SectionHeader icon="graphics" label={T("graphicsSection")} isDark={isDark} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#2a1a3a" }]}>
                <Ionicons name="layers" size={19} color="#9B59B6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: isDark ? "#E8DCC8" : "#1a2e1a" }]}>{T("graphicsQuality")}</Text>
                <Text style={[styles.rowSub, { color: subColor }]}>{T("graphicsQualityDesc")}</Text>
              </View>
            </View>
          </View>
          <QualitySelector
            value={profile.graphicsQuality ?? "high"}
            onChange={v => updateSettings({ graphicsQuality: v })}
            isDark={isDark}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", marginVertical: 10 }]} />
          <SettingRow
            label={T("specialEffects")} sub={T("specialEffectsDesc")}
            icon="sparkles" iconColor="#D4AF37" iconBg="#2a2a1a"
            isDark={isDark}
            right={<Switch value={profile.specialEffectsEnabled ?? true} onValueChange={v => updateSettings({ specialEffectsEnabled: v })} {...sw(profile.specialEffectsEnabled ?? true, "#D4AF37")} />}
          />
          <SettingRow
            label={T("animationsEnabled")} sub={T("animationsDesc")}
            icon="film" iconColor="#4FC3F7" iconBg="#1a2a3a"
            isDark={isDark} last
            right={<Switch value={profile.animationsEnabled ?? true} onValueChange={v => updateSettings({ animationsEnabled: v })} {...sw(profile.animationsEnabled ?? true, "#4FC3F7")} />}
          />
        </View>

        {/* ──── 🌙 APARIENCIA ──── */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <SectionHeader icon="appearance" label={T("appearanceSection")} isDark={isDark} />
          <SettingRow
            label={isDark ? T("darkMode") : T("lightMode")}
            sub={isDark ? T("darkThemeActive") : T("lightThemeActive")}
            icon={isDark ? "moon" : "sunny"} iconColor={isDark ? "#9B59B6" : "#F39C12"} iconBg={isDark ? "#2a1a3a" : "#fff9e6"}
            isDark={isDark} last
            right={
              <Switch
                value={isDark}
                onValueChange={() => { updateSettings({ darkMode: !isDark }); if (profile.vibrationEnabled) Vibration.vibrate(40); }}
                {...sw(isDark, isDark ? "#9B59B6" : "#F39C12")}
              />
            }
          />
        </View>

        {/* ──── 👤 CUENTA ──── */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <SectionHeader icon="account" label={T("accountSection")} isDark={isDark} />
          {user && !user.isGuest ? (
            <>
              <SettingRow
                label={user.username} sub={T("accountLinked")}
                icon="checkmark-circle" iconColor="#27AE60" iconBg="#1a3a1a"
                isDark={isDark}
                right={
                  <TouchableOpacity
                    onPress={() => { Alert.alert(T("signOut"), T("confirmSignOut"), [{ text: T("cancel"), style: "cancel" }, { text: T("signOut"), style: "destructive", onPress: () => logout() }]); }}
                    style={[styles.dangerBtn]}
                  >
                    <Text style={styles.dangerBtnText}>{T("signOut")}</Text>
                  </TouchableOpacity>
                }
              />
              <SettingRow
                label={T("cloudSave")} sub={T("cloudSynced")}
                icon="cloud-done" iconColor="#27AE60" iconBg="#1a3a1a"
                isDark={isDark} last
                right={<Ionicons name="checkmark-circle" size={20} color="#27AE60" />}
              />
            </>
          ) : (
            <>
              <SettingRow
                label={T("loginGoogle")} sub={T("linkGoogleDesc")}
                icon="logo-google" iconColor="#E74C3C" iconBg="#3a1a1a"
                isDark={isDark} onPress={() => router.push("/login")}
                right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
              />
              <SettingRow
                label={T("loginFacebook")} sub={T("linkFacebookDesc")}
                icon="logo-facebook" iconColor="#4A90E2" iconBg="#1a2a3a"
                isDark={isDark} onPress={() => router.push("/login")}
                right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
              />
              <SettingRow
                label={T("playAsGuest")} sub={T("noAccountDesc")}
                icon="person-outline" iconColor="#95A5A6" iconBg="#2a2a2a"
                isDark={isDark}
                right={user?.isGuest ? <Ionicons name="checkmark-circle" size={20} color="#27AE60" /> : <View />}
              />
              <SettingRow
                label={T("cloudSave")} sub={T("requiresAccount")}
                icon="cloud-upload" iconColor="#9B59B6" iconBg="#2a1a3a"
                isDark={isDark} last onPress={() => router.push("/login")}
                right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
              />
            </>
          )}
        </View>

        {/* ──── 🛡️ PRIVACIDAD ──── */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <SectionHeader icon="privacy" label={T("privacy").toUpperCase()} isDark={isDark} />
          <SettingRow
            label={T("privacyPolicy")} sub={T("privacyPolicyDesc")}
            icon="document-text" iconColor="#27AE60" iconBg="#1a3a1a"
            isDark={isDark} onPress={() => Alert.alert(T("privacyPolicy"), T("privacyPolicyText" as any))}
            right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
          />
          <SettingRow
            label={T("gamePermissions")} sub={T("permissionsDesc")}
            icon="lock-closed" iconColor="#F39C12" iconBg="#2a2a1a"
            isDark={isDark} onPress={() => Alert.alert(T("gamePermissions"), T("gamePermissionsText" as any))}
            right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
          />
          <SettingRow
            label={T("dataManagement")} sub={T("dataManagementDesc")}
            icon="trash" iconColor="#E74C3C" iconBg="#3a1a1a"
            isDark={isDark} last onPress={() => Alert.alert(T("dataManagement"), T("dataManagementText" as any))}
            right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
          />
        </View>

        {/* ──── ❓ AYUDA ──── */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <SectionHeader icon="help" label={T("help")} isDark={isDark} />
          <SettingRow
            label={T("techSupport")} sub={T("contactTeam")}
            icon="headset" iconColor="#E67E22" iconBg="#3a2a1a"
            isDark={isDark} onPress={() => Linking.openURL("mailto:support@biyisprime.com")}
            right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
          />
          <SettingRow
            label={T("faq")} sub={T("faqDesc")}
            icon="help-circle" iconColor="#4FC3F7" iconBg="#1a2a3a"
            isDark={isDark} onPress={() => setShowFaqModal(true)}
            right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
          />
          <SettingRow
            label={T("reportBug")} sub={T("helpImprove")}
            icon="bug" iconColor="#E74C3C" iconBg="#3a1a1a"
            isDark={isDark} onPress={() => Linking.openURL("mailto:bugs@biyisprime.com?subject=Bug%20Ocho%20Locos")}
            right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
          />
          <SettingRow
            label={T("reportPlayer")} sub={T("reportPlayerDesc")}
            icon="flag" iconColor="#E74C3C" iconBg="#3a1a1a"
            isDark={isDark} last onPress={() => { setReportPlayerName(""); setReportReason(null); setShowReportModal(true); }}
            right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
          />
        </View>

        {/* ──── ℹ️ INFORMACIÓN ──── */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <SectionHeader icon="info" label={T("infoSection")} isDark={isDark} />
          <SettingRow
            label={T("gameVersion")} sub="Ocho Locos v3.0.0"
            icon="code-working" iconColor="#95A5A6" iconBg="#2a2a2a"
            isDark={isDark}
            right={<Text style={[styles.versionChip, { color: titleColor }]}>v3.0.0</Text>}
          />
          <SettingRow
            label={T("credits")} sub={T("creditsDesc")}
            icon="people" iconColor="#D4AF37" iconBg="#2a2a1a"
            isDark={isDark} onPress={() => Alert.alert(T("credits"), T("creditsText" as any))}
            right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
          />
          <SettingRow
            label={T("termsOfService")} sub={T("termsDesc")}
            icon="document" iconColor="#9B59B6" iconBg="#2a1a3a"
            isDark={isDark} last onPress={() => Alert.alert(T("termsOfService"), T("termsText" as any))}
            right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
          />
        </View>

        {/* ──── 🛠 DEV (debug-only) ──── */}
        {__DEV__ && (
          <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <SectionHeader icon="info" label="DEV" isDark={isDark} />
            <SettingRow
              label="Reset cloud profile"
              sub="Wipes server profile + local cache, then reloads the app"
              icon="refresh-circle" iconColor="#E74C3C" iconBg="#3a1a1a"
              isDark={isDark} last
              onPress={() => {
                Alert.alert(
                  "Reset cloud profile?",
                  "This will delete your server profile entry and clear local data so the next launch starts from defaults.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Reset",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          const raw = await AsyncStorage.getItem("ocho_auth_v1");
                          const token = raw ? (JSON.parse(raw) as { token?: string }).token : undefined;
                          if (token) {
                            const url = new URL("/api/auth/dev-reset", getApiUrl()).toString();
                            const resp = await fetch(url, {
                              method: "POST",
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (!resp.ok) {
                              const j = await resp.json().catch(() => ({}));
                              Alert.alert("Reset failed", (j as any)?.error || `HTTP ${resp.status}`);
                              return;
                            }
                          }
                          await AsyncStorage.removeItem("ocho_profile_v3");
                          setShowResetToast(true);
                        } catch (e: any) {
                          Alert.alert("Reset failed", e?.message ?? String(e));
                        }
                      },
                    },
                  ],
                );
              }}
              right={<Ionicons name="chevron-forward" size={16} color={titleColor} />}
            />
          </View>
        )}

        {/* Footer */}
        <View style={styles.footerCard}>
          <LinearGradient colors={["#D4AF3722", "#D4AF3705"]} style={styles.footerGrad}>
            <Text style={styles.footerGame}>OCHO LOCOS</Text>
            <Text style={[styles.footerStudio, { color: subColor }]}>Biyis Prime Studios · v3.0.0</Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* ──── FAQ Modal ──── */}
      <Modal visible={showFaqModal} transparent animationType="slide" onRequestClose={() => setShowFaqModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.faqModal, { backgroundColor: isDark ? "#0a1a0c" : "#f0f8f0" }]}>
            <LinearGradient colors={isDark ? ["#0a1a0c", "#061209"] : ["#f0f8f0", "#e0f0e0"]} style={StyleSheet.absoluteFill} />
            <View style={styles.langModalHeader}>
              <Text style={[styles.langModalTitle, { color: isDark ? "#4FC3F7" : "#0a4a8a" }]}>{T("faq")}</Text>
              <Pressable onPress={() => setShowFaqModal(false)} style={styles.langModalClose}>
                <Ionicons name="close" size={22} color={isDark ? "#6B7A5C" : "#666"} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
              {((profile.language ?? "es") === "es" ? FAQ_ES : FAQ_EN).map((item, i) => (
                <View key={i} style={[styles.faqItem, { borderBottomColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }]}>
                  <View style={styles.faqQ}>
                    <View style={[styles.faqBadge, { backgroundColor: "#4FC3F722" }]}>
                      <Text style={[styles.faqBadgeText, { color: "#4FC3F7" }]}>Q</Text>
                    </View>
                    <Text style={[styles.faqQuestion, { color: isDark ? "#D4AF37" : "#0a4a2a", flex: 1 }]}>{item.q}</Text>
                  </View>
                  <Text style={[styles.faqAnswer, { color: isDark ? "#B0C4A0" : "#2a5a2a" }]}>{item.a}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ──── Report Player Modal ──── */}
      <Modal visible={showReportModal} transparent animationType="slide" onRequestClose={() => setShowReportModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.faqModal, { backgroundColor: isDark ? "#0a0808" : "#fff0f0" }]}>
            <LinearGradient colors={isDark ? ["#1a0808", "#0a0606"] : ["#fff0f0", "#ffe0e0"]} style={StyleSheet.absoluteFill} />
            <View style={styles.langModalHeader}>
              <Text style={[styles.langModalTitle, { color: "#E74C3C" }]}>{T("reportPlayer")}</Text>
              <Pressable onPress={() => setShowReportModal(false)} style={styles.langModalClose}>
                <Ionicons name="close" size={22} color={isDark ? "#6B7A5C" : "#666"} />
              </Pressable>
            </View>
            <Text style={[styles.reportLabel, { color: isDark ? "#B0A0A0" : "#5a2a2a" }]}>
              {(profile.language ?? "es") === "es" ? "Nombre del jugador" : "Player username"}
            </Text>
            <TextInput
              style={[styles.reportInput, { color: isDark ? "#E8DCC8" : "#1a1a1a", borderColor: isDark ? "rgba(231,76,60,0.4)" : "rgba(231,76,60,0.3)", backgroundColor: isDark ? "rgba(231,76,60,0.08)" : "rgba(231,76,60,0.04)" }]}
              placeholder={(profile.language ?? "es") === "es" ? "Ej: JugadorMalo123" : "e.g. BadPlayer123"}
              placeholderTextColor={isDark ? "#6B4040" : "#aa8888"}
              value={reportPlayerName}
              onChangeText={setReportPlayerName}
              autoCapitalize="none"
            />
            <Text style={[styles.reportLabel, { color: isDark ? "#B0A0A0" : "#5a2a2a", marginTop: 14 }]}>
              {(profile.language ?? "es") === "es" ? "Motivo del reporte" : "Reason for report"}
            </Text>
            {[(profile.language ?? "es") === "es" ? ["trap", "Trampa / Trampas"] : ["trap", "Cheating"],
              (profile.language ?? "es") === "es" ? ["language", "Lenguaje ofensivo"] : ["language", "Offensive language"],
              (profile.language ?? "es") === "es" ? ["abandon", "Abandono de partida"] : ["abandon", "Game abandonment"],
              (profile.language ?? "es") === "es" ? ["other", "Otro motivo"] : ["other", "Other reason"],
            ].map(([key, label]) => (
              <Pressable key={key} onPress={() => setReportReason(key)} style={[styles.reportReasonRow, { borderColor: reportReason === key ? "#E74C3C" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)", backgroundColor: reportReason === key ? "#E74C3C22" : "transparent" }]}>
                <View style={[styles.reportRadio, { borderColor: reportReason === key ? "#E74C3C" : isDark ? "#555" : "#ccc" }]}>
                  {reportReason === key && <View style={styles.reportRadioFill} />}
                </View>
                <Text style={[styles.reportReasonText, { color: reportReason === key ? "#E74C3C" : isDark ? "#E8DCC8" : "#2a2a2a" }]}>{label}</Text>
              </Pressable>
            ))}
            <TouchableOpacity
              style={[styles.reportSubmitBtn, { opacity: (reportPlayerName.trim().length > 0 && reportReason) ? 1 : 0.45 }]}
              disabled={!reportPlayerName.trim() || !reportReason}
              onPress={() => {
                const subject = (profile.language ?? "es") === "es" ? `Reporte de jugador: ${reportPlayerName}` : `Player report: ${reportPlayerName}`;
                const body = (profile.language ?? "es") === "es" ? `Jugador: ${reportPlayerName}\nMotivo: ${reportReason}\n\nDescripción:` : `Player: ${reportPlayerName}\nReason: ${reportReason}\n\nDetails:`;
                Linking.openURL(`mailto:support@biyisprime.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`).catch(() => {});
                setShowReportModal(false);
              }}
            >
              <LinearGradient colors={["#E74C3C", "#A01A1A"]} style={styles.reportSubmitGrad}>
                <Ionicons name="flag" size={18} color="#fff" />
                <Text style={styles.reportSubmitText}>{(profile.language ?? "es") === "es" ? "Enviar Reporte" : "Send Report"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.langModal}>
            <LinearGradient colors={["#0a1a0c", "#061209"]} style={StyleSheet.absoluteFill} />
            <View style={styles.langModalHeader}>
              <Text style={styles.langModalTitle}>{T("selectLanguage")}</Text>
              <Pressable onPress={() => setShowLangModal(false)} style={styles.langModalClose}>
                <Ionicons name="close" size={22} color="#6B7A5C" />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              {LANGUAGES.map((lang, i) => {
                const selected = (profile.language ?? "es") === lang.code && LANGUAGES.findIndex(l => l.code === profile.language) === (profile.language === lang.code ? i : -1);
                const isSelected = (profile.language ?? "es") === lang.code;
                return (
                  <Pressable
                    key={`${lang.code}-${i}`}
                    onPress={() => selectLanguage(lang.code)}
                    style={({ pressed }) => [
                      styles.langOption,
                      isSelected && i === LANGUAGES.findIndex(l => l.code === lang.code) && styles.langOptionSelected,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.langOptionName, isSelected && { color: "#D4AF37" }]}>{lang.label}</Text>
                      <Text style={styles.langOptionSub}>{lang.subtitle}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Logo Stinger Picker Modal — Task #82 */}
      <Modal visible={showStingerModal} transparent animationType="slide" onRequestClose={() => setShowStingerModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.langModal}>
            <LinearGradient colors={["#0a1a0c", "#061209"]} style={StyleSheet.absoluteFill} />
            <View style={styles.langModalHeader}>
              <Text style={styles.langModalTitle}>{T("logoStinger") || "Sonido del logo"}</Text>
              <Pressable onPress={() => setShowStingerModal(false)} style={styles.langModalClose}>
                <Ionicons name="close" size={22} color="#6B7A5C" />
              </Pressable>
            </View>
            <Text style={{ paddingHorizontal: 16, paddingBottom: 8, color: "#6B7A5C", fontFamily: "Nunito_500Medium", fontSize: 12 }}>
              {T("logoStingerDesc") || "Toca para escuchar y elegir tu intro"}
            </Text>
            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              {LOGO_STINGERS.map((s) => {
                const isSelected = (profile.logoStingerId ?? DEFAULT_LOGO_STINGER_ID) === s.id;
                const labelKey = `logoStinger${s.id.charAt(0).toUpperCase()}${s.id.slice(1)}` as any;
                const label = T(labelKey) || s.id;
                // Task #86 — premium stingers display a lock + unlock hint
                // until they show up in the player's ownedItems list.
                const unlocked = isStingerUnlocked(s.id, profile.ownedItems);
                const lockHint = !unlocked
                  ? (s.unlock.type === "battle_pass"
                      ? (T("logoStingerLockedBattlePass") || "Unlock in Battle Pass")
                      : (T("logoStingerLockedChest") || "Unlock from chests"))
                  : null;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      if (!unlocked) {
                        previewLogoStinger(s.id).catch(() => {});
                      } else {
                        selectLogoStinger(s.id);
                      }
                    }}
                    style={({ pressed }) => [
                      styles.langOption,
                      isSelected && styles.langOptionSelected,
                      pressed && { opacity: 0.8 },
                      !unlocked && { opacity: 0.7 },
                    ]}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: "#2a2a1a", marginRight: 12 }]}>
                      <Ionicons
                        name={!unlocked ? "lock-closed" : (isSelected ? "musical-notes" : "play")}
                        size={18}
                        color={!unlocked ? "#8E8E93" : "#F1C40F"}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.langOptionName, isSelected && { color: "#D4AF37" }]}>{label}</Text>
                      <Text style={styles.langOptionSub}>
                        {lockHint ?? `${(s.durationMs / 1000).toFixed(1)}s`}
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />}
                  </Pressable>
                );
              })}

              {/* Task #85 — Custom intro clip slot */}
              {(() => {
                const hasCustom = !!(profile.customLogoStingerUri || "");
                const isSelected = hasCustom && (profile.logoStingerId ?? DEFAULT_LOGO_STINGER_ID) === "custom";
                return (
                  <View
                    style={[
                      styles.langOption,
                      isSelected && styles.langOptionSelected,
                      { flexDirection: "column", alignItems: "stretch", gap: 10 },
                    ]}
                  >
                    <Pressable
                      onPress={() => { if (hasCustom) selectLogoStinger("custom"); }}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: "#2a1a3a", marginRight: 12 }]}>
                        <Ionicons name={hasCustom ? (isSelected ? "musical-notes" : "play") : "cloud-upload"} size={18} color="#9B59B6" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.langOptionName, isSelected && { color: "#D4AF37" }]}>
                          {T("logoStingerCustom") || "Custom"}
                        </Text>
                        <Text style={styles.langOptionSub}>
                          {hasCustom
                            ? `≤${(CUSTOM_LOGO_STINGER_MAX_MS / 1000).toFixed(0)}s`
                            : (T("logoStingerCustomEmpty") || "Upload or record your own clip (max 2s)")}
                        </Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />}
                    </Pressable>
                    {hasCustom && (() => {
                      const status = customStingerBackupStatus;
                      // Task #97 — pick badge copy + tap-retry affordance based
                      // on the structured server reason. "too_large" and
                      // "bad_request" can't be fixed by retrying the same clip,
                      // so the badge shows the message without the tap target.
                      let cfg: { icon: "cloud-upload-outline" | "cloud-done-outline" | "cloud-offline-outline"; color: string; label: string; tapRetry: boolean } | null = null;
                      if (status.phase === "uploading") {
                        cfg = { icon: "cloud-upload-outline", color: "#4FC3F7", label: T("logoStingerBackupSyncing") || "Backing up…", tapRetry: false };
                      } else if (status.phase === "synced") {
                        cfg = { icon: "cloud-done-outline", color: "#27AE60", label: T("logoStingerBackupSynced") || "Synced", tapRetry: false };
                      } else if (status.phase === "failed") {
                        if (status.reason === "too_large" || status.reason === "bad_request") {
                          cfg = { icon: "cloud-offline-outline", color: "#E74C3C", label: T("logoStingerBackupTooLarge") || "Clip is too big to back up", tapRetry: false };
                        } else if (status.reason === "rate_limited") {
                          cfg = { icon: "cloud-offline-outline", color: "#E67E22", label: T("logoStingerBackupRateLimited") || "Too many backups — try again later", tapRetry: true };
                        } else if (status.reason === "storage_full") {
                          cfg = { icon: "cloud-offline-outline", color: "#E67E22", label: T("logoStingerBackupStorageFull") || "Cloud backup is full — tap to retry", tapRetry: true };
                        } else if (status.reason === "unauthorized") {
                          cfg = { icon: "cloud-offline-outline", color: "#E67E22", label: T("logoStingerBackupSessionExpired") || "Session expired — sign in again", tapRetry: true };
                        } else {
                          cfg = { icon: "cloud-offline-outline", color: "#E74C3C", label: T("logoStingerBackupFailed") || "Backup failed — tap to retry", tapRetry: true };
                        }
                      }
                      if (!cfg) return null;
                      const inner = (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Ionicons name={cfg.icon} size={13} color={cfg.color} />
                          <Text style={{ fontFamily: "Nunito_600SemiBold", fontSize: 11, color: cfg.color }}>{cfg.label}</Text>
                        </View>
                      );
                      return cfg.tapRetry
                        ? <TouchableOpacity onPress={retryCustomStingerUpload} accessibilityRole="button">{inner}</TouchableOpacity>
                        : <View>{inner}</View>;
                    })()}
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={pickCustomStingerFile}
                        disabled={customStingerBusy || isRecordingStinger}
                        style={[styles.customStingerBtn, { borderColor: "#4FC3F7", opacity: customStingerBusy || isRecordingStinger ? 0.5 : 1 }]}
                      >
                        <Ionicons name="cloud-upload" size={16} color="#4FC3F7" />
                        <Text style={[styles.customStingerBtnText, { color: "#4FC3F7" }]}>
                          {T("logoStingerUpload") || "Upload"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={recordCustomStinger}
                        disabled={customStingerBusy || isRecordingStinger}
                        style={[styles.customStingerBtn, { borderColor: "#E74C3C", opacity: customStingerBusy && !isRecordingStinger ? 0.5 : 1 }]}
                      >
                        <Ionicons name={isRecordingStinger ? "stop-circle" : "mic"} size={16} color="#E74C3C" />
                        <Text style={[styles.customStingerBtnText, { color: "#E74C3C" }]}>
                          {isRecordingStinger
                            ? (T("logoStingerRecording") || "Recording…")
                            : (T("logoStingerRecord") || "Record")}
                        </Text>
                      </TouchableOpacity>
                      {hasCustom && (
                        <TouchableOpacity
                          onPress={removeCustomStinger}
                          disabled={customStingerBusy || isRecordingStinger}
                          style={[styles.customStingerBtn, { borderColor: "#6B7A5C", opacity: customStingerBusy || isRecordingStinger ? 0.5 : 1 }]}
                        >
                          <Ionicons name="trash" size={16} color="#6B7A5C" />
                          <Text style={[styles.customStingerBtnText, { color: "#6B7A5C" }]}>
                            {T("logoStingerRemove") || "Remove"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Task #87 — Custom intro trim modal. Opens after a clip is picked or
          recorded. Lets the player drag two handles over the source waveform
          to pick the 2-second window to keep, preview it, and save (or
          cancel) before anything is written to disk / profile. */}
      <Modal
        visible={!!stingerDraft}
        transparent
        animationType="slide"
        onRequestClose={cancelStingerTrim}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.langModal}>
            <LinearGradient colors={["#0a1a0c", "#061209"]} style={StyleSheet.absoluteFill} />
            <View style={styles.langModalHeader}>
              <Text style={styles.langModalTitle}>
                {T("logoStingerTrimTitle") || "Trim your intro"}
              </Text>
              <Pressable onPress={cancelStingerTrim} style={styles.langModalClose}>
                <Ionicons name="close" size={22} color="#6B7A5C" />
              </Pressable>
            </View>
            <Text style={{ paddingHorizontal: 4, paddingBottom: 12, color: "#6B7A5C", fontFamily: "Nunito_500Medium", fontSize: 12 }}>
              {T("logoStingerTrimDesc") || "Drag the handles to pick a 2-second slice, then preview before saving."}
            </Text>

            {stingerDraft && (() => {
              const totalMs = Math.max(1, stingerDraft.durationMs);
              const startPct = Math.max(0, Math.min(100, (draftStartMs / totalMs) * 100));
              const endPct = Math.max(0, Math.min(100, (draftEndMs / totalMs) * 100));
              const windowSec = Math.max(0, (draftEndMs - draftStartMs) / 1000);
              // Task #92 — real waveform bars come from the server-side
              // ffmpeg decode (`computeStingerWaveform`). While the decode
              // is in flight (`waveformBars === null`) we render flat
              // placeholder bars under a small spinner. If decoding failed
              // (`waveformBars === []`) we fall back to deterministic
              // URI-hashed bars so the modal still looks like a waveform
              // instead of an empty rectangle.
              const isWaveformLoading = waveformBars === null;
              let bars: number[];
              if (waveformBars && waveformBars.length > 0) {
                // Map 0..1 peaks into the same 0.25..1 visual range as the
                // old placeholder so the bar row keeps a consistent floor
                // (no zero-height bars) and very loud peaks fill the row.
                bars = waveformBars.map(v => 0.25 + Math.max(0, Math.min(1, v)) * 0.75);
              } else if (isWaveformLoading) {
                bars = new Array(36).fill(0.35);
              } else {
                bars = [];
                const seed = stingerDraft.srcUri;
                for (let i = 0; i < 36; i++) {
                  let h = 0;
                  for (let j = 0; j < seed.length; j++) {
                    h = ((h << 5) - h + seed.charCodeAt(j) + i * 31) | 0;
                  }
                  const norm = (Math.abs(h) % 100) / 100;
                  bars.push(0.25 + norm * 0.75);
                }
              }
              return (
                <View>
                  <View style={styles.trimDurationRow}>
                    <Text style={styles.trimMetaText}>
                      {(() => {
                        const dur = `0:00 / ${(stingerDraft.durationMs / 1000).toFixed(1)}s`;
                        const sz = formatStingerSize(stingerDraft.srcSizeBytes);
                        return sz ? `${dur} \u00b7 ${sz}` : dur;
                      })()}
                    </Text>
                    <Text style={styles.trimWindowText}>
                      {`${windowSec.toFixed(2)}s`}
                    </Text>
                  </View>
                  {/* Task #101 — warn when the source clip exceeds the
                      server's upload limit. Task #104 — when the source is
                      within the shrink endpoint's input cap, also offer a
                      one-tap "Shrink to fit" action that re-encodes it down
                      so Save can proceed without a re-record. */}
                  {stingerDraft.srcSizeBytes > CUSTOM_LOGO_STINGER_SOURCE_MAX_BYTES && (() => {
                    const canShrink = stingerDraft.srcSizeBytes <= CUSTOM_LOGO_STINGER_SHRINK_MAX_INPUT_BYTES;
                    return (
                      <View style={styles.trimWarnRow}>
                        <Ionicons name="alert-circle-outline" size={14} color="#E67E22" />
                        <Text style={styles.trimWarnText}>
                          {(canShrink
                            ? (T("logoStingerTrimTooBigShrinkable") || "Clip is over {limit} — shrink it to fit, or pick a shorter one.")
                            : (T("logoStingerTrimTooBigWarn") || "Clip is over {limit} — pick or record a shorter one to save it."))
                            .replace("{limit}", `${(CUSTOM_LOGO_STINGER_SOURCE_MAX_BYTES / (1024 * 1024)).toFixed(0)} MB`)}
                        </Text>
                        {canShrink && (
                          <TouchableOpacity
                            onPress={shrinkStingerSource}
                            disabled={isShrinkingDraft}
                            style={styles.trimWarnAction}
                          >
                            <Ionicons name="contract-outline" size={14} color="#E67E22" />
                            <Text style={styles.trimWarnActionText}>
                              {isShrinkingDraft
                                ? (T("logoStingerShrinking") || "Shrinking...")
                                : (T("logoStingerShrinkAction") || "Shrink to fit")}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })()}
                  <View
                    style={styles.trimTrack}
                    onLayout={(e: LayoutChangeEvent) => setTrimTrackWidth(e.nativeEvent.layout.width)}
                  >
                    {/* Background waveform (real amplitudes once decoded). */}
                    <View
                      style={[styles.trimWaveformRow, isWaveformLoading && { opacity: 0.4 }]}
                      pointerEvents="none"
                    >
                      {bars.map((b, i) => (
                        <View
                          key={i}
                          style={[
                            styles.trimWaveformBar,
                            { height: 6 + b * 32 },
                          ]}
                        />
                      ))}
                    </View>
                    {/* Task #92 — small spinner shown while the source clip
                        is decoded server-side. Sits over the placeholder
                        bars and disappears once amplitudes arrive. */}
                    {isWaveformLoading && (
                      <View style={styles.trimWaveformLoading} pointerEvents="none">
                        <ActivityIndicator size="small" color="#D4AF37" />
                      </View>
                    )}
                    {/* Selected window highlight */}
                    <View
                      pointerEvents="none"
                      style={[
                        styles.trimSelection,
                        { left: `${startPct}%`, width: `${Math.max(0, endPct - startPct)}%` },
                      ]}
                    />
                    {/* Start handle */}
                    <View
                      {...startHandlePan.panHandlers}
                      style={[styles.trimHandle, { left: `${startPct}%`, marginLeft: -14 }]}
                    >
                      <View style={styles.trimHandleGrip} />
                    </View>
                    {/* End handle */}
                    <View
                      {...endHandlePan.panHandlers}
                      style={[styles.trimHandle, { left: `${endPct}%`, marginLeft: -14 }]}
                    >
                      <View style={styles.trimHandleGrip} />
                    </View>
                  </View>
                  <View style={styles.trimMarkersRow}>
                    <Text style={styles.trimMetaText}>
                      {`${T("logoStingerTrimStart") || "Start"}: ${(draftStartMs / 1000).toFixed(2)}s`}
                    </Text>
                    <Text style={styles.trimMetaText}>
                      {`${T("logoStingerTrimEnd") || "End"}: ${(draftEndMs / 1000).toFixed(2)}s`}
                    </Text>
                  </View>

                  <View style={styles.trimButtonRow}>
                    <TouchableOpacity
                      onPress={isPreviewingDraft ? stopDraftPreview : previewDraftWindow}
                      style={[styles.customStingerBtn, { borderColor: "#4FC3F7", flex: 1 }]}
                    >
                      <Ionicons
                        name={isPreviewingDraft ? "stop-circle" : "play-circle"}
                        size={18}
                        color="#4FC3F7"
                      />
                      <Text style={[styles.customStingerBtnText, { color: "#4FC3F7" }]}>
                        {isPreviewingDraft
                          ? (T("logoStingerTrimStop") || "Stop")
                          : (T("logoStingerTrimPreview") || "Preview")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={cancelStingerTrim}
                      style={[styles.customStingerBtn, { borderColor: "#6B7A5C", flex: 1 }]}
                    >
                      <Ionicons name="close-circle" size={18} color="#6B7A5C" />
                      <Text style={[styles.customStingerBtnText, { color: "#6B7A5C" }]}>
                        {T("logoStingerTrimCancel") || "Cancel"}
                      </Text>
                    </TouchableOpacity>
                    {(() => {
                      // Task #101 — disable Save when the source clip exceeds
                      // the server's upload limit; trim would just 413.
                      const tooBig = stingerDraft.srcSizeBytes > CUSTOM_LOGO_STINGER_SOURCE_MAX_BYTES;
                      const color = tooBig ? "#6B7A5C" : "#27AE60";
                      return (
                        <TouchableOpacity
                          onPress={saveStingerTrim}
                          disabled={tooBig}
                          style={[styles.customStingerBtn, { borderColor: color, flex: 1, backgroundColor: tooBig ? "rgba(0,0,0,0.15)" : "rgba(39,174,96,0.12)", opacity: tooBig ? 0.55 : 1 }]}
                        >
                          <Ionicons name="checkmark-circle" size={18} color={color} />
                          <Text style={[styles.customStingerBtnText, { color }]}>
                            {T("logoStingerTrimSave") || "Save"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })()}
                  </View>
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>

      {showResetToast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.resetToast,
            { bottom: insets.bottom + 32, opacity: resetToastOpacity },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.resetToastText}>Cuenta reseteada ✓</Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, width: "100%", maxWidth: 720, alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontFamily: "Nunito_800ExtraBold", fontSize: 22, letterSpacing: 1 },
  section: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionHeaderIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sectionHeaderLabel: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, letterSpacing: 2.5 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, marginBottom: 2 },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 0 },
  rowRight: { marginLeft: 8 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginRight: 12 },
  rowLabel: { fontFamily: "Nunito_700Bold", fontSize: 14 },
  rowSub: { fontFamily: "Nunito_400Regular", fontSize: 11, marginTop: 1 },
  divider: { height: 1 },
  qualityRow: { flexDirection: "row", gap: 8, marginTop: 6, marginBottom: 4, paddingLeft: 50 },
  qualityBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center",
  },
  qualityBtnActive: {},
  qualityBtnText: { fontFamily: "Nunito_700Bold", fontSize: 12 },
  dangerBtn: { backgroundColor: "#E74C3C22", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#E74C3C55" },
  dangerBtnText: { fontFamily: "Nunito_700Bold", fontSize: 12, color: "#E74C3C" },
  versionChip: { fontFamily: "Nunito_800ExtraBold", fontSize: 13 },
  footerCard: { borderRadius: 14, overflow: "hidden", marginTop: 8 },
  footerGrad: { alignItems: "center", paddingVertical: 20, paddingHorizontal: 16 },
  footerGame: { fontFamily: "Nunito_800ExtraBold", fontSize: 22, color: "#D4AF37", letterSpacing: 5 },
  footerStudio: { fontFamily: "Nunito_400Regular", fontSize: 11, marginTop: 4 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  langModal: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 44,
    overflow: "hidden", borderTopWidth: 1, borderColor: "rgba(212,175,55,0.25)",
  },
  langModalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  langModalTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 18, color: "#D4AF37" },
  langModalClose: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  langOption: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    borderRadius: 14, marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  langOptionSelected: { backgroundColor: "rgba(212,175,55,0.12)", borderColor: "rgba(212,175,55,0.4)" },
  langFlag: { fontSize: 26 },
  langOptionName: { fontFamily: "Nunito_700Bold", fontSize: 15, color: "#E8DCC8" },
  langOptionSub: { fontFamily: "Nunito_400Regular", fontSize: 11, color: "#6B7A5C", marginTop: 1 },
  // Task #85 — buttons under the Custom intro slot in the stinger picker.
  customStingerBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 8, paddingHorizontal: 8, borderRadius: 10, borderWidth: 1.5,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  customStingerBtnText: { fontFamily: "Nunito_700Bold", fontSize: 12 },
  // Task #87 — trim modal: scrubber track, fake waveform, draggable handles.
  trimDurationRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingHorizontal: 4 },
  trimMetaText: { fontFamily: "Nunito_500Medium", fontSize: 12, color: "#8A9978" },
  trimWindowText: { fontFamily: "Nunito_800ExtraBold", fontSize: 14, color: "#D4AF37" },
  trimWarnRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10, paddingHorizontal: 6, paddingVertical: 6, borderRadius: 6, backgroundColor: "rgba(230,126,34,0.12)", borderWidth: 1, borderColor: "rgba(230,126,34,0.3)" },
  trimWarnText: { fontFamily: "Nunito_600SemiBold", fontSize: 11, color: "#E67E22", flex: 1 },
  trimWarnAction: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: "#E67E22", backgroundColor: "rgba(230,126,34,0.18)" },
  trimWarnActionText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: "#E67E22" },
  trimTrack: {
    height: 56, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1, borderColor: "rgba(212,175,55,0.18)",
    justifyContent: "center", overflow: "visible", marginBottom: 8,
  },
  trimWaveformRow: {
    position: "absolute", left: 6, right: 6, top: 0, bottom: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  trimWaveformBar: { width: 3, borderRadius: 2, backgroundColor: "rgba(168,200,140,0.5)" },
  trimWaveformLoading: {
    position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
  },
  trimSelection: {
    position: "absolute", top: 0, bottom: 0,
    backgroundColor: "rgba(212,175,55,0.18)",
    borderLeftWidth: 1.5, borderRightWidth: 1.5, borderColor: "rgba(212,175,55,0.55)",
  },
  trimHandle: {
    position: "absolute", top: -6, bottom: -6, width: 28,
    alignItems: "center", justifyContent: "center",
  },
  trimHandleGrip: {
    width: 14, height: "100%", borderRadius: 7,
    backgroundColor: "#D4AF37", borderWidth: 2, borderColor: "#0a1a0c",
  },
  trimMarkersRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14, paddingHorizontal: 4 },
  trimButtonRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  // FAQ
  faqModal: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 44,
    overflow: "hidden", borderTopWidth: 1, borderColor: "rgba(79,195,247,0.25)",
  },
  faqItem: { paddingVertical: 14, borderBottomWidth: 1, gap: 6 },
  faqQ: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  faqBadge: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 1 },
  faqBadgeText: { fontFamily: "Nunito_800ExtraBold", fontSize: 12 },
  faqQuestion: { fontFamily: "Nunito_700Bold", fontSize: 14 },
  faqAnswer: { fontFamily: "Nunito_400Regular", fontSize: 13, lineHeight: 20, paddingLeft: 34 },
  // Report Player
  reportLabel: { fontFamily: "Nunito_700Bold", fontSize: 13, marginBottom: 8 },
  reportInput: {
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontFamily: "Nunito_400Regular", fontSize: 14,
  },
  reportReasonRow: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1.5, marginBottom: 8,
  },
  reportRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  reportRadioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#E74C3C" },
  reportReasonText: { fontFamily: "Nunito_700Bold", fontSize: 13 },
  reportSubmitBtn: { borderRadius: 14, overflow: "hidden", marginTop: 18 },
  reportSubmitGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  reportSubmitText: { fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: "#fff" },
  resetToast: {
    position: "absolute", alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 14, backgroundColor: "#27AE60",
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  resetToastText: { fontFamily: "Nunito_800ExtraBold", fontSize: 14, color: "#fff" },
});
