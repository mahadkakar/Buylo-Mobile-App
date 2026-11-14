import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { lineId } from "../lib/itemSize";
import { rewriteItems } from "../lib/slugMoves";

export const useBasketStore = create(
  persist(
    (set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const id = lineId(item);
      const existing = state.items.find((i) => lineId(i) === id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            lineId(i) === id
              ? { ...i, ...item, quantityValue: i.quantityValue + item.quantityValue }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  setListing: (id, listing) =>
    set((state) => ({
      items: state.items.map((i) =>
        lineId(i) === id ? { ...i, ...listing } : i
      ),
    })),

  updateQuantity: (id, quantityValue) =>
    set((state) => ({
      items: state.items
        .map((i) => (lineId(i) === id ? { ...i, quantityValue } : i))
        .filter((i) => i.quantityValue > 0),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => lineId(i) !== id),
    })),

  setStoreSwap: (id, storeId, swap) =>
    set((state) => ({
      items: state.items.map((i) =>
        lineId(i) === id
          ? { ...i, storeSwaps: { ...(i.storeSwaps ?? {}), [storeId]: swap } }
          : i
      ),
    })),

  clearStoreSwap: (id, storeId) =>
    set((state) => ({
      items: state.items.map((i) => {
        if (lineId(i) !== id || !i.storeSwaps) return i;
        const { [storeId]: _removed, ...rest } = i.storeSwaps;
        return { ...i, storeSwaps: rest };
      }),
    })),

  keepOriginal: (id, storeId, alternativeSlug) =>
    set((state) => ({
      items: state.items.map((i) => {
        if (lineId(i) !== id) return i;
        const kept = i.keptAlternatives ?? {};
        const forStore = kept[storeId] ?? [];
        if (forStore.includes(alternativeSlug)) return i;
        return { ...i, keptAlternatives: { ...kept, [storeId]: [...forStore, alternativeSlug] } };
      }),
    })),

  showKeptAgain: () =>
    set((state) => ({ items: state.items.map(({ keptAlternatives: _kept, ...rest }) => rest) })),

  clear: () => set({ items: [] }),

  setItems: (items) => set({ items }),

  applySlugMoves: (moved) =>
    set((state) => {
      const items = rewriteItems(state.items, moved);
      return items === state.items ? state : { items };
    }),
}),
    {
      name: "basket-compare-active-basket",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (saved) => ({ items: Array.isArray(saved?.items) ? saved.items : [] }),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
