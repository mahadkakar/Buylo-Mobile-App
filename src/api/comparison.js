import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "./django";
import { COMPARISON_CACHE } from "../lib/cacheTimes";
import { chosenSize, lineId } from "../lib/itemSize";
import { locationKey, roundedLocation } from "../lib/location";
import { basketSignature } from "../store/comparisonStore";

export function swapsForRequest(item) {
  const swaps = item.storeSwaps ?? {};
  const out = {};
  Object.entries(swaps).forEach(([store, swap]) => {
    out[store] = { slug: swap.slug, sizeLabel: swap.sizeLabel };
  });
  return out;
}

export async function postComparison(items, location) {
  const rounded = roundedLocation(location);
  return apiFetch("/api/comparison/", {
    method: "POST",
    body: {
      items: items.map((item) => ({
        slug: item.canonicalProductId,
        lineId: lineId(item),
        quantityValue: item.quantityValue,
        sizeLabel: chosenSize(item),
        storeSwaps: swapsForRequest(item),
      })),
      ...(rounded ? { lat: rounded.lat, lng: rounded.lng } : {}),
    },
  });
}

function comparisonQueryKey(items, location) {
  return [
    "comparison",
    basketSignature(items),
    locationKey(location),
  ];
}

export function fetchComparison(queryClient, items, location) {
  return queryClient.fetchQuery({
    queryKey: comparisonQueryKey(items, location),
    queryFn: () => postComparison(items, location),
    staleTime: COMPARISON_CACHE.staleTime,
  });
}

export function useComparisonQuery(items, location) {
  return useQuery({
    queryKey: comparisonQueryKey(items, location),
    queryFn: () => postComparison(items, location),
    enabled: items.length > 0,
    ...COMPARISON_CACHE,
  });
}
