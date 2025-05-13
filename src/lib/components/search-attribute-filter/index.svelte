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

  import Button from '$lib/holocene/button.svelte';
  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    type SearchAttributeOption,
    sortedSearchAttributeOptions,
  } from '$lib/stores/search-attributes';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
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

  import BooleanFilter from './boolean-filter.svelte';
  import CloseFilter from './close-filter-button.svelte';
  import DatetimeFilter from './datetime-filter.svelte';
  import DurationFilter from './duration-filter.svelte';
  import FilterList from './filter-list.svelte';
  import ListFilter from './list-filter.svelte';
  import NumberFilter from './number-filter.svelte';
  import SearchAttributeMenu from './search-attribute-menu.svelte';
  import StatusFilter from './status-filter.svelte';
  import TextFilter from './text-filter.svelte';

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

  const { copy, copied } = copyToClipboard();

  function handleCopy(e: Event) {
    copy(e, searchParamQuery);
  }

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

  function handleClearInput() {
    filters = [];
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

<div class="flex grow flex-col">
  <div class="flex grow flex-col gap-4 sm:flex-row sm:items-center">
    <slot />
    {#if showFilter}
      <div
        class="flex"
        class:filter={!showActions}
        on:keyup={handleKeyUp}
        role="none"
      >
        {#if isStatusFilter($filter)}
          <StatusFilter bind:filters />
        {:else}
          <SearchAttributeMenu {filters} {options} />
        {/if}

        {#if $filter.attribute}
          {#if isTextFilter($filter)}
            <div
              class="flex w-full items-center"
              in:fly={{ x: -100, duration: 150 }}
            >
              <TextFilter />
              <CloseFilter />
            </div>
          {:else if isListFilter($filter)}
            <div class="w-full" in:fly={{ x: -100, duration: 150 }}>
              <ListFilter>
                <CloseFilter />
              </ListFilter>
            </div>
          {:else if isDurationFilter($filter)}
            <div
              class="flex w-full items-center"
              in:fly={{ x: -100, duration: 150 }}
            >
              <DurationFilter />
              <CloseFilter />
            </div>
          {:else if isNumberFilter($filter)}
            <div
              class="flex w-full items-center"
              in:fly={{ x: -100, duration: 150 }}
            >
              <NumberFilter />
              <CloseFilter />
            </div>
          {:else if isDateTimeFilter($filter)}
            <div
              class="flex w-full items-center"
              in:fly={{ x: -100, duration: 150 }}
            >
              <DatetimeFilter />
              <CloseFilter />
            </div>
          {:else if isBooleanFilter($filter)}
            <div
              class="flex w-full items-center"
              in:fly={{ x: -100, duration: 150 }}
            >
              <BooleanFilter />
              <CloseFilter />
            </div>
          {/if}
        {/if}
      </div>
    {/if}

    <div class="flex flex-col items-center justify-end gap-1 sm:flex-row">
      {#if showActions}
        {#if showFilter}
          <Button variant="ghost" on:click={handleClearInput}>
            {translate('common.clear-all')}
          </Button>
        {/if}
        <Tooltip topRight text={translate('workflows.copy-search-input')}>
          <CopyButton
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
            copied={$copied}
            on:click={handleCopy}
          />
        </Tooltip>
      {/if}
    </div>
    <slot name="actions" />
  </div>
  <FilterList bind:filters />
</div>

<style lang="postcss">
  .filter {
    @apply grow;
  }
</style>
