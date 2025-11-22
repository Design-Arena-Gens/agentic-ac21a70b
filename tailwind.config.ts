import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        raven: {
          500: "#6c4ad4",
          600: "#4f2fb3",
          700: "#34158f"
        }
      },
      boxShadow: {
        "raven-glow": "0 0 30px rgba(122, 82, 224, 0.35)",
        "raven-core": "0 0 120px rgba(108, 74, 212, 0.55)"
      },
      animation: {
        "energy-pulse": "energyPulse 2s ease-in-out infinite"
      },
      keyframes: {
        energyPulse: {
          "0%, 100%": {
            transform: "scale(0.98)",
            opacity: "0.45"
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "0.75"
          }
        }
      }
    }
  },
  plugins: []
};

export default config;
