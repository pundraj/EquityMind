import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(15,23,42,0.35)",
      },
      backgroundImage: {
        "aurora-radial":
          "radial-gradient(circle at top left, rgba(56,189,248,0.24), transparent 32%), radial-gradient(circle at top right, rgba(16,185,129,0.20), transparent 28%), linear-gradient(180deg, #06111f 0%, #091423 42%, #0f172a 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
