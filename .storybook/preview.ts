import type { Preview } from '@storybook/svelte';

import { withThemeByDataAttribute } from '@storybook/addon-themes';

import '../src/app.css';

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      defaultTheme: 'light',
      themes: {
        light: 'light',
        dark: 'dark',
      },
      attributeName: 'data-theme',
    }),
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: {
      disable: true,
    },
    controls: {
      exclude: /^id|name|class|data-\w+|on\w+/,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
