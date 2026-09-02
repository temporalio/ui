<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import {
    IconAwsColor,
    IconExclamationOctagon,
    IconHeartbeat,
  } from '$lib/io/icon';

  import type { BadgeStatusValue } from './badge-status.svelte';
  import BadgeStatus from './badge-status.svelte';

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
    title: 'Io/Badge Status',
    component: BadgeStatus,
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

{#snippet template(args: ComponentProps<typeof BadgeStatus>)}
  <div class="border border-primary bg-surface-primary p-6 text-primary">
    <BadgeStatus {...args} />
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
    <div
      class="flex flex-wrap items-center gap-4 border border-primary bg-surface-primary p-6"
    >
      {#each statuses as status (status)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{status}</span>
          <BadgeStatus {status} />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>
