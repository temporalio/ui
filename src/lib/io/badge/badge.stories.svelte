<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import {
    IconAwsColor,
    IconExclamationOctagon,
    IconHeartbeat,
  } from '$lib/io/icon';

  import type { BadgeColorScheme } from './badge.svelte';
  import Badge from './badge.svelte';

  const colorSchemes: BadgeColorScheme[] = [
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
    'error',
    'accent',
  ];

  const { Story } = defineMeta({
    title: 'IO/Design System/Badge',
    component: Badge,
    args: {
      text: 'badge',
      colorScheme: 'neutral',
    },
    argTypes: {
      text: { control: 'text' },
      colorScheme: { control: 'select', options: colorSchemes },
      Icon: { control: false },
      extension: { control: 'object' },
      class: { table: { disable: true } },
    },
    parameters: {
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Badge>)}
  <div class="border border-primary bg-surface-primary p-6 text-primary">
    <Badge {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="With icon" args={{ Icon: IconHeartbeat }} />

<Story
  name="With extension"
  args={{
    Icon: IconHeartbeat,
    extension: {
      text: '987',
      LeadIcon: IconAwsColor,
      TrailIcon: IconExclamationOctagon,
    },
  }}
/>

<Story name="Color schemes">
  {#snippet template()}
    <div
      class="flex flex-wrap items-center gap-4 border border-primary bg-surface-primary p-6"
    >
      {#each colorSchemes as colorScheme (colorScheme)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{colorScheme}</span>
          <Badge
            {colorScheme}
            text="badge"
            extension={{ text: '987', TrailIcon: IconExclamationOctagon }}
          />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>
