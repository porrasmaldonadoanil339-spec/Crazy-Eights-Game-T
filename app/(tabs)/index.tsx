import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Modal, Platform, Dimensions, TextInput,
} from "react-native";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";
import { useT } from "@/hooks/useT";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/hooks/useTheme";
import { useGame } from "@/context/GameContext";
import { useProfile } from "@/context/ProfileContext";
import { GAME_MODES, DIFFICULTIES, GameModeId, Difficulty } from "@/lib/gameModes";
import { playButton, syncSettings } from "@/lib/audioManager";
import { playSound } from "@/lib/sounds";
import { modeName as getModeName, modeDesc as getModeDesc, diffName as getDiffName } from "@/lib/achTranslations";
import { AvatarDisplay } from "@/components/AvatarDisplay";

const { width: SW } = Dimensions.get("window");

function FloatSuit({ suit, x, y, size, opacity, duration }: {
  suit: string; x: number; y: number; size: number; opacity: number; duration: number;
}) {
  const ty = useSharedValue(0);
  useEffect(() => {
    ty.value = withRepeat(
      withSequence(
        withTiming(-12, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
      ), -1
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    position: "absolute",
    left: x * SW,
    top: y * 600,
    opacity,
  }));
  const isRed = suit === "♥" || suit === "♦";
  return <Animated.Text style={[style, { fontSize: size, color: isRed ? "#C0392B" : "#fff" }]}>{suit}</Animated.Text>;
}

function FloatingSuits() {
  const positions = [
    { suit: "♠", x: 0.08, y: 0.12, size: 48, opacity: 0.08, dur: 3000 },
    { suit: "♥", x: 0.82, y: 0.06, size: 38, opacity: 0.07, dur: 3400 },
    { suit: "♦", x: 0.72, y: 0.45, size: 52, opacity: 0.06, dur: 3800 },
    { suit: "♣", x: 0.04, y: 0.55, size: 42, opacity: 0.07, dur: 4200 },
    { suit: "♠", x: 0.88, y: 0.78, size: 36, opacity: 0.05, dur: 3600 },
    { suit: "♥", x: 0.15, y: 0.85, size: 44, opacity: 0.07, dur: 3200 },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <FloatSuit key={i} suit={p.suit} x={p.x} y={p.y} size={p.size} opacity={p.opacity} duration={p.dur} />
      ))}
    </>
  );
}

function StarRating({ stars, max = 5 }: { stars: number; max?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {Array.from({ length: max }).map((_, s) => (
        <Ionicons key={s} name="star" size={10} color={s < stars ? Colors.gold : Colors.textDim} />
      ))}
    </View>
  );
}

function DifficultyModal({ visible, onClose, onSelect, modeName, lang = "es" }: {
  visible: boolean; onClose: () => void; onSelect: (d: Difficulty) => void; modeName: string; lang?: "es" | "en" | "pt";
}) {
  const RARITY_COLORS: Record<Difficulty, string> = {
    easy: "#95A5A6", normal: "#2196F3", intermediate: "#27AE60", hard: "#E74C3C", expert: "#A855F7",
  };
  const subtitle = lang === "en" ? "Select difficulty" : lang === "pt" ? "Selecione a dificuldade" : "Selecciona la dificultad";
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalBg} onPress={onClose}>
        <View style={styles.diffModal}>
          <LinearGradient colors={["#1a2f1a", Colors.surface]} style={styles.diffModalGrad}>
            <View style={styles.diffModalHandle} />
            <Text style={styles.diffTitle}>{modeName}</Text>
            <Text style={styles.diffSub}>{subtitle}</Text>
            <View style={styles.diffGrid}>
              {DIFFICULTIES.map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => onSelect(d.id)}
                  style={({ pressed }) => [styles.diffOption, pressed && styles.diffOptionPressed,
                    { borderColor: RARITY_COLORS[d.id] + "55" }]}
                >
                  <LinearGradient
                    colors={[RARITY_COLORS[d.id] + "18", "transparent"]}
                    style={styles.diffOptionGrad}
                  >
                    <StarRating stars={d.stars} />
                    <Text style={[styles.diffName, { color: RARITY_COLORS[d.id] }]}>{getDiffName(d.id, lang) || d.name}</Text>
                    <View style={styles.diffReward}>
                      <Ionicons name="cash" size={10} color={Colors.gold} />
                      <Text style={styles.diffRewardText}>x{d.coinMultiplier}</Text>
                    </View>
                    {d.id === "expert" && (
                      <View style={styles.expertBadge}>
                        <Ionicons name="timer" size={9} color="#A855F7" />
                        <Text style={styles.expertBadgeText}>8s</Text>
                      </View>
                    )}
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </LinearGradient>
        </View>
      </Pressable>
    </Modal>
  );
}

// Daily reward modal
function DailyRewardModal({ visible, reward, onClaim }: {
  visible: boolean;
  reward: { coins: number; xp: number; label: string; icon: string; iconColor: string } | null;
  onClaim: () => void;
}) {
  const T = useT();
  const sc = useSharedValue(0.7);
  useEffect(() => {
    if (visible) sc.value = withSpring(1, { damping: 12 });
    else sc.value = 0.7;
  }, [visible]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  if (!reward) return null;
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.dailyOverlay}>
        <Animated.View style={[styles.dailyModal, animStyle]}>
          <LinearGradient colors={["#1a2e10", "#0a1a08"]} style={styles.dailyGrad}>
            <Text style={styles.dailyTitle}>{T("dailyReward")}</Text>
            <View style={[styles.dailyIconWrap, { borderColor: reward.iconColor + "88" }]}>
              <Ionicons name={reward.icon as any} size={42} color={reward.iconColor} />
            </View>
            <Text style={styles.dailyLabel}>{reward.label}</Text>
            <View style={styles.dailyChips}>
              <View style={styles.dailyChip}>
                <Ionicons name="cash" size={14} color={Colors.gold} />
                <Text style={styles.dailyChipText}>+{reward.coins}</Text>
              </View>
              <View style={styles.dailyChipXp}>
                <Ionicons name="star" size={12} color={Colors.gold} />
                <Text style={styles.dailyChipText}>+{reward.xp} XP</Text>
              </View>
            </View>
            <Pressable onPress={onClaim} style={styles.dailyClaimBtn}>
              <LinearGradient colors={[Colors.gold, Colors.goldLight]} style={styles.dailyClaimGrad}>
                <Text style={styles.dailyClaimText}>{T("claimReward").toUpperCase()}</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

function PokerTitle() {
  const glowAnim = useSharedValue(0.6);
  useEffect(() => {
    glowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.6, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ), -1
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowAnim.value }));
  return (
    <View style={styles.titleWrap}>
      <View style={styles.titleSuits}>
        <Text style={styles.suitRed}>♥</Text>
        <Text style={styles.suitBlack}>♠</Text>
        <Text style={styles.suitRed}>♦</Text>
        <Text style={styles.suitBlack}>♣</Text>
      </View>
      <Animated.View style={glowStyle}>
        <Text style={styles.mainTitle}>OCHO LOCOS</Text>
      </Animated.View>
      <Text style={styles.titleTagline}>CRAZY EIGHTS · CASINO EDITION</Text>
    </View>
  );
}

export default function PlayScreen() {
  const insets = useSafeAreaInsets();
  const { startGame } = useGame();
  const { profile, level, xpProgress, canClaimDailyReward, todaysDailyReward, claimDailyReward, watchAd, adsWatchedToday, adDailyLimit } = useProfile();
  const [selectedMode, setSelectedMode] = useState<GameModeId | null>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showMultiModal, setShowMultiModal] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [multiPlayerCount, setMultiPlayerCount] = useState(2);
  const [onlinePlayerCount, setOnlinePlayerCount] = useState(2);
  const [multiPlayerNames, setMultiPlayerNames] = useState(["Jugador 1", "Jugador 2", "Jugador 3", "Jugador 4"]);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adComplete, setAdComplete] = useState(false);

  const T = useT();
  const theme = useTheme();
  const isDark = theme.isDark;
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";
  const swipeHandlers = useSwipeTabs(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top + 6;
  const xpPct = xpProgress.needed > 0 ? xpProgress.current / xpProgress.needed : 0;

  // Show daily reward on mount if available
  useEffect(() => {
    if (canClaimDailyReward) {
      const timer = setTimeout(() => setShowDailyModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleModePress = async (modeId: GameModeId) => {
    await playButton().catch(() => {});
    const mode = GAME_MODES.find((m) => m.id === modeId);
    if (!mode) return;
    if (!mode.hasDifficulty) {
      startGame(modeId, "normal");
      router.push("/game");
      return;
    }
    setSelectedMode(modeId);
    setShowDiffModal(true);
  };

  const handleDifficultySelect = async (difficulty: Difficulty) => {
    if (!selectedMode) return;
    setShowDiffModal(false);
    startGame(selectedMode, difficulty);
    router.push("/game");
  };

  const handleClaimDaily = () => {
    claimDailyReward();
    playSound("daily_reward").catch(() => {});
    setShowDailyModal(false);
  };

  const handleStartMulti = async () => {
    await playButton().catch(() => {});
    const names = multiPlayerNames.slice(0, multiPlayerCount).map((n, i) => n.trim() || `Jugador ${i + 1}`);
    setShowMultiModal(false);
    router.push({ pathname: "/game-multi", params: { names: JSON.stringify(names), count: String(multiPlayerCount) } });
  };

  const handleStartOnline = async () => {
    await playButton().catch(() => {});
    setShowOnlineModal(false);
    router.push({ pathname: "/game-online", params: { count: String(onlinePlayerCount) } });
  };

  const handleOpenAd = () => {
    if (adsWatchedToday >= adDailyLimit) return;
    setAdCountdown(5);
    setAdComplete(false);
    setShowAdModal(true);
    let count = 5;
    const timer = setInterval(() => {
      count -= 1;
      setAdCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        setAdComplete(true);
      }
    }, 1000);
  };

  const handleClaimAd = () => {
    watchAd();
    playSound("purchase").catch(() => {});
    setShowAdModal(false);
  };

  const selectedModeConfig = selectedMode ? GAME_MODES.find((m) => m.id === selectedMode) : null;

  const bgGradient: [string, string, string, string, string] = isDark
    ? ["#041008", "#071510", "#0a1a0f", "#071510", "#041008"]
    : ["#d4edd0", "#dff2da", "#e8f5e2", "#dff2da", "#d4edd0"];

  return (
    <View style={[styles.container, { paddingTop: topPad, backgroundColor: theme.background }]} {...swipeHandlers}>
      <LinearGradient
        colors={bgGradient}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.feltTextureH1} />
      <View style={styles.feltTextureH2} />
      <View style={styles.feltTextureV1} />
      <FloatingSuits />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile bar — clickable to go to profile */}
        <Pressable
          onPress={() => { playButton().catch(() => {}); router.push("/(tabs)/profile"); }}
          style={({ pressed }) => [styles.profileBar, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }, pressed && styles.profileBarPressed]}
        >
          <AvatarDisplay
            avatarId={profile.avatarId}
            frameId={profile.selectedFrameId}
            photoUri={profile.photoUri}
            size={36}
            iconSize={18}
          />
          <View style={styles.profileBarInfo}>
            <Text style={[styles.profileBarName, { color: theme.text }]} numberOfLines={1}>{profile.name}</Text>
            <View style={styles.xpMini}>
              <Text style={[styles.levelTag, { color: theme.textMuted }]}>Nv.{level}</Text>
              <View style={[styles.xpBarMini, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)" }]}>
                <View style={[styles.xpFillMini, { width: `${xpPct * 100}%`, backgroundColor: theme.gold }]} />
              </View>
            </View>
          </View>
          <View style={styles.coinsBadge}>
            <Ionicons name="cash" size={13} color={theme.gold} />
            <Text style={[styles.coinsNum, { color: theme.gold }]}>{profile.coins}</Text>
          </View>
          {canClaimDailyReward && (
            <View style={styles.dailyDot}>
              <View style={styles.dailyDotInner} />
            </View>
          )}
          <Pressable
            onPress={(e) => { e.stopPropagation(); playButton().catch(() => {}); router.push("/settings"); }}
            style={styles.settingsBtn}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={17} color={theme.textMuted} />
          </Pressable>
        </Pressable>

        {/* Daily reward banner if available */}
        {canClaimDailyReward && (
          <Pressable
            onPress={() => setShowDailyModal(true)}
            style={[styles.dailyBanner, { backgroundColor: isDark ? "rgba(212,175,55,0.12)" : "rgba(160,120,0,0.12)" }]}
          >
            <Ionicons name="gift" size={16} color={theme.gold} />
            <Text style={[styles.dailyBannerText, { color: theme.gold }]}>{T("dailyRewardReady")}</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.gold} />
          </Pressable>
        )}

        <PokerTitle />

        <View style={styles.suitDivider}>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? "rgba(212,175,55,0.25)" : "rgba(120,80,0,0.2)" }]} />
          <Text style={[styles.dividerSuit, { color: isDark ? Colors.gold : "#A07800" }]}>♦</Text>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? "rgba(212,175,55,0.25)" : "rgba(120,80,0,0.2)" }]} />
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="game-controller" size={14} color={theme.textMuted} />
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{T("gameModes")}</Text>
        </View>

        <View style={styles.modesGrid}>
          {GAME_MODES.map((mode) => {
            const wins = profile.stats.winsByMode[mode.id] ?? 0;
            const games = profile.stats.gamesByMode[mode.id] ?? 0;
            const wr = games > 0 ? Math.round((wins / games) * 100) : null;
            return (
              <Pressable
                key={mode.id}
                onPress={() => handleModePress(mode.id)}
                style={({ pressed }) => [styles.modeCard, pressed && styles.modeCardPressed]}
              >
                <LinearGradient
                  colors={[mode.color + "28", mode.color + "08", "transparent"]}
                  style={[styles.modeGrad, { borderColor: mode.color + "50" }]}
                >
                  {mode.isNew && (
                    <LinearGradient colors={[Colors.red, "#a01a15"]} style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>{T("newBadge")}</Text>
                    </LinearGradient>
                  )}
                  <View style={[styles.modeIconWrap, { backgroundColor: mode.color + "25" }]}>
                    <Ionicons name={mode.icon as any} size={24} color={mode.color} />
                  </View>
                  <Text style={[styles.modeName, { color: mode.color }]}>{getModeName(mode.id, lang) || mode.name}</Text>
                  <Text style={styles.modeDesc} numberOfLines={2}>{getModeDesc(mode.id, lang) || mode.description}</Text>
                  <View style={styles.modeFooter}>
                    <View style={styles.modeReward}>
                      <Ionicons name="cash" size={11} color={Colors.gold} />
                      <Text style={styles.modeRewardText}>{mode.coinsReward}</Text>
                    </View>
                    {wr !== null && (
                      <Text style={styles.modeWR}>{wr}% WR</Text>
                    )}
                    {mode.hasDifficulty && (
                      <Ionicons name="chevron-forward" size={12} color={mode.color + "88"} />
                    )}
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {/* Multiplayer section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={14} color={theme.textMuted} />
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{T("multiplayer")}</Text>
        </View>
        <View style={styles.multiRow}>
          {/* Local */}
          <Pressable
            style={({ pressed }) => [styles.multiCard, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
            onPress={() => { playButton().catch(() => {}); setShowMultiModal(true); }}
          >
            <LinearGradient colors={["#0a2216", "#0d2e1c"]} style={styles.multiCardGrad}>
              <View style={[styles.multiCardIcon, { borderColor: "#2ECC7155" }]}>
                <Ionicons name="phone-portrait" size={22} color="#2ECC71" />
              </View>
              <Text style={[styles.multiCardTitle, { color: "#2ECC71" }]}>{T("multiLocal")}</Text>
              <Text style={styles.multiCardDesc}>{T("multiLocalDesc")}</Text>
              <View style={[styles.multiCardBadge, { backgroundColor: "#2ECC7122", borderColor: "#2ECC7144" }]}>
                <Ionicons name="people" size={10} color="#2ECC71" />
                <Text style={[styles.multiCardBadgeText, { color: "#2ECC71" }]}>2 – 4 {T("players")}</Text>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Online */}
          <Pressable
            style={({ pressed }) => [styles.multiCard, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
            onPress={() => { playButton().catch(() => {}); setShowOnlineModal(true); }}
          >
            <LinearGradient colors={["#080f22", "#0a1430"]} style={styles.multiCardGrad}>
              <View style={[styles.multiCardIcon, { borderColor: "#4A90E255" }]}>
                <Ionicons name="globe" size={22} color="#4A90E2" />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Text style={[styles.multiCardTitle, { color: "#4A90E2" }]}>{T("multiOnline")}</Text>
                <View style={styles.onlineDotPill}>
                  <View style={styles.onlineDotSmall} />
                  <Text style={styles.onlineDotText}>{T("multiOnlineDesc")}</Text>
                </View>
              </View>
              <Text style={styles.multiCardDesc}>{T("multiOnlineDesc2")}</Text>
              <View style={[styles.multiCardBadge, { backgroundColor: "#4A90E222", borderColor: "#4A90E244" }]}>
                <Ionicons name="wifi" size={10} color="#4A90E2" />
                <Text style={[styles.multiCardBadgeText, { color: "#4A90E2" }]}>2 – 4 {T("players")}</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Earn Coins / Watch Ads section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="cash" size={14} color={theme.textMuted} />
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{T("earnCoins")}</Text>
        </View>
        <Pressable
          onPress={handleOpenAd}
          disabled={adsWatchedToday >= adDailyLimit}
          style={({ pressed }) => [
            styles.adBanner,
            { backgroundColor: isDark ? "rgba(212,175,55,0.08)" : "rgba(160,120,0,0.08)", borderColor: isDark ? Colors.gold + "33" : "#A0780044" },
            adsWatchedToday >= adDailyLimit && { opacity: 0.5 },
            pressed && adsWatchedToday < adDailyLimit && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
        >
          <LinearGradient colors={adsWatchedToday >= adDailyLimit ? ["#33333322","#22222211"] : [Colors.gold + "18", Colors.gold + "08"]} style={StyleSheet.absoluteFill} />
          <View style={[styles.adIconWrap, { backgroundColor: Colors.gold + "22" }]}>
            <Ionicons name="play-circle" size={28} color={adsWatchedToday >= adDailyLimit ? Colors.textDim : Colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.adTitle, { color: adsWatchedToday >= adDailyLimit ? Colors.textMuted : theme.gold }]}>
              {adsWatchedToday >= adDailyLimit ? T("adDailyLimit") : T("watchAd")}
            </Text>
            <Text style={[styles.adDesc, { color: theme.textMuted }]}>
              {T("watchAdDesc")} · {T("adReward")}
            </Text>
          </View>
          <View style={styles.adCounter}>
            <Text style={[styles.adCounterText, { color: theme.textMuted }]}>{adsWatchedToday}/{adDailyLimit}</Text>
          </View>
        </Pressable>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <Pressable
            onPress={async () => { await playButton().catch(() => {}); router.push("/tutorial"); }}
            style={styles.quickBtn}
          >
            <Ionicons name="help-circle-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.quickBtnText}>Tutorial</Text>
          </Pressable>
          <Pressable
            onPress={async () => { await playButton().catch(() => {}); router.push("/rules"); }}
            style={styles.quickBtn}
          >
            <Ionicons name="book-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.quickBtnText}>{T("rules")}</Text>
          </Pressable>
          <Pressable
            onPress={async () => { await playButton().catch(() => {}); router.push("/ranking"); }}
            style={styles.quickBtn}
          >
            <Ionicons name="earth" size={18} color={Colors.textMuted} />
            <Text style={styles.quickBtnText}>{T("viewRanking")}</Text>
          </Pressable>
          {profile.stats.totalGames > 0 && (
            <View style={styles.statChip}>
              <Ionicons name="trophy" size={14} color={Colors.gold} />
              <Text style={styles.statChipText}>{profile.stats.totalWins}V</Text>
              <Text style={styles.statChipSep}>·</Text>
              <Text style={styles.statChipText}>{profile.stats.totalGames}P</Text>
            </View>
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <DifficultyModal
        visible={showDiffModal}
        onClose={() => setShowDiffModal(false)}
        onSelect={handleDifficultySelect}
        modeName={selectedModeConfig ? (getModeName(selectedModeConfig.id, lang) || selectedModeConfig.name) : ""}
        lang={lang}
      />

      <DailyRewardModal
        visible={showDailyModal}
        reward={canClaimDailyReward ? todaysDailyReward : null}
        onClaim={handleClaimDaily}
      />

      {/* Online modal */}
      <Modal visible={showOnlineModal} transparent animationType="slide" onRequestClose={() => setShowOnlineModal(false)}>
        <View style={styles.multiModalOverlay}>
          <LinearGradient colors={["#060f22", "#0a1632"]} style={styles.multiModalBox}>
            <View style={styles.multiModalHeader}>
              <View style={styles.onlineDotPill}>
                <View style={styles.onlineDotSmall} />
                <Text style={[styles.onlineDotText, { fontSize: 10 }]}>{T("multiOnlineDesc")}</Text>
              </View>
              <Text style={[styles.multiModalTitle, { color: "#4A90E2", flex: 1 }]}>Online</Text>
              <Pressable onPress={() => setShowOnlineModal(false)} style={styles.multiModalClose}>
                <Ionicons name="close" size={20} color={Colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.multiModalSectionLabel}>{T("howManyPlayersLocal")}</Text>
            <View style={styles.multiCountRow}>
              {[2, 3, 4].map(n => (
                <Pressable
                  key={n}
                  onPress={() => setOnlinePlayerCount(n)}
                  style={[styles.multiCountBtn, onlinePlayerCount === n && { backgroundColor: "#4A90E222", borderColor: "#4A90E266" }]}
                >
                  <Text style={[styles.multiCountBtnText, onlinePlayerCount === n && { color: "#4A90E2" }]}>{n}</Text>
                  <Text style={[styles.multiCountBtnSub, onlinePlayerCount === n && { color: "#4A90E2" }]}>
                    {n === 2 ? "1 rival" : `${n - 1} rivales`}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.multiModalSectionLabel, { marginTop: 8 }]}>{T("rivals")}</Text>
            <View style={{ gap: 6 }}>
              {Array.from({ length: onlinePlayerCount - 1 }).map((_, i) => (
                <View key={i} style={[styles.multiNameRow, { borderColor: "#4A90E222" }]}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#4A90E2" }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.multiNameInput, { color: Colors.textMuted, paddingVertical: 8 }]}>
                      #{i + 1} — {T("searchingOnline")}
                    </Text>
                  </View>
                  <View style={styles.onlineDotSmall} />
                </View>
              ))}
            </View>

            <Pressable onPress={handleStartOnline} style={styles.multiStartBtn}>
              <LinearGradient colors={["#1a3a7a", "#4A90E2"]} style={styles.multiStartBtnGrad}>
                <Ionicons name="search" size={18} color="#fff" />
                <Text style={styles.multiStartBtnText}>{T("searchMatch")}</Text>
              </LinearGradient>
            </Pressable>

            <Text style={styles.multiModalHint}>{T("onlineRivals")}</Text>
          </LinearGradient>
        </View>
      </Modal>

      <Modal visible={showMultiModal} transparent animationType="slide" onRequestClose={() => setShowMultiModal(false)}>
        <View style={styles.multiModalOverlay}>
          <LinearGradient colors={["#0a1a2e", "#0d2244"]} style={styles.multiModalBox}>
            <View style={styles.multiModalHeader}>
              <Ionicons name="people" size={22} color="#63B3ED" />
              <Text style={styles.multiModalTitle}>{T("multiLocal")}</Text>
              <Pressable onPress={() => setShowMultiModal(false)} style={styles.multiModalClose}>
                <Ionicons name="close" size={20} color={Colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.multiModalSectionLabel}>{T("howManyPlayersLocal")}</Text>
            <View style={styles.multiCountRow}>
              {[2, 3, 4].map(n => (
                <Pressable
                  key={n}
                  onPress={() => setMultiPlayerCount(n)}
                  style={[styles.multiCountBtn, multiPlayerCount === n && styles.multiCountBtnActive]}
                >
                  <Text style={[styles.multiCountBtnText, multiPlayerCount === n && styles.multiCountBtnTextActive]}>
                    {n}
                  </Text>
                  <Text style={[styles.multiCountBtnSub, multiPlayerCount === n && { color: "#63B3ED" }]}>
                    {n === 2 ? "1vs1" : n === 3 ? "3 amigos" : "4 amigos"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.multiModalSectionLabel, { marginTop: 12 }]}>{T("namesOptional")}</Text>
            {Array.from({ length: multiPlayerCount }).map((_, i) => {
              const colors = ["#D4AF37", "#27AE60", "#E74C3C", "#9B59B6"];
              const c = colors[i % colors.length];
              return (
                <View key={i} style={styles.multiNameRow}>
                  <View style={[styles.multiNameDot, { backgroundColor: c }]} />
                  <TextInput
                    style={styles.multiNameInput}
                    value={multiPlayerNames[i]}
                    onChangeText={t => setMultiPlayerNames(prev => {
                      const n = [...prev];
                      n[i] = t;
                      return n;
                    })}
                    placeholder={`Jugador ${i + 1}`}
                    placeholderTextColor={Colors.textDim}
                    maxLength={16}
                  />
                </View>
              );
            })}

            <Pressable onPress={handleStartMulti} style={styles.multiStartBtn}>
              <LinearGradient colors={["#2B6CB0", "#63B3ED"]} style={styles.multiStartBtnGrad}>
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.multiStartBtnText}>{T("startMatch")}</Text>
              </LinearGradient>
            </Pressable>

            <Text style={styles.multiModalHint}>{T("passDeviceHint")}</Text>
          </LinearGradient>
        </View>
      </Modal>

      {/* Watch Ad Modal */}
      <Modal visible={showAdModal} transparent animationType="fade" onRequestClose={() => !adComplete && setShowAdModal(false)}>
        <View style={styles.adModalOverlay}>
          <View style={[styles.adModalBox, { backgroundColor: isDark ? "#0d1a0f" : "#e8f5e2", borderColor: Colors.gold + "44" }]}>
            <LinearGradient colors={[Colors.gold + "18", "transparent"]} style={StyleSheet.absoluteFill} />
            <View style={styles.adModalIcon}>
              <Ionicons name="play-circle" size={48} color={Colors.gold} />
            </View>
            <Text style={[styles.adModalTitle, { color: theme.gold }]}>
              {adComplete ? "+50" : T("adWatching")}
            </Text>
            {!adComplete && (
              <View style={styles.adCountdownWrap}>
                <Text style={[styles.adCountdownNum, { color: theme.text }]}>{adCountdown}</Text>
              </View>
            )}
            {adComplete && (
              <>
                <Text style={[styles.adModalSub, { color: theme.textMuted }]}>
                  {T("adComplete")}
                </Text>
                <View style={styles.adRewardRow}>
                  <Ionicons name="cash" size={20} color={Colors.gold} />
                  <Text style={[styles.adRewardText, { color: theme.gold }]}>+50 {T("coins")}</Text>
                </View>
                <Pressable onPress={handleClaimAd} style={styles.adClaimBtn}>
                  <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={styles.adClaimGrad}>
                    <Text style={styles.adClaimText}>{T("adClose")}</Text>
                  </LinearGradient>
                </Pressable>
              </>
            )}
            {!adComplete && (
              <Pressable onPress={() => setShowAdModal(false)} style={styles.adCancelBtn}>
                <Text style={[styles.adCancelText, { color: theme.textMuted }]}>{T("cancel")}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#041008" },
  scroll: { paddingHorizontal: 16 },

  feltTextureH1: { position: "absolute", left: 0, right: 0, top: "30%", height: 1, backgroundColor: "rgba(255,255,255,0.02)" },
  feltTextureH2: { position: "absolute", left: 0, right: 0, top: "65%", height: 1, backgroundColor: "rgba(255,255,255,0.02)" },
  feltTextureV1: { position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, backgroundColor: "rgba(255,255,255,0.015)" },

  // Profile bar
  profileBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14,
    padding: 10, borderWidth: 1, borderColor: "rgba(212,175,55,0.15)", marginBottom: 10,
  },
  profileBarPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  avatarSmall: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  profileBarInfo: { flex: 1 },
  profileBarName: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.text },
  xpMini: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  levelTag: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 9, color: Colors.gold,
    backgroundColor: Colors.gold + "20", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3,
  },
  xpBarMini: { flex: 1, height: 3, backgroundColor: Colors.border, borderRadius: 2 },
  xpFillMini: { height: "100%", backgroundColor: Colors.gold, borderRadius: 2 },
  coinsBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.gold + "18", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: Colors.gold + "40",
  },
  coinsNum: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, color: Colors.gold },
  settingsBtn: {
    width: 30, height: 30, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 15,
  },
  dailyDot: {
    position: "absolute", top: 6, right: 54,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#E74C3C", alignItems: "center", justifyContent: "center",
  },
  dailyDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },

  // Daily reward banner
  dailyBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(212,175,55,0.1)", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8,
    borderWidth: 1, borderColor: "rgba(212,175,55,0.3)",
  },
  dailyBannerText: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.gold, flex: 1 },

  // Poker title
  titleWrap: { alignItems: "center", paddingVertical: 10, gap: 4 },
  titleSuits: { flexDirection: "row", gap: 12, marginBottom: 4 },
  suitRed: { fontSize: 22, color: "#C0392B", opacity: 0.8 },
  suitBlack: { fontSize: 22, color: Colors.textMuted, opacity: 0.8 },
  mainTitle: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 36, color: Colors.gold,
    letterSpacing: 5,
    textShadowColor: "rgba(212,175,55,0.5)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
  },
  titleTagline: {
    fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textDim,
    letterSpacing: 3, textTransform: "uppercase",
  },

  // Divider
  suitDivider: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerSuit: { fontSize: 14, color: Colors.gold + "60" },

  // Section header
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  sectionLabel: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textMuted, letterSpacing: 2 },

  // Mode grid
  modesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  modeCard: { width: "47.5%", borderRadius: 16, overflow: "hidden" },
  modeCardPressed: { opacity: 0.82, transform: [{ scale: 0.96 }] },
  modeGrad: {
    padding: 14, minHeight: 150, justifyContent: "space-between",
    borderWidth: 1.5, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  newBadge: {
    position: "absolute", top: 8, right: 8,
    borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1,
  },
  newBadgeText: { fontFamily: "Nunito_900ExtraBold", fontSize: 7, color: "#fff", letterSpacing: 1 },
  modeIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  modeName: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, marginBottom: 4 },
  modeDesc: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textMuted, lineHeight: 15, flex: 1 },
  modeFooter: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8, flexWrap: "wrap" },
  modeReward: { flexDirection: "row", alignItems: "center", gap: 3 },
  modeRewardText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.gold },
  modeWR: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textDim, flex: 1, textAlign: "right" },

  // Quick actions
  quickRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  quickBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border,
  },
  quickBtnText: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },
  statChip: {
    flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto" as any,
    backgroundColor: Colors.gold + "12", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Colors.gold + "30",
  },
  statChipText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.gold },
  statChipSep: { color: Colors.textDim, fontSize: 11 },

  // Difficulty modal
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  diffModal: { borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: "hidden" },
  diffModalGrad: { padding: 22, paddingBottom: 36 },
  diffModalHandle: {
    width: 38, height: 4, backgroundColor: Colors.border, borderRadius: 2,
    alignSelf: "center", marginBottom: 18,
  },
  diffTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 20, color: Colors.gold, marginBottom: 4 },
  diffSub: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted, marginBottom: 18 },
  diffGrid: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  diffOption: {
    flex: 1, minWidth: "18%", borderRadius: 12, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.border,
  },
  diffOptionPressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  diffOptionGrad: { padding: 10, alignItems: "center", gap: 5 },
  diffName: { fontFamily: "Nunito_700Bold", fontSize: 11 },
  diffReward: { flexDirection: "row", alignItems: "center", gap: 3 },
  diffRewardText: { fontFamily: "Nunito_400Regular", fontSize: 9, color: Colors.textMuted },
  expertBadge: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: "rgba(168,85,247,0.2)", borderRadius: 5,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  expertBadgeText: { fontFamily: "Nunito_700Bold", fontSize: 8, color: "#A855F7" },

  // Daily reward modal
  dailyOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center" },
  dailyModal: { width: 300, borderRadius: 24, overflow: "hidden", borderWidth: 1.5, borderColor: Colors.gold + "44" },
  dailyGrad: { padding: 28, alignItems: "center", gap: 12 },
  dailyTitle: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 16, color: Colors.gold,
    letterSpacing: 2, textAlign: "center",
  },
  dailyIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center",
    borderWidth: 2, marginVertical: 4,
  },
  dailyLabel: { fontFamily: "Nunito_700Bold", fontSize: 15, color: Colors.text, textAlign: "center" },
  dailyChips: { flexDirection: "row", gap: 10 },
  dailyChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.gold + "20", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.gold + "44",
  },
  dailyChipXp: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  dailyChipText: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, color: Colors.gold },
  dailyClaimBtn: { width: "100%", borderRadius: 14, overflow: "hidden" },
  dailyClaimGrad: { paddingVertical: 14, alignItems: "center" },
  dailyClaimText: { fontFamily: "Nunito_900ExtraBold", fontSize: 15, color: "#1a0a00", letterSpacing: 1 },

  // Multiplayer cards
  multiRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  multiCard: { flex: 1, borderRadius: 14, overflow: "hidden" },
  multiCardGrad: {
    padding: 14, gap: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 14, minHeight: 140,
  },
  multiCardIcon: {
    width: 42, height: 42, borderRadius: 12, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  multiCardTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 16 },
  multiCardDesc: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textDim, flex: 1 },
  multiCardBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1,
    alignSelf: "flex-start",
  },
  multiCardBadgeText: { fontFamily: "Nunito_700Bold", fontSize: 9 },
  onlineDotPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#2ecc7118", borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  onlineDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#2ecc71" },
  onlineDotText: { fontFamily: "Nunito_900ExtraBold", fontSize: 8, color: "#2ecc71", letterSpacing: 1 },

  // Multiplayer modal
  multiModalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  multiModalBox: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36,
    gap: 10,
  },
  multiModalHeader: {
    flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4,
  },
  multiModalTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 17, color: "#63B3ED", flex: 1 },
  multiModalClose: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center",
  },
  multiModalSectionLabel: {
    fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.textDim, letterSpacing: 2,
  },
  multiCountRow: { flexDirection: "row", gap: 10 },
  multiCountBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: Colors.border, gap: 2,
  },
  multiCountBtnActive: {
    backgroundColor: "#63B3ED22", borderColor: "#63B3ED66",
  },
  multiCountBtnText: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 22, color: Colors.textMuted,
  },
  multiCountBtnTextActive: { color: "#63B3ED" },
  multiCountBtnSub: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textDim },
  multiNameRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.border,
  },
  multiNameDot: { width: 10, height: 10, borderRadius: 5 },
  multiNameInput: {
    flex: 1, fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.text,
    paddingVertical: 10,
  },
  multiStartBtn: { marginTop: 8, borderRadius: 14, overflow: "hidden" },
  multiStartBtnGrad: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 15,
  },
  multiStartBtnText: { fontFamily: "Nunito_900ExtraBold", fontSize: 15, color: "#fff", letterSpacing: 1 },
  multiModalHint: {
    fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textDim, textAlign: "center", marginTop: 4,
  },

  // Watch Ads section
  adBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 12, overflow: "hidden",
  },
  adIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  adTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, color: Colors.gold, letterSpacing: 0.5 },
  adDesc: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  adCounter: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4, minWidth: 36, alignItems: "center",
  },
  adCounterText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textMuted },

  // Watch Ad Modal
  adModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  adModalBox: {
    width: 280, borderRadius: 20, borderWidth: 1, paddingVertical: 30, paddingHorizontal: 24,
    alignItems: "center", gap: 12, overflow: "hidden",
  },
  adModalIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.gold + "22",
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  adModalTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 32, color: Colors.gold },
  adModalSub: { fontFamily: "Nunito_400Regular", fontSize: 13, textAlign: "center", color: Colors.textMuted },
  adCountdownWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.gold + "22", alignItems: "center", justifyContent: "center",
  },
  adCountdownNum: { fontFamily: "Nunito_900ExtraBold", fontSize: 28, color: Colors.text },
  adRewardRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  adRewardText: { fontFamily: "Nunito_900ExtraBold", fontSize: 20, color: Colors.gold },
  adClaimBtn: { width: "100%", borderRadius: 12, overflow: "hidden", marginTop: 4 },
  adClaimGrad: { paddingVertical: 13, alignItems: "center" },
  adClaimText: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, color: "#1a0a00", letterSpacing: 1 },
  adCancelBtn: { marginTop: 4 },
  adCancelText: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted },
});
