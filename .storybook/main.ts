import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/sveltekit';

import { agentDocsPlugin } from './agent-docs-plugin';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|svelte)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-svelte-csf',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/sveltekit',
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: [...(viteConfig.plugins ?? []), agentDocsPlugin(root)],
  }),
};

export default config;
