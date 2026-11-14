import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors } from "../theme/colors";

export function PressableScale({ children, style, className, scaleTo = 0.97, disabled, hitSlop, fill, lite, ...rest }) {
  if (lite && Platform.OS === "android") {
    return (
      <Pressable
        {...rest}
        hitSlop={hitSlop}
        disabled={disabled}
        className={`${className ?? ""} active:opacity-90`}
        style={[fill && { flex: 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[fill && { flex: 1 }, animated]}>
      <Pressable
        {...rest}
        hitSlop={hitSlop}
        disabled={disabled}
        className={className}
        style={[fill && { flex: 1 }, style]}
        onPressIn={() => {
          if (!reduced) scale.value = withTiming(scaleTo, { duration: 90 });
        }}
        onPressOut={() => {
          if (!reduced) scale.value = withSpring(1, { damping: 14, stiffness: 260 });
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function Reveal({ index = 0, limit = 6, step = 45, children, style }) {
  const reduced = useReducedMotion();
  if (reduced || index >= limit) return <View style={style}>{children}</View>;
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, limit) * step).duration(260)} style={style}>
      {children}
    </Animated.View>
  );
}

export function PopOnChange({ trigger, children, style, skipFirst = false }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => {
    const isFirst = first.current;
    first.current = false;
    if (reduced || (skipFirst && isFirst)) return;
    scale.value = withSequence(withTiming(1.35, { duration: 110 }), withSpring(1, { damping: 8, stiffness: 240 }));
  }, [trigger]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

export function Skeleton({ style }) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(reduced ? 0.7 : 0.45);
  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(withSequence(withTiming(0.9, { duration: 700 }), withTiming(0.45, { duration: 700 })), -1);
  }, []);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ backgroundColor: colors.border, borderRadius: 10 }, style, animated]} />;
}

function PulseGroup({ children, style }) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(reduced ? 0.8 : 0.55);
  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.55, { duration: 700 })), -1);
  }, []);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

function Block({ style }) {
  return <View style={[{ backgroundColor: colors.border, borderRadius: 10 }, style]} />;
}

export function ProductGridSkeleton({ cardWidth, gap = 14, rows = 3 }) {
  return (
    <PulseGroup style={{ gap: 18 }}>
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={{ flexDirection: "row", gap }}>
          {[0, 1].map((col) => (
            <View
              key={col}
              style={{
                width: cardWidth,
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 8,
              }}
            >
              <Block style={{ width: "100%", aspectRatio: 1.4, borderRadius: 14 }} />
              <Block style={{ width: "40%", height: 10, marginTop: 12, marginHorizontal: 4 }} />
              <Block style={{ width: "85%", height: 13, marginTop: 8, marginHorizontal: 4 }} />
              <Block style={{ width: "30%", height: 10, marginTop: 8, marginHorizontal: 4 }} />
              <Block style={{ width: "35%", height: 16, marginTop: 14, marginBottom: 6, marginHorizontal: 4 }} />
            </View>
          ))}
        </View>
      ))}
    </PulseGroup>
  );
}

export function CountUpMoney({ value, duration = 800, style, className }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);
  const shownRef = useRef(shown);
  shownRef.current = shown;
  useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    let frame;
    const start = Date.now();
    const from = shownRef.current;
    const length = from === 0 ? duration : Math.min(duration, 350);
    const tick = () => {
      const t = Math.min((Date.now() - start) / length, 1);
      setShown(from + (value - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);
  return (
    <Text style={style} className={className}>
      ${shown.toFixed(2)}
    </Text>
  );
}
