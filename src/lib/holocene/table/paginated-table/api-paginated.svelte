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
  import { getContext, onMount, setContext, untrack } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconArrowLeft, IconArrowRight, IconInfo } from '$lib/io/icon';
  import {
    createPaginationStore,
    type PaginationStore,
  } from '$lib/stores/api-pagination';
  import { options } from '$lib/stores/pagination';
  import { isError } from '$lib/utilities/is';
  import { isEditableTarget } from '$lib/utilities/is-editable-target';
  import {
    sortTableItems,
    type TableSort,
    type TableSortColumn,
  } from '$lib/utilities/table-sort';

  import {
    TABLE_SORT_CONTEXT,
    type TableSortContext,
  } from '../table-sort-context';

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
    sort?: TableSort;
    sortColumns?: Record<string, TableSortColumn<T>>;
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
    sort = $bindable(),
    sortColumns = {},
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

  // svelte-ignore state_referenced_locally
  const store: PaginationStore<T> = createPaginationStore(
    pageSizeOptions,
    pageSizeOptions[0],
  );
  let fetchError = $state<Error | undefined>();
  let paginatedTable = $state<PaginatedTable<T>>();
  const pageItems = $derived($store.visibleItems);
  const getSortColumn = (column: string) =>
    Object.prototype.hasOwnProperty.call(sortColumns, column)
      ? sortColumns[column]
      : undefined;
  const sortColumn = $derived(sort ? getSortColumn(sort.column) : undefined);
  const activeSortKey = $derived(
    sort && sortColumn
      ? `${sort.column}:${sort.direction}:${sortColumn.type ?? ''}`
      : undefined,
  );
  const visibleItems = $derived.by(() => {
    const items = pageItems;
    if (!activeSortKey) return items;
    return untrack(() => sortTableItems(items, sortColumn, sort?.direction));
  });

  function clearSort() {
    sort = undefined;
    store.setActiveIndex(0);
  }

  $effect(() => {
    if (sort && !sortColumn) untrack(clearSort);
  });

  setContext<TableSortContext>(TABLE_SORT_CONTEXT, {
    isSortable: (column) => Boolean(getSortColumn(column)),
    direction: (column) =>
      sort?.column === column ? sort.direction : undefined,
    toggle: (column) => {
      if (!getSortColumn(column)) return;
      sort = {
        column,
        direction:
          sort?.column === column && sort.direction === 'ascending'
            ? 'descending'
            : 'ascending',
      };
      store.setActiveIndex(0);
    },
  });

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
    if (event.repeat || isEditableTarget(event)) return;
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
    if (onItemsChange && visibleItems !== previousItems) {
      previousItems = visibleItems;
      onItemsChange(visibleItems);
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
  {visibleItems}
  {maxHeight}
  verticalScroll={maximizable && $maximized ? 'table' : 'responsive'}
  class={merge(maximizable && 'rounded-none border-0 border-t')}
  tableClass={maximizable || (sort && sortColumn) ? 'rounded-none' : ''}
  {id}
  {caption}
  {headers}
  empty={indexEmpty}
>
  {@render rows?.({ visibleItems })}

  {#snippet banner()}
    {#if sort && sortColumn}
      <div
        class={merge(
          'flex shrink-0 items-center justify-between gap-3 border-b bg-surface-information px-3 py-1 text-xs text-information',
          !maximizable && 'rounded-t-lg',
        )}
        data-testid="table-sort-banner"
      >
        <p role="status" class="flex min-w-0 items-center gap-2">
          <IconInfo class="shrink-0" />
          <span class="break-words">
            {#if !$store.loading && !fetchError && adjustedTotal !== undefined}
              {translate('common.sort-page-notice-with-count', {
                column: sort.column,
                visible: visibleItems.length.toLocaleString(),
                total: adjustedTotal.toLocaleString(),
              })}
            {:else}
              {translate('common.sort-page-notice', { column: sort.column })}
            {/if}
          </span>
        </p>
        <Button
          size="xs"
          variant="ghost"
          onclick={clearSort}
          onkeydown={(event) => event.stopPropagation()}
        >
          {translate('common.clear-sort')}
        </Button>
      </div>
    {/if}
  {/snippet}

  {#snippet actionsStart()}
    <FilterSelect
      label={pageSizeSelectLabel}
      parameter={$store.key}
      value={String($store.pageSize)}
      options={pageSizeOptions}
    />
  {/snippet}

  {#snippet actionsEnd()}
    <div class="ml-auto flex shrink-0 items-center gap-2">
      {@render actionsEndAdditional?.({
        visibleItems,
        page: $store.index + 1,
      })}
      {#if maximizable}
        <MaximizeToggle {maximized} />
      {/if}
    </div>
    <nav
      class="flex shrink-0 items-center gap-2 max-md:w-full max-md:justify-between"
      aria-label={ariaLabel}
    >
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
