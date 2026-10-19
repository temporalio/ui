<script lang="ts">
  import {
    type CatalogFacets,
    type CatalogFilterKey,
    catalogFilterKeys,
    type CatalogFilters,
    catalogFilterTitle,
  } from './catalog-list-state';

  import CatalogFacetOption from './catalog-facet-option.svelte';

  interface Props {
    facets: CatalogFacets;
    filters: CatalogFilters;
    onselect: (key: CatalogFilterKey, value: string | null) => void;
  }

  let { facets, filters, onselect }: Props = $props();
</script>

<nav
  aria-label="Filter examples"
  class="hidden w-64 shrink-0 flex-col gap-5 md:flex"
>
  {#each catalogFilterKeys as key (key)}
    <fieldset class="flex min-w-0 flex-col gap-0.5" data-facet={key}>
      <legend
        class="mb-1.5 text-xs font-medium tracking-wider text-secondary uppercase"
      >
        {catalogFilterTitle(key)}
      </legend>
      {#each facets.options[key] as option (option.id)}
        <CatalogFacetOption
          {option}
          variant="list"
          pressed={filters[key] === option.id}
          onclick={() => onselect(key, option.id)}
        />
      {/each}
    </fieldset>
  {/each}
</nav>
