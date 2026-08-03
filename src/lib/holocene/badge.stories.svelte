<svelte:options runes />

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import Badge, { badgeTypes } from './badge.svelte';

  const types = badgeTypes.filter((type) => type !== 'count');

  const { Story } = defineMeta({
    title: 'Badge',
    component: Badge,
    args: {
      count: 99,
    },
    argTypes: {
      count: { control: 'number', min: 0, max: 99999, step: 1 },
    },
    parameters: {
      controls: { exclude: ['type', 'badgeTypes', 'class'] },
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Badge> & { count?: number })}
  <div class="flex flex-col gap-2">
    {#each types as type (type)}
      <Badge {type} class="capitalize">{(type ?? '').replace(/-/g, ' ')}</Badge>
    {/each}
    <Badge type="count">{args.count}</Badge>
  </div>
{/snippet}

<Story name="Default" />
