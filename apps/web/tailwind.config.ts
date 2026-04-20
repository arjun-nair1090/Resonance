import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070707",
        coal: "#111218",
        graphite: "#1a1c24",
        mist: "#f6f7f2",
        pulse: "#ff6b57",
        coral: "#ff9b71",
        aqua: "#65e0d2",
        amber: "#ffd36e"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(255, 107, 87, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
