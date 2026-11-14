import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Store, Check, Plus, RefreshCw } from "lucide-react-native";
import { tapLight } from "../../lib/haptics";

import { colors } from "../../theme/colors";
import { ProductImage } from "../../components/ProductImage";
import { useCanonicalProduct } from "../../api/products";
import { RETAILER_META } from "../../constants/retailers";
import { useBasketStore } from "../../store/basketStore";
import { lineId } from "../../lib/itemSize";

function compareValue(a, b) {
  if (a.unitPrice != null && b.unitPrice != null) return a.unitPrice - b.unitPrice;
  if ((a.unitPrice != null) !== (b.unitPrice != null)) return a.unitPrice != null ? -1 : 1;
  return Number(a.price) - Number(b.price);
}

function groupBySize(listings) {
  const byKey = new Map();
  for (const listing of listings) {
    const label = (listing.sizeLabel || "").replace(/\s+/g, " ").trim();
    const key = label.replace(/\s+/g, "").toLowerCase();
    if (!byKey.has(key)) byKey.set(key, { key, label: label || "Size not listed", listings: [] });
    byKey.get(key).listings.push(listing);
  }
  const groups = [...byKey.values()];
  for (const group of groups) {
    group.listings.sort(compareValue);
    group.best = group.listings[0];
  }
  return groups.sort((a, b) => compareValue(a.best, b.best));
}

export default function ProductDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { productId } = useLocalSearchParams();

  const items = useBasketStore((state) => state.items);
  const addItem = useBasketStore((state) => state.addItem);
  const setListing = useBasketStore((state) => state.setListing);
  const removeItem = useBasketStore((state) => state.removeItem);
  const [selectedId, setSelectedId] = useState(null);

  const { data: product, isLoading, isError } = useCanonicalProduct(productId);

  if (isLoading) {
    return (
      <View className="flex-1 bg-base items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View className="flex-1 bg-base items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Text className="font-sans-bold text-base text-ink text-center">Product not found</Text>
        <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => router.back()} className="mt-4">
          <Text className="font-sans-semibold text-sm text-accent">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const lines = items.filter((i) => i.canonicalProductId === product.id);
  const sizeLine = (sizeLabel) => lineId({ canonicalProductId: product.id, sizeLabel });
  const listings = product.storeListings ?? [];
  const cheapest = listings.reduce((best, listing) => (!best || compareValue(listing, best) < 0 ? listing : best), null);
  const sizeGroups = groupBySize(listings);
  const storeCount = new Set(listings.map((l) => l.retailer)).size;

  const firstLine = lines[0];
  const firstLineListing = firstLine
    ? firstLine.listingId ?? listings.find((l) => sizeLine(l.sizeLabel) === lineId(firstLine))?.id
    : null;
  const effectiveSelectedId = selectedId ?? firstLineListing ?? cheapest?.id ?? null;
  const selectedListing = listings.find((l) => l.id === effectiveSelectedId) ?? cheapest;
  const existingItem = selectedListing ? lines.find((i) => lineId(i) === sizeLine(selectedListing.sizeLabel)) : undefined;
  const inBasket = !!existingItem;
  const selectionChanged = inBasket && existingItem.listingId !== effectiveSelectedId;

  const handleAdd = () => {
    if (!selectedListing) return;
    if (inBasket && selectionChanged) {
      setListing(lineId(existingItem), {
        listingId: selectedListing.id,
        retailer: selectedListing.retailer,
        brand: selectedListing.brand,
        price: selectedListing.price,
        sizeLabel: selectedListing.sizeLabel,
      });
      return;
    }
    if (inBasket) return;
    addItem({
      canonicalProductId: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      quantityValue: 1,
      quantityUnit: "unit",
      listingId: selectedListing.id,
      retailer: selectedListing.retailer,
      brand: selectedListing.brand,
      price: selectedListing.price,
      sizeLabel: selectedListing.sizeLabel,
    });
  };

  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-5 pt-3 pb-1">
        <Pressable onPress={() => router.back()} hitSlop={6} className="w-10 h-10 items-center justify-center -ml-2">
          <ArrowLeft color={colors.ink} size={22} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 16, paddingBottom: 32 }}>
        <View className="relative bg-white" style={{ height: 270, borderRadius: 20, overflow: "hidden" }}>
          <ProductImage
            uri={product.image}
            category={product.category}
            resizeMode="contain"
            style={{ position: "absolute", top: 10, left: 10, right: 10, bottom: 10, borderRadius: 12 }}
            iconSize={44}
          />
          {product.weightBadge && (
            <View className="absolute top-3 left-3 bg-white/95 rounded-lg px-2 py-1">
              <Text className="font-sans-bold text-ink" style={{ fontSize: 11 }}>{product.weightBadge}</Text>
            </View>
          )}
          {product.organic && (
            <View className="absolute top-3 right-3 bg-savings rounded-lg px-2 py-1">
              <Text className="font-sans-bold text-white" style={{ fontSize: 10 }}>Organic</Text>
            </View>
          )}
        </View>

        <View>
          {product.brand && (
            <Text className="font-sans-semibold text-sm text-muted">{product.brand}</Text>
          )}
          <Text className="font-sans-extrabold text-xl text-ink">{product.name}</Text>
          {product.sizeLabel && (
            <Text className="font-sans-medium text-sm text-muted mt-1">{product.sizeLabel}</Text>
          )}
        </View>

        {cheapest ? (
          <View className="bg-savings-soft rounded-2xl px-4 py-3.5">
            <Text className="font-sans-extrabold text-[15px]" style={{ color: "#0F5C2C" }}>
              Cheapest nearby: ${cheapest.price.toFixed(2)} at {cheapest.retailer}
              {cheapest.sizeLabel ? ` (${cheapest.sizeLabel.replace(/\s+/g, " ").trim()})` : ""}
            </Text>
            <Text className="font-sans-medium text-xs mt-0.5" style={{ color: "#0F5C2C", opacity: 0.8 }}>
              {storeCount} store{storeCount === 1 ? "" : "s"} compared · {sizeGroups.length} size{sizeGroups.length === 1 ? "" : "s"} · {listings.length} product{listings.length === 1 ? "" : "s"} found
            </Text>
          </View>
        ) : (
          <View className="bg-accent-soft rounded-2xl px-4 py-3.5">
            <Text className="font-sans-medium text-xs text-accent leading-5">
              No store has this yet. Check back soon.
            </Text>
          </View>
        )}

        {listings.length > 0 && (
          <View className="gap-2.5">
            <Text className="font-sans-bold text-base text-ink px-0.5">Compare prices</Text>

          {sizeGroups.map((group) => (
            <View key={group.key || "no-size"} className="gap-2.5">
              <View className="flex-row items-center justify-between px-0.5 pt-2">
                <View className="flex-row items-center gap-2">
                  <Text className="font-sans-extrabold text-[15px] text-ink">{group.label}</Text>
                  {group.listings.includes(cheapest) && (
                    <View className="bg-savings rounded-full px-2 py-0.5">
                      <Text className="font-sans-bold text-white uppercase" style={{ fontSize: 9, letterSpacing: 0.3 }}>
                        Best value
                      </Text>
                    </View>
                  )}
                  {(() => {
                    const inGroup = lines.find((i) => lineId(i) === sizeLine(group.listings[0].sizeLabel));
                    return inGroup ? (
                      <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: colors.savingsSoft }}>
                        <Text className="font-sans-bold uppercase" style={{ fontSize: 9, letterSpacing: 0.3, color: colors.savings }}>
                          In basket · x{inGroup.quantityValue}
                        </Text>
                      </View>
                    ) : null;
                  })()}
                </View>
                <Text className="font-sans-medium text-[11px] text-muted">
                  {group.listings.length} listing{group.listings.length === 1 ? "" : "s"}
                </Text>
              </View>
          {group.listings.map((listing) => {
            const meta = RETAILER_META[listing.retailer];
            const isCheapest = listing === cheapest;
            const isLowestForSize = !isCheapest && group.listings.length > 1 && listing === group.best;
            const isSelected = listing.id === effectiveSelectedId;
            return (
              <Pressable
                key={listing.id}
                onPress={() => setSelectedId(listing.id)}
                className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 gap-3"
                style={{ borderWidth: 1.5, borderColor: isSelected ? colors.accent : colors.border }}
              >
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center"
                  style={{ backgroundColor: isSelected ? colors.accentSoft : "#EFEFF5" }}
                >
                  <Text className="font-sans-extrabold text-[13px]" style={{ color: isSelected ? colors.accent : "#55566b" }}>
                    {meta?.mark ?? listing.retailer.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <Store color={colors.muted} size={11} />
                    <Text className="font-sans-bold text-[13px] text-ink">
                      {listing.retailer}
                    </Text>
                  </View>
                  <Text className="font-sans-medium text-[11.5px] text-ink mt-0.5" numberOfLines={1}>
                    {listing.name}
                  </Text>
                  <Text className="font-sans-medium text-muted mt-0.5" style={{ fontSize: 10 }} numberOfLines={1}>
                    {[listing.brand, listing.sizeLabel].filter(Boolean).join(" · ")}
                    {listing.locationCount > 1 ? ` · ${listing.locationCount} stores` : ""}
                  </Text>
                  {isCheapest && (
                    <View className="self-start bg-savings rounded-full px-1.5 py-0.5 mt-1">
                      <Text className="font-sans-bold text-white uppercase" style={{ fontSize: 9, letterSpacing: 0.3 }}>
                        Cheapest
                      </Text>
                    </View>
                  )}
                  {isLowestForSize && (
                    <View className="self-start bg-accent-soft rounded-full px-1.5 py-0.5 mt-1">
                      <Text className="font-sans-bold text-accent uppercase" style={{ fontSize: 9, letterSpacing: 0.3 }}>
                        Lowest for this size
                      </Text>
                    </View>
                  )}
                </View>
                <View className="items-end">
                  <Text className="font-mono text-[15px]" style={{ color: isSelected ? colors.accent : colors.ink, fontVariant: ["tabular-nums"] }}>
                    ${listing.price.toFixed(2)}
                  </Text>
                  {listing.unitPriceLabel && (
                    <Text className="font-sans-medium text-muted mt-0.5" style={{ fontSize: 9.5 }}>{listing.unitPriceLabel}</Text>
                  )}
                  {isSelected && <Check color={colors.accent} size={14} style={{ marginTop: 4 }} />}
                </View>
              </Pressable>
            );
          })}
            </View>
          ))}
        </View>
        )}
      </ScrollView>

      <View className="px-5" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          onPress={handleAdd}
          disabled={inBasket && !selectionChanged}
          className={`rounded-2xl py-4 items-center active:opacity-90 flex-row justify-center gap-2 ${
            inBasket && !selectionChanged ? "bg-savings" : "bg-accent"
          }`}
        >
          {inBasket && !selectionChanged ? (
            <Check color="#fff" size={17} />
          ) : selectionChanged ? (
            <RefreshCw color="#fff" size={17} />
          ) : (
            <Plus color="#fff" size={17} />
          )}
          <Text className="font-sans-bold text-base text-white">
            {inBasket && !selectionChanged
              ? "In your basket"
              : selectionChanged
                ? "Update selection"
                : lines.length > 0
                  ? "Add this size to basket"
                  : "Add to basket"}
          </Text>
        </Pressable>
        {inBasket ? (
          <Pressable
            hitSlop={{ top: 8, bottom: 8, left: 24, right: 24 }}
            onPress={() => {
              tapLight();
              removeItem(lineId(existingItem));
            }}
            accessibilityRole="button"
            accessibilityLabel="Remove this size from basket"
            className="items-center pt-3"
          >
            <Text className="font-sans-bold text-sm" style={{ color: "#DC2626" }}>Remove from basket</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
