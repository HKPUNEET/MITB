/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f', // Very dark blue/black
          800: '#13131f', // Slightly lighter
          700: '#1c1c2e', // Card background
        },
        primary: {
          400: '#38bdf8', // Cyan/Sky
          500: '#0ea5e9',
        },
        medical: {
          400: '#34d399', // Emerald
          500: '#10b981',
        },
        chart: {
          1: '#f87171',
          2: '#fbbf24',
          3: '#34d399',
          4: '#60a5fa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
