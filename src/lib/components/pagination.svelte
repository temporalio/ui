<script lang="ts">
  import Icon from 'svelte-fa';
  import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

  import { page } from '$app/stores';

  import FilterSelect from './select/filter-select.svelte';

  type T = $$Generic<Array>;

  export let key: string = null;
  export let options = ['25', '50', '100'];
  export let items: T;

  const queryKey = key || 'per-page';

  let pageNumber = 1;
  let visibleItems: T = items.slice(0, 0);

  $: queryKeyValue = $page.url.searchParams.get(queryKey);
  $: perPage = queryKeyValue || '25';
  $: pageRange = !isNaN(Number(perPage)) ? Math.abs(Number(perPage)) : 25;

  $: previousEnabled = pageNumber > 1;
  $: nextEnabled = pageNumber * pageRange < items.length;

  $: startingIndex = pageRange * (pageNumber - 1);
  $: endingIndex = Math.min(startingIndex + pageRange, items.length);

  $: {
    visibleItems = items.slice(startingIndex, endingIndex);
  }

  $: {
    if (!options.includes(pageRange.toString())) {
      options = [pageRange.toString(), ...options];
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
        value={String(pageRange)}
        {options}
      />
    </div>
    <div class="flex gap-6 items-center justify-center">
      <button
        class="caret"
        disabled={!previousEnabled}
        on:click={() => pageNumber--}
      >
        <Icon icon={faAngleLeft} />
      </button>
      <p>{startingIndex + 1}–{endingIndex} of {items.length}</p>
      <button
        class="caret"
        disabled={!nextEnabled}
        on:click={() => pageNumber++}
      >
        <Icon icon={faAngleRight} />
      </button>
    </div>
  </nav>
  <slot {visibleItems} />
</div>

<style lang="postcss">
  .caret {
    @apply text-gray-500;
  }

  .caret:disabled {
    @apply text-gray-300 cursor-not-allowed;
  }
</style>
