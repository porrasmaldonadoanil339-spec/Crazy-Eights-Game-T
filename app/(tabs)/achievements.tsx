import { CoinIcon } from "@/components/CoinIcon";
import { ChipIcon } from "@/components/ChipIcon";
import ChestVisual from "@/components/ChestVisual";
import type { ChestType } from "@/lib/chestSystem";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, Platform, FlatList, Alert,
} from "react-native";
import Animated, {
  FadeIn, FadeOut,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from "react-native-reanimated";
import {
  MAX_PLAYER_PATH_LEVEL,
  getPlayerPathProgress,
  getPlayerPathLevelData,
} from "@/lib/playerPath";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, LightColors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { ACHIEVEMENTS, AchievementId } from "@/lib/achievements";
import { getBattlePassTiers, getXpProgress, getBPRewardLabel, getFreeReward, getFreeRewardLabel, getSeasonTheme, getSeasonThemeName, getExclusiveLabel, SeasonExclusive } from "@/lib/battlePass";
import { getCurrentSeason } from "@/lib/seasons";
import { playSound } from "@/lib/sounds";
import { playRewardClaim, playChestOpen } from "@/lib/audioManager";
import { achTitle, achDesc } from "@/lib/achTranslations";
import type { Lang } from "@/lib/i18n";
import RewardPopup from "@/components/RewardPopup";
import BouncePressable from "@/components/BouncePressable";
import { StarRating } from "@/components/Star";

const RARITY_COLORS_MAP: Record<string, string> = {
  common: "#95A5A6",
  rare: "#2196F3",
  epic: "#9B59B6",
  legendary: "#D4AF37",
};

// Premium medal gradients per rarity (light -> deep) for the achievement badge.
const RARITY_GRADIENTS: Record<string, readonly [string, string]> = {
  common: ["#B8C2C6", "#7F8C8D"],
  rare: ["#5CB3F5", "#1565C0"],
  epic: ["#C586D9", "#7B1FA2"],
  legendary: ["#F5D473", "#C9961E"],
};

// Rarity expressed as filled stars (1-4) for the badge rating row.
const RARITY_STARS: Record<string, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

type Tab = "playerpath" | "battlepass" | "achievements";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const tabSpacing = useTabBarSpacing();
  const { profile, claimAchievementReward, claimBattlePassTier, claimPlayerPathLevel, xpProgress, battlePassTier, isPremiumBattlePassActive, unlockPremiumBattlePass, premiumBattlePassCost } = useProfile();
  const [activeTab, setActiveTab] = useState<Tab>("playerpath");
  const [toast, setToast] = useState<string | null>(null);
  const [rewardPopup, setRewardPopup] = useState<{
    visible: boolean;
    title?: string;
    subtitle?: string;
    coins?: number;
    xp?: number;
    itemName?: string;
    itemIcon?: string;
    accent?: string;
    chestType?: ChestType;
  }>({ visible: false });
  const T = useT();
  const theme = useTheme();
  const lang = (profile.language ?? "es") as Lang;
  const fullLang = lang;

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleClaimAchievement = async (id: AchievementId) => {
    await playSound("achievement");
    const result = claimAchievementReward(id);
    if (result === "inventory_full") {
      showToast(T("dailyChestInventoryFull"));
      return;
    }
    if (result === "queued") {
      showToast(T("chestQueuedAchievementToast" as any));
    }
    if (result !== "ok" && result !== "queued") return;
    const a = ACHIEVEMENTS.find((ac) => ac.id === id);
    if (a) {
      setRewardPopup({
        visible: true,
        title: "¡RECOMPENSA OBTENIDA!",
        subtitle: achTitle(a.id, lang),
        coins: a.coinsReward,
        xp: a.xpReward,
        itemIcon: a.icon,
        accent: RARITY_COLORS_MAP[a.rarity] || Colors.gold,
      });
    }
  };

  const currentSeason = getCurrentSeason(fullLang);
  const seasonNumber = currentSeason.number;
  const seasonTiers = useMemo(() => getBattlePassTiers(seasonNumber), [seasonNumber]);

  const handleUnlockPremiumBP = () => {
    Alert.alert(
      T("bpBuyPremiumConfirm" as any) || "¿Deseas comprar el Pase Premium?",
      `${premiumBattlePassCost} ${T("fichas" as any) || "fichas"}`,
      [
        { text: T("cancel" as any) || "Cancelar", style: "cancel" },
        {
          text: T("confirm" as any) || "Confirmar",
          onPress: async () => {
            if ((profile.fichas ?? 0) < premiumBattlePassCost) {
              await playSound("error");
              showToast("Fichas insuficientes");
              return;
            }
            const res = unlockPremiumBattlePass();
            if (res.ok) {
              await playSound("purchase");
              showToast("¡Pase Premium comprado con éxito!");
              if (res.skippedChests > 0) {
                setTimeout(() => {
                  showToast(T("chestSkippedPremiumBPToast" as any).replace("{n}", String(res.skippedChests)));
                }, 1800);
              } else if (res.queuedChests > 0) {
                setTimeout(() => {
                  showToast(T("chestQueuedPremiumBPToast" as any));
                }, 1800);
              }
            } else {
              await playSound("error");
            }
          },
        },
      ],
    );
  };

  const handleClaimBP = async (tier: number, track: "free" | "premium" = "free") => {
    await playSound("battle_pass_unlock");
    const result = claimBattlePassTier(tier, track);
    if (result === "inventory_full") {
      showToast(T("dailyChestInventoryFull"));
      return;
    }
    if (result === "queued") {
      showToast(T("chestQueuedMissionToast" as any));
    }
    if (result !== "ok" && result !== "queued") return;
    const bp = seasonTiers.find((t) => t.tier === tier);
    const free = getFreeReward(tier);
    const isCoins = bp?.rewardType === "coins" && typeof bp.rewardValue === "number";
    if (track === "free") {
      setRewardPopup({
        visible: true,
        title: "¡RECOMPENSA OBTENIDA!",
        subtitle: `${tier}/${seasonTiers.length}`,
        coins: free.coins,
        itemName: undefined,
        itemIcon: free.icon === "cash" ? "cash" : undefined,
        chestType: free.type === "chest" ? (free.chestType as ChestType) : undefined,
        accent: Colors.gold,
      });
    } else {
      setRewardPopup({
        visible: true,
        title: "¡RECOMPENSA OBTENIDA!",
        subtitle: `${tier}/${seasonTiers.length}`,
        coins: isCoins ? (bp!.rewardValue as number) : 0,
        itemName: bp ? getBPRewardLabel(bp, lang) : undefined,
        itemIcon: bp?.rewardType === "coins" ? "cash" : bp?.rewardType === "chest" ? undefined : "trophy",
        chestType: bp?.rewardType === "chest" ? (String(bp.rewardValue) as ChestType) : undefined,
        accent: Colors.gold,
      });
    }
  };

  const xpPct = xpProgress.needed > 0 ? xpProgress.current / xpProgress.needed : 0;
  const unlockedCount = profile.achievementProgress.filter((a) => a.unlocked).length;
  const claimableCount = profile.achievementProgress.filter((a) => a.unlocked && !a.claimedReward).length;

  const isDark = profile.darkMode !== false;
  const themeColors = isDark ? Colors : LightColors;
  const bgColors: [string, string, string] = isDark
    ? ["#061209", "#0a1a0f", "#0d2418"]
    : ["#d8eecc", "#e8f5e2", "#d0e6c6"];
  const themeGold = isDark ? Colors.gold : "#A07800";

  const xpRequiredLabel = T("xpNeeded");
  const levelLabel = T("level");
  const claimLabel = T("claim");

  // Sort: claimable first, then unlocked+claimed, then locked — within each group preserve natural ACHIEVEMENTS order.
  // Build a progress lookup map once (O(N) instead of O(N²) .find per item).
  const progressById = useMemo(() => {
    const m = new Map<string, { unlocked: boolean; claimedReward: boolean; progress: number }>();
    for (const p of profile.achievementProgress) {
      m.set(p.id, { unlocked: !!p.unlocked, claimedReward: !!p.claimedReward, progress: p.progress });
    }
    return m;
  }, [profile.achievementProgress]);

  const sortedAchievements = useMemo(() => {
    return [...ACHIEVEMENTS].sort((a, b) => {
      const pa = progressById.get(a.id);
      const pb = progressById.get(b.id);
      const scoreA = pa?.unlocked && !pa?.claimedReward ? 0 : pa?.unlocked ? 1 : 2;
      const scoreB = pb?.unlocked && !pb?.claimedReward ? 0 : pb?.unlocked ? 1 : 2;
      return scoreA - scoreB;
    });
  }, [progressById]);

  const renderAchievement = useCallback(({ item: ach }: { item: typeof ACHIEVEMENTS[number] }) => {
    const prog = progressById.get(ach.id);
    const pct = prog ? prog.progress / ach.target : 0;
    const unlocked = prog?.unlocked ?? false;
    const claimed = prog?.claimedReward ?? false;
    const rarityColor = RARITY_COLORS_MAP[ach.rarity];
    const rarityGrad = RARITY_GRADIENTS[ach.rarity] ?? RARITY_GRADIENTS.common;
    const rarityStars = RARITY_STARS[ach.rarity] ?? 1;
    const claimable = unlocked && !claimed;
    const title = achTitle(ach.id, lang) || ach.title;
    const desc = achDesc(ach.id, lang) || ach.description;
    return (
      <View
        style={[
          styles.achCard,
          {
            backgroundColor: unlocked ? themeColors.card : themeColors.surface,
            borderColor: unlocked ? rarityColor + "66" : themeColors.border,
          },
          claimable && {
            borderColor: themeGold,
            shadowColor: themeGold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.55,
            shadowRadius: 12,
            elevation: 8,
          },
        ]}
      >
        {/* Rarity accent rail */}
        <View style={[styles.achRail, { backgroundColor: unlocked ? rarityColor : themeColors.border }]} />

        {/* Medal badge */}
        <View style={styles.achMedalWrap}>
          {unlocked ? (
            <LinearGradient
              colors={rarityGrad}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={[styles.achMedal, { borderColor: rarityColor + "AA" }]}
            >
              {ach.icon === "cash" ? (
                <CoinIcon size={24} color="#1a0a00" />
              ) : (
                <Ionicons name={ach.icon as any} size={24} color="#1a0a00" />
              )}
            </LinearGradient>
          ) : (
            <View style={[styles.achMedal, styles.achMedalLocked, { borderColor: themeColors.border }]}>
              {ach.icon === "cash" ? (
                <CoinIcon size={22} color={themeColors.textDim} />
              ) : (
                <Ionicons name={ach.icon as any} size={22} color={themeColors.textDim} />
              )}
            </View>
          )}
        </View>

        <View style={styles.achContent}>
          <View style={styles.achTitleRow}>
            <Text
              style={[styles.achTitle, { color: unlocked ? themeColors.text : themeColors.textMuted }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <StarRating
              count={unlocked ? rarityStars : 0}
              total={rarityStars}
              size={10}
              color={rarityColor}
              dimColor={themeColors.textDim}
            />
          </View>
          <Text style={[styles.achDesc, { color: themeColors.textMuted }]} numberOfLines={2}>{desc}</Text>
          {!unlocked && (
            <>
              <View style={[styles.progressBarBg, { backgroundColor: themeColors.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, pct * 100)}%`, backgroundColor: rarityColor },
                  ]}
                />
              </View>
              <Text style={[styles.progText, { color: themeColors.textDim }]}>{prog?.progress ?? 0}/{ach.target}</Text>
            </>
          )}
          <View style={[styles.achRewardBand, { backgroundColor: themeGold + "1A", borderColor: themeGold + "44" }]}>
            <CoinIcon size={12} color={themeGold} />
            <Text style={[styles.achRewardVal, { color: themeGold }]}>{ach.coinsReward}</Text>
            <View style={[styles.achRewardDivider, { backgroundColor: themeGold + "44" }]} />
            <Ionicons name="flash" size={11} color={themeColors.blue} />
            <Text style={[styles.achRewardVal, { color: themeColors.blue }]}>{ach.xpReward} XP</Text>
          </View>
        </View>

        {claimable && (
          <BouncePressable
            onPress={() => handleClaimAchievement(ach.id)}
            style={styles.claimBtn}
            gradient={[themeColors.goldLight, themeGold]}
            sound
          >
            <Text style={styles.claimText}>{claimLabel}</Text>
          </BouncePressable>
        )}
        {claimed && (
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
        )}
      </View>
    );
  }, [progressById, themeColors, themeGold, lang, claimLabel]);

  const achKeyExtractor = useCallback((item: typeof ACHIEVEMENTS[number]) => item.id, []);

  const bpKeyExtractor = useCallback((tier: typeof seasonTiers[number]) => String(tier.tier), []);
  const renderBpTier = useCallback(({ item: tier }: { item: typeof seasonTiers[number] }) => {
    // Task #123 — compare against per-season XP (totalXp minus the snapshot
    // taken at season start) so the reset visibly clears unlocked tiers.
    const seasonXp = Math.max(0, (profile.totalXp ?? 0) - (profile.battlePassSeasonXpBase ?? 0));
    const reached = seasonXp >= tier.xpRequired;
    const claimedFree = profile.claimedBattlePassTiers.includes(tier.tier);
    const claimedPremium = (profile.claimedBattlePassPremiumTiers ?? []).includes(tier.tier);
    const canClaimFree = reached && !claimedFree;
    const canClaimPremium = reached && !claimedPremium;
    const freeReward = getFreeReward(tier.tier);
    const isPremiumTrack = ["item","avatar","frame","effect","chest","title"].includes(tier.rewardType) || (tier.rewardType === "coins" && Number(tier.rewardValue) >= 200);
    const premiumLabel = getBPRewardLabel(tier, lang);
    const claimableActive = canClaimFree || (canClaimPremium && isPremiumBattlePassActive);
    return (
      <BpTierGlow color={themeGold} active={claimableActive}>
      <View
        style={[
          styles.bpBlock,
          { backgroundColor: themeColors.surface, borderColor: themeColors.border, paddingVertical: 10 },
          reached && !claimedFree && { borderColor: themeGold + "88" },
          claimedFree && claimedPremium && styles.bpTierClaimed,
          claimedFree && !canClaimPremium && !isPremiumBattlePassActive && styles.bpTierClaimed,
        ]}
      >
        <View style={styles.bpVerticalRow}>
          <View style={styles.bpVCol}>
            <View style={[styles.bpIconWrap, { backgroundColor: freeReward.iconColor + "22", width: 44, height: 44, borderRadius: 22 }]}>
              {freeReward.type === "chest" && freeReward.chestType ? (
                <ChestVisual type={freeReward.chestType as ChestType} size={36} showShadow={false} />
              ) : freeReward.icon === "cash" ? (
                <CoinIcon size={22} color={reached ? freeReward.iconColor : themeColors.textDim} />
              ) : (
                <Ionicons name={freeReward.icon as any} size={22} color={reached ? freeReward.iconColor : themeColors.textDim} />
              )}
            </View>
            <Text style={[styles.bpVColLabel, { color: reached ? themeColors.text : themeColors.textDim }]} numberOfLines={2}>{getFreeRewardLabel(freeReward, lang)}</Text>
            {canClaimFree ? (
              <BouncePressable
                onPress={() => handleClaimBP(tier.tier, "free")}
                style={[styles.bpClaimBtn, { backgroundColor: themeGold, marginTop: 4 }]}
              >
                <Text style={styles.bpClaimText}>{claimLabel}</Text>
              </BouncePressable>
            ) : claimedFree ? (
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            ) : null}
          </View>
          <View style={styles.bpVDividerCol}>
            <View style={[styles.bpVDivider, { backgroundColor: themeColors.border }]} />
            <View style={[styles.bpTierNum, { backgroundColor: reached ? themeGold + "33" : themeColors.card, borderWidth: 2, borderColor: reached ? themeGold : themeColors.border }]}>
              <Text style={[styles.bpTierNumText, { color: reached ? themeGold : themeColors.textDim }]}>{tier.tier}</Text>
            </View>
            <View style={[styles.bpVDivider, { backgroundColor: themeColors.border }]} />
          </View>
          <View style={styles.bpVCol}>
            <View style={[styles.bpIconWrap, { backgroundColor: tier.iconColor + "22", width: 44, height: 44, borderRadius: 22, opacity: isPremiumTrack ? 1 : 0.4 }]}>
              {tier.rewardType === "chest" ? (
                <ChestVisual type={String(tier.rewardValue) as ChestType} size={36} showShadow={false} />
              ) : tier.icon === "cash" ? (
                <CoinIcon size={22} color={reached ? tier.iconColor : themeColors.textDim} />
              ) : (
                <Ionicons name={tier.icon as any} size={22} color={reached ? tier.iconColor : themeColors.textDim} />
              )}
            </View>
            <Text style={[styles.bpVColLabel, { color: reached ? themeColors.text : themeColors.textDim }]} numberOfLines={2}>{premiumLabel}</Text>
            {tier.isExclusive && (
              <View style={[styles.bpExclusiveBadge, { backgroundColor: tier.iconColor + "22", borderColor: tier.iconColor + "88" }]}>
                <Ionicons name="sparkles" size={9} color={tier.iconColor} />
                <Text style={[styles.bpExclusiveText, { color: tier.iconColor }]} numberOfLines={1}>{T("limitedEdition") as string}</Text>
              </View>
            )}
            {isPremiumBattlePassActive ? (
              canClaimPremium ? (
                <BouncePressable
                  onPress={() => handleClaimBP(tier.tier, "premium")}
                  style={[styles.bpClaimBtn, { backgroundColor: themeGold, marginTop: 4 }]}
                >
                  <Text style={styles.bpClaimText}>{claimLabel}</Text>
                </BouncePressable>
              ) : claimedPremium ? (
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              ) : (
                <Ionicons name="lock-closed" size={14} color={themeColors.textDim} style={{ marginTop: 2 }} />
              )
            ) : (
              <Ionicons name="lock-closed" size={14} color={themeColors.textDim} style={{ marginTop: 4 }} />
            )}
          </View>
        </View>
        <Text style={[styles.bpTierXp, { color: themeColors.textDim, textAlign: "center", marginTop: 4 }]}>{tier.xpRequired} {xpRequiredLabel}</Text>
      </View>
      </BpTierGlow>
    );
  }, [profile.totalXp, profile.battlePassSeasonXpBase, profile.claimedBattlePassTiers, profile.claimedBattlePassPremiumTiers, themeColors, themeGold, lang, T, claimLabel, isPremiumBattlePassActive, handleClaimBP, handleUnlockPremiumBP, xpRequiredLabel]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: themeGold }]}>{(T("tabAchievements") || "CAMINO").toUpperCase()}</Text>
        <View style={[styles.counterBadge, { backgroundColor: themeGold + "22", borderColor: themeGold + "44" }]}>
          <Ionicons name="trophy" size={14} color={themeGold} />
          <Text style={[styles.counterText, { color: themeGold }]}>{unlockedCount}/{ACHIEVEMENTS.length}</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab("playerpath")}
          style={[
            styles.tabBtn,
            { backgroundColor: themeColors.surface, borderColor: themeColors.border },
            activeTab === "playerpath" && { borderColor: themeGold, backgroundColor: themeGold + "22" },
          ]}
        >
          <Ionicons name="trail-sign" size={16} color={activeTab === "playerpath" ? themeGold : themeColors.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === "playerpath" ? themeGold : themeColors.textMuted }]}>
            {T("tabAchievements")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("battlepass")}
          style={[
            styles.tabBtn,
            { backgroundColor: themeColors.surface, borderColor: themeColors.border },
            activeTab === "battlepass" && { borderColor: themeGold, backgroundColor: themeGold + "22" },
          ]}
        >
          <Ionicons name="star" size={16} color={activeTab === "battlepass" ? themeGold : themeColors.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === "battlepass" ? themeGold : themeColors.textMuted }]}>
            {T("battlePass")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("achievements")}
          style={[
            styles.tabBtn,
            { backgroundColor: themeColors.surface, borderColor: themeColors.border },
            activeTab === "achievements" && { borderColor: themeGold, backgroundColor: themeGold + "22" },
          ]}
        >
          <Ionicons name="medal" size={16} color={activeTab === "achievements" ? themeGold : themeColors.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === "achievements" ? themeGold : themeColors.textMuted }]}>
            {T("achievements")} {claimableCount > 0 && `(${claimableCount})`}
          </Text>
        </Pressable>
      </View>

      {activeTab === "playerpath" && (
        <PlayerPathView
          profile={profile}
          themeColors={themeColors}
          themeGold={themeGold}
          claimPlayerPathLevel={claimPlayerPathLevel}
          T={T}
          claimLabel={claimLabel}
          setRewardPopup={setRewardPopup}
          showToast={showToast}
        />
      )}
      {activeTab === "achievements" && (
        <FlatList
          data={sortedAchievements}
          keyExtractor={achKeyExtractor}
          renderItem={renderAchievement}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={Platform.OS !== "web"}
          ListFooterComponent={<View style={{ height: tabSpacing.contentBottomPad }} />}
        />
      )}
      {activeTab === "battlepass" && (
      <FlatList
        data={seasonTiers}
        keyExtractor={bpKeyExtractor}
        renderItem={renderBpTier}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== "web"}
        ListFooterComponent={<View style={{ height: tabSpacing.contentBottomPad }} />}
        ListHeaderComponent={
          <>
            <View style={styles.bpSeasonHeader}>
              <Ionicons name="sparkles" size={14} color={themeGold} />
              <Text style={[styles.bpSeasonText, { color: themeGold }]} numberOfLines={1}>{currentSeason.name.toUpperCase()}</Text>
              <Ionicons name="sparkles" size={14} color={themeGold} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: -6, marginBottom: 8 }}>
              <Ionicons name="time-outline" size={12} color={themeColors.textMuted} />
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 11, color: themeColors.textMuted, letterSpacing: 0.4 }}>
                {(T("endsIn" as any) || "Termina en")}: {currentSeason.daysRemaining}d
              </Text>
            </View>
            <SeasonThemeCard
              seasonNumber={seasonNumber}
              themeColors={themeColors}
              themeGold={themeGold}
              lang={fullLang}
              T={T}
            />
            <View style={styles.bpHeader}>
              <View style={[styles.bpLevelBig, {
                backgroundColor: themeColors.surface,
                borderColor: themeGold + "66",
                flexDirection: "row", alignItems: "center", gap: 14,
                shadowColor: themeGold,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.45,
                shadowRadius: 14,
                elevation: 8,
              }]}>
                <BpLevelCircle level={Math.max(1, battlePassTier)} maxLevel={seasonTiers.length} themeGold={themeGold} themeColors={themeColors} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[styles.bpLevelNum, { color: themeGold }]}>{Math.max(1, battlePassTier)}/{seasonTiers.length}</Text>
                  <View style={[styles.bpXpBar, { backgroundColor: themeColors.border, overflow: "hidden" }]}>
                    <View style={[styles.bpXpFill, { width: `${(Math.max(1, battlePassTier) / seasonTiers.length) * 100}%`, backgroundColor: themeGold, shadowColor: themeGold, shadowOpacity: 0.7, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }]} />
                  </View>
                  <Text style={[styles.bpXpText, { color: themeColors.textMuted }]}>{xpProgress.current} / {xpProgress.needed} XP</Text>
                </View>
              </View>
            </View>

            {!isPremiumBattlePassActive && (
              <BouncePressable
                onPress={handleUnlockPremiumBP}
                sound
                style={{
                  marginHorizontal: 12,
                  marginBottom: 10,
                  borderRadius: 14,
                  overflow: "hidden",
                  borderWidth: 2,
                  borderColor: "#67E8F9",
                  shadowColor: "#3B82F6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.55,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                <LinearGradient
                  colors={["#67E8F9", "#3B82F6", "#1E40AF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <ChipIcon size={20} color="#3498DB" />
                  <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: "#fff", letterSpacing: 0.8, textShadowColor: "rgba(0,0,0,0.35)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                    {(T("bpPremiumButton" as any) || "PASE PREMIUM")}
                  </Text>
                  <ChipIcon size={14} color="#3498DB" />
                </LinearGradient>
              </BouncePressable>
            )}
            {isPremiumBattlePassActive && (
              <View style={{
                marginHorizontal: 12,
                marginBottom: 10,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: themeGold + "55",
                backgroundColor: themeGold + "11",
                paddingVertical: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}>
                <Ionicons name="checkmark-circle" size={16} color={themeGold} />
                <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 12, color: themeGold, letterSpacing: 0.5 }}>
                  {T("premiumActive" as any) || "Pase Premium activo"}
                </Text>
              </View>
            )}
            <View style={styles.bpColumnsHeader}>
              <View style={[styles.bpColTag, { backgroundColor: "#2ecc7122", borderColor: "#2ecc7155" }]}>
                <Ionicons name="gift" size={11} color="#2ecc71" />
                <Text style={[styles.bpTrackTagText, { color: "#2ecc71" }]}>FREE</Text>
              </View>
              <View style={{ width: 36 }} />
              <View style={[styles.bpColTag, { backgroundColor: themeGold + "22", borderColor: themeGold + "55" }]}>
                <ChipIcon size={11} color={themeGold} />
                <Text style={[styles.bpTrackTagText, { color: themeGold }]}>PREMIUM</Text>
              </View>
            </View>

          </>
        }
      />
      )}
      {toast && (
        <View style={[styles.toast, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Ionicons name="star" size={14} color={themeGold} />
          <Text style={[styles.toastText, { color: themeColors.text }]}>{toast}</Text>
        </View>
      )}

      <RewardPopup
        visible={rewardPopup.visible}
        title={rewardPopup.title}
        subtitle={rewardPopup.subtitle}
        coins={rewardPopup.coins}
        xp={rewardPopup.xp}
        itemName={rewardPopup.itemName}
        itemIcon={rewardPopup.itemIcon}
        chestType={rewardPopup.chestType}
        accent={rewardPopup.accent}
        onClose={() => setRewardPopup({ visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 12,
  },
  screenTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 22, letterSpacing: 4 },
  counterBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1,
  },
  counterText: { fontFamily: "Nunito_800ExtraBold", fontSize: 13 },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 14 },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10, borderRadius: 12,
    borderWidth: 1,
  },
  tabLabel: { fontFamily: "Nunito_700Bold", fontSize: 12 },
  scroll: { paddingHorizontal: 16 },
  achCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, padding: 12, marginBottom: 8,
    borderWidth: 1, overflow: "hidden",
  },
  achRail: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
    borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
  },
  achMedalWrap: {
    width: 48, height: 48, alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  achMedal: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
  },
  achMedalLocked: { backgroundColor: "rgba(0,0,0,0.18)" },
  achContent: { flex: 1, gap: 4 },
  achTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  achTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 13, flexShrink: 1 },
  achDesc: { fontFamily: "Nunito_400Regular", fontSize: 11, lineHeight: 15 },
  progressBarBg: { height: 4, borderRadius: 2, marginTop: 1 },
  progressBarFill: { height: "100%", borderRadius: 2 },
  progText: { fontFamily: "Nunito_700Bold", fontSize: 10, alignSelf: "flex-end" },
  achRewardBand: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, marginTop: 2,
  },
  achRewardVal: { fontFamily: "Nunito_800ExtraBold", fontSize: 11 },
  achRewardDivider: { width: 1, height: 11, marginHorizontal: 1 },
  claimBtn: {
    borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7,
    overflow: "hidden", flexShrink: 0,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  claimText: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: "#1a0a00" },
  bpHeader: { marginBottom: 16 },
  bpLevelBig: { borderRadius: 14, padding: 14, gap: 6, borderWidth: 1 },
  bpLevelNum: { fontFamily: "Nunito_800ExtraBold", fontSize: 16 },
  bpXpBar: { height: 8, borderRadius: 4 },
  bpXpFill: { height: "100%", borderRadius: 4 },
  bpXpText: { fontFamily: "Nunito_400Regular", fontSize: 11 },
  bpTier: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, padding: 12, marginBottom: 8,
    borderWidth: 1,
  },
  bpTierClaimed: { opacity: 0.6 },
  bpTierNum: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  bpTierNumText: { fontFamily: "Nunito_800ExtraBold", fontSize: 13 },
  bpIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  bpTierContent: { flex: 1 },
  bpTierLabel: { fontFamily: "Nunito_700Bold", fontSize: 13 },
  bpTierXp: { fontFamily: "Nunito_400Regular", fontSize: 11 },
  bpClaimBtn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  bpClaimText: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: "#1a0a00" },
  // ── Vertical block layout (per CORRECCION_OCHO_LOCOS doc) ──────────────
  bpBlock: {
    borderRadius: 14, padding: 12, marginBottom: 10,
    borderWidth: 1, gap: 8,
  },
  bpBlockHeader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingBottom: 8, borderBottomWidth: 1,
  },
  bpBlockTitle: {
    fontFamily: "Nunito_800ExtraBold", fontSize: 13, letterSpacing: 1.5,
  },
  bpTrackRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 4,
  },
  bpTrackTag: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1,
    minWidth: 70,
  },
  bpTrackTagText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9, letterSpacing: 0.5 },
  bpTrackLabel: { fontFamily: "Nunito_700Bold", fontSize: 12 },
  bpTrackLabelCol: { flex: 1, gap: 3 },
  bpExclusiveBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    alignSelf: "flex-start",
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 5, borderWidth: 1,
  },
  bpExclusiveText: { fontFamily: "Nunito_800ExtraBold", fontSize: 8, letterSpacing: 0.5 },
  bpSeasonHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginBottom: 10,
  },
  bpSeasonText: { fontFamily: "Nunito_800ExtraBold", fontSize: 13, letterSpacing: 1.5 },
  bpTrackDivider: { height: 1, marginVertical: 2, opacity: 0.5 },
  bpCircleLevel: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 3,
    alignItems: "center", justifyContent: "center",
  },
  bpCircleLevelNum: { fontFamily: "Nunito_800ExtraBold", fontSize: 24, lineHeight: 26 },
  bpCircleLevelMax: { fontFamily: "Nunito_700Bold", fontSize: 11, marginTop: -2 },
  bpColumnsHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 8, paddingHorizontal: 10,
  },
  bpColTag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  bpVerticalRow: { flexDirection: "row", alignItems: "stretch", gap: 6 },
  bpVCol: { flex: 1, alignItems: "center", gap: 6, paddingHorizontal: 4 },
  bpVColLabel: { fontFamily: "Nunito_700Bold", fontSize: 11, textAlign: "center" },
  bpVDividerCol: { width: 36, alignItems: "center", justifyContent: "center", gap: 4 },
  bpVDivider: { width: 1, flex: 1, opacity: 0.6 },
  toast: {
    position: "absolute", bottom: 90, alignSelf: "center",
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  toastText: { fontFamily: "Nunito_700Bold", fontSize: 13 },
  ppHeader: { paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  ppLevelLine: { fontFamily: "Nunito_800ExtraBold", fontSize: 16 },
  ppXpBar: { height: 8, borderRadius: 4 },
  ppXpFill: { height: "100%", borderRadius: 4 },
  ppRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12,
    borderWidth: 1, marginBottom: 6, marginHorizontal: 16,
  },
  ppLevelBadge: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  ppLevelNum: { fontFamily: "Nunito_800ExtraBold", fontSize: 13 },
  ppRewardIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
  },
  ppRewardLabel: { fontFamily: "Nunito_700Bold", fontSize: 12 },
  ppXpReq: { fontFamily: "Nunito_400Regular", fontSize: 10 },
  // ── Season Theme Card ───────────────────────────────────────────────────
  stCard: { borderRadius: 14, borderWidth: 1, marginBottom: 14, overflow: "hidden" },
  stHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  stTitle: { fontFamily: "Nunito_700Bold", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" },
  stSubtitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 14 },
  stBody: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  stSectionLabel: { fontFamily: "Nunito_700Bold", fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase" },
  stExclusiveList: { gap: 8 },
  stExclusiveCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 10, borderRadius: 12, borderWidth: 1,
  },
  stExclusiveIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  stExclusiveType: { fontFamily: "Nunito_700Bold", fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase" },
  stExclusiveName: { fontFamily: "Nunito_800ExtraBold", fontSize: 13 },
  stLimitedBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    alignSelf: "flex-start",
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 5, borderWidth: 1, marginTop: 2,
  },
  stLimitedText: { fontFamily: "Nunito_800ExtraBold", fontSize: 8, letterSpacing: 0.5 },
  stNextToggle: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 10, borderWidth: 1, borderStyle: "dashed",
    marginTop: 4,
  },
  stNextToggleText: { flex: 1, fontFamily: "Nunito_700Bold", fontSize: 11 },
});

function SeasonThemeCard({
  seasonNumber, themeColors, themeGold, lang, T,
}: {
  seasonNumber: number;
  themeColors: any;
  themeGold: string;
  lang: Lang;
  T: (k: any) => string;
}) {
  // Task #114: start collapsed so the BP doesn't feel saturated; opens with a smooth fade.
  const [expanded, setExpanded] = useState(false);
  const [showNext, setShowNext] = useState(false);
  // Only the first 2 exclusives per theme are actually earnable (slotted at
  // tiers 27 & 35 — see EXCLUSIVE_SLOTS in lib/battlePass.ts). Cap the
  // gallery so the preview never over-promises rewards the player can't get.
  const EARNABLE_PER_SEASON = 2;
  const currentTheme = useMemo(() => getSeasonTheme(seasonNumber), [seasonNumber]);
  const currentExclusives = useMemo(
    () => currentTheme.exclusives.slice(0, EARNABLE_PER_SEASON),
    [currentTheme],
  );
  const nextSeasonNumber = seasonNumber + 1;
  const nextTheme = useMemo(() => getSeasonTheme(nextSeasonNumber), [nextSeasonNumber]);
  const nextExclusives = useMemo(
    () => nextTheme.exclusives.slice(0, EARNABLE_PER_SEASON),
    [nextTheme],
  );

  const currentThemeName = getSeasonThemeName(seasonNumber, lang);
  const nextThemeName = getSeasonThemeName(nextSeasonNumber, lang);

  // Exclusive item labels are localized to all 22 supported languages, with
  // English then Spanish as the fallback chain when a translation is missing.
  const exclusiveLabel = (e: SeasonExclusive) => getExclusiveLabel(e, lang);

  const typeKey = (t: SeasonExclusive["rewardType"]) =>
    t === "avatar" ? "exclusiveAvatar" :
    t === "frame"  ? "exclusiveFrame"  :
    t === "title"  ? "exclusiveTitle"  : "exclusiveBack";

  const renderExclusive = (e: SeasonExclusive, dimmed: boolean) => (
    <View
      key={e.rewardValue}
      style={[
        styles.stExclusiveCard,
        { backgroundColor: themeColors.card, borderColor: e.iconColor + (dimmed ? "55" : "AA") },
        dimmed && { opacity: 0.6 },
      ]}
    >
      <View style={[styles.stExclusiveIcon, { backgroundColor: e.iconColor + "22" }]}>
        <Ionicons name={e.icon as any} size={22} color={e.iconColor} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.stExclusiveType, { color: themeColors.textMuted }]} numberOfLines={1}>
          {T(typeKey(e.rewardType) as any)}
        </Text>
        <Text style={[styles.stExclusiveName, { color: themeColors.text }]} numberOfLines={1}>
          {exclusiveLabel(e).replace(/^[^:]+:\s*/, "")}
        </Text>
        {!dimmed && (
          <View style={[styles.stLimitedBadge, { backgroundColor: e.iconColor + "22", borderColor: e.iconColor + "88" }]}>
            <Ionicons name="sparkles" size={9} color={e.iconColor} />
            <Text style={[styles.stLimitedText, { color: e.iconColor }]} numberOfLines={1}>{T("limitedEdition")}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const comingNextLabel = T("comingNextSeason").replace("{n}", String(nextSeasonNumber));

  return (
    <View style={[styles.stCard, { backgroundColor: themeColors.surface, borderColor: themeGold + "55" }]}>
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.stHeader}>
        <Ionicons name="color-palette" size={16} color={themeGold} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.stTitle, { color: themeGold }]} numberOfLines={1}>{T("seasonTheme")}</Text>
          <Text style={[styles.stSubtitle, { color: themeColors.text }]} numberOfLines={1}>{currentThemeName}</Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={themeColors.textMuted} />
      </Pressable>

      {expanded && (
        <Animated.View
          entering={FadeIn.duration(240)}
          exiting={FadeOut.duration(160)}
          style={styles.stBody}
        >
          <Text style={[styles.stSectionLabel, { color: themeColors.textMuted }]}>
            {T("thisSeasonExclusives")}
          </Text>
          <View style={styles.stExclusiveList}>
            {currentExclusives.map((e) => renderExclusive(e, false))}
          </View>

          <Pressable
            onPress={() => setShowNext(!showNext)}
            style={[styles.stNextToggle, { borderColor: themeColors.border }]}
          >
            <Ionicons name="time-outline" size={14} color={themeColors.textMuted} />
            <Text style={[styles.stNextToggleText, { color: themeColors.textMuted }]} numberOfLines={1}>
              {comingNextLabel} · {nextThemeName}
            </Text>
            <Ionicons name={showNext ? "chevron-up" : "chevron-down"} size={14} color={themeColors.textMuted} />
          </Pressable>

          {showNext && (
            <Animated.View
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(140)}
              style={styles.stExclusiveList}
            >
              {nextExclusives.map((e) => renderExclusive(e, true))}
            </Animated.View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

// Task #114: pulsing level orb that mirrors the player level — the BP "level"
// now matches the profile level so the two stay in lockstep.
function BpLevelCircle({ level, maxLevel, themeGold, themeColors }: { level: number; maxLevel?: number; themeGold: string; themeColors: any }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.55,
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));
  return (
    <View style={{ width: 78, height: 78, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        pointerEvents="none"
        style={[{
          position: "absolute",
          width: 78, height: 78, borderRadius: 39,
          borderWidth: 2, borderColor: themeGold,
          shadowColor: themeGold,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.95,
          shadowRadius: 18,
        }, glowStyle]}
      />
      <View style={[styles.bpCircleLevel, { borderColor: themeGold, backgroundColor: themeGold + "14" }]}>
        <Text style={[styles.bpCircleLevelNum, { color: themeGold }]}>{level}</Text>
        {maxLevel ? (
          <Text style={[styles.bpCircleLevelMax, { color: themeColors.textMuted }]} numberOfLines={1}>/{maxLevel}</Text>
        ) : null}
      </View>
    </View>
  );
}

// Task #114: breathing glow wrapper for claimable tier blocks — gives the
// "ready to unlock" rows a premium pulsing aura.
function BpTierGlow({ children, color, active, claimedStyle }: { children: React.ReactNode; color: string; active: boolean; claimedStyle?: any }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        ), -1, false,
      );
    } else {
      pulse.value = 0;
    }
  }, [active]);
  const wrapStyle = useAnimatedStyle(() => ({
    shadowOpacity: active ? 0.35 + pulse.value * 0.45 : 0,
    shadowRadius: active ? 8 + pulse.value * 10 : 0,
  }));
  return (
    <Animated.View
      style={[
        {
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          elevation: active ? 6 : 0,
          borderRadius: 14,
        },
        wrapStyle,
        claimedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function PlayerPathView({
  profile, themeColors, themeGold, claimPlayerPathLevel, T, claimLabel, setRewardPopup, showToast,
}: {
  profile: any;
  themeColors: any;
  themeGold: string;
  claimPlayerPathLevel: (level: number) => "ok" | "queued" | "inventory_full" | "fail";
  T: (k: any) => string;
  claimLabel: string;
  setRewardPopup: (s: any) => void;
  showToast: (msg: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const tabSpacing = useTabBarSpacing();
  const progress = getPlayerPathProgress(profile.totalXp);
  const claimedSet = useMemo(
    () => new Set(profile.claimedPlayerPathLevels ?? []),
    [profile.claimedPlayerPathLevels]
  );
  const pct = progress.needed > 0 ? progress.current / progress.needed : 1;

  const data = useMemo(() => {
    const arr: number[] = [];
    for (let i = 1; i <= MAX_PLAYER_PATH_LEVEL; i++) arr.push(i);
    return arr;
  }, []);

  // Initial scroll near current level
  const initialIndex = Math.max(0, Math.min(MAX_PLAYER_PATH_LEVEL - 1, progress.level - 2));

  const handleClaim = (lvl: number) => {
    const result = claimPlayerPathLevel(lvl);
    if (result === "inventory_full") {
      showToast(T("dailyChestInventoryFull"));
      return;
    }
    if (result === "queued") {
      showToast(T("chestQueuedPathToast" as any));
    }
    if (result !== "ok" && result !== "queued") return;
    const data = getPlayerPathLevelData(lvl);
    const r = data.reward;
    // Reward sound: chest rewards play their per-rarity open sound,
    // coin/fichas rewards play the standard claim chime.
    if (r.type === "chest") {
      playChestOpen((r.chestType as any) || "common").catch(() => {});
    } else {
      playRewardClaim().catch(() => {});
    }
    setRewardPopup({
      visible: true,
      title: "¡RECOMPENSA OBTENIDA!",
      subtitle: `Nivel ${lvl}`,
      coins: r.type === "coins" ? r.amount : 0,
      itemName: r.type === "fichas" ? `${r.amount} Fichas` : r.type === "chest" ? `Cofre ${r.chestType}` : undefined,
      itemIcon: data.icon,
      accent: data.iconColor,
    });
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(n) => `pp-${n}`}
      initialScrollIndex={initialIndex}
      getItemLayout={(_, idx) => ({ length: 64, offset: 64 * idx, index: idx })}
      onScrollToIndexFailed={() => {}}
      windowSize={10}
      removeClippedSubviews
      ListHeaderComponent={
        <View style={styles.ppHeader}>
          <Text style={[styles.ppLevelLine, { color: themeGold }]}>
            {T("level")} {progress.level} / {MAX_PLAYER_PATH_LEVEL}
          </Text>
          <View style={[styles.ppXpBar, { backgroundColor: themeColors.border }]}>
            <View style={[styles.ppXpFill, { width: `${Math.min(100, pct * 100)}%`, backgroundColor: themeGold }]} />
          </View>
          <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 11, color: themeColors.textMuted }}>
            {progress.current} / {progress.needed} XP
          </Text>
        </View>
      }
      ListFooterComponent={<View style={{ height: tabSpacing.contentBottomPad }} />}
      renderItem={({ item: lvl }) => {
        const data = getPlayerPathLevelData(lvl);
        const reached = lvl <= progress.level;
        const claimed = claimedSet.has(lvl);
        const canClaim = reached && !claimed;
        const r = data.reward;
        const label =
          r.type === "coins" ? `${r.amount} ${T("coins")}` :
          r.type === "fichas" ? `${r.amount} Fichas` :
          r.type === "chest" ? `Cofre ${r.chestType}` :
          "Ítem";
        return (
          <View style={[
            styles.ppRow,
            { backgroundColor: themeColors.surface, borderColor: claimed ? themeColors.border : reached ? themeGold + "55" : themeColors.border },
            claimed && { opacity: 0.6 },
          ]}>
            <View style={[styles.ppLevelBadge, { backgroundColor: reached ? themeGold + "33" : themeColors.card }]}>
              <Text style={[styles.ppLevelNum, { color: reached ? themeGold : themeColors.textDim }]}>{lvl}</Text>
            </View>
            <View style={[styles.ppRewardIconWrap, { backgroundColor: data.iconColor + "22" }]}>
              {data.icon === "cash" ? (
                <CoinIcon size={18} color={reached ? data.iconColor : themeColors.textDim} />
              ) : (
                <Ionicons name={data.icon as any} size={18} color={reached ? data.iconColor : themeColors.textDim} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ppRewardLabel, { color: reached ? themeColors.text : themeColors.textDim }]} numberOfLines={1}>
                {label}
              </Text>
              <Text style={[styles.ppXpReq, { color: themeColors.textDim }]}>{data.xpRequired} XP</Text>
            </View>
            {claimed && <Ionicons name="checkmark-circle" size={20} color={Colors.success} />}
            {!reached && !claimed && <Ionicons name="lock-closed" size={14} color={themeColors.textDim} />}
            {canClaim && (
              <BouncePressable
                onPress={() => handleClaim(lvl)}
                style={[styles.bpClaimBtn, { backgroundColor: themeGold }]}
                sound
              >
                <Text style={[styles.bpClaimText]}>{claimLabel}</Text>
              </BouncePressable>
            )}
          </View>
        );
      }}
    />
  );
}
