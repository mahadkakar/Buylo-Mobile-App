import { useEffect, useState } from "react";

// Delays updating the returned value until `value` has stopped changing
// for `delayMs` — standard search-input debounce. Returns the previous
// (stale) value during the delay window, not undefined, so callers don't
// need a separate "is debouncing" check just to avoid a flash of emptiness.
export function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
