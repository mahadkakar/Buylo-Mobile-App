import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "./django";
import { swapsForRequest } from "./comparison";
import { basketSignature } from "../store/comparisonStore";
import { chosenSize, lineId } from "../lib/itemSize";
import { locationKey } from "../lib/location";
import { applyKept } from "../lib/keptSuggestions";

// Cheaper brands for the basket, per store: see backend/baskets/suggestions.py. Keyed by the basket contents (and
// place) like the comparison, so any swap or quantity change fetches fresh suggestions.
export async function postSuggestions(items) {
  return apiFetch("/api/comparison/suggestions/", {
    method: "POST",
    body: {
      items: items.map((item) => ({
        slug: item.canonicalProductId,
        lineId: lineId(item),
        quantityValue: item.quantityValue,
        sizeLabel: chosenSize(item),
        // Stores where this item is already swapped (no more suggestions there).
        storeSwaps: swapsForRequest(item),
      })),
    },
  });
}

export function useSuggestions(items, location, enabled = true) {
  // Applied to the cached answer, so turning a suggestion down needs no new request.
  const select = useMemo(() => (data) => applyKept(data, items), [items]);
  return useQuery({
    queryKey: ["suggestions", basketSignature(items), locationKey(location)],
    queryFn: () => postSuggestions(items),
    enabled: enabled && items.length > 0,
    // After a swap the basket (and so the query key) changes: keep showing the current list until the new one arrives.
    placeholderData: (previous) => previous,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select,
  });
}
