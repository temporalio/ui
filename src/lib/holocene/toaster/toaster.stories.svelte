<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import Button from '../button.svelte';

  import Toaster, { toaster } from './toaster.svelte';

  const { Story } = defineMeta({
    title: 'Toaster',
    args: {
      closeButtonLabel: 'Close',
      duration: 2000,
      variant: 'primary',
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
      },
      link: {
        name: 'Link',
        control: 'text',
      },
    },
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(args: Args<typeof Story>)}
  {@const { duration, message, variant, link } = args}
  <div class="flex max-w-60 flex-col gap-2">
    <Button onclick={() => toaster.push({ duration, message, variant, link })}>
      <span class="capitalize">Trigger {variant} toast</span>
    </Button>

    <Toaster closeButtonLabel="Close" />
  </div>
{/snippet}

<Story name="Primary" />

<Story name="Success" args={{ variant: 'success' }} />

<Story name="Info" args={{ variant: 'info' }} />

<Story name="Error" args={{ variant: 'error' }} />

<Story name="Warning" args={{ variant: 'warning' }} />
