import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query";

import { apiFetch } from "./django";
import { CATALOG_CACHE, PRODUCT_DETAIL_CACHE } from "../lib/cacheTimes";

// `image` is the best-value listing's real photo, or null when no matched
// listing has one — the UI (components/ProductImage.js) shows a neutral
// category tile for null. There used to be a per-category stock-photo
// fallback here; it showed a milk glass on cheese, so it was removed.

// The category list endpoint is paginated backend-side (some categories,
// e.g. pantry, have 500+ priced products — too much for one response).
// Fetches a page at a time as the user scrolls; `next` is DRF's absolute
// next-page URL but we only read its page number back out since apiFetch
// always prepends the configured API host itself.
function nextPageParam(page) {
  if (!page.next) return undefined;
  const match = page.next.match(/page=(\d+)/);
  return match ? Number(match[1]) : undefined;
}

// `ordering` is "price" | "-price" | "name" (default) — must be applied
// backend-side, not by re-sorting the accumulated pages on the client.
// Re-sorting the whole list every time a new page arrived moved items
// that were already on screen (a cheaper/earlier item from the new page
// could sort above everything loaded so far), which shifted scroll
// position back toward the list's end, re-triggering the "load more"
// scroll handler — an infinite fetch-resort-refetch loop that looked like
// the list glitching. Ordering server-side means each page already comes
// back in final order, so later pages only ever get appended.
export function useCanonicalProducts(categorySlug, ordering = "name", retailerSlug = null) {
  return useInfiniteQuery({
    queryKey: ["products", categorySlug, ordering, retailerSlug],
    queryFn: async ({ pageParam }) => {
      const retailerParam = retailerSlug ? `&retailer=${retailerSlug}` : "";
      const page = await apiFetch(
        `/api/products/?category=${categorySlug}&ordering=${ordering}${retailerParam}&page=${pageParam}`
      );
      return page;
    },
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: !!categorySlug,
    ...CATALOG_CACHE,
  });
}


// Same paginated endpoint as useCanonicalProducts, filtered by `?q=`
// (name/brand match — see backend/catalog/views.py) instead of category.
// Gated on at least 2 characters so every keystroke on "m" doesn't fire a
// 148-result fetch.
export function useProductSearch(query) {
  const trimmed = query.trim();
  return useInfiniteQuery({
    queryKey: ["products", "search", trimmed],
    queryFn: async ({ pageParam }) => {
      return apiFetch(`/api/products/?q=${encodeURIComponent(trimmed)}&page=${pageParam}`);
    },
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: trimmed.length >= 2,
    ...CATALOG_CACHE,
  });
}

// Shared by the product detail screen and the dashboard's "from your recent
// baskets" cards so both read the same ["product", slug] cache entry — opening
// a card from the dashboard doesn't refetch what was just loaded.
function productQueryOptions(slug) {
  return {
    queryKey: ["product", slug],
    queryFn: () => apiFetch(`/api/products/${slug}/`),
    enabled: !!slug,
    ...PRODUCT_DETAIL_CACHE,
  };
}

export function useCanonicalProduct(slug) {
  return useQuery(productQueryOptions(slug));
}

// Module-level so useQueries gets a stable `combine` (an inline one is
// re-created every render and defeats its memoization). Result order matches
// the order of `ids`.
function combineProducts(results) {
  return {
    // Priced products only: one that left the catalog (404) or lost its price
    // is simply left out rather than shown as a dead card.
    products: results.map((r) => r.data).filter((p) => p && p.price != null),
    isLoading: results.some((r) => r.isLoading),
    isRefetching: results.some((r) => r.isRefetching),
  };
}

export function useProductsByIds(ids) {
  return useQueries({ queries: ids.map(productQueryOptions), combine: combineProducts });
}
