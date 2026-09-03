<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import type { EventStatus } from './event-status-badge.svelte';
  import EventStatusBadge from './event-status-badge.svelte';

  const statuses: EventStatus[] = [
    'Unspecified',
    'Scheduled',
    'Open',
    'New',
    'Started',
    'Initiated',
    'Running',
    'Completed',
    'Fired',
    'CancelRequested',
    'TimedOut',
    'Signaled',
    'Canceled',
    'Failed',
    'Terminated',
    'Paused',
    'Pending',
    'Retrying',
  ];

  const { Story } = defineMeta({
    title: 'IO/Product/Event History/Status Badge',
    component: EventStatusBadge,
    args: {
      status: 'Running',
    },
    argTypes: {
      status: { control: 'select', options: statuses },
    },
    parameters: {
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof EventStatusBadge>)}
  <div class="border border-primary bg-surface-primary p-6 text-primary">
    <EventStatusBadge {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="Statuses">
  {#snippet template()}
    <div
      class="flex flex-wrap items-center gap-4 border border-primary bg-surface-primary p-6 text-primary"
    >
      {#each statuses as status (status)}
        <EventStatusBadge {status} />
      {/each}
    </div>
  {/snippet}
</Story>
