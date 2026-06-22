export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pink: { DEFAULT: "#F0127A", deep: "#C90E63", tint: "#FDEEF5" },
        forest: { DEFAULT: "#0B3D2A", deep: "#082A1D" },
        ink: "#10241A", muted: "#6B7A72",
        mint: "#EEF5F0", line: "#E8EAE7"
      },
      fontFamily: { sans: ["Inter","sans-serif"] },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } }
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        blink: "blink 0.8s step-end infinite",
        "fade-up": "fade-up 0.35s ease forwards"
      }
    }
  },
  plugins: []
};
