import { Pressable, Text, View } from "react-native";

import { colors } from "../theme/colors";

// What expo-router shows when a screen crashes while drawing (exported as ErrorBoundary from the root layout), instead
// of a blank or red screen. It sits outside the app's providers, so it uses plain styles and the system font; fonts
// may not even be loaded when it appears.
export function ErrorScreen({ retry }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.base, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", color: colors.ink, textAlign: "center" }}>Something went wrong</Text>
      <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 }}>
        This screen ran into a problem. Your basket is safe.
      </Text>
      <Pressable
        onPress={retry}
        style={{ marginTop: 12, backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32 }}
      >
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Try again</Text>
      </Pressable>
    </View>
  );
}
