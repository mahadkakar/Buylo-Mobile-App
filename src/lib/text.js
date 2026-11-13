// Store names arrive as "Food Basics - Toronto"; shown without the dash.
export function plainName(name) {
  return (name || "").replace(/\s+[-–—]\s+/g, " ");
}

// A loose email check for forms (the server has the final say): something@something.something with no spaces.
export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}
