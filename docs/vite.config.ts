import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { sveltekit } from '@sveltejs/kit/vite';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import nesting from 'tailwindcss/nesting';
import { defineConfig } from 'vite';

import theme from './tailwind.config';

const sourceDirs = ['../src/lib/io-ark', './src'].map((dir) =>
  fileURLToPath(new URL(dir, import.meta.url)),
);

const arkImports = new Set(
  sourceDirs.flatMap((dir) =>
    readdirSync(dir, { recursive: true, encoding: 'utf8' })
      .filter((file) => /\.(svelte|ts)$/.test(file))
      .flatMap((file) =>
        Array.from(
          readFileSync(`${dir}/${file}`, 'utf8').matchAll(
            /from '(@ark-ui\/svelte\/[a-z-]+)'/g,
          ),
          (match) => match[1],
        ),
      ),
  ),
);

export default defineConfig({
  plugins: [sveltekit()],
  css: {
    postcss: {
      plugins: [nesting(), tailwindcss(theme), autoprefixer()],
    },
  },
  optimizeDeps: { include: [...arkImports] },
  server: { port: 6007, strictPort: true },
});
