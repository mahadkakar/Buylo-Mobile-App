import { showToast } from "../../store/uiStore";
import { tapSuccess } from "../../lib/haptics";
import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

import { colors } from "../../theme/colors";
import { supabase } from "../../api/supabase";

export default function ChangePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    tapSuccess();
    showToast("Password updated");
    router.back();
  };

  return (
    <View className="flex-1 bg-base px-6 pt-6">
      <Text className="font-sans-medium text-sm text-muted mb-6 leading-5">
        Choose a new password for your account. You'll stay signed in on this device.
      </Text>

      <View className="gap-3 mb-2">
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="New password (min. 8 characters)"
          placeholderTextColor={colors.muted}
          secureTextEntry
          className="font-sans text-base text-ink bg-white border border-border rounded-2xl px-4 py-4"
        />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          className="font-sans text-base text-ink bg-white border border-border rounded-2xl px-4 py-4"
        />
      </View>

      {error ? <Text className="font-sans-medium text-sm text-red-600 mb-4 mt-2">{error}</Text> : null}

      <Pressable
        onPress={handleSave}
        disabled={loading}
        className="bg-accent rounded-2xl py-4 items-center active:opacity-90 mt-4"
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="font-sans-bold text-base text-white">Update password</Text>}
      </Pressable>
    </View>
  );
}
