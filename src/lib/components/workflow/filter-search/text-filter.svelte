<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';

  import { getContext } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';

  type T = $$Generic;

  const { filter, handleSubmit } = getContext<FilterContext<T>>(FILTER_CONTEXT);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && $filter.value !== '') {
      e.preventDefault();
      handleSubmit();
    }
  }
</script>

<Input
  id="text-filter-search"
  type="search"
  placeholder={`Enter ${$filter.attribute}`}
  icon="search"
  class="w-full"
  unroundLeft
  bind:value={$filter.value}
  on:keydown={handleKeydown}
/>
