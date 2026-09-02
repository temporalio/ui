<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import {
    IconAwsColor,
    IconExclamationOctagon,
    IconHeartbeat,
  } from '$lib/io/icon';

  import type { BadgeVariant } from './types';

  import Badge from './badge.svelte';

  const variants: BadgeVariant[] = [
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
    'error',
    'accent',
  ];

  const { Story } = defineMeta({
    title: 'Io/Badge/Badge',
    component: Badge,
    args: {
      text: 'badge',
      variant: 'neutral',
    },
    argTypes: {
      text: { control: 'text' },
      variant: { control: 'select', options: variants },
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
  <div class="bg-background-primary p-6 text-primary">
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

<Story name="Variants">
  {#snippet template()}
    <div class="flex flex-wrap items-center gap-4 bg-background-primary p-6">
      {#each variants as variant (variant)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{variant}</span>
          <Badge
            {variant}
            text="badge"
            extension={{ text: '987', TrailIcon: IconExclamationOctagon }}
          />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>
