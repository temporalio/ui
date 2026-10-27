<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type {
    PaginationPageChangeDetails,
    PaginationPageSizeChangeDetails,
    PaginationPageUrlDetails,
  } from '@ark-ui/svelte/pagination';

  export type PaginationVariant = 'full' | 'compact';

  export interface PaginationSummaryDetails {
    start: number;
    end: number;
    count: number;
  }

  export interface PaginationTranslations {
    prevTriggerLabel?: string;
    nextTriggerLabel?: string;
    itemLabel?: (details: { page: number; totalPages: number }) => string;
  }

  export interface PaginationProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'class' | 'children' | 'id' | 'dir'
  > {
    count: number;
    page?: number;
    pageSize?: number;
    siblingCount?: number;
    boundaryCount?: number;
    variant?: PaginationVariant;
    type?: 'button' | 'link';
    getPageUrl?: (details: PaginationPageUrlDetails) => string;
    label?: string;
    showSummary?: boolean;
    formatSummary?: (details: PaginationSummaryDetails) => string;
    pageSizeOptions?: number[];
    pageSizeLabel?: string;
    translations?: PaginationTranslations;
    onPageChange?: (details: PaginationPageChangeDetails) => void;
    onPageSizeChange?: (details: PaginationPageSizeChangeDetails) => void;
    id?: string;
    class?: string;
  }
</script>

<script lang="ts">
  import { Pagination as ArkPagination } from '@ark-ui/svelte/pagination';

  import { IconChevronLeft, IconChevronRight } from '$lib/io/icon';

  import {
    paginationEllipsisRecipe,
    paginationItemRecipe,
    paginationListRecipe,
    paginationPageSizeRecipe,
    paginationPageSizeSelectRecipe,
    paginationRecipe,
    paginationSummaryRecipe,
    paginationTriggerRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    count,
    page = $bindable(1),
    pageSize = $bindable(25),
    siblingCount = 1,
    boundaryCount = 1,
    variant = 'full',
    type = 'button',
    getPageUrl,
    label = 'Pagination',
    showSummary = true,
    formatSummary = ({ start, end, count }) =>
      count === 0 ? '0 results' : `${start}–${end} of ${count}`,
    pageSizeOptions,
    pageSizeLabel = 'Per page',
    translations,
    onPageChange,
    onPageSizeChange,
    id = generatedId,
    class: className,
    ...rest
  }: PaginationProps = $props();

  const pageSizeId = $derived(`${id}-page-size`);
  const start = $derived(count === 0 ? 0 : (page - 1) * pageSize + 1);
  const end = $derived(Math.min(page * pageSize, count));
  const summary = $derived(formatSummary({ start, end, count }));
  const element = $derived(type === 'link' ? 'a' : 'button');

  function handlePageChange(details: PaginationPageChangeDetails) {
    if (details.page === page) return;
    page = details.page;
    onPageChange?.(details);
  }

  function handlePageSizeChange(details: PaginationPageSizeChangeDetails) {
    if (details.pageSize === pageSize) return;
    pageSize = details.pageSize;
    page = 1;
    onPageSizeChange?.(details);
  }
</script>

<ArkPagination.Root
  {id}
  {count}
  {page}
  {pageSize}
  {siblingCount}
  {boundaryCount}
  {type}
  {getPageUrl}
  translations={{ rootLabel: label, ...translations }}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  class={paginationRecipe(className)}
  {...rest}
>
  {#if showSummary}
    <p class={paginationSummaryRecipe()} aria-live="polite">{summary}</p>
  {/if}
  <div class="flex flex-wrap items-center gap-3">
    {#if pageSizeOptions?.length}
      <ArkPagination.Context>
        {#snippet render(pagination)}
          <div class={paginationPageSizeRecipe()}>
            <label for={pageSizeId}>{pageSizeLabel}</label>
            <select
              id={pageSizeId}
              class={paginationPageSizeSelectRecipe()}
              value={pageSize}
              onchange={(event) =>
                pagination().setPageSize(Number(event.currentTarget.value))}
            >
              {#each pageSizeOptions as option (option)}
                <option value={option}>{option}</option>
              {/each}
            </select>
          </div>
        {/snippet}
      </ArkPagination.Context>
    {/if}
    <div class={paginationListRecipe()}>
      <ArkPagination.PrevTrigger>
        {#snippet asChild(props)}
          <svelte:element
            this={element}
            {...props()}
            class={paginationTriggerRecipe()}
          >
            <IconChevronLeft width={16} height={16} />
          </svelte:element>
        {/snippet}
      </ArkPagination.PrevTrigger>
      {#if variant === 'full'}
        <ArkPagination.Context>
          {#snippet render(pagination)}
            {#each pagination().pages as item, index (item.type === 'page' ? `page-${item.value}` : `ellipsis-${index}`)}
              {#if item.type === 'page'}
                <ArkPagination.Item {...item}>
                  {#snippet asChild(props)}
                    <svelte:element
                      this={element}
                      {...props()}
                      class={paginationItemRecipe()}
                      >{item.value}</svelte:element
                    >
                  {/snippet}
                </ArkPagination.Item>
              {:else}
                <ArkPagination.Ellipsis
                  {index}
                  class={paginationEllipsisRecipe()}
                  >&#8230;</ArkPagination.Ellipsis
                >
              {/if}
            {/each}
          {/snippet}
        </ArkPagination.Context>
      {/if}
      <ArkPagination.NextTrigger>
        {#snippet asChild(props)}
          <svelte:element
            this={element}
            {...props()}
            class={paginationTriggerRecipe()}
          >
            <IconChevronRight width={16} height={16} />
          </svelte:element>
        {/snippet}
      </ArkPagination.NextTrigger>
    </div>
  </div>
</ArkPagination.Root>
