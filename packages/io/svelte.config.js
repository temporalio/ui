import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: [vitePreprocess()],
  compilerOptions: {
    runes: ({ filename }) =>
      filename.includes('node_modules') ? undefined : true,
  },
  kit: {
    files: {
      lib: 'src',
    },
  },
};
