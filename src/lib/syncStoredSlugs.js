import { apiFetch } from "../api/django";
import { useBasketStore } from "../store/basketStore";
import { useSavedBasketsStore } from "../store/savedBasketsStore";
import { collectSlugs } from "./slugMoves";

const BATCH = 300;

const hydrated = (store) =>
  store.persist.hasHydrated() ? Promise.resolve() : new Promise((resolve) => store.persist.onFinishHydration(() => resolve()));

export async function syncStoredSlugs() {
  await Promise.all([hydrated(useBasketStore), hydrated(useSavedBasketsStore)]);
  const slugs = collectSlugs(useBasketStore.getState().items);
  useSavedBasketsStore.getState().baskets.forEach((basket) => collectSlugs(basket.items, slugs));
  if (slugs.size === 0) return;

  const all = [...slugs];
  const moved = {};
  for (let start = 0; start < all.length; start += BATCH) {
    const answer = await apiFetch("/api/slugs/resolve/", { method: "POST", body: { slugs: all.slice(start, start + BATCH) } });
    Object.assign(moved, answer?.moved ?? {});
  }
  if (Object.keys(moved).length === 0) return;
  useBasketStore.getState().applySlugMoves(moved);
  useSavedBasketsStore.getState().applySlugMoves(moved);
}
