/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          300: "var(--brand-300)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          DEFAULT: "var(--brand-600)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
      },
    },
  },
  plugins: [],
};
