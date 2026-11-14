import { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { Bookmark } from "lucide-react-native";

import { colors } from "../theme/colors";

export function SaveBasketModal({ visible, initialName = "", title, confirmLabel, onClose, onConfirm }) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (visible) setName(initialName);
  }, [visible, initialName]);

  const canConfirm = name.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 items-center justify-center px-7"
        style={{ backgroundColor: "rgba(20,21,35,0.5)" }}
      >
        <Pressable onPress={onClose} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        <Animated.View
          entering={ZoomIn.duration(170)}
          className="w-full bg-white items-center"
          style={{
            maxWidth: 380,
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
          <View className="items-center justify-center" style={{ width: 56, height: 56, borderRadius: 20, backgroundColor: colors.accentSoft }}>
            <Bookmark color={colors.accent} size={26} strokeWidth={2.2} />
          </View>
          <Text className="font-sans-extrabold text-ink text-center" style={{ fontSize: 19, marginTop: 16 }}>{title}</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Weekly groceries"
            placeholderTextColor={colors.muted}
            autoFocus
            maxLength={60}
            className="w-full font-sans text-base text-ink bg-base border border-border"
            style={{ borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginTop: 16 }}
          />

          <View className="flex-row w-full" style={{ gap: 12, marginTop: 20 }}>
            <Pressable
              onPress={onClose}
              className="flex-1 items-center border border-border active:opacity-70"
              style={{ borderRadius: 16, paddingVertical: 14 }}
            >
              <Text className="font-sans-bold text-ink" style={{ fontSize: 14.5 }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => canConfirm && onConfirm(name.trim())}
              disabled={!canConfirm}
              className="flex-1 items-center bg-accent active:opacity-85"
              style={{ borderRadius: 16, paddingVertical: 14, opacity: canConfirm ? 1 : 0.5 }}
            >
              <Text className="font-sans-bold text-white" style={{ fontSize: 14.5 }}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
