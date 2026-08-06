import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        pixeva: {
          bg: "#0a0a0f",
          card: "#12121a",
          surface: "#161622",
          border: "rgba(255, 255, 255, 0.12)",
          cyan: "#00d4ff",
          purple: "#8b5cf6",
          blue: "#3b82f6",
          emerald: "#10b981",
          amber: "#f59e0b",
          muted: "#a0a0b0",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glowCyan: "0 0 25px -3px rgba(0, 212, 255, 0.5)",
        glowPurple: "0 0 25px -3px rgba(139, 92, 246, 0.5)",
        glowBlue: "0 0 25px -3px rgba(59, 130, 246, 0.5)",
        glowEmerald: "0 0 25px -3px rgba(16, 185, 129, 0.5)",
        pixevaCard: "0 10px 30px -10px rgba(0, 0, 0, 0.7)",
      },
    },
  },
  plugins: [],
};
export default config;
