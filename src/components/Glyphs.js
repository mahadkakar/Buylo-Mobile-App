import { View } from "react-native";

export function PlusGlyph({ size = 16, color = "#fff", thickness = 2 }) {
  const bar = { position: "absolute", backgroundColor: color, borderRadius: thickness };
  return (
    <View style={{ width: size, height: size }}>
      <View style={[bar, { left: 0, right: 0, top: (size - thickness) / 2, height: thickness }]} />
      <View style={[bar, { top: 0, bottom: 0, left: (size - thickness) / 2, width: thickness }]} />
    </View>
  );
}

export function MinusGlyph({ size = 16, color = "#fff", thickness = 2 }) {
  return (
    <View style={{ width: size, height: size, justifyContent: "center" }}>
      <View style={{ height: thickness, backgroundColor: color, borderRadius: thickness }} />
    </View>
  );
}

export function CheckGlyph({ size = 16, color = "#fff", thickness = 2 }) {
  const w = size * 0.34;
  const h = size * 0.62;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: w,
          height: h,
          borderRightWidth: thickness,
          borderBottomWidth: thickness,
          borderColor: color,
          transform: [{ rotate: "45deg" }, { translateY: -size * 0.06 }],
        }}
      />
    </View>
  );
}
