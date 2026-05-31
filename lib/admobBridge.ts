import { Platform } from "react-native";
import Constants from "expo-constants";

// Native (iOS/Android) bridge to the AdMob SDK. Metro resolves this file for
// native platforms and `admobBridge.web.ts` for web, so the native-only SDK is
// never bundled for web (where its internal modules cannot resolve).
export type GmaModule = typeof import("react-native-google-mobile-ads");

// Expo Go reports executionEnvironment === "storeClient"; real dev/prod builds
// (expo-dev-client / Expo Launch) report "standalone" or "bare". The native
// AdMob module only exists in a real build, never in Expo Go.
const isExpoGo = Constants.executionEnvironment === "storeClient";
const canUseNative = Platform.OS !== "web" && !isExpoGo;

let gma: GmaModule | null = null;
let attempted = false;

/**
 * Lazily loads the native AdMob SDK. Returns null in Expo Go / web so callers
 * fall back to the simulator. The `require` is only evaluated inside a real
 * native build, so it can never crash the Expo Go preview at runtime.
 */
export function loadNativeGma(): GmaModule | null {
  if (attempted) return gma;
  attempted = true;
  if (!canUseNative) return null;
  try {
    gma = require("react-native-google-mobile-ads") as GmaModule;
  } catch {
    gma = null;
  }
  return gma;
}
