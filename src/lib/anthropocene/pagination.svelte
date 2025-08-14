<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import FilterSelect from '$lib/anthropocene/select/filter-select.svelte';
  import Skeleton from '$lib/anthropocene/skeleton/index.svelte';
  import {
    defaultItemsPerPage,
    MAX_PAGE_SIZE,
    options,
    pagination,
    perPageFromSearchParameter,
    perPageKey,
  } from '$lib/stores/pagination';
  import { getFloatStyle } from '$lib/utilities/get-float-style';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  type T = $$Generic;
  interface Props extends HTMLAttributes<HTMLDivElement> {
    items: T[];
    floatId?: string | undefined;
    startingIndex?: string | number;
    currentPageKey?: string;
    itemsPerPage?: number | null;
    updating?: boolean;
    pageSizeSelectLabel: string;
    previousButtonLabel: string;
    nextButtonLabel: string;
    'action-top-left'?: Snippet;
    'action-top-center'?: Snippet;
    'pagination-top'?: Snippet;
    'action-top-right'?: Snippet;
    children?: Snippet<
      [
        {
          visibleItems: T[];
          initialItem: T | undefined;
          activeRowIndex: number;
          setActiveRowIndex: (index: number) => void;
        },
      ]
    >;
    'action-bottom-left'?: Snippet;
    'action-bottom-right'?: Snippet;
  }

  let {
    items,
    floatId = undefined,
    startingIndex = 0,
    currentPageKey = 'page',
    itemsPerPage = null,
    updating = false,
    pageSizeSelectLabel,
    previousButtonLabel,
    nextButtonLabel,
    'action-top-left': actionTopLeft,
    'action-top-center': actionTopCenter,
    'pagination-top': paginationTop,
    'action-top-right': actionTopRight,
    children,
    'action-bottom-left': actionBottomLeft,
    'action-bottom-right': actionBottomRight,
    ...restProps
  }: Props = $props();

  const perPage = $derived(
    itemsPerPage !== null
      ? String(itemsPerPage)
      : String(
          perPageFromSearchParameter($page.url.searchParams.get(perPageKey)),
        ).toString(),
  );

  $effect(() => {
    if (parseInt(perPage, 10) > parseInt(MAX_PAGE_SIZE, 10)) {
      updateQueryParameters({
        parameter: perPageKey,
        value: MAX_PAGE_SIZE,
        url: $page.url,
      });
    } else if (!options.includes(perPage)) {
      updateQueryParameters({
        parameter: perPageKey,
        value: defaultItemsPerPage,
        url: $page.url,
      });
    }
  });

  const store = $derived(pagination(items, perPage, startingIndex));
  const currentPage = $derived(
    $page.url.searchParams.get(currentPageKey) ?? $store.currentPage,
  );

  $effect(() => {
    store.jumpToPage(currentPage);
  });

  let screenWidth = $state(0);
  let width = $state<number | undefined>();
  let height = $state<number | undefined>();

  onMount(() => {
    updateWidth();

    if (Number(startingIndex) > 0) {
      handlePageChange();
    }
  });

  const handlePageChange = () => {
    updateQueryParameters({
      parameter: currentPageKey,
      value: $store.currentPage,
      url: $page.url,
    });
  };

  const updateWidth = () => {
    if (floatId) {
      width = document.getElementById(floatId)?.clientWidth;
    }
  };

  const floatStyle = $derived(getFloatStyle({ width, height, screenWidth }));

  async function handleKeydown(event: KeyboardEvent) {
    switch (event.code) {
      case 'ArrowRight':
      case 'KeyL':
        if ($store.hasNext && !event.metaKey) {
          store.next();
          handlePageChange();
        }
        break;
      case 'ArrowLeft':
      case 'KeyH':
        if ($store.hasPrevious && !event.metaKey) {
          store.previous();
          handlePageChange();
        }
        break;
      case 'ArrowUp':
      case 'KeyK':
        store.previousRow();
        break;
      case 'ArrowDown':
      case 'KeyJ':
        store.nextRow();
        break;
      default:
        break;
    }
  }
</script>

<svelte:window
  bind:innerWidth={screenWidth}
  onresize={updateWidth}
  onkeydown={handleKeydown}
/>

<div class="pagination relative mb-8 flex flex-col gap-4">
  <div
    class="flex flex-col items-center justify-between gap-2 md:flex-row md:items-start"
  >
    <div class="w-full">
      {#if actionTopLeft}{@render actionTopLeft()}{/if}
    </div>
    <nav
      style={floatStyle}
      bind:clientHeight={height}
      class="flex min-w-fit flex-col items-end gap-4 md:flex-row"
      aria-label="{restProps['aria-label']} 1"
    >
      {#if actionTopCenter}{@render actionTopCenter()}{/if}
      <div class="flex gap-4">
        {#if !itemsPerPage}
          <FilterSelect
            label={pageSizeSelectLabel}
            parameter={perPageKey}
            value={perPage}
            {options}
            position="top"
          />
        {/if}
        {#if paginationTop}
          {@render paginationTop()}
        {:else}
          <div class="flex items-center justify-center gap-3">
            <button
              class="caret"
              disabled={!$store.hasPrevious}
              onclick={() => {
                store.previous();
                handlePageChange();
              }}
              aria-label={previousButtonLabel}
            >
              <span class="arrow arrow-left"></span>
            </button>
            <p>
              {#if updating}
                <Skeleton class="block h-5 w-24" />
              {:else}
                {$store.length
                  ? $store.startingIndex + 1
                  : 0}–{$store.endingIndex + 1} of {$store.length}
              {/if}
            </p>
            <button
              class="caret"
              disabled={!$store.hasNext}
              onclick={() => {
                store.next();
                handlePageChange();
              }}
              aria-label={nextButtonLabel}
            >
              <span class="arrow arrow-right"></span>
            </button>
          </div>
        {/if}
      </div>
      {#if actionTopRight}{@render actionTopRight()}{/if}
    </nav>
  </div>
  {#if children}
    {@render children({
      visibleItems: $store.items,
      initialItem: $store.initialItem,
      activeRowIndex: $store.activeRowIndex,
      setActiveRowIndex: store.setActiveRowIndex,
    })}
  {/if}
  <nav
    class={`flex ${actionBottomLeft ? 'justify-between' : 'justify-end'}`}
    aria-label="{restProps['aria-label']} 2"
  >
    {#if actionBottomLeft}{@render actionBottomLeft()}{/if}
    <div class="flex gap-4">
      {#if !itemsPerPage}
        <FilterSelect
          label={pageSizeSelectLabel}
          parameter={perPageKey}
          value={perPage}
          {options}
          position="bottom"
        />
      {/if}
      <div class="flex items-center justify-center gap-3">
        <button
          class="caret"
          disabled={!$store.hasPrevious}
          onclick={() => {
            store.previous();
            handlePageChange();
          }}
          aria-label={previousButtonLabel}
        >
          <span class="arrow arrow-left"></span>
        </button>
        <p>
          {#if updating}
            <Skeleton class="block h-5 w-24" />
          {:else}
            {$store.length ? $store.startingIndex + 1 : 0}–{$store.endingIndex +
              1} of {$store.length}
          {/if}
        </p>
        <button
          class="caret"
          disabled={!$store.hasNext}
          onclick={() => {
            store.next();
            handlePageChange();
          }}
          aria-label={nextButtonLabel}
        >
          <span class="arrow arrow-right"></span>
        </button>
      </div>
      {#if actionBottomRight}{@render actionBottomRight()}{/if}
    </div>
  </nav>
</div>

<style lang="postcss">
  .caret {
    @apply relative;

    width: 12px;
    height: 12px;
  }

  .caret:disabled {
    @apply cursor-not-allowed opacity-50;
  }

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
</style>
