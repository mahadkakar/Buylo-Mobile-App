import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { chosenSize } from "../lib/itemSize";
import { locationKey } from "../lib/location";

// A stable fingerprint of exactly what was in the basket when a comparison
// was run — order-independent (sorted) so adding the same two items in a
// different order doesn't look like a different basket.
export function itemKey(item) {
  // The chosen package size and any per store brand swaps are part of what a comparison was run for.
  const swaps = Object.entries(item.storeSwaps ?? {})
    .map(([store, swap]) => `${store}=${swap.slug}`)
    .sort()
    .join("+");
  return `${item.canonicalProductId}:${item.quantityValue}:${chosenSize(item) ?? ""}:${swaps}`;
}

export function basketSignature(items) {
  return items.map(itemKey).sort().join(",");
}

// What a comparison result belongs to: the basket AND the (rounded) place it
// was run for. A result is only valid for the same pair — change either and it
// is stale.
function comparisonKey(items, location) {
  return `${basketSignature(items)}@${locationKey(location)}`;
}

// Tracks the "compare prices nearby" request so its pending/result state
// survives navigation, backgrounding, and app restarts (persisted) — the
// comparison-results screen fires the real API call and stores the
// response here rather than keeping it in local component state, since
// the retailer-basket detail screen (a separate route) needs to read the
// same results without re-fetching.
//
// `itemsKey` is what makes this safe to persist indefinitely: without it,
// a "ready" result from one basket kept being shown as current after the
// basket changed entirely (confirmed live — the dashboard banner said
// "your comparison is ready" for a basket that had never actually been
// checked). It now also encodes the location, so moving to a different area
// doesn't leave a "ready" banner for stores that were nearest somewhere else.
// Callers compare the live basket + location against `itemsKey` before
// trusting `status`/`results` — see isStaleFor below.
export const useComparisonStore = create(
  persist(
    (set, get) => ({
      status: "idle", // "idle" | "running" | "ready" | "error"
      startedAt: null,
      itemCount: 0,
      itemsKey: "",
      results: null,
      refreshing: false, // a swap re-runs the comparison while the screens keep showing the previous results

      start: (items, location) =>
        set({
          status: "running",
          startedAt: Date.now(),
          itemCount: items.length,
          itemsKey: comparisonKey(items, location),
          results: null,
        }),
      // Same as start, but the current results stay on screen until the new ones arrive.
      refresh: (items, location) => set({ refreshing: true, itemsKey: comparisonKey(items, location) }),
      setResults: (results) => set({ status: "ready", results, refreshing: false }),
      // Rewrites one store's entry in the current results (used to show a swap or an undo at once, before the server's
      // new prices arrive and replace everything).
      patchStore: (storeId, change) =>
        set((state) =>
          state.results ? { results: state.results.map((store) => (store.id === storeId ? change(store) : store)) } : {}
        ),
      setError: () => set({ status: "error", refreshing: false }),
      dismiss: () => set({ status: "idle", startedAt: null, itemCount: 0, itemsKey: "", results: null, refreshing: false }),
      // True once the live basket or location no longer matches what this
      // job was run against — callers should treat status as "idle" in that
      // case rather than show a stale running/ready/error state. An empty
      // basket is always stale regardless of itemsKey: an empty basket's
      // signature is "", the same as the field's own never-set default, so
      // without this an old "ready" status read as "matches the current
      // empty basket" — confirmed live, the "ready" banner kept showing
      // with nothing in the basket at all.
      isStaleFor: (items, location) => items.length === 0 || get().itemsKey !== comparisonKey(items, location),
    }),
    {
      name: "basket-compare-comparison-job",
      storage: createJSONStorage(() => AsyncStorage),
      // Bump `version` whenever the saved shape changes and convert old data in `migrate`; without it a phone that
      // saved the previous shape would load it as is.
      version: 1,
      migrate: (saved) => saved,
      partialize: ({ refreshing, ...saved }) => saved,
    }
  )
);
