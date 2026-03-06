# Ocho Locos

## Overview

Ocho Locos is a mobile card game application, a Spanish-language adaptation of "Crazy Eights," developed using Expo (React Native) for the frontend and Express.js for the backend. The game offers extensive features including 6 game modes, local and online multiplayer, a customizable store with over 420 items, 981 achievements, an 800-tier battle pass, daily rewards, and an emote system. The app also supports avatar customization, a 3-language switcher (ES/EN/PT-BR), swipe tab navigation, and light/dark mode. A key design principle is that all core game logic executes on-device, with the backend primarily serving as an API scaffold and static asset server. The project aims to deliver a "Free Fire-style epic update" experience, focusing on realistic social interactions (friend requests, chat), competitive rankings with distinct tiers, and an immersive UI with dramatic victory/defeat overlays and animated card play effects.

## User Preferences

Preferred communication style: Simple, everyday language.
No emojis in UI or code. Use @expo/vector-icons (Ionicons) for all icons.
"OCHO LOCOS" brand name NEVER translates.

## System Architecture

### Frontend (Expo / React Native)
- **Routing**: Expo Router (file-based) with root layout (`app/_layout.tsx`) and tab navigation (`app/(tabs)/`).
- **State Management**: React Context for profile and game states, with AsyncStorage for persistence.
- **Styling**: Exclusively uses React Native's `StyleSheet`.
- **Fonts**: Nunito (400Regular, 700Bold, 900ExtraBold) from `@expo-google-fonts/nunito`.
- **Internationalization (i18n)**: `lib/i18n.ts` for ES/EN/PT/FR/DE/IT/TR translations (7 languages), `hooks/useT.ts` for language selection from ProfileContext. `lib/achTranslations.ts` handles localized achievement, emote, mode, and difficulty descriptions. Language detection with fallback to Spanish. Language selector moved to `app/settings.tsx`.
- **Theming**: `hooks/useTheme.ts` dynamically applies `DarkColors` or `LightColors` from `constants/colors.ts` based on `profile.darkMode` setting. The UI adopts a dark casino theme (felt-green with gold accents) with a corresponding light mode.
- **Core Game Logic**: `lib/gameEngine.ts` implements all card game mechanics, including special card effects (2, 3, 7, 8, 10, J, Joker) and AI strategies tailored across five difficulty levels (Easy to Expert).
- **Multiplayer**: Supports local pass-device multiplayer (`game-multi.tsx`) and simulated online multiplayer (`game-online.tsx`) with CPU profiles acting as rivals.
- **Animation**: Utilizes Reanimated for shuffle and deal animations, and Animated Views for particle effects and UI banners.
- **Store System**: Features 6 categories (card_back, avatar, frame, title, effect, table_design). Card backs: 90 items. Table designs: 20 items. Total: 400+ store items with rarity levels and translated labels. New TABLE_DESIGNS array in `lib/storeItems.ts`.
- **Battle Pass & Achievements**: An 800-tier battle pass and 981 achievements with progressive XP requirements and coin/XP rewards.
- **Audio System**: Manages background music and 18 distinct sound effects using `expo-audio`, with route-based music switching and settings synchronization.
- **Splash Screen**: Custom in-app Biyis Prime Studios splash with logo animation (fade+spring scale, 2.5s), dark background, gold branding text, played once per session. Logo at `assets/images/biyis-logo.png`. Implemented in `app/_layout.tsx`.
- **Seasons System**: `lib/seasons.ts` — 30-day competitive seasons. Season 1 "Hierro y Fuego" starts 2026-03-01. Tiered rewards (500–12,000 coins) by rank at season end. `getCurrentSeason()` and `getSeasonRewardsForRank()` utilities.
- **Ranked/Clasificatoria**: Redesigned `app/ranked.tsx` with season banner, countdown, rewards modal, 50-player global leaderboard. LOCKED until player level 5 via level gate in `app/(tabs)/index.tsx`. Profile card shown at top of ranked screen.
- **Country Picker**: Fixed modal in `app/(tabs)/profile.tsx` with maxHeight:420, proper flex layout, and ScrollView for all 60+ countries across continents.

### Backend (Express.js)
- Runs on port 5000.
- Serves as a minimal API scaffold and static asset server, including `server/templates/landing-page.html`.
- No database is currently required as all game data is stored on-device.
- **Authentication System**: Features JWT-like token authentication with PBKDF2 password hashing. Supports user registration, login, and integrations for Google and Facebook OAuth. User data is stored in `/tmp/ocho_users.json`.

## External Dependencies

- **Expo / React Native**: Frontend framework.
- **Express.js**: Backend server.
- **@expo/vector-icons (Ionicons)**: For all in-app icons.
- **@expo-google-fonts/nunito**: Provides Nunito font variations.
- **AsyncStorage**: For on-device data persistence.
- **React Context**: For state management.
- **React Query**: For client-side data fetching and caching.
- **Reanimated**: For complex UI animations.
- **expo-audio**: For managing in-game sounds and music.
- **expo-auth-session**: For authentication flows.
- **expo-crypto**: For cryptographic functions in authentication.
- **NetInfo**: For network status detection.