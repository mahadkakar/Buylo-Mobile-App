import { Platform } from "react-native";
import { FadeOut, LinearTransition } from "react-native-reanimated";

import { colors } from "./colors";

// The soft shadow under white cards. On iPhone it is the usual shadow. On Android it is a hairline border instead: Android
// draws the `elevation` shadow at full strength even while the card itself fades (Reanimated's entering and exiting
// animations), which left a grey box behind a card that was fading out (the swap cards, basket rows and product grid).
export const cardShadow = Platform.select({
  android: { borderWidth: 1, borderColor: colors.border },
  default: {
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
});

// The tile behind a product photo. iPhone: a soft tint, with the photo blended into it (`multiply`, so the photo's white
// background takes the tint). Android: a plain white tile and no blend. mixBlendMode makes Android draw every blended photo
// in its own off-screen layer on every frame, which is the suspected cause of the UI frame rate dropping to about 42 to 48
// on a OnePlus 8 Pro when a screen with a product grid slides in or out (never confirmed). Turned back on at the user's request
// (they preferred the tint) once the other speed fixes had made the app smooth; if the frame rate drops again on grid screens,
// set USE_PHOTO_BLEND_ON_ANDROID to false first and re-measure.
const USE_PHOTO_BLEND_ON_ANDROID = true;
const blend = Platform.OS !== "android" || USE_PHOTO_BLEND_ON_ANDROID;
export const photoTileStyle = (tint) => (blend ? { backgroundColor: tint } : { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.border });
export const photoBlendStyle = blend ? { mixBlendMode: "multiply" } : null;

// List rows that leave or move with Reanimated's exiting/layout animations. On Android those drew a grey rounded box where
// the row had been (the swap cards, a basket row) because the view is snapshotted into a translucent layer while it
// fades. There the row simply goes and the rest closes up; iPhone keeps the fade.
export const rowLeaveAnimation = Platform.OS === "android" ? {} : { exiting: FadeOut.duration(180), layout: LinearTransition.duration(220) };
