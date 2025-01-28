<script lang="ts" module>
  export type PaginatedRequest<T> = (
    size: number,
    token: string,
  ) => Promise<{ items: T[]; nextPageToken: string }>;
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { onMount, type Snippet } from 'svelte';

  import Alert from '$lib/holocene/alert.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import {
    createPaginationStore,
    type PaginationStore,
  } from '$lib/stores/api-pagination';
  import { options } from '$lib/stores/pagination';
  import { isError } from '$lib/utilities/is';

  import PaginatedTable from './index.svelte';

  type T = $$Generic;
  interface Props extends Omit<HTMLAttributes<HTMLTableElement>, 'children'> {
    id?: string;
    maxHeight?: string;
    onError?: (error: Error | unknown) => void | undefined;
    onFetch: () => Promise<PaginatedRequest<T>>;
    onShiftUp?: (event: KeyboardEvent) => void | undefined;
    onShiftDown?: (event: KeyboardEvent) => void | undefined;
    onSpace?: (event: KeyboardEvent) => void | undefined;
    total?: string | number;
    pageSizeSelectLabel: string;
    emptyStateTitle?: string;
    emptyStateMessage?: string;
    errorTitle?: string;
    errorMessage?: string;
    itemsKeyname?: string;
    previousButtonLabel: string;
    nextButtonLabel: string;
    pageSizeOptions?: string[];
    header?: Snippet<[{ visibleItems: T[] }]>;
    caption?: Snippet;
    headers?: Snippet;
    empty?: Snippet;
    children?: Snippet<[{ visibleItems: T[] }]>;
  }

  let {
    id,
    maxHeight = '',
    onError,
    onFetch,
    onShiftUp,
    onShiftDown,
    onSpace,
    total = '',
    pageSizeSelectLabel,
    emptyStateTitle = '',
    emptyStateMessage = '',
    errorTitle = '',
    errorMessage = '',
    itemsKeyname = 'items',
    previousButtonLabel,
    nextButtonLabel,
    pageSizeOptions = options,
    header,
    caption,
    headers,
    empty: empty_render,
    children,
    ...rest
  }: Props = $props();

  let store: PaginationStore<T> = createPaginationStore(
    pageSizeOptions,
    pageSizeOptions[0],
  );
  let error: Error = $state();

  function clearError() {
    if (error) error = undefined;
  }

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
</script>

<svelte:window onkeydown={handleKeydown} />

{@render header?.({ visibleItems: $store.visibleItems })}

<PaginatedTable
  updating={$store.updating}
  visibleItems={$store.visibleItems}
  {maxHeight}
  {id}
  {caption}
  {headers}
>
  {@render children?.({ visibleItems: $store.visibleItems })}

  {#snippet empty()}
    {#if empty_render}
      {@render empty_render()}
    {:else if $store.loading}
      <Loading />
    {:else if error}
      <EmptyState title={errorTitle}>
        <Alert intent="error" title={error?.message ?? errorMessage} />
      </EmptyState>
    {:else}
      <EmptyState title={emptyStateTitle} content={emptyStateMessage} />
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
    <nav
      class="flex shrink-0 items-center gap-2"
      aria-label={rest['aria-label']}
    >
      <IconButton
        label={previousButtonLabel}
        disabled={!$store.hasPrevious}
        onclick={store.previousPage}
        icon="arrow-left"
      />
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
      <IconButton
        label={nextButtonLabel}
        disabled={!$store.hasNext}
        onclick={fetchIndexData}
        icon="arrow-right"
      />
    </nav>
  {/snippet}
</PaginatedTable>
