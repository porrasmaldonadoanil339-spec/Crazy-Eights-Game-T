import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

interface NetworkContextValue {
  isConnected: boolean;
  isChecking: boolean;
  recheckNow: () => void;
}

const NetworkContext = createContext<NetworkContextValue>({
  isConnected: true,
  isChecking: true,
  recheckNow: () => {},
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const mounted = useRef(true);

  const applyState = (state: NetInfoState) => {
    if (!mounted.current) return;
    const connected = state.isConnected === true && state.isInternetReachable !== false;
    setIsConnected(connected);
    setIsChecking(false);
  };

  useEffect(() => {
    mounted.current = true;
    const unsub = NetInfo.addEventListener(applyState);
    NetInfo.fetch().then(applyState).catch(() => {
      if (mounted.current) {
        setIsConnected(false);
        setIsChecking(false);
      }
    });
    return () => {
      mounted.current = false;
      unsub();
    };
  }, []);

  const recheckNow = () => {
    setIsChecking(true);
    NetInfo.fetch().then(applyState).catch(() => {
      if (mounted.current) {
        setIsConnected(false);
        setIsChecking(false);
      }
    });
  };

  return (
    <NetworkContext.Provider value={{ isConnected, isChecking, recheckNow }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
