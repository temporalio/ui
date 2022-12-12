<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';

  import { createPaginationStore } from '$lib/stores/api-pagination';
  import { options } from '$lib/stores/pagination';
  import KeyboardShortcut from '$holocene/keyboard-shortcut/shortcut.svelte';

  type T = $$Generic;
  type PaginatedRequest = (
    size: number,
    token: string | Uint8Array,
  ) => Promise<{ items: any[]; nextPageToken: string }>;

  export let onError: (error: any) => void;
  export let onFetch: () => Promise<PaginatedRequest>;
  export let onPageReset: () => void | undefined = undefined;
  export let onShiftUp: () => void | undefined = undefined;
  export let onShiftDown: () => void | undefined = undefined;

  export let pageSizeOptions: string[] = options;
  export let reset: any;
  export let total: string | number = '';

  let store = createPaginationStore();
  let error: any;

  let shifted = false;

  $: nextIndex = $store.nextIndex;
  $: pageSize = $store.pageSize;

  function clearError() {
    if (error) error = undefined;
  }

  async function onPageChange(index: number, size: number) {
    clearError();
    store.setUpdating();
    console.log('TODO: Reset index to 0 on pageSize change');
    try {
      const fetchData: PaginatedRequest = await onFetch();
      const response = await fetchData(
        size,
        $store.indexData[index]?.nextToken ?? '',
      );
      const { items, nextPageToken } = response;
      store.setNextPageToken(nextPageToken, items);
    } catch (err: any) {
      error = err;
      onError(error);
    }
  }

  $: reset, onPageChange(nextIndex, pageSize);

  $: items = $store.indexData[$store.index]?.items ?? [];
  $: isEmpty = items.length === 0 && !$store.loading;

  function handleKeydown(event) {
    switch (event.code) {
      case 'ArrowRight':
        if ($store.hasNext && !$store.loading) {
          store.nextPage();
        }
        break;
      case 'ArrowLeft':
        if ($store.hasPrevious && !$store.loading) {
          store.previousPage();
          if ($store.nextIndex === 0 && onPageReset) {
            onPageReset();
          }
        }
        break;
      case 'ArrowUp':
        if (shifted && onShiftUp) {
          store.reset();
          onShiftUp();
        } else {
          store.previousRow();
        }
        break;
      case 'ArrowDown':
        if (shifted && onShiftDown) {
          store.reset();
          onShiftDown();
        } else {
          store.nextRow();
        }
        break;
      case 'Space':
        event.preventDefault();
        // Use an open row array in store???
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        shifted = true;
        break;
      default:
        break;
    }
  }

  function handleKeyup(event) {
    switch (event.code) {
      case 'ShiftLeft':
      case 'ShiftRight':
        shifted = false;
        break;
      default:
        break;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

{#if error && $$slots.error}
  <slot name="error" />
{:else if error}
  <Alert
    intent="error"
    class="mb-10"
    title={error?.message ?? 'Error fetching data.'}
  />
{/if}

{#if isEmpty}
  <slot name="empty">No Items</slot>
{:else}
  <div class="relative mb-8 flex flex-col gap-4">
    <div class="flex flex-col items-center justify-between gap-4 lg:flex-row">
      <div class="flex items-center gap-1 lg:gap-2 xl:gap-3">
        <slot name="action-top-left">
          <KeyboardShortcut arrow="left" tooltipText="Previous Page" />
          <KeyboardShortcut arrow="up" tooltipText="Previous Row" />
          <KeyboardShortcut arrow="down" tooltipText="Next Row" />
          <KeyboardShortcut arrow="right" tooltipText="Next Page" />
          <slot name="shortcuts" />
        </slot>
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
            <span
              class="arrow arrow-left"
              class:arrow-left-disabled={!$store.hasPrevious}
            />
          </button>
          <div class="flex gap-1">
            <p>
              {$store.currentPageNumber}–{$store.endingPageNumber}
            </p>
            <p>
              {#if total}of {total}{/if}
            </p>
          </div>
          <button
            class="caret"
            disabled={!$store.hasNext}
            on:click={store.nextPage}
          >
            <span
              class="arrow arrow-right"
              class:arrow-right-disabled={!$store.hasNext}
            />
          </button>
        </div>
        <slot name="action-top-right" />
      </nav>
    </div>
    {#if $store.loading}
      <SkeletonTable rows={15} />
    {:else if !isEmpty}
      <slot
        visibleItems={items}
        initialItem={[]}
        updating={$store.updating}
        activeRow={$store.activeRow}
      />
    {/if}

    <nav
      class={`flex ${
        $$slots['action-bottom-left'] ? 'justify-between' : 'justify-end'
      }`}
    >
      <slot name="action-bottom-left" />
      <div class="flex gap-4">
        {#if pageSizeOptions.length}
          <FilterSelect
            label="Per Page"
            parameter={$store.key}
            value={String($store.pageSize)}
            options={pageSizeOptions}
          />
        {/if}
        <div class="flex items-center justify-center gap-1">
          <button
            class="caret"
            disabled={!$store.hasPrevious}
            on:click={store.previousPage}
          >
            <span
              class="arrow arrow-left"
              class:arrow-left-disabled={!$store.hasPrevious}
            />
          </button>
          <div class="flex gap-1">
            <p>
              {$store.currentPageNumber}–{$store.endingPageNumber}
            </p>
            <p>
              {#if total}of {total}{/if}
            </p>
          </div>
          <button
            class="caret"
            disabled={!$store.hasNext}
            on:click={store.nextPage}
          >
            <span
              class="arrow arrow-right"
              class:arrow-right-disabled={!$store.hasNext}
            />
          </button>
        </div>
        <slot name="action-bottom-right" />
      </div>
    </nav>
  </div>
{/if}

<style lang="postcss">
  .arrow {
    @apply absolute top-0 h-0 w-0;
    border-style: solid;
    border-width: 6px 12px 6px 0;
  }
  .arrow-left {
    @apply left-0;
    border-width: 6px 12px 6px 0;
    border-color: transparent #18181b transparent transparent;
  }
  .arrow-left-disabled {
    border-color: transparent #d4d4d8 transparent transparent;
  }
  .arrow-right {
    border-width: 6px 0 6px 12px;
    border-color: transparent transparent transparent #18181b;
  }
  .arrow-right-disabled {
    border-color: transparent transparent transparent #d4d4d8;
  }

  .caret {
    @apply relative;
    width: 12px;
    height: 12px;
  }

  .caret:disabled {
    @apply cursor-not-allowed text-gray-300;
  }
</style>
