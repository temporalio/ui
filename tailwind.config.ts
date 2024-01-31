import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

import temporal from './src/theme';

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
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
  plugins: [temporal],
} satisfies Config;

export default config;
