import { UiLayer } from "../components/UiLayer";
import { BrandIntro } from "../components/BrandIntro";
import { ErrorScreen } from "../components/ErrorScreen";
import "../../global.css";

import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useFonts as useManropeFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { useFonts as useMonoFonts, JetBrainsMono_600SemiBold } from "@expo-google-fonts/jetbrains-mono";

import { supabase } from "../api/supabase";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";
import { resetUserData } from "../store/resetUserData";
import { useSavedBasketsStore } from "../store/savedBasketsStore";
import { syncStoredSlugs } from "../lib/syncStoredSlugs";

let slugSyncedFor = null;

export function ErrorBoundary({ retry }) {
  return <ErrorScreen retry={retry} />;
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useManropeFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [monoLoaded] = useMonoFonts({ JetBrainsMono_600SemiBold });

  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setSession = useAuthStore((state) => state.setSession);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const claimSavedBaskets = (session) => {
      useSavedBasketsStore.getState().claimFor(session?.user?.id);
      const userId = session?.user?.id;
      if (userId && slugSyncedFor !== userId) {
        slugSyncedFor = userId;
        syncStoredSlugs().catch(() => {});
      }
    };
    supabase.auth.getSession().then(({ data }) => {
      claimSavedBaskets(data.session);
      setSession(data.session);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        resetUserData();
        queryClient.clear();
      }
      claimSavedBaskets(session);
      setSession(session);
    });
    return () => subscription.subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (fontsLoaded && monoLoaded && !isLoading) {
      setReady(true);
    }
  }, [fontsLoaded, monoLoaded, isLoading]);

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View className="flex-1 bg-base" onLayout={onLayoutRootView}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              animationDuration: 220,
              contentStyle: { backgroundColor: colors.base },
            }}
          >
            <Stack.Protected guard={!!session}>
              <Stack.Screen name="(drawer)" />
              <Stack.Screen name="manual-location" />
              <Stack.Screen name="comparison-results" />
              <Stack.Screen name="swaps" />
              <Stack.Screen name="retailer-basket/[retailerId]" />
              <Stack.Screen name="product/[productId]" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="onboarding" options={{ animation: "fade", gestureEnabled: false }} />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
          </Stack>
          <UiLayer />
          <BrandIntro />
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
