<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Chip from '$lib/holocene/chip.svelte';

  import type {
    ActiveCatalogFilter,
    CatalogFilterKey,
  } from './catalog-list-state';

  interface Props {
    shown: number;
    total: number;
    activeFilters: readonly ActiveCatalogFilter[];
    onremove: (key: CatalogFilterKey) => void;
    onclear: () => void;
  }

  let { shown, total, activeFilters, onremove, onclear }: Props = $props();
</script>

<div
  class="flex min-h-8 flex-wrap items-center gap-2 text-sm text-secondary"
  aria-live="polite"
  data-testid="catalog-summary"
>
  <span><strong class="text-primary">{shown}</strong> of {total} examples</span>
  {#each activeFilters as filter (filter.key)}
    <Chip
      removeButtonLabel={`Remove filter ${filter.label}`}
      onremove={() => onremove(filter.key)}>{filter.label}</Chip
    >
  {/each}
  {#if activeFilters.length}
    <Button size="xs" variant="ghost" onclick={onclear}>Clear filters</Button>
  {/if}
</div>
