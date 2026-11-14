import { memo, useCallback, useRef } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Home, Bookmark, Settings, BadgeCheck, LogOut } from "lucide-react-native";

import { logOut } from "../lib/session";
import { confirmDialog } from "../store/uiStore";

import { colors } from "../theme/colors";
import { CATEGORIES } from "../constants/categories";
import { APP_NAME } from "../lib/brand";
import { Logo } from "./Logo";

const HOME_HREF = "/(drawer)";
const SAVED_HREF = "/(drawer)/saved-baskets";
const SETTINGS_HREF = "/(drawer)/profile";
const CATEGORY_LINKS = CATEGORIES.map((category) => ({
  category,
  href: { pathname: "/(drawer)/categories", params: { category: category.slug } },
}));

function SidebarView({ navigation, state }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const focused = state?.routes?.[state.index];
  const activeCategory = focused?.name === "categories" ? focused.params?.category : undefined;
  const navigationRef = useRef(navigation);
  navigationRef.current = navigation;

  const confirmLogout = useCallback(() => {
    confirmDialog({
      title: "Log out of Buylo?",
      message: "Your current basket will be cleared. Your saved baskets stay on this phone for when you sign back in.",
      confirmLabel: "Log out",
      tone: "danger",
      icon: LogOut,
      onConfirm: () => {
        navigationRef.current?.closeDrawer?.();
        logOut();
      },
    });
  }, []);

  const go = useCallback(
    (href) => {
      navigationRef.current?.closeDrawer?.();
      requestAnimationFrame(() => router.push(href));
    },
    [router]
  );
  const close = useCallback(() => navigationRef.current?.closeDrawer?.(), []);

  const screen = focused?.name;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4 border-b border-border">
        <View className="flex-row items-center gap-2">
          <Logo size={24} />
          <Text className="font-sans-extrabold text-[19px] text-ink">{APP_NAME}</Text>
        </View>
        <Pressable onPress={close} hitSlop={10} className="w-8 h-8 items-center justify-center">
          <X color={colors.muted} size={20} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <Text className="font-sans-bold text-[11px] text-muted tracking-wide uppercase px-5 pt-5 pb-2">
          App Hub
        </Text>
        <SidebarItem icon={Home} label="Home" active={screen === "index"} href={HOME_HREF} onGo={go} />
        <SidebarItem icon={Bookmark} label="Saved Baskets" active={screen === "saved-baskets"} href={SAVED_HREF} onGo={go} />

        <Text className="font-sans-bold text-[11px] text-muted tracking-wide uppercase px-5 pt-6 pb-2">
          Categories
        </Text>
        {CATEGORY_LINKS.map(({ category, href }) => (
          <SidebarItem
            key={category.slug}
            icon={category.icon}
            label={category.name}
            active={screen === "categories" && activeCategory === category.slug}
            href={href}
            onGo={go}
          />
        ))}
      </ScrollView>

      <View className="border-t border-border">
        <SidebarItem icon={Settings} label="Settings" active={screen === "profile"} href={SETTINGS_HREF} onGo={go} />
        <SidebarItem icon={LogOut} label="Log out" danger onPress={confirmLogout} />
        <View
          className="flex-row items-center gap-2 px-5 py-3 bg-base"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <BadgeCheck color={colors.accent} size={16} />
          <View>
            <Text className="font-sans-bold text-[12px] text-ink">{APP_NAME}</Text>
            <Text className="font-sans-medium text-[10.5px] text-muted">v1.0 · Live price comparison</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const SidebarItem = memo(function SidebarItem({ icon: Icon, label, active, danger, href, onGo, onPress }) {
  return (
    <Pressable
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      onPress={onPress ?? (() => onGo(href))}
      className={`flex-row items-center gap-3 mx-3 px-3 py-3.5 mb-1 rounded-xl ${active ? "bg-accent-soft" : ""}`}
    >
      <Icon color={danger ? "#DC2626" : active ? colors.accent : colors.muted} size={18} />
      <Text className={`font-sans-semibold text-[13.5px] ${danger ? "text-red-600" : active ? "text-accent" : "text-ink"}`} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
});

const focusedKey = (props) => {
  const route = props.state?.routes?.[props.state.index];
  return route ? `${route.name}:${route.params?.category ?? ""}` : "";
};
export const Sidebar = memo(SidebarView, (previous, next) => focusedKey(previous) === focusedKey(next));
