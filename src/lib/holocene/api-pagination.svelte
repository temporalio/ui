<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';

  import { createPaginationStore } from '$lib/stores/api-pagination';
  import { options } from '$lib/stores/pagination';
  import { onMount } from 'svelte';

  type T = $$Generic;
  type PaginatedRequest = (
    size: number,
    token: NextPageToken,
  ) => Promise<{ items: any[]; nextPageToken: NextPageToken }>;

  export let onError: (error: any) => void | undefined = undefined;
  export let onFetch: () => Promise<PaginatedRequest>;
  export let onShiftUp: (event: KeyboardEvent) => void | undefined = undefined;
  export let onShiftDown: (event: KeyboardEvent) => void | undefined =
    undefined;
  export let onSpace: (event: KeyboardEvent) => void | undefined = undefined;

  export let pageSizeOptions: string[] | number[] = options;
  export let defaultPageSize: string | number | undefined = undefined;
  export let total: string | number = '';

  let store = createPaginationStore(pageSizeOptions, defaultPageSize);
  let error: any;

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
    const fetchData: PaginatedRequest = await onFetch();
    try {
      const response = await fetchData($store.pageSize, '');
      const { items, nextPageToken } = response;
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
        const fetchData: PaginatedRequest = await onFetch();
        const response = await fetchData(
          $store.pageSize,
          $store.indexData[$store.index].nextToken,
        );
        const { items, nextPageToken } = response;
        store.nextPageWithItems(nextPageToken, items);
      } catch (err: any) {
        error = err;
        if (onError) onError(error);
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

{#if error && $$slots.error}
  <slot name="error" />
{:else if error}
  <Alert
    intent="error"
    class="mb-10 rounded-xl border-[3px]"
    title={error?.message ?? 'Error fetching data.'}
  />
{/if}

<div class="relative mb-8 flex flex-col gap-4">
  <div class="flex flex-col items-center justify-between gap-4 lg:flex-row">
    <div class="flex items-center gap-1 lg:gap-2 xl:gap-3">
      <slot name="action-top-left" />
    </div>
    <nav class="flex flex-col justify-end gap-4 md:flex-row">
      <slot name="action-top-center" />
      {#if pageSizeOptions.length}
        <FilterSelect
          label="Per Page"
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
        >
          <Icon name="chevron-left" />
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
        >
          <Icon name="chevron-right" />
        </button>
      </div>
      <slot name="action-top-right" />
    </nav>
  </div>
  {#if $store.loading}
    <SkeletonTable rows={15} />
  {:else if isEmpty}
    <slot name="empty">No Items</slot>
  {:else}
    <slot
      updating={$store.updating}
      visibleItems={$store.visibleItems}
      activeIndex={$store.activeIndex}
      setActiveIndex={store.setActiveIndex}
    />
  {/if}
  <nav
    class={`flex ${
      $$slots['action-bottom-left'] ? 'justify-between' : 'justify-end'
    }`}
  >
    <slot name="action-bottom-left" />
    <div class="flex gap-4">
      {#if $store.visibleItems.length}
        {#if pageSizeOptions.length}
          <FilterSelect
            label="Per Page"
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
          >
            <Icon name="chevron-left" />
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
          >
            <Icon name="chevron-right" />
          </button>
        </div>
      {/if}
      <slot name="action-bottom-right" />
    </div>
  </nav>
</div>

<style lang="postcss">
  .caret {
    @apply text-gray-900;
  }

  .caret:disabled {
    @apply cursor-not-allowed text-gray-400;
  }
</style>
