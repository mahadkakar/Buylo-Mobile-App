import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, Pressable, Modal, useWindowDimensions, ActivityIndicator, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Check, BadgeCheck } from "lucide-react-native";

import { colors } from "../../theme/colors";
import { AppHeader } from "../../components/AppHeader";
import { ProductCard } from "../../components/ProductCard";
import { BottomNav } from "../../components/BottomNav";
import { ProductGridSkeleton } from "../../components/motion";
import { CATEGORIES } from "../../constants/categories";
import { useCanonicalProducts } from "../../api/products";
import { useBasketStore } from "../../store/basketStore";
import { cardLineId, lineId } from "../../lib/itemSize";
import { useDeferredReady } from "../../lib/useDeferredReady";
import { ignoreParentRenders } from "../../lib/ignoreParentRenders";

const SORTS = ["Best Price", "Name A to Z"];
const STORE_FILTERS = ["All Nearby", "Food Basics", "Walmart", "Metro"];
const STORE_SLUGS = { "Food Basics": "food-basics", Walmart: "walmart", Metro: "metro" };

const SCREEN_PADDING = 20;
const GRID_GAP = 14;

function Dropdown({ label, options, value, onChange, isOpen, onOpen, onClose }) {
  const triggerRef = useRef(null);
  const [layout, setLayout] = useState(null);

  const handleOpen = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height });
      onOpen();
    });
  };

  return (
    <View className="flex-1">
      <Pressable
        ref={triggerRef}
        onPress={handleOpen}
        className="flex-row items-center justify-between bg-white border border-border rounded-xl px-3.5 py-2.5"
      >
        <Text className="font-sans-semibold text-[12px] text-ink" numberOfLines={1}>
          {label}: {value}
        </Text>
        <ChevronDown color={colors.muted} size={15} />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={{ flex: 1 }} onPress={onClose}>
          {layout && (
            <View
              className="absolute bg-white border border-border rounded-xl overflow-hidden"
              style={{
                top: layout.y + layout.height + 6,
                left: layout.x,
                width: layout.width,
                elevation: 8,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              {options.map((option) => {
                const active = option === value;
                return (
                  <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                    key={option}
                    onPress={() => {
                      onChange(option);
                      onClose();
                    }}
                    className={`flex-row items-center justify-between px-3.5 py-2.5 ${active ? "bg-accent-soft" : ""}`}
                  >
                    <Text className={`font-sans-semibold text-[12.5px] ${active ? "text-accent" : "text-ink"}`} numberOfLines={1}>
                      {option}
                    </Text>
                    {active && <Check color={colors.accent} size={14} />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

function Categories() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = (windowWidth - SCREEN_PADDING * 2 - GRID_GAP) / 2;
  const { category: paramCategory } = useLocalSearchParams();
  const selected = paramCategory || CATEGORIES[0].slug;
  const listRef = useRef(null);
  const userScrolled = useRef(false);
  const [sort, setSort] = useState(SORTS[0]);
  const [store, setStore] = useState(STORE_FILTERS[0]);
  const [openMenu, setOpenMenu] = useState(null);
  const gridReady = useDeferredReady(selected);

  useEffect(() => {
    userScrolled.current = false;
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selected]);

  const items = useBasketStore((state) => state.items);
  const addItem = useBasketStore((state) => state.addItem);
  const inBasketIds = useMemo(() => new Set(items.map((i) => lineId(i))), [items]);
  const handleAdd = useCallback((item) => addItem({ canonicalProductId: item.id, name: item.name, brand: item.brand, displaySize: item.sizeLabel, image: item.image, category: item.category, price: item.price, retailer: item.retailer, quantityValue: 1, quantityUnit: "unit" }), [addItem]);
  const removeItem = useBasketStore((state) => state.removeItem);
  const handleRemove = useCallback((item) => removeItem(cardLineId(item)), [removeItem]);
  const handlePress = useCallback((item) => router.push(`/product/${item.id}`), [router]);

  const category = CATEGORIES.find((c) => c.slug === selected);
  const ordering = sort === "Best Price" ? "price" : "name";
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCanonicalProducts(selected, ordering, STORE_SLUGS[store] ?? null);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["products", selected] });
  };

  const categoryProducts = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data]
  );

  const products = categoryProducts;
  const displayedCount = data?.pages?.[0]?.count ?? products.length;

  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      <AppHeader />

      <FlatList
        ref={listRef}
        data={gridReady ? products : []}
        keyExtractor={(item) => item.id}
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        numColumns={2}
        columnWrapperStyle={{ gap: GRID_GAP }}
        contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, paddingBottom: 100, gap: 18 }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (userScrolled.current && hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onScrollBeginDrag={() => {
          userScrolled.current = true;
        }}
        refreshControl={
          <RefreshControl refreshing={isRefetching && !isFetchingNextPage} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
        ListHeaderComponent={
          <View className="gap-4 mb-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                {category?.icon && <category.icon color={colors.accent} size={19} />}
                <Text className="font-sans-extrabold text-[20px] text-ink">{category?.name}</Text>
              </View>
              <View className="bg-white border border-border rounded-full px-2.5 py-1">
                <Text className="font-sans-semibold text-muted" style={{ fontSize: 10.5 }}>
                  {displayedCount} item{displayedCount === 1 ? "" : "s"}
                </Text>
              </View>
            </View>
            <Text className="font-sans-medium text-[12.5px] text-muted -mt-2">
              Prices tracked across your nearby participating stores.
            </Text>

            <View className="flex-row gap-2">
              <Dropdown
                label="Sort"
                options={SORTS}
                value={sort}
                onChange={setSort}
                isOpen={openMenu === "sort"}
                onOpen={() => setOpenMenu("sort")}
                onClose={() => setOpenMenu(null)}
              />
              <Dropdown
                label="Stores"
                options={STORE_FILTERS}
                value={store}
                onChange={setStore}
                isOpen={openMenu === "store"}
                onOpen={() => setOpenMenu("store")}
                onClose={() => setOpenMenu(null)}
              />
            </View>

          </View>
        }
        ListEmptyComponent={
          <View className={isLoading || !gridReady ? "items-center pt-1" : "items-center py-12 gap-2"}>
            {isLoading || !gridReady ? (
              <ProductGridSkeleton cardWidth={cardWidth} gap={GRID_GAP} rows={2} />
            ) : isError ? (
              <Text className="font-sans-medium text-sm text-muted">Couldn't load products — check your connection</Text>
            ) : (
              <Text className="font-sans-medium text-sm text-muted">No products match these filters</Text>
            )}
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-6">
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : products.length > 0 ? (
            <View className="items-center pt-6 pb-2 gap-2 px-6">
              <View className="w-10 h-10 rounded-full bg-accent-soft items-center justify-center">
                <BadgeCheck color={colors.accent} size={18} />
              </View>
              <Text className="font-sans-bold text-[13px] text-ink text-center">You've viewed top price matches</Text>
              <Text className="font-sans-medium text-[11px] text-muted text-center leading-4">
                Prices and product details come from each retailer's website and are refreshed periodically.
              </Text>
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

      <BottomNav />
    </View>
  );
}

export default ignoreParentRenders(Categories);
