import { supabase } from "../api/supabase";
import { setBusy } from "../store/uiStore";

// Signs out with a visible "Logging out" overlay: the call is a network request, and without feedback the screen
// looks frozen after confirming.
export async function logOut() {
  setBusy("Logging out");
  try {
    await supabase.auth.signOut();
  } finally {
    setBusy(null);
  }
}
