<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import {
    IconClock,
    IconExclamationOctagon,
    IconHeartbeat,
  } from '$lib/io/icon';

  import type {
    BadgeStatusSize,
    BadgeStatusValue,
  } from './badge-status.svelte';
  import BadgeStatus from './badge-status.svelte';

  const sizes: BadgeStatusSize[] = ['sm', 'md'];

  const statuses: BadgeStatusValue[] = [
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
    title: 'IO/Design System/Badge Status',
    component: BadgeStatus,
    args: {
      status: 'Running',
      count: 14,
      size: 'md',
    },
    argTypes: {
      status: { control: 'select', options: statuses },
      text: { control: 'text' },
      count: { control: 'number' },
      size: { control: 'select', options: sizes },
      TrailIcon: { control: false },
      extensions: { control: 'object' },
      class: { table: { disable: true } },
    },
    parameters: {
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof BadgeStatus>)}
  <div class="border border-primary bg-surface-primary p-6 text-primary">
    <BadgeStatus {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="With trail icon" args={{ TrailIcon: IconHeartbeat }} />

<Story
  name="With extensions"
  args={{
    extensions: [
      {
        text: 'delayed',
        colorScheme: 'info',
        TrailIcon: IconClock,
      },
      {
        text: 'task failure',
        colorScheme: 'danger',
        TrailIcon: IconExclamationOctagon,
      },
    ],
  }}
/>

<Story name="Sizes">
  {#snippet template()}
    <div
      class="flex flex-wrap items-end gap-4 border border-primary bg-surface-primary p-6"
    >
      {#each sizes as size (size)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{size}</span>
          <BadgeStatus {size} status="Running" count={14} />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

<Story name="Statuses">
  {#snippet template()}
    <div
      class="flex flex-wrap items-center gap-4 border border-primary bg-surface-primary p-6"
    >
      {#each statuses as status (status)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{status}</span>
          <BadgeStatus {status} count={14} />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>
