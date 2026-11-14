import { View, Text, ActivityIndicator, Pressable } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle2 } from "lucide-react-native";

import { colors } from "../theme/colors";
import { useUiStore } from "../store/uiStore";
import { AppDialog } from "./AppDialog";

export function UiLayer() {
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);
  const busy = useUiStore((state) => state.busy);
  const hideToast = useUiStore((state) => state.hideToast);

  return (
    <>
      {toast ? (
        <Animated.View
          key={toast.id}
          entering={FadeInDown.duration(180)}
          exiting={FadeOutDown.duration(220)}
          pointerEvents="box-none"
          className="absolute self-center bg-ink rounded-full pl-4 pr-3 py-2.5 flex-row items-center gap-2"
          style={{ bottom: Math.max(insets.bottom, 12) + 92, maxWidth: "90%" }}
        >
          <CheckCircle2 color="#4ADE80" size={16} />
          <Text className="font-sans-semibold text-white text-[13px] flex-shrink" numberOfLines={1}>{toast.message}</Text>
          {toast.action ? (
            <Pressable
              hitSlop={10}
              onPress={() => {
                hideToast();
                toast.action.onPress();
              }}
              className="rounded-full px-3 py-1.5 ml-1"
              style={{ backgroundColor: "rgba(255,255,255,0.16)" }}
            >
              <Text className="font-sans-bold text-white text-[12.5px]">{toast.action.label}</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      ) : null}

      {busy ? (
        <Animated.View
          entering={FadeIn.duration(120)}
          exiting={FadeOut.duration(150)}
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(20,21,35,0.45)" }}
        >
          <View className="bg-white rounded-2xl px-6 py-5 items-center gap-3">
            <ActivityIndicator color={colors.accent} />
            <Text className="font-sans-semibold text-[13px] text-ink">{busy}</Text>
          </View>
        </Animated.View>
      ) : null}

      <AppDialog />
    </>
  );
}
