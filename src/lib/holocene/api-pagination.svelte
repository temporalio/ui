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

  export let isUnauthorizedError: (error: any) => boolean = () => false;
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

{#if isUnauthorizedError(error) && $$slots.unauthorized}
  <slot name="unauthorized" />
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
    <div class="flex justify-start md:justify-between">
      <p class="mr-6 flex items-center text-gray-600">
        {#if $store.updating}
          Updating…
        {/if}
      </p>
      <nav
        class="flex items-center justify-start gap-4 text-sm md:justify-end md:text-base"
      >
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
        <slot name="action" />
      </nav>
    </div>
    {#if $store.loading}
      <SkeletonTable rows={15} />
    {:else if !isEmpty}
      <slot visibleItems={$store.items} initialItem={[]} />
    {/if}

    <nav class="flex justify-end gap-4">
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
