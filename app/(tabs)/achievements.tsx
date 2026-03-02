import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from "react-native";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { ACHIEVEMENTS, RARITY_COLORS, AchievementId } from "@/lib/achievements";
import { BATTLE_PASS_TIERS, getXpProgress, getCurrentBattlePassTier } from "@/lib/battlePass";
import { playSound } from "@/lib/sounds";

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

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleClaimAchievement = async (id: AchievementId) => {
    await playSound("achievement");
    claimAchievementReward(id);
    const a = ACHIEVEMENTS.find((ac) => ac.id === id);
    showToast(`+${a?.coinsReward} monedas · +${a?.xpReward} XP`);
  };

  const handleClaimBP = async (tier: number) => {
    await playSound("achievement");
    claimBattlePassTier(tier);
    const t = BATTLE_PASS_TIERS.find((bp) => bp.tier === tier);
    showToast(`Recompensa nivel ${tier} reclamada`);
  };

  const swipeHandlers = useSwipeTabs(1);
  const xpPct = xpProgress.needed > 0 ? xpProgress.current / xpProgress.needed : 0;
  const unlockedCount = profile.achievementProgress.filter((a) => a.unlocked).length;
  const claimableCount = profile.achievementProgress.filter((a) => a.unlocked && !a.claimedReward).length;

  return (
    <View style={[styles.container, { paddingTop: topPad }]} {...swipeHandlers}>
      <LinearGradient colors={["#061209", "#0a1a0f", "#0d2418"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.screenTitle}>LOGROS</Text>
        <View style={styles.counterBadge}>
          <Ionicons name="trophy" size={14} color={Colors.gold} />
          <Text style={styles.counterText}>{unlockedCount}/{ACHIEVEMENTS.length}</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab("achievements")}
          style={[styles.tabBtn, activeTab === "achievements" && styles.tabBtnActive]}
        >
          <Ionicons name="medal" size={16} color={activeTab === "achievements" ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.tabLabel, activeTab === "achievements" && styles.tabLabelActive]}>
            Logros {claimableCount > 0 && `(${claimableCount})`}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("battlepass")}
          style={[styles.tabBtn, activeTab === "battlepass" && styles.tabBtnActive]}
        >
          <Ionicons name="star" size={16} color={activeTab === "battlepass" ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.tabLabel, activeTab === "battlepass" && styles.tabLabelActive]}>Pase de Batalla</Text>
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
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </Text>
                  {rarityAchs.map((ach) => {
                    const prog = profile.achievementProgress.find((p) => p.id === ach.id);
                    const pct = prog ? prog.progress / ach.target : 0;
                    const unlocked = prog?.unlocked ?? false;
                    const claimed = prog?.claimedReward ?? false;
                    const rarityColor = RARITY_COLORS_MAP[ach.rarity];
                    return (
                      <View key={ach.id} style={[styles.achCard, unlocked && styles.achCardUnlocked, { borderColor: unlocked ? rarityColor + "55" : Colors.border }]}>
                        <View style={[styles.achIconWrap, { backgroundColor: unlocked ? ach.iconColor + "33" : Colors.card }]}>
                          <Ionicons name={ach.icon as any} size={22} color={unlocked ? ach.iconColor : Colors.textDim} />
                        </View>
                        <View style={styles.achContent}>
                          <View style={styles.achTitleRow}>
                            <Text style={[styles.achTitle, !unlocked && { color: Colors.textMuted }]}>{ach.title}</Text>
                            {unlocked && !claimed && (
                              <View style={styles.claimDot} />
                            )}
                          </View>
                          <Text style={styles.achDesc}>{ach.description}</Text>
                          {!unlocked && (
                            <View style={styles.progressBarBg}>
                              <View style={[styles.progressBarFill, { width: `${pct * 100}%`, backgroundColor: rarityColor }]} />
                            </View>
                          )}
                          <View style={styles.achRewardRow}>
                            <Ionicons name="cash" size={11} color={Colors.gold} />
                            <Text style={styles.achRewardText}>{ach.coinsReward}</Text>
                            <Text style={styles.achSep}>·</Text>
                            <Text style={styles.achRewardText}>{ach.xpReward} XP</Text>
                            {!unlocked && (
                              <Text style={styles.progText}>{prog?.progress ?? 0}/{ach.target}</Text>
                            )}
                          </View>
                        </View>
                        {unlocked && !claimed && (
                          <Pressable
                            onPress={() => handleClaimAchievement(ach.id)}
                            style={({ pressed }) => [styles.claimBtn, pressed && { opacity: 0.85 }]}
                          >
                            <Text style={styles.claimText}>Reclamar</Text>
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
              <View style={styles.bpLevelBig}>
                <Text style={styles.bpLevelNum}>Nivel {xpProgress.level}</Text>
                <View style={styles.bpXpBar}>
                  <View style={[styles.bpXpFill, { width: `${xpPct * 100}%` }]} />
                </View>
                <Text style={styles.bpXpText}>{xpProgress.current} / {xpProgress.needed} XP</Text>
              </View>
            </View>

            {BATTLE_PASS_TIERS.map((tier) => {
              const reached = profile.totalXp >= tier.xpRequired;
              const claimed = profile.claimedBattlePassTiers.includes(tier.tier);
              const canClaim = reached && !claimed;
              return (
                <View key={tier.tier} style={[styles.bpTier, reached && !claimed && styles.bpTierReady, claimed && styles.bpTierClaimed]}>
                  <View style={[styles.bpTierNum, { backgroundColor: reached ? Colors.gold + "33" : Colors.card }]}>
                    <Text style={[styles.bpTierNumText, { color: reached ? Colors.gold : Colors.textDim }]}>{tier.tier}</Text>
                  </View>
                  <View style={[styles.bpIconWrap, { backgroundColor: tier.iconColor + "22" }]}>
                    <Ionicons name={tier.icon as any} size={20} color={reached ? tier.iconColor : Colors.textDim} />
                  </View>
                  <View style={styles.bpTierContent}>
                    <Text style={[styles.bpTierLabel, !reached && { color: Colors.textDim }]}>{tier.rewardLabel}</Text>
                    <Text style={styles.bpTierXp}>{tier.xpRequired} XP requeridos</Text>
                  </View>
                  {canClaim && (
                    <Pressable
                      onPress={() => handleClaimBP(tier.tier)}
                      style={({ pressed }) => [styles.bpClaimBtn, pressed && { opacity: 0.85 }]}
                    >
                      <Text style={styles.bpClaimText}>Reclamar</Text>
                    </Pressable>
                  )}
                  {claimed && (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                  )}
                  {!reached && !claimed && (
                    <Ionicons name="lock-closed" size={18} color={Colors.textDim} />
                  )}
                </View>
              );
            })}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {toast && (
        <View style={styles.toast}>
          <Ionicons name="star" size={14} color={Colors.gold} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 12,
  },
  screenTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 22, color: Colors.gold, letterSpacing: 4 },
  counterBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.gold + "22", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.gold + "44",
  },
  counterText: { fontFamily: "Nunito_900ExtraBold", fontSize: 13, color: Colors.gold },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 14 },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  tabBtnActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + "22" },
  tabLabel: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },
  tabLabelActive: { color: Colors.gold },
  scroll: { paddingHorizontal: 16 },
  rarityHeader: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 11, letterSpacing: 2,
    textTransform: "uppercase", marginTop: 16, marginBottom: 8,
  },
  achCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surface, borderRadius: 14, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  achCardUnlocked: { backgroundColor: Colors.card },
  achIconWrap: {
    width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  achContent: { flex: 1, gap: 3 },
  achTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  achTitle: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.text },
  claimDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gold },
  achDesc: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textMuted },
  progressBarBg: { height: 3, backgroundColor: Colors.border, borderRadius: 2 },
  progressBarFill: { height: "100%", borderRadius: 2 },
  achRewardRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  achRewardText: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textMuted },
  achSep: { color: Colors.textDim, fontSize: 11 },
  progText: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textDim, marginLeft: "auto" as any },
  claimBtn: {
    backgroundColor: Colors.gold, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  claimText: { fontFamily: "Nunito_900ExtraBold", fontSize: 11, color: "#1a0a00" },
  bpHeader: { marginBottom: 16 },
  bpLevelBig: { backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 6, borderWidth: 1, borderColor: Colors.border },
  bpLevelNum: { fontFamily: "Nunito_900ExtraBold", fontSize: 16, color: Colors.gold },
  bpXpBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4 },
  bpXpFill: { height: "100%", backgroundColor: Colors.gold, borderRadius: 4 },
  bpXpText: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textMuted },
  bpTier: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surface, borderRadius: 14, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  bpTierReady: { borderColor: Colors.gold + "66", backgroundColor: Colors.gold + "0a" },
  bpTierClaimed: { opacity: 0.6 },
  bpTierNum: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  bpTierNumText: { fontFamily: "Nunito_900ExtraBold", fontSize: 13 },
  bpIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  bpTierContent: { flex: 1 },
  bpTierLabel: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.text },
  bpTierXp: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textDim },
  bpClaimBtn: { backgroundColor: Colors.gold, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  bpClaimText: { fontFamily: "Nunito_900ExtraBold", fontSize: 11, color: "#1a0a00" },
  toast: {
    position: "absolute", bottom: 90, alignSelf: "center",
    backgroundColor: Colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  toastText: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.text },
});
