import { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { APP_NAME } from "../lib/brand";
import { tapLight } from "../lib/haptics";

// The opening animation, played once each time the app starts, over the same navy as the app icon and the native
// splash so it carries on from them: the two halves of the B fly in from opposite corners and lock together, a
// glow and a flash mark the click, the name rises in letter by letter, then the whole thing fades into the app.
// With "reduce motion" on it is a short fade instead.
const NAVY = "#0A0A1F";
const RATIO = 771 / 927;
const MARK_HEIGHT = 150;
const MARK_WIDTH = MARK_HEIGHT * RATIO;
let played = false;

const TOP = require("../../assets/brand/buylo-top.png");
const BOTTOM = require("../../assets/brand/buylo-bottom.png");
const FULL = require("../../assets/brand/buylo-mark.png");

function Letter({ char, index, show }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(1050 + index * 70, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, [show]);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 22 }],
  }));
  return (
    <Animated.Text style={[{ color: "#fff", fontFamily: "Manrope_800ExtraBold", fontSize: 44, letterSpacing: 0.5 }, style]}>
      {char}
    </Animated.Text>
  );
}

export function BrandIntro() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(!played);
  const topIn = useSharedValue(0);
  const bottomIn = useSharedValue(0);
  const glow = useSharedValue(0);
  const flash = useSharedValue(0);
  const pop = useSharedValue(1);
  const tagline = useSharedValue(0);
  const overlay = useSharedValue(1);

  useEffect(() => {
    if (!visible) return;
    played = true;
    const done = () => setVisible(false);
    if (reduced) {
      topIn.value = 1;
      bottomIn.value = 1;
      tagline.value = 1;
      overlay.value = withDelay(700, withTiming(0, { duration: 300 }, (finished) => finished && runOnJS(done)()));
      return;
    }
    const fly = { damping: 13, stiffness: 120, mass: 0.9 };
    topIn.value = withSpring(1, fly);
    bottomIn.value = withDelay(140, withSpring(1, fly));
    // The pieces meet at about 0.75 s: pulse the glow, flash the mark, pop it slightly, tick the phone.
    glow.value = withDelay(720, withSequence(withTiming(1, { duration: 240 }), withTiming(0, { duration: 1100 })));
    flash.value = withDelay(740, withSequence(withTiming(0.85, { duration: 120 }), withTiming(0, { duration: 420 })));
    pop.value = withDelay(720, withSequence(withTiming(1.07, { duration: 140 }), withSpring(1, { damping: 8, stiffness: 180 })));
    tagline.value = withDelay(1500, withTiming(1, { duration: 500 }));
    const tick = setTimeout(tapLight, 760);
    overlay.value = withDelay(2650, withTiming(0, { duration: 450 }, (finished) => finished && runOnJS(done)()));
    return () => clearTimeout(tick);
  }, []);

  const topStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, topIn.value * 2.2),
    transform: [
      { translateX: (1 - topIn.value) * -150 },
      { translateY: (1 - topIn.value) * -210 },
      { rotate: `${(1 - topIn.value) * -22}deg` },
      { scale: 0.7 + 0.3 * topIn.value },
    ],
  }));
  const bottomStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, bottomIn.value * 2.2),
    transform: [
      { translateX: (1 - bottomIn.value) * 150 },
      { translateY: (1 - bottomIn.value) * 210 },
      { rotate: `${(1 - bottomIn.value) * 22}deg` },
      { scale: 0.7 + 0.3 * bottomIn.value },
    ],
  }));
  const markStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.75 + glow.value * 0.45 }],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value * 0.75,
    transform: [{ translateY: (1 - tagline.value) * 8 }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));

  if (!visible) return null;
  const { width, height } = Dimensions.get("screen");
  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        { position: "absolute", top: 0, left: 0, width, height, backgroundColor: NAVY, alignItems: "center", justifyContent: "center", zIndex: 1000 },
        overlayStyle,
      ]}
    >
      <View style={{ alignItems: "center", marginTop: -40 }}>
        <View style={{ width: MARK_WIDTH, height: MARK_HEIGHT, alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={[{ position: "absolute", alignItems: "center", justifyContent: "center" }, glowStyle]}>
            {[[360, 0.07], [270, 0.1], [190, 0.16]].map(([size, alpha]) => (
              <View
                key={size}
                style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: `rgba(124, 92, 255, ${alpha})` }}
              />
            ))}
          </Animated.View>
          <Animated.View style={[{ width: MARK_WIDTH, height: MARK_HEIGHT }, markStyle]}>
            <Animated.Image source={TOP} resizeMode="contain" style={[{ position: "absolute", width: MARK_WIDTH, height: MARK_HEIGHT }, topStyle]} />
            <Animated.Image source={BOTTOM} resizeMode="contain" style={[{ position: "absolute", width: MARK_WIDTH, height: MARK_HEIGHT }, bottomStyle]} />
            <Animated.Image
              source={FULL}
              resizeMode="contain"
              style={[{ position: "absolute", width: MARK_WIDTH, height: MARK_HEIGHT, tintColor: "#fff" }, flashStyle]}
            />
          </Animated.View>
        </View>
        <View style={{ flexDirection: "row", marginTop: 34 }}>
          {APP_NAME.split("").map((char, index) => (
            <Letter key={index} char={char} index={index} show={visible} />
          ))}
        </View>
        <Animated.Text
          style={[{ color: "#B9B6FF", fontFamily: "Manrope_600SemiBold", fontSize: 13, letterSpacing: 2.5, marginTop: 10, textTransform: "uppercase" }, taglineStyle]}
        >
          Shop smarter. Save more.
        </Animated.Text>
      </View>
    </Animated.View>
  );
}
