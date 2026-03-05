# Ocho Locos — replit.md

## Overview

**Ocho Locos** is a mobile card game app — a Spanish-language version of the classic "Crazy Eights" card game. Built with **Expo (React Native)** for the mobile frontend and **Express.js** for the backend. The app supports 6 game modes, local + online multiplayer, a store with 420+ items (70 per category + 70 emotes), 981 achievements, 800-tier battle pass, daily rewards, watch-ads-for-coins (5/day, +50 each), emote system (70 emotes, equip up to 8), avatar frames, profile photos, 3-language switcher (ES/EN/PT-BR), swipe tab navigation, light/dark mode, and a world ranking screen. All game logic runs fully on-device; the backend serves as API scaffold + static asset server.

**Latest features** (current session):
- **Google/Facebook OAuth**: Full in-app linking modal — email step → password step → success confirmation → navigates to main app. Stores linked email in ProfileContext (`profile.linkedGoogle` / `profile.linkedFacebook`) persisted to AsyncStorage.
- **Global friend requests**: `ProfileContext` now has `pendingOutgoingRequests` array + `addOutgoingFriendRequest` / `removeOutgoingFriendRequest` methods. Ranking screen writes to it on "Add Friend"; Friends screen reads it on mount and auto-resolves (70% accept after 3-8s delay) with toast notifications.
- **i18n Win/Lose messages**: `game.tsx` EndModal now uses T() keys (`winMsg0-6`, `loseMsg0-5`) instead of hardcoded Spanish arrays; 13 new keys in i18n.ts (EN+PT).
- **i18n In-game hints**: Joker/8Loco card hints in game.tsx now use T() keys (`crazy8Hint`, `jokerChooseSuitHint`, `jokerAddStackHint`, `tapToPlay`) — all 3 languages.
- **Light mode fix**: index.tsx modal close icon changed from `Colors.textMuted` to `theme.textMuted`.
- **Previous sessions**: Light mode text overrides ✓ | i18n Store localizeItem ✓ | Friends chat/typing indicator ✓ | 981 achievements ✓ | 800 BP tiers ✓ | Room codes ✓ | Sound events ✓ | Deal animation ✓ | Friend invite → auto-game ✓

Targets iOS, Android, and Web (via Expo + React Native Web). Dark casino-themed UI: felt-green (`#0a1a0f`) background, gold (`#D4AF37`) accents, Nunito fonts.

---

## User Preferences

Preferred communication style: Simple, everyday language.
No emojis in UI or code. Use @expo/vector-icons (Ionicons) for all icons.
"OCHO LOCOS" brand name NEVER translates.

---

## System Architecture

### Frontend (Expo / React Native)
- **Routing**: Expo Router (file-based). Root layout at `app/_layout.tsx`, tabs at `app/(tabs)/`
- **State**: React Context for profile + game state, AsyncStorage for persistence
- **Styling**: `StyleSheet` only, no external CSS/styled-components
- **Fonts**: Nunito (400Regular, 700Bold, 900ExtraBold) from `@expo-google-fonts/nunito`
- **Storage key**: `"ocho_profile_v3"` in AsyncStorage
- **i18n**: `lib/i18n.ts` with ES/EN/PT keys; `hooks/useT.ts` hook reads language from ProfileContext
- **achTranslations**: `lib/achTranslations.ts` — all 114 achievement titles+descriptions, 8 emote labels, 6 mode names+descriptions, 5 difficulty names+descriptions in ES/EN/PT; exports: `achTitle()`, `achDesc()`, `emoteLabel()`, `modeName()`, `modeDesc()`, `diffName()`, `diffDesc()`
- **Theme**: `hooks/useTheme.ts` returns `DarkColors` or `LightColors` from `constants/colors.ts` based on `profile.darkMode`; achievements.tsx and profile.tsx now use inline theme overrides for full light-mode support

### Backend (Express.js)
- Runs on port 5000
- Minimal API scaffold + serves `server/templates/landing-page.html`
- No database currently needed (all game data stored on-device)

---

## Project Structure

```
app/
  _layout.tsx           ← Root layout (providers: Query, Gesture, Keyboard, Profile, Game; AudioManager)
  (tabs)/
    _layout.tsx         ← Tab bar with useT() for runtime language switching (Jugar/Play/Jogar etc.)
    index.tsx           ← Play screen: mode selection, stats, quick start (fully i18n + light/dark)
    achievements.tsx    ← Achievements + Battle Pass screens (100 achievements, 100-tier BP)
    store.tsx           ← Item shop (70 items × 5 categories; rarity labels translated)
    profile.tsx         ← Player profile, stats, avatar/title picker (multiplayer stats included)
  game.tsx              ← Main game screen; DealAnimation receives player's backColors+backAccent
  game-multi.tsx        ← Local multiplayer game (pass-device flow; fully i18n)
  game-online.tsx       ← Online multiplayer (simulated lobby + game; fully i18n; 100 CPU profiles with photos)
  tutorial.tsx          ← Interactive step-by-step tutorial (8 steps)
  rules.tsx             ← Static rules reference
  settings.tsx          ← Settings (audio, language ES/EN/PT, dark/light mode toggle, reset)

components/
  PlayingCard.tsx       ← Card component (faceUp/faceDown, sizes sm/md/lg)
  DealAnimation.tsx     ← Shuffle + deal animation overlay (Reanimated)
  AvatarDisplay.tsx     ← Avatar icon or photo with gradient frame ring
  ErrorBoundary.tsx     ← Error boundary with reload

context/
  ProfileContext.tsx    ← Player profile, coins, XP, stats (incl. localMulti/onlineMulti), achievements progress
  GameContext.tsx       ← Game state machine, session tracking

lib/
  gameEngine.ts         ← Core game logic (deck, hands, play/draw/AI turns, special cards 2/3/7/10/J/Joker)
  gameModes.ts          ← 6 modes × 5 difficulties (easy/normal/intermediate/hard/expert)
  achievements.ts       ← 114 achievement definitions (common/rare/epic/legendary)
  storeItems.ts         ← 350 store items (70 each: card backs, avatars, frames, titles, effects)
  battlePass.ts         ← 100-tier battle pass, XP/level helpers (XP_FOR_LEVEL, getPlayerLevel, etc.)
  cpuProfiles.ts        ← 12 CPU player profiles with avatar/name/level/title
  audioManager.ts       ← Audio system using expo-audio: music + SFX + haptics
  sounds.ts             ← SoundEvent dispatcher with 18 events (wraps audioManager)
  i18n.ts               ← All UI translations (ES/EN/PT) — 260+ keys
  query-client.ts       ← React Query client + API URL helper

hooks/
  useT.ts               ← Translation hook; reads profile.language from context
  useTheme.ts           ← Returns DarkColors or LightColors based on profile.darkMode
  useSwipeTabs.ts       ← Swipe gesture handlers for tab navigation

constants/
  colors.ts             ← DarkColors + LightColors (both exported); Colors = DarkColors (legacy)

assets/sounds/
  card-flip.wav, card-draw.wav, shuffle.wav, win.wav, lose.wav, button.wav, wild.wav
  menu-music.wav (8-bar jazz loop), game-music.wav (tense minor loop)
```

---

## Game Modes

| Mode        | Cards | Notes                             |
|-------------|-------|-----------------------------------|
| Clásico     | 8     | Standard game with difficulty     |
| Relámpago   | 5     | Fast mode                         |
| Torneo      | 8     | Best of 3 rounds                  |
| Cooperativo | 7     | 2v2 (simulated ally)              |
| Desafíos    | 7     | Daily/weekly challenges           |
| Práctica    | 7     | No penalty, hints enabled         |

## Difficulties: Easy / Normal / Intermediate / Hard / Expert
- Expert difficulty: 8-second countdown timer per player turn (auto-draws on expiry)
- AI strategy: random (easy) → optimal suit matching (expert)
- Coin multipliers: 0.8x → 1.0x → 1.3x → 1.7x → 2.0x

## Special Cards (fully implemented in gameEngine.ts)
- 2: Draw 2 accumulative; counter with 2/Ace/Joker
- 3: Skip opponent's turn + extra turn
- 7: Draw 2 accumulative; counter with 7/Joker
- 8: Wild card; choose new active suit
- 10: Reverse direction (extra turn in 2-player)
- J: Repeat turn with same suit; CPU must play jSuit or 8/Joker
- Joker (rank 14): Wild like 8, or adds 5 to pendingDraw stack

---

## i18n System

- **3 languages**: Spanish (es), English (en), Portuguese Brazil (pt)
- **lib/i18n.ts**: 260+ translation keys, all 3 languages per key
- **hooks/useT.ts**: `useT()` hook returns `T(key)` function reading profile.language
- **Applied to**: All tabs, game screens, modals, settings, store, achievements, profile, multiplayer
- **"OCHO LOCOS"** brand name NEVER translates in any language

---

## Light/Dark Mode

- **constants/colors.ts**: `DarkColors` (casino felt dark) + `LightColors` (light green felt)
- **hooks/useTheme.ts**: returns correct palette based on `profile.darkMode !== false`
- **Toggle**: Settings screen → Display section → Dark Mode toggle
- **Applied to**: index.tsx, store.tsx, settings.tsx, game-online.tsx, game-multi.tsx

---

## Store System

- 5 categories: card_back, avatar, frame, title, effect
- **70 items per category = 350 total**
- Rarities: common / rare / epic / legendary
- Rarity labels fully translated (COMÚN/COMMON/COMUM etc.)
- Item "Obtained/Obtenido/Obtido" and "Free/Gratis/Grátis" labels translated
- Purchase modal: price, cancel, buy button all translated
- Category bar: horizontal ScrollView with `flexShrink: 0` to prevent clipping

---

## Battle Pass

- **100 tiers** with progressive XP requirements (Tier 1 = 0 XP, Tier 100 = 8,603,000 XP)
- Rewards: coins, card backs, avatars, frames, titles, effects
- Claimable from Achievements tab → Battle Pass sub-tab
- `getCurrentBattlePassTier(totalXp)` utility in battlePass.ts

---

## Achievements

- **116 achievement definitions** across rarities: common / rare / epic / legendary / hidden
- Categories: wins, modes, special cards, hands, coins, streaks, store, difficulty, social, multiplayer, XP, battle pass, language, theme, gameplay specifics
- Coin + XP rewards per achievement

---

## Audio System

- `initAudio()` + `preloadSounds()` called in `_layout.tsx` AudioManager component
- Music switches route-based via `useSegments`: menuMusic ↔ gameMusic
- Settings sync via `syncSettings(musicEnabled, sfxEnabled)`
- SFX: card_play, card_draw, card_wild, card_deal, shuffle, win, lose, button_press, achievement, purchase, error, turn_change, daily_reward, level_up, battle_pass_unlock, purchase_success, notification
- All audio calls wrapped in safe() try/catch; web audio autoplay gracefully handled

---

## Profile Stats

- `localMultiWins`, `localMultiGames`, `onlineMultiWins`, `onlineMultiGames` tracked in PlayerStats
- Profile screen shows multiplayer stats under BY MODE section

---

## Daily Rewards

- 7-day rotating cycle stored in ProfileContext
- Claimed once per day; modal auto-shows 1.5s after home screen loads
- `canClaimDailyReward` and `todaysDailyReward` exposed from useProfile()

---

## Multiplayer

### Local Multiplayer
- 2-4 players, pass-device UI with dark overlay between turns
- Oval table layout; face-down fans for opponents, face-up scrollable hand for current player
- Engine: `lib/multiplayerEngine.ts`

### Online Multiplayer (Simulated)
- Lobby: searching → players join → countdown → game
- CPU profiles act as real online rivals (flag emoji, level, win rate)
- Blue navy-themed table; CPU auto-plays after 1-2s delay
- `pass_device` phase auto-confirmed for ALL players (no manual device passing in online mode)
- 8/Joker cards: `multiPlayCard(gs, card)` → `choosing_suit` phase → SuitPicker → `multiChooseSuit(gs, suit)`
- Result overlay: translated "¡GANASTE!/YOU WON!/VOCÊ GANHOU!" or "DERROTA/DEFEAT"

---

## Key Design Decisions

- `RARITY_COLORS_MAP` defined locally in screens; rarity labels via `useRarityLabel()` hook in store.tsx
- Audio: expo-audio (not expo-av): `createAudioPlayer()` for SFX, `player.loop = true` for BGM
- Profile saved to AsyncStorage after every update
- Game phase starts as "playing" — deal animation is purely visual overlay
- AI turn runs with 800–1400ms delay to feel natural
- Tournament mode: 3 rounds, best of 2 wins

---

## Authentication System

- **Backend**: `server/auth.ts` — JWT-like token auth with PBKDF2 password hashing; users stored in `/tmp/ocho_users.json`
- **Endpoints**: `POST /api/auth/register`, `/login`, `/verify`, `/google`, `/facebook`
- **AuthContext**: `context/AuthContext.tsx` — manages user state, persists token to AsyncStorage
- **Login screen**: `app/login.tsx` — 3 modes: menu (Google/FB/Email options), register form, login form
- **Profile screen**: shows linked username + Salir button when authenticated; "Vincular Cuenta" when not
- **Google OAuth**: requires `EXPO_PUBLIC_GOOGLE_CLIENT_ID` in Replit Secrets; shows setup alert if missing
- **Facebook OAuth**: requires `EXPO_PUBLIC_FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET` in Replit Secrets
- **Guest mode**: plays locally, state saved to AsyncStorage under "ocho_profile_v3"
- **Packages added**: `expo-auth-session`, `expo-crypto@~15.0.0`

## Workflows

- **Start Backend**: `npm run server:dev` — Express on port 5000
- **Start Frontend**: `npm run expo:dev` — Expo Metro on port 8081

## Deploy

Backend + static site on port 5000. Mobile app via Expo Go (scan QR) or web build.
