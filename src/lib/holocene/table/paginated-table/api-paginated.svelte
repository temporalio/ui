<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

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
    onError?: (error: Error | unknown) => void | undefined;
    onFetch: () => Promise<PaginatedRequest<T>>;
    onShiftUp?: (event: KeyboardEvent) => void | undefined;
    onShiftDown?: (event: KeyboardEvent) => void | undefined;
    onSpace?: (event: KeyboardEvent) => void | undefined;
    total?: string | number;
    pageSizeSelectLabel: string;
    emptyStateMessage: string;
    fallbackErrorMessage: string;
    itemsKeyname?: string;
    previousButtonLabel: string;
    nextButtonLabel: string;
  };

  type PaginatedRequest<T> = (
    size: number,
    token: string,
  ) => Promise<{ items: T[]; nextPageToken: string }>;

  export let onError: (error: Error) => void | undefined = undefined;
  export let onFetch: () => Promise<PaginatedRequest<T>>;
  export let onShiftUp: (event: KeyboardEvent) => void | undefined = undefined;
  export let onShiftDown: (event: KeyboardEvent) => void | undefined =
    undefined;
  export let onSpace: (event: KeyboardEvent) => void | undefined = undefined;

  export let total: string | number = '';
  export let pageSizeSelectLabel: string;
  export let emptyStateMessage: string;
  export let fallbackErrorMessage: string;
  export let itemsKeyname = 'items';
  export let previousButtonLabel: string;
  export let nextButtonLabel: string;

  let store: PaginationStore<T> = createPaginationStore();
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

<PaginatedTable updating={$store.updating} visibleItems={$store.visibleItems}>
  <slot name="caption" slot="caption" />
  <slot name="headers" slot="headers" visibleItems={$store.visibleItems} />

  <slot visibleItems={$store.visibleItems} />

  <svelte:fragment slot="empty">
    {#if $store.loading}
      {#if $$slots.loading}
        <slot name="loading" />
      {:else}
        <Loading />
      {/if}
    {:else if error}
      {#if $$slots.error}
        <slot name="error" />
      {:else}
        <EmptyState title="">
          <Alert
            intent="error"
            title={error?.message ?? fallbackErrorMessage}
          />
        </EmptyState>
      {/if}
    {:else}
      <EmptyState title="" content={emptyStateMessage} />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="actions-start">
    <FilterSelect
      label={pageSizeSelectLabel}
      parameter={$store.key}
      value={String($store.pageSize)}
      {options}
    />
  </svelte:fragment>

  <nav
    class="flex shrink-0 items-center gap-2"
    aria-label={$$restProps['aria-label']}
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
