import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Production Chain Theme Colors
        production: {
          blue: "var(--production-blue)",
          "blue-light": "var(--production-blue-light)",
          "blue-dark": "var(--production-blue-dark)",
          teal: "var(--production-teal)",
          "teal-light": "var(--production-teal-light)",
          "teal-dark": "var(--production-teal-dark)",
          "blue-50": "var(--production-blue-50)",
          "blue-100": "var(--production-blue-100)",
          "blue-200": "var(--production-blue-200)",
          "blue-300": "var(--production-blue-300)",
          "blue-400": "var(--production-blue-400)",
          "blue-500": "var(--production-blue-500)",
          "blue-600": "var(--production-blue-600)",
          "blue-700": "var(--production-blue-700)",
          "blue-800": "var(--production-blue-800)",
          "blue-900": "var(--production-blue-900)",
          "blue-950": "var(--production-blue-950)",
          "teal-50": "var(--production-teal-50)",
          "teal-100": "var(--production-teal-100)",
          "teal-200": "var(--production-teal-200)",
          "teal-300": "var(--production-teal-300)",
          "teal-400": "var(--production-teal-400)",
          "teal-500": "var(--production-teal-500)",
          "teal-600": "var(--production-teal-600)",
          "teal-700": "var(--production-teal-700)",
          "teal-800": "var(--production-teal-800)",
          "teal-900": "var(--production-teal-900)",
          "teal-950": "var(--production-teal-950)",
        },
      },
      backgroundImage: {
        noise: "url('/noise.svg')",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

