import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "./django";
import { NEAREST_STORES_CACHE } from "../lib/cacheTimes";
import { roundedLocation } from "../lib/location";

// Every real store location with price data, sorted nearest-first when a
// location is given (haversine, backend-side — see
// backend/retailers/views.py's NearestStoresView). Each row has `distanceKm`
// and, because we send the user's radius, `withinRadius` — the radius is a
// soft limit, so stores outside it still come back and the UI flags them.
// Without a location the list comes back unsorted (no distance); callers
// should gate on `location` being set, as the dashboard does. Coordinates are
// rounded to ~1 km before sending (see lib/location.js).
export function useNearestStores(location, radiusKm) {
  const rounded = roundedLocation(location);
  return useQuery({
    queryKey: ["stores", "nearest", rounded?.lat, rounded?.lng, radiusKm],
    queryFn: async () => {
      // radius_km is only sent when it's a real number — the server (rightly)
      // answers 400 to junk like "undefined", which once happened when a call
      // site hadn't been updated to pass it.
      const radiusParam = Number.isFinite(radiusKm) ? `&radius_km=${radiusKm}` : "";
      const params = rounded ? `?lat=${rounded.lat}&lng=${rounded.lng}${radiusParam}` : "";
      return apiFetch(`/api/stores/nearest/${params}`);
    },
    ...NEAREST_STORES_CACHE,
  });
}
