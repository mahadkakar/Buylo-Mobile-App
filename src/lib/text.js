export function plainName(name) {
  return (name || "").replace(/\s+[-–—]\s+/g, " ");
}

export function neighbourhoodName(label) {
  const text = (label || "").trim();
  const name = text.replace(/\s*\(.*$/, "").trim();
  return name || text;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}
