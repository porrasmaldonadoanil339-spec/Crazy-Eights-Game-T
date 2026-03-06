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
- **Internationalization (i18n)**: `lib/i18n.ts` for 22+ language translations, `hooks/useT.ts` for language selection from ProfileContext. `lib/achTranslations.ts` handles localized achievement, emote, mode, and difficulty descriptions. Language detection with fallback to Spanish. Language selector in `app/settings.tsx`. **Game Engine i18n**: `lib/gameEngine.ts` exports `setEngineLang(lang)`, `gm(key, vars)`, and `suitName(suit)` which are all language-aware. All in-game messages (CPU plays, suit names, draw messages, win messages) are fully translated into 22 languages via the GM table in gameEngine.ts. `game.tsx` calls `setEngineLang(profile.language)` via useEffect. `lib/multiplayerEngine.ts` imports and uses `gm()` for all its messages too.
- **Theming**: `hooks/useTheme.ts` dynamically applies `DarkColors` or `LightColors` from `constants/colors.ts` based on `profile.darkMode` setting. The UI adopts a dark casino theme (felt-green with gold accents) with a corresponding light mode.
- **Core Game Logic**: `lib/gameEngine.ts` implements all card game mechanics, including special card effects (2, 3, 7, 8, 10, J, Joker) and AI strategies tailored across five difficulty levels (Easy to Expert).
- **Multiplayer**: Supports local pass-device multiplayer (`game-multi.tsx`) and simulated online multiplayer (`game-online.tsx`) with CPU profiles acting as rivals.
- **Animation**: Utilizes Reanimated for shuffle and deal animations, and Animated Views for particle effects and UI banners.
- **Store System**: Features 8 categories: card_back (90), avatar, frame, title, effect, emote, table_design (90), card_design (90). Total: 500+ store items. Card designs change face appearance in game. Table designs change game table background. `getCardDesignById()` and `getTableDesignById()` in `lib/storeItems.ts`. `ProfileContext` holds `cardDesignId` and `tableDesignId`. Store tabs: Dorso, Cartas, Mesas, Avatar, Marco, Título, Efecto, Emotes.
- **Battle Pass & Achievements**: An 800-tier battle pass and 981 achievements. Achievements screen has 2 tabs ONLY: Logros + Pase de Batalla (Clasificatoria REMOVED from achievements).
- **Audio System**: Manages background music and 18 distinct sound effects using `expo-audio`, with route-based music switching and settings synchronization.
- **Splash Screen**: Epic Clash of Clans style splash (5 seconds). Logo 240x240, pulsating golden glow, "BIYIS PRIME STUDIOS" in gold, "PRESENTA" subtitle, "OCHO LOCOS" title, gold separator, floating gold particles, "Versión 1.0" footer. Dark gradient bg. Implemented in `app/_layout.tsx`.
- **Seasons System**: `lib/seasons.ts` — 30-day competitive seasons. Season 1 "Hierro y Fuego" starts 2026-03-01. Tiered rewards (500–12,000 coins) by rank at season end.
- **Ranked/Clasificatoria**: `app/ranked.tsx` with 10,000 deterministic players (seeded generation, FlatList pagination - 50 per load). Season banner, countdown, rewards modal. LOCKED until player level 5. Profile card shown at top. Gold/silver/bronze colors for top 3.
- **Game Modes**: Coop - player+ally CPU vs 2 rival CPUs with "ALIADO" badge UI. Challenge - HUD with progress bar. Practice - hint overlay, AI always difficulty 0. Card and table designs applied in game.
- **i18n**: 7 languages (ES/EN/PT/FR/DE/IT/TR). All texts connected to translation system including "Amigos" button, profile screen labels, store categories (categoryCardDesigns, categoryTableDesigns).
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