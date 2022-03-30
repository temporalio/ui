<script lang="ts">
  import Icon from 'svelte-fa';
  import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

  import { pagination, perPageOptions } from '$lib/stores/pagination';

  import FilterSelect from './select/filter-select.svelte';

  type T = $$Generic;

  export let key = 'per-page';
  export let perPage: string;
  export let items: T[];
  export let startingIndex: string | number = null;

  $: store = pagination(items, perPage);
</script>

<nav class="flex justify-end gap-8">
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

<style lang="postcss">
  .caret {
    @apply text-gray-500;
  }

  .caret:disabled {
    @apply text-gray-300 cursor-not-allowed;
  }
</style>
