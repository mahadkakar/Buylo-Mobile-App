import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

import { supabase } from "../../api/supabase";
import { colors } from "../../theme/colors";
import { AuthIllustration } from "../../components/AuthIllustration";
import { SocialButtons } from "../../components/SocialButtons";
import { isEmail } from "../../lib/text";

export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    if (!isEmail(email)) {
      setError("That email address doesn't look right.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const name = fullName.trim();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: name ? { data: { full_name: name } } : undefined,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session === null) setCheckEmail(true);
  };

  if (checkEmail) {
    return (
      <View className="flex-1 bg-base px-6 justify-center items-center gap-3">
        <Text className="font-sans-extrabold text-2xl text-ink text-center">Check your email</Text>
        <Text className="font-sans-medium text-sm text-muted text-center leading-6 max-w-xs">
          We sent a confirmation link to {email}. Tap it to finish creating your account.
        </Text>
        <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.replace("/(auth)/sign-in")} className="mt-6">
          <Text className="font-sans-bold text-sm text-accent">Back to sign in</Text>
        </Pressable>
      </View>
    );
  }

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
      <AuthIllustration variant="signup" />

      <Text className="font-sans-extrabold text-[28px] text-ink text-center mt-2 mb-6">Create your account</Text>

      <View className="gap-3 mb-2">
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name (optional)"
          placeholderTextColor={colors.muted}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          maxLength={80}
          className="font-sans text-base text-ink bg-base rounded-2xl px-4 py-4"
        />
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

      {error ? <Text className="font-sans-medium text-sm text-red-600 mb-4 mt-2">{error}</Text> : null}

      <Pressable
        onPress={handleSignUp}
        disabled={loading}
        className="bg-accent rounded-2xl py-4 items-center active:opacity-90 mt-4"
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="font-sans-bold text-base text-white">Create account</Text>}
      </Pressable>

      <SocialButtons onError={setError} />

      <Text className="font-sans-medium text-xs text-muted text-center mt-6 leading-5">
        By continuing you agree to our Terms of Service and Privacy Policy.
      </Text>

      <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.replace("/(auth)/sign-in")} className="mt-8 items-center">
        <Text className="font-sans-medium text-sm text-muted">
          Already have an account? <Text className="font-sans-bold text-accent">Sign in</Text>
        </Text>
      </Pressable>
    </ScrollView>
    </View>
  );
}
