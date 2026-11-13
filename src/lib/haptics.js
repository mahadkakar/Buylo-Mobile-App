// Haptic feedback that can never break the app. It is a nicety, so every failure path is a silent no-op:
//  * the native module is loaded lazily inside try/catch - an app build made before expo-haptics was added has no
//    ExpoHaptics and would otherwise crash on import;
//  * devices without a vibration motor / haptic engine (many tablets and older phones, simulators) ignore the call
//    natively, and any rejection is swallowed here;
//  * it is skipped entirely when the user turned animations off ("reduce motion").
import { AccessibilityInfo } from "react-native";

let Haptics = null;
try {
  Haptics = require("expo-haptics");
} catch {
  Haptics = null;
}

let reduceMotion = false;
AccessibilityInfo.isReduceMotionEnabled?.()
  .then((value) => {
    reduceMotion = !!value;
  })
  .catch(() => {});
AccessibilityInfo.addEventListener?.("reduceMotionChanged", (value) => {
  reduceMotion = !!value;
});

function run(action) {
  if (!Haptics || reduceMotion) return;
  try {
    Promise.resolve(action(Haptics)).catch(() => {});
  } catch {
    // unsupported device or missing native module: no feedback, no error
  }
}

export const tapLight = () => run((h) => h.impactAsync(h.ImpactFeedbackStyle.Light));
export const tapSelection = () => run((h) => h.selectionAsync());
export const tapSuccess = () => run((h) => h.notificationAsync(h.NotificationFeedbackType.Success));
