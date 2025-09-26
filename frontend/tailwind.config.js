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
        // Duolingo Brand Colors
        'duo-green': {
          DEFAULT: '#58CC02',
          50: '#F0FDE4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#58CC02',
          600: '#46A302',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        'duo-blue': {
          DEFAULT: '#1CB0F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#1CB0F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        'duo-purple': {
          DEFAULT: '#CE82FF',
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#CE82FF',
          600: '#A855F7',
          700: '#9333EA',
          800: '#7C3AED',
          900: '#6B21A8',
        },
        'duo-red': {
          DEFAULT: '#FF4B4B',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#FF4B4B',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        'duo-yellow': {
          DEFAULT: '#FFC800',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FFC800',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Background Colors
        'duo-bg-blue': '#235390',
        'duo-bg-dark-blue': '#042C60',
        
        // Sign Language Learning Theme Colors
        'sign-primary': '#6366F1',      // Indigo for primary actions
        'sign-secondary': '#8B5CF6',    // Purple for secondary actions
        'sign-accent': '#F59E0B',       // Amber for highlights
        'sign-success': '#10B981',      // Emerald for success states
        'sign-warm': '#F97316',         // Orange for warm interactions
      },
      fontFamily: {
        'feather': ['feather', 'sans-serif'],
      },
      animation: {
        'confetti': 'confetti 1s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'hand-wave': 'handWave 1s ease-in-out infinite',
        'sign-glow': 'signGlow 2s ease-in-out infinite',
        'float-gentle': 'floatGentle 3s ease-in-out infinite',
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
        bounceSubtle: {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': { 
            transform: 'translateY(-5px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        handWave: {
          '0%, 100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
        signGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.6), 0 0 30px rgba(99, 102, 241, 0.4)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-2px) rotate(1deg)' },
          '66%': { transform: 'translateY(2px) rotate(-1deg)' },
        },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'duo': '0 4px 0 0 rgb(0 0 0 / 0.2)',
        'duo-green': '0 4px 0 0 rgb(70 163 2)',
        'duo-blue': '0 4px 0 0 rgb(37 99 235)',
        'duo-yellow': '0 4px 0 0 rgb(217 119 6)',
      },
    },
  },
  plugins: [],
}