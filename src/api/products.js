import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query";

import { apiFetch } from "./django";
import { CATALOG_CACHE, PRODUCT_DETAIL_CACHE } from "../lib/cacheTimes";

function nextPageParam(page) {
  if (!page.next) return undefined;
  const match = page.next.match(/page=(\d+)/);
  return match ? Number(match[1]) : undefined;
}

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

function combineProducts(results) {
  return {
    products: results.map((r) => r.data).filter((p) => p && p.price != null),
    isLoading: results.some((r) => r.isLoading),
    isRefetching: results.some((r) => r.isRefetching),
  };
}

export function useProductsByIds(ids) {
  return useQueries({ queries: ids.map(productQueryOptions), combine: combineProducts });
}
