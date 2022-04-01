<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { pagination, perPageOptions } from '$lib/stores/pagination';

  import Icon from 'svelte-fa';
  import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

  export let key = 'per-page';
  export let items: T[];
  export let floatId: string | undefined = undefined;

  import FilterSelect from './select/filter-select.svelte';

  export let startingIndex: string | number = -1;

  $: perPage = $page.url.searchParams.get(key) || '100';
  $: store = pagination(items, perPage);
  $: store.adjustPageSize(perPage);
  $: store.jumpToIndex(startingIndex);

  let screenWidth: number;
  let floatWidth: number | undefined;
  let navHeight: number | undefined;

  onMount(() => {
    if (floatId) {
      floatWidth = document.getElementById(floatId)?.clientWidth;
      navHeight = document.getElementById('pagination-nav')?.clientHeight;
    }
  });

  // If float width and nav height exist and screen is above lg breakpoint, float the nav
  $: floatStyle =
    floatWidth && navHeight && screenWidth > 1024
      ? `position: absolute; right: ${floatWidth + 40}px; top: -${
          navHeight + 14
        }px`
      : '';
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="pagination flex flex-col gap-4 relative mb-8">
  <nav style={floatStyle} id="pagination-nav" class="flex justify-end gap-8">
    <div class="flex gap-2 items-center justify-center">
      <p class="w-fit text-right">Per Page</p>
      <FilterSelect
        label="Per Page"
        parameter={key}
        value={perPage}
        options={perPageOptions(perPage)}
      />
    </div>
    <div class="flex gap-6 items-center justify-center">
      <button
        class="caret"
        disabled={!$store.hasPrevious}
        on:click={() => store.previous()}
      >
        <Icon icon={faAngleLeft} />
      </button>
      <p>
        {$store.startingIndex + 1}–{$store.endingIndex + 1} of {$store.length}
      </p>
      <button
        class="caret"
        disabled={!$store.hasNext}
        on:click={() => store.next()}
      >
        <Icon icon={faAngleRight} />
      </button>
    </div>
  </nav>
  <slot visibleItems={$store.items} />
</div>

<style lang="postcss">
  .caret {
    @apply text-gray-500;
  }

  .caret:disabled {
    @apply text-gray-300 cursor-not-allowed;
  }
</style>
