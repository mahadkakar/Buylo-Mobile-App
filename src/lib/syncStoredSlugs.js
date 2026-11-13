import { apiFetch } from "../api/django";
import { useBasketStore } from "../store/basketStore";
import { useSavedBasketsStore } from "../store/savedBasketsStore";
import { collectSlugs } from "./slugMoves";

const BATCH = 300; // the server accepts up to 300 slugs per request

const hydrated = (store) =>
  store.persist.hasHydrated() ? Promise.resolve() : new Promise((resolve) => store.persist.onFinishHydration(() => resolve()));

// At start-up (once per sign-in): ask the server which of the product slugs stored on this phone were merged into another
// product, and bring the stored baskets up to date. Products that no longer exist anywhere are left alone: the basket keeps
// the line and the comparison shows it as unavailable, rather than silently deleting something the shopper added.
// Purely a tidy-up: the server resolves old slugs on its own, so a failure here is ignored.
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
