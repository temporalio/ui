import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    '.github/scripts/**/*',
    './plugins/**/*',
    './scripts/**/*',
    './tests/**/*',
    './utilities/**/*',
    './temporal/**/*',
  ],
  project: ['**/*.{svelte,css,js,cjs,mjs,ts}'],
  ignore: [
    // Is actually used via path.resolve in ./src/routes/(app)/render/+server.ts
    './src/markdown.reset.css',
  ],
  // from ./utilities/temporal-server.ts and ./utilities/ui-server.ts
  ignoreBinaries: ['which', 'server', 'go', 'air', 'make', 'start'],
  ignoreDependencies: [
    // unclear if needed by @codemirror/language
    '@codemirror/language-data',
  ],
};

export default config;
