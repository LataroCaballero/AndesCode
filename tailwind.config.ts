import type { Config } from 'tailwindcss'

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        ink: "#191919",
        primary: "#4342FF",
        accent: "#CCFF3E",
        warning: "#FF6829",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["FiraCode", "sans-serif"]
      }
    },
  },
  plugins: [],
};

export default config;