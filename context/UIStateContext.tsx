import React, { createContext, useContext, useState, ReactNode } from "react";

interface UIStateContextValue {
  tabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
}

const UIStateContext = createContext<UIStateContextValue>({
  tabBarVisible: true,
  setTabBarVisible: () => {},
});

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [tabBarVisible, setTabBarVisible] = useState(true);
  return (
    <UIStateContext.Provider value={{ tabBarVisible, setTabBarVisible }}>
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState() {
  return useContext(UIStateContext);
}
