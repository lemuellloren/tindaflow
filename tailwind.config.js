/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Brand token ───────────────────────────────────────────
        // Change ONE value in globals.css (--brand-h --brand-s --brand-l)
        // and every shade below updates automatically.
        brand: {
          50:  "hsl(var(--brand-h) var(--brand-s) 97%)",
          100: "hsl(var(--brand-h) var(--brand-s) 93%)",
          200: "hsl(var(--brand-h) var(--brand-s) 85%)",
          300: "hsl(var(--brand-h) var(--brand-s) 73%)",
          400: "hsl(var(--brand-h) var(--brand-s) 60%)",
          500: "hsl(var(--brand-h) var(--brand-s) var(--brand-l))",
          600: "hsl(var(--brand-h) var(--brand-s) 38%)",
          700: "hsl(var(--brand-h) var(--brand-s) 30%)",
          800: "hsl(var(--brand-h) var(--brand-s) 22%)",
          900: "hsl(var(--brand-h) var(--brand-s) 15%)",
        },
        // ─── shadcn semantic tokens (reference CSS vars) ───────────
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
