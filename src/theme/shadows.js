import { Platform } from "react-native";
import { FadeOut, LinearTransition } from "react-native-reanimated";

import { colors } from "./colors";

export const cardShadow = Platform.select({
  android: { borderWidth: 1, borderColor: colors.border },
  default: {
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
});

const USE_PHOTO_BLEND_ON_ANDROID = true;
const blend = Platform.OS !== "android" || USE_PHOTO_BLEND_ON_ANDROID;
export const photoTileStyle = (tint) => (blend ? { backgroundColor: tint } : { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.border });
export const photoBlendStyle = blend ? { mixBlendMode: "multiply" } : null;

export const rowLeaveAnimation = Platform.OS === "android" ? {} : { exiting: FadeOut.duration(180), layout: LinearTransition.duration(220) };
