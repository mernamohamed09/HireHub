import formsPlugin from '@tailwindcss/forms';
import containerQueriesPlugin from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Core Cyberpunk Palette ─────────────────────── */
        "background":               "#03050A",
        "surface":                  "#0F1629",
        "surface-dim":              "#03050A",
        "surface-bright":           "#1A2034",
        "surface-container-lowest": "#050814",
        "surface-container-low":    "#080D1F",
        "surface-container":        "#0C1222",
        "surface-container-high":   "#111A2E",
        "surface-container-highest":"#1A2642",
        "surface-variant":          "#17223B",
        "surface-tint":             "#6E5CFF",

        /* ── On-Surface (Text) ──────────────────────────── */
        "on-surface":               "#FFFFFF",
        "on-surface-variant":       "#9FA8C5",
        "on-background":            "#E2E8F0",

        /* ── Primary (Purple) ───────────────────────────── */
        "primary":                  "#6E5CFF",
        "primary-container":        "rgba(110, 92, 255, 0.15)",
        "on-primary":               "#FFFFFF",
        "on-primary-container":     "#A594FF",
        "on-primary-fixed":         "#1B0A5C",
        "on-primary-fixed-variant": "#3D2A9E",
        "primary-fixed":            "#D6CFFF",
        "primary-fixed-dim":        "#A594FF",
        "inverse-primary":          "#4A3CC0",

        /* ── Secondary (Mint) ───────────────────────────── */
        "secondary":                "#55F5C6",
        "secondary-container":      "rgba(85, 245, 198, 0.12)",
        "on-secondary":             "#003D2E",
        "on-secondary-container":   "#55F5C6",
        "secondary-fixed":          "#B3FFEA",
        "secondary-fixed-dim":      "#55F5C6",
        "on-secondary-fixed":       "#002018",
        "on-secondary-fixed-variant":"#005540",

        /* ── Tertiary (Cyan) ────────────────────────────── */
        "tertiary":                 "#00E5FF",
        "tertiary-container":       "rgba(0, 229, 255, 0.12)",
        "on-tertiary":              "#003640",
        "on-tertiary-container":    "#00E5FF",
        "tertiary-fixed":           "#B3F5FF",
        "tertiary-fixed-dim":       "#4CD6FB",
        "on-tertiary-fixed":        "#001F27",
        "on-tertiary-fixed-variant":"#004E5F",

        /* ── Error / Danger (Red-Pink) ──────────────────── */
        "error":                    "#FF5A7A",
        "error-container":          "rgba(255, 90, 122, 0.15)",
        "on-error":                 "#FFFFFF",
        "on-error-container":       "#FF8FA5",

        /* ── Outline / Borders ──────────────────────────── */
        "outline":                  "rgba(255, 255, 255, 0.12)",
        "outline-variant":          "rgba(255, 255, 255, 0.06)",

        /* ── Inverse ────────────────────────────────────── */
        "inverse-surface":          "#E2E8F0",
        "inverse-on-surface":       "#1A2034",

        /* ── Custom Neon Accents ────────────────────────── */
        "neon-purple":              "#6E5CFF",
        "neon-mint":                "#55F5C6",
        "neon-cyan":                "#00E5FF",
        "neon-pink":                "#FF6B95",
        "neon-orange":              "#FDBA4D",
        "neon-red":                 "#FF5A7A",

        /* ── Card Surface ───────────────────────────────── */
        "card":                     "#1A2034",
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "md":      "0.75rem",
        "lg":      "1rem",
        "xl":      "1.25rem",
        "2xl":     "1.375rem",  /* 22px – main card radius */
        "3xl":     "1.5rem",
        "full":    "9999px",
      },
      spacing: {
        "lg":                   "24px",
        "xs":                   "4px",
        "md":                   "16px",
        "gutter":               "24px",
        "sidebar_width":        "220px",
        "sidebar_collapsed":    "80px",
        "container_max_width":  "1440px",
        "sm":                   "8px",
        "base":                 "8px",
        "xl":                   "32px",
        "3xl":                  "48px",
      },
      fontFamily: {
        "sans":        ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        "h1":          ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        "h1-mobile":   ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        "h2":          ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        "h3":          ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        "body":        ["'Inter'", "sans-serif"],
        "label-tag":   ["'Inter'", "sans-serif"],
        "caption":     ["'Inter'", "sans-serif"],
      },
      fontSize: {
        "h1":       ["40px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "h1-mobile":["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "h2":       ["28px", {"lineHeight": "36px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "h3":       ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
        "body":     ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "label-tag":["11px", {"lineHeight": "14px", "letterSpacing": "0.05em", "fontWeight": "500"}],
        "caption":  ["12px", {"lineHeight": "16px", "fontWeight": "400"}],
      },
      boxShadow: {
        "glow-purple": "0 0 30px rgba(110, 92, 255, 0.4), 0 0 100px rgba(110, 92, 255, 0.15)",
        "glow-mint":   "0 0 30px rgba(85, 245, 198, 0.4), 0 0 100px rgba(85, 245, 198, 0.15)",
        "glow-cyan":   "0 0 30px rgba(0, 229, 255, 0.4), 0 0 100px rgba(0, 229, 255, 0.15)",
        "glow-pink":   "0 0 30px rgba(255, 107, 149, 0.4), 0 0 100px rgba(255, 107, 149, 0.15)",
        "glow-orange": "0 0 30px rgba(253, 186, 77, 0.4), 0 0 100px rgba(253, 186, 77, 0.15)",
        "glow-card":   "0 0 60px rgba(84, 175, 255, 0.1)",
        "inner-glow":  "inset 0 1px 0 0 rgba(255,255,255,0.15)",
        "card":        "0 20px 50px rgba(0, 0, 0, 0.6)",
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'glow-pulse': 'glow-pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'orbit': 'orbit 30s linear infinite',
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px 0px rgba(0, 255, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px 10px rgba(188, 19, 254, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
    },
  },
  plugins: [
    formsPlugin,
    containerQueriesPlugin,
  ],
}
