import { View, Text } from "react-native";
import { Minus, Plus, Trash2 } from "lucide-react-native";

import { colors } from "../theme/colors";
import { PressableScale } from "./motion";
import { tapSelection } from "../lib/haptics";

export function Stepper({ quantity, onIncrement, onDecrement, label, compact = false }) {
  const button = compact ? { width: 30, height: 30 } : null;
  const name = label ?? "item";
  return (
    <View
      onStartShouldSetResponder={() => true}
      className={`flex-row items-center rounded-full bg-base ${compact ? "p-0.5" : "px-1 py-1"}`}
      style={{ gap: 2 }}
    >
      <PressableScale
        lite={compact}
        scaleTo={0.88}
        hitSlop={compact ? 7 : 8}
        onPress={() => {
          tapSelection();
          onDecrement();
        }}
        accessibilityRole="button"
        accessibilityLabel={quantity <= 1 ? `Remove ${name} from basket` : `Decrease ${name} quantity`}
        className="w-8 h-8 rounded-full bg-white items-center justify-center"
        style={button}
      >
        {quantity <= 1 ? <Trash2 color={colors.muted} size={14} /> : <Minus color={colors.ink} size={15} />}
      </PressableScale>
      <Text
        className="font-sans-bold text-[14px] text-ink text-center"
        style={{ minWidth: compact ? 18 : 26 }}
        accessibilityLabel={`Quantity ${quantity}`}
      >
        {quantity}
      </Text>
      <PressableScale
        lite={compact}
        scaleTo={0.88}
        hitSlop={compact ? 7 : 8}
        onPress={() => {
          tapSelection();
          onIncrement();
        }}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${name} quantity`}
        className="w-8 h-8 rounded-full bg-accent items-center justify-center"
        style={button}
      >
        <Plus color="#fff" size={15} />
      </PressableScale>
    </View>
  );
}
