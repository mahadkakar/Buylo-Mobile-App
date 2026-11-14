export const COVERAGE_LIMIT_KM = 100;

export function roundCoord(value) {
  return Math.round(value * 100) / 100;
}

export function roundedLocation(location) {
  return location ? { lat: roundCoord(location.lat), lng: roundCoord(location.lng) } : null;
}

export function locationKey(location) {
  const rounded = roundedLocation(location);
  return rounded ? `${rounded.lat},${rounded.lng}` : "none";
}

export function isOutOfCoverage(distanceKm) {
  return distanceKm != null && distanceKm > COVERAGE_LIMIT_KM;
}

export function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}
