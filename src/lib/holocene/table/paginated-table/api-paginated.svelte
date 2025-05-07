<script lang="ts" context="module">
  export type PaginatedRequest<T> = (
    size: number,
    token: string,
  ) => Promise<{ items: T[]; nextPageToken: string }>;
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import debounce from 'just-debounce';
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
  type $$Props = HTMLAttributes<HTMLDivElement> & {
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

  export let id: string = null;
  export let maxHeight = '';
  export let onError: (error: Error) => void | undefined = undefined;
  export let onFetch: () => Promise<PaginatedRequest<T>>;
  export let onShiftUp: (event: KeyboardEvent) => void | undefined = undefined;
  export let onShiftDown: (event: KeyboardEvent) => void | undefined =
    undefined;
  export let onSpace: (event: KeyboardEvent) => void | undefined = undefined;

  export let total: string | number = '';
  export let pageSizeSelectLabel: string;
  export let emptyStateTitle = '';
  export let emptyStateMessage = '';
  export let errorTitle = '';
  export let errorMessage = '';
  export let itemsKeyname = 'items';
  export let previousButtonLabel: string;
  export let nextButtonLabel: string;
  export let pageSizeOptions = options;
  export let debounceDelay = 350;

  let store: PaginationStore<T> = createPaginationStore(
    pageSizeOptions,
    pageSizeOptions[0],
  );
  let error: Error;

  function clearError() {
    if (error) error = undefined;
  }

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

  const fetchNextPageData = async () => {
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
  };

  async function fetchIndexData() {
    clearError();
    store.setUpdating();
    if (!$store.hasNextIndexData) {
      debounce(await fetchNextPageData, debounceDelay)();
    } else {
      store.nextPage();
    }
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
</script>

<svelte:window on:keydown={handleKeydown} />

<slot name="header" visibleItems={$store.visibleItems} />

<PaginatedTable
  loading={$store.loading}
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
    aria-label={$$restProps['aria-label']}
    slot="actions-end"
  >
    <slot
      name="actions-end-additional"
      visibleItems={$store.visibleItems}
      page={$store.index + 1}
    />
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
      disabled={!$store.hasNext || $store.updating}
      on:click={() => {
        if ($store.hasNext && !$store.updating) {
          fetchIndexData();
        }
      }}
      icon="arrow-right"
    />
  </nav>
</PaginatedTable>
