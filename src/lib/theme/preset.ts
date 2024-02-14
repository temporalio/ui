import type { Config } from 'tailwindcss';

import temporal from './plugin';

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [temporal],
} satisfies Config;

export default config;
