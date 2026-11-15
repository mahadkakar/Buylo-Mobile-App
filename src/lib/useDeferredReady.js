import { useEffect, useState } from "react";
import { Platform } from "react-native";

const DELAY_MS = Platform.OS === "web" ? 0 : 280;

export function useDeferredReady(key) {
  const [readyKey, setReadyKey] = useState(DELAY_MS === 0 ? key : null);
  useEffect(() => {
    if (DELAY_MS === 0) return undefined;
    const timer = setTimeout(() => requestAnimationFrame(() => setReadyKey(key)), DELAY_MS);
    return () => clearTimeout(timer);
  }, [key]);
  return DELAY_MS === 0 || readyKey === key;
}
