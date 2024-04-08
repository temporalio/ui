<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Button from '$lib/holocene/button.svelte';
  import iconNames from '$lib/holocene/icon';
</script>

<Meta
  title="Button"
  component={Button}
  argTypes={{
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    leadingIcon: { control: 'select', options: iconNames },
    trailingIcon: { control: 'select', options: iconNames },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'ghost'],
    },
    borderModifier: {
      control: 'select',
      options: ['borderless', 'borderless-left', 'borderless-right'],
    },
    borderRadiusModifier: {
      control: 'select',
      options: ['square', 'square-left', 'square-right'],
    },
    target: {
      control: 'select',
      options: ['_blank', '_self', '_parent', '_top'],
    },
    href: {
      control: 'text',
    },
    id: {
      control: 'text',
    },
  }}
/>

<Template let:args>
  <Button {...args} on:click={action('click')}>Click Me</Button>
</Template>

<Story
  name="button"
  args={{
    variant: 'primary',
    size: 'md',
    loading: false,
  }}
/>
