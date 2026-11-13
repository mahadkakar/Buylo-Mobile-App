import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "./django";
import { COMPARISON_CACHE } from "../lib/cacheTimes";
import { chosenSize, lineId } from "../lib/itemSize";
import { locationKey, roundedLocation } from "../lib/location";
import { basketSignature } from "../store/comparisonStore";

// Totals a basket across nearby stores — see backend/baskets/views.py's
// ComparisonView. Synchronous: every price already exists from the last
// scrape, so this is a normal request/response, not a polled job. Results come
// back ranked (stores carrying more of the basket first), each with
// `distanceKm`, `withinRadius`, `availableCount`/`itemCount`. Coordinates are
// rounded to ~1 km before sending.
// {store: {slug, sizeLabel}} for the brand swaps the shopper accepted at each store.
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
      // sizeLabel is the package the shopper picked on the product screen (absent
      // for a quick-add); the server prices that same package at every store.
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

// Same endpoint, wrapped as a cached query for places that just want to
// *display* current totals/availability (e.g. the dashboard's nearby-store
// cards) rather than run the explicit "Compare prices nearby" job — this
// one re-fetches automatically as the basket or location changes instead
// of being manually triggered once.
function comparisonQueryKey(items, location) {
  return [
    "comparison",
    basketSignature(items),
    locationKey(location),
  ];
}

// The explicit "Compare prices nearby" request goes through the same cache entry the dashboard preview uses, so
// a basket that was just previewed (or is mid-request) is answered once instead of once per screen.
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
