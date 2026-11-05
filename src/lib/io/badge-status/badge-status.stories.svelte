<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import {
    BadgeStatus,
    type BadgeStatusSize,
    type BadgeStatusValue,
  } from '$lib/io/badge-status';
  import {
    IconClock,
    IconExclamationOctagon,
    IconHeartbeat,
  } from '$lib/io/icon';

  const sizes: BadgeStatusSize[] = ['sm', 'md'];
  const counts: {
    label: string;
    value: ComponentProps<typeof BadgeStatus>['count'];
  }[] = [
    { label: 'No count', value: undefined },
    { label: 'Zero', value: 0 },
    { label: 'Localized number', value: 1234567 },
    { label: 'String count', value: '1k+' },
  ];

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
    title: 'IO/Components/Badge Status',
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
      truncate: { control: 'boolean' },
      TrailIcon: { control: false },
      extensions: { control: 'object' },
      showImpliedExtensions: { control: 'boolean' },
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

<Story name="Implied pause extension" args={{ status: 'Paused' }} />

<Story
  name="Without implied extensions"
  args={{ status: 'Paused', showImpliedExtensions: false }}
/>

<Story
  name="Implied and conditional extensions"
  args={{
    status: 'Paused',
    extensions: [
      false,
      null,
      undefined,
      { text: 'extra', colorScheme: 'accent' },
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

<Story name="Default truncation">
  {#snippet template()}
    <div class="w-64 border border-primary bg-surface-primary p-6">
      <BadgeStatus
        status="Paused"
        text="A long paused status label that should truncate"
        count={14}
        TrailIcon={IconHeartbeat}
        extensions={[{ text: '987', colorScheme: 'accent' }]}
      />
    </div>
  {/snippet}
</Story>

<Story name="Count formatting">
  {#snippet template()}
    <div
      class="flex flex-wrap items-start gap-6 border border-primary bg-surface-primary p-6"
    >
      {#each counts as count (count.label)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{count.label}</span>
          <BadgeStatus status="Running" count={count.value} />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

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
