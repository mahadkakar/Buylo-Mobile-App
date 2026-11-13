// Beyond this distance from every store we have, the user is effectively
// outside the area we cover (e.g. travelling) rather than just far from the
// nearest store.
export const COVERAGE_LIMIT_KM = 100;

// Coordinates are rounded to 2 decimals (~1 km) before they leave the device.
// Store-level matching doesn't need more, it keeps exact positions out of
// server logs, and it stops tiny GPS jitter from creating a new cached query
// every time.
export function roundCoord(value) {
  return Math.round(value * 100) / 100;
}

export function roundedLocation(location) {
  return location ? { lat: roundCoord(location.lat), lng: roundCoord(location.lng) } : null;
}

// Stable string for "where was this computed" (cache keys, staleness checks).
export function locationKey(location) {
  const rounded = roundedLocation(location);
  return rounded ? `${rounded.lat},${rounded.lng}` : "none";
}

export function isOutOfCoverage(distanceKm) {
  return distanceKm != null && distanceKm > COVERAGE_LIMIT_KM;
}

// Great-circle distance in km (same formula as the backend's haversine_km).
export function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}
