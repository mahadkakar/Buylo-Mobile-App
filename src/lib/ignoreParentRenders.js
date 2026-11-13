import { memo } from "react";

// Wraps a screen so that React skips re-rendering it just because its PARENT rendered. React Navigation keeps its state at the
// root, so every navigation re-renders every screen that was ever opened (a React Profiler recording showed about 2,000
// components, 450 to 750 ms, per navigation). The maintainers' advice is to memoise the expensive parts. Our screens take no
// props (Expo Router passes `navigation` and `route`, which none of them read), and they update themselves through their own
// hooks (stores, queries, router params, safe area), which still work: only the re-render caused from above is skipped.
// Do NOT use it on a screen that reads its props.
export function ignoreParentRenders(Screen) {
  return memo(Screen, () => true);
}
