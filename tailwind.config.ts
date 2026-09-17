import type { Config } from 'tailwindcss';

import temporal, { textStyles } from './src/lib/theme/plugin';

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    fontFamily: {
      sans: [
        'ui-sans-serif',
        'system-ui',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji',
      ],
      serif: [
        'ui-serif',
        'Georgia',
        'Cambria',
        'Times New Roman',
        'Times',
        'serif',
      ],
      mono: [
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace',
      ],
    },
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      zIndex: {
        100: '100',
      },
    },
  },
  plugins: [temporal, textStyles],
} satisfies Config;

export default config;
