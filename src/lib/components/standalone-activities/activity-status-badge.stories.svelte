<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import type { ActivityStatus } from '$lib/utilities/get-activity-status-and-count';

  import ActivityStatusBadge from './activity-status-badge.svelte';

  const statuses: ActivityStatus[] = [
    'Running',
    'Paused',
    'Completed',
    'Failed',
    'Canceled',
    'Terminated',
    'TimedOut',
  ];

  const { Story } = defineMeta({
    title: 'IO/Product/Activity/Status Badge',
    component: ActivityStatusBadge,
    args: {
      status: 'Running',
      delayed: false,
    },
    argTypes: {
      status: { control: 'select', options: statuses },
      delayed: { control: 'boolean' },
    },
    parameters: {
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof ActivityStatusBadge>)}
  <div class="border border-primary bg-surface-primary p-6 text-primary">
    <ActivityStatusBadge {...args} />
  </div>
{/snippet}

<Story name="Playground" />
