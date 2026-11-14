import { useQuery } from "@tanstack/react-query";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

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
  if (__DEV__) return { apple: true, google: true };
  return data ?? { apple: false, google: false };
}
