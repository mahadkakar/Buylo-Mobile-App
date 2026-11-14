import { View } from "react-native";
import { Plus } from "lucide-react-native";

import { ItemRow } from "./ItemRow";
import { Stepper } from "./Stepper";
import { PressableScale, Reveal } from "./motion";
import { tapLight } from "../lib/haptics";

export function RecentItemCard({ item, quantity, onPress, onAdd, onIncrement, onDecrement, index = 0 }) {
  return (
    <Reveal index={index}>
      <ItemRow
        index={index}
        image={item.image}
        category={item.category}
        name={item.name}
        brand={item.brand}
        size={item.sizeLabel}
        price={item.price}
        note={`Best at ${item.retailer}`}
        onPress={onPress}
      >
        {quantity > 0 ? (
          <Stepper quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
        ) : (
          <PressableScale
            scaleTo={0.88}
            hitSlop={8}
            onPress={() => {
              tapLight();
              onAdd();
            }}
            className="w-10 h-10 rounded-full bg-accent items-center justify-center"
          >
            <Plus color="#fff" size={18} />
          </PressableScale>
        )}
      </ItemRow>
    </Reveal>
  );
}
