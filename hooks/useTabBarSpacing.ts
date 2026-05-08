import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TAB_BAR_BASE_HEIGHT = 64;
export const TAB_CONTENT_BOTTOM_GAP = 26;

export function useTabBarSpacing() {
  const insets = useSafeAreaInsets();
  const safeBottom = Platform.OS === "web" ? 34 : insets.bottom;
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + safeBottom;
  const contentBottomPad = tabBarHeight + TAB_CONTENT_BOTTOM_GAP;
  return { safeBottom, tabBarHeight, contentBottomPad };
}
