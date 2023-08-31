import type { Meta, StoryObj } from '@storybook/svelte';

import { icons } from '$lib/holocene/icon/paths';

import ButtonWrapper from './ButtonWrapper.svelte';

const iconControls = {
  control: {
    type: 'select',
  },
  options: Object.keys(icons),
};

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta = {
  title: 'Example/Button',
  component: ButtonWrapper,
  argTypes: {
    leadingIcon: { ...iconControls },
    trailingIcon: { ...iconControls },
    variant: {
      control: {
        type: 'select',
      },
      options: ['primary', 'secondary', 'destructive', 'ghost'],
    },
  },

  args: {
    defaultSlot: 'button',
  },
} satisfies Meta<ButtonWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args
export const Button: Story = {
  args: {
    variant: 'primary',
  },
};
