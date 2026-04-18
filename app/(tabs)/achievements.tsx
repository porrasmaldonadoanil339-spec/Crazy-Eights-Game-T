import { CoinIcon } from "@/components/CoinIcon";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from "react-native";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, LightColors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { ACHIEVEMENTS, AchievementId } from "@/lib/achievements";
import { BATTLE_PASS_TIERS, getXpProgress, getBPRewardLabel, getFreeReward } from "@/lib/battlePass";
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

type Tab = "achievements" | "battlepass";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, claimAchievementReward, claimBattlePassTier, xpProgress, battlePassTier } = useProfile();
  const [activeTab, setActiveTab] = useState<Tab>("battlepass");
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

  const handleClaimBP = async (tier: number) => {
    await playSound("achievement");
    claimBattlePassTier(tier);
    const bp = BATTLE_PASS_TIERS.find((t) => t.tier === tier);
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
            <View style={styles.bpHeader}>
              <View style={[styles.bpLevelBig, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
                <Text style={[styles.bpLevelNum, { color: themeGold }]}>{levelLabel} {xpProgress.level}</Text>
                <View style={[styles.bpXpBar, { backgroundColor: themeColors.border }]}>
                  <View style={[styles.bpXpFill, { width: `${xpPct * 100}%`, backgroundColor: themeGold }]} />
                </View>
                <Text style={[styles.bpXpText, { color: themeColors.textMuted }]}>{xpProgress.current} / {xpProgress.needed} XP</Text>
              </View>
            </View>

            {BATTLE_PASS_TIERS.map((tier) => {
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
                    { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                    reached && !claimed && { borderColor: themeGold + "88" },
                    claimed && styles.bpTierClaimed,
                  ]}
                >
                  {/* Header: NIVEL X */}
                  <View style={[styles.bpBlockHeader, { borderBottomColor: themeColors.border }]}>
                    <View style={[styles.bpTierNum, { backgroundColor: reached ? themeGold + "33" : themeColors.card }]}>
                      <Text style={[styles.bpTierNumText, { color: reached ? themeGold : themeColors.textDim }]}>{tier.tier}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.bpBlockTitle, { color: reached ? themeGold : themeColors.textDim }]}>NIVEL {tier.tier}</Text>
                      <Text style={[styles.bpTierXp, { color: themeColors.textDim }]}>{tier.xpRequired} {xpRequiredLabel}</Text>
                    </View>
                    {claimed && <Ionicons name="checkmark-circle" size={20} color={Colors.success} />}
                    {!reached && !claimed && <Ionicons name="lock-closed" size={16} color={themeColors.textDim} />}
                  </View>

                  {/* PREMIUM track */}
                  <View style={styles.bpTrackRow}>
                    <View style={[styles.bpTrackTag, { backgroundColor: themeGold + "22", borderColor: themeGold + "55" }]}>
                      <Ionicons name="diamond" size={11} color={themeGold} />
                      <Text style={[styles.bpTrackTagText, { color: themeGold }]}>PREMIUM</Text>
                    </View>
                    <View style={[styles.bpIconWrap, { backgroundColor: tier.iconColor + "22", width: 34, height: 34, borderRadius: 17 }]}>
                      {tier.icon === "cash" ? (
                        <CoinIcon size={18} color={reached ? tier.iconColor : themeColors.textDim} />
                      ) : (
                        <Ionicons name={tier.icon as any} size={18} color={reached ? tier.iconColor : themeColors.textDim} />
                      )}
                    </View>
                    <Text style={[styles.bpTrackLabel, { color: reached ? themeColors.text : themeColors.textDim }]} numberOfLines={1}>{premiumLabel}</Text>
                    {!isPremiumTrack && null}
                    <Ionicons name="lock-closed" size={14} color={themeColors.textDim} />
                  </View>

                  {/* Divider */}
                  <View style={[styles.bpTrackDivider, { backgroundColor: themeColors.border }]} />

                  {/* FREE track */}
                  <View style={styles.bpTrackRow}>
                    <View style={[styles.bpTrackTag, { backgroundColor: "#2ecc7122", borderColor: "#2ecc7155" }]}>
                      <Ionicons name="gift" size={11} color="#2ecc71" />
                      <Text style={[styles.bpTrackTagText, { color: "#2ecc71" }]}>FREE</Text>
                    </View>
                    <View style={[styles.bpIconWrap, { backgroundColor: freeReward.iconColor + "22", width: 34, height: 34, borderRadius: 17 }]}>
                      {freeReward.icon === "cash" ? (
                        <CoinIcon size={18} color={reached ? freeReward.iconColor : themeColors.textDim} />
                      ) : (
                        <Ionicons name={freeReward.icon as any} size={18} color={reached ? freeReward.iconColor : themeColors.textDim} />
                      )}
                    </View>
                    <Text style={[styles.bpTrackLabel, { color: reached ? themeColors.text : themeColors.textDim }]} numberOfLines={1}>{freeReward.label}</Text>
                    {canClaim && (
                      <BouncePressable
                        onPress={() => handleClaimBP(tier.tier)}
                        style={[styles.bpClaimBtn, { backgroundColor: themeGold }]}
                      >
                        <Text style={styles.bpClaimText}>{claimLabel}</Text>
                      </BouncePressable>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        ) : null}
        <View style={{ height: 100 }} />
      </ScrollView>

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
  bpTrackLabel: { flex: 1, fontFamily: "Nunito_700Bold", fontSize: 12 },
  bpTrackDivider: { height: 1, marginVertical: 2, opacity: 0.5 },
  toast: {
    position: "absolute", bottom: 90, alignSelf: "center",
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  toastText: { fontFamily: "Nunito_700Bold", fontSize: 13 },
});
