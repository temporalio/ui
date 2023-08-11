<script lang="ts">
  import ProgressBar from '../progress-bar.svelte';

  import { page } from '$app/stores';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import {
    MAX_PAGE_SIZE,
    defaultItemsPerPage,
    pagination,
    perPageKey,
    currentPageKey,
    options,
  } from '$lib/stores/pagination';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import TableEmptyState from '$lib/components/workflow/workflows-summary-configurable-table/table-empty-state.svelte';

  type Item = $$Generic;

  export let items: Item[];
  export let updating: boolean = false;
  export let perPageLabel: string;
  export let pageButtonLabel: (page: number) => string;
  export let nextPageButtonLabel: string;
  export let previousPageButtonLabel: string;

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
    } else {
      updateQueryParameters({
        parameter: perPageKey,
        value: perPageParam,
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
    } else {
      updateQueryParameters({
        parameter: currentPageKey,
        value: currentPageParam,
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
</script>

<div class="paginated-table-wrapper">
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
            <button
              aria-label={pageButtonLabel(page)}
              class="page-btn"
              class:active={page === $store.currentPage}
              on:click={() => handlePageChange(page)}>{page}</button
            >
          {/if}
        {/each}
      </div>
      <div class="paginated-table-controls-end">
        <button
          aria-label={previousPageButtonLabel}
          disabled={!$store.hasPrevious}
          on:click={() => handlePageChange($store.currentPage - 1)}
          class="nav-btn"><Icon name="arrow-left" /></button
        >
        <button
          aria-label={nextPageButtonLabel}
          disabled={!$store.hasNext}
          on:click={() => handlePageChange($store.currentPage + 1)}
          class="nav-btn"><Icon name="arrow-right" /></button
        >
      </div>
    </div>
  {:else}
    <TableEmptyState {updating} />
  {/if}
</div>

<style lang="postcss">
  .paginated-table-wrapper {
    @apply border-2 border-primary rounded-lg overflow-scroll max-h-[680px];
  }

  .paginated-table {
    @apply table-auto w-full;
  }

  .paginated-table-header {
    @apply sticky top-0 z-10;

    :global(tr) {
      @apply bg-primary text-white h-10;
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
    @apply sticky flex gap-2 grow flex-col lg:flex-row w-full rounded-b bottom-0 left-0 py-2 px-4 bg-white text-primary border-t border-gray-200;
  }

  .paginated-table-controls-start {
    @apply flex flex-row items-center justify-center lg:justify-start;
  }

  .paginated-table-controls-center {
    @apply flex flex-wrap grow flex-row items-center justify-center min-w-fit gap-2;
  }

  .paginated-table-controls-end {
    @apply flex flex-row items-center justify-between lg:justify-end gap-2;
  }

  .page-btn {
    @apply w-10 h-10 rounded-lg bg-white text-gray-500 hover:bg-gray-50 focus:outline-none focus:border-2 focus:border-blue-600;
  }

  .page-btn.active {
    @apply bg-gray-100 text-primary;
  }

  .nav-btn {
    @apply border border-gray-300 text-gray-700 rounded-lg w-10 h-10 flex items-center justify-center disabled:bg-gray-100 disabled:text-gray-500 disabled:pointer-events-none;
  }
</style>
