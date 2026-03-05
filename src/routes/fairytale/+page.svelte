<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import {
    categories,
    componentRegistry,
  } from '$lib/holocene/fairytale-registry';

  const entries = Object.entries(componentRegistry).filter(
    ([key, entry]) => key !== 'index' && !entry.requiresContext,
  );

  const categoryCounts = $derived.by(() => {
    const counts: Record<string, number> = {};
    for (const [, entry] of entries) {
      counts[entry.category] = (counts[entry.category] || 0) + 1;
    }
    return counts;
  });

  const categoryFirstComponent = $derived.by(() => {
    const first: Record<string, string> = {};
    for (const [key, entry] of entries) {
      if (!first[entry.category]) {
        first[entry.category] = key;
      }
    }
    return first;
  });
</script>

<div class="p-8">
  <h1 class="text-3xl font-bold text-primary">Holocene Component Library</h1>
  <p class="mt-2 text-secondary">
    {entries.length} components across {categories.length} categories
  </p>

  <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each categories as category (category)}
      {@const count = categoryCounts[category] || 0}
      {@const firstComponent = categoryFirstComponent[category]}
      <a href="/fairytale/{firstComponent}">
        <Card class="transition-shadow hover:shadow-md">
          <h2 class="text-lg font-semibold text-primary">
            {category}
          </h2>
          <p class="mt-1 text-sm text-secondary">
            {count} component{count !== 1 ? 's' : ''}
          </p>
        </Card>
      </a>
    {/each}
  </div>
</div>
