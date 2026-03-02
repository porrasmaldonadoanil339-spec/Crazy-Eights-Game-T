import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: "rgba(10,26,15,0.97)",
            default: "rgba(10,26,15,0.97)",
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: 50 + (Platform.OS === "web" ? 34 : insets.bottom),
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "Nunito_700Bold",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Jugar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "Logros",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: "Tienda",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
