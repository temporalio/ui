import type { Preview } from '@storybook/sveltekit';

import '../../../apps/ui/src/app.css';

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
  },
};

export default preview;
