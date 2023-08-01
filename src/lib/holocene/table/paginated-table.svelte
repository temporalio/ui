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

  type Item = $$Generic;

  export let items: Item[];
  export let updating: boolean = false;

  $: url = $page.url;
  $: perPage = url.searchParams.get(perPageKey) ?? String(defaultItemsPerPage);
  $: currentPage = url.searchParams.get(currentPageKey);
  $: store = pagination(items, perPage, currentPage);

  // keep the 'page-size' url search param within the supported options
  $: {
    if (parseInt(perPage, 10) > parseInt(MAX_PAGE_SIZE, 10)) {
      updateQueryParameters({
        parameter: perPageKey,
        value: MAX_PAGE_SIZE,
        url,
      });
    } else if (!options.includes(perPage)) {
      updateQueryParameters({
        parameter: perPageKey,
        value: defaultItemsPerPage,
        url,
      });
    } else {
      updateQueryParameters({
        parameter: perPageKey,
        value: perPage,
        url,
      });
    }
  }

  // Keep the 'page' url search param within 1 and the total number of pages
  $: {
    if ($store.totalPages && parseInt(currentPage, 10) > $store.totalPages) {
      updateQueryParameters({
        parameter: currentPageKey,
        value: $store.totalPages,
        url,
      });
    } else if (currentPage === null || parseInt(currentPage, 10) < 0) {
      updateQueryParameters({
        parameter: currentPageKey,
        value: '1',
        url,
      });
    } else {
      updateQueryParameters({
        parameter: currentPageKey,
        value: currentPage,
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

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'KeyL': {
        if ($store.hasNext) {
          event.preventDefault();
          handlePageChange($store.currentPage + 1);
        }
        break;
      }
      case 'ArrowLeft':
      case 'KeyH': {
        if ($store.hasPrevious) {
          event.preventDefault();
          handlePageChange($store.currentPage - 1);
        }
        break;
      }
      default:
        break;
    }
  };

  $: {
    if (perPage) store.jumpToPage(currentPage);
    if (currentPage) store.adjustPageSize(perPage);
  }
</script>

<div class="paginated-table-wrapper">
  <table class="paginated-table">
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
  <nav on:keydown={handleKeyDown} class="paginated-table-controls">
    <div class="flex flex-row items-center justify-start mx-8">
      <FilterSelect
        label="Per Page"
        parameter={perPageKey}
        value={perPage}
        {options}
      />
    </div>
    <div class="flex flex-row items-center justify-center gap-2">
      {#each $store.pageShortcuts as page}
        {#if isNaN(page)}
          <span>...</span>
        {:else}
          <button
            class="page-btn"
            class:active={page === parseInt(currentPage, 10)}
            on:click={() => handlePageChange(page)}>{page}</button
          >
        {/if}
      {/each}
    </div>
    <div class="flex flex-row items-center justify-end mx-8 gap-2">
      <button
        disabled={!$store.hasPrevious}
        on:click={() => handlePageChange($store.currentPage - 1)}
        class="nav-btn"><Icon name="arrow-left" /></button
      >
      <button
        disabled={!$store.hasNext}
        on:click={() => handlePageChange($store.currentPage + 1)}
        class="nav-btn"><Icon name="arrow-right" /></button
      >
    </div>
  </nav>
</div>

<style lang="postcss">
  .paginated-table-wrapper {
    @apply border-2 border-primary rounded-lg overflow-scroll;
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
    @apply sticky z-10 grid grid-cols-3 w-full rounded-b bottom-0 left-0 py-4 bg-white text-primary border-t border-gray-200;
  }

  .page-btn {
    @apply w-10 h-10 rounded-lg bg-white text-gray-500 hover:bg-gray-50 focus:outline-none focus:border-2 focus:border-blue-600;
  }

  .page-btn.active {
    @apply bg-gray-100 text-primary border-none;
  }

  .nav-btn {
    @apply border border-gray-300 text-gray-700 rounded-lg w-10 h-10 flex items-center justify-center disabled:bg-gray-100 disabled:text-gray-500 disabled:pointer-events-none;
  }
</style>
