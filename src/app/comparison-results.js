import { plainName } from "../lib/text";
import { useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react-native";

import { colors } from "../theme/colors";
import { useBasketStore } from "../store/basketStore";
import { useComparisonStore } from "../store/comparisonStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { fetchComparison } from "../api/comparison";
import { useSuggestions } from "../api/suggestions";
import { CountUpMoney, PressableScale, Reveal } from "../components/motion";
import { tapSuccess } from "../lib/haptics";
import { addReplacements, swapWithUndo, useKeepComparisonFresh } from "../lib/swaps";
import { isOutOfCoverage } from "../lib/location";

export default function ComparisonResults() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  useKeepComparisonFresh();
  const items = useBasketStore((state) => state.items);
  const location = usePreferencesStore((state) => state.location);

  const suggestBrands = usePreferencesStore((state) => state.suggestBrands);
  const status = useComparisonStore((state) => state.status);
  const refreshing = useComparisonStore((state) => state.refreshing);
  const results = useComparisonStore((state) => state.results);
  const setResults = useComparisonStore((state) => state.setResults);
  const setError = useComparisonStore((state) => state.setError);

  // Fires once per "running" job — the basket screen sets status to
  // "running" right before navigating here. A ref (not state) guards
  // against double-firing on a re-render while the request is in flight.
  // `location` (manual-location.js) is optional — the backend falls back
  // to each retailer's best-covered store when it's not set.
  const requestedRef = useRef(false);
  useEffect(() => {
    if (status !== "running" || requestedRef.current) return;
    requestedRef.current = true;
    fetchComparison(queryClient, items, location)
      .then((data) => {
        setResults(data);
        tapSuccess();
      })
      .catch(() => setError());
  }, [status]);

  const { data: rawSuggestionData, isPlaceholderData } = useSuggestions(items, location, status === "ready" && suggestBrands);
  // Right after a swap the hook still holds the previous basket's suggestions while the new ones load: do not show them.
  const suggestionData = isPlaceholderData ? undefined : rawSuggestionData;

  if (status === "idle") {
    return (
      <View className="flex-1 bg-base items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Text className="font-sans-bold text-base text-ink text-center">No comparison yet</Text>
        <Text className="font-sans-medium text-sm text-muted text-center mt-2">
          Go back to your basket and tap "Compare prices."
        </Text>
        <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.back()} className="mt-4">
          <Text className="font-sans-bold text-accent">Back to basket</Text>
        </Pressable>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View className="flex-1 bg-base items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Text className="font-sans-bold text-base text-ink text-center">Couldn't check prices</Text>
        <Text className="font-sans-medium text-sm text-muted text-center mt-2">
          Something went wrong. Check your connection and try again.
        </Text>
        <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.back()} className="mt-4">
          <Text className="font-sans-bold text-accent">Back to basket</Text>
        </Pressable>
      </View>
    );
  }

  if (status === "running" || !results) {
    return (
      <View className="flex-1 bg-base items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text className="font-sans-semibold text-sm text-muted mt-4">Comparing prices…</Text>
      </View>
    );
  }

  // The server ranks stores by how much of the basket they carry, then by
  // price, so results[0] is the best match. It is only "cheapest" if it
  // carries the whole basket — a store pricing fewer items has a lower total
  // for the wrong reason. Savings are only claimed between stores that all
  // carry everything, so the numbers are comparable.
  const best = results[0];
  // "Complete" = carries every item AND priced exactly the packages you picked;
  // totals are only truly comparable between such stores.
  const isExact = (r) => r.unavailableCount === 0 && !r.substitutionCount;
  const outOfCoverage = results.length > 0 && results.every((r) => isOutOfCoverage(r.distanceKm));
  // Summary on top: the store with the most of your items (best) against the others, and the store with the lowest total
  // (which may carry fewer items). Totals are only compared between stores that carry the same number of items.
  const priced = results.filter((r) => r.availableCount > 0);
  const cheapest = priced.reduce((min, r) => (r.total < min.total ? r : min), priced[0]);
  const comparable = priced.filter((r) => r.availableCount === best.availableCount);
  const priciest = comparable.reduce((max, r) => (r.total > max.total ? r : max), best);
  const headlineSaving = comparable.length > 1 ? priciest.total - best.total : 0;
  const fewerItems = cheapest && cheapest.id !== best.id ? best.availableCount - cheapest.availableCount : 0;
  // What the accepted brand swaps already save, shown on top: at the best store if it has swaps, else where they save most.
  const swapStore = (best.swapSavings ?? 0) > 0 ? best : [...results].sort((a, b) => (b.swapSavings ?? 0) - (a.swapSavings ?? 0))[0];
  const swapSaved = swapStore?.swapSavings ?? 0;
  // Cheaper brands: the best saving among the stores, and how many different swaps are on offer.
  const suggestionStores = suggestionData?.retailers ?? [];
  const replacementCounts = Object.fromEntries(suggestionStores.map((r) => [r.id, (r.replacements ?? []).length]));
  const waysToSave = {
    best: Math.max(0, ...suggestionStores.map((r) => r.potentialSaving)),
    count: new Set(suggestionStores.flatMap((r) => r.suggestions.map((s) => `${s.slug}:${s.alternative.slug}`))).size,
  };

  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-5 pt-3 pb-1">
        <Pressable onPress={() => router.back()} hitSlop={6} className="w-10 h-10 items-center justify-center -ml-2">
          <ArrowLeft color={colors.ink} size={22} />
        </Pressable>
        <View className="flex-1" />
        {refreshing ? <ActivityIndicator color={colors.accent} /> : null}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 32 }}>
        <Text className="font-sans-bold text-xs text-muted uppercase tracking-wide">
          Your basket · {items.length} item{items.length === 1 ? "" : "s"}
        </Text>

        {outOfCoverage && (
          <View className="rounded-2xl px-4 py-3.5" style={{ backgroundColor: "#FEF3E2" }}>
            <Text className="font-sans-bold text-[13px]" style={{ color: "#B45309" }}>
              You're outside our coverage area
            </Text>
            <Text className="font-sans-medium text-xs mt-0.5" style={{ color: "#B45309" }}>
              These prices come from stores far from you, so they may not match what's near you.
            </Text>
          </View>
        )}

        {priced.length > 0 && (
          <View className="rounded-2xl" style={{ overflow: "hidden" }}>
            <View style={{ backgroundColor: colors.savingsSoft, paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text className="font-sans-bold uppercase tracking-wide" style={{ fontSize: 11, color: "#0F5C2C" }}>
                Price summary
              </Text>
              {headlineSaving > 0 ? (
                <>
                  <CountUpMoney
                    value={headlineSaving}
                    className="font-mono"
                    style={{ color: "#0F5C2C", fontSize: 40, lineHeight: 48, marginTop: 2 }}
                  />
                  <Text className="font-sans-bold" style={{ fontSize: 14, color: "#0F5C2C" }}>
                    saved at {best.name} instead of {priciest.name}
                  </Text>
                </>
              ) : (
                <Text className="font-sans-extrabold mt-1" style={{ fontSize: 18, color: "#0F5C2C" }}>
                  {best.unavailableCount === 0
                    ? `${best.name} has all ${best.itemCount} of your items`
                    : `${best.name} has the most: ${best.availableCount} of ${best.itemCount} items`}
                </Text>
              )}
              {swapSaved > 0 && (
                <Text className="font-sans-semibold mt-1.5" style={{ fontSize: 13, color: "#0F5C2C" }}>
                  Your brand swaps already save ${swapSaved.toFixed(2)} at {swapStore.name}
                </Text>
              )}
              {fewerItems > 0 && (
                <Text className="font-sans-medium mt-1.5" style={{ fontSize: 12.5, color: "#0F5C2C" }}>
                  {cheapest.name} has the lowest total, ${cheapest.total.toFixed(2)}, but {cheapest.unavailableCount} of your{" "}
                  items {cheapest.unavailableCount === 1 ? "is" : "are"} missing. {best.name} has {fewerItems} more for $
                  {Math.max(0, best.total - cheapest.total).toFixed(2)} more.
                </Text>
              )}
            </View>
          </View>
        )}

        {suggestBrands && waysToSave.count > 0 && (
          <PressableScale
            onPress={() => router.push("/swaps")}
            className="rounded-2xl px-4 py-4 flex-row items-center"
            style={{ backgroundColor: "#0F5C2C", gap: 12 }}
          >
            <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.16)" }}>
              <Sparkles color="#fff" size={21} />
            </View>
            <View className="flex-1">
              <Text className="font-sans-extrabold text-white" style={{ fontSize: 15 }}>
                Save up to ${waysToSave.best.toFixed(2)} more
              </Text>
              <Text className="font-sans-medium text-white" style={{ fontSize: 12.5, opacity: 0.85 }}>
                {waysToSave.count} cheaper brand{waysToSave.count === 1 ? "" : "s"} found
              </Text>
            </View>
            <ChevronRight color="#fff" size={20} />
          </PressableScale>
        )}

        {results.map((store, index) => {
          const allUnavailable = store.unavailableCount >= items.length;
          const isBest = store.id === best.id && !allUnavailable;
          const isCheapest = isBest && isExact(store);
          const storeInfo = { id: store.id, name: store.name };
          const storeSuggestions = suggestionStores.find((r) => r.id === store.id);
          const pendingSwaps = storeSuggestions?.suggestions ?? [];
          const pendingSaving = pendingSwaps.reduce((sum, s) => sum + s.saving, 0);
          const pendingReplacements = store.unavailableCount > 0 ? storeSuggestions?.replacements ?? [] : [];
          const swapSavings = store.swapSavings ?? 0;
          return (
            <Reveal key={store.id} index={index} step={90}>
            <View
              className="bg-white rounded-2xl"
              style={{
                borderWidth: 1.5,
                borderColor: isBest ? colors.accent : colors.border,
                opacity: allUnavailable ? 0.5 : 1,
                overflow: "hidden",
              }}
            >
            <PressableScale
              disabled={allUnavailable}
              onPress={() => router.push(`/retailer-basket/${store.id}`)}
              className="flex-row items-center px-4 py-3.5 gap-3"
            >
              <View className="flex-1">
                <Text className="font-sans-extrabold text-ink" style={{ fontSize: 17 }}>{store.name}</Text>
                <Text className="font-sans-medium text-[10.5px] text-muted opacity-80 mt-0.5" numberOfLines={1}>
                  {plainName(store.storeName)}
                </Text>
                {store.distanceKm != null && (
                  <Text className="font-sans-medium text-[10.5px] text-muted mt-0.5">{store.distanceKm} km away</Text>
                )}
                {store.unavailableCount > 0 && (replacementCounts[store.id] ?? 0) > 0 && (
                  <Text className="font-sans-semibold mt-1" style={{ fontSize: 11, color: colors.accent }}>
                    {replacementCounts[store.id]} replacement{replacementCounts[store.id] === 1 ? "" : "s"} available
                  </Text>
                )}
                {store.swapCount > 0 && (
                  <Text className="font-sans-semibold mt-1" style={{ fontSize: 11, color: colors.savings }}>
                    {store.swapCount} brand swap{store.swapCount === 1 ? "" : "s"} applied
                  </Text>
                )}
                {isCheapest && (
                  <View className="self-start bg-savings rounded-full px-1.5 py-0.5 mt-1">
                    <Text className="font-sans-bold text-white uppercase" style={{ fontSize: 9, letterSpacing: 0.3 }}>
                      Cheapest
                    </Text>
                  </View>
                )}
                {isBest && !isCheapest && (
                  <View className="self-start bg-accent rounded-full px-1.5 py-0.5 mt-1">
                    <Text className="font-sans-bold text-white uppercase" style={{ fontSize: 9, letterSpacing: 0.3 }}>
                      Best match
                    </Text>
                  </View>
                )}
                {allUnavailable ? (
                  <Text className="font-sans-medium text-[10.5px] mt-1" style={{ color: "#B45309" }}>
                    None of your items were found at {store.name}
                  </Text>
                ) : (
                  store.unavailableCount > 0 && (
                    <Text className="font-sans-medium text-[10.5px] mt-1" style={{ color: "#B45309" }}>
                      {store.unavailableCount} item{store.unavailableCount === 1 ? "" : "s"} not found at {store.name}
                    </Text>
                  )
                )}
                {!allUnavailable && store.substitutionCount > 0 && (
                  <Text className="font-sans-medium text-[10.5px] mt-1" style={{ color: "#B45309" }}>
                    {store.substitutionCount} item{store.substitutionCount === 1 ? "" : "s"} in a different size than you
                    picked
                  </Text>
                )}
              </View>
              <View className="items-end">
                {swapSavings > 0 && (
                  <Text
                    className="font-mono"
                    style={{ fontSize: 12.5, color: colors.muted, textDecorationLine: "line-through", fontVariant: ["tabular-nums"] }}
                  >
                    ${(store.total + swapSavings).toFixed(2)}
                  </Text>
                )}
                <Text
                  className="font-mono text-[17px]"
                  style={{ color: isBest ? colors.accent : colors.ink, fontVariant: ["tabular-nums"] }}
                >
                  ${store.total.toFixed(2)}
                </Text>
              </View>
            </PressableScale>

            {swapSavings > 0 && (
              <View
                className="flex-row items-center justify-between px-4 py-2.5"
                style={{ backgroundColor: colors.savingsSoft }}
              >
                <Text className="font-sans-semibold" style={{ fontSize: 12.5, color: "#0F5C2C" }}>
                  ${(store.total + swapSavings).toFixed(2)} → ${store.total.toFixed(2)}
                </Text>
                <Text className="font-sans-extrabold" style={{ fontSize: 15, color: "#0F5C2C" }}>
                  You save ${swapSavings.toFixed(2)}
                </Text>
              </View>
            )}

            {!allUnavailable && (
              <View className="px-4 pb-3.5 pt-2.5" style={{ gap: 8 }}>
                {pendingSwaps.length > 0 && (
                  <Pressable
                    onPress={() => swapWithUndo(pendingSwaps, storeInfo, queryClient)}
                    className="rounded-xl py-3 items-center active:opacity-90"
                    style={{ backgroundColor: "#0F5C2C" }}
                  >
                    <Text className="font-sans-bold text-white" style={{ fontSize: 13.5 }}>
                      {pendingSwaps.length === 1 ? "Swap" : `Swap all ${pendingSwaps.length}`} · save ${pendingSaving.toFixed(2)}
                    </Text>
                  </Pressable>
                )}
                {pendingReplacements.length > 0 && (
                  <Pressable
                    onPress={() => addReplacements(pendingReplacements, storeInfo, queryClient)}
                    className="rounded-xl py-3 items-center active:opacity-90"
                    style={{ backgroundColor: colors.ink }}
                  >
                    <Text className="font-sans-bold text-white" style={{ fontSize: 13.5 }}>
                      {pendingReplacements.length === 1 ? "Replace the missing item" : `Replace all ${pendingReplacements.length} missing items`}
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => router.push(`/retailer-basket/${store.id}`)}
                  className="rounded-xl py-3 items-center active:opacity-90"
                  style={{ backgroundColor: isBest ? colors.accent : colors.accentSoft }}
                >
                  <Text className="font-sans-bold" style={{ fontSize: 13.5, color: isBest ? "#fff" : colors.accent }}>
                    View {store.name} basket
                  </Text>
                </Pressable>
              </View>
            )}
            </View>
            </Reveal>
          );
        })}

      </ScrollView>

      <View className="px-5" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <Pressable
          onPress={() => router.push(`/retailer-basket/${best.id}`)}
          className="bg-accent rounded-2xl py-4 items-center active:opacity-90"
        >
          <Text className="font-sans-bold text-base text-white">View {best.name} basket</Text>
        </Pressable>
      </View>
    </View>
  );
}
