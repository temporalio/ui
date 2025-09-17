<script lang="ts" module>
  import { writable, type Writable } from 'svelte/store';

  import { setContext, type Snippet } from 'svelte';

  export const FILTER_CONTEXT = 'filter-context';

  export interface FilterContext {
    filter: Writable<SearchAttributeFilter>;
    activeQueryIndex: Writable<number>;
    handleSubmit: () => void;
    focusedElementId: Writable<string>;
    resetFilter: () => void;
    chipOpenIndex: Writable<number>;
  }
</script>

<script lang="ts">
  import { page } from '$app/state';

  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    type SearchAttributeOption,
    sortedSearchAttributeOptions,
  } from '$lib/stores/search-attributes';
  import { refresh } from '$lib/stores/workflows';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import DropdownFilterList from './dropdown-filter-list.svelte';
  import SearchAttributeMenu from './search-attribute-menu.svelte';

  type Props = {
    filters?: SearchAttributeFilter[];
    searchAttributeOptions?: SearchAttributeOption[] | null;
    children?: Snippet;
    actions?: Snippet;
  };

  let {
    filters = $workflowFilters,
    searchAttributeOptions = null,
    actions,
  }: Props = $props();

  const filter = writable<SearchAttributeFilter>(emptyFilter());
  const activeQueryIndex = writable<number>(null);
  const focusedElementId = writable<string>('');
  const chipOpenIndex = writable<number>(null);

  const searchParamQuery = $derived(page.url.searchParams.get('query'));
  const options = $derived(
    searchAttributeOptions ?? $sortedSearchAttributeOptions,
  );

  setContext<FilterContext>(FILTER_CONTEXT, {
    filter,
    activeQueryIndex,
    handleSubmit,
    focusedElementId,
    resetFilter,
    chipOpenIndex,
  });

  function onSearch() {
    const searchQuery = toListWorkflowQueryFromFilters(combineFilters(filters));

    if (searchQuery && searchQuery === searchParamQuery) {
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
      filters[$activeQueryIndex] = $filter;
      $activeQueryIndex = null;
    } else {
      const newIndex = filters.length;
      filters = [...filters, $filter];
      chipOpenIndex.set(newIndex);
    }
    filter.set(emptyFilter());
    onSearch();
  }

  function resetFilter() {
    activeQueryIndex.set(null);
    filter.set(emptyFilter());
  }
</script>

<div class="flex shrink items-center justify-start gap-2">
  <DropdownFilterList />
  <SearchAttributeMenu {options} />

  <div class="flex items-center justify-end gap-1"></div>
  {@render actions?.()}
</div>
