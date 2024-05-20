import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

import temporal from './src/lib/theme/plugin';

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    fontFamily: {
      primary: ['Inter Variable', ...fontFamily.sans],
      secondary: ['Inter', ...fontFamily.sans],
      mono: ['Noto Sans Mono', ...fontFamily.mono],
    },
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      zIndex: {
        100: '100',
      },
    },
  },
  plugins: [temporal],
} satisfies Config;

export default config;
