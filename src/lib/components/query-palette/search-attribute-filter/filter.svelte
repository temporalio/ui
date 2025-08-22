<script lang="ts" context="module">
  import { writable, type Writable } from 'svelte/store';
  import { fly } from 'svelte/transition';

  import { afterUpdate, setContext, tick } from 'svelte';

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
  import { page } from '$app/stores';

  import BooleanFilter from '$lib/components/search-attribute-filter/boolean-filter.svelte';
  import CloseFilter from '$lib/components/search-attribute-filter/close-filter-button.svelte';
  import DatetimeFilter from '$lib/components/search-attribute-filter/datetime-filter.svelte';
  import DurationFilter from '$lib/components/search-attribute-filter/duration-filter.svelte';
  import ListFilter from '$lib/components/search-attribute-filter/list-filter.svelte';
  import NumberFilter from '$lib/components/search-attribute-filter/number-filter.svelte';
  import StatusFilter from '$lib/components/search-attribute-filter/status-filter.svelte';
  import TextFilter from '$lib/components/search-attribute-filter/text-filter.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    type SearchAttributeOption,
    sortedSearchAttributeOptions,
  } from '$lib/stores/search-attributes';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import {
    getFocusedElementId,
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

  export let filters: SearchAttributeFilter[];
  export let searchAttributeOptions: SearchAttributeOption[] = null;
  export let showFilter = true;
  export let refresh: () => void;

  $: options = searchAttributeOptions ?? $sortedSearchAttributeOptions;

  const filter = writable<SearchAttributeFilter>(emptyFilter());
  const activeQueryIndex = writable<number>(null);
  const focusedElementId = writable<string>('');

  $: searchParamQuery = $page.url.searchParams.get('query');
  $: showActions = filters.length && !$filter.attribute;

  setContext<FilterContext>(FILTER_CONTEXT, {
    filter,
    activeQueryIndex,
    handleSubmit,
    focusedElementId,
    resetFilter,
  });

  function onSearch() {
    const searchQuery = toListWorkflowQueryFromFilters(combineFilters(filters));

    if (searchQuery && searchQuery === searchParamQuery) {
      refresh();
    } else {
      updateQueryParameters({
        url: $page.url,
        parameter: 'query',
        value: searchQuery,
        allowEmpty: true,
        clearParameters: [currentPageKey],
      });
    }
  }

  function handleSubmit() {
    if ($activeQueryIndex !== null) {
      filters[$activeQueryIndex] = $filter;
      $activeQueryIndex = null;
    } else {
      filters = [...filters, $filter];
    }
    filter.set(emptyFilter());
    onSearch();
  }

  function updateFocusedElementId() {
    if ($activeQueryIndex !== null) {
      $focusedElementId = getFocusedElementId($filter);
    }
  }

  $: $activeQueryIndex, updateFocusedElementId();
  $: !showFilter && resetFilter();

  function updateFocus() {
    if ($focusedElementId) {
      const element = document.getElementById($focusedElementId);
      if (element) {
        element.focus();
        if (element instanceof HTMLButtonElement) {
          element.click();
        }
      }
    }
  }

  afterUpdate(() => {
    tick().then(() => {
      updateFocus();
    });
  });

  function resetFilter() {
    activeQueryIndex.set(null);
    filter.set(emptyFilter());
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' && !isTextFilter($filter)) {
      resetFilter();
    }
  }
</script>

<div class="relative flex h-full w-full items-start">
  <AttributeList {options} bind:filters />
  <div class="sticky top-0 flex h-full w-1/2 grow flex-col gap-4 py-4">
    {#if showFilter}
      <div
        class="relative"
        class:grow={!showActions}
        on:keyup={handleKeyUp}
        role="none"
      >
        {#if isStatusFilter($filter)}
          <StatusFilter bind:filters />
        {/if}

        {#if $filter.attribute}
          <div
            class="flex w-full items-center"
            in:fly={{ x: -100, duration: 150 }}
          >
            {#if isTextFilter($filter)}
              <TextFilter />
              <CloseFilter />
            {:else if isListFilter($filter)}
              <ListFilter>
                <CloseFilter />
              </ListFilter>
            {:else if isDurationFilter($filter)}
              <DurationFilter />
              <CloseFilter />
            {:else if isNumberFilter($filter)}
              <NumberFilter />
              <CloseFilter />
            {:else if isDateTimeFilter($filter)}
              <DatetimeFilter />
              <CloseFilter />
            {:else if isBooleanFilter($filter)}
              <BooleanFilter />
              <CloseFilter />
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
