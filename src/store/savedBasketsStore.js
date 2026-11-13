import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { rewriteItems } from "../lib/slugMoves";

function generateId() {
  return `basket_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Named, reloadable baskets — separate from the single "active" basket in
// basketStore. A saved basket is a snapshot of items (same shape as
// basketStore items), so loading one just replaces the active basket's
// items wholesale via basketStore.setItems().
export const useSavedBasketsStore = create(
  persist(
    (set) => ({
      baskets: [], // [{ id, name, items, createdAt, updatedAt }]
      // The account the saved baskets belong to. They stay on the phone when that account logs out, but a different
      // account never sees them (claimFor, called from the root layout whenever a session appears).
      ownerId: null,

      claimFor: (userId) =>
        set((state) => {
          if (!userId || state.ownerId === userId) return state;
          // No owner yet (first account on this phone, or baskets saved before owners were recorded): they are
          // this account's. A different owner: start empty.
          return state.ownerId ? { ownerId: userId, baskets: [] } : { ownerId: userId };
        }),

      // Used when the account is deleted.
      wipe: () => set({ baskets: [], ownerId: null }),

      saveAsNew: (name, items) =>
        set((state) => {
          const now = Date.now();
          const basket = { id: generateId(), name: name.trim(), items, createdAt: now, updatedAt: now };
          return { baskets: [basket, ...state.baskets] };
        }),

      updateItems: (id, items) =>
        set((state) => ({
          baskets: state.baskets.map((b) => (b.id === id ? { ...b, items, updatedAt: Date.now() } : b)),
        })),

      rename: (id, name) =>
        set((state) => ({
          baskets: state.baskets.map((b) => (b.id === id ? { ...b, name: name.trim(), updatedAt: Date.now() } : b)),
        })),

      remove: (id) => set((state) => ({ baskets: state.baskets.filter((b) => b.id !== id) })),

      // The server merged some products: bring the stored slugs up to date (see lib/slugMoves.js). Not an edit by the
      // shopper, so updatedAt stays as it is.
      applySlugMoves: (moved) =>
        set((state) => {
          let changed = false;
          const baskets = state.baskets.map((basket) => {
            const items = rewriteItems(basket.items, moved);
            if (items === basket.items) return basket;
            changed = true;
            return { ...basket, items };
          });
          return changed ? { baskets } : state;
        }),
    }),
    {
      name: "basket-compare-saved-baskets",
      storage: createJSONStorage(() => AsyncStorage),
      // Bump `version` whenever the saved shape changes and convert old data in `migrate`; without it a phone that
      // saved the previous shape would load it as is.
      version: 1,
      migrate: (saved) => saved,
    }
  )
);
