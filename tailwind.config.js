/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#EFE6D2",
        "cream-dark": "#E2D5B8",
        paper: "#FBF7EC",
        ink: "#20291C",
        "ink-soft": "#5c5744",
        "forest-deep": "#1B4630",
        "forest-deeper": "#12331F",
        "forest-mid": "#3E7A52",
        "forest-light": "#5FA872",
        teal: "#2E8B8B",
        plum: "#5B4C87",
        gold: "#D9A441",
        "gold-dark": "#B9862F",
        "gold-glow": "#F3C868",
        line: "#D8C9A3",
      },
      fontFamily: {
        pixel: ["'Press Start 2P'", "monospace"],
        sans: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 0 rgba(18,51,31,0.22)",
      },
    },
  },
  plugins: [],
};
