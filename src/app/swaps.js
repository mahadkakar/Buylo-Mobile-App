import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react-native";

import { colors } from "../theme/colors";
import { useSuggestions } from "../api/suggestions";
import { SwapCard } from "../components/SwapCard";
import { useBasketStore } from "../store/basketStore";
import { useComparisonStore } from "../store/comparisonStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { swapWithUndo } from "../lib/swaps";
import { rowLeaveAnimation } from "../theme/shadows";

// Review swaps: cheaper brands of the same product, one tab per store. A swap applies to that store only: the basket
// keeps the original product and each store is priced with its own accepted swaps.
//
// The screen keeps its own state so a swap never moves you around: the open store stays open, the swapped card leaves
// at once with a short animation, and the refreshed suggestions arrive quietly behind it.
export default function Swaps() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const items = useBasketStore((state) => state.items);
  const location = usePreferencesStore((state) => state.location);
  const results = useComparisonStore((state) => state.results);
  const { data, isLoading, isError, isFetching } = useSuggestions(items, location);
  const keepOriginal = useBasketStore((state) => state.keepOriginal);
  const showKeptAgain = useBasketStore((state) => state.showKeptAgain);
  const hiddenCount = data?.hiddenCount ?? 0; // suggestions the shopper turned down with "Keep mine"

  const [selected, setSelected] = useState(null);
  const [swapped, setSwapped] = useState({}); // "store:slug" swapped during this visit: no more suggestions there

  const stores = useMemo(
    () =>
      (data?.retailers ?? []).map((store) => ({
        ...store,
        suggestions: store.suggestions.filter((s) => !swapped[`${store.id}:${s.slug}`]),
      })),
    [data, swapped]
  );

  // Open on the store that was cheapest in the comparison (else the one with the biggest saving), then stay put.
  const cheapestId = results?.[0]?.id;
  const fallbackId = [...stores].sort((a, b) => b.suggestions.length - a.suggestions.length)[0]?.id;
  const defaultId = stores.find((s) => s.id === cheapestId && s.suggestions.length)?.id ?? fallbackId;
  useEffect(() => {
    if (selected == null && defaultId) setSelected(defaultId);
  }, [defaultId, selected]);
  const activeId = selected ?? defaultId;

  const active = stores.find((s) => s.id === activeId);
  const visible = active?.suggestions ?? [];
  const visibleSaving = visible.reduce((sum, s) => sum + s.saving, 0);
  const otherWithSuggestions = stores.filter((s) => s.id !== activeId && s.suggestions.length > 0);

  const markSwapped = (list) =>
    setSwapped((prev) => {
      const next = { ...prev };
      list.forEach((s) => {
        next[`${activeId}:${s.slug}`] = true;
      });
      return next;
    });
  const swapOne = (suggestion) => {
    markSwapped([suggestion]);
    swapWithUndo([suggestion], { id: active.id, name: active.name }, queryClient);
  };
  const swapAll = () => {
    markSwapped(visible);
    swapWithUndo(visible, { id: active.id, name: active.name }, queryClient);
  };

  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-5 pt-3 pb-1">
        <Pressable onPress={() => router.back()} hitSlop={6} className="w-11 h-11 rounded-xl bg-white items-center justify-center -ml-1">
          <ArrowLeft color={colors.ink} size={20} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: visible.length > 1 ? 130 : 40 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.savingsSoft }}>
            <Sparkles color={colors.savings} size={20} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-extrabold text-[24px] text-ink">Ways to save</Text>
            <Text className="font-sans-medium text-muted" style={{ fontSize: 13 }}>
              Same product, cheaper brand
            </Text>
          </View>
          {isFetching && !isLoading ? <ActivityIndicator color={colors.muted} size="small" /> : null}
        </View>

        {stores.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {stores.map((store) => {
              const on = store.id === activeId;
              return (
                <Pressable
                  key={store.id}
                  onPress={() => setSelected(store.id)}
                  className={`rounded-full px-4 py-2.5 ${on ? "bg-ink" : "bg-white"}`}
                  hitSlop={4}
                >
                  <Text className={`font-sans-bold text-[13px] ${on ? "text-white" : "text-ink"}`}>
                    {store.name}
                    {store.suggestions.length ? `  ·  ${store.suggestions.length}` : ""}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {isLoading ? (
          <View className="items-center py-16" style={{ gap: 12 }}>
            <ActivityIndicator color={colors.accent} />
            <Text className="font-sans-semibold text-ink" style={{ fontSize: 14 }}>Looking for cheaper brands</Text>
            <Text className="font-sans-medium text-muted text-center" style={{ fontSize: 12.5 }}>
              Checking every store for the same products
            </Text>
          </View>
        ) : isError ? (
          <Text className="font-sans-medium text-muted text-center py-8">Couldn't load suggestions. Try again in a moment.</Text>
        ) : visible.length === 0 ? (
          <View className="items-center py-14" style={{ gap: 8 }}>
            <CheckCircle2 color={colors.savings} size={34} />
            <Text className="font-sans-bold text-[16px] text-ink">
              {Object.keys(swapped).some((key) => key.startsWith(`${activeId}:`)) ? `All set at ${active?.name ?? "this store"}` : "Nothing cheaper to suggest"}
            </Text>
            <Text className="font-sans-medium text-muted text-center" style={{ fontSize: 13 }}>
              {otherWithSuggestions.length
                ? `${otherWithSuggestions[0].name} has ${otherWithSuggestions[0].suggestions.length} more to review.`
                : "Your basket is already a good price here."}
            </Text>
            {otherWithSuggestions.length ? (
              <Pressable onPress={() => setSelected(otherWithSuggestions[0].id)} className="rounded-full px-5 py-3 bg-ink mt-2" hitSlop={6}>
                <Text className="font-sans-bold text-[13px] text-white">See {otherWithSuggestions[0].name}</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => router.back()} className="rounded-full px-5 py-3 bg-ink mt-2" hitSlop={6}>
                <Text className="font-sans-bold text-[13px] text-white">Back to results</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <>
            <View className="rounded-3xl px-5 py-4" style={{ backgroundColor: colors.savingsSoft }}>
              <Text className="font-sans-bold uppercase tracking-wide" style={{ fontSize: 11, color: colors.savings }}>
                You could save at {active.name}
              </Text>
              <Text className="font-mono" style={{ fontSize: 34, lineHeight: 42, color: "#0F5C2C" }}>
                ${visibleSaving.toFixed(2)}
              </Text>
            </View>

            {visible.map((suggestion, index) => (
              <Animated.View key={`${suggestion.slug}:${suggestion.alternative.slug}`} {...rowLeaveAnimation}>
                <SwapCard
                  suggestion={suggestion}
                  index={index}
                  store={{ id: active.id, name: active.name }}
                  onSwap={() => swapOne(suggestion)}
                  onKeep={() => keepOriginal(suggestion.slug, active.id, suggestion.alternative.slug)}
                  onOpen={() => router.push(`/product/${suggestion.alternative.slug}`)}
                />
              </Animated.View>
            ))}
          </>
        )}

        {hiddenCount > 0 ? (
          <Pressable onPress={showKeptAgain} className="items-center py-2" hitSlop={8}>
            <Text className="font-sans-medium text-muted text-center" style={{ fontSize: 12.5 }}>
              {hiddenCount} suggestion{hiddenCount === 1 ? "" : "s"} you kept {hiddenCount === 1 ? "is" : "are"} hidden.{" "}
              <Text className="font-sans-bold text-accent">Show again</Text>
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {visible.length > 1 ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16),
            backgroundColor: colors.base,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Pressable
            onPress={swapAll}
            style={{ backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
          >
            <Text className="font-sans-bold text-base text-white">Swap all and save ${visibleSaving.toFixed(2)}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
