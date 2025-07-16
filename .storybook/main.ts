import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|svelte)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: '@storybook/addon-svelte-csf',
      options: {
        // REMOVE WHEN STORIES ARE UPGRADED TO NEW CSF SYNTAX
        legacyTemplate: true,
      },
    },
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@chromatic-com/storybook',
  ],
  framework: '@storybook/sveltekit',
};

export default config;
