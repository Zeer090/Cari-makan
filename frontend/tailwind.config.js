/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        ink: '#2B2118',
        saffron: '#E8A33D',
        terracotta: '#C8553D',
        sage: '#6B8F71',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(43, 33, 24, 0.05)',
      },
    },
  },
  plugins: [],
}
