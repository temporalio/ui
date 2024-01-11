const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');
const temporalColors = require('./colors.cjs');

/** @type {import('tailwindcss').Config} */
const config = {
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
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
        '.bg-solid': {
          background: theme('colors.gray.100'),
          'dark:background': theme('colors.primary'),
        },
      });
    }),
  ],
};

module.exports = config;
