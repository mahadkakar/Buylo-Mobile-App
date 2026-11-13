import { View, Text, Pressable, ImageBackground } from "react-native";

import { HERO_IMAGE } from "../constants/images";
import { Reveal } from "./motion";

// Photo banner at the top of the dashboard, above the aisles (bundled photo, see constants/images.js).
export function HeroBanner({ title, subtitle, cta, onPress }) {
  return (
    <Reveal style={{ marginTop: 20 }}>
      <ImageBackground
        source={HERO_IMAGE}
        resizeMode="cover"
        style={{ borderRadius: 22, overflow: "hidden", backgroundColor: "#1A1B26" }}
      >
        <View style={{ backgroundColor: "rgba(20,21,35,0.62)", paddingHorizontal: 20, paddingVertical: 22 }}>
          <Text className="font-sans-extrabold text-white" style={{ fontSize: 24, lineHeight: 30, maxWidth: 260 }}>
            {title}
          </Text>
          <Text className="font-sans-medium text-white mt-2" style={{ fontSize: 13.5, lineHeight: 19, maxWidth: 250, opacity: 0.92 }}>
            {subtitle}
          </Text>
          <Pressable
            onPress={onPress}
            className="self-start bg-accent rounded-full px-5 py-3 mt-4 active:opacity-90"
          >
            <Text className="font-sans-bold text-[13.5px] text-white">{cta}</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </Reveal>
  );
}
