<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';

  import { createPaginationStore } from '$lib/stores/api-pagination';
  import { perPageOptions } from '$lib/stores/pagination';

  type T = $$Generic;
  type PaginatedRequest = (
    size: number,
    token: string,
  ) => Promise<{ items: any[]; nextPageToken: string }>;

  export let onError: (error: any) => void;
  export let onFetch: () => Promise<PaginatedRequest>;

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

  $: {
    onPageChange(nextIndex);
  }

  $: {
    onPageSizeChange(pageSize);
  }

  $: isEmpty = $store.items.length === 0 && !$store.loading;
</script>

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
    <div class="flex flex-col items-center gap-4 lg:flex-row justify-between">
      <div class="flex items-center">
        <slot name="action-top-left" />
        {#if $store.updating}
          <p
            class={`${
              $$slots['action-top-left'] ? 'ml-6' : 'mr-6'
            } text-gray-600`}
          >
            Updating…
          </p>
        {/if}
      </div>
      <nav class="flex flex-col justify-end gap-4 md:flex-row">
        <slot name="action-top-center" />
        <FilterSelect
          label="Per Page"
          parameter={$store.key}
          value={String($store.pageSize)}
          options={perPageOptions($store.pageSize)}
        />
        <div class="flex items-center justify-center gap-1">
          <button
            class="caret"
            disabled={!$store.hasPrevious}
            on:click={store.previousPage}
          >
            <Icon name="chevron-left" />
          </button>
          <p>
            {$store.currentPageNumber}–{$store.endingPageNumber}
          </p>
          <button
            class="caret"
            disabled={!$store.hasNext}
            on:click={store.nextPage}
          >
            <Icon name="chevron-right" />
          </button>
        </div>
        <slot name="action-top-right" />
      </nav>
    </div>
    {#if $store.loading}
      <SkeletonTable rows={15} />
    {:else if !isEmpty}
      <slot visibleItems={$store.items} initialItem={[]} />
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
          options={perPageOptions($store.pageSize)}
        />
        <div class="flex items-center justify-center gap-1">
          <button
            class="caret"
            disabled={!$store.hasPrevious}
            on:click={store.previousPage}
          >
            <Icon name="chevron-left" />
          </button>
          <p>
            {$store.currentPageNumber}–{$store.endingPageNumber}
          </p>
          <button
            class="caret"
            disabled={!$store.hasNext}
            on:click={store.nextPage}
          >
            <Icon name="chevron-right" />
          </button>
        </div>
        <slot name="action-bottom-right" />
      </div>
    </nav>
  </div>
{/if}

<style lang="postcss">
  .caret {
    @apply text-gray-500;
  }

  .caret:disabled {
    @apply cursor-not-allowed text-gray-300;
  }
</style>
