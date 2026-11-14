import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";

import { supabase } from "../api/supabase";

async function signInWithBrowser(provider) {
  const redirectTo = Linking.createURL("auth-callback");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) return error.message;
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === "success" && result.url) {
    const code = new URL(result.url).searchParams.get("code");
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) return exchangeError.message;
    }
  }
  return null;
}

export const signInWithGoogle = () => signInWithBrowser("google");

export async function signInWithApple() {
  if (Platform.OS !== "ios") return signInWithBrowser("apple");
  try {
    const nonce = Array.from(Crypto.getRandomBytes(16), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    const { error } = await supabase.auth.signInWithIdToken({ provider: "apple", token: credential.identityToken, nonce });
    return error ? error.message : null;
  } catch (e) {
    return e.code === "ERR_REQUEST_CANCELED" ? null : "Apple sign in failed. Please try again.";
  }
}
