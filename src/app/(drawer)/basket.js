import { useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { BottomNav } from "../../components/BottomNav";
import { confirmDialog, showToast } from "../../store/uiStore";
import { tapSuccess } from "../../lib/haptics";
import { ItemRow } from "../../components/ItemRow";
import { Stepper } from "../../components/Stepper";
import { ShoppingBasket, Bookmark, Trash2 } from "lucide-react-native";

import { colors } from "../../theme/colors";
import { AppHeader } from "../../components/AppHeader";
import { SaveBasketModal } from "../../components/SaveBasketModal";
import { useBasketStore } from "../../store/basketStore";
import { lineId } from "../../lib/itemSize";
import { rowLeaveAnimation } from "../../theme/shadows";
import { useComparisonStore } from "../../store/comparisonStore";
import { usePreferencesStore } from "../../store/preferencesStore";
import { useSavedBasketsStore } from "../../store/savedBasketsStore";
import { ignoreParentRenders } from "../../lib/ignoreParentRenders";

function swapNote(item) {
  const swaps = Object.values(item.storeSwaps ?? {});
  const names = (list) => list.map((swap) => swap.storeName).join(", ");
  const replaced = swaps.filter((swap) => swap.replacement);
  const cheaper = swaps.filter((swap) => !swap.replacement);
  const parts = [];
  if (cheaper.length) parts.push(`Cheaper brand at ${names(cheaper)}`);
  if (replaced.length) parts.push(`Replaced at ${names(replaced)}`);
  return parts.length ? parts.join(". ") : null;
}

function Basket() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const items = useBasketStore((state) => state.items);
  const updateQuantity = useBasketStore((state) => state.updateQuantity);
  const removeItem = useBasketStore((state) => state.removeItem);
  const startComparison = useComparisonStore((state) => state.start);
  const location = usePreferencesStore((state) => state.location);
  const saveAsNew = useSavedBasketsStore((state) => state.saveAsNew);
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  const clearBasket = useBasketStore((state) => state.clear);
  const confirmClear = () => {
    confirmDialog({
      title: "Clear your basket?",
      message: `All ${items.length} item${items.length === 1 ? "" : "s"} will be removed. Your saved baskets are not affected.`,
      confirmLabel: "Clear basket",
      tone: "danger",
      icon: Trash2,
      onConfirm: () => {
        clearBasket();
        showToast("Basket cleared");
      },
    });
  };

  const handleCompare = () => {
    startComparison(items, location);
    router.push("/comparison-results");
  };

  const handleSaveConfirm = (name) => {
    saveAsNew(name, items);
    setSaveModalVisible(false);
    tapSuccess();
    showToast(`${name} saved`);
  };

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
        <AppHeader />
        <View className="flex-1 items-center justify-center px-8 gap-3">
          <View className="w-16 h-16 rounded-2xl bg-accent-soft items-center justify-center mb-2">
            <ShoppingBasket color={colors.accent} size={28} />
          </View>
          <Text className="font-sans-bold text-lg text-ink text-center self-stretch">Your basket is empty</Text>
          <Text className="font-sans-medium text-sm text-muted text-center leading-5">
            Add products and we will compare the total across Metro, Food Basics and Walmart.
          </Text>
          <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.push("/(drawer)/saved-baskets")} className="flex-row items-center gap-1.5 mt-2">
            <Bookmark color={colors.accent} size={14} />
            <Text className="font-sans-semibold text-sm text-accent">View saved baskets</Text>
          </Pressable>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      <AppHeader />
      <View className="px-5 pb-1 flex-row items-center justify-between">
        <View>
          <Text className="font-sans-extrabold text-xl text-ink">Your Basket</Text>
          <Text className="font-sans-medium text-sm text-muted mt-0.5">{items.length} item{items.length === 1 ? "" : "s"}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Pressable
            onPress={confirmClear}
            hitSlop={6}
            className="flex-row items-center gap-1.5 rounded-full px-3 py-2"
            style={{ backgroundColor: "#FDECEC" }}
          >
            <Trash2 color="#DC2626" size={14} />
            <Text className="font-sans-bold text-xs" style={{ color: "#DC2626" }}>Clear</Text>
          </Pressable>
          <Pressable
            onPress={() => setSaveModalVisible(true)}
            hitSlop={6}
            className="flex-row items-center gap-1.5 bg-accent-soft rounded-full px-3 py-2"
          >
            <Bookmark color={colors.accent} size={14} />
            <Text className="font-sans-bold text-xs text-accent">Save</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => lineId(item)}
        contentContainerStyle={{ padding: 20, paddingBottom: 12, gap: 14 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(220)} {...rowLeaveAnimation}>
            <ItemRow
              index={index}
              image={item.image}
              category={item.category}
              name={item.name}
              brand={item.brand}
              size={item.sizeLabel ?? item.displaySize}
              price={item.price}
              note={swapNote(item) ?? (item.retailer ? `at ${item.retailer}` : null)}
              onPress={() => router.push(`/product/${item.canonicalProductId}`)}
            >
              <Stepper
                quantity={item.quantityValue}
                onIncrement={() => updateQuantity(lineId(item), item.quantityValue + 1)}
                onDecrement={() => updateQuantity(lineId(item), item.quantityValue - 1)}
              />
            </ItemRow>
          </Animated.View>
        )}
      />

      <View className="px-5 pt-3 border-t border-border" style={{ paddingBottom: Math.max(insets.bottom, 12) + 84 }}>
        <Pressable
          onPress={handleCompare}
          className="bg-accent rounded-2xl py-4 items-center active:opacity-90 flex-row justify-center gap-2"
        >
          <Text className="font-sans-bold text-base text-white">Compare prices</Text>
        </Pressable>
      </View>

      <BottomNav />

      <SaveBasketModal
        visible={saveModalVisible}
        title="Save this basket"
        confirmLabel="Save"
        onClose={() => setSaveModalVisible(false)}
        onConfirm={handleSaveConfirm}
      />
    </View>
  );
}

export default ignoreParentRenders(Basket);
