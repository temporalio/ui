<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { replaceAttributeFilters } from '$lib/utilities/query/column-filter';
  import type { StatusAttribute } from '$lib/utilities/query/quick-filter';
  import { createFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import DropdownFilterChip from './dropdown-filter-chip.svelte';
  import {
    SEARCH_ATTRIBUTE_FILTER_CONTEXT,
    type SearchAttributeFilterContext,
  } from './filter.svelte';
  import StatusFilterChip from './status-filter-chip.svelte';

  interface Props {
    filters: Writable<SearchAttributeFilter[]>;
    statusAttribute?: StatusAttribute;
  }

  let { filters, statusAttribute }: Props = $props();

  const matchesStatusAttribute = (f: SearchAttributeFilter) =>
    statusAttribute ? f.attribute === statusAttribute : false;

  const { filter, activeQueryIndex, chipOpenIndex } =
    getContext<SearchAttributeFilterContext>(SEARCH_ATTRIBUTE_FILTER_CONTEXT);

  let totalFiltersInView = $state(10);

  const firstExecutionStatusIndex = $derived(
    $filters.findIndex((filter) => matchesStatusAttribute(filter)),
  );
  const visibleFilters = $derived($filters.slice(0, totalFiltersInView));
  const statusFilters = $derived(
    statusAttribute
      ? $filters.filter((filter) => filter.attribute === statusAttribute)
      : [],
  );
  const hasMoreFilters = $derived(totalFiltersInView < $filters.length);

  function updateFilter(index: number, updatedFilter: SearchAttributeFilter) {
    const next = [...$filters];
    next[index] = updatedFilter;
    $filters = next;
    updateQueryParamsFromFilter(page.url, $filters);
  }

  function updateStatusFilters(updatedFilters: SearchAttributeFilter[]) {
    if (!statusAttribute) return;
    $filters = replaceAttributeFilters(
      $filters,
      statusAttribute,
      updatedFilters,
    );
    updateQueryParamsFromFilter(page.url, $filters);
  }

  function removeFilter(index: number) {
    const next = [...$filters];
    next.splice(index, 1);
    $filters = next;
    updateQueryParamsFromFilter(page.url, $filters);

    if (index === $filters.length && $filters.length > 0) {
      const previousQuery = $filters[$filters.length - 1];
      if (previousQuery) {
        previousQuery.operator = '';
      }
    }

    if (index === $activeQueryIndex) {
      $activeQueryIndex = null;
      $filter = createFilter();
    } else if ($activeQueryIndex !== null && index < $activeQueryIndex) {
      $activeQueryIndex -= 1;
    }
  }

  function viewMoreFilters() {
    if (hasMoreFilters) {
      totalFiltersInView += 10;
    }
  }
</script>

{#if visibleFilters.length > 0}
  <div class="flex min-w-0 flex-wrap items-center gap-2">
    {#each visibleFilters as filterItem, i (filterItem.id)}
      {#if statusAttribute && matchesStatusAttribute(filterItem) && i === firstExecutionStatusIndex}
        <StatusFilterChip
          attribute={statusAttribute}
          filters={statusFilters}
          index={i}
          openIndex={$chipOpenIndex}
          onUpdate={updateStatusFilters}
        />
      {:else if !matchesStatusAttribute(filterItem) && filterItem.attribute}
        <DropdownFilterChip
          filter={filterItem}
          index={i}
          openIndex={$chipOpenIndex}
          onUpdate={(updatedFilter) => updateFilter(i, updatedFilter)}
          onRemove={() => removeFilter(i)}
        />
      {/if}
    {/each}

    {#if hasMoreFilters}
      <Button variant="secondary" size="xs" onclick={viewMoreFilters}>
        {translate('common.view-more')}
      </Button>
    {/if}
  </div>
{/if}
