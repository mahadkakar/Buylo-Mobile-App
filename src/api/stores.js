import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "./django";
import { NEAREST_STORES_CACHE } from "../lib/cacheTimes";
import { roundedLocation } from "../lib/location";

export function useNearestStores(location, radiusKm) {
  const rounded = roundedLocation(location);
  return useQuery({
    queryKey: ["stores", "nearest", rounded?.lat, rounded?.lng, radiusKm],
    queryFn: async () => {
      const radiusParam = Number.isFinite(radiusKm) ? `&radius_km=${radiusKm}` : "";
      const params = rounded ? `?lat=${rounded.lat}&lng=${rounded.lng}${radiusParam}` : "";
      return apiFetch(`/api/stores/nearest/${params}`);
    },
    ...NEAREST_STORES_CACHE,
  });
}
