<!--
@component ApiPagination
@deprecated This component is deprecated. Use `src/lib/anthropocene/table/paginated-table/api-paginated.svelte` instead.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import debounce from 'just-debounce';
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';

  import Alert from '$lib/anthropocene/alert.svelte';
  import Input from '$lib/anthropocene/input/input.svelte';
  import FilterSelect from '$lib/anthropocene/select/filter-select.svelte';
  import SkeletonTable from '$lib/anthropocene/skeleton/table.svelte';
  import {
    createPaginationStore,
    type PaginationStore,
  } from '$lib/stores/api-pagination';
  import { options } from '$lib/stores/pagination';
  import { isError } from '$lib/utilities/is';

  type T = $$Generic;
  type BaseProps = HTMLAttributes<HTMLDivElement> & {
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
    filterable?: boolean;
    filterInputPlaceholder?: string;
    filterDebounceInMilliseconds?: number;
    // Render prop snippets
    error?: Snippet<[]>;
    header?: Snippet<[{ visibleItems: T[] }]>;
    'action-top-left'?: Snippet<[{ visibleItems: T[] }]>;
    'action-top-center'?: Snippet<[]>;
    'action-top-right'?: Snippet<[]>;
    loading?: Snippet<[]>;
    empty?: Snippet<[{ query: string }]>;
    children?: Snippet<
      [
        {
          updating: boolean;
          visibleItems: T[];
          activeIndex: number;
          setActiveIndex: (index: number) => void;
        },
      ]
    >;
    'action-bottom-left'?: Snippet<[]>;
    'action-bottom-right'?: Snippet<[]>;
  };

  type NonFilterableProps = {
    filterable?: false;
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
    onError = undefined,
    onFetch,
    onShiftUp = undefined,
    onShiftDown = undefined,
    onSpace = undefined,
    pageSizeOptions = options,
    defaultPageSize = undefined,
    total = '',
    pageSizeSelectLabel,
    emptyStateMessage,
    fallbackErrorMessage,
    itemsKeyname = 'items',
    previousButtonLabel,
    nextButtonLabel,
    filterable = false,
    filterInputPlaceholder = undefined,
    filterDebounceInMilliseconds = 1000,
    // Render prop snippets
    error: errorSnippet,
    header,
    'action-top-left': actionTopLeft,
    'action-top-center': actionTopCenter,
    'action-top-right': actionTopRight,
    loading: loadingSnippet,
    empty: emptySnippet,
    children,
    'action-bottom-left': actionBottomLeft,
    'action-bottom-right': actionBottomRight,
    ...restProps
  }: Props = $props();

  let query = $state('');

  let store: PaginationStore<T> = createPaginationStore(
    pageSizeOptions,
    defaultPageSize,
  );

  let error = $state<Error | undefined>();

  function clearError() {
    if (error) error = undefined;
  }

  const isEmpty = $derived($store.visibleItems.length === 0 && !$store.loading);
  const pageSizeChange = $derived(
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

{#if error && errorSnippet}
  {@render errorSnippet()}
{:else if error}
  <Alert
    intent="error"
    class="mb-10"
    title={error?.message ?? fallbackErrorMessage}
  />
{/if}

{#if header}{@render header({ visibleItems: $store.visibleItems })}{/if}
<div class="relative mb-8 flex flex-col gap-4">
  <div
    class="flex flex-row flex-wrap items-center gap-4 {actionTopLeft
      ? 'justify-between'
      : 'justify-end'}"
  >
    {#if actionTopLeft}{@render actionTopLeft({
        visibleItems: $store.visibleItems,
      })}{/if}
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
        onclear={handleFilter}
        clearable
      />
    {/if}
    <nav
      class="flex flex-row flex-wrap justify-center gap-4"
      aria-label="{restProps['aria-label']} 1"
    >
      {#if actionTopCenter}{@render actionTopCenter()}{/if}
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
      {#if actionTopRight}{@render actionTopRight()}{/if}
    </nav>
  </div>
  {#if $store.loading}
    {#if loadingSnippet}
      {@render loadingSnippet()}
    {:else}
      <SkeletonTable rows={15} />
    {/if}
  {:else if isEmpty}
    {#if emptySnippet}
      {@render emptySnippet({ query })}
    {:else}
      {emptyStateMessage}
    {/if}
  {:else if children}
    {@render children({
      updating: $store.updating,
      visibleItems: $store.visibleItems,
      activeIndex: $store.activeIndex,
      setActiveIndex: store.setActiveIndex,
    })}
  {/if}
  <nav
    class="flex {actionBottomLeft ? 'justify-between' : 'justify-end'}"
    aria-label="{restProps['aria-label']} 2"
  >
    {#if actionBottomLeft}{@render actionBottomLeft()}{/if}
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
      {#if actionBottomRight}{@render actionBottomRight()}{/if}
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
