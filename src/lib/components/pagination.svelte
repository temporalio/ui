<script lang="ts">
  import { page } from '$app/stores';
  import { pagination, perPageOptions } from '$lib/stores/pagination';

  import Icon from 'svelte-fa';
  import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

  export let key = 'per-page';
  export let items: T[];
  export let float: boolean = false;

  import FilterSelect from './select/filter-select.svelte';

  export let startingIndex: string | number | null = null;

  $: perPage = $page.url.searchParams.get(key) || '100';
  $: store = pagination(items, perPage);
  $: store.adjustPageSize(perPage);
  $: store.jumpToIndex(startingIndex);
</script>

<div class="pagination flex flex-col gap-4 relative">
  <nav class="pagination-nav flex justify-end gap-8" class:float>
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
  .float {
    @apply absolute;
    top: -54px;
    right: 440px;
  }
  .caret {
    @apply text-gray-500;
  }

  .caret:disabled {
    @apply text-gray-300 cursor-not-allowed;
  }
</style>
