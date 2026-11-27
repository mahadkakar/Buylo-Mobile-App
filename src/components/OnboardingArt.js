import { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Carrot, LocateFixed, MapPin, Search, ShoppingBasket, Wheat } from "lucide-react-native";

import { colors } from "../theme/colors";
import { cardShadow } from "../theme/shadows";
import { PlusGlyph } from "./Glyphs";
import { Logo } from "./Logo";

function ExampleTag() {
  return (
    <View className="absolute -top-3 self-center bg-ink rounded-full px-3 py-1" style={{ zIndex: 2 }}>
      <Text className="font-sans-bold text-white" style={{ fontSize: 10, letterSpacing: 0.6 }}>EXAMPLE</Text>
    </View>
  );
}

function Arrow({ pointing, side }) {
  const reduced = useReducedMotion();
  const shift = useSharedValue(0);
  const direction = pointing === "up" ? -1 : 1;

  useEffect(() => {
    if (reduced) return;
    shift.value = withRepeat(
      withSequence(
        withTiming(4 * direction, { duration: 650, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 650, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );
  }, [reduced, direction, shift]);

  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: shift.value }] }));

  return (
    <Animated.View style={animated}>
      <View style={{ transform: [{ scaleX: side === "left" ? -1 : 1 }, { scaleY: pointing === "down" ? -1 : 1 }] }}>
        <Svg width={40} height={32} viewBox="0 0 40 32">
          <Path
            d="M6 28 C 20 28, 28 19, 28 6"
            stroke={colors.accent}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M22 11 L28 4 L34 11"
            stroke={colors.accent}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </View>
    </Animated.View>
  );
}

function Callout({ number, text, pointing = "up", side = "right", inset = 12 }) {
  const label = (
    <View
      className="flex-row items-center bg-accent-soft rounded-full"
      style={{ gap: 7, paddingVertical: 6, paddingLeft: 6, paddingRight: 12, maxWidth: 250 }}
    >
      <View className="bg-accent items-center justify-center" style={{ width: 20, height: 20, borderRadius: 10 }}>
        <Text className="font-sans-extrabold text-white" style={{ fontSize: 11, lineHeight: 13 }}>{number}</Text>
      </View>
      <Text className="font-sans-bold text-accent flex-shrink" style={{ fontSize: 12.5, lineHeight: 16 }}>{text}</Text>
    </View>
  );
  const arrow = (
    <View style={{ marginHorizontal: side === "left" ? 4 : 0 }}>
      <Arrow pointing={pointing} side={side} />
    </View>
  );
  return (
    <View
      style={{
        alignSelf: "stretch",
        alignItems: side === "left" ? "flex-start" : "flex-end",
        paddingLeft: side === "left" ? inset : 0,
        paddingRight: side === "right" ? inset : 0,
      }}
    >
      {pointing === "up" ? arrow : label}
      {pointing === "up" ? label : arrow}
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
    </View>
  );
}

export function BasketArt() {
  return (
    <View className="items-center" style={{ width: 264 }}>
      <Callout number={1} text="Search or open an aisle" pointing="down" side="left" />
      <View
        className="flex-row items-center bg-white border border-border rounded-2xl w-full px-3.5"
        style={{ height: 44, gap: 8 }}
      >
        <Search color={colors.muted} size={17} />
        <Text className="font-sans-medium text-muted" style={{ fontSize: 13 }}>Search carrots</Text>
      </View>

      <View className="w-full mt-4">
        <ExampleTag />
        <View className="bg-white rounded-3xl p-3 w-full" style={cardShadow}>
          <View
            className="items-center justify-center"
            style={{ height: 88, borderRadius: 18, backgroundColor: "#D6EDDC" }}
          >
            <Carrot color={colors.savings} size={40} />
          </View>
          <Text className="font-sans-bold text-ink mt-3 px-1" style={{ fontSize: 14.5 }}>Carrots</Text>
          <Text className="font-sans-semibold text-accent px-1" style={{ fontSize: 11.5 }}>2 lb bag</Text>
          <View className="flex-row items-center justify-between mt-2 px-1">
            <Text className="font-sans-extrabold text-ink" style={{ fontSize: 18 }}>$2.49</Text>
            <View className="bg-accent items-center justify-center" style={{ width: 38, height: 38, borderRadius: 19 }}>
              <PlusGlyph />
            </View>
          </View>
        </View>
        <View
          className="absolute bg-accent items-center justify-center"
          style={{ top: -14, right: -14, width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: colors.base }}
        >
          <ShoppingBasket color="#fff" size={20} />
          <View
            className="absolute bg-savings items-center justify-center"
            style={{ top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 4, borderWidth: 2, borderColor: colors.base }}
          >
            <Text className="font-sans-bold text-white" style={{ fontSize: 10, lineHeight: 12 }}>3</Text>
          </View>
        </View>
      </View>
      <Callout number={2} text="Tap + to add it to your basket" pointing="up" side="right" inset={14} />
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
      <Callout number={1} text="In your basket, tap this" pointing="down" side="left" inset={20} />
      <View className="bg-accent rounded-2xl w-full items-center justify-center" style={{ height: 44 }}>
        <Text className="font-sans-bold text-white" style={{ fontSize: 13.5 }}>Compare prices</Text>
      </View>

      <View className="w-full mt-4">
        <Callout number={2} text="Cheapest store comes first" pointing="down" side="right" inset={30} />
      </View>
      <View className="w-full mt-1" style={{ gap: 8 }}>
        <ExampleTag />
        {COMPARE_ROWS.map((row) => (
          <View
            key={row.store}
            className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3"
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
            <Text className={`font-sans-extrabold ${row.best ? "text-savings" : "text-ink"}`} style={{ fontSize: 17 }}>
              {row.total}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function SwapArt() {
  return (
    <View className="items-center" style={{ width: 264 }}>
      <Callout number={1} text="A cheaper brand, same product" pointing="down" side="left" inset={18} />
      <View className="w-full">
        <ExampleTag />
        <View className="bg-white rounded-3xl p-4 w-full" style={cardShadow}>
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <View className="items-center justify-center rounded-2xl" style={{ width: 48, height: 48, backgroundColor: "#FBE5C2" }}>
              <Wheat color="#B45309" size={22} />
            </View>
            <View className="flex-1">
              <Text className="font-sans-semibold text-muted" style={{ fontSize: 11 }}>Your pick</Text>
              <Text className="font-sans-bold text-ink" style={{ fontSize: 13.5 }} numberOfLines={1}>Wheat bread</Text>
            </View>
            <Text className="font-sans-extrabold text-ink" style={{ fontSize: 15 }}>$4.29</Text>
          </View>

          <View
            className="flex-row items-center rounded-2xl p-2.5 mt-3"
            style={{ gap: 10, backgroundColor: colors.savingsSoft }}
          >
            <View className="items-center justify-center rounded-xl bg-white" style={{ width: 42, height: 42 }}>
              <Wheat color={colors.savings} size={20} />
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
      <Callout number={2} text="Tap Swap, or Keep mine" pointing="up" side="right" inset={40} />
    </View>
  );
}

export function LocationArt() {
  return (
    <View className="items-center" style={{ width: 264 }}>
      <View className="items-center justify-center" style={{ width: 150, height: 150 }}>
        <View className="absolute bg-accent-soft" style={{ width: 150, height: 150, borderRadius: 75, opacity: 0.55 }} />
        <View className="absolute bg-accent-soft" style={{ width: 106, height: 106, borderRadius: 53 }} />
        <View
          className="items-center justify-center bg-accent"
          style={{ width: 64, height: 64, borderRadius: 32, ...cardShadow }}
        >
          <MapPin color="#fff" size={30} />
        </View>
      </View>

      <Callout number={1} text="Type your postal code" pointing="down" side="left" inset={22} />
      <View className="flex-row items-center bg-white border border-border rounded-2xl w-full px-3.5" style={{ height: 44, gap: 8 }}>
        <MapPin color={colors.accent} size={16} />
        <Text className="font-sans-bold text-ink" style={{ fontSize: 13 }}>Downtown Toronto</Text>
        <Text className="font-mono text-muted" style={{ fontSize: 12 }}>M5V</Text>
      </View>
      <View
        className="flex-row items-center justify-center bg-accent-soft rounded-2xl w-full mt-2.5"
        style={{ height: 44, gap: 8 }}
      >
        <LocateFixed color={colors.accent} size={16} />
        <Text className="font-sans-bold text-accent" style={{ fontSize: 13 }}>Use my current location</Text>
      </View>
      <Callout number={2} text="Or let the app find you" pointing="up" side="right" inset={28} />
    </View>
  );
}
