import type { Meta, StoryObj } from '@storybook/svelte';

import Input from '$lib/holocene/input/input.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta = {
  title: 'Example/Input',
  component: Input,
  argTypes: {
    labelHidden: {
      control: {
        type: 'boolean',
      },
    },
    valid: {
      control: {
        type: 'boolean',
      },
    },
    theme: {
      control: {
        type: 'select',
      },
      options: ['dark', 'light'],
    },
  },
} satisfies Meta<Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args
export const Regular: Story = {
  args: {
    value: 'Oh hai mark',
    label: 'Such a label',
    id: 'sounique',
  },
};
