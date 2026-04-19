import { CoinIcon } from "@/components/CoinIcon";
import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, FlatList,
} from "react-native";
import {
  MAX_PLAYER_PATH_LEVEL,
  getPlayerPathProgress,
  getPlayerPathLevelData,
} from "@/lib/playerPath";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, LightColors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { ACHIEVEMENTS, AchievementId } from "@/lib/achievements";
import { getBattlePassTiers, getXpProgress, getBPRewardLabel, getFreeReward, getSeasonTheme, SeasonExclusive } from "@/lib/battlePass";
import { getCurrentSeason } from "@/lib/seasons";
import { playSound } from "@/lib/sounds";
import { achTitle, achDesc } from "@/lib/achTranslations";
import RewardPopup from "@/components/RewardPopup";
import BouncePressable from "@/components/BouncePressable";

const RARITY_COLORS_MAP: Record<string, string> = {
  common: "#95A5A6",
  rare: "#2196F3",
  epic: "#9B59B6",
  legendary: "#D4AF37",
};

type Tab = "playerpath" | "battlepass" | "achievements";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, claimAchievementReward, claimBattlePassTier, claimPlayerPathLevel, xpProgress, battlePassTier } = useProfile();
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
  }>({ visible: false });
  const T = useT();
  const theme = useTheme();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleClaimAchievement = async (id: AchievementId) => {
    await playSound("achievement");
    claimAchievementReward(id);
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

  const currentSeason = getCurrentSeason();
  const seasonNumber = currentSeason.number;
  const seasonTiers = useMemo(() => getBattlePassTiers(seasonNumber), [seasonNumber]);

  const handleClaimBP = async (tier: number) => {
    await playSound("achievement");
    claimBattlePassTier(tier);
    const bp = seasonTiers.find((t) => t.tier === tier);
    const free = getFreeReward(tier);
    const isCoins = bp?.rewardType === "coins" && typeof bp.rewardValue === "number";
    const totalCoins = free.coins + (isCoins ? (bp!.rewardValue as number) : 0);
    setRewardPopup({
      visible: true,
      title: "¡RECOMPENSA OBTENIDA!",
      subtitle: `${T("level")} ${tier}`,
      coins: totalCoins,
      itemName: bp ? getBPRewardLabel(bp, lang) : undefined,
      itemIcon: bp?.rewardType === "chest" ? "cube" : bp?.rewardType === "coins" ? "cash" : "trophy",
      accent: Colors.gold,
    });
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

  // Sort: claimable first, then unlocked+claimed, then locked — within each group preserve natural ACHIEVEMENTS order
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
    const pa = profile.achievementProgress.find(p => p.id === a.id);
    const pb = profile.achievementProgress.find(p => p.id === b.id);
    const scoreA = pa?.unlocked && !pa?.claimedReward ? 0 : pa?.unlocked ? 1 : 2;
    const scoreB = pb?.unlocked && !pb?.claimedReward ? 0 : pb?.unlocked ? 1 : 2;
    return scoreA - scoreB;
  });

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: themeGold }]}>{T("achievements")}</Text>
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
        />
      )}
      {activeTab !== "playerpath" && (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {activeTab === "achievements" ? (
          <>
            {sortedAchievements.map((ach) => {
              const prog = profile.achievementProgress.find((p) => p.id === ach.id);
              const pct = prog ? prog.progress / ach.target : 0;
              const unlocked = prog?.unlocked ?? false;
              const claimed = prog?.claimedReward ?? false;
              const rarityColor = RARITY_COLORS_MAP[ach.rarity];
              const title = achTitle(ach.id, lang) || ach.title;
              const desc = achDesc(ach.id, lang) || ach.description;
              return (
                <View
                  key={ach.id}
                  style={[
                    styles.achCard,
                    {
                      backgroundColor: unlocked ? themeColors.card : themeColors.surface,
                      borderColor: unlocked ? rarityColor + "55" : themeColors.border,
                    },
                  ]}
                >
                  <View style={[styles.achIconWrap, { backgroundColor: unlocked ? ach.iconColor + "33" : themeColors.card }]}>
                    {ach.icon === "cash" ? (
                      <CoinIcon size={22} color={unlocked ? ach.iconColor : themeColors.textDim} />
                    ) : (
                      <Ionicons name={ach.icon as any} size={22} color={unlocked ? ach.iconColor : themeColors.textDim} />
                    )}
                  </View>
                  <View style={styles.achContent}>
                    <View style={styles.achTitleRow}>
                      <Text style={[styles.achTitle, { color: unlocked ? themeColors.text : themeColors.textMuted }]}>{title}</Text>
                      {unlocked && !claimed && <View style={styles.claimDot} />}
                    </View>
                    <Text style={[styles.achDesc, { color: themeColors.textMuted }]}>{desc}</Text>
                    {!unlocked && (
                      <View style={[styles.progressBarBg, { backgroundColor: themeColors.border }]}>
                        <View style={[styles.progressBarFill, { width: `${pct * 100}%`, backgroundColor: rarityColor }]} />
                      </View>
                    )}
                    <View style={styles.achRewardRow}>
                      <CoinIcon size={11} color={themeGold} />
                      <Text style={[styles.achRewardText, { color: themeColors.textMuted }]}>{ach.coinsReward}</Text>
                      <Text style={[styles.achSep, { color: themeColors.textDim }]}>·</Text>
                      <Text style={[styles.achRewardText, { color: themeColors.textMuted }]}>{ach.xpReward} XP</Text>
                      {!unlocked && (
                        <Text style={[styles.progText, { color: themeColors.textDim }]}>{prog?.progress ?? 0}/{ach.target}</Text>
                      )}
                    </View>
                  </View>
                  {unlocked && !claimed && (
                    <BouncePressable
                      onPress={() => handleClaimAchievement(ach.id)}
                      style={[styles.claimBtn, { backgroundColor: themeGold }]}
                    >
                      <Text style={styles.claimText}>{claimLabel}</Text>
                    </BouncePressable>
                  )}
                  {claimed && (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                  )}
                </View>
              );
            })}
          </>
        ) : activeTab === "battlepass" ? (
          <>
            <View style={styles.bpSeasonHeader}>
              <Ionicons name="sparkles" size={14} color={themeGold} />
              <Text style={[styles.bpSeasonText, { color: themeGold }]} numberOfLines={1}>{currentSeason.name.toUpperCase()}</Text>
              <Ionicons name="sparkles" size={14} color={themeGold} />
            </View>
            <SeasonThemeCard
              seasonNumber={seasonNumber}
              themeColors={themeColors}
              themeGold={themeGold}
              lang={lang}
              T={T}
            />
            <View style={styles.bpHeader}>
              <View style={[styles.bpLevelBig, { backgroundColor: themeColors.surface, borderColor: themeColors.border, flexDirection: "row", alignItems: "center", gap: 14 }]}>
                <View style={[styles.bpCircleLevel, { borderColor: themeGold }]}>
                  <Text style={[styles.bpCircleLevelNum, { color: themeGold }]}>{battlePassTier}</Text>
                  <Text style={[styles.bpCircleLevelMax, { color: themeColors.textMuted }]}>/ {seasonTiers.length}</Text>
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[styles.bpLevelNum, { color: themeGold }]}>{levelLabel} {xpProgress.level}</Text>
                  <View style={[styles.bpXpBar, { backgroundColor: themeColors.border }]}>
                    <View style={[styles.bpXpFill, { width: `${xpPct * 100}%`, backgroundColor: themeGold }]} />
                  </View>
                  <Text style={[styles.bpXpText, { color: themeColors.textMuted }]}>{xpProgress.current} / {xpProgress.needed} XP</Text>
                </View>
              </View>
            </View>

            <View style={styles.bpColumnsHeader}>
              <View style={[styles.bpColTag, { backgroundColor: "#2ecc7122", borderColor: "#2ecc7155" }]}>
                <Ionicons name="gift" size={11} color="#2ecc71" />
                <Text style={[styles.bpTrackTagText, { color: "#2ecc71" }]}>FREE</Text>
              </View>
              <View style={{ width: 36 }} />
              <View style={[styles.bpColTag, { backgroundColor: themeGold + "22", borderColor: themeGold + "55" }]}>
                <Ionicons name="diamond" size={11} color={themeGold} />
                <Text style={[styles.bpTrackTagText, { color: themeGold }]}>PREMIUM</Text>
              </View>
            </View>

            {seasonTiers.map((tier) => {
              const reached = profile.totalXp >= tier.xpRequired;
              const claimed = profile.claimedBattlePassTiers.includes(tier.tier);
              const canClaim = reached && !claimed;
              // Free reward = varies by tier (coins, plus chests at milestones every 5/10/25/50)
              const freeReward = getFreeReward(tier.tier);
              const isPremiumTrack = ["item","avatar","frame","effect","chest","title"].includes(tier.rewardType) || (tier.rewardType === "coins" && Number(tier.rewardValue) >= 200);
              const premiumLabel = getBPRewardLabel(tier, lang);
              return (
                <View
                  key={tier.tier}
                  style={[
                    styles.bpBlock,
                    { backgroundColor: themeColors.surface, borderColor: themeColors.border, paddingVertical: 10 },
                    reached && !claimed && { borderColor: themeGold + "88" },
                    claimed && styles.bpTierClaimed,
                  ]}
                >
                  <View style={styles.bpVerticalRow}>
                    {/* FREE column */}
                    <View style={styles.bpVCol}>
                      <View style={[styles.bpIconWrap, { backgroundColor: freeReward.iconColor + "22", width: 44, height: 44, borderRadius: 22 }]}>
                        {freeReward.icon === "cash" ? (
                          <CoinIcon size={22} color={reached ? freeReward.iconColor : themeColors.textDim} />
                        ) : (
                          <Ionicons name={freeReward.icon as any} size={22} color={reached ? freeReward.iconColor : themeColors.textDim} />
                        )}
                      </View>
                      <Text style={[styles.bpVColLabel, { color: reached ? themeColors.text : themeColors.textDim }]} numberOfLines={2}>{freeReward.label}</Text>
                      {canClaim ? (
                        <BouncePressable
                          onPress={() => handleClaimBP(tier.tier)}
                          style={[styles.bpClaimBtn, { backgroundColor: themeGold, marginTop: 4 }]}
                        >
                          <Text style={styles.bpClaimText}>{claimLabel}</Text>
                        </BouncePressable>
                      ) : claimed ? (
                        <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                      ) : null}
                    </View>

                    {/* Center divider with tier number */}
                    <View style={styles.bpVDividerCol}>
                      <View style={[styles.bpVDivider, { backgroundColor: themeColors.border }]} />
                      <View style={[styles.bpTierNum, { backgroundColor: reached ? themeGold + "33" : themeColors.card, borderWidth: 2, borderColor: reached ? themeGold : themeColors.border }]}>
                        <Text style={[styles.bpTierNumText, { color: reached ? themeGold : themeColors.textDim }]}>{tier.tier}</Text>
                      </View>
                      <View style={[styles.bpVDivider, { backgroundColor: themeColors.border }]} />
                    </View>

                    {/* PREMIUM column */}
                    <View style={styles.bpVCol}>
                      <View style={[styles.bpIconWrap, { backgroundColor: tier.iconColor + "22", width: 44, height: 44, borderRadius: 22, opacity: isPremiumTrack ? 1 : 0.4 }]}>
                        {tier.icon === "cash" ? (
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
                      <Ionicons name="lock-closed" size={14} color={themeColors.textDim} style={{ marginTop: 2 }} />
                    </View>
                  </View>
                  <Text style={[styles.bpTierXp, { color: themeColors.textDim, textAlign: "center", marginTop: 4 }]}>{tier.xpRequired} {xpRequiredLabel}</Text>
                </View>
              );
            })}
          </>
        ) : null}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    borderWidth: 1,
  },
  achIconWrap: {
    width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  achContent: { flex: 1, gap: 3 },
  achTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  achTitle: { fontFamily: "Nunito_700Bold", fontSize: 13 },
  claimDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gold },
  achDesc: { fontFamily: "Nunito_400Regular", fontSize: 11 },
  progressBarBg: { height: 3, borderRadius: 2 },
  progressBarFill: { height: "100%", borderRadius: 2 },
  achRewardRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  achRewardText: { fontFamily: "Nunito_400Regular", fontSize: 11 },
  achSep: { fontSize: 11 },
  progText: { fontFamily: "Nunito_400Regular", fontSize: 10, marginLeft: "auto" as any },
  claimBtn: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
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
  lang: "es" | "en" | "pt";
  T: (k: any) => string;
}) {
  const [expanded, setExpanded] = useState(true);
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

  const exclusiveLabel = (e: SeasonExclusive) =>
    lang === "en" ? e.enLabel : lang === "pt" ? e.ptLabel : e.rewardLabel;

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
          <Text style={[styles.stSubtitle, { color: themeColors.text }]} numberOfLines={1}>{currentTheme.themeName}</Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={themeColors.textMuted} />
      </Pressable>

      {expanded && (
        <View style={styles.stBody}>
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
              {comingNextLabel} · {nextTheme.themeName}
            </Text>
            <Ionicons name={showNext ? "chevron-up" : "chevron-down"} size={14} color={themeColors.textMuted} />
          </Pressable>

          {showNext && (
            <View style={styles.stExclusiveList}>
              {nextExclusives.map((e) => renderExclusive(e, true))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function PlayerPathView({
  profile, themeColors, themeGold, claimPlayerPathLevel, T, claimLabel, setRewardPopup,
}: {
  profile: any;
  themeColors: any;
  themeGold: string;
  claimPlayerPathLevel: (level: number) => boolean;
  T: (k: any) => string;
  claimLabel: string;
  setRewardPopup: (s: any) => void;
}) {
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
    const ok = claimPlayerPathLevel(lvl);
    if (!ok) return;
    const data = getPlayerPathLevelData(lvl);
    const r = data.reward;
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
      ListFooterComponent={<View style={{ height: 100 }} />}
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
