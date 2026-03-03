import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Animated, Dimensions, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import type { CpuProfile } from "@/lib/cpuProfiles";
import { playSound } from "@/lib/sounds";
import { useT } from "@/hooks/useT";

const { width: SW } = Dimensions.get("window");

interface MatchmakingScreenProps {
  playerAvatarId: string;
  playerFrameId?: string;
  playerPhotoUri?: string;
  playerName: string;
  cpuProfile: CpuProfile | null;
  onComplete: () => void;
}

export function MatchmakingScreen({
  playerAvatarId, playerFrameId, playerPhotoUri, playerName, cpuProfile, onComplete,
}: MatchmakingScreenProps) {
  const T = useT();
  const [phase, setPhase] = useState<"searching" | "found">("searching");

  const dot1 = useRef(new Animated.Value(0.2)).current;
  const dot2 = useRef(new Animated.Value(0.2)).current;
  const dot3 = useRef(new Animated.Value(0.2)).current;

  const overlayOp = useRef(new Animated.Value(1)).current;
  const leftX = useRef(new Animated.Value(-SW * 0.5)).current;
  const rightX = useRef(new Animated.Value(SW * 0.5)).current;
  const vsScale = useRef(new Animated.Value(0)).current;
  const foundScale = useRef(new Animated.Value(0)).current;
  const glowOp = useRef(new Animated.Value(0)).current;
  const pulseL = useRef(new Animated.Value(1)).current;
  const pulseR = useRef(new Animated.Value(1)).current;

  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    playSound("shuffle").catch(() => {});

    // Slide in avatars
    Animated.parallel([
      Animated.spring(leftX, { toValue: 0, damping: 16, stiffness: 100, useNativeDriver: true }),
      Animated.spring(rightX, { toValue: 0, damping: 16, stiffness: 100, useNativeDriver: true }),
    ]).start();

    // Animate dots in loop
    const dotLoop = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0.2, duration: 280, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.2, duration: 280, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.2, duration: 280, useNativeDriver: true }),
        ]),
      ])
    );
    animRef.current = dotLoop;
    dotLoop.start();

    // Phase 2: rival found
    const foundTimer = setTimeout(() => {
      if (animRef.current) animRef.current.stop();
      setPhase("found");
      playSound("win").catch(() => {});
      Animated.parallel([
        Animated.spring(vsScale, { toValue: 1, damping: 7, stiffness: 130, useNativeDriver: true }),
        Animated.spring(foundScale, { toValue: 1, damping: 10, stiffness: 100, useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
      // Pulse both avatars
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseL, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseL, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseR, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseR, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }, 2400);

    // Fade out and call complete
    const completeTimer = setTimeout(() => {
      Animated.timing(overlayOp, { toValue: 0, duration: 450, useNativeDriver: true }).start(() => {
        onComplete();
      });
    }, 4200);

    return () => {
      clearTimeout(foundTimer);
      clearTimeout(completeTimer);
      if (animRef.current) animRef.current.stop();
    };
  }, []);

  const youLabel = T("youLabel") || "TÚ";
  const rivalLabel = "RIVAL";
  const searchText = T("searchingRival") || "Buscando rival";
  const foundText = T("rivalFound") || "¡Rival encontrado!";

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOp }]} pointerEvents="none">
      <LinearGradient
        colors={["#010804", "#041008", "#061510", "#041008", "#010804"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Casino shimmer lines */}
      <View style={styles.tableGlow} />

      {/* Header status */}
      <View style={styles.statusRow}>
        {phase === "searching" ? (
          <>
            <Text style={styles.statusText}>{searchText}</Text>
            <View style={styles.dotsRow}>
              <Animated.View style={[styles.dot, { opacity: dot1 }]} />
              <Animated.View style={[styles.dot, { opacity: dot2 }]} />
              <Animated.View style={[styles.dot, { opacity: dot3 }]} />
            </View>
          </>
        ) : (
          <Animated.View style={[styles.foundRow, { transform: [{ scale: foundScale }] }]}>
            <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
            <Text style={styles.foundText}>{foundText}</Text>
          </Animated.View>
        )}
      </View>

      {/* Avatars VS row */}
      <View style={styles.vsRow}>
        {/* Player card */}
        <Animated.View style={[styles.playerCard, { transform: [{ translateX: leftX }, { scale: phase === "found" ? pulseL : 1 }] }]}>
          <View style={[styles.avatarRing, phase === "found" && styles.avatarRingActive]}>
            <AvatarDisplay
              avatarId={playerAvatarId}
              frameId={playerFrameId}
              photoUri={playerPhotoUri}
              size={76}
            />
          </View>
          <View style={styles.youBadge}>
            <Text style={styles.youBadgeText}>{youLabel}</Text>
          </View>
          <Text style={styles.cardName} numberOfLines={1}>{playerName}</Text>
        </Animated.View>

        {/* VS badge */}
        <Animated.View style={[styles.vsBadge, { transform: [{ scale: vsScale }] }]}>
          <LinearGradient
            colors={[Colors.gold, "#A07800", Colors.gold]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.vsGrad}
          >
            <Text style={styles.vsTxt}>VS</Text>
          </LinearGradient>
          <Animated.View style={[styles.vsGlow, { opacity: glowOp }]} />
        </Animated.View>

        {/* CPU card */}
        <Animated.View style={[styles.playerCard, { transform: [{ translateX: rightX }, { scale: phase === "found" ? pulseR : 1 }] }]}>
          <View style={[styles.avatarRing, styles.avatarRingCpu, phase === "found" && styles.avatarRingCpuActive]}>
            {cpuProfile?.photoUrl ? (
              <Image source={{ uri: cpuProfile.photoUrl }} style={styles.cpuPhoto} />
            ) : (
              <View style={[styles.cpuIconWrap, { backgroundColor: cpuProfile?.avatarColor ?? Colors.surface }]}>
                <Ionicons name={(cpuProfile?.avatarIcon ?? "person") as any} size={36} color="#fff" />
              </View>
            )}
          </View>
          <View style={[styles.youBadge, styles.rivalBadge]}>
            <Text style={[styles.youBadgeText, styles.rivalBadgeText]}>{rivalLabel}</Text>
          </View>
          <Text style={styles.cardName} numberOfLines={1}>{cpuProfile?.name ?? "CPU"}</Text>
        </Animated.View>
      </View>

      {/* CPU stats */}
      {cpuProfile && phase === "found" && (
        <Animated.View style={[styles.cpuStatsRow, { opacity: foundScale }]}>
          <Ionicons name="trophy" size={11} color={Colors.gold} />
          <Text style={styles.cpuStatsTxt}>
            Nv.{cpuProfile.level} · {cpuProfile.titleId?.replace("title_", "").replace(/_/g, " ") ?? "CPU"}
          </Text>
        </Animated.View>
      )}

      {/* Searching ring */}
      {phase === "searching" && (
        <View style={styles.searchRingWrap}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.searchRing, {
                width: 60 + i * 26,
                height: 60 + i * 26,
                borderRadius: 30 + i * 13,
                opacity: 0.15 - i * 0.04,
                borderColor: Colors.gold,
              }]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9000,
    alignItems: "center",
    justifyContent: "center",
  },
  tableGlow: {
    position: "absolute",
    top: "20%", left: 24, right: 24, bottom: "20%",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.07)",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 36,
  },
  statusText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  foundRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  foundText: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 18,
    color: "#27AE60",
    letterSpacing: 0.5,
  },
  vsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
  },
  playerCard: {
    alignItems: "center",
    gap: 8,
    width: 100,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.gold + "55",
  },
  avatarRingActive: {
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  avatarRingCpu: {
    borderColor: "#E74C3C55",
  },
  avatarRingCpuActive: {
    borderColor: "#E74C3C",
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  cpuPhoto: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  cpuIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  youBadge: {
    backgroundColor: Colors.gold + "22",
    borderWidth: 1,
    borderColor: Colors.gold + "66",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  youBadgeText: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 10,
    color: Colors.gold,
    letterSpacing: 1,
  },
  rivalBadge: {
    backgroundColor: "#E74C3C22",
    borderColor: "#E74C3C66",
  },
  rivalBadgeText: {
    color: "#E74C3C",
  },
  cardName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: Colors.text,
    textAlign: "center",
    maxWidth: 96,
  },
  vsBadge: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  vsGrad: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  vsGlow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.gold + "33",
  },
  vsTxt: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 18,
    color: "#1a0e00",
    letterSpacing: 1,
  },
  cpuStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 20,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cpuStatsTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: Colors.textMuted,
  },
  searchRingWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  searchRing: {
    position: "absolute",
    borderWidth: 1,
  },
});
