<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';

  import { createPaginationStore } from '$lib/stores/api-pagination';
  import { options } from '$lib/stores/pagination';

  type T = $$Generic;
  type PaginatedRequest = (
    size: number,
    token: string,
  ) => Promise<{ items: any[]; nextPageToken: string }>;

  export let onError: (error: any) => void;
  export let onFetch: () => Promise<PaginatedRequest>;
  export let reset: any;
  export let total: string | number = '';

  let store = createPaginationStore();
  let error: any;

  $: nextIndex = $store.nextIndex;
  $: pageSize = $store.pageSize;

  function clearError() {
    if (error) error = undefined;
  }

  async function onPageChange(nextIndex: number) {
    clearError();
    store.setUpdating();
    try {
      const fetchData: PaginatedRequest = await onFetch();
      const response = await fetchData(pageSize, $store.indexTokens[nextIndex]);
      const { items, nextPageToken } = response;
      store.setNextPageToken(nextPageToken, items);
    } catch (err: any) {
      error = err;
      onError(error);
    }
  }

  async function onPageSizeChange(pageSize: number) {
    clearError();
    store.resetPageSize();
    try {
      const fetchData: PaginatedRequest = await onFetch();
      const response = await fetchData(
        pageSize,
        $store.indexTokens[$store.index],
      );
      const { items, nextPageToken } = response;
      store.setNextPageToken(nextPageToken, items);
    } catch (err: any) {
      error = err;
      onError(error);
    }
  }

  $: onPageChange(nextIndex);
  $: reset, onPageSizeChange(pageSize);

  $: isEmpty = $store.items.length === 0 && !$store.loading;

  function handleKeydown(event) {
    if (event.key === 'ArrowRight' && $store.hasNext) {
      store.nextPage();
    } else if (event.key === 'ArrowLeft' && $store.hasPrevious) {
      store.previousPage();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

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
      <div class="flex items-center">
        <slot name="action-top-left" />
      </div>
      <nav class="flex flex-col justify-end gap-4 md:flex-row">
        <slot name="action-top-center" />
        <FilterSelect
          label="Per Page"
          parameter={$store.key}
          value={String($store.pageSize)}
          {options}
        />
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
        visibleItems={$store.items}
        initialItem={[]}
        updating={$store.updating}
      />
    {/if}

    <nav
      class={`flex ${
        $$slots['action-bottom-left'] ? 'justify-between' : 'justify-end'
      }`}
    >
      <slot name="action-bottom-left" />
      <div class="flex gap-4">
        <FilterSelect
          label="Per Page"
          parameter={$store.key}
          value={String($store.pageSize)}
          {options}
        />
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
    @apply right-0;
    border-width: 6px 0 6px 12px;
    border-color: transparent transparent transparent #18181b;
  }

  .arrow-right-disabled {
    border-color: transparent transparent transparent #d4d4d8;
  }

  .caret {
    @apply relative text-gray-500;
    width: 12px;
    height: 12px;
  }

  .caret:disabled {
    @apply cursor-not-allowed text-gray-300;
  }
</style>
