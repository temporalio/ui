<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import type { ChipStatusValue } from './chip-status.svelte';
  import ChipStatus from './chip-status.svelte';

  const statuses: ChipStatusValue[] = [
    'Running',
    'Paused',
    'Completed',
    'ContinuedAsNew',
    'Failed',
    'TimedOut',
    'Terminated',
    'Canceled',
  ];

  const { Story } = defineMeta({
    title: 'Io/Chip Status',
    component: ChipStatus,
    args: {
      status: 'Running',
      extension: '9,876',
      disabled: false,
    },
    argTypes: {
      status: { control: 'select', options: statuses },
      extension: { control: 'text' },
      disabled: { control: 'boolean' },
      class: { table: { disable: true } },
    },
    parameters: {
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof ChipStatus>)}
  <div class="border border-primary bg-surface-primary p-6 text-primary">
    <ChipStatus {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="Statuses">
  {#snippet template()}
    <div
      class="flex flex-wrap items-center gap-4 border border-primary bg-surface-primary p-6"
    >
      {#each statuses as status (status)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{status}</span>
          <ChipStatus {status} extension="9,876" />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>
