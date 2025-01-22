<script lang="ts" module>
  export type PaginatedRequest<T> = (
    size: number,
    token: string,
  ) => Promise<{ items: T[]; nextPageToken: string }>;
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { run } from 'svelte/legacy';

  import { onMount } from 'svelte';

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
  type $$Props = HTMLAttributes<HTMLTableElement> & {
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
  };

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
    ...rest
  }: $$Props = $props();

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

  run(() => {
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

<svelte:window on:keydown={handleKeydown} />

<slot name="header" visibleItems={$store.visibleItems} />

<PaginatedTable
  updating={$store.updating}
  visibleItems={$store.visibleItems}
  {maxHeight}
  {id}
>
  <slot name="caption" slot="caption" />
  <slot name="headers" slot="headers" visibleItems={$store.visibleItems} />

  <slot visibleItems={$store.visibleItems} />

  <svelte:fragment slot="empty">
    {#if $store.loading}
      <slot name="loading">
        <Loading />
      </slot>
    {:else if error}
      <slot name="error">
        <EmptyState title={errorTitle}>
          <Alert intent="error" title={error?.message ?? errorMessage} />
        </EmptyState>
      </slot>
    {:else}
      <slot name="empty">
        <EmptyState title={emptyStateTitle} content={emptyStateMessage} />
      </slot>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="actions-start">
    <FilterSelect
      label={pageSizeSelectLabel}
      parameter={$store.key}
      value={String($store.pageSize)}
      options={pageSizeOptions}
    />
  </svelte:fragment>

  <nav
    class="flex shrink-0 items-center gap-2"
    aria-label={rest['aria-label']}
    slot="actions-end"
  >
    <IconButton
      label={previousButtonLabel}
      disabled={!$store.hasPrevious}
      on:click={store.previousPage}
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
      on:click={fetchIndexData}
      icon="arrow-right"
    />
  </nav>
</PaginatedTable>
