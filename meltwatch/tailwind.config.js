/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FFFFFF",
          50: "#FFFFFF",
          100: "#F7F8F8",
          200: "#EEEEF0",
        },
        ink: {
          DEFAULT: "#202020",
          900: "#202020",
          800: "#2D2D2D",
          700: "#3D3D3D",
          600: "#555555",
          500: "#767676",
          400: "#9E9E9E",
          300: "#C2C2C2",
        },
        molten: {
          DEFAULT: "#28BBBB",
          50: "#E6F8F8",
          100: "#BFEEEE",
          200: "#93E2E2",
          300: "#5ED4D4",
          400: "#28BBBB",
          500: "#1FA5A5",
          600: "#28BBBB",
          700: "#177D7D",
        },
        moss: {
          DEFAULT: "#177D7D",
          400: "#1FA5A5",
          500: "#177D7D",
          600: "#0F5F5F",
        },
        border: "rgba(32, 32, 32, 0.1)",
        ring: "#28BBBB",
      },
      fontFamily: {
        display: ['"Inter"', '"Noto Sans SC"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: [
          '"Inter"',
          '"Noto Sans SC"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      fontSize: {
        "display-xl": [
          "clamp(3.5rem, 8vw, 7rem)",
          { lineHeight: "0.95", letterSpacing: "-0.04em" },
        ],
        "display-lg": [
          "clamp(2.75rem, 6vw, 5rem)",
          { lineHeight: "0.98", letterSpacing: "-0.035em" },
        ],
        "display-md": [
          "clamp(2rem, 4vw, 3.25rem)",
          { lineHeight: "1.05", letterSpacing: "-0.03em" },
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s ease-out forwards",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};
