<script lang="ts">
  import type { ClassNameValue } from 'tailwind-merge';

  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
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

  import PaginatedTable from './index.svelte';

  type Item = $$Generic;

  export let id: string = null;
  export let items: Item[];
  export let loading = false;
  export let updating = false;
  export let perPageLabel: string;
  export let pageButtonLabel: (page: number) => string;
  export let nextPageButtonLabel: string;
  export let previousPageButtonLabel: string;
  export let maxHeight = '';
  export let pageSizeOptions: string[] = options;
  export let fixed = false;

  let className: ClassNameValue = '';
  export { className as class };

  $: url = $page.url;
  $: perPageParam = url.searchParams.get(perPageKey) ?? pageSizeOptions[0];
  $: currentPageParam = url.searchParams.get(currentPageKey) || '1';
  $: store = pagination(items, perPageParam, currentPageParam);

  // keep the 'page-size' url search param within the supported options
  $: {
    if (parseInt(perPageParam, 10) > parseInt(MAX_PAGE_SIZE, 10)) {
      updateQueryParameters({
        parameter: perPageKey,
        value: MAX_PAGE_SIZE,
        url,
      });
    } else if (!pageSizeOptions.includes(perPageParam)) {
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
</script>

<PaginatedTable
  {loading}
  {updating}
  {maxHeight}
  visibleItems={$store.items}
  {fixed}
  {id}
  class={className}
>
  <slot name="caption" slot="caption" />
  <slot name="headers" slot="headers" visibleItems={$store.items} />
  <slot visibleItems={$store.items} />

  <svelte:fragment slot="actions-start">
    <FilterSelect
      label={perPageLabel}
      parameter={perPageKey}
      value={perPageParam}
      options={pageSizeOptions}
    />
  </svelte:fragment>

  <div class="hidden items-center gap-2 md:flex" slot="actions-center">
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

  <nav
    class="flex shrink-0 items-center gap-2"
    aria-label={$$restProps['aria-label']}
    slot="actions-end"
  >
    <slot name="actions-end-additional" />
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
  </nav>

  <slot name="empty" slot="empty" />
</PaginatedTable>
