<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import DropdownFilterChip from './dropdown-filter-chip.svelte';
  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, activeQueryIndex, chipOpenIndex } =
    getContext<FilterContext>(FILTER_CONTEXT);

  let totalFiltersInView = $state(10);

  const visibleFilters = $derived(
    $workflowFilters.slice(0, totalFiltersInView),
  );
  const hasMoreFilters = $derived(totalFiltersInView < $workflowFilters.length);

  function updateFilter(index: number, updatedFilter: SearchAttributeFilter) {
    const next = [...$workflowFilters];
    next[index] = updatedFilter;
    $workflowFilters = next;
    updateQueryParamsFromFilter(page.url, $workflowFilters, true);
  }

  function removeFilter(index: number) {
    const next = [...$workflowFilters];
    next.splice(index, 1);
    $workflowFilters = next;
    updateQueryParamsFromFilter(page.url, $workflowFilters, true);

    // Handle operator cleanup
    if (index === $workflowFilters.length && $workflowFilters.length > 0) {
      const previousQuery = $workflowFilters[$workflowFilters.length - 1];
      if (previousQuery) {
        previousQuery.operator = '';
      }
    }

    // Reset active filter if it was the one being removed
    if (index === $activeQueryIndex) {
      $activeQueryIndex = null;
      $filter = emptyFilter();
    } else if (index < $activeQueryIndex) {
      $activeQueryIndex -= 1;
    }
  }

  function viewMoreFilters() {
    if (hasMoreFilters) {
      totalFiltersInView += 10;
    }
  }
</script>

<div class="flex flex-wrap items-center gap-2">
  {#each visibleFilters as workflowFilter, i (workflowFilter.attribute + '-' + i)}
    {#if workflowFilter.attribute}
      <DropdownFilterChip
        filter={workflowFilter}
        index={i}
        openIndex={$chipOpenIndex}
        onUpdate={(updatedFilter) => updateFilter(i, updatedFilter)}
        onRemove={() => removeFilter(i)}
      />
    {/if}
  {/each}

  {#if hasMoreFilters}
    <Button variant="secondary" size="xs" on:click={viewMoreFilters}>
      {translate('common.view-more')}
    </Button>
  {/if}
</div>
