import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2430",
        muted: "#5f6b7a",
        line: "#d8dde5",
        panel: "#ffffff",
        canvas: "#f4f6f8",
        accent: { DEFAULT: "#1d4ed8", soft: "#dbe4ff" },
        ops: { DEFAULT: "#0f766e", soft: "#d8f0ec" },
        oc: { DEFAULT: "#b45309", soft: "#fbe9cf" },
        warn: "#b91c1c",
      },
      fontFamily: { sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"], mono: ["ui-monospace", "Consolas", "monospace"] },
    },
  },
  plugins: [],
};

export default config;
