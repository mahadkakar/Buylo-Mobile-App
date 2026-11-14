import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { fetchComparison } from "../api/comparison";
import { useBasketStore } from "../store/basketStore";
import { useComparisonStore } from "../store/comparisonStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { showToast } from "../store/uiStore";
import { tapSuccess } from "./haptics";
import { chosenSize, lineId } from "./itemSize";

export function storeSwapFor(suggestion, store) {
  const alt = suggestion.alternative;
  return {
    slug: alt.slug,
    name: alt.name,
    brand: alt.brand,
    sizeLabel: alt.sizeLabel,
    image: alt.image,
    category: alt.category,
    price: alt.price,
    storeName: store.name,
    replacement: suggestion.match !== undefined,
  };
}

let rerunTimer;

export function scheduleComparison(queryClient) {
  clearTimeout(rerunTimer);
  rerunTimer = setTimeout(() => {
    const { items } = useBasketStore.getState();
    const { location } = usePreferencesStore.getState();
    const comparison = useComparisonStore.getState();
    if (items.length === 0) return;
    if (comparison.results && comparison.status === "ready") comparison.refresh(items, location);
    else comparison.start(items, location);
    fetchComparison(queryClient, items, location)
      .then((data) => comparison.setResults(data))
      .catch(() => comparison.setError());
  }, 250);
}

export function useKeepComparisonFresh() {
  const queryClient = useQueryClient();
  const items = useBasketStore((state) => state.items);
  const location = usePreferencesStore((state) => state.location);
  const status = useComparisonStore((state) => state.status);
  const itemsKey = useComparisonStore((state) => state.itemsKey);
  const isStaleFor = useComparisonStore((state) => state.isStaleFor);
  useEffect(() => {
    if (status === "ready" && items.length > 0 && isStaleFor(items, location)) scheduleComparison(queryClient);
  }, [items, location, status, itemsKey]);
}

const money = (n) => Math.round(n * 100) / 100;

function recount(store) {
  const available = store.lines.filter((line) => line.available);
  const swapped = available.filter((line) => line.swappedFrom);
  return {
    ...store,
    total: money(available.reduce((sum, line) => sum + line.lineTotal, 0)),
    availableCount: available.length,
    unavailableCount: store.lines.length - available.length,
    swapCount: swapped.length,
    swapSavings: money(swapped.reduce((sum, line) => sum + (line.swappedFrom.saving ?? 0), 0)),
  };
}

function showAtOnce(storeId, change) {
  useComparisonStore.getState().patchStore(storeId, (store) =>
    recount({ ...store, lines: store.lines.map((line) => (change[line.slug] ? change[line.slug](line) : line)) })
  );
}

function swappedLine(suggestion, quantity) {
  const alt = suggestion.alternative;
  return (line) => {
    const qty = line.quantityValue ?? quantity;
    if (!qty) return line;
    const lineTotal = money(alt.price * qty);
    const shown = {
      slug: line.slug, productSlug: alt.slug, name: alt.name, brand: alt.brand, sizeLabel: alt.sizeLabel, image: alt.image,
      category: alt.category, quantityValue: qty, price: alt.price, lineTotal, available: true, substituted: false,
      requestedSize: null,
    };
    if (!line.available) return shown;
    const from = line.swappedFrom ?? {
      name: line.name, brand: line.brand, sizeLabel: line.sizeLabel, price: line.price, lineTotal: line.lineTotal,
    };
    return { ...shown, swappedFrom: { ...from, saving: money(from.lineTotal - lineTotal) } };
  };
}

function showSwaps(suggestions, storeId) {
  const { items } = useBasketStore.getState();
  const quantity = Object.fromEntries(items.map((item) => [lineId(item), item.quantityValue]));
  showAtOnce(storeId, Object.fromEntries(suggestions.map((s) => [s.slug, swappedLine(s, quantity[s.slug])])));
}

function showUndo(slugs, storeId) {
  const { items } = useBasketStore.getState();
  const change = {};
  slugs.forEach((slug) => {
    const item = items.find((i) => lineId(i) === slug);
    if (!item) return;
    change[slug] = (line) => {
      if (line.swappedFrom && line.swappedFrom.lineTotal != null) {
        const from = line.swappedFrom;
        return {
          ...line, productSlug: item.canonicalProductId, name: from.name, brand: from.brand, sizeLabel: from.sizeLabel,
          price: from.price, lineTotal: from.lineTotal, image: item.image ?? line.image, category: item.category ?? line.category,
          swappedFrom: null,
        };
      }
      if (item.storeSwaps?.[storeId]?.replacement) {
        return {
          slug, productSlug: item.canonicalProductId, name: item.name, available: false, requestedSize: chosenSize(item) ?? null,
        };
      }
      return line;
    };
  });
  showAtOnce(storeId, change);
}

export function applySwaps(suggestions, store, queryClient) {
  const { setStoreSwap } = useBasketStore.getState();
  showSwaps(suggestions, store.id);
  suggestions.forEach((suggestion) => setStoreSwap(suggestion.slug, store.id, storeSwapFor(suggestion, store)));
  scheduleComparison(queryClient);
}

export function undoSwaps(slugs, storeId, queryClient) {
  const { clearStoreSwap } = useBasketStore.getState();
  showUndo(slugs, storeId);
  slugs.forEach((slug) => clearStoreSwap(slug, storeId));
  scheduleComparison(queryClient);
  tapSuccess();
  showToast(slugs.length === 1 ? "Swap undone, back to your original" : `${slugs.length} swaps undone`);
}

export function swapWithUndo(suggestions, store, queryClient) {
  const saved = suggestions.reduce((sum, s) => sum + s.saving, 0);
  const slugs = suggestions.map((s) => s.slug);
  applySwaps(suggestions, store, queryClient);
  tapSuccess();
  showToast(
    suggestions.length === 1
      ? `Swapped at ${store.name}, saves $${saved.toFixed(2)}`
      : `Swapped ${suggestions.length} items at ${store.name}, saves $${saved.toFixed(2)}`,
    { label: "Undo", onPress: () => undoSwaps(slugs, store.id, queryClient) }
  );
}

export function addReplacements(replacements, store, queryClient) {
  const { setStoreSwap, clearStoreSwap } = useBasketStore.getState();
  showSwaps(replacements, store.id);
  replacements.forEach((r) => setStoreSwap(r.slug, store.id, storeSwapFor(r, store)));
  scheduleComparison(queryClient);
  tapSuccess();
  showToast(
    replacements.length === 1 ? `Added ${replacements[0].alternative.brand || replacements[0].alternative.name} at ${store.name}` : `Added ${replacements.length} replacements at ${store.name}`,
    {
      label: "Undo",
      onPress: () => {
        showUndo(replacements.map((r) => r.slug), store.id);
        replacements.forEach((r) => clearStoreSwap(r.slug, store.id));
        scheduleComparison(queryClient);
      },
    }
  );
}
