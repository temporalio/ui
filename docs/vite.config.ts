import { sveltekit } from '@sveltejs/kit/vite';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import nesting from 'tailwindcss/nesting';
import { defineConfig } from 'vite';

import theme from './tailwind.config';

export default defineConfig({
  plugins: [sveltekit()],
  css: {
    postcss: {
      plugins: [nesting(), tailwindcss(theme), autoprefixer()],
    },
  },
  server: { port: 6007, strictPort: true },
});
