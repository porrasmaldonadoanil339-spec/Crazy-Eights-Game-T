import { loadNativeGma, type GmaModule } from "./admobBridge";

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
// `react-native-google-mobile-ads` is a NATIVE module. It only runs in a custom
// development/production build (Expo Launch / expo-dev-client), NOT inside Expo
// Go (Replit's live preview) or on web. To keep the Expo Go preview working we
// load the SDK lazily behind a runtime guard: when the native module is present
// we serve real AdMob rewarded ads; otherwise we fall back to a faithful
// SIMULATION of the rewarded-ad lifecycle so every business rule (daily limits,
// reward granting on EARNED_REWARD, ranked-star rescue) stays testable.
//
// Test Mode (AD_TEST_MODE) uses Google's official test ad unit, so real builds
// can be verified safely before flipping to live revenue.
// ──────────────────────────────────────────────────────────────────────────────

// The native SDK is loaded via a platform-resolved bridge (admobBridge.ts on
// native, admobBridge.web.ts on web) so it is never bundled for web. The bridge
// returns null in Expo Go / web, which routes callers to the simulator below.
let initPromise: Promise<void> | null = null;
function ensureInitialized(mod: GmaModule): Promise<void> {
  if (!initPromise) {
    initPromise = mod
      .default()
      .initialize()
      .then(() => undefined)
      .catch(() => undefined);
  }
  return initPromise;
}

const SIMULATED_AD_DURATION_MS = 600;

// Current preloaded native rewarded ad + its readiness flag.
let rewardedAd: ReturnType<GmaModule["RewardedAd"]["createForAdRequest"]> | null = null;
let rewardedLoaded = false;
let loadSubs: Array<() => void> = [];
// Simulator-only "preloaded" flag so the simulated path mirrors the real one.
let simulatedPreloaded = false;

function clearLoadSubs() {
  loadSubs.forEach((u) => {
    try {
      u();
    } catch {
      // ignore
    }
  });
  loadSubs = [];
}

/**
 * Preloads a rewarded ad so `showRewardedAd` can display instantly.
 * Real builds create + load() a RewardedAd; the simulator just flags readiness.
 */
export async function loadRewardedAd(): Promise<void> {
  const mod = loadNativeGma();
  if (!mod) {
    simulatedPreloaded = true;
    return;
  }
  await ensureInitialized(mod);
  const { RewardedAd, RewardedAdEventType, AdEventType } = mod;

  // Discard any stale instance/listeners before creating a fresh request.
  clearLoadSubs();
  rewardedLoaded = false;
  rewardedAd = RewardedAd.createForAdRequest(getActiveRewardedAdUnitId(), {
    requestNonPersonalizedAdsOnly: true,
  });

  await new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    loadSubs.push(
      rewardedAd!.addAdEventListener(RewardedAdEventType.LOADED, () => {
        rewardedLoaded = true;
        done();
      })
    );
    loadSubs.push(
      rewardedAd!.addAdEventListener(AdEventType.ERROR, () => {
        rewardedLoaded = false;
        done();
      })
    );
    try {
      rewardedAd!.load();
    } catch {
      done();
    }
  });
}

/**
 * Shows a rewarded ad and resolves once the lifecycle completes.
 * `earned` is true only when the user earned the reward (EARNED_REWARD).
 *
 * In Expo Go / web this resolves `{ earned: true, simulated: true }` after a
 * short delay so the calling screen can present its own "watching" UI.
 */
export async function showRewardedAd(): Promise<RewardedAdResult> {
  const mod = loadNativeGma();
  if (!mod) {
    // Expo Go / web: simulate a completed rewarded view.
    if (!simulatedPreloaded) {
      await loadRewardedAd();
    }
    simulatedPreloaded = false;
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_AD_DURATION_MS));
    return { earned: true, simulated: true };
  }

  await ensureInitialized(mod);
  const { RewardedAdEventType, AdEventType } = mod;

  if (!rewardedAd || !rewardedLoaded) {
    await loadRewardedAd();
  }
  if (!rewardedAd || !rewardedLoaded) {
    return { earned: false, error: "ad_load_failed" };
  }

  const ad = rewardedAd;
  return new Promise<RewardedAdResult>((resolve) => {
    let earned = false;
    let settled = false;
    const subs: Array<() => void> = [];
    const cleanup = () => {
      subs.forEach((u) => {
        try {
          u();
        } catch {
          // ignore
        }
      });
      clearLoadSubs();
      rewardedAd = null;
      rewardedLoaded = false;
    };
    const finish = (result: RewardedAdResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    subs.push(
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      })
    );
    subs.push(
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        finish({ earned });
      })
    );
    subs.push(
      ad.addAdEventListener(AdEventType.ERROR, () => {
        finish({ earned: false, error: "ad_show_failed" });
      })
    );
    try {
      ad.show();
    } catch {
      finish({ earned: false, error: "ad_show_failed" });
    }
  });
}

/** Whether real (native) AdMob is wired up. False in Expo Go / web. */
export function isNativeAdsAvailable(): boolean {
  return !!loadNativeGma();
}
