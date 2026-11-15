import { useEffect, useMemo } from "react";
import { View, Text, FlatList, Pressable, Image, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search as SearchIcon,
  PiggyBank,
  ArrowRight,
  Bookmark,
  MapPin,
  RotateCw,
} from "lucide-react-native";

import { colors } from "../../theme/colors";
import { AppHeader } from "../../components/AppHeader";
import { BottomNav } from "../../components/BottomNav";
import { neighbourhoodName, plainName } from "../../lib/text";
import { HeroBanner } from "../../components/HeroBanner";
import { RecentItemCard } from "../../components/RecentItemCard";
import { CATEGORIES } from "../../constants/categories";
import { useProductsByIds } from "../../api/products";
import { useNearestStores } from "../../api/stores";
import { useComparisonQuery } from "../../api/comparison";
import { useBasketStore } from "../../store/basketStore";
import { cardLineId, lineId } from "../../lib/itemSize";
import { useSavedBasketsStore } from "../../store/savedBasketsStore";
import { useAuthStore } from "../../store/authStore";
import { usePreferencesStore } from "../../store/preferencesStore";
import { useComparisonStore } from "../../store/comparisonStore";
import { relativeTime } from "../../lib/relativeTime";
import { isOutOfCoverage } from "../../lib/location";
import { ignoreParentRenders } from "../../lib/ignoreParentRenders";

const SOURCE_BASKETS = 5;
const MAX_RECENT_PRODUCTS = 6;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const session = useAuthStore((state) => state.session);
  const items = useBasketStore((state) => state.items);

  const location = usePreferencesStore((state) => state.location);
  const hasPromptedLocation = usePreferencesStore((state) => state.hasPromptedLocation);
  const setHasPromptedLocation = usePreferencesStore((state) => state.setHasPromptedLocation);
  const comparisonStatusRaw = useComparisonStore((state) => state.status);
  const comparisonItemCount = useComparisonStore((state) => state.itemCount);
  const comparisonIsStale = useComparisonStore((state) => state.isStaleFor(items, location));
  const startComparison = useComparisonStore((state) => state.start);
  const comparisonStatus = comparisonIsStale ? "idle" : comparisonStatusRaw;
  const hasBanner = comparisonStatus === "running" || comparisonStatus === "ready" || (comparisonStatus === "idle" && items.length > 0);

  useEffect(() => {
    if (!location && !hasPromptedLocation) {
      setHasPromptedLocation(true);
      router.push("/manual-location");
    }
  }, []);

  const queryClient = useQueryClient();
  const fullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0];
  const firstName = fullName?.trim().split(/\s+/)[0];
  const savedBaskets = useSavedBasketsStore((state) => state.baskets);
  const recentProductIds = useMemo(() => {
    const recent = [...savedBaskets].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, SOURCE_BASKETS);
    const counts = new Map();
    for (const basket of recent) {
      for (const item of basket.items) {
        counts.set(item.canonicalProductId, (counts.get(item.canonicalProductId) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_RECENT_PRODUCTS)
      .map(([id]) => id);
  }, [savedBaskets]);
  const {
    products: recentProducts,
    isLoading: recentProductsLoading,
    isRefetching: recentProductsRefetching,
  } = useProductsByIds(recentProductIds);
  const addItem = useBasketStore((state) => state.addItem);
  const updateQuantity = useBasketStore((state) => state.updateQuantity);
  const inBasketIds = useMemo(() => new Set(items.map((i) => lineId(i))), [items]);

  const {
    data: nearestStoresRaw,
    isLoading: nearestStoresLoading,
    isError: nearestStoresError,
    isRefetching: nearestStoresRefetching,
  } = useNearestStores(location);
  const nearestStores = useMemo(() => {
    const seen = new Set();
    return (nearestStoresRaw ?? []).filter((store) => {
      if (seen.has(store.retailerSlug)) return false;
      seen.add(store.retailerSlug);
      return true;
    });
  }, [nearestStoresRaw]);

  const { isRefetching: comparisonRefetching } = useComparisonQuery(items, location);
  const outOfCoverage = nearestStores.length > 0 && isOutOfCoverage(nearestStores[0].distanceKm);

  const refreshing = recentProductsRefetching || nearestStoresRefetching || comparisonRefetching;
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["product"] });
    queryClient.invalidateQueries({ queryKey: ["stores", "nearest"] });
    queryClient.invalidateQueries({ queryKey: ["comparison"] });
  };

  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      <AppHeader />

      <FlatList
        data={recentProducts}
        keyExtractor={(product) => product.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />}
        ListHeaderComponent={
          <View>
            <Text className="font-sans-extrabold text-[22px] text-ink" numberOfLines={1} adjustsFontSizeToFit>
              {greeting()}{firstName ? `, ${firstName}` : ""}{" "}👋
            </Text>

            {comparisonStatus === "running" && (
              <Pressable
                onPress={() => router.push("/comparison-results")}
                className="bg-accent-soft rounded-2xl px-4 py-4 flex-row items-center gap-3"
                style={{ marginTop: 16 }}
              >
                <View className="w-9 h-9 rounded-xl bg-accent items-center justify-center">
                  <ActivityIndicator color="#fff" size="small" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans-bold text-[13.5px]" style={{ color: colors.accent }}>
                    Comparing {comparisonItemCount} item{comparisonItemCount === 1 ? "" : "s"} across stores
                  </Text>
                  <Text className="font-sans-medium text-[11.5px] mt-0.5" style={{ color: colors.accent, opacity: 0.8 }}>
                    Tap to view, it only takes a moment
                  </Text>
                </View>
                <ArrowRight color={colors.accent} size={18} />
              </Pressable>
            )}

            {comparisonStatus === "ready" && (
              <Pressable
                onPress={() => router.push("/comparison-results")}
                className="bg-savings-soft rounded-2xl px-4 py-4 flex-row items-center gap-3"
                style={{ marginTop: 16 }}
              >
                <View className="w-9 h-9 rounded-xl bg-savings items-center justify-center">
                  <PiggyBank color="#fff" size={18} />
                </View>
                <View className="flex-1">
                  <Text className="font-sans-bold text-[13.5px]" style={{ color: "#0F5C2C" }}>
                    Your basket comparison is ready
                  </Text>
                  <Text className="font-sans-medium text-[11.5px] mt-0.5" style={{ color: "#0F5C2C", opacity: 0.8 }}>
                    Tap to see which store is cheapest
                  </Text>
                </View>
                <ArrowRight color="#0F5C2C" size={18} />
              </Pressable>
            )}

            {comparisonStatus === "idle" && items.length > 0 && (
              <Pressable
                onPress={() => {
                  startComparison(items, location);
                  router.push("/comparison-results");
                }}
                className="bg-accent-soft rounded-2xl px-4 py-4 flex-row items-center gap-3"
                style={{ marginTop: 16 }}
              >
                <View className="w-9 h-9 rounded-xl bg-accent items-center justify-center">
                  <PiggyBank color="#fff" size={18} />
                </View>
                <View className="flex-1">
                  <Text className="font-sans-bold text-[13.5px]" style={{ color: colors.accent }}>
                    Ready to compare your basket?
                  </Text>
                  <Text className="font-sans-medium text-[11.5px] mt-0.5" style={{ color: colors.accent, opacity: 0.8 }}>
                    See which store is cheapest for your {items.length} item{items.length === 1 ? "" : "s"}
                  </Text>
                </View>
                <ArrowRight color={colors.accent} size={18} />
              </Pressable>
            )}

            <Pressable
              onPress={() => router.navigate("/(drawer)/search")}
              className="flex-row items-center bg-white border border-border rounded-2xl px-4 h-12 gap-2"
              style={{ marginTop: hasBanner ? 20 : 28 }}
            >
              <SearchIcon color={colors.muted} size={18} />
              <Text className="flex-1 font-sans text-base text-muted">Search fresh produce, milk, snacks...</Text>
            </Pressable>

            {items.length > 0 ? (
              <HeroBanner
                title="Compare your basket"
                subtitle={`${items.length} item${items.length === 1 ? "" : "s"} ready. See which store is cheapest.`}
                cta="Compare now"
                onPress={() => {
                  startComparison(items, location);
                  router.push("/comparison-results");
                }}
              />
            ) : (
              <HeroBanner
                title="Find the cheapest store"
                subtitle="Compare Metro, Food Basics and Walmart on your whole basket."
                cta="Start a basket"
                onPress={() => router.navigate("/(drawer)/search")}
              />
            )}

            <View className="flex-row items-center justify-between" style={{ marginTop: 28 }}>
              <Text className="font-sans-bold text-base text-ink">Explore Fresh Aisles</Text>
              <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.push("/(drawer)/categories")} className="flex-row items-center gap-0.5">
                <Text className="font-sans-semibold text-[12.5px] text-accent">View All {CATEGORIES.length}</Text>
                <ArrowRight color={colors.accent} size={13} />
              </Pressable>
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CATEGORIES}
              keyExtractor={(c) => c.slug}
              contentContainerStyle={{ gap: 18 }}
              style={{ marginHorizontal: -20, paddingHorizontal: 20, marginTop: 16 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push({ pathname: "/(drawer)/categories", params: { category: item.slug } })}
                  className="items-center"
                  style={{ width: 64 }}
                >
                  <Image source={item.image} className="w-16 h-16 rounded-full mb-2" resizeMode="cover" />
                  <Text className="font-sans-semibold text-[11px] text-ink text-center" numberOfLines={1}>
                    {item.shortName}
                  </Text>
                </Pressable>
              )}
            />

            <View className="flex-row items-center justify-between" style={{ marginTop: 36, marginBottom: 16 }}>
              <View>
                <Text className="font-sans-bold text-base text-ink">From Your Recent Baskets</Text>
                <Text className="font-sans-medium text-[11.5px] text-muted mt-0.5">
                  Latest best prices on items you buy often
                </Text>
              </View>
              {savedBaskets.length > 0 && (
                <Pressable onPress={() => router.push("/(drawer)/saved-baskets")} hitSlop={8}>
                  <Text className="font-sans-semibold text-[12.5px] text-accent">My baskets</Text>
                </Pressable>
              )}
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        ListEmptyComponent={
          recentProductIds.length === 0 ? (
            <View className="bg-white border border-border rounded-2xl px-5 py-6 items-center gap-2">
              <View className="w-11 h-11 rounded-full bg-accent-soft items-center justify-center">
                <Bookmark color={colors.accent} size={20} />
              </View>
              <Text className="font-sans-bold text-[14px] text-ink">No saved baskets yet</Text>
              <Text className="font-sans-medium text-[12px] text-muted text-center leading-5">
                Save a basket and your most bought items show up here with their latest prices.
              </Text>
              <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.push("/(drawer)/categories")} className="mt-1">
                <Text className="font-sans-semibold text-[13px] text-accent">Browse categories</Text>
              </Pressable>
            </View>
          ) : recentProductsLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <Text className="font-sans-medium text-[12.5px] text-muted text-center py-6">
              Couldn't load these items. Pull down to retry.
            </Text>
          )
        }
        renderItem={({ item, index }) => {
          const inBasketItem = items.find((i) => lineId(i) === cardLineId(item));
          return (
            <RecentItemCard
              item={item}
              index={index}
              quantity={inBasketItem?.quantityValue ?? 0}
              onPress={() => router.push(`/product/${item.id}`)}
              onAdd={() =>
                addItem({
                  canonicalProductId: item.id, name: item.name, brand: item.brand, displaySize: item.sizeLabel,
                  image: item.image, category: item.category, price: item.price, retailer: item.retailer, quantityValue: 1, quantityUnit: "unit",
                })
              }
              onIncrement={() => updateQuantity(cardLineId(item), (inBasketItem?.quantityValue ?? 0) + 1)}
              onDecrement={() => updateQuantity(cardLineId(item), (inBasketItem?.quantityValue ?? 1) - 1)}
            />
          );
        }}
        ListFooterComponent={
          <View style={{ marginTop: 40 }}>
            <View style={{ marginBottom: 14 }}>
              <Text className="font-sans-bold text-base text-ink">Participating stores nearby</Text>
              <Text className="font-sans-medium text-[12.5px] text-muted mt-0.5">
                {location ? `Closest stores with prices near ${neighbourhoodName(location.label)}` : "Set your location to see nearby stores"}
              </Text>
            </View>

            {!location ? (
              <Pressable
                onPress={() => router.push("/manual-location")}
                className="bg-accent-soft rounded-2xl px-4 py-4 flex-row items-center gap-3"
              >
                <View className="w-9 h-9 rounded-xl bg-accent items-center justify-center">
                  <MapPin color="#fff" size={17} />
                </View>
                <View className="flex-1">
                  <Text className="font-sans-bold text-[13.5px]" style={{ color: colors.accent }}>
                    No location set yet
                  </Text>
                  <Text className="font-sans-medium text-[11.5px] mt-0.5" style={{ color: colors.accent, opacity: 0.8 }}>
                    Tap to set your postal code and see stores near you
                  </Text>
                </View>
                <ArrowRight color={colors.accent} size={18} />
              </Pressable>
            ) : nearestStoresLoading ? (
              <View className="bg-white border border-border rounded-2xl p-6 items-center">
                <ActivityIndicator color={colors.accent} size="small" />
                <Text className="font-sans-medium text-xs text-muted mt-2">Finding stores near you…</Text>
              </View>
            ) : nearestStoresError ? (
              <Pressable
                onPress={() => queryClient.invalidateQueries({ queryKey: ["stores", "nearest"] })}
                className="bg-white border border-border rounded-2xl p-4 items-center"
              >
                <Text className="font-sans-semibold text-sm text-ink">Couldn't load nearby stores</Text>
                <Text className="font-sans-medium text-xs text-accent mt-1">Tap to try again</Text>
              </Pressable>
            ) : (
            <View className="gap-3">
              {outOfCoverage && (
                <View className="rounded-2xl px-4 py-3.5" style={{ backgroundColor: "#FEF3E2" }}>
                  <Text className="font-sans-bold text-[13px]" style={{ color: "#B45309" }}>
                    You're outside our coverage area
                  </Text>
                  <Text className="font-sans-medium text-[11.5px] mt-0.5" style={{ color: "#B45309" }}>
                    The closest store with prices is {Math.round(nearestStores[0].distanceKm)} km away, so prices below
                    won't reflect stores near you.
                  </Text>
                </View>
              )}
              {nearestStores
                .map((store) => {
                  return (
                    <View key={store.retailerSlug} className="bg-white border border-border rounded-2xl p-4">
                      <View className="flex-row items-start gap-3">
                        <View
                          className="w-11 h-11 rounded-xl items-center justify-center"
                          style={{ backgroundColor: "#EFEFF5" }}
                        >
                          <Text
                            className="font-sans-extrabold text-[13px]"
                            style={{ color: "#55566b" }}
                          >
                            {store.retailer.slice(0, 2).toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-sans-bold text-[14.5px] text-ink">{store.retailer}</Text>
                          <Text className="font-sans-medium text-[11.5px] text-muted mt-0.5" numberOfLines={1}>
                            {plainName(store.name)}, {store.address}
                          </Text>
                          <View className="flex-row flex-wrap items-center mt-1.5" style={{ columnGap: 12, rowGap: 4 }}>
                            {store.distanceKm != null && (
                              <View className="flex-row items-center gap-1">
                                <MapPin color={colors.muted} size={11} />
                                <Text
                                  className="font-sans-medium text-[10.5px] text-muted"
                                >
                                  {store.distanceKm} km
                                </Text>
                              </View>
                            )}
                            {store.lastScrapedAt && (
                              <View className="flex-row items-center gap-1">
                                <RotateCw color={colors.muted} size={10} />
                                <Text className="font-sans-medium text-[10.5px] text-muted">
                                  Updated {relativeTime(new Date(store.lastScrapedAt).getTime())}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              {nearestStores.length === 0 && (
                <Text className="font-sans-medium text-sm text-muted text-center py-4">
                  No participating stores found near {neighbourhoodName(location.label)}
                </Text>
              )}
            </View>
            )}
          </View>
        }
      />
      <BottomNav active="home" />
    </View>
  );
}

export default ignoreParentRenders(Dashboard);
