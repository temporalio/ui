<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  import { page } from '$app/stores';

  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
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

  interface Props {
    items: T[];
    floatId?: string | undefined;
    startingIndex?: string | number;
    currentPageKey?: string;
    itemsPerPage?: number | null;
    updating?: boolean;
    pageSizeSelectLabel: string;
    previousButtonLabel: string;
    nextButtonLabel: string;
    pagination_top?: Snippet;
    action_top_right?: Snippet;
    action_top_left?: Snippet;
    action_top_center?: Snippet;
    action_bottom_left?: Snippet;
    action_bottom_right?: Snippet;
    children: Snippet<
      [
        {
          visibleItems: T[];
          initialItem: T;
          activeRowIndex: number;
          setActiveRowIndex: (index: number | undefined) => void;
        },
      ]
    >;
  }

  let {
    items,
    floatId,
    startingIndex = 0,
    currentPageKey = 'page',
    itemsPerPage = null,
    updating = false,
    pageSizeSelectLabel,
    previousButtonLabel,
    nextButtonLabel,
    pagination_top,
    action_top_right,
    action_top_left,
    action_top_center,
    action_bottom_left,
    action_bottom_right,
    children,
    ...rest
  }: Props = $props();

  let perPage = $derived(
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

  let store = $derived(pagination(items, perPage, startingIndex));
  let currentPage = $derived(
    $page.url.searchParams.get(currentPageKey) ?? $store.currentPage,
  );

  $effect(() => {
    store.jumpToPage(currentPage);
  });

  let screenWidth: number = $state();
  let width: number | undefined = $state();
  let height: number | undefined = $state();

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

  let floatStyle = $derived(getFloatStyle({ width, height, screenWidth }));

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
      {@render action_top_left?.()}
    </div>
    <nav
      style={floatStyle}
      bind:clientHeight={height}
      class="flex min-w-fit flex-col items-end gap-4 md:flex-row"
      aria-label="{rest['aria-label']} 1"
    >
      {@render action_top_center?.()}
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
        {#if pagination_top}
          {@render pagination_top()}
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
      {@render action_top_right?.()}
    </nav>
  </div>

  {@render children?.({
    visibleItems: $store.items,
    initialItem: $store.initialItem,
    activeRowIndex: $store.activeRowIndex,
    setActiveRowIndex: store.setActiveRowIndex,
  })}
  <nav
    class={`flex ${action_bottom_left ? 'justify-between' : 'justify-end'}`}
    aria-label="{rest['aria-label']} 2"
  >
    {@render action_bottom_left?.()}
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
      {@render action_bottom_right?.()}
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
