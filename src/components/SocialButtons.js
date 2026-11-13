import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";

import { useAuthProviders } from "../api/authProviders";
import { AppleLogo, GoogleLogo } from "./BrandIcons";
import { colors } from "../theme/colors";
import { signInWithApple, signInWithGoogle } from "../lib/socialAuth";

// "or continue with" plus the Apple and Google buttons for the providers the project has switched on. Shared by the
// sign in and sign up screens; `onError` receives a message to show (or null to clear it).
export function SocialButtons({ onError }) {
  const providers = useAuthProviders();
  const [busy, setBusy] = useState(null);

  if (!providers.apple && !providers.google) return null;

  const run = async (name, signIn) => {
    if (busy) return;
    onError(null);
    setBusy(name);
    try {
      const message = await signIn();
      if (message) onError(message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View>
      <View className="flex-row items-center gap-3 my-6">
        <View className="flex-1 h-px bg-border" />
        <Text className="font-sans-medium text-xs text-muted">or continue with</Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      <View className="gap-3">
        {providers.google && (
          <Pressable
            onPress={() => run("google", signInWithGoogle)}
            disabled={!!busy}
            className="border border-border rounded-2xl py-4 items-center active:opacity-70"
          >
            {busy === "google" ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <View className="flex-row items-center" style={{ gap: 10 }}>
                <GoogleLogo size={20} />
                <Text className="font-sans-semibold text-base text-ink">Continue with Google</Text>
              </View>
            )}
          </Pressable>
        )}
        {providers.apple &&
          (Platform.OS === "ios" ? (
            // Apple's own button, as its design rules require on iPhone.
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={16}
              style={{ width: "100%", height: 52 }}
              onPress={() => run("apple", signInWithApple)}
            />
          ) : (
            <Pressable
              onPress={() => run("apple", signInWithApple)}
              disabled={!!busy}
              className="rounded-2xl py-4 items-center active:opacity-80"
              style={{ backgroundColor: "#000" }}
            >
              {busy === "apple" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center" style={{ gap: 10 }}>
                  <AppleLogo size={20} color="#fff" />
                  <Text className="font-sans-semibold text-base text-white">Continue with Apple</Text>
                </View>
              )}
            </Pressable>
          ))}
      </View>
    </View>
  );
}
