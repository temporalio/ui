<script module lang="ts">
  // The use of any below is actually completley fine. We're constraining the generics to a specific type
  // of it needs to be a function call with parameters and it needs to return a promise with any type inside
  // We have to use TotallyNotAny because eslint is very annoying and won't let me disable it in the generics field
  // huzzah
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type TotallyNotAny = any;
</script>

<script
  lang="ts"
  generics="TFunc extends (...args: TotallyNotAny[]) => Promise<TotallyNotAny>, TResponse extends Awaited<ReturnType<TFunc>>, TItemsKey extends keyof TResponse, TNextPageKey extends keyof TResponse, TSizeKey extends keyof Parameters<TFunc>[0], TPageTokenKey extends keyof Parameters<TFunc>[0], TItem = TResponse[TItemsKey] extends readonly (infer U)[] ? U : never, TTransformed = TItem"
>
  import type { Snippet } from 'svelte';

  import {
    ApiPagination,
    type ApiPaginationConfig,
    identity,
  } from './api-pagination-class.svelte';

  type Props = ApiPaginationConfig<
    TFunc,
    TResponse,
    TItemsKey,
    TNextPageKey,
    TSizeKey,
    TPageTokenKey,
    TItem,
    TTransformed
  > & {
    children: Snippet<[TTransformed[]]>;
    controls?: Snippet<
      [
        {
          nextPage: () => Promise<void>;
          previousPage: () => void;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          indexStart: number;
          indexEnd: number;
          total?: string | number;
          loading: boolean;
          updating: boolean;
        },
      ]
    >;
  };

  let {
    onFetch,
    itemsKeyname,
    nextPageKeyname,
    sizeKeyname,
    pageTokenKeyname,
    pageSizeOptions = [10, 25, 50, 100],
    defaultPageSize = 25,
    total,
    transformFunction = identity as (item: TItem) => TTransformed,
    onError,
    initialFetchParams,
    children,
    controls,
  }: Props = $props();

  const pagination = new ApiPagination({
    onFetch,
    itemsKeyname,
    nextPageKeyname,
    sizeKeyname,
    pageTokenKeyname,
    pageSizeOptions,
    defaultPageSize,
    total,
    transformFunction,
    onError,
    initialFetchParams,
  });

  const handleNextPage = () => pagination.nextPage();
  const handlePreviousPage = () => pagination.previousPage();
</script>

{@render children(pagination.currentItems)}

{#if controls}
  {@render controls({
    nextPage: handleNextPage,
    previousPage: handlePreviousPage,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage,
    indexStart: pagination.indexStart,
    indexEnd: pagination.indexEnd,
    total,
    loading: pagination.loading,
    updating: pagination.updating,
  })}
{:else}
  <div class="flex items-center justify-center gap-3">
    <button
      class="caret"
      disabled={!pagination.hasPreviousPage}
      onclick={handlePreviousPage}
      aria-label="Previous page"
    >
      <span class="arrow arrow-left"></span>
    </button>
    <div class="flex gap-1">
      <p>
        {pagination.indexStart}–{pagination.indexEnd}
      </p>
      {#if total}
        <p>
          of {total}
        </p>
      {/if}
    </div>
    <button
      class="caret"
      disabled={!pagination.hasNextPage || pagination.updating}
      onclick={handleNextPage}
      aria-label="Next page"
    >
      <span class="arrow arrow-right"></span>
    </button>
  </div>
{/if}

<style lang="postcss">
  .arrow {
    @apply absolute left-0 top-0 h-0 w-0;

    border-style: solid;
    border-width: 6px 12px 6px 0;
  }

  .arrow-left {
    border-width: 6px 12px 6px 0;

    @apply border-b-transparent border-l-transparent border-r-primary border-t-transparent;
  }

  .arrow-right {
    border-width: 6px 0 6px 12px;

    @apply border-b-transparent border-l-primary border-r-transparent border-t-transparent;
  }

  .caret {
    @apply relative;

    width: 12px;
    height: 12px;
  }

  .caret:disabled {
    @apply cursor-not-allowed opacity-50;
  }
</style>
