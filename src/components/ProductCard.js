import { memo } from "react";
import { View, Text } from "react-native";
import { PlusGlyph } from "./Glyphs";

import { cardShadow, photoBlendStyle, photoTileStyle } from "../theme/shadows";
import { ProductImage } from "./ProductImage";
import { tapLight } from "../lib/haptics";
import { PressableScale, Reveal } from "./motion";
import { Stepper } from "./Stepper";

const TINTS = ["#F8DADA", "#D6EDDC", "#D9E1FA", "#FBE5C2"];

function ProductCardView({ product, quantity = 0, onAdd, onChangeQuantity, onPress, width, index = 0 }) {
  const inBasket = quantity > 0;
  const price = typeof product.price === "number" ? `$${product.price.toFixed(2)}` : null;
  return (
    <Reveal index={index} style={{ width }}>
      <PressableScale
        lite
        fill
        onPress={() => onPress(product)}
        className="bg-white rounded-3xl p-2.5"
        style={cardShadow}
      >
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View>
            <View
              style={{
                width: "100%",
                aspectRatio: 1.15,
                borderRadius: 18,
                ...photoTileStyle(TINTS[index % TINTS.length]),
                overflow: "hidden",
              }}
            >
              <ProductImage
                uri={product.image}
                category={product.category}
                resizeMode="contain"
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", ...photoBlendStyle }}
              />
              {product.weightBadge && (
                <View className="absolute top-2 left-2 bg-white/95 rounded-lg px-1.5 py-0.5">
                  <Text className="font-sans-bold text-ink" style={{ fontSize: 10 }}>{product.weightBadge}</Text>
                </View>
              )}
            </View>

            <View className="px-1.5 pt-2.5" style={{ gap: 2 }}>
              <Text className="font-sans-bold text-[13.5px] text-ink" style={{ lineHeight: 18 }} numberOfLines={2}>{product.name}</Text>
              {product.brand || product.sizeLabel ? (
                <Text className="font-sans-semibold text-accent" style={{ fontSize: 11.5 }} numberOfLines={1}>
                  {[product.brand, product.sizeLabel].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="flex-row items-center justify-between px-1.5 pt-2.5 pb-0.5">
            <Text
              className="font-sans-extrabold text-ink"
              style={{ fontSize: 17, flexShrink: 1, marginRight: 6 }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {price ?? ""}
            </Text>
            {inBasket ? (
              <Stepper
                compact
                quantity={quantity}
                label={product.name}
                onIncrement={() => onChangeQuantity(product, quantity + 1)}
                onDecrement={() => onChangeQuantity(product, quantity - 1)}
              />
            ) : (
              <PressableScale
                lite
                onPress={() => {
                  tapLight();
                  onAdd(product);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Add ${product.name} to basket`}
                hitSlop={10}
                scaleTo={0.88}
                className="w-9 h-9 rounded-full items-center justify-center bg-accent"
              >
                <PlusGlyph />
              </PressableScale>
            )}
          </View>
        </View>
      </PressableScale>
    </Reveal>
  );
}

export const ProductCard = memo(ProductCardView);
