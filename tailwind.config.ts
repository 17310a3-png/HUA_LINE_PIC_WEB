import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#fdf9ee",
        surface: "#fdf9ee",
        "surface-dim": "#dddacf",
        "surface-bright": "#fdf9ee",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f7f3e8",
        "surface-container": "#f1eee3",
        "surface-container-high": "#ece8dd",
        "surface-container-highest": "#e6e2d8",
        "surface-variant": "#e6e2d8",
        "on-surface": "#1c1c15",
        "on-surface-variant": "#534434",
        "on-background": "#1c1c15",
        outline: "#867461",
        "outline-variant": "#d8c3ad",
        primary: "#855300",
        "on-primary": "#ffffff",
        "primary-container": "#f59e0b",
        "on-primary-container": "#613b00",
        "primary-fixed": "#ffddb8",
        "primary-fixed-dim": "#ffb95f",
        secondary: "#b90538",
        "on-secondary": "#ffffff",
        "secondary-container": "#dc2c4f",
        "on-secondary-container": "#fffbff",
        tertiary: "#895033",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#e9a07e",
        "on-tertiary-container": "#69361c",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "inverse-surface": "#31312a",
        "inverse-on-surface": "#f4f1e6",
        "inverse-primary": "#ffb95f"
      },
      borderRadius: {
        DEFAULT: "1rem",
        sm: "0.5rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px"
      },
      fontFamily: {
        headline: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        body: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        handwritten: ["var(--font-playfair)", "Georgia", "serif"]
      },
      boxShadow: {
        "soft-elevation": "0 20px 40px rgba(28, 28, 21, 0.04)",
        "soft-lift": "0 30px 50px rgba(28, 28, 21, 0.06)"
      },
      backgroundImage: {
        "primary-gradient":
          "linear-gradient(135deg, #855300 0%, #f59e0b 100%)",
        "secondary-gradient":
          "linear-gradient(135deg, #b90538 0%, #dc2c4f 100%)"
      }
    }
  },
  plugins: []
};

export default config;
