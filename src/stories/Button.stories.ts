import type { Meta, StoryObj } from '@storybook/svelte';

import ButtonWrapper from './ButtonWrapper.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta = {
  title: 'Example/Button',
  component: ButtonWrapper,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      type: 'select',
      options: ['one'],
    },
    variant: {
      type: 'select',
      options: [
        'primary',
        'secondary',
        'search',
        'destructive',
        'login',
        'ghost',
        'link',
        'menu',
      ],
    },
  },

  args: {
    defaultSlot: 'button',
  },
} satisfies Meta<ButtonWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args
export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};
export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};
export const Search: Story = {
  args: {
    variant: 'search',
  },
};
export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
};
export const Login: Story = {
  args: {
    variant: 'login',
  },
};
export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
};
export const Link: Story = {
  args: {
    variant: 'link',
  },
};
export const Menu: Story = {
  args: {
    variant: 'menu',
  },
};
