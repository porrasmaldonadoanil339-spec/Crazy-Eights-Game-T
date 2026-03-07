import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Animated, Dimensions, Image, Easing,
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

  const overlayOp = useRef(new Animated.Value(1)).current;
  const leftX = useRef(new Animated.Value(-SW * 0.55)).current;
  const rightX = useRef(new Animated.Value(SW * 0.55)).current;
  const vsScale = useRef(new Animated.Value(0)).current;
  const foundScale = useRef(new Animated.Value(0)).current;
  const glowOp = useRef(new Animated.Value(0)).current;
  const pulseL = useRef(new Animated.Value(1)).current;
  const pulseR = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;
  const questionScale = useRef(new Animated.Value(1)).current;
  const questionOp = useRef(new Animated.Value(1)).current;
  const cpuRevealOp = useRef(new Animated.Value(0)).current;
  const cpuRevealScale = useRef(new Animated.Value(0.5)).current;
  const radarScale1 = useRef(new Animated.Value(0.3)).current;
  const radarOp1 = useRef(new Animated.Value(0.8)).current;
  const radarScale2 = useRef(new Animated.Value(0.3)).current;
  const radarOp2 = useRef(new Animated.Value(0.8)).current;
  const radarScale3 = useRef(new Animated.Value(0.3)).current;
  const radarOp3 = useRef(new Animated.Value(0.8)).current;

  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);
  const radarLoop = useRef<Animated.CompositeAnimation | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    playSound("shuffle").catch(() => {});

    // Slide in both cards
    Animated.parallel([
      Animated.spring(leftX, { toValue: 0, damping: 16, stiffness: 100, useNativeDriver: true }),
      Animated.spring(rightX, { toValue: 0, damping: 16, stiffness: 100, useNativeDriver: true }),
    ]).start();

    // Spin the "?" icon
    spinLoop.current = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true })
    );
    spinLoop.current.start();

    // Radar pulse rings
    const startRadar = () => {
      radarScale1.setValue(0.3);
      radarOp1.setValue(0.8);
      radarScale2.setValue(0.3);
      radarOp2.setValue(0.8);
      radarScale3.setValue(0.3);
      radarOp3.setValue(0.8);
      radarLoop.current = Animated.loop(
        Animated.stagger(500, [
          Animated.parallel([
            Animated.timing(radarScale1, { toValue: 2.2, duration: 1500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(radarOp1, { toValue: 0, duration: 1500, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(radarScale2, { toValue: 2.2, duration: 1500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(radarOp2, { toValue: 0, duration: 1500, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(radarScale3, { toValue: 2.2, duration: 1500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(radarOp3, { toValue: 0, duration: 1500, useNativeDriver: true }),
          ]),
        ])
      );
      radarLoop.current.start();
    };
    startRadar();

    // Phase 2: rival found after 3-4 seconds
    const delay = 3000 + Math.random() * 1000;
    const foundTimer = setTimeout(() => {
      if (spinLoop.current) spinLoop.current.stop();
      if (radarLoop.current) radarLoop.current.stop();

      setPhase("found");
      playSound("win").catch(() => {});

      // Question mark fades out, CPU avatar fades in
      Animated.parallel([
        Animated.timing(questionOp, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(questionScale, { toValue: 1.4, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        Animated.parallel([
          Animated.spring(cpuRevealOp, { toValue: 1, damping: 12, stiffness: 120, useNativeDriver: true }),
          Animated.spring(cpuRevealScale, { toValue: 1, damping: 10, stiffness: 100, useNativeDriver: true }),
        ]).start();
      });

      // VS badge and found text
      Animated.parallel([
        Animated.spring(vsScale, { toValue: 1, damping: 7, stiffness: 130, useNativeDriver: true }),
        Animated.spring(foundScale, { toValue: 1, damping: 10, stiffness: 100, useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();

      // Pulse both avatars
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseL, { toValue: 1.07, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseL, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      animRef.current.start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseR, { toValue: 1.07, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseR, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }, delay);

    // Fade out and call complete (~1.8s after "found")
    const completeTimer = setTimeout(() => {
      Animated.timing(overlayOp, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        onComplete();
      });
    }, delay + 1900);

    return () => {
      clearTimeout(foundTimer);
      clearTimeout(completeTimer);
      if (spinLoop.current) spinLoop.current.stop();
      if (radarLoop.current) radarLoop.current.stop();
      if (animRef.current) animRef.current.stop();
    };
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const youLabel = T("youLabel") || "TÚ";
  const searchText = T("searchingRival") || "Buscando oponente";
  const foundText = T("rivalFound") || "¡Oponente encontrado!";

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOp, pointerEvents: "none" } as any]}>
      <LinearGradient
        colors={["#010804", "#041008", "#071812", "#041008", "#010804"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow table */}
      <View style={styles.tableGlow} />

      {/* Header status */}
      <View style={styles.statusRow}>
        {phase === "searching" ? (
          <>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="search" size={15} color={Colors.gold} />
            </Animated.View>
            <Text style={styles.statusText}>{searchText}</Text>
          </>
        ) : (
          <Animated.View style={[styles.foundRow, { transform: [{ scale: foundScale }] }]}>
            <Ionicons name="checkmark-circle" size={22} color="#27AE60" />
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

        {/* CPU card – shows "?" during search, reveals avatar on found */}
        <Animated.View style={[styles.playerCard, { transform: [{ translateX: rightX }, { scale: phase === "found" ? pulseR : 1 }] }]}>
          <View style={[styles.avatarRing, styles.avatarRingCpu, phase === "found" && styles.avatarRingCpuActive]}>
            {phase === "searching" ? (
              /* Question mark with radar rings */
              <View style={styles.searchSlot}>
                {/* Radar rings */}
                {[radarScale1, radarOp1, radarScale2, radarOp2, radarScale3, radarOp3].length > 0 && [
                  { s: radarScale1, o: radarOp1 },
                  { s: radarScale2, o: radarOp2 },
                  { s: radarScale3, o: radarOp3 },
                ].map((r, i) => (
                  <Animated.View
                    key={i}
                    style={[styles.radarRing, {
                      opacity: r.o,
                      transform: [{ scale: r.s }],
                    }]}
                  />
                ))}
                <Animated.View style={[styles.questionWrap, { opacity: questionOp, transform: [{ rotate: spin }, { scale: questionScale }] }]}>
                  <Text style={styles.questionMark}>?</Text>
                </Animated.View>
              </View>
            ) : (
              <Animated.View style={{ opacity: cpuRevealOp, transform: [{ scale: cpuRevealScale }] }}>
                {cpuProfile?.photoUrl ? (
                  <Image source={{ uri: cpuProfile.photoUrl }} style={styles.cpuPhoto} />
                ) : (
                  <View style={[styles.cpuIconWrap, { backgroundColor: cpuProfile?.avatarColor ?? Colors.surface }]}>
                    <Ionicons name={(cpuProfile?.avatarIcon ?? "person") as any} size={38} color="#fff" />
                  </View>
                )}
              </Animated.View>
            )}
          </View>
          <View style={[styles.youBadge, styles.rivalBadge]}>
            <Text style={[styles.youBadgeText, styles.rivalBadgeText]}>RIVAL</Text>
          </View>
          <Text style={styles.cardName} numberOfLines={1}>
            {phase === "found" ? (cpuProfile?.name ?? "CPU") : "???"}
          </Text>
        </Animated.View>
      </View>

      {/* CPU stats – shown after found */}
      {cpuProfile && phase === "found" && (
        <Animated.View style={[styles.cpuStatsRow, { opacity: foundScale }]}>
          <Ionicons name="trophy" size={12} color={Colors.gold} />
          <Text style={styles.cpuStatsTxt}>
            Nv.{cpuProfile.level} · {cpuProfile.name}
          </Text>
        </Animated.View>
      )}

      {/* Bottom searching status */}
      {phase === "searching" && (
        <View style={styles.searchStatus}>
          <Text style={styles.searchStatusTxt}>{T("searchingWorld")}</Text>
          <View style={styles.searchDots}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.3 }]} />
            ))}
          </View>
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
    top: "18%", left: 24, right: 24, bottom: "18%",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.07)",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 40,
  },
  statusText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
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
    gap: 16,
    paddingHorizontal: 16,
  },
  playerCard: {
    alignItems: "center",
    gap: 8,
    width: 104,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: Colors.gold + "55",
  },
  avatarRingActive: {
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
  },
  avatarRingCpu: {
    borderColor: "#E74C3C55",
  },
  avatarRingCpuActive: {
    borderColor: "#E74C3C",
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
  },
  searchSlot: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d1f12",
    overflow: "visible",
  },
  radarRing: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: Colors.gold + "66",
  },
  questionWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.gold + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  questionMark: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 34,
    color: Colors.gold,
    lineHeight: 40,
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
    maxWidth: 100,
  },
  vsBadge: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  vsGrad: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  vsGlow: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
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
    marginTop: 24,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cpuStatsTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: Colors.textMuted,
  },
  searchStatus: {
    marginTop: 32,
    alignItems: "center",
    gap: 8,
  },
  searchStatusTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: Colors.textDim,
    letterSpacing: 0.5,
  },
  searchDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
});
