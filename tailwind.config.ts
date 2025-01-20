// tailwind.config.ts

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          700: '#4C51BF',
          600: '#5A67D8',
          500: '#667EEA',
          400: '#7F9CF5',
          300: '#A3BFFA',
        },
        purple: {
          800: '#6B46C1',
          700: '#7C3AED',
          600: '#9333EA',
          500: '#A855F7',
          400: '#C084FC',
        },
        green: {
          600: '#16A34A',
          500: '#22C55E',
          400: '#4ADE80',
          300: '#86EFAC',
          200: '#BBF7D0',
        },
        blue: {
          600: '#2563EB',
          500: '#3B82F6',
          400: '#60A5FA',
          300: '#93C5FD',
          200: '#BFDBFE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
};
