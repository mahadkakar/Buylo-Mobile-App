import { memo, useCallback } from "react";
import { View, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, User } from "lucide-react-native";

import { colors } from "../theme/colors";

// Supplements the existing hamburger drawer (Sidebar.js) rather than
// replacing it — a quick-access bar for the most-visited destinations.
// Everything else (Saved Baskets, category list, Basket) stays reachable
// exactly as before, via the drawer or AppHeader's icons. Rendered
// per-screen (same convention as AppHeader — there's no navigator-level
// tab bar here). Shown on the primary screens plus Categories, Basket and Saved Baskets (the
// basket's Compare footer sits above it); none of the tabs highlights on those. Not on detail
// screens like product/[productId].js.
const TABS = [
  { key: "home", label: "Home", icon: Home, href: "/(drawer)" },
  { key: "search", label: "Search", icon: Search, href: "/search" },
  { key: "profile", label: "Profile", icon: User, href: "/(drawer)/profile" },
];

const BAR_HEIGHT = 68;
const PILL_WIDTH = 64;
const PILL_HEIGHT = 44;

// `active` is the key of the tab the screen belongs to ("home", "search", "profile") or nothing. The screen passes it: the bar
// used to ask the router for the current path, which re-rendered it (once per open screen) on every navigation anywhere
// in the app. Now it only draws again when its own props change.
function BottomNavView({ active: activeKey = null }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const goTo = useCallback((href) => router.navigate(href), [router]);

  // Fixed sizes and explicit radii (half the height), not "999" or a class: with a huge radius and padding that changed with the
  // active tab, Android drew the active tab as a blue rectangle with square corners (seen on a OnePlus 8 Pro). Every tab
  // is the same size now and only its colour changes, so nothing is measured twice.
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
        // iPhone: soft shadow. Android: the border above only (an elevation shadow can draw as a square before the rounded
        // outline is applied).
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

// One tab. Memoised: the bar re-renders on every navigation (it reads the path), but a tab only needs to draw again when
// it becomes or stops being the active one.
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
