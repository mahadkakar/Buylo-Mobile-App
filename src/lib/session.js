import { supabase } from "../api/supabase";
import { setBusy } from "../store/uiStore";

export async function logOut() {
  setBusy("Logging out");
  try {
    await supabase.auth.signOut();
  } finally {
    setBusy(null);
  }
}
