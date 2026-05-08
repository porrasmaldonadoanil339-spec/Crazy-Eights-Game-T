import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ACHIEVEMENTS, Achievement, AchievementId } from "@/lib/achievements";
import { STORE_ITEMS, StoreItem } from "@/lib/storeItems";
import { BATTLE_PASS_TIERS, getBattlePassTiers, getCurrentBattlePassTier, getPlayerLevel, getXpProgress, getFreeReward } from "@/lib/battlePass";
import { getCurrentSeason } from "@/lib/seasons";
import type { GameModeId, Difficulty } from "@/lib/gameModes";
import { RankedProfile, addStars, getRankUpRewards, getRankUpBonusCoins } from "@/lib/ranked";
import { playOchoLocosVoice, DEFAULT_LOGO_STINGER_ID, isStingerUnlocked, type LogoStingerId } from "@/lib/audioManager";
import { Chest, ChestReward, ChestType, createChest, openChest as openChestReward } from "@/lib/chestSystem";
import { getPlayerPathLevel, getPlayerPathReward, MAX_PLAYER_PATH_LEVEL } from "@/lib/playerPath";

export interface GameRecord {
  id: string;
  mode: GameModeId;
  won: boolean;
  coinsEarned: number;
  xpEarned: number;
  timestamp: number;
  opponentName?: string;
}

export interface PlayerStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winsByMode: Partial<Record<GameModeId, number>>;
  gamesByMode: Partial<Record<GameModeId, number>>;
  winsByEvent?: Partial<Record<string, number>>;
  gamesByEvent?: Partial<Record<string, number>>;
  winsByDifficulty: Partial<Record<Difficulty, number>>;
  totalEightsPlayed: number;
  totalCardsDrawn: number;
  perfectWins: number;
  comebackWins: number;
  dailyStreak: number;
  winStreak: number;
  lastPlayedDate: string;
  challengesCompleted: number;
  tournamentsWon: number;
  fastestLightningWin: number;
  localMultiWins: number;
  localMultiGames: number;
  onlineMultiWins: number;
  onlineMultiGames: number;
  recentGames: GameRecord[];
}

export interface AchievementProgress {
  id: AchievementId;
  progress: number;
  unlocked: boolean;
  claimedReward: boolean;
}

export interface DailyReward {
  day: number;
  coins: number;
  xp: number;
  label: string;
  icon: string;
  iconColor: string;
  chestType?: ChestType;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, coins: 15,  xp: 30,  label: "15 monedas",              icon: "cash",      iconColor: "#F1C40F" },
  { day: 2, coins: 20,  xp: 60,  label: "20 monedas + XP",         icon: "star",      iconColor: "#D4AF37" },
  { day: 3, coins: 10,  xp: 50,  label: "¡Cofre Común!",           icon: "cube",      iconColor: "#A0522D", chestType: "common" },
  { day: 4, coins: 30,  xp: 80,  label: "30 monedas + XP",         icon: "cash",      iconColor: "#F1C40F" },
  { day: 5, coins: 50,  xp: 100, label: "50 monedas",              icon: "gift",      iconColor: "#9B59B6" },
  { day: 6, coins: 25,  xp: 100, label: "¡Cofre Raro!",            icon: "cube-outline", iconColor: "#4A90E2", chestType: "rare" },
  { day: 7, coins: 100, xp: 250, label: "¡Cofre Épico! Gran recompensa", icon: "diamond", iconColor: "#9B59B6", chestType: "epic" },
];

export interface OutgoingRequest {
  id: string;
  name: string;
  level: number;
  avatarIcon: string;
  avatarColor: string;
  photoUrl?: string;
  sentAt: number;
}

export interface PlayerProfile {
  name: string;
  avatarId: string;
  titleId: string;
  cardBackId: string;
  cardDesignId: string;
  tableDesignId: string;
  selectedFrameId: string;
  photoUri: string;
  selectedEffect: string;
  bio: string;
  coins: number;
  fichas: number;
  totalXp: number;
  ownedItems: string[];
  achievementProgress: AchievementProgress[];
  claimedBattlePassTiers: number[];
  claimedBattlePassPremiumTiers: number[];
  premiumBattlePassSeasons: number[];
  claimedPlayerPathLevels: number[];
  battlePassSeasonNumber: number;
  stats: PlayerStats;
  // Daily rewards
  lastDailyRewardDate: string;
  dailyRewardIndex: number;
  // Daily chest purchase limit (max 3/day)
  chestPurchasesToday: number;
  lastChestPurchaseDate: string;
  // Daily shop
  lastDailyShopFreeDate: string;
  purchasedDailyShopIds: string[];
  lastDailyShopDate: string;
  // Fichas mode
  fichasModePlaysToday: number;
  lastFichasModeDate: string;
  // Watch ads
  adsWatchedToday: number;
  lastAdsDate: string;
  // Emotes
  equippedEmotes: string[];
  // Settings
  musicEnabled: boolean;
  sfxEnabled: boolean;
  vibrationEnabled: boolean;
  // Task #74 — sub-toggle for the synthesized "Ocho Locos" voice and other
  // special voice/SFX cues (rank promotion, splash). Defaults to true. When
  // false, regular SFX still play but voice cues are silenced.
  voiceFxEnabled: boolean;
  // Task #82 — selected logo intro stinger id (player picks one in Settings).
  logoStingerId: LogoStingerId;
  // Task #85 — local file:// URI of the player's custom intro clip (uploaded
  // or recorded). Empty string when none. Cloud-synced as part of the profile
  // (the URI is device-local, same pattern as photoUri).
  customLogoStingerUri?: string;
  // Task #91 — saved custom clips are now real, pre-trimmed m4a files (the
  // trim window is baked in by the server's ffmpeg endpoint at Save time).
  // Post-#91 saves always write startMs=0, endMs=trimmedDurationMs, and
  // isTrimmedFile=true; legacy profiles created before #91 (where the
  // file is the full untrimmed source) leave isTrimmedFile undefined and
  // still get a (endMs-startMs)-bounded safety stop in the audio manager.
  customLogoStingerStartMs?: number;
  customLogoStingerEndMs?: number;
  // Task #91 — true when customLogoStingerUri points at an already-trimmed
  // standalone file (no playback-time trimming needed). Undefined / false
  // means the URI is a pre-#91 untrimmed source clip that still needs the
  // legacy safety stop derived from customLogoStingerStartMs/EndMs.
  customLogoStingerIsTrimmedFile?: boolean;
  // Task #85 — remembers the last built-in stinger id the player explicitly
  // picked, so removing the custom clip falls back to that selection (rather
  // than the global default).
  lastBuiltInLogoStingerId?: LogoStingerId;
  muteEmotes: boolean;
  language: string;
  darkMode: boolean;
  country: string;
  // Notification settings
  notificationsEnabled: boolean;
  missionNotifications: boolean;
  rewardNotifications: boolean;
  eventNotifications: boolean;
  reminderNotifications: boolean;
  // Gameplay settings
  fastAnimations: boolean;
  confirmSpecialCards: boolean;
  showTutorials: boolean;
  tutorialSeen: boolean;
  // Graphics settings
  graphicsQuality: "low" | "medium" | "high";
  specialEffectsEnabled: boolean;
  animationsEnabled: boolean;
  // Friend requests (global, persisted)
  pendingOutgoingRequests?: OutgoingRequest[];
  // Linked accounts
  linkedGoogle?: string;
  linkedFacebook?: string;
  rankedProfile: RankedProfile;
  chestInventory: Chest[];
  // Overflow queue for chests earned while inventory was full. They are
  // automatically promoted into the inventory whenever the player opens an
  // existing chest, so they're never lost silently.
  chestOverflow?: Chest[];
  // Ranked anti-abuse: timestamps (ms) of recent abandons. Used to apply
  // progressive penalties and a short matchmaking cooldown after repeated leaves.
  recentRankedAbandons?: number[];
  rankedCooldownUntil?: number;
}

const DEFAULT_STATS: PlayerStats = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  winsByMode: {},
  gamesByMode: {},
  winsByEvent: {},
  gamesByEvent: {},
  winsByDifficulty: {},
  totalEightsPlayed: 0,
  totalCardsDrawn: 0,
  perfectWins: 0,
  comebackWins: 0,
  dailyStreak: 0,
  winStreak: 0,
  lastPlayedDate: "",
  challengesCompleted: 0,
  tournamentsWon: 0,
  fastestLightningWin: 999999,
  localMultiWins: 0,
  localMultiGames: 0,
  onlineMultiWins: 0,
  onlineMultiGames: 0,
  recentGames: [],
};

const DEFAULT_PROFILE: PlayerProfile = {
  name: "Jugador",
  avatarId: "avatar_knight",
  titleId: "title_novice",
  cardBackId: "back_default",
  cardDesignId: "face_default",
  tableDesignId: "table_casino",
  selectedFrameId: "frame_gold",
  photoUri: "",
  selectedEffect: "none",
  bio: "",
  coins: 50,
  fichas: 25,
  totalXp: 0,
  // Task #86 — free logo intro stingers (`stinger_casino`, `stinger_fanfare`)
  // are seeded so isStingerUnlocked() reports the same source of truth as the
  // unlock metadata in audioManager.LOGO_STINGERS.
  ownedItems: ["back_default", "avatar_knight", "title_novice", "frame_gold", "stinger_casino", "stinger_fanfare"],
  achievementProgress: ACHIEVEMENTS.map((a) => ({
    id: a.id,
    progress: 0,
    unlocked: false,
    claimedReward: false,
  })),
  claimedBattlePassTiers: [1],
  claimedBattlePassPremiumTiers: [],
  premiumBattlePassSeasons: [],
  claimedPlayerPathLevels: [],
  battlePassSeasonNumber: 1,
  stats: DEFAULT_STATS,
  lastDailyRewardDate: "",
  dailyRewardIndex: 0,
  chestPurchasesToday: 0,
  lastChestPurchaseDate: "",
  lastDailyShopFreeDate: "",
  purchasedDailyShopIds: [],
  lastDailyShopDate: "",
  fichasModePlaysToday: 0,
  lastFichasModeDate: "",
  adsWatchedToday: 0,
  lastAdsDate: "",
  equippedEmotes: ["emote_gg", "emote_ocho", "emote_bravo", "emote_lol", "emote_no", "emote_si", "emote_jaja", "emote_bien"],
  musicEnabled: true,
  sfxEnabled: true,
  vibrationEnabled: true,
  voiceFxEnabled: true,
  logoStingerId: DEFAULT_LOGO_STINGER_ID,
  customLogoStingerUri: "",
  customLogoStingerStartMs: 0,
  customLogoStingerEndMs: 2000,
  lastBuiltInLogoStingerId: DEFAULT_LOGO_STINGER_ID,
  muteEmotes: false,
  language: "es",
  darkMode: true,
  country: "CO",
  notificationsEnabled: true,
  missionNotifications: true,
  rewardNotifications: true,
  eventNotifications: true,
  reminderNotifications: true,
  fastAnimations: false,
  confirmSpecialCards: true,
  showTutorials: true,
  tutorialSeen: false,
  graphicsQuality: "high" as "low" | "medium" | "high",
  specialEffectsEnabled: true,
  animationsEnabled: true,
  rankedProfile: { rank: 0, division: 0, stars: 0, maxStars: 5, totalWins: 0, totalLosses: 0 },
  chestInventory: [],
  chestOverflow: [],
  recentRankedAbandons: [],
  rankedCooldownUntil: 0,
};

interface ProfileContextValue {
  profile: PlayerProfile;
  isLoaded: boolean;
  updateName: (name: string) => void;
  updateBio: (bio: string) => void;
  updateAvatar: (avatarId: string) => void;
  updateTitle: (titleId: string) => void;
  updateCardBack: (cardBackId: string) => void;
  updateCardDesign: (cardDesignId: string) => void;
  updateTableDesign: (tableDesignId: string) => void;
  updateFrame: (frameId: string) => void;
  updateEffect: (effectId: string) => void;
  updatePhotoUri: (uri: string) => void;
  updateCountry: (country: string) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addFichas: (amount: number) => void;
  spendFichas: (amount: number) => boolean;
  buyChestWithFichas: (chestType: ChestType) => "ok" | "queued" | "inventory_full" | "fail";
  buyDailyShopItem: (itemId: string, price: number, currency: "coins" | "fichas") => boolean;
  claimDailyShopFree: (itemId: string) => boolean;
  recordFichasModePlay: () => void;
  fichasModePlaysRemaining: () => number;
  claimPlayerPathLevel: (level: number) => "ok" | "queued" | "inventory_full" | "fail";
  addXp: (amount: number) => void;
  buyItem: (item: StoreItem) => boolean;
  recordGameResult: (params: {
    won: boolean;
    mode: GameModeId;
    difficulty: Difficulty;
    coinsEarned: number;
    xpEarned: number;
    eightsPlayed: number;
    cardsDrawn: number;
    isPerfect: boolean;
    isComeback: boolean;
    gameDurationMs?: number;
    eventId?: string | null;
  }) => void;
  recordEventWin: (eventId: string) => void;
  updateAchievementProgress: (id: AchievementId, amount: number) => void;
  claimBattlePassTier: (tier: number, track?: "free" | "premium") => "ok" | "queued" | "inventory_full" | "fail";
  isPremiumBattlePassActive: boolean;
  unlockPremiumBattlePass: () => { ok: boolean; queuedChests: number; skippedChests: number };
  premiumBattlePassCost: number;
  claimAchievementReward: (id: AchievementId) => "ok" | "queued" | "inventory_full" | "fail";
  claimDailyReward: () => { reward: DailyReward; queued: boolean } | null;
  canClaimDailyReward: boolean;
  todaysDailyReward: DailyReward;
  updateSettings: (settings: Partial<Pick<PlayerProfile, "musicEnabled" | "sfxEnabled" | "vibrationEnabled" | "voiceFxEnabled" | "logoStingerId" | "customLogoStingerUri" | "customLogoStingerStartMs" | "customLogoStingerEndMs" | "customLogoStingerIsTrimmedFile" | "lastBuiltInLogoStingerId" | "muteEmotes" | "language" | "darkMode" | "notificationsEnabled" | "missionNotifications" | "rewardNotifications" | "eventNotifications" | "reminderNotifications" | "fastAnimations" | "confirmSpecialCards" | "showTutorials" | "graphicsQuality" | "specialEffectsEnabled" | "animationsEnabled">>) => void;
  updateEquippedEmotes: (emoteIds: string[]) => void;
  updateRanked: (delta: number) => void;
  recordRankedAbandon: () => { totalStarLoss: number; cooldownMs: number; abandonsInWindow: number };
  isRankedOnCooldown: boolean;
  rankedCooldownRemainingMs: number;
  watchAd: () => boolean;
  adsWatchedToday: number;
  adDailyLimit: number;
  level: number;
  xpProgress: { current: number; needed: number; level: number };
  battlePassTier: number;
  addOutgoingFriendRequest: (req: Omit<OutgoingRequest, "sentAt">) => void;
  removeOutgoingFriendRequest: (id: string) => void;
  linkAccount: (provider: "google" | "facebook", email: string) => void;
  unlinkAccount: (provider: "google" | "facebook") => void;
  markTutorialSeen: () => void;
  addChestToInventory: (type: ChestType, source: Chest["source"]) => { added: boolean; queued: boolean };
  isChestInventoryFull: boolean;
  chestInventoryLimit: number;
  chestOverflowLimit: number;
  openChestFromInventory: (chestId: string) => ChestReward | null;
  openChestFromOverflow: (chestId: string) => ChestReward | null;
  chestInventory: Chest[];
  chestOverflow: Chest[];
  chestOverflowCount: number;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);
const STORAGE_KEY = "ocho_profile_v3";
const CHEST_INVENTORY_LIMIT = 10;
const CHEST_OVERFLOW_LIMIT = 20;

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(() => ({
    ...DEFAULT_PROFILE,
    battlePassSeasonNumber: getCurrentSeason().number,
  }));
  const [isLoaded, setIsLoaded] = useState(false);

  // Runtime season-rollover guard: if the season changes while the app is
  // open (long-running session), wipe claimed BP tiers so the new season
  // starts fresh without needing a restart.
  useEffect(() => {
    const t = setInterval(() => {
      const current = getCurrentSeason().number;
      setProfile((p) => {
        if (p.battlePassSeasonNumber === current) return p;
        return { ...p, battlePassSeasonNumber: current, claimedBattlePassTiers: [1], claimedBattlePassPremiumTiers: [] };
      });
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  // Grand-prize auto-claim: when the player crosses the XP threshold for the
  // final battle-pass tier (120), automatically grant the free-track reward
  // (a legendary chest) so the user does not have to scroll to the very last
  // tier and tap claim. Premium-track grand prize remains a manual claim so
  // it stays a "moment" for the player who paid for premium.
  useEffect(() => {
    if (!isLoaded) return;
    const FINAL_TIER = 120;
    const finalTierDef = BATTLE_PASS_TIERS.find((t) => t.tier === FINAL_TIER);
    if (!finalTierDef) return;
    if ((profile.totalXp ?? 0) < finalTierDef.xpRequired) return;
    if ((profile.claimedBattlePassTiers ?? []).includes(FINAL_TIER)) return;
    setProfile((p) => {
      if ((p.claimedBattlePassTiers ?? []).includes(FINAL_TIER)) return p;
      const free = getFreeReward(FINAL_TIER);
      let next: PlayerProfile = {
        ...p,
        claimedBattlePassTiers: [...(p.claimedBattlePassTiers ?? []), FINAL_TIER],
        coins: p.coins + free.coins,
      };
      if (free.type === "chest" && free.chestType) {
        const newChest = createChest(free.chestType, "mission");
        const inv = next.chestInventory ?? [];
        const ovf = next.chestOverflow ?? [];
        if (inv.length < CHEST_INVENTORY_LIMIT) {
          next = { ...next, chestInventory: [...inv, newChest] };
        } else if (ovf.length < CHEST_OVERFLOW_LIMIT) {
          next = { ...next, chestOverflow: [...ovf, newChest] };
        }
      }
      return next;
    });
  }, [profile.totalXp, profile.claimedBattlePassTiers, isLoaded]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as PlayerProfile;
          // Merge saved ranked profile, ensuring all required fields exist
          const savedRanked = saved.rankedProfile ?? {};
          const mergedRanked: RankedProfile = {
            ...DEFAULT_PROFILE.rankedProfile,
            ...savedRanked,
            // Clamp to valid ranges
            rank: Math.max(0, Math.min(11, savedRanked.rank ?? 0)),
            division: Math.max(0, Math.min(4, savedRanked.division ?? 0)),
            stars: Math.max(0, savedRanked.stars ?? 0),
            maxStars: savedRanked.maxStars ?? 5,
            totalWins: savedRanked.totalWins ?? 0,
            totalLosses: savedRanked.totalLosses ?? 0,
          };
          // Migration v2: recalculate division from totalWins for rank-0 players (fixes Hierro I/V mismatch)
          if (!savedRanked.rankedProfileVersion && mergedRanked.rank === 0) {
            const ms = mergedRanked.maxStars || 5;
            mergedRanked.division = Math.min(4, Math.floor(mergedRanked.totalWins / ms));
            mergedRanked.stars = mergedRanked.totalWins % ms;
            mergedRanked.rankedProfileVersion = 2;
          } else if (!savedRanked.rankedProfileVersion) {
            mergedRanked.rankedProfileVersion = 2;
          }

          // Task #86 — older profiles may have a premium stinger selected
          // from before unlock gating existed. Reset to the default free
          // stinger if the saved selection isn't actually unlocked.
          const ownedForCheck = saved.ownedItems ?? DEFAULT_PROFILE.ownedItems;
          const savedStingerId = (saved.logoStingerId ?? DEFAULT_LOGO_STINGER_ID) as LogoStingerId;
          const safeStingerId: LogoStingerId =
            savedStingerId === "custom" || isStingerUnlocked(savedStingerId, ownedForCheck)
              ? savedStingerId
              : DEFAULT_LOGO_STINGER_ID;

          const merged: PlayerProfile = {
            ...DEFAULT_PROFILE,
            ...saved,
            logoStingerId: safeStingerId,
            stats: { ...DEFAULT_STATS, ...saved.stats },
            rankedProfile: mergedRanked,
            achievementProgress: ACHIEVEMENTS.map((a) => {
              const existing = saved.achievementProgress?.find((p) => p.id === a.id);
              return existing ?? { id: a.id, progress: 0, unlocked: false, claimedReward: false };
            }),
            ownedItems: saved.ownedItems ?? DEFAULT_PROFILE.ownedItems,
            fichas: saved.fichas ?? DEFAULT_PROFILE.fichas,
            claimedPlayerPathLevels: saved.claimedPlayerPathLevels ?? [],
            claimedBattlePassTiers: (() => {
              const savedSeason = saved.battlePassSeasonNumber ?? 1;
              const currentSeason = getCurrentSeason().number;
              if (savedSeason !== currentSeason) return [1];
              return saved.claimedBattlePassTiers ?? [1];
            })(),
            claimedBattlePassPremiumTiers: (() => {
              const savedSeason = saved.battlePassSeasonNumber ?? 1;
              const currentSeason = getCurrentSeason().number;
              if (savedSeason !== currentSeason) return [];
              return saved.claimedBattlePassPremiumTiers ?? [];
            })(),
            premiumBattlePassSeasons: saved.premiumBattlePassSeasons ?? [],
            battlePassSeasonNumber: getCurrentSeason().number,
            lastDailyRewardDate: saved.lastDailyRewardDate ?? "",
            chestPurchasesToday: saved.chestPurchasesToday ?? 0,
            lastChestPurchaseDate: saved.lastChestPurchaseDate ?? "",
            lastDailyShopFreeDate: saved.lastDailyShopFreeDate ?? "",
            purchasedDailyShopIds: saved.purchasedDailyShopIds ?? [],
            lastDailyShopDate: saved.lastDailyShopDate ?? "",
            fichasModePlaysToday: saved.fichasModePlaysToday ?? 0,
            lastFichasModeDate: saved.lastFichasModeDate ?? "",
            dailyRewardIndex: saved.dailyRewardIndex ?? 0,
            musicEnabled: saved.musicEnabled ?? true,
            sfxEnabled: saved.sfxEnabled ?? true,
            voiceFxEnabled: saved.voiceFxEnabled ?? true,
            cardDesignId: saved.cardDesignId ?? "face_default",
            tableDesignId: saved.tableDesignId ?? "table_casino",
            selectedFrameId: saved.selectedFrameId ?? "frame_gold",
            photoUri: saved.photoUri ?? "",
            country: saved.country ?? "CO",
            equippedEmotes: saved.equippedEmotes ?? DEFAULT_PROFILE.equippedEmotes,
            language: saved.language ?? "es",
          };
          setProfile(merged);
        }
      } catch {}

      // Cloud restore: if authenticated, fetch server profile and merge (server wins for progress)
      try {
        const authRaw = await AsyncStorage.getItem("ocho_auth_v1");
        if (authRaw) {
          const { token, user } = JSON.parse(authRaw) as { token?: string; user?: { isGuest?: boolean } };
          if (token && !user?.isGuest) {
            const { getApiUrl } = await import("@/lib/query-client");
            const url = new URL("/api/auth/profile", getApiUrl()).toString();
            const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (resp.ok) {
              const json = await resp.json() as { ok: boolean; data: PlayerProfile | null };
              if (json.ok && json.data) {
                const serverProfile = json.data as PlayerProfile;
                setProfile((prev) => ({
                  ...prev,
                  ...serverProfile,
                  stats: { ...prev.stats, ...(serverProfile.stats ?? {}) },
                  rankedProfile: { ...prev.rankedProfile, ...(serverProfile.rankedProfile ?? {}) },
                }));
              }
            }
          }
        }
      } catch {}

      setIsLoaded(true);
    })();
  }, []);

  const cloudSync = useCallback(async (p: PlayerProfile) => {
    try {
      const raw = await AsyncStorage.getItem("ocho_auth_v1");
      if (!raw) return;
      const { token, user } = JSON.parse(raw) as { token?: string; user?: { isGuest?: boolean } };
      if (!token || user?.isGuest) return;
      const { getApiUrl } = await import("@/lib/query-client");
      const url = new URL("/api/auth/profile", getApiUrl()).toString();
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data: p }),
      }).catch(() => {});
    } catch {}
  }, []);

  const save = useCallback((p: PlayerProfile) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p)).catch(() => {});
    cloudSync(p);
  }, [cloudSync]);

  const update = useCallback((updater: (prev: PlayerProfile) => PlayerProfile) => {
    setProfile((prev) => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, [save]);

  const updateName = useCallback((name: string) => {
    update((p) => ({ ...p, name: name.trim() || "Jugador" }));
  }, [update]);

  const updateBio = useCallback((bio: string) => {
    update((p) => ({ ...p, bio }));
  }, [update]);

  const updateAvatar = useCallback((avatarId: string) => {
    update((p) => ({ ...p, avatarId }));
  }, [update]);

  const updateTitle = useCallback((titleId: string) => {
    update((p) => ({ ...p, titleId }));
  }, [update]);

  const updateCardBack = useCallback((cardBackId: string) => {
    update((p) => ({ ...p, cardBackId }));
  }, [update]);

  const updateCardDesign = useCallback((cardDesignId: string) => {
    update((p) => ({ ...p, cardDesignId }));
  }, [update]);

  const updateTableDesign = useCallback((tableDesignId: string) => {
    update((p) => ({ ...p, tableDesignId }));
  }, [update]);

  const updateFrame = useCallback((frameId: string) => {
    update((p) => ({ ...p, selectedFrameId: frameId }));
  }, [update]);

  const updateEffect = useCallback((effectId: string) => {
    update((p) => ({ ...p, selectedEffect: effectId }));
  }, [update]);

  const updateEquippedEmotes = useCallback((emoteIds: string[]) => {
    update((p) => ({ ...p, equippedEmotes: emoteIds.slice(0, 8) }));
  }, [update]);

  const updateRanked = useCallback((delta: number) => {
    let rankedUp = false;
    update((p) => {
      const nextRanked = addStars(p.rankedProfile, delta);
      const itemsToAdd: string[] = [];
      let bonusCoins = 0;

      // Detect rank up
      if (nextRanked.rank > p.rankedProfile.rank) {
        rankedUp = true;
        bonusCoins = getRankUpBonusCoins(nextRanked.rank);
        const rewards = getRankUpRewards(nextRanked.rank);
        rewards.forEach(id => {
          if (!p.ownedItems.includes(id)) {
            itemsToAdd.push(id);
          }
        });
      }

      return {
        ...p,
        rankedProfile: nextRanked,
        coins: p.coins + bonusCoins,
        ownedItems: [...p.ownedItems, ...itemsToAdd],
      };
    });
    // Centralized rank-up audio cue. Fires for every rank promotion regardless
    // of which game mode triggered it (online, offline tournament, challenge
    // rewards, etc.). Gated by voiceFxEnabled inside playOchoLocosVoice.
    if (rankedUp) {
      // Slight delay so it doesn't collide with the win SFX tail.
      setTimeout(() => { playOchoLocosVoice().catch(() => {}); }, 350);
    }
  }, [update]);

  // ─── Ranked anti-abuse: penalty + cooldown for repeated abandons ─────────
  // Window: rolling 24 hours. Tiers:
  //   1 abandon  →  -1 star  (base loss)
  //   2 abandons →  -1 star
  //   3-4        →  -2 stars (extra penalty)
  //   5+         →  -3 stars + 10 min cooldown (no matchmaking)
  const ABANDON_WINDOW_MS = 24 * 60 * 60 * 1000;
  const recordRankedAbandon = useCallback(() => {
    const now = Date.now();
    let result = { totalStarLoss: 1, cooldownMs: 0, abandonsInWindow: 1 };
    update((p) => {
      const recent = (p.recentRankedAbandons ?? []).filter(t => now - t < ABANDON_WINDOW_MS);
      recent.push(now);
      const count = recent.length;
      let starLoss = 1;
      let cooldownMs = 0;
      if (count >= 5) { starLoss = 3; cooldownMs = 10 * 60 * 1000; }
      else if (count >= 3) { starLoss = 2; }
      result = { totalStarLoss: starLoss, cooldownMs, abandonsInWindow: count };
      const nextRanked = addStars(p.rankedProfile, -starLoss);
      const cooldownUntil = cooldownMs > 0 ? now + cooldownMs : (p.rankedCooldownUntil ?? 0);
      return {
        ...p,
        rankedProfile: nextRanked,
        recentRankedAbandons: recent,
        rankedCooldownUntil: cooldownUntil,
      };
    });
    return result;
  }, [update]);

  const updatePhotoUri = useCallback((uri: string) => {
    update((p) => ({ ...p, photoUri: uri }));
  }, [update]);

  const updateCountry = useCallback((country: string) => {
    update((p) => ({ ...p, country }));
  }, [update]);

  const addCoins = useCallback((amount: number) => {
    update((p) => ({ ...p, coins: p.coins + amount }));
  }, [update]);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    update((p) => {
      if (p.coins >= amount) {
        success = true;
        return { ...p, coins: p.coins - amount };
      }
      return p;
    });
    return success;
  }, [update]);

  const addFichas = useCallback((amount: number) => {
    update((p) => ({ ...p, fichas: (p.fichas ?? 0) + amount }));
  }, [update]);

  const spendFichas = useCallback((amount: number): boolean => {
    let success = false;
    update((p) => {
      const balance = p.fichas ?? 0;
      if (balance >= amount) {
        success = true;
        return { ...p, fichas: balance - amount };
      }
      return p;
    });
    return success;
  }, [update]);

  const CHEST_FICHA_PRICES: Record<ChestType, number> = {
    common: 25, rare: 80, epic: 200, legendary: 500,
    magic: 150, giant: 350, event: 280, supreme: 800, fichas: 100,
  };

  const claimPlayerPathLevel = useCallback((level: number): "ok" | "queued" | "inventory_full" | "fail" => {
    let result: "ok" | "queued" | "inventory_full" | "fail" = "fail";
    update((p) => {
      const claimed = p.claimedPlayerPathLevels ?? [];
      if (claimed.includes(level)) return p;
      const reached = getPlayerPathLevel(p.totalXp);
      if (level > reached || level < 1 || level > MAX_PLAYER_PATH_LEVEL) return p;
      const reward = getPlayerPathReward(level);
      let queueChest = false;
      if (reward.type === "chest") {
        const inv = p.chestInventory ?? [];
        const ovf = p.chestOverflow ?? [];
        if (inv.length >= CHEST_INVENTORY_LIMIT) {
          if (ovf.length >= CHEST_OVERFLOW_LIMIT) {
            result = "inventory_full";
            return p;
          }
          queueChest = true;
        }
      }
      result = queueChest ? "queued" : "ok";
      let next: PlayerProfile = { ...p, claimedPlayerPathLevels: [...claimed, level] };
      if (reward.type === "coins") next = { ...next, coins: next.coins + reward.amount };
      else if (reward.type === "fichas") next = { ...next, fichas: (next.fichas ?? 0) + reward.amount };
      else if (reward.type === "chest") {
        const newChest = createChest(reward.chestType, "achievement");
        if (queueChest) {
          const ovf = next.chestOverflow ?? [];
          next = { ...next, chestOverflow: [...ovf, newChest] };
        } else {
          const inv = next.chestInventory ?? [];
          next = { ...next, chestInventory: [...inv, newChest] };
        }
      }
      return next;
    });
    return result;
  }, [update]);

  const buyChestWithFichas = useCallback((chestType: ChestType): "ok" | "queued" | "inventory_full" | "fail" => {
    let result: "ok" | "queued" | "inventory_full" | "fail" = "fail";
    const today = new Date().toDateString();
    update((p) => {
      const price = CHEST_FICHA_PRICES[chestType];
      const balance = p.fichas ?? 0;
      const inv = p.chestInventory ?? [];
      const ovf = p.chestOverflow ?? [];
      if (balance < price) return p;
      const sameDay = p.lastChestPurchaseDate === today;
      const purchasesToday = sameDay ? (p.chestPurchasesToday ?? 0) : 0;
      if (purchasesToday >= 3) return p;
      const newChest = createChest(chestType, "purchase");
      if (inv.length < CHEST_INVENTORY_LIMIT) {
        result = "ok";
        return {
          ...p,
          fichas: balance - price,
          chestInventory: [...inv, newChest],
          chestPurchasesToday: purchasesToday + 1,
          lastChestPurchaseDate: today,
        };
      }
      if (ovf.length >= CHEST_OVERFLOW_LIMIT) {
        result = "inventory_full";
        return p;
      }
      result = "queued";
      return {
        ...p,
        fichas: balance - price,
        chestOverflow: [...ovf, newChest],
        chestPurchasesToday: purchasesToday + 1,
        lastChestPurchaseDate: today,
      };
    });
    return result;
  }, [update]);

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  const buyDailyShopItem = useCallback((itemId: string, price: number, currency: "coins" | "fichas"): boolean => {
    let success = false;
    update((p) => {
      const today = todayKey();
      const purchased = p.lastDailyShopDate === today ? (p.purchasedDailyShopIds ?? []) : [];
      if (purchased.includes(itemId)) return p;
      if ((p.ownedItems ?? []).includes(itemId)) return p;
      if (currency === "coins") {
        if (p.coins < price) return p;
        success = true;
        return {
          ...p,
          coins: p.coins - price,
          ownedItems: [...(p.ownedItems ?? []), itemId],
          lastDailyShopDate: today,
          purchasedDailyShopIds: [...purchased, itemId],
        };
      }
      const balance = p.fichas ?? 0;
      if (balance < price) return p;
      success = true;
      return {
        ...p,
        fichas: balance - price,
        ownedItems: [...(p.ownedItems ?? []), itemId],
        lastDailyShopDate: today,
        purchasedDailyShopIds: [...purchased, itemId],
      };
    });
    return success;
  }, [update]);

  // Daily SHOP free cosmetic (rotating item) — independent of the daily LOGIN
  // reward below (claimDailyReward / lastDailyRewardDate). Both can be claimed
  // on the same day; they use separate state keys and separate UI surfaces.
  const claimDailyShopFree = useCallback((itemId: string): boolean => {
    let success = false;
    update((p) => {
      const today = todayKey();
      if (p.lastDailyShopFreeDate === today) return p;
      success = true;
      const owned = p.ownedItems ?? [];
      return {
        ...p,
        lastDailyShopFreeDate: today,
        ownedItems: owned.includes(itemId) ? owned : [...owned, itemId],
      };
    });
    return success;
  }, [update]);

  const recordFichasModePlay = useCallback(() => {
    update((p) => {
      const today = todayKey();
      if (p.lastFichasModeDate !== today) {
        return { ...p, fichasModePlaysToday: 1, lastFichasModeDate: today };
      }
      return { ...p, fichasModePlaysToday: (p.fichasModePlaysToday ?? 0) + 1 };
    });
  }, [update]);

  const fichasModePlaysRemaining = useCallback((): number => {
    const today = todayKey();
    if (profile.lastFichasModeDate !== today) return 3;
    return Math.max(0, 3 - (profile.fichasModePlaysToday ?? 0));
  }, [profile.lastFichasModeDate, profile.fichasModePlaysToday]);

  const addXp = useCallback((amount: number) => {
    update((p) => ({ ...p, totalXp: p.totalXp + amount }));
  }, [update]);

  const buyItem = useCallback((item: StoreItem): boolean => {
    let success = false;
    const useFichas = item.category === "emote";
    update((p) => {
      if (p.ownedItems.includes(item.id)) return p;
      if (useFichas) {
        const fichasBal = p.fichas ?? 0;
        if (fichasBal < item.price) return p;
        success = true;
        return {
          ...p,
          fichas: fichasBal - item.price,
          ownedItems: [...p.ownedItems, item.id],
        };
      }
      if (p.coins < item.price) return p;
      success = true;
      return {
        ...p,
        coins: p.coins - item.price,
        ownedItems: [...p.ownedItems, item.id],
      };
    });
    return success;
  }, [update]);

  const updateAchievementProgress = useCallback((id: AchievementId, amount: number) => {
    update((p) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (!achievement) return p;
      const newProgress = p.achievementProgress.map((ap) => {
        if (ap.id !== id || ap.unlocked) return ap;
        const newAmt = ap.progress + amount;
        const unlocked = newAmt >= achievement.target;
        return { ...ap, progress: Math.min(newAmt, achievement.target), unlocked };
      });
      return { ...p, achievementProgress: newProgress };
    });
  }, [update]);

  const claimAchievementReward = useCallback((id: AchievementId): "ok" | "queued" | "inventory_full" | "fail" => {
    let result: "ok" | "queued" | "inventory_full" | "fail" = "fail";
    update((p) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      const ach = p.achievementProgress.find((a) => a.id === id);
      if (!achievement || !ach || !ach.unlocked || ach.claimedReward) return p;
      const rarityToChest: Record<string, ChestType | undefined> = {
        rare: "common",
        epic: "rare",
        legendary: "epic",
      };
      const chestType = rarityToChest[achievement.rarity];
      let queueChest = false;
      if (chestType) {
        const inv = p.chestInventory ?? [];
        const ovf = p.chestOverflow ?? [];
        if (inv.length >= CHEST_INVENTORY_LIMIT) {
          if (ovf.length >= CHEST_OVERFLOW_LIMIT) {
            result = "inventory_full";
            return p;
          }
          queueChest = true;
        }
      }
      result = queueChest ? "queued" : "ok";
      const newProgress = p.achievementProgress.map((ap) =>
        ap.id === id ? { ...ap, claimedReward: true } : ap
      );
      let next = {
        ...p,
        coins: p.coins + achievement.coinsReward,
        totalXp: p.totalXp + achievement.xpReward,
        achievementProgress: newProgress,
      };
      if (chestType) {
        const newChest = createChest(chestType, "achievement");
        if (queueChest) {
          const ovf = next.chestOverflow ?? [];
          next = { ...next, chestOverflow: [...ovf, newChest] };
        } else {
          const inventory = next.chestInventory ?? [];
          next = { ...next, chestInventory: [...inventory, newChest] };
        }
      }
      return next;
    });
    return result;
  }, [update]);

  const claimBattlePassTier = useCallback((tier: number, track: "free" | "premium" = "free"): "ok" | "queued" | "inventory_full" | "fail" => {
    let result: "ok" | "queued" | "inventory_full" | "fail" = "fail";
    update((p) => {
      const seasonTiers = getBattlePassTiers(getCurrentSeason().number);
      const bpTier = seasonTiers.find((t) => t.tier === tier);
      if (!bpTier) return p;
      // Cannot claim tier you have not reached yet.
      if ((p.totalXp ?? 0) < bpTier.xpRequired) return p;

      if (track === "free") {
        if (p.claimedBattlePassTiers.includes(tier)) return p;
        const free = getFreeReward(tier);
        let queueChest = false;
        if (free.type === "chest" && free.chestType) {
          const inv = p.chestInventory ?? [];
          const ovf = p.chestOverflow ?? [];
          if (inv.length >= CHEST_INVENTORY_LIMIT) {
            if (ovf.length >= CHEST_OVERFLOW_LIMIT) {
              result = "inventory_full";
              return p;
            }
            queueChest = true;
          }
        }
        result = queueChest ? "queued" : "ok";
        let next = {
          ...p,
          claimedBattlePassTiers: [...p.claimedBattlePassTiers, tier],
          coins: p.coins + free.coins,
        };
        if (free.type === "chest" && free.chestType) {
          const newChest = createChest(free.chestType, "mission");
          if (queueChest) {
            const ovf = next.chestOverflow ?? [];
            next = { ...next, chestOverflow: [...ovf, newChest] };
          } else {
            const inv = next.chestInventory ?? [];
            next = { ...next, chestInventory: [...inv, newChest] };
          }
        }
        return next;
      }

      // Premium track — requires unlock for current season and not already claimed
      const currentSeasonNum = getCurrentSeason().number;
      const hasPremium = (p.premiumBattlePassSeasons ?? []).includes(currentSeasonNum);
      if (!hasPremium) return p;
      const premiumClaimed = p.claimedBattlePassPremiumTiers ?? [];
      if (premiumClaimed.includes(tier)) return p;

      let queueChest = false;
      if (bpTier.rewardType === "chest") {
        const inv = p.chestInventory ?? [];
        const ovf = p.chestOverflow ?? [];
        if (inv.length >= CHEST_INVENTORY_LIMIT) {
          if (ovf.length >= CHEST_OVERFLOW_LIMIT) {
            result = "inventory_full";
            return p;
          }
          queueChest = true;
        }
      }
      result = queueChest ? "queued" : "ok";
      let next: PlayerProfile = {
        ...p,
        claimedBattlePassPremiumTiers: [...premiumClaimed, tier],
      };
      if (bpTier.rewardType === "coins" && typeof bpTier.rewardValue === "number") {
        next = { ...next, coins: next.coins + bpTier.rewardValue };
      }
      // Task #86 — "stinger" rewards are stored in ownedItems alongside the
      // other cosmetics, gated by `isStingerUnlocked` in the Settings picker.
      if (["item", "avatar", "title", "frame", "effect", "stinger"].includes(bpTier.rewardType)) {
        const itemId = bpTier.rewardValue as string;
        if (!next.ownedItems.includes(itemId)) {
          next = { ...next, ownedItems: [...next.ownedItems, itemId] };
        }
      }
      if (bpTier.rewardType === "chest") {
        const chestT = bpTier.rewardValue as ChestType;
        const newChest = createChest(chestT, "mission");
        if (queueChest) {
          const ovf = next.chestOverflow ?? [];
          next = { ...next, chestOverflow: [...ovf, newChest] };
        } else {
          const inv = next.chestInventory ?? [];
          next = { ...next, chestInventory: [...inv, newChest] };
        }
      }
      return next;
    });
    return result;
  }, [update]);

  const PREMIUM_BP_COST = 500;
  const isPremiumBattlePassActive = (profile.premiumBattlePassSeasons ?? []).includes(getCurrentSeason().number);

  const unlockPremiumBattlePass = useCallback((): { ok: boolean; queuedChests: number; skippedChests: number } => {
    const seasonNum = getCurrentSeason().number;
    if ((profile.premiumBattlePassSeasons ?? []).includes(seasonNum)) return { ok: false, queuedChests: 0, skippedChests: 0 };
    if ((profile.fichas ?? 0) < PREMIUM_BP_COST) return { ok: false, queuedChests: 0, skippedChests: 0 };
    let queuedChests = 0;
    let skippedChests = 0;
    let unlocked = false;
    update((p) => {
      if ((p.premiumBattlePassSeasons ?? []).includes(seasonNum)) return p;
      if ((p.fichas ?? 0) < PREMIUM_BP_COST) return p;
      unlocked = true;
      queuedChests = 0;
      skippedChests = 0;
      // Clash Royale–style: auto-grant every premium reward already reached by current XP
      const tiers = getBattlePassTiers(seasonNum);
      const reachedPremium = tiers.filter((t) => (p.totalXp ?? 0) >= t.xpRequired);
      const alreadyClaimed = new Set(p.claimedBattlePassPremiumTiers ?? []);
      let next: PlayerProfile = {
        ...p,
        fichas: (p.fichas ?? 0) - PREMIUM_BP_COST,
        premiumBattlePassSeasons: [...(p.premiumBattlePassSeasons ?? []), seasonNum],
      };
      const newlyClaimed: number[] = [];
      for (const t of reachedPremium) {
        if (alreadyClaimed.has(t.tier)) continue;
        if (t.rewardType === "coins" && typeof t.rewardValue === "number") {
          next = { ...next, coins: next.coins + t.rewardValue };
          newlyClaimed.push(t.tier);
        } else if (["item", "avatar", "title", "frame", "effect", "stinger"].includes(t.rewardType)) {
          const itemId = t.rewardValue as string;
          if (!next.ownedItems.includes(itemId)) {
            next = { ...next, ownedItems: [...next.ownedItems, itemId] };
          }
          newlyClaimed.push(t.tier);
        } else if (t.rewardType === "chest") {
          const chestT = t.rewardValue as ChestType;
          const newChest = createChest(chestT, "mission");
          const inv = next.chestInventory ?? [];
          if (inv.length < CHEST_INVENTORY_LIMIT) {
            next = { ...next, chestInventory: [...inv, newChest] };
            newlyClaimed.push(t.tier);
          } else {
            const ovf = next.chestOverflow ?? [];
            if (ovf.length < CHEST_OVERFLOW_LIMIT) {
              next = { ...next, chestOverflow: [...ovf, newChest] };
              newlyClaimed.push(t.tier);
              queuedChests += 1;
            } else {
              // Inventory + overflow are full — leave the tier unclaimed so the
              // player can pick it up later once space frees up. Surface a count
              // to the caller so a clear notice can be shown.
              skippedChests += 1;
            }
          }
        } else {
          newlyClaimed.push(t.tier);
        }
      }
      if (newlyClaimed.length > 0) {
        next = {
          ...next,
          claimedBattlePassPremiumTiers: [...(next.claimedBattlePassPremiumTiers ?? []), ...newlyClaimed],
        };
      }
      return next;
    });
    return { ok: unlocked, queuedChests, skippedChests };
  }, [profile.premiumBattlePassSeasons, profile.fichas, update]);

  // Daily LOGIN reward (coins / XP / chest) — independent of the daily SHOP
  // free gift above. Tracked under lastDailyRewardDate; surfaces in the home
  // DailyRewardModal, not in the store.
  const claimDailyReward = useCallback((): { reward: DailyReward; queued: boolean } | null => {
    const today = new Date().toDateString();
    if (profile.lastDailyRewardDate === today) return null;
    const reward = DAILY_REWARDS[profile.dailyRewardIndex % DAILY_REWARDS.length];
    const currentInv = profile.chestInventory ?? [];
    const currentOvf = profile.chestOverflow ?? [];
    let willQueue = false;
    if (reward.chestType && currentInv.length >= CHEST_INVENTORY_LIMIT) {
      if (currentOvf.length >= CHEST_OVERFLOW_LIMIT) {
        return null;
      }
      willQueue = true;
    }
    update((p) => {
      const inv = p.chestInventory ?? [];
      const ovf = p.chestOverflow ?? [];
      const goesToOverflow = !!reward.chestType && inv.length >= CHEST_INVENTORY_LIMIT;
      if (goesToOverflow && ovf.length >= CHEST_OVERFLOW_LIMIT) return p;
      const newInventory = [...inv];
      const newOverflow = [...ovf];
      if (reward.chestType) {
        const newChest = createChest(reward.chestType, "daily");
        if (goesToOverflow) newOverflow.push(newChest);
        else newInventory.push(newChest);
      }
      return {
        ...p,
        coins: p.coins + reward.coins,
        totalXp: p.totalXp + reward.xp,
        lastDailyRewardDate: today,
        dailyRewardIndex: (p.dailyRewardIndex + 1) % DAILY_REWARDS.length,
        chestInventory: newInventory,
        chestOverflow: newOverflow,
      };
    });
    return { reward, queued: willQueue };
  }, [profile.lastDailyRewardDate, profile.dailyRewardIndex, profile.chestInventory, profile.chestOverflow, update]);

  const updateSettings = useCallback((settings: Partial<Pick<PlayerProfile, "musicEnabled" | "sfxEnabled" | "vibrationEnabled" | "voiceFxEnabled" | "logoStingerId" | "customLogoStingerUri" | "customLogoStingerStartMs" | "customLogoStingerEndMs" | "customLogoStingerIsTrimmedFile" | "lastBuiltInLogoStingerId" | "muteEmotes" | "language" | "darkMode" | "notificationsEnabled" | "missionNotifications" | "rewardNotifications" | "eventNotifications" | "reminderNotifications" | "fastAnimations" | "confirmSpecialCards" | "showTutorials" | "graphicsQuality" | "specialEffectsEnabled" | "animationsEnabled">>) => {
    update((p) => ({ ...p, ...settings }));
  }, [update]);

  const AD_DAILY_LIMIT = 5;
  const AD_COINS_REWARD = 15;
  const watchAd = useCallback((): boolean => {
    const today = new Date().toDateString();
    let success = false;
    update((p) => {
      const watched = p.lastAdsDate === today ? (p.adsWatchedToday ?? 0) : 0;
      if (watched >= AD_DAILY_LIMIT) return p;
      success = true;
      return {
        ...p,
        coins: p.coins + AD_COINS_REWARD,
        adsWatchedToday: watched + 1,
        lastAdsDate: today,
      };
    });
    return success;
  }, [update]);

  const adsWatchedToday = useMemo(() => {
    const today = new Date().toDateString();
    return profile.lastAdsDate === today ? (profile.adsWatchedToday ?? 0) : 0;
  }, [profile.lastAdsDate, profile.adsWatchedToday]);

  const recordGameResult = useCallback((params: {
    won: boolean;
    mode: GameModeId;
    difficulty: Difficulty;
    coinsEarned: number;
    xpEarned: number;
    eightsPlayed: number;
    cardsDrawn: number;
    isPerfect: boolean;
    isComeback: boolean;
    gameDurationMs?: number;
    opponentName?: string;
    eventId?: string | null;
  }) => {
    update((p) => {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const isNewDay = p.stats.lastPlayedDate !== today;
      const streak = isNewDay
        ? (p.stats.lastPlayedDate === yesterday ? p.stats.dailyStreak + 1 : 1)
        : p.stats.dailyStreak;

      const newWinStreak = params.won ? (p.stats.winStreak ?? 0) + 1 : 0;

      const newStats: PlayerStats = {
        ...p.stats,
        totalGames: p.stats.totalGames + 1,
        totalWins: params.won ? p.stats.totalWins + 1 : p.stats.totalWins,
        totalLosses: params.won ? p.stats.totalLosses : p.stats.totalLosses + 1,
        winStreak: newWinStreak,
        winsByMode: {
          ...p.stats.winsByMode,
          [params.mode]: (p.stats.winsByMode[params.mode] ?? 0) + (params.won ? 1 : 0),
        },
        gamesByMode: {
          ...p.stats.gamesByMode,
          [params.mode]: (p.stats.gamesByMode[params.mode] ?? 0) + 1,
        },
        winsByEvent: params.eventId ? {
          ...(p.stats.winsByEvent ?? {}),
          [params.eventId]: ((p.stats.winsByEvent ?? {})[params.eventId] ?? 0) + (params.won ? 1 : 0),
        } : (p.stats.winsByEvent ?? {}),
        gamesByEvent: params.eventId ? {
          ...(p.stats.gamesByEvent ?? {}),
          [params.eventId]: ((p.stats.gamesByEvent ?? {})[params.eventId] ?? 0) + 1,
        } : (p.stats.gamesByEvent ?? {}),
        winsByDifficulty: {
          ...p.stats.winsByDifficulty,
          [params.difficulty]: (p.stats.winsByDifficulty[params.difficulty] ?? 0) + (params.won ? 1 : 0),
        },
        totalEightsPlayed: p.stats.totalEightsPlayed + params.eightsPlayed,
        totalCardsDrawn: p.stats.totalCardsDrawn + params.cardsDrawn,
        perfectWins: p.stats.perfectWins + (params.isPerfect ? 1 : 0),
        comebackWins: p.stats.comebackWins + (params.isComeback ? 1 : 0),
        dailyStreak: streak,
        lastPlayedDate: today,
        challengesCompleted: params.mode === "challenge" && params.won
          ? p.stats.challengesCompleted + 1 : p.stats.challengesCompleted,
        tournamentsWon: params.mode === "tournament" && params.won
          ? p.stats.tournamentsWon + 1 : p.stats.tournamentsWon,
        fastestLightningWin: (params.mode === "lightning" && params.won && params.gameDurationMs)
          ? Math.min(p.stats.fastestLightningWin, params.gameDurationMs)
          : p.stats.fastestLightningWin,
        recentGames: [
          {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            mode: params.mode,
            won: params.won,
            coinsEarned: params.coinsEarned,
            xpEarned: params.xpEarned,
            timestamp: Date.now(),
            opponentName: params.opponentName,
          },
          ...(p.stats.recentGames ?? []).slice(0, 19),
        ],
      };

      const xpLoss = (!params.won && params.mode !== "practice") ? 10 : 0;
      return {
        ...p,
        coins: p.coins + params.coinsEarned,
        totalXp: Math.max(0, p.totalXp + params.xpEarned - xpLoss),
        stats: newStats,
      };
    });
  }, [update]);

  const recordEventWin = useCallback((eventId: string) => {
    if (!eventId) return;
    update((p) => ({
      ...p,
      stats: {
        ...p.stats,
        winsByEvent: {
          ...(p.stats.winsByEvent ?? {}),
          [eventId]: ((p.stats.winsByEvent ?? {})[eventId] ?? 0) + 1,
        },
        gamesByEvent: {
          ...(p.stats.gamesByEvent ?? {}),
          [eventId]: ((p.stats.gamesByEvent ?? {})[eventId] ?? 0) + 1,
        },
      },
    }));
  }, [update]);

  const canClaimDailyReward = useMemo(() => {
    const today = new Date().toDateString();
    return profile.lastDailyRewardDate !== today;
  }, [profile.lastDailyRewardDate]);

  const todaysDailyReward = useMemo(() => {
    return DAILY_REWARDS[profile.dailyRewardIndex % DAILY_REWARDS.length];
  }, [profile.dailyRewardIndex]);

  const level = useMemo(() => getPlayerLevel(profile.totalXp), [profile.totalXp]);
  const xpProgress = useMemo(() => getXpProgress(profile.totalXp), [profile.totalXp]);
  const battlePassTier = useMemo(() => getCurrentBattlePassTier(profile.totalXp), [profile.totalXp]);

  const addOutgoingFriendRequest = useCallback((req: Omit<OutgoingRequest, "sentAt">) => {
    update((p) => ({
      ...p,
      pendingOutgoingRequests: [
        { ...req, sentAt: Date.now() },
        ...(p.pendingOutgoingRequests ?? []).filter((r) => r.id !== req.id),
      ].slice(0, 50),
    }));
  }, [update]);

  const removeOutgoingFriendRequest = useCallback((id: string) => {
    update((p) => ({
      ...p,
      pendingOutgoingRequests: (p.pendingOutgoingRequests ?? []).filter((r) => r.id !== id),
    }));
  }, [update]);

  const linkAccount = useCallback((provider: "google" | "facebook", email: string) => {
    update((p) => ({
      ...p,
      ...(provider === "google" ? { linkedGoogle: email } : { linkedFacebook: email }),
    }));
  }, [update]);

  const unlinkAccount = useCallback((provider: "google" | "facebook") => {
    update((p) => ({
      ...p,
      ...(provider === "google" ? { linkedGoogle: undefined } : { linkedFacebook: undefined }),
    }));
  }, [update]);

  const markTutorialSeen = useCallback(() => {
    update((p) => ({ ...p, tutorialSeen: true }));
  }, [update]);

  const addChestToInventory = useCallback((type: ChestType, source: Chest["source"]): { added: boolean; queued: boolean } => {
    let added = false;
    let queued = false;
    update((p) => {
      const inventory = p.chestInventory ?? [];
      if (inventory.length < CHEST_INVENTORY_LIMIT) {
        added = true;
        return { ...p, chestInventory: [...inventory, createChest(type, source)] };
      }
      const overflow = p.chestOverflow ?? [];
      if (overflow.length >= CHEST_OVERFLOW_LIMIT) return p;
      queued = true;
      return { ...p, chestOverflow: [...overflow, createChest(type, source)] };
    });
    return { added, queued };
  }, [update]);

  const openChestFromInventory = useCallback((chestId: string): ChestReward | null => {
    let reward: ChestReward | null = null;
    update((p) => {
      const inventory = p.chestInventory ?? [];
      const chest = inventory.find((c) => c.id === chestId);
      if (!chest) return p;
      reward = openChestReward(chest, p.ownedItems);
      const filtered = inventory.filter((c) => c.id !== chestId);
      const overflow = p.chestOverflow ?? [];
      // Promote the oldest queued chest into the inventory now that a slot is free.
      let newInventory = filtered;
      let newOverflow = overflow;
      if (overflow.length > 0 && filtered.length < CHEST_INVENTORY_LIMIT) {
        newInventory = [...filtered, { ...overflow[0], fromOverflow: true }];
        newOverflow = overflow.slice(1);
      }
      const newOwnedItems = reward.item ? [...p.ownedItems, reward.item.id] : p.ownedItems;
      return {
        ...p,
        coins: p.coins + reward.coins,
        totalXp: p.totalXp + reward.xp,
        ownedItems: newOwnedItems,
        chestInventory: newInventory,
        chestOverflow: newOverflow,
      };
    });
    return reward;
  }, [update]);

  const openChestFromOverflow = useCallback((chestId: string): ChestReward | null => {
    let reward: ChestReward | null = null;
    update((p) => {
      const overflow = p.chestOverflow ?? [];
      const chest = overflow.find((c) => c.id === chestId);
      if (!chest) return p;
      reward = openChestReward(chest, p.ownedItems);
      const newOverflow = overflow.filter((c) => c.id !== chestId);
      const newOwnedItems = reward.item ? [...p.ownedItems, reward.item.id] : p.ownedItems;
      return {
        ...p,
        coins: p.coins + reward.coins,
        totalXp: p.totalXp + reward.xp,
        ownedItems: newOwnedItems,
        chestOverflow: newOverflow,
      };
    });
    return reward;
  }, [update]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoaded,
        updateName,
        updateBio,
        updateAvatar,
        updateTitle,
        updateCardBack,
        updateCardDesign,
        updateTableDesign,
        updateFrame,
        updateEffect,
        updatePhotoUri,
        updateCountry,
        addCoins,
        spendCoins,
        addFichas,
        spendFichas,
        buyChestWithFichas,
        buyDailyShopItem,
        claimDailyShopFree,
        recordFichasModePlay,
        fichasModePlaysRemaining,
        claimPlayerPathLevel,
        addXp,
        buyItem,
        recordGameResult,
        recordEventWin,
        updateAchievementProgress,
        claimBattlePassTier,
        isPremiumBattlePassActive,
        unlockPremiumBattlePass,
        premiumBattlePassCost: PREMIUM_BP_COST,
        claimAchievementReward,
        claimDailyReward,
        canClaimDailyReward,
        todaysDailyReward,
        updateSettings,
        updateEquippedEmotes,
        updateRanked,
        recordRankedAbandon,
        isRankedOnCooldown: !!(profile.rankedCooldownUntil && profile.rankedCooldownUntil > Date.now()),
        rankedCooldownRemainingMs: Math.max(0, (profile.rankedCooldownUntil ?? 0) - Date.now()),
        watchAd,
        adsWatchedToday,
        adDailyLimit: AD_DAILY_LIMIT,
        level,
        xpProgress,
        battlePassTier,
        addOutgoingFriendRequest,
        removeOutgoingFriendRequest,
        linkAccount,
        unlinkAccount,
        markTutorialSeen,
        addChestToInventory,
        isChestInventoryFull: (profile.chestInventory ?? []).length >= CHEST_INVENTORY_LIMIT,
        chestInventoryLimit: CHEST_INVENTORY_LIMIT,
        chestOverflowLimit: CHEST_OVERFLOW_LIMIT,
        openChestFromInventory,
        openChestFromOverflow,
        chestInventory: profile.chestInventory ?? [],
        chestOverflow: profile.chestOverflow ?? [],
        chestOverflowCount: (profile.chestOverflow ?? []).length,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
