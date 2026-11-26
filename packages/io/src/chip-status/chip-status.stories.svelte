<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import usage from './chip-status.usage.md?raw';

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
    title: 'IO/Components/Chip Status',
    tags: ['autodocs'],
    component: ChipStatus,
    args: {
      status: 'Running',
      count: 14,
      extension: 2,
      disabled: false,
    },
    argTypes: {
      status: { control: 'select', options: statuses },
      count: { control: 'number' },
      extension: { control: 'number' },
      disabled: {
        control: 'boolean',
        table: {
          category: 'properties',
          type: { summary: 'boolean' },
          defaultValue: { summary: 'false' },
        },
      },
      class: { table: { disable: true } },
    },
    parameters: {
      docs: {
        description: {
          component:
            'An interactive workflow status label with optional count and change indicator.',
        },
        usage,
      },
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

<Story tags={['!dev']} name="Playground" />

<Story name="Statuses">
  {#snippet template()}
    <div
      class="flex flex-wrap items-center gap-4 border border-primary bg-surface-primary p-6"
    >
      {#each statuses as status (status)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{status}</span>
          <ChipStatus {status} count={14} extension={2} />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>
