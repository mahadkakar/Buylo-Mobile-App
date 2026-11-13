import fsaLookup from "../data/fsaLookup.json";
import { distanceKm } from "./location";

// Toronto + GTA Forward Sortation Areas (the first 3 characters of a
// Canadian postal code, e.g. "M5V") with centroid coordinates. Full
// 6-character postal codes have precise lat/lng but that data is Canada
// Post's proprietary product — FSA-level is the finest free, legally
// usable granularity, and it's already finer than our own Store rows
// (store-level precision), so matching a user's FSA against store
// coordinates isn't a precision downgrade. Data: GeoNames.org, CC BY 4.0
// (see profile.js's attribution line) — restricted to "M" (Toronto) and
// "L" (rest of the GTA/Golden Horseshoe) prefixes since every real store
// we have falls in that range; add more provinces' FSAs here if store
// coverage ever goes national.

// Every real store's own postal-code prefix is covered by this file
// (verified against the live DB when it was built) — if that stops being
// true as new stores are added outside Ontario, this list needs updating.
export function searchFsa(query, limit = 20) {
  const q = (query || "").trim().toUpperCase();
  if (!q) return fsaLookup.slice(0, limit);

  const starts = [];
  const contains = [];
  for (const entry of fsaLookup) {
    if (entry.fsa.startsWith(q)) {
      starts.push(entry);
    } else if (entry.label.toUpperCase().includes(q) || entry.city.toUpperCase().includes(q)) {
      contains.push(entry);
    }
  }
  return [...starts, ...contains].slice(0, limit);
}

export function findFsaByCode(fsa) {
  return fsaLookup.find((entry) => entry.fsa === (fsa || "").toUpperCase());
}

// Nearest FSA centroid to a given lat/lng, with its real distance in km — used
// to label a GPS-derived location with a readable name, while the actual
// nearest-store lookup still uses the GPS coordinates, not the FSA centroid.
// The distance lets the caller refuse a label that's too far away to be
// meaningful (this list only covers the GTA, so a position in Ottawa would
// otherwise be labelled "Near <some GTA neighbourhood>"). Plain squared
// degrees were used before; that skews east-west at this latitude.
export function nearestFsaLabel(lat, lng) {
  let best = null;
  let bestKm = Infinity;
  for (const entry of fsaLookup) {
    const km = distanceKm(lat, lng, entry.lat, entry.lng);
    if (km < bestKm) {
      bestKm = km;
      best = entry;
    }
  }
  return best ? { ...best, distanceKm: bestKm } : null;
}
