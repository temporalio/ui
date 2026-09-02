<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import {
    IconAwsColor,
    IconExclamationOctagon,
    IconHeartbeat,
  } from '$lib/io/icon';

  import type { StatusBadgeStatus } from './types';

  import StatusBadge from './status-badge.svelte';

  const statuses: StatusBadgeStatus[] = [
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
    title: 'Io/Badge/Status Badge',
    component: StatusBadge,
    args: {
      status: 'Running',
    },
    argTypes: {
      status: { control: 'select', options: statuses },
      TrailIcon: { control: false },
      extension: { control: 'object' },
      class: { table: { disable: true } },
    },
    parameters: {
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof StatusBadge>)}
  <div class="bg-background-primary p-6 text-primary">
    <StatusBadge {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="With trail icon" args={{ TrailIcon: IconHeartbeat }} />

<Story
  name="With extension"
  args={{
    extension: {
      text: '123,987',
      LeadIcon: IconAwsColor,
      TrailIcon: IconExclamationOctagon,
    },
  }}
/>

<Story name="Statuses">
  {#snippet template()}
    <div class="flex flex-wrap items-center gap-4 bg-background-primary p-6">
      {#each statuses as status (status)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{status}</span>
          <StatusBadge {status} />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>
