import fsaLookup from "../data/fsaLookup.json";
import { distanceKm } from "./location";

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
