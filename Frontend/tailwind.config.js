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
        "outline-variant": "#434750",
        "error-container": "#93000a",
        "outline": "#8d919c",
        "surface-container": "#052137",
        "secondary-fixed": "#d3e4ff",
        "on-primary-fixed-variant": "#0e4688",
        "tertiary-container": "#005567",
        "on-background": "#cfe5ff",
        "tertiary-fixed-dim": "#4cd6fb",
        "primary": "#a9c7ff",
        "error": "#ffb4ab",
        "primary-fixed": "#d6e3ff",
        "on-error": "#690005",
        "surface-container-low": "#011d33",
        "surface-bright": "#233b52",
        "on-surface": "#cfe5ff",
        "inverse-primary": "#305ea1",
        "on-tertiary-fixed": "#001f27",
        "on-tertiary-container": "#41cef3",
        "on-error-container": "#ffdad6",
        "on-secondary-container": "#f7f8ff",
        "primary-container": "#1a4d8f",
        "background": "#001526",
        "surface-container-high": "#122c42",
        "on-secondary-fixed-variant": "#004882",
        "surface-tint": "#a9c7ff",
        "inverse-surface": "#cfe5ff",
        "on-secondary-fixed": "#001c38",
        "on-primary-fixed": "#001b3e",
        "tertiary": "#4cd6fb",
        "surface-container-highest": "#1e374d",
        "surface": "#001526",
        "on-secondary": "#00315c",
        "inverse-on-surface": "#1a3249",
        "tertiary-fixed": "#b3ebff",
        "surface-dim": "#001526",
        "primary-fixed-dim": "#a9c7ff",
        "on-tertiary": "#003642",
        "secondary": "#a3c9ff",
        "secondary-fixed-dim": "#a3c9ff",
        "surface-variant": "#1e374d",
        "surface-container-lowest": "#000f1e",
        "on-surface-variant": "#c3c6d2",
        "on-tertiary-fixed-variant": "#004e5f",
        "secondary-container": "#0474cb",
        "on-primary-container": "#9dc0ff",
        "on-primary": "#003063"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "lg": "24px",
        "xs": "4px",
        "md": "16px",
        "gutter": "24px",
        "sidebar_width": "240px",
        "container_max_width": "1440px",
        "sm": "8px",
        "base": "8px",
        "xl": "32px"
      },
      fontFamily: {
        "h3": ["Inter", "sans-serif"],
        "h1": ["Inter", "sans-serif"],
        "h1-mobile": ["Inter", "sans-serif"],
        "h2": ["Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label-tag": ["Inter", "sans-serif"],
        "caption": ["Inter", "sans-serif"]
      },
      fontSize: {
        "h3": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
        "h1": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "h1-mobile": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "h2": ["28px", {"lineHeight": "36px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "body": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "label-tag": ["11px", {"lineHeight": "14px", "letterSpacing": "0.05em", "fontWeight": "500"}],
        "caption": ["12px", {"lineHeight": "16px", "fontWeight": "400"}]
      }
    },
  },
  plugins: [
    formsPlugin,
    containerQueriesPlugin,
  ],
}
