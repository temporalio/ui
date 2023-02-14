import { sveltekit } from '@sveltejs/kit/vite';
import { HstSvelte } from '@histoire/plugin-svelte';
import { defaultColors } from 'histoire';
import { temporalServer } from './plugins/vite-plugin-temporal-server';
import path from 'path';

/** @type {import('vite').UserConfig} */
export default {
  plugins: [sveltekit(), temporalServer()],
  histoire: {
    plugins: [HstSvelte()],
    setupFile: './src/histoire.setup.ts',
    storyIgnored: ['node_modules/**', 'dist/**', 'package/**', '.vercel/**'],
    theme: {
      title: 'Holocene',
      favicon: './src/lib/vendor/favicon.ico',
      logo: {
        square: './src/lib/vendor/logo-dark.svg',
        dark: './src/lib/vendor/logo.svg',
        light: './src/lib/vendor/logo-dark.svg',
      },
      logoHref: 'https://temporal.io',
      colors: {
        gray: defaultColors.gray,
        primary: defaultColors.blue,
      },
    },
    vite: {
      publicDir: './src/lib/vendor/',
      resolve: {
        alias: {
          $lib: path.resolve('./src/lib'),
          $app: path.resolve('./src/lib/svelte-mocks/app'),
        },
      },
    },
  },
  optimizeDeps: {
    include: ['date-fns', 'date-fns-tz', 'websocket-as-promised'],
  },
  resolve: {
    alias: {
      $types: path.resolve('./src/types'),
      $fixtures: path.resolve('./src/fixtures'),
    },
  },
};
