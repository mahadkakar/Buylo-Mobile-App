import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "./django";
import { swapsForRequest } from "./comparison";
import { basketSignature } from "../store/comparisonStore";
import { chosenSize, lineId } from "../lib/itemSize";
import { locationKey } from "../lib/location";
import { applyKept } from "../lib/keptSuggestions";

export async function postSuggestions(items) {
  return apiFetch("/api/comparison/suggestions/", {
    method: "POST",
    body: {
      items: items.map((item) => ({
        slug: item.canonicalProductId,
        lineId: lineId(item),
        quantityValue: item.quantityValue,
        sizeLabel: chosenSize(item),
        storeSwaps: swapsForRequest(item),
      })),
    },
  });
}

export function useSuggestions(items, location, enabled = true) {
  const select = useMemo(() => (data) => applyKept(data, items), [items]);
  return useQuery({
    queryKey: ["suggestions", basketSignature(items), locationKey(location)],
    queryFn: () => postSuggestions(items),
    enabled: enabled && items.length > 0,
    placeholderData: (previous) => previous,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select,
  });
}
