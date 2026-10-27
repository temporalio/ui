import { fileURLToPath } from 'node:url';

import theme from '../tailwind.config';

export default {
  ...theme,
  content: [
    fileURLToPath(new URL('../src/lib/**/*.{svelte,ts}', import.meta.url)),
    fileURLToPath(new URL('./src/**/*.{svelte,ts}', import.meta.url)),
  ],
};
