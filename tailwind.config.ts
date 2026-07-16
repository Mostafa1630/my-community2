import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10231F",
        paper: "#FBF9F4",
        surface: "#FFFFFF",
        line: "#E4E0D5",
        primary: {
          DEFAULT: "#0E5B52",
          50: "#EAF3F1",
          100: "#CFE4E0",
          200: "#9FC9C1",
          300: "#6FAEA2",
          400: "#3F9383",
          500: "#0E5B52",
          600: "#0C4F47",
          700: "#0A3E38",
          800: "#072D29",
          900: "#051C19"
        },
        accent: {
          DEFAULT: "#D79A3B",
          50: "#FBF3E3",
          100: "#F6E3BE",
          200: "#F1D9A6",
          300: "#E9C077",
          400: "#E0AC57",
          500: "#D79A3B",
          600: "#B37E2C",
          700: "#8A6222",
          800: "#614518",
          900: "#38280E"
        },
        success: "#2F7A52",
        danger: "#C24A3B",
        info: "#2D6E8E"
      },
      fontFamily: {
        // Same stack for display + body, like Udemy uses one consistent typeface
        // throughout rather than a separate "heading font". Plus Jakarta Sans handles
        // Latin text; the browser falls back to IBM Plex Sans Arabic per-glyph for
        // Arabic script automatically (Jakarta Sans has no Arabic glyphs of its own).
        display: ["var(--font-sans)", "var(--font-sans-arabic)", "sans-serif"],
        body: ["var(--font-sans)", "var(--font-sans-arabic)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"]
      },
      fontSize: {
        // Nudged up from Tailwind's defaults (xs 12px/sm 14px) to read closer to
        // Udemy's body copy size, without touching layout-affecting sizes like lg+.
        xs: ["0.8125rem", { lineHeight: "1.25rem" }],
        sm: ["0.9375rem", { lineHeight: "1.5rem" }],
        base: ["1rem", { lineHeight: "1.65rem" }]
      },
      borderRadius: {
        seal: "50%"
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,35,31,0.04), 0 8px 24px -12px rgba(16,35,31,0.12)",
        raised: "0 4px 14px -4px rgba(16,35,31,0.18)"
      },
      backgroundImage: {
        "seal-ring": "repeating-conic-gradient(from 0deg, currentColor 0deg 8deg, transparent 8deg 16deg)"
      }
    }
  },
  plugins: []
};

export default config;
