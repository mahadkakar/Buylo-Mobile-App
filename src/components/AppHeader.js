import { View, Text, Pressable } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { Menu, ArrowLeft, ShoppingBasket, User } from "lucide-react-native";

import { colors } from "../theme/colors";
import { useBasketStore } from "../store/basketStore";
import { PopOnChange } from "./motion";
import { APP_NAME } from "../lib/brand";
import { Logo } from "./Logo";

export function AppHeader() {
  const navigation = useNavigation();
  const router = useRouter();
  const itemCount = useBasketStore((state) => state.items.length);

  // openDrawer() only exists when this screen is part of the (drawer)
  // navigator — search.js (and any other screen registered as a top-level
  // Stack.Screen rather than nested under (drawer)) doesn't have it, which
  // crashed ("undefined is not a function") when AppHeader got reused
  // there. Fall back to a plain back arrow on those screens instead.
  const canOpenDrawer = typeof navigation.openDrawer === "function";

  return (
    <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
      <Pressable
        onPress={() => (canOpenDrawer ? navigation.openDrawer() : router.back())}
        hitSlop={10}
        className="w-9 h-9 items-center justify-center -ml-1"
      >
        {canOpenDrawer ? <Menu color={colors.ink} size={24} /> : <ArrowLeft color={colors.ink} size={24} />}
      </Pressable>

      {/* Centred on the screen itself (not between the unequal button groups), under the buttons so they stay tappable. */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", left: 0, right: 0, top: 16, bottom: 20, alignItems: "center", justifyContent: "center" }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Logo size={26} />
          <Text className="font-sans-extrabold text-[19px] text-ink">{APP_NAME}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => router.push("/(drawer)/basket")}
          hitSlop={10}
          className="w-9 h-9 items-center justify-center"
        >
          <ShoppingBasket color={colors.ink} size={21} />
          {itemCount > 0 && (
            <PopOnChange
              trigger={itemCount}
              style={{ position: "absolute", top: -6, right: -6 }}
            >
              <View className="bg-accent rounded-full min-w-[20px] h-[20px] px-1 items-center justify-center border-2 border-base">
                <Text className="font-sans-bold text-white" style={{ fontSize: 10, lineHeight: 12, includeFontPadding: false, textAlign: "center" }}>
                  {itemCount}
                </Text>
              </View>
            </PopOnChange>
          )}
        </Pressable>
        <Pressable
          onPress={() => router.push("/(drawer)/profile")}
          hitSlop={6}
        >
          <View className="w-9 h-9 rounded-full bg-accent items-center justify-center">
            <User color="#fff" size={17} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
