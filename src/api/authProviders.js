import { useQuery } from "@tanstack/react-query";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Which sign in providers the Supabase project has switched on (its public Auth settings, no login needed). The
// social buttons use this so the app never offers a provider the project would refuse. If the lookup fails nothing
// is offered: email sign in always works.
async function fetchProviders() {
  const response = await fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseAnonKey } });
  if (!response.ok) throw new Error(`auth settings ${response.status}`);
  const { external = {} } = await response.json();
  return { apple: !!external.apple, google: !!external.google };
}

export function useAuthProviders() {
  const { data } = useQuery({
    queryKey: ["auth", "providers"],
    queryFn: fetchProviders,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  // In development the buttons always show so the layout can be checked before the providers are configured; tapping
  // one then reports the project's "provider is not enabled" message.
  if (__DEV__) return { apple: true, google: true };
  return data ?? { apple: false, google: false };
}
