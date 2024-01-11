const defaultTheme = require('tailwindcss/defaultTheme');
const temporalColors = require('./colors.cjs');

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    colors: temporalColors,
    textColor: ({ theme }) => theme('colors'),
    backgroundColor: ({ theme }) => theme('colors'),
    fontFamily: {
      primary: ['Inter Variable', ...defaultTheme.fontFamily.sans],
      secondary: ['Poppins', ...defaultTheme.fontFamily.sans],
      mono: ['Noto Sans Mono', ...defaultTheme.fontFamily.mono],
    },
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      boxShadow: {
        focus: '0 0 0 4px',
      },
      zIndex: {
        100: '100',
      },
    },
  },
  plugins: [],
};

module.exports = config;
