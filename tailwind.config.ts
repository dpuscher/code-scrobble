import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./client/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        yellow: "#feda6a",
        silver: "#d4d4dc",
        grey: "#393f4d",
        dark: "#1d1e22",
        lastfm: "#d51007",
      },
      animation: {
        "spin-ease": "spin 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
