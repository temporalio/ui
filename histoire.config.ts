import path from 'path';
import { defaultColors, defineConfig } from 'histoire';
import { HstSvelte as histoire } from '@histoire/plugin-svelte';

export default defineConfig({
  plugins: [histoire()],
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
});
