import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

import temporal, { textStyles } from './src/lib/theme/plugin';

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    fontFamily: {
      sans: ['Inter', ...fontFamily.sans],
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
  plugins: [temporal, textStyles],
} satisfies Config;

export default config;
