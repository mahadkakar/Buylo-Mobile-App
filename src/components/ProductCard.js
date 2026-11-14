import { memo } from "react";
import { View, Text } from "react-native";
import { CheckGlyph, MinusGlyph, PlusGlyph } from "./Glyphs";

import { colors } from "../theme/colors";
import { cardShadow, photoBlendStyle, photoTileStyle } from "../theme/shadows";
import { ProductImage } from "./ProductImage";
import { tapLight } from "../lib/haptics";
import { PopOnChange, PressableScale, Reveal } from "./motion";

const TINTS = ["#F8DADA", "#D6EDDC", "#D9E1FA", "#FBE5C2"];

function ProductCardView({ product, inBasket, onAdd, onRemove, onPress, width, index = 0 }) {
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
            <Text className="font-sans-extrabold text-ink" style={{ fontSize: 17 }}>{price ?? ""}</Text>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              {inBasket && onRemove ? (
                <PressableScale
                  lite
                  onPress={() => {
                    tapLight();
                    onRemove(product);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${product.name} from basket`}
                  hitSlop={6}
                  scaleTo={0.88}
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#FEE2E2" }}
                >
                  <MinusGlyph color="#DC2626" />
                </PressableScale>
              ) : null}
              <PopOnChange trigger={inBasket} skipFirst>
                <PressableScale
                  lite
                  onPress={() => {
                    if (inBasket) return;
                    tapLight();
                    onAdd(product);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={inBasket ? `${product.name} is in your basket` : `Add ${product.name} to basket`}
                  hitSlop={10}
                  scaleTo={0.88}
                  className={`w-9 h-9 rounded-full items-center justify-center ${inBasket ? "bg-savings" : "bg-accent"}`}
                >
                  {inBasket ? <CheckGlyph /> : <PlusGlyph />}
                </PressableScale>
              </PopOnChange>
            </View>
          </View>
        </View>
      </PressableScale>
    </Reveal>
  );
}

export const ProductCard = memo(ProductCardView);
