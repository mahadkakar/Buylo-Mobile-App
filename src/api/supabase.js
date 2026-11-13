import { createClient } from "@supabase/supabase-js";

import { secureStorage } from "../lib/secureStorage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — copy .env.example to .env and fill in your Supabase project's values."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Encrypted at rest: see lib/secureStorage.js (the key lives in the phone's keystore).
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Browser sign in (Google, Apple on Android) comes back to the app with a one time `code` that only this app, which
    // holds the matching secret, can exchange for a session (lib/socialAuth.js). The library's default ("implicit")
    // returns the tokens themselves inside the redirect link, where any app that can claim the link could read them.
    flowType: "pkce",
  },
});
