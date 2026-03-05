import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, Alert, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { playSound } from "@/lib/sounds";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;

type Mode = "menu" | "login" | "register";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, register, loginWithGoogle, loginWithFacebook, loginAsGuest, loginWithToken } = useAuth();
  const { profile } = useProfile();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";

  const [mode, setMode] = useState<Mode>("menu");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const t = (key: string): string => {
    const strings: Record<string, Record<string, string>> = {
      title: { es: "OCHO LOCOS", en: "OCHO LOCOS", pt: "OCHO LOCOS" },
      sub: { es: "CRAZY EIGHTS · CASINO EDITION", en: "CRAZY EIGHTS · CASINO EDITION", pt: "CRAZY EIGHTS · CASINO EDITION" },
      headline: { es: "Vincula tu cuenta para guardar tu progreso", en: "Link your account to save your progress", pt: "Vincule sua conta para salvar seu progresso" },
      createAccount: { es: "Crear Cuenta", en: "Create Account", pt: "Criar Conta" },
      signIn: { es: "Iniciar Sesión", en: "Sign In", pt: "Entrar" },
      playGuest: { es: "Jugar sin cuenta", en: "Play without account", pt: "Jogar sem conta" },
      guestNote: { es: "Tu progreso se guardará en este dispositivo", en: "Your progress will be saved on this device", pt: "Seu progresso será salvo neste dispositivo" },
      username: { es: "Nombre de usuario", en: "Username", pt: "Nome de usuário" },
      password: { es: "Contraseña", en: "Password", pt: "Senha" },
      confirmPassword: { es: "Confirmar contraseña", en: "Confirm password", pt: "Confirmar senha" },
      required: { es: "Por favor completa todos los campos", en: "Please fill in all fields", pt: "Por favor preencha todos os campos" },
      passwordMismatch: { es: "Las contraseñas no coinciden", en: "Passwords do not match", pt: "As senhas não coincidem" },
      or: { es: "O", en: "OR", pt: "OU" },
      continueGoogle: { es: "Continuar con Google", en: "Continue with Google", pt: "Continuar com Google" },
      continueFacebook: { es: "Continuar con Facebook", en: "Continue with Facebook", pt: "Continuar com Facebook" },
      registerBtn: { es: "CREAR CUENTA", en: "CREATE ACCOUNT", pt: "CRIAR CONTA" },
      loginBtn: { es: "INICIAR SESIÓN", en: "SIGN IN", pt: "ENTRAR" },
      haveAccount: { es: "¿Ya tienes cuenta? Inicia sesión", en: "Already have account? Sign in", pt: "Já tem conta? Entre" },
      noAccount: { es: "¿Sin cuenta? Regístrate", en: "No account? Register", pt: "Sem conta? Registre-se" },
      usernameTip: { es: "3-20 caracteres, letras y números", en: "3-20 chars, letters and numbers only", pt: "3-20 caracteres, letras e números" },
      oauthNotConfigured: {
        es: "Para usar Google/Facebook login necesitas configurar las variables de entorno. Usa email y contraseña por ahora.",
        en: "Google/Facebook login requires environment variables. Use email/password for now.",
        pt: "Login com Google/Facebook requer variáveis de ambiente. Use email e senha por enquanto.",
      },
      oauthSetup: { es: "No configurado", en: "Not configured", pt: "Não configurado" },
    };
    return strings[key]?.[lang] ?? strings[key]?.es ?? key;
  };

  const handleOAuth = (provider: "google" | "facebook") => {
    playSound("button_press").catch(() => {});
    const providerName = provider === "google" ? "Google" : "Facebook";
    const title = lang === "en" ? "Coming soon" : lang === "pt" ? "Em breve" : "Próximamente";
    const msg =
      lang === "en"
        ? `${providerName} login will be available in a future update. Use email and password for now.`
        : lang === "pt"
        ? `Login com ${providerName} estará disponível em breve. Use e-mail e senha por enquanto.`
        : `El login con ${providerName} estará disponible próximamente.\n\nPor ahora puedes crear una cuenta con usuario y contraseña.`;
    Alert.alert(title, msg, [{ text: "OK" }]);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError(t("required"));
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.ok) {
      playSound("win").catch(() => {});
      router.replace("/(tabs)");
    } else {
      setError(result.error || "Error");
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password || !confirmPassword) {
      setError(t("required"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    setLoading(true);
    setError("");
    const result = await register(username.trim(), password);
    setLoading(false);
    if (result.ok) {
      playSound("win").catch(() => {});
      router.replace("/(tabs)");
    } else {
      setError(result.error || "Error");
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    playSound("button_press").catch(() => {});
    router.replace("/(tabs)");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top + 12;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={["#010804", "#030e08", "#041008"]} style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Back button */}
          <Pressable
            onPress={() => { if (mode !== "menu") { setMode("menu"); setError(""); } else { router.back(); } }}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.textMuted} />
          </Pressable>

          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.suitRow}>
              <Text style={styles.suitRed}>♥</Text>
              <Text style={styles.suitBlack}>♠</Text>
              <Text style={styles.suitRed}>♦</Text>
              <Text style={styles.suitBlack}>♣</Text>
            </View>
            <Text style={styles.logoText}>{t("title")}</Text>
            <Text style={styles.logoSub}>{t("sub")}</Text>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerDiamond}>◆</Text>
              <View style={styles.dividerLine} />
            </View>
            {mode === "menu" && <Text style={styles.subtitle}>{t("headline")}</Text>}
          </View>

          {/* ─── MENU ─── */}
          {mode === "menu" && (
            <View style={styles.buttonsSection}>
              <Pressable onPress={() => handleOAuth("google")} style={({ pressed }) => [styles.authBtn, styles.authBtnGoogle, pressed && styles.pressed]} disabled={loading}>
                <View style={styles.authBtnIcon}><Ionicons name="logo-google" size={20} color="#EA4335" /></View>
                <Text style={styles.authBtnText}>{t("continueGoogle")}</Text>
                {!GOOGLE_CLIENT_ID && <Ionicons name="lock-closed-outline" size={14} color={Colors.textMuted} />}
              </Pressable>

              <Pressable onPress={() => handleOAuth("facebook")} style={({ pressed }) => [styles.authBtn, styles.authBtnFacebook, pressed && styles.pressed]} disabled={loading}>
                <View style={[styles.authBtnIcon, { backgroundColor: "#1877F2" }]}><Ionicons name="logo-facebook" size={20} color="#fff" /></View>
                <Text style={styles.authBtnText}>{t("continueFacebook")}</Text>
                {!FACEBOOK_APP_ID && <Ionicons name="lock-closed-outline" size={14} color={Colors.textMuted} />}
              </Pressable>

              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>{t("or")}</Text>
                <View style={styles.orLine} />
              </View>

              <Pressable onPress={() => { playSound("button_press").catch(() => {}); setMode("register"); setError(""); }} style={({ pressed }) => [styles.mainBtn, pressed && styles.pressed]}>
                <Ionicons name="person-add" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.mainBtnText}>{t("createAccount")}</Text>
              </Pressable>

              <Pressable onPress={() => { playSound("button_press").catch(() => {}); setMode("login"); setError(""); }} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}>
                <Ionicons name="log-in-outline" size={18} color={Colors.gold} style={{ marginRight: 8 }} />
                <Text style={styles.secondaryBtnText}>{t("signIn")}</Text>
              </Pressable>

              <Pressable onPress={handleGuest} style={({ pressed }) => [styles.guestBtn, pressed && styles.pressed]}>
                <Ionicons name="eye-outline" size={16} color={Colors.textMuted} style={{ marginRight: 6 }} />
                <Text style={styles.guestBtnText}>{t("playGuest")}</Text>
              </Pressable>
              <Text style={styles.guestNote}>{t("guestNote")}</Text>

              {loading && <ActivityIndicator color={Colors.gold} style={{ marginTop: 16 }} />}
            </View>
          )}

          {/* ─── REGISTER ─── */}
          {mode === "register" && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>{t("createAccount")}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("username")}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} maxLength={20} placeholder="MiNombre" placeholderTextColor={Colors.textDim} />
                </View>
                <Text style={styles.inputHint}>{t("usernameTip")}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("password")}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput style={[styles.input, { flex: 1 }]} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder="••••••" placeholderTextColor={Colors.textDim} />
                  <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}><Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={Colors.textMuted} /></Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("confirmPassword")}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput style={[styles.input, { flex: 1 }]} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} placeholder="••••••" placeholderTextColor={Colors.textDim} />
                </View>
              </View>

              {!!error && <Text style={styles.errorText}>{error}</Text>}

              <Pressable onPress={handleRegister} style={({ pressed }) => [styles.mainBtn, pressed && styles.pressed, loading && { opacity: 0.7 }]} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>{t("registerBtn")}</Text>}
              </Pressable>

              <Pressable onPress={() => { setMode("login"); setError(""); }} style={styles.switchModeBtn}>
                <Text style={styles.switchModeText}>{t("haveAccount")}</Text>
              </Pressable>
            </View>
          )}

          {/* ─── LOGIN ─── */}
          {mode === "login" && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>{t("signIn")}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("username")}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} placeholder="MiNombre" placeholderTextColor={Colors.textDim} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("password")}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput style={[styles.input, { flex: 1 }]} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder="••••••" placeholderTextColor={Colors.textDim} />
                  <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}><Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={Colors.textMuted} /></Pressable>
                </View>
              </View>

              {!!error && <Text style={styles.errorText}>{error}</Text>}

              <Pressable onPress={handleLogin} style={({ pressed }) => [styles.mainBtn, pressed && styles.pressed, loading && { opacity: 0.7 }]} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>{t("loginBtn")}</Text>}
              </Pressable>

              <Pressable onPress={() => { setMode("register"); setError(""); }} style={styles.switchModeBtn}>
                <Text style={styles.switchModeText}>{t("noAccount")}</Text>
              </Pressable>
            </View>
          )}

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, gap: 0 },
  backBtn: { alignSelf: "flex-start", width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", marginBottom: 8 },
  logoSection: { alignItems: "center", width: "100%", marginBottom: 24 },
  suitRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  suitRed: { fontSize: 22, color: "#C0392B", opacity: 0.7 },
  suitBlack: { fontSize: 22, color: "#ffffff", opacity: 0.45 },
  logoText: { fontFamily: "Nunito_900ExtraBold", fontSize: 34, color: Colors.gold, letterSpacing: 5, textAlign: "center" },
  logoSub: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textDim, letterSpacing: 3, marginTop: 4 },
  divider: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%", marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(212,175,55,0.2)" },
  dividerDiamond: { fontSize: 12, color: Colors.gold + "80" },
  subtitle: { fontFamily: "Nunito_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center", lineHeight: 20, paddingHorizontal: 8 },
  buttonsSection: { width: "100%", gap: 10 },
  authBtn: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1 },
  authBtnGoogle: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.14)" },
  authBtnFacebook: { backgroundColor: "rgba(24,119,242,0.1)", borderColor: "rgba(24,119,242,0.3)" },
  authBtnIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  authBtnText: { fontFamily: "Nunito_700Bold", fontSize: 15, color: "#ffffff", flex: 1 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  orLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  orText: { fontFamily: "Nunito_400Regular", fontSize: 12, color: Colors.textDim },
  mainBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, borderRadius: 14, backgroundColor: Colors.gold, shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  mainBtnText: { fontFamily: "Nunito_900ExtraBold", fontSize: 15, color: "#010804", letterSpacing: 1 },
  secondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.1)", borderWidth: 1.5, borderColor: Colors.gold + "50" },
  secondaryBtnText: { fontFamily: "Nunito_700Bold", fontSize: 15, color: Colors.gold },
  guestBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  guestBtnText: { fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.textMuted },
  guestNote: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textDim, textAlign: "center", marginTop: -4 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  formSection: { width: "100%", gap: 14 },
  formTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 22, color: Colors.gold, textAlign: "center", marginBottom: 6 },
  inputGroup: { gap: 6 },
  inputLabel: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.textMuted },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", paddingHorizontal: 12 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontFamily: "Nunito_400Regular", fontSize: 15, color: "#fff", paddingVertical: 13 },
  inputHint: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textDim },
  errorText: { fontFamily: "Nunito_700Bold", fontSize: 13, color: "#E74C3C", textAlign: "center" },
  switchModeBtn: { alignItems: "center", paddingVertical: 8 },
  switchModeText: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted, textDecorationLine: "underline" },
});
