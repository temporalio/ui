import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

import temporalColors from './colors';

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    colors: temporalColors,
    textColor: ({ theme }) => theme('colors'),
    backgroundColor: ({ theme }) => theme('colors'),
    fontFamily: {
      primary: ['Inter Variable', ...fontFamily.sans],
      secondary: ['Poppins', ...fontFamily.sans],
      mono: ['Noto Sans Mono', ...fontFamily.mono],
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
} satisfies Config;

export default config;
