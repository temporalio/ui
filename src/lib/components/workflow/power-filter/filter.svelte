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

  import DropdownFilterList from '$lib/components/workflow/power-filter/dropdown-filter-list.svelte';
  import SearchAttributeMenu from '$lib/components/workflow/power-filter/search-attribute-menu.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { sortedSearchAttributeOptions } from '$lib/stores/search-attributes';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';

  const filter = writable<SearchAttributeFilter>(emptyFilter());
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
      const newIndex = $workflowFilters.length;
      $workflowFilters = [...$workflowFilters, $filter];
      chipOpenIndex.set(newIndex);
    }
    filter.set(emptyFilter());
  }

  function resetFilter() {
    activeQueryIndex.set(null);
    filter.set(emptyFilter());
  }
</script>

<div class="flex shrink items-center justify-start gap-2">
  <DropdownFilterList />
  <SearchAttributeMenu {options} />
</div>
