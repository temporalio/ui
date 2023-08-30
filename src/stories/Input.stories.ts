import type { Meta, StoryObj } from '@storybook/svelte';

import InputWrapper from './InputWrapper.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta = {
  title: 'Example/Input',
  component: InputWrapper,
  tags: ['autodocs'],
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
} satisfies Meta<InputWrapper>;

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
