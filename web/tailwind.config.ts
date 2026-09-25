import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#F4F2EC",
        panel: "#FCFBF9",
        brand: {
          DEFAULT: "#1F4D3A", // Bottle green
          dark: "#16382A",
          light: "#2B684F",
        },
        border: "#CFCABD",
        borderLight: "#E7E4DC",
        ink: {
          DEFAULT: "#1B1C1A",
          muted: "#5F6368",
          subtle: "#80868B",
        },
        status: {
          green: "#1A6334",
          greenBg: "#EBF5EE",
          amber: "#B25E00",
          amberBg: "#FEF7EE",
          red: "#A51D24",
          redBg: "#FDF2F2",
        },
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
        devanagari: ["'Noto Sans Devanagari'", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "3px",
        sm: "2px",
        md: "4px",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};
export default config;
