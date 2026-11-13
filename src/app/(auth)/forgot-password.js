import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { supabase } from "../../api/supabase";
import { colors } from "../../theme/colors";
import { isEmail } from "../../lib/text";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleReset = async () => {
    setError(null);
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    if (!isEmail(email)) {
      setError("That email address doesn't look right.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <View className="flex-1 bg-base px-6 pt-16">
      <Pressable onPress={() => router.back()} hitSlop={6} className="w-10 h-10 items-center justify-center -ml-2 mb-6">
        <ArrowLeft color={colors.ink} size={22} />
      </Pressable>

      <Text className="font-sans-extrabold text-2xl text-ink mb-1">Reset your password</Text>
      <Text className="font-sans-medium text-sm text-muted mb-8 leading-5">
        Enter the email on your account and we'll send you a reset link.
      </Text>

      {sent ? (
        <View className="bg-savings-soft rounded-2xl px-4 py-4">
          <Text className="font-sans-semibold text-sm text-savings">
            Check {email} for a link to reset your password.
          </Text>
        </View>
      ) : (
        <>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            className="font-sans text-base text-ink bg-white border border-border rounded-2xl px-4 py-4 mb-4"
          />
          {error ? <Text className="font-sans-medium text-sm text-red-600 mb-4">{error}</Text> : null}
          <Pressable
            onPress={handleReset}
            disabled={loading}
            className="bg-accent rounded-2xl py-4 items-center active:opacity-90"
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="font-sans-bold text-base text-white">Send reset link</Text>}
          </Pressable>
        </>
      )}
    </View>
  );
}
