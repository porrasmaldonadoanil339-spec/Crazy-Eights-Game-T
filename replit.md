# Ocho Locos

Ocho Locos is a mobile card game offering extensive single-player and multiplayer (local & online) experiences with deep customization and progression systems.

## Run & Operate

*   **Run Frontend**: `npx expo start`
*   **Run Backend**: `npm start` (from `server` directory)
*   **Build Frontend**: `npx expo prebuild`
*   **Typecheck**: `npx tsc --noEmit`
*   **i18n Shop Export**: `npx tsx scripts/i18n-shop-export.ts [langs...]`
*   **i18n Shop Import**: `npx tsx scripts/i18n-shop-import.ts [langs...]`
*   **Seed Demo Account**: `scripts/seed-demo-account.sh`
*   **Env Vars**: `NODE_ENV`, `DEV_SEED_ENABLED`, `API_URL`, `AUTH_TOKEN`

## Stack

*   **Frontend**: Expo (React Native), Expo Router, React Context, AsyncStorage, Reanimated
*   **Backend**: Express.js, Socket.IO
*   **Runtime**: Node.js
*   **Styling**: React Native StyleSheet
*   **Fonts**: Nunito (@expo-google-fonts/nunito)
*   **Icons**: @expo/vector-icons (Ionicons)
*   **i18n**: Custom system (`lib/i18n.ts`)

## Where things live

*   **Frontend Entry**: `app/_layout.tsx`
*   **Backend Entry**: `server/index.ts`
*   **Core Game Logic**: `lib/gameEngine.ts`
*   **Online Multiplayer Logic**: `lib/onlineSocket.ts`, `server/rooms.ts`
*   **i18n Translations**: `lib/i18n.ts`, `lib/achTranslations.ts`, `lib/storeItems.ts` (ITEM_TL section)
*   **Theming/Colors**: `constants/colors.ts`, `hooks/useTheme.ts`
*   **DB Schema (Backend "DB")**: `/tmp/ocho_users.json`, `/tmp/ocho_reset_tokens.json`, `/tmp/ocho_profiles.json`
*   **API Contracts**: Defined implicitly by routes in `server/src/routes/auth.ts` and Socket.IO events in `server/rooms.ts`

## Architecture decisions

*   **Frontend-heavy Logic**: All core game logic (card mechanics, AI) runs client-side for responsiveness and offline play; backend is primarily for authentication, profile cloud saves, and real-time multiplayer coordination.
*   **Deterministic Rival Generation**: Rivals are procedurally generated and deterministic by index, ensuring consistency across player experiences without requiring a backend database.
*   **Comprehensive i18n Strategy**: Game features 22-language support, with a multi-level fallback system and dedicated tools for shop item translation reviews, covering both static UI and dynamic game messages.
*   **Cloud Save Logic**: Authenticated user profiles are "cloud-saved" via a fire-and-forget POST on changes, and merged on app startup with server data winning for critical metrics (coins/XP/stats).
*   **Audio Management**: A single, global AudioManager in the root layout controls all music transitions based on navigation, preventing concurrent audio events.

## Product

*   7 distinct game modes, including Practice, Classic, Lightning, Tournament, Challenge, Ranked, and Coop.
*   Local and online multiplayer for 2-6 players, with CPU opponents filling online gaps.
*   Customizable store with 500+ items (card backs, avatars, frames, titles, effects, emotes, table designs, card designs).
*   981 achievements and an 800-tier battle pass.
*   Daily rewards and a competitive season system with tiered rank rewards.
*   Player avatar customization and emote system.
*   Full 22-language internationalization (i18n) support.
*   Light/Dark mode theming.
*   Google/Facebook/Guest authentication, with an email-based login/registration fallback.

## User preferences

Preferred communication style: Simple, everyday language.
No emojis in UI or code. Use @expo/vector-icons (Ionicons) for all icons.
"OCHO LOCOS" brand name NEVER translates.

## Gotchas

*   **Cloud Profile Refresh**: After using `/api/auth/dev-seed`, the app must be fully relaunched (killed and reopened) for seeded profile changes to reflect, as the in-memory profile needs to re-fetch from the server.
*   **`Nunito_800ExtraBold`**: Always use `Nunito_800ExtraBold`; `Nunito_900ExtraBold` does not exist.
*   **Audio Transitions**: Only `_layout.tsx` should trigger music transitions (`startMenuMusic()`, `startGameMusic()`); game screens should only call `stopMusic()` on game-over.
*   **Ranked Mode Lock**: Ranked mode is locked until the player reaches level 5.

## Pointers

*   **Expo Documentation**: https://docs.expo.dev/
*   **React Native Documentation**: https://reactnative.dev/docs/getting-started
*   **Express.js Documentation**: https://expressjs.com/
*   **Socket.IO Documentation**: https://socket.io/docs/
*   **React Navigation / Expo Router**: https://expo.github.io/router/docs/
*   **Reanimated Documentation**: https://docs.swmansion.com/react-native-reanimated/