import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#ecfdf7",
          100: "#d0f4e4",
          200: "#a4e8cd",
          300: "#6ed4ae",
          400: "#3cbb8c",
          500: "#1ba179",
          600: "#128163",
          700: "#126751",
          800: "#125242",
          900: "#0f4438",
        },
        ink: {
          50: "#f4f6f8",
          100: "#e3e7ec",
          200: "#c8d0d9",
          300: "#9caab8",
          400: "#6b7c8f",
          500: "#4f5f72",
          600: "#3d4b5c",
          700: "#323d4d",
          800: "#2a3341",
          900: "#0f1419",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(15, 20, 25, 0.08), 0 8px 16px -8px rgba(15, 20, 25, 0.06)",
        card: "0 1px 0 rgba(15, 20, 25, 0.06), 0 12px 40px -16px rgba(15, 20, 25, 0.12)",
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(at 20% 30%, rgba(27, 161, 121, 0.14) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(50, 61, 77, 0.08) 0px, transparent 45%), radial-gradient(at 50% 80%, rgba(27, 161, 121, 0.08) 0px, transparent 50%)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
