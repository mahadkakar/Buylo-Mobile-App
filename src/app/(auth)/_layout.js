import { Stack } from "expo-router";

export default function AuthLayout() {
  // Sign in and sign up swap places with a short fade (the screens replace each other, see sign-in.js / sign-up.js) instead of
  // sliding in from the side over one another; the white background behind the fade avoids a flash between the two.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 180,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    />
  );
}
