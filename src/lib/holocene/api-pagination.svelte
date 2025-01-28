<script lang="ts">
  import debounce from 'just-debounce';
  import { onMount, type Snippet } from 'svelte';

  import Alert from '$lib/holocene/alert.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import {
    createPaginationStore,
    type PaginationStore,
  } from '$lib/stores/api-pagination';
  import { options } from '$lib/stores/pagination';
  import { isError } from '$lib/utilities/is';

  type T = $$Generic;
  interface BaseProps {
    onError?: (error: Error | unknown) => void | undefined;
    onFetch: () => Promise<PaginatedRequest<T>>;
    onShiftUp?: (event: KeyboardEvent) => void | undefined;
    onShiftDown?: (event: KeyboardEvent) => void | undefined;
    onSpace?: (event: KeyboardEvent) => void | undefined;
    pageSizeOptions?: string[] | number[];
    defaultPageSize?: string | number | undefined;
    total?: string | number;
    pageSizeSelectLabel: string;
    emptyStateMessage: string;
    fallbackErrorMessage: string;
    itemsKeyname?: string;
    previousButtonLabel: string;
    nextButtonLabel: string;
    header: Snippet<[{ visibleItems: T[] }]>;
    error?: Snippet;
    loading?: Snippet;
    empty?: Snippet<[{ query: string }]>;
    action_top_left?: Snippet<[{ visibleItems: T[] }]>;
    action_top_center?: Snippet;
    action_top_right?: Snippet;
    action_bottom_right?: Snippet;
    action_bottom_left?: Snippet;
    children?: Snippet<
      [
        {
          updating: boolean;
          visibleItems: T[];
          activeIndex: number;
          setActiveIndex: (activeIndex: number) => void;
        },
      ]
    >;
  }

  type NonFilterableProps = {
    filterable?: false;
    filterInputPlaceholder: never;
    filterDebounceInMilliseconds?: never;
  };

  type FilterableProps = {
    filterable: true;
    filterInputPlaceholder: string;
    filterDebounceInMilliseconds?: number;
  };

  type Props = BaseProps & (FilterableProps | NonFilterableProps);

  type PaginatedRequest<T> = (
    size: number,
    token: string,
    query?: string,
  ) => Promise<{ items: T[]; nextPageToken: string }>;

  let {
    onError,
    onFetch,
    onShiftUp,
    onShiftDown,
    onSpace,
    pageSizeOptions = options,
    defaultPageSize,
    total = '',
    pageSizeSelectLabel,
    emptyStateMessage,
    fallbackErrorMessage,
    itemsKeyname = 'items',
    previousButtonLabel,
    nextButtonLabel,
    filterable = false,
    filterInputPlaceholder,
    filterDebounceInMilliseconds = 1000,
    header,
    error: error_render,
    loading,
    empty,
    action_top_left,
    action_top_center,
    action_top_right,
    action_bottom_right,
    action_bottom_left,
    children,
    ...rest
  }: Props = $props();

  let query = $state('');

  let store: PaginationStore<T> = createPaginationStore(
    pageSizeOptions,
    defaultPageSize,
  );

  let error: Error = $state();

  function clearError() {
    if (error) error = undefined;
  }

  let isEmpty = $derived($store.visibleItems.length === 0 && !$store.loading);
  let pageSizeChange = $derived(
    !$store.loading && $store.pageSize !== $store.previousPageSize,
  );

  onMount(() => {
    initalDataFetch();
  });

  $effect(() => {
    if (pageSizeChange) {
      store.resetPageSize($store.pageSize);
      initalDataFetch();
    }
  });

  async function initalDataFetch() {
    const fetchData = await onFetch();
    try {
      const response = await fetchData($store.pageSize, '');
      const { nextPageToken } = response;
      const items = response[itemsKeyname] || [];
      store.nextPageWithItems(nextPageToken, items);
    } catch (err) {
      error = err;
      if (onError) onError(error);
    }
  }

  async function fetchIndexData() {
    clearError();
    store.setUpdating();
    if (!$store.hasNextIndexData) {
      try {
        const fetchData = await onFetch();
        const response = await fetchData(
          $store.pageSize,
          $store.indexData[$store.index].nextToken,
        );
        const { nextPageToken } = response;
        const items = response[itemsKeyname] || [];
        store.nextPageWithItems(nextPageToken, items);
      } catch (error) {
        if (isError(error) && onError) {
          onError(error);
        }
      }
    } else {
      store.nextPage();
    }
  }

  async function handleKeydown(event: KeyboardEvent) {
    const shifted = event.shiftKey;
    switch (event.code) {
      case 'ArrowRight':
      case 'KeyL':
        if ($store.hasNext && !$store.updating) {
          fetchIndexData();
        }
        break;
      case 'ArrowLeft':
      case 'KeyH':
        if ($store.hasPrevious && !$store.updating) {
          store.previousPage();
        }
        break;
      case 'ArrowUp':
      case 'KeyK':
        if (shifted && onShiftUp) {
          onShiftUp(event);
          store.reset();
          initalDataFetch();
        } else {
          store.previousRow();
        }
        break;
      case 'ArrowDown':
      case 'KeyJ':
        if (shifted && onShiftDown) {
          onShiftDown(event);
          store.reset();
          initalDataFetch();
        } else {
          store.nextRow();
        }
        break;
      case 'Space':
        if (onSpace) {
          onSpace(event);
        }
        break;
    }
  }

  const handleFilter = async () => {
    clearError();
    store.reset();
    store.setUpdating();
    try {
      const fetchItems = await onFetch();
      const response = await fetchItems($store.pageSize, '', query);
      const { nextPageToken } = response;
      const items = response[itemsKeyname] || [];
      store.nextPageWithItems(nextPageToken, items);
    } catch (err) {
      error = err;
      if (onError) onError(error);
    }
  };

  const debouncedHandleFilter = debounce(
    handleFilter,
    filterDebounceInMilliseconds,
  );
</script>

<svelte:window onkeydown={handleKeydown} />

{#if error && error_render}
  {@render error_render()}
{:else if error}
  <Alert
    intent="error"
    class="mb-10"
    title={error?.message ?? fallbackErrorMessage}
  />
{/if}

{@render header({ visibleItems: $store.visibleItems })}
<div class="relative mb-8 flex flex-col gap-4">
  <div
    class="flex flex-row flex-wrap items-center gap-4 {action_top_left
      ? 'justify-between'
      : 'justify-end'}"
  >
    {@render action_top_left?.({ visibleItems: $store.visibleItems })}
    {#if filterable && filterInputPlaceholder}
      <Input
        icon="search"
        id="api-pagination-search-input"
        class="grow"
        bind:value={query}
        label={filterInputPlaceholder}
        labelHidden
        placeholder={filterInputPlaceholder}
        oninput={debouncedHandleFilter}
        clear={handleFilter}
        clearable
        clearButtonLabel="clear"
      />
    {/if}
    <nav
      class="flex flex-row flex-wrap justify-center gap-4"
      aria-label="{rest['aria-label']} 1"
    >
      {@render action_top_center?.()}
      {#if $store.visibleItems.length}
        {#if pageSizeOptions.length}
          <FilterSelect
            label={pageSizeSelectLabel}
            parameter={$store.key}
            value={String($store.pageSize)}
            options={pageSizeOptions}
          />
        {/if}
        <div class="flex items-center justify-center gap-3">
          <button
            class="caret"
            disabled={!$store.hasPrevious}
            onclick={store.previousPage}
            aria-label={previousButtonLabel}
          >
            <span class="arrow arrow-left"></span>
          </button>
          <div class="flex gap-1">
            <p>
              {$store.indexStart}–{$store.indexEnd}
            </p>
            {#if total}
              <p>
                of {total}
              </p>
            {/if}
          </div>
          <button
            class="caret"
            disabled={!$store.hasNext}
            onclick={fetchIndexData}
            aria-label={nextButtonLabel}
          >
            <span class="arrow arrow-right"></span>
          </button>
        </div>
      {/if}
      {@render action_top_right?.()}
    </nav>
  </div>
  {#if $store.loading}
    {#if loading}
      {@render loading()}
    {:else}
      <SkeletonTable rows={15} />
    {/if}
  {:else if isEmpty}
    {#if empty}
      {@render empty({ query })}
    {:else}
      {emptyStateMessage}
    {/if}
  {:else}
    {@render children?.({
      updating: $store.updating,
      visibleItems: $store.visibleItems,
      activeIndex: $store.activeIndex,
      setActiveIndex: store.setActiveIndex,
    })}
  {/if}
  <nav
    class="flex {action_bottom_left ? 'justify-between' : 'justify-end'}"
    aria-label="{rest['aria-label']} 2"
  >
    {@render action_bottom_left?.()}
    <div class="flex gap-4">
      {#if $store.visibleItems.length}
        {#if pageSizeOptions.length}
          <FilterSelect
            label={pageSizeSelectLabel}
            parameter={$store.key}
            value={String($store.pageSize)}
            options={pageSizeOptions}
          />
        {/if}
        <div class="flex items-center justify-center gap-3">
          <button
            class="caret"
            disabled={!$store.hasPrevious}
            onclick={store.previousPage}
            aria-label={previousButtonLabel}
          >
            <span class="arrow arrow-left"></span>
          </button>
          <div class="flex gap-1">
            <p>
              {$store.indexStart}–{$store.indexEnd}
            </p>
            {#if total}
              <p>
                of {total}
              </p>
            {/if}
          </div>
          <button
            class="caret"
            disabled={!$store.hasNext}
            onclick={fetchIndexData}
            aria-label={nextButtonLabel}
          >
            <span class="arrow arrow-right"></span>
          </button>
        </div>
      {/if}
      {@render action_bottom_right?.()}
    </div>
  </nav>
</div>

<style lang="postcss">
  .arrow {
    @apply absolute left-0 top-0 h-0 w-0;

    border-style: solid;
    border-width: 6px 12px 6px 0;
  }

  .arrow-left {
    border-width: 6px 12px 6px 0;

    @apply border-b-transparent border-l-transparent border-r-primary border-t-transparent;
  }

  .arrow-right {
    border-width: 6px 0 6px 12px;

    @apply border-b-transparent border-l-primary border-r-transparent border-t-transparent;
  }

  .caret {
    @apply relative;

    width: 12px;
    height: 12px;
  }

  .caret:disabled {
    @apply cursor-not-allowed opacity-50;
  }
</style>
