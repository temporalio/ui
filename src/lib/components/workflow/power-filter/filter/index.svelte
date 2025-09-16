<script lang="ts" module>
  import { writable, type Writable } from 'svelte/store';
  import { fly } from 'svelte/transition';

  import { setContext, type Snippet, tick } from 'svelte';

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

  import BooleanFilter from '$lib/components/workflow/power-filter/filter/boolean-filter.svelte';
  import CloseFilter from '$lib/components/workflow/power-filter/filter/close-filter-button.svelte';
  import DatetimeFilter from '$lib/components/workflow/power-filter/filter/datetime-filter.svelte';
  import DurationFilter from '$lib/components/workflow/power-filter/filter/duration-filter.svelte';
  import FilterList from '$lib/components/workflow/power-filter/filter/filter-list.svelte';
  import ListFilter from '$lib/components/workflow/power-filter/filter/list-filter.svelte';
  import NumberFilter from '$lib/components/workflow/power-filter/filter/number-filter.svelte';
  import SearchAttributeMenu from '$lib/components/workflow/power-filter/filter/search-attribute-menu.svelte';
  import StatusFilter from '$lib/components/workflow/power-filter/filter/status-filter.svelte';
  import TextFilter from '$lib/components/workflow/power-filter/filter/text-filter.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { searchInputViewOpen } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    type SearchAttributeOption,
    sortedSearchAttributeOptions,
  } from '$lib/stores/search-attributes';
  import { refresh } from '$lib/stores/workflows';
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

  type Props = {
    filters?: SearchAttributeFilter[];
    searchAttributeOptions?: SearchAttributeOption[] | null;
    showFilter?: boolean;
    children?: Snippet;
    actions?: Snippet;
  };

  let {
    filters = $workflowFilters,
    searchAttributeOptions = null,
    showFilter = !$searchInputViewOpen,
    children,
    actions,
  }: Props = $props();

  const filter = writable<SearchAttributeFilter>(emptyFilter());
  const activeQueryIndex = writable<number>(null);
  const focusedElementId = writable<string>('');

  const searchParamQuery = $derived(page.url.searchParams.get('query'));
  const showActions = $derived(filters.length && !$filter.attribute);
  const options = $derived(
    searchAttributeOptions ?? $sortedSearchAttributeOptions,
  );

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

  function resetFilter() {
    activeQueryIndex.set(null);
    filter.set(emptyFilter());
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' && !isTextFilter($filter)) {
      resetFilter();
    }
  }

  $effect(() => {
    $activeQueryIndex;
    updateFocusedElementId();
  });

  $effect(() => {
    !showFilter && resetFilter();
  });

  $effect(() => {
    tick().then(() => {
      updateFocus();
    });
  });
</script>

<div class="flex grow items-center gap-2">
  {@render children?.()}
  {#if showFilter}
    <div
      class="flex"
      class:grow={!showActions}
      onkeyup={handleKeyUp}
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
  <FilterList filters={$workflowFilters} />

  <div class="flex items-center justify-end gap-1">
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
  {@render actions?.()}
</div>
