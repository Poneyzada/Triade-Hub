import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        foreground: "#EDEDED",
        triade: {
          bg: "#09090B",
          surface: "#0D0E12",
          card: "#121215",
          cardHover: "#18181D",
          border: "#27272A",
          borderSubtle: "#1C1C21",
          gold: "#D4AF37",
          goldLight: "#F3E5AB",
          goldMuted: "#B89628",
          goldDark: "#947209",
          cyan: "#0DA5A0",
          cyanLight: "#2DD4BF",
          cyanGlow: "rgba(13, 165, 160, 0.25)",
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #AA820A 100%)",
        "gold-shine": "linear-gradient(90deg, transparent, rgba(243, 229, 171, 0.2), transparent)",
        "cyan-gradient": "linear-gradient(135deg, #2DD4BF 0%, #0DA5A0 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(24, 24, 29, 0.7) 0%, rgba(18, 18, 21, 0.95) 100%)",
        "radial-space": "radial-gradient(circle at 50% 0%, rgba(13, 165, 160, 0.08) 0%, rgba(212, 175, 55, 0.04) 40%, transparent 75%)",
      },
      boxShadow: {
        "gold-glow": "0 0 25px -5px rgba(212, 175, 55, 0.25)",
        "cyan-glow": "0 0 25px -5px rgba(13, 165, 160, 0.25)",
        "card-subtle": "0 8px 30px rgba(0, 0, 0, 0.5)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
