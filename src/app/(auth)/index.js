import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { APP_NAME } from "../../lib/brand";
import { Logo } from "../../components/Logo";

export default function Welcome() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-base px-6 justify-between py-16">
      <View className="flex-1 items-center justify-center gap-6">
        <Logo size={96} />
        <View className="items-center gap-3">
          <Text className="font-sans-extrabold text-4xl text-ink text-center">{APP_NAME}</Text>
          <Text className="font-sans-medium text-base text-muted text-center leading-6 max-w-xs">
            Find the cheapest store for your groceries.
          </Text>
        </View>
      </View>

      <View className="gap-3">
        <Pressable
          onPress={() => router.push("/(auth)/sign-up")}
          className="bg-accent rounded-2xl py-4 items-center active:opacity-90"
        >
          <Text className="font-sans-bold text-base text-white">Get started</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(auth)/sign-in")}
          className="py-4 items-center"
        >
          <Text className="font-sans-semibold text-base text-ink">I already have an account</Text>
        </Pressable>
      </View>
    </View>
  );
}
