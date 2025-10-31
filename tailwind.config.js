/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
      extend: {
          colors: {
              "primary": "#427cf0",
              "background-light": "#f6f6f8",
              "background-dark": "#101622",
          },
          fontFamily: {
              "display": ["Plus Jakarta Sans", "sans-serif"]
          },
          borderRadius: {
              "DEFAULT": "1rem",
              "lg": "2rem",
              "xl": "3rem",
              "full": "9999px"
          },
      },
  },
  plugins: [],
}