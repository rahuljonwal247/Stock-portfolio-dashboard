import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
        sans: ["'Outfit'", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#4f9cf9",
          purple: "#a78bfa",
          green: "#34d399",
          yellow: "#fbbf24",
          red: "#f87171",
          orange: "#fb923c",
        },
        dark: {
          900: "#0a0e1a",
          800: "#0d1525",
          700: "#111927",
          600: "#1a2540",
          500: "#243050",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flash": "flash 1.2s ease",
        "slide-in": "slideIn 0.4s ease both",
      },
      keyframes: {
        flash: {
          "0%": { backgroundColor: "rgba(79,156,249,0.05)" },
          "50%": { backgroundColor: "rgba(79,156,249,0.15)" },
          "100%": { backgroundColor: "transparent" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
