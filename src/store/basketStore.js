import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { lineId } from "../lib/itemSize";
import { rewriteItems } from "../lib/slugMoves";

// The active basket survives closing the app (same AsyncStorage approach as the saved baskets). Sign-out still
// empties it: resetUserData() calls clear(), which persists the empty list.
export const useBasketStore = create(
  persist(
    (set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      // A line is a product in one size (see lib/itemSize.js): the same product in another size is a new line.
      const id = lineId(item);
      const existing = state.items.find((i) => lineId(i) === id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            lineId(i) === id
              // Spreading `item` over `i` lets a re-add from the product
              // detail screen (which passes listingId/retailer/brand/price)
              // overwrite which specific listing this line represents,
              // while a quick-add from the category grid (no listing
              // fields at all) leaves whatever was already selected alone.
              ? { ...i, ...item, quantityValue: i.quantityValue + item.quantityValue }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  // Changes which specific listing an existing basket line points to,
  // without touching quantity — used when the user picks a different
  // store/brand on the product detail screen for something already in
  // the basket.
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

  // A brand swap belongs to one store: the line keeps the product the shopper picked and records "at <store>, use
  // <this product>" in `storeSwaps`, so each store's total uses its own cheapest brand and nothing flips back.
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

  // "Keep mine": the shopper turned down a cheaper brand suggested for this line at one store. It is remembered on the
  // line, so it survives closing the app and travels with the basket when it is saved; the suggestion stays hidden
  // everywhere (see api/suggestions.js) until showKeptAgain().
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

  // Bulk-replaces the active basket — used when loading a saved basket in.
  setItems: (items) => set({ items }),

  // The server merged some products: bring the stored slugs up to date (see lib/slugMoves.js).
  applySlugMoves: (moved) =>
    set((state) => {
      const items = rewriteItems(state.items, moved);
      return items === state.items ? state : { items };
    }),
}),
    {
      name: "basket-compare-active-basket",
      storage: createJSONStorage(() => AsyncStorage),
      // Bump `version` whenever the saved shape changes and convert old data in `migrate`; without it a phone that
      // saved the previous shape would load it as is.
      version: 1,
      migrate: (saved) => ({ items: Array.isArray(saved?.items) ? saved.items : [] }),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
