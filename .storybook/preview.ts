import type { Preview } from '@storybook/svelte';
import '../src/app.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: {
      default: 'primary',
      values: [
        {
          name: 'space-black',
          value: '#141414',
        },
        {
          name: 'off-white',
          value: '#f8f8f7',
        },
        {
          name: 'black',
          value: '#000',
        },
        {
          name: 'white',
          value: '#fff',
        },
        {
          name: 'light',
          value: '#f4f4f5',
        },
        {
          name: 'dark',
          value: '#18181b',
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
