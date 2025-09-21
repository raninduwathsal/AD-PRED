/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'duo-green': '#58CC02',
        'duo-blue': '#1CB0F6',
        'duo-purple': '#CE82FF',
        'duo-red': '#FF4B4B',
      },
      animation: {
        'confetti': 'confetti 1s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        confetti: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-200px)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
      },
    },
  },
  plugins: [],
}