module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        base: "#F7F7FB",
        ink: "#1A1B26",
        muted: "#5B5D6E",
        surface: "#FFFFFF",
        border: "#E4E4EE",
        accent: {
          DEFAULT: "#4F46E5",
          soft: "#EAE9FC",
        },
        savings: {
          DEFAULT: "#15803D",
          soft: "#E9FBEF",
        },
      },
      fontFamily: {
        sans: ["Manrope_400Regular"],
        "sans-medium": ["Manrope_500Medium"],
        "sans-semibold": ["Manrope_600SemiBold"],
        "sans-bold": ["Manrope_700Bold"],
        "sans-extrabold": ["Manrope_800ExtraBold"],
        mono: ["JetBrainsMono_600SemiBold"],
      },
    },
  },
  plugins: [],
};
