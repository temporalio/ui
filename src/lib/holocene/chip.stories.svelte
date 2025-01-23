<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import Chip from '$lib/holocene/chip.svelte';

  const { Story } = defineMeta({
    title: 'Chip',
    component: Chip,
    args: {
      intent: 'default',
      button: false,
      removeButtonLabel: 'Remove',
    },
    argTypes: {
      intent: { control: 'select', options: ['warning', 'default'] },
      button: { control: 'boolean' },
      removeButtonLabel: {
        name: 'Aria label for remove button',
        control: 'text',
        table: {
          category: 'Accessibility',
        },
      },
    },
  });
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  setTemplate(template);
</script>

{#snippet template({ removeButtonLabel, ...args }: Args<typeof Story>)}
  <Chip
    {removeButtonLabel}
    {...args}
    remove={action('remove')}
    onclick={action('click')}
  >
    ross.edfort@temporal.io
  </Chip>
{/snippet}

<Story name="Default" />

<Story name="Warning" args={{ intent: 'warning' }} />

<Story name="Default (as Button)" args={{ button: true }} />

<Story name="Warning (as Button)" args={{ intent: 'warning', button: true }} />
