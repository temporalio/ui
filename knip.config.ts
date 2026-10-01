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
    // Written by scripts/generate-markdown-css.ts and read by //go:embed in
    // ./server/server/route/ui.go, so nothing in JavaScript imports it.
    './server/server/route/markdown.gen.css',
  ],
  // from ./utilities/temporal-server.ts and ./utilities/ui-server.ts
  ignoreBinaries: ['which', 'server', 'go', 'air', 'make', 'start'],
  ignoreDependencies: [
    // unclear if needed by @codemirror/language
    '@codemirror/language-data',
  ],
};

export default config;
