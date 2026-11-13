import { useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { confirmDialog, showToast } from "../../store/uiStore";
import { BottomNav } from "../../components/BottomNav";
import { Bookmark, Pencil, RefreshCw, Trash2, ChevronRight } from "lucide-react-native";

import { colors } from "../../theme/colors";
import { AppHeader } from "../../components/AppHeader";
import { SaveBasketModal } from "../../components/SaveBasketModal";
import { useBasketStore } from "../../store/basketStore";
import { useSavedBasketsStore } from "../../store/savedBasketsStore";
import { ignoreParentRenders } from "../../lib/ignoreParentRenders";

function relativeTime(timestamp) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function SavedBaskets() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const activeItems = useBasketStore((state) => state.items);
  const setActiveItems = useBasketStore((state) => state.setItems);

  const baskets = useSavedBasketsStore((state) => state.baskets);
  const rename = useSavedBasketsStore((state) => state.rename);
  const remove = useSavedBasketsStore((state) => state.remove);

  const [renaming, setRenaming] = useState(null); // basket being renamed, or null

  const loadBasket = (basket) => {
    setActiveItems(basket.items);
    router.push("/(drawer)/basket");
  };

  const handleLoad = (basket) => {
    if (activeItems.length > 0) {
      confirmDialog({
        title: "Replace your current basket?",
        message: `Loading "${basket.name}" will replace the ${activeItems.length} item${activeItems.length === 1 ? "" : "s"} currently in your basket.`,
        confirmLabel: "Replace",
        tone: "danger",
        icon: RefreshCw,
        onConfirm: () => loadBasket(basket),
      });
      return;
    }
    loadBasket(basket);
  };

  const handleDelete = (basket) => {
    confirmDialog({
      title: "Delete this saved basket?",
      message: `"${basket.name}" will be removed. This can't be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
      icon: Trash2,
      onConfirm: () => {
        remove(basket.id);
        showToast("Basket deleted");
      },
    });
  };

  if (baskets.length === 0) {
    return (
      <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
        <AppHeader />
        <View className="flex-1 items-center justify-center px-8 gap-3">
          <View className="w-16 h-16 rounded-2xl bg-accent-soft items-center justify-center mb-2">
            <Bookmark color={colors.accent} size={28} />
          </View>
          <Text className="font-sans-bold text-lg text-ink text-center">No saved baskets yet</Text>
          <Text className="font-sans-medium text-sm text-muted text-center leading-5">
            Add items to your basket, then tap "Save" there to keep it here for next time.
          </Text>
          <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.push("/(drawer)/basket")} className="flex-row items-center gap-1.5 mt-2">
            <ChevronRight color={colors.accent} size={14} />
            <Text className="font-sans-semibold text-sm text-accent">Go to basket</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      <AppHeader />
      <View className="px-5 pb-1">
        <Text className="font-sans-extrabold text-xl text-ink">Saved Baskets</Text>
        <Text className="font-sans-medium text-sm text-muted mt-0.5">
          {baskets.length} basket{baskets.length === 1 ? "" : "s"}
        </Text>
      </View>

      <FlatList
        data={baskets}
        keyExtractor={(basket) => basket.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: basket }) => (
          <Pressable
            onPress={() => handleLoad(basket)}
            className="bg-white border border-border rounded-2xl px-4 py-3.5"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-accent-soft items-center justify-center">
                <Bookmark color={colors.accent} size={16} />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-[14.5px] text-ink" numberOfLines={1}>
                  {basket.name}
                </Text>
                <Text className="font-sans-medium text-[11.5px] text-muted mt-0.5">
                  {basket.items.length} item{basket.items.length === 1 ? "" : "s"} · Updated {relativeTime(basket.updatedAt)}
                </Text>
              </View>
              <ChevronRight color={colors.muted} size={18} />
            </View>

            <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-border">
              <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => setRenaming(basket)} className="flex-row items-center gap-1.5">
                <Pencil color={colors.muted} size={13} />
                <Text className="font-sans-medium text-xs text-muted">Rename</Text>
              </Pressable>
              <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => handleDelete(basket)} className="flex-row items-center gap-1.5">
                <Trash2 color={colors.muted} size={13} />
                <Text className="font-sans-medium text-xs text-muted">Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      />

      <BottomNav />

      <SaveBasketModal
        visible={!!renaming}
        initialName={renaming?.name ?? ""}
        title="Rename basket"
        confirmLabel="Rename"
        onClose={() => setRenaming(null)}
        onConfirm={(name) => {
          rename(renaming.id, name);
          showToast("Basket renamed");
          setRenaming(null);
        }}
      />
    </View>
  );
}

// See lib/ignoreParentRenders.js: this screen takes no props and updates through its own hooks.
export default ignoreParentRenders(SavedBaskets);
