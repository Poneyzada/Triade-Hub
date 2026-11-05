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
        background: "#050B11",
        foreground: "#E2F1F8",
        triade: {
          bg: "#050B11",
          surface: "#0A141E",
          card: "#0E1C2A",
          cardHover: "#132638",
          border: "#1C354A",
          borderSubtle: "#122332",
          // Paleta Azul Petróleo / Ciano Cósmico da Imagem de Referência
          blue: "#22D3EE",
          blueLight: "#7DD3FC",
          blueMuted: "#1B4763",
          blueDark: "#0284C7",
          deepPetroleum: "#0A1C29",
          cyan: "#22D3EE",
          cyanLight: "#67E8F9",
          cyanGlow: "rgba(34, 211, 238, 0.3)",
          // Compatibilidade
          gold: "#22D3EE",
          goldLight: "#7DD3FC",
          goldMuted: "#0284C7",
          goldDark: "#0369A1",
        },
      },
      backgroundImage: {
        "blue-gradient": "linear-gradient(135deg, #7DD3FC 0%, #22D3EE 50%, #0284C7 100%)",
        "gold-gradient": "linear-gradient(135deg, #7DD3FC 0%, #22D3EE 50%, #0284C7 100%)",
        "cyan-gradient": "linear-gradient(135deg, #67E8F9 0%, #0EA5E9 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(14, 28, 42, 0.85) 0%, rgba(10, 20, 30, 0.95) 100%)",
        "radial-space": "radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.12) 0%, rgba(2, 132, 199, 0.06) 45%, transparent 75%)",
      },
      boxShadow: {
        "blue-glow": "0 0 25px -4px rgba(34, 211, 238, 0.35)",
        "gold-glow": "0 0 25px -4px rgba(34, 211, 238, 0.35)",
        "cyan-glow": "0 0 25px -4px rgba(34, 211, 238, 0.35)",
        "card-subtle": "0 8px 32px rgba(0, 0, 0, 0.6)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
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
