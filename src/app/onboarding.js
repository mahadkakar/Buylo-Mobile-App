import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { ArrowRight } from "lucide-react-native";

import { colors } from "../theme/colors";
import { usePreferencesStore } from "../store/preferencesStore";
import { tapLight } from "../lib/haptics";
import { APP_NAME } from "../lib/brand";
import { BasketArt, CompareArt, LocationArt, SwapArt, WelcomeArt } from "../components/OnboardingArt";

const STEPS = [
  {
    key: "welcome",
    Art: WelcomeArt,
    title: `Welcome to ${APP_NAME}`,
    body: "Compare grocery prices across stores and find where your basket costs the least.",
  },
  {
    key: "basket",
    Art: BasketArt,
    title: "Build your basket",
    body: "Find what you buy by searching or browsing the aisles, then tap the plus on each product.",
  },
  {
    key: "compare",
    Art: CompareArt,
    title: "Find the cheapest store",
    body: "When your basket is ready, tap Compare prices to see which store costs the least for all of it.",
  },
  {
    key: "swaps",
    Art: SwapArt,
    title: "Save with cheaper brands",
    body: "On the results screen we suggest cheaper brands of the same product. Swap in one tap, or keep yours.",
  },
  {
    key: "location",
    Art: LocationArt,
    title: "Set your location",
    body: "Choose your postal area so we show the closest store of each chain. You can change it anytime.",
  },
];

const LAST = STEPS.length - 1;

function Step({ step, index, width, scrollX }) {
  const animated = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      opacity: interpolate(scrollX.value, input, [0, 1, 0], Extrapolation.CLAMP),
      transform: [{ translateX: interpolate(scrollX.value, input, [width * 0.25, 0, -width * 0.25], Extrapolation.CLAMP) }],
    };
  });
  const [space, setSpace] = useState(0);
  const [natural, setNatural] = useState(0);
  const scale = space > 0 && natural > space ? space / natural : 1;
  const { Art } = step;
  return (
    <View style={{ width }} className="flex-1 px-7">
      <Animated.View
        className="flex-1 items-center justify-center"
        style={animated}
        onLayout={(event) => setSpace(event.nativeEvent.layout.height - 12)}
      >
        <View
          onLayout={(event) => setNatural(event.nativeEvent.layout.height)}
          style={{ position: "absolute", transform: [{ scale }] }}
        >
          <Art />
        </View>
      </Animated.View>
      <View className="items-center" style={{ height: 132 }}>
        <Text className="font-sans-extrabold text-ink text-center" style={{ fontSize: 26, lineHeight: 32 }}>
          {step.title}
        </Text>
        <Text className="font-sans-medium text-muted text-center mt-3" style={{ fontSize: 15, lineHeight: 22, maxWidth: 320 }}>
          {step.body}
        </Text>
      </View>
    </View>
  );
}

function Dot({ index, width, scrollX }) {
  const animated = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      width: interpolate(scrollX.value, input, [8, 26, 8], Extrapolation.CLAMP),
      opacity: interpolate(scrollX.value, input, [0.35, 1, 0.35], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: colors.accent }, animated]} />;
}

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef(null);
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const hasLocation = usePreferencesStore((state) => !!state.location);
  const setHasSeenOnboarding = usePreferencesStore((state) => state.setHasSeenOnboarding);
  const setHasPromptedLocation = usePreferencesStore((state) => state.setHasPromptedLocation);

  useEffect(() => {
    setHasSeenOnboarding(true);
  }, [setHasSeenOnboarding]);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const onMomentumEnd = useCallback(
    (event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / width)),
    [width]
  );

  const goTo = useCallback(
    (next) => {
      listRef.current?.scrollToOffset({ offset: next * width, animated: true });
      setIndex(next);
    },
    [width]
  );

  const finish = useCallback(() => {
    setHasPromptedLocation(true);
    router.back();
  }, [router, setHasPromptedLocation]);

  const chooseLocation = useCallback(() => {
    setHasPromptedLocation(true);
    router.replace("/manual-location");
  }, [router, setHasPromptedLocation]);

  const isLast = index === LAST;

  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      <View className="flex-row justify-end px-5" style={{ height: 52, alignItems: "center" }}>
        {!isLast && (
          <Pressable onPress={finish} hitSlop={12} className="px-3 py-2">
            <Text className="font-sans-bold text-muted" style={{ fontSize: 14 }}>Skip</Text>
          </Pressable>
        )}
      </View>

      <Animated.FlatList
        ref={listRef}
        data={STEPS}
        keyExtractor={(step) => step.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item, index: i }) => <Step step={item} index={i} width={width} scrollX={scrollX} />}
      />

      <View className="items-center" style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
        <View className="flex-row items-center mb-6" style={{ gap: 6 }}>
          {STEPS.map((step, i) => (
            <Dot key={step.key} index={i} width={width} scrollX={scrollX} />
          ))}
        </View>

        <View className="w-full px-6" style={{ gap: 6 }}>
          {isLast ? (
            <>
              <Pressable onPress={chooseLocation} className="bg-accent rounded-2xl py-4 items-center active:opacity-90">
                <Text className="font-sans-bold text-base text-white">
                  {hasLocation ? "Change my location" : "Set my location"}
                </Text>
              </Pressable>
              <Pressable onPress={finish} className="items-center justify-center" style={{ height: 52 }}>
                <Text className="font-sans-semibold text-base text-ink">{hasLocation ? "Done" : "Maybe later"}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => {
                  tapLight();
                  goTo(index + 1);
                }}
                className="bg-accent rounded-2xl py-4 flex-row items-center justify-center active:opacity-90"
                style={{ gap: 8 }}
              >
                <Text className="font-sans-bold text-base text-white">{index === 0 ? "Get started" : "Next"}</Text>
                <ArrowRight color="#fff" size={18} />
              </Pressable>
              <View style={{ height: 52 }} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}
