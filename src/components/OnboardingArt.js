import { View, Text } from "react-native";
import { ArrowRight, Carrot, MapPin, ShoppingBasket, Wheat } from "lucide-react-native";

import { colors } from "../theme/colors";
import { cardShadow } from "../theme/shadows";
import { PlusGlyph } from "./Glyphs";
import { Logo } from "./Logo";

const STORES = ["Metro", "Food Basics", "Walmart"];

function ExampleTag() {
  return (
    <View className="absolute -top-3 self-center bg-ink rounded-full px-3 py-1" style={{ zIndex: 2 }}>
      <Text className="font-sans-bold text-white" style={{ fontSize: 10, letterSpacing: 0.6 }}>EXAMPLE</Text>
    </View>
  );
}

export function WelcomeArt() {
  return (
    <View className="items-center">
      <View
        className="items-center justify-center bg-accent-soft"
        style={{ width: 188, height: 188, borderRadius: 94 }}
      >
        <View
          className="items-center justify-center bg-white"
          style={{ width: 132, height: 132, borderRadius: 66, ...cardShadow }}
        >
          <Logo size={72} />
        </View>
      </View>
      <View className="flex-row gap-2 mt-7">
        {STORES.map((store) => (
          <View key={store} className="bg-white border border-border rounded-full px-3.5 py-2">
            <Text className="font-sans-bold text-ink" style={{ fontSize: 12.5 }}>{store}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function BasketArt() {
  return (
    <View className="items-center" style={{ width: 250 }}>
      <ExampleTag />
      <View className="bg-white rounded-3xl p-3 w-full" style={cardShadow}>
        <View
          className="items-center justify-center"
          style={{ height: 112, borderRadius: 18, backgroundColor: "#D6EDDC" }}
        >
          <Carrot color={colors.savings} size={46} />
        </View>
        <Text className="font-sans-bold text-ink mt-3 px-1" style={{ fontSize: 14.5 }}>Carrots</Text>
        <Text className="font-sans-semibold text-accent px-1" style={{ fontSize: 11.5 }}>2 lb bag</Text>
        <View className="flex-row items-center justify-between mt-3 px-1">
          <Text className="font-sans-extrabold text-ink" style={{ fontSize: 18 }}>$2.49</Text>
          <View className="bg-accent items-center justify-center" style={{ width: 38, height: 38, borderRadius: 19 }}>
            <PlusGlyph />
          </View>
        </View>
      </View>
      <View
        className="absolute bg-accent items-center justify-center"
        style={{ top: -14, right: -14, width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: colors.base }}
      >
        <ShoppingBasket color="#fff" size={22} />
        <View
          className="absolute bg-savings items-center justify-center"
          style={{ top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 4, borderWidth: 2, borderColor: colors.base }}
        >
          <Text className="font-sans-bold text-white" style={{ fontSize: 10, lineHeight: 12 }}>3</Text>
        </View>
      </View>
    </View>
  );
}

const COMPARE_ROWS = [
  { store: "Food Basics", total: "$52.40", best: true },
  { store: "Metro", total: "$55.15" },
  { store: "Walmart", total: "$57.90" },
];

export function CompareArt() {
  return (
    <View className="items-center" style={{ width: 264 }}>
      <ExampleTag />
      <View className="w-full" style={{ gap: 10 }}>
        {COMPARE_ROWS.map((row) => (
          <View
            key={row.store}
            className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-4"
            style={[
              cardShadow,
              row.best && { borderWidth: 2, borderColor: colors.savings, backgroundColor: colors.savingsSoft },
            ]}
          >
            <View>
              <Text className="font-sans-bold text-ink" style={{ fontSize: 14 }}>{row.store}</Text>
              {row.best ? (
                <Text className="font-sans-bold text-savings" style={{ fontSize: 11 }}>Cheapest</Text>
              ) : (
                <Text className="font-sans-medium text-muted" style={{ fontSize: 11 }}>Whole basket</Text>
              )}
            </View>
            <Text className={`font-sans-extrabold ${row.best ? "text-savings" : "text-ink"}`} style={{ fontSize: 18 }}>
              {row.total}
            </Text>
          </View>
        ))}
      </View>
      <View className="bg-savings rounded-full px-4 py-2 mt-4">
        <Text className="font-sans-bold text-white" style={{ fontSize: 12.5 }}>You save $5.50</Text>
      </View>
    </View>
  );
}

export function SwapArt() {
  return (
    <View className="items-center" style={{ width: 264 }}>
      <ExampleTag />
      <View className="bg-white rounded-3xl p-4 w-full" style={cardShadow}>
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View className="items-center justify-center rounded-2xl" style={{ width: 52, height: 52, backgroundColor: "#FBE5C2" }}>
            <Wheat color="#B45309" size={24} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-semibold text-muted" style={{ fontSize: 11 }}>Your pick</Text>
            <Text className="font-sans-bold text-ink" style={{ fontSize: 13.5 }} numberOfLines={1}>Wheat bread</Text>
          </View>
          <Text className="font-sans-extrabold text-ink" style={{ fontSize: 15 }}>$4.29</Text>
        </View>

        <View className="items-center my-2">
          <View className="items-center justify-center bg-accent-soft" style={{ width: 28, height: 28, borderRadius: 14, transform: [{ rotate: "90deg" }] }}>
            <ArrowRight color={colors.accent} size={15} />
          </View>
        </View>

        <View
          className="flex-row items-center rounded-2xl p-2.5"
          style={{ gap: 10, backgroundColor: colors.savingsSoft }}
        >
          <View className="items-center justify-center rounded-xl bg-white" style={{ width: 44, height: 44 }}>
            <Wheat color={colors.savings} size={22} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-bold text-savings" style={{ fontSize: 11 }}>Cheaper brand</Text>
            <Text className="font-sans-bold text-ink" style={{ fontSize: 13.5 }} numberOfLines={1}>Wheat bread</Text>
          </View>
          <Text className="font-sans-extrabold text-savings" style={{ fontSize: 15 }}>$3.49</Text>
        </View>

        <View className="flex-row mt-3" style={{ gap: 8 }}>
          <View className="flex-1 items-center rounded-xl border border-border py-2.5">
            <Text className="font-sans-bold text-ink" style={{ fontSize: 12.5 }}>Keep mine</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-accent py-2.5">
            <Text className="font-sans-bold text-white" style={{ fontSize: 12.5 }}>Swap</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function LocationArt() {
  return (
    <View className="items-center">
      <View className="items-center justify-center" style={{ width: 210, height: 210 }}>
        <View className="absolute bg-accent-soft" style={{ width: 210, height: 210, borderRadius: 105, opacity: 0.55 }} />
        <View className="absolute bg-accent-soft" style={{ width: 150, height: 150, borderRadius: 75 }} />
        <View
          className="items-center justify-center bg-accent"
          style={{ width: 84, height: 84, borderRadius: 42, ...cardShadow }}
        >
          <MapPin color="#fff" size={38} />
        </View>
      </View>
      <View className="flex-row items-center bg-white border border-border rounded-full px-4 py-2.5 mt-3" style={{ gap: 8 }}>
        <MapPin color={colors.accent} size={15} />
        <Text className="font-sans-bold text-ink" style={{ fontSize: 13 }}>Downtown Toronto</Text>
        <Text className="font-mono text-muted" style={{ fontSize: 12 }}>M5V</Text>
      </View>
    </View>
  );
}
