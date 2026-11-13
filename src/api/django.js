import { supabase } from "./supabase";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const REQUEST_TIMEOUT_MS = 30000; // generous: a first comparison on a cold server can take several seconds

if (!apiUrl) {
  console.warn(
    "Missing EXPO_PUBLIC_API_URL — copy .env.example to .env and fill in your Django backend's URL."
  );
}

// Thin fetch wrapper for the Django API, mirroring supabase.js's simplicity.
// Attaches the current Supabase session as a Bearer token — the backend's
// SupabaseJWTAuthentication verifies it the same way for every endpoint.
export async function apiFetch(path, { method = "GET", body } = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  // A request that never answers would leave its spinner on screen forever: give up after a while so the screen can
  // show its error state (and react-query can retry).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error?.name === "AbortError") throw new Error(`API ${path} timed out`);
    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const error = new Error(`API ${path} failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  // A 204 (or any genuinely empty body, e.g. DELETE endpoints) has nothing
  // to parse — response.json() throws on empty input, which would turn a
  // successful delete into a reported failure. Confirmed live against
  // DeleteAccountView's 204 response.
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
