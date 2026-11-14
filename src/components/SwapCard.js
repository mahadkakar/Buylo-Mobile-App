import { View, Text, Pressable } from "react-native";
import { ArrowDown } from "lucide-react-native";

import { colors } from "../theme/colors";
import { cardShadow, photoBlendStyle, photoTileStyle } from "../theme/shadows";
import { ProductImage } from "./ProductImage";
import { PressableScale, Reveal } from "./motion";

const TINTS = ["#F8DADA", "#D6EDDC", "#D9E1FA", "#FBE5C2"];

function money(value) {
  return `$${value.toFixed(2)}`;
}

export function SwapCard({ suggestion, index, store, onSwap, onKeep, onOpen }) {
  const { alternative: alt, current } = suggestion;
  return (
    <Reveal index={index}>
      <View
        className="bg-white rounded-3xl"
        style={{ padding: 14, gap: 12, ...cardShadow }}
      >
        <PressableScale onPress={onOpen} scaleTo={0.985} className="flex-row" style={{ gap: 14 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 18,
              ...photoTileStyle(TINTS[index % TINTS.length]),
              overflow: "hidden",
            }}
          >
            <ProductImage
              uri={alt.image}
              category={alt.category}
              resizeMode="contain"
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", ...photoBlendStyle }}
            />
          </View>
          <View className="flex-1 justify-between">
            <View style={{ gap: 3 }}>
              <Text className="font-sans-bold text-[14.5px] text-ink" style={{ lineHeight: 19 }} numberOfLines={2}>{alt.name}</Text>
              <Text className="font-sans-semibold text-accent" style={{ fontSize: 12 }} numberOfLines={1}>
                {[alt.brand, alt.sizeLabel].filter(Boolean).join(" · ")}
                {alt.storeBrand ? "  ·  Store brand" : ""}
              </Text>
              <Text className="font-sans-semibold" style={{ fontSize: 11, color: colors.savings }} numberOfLines={1}>
                Found at {store.name}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-sans-extrabold text-ink" style={{ fontSize: 18 }}>{money(alt.price)}</Text>
              <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: colors.savingsSoft }}>
                <Text className="font-sans-extrabold" style={{ fontSize: 12.5, color: colors.savings }}>
                  Save {money(suggestion.saving)}
                </Text>
              </View>
            </View>
          </View>
        </PressableScale>

        <View className="flex-row items-center rounded-2xl px-3 py-2.5" style={{ backgroundColor: "#F4F4FA", gap: 8 }}>
          <ArrowDown color={colors.muted} size={14} />
          <Text className="font-sans-medium text-muted flex-1" style={{ fontSize: 12 }} numberOfLines={2}>
            Instead of {[current.brand, current.sizeLabel].filter(Boolean).join(" · ")} at {money(current.price)}
            {suggestion.quantityValue > 1 ? `  (x${suggestion.quantityValue})` : ""}
          </Text>
        </View>

        <View className="flex-row" style={{ gap: 10 }}>
          <Pressable onPress={onKeep} className="flex-1 rounded-2xl py-3.5 items-center bg-base" hitSlop={4}>
            <Text className="font-sans-bold text-[14px] text-ink">Keep mine</Text>
          </Pressable>
          <Pressable onPress={onSwap} className="rounded-2xl py-3.5 items-center bg-accent" style={{ flex: 1.4 }} hitSlop={4}>
            <Text className="font-sans-bold text-[14px] text-white">Swap</Text>
          </Pressable>
        </View>
      </View>
    </Reveal>
  );
}
