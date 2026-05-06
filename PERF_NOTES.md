# Performance Pass Notes — Task #69

## Scope (per task brief)

> 60 FPS mid-tier Android, faster cold-start, no console.logs in prod,
> big lists with FlatList virtualization, memoize heavy components,
> Reanimated worklets, no orphan timers.
> Out of scope: visual redesign, engine changes, large refactor.

## Measurement context

This is an Expo Go project; there is no on-device profiler wired in
(no Flipper, no native FPS overlay). Validation is therefore
**structural** — fewer renders, smaller render windows, lower
algorithmic complexity, fewer leaked timers — rather than a numeric
FPS report. A device-side FPS pass would require an EAS dev-client
build, which is out of scope.

## Hot-path changes

### `app/(tabs)/achievements.tsx` (981 items — biggest win)
- ScrollView+`.map()` → virtualized `FlatList`
  (`windowSize=7`, `initialNumToRender=10`, `maxToRenderPerBatch=10`,
  `removeClippedSubviews` on native).
- Per-row progress lookup was `profile.achievementProgress.find(...)`
  inside `.map()` → O(N²). Now built once per profile change as
  `Map<id, progress>` → O(N) build, O(1) lookup.
- `useMemo` sortedAchievements; `useCallback` renderAchievement and
  keyExtractor.
- BP tab ScrollView: added `removeClippedSubviews` (native).
- Note: `getItemLayout` not added — row height varies (progress bar
  shown only when not unlocked, claim button only when unlocked).
  Forcing a fixed height here would clip content on some rows.

### `app/(tabs)/collection.tsx`
- `renderItem` and `keyExtractor` wrapped in `useCallback`.
- FlatList tuned: `initialNumToRender=20`, `maxToRenderPerBatch=20`,
  `windowSize=5`, `removeClippedSubviews` on native.

### `app/(tabs)/store.tsx`
- `DailyShopCard` and `EmoteShopCard` wrapped in `React.memo` so item
  rows skip re-render when only parent state (toasts, modals,
  currency badges, timer countdown) changes.
- `DailyShopCard` API refactored: parent now passes stable
  `onConfirm/onEquip/onInfo` setters instead of inline closures
  re-created on every render. Internal `handlePress/handleEquip/
  handleInfo` are wrapped in `useCallback`, so `React.memo` actually
  bails out instead of always re-rendering on prop identity churn.
- Main store ScrollView: added `removeClippedSubviews` (native).

### `app/game.tsx` (in-match hot path)
- Fixed orphan `setTimeout` in the AI emote effect — previously
  created an unreferenced `timeoutId` plus a nested `setTimeout`
  that could fire after the effect re-ran or the screen unmounted.
  Both timers are now tracked and cleared in the effect's cleanup.

### `app/game-online.tsx`
- `CpuZone` wrapped in `React.memo` — rendered up to 5× per online
  match; previously re-rendered on every parent state change
  (every card play, draw, animation tick).

### `server/index.ts`
- Dev `log = console.log` alias is now a no-op when
  `NODE_ENV === "production"`. Mobile-app prod paths already had
  zero `console.log/info/debug` (audited via `rg`); only legitimate
  `console.error` remains in two error handlers
  (`server/index.ts` express middleware and `lib/challenges.ts`
  catch block).

## Audited and intentionally unchanged

- **Other big lists** (`ranking`, `ranked`, `online-lobby` search,
  index grid) already use `FlatList`.
- **BP tier list** (800 tiers) — now virtualized with `FlatList`
  (`initialNumToRender=8`, `maxToRenderPerBatch=8`, `windowSize=5`,
  `removeClippedSubviews` on native). Header content moved into
  `ListHeaderComponent`. `renderBpTier` and `bpKeyExtractor` are
  memoized via `useCallback` so row identity is stable across
  unrelated parent re-renders (toasts, reward popups, tab switch).
- **Timers** — every `setInterval` in `game.tsx` and
  `game-online.tsx` is held in a ref and cleared on unmount or
  effect re-run. Only the one nested `setTimeout` above was orphaned.
- **Reanimated worklets** — existing animations already run on the
  UI thread (`useSharedValue` + `useAnimatedStyle`). No JS-thread
  Animated.timing in card mechanics.
- **Assets** — `assets/sounds` 247 MB is the dominant size, but
  this is intentional (music tracks, SFX library) and re-encoding
  is a content decision, not a code change. Out of scope per brief.

## Verification

- `npx tsc --noEmit` clean.
- Both workflows running.
- Web bundle builds without warnings.
