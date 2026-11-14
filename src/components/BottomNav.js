import { memo, useCallback } from "react";
import { View, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, User } from "lucide-react-native";

import { colors } from "../theme/colors";

const TABS = [
  { key: "home", label: "Home", icon: Home, href: "/(drawer)" },
  { key: "search", label: "Search", icon: Search, href: "/(drawer)/search" },
  { key: "profile", label: "Profile", icon: User, href: "/(drawer)/profile" },
];

const BAR_HEIGHT = 68;
const PILL_WIDTH = 64;
const PILL_HEIGHT = 44;

function BottomNavView({ active: activeKey = null }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const goTo = useCallback((href) => router.navigate(href), [router]);

  return (
    <View
      className="absolute left-5 right-5 flex-row items-center bg-white"
      style={{
        height: BAR_HEIGHT,
        borderRadius: BAR_HEIGHT / 2,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 8,
        bottom: Math.max(insets.bottom, 12),
        ...Platform.select({
          android: {},
          default: { shadowColor: colors.ink, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
        }),
      }}
    >
      {TABS.map((tab) => (
        <Tab key={tab.key} tab={tab} active={tab.key === activeKey} onGo={goTo} />
      ))}
    </View>
  );
}

export const BottomNav = memo(BottomNavView);

const Tab = memo(function Tab({ tab, active, onGo }) {
  return (
    <Pressable
      onPress={() => !active && onGo(tab.href)}
      hitSlop={{ top: 10, bottom: 10 }}
      className="flex-1 items-center justify-center"
    >
      <View
        style={{
          width: PILL_WIDTH,
          height: PILL_HEIGHT,
          borderRadius: PILL_HEIGHT / 2,
          overflow: "hidden",
          backgroundColor: active ? colors.accent : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <tab.icon color={active ? "#fff" : colors.muted} size={20} />
      </View>
    </Pressable>
  );
});
