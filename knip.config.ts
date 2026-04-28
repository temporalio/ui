import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    '.github/scripts/**/*.{js,mjs,cjs}',
    './plugins/**/*.ts',
    './scripts/**/*.{ts,sh}',
    './tests/**',
    './utilities/**',
    './temporal/**',
  ],
  project: ['**/*.{svelte,css,js,cjs,mjs,ts}'],
  ignore: [
    // Is actually used via path.resolve in ./src/routes/(app)/render/+server.ts
    './src/markdown.reset.css',
  ],
  // from ./utilities/temporal-server.ts and ./utilities/ui-server.ts
  ignoreBinaries: ['which', 'server', 'go', 'air', 'make', 'start'],
};

export default config;
