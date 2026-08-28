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
        /* ── Midnight Horizon Core Palette ─────────────── */
        "background":               "#020A07",
        "surface":                  "#0A2016",
        "surface-dim":              "#020A07",
        "surface-bright":           "#102E20",
        "surface-container-lowest": "#04100B",
        "surface-container-low":    "#061710",
        "surface-container":        "#0A2016",
        "surface-container-high":   "#102E20",
        "surface-container-highest":"#17402B",
        "surface-variant":          "#102E20",
        "surface-tint":             "#6366F1",

        /* ── On-Surface (Text) ──────────────────────────── */
        "on-surface":               "#F1F5F9",
        "on-surface-variant":       "#94A3B8",
        "on-background":            "#E2E8F0",

        /* ── Primary (Indigo) ───────────────────────────── */
        "primary":                  "#6366F1",
        "primary-container":        "rgba(99, 102, 241, 0.15)",
        "on-primary":               "#FFFFFF",
        "on-primary-container":     "#A5B4FC",
        "on-primary-fixed":         "#312E81",
        "on-primary-fixed-variant": "#4338CA",
        "primary-fixed":            "#C7D2FE",
        "primary-fixed-dim":        "#A5B4FC",
        "inverse-primary":          "#4338CA",

        /* ── Secondary (Teal) ──────────────────────────── */
        "secondary":                "#14B8A6",
        "secondary-container":      "rgba(20, 184, 166, 0.12)",
        "on-secondary":             "#042F2E",
        "on-secondary-container":   "#2DD4BF",
        "secondary-fixed":          "#99F6E4",
        "secondary-fixed-dim":      "#2DD4BF",
        "on-secondary-fixed":       "#042F2E",
        "on-secondary-fixed-variant":"#0F766E",

        /* ── Tertiary (Cyan) ────────────────────────────── */
        "tertiary":                 "#22D3EE",
        "tertiary-container":       "rgba(34, 211, 238, 0.12)",
        "on-tertiary":              "#083344",
        "on-tertiary-container":    "#22D3EE",
        "tertiary-fixed":           "#A5F3FC",
        "tertiary-fixed-dim":       "#67E8F9",
        "on-tertiary-fixed":        "#083344",
        "on-tertiary-fixed-variant":"#0E7490",

        /* ── Error / Danger ─────────────────────────────── */
        "error":                    "#F87171",
        "error-container":          "rgba(248, 113, 113, 0.15)",
        "on-error":                 "#FFFFFF",
        "on-error-container":       "#FCA5A5",

        /* ── Outline / Borders ──────────────────────────── */
        "outline":                  "rgba(255, 255, 255, 0.10)",
        "outline-variant":          "rgba(255, 255, 255, 0.06)",

        /* ── Inverse ────────────────────────────────────── */
        "inverse-surface":          "#E2E8F0",
        "inverse-on-surface":       "#1E293B",

        /* ── Accent Colors ─────────────────────────────── */
        "neon-purple":              "#818CF8",
        "neon-mint":                "#2DD4BF",
        "neon-cyan":                "#22D3EE",
        "neon-pink":                "#F472B6",
        "neon-orange":              "#F59E0B",
        "neon-red":                 "#F87171",

        /* ── Card Surface ───────────────────────────────── */
        "card":                     "#1E293B",
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
        "glow-purple": "0 0 20px rgba(99, 102, 241, 0.3), 0 0 60px rgba(99, 102, 241, 0.1)",
        "glow-mint":   "0 0 20px rgba(45, 212, 191, 0.3), 0 0 60px rgba(45, 212, 191, 0.1)",
        "glow-cyan":   "0 0 20px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.1)",
        "glow-pink":   "0 0 20px rgba(244, 114, 182, 0.3), 0 0 60px rgba(244, 114, 182, 0.1)",
        "glow-orange": "0 0 20px rgba(245, 158, 11, 0.3), 0 0 60px rgba(245, 158, 11, 0.1)",
        "glow-card":   "0 4px 40px rgba(0, 0, 0, 0.4)",
        "inner-glow":  "inset 0 1px 0 0 rgba(255,255,255,0.1)",
        "card":        "0 10px 40px rgba(0, 0, 0, 0.5)",
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
