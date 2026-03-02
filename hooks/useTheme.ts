import { useProfile } from "@/context/ProfileContext";
import { DarkColors, LightColors, ThemeColors } from "@/constants/colors";

export function useTheme(): ThemeColors {
  const { profile } = useProfile();
  return profile.darkMode !== false ? DarkColors : LightColors;
}
