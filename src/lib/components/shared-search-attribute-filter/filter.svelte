<script lang="ts" module>
  import type { Writable } from 'svelte/store';

  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';

  export const SEARCH_ATTRIBUTE_FILTER_CONTEXT =
    'search-attribute-filter-context';

  export interface SearchAttributeFilterContext {
    filter: Writable<SearchAttributeFilter>;
    activeQueryIndex: Writable<number | null>;
    handleSubmit: () => void;
    focusedElementId: Writable<string>;
    resetFilter: () => void;
    chipOpenIndex: Writable<number | null>;
    id: string;
    includeNullConditions: boolean;
  }
</script>

<script lang="ts">
  import { writable } from 'svelte/store';

  import { setContext } from 'svelte';

  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeOption } from '$lib/stores/search-attributes';
  import {
    createFilter,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';

  import type { StatusAttribute } from './types.ts';

  import DropdownFilterList from './filter-list.svelte';
  import SearchAttributeMenu from './search-attribute-menu.svelte';

  interface Props {
    filters: Writable<SearchAttributeFilter[]>;
    options: SearchAttributeOption[];
    id: string;
    statusAttribute?: StatusAttribute;
    includeNullConditions?: boolean;
    appearance?: 'boxed' | 'plain';
  }

  let {
    filters,
    options,
    id,
    statusAttribute,
    includeNullConditions = true,
    appearance = 'boxed',
  }: Props = $props();

  const filter = writable<SearchAttributeFilter>(createFilter());
  const activeQueryIndex = writable<number | null>(null);
  const focusedElementId = writable<string>('');
  const chipOpenIndex = writable<number | null>(null);

  afterNavigate(() => {
    chipOpenIndex.set(null);
  });

  setContext<SearchAttributeFilterContext>(SEARCH_ATTRIBUTE_FILTER_CONTEXT, {
    filter,
    activeQueryIndex,
    handleSubmit,
    focusedElementId,
    resetFilter,
    chipOpenIndex,
    id,
    includeNullConditions,
  });

  function handleSubmit() {
    if ($activeQueryIndex !== null) {
      $filters[$activeQueryIndex] = $filter;
      $activeQueryIndex = null;
    } else {
      const newIndex = $filters.length;
      $filters = [...$filters, $filter];
      chipOpenIndex.set(newIndex);
    }
    filter.set(createFilter());
  }

  function resetFilter() {
    activeQueryIndex.set(null);
    filter.set(createFilter());
  }

  function clearAllFilters() {
    $filters = [];
    updateQueryParamsFromFilter(page.url, $filters, true);
    $activeQueryIndex = null;
    $filter = createFilter();
  }
</script>

<div class="flex shrink flex-wrap items-center justify-start gap-2">
  <SearchAttributeMenu {options} {filters} {statusAttribute} {appearance} />
  <DropdownFilterList {filters} {statusAttribute} />
  {#if $filters.length > 0}
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
