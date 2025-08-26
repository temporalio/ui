<script lang="ts" module>
  import { writable, type Writable } from 'svelte/store';
  import { fly } from 'svelte/transition';

  import { setContext } from 'svelte';

  export const FILTER_CONTEXT = 'filter-context';
  export interface FilterContext {
    filter: Writable<SearchAttributeFilter>;
    activeQueryIndex: Writable<number>;
    handleSubmit: () => void;
    focusedElementId: Writable<string>;
    resetFilter: () => void;
  }
</script>

<script lang="ts">
  import { page } from '$app/state';

  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { sortedSearchAttributeOptions } from '$lib/stores/search-attributes';
  import { refresh } from '$lib/stores/workflows';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import {
    isBooleanFilter,
    isDateTimeFilter,
    isDurationFilter,
    isListFilter,
    isNumberFilter,
    isStatusFilter,
    isTextFilter,
  } from '$lib/utilities/query/search-attribute-filter';
  import {
    combineFilters,
    emptyFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import AttributeList from './attribute-list.svelte';
  import BooleanFilter from './boolean-filter.svelte';
  import DatetimeFilter from './datetime-filter.svelte';
  import DurationFilter from './duration-filter.svelte';
  import ListFilter from './list-filter.svelte';
  import NumberFilter from './number-filter.svelte';
  import StatusFilter from './status-filter.svelte';
  import TextFilter from './text-filter.svelte';

  const options = $derived($sortedSearchAttributeOptions);

  const filter = writable<SearchAttributeFilter>(emptyFilter());
  const activeQueryIndex = writable<number>(null);
  const focusedElementId = writable<string>('');

  const query = $derived(page.url.searchParams.get('query') || '');

  setContext<FilterContext>(FILTER_CONTEXT, {
    filter,
    activeQueryIndex,
    handleSubmit,
    focusedElementId,
    resetFilter,
  });

  function onSearch() {
    const searchQuery = toListWorkflowQueryFromFilters(
      combineFilters($workflowFilters),
    );

    if (searchQuery && searchQuery === query) {
      $refresh = Date.now();
    } else {
      updateQueryParameters({
        url: page.url,
        parameter: 'query',
        value: searchQuery,
        allowEmpty: true,
        clearParameters: [currentPageKey],
      });
    }
  }

  function handleSubmit() {
    if ($activeQueryIndex !== null) {
      $workflowFilters[$activeQueryIndex] = $filter;
      $activeQueryIndex = null;
    } else {
      $workflowFilters = [...$workflowFilters, $filter];
    }
    filter.set(emptyFilter());
    onSearch();
  }

  function resetFilter() {
    filter.set(emptyFilter());
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' && !isTextFilter($filter)) {
      resetFilter();
    }
  }
</script>

<div class="relative flex h-full w-full grow flex-col items-start lg:flex-row">
  <AttributeList {options} activeFilter={$filter} />
  <div
    class="sticky top-0 flex h-full w-full grow flex-col gap-4 py-4 lg:w-2/3"
  >
    <div class="relative" onkeyup={handleKeyUp} role="none">
      {#if isStatusFilter($filter)}
        <StatusFilter bind:filters={$workflowFilters} />
      {:else if $filter.attribute}
        <div
          class="flex flex-col gap-2 px-2"
          in:fly={{ x: -100, duration: 150 }}
        >
          {#if isTextFilter($filter)}
            <TextFilter />
          {:else if isListFilter($filter)}
            <ListFilter />
          {:else if isDurationFilter($filter)}
            <DurationFilter />
          {:else if isNumberFilter($filter)}
            <NumberFilter />
          {:else if isDateTimeFilter($filter)}
            <DatetimeFilter />
          {:else if isBooleanFilter($filter)}
            <BooleanFilter />
          {/if}
        </div>
      {:else}
        <p class="text-center text-secondary">
          Pick a Search Attribute to filter by
        </p>
      {/if}
    </div>
  </div>
</div>
