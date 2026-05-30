import { Platform } from "react-native";

// ─── AdMob configuration ──────────────────────────────────────────────────────
// Real production identifiers provided for OCHO LOCOS.
export const ADMOB_APP_ID = "ca-app-pub-6557640591803618~8666845152";
export const REWARDED_AD_UNIT_ID = "ca-app-pub-6557640591803618/2345280701";

// Google's official sample/test rewarded ad unit. Always safe to request and
// never generates invalid traffic. Used while AD_TEST_MODE is true.
export const TEST_REWARDED_AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

// Per the integration request we start in Test Mode. Flip this to false (after
// a production build is verified) to serve live ads with real revenue.
export const AD_TEST_MODE = true;

// Daily caps per user (reset every day).
export const FREE_VIDEOS_DAILY_LIMIT = 5;
export const RANKED_RESCUE_DAILY_LIMIT = 3;

export function getActiveRewardedAdUnitId(): string {
  return AD_TEST_MODE ? TEST_REWARDED_AD_UNIT_ID : REWARDED_AD_UNIT_ID;
}

export type RewardedAdResult = {
  /** True only when the user watched long enough to earn the reward. */
  earned: boolean;
  /** True when served by the in-app simulator (Expo Go / web) instead of AdMob. */
  simulated?: boolean;
  error?: string;
};

// ──────────────────────────────────────────────────────────────────────────────
// AdMob native bridge
//
// `react-native-google-mobile-ads` is a NATIVE module: it requires a custom
// development/production build and does NOT run inside Expo Go (Replit's live
// preview). Because of that the SDK is intentionally NOT imported here — doing
// so would break Metro bundling for the Expo Go preview.
//
// The functions below run a faithful SIMULATION of the rewarded-ad lifecycle so
// all business rules (daily limits, reward granting on `onUserEarnedReward`,
// ranked-star rescue) are fully testable today.
//
// TO ENABLE REAL ADS once you create a development build:
//   1) Install the package via the package manager (do not edit package.json by
//      hand): `react-native-google-mobile-ads`.
//   2) Add the plugin + App ID to app.json:
//        ["react-native-google-mobile-ads", { "androidAppId": ADMOB_APP_ID,
//                                             "iosAppId": ADMOB_APP_ID }]
//   3) Replace the bodies of `loadRewardedAd` / `showRewardedAd` with the real
//      implementation outlined below:
//
//      import mobileAds, { RewardedAd, RewardedAdEventType, AdEventType }
//        from "react-native-google-mobile-ads";
//      // call mobileAds().initialize() once at app start.
//      const ad = RewardedAd.createForAdRequest(getActiveRewardedAdUnitId());
//      ad.addAdEventListener(RewardedAdEventType.LOADED, ...);
//      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => earned = true);
//      ad.load(); ... ad.show();
// ──────────────────────────────────────────────────────────────────────────────

const SIMULATED_AD_DURATION_MS = 600;

let preloaded = false;

/**
 * Preloads a rewarded ad so `showRewardedAd` can display instantly.
 * No-op in the simulator; with native AdMob this triggers `ad.load()`.
 */
export async function loadRewardedAd(): Promise<void> {
  // Simulated preload: mark ready. Real impl would create + load() the RewardedAd.
  preloaded = true;
}

/**
 * Shows a rewarded ad and resolves once the lifecycle completes.
 * `earned` is true only when the user earned the reward (onUserEarnedReward).
 *
 * In Expo Go / web this resolves `{ earned: true, simulated: true }` after a
 * short delay so the calling screen can present its own "watching" UI.
 */
export async function showRewardedAd(): Promise<RewardedAdResult> {
  if (!preloaded) {
    await loadRewardedAd();
  }
  preloaded = false;

  // Web + Expo Go: simulate a completed rewarded view.
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_AD_DURATION_MS));
  return { earned: true, simulated: true };
}

/** Whether real (native) AdMob is wired up. False in Expo Go / web today. */
export function isNativeAdsAvailable(): boolean {
  // Becomes true once the native module is installed in a dev/prod build.
  return false && Platform.OS !== "web";
}
