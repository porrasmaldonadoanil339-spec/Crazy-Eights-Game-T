// Web build: the native AdMob SDK (react-native-google-mobile-ads) has no web
// implementation, so it must never be pulled into the web bundle. Returning null
// makes lib/ads.ts fall back to its simulated rewarded-ad flow on web.
export type GmaModule = any;

export function loadNativeGma(): GmaModule | null {
  return null;
}
