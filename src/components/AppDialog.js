import { Modal, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { CircleAlert, TriangleAlert } from "lucide-react-native";

import { colors } from "../theme/colors";
import { useUiStore } from "../store/uiStore";
import { tapLight } from "../lib/haptics";

// The app's own confirm / notice dialog, used instead of the system Alert (see store/uiStore.js: confirmDialog,
// showNotice). Same look as the other cards: white rounded card on a dimmed screen, a soft icon tile, accent buttons.
// "danger" (red) is for things that delete or end something; everything else is the accent colour.
const DANGER = "#DC2626";
const DANGER_SOFT = "#FDECEC";

export function AppDialog() {
  const dialog = useUiStore((state) => state.dialog);
  const closeDialog = useUiStore((state) => state.closeDialog);
  if (!dialog) return null;

  const danger = dialog.tone === "danger";
  const tint = danger ? DANGER : colors.accent;
  const Icon = dialog.icon ?? (danger ? TriangleAlert : CircleAlert);
  const confirm = () => {
    tapLight();
    closeDialog();
    dialog.onConfirm?.();
  };
  const cancel = () => {
    closeDialog();
    dialog.onCancel?.();
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={dialog.cancelLabel ? cancel : confirm}>
      <Pressable
        onPress={dialog.cancelLabel ? cancel : undefined}
        className="flex-1 items-center justify-center px-7"
        style={{ backgroundColor: "rgba(20,21,35,0.5)" }}
      >
        {/* The inner Pressable swallows taps so touching the card does not dismiss the dialog. */}
        <Pressable onPress={() => {}} style={{ width: "100%", maxWidth: 380 }}>
          <Animated.View
            entering={ZoomIn.duration(170)}
            className="bg-white items-center"
            style={{
              borderRadius: 28,
              paddingHorizontal: 22,
              paddingTop: 26,
              paddingBottom: 20,
              shadowColor: colors.ink,
              shadowOpacity: 0.18,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 10 },
              elevation: 12,
            }}
          >
            <View
              className="items-center justify-center"
              style={{ width: 56, height: 56, borderRadius: 20, backgroundColor: danger ? DANGER_SOFT : colors.accentSoft }}
            >
              <Icon color={tint} size={26} strokeWidth={2.2} />
            </View>

            <Text className="font-sans-extrabold text-ink text-center" style={{ fontSize: 19, marginTop: 16 }}>
              {dialog.title}
            </Text>
            {dialog.message ? (
              <Text className="font-sans-medium text-muted text-center" style={{ fontSize: 14, lineHeight: 21, marginTop: 8 }}>
                {dialog.message}
              </Text>
            ) : null}

            <View className="flex-row w-full" style={{ gap: 12, marginTop: 22 }}>
              {dialog.cancelLabel ? (
                <Pressable
                  onPress={cancel}
                  className="flex-1 items-center border border-border active:opacity-70"
                  style={{ borderRadius: 16, paddingVertical: 14 }}
                >
                  <Text className="font-sans-bold text-ink" style={{ fontSize: 14.5 }}>{dialog.cancelLabel}</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={confirm}
                className="flex-1 items-center active:opacity-85"
                style={{ borderRadius: 16, paddingVertical: 14, backgroundColor: tint }}
              >
                <Text className="font-sans-bold text-white" style={{ fontSize: 14.5 }}>{dialog.confirmLabel}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
