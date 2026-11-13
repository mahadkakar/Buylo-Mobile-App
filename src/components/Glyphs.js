import { View } from "react-native";

// Small icons drawn from plain views. An SVG icon (lucide) is an Svg, a G and one or more Paths per icon, and a React Profiler
// recording showed those as a large share of the time spent building a screen of product cards (one per add button). These
// two look the same at card size and cost a couple of native views each.

// A plus sign: two crossing bars.
export function PlusGlyph({ size = 16, color = "#fff", thickness = 2 }) {
  const bar = { position: "absolute", backgroundColor: color, borderRadius: thickness };
  return (
    <View style={{ width: size, height: size }}>
      <View style={[bar, { left: 0, right: 0, top: (size - thickness) / 2, height: thickness }]} />
      <View style={[bar, { top: 0, bottom: 0, left: (size - thickness) / 2, width: thickness }]} />
    </View>
  );
}

// A minus sign: one bar.
export function MinusGlyph({ size = 16, color = "#fff", thickness = 2 }) {
  return (
    <View style={{ width: size, height: size, justifyContent: "center" }}>
      <View style={{ height: thickness, backgroundColor: color, borderRadius: thickness }} />
    </View>
  );
}

// A check mark: the corner of a rotated square.
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
