import { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search as SearchIcon, X } from "lucide-react-native";

import { colors } from "../theme/colors";
import { AppHeader } from "../components/AppHeader";
import { ProductCard } from "../components/ProductCard";
import { BottomNav } from "../components/BottomNav";
import { ProductGridSkeleton } from "../components/motion";
import { useProductSearch } from "../api/products";
import { useBasketStore } from "../store/basketStore";
import { cardLineId, lineId } from "../lib/itemSize";
import { useDeferredReady } from "../lib/useDeferredReady";
import { useDebouncedValue } from "../lib/useDebouncedValue";
import { ignoreParentRenders } from "../lib/ignoreParentRenders";

const SCREEN_PADDING = 20;
const GRID_GAP = 14;

function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = (windowWidth - SCREEN_PADDING * 2 - GRID_GAP) / 2;

  // `query` drives the input itself (updates every keystroke, so typing
  // feels instant); `debouncedQuery` is what actually triggers a fetch —
  // without this, typing "milk" fired four separate searches (m/mi/mil/milk)
  // instead of one, once the user actually paused.
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);
  const isDebouncing = query.trim() !== debouncedQuery.trim() && query.trim().length >= 2;

  const items = useBasketStore((state) => state.items);
  const addItem = useBasketStore((state) => state.addItem);
  // A card stands for one size of a product, so "in the basket" means that size (the same product in another size is another line).
  const inBasketIds = useMemo(() => new Set(items.map((i) => lineId(i))), [items]);
  // One stable handler for every card (they receive the product), so memoized cards are not re-rendered by each change.
  const handleAdd = useCallback((item) => addItem({ canonicalProductId: item.id, name: item.name, brand: item.brand, displaySize: item.sizeLabel, image: item.image, category: item.category, price: item.price, retailer: item.retailer, quantityValue: 1, quantityUnit: "unit" }), [addItem]);
  const removeItem = useBasketStore((state) => state.removeItem);
  const handleRemove = useCallback((item) => removeItem(cardLineId(item)), [removeItem]);
  const handlePress = useCallback((item) => router.push(`/product/${item.id}`), [router]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductSearch(debouncedQuery);

  const results = useMemo(() => data?.pages.flatMap((page) => page.results) ?? [], [data]);
  // Based on the raw (not debounced) query so the "type to search" prompt
  // doesn't flash back on screen for the ~350ms between typing a 2nd
  // character and the debounced fetch actually starting.
  const hasQuery = query.trim().length >= 2;

  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      <AppHeader />

      <View className="px-5 mb-3">
        <View className="flex-row items-center bg-white border border-border rounded-2xl px-4 h-12 gap-2">
          <SearchIcon color={colors.muted} size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search fresh produce, milk, snacks..."
            placeholderTextColor={colors.muted}
            className="flex-1 font-sans text-base text-ink"
            style={{ textAlignVertical: "center", paddingVertical: 0, includeFontPadding: false }}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <X color={colors.muted} size={17} />
            </Pressable>
          )}
        </View>
      </View>

      {!hasQuery ? (
        <View className="flex-1 items-center justify-center px-8 gap-2" style={{ paddingBottom: 100 }}>
          <SearchIcon color={colors.muted} size={28} />
          <Text className="font-sans-semibold text-sm text-muted text-center mt-2">
            Search by product name or brand
          </Text>
        </View>
      ) : isDebouncing || isLoading ? (
        <View style={{ paddingHorizontal: SCREEN_PADDING, paddingTop: 8 }}>
          <ProductGridSkeleton cardWidth={cardWidth} gap={GRID_GAP} rows={2} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8 gap-2" style={{ paddingBottom: 100 }}>
          <Text className="font-sans-semibold text-sm text-ink text-center">Couldn't search right now</Text>
          <Text className="font-sans-medium text-xs text-muted text-center">Check your connection and try again</Text>
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 gap-2" style={{ paddingBottom: 100 }}>
          <Text className="font-sans-semibold text-sm text-ink text-center">No products match "{debouncedQuery}"</Text>
          <Text className="font-sans-medium text-xs text-muted text-center">Try a different name or brand</Text>
        </View>
      ) : (
        <FlatList
          // Same fix as categories.js's main list — resets scroll position
          // per distinct search, rather than carrying over the previous
          // query's scroll offset when its results happen to already be
          // cached.
          key={debouncedQuery}
          data={results}
          keyExtractor={(item) => item.id}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          numColumns={2}
          columnWrapperStyle={{ gap: GRID_GAP }}
          contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, paddingBottom: 100, gap: 18 }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListHeaderComponent={
            <Text className="font-sans-semibold text-xs text-muted mb-1">
              {data?.pages?.[0]?.count ?? results.length} result{(data?.pages?.[0]?.count ?? results.length) === 1 ? "" : "s"}
            </Text>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-6">
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <ProductCard
              index={index}
              product={item}
              inBasket={inBasketIds.has(cardLineId(item))}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onPress={handlePress}
              width={cardWidth}
            />
          )}
        />
      )}

      <BottomNav active="search" />
    </View>
  );
}

// See lib/ignoreParentRenders.js: this screen takes no props and updates through its own hooks.
export default ignoreParentRenders(SearchScreen);
