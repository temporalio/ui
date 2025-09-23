<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { isStatusFilter } from '$lib/utilities/query/search-attribute-filter';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import DropdownFilterChip from './dropdown-filter-chip.svelte';
  import { FILTER_CONTEXT, type FilterContext } from './filter.svelte';
  import StatusDropdownFilterChip from './status-dropdown-filter-chip.svelte';

  const { filter, activeQueryIndex, chipOpenIndex } =
    getContext<FilterContext>(FILTER_CONTEXT);

  let totalFiltersInView = $state(10);

  const firstExecutionStatusIndex = $derived(
    $workflowFilters.findIndex((filter) => isStatusFilter(filter)),
  );
  const visibleFilters = $derived(
    $workflowFilters.slice(0, totalFiltersInView),
  );
  const executionStatusFilters = $derived(
    $workflowFilters.filter((filter) => filter.attribute === 'ExecutionStatus'),
  );
  const nonStatusFilters = $derived(
    $workflowFilters.filter((filter) => !isStatusFilter(filter)),
  );
  const hasMoreFilters = $derived(totalFiltersInView < $workflowFilters.length);

  function updateFilter(index: number, updatedFilter: SearchAttributeFilter) {
    const next = [...$workflowFilters];
    next[index] = updatedFilter;
    $workflowFilters = next;
    updateQueryParamsFromFilter(page.url, $workflowFilters);
  }

  function updateStatusFilters(
    index: number,
    updatedFilters: SearchAttributeFilter[],
  ) {
    if (updatedFilters.length === 0) {
      $workflowFilters = nonStatusFilters;
      updateQueryParamsFromFilter(page.url, $workflowFilters);
    } else {
      const next = [...$workflowFilters];
      next.splice(index, executionStatusFilters.length, ...updatedFilters);
      $workflowFilters = next;
      updateQueryParamsFromFilter(page.url, $workflowFilters);
    }
  }

  function removeFilter(index: number) {
    const next = [...$workflowFilters];
    next.splice(index, 1);
    $workflowFilters = next;
    updateQueryParamsFromFilter(page.url, $workflowFilters);

    if (index === $workflowFilters.length && $workflowFilters.length > 0) {
      const previousQuery = $workflowFilters[$workflowFilters.length - 1];
      if (previousQuery) {
        previousQuery.operator = '';
      }
    }

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

{#if visibleFilters.length > 0}
  <div class="flex flex-wrap items-center gap-2">
    {#each visibleFilters as workflowFilter, i (workflowFilter.attribute + '-' + i)}
      {#if isStatusFilter(workflowFilter) && i === firstExecutionStatusIndex}
        <StatusDropdownFilterChip
          filters={executionStatusFilters}
          index={i}
          openIndex={$chipOpenIndex}
          onUpdate={(statusFilters) => updateStatusFilters(i, statusFilters)}
        />
      {:else if !isStatusFilter(workflowFilter) && workflowFilter.attribute}
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
{/if}
