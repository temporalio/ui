<script lang="ts" module>
  export type PaginatedRequest<T> = (
    size: number,
    token: string,
  ) => Promise<{ items: T[]; nextPageToken: string }>;
</script>

<script lang="ts" generics="T">
  import type { HTMLAttributes } from 'svelte/elements';
  import { writable } from 'svelte/store';

  import { debounce } from 'es-toolkit';
  import type { Snippet } from 'svelte';
  import { getContext, onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Alert from '$lib/holocene/alert.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import { IconArrowLeft, IconArrowRight } from '$lib/io/icon';
  import {
    createPaginationStore,
    type PaginationStore,
  } from '$lib/stores/api-pagination';
  import { options } from '$lib/stores/pagination';
  import { isError } from '$lib/utilities/is';

  import PaginatedTable from './index.svelte';
  import {
    TABLE_MAXIMIZABLE_CONTEXT,
    type TableMaximizableContext,
  } from './maximizable-view.svelte';
  import MaximizeToggle from './maximize-toggle.svelte';

  type KeyboardHandler = ((event: KeyboardEvent) => void) | undefined;

  type Props = HTMLAttributes<HTMLDivElement> & {
    id?: string | null;
    maxHeight?: string;
    onError?: ((error: Error | unknown) => void) | undefined;
    onFetch: () => Promise<PaginatedRequest<T>>;
    onItemsChange?: (items: T[]) => void;
    onLoadingChange?: ((loading: boolean) => void) | undefined;
    onShiftUp?: KeyboardHandler;
    onShiftDown?: KeyboardHandler;
    onSpace?: KeyboardHandler;
    total?: number;
    pageSizeSelectLabel: string;
    emptyStateTitle?: string;
    emptyStateMessage?: string;
    errorTitle?: string;
    errorMessage?: string;
    itemsKeyname?: string;
    previousButtonLabel: string;
    nextButtonLabel: string;
    pageSizeOptions?: string[];
    debounceDelay?: number;
    caption?: Snippet;
    headers?: Snippet<[{ visibleItems: T[] }]>;
    rows?: Snippet<[{ visibleItems: T[] }]>;
    error?: Snippet;
    empty?: Snippet;
    actionsEndAdditional?: Snippet<[{ visibleItems: T[]; page: number }]>;
  };

  let {
    id = null,
    maxHeight = '',
    onError,
    onFetch,
    onItemsChange,
    onLoadingChange,
    onShiftUp,
    onShiftDown,
    onSpace,
    total,
    pageSizeSelectLabel,
    emptyStateTitle = '',
    emptyStateMessage = '',
    errorTitle = '',
    errorMessage = '',
    itemsKeyname = 'items',
    previousButtonLabel,
    nextButtonLabel,
    pageSizeOptions = options,
    debounceDelay = 250,
    'aria-label': ariaLabel,
    caption,
    headers,
    rows,
    error,
    empty,
    actionsEndAdditional,
  }: Props = $props();

  const store: PaginationStore<T> = createPaginationStore(
    pageSizeOptions,
    pageSizeOptions[0],
  );
  let fetchError = $state<Error | undefined>();
  let paginatedTable = $state<PaginatedTable<T>>();

  function clearError() {
    if (fetchError) fetchError = undefined;
  }

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
    clearError();
    const fetchData = await onFetch();
    try {
      const response = await fetchData($store.pageSize, '');
      const { nextPageToken } = response;
      const items =
        (response as unknown as Record<string, T[]>)[itemsKeyname] || [];
      store.nextPageWithItems(nextPageToken, items);
    } catch (err) {
      fetchError = err as Error;
      store.clearLoading();
      if (onError) onError(fetchError);
    }
  }

  const fetchNextPageData = async () => {
    try {
      const fetchData = await onFetch();
      const response = await fetchData(
        $store.pageSize,
        $store.indexData[$store.index].nextToken,
      );
      const { nextPageToken } = response;
      const items =
        (response as unknown as Record<string, T[]>)[itemsKeyname] || [];
      store.nextPageWithItems(nextPageToken, items);
    } catch (err) {
      fetchError = err as Error;
      store.clearLoading();
      if (isError(err) && onError) {
        onError(err);
      }
    }
  };

  async function fetchIndexData() {
    clearError();
    store.setUpdating();
    if (!$store.hasNextIndexData) {
      debounce(await fetchNextPageData, debounceDelay)();
    } else {
      store.nextPage();
    }
    paginatedTable?.scrollToTop();
  }

  function handlePreviousPage() {
    store.previousPage();
    paginatedTable?.scrollToTop();
  }

  async function handleKeydown(event: KeyboardEvent) {
    if (event.repeat) return;
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

  $effect(() => {
    if (onLoadingChange) onLoadingChange($store.loading);
  });

  let previousItems: T[] | undefined;
  $effect(() => {
    if (onItemsChange && $store.visibleItems !== previousItems) {
      previousItems = $store.visibleItems;
      onItemsChange($store.visibleItems);
    }
  });

  const adjustedTotal = $derived(
    !$store.hasNext && $store.indexEnd !== total ? $store.indexEnd : total,
  );

  const maximizableContext = getContext<TableMaximizableContext | undefined>(
    TABLE_MAXIMIZABLE_CONTEXT,
  );
  const maximizable = Boolean(maximizableContext);
  const maximized = maximizableContext?.maximized ?? writable(false);
</script>

<svelte:window onkeydown={handleKeydown} />

{#snippet indexEmpty()}
  {#if fetchError}
    {#if error}
      {@render error()}
    {:else}
      <EmptyState title={errorTitle}>
        <Alert intent="error" title={fetchError?.message ?? errorMessage} />
      </EmptyState>
    {/if}
  {:else if empty}
    {@render empty()}
  {:else}
    <EmptyState title={emptyStateTitle} content={emptyStateMessage} />
  {/if}
{/snippet}

<PaginatedTable
  bind:this={paginatedTable}
  loading={$store.loading}
  updating={$store.updating}
  visibleItems={$store.visibleItems}
  maxHeight={maximizable && $maximized ? '100%' : maxHeight}
  class={merge(maximizable && $maximized && 'border-x-0 border-b-0')}
  {id}
  {caption}
  {headers}
  empty={indexEmpty}
>
  {@render rows?.({ visibleItems: $store.visibleItems })}

  {#snippet actionsStart()}
    <FilterSelect
      label={pageSizeSelectLabel}
      parameter={$store.key}
      value={String($store.pageSize)}
      options={pageSizeOptions}
    />
  {/snippet}

  {#snippet actionsEnd()}
    <nav class="flex shrink-0 items-center gap-2" aria-label={ariaLabel}>
      {@render actionsEndAdditional?.({
        visibleItems: $store.visibleItems,
        page: $store.index + 1,
      })}
      {#if maximizable}
        <MaximizeToggle {maximized} />
      {/if}
      <IconButton
        label={previousButtonLabel}
        disabled={!$store.hasPrevious}
        onclick={handlePreviousPage}
        Icon={IconArrowLeft}
      />
      <div class="flex gap-1">
        <p>
          {$store.indexStart.toLocaleString()}–{$store.indexEnd.toLocaleString()}
        </p>
        {#if adjustedTotal}
          <p>
            of {adjustedTotal.toLocaleString()}
          </p>
        {/if}
      </div>
      <IconButton
        label={nextButtonLabel}
        disabled={!$store.hasNext || $store.updating}
        onclick={fetchIndexData}
        Icon={IconArrowRight}
      />
    </nav>
  {/snippet}
</PaginatedTable>
