/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#e87b35',
        'accent-light': '#f5a962',
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0px 4px 20px 0px rgba(0,0,0,0.25)',
        'input': '0px 4px 4px 0px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}
