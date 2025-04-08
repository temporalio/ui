<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import debounce from 'just-debounce';
  import { onMount } from 'svelte';

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
  };

  type NonFilterableProps = {
    filterable?: false;
  };

  type FilterableProps = {
    filterable: true;
    filterInputPlaceholder: string;
    filterDebounceInMilliseconds?: number;
  };

  type $$Props = BaseProps & (FilterableProps | NonFilterableProps);

  type PaginatedRequest<T> = (
    size: number,
    token: string,
    query?: string,
  ) => Promise<{ items: T[]; nextPageToken: string }>;

  export let onError: (error: Error) => void | undefined = undefined;
  export let onFetch: () => Promise<PaginatedRequest<T>>;
  export let onShiftUp: (event: KeyboardEvent) => void | undefined = undefined;
  export let onShiftDown: (event: KeyboardEvent) => void | undefined =
    undefined;
  export let onSpace: (event: KeyboardEvent) => void | undefined = undefined;

  export let pageSizeOptions: string[] | number[] = options;
  export let defaultPageSize: string | number | undefined = undefined;
  export let total: string | number = '';
  export let pageSizeSelectLabel: string;
  export let emptyStateMessage: string;
  export let fallbackErrorMessage: string;
  export let itemsKeyname = 'items';
  export let previousButtonLabel: string;
  export let nextButtonLabel: string;
  export let filterable = false;
  export let filterInputPlaceholder: string = undefined;
  export let filterDebounceInMilliseconds = 1000;

  let query = '';

  let store: PaginationStore<T> = createPaginationStore(
    pageSizeOptions,
    defaultPageSize,
  );

  let error: Error;

  function clearError() {
    if (error) error = undefined;
  }

  $: isEmpty = $store.visibleItems.length === 0 && !$store.loading;
  $: pageSizeChange =
    !$store.loading && $store.pageSize !== $store.previousPageSize;

  onMount(() => {
    initalDataFetch();
  });

  $: {
    if (pageSizeChange) {
      store.resetPageSize($store.pageSize);
      initalDataFetch();
    }
  }

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

<svelte:window on:keydown={handleKeydown} />

{#if error && $$slots.error}
  <slot name="error" />
{:else if error}
  <Alert
    intent="error"
    class="mb-10"
    title={error?.message ?? fallbackErrorMessage}
  />
{/if}

<slot name="header" visibleItems={$store.visibleItems} />
<div class="relative mb-8 flex flex-col gap-4">
  <div
    class="flex flex-row flex-wrap items-center gap-4 {$$slots[
      'action-top-left'
    ]
      ? 'justify-between'
      : 'justify-end'}"
  >
    <slot name="action-top-left" visibleItems={$store.visibleItems} />
    {#if filterable && filterInputPlaceholder}
      <Input
        icon="search"
        id="api-pagination-search-input"
        class="grow"
        bind:value={query}
        label={filterInputPlaceholder}
        labelHidden
        placeholder={filterInputPlaceholder}
        on:input={debouncedHandleFilter}
        on:clear={handleFilter}
        clearable
      />
    {/if}
    <nav
      class="flex flex-row flex-wrap justify-center gap-4"
      aria-label="{$$restProps['aria-label']} 1"
    >
      <slot name="action-top-center" />
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
            on:click={store.previousPage}
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
            on:click={fetchIndexData}
            aria-label={nextButtonLabel}
          >
            <span class="arrow arrow-right"></span>
          </button>
        </div>
      {/if}
      <slot name="action-top-right" />
    </nav>
  </div>
  {#if $store.loading}
    {#if $$slots.loading}
      <slot name="loading" />
    {:else}
      <SkeletonTable rows={15} />
    {/if}
  {:else if isEmpty}
    <slot name="empty" {query}>{emptyStateMessage}</slot>
  {:else}
    <slot
      updating={$store.updating}
      visibleItems={$store.visibleItems}
      activeIndex={$store.activeIndex}
      setActiveIndex={store.setActiveIndex}
    />
  {/if}
  <nav
    class="flex {$$slots['action-bottom-left']
      ? 'justify-between'
      : 'justify-end'}"
    aria-label="{$$restProps['aria-label']} 2"
  >
    <slot name="action-bottom-left" />
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
            on:click={store.previousPage}
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
            on:click={fetchIndexData}
            aria-label={nextButtonLabel}
          >
            <span class="arrow arrow-right"></span>
          </button>
        </div>
      {/if}
      <slot name="action-bottom-right" />
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
