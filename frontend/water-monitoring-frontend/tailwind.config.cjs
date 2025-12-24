/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F2F8FF",
          100: "#E8F2FF",
          200: "#CFE4FF",
          300: "#A9CCFF",
          400: "#7CB0FF",
          500: "#4F93FF",
          600: "#2B78F6",
          700: "#1E64E0",
          800: "#174FB3",
          900: "#123B84"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2, 132, 199, 0.15)"
      }
    }
  },
  plugins: []
};
