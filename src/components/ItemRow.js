import { View, Text } from "react-native";

import { colors } from "../theme/colors";
import { cardShadow, photoBlendStyle, photoTileStyle } from "../theme/shadows";
import { ProductImage } from "./ProductImage";
import { PressableScale } from "./motion";

// Soft tints behind the photo, cycled per row so a list does not look flat.
const TINTS = ["#F8DADA", "#D6EDDC", "#D9E1FA", "#FBE5C2"];

// One product row used by the basket and the dashboard's recent items: tinted photo tile, name, brand and size in
// the accent colour, price, and whatever control goes on the right (`children`).
export function ItemRow({ index = 0, image, category, name, brand, size, price, note, onPress, children }) {
  const detail = [brand, size].filter(Boolean).join(" · ");
  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      scaleTo={0.985}
      className="bg-white rounded-3xl p-3 flex-row"
      style={{ gap: 14, ...cardShadow }}
    >
      <View
        style={{
          width: 96,
          alignSelf: "stretch",
          minHeight: 100,
          borderRadius: 20,
          ...photoTileStyle(TINTS[index % TINTS.length]),
          overflow: "hidden",
        }}
      >
        <ProductImage
          uri={image}
          category={category}
          resizeMode="contain"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", ...photoBlendStyle }}
        />
      </View>
      <View className="flex-1 justify-between" style={{ minHeight: 100 }}>
        <View style={{ gap: 3 }}>
          <Text className="font-sans-bold text-[15px] text-ink" style={{ lineHeight: 20 }} numberOfLines={2}>{name}</Text>
          {detail ? (
            <Text className="font-sans-semibold text-accent" style={{ fontSize: 12 }} numberOfLines={1}>{detail}</Text>
          ) : null}
          {note ? (
            <Text className="font-sans-semibold" style={{ fontSize: 11, color: colors.savings }} numberOfLines={1}>{note}</Text>
          ) : null}
        </View>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="font-sans-extrabold text-ink" style={{ fontSize: 17 }}>
            {price != null ? `$${price.toFixed(2)}` : ""}
          </Text>
          {children}
        </View>
      </View>
    </PressableScale>
  );
}
