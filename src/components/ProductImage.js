import { useState } from "react";
import { View, Image } from "react-native";
import { ShoppingBasket } from "lucide-react-native";

import { colors } from "../theme/colors";
import { CATEGORIES } from "../constants/categories";

// Shows the product photo, or a neutral category-icon tile when there is no
// photo (or the photo fails to load). Deliberately NOT a stock photo of
// something else — a generic "milk" picture on a cheese looked like a wrong
// product, which is worse than an honest placeholder.
export function ProductImage({ uri, category, style, resizeMode = "cover", iconSize = 30 }) {
  const [failed, setFailed] = useState(false);

  if (uri && !failed) {
    // Retailer photos are often 1000+ pixels wide. `resizeMethod="resize"` makes Android decode them at the size they are shown
    // (the default can scale the full size bitmap every frame, which is what drops the UI frame rate in lists and while the
    // sidebar slides over them), and `fadeDuration={0}` skips Android's extra fade-in drawing pass for each photo.
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
