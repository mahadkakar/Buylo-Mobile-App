import { plainName } from "../../lib/text";
import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

import { colors } from "../../theme/colors";
import { useQueryClient } from "@tanstack/react-query";

import { useComparisonStore } from "../../store/comparisonStore";
import { useBasketStore } from "../../store/basketStore";
import { addReplacements, swapWithUndo, undoSwaps, useKeepComparisonFresh } from "../../lib/swaps";
import { useSuggestions } from "../../api/suggestions";
import { usePreferencesStore } from "../../store/preferencesStore";
import { ProductImage } from "../../components/ProductImage";
import { ItemRow } from "../../components/ItemRow";
import { CountUpMoney } from "../../components/motion";

export default function RetailerBasketDetail() {
  const queryClient = useQueryClient();
  useKeepComparisonFresh();
  const basketItems = useBasketStore((state) => state.items);
  const location = usePreferencesStore((state) => state.location);
  const { data: suggestionData } = useSuggestions(basketItems, location);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { retailerId } = useLocalSearchParams();
  const results = useComparisonStore((state) => state.results);
  const comparisonStatus = useComparisonStore((state) => state.status);
  const refreshing = useComparisonStore((state) => state.refreshing);
  const [pending, setPending] = useState({});
  useEffect(() => {
    setPending({});
  }, [results, comparisonStatus]);
  const addWithSpinner = (list, storeInfo) => {
    setPending((prev) => ({ ...prev, ...Object.fromEntries(list.map((r) => [r.slug, true])) }));
    addReplacements(list, storeInfo, queryClient);
  };

  const store = results?.find((r) => r.id === retailerId);

  if (!store && comparisonStatus === "running") {
    return (
      <View className="flex-1 bg-base items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Text className="font-sans-bold text-base text-ink text-center">Updating prices</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View className="flex-1 bg-base items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Text className="font-sans-bold text-base text-ink text-center">No comparison for this store</Text>
        <Text className="font-sans-medium text-sm text-muted text-center mt-2">
          Run "Compare prices" from your basket first.
        </Text>
        <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.back()} className="mt-4">
          <Text className="font-sans-bold text-accent">Back</Text>
        </Pressable>
      </View>
    );
  }

  const found = store.lines.filter((line) => line.available).length;
  const storeSuggestions = suggestionData?.retailers?.find((r) => r.id === store.id);
  const replacementBySlug = Object.fromEntries((storeSuggestions?.replacements ?? []).map((r) => [r.slug, r]));
  const missingWithReplacement = store.lines.filter((line) => !line.available && replacementBySlug[line.slug]);
  const storeInfo = { id: store.id, name: store.name };
  const lineBySlug = Object.fromEntries(store.lines.map((line) => [line.slug, line]));
  const pendingSwaps = (storeSuggestions?.suggestions ?? []).filter(
    (s) => lineBySlug[s.slug]?.productSlug !== s.alternative.slug
  );
  const pendingSaving = pendingSwaps.reduce((sum, s) => sum + s.saving, 0);
  const swapBySlug = Object.fromEntries(pendingSwaps.map((s) => [s.slug, s]));
  const swapWithSpinner = (list) => {
    setPending((prev) => ({ ...prev, ...Object.fromEntries(list.map((s) => [s.slug, true])) }));
    swapWithUndo(list, storeInfo, queryClient);
  };
  const swapSavings = store.swapSavings ?? 0;
  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-5 pt-3 pb-1">
        <Pressable onPress={() => router.back()} hitSlop={6} className="w-11 h-11 rounded-xl bg-white items-center justify-center -ml-1">
          <ArrowLeft color={colors.ink} size={20} />
        </Pressable>
        <View className="flex-1" />
        {refreshing ? <ActivityIndicator color={colors.accent} /> : null}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View
          className="rounded-3xl px-5 py-5"
          style={{ backgroundColor: colors.accent }}
        >
          <Text className="font-sans-bold text-white uppercase tracking-wide" style={{ fontSize: 11, opacity: 0.85 }}>
            Your basket at {store.name}
          </Text>
          <CountUpMoney value={store.total} className="font-mono" style={{ color: "#fff", fontSize: 44, lineHeight: 52, marginTop: 2 }} />
          <Text className="font-sans-medium text-white mt-1" style={{ fontSize: 13, opacity: 0.9 }} numberOfLines={1}>
            {found} of {store.lines.length} items found{store.swapCount ? `, ${store.swapCount} swap${store.swapCount === 1 ? "" : "s"}` : ""}
          </Text>
          <Text className="font-sans-medium text-white mt-0.5" style={{ fontSize: 12, opacity: 0.75 }} numberOfLines={1}>
            {plainName(store.storeName)}
          </Text>
          {swapSavings > 0 && (
            <View className="rounded-2xl mt-3 px-3.5 py-3" style={{ backgroundColor: "#fff" }}>
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-semibold" style={{ fontSize: 13, color: colors.muted }}>
                  Without swaps{"  "}
                  <Text style={{ textDecorationLine: "line-through" }}>${(store.total + swapSavings).toFixed(2)}</Text>
                </Text>
                <Text className="font-mono" style={{ fontSize: 15, color: colors.ink }}>${store.total.toFixed(2)}</Text>
              </View>
              <Text className="font-sans-extrabold mt-1" style={{ fontSize: 18, color: "#0F5C2C" }}>
                You save ${swapSavings.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {pendingSwaps.length > 0 && (
          <Pressable
            onPress={() => swapWithSpinner(pendingSwaps)}
            disabled={pendingSwaps.some((s) => pending[s.slug])}
            style={{ backgroundColor: "#0F5C2C", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
          >
            <Text className="font-sans-bold text-white" style={{ fontSize: 14 }}>
              {pendingSwaps.length === 1 ? "Swap" : `Swap all ${pendingSwaps.length}`} and save ${pendingSaving.toFixed(2)} more
            </Text>
          </Pressable>
        )}

        {missingWithReplacement.length > 1 && (
          <Pressable
            onPress={() => addWithSpinner(missingWithReplacement.map((line) => replacementBySlug[line.slug]), storeInfo)}
            disabled={missingWithReplacement.some((line) => pending[line.slug])}
            style={{ backgroundColor: colors.ink, borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
          >
            {missingWithReplacement.some((line) => pending[line.slug]) ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-sans-bold text-white" style={{ fontSize: 14 }}>
                Replace all {missingWithReplacement.length} missing items
              </Text>
            )}
          </Pressable>
        )}

        {store.substitutionCount > 0 && (
          <View className="rounded-2xl px-4 py-3.5" style={{ backgroundColor: "#FEF3E2" }}>
            <Text className="font-sans-medium text-xs leading-5" style={{ color: "#B45309" }}>
              {store.substitutionCount} item{store.substitutionCount === 1 ? "" : "s"} priced in a different size.
            </Text>
          </View>
        )}

        {store.lines.map((line, index) =>
          line.available ? (
            <View key={line.slug} style={{ gap: 8 }}>
            <ItemRow
              index={index}
              image={line.image}
              category={line.category}
              name={line.name}
              brand={line.brand}
              size={line.sizeLabel}
              price={line.price}
              onPress={() => router.push(`/product/${line.productSlug ?? line.slug}`)}
              note={
                line.swappedFrom
                  ? `Instead of ${line.swappedFrom.brand || line.swappedFrom.name}`
                  : line.substituted
                    ? line.requestedSize ? `Different size, you picked ${line.requestedSize}` : "Different size"
                    : null
              }
            >
              <View className="items-end">
                {line.swappedFrom ? (
                  <Pressable
                    onPress={() => {
                      setPending((prev) => ({ ...prev, [line.slug]: true }));
                      undoSwaps([line.slug], store.id, queryClient);
                    }}
                    disabled={!!pending[line.slug]}
                    hitSlop={8}
                    className="rounded-full px-2.5 py-1 mb-1 items-center justify-center"
                    style={{ backgroundColor: "#F4F4FA", minWidth: 78, minHeight: 26 }}
                  >
                    {pending[line.slug] ? (
                      <ActivityIndicator size="small" color={colors.muted} />
                    ) : (
                      <Text className="font-sans-bold text-muted" style={{ fontSize: 11 }}>Undo swap</Text>
                    )}
                  </Pressable>
                ) : null}
                <Text className="font-sans-semibold text-muted" style={{ fontSize: 11 }}>x{line.quantityValue}</Text>
                {line.swappedFrom?.lineTotal != null ? (
                  <Text
                    className="font-mono"
                    style={{ fontSize: 12.5, color: colors.muted, textDecorationLine: "line-through" }}
                  >
                    ${line.swappedFrom.lineTotal.toFixed(2)}
                  </Text>
                ) : null}
                <Text className="font-mono text-ink" style={{ fontSize: 16 }}>${line.lineTotal.toFixed(2)}</Text>
                {line.swappedFrom?.saving > 0 ? (
                  <View className="rounded-full px-2 py-0.5 mt-1" style={{ backgroundColor: colors.savingsSoft }}>
                    <Text className="font-sans-extrabold" style={{ fontSize: 11.5, color: colors.savings }}>
                      Save ${line.swappedFrom.saving.toFixed(2)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </ItemRow>
            {swapBySlug[line.slug] ? (
              <SwapOffer
                suggestion={swapBySlug[line.slug]}
                swapping={!!pending[line.slug]}
                onSwap={() => swapWithSpinner([swapBySlug[line.slug]])}
              />
            ) : null}
            </View>
          ) : (
            <View key={line.slug} className="rounded-3xl bg-white" style={{ padding: 14, gap: 10 }}>
              <View style={{ opacity: 0.75 }}>
                <Text className="font-sans-bold text-[14px] text-ink" numberOfLines={2}>{line.name}</Text>
                <Text className="font-sans-medium text-xs mt-1" style={{ color: "#B45309" }}>Not found at {store.name}</Text>
              </View>
              {replacementBySlug[line.slug] ? (
                <ReplacementOffer
                  replacement={replacementBySlug[line.slug]}
                  adding={!!pending[line.slug]}
                  onAdd={() => addWithSpinner([replacementBySlug[line.slug]], storeInfo)}
                />
              ) : null}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

function SwapOffer({ suggestion, onSwap, swapping }) {
  const alt = suggestion.alternative;
  return (
    <View className="flex-row items-center rounded-2xl" style={{ backgroundColor: colors.savingsSoft, padding: 10, gap: 12 }}>
      <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: "#fff", overflow: "hidden" }}>
        <ProductImage
          uri={alt.image}
          category={alt.category}
          resizeMode="contain"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
        />
      </View>
      <View className="flex-1" style={{ gap: 2 }}>
        <Text className="font-sans-extrabold uppercase tracking-wide" style={{ fontSize: 10, color: colors.savings }}>
          Cheaper brand · save ${suggestion.saving.toFixed(2)}
        </Text>
        <Text className="font-sans-bold text-[13px] text-ink" numberOfLines={1}>{alt.name}</Text>
        <Text className="font-sans-semibold text-accent" style={{ fontSize: 11.5 }} numberOfLines={1}>
          {[alt.brand, alt.sizeLabel].filter(Boolean).join(" · ")}  ·  ${alt.price.toFixed(2)}
        </Text>
      </View>
      <Pressable
        onPress={onSwap}
        disabled={swapping}
        hitSlop={6}
        style={{ backgroundColor: "#0F5C2C", borderRadius: 12, width: 64, height: 40, alignItems: "center", justifyContent: "center" }}
      >
        {swapping ? <ActivityIndicator color="#fff" size="small" /> : <Text className="font-sans-bold text-white" style={{ fontSize: 13 }}>Swap</Text>}
      </Pressable>
    </View>
  );
}

function ReplacementOffer({ replacement, onAdd, adding }) {
  const alt = replacement.alternative;
  return (
    <View className="flex-row items-center rounded-2xl" style={{ backgroundColor: "#F4F4FA", padding: 10, gap: 12 }}>
      <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: "#fff", overflow: "hidden" }}>
        <ProductImage
          uri={alt.image}
          category={alt.category}
          resizeMode="contain"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
        />
      </View>
      <View className="flex-1" style={{ gap: 2 }}>
        <Text className="font-sans-bold uppercase tracking-wide" style={{ fontSize: 10, color: colors.savings }}>
          {replacement.match === "same" ? "Same product" : "Closest match"}
        </Text>
        <Text className="font-sans-bold text-[13px] text-ink" numberOfLines={1}>{alt.name}</Text>
        <Text className="font-sans-semibold text-accent" style={{ fontSize: 11.5 }} numberOfLines={1}>
          {[alt.brand, alt.sizeLabel].filter(Boolean).join(" · ")}  ·  ${alt.price.toFixed(2)}
        </Text>
      </View>
      <Pressable
        onPress={onAdd}
        disabled={adding}
        hitSlop={6}
        style={{ backgroundColor: colors.accent, borderRadius: 12, width: 64, height: 40, alignItems: "center", justifyContent: "center" }}
      >
        {adding ? <ActivityIndicator color="#fff" size="small" /> : <Text className="font-sans-bold text-white" style={{ fontSize: 13 }}>Add</Text>}
      </Pressable>
    </View>
  );
}
