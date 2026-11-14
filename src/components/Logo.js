import { Image } from "react-native";

const ratio = 771 / 927;

export function Logo({ size = 32, style }) {
  return (
    <Image
      source={require("../../assets/brand/buylo-mark.png")}
      resizeMode="contain"
      style={[{ width: size * ratio, height: size }, style]}
    />
  );
}
