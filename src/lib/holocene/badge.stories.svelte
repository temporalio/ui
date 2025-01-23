<script lang="ts" module>
  import { defineMeta, setTemplate } from '@storybook/addon-svelte-csf';

  import Badge, { badgeTypes } from './badge.svelte';

  const { Story } = defineMeta({
    title: 'Badge',
    component: Badge,
    parameters: {
      controls: { exclude: ['type', 'badgeTypes', 'class'] },
    },
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template()}
  <div class="flex flex-col gap-2">
    {#each badgeTypes as type}
      <Badge {type} class="capitalize">
        {type === 'count' ? '99' : type.replace(/-/g, ' ')}
      </Badge>
    {/each}
  </div>
{/snippet}

<Story name="Default" />
