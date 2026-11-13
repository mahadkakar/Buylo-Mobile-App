import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Trash2, TriangleAlert } from "lucide-react-native";

import { colors } from "../../theme/colors";
import { supabase } from "../../api/supabase";
import { apiFetch } from "../../api/django";
import { APP_NAME } from "../../lib/brand";
import { confirmDialog, showNotice } from "../../store/uiStore";
import { useSavedBasketsStore } from "../../store/savedBasketsStore";

// Deleting a Supabase auth user requires the service_role key, which never
// ships in the mobile app — the real deletion happens server-side
// (accounts/views.py's DeleteAccountView: verifies this request's own JWT,
// then calls Supabase's admin API with service_role). This call just
// authenticates normally like any other apiFetch call; the backend is what
// actually has admin rights, not this request.
async function deleteAccountOnServer() {
  await apiFetch("/api/account/", { method: "DELETE" });
}

export default function DeleteAccount() {
  const [loading, setLoading] = useState(false);

  const confirmDelete = () => {
    confirmDialog({
      title: "Delete your account?",
      message: "This permanently deletes your account and the baskets saved on this phone. This can't be undone.",
      confirmLabel: "Delete account",
      tone: "danger",
      icon: Trash2,
      onConfirm: handleDelete,
    });
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAccountOnServer();
      // Deleting the account also removes the saved baskets kept on this phone (a plain log out keeps them).
      useSavedBasketsStore.getState().wipe();
      await supabase.auth.signOut();
    } catch (e) {
      showNotice("Couldn't delete account", e.message, { tone: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-base px-6 pt-6">
      <View className="bg-white border border-border rounded-2xl p-4 gap-3 mb-6">
        <TriangleAlert color="#DC2626" size={22} />
        <Text className="font-sans-bold text-base text-ink">This can't be undone</Text>
        <Text className="font-sans-medium text-sm text-muted leading-5">
          Deleting your account permanently removes your profile and basket history. You'll need
          to create a new account to use {APP_NAME} again.
        </Text>
      </View>

      <Pressable
        onPress={confirmDelete}
        disabled={loading}
        className="bg-red-600 rounded-2xl py-4 items-center active:opacity-90"
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="font-sans-bold text-base text-white">Delete my account</Text>}
      </Pressable>
    </View>
  );
}
