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
      size: 'md',
    },
    argTypes: {
      count: { control: 'number', min: 0, max: 99999, step: 1 },
      size: {
        control: 'select',
        options: ['sm', 'md'],
      },
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
      <Badge {type} size={args.size} class="capitalize">
        {(type ?? '').replace(/-/g, ' ')}
      </Badge>
    {/each}
    <Badge type="count" size={args.size}>{args.count}</Badge>
  </div>
{/snippet}

<Story name="Default" />
<Story name="Small" args={{ size: 'sm' }} />
