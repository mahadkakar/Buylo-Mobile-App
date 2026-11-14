import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

import { colors } from "../theme/colors";

const BLOB = "#EEF0FD";
const CARD = "#B9C2F7";
const SKIN = "#F2B79B";
const SUIT = "#3F57D8";
const SUIT_DARK = "#2E43B4";

export function AuthIllustration({ variant = "signup", height = 190 }) {
  const label = variant === "signin" ? "Sign in" : "Register";
  return (
    <Svg width="100%" height={height} viewBox="0 0 300 190">
      <G transform="translate(-7 -3)">
      <Path
        d="M52 112C34 78 58 34 104 30C132 12 190 8 222 38C262 44 284 92 262 128C246 160 196 176 150 172C100 176 64 150 52 112Z"
        fill={BLOB}
      />

      <Rect x="78" y="42" width="112" height="120" rx="8" fill={CARD} />
      <Rect x="90" y="62" width="88" height="14" rx="3" fill="#fff" />
      <Rect x="90" y="82" width="88" height="14" rx="3" fill="#fff" />
      {variant === "signup" && <Rect x="90" y="102" width="88" height="14" rx="3" fill="#fff" />}
      <Rect x="90" y="128" width="88" height="16" rx="3" fill={colors.accent} />
      <Rect x="112" y="134" width="44" height="4" rx="2" fill="#fff" opacity="0.9" />
      <Rect x="108" y="50" width="52" height="4" rx="2" fill="#fff" opacity="0.8" />
      <Rect x="94" y="67" width="30" height="3" rx="1.5" fill={CARD} />
      <Rect x="94" y="87" width="24" height="3" rx="1.5" fill={CARD} />
      {variant === "signup" && <Rect x="94" y="107" width="28" height="3" rx="1.5" fill={CARD} />}

      <Rect x="176" y="20" width="30" height="30" rx="8" fill={CARD} />
      <Circle cx="191" cy="35" r="9" fill={colors.accent} />
      {variant === "signin" ? (
        <G>
          <Rect x="187" y="35" width="8" height="6" rx="1.5" fill="#fff" />
          <Path d="M188.5 35v-2a2.5 2.5 0 0 1 5 0v2" stroke="#fff" strokeWidth="1.6" fill="none" />
        </G>
      ) : (
        <Path d="M186.5 35.5l3.2 3.2 5-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}

      <Path d="M64 150h24l-3 24H67z" fill={SUIT_DARK} />
      <Path d="M76 150C70 138 66 128 70 118C80 124 84 138 76 150Z" fill={SUIT} />
      <Path d="M76 150C84 140 94 134 98 124C86 124 78 134 76 150Z" fill={colors.accent} />
      <Path d="M76 150C72 142 62 138 56 130C66 128 74 136 76 150Z" fill={SUIT} />

      <Ellipse cx="226" cy="178" rx="34" ry="5" fill={BLOB} />
      <Path d="M214 118h12l2 54h-10z" fill={SUIT_DARK} />
      <Path d="M230 118h12l4 54h-12z" fill={SUIT} />
      <Rect x="210" y="170" width="18" height="6" rx="3" fill="#1A1B26" />
      <Rect x="232" y="170" width="18" height="6" rx="3" fill="#1A1B26" />
      <Path d="M210 76c0-8 6-14 14-14h8c10 0 16 6 16 16v44h-38z" fill={SUIT} />
      <Path d="M224 62l10 20 10-20" fill="#1A1B26" />
      <Rect x="222" y="52" width="14" height="12" rx="4" fill={SKIN} />
      <Circle cx="229" cy="44" r="14" fill={SKIN} />
      <Path d="M215 42c0-10 7-16 15-16s14 5 14 14c-6-2-10-5-12-9-4 6-10 9-17 11z" fill="#1A1B26" />
      <Path d="M212 84l-30 14" stroke={SUIT} strokeWidth="10" strokeLinecap="round" />
      <Circle cx="180" cy="99" r="5" fill={SKIN} />
      <Path d="M246 86l8 30" stroke={SUIT} strokeWidth="10" strokeLinecap="round" />
      </G>
    </Svg>
  );
}
