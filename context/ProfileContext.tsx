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
import { BATTLE_PASS_TIERS, getCurrentBattlePassTier, getPlayerLevel, getXpProgress } from "@/lib/battlePass";
import type { GameModeId, Difficulty } from "@/lib/gameModes";

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
  lastPlayedDate: string;
  challengesCompleted: number;
  tournamentsWon: number;
  coopWins: number;
  fastestLightningWin: number;
}

export interface AchievementProgress {
  id: AchievementId;
  progress: number;
  unlocked: boolean;
  claimedReward: boolean;
}

export interface PlayerProfile {
  name: string;
  avatarId: string;
  titleId: string;
  cardBackId: string;
  selectedEffect: string;
  bio: string;
  coins: number;
  totalXp: number;
  ownedItems: string[];
  achievementProgress: AchievementProgress[];
  claimedBattlePassTiers: number[];
  stats: PlayerStats;
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
  lastPlayedDate: "",
  challengesCompleted: 0,
  tournamentsWon: 0,
  coopWins: 0,
  fastestLightningWin: 999999,
};

const DEFAULT_PROFILE: PlayerProfile = {
  name: "Jugador",
  avatarId: "avatar_knight",
  titleId: "title_novice",
  cardBackId: "back_default",
  selectedEffect: "none",
  bio: "",
  coins: 50,
  totalXp: 0,
  ownedItems: ["back_default", "avatar_knight", "title_novice"],
  achievementProgress: ACHIEVEMENTS.map((a) => ({
    id: a.id,
    progress: 0,
    unlocked: false,
    claimedReward: false,
  })),
  claimedBattlePassTiers: [1],
  stats: DEFAULT_STATS,
};

interface ProfileContextValue {
  profile: PlayerProfile;
  isLoaded: boolean;
  updateName: (name: string) => void;
  updateBio: (bio: string) => void;
  updateAvatar: (avatarId: string) => void;
  updateTitle: (titleId: string) => void;
  updateCardBack: (cardBackId: string) => void;
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
  level: number;
  xpProgress: { current: number; needed: number; level: number };
  battlePassTier: number;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);
const STORAGE_KEY = "ocho_profile_v2";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as PlayerProfile;
          // Merge to handle new achievements added after initial install
          const merged: PlayerProfile = {
            ...DEFAULT_PROFILE,
            ...saved,
            stats: { ...DEFAULT_STATS, ...saved.stats },
            achievementProgress: ACHIEVEMENTS.map((a) => {
              const existing = saved.achievementProgress?.find((p) => p.id === a.id);
              return existing ?? { id: a.id, progress: 0, unlocked: false, claimedReward: false };
            }),
            ownedItems: saved.ownedItems ?? DEFAULT_PROFILE.ownedItems,
            claimedBattlePassTiers: saved.claimedBattlePassTiers ?? [1],
          };
          setProfile(merged);
        }
      } catch {}
      setIsLoaded(true);
    })();
  }, []);

  const save = useCallback((p: PlayerProfile) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p)).catch(() => {});
  }, []);

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
      return {
        ...p,
        coins: p.coins + achievement.coinsReward,
        totalXp: p.totalXp + achievement.xpReward,
        achievementProgress: newProgress,
      };
    });
  }, [update]);

  const claimBattlePassTier = useCallback((tier: number) => {
    update((p) => {
      if (p.claimedBattlePassTiers.includes(tier)) return p;
      const bpTier = BATTLE_PASS_TIERS.find((t) => t.tier === tier);
      if (!bpTier) return p;
      let next = {
        ...p,
        claimedBattlePassTiers: [...p.claimedBattlePassTiers, tier],
      };
      if (bpTier.rewardType === "coins" && typeof bpTier.rewardValue === "number") {
        next = { ...next, coins: next.coins + bpTier.rewardValue };
      }
      if (bpTier.rewardType === "item" || bpTier.rewardType === "avatar") {
        const itemId = bpTier.rewardValue as string;
        if (!next.ownedItems.includes(itemId)) {
          next = { ...next, ownedItems: [...next.ownedItems, itemId] };
        }
      }
      if (bpTier.rewardType === "title") {
        const itemId = bpTier.rewardValue as string;
        if (!next.ownedItems.includes(itemId)) {
          next = { ...next, ownedItems: [...next.ownedItems, itemId] };
        }
      }
      return next;
    });
  }, [update]);

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
  }) => {
    update((p) => {
      const today = new Date().toDateString();
      const isNewDay = p.stats.lastPlayedDate !== today;
      const streak = isNewDay ? (p.stats.lastPlayedDate === new Date(Date.now() - 86400000).toDateString() ? p.stats.dailyStreak + 1 : 1) : p.stats.dailyStreak;

      const newStats: PlayerStats = {
        ...p.stats,
        totalGames: p.stats.totalGames + 1,
        totalWins: params.won ? p.stats.totalWins + 1 : p.stats.totalWins,
        totalLosses: params.won ? p.stats.totalLosses : p.stats.totalLosses + 1,
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
        challengesCompleted: params.mode === "challenge" && params.won ? p.stats.challengesCompleted + 1 : p.stats.challengesCompleted,
        tournamentsWon: params.mode === "tournament" && params.won ? p.stats.tournamentsWon + 1 : p.stats.tournamentsWon,
        coopWins: params.mode === "coop" && params.won ? p.stats.coopWins + 1 : p.stats.coopWins,
        fastestLightningWin: (params.mode === "lightning" && params.won && params.gameDurationMs)
          ? Math.min(p.stats.fastestLightningWin, params.gameDurationMs)
          : p.stats.fastestLightningWin,
      };

      return {
        ...p,
        coins: p.coins + params.coinsEarned,
        totalXp: p.totalXp + params.xpEarned,
        stats: newStats,
      };
    });
  }, [update]);

  const level = useMemo(() => getPlayerLevel(profile.totalXp), [profile.totalXp]);
  const xpProgress = useMemo(() => getXpProgress(profile.totalXp), [profile.totalXp]);
  const battlePassTier = useMemo(() => getCurrentBattlePassTier(profile.totalXp), [profile.totalXp]);

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
        addCoins,
        spendCoins,
        addXp,
        buyItem,
        recordGameResult,
        updateAchievementProgress,
        claimBattlePassTier,
        claimAchievementReward,
        level,
        xpProgress,
        battlePassTier,
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
