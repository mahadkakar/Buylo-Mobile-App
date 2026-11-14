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
  }
}

export const tapLight = () => run((h) => h.impactAsync(h.ImpactFeedbackStyle.Light));
export const tapSelection = () => run((h) => h.selectionAsync());
export const tapSuccess = () => run((h) => h.notificationAsync(h.NotificationFeedbackType.Success));
