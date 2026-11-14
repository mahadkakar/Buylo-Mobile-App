import { useState } from "react";
import { View, Image } from "react-native";
import { ShoppingBasket } from "lucide-react-native";

import { colors } from "../theme/colors";
import { CATEGORIES } from "../constants/categories";

export function ProductImage({ uri, category, style, resizeMode = "cover", iconSize = 30 }) {
  const [failed, setFailed] = useState(false);

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={style}
        resizeMode={resizeMode}
        resizeMethod="resize"
        fadeDuration={0}
        onError={() => setFailed(true)}
      />
    );
  }

  const Icon = CATEGORIES.find((c) => c.slug === category)?.icon ?? ShoppingBasket;
  return (
    <View style={[style, { backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" }]}>
      <Icon color={colors.accent} size={iconSize} />
    </View>
  );
}
