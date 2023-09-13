<script lang="ts">
  import { page } from '$app/stores';

  import TableEmptyState from '$lib/components/workflow/workflows-summary-configurable-table/table-empty-state.svelte';
  import Button from '$lib/holocene/button.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import ProgressBar from '$lib/holocene/progress-bar.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import {
    currentPageKey,
    defaultItemsPerPage,
    MAX_PAGE_SIZE,
    options,
    pagination,
    perPageKey,
  } from '$lib/stores/pagination';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  type Item = $$Generic;

  export let items: Item[];
  export let updating = false;
  export let perPageLabel: string;
  export let pageButtonLabel: (page: number) => string;
  export let nextPageButtonLabel: string;
  export let previousPageButtonLabel: string;

  let tableContainer: HTMLDivElement;

  $: url = $page.url;
  $: perPageParam =
    url.searchParams.get(perPageKey) ?? String(defaultItemsPerPage);
  $: currentPageParam = url.searchParams.get(currentPageKey) ?? '1';
  $: store = pagination(items, perPageParam, currentPageParam);

  // keep the 'page-size' url search param within the supported options
  $: {
    if (parseInt(perPageParam, 10) > parseInt(MAX_PAGE_SIZE, 10)) {
      updateQueryParameters({
        parameter: perPageKey,
        value: MAX_PAGE_SIZE,
        url,
      });
    } else if (!options.includes(perPageParam)) {
      updateQueryParameters({
        parameter: perPageKey,
        value: defaultItemsPerPage,
        url,
      });
    }
  }

  // Keep the 'page' url search param within 1 and the total number of pages
  $: {
    if (
      $store.totalPages &&
      parseInt(currentPageParam, 10) > $store.totalPages
    ) {
      updateQueryParameters({
        parameter: currentPageKey,
        value: $store.totalPages,
        url,
      });
    } else if (
      currentPageParam === null ||
      parseInt(currentPageParam, 10) < 0
    ) {
      updateQueryParameters({
        parameter: currentPageKey,
        value: '1',
        url,
      });
    }
  }

  const handlePageChange = (page: number) => {
    updateQueryParameters({
      parameter: currentPageKey,
      value: page,
      url,
    });
  };

  $: {
    if (currentPageParam) store.jumpToPage(currentPageParam);
    if (perPageParam) store.adjustPageSize(perPageParam);
  }

  $: tableOffset = tableContainer?.offsetTop
    ? tableContainer?.offsetTop + 32
    : 0;
</script>

<div
  class="paginated-table-wrapper"
  bind:this={tableContainer}
  style="max-height: calc(100vh - {tableOffset}px)"
>
  <table class="paginated-table">
    <slot name="caption" />
    <thead class="paginated-table-header">
      <slot name="headers" />
      {#if updating}
        <ProgressBar />
      {/if}
    </thead>
    <tbody class="paginated-table-body">
      <slot visibleItems={$store.items} />
    </tbody>
  </table>
  {#if $store.items.length}
    <div class="paginated-table-controls">
      <div class="paginated-table-controls-start">
        <FilterSelect
          label={perPageLabel}
          parameter={perPageKey}
          value={perPageParam}
          {options}
        />
      </div>
      <div class="paginated-table-controls-center">
        {#each $store.pageShortcuts as page}
          {#if isNaN(page)}
            <span>...</span>
          {:else}
            <Button
              variant="ghost"
              size="sm"
              active={page === $store.currentPage}
              aria-label={pageButtonLabel(page)}
              on:click={() => handlePageChange(page)}>{page}</Button
            >
          {/if}
        {/each}
      </div>
      <div class="paginated-table-controls-end">
        <IconButton
          label={previousPageButtonLabel}
          disabled={!$store.hasPrevious}
          icon="arrow-left"
          on:click={() => handlePageChange($store.currentPage - 1)}
        />
        <IconButton
          label={nextPageButtonLabel}
          disabled={!$store.hasNext}
          on:click={() => handlePageChange($store.currentPage + 1)}
          icon="arrow-right"
        />
      </div>
    </div>
  {:else}
    <TableEmptyState {updating}>
      <slot name="cloud" slot="cloud" />
    </TableEmptyState>
  {/if}
</div>

<style lang="postcss">
  .paginated-table-wrapper {
    @apply overflow-auto rounded-lg border-2 border-primary;
  }

  .paginated-table {
    @apply w-full table-auto;
  }

  .paginated-table-header {
    @apply sticky top-0 z-10;

    :global(tr) {
      @apply h-10 bg-primary text-white;
    }

    :global(tr > th) {
      @apply first-of-type:rounded-tl last-of-type:rounded-tr;
    }
  }

  .paginated-table-body {
    @apply bg-white;

    :global(tr:not(.empty)) {
      @apply h-12 border-b border-primary last-of-type:border-0 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 hover:bg-fixed;
    }

    :global(tr > td > .table-link) {
      @apply hover:text-blue-700 hover:underline hover:decoration-blue-700;
    }
  }

  .paginated-table-controls {
    @apply sticky bottom-0 left-0 flex w-full grow flex-col gap-2 rounded-b border-t border-gray-200 bg-white py-2 px-4 text-primary lg:flex-row;
  }

  .paginated-table-controls-start {
    @apply flex flex-row items-center justify-center lg:justify-start;
  }

  .paginated-table-controls-center {
    @apply flex min-w-fit grow flex-row flex-wrap items-center justify-center gap-4 text-sm;
  }

  .paginated-table-controls-end {
    @apply flex flex-row items-center justify-between gap-4 lg:justify-end;
  }
</style>
