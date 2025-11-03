/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef5ff",
          100: "#dfeafe",
          200: "#bfd3fd",
          300: "#9fbafc",
          400: "#7f9ef8",
          500: "#5b82f2",   // primary
          600: "#3f65d8",
          700: "#2f4db0",
          800: "#263f8c",
          900: "#22366f",
        },
      },
      boxShadow: {
        card: "0 6px 18px rgba(17, 24, 39, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
