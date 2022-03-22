<script lang="ts">
  import Icon from 'svelte-fa';
  import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

  import { page } from '$app/stores';
  import { pagination } from '$lib/stores/pagination';

  import FilterSelect from './select/filter-select.svelte';

  type T = $$Generic<unknown>;

  export let key: string = null;
  export let options = ['25', '50', '100'];
  export let items: T[];

  const queryKey = key || 'per-page';

  $: perPage = $page.url.searchParams.get(queryKey);

  let store = pagination(items, perPage);

  $: {
    store.adjustPageSize(perPage);
  }

  $: {
    if (!options.includes(perPage.toString())) {
      options = [perPage.toString(), ...options];
    }
  }
</script>

<div class="flex flex-col gap-4">
  <nav class="flex justify-end gap-8">
    <div class="flex gap-2 items-center justify-center">
      <p class="w-fit text-right">Per Page</p>
      <FilterSelect
        label="Per Page"
        parameter={queryKey}
        value={perPage}
        {options}
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
        {$store.startingIndex + 1}–{$store.endingIndex} of {$store.length}
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
