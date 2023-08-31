import type { Meta, StoryObj } from '@storybook/svelte';

import Icon from '$lib/holocene/icon/icon.svelte';
import { icons } from '$lib/holocene/icon/paths';

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta = {
  title: 'Icon',
  component: Icon,
  argTypes: {
    name: {
      control: {
        type: 'select',
      },
      options: Object.keys(icons),
    },
  },
  args: {
    width: 60,
    height: 60,
  },
} satisfies Meta<Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args
export const Regular: Story = {
  args: {
    name: 'comet-solid',
  },
};
