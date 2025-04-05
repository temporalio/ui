<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import { toaster } from '../stores/toaster';

  import Button from './button.svelte';
  import Toast from './toast.svelte';
  import Toaster from './toaster.svelte';

  export const meta = {
    title: 'Toaster',
    component: Toaster,
    args: {
      closeButtonLabel: 'Close',
      duration: 2000,
      variant: 'Primary',
      message: 'This is a toast message.',
    },
    argTypes: {
      variant: {
        name: 'Variant',
        control: 'select',
        options: ['Primary', 'Success', 'Info', 'Error', 'Warning'],
        mapping: {
          Primary: 'primary',
          Success: 'success',
          Info: 'info',
          Error: 'error',
          Warning: 'warning',
        },
      },
      message: { name: 'Message', control: 'text' },
      duration: { control: { type: 'range', min: 0, max: 5000, step: 100 } },
      closeButtonLabel: {
        name: 'Close Button Label',
        control: 'text',
        table: { category: 'Accessibility' },
      },
    },
  } satisfies Meta<Toaster & Toast['variant']>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args let:context>
  {@const { duration, message, variant, closeButtonLabel } = args}
  <div class="flex max-w-60 flex-col gap-2">
    <Toast id={context.id} {variant} {closeButtonLabel}>{message}</Toast>

    <Button on:click={() => toaster.push({ duration, message, variant })}>
      <span class="capitalize">Trigger {variant} toast</span>
    </Button>

    <Toaster {...args} pop={toaster.pop} toasts={toaster.toasts} />
  </div>
</Template>

<Story name="Primary" />

<Story name="Success" args={{ variant: 'Success' }} />

<Story name="Info" args={{ variant: 'Info' }} />

<Story name="Error" args={{ variant: 'Error' }} />

<Story name="Warning" args={{ variant: 'Warning' }} />
