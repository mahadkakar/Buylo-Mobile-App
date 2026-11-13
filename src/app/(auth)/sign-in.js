import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

import { supabase } from "../../api/supabase";
import { colors } from "../../theme/colors";
import { AuthIllustration } from "../../components/AuthIllustration";
import { SocialButtons } from "../../components/SocialButtons";

export default function SignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) setError(error.message);
    // On success, the root layout's onAuthStateChange listener updates
    // useAuthStore and Stack.Protected switches to the (tabs) group.
  };

  return (
    <View className="flex-1 bg-white">
    <Pressable
      onPress={() => router.back()}
      hitSlop={6}
      className="absolute left-6 z-10 w-11 h-11 rounded-xl bg-base items-center justify-center"
      style={{ top: insets.top + 12 }}
    >
      <ArrowLeft color={colors.ink} size={20} />
    </Pressable>
    <ScrollView
      className="flex-1"
      // The system bars are measured, not guessed: on Android the form used to run under the back and home buttons.
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingTop: insets.top + 72,
        paddingBottom: insets.bottom + 32,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <AuthIllustration variant="signin" />

      <Text className="font-sans-extrabold text-[28px] text-ink text-center mt-2 mb-6">Welcome back</Text>

      <View className="gap-3 mb-2">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          className="font-sans text-base text-ink bg-base rounded-2xl px-4 py-4"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          className="font-sans text-base text-ink bg-base rounded-2xl px-4 py-4"
        />
      </View>

      <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.push("/(auth)/forgot-password")} className="self-end mb-6">
        <Text className="font-sans-semibold text-sm text-accent">Forgot password?</Text>
      </Pressable>

      {error ? <Text className="font-sans-medium text-sm text-red-600 mb-4">{error}</Text> : null}

      <Pressable
        onPress={handleSignIn}
        disabled={loading}
        className="bg-accent rounded-2xl py-4 items-center active:opacity-90"
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="font-sans-bold text-base text-white">Sign in</Text>}
      </Pressable>

      <SocialButtons onError={setError} />

      <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.replace("/(auth)/sign-up")} className="mt-8 items-center">
        <Text className="font-sans-medium text-sm text-muted">
          Don't have an account? <Text className="font-sans-bold text-accent">Sign up</Text>
        </Text>
      </Pressable>
    </ScrollView>
    </View>
  );
}
