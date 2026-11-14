import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { chosenSize } from "../lib/itemSize";
import { locationKey } from "../lib/location";

export function itemKey(item) {
  const swaps = Object.entries(item.storeSwaps ?? {})
    .map(([store, swap]) => `${store}=${swap.slug}`)
    .sort()
    .join("+");
  return `${item.canonicalProductId}:${item.quantityValue}:${chosenSize(item) ?? ""}:${swaps}`;
}

export function basketSignature(items) {
  return items.map(itemKey).sort().join(",");
}

function comparisonKey(items, location) {
  return `${basketSignature(items)}@${locationKey(location)}`;
}

export const useComparisonStore = create(
  persist(
    (set, get) => ({
      status: "idle",
      startedAt: null,
      itemCount: 0,
      itemsKey: "",
      results: null,
      refreshing: false,

      start: (items, location) =>
        set({
          status: "running",
          startedAt: Date.now(),
          itemCount: items.length,
          itemsKey: comparisonKey(items, location),
          results: null,
        }),
      refresh: (items, location) => set({ refreshing: true, itemsKey: comparisonKey(items, location) }),
      setResults: (results) => set({ status: "ready", results, refreshing: false }),
      patchStore: (storeId, change) =>
        set((state) =>
          state.results ? { results: state.results.map((store) => (store.id === storeId ? change(store) : store)) } : {}
        ),
      setError: () => set({ status: "error", refreshing: false }),
      dismiss: () => set({ status: "idle", startedAt: null, itemCount: 0, itemsKey: "", results: null, refreshing: false }),
      isStaleFor: (items, location) => items.length === 0 || get().itemsKey !== comparisonKey(items, location),
    }),
    {
      name: "basket-compare-comparison-job",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (saved) => saved,
      partialize: ({ refreshing, ...saved }) => saved,
    }
  )
);
