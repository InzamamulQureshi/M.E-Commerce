import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        craft: {
          parchment: "#FAF7F2",
          paper: "#F4EFE6",
          linen: "#ECE4D6",
          sage: "#3E5743",
          "sage-dark": "#2A3D2E",
          terracotta: "#B8553A",
          "terracotta-dark": "#973F28",
          blush: "#E8B4A2",
          gold: "#C99E4B",
          ink: "#272220",
          charcoal: "#383230",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Ubuntu", "sans-serif"],
        serif: ["var(--font-serif)", "Ubuntu", "sans-serif"],
        mono: ["var(--font-mono)", "Ubuntu", "sans-serif"],
        ubuntu: ["Ubuntu", "sans-serif"],
      },
      boxShadow: {
        craft: "0 4px 20px -2px rgba(43, 34, 27, 0.08)",
        "craft-hover": "0 10px 30px -4px rgba(43, 34, 27, 0.14)",
        stamp: "inset 0 0 0 1px rgba(184, 85, 58, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
