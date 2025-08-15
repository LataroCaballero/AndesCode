import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'media',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#191919" },
        primary: { DEFAULT: "#4342FF" },
        accent: { DEFAULT: "#48ff3eff" },
        warning: { DEFAULT: "#FF6829" },
        inkContrast: { DEFAULT: "#2A2A2A" },
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