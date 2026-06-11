import type { Config } from 'tailwindcss';

import temporal, { textStyles } from './src/lib/theme/plugin';

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [temporal, textStyles],
} satisfies Config;

export default config;
