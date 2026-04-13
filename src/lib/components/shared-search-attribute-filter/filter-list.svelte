<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import DropdownFilterChip from '$lib/components/workflow/filter-bar/dropdown-filter-chip.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { createFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import type { StatusAttribute } from './types.ts';

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

  const isStatusFilter = (f: SearchAttributeFilter) =>
    statusAttribute ? f.attribute === statusAttribute : false;

  const { filter, activeQueryIndex, chipOpenIndex } =
    getContext<SearchAttributeFilterContext>(SEARCH_ATTRIBUTE_FILTER_CONTEXT);

  let totalFiltersInView = $state(10);

  const firstExecutionStatusIndex = $derived(
    $filters.findIndex((filter) => isStatusFilter(filter)),
  );
  const visibleFilters = $derived($filters.slice(0, totalFiltersInView));
  const statusFilters = $derived(
    statusAttribute
      ? $filters.filter((filter) => filter.attribute === statusAttribute)
      : [],
  );
  const nonStatusFilters = $derived(
    $filters.filter((filter) => !isStatusFilter(filter)),
  );
  const hasMoreFilters = $derived(totalFiltersInView < $filters.length);

  function updateFilter(index: number, updatedFilter: SearchAttributeFilter) {
    const next = [...$filters];
    next[index] = updatedFilter;
    $filters = next;
    updateQueryParamsFromFilter(page.url, $filters);
  }

  function updateStatusFilters(
    index: number,
    updatedFilters: SearchAttributeFilter[],
  ) {
    if (updatedFilters.length === 0) {
      $filters = nonStatusFilters;
      updateQueryParamsFromFilter(page.url, $filters);
    } else {
      const next = [...$filters];
      next.splice(index, statusFilters.length, ...updatedFilters);
      $filters = next;
      updateQueryParamsFromFilter(page.url, $filters);
    }
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
  <div class="flex flex-wrap items-center gap-2">
    {#each visibleFilters as filterItem, i (filterItem.id)}
      {#if statusAttribute && isStatusFilter(filterItem) && i === firstExecutionStatusIndex}
        <StatusFilterChip
          attribute={statusAttribute}
          filters={statusFilters}
          index={i}
          openIndex={$chipOpenIndex}
          onUpdate={(updatedStatusFilters) =>
            updateStatusFilters(i, updatedStatusFilters)}
        />
      {:else if !isStatusFilter(filterItem) && filterItem.attribute}
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
      <Button variant="secondary" size="xs" on:click={viewMoreFilters}>
        {translate('common.view-more')}
      </Button>
    {/if}
  </div>
{/if}
