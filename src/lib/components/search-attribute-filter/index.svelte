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

  import Button from '$lib/holocene/button.svelte';
  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { savedQueries } from '$lib/stores/saved-queries';
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
  import DeleteViewModal from './delete-view-modal.svelte';
  import DurationFilter from './duration-filter.svelte';
  import EditViewModal from './edit-view-modal.svelte';
  import FilterList from './filter-list.svelte';
  import ListFilter from './list-filter.svelte';
  import NumberFilter from './number-filter.svelte';
  import SaveViewModal from './save-view-modal.svelte';
  import SearchAttributeMenu from './search-attribute-menu.svelte';
  import StatusFilter from './status-filter.svelte';
  import TextFilter from './text-filter.svelte';

  type Props = {
    filters: SearchAttributeFilter[];
    searchAttributeOptions?: SearchAttributeOption[] | null;
    showFilter?: boolean;
    refresh: () => void;
    children?: Snippet;
    actions?: Snippet;
  };

  let {
    filters,
    searchAttributeOptions = null,
    showFilter = true,
    refresh,
    children,
    actions,
  }: Props = $props();

  const filter = writable<SearchAttributeFilter>(emptyFilter());
  const activeQueryIndex = writable<number>(null);
  const focusedElementId = writable<string>('');

  let saveViewModalOpen = $state(false);
  let editViewModalOpen = $state(false);
  let deleteViewModalOpen = $state(false);

  const namespace = $derived(page.params.namespace);
  const searchParamQuery = $derived(page.url.searchParams.get('query'));
  const showActions = $derived(filters.length && !$filter.attribute);
  const options = $derived(
    searchAttributeOptions ?? $sortedSearchAttributeOptions,
  );

  const savedQueryView = $derived(
    $savedQueries[namespace]?.find((q) => q.query === searchParamQuery),
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
      refresh();
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

<div class="flex grow flex-col">
  <div class="flex grow gap-4">
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

    <div class="flex items-center justify-end gap-1">
      {#if showActions}
        <Button variant="secondary" on:click={() => (saveViewModalOpen = true)}>
          {translate('common.save')}
        </Button>
        {#if savedQueryView}
          <Button
            variant="destructive"
            on:click={() => (deleteViewModalOpen = true)}
          >
            {translate('common.delete')}
          </Button>
        {/if}

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
  <FilterList bind:filters />
</div>
<SaveViewModal bind:open={saveViewModalOpen} />
<EditViewModal view={savedQueryView} bind:open={editViewModalOpen} />
<DeleteViewModal view={savedQueryView} bind:open={deleteViewModalOpen} />
