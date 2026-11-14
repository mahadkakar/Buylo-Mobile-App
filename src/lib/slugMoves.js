import { lineId } from "./itemSize";

const MAX_QUANTITY = 999;

const move = (slug, moved) => (typeof slug === "string" && moved[slug] ? moved[slug] : slug);

function rewriteSwaps(storeSwaps, moved) {
  if (!storeSwaps) return storeSwaps;
  let changed = false;
  const next = {};
  for (const [store, swap] of Object.entries(storeSwaps)) {
    const slug = move(swap?.slug, moved);
    changed ||= slug !== swap?.slug;
    next[store] = swap && slug !== swap.slug ? { ...swap, slug } : swap;
  }
  return changed ? next : storeSwaps;
}

function rewriteKept(kept, moved) {
  if (!kept) return kept;
  let changed = false;
  const next = {};
  for (const [store, slugs] of Object.entries(kept)) {
    const moves = slugs.map((slug) => move(slug, moved));
    const unique = [...new Set(moves)];
    changed ||= unique.length !== slugs.length || unique.some((slug, i) => slug !== slugs[i]);
    next[store] = unique;
  }
  return changed ? next : kept;
}

export function rewriteItems(items, moved) {
  if (!Array.isArray(items) || !moved || Object.keys(moved).length === 0) return items;
  let changed = false;
  const lines = new Map();
  for (const item of items) {
    const id = move(item.canonicalProductId, moved);
    const key = lineId({ ...item, canonicalProductId: id });
    const swaps = rewriteSwaps(item.storeSwaps, moved);
    const kept = rewriteKept(item.keptAlternatives, moved);
    if (lines.has(key)) {
      const first = lines.get(key);
      first.quantityValue = Math.min((first.quantityValue ?? 0) + (item.quantityValue ?? 0), MAX_QUANTITY);
      changed = true;
      continue;
    }
    if (id !== item.canonicalProductId || swaps !== item.storeSwaps || kept !== item.keptAlternatives) {
      changed = true;
      const line = { ...item, canonicalProductId: id };
      if (swaps !== undefined) line.storeSwaps = swaps;
      if (kept !== undefined) line.keptAlternatives = kept;
      lines.set(key, line);
    } else {
      lines.set(key, { ...item });
    }
  }
  return changed ? [...lines.values()] : items;
}

export function collectSlugs(items, into = new Set()) {
  for (const item of Array.isArray(items) ? items : []) {
    if (item.canonicalProductId) into.add(item.canonicalProductId);
    for (const swap of Object.values(item.storeSwaps ?? {})) if (swap?.slug) into.add(swap.slug);
    for (const slugs of Object.values(item.keptAlternatives ?? {})) slugs.forEach((slug) => into.add(slug));
  }
  return into;
}
