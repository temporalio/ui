<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import {
    pagination,
    perPageFromSearchParameter,
    perPageOptions,
  } from '$lib/stores/pagination';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import { getFloatStyle } from '$lib/utilities/get-float-style';
  import Icon from '$holocene/icon/icon.svelte';

  type T = $$Generic;

  export let items: T[];
  export let floatId: string | undefined = undefined;
  export let startingIndex: string | number = 0;
  export let updating = false;
  const perPageKey = 'per-page';
  const currentPageKey = 'page';

  $: perPage = String(
    perPageFromSearchParameter($page.url.searchParams.get(perPageKey)),
  ).toString();
  $: store = pagination(items, perPage, startingIndex);
  $: currentPage =
    $page.url.searchParams.get(currentPageKey) ?? $store.currentPage;
  $: store.jumpToPage(currentPage);

  let screenWidth: number;
  let width: number | undefined;
  let height: number | undefined;

  onMount(() => {
    if (floatId) {
      width = document.getElementById(floatId)?.clientWidth;
    }
  });

  const handlePageChange = () => {
    updateQueryParameters({
      parameter: currentPageKey,
      value: $store.currentPage,
      url: $page.url,
    });
  };

  $: floatStyle = getFloatStyle({ width, height, screenWidth });
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="pagination relative mb-8 flex flex-col gap-4">
  <div
    class={`flex items-center ${
      updating || $$slots['action-top-left'] ? 'justify-between' : 'justify-end'
    }`}
  >
    {#if updating}
      <p class="mr-6 text-gray-600">Updating…</p>
    {:else}
      <slot name="action-top-left" />
    {/if}
    <nav
      style={floatStyle}
      bind:clientHeight={height}
      class="flex justify-end gap-8"
    >
      <div class="flex items-center justify-center gap-2">
        <p class="w-fit text-right">Per Page</p>
        <FilterSelect
          label="Per Page"
          parameter={perPageKey}
          value={perPage}
          options={perPageOptions(perPage)}
        />
      </div>
      <div class="flex items-center justify-center gap-6">
        <button
          class="caret"
          disabled={!$store.hasPrevious}
          on:click={() => {
            store.previous();
            handlePageChange();
          }}
        >
          <Icon name="chevron-left" />
        </button>
        <p>
          {$store.startingIndex + 1}–{$store.endingIndex + 1} of {$store.length}
        </p>
        <button
          class="caret"
          disabled={!$store.hasNext}
          on:click={() => {
            store.next();
            handlePageChange();
          }}
        >
          <Icon name="chevron-right" />
        </button>
      </div>
      <slot name="action-top-right" />
    </nav>
  </div>
  <slot visibleItems={$store.items} initialItem={$store.initialItem} />
  <nav
    class={`flex ${
      $$slots['action-bottom-left'] ? 'justify-between' : 'justify-end'
    }`}
  >
    <slot name="action-bottom-left" />
    <div class="flex gap-8">
      <div class="flex items-center justify-center gap-2">
        <p class="w-fit text-right">Per Page</p>
        <FilterSelect
          label="Per Page"
          parameter={perPageKey}
          value={String(perPage)}
          options={perPageOptions(perPage)}
        />
      </div>
      <div class="flex items-center justify-center gap-6">
        <button
          class="caret"
          disabled={!$store.hasPrevious}
          on:click={() => store.previous()}
        >
          <Icon name="chevron-left" />
        </button>
        <p>
          {$store.startingIndex + 1}–{$store.endingIndex + 1} of {$store.length}
        </p>
        <button
          class="caret"
          disabled={!$store.hasNext}
          on:click={() => store.next()}
        >
          <Icon name="chevron-right" />
        </button>
      </div>
      <slot name="action-bottom-right" />
    </div>
  </nav>
</div>

<style lang="postcss">
  .caret {
    @apply text-gray-500;
  }

  .caret:disabled {
    @apply cursor-not-allowed text-gray-300;
  }
</style>
