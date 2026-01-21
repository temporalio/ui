<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import DropdownFilterChip from '$lib/components/workflow/filter-bar/dropdown-filter-chip.svelte';
  import StatusDropdownFilterChip from '$lib/components/workflow/filter-bar/status-dropdown-filter-chip.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { activityFilters } from '$lib/stores/filters';
  import { isStatusFilter } from '$lib/utilities/query/search-attribute-filter';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import {
    ACTIVITY_FILTER_CONTEXT,
    type ActivityFilterContext,
  } from './filter.svelte';

  const { filter, activeQueryIndex, chipOpenIndex } =
    getContext<ActivityFilterContext>(ACTIVITY_FILTER_CONTEXT);

  let totalFiltersInView = $state(10);

  const firstExecutionStatusIndex = $derived(
    $activityFilters.findIndex((filter) => isStatusFilter(filter)),
  );
  const visibleFilters = $derived(
    $activityFilters.slice(0, totalFiltersInView),
  );
  const executionStatusFilters = $derived(
    $activityFilters.filter((filter) => filter.attribute === 'ExecutionStatus'),
  );
  const nonStatusFilters = $derived(
    $activityFilters.filter((filter) => !isStatusFilter(filter)),
  );
  const hasMoreFilters = $derived(totalFiltersInView < $activityFilters.length);

  function updateFilter(index: number, updatedFilter: SearchAttributeFilter) {
    const next = [...$activityFilters];
    next[index] = updatedFilter;
    $activityFilters = next;
    updateQueryParamsFromFilter(page.url, $activityFilters);
  }

  function updateStatusFilters(
    index: number,
    updatedFilters: SearchAttributeFilter[],
  ) {
    if (updatedFilters.length === 0) {
      $activityFilters = nonStatusFilters;
      updateQueryParamsFromFilter(page.url, $activityFilters);
    } else {
      const next = [...$activityFilters];
      next.splice(index, executionStatusFilters.length, ...updatedFilters);
      $activityFilters = next;
      updateQueryParamsFromFilter(page.url, $activityFilters);
    }
  }

  function removeFilter(index: number) {
    const next = [...$activityFilters];
    next.splice(index, 1);
    $activityFilters = next;
    updateQueryParamsFromFilter(page.url, $activityFilters);

    if (index === $activityFilters.length && $activityFilters.length > 0) {
      const previousQuery = $activityFilters[$activityFilters.length - 1];
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
    {#each visibleFilters as activityFilter, i (activityFilter.attribute + '-' + i)}
      {#if isStatusFilter(activityFilter) && i === firstExecutionStatusIndex}
        <StatusDropdownFilterChip
          filters={executionStatusFilters}
          index={i}
          openIndex={$chipOpenIndex}
          onUpdate={(statusFilters) => updateStatusFilters(i, statusFilters)}
        />
      {:else if !isStatusFilter(activityFilter) && activityFilter.attribute}
        <DropdownFilterChip
          filter={activityFilter}
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
