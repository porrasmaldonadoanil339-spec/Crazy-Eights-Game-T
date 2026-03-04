import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { GameProvider } from "@/context/GameContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { AuthProvider } from "@/context/AuthContext";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_800ExtraBold as Nunito_900ExtraBold_Asset,
} from "@expo-google-fonts/nunito";
import { StatusBar } from "expo-status-bar";
import { initAudio, preloadSounds, startMenuMusic, startGameMusic, stopMusic, syncSettings } from "@/lib/audioManager";
import { useProfile } from "@/context/ProfileContext";

SplashScreen.preventAutoHideAsync();

function AudioManager() {
  const segments = useSegments();
  const isFirstRun = useRef(true);
  const { profile, isLoaded } = useProfile();

  useEffect(() => {
    if (!isLoaded) return;
    initAudio().then(() => {
      syncSettings(profile.musicEnabled, profile.sfxEnabled);
      preloadSounds().catch(() => {});
      const inGame = (segments as string[]).includes("game");
      if (inGame) {
        startGameMusic().catch(() => {});
      } else {
        startMenuMusic().catch(() => {});
      }
    });
    return () => { stopMusic().catch(() => {}); };
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    syncSettings(profile.musicEnabled, profile.sfxEnabled);
  }, [profile.musicEnabled, profile.sfxEnabled, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (isFirstRun.current) { isFirstRun.current = false; return; }
    const inGame = (segments as string[]).includes("game");
    if (inGame) {
      startGameMusic().catch(() => {});
    } else {
      startMenuMusic().catch(() => {});
    }
  }, [segments.join(","), isLoaded]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <AudioManager />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="game" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="game-multi" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="game-online" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="tutorial" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="rules" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="ranking" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="friends" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="login" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_900ExtraBold: Nunito_900ExtraBold_Asset,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <AuthProvider>
            <ProfileProvider>
              <GameProvider>
                <StatusBar style="light" />
                <RootLayoutNav />
              </GameProvider>
            </ProfileProvider>
            </AuthProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
