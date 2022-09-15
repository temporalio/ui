import { sveltekit } from '@sveltejs/kit/vite';
import { HstSvelte } from '@histoire/plugin-svelte';
import { defaultColors } from 'histoire';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  histoire: {
    plugins: [HstSvelte()],
    setupFile: './src/histoire.setup.ts',
    storyIgnored: ['node_modules/**', 'dist/**', 'package/**'],
    theme: {
      title: 'Holocene',
      favicon: './static/favicon.ico',
      logo: {
        square: '/static/logo-dark.svg',
        dark: '/static/logo.svg',
        light: '/static/logo-dark.svg',
      },
      logoHref: 'https://temporal.io',
      colors: {
        gray: defaultColors.gray,
        primary: defaultColors.blue,
      },
    },
    vite: {
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
      $holocene: path.resolve('./src/lib/holocene'),
      $fixtures: path.resolve('./src/fixtures'),
    },
  },
};

export default config;
