import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { rewriteItems } from "../lib/slugMoves";

function generateId() {
  return `basket_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useSavedBasketsStore = create(
  persist(
    (set) => ({
      baskets: [],
      ownerId: null,

      claimFor: (userId) =>
        set((state) => {
          if (!userId || state.ownerId === userId) return state;
          return state.ownerId ? { ownerId: userId, baskets: [] } : { ownerId: userId };
        }),

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
      version: 1,
      migrate: (saved) => saved,
    }
  )
);
