import { useEffect, useState } from "react";
import { Platform } from "react-native";

const DELAY_MS = Platform.OS === "web" ? 0 : 280;

export function useDeferredReady(key) {
  const [ready, setReady] = useState(DELAY_MS === 0);
  useEffect(() => {
    if (DELAY_MS === 0) return undefined;
    setReady(false);
    const timer = setTimeout(() => requestAnimationFrame(() => setReady(true)), DELAY_MS);
    return () => clearTimeout(timer);
  }, [key]);
  return ready;
}
