import { View, Text } from "react-native";
import { Minus, Plus, Trash2 } from "lucide-react-native";

import { colors } from "../theme/colors";
import { PressableScale } from "./motion";
import { tapSelection } from "../lib/haptics";

export function Stepper({ quantity, onIncrement, onDecrement }) {
  return (
    <View className="flex-row items-center rounded-full bg-base px-1 py-1" style={{ gap: 2 }}>
      <PressableScale
        scaleTo={0.88}
        hitSlop={8}
        onPress={() => {
          tapSelection();
          onDecrement();
        }}
        className="w-8 h-8 rounded-full bg-white items-center justify-center"
      >
        {quantity <= 1 ? <Trash2 color={colors.muted} size={14} /> : <Minus color={colors.ink} size={15} />}
      </PressableScale>
      <Text className="font-sans-bold text-[14px] text-ink text-center" style={{ minWidth: 26 }}>{quantity}</Text>
      <PressableScale
        scaleTo={0.88}
        hitSlop={8}
        onPress={() => {
          tapSelection();
          onIncrement();
        }}
        className="w-8 h-8 rounded-full bg-accent items-center justify-center"
      >
        <Plus color="#fff" size={15} />
      </PressableScale>
    </View>
  );
}
