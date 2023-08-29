const defaultTheme = require('tailwindcss/defaultTheme');
const temporalColors = require('./colors.cjs');

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    colors: temporalColors,
    textColor: temporalColors,
    backgroundColor: temporalColors,
    fontFamily: {
      primary: ['Inter Variable', ...defaultTheme.fontFamily.sans],
      secondary: ['Poppins', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      boxShadow: {
        focus: '0 0 0 4px',
      },
    },
  },
  plugins: [],
};

module.exports = config;
