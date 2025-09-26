/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aviation: {
          50: '#A0DDFF',
          100: '#C1CEFE',
          200: '#7189FF',
          300: '#758ECD',
          400: '#624CAB',
          500: '#624CAB',
          600: '#624CAB',
          700: '#624CAB',
          800: '#624CAB',
          900: '#624CAB',
        },
        severity: {
          normal: '#10b981',
          caution: '#f59e0b',
          critical: '#ef4444',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}