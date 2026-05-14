<script lang="ts" module>
  import { writable, type Writable } from 'svelte/store';

  import { setContext } from 'svelte';

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
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';

  import DropdownFilterList from '$lib/components/workflow/filter-bar/dropdown-filter-list.svelte';
  import SearchAttributeMenu from '$lib/components/workflow/filter-bar/search-attribute-menu.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { sortedSearchAttributeOptions } from '$lib/stores/search-attributes';
  import {
    createFilter,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';

  const filter = writable<SearchAttributeFilter>(createFilter());
  const activeQueryIndex = writable<number>(null);
  const focusedElementId = writable<string>('');
  const chipOpenIndex = writable<number>(null);

  const options = $derived($sortedSearchAttributeOptions);

  afterNavigate(() => {
    chipOpenIndex.set(null);
  });

  setContext<FilterContext>(FILTER_CONTEXT, {
    filter,
    activeQueryIndex,
    handleSubmit,
    focusedElementId,
    resetFilter,
    chipOpenIndex,
  });

  function handleSubmit() {
    if ($activeQueryIndex !== null) {
      $workflowFilters[$activeQueryIndex] = $filter;
      $activeQueryIndex = null;
    } else {
      $workflowFilters = [$filter, ...$workflowFilters];
      chipOpenIndex.set(0);
    }
    filter.set(createFilter());
  }

  function resetFilter() {
    activeQueryIndex.set(null);
    filter.set(createFilter());
  }

  function clearAllFilters() {
    $workflowFilters = [];
    updateQueryParamsFromFilter(page.url, $workflowFilters, true);
    $activeQueryIndex = null;
    $filter = createFilter();
  }
</script>

<div class="flex shrink flex-wrap items-center justify-start gap-2">
  <SearchAttributeMenu {options} />
  <DropdownFilterList />
  {#if $workflowFilters.length > 0}
    <Button
      variant="ghost"
      size="xs"
      on:click={clearAllFilters}
      data-testid="clear-all-filters-button"
    >
      {translate('common.clear-all')}
    </Button>
  {/if}
</div>
