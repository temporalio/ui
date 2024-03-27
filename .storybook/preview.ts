import type { Preview } from '@storybook/svelte';

import '../src/app.css';
import './dark-mode.css';

import DarkMode, { useDarkMode } from '../src/lib/utilities/dark-mode';

const preview: Preview = {
  decorators: [
    (_, { globals }) => {
      useDarkMode.set(globals.theme === 'dark');
      return { Component: DarkMode };
    },
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: {
      disable: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export const globalTypes = {
  theme: {
    name: 'Toggle Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: ['light', 'dark'],
      showName: true,
      dynamicTitle: true,
    },
  },
};

export default preview;
