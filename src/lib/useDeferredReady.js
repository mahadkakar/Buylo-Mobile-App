import { useEffect, useState } from "react";
import { Platform } from "react-native";

// True a short moment after mount and after each change of `key`. Heavy lists use it to show their skeleton while a screen
// is still sliding in or the sidebar is still closing, and to fill in right after. Building a screenful of product cards
// (images, animated views) on Android's UI thread in the middle of an animation is what dropped the frame rate from 60 to
// about 43 when moving to Home or opening a category. It was assumed that iPhones build them fast enough, but in Expo Go
// (development JS, much slower than a release build) the sidebar visibly stutters while a category opens, every time,
// so iPhone waits too. Only the web build, which has no sidebar animation to protect, shows the grid at once.
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
