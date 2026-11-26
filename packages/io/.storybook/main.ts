import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.svelte'],
  addons: ['@storybook/addon-svelte-csf', '@storybook/addon-docs'],
  framework: '@storybook/sveltekit',
};

export default config;
