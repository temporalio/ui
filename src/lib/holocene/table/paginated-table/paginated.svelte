<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

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

  interface Props extends Omit<HTMLAttributes<HTMLTableElement>, 'children'> {
    id?: string;
    items: Item[];
    variant?: 'primary' | 'split';
    updating?: boolean;
    perPageLabel: string;
    pageButtonLabel: (page: number) => string;
    nextPageButtonLabel: string;
    previousPageButtonLabel: string;
    maxHeight?: string;
    pageSizeOptions?: string[];
    fixed?: boolean;
    caption?: Snippet;
    header?: Snippet<[{ visibleItems: Item[] }]>;
    emptyState?: Snippet;
    rows?: Snippet<[{ visibleItems: Item[] }]>;
  }

  let {
    id,
    items,
    variant = 'primary',
    updating = false,
    perPageLabel,
    pageButtonLabel,
    nextPageButtonLabel,
    previousPageButtonLabel,
    maxHeight = '',
    pageSizeOptions = options,
    fixed = false,
    caption,
    rows,
    header,
    emptyState,
    ...rest
  }: Props = $props();

  let url = $derived($page.url);
  let perPageParam = $derived(
    url.searchParams.get(perPageKey) ?? pageSizeOptions[0],
  );
  let currentPageParam = $derived(url.searchParams.get(currentPageKey) ?? '1');
  let store = $derived(pagination(items, perPageParam, currentPageParam));

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
      updateQueryParameters({
        parameter: currentPageKey,
        value: '1',
        url,
      });
    }
  });

  const handlePageChange = (page: number) => {
    updateQueryParameters({
      parameter: currentPageKey,
      value: page,
      url,
    });
  };

  $effect(() => {
    if (currentPageParam) store.jumpToPage(currentPageParam);
    if (perPageParam) store.adjustPageSize(perPageParam);
  });
</script>

<PaginatedTable
  {updating}
  {variant}
  {maxHeight}
  visibleItems={$store.items}
  {fixed}
  {id}
  {caption}
  {emptyState}
>
  {#snippet headers()}
    {@render header?.({ visibleItems: $store.items })}
  {/snippet}
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
    <div class="flex items-center gap-2">
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
            onclick={() => handlePageChange(page)}>{page}</Button
          >
        {/if}
      {/each}
    </div>
  {/snippet}

  {#snippet actionsEnd()}
    <nav
      class="flex shrink-0 items-center gap-2"
      aria-label={rest['aria-label']}
    >
      <IconButton
        label={previousPageButtonLabel}
        disabled={!$store.hasPrevious}
        icon="arrow-left"
        onclick={() => handlePageChange($store.currentPage - 1)}
      />
      <IconButton
        label={nextPageButtonLabel}
        disabled={!$store.hasNext}
        onclick={() => handlePageChange($store.currentPage + 1)}
        icon="arrow-right"
      />
    </nav>
  {/snippet}
</PaginatedTable>
