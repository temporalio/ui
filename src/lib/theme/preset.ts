import type { Config } from 'tailwindcss';

import temporal, { textStyles } from './plugin';

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [temporal, textStyles],
} satisfies Config;

export default config;
