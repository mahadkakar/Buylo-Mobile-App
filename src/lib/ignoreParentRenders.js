import { memo } from "react";

export function ignoreParentRenders(Screen) {
  return memo(Screen, () => true);
}
