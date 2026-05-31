---
name: Native-only RN modules break the web/Expo Go bundle
description: Why native-only React Native packages must be isolated behind a platform-split file, not just a runtime guard.
---

# Native-only RN modules and the Metro web bundle

A runtime guard (e.g. `if (executionEnvironment !== "storeClient") return null`) around a
`require("native-pkg")` is NOT enough to keep a native-only module out of the web bundle.
Metro statically resolves every `import`/`require` it sees at bundle time regardless of the
guard, so the package's internal native-only files get pulled into the web (and Expo Go web)
bundle and fail to resolve — breaking the preview entirely.

**Symptom:** `Unable to resolve "./internal/<SomeNativeFile>" from node_modules/<native-pkg>/...`
when bundling for web, with the import stack tracing back through your own lib file.

**Fix:** Platform-split the access point into two files Metro resolves by platform:
- `xBridge.ts` (base, used for native/iOS/Android) — does the lazy guarded `require(...)`.
- `xBridge.web.ts` — a stub that returns null so callers fall back to a web-safe path.
Consumers import from `./xBridge`; Metro picks `.web.ts` on web (no native pkg in bundle)
and the base `.ts` on native. `tsc` resolves the base `.ts`, so types stay accurate.

**Why:** Encountered with `react-native-google-mobile-ads` (AdMob) on Expo SDK 54. The
native SDK only works in a real dev/prod build; Expo Go and web must use a simulation path.

**How to apply:** Any time you add a native-only RN library that must coexist with the
Expo Go / web preview, route all SDK access through a `*.web.ts` / `*.ts` bridge pair.
Verify by forcing a web bundle and confirming zero "Unable to resolve" errors.
