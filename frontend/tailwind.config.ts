import type { Config } from "tailwindcss";
import { buildFontThemeExtend } from "./src/lib/font-theme-tailwind";

const fontTheme = buildFontThemeExtend();

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      ...fontTheme,
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card-bg)",
        /** Public marketing shell (stitch / SAMPLE_CODE palette) */
        brand: {
          bg: "#f8f9ff",
          fg: "#0b1c30",
          secondary: "#555f6f",
          tertiary: "#006591",
          muted: "#444749",
          surface: "#e5eeff",
          "surface-low": "#eff4ff",
          outline: "#747879",
          "outline-soft": "#c4c7c8",
          white: "#ffffff",
        },
        hcode: {
          violet: "#6c407e",
          muted: "var(--foreground)",
          border: "var(--card-border)",
          gray: "var(--hcode-gray-surface)",
          dark: "#252525",
          input: "var(--hcode-input-border)",
        },
      },
      fontFamily: {
        sans: ["var(--font-open-sans)", "sans-serif"],
        display: ["var(--font-oswald)", "sans-serif"],
        /** trust_premium_brand: Inter (see `context/fonts/font_families.json`) */
        brand: ["var(--font-primary)", "Inter", "system-ui", "sans-serif"],
        "brand-display": ["var(--font-primary)", "Inter", "system-ui", "sans-serif"],
        "brand-mono": ["var(--font-mono)", "IBM Plex Mono", "ui-monospace", "monospace"],
        "brand-accent": ["var(--font-accent)", "Merriweather", "Georgia", "serif"],
      },
      maxWidth: {
        content: "1280px",
      },
      spacing: {
        "page-x": "1.25rem",
        "page-x-md": "4rem",
      },
    },
  },
  plugins: [],
};
export default config;
