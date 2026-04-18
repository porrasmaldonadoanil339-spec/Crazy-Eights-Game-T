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
import { Chest, ChestReward, ChestType, createChest, openChest as openChestReward } from "@/lib/chestSystem";

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
  totalXp: number;
  ownedItems: string[];
  achievementProgress: AchievementProgress[];
  claimedBattlePassTiers: number[];
  battlePassSeasonNumber: number;
  stats: PlayerStats;
  // Daily rewards
  lastDailyRewardDate: string;
  dailyRewardIndex: number;
  // Watch ads
  adsWatchedToday: number;
  lastAdsDate: string;
  // Emotes
  equippedEmotes: string[];
  // Settings
  musicEnabled: boolean;
  sfxEnabled: boolean;
  vibrationEnabled: boolean;
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
}

const DEFAULT_STATS: PlayerStats = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  winsByMode: {},
  gamesByMode: {},
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
  totalXp: 0,
  ownedItems: ["back_default", "avatar_knight", "title_novice", "frame_gold"],
  achievementProgress: ACHIEVEMENTS.map((a) => ({
    id: a.id,
    progress: 0,
    unlocked: false,
    claimedReward: false,
  })),
  claimedBattlePassTiers: [1],
  battlePassSeasonNumber: 1,
  stats: DEFAULT_STATS,
  lastDailyRewardDate: "",
  dailyRewardIndex: 0,
  adsWatchedToday: 0,
  lastAdsDate: "",
  equippedEmotes: ["emote_gg", "emote_ocho", "emote_bravo", "emote_lol", "emote_no", "emote_si", "emote_jaja", "emote_bien"],
  musicEnabled: true,
  sfxEnabled: true,
  vibrationEnabled: true,
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
  }) => void;
  updateAchievementProgress: (id: AchievementId, amount: number) => void;
  claimBattlePassTier: (tier: number) => void;
  claimAchievementReward: (id: AchievementId) => void;
  claimDailyReward: () => DailyReward | null;
  canClaimDailyReward: boolean;
  todaysDailyReward: DailyReward;
  updateSettings: (settings: Partial<Pick<PlayerProfile, "musicEnabled" | "sfxEnabled" | "vibrationEnabled" | "muteEmotes" | "language" | "darkMode" | "notificationsEnabled" | "missionNotifications" | "rewardNotifications" | "eventNotifications" | "reminderNotifications" | "fastAnimations" | "confirmSpecialCards" | "showTutorials" | "graphicsQuality" | "specialEffectsEnabled" | "animationsEnabled">>) => void;
  updateEquippedEmotes: (emoteIds: string[]) => void;
  updateRanked: (delta: number) => void;
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
  addChestToInventory: (type: ChestType, source: Chest["source"]) => void;
  openChestFromInventory: (chestId: string) => ChestReward | null;
  chestInventory: Chest[];
}

const ProfileContext = createContext<ProfileContextValue | null>(null);
const STORAGE_KEY = "ocho_profile_v3";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

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

          const merged: PlayerProfile = {
            ...DEFAULT_PROFILE,
            ...saved,
            stats: { ...DEFAULT_STATS, ...saved.stats },
            rankedProfile: mergedRanked,
            achievementProgress: ACHIEVEMENTS.map((a) => {
              const existing = saved.achievementProgress?.find((p) => p.id === a.id);
              return existing ?? { id: a.id, progress: 0, unlocked: false, claimedReward: false };
            }),
            ownedItems: saved.ownedItems ?? DEFAULT_PROFILE.ownedItems,
            claimedBattlePassTiers: (() => {
              const savedSeason = saved.battlePassSeasonNumber ?? 1;
              const currentSeason = getCurrentSeason().number;
              if (savedSeason !== currentSeason) return [1];
              return saved.claimedBattlePassTiers ?? [1];
            })(),
            battlePassSeasonNumber: getCurrentSeason().number,
            lastDailyRewardDate: saved.lastDailyRewardDate ?? "",
            dailyRewardIndex: saved.dailyRewardIndex ?? 0,
            musicEnabled: saved.musicEnabled ?? true,
            sfxEnabled: saved.sfxEnabled ?? true,
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
    update((p) => {
      const nextRanked = addStars(p.rankedProfile, delta);
      const itemsToAdd: string[] = [];
      let bonusCoins = 0;

      // Detect rank up
      if (nextRanked.rank > p.rankedProfile.rank) {
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

  const addXp = useCallback((amount: number) => {
    update((p) => ({ ...p, totalXp: p.totalXp + amount }));
  }, [update]);

  const buyItem = useCallback((item: StoreItem): boolean => {
    let success = false;
    update((p) => {
      if (p.ownedItems.includes(item.id)) return p;
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

  const claimAchievementReward = useCallback((id: AchievementId) => {
    update((p) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      const ach = p.achievementProgress.find((a) => a.id === id);
      if (!achievement || !ach || !ach.unlocked || ach.claimedReward) return p;
      const newProgress = p.achievementProgress.map((ap) =>
        ap.id === id ? { ...ap, claimedReward: true } : ap
      );
      let next = {
        ...p,
        coins: p.coins + achievement.coinsReward,
        totalXp: p.totalXp + achievement.xpReward,
        achievementProgress: newProgress,
      };
      const rarityToChest: Record<string, ChestType | undefined> = {
        rare: "common",
        epic: "rare",
        legendary: "epic",
      };
      const chestType = rarityToChest[achievement.rarity];
      if (chestType) {
        const inventory = next.chestInventory ?? [];
        if (inventory.length < 10) {
          next = { ...next, chestInventory: [...inventory, createChest(chestType, "achievement")] };
        }
      }
      return next;
    });
  }, [update]);

  const claimBattlePassTier = useCallback((tier: number) => {
    update((p) => {
      if (p.claimedBattlePassTiers.includes(tier)) return p;
      const seasonTiers = getBattlePassTiers(getCurrentSeason().number);
      const bpTier = seasonTiers.find((t) => t.tier === tier);
      if (!bpTier) return p;
      // FREE-track reward: varies by tier (coins, or chest at milestones)
      const free = getFreeReward(tier);
      let next = {
        ...p,
        claimedBattlePassTiers: [...p.claimedBattlePassTiers, tier],
        coins: p.coins + free.coins,
      };
      if (free.type === "chest" && free.chestType) {
        const inv = next.chestInventory ?? [];
        if (inv.length < 10) {
          next = { ...next, chestInventory: [...inv, createChest(free.chestType, "mission")] };
        }
      }
      // Premium-track reward
      if (bpTier.rewardType === "coins" && typeof bpTier.rewardValue === "number") {
        next = { ...next, coins: next.coins + bpTier.rewardValue };
      }
      if (["item", "avatar", "title"].includes(bpTier.rewardType)) {
        const itemId = bpTier.rewardValue as string;
        if (!next.ownedItems.includes(itemId)) {
          next = { ...next, ownedItems: [...next.ownedItems, itemId] };
        }
      }
      if (bpTier.rewardType === "chest") {
        const chestT = bpTier.rewardValue as ChestType;
        const inv = next.chestInventory ?? [];
        if (inv.length < 10) {
          next = { ...next, chestInventory: [...inv, createChest(chestT, "mission")] };
        }
      }
      return next;
    });
  }, [update]);

  const claimDailyReward = useCallback((): DailyReward | null => {
    const today = new Date().toDateString();
    if (profile.lastDailyRewardDate === today) return null;
    const reward = DAILY_REWARDS[profile.dailyRewardIndex % DAILY_REWARDS.length];
    update((p) => {
      const newInventory = [...(p.chestInventory ?? [])];
      if (reward.chestType) {
        const newChest = createChest(reward.chestType, "daily");
        newInventory.push(newChest);
      }
      return {
        ...p,
        coins: p.coins + reward.coins,
        totalXp: p.totalXp + reward.xp,
        lastDailyRewardDate: today,
        dailyRewardIndex: (p.dailyRewardIndex + 1) % DAILY_REWARDS.length,
        chestInventory: newInventory,
      };
    });
    return reward;
  }, [profile.lastDailyRewardDate, profile.dailyRewardIndex, update]);

  const updateSettings = useCallback((settings: Partial<Pick<PlayerProfile, "musicEnabled" | "sfxEnabled" | "vibrationEnabled" | "muteEmotes" | "language" | "darkMode" | "notificationsEnabled" | "missionNotifications" | "rewardNotifications" | "eventNotifications" | "reminderNotifications" | "fastAnimations" | "confirmSpecialCards" | "showTutorials" | "graphicsQuality" | "specialEffectsEnabled" | "animationsEnabled">>) => {
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

  const addChestToInventory = useCallback((type: ChestType, source: Chest["source"]) => {
    update((p) => {
      const inventory = p.chestInventory ?? [];
      if (inventory.length >= 10) return p;
      return { ...p, chestInventory: [...inventory, createChest(type, source)] };
    });
  }, [update]);

  const openChestFromInventory = useCallback((chestId: string): ChestReward | null => {
    let reward: ChestReward | null = null;
    update((p) => {
      const inventory = p.chestInventory ?? [];
      const chest = inventory.find((c) => c.id === chestId);
      if (!chest) return p;
      reward = openChestReward(chest, p.ownedItems);
      const newInventory = inventory.filter((c) => c.id !== chestId);
      const newOwnedItems = reward.item ? [...p.ownedItems, reward.item.id] : p.ownedItems;
      return {
        ...p,
        coins: p.coins + reward.coins,
        totalXp: p.totalXp + reward.xp,
        ownedItems: newOwnedItems,
        chestInventory: newInventory,
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
        addXp,
        buyItem,
        recordGameResult,
        updateAchievementProgress,
        claimBattlePassTier,
        claimAchievementReward,
        claimDailyReward,
        canClaimDailyReward,
        todaysDailyReward,
        updateSettings,
        updateEquippedEmotes,
        updateRanked,
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
        openChestFromInventory,
        chestInventory: profile.chestInventory ?? [],
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
