<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import type { ComponentProps } from 'svelte';

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
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Chip>)}
  <div
    class="border border-io-border-primary bg-io-surface-primary p-4 text-io-content-primary"
  >
    <Chip {...args} onremove={action('remove')} onclick={action('click')}>
      ross.edfort@temporal.io
    </Chip>
  </div>
{/snippet}

<Story name="Default" />

<Story name="Warning" args={{ intent: 'warning' }} />

<Story name="Default (as Button)" args={{ button: true }} />

<Story name="Warning (as Button)" args={{ intent: 'warning', button: true }} />
