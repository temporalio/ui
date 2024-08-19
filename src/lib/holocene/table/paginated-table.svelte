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

  export let variant: 'primary' | 'ghost' = 'primary';
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

  // $: tableOffset = tableContainer?.offsetTop
  //   ? tableContainer?.offsetTop + 32
  //   : 0;

  $: tableOffset = 0;
</script>

<div
  class="paginated-table-wrapper {variant}"
  bind:this={tableContainer}
  style="max-height: calc(100vh - {tableOffset}px)"
>
  <table class="paginated-table">
    <slot name="caption" />
    <thead class="paginated-table-header">
      <slot name="headers" visibleItems={$store.items} />
      {#if updating}
        <ProgressBar />
      {/if}
    </thead>
    <tbody class="paginated-table-body">
      <slot name="visual" />
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
            <span class="text-primary">...</span>
          {:else}
            <Button
              variant="ghost"
              size="sm"
              class={page === $store.currentPage
                ? 'bg-interactive-secondary-active'
                : ''}
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
    @apply min-h-[154px] overflow-auto;
  }

  .primary {
    @apply border-2 border-table;
  }

  .ghost {
    @apply border-t-2 border-subtle;
  }

  .paginated-table {
    @apply w-full table-auto;
  }

  .paginated-table-header {
    @apply sticky top-0 z-10;

    :global(tr) {
      @apply surface-table h-10 text-off-white;
    }

    :global(tr.dense) {
      @apply h-8;
    }

    :global(tr > th) {
      @apply first-of-type:rounded-tl last-of-type:rounded-tr;
    }
  }

  .paginated-table-body {
    @apply surface-primary flex gap-0;

    :global(tr:not(.empty)) {
      @apply h-12 border-b border-table last-of-type:border-0 hover:bg-interactive-table-hover hover:bg-fixed;
    }

    :global(tr.dense) {
      @apply h-8 hover:cursor-pointer;
    }

    :global(tr.dense:nth-of-type(odd)) {
      @apply surface-interactive-ghost;
    }

    :global(tr > td > .table-link) {
      @apply hover:text-blue-700 hover:underline hover:decoration-blue-700;
    }
  }

  .paginated-table-controls {
    @apply surface-primary sticky bottom-0 left-0 flex w-full grow gap-2 rounded-b border-t border-table px-4 py-2 text-inverse;
  }

  .paginated-table-controls-start {
    @apply flex shrink-0 flex-row items-center justify-center lg:justify-start;
  }

  .paginated-table-controls-center {
    @apply flex grow flex-row items-center justify-start gap-4 overflow-auto text-sm md:justify-center;
  }

  .paginated-table-controls-end {
    @apply flex shrink-0 flex-row items-center justify-between gap-4 lg:justify-end;
  }
</style>
