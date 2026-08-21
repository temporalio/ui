<script lang="ts" generics="Item">
  import type { Snippet } from 'svelte';
  import type { ClassNameValue } from 'tailwind-merge';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import { IconArrowLeft, IconArrowRight } from '$lib/io/icon';
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

  interface Props {
    id?: string | null;
    items: Item[];
    loading?: boolean;
    updating?: boolean;
    perPageLabel: string;
    pageButtonLabel: (page: number) => string;
    nextPageButtonLabel: string;
    previousPageButtonLabel: string;
    maxHeight?: string;
    pageSizeOptions?: string[];
    fixed?: boolean;
    class?: ClassNameValue;
    'aria-label'?: string;
    caption?: Snippet;
    headers?: Snippet<[{ visibleItems: Item[] }]>;
    rows?: Snippet<[{ visibleItems: Item[] }]>;
    actionsEndAdditional?: Snippet;
    empty?: Snippet;
  }

  let {
    id = null,
    items,
    loading = false,
    updating = false,
    perPageLabel,
    pageButtonLabel,
    nextPageButtonLabel,
    previousPageButtonLabel,
    maxHeight = '',
    pageSizeOptions = options,
    fixed = false,
    class: className = '',
    'aria-label': ariaLabel,
    caption,
    headers,
    rows,
    actionsEndAdditional,
    empty,
  }: Props = $props();

  let paginatedTable = $state<PaginatedTable<Item>>();

  const url = $derived(page.url);
  const perPageParam = $derived(
    url.searchParams.get(perPageKey) ?? pageSizeOptions[0],
  );
  const currentPageParam = $derived(
    url.searchParams.get(currentPageKey) || '1',
  );
  const store = $derived(pagination(items, perPageParam, currentPageParam));

  // keep the 'page-size' url search param within the supported options
  $effect(() => {
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
  });

  // Keep the 'page' url search param within 1 and the total number of pages
  $effect(() => {
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
      updateQueryParameters({ parameter: currentPageKey, value: '1', url });
    }
  });

  const handlePageChange = (page: number) => {
    updateQueryParameters({ parameter: currentPageKey, value: page, url });
    paginatedTable?.scrollToTop();
  };

  $effect(() => {
    if (currentPageParam) store.jumpToPage(currentPageParam);
    if (perPageParam) store.adjustPageSize(perPageParam);
  });
</script>

<PaginatedTable
  bind:this={paginatedTable}
  {loading}
  {updating}
  {maxHeight}
  visibleItems={$store.items}
  {fixed}
  {id}
  class={className}
  {caption}
  {headers}
  {empty}
>
  {@render rows?.({ visibleItems: $store.items })}

  {#snippet actionsStart()}
    <FilterSelect
      label={perPageLabel}
      parameter={perPageKey}
      value={perPageParam}
      options={pageSizeOptions}
    />
  {/snippet}

  {#snippet actionsCenter()}
    <div class="hidden items-center gap-2 md:flex">
      {#each $store.pageShortcuts as pageShortcut}
        {#if isNaN(pageShortcut)}
          <span class="text-primary">...</span>
        {:else}
          <Button
            variant="ghost"
            size="sm"
            class={pageShortcut === $store.currentPage
              ? 'bg-interactive-secondary-active'
              : ''}
            aria-label={pageButtonLabel(pageShortcut)}
            onclick={() => handlePageChange(pageShortcut)}
            >{pageShortcut}</Button
          >
        {/if}
      {/each}
    </div>
  {/snippet}

  {#snippet actionsEnd()}
    <nav class="flex shrink-0 items-center gap-2" aria-label={ariaLabel}>
      {@render actionsEndAdditional?.()}
      <IconButton
        label={previousPageButtonLabel}
        disabled={!$store.hasPrevious}
        Icon={IconArrowLeft}
        onclick={() => handlePageChange($store.currentPage - 1)}
      />
      <IconButton
        label={nextPageButtonLabel}
        disabled={!$store.hasNext}
        onclick={() => handlePageChange($store.currentPage + 1)}
        Icon={IconArrowRight}
      />
    </nav>
  {/snippet}
</PaginatedTable>
