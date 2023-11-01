<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import { toaster } from '../stores/toaster';

  import Button from './button.svelte';
  import Toaster from './toaster.svelte';
</script>

<Meta
  title="Toaster"
  component={Toaster}
  argTypes={{
    variant: {
      control: 'select',
      options: ['primary', 'success', 'info', 'warning', 'error'],
    },
    duration: { control: 'number', message: { control: 'text' } },
    closeButtonLabel: { control: 'text' },
    pop: { control: false },
    toasts: { control: false },
  }}
/>

<Template let:args>
  {@const { duration, message, variant } = args}
  <Button on:click={() => toaster.push({ duration, message, variant })}
    >Trigger Toast</Button
  >
  <Toaster {...args} pop={toaster.pop} toasts={toaster.toasts} />
</Template>

<Story
  name="toasts"
  args={{
    closeButtonLabel: 'Close',
    duration: 2000,
    variant: 'primary',
    message: 'This is a toast',
  }}
/>
