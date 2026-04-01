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
        background: "var(--background)",
        foreground: "var(--foreground)",
        hcode: {
          violet: "#6c407e",
          muted: "#626262",
          border: "#e5e5e5",
          gray: "#f6f6f6",
          dark: "#252525",
          input: "#dfdfdf",
        },
      },
      fontFamily: {
        sans: ["var(--font-open-sans)", "sans-serif"],
        display: ["var(--font-oswald)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
