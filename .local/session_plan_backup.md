# Objective
Mejorar Ocho Locos al 100% con todas las features pedidas:
1. Online game: animación de baraja/reparto de cartas antes de jugar
2. Amigos: invite → algunos aceptan y se abre partida automáticamente
3. Light mode: corregir textos/diseños invisibles en modo claro
4. Battle pass + efectos tienda: i18n completo
5. Google/Facebook login UI (simulado)
6. 800 logros y 800 misiones en battle pass
7. Códigos de sala para juego online
8. Efectos de sonido expandidos

# Tasks

### T001: Expandir logros a 800
- **Blocked By**: []
- **Details**:
  - Leer lib/achievements.ts COMPLETO para ver estructura actual
  - Expandir el array ACHIEVEMENTS con entradas hasta ~800 total (actualmente ~116)
  - También expandir el tipo AchievementId con nuevos IDs
  - Categorías nuevas: victorias extra, racha de victorias, cartas especiales, nivel/XP altos, multijugador masivo, colección completa, tiempo jugado, audio/efectos, room codes, logros secretos
  - Cada logro: { id, title, description, icon, iconColor, rarity, target, coinsReward, xpReward }
  - Rareza: 40% common, 30% rare, 20% epic, 10% legendary
  - NO duplicar IDs existentes (revisar cuidadosamente el tipo ya definido)
  - También actualizar lib/achTranslations.ts con traducciones en/pt para todos los nuevos
  - Files: lib/achievements.ts, lib/achTranslations.ts

### T002: Expandir battle pass a 800 tiers
- **Blocked By**: []
- **Details**:
  - Leer lib/battlePass.ts COMPLETO para ver el último tier existente y la estructura
  - Añadir tiers desde donde termine el actual hasta el 800
  - Progresión de XP: incrementos de 150k-250k por tier en los niveles altos
  - Recompensas: coins progresivamente mayores (50k, 100k, 200k, 500k en últimos tiers), items, avatares únicos, marcos, efectos, títulos exclusivos
  - rewardValue strings únicos: "back_elite_350", "avatar_conqueror_400", etc.
  - rewardLabel en español (se traducen con getBPRewardLabel)
  - Mantener estructura TypeScript exacta
  - Files: lib/battlePass.ts

### T003: Light mode - corregir textos invisibles
- **Blocked By**: []
- **Details**:
  - Leer app/(tabs)/index.tsx COMPLETO
  - Problema: descripciones de modos de juego (modeDesc style) usan Colors.textMuted hardcoded en StyleSheet
  - Fix: en CADA lugar donde se use styles.modeDesc, styles.modeWR, styles.quickBtnText, etc., añadir inline { color: theme.textMuted } o { color: theme.text }
  - También: `dividerLine` usa Colors.border hardcoded en StyleSheet - añadir inline backgroundColor
  - También: las cards de modo de juego (modeCard) tienen border hardcoded
  - También: buscar `Colors.textMuted`, `Colors.border`, `Colors.text`, `Colors.surface` usados directamente en JSX (no en StyleSheet) y reemplazar con `theme.textMuted`, etc.
  - En los modales de multijugador (local/online): el fondo es siempre azul oscuro (fine, son modales propios)
  - Files: app/(tabs)/index.tsx

### T004: i18n store efectos + battle pass labels
- **Blocked By**: []
- **Details**:
  - Leer lib/storeItems.ts para ver efectos y si tienen descriptions traducidas
  - Los efectos tienen `description` solo en español → añadir campo `descriptionEn` y `descriptionPt` a cada effect en STORE_ITEMS  
  - O mejor: crear función `localizeEffectDesc(item, lang)` en storeItems.ts
  - En app/(tabs)/store.tsx: usar la función/campo traducido para el description del EffectCard
  - En app/(tabs)/achievements.tsx: verificar que los rarityLabel usen T() correctamente
  - En lib/i18n.ts: añadir claves faltantes si las hay para battle pass y store
  - Files: lib/storeItems.ts, app/(tabs)/store.tsx, lib/i18n.ts

### T005: Expansión de efectos de sonido
- **Blocked By**: []
- **Details**:
  - Leer lib/sounds.ts y lib/audioManager.ts completos
  - Añadir nuevos SoundEvents: "last_card", "combo", "friend_request", "invite_accepted", "deal_card", "tension"
  - Implementar en audioManager.ts: nuevas funciones que reutilizan/combinan los sonidos existentes
  - "last_card": playOcho a volumen alto + vibración intensa
  - "combo": playSpecialCard + playCardFlip rápido
  - "friend_request": playNotification con pitch diferente
  - "deal_card": playCardFlip muy rápido (para durante el reparto)
  - "tension": playTimerWarning
  - Añadir variación aleatoria: en playCardFlip, random entre 0.8-1.0 de volumen para variedad
  - En app/game.tsx: buscar donde se juega una carta y añadir "last_card" cuando playerHand.length === 1
  - Files: lib/sounds.ts, lib/audioManager.ts, app/game.tsx

### T006: Animación barajado/reparto en game-online
- **Blocked By**: []
- **Details**:
  - Leer app/game-online.tsx COMPLETO
  - Leer components/DealAnimation.tsx para entender cómo funciona el componente existente
  - Añadir fase "dealing" entre "countdown" y "game" en lobbyPhase state
  - En el useEffect del lobby: después del countdown, setLobbyPhase("dealing")
  - Renderizar: cuando lobbyPhase === "dealing", mostrar overlay con animación de cartas
  - La animación: cartas pequeñas aparecen en el centro (deck), se "barajan" (escala/rotación), luego se "reparten" volando hacia arriba (oponente) y abajo (jugador)
  - Duración: 2.5 segundos, luego transición a "game"
  - Usar Animated de react-native (import { Animated } from "react-native")
  - También: asegurarse de que DealAnimation.tsx ya existe en el proyecto y si no, crear versión inline
  - Files: app/game-online.tsx

### T007: Amigos → invitación → juego automático
- **Blocked By**: []
- **Details**:
  - Leer app/friends.tsx COMPLETO
  - Actualmente "invitar" solo muestra toast
  - Cambio: al presionar invitar a un amigo online (online===true), 75% acepta, 25% rechaza
  - Delay de 1.5-3s antes de respuesta
  - Si acepta: toast "¡X aceptó! Iniciando partida..." + setTimeout 1s + router.push("/game-online?count=2&rivalName=X")
  - Si rechaza: toast "X no está disponible ahora"
  - Amigos offline tienen 20% de aceptar
  - En app/game-online.tsx: leer el params "rivalName" de useLocalSearchParams y si existe, usar ese nombre para el primer CPU profile (override el nombre)
  - Files: app/friends.tsx, app/game-online.tsx

### T008: Google/Facebook login UI
- **Blocked By**: []
- **Details**:
  - Crear app/login.tsx con pantalla de login/vinculación
  - Diseño oscuro casino: fondo #010804, logo "OCHO LOCOS" en dorado, subtítulo "Vincula tu cuenta para guardar tu progreso en la nube"
  - Botón "Continuar con Google" → alert/modal "Próximamente disponible"
  - Botón "Continuar con Facebook" → mismo alert
  - Botón "Jugar sin cuenta" (outline) → router.replace("/(tabs)")
  - Registrar en app/_layout.tsx: <Stack.Screen name="login" />
  - En app/(tabs)/profile.tsx: añadir sección "Cuenta" con botón "Vincular cuenta Google/Facebook" que navega a /login
  - Files: app/login.tsx, app/_layout.tsx, app/(tabs)/profile.tsx

### T009: Códigos de sala para online
- **Blocked By**: []
- **Details**:
  - Leer app/(tabs)/index.tsx para ver el modal de online (showOnlineModal)
  - En el modal de Online (showOnlineModal), añadir 3 pestañas: "Buscar", "Crear Sala", "Unirse"
  - Pestaña "Buscar": comportamiento actual (búsqueda automática)
  - Pestaña "Crear Sala": genera código 6 chars aleatorio, lo muestra grande, botón "INICIAR SALA" que navega a game-online
  - Pestaña "Unirse": TextInput para código, botón "UNIRSE" que si tiene 6+ chars navega a game-online
  - El código: Math.random().toString(36).substr(2,6).toUpperCase()
  - Files: app/(tabs)/index.tsx
