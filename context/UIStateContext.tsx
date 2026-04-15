import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onSplashComplete } from "@/lib/splashState";

interface UIStateContextValue {
  tabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
  splashReady: boolean;
}

const UIStateContext = createContext<UIStateContextValue>({
  tabBarVisible: true,
  setTabBarVisible: () => {},
  splashReady: false,
});

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const [splashReady, setSplashReady] = useState(false);

  useEffect(() => {
    const unsub = onSplashComplete(() => setSplashReady(true));
    return unsub;
  }, []);

  return (
    <UIStateContext.Provider value={{ tabBarVisible, setTabBarVisible, splashReady }}>
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState() {
  return useContext(UIStateContext);
}
