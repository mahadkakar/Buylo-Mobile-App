export function plainName(name) {
  return (name || "").replace(/\s+[-–—]\s+/g, " ");
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}
