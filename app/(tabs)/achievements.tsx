import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from "react-native";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { ACHIEVEMENTS, AchievementId } from "@/lib/achievements";
import { BATTLE_PASS_TIERS, getXpProgress } from "@/lib/battlePass";
import { playSound } from "@/lib/sounds";
import { achTitle, achDesc } from "@/lib/achTranslations";

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
  const [activeTab, setActiveTab] = useState<Tab>("achievements");
  const [toast, setToast] = useState<string | null>(null);
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
    showToast(`+${a?.coinsReward} ${T("coins")} · +${a?.xpReward} XP`);
  };

  const handleClaimBP = async (tier: number) => {
    await playSound("achievement");
    claimBattlePassTier(tier);
    showToast(`${T("battlePass")} ${T("level")} ${tier} ✓`);
  };

  const swipeHandlers = useSwipeTabs(1);
  const xpPct = xpProgress.needed > 0 ? xpProgress.current / xpProgress.needed : 0;
  const unlockedCount = profile.achievementProgress.filter((a) => a.unlocked).length;
  const claimableCount = profile.achievementProgress.filter((a) => a.unlocked && !a.claimedReward).length;

  const isDark = profile.darkMode !== false;
  const bgColors: [string, string, string] = isDark
    ? ["#061209", "#0a1a0f", "#0d2418"]
    : ["#d8eecc", "#e8f5e2", "#d0e6c6"];
  const themeGold = isDark ? Colors.gold : "#A07800";

  const rarityLabel: Record<string, string> = {
    legendary: lang === "en" ? "Legendary" : lang === "pt" ? "Lendário" : "Legendario",
    epic:      lang === "en" ? "Epic"      : lang === "pt" ? "Épico"    : "Épico",
    rare:      lang === "en" ? "Rare"      : lang === "pt" ? "Raro"     : "Raro",
    common:    lang === "en" ? "Common"    : lang === "pt" ? "Comum"    : "Común",
  };

  const xpRequiredLabel = lang === "en" ? "XP required" : lang === "pt" ? "XP necessários" : "XP requeridos";
  const levelLabel = lang === "en" ? "Level" : lang === "pt" ? "Nível" : "Nivel";
  const claimLabel = T("claim");

  return (
    <View style={[styles.container, { paddingTop: topPad }]} {...swipeHandlers}>
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
          onPress={() => setActiveTab("achievements")}
          style={[
            styles.tabBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
            activeTab === "achievements" && { borderColor: themeGold, backgroundColor: themeGold + "22" },
          ]}
        >
          <Ionicons name="medal" size={16} color={activeTab === "achievements" ? themeGold : theme.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === "achievements" ? themeGold : theme.textMuted }]}>
            {T("achievements")} {claimableCount > 0 && `(${claimableCount})`}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("battlepass")}
          style={[
            styles.tabBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
            activeTab === "battlepass" && { borderColor: themeGold, backgroundColor: themeGold + "22" },
          ]}
        >
          <Ionicons name="star" size={16} color={activeTab === "battlepass" ? themeGold : theme.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === "battlepass" ? themeGold : theme.textMuted }]}>
            {T("battlePass")}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {activeTab === "achievements" ? (
          <>
            {["legendary", "epic", "rare", "common"].map((rarity) => {
              const rarityAchs = ACHIEVEMENTS.filter((a) => a.rarity === rarity);
              return (
                <View key={rarity}>
                  <Text style={[styles.rarityHeader, { color: RARITY_COLORS_MAP[rarity] }]}>
                    {rarityLabel[rarity]}
                  </Text>
                  {rarityAchs.map((ach) => {
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
                            backgroundColor: unlocked ? theme.card : theme.surface,
                            borderColor: unlocked ? rarityColor + "55" : theme.border,
                          },
                        ]}
                      >
                        <View style={[styles.achIconWrap, { backgroundColor: unlocked ? ach.iconColor + "33" : theme.card }]}>
                          <Ionicons name={ach.icon as any} size={22} color={unlocked ? ach.iconColor : theme.textDim} />
                        </View>
                        <View style={styles.achContent}>
                          <View style={styles.achTitleRow}>
                            <Text style={[styles.achTitle, { color: unlocked ? theme.text : theme.textMuted }]}>{title}</Text>
                            {unlocked && !claimed && <View style={styles.claimDot} />}
                          </View>
                          <Text style={[styles.achDesc, { color: theme.textMuted }]}>{desc}</Text>
                          {!unlocked && (
                            <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                              <View style={[styles.progressBarFill, { width: `${pct * 100}%`, backgroundColor: rarityColor }]} />
                            </View>
                          )}
                          <View style={styles.achRewardRow}>
                            <Ionicons name="cash" size={11} color={themeGold} />
                            <Text style={[styles.achRewardText, { color: theme.textMuted }]}>{ach.coinsReward}</Text>
                            <Text style={[styles.achSep, { color: theme.textDim }]}>·</Text>
                            <Text style={[styles.achRewardText, { color: theme.textMuted }]}>{ach.xpReward} XP</Text>
                            {!unlocked && (
                              <Text style={[styles.progText, { color: theme.textDim }]}>{prog?.progress ?? 0}/{ach.target}</Text>
                            )}
                          </View>
                        </View>
                        {unlocked && !claimed && (
                          <Pressable
                            onPress={() => handleClaimAchievement(ach.id)}
                            style={({ pressed }) => [styles.claimBtn, { backgroundColor: themeGold }, pressed && { opacity: 0.85 }]}
                          >
                            <Text style={styles.claimText}>{claimLabel}</Text>
                          </Pressable>
                        )}
                        {claimed && (
                          <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </>
        ) : (
          <>
            <View style={styles.bpHeader}>
              <View style={[styles.bpLevelBig, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.bpLevelNum, { color: themeGold }]}>{levelLabel} {xpProgress.level}</Text>
                <View style={[styles.bpXpBar, { backgroundColor: theme.border }]}>
                  <View style={[styles.bpXpFill, { width: `${xpPct * 100}%`, backgroundColor: themeGold }]} />
                </View>
                <Text style={[styles.bpXpText, { color: theme.textMuted }]}>{xpProgress.current} / {xpProgress.needed} XP</Text>
              </View>
            </View>

            {BATTLE_PASS_TIERS.map((tier) => {
              const reached = profile.totalXp >= tier.xpRequired;
              const claimed = profile.claimedBattlePassTiers.includes(tier.tier);
              const canClaim = reached && !claimed;
              return (
                <View
                  key={tier.tier}
                  style={[
                    styles.bpTier,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    reached && !claimed && { borderColor: themeGold + "66", backgroundColor: themeGold + "0a" },
                    claimed && styles.bpTierClaimed,
                  ]}
                >
                  <View style={[styles.bpTierNum, { backgroundColor: reached ? themeGold + "33" : theme.card }]}>
                    <Text style={[styles.bpTierNumText, { color: reached ? themeGold : theme.textDim }]}>{tier.tier}</Text>
                  </View>
                  <View style={[styles.bpIconWrap, { backgroundColor: tier.iconColor + "22" }]}>
                    <Ionicons name={tier.icon as any} size={20} color={reached ? tier.iconColor : theme.textDim} />
                  </View>
                  <View style={styles.bpTierContent}>
                    <Text style={[styles.bpTierLabel, { color: reached ? theme.text : theme.textDim }]}>{tier.rewardLabel}</Text>
                    <Text style={[styles.bpTierXp, { color: theme.textDim }]}>{tier.xpRequired} {xpRequiredLabel}</Text>
                  </View>
                  {canClaim && (
                    <Pressable
                      onPress={() => handleClaimBP(tier.tier)}
                      style={({ pressed }) => [styles.bpClaimBtn, { backgroundColor: themeGold }, pressed && { opacity: 0.85 }]}
                    >
                      <Text style={styles.bpClaimText}>{claimLabel}</Text>
                    </Pressable>
                  )}
                  {claimed && <Ionicons name="checkmark-circle" size={22} color={Colors.success} />}
                  {!reached && !claimed && <Ionicons name="lock-closed" size={18} color={theme.textDim} />}
                </View>
              );
            })}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {toast && (
        <View style={[styles.toast, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="star" size={14} color={themeGold} />
          <Text style={[styles.toastText, { color: theme.text }]}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 12,
  },
  screenTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 22, letterSpacing: 4 },
  counterBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1,
  },
  counterText: { fontFamily: "Nunito_900ExtraBold", fontSize: 13 },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 14 },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10, borderRadius: 12,
    borderWidth: 1,
  },
  tabLabel: { fontFamily: "Nunito_700Bold", fontSize: 12 },
  scroll: { paddingHorizontal: 16 },
  rarityHeader: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 11, letterSpacing: 2,
    textTransform: "uppercase", marginTop: 16, marginBottom: 8,
  },
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
  claimText: { fontFamily: "Nunito_900ExtraBold", fontSize: 11, color: "#1a0a00" },
  bpHeader: { marginBottom: 16 },
  bpLevelBig: { borderRadius: 14, padding: 14, gap: 6, borderWidth: 1 },
  bpLevelNum: { fontFamily: "Nunito_900ExtraBold", fontSize: 16 },
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
  bpTierNumText: { fontFamily: "Nunito_900ExtraBold", fontSize: 13 },
  bpIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  bpTierContent: { flex: 1 },
  bpTierLabel: { fontFamily: "Nunito_700Bold", fontSize: 13 },
  bpTierXp: { fontFamily: "Nunito_400Regular", fontSize: 11 },
  bpClaimBtn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  bpClaimText: { fontFamily: "Nunito_900ExtraBold", fontSize: 11, color: "#1a0a00" },
  toast: {
    position: "absolute", bottom: 90, alignSelf: "center",
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  toastText: { fontFamily: "Nunito_700Bold", fontSize: 13 },
});
